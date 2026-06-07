import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo de Ventilação Mecânica invasiva no adulto.
 * Ordem real de implementação e ajuste: indicação/modo → cálculo do PESO PREDITO
 * (define o volume corrente) → ajuste inicial protetor → reconhecer SDRA (ventilação
 * protetora, PEEP, prona) → checagem de segurança (pressão de platô / driving
 * pressure) → troubleshooting (hipoxemia / pressão alta / assincronia) → reavaliação.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * O peso predito e o volume corrente-alvo (4–8 mL/kg) são calculados automaticamente.
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

/** Peso predito (PBW, ARDSNet): homem 50 + 0,91*(altura_cm − 152,4); mulher 45,5 + ... */
function predictedBodyWeight(alturaCm: number, sexo: string | undefined): number {
  const base = sexo === "feminino" ? 45.5 : 50;
  return base + 0.91 * (alturaCm - 152.4);
}

function deriveVent(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const altura = toNumber(values.altura);
  if (altura && altura > 0) {
    const pbw = predictedBodyWeight(altura, values.sexo);
    const pbwSafe = Math.max(pbw, 0);
    out.pbw = round0(pbwSafe);
    out.vc6 = round0(6 * pbwSafe); // alvo 6 mL/kg
    out.vc4 = round0(4 * pbwSafe); // mínimo protetor
    out.vc8 = round0(8 * pbwSafe); // máximo inicial
  } else {
    out.pbw = "calc. pela altura";
    out.vc6 = "6 mL/kg PBW";
    out.vc4 = "4 mL/kg PBW";
    out.vc8 = "8 mL/kg PBW";
  }
  return out;
}

export const ventilationDecisionTree: DecisionTreeDefinition = {
  id: "vm_adulto",
  version: "2024.1",
  label: "Ventilação Mecânica",
  entryNodeId: "entry",
  derive: deriveVent,
  nodes: {
    // ── 1. Indicação e modo ────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Ventilação mecânica — objetivos e modo",
      summary: "Definir o objetivo (oxigenação x ventilação) e o modo inicial.",
      actions: [
        "Confirmar a indicação e o objetivo principal: corrigir hipoxemia, hipoventilação, proteção de via aérea ou reduzir trabalho respiratório.",
        "Modo inicial usual: volume-controlado (VCV) ou pressão-controlada (PCV) assistido-controlado.",
        "Garantir sedação/analgesia adequadas e monitorização (capnografia, oximetria, curvas do ventilador).",
        "Coletar gasometria arterial inicial após estabilizar os parâmetros.",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados para o peso predito",
      intro: "Toque nos valores. A ALTURA (não o peso real) define o volume corrente protetor.",
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
          presets: [
            { value: "masculino", label: "Masculino" },
            { value: "feminino", label: "Feminino" },
          ],
        },
      ],
      next: "ajuste_inicial",
    },

    // ── 2. Ajuste inicial protetor ─────────────────────────────────────────────
    ajuste_inicial: {
      id: "ajuste_inicial",
      type: "action",
      title: "Ajuste inicial protetor",
      summary: "Volume baixo guiado pelo peso predito desde o início.",
      actions: [
        "Volume corrente: alvo {vc6} mL (6 mL/kg PBW; faixa {vc4}–{vc8} mL = 4–8 mL/kg). Peso predito ≈ {pbw} kg.",
        "FR 12–20/min para a ventilação-minuto desejada (vigiar auto-PEEP); relação I:E ~1:2.",
        "PEEP inicial 5 cmH₂O e FiO₂ titulada para SpO₂ 92–96% (ajustar conforme a oxigenação).",
        "Meta de segurança: pressão de platô < 30 cmH₂O e driving pressure (platô − PEEP) ≤ 15 cmH₂O.",
      ],
      next: "sdra",
    },

    // ── 3. SDRA? ───────────────────────────────────────────────────────────────
    sdra: {
      id: "sdra",
      type: "decision",
      title: "Há SDRA?",
      question: "O paciente preenche critérios de SDRA?",
      evidence: [
        "SDRA (Berlim): início agudo (≤ 1 semana), infiltrados bilaterais, edema não explicado por causa cardíaca, PaO₂/FiO₂ ≤ 300 com PEEP ≥ 5.",
        "Gravidade: leve (200–300), moderada (100–200), grave (< 100).",
        "Na SDRA, a ventilação protetora e a titulação de PEEP são prioritárias.",
      ],
      options: [
        { id: "sim", label: "Sim — SDRA", next: "sdra_manejo" },
        { id: "nao", label: "Não / outra causa", next: "seguranca" },
      ],
    },

    sdra_manejo: {
      id: "sdra_manejo",
      type: "action",
      title: "Manejo da SDRA — ventilação protetora",
      summary: "VC baixo, PEEP titulada, limitar pressões; prona se grave.",
      actions: [
        "Manter VC 6 mL/kg PBW ({vc6} mL); reduzir até 4 mL/kg se platô > 30 (hipercapnia permissiva, pH ≥ 7,20).",
        "Titular PEEP pela tabela PEEP/FiO₂ (ARDSNet) buscando melhor oxigenação com menor pressão.",
        "SDRA grave (P/F < 150): posição prona ≥ 16 h/dia; considerar bloqueio neuromuscular se assincronia refratária.",
        "Driving pressure ≤ 15 cmH₂O; considerar ECMO/centro de referência se hipoxemia refratária.",
      ],
      next: "seguranca",
    },

    // ── 4. Checagem de segurança ───────────────────────────────────────────────
    seguranca: {
      id: "seguranca",
      type: "decision",
      title: "Pressões dentro do alvo?",
      question: "A pressão de platô está < 30 e a driving pressure ≤ 15 cmH₂O?",
      evidence: [
        "Pressão de platô (pausa inspiratória) reflete a pressão alveolar — manter < 30 cmH₂O.",
        "Driving pressure = platô − PEEP — quanto menor, melhor (≤ 15 associada a melhor desfecho).",
      ],
      options: [
        { id: "sim", label: "Sim — dentro do alvo", next: "monitorizacao" },
        { id: "nao", label: "Não — pressões altas", next: "pressao_alta" },
      ],
    },

    pressao_alta: {
      id: "pressao_alta",
      type: "action",
      title: "Pressão de platô alta — reduzir",
      summary: "Proteger o pulmão: menos volume, checar complacência x resistência.",
      actions: [
        "Reduzir o volume corrente em direção a 4 mL/kg PBW ({vc4} mL); aceitar hipercapnia permissiva (pH ≥ 7,20).",
        "Diferenciar: platô alto = problema de complacência (PEEP/recrutamento, derrame, distensão); pico alto com platô normal = resistência (broncoespasmo, secreção, tubo).",
        "Tratar a causa: broncodilatador, aspiração, drenar derrame/pneumotórax, ajustar PEEP.",
        "Reavaliar platô e driving pressure após cada ajuste.",
      ],
      next: "monitorizacao",
    },

    // ── 5. Monitorização / troubleshooting ─────────────────────────────────────
    monitorizacao: {
      id: "monitorizacao",
      type: "decision",
      title: "Reavaliação e problemas",
      question: "Há hipoxemia persistente, pressão alta ou assincronia/deterioração?",
      evidence: [
        "Deterioração aguda no ventilado → mnemônico DOPES: Deslocamento do tubo, Obstrução, Pneumotórax, Equipamento, empilhamento (Stacking/auto-PEEP).",
        "Hipoxemia: ajustar PEEP/FiO₂, recrutar, tratar a causa; assincronia: rever sedação e ajustes do modo.",
      ],
      options: [
        { id: "problema", label: "Sim — investigar (DOPES)", next: "troubleshooting" },
        { id: "estavel", label: "Não — estável", next: "destino" },
      ],
    },

    troubleshooting: {
      id: "troubleshooting",
      type: "action",
      title: "Troubleshooting — DOPES",
      summary: "Deterioração aguda: desconectar e ventilar à mão ajuda a localizar a causa.",
      actions: [
        "Desconectar do ventilador e ventilar com BVM em O₂ 100% (separa problema do paciente x do circuito).",
        "D: checar posição/profundidade do tubo (deslocamento/seletivo) — capnografia, ausculta. O: obstrução/secreção → aspirar, checar dobra/mordida.",
        "P: pneumotórax (hipertensivo → descompressão imediata). E: equipamento/circuito. S: auto-PEEP/empilhamento → reduzir FR/aumentar tempo expiratório.",
        "Hipoxemia refratária: aumentar PEEP/FiO₂, recrutar, considerar prona/bloqueio neuromuscular; reavaliar gasometria.",
      ],
      next: "destino",
    },

    // ── 6. Destino ─────────────────────────────────────────────────────────────
    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / ventilação contínua",
      summary: "Paciente ventilado → cuidado intensivo e reavaliação contínua.",
      disposition: "icu",
      exitCriteria: [
        "Manter em UTI com parâmetros protetores e sedação/analgesia tituladas (metas leves quando possível).",
        "Gasometria e mecânica (platô, driving pressure) seriadas; ajustar conforme evolução.",
        "Profilaxias do pacote de VM (cabeceira 30–45°, higiene oral, profilaxia de TVP/úlcera), avaliar despertar diário.",
        "Avaliar diariamente prontidão para desmame quando a causa estiver controlada.",
      ],
      targets: [],
    },
  },
};
