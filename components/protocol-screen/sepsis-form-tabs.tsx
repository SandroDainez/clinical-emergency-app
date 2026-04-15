import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { AuxiliaryPanel } from "../../clinical-engine";
import { DKA_HHS_SECTION_TO_TAB, DKA_HHS_TABS } from "./dka-hhs-tab-config";
import { VENT_SECTION_TO_TAB, VENT_TABS } from "./ventilation-tab-config";
import { ANAFILAXIA_SECTION_TO_TAB, ANAFILAXIA_TABS } from "./anafilaxia-tab-config";

// ─── Tab definitions ──────────────────────────────────────────────────────────
const SECTION_TO_TAB: Record<string, number> = {
  "Identificação do paciente": 0,
  "Antecedentes": 0,
  "Apresentação clínica": 1,
  "Sinais vitais": 1,
  "Exame físico": 1,
  "Hipótese diagnóstica": 2,
  "Exames complementares": 2,
  "Estabilização": 3,
  "Antimicrobiano": 3,
  "Condutas e plano terapêutico": 4,
  // UTI sub-sections all go to tab 5
  "UTI — Paciente Internado": 5,
  "UTI — Contexto da Avaliação": 5,
  "UTI — Estado Neurológico": 5,
  "UTI — Ventilação Mecânica": 5,
  "UTI — Dispositivos Invasivos": 5,
  "UTI — Antibioticoterapia": 5,
  "UTI — Vasopressores": 5,
  "UTI — Notas Clínicas": 5,
  // New focused sections
  "UTI — Triagem do Atendimento": 5,
  "UTI — Foco da Piora": 5,
  "UTI — Suporte Hemodinâmico": 5,
  "UTI — Sedação e Neurológico": 5,
  "UTI — Isolamento": 5,
  "UTI — Destino e Planejamento": 5,
};

const TABS_EMERGENCY = [
  { id: 0, icon: "👤", label: "Paciente",      step: "1",
    guide: "Dados demográficos, comorbidades, medicações e alergias." },
  { id: 1, icon: "🩺", label: "Ex. Clínico",   step: "2",
    guide: "Sinais vitais (PAM e SOFA automáticos), apresentação clínica e exame físico." },
  { id: 2, icon: "🔬", label: "Diagnóstico",   step: "3",
    guide: "Classificação, exames complementares. Lactato e creatinina são prioritários." },
  { id: 3, icon: "🚨", label: "Estabilização", step: "4",
    guide: "O₂, volume, acessos vasculares, vasopressor, IOT e ATB empírico na 1ª hora." },
  { id: 4, icon: "📋", label: "Conduta",       step: "5",
    guide: "Isolamento, destino e condutas complementares." },
];

/** Edema agudo de pulmão — 4 etapas, barra lateral */
const EAP_SECTION_TO_TAB: Record<string, number> = {
  Identificação: 0,
  "Comorbidades e risco": 0,
  Apresentação: 1,
  "Sinais vitais": 1,
  "Exame físico": 1,
  "Diagnóstico diferencial": 1,
  "Tratamento imediato": 2,
  Monitorização: 2,
  "Evolução e destino": 3,
};

const EAP_TABS = [
  { id: 0, icon: "👤", label: "Paciente", step: "1",
    guide: "Identificação, comorbidades cardiovasculares e alergias." },
  { id: 1, icon: "🩺", label: "Clínico", step: "2",
    guide: "Apresentação, sinais vitais (PAM e SpO₂/FiO₂ automáticos) e exame físico." },
  { id: 2, icon: "💊", label: "Tratamento", step: "3",
    guide: "Condutas imediatas, VMNI e monitorização. Veja sugestões abaixo conforme PA e SpO₂." },
  { id: 3, icon: "📈", label: "Evolução", step: "4",
    guide: "Resposta ao tratamento, destino e notas." },
];

const TABS_ICU = [
  { id: 0, icon: "👤", label: "Paciente",      step: "1",
    guide: "Dados demográficos, comorbidades, medicações e alergias." },
  { id: 1, icon: "🩺", label: "Ex. Clínico",   step: "2",
    guide: "Sinais vitais (PAM e SOFA automáticos), apresentação clínica e exame físico." },
  { id: 2, icon: "🔬", label: "Diagnóstico",   step: "3",
    guide: "Classificação Sepsis-3 (SOFA ≥ 2), exames e lactato." },
  { id: 3, icon: "🚨", label: "Estabilização", step: "4",
    guide: "O₂, volume, vasopressor, IOT e ATB empírico com ajuste renal." },
  { id: 4, icon: "📋", label: "Conduta",       step: "5",
    guide: "Isolamento, destino e condutas complementares." },
  { id: 5, icon: "🏥", label: "UTI",           step: "6",
    guide: "RASS, P/F, culturas, escalonamento ATB, vasopressores e condutas avançadas." },
];

// ─── Token helpers ─────────────────────────────────────────────────────────────
function tokensFrom(val: string) {
  return val.split(" | ").map((t) => t.trim()).filter(Boolean);
}
function hasToken(val: string, token: string) {
  return tokensFrom(val).some((t) => t.toLowerCase() === token.trim().toLowerCase());
}
function toggleToken(val: string, token: string) {
  const tokens = tokensFrom(val);
  const lc = token.trim().toLowerCase();
  const exists = tokens.some((t) => t.toLowerCase() === lc);
  return (exists ? tokens.filter((t) => t.toLowerCase() !== lc) : [...tokens, token.trim()]).join(" | ");
}

function sameValue(a?: string, b?: string) {
  return (a ?? "").trim().toLowerCase() === (b ?? "").trim().toLowerCase();
}

type FieldPreset = { label: string; value: string };
type GcsOption = { score: number; label: string; detail: string };

function normalizeFieldKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function makePresets(values: string[]): FieldPreset[] {
  return values.map((value) => ({ label: value, value }));
}

function splitPresetPresentation(label: string) {
  const trimmed = label.trim();
  const parenMatch = trimmed.match(/^(.*?)\s*\((.+)\)$/);
  if (parenMatch) {
    return {
      title: parenMatch[1]!.trim(),
      detail: parenMatch[2]!.trim(),
    };
  }

  const slashParts = trimmed.split(" / ").map((part) => part.trim()).filter(Boolean);
  if (slashParts.length >= 2 && slashParts[0] && slashParts[0].length <= 28) {
    return {
      title: slashParts[0],
      detail: slashParts.slice(1).join(" · "),
    };
  }

  return {
    title: trimmed,
    detail: "",
  };
}

const GCS_EYE_OPTIONS: GcsOption[] = [
  { score: 4, label: "4", detail: "Abre os olhos espontaneamente" },
  { score: 3, label: "3", detail: "Abre os olhos ao comando / voz" },
  { score: 2, label: "2", detail: "Abre os olhos à dor" },
  { score: 1, label: "1", detail: "Não abre os olhos" },
];

const GCS_VERBAL_OPTIONS: GcsOption[] = [
  { score: 5, label: "5", detail: "Orientado, conversa normal" },
  { score: 4, label: "4", detail: "Confuso, mas fala frases" },
  { score: 3, label: "3", detail: "Palavras inapropriadas" },
  { score: 2, label: "2", detail: "Sons incompreensíveis" },
  { score: 1, label: "1", detail: "Sem resposta verbal" },
];

const GCS_MOTOR_OPTIONS: GcsOption[] = [
  { score: 6, label: "6", detail: "Obedece comandos" },
  { score: 5, label: "5", detail: "Localiza a dor" },
  { score: 4, label: "4", detail: "Retirada à dor" },
  { score: 3, label: "3", detail: "Flexão anormal" },
  { score: 2, label: "2", detail: "Extensão anormal" },
  { score: 1, label: "1", detail: "Sem resposta motora" },
];

function isGcsField(field: SheetField) {
  const text = normalizeFieldKey(`${field.id} ${field.label}`);
  return text.includes("gcs") || text.includes("glasgow");
}

function parseGcsScore(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function buildFallbackPresets(field: SheetField): FieldPreset[] {
  const key = `${field.id} ${field.label} ${field.section ?? ""} ${field.helperText ?? ""}`;
  const text = normalizeFieldKey(key);
  const isNumeric = field.keyboardType === "numeric";

  if (field.presets?.length) {
    return field.presets;
  }

  if (text.includes("sexo")) {
    return makePresets(["Masculino", "Feminino"]);
  }
  if (text.includes("idade")) {
    return makePresets(["18", "20", "25", "30", "35", "40", "45", "50", "55", "60", "65", "70", "75", "80"]);
  }
  if (text.includes("peso")) {
    return makePresets(["3", "5", "10", "20", "40", "60", "80", "100", "120"]);
  }
  if (text.includes("altura")) {
    return makePresets(["90", "120", "150", "160", "170", "180", "190"]);
  }
  if (text.includes("tempo") || text.includes("inicio") || text.includes("evolucao")) {
    return makePresets(["5 min", "10 min", "30 min", "1 h", "3 h", "6 h", "12 h", "24 h", "48 h"]);
  }
  if (text.includes("alerg")) {
    return makePresets([
      "Sem alergias conhecidas",
      "Alergia medicamentosa",
      "Alergia alimentar",
      "Alergia a contraste",
      "Alergia a beta-lactâmico",
      "Alergia a dipirona",
    ]);
  }
  if (text.includes("comorb")) {
    return makePresets([
      "HAS",
      "DM",
      "DRC",
      "DPOC",
      "Asma",
      "IC",
      "DAC",
      "FA",
      "Cirrose",
      "Neoplasia",
      "Imunossupressão",
      "Sem comorbidades conhecidas",
    ]);
  }
  if (text.includes("medic")) {
    return makePresets([
      "Sem uso relevante",
      "Insulina",
      "Metformina",
      "Anti-hipertensivos",
      "Diurético",
      "Corticoide",
      "Anticoagulante",
      "Antibiótico recente",
      "Broncodilatador",
    ]);
  }
  if (text.includes("queixa") || text.includes("sintoma") || text.includes("apresentacao")) {
    return makePresets([
      "Febre",
      "Dispneia",
      "Dor torácica",
      "Dor abdominal",
      "Náuseas / vómitos",
      "Tosse",
      "Rebaixamento do sensório",
      "Hipotensão",
      "Taquicardia",
    ]);
  }
  if (text.includes("foco") || text.includes("source") || text.includes("origem")) {
    return makePresets([
      "Pulmonar",
      "Urinário",
      "Abdominal",
      "Pele / partes moles",
      "Cateter",
      "SNC",
      "Osteoarticular",
      "Corrente sanguínea",
      "Indeterminado",
    ]);
  }
  if (text.includes("destino")) {
    return makePresets([
      "Alta",
      "Observação",
      "Sala de emergência",
      "Enfermaria",
      "Unidade intermediária",
      "UTI",
      "Centro cirúrgico",
      "Hemodinâmica",
      "Transferência",
    ]);
  }
  if (text.includes("resposta")) {
    return makePresets(["Melhora importante", "Melhora parcial", "Estável", "Sem resposta", "Piora"]);
  }
  if (text.includes("oxigen")) {
    return makePresets([
      "Ar ambiente",
      "Cateter nasal 2 L/min",
      "Cateter nasal 5 L/min",
      "Máscara simples",
      "Máscara com reservatório",
      "Alto fluxo",
      "VMNI",
      "IOT / VM",
    ]);
  }
  if (text.includes("acesso")) {
    return makePresets([
      "Periférico",
      "Dois acessos periféricos",
      "Intraósseo",
      "Central",
      "PIC",
      "Sem acesso",
    ]);
  }
  if (text.includes("hemodinam")) {
    return makePresets(["Estável", "Taquicardia compensada", "Hipotensão", "Choque", "Em vasopressor"]);
  }
  if (text.includes("diurese")) {
    return makePresets(["Presente", "Adequada", "Reduzida", "Oligúria", "Anúria"]);
  }
  if (text.includes("isolamento")) {
    return makePresets(["Padrão", "Contato", "Gotículas", "Aerossóis", "Contato + gotículas"]);
  }
  if (text.includes("dial")) {
    return makePresets(["Não", "HD", "CRRT", "CAPD", "Desconhecido"]);
  }
  if (text.includes("rass")) {
    return makePresets(["+2", "+1", "0", "-1", "-2", "-3", "-4", "-5"]);
  }
  if (text.includes("glasgow") || text.includes("gcs")) {
    return makePresets(["15", "13", "12", "10", "8", "6", "3"]);
  }
  if (text.includes("fc") || text.includes("heart rate")) {
    return makePresets(["40", "50", "60", "70", "80", "90", "100", "110", "120", "130", "140", "150", "160", "180"]);
  }
  if (text.includes("pas") || text.includes("sistol")) {
    return makePresets(["60", "70", "80", "90", "100", "110", "120", "130", "140", "150", "160", "180", "200", "220"]);
  }
  if (text.includes("pad") || text.includes("diastol")) {
    return makePresets(["30", "40", "50", "60", "70", "80", "90", "100", "110", "120"]);
  }
  if (text.includes("pam") || text.includes("map")) {
    return makePresets(["55", "60", "65", "70", "75", "85", "95"]);
  }
  if (text.includes("fr") || text.includes("resp/min") || text.includes("irpm")) {
    return makePresets(["8", "12", "16", "20", "24", "28", "35", "40"]);
  }
  if (text.includes("fio2")) {
    return makePresets(["0,21", "0,3", "0,4", "0,5", "0,6", "0,8", "1,0"]);
  }
  if (text.includes("peep")) {
    return makePresets(["5", "8", "10", "12", "14", "16", "18"]);
  }
  if (text.includes("vt") || text.includes("volume corrente")) {
    return makePresets(["250", "300", "350", "420", "500", "550", "600"]);
  }
  if (text.includes("modo no ventilador") || text.includes("vent mode")) {
    return makePresets(["VC-AC", "PC-AC", "PRVC / VC+", "PSV", "SIMV", "CPAP", "VMNI"]);
  }
  if (text.includes("cenario clinico") || text.includes("cenario principal")) {
    return makePresets([
      "ARDS / SDRA",
      "Sepse",
      "DPOC / asma",
      "Pós-operatório",
      "Neurocrítico",
      "Acidose metabólica",
      "Edema agudo de pulmão",
    ]);
  }
  if (text.includes("plat")) {
    return makePresets(["18", "22", "25", "28", "30", "35"]);
  }
  if (text.includes("spo2")) {
    return makePresets(["82", "88", "92", "95", "98", "100"]);
  }
  if (text.includes("ph")) {
    return makePresets(["6,9", "7,0", "7,1", "7,2", "7,3", "7,4", "7,5"]);
  }
  if (text.includes("paco2")) {
    return makePresets(["20", "30", "40", "50", "60", "80"]);
  }
  if (text.includes("pao2")) {
    return makePresets(["40", "55", "70", "90", "120", "200"]);
  }
  if (text.includes("lact")) {
    return makePresets(["0,8", "1,0", "2,0", "3,0", "4,0", "6,0", "8,0"]);
  }
  if (text.includes("creatin")) {
    return makePresets(["0,6", "0,8", "1,2", "2,0", "3,5", "5,0"]);
  }
  if (text.includes("glic") || text.includes("glucose")) {
    return makePresets(["60", "70", "180", "250", "400", "600", "800"]);
  }
  if (text.includes("sodio") || text.includes("na+")) {
    return makePresets(["120", "130", "135", "140", "150", "160"]);
  }
  if (text.includes("potass") || text.includes("k+")) {
    return makePresets(["2,5", "3,0", "3,5", "4,0", "5,0", "6,0"]);
  }
  if (text.includes("cloreto") || text.includes("cl-")) {
    return makePresets(["90", "95", "100", "110", "120"]);
  }
  if (text.includes("ureia") || text.includes("bun")) {
    return makePresets(["10", "20", "40", "80", "120", "180"]);
  }
  if (text.includes("bicarbon")) {
    return makePresets(["5", "10", "15", "20", "24"]);
  }
  if (text.includes("osmolar")) {
    return makePresets(["290", "310", "330", "350", "380"]);
  }
  if (text.includes("ceton")) {
    return makePresets(["Negativo", "Traços", "+", "++", "+++", "Elevado"]);
  }
  if (text.includes("precipit")) {
    return makePresets([
      "Infecção",
      "Omissão de insulina",
      "IAM / SCA",
      "AVC",
      "Álcool / drogas",
      "Medicamento",
      "Gestação",
    ]);
  }
  if (text.includes("insulina")) {
    return makePresets([
      "Não iniciada",
      "Bólus inicial",
      "Infusão 0,05 U/kg/h",
      "Infusão 0,1 U/kg/h",
      "Suspensa temporariamente",
    ]);
  }
  if (text.includes("potassio") || text.includes("reposicao de k")) {
    return makePresets([
      "Sem reposição",
      "20 mEq",
      "40 mEq",
      "60 mEq",
      "Aguardar K antes de iniciar insulina",
    ]);
  }
  if (text.includes("hidrata") || text.includes("cristaloide") || text.includes("volume")) {
    return makePresets([
      "500 mL",
      "1000 mL",
      "20 mL/kg",
      "30 mL/kg",
      "Manutenção",
      "Restrição hídrica",
    ]);
  }
  if (text.includes("adrenalina")) {
    return makePresets([
      "0,3 mg IM",
      "0,5 mg IM",
      "1 dose realizada",
      "2 doses realizadas",
      "Em infusão",
    ]);
  }
  if (text.includes("salbutamol")) {
    return makePresets(["Não realizado", "Nebulização", "Aerossol dosimetrado"]);
  }
  if (text.includes("corticoide")) {
    return makePresets(["Não realizado", "Hidrocortisona", "Metilprednisolona", "Dexametasona"]);
  }
  if (text.includes("anti-h1") || text.includes("anti h1")) {
    return makePresets(["Não realizado", "Difenidramina", "Prometazina"]);
  }
  if (text.includes("anti-h2") || text.includes("anti h2")) {
    return makePresets(["Não realizado", "Ranitidina", "Famotidina"]);
  }
  if (text.includes("exposicao") || text.includes("gatilho")) {
    return makePresets([
      "Alimento",
      "Medicamento",
      "Veneno / inseto",
      "Contraste",
      "Exercício",
      "Látex",
      "Idiopático",
      "Desconhecido",
    ]);
  }
  if (text.includes("manifest")) {
    return makePresets([
      "Urticária / prurido",
      "Angioedema",
      "Dispneia / sibilos",
      "Estridor",
      "Hipotensão / choque",
      "Síncope",
      "Náuseas / vómitos",
    ]);
  }
  if (text.includes("observacao")) {
    return makePresets([
      "Observação 4-6 h",
      "Observação 12 h",
      "Observação 24 h",
      "Alta após observação",
    ]);
  }
  if (text.includes("anotac") || text.includes("nota") || text.includes("plano")) {
    return makePresets([
      "Reavaliar em 30 min",
      "Manter monitorização",
      "Discutido com UTI",
      "Aguardando exames",
      "Aguardando leito",
    ]);
  }
  if (isNumeric) {
    return makePresets(["0", "1", "5", "10", "20", "50"]);
  }

  return makePresets([
    "Não informado",
    "Sem alterações relevantes",
    "Em avaliação",
    "Aguardando exames",
    "A definir",
  ]);
}

// ─── Bottom Sheet Picker ───────────────────────────────────────────────────────
type SheetField = AuxiliaryPanel["fields"][number];

function PickerSheet({
  field, visible, onClose, onSelect,
}: {
  field: SheetField;
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string, val: string) => void;
}) {
  const isMulti   = field.presetMode === "toggle_token";
  const isNumeric = field.keyboardType === "numeric";
  const gcsField = isGcsField(field);

  const customInputLabel = (() => {
    const id = field.id ?? "";
    if (id === "sex" || id === "gender") return "Outro:";
    if (id === "exposureType") return "Outros:";
    if (id.toLowerCase().includes("exam") || id.toLowerCase().includes("investigat") || id === "investigationPlan") return "Outros exames:";
    if (isMulti) return "Outros:";
    if (isNumeric) return "Outro valor:";
    return "Outro:";
  })();

  const [search,     setSearch]     = useState("");
  const [localValue, setLocalValue] = useState(field.value);
  const [otherText,  setOtherText]  = useState("");
  const [gcsEye, setGcsEye] = useState<number | null>(null);
  const [gcsVerbal, setGcsVerbal] = useState<number | null>(null);
  const [gcsMotor, setGcsMotor] = useState<number | null>(null);
  const presets = buildFallbackPresets(field);
  const hasPresets = presets.length > 0;

  // Only initialise from field.value when the sheet OPENS.
  // Removing field.value from deps prevents engine re-renders from overwriting
  // locally-accumulated multi-select tokens while the sheet is open.
  const fieldValueRef = { current: field.value };
  useEffect(() => {
    if (visible) {
      setLocalValue(fieldValueRef.current);
      setSearch("");
      setOtherText("");
      const score = parseGcsScore(fieldValueRef.current);
      setGcsEye(null);
      setGcsVerbal(null);
      setGcsMotor(score && score >= 3 && score <= 15 ? score - 5 : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const filtered = search.trim()
    ? presets.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()))
    : presets;

  const confirm = () => onClose();
  const gcsTotal =
    gcsEye !== null && gcsVerbal !== null && gcsMotor !== null ? gcsEye + gcsVerbal + gcsMotor : null;

  const pick = (p: { label: string; value: string }) => {
    if (isMulti) {
      const next = toggleToken(localValue, p.value);
      setLocalValue(next);
      onSelect(field.id, p.value); // engine update each tap
    } else {
      const active = localValue === p.value || field.value === p.value;
      onSelect(field.id, active ? "" : p.value);
      onClose();
    }
  };

  const submitOther = () => {
    const v = otherText.trim();
    if (!v) return;
    if (isMulti) {
      const next = toggleToken(localValue, v);
      setLocalValue(next);
      onSelect(field.id, v);
    } else {
      onSelect(field.id, v);
      onClose();
    }
    setOtherText("");
  };

  const applyGcsCalculator = () => {
    if (gcsTotal === null) {
      return;
    }
    onSelect(field.id, String(gcsTotal));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sh.backdrop} onPress={onClose} />
      <View style={sh.sheet}>
        <View style={sh.handle} />

        {/* Header */}
        <View style={sh.header}>
          <View style={{ flex: 1 }}>
            <Text style={sh.title}>{field.label}</Text>
            {field.unit ? <Text style={sh.unit}>{field.unit}</Text> : null}
          </View>
          {isMulti ? (
            <Pressable style={sh.confirmBtn} onPress={confirm}>
              <Text style={sh.confirmTxt}>Confirmar</Text>
            </Pressable>
          ) : (
            <Pressable style={sh.closeBtn} onPress={onClose}>
              <Text style={sh.closeTxt}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Search */}
        {presets.length > 6 ? (
          <View style={sh.searchWrap}>
            <Text style={sh.searchIcon}>🔍</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar..."
              style={sh.searchInput}
              placeholderTextColor="#64748b"
              autoCorrect={false}
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch("")}>
                <Text style={sh.searchClear}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Suggestion banner (shown when field is empty and engine has a suggestion) */}
        {field.suggestedValue && !localValue.trim() ? (
          <Pressable
            style={sh.suggestionBanner}
            onPress={() => {
              onSelect(field.id, field.suggestedValue!);
              setLocalValue(field.suggestedValue!);
            }}>
            <View style={sh.suggestionLeft}>
              <Text style={sh.suggestionTag}>Auto</Text>
              <Text style={sh.suggestionText} numberOfLines={2}>
                {field.suggestedLabel ?? field.suggestedValue}
              </Text>
            </View>
            <Text style={sh.suggestionAccept}>Aceitar ›</Text>
          </Pressable>
        ) : null}

        {/* Options */}
        <ScrollView
          style={sh.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {gcsField ? (
            <View style={sh.gcsCard}>
              <Text style={sh.gcsTitle}>Calculadora Glasgow</Text>
              <Text style={sh.gcsHint}>Selecione ocular, verbal e motora. O total é calculado automaticamente.</Text>

              <View style={sh.gcsSection}>
                <Text style={sh.gcsSectionTitle}>Abertura ocular</Text>
                {GCS_EYE_OPTIONS.map((option) => (
                  <Pressable
                    key={`eye-${option.score}`}
                    style={[sh.gcsOption, gcsEye === option.score && sh.gcsOptionActive]}
                    onPress={() => setGcsEye(option.score)}>
                    <Text style={[sh.gcsScore, gcsEye === option.score && sh.gcsScoreActive]}>{option.label}</Text>
                    <Text style={[sh.gcsOptionText, gcsEye === option.score && sh.gcsOptionTextActive]}>{option.detail}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={sh.gcsSection}>
                <Text style={sh.gcsSectionTitle}>Resposta verbal</Text>
                {GCS_VERBAL_OPTIONS.map((option) => (
                  <Pressable
                    key={`verbal-${option.score}`}
                    style={[sh.gcsOption, gcsVerbal === option.score && sh.gcsOptionActive]}
                    onPress={() => setGcsVerbal(option.score)}>
                    <Text style={[sh.gcsScore, gcsVerbal === option.score && sh.gcsScoreActive]}>{option.label}</Text>
                    <Text style={[sh.gcsOptionText, gcsVerbal === option.score && sh.gcsOptionTextActive]}>{option.detail}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={sh.gcsSection}>
                <Text style={sh.gcsSectionTitle}>Resposta motora</Text>
                {GCS_MOTOR_OPTIONS.map((option) => (
                  <Pressable
                    key={`motor-${option.score}`}
                    style={[sh.gcsOption, gcsMotor === option.score && sh.gcsOptionActive]}
                    onPress={() => setGcsMotor(option.score)}>
                    <Text style={[sh.gcsScore, gcsMotor === option.score && sh.gcsScoreActive]}>{option.label}</Text>
                    <Text style={[sh.gcsOptionText, gcsMotor === option.score && sh.gcsOptionTextActive]}>{option.detail}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={sh.gcsFooter}>
                <View>
                  <Text style={sh.gcsTotalLabel}>Total Glasgow</Text>
                  <Text style={sh.gcsTotalValue}>{gcsTotal ?? "—"}</Text>
                </View>
                <Pressable
                  style={[sh.gcsApplyBtn, gcsTotal === null && sh.gcsApplyBtnDisabled]}
                  onPress={applyGcsCalculator}>
                  <Text style={sh.gcsApplyTxt}>Usar total</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {hasPresets ? (
            filtered.length > 0 ? (
              <View style={sh.cardGrid}>
                {filtered.map((p) => {
                  const active = isMulti
                    ? hasToken(localValue, p.value)
                    : localValue === p.value || field.value === p.value;
                  const isSuggested =
                    field.suggestedValue &&
                    p.value.trim().toLowerCase() === field.suggestedValue.trim().toLowerCase();
                  const presentation = splitPresetPresentation(p.label);
                  return (
                    <Pressable
                      key={p.value}
                      style={[
                        sh.card,
                        active && sh.cardActive,
                        isSuggested && !active && sh.cardSuggested,
                      ]}
                      onPress={() => pick(p)}>
                      {active ? (
                        <View style={sh.cardBadge}>
                          <Text style={sh.cardBadgeTxt}>✓</Text>
                        </View>
                      ) : isSuggested ? (
                        <View style={[sh.cardBadge, sh.cardBadgeSuggested]}>
                          <Text style={sh.cardBadgeTxt}>★</Text>
                        </View>
                      ) : null}
                      <Text
                        style={[
                          sh.cardLabel,
                          active && sh.cardLabelActive,
                          isSuggested && !active && sh.cardLabelSuggested,
                        ]}
                        numberOfLines={3}>
                        {presentation.title}
                      </Text>
                      {presentation.detail ? (
                        <Text
                          style={[
                            sh.cardDetail,
                            active && sh.cardDetailActive,
                            isSuggested && !active && sh.cardDetailSuggested,
                          ]}
                          numberOfLines={2}>
                          {presentation.detail}
                        </Text>
                      ) : null}
                      {isSuggested && !active ? (
                        <Text style={sh.cardSuggestedTag}>Auto</Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={sh.emptyState}>
                <Text style={sh.emptyTitle}>Nenhuma opção encontrada</Text>
                <Text style={sh.emptyText}>Use o campo abaixo para registrar manualmente.</Text>
              </View>
            )
          ) : (
            <View style={sh.emptyState}>
              <Text style={sh.emptyTitle}>Preenchimento manual</Text>
              <Text style={sh.emptyText}>Este campo não possui lista pronta. Informe o valor em Outro valor.</Text>
            </View>
          )}

          {/* Custom value input */}
          {!gcsField ? (
            <View style={sh.customWrap}>
              <Text style={sh.customLbl}>{customInputLabel}</Text>
              <View style={sh.customRow}>
                <TextInput
                  value={otherText}
                  onChangeText={setOtherText}
                  placeholder={isNumeric ? "Ex.: 125" : "Descrever livremente..."}
                  keyboardType={isNumeric ? "numeric" : "default"}
                  style={sh.customInput}
                  placeholderTextColor="#64748b"
                  returnKeyType="done"
                  onSubmitEditing={submitOther}
                />
                <Pressable style={[sh.customAdd, !otherText.trim() && sh.customAddDim]}
                  onPress={submitOther}>
                  <Text style={sh.customAddTxt}>+ Add</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <View style={{ height: 32 }} />
        </ScrollView>

        {/* Selected summary for multi */}
        {isMulti && tokensFrom(localValue).length > 0 ? (
          <View style={sh.summary}>
            <Text style={sh.summaryLbl}>Selecionados: </Text>
            <Text style={sh.summaryVal} numberOfLines={2}>
              {tokensFrom(localValue).join(" · ")}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

// ─── Selector button (shown in form) ─────────────────────────────────────────
function SelectorBtn({
  field, onPress,
}: {
  field: SheetField;
  onPress: () => void;
}) {
  const isMulti  = field.presetMode === "toggle_token";
  const tokens   = isMulti ? tokensFrom(field.value) : [];
  const hasFill  = field.value && field.value.trim().length > 0;

  return (
    <Pressable style={[sb.btn, hasFill && sb.btnFilled]} onPress={onPress}>
      <View style={sb.inner}>
        {isMulti ? (
          tokens.length > 0 ? (
            <View style={sb.tokenRow}>
              {tokens.map((t) => (
                <View key={t} style={sb.token}>
                  <Text style={sb.tokenTxt}>{t}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={sb.placeholder} numberOfLines={1}>
              {field.placeholder ?? "Selecionar opções"}
            </Text>
          )
        ) : (
          <Text style={[sb.value, !hasFill && sb.placeholder]} numberOfLines={1}>
            {hasFill ? field.value : (field.placeholder ?? "Selecionar")}
          </Text>
        )}
      </View>
      <Text style={[sb.chevron, hasFill && sb.chevronFilled]}>›</Text>
    </Pressable>
  );
}

// ─── Field renderer ───────────────────────────────────────────────────────────
function FieldView({
  field, onFieldChange, onPresetApply, onUnitChange,
}: {
  field: SheetField;
  onFieldChange: (id: string, val: string) => void;
  onPresetApply: (id: string, val: string) => void;
  onUnitChange:  (id: string, unit: string) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const hasPresets = Boolean(field.presets && field.presets.length > 0);
  const hasSuggested = Boolean(field.suggestedValue);
  const isDifferentFromSuggestion =
    hasSuggested && field.value.trim().length > 0 && !sameValue(field.value, field.suggestedValue);

  return (
    <View style={f.wrap}>
      {/* Label row */}
      <View style={f.labelRow}>
        <Text style={f.label}>{field.label}</Text>
        {field.unitOptions && field.unitOptions.length > 0 ? (
          <View style={f.units}>
            {field.unitOptions.map((u) => (
              <Pressable key={u.value}
                style={[f.unitBtn, field.unit === u.value && f.unitBtnOn]}
                onPress={() => onUnitChange(field.id, u.value)}>
                <Text style={[f.unitTxt, field.unit === u.value && f.unitTxtOn]}>{u.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {field.unit && !field.unitOptions?.length ? (
          <Text style={f.unitBadge}>{field.unit}</Text>
        ) : null}
      </View>

      {/* Input */}
      <>
        <SelectorBtn field={field} onPress={() => setSheetOpen(true)} />
        {/* Auto-suggestion banner: shown when field is empty and engine produced a suggestion */}
        {field.suggestedValue && !field.value.trim() ? (
          <Pressable
            style={f.suggestionRow}
            onPress={() => { onPresetApply(field.id, field.suggestedValue!); }}>
            <Text style={f.suggestionTag}>Auto</Text>
            <Text style={f.suggestionText} numberOfLines={2}>
              {field.suggestedLabel ?? field.suggestedValue}
            </Text>
            <Text style={f.suggestionCta}>Aceitar ›</Text>
          </Pressable>
        ) : null}
        {isDifferentFromSuggestion ? (
          <Pressable
            style={[f.suggestionRow, f.suggestionRowWarn]}
            onPress={() => { onPresetApply(field.id, field.suggestedValue!); }}>
            <Text style={[f.suggestionTag, f.suggestionTagWarn]}>Sugestão</Text>
            <Text style={[f.suggestionText, f.suggestionTextWarn]} numberOfLines={3}>
              Melhor opção para este caso: {field.suggestedLabel ?? field.suggestedValue}
            </Text>
            <Text style={[f.suggestionCta, f.suggestionCtaWarn]}>Aceitar ›</Text>
          </Pressable>
        ) : null}
        <PickerSheet
          field={field}
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          onSelect={hasPresets ? onPresetApply : onFieldChange}
        />
      </>

      {/* Hint — shown for all fields that have helperText */}
      {field.helperText ? (
        <Text style={[f.hint, field.helperText.startsWith("⚠") && { color: "#b45309", backgroundColor: "#fffbeb" }]}>
          {field.helperText}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Section renderer ─────────────────────────────────────────────────────────
function SectionView({
  title, fields, onFieldChange, onPresetApply, onUnitChange,
}: {
  title: string;
  fields: AuxiliaryPanel["fields"];
  onFieldChange: (id: string, val: string) => void;
  onPresetApply: (id: string, val: string) => void;
  onUnitChange:  (id: string, unit: string) => void;
}) {
  const rows: AuxiliaryPanel["fields"][] = [];
  let pendingHalfRow: AuxiliaryPanel["fields"] = [];

  for (const field of fields) {
    if (field.fullWidth) {
      if (pendingHalfRow.length > 0) {
        rows.push(pendingHalfRow);
        pendingHalfRow = [];
      }
      rows.push([field]);
      continue;
    }

    pendingHalfRow.push(field);
    if (pendingHalfRow.length === 2) {
      rows.push(pendingHalfRow);
      pendingHalfRow = [];
    }
  }

  if (pendingHalfRow.length > 0) {
    rows.push(pendingHalfRow);
  }

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {rows.map((row, rowIndex) => (
        <View key={`${title}-${rowIndex}`} style={s.grid}>
          {row.map((field) => (
            <View
              key={field.id}
              style={[
                s.cell,
                (field.fullWidth || row.length === 1) && s.cellFull,
              ]}>
              <FieldView
                field={field}
                onFieldChange={onFieldChange}
                onPresetApply={onPresetApply}
                onUnitChange={onUnitChange}
              />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── Alert banner ─────────────────────────────────────────────────────────────
function AlertBanner({ value, label }: { value: string; label: string }) {
  const isIot  = label === "IOT";
  const isVaso = label === "Vasopressor";
  return (
    <View style={[s.alertBanner, isIot && s.alertOrange, isVaso && s.alertRed]}>
      <Text style={s.alertIcon}>{isIot ? "🫁" : isVaso ? "💉" : "⚠️"}</Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.alertTitle}>
          {isIot ? "Indicação de IOT / VM" : isVaso ? "Indicação de Vasopressor" : label}
        </Text>
        <Text style={s.alertText}>
          {value.replace("⚠️ IOT: ", "").replace("⚠️ Vasopressor: ", "").replace("⚠️ ", "")}
        </Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
type SepsisFormTabsProps = {
  auxiliaryPanel: AuxiliaryPanel;
  fieldSections: [string, AuxiliaryPanel["fields"]][];
  metrics: AuxiliaryPanel["metrics"];
  activeTab: number;
  onTabChange: (tab: number) => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange:  (fieldId: string, unit: string)  => void;
  onActionRun:   (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange:(itemId: string, status: "pendente" | "solicitado" | "realizado", requiresConfirmation?: boolean) => void;
  onCtaAction?:  (actionId: string) => void;
  flowType?: "emergencia" | "uti_internado";
  /** EAP / CAD-EHH / VM: abas fixas, sem fluxo sepse */
  moduleMode?: "sepsis" | "eap" | "dka_hhs" | "ventilation" | "anafilaxia";
};

export default function SepsisFormTabs({
  auxiliaryPanel, fieldSections, metrics,
  activeTab, onTabChange,
  onFieldChange, onPresetApply, onUnitChange, onActionRun, onStatusChange,
  onCtaAction,
  flowType = "emergencia",
  moduleMode = "sepsis",
}: SepsisFormTabsProps) {
  const setActiveTab = onTabChange;
  const TABS =
    moduleMode === "eap"
      ? EAP_TABS
      : moduleMode === "dka_hhs"
        ? DKA_HHS_TABS
        : moduleMode === "ventilation"
          ? VENT_TABS
          : moduleMode === "anafilaxia"
            ? ANAFILAXIA_TABS
            : flowType === "uti_internado"
              ? TABS_ICU
              : TABS_EMERGENCY;
  const sectionMap =
    moduleMode === "eap"
      ? EAP_SECTION_TO_TAB
      : moduleMode === "dka_hhs"
        ? DKA_HHS_SECTION_TO_TAB
        : moduleMode === "ventilation"
          ? VENT_SECTION_TO_TAB
          : moduleMode === "anafilaxia"
            ? ANAFILAXIA_SECTION_TO_TAB
            : SECTION_TO_TAB;
  const tab = TABS[activeTab]!;

  const rawTabSections  = fieldSections.filter(([title]) => (sectionMap[title] ?? 0) === activeTab);
  const tabSections =
    moduleMode === "ventilation" && activeTab === 3
      ? rawTabSections.filter(([title]) => title !== "Anotações")
      : rawTabSections;

  // No módulo Anafilaxia, os tabs 0 (Exposição) e 1 (Clínico) são apenas coleta de dados.
  // Ocultar métricas nesses tabs evita mensagens de placeholder antes de qualquer preenchimento.
  const hideMetrics = moduleMode === "anafilaxia" && (activeTab === 0 || activeTab === 1);

  const alertMetrics = hideMetrics ? [] : metrics.filter((m) => m.value.startsWith("⚠️"));
  const infoMetrics  = hideMetrics ? [] : metrics.filter((m) => !m.value.startsWith("⚠️"));

  const paMetric = infoMetrics.find((m) => m.label === "PA (PAS/PAD)");
  const pamMetric = infoMetrics.find((m) => m.label === "PAM");
  const showPamCard =
    moduleMode === "anafilaxia" && !hideMetrics && paMetric != null && pamMetric != null;
  const dashInfoMetrics = showPamCard
    ? infoMetrics.filter((m) => m.label !== "PA (PAS/PAD)" && m.label !== "PAM")
    : infoMetrics;

  return (
    <View style={s.card}>

      {/* ── PAM — card destacado (Anafilaxia) ───────────────── */}
      {showPamCard ? (
        <View style={s.pamCard}>
          <Text style={s.pamCardKicker}>Hemodinâmica</Text>
          <Text style={s.pamCardTitle}>PAM (pressão arterial média)</Text>
          <View style={s.pamCardRow}>
            <View style={s.pamCardCol}>
              <Text style={s.pamCardLbl}>PAS / PAD</Text>
              <Text style={s.pamCardPa}>{paMetric!.value}</Text>
            </View>
            <View style={[s.pamCardCol, { alignItems: "flex-end" }]}>
              <Text style={s.pamCardLbl}>PAM calculada</Text>
              <Text style={s.pamCardPamVal}>{pamMetric!.value}</Text>
            </View>
          </View>
          <Text style={s.pamCardHint}>PAM = PAD + (PAS − PAD) ÷ 3. Valores em mmHg.</Text>
        </View>
      ) : null}

      {/* ── Dashboard ──────────────────────────────────────── */}
      {dashInfoMetrics.length > 0 ? (
        <View style={s.dash}>
          {dashInfoMetrics.map((m) => (
            <View
              key={m.label}
              style={[
                s.dashItem,
                (m.value.length > 28 || m.label.length > 20) && s.dashItemWide,
                /(peso predito|vt protetor|vt inicial)/i.test(m.label) && s.dashItemPrimary,
              ]}>
              <Text
                style={[
                  s.dashVal,
                  m.value.length > 45 && s.dashValCompact,
                  /(peso predito|vt protetor|vt inicial)/i.test(m.label) && s.dashValPrimary,
                ]}
                numberOfLines={3}>
                {m.value}
              </Text>
              <Text style={s.dashLbl}>{m.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* ── Alertas ────────────────────────────────────────── */}
      {alertMetrics.length > 0 ? (
        <View style={s.alertsWrap}>
          {alertMetrics.map((m) => <AlertBanner key={m.label} value={m.value} label={m.label} />)}
        </View>
      ) : null}

      {/* ── Layout: sidebar + conteúdo ─────────────────────── */}
      <View style={s.layout}>

        {/* Sidebar */}
        <View style={s.sidebar}>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <Pressable key={t.id} style={[s.sideTab, active && s.sideTabActive]}
                onPress={() => setActiveTab(t.id)}>
                <Text style={s.sideIcon}>{t.icon}</Text>
                <Text style={[s.sideLbl, active && s.sideLblActive]}>{t.label}</Text>
                <View style={[s.sideStep, active && s.sideStepActive]}>
                  <Text style={[s.sideStepTxt, active && s.sideStepTxtActive]}>{t.step}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Content */}
        <View style={s.content}>
          {!!tab.guide && (
            <View style={s.guide}>
              {moduleMode === "dka_hhs" || moduleMode === "ventilation" || moduleMode === "anafilaxia"
                ? tab.guide.split("\n").filter(Boolean).map((line, i) => (
                    <Text key={i} style={s.guideTxt}>
                      {line}
                    </Text>
                  ))
                : (
                    <Text style={s.guideTxt}>{tab.guide}</Text>
                  )}
            </View>
          )}

          <View style={s.body}>
            {tabSections.map(([title, fields]) => {
              // Antimicrobiano section: inject ATB prescription card between context fields and ATB selector
              if (moduleMode === "sepsis" && title === "Antimicrobiano" && activeTab === 3) {
                const contextFields = fields.filter((f) => f.id !== "antibioticDetails");
                const atbField = fields.filter((f) => f.id === "antibioticDetails");
                const recs = auxiliaryPanel.recommendations ?? [];
                return (
                  <View key={title}>
                    <SectionView title={title} fields={contextFields}
                      onFieldChange={onFieldChange} onPresetApply={onPresetApply} onUnitChange={onUnitChange} />
                    {recs.length > 0 && (
                      <View style={s.section}>
                        <Text style={s.sectionTitle}>💊 Esquema empírico sugerido</Text>
                        {recs.map((rec) => (
                          <View key={rec.title} style={[
                            s.rxCard,
                            rec.tone === "warning" && s.rxWarn,
                            rec.tone === "danger" && s.rxDanger,
                          ]}>
                            <Text style={s.rxTitle}>{rec.title}</Text>
                            {rec.lines.map((line) => (
                              <Text key={line} style={[s.rxLine, line.startsWith("•") && s.rxDrug]}>
                                {line}
                              </Text>
                            ))}
                            {rec.ctaButton ? (
                              <Pressable
                                style={s.rxCtaBtn}
                                onPress={() => onCtaAction?.(rec.ctaButton!.actionId)}>
                                <Text style={s.rxCtaBtnTxt}>{rec.ctaButton.label}</Text>
                              </Pressable>
                            ) : null}
                          </View>
                        ))}
                        <Text style={s.rxFootnote}>
                          ⚠️ Esquema empírico — confirmar ou ajustar abaixo após revisão clínica.
                        </Text>
                      </View>
                    )}
                    <SectionView title="" fields={atbField}
                      onFieldChange={onFieldChange} onPresetApply={onPresetApply} onUnitChange={onUnitChange} />
                  </View>
                );
              }
              return (
                <SectionView key={title} title={title} fields={fields}
                  onFieldChange={onFieldChange} onPresetApply={onPresetApply} onUnitChange={onUnitChange} />
              );
            })}

            {/* EAP: condutas sugeridas na aba Tratamento */}
            {moduleMode === "eap" && activeTab === 2 && auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Sugestões de conduta</Text>
                {auxiliaryPanel.recommendations.map((rec) => (
                  <View key={rec.title} style={[
                    s.recCard,
                    rec.tone === "warning" && s.recWarn,
                    rec.tone === "danger" && s.recDanger,
                  ]}>
                    <Text style={s.recTitle}>{rec.title}</Text>
                    {rec.lines.map((line) => (
                      <Text key={line} style={s.recLine}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {/* CAD / EHH: condutas diferenciadas na aba Tratamento */}
            {moduleMode === "dka_hhs" && activeTab === 3 && auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Condutas por quadro (referência)</Text>
                {auxiliaryPanel.recommendations.map((rec) => (
                  <View key={rec.title} style={[
                    s.recCard,
                    rec.tone === "warning" && s.recWarn,
                    rec.tone === "danger" && s.recDanger,
                  ]}>
                    <Text style={s.recTitle}>{rec.title}</Text>
                    {rec.lines.map((line) => (
                      <Text key={line} style={s.recLine}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Ventilação mecânica: passo a passo na última aba */}
            {moduleMode === "ventilation" && activeTab === 3 ? (
              <>
                {(() => {
                  const recommendedVentFields = auxiliaryPanel.fields
                    .filter((field) => field.section === "Ventilador — ajustes atuais")
                    .map((field) => ({
                      ...field,
                      value: field.suggestedValue ?? field.value,
                      placeholder: field.suggestedValue ?? field.placeholder,
                    }));

                  if (recommendedVentFields.length === 0) return null;

                  return (
                    <SectionView
                      title="Parâmetros recomendados pelo app neste momento"
                      fields={recommendedVentFields}
                      onFieldChange={onFieldChange}
                      onPresetApply={onPresetApply}
                      onUnitChange={onUnitChange}
                    />
                  );
                })()}

                {auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
                  <View style={s.section}>
                    <Text style={s.sectionTitle}>Orientação do sistema para a situação atual</Text>
                    {auxiliaryPanel.recommendations.map((rec) => (
                      <View key={rec.title} style={[
                        s.recCard,
                        rec.tone === "warning" && s.recWarn,
                        rec.tone === "danger" && s.recDanger,
                      ]}>
                        <Text style={s.recTitle}>{rec.title}</Text>
                        {rec.lines.map((line) => (
                          <Text key={line} style={s.recLine}>• {line}</Text>
                        ))}
                        {rec.ctaButton ? (
                          <Pressable
                            style={s.rxCtaBtn}
                            onPress={() => onActionRun(rec.ctaButton!.actionId)}>
                            <Text style={s.rxCtaBtnTxt}>{rec.ctaButton.label}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}

                {(() => {
                  const noteFields = auxiliaryPanel.fields.filter((field) => field.section === "Anotações");
                  if (noteFields.length === 0) return null;

                  return (
                    <SectionView
                      title="Plano final orientado pelo sistema"
                      fields={noteFields}
                      onFieldChange={onFieldChange}
                      onPresetApply={onPresetApply}
                      onUnitChange={onUnitChange}
                    />
                  );
                })()}
              </>
            ) : null}

            {/* Anafilaxia: condutas na última aba */}
            {moduleMode === "anafilaxia" && activeTab === 3 && auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Condutas — anafilaxia (referência)</Text>
                {auxiliaryPanel.recommendations.map((rec) => (
                  <View key={rec.title} style={[
                    s.recCard,
                    rec.tone === "warning" && s.recWarn,
                    rec.tone === "danger" && s.recDanger,
                  ]}>
                    <Text style={s.recTitle}>{rec.title}</Text>
                    {rec.lines.map((line) => (
                      <Text key={line} style={s.recLine}>• {line}</Text>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Stabilization recommendations */}
            {moduleMode === "sepsis" && activeTab === 3 && auxiliaryPanel.stabilizationRecommendations && auxiliaryPanel.stabilizationRecommendations.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Orientações de estabilização</Text>
                {auxiliaryPanel.stabilizationRecommendations.map((rec) => (
                  <View key={rec.title} style={[s.recCard, rec.tone === "warning" && s.recWarn, rec.tone === "danger" && s.recDanger]}>
                    <Text style={s.recTitle}>{rec.title}</Text>
                    {rec.lines.map((line) => <Text key={line} style={s.recLine}>• {line}</Text>)}
                    {rec.ctaButton ? (
                      <Pressable style={s.rxCtaBtn} onPress={() => onCtaAction?.(rec.ctaButton!.actionId)}>
                        <Text style={s.rxCtaBtnTxt}>{rec.ctaButton.label}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Bundle */}
            {moduleMode === "sepsis" && activeTab === 3 && auxiliaryPanel.statusItems && auxiliaryPanel.statusItems.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Bundle 1ª hora</Text>
                {auxiliaryPanel.statusItems.map((item) => (
                  <View key={item.id} style={s.bundleRow}>
                    <Text style={s.bundleLbl}>{item.label}</Text>
                    <View style={s.seg}>
                      {item.options.map((opt, i) => {
                        const active = item.currentStatus === opt.status;
                        const tone = active
                          ? opt.status === "realizado" ? s.segDone
                            : opt.status === "solicitado" ? s.segPend : s.segWait
                          : null;
                        return (
                          <Pressable key={opt.id}
                            style={[s.segItem, i === 0 && s.segFirst, i === item.options.length - 1 && s.segLast, tone]}
                            onPress={() => onStatusChange(item.id, opt.status, opt.requiresConfirmation)}>
                            <Text style={[s.segText, active && (tone === s.segDone ? s.segTxtDone : s.segTextActive)]}>
                              {opt.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Removed: ATB recs now shown inline inside the Antimicrobiano section above */}

            {auxiliaryPanel.actions.length > 0 ? (
              <View style={s.actRow}>
                {auxiliaryPanel.actions.map((a) => {
                  const isAirway = a.id === "open_rsi_module";
                  const isVent = a.id === "open_ventilation_module";
                  const actionTone = isAirway ? "primary" : isVent ? "vent" : "secondary";
                  return (
                    <Pressable
                      key={a.id}
                      style={({ pressed }) => [
                        s.actBtn,
                        actionTone === "primary"
                          ? s.actBtnPrimary
                          : actionTone === "vent"
                            ? s.actBtnVent
                            : s.actBtnSecondary,
                        pressed && { opacity: 0.9 },
                      ]}
                      onPress={() => onActionRun(a.id, a.requiresConfirmation)}>
                      <Text
                        style={[
                          s.actBtnTxt,
                          actionTone === "primary"
                            ? s.actBtnTxtPrimary
                            : actionTone === "vent"
                              ? s.actBtnTxtVent
                              : s.actBtnTxtSecondary,
                        ]}
                        numberOfLines={3}>
                        {a.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const SIDEBAR_W = 68;

// Bottom sheet
const sh = StyleSheet.create({
  backdrop: {
    position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
    zIndex: 1,
  },
  sheet: {
    position: "absolute" as const, left: 0, right: 0, bottom: 0,
    backgroundColor: "#f8f5ef",
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: "88%",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 }, elevation: 24,
    zIndex: 2,
  },
  handle: {
    alignSelf: "center", width: 40, height: 4,
    backgroundColor: "#c4d5cd", borderRadius: 2, marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#dbe9e2",
  },
  title:      { fontSize: 18, fontWeight: "900", color: "#102128" },
  unit:       { fontSize: 12, color: "#496067", marginTop: 2, fontWeight: "800" },
  confirmBtn: { backgroundColor: "#102128", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  confirmTxt: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: "#dbe9e2", alignItems: "center", justifyContent: "center" },
  closeTxt:   { fontSize: 13, color: "#496067", fontWeight: "800" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginVertical: 8,
    backgroundColor: "#f2eee5", borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "#c4d5cd",
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a", padding: 0 },
  searchClear: { fontSize: 12, color: "#64748b", fontWeight: "800", padding: 2 },
  list:        { flexGrow: 0 },

  // ── Card grid ──────────────────────────────────────────────────────────────
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  card: {
    width: "47.5%",
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    padding: 16,
    gap: 6,
    minHeight: 84,
    position: "relative",
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    backgroundColor: "#f0fdf4",
    borderColor: "#16a34a",
  },
  cardSuggested: {
    backgroundColor: "#fefce8",
    borderColor: "#f59e0b",
  },
  cardBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBadgeSuggested: {
    backgroundColor: "#f59e0b",
  },
  cardBadgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: "#ffffff",
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 20,
    paddingRight: 22,
  },
  cardLabelActive:    { color: "#15803d" },
  cardLabelSuggested: { color: "#92400e" },
  cardDetail: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 15,
  },
  cardDetailActive:    { color: "#166534" },
  cardDetailSuggested: { color: "#b45309" },
  cardSuggestedTag: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b45309",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // ── Legacy row styles (mantidos para GCS e outros usos internos) ───────────
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 15, gap: 12,
  },
  rowBorder:     { borderTopWidth: 1, borderTopColor: "#f8fafc" },
  rowActive:     { backgroundColor: "#f0fdf4" },
  rowSuggested:  { backgroundColor: "#fefce8" },
  rowTextWrap: { flex: 1, gap: 2 },
  rowLabel:      { fontSize: 15, lineHeight: 20, color: "#1e293b", fontWeight: "700" },
  rowLabelActive:{ color: "#15803d", fontWeight: "800" },
  rowLabelSuggested: { color: "#854d0e", fontWeight: "800" },
  rowDetail: { fontSize: 12, lineHeight: 17, color: "#475569", fontWeight: "600" },
  rowDetailActive: { color: "#166534" },
  rowDetailSuggested: { color: "#92400e" },
  rowSuggestedTag: { fontSize: 10, fontWeight: "800", color: "#92400e", marginTop: 3 },
  rowCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center", justifyContent: "center",
  },
  rowCheckActive:{ backgroundColor: "#16a34a", borderColor: "#16a34a" },
  rowCheckMark:  { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  gcsCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe4ee",
    gap: 12,
  },
  gcsTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  gcsHint: { fontSize: 12, lineHeight: 18, color: "#475569", fontWeight: "600" },
  gcsSection: { gap: 8 },
  gcsSectionTitle: { fontSize: 12, fontWeight: "800", color: "#334155", textTransform: "uppercase" },
  gcsOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  gcsOptionActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ecfeff",
  },
  gcsScore: {
    width: 28,
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  gcsScoreActive: { color: "#0f766e" },
  gcsOptionText: { flex: 1, fontSize: 13, lineHeight: 18, color: "#334155" },
  gcsOptionTextActive: { color: "#115e59", fontWeight: "600" },
  gcsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  gcsTotalLabel: { fontSize: 11, fontWeight: "800", color: "#475569", textTransform: "uppercase" },
  gcsTotalValue: { fontSize: 28, fontWeight: "800", color: "#0f172a" },
  gcsApplyBtn: {
    backgroundColor: "#0f766e",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  gcsApplyBtnDisabled: { opacity: 0.45 },
  gcsApplyTxt: { fontSize: 13, fontWeight: "800", color: "#ffffff" },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 4,
  },
  emptyTitle: { fontSize: 13, fontWeight: "700", color: "#334155" },
  emptyText: { fontSize: 12, color: "#475569", lineHeight: 17, fontWeight: "600" },
  suggestionBanner: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 4,
    backgroundColor: "#edf8b6", borderRadius: 16,
    borderWidth: 1, borderColor: "#d6ff3f",
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  suggestionLeft: { flex: 1, gap: 2 },
  suggestionTag:  { fontSize: 10, fontWeight: "900", color: "#365b12", letterSpacing: 0.5 },
  suggestionText: { fontSize: 13, fontWeight: "700", color: "#22363b" },
  suggestionAccept: { fontSize: 13, fontWeight: "800", color: "#0f6b61" },
  customWrap: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: "#f2eee5", borderRadius: 18,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: "#c4d5cd",
  },
  customLbl:    { fontSize: 11, fontWeight: "900", color: "#496067", textTransform: "uppercase", letterSpacing: 0.5 },
  customRow:    { flexDirection: "row", gap: 8 },
  customInput:  {
    flex: 1, backgroundColor: "#f8f5ef", borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, color: "#102128",
    borderWidth: 1, borderColor: "#c4d5cd",
    ...(Platform.OS === "web"
      ? ({
          outlineWidth: 0,
          outlineColor: "transparent",
        } as any)
      : null),
  },
  customAdd:    { backgroundColor: "#102128", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, justifyContent: "center" },
  customAddDim: { opacity: 0.4 },
  customAddTxt: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  summary: {
    flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start",
    paddingHorizontal: 20, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#dbe9e2",
    backgroundColor: "#dbe9e2",
  },
  summaryLbl: { fontSize: 11, fontWeight: "900", color: "#496067" },
  summaryVal: { fontSize: 11, color: "#0f6b61", fontWeight: "700", flex: 1 },
});

// Selector button
const sb = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f8f5ef",
    borderWidth: 1, borderColor: "#c4d5cd",
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12,
    minHeight: 48,
  },
  btnFilled: { borderColor: "#5fb49c", backgroundColor: "#edf6f1" },
  inner:      { flex: 1 },
  placeholder:{ fontSize: 13, color: "#698087", fontWeight: "700" },
  value:      { fontSize: 13, fontWeight: "800", color: "#102128" },
  chevron:    { fontSize: 18, color: "#698087", marginLeft: 6 },
  chevronFilled: { color: "#0f6b61" },
  tokenRow:   { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  token: {
    backgroundColor: "#dbe9e2", borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
    flexShrink: 1,
  },
  tokenTxt:  { fontSize: 11, fontWeight: "700", color: "#0f6b61", flexShrink: 1 },
  tokenMore: {
    backgroundColor: "#bbf7d0", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  tokenMoreTxt: { fontSize: 11, fontWeight: "700", color: "#15803d" },
});

// Field
const f = StyleSheet.create({
  wrap:     { gap: 5 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label:    { flex: 1, fontSize: 11, fontWeight: "900", color: "#334155", letterSpacing: 0.3 },
  unitBadge:{ fontSize: 10, color: "#496067", backgroundColor: "#dbe9e2", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontWeight: "900" },
  units:    { flexDirection: "row", gap: 3 },
  unitBtn:  { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: "#dbe9e2", borderWidth: 1, borderColor: "#c4d5cd" },
  unitBtnOn:{ backgroundColor: "#102128", borderColor: "#102128" },
  unitTxt:  { fontSize: 10, color: "#496067", fontWeight: "900" },
  unitTxtOn:{ color: "#ffffff" },
  hint: { fontSize: 11, color: "#0f6b61", lineHeight: 16, fontStyle: "italic", fontWeight: "700", marginTop: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10, backgroundColor: "#dbe9e2" },
  suggestionRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#edf8b6",
    borderRadius: 14, borderWidth: 1, borderColor: "#d6ff3f",
    paddingHorizontal: 10, paddingVertical: 7, gap: 8,
  },
  suggestionRowWarn: {
    backgroundColor: "#fff0e4",
    borderColor: "#f6bf8d",
  },
  suggestionTag:  { fontSize: 10, fontWeight: "900", color: "#365b12", letterSpacing: 0.4 },
  suggestionTagWarn: { color: "#9a3412" },
  suggestionText: { flex: 1, fontSize: 12, fontWeight: "700", color: "#22363b" },
  suggestionTextWarn: { color: "#9a3412" },
  suggestionCta:  { fontSize: 12, fontWeight: "800", color: "#0f6b61" },
  suggestionCtaWarn: { color: "#c2410c" },
});

// Main layout
const s = StyleSheet.create({
  card: {
    marginHorizontal: 8, marginBottom: 8,
    backgroundColor: "#f8f5ef", borderRadius: 24, overflow: "hidden" as const,
    borderWidth: 1, borderColor: "#c4d5cd",
    shadowColor: "#03181a", shadowOpacity: 0.12, shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 }, elevation: 5,
  },
  dash: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, paddingTop: 12, paddingBottom: 6, gap: 8 },
  dashItem: {
    backgroundColor: "#edf2ef", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8,
    minWidth: 70, flexGrow: 1, alignItems: "center", borderWidth: 1, borderColor: "#c7d5cf",
  },
  dashItemWide: {
    width: "100%",
  },
  dashItemPrimary: {
    backgroundColor: "#dbe9e2",
    borderColor: "#5fb49c",
  },
  dashVal: { fontSize: 12, fontWeight: "900", color: "#102128" },
  dashValPrimary: { fontSize: 13 },
  dashValCompact: { fontSize: 11, lineHeight: 16 },
  dashLbl: { fontSize: 10, color: "#496067", marginTop: 2, textAlign: "center", fontWeight: "900" },
  alertsWrap: { paddingHorizontal: 10, paddingBottom: 8, gap: 6 },
  alertBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    borderRadius: 10, padding: 10, borderWidth: 1.5,
    backgroundColor: "#fef2f2", borderColor: "#fca5a5",
  },
  alertOrange: { backgroundColor: "#fff7ed", borderColor: "#fb923c" },
  alertRed:    { backgroundColor: "#fef2f2", borderColor: "#f87171" },
  alertIcon:   { fontSize: 18, marginTop: 1 },
  alertTitle:  { fontSize: 13, fontWeight: "900", color: "#9a3412" },
  alertText:   { fontSize: 12, color: "#7c2d12", fontWeight: "700", lineHeight: 18 },
  layout:  { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#dbe9e2", alignItems: "flex-start" },
  sidebar: { width: SIDEBAR_W, backgroundColor: "#dbe9e2", borderRightWidth: 1, borderRightColor: "#c4d5cd", position: "sticky" as unknown as "relative", top: 0, alignSelf: "flex-start" as const },
  sideTab: { paddingVertical: 16, paddingHorizontal: 4, alignItems: "center", gap: 5, borderBottomWidth: 1, borderBottomColor: "rgba(95,180,156,0.16)" },
  sideTabActive: { backgroundColor: "#f8f5ef" },
  sideIcon: { fontSize: 20 },
  sideLbl:  { fontSize: 10, fontWeight: "900", color: "#496067", textAlign: "center", lineHeight: 12 },
  sideLblActive: { color: "#0f6b61" },
  sideStep: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#c4d5cd", alignItems: "center", justifyContent: "center" },
  sideStepActive: { backgroundColor: "#102128" },
  sideStepTxt:    { fontSize: 10, fontWeight: "900", color: "#496067" },
  sideStepTxtActive: { color: "#ffffff" },
  content: { flex: 1 },
  guide: { backgroundColor: "#102128", paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" },
  guideTxt: { fontSize: 13, color: "#d9ece5", lineHeight: 19, fontWeight: "800" },
  body: { padding: 12, gap: 16 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 10, fontWeight: "900", color: "#496067", textTransform: "uppercase", letterSpacing: 1.1 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "47%" },
  cellFull: { width: "100%" },
  seg: { flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  segItem: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  segFirst: { borderLeftWidth: 0 },
  segLast:  { borderRightWidth: 0 },
  segActive: { backgroundColor: "#0ea5e9" },
  segDone:   { backgroundColor: "#d1fae5" },
  segPend:   { backgroundColor: "#fef3c7" },
  segWait:   { backgroundColor: "#fee2e2" },
  segText:    { fontSize: 12, fontWeight: "800", color: "#334155" },
  segTextActive: { color: "#ffffff" },
  segTxtDone:    { color: "#065f46" },
  bundleRow: { gap: 5 },
  bundleLbl: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  calcCard: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, gap: 3, borderWidth: 1.5, borderColor: "#86efac" },
  calcTitle: { fontSize: 12, fontWeight: "800", color: "#166534" },
  calcValue: { fontSize: 26, fontWeight: "800", color: "#15803d" },
  calcHint:  { fontSize: 11, color: "#166534", lineHeight: 16, fontWeight: "700" },
  recCard:  { backgroundColor: "#edf2ef", borderRadius: 18, padding: 14, gap: 5, borderWidth: 1, borderColor: "#c7d5cf" },
  recWarn:  { backgroundColor: "#fff0e4", borderColor: "#f6bf8d" },
  recDanger: { backgroundColor: "#ffe8eb", borderColor: "#fecaca" },
  recTitle: { fontSize: 13, fontWeight: "900", color: "#102128" },
  recLine:  { fontSize: 13, color: "#22363b", lineHeight: 19, fontWeight: "700" },

  // ── Prescription-style ATB card (inline in Antimicrobiano section) ────────
  rxCard:    { backgroundColor: "#edf6f1", borderRadius: 18, padding: 16, gap: 5, borderWidth: 1.5, borderColor: "#5fb49c", marginBottom: 8 },
  rxWarn:    { backgroundColor: "#fff0e4", borderColor: "#f6bf8d" },
  rxDanger:  { backgroundColor: "#fff1f2", borderColor: "#ef4444" },
  rxTitle:   { fontWeight: "900", fontSize: 15, color: "#102128", marginBottom: 2 },
  rxLine:    { fontSize: 13, color: "#22363b", lineHeight: 20, fontWeight: "700" },
  rxDrug:    { fontWeight: "800", color: "#0f6b61", fontSize: 13 },
  rxFootnote:{ fontSize: 12, color: "#698087", fontStyle: "italic", marginTop: 4, textAlign: "center", fontWeight: "700" },
  rxCtaBtn:  { marginTop: 10, backgroundColor: "#102128", borderRadius: 14, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center" as const },
  rxCtaBtnTxt:{ color: "#ffffff", fontSize: 13, fontWeight: "800" as const, letterSpacing: 0.2 },
  pamCard: {
    marginHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#f2eee5",
    borderWidth: 1,
    borderColor: "#c4d5cd",
  },
  pamCardKicker: {
    fontSize: 10,
    fontWeight: "900",
    color: "#496067",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  pamCardTitle: { fontSize: 15, fontWeight: "900", color: "#102128", marginBottom: 10 },
  pamCardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  pamCardCol: { flex: 1, minWidth: 0 },
  pamCardLbl: { fontSize: 11, fontWeight: "700", color: "#496067", marginBottom: 4 },
  pamCardPa: { fontSize: 16, fontWeight: "700", color: "#334155", lineHeight: 22 },
  pamCardPamVal: { fontSize: 22, fontWeight: "900", color: "#102128", lineHeight: 28 },
  pamCardHint: { fontSize: 11, color: "#698087", marginTop: 10, lineHeight: 16, fontWeight: "600" },

  actRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "stretch",
  },
  actBtn: {
    flexGrow: 1,
    flexBasis: "48%",
    minWidth: 140,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actBtnPrimary: {
    backgroundColor: "#102128",
    borderWidth: 0,
  },
  actBtnVent: {
    backgroundColor: "#0f6b61",
    borderWidth: 0,
  },
  actBtnSecondary: {
    backgroundColor: "#f8f5ef",
    borderWidth: 1.5,
    borderColor: "#c4d5cd",
  },
  actBtnTxt: { textAlign: "center", lineHeight: 20 },
  actBtnTxtPrimary: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  actBtnTxtVent: { color: "#ffffff", fontSize: 14, fontWeight: "600" },
  actBtnTxtSecondary: { color: "#1e293b", fontSize: 14, fontWeight: "600" },
});
