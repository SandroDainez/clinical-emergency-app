import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReferenceBackHeader from "./reference-back-header";
import { useTr } from "../../lib/use-tr";

// ── Tipos ─────────────────────────────────────────────────────────────────────

// O dado das dez causas vive em lib/causas-reversiveis-detalhe: o painel que
// abre DURANTE a parada consome o mesmo conteúdo, e não pode importar React.
export type { Cause, CauseGroup } from "../../lib/causas-reversiveis-detalhe";
export { CAUSE_GROUPS } from "../../lib/causas-reversiveis-detalhe";
import { CAUSE_GROUPS as GRUPOS, type Cause, type CauseGroup } from "../../lib/causas-reversiveis-detalhe";

// ── Componentes ───────────────────────────────────────────────────────────────

function CauseCard({ cause, group }: { cause: Cause; group: CauseGroup }) {
  const tr = useTr();
  return (
    <View style={[cc.card, { borderLeftColor: group.accentColor }]}>
      <View style={cc.header}>
        <View style={[cc.letterBadge, { backgroundColor: group.accentColor }]}>
          <Text style={cc.letterText}>{cause.letter}</Text>
        </View>
        <Text style={cc.causeName}>{tr(cause.name)}</Text>
      </View>

      {/* Reconhecimento */}
      <View style={cc.section}>
        <Text style={cc.sectionLabel}>{tr("Reconhecer")}</Text>
        {cause.clues.map((clue, i) => (
          <View key={i} style={cc.clueRow}>
            <View style={[cc.clueDot, { backgroundColor: group.accentColor }]} />
            <Text style={cc.clueText}>{tr(clue)}</Text>
          </View>
        ))}
      </View>

      {/* Intervenção */}
      <View style={[cc.interventionBlock, { backgroundColor: group.accentColor }]}>
        <Text style={cc.interventionLabel}>{tr("Intervenção")}</Text>
        <Text style={cc.interventionText}>{tr(cause.intervention)}</Text>
      </View>
      {cause.interventionDetail ? (
        <Text style={cc.interventionNote}>{tr(cause.interventionDetail)}</Text>
      ) : null}
    </View>
  );
}

function GroupHeader({ group }: { group: CauseGroup }) {
  const tr = useTr();
  return (
    <View style={[gh.block, { backgroundColor: group.accentBg, borderColor: group.accentBorder }]}>
      <View style={[gh.letterPill, { backgroundColor: group.accentColor }]}>
        <Text style={gh.letter}>{group.id}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[gh.label, { color: group.accentColor }]}>{tr(group.groupLabel)}</Text>
        <Text style={[gh.sublabel, { color: group.accentColor }]}>{tr(group.groupSubtitle)}</Text>
      </View>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsReversibleCausesScreen() {
  const tr = useTr();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · Hs e Ts")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("Causas Reversíveis")}</Text>
        <Text style={s.introSubtitle}>{tr("5 Hs e 5 Ts")}</Text>
        <View style={s.introRule} />
        <Text style={s.introBody}>
          {tr(
            "Durante toda PCR sem causa óbvia, pesquise e trate as causas reversíveis em paralelo com a RCP. O reconhecimento e a intervenção precoce são determinantes para o ROSC.",
          )}
        </Text>
      </View>

      {/* Checklist rápido */}
      <View style={s.checklistCard}>
        <Text style={s.checklistTitle}>{tr("Checklist mental — revisão rápida")}</Text>
        <View style={s.checklistRow}>
          <View style={s.checklistCol}>
            <Text style={[s.checklistGroupLabel, { color: "#1d4ed8" }]}>{tr("5 Hs")}</Text>
            {["Hipóxia", "Hipovolemia", "Hidrogênio (acidose)", "Hipo/Hipercalemia", "Hipotermia"].map((h) => (
              <View key={h} style={s.checklistItem}>
                <View style={[s.checklistDot, { backgroundColor: "#1d4ed8" }]} />
                <Text style={s.checklistText}>{tr(h)}</Text>
              </View>
            ))}
          </View>
          <View style={s.checklistDivider} />
          <View style={s.checklistCol}>
            <Text style={[s.checklistGroupLabel, { color: "#7c2d12" }]}>{tr("5 Ts")}</Text>
            {["Tensão (PTX)", "Tamponamento", "Trombose coronária", "Tromboembolia pulmonar", "Tóxicos"].map((t) => (
              <View key={t} style={s.checklistItem}>
                <View style={[s.checklistDot, { backgroundColor: "#c2410c" }]} />
                <Text style={s.checklistText}>{tr(t)}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Grupos e cards */}
      {GRUPOS.map((group) => (
        <View key={group.id} style={s.group}>
          <GroupHeader group={group} />
          {group.causes.map((cause) => (
            <CauseCard key={cause.name} cause={cause} group={group} />
          ))}
        </View>
      ))}

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>{tr("Quando suspeitar de causa reversível?")}</Text>
        <Text style={s.footerBody}>
          {tr(
            "AESP e assistolia têm sempre uma causa subjacente — pesquise sistematicamente. Mesmo em FV refratária, uma causa reversível não tratada impede o ROSC. Use US à beira leito (POCUS) sempre que disponível para tamponamento, TEP e hipovolemia.",
          )}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>{tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do GroupHeader ────────────────────────────────────────────────────

const gh = StyleSheet.create({
  block: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  letterPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letter: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  sublabel: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.8,
    lineHeight: 17,
  },
});

// ── Estilos do CauseCard ──────────────────────────────────────────────────────

const cc = StyleSheet.create({
  card: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#565e6c",
    borderLeftWidth: 5,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  letterBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letterText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
  },
  causeName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.2,
    flex: 1,
  },
  section: {
    gap: 7,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "#aab6c6",
  },
  clueRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  clueDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  clueText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#aab6c6",
    flex: 1,
    lineHeight: 19,
  },
  interventionBlock: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 3,
  },
  interventionLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.7)",
  },
  interventionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    lineHeight: 20,
  },
  interventionNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#aab6c6",
    fontWeight: "500",
    paddingHorizontal: 2,
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#292e38",
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 40,
    maxWidth: 560,
    width: "100%",
    alignSelf: "center",
    gap: 14,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#383e4a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#7fb3ff",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#aab6c6",
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: {
    height: 1,
    backgroundColor: "#565e6c",
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aab6c6",
    fontWeight: "500",
  },

  // ── Checklist ──
  checklistCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f1f5f9",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  checklistRow: {
    flexDirection: "row",
    gap: 0,
  },
  checklistCol: {
    flex: 1,
    gap: 7,
  },
  checklistGroupLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: -0.1,
    marginBottom: 2,
  },
  checklistDivider: {
    width: 1,
    backgroundColor: "#565e6c",
    marginHorizontal: 14,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  checklistDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  checklistText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#aab6c6",
    lineHeight: 18,
  },

  // ── Grupo ──
  group: {
    gap: 10,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#383e4a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7fb3ff",
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#aab6c6",
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: "#383e4a",
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: "#aab6c6",
    letterSpacing: 0.2,
  },
});
