const fs = require('fs');

const files = [
  'components/protocol-screen/vasoactive-calculator-screen.tsx',
  'components/protocol-screen/sedation-calculator-screen.tsx',
];

function replaceRequired(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`âncora ausente: ${label}`);
  return text.replace(before, after);
}

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('const s = StyleSheet.create({')) throw new Error(`StyleSheet não encontrado: ${file}`);

  if (!src.includes('calculator-visual-tokens')) {
    const importAnchor = 'import { Header } from "../ui-v2/header";';
    src = replaceRequired(
      src,
      importAnchor,
      `${importAnchor}\nimport { CALCULATOR_VISUAL as CV } from "../ui-v2/calculator-visual-tokens";`,
      `${file}: import CV`
    );
  }

  const marker = 'const s = StyleSheet.create({';
  const index = src.indexOf(marker);
  const head = src.slice(0, index);
  let styles = src.slice(index);

  const literalMap = new Map([
    ['"#292e38"', 'CV.cores.bg'],
    ['"#383e4a"', 'CV.cores.surface'],
    ['"#565e6c"', 'CV.cores.border'],
    ['"#f1f5f9"', 'CV.cores.text'],
    ['"#cbd5e1"', 'CV.cores.text'],
    ['"#aab6c6"', 'CV.cores.textSecondary'],
    ['"#94a3b8"', 'CV.cores.textSecondary'],
    ['"#93c5fd"', 'CV.cores.primary'],
    ['"#7fb3ff"', 'CV.cores.primary'],
    ['"#818cf8"', 'CV.cores.primary'],
    ['"#a5b4fc"', 'CV.cores.primary'],
    ['"#c7d2fe"', 'CV.cores.primary'],
    ['"#c4b5fd"', 'CV.cores.primary'],
    ['"#6366f1"', 'CV.cores.primary'],
    ['"#fbbf24"', 'CV.cores.warning'],
    ['"#f59e0b"', 'CV.cores.warning'],
    ['"#fca5a5"', 'CV.cores.critical'],
    ['"#22c55e"', 'CV.cores.success'],
    ['"#86efac"', 'CV.cores.success'],
    ['"#bbf7d0"', 'CV.cores.success'],
    ['"#ffffff"', 'CV.cores.onPrimary'],
  ]);

  for (const [before, after] of literalMap) styles = styles.split(before).join(after);

  // Superfícies e forma: card/input/botão seguem o mesmo contrato do cockpit.
  styles = styles
    .replace(/borderRadius: 14/g, 'borderRadius: CV.raio.card')
    .replace(/borderRadius: 16/g, 'borderRadius: CV.raio.card')
    .replace(/borderRadius: 12/g, 'borderRadius: CV.raio.input')
    .replace(/borderRadius: 10/g, 'borderRadius: CV.raio.input')
    .replace(/borderRadius: 9/g, 'borderRadius: CV.raio.botao')
    .replace(/borderRadius: 8/g, 'borderRadius: CV.raio.botao');

  // Escala tipográfica mínima compartilhada. Valores grandes de resultado ficam preservados.
  styles = styles
    .replace(/fontSize: 9,/g, 'fontSize: CV.tipo.micro.fontSize,')
    .replace(/fontSize: 10,/g, 'fontSize: CV.tipo.micro.fontSize,')
    .replace(/fontSize: 11,/g, 'fontSize: CV.tipo.micro.fontSize,')
    .replace(/fontSize: 12,/g, 'fontSize: CV.tipo.label.fontSize,')
    .replace(/fontSize: 12\.5,/g, 'fontSize: CV.tipo.label.fontSize,')
    .replace(/fontSize: 13,/g, 'fontSize: CV.tipo.label.fontSize,')
    .replace(/fontSize: 15,/g, 'fontSize: CV.tipo.body.fontSize,')
    .replace(/fontSize: 16,/g, 'fontSize: CV.tipo.body.fontSize,')
    .replace(/fontSize: 18,/g, 'fontSize: CV.tipo.step.fontSize,')
    .replace(/fontSize: 20,/g, 'fontSize: CV.tipo.step.fontSize,');

  // Remove identidade cromática local em fundos translúcidos de seleção.
  styles = styles
    .replace(/backgroundColor: "rgba\(77,154,255,0\.15\)"/g, 'backgroundColor: CV.cores.surface')
    .replace(/backgroundColor: "rgba\(99,102,241,0\.2\)"/g, 'backgroundColor: CV.cores.surface')
    .replace(/backgroundColor: "rgba\(99,102,241,0\.15\)"/g, 'backgroundColor: CV.cores.surface')
    .replace(/backgroundColor: "rgba\(99,102,241,0\.12\)"/g, 'backgroundColor: CV.cores.surface');

  // Modal e sombras deixam de criar uma família paralela.
  styles = styles
    .replace(/backgroundColor: "#11261b"/g, 'backgroundColor: CV.cores.surface')
    .replace(/backgroundColor: "#3b0a0a"/g, 'backgroundColor: CV.cores.surface')
    .replace(/shadowColor: "#000"/g, 'shadowColor: CV.sombra.shadowColor');

  src = head + styles;

  // Guardas fail-closed do piloto.
  for (const forbidden of ['#292e38', '#383e4a', '#565e6c', '#6366f1', '#818cf8', '#c4b5fd']) {
    if (src.slice(src.indexOf(marker)).includes(forbidden)) {
      throw new Error(`${file}: token visual legado ainda presente: ${forbidden}`);
    }
  }
  if (!src.includes('CALCULATOR_VISUAL as CV')) throw new Error(`${file}: CV não importado`);

  fs.writeFileSync(file, src);
  console.log(`✓ ${file}`);
}
