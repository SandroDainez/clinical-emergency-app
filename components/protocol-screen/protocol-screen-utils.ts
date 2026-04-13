import type { AuxiliaryPanel, ProtocolState } from "../../clinical-engine";

function formatOptionLabel(value: string, stateId?: string) {
  if (value.startsWith("solucao_padrao:")) {
    const parts = value.split(":");
    return parts.slice(2).join(":") || parts[1] || value;
  }

  if (stateId?.startsWith("avaliar_ritmo")) {
    if (value === "chocavel") {
      return "Chocável (FV / TV sem pulso)";
    }

    if (value === "nao_chocavel") {
      return "Não chocável (AESP / assistolia)";
    }
  }

  if (stateId === "checar_respiracao_pulso") {
    if (value === "sem_pulso") {
      return "Sem pulso";
    }

    if (value === "com_pulso") {
      return "Tem pulso";
    }

    if (value === "encerrar") {
      return "Encerrar avaliação";
    }
  }

  if (stateId === "tipo_desfibrilador") {
    if (value === "bifasico") {
      return "Bifásico (120 a 200 J ou carga máxima)";
    }

    if (value === "monofasico") {
      return "Monofásico (360 J)";
    }
  }

  const labels: Record<string, string> = {
    chocavel: "Chocável",
    nao_chocavel: "Não chocável",
    rosc: "ROSC",
    encerrar: "Encerrar",
    bifasico: "Bifásico",
    monofasico: "Monofásico",
    alta_probabilidade_ou_choque: "Alta probabilidade / choque",
    choque_ou_alta_probabilidade: "Choque / alta probabilidade",
    suspeita_choque_septico: "Sepse com suspeita de choque séptico",
    sepse_alto_risco: "Sepse",
    sepse_risco_moderado: "Infecção suspeita sem critérios suficientes para sepse",
    possivel_sepse_sem_choque: "Possível sepse sem choque",
    baixa_probabilidade: "Baixa probabilidade",
    incerta_reavaliar: "Incerteza / reavaliar",
    avaliar_perfusao: "Avaliar perfusão",
    perfusao_adequada: "Perfusão adequada",
    seguir_hemodinamica: "Seguir para hemodinâmica",
    reavaliar_clinicamente: "Reavaliar clinicamente",
    abrir_choque_septico: "Abrir painel de choque séptico",
    revisar_foco: "Revisar foco infeccioso",
    concluir_plano_inicial: "Concluir plano inicial",
    retornar_ao_bundle: "Retornar ao bundle",
    meta_atingida: "Meta de PAM atingida",
    choque_refratario: "Choque refratário",
    pam_abaixo_65: "PAM abaixo de 65",
    considerar_inotropico: "Considerar inotrópico",
    source_control: "Controle de foco",
    sim: "Sim",
    nao: "Não",
    uti: "Destino UTI",
    enfermaria: "Enfermaria",
    observacao_monitorizacao: "Observação / monitorização",
    continuar_reavaliando: "Continuar reavaliação",
    hipoperfusao_ou_hipotensao: "Hipoperfusão / hipotensão",
    definir_destino: "Definir destino",
    concluir: "Concluir",
    ajustar_infusao: "Ajustar infusão",
    escolher_outra_droga: "Escolher outra droga",
    dose_para_velocidade: "Calcular dose → mL/h",
    velocidade_para_dose: "Calcular mL/h → dose",
    configuracao_manual_sf: "Configuração manual • SF",
    configuracao_manual_sg: "Configuração manual • SG",
    noradrenalina: "Noradrenalina",
    adrenalina: "Adrenalina",
    vasopressina: "Vasopressina",
    dopamina: "Dopamina",
    dobutamina: "Dobutamina",
  };

  if (labels[value]) {
    return labels[value];
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function hasSelectedPresetValue(
  currentValue: string,
  presetValue: string,
  mode: "replace" | "toggle_token" | undefined
) {
  if (!currentValue) {
    return false;
  }

  if (mode === "toggle_token") {
    return currentValue
      .split(" | ")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .includes(presetValue.trim().toLowerCase());
  }

  return currentValue.trim().toLowerCase() === presetValue.trim().toLowerCase();
}

function groupAuxiliaryFieldsBySection(auxiliaryPanel: AuxiliaryPanel | null) {
  if (!auxiliaryPanel) {
    return [];
  }

  return Object.entries(
    auxiliaryPanel.fields.reduce<Record<string, AuxiliaryPanel["fields"]>>((groups, field) => {
      const section = field.section ?? "Dados clínicos";
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
      return groups;
    }, {})
  );
}

function getStateBadgeLabel(stateType: ProtocolState["type"]) {
  if (stateType === "question") {
    return "Decisão clínica";
  }

  if (stateType === "end") {
    return "Desfecho";
  }

  return "Conduta";
}

function getOptionSublabel(value: string, stateId?: string): string | undefined {
  if (stateId === "checar_respiracao_pulso") {
    if (value === "sem_pulso") {
      return "Não respira normalmente";
    }

    if (value === "com_pulso") {
      return "Respira normalmente";
    }
  }

  return undefined;
}

export {
  formatOptionLabel,
  getOptionSublabel,
  getStateBadgeLabel,
  groupAuxiliaryFieldsBySection,
  hasSelectedPresetValue,
};
