import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { AppDesign } from "../../constants/app-design";

export type PresetSelectionOption = {
  value: string;
  label: string;
  detail?: string;
};

type PresetSelectionSheetProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  currentValue: string;
  options: PresetSelectionOption[];
  allowOther?: boolean;
  otherLabel?: string;
  otherValue?: string;
  otherPlaceholder?: string;
  onClose: () => void;
  onSelect: (value: string) => void;
  onOtherValueChange?: (value: string) => void;
  onOtherSubmit?: () => void;
};

export default function PresetSelectionSheet({
  visible,
  title,
  subtitle,
  currentValue,
  options,
  allowOther,
  otherLabel,
  otherValue,
  otherPlaceholder,
  onClose,
  onSelect,
  onOtherValueChange,
  onOtherSubmit,
}: PresetSelectionSheetProps) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!visible) return;
    setSearch("");
  }, [visible]);

  const filteredOptions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => `${option.label} ${option.detail ?? ""}`.toLowerCase().includes(query));
  }, [options, search]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.root}>
        <Pressable style={s.overlay} onPress={onClose} />
        <View style={s.sheet}>
        <View style={s.handle} />
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{title}</Text>
            {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
          </View>
          <Pressable style={s.closeButton} onPress={onClose}>
            <Text style={s.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar..."
            placeholderTextColor="#7c8ba1"
            style={s.searchInput}
          />
        </View>

        <ScrollView style={s.scroll} contentContainerStyle={s.grid} showsVerticalScrollIndicator={false}>
          {filteredOptions.map((option) => {
            const active = currentValue.trim().toLowerCase() === option.value.trim().toLowerCase();
            return (
              <Pressable
                key={`${title}:${option.value}`}
                style={[s.optionCard, active && s.optionCardActive]}
                onPress={() => {
                  onSelect(active ? "" : option.value);
                  onClose();
                }}>
                <Text style={[s.optionLabel, active && s.optionLabelActive]}>{option.label}</Text>
                {option.detail ? <Text style={[s.optionDetail, active && s.optionDetailActive]}>{option.detail}</Text> : null}
              </Pressable>
            );
          })}

          {allowOther ? (
            <View style={s.otherWrap}>
              <Text style={s.otherLabel}>{otherLabel ?? "Outro valor"}</Text>
              <View style={s.otherRow}>
                <TextInput
                  value={otherValue ?? ""}
                  onChangeText={(text) => onOtherValueChange?.(text)}
                  placeholder={otherPlaceholder ?? "Digite o valor"}
                  placeholderTextColor="#7c8ba1"
                  keyboardType="decimal-pad"
                  style={s.otherInput}
                />
                <Pressable
                  style={[s.otherButton, !(otherValue ?? "").trim() && s.otherButtonDisabled]}
                  onPress={onOtherSubmit}
                  disabled={!(otherValue ?? "").trim()}>
                  <Text style={s.otherButtonText}>+ Add</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.42)",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#f8f5ef",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "#d6e0ef",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#d7e2e0",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#476769",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#e6efe9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#64748b",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    borderRadius: 16,
    backgroundColor: "#fffdfa",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
    padding: 0,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    gap: 10,
    paddingBottom: 8,
  },
  optionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    backgroundColor: "#eef4ff",
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  optionCardActive: {
    backgroundColor: AppDesign.accent.primaryMuted,
    borderColor: AppDesign.accent.primary,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#334155",
  },
  optionLabelActive: {
    color: AppDesign.accent.teal,
  },
  optionDetail: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    lineHeight: 18,
  },
  optionDetailActive: {
    color: AppDesign.accent.teal,
  },
  otherWrap: {
    gap: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#d6e0ef",
  },
  otherLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  otherRow: {
    flexDirection: "row",
    gap: 10,
  },
  otherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d6e0ef",
    borderRadius: 16,
    backgroundColor: "#fffdfa",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "700",
  },
  otherButton: {
    borderRadius: 16,
    backgroundColor: AppDesign.accent.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  otherButtonDisabled: {
    opacity: 0.4,
  },
  otherButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});
