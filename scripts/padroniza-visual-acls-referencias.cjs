const fs = require('fs');

const files = [
  'components/protocol-screen/acls-choking-screen.tsx',
  'components/protocol-screen/acls-pregnancy-screen.tsx',
];

function addImport(src, file) {
  if (src.includes('TIPOGRAFIA, RAIO, SOMBRA, TEMAS')) return src;
  const anchor = 'import { useTr } from "../../lib/use-tr";';
  if (!src.includes(anchor)) throw new Error(`${file}: âncora de import ausente`);
  return src.replace(
    anchor,
    `${anchor}\nimport { TIPOGRAFIA, RAIO, SOMBRA, TEMAS } from "../../design-system/tokens";`
  );
}

function normalizeStyles(src, marker, file) {
  const index = src.indexOf(marker);
  if (index < 0) throw new Error(`${file}: StyleSheet não encontrado`);
  const head = src.slice(0, index);
  let styles = src.slice(index);
  const C = 'TEMAS.escuro.cores';

  const literalMap = new Map([
    ['"#292e38"', `${C}.bg`],
    ['"#383e4a"', `${C}.surface`],
    ['"#2f3540"', `${C}.surface`],
    ['"#0f172a"', `${C}.surface`],
    ['"#3a2f2a"', `${C}.surface`],
    ['"#565e6c"', `${C}.border`],
    ['"#1e293b"', `${C}.border`],
    ['"#f1f5f9"', `${C}.text`],
    ['"#e7d9d2"', `${C}.text`],
    ['"#aab6c6"', `${C}.textSecondary`],
    ['"#7fb3ff"', `${C}.primary`],
    ['"#1d4ed8"', `${C}.primary`],
    ['"#c2410c"', `${C}.warning`],
    ['"#1d2939"', `${C}.onPrimary`],
    ['"#000"', 'SOMBRA.shadowColor'],
  ]);

  for (const [before, after] of literalMap) styles = styles.split(before).join(after);

  styles = styles
    .replace(/borderRadius: 24/g, 'borderRadius: RAIO.card')
    .replace(/borderRadius: 18/g, 'borderRadius: RAIO.card')
    .replace(/borderRadius: 16/g, 'borderRadius: RAIO.card')
    .replace(/borderRadius: 14/g, 'borderRadius: RAIO.input')
    .replace(/borderRadius: 12/g, 'borderRadius: RAIO.input')
    .replace(/borderRadius: 9/g, 'borderRadius: RAIO.botao')
    .replace(/borderRadius: 8/g, 'borderRadius: RAIO.botao')
    .replace(/borderRadius: 7/g, 'borderRadius: RAIO.botao');

  styles = styles
    .replace(/fontSize: 9,/g, 'fontSize: TIPOGRAFIA.micro.fontSize,')
    .replace(/fontSize: 10,/g, 'fontSize: TIPOGRAFIA.micro.fontSize,')
    .replace(/fontSize: 11,/g, 'fontSize: TIPOGRAFIA.micro.fontSize,')
    .replace(/fontSize: 12,/g, 'fontSize: TIPOGRAFIA.caption.fontSize,')
    .replace(/fontSize: 13,/g, 'fontSize: TIPOGRAFIA.caption.fontSize,')
    .replace(/fontSize: 14,/g, 'fontSize: TIPOGRAFIA.caption.fontSize,')
    .replace(/fontSize: 15,/g, 'fontSize: TIPOGRAFIA.body.fontSize,')
    .replace(/fontSize: 16,/g, 'fontSize: TIPOGRAFIA.body.fontSize,')
    .replace(/fontSize: 18,/g, 'fontSize: TIPOGRAFIA.step.fontSize,')
    .replace(/fontSize: 19,/g, 'fontSize: TIPOGRAFIA.step.fontSize,')
    .replace(/fontSize: 24,/g, 'fontSize: TIPOGRAFIA.title.fontSize,');

  // Consolida sombras no mesmo token sem tocar em layout/elevação específica.
  styles = styles
    .replace(/shadowColor: SOMBRA\.shadowColor,\n\s*shadowOpacity: 0\.2,\n\s*shadowRadius: 12,\n\s*shadowOffset: \{ width: 0, height: 4 \},/g,
      'shadowColor: SOMBRA.shadowColor,\n    shadowOpacity: SOMBRA.shadowOpacity,\n    shadowRadius: SOMBRA.shadowRadius,\n    shadowOffset: SOMBRA.shadowOffset,');

  const out = head + styles;
  for (const forbidden of ['#292e38', '#383e4a', '#565e6c', '#7fb3ff', '#1d4ed8', '#c2410c']) {
    if (out.slice(out.indexOf(marker)).includes(forbidden)) {
      throw new Error(`${file}: token visual legado ainda presente: ${forbidden}`);
    }
  }
  return out;
}

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  src = addImport(src, file);
  const marker = file.includes('choking')
    ? 'const cp = StyleSheet.create({'
    : 'const ca = StyleSheet.create({';
  src = normalizeStyles(src, marker, file);
  fs.writeFileSync(file, src);
  console.log(`✓ ${file}`);
}
