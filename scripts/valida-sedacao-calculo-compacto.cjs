#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const screen = fs.readFileSync(path.join(root, 'components/protocol-screen/sedation-calculator-screen.tsx'), 'utf8');
const es = fs.readFileSync(path.join(root, 'lib/i18n/modules/sedacao.ts'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

ok('estado de personalização de diluição', screen.includes('showDilutionTools'));
ok('estado de notas do bolus', screen.includes('showBolusNotes'));
ok('preset recomendado continua sempre no fluxo', screen.includes('testID="sedacao-diluicoes"'));
ok('concentração continua sempre visível', screen.indexOf('Resumo concentração permanece sempre visível antes da dose.') < screen.indexOf('showDilutionTools ?'));
ok('diluições salvas continuam existentes', screen.includes('savedDilutions.map((d) =>'));
ok('construtor personalizado continua existente', screen.includes('Criar diluição personalizada'));
ok('ferramentas avançadas ficam condicionais', screen.includes('showDilutionTools ? ('));
ok('concentração de bolus continua visível', screen.includes('presentation.concentrationLabel'));
ok('notas de bolus ficam condicionais', screen.includes('showBolusNotes ? ('));
ok('dose permanece depois da apresentação/diluição', screen.indexOf('{/* Dose */}') > screen.indexOf('NOTAS DO BOLUS'));
ok('resultado permanece imediatamente após dose/rocurônio', screen.indexOf('{/* RESULTADO */}') > screen.indexOf('{/* Dose */}'));
ok('troca de fármaco fecha ferramentas avançadas', screen.includes('setShowDilutionTools(false);') && screen.includes('setShowBolusNotes(false);'));
ok('troca de modo fecha ferramentas avançadas', (screen.match(/setShowDilutionTools\(false\);/g) ?? []).length >= 2 && (screen.match(/setShowBolusNotes\(false\);/g) ?? []).length >= 2);
ok('tradução personalizar diluição', es.includes('"PERSONALIZAR DILUIÇÃO": "PERSONALIZAR DILUCIÓN"'));
ok('tradução notas do bolus', es.includes('"NOTAS DO BOLUS": "NOTAS DEL BOLO"'));

const failed = checks.filter(([, value]) => !value);
if (failed.length) {
  console.error('\n❌ Sedoanalgesia/calculo compacto:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ Sedoanalgesia/calculo compacto: ${checks.length} verificações aprovadas.\n`);
