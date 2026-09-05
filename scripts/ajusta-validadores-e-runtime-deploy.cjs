const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function read(rel) { return fs.readFileSync(path.join(root, rel), 'utf8'); }
function write(rel, s) { fs.writeFileSync(path.join(root, rel), s); }

for (const rel of ['scripts/valida-isr.cjs', 'scripts/valida-traducao-composta.cjs']) {
  let s = read(rel);
  if (!s.includes('"tsc", "--ignoreConfig"')) throw new Error(`${rel}: marcador --ignoreConfig não encontrado`);
  s = s.replace('"tsc", "--ignoreConfig",', '"tsc",');
  write(rel, s);
}

{
  const rel = 'scripts/valida-alcancabilidade.cjs';
  let s = read(rel);
  const anchor = '  "lib/clinical-session-runtime.ts":\n    "reset canônico preparado; RT-SESSION exige definir a ação explícita Novo atendimento antes de conectar",';
  if (!s.includes(anchor)) throw new Error('valida-alcancabilidade: âncora runtime não encontrada');
  const insert = `  "lib/clinical-case-snapshot-contract.ts":\n    "contrato de snapshot preparado e fail-closed; RT-SNAPSHOT só conecta quando todos os stores tiverem export/import canônico",\n  "lib/clinical-temporal-goals.ts":\n    "avaliador temporal preparado; RT-DEBRIEF será consumido pela tela de debrief quando contratos revisados forem expostos no runtime",\n  "lib/clinical-temporal-debrief.ts":\n    "agregador temporal preparado; mesma dívida RT-DEBRIEF, fora do bundle assistencial até a tela consumidora existir",\n`;
  if (!s.includes('"lib/clinical-case-snapshot-contract.ts"')) s = s.replace(anchor, insert + anchor);
  write(rel, s);
}

{
  const rel = 'lib/i18n/modules/pr18-convergence.ts';
  let s = read(rel);
  const entries = [
    [
      '⚠️ NA DÚVIDA, NÃO USE A SAÍDA DE BAIXO RISCO/ALTA. Sem dados suficientes para sustentar categoria B e elegibilidade ambulatorial, mantenha o paciente internado e complete a estratificação AHA/ACC 2026 — escore de gravidade, função de VD e biomarcadores — para então definir C1, C2 ou C3 quando aplicável. Mandar para casa antes de fechar essa estratificação é o erro irreversível; internar enquanto esclarece preserva a margem de segurança.',
      '⚠️ ANTE LA DUDA, NO USE LA SALIDA DE BAJO RIESGO/ALTA. Sin datos suficientes para sostener la categoría B y la elegibilidad ambulatoria, mantenga al paciente hospitalizado y complete la estratificación AHA/ACC 2026 — puntuación de gravedad, función del VD y biomarcadores — para entonces definir C1, C2 o C3 cuando corresponda. Dar el alta antes de cerrar esta estratificación es el error irreversible; hospitalizar mientras se aclara preserva el margen de seguridad.'
    ],
    [
      'Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada. Quando o laboratório informa UREIA total em mg/dL, osmolaridade calculada ≈ 2 × Na + glicose/18 + ureia/6; se informar BUN, a fórmula é diferente. Não confundir ureia com BUN.',
      'Durante el uso de manitol, monitorizar función renal, volemia y carga osmótica. La NCS sugiere usar el GAP OSMOLAR en lugar de un umbral aislado de osmolaridad para acompañar el riesgo de acumulación/lesión renal, pero NO hay evidencia suficiente para un punto de corte obligatorio; 20 mOsm/kg se usa en algunos protocolos, aunque no es un límite validado. Gap = osmolaridad medida − calculada. Cuando el laboratorio informa UREA total en mg/dL, osmolaridad calculada ≈ 2 × Na + glucosa/18 + urea/6; si informa BUN, la fórmula es diferente. No confundir urea con BUN.'
    ],
  ];
  const end = '\n};\n';
  if (!s.includes(end)) throw new Error('pr18-convergence: fechamento do dicionário não encontrado');
  for (const [pt, es] of entries) {
    if (!s.includes(pt)) {
      const entry = `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n`;
      s = s.replace(end, '\n' + entry + '};\n');
    }
  }
  write(rel, s);
}

console.log('Validadores antigos, órfãos preparados e traduções TEP/TCE ajustados em escopo fechado.');
