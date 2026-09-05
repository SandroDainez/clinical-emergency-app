import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useTr } from "../../lib/use-tr";
import { TEMAS, TIPOGRAFIA, RAIO, ESPACO } from "../../design-system/tokens";

type ModuleRailItem = {
  id: string | number;
  icon?: string;
  label: string;
  hint?: string;
  step?: string;
  accent?: string;
  simbolo?: string;
};

/**
 * Navegação interna de módulos/calculadoras no mesmo idioma visual do Clinical Cockpit.
 *
 * Não cria uma segunda identidade clara: usa exclusivamente o tema escuro da UI v2,
 * mantém tipografia, bordas e estados ativos coerentes com AVC e demais fluxos.
 */
export function RailDeModulo({
  items,
  activeId,
  onSelect,
  eyebrow = "Navegação do módulo",
  titulo,
}: {
  items: ModuleRailItem[];
  activeId: string | number;
  onSelect: (id: string | number) => void;
  eyebrow?: string;
  titulo?: string;
}) {
  const tr = useTr();
  const { width } = useWindowDimensions();
  const lateral = width >= 920;
  const c = TEMAS.escuro.cores;

  return (
    <View style={[styles.wrap, lateral ? styles.lateral : styles.horizontal]}>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: c.primary }]}>{tr(eyebrow)}</Text>
        {titulo ? <Text style={[styles.title, { color: c.text }]}>{tr(titulo)}</Text> : null}
      </View>

      <ScrollView
        horizontal={!lateral}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={!lateral}
        persistentScrollbar={!lateral}
        contentContainerStyle={lateral ? styles.listVertical : styles.listHorizontal}>
        {items.map((item, index) => {
          const active = item.id === activeId;
          return (
            <Pressable
              key={String(item.id)}
              onPress={() => onSelect(item.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.item,
                !lateral && styles.itemHorizontal,
                { borderColor: active ? c.primary : c.border, backgroundColor: active ? c.surface : c.bg },
                pressed && styles.pressed,
              ]}>
              <View style={[styles.symbol, { backgroundColor: active ? c.primary : c.surface, borderColor: active ? c.primary : c.border }]}>
                <Text style={[styles.symbolText, { color: active ? c.onPrimary : c.textSecondary }]}>
                  {item.simbolo ?? item.step ?? String(index + 1)}
                </Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: active ? c.text : c.textSecondary }]} numberOfLines={2}>
                  {item.icon ? `${item.icon} ${tr(item.label)}` : tr(item.label)}
                </Text>
                {item.hint && lateral ? (
                  <Text style={[styles.hint, { color: c.textSecondary }]} numberOfLines={2}>{tr(item.hint)}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: TEMAS.escuro.cores.bg,
    borderColor: TEMAS.escuro.cores.border,
    borderWidth: 1,
    gap: ESPACO.sm,
  },
  lateral: {
    width: 236,
    padding: ESPACO.md,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  horizontal: {
    width: "100%",
    paddingHorizontal: ESPACO.md,
    paddingVertical: ESPACO.sm,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  heading: { gap: 3 },
  eyebrow: {
    fontSize: TIPOGRAFIA.micro.fontSize,
    lineHeight: TIPOGRAFIA.micro.lineHeight,
    fontWeight: "900",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: TIPOGRAFIA.body.fontSize,
    lineHeight: TIPOGRAFIA.body.lineHeight,
    fontWeight: "900",
  },
  listVertical: { gap: 7, paddingBottom: ESPACO.sm },
  listHorizontal: { flexDirection: "row", gap: 8, paddingRight: ESPACO.md },
  item: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: RAIO.input,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  itemHorizontal: { minWidth: 176 },
  pressed: { opacity: 0.78 },
  symbol: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  symbolText: { fontSize: 13, fontWeight: "900" },
  copy: { flex: 1, minWidth: 0 },
  label: {
    fontSize: TIPOGRAFIA.caption.fontSize,
    lineHeight: TIPOGRAFIA.caption.lineHeight,
    fontWeight: "800",
  },
  hint: {
    marginTop: 2,
    fontSize: TIPOGRAFIA.micro.fontSize,
    lineHeight: TIPOGRAFIA.micro.lineHeight,
    fontWeight: "600",
  },
});