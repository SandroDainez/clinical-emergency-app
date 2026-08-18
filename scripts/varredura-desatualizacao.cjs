/**
 * Evidência mais nova que a ramificação implementada.
 *
 * ── O PADRÃO ─────────────────────────────────────────────────────────────────
 *
 * Encontrado na cetoacidose. O nó do bicarbonato traz, no texto de evidência:
 *
 *   "Consenso 2024: considerar bicarbonato APENAS na acidose grave com pH < 7,0
 *    (a faixa 6,9–7,0 abaixo vem do protocolo clássico e virou opcional)"
 *
 * E, logo abaixo, oferece as DUAS faixas como ramos equivalentes da decisão,
 * com as doses de 2009. O módulo SABE que está desatualizado, ESCREVEU isso, e
 * manteve a estrutura antiga.
 *
 * É uma assinatura reconhecível: alguém atualizou a citação sem refazer o fluxo.
 * O texto fica correto e a árvore continua conduzindo pela versão anterior —
 * e quem usa o app segue o fluxo, não o rodapé.
 *
 * ── O QUE ESTE SCRIPT PROCURA ────────────────────────────────────────────────
 *
 * 1. Nó cuja evidência cita um ANO mais recente do que outras partes do mesmo
 *    nó, ou cita "consenso/diretriz + ano" junto de palavra de mudança
 *    ("virou opcional", "não mais", "deixou de", "restringiu", "clássico").
 * 2. Evidência que diz "NÃO recomendado" ou "APENAS se X" e, no mesmo nó, uma
 *    opção de decisão que oferece justamente o que foi restringido.
 *
 * ── O QUE ELE NÃO É ──────────────────────────────────────────────────────────
 *
 * Não julga se a diretriz citada é a vigente — isso é conferência humana. Ele
 * encontra o DESCOMPASSO INTERNO: o próprio nó dizendo uma coisa e ramificando
 * outra. É por isso que funciona sem saber medicina.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "desatualizacao-"));
const arqs = fs.readdirSync(appDir).filter((f) => /-(decision-)?tree\.ts$/.test(f)).sort();
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  ...arqs.map((f) => path.join(appDir, f))], { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] });

/**
 * A primeira versão destes padrões acusou 8 nós e 7 eram ruído: pegou "exemplo
 * clássico" no TCE, "APENAS cutâneo-mucoso" na anafilaxia, "apenas em centro
 * terciário" na eclâmpsia — prosa clínica normal, não marca de desatualização.
 *
 * A assinatura REAL é mais estreita, e o caso do bicarbonato a define: a
 * evidência fala do PRÓPRIO RAMO do nó e diz que ele envelheceu —
 *
 *   "a faixa 6,9–7,0 ABAIXO vem do protocolo clássico e virou opcional"
 *
 * Duas coisas juntas: marca de mudança E referência ao que o nó ainda oferece
 * como escolha. Só isso caracteriza "atualizaram a citação e não refizeram o
 * fluxo". Prosa que usa "apenas" para delimitar indicação não é isso.
 */
const MUDANCA = /virou opcional|não mais|deixou de ser|restringi|protocolo clássico|versão anterior|superad[oa]|desatualiz|em desuso|substituíd[oa]/i;
const RESTRICAO = /\bNÃO (é |são )?(mais )?recomendad/i;

/** Tokens distintivos de um rótulo de opção — números, faixas, siglas. */
function marcasDe(texto) {
  return new Set(
    (String(texto).match(/\d+(?:[,.]\d+)?(?:\s*[–-]\s*\d+(?:[,.]\d+)?)?|[A-ZÀ-Ú]{3,}/g) || [])
      .map((x) => x.replace(/\s/g, ""))
  );
}
const ANO = /\b(19|20)\d{2}\b/g;

const achados = [];
for (const f of arqs) {
  const out = path.join(tempDir, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod; try { mod = require(out); } catch { continue; }
  for (const arv of Object.values(mod).filter((v) => v && v.nodes && v.entryNodeId)) {
    for (const no of Object.values(arv.nodes)) {
      const evid = no.evidence || [];
      const opcoes = (no.options || []).map((o) => o.label);
      if (!evid.length) continue;
      const textoEvid = evid.join(" ¶ ");

      // (1) alguma linha de evidência marca mudança/restrição
      const linhasMarcadas = evid.filter((e) => MUDANCA.test(e) || RESTRICAO.test(e));
      if (!linhasMarcadas.length) continue;

      // (2) e essa MESMA linha se refere ao que o nó ainda oferece como ramo.
      //     É o que separa "atualizaram a citação sem refazer o fluxo" de
      //     prosa clínica que usa "apenas" para delimitar indicação.
      const marcasDosRamos = opcoes.map((o) => marcasDe(o));
      const linhaQueAponta = linhasMarcadas.find((linha) => {
        const m = marcasDe(linha);
        return marcasDosRamos.some((mr) => [...mr].some((x) => m.has(x)));
      });
      if (!linhaQueAponta) continue;

      // anos citados na evidência
      const anos = [...new Set((textoEvid.match(ANO) || []).map(Number))].sort();
      const anoMax = anos.length ? anos[anos.length - 1] : null;

      // Sinal forte: o nó ainda OFERECE ramo com o que a evidência restringiu.
      const linhaMudanca = linhaQueAponta;
      achados.push({
        arquivo: f.replace(/\.ts$/, ""),
        no: no.id,
        titulo: no.title || "",
        anos,
        anoMax,
        opcoes: opcoes.length,
        evidencia: linhaMudanca.slice(0, 190),
        rotulos: opcoes.map((o) => o.slice(0, 44)),
      });
    }
  }
}

achados.sort((a, b) => (b.anoMax || 0) - (a.anoMax || 0));
console.log("\n════ EVIDÊNCIA MAIS NOVA QUE A RAMIFICAÇÃO ════\n");
console.log(`nós com sinal de atualização parcial: ${achados.length}\n`);
for (const a of achados) {
  console.log(`── ${a.arquivo} · ${a.no}${a.anoMax ? `  [cita ${a.anos.join(", ")}]` : ""}`);
  console.log(`   ${a.titulo}`);
  console.log(`   evidência: « ${a.evidencia} »`);
  if (a.opcoes) console.log(`   ramos (${a.opcoes}): ${a.rotulos.join(" | ")}`);
  console.log("");
}
/**
 * ── SEGUNDO SINAL: idade das citações, por módulo ────────────────────────────
 *
 * O primeiro sinal é preciso e por isso ESTREITO — só pega o nó que denuncia a
 * si mesmo. Um módulo cuja evidência nunca foi atualizada não se denuncia: ele
 * simplesmente cita 2015 e segue coerente com 2015.
 *
 * Isto aqui não infere nada: lista os anos que cada árvore cita e ordena pelo
 * mais recente de cada uma. Módulo cujo ano mais novo é antigo é candidato a
 * revisão — não é acusação, é onde olhar primeiro.
 */
/**
 * ── POR QUE EXISTEM DOIS SINAIS, E NÃO UM ────────────────────────────────────
 *
 * A primeira versão exigia que o ano viesse colado a uma sigla de sociedade, de
 * uma lista escrita à mão. A lista tinha AMIB e não tinha ATS, ACCP, SBPT, ERS
 * nem ESICM — então "Elegibilidade (ACCP/ATS 2017)" não contava, e o módulo de
 * VENTILAÇÃO apareceu como "sem nenhuma fonte citada" quando na verdade cita
 * ARDSNet (NEJM 2000), Berlim 2012, Amato 2015, ACCP/ATS 2017, Nova Definição
 * Global (2024) e AMIB/SBPT 2024.
 *
 * O erro entrou na dívida D-3 e foi usado para ordenar a auditoria — decisão de
 * sequência tomada sobre dado errado. É o mesmo modo de falha do sinônimo
 * `norepinefrina` no R-1: regra que depende de lista, com a lista furada.
 *
 * Ampliar a lista não resolve, só adia: a próxima sigla que alguém escrever vai
 * faltar de novo. Por isso agora são DOIS sinais, com defeitos opostos:
 *
 *   RECONHECIDOS — ano colado a vocabulário de procedência. Preciso e estreito:
 *                  subnotifica quando o vocabulário não cobre.
 *   CRUS         — qualquer ano no conteúdo, sem vocabulário nenhum. Ruidoso
 *                  ("2000 mL" de cristaloide vira 2000), mas NÃO PODE
 *                  subnotificar por vocabulário.
 *
 * A leitura certa é a interseção: módulo sem NENHUM ano cru realmente não cita
 * nada. Módulo com ano cru e nenhum reconhecido é onde o vocabulário
 * provavelmente falhou — vale ler antes de acusar.
 *
 * O vocabulário abaixo foi EXTRAÍDO do conteúdo do app (toda sigla/nome colado
 * a um ano), não adivinhado.
 */
const PROCEDENCIA = [
  // Sociedades e organizações
  "AHA", "ASA", "ACC", "ACLS", "SSC", "ADA", "EASD", "AACE", "DTS", "ERC", "ESC",
  "ACOG", "FEBRASGO", "ATLS", "AES", "NCS", "WAO", "BTF", "KDIGO", "GOLD", "GINA",
  "IDSA", "SBC", "AMIB", "SBPT", "ANZCOR", "DAS", "ATS", "ACCP", "CHEST", "ERS",
  "ESICM", "ISSHP", "FIGO", "ASH", "RCUK", "AAAAI", "ACAAI", "EAACI", "ESO", "SBN",
  "ASHP", "SIDP", "SBI", "ILCOR", "SBIBAE", "AVCBrasil",
  // Periódicos
  "NEJM", "JAMA", "Lancet", "AJRCCM", "Circulation", "Resuscitation", "Med",
  // Definições e consensos com nome próprio
  "Berlim", "Berlin", "PADIS", "GRADE", "Walls",
  // Palavras que anunciam procedência em português
  "diretriz", "diretrizes", "consenso", "guideline", "guidelines", "protocolo",
  "definição", "critérios", "atualização", "revisão",
];
const RE_PROCEDENCIA = new RegExp(
  `\\b(${PROCEDENCIA.join("|")})\\s*\\/?\\s*[A-Za-zÀ-ú]*\\s*\\(?\\s*((?:19|20)\\d\\d)\\b` +
  `|\\b((?:19|20)\\d\\d)\\s*(?:${PROCEDENCIA.join("|")})\\b`,
  "g"
);

const porArvore = new Map();
for (const f of arqs) {
  const out = path.join(tempDir, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod; try { mod = require(out); } catch { continue; }
  const anos = new Set();
  const anosCrus = new Set();
  for (const arv of Object.values(mod).filter((v) => v && v.nodes && v.entryNodeId)) {
    for (const no of Object.values(arv.nodes)) {
      const t = [no.title, no.summary, no.question, ...(no.actions || []), ...(no.evidence || []), ...(no.porque || []),
                 ...(no.exitCriteria || [])].filter(Boolean).join(" ");
      for (const m of t.matchAll(RE_PROCEDENCIA)) anos.add(Number(m[2] || m[3]));
      // Sinal CRU, sem vocabulário nenhum: qualquer ano plausível no conteúdo.
      // Ruidoso de propósito — ver o comentário de RE_PROCEDENCIA.
      for (const m of t.matchAll(/\b(19[89]\d|20[0-2]\d)\b/g)) anosCrus.add(Number(m[1]));
    }
  }
  const chave = f.replace(/\.ts$/, "");
  if (anos.size || anosCrus.size) {
    porArvore.set(chave, { reconhecidos: [...anos].sort(), crus: [...anosCrus].sort() });
  }
}
const todas = arqs.map((f) => f.replace(/\.ts$/, ""));
const linhas = todas.map((k) => {
  const v = porArvore.get(k) ?? { reconhecidos: [], crus: [] };
  return {
    k,
    rec: v.reconhecidos,
    crus: v.crus,
    max: v.reconhecidos.length ? v.reconhecidos[v.reconhecidos.length - 1] : 0,
  };
}).sort((a, b) => a.max - b.max);

console.log("════ PROCEDÊNCIA CITADA, POR MÓDULO ════\n");
console.log("módulo".padEnd(30) + "procedência".padEnd(22) + "anos crus (triagem)");
console.log("─".repeat(88));
for (const { k, rec, crus } of linhas) {
  const proc = rec.length ? rec.join(", ") : "— nenhuma —";
  console.log(k.padEnd(30) + proc.padEnd(22) + (crus.length ? crus.join(", ") : "—"));
}

const semNada = linhas.filter((l) => !l.rec.length && !l.crus.length).map((l) => l.k);
const soCru = linhas.filter((l) => !l.rec.length && l.crus.length).map((l) => l.k);

console.log("");
if (semNada.length) {
  console.log(`SEM NENHUM ANO, por sinal nenhum — estes realmente não citam fonte:\n  ${semNada.join(", ")}\n`);
} else {
  console.log("Nenhum módulo está sem ano por completo.\n");
}
if (soCru.length) {
  console.log(
    `COM ano no conteúdo mas SEM procedência reconhecida — ler antes de acusar,\n` +
    `pode ser vocabulário faltando (foi o caso da ventilação) ou número clínico\n` +
    `lido como ano ("2000 mL"):\n  ${soCru.join(", ")}\n`
  );
}

fs.rmSync(tempDir, { recursive: true, force: true });
