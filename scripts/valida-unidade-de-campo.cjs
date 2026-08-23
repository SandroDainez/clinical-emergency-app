#!/usr/bin/env node
/**
 * PROMETE: que todo campo de entrada numérica declare a unidade NO CAMPO, e que
 *   o rótulo exibido seja DERIVADO dela — nunca a fonte dela.
 * NÃO PROMETE: que a unidade declarada seja a certa para a grandeza. Ela garante
 *   que existe e que a prosa não a contradiz — não que "mEq/L" seja o correto
 *   para aquele analito.
 * UNIVERSO: os campos `kind: "number"` das calculadoras + as chamadas de
 *   `input(...)` da tela dos eletrólitos, contados antes do resultado.
 * ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23) — R-118, R-119.
 *
 * ── ⚠️ UNIDADE EM PROSA É TRADUZÍVEL; UNIDADE EM CAMPO, NÃO ─────────────────
 *
 * O app tem uma segunda cópia de todo texto em espanhol. Uma tradução que
 * escreva "Peso (lb)" — por descuido ou por convenção local — **muda a unidade
 * de entrada de um cálculo, e nenhum instrumento vê**, porque para eles aquilo é
 * só prosa.
 *
 * Não aconteceu. Mas é o MESMO MECANISMO do D-80, em que o critério da
 * hidrocortisona de fato divergiu entre os idiomas. Ali era conduta; aqui seria
 * unidade de dose.
 */
const fs = require("fs"), path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
const CALCS = path.join(RAIZ, "clinical-calculators-engine.ts");
const TELA = path.join(RAIZ, "components", "protocol-screen", "electrolyte-calculator-screen.tsx");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

// ── 1. TODO CAMPO DE CALCULADORA DECLARA UNIDADE
const calcs = lerFonte(CALCS);
let campos = 0, semUnidade = 0;
for (const m of calcs.matchAll(/\{[^{}]*kind:\s*"number"[^{}]*\}/g)) {
  const bloco = m[0];
  const id = (bloco.match(/id:\s*"([^"]+)"/) ?? [])[1];
  if (!id) continue; // a declaração de TIPO não é um campo
  campos++;
  if (!/unit:\s*"/.test(bloco)) {
    semUnidade++;
    erro(`campo « ${id} » sem unidade declarada. ⚠️ Se a grandeza não tem unidade, isso se DIZ: "adimensional" (pH) ou "pontos" (escore). "Sem unidade" e "adimensional" não podem ser a mesma coisa no dado, senão o instrumento nunca distingue esquecimento de propriedade.`);
  }
}

// ── 2. A TELA NÃO PODE PÔR UNIDADE NO RÓTULO EM PROSA
//
// ⚠️ ESTA É A METADE QUE PEGA A MUTAÇÃO DA PROSA: mudar a unidade só no texto,
// deixando o campo, é invisível para tudo — menos para isto.
const tela = lerFonte(TELA);
const UNIDADE_EM_PROSA = /input\(\s*"([^"]*\((?:mg\/dL|mEq\/L|mmol\/L|g\/dL|kg|lb|mL|h|UI|%|mmHg)\)[^"]*)"/g;
let emProsa = 0;
for (const m of tela.matchAll(UNIDADE_EM_PROSA)) {
  emProsa++;
  erro(`a tela declara « ${m[1]} » com a unidade DENTRO DO RÓTULO. A unidade é do CAMPO, e o rótulo é derivado dela — em prosa ela é traduzível, e uma tradução pode virar "(lb)" sem nada perceber.`);
}

// ── 3. E O RÓTULO É MESMO DERIVADO — não montado à mão ao lado do campo
let chamadas = 0;
for (const m of tela.matchAll(/input\(\s*[^,]+,\s*([^,]+),/g)) {
  chamadas++;
  const segundo = m[1].trim();
  // o 2º argumento tem de ser a unidade: literal, cast, ou variável de unidade
  if (!/^"[^"]+"$/.test(segundo) && !/Unit|unidade|UnidadeDeCampo/.test(segundo))
    erro(`chamada de input com segundo argumento « ${segundo} » — a assinatura exige a UNIDADE no segundo lugar, para que ela não possa ser esquecida`);
}
if (!/rotuloComUnidade\(/.test(tela))
  erro("a tela não deriva o rótulo por `rotuloComUnidade` — o texto voltou a ser a fonte da unidade");

console.log(`\nUNIVERSO: ${campos} campo(s) de calculadora · ${chamadas} chamada(s) de input na tela dos eletrólitos`);
console.log(falhas
  ? `\n❌ ${falhas} falha(s) — ${semUnidade} sem unidade · ${emProsa} com a unidade só na prosa`
  : `\n✅ ${campos} campos com unidade declarada · nenhuma unidade escondida no rótulo · o rótulo é derivado do campo`);
process.exit(falhas ? 1 : 0);
