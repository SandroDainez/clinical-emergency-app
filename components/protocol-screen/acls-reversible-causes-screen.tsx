import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type Cause = {
  letter: string;
  name: string;
  clues: string[];
  intervention: string;
  interventionDetail?: string;
};

type CauseGroup = {
  id: "H" | "T";
  groupLabel: string;
  groupSubtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  causes: Cause[];
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

const CAUSE_GROUPS: CauseGroup[] = [
  {
    id: "H",
    groupLabel: "5 Hs",
    groupSubtitle: "Causas metabólicas e sistêmicas",
    accentColor: "#1d4ed8",
    accentBg: "#eff6ff",
    accentBorder: "#bfdbfe",
    causes: [
      {
        letter: "H",
        name: "Hipóxia",
        clues: [
          "Cianose, SpO₂ baixa antes da PCR",
          "Obstrução de via aérea, broncoespasmo grave",
          "Via aérea não estabelecida durante a RCP",
        ],
        intervention: "Abrir via aérea + ventilação com O₂ a 100%",
        interventionDetail:
          "Confirmar expansão torácica bilateral. Intubar se não resolvido. Causa mais comum em PCR pediátrica.",
      },
      {
        letter: "H",
        name: "Hipovolemia",
        clues: [
          "Sangramento ativo ou histórico de trauma/hemorragia",
          "Veias jugulares colabadas, pele seca e fria",
          "PCR após diarreia, vômitos intensos ou queimaduras extensas",
        ],
        intervention: "Reposição volêmica agressiva + controle da hemorragia",
        interventionDetail:
          "SF 0,9% ou cristaloide em bolus. Em trauma: controle cirúrgico é prioritário — fluidos não substituem hemostasia.",
      },
      {
        letter: "H",
        name: "Hidrogênio (acidose)",
        clues: [
          "Gasometria com pH < 7,1 ou bicarbonato muito baixo",
          "Cetoacidose diabética, insuficiência renal grave",
          "Intoxicação por salicilatos ou álcool tóxico",
        ],
        intervention: "Tratar a causa + bicarbonato de sódio 8,4% se pH < 7,1",
        interventionDetail:
          "Bicarbonato 1 mEq/kg IV. Indicado também em hipercalemia grave e intoxicação por antidepressivos tricíclicos.",
      },
      {
        letter: "H",
        name: "Hipo/Hipercalemia",
        clues: [
          "Hipercalemia: dialítico, insuficiência renal, ECG com onda T apiculada ou QRS alargado",
          "Hipocalemia: diuréticos, diarreia prolongada, hipomagnesemia associada",
          "Ritmo de PCR que não responde a medicação padrão",
        ],
        intervention: "Hipercalemia: gluconato de cálcio + insulina/glicose + bicarbonato",
        interventionDetail:
          "Gluconato de cálcio 10% 10 mL IV + insulina regular 10 U + glicose 50% 50 mL. Hipocalemia: reposição de KCl + magnésio.",
      },
      {
        letter: "H",
        name: "Hipotermia",
        clues: [
          "Temperatura central < 30°C",
          "Exposição ao frio, afogamento em água fria, PCR prolongada sem aquecimento",
          "PCR refratária sem causa aparente em ambiente frio",
        ],
        intervention: "Aquecimento ativo + RCP contínua até normotermia",
        interventionDetail:
          "\"Não está morto até estar quente e morto.\" Considerar ECMO para aquecimento em hipotermia grave. Epinefrina e desfibrilação menos eficazes abaixo de 30°C.",
      },
    ],
  },
  {
    id: "T",
    groupLabel: "5 Ts",
    groupSubtitle: "Causas obstrutivas e mecânicas",
    accentColor: "#7c2d12",
    accentBg: "#fff7ed",
    accentBorder: "#fed7aa",
    causes: [
      {
        letter: "T",
        name: "Tensão (pneumotórax hipertensivo)",
        clues: [
          "MV abolido unilateralmente, desvio de traqueia (tardio)",
          "Jugulares distendidas, hipotensão + hipertimpanismo à percussão",
          "Após intubação, VM ou trauma torácico",
        ],
        intervention: "Descompressão imediata com agulha no 2º EIC, linha hemiclavicular",
        interventionDetail:
          "Agulha 14G no 2º espaço intercostal, linha médio-clavicular. Seguida de drenagem torácica definitiva. Não aguardar RX.",
      },
      {
        letter: "T",
        name: "Tamponamento cardíaco",
        clues: [
          "Trauma torácico penetrante ou contuso recente",
          "Tríade de Beck (hipotensão + jugulares distendidas + bulhas abafadas) — nem sempre completa",
          "AESP com complexos de baixa amplitude no ECG; US à beira leito confirma",
        ],
        intervention: "Pericardiocentese de emergência + cirurgia se disponível",
        interventionDetail:
          "Pericardiocentese: agulha no ângulo xifoesternal, 45°, aspirar sangue. US-guiada se possível. Em trauma penetrante: toracotomia de ressuscitação.",
      },
      {
        letter: "T",
        name: "Trombose coronária (IAM)",
        clues: [
          "PCR em contexto de dor precordial, síncope ou equivalente isquêmico recente",
          "ECG (quando disponível): supradesnivelamento de ST, BRE novo",
          "Paciente com fatores de risco cardiovascular",
        ],
        intervention: "RCP de alta qualidade + cineangiocoronariografia emergencial pós-ROSC",
        interventionDetail:
          "Trombolítico durante RCP em ausência de laboratório de hemodinâmica (evidência limitada). Pós-ROSC: ECG urgente; se IAMCSST → hemodinâmica.",
      },
      {
        letter: "T",
        name: "Tromboembolia pulmonar (TEP)",
        clues: [
          "Dispneia súbita, dor pleurítica ou hemoptise antes da PCR",
          "Imobilização prolongada, cirurgia recente, gestação, TEP prévio",
          "AESP sem causa identificada, dilatação de VD ao US",
        ],
        intervention: "Trombolítico sistêmico durante RCP ou embolectomia cirúrgica",
        interventionDetail:
          "Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pelo menos 60–90 min após trombólise. Considerar ECMO.",
      },
      {
        letter: "T",
        name: "Tóxicos (intoxicações)",
        clues: [
          "História de exposição a fármaco, drogas ou toxina",
          "Anisocoria, miose extrema, QT longo, QRS alargado no ECG",
          "PCR em paciente jovem sem cardiopatia prévia",
        ],
        intervention: "Antídoto específico + suporte prolongado + toxicologia",
        interventionDetail:
          "Tricíclicos: bicarbonato 1–2 mEq/kg. Opioides: naloxona 0,4–2 mg IV. Organofosforados: atropina em altas doses. Intoxicação grave: considerar ECMO.",
      },
    ],
  },
];

const REVERSIBLE_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Visão geral", hint: "Checklist mental dos 5Hs e 5Ts", step: "1", accent: "#0f766e" },
  { id: "H", icon: "H", label: "5 Hs", hint: "Metabólicas e sistêmicas", step: "2", accent: "#1d4ed8" },
  { id: "T", icon: "T", label: "5 Ts", hint: "Obstrutivas e mecânicas", step: "3", accent: "#7c2d12" },
] as const;

// ── Componentes ───────────────────────────────────────────────────────────────

function CauseCard({ cause, group }: { cause: Cause; group: CauseGroup }) {
  return (
    <View style={[cc.card, { borderLeftColor: group.accentColor }]}>
      <View style={cc.header}>
        <View style={[cc.letterBadge, { backgroundColor: group.accentColor }]}>
          <Text style={cc.letterText}>{cause.letter}</Text>
        </View>
        <Text style={cc.causeName}>{cause.name}</Text>
      </View>

      {/* Reconhecimento */}
      <View style={cc.section}>
        <Text style={cc.sectionLabel}>Reconhecer</Text>
        {cause.clues.map((clue, i) => (
          <View key={i} style={cc.clueRow}>
            <View style={[cc.clueDot, { backgroundColor: group.accentColor }]} />
            <Text style={cc.clueText}>{clue}</Text>
          </View>
        ))}
      </View>

      {/* Intervenção */}
      <View style={[cc.interventionBlock, { backgroundColor: group.accentColor }]}>
        <Text style={cc.interventionLabel}>Intervenção</Text>
        <Text style={cc.interventionText}>{cause.intervention}</Text>
      </View>
      {cause.interventionDetail ? (
        <Text style={cc.interventionNote}>{cause.interventionDetail}</Text>
      ) : null}
    </View>
  );
}

function GroupHeader({ group }: { group: CauseGroup }) {
  return (
    <View style={[gh.block, { backgroundColor: group.accentBg, borderColor: group.accentBorder }]}>
      <View style={[gh.letterPill, { backgroundColor: group.accentColor }]}>
        <Text style={gh.letter}>{group.id}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[gh.label, { color: group.accentColor }]}>{group.groupLabel}</Text>
        <Text style={[gh.sublabel, { color: group.accentColor }]}>{group.groupSubtitle}</Text>
      </View>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsReversibleCausesScreen() {
  const [activeSection, setActiveSection] = useState<(typeof REVERSIBLE_SECTIONS)[number]["id"]>("overview");

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Causas reversíveis com separação direta entre Hs e Ts"
          subtitle="A revisão clínica foi mantida, agora com navegação lateral para checklist mental e aprofundamento por grupo."
          badgeText="AHA ACLS 2020 · 5Hs e 5Ts"
          metrics={[
            { label: "Cenário", value: "PCR sem causa óbvia", accent: "#0f766e" },
            { label: "Hs", value: "Metabólicas e sistêmicas", accent: "#1d4ed8" },
            { label: "Ts", value: "Obstrutivas e mecânicas", accent: "#7c2d12" },
          ]}
          progressLabel={REVERSIBLE_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Visão geral"}
          stepTitle={REVERSIBLE_SECTIONS.find((section) => section.id === activeSection)?.hint ?? "Checklist rápido para revisar em paralelo à RCP"}
          hint="Em AESP e assistolia, a busca sistemática por causa reversível é parte central do tratamento."
          compactMobile
        />
      }
      items={REVERSIBLE_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof REVERSIBLE_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Causas reversíveis">
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" ? (
          <>
            <View style={s.introCard}>
              <Text style={s.introEyebrow}>ACLS · Referência</Text>
              <Text style={s.introTitle}>Causas Reversíveis</Text>
              <Text style={s.introSubtitle}>5 Hs e 5 Ts</Text>
              <View style={s.introRule} />
              <Text style={s.introBody}>
                Durante toda PCR sem causa óbvia, pesquise e trate as causas reversíveis em paralelo
                com a RCP. O reconhecimento e a intervenção precoce são determinantes para o ROSC.
              </Text>
            </View>

            <View style={s.checklistCard}>
              <Text style={s.checklistTitle}>Checklist mental — revisão rápida</Text>
              <View style={s.checklistRow}>
                <View style={s.checklistCol}>
                  <Text style={[s.checklistGroupLabel, { color: "#1d4ed8" }]}>5 Hs</Text>
                  {["Hipóxia", "Hipovolemia", "Hidrogênio (acidose)", "Hipo/Hipercalemia", "Hipotermia"].map((h) => (
                    <View key={h} style={s.checklistItem}>
                      <View style={[s.checklistDot, { backgroundColor: "#1d4ed8" }]} />
                      <Text style={s.checklistText}>{h}</Text>
                    </View>
                  ))}
                </View>
                <View style={s.checklistDivider} />
                <View style={s.checklistCol}>
                  <Text style={[s.checklistGroupLabel, { color: "#7c2d12" }]}>5 Ts</Text>
                  {["Tensão (PTX)", "Tamponamento", "Trombose coronária", "Tromboembolia pulmonar", "Tóxicos"].map((t) => (
                    <View key={t} style={s.checklistItem}>
                      <View style={[s.checklistDot, { backgroundColor: "#c2410c" }]} />
                      <Text style={s.checklistText}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        ) : null}

        {CAUSE_GROUPS.filter((group) => activeSection === "overview" || group.id === activeSection).map((group) => (
          <View key={group.id} style={s.group}>
            <GroupHeader group={group} />
            {group.causes.map((cause) => (
              <CauseCard key={cause.name} cause={cause} group={group} />
            ))}
          </View>
        ))}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Quando suspeitar de causa reversível?</Text>
          <Text style={s.footerBody}>
            AESP e assistolia têm sempre uma causa subjacente — pesquise sistematicamente. Mesmo
            em FV refratária, uma causa reversível não tratada impede o ROSC. Use US à beira
            leito (POCUS) sempre que disponível para tamponamento, TEP e hipovolemia.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
        </View>
      </ScrollView>
    </ModuleFlowLayout>
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
    color: "#ffffff",
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
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderLeftWidth: 5,
    padding: 18,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
    color: "#ffffff",
  },
  causeName: {
    fontSize: 17,
    fontWeight: "800",
    color: AppDesign.text.primary,
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
    color: AppDesign.text.muted,
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
    color: AppDesign.text.secondary,
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
    color: "#ffffff",
    lineHeight: 20,
  },
  interventionNote: {
    fontSize: 12,
    lineHeight: 18,
    color: AppDesign.text.secondary,
    fontWeight: "500",
    paddingHorizontal: 2,
  },
});

// ── Estilos principais ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 28,
    maxWidth: 760,
    width: "100%",
    alignSelf: "stretch",
    gap: 18,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.09,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppDesign.text.secondary,
    letterSpacing: -0.1,
    marginTop: -2,
  },
  introRule: {
    height: 1,
    backgroundColor: AppDesign.border.subtle,
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },

  // ── Checklist ──
  checklistCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  checklistTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.text.primary,
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
    backgroundColor: AppDesign.border.subtle,
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
    color: AppDesign.text.secondary,
    lineHeight: 18,
  },

  // ── Grupo ──
  group: {
    gap: 10,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.text.primary,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: AppDesign.border.subtle,
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: AppDesign.text.muted,
    letterSpacing: 0.2,
  },
});
