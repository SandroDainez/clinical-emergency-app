import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReferenceBackHeader from "./reference-back-header";
import { useTr } from "../../lib/use-tr";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type DrugDetail = {
  label: string;
  value: string;
};

export type Drug = {
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

/**
 * Conteúdo clínico das drogas do ACLS.
 *
 * Exportado para a versão migrada (acls-pharmacology-screen-v2.tsx) consumir os
 * MESMOS dados. Duplicar deixaria as duas telas divergirem em dose sem aviso.
 */
export const DRUGS: Drug[] = [
  {
    id: "epinefrina",
    name: "Epinefrina",
    genericName: "Adrenalina 1 mg / 10 mL (1:10.000)",
    category: "Vasopressor — PCR",
    categoryColor: "#fca5a5",
    categoryBg: "#3a1416",
    categoryBorder: "#7f1d1d",
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
      "FV/TV sem pulso: 1ª dose após o 2º choque sem ROSC, durante o ciclo de RCP subsequente (AHA 2025)",
      "Repetir a cada ciclo de 3–5 min enquanto a PCR persistir",
    ],
    caution:
      "Não atrasar a 1ª dose em ritmos não chocáveis. Em FV/TV refratária, priorize a desfibrilação antes da epinefrina.",
    source: "AHA ACLS 2025",
  },
  {
    id: "amiodarona",
    name: "Amiodarona",
    genericName: "Cordarone — 150 mg / 3 mL",
    category: "Antiarrítmico — FV/TV sp",
    categoryColor: "#fdba74",
    categoryBg: "#3a1e0a",
    categoryBorder: "#7c2d12",
    accentColor: "#ea580c",
    indication:
      "FV ou TV sem pulso refratária a desfibrilação repetida. Não indicada em AESP nem assistolia.",
    dose: [
      { label: "1ª dose", value: "300 mg IV/IO em bolus" },
      { label: "2ª dose (se necessário)", value: "150 mg IV/IO em bolus" },
      { label: "Manutenção (pós-ROSC)", value: "1 mg/min IV por 6 h → 0,5 mg/min por 18 h" },
      { label: "Alternativa — Lidocaína 1ª dose", value: "1–1,5 mg/kg IV/IO em bolus" },
      { label: "Alternativa — Lidocaína 2ª dose", value: "0,5–0,75 mg/kg IV/IO (metade da 1ª). Repetir a cada 5–10 min · máximo 3 mg/kg" },
    ],
    whenToUse: [
      "FV/TV sp que persiste após ≥ 3 desfibrilações + epinefrina",
      "Administrar durante RCP, imediatamente antes ou após a próxima desfibrilação",
      "Torsades de Pointes: preferir magnésio (1–2 g IV) em vez da amiodarona",
    ],
    caution:
      "Pode causar hipotensão e bradicardia pós-ROSC. Evitar em bradiarritmias ou bloqueios de alto grau sem marcapasso.",
    source: "AHA ACLS 2025",
  },
  {
    id: "adenosina",
    name: "Adenosina",
    genericName: "Adenocard — 6 mg / 2 mL",
    category: "Antiarrítmico — TSV com pulso",
    categoryColor: "#93c5fd",
    categoryBg: "#132743",
    categoryBorder: "#1e40af",
    accentColor: "#2563eb",
    indication:
      "Taquicardia supraventricular paroxística (TSVP) com pulso estável. Diagnóstica em taquicardias de QRS estreito de etiologia incerta.",
    dose: [
      { label: "1ª dose", value: "6 mg IV em bolus rápido + flush 20 mL imediato" },
      { label: "2ª dose (após 1–2 min)", value: "12 mg IV em bolus rápido + flush" },
      { label: "3ª dose (se necessário)", value: "12 mg IV — o mesmo 12 mg pode ser repetido uma segunda vez (bula aprovada)" },
      { label: "Teto", value: "Doses acima de 12 mg NÃO são recomendadas — nem em adultos, nem em pediatria" },
      { label: "Acesso ideal", value: "Fossa antecubital ou veia central (NUNCA diluir)" },
    ],
    whenToUse: [
      "TSV com QRS estreito, ritmo regular, paciente hemodinamicamente estável",
      "Taquicardia de QRS largo regular quando se suspeita de TSV com aberrância",
      "Flush imediato após a injeção é obrigatório — meia-vida plasmática < 10 segundos",
    ],
    caution:
      "NÃO usar em FA/flutter com pré-excitação (WPW) — risco de FV. Não reverte flutter, FA nem TV: nesses ritmos causa apenas desaceleração transitória da resposta ventricular. CONTRAINDICADA em BAV de 2º ou 3º grau e na doença do nó sinusal, salvo marca-passo funcionante; evitar em broncoespasmo ou asma, com cautela na DPOC sem broncoconstrição. Quem desenvolver bloqueio de alto grau com uma dose NÃO deve receber doses adicionais — assistolia prolongada e FV já foram relatadas, com desfechos fatais, sobretudo em uso de digoxina ou digoxina + verapamil. Atropina NÃO bloqueia a adenosina; teofilina e cafeína antagonizam (pode falhar) e dipiridamol potencializa (doses menores podem bastar).",
    source: "AHA ACLS 2025",
  },
  {
    id: "atropina",
    name: "Atropina",
    genericName: "Atropina sulfato — 0,5 mg / mL",
    category: "Vagolítico — Bradicardia",
    categoryColor: "#6ee7b7",
    categoryBg: "#0c2f22",
    categoryBorder: "#065f46",
    accentColor: "#059669",
    indication:
      "Bradicardia sintomática com pulso (FC < 60 bpm + instabilidade hemodinâmica, síncope, dor precordial ou dispneia).",
    dose: [
      { label: "Dose inicial", value: "1 mg IV em bolus" },
      { label: "Intervalo", value: "Repetir 1 mg cada 3–5 min" },
      { label: "Dose máxima", value: "3 mg (efeito vagolítico total)" },
      { label: "Atenção", value: "Ineficaz em Mobitz II e BAV total — não atrasar o marcapasso" },
    ],
    whenToUse: [
      "Bradicardia sintomática instável enquanto prepara marcapasso transcutâneo",
      "Bradicardia sinusal, bloqueio AV de 1º grau ou Mobitz I com sintomas",
      "Pós-ROSC: bradicardia com hipotensão ou baixo débito",
    ],
    caution:
      "NÃO usar em AESP de ritmo lento — não reverte a causa subjacente e pode mascarar o quadro. Ineficaz em bloqueio AV de alto grau (Mobitz II, BAV total).",
    source: "AHA ACLS 2025",
  },
  {
    id: "dopamina",
    name: "Dopamina",
    genericName: "Dopamina — 50 mg / 10 mL",
    category: "Vasoativo — Suporte hemodinâmico",
    categoryColor: "#c4b5fd",
    categoryBg: "#241a45",
    categoryBorder: "#4c1d95",
    accentColor: "#7c3aed",
    indication:
      "Bradicardia sintomática refratária à atropina (como ponte ao MP definitivo) e hipotensão/choque pós-ROSC quando noradrenalina não está disponível.",
    dose: [
      { label: "Dose baixa (β1)", value: "5–10 mcg/kg/min → inotropismo + cronotopismo" },
      { label: "Dose alta (α)", value: "10–20 mcg/kg/min → vasoconstrição" },
      { label: "Bradicardia (ACLS)", value: "5–20 mcg/kg/min IV/IO — titular pela FC/PA" },
      { label: "Preparo sugerido*", value: "200 mg em 250 mL SG 5% = 800 mcg/mL  ·  *variável conforme protocolo institucional" },
    ],
    whenToUse: [
      "Bradicardia instável que não respondeu à atropina e aguarda MP transcutâneo/transvenoso",
      "Hipotensão pós-ROSC (PAM < 65 mmHg) sem resposta adequada à reposição volêmica",
      "Quando noradrenalina não disponível no cenário de choque pós-parada",
    ],
    caution:
      "Preferir noradrenalina em choque séptico pós-ROSC (maior evidência). Dopamina causa mais taquiarritmias. Não usar em PCR ativa — não há evidência de benefício.",
    source: "AHA ACLS 2025",
  },
];

// ── Componente do card de droga ───────────────────────────────────────────────

function DrugCard({ drug }: { drug: Drug }) {
  const tr = useTr();
  return (
    <View style={[s.card, { borderLeftColor: drug.accentColor }]}>

      {/* Cabeçalho */}
      <View style={s.cardHeader}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.drugName}>{tr(drug.name)}</Text>
          {drug.genericName ? (
            <Text style={s.drugGeneric}>{tr(drug.genericName)}</Text>
          ) : null}
        </View>
        <View style={[s.categoryBadge, { backgroundColor: drug.categoryBg, borderColor: drug.categoryBorder }]}>
          <Text style={[s.categoryText, { color: drug.categoryColor }]}>{tr(drug.category)}</Text>
        </View>
      </View>

      {/* Indicação */}
      <View style={[s.indicationBlock, { backgroundColor: drug.categoryBg, borderColor: drug.categoryBorder }]}>
        <Text style={[s.indicationLabel, { color: drug.accentColor }]}>{tr("Indicação no ACLS")}</Text>
        <Text style={s.indicationText}>{tr(drug.indication)}</Text>
      </View>

      {/* Dose */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{tr("Dose")}</Text>
        <View style={s.doseTable}>
          {drug.dose.map((d) => (
            <View key={d.label} style={s.doseRow}>
              <Text style={s.doseLabel}>{tr(d.label)}</Text>
              <Text style={s.doseValue}>{tr(d.value)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quando usar */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>{tr("Quando usar")}</Text>
        <View style={s.bulletList}>
          {drug.whenToUse.map((item, i) => (
            <View key={i} style={s.bulletRow}>
              <View style={[s.bulletDot, { backgroundColor: drug.accentColor }]} />
              <Text style={s.bulletText}>{tr(item)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Atenção */}
      {drug.caution ? (
        <View style={s.cautionBlock}>
          <Text style={s.cautionLabel}>{tr("⚠ Atenção")}</Text>
          <Text style={s.cautionText}>{tr(drug.caution)}</Text>
        </View>
      ) : null}

      {/* Fonte */}
      {drug.source ? (
        <Text style={s.sourceText}>{tr(drug.source)}</Text>
      ) : null}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsPharmacologyScreen() {
  const tr = useTr();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · Farmacologia")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("Farmacologia no ACLS")}</Text>
        <Text style={s.introBody}>
          {tr(
            "Drogas de emergência organizadas por indicação clínica. Use como consulta rápida durante o atendimento — dose, via e momento certo de administração."
          )}
        </Text>
        <View style={s.pillRow}>
          {DRUGS.map((d) => (
            <View key={d.id} style={[s.pill, { backgroundColor: d.categoryBg, borderColor: d.categoryBorder }]}>
              <Text style={[s.pillText, { color: d.accentColor }]}>{tr(d.name)}</Text>
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
        <Text style={s.footerTitle}>{tr("Lidocaína — alternativa à amiodarona")}</Text>
        <Text style={s.footerBody}>
          {tr("Quando amiodarona não estiver disponível: ")}
          <Text style={{ fontWeight: "700" }}>{tr("1–1,5 mg/kg IV/IO")}</Text>
          {tr(" em bolus para FV/TV sp refratária. 2ª dose: 0,5–0,75 mg/kg. Dose máx: 3 mg/kg.")}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerTitle}>{tr("Magnésio — Torsades de Pointes")}</Text>
        <Text style={s.footerBody}>
          {tr("TV polimórfica com intervalo QT longo (Torsades): ")}
          <Text style={{ fontWeight: "700" }}>{tr("1–2 g IV/IO")}</Text>
          {tr(" em bolus diluído. NÃO substitui a amiodarona para FV/TV monomórfica.")}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>{tr("Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025)")}</Text>
      </View>

      {/*
        "NÃO FAÇA" do Guia Rápido de ACLS (MedCampus v1.0). Fica aqui, e não numa
        tela nova, porque esta é a referência que a equipe abre com a PCR em
        andamento — e um dos dois itens é justamente sobre fármacos administrados
        por hábito. O item do ETCO₂ é de monitorização, mas decide conduta no
        mesmo momento, então acompanha.
      */}
      <View style={s.naoFacaCard}>
        <Text style={s.naoFacaTitulo}>{tr("NÃO FAÇA durante a PCR")}</Text>

        {NAO_FACA_PCR.map((item) => (
          <View key={item} style={s.naoFacaItem}>
            <Text style={s.naoFacaMarcador}>{tr("✕")}</Text>
            <Text style={s.naoFacaTexto}>{tr(item)}</Text>
          </View>
        ))}

        <Text style={s.naoFacaFonte}>
          {tr("MedCampus · Guia Rápido de ACLS em Adultos v1.0 (AHA 2025)")}
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * "NÃO FAÇA durante a PCR" — Guia Rápido de ACLS (MedCampus v1.0, AHA 2025).
 * Exportado para a versão migrada da tela consumir sem copiar o texto.
 */
export const NAO_FACA_PCR: string[] = [
  "Bicarbonato, cálcio e magnésio NÃO são de rotina na PCR. Usar apenas quando houver indicação específica — hipercalemia, intoxicação por bloqueador de canal de cálcio ou por tricíclico, acidose grave documentada, Torsades de Pointes.",
  "NÃO usar o ETCO₂ isoladamente como critério para encerrar a ressuscitação. É um dado a mais dentro do conjunto clínico, nunca o único — já houve sobreviventes com ETCO₂ médio abaixo de 20 mmHg.",
  "ACESSO: tentar primeiro a via INTRAVENOSA. O intraósseo é aceitável se o IV falhar ou não for viável — a revisão da ILCOR 2025, com três grandes ensaios, encontrou MENOR chance de ROSC sustentado pela via intraóssea. Deixaram de ser equivalentes.",
  "VASOPRESSINA, isolada ou junto da epinefrina, NÃO oferece vantagem como substituta da epinefrina no adulto em PCR.",
  "Betabloqueador, bretílio, procainamida e sotalol na FV/TV sem pulso refratária à desfibrilação: benefício INCERTO. Não substituem amiodarona ou lidocaína.",
  "Dispositivo mecânico de RCP: uso de rotina NÃO é recomendado. Só considerar quando a compressão manual de alta qualidade for inviável ou perigosa para a equipe, limitando as pausas na colocação e retirada.",
  "RCP com ELEVAÇÃO DA CABEÇA não é recomendada fora de ensaio clínico.",
  "Desfibrilação com mudança de vetor e desfibrilação dupla sequencial após 3 ou mais choques: utilidade NÃO estabelecida pela AHA 2025. Não é conduta padrão.",
];

// ── Estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── "NÃO FAÇA" ──
  naoFacaCard: {
    backgroundColor: "#3a2f2a",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#c2410c",
    gap: 10,
  },
  naoFacaTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: 0.2,
  },
  naoFacaItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  naoFacaMarcador: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fb923c",
    lineHeight: 20,
    flexShrink: 0,
  },
  naoFacaTexto: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#e7d9d2",
    fontWeight: "600",
  },
  naoFacaFonte: {
    fontSize: 11,
    fontWeight: "600",
    color: "#c8b6ac",
    letterSpacing: 0.2,
  },
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
    gap: 12,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  drugName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f1f5f9",
    letterSpacing: -0.3,
    lineHeight: 26,
  },
  drugGeneric: {
    fontSize: 12,
    fontWeight: "500",
    color: "#aab6c6",
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
    color: "#cbd5e1",
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
    color: "#aab6c6",
  },

  // ── Tabela de dose ──
  doseTable: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#565e6c",
    overflow: "hidden",
  },
  doseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#565e6c",
    gap: 10,
  },
  doseLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#aab6c6",
    width: 140,
    flexShrink: 0,
    lineHeight: 18,
  },
  doseValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f1f5f9",
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
    color: "#aab6c6",
    flex: 1,
    lineHeight: 20,
  },

  // ── Atenção ──
  cautionBlock: {
    backgroundColor: "#383e4a",
    borderRadius: 10,
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  cautionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#fde68a",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  cautionText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#aab6c6",
    fontWeight: "500",
  },

  // ── Fonte ──
  sourceText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#aab6c6",
    letterSpacing: 0.2,
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
    letterSpacing: -0.1,
  },
  footerBody: {
    fontSize: 13,
    lineHeight: 20,
    color: "#f1f5f9",
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
