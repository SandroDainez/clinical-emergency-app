#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceRequired(file, from, to, label) {
  const full = path.join(root, file);
  let s = fs.readFileSync(full, 'utf8');
  if (!s.includes(from)) throw new Error(`Missing expected text (${label}) in ${file}`);
  s = s.replace(from, to);
  fs.writeFileSync(full, s);
}

replaceRequired(
  'tce-decision-tree.ts',
  '        "Monitorização multimodal quando disponível: saturação venosa jugular acima de 55%, oximetria tissular cerebral acima de 20 mmHg, Doppler transcraniano para autorregulação e vasoespasmo.",',
  '        "Neuromonitorização multimodal quando disponível: usar tendências para complementar PIC, PPC, exame e TC — não como números isolados. A BTF mantém SjvO₂ < 50% como limiar a evitar (Level III); para PbtO₂, a 4ª edição não sustenta um limiar universal de desfecho, embora monitorização de oxigenação cerebral possa revelar hipóxia mesmo com PIC/PPC aparentemente adequadas. PRx, Doppler transcraniano e outras medidas de autorregulação podem ajudar a individualizar a PPC, mas não devem substituir o quadro clínico nem criar alvo automático sem protocolo neurocrítico validado.",',
  'multimodal monitoring'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Se sinais de herniação enquanto aguarda: terapia hiperosmolar e hiperventilação apenas como ponte.",',
  '        "Se sinais de herniação enquanto aguarda: terapia hiperosmolar e hiperventilação apenas como ponte.",\n        "HANDOFF NEUROCIRÚRGICO: informar explicitamente último Glasgow e pupilas, achado e horário da TC, tendência de PAS/PAM e oxigenação, presença/valor e tendência da PIC/PPC quando monitorizadas, anticoagulante/antiagregante e reversão já realizada, última dose/horário de osmoterapia, ventilação/PaCO₂, sedação/BNM, crise/antisseizure e presença/configuração de EVD. Não transferir apenas com o rótulo ‘TCE grave’: o destino precisa receber o estado e as intervenções que mudam a próxima decisão.",',
  'neurosurgical handoff packet'
);

replaceRequired(
  'lib/clinical-transition-contracts.ts',
  '    preserves: ["glasgow", "pupilas", "resultado_tc", "anticoagulacao", "pressao_arterial", "oxigenacao"],',
  '    preserves: [\n      "glasgow",\n      "pupilas",\n      "resultado_tc",\n      "horario_tc",\n      "anticoagulacao",\n      "reversao_antitrombotica",\n      "pressao_arterial",\n      "oxigenacao",\n      "pic_ppc",\n      "osmoterapia_ultima_dose_horario",\n      "ventilacao_paco2",\n      "sedacao_bnm",\n      "crise_antisseizure",\n      "evd_configuracao",\n    ],',
  'terminal neurosurgical preserves'
);

const i18nFile = path.join(root, 'lib/i18n/modules/tce.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor = '\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected tce i18n ending');
const entries = [
  ['Neuromonitorização multimodal quando disponível: usar tendências para complementar PIC, PPC, exame e TC — não como números isolados. A BTF mantém SjvO₂ < 50% como limiar a evitar (Level III); para PbtO₂, a 4ª edição não sustenta um limiar universal de desfecho, embora monitorização de oxigenação cerebral possa revelar hipóxia mesmo com PIC/PPC aparentemente adequadas. PRx, Doppler transcraniano e outras medidas de autorregulação podem ajudar a individualizar a PPC, mas não devem substituir o quadro clínico nem criar alvo automático sem protocolo neurocrítico validado.', 'Neuromonitorización multimodal cuando esté disponible: usar tendencias para complementar PIC, PPC, examen y TC, no como números aislados. La BTF mantiene SjvO₂ < 50% como umbral a evitar (Nivel III); para PbtO₂, la 4.ª edición no respalda un umbral universal de desenlace, aunque la monitorización de oxigenación cerebral puede revelar hipoxia incluso con PIC/PPC aparentemente adecuadas. PRx, Doppler transcraneal y otras medidas de autorregulación pueden ayudar a individualizar la PPC, pero no deben sustituir el cuadro clínico ni crear un objetivo automático sin protocolo neurocrítico validado.'],
  ['HANDOFF NEUROCIRÚRGICO: informar explicitamente último Glasgow e pupilas, achado e horário da TC, tendência de PAS/PAM e oxigenação, presença/valor e tendência da PIC/PPC quando monitorizadas, anticoagulante/antiagregante e reversão já realizada, última dose/horário de osmoterapia, ventilação/PaCO₂, sedação/BNM, crise/antisseizure e presença/configuração de EVD. Não transferir apenas com o rótulo ‘TCE grave’: o destino precisa receber o estado e as intervenções que mudam a próxima decisão.', 'HANDOFF NEUROQUIRÚRGICO: informar explícitamente último Glasgow y pupilas, hallazgo y hora de la TC, tendencia de PAS/PAM y oxigenación, presencia/valor y tendencia de PIC/PPC cuando estén monitorizadas, anticoagulante/antiagregante y reversión ya realizada, última dosis/hora de osmoterapia, ventilación/PaCO₂, sedación/BNM, crisis/antiepiléptico y presencia/configuración de DVE. No transferir solo con la etiqueta “TCE grave”: el destino necesita recibir el estado y las intervenciones que cambian la siguiente decisión.']
];
for (const [pt, es] of entries) {
  if (!i18n.includes(JSON.stringify(pt))) {
    i18n = i18n.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
  }
}
fs.writeFileSync(i18nFile, i18n);
console.log('✅ TCE: neuromonitorização multimodal e pacote de handoff neurocirúrgico reforçados.');
