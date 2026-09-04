#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const treePath = path.join(root, 'tep-decision-tree.ts');
const i18nPath = path.join(root, 'lib/i18n/modules/tep.ts');
let tree = fs.readFileSync(treePath, 'utf8');
let i18n = fs.readFileSync(i18nPath, 'utf8');

const reps = [
  [
    'Baseado em: ESC 2019 (TEP) · AHA Scientific Statement 2011 (updated) · ACCP/CHEST\n * 2022 (VTE) · ASH 2020 · UpToDate 2024.',
    'Base clínica principal atual: AHA/ACC/Multisociety 2026 para classificação, diagnóstico, anticoagulação e terapias avançadas. ESC 2019 é mantida apenas como referência histórica/linguagem legada quando necessário.'
  ],
  [
    'version: "2024.1",',
    'version: "2026.1",'
  ],
  [
    'summary: "3ª causa de doença cardiovascular aguda. Mortalidade 1–3% (baixo risco) a 15–65% (maciço com choque).",',
    'summary: "TEP agudo: confirmar o diagnóstico e classificar pela gravidade AHA/ACC 2026 (A–E), porque categoria e evolução clínica determinam destino e necessidade de terapia avançada.",'
  ],
  [
    '"Apresentação: dispneia súbita (73–80%), dor pleurítica, taquicardia, taquipneia, síncope (alto risco), hipotensão/choque (maciço), sinais de TVP.",',
    '"Apresentação possível: dispneia súbita, dor pleurítica, taquicardia/taquipneia, síncope, sinais de TVP e, nos casos graves, hipoperfusão, hipotensão ou choque. Não use os termos maciço/submaciço como classificação principal; prefira categorias AHA/ACC 2026.",'
  ],
  [
    '"ALTO RISCO (maciço) = PAS < 90 mmHg ou queda ≥ 40 mmHg por > 15 min, ou necessidade de vasopressor — mortalidade > 15%.",',
    '"AHA/ACC 2026: D = falência cardiopulmonar incipiente (D1: hipotensão transitória/recorrente de curta duração ou responsiva a volume; D2: hipoperfusão/choque normotensivo). E = falência cardiopulmonar (E1: hipotensão recorrente ou persistente com choque cardiogênico; E2: choque refratário ou parada cardíaca). Reclassifique dinamicamente com a evolução.",'
  ],
  [
    '{ id: "instavel", label: "Instável — choque/hipotensão (alto risco)", next: "ar_suporte" },',
    '{ id: "instavel", label: "Instabilidade/falência cardiopulmonar — avaliar D/E", next: "ar_suporte" },'
  ],
  [
    'title: "Estratificação de risco (ESC 2019 · categorias AHA/ACC 2026)",',
    'title: "Classificação clínica AHA/ACC 2026",'
  ],
  [
    'question: "Qual a categoria de risco (disfunção de VD + biomarcadores + sPESI)?",',
    'question: "Qual categoria AHA/ACC 2026 melhor descreve o paciente confirmado e atualmente sem falência cardiopulmonar persistente?",'
  ],
  [
    '"Intermediário-ALTO: disfunção de VD E biomarcadores elevados (ambos). Intermediário-BAIXO: VD ou biomarcador (apenas um) ou nenhum, com sPESI ≥ 1. BAIXO: sPESI = 0, sem disfunção de VD, troponina normal.",',
    '"Categorias 2026 no paciente sintomático sem falência cardiopulmonar: B = baixo escore de gravidade; C = escore de gravidade elevado. Dentro de C: C1 = VD e biomarcadores normais; C2 = VD anormal OU pelo menos um biomarcador anormal; C3 = VD anormal E pelo menos um biomarcador anormal.",'
  ],
  [
    '"AHA/ACC 2026 — nova classificação A–E: A subclínico (assintomático) · B baixa gravidade · C gravidade elevada (biomarcador e/ou disfunção de VD → internar) · D falência incipiente (instabilidade TRANSITÓRIA) · E falência cardiopulmonar (hipotensão/choque persistente). Equivalência APROXIMADA com o esquema antigo: A–B ≈ baixo risco, C ≈ intermediário, D–E ≈ alto risco. ⚠️ E A EQUIVALÊNCIA PERDE O QUE A REVISÃO ACRESCENTOU: achatar cinco categorias em três apaga justamente o estado que a classificação de 2026 foi criada para nomear — o paciente com PRESSÃO PRESERVADA e PERFUSÃO JÁ FALHANDO. Use o esquema novo para decidir, e a equivalência só para conversar com quem ainda fala em maciço/submaciço.",',
    '"AHA/ACC 2026: A = TEP incidental assintomático; B = sintomático com baixo escore de gravidade; C = sintomático com escore elevado; D = falência cardiopulmonar incipiente, inclusive choque normotensivo; E = falência cardiopulmonar. Os termos baixo/intermediário/alto risco da ESC 2019 podem aparecer como linguagem legada, mas não devem dirigir a decisão quando a categoria A–E estiver disponível.",'
  ],
  [
    '{ id: "int_alto", label: "Intermediário-alto (VD + biomarcadores)", next: "anticoag_intensivo" },',
    '{ id: "int_alto", label: "C3 — gravidade elevada + VD e biomarcador anormais", next: "anticoag_intensivo" },'
  ],
  [
    '{ id: "int_baixo", label: "Intermediário-baixo", next: "anticoag" },',
    '{ id: "int_baixo", label: "C1/C2 — gravidade elevada", next: "anticoag" },'
  ],
  [
    '{ id: "baixo", label: "Baixo risco (sPESI = 0)", next: "ambulatorial_check" },',
    '{ id: "baixo", label: "B — baixa gravidade (ex.: sPESI = 0/Hestia = 0)", next: "ambulatorial_check" },'
  ],
  [
    'title: "Intermediário-alto — anticoagulação plena + vigilância",',
    'title: "Categoria C3 — anticoagulação + vigilância de deterioração",'
  ],
  [
    'summary: "Anticoagulação plena + monitorização intensiva; trombólise de resgate se deteriorar.",',
    'summary: "Categoria C3 exige hospitalização e vigilância próxima. Trombólise sistêmica não é rotina: sua utilidade é incerta enquanto o paciente permanece C3; se deteriorar, reclassifique para D/E e reavalie terapia avançada.",'
  ],
  [
    '"Anticoagulação plena imediata: HNF IV (bolus {hnfBolus} U + {hnfInf} U/h, alvo TTPa 60–100 s) — preferir HNF pela possibilidade de trombólise de resgate; OU enoxaparina {enoxa} mg SC 12/12h.",',
    '"Anticoagulação terapêutica sem contraindicação. AHA/ACC 2026: se for necessária anticoagulação parenteral inicial em C1–E1, preferir HBPM à HNF; escolher exceções de forma explícita conforme função renal, sangramento e contexto periprocedural.",'
  ],
  [
    '"TROMBÓLISE DE RESGATE imediata se houver deterioração hemodinâmica (passar para o ramo de alto risco).",',
    '"Se houver deterioração, RECLASSIFICAR imediatamente para D1/D2/E1/E2 conforme hipotensão, hipoperfusão e choque; acionar PERT/equipe de referência e reavaliar trombólise sistêmica, cateter, trombectomia ou cirurgia conforme categoria e risco hemorrágico.",'
  ],
  [
    '"⚠️ NÃO trombolisar de rotina o paciente NORMOTENSO apenas por disfunção de VD e troponina elevada: no PEITHO a tenecteplase reduziu a descompensação hemodinâmica, mas AUMENTOU hemorragia grave e AVC hemorrágico. A trombólise aqui é de resgate, não profilática.",',
    '"⚠️ Categoria C3: NÃO usar trombólise sistêmica de rotina. AHA/ACC 2026 considera incerta a utilidade da trombólise sistêmica em C3; a decisão só deve avançar após reavaliação clínica, risco hemorrágico e eventual progressão para D/E.",'
  ],
  [
    '"Considerar CDT (cateter-dirigida) em centros com experiência se risco de deterioração.",',
    '"Em C2–C3, o benefício de trombólise dirigida por cateter ou trombectomia mecânica sobre anticoagulação isolada permanece incerto; não oferecer como escalada automática apenas pela categoria.",'
  ],
  [
    'summary:\n        "OS TRÊS CRITÉRIOS QUE ABREM A PORTA DA ALTA (HOME-PE/Hestia): sPESI = 0, SEM disfunção de ventrículo direito ao ecocardiograma e troponina NORMAL. Os três juntos — falta um, o paciente interna. As condições clínicas e sociais estão abaixo.",',
    'summary:\n        "ALTA PRECOCE exige baixo risco validado e viabilidade clínica/social. AHA/ACC 2026 recomenda usar Hestia, PESI e/ou sPESI; não transforme uma combinação fixa de três exames em regra universal de alta.",'
  ],
  [
    '"Critérios (HOME-PE/Hestia): sPESI = 0, sem disfunção de VD ao ECO, troponina normal.",',
    '"AHA/ACC 2026: categorias A/B podem ser candidatas a manejo ambulatorial quando Hestia, PESI e/ou sPESI indicarem baixo risco e houver acesso imediato à anticoagulação, seguimento rápido e ausência de barreiras clínicas ou sociais.",'
  ],
  [
    'title: "UTI — TEP de alto risco / intermediário-alto",',
    'title: "Monitorização intensiva — categorias C3/D/E conforme gravidade",'
  ],
  [
    '"Metas: SpO₂ ≥ 94% com suporte; HNF com TTPa 60–100 s; repetir troponina/BNP em 6–12 h da primeira dosagem.",',
    '"Monitorar oxigenação, perfusão, pressão, sinais de falência de VD e anticoagulação conforme o agente utilizado; repetir biomarcadores e imagem de VD quando isso puder mudar estratificação ou conduta.",'
  ],
  [
    '"Trombólise de resgate imediata se deterioração no intermediário-alto; transição para anticoagulação oral após estabilização.",',
    '"Se houver deterioração, reclassificar pela categoria AHA/ACC 2026 e discutir terapia avançada conforme D/E, risco hemorrágico, recursos e PERT/equipe de referência; não usar a antiga etiqueta intermediário-alto como autorização automática para trombólise.",'
  ],
  [
    'title: "Internação — risco intermediário-baixo",',
    'title: "Internação — categorias C1/C2",'
  ],
  [
    'title: "Alta precoce / tratamento ambulatorial",',
    'title: "Alta precoce / tratamento ambulatorial — categorias A/B selecionadas",'
  ],
];

for (const [from, to] of reps) {
  if (!tree.includes(from) && !tree.includes(to)) {
    throw new Error(`Trecho-alvo não encontrado: ${from.slice(0, 120)}`);
  }
  if (tree.includes(from)) tree = tree.replace(from, to);
}

const translatedPairs = [
  ['Classificação clínica AHA/ACC 2026', 'Clasificación clínica AHA/ACC 2026'],
  ['C3 — gravidade elevada + VD e biomarcador anormais', 'C3 — gravedad elevada + VD y biomarcador anormales'],
  ['C1/C2 — gravidade elevada', 'C1/C2 — gravedad elevada'],
  ['B — baixa gravidade (ex.: sPESI = 0/Hestia = 0)', 'B — baja gravedad (p. ej., sPESI = 0/Hestia = 0)'],
  ['Categoria C3 — anticoagulação + vigilância de deterioração', 'Categoría C3 — anticoagulación + vigilancia del deterioro'],
  ['Monitorização intensiva — categorias C3/D/E conforme gravidade', 'Monitorización intensiva — categorías C3/D/E según gravedad'],
  ['Internação — categorias C1/C2', 'Hospitalización — categorías C1/C2'],
  ['Alta precoce / tratamento ambulatorial — categorias A/B selecionadas', 'Alta precoz / tratamiento ambulatorio — categorías A/B seleccionadas'],
];
for (const [pt, es] of translatedPairs) {
  if (i18n.includes(JSON.stringify(pt))) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx < 0) throw new Error('Fechamento do dicionário TEP não localizado');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}: ${JSON.stringify(es)},` + i18n.slice(idx);
}

fs.writeFileSync(treePath, tree);
fs.writeFileSync(i18nPath, i18n);
console.log('✅ TEP: classificação e destinos migrados para AHA/ACC 2026 sem usar rótulos ESC 2019 como motor de decisão.');
