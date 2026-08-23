#!/usr/bin/env node
/**
 * MEDIÇÃO — não é trava. Sem código de saída.
 *
 * ⚠️ QUANTOS BLOCOS O MÉDICO ATRAVESSA ATÉ A PRIMEIRA DECISÃO.
 *
 * O autor percorreu o módulo renal no celular e reprovou: *"poluição de páginas
 * está muito ruim"*. Este número é o instrumento dessa queixa — e ele existe
 * para ser comparado depois, não para ser bonito agora.
 *
 * ⚠️ O QUE CONTA COMO BLOCO: um elemento visual que ocupa altura antes do card
 * de decisão. Blocos condicionais saem marcados, porque o número muda conforme
 * o estado — e um número único esconderia justamente o pior caso.
 */
const fs = require("fs"), path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
const TELA = path.join(RAIZ, "components", "protocol-screen", "acls-decision-flow-screen.tsx");
const src = lerFonte(TELA);

/**
 * Os blocos, na ordem em que o arquivo os renderiza. ⚠️ A lista é DIGITADA a
 * partir da leitura do JSX — o regex não sabe ler ordem de render. Cada linha
 * traz a marca no código que a sustenta, e a trava dessa marca é a conferência.
 */
// ⚠️ A MEDIÇÃO É POR MÓDULO, não do shell genérico. A primeira versão lia só
// `acls-decision-flow-screen.tsx` e continuou dizendo "3 sempre" depois de o
// card de estabilização ter saído do renal — porque o card continua no shell,
// para os outros 18. Medir o componente em vez da TELA é o R-87 outra vez.
// ⚠️ SEM COMENTÁRIO: a prop `estabilizacaoNoFluxo` aparece no JSX **e** no
// comentário que a explica. Leitura crua acharia a explicação e diria que o card
// saiu mesmo que a prop tivesse sido removida — comentário não renderiza nada.
const MODULO = lerFonte(path.join(RAIZ, "components", "protocol-screen", "ira-flow-screen.tsx"));
const semEstabilizacao = /estabilizacaoNoFluxo/.test(MODULO);

const BLOCOS = [
  { nome: "Header (título do módulo + voltar)", marca: "<Header", condicional: null },
  { nome: "Barra de retomada — «Você estava aqui»", marca: "<BarraDeRetomada", condicional: "só se houver percurso anterior" },
  { nome: "Card «Estabilização primeiro (ABCDE)»", marca: "<StabilizationFirstCard", condicional: null, removidoNesteModulo: () => semEstabilizacao },
  { nome: "Faixa «peso não aferido»", marca: "avisoPesoEstimado", condicional: "só se o peso for estimado" },
  { nome: "Descrição do módulo (texto + «ver mais»)", marca: "<InstrucaoResumida", condicional: "só no passo 1" },
  { nome: "Chip «Passo N»" + (/trail.length > 1/.test(src) ? " (a trilha só aparece do 2º passo em diante)" : " + trilha"), marca: "styles.trailRow", condicional: null },
];

let faltando = 0;
for (const b of BLOCOS) if (!src.includes(b.marca)) { console.error(`❌ marca não encontrada: ${b.marca} (${b.nome})`); faltando++; }

const vivos = BLOCOS.filter((b) => !b.removidoNesteModulo?.());
const removidos = BLOCOS.filter((b) => b.removidoNesteModulo?.());
const sempre = vivos.filter((b) => !b.condicional);
const pior = vivos.length;

console.log(`\nUNIVERSO: ${BLOCOS.length} bloco(s) mapeado(s) em ${path.relative(RAIZ, TELA)} · ${faltando} marca(s) não encontrada(s)\n`);
console.log("ordem de render, até o card de decisão:\n");
vivos.forEach((b, i) => {
  console.log(`  ${i + 1}. ${b.nome}${b.condicional ? `   ⟨${b.condicional}⟩` : ""}`);
});
console.log(`\n  ${vivos.length + 1}. ⟵ AQUI a primeira decisão`);
for (const b of removidos) console.log(`\n  ✂️  SAIU deste módulo: ${b.nome} — o ABCDE virou o passo 0`);
console.log(`\nBLOCOS ATÉ A PRIMEIRA DECISÃO: ${sempre.length} sempre · ${pior} no pior caso (primeiro passo, com retomada e peso estimado)`);

// ── E O CARD DE DECISÃO EM SI: quantas partes antes dos botões?
const ENTRADA = path.join(RAIZ, "ira-decision-tree.ts");
const arv = lerFonte(ENTRADA);
// ⚠️ O NÓ DE ENTRADA VEM DE `entryNodeId`, não de um nome fixo. A primeira
// versão procurava `entry: {` — e quando a porta do módulo mudou, ela passou a
// medir o vazio e a imprimir "0 botões" sem reclamar de nada. Medir o nome em
// vez do papel é o R-87 dentro da própria medição.
const idDaEntrada = (arv.match(/entryNodeId:\s*"([^"]+)"/) ?? [])[1];
const inicio = arv.indexOf(`    ${idDaEntrada}: {`);
const bloco = inicio < 0 ? "" : arv.slice(inicio, arv.indexOf("\n    },", inicio));
if (!bloco) console.error(`❌ nó de entrada « ${idDaEntrada} » não encontrado`);
const partes = [];
for (const campo of ["title", "question", "summary"]) if (new RegExp(`${campo}:`).test(bloco)) partes.push(campo);
const evid = (bloco.match(/evidence: \[([\s\S]*?)\]/) ?? [])[1];
const nEvid = evid ? (evid.match(/^\s*"/gm) ?? []).length : 0;
const nOpc = (bloco.match(/\{ id: "/g) ?? []).length;
console.log(`\nDENTRO do card de entrada («${idDaEntrada}»): ${partes.join(" + ")} + ${nEvid} linha(s) de evidência, antes de ${nOpc} botão(ões)`);
console.log(`\n⚠️ MEDIÇÃO: sem código de saída. Nada foi alterado.\n`);
