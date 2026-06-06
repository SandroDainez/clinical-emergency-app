import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo do AVC isquêmico/hemorrágico agudo no adulto.
 * Baseado nas Diretrizes AHA/ASA 2019 para Manejo Precoce do AVC Isquêmico Agudo
 * (Powers et al., Stroke 2019) e nas recomendações de manejo do AVC hemorrágico.
 *
 * Valores são coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * As doses de trombolítico são calculadas automaticamente a partir do peso.
 *
 * NÃO substitui o julgamento clínico. Conduta final é do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function deriveAvc(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    const alteplase = Math.min(0.9 * peso, 90);
    const bolus = alteplase * 0.1;
    const infusao = alteplase - bolus;
    const tnk = Math.min(0.25 * peso, 25);
    out.alteplaseDose = round1(alteplase);
    out.alteplaseBolus = round1(bolus);
    out.alteplaseInfusao = round1(infusao);
    out.tnkDose = round1(tnk);
  } else {
    out.alteplaseDose = "0,9 mg/kg (máx 90)";
    out.alteplaseBolus = "10% da dose";
    out.alteplaseInfusao = "90% da dose";
    out.tnkDose = "0,25 mg/kg (máx 25)";
  }
  return out;
}

export const avcDecisionTree: DecisionTreeDefinition = {
  id: "avc_isquemico_2019",
  version: "2019.1",
  label: "AVC Agudo",
  entryNodeId: "entry",
  derive: deriveAvc,
  nodes: {
    // ── Reconhecimento e medidas iniciais ────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento — suspeita de AVC",
      summary: "Déficit neurológico focal súbito. Tempo é cérebro — agir em paralelo.",
      actions: [
        "Acionar o código AVC e a equipe de neurologia/imagem imediatamente.",
        "ABC: via aérea, O₂ se SpO₂ < 94%, monitor, 2 acessos venosos.",
        "Glicemia capilar AGORA — tratar se < 60 mg/dL (hipoglicemia simula AVC).",
        "Definir o horário do último momento visto bem (LKW) com testemunha.",
      ],
      next: "tempo",
    },

    tempo: {
      id: "tempo",
      type: "input",
      title: "Tempo desde o início (último momento visto bem)",
      intro: "Toque na janela de tempo. Define a elegibilidade para reperfusão.",
      fields: [
        {
          id: "janela",
          label: "Janela de tempo (LKW)",
          presets: [
            { value: "< 3 h", label: "< 3 h" },
            { value: "3–4,5 h", label: "3–4,5 h" },
            { value: "4,5–6 h", label: "4,5–6 h" },
            { value: "6–24 h", label: "6–24 h" },
            { value: "desconhecido / ao acordar", label: "Desconhecido / ao acordar" },
          ],
        },
      ],
      next: "tc",
    },

    tc: {
      id: "tc",
      type: "action",
      title: "TC de crânio SEM contraste — URGENTE",
      summary: "Meta porta-imagem ≤ 20 min. A TC define hemorrágico vs isquêmico.",
      actions: [
        "Levar à TC de crânio sem contraste imediatamente (não atrasar por exames).",
        "Coletar em paralelo: hemograma, coagulograma (INR, TTPa), glicemia, eletrólitos.",
        "Aferir PA nos dois braços; ECG de 12 derivações.",
        "Aplicar a escala NIHSS para quantificar o déficit.",
      ],
      next: "tc_resultado",
    },

    tc_resultado: {
      id: "tc_resultado",
      type: "decision",
      title: "Resultado da TC de crânio",
      question: "A TC mostrou hemorragia?",
      evidence: [
        "Hemorragia = sangramento intraparenquimatoso, subaracnoide ou hematoma — contraindica trombólise/antiagregação.",
        "TC sem sangramento em quadro focal agudo = AVC isquêmico até prova em contrário.",
      ],
      options: [
        { id: "hemorragico", label: "Hemorragia presente", next: "hem_inicial" },
        { id: "isquemico", label: "Sem hemorragia (isquêmico)", next: "isq_dados" },
      ],
    },

    // ── RAMO HEMORRÁGICO ──────────────────────────────────────────────────────
    hem_inicial: {
      id: "hem_inicial",
      type: "action",
      title: "AVC hemorrágico — manejo inicial",
      summary: "NÃO trombolisar nem antiagregar. Foco em PA, coagulação e neurocirurgia.",
      actions: [
        "Controle da PA: na hemorragia espontânea com PAS 150–220, reduzir PAS para ~140 mmHg é seguro (alvo 130–150) — labetalol ou nicardipina IV.",
        "Reverter anticoagulação: varfarina → vitamina K + complexo protrombínico; DOAC → agente reversor específico se disponível.",
        "Cabeceira a 30°, normoglicemia, normotermia, evitar hipotensão.",
        "Acionar neurocirurgia para avaliação de drenagem/derivação.",
      ],
      next: "hem_destino",
    },

    hem_destino: {
      id: "hem_destino",
      type: "transition",
      title: "Neurocirurgia + UTI",
      summary: "Cuidado neurointensivo com controle pressórico contínuo.",
      disposition: "icu",
      exitCriteria: [
        "Avaliação neurocirúrgica urgente (hematoma com efeito de massa, hidrocefalia).",
        "UTI / unidade de AVC com monitorização neurológica seriada.",
        "Controle contínuo da PA e da coagulação; reavaliar TC se deterioração.",
      ],
      targets: [],
    },

    // ── RAMO ISQUÊMICO ─────────────────────────────────────────────────────────
    isq_dados: {
      id: "isq_dados",
      type: "input",
      title: "Dados para elegibilidade",
      intro: "Toque nos valores (ou adicione o seu). Usados para PA, glicemia e cálculo de dose.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["110", "130", "150", "170", "185", "200", "220"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pad",
          label: "PA diastólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "90", "100", "110", "120"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "glicemia",
          label: "Glicemia",
          unit: "mg/dL",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "80", "110", "150", "200", "300", "400"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "peso",
          label: "Peso estimado",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "isq_nihss",
    },

    isq_nihss: {
      id: "isq_nihss",
      type: "input",
      title: "Gravidade — NIHSS",
      intro: "Toque na pontuação do NIHSS (ou adicione o valor exato).",
      fields: [
        {
          id: "nihss",
          label: "NIHSS total",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["0", "2", "4", "6", "10", "15", "20", "25"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "isq_janela",
    },

    isq_janela: {
      id: "isq_janela",
      type: "decision",
      title: "Janela para trombólise intravenosa",
      question: "O início foi há ≤ 4,5 horas (tempo bem definido)?",
      summary: "Janela atual: {janela}.",
      evidence: [
        "Trombólise IV é indicada até 4,5 h do início em pacientes elegíveis.",
        "0–3 h: critérios padrão. 3–4,5 h: critérios adicionais (cautela se idade > 80, NIHSS > 25, DM + AVC prévio, anticoagulante).",
        "Início desconhecido / ao acordar: considerar protocolo guiado por imagem (RM DWI-FLAIR) em centro especializado.",
      ],
      options: [
        { id: "sim", label: "Sim — ≤ 4,5 h", next: "isq_contraindicacoes" },
        { id: "nao", label: "Não / desconhecido (> 4,5 h)", next: "isq_trombectomia_check" },
      ],
    },

    isq_contraindicacoes: {
      id: "isq_contraindicacoes",
      type: "decision",
      title: "Contraindicações à trombólise IV",
      question: "Há alguma contraindicação ABSOLUTA à trombólise?",
      evidence: [
        "Hemorragia na TC ou hipodensidade extensa (> 1/3 do território de ACM).",
        "AVC isquêmico ou TCE grave nos últimos 3 meses; cirurgia intracraniana/espinhal recente.",
        "História de hemorragia intracraniana; neoplasia/MAV/aneurisma intracraniano.",
        "Sangramento ativo; plaquetas < 100.000; INR > 1,7 / TTPa elevado; uso de DOAC nas últimas 48 h.",
        "PA > 185/110 mmHg não controlável; glicemia < 50 mg/dL não corrigida.",
      ],
      options: [
        { id: "nao", label: "Sem contraindicação", next: "isq_pa_check" },
        { id: "sim", label: "Há contraindicação", next: "isq_trombectomia_check" },
      ],
    },

    isq_pa_check: {
      id: "isq_pa_check",
      type: "decision",
      title: "Pressão arterial antes da trombólise",
      question: "A PA está < 185/110 mmHg?",
      summary: "PA informada: {pas}/{pad} mmHg.",
      evidence: [
        "Para trombolisar, a PA deve estar < 185/110 mmHg.",
        "Após a trombólise, manter < 180/105 mmHg por 24 horas.",
      ],
      options: [
        { id: "sim", label: "Sim — < 185/110", next: "trombolise" },
        { id: "nao", label: "Não — ≥ 185/110", next: "isq_pa_tratar" },
      ],
    },

    isq_pa_tratar: {
      id: "isq_pa_tratar",
      type: "action",
      title: "Reduzir a PA antes da trombólise",
      summary: "Alvo < 185/110 mmHg para liberar o trombolítico.",
      actions: [
        "Labetalol 10–20 mg IV em 1–2 min (pode repetir 1×) OU nicardipina 5 mg/h IV, titulando 2,5 mg/h a cada 5–15 min (máx 15 mg/h).",
        "Alternativa: clevidipina conforme disponibilidade.",
        "Reaferir a PA — só liberar a trombólise com PA < 185/110 mmHg.",
        "Se a PA não baixar de forma sustentada, não trombolisar.",
      ],
      next: "trombolise",
    },

    trombolise: {
      id: "trombolise",
      type: "action",
      title: "Trombólise IV — dose calculada",
      summary: "Iniciar o quanto antes (meta porta-agulha ≤ 60 min).",
      actions: [
        "Alteplase: dose total {alteplaseDose} mg (0,9 mg/kg, máx 90 mg) — {alteplaseBolus} mg em bolus em 1 min (10%) + {alteplaseInfusao} mg em infusão por 60 min.",
        "Alternativa — Tenecteplase {tnkDose} mg IV em bolus único (0,25 mg/kg, máx 25 mg).",
        "Manter PA < 180/105 mmHg por 24 h. SEM antiagregante/anticoagulante/punções nas próximas 24 h.",
        "Vigiar deterioração neurológica / cefaleia / vômito → suspender e TC (suspeita de hemorragia).",
      ],
      next: "isq_trombectomia_check",
    },

    isq_trombectomia_check: {
      id: "isq_trombectomia_check",
      type: "decision",
      title: "Trombectomia mecânica",
      question: "O paciente é candidato à trombectomia mecânica?",
      summary: "NIHSS informado: {nihss}.",
      evidence: [
        "Oclusão de grande vaso da circulação anterior (carótida interna ou ACM-M1) à angio-TC/angio-RM.",
        "NIHSS ≥ 6, ASPECTS ≥ 6, independência funcional prévia (mRS 0–1).",
        "Até 6 h do início; entre 6–24 h apenas com critérios de imagem (DAWN / DEFUSE-3).",
      ],
      options: [
        { id: "sim", label: "Sim — oclusão de grande vaso", next: "trombectomia" },
        { id: "nao", label: "Não / sem grande vaso", next: "isq_suporte" },
      ],
    },

    trombectomia: {
      id: "trombectomia",
      type: "action",
      title: "Acionar trombectomia mecânica",
      summary: "A trombectomia não exclui a trombólise — fazer ambas se elegível.",
      actions: [
        "Confirmar oclusão de grande vaso com angio-TC / angio-RM.",
        "Acionar a neurorradiologia intervencionista IMEDIATAMENTE.",
        "Transferir para centro com capacidade de trombectomia se necessário — não atrasar.",
        "Manter PA < 180/105 mmHg; reavaliar NIHSS continuamente.",
      ],
      next: "isq_destino",
    },

    isq_suporte: {
      id: "isq_suporte",
      type: "action",
      title: "Cuidados de suporte do AVC isquêmico",
      summary: "Quando não há reperfusão indicada/possível.",
      actions: [
        "PA permissiva: se NÃO trombolisou, tratar apenas se > 220/120 mmHg (reduzir ~15% nas primeiras 24 h).",
        "Antiagregante (AAS 160–300 mg) nas primeiras 24–48 h — após 24 h se houve trombólise.",
        "Glicemia-alvo 140–180 mg/dL; normotermia; rastrear disfagia antes de via oral.",
        "Profilaxia de TVP (compressão pneumática); investigar etiologia (carótidas, ECG/Holter, ecocardiograma).",
      ],
      next: "isq_destino",
    },

    isq_destino: {
      id: "isq_destino",
      type: "transition",
      title: "Unidade de AVC / UTI",
      summary: "Monitorização neurológica e investigação etiológica.",
      disposition: "icu",
      exitCriteria: [
        "Internar em unidade de AVC ou UTI com NIHSS seriado.",
        "TC de controle em 24 h (obrigatória após trombólise) antes de antiagregar.",
        "Investigar etiologia e iniciar prevenção secundária.",
      ],
      targets: [],
    },
  },
};
