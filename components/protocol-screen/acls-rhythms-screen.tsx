import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReferenceBackHeader from "./reference-back-header";
import { CAUSAS_5H, CAUSAS_5T } from "../../lib/causas-reversiveis";
import { useTr } from "../../lib/use-tr";

// ── Dados dos ritmos ──────────────────────────────────────────────────────────

export type RhythmBullet = { label: string; value: string };

export type Rhythm = {
  id: string;
  name: string;
  abbr: string;
  ecgPattern: string;
  rate: string;
  regularity: string;
  bullets: RhythmBullet[];
  management: string;
  /** Card que renderiza a lista completa dos 5H/5T inline (fonte única). */
  causasReversiveis?: boolean;
  managementNote?: string;
};

export type RhythmGroup = {
  id: "shockable" | "nonshockable";
  label: string;
  sublabel: string;
  accentColor: string;
  accentLight: string;
  accentBorder: string;
  badgeColor: string;
  rhythms: Rhythm[];
};

/**
 * Conteúdo clínico dos ritmos de parada.
 *
 * Exportado para que a versão migrada da tela (acls-rhythms-screen-v2.tsx)
 * consuma EXATAMENTE os mesmos dados, em vez de uma cópia. A migração da Fase 3
 * é só de apresentação: se este array fosse duplicado, as duas telas poderiam
 * divergir em conteúdo clínico sem ninguém perceber.
 */
export const RHYTHM_GROUPS: RhythmGroup[] = [
  {
    id: "shockable",
    label: "Ritmos Chocáveis",
    sublabel: "Desfibrilação imediata — não interrompa a RCP desnecessariamente",
    accentColor: "#f87171",
    accentLight: "#3a1416",
    accentBorder: "#7f1d1d",
    badgeColor: "#241012",
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
    accentColor: "#60a5fa",
    accentLight: "#132743",
    accentBorder: "#1e40af",
    badgeColor: "#0f1e33",
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
        management: "RCP contínua + EPINEFRINA 1 mg IV/IO imediata, a cada 3–5 min + tratar a causa",
        managementNote:
          "A epinefrina é IMEDIATA na AESP, igual à assistolia — o que separa os dois ritmos é o que se PROCURA ao lado, não o que se DÁ. Investigar os 5H/5T durante cada ciclo de 2 min; a lista completa está abaixo, e o módulo Hs e Ts traz pistas, exames e conduta de cada uma.",
        causasReversiveis: true,
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
          "Não desfibrilar a assistolia confirmada. ⚠️ ANTES DE CONFIRMAR, DESCARTE FV FINA: aumente o GANHO do monitor e confira em 2 derivações. A razão de aumentar o ganho é específica — ganho baixo achata uma FV de baixa amplitude até ela parecer linha reta, e FV fina é ritmo CHOCÁVEL. E a conduta sob dúvida é CONFIRMAR, não escolher um lado: os DOIS erros têm custo (deixar de desfibrilar uma FV fina perde o único tratamento que reverte; desfibrilar assistolia é potencialmente danoso, não apenas inútil), e a manobra que os separa leva segundos — cabe no tempo da parada. Fonte desta ressalva: AHA, Adult Advanced Life Support.",
      },
    ],
  },
];

// ── Componentes auxiliares ────────────────────────────────────────────────────

function RhythmCard({ rhythm, group }: { rhythm: Rhythm; group: RhythmGroup }) {
  const tr = useTr();
  return (
    <View style={[s.rhythmCard, { borderLeftColor: group.accentColor }]}>
      {/* Cabeçalho do ritmo */}
      <View style={s.rhythmHeader}>
        <View style={[s.abbrBadge, { backgroundColor: group.accentLight, borderColor: group.accentBorder }]}>
          <Text style={[s.abbrText, { color: group.accentColor }]}>{tr(rhythm.abbr)}</Text>
        </View>
        <Text style={s.rhythmName}>{tr(rhythm.name)}</Text>
      </View>

      {/* Padrão ECG */}
      <View style={[s.ecgBlock, { backgroundColor: group.accentLight, borderColor: group.accentBorder }]}>
        <Text style={[s.ecgLabel, { color: group.accentColor }]}>{tr("Padrão no monitor")}</Text>
        <Text style={s.ecgText}>{tr(rhythm.ecgPattern)}</Text>
        <View style={s.ecgMeta}>
          <View style={s.ecgMetaItem}>
            <Text style={s.ecgMetaLabel}>{tr("FC")}</Text>
            <Text style={s.ecgMetaValue}>{tr(rhythm.rate)}</Text>
          </View>
          <View style={s.ecgMetaDivider} />
          <View style={s.ecgMetaItem}>
            <Text style={s.ecgMetaLabel}>{tr("Regularidade")}</Text>
            <Text style={s.ecgMetaValue}>{tr(rhythm.regularity)}</Text>
          </View>
        </View>
      </View>

      {/* Pontos de reconhecimento */}
      <View style={s.bulletsSection}>
        <Text style={s.bulletsSectionTitle}>{tr("Reconhecimento rápido")}</Text>
        {rhythm.bullets.map((b) => (
          <View key={b.label} style={s.bulletRow}>
            <View style={[s.bulletDot, { backgroundColor: group.accentColor }]} />
            <Text style={s.bulletLabel}>{tr(b.label)}:</Text>
            <Text style={s.bulletValue}>{tr(b.value)}</Text>
          </View>
        ))}
      </View>

      {/* Conduta */}
      <View style={[s.managementBlock, { backgroundColor: group.accentColor }]}>
        <Text style={s.managementEyebrow}>{tr("Conduta")}</Text>
        <Text style={s.managementText}>{tr(rhythm.management)}</Text>
      </View>
      {rhythm.managementNote ? (
        <Text style={s.managementNote}>{tr(rhythm.managementNote)}</Text>

      ) : null}
      {/* (3) A lista COMPLETA dos 5H/5T, inline e da fonte única. Parcial
          criava confiança falsa: quem corre seis itens e não acha a causa
          conclui que investigou. E mandar navegar no meio de uma parada
          seria ressalva sem alternativa (R-23) — por isso inline, e não
          ponteiro puro. O ponteiro de CONDUTA (R-33) vem logo abaixo, para
          quem quiser o detalhe de cada causa. */}
      {rhythm.causasReversiveis ? (
        <View style={s.causasBox}>
          <Text style={s.causasTitulo}>{tr("5 Hs")}</Text>
          <Text style={s.causasLista}>{CAUSAS_5H.map((c) => tr(c)).join(" · ")}</Text>
          <Text style={s.causasTitulo}>{tr("5 Ts")}</Text>
          <Text style={s.causasLista}>{CAUSAS_5T.map((c) => tr(c)).join(" · ")}</Text>
          <Text style={s.causasPonteiro}>
            {tr("AESP confirmada → abrir o módulo Hs e Ts para pistas diagnósticas, exames e conduta de cada causa.")}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SectionHeader({ group }: { group: RhythmGroup }) {
  const tr = useTr();
  return (
    <View style={[s.sectionHeader, { borderLeftColor: group.accentColor, backgroundColor: group.badgeColor }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={[s.sectionDot, { backgroundColor: group.accentColor }]} />
        <Text style={[s.sectionTitle, { color: group.accentColor }]}>{tr(group.label)}</Text>
      </View>
      <Text style={[s.sectionSubtitle, { color: group.accentColor }]}>{tr(group.sublabel)}</Text>
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsRhythmsScreen() {
  const tr = useTr();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · Ritmos de Parada")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("Ritmos de Parada")}</Text>
        <Text style={s.introBody}>
          {tr("O reconhecimento correto do ritmo é o passo decisivo após confirmar a ausência de pulso. A análise deve ser rápida (< 10 s) e pausar minimamente as compressões.")}
        </Text>
        <View style={s.introRule} />
        <Text style={s.introHint}>
          {tr("Dois grupos:")} <Text style={{ fontWeight: "800", color: "#fca5a5" }}>{tr("chocáveis")}</Text> {tr("(FV e TV sp) e")}{" "}
          <Text style={{ fontWeight: "800", color: "#93c5fd" }}>{tr("não chocáveis")}</Text> {tr("(AESP e assistolia). A conduta inicial difere — desfibrilação imediata vs. RCP contínua.")}
        </Text>
      </View>

      {/* Grupos de ritmos */}
      {RHYTHM_GROUPS.map((group) => (
        <View key={group.id} style={s.groupSection}>
          <SectionHeader group={group} />
          {group.rhythms.map((rhythm) => (
            <RhythmCard key={rhythm.id} rhythm={rhythm} group={group} />
          ))}
        </View>
      ))}

      {/* Nota de rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>{tr("Regra das 5H e 5T")}</Text>
        <Text style={s.footerBody}>
          {tr("Para AESP e assistolia, sempre investigar causas reversíveis: Hipóxia · Hipovolemia · Hipotermia · Hipo/Hipercalemia · Acidose (H⁺) · Tensão (pneumotórax) · Tamponamento · TEP · Tóxicos · Trombose coronária.")}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>{tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

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
    gap: 16,
  },

  // ── Intro ──
  introCard: {
    backgroundColor: "#383e4a",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    gap: 10,
    shadowColor: "#383e4a",
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
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
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aab6c6",
    fontWeight: "500",
  },
  introRule: {
    height: 1,
    backgroundColor: "#565e6c",
  },
  introHint: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aab6c6",
    fontWeight: "500",
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
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
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
    backgroundColor: "#383e4a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    borderLeftWidth: 5,
    padding: 16,
    gap: 14,
    shadowColor: "#383e4a",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
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
    fontSize: 17,
    fontWeight: "800",
    color: "#f1f5f9",
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
    color: "#cbd5e1",
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
    color: "#aab6c6",
  },
  ecgMetaValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f1f5f9",
    lineHeight: 18,
  },
  ecgMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#565e6c",
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
    color: "#aab6c6",
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
    color: "#f1f5f9",
    flexShrink: 0,
  },
  bulletValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#aab6c6",
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
  // O bloco de conduta é preenchido com o accent do grupo (#f87171 nos ritmos
  // chocáveis, #60a5fa nos não chocáveis). Ambos são cores CLARAS: texto branco
  // em cima dava 2,77:1 e 2,54:1, abaixo de AA. Com texto escuro sobe para
  // 6,77:1 e 7,36:1 — mesma razão pela qual os tokens têm onPrimary/onCritical.
  managementEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    color: "rgba(11,18,32,0.75)",
  },
  managementText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0b1220",
    lineHeight: 21,
  },
  causasBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#0f1e33",
    borderWidth: 1,
    borderColor: "#1e40af",
    gap: 2,
  },
  causasTitulo: { fontSize: 11, fontWeight: "800", color: "#93c5fd", letterSpacing: 0.4 },
  causasLista: { fontSize: 12, lineHeight: 17, color: "#dbe3ee", marginBottom: 4 },
  causasPonteiro: { fontSize: 11, lineHeight: 16, color: "#93c5fd", marginTop: 4, fontStyle: "italic" },
  managementNote: {
    fontSize: 12,
    lineHeight: 18,
    color: "#aab6c6",
    fontWeight: "500",
    paddingHorizontal: 2,
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
    fontSize: 14,
    fontWeight: "800",
    color: "#7fb3ff",
    letterSpacing: -0.1,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#e2e8f0",
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
