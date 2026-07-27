import { Pressable, Text, View } from "react-native";
import { useTr } from "../../../lib/use-tr";

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
      background: "#450a0a",
      backgroundPressed: "#7f1d1d",
      border: "#991b1b",
      accent: "#f87171",
      labelColor: "#fca5a5",
      sublabelColor: "#fca5a5",
    };
  }

  if (optionId === "nao_chocavel") {
    return {
      background: "#1e3a5f",
      backgroundPressed: "#1e40af",
      border: "#2563eb",
      accent: "#60a5fa",
      labelColor: "#93c5fd",
      sublabelColor: "#93c5fd",
    };
  }

  if (optionId === "rosc" || optionId === "com_pulso") {
    return {
      background: "#052e16",
      backgroundPressed: "#14532d",
      border: "#166534",
      accent: "#4ade80",
      labelColor: "#86efac",
      sublabelColor: "#4ade80",
    };
  }

  if (optionId === "sem_pulso") {
    return {
      background: "#431407",
      backgroundPressed: "#7c2d12",
      border: "#c2410c",
      accent: "#fb923c",
      labelColor: "#fdba74",
      sublabelColor: "#fdba74",
    };
  }

  if (optionId === "encerrar") {
    return {
      background: "#1e293b",
      backgroundPressed: "#334155",
      border: "#475569",
      accent: "#94a3b8",
      labelColor: "#cbd5e1",
      sublabelColor: "#94a3b8",
    };
  }

  if (
    optionId === "sim" ||
    optionId === "meta_atingida" ||
    optionId === "perfusao_adequada" ||
    optionId === "baixa_probabilidade" ||
    optionId === "boa_resposta"
  ) {
    return {
      background: "#052e16",
      backgroundPressed: "#14532d",
      border: "#166534",
      accent: "#4ade80",
      labelColor: "#86efac",
      sublabelColor: "#4ade80",
    };
  }

  if (
    optionId === "alta_probabilidade_ou_choque" ||
    optionId === "choque_ou_alta_probabilidade" ||
    optionId === "suspeita_choque_septico" ||
    optionId === "choque_refratario" ||
    optionId === "hipoperfusao_ou_hipotensao" ||
    optionId === "sepse_alto_risco" ||
    optionId === "sem_resposta_ou_parcial" ||
    optionId === "isquemico" ||
    optionId === "sdra_grave_pf_menor_150" ||
    optionId === "k_abaixo_3_5" ||
    optionId === "ph_menor_69" ||
    optionId === "pa_baixa_choque"
  ) {
    return {
      background: "#450a0a",
      backgroundPressed: "#7f1d1d",
      border: "#991b1b",
      accent: "#f87171",
      labelColor: "#fca5a5",
      sublabelColor: "#fca5a5",
    };
  }

  if (optionId === "uti" || optionId === "hemorragico") {
    return {
      background: "#2e1065",
      backgroundPressed: "#4c1d95",
      border: "#6d28d9",
      accent: "#a78bfa",
      labelColor: "#c4b5fd",
      sublabelColor: "#c4b5fd",
    };
  }

  if (
    optionId === "nao" ||
    optionId === "incerta_reavaliar" ||
    optionId === "reavaliar_clinicamente" ||
    optionId === "continuar_reavaliando" ||
    optionId === "sem_sdra_ou_leve"
  ) {
    return {
      background: "#1e293b",
      backgroundPressed: "#334155",
      border: "#475569",
      accent: "#94a3b8",
      labelColor: "#cbd5e1",
      sublabelColor: "#94a3b8",
    };
  }

  if (
    optionId === "possivel_sepse_sem_choque" ||
    optionId === "sepse_risco_moderado" ||
    optionId === "pa_intermediaria" ||
    optionId === "k_entre_3_5_e_5_5" ||
    optionId === "ph_maior_69"
  ) {
    return {
      background: "#431407",
      backgroundPressed: "#7c2d12",
      border: "#c2410c",
      accent: "#fb923c",
      labelColor: "#fdba74",
      sublabelColor: "#fdba74",
    };
  }

  if (optionId === "pa_alta_acima_110" || optionId === "k_acima_5_5") {
    return {
      background: "#1e3a5f",
      backgroundPressed: "#1e40af",
      border: "#2563eb",
      accent: "#60a5fa",
      labelColor: "#93c5fd",
      sublabelColor: "#93c5fd",
    };
  }

  // default
  return {
    background: "#1e293b",
    backgroundPressed: "#273448",
    border: "#334155",
    accent: "#0e7490",
    labelColor: "#e2e8f0",
    sublabelColor: "#64748b",
  };
}

function DecisionGrid({ options, onSelect, title }: DecisionGridProps) {
  const tr = useTr();
  if (options.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: "#262a32",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#3a404a",
        paddingHorizontal: 14,
        paddingVertical: 16,
        gap: 10,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}>
      <View style={{ gap: 3, marginBottom: 2 }}>
        <Text
          style={{
            fontSize: 10,
            fontWeight: "800",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: 1.2,
          }}>
          {tr("Decisão clínica")}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#f1f5f9",
            lineHeight: 22,
          }}>
          {title ? tr(title) : tr("Toque para avançar")}
        </Text>
      </View>
      {options.map((option) => {
        const tone = getOptionTone(option.id);
        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => ({
              minHeight: option.sublabel ? 78 : 64,
              backgroundColor: pressed ? tone.backgroundPressed : tone.background,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: pressed ? tone.accent : tone.border,
              paddingHorizontal: 16,
              paddingVertical: 14,
              justifyContent: "center",
              shadowColor: tone.accent,
              shadowOpacity: pressed ? 0 : 0.15,
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
                    fontSize: 16,
                    fontWeight: "700",
                    color: tone.labelColor,
                    lineHeight: 22,
                  }}>
                  {tr(option.label)}
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
                    {tr(option.sublabel)}
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
