#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceRequired(file, from, to, label) {
  const full = path.join(root, file);
  let s = fs.readFileSync(full, 'utf8');
  if (!s.includes(from)) throw new Error(`Missing expected text (${label}) in ${file}`);
  s = s.replace(from, to);
  fs.writeFileSync(full, s);
}

replaceRequired(
  'shock-decision-tree.ts',
  '        "Lactato acima de 2 mmol/L com pele alterada fecha hipoperfusão mesmo com pressão normal — é o choque compensado, e ele existe justamente porque a PA se mantém à custa de vasoconstrição.",',
  '        "Lactato elevado associado a sinais clínicos de má perfusão aumenta muito a suspeita de choque mesmo com pressão normal, mas não deve ser usado isoladamente para fechar o diagnóstico: interpretar tendência, contexto, depuração e causas não hipóxicas de hiperlactatemia.",',
  'lactate diagnostic certainty'
);

replaceRequired(
  'shock-decision-tree.ts',
  '        "Metas hemodinâmicas gerais: PAM ≥ 65 mmHg; normalização do lactato (alvo < 2 mmol/L ≈ 18 mg/dL), com queda esperada ≥ 10% por hora.",',
  '        "Perfusão e pressão: usar PAM como alvo inicial e individualizar pela etiologia e pelo paciente. No choque séptico, PAM 65 mmHg é o alvo inicial de referência; em outros fenótipos, ajustar conforme perfusão, história de hipertensão, cérebro/coração e resposta ao tratamento. Acompanhar lactato seriado quando elevado, mas não perseguir normalização ou queda percentual horária como meta isolada.",',
  'MAP and lactate targets'
);

replaceRequired(
  'shock-decision-tree.ts',
  '        "Ressuscitação volêmica guiada por resposta: repetir a prova de fluido-responsividade enquanto os parâmetros sugerirem resposta a volume — não infundir volume fixo no automático.",',
  '        "Fluidos: após a abordagem inicial, só continuar expansão quando houver indicação clínica e probabilidade de responsividade. Preferir variáveis dinâmicas (elevação passiva das pernas, mudança de volume sistólico/débito após pequena prova de fluido, variação de pressão de pulso quando aplicável) a marcadores estáticos isolados; reavaliar perfusão e sinais de congestão após cada intervenção.",',
  'fluid responsiveness'
);

replaceRequired(
  'shock-decision-tree.ts',
  '        "Linha arterial para PAM quando a dose de noradrenalina passar de 0,3–0,5 mcg/kg/min, ou por outra indicação de monitorização invasiva.",',
  '        "Pressão arterial invasiva: considerar cateter arterial quando o choque não responder à terapia inicial e/ou houver necessidade de infusão vasopressora, especialmente se titulação rápida ou medidas não invasivas forem pouco confiáveis — não esperar uma dose fixa de noradrenalina para indicar.",',
  'arterial line indication'
);

replaceRequired(
  'shock-decision-tree.ts',
  '        "Exames para todos: lactato, gasometria, hemograma, PCR, ureia, creatinina, eletrólitos, cálcio iônico, magnésio, bilirrubinas, troponina, coagulograma, D-dímero, fibrinogênio, ECG, RX de tórax e ecocardiograma.",',
  '        "Investigação inicial dirigida: obter rapidamente lactato e exames básicos de função orgânica/metabólica, ECG quando pertinente e exames etiológicos conforme o fenótipo. Não pedir D-dímero, fibrinogênio, troponina, radiografia ou ecocardiograma como painel obrigatório para todo choque; cada exame deve responder a uma hipótese clínica ou necessidade de monitorização.",',
  'universal test panel'
);

replaceRequired(
  'shock-decision-tree.ts',
  '        "POCUS/RUSH à beira leito quando a causa não for rapidamente evidente, quando o paciente não responder ao manejo inicial, ou na deterioração clínica rápida.",',
  '        "Ecocardiografia/POCUS é a modalidade de imagem de primeira linha para definir o tipo de choque quando disponível, especialmente se a causa não for evidente, houver choque persistente após terapia inicial ou deterioração rápida. Integrar coração, pulmões, veias e contexto clínico; não usar um achado ultrassonográfico isolado como diagnóstico definitivo.",',
  'first-line echo'
);

const i18nFile = path.join(root, 'lib/i18n/modules/choque.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor='\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected choque i18n ending');
const entries = [
['Lactato elevado associado a sinais clínicos de má perfusão aumenta muito a suspeita de choque mesmo com pressão normal, mas não deve ser usado isoladamente para fechar o diagnóstico: interpretar tendência, contexto, depuração e causas não hipóxicas de hiperlactatemia.','El lactato elevado asociado a signos clínicos de mala perfusión aumenta mucho la sospecha de shock incluso con presión normal, pero no debe usarse de forma aislada para confirmar el diagnóstico: interpretar tendencia, contexto, depuración y causas no hipóxicas de hiperlactatemia.'],
['Perfusão e pressão: usar PAM como alvo inicial e individualizar pela etiologia e pelo paciente. No choque séptico, PAM 65 mmHg é o alvo inicial de referência; em outros fenótipos, ajustar conforme perfusão, história de hipertensão, cérebro/coração e resposta ao tratamento. Acompanhar lactato seriado quando elevado, mas não perseguir normalização ou queda percentual horária como meta isolada.','Perfusión y presión: usar la PAM como objetivo inicial e individualizar según etiología y paciente. En shock séptico, una PAM de 65 mmHg es el objetivo inicial de referencia; en otros fenotipos, ajustar según perfusión, antecedente de hipertensión, cerebro/corazón y respuesta al tratamiento. Seguir lactato seriado cuando esté elevado, pero no perseguir normalización ni una caída porcentual por hora como objetivo aislado.'],
['Fluidos: após a abordagem inicial, só continuar expansão quando houver indicação clínica e probabilidade de responsividade. Preferir variáveis dinâmicas (elevação passiva das pernas, mudança de volume sistólico/débito após pequena prova de fluido, variação de pressão de pulso quando aplicável) a marcadores estáticos isolados; reavaliar perfusão e sinais de congestão após cada intervenção.','Fluidos: después del abordaje inicial, continuar expansión solo cuando exista indicación clínica y probabilidad de respuesta. Preferir variables dinámicas (elevación pasiva de piernas, cambio de volumen sistólico/gasto tras una pequeña prueba de fluido, variación de presión de pulso cuando corresponda) a marcadores estáticos aislados; reevaluar perfusión y signos de congestión tras cada intervención.'],
['Pressão arterial invasiva: considerar cateter arterial quando o choque não responder à terapia inicial e/ou houver necessidade de infusão vasopressora, especialmente se titulação rápida ou medidas não invasivas forem pouco confiáveis — não esperar uma dose fixa de noradrenalina para indicar.','Presión arterial invasiva: considerar catéter arterial cuando el shock no responda a la terapia inicial y/o exista necesidad de infusión vasopresora, especialmente si se requiere titulación rápida o las mediciones no invasivas son poco fiables; no esperar una dosis fija de noradrenalina para indicarlo.'],
['Investigação inicial dirigida: obter rapidamente lactato e exames básicos de função orgânica/metabólica, ECG quando pertinente e exames etiológicos conforme o fenótipo. Não pedir D-dímero, fibrinogênio, troponina, radiografia ou ecocardiograma como painel obrigatório para todo choque; cada exame deve responder a uma hipótese clínica ou necessidade de monitorização.','Investigación inicial dirigida: obtener rápidamente lactato y estudios básicos de función orgánica/metabólica, ECG cuando corresponda y pruebas etiológicas según el fenotipo. No solicitar dímero D, fibrinógeno, troponina, radiografía o ecocardiograma como panel obligatorio para todo shock; cada prueba debe responder a una hipótesis clínica o necesidad de monitorización.'],
['Ecocardiografia/POCUS é a modalidade de imagem de primeira linha para definir o tipo de choque quando disponível, especialmente se a causa não for evidente, houver choque persistente após terapia inicial ou deterioração rápida. Integrar coração, pulmões, veias e contexto clínico; não usar um achado ultrassonográfico isolado como diagnóstico definitivo.','La ecocardiografía/POCUS es la modalidad de imagen de primera línea para definir el tipo de shock cuando esté disponible, especialmente si la causa no es evidente, persiste el shock tras la terapia inicial o existe deterioro rápido. Integrar corazón, pulmones, venas y contexto clínico; no usar un hallazgo ecográfico aislado como diagnóstico definitivo.']
];
for(const [pt,es] of entries){if(!i18n.includes(JSON.stringify(pt))) i18n=i18n.slice(0,-anchor.length)+`  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n`+anchor;}
fs.writeFileSync(i18nFile,i18n);
console.log('✅ Choque: avaliação, fluid responsiveness, monitorização e investigação alinhadas à ESICM 2025.');
