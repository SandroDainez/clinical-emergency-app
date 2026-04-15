/**
 * Módulo ISR — Intubação em sequência rápida.
 * Fluxo operacional em cards com foco em decisão rápida e organização visual.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";

import { AppDesign } from "../../constants/app-design";
import { setAirwayReturnHandoff } from "../../lib/module-return-handoff";

type TabId =
  | "visao"
  | "indicacoes"
  | "equipamento"
  | "farmacos"
  | "sequencia"
  | "seguranca";

type ReferralData = {
  fromModule: string;
  caseLabel: string;
  reason: string;
  age: string;
  sex: string;
  weightKg: string;
  heightCm: string;
  spo2: string;
  gcs: string;
  pas: string;
  pad: string;
  fc: string;
  symptoms: string;
  oxygen: string;
};

type Tone = "neutral" | "warning" | "danger" | "success";

const RSI_DOSE_RANGES: {
  key: string;
  label: string;
  unit: "mg" | "mcg";
  perKgLow: number;
  perKgHigh: number;
  group: "inducao" | "bnm";
  note: string;
}[] = [
  { key: "fentanil", label: "Fentanila", unit: "mcg", perKgLow: 1, perKgHigh: 3, group: "inducao", note: "Atenuar resposta pressórica; reduzir se hipotenso." },
  { key: "cetamina", label: "Cetamina", unit: "mg", perKgLow: 1, perKgHigh: 2, group: "inducao", note: "Útil em instabilidade hemodinâmica." },
  { key: "etomidato", label: "Etomidato", unit: "mg", perKgLow: 0.2, perKgHigh: 0.3, group: "inducao", note: "Perfil hemodinâmico estável." },
  { key: "propofol", label: "Propofol", unit: "mg", perKgLow: 1, perKgHigh: 2.5, group: "inducao", note: "Hipotensão é limitação frequente." },
  { key: "midazolam", label: "Midazolam", unit: "mg", perKgLow: 0.1, perKgHigh: 0.3, group: "inducao", note: "Adjuvante ou alternativa institucional." },
  { key: "rocuronio", label: "Rocurônio", unit: "mg", perKgLow: 1, perKgHigh: 1.2, group: "bnm", note: "ISR padrão; duração mais longa." },
  { key: "succinilcolina", label: "Succinilcolina", unit: "mg", perKgLow: 1, perKgHigh: 1.5, group: "bnm", note: "Início rápido; checar contraindicações." },
  { key: "vecuronio", label: "Vecurônio", unit: "mg", perKgLow: 0.15, perKgHigh: 0.25, group: "bnm", note: "Se protocolo local usar alta dose." },
];

const TABS: { id: TabId; label: string; short: string; accent: string }[] = [
  { id: "visao", label: "Briefing", short: "Briefing", accent: "#0f766e" },
  { id: "indicacoes", label: "Indicação", short: "Indicação", accent: "#0369a1" },
  { id: "equipamento", label: "Preparação", short: "Preparação", accent: "#7c3aed" },
  { id: "farmacos", label: "Doses", short: "Doses", accent: "#b45309" },
  { id: "sequencia", label: "Fluxo", short: "Fluxo", accent: "#be123c" },
  { id: "seguranca", label: "Resgate", short: "Resgate", accent: "#b91c1c" },
];

function readParam(value?: string | string[]) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

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

function formatMapFromStrings(pas: string, pad: string): string | null {
  const sbp = parsePt(pas);
  const dbp = parsePt(pad);
  if (sbp == null || dbp == null) return null;
  return String(Math.round((sbp + 2 * dbp) / 3));
}

function buildReferralPriority(referral: ReferralData): { title: string; body: string; tone: Tone }[] {
  const items: { title: string; body: string; tone: Tone }[] = [];
  const spo2 = parsePt(referral.spo2);
  const gcs = parsePt(referral.gcs);
  const pas = parsePt(referral.pas);
  const pad = parsePt(referral.pad);
  const map = pas != null && pad != null ? (pas + 2 * pad) / 3 : null;
  const symptoms = referral.symptoms.toLowerCase();

  if (symptoms.includes("estridor") || symptoms.includes("glote") || symptoms.includes("obstrução")) {
    items.push({
      title: "Via aérea ameaçada",
      body: "Edema ou obstrução alta: chamar operador experiente cedo e entrar com plano A/B/C/D verbalizado.",
      tone: "danger",
    });
  }
  if (spo2 != null && spo2 < 92) {
    items.push({
      title: "Hipoxemia relevante",
      body: "Maximizar pré-oxigenação, manter O2 a 100% e considerar oxigenação apneica durante a laringoscopia.",
      tone: "warning",
    });
  }
  if (gcs != null && gcs <= 8) {
    items.push({
      title: "Proteção de via aérea",
      body: "GCS baixo reforça indicação de via aérea definitiva e necessidade de sedoanalgesia de manutenção logo após a IOT.",
      tone: "warning",
    });
  }
  if ((pas != null && pas < 90) || (map != null && map < 65)) {
    items.push({
      title: "Choque ou instabilidade",
      body: "Corrigir perfusão antes da indução. Cetamina ou etomidato costumam ser melhores escolhas que propofol.",
      tone: "danger",
    });
  }

  if (!items.length) {
    items.push({
      title: "Prioridade operacional",
      body: referral.reason
        ? `${referral.reason}. Entrar em ISR com checklist, confirmação de drogas e plano de falha.`
        : "Confirmar indicação, otimizar oxigenação e hemodinâmica antes da indução.",
      tone: "neutral",
    });
  }

  return items;
}

function getToneStyle(tone: Tone) {
  switch (tone) {
    case "danger":
      return {
        bg: "#fff1f2",
        border: "#fecdd3",
        chip: "#be123c",
        text: "#9f1239",
      };
    case "warning":
      return {
        bg: "#fff7ed",
        border: "#fdba74",
        chip: "#c2410c",
        text: "#9a3412",
      };
    case "success":
      return {
        bg: "#ecfdf5",
        border: "#a7f3d0",
        chip: "#047857",
        text: "#065f46",
      };
    default:
      return {
        bg: "#eff6ff",
        border: "#bfdbfe",
        chip: "#1d4ed8",
        text: "#1e3a8a",
      };
  }
}

function Card({
  title,
  subtitle,
  children,
  tone = "neutral",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: Tone;
}) {
  const palette = getToneStyle(tone);
  return (
    <View style={[styles.card, { borderColor: palette.border, backgroundColor: "#fff" }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardChip, { backgroundColor: palette.bg, borderColor: palette.border }]}>
          <Text style={[styles.cardChipText, { color: palette.text }]}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function MetricTile({ label, value, accent = "#0f766e" }: { label: string; value: string; accent?: string }) {
  return (
    <View style={[styles.metricTile, { borderColor: `${accent}22` }]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function StepCard({
  step,
  title,
  body,
  accent,
}: {
  step: string;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <View style={[styles.stepCard, { borderColor: `${accent}30` }]}>
      <View style={[styles.stepBadge, { backgroundColor: accent }]}>
        <Text style={styles.stepBadgeText}>{step}</Text>
      </View>
      <View style={styles.stepBody}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{body}</Text>
      </View>
    </View>
  );
}

function MiniList({ items }: { items: string[] }) {
  return (
    <View style={styles.listWrap}>
      {items.map((line) => (
        <View key={line} style={styles.listRow}>
          <View style={styles.listDot} />
          <Text style={styles.listText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

function DoseCard({
  title,
  note,
  value,
}: {
  title: string;
  note: string;
  value: string;
}) {
  return (
    <View style={styles.doseCard}>
      <Text style={styles.doseCardTitle}>{title}</Text>
      <Text style={styles.doseCardValue}>{value}</Text>
      <Text style={styles.doseCardNote}>{note}</Text>
    </View>
  );
}

export default function RsiProtocolScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{
    from_module?: string;
    case_label?: string;
    reason?: string;
    age?: string;
    sex?: string;
    weight_kg?: string;
    height_cm?: string;
    spo2?: string;
    gcs?: string;
    pas?: string;
    pad?: string;
    fc?: string;
    symptoms?: string;
    oxygen?: string;
  }>();

  const referral = useMemo<ReferralData>(() => ({
    fromModule: readParam(params.from_module),
    caseLabel: readParam(params.case_label),
    reason: readParam(params.reason),
    age: readParam(params.age),
    sex: readParam(params.sex),
    weightKg: readParam(params.weight_kg),
    heightCm: readParam(params.height_cm),
    spo2: readParam(params.spo2),
    gcs: readParam(params.gcs),
    pas: readParam(params.pas),
    pad: readParam(params.pad),
    fc: readParam(params.fc),
    symptoms: readParam(params.symptoms),
    oxygen: readParam(params.oxygen),
  }), [
    params.age,
    params.case_label,
    params.fc,
    params.from_module,
    params.gcs,
    params.height_cm,
    params.oxygen,
    params.pad,
    params.pas,
    params.reason,
    params.sex,
    params.spo2,
    params.symptoms,
    params.weight_kg,
  ]);

  const [tab, setTab] = useState<TabId>("visao");
  const [weightKg, setWeightKg] = useState(referral.weightKg);
  const [heightCm, setHeightCm] = useState(referral.heightCm);
  const [airwayReturnValue, setAirwayReturnValue] = useState("");
  const [oxygenReturnValue, setOxygenReturnValue] = useState("");

  useEffect(() => {
    if (referral.weightKg && !weightKg) {
      setWeightKg(referral.weightKg);
    }
  }, [referral.weightKg, weightKg]);

  useEffect(() => {
    if (referral.heightCm && !heightCm) {
      setHeightCm(referral.heightCm);
    }
  }, [referral.heightCm, heightCm]);

  useEffect(() => {
    if (referral.fromModule === "anafilaxia" && airwayReturnValue) {
      setAirwayReturnHandoff({
        targetProtocolId: "anafilaxia",
        airwayValue: airwayReturnValue,
        oxygenValue: oxygenReturnValue || undefined,
      });
    }
  }, [airwayReturnValue, oxygenReturnValue, referral.fromModule]);

  const weightValue = parsePt(weightKg);
  const heightValue = parsePt(heightCm);
  const mapValue = formatMapFromStrings(referral.pas, referral.pad);
  const priorityCards = useMemo(() => buildReferralPriority(referral), [referral]);
  const activeTabMeta = TABS.find((item) => item.id === tab) ?? TABS[0];
  const activeTabIndex = TABS.findIndex((item) => item.id === tab);
  const useSidebar = width >= 920;

  const content = useMemo(() => {
    switch (tab) {
      case "visao":
        return (
          <>
            <Card
              title="Dados iniciais do paciente"
              subtitle="Peso e altura devem entrar logo no início do módulo"
              tone={weightValue == null || heightValue == null ? "warning" : "success"}>
              <View style={styles.calcShell}>
                <View style={styles.calcDualGrid}>
                  <View style={styles.calcInputWrap}>
                    <Text style={styles.calcLabel}>Peso</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={weightKg}
                      onChangeText={setWeightKg}
                      keyboardType="decimal-pad"
                      placeholder="70"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.calcSuffix}>kg</Text>
                  </View>
                  <View style={styles.calcInputWrap}>
                    <Text style={styles.calcLabel}>Altura</Text>
                    <TextInput
                      style={styles.weightInput}
                      value={heightCm}
                      onChangeText={setHeightCm}
                      keyboardType="decimal-pad"
                      placeholder="170"
                      placeholderTextColor="#94a3b8"
                    />
                    <Text style={styles.calcSuffix}>cm</Text>
                  </View>
                </View>
                <View style={styles.calcSummary}>
                  <Text style={styles.calcSummaryTitle}>
                    {weightValue == null && heightValue == null
                      ? "Sem peso e altura definidos"
                      : `Peso ${weightValue == null ? "—" : `${fmtKg(weightValue)} kg`} · Altura ${heightValue == null ? "—" : `${fmtKg(heightValue)} cm`}`}
                  </Text>
                  <Text style={styles.calcSummaryText}>
                    Esse passa a ser o padrão do módulo: peso para doses e altura já visíveis no briefing inicial.
                  </Text>
                </View>
              </View>
            </Card>

            <Card
              title="Resumo do caso"
              subtitle="Dados puxados automaticamente do módulo de origem"
              tone={referral.fromModule ? "success" : "neutral"}>
              <View style={styles.metricGrid}>
                <MetricTile label="Origem" value={referral.fromModule || "Acesso direto"} />
                <MetricTile label="Caso" value={referral.caseLabel || "ISR avulsa"} />
                <MetricTile label="Motivo" value={referral.reason || "Sem motivo transferido"} />
                <MetricTile label="SpO2" value={referral.spo2 ? `${referral.spo2}%` : "—"} />
                <MetricTile label="GCS" value={referral.gcs || "—"} />
                <MetricTile
                  label="PAM estimada"
                  value={mapValue ? `${mapValue} mmHg` : "—"}
                  accent={mapValue && Number(mapValue) < 65 ? "#b91c1c" : "#0f766e"}
                />
                <MetricTile label="Peso" value={referral.weightKg ? `${referral.weightKg} kg` : "—"} />
                <MetricTile label="Altura" value={referral.heightCm ? `${referral.heightCm} cm` : "—"} />
              </View>
            </Card>

            <Card title="Prioridades deste doente" subtitle="O que muda a tua ISR agora" tone="warning">
              <View style={styles.priorityStack}>
                {priorityCards.map((item) => {
                  const palette = getToneStyle(item.tone);
                  return (
                    <View
                      key={`${item.title}-${item.body}`}
                      style={[styles.priorityCard, { backgroundColor: palette.bg, borderColor: palette.border }]}>
                      <Text style={[styles.priorityTitle, { color: palette.text }]}>{item.title}</Text>
                      <Text style={styles.priorityBody}>{item.body}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>

            <Card title="Fluxo mental da ISR" subtitle="4 marcos para não se perder no processo">
              <View style={styles.stepStack}>
                <StepCard step="1" title="Preparar" body="Equipe, drogas em mL, material de resgate e estratégia verbalizados antes de tocar no paciente." accent="#0f766e" />
                <StepCard step="2" title="Pré-oxigenar" body="O2 a 100%, posicionamento em rampa quando preciso e correção hemodinâmica antes da apneia." accent="#0369a1" />
                <StepCard step="3" title="Paralisar" body="Indução mais bloqueador com escolha coerente com choque, broncoespasmo e risco de aspiração." accent="#b45309" />
                <StepCard step="4" title="Provar e manter" body="Capnografia, fixação do tubo, sedoanalgesia contínua e ventilação segura imediatamente após a IOT." accent="#be123c" />
              </View>
            </Card>
          </>
        );

      case "indicacoes":
        return (
          <>
            <Card title="Quando ISR faz sentido" subtitle="Gatilhos mais comuns na emergência">
              <View style={styles.twoColGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Respiração</Text>
                  <MiniList
                    items={[
                      "Falha de O2/NIV ou exaustão ventilatória.",
                      "Hipoxemia progressiva com trabalho respiratório alto.",
                      "Broncoespasmo grave ou edema de via aérea.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Proteção</Text>
                  <MiniList
                    items={[
                      "GCS baixo e perda de reflexos protetores.",
                      "Risco de aspiração em doente crítico.",
                      "Rebaixamento com ventilação já ameaçada.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Perfusão</Text>
                  <MiniList
                    items={[
                      "Choque com previsão de VM invasiva imediata.",
                      "Pós-PCR, anafilaxia grave ou sepse com piora respiratória.",
                      "Procedimento urgente em doente instável.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Red flags</Text>
                  <MiniList
                    items={[
                      "Estridor, edema de glote ou obstrução alta.",
                      "Obesidade importante e dessaturação rápida.",
                      "Via aérea difícil prevista ou CICO possível.",
                    ]}
                  />
                </View>
              </View>
            </Card>

            <Card title="Quando revisar a estratégia" subtitle="Nem toda via aérea crítica é uma ISR clássica" tone="warning">
              <MiniList
                items={[
                  "Hipoxemia extrema: talvez seja melhor ventilar gentilmente do que manter apneia rígida.",
                  "Via aérea difícil prevista: vídeo, bougie, segundo operador e plano cirúrgico devem estar prontos.",
                  "Choque profundo: corrigir perfusão primeiro e evitar hipnóticos que derrubem a pressão.",
                  "Edema progressivo por anafilaxia: limitar tentativas e encurtar o tempo até a via aérea cirúrgica.",
                ]}
              />
            </Card>
          </>
        );

      case "equipamento":
        return (
          <>
            <Card title="Mesa pronta" subtitle="Organiza por blocos, não por lista única">
              <View style={styles.twoColGrid}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Monitorização</Text>
                  <MiniList
                    items={[
                      "ECG, SpO2, PA e acesso funcionando.",
                      "Capnografia pronta antes da laringoscopia.",
                      "Vasopressor e seringas identificadas se choque.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Oxigenação</Text>
                  <MiniList
                    items={[
                      "Reservatório com O2 alto fluxo.",
                      "Canula nasal para oxigenação apneica se possível.",
                      "BVM com vedação a 2 mãos e PEEP se indicado.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Passagem do tubo</Text>
                  <MiniList
                    items={[
                      "Laringoscópio preferencialmente vídeo.",
                      "TOT em dois tamanhos, estilete e bougie.",
                      "Aspiração rígida funcionando ao lado.",
                    ]}
                  />
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoBoxTitle}>Resgate</Text>
                  <MiniList
                    items={[
                      "Dispositivo supraglótico já separado.",
                      "Kit de cricotireoidostomia disponível.",
                      "Equipe sabe quem executa o plano C/D.",
                    ]}
                  />
                </View>
              </View>
            </Card>

            <Card title="Referências rápidas" subtitle="Atalhos úteis no pré-briefing">
              <View style={styles.metricGrid}>
                <MetricTile label="TOT mulher" value="7,0–7,5" accent="#7c3aed" />
                <MetricTile label="TOT homem" value="7,5–8,5" accent="#7c3aed" />
                <MetricTile label="Pré-O2" value="3–5 min se tolerado" accent="#0369a1" />
                <MetricTile label="Confirmação" value="Capnografia sempre" accent="#be123c" />
              </View>
            </Card>
          </>
        );

      case "farmacos": {
        const inductionDrugs = RSI_DOSE_RANGES.filter((item) => item.group === "inducao");
        const paralytics = RSI_DOSE_RANGES.filter((item) => item.group === "bnm");

        return (
          <>
            <Card title="Calculadora rápida" subtitle="Peso total para converter dose/kg em dose real" tone={weightValue == null ? "warning" : "success"}>
              <View style={styles.calcShell}>
                <View style={styles.calcInputWrap}>
                  <Text style={styles.calcLabel}>Peso atual</Text>
                  <TextInput
                    style={styles.weightInput}
                    value={weightKg}
                    onChangeText={setWeightKg}
                    keyboardType="decimal-pad"
                    placeholder="70"
                    placeholderTextColor="#94a3b8"
                  />
                  <Text style={styles.calcSuffix}>kg</Text>
                </View>
                <View style={styles.calcSummary}>
                  <Text style={styles.calcSummaryTitle}>
                    {weightValue == null ? "Sem peso calculado" : `Dose pronta para ${fmtKg(weightValue)} kg`}
                  </Text>
                  <Text style={styles.calcSummaryText}>
                    {weightValue == null
                      ? "Sem peso, o módulo mantém apenas as faixas por kg."
                      : "Use como referência rápida e confira apresentação da ampola antes da administração."}
                  </Text>
                </View>
              </View>
            </Card>

            <Card title="Indução" subtitle="Opioide e hipnótico conforme hemodinâmica">
              <View style={styles.doseGrid}>
                {inductionDrugs.map((row) => (
                  <DoseCard
                    key={row.key}
                    title={row.label}
                    note={row.note}
                    value={
                      weightValue == null
                        ? `${row.perKgLow}–${row.perKgHigh} ${row.unit}/kg`
                        : formatDoseRange(weightValue, row.perKgLow, row.perKgHigh, row.unit)
                    }
                  />
                ))}
              </View>
            </Card>

            <Card title="Bloqueio neuromuscular" subtitle="Escolha baseada em contraindicações e plano pós-tubo">
              <View style={styles.doseGrid}>
                {paralytics.map((row) => (
                  <DoseCard
                    key={row.key}
                    title={row.label}
                    note={row.note}
                    value={
                      weightValue == null
                        ? `${row.perKgLow}–${row.perKgHigh} ${row.unit}/kg`
                        : formatDoseRange(weightValue, row.perKgLow, row.perKgHigh, row.unit)
                    }
                  />
                ))}
              </View>
            </Card>

            <Card title="Lógica farmacológica" subtitle="O que lembrar antes de empurrar as drogas">
              <MiniList
                items={[
                  "Hipotensão ou choque: cetamina ou etomidato costumam ser melhores escolhas iniciais.",
                  "Propofol é rápido, mas derruba pressão com facilidade.",
                  "Succinilcolina exige revisão de contraindicações; rocurônio exige plano de sedação de manutenção.",
                  "Em broncoespasmo ou anafilaxia, tenha catecolamina pronta antes da indução.",
                ]}
              />
            </Card>
          </>
        );
      }

      case "sequencia":
        return (
          <>
            <Card title="Linha do tempo operacional" subtitle="Executa em sequência, sem se perder em texto">
              <View style={styles.stepStack}>
                <StepCard step="01" title="Briefing" body="Definir papéis, revisar drogas em mL, alergias, hemodinâmica e limite de tentativas." accent="#0f766e" />
                <StepCard step="02" title="Pré-oxigenação" body="Rampa quando preciso, O2 a 100%, aspiração pronta e perfusão corrigida antes da apneia." accent="#0369a1" />
                <StepCard step="03" title="Indução" body="Aplicar analgesia e hipnótico conforme o perfil do doente, evitando colapso peri-intubação." accent="#b45309" />
                <StepCard step="04" title="Paralisia" body="Administrar BNM na dose de ISR e aguardar tempo útil antes da laringoscopia." accent="#be123c" />
                <StepCard step="05" title="Passagem do tubo" body="Primeira tentativa deve ser a melhor tentativa: vídeo, bougie e sucção se necessário." accent="#7c3aed" />
                <StepCard step="06" title="Provar e manter" body="Capnografia alveolar, fixação, sedação contínua e estratégia ventilatória segura logo em seguida." accent="#0f766e" />
              </View>
            </Card>

            <Card title="Depois do tubo" subtitle="Erros aqui fazem a ISR parecer bem-sucedida quando não foi">
              <MiniList
                items={[
                  "Não confiar apenas em ausculta: usar capnografia com traçado.",
                  "Registrar distância do tubo e resposta clínica imediata.",
                  "Entrar com sedoanalgesia contínua antes de o bloqueio acabar.",
                  "Configurar VM inicial sem atrasar pela passagem aparentemente fácil.",
                ]}
              />
            </Card>
          </>
        );

      case "seguranca":
        return (
          <>
            {referral.fromModule === "anafilaxia" ? (
              <Card title="Retorno para o caso" subtitle="Escolhe a solução final para mandar de volta ao módulo de origem" tone="success">
                <View style={styles.choiceGrid}>
                  {[
                    {
                      label: "IOT realizada",
                      airway: "Intubação orotraqueal realizada",
                      oxygen: "Ventilação mecânica invasiva após IOT",
                    },
                    {
                      label: "Cricotireoidostomia",
                      airway: "Cricotireoidostomia realizada",
                      oxygen: "Ventilação por via aérea cirúrgica",
                    },
                    {
                      label: "Máscara laríngea",
                      airway: "Máscara laríngea posicionada com ventilação efetiva",
                      oxygen: "Ventilação com dispositivo supraglótico + O2 suplementar",
                    },
                    {
                      label: "BVM mantida",
                      airway: "Ventilação com bolsa-válvula-máscara mantida",
                      oxygen: "Bolsa-válvula-máscara + O2 a 15 L/min",
                    },
                  ].map((option) => {
                    const active = airwayReturnValue === option.airway;
                    return (
                      <Pressable
                        key={option.label}
                        style={[styles.choiceChip, active && styles.choiceChipActive]}
                        onPress={() => {
                          if (active) {
                            setAirwayReturnValue("");
                            setOxygenReturnValue("");
                            return;
                          }
                          setAirwayReturnValue(option.airway);
                          setOxygenReturnValue(option.oxygen);
                        }}>
                        <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.helperText}>
                  {airwayReturnValue
                    ? `Selecionado: ${airwayReturnValue}${oxygenReturnValue ? ` · ${oxygenReturnValue}` : ""}`
                    : "Escolha a conduta final de via aérea antes de voltar."}
                </Text>
              </Card>
            ) : null}

            <Card title="Falha de IOT" subtitle="Resgate prático, sem rodeio" tone="danger">
              <View style={styles.stepStack}>
                <StepCard step="A" title="Falhou, ventila" body="Reoxigenar entre tentativas se isso for seguro. Não insistir em laringoscopias iguais." accent="#b91c1c" />
                <StepCard step="B" title="Muda a técnica" body="Vídeo, bougie, reposicionamento, novo operador ou dispositivo supraglótico." accent="#c2410c" />
                <StepCard step="C" title="CICO" body="Se não intuba e não oxigena, seguir rapidamente para via aérea cirúrgica." accent="#7f1d1d" />
              </View>
            </Card>

            <Card title="Complicações imediatas" subtitle="O que precisa ser reconhecido na hora">
              <MiniList
                items={[
                  "Esôfago: retirar, ventilar e repetir com mudança real de estratégia.",
                  "Hipotensão pós-indução: fluidos, vasopressor e revisão da causa.",
                  "Broncoespasmo: broncodilatador, adrenalina se grave e revisão de anafilaxia/aspiração.",
                  "Edema de via aérea: reduzir tentativas cegas e antecipar CICO.",
                ]}
              />
            </Card>
          </>
        );

      default:
        return null;
    }
  }, [airwayReturnValue, heightCm, heightValue, mapValue, oxygenReturnValue, priorityCards, referral, tab, weightKg, weightValue]);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroEyebrow}>Via Aerea Avancada</Text>
              <Text style={styles.heroTitle}>ISR organizada por fluxo clinico</Text>
              <Text style={styles.heroSubtitle}>
                Briefing, preparação, doses, passagem do tubo e resgate em uma sequencia mais limpa.
              </Text>
            </View>
            <View style={styles.heroBadges}>
              <View style={styles.modulePill}>
                <Text style={styles.modulePillText}>{activeTabMeta.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroMetrics}>
            <MetricTile label="Modulo de origem" value={referral.fromModule || "ISR direta"} accent="#0f766e" />
            <MetricTile label="O2 atual" value={referral.oxygen || "Nao informado"} accent="#0369a1" />
            <MetricTile
              label="Peso"
              value={weightValue == null ? "Inserir no briefing" : `${fmtKg(weightValue)} kg`}
              accent={weightValue == null ? "#b45309" : "#047857"}
            />
            <MetricTile
              label="Altura"
              value={heightValue == null ? "Inserir no briefing" : `${fmtKg(heightValue)} cm`}
              accent={heightValue == null ? "#b45309" : "#7c3aed"}
            />
          </View>
        </View>

        <View style={[styles.layoutShell, useSidebar ? styles.layoutShellWide : styles.layoutShellStacked]}>
          {useSidebar ? (
            <View style={[styles.sidebarCard, styles.sidebarWide]}>
              <Text style={styles.sidebarEyebrow}>Navegação da ISR</Text>
              <Text style={styles.sidebarTitle}>Páginas do módulo</Text>
              <View style={styles.sidebarList}>
                {TABS.map((item, index) => {
                  const active = item.id === tab;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setTab(item.id)}
                      style={[
                        styles.sideNavItem,
                        active && { borderColor: item.accent, backgroundColor: `${item.accent}14` },
                      ]}>
                      <View style={[styles.sideNavStep, { backgroundColor: active ? item.accent : "#e2e8f0" }]}>
                        <Text style={[styles.sideNavStepText, active && styles.sideNavStepTextActive]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.sideNavBody}>
                        <Text style={[styles.sideNavLabel, active && { color: item.accent }]}>{item.label}</Text>
                        <Text style={styles.sideNavHint}>
                          {item.id === "visao"
                            ? "Resumo clínico e prioridades"
                            : item.id === "indicacoes"
                              ? "Quando indicar ou rever a estratégia"
                              : item.id === "equipamento"
                                ? "Material, monitorização e preparação"
                                : item.id === "farmacos"
                                  ? "Doses por peso e lógica farmacológica"
                                  : item.id === "sequencia"
                                    ? "Passo a passo da intubação"
                                    : "Falha de IOT, retorno e complicações"}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.mobileNavCard}>
              <Text style={styles.sidebarEyebrow}>Navegação da ISR</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mobileNavList}>
                {TABS.map((item, index) => {
                  const active = item.id === tab;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setTab(item.id)}
                      style={[
                        styles.mobileNavItem,
                        active && { borderColor: item.accent, backgroundColor: `${item.accent}14` },
                      ]}>
                      <View style={[styles.mobileNavStep, { backgroundColor: active ? item.accent : "#e2e8f0" }]}>
                        <Text style={[styles.sideNavStepText, active && styles.sideNavStepTextActive]}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={[styles.mobileNavLabel, active && { color: item.accent }]}>{item.short}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <View style={styles.contentPanel}>
            <View style={styles.contentHeader}>
              <View style={styles.contentHeaderText}>
                <Text style={styles.contentEyebrow}>Etapa {activeTabIndex + 1} de {TABS.length}</Text>
                <Text style={styles.contentTitle}>{activeTabMeta.label}</Text>
              </View>
              <View style={styles.contentHeaderPill}>
                <Text style={styles.contentHeaderPillText}>Fluxo clínico</Text>
              </View>
            </View>

            <View style={styles.content}>{content}</View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Conteudo educativo para apoio a decisao. Nao substitui protocolo institucional, treinamento formal em via aerea ou julgamento clinico.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#dff7f3",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 28,
    gap: 14,
    width: "100%",
    maxWidth: 1120,
    alignSelf: "center",
  },
  hero: {
    borderRadius: 32,
    padding: 22,
    gap: 16,
    backgroundColor: AppDesign.accent.lime,
    borderWidth: 1,
    borderColor: "rgba(15, 118, 110, 0.2)",
    ...AppDesign.shadow.hero,
  },
  heroHeader: {
    gap: 12,
  },
  heroTitleWrap: {
    gap: 6,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: AppDesign.accent.limeDark,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "900",
    color: AppDesign.text.primary,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#1e293b",
    maxWidth: 640,
  },
  heroBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modulePill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: AppDesign.accent.primaryMuted,
    borderWidth: 1,
    borderColor: "#a5f3fc",
  },
  modulePillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#155e75",
  },
  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  layoutShell: {
    gap: 14,
  },
  layoutShellWide: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  layoutShellStacked: {
    flexDirection: "column",
  },
  sidebarCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    backgroundColor: "#ffffff",
    gap: 14,
    ...AppDesign.shadow.card,
  },
  sidebarWide: {
    width: 280,
  },
  sidebarStacked: {
    width: "100%",
  },
  sidebarEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: "#64748b",
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  sidebarList: {
    gap: 10,
  },
  sideNavItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    backgroundColor: AppDesign.surface.shellMint,
  },
  sideNavStep: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  sideNavStepText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
  },
  sideNavStepTextActive: {
    color: "#ffffff",
  },
  sideNavBody: {
    flex: 1,
    gap: 3,
  },
  sideNavLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  sideNavHint: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
  contentPanel: {
    flex: 1,
    gap: 14,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    backgroundColor: "#ffffff",
    ...AppDesign.shadow.card,
  },
  contentHeaderText: {
    flex: 1,
    gap: 4,
  },
  contentEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: AppDesign.accent.teal,
  },
  contentTitle: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "900",
    color: "#0f172a",
  },
  contentHeaderPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: AppDesign.accent.limeSoft,
    borderWidth: 1,
    borderColor: "#bef264",
  },
  contentHeaderPillText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#3f6212",
  },
  content: {
    gap: 14,
  },
  card: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    backgroundColor: "#ffffff",
    borderColor: AppDesign.border.subtle,
    ...AppDesign.shadow.card,
  },
  cardHeader: {
    gap: 8,
  },
  cardChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  cardChipText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#64748b",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricTile: {
    minWidth: 120,
    flexGrow: 1,
    flexBasis: 140,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: AppDesign.surface.shellMint,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
  priorityStack: {
    gap: 10,
  },
  priorityCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    gap: 6,
  },
  priorityTitle: {
    fontSize: 14,
    fontWeight: "800",
  },
  priorityBody: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  stepStack: {
    gap: 10,
  },
  stepCard: {
    flexDirection: "row",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: AppDesign.surface.shellMint,
  },
  stepBadge: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#ffffff",
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  listWrap: {
    gap: 10,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#14b8a6",
    marginTop: 7,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  twoColGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  infoBox: {
    flexGrow: 1,
    flexBasis: 220,
    borderRadius: 18,
    padding: 14,
    backgroundColor: AppDesign.surface.shellMint,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 10,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  calcShell: {
    gap: 14,
  },
  calcDualGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  calcInputWrap: {
    flexDirection: "row",
    alignItems: "center",
    flexGrow: 1,
    flexBasis: 220,
    gap: 10,
    borderRadius: 18,
    backgroundColor: AppDesign.surface.shellMint,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    padding: 10,
  },
  calcLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    minWidth: 84,
  },
  weightInput: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: "900",
    color: "#0f172a",
  },
  calcSuffix: {
    fontSize: 14,
    fontWeight: "800",
    color: "#64748b",
  },
  calcSummary: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: AppDesign.accent.primaryMuted,
    borderWidth: 1,
    borderColor: "#a5f3fc",
    gap: 6,
  },
  calcSummaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#155e75",
  },
  calcSummaryText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#0f766e",
  },
  doseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  doseCard: {
    flexGrow: 1,
    flexBasis: 200,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    gap: 6,
  },
  doseCardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  doseCardValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#155e75",
  },
  doseCardNote: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748b",
  },
  choiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choiceChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    backgroundColor: AppDesign.surface.shellMint,
  },
  choiceChipActive: {
    borderColor: "#0f766e",
    backgroundColor: "#ccfbf1",
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#334155",
  },
  choiceChipTextActive: {
    color: "#115e59",
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#475569",
  },
  footerNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  footerNavSpacer: {
    flex: 1,
  },
  footerNavSecondary: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  footerNavSecondaryText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#334155",
  },
  footerNavPrimary: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: AppDesign.accent.teal,
    alignItems: "center",
    justifyContent: "center",
    ...AppDesign.shadow.card,
  },
  footerNavPrimaryText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#f0fdfa",
  },
  footerNavDone: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#bef264",
    backgroundColor: AppDesign.accent.limeSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  footerNavDoneText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#3f6212",
  },
  disclaimer: {
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: AppDesign.border.subtle,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#64748b",
  },
});
