#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'components/protocol-screen/sedation-calculator-screen.tsx'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

const gridToken = '<View style={[s.quickGrid, larguraDaTela < 920 && s.quickGridStack]}>';
const gridPositions = [];
let cursor = 0;
while ((cursor = screen.indexOf(gridToken, cursor)) >= 0) {
  gridPositions.push(cursor);
  cursor += gridToken.length;
}
const patientPosition = screen.indexOf('<Text style={s.cardLabel}>{tr("PACIENTE")}</Text>');
const modePosition = screen.indexOf('<Text style={s.cardLabel}>{tr("MODO DE USO")}</Text>');
const dosePosition = screen.indexOf('<Text style={s.cardLabel}>{tr("DOSE")}</Text>');
const resultPosition = screen.indexOf('style={[s.resultCard, s.resultCardFill]}');
const clinicalAlertPosition = screen.indexOf('<View style={[s.alertBox, drug.alert.tone === "danger" ? s.alertDanger : s.alertWarn]}>');

ok('grade paciente/modo declarada', gridPositions.length >= 1 && patientPosition > gridPositions[0] && modePosition > gridPositions[0]);
ok('grade dose/resultado declarada', gridPositions.length >= 2 && dosePosition > gridPositions[1] && resultPosition > gridPositions[1]);
ok('breakpoint preserva empilhamento abaixo de 920', (screen.match(/larguraDaTela < 920 && s\.quickGridStack/g) ?? []).length >= 2);
ok('modo continua condicional', screen.includes('drug.modes.length > 1 ? ('));
ok('peso continua com NumericStepper', screen.includes('testID="slider-peso"'));
ok('dose continua com NumericStepper', screen.includes('testID="slider-dose"'));
ok('resultado bolus preservado', screen.includes('BOLUS — ADMINISTRAR'));
ok('resultado infusão preservado', screen.includes('TAXA NA BOMBA'));
ok('MgSO4 permanece junto à dose', screen.includes('Paciente em sulfato de magnésio?'));
ok('alerta clínico continua depois da grade', clinicalAlertPosition > resultPosition && resultPosition > gridPositions[1]);
ok('estilo de grade existe', screen.includes('quickGrid: { flexDirection: "row"'));
ok('resultado ocupa altura da coluna', screen.includes('resultCardFill: { flex: 1'));

const failed = checks.filter(([, value]) => !value);
if (failed.length) {
  console.error('\n❌ Sedoanalgesia/layout responsivo:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ Sedoanalgesia/layout responsivo: ${checks.length} verificações aprovadas.\n`);
