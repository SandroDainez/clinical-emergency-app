import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Algoritmo ACLS de Bradicardia no adulto com pulso (AHA 2025).
 * Fluxo interativo passo-a-passo conduzido como um instrutor de ACLS.
 *
 * Doses (AHA 2020+/2025):
 * - Atropina 1 mg IV bolus, repetir a cada 3–5 min, máximo 3 mg
 * - Dopamina 5–20 mcg/kg/min IV
 * - Epinefrina 2–10 mcg/min IV
 * - Marcapasso transvenoso temporário: aceitável na bradicardia instável
 *   refratária ao tratamento medicamentoso (novo na AHA 2025)
 */
export const bradycardiaDecisionTree: DecisionTreeDefinition = {
  id: "acls_bradycardia_2025",
  version: "2025.1",
  label: "Bradicardia ACLS",
  entryNodeId: "entry",
  nodes: {
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento e monitorização inicial",
      summary: "Bradicardia = FC < 50 bpm com sinais/sintomas. Prepare o paciente antes de decidir a conduta.",
      actions: [
        "Identificar bradicardia no monitor (FC < 50 bpm) e correlacionar com sintomas.",
        "Manter via aérea pérvia; administrar O₂ se SpO₂ < 94% ou desconforto respiratório.",
        "Monitor cardíaco, pressão arterial e oximetria contínua.",
        "Obter acesso IV e ECG de 12 derivações (não atrasar o tratamento do paciente instável).",
      ],
      next: "assess_stability",
    },

    assess_stability: {
      id: "assess_stability",
      type: "decision",
      title: "A bradicardia está causando instabilidade?",
      question: "Há sinais de instabilidade ATRIBUÍVEIS à frequência baixa?",
      summary: "A instabilidade precisa ser causada pela bradicardia — não pela doença de base.",
      evidence: [
        "Hipotensão (PAS < 90 mmHg ou queda > 30 mmHg da basal).",
        "Alteração aguda do estado mental (confusão, síncope, pré-síncope).",
        "Sinais de choque (palidez, sudorese, má perfusão periférica).",
        "Desconforto torácico isquêmico em curso.",
        "Insuficiência cardíaca aguda (congestão, dispneia, EAP).",
      ],
      options: [
        { id: "instavel", label: "Sim — paciente INSTÁVEL", next: "atropine" },
        { id: "estavel", label: "Não — paciente estável", next: "stable_monitor" },
      ],
    },

    stable_monitor: {
      id: "stable_monitor",
      type: "action",
      title: "Bradicardia estável — monitorar e investigar a causa",
      summary: "Sem instabilidade: não há indicação de atropina ou marcapasso de imediato.",
      actions: [
        "Manter monitorização contínua e reavaliar a qualquer deterioração.",
        "Investigar e tratar causa: isquemia, fármacos (betabloqueador, BCC, digoxina), distúrbios eletrolíticos, hipóxia, hipotermia, hipotireoidismo.",
        "ECG de 12 derivações: caracterizar o tipo de bloqueio (1º grau, Mobitz I/II, BAV total).",
        "Considerar consulta com a cardiologia conforme o tipo de bloqueio.",
      ],
      next: "stable_disposition",
    },

    stable_disposition: {
      id: "stable_disposition",
      type: "transition",
      title: "Observação monitorizada",
      summary: "Bradicardia estável: acompanhar enquanto a causa é tratada.",
      disposition: "observation",
      exitCriteria: [
        "Manter monitor cardíaco e reavaliar sinais de instabilidade.",
        "Iniciar marcapasso transcutâneo imediatamente se surgir instabilidade.",
        "Mobitz II e BAV total têm risco de progressão — vigilância redobrada e cardiologia.",
      ],
      targets: [],
    },

    atropine: {
      id: "atropine",
      type: "action",
      title: "Atropina 1 mg IV — primeira linha",
      summary: "Primeira droga na bradicardia sintomática instável.",
      actions: [
        "Atropina 1 mg IV em bolus.",
        "Repetir 1 mg a cada 3–5 min se necessário. Dose máxima total: 3 mg.",
        "⚠️ Pouco eficaz em Mobitz II e BAV total (bloqueio infranodal) — NÃO atrasar o marcapasso.",
        "Reavaliar FC, PA e perfusão 1–2 min após cada dose.",
      ],
      next: "after_atropine",
    },

    after_atropine: {
      id: "after_atropine",
      type: "decision",
      title: "Houve resposta à atropina?",
      question: "A FC e a perfusão melhoraram com a atropina?",
      evidence: [
        "Resposta = aumento da FC, normalização da PA e melhora dos sintomas.",
        "Sem resposta = persiste instável, ou bloqueio de alto grau (Mobitz II / BAV total).",
      ],
      options: [
        { id: "respondeu", label: "Sim — estabilizou", next: "resolved_disposition" },
        { id: "refratario", label: "Não — persiste instável / BAV alto grau", next: "second_line" },
      ],
    },

    resolved_disposition: {
      id: "resolved_disposition",
      type: "transition",
      title: "Resposta à atropina — monitorar e investigar a causa",
      summary: "Estabilizou, mas a causa precisa ser tratada e o paciente vigiado.",
      disposition: "observation",
      exitCriteria: [
        "Manter monitorização — a melhora pode ser transitória.",
        "Investigar e corrigir a causa da bradicardia.",
        "Ter marcapasso transcutâneo pronto caso recidive.",
      ],
      targets: [],
    },

    second_line: {
      id: "second_line",
      type: "action",
      title: "Segunda linha — marcapasso transcutâneo e/ou drogas",
      summary: "Atropina ineficaz, contraindicada ou bloqueio de alto grau.",
      actions: [
        "Marcapasso transcutâneo (MP-TC) IMEDIATO — especialmente em Mobitz II e BAV total.",
        "Ajustar frequência 60–80 bpm; analgesia/sedação para conforto; confirmar captura elétrica (espícula + QRS) e mecânica (pulso).",
        "OU Dopamina 5–20 mcg/kg/min IV em infusão.",
        "OU Epinefrina 2–10 mcg/min IV em infusão.",
      ],
      next: "after_second_line",
    },

    after_second_line: {
      id: "after_second_line",
      type: "decision",
      title: "Estabilizou com marcapasso/drogas?",
      question: "O paciente está estável com MP-TC e/ou infusão de droga cronotrópica?",
      evidence: [
        "Estável = FC e PA adequadas, boa perfusão, captura mantida com conforto.",
        "Refratário = persiste instável apesar de MP-TC e drogas.",
      ],
      options: [
        { id: "estabilizou", label: "Sim — estável com suporte", next: "icu_definitive" },
        { id: "refratario", label: "Não — refratário ao tratamento", next: "transvenous" },
      ],
    },

    transvenous: {
      id: "transvenous",
      type: "action",
      title: "Marcapasso transvenoso temporário (AHA 2025)",
      summary: "Bradicardia instável refratária ao tratamento medicamentoso.",
      actions: [
        "Considerar marcapasso transvenoso temporário para aumentar a FC e melhorar os sintomas (AHA 2025).",
        "Acionar cardiologia / equipe de hemodinâmica com urgência.",
        "Manter MP-TC e/ou drogas como ponte até a colocação do transvenoso.",
        "Continuar investigando e tratando a causa subjacente.",
      ],
      next: "icu_definitive",
    },

    icu_definitive: {
      id: "icu_definitive",
      type: "transition",
      title: "UTI + cardiologia para marcapasso definitivo",
      summary: "Suporte avançado mantido até tratamento definitivo.",
      disposition: "icu",
      exitCriteria: [
        "Transferir para UTI com monitorização contínua.",
        "Cardiologia para avaliação de marcapasso definitivo.",
        "Manter suporte hemodinâmico e tratar a causa reversível.",
      ],
      targets: [],
    },
  },
};
