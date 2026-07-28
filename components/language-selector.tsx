import { Pressable, StyleSheet, Text, View } from "react-native";

import { TOQUE } from "../design-system/tokens";
import { useLanguage } from "../lib/language-context";

/**
 * Seletor de idioma PT/ES — visível e claro. Usado na tela de login e no hub.
 * Troca o idioma do app inteiro (texto, áudio e comandos de voz).
 */
export default function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();

  return (
    <View style={[s.wrap, compact && s.wrapCompact]}>
      <Text style={s.globe}>🌐</Text>
      <View style={s.group}>
        <Pressable
          style={[s.opt, locale === "pt-BR" && s.optActive]}
          onPress={() => setLocale("pt-BR")}
          accessibilityRole="button"
          accessibilityLabel="Português">
          <Text style={[s.txt, locale === "pt-BR" && s.txtActive]}>
            {compact ? "PT" : "Português"}
          </Text>
        </Pressable>
        <Pressable
          style={[s.opt, locale === "es-419" && s.optActive]}
          onPress={() => setLocale("es-419")}
          accessibilityRole="button"
          accessibilityLabel="Español">
          <Text style={[s.txt, locale === "es-419" && s.txtActive]}>
            {compact ? "ES" : "Español"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wrapCompact: {
    gap: 6,
  },
  globe: {
    fontSize: 16,
  },
  group: {
    flexDirection: "row",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#7fb3ff",
    backgroundColor: "#0b1220",
    overflow: "hidden",
  },
  opt: {
    paddingHorizontal: 18,
    // 44 px é o mínimo do plano UI 2.0; antes eram 35 px. Achado pelo teste de
    // travessia da Fase 7 — o seletor de idioma fica montado sob todo módulo.
    minHeight: TOQUE.minimo,
    justifyContent: "center",
  },
  optActive: {
    backgroundColor: "#4d9aff",
  },
  txt: {
    fontSize: 14,
    fontWeight: "900",
    color: "#cbd5e1",
    letterSpacing: 0.5,
  },
  txtActive: {
    color: "#04121a",
  },
});
