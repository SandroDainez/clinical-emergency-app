#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'components/protocol-screen/sedation-calculator-screen.tsx'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

ok('grade paciente/modo declarada', screen.includes('Núcleo responsivo: paciente + modo lado a lado'));
ok('grade dose/resultado declarada', screen.includes('Núcleo responsivo: dose + resultado lado a lado'));
ok('breakpoint preserva empilhamento abaixo de 920', (screen.match(/larguraDaTela < 920 && s\.quickGridStack/g) ?? []).length >= 2);
ok('modo continua condicional', screen.includes('drug.modes.length > 1 ? ('));
ok('peso continua com NumericStepper', screen.includes('testID="slider-peso"'));
ok('dose continua com NumericStepper', screen.includes('testID="slider-dose"'));
ok('resultado bolus preservado', screen.includes('BOLUS — ADMINISTRAR'));
ok('resultado infusão preservado', screen.includes('TAXA NA BOMBA'));
ok('MgSO4 permanece junto à dose', screen.includes('Paciente em sulfato de magnésio?'));
ok('alerta clínico continua depois da grade', screen.indexOf('{/* Alerta clínico (sempre visível) */}') > screen.indexOf('Núcleo responsivo: dose + resultado lado a lado'));
ok('estilo de grade existe', screen.includes('quickGrid: { flexDirection: "row"'));
ok('resultado ocupa altura da coluna', screen.includes('resultCardFill: { flex: 1'));

const failed = checks.filter(([, value]) => !value);
if (failed.length) {
  console.error('\n❌ Sedoanalgesia/layout responsivo:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ Sedoanalgesia/layout responsivo: ${checks.length} verificações aprovadas.\n`);
