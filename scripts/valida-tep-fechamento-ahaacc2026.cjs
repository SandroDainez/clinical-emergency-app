#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const tree = read('tep-decision-tree.ts');
const ci = read('lib/contraindicacao-trombolise.ts');
const gates = read('lib/clinical-gate-registry.ts');
const debts = read('clinical-safety-cases/gate-candidate-debts.ts');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

// Classificação e diagnóstico
expect(tree.includes('gravidade AHA/ACC 2026 (A–E)'), 'modelo A–E não está explícito na entrada');
for (const cat of ['C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2']) expect(tree.includes(cat), `categoria ${cat} ausente`);
expect(tree.includes('NÃO confirma nem exclui TEP isoladamente'), 'eco/POCUS voltou a parecer confirmatório');
expect(tree.includes('AngioTC'), 'via confirmatória por imagem sumiu');

// Anticoagulação
expect(tree.includes('preferir HBPM a HNF'), 'preferência parenteral AHA/ACC 2026 ausente');
expect(tree.includes('preferir DOAC a antagonista da vitamina K'), 'preferência oral AHA/ACC 2026 ausente');
expect(!tree.includes('IRA TFG < 30: HNF preferida'), 'HNF automática em insuficiência renal ainda presente');
expect(tree.includes('síndrome antifosfolípide trombótica estabelecida'), 'exceção APS/VKA ausente');
expect(tree.includes('obesidade classe III'), 'consideração de obesidade classe III ausente');
expect(tree.includes('fase inicial de tratamento dura 3–6 meses'), 'fase inicial 3–6 meses ausente');

// Reperfusão / SafetyGate
expect(tree.includes('E1–E2') && tree.includes('D1–D2') && tree.includes('C3') && tree.includes('A1–C2'), 'força da trombólise por categoria incompleta');
expect(!tree.includes('Trombólise sistêmica é PRIMEIRA LINHA no TEP de alto risco'), 'regra antiga de lise por etiqueta alto risco ainda presente');
expect(gates.includes('id: "tep-lise-sistemica-categoria-inferior"'), 'SafetyGate de lise em categorias inferiores ausente');
expect(!debts.includes('id: "tep-thrombolysis-for-isolated-ischemic-pain"'), 'gate promovido reapareceu como dívida');

// PCR
expect(tree.includes('AHA 2025 não define um esquema ótimo'), 'incerteza da dose na PCR ausente');
expect(!tree.includes('Pode-se repetir 50 mg 15–20 min depois'), 'repetição antiga de alteplase 15–20 min reapareceu');
expect(tree.includes('ERC 2025 recomenda continuar RCP por pelo menos 60–90 min'), 'orientação ERC de RCP prolongada ausente');

// Suporte VD / ventilação
expect(tree.includes('Volume NÃO é rotina'), 'proteção contra volume rotineiro ausente');
expect(!tree.includes('máx 500–1.000 mL'), 'carga volêmica antiga de até 1 L reapareceu');
expect(tree.includes('Evitar sedação profunda e ventilação mecânica salvo indicação clínica forte'), 'proteção ventilatória ausente');
expect(tree.includes('VA-ECMO'), 'estratégia de resgate avançado desapareceu');

// Seguimento
expect(tree.includes('primeira semana após a alta'), 'contato na primeira semana ausente');
expect(tree.includes('consulta até 3 meses'), 'revisão até 3 meses ausente');
expect(tree.includes('TODAS as consultas por pelo menos 1 ano'), 'screening sintomático por 1 ano ausente');
expect(tree.includes('não fazer imagem de controle rotineira'), 'proteção contra imagem de resolução rotineira ausente');

// Contraindicações: produto/bula, sem janela secundária inventada
expect(ci.includes('CONTRAINDICAÇÕES À ALTEPLASE NO TEP'), 'lista de contraindicações não ancorada em alteplase');
expect(ci.includes('não invente uma janela universal de 3 versus 6 meses'), 'janela de AVC prévio continua tratada como falsa precisão');
expect(!ci.includes('o StatPearls (Thrombolytic Therapy) usa 3 MESES como contraindicação absoluta'), 'fonte secundária antiga ainda decide janela de lise');

// Dívida legítima que deve permanecer até haver superfície real de ISR/sedação.
expect(debts.includes('id: "tep-high-risk-deep-sedation-ventilation"'), 'dívida TEP→ISR sumiu sem promoção auditável');
expect(debts.includes('"needs_fact_model"') && debts.includes('"needs_action_surface"'), 'dívida TEP→ISR perdeu fatos/superfície pendentes');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ Fechamento TEP AHA/ACC 2026: classificação, diagnóstico, anticoagulação, reperfusão, PCR, suporte, seguimento, SafetyGate e contraindicações consistentes.');