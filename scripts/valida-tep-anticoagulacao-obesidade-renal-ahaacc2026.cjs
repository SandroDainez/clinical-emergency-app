#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!tree.includes('NOACs são preferidos (ESC 2019 — Classe I)'), 'summary ainda ancorado em ESC 2019');
expect(tree.includes('Se elegível para via oral, preferir DOAC a antagonista da vitamina K'), 'preferência DOAC AHA/ACC 2026 ausente');
expect(tree.includes('quando terapia parenteral inicial for necessária em C1–E1, preferir HBPM a HNF'), 'preferência HBPM C1-E1 ausente');
expect(!tree.includes('IRA TFG < 30: HNF preferida'), 'HNF automática em TFG <30 ainda presente');
expect(tree.includes('ClCr <30 mL/min'), 'doença renal grave não explicitada');
expect(tree.includes('se HBPM for utilizada, é razoável monitorar anti-Xa'), 'monitorização anti-Xa na DRC grave ausente');
expect(tree.includes('sem transformar ClCr <30 isoladamente em regra automática de HNF'), 'proteção contra HNF automática ausente');
expect(tree.includes('síndrome antifosfolípide trombótica estabelecida'), 'APS trombótica ausente');
expect(tree.includes('recomenda antagonista da vitamina K sobre DOAC'), 'preferência VKA na APS ausente');
expect(!tree.includes('Não reduzir dose apenas pelo peso'), 'regra antiga absoluta de obesidade ainda presente');
expect(tree.includes('obesidade classe III (IMC >40 kg/m²) tratada com HBPM, redução de dose pode ser razoável'), 'possibilidade de redução de HBPM na obesidade classe III ausente');
expect(tree.includes('peso >150 kg ou IMC >40 kg/m², o benefício de monitorar anti-Xa rotineiramente'), 'incerteza do anti-Xa rotineiro na obesidade extrema ausente');
expect(i18n.includes('sin convertir ClCr <30 aisladamente en una regla automática de HNF'), 'ES: proteção renal ausente');
expect(i18n.includes('obesidad clase III'), 'ES: obesidade classe III ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP AHA/ACC 2026: 14 travas de anticoagulação renal/obesidade aprovadas.');
