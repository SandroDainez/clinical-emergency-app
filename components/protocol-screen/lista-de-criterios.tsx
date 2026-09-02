import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import { useTr } from "../../lib/use-tr";

export type ListaDeCriteriosProps = {
  itens: string[];
  rotuloAberto?: string;
  rotuloOculto?: string;
  estilos: {
    lista: StyleProp<ViewStyle>;
    linha: StyleProp<ViewStyle>;
    marcador: StyleProp<ViewStyle>;
    texto: StyleProp<TextStyle>;
    alternar: StyleProp<TextStyle>;
  };
};

/**
 * Lista de critérios recolhida por padrão quando há mais de dois itens.
 *
 * Este é o mesmo comportamento do helper que já existia inline no shell:
 * conteúdo e ordem permanecem intactos; apenas a apresentação pode ser aberta
 * ou recolhida pelo usuário.
 */
export function ListaDeCriterios({
  itens,
  rotuloAberto,
  rotuloOculto,
  estilos,
}: ListaDeCriteriosProps) {
  const tr = useTr();
  const curta = itens.length <= 2;
  const [aberto, setAberto] = useState(curta);

  if (!itens.length) return null;

  return (
    <>
      {curta ? null : (
        <Pressable
          onPress={() => setAberto((valor) => !valor)}
          accessibilityRole="button"
          accessibilityState={{ expanded: aberto }}
          style={{ minHeight: 44, justifyContent: "center" }}
          hitSlop={8}
        >
          <Text style={estilos.alternar}>
            {aberto
              ? `${tr(rotuloOculto ?? "Ocultar critérios")} ▴`
              : `${tr(rotuloAberto ?? "Ver critérios")} (${itens.length}) ▾`}
          </Text>
        </Pressable>
      )}

      {aberto ? (
        <View style={estilos.lista}>
          {itens.map((item, index) => (
            <View key={index} style={estilos.linha}>
              <View style={estilos.marcador} />
              <Text style={estilos.texto}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}
