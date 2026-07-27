import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Abdome agudo — abordagem inicial e diferencial.
 * Eixo: excluir catástrofes com risco imediato de vida (aneurisma roto,
 * gravidez ectópica rota, isquemia mesentérica, perfuração) → classificar o
 * padrão (inflamatório, obstrutivo, perfurativo, vascular, hemorrágico) →
 * exame dirigido e destino cirúrgico.
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
        { id: "sim", label: "Sim — instável / catástrofe", next: "catastrofe" },
        { id: "nao", label: "Não — estável", next: "padrao" },
      ],
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
      ],
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
        "Metabólico: cetoacidose diabética, uremia, insuficiência adrenal, hipercalcemia, porfiria.",
        "Torácico: pneumonia de base e embolia pulmonar podem cursar com dor abdominal alta.",
        "Geniturinário: cólica renal, pielonefrite, torção testicular/ovariana, doença inflamatória pélvica.",
        "Herpes-zóster (dor em dermátomo antes das lesões) e parede abdominal (hematoma de reto).",
        "Reavaliar e tratar a causa de base; evitar laparotomia não terapêutica.",
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
