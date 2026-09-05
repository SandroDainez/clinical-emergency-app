const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'lib', 'alvos-tce.ts');
const src = fs.readFileSync(file, 'utf8');

const oldText = 'HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.';
const newText = 'HIPERVENTILAÇÃO NA HIC REFRATÁRIA — usar apenas como RESGATE, não como rotina. No algoritmo SIBICC, hiperventilação leve com PaCO₂ 32–35 mmHg é opção de tier 2; PaCO₂ 30–32 mmHg aparece apenas no tier 3 e, no algoritmo com monitorização de oxigênio cerebral, somente quando não há hipoxia tecidual cerebral. A LITERATURA ABERTA NÃO SUSTENTA adotar alvo abaixo de 30 mmHg como regra geral de resgate. Evitar PaCO₂ <30 mmHg e NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada. Reavaliar PIC, PPC e oxigenação cerebral quando disponível e reverter a hipocapnia assim que a medida de resgate deixar de ser necessária.';

if (!src.includes(oldText)) throw new Error('Texto esperado de hiperventilação TCE não encontrado; abortando.');
if (src.includes('A LITERATURA ABERTA NÃO SUSTENTA adotar alvo abaixo de 30 mmHg')) throw new Error('Declaração já presente; abortando duplicação.');
fs.writeFileSync(file, src.replace(oldText, newText));
console.log('Declaração explícita de ausência restaurada no conteúdo visível do TCE.');
