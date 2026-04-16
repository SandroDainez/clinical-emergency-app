import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppDesign } from "../../constants/app-design";
import { ModuleFlowHero, ModuleFlowLayout } from "./module-flow-shell";

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
      { label: "Alternativa se amiodarona indisponível", value: "Lidocaína 1–1,5 mg/kg IV/IO" },
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
      { label: "Preparo sugerido*", value: "200 mg em 250 mL SG 5% = 800 mcg/mL  ·  *variável conforme protocolo institucional" },
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
  {
    id: "noradrenalina",
    name: "Noradrenalina",
    genericName: "Noradrenalina — infusão contínua",
    category: "Vasopressor — pós-ROSC / choque",
    categoryColor: "#7f1d1d",
    categoryBg: "#fff1f2",
    categoryBorder: "#fecdd3",
    accentColor: "#dc2626",
    indication:
      "Vasopressor de primeira linha em choque vasoplégico e hipotensão pós-ROSC, especialmente quando há necessidade de manter PAM ≥ 65 mmHg.",
    dose: [
      { label: "Dose inicial", value: "0,05–0,1 mcg/kg/min em infusão contínua" },
      { label: "Faixa usual", value: "0,01–1 mcg/kg/min, titulando por PAM e perfusão" },
      { label: "Acesso ideal", value: "Preferir acesso central; periférico curto prazo apenas em urgência e com vigilância" },
      { label: "Meta clínica", value: "PAM ≥ 65 mmHg ou alvo individualizado" },
    ],
    whenToUse: [
      "Hipotensão persistente após ROSC apesar de volume e correção de causas reversíveis",
      "Choque séptico, distributivo ou vasoplégico no cenário pós-PCR",
      "Baixa perfusão com necessidade de vasoconstrição mais previsível que a dopamina",
    ],
    caution:
      "Monitorar extravasamento, perfusão periférica e resposta hemodinâmica. Em dose alta ou resposta incompleta, considerar vasopressina associada.",
    source: "AHA pós-ROSC + prática intensiva contemporânea",
  },
  {
    id: "vasopressina",
    name: "Vasopressina",
    genericName: "Vasopressina — dose fixa",
    category: "Adjuvante — choque refratário",
    categoryColor: "#155e75",
    categoryBg: "#ecfeff",
    categoryBorder: "#a5f3fc",
    accentColor: "#0891b2",
    indication:
      "Adjuvante poupador de catecolamina em choque refratário, principalmente quando a dose de noradrenalina está subindo e a PAM segue baixa.",
    dose: [
      { label: "Dose usual", value: "0,03 U/min em infusão contínua" },
      { label: "Titulação", value: "Geralmente dose fixa — não é droga para ampla titulação" },
      { label: "Associação", value: "Usar junto com noradrenalina, não como substituto isolado" },
      { label: "Objetivo", value: "Poupar catecolamina e facilitar meta de PAM" },
    ],
    whenToUse: [
      "Choque refratário com necessidade crescente de noradrenalina",
      "Pós-ROSC com vasoplegia importante e resposta insuficiente à catecolamina isolada",
      "Estratégia combinada quando se quer reduzir dose de vasopressor adrenérgico",
    ],
    caution:
      "A vasopressina em bolus como alternativa rotineira à epinefrina na PCR não faz mais parte do ACLS moderno. Aqui o foco é o uso em infusão no pós-ROSC/choque.",
    source: "AHA 2015+ / prática em choque refratário",
  },
  {
    id: "dobutamina",
    name: "Dobutamina",
    genericName: "Dobutamina — infusão contínua",
    category: "Inotrópico — baixo débito",
    categoryColor: "#4c1d95",
    categoryBg: "#f5f3ff",
    categoryBorder: "#c4b5fd",
    accentColor: "#7c3aed",
    indication:
      "Disfunção miocárdica e baixo débito no pós-ROSC ou no choque cardiogênico, especialmente quando há perfusão inadequada apesar de PAM aceitável.",
    dose: [
      { label: "Dose inicial", value: "2,5–5 mcg/kg/min em infusão contínua" },
      { label: "Faixa usual", value: "2,5–20 mcg/kg/min" },
      { label: "Efeito esperado", value: "Aumento de inotropismo e débito cardíaco" },
      { label: "Associação frequente", value: "Combinar com vasopressor se houver hipotensão" },
    ],
    whenToUse: [
      "Baixo débito pós-ROSC com evidência de disfunção sistólica",
      "Choque cardiogênico com congestão e hipoperfusão",
      "Situações em que a pressão está razoável, mas a perfusão continua inadequada",
    ],
    caution:
      "Pode precipitar taquiarritmia e piorar hipotensão. Se o doente estiver frio e hipotenso, muitas vezes precisa de vasopressor junto.",
    source: "AHA pós-ROSC / cuidados intensivos",
  },
  {
    id: "lidocaina",
    name: "Lidocaína",
    genericName: "Lidocaína 2% — alternativa antiarrítmica",
    category: "Antiarrítmico — alternativa à amiodarona",
    categoryColor: "#7c2d12",
    categoryBg: "#fff7ed",
    categoryBorder: "#fed7aa",
    accentColor: "#ea580c",
    indication:
      "FV/TV sem pulso refratária quando a amiodarona não está disponível ou não é a melhor escolha no contexto clínico.",
    dose: [
      { label: "1ª dose", value: "1–1,5 mg/kg IV/IO em bolus" },
      { label: "Repetição", value: "0,5–0,75 mg/kg se necessário" },
      { label: "Dose máxima acumulada", value: "3 mg/kg" },
      { label: "Manutenção (pós-ROSC)", value: "1–4 mg/min IV conforme contexto" },
    ],
    whenToUse: [
      "FV/TV sp refratária como alternativa prática à amiodarona",
      "Contexto pós-ROSC com recorrência ventricular quando protocolo local preferir lidocaína",
      "Situações em que a equipe já trabalha com lidocaína como antiarrítmico principal",
    ],
    caution:
      "Ajustar em idosos, hepatopatia e perfusão ruim. Sinais neurológicos e convulsão sugerem toxicidade.",
    source: "AHA ACLS 2020",
  },
  {
    id: "magnesio",
    name: "Magnésio",
    genericName: "Sulfato de magnésio",
    category: "Adjuvante — Torsades / distúrbio eletrolítico",
    categoryColor: "#065f46",
    categoryBg: "#ecfdf5",
    categoryBorder: "#a7f3d0",
    accentColor: "#059669",
    indication:
      "Torsades de Pointes, TV polimórfica com QT longo e suspeita de hipomagnesemia relevante.",
    dose: [
      { label: "Dose usual", value: "1–2 g IV/IO em bolus diluído" },
      { label: "PCR com Torsades", value: "Pode ser administrado rapidamente durante a RCP" },
      { label: "Infusão após bolus", value: "Considerar manutenção conforme resposta e protocolo local" },
      { label: "Objetivo", value: "Reduzir recorrência da TV polimórfica" },
    ],
    whenToUse: [
      "Torsades de Pointes confirmada ou fortemente suspeita",
      "QT longo + TV polimórfica recorrente",
      "Suspeita de distúrbio eletrolítico associado à arritmia ventricular",
    ],
    caution:
      "Não substitui desfibrilação quando indicada e não é antiarrítmico de rotina para FV/TV monomórfica.",
    source: "AHA ACLS 2020",
  },
];

const PHARMACOLOGY_SECTIONS = [
  { id: "overview", icon: "🧭", label: "Visão geral", hint: "Mapa das drogas do ACLS", step: "1", accent: "#0f766e" },
  { id: "pcr", icon: "⚡", label: "PCR", hint: "Epinefrina e antiarrítmicos da parada", step: "2", accent: "#dc2626" },
  { id: "pulse", icon: "🫀", label: "Com pulso", hint: "Adenosina e atropina", step: "3", accent: "#1d4ed8" },
  { id: "support", icon: "💉", label: "Suporte", hint: "Dopamina, noradrenalina, vasopressina, dobutamina", step: "4", accent: "#7c3aed" },
  { id: "adjuncts", icon: "➕", label: "Adjuvantes", hint: "Lidocaína e magnésio", step: "5", accent: "#059669" },
] as const;

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
  const [activeSection, setActiveSection] = useState<(typeof PHARMACOLOGY_SECTIONS)[number]["id"]>("overview");
  const visibleDrugs = DRUGS.filter((drug) => {
    if (activeSection === "overview") return true;
    if (activeSection === "pcr") return ["epinefrina", "amiodarona"].includes(drug.id);
    if (activeSection === "pulse") return ["adenosina", "atropina"].includes(drug.id);
    if (activeSection === "support") return ["dopamina", "noradrenalina", "vasopressina", "dobutamina"].includes(drug.id);
    if (activeSection === "adjuncts") return ["lidocaina", "magnesio"].includes(drug.id);
    return false;
  });

  return (
    <ModuleFlowLayout
      hero={
        <ModuleFlowHero
          eyebrow="ACLS · Referência"
          title="Farmacologia ACLS organizada por cenário clínico"
          subtitle="A consulta rápida continua igual, agora separada por PCR, ritmos com pulso, suporte hemodinâmico e adjuvantes."
          badgeText="AHA ACLS 2020 · atualização focada 2022–2023"
          metrics={[
            { label: "Drogas", value: String(DRUGS.length), accent: "#0f766e" },
            { label: "PCR", value: "Epinefrina e antiarrítmico", accent: "#dc2626" },
            { label: "Pós-ROSC", value: "Suporte hemodinâmico", accent: "#7c3aed" },
          ]}
          progressLabel={PHARMACOLOGY_SECTIONS.find((section) => section.id === activeSection)?.label ?? "Visão geral"}
          stepTitle={PHARMACOLOGY_SECTIONS.find((section) => section.id === activeSection)?.hint ?? "Doses, indicações e cautelas no mesmo fluxo"}
          hint="Use esta tela como referência operacional rápida, não como substituto da decisão clínica do caso."
          compactMobile
        />
      }
      items={PHARMACOLOGY_SECTIONS as unknown as { id: string; icon?: string; label: string; hint?: string; step?: string; accent?: string }[]}
      activeId={activeSection}
      onSelect={(id) => setActiveSection(String(id) as (typeof PHARMACOLOGY_SECTIONS)[number]["id"])}
      sidebarEyebrow="Navegação ACLS"
      sidebarTitle="Farmacologia">
      <View style={s.content}>
        {activeSection === "overview" ? (
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
        ) : null}

        {visibleDrugs.map((drug) => (
          <DrugCard key={drug.id} drug={drug} />
        ))}

        <View style={s.footerCard}>
          <Text style={s.footerTitle}>Bicarbonato e cálcio não são rotina</Text>
          <Text style={s.footerBody}>
            No ACLS moderno, essas drogas ficam reservadas para cenários específicos como hipercalemia,
            intoxicação por bloqueador de canal de sódio, hiperK grave ou hipocalcemia importante.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerTitle}>Pós-ROSC importa tanto quanto a PCR</Text>
          <Text style={s.footerBody}>
            Noradrenalina, vasopressina e dobutamina entram sobretudo no cuidado hemodinâmico após o retorno
            da circulação espontânea ou em choque peri-arresto.
          </Text>
          <View style={s.footerRule} />
          <Text style={s.footerSource}>Baseado em AHA ACLS 2020 + atualizações focadas 2022–2023</Text>
        </View>
      </View>
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
    gap: 12,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  drugName: {
    fontSize: 22,
    fontWeight: "900",
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
    backgroundColor: "#ffffff",
    borderRadius: 24,
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
