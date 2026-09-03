import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import { PAS_TCE_META, PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA } from "./lib/pas-no-tce";
import {
  TCE_PENETRANTE_CONTINUA_ACIONANDO,
  TCE_PENETRANTE_FRONTEIRA,
} from "./lib/escopo-tce-penetrante";
import {
  TCE_HIPERVENTILACAO,
  TCE_HIPERVENTILACAO_PROIBIDA,
  TCE_HIPERVENTILACAO_TERCEIRA_LINHA,
  TCE_METAS_NEUROPROTECAO,
  TCE_METAS_UTI,
  TCE_MONITORIZACAO_PIC,
  TCE_NORMOCAPNIA,
  TCE_PPC_COM_VASOPRESSOR,
  TCE_VENTILACAO,
} from "./lib/alvos-tce";

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
        PAS_TCE_META,
        "Hipotensão é proibida no TCE.",
        "Glicemia capilar — hipoglicemia simula e agrava lesão neurológica.",
        "Imobilização cervical até excluir lesão de coluna.",
        // ── PD-4 · ESCOPO DO TCE PENETRANTE ─────────────────────────────
        // Entra na ESTABILIZAÇÃO porque o gatilho aparece na porta, e não
        // depois da tomografia. Fronteira, não muro: o que este módulo tem
        // continua valendo, e a ressalva diz exatamente o que não cobre.
        TCE_PENETRANTE_FRONTEIRA,
        TCE_NORMOCAPNIA,
      ],
      next: "glasgow",
    },

    glasgow: {
      id: "glasgow",
      type: "decision",
      title: "Classificar pela escala de Glasgow",
      question: "Qual o Glasgow após a estabilização inicial?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 5 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 5, tirar um não abre
      // nada — abaixaria para 4 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ TCE CLASSIFICADO COMO LEVE PODE VIRAR EMERGÊNCIA NEUROCIRÚRGICA — o hematoma extradural em expansão é o exemplo clássico. O que muda a conduta não é o Glasgow de agora, é a AVALIAÇÃO SERIADA: a queda ao longo das horas vale mais que o número desta medida.",
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
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 5 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 5, tirar um não abre
      // nada — abaixaria para 4 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ NÃO transformar a Canadian CT Head Rule em regra universal. Déficit focal, convulsão pós-trauma, suspeita de fratura e outros sinais de alto risco indicam TC. Em anticoagulante ou antiagregante (EXCETO aspirina em monoterapia), considerar TC mesmo sem outro critério; intoxicação isolada torna o exame menos confiável e exige julgamento/observação, mas não é indicação automática de TC por si só.",
      evidence: [
        "Canadian CT Head Rule (alto risco): Glasgow < 15 após 2 h; suspeita de fratura aberta/afundamento; sinais de fratura de base de crânio (equimose periorbitária/retroauricular, otorragia, fístula liquórica); ≥ 2 episódios de vômito; idade ≥ 65 anos.",
        "Risco médio: amnésia retrógrada > 30 min; mecanismo perigoso (atropelamento, ejeção, queda > 1 m ou 5 degraus).",
        "Fora da Canadian CT Head Rule: déficit focal, convulsão pós-trauma e sinais de fratura/lesão grave têm indicação própria de TC. Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), o NICE recomenda CONSIDERAR TC mesmo sem outra indicação; coagulopatia aumenta o risco. Intoxicação isolada reduz a confiabilidade do exame e exige julgamento clínico/observação, não TC automática apenas por esse motivo.",
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
        "Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), considerar TC mesmo sem outro critério conforme risco e possibilidade de seguimento. Após TC normal, não impor observação prolongada apenas pelo fármaco: decidir pela evolução clínica, confiabilidade do exame, supervisão disponível e capacidade de retorno.",
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
        "Repetir TC IMEDIATAMENTE se houver deterioração neurológica. Em paciente estável com lesão já conhecida, individualizar TC seriada conforme tipo/tamanho da lesão, gravidade do TCE, exame neurológico, anticoagulação/coagulopatia, intervenção planejada e protocolo neurocirúrgico — não impor janela fixa de 6–12 h a todos.",
        // ── D-18, FECHADA SEM AFROUXAR NADA ──────────────────────────────
        // A dívida pedia abrir as fontes antes de propor mexer na TC de
        // rotina. Abertas (2026-08-16), elas confirmam a ressalva que a
        // própria dívida registrava: a evidência é de TCE LEVE, de centro
        // único, e a do anticoagulado é RETROSPECTIVA com 144 pacientes.
        // Nada aqui muda conduta — o que muda é o médico ter os números e a
        // população para decidir, que é o que ele não tinha.
        "SOBRE A TC DE ROTINA — O QUE A EVIDÊNCIA DIZ, E DE QUEM ELA FALA: o gatilho que manda é o CLÍNICO. Em TCE LEVE estável, o rendimento da repetição de rotina é baixo — num estudo prospectivo de centro único com 231 casos, a repetição programada levou à cirurgia em 3,5%, e nenhum paciente de alta com Glasgow > 13 sem repetir deteriorou; num retrospectivo de 144 pacientes anticoagulados ou antiagregados com TCE leve e TC inicial NORMAL, houve 0,7% de hemorragia tardia, sem necessidade de intervenção. ⚠️ ESTES NÚMEROS NÃO VALEM PARA O TCE MODERADO OU GRAVE, nem para quem já tem sangramento na primeira TC — não há evidência de mesmo porte ali, e a assimetria de dano continua mandando: TC a mais custa radiação e tempo; hematoma tardio não visto custa o paciente.",
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
        // ── ⚠️ A FRONTEIRA FICA AQUI, E A TRAVA ME PROVOU ISSO ─────────────
        //
        // Eu tirei `TCE_PENETRANTE_FRONTEIRA` deste nó por medição: 1.825 ch
        // repetidos de `estabilizacao`, 60% do nó. `test:tce` reprovou, e com
        // razão dupla:
        //
        //   1. a fronteira está nas DUAS superfícies DE PROPÓSITO — o gatilho
        //      aparece na porta, não depois da tomografia (PD-4);
        //   2. este nó MENCIONA "ferimento penetrante craniano" na linha do
        //      laudo. Menção solta, num app em que tudo o mais tem conduta,
        //      SUGERE que o assunto está tratado — foi exatamente assim que o
        //      defeito da PD-4 nasceu. Ou a menção vem com a fronteira, ou não vem.
        //
        // Segunda vez neste bloco em que repetição medida era decisão protegida.
        // O que saiu daqui foi só `PAS_TCE_META`, que não é escopo do penetrante
        // e vive em `estabilizacao`.
        TCE_PENETRANTE_FRONTEIRA,
        TCE_PENETRANTE_CONTINUA_ACIONANDO,
        "Manter as metas da estabilização: PAS por faixa etária, SpO₂ ≥ 90%, normocapnia e cabeceira a 30°.",
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
        TCE_METAS_NEUROPROTECAO,
        // ── Conduta ventilatória ─────────────────────────────────────────
        // O módulo trazia PaCO₂ e mais nada: nem Vt, nem PEEP, nem o que
        // fazer na herniação, nem por que não hiperventilar "por precaução".
        // Números em lib/alvos-tce.ts — os mesmos que o motor de VM calcula.
        TCE_VENTILACAO,
        "PEEP alta pode elevar a PIC por queda do retorno venoso — mas HIPÓXIA É PIOR QUE PEEP: não se aceita SpO₂ baixa para poupar PIC.",
        TCE_HIPERVENTILACAO,
        TCE_HIPERVENTILACAO_PROIBIDA,
        PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA,
        TCE_MONITORIZACAO_PIC,
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
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ NÃO ESPERE A TRÍADE DE CUSHING: hipertensão, bradicardia e respiração irregular juntas são incomuns e costumam ser tardias. Um sinal isolado desta lista já responde SIM.",
      evidence: [
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
        // ── A ORDEM É A CONDUTA ──────────────────────────────────────────
        // Este bloco dizia "ANTES de escalar terapia" e aparecia em DÉCIMO,
        // depois de o app já ter prescrito osmoterapia, hiperventilação e
        // neurocirurgia. A frase sabia o lugar dela; a tela não obedecia.
        // Febre, assincronia, crise, colar apertado e bexigoma resolvem muita
        // PIC sem osmoterapia — e custam segundos para checar.
        "⚠️ ANTES de escalar terapia: checar as causas EXTRACRANIANAS de PIC alta — febre, assincronia ventilatória, crise convulsiva, hipotensão, pneumotórax, compressão cervical (colar ou fixação do tubo apertados), hipertensão intra-abdominal, dor e bexigoma. Corrigir isso resolve muita PIC sem osmoterapia.",
        "Tratar febre, convulsão e agitação — todos aumentam a PIC.",
        "Terapia hiperosmolar — no TCE com PIC elevada/edema cerebral, a Neurocritical Care Society sugere solução hipertônica sobre manitol como manejo inicial quando não houver contraindicação. Regime do protocolo institucional citado: NaCl 3% {salina3Min}–{salina3Max} mL (2,5–5 mL/kg) em 10–20 min. Concentração e dose variam entre protocolos: titular à resposta clínica/PIC e monitorar sódio, cloro e função renal. NaCl 20% 40 mL IV em 5 min é outro regime institucional; repetir apenas conforme resposta e protocolo neurocrítico, não por intervalo universal fixo.",
        "Manitol 20%: {manitolMin}–{manitolMax} g (0,25–1 g/kg) em 15–20 min permanece alternativa eficaz quando solução hipertônica não é apropriada ou não está disponível. Repetição deve ser guiada pela resposta/PIC e segurança, não por relógio fixo; vigiar volemia, pressão arterial e função renal por diurese osmótica e risco de hipotensão/lesão renal.",
        "Durante manitol, monitorar função renal, volemia e carga osmótica. A NCS sugere usar o GAP OSMOLAR em vez de um limiar isolado de osmolaridade para acompanhar risco de acúmulo/lesão renal, mas NÃO há evidência suficiente para um cutoff obrigatório; 20 mOsm/kg é usado em alguns protocolos, porém não é um limite validado. Gap = osmolaridade medida − calculada; ao calcular com ureia total em mg/dL, usar a fórmula compatível com o laboratório local e não confundir ureia com BUN.",
        TCE_HIPERVENTILACAO,
        TCE_HIPERVENTILACAO_PROIBIDA,
        "Com derivação ventricular externa já instalada: drenar 5–10 mL de líquor e observar se a PIC cai abaixo de 22 mmHg.",
        "Guiar a hiperventilação por capnografia contínua, e reverter assim que a descompressão ou a osmoterapia entrarem.",
        "Acionar neurocirurgia imediatamente (drenagem/craniectomia descompressiva).",
        TCE_PPC_COM_VASOPRESSOR,
        // ── AS ETAPAS 2 E 3 VIVIAM NA SUPERFÍCIE DE CONSULTA ──────────────
        // Estavam nos exitCriteria do nó `uti`, entre profilaxia de TVP e
        // nutrição enteral. Quem está com o paciente herniando não as via;
        // quem as via já estava na lista de rotina da UTI. R-48: escalada é
        // AÇÃO, e o lugar dela é o passo em que se decide escalar.
        "HIC REFRATÁRIA às medidas acima — 2ª ETAPA: aprofundar sedação e analgesia, repetir/ajustar terapia hiperosmolar guiada pela PIC e pela resposta clínica e avaliar craniectomia descompressiva com o neurocirurgião. Não perseguir um alvo fixo de natremia apenas para tratar a PIC; evitar hipernatremia/hipercloremia graves e monitorar função renal. ⚠️ Antes de subir de etapa, refazer a checagem das causas extracranianas — a resistência ao tratamento costuma ter causa remediável.",
        "HIC refratária — 3ª ETAPA, medidas de RESGATE de maior risco: após revisar causas reversíveis, terapias dos tiers anteriores e opções neurocirúrgicas, considerar barbitúrico em dose alta para PIC refratária apenas com estabilidade hemodinâmica e monitorização intensiva/EEG contínuo. A BTF recomenda barbitúrico nesse contexto, mas não impõe um agente, esquema de dose ou padrão universal de surto-supressão; seguir protocolo neurocrítico local e titular à PIC/EEG/tolerância hemodinâmica.",
        TCE_HIPERVENTILACAO_TERCEIRA_LINHA,
        "TEMPERATURA: nos tiers 1–2, manter normotermia controlada com temperatura central 36,0–37,5 °C e tratar febre. Se a PIC permanecer refratária apesar dos tiers 1–2, hipotermia terapêutica <36 °C pode ser considerada de forma selecionada pela equipe neurocrítica; se usada, manter o alvo o mais próximo possível da fisiologia. Não impor 32–34 °C como alvo universal nem uma ordem obrigatória entre hipotermia, barbitúrico e craniectomia. Hiperventilação permanece medida de resgate e exige monitorização cerebral quando disponível.",
        "Bloqueio neuromuscular na HIC refratária: fazer um TESTE e só manter em infusão contínua se a PIC responder com queda.",
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
        TCE_METAS_UTI,
        "Exame neurológico seriado; repetir TC IMEDIATAMENTE diante de deterioração. Em paciente estável com lesão conhecida, individualizar imagem de controle conforme padrão da lesão, evolução, coagulação, intervenção planejada e protocolo neurocirúrgico — sem janela fixa universal.",
        "Profilaxia de TVP (mecânica imediata; farmacológica após 24–48 h com sangramento estável, em conjunto com a neurocirurgia).",
        "Nutrição enteral precoce; profilaxia de úlcera de estresse; controle rigoroso de febre.",
        "Evitar hipo-osmolaridade; sódio sérico normal-alto conforme protocolo.",
        "Indicação de PIC invasiva: TCE grave (Glasgow 3–8) com TC alterada; ou TC normal com 2 de 3 — idade acima de 40 anos, PAS abaixo de 90 mmHg, postura anômala ao exame.",
        "Sem monitor de PIC disponível, os métodos não invasivos ajudam a decidir se vale escalar: Doppler transcraniano com índice de pulsatilidade acima de 2,13; bainha do nervo óptico ao ultrassom acima de 6 mm; pupilometria com NPi abaixo de 3. Todos com acurácia menor que a PIC invasiva, que é o padrão-ouro.",
        "HIC REFRATÁRIA: a escalada em etapas está no passo de conduta da herniação — 1ª etapa (medidas gerais, osmoterapia e drenagem quando disponível), 2ª (aprofundar sedação, ajustar osmoterapia pela resposta e reavaliar opção neurocirúrgica) e 3ª (resgates selecionados de maior risco, como barbitúrico, hipotermia terapêutica e hiperventilação monitorizada). Aqui se mantém apenas o que demonstrar benefício sobre a PIC e tolerância clínica, com reavaliação contínua.",
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
