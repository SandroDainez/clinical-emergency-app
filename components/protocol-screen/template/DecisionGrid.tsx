import { Pressable, Text, View } from "react-native";
import { palette, typography } from "../design-tokens";

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
  labelColor: string;
  sublabelColor: string;
};

function getOptionTone(optionId: string): OptionTone {
  if (optionId === "chocavel") {
    return {
      background: "#ffe8eb",
      backgroundPressed: "#ffd7dd",
      border: "#f3a7b3",
      accent: "#dc2626",
      labelColor: "#7f1d1d",
      sublabelColor: "#b91c1c",
    };
  }

  if (optionId === "nao_chocavel") {
    return {
      background: "#e7f0ff",
      backgroundPressed: "#d7e6ff",
      border: "#a7c5ff",
      accent: "#2563eb",
      labelColor: "#1e3a8a",
      sublabelColor: "#1d4ed8",
    };
  }

  if (optionId === "rosc" || optionId === "com_pulso" || optionId === "sim" || optionId === "meta_atingida" || optionId === "perfusao_adequada" || optionId === "baixa_probabilidade") {
    return {
      background: "#e7f0ff",
      backgroundPressed: "#d7e6ff",
      border: "#a7c5ff",
      accent: "#2563eb",
      labelColor: "#1e3a8a",
      sublabelColor: "#1d4ed8",
    };
  }

  if (optionId === "sem_pulso" || optionId === "possivel_sepse_sem_choque" || optionId === "sepse_risco_moderado") {
    return {
      background: "#fff0e4",
      backgroundPressed: "#ffe2cf",
      border: "#f6bf8d",
      accent: "#ea580c",
      labelColor: "#9a3412",
      sublabelColor: "#c2410c",
    };
  }

  if (
    optionId === "alta_probabilidade_ou_choque" ||
    optionId === "choque_ou_alta_probabilidade" ||
    optionId === "suspeita_choque_septico" ||
    optionId === "choque_refratario" ||
    optionId === "hipoperfusao_ou_hipotensao" ||
    optionId === "sepse_alto_risco"
  ) {
    return {
      background: "#ffe8eb",
      backgroundPressed: "#ffd7dd",
      border: "#f3a7b3",
      accent: "#dc2626",
      labelColor: "#7f1d1d",
      sublabelColor: "#b91c1c",
    };
  }

  if (optionId === "uti") {
    return {
      background: "#efe9ff",
      backgroundPressed: "#e5dcff",
      border: "#c9b6ff",
      accent: "#7c3aed",
      labelColor: "#4c1d95",
      sublabelColor: "#6d28d9",
    };
  }

  return {
    background: "#edf2ef",
    backgroundPressed: "#e2ebe6",
    border: "#c7d5cf",
    accent: "#496067",
    labelColor: "#334155",
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
        backgroundColor: palette.surface,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: palette.border,
        paddingHorizontal: 18,
        paddingVertical: 20,
        gap: 12,
        shadowColor: "#07181a",
        shadowOpacity: 0.14,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 12 },
        elevation: 6,
      }}>
      <View style={{ gap: 4, marginBottom: 6 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "900",
            color: palette.muted,
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}>
          Decisão clínica
        </Text>
        <Text
          style={{
            ...typography.title,
            color: palette.text,
            fontSize: 20,
            fontWeight: "900",
          }}>
          {title ?? "Escolha o próximo passo"}
        </Text>
      </View>

      {options.map((option) => {
        const tone = getOptionTone(option.id);

        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => ({
              minHeight: option.sublabel ? 102 : 84,
              backgroundColor: pressed ? tone.backgroundPressed : tone.background,
              borderRadius: 24,
              borderWidth: 1.5,
              borderColor: pressed ? tone.accent : tone.border,
              paddingHorizontal: 18,
              paddingVertical: 16,
              justifyContent: "center",
              shadowColor: tone.accent,
              shadowOpacity: pressed ? 0 : 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: pressed ? 0 : 2,
            })}
            onPress={() => onSelect(option.id)}>
            <View style={{ flexDirection: "row", alignItems: option.sublabel ? "flex-start" : "center", gap: 12 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  backgroundColor: tone.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: option.sublabel ? 1 : 0,
                  flexShrink: 0,
                }}>
                <Text style={{ color: "#ffffff", fontWeight: "900", fontSize: 18 }}>›</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "800",
                    color: tone.labelColor,
                    lineHeight: 22,
                  }}>
                  {option.label}
                </Text>
                {option.sublabel ? (
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: tone.sublabelColor,
                      lineHeight: 18,
                      opacity: 0.92,
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
