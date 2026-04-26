import { DecisionTreeEngine, validateDecisionTree } from "./core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "./core/decision-tree/types";

export const anaphylaxisDecisionTree: DecisionTreeDefinition = {
  id: "anaphylaxis_v2",
  version: "1.0.0",
  label: "Árvore de decisão da anafilaxia",
  entryNodeId: "diagnostic_entry",
  nodes: {
    diagnostic_entry: {
      id: "diagnostic_entry",
      type: "decision",
      title: "Critérios diagnósticos de entrada",
      summary: "O protocolo começa apenas quando a apresentação clínica é compatível com anafilaxia.",
      question: "O paciente preenche critérios de anafilaxia ou a suspeita é alta o suficiente para não atrasar o tratamento?",
      evidence: [
        "Instalação súbita após exposição provável com comprometimento de via aérea, respiração ou circulação.",
        "Dois ou mais sistemas acometidos após exposição provável ao alérgeno.",
        "Hipotensão isolada após alérgeno conhecido também pode preencher critério.",
      ],
      options: [
        { id: "criteria_met", label: "Sim — critérios preenchidos / alta suspeita", next: "immediate_im_epinephrine" },
        { id: "criteria_not_met", label: "Não — reação localizada apenas", next: "not_anaphylaxis_exit" },
      ],
    },

    immediate_im_epinephrine: {
      id: "immediate_im_epinephrine",
      type: "action",
      title: "Tratamento imediato de primeira linha",
      summary: "Este bloco é obrigatório e sem ramificação assim que a anafilaxia é reconhecida.",
      actions: [
        "Aplicar adrenalina intramuscular imediatamente na face lateral da coxa.",
        "Chamar ajuda e ativar atendimento monitorizado de ressuscitação.",
        "Posicionar o paciente em decúbito dorsal com pernas elevadas, exceto se vômitos ou desconforto respiratório importante exigirem outra posição.",
        "Iniciar monitorização contínua com oximetria, pressão arterial e monitor cardíaco.",
      ],
      next: "severity_stratification",
    },

    severity_stratification: {
      id: "severity_stratification",
      type: "decision",
      title: "Estratificação de gravidade",
      summary: "Separar apresentações moderadas das imediatamente ameaçadoras à vida.",
      question: "O paciente está grave neste momento?",
      evidence: [
        "Grave = choque, hipotensão persistente, estridor, edema progressivo de via aérea superior, broncoespasmo importante, hipoxemia, cianose, exaustão ou rebaixamento do nível de consciência.",
        "Moderada = anafilaxia sem choque ou falência imediata de via aérea.",
      ],
      options: [
        { id: "severe", label: "Grave / ameaça imediata à vida", next: "severe_resuscitation_bundle" },
        { id: "moderate", label: "Moderada sem choque/falência de via aérea", next: "moderate_support_bundle" },
      ],
    },

    moderate_support_bundle: {
      id: "moderate_support_bundle",
      type: "action",
      title: "Pacote de suporte da anafilaxia moderada",
      summary: "Medidas de suporte após a primeira dose obrigatória de adrenalina IM.",
      actions: [
        "Manter suplementação de oxigênio se houver hipoxemia ou sintomas respiratórios.",
        "Garantir acesso venoso precocemente e deixar cristalóide disponível.",
        "Preparar repetição de adrenalina IM em 5 minutos se os sintomas persistirem ou piorarem.",
        "Usar broncodilatador inalatório apenas como adjuvante se houver broncoespasmo persistente após adrenalina.",
      ],
      next: "reassessment_after_first_im",
    },

    severe_resuscitation_bundle: {
      id: "severe_resuscitation_bundle",
      type: "action",
      title: "Pacote de ressuscitação da anafilaxia grave",
      summary: "Ações de alta prioridade para anafilaxia grave após a primeira dose de adrenalina IM.",
      actions: [
        "Oferecer oxigênio em alto fluxo imediatamente.",
        "Obter acesso venoso calibroso e iniciar bolus rápido de cristalóide isotônico se houver hipotensão ou má perfusão.",
        "Preparar equipamento de via aérea e operador experiente precocemente se houver estridor, edema progressivo ou fadiga respiratória.",
        "Planejar repetição de adrenalina IM após 5 minutos se a instabilidade persistir durante a ressuscitação.",
      ],
      next: "reassessment_after_first_im",
    },

    reassessment_after_first_im: {
      id: "reassessment_after_first_im",
      type: "decision",
      title: "Primeiro loop de reavaliação",
      summary: "Reavaliar 5 minutos após a primeira dose de adrenalina IM.",
      question: "Qual foi a resposta após o tratamento inicial?",
      evidence: [
        "Melhora com sintomas residuais ainda exige observação contínua e frequentemente segunda dose IM.",
        "Choque persistente, comprometimento grave de via aérea ou piora respiratória exigem escalonamento imediato.",
      ],
      options: [
        { id: "resolved_or_nearly_resolved", label: "Melhora importante / quase resolução", next: "observation_phase" },
        { id: "persistent_non_severe", label: "Sintomas persistentes sem choque/falência de via aérea", next: "repeat_im_epinephrine" },
        { id: "worsening_or_severe", label: "Piora, choque ou ameaça de via aérea", next: "critical_escalation_bundle" },
      ],
    },

    repeat_im_epinephrine: {
      id: "repeat_im_epinephrine",
      type: "action",
      title: "Segunda dose de adrenalina intramuscular",
      summary: "A repetição da adrenalina IM continua sendo um bloco sem ramificação ao atingir este nó.",
      actions: [
        "Aplicar agora a segunda dose de adrenalina IM.",
        "Manter monitorização, oxigênio conforme necessidade e acesso venoso.",
        "Reavaliar em até 5 minutos pressão arterial, esforço respiratório, SpO₂, edema de via aérea e estado mental.",
      ],
      next: "reassessment_after_second_im",
    },

    reassessment_after_second_im: {
      id: "reassessment_after_second_im",
      type: "decision",
      title: "Segundo loop de reavaliação",
      summary: "Decidir se o paciente está estabilizando ou se precisa de escalonamento avançado.",
      question: "Qual foi a resposta após a segunda dose de adrenalina IM?",
      evidence: [
        "Falha após duas doses IM, fluidos e suporte eleva fortemente a necessidade de adrenalina IV e suporte avançado.",
        "Qualquer deterioração de via aérea continua sendo gatilho independente para transição ao módulo de via aérea.",
      ],
      options: [
        { id: "now_stable", label: "Melhora clara / estabilizado", next: "observation_phase" },
        { id: "persistent_instability", label: "Ainda instável ou refratário", next: "critical_escalation_bundle" },
      ],
    },

    critical_escalation_bundle: {
      id: "critical_escalation_bundle",
      type: "action",
      title: "Pacote de escalonamento crítico",
      summary: "Escalonamento para choque refratário, broncoespasmo grave ou comprometimento progressivo de via aérea.",
      actions: [
        "Iniciar ou preparar infusão de adrenalina IV conforme protocolo institucional.",
        "Manter ressuscitação volêmica agressiva com cristalóide isotônico se a hipotensão persistir.",
        "Escalonar imediatamente o suporte de via aérea se houver edema de via aérea superior, fadiga respiratória ou falha de oxigenação/ventilação.",
        "Direcionar o cuidado para monitorização em nível de UTI.",
      ],
      next: "post_escalation_decision",
    },

    post_escalation_decision: {
      id: "post_escalation_decision",
      type: "decision",
      title: "Ramificação após escalonamento",
      summary: "O suporte avançado já foi iniciado; escolher agora a saída terminal correta.",
      question: "Qual desfecho de escalonamento melhor descreve o paciente agora?",
      evidence: [
        "Adrenalina IV ou choque refratário não devem seguir para observação de rotina.",
        "Transições terminais são o único ponto em que outros módulos podem ser referenciados.",
      ],
      options: [
        { id: "airway_module_needed", label: "Necessita via aérea avançada / ISR", next: "transition_to_airway_module" },
        { id: "ventilation_module_needed", label: "Necessita fluxo de ventilação mecânica", next: "transition_to_ventilation_module" },
        { id: "vasoactive_module_needed", label: "Necessita fluxo de infusão vasoativa", next: "transition_to_vasoactive_module" },
        { id: "critical_but_self_contained", label: "Estabilizou parcialmente, mas precisa de UTI", next: "icu_transition" },
      ],
    },

    observation_phase: {
      id: "observation_phase",
      type: "action",
      title: "Observação e vigilância para recaída",
      summary: "A observação permanece obrigatória mesmo após melhora clínica.",
      actions: [
        "Manter observação monitorizada e reavaliar recorrência de sintomas respiratórios, hemodinâmicos ou mucocutâneos.",
        "Documentar gatilho, cronologia, doses de adrenalina e trajetória de resposta.",
        "Não permitir que anti-histamínicos ou corticoides substituam a vigilância para recaída ou o escalonamento tardio se os sintomas retornarem.",
      ],
      next: "observation_disposition",
    },

    observation_disposition: {
      id: "observation_disposition",
      type: "decision",
      title: "Destino após estabilização",
      summary: "Sair do protocolo apenas após decisão terminal entre alta segura e internação monitorizada.",
      question: "Qual é o destino mais seguro após a observação?",
      evidence: [
        "Alta exige estabilidade sustentada, ausência de problema evolutivo de via aérea/circulação e preparo adequado para saída.",
        "Necessidade de adrenalina repetida, sinais de gravidade ou preocupação persistente favorecem internação monitorizada ou UTI.",
      ],
      options: [
        { id: "safe_discharge", label: "Alta segura com orientação e retorno", next: "discharge_transition" },
        { id: "needs_monitored_observation", label: "Precisa de observação monitorizada / enfermaria", next: "observation_transition" },
        { id: "needs_icu", label: "Precisa de UTI por gravidade ou risco de recaída", next: "icu_transition" },
      ],
    },

    not_anaphylaxis_exit: {
      id: "not_anaphylaxis_exit",
      type: "transition",
      title: "Fluxo de reação alérgica localizada",
      summary: "Este ramo sai do protocolo de anafilaxia porque os critérios sistêmicos não foram preenchidos.",
      disposition: "other_module",
      exitCriteria: [
        "Sem critérios sistêmicos de anafilaxia neste momento.",
        "Reação localizada apenas, com plano explícito de reavaliação se houver progressão.",
      ],
      targets: [
        {
          moduleId: "allergic_reaction_observation",
          label: "Reação alérgica localizada / observação",
          reason: "No momento não há indicação para permanecer dentro da árvore de anafilaxia.",
        },
      ],
    },

    discharge_transition: {
      id: "discharge_transition",
      type: "transition",
      title: "Alta segura",
      summary: "Nó terminal de alta para anafilaxia resolvida.",
      disposition: "discharge",
      exitCriteria: [
        "Sintomas resolvidos e hemodinâmica estável.",
        "Sem comprometimento ativo de via aérea ou necessidade de oxigênio.",
        "Paciente/cuidador com orientação de alta, sinais de alarme e acesso à adrenalina quando indicado.",
      ],
      targets: [
        {
          moduleId: "discharge_home",
          label: "Alta para casa",
          reason: "Anafilaxia resolvida após observação, com critérios de alta preenchidos.",
        },
      ],
    },

    observation_transition: {
      id: "observation_transition",
      type: "transition",
      title: "Observação monitorizada ou internação em enfermaria",
      summary: "Nó terminal para pacientes não aptos à alta, mas sem necessidade imediata de suporte em nível de UTI.",
      disposition: "observation",
      exitCriteria: [
        "Melhorou após tratamento, mas ainda necessita de observação monitorizada.",
        "Pode ter precisado de adrenalina IM repetida ou ainda apresentar sintomas residuais que exigem seguimento.",
      ],
      targets: [
        {
          moduleId: "monitored_observation",
          label: "Observação / leito monitorizado",
          reason: "Necessita observação adicional antes do destino final.",
        },
      ],
    },

    icu_transition: {
      id: "icu_transition",
      type: "transition",
      title: "Internação em UTI",
      summary: "Nó terminal para anafilaxia grave ou com recaída, exigindo monitorização intensiva.",
      disposition: "icu",
      exitCriteria: [
        "Anafilaxia grave ou refratária.",
        "Necessidade de vasopressor/adrenalina IV, manejo avançado de via aérea ou monitorização crítica contínua.",
      ],
      targets: [
        {
          moduleId: "icu_admission",
          label: "Internação em UTI",
          reason: "Necessidade contínua de cuidado crítico após anafilaxia grave.",
        },
      ],
    },

    transition_to_airway_module: {
      id: "transition_to_airway_module",
      type: "transition",
      title: "Transição para o módulo de via aérea",
      summary: "Transição terminal para manejo definitivo da via aérea.",
      disposition: "other_module",
      exitCriteria: [
        "Edema progressivo de via aérea superior, falha de oxigenação/ventilação ou ameaça imediata à via aérea.",
        "Decisão tomada por sequência de via aérea avançada.",
      ],
      targets: [
        {
          moduleId: "isr_rapida",
          label: "Módulo de intubação em sequência rápida",
          reason: "O manejo avançado da via aérea passa a ser o fluxo principal.",
        },
      ],
    },

    transition_to_ventilation_module: {
      id: "transition_to_ventilation_module",
      type: "transition",
      title: "Transição para o módulo de ventilação",
      summary: "Transição terminal quando o manejo ventilatório invasivo passa a ser o problema principal.",
      disposition: "other_module",
      exitCriteria: [
        "Ventilação mecânica iniciada ou iminente.",
        "Ajuste ventilatório e manejo de troca gasosa passam a dominar o atendimento.",
      ],
      targets: [
        {
          moduleId: "ventilacao_mecanica",
          label: "Módulo de ventilação mecânica",
          reason: "Passa a exigir setup do ventilador e manejo ventilatório seriado.",
        },
      ],
    },

    transition_to_vasoactive_module: {
      id: "transition_to_vasoactive_module",
      type: "transition",
      title: "Transição para o módulo de drogas vasoativas",
      summary: "Transição terminal quando o manejo de infusão vasoativa passa a ser o problema principal.",
      disposition: "other_module",
      exitCriteria: [
        "Adrenalina IV ou outra infusão vasoativa é necessária e a titulação passa a ser central.",
        "Choque refratário persiste apesar de adrenalina IM, fluidos e medidas imediatas de ressuscitação.",
      ],
      targets: [
        {
          moduleId: "drogas_vasoativas",
          label: "Módulo de drogas vasoativas",
          reason: "Passa a exigir fluxo focado em titulação de infusão e suporte vasoativo.",
        },
      ],
    },
  },
};

export const anaphylaxisDecisionTreeIssues = validateDecisionTree(anaphylaxisDecisionTree);

export function createAnaphylaxisDecisionEngine() {
  return new DecisionTreeEngine(anaphylaxisDecisionTree);
}

export function runSampleAnaphylaxisPath() {
  const engine = createAnaphylaxisDecisionEngine();

  const snapshots: Array<{
    label: string;
    step: FrontendTreeStep;
  }> = [];

  const capture = (label: string) => {
    snapshots.push({ label, step: engine.toFrontendStep() });
  };

  capture("Entrada");
  engine.choose("criteria_met");
  capture("Após reconhecimento diagnóstico");
  engine.advance();
  capture("Após adrenalina IM obrigatória");
  engine.choose("moderate");
  capture("Após estratificação de gravidade");
  engine.advance();
  capture("Após pacote de suporte moderado");
  engine.choose("persistent_non_severe");
  capture("Sintomas persistentes após a primeira IM");
  engine.advance();
  capture("Após segunda adrenalina IM");
  engine.choose("now_stable");
  capture("Estabilizado após segunda IM");
  engine.advance();
  capture("Fase de observação");
  engine.choose("safe_discharge");
  capture("Nó terminal de alta segura");

  return {
    path: snapshots,
    log: engine.getLog(),
  };
}
