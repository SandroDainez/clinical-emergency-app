import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type DrugDetail = {
  label: string;
  value: string;
};

type Drug = {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  categoryBorder: string;
  accentColor: string;
  indication: string;
  dose: DrugDetail[];
  whenToUse: string[];
  caution?: string;
  source?: string;
};

// ── Dados clínicos das drogas ────────────────────────────────────────────────

const DRUGS: Drug[] = [
  {
    id: "epinefrina",
    name: "Epinefrina",
    genericName: "Adrenalina 1 mg / 10 mL (1:10.000)",
    category: "Vasopressor — PCR",
    categoryColor: "#7f1d1d",
    categoryBg: "#fff1f2",
    categoryBorder: "#fecdd3",
    accentColor: "#dc2626",
    indication:
      "Parada cardiorrespiratória em qualquer ritmo. Droga de primeira linha em AESP e assistolia; usada em FV/TV sp após choques iniciais sem ROSC.",
    dose: [
      { label: "Dose padrão", value: "1 mg IV/IO em bolus" },
      { label: "Intervalo", value: "A cada 3–5 minutos" },
      { label: "Preparo IV", value: "Usar ampola de 1 mg sem diluição (1:10.000)" },
      { label: "Flush obrigatório", value: "20 mL de SF após cada dose + elevar o membro" },
    ],
    whenToUse: [
      "AESP e assistolia: iniciar epinefrina o mais cedo possível",
      "FV/TV sem pulso: 1ª dose após o 2º choque sem ROSC, durante o ciclo de RCP subsequente (AHA 2020)",
      "Repetir a cada ciclo de 3–5 min enquanto a PCR persistir",
    ],
    caution:
      "Não atrasar a 1ª dose em ritmos não chocáveis. Em FV/TV refratária, priorize a desfibrilação antes da epinefrina.",
    source: "AHA ACLS 2020",
  },
  {
    id: "amiodarona",
    name: "Amiodarona",
    genericName: "Cordarone — 150 mg / 3 mL",
    category: "Antiarrítmico — FV/TV sp",
    categoryColor: "#7c2d12",
    categoryBg: "#fff7ed",
    categoryBorder: "#fed7aa",
    accentColor: "#ea580c",
    indication:
      "FV ou TV sem pulso refratária a desfibrilação repetida. Não indicada em AESP nem assistolia.",
    dose: [
      { label: "1ª dose", value: "300 mg IV/IO em bolus" },
      { label: "2ª dose (se necessário)", value: "150 mg IV/IO em bolus" },
      { label: "Manutenção (pós-ROSC)", value: "1 mg/min IV por 6 h → 0,5 mg/min por 18 h" },
      { label: "Alternativa se ausente", value: "Lidocaína 1–1,5 mg/kg IV/IO" },
    ],
    whenToUse: [
      "FV/TV sp que persiste após ≥ 3 desfibrilações + epinefrina",
      "Administrar durante RCP, imediatamente antes ou após a próxima desfibrilação",
      "Torsades de Pointes: preferir magnésio (1–2 g IV) em vez da amiodarona",
    ],
    caution:
      "Pode causar hipotensão e bradicardia pós-ROSC. Evitar em bradiarritmias ou bloqueios de alto grau sem marcapasso.",
    source: "AHA ACLS 2020",
  },
  {
    id: "adenosina",
    name: "Adenosina",
    genericName: "Adenocard — 6 mg / 2 mL",
    category: "Antiarrítmico — TSV com pulso",
    categoryColor: "#1d4ed8",
    categoryBg: "#eff6ff",
    categoryBorder: "#bfdbfe",
    accentColor: "#2563eb",
    indication:
      "Taquicardia supraventricular paroxística (TSVP) com pulso estável. Diagnóstica em taquicardias de QRS estreito de etiologia incerta.",
    dose: [
      { label: "1ª dose", value: "6 mg IV em bolus rápido + flush 20 mL imediato" },
      { label: "2ª dose (após 1–2 min)", value: "12 mg IV em bolus rápido + flush" },
      { label: "3ª dose (se necessário)", value: "12 mg IV — repetir uma vez" },
      { label: "Acesso ideal", value: "Fossa antecubital ou veia central (NUNCA diluir)" },
    ],
    whenToUse: [
      "TSV com QRS estreito, ritmo regular, paciente hemodinamicamente estável",
      "Taquicardia de QRS largo regular quando se suspeita de TSV com aberrância",
      "Flush imediato após a injeção é obrigatório — meia-vida plasmática < 10 segundos",
    ],
    caution:
      "NÃO usar em FA/flutter com pré-excitação (WPW) — risco de FV. Contraindicada em DPOC grave/asma. Pode causar assistolia transitória — monitorizar.",
    source: "AHA ACLS 2020",
  },
  {
    id: "atropina",
    name: "Atropina",
    genericName: "Atropina sulfato — 0,5 mg / mL",
    category: "Vagolítico — Bradicardia",
    categoryColor: "#065f46",
    categoryBg: "#ecfdf5",
    categoryBorder: "#a7f3d0",
    accentColor: "#059669",
    indication:
      "Bradicardia sintomática com pulso (FC < 60 bpm + instabilidade hemodinâmica, síncope, dor precordial ou dispneia).",
    dose: [
      { label: "Dose inicial", value: "0,5 mg IV em bolus" },
      { label: "Intervalo", value: "Repetir cada 3–5 min" },
      { label: "Dose máxima", value: "3 mg (efeito vagolítico total)" },
      { label: "Dose mínima", value: "≥ 0,5 mg — doses menores podem causar bradicardia paradoxal" },
    ],
    whenToUse: [
      "Bradicardia sintomática instável enquanto prepara marcapasso transcutâneo",
      "Bradicardia sinusal, bloqueio AV de 1º grau ou Mobitz I com sintomas",
      "Pós-ROSC: bradicardia com hipotensão ou baixo débito",
    ],
    caution:
      "NÃO usar em AESP de ritmo lento — não reverte a causa subjacente e pode mascarar o quadro. Ineficaz em bloqueio AV de alto grau (Mobitz II, BAV total).",
    source: "AHA ACLS 2020",
  },
  {
    id: "dopamina",
    name: "Dopamina",
    genericName: "Dopamina — 50 mg / 10 mL",
    category: "Vasoativo — Suporte hemodinâmico",
    categoryColor: "#4c1d95",
    categoryBg: "#f5f3ff",
    categoryBorder: "#c4b5fd",
    accentColor: "#7c3aed",
    indication:
      "Bradicardia sintomática refratária à atropina (como ponte ao MP definitivo) e hipotensão/choque pós-ROSC quando noradrenalina não está disponível.",
    dose: [
      { label: "Dose baixa (β1)", value: "5–10 mcg/kg/min → inotropismo + cronotopismo" },
      { label: "Dose alta (α)", value: "10–20 mcg/kg/min → vasoconstrição" },
      { label: "Bradicardia (ACLS)", value: "2–10 mcg/kg/min IV/IO — titular pela FC/PA" },
      { label: "Preparo padrão", value: "200 mg em 250 mL SG 5% = 800 mcg/mL" },
    ],
    whenToUse: [
      "Bradicardia instável que não respondeu à atropina e aguarda MP transcutâneo/transvenoso",
      "Hipotensão pós-ROSC (PAM < 65 mmHg) sem resposta adequada à reposição volêmica",
      "Quando noradrenalina não disponível no cenário de choque pós-parada",
    ],
    caution:
      "Preferir noradrenalina em choque séptico pós-ROSC (maior evidência). Dopamina causa mais taquiarritmias. Não usar em PCR ativa — não há evidência de benefício.",
    source: "AHA ACLS 2020",
  },
];

// ── Componente do card de droga ───────────────────────────────────────────────

function DrugCard({ drug }: { drug: Drug }) {
  return (
    <View style={[s.card, { borderLeftColor: drug.accentColor }]}>

      {/* Cabeçalho */}
      <View style={s.cardHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.drugName}>{drug.name}</Text>
          {drug.genericName ? (
            <Text style={s.drugGeneric}>{drug.genericName}</Text>
          ) : null}
        </View>
        <View style={[s.categoryBadge, { backgroundColor: drug.categoryBg, borderColor: drug.categoryBorder }]}>
          <Text style={[s.categoryText, { color: drug.categoryColor }]}>{drug.category}</Text>
        </View>
      </View>

      {/* Indicação */}
      <View style={[s.indicationBlock, { backgroundColor: drug.categoryBg, borderColor: drug.categoryBorder }]}>
        <Text style={[s.indicationLabel, { color: drug.accentColor }]}>Indicação no ACLS</Text>
        <Text style={s.indicationText}>{drug.indication}</Text>
      </View>

      {/* Dose */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Dose</Text>
        <View style={s.doseTable}>
          {drug.dose.map((d) => (
            <View key={d.label} style={s.doseRow}>
              <Text style={s.doseLabel}>{d.label}</Text>
              <Text style={s.doseValue}>{d.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quando usar */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Quando usar</Text>
        <View style={s.bulletList}>
          {drug.whenToUse.map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: drug.accentColor }]} />
              <Text style={s.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Atenção */}
      {drug.caution ? (
        <View style={s.cautionBlock}>
          <Text style={s.cautionLabel}>⚠ Atenção</Text>
          <Text style={s.cautionText}>{drug.caution}</Text>
        </View>
      ) : null}

      {/* Fonte */}
      {drug.source ? (
        <Text style={s.sourceText}>{drug.source}</Text>
      ) : null}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsPharmacologyScreen() {
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>ACLS · Referência</Text>
        <Text style={s.introTitle}>Farmacologia no ACLS</Text>
        <Text style={s.introBody}>
          Drogas de emergência organizadas por indicação clínica. Use como consulta rápida
          durante o atendimento — dose, via e momento certo de administração.
        </Text>
        <View style={s.pillRow}>
          {DRUGS.map((d) => (
            <View key={d.id} style={[s.pill, { backgroundColor: d.categoryBg, borderColor: d.categoryBorder }]}>
              <Text style={[s.pillText, { color: d.accentColor }]}>{d.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Cards das drogas */}
      {DRUGS.map((drug) => (
        <DrugCard key={drug.id} drug={drug} />
      ))}

      {/* Nota de rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>Lidocaína — alternativa à amiodarona</Text>
        <Text style={s.footerBody}>
          Quando amiodarona não estiver disponível: <Text style={{ fontWeight: "700" }}>1–1,5 mg/kg IV/IO</Text> em
          bolus para FV/TV sp refratária. 2ª dose: 0,5–0,75 mg/kg. Dose máx: 3 mg/kg.
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerTitle}>Magnésio — Torsades de Pointes</Text>
        <Text style={s.footerBody}>
          TV polimórfica com intervalo QT longo (Torsades): <Text style={{ fontWeight: "700" }}>1–2 g IV/IO</Text> em
          bolus diluído. NÃO substitui a amiodarona para FV/TV monomórfica.
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: AppDesign.canvas.tealBackdrop,
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
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 12,
    shadowColor: "#0f172a",
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
    color: AppDesign.accent.teal,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: AppDesign.text.secondary,
    fontWeight: "500",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Card da droga ──
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    borderLeftWidth: 5,
    padding: 16,
    gap: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  drugName: {
    fontSize: 20,
    fontWeight: "800",
    color: AppDesign.text.primary,
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  drugGeneric: {
    fontSize: 12,
    fontWeight: "500",
    color: AppDesign.text.muted,
    lineHeight: 17,
  },
  categoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    flexShrink: 0,
    maxWidth: 130,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  // ── Indicação ──
  indicationBlock: {
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
  },
  indicationLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  indicationText: {
    fontSize: 13,
    lineHeight: 20,
    color: AppDesign.text.primary,
    fontWeight: "500",
  },

  // ── Seção genérica ──
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: AppDesign.text.muted,
  },

  // ── Tabela de dose ──
  doseTable: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    overflow: "hidden",
  },
  doseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: AppDesign.border.subtle,
    gap: 10,
  },
  doseLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: AppDesign.text.muted,
    width: 140,
    flexShrink: 0,
    lineHeight: 18,
  },
  doseValue: {
    fontSize: 13,
    fontWeight: "600",
    color: AppDesign.text.primary,
    flex: 1,
    lineHeight: 18,
  },

  // ── Bullets quando usar ──
  bulletList: {
    gap: 8,
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
  bulletText: {
    fontSize: 13,
    fontWeight: "500",
    color: AppDesign.text.secondary,
    flex: 1,
    lineHeight: 20,
  },

  // ── Atenção ──
  cautionBlock: {
    backgroundColor: "#fffbeb",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  cautionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cautionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#78350f",
    fontWeight: "500",
  },

  // ── Fonte ──
  sourceText: {
    fontSize: 10,
    fontWeight: "600",
    color: AppDesign.text.muted,
    letterSpacing: 0.2,
  },

  // ── Rodapé ──
  footerCard: {
    backgroundColor: AppDesign.surface.shellMint,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: AppDesign.border.mint,
    gap: 10,
  },
  footerTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: AppDesign.accent.teal,
    letterSpacing: -0.1,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#134e4a",
    fontWeight: "500",
  },
  footerRule: {
    height: 1,
    backgroundColor: AppDesign.border.mint,
  },
  footerSource: {
    fontSize: 11,
    fontWeight: "600",
    color: AppDesign.text.muted,
    letterSpacing: 0.2,
  },
});
