import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo da Cetoacidose Diabética (CAD) e do Estado Hiperglicêmico
 * Hiperosmolar (EHH) no adulto. Ordem real de atendimento (ADA / consenso 2009 e
 * atualizações): reconhecimento e diagnóstico → hidratação → CHECAGEM DO POTÁSSIO
 * (define o início da insulina) → insulina IV → manejo do bicarbonato → ajuste ao
 * atingir a meta glicêmica → critérios de resolução → destino.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * As doses de insulina são calculadas automaticamente pelo peso.
 *
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

function deriveDka(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    out.insBolus = round1(0.1 * peso); // 0,1 U/kg bolus
    out.insInf = round1(0.1 * peso); // 0,1 U/kg/h
    out.insLow = round1(0.02 * peso); // 0,02 U/kg/h
    out.insLowHigh = round1(0.05 * peso); // 0,05 U/kg/h
    out.sfLow = Math.round(15 * peso).toString(); // 15 mL/kg/h
    out.sfHigh = Math.round(20 * peso).toString(); // 20 mL/kg/h
  } else {
    out.insBolus = "0,1 U/kg";
    out.insInf = "0,1 U/kg/h";
    out.insLow = "0,02 U/kg/h";
    out.insLowHigh = "0,05 U/kg/h";
    out.sfLow = "15 mL/kg/h";
    out.sfHigh = "20 mL/kg/h";
  }
  return out;
}

export const dkaHhsDecisionTree: DecisionTreeDefinition = {
  id: "cad_ehh_ada",
  version: "2023.1",
  label: "CAD / EHH",
  entryNodeId: "entry",
  derive: deriveDka,
  nodes: {
    // ── 1. Reconhecimento e diagnóstico ───────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de CAD / EHH — reconhecimento",
      summary: "Hiperglicemia + clínica. Confirmar com gasometria, cetonas e eletrólitos.",
      actions: [
        "Monitor, oximetria, PA, 2 acessos venosos; avaliar nível de consciência e desidratação.",
        "Exames AGORA: glicemia, gasometria (pH, HCO₃⁻), cetonas (sangue/urina), Na⁺, K⁺, ureia/creatinina, osmolaridade.",
        "Calcular ânion gap = Na⁺ − (Cl⁻ + HCO₃⁻); calcular Na⁺ corrigido pela glicemia.",
        "Buscar o fator precipitante: infecção, omissão de insulina, IAM/AVC, drogas, primodescompensação.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados laboratoriais e peso",
      intro: "Toque nos valores (ou adicione). O K⁺ decide o início da insulina; o peso calcula a dose.",
      fields: [
        {
          id: "glicemia",
          label: "Glicemia",
          unit: "mg/dL",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["250", "350", "450", "600", "800", "1000"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "potassio",
          label: "Potássio (K⁺)",
          unit: "mEq/L",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["2.8", "3.3", "4.0", "4.5", "5.2", "6.0"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "ph",
          label: "pH arterial",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["6.8", "6.9", "7.0", "7.1", "7.25", "7.35"].map((v) => ({ value: v, label: v })),
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
      next: "classificacao",
    },

    classificacao: {
      id: "classificacao",
      type: "decision",
      title: "Classificação diagnóstica",
      question: "O quadro é CAD ou EHH?",
      summary: "Glicemia {glicemia} mg/dL · pH {ph} · K⁺ {potassio} mEq/L.",
      evidence: [
        "CAD: glicemia > 250, pH < 7,3 e/ou HCO₃⁻ < 18, cetonemia/cetonúria, ânion gap elevado.",
        "EHH: glicemia > 600, osmolaridade > 320, pH > 7,3 e HCO₃⁻ > 18, cetose mínima/ausente, déficit hídrico maior.",
        "Pode haver quadro misto. O manejo inicial (volume → K⁺ → insulina) é semelhante; mudam as metas e o déficit hídrico.",
      ],
      options: [
        { id: "cad", label: "CAD (cetoacidose)", next: "hidratacao" },
        { id: "ehh", label: "EHH (hiperosmolar)", next: "hidratacao" },
      ],
    },

    // ── 2. Hidratação ──────────────────────────────────────────────────────────
    hidratacao: {
      id: "hidratacao",
      type: "action",
      title: "Hidratação — primeiro passo do tratamento",
      summary: "Reposição volêmica precede e potencializa a insulina.",
      actions: [
        "SF 0,9% {sfLow}–{sfHigh} mL na 1ª hora (15–20 mL/kg/h; ≈ 1–1,5 L), salvo contraindicação (IC/IRC).",
        "Após a 1ª hora, ajustar pelo Na⁺ corrigido: se normal/alto → SF 0,45% 250–500 mL/h; se baixo → manter SF 0,9%.",
        "EHH: déficit hídrico maior — reposição mais robusta, reavaliando o estado volêmico.",
        "Monitorar diurese, perfusão e sinais de sobrecarga; reavaliar eletrólitos a cada 2–4 h.",
      ],
      next: "potassio",
    },

    // ── 3. Potássio — DECISÃO CRÍTICA (antes da insulina) ─────────────────────
    potassio: {
      id: "potassio",
      type: "decision",
      title: "Potássio — define o início da insulina",
      question: "Qual o valor do K⁺ sérico?",
      summary: "K⁺ informado: {potassio} mEq/L.",
      evidence: [
        "A insulina desloca K⁺ para dentro da célula e pode causar hipocalemia GRAVE.",
        "K⁺ < 3,3: NÃO iniciar insulina — repor potássio primeiro.",
        "K⁺ 3,3–5,2: iniciar insulina E repor K⁺ na hidratação.",
        "K⁺ > 5,2: não repor K⁺ agora; iniciar insulina e rechecar em 2 h.",
      ],
      options: [
        { id: "baixo", label: "K⁺ < 3,3 mEq/L", next: "k_baixo" },
        { id: "normal", label: "K⁺ 3,3–5,2 mEq/L", next: "k_normal" },
        { id: "alto", label: "K⁺ > 5,2 mEq/L", next: "k_alto" },
      ],
    },

    k_baixo: {
      id: "k_baixo",
      type: "action",
      title: "K⁺ < 3,3 — repor ANTES da insulina",
      summary: "Iniciar insulina com K⁺ baixo pode ser fatal.",
      actions: [
        "SEGURAR a insulina até K⁺ ≥ 3,3 mEq/L.",
        "Repor KCl 20–30 mEq/h IV (em acesso adequado), com monitorização do ritmo cardíaco.",
        "Rechecar K⁺ a cada 2 h; iniciar insulina assim que K⁺ ≥ 3,3.",
        "Manter a hidratação em curso.",
      ],
      next: "insulina",
    },

    k_normal: {
      id: "k_normal",
      type: "action",
      title: "K⁺ 3,3–5,2 — repor durante a hidratação",
      summary: "Pode iniciar a insulina; manter o K⁺ na faixa de 4–5.",
      actions: [
        "Adicionar 20–30 mEq de KCl por litro de fluido IV.",
        "Manter o K⁺ entre 4 e 5 mEq/L; rechecar a cada 2–4 h.",
        "Pode iniciar a insulina agora (ver próximo passo).",
        "Vigiar diurese (não repor K⁺ se anúria/oligúria significativa).",
      ],
      next: "insulina",
    },

    k_alto: {
      id: "k_alto",
      type: "action",
      title: "K⁺ > 5,2 — não repor agora",
      summary: "Iniciar insulina; o K⁺ tende a cair com o tratamento.",
      actions: [
        "NÃO adicionar potássio neste momento.",
        "Iniciar a insulina (ver próximo passo) e manter a hidratação.",
        "Rechecar K⁺ em 2 h e iniciar a reposição quando K⁺ < 5,2 mEq/L.",
        "Garantir diurese adequada antes de repor potássio.",
      ],
      next: "insulina",
    },

    // ── 4. Insulina IV ─────────────────────────────────────────────────────────
    insulina: {
      id: "insulina",
      type: "action",
      title: "Insulina regular IV — dose calculada",
      summary: "Só após K⁺ ≥ 3,3 e hidratação iniciada.",
      actions: [
        "Bolus opcional: insulina regular {insBolus} U IV (0,1 U/kg) — pode ser omitido se já houver infusão de 0,14 U/kg/h.",
        "Infusão contínua: {insInf} U/h (0,1 U/kg/h).",
        "Meta: queda da glicemia de 50–75 mg/dL/h. Se a queda for < 50 mg/dL/h na 1ª hora, dobrar a infusão.",
        "Monitorar glicemia de hora em hora e K⁺ a cada 2 h.",
      ],
      next: "bicarbonato",
    },

    // ── 5. Bicarbonato ──────────────────────────────────────────────────────────
    bicarbonato: {
      id: "bicarbonato",
      type: "decision",
      title: "Bicarbonato",
      question: "O pH arterial é < 6,9 (apenas CAD)?",
      summary: "pH informado: {ph}.",
      evidence: [
        "Bicarbonato NÃO é recomendado de rotina na CAD com pH ≥ 6,9.",
        "Apenas se pH < 6,9: NaHCO₃ 100 mmol em 400 mL de água + 20 mEq de KCl, IV em 2 h.",
        "Repetir a cada 2 h até pH ≥ 7,0; não se aplica ao EHH (sem acidose significativa).",
      ],
      options: [
        { id: "sim", label: "pH < 6,9 — administrar bicarbonato", next: "glicose_alvo" },
        { id: "nao", label: "pH ≥ 6,9 — sem bicarbonato", next: "glicose_alvo" },
      ],
    },

    // ── 6. Meta glicêmica e ajuste ─────────────────────────────────────────────
    glicose_alvo: {
      id: "glicose_alvo",
      type: "decision",
      title: "Meta glicêmica atingida?",
      question: "A glicemia chegou a ~200 (CAD) / ~300 (EHH) mg/dL?",
      evidence: [
        "Ao atingir a meta, adicionar glicose ao soro evita hipoglicemia e permite manter a insulina até resolver a cetoacidose.",
        "CAD: alvo 200 mg/dL. EHH: alvo 300 mg/dL.",
      ],
      options: [
        { id: "sim", label: "Sim — atingiu a meta", next: "glicose_add" },
        { id: "nao", label: "Não — ainda acima", next: "manter" },
      ],
    },

    glicose_add: {
      id: "glicose_add",
      type: "action",
      title: "Adicionar glicose e reduzir a insulina",
      summary: "Manter insulina até resolver a cetoacidose/hiperosmolaridade.",
      actions: [
        "Adicionar SG 5% (soro com glicose) à hidratação ao atingir a meta glicêmica.",
        "Reduzir a infusão de insulina para {insLow}–{insLowHigh} U/h (0,02–0,05 U/kg/h).",
        "Manter glicemia entre 150–200 (CAD) ou 250–300 (EHH) até a resolução.",
        "Continuar reposição de K⁺ e monitorização.",
      ],
      next: "resolucao",
    },

    manter: {
      id: "manter",
      type: "action",
      title: "Manter infusão e monitorizar",
      summary: "Ainda acima da meta — manter o tratamento e reavaliar.",
      actions: [
        "Manter a infusão de insulina e a hidratação.",
        "Glicemia de hora em hora; se a queda for < 50 mg/dL/h, aumentar a infusão.",
        "K⁺ a cada 2 h; eletrólitos e gasometria a cada 2–4 h.",
        "Reavaliar quando a glicemia atingir ~200 (CAD) / ~300 (EHH).",
      ],
      next: "resolucao",
    },

    // ── 7. Resolução ───────────────────────────────────────────────────────────
    resolucao: {
      id: "resolucao",
      type: "action",
      title: "Critérios de resolução e transição",
      summary: "Resolver antes de suspender a insulina IV — com sobreposição.",
      actions: [
        "CAD resolvida: glicemia < 200 + 2 de [HCO₃⁻ ≥ 15; pH venoso > 7,3; ânion gap ≤ 12].",
        "EHH resolvido: osmolaridade e estado mental normais, paciente alerta.",
        "Transição para insulina SC: aplicar a basal 1–2 h ANTES de desligar a infusão (sobreposição).",
        "Tratar o fator precipitante; manter dieta/hidratação conforme tolerância.",
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / unidade de internação",
      summary: "Destino conforme a gravidade e a estabilidade.",
      disposition: "icu",
      exitCriteria: [
        "CAD grave (pH < 7,0), rebaixamento, instabilidade ou EHH com osmolaridade muito alta → UTI.",
        "Quadros leves/moderados estáveis → internação com monitorização de glicemia e eletrólitos.",
        "Manter a investigação e o tratamento do fator precipitante.",
        "Educação e ajuste do esquema de insulina antes da alta.",
      ],
      targets: [],
    },
  },
};
