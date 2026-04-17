import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

// ── Dados dos ritmos ──────────────────────────────────────────────────────────

type RhythmBullet = { label: string; value: string };

type Rhythm = {
  id: string;
  name: string;
  abbr: string;
  ecgPattern: string;
  rate: string;
  regularity: string;
  bullets: RhythmBullet[];
  management: string;
  managementNote?: string;
};

type RhythmGroup = {
  id: "shockable" | "nonshockable";
  label: string;
  sublabel: string;
  accentColor: string;
  accentLight: string;
  accentBorder: string;
  badgeColor: string;
  rhythms: Rhythm[];
};

const RHYTHM_GROUPS: RhythmGroup[] = [
  {
    id: "shockable",
    label: "Ritmos Chocáveis",
    sublabel: "Desfibrilação imediata — não interrompa a RCP desnecessariamente",
    accentColor: "#dc2626",
    accentLight: "#fff1f2",
    accentBorder: "#fecdd3",
    badgeColor: "#fef2f2",
    rhythms: [
      {
        id: "fv",
        name: "Fibrilação Ventricular",
        abbr: "FV",
        ecgPattern:
          "Atividade elétrica completamente caótica, irregular e de amplitude variável. Sem complexos P-QRS-T identificáveis.",
        rate: "Indeterminada",
        regularity: "Irregular",
        bullets: [
          { label: "Linha de base", value: "Ondulações caóticas sem forma definida" },
          { label: "Complexos QRS", value: "Ausentes — sem morfologia identificável" },
          { label: "Ondas P", value: "Ausentes" },
          { label: "Pulso", value: "Ausente — perda imediata do débito cardíaco" },
        ],
        management: "Desfibrilação imediata + RCP de alta qualidade",
        managementNote:
          "Bifásico: 120–200 J (ou carga máxima do aparelho). Monofásico: 360 J. Retomar RCP imediatamente após o choque.",
      },
      {
        id: "tv_sp",
        name: "Taquicardia Ventricular sem Pulso",
        abbr: "TV sp",
        ecgPattern:
          "Complexos QRS largos, regulares e monomórficos (ou polimórficos). Frequência alta. Sem pulso palpável.",
        rate: "150–300 bpm",
        regularity: "Regular (monomórfica) ou irregular (polimórfica)",
        bullets: [
          { label: "Complexos QRS", value: "Largos (> 0,12 s), com morfologia anormal" },
          { label: "Ondas P", value: "Geralmente dissociadas ou não visíveis" },
          { label: "Eixo", value: "Frequentemente desviado ou variável" },
          { label: "Pulso", value: "Ausente — confirme antes de tratar como TV com pulso" },
        ],
        management: "Desfibrilação imediata + RCP de alta qualidade",
        managementNote:
          "Mesmas energias da FV. Se polimórfica (Torsades de Pointes): considerar sulfato de magnésio 1–2 g IV.",
      },
    ],
  },
  {
    id: "nonshockable",
    label: "Ritmos Não Chocáveis",
    sublabel: "RCP contínua + tratar causas reversíveis (5H/5T)",
    accentColor: "#1d4ed8",
    accentLight: "#eff6ff",
    accentBorder: "#bfdbfe",
    badgeColor: "#f0f9ff",
    rhythms: [
      {
        id: "aesp",
        name: "Atividade Elétrica Sem Pulso",
        abbr: "AESP",
        ecgPattern:
          "Qualquer ritmo organizado — sinusal, idioventricular, flutter etc. — sem pulso palpável correspondente. Dissociação eletromecânica.",
        rate: "Variável (geralmente lenta)",
        regularity: "Variável conforme o ritmo subjacente",
        bullets: [
          { label: "No monitor", value: "Ritmo organizado com complexos reconhecíveis" },
          { label: "No paciente", value: "Ausência de pulso central (carotídeo/femoral)" },
          { label: "Causa obrigatória", value: "Sempre investigar 5H/5T" },
          { label: "Armadilha", value: "Não confundir com pulso fraco — palpe por ≤ 10 s" },
        ],
        management: "RCP contínua + identificar e tratar causa reversível",
        managementNote:
          "Causas frequentes: hipovolemia, hipóxia, acidose, pneumotórax hipertensivo, tamponamento cardíaco, TEP maciço.",
      },
      {
        id: "assistolia",
        name: "Assistolia",
        abbr: "Assistolia",
        ecgPattern:
          "Linha isoelétrica plana ou quase plana. Pode haver ondas P isoladas sem QRS (dissociação P-QRS).",
        rate: "Ausente ou < 10 bpm",
        regularity: "Isoelétrica",
        bullets: [
          { label: "No monitor", value: "Linha plana — confirmar em 2 derivações" },
          { label: "Artefato?", value: "Verificar eletrodos e ganho antes de confirmar" },
          { label: "Ondas P", value: "Podem estar presentes sem resposta ventricular" },
          { label: "Prognóstico", value: "Pior prognóstico entre os ritmos de PCR" },
        ],
        management: "RCP contínua + epinefrina 1 mg IV/IO a cada 3–5 min",
        managementNote:
          "Não desfibrilhar. Linha plana em uma derivação pode ser artefato — confirmar em segunda derivação com ganho adequado.",
      },
    ],
  },
];

const RHYTHM_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Visão geral", hint: "Leitura inicial e regra prática", step: "1", accent: "#0f766e" },
  { id: "shockable", icon: "⚡", label: "Chocáveis", hint: "FV e TV sem pulso", step: "2", accent: "#dc2626" },
  { id: "nonshockable", icon: "🫀", label: "Não chocáveis", hint: "AESP e assistolia", step: "3", accent: "#1d4ed8" },
] as const;

// ── Componentes auxiliares ────────────────────────────────────────────────────

function RhythmCard({ rhythm, group }: { rhythm: Rhythm; group: RhythmGroup }) {
  return (
    <View style={[s.rhythmCard, { borderLeftColor: group.accentColor }]}>
      {/* Cabeçalho do ritmo */}
      <View style={s.rhythmHeader}>
        <View style={[s.abbrBadge, { backgroundColor: group.accentLight, borderColor: group.accentBorder }]}>
          <Text style={[s.abbrText, { color: group.accentColor }]}>{rhythm.abbr}</Text>
        </View>
        <Text style={s.rhythmName}>{rhythm.name}</Text>
      </View>

      {/* Padrão ECG */}
      <View style={[s.ecgBlock, { backgroundColor: group.accentLight, borderColor: group.accentBorder }]}>
        <Text style={[s.ecgLabel, { color: group.accentColor }]}>Padrão no monitor</Text>
        <Text style={s.ecgText}>{rhythm.ecgPattern}</Text>
        <View style={s.ecgMeta}>
          <View style={s.ecgMetaItem}>
            <Text style={s.ecgMetaLabel}>FC</Text>
            <Text style={s.ecgMetaValue}>{rhythm.rate}</Text>
          </View>
          <View style={s.ecgMetaDivider} />
          <View style={s.ecgMetaItem}>
            <Text style={s.ecgMetaLabel}>Regularidade</Text>
            <Text style={s.ecgMetaValue}>{rhythm.regularity}</Text>
          </View>
        </View>
      </View>

      {/* Pontos de reconhecimento */}
      <View style={s.bulletsSection}>
        <Text style={s.bulletsSectionTitle}>Reconhecimento rápido</Text>
        {rhythm.bullets.map((b) => (
          <View key={b.label} style={s.bulletRow}>
            <View style={[s.bulletDot, { backgroundColor: group.accentColor }]} />
            <Text style={s.bulletLabel}>{b.label}:</Text>
            <Text style={s.bulletValue}>{b.value}</Text>
          </View>
        ))}
      </View>

      {/* Conduta */}
      <View style={[s.managementBlock, { backgroundColor: group.accentColor }]}>
        <Text style={s.managementEyebrow}>Conduta</Text>
        <Text style={s.managementText}>{rhythm.management}</Text>
      </View>
      {rhythm.managementNote ? (
        <Text style={s.managementNote}>{rhythm.managementNote}</Text>
      ) : null}
    </View>
  );
}

function SectionHeader({ group }: { group: RhythmGroup }) {
  return (
    <View style={[s.sectionHeader, { borderLeftColor: group.accentColor, backgroundColor: group.badgeColor }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={[s.sectionDot, { backgroundColor: group.accentColor }]} />
        <Text style={[s.sectionTitle, { color: group.accentColor }]}>{group.label}</Text>
      </View>
      <Text style={[s.sectionSubtitle, { color: group.accentColor }]}>{group.sublabel}</Text>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsRhythmsScreen() {
  const [activeSection, setActiveSection] = useState<(typeof RHYTHM_SECTIONS)[number]["id"]>("overview");
  const activeGroup = RHYTHM_GROUPS.find((group) => group.id === activeSection);

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Ritmos de parada com navegação por decisão"
          subtitle="O conteúdo clínico segue o mesmo; a leitura agora separa a visão geral dos ritmos chocáveis e não chocáveis."
          badgeText="AHA ACLS 2020 · Ritmos de PCR"
          metrics={[
            { label: "Grupos", value: "2 fluxos principais", accent: "#0f766e" },
            { label: "Chocáveis", value: "FV · TV sp", accent: "#dc2626" },
            { label: "Não chocáveis", value: "AESP · Assistolia", accent: "#1d4ed8" },
          ]}
          progressLabel={activeGroup ? activeGroup.label : "Visão geral"}
          stepTitle={activeGroup ? activeGroup.sublabel : "Reconhecimento rápido com pausa mínima das compressões"}
          hint="A análise do ritmo deve durar menos de 10 segundos e sempre conversar com a ausência de pulso."
          compactMobile
        />
      }
      items={RHYTHM_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof RHYTHM_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Ritmos de parada">
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {activeSection === "overview" ? (
          <View style={s.introCard}>
            <Text style={s.introEyebrow}>ACLS · Referência</Text>
            <Text style={s.introTitle}>Ritmos de Parada</Text>
            <Text style={s.introBody}>
              O reconhecimento correto do ritmo é o passo decisivo após confirmar a ausência de pulso.
              A análise deve ser rápida (&lt; 10 s) e pausar minimamente as compressões.
            </Text>
            <View style={s.introRule} />
            <Text style={s.introHint}>
              Dois grupos: <Text style={{ fontWeight: "800", color: "#dc2626" }}>chocáveis</Text> (FV e TV sp) e{" "}
              <Text style={{ fontWeight: "800", color: "#1d4ed8" }}>não chocáveis</Text> (AESP e assistolia).
              A conduta inicial difere: desfibrilação imediata vs. RCP contínua.
            </Text>
          </View>
        ) : null}

        {RHYTHM_GROUPS.filter((group) => activeSection === "overview" || group.id === activeSection).map((group) => (
          <View key={group.id} style={s.groupSection}>
            <SectionHeader group={group} />
            {group.rhythms.map((rhythm) => (
              <RhythmCard key={rhythm.id} rhythm={rhythm} group={group} />
            ))}
          </View>
        ))}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Regra das 5H e 5T</Text>
          <Text style={s.footerBody}>
            Para AESP e assistolia, sempre investigar causas reversíveis: Hipóxia · Hipovolemia ·
            Hipotermia · Hipo/Hipercalemia · Acidose (H⁺) · Tensão (pneumotórax) ·
            Tamponamento · TEP · Tóxicos · Trombose coronária.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
        </View>
      </ScrollView>
    </ModuleFlowLayout>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
  },
  content: {
    paddingHorizontal: 2,
    paddingTop: 4,
    paddingBottom: 28,
    maxWidth: 760,
    width: "100%",
    alignSelf: "stretch",
    gap: 16,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  introEyebrow: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: AppDesign.accent.teal,
  },
  introTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.6,
    lineHeight: 30,
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
    fontWeight: "600",
  },
  introRule: {
    height: 1,
    backgroundColor: AppDesign.border.subtle,
  },
  introHint: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "600",
  },

  // ── Grupo ──
  groupSection: {
    gap: 12,
  },
  sectionHeader: {
    borderRadius: 14,
    borderLeftWidth: 5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
    paddingLeft: 18,
    opacity: 0.85,
  },

  // ── Card do ritmo ──
  rhythmCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderLeftWidth: 5,
    padding: 16,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  rhythmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  abbrBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  abbrText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rhythmName: {
    fontSize: 19,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.2,
    flex: 1,
  },

  // ── Bloco ECG ──
  ecgBlock: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
  },
  ecgLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  ecgText: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.primary,
    fontWeight: "500",
  },
  ecgMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 0,
  },
  ecgMetaItem: {
    flex: 1,
    gap: 2,
  },
  ecgMetaLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: AppDesign.text.muted,
  },
  ecgMetaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: AppDesign.text.primary,
    lineHeight: 18,
  },
  ecgMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: AppDesign.border.subtle,
    marginHorizontal: 12,
  },

  // ── Bullets ──
  bulletsSection: {
    gap: 8,
  },
  bulletsSectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: AppDesign.text.muted,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: AppDesign.text.primary,
    flexShrink: 0,
  },
  bulletValue: {
    fontSize: 13,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    flex: 1,
    lineHeight: 19,
  },

  // ── Conduta ──
  managementBlock: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  managementEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "rgba(255,255,255,0.75)",
  },
  managementText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 21,
  },
  managementNote: {
    fontSize: 12,
    lineHeight: 18,
    color: AppDesign.text.secondary,
    fontWeight: "500",
    paddingHorizontal: 2,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 18,
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
    fontSize: 16,
    fontWeight: "900",
    color: AppDesign.text.primary,
    letterSpacing: -0.1,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.secondary,
    fontWeight: "600",
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
