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
if (drogas.length < 11) {
  falhas.push(`a leitura achou só ${drogas.length} droga(s) — o formato mudou e a conferência cegou (são 11).`);
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
if (solucoes < 22) {
  falhas.push(`só ${solucoes} solução(ões) conferida(s) — a varredura provavelmente parou de enxergar (são 22).`);
} else ok++;

// ── A2. TODA apresentação declara `fonte` de bula (R-5) ─────────────────────
//
// O mesmo campo existe em vasoactive-engine, e por lá nasceu do defeito da
// dopamina — ampola norte-americana num app brasileiro, fator 8, sem nada
// denunciando. Aqui as 11 conferem; o campo existe para a próxima não entrar
// copiada de referência estrangeira.
for (const [, , , nome, corpo] of drogas) {
  const apresentacoes = [...corpo.matchAll(/\{ id: "([^"]+)", label: "([^"]*)"[\s\S]{0,400}?\}/g)];
  for (const a of apresentacoes) {
    if (!/ampouleVolumeMl/.test(a[0])) continue;
    if (!/fonte: "[^"]{20,}"/.test(a[0])) {
      falhas.push(
        `${nome} · apresentação "${a[1]}" sem \`fonte\` de bula — apresentação sem bula conferida ` +
        `é como a dopamina americana entrou no app (R-5).`
      );
    } else ok++;
  }
}

// ── A3. R-6: onde existe SEGUNDA apresentação no Brasil, a tela declara ─────
//
// Cinco fármacos deste módulo têm outra concentração circulando aqui. Duas se
// confirmaram na primeira rodada (propofol 2%, midazolam 1 mg/mL) e duas na
// segunda (dexmedetomidina 4 mcg/mL pronta, morfina 1 mg/mL — e, mais
// perigosa, Dimorf 0,1/0,2 mg/mL espinhal). O cisatracúrio 5 mg/mL NÃO se
// confirmou para o Brasil e por isso saiu da lista.
const SEGUNDA_APRESENTACAO = [
  // A CONCENTRAÇÃO, não a sigla: "Mesma ressalva do 2%" satisfazia a regra sem
  // dizer qual ressalva, e a declaração primária podia sumir sem acusar.
  ["Propofol", /20 mg\/mL/],
  ["Midazolam", /1 mg\/mL/],
  ["Dexmedetomidina", /4 mcg\/mL/],
  // Para a morfina, a segunda apresentação da MESMA via é a de 1 mg/mL. As de
  // 0,1/0,2 mg/mL são de outra VIA e não entram aqui — são cobradas em A3b,
  // que exige que sejam aviso e NÃO opção (refinamento do R-6).
  ["Morfina", /1 mg\/mL/],
];
for (const [nome, re] of SEGUNDA_APRESENTACAO) {
  const bloco = drogas.find((d) => d[3] === nome);
  if (!bloco) {
    falhas.push(`${nome} não encontrado — a conferência do R-6 não rodou para ele.`);
    continue;
  }
  const fontes = [...bloco[4].matchAll(/fonte: "([^"]*)"/g)].map((m) => m[1]).join(" ");
  if (!re.test(fontes)) {
    falhas.push(
      `${nome}: a \`fonte\` não declara a SEGUNDA apresentação que circula no Brasil. ` +
      `Uma tela que oferece uma opção não informa — afirma (R-6).`
    );
  } else ok++;
}

// ── A3b. Apresentação de OUTRA VIA é aviso, NUNCA opção (refinamento do R-6) ─
//
// A morfina tem Dimorf 0,1 e 0,2 mg/mL para uso PERIDURAL/INTRATECAL. Colocá-las
// entre as apresentações selecionáveis de um módulo que calcula infusão IV
// convidaria ao erro dos dois lados: 10 mg/mL intratecal é catastrófico,
// 0,2 mg/mL IV é subdose de 50×.
//
// Não basta estarem CITADAS: têm de estar FORA da lista de escolha. Esta trava
// confere as duas coisas.
{
  const bloco = drogas.find((d) => d[3] === "Morfina");
  if (!bloco) {
    falhas.push("Morfina não encontrada — a conferência da via peridural não rodou.");
  } else {
    const corpo = bloco[4];
    // (a) citada, com a via nomeada e o veto
    if (!/PERIDURAL|INTRATECAL/i.test(corpo)) {
      falhas.push(
        "Morfina: as apresentações de via PERIDURAL/INTRATECAL (Dimorf 0,1 e 0,2 mg/mL) não estão " +
        "nomeadas. Omiti-las deixa o erro de 50× sem aviso."
      );
    } else ok++;
    if (!/NÃO usar|não usar/.test(corpo) || !/50×|50x/.test(corpo)) {
      falhas.push("Morfina: a apresentação peridural é citada sem o VETO de uso e sem a ordem de grandeza do erro.");
    } else ok++;

    // (b) e NÃO selecionável — nem em presentations, nem em standardSolutions
    const selecionaveis = [
      ...corpo.matchAll(/\{ id: "[^"]+", label: "([^"]*)"[\s\S]{0,80}?ampouleVolumeMl/g),
      ...corpo.matchAll(/label: "([^"]+)", presentationId:/g),
    ].map((m) => m[1]);
    const espinhal = selecionaveis.filter((l) => /0,1 mg\/mL|0,2 mg\/mL/.test(l));
    if (espinhal.length) {
      falhas.push(
        `Morfina: ${espinhal.map((e) => `"${e}"`).join(", ")} está OFERECIDA como opção. ` +
        `Apresentação de outra VIA entra como aviso, nunca como escolha — oferecê-la entre as ` +
        `opções de infusão IV afirma que ela serve (refinamento do R-6).`
      );
    } else ok++;
  }
}

// ── A4. #5: a regra da indução é UMA, e vale para todos que induzem ─────────
//
// A cetamina tinha "Indução / bolus" e o propofol não tinha bólus nenhum — o
// módulo tratava dois indutores de formas diferentes sem dizer por quê. A
// escolha foi declarar indução para TODOS os que induzem.
for (const indutor of ["Propofol", "Cetamina", "Etomidato"]) {
  const bloco = drogas.find((d) => d[3] === indutor);
  if (!bloco) {
    falhas.push(`${indutor} não encontrado — a conferência da regra de indução não rodou.`);
    continue;
  }
  if (!/kind: "bolus"/.test(bloco[4])) {
    falhas.push(
      `${indutor} não declara dose de INDUÇÃO (modo bolus). A regra do módulo é uma só: ou todos os ` +
      `indutores declaram, ou nenhum declara e aponta para o ISR. Ter em uns e não em outros é a pior das três.`
    );
  } else ok++;
}

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

// ── C2. Succinilcolina: as contraindicações, uma a uma ──────────────────────
//
// É o conteúdo mais importante do fármaco — e a primeira versão desta trava não
// o cobria. Cada item aqui corresponde a um mecanismo diferente de hipercalemia
// ou de rabdomiólise; perder um não é perder redundância.
{
  const bloco = src.match(/key: "succinilcolina"[\s\S]*?(?=\n  \{\n    key: "|\n\];)/);
  if (!bloco) {
    falhas.push("bloco da succinilcolina não encontrado — a conferência das contraindicações não rodou.");
  } else {
    const CONTRA = [
      [/hipercalemia/i, "hipercalemia"],
      [/queimadura grave/i, "queimadura grave (> 24 h até 1 ano)"],
      [/imobiliza[çc][ãa]o prolongada/i, "imobilização prolongada / lesão medular"],
      [/rabdomi[óo]lise/i, "rabdomiólise / esmagamento"],
      [/distrofias? muscular/i, "distrofias musculares"],
      [/hipertermia maligna/i, "hipertermia maligna"],
      [/pseudocolinesterase|colinesterase/i, "pseudocolinesterase atípica"],
      [/organofosforado/i, "inibição adquirida da colinesterase (organofosforado)"],
    ];
    for (const [re, rotulo] of CONTRA) {
      if (!re.test(bloco[0])) {
        falhas.push(`succinilcolina: perdeu a contraindicação de ${rotulo}.`);
      } else ok++;
    }
    if (!/200 mg/.test(bloco[0])) {
      falhas.push("succinilcolina: perdeu o TETO de 200 mg.");
    } else ok++;
    if (!/SEM antídoto|sem antídoto/i.test(bloco[0])) {
      falhas.push("succinilcolina: perdeu o aviso de que não tem antídoto — é o que obriga o plano de resgate antes do bólus.");
    } else ok++;
  }
}

// ── C3. Etomidato: dose plena no instável e nunca em infusão ────────────────
{
  const bloco = src.match(/key: "etomidato"[\s\S]*?(?=\n  \{\n    key: "|\n\];)/);
  if (!bloco) {
    falhas.push("bloco do etomidato não encontrado.");
  } else {
    if (!/hemodinamicamente neutro/i.test(bloco[0])) {
      falhas.push("etomidato: perdeu a razão de existir — é o indutor hemodinamicamente neutro, e é por isso que a dose NÃO se reduz no instável.");
    } else ok++;
    if (!/infus[ãa]o cont[íi]nua/i.test(bloco[0]) || !/supress[ãa]o adrenal/i.test(bloco[0])) {
      falhas.push("etomidato: perdeu o veto à infusão contínua (supressão adrenal sustentada).");
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

// ── E. RASS: −2 a 0 é o padrão, e os módulos vizinhos concordam (#8) ────────
//
// A Sedoanalgesia já dizia "SEDAÇÃO LEVE é o padrão" (PADIS 2018), mas o RSI
// mandava RASS −2 a −3 e a Ventilação −1 a −2. Três alvos para o mesmo
// paciente. O −5 do BNM é exceção legítima e continua escrito.
{
  const VIZINHOS = ["rsi-decision-tree.ts", "ventilation-decision-tree.ts"];
  for (const rel of VIZINHOS) {
    const t = fs.readFileSync(path.join(appDir, rel), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    if (!/Alvo RASS −2 a 0/.test(t)) {
      falhas.push(
        `${rel}: o alvo de sedação não é RASS −2 a 0. PADIS 2018 recomenda sedação LEVE como padrão, ` +
        `e três alvos diferentes para o mesmo paciente é o que havia antes.`
      );
    } else ok++;
    if (/Alvo RASS −2 a −3|Alvo RASS −1 a −2/.test(t)) {
      falhas.push(`${rel}: voltou a declarar alvo de sedação mais profundo que o padrão sem indicação.`);
    } else ok++;
  }
  // O −5 do BNM é exceção legítima e NÃO pode ter sido apagado junto.
  const isr = fs.readFileSync(path.join(appDir, "rsi-decision-tree.ts"), "utf8");
  if (!/RASS −5/.test(isr)) {
    falhas.push("rsi-decision-tree: o alvo RASS −5 sob BLOQUEIO sumiu — é exceção legítima, não uniformização.");
  } else ok++;
}

// ── F. Propofol: unidade canônica é mcg/kg/min (#4) ─────────────────────────
//
// O motor calcula em mcg/kg/min; Convulsões trazia só mg/kg/h. Mesmo fármaco,
// duas unidades em módulos vizinhos, 60× entre elas.
{
  const conv = fs.readFileSync(path.join(appDir, "seizure-decision-tree.ts"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const linha = conv.split("\n").find((l) => /Propofol:/.test(l) && /infus/i.test(l));
  if (!linha) {
    falhas.push("seizure-decision-tree: linha de infusão do propofol não encontrada — a conferência da unidade não rodou.");
  } else {
    if (!/mcg\/kg\/min/.test(linha)) {
      falhas.push(
        "seizure-decision-tree: a infusão de propofol não traz a unidade canônica (mcg/kg/min), que é a " +
        "que o motor de Sedoanalgesia usa para calcular. Duas unidades para o mesmo fármaco em módulos " +
        "vizinhos são 60× de diferença sem nada avisando."
      );
    } else ok++;
    if (!/mg\/kg\/h/.test(linha)) {
      falhas.push("seizure-decision-tree: perdeu a equivalência em mg/kg/h entre parênteses.");
    } else ok++;
  }
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
