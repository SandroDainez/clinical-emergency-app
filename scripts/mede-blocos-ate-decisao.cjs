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
const BLOCOS = [
  { nome: "Header (título do módulo + voltar)", marca: "<Header", condicional: null },
  { nome: "Barra de retomada — «Você estava aqui»", marca: "<BarraDeRetomada", condicional: "só se houver percurso anterior" },
  { nome: "Card «Estabilização primeiro (ABCDE)»", marca: "<StabilizationFirstCard", condicional: null },
  { nome: "Faixa «peso não aferido»", marca: "avisoPesoEstimado", condicional: "só se o peso for estimado" },
  { nome: "Descrição do módulo (texto + «ver mais»)", marca: "<InstrucaoResumida", condicional: "só no passo 1" },
  { nome: "Chip «Passo N» + trilha", marca: "styles.trailRow", condicional: null },
];

let faltando = 0;
for (const b of BLOCOS) if (!src.includes(b.marca)) { console.error(`❌ marca não encontrada: ${b.marca} (${b.nome})`); faltando++; }

const sempre = BLOCOS.filter((b) => !b.condicional);
const pior = BLOCOS.length;

console.log(`\nUNIVERSO: ${BLOCOS.length} bloco(s) mapeado(s) em ${path.relative(RAIZ, TELA)} · ${faltando} marca(s) não encontrada(s)\n`);
console.log("ordem de render, até o card de decisão:\n");
BLOCOS.forEach((b, i) => {
  console.log(`  ${i + 1}. ${b.nome}${b.condicional ? `   ⟨${b.condicional}⟩` : ""}`);
});
console.log(`\n  ${BLOCOS.length + 1}. ⟵ AQUI a primeira decisão`);
console.log(`\nBLOCOS ATÉ A PRIMEIRA DECISÃO: ${sempre.length} sempre · ${pior} no pior caso (primeiro passo, com retomada e peso estimado)`);

// ── E O CARD DE DECISÃO EM SI: quantas partes antes dos botões?
const ENTRADA = path.join(RAIZ, "ira-decision-tree.ts");
const arv = lerFonte(ENTRADA);
const bloco = arv.slice(arv.indexOf("entry: {"), arv.indexOf("atalhos: {"));
const partes = [];
for (const campo of ["title", "question", "summary"]) if (new RegExp(`${campo}:`).test(bloco)) partes.push(campo);
const evid = (bloco.match(/evidence: \[([\s\S]*?)\]/) ?? [])[1];
const nEvid = evid ? (evid.match(/^\s*"/gm) ?? []).length : 0;
const nOpc = (bloco.match(/\{ id: "/g) ?? []).length;
console.log(`\nDENTRO do card de entrada: ${partes.join(" + ")} + ${nEvid} linha(s) de evidência, antes de ${nOpc} botão(ões)`);
console.log(`\n⚠️ MEDIÇÃO: sem código de saída. Nada foi alterado.\n`);
