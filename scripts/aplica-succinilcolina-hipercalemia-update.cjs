#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, "utf8");
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

const oldSed = "CONTRAINDICAÇÕES ABSOLUTAS (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna pessoal ou familiar; pseudocolinesterase atípica OU inibição adquirida da colinesterase (organofosforado); trauma ocular aberto.";
const newSed = "CONTRAINDICAÇÕES IMPORTANTES (usar rocurônio quando presentes): hipercalemia conhecida ou suspeita clinicamente relevante — não usar um corte isolado de K⁺ como regra universal; após a fase aguda de queimadura grave, trauma múltiplo, denervação/lesão de neurônio motor superior ou imobilização prolongada, pelo risco de hipercalemia grave; rabdomiólise/esmagamento; miopatias/distrofias musculares e miotonias; suscetibilidade pessoal ou familiar à hipertermia maligna; pseudocolinesterase atípica OU inibição adquirida da colinesterase (organofosforado — risco de bloqueio prolongado); trauma ocular aberto/franca perfuração ocular — preferir bloqueador não despolarizante.";
replaceOnce("sedation-engine.ts", "sedation-succinylcholine-risk", oldSed, newSed);

const oldRsi = "Contraindicações ABSOLUTAS da succinilcolina (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna (pessoal/familiar); pseudocolinesterase atípica OU inibição adquirida da colinesterase (intoxicação por organofosforado — bloqueio prolongado); trauma ocular aberto.";
const newRsi = "Contraindicações importantes da succinilcolina (usar rocurônio quando presentes): hipercalemia conhecida ou suspeita clinicamente relevante — não usar K⁺ > 5,5 como corte universal; após a fase aguda de queimadura grave, trauma múltiplo, denervação/lesão de neurônio motor superior ou imobilização prolongada, pelo risco de hipercalemia grave; rabdomiólise/esmagamento; miopatias/distrofias musculares e miotonias; suscetibilidade pessoal/familiar à hipertermia maligna; pseudocolinesterase atípica OU inibição adquirida da colinesterase (intoxicação por organofosforado — bloqueio prolongado); trauma ocular aberto/franca perfuração ocular — preferir bloqueador não despolarizante.";
replaceOnce("rsi-decision-tree.ts", "rsi-succinylcholine-risk", oldRsi, newRsi);

const oldSedI18n = `  "${oldSed}": "CONTRAINDICACIONES ABSOLUTAS (usar rocuronio): hipercalemia (K⁺ > 5,5) o riesgo; quemadura grave > 24 h hasta 1 año; inmovilización prolongada > 48–72 h (TCE, ACV, lesión medular); rabdomiólisis/aplastamiento; distrofias musculares (Duchenne/Becker); miotonía; hipertermia maligna personal o familiar; pseudocolinesterasa atípica O inhibición adquirida de la colinesterasa (organofosforado); trauma ocular abierto.",`;
const newSedI18n = `  "${newSed}": "CONTRAINDICACIONES IMPORTANTES (usar rocuronio cuando estén presentes): hiperpotasemia conocida o sospechada clínicamente relevante — no usar un punto de corte aislado de K⁺ como regla universal; tras la fase aguda de quemadura grave, traumatismo múltiple, denervación/lesión de neurona motora superior o inmovilización prolongada, por riesgo de hiperpotasemia grave; rabdomiólisis/aplastamiento; miopatías/distrofias musculares y miotonías; susceptibilidad personal o familiar a hipertermia maligna; seudocolinesterasa atípica O inhibición adquirida de colinesterasa (organofosforados — riesgo de bloqueo prolongado); trauma ocular abierto/perforación ocular franca — preferir bloqueante no despolarizante.",`;
replaceOnce("lib/i18n/modules/sedacao.ts", "sedacao-i18n-succinylcholine", oldSedI18n, newSedI18n);

const oldRsiI18nStart = '  "Contraindicações ABSOLUTAS da succinilcolina (usar rocurônio): hipercalemia (K⁺ > 5,5) ou risco; queimadura grave > 24 h até 1 ano; imobilização prolongada > 48–72 h (TCE, AVC, lesão medular); rabdomiólise/esmagamento; distrofias musculares (Duchenne/Becker); miotonia; hipertermia maligna (pessoal/familiar); pseudocolinesterase atípica; trauma ocular aberto.":\n    "Contraindicaciones ABSOLUTAS de la succinilcolina (usar rocuronio): hiperpotasemia (K⁺ > 5,5) o riesgo de ella; quemadura grave de > 24 h hasta 1 año; inmovilización prolongada > 48–72 h (TCE, ACV, lesión medular); rabdomiólisis/aplastamiento; distrofias musculares (Duchenne/Becker); miotonía; hipertermia maligna (personal/familiar); seudocolinesterasa atípica; trauma ocular abierto.",';
const newRsiI18n = `  "${newRsi}":\n    "Contraindicaciones importantes de la succinilcolina (usar rocuronio cuando estén presentes): hiperpotasemia conocida o sospechada clínicamente relevante — no usar K⁺ > 5,5 como punto de corte universal; tras la fase aguda de quemadura grave, traumatismo múltiple, denervación/lesión de neurona motora superior o inmovilización prolongada, por riesgo de hiperpotasemia grave; rabdomiólisis/aplastamiento; miopatías/distrofias musculares y miotonías; susceptibilidad personal/familiar a hipertermia maligna; seudocolinesterasa atípica O inhibición adquirida de colinesterasa (intoxicación por organofosforados — bloqueo prolongado); trauma ocular abierto/perforación ocular franca — preferir bloqueante no despolarizante.",`;
replaceOnce("lib/i18n/modules/isr.ts", "isr-i18n-succinylcholine", oldRsiI18nStart, newRsiI18n);

// Remove two stale etomidate translation keys left behind by the already validated engine migration.
replaceOnce(
  "lib/i18n/modules/sedacao.ts",
  "etomidate-i18n-dose",
  '  "Dose PLENA também no instável: é o indutor hemodinamicamente neutro, e reduzi-lo perde justamente a vantagem.": "Dosis PLENA también en el inestable: es el inductor hemodinámicamente neutro, y reducirlo pierde justamente la ventaja.",',
  '  "ISR em adulto crítico: 0,2–0,3 mg/kg IV é faixa usada em estudos; o default deste módulo permanece 0,3 mg/kg. Não reduzir automaticamente apenas pela instabilidade, mas individualizar conforme idade, reserva fisiológica e fármacos concomitantes.": "ISR en el adulto crítico: 0,2–0,3 mg/kg IV es un rango utilizado en estudios; el valor predeterminado de este módulo sigue siendo 0,3 mg/kg. No reducir automáticamente solo por la inestabilidad; individualizar según edad, reserva fisiológica y fármacos concomitantes.",'
);
replaceOnce(
  "lib/i18n/modules/sedacao.ts",
  "etomidate-i18n-ampoules",
  '  "Dose máxima usual: não exceder ~3 ampolas (30 mL) no adulto.": "Dosis máxima habitual: no exceder ~3 ampollas (30 mL) en el adulto.",',
  '  "Evitar limites por número de ampolas: a dose deve permanecer baseada em mg/kg e individualização clínica; a bula descreve 0,2–0,6 mg/kg para indução, com 0,3 mg/kg como dose usual.": "Evitar límites por número de ampollas: la dosis debe mantenerse basada en mg/kg e individualización clínica; la ficha técnica describe 0,2–0,6 mg/kg para inducción, con 0,3 mg/kg como dosis habitual.",'
);

console.log("✅ Succinilcolina: removido corte universal K⁺ > 5,5; risco contextual alinhado em Sedoanalgesia, ISR e traduções. Traduções do etomidato também sincronizadas.");
