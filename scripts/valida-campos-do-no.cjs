#!/usr/bin/env node
/**
 * PROMETE: que todo campo de TEXTO que um nó de árvore pode ter esteja
 *   classificado — VISÍVEL (a tela mostra sem toque) ou RECOLHIDO (atrás de um
 *   toque) — e que os campos recolhidos sejam vigiados por `test:prazo-visivel`.
 *
 * NÃO PROMETE: que o conteúdo esteja no campo certo. Isso é decisão clínica.
 *   Só que nenhum campo exista sem que alguém saiba que ele existe.
 *
 * UNIVERSO: o tipo `DecisionTreeNode` em core/decision-tree/types.ts e as
 *   árvores compiladas — os campos são derivados dos DOIS, para que um campo
 *   declarado e nunca usado, ou usado e nunca declarado, apareça.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ─────────────────────────────────
 *
 * `porque` nasceu neste dia, para receber o texto que sai da tela dos passos de
 * ação. Antes de escrevê-lo, o levantamento perguntou quais travas leem nós:
 *
 *     17 derivam do objeto (`textosDoNo`) → enxergam campo novo sozinhas
 *      7 leem CAMPO A CAMPO              → cegas para campo novo
 *
 * E entre as sete estava `valida-prazo-visivel` — a trava que existe justamente
 * para impedir que um PRAZO fique atrás de um toque. Um campo novo feito para
 * esconder texto, invisível para a trava que vigia texto escondido: o pior par
 * possível, e ele só apareceu porque o campo foi levantado antes de ser escrito.
 *
 * Esta trava existe para que o PRÓXIMO campo não dependa de alguém lembrar.
 */
const fs = require("fs");
const path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const falhas = [];
let ok = 0;

/**
 * A classificação. Campo de texto novo REPROVA até entrar numa das listas —
 * e entrar em RECOLHIDOS obriga `valida-prazo-visivel` a conhecê-lo.
 */
const VISIVEIS = ["title", "summary", "question", "intro", "actions", "exitCriteria", "label", "customLabel"];
const RECOLHIDOS = ["evidence", "porque"];

const tipos = lerFonte(path.join(appDir, "core/decision-tree/types.ts"));

// ── 1. Todo campo de texto do tipo está classificado ───────────────────────
{
  // ⚠️ O UNIVERSO SÃO OS QUATRO TIPOS DE NÓ, não o arquivo inteiro.
  //
  // A primeira versão varria todas as declarações `campo: string` do arquivo e
  // acusou 16 — porque `Prazo`, `TransitionTarget`, `InputField` e os eventos de
  // telemetria também moram ali, e nenhum deles é campo de nó. Trava que mede
  // além do que promete cria trabalho falso e ensina a ignorar o alerta.
  const BLOCOS = ["BaseNode = {", "DecisionNode = BaseNode & {", "ActionNode = BaseNode & {",
    "TransitionNode = BaseNode & {", "InputNode = BaseNode & {"];
  const declarados = new Set();
  for (const marca of BLOCOS) {
    const i = tipos.indexOf(marca);
    if (i < 0) continue;
    const bloco = tipos.slice(i, tipos.indexOf("\n};", i));
    for (const m of bloco.matchAll(/^\s{2}(\w+)\??:\s*(string\[\]|string);/gm)) declarados.add(m[1]);
  }

  // ⚠️ VACUIDADE (R-15 item 9): parser quebrado aprovaria tudo.
  if (declarados.size < 8) {
    console.log(`\n❌ só ${declarados.size} campos de texto lidos do tipo — o parser quebrou\n`);
    process.exit(1);
  }

  const semClasse = [...declarados].filter(
    (c) => !VISIVEIS.includes(c) && !RECOLHIDOS.includes(c) && !["id", "type", "kind", "unit", "value"].includes(c)
  );
  if (semClasse.length) {
    falhas.push(
      `${semClasse.length} campo(s) de texto do nó SEM classificação: ${semClasse.join(", ")}.\n` +
      `      ⚠️ Classifique em VISIVEIS (a tela mostra) ou RECOLHIDOS (atrás de um toque),\n` +
      `      nesta trava. Se for RECOLHIDO, acrescente também em valida-prazo-visivel —\n` +
      `      campo que esconde texto sem trava que o vigie é conteúdo sem guarda.`
    );
  } else ok++;
}

// ── 2. Todo campo RECOLHIDO é vigiado por valida-prazo-visivel ─────────────
{
  const prazo = lerFonte(path.join(appDir, "scripts/valida-prazo-visivel.cjs"));
  const desvigiados = RECOLHIDOS.filter((c) => !new RegExp(`n\\.${c}\\s*\\?\\?`).test(prazo));
  if (desvigiados.length) {
    falhas.push(
      `${desvigiados.length} campo(s) recolhido(s) que \`valida-prazo-visivel\` NÃO lê: ${desvigiados.join(", ")}.\n` +
      `      ⚠️ Prazo escondido é a única classe cujo custo é IRREVERSÍVEL — quem não viu\n` +
      `      perdeu a janela. Um campo recolhido fora daquela varredura é uma porta aberta.`
    );
  } else ok++;
}

console.log("\nTodo campo de texto do nó é conhecido, e o que esconde é vigiado\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${VISIVEIS.length} campos visíveis, ${RECOLHIDOS.length} recolhidos, todos vigiados\n`);
process.exit(0);
