import type { DecisionTreeDefinition, TreeValues } from "./core/decision-tree/types";

/**
 * Fluxo interativo da Intubação em Sequência Rápida (ISR) no adulto.
 * Ordem real do procedimento (os "7 P's"): Preparação → Pré-oxigenação →
 * otimização fisiológica/Pré-tratamento → Paralisia com indução (agente conforme
 * a hemodinâmica + bloqueador neuromuscular) → Posicionamento → Passagem do tubo
 * com Prova (capnografia) → Pós-intubação. Inclui decisão de via aérea difícil.
 *
 * Valores coletados por TOQUE (seletores rápidos) com opção de valor próprio.
 * As doses de indução e de bloqueador são calculadas automaticamente pelo peso.
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

function deriveRsi(values: TreeValues): Record<string, string> {
  const out: Record<string, string> = {};
  const peso = toNumber(values.peso);
  if (peso && peso > 0) {
    out.etom = round1(0.3 * peso); // etomidato 0,3 mg/kg
    out.ketaInd = round1(1.5 * peso); // cetamina indução 1,5 mg/kg
    out.ketaShock = round1(1 * peso); // cetamina 1 mg/kg se instável
    out.succLow = round1(1 * peso); // succinilcolina 1 mg/kg
    out.succHigh = round1(1.5 * peso); // succinilcolina 1,5 mg/kg
    out.rocu = round1(1.2 * peso); // rocurônio 1,2 mg/kg
    out.fenta = Math.round(2 * peso).toString(); // fentanil 2 mcg/kg (pré-tratamento opcional)
  } else {
    out.etom = "0,3 mg/kg";
    out.ketaInd = "1,5 mg/kg";
    out.ketaShock = "1 mg/kg";
    out.succLow = "1 mg/kg";
    out.succHigh = "1,5 mg/kg";
    out.rocu = "1,2 mg/kg";
    out.fenta = "2 mcg/kg";
  }
  return out;
}

export const rsiDecisionTree: DecisionTreeDefinition = {
  id: "isr_rsi_adulto",
  version: "2024.1",
  label: "ISR — Via aérea",
  entryNodeId: "entry",
  derive: deriveRsi,
  nodes: {
    // ── 1. Preparação ──────────────────────────────────────────────────────────
    entry: {
      id: "entry",
      type: "action",
      title: "Preparação — indicação e plano",
      summary: "Indicação de via aérea definitiva + checklist antes de qualquer droga.",
      actions: [
        "Confirmar a indicação: falência de oxigenação/ventilação, proteção de via aérea, curso clínico esperado.",
        "Checklist SOAP-ME: Sucção, O₂, Aparato (tubos/lâminas/videolaringoscópio), Posicionamento, Monitor/medicações, ETCO₂.",
        "Monitor completo, oximetria, capnografia pronta, 2 acessos venosos; equipe e funções definidas.",
        "Definir plano A/B/C e ter à mão o kit de via aérea difícil (incl. cricotireoidostomia).",
      ],
      next: "dados",
    },

    dados: {
      id: "dados",
      type: "input",
      title: "Dados do paciente",
      intro: "Toque nos valores (ou adicione). O peso calcula as doses; a PA orienta o indutor.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado",
          unit: "kg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["50", "60", "70", "80", "90", "100"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "pas",
          label: "PA sistólica",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "80", "90", "110", "130", "160"].map((v) => ({ value: v, label: v })),
        },
        {
          id: "spo2",
          label: "SpO₂",
          unit: "%",
          allowCustom: true,
          customKeyboard: "numeric",
          optional: true,
          presets: ["85", "88", "90", "94", "98", "100"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: "preoxigenacao",
    },

    // ── 2. Pré-oxigenação ──────────────────────────────────────────────────────
    preoxigenacao: {
      id: "preoxigenacao",
      type: "action",
      title: "Pré-oxigenação",
      summary: "Encher o reservatório de O₂ para prolongar a apneia segura.",
      actions: [
        "O₂ 100% por 3–5 min (máscara com reservatório) ou 8 respirações de capacidade vital se houver pressa.",
        "Oxigenação apneica: cânula nasal a 15 L/min mantida durante a laringoscopia.",
        "Posição em rampa / olfativa (alinhar meato auditivo à fúrcula); cabeceira elevada se possível.",
        "Se SpO₂ não sobe: considerar VNI/CPAP ou ventilação suave com BVM + PEEP antes de prosseguir.",
      ],
      next: "via_dificil",
    },

    // ── 3. Predição de via aérea difícil ───────────────────────────────────────
    via_dificil: {
      id: "via_dificil",
      type: "decision",
      title: "Via aérea difícil prevista?",
      question: "Há preditores de via aérea/ventilação difícil (LEMON / MOANS)?",
      evidence: [
        "LEMON: Look (anatomia), Evaluate 3-3-2, Mallampati, Obstrução, Neck (mobilidade).",
        "MOANS (ventilação com máscara difícil): Mask seal, Obesidade/Obstrução, Age > 55, No teeth, Stiffness.",
        "Via difícil prevista muda a estratégia: ajuda, videolaringoscopia, plano de resgate, eventual via acordada.",
      ],
      options: [
        { id: "sim", label: "Sim — preditores presentes", next: "via_dificil_plano" },
        { id: "nao", label: "Não — via aparentemente fácil", next: "otimizacao" },
      ],
    },

    via_dificil_plano: {
      id: "via_dificil_plano",
      type: "action",
      title: "Via aérea difícil — preparar resgate",
      summary: "Não bloquear sem um plano de resgate definido.",
      actions: [
        "Chamar ajuda experiente; usar videolaringoscópio de primeira escolha.",
        "Preparar dispositivos de resgate: máscara laríngea, bougie, kit de cricotireoidostomia aberto.",
        "Considerar intubação acordada (com sedação leve e topização) se a anatomia for muito desfavorável.",
        "Definir claramente o gatilho para a via cirúrgica ('não intuba, não ventila').",
      ],
      next: "otimizacao",
    },

    // ── 4. Otimização fisiológica ──────────────────────────────────────────────
    otimizacao: {
      id: "otimizacao",
      type: "decision",
      title: "Otimização hemodinâmica",
      question: "Há instabilidade (PAS < 90 / choque / hipoperfusão)?",
      summary: "PAS informada: {pas} mmHg.",
      evidence: [
        "'Reanimar antes de intubar': a indução + pressão positiva pioram a hipotensão e podem causar PCR peri-intubação.",
        "Otimizar pré-carga e PA reduz o risco de colapso após a indução.",
      ],
      options: [
        { id: "sim", label: "Sim — instável", next: "otimizar" },
        { id: "nao", label: "Não — estável", next: "inducao" },
      ],
    },

    otimizar: {
      id: "otimizar",
      type: "action",
      title: "Reanimar antes de intubar",
      summary: "Estabilizar a hemodinâmica antes da indução.",
      actions: [
        "Volume: cristaloide se responsivo; iniciar/otimizar vasopressor (noradrenalina) para PAS adequada.",
        "Ter push-dose pressor à mão (ex.: fenilefrina ou adrenalina diluída) para hipotensão pós-indução.",
        "Preferir indutor hemodinamicamente estável (cetamina; etomidato em dose reduzida).",
        "Corrigir hipóxia e acidose graves na medida do possível antes de prosseguir.",
      ],
      next: "inducao",
    },

    // ── 5. Indução ─────────────────────────────────────────────────────────────
    inducao: {
      id: "inducao",
      type: "decision",
      title: "Agente de indução",
      question: "Qual o perfil hemodinâmico para escolher o indutor?",
      evidence: [
        "Etomidato: estabilidade hemodinâmica boa; opção padrão no paciente estável.",
        "Cetamina: preferida em choque/instabilidade (mantém PA); cautela em HAS grave/isquemia ativa.",
        "Evitar propofol em instáveis (hipotensão). Pré-tratamento com fentanil {fenta} mcg é opcional (atenuar resposta).",
      ],
      options: [
        { id: "estavel", label: "Estável → etomidato", next: "ind_etomidato" },
        { id: "instavel", label: "Instável/choque → cetamina", next: "ind_cetamina" },
      ],
    },

    ind_etomidato: {
      id: "ind_etomidato",
      type: "action",
      title: "Etomidato — dose calculada",
      summary: "Indutor de escolha no paciente hemodinamicamente estável.",
      actions: [
        "Etomidato {etom} mg IV (0,3 mg/kg) em bolus.",
        "Início rápido (~30–60 s); administrar imediatamente antes do bloqueador.",
        "Alternativa: cetamina {ketaInd} mg (1,5 mg/kg) se preferir.",
        "Preparar o bloqueador neuromuscular para a sequência.",
      ],
      next: "bloqueador",
    },

    ind_cetamina: {
      id: "ind_cetamina",
      type: "action",
      title: "Cetamina — dose calculada",
      summary: "Preferida na instabilidade — preserva a pressão arterial.",
      actions: [
        "Cetamina {ketaShock} mg IV (1 mg/kg) no instável/choque; até {ketaInd} mg (1,5 mg/kg) se mais estável.",
        "Manter vasopressor/push-dose disponível mesmo com cetamina.",
        "Cautela em isquemia miocárdica ativa / HAS grave.",
        "Preparar o bloqueador neuromuscular para a sequência.",
      ],
      next: "bloqueador",
    },

    // ── 6. Bloqueador neuromuscular ────────────────────────────────────────────
    bloqueador: {
      id: "bloqueador",
      type: "decision",
      title: "Bloqueador neuromuscular",
      question: "A succinilcolina está contraindicada?",
      evidence: [
        "Contraindicações à succinilcolina: hipercalemia ou risco (IRC, rabdomiólise), queimadura/trauma/denervação > 48–72 h, doença neuromuscular, história de hipertermia maligna.",
        "Succinilcolina: início ~45 s, duração curta (~6–10 min).",
        "Rocurônio: alternativa segura nesses casos; duração longa (~45–60 min) — garantir plano de resgate.",
      ],
      options: [
        { id: "nao", label: "Não — usar succinilcolina", next: "blq_succinilcolina" },
        { id: "sim", label: "Sim — usar rocurônio", next: "blq_rocuronio" },
      ],
    },

    blq_succinilcolina: {
      id: "blq_succinilcolina",
      type: "action",
      title: "Succinilcolina — dose calculada",
      summary: "Início rápido e duração curta.",
      actions: [
        "Succinilcolina {succLow}–{succHigh} mg IV (1–1,5 mg/kg) em bolus, logo após o indutor.",
        "Aguardar a fasciculação cessar / relaxamento (~45–60 s) antes da laringoscopia.",
        "Se contraindicação surgir, trocar por rocurônio {rocu} mg.",
        "Prosseguir para o posicionamento e a passagem do tubo.",
      ],
      next: "intubacao",
    },

    blq_rocuronio: {
      id: "blq_rocuronio",
      type: "action",
      title: "Rocurônio — dose calculada",
      summary: "Alternativa quando a succinilcolina é contraindicada.",
      actions: [
        "Rocurônio {rocu} mg IV (1,2 mg/kg) em bolus, logo após o indutor.",
        "Início ~60 s; duração longa (~45–60 min) — ter plano de resgate definido.",
        "Sugamadex disponível se reversão for necessária (se acessível).",
        "Prosseguir para o posicionamento e a passagem do tubo.",
      ],
      next: "intubacao",
    },

    // ── 7. Passagem do tubo ────────────────────────────────────────────────────
    intubacao: {
      id: "intubacao",
      type: "action",
      title: "Posicionamento e passagem do tubo",
      summary: "Tentativa otimizada; limitar tempo de apneia.",
      actions: [
        "Laringoscopia (direta ou vídeo); usar bougie se a visão for difícil; manobra BURP/manipulação laríngea externa se necessário.",
        "Passar o tubo sob visão direta da glote; insuflar o cuff.",
        "Limitar a tentativa a ~30 s ou até SpO₂ ~90% → reoxigenar com BVM entre tentativas.",
        "Após 2–3 tentativas sem sucesso, acionar o plano de via aérea difícil.",
      ],
      next: "confirmacao",
    },

    confirmacao: {
      id: "confirmacao",
      type: "decision",
      title: "Confirmação (Prova)",
      question: "A capnografia (ETCO₂) confirma a posição traqueal?",
      evidence: [
        "Capnografia em forma de onda é o padrão-ouro para confirmar a intubação traqueal.",
        "Confirmar também com ausculta (5 pontos), expansão torácica e melhora da SpO₂; RX para profundidade.",
      ],
      options: [
        { id: "sim", label: "Sim — ETCO₂ confirma traqueia", next: "pos_intubacao" },
        { id: "nao", label: "Não — sem confirmação / esôfago", next: "falha" },
      ],
    },

    falha: {
      id: "falha",
      type: "action",
      title: "Sem confirmação — corrigir e reabordar",
      summary: "Não insistir às cegas; oxigenar e reabordar com plano.",
      actions: [
        "Se intubação esofágica: retirar o tubo, ventilar com BVM e reoxigenar.",
        "Trocar para videolaringoscópio / operador mais experiente; usar bougie.",
        "Considerar dispositivo supraglótico (máscara laríngea) como resgate ventilatório.",
        "'Não intuba, não ventila' com hipóxia → cricotireoidostomia imediata.",
      ],
      next: "intubacao",
    },

    // ── 8. Pós-intubação ───────────────────────────────────────────────────────
    pos_intubacao: {
      id: "pos_intubacao",
      type: "action",
      title: "Manejo pós-intubação",
      summary: "Confirmar, fixar, sedar e ventilar com segurança.",
      actions: [
        "Fixar o tubo; registrar a profundidade; RX de tórax para conferir o posicionamento.",
        "Sedação + analgesia contínuas (ex.: fentanil + propofol/midazolam ou dexmedetomidina) — não deixar o paciente paralisado sem sedação.",
        "Ajustar o ventilador: VC 6 mL/kg de peso predito, PEEP, FiO₂ para SpO₂-alvo, monitorar pressão de platô.",
        "Reavaliar PA (hipotensão pós-intubação é comum), capnografia contínua e sedação.",
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "transition",
      title: "UTI / cuidado pós-intubação",
      summary: "Paciente intubado → monitorização intensiva.",
      disposition: "icu",
      exitCriteria: [
        "Transferir para UTI com ventilação mecânica e sedação tituladas.",
        "Manter capnografia, oximetria e monitorização hemodinâmica contínuas.",
        "Tratar a causa de base que motivou a via aérea definitiva.",
        "Reavaliar parâmetros ventilatórios e sedação periodicamente.",
      ],
      targets: [],
    },
  },
};
