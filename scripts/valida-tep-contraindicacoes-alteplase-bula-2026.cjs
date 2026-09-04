#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ci = fs.readFileSync(path.join(root, 'lib/contraindicacao-trombolise.ts'), 'utf8');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(ci.includes('CONTRAINDICAÇÕES À ALTEPLASE NO TEP'), 'lista de TEP não ficou ancorada em alteplase/bula');
expect(ci.includes('sangramento interno ativo'), 'contraindicação de sangramento interno ativo ausente');
expect(ci.includes('história de AVC RECENTE'), 'contraindicação de AVC recente ausente');
expect(ci.includes('nos últimos 3 meses; condição intracraniana'), 'janela de 3 meses para cirurgia intracraniana/intraespinhal/TCE grave ausente');
expect(ci.includes('diátese hemorrágica'), 'diátese hemorrágica ausente');
expect(ci.includes('hipertensão grave não controlada'), 'hipertensão grave não controlada ausente');
expect(ci.includes('não invente uma janela universal de 3 versus 6 meses'), 'proteção contra falsa janela universal de AVC ausente');
expect(ci.includes('bula oficial atual do Activase para TEP usa a expressão “história de AVC recente”'), 'autoria da ausência de janela numérica não ficou explícita');
expect(!ci.includes('o StatPearls (Thrombolytic Therapy) usa 3 MESES como contraindicação absoluta'), 'divergência secundária antiga continua como regra de runtime');
expect(!tree.includes('AVC hemorrágico (qualquer tempo) ou isquêmico < 3 meses'), 'duplicata antiga de contraindicações continua na árvore TEP');
expect(tree.includes('conferir a lista detalhada de contraindicações abaixo e a bula/protocolo'), 'árvore não aponta para lista/bula antes da lise');
expect(tree.includes('RISCO HEMORRÁGICO: além das contraindicações da bula'), 'fatores de risco hemorrágico não ficaram separados das contraindicações');
expect(i18n.includes('CONTRAINDICACIONES PARA ALTEPLASA EN TEP'), 'ES: lista ancorada em bula ausente');
expect(i18n.includes('no inventar una ventana universal de 3 frente a 6 meses'), 'ES: proteção contra janela universal ausente');

// A correção é específica do TEP: os contratos separados de AVC/SCA não podem sumir.
expect(ci.includes('CONTRAINDICAÇÕES AO ALTEPLASE NO AVC ISQUÊMICO'), 'lista específica do AVC foi alterada/removida');
expect(ci.includes('CONTRAINDICAÇÕES À FIBRINÓLISE NA SCA COM SUPRA'), 'lista específica da SCA foi alterada/removida');
expect(ci.includes('CI_SCA_EXCECAO_AVC_AGUDO'), 'exceção específica da SCA foi removida');
expect(ci.includes('CI_AVC_PRESSAO_E_ALVO'), 'regra específica de PA no AVC foi removida');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP alteplase: 18 travas de contraindicação/bula aprovadas sem contaminar AVC ou SCA.');