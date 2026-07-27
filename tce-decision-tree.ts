import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Traumatismo cranioencefálico (TCE).
 * Base: ATLS, Brain Trauma Foundation (4ª ed.) e Canadian CT Head Rule.
 * Eixos: classificação por Glasgow, indicação de TC, prevenção de lesão
 * secundária (hipotensão/hipóxia) e controle da hipertensão intracraniana.
 */

export const tceDecisionTree: DecisionTreeDefinition = {
  id: "tce",
  version: "2024.1",
  label: "Traumatismo cranioencefálico",
  entryNodeId: "estabilizacao",
  derive: (v): Record<string, string> => {
    const peso = Number((v.peso ?? "").replace(",", "."));
    if (!Number.isFinite(peso) || peso <= 0) return {};
    const r0 = (n: number) => Math.round(n).toString();
    const r1 = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");
    return {
      manitolMin: r1(peso * 0.25),
      manitolMax: r1(peso * 1),
      salina3Min: r0(peso * 2.5),
      salina3Max: r0(peso * 5),
    };
  },
  nodes: {
    estabilizacao: {
      id: "estabilizacao",
      type: "action",
      title: "Estabilização primeiro — evitar lesão secundária",
      summary: "A lesão secundária (hipotensão e hipóxia) determina o desfecho mais que a lesão primária.",
      actions: [
        "Via aérea: Glasgow ≤ 8 → via aérea definitiva com estabilização cervical em linha.",
        "Oxigenação: manter SpO₂ ≥ 90% (idealmente ≥ 94%). UM episódio de hipóxia já piora o prognóstico.",
        "Pressão arterial: manter PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 anos e > 70 anos; ≥ 100 para 50–69 anos). Hipotensão é proibida no TCE.",
        "Glicemia capilar — hipoglicemia simula e agrava lesão neurológica.",
        "Imobilização cervical até excluir lesão de coluna.",
        "Normocapnia: PaCO₂ 35–45 mmHg. NÃO hiperventilar profilaticamente.",
      ],
      next: "glasgow",
    },

    glasgow: {
      id: "glasgow",
      type: "decision",
      title: "Classificar pela escala de Glasgow",
      question: "Qual o Glasgow após a estabilização inicial?",
      evidence: [
        "Leve 13–15 · Moderado 9–12 · Grave 3–8.",
        "Usar a MELHOR resposta e avaliar após corrigir hipóxia, hipotensão, hipoglicemia e sedação.",
        "Registrar sempre as pupilas (tamanho e reatividade) — valor prognóstico independente.",
      ],
      options: [
        { id: "grave", label: "Grave — Glasgow 3–8", next: "tce_grave" },
        { id: "moderado", label: "Moderado — Glasgow 9–12", next: "tc_indicada" },
        { id: "leve", label: "Leve — Glasgow 13–15", next: "leve_criterios" },
      ],
    },

    leve_criterios: {
      id: "leve_criterios",
      type: "decision",
      title: "TCE leve — indicação de tomografia",
      question: "Há algum critério de risco para lesão intracraniana?",
      evidence: [
        "Canadian CT Head Rule (alto risco): Glasgow < 15 após 2 h; suspeita de fratura aberta/afundamento; sinais de fratura de base de crânio (equimose periorbitária/retroauricular, otorragia, fístula liquórica); ≥ 2 episódios de vômito; idade ≥ 65 anos.",
        "Risco médio: amnésia retrógrada > 30 min; mecanismo perigoso (atropelamento, ejeção, queda > 1 m ou 5 degraus).",
        "Independentemente da regra: ANTICOAGULAÇÃO ou antiagregação, coagulopatia, déficit focal, convulsão pós-trauma ou intoxicação = TC.",
      ],
      options: [
        { id: "sim", label: "Sim — há critério de risco", next: "tc_indicada" },
        { id: "nao", label: "Não — sem critérios", next: "observacao_leve" },
      ],
    },

    observacao_leve: {
      id: "observacao_leve",
      type: "transition",
      title: "TCE leve sem critérios — observação",
      summary: "Glasgow 15, exame normal e sem fatores de risco.",
      disposition: "observation",
      exitCriteria: [
        "Observação clínica; alta com acompanhante orientado e orientações POR ESCRITO.",
        "Retorno imediato: rebaixamento, cefaleia progressiva, vômitos repetidos, convulsão, déficit focal, assimetria pupilar, saída de líquido claro pelo nariz/ouvido.",
        "Evitar álcool, sedativos e atividade de risco; retorno gradual às atividades.",
        "Se anticoagulado: observação prolongada e TC mesmo com exame normal.",
      ],
      targets: [],
    },

    tc_indicada: {
      id: "tc_indicada",
      type: "action",
      title: "Tomografia de crânio sem contraste",
      summary: "Exame de escolha na fase aguda — rápido e disponível.",
      actions: [
        "TC de crânio sem contraste o mais precoce possível (paciente estável para transporte).",
        "Buscar: hematoma extradural, subdural, contusão, hemorragia subaracnoide traumática, lesão axonal difusa, fratura, desvio de linha média e apagamento de cisternas.",
        "Incluir coluna cervical na tomografia quando indicado.",
        "REVERTER anticoagulação imediatamente se sangramento (ver nó específico).",
        "Repetir TC em 6–12 h ou se houver qualquer deterioração neurológica.",
      ],
      next: "resultado_tc",
    },

    resultado_tc: {
      id: "resultado_tc",
      type: "decision",
      title: "Resultado da tomografia",
      question: "Há lesão com efeito de massa, desvio de linha média ou sangramento significativo?",
      evidence: [
        "Indicações cirúrgicas típicas: hematoma extradural > 30 cm³; subdural agudo com espessura > 10 mm ou desvio > 5 mm; contusão com efeito de massa e deterioração; fratura com afundamento maior que a espessura da calota.",
        "Acionar neurocirurgia imediatamente diante de qualquer dessas.",
      ],
      options: [
        { id: "cirurgica", label: "Sim — lesão cirúrgica / efeito de massa", next: "neurocirurgia" },
        { id: "nao_cirurgica", label: "Não — sem lesão cirúrgica", next: "anticoag" },
      ],
    },

    neurocirurgia: {
      id: "neurocirurgia",
      type: "transition",
      title: "Acionar neurocirurgia — lesão com indicação cirúrgica",
      summary: "Drenagem precoce muda o desfecho, sobretudo no extradural.",
      disposition: "other_module",
      exitCriteria: [
        "Neurocirurgia IMEDIATA; hematoma extradural com anisocoria é emergência absoluta (janela terapêutica curta).",
        "Manter PAS ≥ 110 mmHg, SpO₂ ≥ 90%, normocapnia e cabeceira a 30°.",
        "Reverter anticoagulação/coagulopatia sem demora.",
        "Se sinais de herniação enquanto aguarda: terapia hiperosmolar e hiperventilação apenas como ponte.",
      ],
      targets: [
        { moduleId: "politrauma", label: "Politrauma", reason: "Lesões associadas no traumatizado grave" },
      ],
    },

    anticoag: {
      id: "anticoag",
      type: "decision",
      title: "Anticoagulação ou coagulopatia?",
      question: "O paciente usa anticoagulante/antiagregante ou tem coagulopatia?",
      evidence: [
        "Sangramento intracraniano em anticoagulado exige reversão IMEDIATA — não aguardar exames de coagulação para decidir.",
        "Repetir TC precocemente mesmo se a primeira foi normal.",
      ],
      options: [
        { id: "sim", label: "Sim", next: "reversao" },
        { id: "nao", label: "Não", next: "gravidade_check" },
      ],
    },

    reversao: {
      id: "reversao",
      type: "action",
      title: "Reversão de anticoagulação",
      summary: "Reverter agora; a expansão do hematoma é tempo-dependente.",
      actions: [
        "Varfarina: vitamina K 10 mg IV + complexo protrombínico (CCP 4 fatores) 25–50 UI/kg conforme INR. Alvo INR < 1,5.",
        "Dabigatrana: idarucizumabe 5 g IV (2 × 2,5 g).",
        "Rivaroxabana/apixabana/edoxabana: andexanet alfa; se indisponível, CCP 4 fatores 50 UI/kg.",
        "Heparina não fracionada: protamina 1 mg por 100 UI (máx 50 mg).",
        "Antiagregante: transfusão de plaquetas NÃO é rotina (estudo PATCH mostrou pior desfecho na hemorragia espontânea) — reservar para neurocirurgia iminente, com discussão conjunta.",
        "Corrigir plaquetopenia e fibrinogênio; controlar a pressão arterial.",
      ],
      next: "gravidade_check",
    },

    gravidade_check: {
      id: "gravidade_check",
      type: "decision",
      title: "Necessita monitorização intensiva?",
      question: "Glasgow ≤ 8, TC alterada ou deterioração neurológica?",
      evidence: [
        "TCE grave com TC alterada tem indicação de monitorização da PIC (BTF).",
        "Qualquer queda de 2 pontos no Glasgow = reavaliação e nova TC.",
      ],
      options: [
        { id: "sim", label: "Sim", next: "tce_grave" },
        { id: "nao", label: "Não — estável, TC sem lesão", next: "observacao_leve" },
      ],
    },

    tce_grave: {
      id: "tce_grave",
      type: "action",
      title: "TCE grave — neuroproteção",
      summary: "Objetivo: manter oferta de oxigênio ao cérebro e evitar hipertensão intracraniana.",
      actions: [
        "Via aérea definitiva; sedação e analgesia adequadas (evitar tosse, dor e assincronia).",
        "Cabeceira a 30°, cabeça em posição neutra, evitar compressão jugular (colar/fixação de tubo apertados).",
        "Metas: PAS ≥ 110 mmHg · SpO₂ ≥ 90% · PaCO₂ 35–45 mmHg · normotermia (evitar febre) · normoglicemia · sódio normal-alto.",
        "Monitorização da PIC se Glasgow ≤ 8 com TC alterada: manter PIC < 22 mmHg e PPC 60–70 mmHg (PPC = PAM − PIC).",
        "Profilaxia de convulsão precoce: fenitoína ou levetiracetam por 7 dias em alto risco (BTF) — reduz crise precoce, não altera epilepsia tardia.",
        "NÃO usar corticoide — aumenta mortalidade no TCE (estudo CRASH).",
        "Normovolemia com cristaloide isotônico; evitar soluções hipotônicas (glicosado, Ringer lactato em excesso).",
      ],
      next: "peso",
    },

    peso: {
      id: "peso",
      type: "input",
      title: "Peso do paciente",
      intro: "Para calcular a terapia hiperosmolar.",
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
      next: "herniacao",
    },

    herniacao: {
      id: "herniacao",
      type: "decision",
      title: "Sinais de herniação / hipertensão intracraniana?",
      question: "Há anisocoria, midríase fixa, postura de descerebração/decorticação, tríade de Cushing ou queda ≥ 2 pontos no Glasgow?",
      evidence: [
        "Tríade de Cushing: hipertensão + bradicardia + respiração irregular (sinal tardio).",
        "Herniação é emergência — tratar imediatamente enquanto aciona a neurocirurgia.",
      ],
      options: [
        { id: "sim", label: "Sim — sinais de herniação", next: "conduta_hic" },
        { id: "nao", label: "Não", next: "uti" },
      ],
    },

    conduta_hic: {
      id: "conduta_hic",
      type: "action",
      title: "Herniação — medidas imediatas",
      summary: "Ponte até a descompressão cirúrgica. Acionar neurocirurgia AGORA.",
      actions: [
        "Cabeceira 30°, cabeça neutra, aliviar qualquer compressão jugular; garantir sedação/analgesia.",
        "Terapia hiperosmolar — Salina hipertônica 3%: {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min (preferida se hipotenso/hipovolêmico).",
        "OU Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min — cuidado: diurese osmótica e hipotensão; manter volemia.",
        "Hiperventilação APENAS como ponte curta: PaCO₂ 30–35 mmHg por poucos minutos até a descompressão (vasoconstrição reduz fluxo cerebral — nunca prolongar).",
        "Acionar neurocirurgia imediatamente (drenagem/craniectomia descompressiva).",
        "Tratar febre, convulsão e agitação — todos aumentam a PIC.",
        "Manter PPC 60–70 mmHg com vasopressor se necessário.",
      ],
      next: "uti",
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "UTI neurológica",
      summary: "Monitorização contínua e prevenção da lesão secundária.",
      disposition: "icu",
      exitCriteria: [
        "Metas mantidas: PIC < 22 mmHg, PPC 60–70 mmHg, PaCO₂ 35–45, SpO₂ ≥ 90%, PAS ≥ 110, normotermia e normoglicemia.",
        "TC de controle em 6–12 h ou a qualquer deterioração; exame neurológico seriado.",
        "Profilaxia de TVP (mecânica imediata; farmacológica após 24–48 h com sangramento estável, em conjunto com a neurocirurgia).",
        "Nutrição enteral precoce; profilaxia de úlcera de estresse; controle rigoroso de febre.",
        "Evitar hipo-osmolaridade; sódio sérico normal-alto conforme protocolo.",
      ],
      targets: [
        { moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Controle de PaCO₂ e oxigenação" },
        { moduleId: "sedoanalgesia", label: "Sedoanalgesia & BNM", reason: "Sedação para controle da PIC" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Manter PPC 60–70 mmHg" },
      ],
    },
  },
};
