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
    module: "avc",
    title: "AVC com janela conhecida deve percorrer avaliação de reperfusão",
    input: {
      inicioConhecido: "sim",
      deficitsFocais: "sim",
    },
    mustVisit: ["reperfusao"],
    mustNotSkip: ["glicemia", "imagem"],
    notes: "Não fixa fármaco nem elegibilidade; cobra apenas a trajetória de avaliação.",
  },
  {
    id: "anafilaxia-instavel-001",
    module: "anafilaxia",
    title: "Anafilaxia com instabilidade não pode terminar sem tratamento e reavaliação",
    input: {
      instabilidade: "sim",
    },
    mustVisit: ["tratamento", "reavaliacao"],
    mustNotSkip: ["adrenalina"],
    notes: "Dose, via e repetição permanecem validadas pelos testes clínicos do módulo.",
  },
  {
    id: "isr-via-aerea-001",
    module: "isr-rapida",
    title: "ISR deve chegar à confirmação de via aérea e avaliação pós-intubação",
    input: {
      indicacaoViaAerea: "sim",
    },
    mustVisit: ["confirmacao", "pos_intubacao"],
    mustNotSkip: ["preoxigenacao"],
    notes: "Não prescreve agente nem dose; testa estrutura e continuidade do fluxo.",
  },
];
