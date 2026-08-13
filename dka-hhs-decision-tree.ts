import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo da Cetoacidose Diabética (CAD) e do Estado Hiperglicêmico
 * Hiperosmolar (EHH) no adulto.
 * Baseado em: Consenso ADA/EASD/AACE/DTS 2024 de crises hiperglicêmicas (Diabetes Care
 * 2024;47:1257) · ADA Standards of Care · Kitabchi 2009.
 *
 * Ordem real: reconhecimento/diagnóstico → hidratação (CAD × EHH, com correção LENTA
 * no EHH) → CHECAGEM DO POTÁSSIO (define o início da insulina) → insulina IV (sem
 * bolus de rotina) → bicarbonato (só CAD, faixas de pH) → meta glicêmica e ajuste →
 * resolução e transição para SC → destino.
 *
 * Valores por TOQUE (seletores rápidos) com opção de valor próprio. As doses de
 * insulina e o volume da 1ª hora são calculados pelo peso.
 *
 * NÃO substitui o julgamento clínico nem o protocolo institucional.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): string {
  return (Math.round(n * 10) / 10).toString().replace(".", ",");
}

import { avisoDePeso } from "./lib/peso-estimado";

function deriveDka(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  // Reforço na LINHA DA DOSE: este módulo tem dose com TETO absoluto
  // (alteplase 90 mg · TNK 25 mg · enoxaparina 100 mg · HNF 10.000 U), e a
  // faixa do shell sozinha não põe a ressalva junto do miligrama.
  out.avisoPeso = avisoDePeso(values.pesoOrigem);
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    out.insInf = round1(0.1 * peso); // 0,1 U/kg/h
    out.insLow = round1(0.02 * peso); // 0,02 U/kg/h
    out.insLowHigh = round1(0.05 * peso); // 0,05 U/kg/h
    out.scBolus = round1(0.3 * peso); // 0,3 U/kg SC (alternativa CAD leve-moderada)
    out.scRepeat = round1(0.2 * peso); // 0,2 U/kg SC a cada 2 h
    out.sfLow = Math.round(15 * peso).toString(); // 15 mL/kg/h
    out.sfHigh = Math.round(20 * peso).toString(); // 20 mL/kg/h
    out.defEhhLow = Math.round((100 * peso) / 1000).toString(); // déficit EHH 100 mL/kg em L
    out.defEhhHigh = Math.round((200 * peso) / 1000).toString(); // déficit EHH 200 mL/kg em L
  } else {
    out.insInf = "0,1 U/kg/h";
    out.insLow = "0,02 U/kg/h";
    out.insLowHigh = "0,05 U/kg/h";
    out.scBolus = "0,3 U/kg";
    out.scRepeat = "0,2 U/kg";
    out.sfLow = "15 mL/kg/h";
    out.sfHigh = "20 mL/kg/h";
    out.defEhhLow = "7";
    out.defEhhHigh = "14";
  }
  return out;
}

export const dkaHhsDecisionTree: DecisionTreeDefinition = {
  id: "cad_ehh_ada_2024",
  version: "2024.1",
  label: "CAD / EHH",
  entryNodeId: "entry",
  derive: deriveDka,
  nodes: {
    // ── 1. Reconhecimento e diagnóstico ───────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de CAD / EHH — reconhecimento",
      summary: "Emergências hiperglicêmicas (mortalidade CAD 1–5%, EHH 5–20%). Diagnóstico clínico + laboratorial; podem coexistir.",
      actions: [
        "Monitor, oximetria, PA, 2 acessos venosos; avaliar nível de consciência e grau de desidratação.",
        "Exames AGORA: glicemia capilar+venosa, gasometria (pH, HCO₃⁻), cetonemia (betaOHB) ou cetonúria, Na⁺/K⁺/Cl⁻, ureia/creatinina, HMG, EAS+urocultura, ECG. Considerar amilase/lipase, fósforo, Mg²⁺.",
        "Calcular ânion gap = Na⁺ − (Cl⁻ + HCO₃⁻); Na⁺ corrigido = Na⁺ medido + 1,6 × (glicemia − 100)/100; osmolalidade efetiva = 2 × Na⁺ + glicemia/18.",
        "Buscar ATIVAMENTE o precipitante: infecção, omissão de insulina, DM1 inaugural, IAM/AVC, pancreatite, drogas (corticoide, antipsicótico), SGLT2i.",
        "CAD euglicêmica (uso de SGLT2i): glicemia pode ser < 250 mg/dL com cetonemia + acidose — suspender SGLT2i e tratar como CAD com glicose IV desde o início.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados laboratoriais e peso",
      intro: "Toque nos valores (ou adicione). O K⁺ decide o início da insulina; o peso calcula as doses.",
      fields: [
        {
          id: "glicemia",
          label: "Glicemia",
          unit: "mg/dL",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["200", "250", "350", "450", "600", "800", "1000"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "potassio",
          label: "Potássio (K⁺)",
          unit: "mEq/L",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["2.8", "3.2", "3.5", "4.0", "4.5", "5.0", "5.8"].map((v) => ({ value: v, label: v })),
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
          label: "Peso estimado (kg)",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
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
      next: "classificacao",
    },

    classificacao: {
      id: "classificacao",
      type: "decision",
      title: "Classificação diagnóstica",
      question: "O quadro é CAD ou EHH?",
      summary: "Glicemia {glicemia} mg/dL · pH {ph} · K⁺ {potassio} mEq/L.",
      evidence: [
        "CAD (consenso 2024): glicemia ≥ 200 mg/dL (ou história de diabetes; pode ser < 200 na euglicêmica por SGLT2i) + CETOSE (betaOHB ≥ 3,0 mmol/L ou cetonúria) + acidose metabólica (pH < 7,30 e/ou HCO₃⁻ < 18). Consciência preservada (grave: estupor/coma).",
        "O consenso 2024 RETIROU o ânion gap dos critérios diagnósticos (sofre influência de outros distúrbios acidobásicos) — o ânion gap segue útil para ACOMPANHAR a evolução, não para diagnosticar.",
        "EHH (critérios formalizados no consenso 2024): glicemia > 600, osmolalidade efetiva > 320 mOsm/kg, pH > 7,30 e HCO₃⁻ > 18, cetose mínima/ausente. Estupor/coma em ≥ 50%. Déficit hídrico MUITO maior.",
        "Diferença-chave de manejo: no EHH a correção da osmolalidade/Na⁺ deve ser LENTA (risco de edema cerebral); na CAD o foco é fechar o ânion gap.",
        // A DIREÇÃO do erro importa mais que a magnitude: quem lê o critério
        // precisa saber para que lado ele erra quando erra.
        "⚠️ USAR A EFETIVA, NÃO A TOTAL. A osmolalidade total inclui a UREIA, que é osmol ineficaz — atravessa a membrana e não desloca água. Incluí-la INFLA o número e SUPERDIAGNOSTICA EHH. E a direção importa: um paciente com CAD rotulado como EHH recebe insulina em dose menor e hidratação mais prolongada enquanto a cetoacidose corre. O erro oposto é menos perigoso, porque a CAD é o esquema mais agressivo dos dois.",
        "⚠️ UREIA × BUN: a fórmula clássica \"ureia/2,8\" pressupõe nitrogênio ureico (BUN), que os laboratórios brasileiros NÃO reportam. Com ureia total, o divisor é 6 — usar 2,8 superestima esse termo em ~2,14×. Na osmolalidade EFETIVA a questão não existe, porque a ureia não entra.",
      ],
      options: [
        { id: "cad", label: "CAD (cetoacidose)", next: "hidratacao_cad" },
        { id: "ehh", label: "EHH (hiperosmolar)", next: "hidratacao_ehh" },
      ],
    },

    // ── 2A. Hidratação — CAD ───────────────────────────────────────────────────
    hidratacao_cad: {
      id: "hidratacao_cad",
      type: "action",
      title: "Hidratação CAD — 1º passo (antes da insulina)",
      summary: "Déficit típico 3–5 L. Repõe volume, melhora perfusão e já reduz glicemia/osmolalidade.",
      actions: [
        "EXPANSÃO INICIAL: 500–1.000 mL/h nas primeiras 2–4 h (consenso ADA/EASD 2024), preferindo CRISTALOIDE BALANCEADO — menos acidose hiperclorêmica e alta mais precoce que o SF 0,9%. Reduzir em cardiopatia ou comprometimento renal: a própria diretriz condiciona essa velocidade a quem NÃO os tem. Em choque, alíquotas de 500 mL em 15–30 min, repetindo até PAS ≥ 90 mmHg.",
        "Manutenção (2ª–12ª h) pelo Na⁺ CORRIGIDO: corrigido < 135 → manter SF 0,9% 250–500 mL/h; corrigido ≥ 135 → SF 0,45% 250–500 mL/h.",
        "Repor ~50% do déficit nas primeiras 8–12 h; restante em 12–24 h. Total estimado 24 h: 4–6 L.",
        "CAD euglicêmica (SGLT2i): adicionar glicose IV desde o início para permitir a insulina sem hipoglicemia.",
        "Cuidado em idosos/cardiopatas/nefropatas: ausculta pulmonar e SpO₂ — risco de edema pulmonar.",
      ],
      next: "potassio",
    },

    // ── 2B. Hidratação — EHH (correção LENTA) ──────────────────────────────────
    hidratacao_ehh: {
      id: "hidratacao_ehh",
      type: "action",
      title: "Hidratação EHH — correção LENTA da osmolalidade",
      summary: "Déficit estimado ~{defEhhLow}–{defEhhHigh} L (100–200 mL/kg). Corrigir devagar — risco de edema cerebral.",
      actions: [
        "1ª–2ª hora: SF 0,9% 1.000–1.500 mL/h ({sfLow}–{sfHigh} mL na 1ª hora).",
        "Manutenção: SF 0,45% 250–500 mL/h após expansão. Se Na⁺ corrigido > 150 mEq/L, SF 0,45% (ou água livre via SNE com cautela).",
        "ALVO de correção da osmolalidade: ≤ 3 mOsm/kg/h. Correção do Na⁺: ≤ 0,5 mEq/L/h. NÃO normalizar a osmolalidade em menos de 24–36 h.",
        "A hidratação isolada já reduz a glicemia 70–100 mg/dL/h — a insulina entra em dose baixa e mais tarde.",
        "Vigiar nível de consciência de hora em hora; piora súbita → suspeitar de edema cerebral.",
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
        "K⁺ inicial é FALSAMENTE elevado pela acidose; com insulina + correção da acidose ele despenca → hipocalemia fatal se não reposto.",
        // ESCOLHA DELIBERADA, e o número NÃO é erro (R-14). O limiar clássico da
        // ADA é 3,3 mEq/L; este app usa 3,5. A razão: o 3,3 é PISO, não alvo —
        // insulina com potássio limítrofe é causa evitável de arritmia grave, e
        // a margem de 0,2 custa uma dose de KCl e compra segurança.
        // Declarado aqui para que o próximo leitor não "corrija" para 3,3
        // achando que encontrou uma divergência com a diretriz.
        "K⁺ < 3,5: NÃO iniciar insulina — repor K⁺ primeiro. (Limiar mais conservador que o 3,3 mEq/L da ADA, de propósito: o 3,3 é piso e não alvo, e insulina com K⁺ limítrofe é causa evitável de arritmia grave.)",
        "K⁺ 3,5–5,0: iniciar insulina E repor K⁺ na hidratação (alvo 4,0–5,0).",
        "K⁺ > 5,0: iniciar insulina sem repor K⁺; rechecar em 2 h da coleta atual.",
      ],
      options: [
        { id: "baixo", label: "K⁺ < 3,5 mEq/L", next: "k_baixo" },
        { id: "normal", label: "K⁺ 3,5–5,0 mEq/L", next: "k_normal" },
        { id: "alto", label: "K⁺ > 5,0 mEq/L", next: "k_alto" },
      ],
    },

    k_baixo: {
      id: "k_baixo",
      type: "action",
      title: "K⁺ < 3,5 — repor ANTES da insulina",
      summary: "Iniciar insulina com K⁺ baixo pode ser fatal (arritmia).",
      actions: [
        "SEGURAR a insulina até K⁺ ≥ 3,5 mEq/L.",
        "Repor KCl 20–40 mEq/h IV (máx 40 mEq/h em acesso central), com ECG contínuo.",
        "Rechecar K⁺ a cada 2 h; iniciar insulina assim que K⁺ ≥ 3,5.",
        "Hipomagnesemia frequente: se Mg < 1,2 mg/dL ou sintomas, MgSO₄ 50% 2 g IV em 1 h (melhora a reposição de K⁺).",
        "Manter a hidratação em curso.",
      ],
      next: "insulina",
    },

    k_normal: {
      id: "k_normal",
      type: "action",
      title: "K⁺ 3,5–5,0 — repor durante a hidratação",
      summary: "Pode iniciar a insulina; manter o K⁺ em 4,0–5,0.",
      actions: [
        "Adicionar 20–40 mEq de KCl por litro de fluido IV.",
        "Manter o K⁺ entre 4,0 e 5,0 mEq/L; rechecar a cada 2 h nas primeiras 6 h, depois a cada 4 h.",
        "Pode iniciar a insulina agora (próximo passo).",
        "Vigiar diurese — não repor K⁺ se anúria/oligúria significativa.",
      ],
      next: "insulina",
    },

    k_alto: {
      id: "k_alto",
      type: "action",
      title: "K⁺ > 5,0 — não repor agora",
      summary: "Iniciar insulina; o K⁺ tende a cair com o tratamento.",
      actions: [
        "NÃO adicionar potássio neste momento.",
        "Iniciar a insulina (próximo passo) e manter a hidratação.",
        "Rechecar K⁺ em 2 h e iniciar a reposição quando K⁺ < 5,0 mEq/L.",
        "Garantir diurese adequada antes de repor potássio.",
      ],
      next: "insulina",
    },

    // ── 4. Insulina IV ─────────────────────────────────────────────────────────
    insulina: {
      id: "insulina",
      type: "action",
      title: "Insulina regular IV — dose calculada",
      summary: "Só após K⁺ ≥ 3,5 e hidratação iniciada. SEM bolus de rotina.",
      actions: [
        "Infusão contínua (padrão-ouro): insulina regular {insInf} U/h (0,1 U/kg/h) SEM bolus inicial — bolus de rotina não melhora desfecho e aumenta hipoglicemia/hipocalemia. Preparo: 100 UI em 100 mL SF → 1 U = 1 mL.",
        "{avisoPeso}",
        "No EHH: hidratação já reduz a glicemia; iniciar insulina só após 1–2 h de hidratação e em dose baixa (≈ 0,05 U/kg/h). Meta intermediária 250–300 mg/dL até osmolalidade normalizar.",
        "CAD LEVE ou MODERADA não complicada: o consenso ADA/EASD 2024 RECOMENDA formalmente o análogo rápido SUBCUTÂNEO a cada 1–2 h como alternativa à infusão IV — evita a UTI. Esquema clássico com insulina regular SC: {scBolus} U (0,3 U/kg) → {scRepeat} U (0,2 U/kg) a cada 2 h.",
        "Meta de queda da glicemia: 50–75 mg/dL/h. Queda < 50 na 1ª hora → dobrar a taxa; queda > 100/h → reduzir 50%.",
        "Monitorar glicemia de hora em hora e K⁺ a cada 2 h. NÃO suspender a insulina IV ao normalizar a glicemia se a acidose persistir.",
      ],
      next: "bicarbonato",
    },

    // ── 5. Bicarbonato (apenas CAD, por faixa de pH) ───────────────────────────
    bicarbonato: {
      id: "bicarbonato",
      type: "decision",
      title: "Bicarbonato — apenas CAD, por faixa de pH",
      question: "Qual a faixa do pH arterial?",
      summary: "pH informado: {ph}. Uso rotineiro NÃO recomendado.",
      evidence: [
        "Bicarbonato de rotina NÃO é recomendado (ADA 2009/2024) — pode causar hipocalemia, alcalose paradoxal do LCR e edema cerebral.",
        "pH ≥ 7,0: não usar — corrigir com hidratação + insulina.",
        "Consenso 2024: considerar bicarbonato APENAS na acidose grave com pH < 7,0 (a faixa 6,9–7,0 abaixo vem do protocolo clássico e virou opcional).",
        "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq em 200 mL água destilada IV em 1 h; reavaliar o pH em 2 h após o término da infusão.",
        "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq em 400 mL água destilada IV em 2 h; repetir a cada 2 h até pH > 7,0. EHH não tem indicação (sem acidose).",
      ],
      options: [
        { id: "ph_ok", label: "pH ≥ 7,0 ou EHH — sem bicarbonato", next: "glicose_alvo" },
        { id: "ph_69_70", label: "pH 6,9–7,0 — bicarbonato (faixa intermediária)", next: "bic_admin" },
        { id: "ph_baixo", label: "pH < 6,9 — bicarbonato (dose maior)", next: "bic_admin" },
      ],
    },

    bic_admin: {
      id: "bic_admin",
      type: "action",
      title: "Bicarbonato — administrar e reavaliar",
      summary: "Sempre com KCl junto e monitorização do K⁺.",
      actions: [
        "pH 6,9–7,0: NaHCO₃ 50 mEq + KCl 10 mEq em 200 mL de água destilada IV em 1 h.",
        "pH < 6,9: NaHCO₃ 100 mEq + KCl 20 mEq em 400 mL de água destilada IV em 2 h; repetir a cada 2 h até pH > 7,0.",
        "Monitorar K⁺ de perto (o bicarbonato baixa o K⁺).",
        "Reavaliar a gasometria após 2 h; suspender ao atingir pH > 7,0.",
      ],
      next: "glicose_alvo",
    },

    // ── 6. Meta glicêmica e ajuste ─────────────────────────────────────────────
    glicose_alvo: {
      id: "glicose_alvo",
      type: "decision",
      title: "Meta glicêmica atingida?",
      question: "A glicemia chegou a ~200 (CAD) / ~300 (EHH) mg/dL?",
      evidence: [
        "Ao atingir a meta, adicionar glicose ao soro evita hipoglicemia e permite manter a insulina até resolver a cetoacidose (CAD) / a hiperosmolalidade (EHH).",
        "CAD: troca para SG aos 200 mg/dL (manter 150–200). EHH: troca aos 300 mg/dL (manter 250–300 até osmol < 315).",
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
      summary: "Manter insulina até resolver a cetoacidose (CAD) / normalizar a osmolalidade (EHH).",
      actions: [
        "CAD (glicemia 200): adicionar SG 5% + SF 0,45% (ou SGI) 150–250 mL/h; manter glicemia 150–200 mg/dL.",
        "EHH (glicemia 300): adicionar SG 5%; manter glicemia 250–300 mg/dL até osmolalidade < 315 e consciência normal — só então reduzir a meta.",
        "Reduzir a infusão de insulina para {insLow}–{insLowHigh} U/h (0,02–0,05 U/kg/h).",
        "Continuar reposição de K⁺ e monitorização (glicemia 1–2/h, K⁺ a cada 2–4 h).",
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
        "Glicemia de hora em hora; se a queda for < 50 mg/dL/h, aumentar a infusão; se > 100/h, reduzir 50%.",
        "K⁺ a cada 2 h; eletrólitos e gasometria a cada 2–4 h. Cetonemia (betaOHB) a cada 2–4 h se disponível.",
        "Reavaliar quando a glicemia atingir ~200 (CAD) / ~300 (EHH).",
      ],
      next: "resolucao",
    },

    // ── 7. Resolução e transição ───────────────────────────────────────────────
    resolucao: {
      id: "resolucao",
      type: "action",
      title: "Critérios de resolução e transição para SC",
      summary: "Resolver ANTES de suspender a insulina IV — sempre com sobreposição.",
      actions: [
        "CAD resolvida (consenso 2024): betaOHB < 0,6 mmol/L E (pH ≥ 7,30 OU HCO₃⁻ ≥ 18), com glicemia < 200 mg/dL. Se betaOHB indisponível, usar o fechamento do ânion gap. Cetonúria pode persistir — NÃO usá-la como critério isolado.",
        "EHH resolvido: osmolalidade efetiva < 315 mOsm/kg, glicemia < 300, consciência normalizada, aceitando VO.",
        "Transição SC: calcular dose total diária (DM1/magro 0,5–0,6 U/kg/dia; DM2 0,6–0,8) — 50% basal + 50% bolus às refeições.",
        "SOBREPOSIÇÃO obrigatória: aplicar insulina basal SC 1–2 h ANTES de desligar a infusão IV (a IV tem meia-vida de 5–10 min → risco de rebote).",
        "Repor FÓSFORO se < 1,0 mmol/L (consenso 2024), sobretudo com fraqueza muscular ou disfunção cardíaca/respiratória.",
        "Tratar o fator precipitante; retomar antidiabéticos orais quando estável (metformina contraindicada se Cr alta/TFG < 30; SGLT2i suspenso até reavaliação).",
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
        "CAD grave (pH < 7,0), rebaixamento, instabilidade, EHH com osmolalidade muito alta ou edema cerebral → UTI.",
        "Edema cerebral (cefaleia súbita, queda de consciência, bradicardia + HAS): manitol 0,5–1 g/kg IV ou SF 3% 5–10 mL/kg, reduzir hidratação, TC, UTI imediata.",
        "Quadros leves/moderados estáveis → internação com monitorização de glicemia e eletrólitos.",
        "Manter a investigação e o tratamento do fator precipitante; educação e ajuste do esquema de insulina antes da alta.",
      ],
      targets: [],
    },
  },
};
