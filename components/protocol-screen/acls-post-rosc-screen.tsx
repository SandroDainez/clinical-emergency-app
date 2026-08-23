import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReferenceBackHeader from "./reference-back-header";
import {
  META_FEBRE,
  META_GLICEMIA,
  META_OXIGENACAO,
  META_PRESSAO,
  META_PROGNOSTICO,
  META_TEMPERATURA,
  META_VENTILACAO,
} from "../../lib/metas-pos-parada";
import { useTr } from "../../lib/use-tr";

import { DOBUTAMINA_ATE_20, DOBUTAMINA_FAIXA_USUAL, DOBUTAMINA_INICIO } from "../../lib/dobutamina";
// ── Tipos ─────────────────────────────────────────────────────────────────────

export type DomainItem = {
  label: string;
  value: string;
  alert?: boolean;
};

export type Domain = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  items: DomainItem[];
  note?: string;
};

// ── Dados clínicos ─────────────────────────────────────────────────────────────

/**
 * Conteúdo clínico dos cuidados pós-PCR — consumido também pela versão migrada
 * (acls-post-rosc-screen-v2.tsx). Importado, nunca copiado.
 */
export const DOMAINS: Domain[] = [
  {
    id: "estabilizacao",
    icon: "⚡",
    title: "Estabilização Inicial",
    subtitle: "Primeiros minutos após ROSC confirmado",
    accentColor: "#fb923c",
    accentBg: "#1a1008",
    accentBorder: "#431407",
    items: [
      { label: "Confirmar ROSC", value: "Pulso central palpável + ritmo organizado no monitor" },
      { label: "Via aérea", value: "Confirmar posição do tubo (capnografia contínua). Intubar se ainda não realizado" },
      { label: "ECG 12 derivações", value: "Imediato após ROSC — pesquisar IAMCSST ou equivalente" },
      { label: "IAMCSST identificado?", value: "Acionar hemodinâmica urgente — intervenção coronária é prioridade mesmo em comatoso", alert: true },
      { label: "Acesso venoso/IO", value: "Manter dois acessos calibrosos. Trocar IO por acesso venoso assim que possível" },
      { label: "Monitorização", value: "ECG contínuo, SpO₂, ETCO₂, PA invasiva se disponível" },
    ],
    note: "Evite mover o paciente prematuramente. Estabilize hemodinâmica e ventilação antes do transporte.",
  },
  {
    id: "ventilacao",
    icon: "💨",
    title: "Ventilação e Oxigenação",
    subtitle: "Metas: normoventilação e oxigenação controlada",
    accentColor: "#38bdf8",
    accentBg: "#071724",
    accentBorder: "#0c2d48",
    items: [
      { label: "Oxigenação", value: META_OXIGENACAO, alert: true },
      { label: "Ventilação", value: META_VENTILACAO, alert: true },
      { label: "Volume corrente (VT)", value: "6–8 mL/kg de peso PREDITO (calculado pela altura)" },
      { label: "FR inicial", value: "10–12 rpm — ajustar pela capnografia ou gasometria" },
      { label: "PEEP", value: "5–8 cmH₂O como ponto de partida" },
      { label: "Capnografia (ETCO₂)", value: "Confirmar intubação + guia de ventilação. ETCO₂ > 40 mmHg = hipoventilação" },
    ],
    note: "Hiperventilação é uma armadilha frequente no pós-PCR — reduz PaCO₂, provoca hipocapnia e piora o prognóstico neurológico.",
  },
  {
    id: "hemodinamica",
    icon: "🫀",
    title: "Hemodinâmica",
    subtitle: "Suporte circulatório e perfusão de órgãos",
    accentColor: "#f87171",
    accentBg: "#180a0a",
    accentBorder: "#3f0f0f",
    items: [
      { label: "Pressão", value: META_PRESSAO, alert: true },
      // Esta tela dizia só "0,1–1 mcg/kg/min", e a faixa lida sozinha vira TETO:
      // quem chega em 1 e continua hipotenso conclui que acabou o que fazer. O
      // módulo de drogas vasoativas já trazia a leitura completa (> 1 = dose
      // alta, marcador de gravidade; excepcionais até ~3 documentadas) e a
      // associação de vasopressina — esta tela ficou para trás. Mesma redação
      // das outras superfícies, de propósito.
      { label: "Vasopressor de 1ª escolha", value: "Noradrenalina 0,1–1 mcg/kg/min IV — titular pela PAM. A faixa é a HABITUAL, não um teto: acima de 1 mcg/kg/min é dose alta (marcador de gravidade, com saturação progressiva dos receptores alfa) e doses excepcionais de até ~3 mcg/kg/min estão documentadas em choque vasoplégico refratário, com monitorização invasiva e estratégia multimodal." },
      // ⚠️ DUAS LINHAS, PORQUE SÃO DOIS CRITÉRIOS DE RECOMENDAÇÕES DIFERENTES.
      //
      // Estavam fundidos numa frase só, e a fusão é o defeito: o "0,25–0,5" e o
      // "≥ 0,25 por ≥ 4 h" parecem o mesmo número dito duas vezes, e não são.
      //
      //   0,25–0,5 mcg/kg/min      → REMARK DE PRÁTICA DO PAINEL, noutra
      //                              recomendação: quando o painel costuma
      //                              INICIAR vasopressina.
      //   ≥ 0,25 por ≥ 4 h         → RATIONALE da recomendação de CORTICOIDE:
      //                              a definição operacional de "necessidade
      //                              contínua" de vasopressor.
      //
      // Lidos juntos, o segundo vira portão do primeiro — que é exatamente o que
      // nenhum dos dois diz.
      { label: "Associar vasopressina", value: "0,03 U/min, dose FIXA (não titular) — o painel costuma iniciar a partir de noradrenalina ≈ 0,25 mcg/kg/min (faixa usual de início 0,25–0,5). ⚠️ REMARK DE PRÁTICA DO PAINEL, NÃO PORTÃO: a SSC 2026 não fixa limiar de dose para associar. Associar em vez de escalar a noradrenalina sozinha — se a escalada já está evidente, não espere chegar a 0,5.", alert: true },
      { label: "Considerar corticoide", value: "Hidrocortisona 200 mg/dia no choque séptico. ⚠️ CRITÉRIO DE OUTRA RECOMENDAÇÃO, e não é portão: noradrenalina ≥ 0,25 mcg/kg/min por ≥ 4 h é a definição operacional de necessidade CONTÍNUA de vasopressor usada no rationale — a SSC 2026 recomenda o corticoide no choque séptico SEM número de entrada, e o limiar não deve impedir a indicação em quem já tem necessidade persistente.", alert: true },
      { label: "Inotrópico (baixo DC)", value: "Dobutamina se IC baixo com PAM adequada" },
      { label: "Dobutamina — início", value: DOBUTAMINA_INICIO },
      { label: "Dobutamina — faixa usual", value: DOBUTAMINA_FAIXA_USUAL },
      { label: "Dobutamina — subir além da faixa", value: DOBUTAMINA_ATE_20 },
      { label: "Reposição volêmica", value: "SF 250–500 mL se hipovolemia evidente. Evitar sobrecarga hídrica" },
      // A faixa-alvo e o piso de hipoglicemia viviam separados e competindo:
      // este item dizia "evitar < 70 e > 180" e o QUICK_GOALS dizia
      // "140–180 mg/dL", na MESMA tela. São construtos que se complementam —
      // um alvo e um chão —, e agora aparecem hierarquizados num item só.
      { label: "Glicemia", value: META_GLICEMIA, alert: true },
    ],
    note: "Ecocardiografia à beira leito (POCUS) auxilia na avaliação de função ventricular, tamponamento e volemia.",
  },
  {
    id: "neurologia",
    icon: "🧠",
    title: "Avaliação Neurológica",
    subtitle: "Proteção cerebral e estratificação prognóstica",
    accentColor: "#a78bfa",
    accentBg: "#120c1f",
    accentBorder: "#2e1a4a",
    items: [
      { label: "Glasgow inicial", value: "Registrar assim que possível pós-ROSC. Sedação prévia interfere na avaliação" },
      { label: "Pupilas", value: "Fotorreatividade bilateral. Midríase fixa pode ser transitória logo após PCR" },
      { label: "Controle de temperatura", value: META_TEMPERATURA, alert: true },
      { label: "Limiar de febre", value: META_FEBRE, alert: true },
      { label: "Status epiléptico", value: "Suspeitar em movimentos faciais subtis ou alteração pupilar sem causa — EEG contínuo se disponível" },
      { label: "Prognóstico neurológico", value: META_PROGNOSTICO, alert: true },
    ],
    note: "Sedação excessiva impede a avaliação neurológica. Use a menor dose eficaz e faça janelas de sedação conforme protocolo da UTI.",
  },
];

/**
 * Faixa de metas do topo — os NÚMEROS, para leitura em movimento.
 *
 * ⚠️ Aqui vai só o valor; o porquê e as ressalvas vivem nos itens dos domínios,
 * que consomem as mesmas constantes. Duas coisas mudaram e ambas eram
 * divergência interna, não estilo:
 *
 *  · A temperatura dizia "≤ 37,7 °C" enquanto o domínio declarava a faixa de
 *    controle até 37,5 — a faixa rápida contradizia a meta.
 *  · A glicemia dizia "140–180" enquanto o item do domínio dizia "evitar < 70 e
 *    > 180". Dois números diferentes para a mesma pergunta, na mesma tela.
 */
export const QUICK_GOALS = [
  { label: "SpO₂", value: "90–98%", color: "#38bdf8" },
  { label: "PaCO₂", value: "35–45 mmHg", color: "#38bdf8" },
  { label: "PAM", value: "≥ 65 mmHg", color: "#fca5a5" },
  { label: "Glicemia", value: "140–180 mg/dL", color: "#fbbf24" },
  { label: "Temperatura", value: "≤ 37,5°C", color: "#a78bfa" },
];

// ── Componentes ───────────────────────────────────────────────────────────────

function DomainCard({ domain }: { domain: Domain }) {
  const tr = useTr();
  return (
    <View style={[dc.card, { borderTopColor: domain.accentColor }]}>
      {/* Cabeçalho */}
      <View style={[dc.header, { backgroundColor: domain.accentBg, borderBottomColor: domain.accentBorder }]}>
        <Text style={dc.icon}>{domain.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[dc.title, { color: domain.accentColor }]}>{tr(domain.title)}</Text>
          <Text style={[dc.subtitle, { color: domain.accentColor }]}>{tr(domain.subtitle)}</Text>
        </View>
      </View>

      {/* Itens */}
      <View style={dc.itemsBlock}>
        {domain.items.map((item) => (
          <View
            key={item.label}
            style={[
              dc.itemRow,
              item.alert && { backgroundColor: domain.accentBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: -2 },
            ]}>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={dc.itemLabelRow}>
                {item.alert ? (
                  <View style={[dc.alertDot, { backgroundColor: domain.accentColor }]} />
                ) : null}
                <Text style={[dc.itemLabel, item.alert && { color: domain.accentColor }]}>
                  {tr(item.label)}
                </Text>
              </View>
              <Text style={[dc.itemValue, item.alert && { fontWeight: "700", color: "#f1f5f9" }]}>
                {tr(item.value)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Nota */}
      {domain.note ? (
        <View style={[dc.noteBlock, { borderLeftColor: domain.accentColor }]}>
          <Text style={dc.noteText}>{tr(domain.note)}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ── Tela principal ────────────────────────────────────────────────────────────

export default function AclsPostRoscScreen() {
  const tr = useTr();
  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}>

      <ReferenceBackHeader label={tr("ACLS · Pós-PCR")} />

      {/* Introdução */}
      <View style={s.introCard}>
        <Text style={s.introEyebrow}>{tr("ACLS · Referência")}</Text>
        <Text style={s.introTitle}>{tr("Cuidados Pós-PCR")}</Text>
        <Text style={s.introBody}>
          {tr(
            "Após o ROSC, a conduta sistemática nos primeiros minutos e horas é determinante para a sobrevida com boa função neurológica. Estabilize, monitore metas e transfira para UTI.",
          )}
        </Text>
      </View>

      {/* Metas rápidas */}
      <View style={s.goalsCard}>
        <Text style={s.goalsTitle}>{tr("Metas imediatas")}</Text>
        <View style={s.goalsRow}>
          {QUICK_GOALS.map((goal) => (
            <View key={goal.label} style={[s.goalItem, { borderColor: goal.color + "44" }]}>
              <Text style={[s.goalLabel, { color: goal.color }]}>{tr(goal.label)}</Text>
              <Text style={[s.goalValue, { color: goal.color }]}>{goal.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Domínios clínicos */}
      {DOMAINS.map((domain) => (
        <DomainCard key={domain.id} domain={domain} />
      ))}

      {/* Rodapé */}
      <View style={s.footerCard}>
        <Text style={s.footerTitle}>{tr("Destino: UTI o mais rápido possível")}</Text>
        <Text style={s.footerBody}>
          {tr(
            "O paciente pós-PCR reanimado com sucesso precisa de monitorização contínua e suporte multi-orgânico. Comunique ao intensivista: ritmo da PCR, tempo de colapso, tempo de RCP, doses de epinefrina, cardioversões e causa presumida.",
          )}
        </Text>
        <View style={s.footerRule} />
        <Text style={s.footerSource}>
          {tr("Baseado em AHA ACLS 2025")}
        </Text>
      </View>
    </ScrollView>
  );
}

// ── Estilos do DomainCard ────────────────────────────────────────────────────

const dc = StyleSheet.create({
  card: {
    backgroundColor: "#383e4a",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#565e6c",
    borderTopWidth: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  icon: {
    fontSize: 24,
    lineHeight: 30,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
    opacity: 0.8,
  },
  itemsBlock: {
    padding: 14,
    gap: 6,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  itemLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  itemLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#aab6c6",
  },
  itemValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#aab6c6",
    lineHeight: 19,
  },
  noteBlock: {
    borderLeftWidth: 3,
    marginHorizontal: 14,
    marginBottom: 14,
    paddingLeft: 10,
    paddingVertical: 4,
  },
  noteText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#aab6c6",
    lineHeight: 18,
    fontStyle: "italic",
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
    gap: 10,
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
  introBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#aab6c6",
    fontWeight: "500",
  },

  // ── Metas ──
  goalsCard: {
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
  goalsTitle: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#aab6c6",
  },
  goalsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  goalItem: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
    minWidth: 90,
  },
  goalLabel: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  goalValue: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.1,
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
