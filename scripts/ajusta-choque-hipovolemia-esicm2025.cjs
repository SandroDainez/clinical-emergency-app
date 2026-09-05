const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceOnce(file, oldText, newText) {
  const p = path.join(root, file);
  let src = fs.readFileSync(p, 'utf8');
  if (!src.includes(oldText)) throw new Error(`${file}: bloco esperado não encontrado`);
  src = src.replace(oldText, newText);
  fs.writeFileSync(p, src);
}

replaceOnce(
  'shock-decision-tree.ts',
`      question: "Sangramento ativo, vômitos/diarreia, queimadura ou trauma com perda volêmica?",
      evidence: [
        "Veias colabadas, resposta a volume, hematócrito/lactato, foco de perda evidente.",
        "Perfil de cabeceira que separa os tipos: extremidades FRIAS, pressão de pulso < 25 mmHg, enchimento capilar > 3 s e SvcO₂ < 70% apontam para hipovolêmico, cardiogênico ou obstrutivo. Extremidades QUENTES, pressão de pulso > 40 mmHg, enchimento capilar < 3 s e SvcO₂ normal ou alta apontam para distributivo.",
      ],`,
`      question: "Há perda de volume conhecida ou provável, inclusive hemorragia oculta?",
      evidence: [
        "A ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta. Integre mecanismo, exame, tendência hemodinâmica, hemoglobina/lactato, FAST/POCUS quando pertinente e resposta à ressuscitação.",
        "Extremidades frias, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque; há sobreposição e fenótipos mistos.",
        "Na reavaliação, acompanhar enchimento capilar em série junto com pressão, diurese, estado mental e lactato quando elevado; SvcO₂ deve ser interpretada em série e no contexto, não como classificador isolado do subtipo.",
        "Quando a causa permanecer incerta ou a resposta inicial for inadequada, usar ecocardiografia/POCUS como imagem de primeira linha para caracterizar o fenótipo hemodinâmico.",
        "Antes de repetir fluidos, avaliar responsividade a fluido com variáveis dinâmicas quando aplicáveis, como elevação passiva das pernas e mudança de volume sistólico/débito após pequena prova de fluido.",
        "Não usar um marcador estático isolado de pré-carga como prova de hipovolemia nem como autorização automática para expansão volêmica.",
      ],`
);

replaceOnce(
  'lib/i18n/modules/choque-einstein.ts',
`  "Perfil de cabeceira que separa os tipos: extremidades FRIAS, pressão de pulso < 25 mmHg, enchimento capilar > 3 s e SvcO₂ < 70% apontam para hipovolêmico, cardiogênico ou obstrutivo. Extremidades QUENTES, pressão de pulso > 40 mmHg, enchimento capilar < 3 s e SvcO₂ normal ou alta apontam para distributivo.":
    "Perfil de cabecera que separa los tipos: extremidades FRÍAS, presión de pulso < 25 mmHg, llenado capilar > 3 s y SvcO₂ < 70% orientan a hipovolémico, cardiogénico u obstructivo. Extremidades CALIENTES, presión de pulso > 40 mmHg, llenado capilar < 3 s y SvcO₂ normal o alta orientan a distributivo.",`,
`  "Há perda de volume conhecida ou provável, inclusive hemorragia oculta?":
    "¿Hay pérdida de volumen conocida o probable, incluida hemorragia oculta?",
  "A ausência de uma perda externa óbvia não exclui hipovolemia ou hemorragia oculta. Integre mecanismo, exame, tendência hemodinâmica, hemoglobina/lactato, FAST/POCUS quando pertinente e resposta à ressuscitação.":
    "La ausencia de una pérdida externa evidente no excluye hipovolemia ni hemorragia oculta. Integre mecanismo, examen, tendencia hemodinámica, hemoglobina/lactato, FAST/POCUS cuando corresponda y respuesta a la reanimación.",
  "Extremidades frias, pressão de pulso, enchimento capilar e SvcO₂ ajudam a caracterizar perfusão, mas NÃO separam de forma rígida o tipo de choque; há sobreposição e fenótipos mistos.":
    "Las extremidades frías, la presión de pulso, el llenado capilar y la SvcO₂ ayudan a caracterizar la perfusión, pero NO separan de forma rígida el tipo de shock; existe superposición y fenotipos mixtos.",
  "Na reavaliação, acompanhar enchimento capilar em série junto com pressão, diurese, estado mental e lactato quando elevado; SvcO₂ deve ser interpretada em série e no contexto, não como classificador isolado do subtipo.":
    "En la reevaluación, seguir el llenado capilar en serie junto con presión, diuresis, estado mental y lactato cuando esté elevado; la SvcO₂ debe interpretarse en serie y en contexto, no como clasificador aislado del subtipo.",
  "Quando a causa permanecer incerta ou a resposta inicial for inadequada, usar ecocardiografia/POCUS como imagem de primeira linha para caracterizar o fenótipo hemodinâmico.":
    "Cuando la causa siga siendo incierta o la respuesta inicial sea inadecuada, usar ecocardiografía/POCUS como imagen de primera línea para caracterizar el fenotipo hemodinámico.",
  "Antes de repetir fluidos, avaliar responsividade a fluido com variáveis dinâmicas quando aplicáveis, como elevação passiva das pernas e mudança de volume sistólico/débito após pequena prova de fluido.":
    "Antes de repetir fluidos, evaluar la respuesta a fluidos con variables dinámicas cuando sean aplicables, como elevación pasiva de piernas y cambio del volumen sistólico/gasto tras una pequeña prueba de fluidos.",
  "Não usar um marcador estático isolado de pré-carga como prova de hipovolemia nem como autorização automática para expansão volêmica.":
    "No usar un marcador estático aislado de precarga como prueba de hipovolemia ni como autorización automática para expansión con fluidos.",`
);

console.log('Choque hipovolêmico alinhado à avaliação integrada ESICM 2025.');
