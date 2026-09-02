import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTr } from "../../../lib/use-tr";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../../design-system/theme";

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

type SemanticTone = "neutral" | "primary" | "success" | "warning" | "critical";

function isDontKnow(optionId: string): boolean {
  const normalized = optionId.toLowerCase().replace(/-/g, "_");
  return normalized === "nao_sei" || normalized === "naosei" || normalized === "incerto";
}

function getSemanticTone(optionId: string): SemanticTone {
  if (isDontKnow(optionId)) return "primary";

  if (
    optionId === "chocavel" ||
    optionId === "sem_pulso" ||
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
  ) return "critical";

  if (
    optionId === "rosc" ||
    optionId === "com_pulso" ||
    optionId === "sim" ||
    optionId === "meta_atingida" ||
    optionId === "perfusao_adequada" ||
    optionId === "baixa_probabilidade" ||
    optionId === "boa_resposta"
  ) return "success";

  if (
    optionId === "possivel_sepse_sem_choque" ||
    optionId === "sepse_risco_moderado" ||
    optionId === "pa_intermediaria" ||
    optionId === "k_entre_3_5_e_5_5" ||
    optionId === "ph_maior_69"
  ) return "warning";

  if (
    optionId === "nao_chocavel" ||
    optionId === "pa_alta_acima_110" ||
    optionId === "k_acima_5_5" ||
    optionId === "uti" ||
    optionId === "hemorragico"
  ) return "primary";

  return "neutral";
}

function DecisionGrid({ options, onSelect, title }: DecisionGridProps) {
  const tr = useTr();
  const e = useEstilosDoTema(criarEstilos);

  if (options.length === 0) return null;

  return (
    <View style={e.card} accessibilityRole="summary">
      <View style={e.heading}>
        <Text style={e.eyebrow}>{tr("Escolha agora")}</Text>
        <Text style={e.title}>{title ? tr(title) : tr("Toque na resposta")}</Text>
      </View>

      <View style={e.options}>
        {options.map((option) => {
          const tone = getSemanticTone(option.id);
          const dontKnow = isDontKnow(option.id);
          const sublabel = option.sublabel ?? (dontKnow ? "Abrir avaliação guiada" : undefined);

          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={tr(option.label)}
              accessibilityHint={dontKnow ? tr("Abrir avaliação guiada") : undefined}
              onPress={() => onSelect(option.id)}
              style={({ pressed }) => [
                e.option,
                e.optionTone[tone],
                dontKnow && e.dontKnow,
                pressed && e.pressed,
              ]}
            >
              <View style={[e.dot, e.dotTone[tone]]} />
              <View style={e.copy}>
                <Text style={[e.label, tone !== "neutral" && e.labelStrong]}>
                  {tr(option.label)}
                </Text>
                {sublabel ? <Text style={e.sublabel}>{tr(sublabel)}</Text> : null}
              </View>
              <Text style={[e.chevron, dontKnow && e.chevronHelp]}>{dontKnow ? "?" : "›"}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    card: {
      backgroundColor: t.cores.surface,
      borderRadius: RAIO.card,
      borderWidth: 1,
      borderColor: t.cores.border,
      padding: ESPACO.md,
      gap: ESPACO.md,
    },
    heading: {
      gap: 2,
      paddingBottom: ESPACO.xs,
    },
    eyebrow: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      ...TIPOGRAFIA.caption,
      color: t.cores.textSecondary,
      fontWeight: "700",
    },
    options: { gap: ESPACO.sm },
    option: {
      minHeight: TOQUE.critico + 8,
      flexDirection: "row",
      alignItems: "center",
      gap: ESPACO.md,
      borderRadius: RAIO.botao,
      borderWidth: 1,
      borderColor: t.cores.border,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.md,
    },
    dontKnow: {
      borderWidth: 1.5,
    },
    pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
    dot: { width: 10, height: 10, borderRadius: 999, backgroundColor: t.cores.border },
    copy: { flex: 1, gap: 3 },
    label: { ...TIPOGRAFIA.body, color: t.cores.text, fontWeight: "700" },
    labelStrong: { fontWeight: "800" },
    sublabel: { ...TIPOGRAFIA.micro, color: t.cores.textSecondary, fontWeight: "500" },
    chevron: {
      ...TIPOGRAFIA.body,
      color: t.cores.textSecondary,
      fontWeight: "900",
      width: TOQUE.minimo,
      textAlign: "center",
    },
    chevronHelp: {
      color: t.cores.primary,
    },
  }),
  optionTone: StyleSheet.create({
    neutral: {},
    primary: { borderColor: t.cores.primary },
    success: { borderColor: t.cores.success },
    warning: { borderColor: t.cores.warning },
    critical: { borderColor: t.cores.critical },
  }),
  dotTone: StyleSheet.create({
    neutral: { backgroundColor: t.cores.border },
    primary: { backgroundColor: t.cores.primary },
    success: { backgroundColor: t.cores.success },
    warning: { backgroundColor: t.cores.warning },
    critical: { backgroundColor: t.cores.critical },
  }),
});

export { DecisionOption };
export default DecisionGrid;
