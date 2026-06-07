import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Fluxo interativo do Edema Agudo de Pulmão (EAP) cardiogênico no adulto.
 * Ordem real de atendimento (insuficiência cardíaca aguda — ESC 2021):
 * reconhecimento → posição + O₂/VNI → CLASSIFICAÇÃO PELA PA SISTÓLICA (decisão-chave)
 * → tratamento conforme o perfil (hipertensivo / normotenso / hipotenso-choque)
 * → investigar e tratar a causa (SCA, arritmia) → reavaliação → destino.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 *
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

export const eapDecisionTree: DecisionTreeDefinition = {
  id: "eap_ica_2021",
  version: "2021.1",
  label: "Edema Agudo de Pulmão",
  entryNodeId: "entry",
  nodes: {
    // ── 1. Reconhecimento e medidas imediatas ─────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "EAP — reconhecimento e medidas imediatas",
      summary: "Dispneia súbita, ortopneia, estertores, hipoxemia. Agir em paralelo.",
      actions: [
        "Sentar o paciente (posição ereta, pernas pendentes) — reduz a pré-carga e o trabalho respiratório.",
        "Monitor cardíaco, oximetria, PA, acesso venoso; ECG de 12 derivações.",
        "O₂ para manter SpO₂ ≥ 90% (evitar hiperóxia); preparar VNI.",
        "Anamnese/exame dirigidos: causa precipitante (isquemia, HAS, arritmia, má adesão, sobrecarga).",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Sinais vitais",
      intro: "Toque nos valores (ou adicione). A PA sistólica define o tratamento.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["80", "90", "110", "130", "150", "180", "210"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "spo2",
          label: "SpO₂",
          unit: "%",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["80", "85", "88", "90", "94", "98"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "fc",
          label: "Frequência cardíaca",
          unit: "bpm",
          allowCustom: true,
          customKeyboard: "numeric",
          optional: true,
          presets: ["50", "70", "90", "110", "130", "150"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "suporte",
    },

    // ── 2. Suporte ventilatório ────────────────────────────────────────────────
    suporte: {
      id: "suporte",
      type: "action",
      title: "Suporte ventilatório",
      summary: "VNI reduz o trabalho respiratório e a necessidade de intubação no EAP.",
      actions: [
        "O₂ suplementar para SpO₂ ≥ 90%.",
        "VNI (CPAP 10 cmH₂O ou BiPAP) se desconforto respiratório/hipoxemia apesar do O₂ — iniciar precocemente.",
        "Contraindicações à VNI: rebaixamento, instabilidade hemodinâmica grave, vômitos/risco de aspiração, incapacidade de cooperar.",
        "Se falha da VNI ou indicação de via aérea definitiva → preparar intubação/ventilação mecânica.",
      ],
      next: "classificacao",
    },

    // ── 3. Classificação pela PA — DECISÃO-CHAVE ──────────────────────────────
    classificacao: {
      id: "classificacao",
      type: "decision",
      title: "Classificação pela PA sistólica",
      question: "Qual a faixa da PA sistólica?",
      summary: "PAS informada: {pas} mmHg · SpO₂ {spo2}%.",
      evidence: [
        "PAS ≥ 140 (EAP hipertensivo / 'flash'): predomínio de redistribuição de líquido — vasodilatador é a base.",
        "PAS 90–140 (normotenso): vasodilatador + diurético conforme congestão.",
        "PAS < 90 ou hipoperfusão (choque cardiogênico): NÃO usar vasodilatador/diurético agressivo — inotrópico/vasopressor.",
      ],
      options: [
        { id: "hipertensivo", label: "PAS ≥ 140 (hipertensivo)", next: "eap_hipertensivo" },
        { id: "normotenso", label: "PAS 90–140 (normotenso)", next: "eap_normotenso" },
        { id: "hipotenso", label: "PAS < 90 / hipoperfusão (choque)", next: "eap_hipotenso" },
      ],
    },

    eap_hipertensivo: {
      id: "eap_hipertensivo",
      type: "action",
      title: "EAP hipertensivo — vasodilatador é a base",
      summary: "Reduzir a pós-carga é o tratamento principal; diurético é adjuvante.",
      actions: [
        "Nitroglicerina IV: iniciar 10–20 mcg/min e titular conforme a PA (até ~200 mcg/min) — alternativa: dinitrato de isossorbida 5 mg SL.",
        "Furosemida 20–40 mg IV se houver sobrecarga hídrica (se já usa, 1–2,5× a dose diária habitual).",
        "Evitar morfina de rotina (associada a pior desfecho).",
        "Reduzir a PA de forma controlada; manter VNI conforme necessidade.",
      ],
      next: "causa",
    },

    eap_normotenso: {
      id: "eap_normotenso",
      type: "action",
      title: "EAP normotenso — vasodilatador + diurético",
      summary: "Combinar vasodilatador cauteloso com diurético se congestão.",
      actions: [
        "Furosemida 20–40 mg IV (se já usa, 1–2,5× a dose oral diária).",
        "Nitroglicerina IV em dose cautelosa (10–20 mcg/min) se sintomas/congestão persistirem e PA permitir.",
        "Monitorar PA de perto — suspender vasodilatador se tendência à hipotensão.",
        "Evitar morfina de rotina; manter suporte ventilatório conforme necessidade.",
      ],
      next: "causa",
    },

    eap_hipotenso: {
      id: "eap_hipotenso",
      type: "action",
      title: "EAP hipotenso / choque cardiogênico",
      summary: "NÃO vasodilatar nem forçar diurético. Foco em perfusão.",
      actions: [
        "NÃO usar nitrato/vasodilatador; usar diurético com cautela só após estabilizar a perfusão.",
        "Inotrópico: dobutamina 2–20 mcg/kg/min para suporte do débito cardíaco.",
        "Vasopressor: noradrenalina se PAS < 90 / hipoperfusão sustentada (alvo PAM ≥ 65).",
        "Ecocardiograma urgente; considerar UTI e suporte mecânico; investigar causa (SCA, valvar, mecânica).",
      ],
      next: "causa",
    },

    // ── 4. Causa precipitante ──────────────────────────────────────────────────
    causa: {
      id: "causa",
      type: "decision",
      title: "Causa precipitante",
      question: "O ECG / quadro indica SCA (supra de ST ou isquemia) como causa?",
      evidence: [
        "EAP pode ser desencadeado por SCA, emergência hipertensiva, arritmia (FA rápida), disfunção valvar aguda ou má adesão.",
        "Identificar e tratar a causa é parte essencial — não apenas controlar a congestão.",
      ],
      options: [
        { id: "sim", label: "Sim — SCA / isquemia", next: "causa_sca" },
        { id: "nao", label: "Não / outra causa", next: "reaval" },
      ],
    },

    causa_sca: {
      id: "causa_sca",
      type: "action",
      title: "EAP por SCA — tratar a síndrome coronariana",
      summary: "EAP + SCA é alto risco. A reperfusão pode ser o tratamento da congestão.",
      actions: [
        "Acionar cardiologia/hemodinâmica; STEMI → reperfusão imediata (ver módulo Síndromes Coronarianas).",
        "Iniciar terapia antitrombótica conforme o protocolo de SCA (AAS + 2º antiplaquetário + anticoagulação).",
        "Manter suporte ventilatório e controle hemodinâmico em paralelo.",
        "Tratar arritmias associadas (cardioversão se FA rápida com instabilidade).",
      ],
      next: "reaval",
    },

    // ── 5. Reavaliação ─────────────────────────────────────────────────────────
    reaval: {
      id: "reaval",
      type: "decision",
      title: "Reavaliação da resposta",
      question: "Houve melhora (oxigenação, dispneia, hemodinâmica)?",
      evidence: [
        "Reavaliar SpO₂, padrão respiratório, PA, perfusão e diurese após as primeiras medidas.",
        "EAP refratário ou exaustão respiratória → via aérea definitiva e cuidado intensivo.",
      ],
      options: [
        { id: "sim", label: "Sim — melhora clínica", next: "destino" },
        { id: "nao", label: "Não — refratário / piora", next: "refratario" },
      ],
    },

    refratario: {
      id: "refratario",
      type: "action",
      title: "EAP refratário — escalonar",
      summary: "Não insistir em medida que não responde; escalonar o suporte.",
      actions: [
        "Intubação e ventilação mecânica se falha da VNI, exaustão ou rebaixamento.",
        "Otimizar terapia conforme o perfil hemodinâmico (vasodilatador x inotrópico/vasopressor).",
        "Reavaliar a causa (isquemia em curso, arritmia, complicação mecânica) com ecocardiograma.",
        "Acionar UTI / suporte avançado (eventual suporte circulatório mecânico).",
      ],
      next: "destino",
    },

    // ── 6. Destino ─────────────────────────────────────────────────────────────
    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / unidade de cuidados",
      summary: "Destino conforme a gravidade e a resposta ao tratamento.",
      disposition: "icu",
      exitCriteria: [
        "Choque cardiogênico, necessidade de VM/inotrópico/vasopressor ou EAP por SCA → UTI.",
        "Boa resposta e estabilidade → observação monitorizada e otimização da IC.",
        "Investigar e tratar a etiologia; ajustar terapia da insuficiência cardíaca.",
        "Reavaliar continuamente — reescalonar a qualquer sinal de deterioração.",
      ],
      targets: [],
    },
  },
};
