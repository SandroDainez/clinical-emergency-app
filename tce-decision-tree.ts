import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Traumatismo cranioencefálico (TCE).
 * Base: ATLS, Brain Trauma Foundation (4ª ed.) e Canadian CT Head Rule.
 * Eixos: classificação por Glasgow, indicação de TC, prevenção de lesão
 * secundária (hipotensão/hipóxia) e controle da hipertensão intracraniana.
 *
 * Fonte da parte de hipertensão intracraniana: Einstein/SBIBAE — Manejo da
 * Hipertensão Intracraniana em Adultos (CPTW263.2, revisado em 18/07/2024),
 * sobre Brain Trauma Foundation (Neurosurgery 2017;80:6-15) e os consensos de
 * Neurocritical Care (2017;27:S4-S28 e 27(1):82-88).
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
        "TCE classificado como LEVE pode virar emergência neurocirúrgica — hematoma extradural em expansão é o exemplo clássico. A avaliação SERIADA do Glasgow, mostrando piora ao longo do tempo, é o sinal de alerta mais importante.",
        "Considerar concussão e síndrome pós-concussional mesmo em TCE aparentemente leve e com imagem normal; orientar o paciente sobre os sintomas tardios e sobre não se expor a novo trauma (síndrome do segundo impacto).",
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
        "Outros fatores que favorecem a TC: perda de consciência, náusea ou vômito, amnésia lacunar ou anterógrada, cefaleia intensa, e qualquer sinal externo de trauma acima da clavícula.",
        "Conforme o mecanismo, considerar também TC de face, TC de coluna cervical, angio-TC de vasos cervicais (suspeita de dissecção de carótida ou vertebral) e, no politraumatizado grave, TC de corpo inteiro.",
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
        "⚠️ NÃO esperar o laudo da tomografia para acionar a neurocirurgia quando já houver sinal de gravidade: TCE grave, ferimento penetrante craniano, sinal de fratura de base (equimose periorbitária ou retroauricular, fístula liquórica nasal ou auricular), fratura exposta, déficit focal ou rebaixamento de consciência.",
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
          label: "Peso estimado (kg)",
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
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
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
        "Hipertensão intracraniana é PIC acima de 22 mmHg sustentada por mais de 5 minutos. A tríade de Cushing completa (hipertensão, bradicardia e respiração irregular) é incomum e costuma ser tardia — não esperar por ela.",
        "Herniação uncal (transtentorial): rebaixamento agudo da consciência, midríase ipsilateral e hemiparesia contralateral. Outros sítios: subfalcina (giro do cíngulo) e tonsilar (cerebelo).",
        "A herniação é comprovadamente REVERSÍVEL com terapia rápida e adequada — é emergência tratável, não desfecho consumado.",
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
        "Terapia hiperosmolar — Salina hipertônica 3%: {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min (preferida se hipotenso/hipovolêmico). Alternativa: NaCl 20% 40 mL IV em 5 min, repetível a cada 4–6 h, mantendo sódio sérico abaixo de 160 mEq/L.",
        "OU Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min, repetível a cada 4–6 h — cuidado: diurese osmótica e hipotensão; manter volemia.",
        "Monitorar o GAP OSMOLAR durante o manitol: não há benefício adicional com gap acima de 20. Gap = osmolaridade medida − calculada; calculada = 2 × Na + glicemia/18 + ureia/6, com a UREIA em mg/dL como os laboratórios brasileiros reportam. A forma \"ureia/2,8\" do protocolo-fonte pressupõe nitrogênio ureico (BUN); aplicá-la à ureia total superestima o cálculo em cerca de 2 vezes.",
        "Hiperventilação é PONTE, não tratamento: PaCO₂ 30–35 mmHg por menos de 2 h, guiada por capnografia, apenas até as demais medidas entrarem.",
        "Com derivação ventricular externa já instalada: drenar 5–10 mL de líquor e observar se a PIC cai abaixo de 22 mmHg.",
        "Hiperventilação APENAS como ponte curta: PaCO₂ 30–35 mmHg por poucos minutos até a descompressão (vasoconstrição reduz fluxo cerebral — nunca prolongar).",
        "Acionar neurocirurgia imediatamente (drenagem/craniectomia descompressiva).",
        "⚠️ ANTES de escalar terapia: checar as causas EXTRACRANIANAS de PIC alta — febre, assincronia ventilatória, crise convulsiva, hipotensão, pneumotórax, compressão cervical (colar ou fixação do tubo apertados), hipertensão intra-abdominal, dor e bexigoma. Corrigir isso resolve muita PIC sem osmoterapia.",
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
        "Indicação de PIC invasiva: TCE grave (Glasgow 3–8) com TC alterada; ou TC normal com 2 de 3 — idade acima de 40 anos, PAS abaixo de 90 mmHg, postura anômala ao exame.",
        "Sem monitor de PIC disponível, os métodos não invasivos ajudam a decidir se vale escalar: Doppler transcraniano com índice de pulsatilidade acima de 2,13; bainha do nervo óptico ao ultrassom acima de 6 mm; pupilometria com NPi abaixo de 3. Todos com acurácia menor que a PIC invasiva, que é o padrão-ouro.",
        "HIC REFRATÁRIA às medidas iniciais — 2ª etapa: aprofundar sedação e analgesia, terapia hiperosmolar para natremia mais alta, e avaliação de craniectomia descompressiva com o neurocirurgião.",
        "HIC refratária — 3ª etapa: titular sedação até surto-supressão no EEG (surtos de 5–20 s, ou 50% do traçado em supressão); tiopental em bólus de 5–15 mg/kg em 30 min a 2 h, seguido de 1–4 mg/kg/h; hiperventilação moderada com PaCO₂ 25–34 mmHg; hipotermia moderada com temperatura central de 32–34 °C.",
        "⚠️ A hipotermia moderada controla a PIC refratária, mas NÃO se associa a melhor desfecho neurológico — e a hiperventilação moderada aumenta o risco de isquemia cerebral. Ambas pedem monitorização adicional, idealmente oximetria cerebral.",
        "Bloqueio neuromuscular na HIC refratária: fazer um TESTE e só manter em infusão contínua se a PIC responder com queda.",
        "Monitorização multimodal quando disponível: saturação venosa jugular acima de 55%, oximetria tissular cerebral acima de 20 mmHg, Doppler transcraniano para autorregulação e vasoespasmo.",
        "EEG contínuo é mais sensível que o intermitente para crise não convulsiva, que causa lesão secundária e eleva a PIC. Cerca de metade das crises aparece na primeira hora, mas o paciente em coma pode exigir 48 h de monitorização.",
      ],
      targets: [
        { moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Controle de PaCO₂ e oxigenação" },
        { moduleId: "sedoanalgesia", label: "Sedoanalgesia & BNM", reason: "Sedação para controle da PIC" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Manter PPC 60–70 mmHg" },
      ],
    },
  },
};
