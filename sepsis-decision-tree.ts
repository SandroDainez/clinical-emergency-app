import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo de Sepse e Choque Séptico no adulto.
 * Ordem real de atendimento (Surviving Sepsis Campaign 2021 — pacote da 1ª hora):
 * reconhecimento → lactato + culturas → antibiótico de amplo espectro ≤ 1 h →
 * ressuscitação volêmica (30 mL/kg se hipotensão ou lactato ≥ 4) → vasopressor
 * (PAM ≥ 65) → controle do foco → reavaliação dinâmica → destino (UTI).
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * O volume de cristaloide (30 mL/kg) é calculado automaticamente pelo peso.
 *
 * NÃO substitui o julgamento clínico nem o protocolo institucional. A decisão e a
 * responsabilidade finais são do profissional assistente.
 */

function toNumber(v: string | undefined): number | null {
  if (v === undefined) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function round0(n: number): string {
  return Math.round(n).toString();
}

function deriveSepsis(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    const vol = 30 * peso;
    out.fluidVol = round0(vol); // 30 mL/kg
    out.fluidVolL = (Math.round((vol / 1000) * 10) / 10).toString().replace(".", ",");
    out.noraStart = (Math.round(0.05 * peso * 100) / 100).toString().replace(".", ","); // 0,05 mcg/kg/min
  } else {
    out.fluidVol = "30 mL/kg";
    out.fluidVolL = "30 mL/kg";
    out.noraStart = "0,05 mcg/kg/min";
  }
  return out;
}

export const sepsisDecisionTree: DecisionTreeDefinition = {
  id: "sepse_ssc_2021",
  version: "2021.1",
  label: "Sepse / Choque Séptico",
  entryNodeId: "entry",
  derive: deriveSepsis,
  nodes: {
    // ── 1. Reconhecimento ──────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Suspeita de sepse — reconhecimento",
      summary: "Infecção suspeita/confirmada + disfunção orgânica. O tempo importa.",
      actions: [
        "Suspeitar de sepse: infecção + sinais de disfunção orgânica (qSOFA ≥ 2: FR ≥ 22, alteração mental, PAS ≤ 100).",
        "Monitor, oximetria, PA, 2 acessos venosos calibrosos; O₂ se SpO₂ < 94%.",
        "Acionar o protocolo institucional de sepse e marcar o tempo zero (início do pacote).",
        "Exames: gasometria com lactato, hemograma, função renal/hepática, eletrólitos, coagulograma.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados iniciais",
      intro: "Toque nos valores (ou adicione). Definem hipoperfusão e a dose de volume.",
      fields: [
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "80", "90", "100", "110", "120"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "lactato",
          label: "Lactato",
          unit: "mmol/L",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["1", "2", "3", "4", "6", "8"].map((v) => ({ value: v, label: v })),
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
      next: "culturas",
    },

    // ── 2. Culturas antes do antibiótico ───────────────────────────────────────
    culturas: {
      id: "culturas",
      type: "action",
      title: "Culturas ANTES do antibiótico",
      summary: "Não atrasar o ATB além de coletas rápidas (não retardar > 45 min).",
      actions: [
        "Coletar 2 pares de hemoculturas (sítios diferentes) ANTES do antibiótico.",
        "Culturas dirigidas ao foco: urina, secreção respiratória, líquor, líquidos/coleções.",
        "Repetir/registrar o lactato — orienta a ressuscitação e o prognóstico.",
        "Identificar o foco provável (pulmão, urinário, abdome, pele/partes moles, SNC, cateter).",
      ],
      next: "atb",
    },

    // ── 3. Antibiótico de amplo espectro ≤ 1 h ─────────────────────────────────
    atb: {
      id: "atb",
      type: "action",
      title: "Antibiótico de amplo espectro — na 1ª hora",
      summary: "Cada hora de atraso aumenta a mortalidade. Ajustar ao foco e à epidemiologia local.",
      actions: [
        "Iniciar ATB IV de amplo espectro em ≤ 1 h (após culturas, sem atrasar a droga).",
        "Empírico comum: piperacilina-tazobactam 4,5 g IV OU cefepima 2 g IV OU meropenem 1 g IV (foco/risco de resistência).",
        "Adicionar vancomicina 15–20 mg/kg IV se risco de MRSA (cateter, pele/partes moles, instabilidade).",
        "Ajustar dose à função renal; descalonar conforme culturas e evolução.",
      ],
      next: "volume_check",
    },

    // ── 4. Ressuscitação volêmica ──────────────────────────────────────────────
    volume_check: {
      id: "volume_check",
      type: "decision",
      title: "Indicação de ressuscitação volêmica",
      question: "Há hipotensão (PAS < 90 / PAM < 65) OU lactato ≥ 4 mmol/L?",
      summary: "PAS informada: {pas} mmHg · lactato: {lactato} mmol/L.",
      evidence: [
        "SSC 2021: cristaloide 30 mL/kg nas primeiras 3 h se hipotensão induzida por sepse ou lactato ≥ 4.",
        "Preferir cristaloides balanceados (Ringer lactato) a soro fisiológico em grandes volumes.",
        "Reavaliar de forma dinâmica (não infundir todo o volume sem reavaliar a resposta).",
      ],
      options: [
        { id: "sim", label: "Sim — hipotensão ou lactato ≥ 4", next: "volume" },
        { id: "nao", label: "Não — sem hipoperfusão", next: "reaval_perfusao" },
      ],
    },

    volume: {
      id: "volume",
      type: "action",
      title: "Cristaloide 30 mL/kg — dose calculada",
      summary: "Bolus inicial nas primeiras 3 h, reavaliando a resposta.",
      actions: [
        "Cristaloide balanceado {fluidVol} mL (≈ {fluidVolL} L = 30 mL/kg) em bolus, reavaliando.",
        "Reavaliar resposta com parâmetros dinâmicos: variação de PP, elevação passiva de pernas, débito urinário, tempo de enchimento capilar.",
        "Evitar sobrecarga: interromper bolus quando não houver mais responsividade a volume.",
        "Repetir o lactato em 2–4 h para guiar a ressuscitação (meta: clareamento).",
      ],
      next: "reaval_pam",
    },

    reaval_pam: {
      id: "reaval_pam",
      type: "decision",
      title: "Reavaliação após volume",
      question: "Após a ressuscitação, a PAM permanece < 65 mmHg?",
      evidence: [
        "Choque séptico = hipotensão que exige vasopressor para PAM ≥ 65 mmHg + lactato > 2 apesar de volume adequado.",
        "Não retardar o vasopressor se a hipotensão é grave — pode iniciar em paralelo ao volume.",
      ],
      options: [
        { id: "sim", label: "Sim — PAM < 65 (choque)", next: "vasopressor" },
        { id: "nao", label: "Não — PAM ≥ 65", next: "foco_check" },
      ],
    },

    // ── 5. Vasopressor ─────────────────────────────────────────────────────────
    vasopressor: {
      id: "vasopressor",
      type: "action",
      title: "Vasopressor — alvo PAM ≥ 65 mmHg",
      summary: "Noradrenalina é a 1ª escolha. Preferir acesso central, mas não atrasar.",
      actions: [
        "Noradrenalina IV em bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) e titular para PAM ≥ 65.",
        "Se PAM não atingida: associar vasopressina 0,03 U/min (poupador de catecolamina).",
        "Choque refratário: considerar adrenalina e hidrocortisona 200 mg/dia (50 mg 6/6h ou infusão contínua).",
        "Reavaliar perfusão (lactato, enchimento capilar, diurese) e considerar acesso central + arterial.",
      ],
      next: "foco_check",
    },

    // ── 6. Controle do foco ────────────────────────────────────────────────────
    foco_check: {
      id: "foco_check",
      type: "decision",
      title: "Controle do foco infeccioso",
      question: "Há foco que exija controle (drenagem/cirurgia)?",
      evidence: [
        "Focos que exigem controle: abscesso, empiema, colangite/obstrução biliar, pielonefrite obstrutiva, necrose/fasceíte, cateter infectado.",
        "O controle do foco deve ser feito o mais precocemente possível (idealmente ≤ 6–12 h).",
      ],
      options: [
        { id: "sim", label: "Sim — foco que precisa de controle", next: "foco_acao" },
        { id: "nao", label: "Não / foco sem indicação de procedimento", next: "destino" },
      ],
    },

    foco_acao: {
      id: "foco_acao",
      type: "action",
      title: "Controle do foco — agir precocemente",
      summary: "Antibiótico não substitui a remoção da fonte.",
      actions: [
        "Imagem dirigida (US/TC) para localizar e caracterizar o foco.",
        "Acionar a especialidade (cirurgia, urologia, radiologia intervencionista) para drenagem/abordagem.",
        "Remover dispositivos/cateteres suspeitos como fonte de infecção.",
        "Não adiar o procedimento de controle do foco além do necessário para estabilização.",
      ],
      next: "destino",
    },

    reaval_perfusao: {
      id: "reaval_perfusao",
      type: "action",
      title: "Reavaliação e monitorização",
      summary: "Sem hipoperfusão evidente — manter vigilância ativa.",
      actions: [
        "Manter monitorização contínua; reavaliar PA, FC, FR, diurese e nível de consciência.",
        "Repetir o lactato em 2–4 h se o inicial estava alterado.",
        "Reavaliar a resposta ao antibiótico e a evolução do foco.",
        "Escalonar imediatamente se surgir hipotensão, lactato ascendente ou disfunção orgânica.",
      ],
      next: "destino",
    },

    // ── 7. Destino ─────────────────────────────────────────────────────────────
    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / unidade de cuidados intensivos",
      summary: "Choque séptico e sepse com disfunção orgânica → cuidado intensivo.",
      disposition: "icu",
      exitCriteria: [
        "Internar em UTI se choque, necessidade de vasopressor ou disfunção orgânica significativa.",
        "Reavaliar antibiótico em 48–72 h (descalonamento guiado por culturas).",
        "Metas de ressuscitação: PAM ≥ 65, clareamento de lactato, diurese e perfusão periférica.",
        "Profilaxia de TVP e de úlcera de estresse; suporte orgânico conforme necessidade.",
      ],
      targets: [],
    },
  },
};
