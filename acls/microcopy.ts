const ACLS_COPY = {
  operational: {
    actions: {
      cpr: "Manter RCP",
      rhythm: "Ver ritmo",
      shock: "Aplicar choque",
      epinephrine: "Dar epinefrina",
      antiarrhythmic: "Dar antiarrítmico",
      rosc: "Cuidar ROSC",
      end: "Encerrar caso",
    },

    labels: {
      now: "Agora",
      decide: "Decidir",
      waitingVoice: "Aguardando voz",
      voiceCaptured: "Voz captada",
      listening: "Ouvindo",
      unavailable: "Indisponível",
      confirm: "Confirmar",
      cancel: "Cancelar",
    },

    sections: {
      voice: "Voz",
      tools: "Ferramentas",
      focusNow: "Foco agora",
      pending: "Pendências",
      check: "Checar",
      assistant: "Assistente IA",
    },

    voice: {
      mode: "Modo voz",
      activate: "Ativar voz",
      deactivate: "Desativar voz",
      active: "Voz ativa",
      inactive: "Voz inativa",
    },

    ui: {
      protocol: "ACLS · Adulto",
      focus: "Foco",
      primaryAction: "Ação principal",
      next: "Depois",
      chooseRhythm: "Escolha ritmo",
      decideNow: "Decida agora",
      records: "Registrar",
      open: "Abrir",
      hide: "Ocultar",
      commands: "Comandos",
      currentPhase: "Tempo atual",
      keepPhase: "Mantenha a fase.",
      epinephrineIn: "Epinefrina em",
      registerAirway: "Registrar via aérea",
      showClinicalLog: "Ver log clínico",
      hideClinicalLog: "Ocultar log clínico",
      showHistory: "Ver histórico",
      hideHistory: "Ocultar histórico",
      showDebrief: "Ver debrief",
      hideDebrief: "Ocultar debrief",
      clinicalPanel: "Painel clínico",
    },

    assistant: {
      summary: "Resumo",
      refresh: "Atualizar",
      refreshing: "Atualizando",
      supportNote: "Apoio. Não muda.",
      readingCurrentCase: "Lendo o caso atual.",
      unavailable: "IA indisponível.",
      toolsNote: "Registros e apoio",
    },
  },

  analytical: {
    sections: {
      history: "Histórico de casos",
      currentCase: "Voltar ao caso atual",
      debrief: "Debrief pós-caso",
      summary: "Resumo operacional",
      metrics: "Indicadores operacionais",
      timeline: "Linha do tempo resumida",
      replay: "Replay assistivo",
      deviations: "Desvios operacionais",
      latency: "Latência perceptiva",
      causes: "Hs e Ts registradas",
      clinicalAnalysis: "Análise clínica",
      strengths: "Pontos fortes",
      delays: "Atrasos e desvios",
      improvements: "Sugestões de melhoria",
    },

    labels: {
      copy: "Copiar resumo",
      noSavedCases: "Nenhum caso salvo localmente.",
      noRecordedCauses: "Nenhuma H ou T foi registrada manualmente no caso.",
      noLatency: "Nenhuma métrica de latência registrada.",
      unavailable: "Indisponível",
      summary: "Resumo",
      context: "Contexto",
      action: "Ação",
      pendingDelays: "Pendências/atrasos",
      primaryFriction: "Principal atrito",
      branchTransitions: "Transições de ramo",
      advancedAirway: "Via aérea avançada",
      totalTime: "Tempo total do caso",
      timeToFirstShock: "Tempo até primeiro choque",
      timeToFirstEpinephrine: "Tempo até primeira epinefrina",
      missingData: "Dados faltantes mais frequentes",
      relatedActions: "Ações relacionadas",
      supportingSignals: "Sustentação",
      latencyState: "Estado",
      latencyIntent: "Intent",
    },
  },
} as const;

type AclsMicrocopy = typeof ACLS_COPY;

export type { AclsMicrocopy };
export { ACLS_COPY };
