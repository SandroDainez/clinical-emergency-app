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
// ⚠️ FALHA DE COMPILAÇÃO É REPROVAÇÃO COM RAZÃO, NÃO STACK TRACE.
//
// Sem o `try`, uma mutação que quebrasse a árvore matava a trava com um stack de
// `execFileSync` — saía com código 1, então "reprovava", mas sem dizer POR QUÊ.
// Reprovar sem razão é quase tão ruim quanto passar sem olhar.
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--outDir", tmp,
    path.join(RAIZ, "ira-decision-tree.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
} catch {
  console.error("❌ `ira-decision-tree.ts` não compila — a conferência do passo 0 não rodou. O erro do compilador está acima.");
  process.exit(1);
}
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

// ── A GLICEMIA É VERIFICAÇÃO DO BLOCO D, NÃO ACHADO QUE ROTEIA
//
// ⚠️ Decisão do autor (2026-08-24): *"não como uma nova opção separada, mas como
// verificação obrigatória dentro do bloco D"*, e *"a glicemia não deve atrasar
// manejo prioritário de via aérea, ventilação, circulação ou controle de
// convulsão em curso"*.
//
// ⚠️ E NENHUM NÚMERO: "se houver hipoglicemia" pressupõe um corte que a decisão
// não traz. Escrever 70 ou 54 aqui seria o R-97 na forma mais direta.
{
  const D = ["abcde_d_rebaixamento", "abcde_d_confusao", "abcde_d_convulsao"];
  const ANTES_DE_D = ["abcde_a", "abcde_b", "abcde_c_perfusao", "abcde_c_ritmo"];
  const textoDe = (no) => JSON.stringify(T.nodes[no] ?? {});
  const MARCA = /VERIFIQUE A GLICEMIA CAPILAR AGORA/;

  // M97 — a verificação não pode sumir do bloco D.
  const semGlicemia = D.filter((no) => !MARCA.test(textoDe(no)));
  if (semGlicemia.length)
    erro(`o bloco D perdeu a verificação de glicemia em: ${semGlicemia.join(", ")} — ela é verificação OBRIGATÓRIA do bloco (autor, 2026-08-24)`);
  if (!MARCA.test(textoDe(T.entryNodeId)))
    erro(`a tela do passo 0 não traz a verificação de glicemia — ela acompanha as três opções do bloco D`);

  // M98 — não pode virar opção que roteia.
  const comoOpcao = (entrada.options ?? []).filter((o) => /glicemi|dextro/i.test(o.label));
  if (comoOpcao.length)
    erro(`a glicemia virou opção do passo 0 (« ${comoOpcao[0].label} ») — a glicemia é VERIFICAÇÃO DO BLOCO, não achado que roteia. Uma quarta opção a faria rotear.`);

  // M99 — não pode preceder A, B nem C.
  const adiantada = ANTES_DE_D.filter((no) => MARCA.test(textoDe(no)));
  if (adiantada.length)
    erro(`a glicemia apareceu em ${adiantada.join(", ")} — ela NÃO precede A, B nem C: "a glicemia não deve atrasar manejo prioritário de via aérea, ventilação, circulação ou controle de convulsão em curso" (autor). Ela acontece JUNTO, não antes.`);

  // ⚠️ E NENHUM NÚMERO DE GLICEMIA ENTROU JUNTO.
  const comNumero = [...D, T.entryNodeId, "abcde_guiado"]
    .filter((no) => /glicemi[^"]{0,80}?\d|\d+\s*mg\/dL[^"]{0,40}?glicemi/i.test(textoDe(no)));
  if (comNumero.length)
    erro(`número de glicemia apareceu no passo 0 (${comNumero.join(", ")}) — o corte de hipoglicemia NÃO foi decidido, e o buraco convida o número (R-97)`);

  console.log(`   glicemia: verificação presente nos ${D.length} nós do bloco D · 0 opções que roteiam · 0 antes de A/B/C · 0 números`);
}

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
