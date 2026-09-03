import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import { predictedBodyWeight } from "./ventilation-decision-tree";
import { NITRATO_CONTRAINDICACAO_PDE5, NITRATO_OUTRAS_CONTRAINDICACOES, NITRATO_PDE5_USO_CRONICO } from "./lib/nitrato-contraindicacoes";
import { VNI_CONTRAINDICACOES, VNI_HIPOTENSAO, VNI_PACIENTE_IDEAL } from "./lib/vni-contraindicacoes";
import { MORFINA_CONTRAINDICACOES, MORFINA_TETO } from "./lib/morfina-dispneia";

import { DOBUTAMINA_ATE_20, DOBUTAMINA_FAIXA_USUAL, DOBUTAMINA_INICIO } from "./lib/dobutamina";
import {
  EAP_AINDA_NAO_SEI,
  EAP_ANTES_DE_VASODILATAR_RESUMO,
  EAP_MISTO,
  EAP_PARA_ONDE_ERRAR,
  EAP_QUENTE_VERSUS_FRIO,
  EAP_SE_ERROU_O_PERFIL,
} from "./lib/perfil-hemodinamico-eap";
import {
  NA_DUVIDA_EAP_RESPOSTA,
} from "./lib/na-duvida";
/**
 * Fluxo interativo do Edema Agudo de Pulmão (EAP).
 * Baseado em: ESC HF Guidelines 2021 · AHA/ACC 2022 · ARDS Network · Berlin 2012 · UpToDate 2024.
 *
 * Decisão-mestra (protocolo): identificar RAPIDAMENTE se cardiogênico ou
 * não-cardiogênico (SARA/ARDS) — o tratamento é fundamentalmente diferente.
 *
 *   reconhecimento → tipo (cardiogênico × SARA)
 *   ├── CARDIOGÊNICO: posição + O₂/VNI → classificação pela PAS → tratamento por perfil
 *   │                 → causa (SCA/arritmia) → reavaliação (loop) → destino
 *   └── SARA: critérios de Berlim → ventilação protetora ARDSNet → manobras de resgate
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * NÃO substitui o julgamento clínico nem o protocolo institucional.
 */

export const eapDecisionTree: DecisionTreeDefinition = {
  id: "eap_2024",
  version: "2024.1",
  label: "Edema Agudo de Pulmão",
  entryNodeId: "entry",

  derive: (values: TreeValues): Record<string, string> => {
    const out: Record<string, string> = {};
    // Peso predito (ARDSNet) e faixa de volume corrente protetor para SARA.
    // Este bloco tinha a TERCEIRA cópia da fórmula de peso predito do app, e a
    // pior das três: usava `"m"` para MULHER, enquanto o motor de ventilação
    // lia `/^m/i` como MASCULINO. Como o campo `sexo` viaja no contexto do
    // paciente entre os módulos, uma mulher registrada aqui virava homem lá.
    // Agora delega para a fonte única, e os presets abaixo usam palavras.
    const altura = Number(values.altura);
    const pp = Number.isFinite(altura) ? predictedBodyWeight(altura, values.sexo) : null;
    if (pp != null && pp > 0) {
      out.pp = pp.toFixed(0);
      out.vc_min = (pp * 4).toFixed(0);
      out.vc_max = (pp * 6).toFixed(0);
    }
    out.pf_txt = values.pf && values.pf !== "" ? values.pf : "não informada";
    return out;
  },

  nodes: {
    // ── 1. Reconhecimento e medidas imediatas ─────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "EAP — reconhecimento e medidas imediatas",
      summary: "Emergência com risco imediato de morte por hipóxia. Agir ANTES da confirmação laboratorial/imagiológica.",
      actions: [
        "Sentar o paciente (posição ereta, pernas pendentes) — reduz pré-carga e trabalho respiratório.",
        "Monitorização contínua: ECG, PA, SpO₂, FR. Dois acessos venosos. Glicemia capilar.",
        "O₂ para SpO₂ alvo ≥ 94% (DPOC 88–92%); preparar VNI precocemente.",
        "Anamnese/exame dirigidos: início (súbito × progressivo), febre, dor torácica, fator precipitante.",
      ],
      next: "tipo",
    },

    // ── 2. DECISÃO-MESTRA: cardiogênico × não-cardiogênico ────────────────────
    tipo: {
      id: "tipo",
      type: "decision",
      title: "Cardiogênico ou não-cardiogênico (SARA)?",
      summary: "O tratamento é FUNDAMENTALMENTE diferente — definir o mecanismo é a primeira decisão.",
      question: "Qual o mecanismo mais provável do edema pulmonar?",
      evidence: [
        "CARDIOGÊNICO (↑ pressão hidrostática, PCP > 18): dispneia abrupta/ortopneia/DPN, secreção espumosa rosada, crepitantes de base→ápice, BNP muito elevado (> 400), cardiomegalia + linhas B Kerley no RX, FE reduzida/disfunção diastólica. Causas: ICC descompensada, IAM, crise hipertensiva, valvopatia aguda, taquiarritmia, sobrecarga de volume.",
        "NÃO-CARDIOGÊNICO / SARA (↑ permeabilidade capilar, PCP ≤ 18): dispneia progressiva (horas–dias), infiltrado bilateral difuso SEM cardiomegalia, BNP normal/pouco elevado, FE normal/VE não dilatado. Causas: pneumonia, sepse, aspiração, trauma, pancreatite, TRALI, inalação.",
        "MISTO (sepse em cardiopata, pós-op cardíaco): tratar componente dominante; reavaliar com POCUS/ecocardiograma.",
        "Na dúvida: BNP/NT-proBNP + ecocardiograma/POCUS à beira leito orientam.",
      ],
      options: [
        { id: "cardiogenico", label: "Cardiogênico (EAP-C) — congestão por falência de VE", next: "card_dados" },
        { id: "sara", label: "Não-cardiogênico (SARA/ARDS) — lesão inflamatória", next: "sara_berlim" },
        // ⚠️ O MISTO ESTAVA DESCRITO NA EVIDÊNCIA DESTE NÓ E NÃO TINHA BOTÃO.
        // Terceiro módulo em que isso acontece (CAD/EHH, Choque, EAP), e no
        // balanço está registrado como achado de DESENHO: o app sabia da
        // existência do estado misto e não oferecia o caminho.
        { id: "misto", label: "MISTO — os dois mecanismos (sepse em cardiopata, pós-op, pneumonia em ICC)", next: "eap_misto" },
        // R-48 refinado: a diferenciação se faz com POCUS e BNP, que ainda não
        // voltaram. Obrigar a escolher na primeira tela é pedir um chute com
        // consequência — e o que se faz sem saber é quase tudo.
        { id: "nao_sei", label: "AINDA NÃO SEI — POCUS/BNP pendentes", next: "eap_indefinido" },
      ],
    },

    eap_misto: {
      id: "eap_misto",
      type: "action",
      title: "Edema misto — cardiogênico + lesão pulmonar",
      summary: "Tratar o dominante NÃO é escolher um. Os dois erros são de omissão.",
      actions: [
        EAP_MISTO,
        "SUPORTE, comum aos dois: sentado, O₂, VNI com as contraindicações conferidas, monitor e acessos.",
        "POCUS à beira do leito define a PROPORÇÃO — função de VE, linhas B, VCI — e é o que orienta quanto de cada tratamento.",
        "⚠️ Se houver sepse: antibiótico precoce e controle de foco NÃO esperam o ecocardiograma (ver módulo Sepse).",
      ],
      next: "card_dados",
    },

    eap_indefinido: {
      id: "eap_indefinido",
      type: "action",
      title: "Ainda não sei o mecanismo — e dá para começar",
      summary: "O que muda desfecho na primeira meia hora é comum aos dois. O que espera o mecanismo é o que pode piorar quem está do outro lado.",
      actions: [
        EAP_AINDA_NAO_SEI,
        "⚠️ E se houver hipotensão com hipoperfusão em qualquer um dos cenários, o caminho é o do choque cardiogênico — vasodilatador e diurético saem da mesa.",
      ],
      next: "tipo",
    },

    // ═════════════════════════════════════════════════════════════════════════
    // RAMO A — EAP CARDIOGÊNICO
    // ═════════════════════════════════════════════════════════════════════════

    card_dados: {
      id: "card_dados",
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
          presets: ["80", "90", "100", "110", "130", "150", "180", "210"].map((v) => ({ value: v, label: v })),
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
      next: "card_suporte",
    },

    card_suporte: {
      id: "card_suporte",
      type: "action",
      title: "Suporte ventilatório — VNI é PRIMEIRA LINHA",
      summary: "VNI reduz intubação e mortalidade no EAP cardiogênico (evidência nível I — 3CPO trial).",
      actions: [
        "POSIÇÃO — SENTADO com as pernas pendentes (cabeceira 60–90°, não 30°): reduz o retorno venoso e redistribui o edema, e é a única medida que alivia em segundos, antes de qualquer droga. Deitar o paciente com EAP piora a mecânica na hora.",
        "⚠️ SE HOUVER REBAIXAMENTO OU IOT, a posição vira 30–45° com proteção de via aérea — sentado sem controle da via aérea é risco de aspiração.",
        "O₂ para SpO₂ ≥ 94% (DPOC 88–92%).",
        "SpO₂ < 94% apesar de O₂ → iniciar VNI IMEDIATAMENTE.",
        // ⚠️ AS CONTRAINDICAÇÕES VÊM AQUI, E A ORDEM É O MOTIVO.
        // Este nó indica VNI ANTES de card_classificacao, que é onde a PA é
        // avaliada — então a hipotensão apareceria DEPOIS de a máscara estar
        // no rosto. Contraindicação não é delegável (R-33): quem prescreve,
        // avisa, e no ponto em que prescreve.
        VNI_CONTRAINDICACOES,
        VNI_HIPOTENSAO,
        VNI_PACIENTE_IDEAL,
        "CPAP: PEEP 5–10 cmH₂O + FiO₂ ajustada (0,4–1,0) — evidência mais forte no EAP-C; tão eficaz quanto BiPAP.",
        "BiPAP: IPAP 10–15 cmH₂O / EPAP 5–8 cmH₂O + FR backup 10–14 rpm — preferir se hipercapnia (PaCO₂ > 45) ou trabalho respiratório aumentado.",
        "Interface: máscara facial total.",
        "Critérios de IOT (falha de VNI): SpO₂ < 90% com FiO₂ ≥ 0,6 após 1 h; pH < 7,20 ou PaCO₂ em elevação; FR > 35 com musculatura acessória/paradoxo abdominal; Glasgow < 8 ou agitação; PAS < 90 refratária; intolerância à interface.",
      ],
      next: "card_classificacao",
    },

    card_classificacao: {
      id: "card_classificacao",
      type: "decision",
      title: "Classificação pela PA sistólica",
      question: "Qual a faixa da PA sistólica?",
      // ⚠️ A FRASE QUE ESTA AUDITORIA ESCREVEU, E QUE FICOU RECOLHIDA.
      //
      // Corrigimos este nó por classificar só pela PAS em vez da perfusão, e a
      // frase que ensina a decidir foi para `evidence` — atrás do "Ver
      // critérios". A correção existiu, foi verificada por trava, e não chegava
      // a quem decide. Terceira forma do mesmo problema nesta fase: certo na
      // superfície errada (R-48), certo e truncado (R-50), certo e recolhido.
      summary: EAP_ANTES_DE_VASODILATAR_RESUMO,
      evidence: [
        "PAS > 180 (crise hipertensiva / 'flash'): predomínio de redistribuição de líquido — vasodilatador é a base; nitroprussiato preferível.",
        "PAS 110–180: vasodilatador IV (nitroglicerina) + diurético conforme congestão.",
        "PAS 90–110: diurético é a base; vasodilatador com MUITA cautela e monitorização estreita.",
        "PAS < 90 + hipoperfusão (choque cardiogênico): NÃO usar vasodilatador/diurético agressivo — inotrópico + vasopressor.",
        // ⚠️ PAS NÃO É PERFUSÃO. As quatro saídas deste nó são todas por PA,
        // e o frio-úmido COM PAS NORMAL cai em "110–180 → vasodilatador",
        // que é a conduta do quente. O par entra aqui, antes da escolha.
        EAP_QUENTE_VERSUS_FRIO,
        EAP_PARA_ONDE_ERRAR,
      ],
      options: [
        { id: "crise_hipertensiva", label: "PAS > 180 (crise hipertensiva / flash)", next: "card_crise_hipertensiva" },
        { id: "hipertensivo", label: "PAS 110–180 (vasodilatador + diurético)", next: "card_vasodilatador" },
        { id: "limítrofe", label: "PAS 90–110 (diurético, vasodilatador cauteloso)", next: "card_limitrofe" },
        { id: "choque", label: "PAS < 90 / hipoperfusão (choque cardiogênico)", next: "card_choque" },
      ],
    },

    card_crise_hipertensiva: {
      id: "card_crise_hipertensiva",
      type: "action",
      title: "EAP hipertensivo (PAS > 180) — vasodilatar é a base",
      summary: "Reduzir a pós-carga de forma controlada é o tratamento principal; diurético é adjuvante.",
      actions: [
        "NITROPRUSSIATO DE SÓDIO IV: 0,3 mcg/kg/min → titular até 5 mcg/kg/min. Preferível na crise hipertensiva grave. Monitorar PA invasiva; máx 72 h (toxicidade por tiocianato); proteger da luz.",
        "ALTERNATIVA — NITROGLICERINA IV: 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min). Preferir em isquemia miocárdica concomitante.",
        "FUROSEMIDA IV: 20–80 mg em bolus se sobrecarga (dose ≥ dose oral diária habitual do paciente).",
        "Reduzir a PA de forma controlada (não < 90 mmHg); manter VNI conforme necessidade.",
        "⛔ Não usar morfina/opioides de rotina no EAP/insuficiência cardíaca aguda (ESC 2021, Classe III); uso excepcional apenas para dor ou ansiedade graves/intratáveis quando outras medidas falharam.",
      ],
      next: "card_causa",
    },

    card_vasodilatador: {
      id: "card_vasodilatador",
      type: "action",
      title: "EAP normotenso-alto (PAS 110–180) — vasodilatador + diurético",
      summary: "Tríade: VNI + diurético IV + vasodilatador IV.",
      actions: [
        // E4 — a SUBLINGUAL vem antes da IV no texto porque vem antes no
        // tempo: é o que se dá enquanto o acesso e a bomba são preparados. E
        // as contraindicações vêm coladas nela por isso mesmo — sublingual é a
        // via que se administra rápido, antes de perguntar qualquer coisa.
        "NITROGLICERINA SUBLINGUAL — a ponte, enquanto o acesso IV e a bomba são preparados: 0,4 mg SL, repetível a cada 5 min até 3 doses, se PAS > 110. Não substitui a titulação IV; adianta o alívio em minutos.",
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
        NITRATO_OUTRAS_CONTRAINDICACOES,
        "NITROGLICERINA IV: iniciar 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min). Primeira escolha em isquemia.",
        // E5 — PONTEIRO, não cópia: o preparo já existe em Vasoativas, com as
        // duas diluições padrão e a ampola nacional declarada (R-12).
        "PREPARO E DILUIÇÃO: as soluções padrão (200 mcg/mL e 100 mcg/mL, a partir da ampola nacional) estão no módulo de Drogas Vasoativas — usar de lá, para não nascer uma segunda tabela de diluição no app.",
        "FUROSEMIDA IV: 20–80 mg em bolus (dose ≥ dose oral diária habitual). Sem uso prévio de diurético: 20–40 mg. Alvo de diurese: 100–200 mL/h nas primeiras horas.",
        "QUEM JÁ USA FUROSEMIDA EM CASA (e sobretudo o DOENTE RENAL CRÔNICO): a dose de ataque é 2,5× a dose oral diária habitual, por via IV — não uma faixa fixa. Na DRC, menos fármaco alcança o túbulo, e a dose que funcionava ontem no ambulatório é insuficiente hoje. O DOSE trial mostrou mais diurese e mais alívio de dispneia com a dose alta, com alteração de creatinina apenas transitória.",
        "Sem resposta diurética em 1 h: dobrar a dose ou infusão contínua 5–10 mg/h.",
        "Monitorar PA de perto — suspender vasodilatador se tendência à hipotensão (PAS < 90).",
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
        NITRATO_OUTRAS_CONTRAINDICACOES,
        "⛔ Morfina/opioides NÃO devem ser usados de rotina no EAP/insuficiência cardíaca aguda (ESC 2021, Classe III); reservar apenas para dor ou ansiedade graves/intratáveis que não possam ser controladas de outra forma.",
        MORFINA_TETO,
        MORFINA_CONTRAINDICACOES,
        // O sinal de reversibilidade no nó em que o erro de perfil acontece —
        // mesma forma do Choque: a ressalva vai onde a pessoa JÁ ERROU, e não
        // como aviso genérico antes da escolha.
        EAP_SE_ERROU_O_PERFIL,
      ],
      next: "card_causa",
    },

    card_limitrofe: {
      id: "card_limitrofe",
      type: "action",
      title: "EAP limítrofe (PAS 90–110) — diurético, vasodilatador cauteloso",
      summary: "Margem estreita para vasodilatar — priorizar diurético e vigiar a perfusão.",
      actions: [
        "FUROSEMIDA IV: 20–40 mg em bolus (ajustar se uso prévio de diurético).",
        "NITROGLICERINA IV em dose baixa (10 mcg/min) APENAS se sintomas/congestão persistirem e PA permitir — titular muito cautelosamente.",
        "Monitorização estreita: suspender vasodilatador a qualquer tendência de hipotensão.",
        "Se evoluir para hipoperfusão (lactato ↑, oligúria, pele marmórea) → tratar como choque cardiogênico.",
        "Evitar morfina de rotina; manter VNI conforme necessidade.",
      ],
      next: "card_causa",
    },

    card_choque: {
      id: "card_choque",
      type: "action",
      title: "Choque cardiogênico (PAS < 90 + hipoperfusão)",
      summary: "Mortalidade 30–50%. EVITAR diurético/vasodilatador. Prioridade: inotrópico + vasopressor + causa reversível + suporte mecânico.",
      actions: [
        "NÃO usar vasodilatador. Diurético só com MUITA cautela após estabilizar a perfusão.",
        "INOTRÓPICO 1ª linha — DOBUTAMINA IV (aumenta DC, reduz PCWP).",
        "PREPARO: usar as soluções padrão do módulo Drogas Vasoativas — 2000 mcg/mL (1 ampola de 250 mg + 105 mL → 125 mL) ou 4000 mcg/mL (2 ampolas + 85 mL → 125 mL). ⚠️ O preparo de 250 mg em 250 mL, que este passo trazia, dá 1000 mcg/mL — uma TERCEIRA concentração que não existe na tabela do módulo dono, e programar a bomba pela tabela errada erra por fator 2 ou 4 num inotrópico.",
        DOBUTAMINA_INICIO,
        DOBUTAMINA_FAIXA_USUAL,
        DOBUTAMINA_ATE_20,
        "VASOPRESSOR de escolha — NOREPINEFRINA 0,1–1 mcg/kg/min IV (superior à dopamina — SOAP II). Alvo PAM ≥ 65 mmHg. Preparo: solução de 16 mcg/mL do módulo Drogas Vasoativas.",
        "ACESSO CENTRAL é preferencial para a noradrenalina — o extravasamento em veia periférica causa necrose tecidual. Mas NÃO ATRASAR o início por causa do acesso: começar em periférica calibrosa, com vigilância do sítio, e trocar assim que possível.",
        "Alternativas: dopamina 5–20 mcg/kg/min (mais arritmogênica) se norepi indisponível; levosimendan 0,05–0,2 mcg/kg/min (sem bolus se PAS < 90) ou milrinona 0,375–0,75 mcg/kg/min em betabloqueados.",
        "Ecocardiograma/POCUS urgente; cateter de artéria pulmonar (PCWP > 18 + IC < 2,2 confirma).",
        "SUPORTE CIRCULATÓRIO MECÂNICO (BIA, Impella, ECMO-VA): considerar precocemente se PAS < 90 após 30 min de vasopressor. Acionar hemodinâmica/UTI cardiovascular.",
      ],
      next: "card_causa",
    },

    // ── Causa precipitante ─────────────────────────────────────────────────────
    card_causa: {
      id: "card_causa",
      type: "decision",
      title: "Causa precipitante",
      question: "Há SCA (supra de ST/isquemia) ou taquiarritmia como causa?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⚠️ NÃO RETARDE A REPERFUSÃO POR CAUSA DO EAP. Se há IAM com supra, ou sem supra de alto risco, a cinecoronariografia é de urgência — tratar o edema não substitui abrir a artéria, e o EAP costuma ser consequência dela fechada.",
      evidence: [
        "EAP pode ser desencadeado por SCA, crise hipertensiva, taquiarritmia (FA de alta resposta, flutter), valvopatia aguda ou má adesão.",
        "Taquiarritmia: cardioversão elétrica sincronizada se instável; amiodarona se FA estável (regime LENTO é o padrão no EAP — reduz risco de hipotensão numa população já hemodinamicamente frágil); digoxina 0,5 mg IV em FA com disfunção sistólica severa.",
      ],
      options: [
        { id: "sca", label: "SCA / isquemia", next: "card_causa_sca" },
        { id: "arritmia", label: "Taquiarritmia causadora (FA/flutter)", next: "card_causa_arritmia" },
        { id: "outra", label: "Outra causa / não aplicável", next: "card_reaval" },
      ],
    },

    card_causa_sca: {
      id: "card_causa_sca",
      type: "action",
      title: "EAP por SCA — tratar a síndrome coronariana",
      summary: "EAP + SCA é alto risco. A reperfusão pode ser o tratamento da congestão.",
      actions: [
        "Acionar cardiologia/hemodinâmica. IAMCSST → reperfusão imediata (ver módulo Síndromes Coronarianas).",
        "Iniciar terapia antitrombótica conforme protocolo de SCA (AAS + 2º antiplaquetário + anticoagulação).",
        "ECG seriado + troponina ultrassensível (repetir 1–3 h).",
        "Manter suporte ventilatório e controle hemodinâmico em paralelo — não retardar a reperfusão.",
      ],
      next: "card_reaval",
    },

    card_causa_arritmia: {
      id: "card_causa_arritmia",
      type: "action",
      title: "EAP por taquiarritmia — controle do ritmo/frequência",
      summary: "Restaurar ritmo/frequência pode resolver a congestão.",
      actions: [
        "INSTABILIDADE hemodinâmica → cardioversão elétrica sincronizada de urgência.",
        // DOIS REGIMES DE AMIODARONA, NÃO UM — a divergência entre o padrão
        // ACLS (10 min) e o protocolo brasileiro de FA/cardiopata (30–60 min)
        // não era erro: são indicações diferentes. O EAP é justamente a
        // população em risco de hipotensão, então aqui o LENTO é o padrão — o
        // rápido fica para a exceção (instabilidade ELÉTRICA que exige
        // controle imediato, não a instabilidade hemodinâmica geral, que já
        // vai para cardioversão acima).
        "FA ESTÁVEL, PADRÃO NESTE MÓDULO → amiodarona LENTA: 300 mg (5–7 mg/kg) IV em 30–60 min — a infusão lenta reduz o risco de hipotensão, e o EAP já é população hemodinamicamente frágil.",
        "Exceção — instabilidade ELÉTRICA exigindo controle imediato do ritmo (não confundir com a instabilidade hemodinâmica geral, que vai para cardioversão) → amiodarona RÁPIDA: 150 mg IV em 10 min → 1 mg/min × 6 h → 0,5 mg/min × 18 h (padrão ACLS).",
        "FA com disfunção sistólica severa → digoxina 0,5 mg IV em 10–20 min → 0,25 mg IV a cada 6 h (máx 1 mg/24 h) para controle de frequência.",
        "Corrigir distúrbios eletrolíticos (K⁺ 4,0–5,0; Mg²⁺) — hipocalemia pela furosemida favorece arritmia.",
        // O veto tem de estar AQUI, no nó em que a FA aparece: controlar
        // frequência com BB/BCC é reflexo, e o paciente desta tela é
        // exatamente aquele em que o reflexo mata.
        "⛔ NÃO usar BETABLOQUEADOR nem BLOQUEADOR DE CANAL DE CÁLCIO NÃO-DIIDROPIRIDÍNICO (diltiazem, verapamil) IV na descompensação aguda — são inotrópicos NEGATIVOS num coração que já falhou como bomba, e derrubam o débito que sustenta a perfusão. São a escolha correta na FA crônica ambulatorial e a errada aqui; a diferença é a congestão.",
        "⚠️ E NÃO PERSIGA UM NÚMERO DE FREQUÊNCIA: na FA que descompensa, taquicardia é em boa parte RESPOSTA à congestão e ao baixo débito. O caminho é tratar a congestão e a causa (e cardioverter se instável) — a frequência cede junto. Alvo de FC sem ferramenta segura é objetivo sem caminho.",
      ],
      next: "card_reaval",
    },

    // ── Reavaliação (loop) ─────────────────────────────────────────────────────
    card_reaval: {
      id: "card_reaval",
      type: "decision",
      title: "Reavaliação da resposta",
      question: "Houve melhora (oxigenação, dispneia, hemodinâmica, diurese)?",
      summary: "EAP REFRATÁRIO OU EXAUSTÃO RESPIRATÓRIA PEDEM VIA AÉREA DEFINITIVA e cuidado intensivo." + " " + NA_DUVIDA_EAP_RESPOSTA,
      evidence: [
        "Reavaliar SpO₂, padrão respiratório, PA, perfusão e diurese após as primeiras medidas (15–30 min).",
        "Diurese < 0,5 mL/kg/h após furosemida = resposta inadequada (dobrar dose ou infusão contínua).",
      ],
      options: [
        { id: "melhora", label: "Melhora clínica", next: "card_destino" },
        { id: "refratario", label: "Refratário / piora", next: "card_refratario" },
      ],
    },

    card_refratario: {
      id: "card_refratario",
      type: "action",
      title: "EAP refratário — escalonar",
      summary: "Não insistir em medida que não responde; escalonar o suporte.",
      actions: [
        "IOT e ventilação mecânica se falha da VNI, exaustão respiratória ou rebaixamento.",
        "Otimizar terapia conforme o perfil hemodinâmico (vasodilatador × inotrópico/vasopressor).",
        "Resistência ao diurético: furosemida em infusão contínua (500 mg em 250 mL → 5–10 mg/h); monitorar K⁺, Mg²⁺, creatinina.",
        "Reavaliar a causa (isquemia em curso, arritmia, complicação mecânica) com ecocardiograma.",
        "Choque refratário (PAS < 90 após 30 min de vasopressor): acionar suporte circulatório mecânico (BIA/Impella/ECMO-VA).",
      ],
      next: "card_reaval_pos",
    },

    card_reaval_pos: {
      id: "card_reaval_pos",
      type: "decision",
      title: "Reavaliação após escalonamento",
      question: "Estabilizou após o escalonamento?",
      evidence: [
        "Reavaliar continuamente — reescalonar a qualquer sinal de deterioração.",
        "Necessidade persistente de VM, inotrópico/vasopressor ou suporte mecânico = UTI obrigatória.",
      ],
      options: [
        { id: "estavel", label: "Estabilizou — manter monitorização", next: "card_destino" },
        { id: "vm", label: "Em ventilação mecânica — ajustar ventilador", next: "transicao_vm" },
        { id: "vasoativo", label: "Em infusão vasoativa — titular", next: "transicao_vasoativo" },
      ],
    },

    // ── Destino ─────────────────────────────────────────────────────────────────
    card_destino: {
      id: "card_destino",
      type: "transition",
      title: "Destino — UTI / unidade de cuidados",
      summary: "Destino conforme a gravidade e a resposta ao tratamento.",
      disposition: "icu",
      exitCriteria: [
        "Choque cardiogênico, necessidade de VM/inotrópico/vasopressor ou EAP por SCA → UTI.",
        "Metas: SpO₂ ≥ 94%, PAS 110–130 com vasodilatador (não < 90), PAM ≥ 65 no choque, diurese ≥ 0,5 mL/kg/h, K⁺ 4,0–5,0, glicemia 140–180.",
        "Boa resposta e estabilidade → observação monitorizada e otimização da IC.",
        "Investigar e tratar a etiologia (BNP, troponina, ecocardiograma); ajustar terapia da insuficiência cardíaca.",
        "Reavaliar continuamente — reescalonar a qualquer sinal de deterioração.",
      ],
      targets: [],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // RAMO B — SARA / ARDS (não-cardiogênico)
    // ═════════════════════════════════════════════════════════════════════════

    sara_berlim: {
      id: "sara_berlim",
      type: "decision",
      title: "SARA — critérios de Berlim 2012",
      question: "O quadro preenche os critérios de Berlim para SARA?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "A GRAVIDADE SE MEDE PELO P/F COM PEEP ≥ 5, e ela escolhe o caminho: LEVE 200 < P/F ≤ 300 · MODERADA 100 < P/F ≤ 200 · GRAVE P/F ≤ 100. Os outros três critérios de Berlim — início agudo, opacidades bilaterais e origem não cardiogênica — estão abaixo.",
      evidence: [
        "INÍCIO: agudo (< 1 semana) após fator precipitante identificável.",
        "IMAGEM: opacidades bilaterais no RX/TC não explicadas por derrame, atelectasia ou nódulo.",
        "ORIGEM: edema NÃO explicado por IC/sobrecarga (BNP < 100 ou ecocardiograma normal). Na dúvida: ecocardiograma/Swan-Ganz.",
        "HIPOXEMIA (PaO₂/FiO₂ com PEEP ≥ 5): Leve 200 < P/F ≤ 300 · Moderada 100 < P/F ≤ 200 · Grave P/F ≤ 100.",
      ],
      options: [
        { id: "confirmada", label: "Sim — critérios de Berlim preenchidos", next: "sara_dados" },
        { id: "reavaliar", label: "Dúvida — pode ser cardiogênico/misto", next: "tipo" },
      ],
    },

    sara_dados: {
      id: "sara_dados",
      type: "input",
      title: "Dados para ventilação protetora",
      intro: "Altura e sexo calculam o peso predito e o volume corrente protetor (ARDSNet).",
      fields: [
        {
          id: "altura",
          label: "Altura",
          unit: "cm",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["150", "160", "165", "170", "175", "180", "190"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "sexo",
          label: "Sexo",
          // Palavras, não letras: "m" significava Mulher aqui e Masculino no
          // motor de ventilação, e o valor cruza os dois pelo contexto do
          // paciente. Valor antigo guardado ("h"/"m") é RECUSADO por
          // `normalizarSexo` — o app pergunta uma vez a mais e acerta, em vez
          // de herdar em silêncio um sexo trocado.
          presets: [
            { value: "masculino", label: "Homem" },
            { value: "feminino", label: "Mulher" },
          ],
        },
        {
          id: "pf",
          label: "Relação P/F (PaO₂/FiO₂)",
          allowCustom: true,
          customKeyboard: "numeric",
          optional: true,
          presets: ["280", "180", "120", "90", "70"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "sara_ventilacao",
    },

    sara_ventilacao: {
      id: "sara_ventilacao",
      type: "action",
      title: "Ventilação protetora — ARDSNet",
      summary: "Único tratamento que reduz mortalidade na SARA (39,8% → 31%). Peso predito {pp} kg · VC alvo {vc_min}–{vc_max} mL.",
      actions: [
        "VOLUME CORRENTE: 4–6 mL/kg de peso PREDITO (não o peso real). Para este paciente: {vc_min}–{vc_max} mL (PP {pp} kg).",
        "PRESSÃO DE PLATÔ (Pplat): ≤ 30 cmH₂O — medir a cada 4 h e após mudanças.",
        "DRIVING PRESSURE (ΔP = Pplat − PEEP): ≤ 15 cmH₂O — preditor independente de mortalidade.",
        "PEEP: titular por gravidade — leve 5–8 · moderada 8–13 · grave 13–18 cmH₂O. A tabela PEEP/FiO₂ do ARDSNet está no módulo de Ventilação Mecânica (passo \"Tabela PEEP/FiO₂\"), com os valores deste app ao lado.",
        "FR: 12–35 rpm — ajustar para manter pH ≥ 7,30 (tolerar hipercapnia permissiva, PaCO₂ até 55).",
        "ALVOS: SpO₂ 88–95% / PaO₂ 55–80 mmHg — tolerar hipoxemia moderada para evitar FiO₂ alta (> 0,6 por > 24 h é lesiva).",
        "MODO: VCV ou PCV — ambos aceitáveis se ΔP e Pplat controlados.",
        "RESTRIÇÃO HÍDRICA: balanço zero a negativo após estabilização hemodinâmica (FACTT — menos dias de VM).",
        "TRATAR A CAUSA: antibiótico se pneumonia/sepse; suporte da pancreatite, etc.",
      ],
      next: "sara_gravidade",
    },

    sara_gravidade: {
      id: "sara_gravidade",
      type: "decision",
      title: "Gravidade da SARA e resposta",
      question: "A SARA é grave/refratária apesar da ventilação protetora?",
      summary: "Relação P/F: {pf_txt}.",
      evidence: [
        "SARA grave: P/F ≤ 100. Refratária: P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5 após 12–24 h de VM protetora.",
        "Manobras de resgate são indicadas na SARA grave/refratária — não aguardar deterioração extrema.",
      ],
      options: [
        { id: "grave", label: "Grave/refratária (P/F ≤ 150) — manobras de resgate", next: "sara_resgate" },
        { id: "controlada", label: "Controlada com VM protetora", next: "sara_destino" },
      ],
    },

    sara_resgate: {
      id: "sara_resgate",
      type: "action",
      title: "Manobras de resgate — SARA grave",
      summary: "Escalonar de forma estruturada; ECMO precoce em centro habilitado.",
      actions: [
        "POSIÇÃO PRONA: 16 h/dia — reduz mortalidade (PROSEVA, RR 0,61). Iniciar se P/F ≤ 150 com FiO₂ ≥ 0,6 e PEEP ≥ 5. Contraindicações: instabilidade hemodinâmica grave, trauma facial, PIC elevada, gestação avançada.",
        "BLOQUEIO NEUROMUSCULAR precoce: cisatracúrio 37,5 mg/h × 48 h — considerar em dissincronia grave, drive excessivo ou prona (ACURASYS benefício; ROSE neutro com sedação profunda).",
        "CORTICOIDE: metilprednisolona 1 mg/kg/dia ou dexametasona 20 mg/dia × 5 d → 10 mg/dia × 5 d (DEXA-ARDS reduziu VM e mortalidade). COVID-19 com O₂: dexametasona 6 mg/dia × 10 d (RECOVERY).",
        "RECRUTAMENTO ALVEOLAR: usar com CAUTELA e monitorização hemodinâmica (ART trial — recrutamento agressivo aumentou mortalidade).",
        "ÓXIDO NÍTRICO INALATÓRIO (5–40 ppm): melhora P/F transitoriamente, sem benefício em mortalidade — ponte para ECMO/resgate temporário.",
        "ECMO VENOVENOSA: SARA grave refratária (P/F < 80 com FiO₂ 1,0 e PEEP ≥ 10, pH < 7,25 por > 6 h). Encaminhar PRECOCEMENTE a centro habilitado (EOLIA).",
      ],
      next: "transicao_vm",
    },

    sara_destino: {
      id: "sara_destino",
      type: "transition",
      title: "Destino — UTI (SARA)",
      summary: "SARA exige cuidado intensivo e ventilação protetora contínua.",
      disposition: "icu",
      exitCriteria: [
        "Toda SARA confirmada → UTI com ventilação mecânica protetora.",
        "Metas: Pplat ≤ 30, ΔP ≤ 15, SpO₂ 88–95%, pH ≥ 7,30 (aceitar 7,20–7,30 com VC baixo), balanço hídrico zero a negativo.",
        "Tratar a causa de base (sepse, pneumonia, aspiração, pancreatite).",
        "Reavaliar P/F seriado; iniciar manobras de resgate precocemente se piora (prona, BNM, ECMO).",
      ],
      targets: [],
    },

    // ═════════════════════════════════════════════════════════════════════════
    // TRANSIÇÕES PARA OUTROS MÓDULOS
    // ═════════════════════════════════════════════════════════════════════════

    transicao_vm: {
      id: "transicao_vm",
      type: "transition",
      title: "Módulo de ventilação mecânica",
      summary: "IOT realizada / ventilação protetora — ajuste detalhado de parâmetros.",
      disposition: "other_module",
      exitCriteria: [
        "Ventilação mecânica iniciada (falha de VNI no EAP-C ou SARA confirmada).",
        "Ajuste de VC (peso predito), PEEP, Pplat ≤ 30, ΔP ≤ 15 e troca gasosa passam a dominar.",
      ],
      targets: [
        {
          moduleId: "ventilacao-mecanica",
          label: "Ventilação Mecânica",
          reason: "Setup e titulação do ventilador (protetora na SARA, suporte no EAP-C refratário).",
        },
      ],
    },

    transicao_vasoativo: {
      id: "transicao_vasoativo",
      type: "transition",
      title: "Módulo de drogas vasoativas",
      summary: "Choque cardiogênico — titulação de inotrópico/vasopressor.",
      disposition: "other_module",
      exitCriteria: [
        "Choque cardiogênico em uso de dobutamina/norepinefrina e a titulação passa a ser o problema principal.",
        "Considerar suporte circulatório mecânico se refratário (BIA/Impella/ECMO-VA).",
      ],
      targets: [
        {
          moduleId: "drogas-vasoativas",
          label: "Drogas Vasoativas",
          reason: "Titulação de inotrópico + vasopressor no choque cardiogênico.",
        },
      ],
    },
  },
};
