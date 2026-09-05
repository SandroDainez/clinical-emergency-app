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
  const pt = '⚠️ NA DÚVIDA, NÃO USE A SAÍDA DE BAIXO RISCO/ALTA. Sem dados suficientes para sustentar categoria B e elegibilidade ambulatorial, mantenha o paciente internado e complete a estratificação AHA/ACC 2026 — escore de gravidade, função de VD e biomarcadores — para então definir C1, C2 ou C3 quando aplicável. Mandar para casa antes de fechar essa estratificação é o erro irreversível; internar enquanto esclarece preserva a margem de segurança.';
  const es = '⚠️ ANTE LA DUDA, NO USE LA SALIDA DE BAJO RIESGO/ALTA. Sin datos suficientes para sostener la categoría B y la elegibilidad ambulatoria, mantenga al paciente hospitalizado y complete la estratificación AHA/ACC 2026 — puntuación de gravedad, función del VD y biomarcadores — para entonces definir C1, C2 o C3 cuando corresponda. Dar el alta antes de cerrar esta estratificación es el error irreversible; hospitalizar mientras se aclara preserva el margen de seguridad.';
  if (!s.includes(pt)) {
    const end = '\n};\n';
    if (!s.includes(end)) throw new Error('pr18-convergence: fechamento do dicionário não encontrado');
    const entry = `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n`;
    s = s.replace(end, '\n' + entry + '};\n');
  }
  write(rel, s);
}

console.log('Validadores antigos, órfãos preparados e tradução TEP ajustados em escopo fechado.');
