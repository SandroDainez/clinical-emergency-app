#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'rsi-decision-tree.ts'), 'utf8');
const es = fs.readFileSync(path.join(root, 'lib/i18n/modules/isr.ts'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

ok('DAS 2025 citado', tree.includes('Difficult Airway Society 2025'));
ok('algoritmo A/B/C/D explícito', tree.includes('algoritmo linear A/B/C/D'));
ok('sem DAS 2015 como fonte atual', !tree.includes('plano de falha conforme DAS 2015'));
ok('sem regra obeso/gestante/crítico 30–90 s antiga', !tree.includes('Obeso/gestante/crítico: 30–90 s'));
ok('crítico não recebe tempo fixo como atalho', tree.includes('não substituir otimização por um atalho fixo de 30–90 s'));
ok('VNI no P/F <150', tree.includes('PaO₂/FiO₂ < 150') && tree.includes('ventilação não invasiva'));
ok('ATS 2026 HFNC ou VNI', tree.includes('ATS 2026 recomenda HFNC ou VNI'));
ok('HFNC/peroxigenação contínua', tree.includes('manter alto fluxo durante a tentativa') && tree.includes('DAS 2025 prioriza oxigenação contínua'));
ok('pré-oxigenação assistida por medicação', tree.includes('pré-oxigenação assistida por medicação'));
ok('BVM não é proibida rotineiramente', !tree.includes('BVM com máscara apenas se as demais opções forem insuficientes'));
ok('BVM protetora e contextual', tree.includes('ventilação suave com BVM pode ser usada para prevenir hipoxemia') && tree.includes('risco de regurgitação/aspiração'));
ok('posição semi-Fowler/ramped', tree.includes('cabeceira elevada/semi-Fowler') && tree.includes('ramped'));
ok('tradução resumo novo', es.includes('Maximizar la reserva de O₂ y mantener la oxigenación durante toda la secuencia'));
ok('tradução BVM nova', es.includes('ventilación suave con bolsa-válvula-mascarilla puede usarse para prevenir hipoxemia'));
ok('tradução DAS 2025', es.includes('Difficult Airway Society 2025'));

const failed = checks.filter(([, value]) => !value);
if (failed.length) {
  console.error('\n❌ ISR/pré-oxigenação 2026:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ ISR/pré-oxigenação 2026: ${checks.length} verificações aprovadas.\n`);
