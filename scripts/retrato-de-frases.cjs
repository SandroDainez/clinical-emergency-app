/**
 * RETRATO FRASE A FRASE — o instrumento do R-86.
 *
 * Colhe, de cada nó de cada árvore, o texto que a tela mostra, e o quebra em
 * frases. Comparando o retrato ANTES e DEPOIS de uma edição de volume, toda frase
 * que sumiu do conjunto tem de ser localizada no estado novo — é o que separa
 * "moveu" de "perdeu".
 *
 * ── ⚠️ HÁ UM SEGUNDO RETRATO, E ELE SERVE PARA OUTRA COISA ──────────────────
 *
 * Este mede FRASES, e a fronteira da frase é a PONTUAÇÃO. Ele serve para MOVER
 * blocos de lugar: toda frase que sumir do conjunto tem de ser localizada no
 * estado novo.
 *
 * ⚠️ Ele QUEBRA em edição que separa parágrafo em itens ou baixa caixa alta —
 * ali a fronteira e a caixa mudam sem que nada se perca, e ele acusa dezenas de
 * "sumidas" e "novas" que são a mesma frase. Foi o que aconteceu na IRA
 * (2026-08-18): 23 sumidas e 37 novas, todas falsas.
 *
 * Para SEPARAR e REESCREVER, o instrumento é `scripts/retrato-de-palavras.cjs`,
 * que compara o multiconjunto de palavras e ignora fronteira e caixa. São dois,
 * com promessas diferentes, e cada um declara a sua.
 *
 * ── ⚠️ O QUE ESTE INSTRUMENTO **NÃO** CAPTURA — leia antes de confiar no retrato ─
 *
 * A primeira coisa a conferir num retrato é o que ele deixa de fora, porque a
 * promessa "toda frase que sumir é localizada" vale só para o que ele vê.
 *
 *   · O universo são as ÁRVORES DE DECISÃO. Texto que vive em `components/*.tsx`,
 *     no `acls/reducer.ts` ou nas telas estáticas NÃO entra.
 *   · `evidence` com 3+ itens entra no total, mas ele renderiza RECOLHIDO (C1) —
 *     o retrato mede o que existe, não o que se lê sem tocar.
 *   · A quebra em frases é por pontuação. Uma frase reescrita com a mesma
 *     pontuação em lugar diferente aparece como "sumiu" e "nova".
 *
 * ── ⚠️ O PISO DE CAPTURA MUDOU EM 2026-08-17 ────────────────────────────────
 *
 * ATÉ ESTA DATA o retrato filtrava `length > 28` NA CAPTURA, e por isso não via
 * 29,3% das frases (1.851 de 6.312 — 6,6% dos caracteres). O que ele engolia não
 * era ruído: eram RÓTULOS QUE ABREM BLOCO DE CONDUTA — «⚠️ AINE:»,
 * «(1) PERFURAÇÃO POSSÍVEL:», «⚠️ VOLVO:», «O QUE FAZER AGORA:». Uma linha curta
 * de conduta podia desaparecer e o retrato não reportava.
 *
 * ⚠️ RETRATOS GERADOS ANTES DESTA DATA USARAM PISO 28. Eles continuam válidos
 * como comparação — cada bloco comparou antes×depois com o MESMO piso dos dois
 * lados, e a comparação era internamente consistente. Mas quem comparar um
 * retrato novo com uma base antiga vai ver ~1.850 "frases novas" que não são
 * novas: são as que a base não capturava. Regere a base nesse caso.
 *
 * ── A CORREÇÃO: FILTRA-SE NO RELATÓRIO, NUNCA NA CAPTURA ────────────────────
 *
 * Filtro na captura troca precisão por COBERTURA, e cobertura perdida é
 * invisível. Agora a captura é TOTAL — nenhum piso — e o filtro vive na leitura:
 *
 *   · os TOTAIS são calculados sobre as frases "de leitura" (> 10 caracteres, ou
 *     rótulo), para que o número siga comparável e a saída legível;
 *   · a lista de DESAPARECIDAS não é filtrada por nada. É o sinal que não pode
 *     ser perdido, e é para isso que o instrumento existe.
 *
 * REGRA DE RETENÇÃO, que não depende de tamanho: frase que TERMINA EM ":" ou
 * ABRE COM MARCA (⚠️ ✅ • → numeração, ou palavra em caixa alta seguida de ":")
 * entra sempre — são os rótulos que abrem bloco, exatamente o que o buraco
 * engolia. São 211 frases que o piso 10 sozinho ainda perderia.
 *
 * Uso:  node scripts/retrato-de-frases.cjs <arquivo-de-saída.json>
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
/**
 * ⚠️⚠️ ⛔ O CAMINHO SAI DO PRÓPRIO ARQUIVO — ⛔ e ⛔ não de onde ele morava.
 *
 * ⛔ Aqui havia ⛔ `/Users/sandrodainez/Documents/clinical-emergency-app`
 * ⛔ escrito à mão. ⛔ Em 2026-09-09 o repositório ⛔ mudou de lugar ⛔ e ⛔ este
 * instrumento ⛔ passou a apontar ⛔ para ⛔ uma pasta ⛔ que ⛔ **⛔ não existe
 * mais** — ⛔ e ⛔ ele ⛔ **⛔ não está no `test:all`**, ⛔ então ⛔ ninguém
 * ⛔ descobriria ⛔ até ⛔ precisar dele.
 *
 * ⚠️ ⛔ `__dirname` ⛔ acompanha ⛔ o arquivo ⛔ para ⛔ onde ⛔ ele for.
 */
const app = path.resolve(__dirname, "..");
process.chdir(app);
const { textosDoNo } = require(path.join(app, "scripts/lib/textos-do-no.cjs"));
/**
 * ⚠️⚠️⚠️ ⛔ UNIVERSO VAZIO ⛔ NÃO É ⛔ « ZERO FRASES PERDIDAS ».
 *
 * ⛔ O padrão era `-decision-tree.ts`. ⛔ O commit `bdf02c8` ⛔ apagou ⛔ as onze
 * árvores ⛔ com esse nome, ⛔ e ⛔ sobraram ⛔ duas ⛔ com ⛔ **⛔ outro sufixo**
 * (`acls-bradycardia-tree.ts`, `acls-tachycardia-tree.ts`). ⛔ Desde então ⛔ o
 * instrumento ⛔ lia ⛔ **⛔ zero arquivos**, ⛔ relatava ⛔ « 0 frases perdidas »
 * ⛔ e ⛔ saía ⛔ com código 0 — ⛔ um ⛔ **⛔ verde ⛔ sobre ⛔ o vazio**.
 *
 * ⚠️ ⛔ Agora ⛔ ele ⛔ **⛔ recusa** ⛔ medir ⛔ o nada.
 */
const arqs = fs.readdirSync(app).filter((f) => /-tree\.ts$/.test(f)).sort();
if (arqs.length === 0) {
  console.error(
    "\n❌ RETRATO DE FRASES — universo VAZIO: nenhum arquivo `*-tree.ts` na raiz.\n" +
      "   Um instrumento sem universo não mede nada, e relatar zeros seria pior\n" +
      "   que não rodar. Confira se as árvores mudaram de nome ou de pasta."
  );
  process.exit(1);
}
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ret-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp, ...arqs.map((f) => path.join(app, f))],
    { cwd: app, stdio: "pipe" });
} catch { /* tsc reclama de tipos e ainda emite */ }

const visivel = (n) => {
  const ev = n.evidence ?? [];
  const { evidence, ...r } = n;
  const base = textosDoNo(r);
  return (ev.length <= 2 ? base.concat(textosDoNo(ev)) : base).join("\n");
};

/** ⚠️ CAPTURA TOTAL — sem piso. O filtro é do relatório. */
const frases = (t) =>
  t.split(/(?<=[.:!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean);

/** Rótulo que abre bloco: entra no relatório qualquer que seja o comprimento. */
const ROTULO = /:$|^[⚠✅❌⛔🔴•·▪▸→⇒]|^\(?\d+\)|^[A-ZÀ-Ú]{2,}[):]/u;
/** As frases que contam para os TOTAIS — ruído de opção ("Sim", "70") fica fora. */
const deLeitura = (f) => f.length > 10 || ROTULO.test(f);

const out = { nos: {}, frases: {} };
for (const f of arqs) {
  const p = path.join(tmp, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(p)) continue;
  const arv = Object.values(require(p)).find((v) => v && v.nodes);
  if (!arv) continue;
  const mod = f.replace("-decision-tree.ts", "");
  for (const [id, n] of Object.entries(arv.nodes)) {
    const t = visivel(n);
    out.nos[mod + "/" + id] = t.length;
    for (const fr of frases(t)) (out.frases[fr] ??= []).push(mod + "/" + id);
  }
}
fs.writeFileSync(process.argv[2], JSON.stringify(out));

const nos = Object.keys(out.nos).length;
const ch = Object.values(out.nos).reduce((a, b) => a + b, 0);
const todas = Object.keys(out.frases);
const leitura = todas.filter(deLeitura);
console.log(
  `retrato: ${nos} nós · ${ch} ch · ${leitura.length} frases de leitura ` +
  `(${todas.length} capturadas, ${todas.length - leitura.length} de ruído — "Sim", "70" e afins)`
);
