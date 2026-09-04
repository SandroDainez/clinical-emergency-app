#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(!tree.includes('Pode-se repetir 50 mg 15–20 min depois'), 'PCR: repetição em 15–20 min ainda presente');
expect(tree.includes('AHA 2025 não define um esquema ótimo'), 'PCR: incerteza AHA sobre dose ótima ausente');
expect(tree.includes('50 mg adicionais após 30 min'), 'PCR: intervalo ERC de 30 min ausente');
expect(tree.includes('0,6–1,0 mg/kg IV (máx. 100 mg)'), 'PCR: faixa observada no ERC ausente');
expect(tree.includes('evidência é insuficiente para recomendar uma estratégia de dose ótima'), 'PCR: insuficiência de evidência ERC ausente');
expect(tree.includes('NÃO complete automaticamente uma dose total de 100 mg'), 'PCR: proteção pós-ROSC contra completar 100 mg automaticamente ausente');
expect(tree.includes('NÃO extrapolar os estudos de dose reduzida do TEP agudo fora da parada'), 'PCR: extrapolação de dose reduzida para parada ainda possível');
expect(tree.includes('ERC 2025 recomenda continuar RCP por pelo menos 60–90 min'), 'PCR: recomendação ERC 60–90 min ausente');
expect(tree.includes('AHA 2025 considera a duração ótima incerta'), 'PCR: incerteza AHA sobre duração de RCP ausente');
expect(tree.includes('Não apresente o regime acelerado de TEP fora da parada como alternativa equivalente e validada para PCR'), 'PCR: regime não-PCR ainda aparece como alternativa equivalente');
expect(!tree.includes('AS CONTRAINDICAÇÕES RELATIVAS TORNAM-SE ACEITÁVEIS'), 'PCR: contraindicações relativas ainda são automaticamente anuladas');
expect(tree.includes('contraindicações relativas não devem funcionar como veto mecânico, mas também não desaparecem'), 'PCR: balanço de contraindicações não ficou explícito');
expect(tree.includes('AHA 2025 considera fibrinólise, embolectomia cirúrgica e embolectomia mecânica opções razoáveis'), 'PCR confirmado: alternativas AHA 2025 ausentes');
expect(tree.includes('em TEP apenas suspeito, fibrinólise pode ser considerada'), 'PCR suspeito: força AHA 2025 não ficou diferenciada');
expect(i18n.includes('AHA 2025 no define un esquema óptimo'), 'PCR ES: dose ótima AHA ausente');
expect(i18n.includes('después de 30 min'), 'PCR ES: intervalo ERC ausente');
expect(i18n.includes('al menos 60–90 min'), 'PCR ES: duração ERC ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP/PCR AHA 2025 + ERC 2025: 17 travas aprovadas.');
