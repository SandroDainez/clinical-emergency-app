const fs = require('node:fs');
const path = require('node:path');

const alvosFile = path.resolve(__dirname, '..', 'lib', 'alvos-tce.ts');
const i18nFile = path.resolve(__dirname, '..', 'lib', 'i18n', 'modules', 'tce-alvos.ts');
let alvos = fs.readFileSync(alvosFile, 'utf8');
let i18n = fs.readFileSync(i18nFile, 'utf8');

const oldText = 'HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.';
const newText = 'HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. A LITERATURA ABERTA NÃO SUSTENTA adotar alvo abaixo de 30 mmHg como regra geral de resgate. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.';
const esText = 'HIPERVENTILACIÓN EN LA HIC REFRACTARIA — usar solo como RESCATE, no como rutina. En el algoritmo SIBICC, la hiperventilación leve con PaCO₂ 32–35 mmHg es una opción de tier 2; PaCO₂ 30–32 mmHg aparece solo en tier 3 y, en el algoritmo con monitorización de oxígeno cerebral, únicamente cuando no hay hipoxia tisular cerebral. LA LITERATURA ABIERTA NO RESPALDA adoptar un objetivo por debajo de 30 mmHg como regla general de rescate. Evitar PaCO₂ <30 mmHg y NO usar PaCO₂ ≤25 mmHg de forma profiláctica o prolongada. Reevaluar PIC, PPC y oxigenación cerebral cuando esté disponible y revertir la hipocapnia tan pronto como la medida de rescate deje de ser necesaria.';

if (!alvos.includes(oldText)) throw new Error('Texto esperado de hiperventilação TCE não encontrado; abortando.');
if (alvos.includes('A LITERATURA ABERTA NÃO SUSTENTA adotar alvo abaixo de 30 mmHg')) throw new Error('Declaração já presente; abortando duplicação.');
alvos = alvos.replace(oldText, newText);

const key = `  ${JSON.stringify(newText)}:`;
if (!i18n.includes(key)) {
  const close = i18n.lastIndexOf('\n};');
  if (close < 0) throw new Error('Fechamento do dicionário tceAlvosEs não encontrado');
  i18n = `${i18n.slice(0, close)}\n\n  ${JSON.stringify(newText)}:\n    ${JSON.stringify(esText)},${i18n.slice(close)}`;
}

fs.writeFileSync(alvosFile, alvos);
fs.writeFileSync(i18nFile, i18n);
console.log('TCE: declaração explícita de ausência e tradução ES atualizadas juntas.');
