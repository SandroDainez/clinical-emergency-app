import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTr } from "../../lib/use-tr";
import { BottomSheet } from "../ui-v2";

/**
 * Card universal de "Estabilização primeiro (ABCDE)" exibido no topo de TODO
 * fluxo de protocolo. Princípio mestre: nenhum protocolo específico tem
 * prioridade sobre a estabilização imediata de uma ameaça à vida.
 *
 * Sempre visível (colapsável). Oferece atalhos diretos para os módulos de
 * estabilização (parada, via aérea, ventilação, choque, arritmias instáveis),
 * filtrando o módulo em que o usuário já está.
 */

type StabModule = { slug: string; label: string; icon: string };

const STAB_MODULES: StabModule[] = [
  { slug: "pcr-adulto", label: "Parada / RCP (ACLS)", icon: "🫀" },
  { slug: "isr-rapida", label: "Via aérea / IOT (ISR)", icon: "🫁" },
  { slug: "ventilacao-mecanica", label: "Ventilação mecânica", icon: "💨" },
  { slug: "drogas-vasoativas", label: "Choque / vasopressor", icon: "💉" },
  { slug: "bradicardia-acls", label: "Bradicardia instável", icon: "🐢" },
  { slug: "taquicardia-acls", label: "Taquicardia instável", icon: "⚡" },
];

const ABCDE: { letter: string; title: string; body: string }[] = [
  { letter: "A", title: "Via aérea", body: "Obstrução, estridor ou rebaixamento → abrir/aspirar, posicionar, considerar via aérea definitiva (IOT)." },
  { letter: "B", title: "Respiração", body: "Insuficiência respiratória / hipoxemia → O₂ alvo, VNI precoce; IOT + ventilação se falha ou exaustão." },
  { letter: "C", title: "Circulação", body: "Choque / hipotensão → 2 acessos, volume conforme contexto, vasopressor com alvo PAM ≥ 65 mmHg. Controlar sangramento." },
  { letter: "D", title: "Disfunção neuro", body: "Glasgow ≤ 8 → proteger via aérea. Tratar hipoglicemia, convulsão e causas reversíveis." },
  { letter: "E", title: "Exposição / ritmo", body: "Arritmia INSTÁVEL → cardioversão sincronizada ou marcapasso. Sem pulso → iniciar RCP/ACLS imediatamente." },
];

type Props = {
  /**
   * Forma compacta (UI 2.0). Mantém o alerta, a regra de prioridade e os
   * atalhos de estabilização — a parte ACIONÁVEL — e move o detalhamento ABCDE
   * para um painel de "ver mais".
   *
   * Existe por medição: expandido, este card ocupa ~859 px e empurra o passo
   * clínico para 1078 px numa tela de 839 — ou seja, o médico rolava para
   * alcançar a decisão em todos os 19 módulos, toda vez. Nada de conteúdo sai do
   * app: o ABCDE continua a um toque.
   */
  compacto?: boolean;
  /** Slug do módulo atual — removido dos atalhos para não auto-referenciar. */
  currentModuleSlug?: string;
  onOpenModule: (slug: string) => void;
};

export default function StabilizationFirstCard({
  currentModuleSlug,
  onOpenModule,
  compacto = false,
}: Props) {
  const tr = useTr();

  /**
   * SEMPRE recolhido ao abrir. Não há prop para abrir por padrão, e isso é
   * deliberado.
   *
   * A versão anterior expandia no 1º passo (`defaultExpanded={stepCount === 1}`),
   * com a ideia de que o lembrete de estabilizar merecia destaque na entrada do
   * módulo. Na prática produziu exatamente o defeito que o usuário relata: ao
   * abrir o AVC, o card ocupava a tela inteira e o passo clínico — a razão de
   * ter aberto o módulo — nascia abaixo da dobra.
   *
   * A regra continua visível o tempo todo, no cabeçalho: "ABCDE antes do guia —
   * tratar ameaça à vida AGORA". O que fica atrás do toque é o DETALHE (atalhos
   * e ABCDE), e para isso o cabeçalho traz a chamada explícita. Quem precisa
   * estabilizar abre em um toque; quem não precisa vê o fluxo imediatamente.
   *
   * Sem prop de abrir por padrão, nenhuma tela consegue reintroduzir o defeito.
   */
  const [expanded, setExpanded] = useState(false);
  const [detalheAberto, setDetalheAberto] = useState(false);
  const modules = STAB_MODULES.filter((m) => m.slug !== currentModuleSlug);

  if (compacto) {
    return (
      <View style={styles.wrap}>
        {/* O cabeçalho é o alternador. Mesmo compacto, o card desenhava o
            alerta, a regra, cinco atalhos e o "ver ABCDE" em todos os passos —
            cerca de 600 px que empurravam a decisão clínica para baixo da dobra.
            A REGRA continua sempre visível no cabeçalho, que é o que não pode
            sumir; os atalhos abrem no toque. */}
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={tr("Estabilização primeiro")}
          testID="estabilizacao-alternar"
          style={styles.header}>
          <Text style={styles.headerIcon}>⚠️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{tr("Estabilização primeiro")}</Text>
            <Text style={styles.headerSub}>
              {tr("ABCDE antes do guia — tratar ameaça à vida AGORA")}
            </Text>
            {/* Chamada explícita: recolhido, o card não dizia que havia algo
                atrás dele. Um triângulo sozinho não convida ninguém a tocar —
                e o que está atrás é o que fazer ANTES de seguir o fluxo. */}
            {expanded ? null : (
              <Text style={styles.headerChamada}>
                {tr("Toque para ver o que fazer antes de prosseguir")}
              </Text>
            )}
          </View>
          <Text style={styles.chev}>{expanded ? "▲" : "▼"}</Text>
        </Pressable>

        {!expanded ? null : (
        <View style={styles.body}>
          {/* A regra de prioridade permanece VISÍVEL: é ela que diz ao médico
              para não seguir o guia com o paciente instável. */}
          <Text style={styles.principle}>
            {tr("Paciente instável? A prioridade é estabilizar — não seguir o guia enquanto houver ameaça imediata à vida. Estabilize e depois retome o fluxo.")}
          </Text>

          {/* Atalhos permanecem: são o caminho rápido para estabilizar. */}
          <Text style={styles.shortcutLabel}>{tr("Abrir módulo de estabilização:")}</Text>
          <View style={styles.shortcutWrap}>
            {modules.map((m) => (
              <Pressable
                key={m.slug}
                style={({ pressed }) => [styles.shortcutChip, pressed && styles.shortcutChipPressed]}
                onPress={() => onOpenModule(m.slug)}>
                <Text style={styles.shortcutIcon}>{m.icon}</Text>
                <Text style={styles.shortcutText}>{tr(m.label)}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tr("Ver o ABCDE completo")}
            onPress={() => setDetalheAberto(true)}
            style={({ pressed }) => [styles.verMais, pressed && { opacity: 0.7 }]}>
            <Text style={styles.verMaisTexto}>{tr("Ver ABCDE completo")}</Text>
          </Pressable>
        </View>
        )}

        <BottomSheet
          visivel={detalheAberto}
          onFechar={() => setDetalheAberto(false)}
          titulo={tr("ABCDE — estabilização")}
        >
          {ABCDE.map((row) => (
            <View key={row.letter} style={styles.abcdeRow}>
              <View style={styles.letterBadge}>
                <Text style={styles.letterBadgeText}>{row.letter}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeTitle}>{tr(row.title)}</Text>
                <Text style={styles.abcdeBody}>{tr(row.body)}</Text>
              </View>
            </View>
          ))}
        </BottomSheet>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.85 }]}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel="Estabilização primeiro — ABCDE">
        <Text style={styles.headerIcon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{tr("Estabilização primeiro")}</Text>
          <Text style={styles.headerSub}>{tr("ABCDE antes do guia — tratar ameaça à vida AGORA")}</Text>
          {/* Mesma chamada do ramo compacto: recolhido, um triângulo sozinho não
              convida ninguém a tocar — e o que está atrás é o que fazer ANTES
              de seguir o fluxo. */}
          {expanded ? null : (
            <Text style={styles.headerChamada}>
              {tr("Toque para ver o que fazer antes de prosseguir")}
            </Text>
          )}
        </View>
        <Text style={styles.chev}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.body}>
          <Text style={styles.principle}>
            {tr("Paciente instável? A prioridade é estabilizar — não seguir o guia enquanto houver ameaça imediata à vida. Estabilize e depois retome o fluxo.")}
          </Text>

          <View style={styles.abcdeList}>
            {ABCDE.map((row) => (
              <View key={row.letter} style={styles.abcdeRow}>
                <View style={styles.letterBadge}>
                  <Text style={styles.letterBadgeText}>{row.letter}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.abcdeTitle}>{tr(row.title)}</Text>
                  <Text style={styles.abcdeBody}>{tr(row.body)}</Text>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.shortcutLabel}>{tr("Abrir módulo de estabilização:")}</Text>
          <View style={styles.shortcutWrap}>
            {modules.map((m) => (
              <Pressable
                key={m.slug}
                style={({ pressed }) => [styles.shortcutChip, pressed && styles.shortcutChipPressed]}
                onPress={() => onOpenModule(m.slug)}>
                <Text style={styles.shortcutIcon}>{m.icon}</Text>
                <Text style={styles.shortcutText}>{tr(m.label)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  verMais: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  verMaisTexto: { fontSize: 13, fontWeight: "800", color: "#7fb3ff" },
  wrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#7f1d1d",
    backgroundColor: "#1c0f12",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(220,38,38,0.12)",
  },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 15, fontWeight: "900", color: "#fecaca", letterSpacing: -0.2 },
  headerSub: { fontSize: 11.5, fontWeight: "600", color: "#fca5a5", marginTop: 1 },
  headerChamada: { fontSize: 12, fontWeight: "700", color: "#fca5a5", marginTop: 4, textDecorationLine: "underline" },
  chev: { fontSize: 12, color: "#fca5a5", fontWeight: "800" },

  body: { padding: 14, gap: 12 },
  principle: { fontSize: 13, lineHeight: 19, color: "#fca5a5", fontWeight: "600" },

  abcdeList: { gap: 9 },
  abcdeRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  letterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7f1d1d",
    borderWidth: 1,
    borderColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letterBadgeText: { fontSize: 13, fontWeight: "900", color: "#fecaca" },
  abcdeTitle: { fontSize: 13.5, fontWeight: "800", color: "#fee2e2" },
  abcdeBody: { fontSize: 12.5, lineHeight: 18, color: "#cbd5e1", marginTop: 1 },

  shortcutLabel: { fontSize: 11, fontWeight: "800", color: "#aab6c6", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2 },
  shortcutWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  shortcutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#565e6c",
    backgroundColor: "#383e4a",
    paddingHorizontal: 12,
    paddingVertical: 9,
   minHeight: 44, justifyContent: "center" },
  shortcutChipPressed: { backgroundColor: "#383e4a", borderColor: "#dc2626" },
  shortcutIcon: { fontSize: 15 },
  shortcutText: { fontSize: 12.5, fontWeight: "700", color: "#e2e8f0" },
});
