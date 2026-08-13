/**
 * test-cronometro-anafilaxia.cjs
 *
 * PROMETE: que o cronômetro de 5 min entre doses IM de adrenalina ARME na
 *   primeira dose documentada, RE-ARME na segunda, e SUMA quando houver infusão
 *   contínua — executando o motor, não lendo o fonte.
 * NÃO PROMETE: que o intervalo de 5 min esteja clinicamente certo, nem que os
 *   outros módulos tenham cronômetro (ver D-16).
 * UNIVERSO: anafilaxia-engine.ts, compilado e executado.
 *
 * ── POR QUE ESTE TESTE EXISTE SEPARADO DA TRAVA DE PRAZOS ───────────────────
 *
 * `test:prazos` confere se o módulo TEM mecanismo de cronometrar, lendo o
 * fonte. Uma mutação mostrou o limite disso: pôr `return []` no início do
 * getTimers desliga o cronômetro e a trava continua verde, porque a palavra
 * `duration:` segue no corpo da função, agora inalcançável.
 *
 * Estrutura se confere lendo; comportamento se confere EXECUTANDO (R-10). Os
 * dois são necessários e nenhum substitui o outro.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cron-anafi-"));

try {
  execFileSync(
    "npx",
    ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
     "--esModuleInterop", "--moduleResolution", "node", "--outDir", tmp,
     path.join(appDir, "anafilaxia-engine.ts")],
    { stdio: "pipe" }
  );
} catch (e) {
  console.error("\n❌ anafilaxia-engine.ts não compila — a conferência do cronômetro não rodou.\n");
  process.exit(1);
}

const mod = require(path.join(tmp, "anafilaxia-engine.js"));
const motor = mod.anafilaxiaEngine || mod.default || mod;

const falhas = [];
let ok = 0;

const conferir = (nome, condicao, obtido) => {
  if (condicao) ok++;
  else falhas.push(`${nome} — obtido: ${JSON.stringify(obtido)}`);
};

conferir("sem dose documentada, não há cronômetro", motor.getTimers().length === 0, motor.getTimers());

motor.updateAuxiliaryField("treatmentAdrenaline", "Adrenalina 0,5 mg IM (1ª dose) vasto lateral");
const t1 = motor.getTimers();
conferir("a 1ª dose IM arma o cronômetro", t1.length === 1, t1);
conferir("o intervalo é de 5 min (300 s)", t1[0] && t1[0].duration === 300, t1);
conferir("o relógio começa cheio e corre", t1[0] && t1[0].remaining > 290 && t1[0].remaining <= 300, t1);

motor.updateAuxiliaryField("secondDoseAction", "2ª dose IM aplicada");
const t2 = motor.getTimers();
conferir("a 2ª dose RE-ARMA o cronômetro", t2[0] && t2[0].remaining > 290, t2);

// Sob infusão contínua a titulação é por resposta, não por intervalo fixo: um
// relógio de 5 min ali passaria a mandar a coisa errada.
motor.updateAuxiliaryField("treatmentAdrenaline", "Adrenalina EV em infusão 0,05 mcg/kg/min");
conferir("com infusão contínua o cronômetro SOME", motor.getTimers().length === 0, motor.getTimers());

console.log(`\nCronômetro da adrenalina IM — comportamento executado\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} falha(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o cronômetro arma, re-arma e some na infusão\n`);
