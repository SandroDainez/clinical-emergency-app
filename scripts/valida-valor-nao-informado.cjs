#!/usr/bin/env node
/**
 * PROMETE: que a exibição de campo numérico reflita o ESTADO REAL do motor —
 *   que o `NumericStepper` saiba dizer "não informado", que o shell marque
 *   isso exatamente quando o campo é opcional e o motor está vazio, e que
 *   soltar a barra sem mover também grave (via `onConfirmar`).
 * NÃO PROMETE: o comportamento renderizado — isso é
 *   `e2e/valor-nao-informado.spec.ts`, que exercita o app de verdade. Esta
 *   trava é ESTRUTURAL e cobre justamente o caso que o e2e não consegue
 *   reproduzir no web (soltar a barra sem movimento).
 * UNIVERSO: components/ui-v2/numeric-stepper.tsx e o shell de fluxo.
 *
 * ── O DEFEITO, MEDIDO (2026-08-25) ──────────────────────────────────────────
 *
 * A barra parte do meio da faixa e imprimia esse número em tipo grande antes de
 * qualquer toque. Em campo OBRIGATÓRIO isso nunca apareceu — o botão de avançar
 * trava até informar. Em campo OPCIONAL, que a Tela 1 da SCA introduziu, a tela
 * dizia "Peso 140 kg" com o motor VAZIO.
 *
 * ⚠️ E PESO ALIMENTA DOSE: tenecteplase e enoxaparina são por quilo. Um número
 * que parece confirmado sem ninguém ter medido é a semente de uma dose errada
 * três telas adiante.
 */

const fs = require("node:fs");
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

// ⚠️ `lerFonte`, NÃO `readFileSync`: comentário não renderiza nada, e estes
// dois arquivos comentam a própria correção em detalhe. Lendo cru, cada regra
// abaixo casaria com o texto do comentário que a explica — a trava passaria
// verde mesmo com a correção removida da tela. Foi assim que ela nasceu, e o
// validador de leitura crua a reprovou.
const stepper = lerFonte(path.join(appDir, "components", "ui-v2", "numeric-stepper.tsx"));
const shell = lerFonte(
  path.join(appDir, "components", "protocol-screen", "acls-decision-flow-screen.tsx")
);

const REGRAS = [
  [stepper, /naoInformado\?: boolean/, "o `NumericStepper` declara `naoInformado`",
   "sem a prop, o componente não tem como distinguir ausência de medida de medida igual ao padrão"],
  [stepper, /naoInformado \? textoAusente :/, "o stepper exibe o texto de ausência, não o número",
   "voltar a imprimir o número de partida faz um valor que ninguém mediu parecer confirmado"],
  [stepper, /textoAusente = "—"/, "o texto de ausência tem padrão neutro",
   "sem padrão, um chamador que esqueça a prop imprimiria `undefined` na tela"],
  [stepper, /valorAusente: \{ \.\.\.TIPOGRAFIA\.body/, "a ausência usa corpo de texto, não a display",
   "na validação visual o `—` em fonte display virou uma barra branca grossa e lia-se como divisória " +
   "gráfica, não como campo por preencher"],
  [shell, /textoAusente=\{tr\(/, "o shell passa o texto de ausência traduzido",
   "o `NumericStepper` é ui-v2 puro e não traduz; frase escrita lá dentro ficaria em português na " +
   "tela em espanhol"],
  [stepper, /unidade && !naoInformado \?/, "a unidade some junto com o número",
   '"— kg" sugere que existe um número em kg em algum lugar; o que existe é a ausência dele'],
  [shell, /naoInformado=\{!!field\.optional && current === undefined\}/,
   "o shell marca não-informado só em campo OPCIONAL e vazio",
   "em campo obrigatório o botão já trava até informar — trocar o número por `—` ali só tiraria a " +
   "referência de onde a barra está, sem resolver ambiguidade nenhuma"],
];

for (const [fonte, padrao, nome, porque] of REGRAS) {
  if (!padrao.test(fonte)) falhas.push(`${nome}: sumiu — ${porque}.`);
  else ok++;
}

// ── O caso que o e2e não alcança ───────────────────────────────────────────
//
// ⚠️ ESTA É A ÚNICA COBERTURA DE "SOLTAR A BARRA SEM MOVER", e por isso ela é
// explícita. O Slider só emite `onValueChange` quando o número MUDA; sem
// `onConfirmar` ligado a uma gravação, o médico de 140 kg que solta a barra
// exatamente em 140 ficaria com o campo em "—" para sempre — a tela pareceria
// quebrada, e a correção do `—` viraria um beco.
{
  const m = shell.match(/onConfirmar=\{\(n\) => \{([\s\S]{0,220}?)\}\}/);
  if (!m) {
    falhas.push(
      "o shell não liga `onConfirmar` no NumericStepper.\n" +
      "      ⚠️ Sem ele, soltar a barra no valor de partida não grava nada e o campo fica em `—` " +
      "para sempre — o defeito irmão do que a correção fechou."
    );
  } else if (!/onSetValue\(field\.id, String\(n\)\)/.test(m[1])) {
    falhas.push(
      "`onConfirmar` existe mas não grava o valor.\n" +
      "      ⚠️ Um manipulador vazio passa por qualquer conferência de presença e não faz nada."
    );
  } else ok++;
}

// ── Vacuidade ──────────────────────────────────────────────────────────────
if (stepper.length < 2000 || shell.length < 10000) {
  falhas.push("os arquivos lidos são pequenos demais — a trava pode ter rodado sobre nada (R-15 item 9).");
}

console.log("\nValor não informado — a tela não pode inventar um número\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — nenhum número aparece antes de alguém informá-lo\n`);
process.exit(0);
