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
const porArvore = new Map();
for (const f of arqs) {
  const out = path.join(tempDir, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod; try { mod = require(out); } catch { continue; }
  const anos = new Set();
  for (const arv of Object.values(mod).filter((v) => v && v.nodes && v.entryNodeId)) {
    for (const no of Object.values(arv.nodes)) {
      const t = [no.title, no.summary, no.question, ...(no.actions || []), ...(no.evidence || []),
                 ...(no.exitCriteria || [])].filter(Boolean).join(" ");
      // O ano precisa vir COLADO a uma sigla de sociedade ou à palavra
      // diretriz/consenso. Sem isso, "2000 mL" de cristaloide no choque
      // hemorrágico virava "diretriz de 2000" — e o módulo aparecia no topo da
      // lista de desatualizados por causa de um volume.
      const re = /\b(AHA|ACC|ACLS|SSC|ADA|EASD|ERC|ESC|ACOG|FEBRASGO|ATLS|AES|NCS|WAO|BTF|KDIGO|GOLD|GINA|IDSA|SBC|AMIB|ANZCOR|DAS|diretriz|consenso|guideline)\s*\/?\s*[A-Z]*\s*(20[0-2]\d)\b|\b(20[0-2]\d)\s*(AHA|ACC|SSC|ADA|ESC|ATLS|AES)\b/g;
      for (const m of t.matchAll(re)) anos.add(Number(m[2] || m[3]));
    }
  }
  if (anos.size) porArvore.set(f.replace(/\.ts$/, ""), [...anos].sort());
}
const linhasAno = [...porArvore].map(([k, v]) => ({ k, v, max: v[v.length - 1] }))
  .sort((a, b) => a.max - b.max);
console.log("════ ANOS DE DIRETRIZ CITADOS, POR MÓDULO ════\n");
console.log("módulo".padEnd(32) + "mais recente   todos");
console.log("─".repeat(74));
for (const { k, v, max } of linhasAno) {
  console.log(k.padEnd(32) + String(max).padEnd(15) + v.join(", "));
}
const semAno = arqs.map((f) => f.replace(/\.ts$/, "")).filter((k) => !porArvore.has(k));
if (semAno.length) console.log(`\nSem nenhum ano citado: ${semAno.join(", ")}`);
console.log("");

fs.rmSync(tempDir, { recursive: true, force: true });
