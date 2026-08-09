import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  derivarInstabilidade,
} from "./lib/instabilidade-guiada";

/**
 * Abdome agudo — abordagem inicial e diferencial.
 * Eixo: excluir catástrofes com risco imediato de vida (aneurisma roto,
 * gravidez ectópica rota, isquemia mesentérica, perfuração) → classificar o
 * padrão (inflamatório, obstrutivo, perfurativo, vascular, hemorrágico) →
 * exame dirigido e destino cirúrgico.
 *
 * Fonte declarada: Sabiston — Tratado de Cirurgia, 20ª edição, capítulo 45
 * (Abdome Agudo — Squires, Carter e Postier).
 */

export const acuteAbdomenDecisionTree: DecisionTreeDefinition = {
  id: "abdome_agudo",
  version: "2024.1",
  label: "Abdome agudo",
  entryNodeId: "estabilizacao",
  nodes: {
    estabilizacao: {
      id: "estabilizacao",
      type: "action",
      title: "Estabilização e avaliação inicial",
      summary: "Sinais vitais e perfusão antes de qualquer exame de imagem.",
      actions: [
        "Monitorização, dois acessos venosos, O₂ se hipoxemia; cristaloide se hipoperfusão.",
        "Exames: hemograma, PCR, função renal, eletrólitos, amilase/lipase, hepatograma, gasometria com LACTATO, coagulograma, tipagem.",
        "β-hCG OBRIGATÓRIO em toda mulher em idade fértil — gravidez ectópica é diagnóstico que mata.",
        "ECG em dor epigástrica/idoso/diabético — infarto de parede inferior simula abdome agudo.",
        "Analgesia adequada NÃO mascara o diagnóstico nem atrasa a cirurgia — não postergar opioide.",
        "Jejum, sonda gástrica se vômitos/distensão; antibiótico conforme suspeita de foco.",
      ],
      next: "instabilidade",
    },

    instabilidade: {
      id: "instabilidade",
      type: "decision",
      title: "Há instabilidade ou sinal de catástrofe?",
      question: "Choque, abdome em tábua, dor desproporcional ao exame, ou massa pulsátil?",
      evidence: [
        "Catástrofes com risco imediato: aneurisma de aorta roto, gravidez ectópica rota, isquemia mesentérica, perfuração de víscera, hemorragia intra-abdominal.",
        "Dor DESPROPORCIONAL ao exame físico = isquemia mesentérica até prova em contrário.",
        "Instável não vai para tomografia — vai para cirurgia/USG à beira-leito.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "abd_instab_dados" },
        { id: "sim", label: "Sim — instável / catástrofe", next: "catastrofe" },
        { id: "nao", label: "Não — estável", next: "padrao" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // A pergunta acima é DUPLA: instabilidade OU sinal de catástrofe abdominal.
    // Por isso o passo guiado soma as observações comuns de instabilidade —
    // vindas de lib/instabilidade-guiada, as mesmas de todos os módulos — aos
    // três achados que são específicos do abdome. Cada um deles, sozinho, muda
    // o destino: nenhum admite tomografia antes da conduta.
    abd_instab_dados: {
      id: "abd_instab_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: [
        ...camposDeInstabilidade(),
        {
          id: "abdomeTabua",
          label:
            "A barriga está DURA como tábua, sem relaxar, e o paciente se contrai ao encostar de leve?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "dorDesproporcional",
          label:
            "A dor é MUITO maior do que o exame sugere — dor intensa com barriga relativamente mole ao apalpar?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "massaPulsatil",
          label:
            "Apalpando o meio da barriga, acima do umbigo: existe uma massa que PULSA e se expande a cada batimento?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
      ],
      next: {
        possiveis: ["catastrofe", "abd_conclusao_limitrofe", "padrao"],
        escolher: (v) => {
          // Os sinais abdominais são critérios INTEIROS por si: abdome em tábua
          // é peritonite difusa, dor desproporcional é isquemia mesentérica até
          // prova em contrário, e massa pulsátil expansiva é aneurisma. Qualquer
          // um muda a conduta sozinho, independentemente da hemodinâmica — e é
          // justamente por poderem aparecer com pressão normal que precisam
          // estar aqui.
          const catastrofeAbdominal =
            v.abdomeTabua === "sim" ||
            v.dorDesproporcional === "sim" ||
            v.massaPulsatil === "sim";

          const grau = derivarInstabilidade(v);
          if (grau === "instavel" || catastrofeAbdominal) return "catastrofe";
          if (grau === "limitrofe") return "abd_conclusao_limitrofe";
          return "padrao";
        },
      },
    },

    abd_conclusao_limitrofe: {
      id: "abd_conclusao_limitrofe",
      type: "action",
      title: "Achado isolado — ainda NÃO é critério de instabilidade",
      summary:
        "Não há sinal de catástrofe abdominal, e o achado que você marcou sozinho não fecha critério de instabilidade. Siga a investigação, reavaliando.",
      actions: [
        "Pele fria, pálida ou suada entra na definição de CHOQUE quando vem com má perfusão objetiva — enchimento capilar lento, débito urinário muito reduzido, hipotensão ou alteração do estado mental. Sozinha, aparece também em dor intensa, ansiedade, febre e reação vagal — e dor abdominal forte basta para produzi-la.",
        "Falta de ar entra na definição de INSUFICIÊNCIA CARDÍACA AGUDA quando vem com congestão — estertores, ortopneia ou queda da saturação. Sozinha, no abdome agudo, costuma ser dor, distensão ou acidose.",
        "O QUE FAZER AGORA: dois acessos calibrosos, monitorização, analgesia (analgesia NÃO mascara o diagnóstico), exames e imagem conforme o padrão da dor. Manter jejum.",
        "REAVALIAR o abdome em série, pelo mesmo examinador quando possível. Abdome agudo muda de hora em hora — o exame normal de agora não garante o de daqui a duas horas.",
        "Se surgir hipotensão, alteração do estado mental, abdome em tábua, dor desproporcional ao exame ou massa pulsátil, volte: passa a ser catástrofe e a conduta é cirúrgica.",
      ],
      next: "padrao",
    },

    catastrofe: {
      id: "catastrofe",
      type: "action",
      title: "Catástrofe abdominal — ação imediata",
      summary: "Ressuscitação e cirurgia em paralelo. Não atrasar por exames.",
      actions: [
        "Acionar CIRURGIA IMEDIATAMENTE; reservar hemocomponentes e sala cirúrgica.",
        "USG à beira-leito (FAST/aorta): líquido livre, aneurisma, gravidez ectópica.",
        "Aneurisma de aorta roto: hipotensão permissiva (PAS ~ 90) até o controle cirúrgico; transfusão maciça.",
        "Gravidez ectópica rota: cirurgia de urgência; não aguardar β-hCG quantitativo.",
        "Perfuração/peritonite: antibiótico de amplo espectro precoce + laparotomia.",
        "Isquemia mesentérica: lactato e acidose apoiam, mas o normal NÃO exclui — angiotomografia se houver mínima estabilidade; revascularização/ressecção urgente.",
        "Corrigir coagulopatia; evitar hipotermia.",
      ],
      next: "cirurgia",
    },

    padrao: {
      id: "padrao",
      type: "decision",
      title: "Definir o padrão do abdome agudo",
      question: "Qual padrão clínico predomina?",
      evidence: [
        "Quase toda doença cirúrgica do abdome agudo cai em quatro mecanismos: INFECÇÃO, ISQUEMIA, OBSTRUÇÃO ou PERFURAÇÃO de víscera — mais a HEMORRAGIA, que é a que mata mais rápido.",
        "Hemorrágicas a não esquecer: trauma de órgão sólido, ruptura de aneurisma arterial, gravidez ectópica rota, divertículo sangrante, malformação arteriovenosa, fístula aortoduodenal após enxerto aórtico, pancreatite hemorrágica, Mallory-Weiss e ruptura espontânea de baço.",
        "Infecciosas: apendicite, colecistite, divertículo de Meckel, abscesso hepático, abscesso diverticular e abscesso do psoas.",
        "Perfurativas: úlcera perfurada, câncer gastrointestinal perfurado, divertículo perfurado e síndrome de Boerhaave.",
        "Obstrutivas: brida, volvo de sigmoide, volvo cecal, hérnia encarcerada, doença inflamatória intestinal, neoplasia e intussuscepção.",
        "Isquêmicas: trombose ou embolia mesentérica, colite isquêmica, doença de Buerger, hérnia estrangulada, torção ovariana e torção testicular.",
        "Inflamatório: dor progressiva, febre, leucocitose, defesa localizada.",
        "Obstrutivo: dor em cólica, distensão, parada de eliminação de gases/fezes, vômitos, ruídos aumentados e depois abolidos.",
        "Perfurativo: dor súbita e intensa, abdome em tábua, pneumoperitônio.",
        "Vascular: dor desproporcional, fibrilação atrial/aterosclerose, acidose/lactato.",
        "Hemorrágico: hipotensão, palidez, β-hCG positivo ou anticoagulação.",
      ],
      options: [
        { id: "inflamatorio", label: "Inflamatório (apendicite, colecistite, diverticulite, pancreatite)", next: "inflamatorio" },
        { id: "obstrutivo", label: "Obstrutivo", next: "obstrutivo" },
        { id: "perfurativo", label: "Perfurativo", next: "perfurativo" },
        { id: "vascular", label: "Vascular / isquêmico", next: "vascular" },
        { id: "extra", label: "Suspeita de causa extra-abdominal", next: "extra_abdominal" },
        { id: "indefinido", label: "Tenho certeza do abdome agudo, mas NÃO do padrão", next: "padrao_indefinido" },
      ],
    },

    // ── Não sabe o padrão ─────────────────────────────────────────────────────
    //
    // Faltava a saída mais honesta desta tela. As cinco opções pressupõem que o
    // padrão já foi reconhecido — e reconhecer padrão de abdome agudo é
    // justamente o que se aprende com anos de plantão. Quem tem certeza de que é
    // abdome agudo e dúvida sobre o tipo ficava sem caminho, e a tela obrigava a
    // um chute que muda a conduta.
    //
    // A resposta clínica é que ELE NÃO PRECISA DECIDIR AGORA. O que se faz nas
    // primeiras horas é igual nos cinco padrões; o que o padrão define é o
    // tratamento DEFINITIVO, e quem define é a imagem, não o exame inicial.
    // Dizer isso tira o peso de decidir de quem não sabe — que é o propósito de
    // todo caminho guiado deste app.
    padrao_indefinido: {
      id: "padrao_indefinido",
      type: "action",
      title: "Não precisa definir o padrão para começar",
      summary:
        "Sem sinal de catástrofe, o começo é o MESMO nos cinco padrões. O padrão decide o tratamento definitivo — e quem o define é a imagem, não o exame inicial.",
      actions: [
        "FAÇA AGORA, vale para qualquer padrão: jejum, dois acessos calibrosos, cristaloide conforme a perfusão, analgesia, antiemético e monitorização.",
        "ANALGESIA NÃO MASCARA o diagnóstico nem atrasa a cirurgia — isso está estabelecido e o mito ainda custa horas de dor a muito paciente. Tratar a dor melhora o exame, porque o abdome relaxa.",
        "EXAMES: hemograma, PCR, eletrólitos, função renal, glicemia, amilase/lipase, TGO/TGP, bilirrubinas, coagulograma, gasometria com LACTATO, urina e β-hCG em toda mulher em idade fértil — o β-hCG muda o diagnóstico e ninguém pergunta o suficiente.",
        "IMAGEM É QUEM DEFINE O PADRÃO. Tomografia de abdome com contraste é o exame que responde à sua dúvida na maioria dos casos. Ultrassom à beira do leito antes, se disponível: vê líquido livre, aorta, vesícula e hidronefrose em minutos.",
        "ENQUANTO ESPERA A IMAGEM, procure os quatro achados que mudam a rota sozinhos: abdome em tábua (perfuração), dor desproporcional ao exame (isquemia mesentérica), massa pulsátil expansiva (aneurisma) e parada de eliminação de gases e fezes com distensão (obstrução).",
        "REEXAMINE O ABDOME EM SÉRIE, de preferência com o mesmo examinador. O padrão que não estava claro na primeira hora costuma se declarar na terceira — abdome agudo é diagnóstico em movimento.",
        "CHAME A CIRURGIA sem ter o padrão definido. Não é preciso o diagnóstico pronto para pedir avaliação: dúvida em abdome agudo já é motivo, e a demora até a cirurgia é o que piora o desfecho.",
        "Idoso, diabético, imunossuprimido, em corticoide ou gestante: o exame ENGANA — pode não haver defesa, febre nem leucocitose com víscera perfurada. Nesses, baixe o limiar para imagem e para acionar a cirurgia.",
      ],
      next: "padrao",
    },

    inflamatorio: {
      id: "inflamatorio",
      type: "action",
      title: "Padrão inflamatório",
      summary: "Localizar o foco e definir necessidade cirúrgica.",
      actions: [
        "Apendicite: dor periumbilical migrando para fossa ilíaca direita, Blumberg. USG (jovem/gestante) ou TC; escore de Alvarado auxilia. Tratamento: apendicectomia (antibiótico isolado em casos selecionados).",
        "Colecistite: dor em hipocôndrio direito, Murphy positivo, febre. USG é o exame de escolha (parede > 4 mm, líquido perivesicular, cálculo impactado). Antibiótico + colecistectomia precoce.",
        "Colangite: tríade de Charcot (dor + febre + icterícia); se hipotensão e confusão = pêntade de Reynolds → drenagem biliar URGENTE (CPRE) + antibiótico.",
        "Diverticulite: dor em fossa ilíaca esquerda, febre. TC classifica (Hinchey). Não complicada: antibiótico; complicada (abscesso/perfuração): drenagem/cirurgia.",
        "Pancreatite: dor epigástrica em faixa, lipase > 3× o limite. Tratamento: hidratação vigorosa com Ringer lactato, analgesia, dieta precoce. NÃO usar antibiótico profilático. Investigar causa biliar (USG) e alcoólica.",
        "Antibiótico empírico conforme foco (ver módulo de sepse se houver disfunção orgânica).",
      ],
      next: "reavaliar",
    },

    obstrutivo: {
      id: "obstrutivo",
      type: "action",
      title: "Padrão obstrutivo",
      summary: "Definir nível, causa e presença de sofrimento de alça.",
      actions: [
        "Causas mais frequentes: aderências (cirurgia prévia), hérnia encarcerada e neoplasia. SEMPRE examinar os orifícios herniários.",
        "TC de abdome com contraste define nível, causa e sinais de sofrimento de alça.",
        "Suporte: jejum, sonda nasogástrica em aspiração, hidratação e correção de distúrbios hidroeletrolíticos (alcalose hipoclorêmica por vômitos).",
        "SINAIS DE ESTRANGULAMENTO (cirurgia imediata): dor contínua e intensa, febre, taquicardia, leucocitose, acidose/lactato, defesa, pneumatose ou pobre realce de alça na TC.",
        "Obstrução por aderências SEM sofrimento: tentativa conservadora 24–48 h com reavaliação seriada.",
        "Hérnia encarcerada/estrangulada: correção cirúrgica de urgência.",
        "Volvo de sigmoide: descompressão endoscópica seguida de cirurgia eletiva.",
      ],
      next: "reavaliar",
    },

    perfurativo: {
      id: "perfurativo",
      type: "action",
      title: "Padrão perfurativo",
      summary: "Peritonite — antibiótico precoce e cirurgia.",
      actions: [
        "Radiografia de tórax em ortostase ou TC: pneumoperitônio (TC é bem mais sensível).",
        "Causas: úlcera péptica perfurada, perfuração diverticular, neoplásica, iatrogênica (pós-endoscopia) e corpo estranho.",
        "Antibiótico de amplo espectro IMEDIATO (cobertura de Gram-negativos e anaeróbios).",
        "Ressuscitação volêmica e correção de distúrbios; sonda gástrica.",
        "LAPAROTOMIA/laparoscopia de urgência — o atraso aumenta muito a mortalidade.",
        "Se houver disfunção orgânica, tratar como sepse de foco abdominal (controle do foco em até 6–12 h).",
      ],
      next: "cirurgia",
    },

    vascular: {
      id: "vascular",
      type: "action",
      title: "Padrão vascular — isquemia mesentérica",
      summary: "Dor desproporcional ao exame. Diagnóstico tardio = mortalidade altíssima.",
      actions: [
        "Suspeitar em: fibrilação atrial, doença aterosclerótica, insuficiência cardíaca, hipovolemia/choque, estados de hipercoagulabilidade.",
        "ANGIOTOMOGRAFIA de abdome é o exame de escolha — solicitar precocemente, sem aguardar peritonite.",
        "Lactato e acidose apoiam o diagnóstico, mas valores NORMAIS NÃO EXCLUEM (elevam-se tardiamente).",
        "Ressuscitação volêmica; EVITAR vasoconstritores esplâncnicos quando possível; anticoagulação plena se não houver contraindicação.",
        "Antibiótico de amplo espectro (translocação bacteriana).",
        "Revascularização (embolectomia/endovascular) e/ou ressecção do segmento inviável — cirurgia vascular e geral em conjunto.",
        "Programar second look em 24–48 h quando houver dúvida de viabilidade.",
      ],
      next: "cirurgia",
    },

    extra_abdominal: {
      id: "extra_abdominal",
      type: "action",
      title: "Causas extra-abdominais e metabólicas",
      summary: "Dor abdominal sem achado cirúrgico — não operar o que não é cirúrgico.",
      actions: [
        "Cardiovascular: infarto de parede inferior e dissecção de aorta — ECG e exame vascular obrigatórios.",
        "Endócrino e metabólico: uremia, crise diabética, crise addisoniana, porfiria aguda intermitente, hiperlipoproteinemia aguda, hipercalcemia e febre familiar do Mediterrâneo.",
        "HEMATOLÓGICO — a categoria mais esquecida: crise falciforme, leucemia aguda e outras discrasias sanguíneas.",
        "TOXINAS E FÁRMACOS: envenenamento por chumbo e outros metais pesados, abstinência de opioide, e picada de aranha viúva-negra (Latrodectus), que provoca abdome em tábua sem peritonite.",
        "Torácico: pneumonia de base e embolia pulmonar podem cursar com dor abdominal alta.",
        "Geniturinário: cólica renal, pielonefrite, torção testicular/ovariana, doença inflamatória pélvica.",
        "Herpes-zóster (dor em dermátomo antes das lesões) e parede abdominal (hematoma de reto).",
        "Reavaliar e tratar a causa de base; evitar laparotomia não terapêutica.",
        "A idade muda a probabilidade: apendicite predomina no jovem; doença biliar, obstrução intestinal, isquemia/infarto intestinal e diverticulite predominam no idoso.",
        "Mesmo com todo o avanço de imagem, a anamnese e o exame físico continuam sendo os pilares — os exames laboratoriais e de imagem são orientados por eles, não o contrário.",
      ],
      next: "reavaliar",
    },

    reavaliar: {
      id: "reavaliar",
      type: "decision",
      title: "Reavaliação após conduta inicial",
      question: "Há indicação cirúrgica, deterioração ou diagnóstico indefinido com dor persistente?",
      evidence: [
        "Reavaliação seriada é parte do tratamento — o abdome agudo evolui.",
        "Nunca dar alta com dor abdominal sem diagnóstico e sem reavaliação programada.",
      ],
      options: [
        { id: "cirurgia", label: "Sim — indicação cirúrgica / deterioração", next: "cirurgia" },
        { id: "observacao", label: "Não — manter tratamento clínico", next: "observacao" },
      ],
    },

    cirurgia: {
      id: "cirurgia",
      type: "transition",
      title: "Tratamento cirúrgico / UTI",
      summary: "Controle do foco e suporte perioperatório.",
      disposition: "icu",
      exitCriteria: [
        "Controle do foco o mais precoce possível — em sepse abdominal, idealmente em 6–12 h.",
        "Antibiótico de amplo espectro mantido e descalonado com culturas em 48–72 h.",
        "Suporte hemodinâmico e ventilatório; correção de coagulopatia e distúrbios eletrolíticos.",
        "Vigiar síndrome compartimental abdominal, deiscência e abscesso residual.",
        "Profilaxia de TVP e nutrição precoce quando possível.",
      ],
      targets: [
        { moduleId: "sepse-adulto", label: "Sepse / Choque séptico", reason: "Foco abdominal com disfunção orgânica" },
        { moduleId: "choque", label: "Choque", reason: "Definir perfil hemodinâmico e suporte" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte pressórico perioperatório" },
      ],
    },

    observacao: {
      id: "observacao",
      type: "transition",
      title: "Observação com reavaliação seriada",
      summary: "Tratamento clínico com vigilância ativa.",
      disposition: "observation",
      exitCriteria: [
        "Reavaliação clínica e laboratorial seriada (exame abdominal repetido pelo mesmo examinador quando possível).",
        "Manter jejum ou dieta conforme evolução; analgesia adequada; hidratação.",
        "Reconsiderar imagem se não houver melhora em 12–24 h ou se houver piora.",
        "Alta apenas com dor controlada, diagnóstico definido ou reavaliação garantida em 24 h, com sinais de alarme por escrito.",
      ],
      targets: [],
    },
  },
};
