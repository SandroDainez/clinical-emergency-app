import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { useTr } from "../../lib/use-tr";
import { Header } from "./header";
import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type CalculatorScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

/**
 * Cabeçalho canônico das calculadoras clínicas.
 *
 * Usa a mesma gramática do Clinical Cockpit: voltar à esquerda, identidade no
 * centro e saída explícita para o hub de módulos à direita. A calculadora segue
 * sendo uma calculadora, mas deixa de parecer outro aplicativo.
 */
export function CalculatorScreenHeader({ title, onBack, right }: CalculatorScreenHeaderProps) {
  const tr = useTr();
  const router = useRouter();
  const e = useEstilosDoTema(criarEstilos);

  return (
    <Header
      titulo={title}
      etapa={tr("Calculadora clínica")}
      onVoltar={onBack}
      labelVoltar={tr("Voltar")}
      direita={
        <View style={e.direita}>
          {right}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr("Módulos")}
            onPress={() => router.replace("/modulos" as never)}
            style={({ pressed }) => [e.modulos, pressed && e.pressionado]}>
            <Text style={e.modulosTexto}>{tr("MÓDULOS")}</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const criarEstilos = (t: Tema) =>
  StyleSheet.create({
    direita: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: ESPACO.sm,
    },
    modulos: {
      minHeight: TOQUE.minimo,
      minWidth: 92,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: RAIO.botao,
      borderWidth: 1.5,
      borderColor: t.cores.primary,
      backgroundColor: t.cores.bg,
      paddingHorizontal: ESPACO.sm,
    },
    modulosTexto: {
      ...TIPOGRAFIA.micro,
      color: t.cores.primary,
      fontWeight: "900",
      letterSpacing: 0.35,
    },
    pressionado: { opacity: 0.78, transform: [{ scale: 0.97 }] },
  });
