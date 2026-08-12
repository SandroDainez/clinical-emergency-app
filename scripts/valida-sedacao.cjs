/**
 * Sedoanalgesia & BNM: a bolsa fecha, e os dois eixos não se confundem.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ───────────────────────────────────
 *
 * 1. O atracúrio anunciava "5 amp (250 mg) + 200 mL SF → 250 mL · 1 mg/mL".
 *    5 × 5 mL + 200 = 225 mL, não 250, e a concentração real era 1,11 mg/mL.
 *    Única das 20 soluções do módulo cuja aritmética não fechava — e só apareceu
 *    porque as 20 foram conferidas uma a uma.
 *
 * 2. O midazolam marcava de VERMELHO tudo acima de 0,20 mg/kg/h. O módulo de
 *    Convulsões manda 0,05–2 mg/kg/h no status refratário — dez vezes isso, e
 *    está certo. São OBJETIVOS diferentes: sedação titulada por RASS (meta de
 *    paciente acordado) × anestesia terapêutica com EEG (meta de supressão).
 *    Sem declarar os dois eixos, o app pintava de vermelho a dose correta.
 *
 * 3. O cisatracúrio dizia faixa 0,1–0,2 mg/kg/h e, no mesmo fármaco, citava o
 *    ACURASYS com 37,5 mg/h — ~0,54 mg/kg/h em 70 kg, quase 3× o topo da
 *    própria faixa. Infusão titulada por TOF e protocolo de dose fixa
 *    apresentados como a mesma coisa.
 *
 * Este script FALHA O BUILD.
 *
 * ── ESCRITO COM A LISTA DO R-15 ──────────────────────────────────────────────
 *
 * Comentários removidos antes de conferir conteúdo (os comentários acima citam
 * os números proibidos); toda leitura que pode não encontrar FALHA em vez de
 * seguir; e o que se compara é a ARITMÉTICA, não a grafia do rótulo.
 */

const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const bruto = fs.readFileSync(path.join(appDir, "sedation-engine.ts"), "utf8");
// R-15 item 1: comentários fora antes de conferir conteúdo.
const src = bruto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

function numero(x) {
  return Number(String(x).replace(/\./g, "").replace(",", "."));
}

// ── A. TODA solução padrão fecha a aritmética ───────────────────────────────
//
// conc = (ampolas × base) ÷ (diluente + ampolas × volume_da_ampola)
// O rótulo anuncia concentração e volume final; os dois são conferidos.
const drogas = [
  ...src.matchAll(/key: "(\w+)",\s*\n\s*group: "(\w+)",\s*\n\s*name: "([^"]+)",([\s\S]*?)(?=\n  \{\n    key: "|\n\];)/g),
];
if (drogas.length < 9) {
  falhas.push(`a leitura achou só ${drogas.length} droga(s) — o formato mudou e a conferência cegou (são 9).`);
} else ok++;

let solucoes = 0;
for (const [, key, , nome, corpo] of drogas) {
  const apres = {};
  for (const a of corpo.matchAll(/\{ id: "([^"]+)", label: "[^"]*", ampouleVolumeMl: (\d+), basePerAmpoule: (\d+)/g)) {
    apres[a[1]] = { vol: Number(a[2]), base: Number(a[3]) };
  }
  for (const sol of corpo.matchAll(
    /label: "([^"]+)", presentationId: "([^"]+)", ampoules: "(\d+)", diluentMl: "(\d+)"/g
  )) {
    const [, rotulo, pid, ampStr, dilStr] = sol;
    solucoes++;
    const p = apres[pid];
    if (!p) {
      falhas.push(`${nome} · "${rotulo}" aponta para apresentação "${pid}" que não existe.`);
      continue;
    }
    const amp = Number(ampStr);
    const dil = Number(dilStr);
    const volume = dil + amp * p.vol;
    const concMcg = (amp * p.base) / volume;

    const mc = rotulo.match(/([\d.,]+)\s*(mcg\/mL|mg\/mL)/);
    const mv = rotulo.match(/→\s*([\d.,]+)\s*mL/);
    if (!mc || !mv) {
      // R-15 item 2: não encontrou = falha, nunca `continue` silencioso.
      falhas.push(
        `${nome} · "${rotulo}": o rótulo não anuncia concentração e volume final de forma legível — ` +
        `sem isso a bolsa não pode ser conferida.`
      );
      continue;
    }
    const concAnunciada = numero(mc[1]);
    const concCalculada = mc[2] === "mg/mL" ? concMcg / 1000 : concMcg;
    const volAnunciado = numero(mv[1]);

    if (Math.abs(concAnunciada - concCalculada) > 1e-6) {
      falhas.push(
        `${nome} · "${rotulo}": rótulo anuncia ${concAnunciada} ${mc[2]}, o preparo produz ` +
        `${Math.round(concCalculada * 10000) / 10000} — a bolsa não é a que o rótulo descreve.`
      );
    } else ok++;

    if (Math.abs(volAnunciado - volume) > 1e-9) {
      falhas.push(
        `${nome} · "${rotulo}": rótulo anuncia ${volAnunciado} mL finais, o preparo produz ${volume} mL. ` +
        `O volume da ampola conta no volume final.`
      );
    } else ok++;
  }
}
if (solucoes < 20) {
  falhas.push(`só ${solucoes} solução(ões) conferida(s) — a varredura provavelmente parou de enxergar (são 20).`);
} else ok++;

// ── B. Midazolam: os DOIS eixos declarados ──────────────────────────────────
{
  const bloco = src.match(/key: "midazolam"[\s\S]*?(?=\n  \{\n    key: ")/);
  if (!bloco) {
    falhas.push("bloco do midazolam não encontrado — a conferência dos dois eixos não rodou.");
  } else {
    const vermelho = bloco[0].match(/tone: "red"[^}]*indication: "([^"]*)"/);
    if (!vermelho) {
      falhas.push("midazolam: faixa vermelha não encontrada — o formato mudou.");
    } else {
      if (!/status epil[ée]ptico refrat[áa]rio/i.test(vermelho[1])) {
        falhas.push(
          "midazolam: a faixa vermelha não declara a exceção do STATUS EPILÉPTICO REFRATÁRIO. " +
          "O teto de 0,20 existe para desencorajar sedação profunda desnecessária — razão que não " +
          "se aplica quando a supressão da atividade elétrica É o objetivo. Convulsões manda 0,05–2 mg/kg/h."
        );
      } else ok++;
      if (!/EEG/i.test(vermelho[1])) {
        falhas.push("midazolam: a exceção do status não cita a titulação por EEG — é o que a separa de sedação.");
      } else ok++;
      if (!/2 mg\/kg\/h/.test(vermelho[1])) {
        falhas.push("midazolam: a exceção do status perdeu o teto de 2 mg/kg/h que o módulo de Convulsões usa.");
      } else ok++;
    }
  }
}

// ── C. Cisatracúrio: dois REGIMES, e o ACURASYS com o ROSE ──────────────────
{
  const bloco = src.match(/key: "cisatracurio"[\s\S]*?(?=\n  \{\n    key: ")/);
  if (!bloco) {
    falhas.push("bloco do cisatracúrio não encontrado — a conferência dos regimes não rodou.");
  } else {
    const b = bloco[0];
    if (!/titulad[oa] por TOF/i.test(b)) {
      falhas.push("cisatracúrio: a faixa 0,1–0,2 mg/kg/h não está declarada como TITULADA POR TOF.");
    } else ok++;
    if (!/37,5 mg\/h/.test(b) || !/FIXO|dose fixa/i.test(b)) {
      falhas.push(
        "cisatracúrio: o regime do ACURASYS (37,5 mg/h de dose FIXA, sem titulação) não está declarado " +
        "como regime separado — apresentar junto da faixa titulada cria a contradição de ~2,7×."
      );
    } else ok++;
    // R-15 item 1: medir o EFEITO. "ROSE" também aparece em `reference:`, que é
    // campo bibliográfico — ele satisfazia a regra sem que o conteúdo ensinasse
    // nada. O que se cobra é o ROSE no texto que o médico lê.
    const conteudo = b.replace(/reference: "[^"]*"/g, "");
    if (!/ROSE/.test(conteudo)) {
      falhas.push("cisatracúrio: o ACURASYS aparece sem o ROSE — o app ensinaria 37,5 mg/h como conduta corrente.");
    } else ok++;
    if (!/EVIDÊNCIA CONFLITANTE|evidência conflitante/i.test(conteudo)) {
      falhas.push(
        "cisatracúrio: o par ACURASYS/ROSE não está rotulado como EVIDÊNCIA CONFLITANTE — sem isso, " +
        "o regime de dose fixa lê-se como alternativa equivalente."
      );
    } else ok++;
    // O desenho do ROSE é o que explica o resultado: sedação profunda no braço
    // bloqueado × sedação leve no controle. Sem isso vira "não funcionou".
    if (!/sedação LEVE|sedação leve/i.test(conteudo) || !/futilidade/i.test(conteudo)) {
      falhas.push(
        "cisatracúrio: o ROSE está citado sem o desenho que explica o achado (controle com sedação LEVE, " +
        "interrompido por futilidade). Citar o resultado sem o desenho é como o ART entrou invertido no D-6."
      );
    } else ok++;
  }
}

// ── D. BNM: paralisia exige sedação e analgesia, nos três ───────────────────
for (const bnm of ["rocuronio", "cisatracurio", "atracurio"]) {
  const bloco = src.match(new RegExp(`key: "${bnm}"[\\s\\S]*?(?=\\n  \\{\\n    key: "|\\n\\];)`));
  if (!bloco) {
    falhas.push(`bloco de ${bnm} não encontrado — a conferência do aviso de sedação não rodou.`);
    continue;
  }
  if (!/sedação e analgesia/i.test(bloco[0])) {
    falhas.push(
      `${bnm}: perdeu o aviso de que o bloqueio exige sedação e analgesia — o paciente paralisado e ` +
      `mal sedado está acordado, sentindo, e sem como avisar.`
    );
  } else ok++;
  if (!/TOF/.test(bloco[0])) {
    falhas.push(`${bnm}: perdeu a menção à monitorização por TOF.`);
  } else ok++;
}

console.log("\nSedoanalgesia & BNM — a bolsa fecha e os eixos não se confundem\n");
console.log(`   ${drogas.length} drogas · ${solucoes} soluções padrão conferidas\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — aritmética fechada, dois eixos declarados, BNM com sedação e TOF\n`);
}
process.exit(falhas.length ? 1 : 0);
