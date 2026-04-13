import { Pressable, Text, View } from "react-native";
import { palette, spacing, typography } from "../design-tokens";

type DecisionOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type DecisionGridProps = {
  options: DecisionOption[];
  onSelect: (id: string) => void;
  title?: string;
};

type OptionTone = {
  background: string;
  backgroundPressed: string;
  border: string;
  accent: string;
  accentLight: string;
  labelColor: string;
  sublabelColor: string;
};

function getOptionTone(optionId: string): OptionTone {
  if (optionId === "chocavel") {
    return {
      background: "#fff1f2",
      backgroundPressed: "#fee2e2",
      border: "#fecdd3",
      accent: "#dc2626",
      accentLight: "#fef2f2",
      labelColor: "#7f1d1d",
      sublabelColor: "#b91c1c",
    };
  }

  if (optionId === "nao_chocavel") {
    return {
      background: "#eff6ff",
      backgroundPressed: "#dbeafe",
      border: "#bfdbfe",
      accent: "#2563eb",
      accentLight: "#f0f9ff",
      labelColor: "#1e3a8a",
      sublabelColor: "#1d4ed8",
    };
  }

  if (optionId === "rosc" || optionId === "com_pulso") {
    return {
      background: "#ecfdf5",
      backgroundPressed: "#d1fae5",
      border: "#bbf7d0",
      accent: "#16a34a",
      accentLight: "#f0fdf4",
      labelColor: "#166534",
      sublabelColor: "#15803d",
    };
  }

  if (optionId === "sem_pulso") {
    return {
      background: "#fff7ed",
      backgroundPressed: "#ffedd5",
      border: "#fed7aa",
      accent: "#ea580c",
      accentLight: "#fff7ed",
      labelColor: "#9a3412",
      sublabelColor: "#c2410c",
    };
  }

  if (optionId === "encerrar") {
    return {
      background: "#f8fafc",
      backgroundPressed: "#f1f5f9",
      border: "#e2e8f0",
      accent: "#64748b",
      accentLight: "#f8fafc",
      labelColor: "#334155",
      sublabelColor: "#475569",
    };
  }

  return {
    background: palette.surface,
    backgroundPressed: "#f1f5f9",
    border: palette.borderStrong,
    accent: "#0ea5e9",
    accentLight: "#f0f9ff",
    labelColor: palette.text,
    sublabelColor: "#475569",
  };
}

function DecisionGrid({ options, onSelect, title }: DecisionGridProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderRadius: 24,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        paddingHorizontal: 16,
        paddingVertical: 18,
        gap: 10,
        shadowColor: "#0f172a",
        shadowOpacity: 0.06,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
        elevation: 3,
      }}>
      <View style={{ gap: 3, marginBottom: 4 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "800",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}>
          Decisão clínica
        </Text>
        <Text
          style={{
            ...typography.title,
            color: "#0f172a",
            fontSize: 16,
            fontWeight: "700",
          }}>
          {title ?? "Toque para avançar"}
        </Text>
      </View>
      {options.map((option) => {
        const tone = getOptionTone(option.id);

        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => ({
              minHeight: option.sublabel ? 80 : 68,
              backgroundColor: pressed ? tone.backgroundPressed : tone.background,
              borderRadius: 18,
              borderWidth: 1.5,
              borderColor: pressed ? tone.accent : tone.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              justifyContent: "center",
              shadowColor: tone.accent,
              shadowOpacity: pressed ? 0 : 0.08,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: pressed ? 0 : 2,
            })}
            onPress={() => onSelect(option.id)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: option.sublabel ? "flex-start" : "center",
                gap: 12,
              }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: tone.accent,
                  marginTop: option.sublabel ? 5 : 0,
                  flexShrink: 0,
                }}
              />
              <View style={{ flex: 1, gap: 3 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: tone.labelColor,
                    lineHeight: 22,
                  }}>
                  {option.label}
                </Text>
                {option.sublabel ? (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: tone.sublabelColor,
                      lineHeight: 18,
                      opacity: 0.85,
                    }}>
                    {option.sublabel}
                  </Text>
                ) : null}
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export { DecisionOption };
export default DecisionGrid;
