import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { AppDesign } from "../../constants/app-design";
import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";

type Sex = "male" | "female";
type Access = "peripheral" | "central";
type PhosphateSalt = "potassium" | "sodium";
type ElectrolyteKey = "sodium" | "potassium" | "calcium" | "magnesium" | "phosphate" | "chloride";
type DisorderKey =
  | "hyponatremia"
  | "hypernatremia"
  | "hypokalemia"
  | "hyperkalemia"
  | "hypocalcemia"
  | "hypercalcemia"
  | "hypomagnesemia"
  | "hypermagnesemia"
  | "hypophosphatemia"
  | "hyperphosphatemia"
  | "hypochloremia"
  | "hyperchloremia";

type ResultBlock = {
  title: string;
  tone?: "info" | "warning" | "danger";
  lines: string[];
};

type Metric = {
  label: string;
  value: string;
};

type CalcResult = {
  headline: string;
  metrics: Metric[];
  alerts: ResultBlock[];
  strategy: ResultBlock[];
  practical: ResultBlock[];
  summary: ResultBlock[];
};

const ELECTROLYTES: {
  key: ElectrolyteKey;
  label: string;
  short: string;
  icon: string;
  hypo: DisorderKey;
  hyper: DisorderKey;
}[] = [
  { key: "sodium", label: "Sódio", short: "Na+", icon: "Na", hypo: "hyponatremia", hyper: "hypernatremia" },
  { key: "potassium", label: "Potássio", short: "K+", icon: "K", hypo: "hypokalemia", hyper: "hyperkalemia" },
  { key: "calcium", label: "Cálcio", short: "Ca", icon: "Ca", hypo: "hypocalcemia", hyper: "hypercalcemia" },
  { key: "magnesium", label: "Magnésio", short: "Mg", icon: "Mg", hypo: "hypomagnesemia", hyper: "hypermagnesemia" },
  { key: "phosphate", label: "Fósforo", short: "P", icon: "P", hypo: "hypophosphatemia", hyper: "hyperphosphatemia" },
  { key: "chloride", label: "Cloro", short: "Cl-", icon: "Cl", hypo: "hypochloremia", hyper: "hyperchloremia" },
];

function fmt(value: number | null | undefined, decimals = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toFixed(decimals).replace(".", ",");
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function tbw(weightKg: number, sex: Sex, elderly: boolean): number {
  if (sex === "male") return weightKg * (elderly ? 0.5 : 0.6);
  return weightKg * (elderly ? 0.45 : 0.5);
}

function lineWithVolume(amountLabel: string, volumeMl: number, solutionLabel: string): string {
  return `${amountLabel} (${fmt(volumeMl, 1)} mL de ${solutionLabel})`;
}

function buildToneColor(tone: ResultBlock["tone"]) {
  if (tone === "danger") return { bg: "#fee2e2", border: "#fca5a5", title: "#991b1b" };
  if (tone === "warning") return { bg: "#ffedd5", border: "#fdba74", title: "#9a3412" };
  return { bg: "#eef4ff", border: "#bfd0ea", title: "#16356b" };
}

function getElectrolyteLabel(key: ElectrolyteKey): string {
  return ELECTROLYTES.find((item) => item.key === key)?.label ?? "Eletrólito";
}

function getDisorderLabel(disorder: DisorderKey): string {
  const labels: Record<DisorderKey, string> = {
    hyponatremia: "Hiponatremia",
    hypernatremia: "Hipernatremia",
    hypokalemia: "Hipocalemia",
    hyperkalemia: "Hipercalemia",
    hypocalcemia: "Hipocalcemia",
    hypercalcemia: "Hipercalcemia",
    hypomagnesemia: "Hipomagnesemia",
    hypermagnesemia: "Hipermagnesemia",
    hypophosphatemia: "Hipofosfatemia",
    hyperphosphatemia: "Hiperfosfatemia",
    hypochloremia: "Hipocloremia",
    hyperchloremia: "Hipercloremia",
  };
  return labels[disorder];
}

function getMetricLabel(label: string): string {
  if (label === "TBW") return "Água corporal total";
  if (label === "HCO3-") return "Bicarbonato";
  return label;
}

function getBlockTitle(title: string): string {
  if (title === "Thresholds úteis") return "Pontos de gravidade";
  return title;
}

function getInitialStrategyLines(disorder: DisorderKey, headline: string): string[] {
  switch (disorder) {
    case "hyponatremia":
      return [
        "Fase 1: se houver neurogravidade, fazer resgate inicial com salina hipertônica e redosar o sódio logo após.",
        "Fase 2: depois do resgate, seguir correção lenta ao longo das próximas 24 horas, com meta conservadora.",
      ];
    case "hypernatremia":
      return [
        "Fase 1: se houver hipovolemia ou choque, estabilizar perfusão antes de focar na água livre.",
        "Fase 2: após estabilização, programar a correção ao longo de 24 horas e recalcular com sódio seriado.",
      ];
    default:
      return [headline];
  }
}

function calculateResult(args: {
  electrolyte: ElectrolyteKey;
  disorder: DisorderKey;
  sex: Sex;
  elderly: boolean;
  access: Access;
  weightKg: number | null;
  current: number | null;
  target: number | null;
  glucose: number | null;
  albumin: number | null;
  bagVolumeMl: number | null;
  infusionHours: number | null;
  plannedVolumeL: number | null;
  phosphateSalt: PhosphateSalt;
  potassiumCurrent: number | null;
  bicarbonate: number | null;
  renalDysfunction: boolean;
  ecgChanges: boolean;
}): CalcResult {
  const {
    electrolyte,
    disorder,
    sex,
    elderly,
    access,
    weightKg,
    current,
    target,
    glucose,
    albumin,
    bagVolumeMl,
    infusionHours,
    plannedVolumeL,
    phosphateSalt,
    potassiumCurrent,
    bicarbonate,
    renalDysfunction,
    ecgChanges,
  } = args;

  if (weightKg == null || current == null) {
    return {
      headline: "Preencha pelo menos peso e valor atual para destravar o cálculo.",
      metrics: [
        { label: "Eletrólito", value: getElectrolyteLabel(electrolyte) },
        { label: "Distúrbio", value: getDisorderLabel(disorder) },
      ],
      alerts: [],
      strategy: [],
      practical: [],
      summary: [],
    };
  }

  const totalBodyWater = tbw(weightKg, sex, elderly);
  const hours = infusionHours ?? 6;
  const bagMl = bagVolumeMl ?? 250;
  const plannedL = plannedVolumeL ?? 1;

  switch (disorder) {
    case "hyponatremia": {
      const correctedNa =
        glucose && glucose > 100 ? current + 1.6 * ((glucose - 100) / 100) : current;
      const goal = target ?? Math.min(correctedNa + 6, 130);
      const deltaNeeded = Math.max(goal - correctedNa, 0);
      const severe = correctedNa < 120;
      const sodiumDeficit = totalBodyWater * deltaNeeded;
      const deltaPerL3 = (513 - correctedNa) / (totalBodyWater + 1);
      const volume3PctMl = deltaPerL3 > 0 ? (deltaNeeded / deltaPerL3) * 1000 : 0;
      const deltaPerL09 = (154 - correctedNa) / (totalBodyWater + 1);
      return {
        headline: "Hiponatremia: decidir pela gravidade neurológica e pela cronicidade presumida antes de escolher o ritmo de correção.",
        metrics: [
          { label: "Na corrigido", value: `${fmt(correctedNa, 1)} mEq/L` },
          { label: "TBW", value: `${fmt(totalBodyWater, 1)} L` },
          { label: "Meta inicial", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Déficit estimado", value: `${fmt(sodiumDeficit, 0)} mEq` },
        ],
        alerts: severe
          ? [
              {
                title: "Alerta de segurança",
                tone: "danger",
                lines: [
                  "Na corrigido < 120 mEq/L exige redosagem precoce e vigilância para neurogravidade e sobrecorreção.",
                ],
              },
            ]
          : [],
        strategy: [
          {
            title: "Cálculo principal",
            lines: [
              `Elevação desejada inicial: ${fmt(deltaNeeded, 1)} mEq/L.`,
              `3% NaCl tende a elevar ~ ${fmt(deltaPerL3, 2)} mEq/L por litro pelo modelo de Adrogue-Madias.`,
              `Volume teórico de NaCl 3% para essa meta: ${fmt(volume3PctMl, 0)} mL.`,
              `Em hiponatremia grave sintomática, estratégia prática: bolus de 150 mL de NaCl 3% e reavaliar clínica + sódio.`,
              `Limite de correção inicial: evitar passar de 8–10 mEq/L em 24 h se duração incerta ou crônica; se alto risco de desmielinização, mirar ainda menos.`,
            ],
            tone: "warning",
          },
          {
            title: "Contexto clínico",
            lines: [
              severe
                ? "Na corrigido < 120 mEq/L reforça gravidade laboratorial, mas o que decide salina hipertônica é principalmente a clínica neurológica."
                : "Se Na >= 120 mEq/L e sem neurogravidade, a pressa costuma ser menor e a causa passa a guiar mais a estratégia.",
              `NaCl 3%: 513 mEq/L de sódio.`,
              `NaCl 0,9%: 154 mEq/L; pela mesma conta, eleva ~ ${fmt(deltaPerL09, 2)} mEq/L por litro neste caso.`,
              `Se houver hiperglicemia, usar Na corrigido antes de decidir a reposição.`,
            ],
          },
        ],
        practical: [
          {
            title: "Preparos práticos",
            lines: [
              `Bolus sintomático: 150 mL de NaCl 3% já pronto, com nova dosagem de sódio após cada bolus.`,
              `Se for programar ${fmt(volume3PctMl, 0)} mL de NaCl 3%, dividir em fases curtas e repetir laboratório a cada 2–4 h.`,
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Cefaleia, náusea, vômitos, confusão, sonolência e convulsão.",
              "Quanto mais aguda a queda, maior o risco de edema cerebral.",
              "Se convulsão, rebaixamento ou herniação iminente: tratar primeiro, explicar depois.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypernatremia": {
      const goal = target ?? Math.max(current - 8, 145);
      const dropNeeded = Math.max(current - goal, 0);
      const severe = current >= 160;
      const waterDeficitTo140 = totalBodyWater * ((current / 140) - 1);
      const waterToGoal = totalBodyWater * ((current / goal) - 1);
      const deltaPerLD5W = (0 - current) / (totalBodyWater + 1);
      const litersD5W = deltaPerLD5W < 0 ? dropNeeded / Math.abs(deltaPerLD5W) : 0;
      const deltaPerLHalfHalf = (77 - current) / (totalBodyWater + 1);
      const litersHalfHalf = deltaPerLHalfHalf < 0 ? dropNeeded / Math.abs(deltaPerLHalfHalf) : 0;
      const targetInfusateNa = Math.max(
        0,
        Math.min(154, current - (dropNeeded / plannedL) * (totalBodyWater + 1))
      );
      const nacl20mlPerLiter = targetInfusateNa / 3.42;
      return {
        headline: "Hipernatremia: definir primeiro o cenário final da água livre, ressuscitar se necessário e então corrigir de forma seriada.",
        metrics: [
          { label: "TBW", value: `${fmt(totalBodyWater, 1)} L` },
          { label: "Déficit hídrico até 140", value: `${fmt(waterDeficitTo140, 2)} L` },
          { label: "Água para meta", value: `${fmt(waterToGoal, 2)} L` },
          { label: "Meta inicial", value: `${fmt(goal, 1)} mEq/L` },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de segurança",
                  tone: "danger" as const,
                  lines: ["Na >= 160 mEq/L pede monitorização mais próxima e reavaliação seriada nas primeiras horas."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz a confiabilidade do plano teórico isolado; acompanhar balanço e resposta real."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Cenário 1: água livre pura",
            lines: [
              `SG 5% ou água enteral têm sódio efetivo ~0 mEq/L e tenderiam a reduzir ~ ${fmt(Math.abs(deltaPerLD5W), 2)} mEq/L por litro neste caso.`,
              `Volume teórico para cair ${fmt(dropNeeded, 1)} mEq/L: ${fmt(litersD5W, 2)} L.`,
              "É a opção mais fisiológica quando o problema predominante é déficit de água livre sem necessidade de ressuscitação com sódio.",
              "Se houver acesso GI funcional, água enteral pode ser o cenário final mais simples; usar SG 5% quando a via enteral não for viável.",
            ],
            tone: "warning",
          },
          {
            title: "Cenário 2: reposição intermediária com Na ~77 mEq/L",
            lines: [
              "Mistura prática: 500 mL de SF 0,9% + 500 mL de água destilada = solução final com ~77 mEq/L de Na e ~77 mEq/L de Cl por litro.",
              `Com o sódio atual, essa solução tende a reduzir ~ ${fmt(Math.abs(deltaPerLHalfHalf), 2)} mEq/L por litro.`,
              `Volume estimado para cair ${fmt(dropNeeded, 1)} mEq/L: ${fmt(litersHalfHalf, 2)} L.`,
              "Faz sentido quando ainda se deseja alguma oferta de sódio/cloreto no fluido final, sem manter a carga isotônica plena.",
            ],
            tone: "warning",
          },
          {
            title: "Cenário 3: solução final customizada",
            lines: [
              `Para programar ${fmt(plannedL, 1)} L com sódio final alvo de ~ ${fmt(targetInfusateNa, 0)} mEq/L, usar ${fmt(nacl20mlPerLiter * plannedL, 1)} mL de NaCl 20% + completar com água destilada.`,
              `Em 1 litro, isso corresponde a ${fmt(nacl20mlPerLiter, 1)} mL de NaCl 20% e ${fmt(1000 - nacl20mlPerLiter, 1)} mL de água destilada.`,
              "NaCl 20% contém ~3,42 mEq/mL de sódio; reconstituir sempre em volume final definido e com conferência farmacêutica/enfermagem.",
            ],
          },
        ],
        practical: [
          {
            title: "Velocidade e contexto clínico",
            lines: [
              severe
                ? "Se Na >= 160 mEq/L, assumir distúrbio importante e trabalhar com reavaliações mais próximas no início da correção."
                : "Se Na < 160 mEq/L e paciente estável, manter estratégia conservadora com reavaliação seriada.",
              `Meta usual: cair ~ ${fmt(Math.min(dropNeeded, 10), 1)} mEq/L em 24 h; em quadros claramente agudos a queda pode ser um pouco mais rápida, desde que monitorada.`,
              "Repetir sódio a cada 2–4 h no início da correção e recalcular após cada resultado.",
              "Se houver choque/hipovolemia, ressuscitar primeiro; a hipernatremia não se corrige à custa de instabilidade hemodinâmica.",
              renalDysfunction
                ? "Se houver disfunção renal, o plano precisa considerar menor capacidade de depurar sódio e água; acompanhar balanço e resposta real, não só o cálculo."
                : "Se o paciente estiver poliúrico ou com perda renal contínua de água, o déficit calculado subestima a necessidade real e o plano precisa incorporar as perdas em curso.",
            ],
          },
        ],
        summary: [
          {
            title: "Leitura de beira-leito",
            lines: [
              "Sede intensa, irritabilidade, fraqueza, letargia, mioclonias e convulsão.",
              "Quadros agudos elevam risco de hemorragia intracraniana; quadros crônicos toleram valores mais altos, mas não correção rápida.",
              "Pergunta prática: o cenário final é água livre pura, solução intermediária ou fluido customizado com sódio definido?",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypokalemia": {
      const goal = target ?? 4;
      const delta = Math.max(goal - current, 0);
      const roughDeficit = current < 3.5 ? ((3.5 - current) / 0.3) * 100 : 0;
      const severe = current < 2.5;
      const acidemia = bicarbonate != null && bicarbonate < 22;
      const suggestedDose = current < 2.5 ? 80 : current < 3 ? 60 : 40;
      const kclMl = suggestedDose / 2;
      const rateMekPerH = suggestedDose / hours;
      const finalConcentration = suggestedDose / (bagMl / 1000);
      return {
        headline: "Hipocalemia: dose pelo risco elétrico, pelo acesso e pelo magnésio, não só pelo valor sérico.",
        metrics: [
          { label: "Meta", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Δ desejado", value: `${fmt(delta, 1)} mEq/L` },
          { label: "Déficit total rough", value: `${fmt(roughDeficit, 0)} mEq` },
          { label: "Acesso", value: access === "central" ? "Central" : "Periférico" },
        ],
        alerts: [
          ...(finalConcentration > 40 && access === "peripheral"
            ? [
                {
                  title: "Alerta de acesso",
                  tone: "danger" as const,
                  lines: ["Concentração final acima de ~40 mEq/L em acesso periférico aumenta risco de flebite e erro operacional."],
                },
              ]
            : []),
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["K < 2,5 mEq/L pede reposição monitorada e redosagem mais precoce."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, não empilhar ampolas sem novo controle laboratorial."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição prática inicial",
            lines: [
              `Dose operacional sugerida agora: ${suggestedDose} mEq de KCl (${fmt(kclMl, 1)} mL de KCl 19,1% / 2 mEq/mL).`,
              `Em ${fmt(hours, 1)} h isso equivale a ${fmt(rateMekPerH, 1)} mEq/h.`,
              access === "peripheral"
                ? `No acesso periférico, manter preferencialmente até 10 mEq/h e concentração final até ~40 mEq/L. Nesta bolsa: ${fmt(finalConcentration, 0)} mEq/L.`
                : `No acesso central com ECG contínuo, 20 mEq/h é uma faixa prática mais comum; cenários extremos podem exigir mais, com monitorização intensiva.`,
              "Corrigir magnésio associado se baixo; hipocalemia refratária sem corrigir Mg costuma falhar.",
              severe
                ? "K < 2,5 mEq/L deve ser lido como distúrbio grave, com reposição monitorada e redosagem mais precoce."
                : "Se K entre 2,5 e 3 mEq/L, a reposição ainda é relevante, mas o cenário clínico decide o quanto correr agora.",
              renalDysfunction
                ? "Se houver disfunção renal, fracionar mais a reposição e redosar antes de acumular carga excessiva."
                : acidemia
                  ? "Se houver acidemia, lembrar que parte do K pode subir ao corrigir o pH; o número atual pode subestimar a variabilidade do caso."
                  : "Sem disfunção renal evidente, o ritmo de reposição pode seguir mais de perto o acesso e a clínica.",
            ],
            tone: finalConcentration > 40 && access === "peripheral" ? "danger" : "warning",
          },
          {
            title: "Contexto clínico",
            lines: [
              acidemia
                ? "Com bicarbonato baixo, a leitura de redistribuição muda; parte do distúrbio pode acompanhar acidose e não apenas perda corporal total."
                : "Alcalose, beta-agonista e insulina podem baixar o K por redistribuição; diarreia, diurético e hiperaldosteronismo sugerem perda real.",
              "Se houver íleo, arritmia, fraqueza importante ou rabdomiólise, o limiar para reposição IV monitorada é menor.",
              "A maior parte do déficit é intracelular; o número sérico subestima o problema quando a queda é importante.",
            ],
          },
        ],
        practical: [
          {
            title: "Exemplo de preparo",
            lines: [
              `Adicionar ${fmt(kclMl, 1)} mL de KCl 19,1% em bolsa de ${fmt(bagMl, 0)} mL.`,
              `Se correr a bolsa toda em ${fmt(hours, 1)} h, bomba ≈ ${fmt(bagMl / hours, 1)} mL/h.`,
              lineWithVolume("40 mEq de KCl", 20, "KCl 19,1% (2 mEq/mL)"),
              lineWithVolume("20 mEq de KCl", 10, "KCl 19,1% (2 mEq/mL)"),
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, câimbras, íleo, poliúria e arritmias.",
              "Se K < 2,5 mEq/L, alteração de ECG, paralisia ou rabdomiólise: correção mais agressiva e monitorada.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hyperkalemia": {
      const severity =
        ecgChanges || current >= 6.5 ? "grave" : current >= 6 ? "moderada" : "leve";
      const glucoseLow = glucose != null && glucose < 126;
      const acidemia = bicarbonate != null && bicarbonate < 22;
      return {
        headline: "Hipercalemia é manejo em três frentes: estabilizar membrana, fazer shift e remover potássio do corpo.",
        metrics: [
          { label: "Gravidade", value: severity },
          { label: "ECG", value: ecgChanges ? "Alterado" : "Sem alteração informada" },
          { label: "Glicemia", value: glucose != null ? `${fmt(glucose, 0)} mg/dL` : "não informada" },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...((ecgChanges || current >= 6.5)
            ? [
                {
                  title: "Emergência",
                  tone: "danger" as const,
                  lines: ["ECG alterado ou K >= 6,5 mEq/L: tratar imediatamente como emergência elétrica."],
                },
              ]
            : []),
          ...(glucoseLow
            ? [
                {
                  title: "Risco de hipoglicemia",
                  tone: "warning" as const,
                  lines: ["Glicemia basal baixa aumenta o risco de hipoglicemia após insulina; programar vigilância e glicose adicional."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz remoção corporal do K e baixa o limiar para discutir TRS."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Estabilização de membrana",
            lines: [
              lineWithVolume("30 mL de gluconato de cálcio 10%", 30, "gluconato de cálcio 10%"),
              "Infundir em 10 minutos se houver alteração de ECG ou hipercalemia grave; repetir se ECG não melhorar.",
              "Se o ECG é o problema, o cálcio entra antes da discussão etiológica completa.",
            ],
            tone: "danger",
          },
          {
            title: "Shift intracelular",
            lines: [
              "Insulina regular 10 U IV + glicose 25 g IV.",
              lineWithVolume("25 g de glicose", 50, "glicose hipertônica 50%"),
              glucoseLow
                ? "Como a glicemia basal está < 126 mg/dL, considerar D10 a 50 mL/h por 5 h após o bolus para reduzir hipoglicemia."
                : "Mesmo com glicemia basal adequada, monitorar glicemia seriada nas próximas 6 h.",
              "Salbutamol nebulizado 10–20 mg como adjuvante se tolerado.",
              acidemia
                ? "Se acidose metabólica coexistente, bicarbonato pode entrar como adjuvante em cenários selecionados, mas não substitui cálcio/insulina/TRS."
                : "Sem acidose relevante, o pilar do shift continua sendo insulina e beta-agonista.",
            ],
            tone: "warning",
          },
          {
            title: "Remoção de potássio",
            lines: [
              "Interromper fontes de K, tratar acidose/IRA, considerar diurético se houver diurese.",
              renalDysfunction
                ? "Com disfunção renal/oligúria, o limiar para discutir terapia renal substitutiva deve ser mais baixo."
                : "Se oligúria, refratariedade ou hipercalemia persistente: discutir terapia renal substitutiva.",
            ],
          },
        ],
        practical: [
          {
            title: "Como usar no plantão",
            lines: [
              "ECG primeiro, depois cálcio se houver alteração ou K muito alto.",
              "Repetir potássio após a fase de shift; o paciente pode 'rebote' se não remover K do corpo.",
              "Se pseudohipercalemia for possível, repetir amostra sem garrote prolongado e sem hemólise.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, parestesia, bloqueios, QRS largo, bradicardia e risco de parada.",
              "Se K ≥ 6,5 mEq/L ou ECG alterado, tratar como emergência mesmo antes da causa definitiva.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypocalcemia": {
      const correctedCa =
        albumin != null ? current + 0.8 * (4 - albumin) : current;
      const doseG = correctedCa < 7 || current < 7 ? 2 : 1;
      const severe = correctedCa < 7 || current < 7;
      const volumeMl = doseG * 10;
      const elementalMeq = volumeMl * 0.465;
      return {
        headline: "Hipocalcemia relevante pede corrigir cálcio e ler o contexto: magnésio, fósforo, albumina e instabilidade elétrica.",
        metrics: [
          { label: "Ca corrigido", value: `${fmt(correctedCa, 2)} mg/dL` },
          { label: "Dose sugerida", value: `${doseG} g` },
          { label: "Cálcio elementar", value: `${fmt(elementalMeq, 1)} mEq` },
        ],
        alerts: severe
          ? [
              {
                title: "Alerta de gravidade",
                tone: "danger",
                lines: ["Hipocalcemia nesta faixa pede atenção para QT longo, tetania e convulsão."],
              },
            ]
          : [],
        strategy: [
          {
            title: "Resgate IV",
            lines: [
              `${doseG} g de gluconato de cálcio 10% (${fmt(volumeMl, 0)} mL da solução 10%).`,
              `Diluir para 50–100 mL em SF 0,9% ou SG 5% e não ultrapassar 200 mg/min em adultos.`,
              `Se usar ${doseG} g, correr em 10–20 minutos costuma manter velocidade dentro do limite.`,
              severe
                ? "Se Ca corrigido < 7 mg/dL, tetania, convulsão ou QT longo, a reposição IV ganha prioridade prática."
                : "Se a hipocalcemia é menos intensa e o paciente estável, o contexto e a causa definem o restante da correção.",
              renalDysfunction
                ? "Em DRC/IRA, pesar melhor a relação com fósforo e evitar tratar só o número fora do contexto."
                : "Sem disfunção renal importante, a causa imediata costuma direcionar mais do que a limitação de depuração.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto clínico",
            lines: [
              "Hipomagnesemia pode impedir correção sustentada do cálcio; fósforo alto e DRC mudam a interpretação e a segurança da reposição.",
              "Albumina baixa pode reduzir o cálcio total sem necessariamente traduzir a mesma gravidade do cálcio ionizado.",
              "Se houver broncoespasmo, laringoespasmo, tetania ou instabilidade elétrica, tratar pela clínica e não pelo perfeccionismo laboratorial.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              lineWithVolume("1 g de gluconato de cálcio 10%", 10, "gluconato de cálcio 10%"),
              lineWithVolume("2 g de gluconato de cálcio 10%", 20, "gluconato de cálcio 10%"),
              `1 mL contém ~0,465 mEq de cálcio elementar; ${fmt(volumeMl, 0)} mL fornecem ~${fmt(elementalMeq, 1)} mEq.`,
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Parestesia perioral, cãibra, tetania, broncoespasmo, QT longo e convulsão.",
              "Se houver instabilidade elétrica ou tetania franca, tratar antes de aguardar cálcio corrigido final.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypercalcemia": {
      const calcitoninUnits = weightKg * 4;
      const calcitoninMl = calcitoninUnits / 200;
      const severe = current >= 14;
      return {
        headline: "Hipercalcemia importante é sobretudo problema de volume, rim e causa de base; o laboratório acompanha a reversão clínica.",
        metrics: [
          { label: "Cálcio atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Peso", value: `${fmt(weightKg, 0)} kg` },
          { label: "Calcitonina 4 UI/kg", value: `${fmt(calcitoninUnits, 0)} UI` },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Ca >= 14 mg/dL aumenta a chance de deterioração neurológica, renal e necessidade de ambiente monitorado."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, expansão volêmica e anti-reabsortivo exigem leitura mais conservadora."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Medidas iniciais",
            lines: [
              "Se hipovolêmico, SF 0,9% com reavaliação seriada; evitar cloreto em excesso se já houver hipercloremia importante.",
              `Calcitonina 4 UI/kg = ${fmt(calcitoninUnits, 0)} UI (${fmt(calcitoninMl, 2)} mL se apresentação 200 UI/mL).`,
              lineWithVolume("Ácido zoledrônico 4 mg", 5, "frasco 4 mg/5 mL"),
              severe
                ? "Ca >= 14 mg/dL reforça gravidade e aumenta a chance de precisar ambiente monitorado/UTI."
                : "Se Ca < 14 mg/dL, sintomas e função renal ajudam a definir urgência e local de cuidado.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal",
            lines: [
              renalDysfunction
                ? "Em DRC ou IRA, hidratação e anti-reabsortivo exigem leitura mais cuidadosa da volemia, da creatinina e do risco de sobrecarga."
                : "Mesmo sem disfunção renal evidente, monitorar creatinina e diurese durante a expansão volêmica.",
              "Calcitonina ajuda nas primeiras horas; o anti-reabsortivo sustenta a queda depois.",
              "Quando malignidade, hiperparatireoidismo ou vitamina D estão em jogo, tratar a causa é parte da correção real.",
            ],
          },
        ],
        practical: [
          {
            title: "Uso prático",
            lines: [
              "Calcitonina ajuda mais rápido; bisfosfonato corrige a médio prazo.",
              "Monitorar creatinina, volume urinário e ECG.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Desidratação, náusea, constipação, poliúria, encefalopatia e QT curto.",
              "Se Ca muito alto com alteração neurológica ou renal, pensar em manejo de UTI.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypomagnesemia": {
      const severe = current < 1.2;
      const verySevere = current < 1;
      const doseG = severe ? 2 : 1;
      const volumeMl = doseG * 2;
      const meq = volumeMl * 4.06;
      return {
        headline: "Hipomagnesemia: dose pelo contexto elétrico e renal, não só pelo número isolado.",
        metrics: [
          { label: "Mg atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Dose IV sugerida", value: `${doseG} g` },
          { label: "Equivalente", value: `${fmt(meq, 1)} mEq` },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Mg < 1,2 mg/dL com clínica compatível pede reposição IV monitorada."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal aumenta o risco de acúmulo ao repetir magnésio."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição IV inicial",
            lines: [
              `${doseG} g de sulfato de magnésio 50% (${fmt(volumeMl, 1)} mL da ampola 50% / 500 mg/mL).`,
              severe
                ? "Se torsades/instabilidade: correr 2 g em 5–15 min, com monitorização contínua."
                : "Se estável: correr 1–2 g em 1 h e repetir conforme resposta e função renal.",
              "Diluição prática: 50–100 mL de SF 0,9% ou SG 5%.",
              verySevere
                ? "Se Mg < 1 mg/dL, repleção adicional nas próximas 12–24 h costuma ser necessária mesmo após a dose inicial."
                : "Se Mg entre 1,2 e 1,6 mg/dL, o alvo é quebrar o ciclo clínico e reavaliar, não normalizar em uma única bolsa.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e arrítmico",
            lines: [
              renalDysfunction
                ? "Em disfunção renal, evitar empilhar doses sem redosagem seriada; a mesma ampola que corrige pode acumular."
                : "Sem disfunção renal importante, reposições seriadas tendem a ser mais previsíveis, mas ainda exigem controle laboratorial.",
              "Se houver torsades, QT longo ou hipocalemia refratária, tratar o Mg como prioridade elétrica mesmo antes do resultado de controle.",
              "Perdas GI, alcoolismo, diuréticos e aminoglicosídeos sugerem déficit corporal total maior do que o valor sérico mostra.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              lineWithVolume("1 g de sulfato de magnésio", 2, "sulfato de magnésio 50%"),
              lineWithVolume("2 g de sulfato de magnésio", 4, "sulfato de magnésio 50%"),
              "Cada mL da solução 50% contém ~500 mg e ~4,06 mEq de magnésio.",
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Tremor, hiperreflexia, tetania, convulsão, QT longo e torsades.",
              "Se Mg < 1,2 mg/dL, alteração elétrica ou convulsão: preferir reposição IV monitorada.",
              "Se K baixo persistente, procurar e corrigir Mg concomitante.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypermagnesemia": {
      return {
        headline: "Hipermagnesemia grave é quadro de bloqueio neuromuscular e hemodinâmico: antagonizar, eliminar e monitorar.",
        metrics: [
          { label: "Mg atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Risco clínico", value: current >= 4.9 ? "alto" : "moderado" },
          { label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" },
        ],
        alerts: [
          ...(current >= 4.9
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Nível alto de magnésio com clínica compatível pode evoluir com bloqueio neuromuscular e depressão respiratória."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal aumenta a chance de persistência e necessidade de diálise."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Antagonismo e suporte",
            lines: [
              lineWithVolume("1 g de gluconato de cálcio 10%", 10, "gluconato de cálcio 10%"),
              lineWithVolume("2 g de gluconato de cálcio 10%", 20, "gluconato de cálcio 10%"),
              renalDysfunction
                ? "Associar suporte ventilatório e hemodinâmico; com rim disfuncionante, a chance de precisar diálise é mais alta."
                : "Associar suporte ventilatório e hemodinâmico conforme quadro; considerar diurético/diálise se rim não depura.",
            ],
            tone: "danger",
          },
        ],
        practical: [
          {
            title: "Pontos de gravidade",
            lines: [
              "Perda do reflexo patelar costuma aparecer em níveis altos; depressão respiratória e hipotensão marcam intoxicação importante.",
              "Suspender toda fonte de magnésio e repetir dosagem seriada.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Hiporreflexia, rubor, hipotensão, bradicardia, sonolência e depressão respiratória.",
              "Se houver apneia ou bloqueio importante, escalar suporte e considerar TRS rapidamente.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hypophosphatemia": {
      const mmol = current / 3.1;
      const severe = current < 1;
      const moderate = current < 2;
      const doseMmol = severe ? 30 : moderate ? 15 : 0;
      const volumeMl = doseMmol / 3;
      const viaPotassium = phosphateSalt === "potassium";
      const potassiumDelivered = viaPotassium ? doseMmol * (4.4 / 3) : 0;
      const sodiumDelivered = viaPotassium ? 0 : doseMmol * (4 / 3);
      const maxRate = access === "central" ? 15 : 6.8;
      const minHours = doseMmol > 0 ? doseMmol / maxRate : 0;
      return {
        headline: "Hipofosfatemia: decidir pela gravidade, pelo potássio e pelo contexto renal antes de escolher o sal.",
        metrics: [
          { label: "Fósforo", value: `${fmt(current, 2)} mg/dL` },
          { label: "≈ mmol/L", value: `${fmt(mmol, 2)} mmol/L` },
          { label: "Dose sugerida", value: `${fmt(doseMmol, 0)} mmol` },
          { label: "Sal", value: viaPotassium ? "Fosfato de potássio" : "Fosfato de sódio" },
        ],
        alerts: [
          ...(severe
            ? [
                {
                  title: "Alerta de gravidade",
                  tone: "danger" as const,
                  lines: ["Fósforo < 1 mg/dL aumenta risco de falência muscular, respiratória e miocárdica."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Com disfunção renal, fósforo IV exige redosagem mais precoce e mais parcimônia."],
                },
              ]
            : []),
          ...(access === "peripheral" && doseMmol > 15
            ? [
                {
                  title: "Atenção de acesso",
                  tone: "warning" as const,
                  lines: ["Dose alta de fósforo em acesso periférico pede atenção extra ao tempo mínimo e tolerância do acesso."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição IV",
            lines: [
              `Dose sugerida: ${fmt(doseMmol, 0)} mmol de fósforo (${fmt(volumeMl, 1)} mL do concentrado 3 mmol/mL).`,
              viaPotassium
                ? `${fmt(doseMmol, 0)} mmol de fosfato de potássio também entregam ~${fmt(potassiumDelivered, 1)} mEq de K.`
                : `${fmt(doseMmol, 0)} mmol de fosfato de sódio também entregam ~${fmt(sodiumDelivered, 1)} mEq de Na.`,
              viaPotassium
                ? potassiumCurrent != null && potassiumCurrent >= 4.5
                  ? "Com K normal-alto, reavaliar se o melhor sal não passa a ser o fosfato de sódio."
                  : "Com K baixo, o fosfato de potássio costuma fazer mais sentido por corrigir dois problemas de uma vez."
                : potassiumCurrent != null && potassiumCurrent < 3.5
                  ? "Como o K está baixo, o fosfato de sódio pode perder a oportunidade de corrigir a hipocalemia associada."
                  : "Fosfato de sódio é útil quando o potássio já está adequado ou quando se quer evitar carga adicional de K.",
              access === "central"
                ? "Acesso central: máximo prático de 15 mmol/h para o fósforo."
                : "Acesso periférico: máximo prático de 6,8 mmol/h para o fósforo.",
              doseMmol > 0 ? `Para essa dose, tempo mínimo por segurança ≈ ${fmt(minHours, 1)} h.` : "Se fósforo > 2 mg/dL e quadro estável, considerar via oral / observação.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e ácido-base",
            lines: [
              renalDysfunction
                ? "Em insuficiência renal, a indicação de fósforo IV precisa ser mais restrita e sempre acompanhada de redosagem precoce."
                : "Sem disfunção renal importante, o risco de acúmulo é menor, mas a redosagem ainda define a próxima etapa.",
              bicarbonate != null && bicarbonate > 28
                ? "Bicarbonato alto sugere alcalose; isso pode reforçar componente de redistribuição do fósforo."
                : "Cetoacidose, realimentação e alcalose respiratória podem derrubar o fósforo por redistribuição; o contexto ajuda a não supertratar.",
              "Se houver hipocalcemia significativa, lembrar do risco de produto Ca x P alto e de precipitação tecidual.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalência prática",
            lines: [
              lineWithVolume("15 mmol de fósforo", 5, "fosfato 3 mmol/mL"),
              lineWithVolume("30 mmol de fósforo", 10, "fosfato 3 mmol/mL"),
              lineWithVolume("45 mmol de fósforo", 15, "fosfato 3 mmol/mL"),
            ],
          },
        ],
        summary: [
          {
            title: "Thresholds úteis",
            lines: [
              "Fraqueza, insuficiência respiratória, disfunção miocárdica, rabdomiólise e hemólise.",
              severe
                ? "Se fósforo < 1 mg/dL, tratar como distúrbio grave mesmo antes da falência muscular se a clínica for compatível."
                : moderate
                  ? "Se fósforo entre 1 e 2 mg/dL, a decisão entre via IV e oral depende de sintomas, via enteral e contexto clínico."
                  : "Se fósforo > 2 mg/dL e quadro estável, geralmente cabe conduta menos agressiva.",
            ],
            tone: "danger",
          },
        ],
      };
    }
    case "hyperphosphatemia": {
      return {
        headline: "Hiperfosfatemia é sobretudo problema renal e de produto cálcio-fósforo; a conduta é reduzir carga, quelar quando indicado e depurar quando necessário.",
        metrics: [
          { label: "Fósforo atual", value: `${fmt(current, 2)} mg/dL` },
          { label: "Atenção", value: "Ca x P e função renal" },
          { label: "Rim", value: renalDysfunction ? "disfunção informada" : "sem disfunção informada" },
        ],
        alerts: renalDysfunction
          ? [
              {
                title: "Atenção renal",
                tone: "danger",
                lines: ["Hiperfosfatemia com disfunção renal informada aumenta o risco de persistência e necessidade de depuração."],
              },
            ]
          : [],
        strategy: [
          {
            title: "Conduta prática",
            lines: [
              "Suspender fontes exógenas de fósforo e revisar função renal.",
              "Considerar quelantes conforme contexto e indicação nefrológica, especialmente se o intestino ainda é a principal via de entrada.",
              renalDysfunction
                ? "Com disfunção renal, o limiar para discutir terapia renal substitutiva fica mais baixo."
                : "Se doença renal grave, hipocalcemia sintomática, rabdomiólise importante ou fósforo muito alto persistente: discutir terapia renal substitutiva.",
            ],
            tone: "warning",
          },
        ],
        practical: [
          {
            title: "Como pensar",
            lines: [
              "Avaliar cálcio, magnésio, potássio, função renal e acidose associada.",
              "Evitar infundir cálcio junto com fosfato na mesma linha pela precipitação.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Muitas vezes o problema se manifesta pela hipocalcemia associada: tetania, QT longo, parestesias.",
              "Hiperfosfatemia importante em IRA costuma vir em pacote com outros distúrbios.",
            ],
          },
        ],
      };
    }
    case "hypochloremia": {
      const goal = target ?? 103;
      const deficit = Math.max(0, 0.2 * weightKg * (goal - current));
      const salineLiters = deficit / 154;
      const marked = current < 95;
      const metabolicAlkalosis = bicarbonate != null && bicarbonate > 28;
      return {
        headline: "Hipocloremia útil à beira-leito costuma significar alcalose metabólica cloro-sensível até prova em contrário.",
        metrics: [
          { label: "Cl atual", value: `${fmt(current, 1)} mEq/L` },
          { label: "Meta operacional", value: `${fmt(goal, 1)} mEq/L` },
          { label: "Déficit rough", value: `${fmt(deficit, 0)} mEq de Cl-` },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...(metabolicAlkalosis
            ? [
                {
                  title: "Alerta ácido-base",
                  tone: "warning" as const,
                  lines: ["HCO3- elevado reforça alcalose metabólica cloro-sensível e aumenta o peso da reposição de cloreto."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal reduz a utilidade de corrigir só o cloro sem reavaliar volume e potássio."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Reposição orientada por cloreto",
            lines: [
              `Déficit rough de cloro: ~${fmt(deficit, 0)} mEq.`,
              `Isso corresponde a ~${fmt(salineLiters, 2)} L de SF 0,9% se a estratégia for só cloreto de sódio.`,
              potassiumCurrent != null && potassiumCurrent < 3.5
                ? "Como o potássio está baixo, parte da correção pode ser melhor feita com KCl em vez de só SF."
                : "Se sódio não permitir mais cloreto de sódio, pensar em KCl ou ajuste de solução conforme contexto.",
              marked
                ? "Cl < 95 mEq/L reforça leitura de alcalose cloro-sensível, sobretudo se houver vômitos, sucção gástrica ou diurético."
                : "Em hipocloremia menos intensa, o contexto de volume e bicarbonato decide mais do que o número isolado.",
              metabolicAlkalosis
                ? "HCO3- elevado reforça a leitura de alcalose metabólica associada e aumenta o peso da reposição de cloreto."
                : "Sem HCO3- elevado, vale checar se a queda do cloro faz parte de outro distúrbio misto.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto ácido-base e renal",
            lines: [
              metabolicAlkalosis
                ? "Se o bicarbonato está alto ou há hipoventilação compensatória, a alcalose metabólica associada ganha força."
                : "Sem bicarbonato alto, a interpretação da hipocloremia precisa de mais contexto ácido-base.",
              renalDysfunction
                ? "Na presença de IRA/DRC, corrigir cloreto sem olhar volume e potássio pode piorar sobrecarga e não resolver a fisiologia."
                : "Sem disfunção renal importante, volume, vômitos, diurético e potássio costumam explicar mais o quadro.",
              "A urina cloro baixa sugere forma cloro-responsiva; urina cloro alta empurra a investigação para perdas renais/mineralocorticoide.",
            ],
          },
        ],
        practical: [
          {
            title: "Equivalências",
            lines: [
              "SF 0,9% contém 154 mEq/L de cloreto.",
              lineWithVolume("20 mEq de KCl", 10, "KCl 19,1% / 2 mEq/mL"),
              lineWithVolume("40 mEq de KCl", 20, "KCl 19,1% / 2 mEq/mL"),
            ],
          },
        ],
        summary: [
          {
            title: "Leitura prática",
            lines: [
              "Muitas vezes o quadro é o da alcalose metabólica: hipoventilação, fraqueza, parestesias e arritmias se coexistir hipocalemia.",
              "A pergunta prática é: o paciente precisa de cloreto, de volume, de potássio ou dos três?",
            ],
          },
        ],
      };
    }
    case "hyperchloremia": {
      const excess = Math.max(0, 0.2 * weightKg * (current - 108));
      const marked = current >= 115;
      const metabolicAcidosis = bicarbonate != null && bicarbonate < 22;
      return {
        headline: "Hipercloremia é geralmente problema de carga de cloro ou acidose associada, não falta de uma droga corretiva.",
        metrics: [
          { label: "Cl atual", value: `${fmt(current, 1)} mEq/L` },
          { label: "Excesso rough", value: `${fmt(excess, 0)} mEq de Cl-` },
          { label: "HCO3-", value: bicarbonate != null ? `${fmt(bicarbonate, 0)} mEq/L` : "não informado" },
        ],
        alerts: [
          ...(metabolicAcidosis
            ? [
                {
                  title: "Alerta ácido-base",
                  tone: "danger" as const,
                  lines: ["HCO3- baixo com hipercloremia sugere acidose metabólica hiperclorêmica até prova em contrário."],
                },
              ]
            : []),
          ...(marked
            ? [
                {
                  title: "Alerta de carga",
                  tone: "warning" as const,
                  lines: ["Cl >= 115 mEq/L pede revisão ativa da carga recente de cloro e do balanço hídrico."],
                },
              ]
            : []),
          ...(renalDysfunction
            ? [
                {
                  title: "Atenção renal",
                  tone: "warning" as const,
                  lines: ["Disfunção renal pode sustentar hipercloremia e acidose apesar de retirar a carga exógena."],
                },
              ]
            : []),
        ],
        strategy: [
          {
            title: "Conduta prática",
            lines: [
              "Suspender/ reduzir soluções ricas em cloro se já não houver indicação hemodinâmica clara.",
              "Preferir cristalóide balanceado quando o problema é carga de cloro; se houver hipernatremia associada, integrar com a estratégia de água livre.",
              metabolicAcidosis
                ? "HCO3- baixo reforça leitura de acidose metabólica hiperclorêmica e pede revisão da causa de base."
                : "Reavaliar gasometria e função renal; nem toda hipercloremia isolada exige intervenção além de parar a carga.",
              marked
                ? "Cl >= 115 mEq/L pede revisão agressiva do balanço hídrico e da carga recente de SF, bicarbonato perdido ou TRS."
                : "Se a elevação é mais discreta, a tendência e a gasometria valem mais que um número isolado.",
            ],
            tone: "warning",
          },
          {
            title: "Contexto renal e ácido-base",
            lines: [
              renalDysfunction
                ? "Na injúria renal, a hipercloremia pode refletir incapacidade de depurar carga administrada e piorar acidose/vasoconstrição renal."
                : "Sem disfunção renal importante, excesso de SF e perdas digestivas de bicarbonato sobem na lista.",
              metabolicAcidosis
                ? "Em diarreia ou acidose tubular renal, o alvo não é só baixar o cloro, mas corrigir a perda de bicarbonato e a causa de base."
                : "Se bicarbonato estiver normal e o paciente recebeu muito SF, a explicação mais provável continua sendo iatrogênica.",
              renalDysfunction
                ? "Com rim disfuncionante, a tendência do cloro importa tanto quanto o valor isolado."
                : "Com rim preservado, retirar a carga de cloro costuma resolver grande parte do problema.",
            ],
          },
        ],
        practical: [
          {
            title: "Como pensar",
            lines: [
              "O número rough acima mostra a magnitude da carga acumulada no compartimento extracelular.",
              "A correção verdadeira é fisiológica: menos cloro entrando, mais água livre quando indicado, e tratar a causa da acidose.",
            ],
          },
        ],
        summary: [
          {
            title: "Sinais e sintomas-chave",
            lines: [
              "Taquipneia compensatória, piora da acidose, fraqueza e disfunção renal associada.",
              "Olhar o conjunto com bicarbonato, sódio e volume administrado nas últimas horas.",
            ],
          },
        ],
      };
    }
  }
}

export default function ElectrolyteCalculatorScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 560;
  const moduleGuidelines = getModuleGuidelinesStatus("correcoes_eletroliticas");
  const guidelineStatus = moduleGuidelines.length
    ? moduleGuidelines[0]
    : getAppGuidelinesStatus().guidelineStatuses[0] ?? null;
  const [electrolyte, setElectrolyte] = useState<ElectrolyteKey>("sodium");
  const [isHypo, setIsHypo] = useState(true);
  const [sex, setSex] = useState<Sex>("male");
  const [elderly, setElderly] = useState(false);
  const [access, setAccess] = useState<Access>("peripheral");
  const [weightKg, setWeightKg] = useState("70");
  const [current, setCurrent] = useState("128");
  const [target, setTarget] = useState("134");
  const [glucose, setGlucose] = useState("");
  const [albumin, setAlbumin] = useState("4");
  const [bagVolumeMl, setBagVolumeMl] = useState("250");
  const [infusionHours, setInfusionHours] = useState("4");
  const [plannedVolumeL, setPlannedVolumeL] = useState("1");
  const [phosphateSalt, setPhosphateSalt] = useState<PhosphateSalt>("potassium");
  const [potassiumCurrent, setPotassiumCurrent] = useState("4");
  const [bicarbonate, setBicarbonate] = useState("");
  const [renalDysfunction, setRenalDysfunction] = useState(false);
  const [ecgChanges, setEcgChanges] = useState(false);

  const electrolyteMeta = ELECTROLYTES.find((item) => item.key === electrolyte)!;
  const disorder = isHypo ? electrolyteMeta.hypo : electrolyteMeta.hyper;

  useEffect(() => {
    if (electrolyte === "sodium" && isHypo) {
      setCurrent("128");
      setTarget("134");
      setGlucose("");
      setBicarbonate("");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "sodium" && !isHypo) {
      setCurrent("154");
      setTarget("146");
      setPlannedVolumeL("1");
      setBicarbonate("");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "potassium" && isHypo) {
      setCurrent("2,8");
      setTarget("4");
      setBagVolumeMl("250");
      setInfusionHours("4");
      setBicarbonate("18");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "potassium" && !isHypo) {
      setCurrent("6,4");
      setTarget("5,2");
      setGlucose("110");
      setBicarbonate("17");
      setRenalDysfunction(true);
      setEcgChanges(true);
      return;
    }
    if (electrolyte === "calcium" && isHypo) {
      setCurrent("7,2");
      setTarget("8,2");
      setAlbumin("3");
      setBicarbonate("");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "calcium" && !isHypo) {
      setCurrent("13,2");
      setTarget("11");
      setBicarbonate("");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "magnesium" && isHypo) {
      setCurrent("1,1");
      setTarget("1,8");
      setBicarbonate("");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "magnesium" && !isHypo) {
      setCurrent("5,4");
      setTarget("2,4");
      setBicarbonate("");
      setRenalDysfunction(true);
      return;
    }
    if (electrolyte === "phosphate" && isHypo) {
      setCurrent("1,4");
      setTarget("2,8");
      setPotassiumCurrent("3,2");
      setBicarbonate("30");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "phosphate" && !isHypo) {
      setCurrent("6,2");
      setTarget("4,5");
      setBicarbonate("");
      setRenalDysfunction(true);
      return;
    }
    if (electrolyte === "chloride" && isHypo) {
      setCurrent("92");
      setTarget("103");
      setPotassiumCurrent("3,1");
      setBicarbonate("34");
      setRenalDysfunction(false);
      return;
    }
    if (electrolyte === "chloride" && !isHypo) {
      setCurrent("116");
      setTarget("108");
      setBicarbonate("16");
      setRenalDysfunction(false);
    }
  }, [electrolyte, isHypo]);
  const result = useMemo(
    () =>
      calculateResult({
        electrolyte,
        disorder,
        sex,
        elderly,
        access,
        weightKg: parseNumber(weightKg),
        current: parseNumber(current),
        target: parseNumber(target),
        glucose: parseNumber(glucose),
        albumin: parseNumber(albumin),
        bagVolumeMl: parseNumber(bagVolumeMl),
        infusionHours: parseNumber(infusionHours),
        plannedVolumeL: parseNumber(plannedVolumeL),
        phosphateSalt,
        potassiumCurrent: parseNumber(potassiumCurrent),
        bicarbonate: parseNumber(bicarbonate),
        renalDysfunction,
        ecgChanges,
      }),
    [
      access,
      albumin,
      bagVolumeMl,
      current,
      disorder,
      ecgChanges,
      elderly,
      electrolyte,
      bicarbonate,
      glucose,
      infusionHours,
      phosphateSalt,
      plannedVolumeL,
      potassiumCurrent,
      renalDysfunction,
      sex,
      target,
      weightKg,
    ]
  );

  function renderPill(
    label: string,
    selected: boolean,
    onPress: () => void,
    tone: "primary" | "neutral" = "neutral"
  ) {
    return (
      <Pressable
        key={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.pill,
          tone === "primary" && styles.pillPrimary,
          selected && styles.pillSelected,
          selected && tone === "primary" && styles.pillPrimarySelected,
          pressed && styles.pillPressed,
        ]}>
        <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{label}</Text>
      </Pressable>
    );
  }

  function input(label: string, value: string, onChangeText: (value: string) => void, placeholder?: string) {
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#7a8aa6"
          keyboardType="decimal-pad"
          style={styles.input}
        />
      </View>
    );
  }

  const showGlucose = disorder === "hyponatremia" || disorder === "hyperkalemia";
  const showAlbumin = disorder === "hypocalcemia";
  const showAccess = disorder === "hypokalemia" || disorder === "hypophosphatemia";
  const showBag = disorder === "hypokalemia";
  const showHours = disorder === "hypokalemia";
  const showVolumePlan = disorder === "hypernatremia";
  const showPhosphateSalt = disorder === "hypophosphatemia";
  const showPotassiumCurrent = disorder === "hypophosphatemia" || disorder === "hypochloremia";
  const showBicarbonate =
    disorder === "hypokalemia" ||
    disorder === "hyperkalemia" ||
    disorder === "hypophosphatemia" ||
    disorder === "hypochloremia" ||
    disorder === "hyperchloremia";
  const showRenalToggle =
    disorder === "hypernatremia" ||
    disorder === "hypokalemia" ||
    disorder === "hyperkalemia" ||
    disorder === "hypocalcemia" ||
    disorder === "hypercalcemia" ||
    disorder === "hypomagnesemia" ||
    disorder === "hypermagnesemia" ||
    disorder === "hypophosphatemia" ||
    disorder === "hyperphosphatemia" ||
    disorder === "hypochloremia" ||
    disorder === "hyperchloremia";
  const showEcgToggle = disorder === "hyperkalemia";
  const leadLines = getInitialStrategyLines(disorder, result.headline);
  const displayMetrics = result.metrics.map((metric) => ({
    ...metric,
    label: getMetricLabel(metric.label),
  }));
  const mainBlocks = result.strategy.slice(1);
  const prepBlocks = result.practical;
  const referenceBlocks = result.summary;
  const versionTone =
    guidelineStatus?.statusLabel === "Atualizado"
      ? styles.versionOk
      : guidelineStatus?.statusLabel
        ? styles.versionWarn
        : styles.versionAlert;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧂 Correções eletrolíticas</Text>
        <Text style={[styles.versionHint, versionTone]} numberOfLines={1}>
          {guidelineStatus?.statusLabel ?? "Revisar"}
        </Text>
      </View>

      <View style={styles.bodyWrap}>
        <View style={[styles.body, isCompact && styles.bodyCompact]}>
          <View style={[styles.sidebar, isCompact && styles.sidebarCompact]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarInner}>
              {ELECTROLYTES.map((item) => (
                <Pressable
                  key={item.key}
                  style={[styles.sideItem, electrolyte === item.key && styles.sideItemActive]}
                  onPress={() => {
                    setElectrolyte(item.key);
                    setIsHypo(true);
                  }}>
                  <Text style={styles.sideEmoji}>{item.icon}</Text>
                  <Text style={[styles.sideName, electrolyte === item.key && styles.sideNameActive]} numberOfLines={2}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>ESTRATÉGIA INICIAL</Text>
              <View style={styles.rowWrap}>
                {renderPill("Hipo", isHypo, () => setIsHypo(true))}
                {renderPill("Hiper", !isHypo, () => setIsHypo(false))}
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>{getDisorderLabel(disorder)}</Text>
                </View>
              </View>
              {leadLines.map((line) => (
                <Text key={line} style={styles.referralLine}>• {line}</Text>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>PACIENTE</Text>
              <View style={styles.formGrid}>
                {input("Peso (kg)", weightKg, setWeightKg, "70")}
                {input("Valor atual", current, setCurrent)}
                {input("Meta / alvo", target, setTarget)}
                {showGlucose ? input("Glicemia (mg/dL)", glucose, setGlucose, "opcional") : null}
                {showAlbumin ? input("Albumina (g/dL)", albumin, setAlbumin) : null}
                {showBag ? input("Bolsa final (mL)", bagVolumeMl, setBagVolumeMl) : null}
                {showHours ? input("Tempo da infusão (h)", infusionHours, setInfusionHours) : null}
                {showVolumePlan ? input("Volume planejado (L)", plannedVolumeL, setPlannedVolumeL) : null}
                {showPotassiumCurrent ? input("Potássio atual (mEq/L)", potassiumCurrent, setPotassiumCurrent, "se relevante") : null}
                {showBicarbonate ? input("Bicarbonato (mEq/L)", bicarbonate, setBicarbonate, "se disponível") : null}
              </View>

              <Text style={styles.fieldSectionLabel}>Sexo e água corporal</Text>
              <View style={styles.rowWrap}>
                {renderPill("Masculino", sex === "male", () => setSex("male"))}
                {renderPill("Feminino", sex === "female", () => setSex("female"))}
                {renderPill("Idoso", elderly, () => setElderly((value) => !value))}
              </View>

              {showAccess ? (
                <>
                  <Text style={styles.fieldSectionLabel}>Acesso</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Periférico", access === "peripheral", () => setAccess("peripheral"))}
                    {renderPill("Central", access === "central", () => setAccess("central"))}
                  </View>
                </>
              ) : null}

              {showRenalToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>Função renal</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem disfunção", !renalDysfunction, () => setRenalDysfunction(false))}
                    {renderPill("Com disfunção", renalDysfunction, () => setRenalDysfunction(true))}
                  </View>
                </>
              ) : null}

              {showPhosphateSalt ? (
                <>
                  <Text style={styles.fieldSectionLabel}>Sal fosfatado</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Fosfato de K", phosphateSalt === "potassium", () => setPhosphateSalt("potassium"))}
                    {renderPill("Fosfato de Na", phosphateSalt === "sodium", () => setPhosphateSalt("sodium"))}
                  </View>
                </>
              ) : null}

              {showEcgToggle ? (
                <>
                  <Text style={styles.fieldSectionLabel}>ECG</Text>
                  <View style={styles.rowWrap}>
                    {renderPill("Sem alteração", !ecgChanges, () => setEcgChanges(false))}
                    {renderPill("Com alteração", ecgChanges, () => setEcgChanges(true))}
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>CÁLCULO RÁPIDO</Text>
              <Text style={styles.headline}>{result.headline}</Text>
              <View style={styles.metricGrid}>
                {displayMetrics.map((metric) => (
                  <View key={`${metric.label}-${metric.value}`} style={styles.metricCard}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {result.alerts.map((block) => {
              const colors = buildToneColor(block.tone);
              return (
                <View key={`${block.title}-${block.lines[0] ?? ""}`} style={[styles.alertCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.alertTitle, { color: colors.title }]}>{getBlockTitle(block.title)}</Text>
                  {block.lines.map((line) => (
                    <Text key={line} style={styles.alertLine}>• {line}</Text>
                  ))}
                </View>
              );
            })}

            {prepBlocks.length > 0 && (
              <View style={[styles.card, styles.prepCard]}>
                <Text style={styles.cardLabel}>DILUIÇÃO E PREPARO</Text>
                {prepBlocks.map((block) => (
                  <View key={block.title} style={styles.blockGroup}>
                    <Text style={styles.blockTitle}>{getBlockTitle(block.title)}</Text>
                    {block.lines.map((line) => (
                      <Text key={line} style={styles.resultLine}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {mainBlocks.map((block) => {
              const colors = buildToneColor(block.tone);
              return (
                <View
                  key={`${block.title}-${block.lines[0] ?? ""}`}
                  style={[styles.card, styles.resultCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.resultTitle, { color: colors.title }]}>{getBlockTitle(block.title)}</Text>
                  {block.lines.map((line) => (
                    <Text key={line} style={styles.resultLine}>• {line}</Text>
                  ))}
                </View>
              );
            })}

            {referenceBlocks.map((block) => {
              const colors = buildToneColor(block.tone);
              return (
                <View
                  key={`${block.title}-${block.lines[0] ?? ""}`}
                  style={[styles.card, styles.resultCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.resultTitle, { color: colors.title }]}>{getBlockTitle(block.title)}</Text>
                  {block.lines.map((line) => (
                    <Text key={line} style={styles.resultLine}>• {line}</Text>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppDesign.canvas.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: AppDesign.accent.lime,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 118, 110, 0.16)",
  },
  headerTitle: { flex: 1, color: AppDesign.text.primary, fontSize: 20, fontWeight: "800" },
  versionHint: { fontSize: 11, fontWeight: "700", maxWidth: "42%" },
  versionOk: { color: AppDesign.accent.teal },
  versionWarn: { color: "#a16207" },
  versionAlert: { color: "#b91c1c" },
  bodyWrap: { flex: 1, alignItems: "center", paddingHorizontal: 12, paddingVertical: 12 },
  body: {
    flex: 1,
    flexDirection: "row",
    width: "100%",
    maxWidth: 1120,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    backgroundColor: "#ffffff",
  },
  bodyCompact: { maxWidth: "100%", borderRadius: 0 },
  sidebar: { width: 92, backgroundColor: AppDesign.surface.shellMint, borderRightWidth: 1, borderRightColor: AppDesign.border.subtle },
  sidebarCompact: { width: 74 },
  sidebarInner: { paddingVertical: 8, gap: 2 },
  sideItem: { alignItems: "center", paddingVertical: 12, paddingHorizontal: 6, borderRadius: 10, marginHorizontal: 4 },
  sideItemActive: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#a7f3d0" },
  sideEmoji: { fontSize: 18, fontWeight: "900", color: AppDesign.accent.teal },
  sideName: { fontSize: 9, fontWeight: "700", color: "#64748b", textAlign: "center", marginTop: 3, lineHeight: 12 },
  sideNameActive: { color: AppDesign.accent.teal },
  mainScroll: { flex: 1, backgroundColor: AppDesign.canvas.background },
  scroll: { padding: 16, gap: 14, paddingBottom: 28, width: "100%" },
  card: { backgroundColor: "#ffffff", borderRadius: 24, padding: 16, gap: 12, borderWidth: 1, borderColor: AppDesign.border.subtle, ...AppDesign.shadow.card },
  cardLabel: { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1 },
  referralLine: { fontSize: 13, color: "#334155", lineHeight: 19 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: "#e0f2fe", borderWidth: 1, borderColor: "#bae6fd" },
  statusChipText: { fontSize: 13, fontWeight: "800", color: "#0c4a6e" },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#bfd0ea",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#eef4ff",
  },
  pillPrimary: {
    backgroundColor: "#e3ecff",
  },
  pillSelected: {
    backgroundColor: "#102128",
    borderColor: "#102128",
  },
  pillPrimarySelected: {
    backgroundColor: "#173767",
    borderColor: "#173767",
  },
  pillPressed: {
    opacity: 0.88,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#21406d",
  },
  pillTextSelected: {
    color: "#f5f7fb",
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  inputGroup: {
    flexBasis: "48%",
    minWidth: 150,
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#34465f",
  },
  input: {
    borderWidth: 1,
    borderColor: "#bfd0ea",
    borderRadius: 18,
    backgroundColor: "#eef4ff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#102128",
    fontWeight: "700",
  },
  fieldSectionLabel: { fontSize: 10, fontWeight: "800", color: "#64748b", letterSpacing: 1, marginTop: 2 },
  headline: {
    fontSize: 16,
    lineHeight: 23,
    color: "#20364c",
    fontWeight: "700",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flexBasis: "48%",
    minWidth: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccdbf3",
    backgroundColor: "#eef4ff",
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#687b96",
  },
  metricValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "900",
    color: "#16356b",
  },
  alertCard: { borderRadius: 18, padding: 14, borderWidth: 1.5, gap: 8 },
  alertTitle: { fontSize: 16, fontWeight: "900" },
  alertLine: { fontSize: 13, lineHeight: 19, color: "#334155", fontWeight: "600" },
  prepCard: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0", borderWidth: 1.5 },
  blockGroup: { gap: 6 },
  blockTitle: { fontSize: 15, fontWeight: "800", color: "#14532d" },
  resultCard: {
    gap: 10,
  },
  resultTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  resultLine: {
    fontSize: 15,
    lineHeight: 22,
    color: "#23384f",
    fontWeight: "600",
  },
});
