#!/usr/bin/env node
/**
 * O CATÁLOGO DE ANTIMICROBIANOS — sobreposição e buraco reprovam.
 *
 * PROMETE: que as faixas de cada fármaco cubram a reta de ClCr SEM SOBREPOSIÇÃO e
 *   SEM BURACO, de 0 ao infinito; que toda faixa declare `metodoDaTFG` e
 *   procedência (fonte + força, ou `pendente` COM a pendência escrita); que as
 *   três modalidades de diálise existam, ainda que como `sem_dados` declarado; e
 *   que os quatro estados de `ajusteRenal` sejam coerentes com as faixas.
 * NÃO PROMETE: que a dose esteja certa, nem que a fonte seja a melhor. Isso é
 *   leitura de bula, e é do médico. A trava garante que o CATÁLOGO não pode
 *   mentir por construção.
 * UNIVERSO: `lib/antimicrobianos/catalogo.ts`, compilado, com piso no retrato.
 *
 * ── ⚠️ POR QUE SOBREPOSIÇÃO E BURACO SÃO A TRAVA CENTRAL ───────────────────
 *
 * Enquanto a dose morava em ternários (`tfg > 50 ? A : tfg >= 25 ? B : …`),
 * sobreposição era invisível: o encadeamento SEMPRE devolve alguma coisa, e a
 * primeira condição verdadeira vence. Ninguém enxerga que duas faixas se cruzam
 * lendo `if`s — e um buraco simplesmente cai no `else`, com a dose errada.
 *
 * Como DADO, os dois viram impossíveis por construção: **um ClCr pertence a
 * exatamente uma faixa, ou a trava reprova.**
 *
 * ⚠️ E A FRONTEIRA É O PONTO CEGO CLÁSSICO. Um erro em `> 50` × `>= 50` muda a
 * dose EXATAMENTE no valor 50 — um único ponto da reta, que nenhum teste de
 * amostra pega e nenhuma revisão lê. Por isso a inclusividade é declarada campo a
 * campo, e conferida aqui.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "atm-"));

execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib/antimicrobianos/catalogo.ts"),
], { cwd: app, stdio: ["ignore", "ignore", "inherit"] });

// ⚠️ O `tsc` com UM arquivo só achata a saída: sem `--rootDir`, o diretório
// comum vira `lib/antimicrobianos` e o `.js` sai na RAIZ do tmp. Procurar o
// caminho longo devolve MODULE_NOT_FOUND — e isso seria lido como "o catálogo
// não existe", que é o oposto do que aconteceu.
const { CATALOGO_DE_ANTIMICROBIANOS: CAT } = require(path.join(tmp, "catalogo.js"));
fs.rmSync(tmp, { recursive: true, force: true });

const falhas = [];
const ESTADOS = ["ajusta", "nao_ajusta", "contraindicado", "sem_dados"];
const METODOS = ["cockcroft_gault", "ckd_epi", "mdrd", "sem_dados"];
const MODALIDADES = ["HD", "DP", "CRRT", "SLED"];
const TIPOS_DE_EIXO = ["indicacao", "esquema_habitual", "peso"];

if (!CAT || !CAT.length) {
  console.log("\n❌ catálogo vazio — isto é \"não consegui olhar\", não \"nenhum fármaco com problema\".\n");
  process.exit(1);
}

const confereProcedencia = (onde, p) => {
  if (!p || !p.fonte) return falhas.push(`${onde}: sem \`fonte\`.`);
  if (p.forca === "pendente" && !p.pendencia) {
    falhas.push(`${onde}: força "pendente" SEM \`pendencia\` escrita — pendência sem alvo é silêncio com etiqueta.`);
  }
  if (!p.forca) falhas.push(`${onde}: sem \`forca\`.`);
};

let linhasContinuas = 0, linhasCategoricas = 0;

for (const f of CAT) {
  if (!ESTADOS.includes(f.ajusteRenal)) {
    falhas.push(`${f.id}: \`ajusteRenal\` inválido ("${f.ajusteRenal}") — só ${ESTADOS.join(" | ")}.`);
  }
  confereProcedencia(`${f.id} · fonteDoFarmaco`, f.fonteDoFarmaco);
  confereProcedencia(`${f.id} · doseUsual`, f.doseUsual?.procedencia);
  // ⚠️ A DOSE DE ATAQUE TEM FONTE PRÓPRIA — ela não desce com o clearance e não
  // é a primeira faixa. Sem campo, ela acabaria em `doseUsual`, e a tela
  // mostraria manutenção com nome de ataque.
  for (const at of f.doseDeAtaque ?? []) {
    confereProcedencia(`${f.id} · ataque (${at.quando?.slice(0, 40)}…)`, at.procedencia);
    if (!at.quando) falhas.push(`${f.id}: dose de ataque sem \`quando\` — ataque sem gatilho é dose solta.`);
  }

  // ── ⚠️ O TIPO DE EIXO É ENUMERADO E FECHADO ─────────────────────────────
  // String livre viraria depósito: em três fármacos ninguém saberia mais o que é
  // eixo e o que é gambiarra. Tipo novo só com decisão explícita.
  if (f.eixo) {
    if (!TIPOS_DE_EIXO.includes(f.eixo.tipo)) {
      falhas.push(`${f.id}: tipo de eixo "${f.eixo.tipo}" não existe — só ${TIPOS_DE_EIXO.join(" | ")}. Tipo novo é decisão do autor.`);
    }
    // ⚠️ O EIXO CARREGA A PERGUNTA QUE O APP FAZ. Se ela morar no componente, o
    // próximo fármaco esquece de fazê-la.
    if (!f.eixo.pergunta) falhas.push(`${f.id}: eixo sem \`pergunta\` — a pergunta é do eixo, não da tela.`);
    if (!f.eixo.naoSei) falhas.push(`${f.id}: eixo sem texto de "não sei" — e sem ele a tela vira beco para quem não sabe responder.`);
    if ((f.linhas ?? []).length) falhas.push(`${f.id}: tem eixo E linhas soltas — duas fontes de verdade sobre a mesma dose.`);
  }

  if (f.ajusteRenal !== "ajusta") {
    if ((f.eixo?.valores ?? []).length) falhas.push(`${f.id}: "${f.ajusteRenal}" com eixo de entrada.`);
    if (!f.textoDoEstado?.texto) {
      falhas.push(
        `${f.id}: \`ajusteRenal\` é "${f.ajusteRenal}" e não há \`textoDoEstado\`.\n` +
        `      ⚠️ "Não requer ajuste" é CONTEÚDO: quem procura e não acha ajusta por conta e SUBDOSA.`
      );
    } else {
      confereProcedencia(`${f.id} · textoDoEstado`, f.textoDoEstado.procedencia);
    }
  }

  const conjuntos = f.eixo
    ? f.eixo.valores.map((v) => [`${f.id} [${v.id}]`, v.linhas])
    : [[f.id, f.linhas ?? []]];

  for (const [rotuloBase, todas] of conjuntos) {
    if (!todas.length) { falhas.push(`${rotuloBase}: sem linha nenhuma.`); continue; }

    // ── TODA LINHA DECLARA FONTE, MÉTODO E OU DOSE OU AUSÊNCIA ────────────
    for (const l of todas) {
      const onde = `${rotuloBase} · ${l.modalidade ?? `faixa ${l.de}–${l.ate ?? "∞"}`}`;
      confereProcedencia(onde, l.procedencia);
      if (l.doseConcreta) confereProcedencia(`${onde} · doseConcreta`, l.doseConcreta.procedencia);
      if (l.notaDeFaixa) confereProcedencia(`${onde} · notaDeFaixa`, l.notaDeFaixa.procedencia);
      if (!METODOS.includes(l.metodoDaTFG)) {
        falhas.push(`${onde}: \`metodoDaTFG\` inválido ("${l.metodoDaTFG}") — transpor equação é transpor calibração.`);
      }
      // ⚠️ OU DOSE, OU AUSÊNCIA DECLARADA. Linha muda sem as duas é silêncio.
      const temDose = Boolean(l.dose);
      if (!temDose && !l.semDados) {
        falhas.push(`${onde}: sem \`dose\` e sem \`semDados\` — linha muda é silêncio com estrutura.`);
      }
      if (temDose && !l.intervalo && !l.modalidade) {
        falhas.push(`${onde}: tem dose e não tem intervalo.`);
      }
      if (l.modalidade && !MODALIDADES.includes(l.modalidade)) {
        falhas.push(`${onde}: modalidade "${l.modalidade}" não existe — só ${MODALIDADES.join(" | ")}.`);
      }
      if (l.modalidade && (l.de !== undefined || l.ate !== undefined)) {
        falhas.push(`${onde}: linha categórica com limites de clearance — ou é faixa, ou é modalidade.`);
      }
      if (!l.modalidade && l.de === undefined) {
        falhas.push(`${onde}: linha contínua sem \`de\`.`);
      }
    }

    // ── ⚠️ AS QUATRO MODALIDADES EXISTEM, NEM QUE SEJA COMO AUSÊNCIA ──────
    // Antes da refatoração a diálise vivia fora e não herdava trava nenhuma.
    for (const m of MODALIDADES) {
      const linha = todas.find((l) => l.modalidade === m);
      if (!linha) {
        falhas.push(
          `${rotuloBase}: modalidade \`${m}\` AUSENTE.\n` +
          `      ⚠️ "sem_dados" é resposta válida; silêncio não é. As quatro entram sempre.`
        );
      } else linhasCategoricas += 1;
    }
    const duplicadas = MODALIDADES.filter((m) => todas.filter((l) => l.modalidade === m).length > 1);
    if (duplicadas.length) falhas.push(`${rotuloBase}: modalidade repetida (${duplicadas.join(", ")}).`);

    if (f.ajusteRenal !== "ajusta") continue;

    // ── AS FAIXAS CONTÍNUAS, POR BALDE DE PESO ───────────────────────────
    const continuas = todas.filter((l) => !l.modalidade);
    const baldes = new Map();
    for (const x of continuas) {
      const chave = x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"} kg` : "";
      if (!baldes.has(chave)) baldes.set(chave, []);
      baldes.get(chave).push(x);
    }
    if (baldes.size > 1) {
      const pesos = [...new Map(
        continuas.filter((x) => x.peso).map((x) => [`${x.peso.de}|${x.peso.ate}`, x.peso])
      ).values()].sort((a, b) => a.de - b.de);
      if (pesos[0].de !== 0) falhas.push(`${rotuloBase}: o eixo de PESO começa em ${pesos[0].de} kg, não em 0.`);
      if (pesos[pesos.length - 1].ate !== null) falhas.push(`${rotuloBase}: o eixo de PESO termina em ${pesos[pesos.length - 1].ate} kg.`);
      for (let i = 0; i < pesos.length - 1; i += 1) {
        if (pesos[i].ate !== pesos[i + 1].de) {
          falhas.push(`${rotuloBase}: eixo de PESO com ${pesos[i].ate > pesos[i + 1].de ? "SOBREPOSIÇÃO" : "BURACO"} entre ${pesos[i].ate} e ${pesos[i + 1].de} kg.`);
        }
      }
    }

    for (const [balde, lista] of baldes) {
      const rotulo = balde ? `${rotuloBase} {${balde}}` : rotuloBase;
      if (!lista.length) { falhas.push(`${rotulo}: nenhuma faixa de clearance.`); continue; }
      const fx = [...lista].sort((a, b) => a.de - b.de);
      linhasContinuas += fx.length;
      if (fx[0].de !== 0) falhas.push(`${rotulo}: a primeira faixa começa em ${fx[0].de}, não em 0 — anúrico cairia fora.`);
      if (fx[fx.length - 1].ate !== null) falhas.push(`${rotulo}: a última faixa termina em ${fx[fx.length - 1].ate} — ClCr acima disso não teria dose.`);
      for (let i = 0; i < fx.length - 1; i += 1) {
        const a = fx[i], b = fx[i + 1];
        if (a.ate === null) { falhas.push(`${rotulo}: faixa sem teto no meio da lista.`); continue; }
        if (a.ate > b.de) { falhas.push(`${rotulo}: SOBREPOSIÇÃO — a faixa ${a.de}–${a.ate} invade a ${b.de}–${b.ate ?? "∞"}.`); continue; }
        if (a.ate < b.de) { falhas.push(`${rotulo}: BURACO — nada cobre ClCr entre ${a.ate} e ${b.de}.`); continue; }
        const donoDeBaixo = a.ateInclusivo === true;
        const donoDeCima = b.deInclusivo !== false;
        if (donoDeBaixo && donoDeCima) falhas.push(`${rotulo}: SOBREPOSIÇÃO NO PONTO ${a.ate} — as duas faixas reivindicam a fronteira.`);
        if (!donoDeBaixo && !donoDeCima) falhas.push(`${rotulo}: BURACO NO PONTO ${a.ate} — nenhuma reivindica a fronteira.`);
      }
    }
  }
}

console.log("\nCatálogo de antimicrobianos — sobreposição e buraco reprovam\n");
console.log(`   universo: ${CAT.length} fármacos · ${linhasContinuas} faixas de clearance · ${linhasCategoricas} linhas de modalidade (HD · DP · CRRT · SLED)`);
const okF = conferirUniverso("valida-antimicrobianos", "farmacos", CAT.length);
const okX = conferirUniverso("valida-antimicrobianos", "faixas", linhasContinuas);

// ── PROVA DE COBERTURA: cada valor cai em exatamente uma faixa ─────────────
const AMOSTRA = [0, 5, 9, 10, 11, 15, 19, 20, 24, 25, 26, 29, 30, 34, 35, 39, 40, 45, 49, 50, 54, 55, 59, 60, 61, 75, 89, 90, 91, 120, 200];
for (const f of CAT.filter((x) => x.ajusteRenal === "ajusta")) {
  const conjuntos = f.eixo ? f.eixo.valores.map((v) => [v.id, v.linhas]) : [["", f.linhas]];
  for (const [eixo, todas] of conjuntos) {
    const continuas = todas.filter((l) => !l.modalidade);
    const chaves = [...new Set(continuas.map((x) => (x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"}` : "")))];
    for (const chave of chaves) {
      const lista = continuas.filter((x) => (x.peso ? `${x.peso.de}–${x.peso.ate ?? "∞"}` : "") === chave);
      for (const clcr of AMOSTRA) {
        const achadas = lista.filter((x) => {
          const piso = x.deInclusivo === false ? clcr > x.de : clcr >= x.de;
          const teto = x.ate === null ? true : x.ateInclusivo ? clcr <= x.ate : clcr < x.ate;
          return piso && teto;
        });
        if (achadas.length !== 1) {
          falhas.push(`${f.id}${eixo ? ` [${eixo}]` : ""}${chave ? ` {${chave} kg}` : ""}: ClCr ${clcr} cai em ${achadas.length} faixa(s) — tem de cair em exatamente 1.`);
        }
      }
    }
  }
}
console.log(`   cobertura conferida em ${AMOSTRA.length} valores de ClCr por conjunto, fronteiras incluídas`);

const todasAsFaixas = CAT.flatMap((f) => (f.eixo ? f.eixo.valores.flatMap((v) => v.linhas) : (f.linhas ?? [])));
const pendentes = todasAsFaixas.filter((x) => x.procedencia?.forca === "pendente");
console.log(`   ⚠️ faixas com procedência PENDENTE: ${pendentes.length} de ${todasAsFaixas.length} — o portão da AM-7 cobra isto antes de qualquer fármaco novo`);

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} problema(s):\n`);
  for (const x of falhas) console.log("   " + x);
  console.log("");
  process.exit(1);
}
if (!okF || !okX) { console.log("❌ universo abaixo do piso.\n"); process.exit(1); }
console.log("\n✅ nenhuma sobreposição, nenhum buraco — e toda faixa declara método e procedência\n");
