import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { ESPACO, RAIO, SOMBRA, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type ToastProps = {
  mensagem: string;
  visivel: boolean;
  onFechar: () => void;
  tom?: "neutro" | "success" | "critical" | "warning";
  /** Some sozinho depois de N ms. 0 = fica até fecharem. Padrão: 4000. */
  duracao?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Aviso passageiro — "conduta registrada", "falha ao salvar".
 *
 * Não bloqueia a tela e não pede confirmação: se a mensagem exige decisão, é
 * `Modal`. Erro que impede seguir NÃO deve usar duração automática — passe
 * `duracao={0}` para o aviso não sumir antes de ser lido.
 */
export function Toast({
  mensagem,
  visivel,
  onFechar,
  tom = "neutro",
  duracao = 4000,
  style,
  testID,
}: ToastProps) {
  const e = useEstilosDoTema(criarEstilos);

  useEffect(() => {
    if (!visivel || duracao <= 0) return;
    const id = setTimeout(onFechar, duracao);
    return () => clearTimeout(id);
  }, [visivel, duracao, onFechar]);

  if (!visivel) return null;

  return (
    <View
      style={[e.wrapper, style]}
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${mensagem}. Toque para dispensar.`}
        onPress={onFechar}
        style={({ pressed }) => [e.caixa, e.tom[tom], SOMBRA, pressed && e.pressionado]}
      >
        <Text style={e.texto}>{mensagem}</Text>
      </Pressable>
    </View>
  );
}

const criarEstilos = (t: Tema) => ({
  ...StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: ESPACO.md,
      right: ESPACO.md,
      bottom: ESPACO.lg,
      alignItems: "center",
    },
    caixa: {
      minHeight: TOQUE.minimo,
      justifyContent: "center",
      maxWidth: 480,
      width: "100%",
      paddingHorizontal: ESPACO.md,
      paddingVertical: ESPACO.sm,
      borderRadius: RAIO.card,
      borderWidth: 1,
    },
    pressionado: { opacity: 0.9 },
    texto: { ...TIPOGRAFIA.caption, color: t.cores.text },
  }),
  tom: StyleSheet.create({
    neutro: { backgroundColor: t.cores.surface, borderColor: t.cores.border },
    success: { backgroundColor: t.cores.surface, borderColor: t.cores.success },
    critical: { backgroundColor: t.cores.surface, borderColor: t.cores.critical },
    warning: { backgroundColor: t.cores.surface, borderColor: t.cores.warning },
  }),
});
