import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Politrauma — atendimento inicial ao traumatizado grave.
 * Fiel ao ATLS (avaliação primária XABCDE com hemorragia exsanguinante primeiro),
 * protocolo de transfusão maciça 1:1:1, ácido tranexâmico (CRASH-2/CRASH-3) e
 * damage control. Doses por peso em derive().
 */

export const politraumaDecisionTree: DecisionTreeDefinition = {
  id: "politrauma",
  version: "2024.1",
  label: "Politrauma — atendimento inicial",
  entryNodeId: "preparo",
  derive: (v): Record<string, string> => {
    const peso = Number((v.peso ?? "").replace(",", "."));
    if (!Number.isFinite(peso) || peso <= 0) return {};
    const r0 = (n: number) => Math.round(n).toString();
    return {
      cristaloide: r0(peso * 15), // ~1 L em 70 kg (ATLS: 1 L, evitar sobrecarga)
    };
  },
  nodes: {
    preparo: {
      id: "preparo",
      type: "action",
      title: "Preparação e segurança",
      summary: "Antes do contato: equipe, EPI e material prontos.",
      actions: [
        "EPI completo (precaução universal): luvas, avental, óculos, máscara.",
        "Equipe definida com líder único; funções distribuídas (via aérea, acessos, exposição, registro).",
        "Material pronto: via aérea difícil, aspirador, torniquete, dreno de tórax, aquecedor, USG (FAST).",
        "Acionar banco de sangue e cirurgia PRECOCEMENTE se mecanismo grave ou instabilidade.",
        "Colher história AMPLA e mecanismo do trauma com a equipe pré-hospitalar.",
        "Critérios de TRAUMA MAIOR, que já na triagem definem sala de emergência e equipe completa — Glasgow < 14 ou deterioração neurológica; PAS < 90; FR < 10 ou > 29, ou necessidade de intubação pré-hospitalar.",
        "Trauma maior pela anatomia da lesão: ferimento penetrante em crânio, pescoço, tórax, abdome ou extremidades proximais ao cotovelo e ao joelho; combinação de traumas ou queimadura de 2º/3º grau; suspeita de instabilidade pélvica; fratura de dois ou mais ossos longos proximais (fêmur ou úmero); paralisia de um ou mais membros; amputação completa ou incompleta proximal ao punho ou ao tornozelo.",
      ],
      next: "x_hemorragia",
    },

    x_hemorragia: {
      id: "x_hemorragia",
      type: "decision",
      title: "X · Hemorragia exsanguinante",
      question: "Há sangramento externo maciço visível (jato, poça, membro amputado)?",
      evidence: [
        "No trauma, hemorragia exsanguinante vem ANTES da via aérea (X-ABCDE) — é a causa evitável nº 1 de morte precoce.",
        "Controle imediato: compressão direta firme → torniquete em membro → packing/curativo hemostático em junções.",
      ],
      options: [
        { id: "sim", label: "Sim — sangramento maciço", next: "controle_hemorragia" },
        { id: "nao", label: "Não", next: "a_via_aerea" },
      ],
    },

    controle_hemorragia: {
      id: "controle_hemorragia",
      type: "action",
      title: "Controle imediato da hemorragia",
      summary: "Parar o sangramento é a prioridade absoluta.",
      actions: [
        "Compressão direta firme e contínua sobre o ponto sangrante.",
        "Membro: TORNIQUETE proximal, apertar até cessar o sangramento; anotar o horário. Não afrouxar.",
        "Junções (axila/virilha/pescoço): packing com curativo hemostático + compressão.",
        "Pelve instável: cinta pélvica na altura dos grandes trocânteres.",
        "TRÍADE LETAL — hipotermia, coagulopatia e acidose metabólica. É ela que o controle de danos existe para interromper: parar a hemorragia rápido, reanimar de forma agressiva e adiar a reconstrução definitiva para depois da estabilização.",
        "Cirurgia de controle de danos: hemostasia rápida (inclusive tamponamento intratorácico ou intra-abdominal), víscera oca tratada por reparo primário ou ressecção com descontinuidade temporária, e fechamento temporário — em geral a vácuo — para evitar síndrome compartimental e manejar o débito. Reoperação depois de normalizar temperatura, coagulação e acidose.",
        "O conceito começou no abdome e hoje se aplica também a tórax, pelve e extremidades, com estabilização rápida da fratura reduzindo a resposta inflamatória.",
        "Acionar protocolo de transfusão maciça e cirurgia/hemostasia definitiva imediatamente.",
        "Ácido tranexâmico 1 g IV em 10 min (se < 3 h do trauma) → 1 g em 8 h (CRASH-2).",
      ],
      next: "a_via_aerea",
    },

    a_via_aerea: {
      id: "a_via_aerea",
      type: "decision",
      title: "A · Via aérea com proteção cervical",
      question: "A via aérea está pérvia e protegida (fala normalmente, sem estridor/obstrução)?",
      evidence: [
        "IMOBILIZAÇÃO CERVICAL manual/colar durante toda a avaliação até excluir lesão.",
        "Indicações de via aérea definitiva: apneia, Glasgow ≤ 8, obstrução, trauma de face grave, risco de aspiração, queimadura de via aérea.",
        "Rouquidão, estridor, enfisema subcutâneo ou hematoma cervical expansivo = via aérea ameaçada.",
      ],
      options: [
        { id: "ok", label: "Pérvia e protegida", next: "b_ventilacao" },
        { id: "ameacada", label: "Ameaçada / Glasgow ≤ 8", next: "via_aerea_definitiva" },
      ],
    },

    via_aerea_definitiva: {
      id: "via_aerea_definitiva",
      type: "action",
      title: "Via aérea definitiva",
      summary: "Intubação com estabilização cervical em linha.",
      actions: [
        "Pré-oxigenar; sequência rápida com estabilização cervical MANUAL em linha (retirar a parte anterior do colar).",
        "Escolher droga que preserve hemodinâmica: quetamina ou etomidato (evitar propofol no choque).",
        "Confirmar com capnografia (EtCO₂) — padrão-ouro.",
        "Plano de resgate definido; se falha e não ventila/não intuba: via aérea cirúrgica (cricotireoidostomia).",
        "Fixar tubo e reavaliar o posicionamento após qualquer mobilização.",
      ],
      next: "b_ventilacao",
    },

    b_ventilacao: {
      id: "b_ventilacao",
      type: "decision",
      title: "B · Ventilação e oxigenação",
      question: "Há sinais de pneumotórax hipertensivo, tórax instável ou hemotórax maciço?",
      evidence: [
        "Pneumotórax hipertensivo: hipotensão + turgência jugular + desvio de traqueia + murmúrio abolido + timpanismo. DIAGNÓSTICO CLÍNICO — não esperar radiografia.",
        "Hemotórax maciço: murmúrio abolido + macicez + choque.",
        "Tórax instável (flail chest): segmento com movimento paradoxal + contusão pulmonar.",
        "O₂ suplementar para todos; oximetria e capnografia contínuas.",
      ],
      options: [
        { id: "sim", label: "Sim — alteração torácica grave", next: "conduta_torax" },
        { id: "nao", label: "Não", next: "c_circulacao" },
      ],
    },

    conduta_torax: {
      id: "conduta_torax",
      type: "action",
      title: "Conduta torácica imediata",
      summary: "Tratar antes de qualquer exame de imagem.",
      actions: [
        "Pneumotórax hipertensivo: descompressão IMEDIATA — punção no 5º EIC linha axilar média (ou 2º EIC linha hemiclavicular) → drenagem em selo d'água.",
        "Hemotórax maciço (> 1.500 mL de saída ou > 200 mL/h por 2–4 h): drenagem + acionar toracotomia.",
        "Pneumotórax aberto: curativo de três pontas → drenagem torácica definitiva.",
        "Tórax instável: analgesia eficaz, O₂, considerar ventilação; tratar a contusão pulmonar (evitar hiper-hidratação).",
        "Tamponamento cardíaco (Beck: hipotensão + turgência + bulhas abafadas): FAST → pericardiocentese/toracotomia.",
      ],
      next: "c_circulacao",
    },

    c_circulacao: {
      id: "c_circulacao",
      type: "decision",
      title: "C · Circulação e controle de hemorragia",
      question: "Há sinais de choque (PAS < 90, FC > 120, pele fria, enchimento capilar > 3 s, confusão)?",
      evidence: [
        "No trauma, choque é HEMORRÁGICO até prova em contrário — buscar sangue em 5 locais: tórax, abdome, pelve/retroperitônio, ossos longos e externo ('no chão e mais 4').",
        "Dois acessos calibrosos (14–16 G) periféricos; se falha, acesso intraósseo.",
        "Hipotensão permissiva (PAS ~80–90) até hemostasia — EXCETO no TCE, onde a meta é PAS ≥ 110 mmHg.",
      ],
      options: [
        { id: "sim", label: "Sim — choque / instabilidade", next: "peso" },
        { id: "nao", label: "Não — hemodinamicamente estável", next: "d_neuro" },
      ],
    },

    peso: {
      id: "peso",
      type: "input",
      title: "Peso estimado",
      intro: "Para calcular volume e hemocomponentes.",
      fields: [
        {
          id: "peso",
          label: "Peso",
          unit: "kg",
          presets: [
            { value: "50", label: "50 kg" },
            { value: "60", label: "60 kg" },
            { value: "70", label: "70 kg" },
            { value: "80", label: "80 kg" },
            { value: "90", label: "90 kg" },
            { value: "100", label: "100 kg" },
          ],
          allowCustom: true,
          customLabel: "Outro peso (kg)",
          customKeyboard: "numeric",
        },
      ],
      next: "reanimacao",
    },

    reanimacao: {
      id: "reanimacao",
      type: "action",
      title: "Reanimação hemostática",
      summary: "Sangue precoce, pouco cristaloide, controle da fonte.",
      actions: [
        "Cristaloide AQUECIDO {cristaloide} mL (~1 L) como ponte — NÃO usar grandes volumes (piora coagulopatia e acidose).",
        "Iniciar HEMOCOMPONENTES precocemente: protocolo de transfusão maciça em proporções iguais — concentrado de hemácias, plasma e plaquetas (1:1:1), acrescentando crioprecipitado. Repor o sangue perdido com sangue, não com cristaloide.",
        "Isso é REANIMAÇÃO DE CONTROLE DE DANOS: a estratégia nasceu da experiência militar e previne a coagulopatia grave, que por sua vez reduz a disfunção fisiológica após trauma grave.",
        "Ácido tranexâmico 1 g IV em 10 min se < 3 h do trauma → 1 g em 8 h. NÃO iniciar após 3 h: o CRASH-2 randomizou 20.211 pacientes e mostrou queda da mortalidade por todas as causas (14,5% × 16%; p = 0,0035), mas a administração tardia se associou a dano.",
        "Cálcio: gluconato/cloreto de cálcio a cada 3–4 unidades transfundidas (citrato quela cálcio).",
        "Combater a tríade letal: HIPOTERMIA (aquecer paciente/fluidos), ACIDOSE, COAGULOPATIA.",
        "FAST + radiografias de tórax e pelve à beira-leito para localizar a fonte.",
        "Controle DEFINITIVO da fonte: cirurgia/angioembolização — não postergar por exames.",
      ],
      next: "fonte",
    },

    fonte: {
      id: "fonte",
      type: "decision",
      title: "Resposta à reanimação",
      question: "O paciente respondeu e estabilizou após a reanimação inicial?",
      evidence: [
        "Respondedor transitório ou não-respondedor = sangramento ativo → sala de cirurgia / angioembolização.",
        "Instável NÃO vai para tomografia — vai para controle da fonte.",
      ],
      options: [
        { id: "responde", label: "Respondeu e manteve-se estável", next: "d_neuro" },
        { id: "nao_responde", label: "Não respondeu / resposta transitória", next: "damage_control" },
      ],
    },

    damage_control: {
      id: "damage_control",
      type: "transition",
      title: "Cirurgia de controle de danos",
      summary: "Sangramento ativo não controlado — hemostasia cirúrgica imediata.",
      disposition: "other_module",
      exitCriteria: [
        "Sala cirúrgica IMEDIATA (ou angioembolização conforme a fonte) — não retardar por tomografia.",
        "Damage control: controlar hemorragia e contaminação, empacotar, fechar temporariamente e levar à UTI para correção fisiológica.",
        "Manter transfusão 1:1:1, aquecimento ativo e correção de cálcio.",
        "Reoperação programada em 24–48 h após reversão da tríade letal.",
      ],
      targets: [
        { moduleId: "choque", label: "Choque", reason: "Confirmar perfil e suporte hemodinâmico" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Vasopressor após reposição volêmica adequada" },
      ],
    },

    d_neuro: {
      id: "d_neuro",
      type: "decision",
      title: "D · Avaliação neurológica",
      question: "Glasgow ≤ 13, pupilas assimétricas, déficit focal ou trauma craniano significativo?",
      evidence: [
        "Calcular Glasgow (abertura ocular + resposta verbal + motora) e avaliar pupilas.",
        "Glasgow ≤ 8 = via aérea definitiva. Anisocoria = herniação até prova em contrário.",
        "Sempre excluir hipoglicemia e hipóxia como causa de rebaixamento.",
      ],
      options: [
        { id: "sim", label: "Sim — alteração neurológica", next: "tce_transicao" },
        { id: "nao", label: "Não — neurológico preservado", next: "e_exposicao" },
      ],
    },

    tce_transicao: {
      id: "tce_transicao",
      type: "transition",
      title: "Trauma cranioencefálico associado",
      summary: "Priorizar perfusão cerebral e tomografia precoce.",
      disposition: "other_module",
      exitCriteria: [
        "EVITAR hipotensão (meta PAS ≥ 110 mmHg) e hipóxia (SpO₂ ≥ 90%) — cada episódio piora o desfecho.",
        "TC de crânio precoce assim que estabilizado; neurocirurgia se lesão com efeito de massa.",
        "Sinais de herniação: cabeceira 30°, normocapnia (PaCO₂ 35–38), salina hipertônica/manitol.",
      ],
      targets: [
        { moduleId: "tce", label: "TCE — guia completo", reason: "Classificação, indicação de TC e controle da PIC" },
      ],
    },

    e_exposicao: {
      id: "e_exposicao",
      type: "action",
      title: "E · Exposição e prevenção de hipotermia",
      summary: "Expor tudo, examinar, e aquecer imediatamente.",
      actions: [
        "Despir completamente; rolamento em bloco para examinar o dorso, coluna e região perineal.",
        "AQUECER IMEDIATAMENTE: manta térmica, fluidos aquecidos, sala aquecida — hipotermia agrava coagulopatia.",
        "Adjuntos: monitorização completa, sonda gástrica e vesical (contraindicada se suspeita de lesão uretral: sangue no meato, hematoma perineal, próstata alta).",
        "Radiografias de tórax e pelve; FAST/e-FAST à beira-leito.",
        "Analgesia adequada e profilaxia antitetânica.",
      ],
      next: "secundaria",
    },

    secundaria: {
      id: "secundaria",
      type: "action",
      title: "Avaliação secundária",
      summary: "Só após a primária completa e o paciente estabilizado.",
      actions: [
        "História AMPLA: Alergias, Medicamentos, Passado, Líquidos/última refeição, Ambiente/mecanismo.",
        "Exame da cabeça aos pés, incluindo dorso, períneo, toque retal quando indicado e todos os segmentos.",
        "Reavaliar continuamente o ABCDE — qualquer deterioração exige voltar ao início da avaliação primária.",
        "Exames dirigidos: tomografia de corpo inteiro se estável e mecanismo grave.",
        "Documentar lesões, horários (torniquete, TXA) e transfusões.",
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "decision",
      title: "Destino",
      question: "Há lesão grave, necessidade de cirurgia ou suporte avançado?",
      evidence: [
        "Considerar transferência precoce se o serviço não dispuser de recurso definitivo (não retardar por exames).",
      ],
      options: [
        { id: "grave", label: "Sim — lesão grave / suporte", next: "uti" },
        { id: "leve", label: "Não — trauma leve, estável", next: "observacao" },
      ],
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "UTI / centro cirúrgico",
      summary: "Trauma grave com necessidade de monitorização e suporte.",
      disposition: "icu",
      exitCriteria: [
        "Corrigir a tríade letal: aquecer, corrigir acidose e coagulopatia (guiado por tromboelastometria quando disponível).",
        "Reavaliação seriada: síndrome compartimental (abdominal e de membros), lesões inicialmente despercebidas.",
        "Profilaxia de TVP assim que a hemostasia permitir; nutrição precoce; analgesia adequada.",
        "Reoperação programada se damage control.",
      ],
      targets: [
        { moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Parametrização pós-intubação / contusão pulmonar" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte hemodinâmico" },
        { moduleId: "sedoanalgesia", label: "Sedoanalgesia & BNM", reason: "Sedação e analgesia do trauma grave" },
      ],
    },

    observacao: {
      id: "observacao",
      type: "transition",
      title: "Observação e reavaliação",
      summary: "Trauma sem lesão grave identificada — vigiar deterioração tardia.",
      disposition: "observation",
      exitCriteria: [
        "Observação com reavaliação seriada — lesões abdominais e o TCE podem se manifestar tardiamente.",
        "Analgesia, profilaxia antitetânica e orientação de sinais de alarme por escrito.",
        "Retorno imediato se dor progressiva, vômitos, rebaixamento, dispneia ou distensão abdominal.",
      ],
      targets: [],
    },
  },
};
