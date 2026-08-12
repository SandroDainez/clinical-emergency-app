import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";
import { predictedBodyWeight } from "./ventilation-decision-tree";

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
      ],
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
        "O₂ para SpO₂ ≥ 94% (DPOC 88–92%).",
        "SpO₂ < 94% apesar de O₂ → iniciar VNI IMEDIATAMENTE.",
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
      summary: "PAS informada: {pas} mmHg · SpO₂ {spo2}%. O vasodilatador IV exige PAS ≥ 110 mmHg.",
      evidence: [
        "PAS > 180 (crise hipertensiva / 'flash'): predomínio de redistribuição de líquido — vasodilatador é a base; nitroprussiato preferível.",
        "PAS 110–180: vasodilatador IV (nitroglicerina) + diurético conforme congestão.",
        "PAS 90–110: diurético é a base; vasodilatador com MUITA cautela e monitorização estreita.",
        "PAS < 90 + hipoperfusão (choque cardiogênico): NÃO usar vasodilatador/diurético agressivo — inotrópico + vasopressor.",
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
        "Evitar morfina de rotina (associada a pior desfecho — ESC 2021 IIb).",
      ],
      next: "card_causa",
    },

    card_vasodilatador: {
      id: "card_vasodilatador",
      type: "action",
      title: "EAP normotenso-alto (PAS 110–180) — vasodilatador + diurético",
      summary: "Tríade: VNI + diurético IV + vasodilatador IV.",
      actions: [
        "NITROGLICERINA IV: iniciar 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min). Primeira escolha em isquemia.",
        "FUROSEMIDA IV: 20–80 mg em bolus (dose ≥ dose oral diária habitual). Sem uso prévio de diurético: 20–40 mg. Alvo de diurese: 100–200 mL/h nas primeiras horas.",
        "Sem resposta diurética em 1 h: dobrar a dose ou infusão contínua 5–10 mg/h.",
        "Monitorar PA de perto — suspender vasodilatador se tendência à hipotensão (PAS < 90).",
        "Evitar morfina de rotina; reservar 2–4 mg IV lento para angústia refratária (ESC 2021 IIb).",
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
        "INOTRÓPICO 1ª linha — DOBUTAMINA 2–20 mcg/kg/min IV (aumenta DC, reduz PCWP). Diluir 250 mg em 250 mL.",
        "VASOPRESSOR de escolha — NOREPINEFRINA 0,1–1 mcg/kg/min IV (superior à dopamina — SOAP II). Alvo PAM ≥ 65 mmHg. Diluir 4 mg em 250 mL.",
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
      evidence: [
        "EAP pode ser desencadeado por SCA, crise hipertensiva, taquiarritmia (FA de alta resposta, flutter), valvopatia aguda ou má adesão.",
        "IAM: ECG + troponina seriada. IAMCSST ou IAMSSST de alto risco → cinecoronariografia de urgência. Não retardar reperfusão pelo EAP.",
        "Taquiarritmia: cardioversão elétrica sincronizada se instável; amiodarona 150 mg IV em 10 min se FA estável; digoxina 0,5 mg IV em FA com disfunção sistólica severa.",
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
        "FA ESTÁVEL → amiodarona 150 mg IV em 10 min → 1 mg/min × 6 h → 0,5 mg/min × 18 h.",
        "FA com disfunção sistólica severa → digoxina 0,5 mg IV em 10–20 min → 0,25 mg IV a cada 6 h (máx 1 mg/24 h) para controle de frequência.",
        "Corrigir distúrbios eletrolíticos (K⁺ 4,0–5,0; Mg²⁺) — hipocalemia pela furosemida favorece arritmia.",
      ],
      next: "card_reaval",
    },

    // ── Reavaliação (loop) ─────────────────────────────────────────────────────
    card_reaval: {
      id: "card_reaval",
      type: "decision",
      title: "Reavaliação da resposta",
      question: "Houve melhora (oxigenação, dispneia, hemodinâmica, diurese)?",
      evidence: [
        "Reavaliar SpO₂, padrão respiratório, PA, perfusão e diurese após as primeiras medidas (15–30 min).",
        "EAP refratário ou exaustão respiratória → via aérea definitiva e cuidado intensivo.",
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
        "PEEP: titular pela tabela PEEP/FiO₂ ARDSNet. SARA moderada-grave: PEEP ≥ 10–12 cmH₂O.",
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
