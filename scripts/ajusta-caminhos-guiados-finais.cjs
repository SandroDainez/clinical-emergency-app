const fs = require('node:fs');
const path = require('node:path');

function replaceOnce(fileName, oldBlock, newBlock) {
  const file = path.resolve(__dirname, '..', fileName);
  const src = fs.readFileSync(file, 'utf8');
  if (!src.includes(oldBlock)) throw new Error(`${fileName}: bloco esperado não encontrado; abortando.`);
  const next = src.replace(oldBlock, newBlock);
  if (next === src) throw new Error(`${fileName}: nenhuma alteração aplicada.`);
  fs.writeFileSync(file, next);
}

replaceOnce('poisoning-decision-tree.ts', `    eliminacao: {
      id: "eliminacao",
      type: "decision",
      title: "Necessita métodos de eliminação?",
      question: "Há intoxicação grave por substância dialisável ou acidose/insuficiência renal refratária?",
      evidence: [
        "Dialisáveis (baixo peso molecular, baixa ligação proteica, pequeno volume de distribuição): metanol, etilenoglicol, lítio, salicilato, metformina (acidose láctica), teofilina, valproato em dose maciça.",
        "Alcalinização urinária com bicarbonato: salicilato e fenobarbital.",
      ],
      options: [
        { id: "sim", label: "Sim — indicar hemodiálise/alcalinização", next: "uti" },
        { id: "nao", label: "Não", next: "observacao" },
`, `    eliminacao: {
      id: "eliminacao",
      type: "decision",
      title: "Necessita métodos de eliminação?",
      question: "Há intoxicação grave por substância dialisável ou acidose/insuficiência renal refratária?",
      evidence: [
        "Dialisáveis (baixo peso molecular, baixa ligação proteica, pequeno volume de distribuição): metanol, etilenoglicol, lítio, salicilato, metformina (acidose láctica), teofilina, valproato em dose maciça.",
        "Alcalinização urinária com bicarbonato: salicilato e fenobarbital.",
      ],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "eliminacao_guiada" },
        { id: "sim", label: "Sim — indicar hemodiálise/alcalinização", next: "uti" },
        { id: "nao", label: "Não", next: "observacao" },
`);
replaceOnce('poisoning-decision-tree.ts', `    sem_indicacao: {
`, `    eliminacao_guiada: {
      id: "eliminacao_guiada",
      type: "action",
      title: "Antes de decidir eliminação extracorpórea",
      summary: "Não existe um limiar único que sirva para todos os tóxicos. Confirme agente, gravidade e órgão-alvo antes de responder.",
      actions: [
        "IDENTIFIQUE o tóxico, formulação, dose estimada e tempo desde a exposição; critérios de diálise variam por substância.",
        "REAVALIE acidose, função renal, estado neurológico, hemodinâmica, ECG e concentrações séricas quando existirem e forem úteis para aquele agente.",
        "CONSULTE CIATox/CEATOX e, quando houver possibilidade real de terapia extracorpórea, nefrologia/toxicologia e os critérios específicos do agente (por exemplo, recomendações EXTRIP quando aplicáveis).",
        "Se houver deterioração clínica enquanto a definição está em curso, trate suporte e complicações sem esperar a decisão sobre diálise.",
        "Com esses dados em mãos, volte à pergunta e escolha o ramo correspondente.",
      ],
      next: "eliminacao",
    },

    sem_indicacao: {
`);

replaceOnce('politrauma-decision-tree.ts', `      options: [
        { id: "grave", label: "Sim — lesão grave / suporte", next: "uti" },
        { id: "leve", label: "Não — trauma leve, estável", next: "observacao" },
      ],
    },

    uti: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "destino_guiado" },
        { id: "grave", label: "Sim — lesão grave / suporte", next: "uti" },
        { id: "leve", label: "Não — trauma leve, estável", next: "observacao" },
      ],
    },

    destino_guiado: {
      id: "destino_guiado",
      type: "decision",
      title: "O que ainda exige recurso avançado?",
      question: "Depois do XABCDE e da reavaliação, existe alguma necessidade que não cabe em observação simples?",
      summary: "Considere procedimento/cirurgia, instabilidade não resolvida, via aérea/VM, vasoativo, lesão maior ou necessidade de recurso que o serviço atual não oferece.",
      options: [
        { id: "sim", label: "Sim — há necessidade de recurso avançado ou transferência", next: "uti" },
        { id: "nao", label: "Não — estável, sem lesão maior ou suporte avançado", next: "observacao" },
      ],
    },

    uti: {
`);

replaceOnce('seizure-decision-tree.ts', `      options: [
        { id: "grave", label: "Sim — recorrência/causa grave/suporte", next: "uti" },
        { id: "nao", label: "Não — crise única, exame normal", next: "alta" },
      ],
    },

    uti: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "destino_guiado" },
        { id: "grave", label: "Sim — recorrência/causa grave/suporte", next: "uti" },
        { id: "nao", label: "Não — crise única, exame normal", next: "alta" },
      ],
    },

    destino_guiado: {
      id: "destino_guiado",
      type: "decision",
      title: "Há motivo concreto para internação?",
      question: "Existe recorrência/status, rebaixamento ou déficit persistente, causa aguda relevante ou necessidade de suporte/monitorização intensiva?",
      summary: "Qualquer um desses achados afasta o caminho de alta. Alta exige crise isolada, retorno ao basal e seguimento seguro.",
      options: [
        { id: "sim", label: "Sim — algum critério de internação está presente", next: "uti" },
        { id: "nao", label: "Não — crise isolada, exame voltou ao basal e seguimento é seguro", next: "alta" },
      ],
    },

    uti: {
`);

replaceOnce('sepsis-decision-tree.ts', `      options: [
        { id: "sim", label: "Sim — vasopressor persistente", next: "corticoide" },
        { id: "nao", label: "Não — choque revertido ou causa reversível corrigida", next: "foco_check" },
      ],
    },

    corticoide: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "corticoide_guiado" },
        { id: "sim", label: "Sim — vasopressor persistente", next: "corticoide" },
        { id: "nao", label: "Não — choque revertido ou causa reversível corrigida", next: "foco_check" },
      ],
    },

    corticoide_guiado: {
      id: "corticoide_guiado",
      type: "action",
      title: "Como decidir sem inventar um corte de dose",
      summary: "A decisão é clínica: necessidade persistente de vasopressor após ressuscitação inicial e correção ativa das causas reversíveis — não um número universal de noradrenalina ou de horas.",
      actions: [
        "Confirme que a ressuscitação inicial foi realizada e que perfusão/pressão foram reavaliadas.",
        "Procure e corrija causas reversíveis de hipotensão persistente: hipovolemia/responsividade, sangramento, pneumotórax/tamponamento, disfunção de bomba, sedação excessiva e outras causas compatíveis com o caso.",
        "Se, apesar disso, o paciente CONTINUA dependente de vasopressor para sustentar perfusão/pressão, responda SIM. Se o vasopressor foi retirado ou a hipotensão se resolveu ao corrigir a causa, responda NÃO.",
        "Não transforme NE ≥ 0,25 mcg/kg/min por ≥ 4 h em portão obrigatório; neste módulo ele é apenas referência de prática/ensaios.",
      ],
      next: "corticoide_check",
    },

    corticoide: {
`);

replaceOnce('shock-decision-tree.ts', `      options: [
        { id: "sim", label: "Sim", next: "dx_tamponamento" },
        { id: "nao", label: "Não — TEP maciço?", next: "dx_tep" },
      ],
    },
    dx_tamponamento: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "tamponamento_guiado" },
        { id: "sim", label: "Sim", next: "dx_tamponamento" },
        { id: "nao", label: "Não — TEP maciço?", next: "dx_tep" },
      ],
    },
    tamponamento_guiado: {
      id: "tamponamento_guiado",
      type: "action",
      title: "Como verificar tamponamento no instável",
      summary: "Não descarte por ausência da tríade de Beck. Integre contexto + instabilidade + ecocardiografia/POCUS à beira-leito.",
      actions: [
        "Faça ecocardiografia/POCUS imediatamente quando disponível: procure derrame pericárdico e sinais de comprometimento do enchimento, sempre integrados à clínica.",
        "Reforce o contexto: pós-operatório cardíaco, trauma penetrante, pericardite/derrame conhecido ou procedimento recente aumentam a plausibilidade.",
        "Tríade de Beck, pulso paradoxal, baixa voltagem e alternância elétrica podem ajudar, mas a ausência deles NÃO exclui tamponamento.",
        "Com POCUS/contexto reavaliados, volte e responda SIM se o conjunto for compatível; se não, siga para a próxima causa obstrutiva.",
      ],
      next: "q_tamponamento",
    },
    dx_tamponamento: {
`);

replaceOnce('shock-decision-tree.ts', `      options: [
        { id: "sim", label: "Sim", next: "q_cardio_subtipo" },
        { id: "nao", label: "Não", next: "q_distributivo" },
      ],
    },

    q_cardio_subtipo: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "cardiogenico_guiado" },
        { id: "sim", label: "Sim", next: "q_cardio_subtipo" },
        { id: "nao", label: "Não", next: "q_distributivo" },
      ],
    },

    cardiogenico_guiado: {
      id: "cardiogenico_guiado",
      type: "action",
      title: "Antes de chamar de falência de bomba",
      summary: "Procure evidência de disfunção miocárdica e mantenha choque misto no radar; pele fria ou PA baixa isoladas não definem o mecanismo.",
      actions: [
        "Obtenha ECG e ecocardiografia/POCUS precocemente quando disponíveis: função de VE/VD, congestão, complicação mecânica e sinais de baixo débito ajudam a definir o fenótipo.",
        "Procure contexto de IAM/isquemia, insuficiência cardíaca aguda/descompensada, arritmia relevante, miocardite/contusão e valvopatia/complicação mecânica.",
        "Se houver evidência predominante de falência de bomba, responda SIM e classifique o subtipo. Se não houver, responda NÃO e siga investigando distributivo/misto e outras causas.",
        "Se os mecanismos coexistirem, trate como choque misto e reavalie após cada intervenção em vez de forçar uma classificação única.",
      ],
      next: "q_cardiogenico",
    },

    q_cardio_subtipo: {
`);

replaceOnce('ventilation-decision-tree.ts', `      options: [
        { id: "sim", label: "Sim — mecânica aceitável", next: "monitorizacao" },
        { id: "nao", label: "Não — Pplat alta ou mecânica piorando", next: "pressao_alta" },
      ],
    },

    pressao_alta: {
`, `      options: [
        { id: "guiado", label: "Não sei — me guie", next: "seguranca_guiada" },
        { id: "sim", label: "Sim — mecânica aceitável", next: "monitorizacao" },
        { id: "nao", label: "Não — Pplat alta ou mecânica piorando", next: "pressao_alta" },
      ],
    },

    seguranca_guiada: {
      id: "seguranca_guiada",
      type: "action",
      title: "Meça antes de decidir",
      summary: "A segurança mecânica depende da pressão de platô medida corretamente e da tendência da mecânica — não de impressão visual do ventilador.",
      actions: [
        "Meça a pressão de platô com pausa inspiratória, sem esforço ativo do paciente; confirme também PEEP e volume corrente entregues.",
        "Use Pplat ≤ 30 cmH₂O como referência importante quando aplicável ao cenário e compare com a tendência prévia; driving pressure deve ser interpretada no contexto, sem transformar 15 cmH₂O em corte universal isolado.",
        "Se a Pplat está acima do alvo do cenário OU a mecânica está piorando, responda NÃO e abra o troubleshooting de pressão alta. Se está dentro do alvo e estável/melhorando, responda SIM.",
        "Se a medida não é confiável por esforço/dissincronia, corrija a condição de medição antes de classificar.",
      ],
      next: "seguranca",
    },

    pressao_alta: {
`);

console.log('Caminhos guiados finais aplicados em 6 arquivos com substituições únicas e escopo explícito.');
