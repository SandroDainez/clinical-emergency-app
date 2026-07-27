import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { ESPACO, RAIO, TIPOGRAFIA, TOQUE } from "../../design-system/tokens";
import { useEstilosDoTema, type Tema } from "../../design-system/theme";

export type InputProps = Omit<TextInputProps, "style"> & {
  rotulo?: string;
  /** Texto de apoio abaixo do campo. Substituído pelo erro quando houver. */
  ajuda?: string;
  /** Mensagem de erro — assume a cor crítica e é anunciada na acessibilidade. */
  erro?: string;
  /** Sufixo fixo à direita (kg, mL, mmHg…). */
  unidade?: string;
  style?: StyleProp<ViewStyle>;
};

/** Campo de texto da UI 2.0. */
export function Input({
  rotulo,
  ajuda,
  erro,
  unidade,
  style,
  editable = true,
  ...rest
}: InputProps) {
  const e = useEstilosDoTema(criarEstilos);
  const [focado, setFocado] = useState(false);

  return (
    <View style={[e.wrapper, style]}>
      {rotulo ? <Text style={e.rotulo}>{rotulo}</Text> : null}
      <View
        style={[
          e.campo,
          focado && e.focado,
          !!erro && e.comErro,
          !editable && e.inativo,
        ]}
      >
        <TextInput
          {...rest}
          editable={editable}
          onFocus={(ev) => {
            setFocado(true);
            rest.onFocus?.(ev);
          }}
          onBlur={(ev) => {
            setFocado(false);
            rest.onBlur?.(ev);
          }}
          accessibilityLabel={rest.accessibilityLabel ?? rotulo}
          // Anuncia o erro junto do campo, não só visualmente.
          accessibilityHint={erro ?? ajuda ?? rest.accessibilityHint}
          placeholderTextColor={e.corPlaceholder}
          style={e.texto}
        />
        {unidade ? <Text style={e.unidade}>{unidade}</Text> : null}
      </View>
      {erro || ajuda ? (
        <Text style={[e.ajuda, !!erro && e.textoErro]}>{erro ?? ajuda}</Text>
      ) : null}
    </View>
  );
}

const criarEstilos = (t: Tema) => {
  const cores = t.cores;
  return {
    ...StyleSheet.create({
      wrapper: { gap: ESPACO.xs },
      rotulo: { ...TIPOGRAFIA.micro, color: cores.textSecondary },
      campo: {
        minHeight: TOQUE.minimo,
        flexDirection: "row",
        alignItems: "center",
        gap: ESPACO.sm,
        paddingHorizontal: ESPACO.md,
        borderRadius: RAIO.input,
        borderWidth: 1,
        borderColor: cores.border,
        backgroundColor: cores.surface,
      },
      focado: { borderColor: cores.primary },
      comErro: { borderColor: cores.critical },
      inativo: { opacity: 0.5 },
      texto: {
        flex: 1,
        ...TIPOGRAFIA.body,
        color: cores.text,
        // Remove o contorno do navegador: o foco já é sinalizado pela borda.
        outlineStyle: "none",
      } as never,
      unidade: { ...TIPOGRAFIA.caption, color: cores.textSecondary },
      ajuda: { ...TIPOGRAFIA.micro, color: cores.textSecondary, fontWeight: "400" },
      textoErro: { color: cores.critical, fontWeight: "600" },
    }),
    corPlaceholder: cores.textSecondary,
  };
};
