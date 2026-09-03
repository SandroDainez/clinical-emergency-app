#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ui = fs.readFileSync(path.join(root, 'components/protocol-screen/sedation-calculator-screen.tsx'), 'utf8');

const checks = [
  ['SCCM 2026/PF<150 presente', ui.includes('SCCM 2026 sugere BNM quando PaO₂/FiO₂ < 150')],
  ['RASS -5 deixou de ser pré-requisito universal', ui.includes('não transformar RASS −5 em pré-requisito universal') && !ui.includes('sedação PROFUNDA confirmada (RASS −5)')],
  ['gatilho universal de suspensão por P/F removido', ui.includes('Não usar PaO₂/FiO₂ > 150 como gatilho universal de suspensão') && !ui.includes('suspender quando a PaO₂/FiO₂ estiver estável acima de 150')],
  ['MgSO4 sem redutor percentual fixo', ui.includes('Não aplicar redução percentual fixa universal') && !ui.includes('reduzir a dose em 30–50%')],
  ['opioide sem via universal', ui.includes('infusão contínua pode ser apropriada quando a dor é persistente ou recorrente') && !ui.includes('Opioide preferencialmente INTERMITENTE, não em infusão contínua')],
  ['delirium sem esquema fixo de antipsicótico', ui.includes('PADIS 2025 não estabelece recomendação a favor ou contra') && !ui.includes('Quetiapina 12,5–25 mg 2×/dia')],
  ['haloperidol sem regime universal', ui.includes('não aplicar um esquema IV fixo universal como tratamento do delirium') && !ui.includes('repetível a cada 20 min, máximo 20 mg em 24 h')],
];

let failed = 0;
for (const [label, ok] of checks) {
  if (!ok) { console.error(`❌ ${label}`); failed++; }
}
if (failed) process.exit(1);
console.log(`\n✅ Sedoanalgesia/BNM UI: ${checks.length} verificações aprovadas.\n`);
