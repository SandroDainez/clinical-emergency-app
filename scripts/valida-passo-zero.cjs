#!/usr/bin/env node
/**
 * PROMETE: que nenhum achado do passo 0 do módulo renal fique sem destino
 *   próprio; e que o estado gravado pelo "ainda não sei" NÃO influencie
 *   classificação clínica.
 * NÃO PROMETE: que os destinos sejam os clinicamente certos — a escolha de para
 *   onde cada achado vai é do autor. Ela confere que CADA UM tem o seu.
 * UNIVERSO: o nó de entrada de `ira-decision-tree.ts` (lido por `entryNodeId`),
 *   seus achados declarados, e o `derive` da árvore. Números impressos antes do
 *   resultado.
 * ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23) — R-118, R-122, R-123.
 *
 * ── R-123 · O AGRUPAMENTO É VISUAL, O DESTINO É POR ACHADO ──────────────────
 *
 * "Rebaixamento do nível de consciência, confusão aguda ou convulsão" era UMA
 * opção com DOIS destinos — e nenhum dos dois servia para o do meio: quem tinha
 * **confusão aguda isolada** recebia ISR e anticonvulsivante.
 *
 * ⚠️ Opção que agrupa achados com condutas divergentes **empurra o usuário para
 * conduta que não é a dele**.
 *
 * ── R-122 · A RESPOSTA VIAJA, MAS NÃO CLASSIFICA ────────────────────────────
 *
 * O "ainda não sei" grava o que a pessoa TEM (exames · diurese · sinais · nada).
 * Isso serve para não reperguntar. ⚠️ Se um dia alimentar gravidade, vira
 * classificação por disponibilidade de exame — que é o oposto de clínica.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "p0-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--outDir", tmp,
  path.join(RAIZ, "ira-decision-tree.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const { iraDecisionTree: T } = require(path.join(tmp, "ira-decision-tree.js"));

const entrada = T.nodes[T.entryNodeId];
if (!entrada || entrada.type !== "decision") erro(`o nó de entrada « ${T.entryNodeId} » não é decisão`);

/**
 * Os achados que o autor nomeou e que EXIGEM destino próprio.
 * ⚠️ Lista digitada, e por isso é PISO: achado novo que ninguém acrescentar aqui
 * não é conferido. O que ela impede é a REGRESSÃO dos três que já custaram.
 */
const ACHADOS_COM_CONDUTA_PROPRIA = [
  { nome: "rebaixamento do nível de consciência", padrao: /rebaixamento/i },
  { nome: "confusão aguda", padrao: /confus[ãa]o/i },
  { nome: "convulsão", padrao: /convuls/i },
];

// ⚠️ SÓ O GRUPO D. "Rebaixamento" aparece TAMBÉM no texto da letra A — *"ou
// rebaixamento importante"* —, e aquilo é do autor: quem não protege a via aérea
// vai por A, de propósito. Varrer todas as opções acusava a decisão dele como
// ambiguidade. O agrupamento por letra é o escopo certo, porque é nele que a
// divergência de conduta acontece.
const opcoes = (entrada.options ?? []).filter((o) => /^D · /.test(o.label));
const forasDoGrupo = (entrada.options ?? []).length - opcoes.length;
console.log(`\nUNIVERSO: nó de entrada « ${T.entryNodeId} » · ${opcoes.length} opção(ões) no grupo D (${forasDoGrupo} fora do grupo, não conferidas) · ${ACHADOS_COM_CONDUTA_PROPRIA.length} achado(s) que exigem destino próprio`);

const destinoPorAchado = new Map();
for (const a of ACHADOS_COM_CONDUTA_PROPRIA) {
  const casam = opcoes.filter((o) => a.padrao.test(o.label));
  if (!casam.length) { erro(`o achado « ${a.nome} » sumiu do passo 0 — ele estava lá e alguém o removeu`); continue; }
  if (casam.length > 1) { erro(`o achado « ${a.nome} » aparece em ${casam.length} opções do passo 0 — ambíguo`); continue; }
  destinoPorAchado.set(a.nome, casam[0].next);
}
// ⚠️ O TESTE CENTRAL: dois achados de conduta divergente não podem compartilhar destino.
const vistos = new Map();
for (const [nome, destino] of destinoPorAchado) {
  if (vistos.has(destino))
    erro(`« ${nome} » e « ${vistos.get(destino)} » compartilham o destino "${destino}" — o agrupamento pode ser visual, o destino é POR ACHADO (R-123). Quem tem o segundo achado recebe a conduta do primeiro.`);
  else vistos.set(destino, nome);
}
for (const [nome, destino] of destinoPorAchado) console.log(`   ${nome.padEnd(38)} → ${destino}`);

// ── R-122 · O ESTADO NÃO CLASSIFICA
const fonte = lerFonte(path.join(RAIZ, "ira-decision-tree.ts"));
const CAMPO = "dados_disponiveis";
const gravam = (fonte.match(new RegExp(`grava: \\{ campo: "${CAMPO}"`, "g")) ?? []).length;
console.log(`\n   ${gravam} opção(ões) gravam « ${CAMPO} »`);
if (!gravam) erro(`nenhuma opção grava « ${CAMPO} » — a resposta do "ainda não sei" voltou a se perder (R-122)`);

// ⚠️ Conferido no `derive` COMPILADO, não no texto: é ele que classifica.
const derive = String(T.derive ?? "");
if (derive.includes(CAMPO))
  erro(`« ${CAMPO} » é lido pelo \`derive\` da árvore — o estado que existe para NÃO REPERGUNTAR passou a CLASSIFICAR. Disponibilidade de exame não é gravidade.`);

console.log(falhas
  ? `\n❌ ${falhas} falha(s)`
  : `\n✅ cada achado com destino próprio · o estado do "ainda não sei" viaja e não classifica`);
process.exit(falhas ? 1 : 0);
