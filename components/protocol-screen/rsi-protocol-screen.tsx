/**
 * Módulo ISR — Intubação em sequência rápida.
 * Fluxo clínico simplificado: referência + passo a passo. Sem comandos de voz.
 */

import { useMemo, useState, type ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { getAppGuidelinesStatus, getModuleGuidelinesStatus } from "../../lib/guidelines-version";
import { AppDesign } from "../../constants/app-design";

type TabId =
  | "visao"
  | "indicacoes"
  | "equipamento"
  | "farmacos"
  | "sequencia"
  | "seguranca";

/** Intervalos de dose (mg/kg ou mcg/kg) — referência para ISR em adulto; titular ao paciente. */
const RSI_DOSE_RANGES: {
  key: string;
  label: string;
  unit: "mg" | "mcg";
  perKgLow: number;
  perKgHigh: number;
}[] = [
  { key: "fentanil", label: "Fentanila", unit: "mcg", perKgLow: 1, perKgHigh: 3 },
  { key: "cetamina", label: "Cetamina", unit: "mg", perKgLow: 1, perKgHigh: 2 },
  { key: "etomidato", label: "Etomidato", unit: "mg", perKgLow: 0.2, perKgHigh: 0.3 },
  { key: "propofol", label: "Propofol", unit: "mg", perKgLow: 1, perKgHigh: 2.5 },
  { key: "midazolam", label: "Midazolam (adjuvante — titular)", unit: "mg", perKgLow: 0.1, perKgHigh: 0.3 },
  { key: "rocuronio", label: "Rocurônio (ISR)", unit: "mg", perKgLow: 1, perKgHigh: 1.2 },
  { key: "succinilcolina", label: "Succinilcolina", unit: "mg", perKgLow: 1, perKgHigh: 1.5 },
  { key: "vecuronio", label: "Vecurônio (dose alta, se protocolo)", unit: "mg", perKgLow: 0.15, perKgHigh: 0.25 },
];

function parsePt(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n < 500 ? n : null;
}

function fmtAmount(n: number, unit: "mg" | "mcg"): string {
  const decimals = unit === "mcg" ? 0 : n < 10 ? 2 : n < 100 ? 1 : 0;
  return n.toFixed(decimals).replace(".", ",");
}

function fmtKg(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1).replace(".", ",");
}

function formatDoseRange(
  w: number,
  perKgLow: number,
  perKgHigh: number,
  unit: "mg" | "mcg"
): string {
  const low = w * perKgLow;
  const high = w * perKgHigh;
  return `${fmtAmount(low, unit)}–${fmtAmount(high, unit)} ${unit}`;
}

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "visao", label: "Visão geral", emoji: "📋" },
  { id: "indicacoes", label: "Indicações", emoji: "🎯" },
  { id: "equipamento", label: "Equipamento", emoji: "🧰" },
  { id: "farmacos", label: "Sedação / BNM", emoji: "💉" },
  { id: "sequencia", label: "Sequência", emoji: "⏱️" },
  { id: "seguranca", label: "Segurança", emoji: "🛡️" },
];

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bullets}>
      {items.map((line) => (
        <Text key={line} style={styles.bulletLine}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function RsiProtocolScreen() {
  const [tab, setTab] = useState<TabId>("visao");
  const [weightKg, setWeightKg] = useState("");

  const guidelinesStatus = useMemo(() => getAppGuidelinesStatus(), []);
  const moduleStatuses = useMemo(() => getModuleGuidelinesStatus("isr_rapida"), []);
  const badgeColor = moduleStatuses[0]?.statusColor ?? guidelinesStatus.overallColor;

  const body = useMemo(() => {
    const w = parsePt(weightKg);
    switch (tab) {
      case "visao":
        return (
          <>
            <Card title="O que é ISR">
              <Text style={styles.p}>
                Indução anestésica rápida seguida de bloqueio neuromuscular de início rápido e intubação
                traqueal, minimizando o intervalo sem proteção de via aérea. O objetivo é reduzir o risco de
                aspiração e ganhar tempo em situações de emergência.
              </Text>
              <Text style={styles.pMuted}>
                Ajuste sempre à realidade do serviço (droga disponível, via aérea difícil prevista, equipe e
                monitorização).
              </Text>
            </Card>
            <Card title="Princípios">
              <BulletList
                items={[
                  "Pré-oxigenar de forma efetiva antes de apneia.",
                  "Ter plano A/B/C (intubação direta, dispositivo supraglótico, cirúrgico) conforme protocolo local.",
                  "Capnografia para confirmar posição traqueal — obrigatória em ambiente com equipamento.",
                  "Após IOT: sedoanalgesia de manutenção e parâmetros ventilatórios seguros.",
                ]}
              />
            </Card>
          </>
        );
      case "indicacoes":
        return (
          <>
            <Card title="Indicações frequentes (emergência)">
              <BulletList
                items={[
                  "Insuficiência respiratória aguda com esgotamento ou falha de suporte não invasivo.",
                  "Alteração do nível de consciência com perda de reflexos protetores de via aérea.",
                  "Choque refratário em que se prevê necessidade de ventilação invasiva imediata.",
                  "Parada respiratória ou risco iminente.",
                  "Controle de via aérea antes de procedimento em paciente grave (contexto clínico).",
                ]}
              />
            </Card>
            <Card title="Quando rever o plano (não “ISR clássica”)">
              <BulletList
                items={[
                  "Via aérea difícil antecipada: preparar vídeo, bougie, segundo operador, dispositivo supraglótico.",
                  "Obesidade grave: posição rampa / elevação torácica; considerar apneia prolongada com NIV ou HFNC.",
                  "Asma / DPOC em instabilidade: discussão entre sedação, relaxamento e ventilação pós-IOT.",
                  "Hipoxemia refratária: maximizar oxigenação antes de paralisar; considerar estratégia alternativa.",
                ]}
              />
            </Card>
          </>
        );
      case "equipamento":
        return (
          <>
            <Card title="Checklist mínimo">
              <BulletList
                items={[
                  "Monitor: FC, SpO₂, PA (invasiva se disponível), ECG.",
                  "Aspiração (rígida e flexível) e cânulas orofaringeas.",
                  "Fonte de O₂ alto fluxo + máscara com reservatório; canula nasal para oxigenação apneica.",
                  "Ventilação com bolsa-válvula-máscara (2 mãos quando possível), válvula PEEP se indicado.",
                  "Laringoscópio (preferir vídeo se disponível) + lâminas compatíveis.",
                  "Tubos orotraqueais (2 tamanhos) + estilete / bougie.",
                  "Dispositivo supraglótico adequado ao contexto.",
                  "Capnógrafo / capnografia em linha (confirmação de IOT).",
                  "Seringas e acesso venoso funcionando; kit de cricotireoidostomia cirúrgico conforme local.",
                ]}
              />
            </Card>
            <Card title="Tamanho aproximado de TOT (adulto)">
              <Text style={styles.p}>
                Referência comum: mulher ~7,0–7,5; homem ~7,5–8,5. Ajustar por estatura, narina e avaliação
                clínica. Em dúvida, preparar um tamanho acima e um abaixo.
              </Text>
            </Card>
          </>
        );
      case "farmacos":
        return (
          <>
            <Card title="Peso do paciente">
              <View style={styles.weightRow}>
                <Text style={styles.weightLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.weightInput}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="decimal-pad"
                  placeholder="ex: 70"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {w == null ? (
                <Text style={styles.pMuted}>
                  Informe o peso para exibir doses totais em mg ou mcg (intervalos por kg abaixo).
                </Text>
              ) : (
                <Text style={styles.weightOk}>
                  Calculando para {fmtKg(w)} kg — totais abaixo usam faixa por kg usual de ISR.
                </Text>
              )}
            </Card>

            {w != null && (
              <Card title="Doses totais sugeridas (faixa por kg)">
                <Text style={styles.doseTableHint}>
                  Valores = peso × (dose mínima–máxima por kg). Obesidade: considerar peso ideal ou protocolo local;
                  hipotensão/idoso: titular. Não substitui checagem de apresentação da ampola.
                </Text>
                <View style={styles.doseTable}>
                  {RSI_DOSE_RANGES.map((row, i) => (
                    <View
                      key={row.key}
                      style={[
                        styles.doseRow,
                        i === RSI_DOSE_RANGES.length - 1 ? styles.doseRowLast : null,
                      ]}>
                      <Text style={styles.doseDrug}>{row.label}</Text>
                      <Text style={styles.doseVal}>
                        {formatDoseRange(w, row.perKgLow, row.perKgHigh, row.unit)}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            <Card title="Analgesia (opioide) — antes ou junto da indução">
              <Text style={styles.p}>
                Muitas emergências utilizam fentanila em bolus IV (ex.: 1–3 mcg/kg) para atenuar resposta
                hemodinâmica e reflexo laringeano; titular conforme idade, hipotensão e sedação prévia. Em hipotensão
                grave, reduzir ou postergar.
              </Text>
            </Card>
            <Card title="Agente hipnótico (sedativo de indução)">
              <BulletList
                items={[
                  "Cetamina 1–2 mg/kg IV: mantém melhor tom vascular e pode ser preferida em instabilidade hemodinâmica; efeito dissociativo.",
                  "Etomidato ~0,2–0,3 mg/kg IV: perfil hemodinâmico relativamente estável; atenção à supressão adrenal (contexto de sepse — decisão individualizada).",
                  "Propofol 1–2,5 mg/kg IV: rápido; hipotensão frequente — cautela em choque.",
                  "Midazolam em doses menores se esquema institucional (geralmente não droga única de indução rápida).",
                ]}
              />
            </Card>
            <Card title="Bloqueador neuromuscular (relaxante)">
              <BulletList
                items={[
                  "Rocurônio 1,0–1,2 mg/kg IV (dose típica de ISR): início ~60–90 s; duração prolongada — planejar sedoanalgesia de manutenção e ventilação.",
                  "Succinilcolina 1–1,5 mg/kg IV: início muito rápido; contraindicar em hipercalemia, desmielinização, queimados extensos recentes, miopatias, história familiar de hipertermia maligna (associação a halogenados).",
                  "Alternativa: vecurônio em alta dose se protocolo local (início mais lento).",
                ]}
              />
              <Text style={styles.pMuted}>
                Sugammadex reverte rocurônio/vecurônio se disponível e protocolo institucional.
              </Text>
            </Card>
            <Card title="Ordem típica (referência)">
              <Text style={styles.p}>
                Analgesia (se usada) → sedativo IV → aguardar efeito clínico breve → relaxante IV → após tempo
                de latência, laringoscopia e passagem do tubo. Não ventilar de rotina na “ISR clássica” se risco
                de aspiração; em hipoxemia grave, muitos protocolos permitem ventilação gentil com máscara
                para ganhar SpO₂ — priorize segurança do paciente.
              </Text>
            </Card>
          </>
        );
      case "sequencia":
        return (
          <>
            <Card title="Passo a passo (simplificado)">
              <BulletList
                items={[
                  "1. Reunião rápida: papel de cada um, drogas calculadas em mg/mL, confirmação de alergias.",
                  "2. Posicionar: cabeça em linha neutra ou rampa; abrir a boca; aspirar se necessário.",
                  "3. Pré-oxigenar: FiO₂ 100%, 3–5 min se possível; considerar NIV ou HFNC se hipoxemia.",
                  "4. Induzir: aplicar analgesia e sedativo conforme plano.",
                  "5. Relaxar: bloqueador neuromuscular na dose de ISR.",
                  "6. Aguardar tempo de paralisia (succinilcolina mais rápido que rocurônio).",
                  "7. Laringoscopia: visualização otimizada; passar TOT ou usar bougie.",
                  "8. Confirmar: capnografia com traçado aléolar (não confiar só em ausculta).",
                  "9. Fixar tubo, medir distância gengival, auscultar, RX torácico quando indicado.",
                  "10. Iniciar sedoanalgesia de manutenção e modo ventilatório adequado.",
                ]}
              />
            </Card>
            <Card title="Tempos orientativos">
              <Text style={styles.p}>
                Latência depende da droga e do perfil do paciente. Em hipoxemia, cada minuto conta: priorize
                técnica, equipamento e equipe experientes em vez de repetir doses desnecessárias.
              </Text>
            </Card>
          </>
        );
      case "seguranca":
        return (
          <>
            <Card title="Falha de intubação — lembretes">
              <BulletList
                items={[
                  "Limite de tentativas traqueais: muitos protocolos limitam a 2–3 tentativas experientes; ventilar entre tentativas se seguro.",
                  "Se não intuba: supraglótico + ventilar; considerar segunda tentativa com vídeo/bougie.",
                  "Se não ventila nem oxigena: algoritmo de via aérea difícil (cricotireoidostomia de emergência conforme habilidade local).",
                  "Registrar horários, tentativas, SpO₂ e decisões.",
                ]}
              />
            </Card>
            <Card title="Complicações imediatas">
              <BulletList
                items={[
                  "Esôfago: retirar e ventilar com máscara; repetir com técnica assistida.",
                  "Hipotensão pós-indução: fluidos, vasopressor, buscar causa (hipovolemia, anafilaxia, tamponamento).",
                  "Broncoespasmo: salbutamol inalado, adrenalina IV se grave; avaliar aspiração.",
                ]}
              />
            </Card>
            <Card title="Documentação">
              <Text style={styles.p}>
                Registrar drogas (nome, dose, hora), número de tentativas, método de confirmação da IOT,
                parâmetros ventilatórios iniciais e resposta clínica.
              </Text>
            </Card>
          </>
        );
      default:
        return null;
    }
  }, [tab, weightKg]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          🫁 ISR — Via aérea
        </Text>
        <Text
          style={[
            styles.versionHint,
            badgeColor === "yellow" && styles.versionWarn,
            badgeColor === "red" && styles.versionAlert,
          ]}
          numberOfLines={1}>
          v{guidelinesStatus.version}
          {badgeColor !== "green" ? " · revisar" : ""}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.sidebar}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sidebarInner}>
            {TABS.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setTab(t.id)}
                style={[styles.sideItem, tab === t.id && styles.sideItemActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: tab === t.id }}>
                <Text style={styles.sideEmoji}>{t.emoji}</Text>
                <Text
                  style={[styles.sideName, tab === t.id && styles.sideNameActive]}
                  numberOfLines={3}
                  adjustsFontSizeToFit
                  minimumFontScale={0.65}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainContent}
          showsVerticalScrollIndicator={false}>
          {body}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTxt}>
              Conteúdo educativo para apoio à decisão. Não substitui protocolo institucional, treinamento em
              via aérea nem julgamento clínico. Diretrizes de via aérea difícil (ex.: sociedades anestesiológicas)
              devem orientar cenários complexos.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: AppDesign.canvas.tealBackdrop },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: AppDesign.canvas.tealBackdrop,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: { flex: 1, color: "#f8fafc", fontSize: 17, fontWeight: "800" },
  versionHint: { fontSize: 11, fontWeight: "600", color: "rgba(248,250,252,0.55)", maxWidth: "42%" },
  versionWarn: { color: "rgba(254,243,199,0.95)" },
  versionAlert: { color: "rgba(254,202,202,0.95)" },
  body: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 104,
    backgroundColor: "#115e59",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.12)",
  },
  sidebarInner: { paddingVertical: 8, gap: 2, paddingBottom: 16 },
  sideItem: {
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  sideItemActive: { backgroundColor: "rgba(255,255,255,0.12)" },
  sideEmoji: { fontSize: 20 },
  sideName: {
    fontSize: 9,
    fontWeight: "700",
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 12,
  },
  sideNameActive: { color: AppDesign.accent.lime },
  mainScroll: { flex: 1, backgroundColor: AppDesign.surface.shellMint },
  mainContent: { padding: 16, paddingBottom: 32, gap: 14 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
    ...AppDesign.shadow.card,
  },
  cardTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a" },
  p: { fontSize: 14, lineHeight: 22, color: "#334155" },
  pMuted: { fontSize: 13, lineHeight: 20, color: "#64748b", fontStyle: "italic" },
  bullets: { gap: 8 },
  bulletLine: { fontSize: 14, lineHeight: 22, color: "#334155" },
  disclaimer: {
    marginTop: 8,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  disclaimerTxt: { fontSize: 12, lineHeight: 18, color: "#64748b" },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightLabel: { fontSize: 13, fontWeight: "600", color: "#475569", flex: 1 },
  weightInput: {
    flex: 1.2,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  weightOk: { fontSize: 13, lineHeight: 20, color: "#166534", fontWeight: "600" },
  doseTableHint: { fontSize: 12, lineHeight: 18, color: "#64748b", marginBottom: 10 },
  doseTable: { gap: 0, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0" },
  doseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    backgroundColor: "#fafafa",
  },
  doseRowLast: { borderBottomWidth: 0 },
  doseDrug: { fontSize: 13, fontWeight: "600", color: "#334155", flex: 1 },
  doseVal: { fontSize: 13, fontWeight: "800", color: "#1e40af", textAlign: "right", maxWidth: "52%" },
});
