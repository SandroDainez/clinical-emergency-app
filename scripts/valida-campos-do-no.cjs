#!/usr/bin/env node
/**
 * PROMETE: que todo campo de TEXTO que um nó de árvore pode ter esteja
 * classificado — VISÍVEL, RECOLHIDO ou METADADO NÃO RENDERIZADO — e que os
 * campos recolhidos sejam vigiados por `test:prazo-visivel`.
 * NÃO PROMETE: que o conteúdo esteja no campo certo. Isso é decisão clínica.
 * UNIVERSO: campos textuais declarados nos tipos de nó em
 * `core/decision-tree/types.ts` e sua classificação nas listas deste script.
 */
const fs = require("fs");
const path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const falhas = [];
let ok = 0;

const VISIVEIS = ["title", "summary", "question", "intro", "actions", "exitCriteria", "label", "customLabel"];
const RECOLHIDOS = ["evidence", "porque"];
// IDs/ponteiros de motor não são conteúdo textual apresentado ao usuário. Eles
// são classificados explicitamente aqui para que um campo novo não passe no
// silêncio, sem forçar metadata a fingir que é texto de tela.
const METADADOS = [
  "id", "type", "kind", "unit", "value",
  "guidedDiscoveryOrigin", "clinicalActionId",
];

const tipos = lerFonte(path.join(appDir, "core/decision-tree/types.ts"));

{
  const BLOCOS = ["BaseNode = {", "DecisionNode = BaseNode & {", "ActionNode = BaseNode & {",
    "TransitionNode = BaseNode & {", "InputNode = BaseNode & {"];
  const declarados = new Set();
  for (const marca of BLOCOS) {
    const i = tipos.indexOf(marca);
    if (i < 0) continue;
    const bloco = tipos.slice(i, tipos.indexOf("\n};", i));
    for (const m of bloco.matchAll(/^\s{2}(\w+)\??:\s*(string\[\]|string);/gm)) declarados.add(m[1]);
  }

  if (declarados.size < 8) {
    console.log(`\n❌ só ${declarados.size} campos de texto lidos do tipo — o parser quebrou\n`);
    process.exit(1);
  }

  const semClasse = [...declarados].filter(
    (c) => !VISIVEIS.includes(c) && !RECOLHIDOS.includes(c) && !METADADOS.includes(c)
  );
  if (semClasse.length) {
    falhas.push(
      `${semClasse.length} campo(s) de texto do nó SEM classificação: ${semClasse.join(", ")}.\n` +
      `      ⚠️ Classifique como VISÍVEL, RECOLHIDO ou METADADO NÃO RENDERIZADO.\n` +
      `      Se for RECOLHIDO, acrescente também em valida-prazo-visivel.`
    );
  } else ok++;
}

{
  const prazo = lerFonte(path.join(appDir, "scripts/valida-prazo-visivel.cjs"));
  const desvigiados = RECOLHIDOS.filter((c) => !new RegExp(`n\\.${c}\\s*\\?\\?`).test(prazo));
  if (desvigiados.length) {
    falhas.push(
      `${desvigiados.length} campo(s) recolhido(s) que \`valida-prazo-visivel\` NÃO lê: ${desvigiados.join(", ")}.\n` +
      `      ⚠️ Prazo escondido é a única classe cujo custo é IRREVERSÍVEL — quem não viu perdeu a janela.`
    );
  } else ok++;
}

console.log("\nTodo campo textual do nó é conhecido, e o que esconde conteúdo é vigiado\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${VISIVEIS.length} visíveis, ${RECOLHIDOS.length} recolhidos, ${METADADOS.length} metadados classificados\n`);
process.exit(0);
