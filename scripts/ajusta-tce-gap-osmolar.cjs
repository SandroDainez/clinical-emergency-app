const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'tce-decision-tree.ts');
const src = fs.readFileSync(file, 'utf8');

const oldText = 'Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada; ao calcular com ureia total em mg/dL, usar a fórmula compatível com o laboratório local e não confundir ureia com BUN.';
const newText = 'Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada. Quando o laboratório informa UREIA total em mg/dL, osmolaridade calculada ≈ 2 × Na + glicose/18 + ureia/6; se informar BUN, a fórmula é diferente. Não confundir ureia com BUN.';

if (!src.includes(oldText)) throw new Error('Texto esperado do gap osmolar não encontrado; abortando.');
if (src.includes('ureia/6; se informar BUN')) throw new Error('Fórmula já presente; abortando duplicação.');
fs.writeFileSync(file, src.replace(oldText, newText));
console.log('TCE: fórmula explícita do gap osmolar restaurada sem alterar limiares ou dose.');
