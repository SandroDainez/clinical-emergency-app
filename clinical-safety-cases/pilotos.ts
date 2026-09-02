import type { ClinicalSafetyCase } from "../lib/clinical-safety-case";

/**
 * Casos-piloto do Emergências 2.0.
 *
 * Estes objetos NÃO executam conduta nem afirmam elegibilidade. Eles descrevem
 * cenários e invariantes de trajetória que o runner deverá verificar contra as
 * árvores existentes. A validação clínica de valores/limiares continua nos
 * testes específicos de cada módulo já existentes no repositório.
 */
export const PILOT_SAFETY_CASES: ClinicalSafetyCase[] = [
  {
    id: "avc-tempo-dependente-001",
    moduleId: "avc",
    title: "AVC com janela conhecida deve percorrer avaliação de reperfusão",
    description: "Paciente com déficit focal e início conhecido deve entrar no ramo de avaliação de reperfusão sem omitir glicemia e imagem.",
    inputs: [
      { field: "inicioConhecido", value: "sim" },
      { field: "deficitsFocais", value: "sim" },
    ],
    expectation: {
      mustVisit: ["reperfusao", "glicemia", "imagem"],
    },
  },
  {
    id: "anafilaxia-instavel-001",
    moduleId: "anafilaxia",
    title: "Anafilaxia com instabilidade exige tratamento e reavaliação",
    description: "O fluxo não pode encerrar nem avançar para destino sem passar por tratamento da anafilaxia e reavaliação clínica.",
    inputs: [{ field: "instabilidade", value: "sim" }],
    expectation: {
      mustVisit: ["tratamento", "reavaliacao"],
      requiredActions: ["adrenalina"],
    },
  },
  {
    id: "isr-via-aerea-001",
    moduleId: "isr-rapida",
    title: "ISR deve chegar à confirmação e ao pós-intubação",
    description: "Uma sequência de ISR deve preservar preoxigenação e chegar à confirmação da via aérea e avaliação pós-intubação.",
    inputs: [{ field: "indicacaoViaAerea", value: "sim" }],
    expectation: {
      mustVisit: ["preoxigenacao", "confirmacao", "pos_intubacao"],
    },
  },
];
