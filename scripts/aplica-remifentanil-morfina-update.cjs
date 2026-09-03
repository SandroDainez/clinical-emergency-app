#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, "utf8");
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

const remiBlock = `  {
    key: "remifentanil",
    group: "analgesia",
    name: "Remifentanil",
    className: "Opioide ultracurto",
    emoji: "🟢",
    displayUnit: "mcg/mL",
    presentations: [
      { id: "fa2", label: "Frasco-ampola 2 mg (pó liofilizado)", ampouleVolumeMl: 0, basePerAmpoule: 2000, concentrationLabel: "pó — concentração definida após diluição",
        fonte: "Cloridrato de remifentanila 2 mg, pó liofilizado para solução injetável (Eurofarma; registro 1.0043.1327). Bula profissional brasileira atualizada conforme Bula Padrão ANVISA em 03/07/2026; concentração adulta recomendada após diluição: 50 mcg/mL." },
    ],
    standardSolutions: [
      { id: "adulto50", label: "50 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 40 mL → 40 mL", presentationId: "fa2", ampoules: "1", diluentMl: "40", diluent: "SF" },
      { id: "adulto20", label: "20 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 100 mL → 100 mL", presentationId: "fa2", ampoules: "1", diluentMl: "100", diluent: "SF" },
    ],
    modes: [
      {
        id: "inf", label: "Infusão contínua — UTI ventilada", kind: "infusion", unit: "mcg/kg/min", defaultDose: "0,1",
        ranges: [
          { upTo: 0.15, tone: "green", label: "Faixa inicial recomendada em UTI", indication: "0,10–0,15 mcg/kg/min; titular à analgesia e sedação" },
          { upTo: 0.2, tone: "yellow", label: "Titulação antes de acrescentar sedativo", indication: "Ajustar em incrementos de 0,025 mcg/kg/min, com intervalo mínimo de 5 min" },
          { upTo: 0.74, tone: "orange", label: "Faixa típica descrita em bula para UTI", indication: "0,006–0,74 mcg/kg/min; acima de 0,2, aumentos adicionais devem responder a necessidade de ANALGESIA, não substituir sedativo quando o alvo de sedação não foi atingido" },
          { upTo: null, tone: "red", label: "Acima da faixa típica descrita em bula para UTI", indication: "Reavaliar indicação, analgesia, sedação concomitante e efeitos hemodinâmicos; 0,74 mcg/kg/min é limite da faixa típica descrita, não fronteira farmacológica universal" },
        ],
      },
    ],
    strategy: [
      "Opioide de ação ultracurta para analgosedação em paciente mecanicamente ventilado quando se deseja titulação rápida e despertar previsível.",
      "Metabolizado por esterases inespecíficas de sangue e tecidos; o efeito desaparece rapidamente após redução ou interrupção da infusão.",
      "Se a sedação estiver inadequada a 0,2 mcg/kg/min, adicionar/titular sedativo apropriado; aumentos posteriores de remifentanil devem responder à necessidade de analgesia adicional.",
    ],
    alert: {
      icon: "⚠️", tone: "warn",
      lines: [
        "UTI: NÃO administrar em bolus. A bula brasileira recomenda infusão contínua, com ajuste em incrementos de 0,025 mcg/kg/min e intervalo mínimo de 5 min.",
        "Bradicardia, hipotensão, depressão respiratória e rigidez muscular podem ocorrer; reduzir/interromper a infusão e oferecer suporte conforme a gravidade.",
        "A interrupção da linha pode retirar analgesia em poucos minutos. Usar linha exclusiva ou de fluxo rápido próxima à cânula e vigiar obstrução/desconexão.",
        "ANTES de suspender, instituir analgesia alternativa com antecedência suficiente: não há atividade opioide residual clinicamente relevante cerca de 5–10 min após a descontinuação.",
      ],
    },
    info: [
      "Insuficiência renal, inclusive terapia renal substitutiva: a bula não exige ajuste inicial específico; titular ao efeito e monitorar.",
      "Insuficiência hepática: não há ajuste farmacocinético rotineiro, mas hepatopatia grave pode aumentar sensibilidade à depressão respiratória.",
      "A bula brasileira relata estudos controlados em UTI por até 3 dias e dados mais longos limitados; não transformar 3 dias em teto automático, mas reavaliar necessidade e estratégia em uso prolongado.",
      "Faixa típica de UTI na bula: 0,006–0,74 mcg/kg/min. Para procedimentos estimulantes em ventilados, foram usados valores médios de 0,25 e máximos de 0,75 mcg/kg/min — contexto procedural, não alvo basal de sedação.",
    ],
    reference: "Bula profissional cloridrato de remifentanila Eurofarma/ANVISA, atualização 03/07/2026 · SCCM PADIS 2018 + Focused Update 2025 · estudos de analgosedação baseada em remifentanil em UTI.",
  },
`;

replaceOnce(
  "sedation-engine.ts",
  "insert-remifentanil",
  '  {\n    key: "morfina",',
  remiBlock + '  {\n    key: "morfina",'
);

replaceOnce(
  "sedation-engine.ts",
  "morphine-renal-strategy",
  '      "Evitar em insuficiência renal (acúmulo de M6G) — preferir fentanil.",',
  '      "Em disfunção renal significativa, sobretudo no uso contínuo/prolongado, M3G/M6G podem acumular: reduzir dose e/ou alongar intervalo, ou preferir opioide sem metabólitos ativos relevantes como fentanil/remifentanil.",'
);
replaceOnce(
  "sedation-engine.ts",
  "morphine-renal-alert",
  '        "Metabólito ativo (M6G) acumula em IRA — preferir fentanil.",',
  '        "Disfunção renal: M3G/M6G acumulam e podem prolongar sedação/depressão respiratória; no uso contínuo ou prolongado, reduzir/intervalar ou preferir fentanil/remifentanil.",'
);
replaceOnce(
  "sedation-engine.ts",
  "morphine-reference",
  '    reference: "SCCM PADIS 2018 · ESC Heart Failure Guidelines 2021/ACVC scientific statement sobre opioides na insuficiência cardíaca aguda.",',
  '    reference: "SCCM PADIS 2018 + Focused Update 2025 · revisões farmacocinéticas de opioides em UTI · ESC Heart Failure Guidelines 2021/ACVC scientific statement sobre opioides na insuficiência cardíaca aguda.",'
);

const i18nFile = path.join(root, "lib/i18n/modules/sedacao.ts");
let i18n = fs.readFileSync(i18nFile, "utf8");
const marker = '  "Morfina": "Morfina",';
if (!i18n.includes('"Remifentanil": "Remifentanilo"')) {
  if (!i18n.includes(marker)) throw new Error("i18n sedacao: marcador Morfina não encontrado");
  i18n = i18n.replace(marker, '  "Remifentanil": "Remifentanilo",\n  "Opioide ultracurto": "Opioide ultracorto",\n' + marker);
}
const translations = `
  // ── Remifentanil em UTI · morfina e disfunção renal ──────────────────────
  "Frasco-ampola 2 mg (pó liofilizado)": "Frasco-ampolla 2 mg (polvo liofilizado)",
  "pó — concentração definida após diluição": "polvo — concentración definida después de la dilución",
  "50 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 40 mL → 40 mL": "50 mcg/mL · 1 frasco (2 mg) + diluyente c.s.p. 40 mL → 40 mL",
  "20 mcg/mL · 1 fr (2 mg) + diluente q.s.p. 100 mL → 100 mL": "20 mcg/mL · 1 frasco (2 mg) + diluyente c.s.p. 100 mL → 100 mL",
  "Infusão contínua — UTI ventilada": "Infusión continua — UCI ventilada",
  "Faixa inicial recomendada em UTI": "Rango inicial recomendado en UCI",
  "0,10–0,15 mcg/kg/min; titular à analgesia e sedação": "0,10–0,15 mcg/kg/min; titular según analgesia y sedación",
  "Titulação antes de acrescentar sedativo": "Titulación antes de añadir un sedante",
  "Ajustar em incrementos de 0,025 mcg/kg/min, com intervalo mínimo de 5 min": "Ajustar en incrementos de 0,025 mcg/kg/min, con intervalo mínimo de 5 min",
  "Faixa típica descrita em bula para UTI": "Rango típico descrito en el prospecto para UCI",
  "0,006–0,74 mcg/kg/min; acima de 0,2, aumentos adicionais devem responder a necessidade de ANALGESIA, não substituir sedativo quando o alvo de sedação não foi atingido": "0,006–0,74 mcg/kg/min; por encima de 0,2, los aumentos adicionales deben responder a necesidad de ANALGESIA, no sustituir al sedante cuando no se alcanzó el objetivo de sedación",
  "Acima da faixa típica descrita em bula para UTI": "Por encima del rango típico descrito en el prospecto para UCI",
  "Reavaliar indicação, analgesia, sedação concomitante e efeitos hemodinâmicos; 0,74 mcg/kg/min é limite da faixa típica descrita, não fronteira farmacológica universal": "Reevaluar indicación, analgesia, sedación concomitante y efectos hemodinámicos; 0,74 mcg/kg/min es el límite del rango típico descrito, no una frontera farmacológica universal",
  "Opioide de ação ultracurta para analgosedação em paciente mecanicamente ventilado quando se deseja titulação rápida e despertar previsível.": "Opioide de acción ultracorta para analgosedación en el paciente con ventilación mecánica cuando se desea titulación rápida y despertar predecible.",
  "Metabolizado por esterases inespecíficas de sangue e tecidos; o efeito desaparece rapidamente após redução ou interrupção da infusão.": "Metabolizado por esterasas inespecíficas de sangre y tejidos; el efecto desaparece rápidamente tras reducir o interrumpir la infusión.",
  "Se a sedação estiver inadequada a 0,2 mcg/kg/min, adicionar/titular sedativo apropriado; aumentos posteriores de remifentanil devem responder à necessidade de analgesia adicional.": "Si la sedación es inadecuada a 0,2 mcg/kg/min, añadir/titular un sedante apropiado; los aumentos posteriores de remifentanilo deben responder a la necesidad de analgesia adicional.",
  "UTI: NÃO administrar em bolus. A bula brasileira recomenda infusão contínua, com ajuste em incrementos de 0,025 mcg/kg/min e intervalo mínimo de 5 min.": "UCI: NO administrar en bolo. El prospecto brasileño recomienda infusión continua, con ajustes en incrementos de 0,025 mcg/kg/min y un intervalo mínimo de 5 min.",
  "Bradicardia, hipotensão, depressão respiratória e rigidez muscular podem ocorrer; reduzir/interromper a infusão e oferecer suporte conforme a gravidade.": "Pueden ocurrir bradicardia, hipotensión, depresión respiratoria y rigidez muscular; reducir/interrumpir la infusión y brindar soporte según la gravedad.",
  "A interrupção da linha pode retirar analgesia em poucos minutos. Usar linha exclusiva ou de fluxo rápido próxima à cânula e vigiar obstrução/desconexão.": "La interrupción de la línea puede retirar la analgesia en pocos minutos. Usar una línea exclusiva o de flujo rápido próxima a la cánula y vigilar obstrucción/desconexión.",
  "ANTES de suspender, instituir analgesia alternativa com antecedência suficiente: não há atividade opioide residual clinicamente relevante cerca de 5–10 min após a descontinuação.": "ANTES de suspender, instaurar analgesia alternativa con suficiente antelación: no queda actividad opioide residual clínicamente relevante aproximadamente 5–10 min después de la suspensión.",
  "Insuficiência renal, inclusive terapia renal substitutiva: a bula não exige ajuste inicial específico; titular ao efeito e monitorar.": "Insuficiencia renal, incluso terapia renal sustitutiva: el prospecto no exige un ajuste inicial específico; titular al efecto y monitorizar.",
  "Insuficiência hepática: não há ajuste farmacocinético rotineiro, mas hepatopatia grave pode aumentar sensibilidade à depressão respiratória.": "Insuficiencia hepática: no hay ajuste farmacocinético rutinario, pero la hepatopatía grave puede aumentar la sensibilidad a la depresión respiratoria.",
  "A bula brasileira relata estudos controlados em UTI por até 3 dias e dados mais longos limitados; não transformar 3 dias em teto automático, mas reavaliar necessidade e estratégia em uso prolongado.": "El prospecto brasileño informa estudios controlados en UCI de hasta 3 días y datos más prolongados limitados; no convertir 3 días en un límite automático, sino reevaluar necesidad y estrategia en uso prolongado.",
  "Faixa típica de UTI na bula: 0,006–0,74 mcg/kg/min. Para procedimentos estimulantes em ventilados, foram usados valores médios de 0,25 e máximos de 0,75 mcg/kg/min — contexto procedural, não alvo basal de sedação.": "Rango típico de UCI en el prospecto: 0,006–0,74 mcg/kg/min. Para procedimientos estimulantes en pacientes ventilados se usaron valores medios de 0,25 y máximos de 0,75 mcg/kg/min — contexto procedimental, no objetivo basal de sedación.",
  "Em disfunção renal significativa, sobretudo no uso contínuo/prolongado, M3G/M6G podem acumular: reduzir dose e/ou alongar intervalo, ou preferir opioide sem metabólitos ativos relevantes como fentanil/remifentanil.": "En disfunción renal significativa, sobre todo con uso continuo/prolongado, M3G/M6G pueden acumularse: reducir la dosis y/o alargar el intervalo, o preferir un opioide sin metabolitos activos relevantes como fentanilo/remifentanilo.",
  "Disfunção renal: M3G/M6G acumulam e podem prolongar sedação/depressão respiratória; no uso contínuo ou prolongado, reduzir/intervalar ou preferir fentanil/remifentanil.": "Disfunción renal: M3G/M6G se acumulan y pueden prolongar la sedación/depresión respiratoria; con uso continuo o prolongado, reducir/espaciar o preferir fentanilo/remifentanilo.",
`;
if (!i18n.includes('"Frasco-ampola 2 mg (pó liofilizado)"')) {
  const end = i18n.lastIndexOf("};");
  if (end < 0) throw new Error("i18n sedacao: fechamento não encontrado");
  i18n = i18n.slice(0, end) + translations + i18n.slice(end);
}
fs.writeFileSync(i18nFile, i18n);

console.log("✅ Remifentanil: caminho operacional de UTI adicionado; morfina renal passou de veto absoluto para ajuste/preferência contextual.");
