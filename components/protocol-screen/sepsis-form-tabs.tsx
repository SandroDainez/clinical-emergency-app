import { useEffect, useState } from "react";
import {
  Modal,
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
};

const TABS_EMERGENCY = [
  { id: 0, icon: "👤", label: "Paciente",      step: "1",
    guide: "Identificação e antecedentes: dados demográficos, comorbidades, medicações e alergias." },
  { id: 1, icon: "🩺", label: "Ex. Clínico",   step: "2",
    guide: "Apresentação clínica → Sinais vitais (PAM e qSOFA automáticos) → Exame físico completo." },
  { id: 2, icon: "🔬", label: "Diagnóstico",   step: "3",
    guide: "Hipótese diagnóstica e exames complementares. Lactato e creatinina são cruciais." },
  { id: 3, icon: "🚨", label: "Estabilização", step: "4",
    guide: "O₂, volume, acessos, vasopressor, IOT, monitorização + ATB empírico (1ª hora) com contexto auto-calculado." },
  { id: 4, icon: "📋", label: "Conduta",       step: "5",
    guide: "Condutas complementares: controle glicêmico, profilaxias, suporte nutricional, reavaliação + destino do paciente." },
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
    guide: "Identificação e antecedentes: dados demográficos, comorbidades, medicações e alergias." },
  { id: 1, icon: "🩺", label: "Ex. Clínico",   step: "2",
    guide: "Apresentação clínica → Sinais vitais (PAM e qSOFA automáticos) → Exame físico completo." },
  { id: 2, icon: "🔬", label: "Diagnóstico",   step: "3",
    guide: "Hipótese diagnóstica, SOFA-2 e exames complementares." },
  { id: 3, icon: "🚨", label: "Estabilização", step: "4",
    guide: "O₂, volume, acessos, vasopressor, IOT, monitorização + ATB empírico com ajuste renal." },
  { id: 4, icon: "📋", label: "Conduta",       step: "5",
    guide: "Condutas complementares, destino e anotações." },
  { id: 5, icon: "🏥", label: "UTI",           step: "6",
    guide: "Paciente internado — Cenário, estado neurológico (RASS), ventilação (P/F ratio), culturas, escalonamento ATB, vasopressores e condutas avançadas." },
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
  const [search,     setSearch]     = useState("");
  const [localValue, setLocalValue] = useState(field.value);
  const [otherText,  setOtherText]  = useState("");

  useEffect(() => {
    if (visible) { setLocalValue(field.value); setSearch(""); setOtherText(""); }
  }, [visible, field.value]);

  const presets = field.presets ?? [];
  const filtered = search.trim()
    ? presets.filter((p) => p.label.toLowerCase().includes(search.toLowerCase()))
    : presets;

  const confirm = () => onClose();

  const pick = (p: { label: string; value: string }) => {
    if (isMulti) {
      const next = toggleToken(localValue, p.value);
      setLocalValue(next);
      onSelect(field.id, p.value); // engine update each tap
    } else {
      onSelect(field.id, p.value);
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

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={sh.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={sh.sheet}>
        {/* Handle */}
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
              placeholderTextColor="#94a3b8"
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
              <Text style={sh.suggestionTag}>Sepsis-3</Text>
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
          {filtered.map((p, i) => {
            const active = isMulti
              ? hasToken(localValue, p.value)
              : localValue === p.value || field.value === p.value;
            const isSuggested =
              field.suggestedValue &&
              p.value.trim().toLowerCase() === field.suggestedValue.trim().toLowerCase();
            return (
              <Pressable
                key={p.value}
                style={[sh.row, i > 0 && sh.rowBorder, active && sh.rowActive, isSuggested && !active && sh.rowSuggested]}
                onPress={() => pick(p)}>
                <View style={{ flex: 1 }}>
                  <Text style={[sh.rowLabel, active && sh.rowLabelActive, isSuggested && !active && sh.rowLabelSuggested]} numberOfLines={2}>
                    {p.label}
                  </Text>
                  {isSuggested && !active ? (
                    <Text style={sh.rowSuggestedTag}>Sugestão automática</Text>
                  ) : null}
                </View>
                <View style={[sh.rowCheck, active && sh.rowCheckActive]}>
                  {active ? <Text style={sh.rowCheckMark}>✓</Text> : null}
                </View>
              </Pressable>
            );
          })}

          {/* Custom value input */}
          <View style={sh.customWrap}>
            <Text style={sh.customLbl}>Outro valor:</Text>
            <View style={sh.customRow}>
              <TextInput
                value={otherText}
                onChangeText={setOtherText}
                placeholder={isNumeric ? "Ex.: 125" : "Descrever livremente..."}
                keyboardType={isNumeric ? "numeric" : "default"}
                style={sh.customInput}
                placeholderTextColor="#94a3b8"
                returnKeyType="done"
                onSubmitEditing={submitOther}
              />
              <Pressable style={[sh.customAdd, !otherText.trim() && sh.customAddDim]}
                onPress={submitOther}>
                <Text style={sh.customAddTxt}>+ Add</Text>
              </Pressable>
            </View>
          </View>
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
              {tokens.slice(0, 3).map((t) => (
                <View key={t} style={sb.token}>
                  <Text style={sb.tokenTxt} numberOfLines={1}>{t}</Text>
                </View>
              ))}
              {tokens.length > 3 ? (
                <View style={sb.tokenMore}>
                  <Text style={sb.tokenMoreTxt}>+{tokens.length - 3}</Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={sb.placeholder} numberOfLines={1}>
              {field.placeholder ?? "Toque para selecionar"}
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
  const isNumeric  = field.keyboardType === "numeric";

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
      {hasPresets ? (
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
          <PickerSheet
            field={field}
            visible={sheetOpen}
            onClose={() => setSheetOpen(false)}
            onSelect={onPresetApply}
          />
        </>
      ) : (
        <TextInput
          value={field.value}
          placeholder={field.placeholder ?? "—"}
          keyboardType={isNumeric ? "numeric" : "default"}
          onChangeText={(t) => onFieldChange(field.id, t)}
          style={[f.input, field.value && f.inputFilled]}
          placeholderTextColor="#94a3b8"
          multiline={Boolean(field.fullWidth)}
        />
      )}

      {/* Hint */}
      {field.helperText && (field.helperText.includes("≥") || field.helperText.includes("<")) ? (
        <Text style={f.hint}>{field.helperText}</Text>
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
  const full = fields.filter((f) => f.fullWidth);
  const half = fields.filter((f) => !f.fullWidth);
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {full.map((f) => (
        <FieldView key={f.id} field={f}
          onFieldChange={onFieldChange} onPresetApply={onPresetApply} onUnitChange={onUnitChange} />
      ))}
      {half.length > 0 ? (
        <View style={s.grid}>
          {half.map((f) => (
            <View key={f.id} style={s.cell}>
              <FieldView field={f}
                onFieldChange={onFieldChange} onPresetApply={onPresetApply} onUnitChange={onUnitChange} />
            </View>
          ))}
        </View>
      ) : null}
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

  const tabSections  = fieldSections.filter(([title]) => (sectionMap[title] ?? 0) === activeTab);
  const alertMetrics = metrics.filter((m) => m.value.startsWith("⚠️"));
  const infoMetrics  = metrics.filter((m) => !m.value.startsWith("⚠️"));

  return (
    <View style={s.card}>

      {/* ── Dashboard ──────────────────────────────────────── */}
      {infoMetrics.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dash}>
          {infoMetrics.map((m) => (
            <View key={m.label} style={s.dashItem}>
              <Text style={s.dashVal}>{m.value}</Text>
              <Text style={s.dashLbl}>{m.label}</Text>
            </View>
          ))}
        </ScrollView>
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
          <View style={s.guide}>
            {moduleMode === "dka_hhs" || moduleMode === "ventilation" || moduleMode === "anafilaxia"
              ? tab.guide.split("\n").map((line, i) => (
                  <Text key={i} style={s.guideTxt}>
                    {line}
                  </Text>
                ))
              : (
                  <Text style={s.guideTxt}>{tab.guide}</Text>
                )}
          </View>

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
            {moduleMode === "ventilation" && activeTab === 3 && auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle}>Orientação e passo a passo no ventilador</Text>
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
                {auxiliaryPanel.actions.map((a) => (
                  <Pressable key={a.id} style={s.actBtn}
                    onPress={() => onActionRun(a.id, a.requiresConfirmation)}>
                    <Text style={s.actBtnTxt}>{a.label}</Text>
                  </Pressable>
                ))}
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
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  sheet: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: "88%",
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 }, elevation: 24,
  },
  handle: {
    alignSelf: "center", width: 40, height: 4,
    backgroundColor: "#e2e8f0", borderRadius: 2, marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  title:      { fontSize: 17, fontWeight: "700", color: "#0f172a" },
  unit:       { fontSize: 12, color: "#64748b", marginTop: 2 },
  confirmBtn: { backgroundColor: "#0ea5e9", borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  confirmTxt: { fontSize: 14, fontWeight: "700", color: "#ffffff" },
  closeBtn:   { width: 32, height: 32, borderRadius: 16, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  closeTxt:   { fontSize: 13, color: "#64748b", fontWeight: "700" },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginHorizontal: 16, marginVertical: 8,
    backgroundColor: "#f8fafc", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  searchIcon:  { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: "#0f172a", padding: 0 },
  searchClear: { fontSize: 12, color: "#94a3b8", fontWeight: "700", padding: 2 },
  list:        { flexGrow: 0 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 15, gap: 12,
  },
  rowBorder:     { borderTopWidth: 1, borderTopColor: "#f8fafc" },
  rowActive:     { backgroundColor: "#f0fdf4" },
  rowSuggested:  { backgroundColor: "#fefce8" },
  rowLabel:      { flex: 1, fontSize: 15, color: "#1e293b", fontWeight: "500" },
  rowLabelActive:{ color: "#15803d", fontWeight: "700" },
  rowLabelSuggested: { color: "#854d0e", fontWeight: "600" },
  rowSuggestedTag: { fontSize: 10, fontWeight: "700", color: "#92400e", marginTop: 2 },
  rowCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    alignItems: "center", justifyContent: "center",
  },
  rowCheckActive:{ backgroundColor: "#16a34a", borderColor: "#16a34a" },
  rowCheckMark:  { fontSize: 12, fontWeight: "800", color: "#ffffff" },
  suggestionBanner: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 4,
    backgroundColor: "#fffbeb", borderRadius: 12,
    borderWidth: 1, borderColor: "#fbbf24",
    paddingHorizontal: 14, paddingVertical: 10, gap: 10,
  },
  suggestionLeft: { flex: 1, gap: 2 },
  suggestionTag:  { fontSize: 10, fontWeight: "800", color: "#92400e", letterSpacing: 0.5 },
  suggestionText: { fontSize: 13, fontWeight: "600", color: "#78350f" },
  suggestionAccept: { fontSize: 13, fontWeight: "700", color: "#d97706" },
  customWrap: {
    marginHorizontal: 16, marginTop: 8,
    backgroundColor: "#f8fafc", borderRadius: 14,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  customLbl:    { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 },
  customRow:    { flexDirection: "row", gap: 8 },
  customInput:  {
    flex: 1, backgroundColor: "#ffffff", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 14, color: "#0f172a",
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  customAdd:    { backgroundColor: "#0ea5e9", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, justifyContent: "center" },
  customAddDim: { opacity: 0.4 },
  customAddTxt: { fontSize: 13, fontWeight: "700", color: "#ffffff" },
  summary: {
    flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start",
    paddingHorizontal: 20, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#f1f5f9",
    backgroundColor: "#f0f9ff",
  },
  summaryLbl: { fontSize: 11, fontWeight: "700", color: "#64748b" },
  summaryVal: { fontSize: 11, color: "#0369a1", fontWeight: "600", flex: 1 },
});

// Selector button
const sb = StyleSheet.create({
  btn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1, borderColor: "#e2e8f0",
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    minHeight: 44,
  },
  btnFilled: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  inner:      { flex: 1 },
  placeholder:{ fontSize: 13, color: "#94a3b8" },
  value:      { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  chevron:    { fontSize: 18, color: "#94a3b8", marginLeft: 6 },
  chevronFilled: { color: "#16a34a" },
  tokenRow:   { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  token: {
    backgroundColor: "#bbf7d0", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    maxWidth: 120,
  },
  tokenTxt:  { fontSize: 11, fontWeight: "600", color: "#15803d" },
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
  label:    { flex: 1, fontSize: 11, fontWeight: "700", color: "#334155" },
  unitBadge:{ fontSize: 10, color: "#64748b", backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  units:    { flexDirection: "row", gap: 3 },
  unitBtn:  { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0" },
  unitBtnOn:{ backgroundColor: "#0f172a", borderColor: "#0f172a" },
  unitTxt:  { fontSize: 10, color: "#64748b", fontWeight: "700" },
  unitTxtOn:{ color: "#ffffff" },
  input: {
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: "#0f172a", backgroundColor: "#f8fafc", minHeight: 44,
  },
  inputFilled: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  hint: { fontSize: 10, color: "#0369a1", lineHeight: 14, fontStyle: "italic" },
  suggestionRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#fffbeb",
    borderRadius: 10, borderWidth: 1, borderColor: "#fcd34d",
    paddingHorizontal: 10, paddingVertical: 7, gap: 8,
  },
  suggestionTag:  { fontSize: 10, fontWeight: "800", color: "#92400e", letterSpacing: 0.4 },
  suggestionText: { flex: 1, fontSize: 12, fontWeight: "600", color: "#78350f" },
  suggestionCta:  { fontSize: 12, fontWeight: "700", color: "#d97706" },
});

// Main layout
const s = StyleSheet.create({
  card: {
    marginHorizontal: 8, marginBottom: 8,
    backgroundColor: "#ffffff", borderRadius: 16, overflow: "hidden",
    borderWidth: 1, borderColor: "#e2e8f0",
    shadowColor: "#0f172a", shadowOpacity: 0.06, shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  dash: { flexDirection: "row", paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4, gap: 6 },
  dashItem: {
    backgroundColor: "#f0f9ff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    minWidth: 60, alignItems: "center", borderWidth: 1, borderColor: "#bae6fd",
  },
  dashVal: { fontSize: 11, fontWeight: "800", color: "#0369a1" },
  dashLbl: { fontSize: 8, color: "#64748b", marginTop: 1, textAlign: "center" },
  alertsWrap: { paddingHorizontal: 10, paddingBottom: 8, gap: 6 },
  alertBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    borderRadius: 10, padding: 10, borderWidth: 1.5,
    backgroundColor: "#fef2f2", borderColor: "#fca5a5",
  },
  alertOrange: { backgroundColor: "#fff7ed", borderColor: "#fb923c" },
  alertRed:    { backgroundColor: "#fef2f2", borderColor: "#f87171" },
  alertIcon:   { fontSize: 18, marginTop: 1 },
  alertTitle:  { fontSize: 12, fontWeight: "800", color: "#9a3412" },
  alertText:   { fontSize: 11, color: "#7c2d12", fontWeight: "600" },
  layout:  { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#f1f5f9" },
  sidebar: { width: SIDEBAR_W, backgroundColor: "#f8fafc", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  sideTab: { paddingVertical: 14, paddingHorizontal: 4, alignItems: "center", gap: 4, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  sideTabActive: { backgroundColor: "#ffffff" },
  sideIcon: { fontSize: 20 },
  sideLbl:  { fontSize: 9, fontWeight: "700", color: "#94a3b8", textAlign: "center" },
  sideLblActive: { color: "#0369a1" },
  sideStep: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#e2e8f0", alignItems: "center", justifyContent: "center" },
  sideStepActive: { backgroundColor: "#0ea5e9" },
  sideStepTxt:    { fontSize: 10, fontWeight: "800", color: "#94a3b8" },
  sideStepTxtActive: { color: "#ffffff" },
  content: { flex: 1, overflow: "hidden" },
  guide: { backgroundColor: "#f0f9ff", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#e0f2fe" },
  guideTxt: { fontSize: 11, color: "#0369a1", lineHeight: 16, fontWeight: "500" },
  body: { padding: 10, gap: 14 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 8, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.0 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { width: "47%" },
  seg: { flexDirection: "row", borderRadius: 8, borderWidth: 1, borderColor: "#e2e8f0", overflow: "hidden" },
  segItem: { flex: 1, minHeight: 42, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc", borderRightWidth: 1, borderRightColor: "#e2e8f0" },
  segFirst: { borderLeftWidth: 0 },
  segLast:  { borderRightWidth: 0 },
  segActive: { backgroundColor: "#0ea5e9" },
  segDone:   { backgroundColor: "#d1fae5" },
  segPend:   { backgroundColor: "#fef3c7" },
  segWait:   { backgroundColor: "#fee2e2" },
  segText:    { fontSize: 12, fontWeight: "600", color: "#64748b" },
  segTextActive: { color: "#ffffff" },
  segTxtDone:    { color: "#065f46" },
  bundleRow: { gap: 5 },
  bundleLbl: { fontSize: 12, fontWeight: "700", color: "#1e293b" },
  calcCard: { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, gap: 3, borderWidth: 1.5, borderColor: "#86efac" },
  calcTitle: { fontSize: 11, fontWeight: "700", color: "#166534" },
  calcValue: { fontSize: 26, fontWeight: "800", color: "#15803d" },
  calcHint:  { fontSize: 10, color: "#166534", lineHeight: 14 },
  recCard:  { backgroundColor: "#f0f9ff", borderRadius: 10, padding: 12, gap: 4, borderWidth: 1, borderColor: "#bae6fd" },
  recWarn:  { backgroundColor: "#fff7ed", borderColor: "#fed7aa" },
  recDanger: { backgroundColor: "#fff1f2", borderColor: "#fecaca" },
  recTitle: { fontSize: 12, fontWeight: "800", color: "#0c4a6e" },
  recLine:  { fontSize: 12, color: "#334155", lineHeight: 18 },

  // ── Prescription-style ATB card (inline in Antimicrobiano section) ────────
  rxCard:    { backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, gap: 4, borderWidth: 2, borderColor: "#16a34a", marginBottom: 8 },
  rxWarn:    { backgroundColor: "#fffbeb", borderColor: "#f59e0b" },
  rxDanger:  { backgroundColor: "#fff1f2", borderColor: "#ef4444" },
  rxTitle:   { fontWeight: "800", fontSize: 14, color: "#14532d", marginBottom: 2 },
  rxLine:    { fontSize: 12, color: "#374151", lineHeight: 19 },
  rxDrug:    { fontWeight: "700", color: "#15803d", fontSize: 13 },
  rxFootnote:{ fontSize: 11, color: "#9ca3af", fontStyle: "italic", marginTop: 4, textAlign: "center" },
  rxCtaBtn:  { marginTop: 10, backgroundColor: "#1d4ed8", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16, alignItems: "center" as const },
  rxCtaBtnTxt:{ color: "#ffffff", fontSize: 13, fontWeight: "800" as const, letterSpacing: 0.2 },
  actRow:   { flexDirection: "row", gap: 8 },
  actBtn:   { flex: 1, backgroundColor: "#0f172a", borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  actBtnTxt:{ color: "#ffffff", fontSize: 13, fontWeight: "800" },
});
