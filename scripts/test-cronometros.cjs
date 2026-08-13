/**
 * test-cronometros.cjs
 *
 * PROMETE: que os cronômetros dos TRÊS módulos que os têm ARMEM no evento certo,
 *   RE-ARMEM quando o evento se repete e SUMAM quando deixam de fazer sentido —
 *   executando os motores, não lendo o fonte.
 * NÃO PROMETE: que os intervalos estejam clinicamente certos, nem que os módulos
 *   restantes tenham cronômetro. Faltam três (D-16), e o mais urgente deles —
 *   Convulsões — depende de decisão de arquitetura, porque não tem motor.
 * UNIVERSO: anafilaxia-engine.ts, ventilation-engine.ts e eap-engine.ts,
 *   compilados e executados.
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
const falhas = [];
let ok = 0;

/**
 * Espera de verdade, porque o cronômetro conta com Date.now().
 *
 * ⚠️ SEM ISTO O TESTE DE RE-ARME NÃO VALE NADA. Conferir "remaining > 290" logo
 * depois de mudar o registro passa mesmo que o relógio NÃO tenha re-armado — o
 * primeiro armar foi há milissegundos e o valor ainda está cheio. Uma mutação
 * que removeu o re-arme passou limpa por isso.
 *
 * Com ~1,2 s decorridos, o relógio que NÃO re-armou marca 299 e o que re-armou
 * volta a 300. A diferença de um segundo é o que separa os dois casos.
 */
function esperar(ms) {
  const ate = Date.now() + ms;
  while (Date.now() < ate) { /* ocupado de propósito: precisa ser tempo real */ }
}

const conferir = (nome, condicao, obtido) => {
  if (condicao) ok++;
  else falhas.push(`${nome} — obtido: ${JSON.stringify(obtido)}`);
};

function carregar(arquivo) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cron-"));
  try {
    execFileSync(
      "npx",
      ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
       "--esModuleInterop", "--moduleResolution", "node", "--outDir", tmp,
       path.join(appDir, arquivo)],
      { stdio: "pipe" }
    );
  } catch (e) {
    falhas.push(`${arquivo} não compila — a conferência do cronômetro não rodou.`);
    return null;
  }
  const mod = require(path.join(tmp, arquivo.replace(/\.ts$/, ".js")));
  return mod.anafilaxiaEngine || mod.ventilationEngine || mod.eapEngine || mod.default || mod;
}

// ══ ANAFILAXIA — 5 min entre doses IM de adrenalina ════════════════════════
{
  const motor = carregar("anafilaxia-engine.ts");
  if (motor) {
    conferir("anafilaxia · sem dose documentada, não há cronômetro", motor.getTimers().length === 0, motor.getTimers());
    motor.updateAuxiliaryField("treatmentAdrenaline", "Adrenalina 0,5 mg IM (1ª dose) vasto lateral");
    const t1 = motor.getTimers();
    conferir("anafilaxia · a 1ª dose IM arma", t1.length === 1, t1);
    conferir("anafilaxia · o intervalo é 5 min", t1[0] && t1[0].duration === 300, t1);
    conferir("anafilaxia · o relógio corre", t1[0] && t1[0].remaining > 290 && t1[0].remaining <= 300, t1);
    esperar(1200);
    const antes = motor.getTimers()[0].remaining;
    conferir("anafilaxia · o relógio efetivamente ANDOU", antes < 300, antes);
    motor.updateAuxiliaryField("secondDoseAction", "2ª dose IM aplicada");
    const depois = motor.getTimers()[0].remaining;
    conferir("anafilaxia · a 2ª dose RE-ARMA (volta ao cheio)", depois === 300 && depois > antes, { antes, depois });
    motor.updateAuxiliaryField("treatmentAdrenaline", "Adrenalina EV em infusão 0,05 mcg/kg/min");
    conferir("anafilaxia · com infusão contínua SOME", motor.getTimers().length === 0, motor.getTimers());
  }
}

// ══ EAP — 5 min entre passos de titulação da nitroglicerina ════════════════
{
  const motor = carregar("eap-engine.ts");
  if (motor) {
    conferir("eap · sem vasodilatador registrado, não há cronômetro", motor.getTimers().length === 0, motor.getTimers());
    motor.updateAuxiliaryField("treatmentDone", "Nitroglicerina IV 10 mcg/min iniciada");
    const t = motor.getTimers();
    conferir("eap · registrar a nitroglicerina arma", t.length === 1, t);
    conferir("eap · o intervalo é 5 min", t[0] && t[0].duration === 300, t);
    esperar(1200);
    const antes = motor.getTimers()[0].remaining;
    conferir("eap · o relógio efetivamente ANDOU", antes < 300, antes);
    motor.updateAuxiliaryField("treatmentDone", "Nitroglicerina IV 20 mcg/min após titulação");
    const depois = motor.getTimers()[0].remaining;
    conferir("eap · mudar o registro RE-ARMA (volta ao cheio)", depois === 300 && depois > antes, { antes, depois });
    motor.updateAuxiliaryField("treatmentDone", "VNI e furosemida; sem vasodilatador");
    conferir("eap · sem a droga o cronômetro SOME", motor.getTimers().length === 0, motor.getTimers());
  }
}

// ══ VENTILAÇÃO — 30 min até a gasometria de controle ═══════════════════════
//
// O marco é o registro de uma gasometria, que já existia como evento no motor.
{
  const motor = carregar("ventilation-engine.ts");
  if (motor) {
    conferir("ventilação · sem gasometria registrada, não há cronômetro", motor.getTimers().length === 0, motor.getTimers());
    // O registro entra por ação, não por campo — o motor expõe registerExecution.
    if (typeof motor.runAuxiliaryAction === "function") {
      motor.runAuxiliaryAction("record_gasometry_snapshot");
      const t = motor.getTimers();
      conferir("ventilação · registrar gasometria arma", t.length === 1, t);
      conferir("ventilação · o intervalo é 30 min", t[0] && t[0].duration === 1800, t);
    } else {
      falhas.push("ventilação · não achei runAuxiliaryAction — a conferência do marco não rodou.");
    }
  }
}

console.log(`\nCronômetros — comportamento executado nos módulos que os têm\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} falha(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — os três cronômetros armam, re-armam e somem quando devem\n`);
