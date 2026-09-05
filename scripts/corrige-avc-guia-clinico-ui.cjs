const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, s) => fs.writeFileSync(path.join(root, rel), s);

function replaceOnce(s, from, to, label) {
  const n = s.split(from).length - 1;
  if (n !== 1) throw new Error(`${label}: esperava 1 ocorrência, encontrei ${n}`);
  return s.replace(from, to);
}

// ── AVC: o app deve interpretar os valores já coletados, não reperguntar ─────
{
  const rel = 'avc-decision-tree.ts';
  let s = read(rel);

  s = replaceOnce(s, '{ id: "fast_face", label: "FAST · Face", kind: "choice", options: [', '{ id: "fast_face", label: "FAST · Face (rosto)", kind: "choice", options: [', 'FAST face em português');
  s = replaceOnce(s, '{ id: "fast_arms", label: "FAST · Arms", kind: "choice", options: [', '{ id: "fast_arms", label: "FAST · Braços", kind: "choice", options: [', 'FAST arms em português');
  s = replaceOnce(s, '{ id: "fast_speech", label: "FAST · Speech", kind: "choice", options: [', '{ id: "fast_speech", label: "FAST · Fala", kind: "choice", options: [', 'FAST speech em português');

  s = replaceOnce(
    s,
    '        "Glicemia capilar AGORA — registrar o valor e se hipoglicemia precisou de tratamento.",\n        "Registrar coleta dos exames iniciais e NIHSS basal.",',
    '        "Glicemia capilar AGORA — registre o valor. O app classifica automaticamente hipo/normo/hiperglicemia e abre a correção quando necessária.",\n        "Iniciar o NIHSS em paralelo à neuroimagem. A calculadora completa será aberta no fluxo isquêmico; não estimar o escore de cabeça.",',
    'texto de glicemia/NIHSS do passo inicial'
  );

  const blocoHipo = `        { id: "hipoglicemia_tratada", label: "Hipoglicemia tratada?", kind: "choice", options: [\n          { id: "nao_aplicavel", label: "Não aplicável (glicemia ≥ 60)", value: "nao_aplicavel" },\n          { id: "sim", label: "Sim — tratamento realizado", value: "sim" },\n          { id: "pendente", label: "Ainda pendente", value: "pendente" },\n        ] },\n`;
  if (!s.includes(blocoHipo)) throw new Error('bloco hipoglicemia_tratada não encontrado');
  s = s.replace(blocoHipo, '');

  const nihssInicial = `        { id: "nihss", label: "NIHSS basal", kind: "number", min: 0, max: 42, step: 1 },\n`;
  if (!s.includes(nihssInicial)) throw new Error('NIHSS numérico inicial não encontrado');
  s = s.replace(nihssInicial, '');

  s = replaceOnce(
    s,
    '      next: "tempo",\n    },\n\n    tempo: {',
    `      next: {\n        possiveis: ["avc_hipoglicemia", "avc_hiperglicemia", "tempo"],\n        escolher: (values) => {\n          const glicemia = toNumber(values.glicemia);\n          if (glicemia !== null && glicemia < 60) return "avc_hipoglicemia";\n          if (glicemia !== null && glicemia > 180) return "avc_hiperglicemia";\n          return "tempo";\n        },\n      },\n    },\n\n    avc_hipoglicemia: {\n      id: "avc_hipoglicemia",\n      type: "action",\n      title: "Hipoglicemia detectada — corrigir agora",\n      summary: "Glicemia informada: {glicemia} mg/dL. Hipoglicemia pode simular AVC e deve ser corrigida sem atrasar a neuroimagem.",\n      actions: [\n        "Se houver alteração neurológica ou risco de aspiração, NÃO oferecer glicose por via oral.",\n        "Com acesso IV: preferir glicose IV titulada. Opções equivalentes usuais: glicose 10% 250 mL (25 g) ou glicose 50% 50 mL (25 g), conforme apresentação e protocolo local; administrar e reavaliar clinicamente.",\n        "Sem acesso IV imediato: glucagon 1 mg IM pode ser usado enquanto se obtém acesso venoso.",\n        "Repetir glicemia em aproximadamente 15 minutos e repetir tratamento se permanecer < 60 mg/dL.",\n        "Depois de iniciar a correção, manter TC/angioTC e demais passos do AVC em paralelo — não esperar normalização completa para acionar imagem.",\n      ],\n      interactions: [\n        { id: "hipoglicemia_tratada", label: "Correção da hipoglicemia", kind: "choice", options: [\n          { id: "iv", label: "Glicose IV administrada", value: "iv" },\n          { id: "glucagon", label: "Glucagon usado enquanto obtém acesso", value: "glucagon" },\n          { id: "pendente", label: "Correção ainda pendente", value: "pendente" },\n        ] },\n        { id: "glicemia_pos_correcao", label: "Glicemia após correção", kind: "number", min: 20, max: 1200, step: 1, unit: "mg/dL" },\n      ],\n      next: {\n        possiveis: ["tempo", "avc_hipoglicemia_persistente"],\n        escolher: (values) => {\n          const glicemia = toNumber(values.glicemia_pos_correcao);\n          return glicemia !== null && glicemia >= 60 ? "tempo" : "avc_hipoglicemia_persistente";\n        },\n      },\n    },\n\n    avc_hipoglicemia_persistente: {\n      id: "avc_hipoglicemia_persistente",\n      type: "action",\n      title: "Hipoglicemia persiste — repetir correção e investigar",\n      summary: "A glicemia continua abaixo do limiar de segurança informado. Não trate como déficit neurológico definitivo enquanto a hipoglicemia persistir.",\n      actions: [\n        "Repetir glicose IV titulada e nova glicemia em cerca de 15 minutos.",\n        "Revisar causa: insulina/sulfonilureia, jejum prolongado, álcool, insuficiência hepática/renal, sepse e outros precipitantes.",\n        "Se houver uso de sulfonilureia ou recorrência apesar de glicose, considerar toxicologia/terapia específica conforme protocolo institucional.",\n        "Continuar o fluxo de imagem do AVC em paralelo se a suspeita clínica permanecer.",\n      ],\n      next: "tempo",\n    },\n\n    avc_hiperglicemia: {\n      id: "avc_hiperglicemia",\n      type: "action",\n      title: "Hiperglicemia detectada — conduzir sem atraso da reperfusão",\n      summary: "Glicemia informada: {glicemia} mg/dL. No AVC agudo, evitar hiperglicemia persistente e também evitar correção intensiva que provoque hipoglicemia.",\n      actions: [\n        "Manter a neuroimagem e a avaliação de reperfusão em paralelo — glicemia elevada isoladamente não deve atrasar TC/angioTC.",\n        "Se a glicemia permanecer > 180 mg/dL, usar protocolo hospitalar de insulina com alvo usual de 140–180 mg/dL e monitorização seriada; NÃO perseguir 80–130 mg/dL no AVC agudo.",\n        "Se glicemia ≥ 250 mg/dL, cetose, acidose, desidratação importante ou alteração metabólica desproporcional, colher eletrólitos/gasometria/cetonas e considerar CAD/EHH em paralelo.",\n        "Reavaliar glicemia após a intervenção definida pelo protocolo institucional e vigiar hipoglicemia durante o tratamento.",\n      ],\n      interactions: [\n        { id: "hiperglicemia_plano", label: "Plano para hiperglicemia", kind: "choice", options: [\n          { id: "monitorar", label: "Monitorização seriada iniciada", value: "monitorar" },\n          { id: "insulina", label: "Protocolo de insulina iniciado", value: "insulina" },\n          { id: "cad_ehh", label: "Investigação/tratamento de CAD/EHH em paralelo", value: "cad_ehh" },\n        ] },\n      ],\n      next: "tempo",\n    },\n\n    tempo: {`,
    'roteamento automático da glicemia'
  );

  s = replaceOnce(
    s,
    `    isq_pa_check: {\n      id: "isq_pa_check",\n      type: "decision",\n      title: "Pressão arterial antes da trombólise",\n      question: "A PA está < 185/110 mmHg?",\n      summary: "PA informada: {pas}/{pad} mmHg.",\n      evidence: [\n        "Para trombolisar, a PA deve estar < 185/110 mmHg.",\n        "Após a trombólise, manter < 180/105 mmHg por 24 horas.",\n      ],\n      options: [\n        { id: "sim", label: "Sim — < 185/110", next: "trombolise" },\n        { id: "nao", label: "Não — ≥ 185/110", next: "isq_pa_tratar" },\n      ],\n    },`,
    `    isq_pa_check: {\n      id: "isq_pa_check",\n      type: "action",\n      title: "Pressão arterial antes da trombólise — classificação automática",\n      summary: "PA informada: {pas}/{pad} mmHg. O app compara o valor com o limite de 185/110 e encaminha para correção quando necessário.",\n      actions: [\n        "Limite para liberar trombólise IV: PAS < 185 mmHg E PAD < 110 mmHg.",\n        "Se qualquer um dos dois estiver acima do limite, o próximo passo abre a correção pressórica com doses e reavaliação.",\n        "Depois da trombólise, o alvo muda para < 180/105 mmHg por 24 horas.",\n      ],\n      next: {\n        possiveis: ["trombolise", "isq_pa_tratar"],\n        escolher: (values) => {\n          const pas = toNumber(values.pas);\n          const pad = toNumber(values.pad);\n          return pas !== null && pad !== null && pas < 185 && pad < 110 ? "trombolise" : "isq_pa_tratar";\n        },\n      },\n    },`,
    'classificação automática da PA'
  );

  // O passo de NIHSS já tinha calculadora embutida, mas estava depois de um
  // campo simplificado no primeiro card. Mantemos uma única fonte: esta.
  if (!s.includes('calculadora: "nihss"')) throw new Error('calculadora NIHSS embutida deixou de existir');

  write(rel, s);
}

// ── Hierarquia visual: cada registro precisa ter identidade clara ───────────
{
  const rel = 'components/protocol-screen/clinical-action-step-card.tsx';
  let s = read(rel);

  s = replaceOnce(
    s,
    '                <View key={item.id} style={e.interactionCard} testID={`acao-${item.id}`}>',
    `                <View\n                  key={item.id}\n                  style={[\n                    e.interactionCard,\n                    item.kind === "number" ? e.interactionCardNumber : item.kind === "choice" ? e.interactionCardChoice : e.interactionCardConfirm,\n                    atual !== undefined && e.interactionCardRecorded,\n                  ]}\n                  testID={\`acao-\${item.id}\`}\n                >`,
    'tom visual dos registros'
  );

  s = replaceOnce(
    s,
    `    interactionCard: {\n      gap: ESPACO.sm,\n      borderWidth: 1,\n      borderColor: t.cores.border,\n      borderRadius: RAIO.input,\n      padding: ESPACO.md,\n      backgroundColor: t.cores.surface,\n    },`,
    `    interactionCard: {\n      gap: ESPACO.sm,\n      borderWidth: 1,\n      borderLeftWidth: 4,\n      borderColor: t.cores.border,\n      borderRadius: RAIO.input,\n      padding: ESPACO.md,\n      backgroundColor: t.cores.surface,\n    },\n    interactionCardConfirm: { borderLeftColor: t.cores.success },\n    interactionCardChoice: { borderLeftColor: t.cores.primary },\n    interactionCardNumber: { borderLeftColor: t.cores.warning },\n    interactionCardRecorded: { borderColor: t.cores.success, backgroundColor: t.cores.bg },`,
    'estilos de contraste dos registros'
  );

  s = replaceOnce(
    s,
    '    operationalTitle: { ...TIPOGRAFIA.micro, color: t.cores.primary, fontWeight: "900", letterSpacing: 0.6 },',
    '    operationalTitle: { ...TIPOGRAFIA.caption, color: t.cores.primary, fontWeight: "900", letterSpacing: 0.5 },',
    'título operacional mais legível'
  );

  write(rel, s);
}

console.log('AVC corrigido: português, glicemia/PA automáticas, NIHSS sem duplicação e hierarquia visual reforçada.');
