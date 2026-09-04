#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'tep-decision-tree.ts'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'lib/i18n/modules/tep.ts'), 'utf8');
const issues = [];
const expect = (ok, msg) => { if (!ok) issues.push(msg); };

expect(tree.includes('version: "2026.1"'), 'versão do módulo TEP não foi atualizada para 2026.1');
expect(tree.includes('Base clínica principal atual: AHA/ACC/Multisociety 2026'), 'fonte principal 2026 ausente do cabeçalho');
expect(!tree.includes('Mortalidade 1–3% (baixo risco) a 15–65% (maciço com choque)'), 'mortalidade histórica/maciço ainda aparece no summary inicial');
expect(tree.includes('D1: hipotensão transitória/recorrente de curta duração ou responsiva a volume'), 'definição D1 ausente');
expect(tree.includes('D2: hipoperfusão/choque normotensivo'), 'definição D2 ausente');
expect(tree.includes('E1: hipotensão recorrente ou persistente com choque cardiogênico'), 'definição E1 ausente');
expect(tree.includes('E2: choque refratário ou parada cardíaca'), 'definição E2 ausente');
expect(tree.includes('Classificação clínica AHA/ACC 2026'), 'título de classificação 2026 ausente');
expect(tree.includes('C1 = VD e biomarcadores normais'), 'C1 ausente');
expect(tree.includes('C2 = VD anormal OU pelo menos um biomarcador anormal'), 'C2 ausente');
expect(tree.includes('C3 = VD anormal E pelo menos um biomarcador anormal'), 'C3 ausente');
expect(tree.includes('C3 — gravidade elevada + VD e biomarcador anormais'), 'opção C3 ausente');
expect(tree.includes('C1/C2 — gravidade elevada'), 'opção C1/C2 ausente');
expect(tree.includes('B — baixa gravidade (ex.: sPESI = 0/Hestia = 0)'), 'opção B ausente');
expect(tree.includes('Categoria C3 exige hospitalização e vigilância próxima'), 'conduta C3 não ficou explícita');
expect(tree.includes('utilidade é incerta enquanto o paciente permanece C3'), 'trombólise sistêmica em C3 não ficou como incerta');
expect(tree.includes('Em C2–C3, o benefício de trombólise dirigida por cateter ou trombectomia mecânica sobre anticoagulação isolada permanece incerto'), 'terapias por cateter em C2-C3 ficaram fortes demais');
expect(tree.includes('não transforme uma combinação fixa de três exames em regra universal de alta'), 'alta precoce ainda depende de regra fixa de três exames');
expect(tree.includes('Hestia, PESI e/ou sPESI'), 'ferramentas validadas para alta não ficaram explícitas');
expect(tree.includes('Monitorização intensiva — categorias C3/D/E conforme gravidade'), 'destino intensivo não foi migrado para categorias 2026');
expect(tree.includes('Internação — categorias C1/C2'), 'destino de internação C1/C2 ausente');
expect(tree.includes('Alta precoce / tratamento ambulatorial — categorias A/B selecionadas'), 'destino A/B ausente');
expect(!tree.includes('HNF com TTPa 60–100 s; repetir troponina/BNP em 6–12 h'), 'destino UTI ainda fixa HNF e biomarcador seriado universal');
expect(!tree.includes('Trombólise de resgate imediata se deterioração no intermediário-alto'), 'rótulo ESC antigo ainda autoriza trombólise automática');
expect(i18n.includes('Clasificación clínica AHA/ACC 2026'), 'i18n ES: classificação 2026 ausente');
expect(i18n.includes('Categoría C3 — anticoagulación + vigilancia del deterioro'), 'i18n ES: C3 ausente');

if (issues.length) {
  for (const issue of issues) console.error(`❌ ${issue}`);
  process.exit(1);
}
console.log('✅ TEP AHA/ACC 2026: 26 travas de classificação, destino e escalada aprovadas.');
