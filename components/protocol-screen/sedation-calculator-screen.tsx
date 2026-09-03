/**
 * sedation-calculator-screen.tsx
 *
 * Calculadora de Sedoanalgesia, Analgesia e Bloqueadores Neuromusculares.
 * Espelha o padrão do módulo de Drogas Vasoativas (sidebar, diluição, cálculo
 * em tempo real, diluições salvas), adaptado para modos bolus/infusão, régua
 * de faixas de dose e atalhos clínicos (ACURASYS, MgSO₄ × rocurônio).
 */

import { useState, useCallback, useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import {
  SED_DRUGS,
  SED_GROUP_LABELS,
  sedConcentrationMcgPerMl,
  sedRateFromDose,
  sedBolus,
  type SedDrug,
  type SedMode,
  type SedGroup,
  type Diluent,
  type DoseRange,
  type InfusionUnit,
  type BolusUnit,
} from "../../sedation-engine";
import {
  getSavedDilutions,
  saveDilution,
  deleteSavedDilution,
  type SavedDilution,
} from "../../lib/vasoactive-storage";
import { useTr } from "../../lib/use-tr";
import { Header } from "../ui-v2/header";
import { CALCULATOR_VISUAL as CV } from "../ui-v2/calculator-visual-tokens";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";
import { RailDeModulo } from "./module-flow-shell";
import { TEMAS } from "../../design-system/tokens";
import { FAIXA_DE_ENTRADA } from "../../lib/faixas-de-entrada";
import { faixaDaBarra } from "../../sedation-engine";

/**
 * Princípios da analgo-sedação — precedem qualquer dose.
 *
 * Fontes: Devlin JW et al., PADIS guidelines, Crit Care Med 2018;46:e825;
 * Pun BT et al., ICU Liberation / bundle ABCDEF, Crit Care Med 2019;47:3;
 * pathway Einstein/SBIBAE de analgesia, sedação e delirium sob ventilação
 * mecânica (CPTW264.2) e a Política de Sedação para Médicos Não
 * Anestesiologistas (POL.0360), de onde vêm os níveis de sedação da ASA e a
 * estrutura mínima obrigatória.
 *
 * A calculadora entrega a dose. Estas linhas existem porque a dose certa do
 * fármaco errado, ou no alvo errado, continua sendo erro — e porque a decisão
 * que mais muda desfecho aqui é "tratar a dor primeiro", que nenhuma
 * calculadora sugere sozinha.
 */
export const PRINCIPIOS_ANALGOSEDACAO: string[] = [
  "ANALGESIA PRIMEIRO: a primeira intervenção em sedação é avaliar e tratar a dor. Sedar quem está com dor não resolve a dor e piora o desfecho.",
  "Avaliar os três componentes com escala, sempre: DOR (escala visual analógica se o paciente comunica; BPS se não comunica), SEDAÇÃO/AGITAÇÃO (RASS) e DELIRIUM (CAM-ICU, ao menos uma vez por turno).",
  "SEDAÇÃO LEVE é o padrão. A sedação excessiva aumenta tempo de ventilação, tempo de UTI e piora a cognição a longo prazo — manter o paciente o mais acordado e ativo possível.",
  "Definir a META de sedação (RASS-alvo) ANTES de titular, e reavaliar periodicamente. Protocolo guiado por alvo reduz exposição a sedativo e tempo de VM.",
  "REDUZIR benzodiazepínico: em ventilação mecânica associa-se a mais delirium, mais dias em coma e pior desempenho cognitivo. É fator de risco independente para delirium.",
  "Opioide preferencialmente INTERMITENTE, não em infusão contínua — menor dose diária e menos eventos adversos. Usar analgesia multimodal e adjuvantes não opioides para poupar opioide.",
  "Interrupção diária da sedação reduz tempo de VM e de UTI, sobretudo quando acoplada ao teste de respiração espontânea (bundle ABCDEF). Em quem já está em sedação leve guiada por alvo, o ganho adicional é pequeno.",
  "⚠️ EXCEÇÃO — ESTADO DE MAL EPILÉPTICO: NÃO fazer interrupção diária. O anestésico é desmamado gradualmente após ao menos 24 h de controle; desmame rápido causa crise de rebote.",
  "DELIRIUM: prevenir antes de tratar — mobilização precoce, evitar restrição física, família presente, orientação e estímulo cognitivo, sono, luz natural, óculos e aparelho auditivo, hidratação.",
  "Delirium — evitar os precipitantes: benzodiazepínico, opioide em dose alta, anti-histamínico, di-hidropiridina; e os fármacos dos critérios de Beers (tricíclico, corticoide, anti-H2, hipnótico, clorpromazina, tioridazina).",
  "Antipsicótico no delirium é só para AGITAÇÃO PERIGOSA, com risco de lesão ao paciente ou à equipe — não para tratar o delirium em si. Quetiapina 12,5–25 mg 2×/dia, olanzapina 2,5–5 mg 2×/dia, risperidona 0,5–1 mg 2×/dia ou haloperidol 0,25–0,5 mg.",
  "Emergência com agitação perigosa: haloperidol 2,5–5 mg IV, repetível a cada 20 min, máximo 20 mg em 24 h — em ambiente monitorado, por risco de torsades de pointes.",
  "Níveis de sedação (ASA) — ANSIÓLISE: responde normalmente ao comando verbal, via aérea e ventilação intactas. MODERADA: desperta ao comando verbal ou toque leve, sem necessidade de intervenção na via aérea. PROFUNDA: não desperta com facilidade, responde a estímulo doloroso repetido, pode precisar de suporte de via aérea e ventilação.",
  "⚠️ Reflexo de RETIRADA ao estímulo doloroso NÃO conta como resposta — quem só retira já está mais profundo do que a sedação moderada.",
  "Estrutura obrigatória antes de qualquer sedação moderada ou profunda: bolsa-válvula-máscara, cânula de Guedel e máscara laríngea, laringoscópio, aspirador, fonte de O₂ independente, carro de parada com desfibrilador e os antagonistas (flumazenil e naloxona) na sala.",
  "Monitorização obrigatória: ECG contínuo, oximetria de pulso e pressão não invasiva em intervalos não superiores a 10 minutos; O₂ suplementar para manter SpO₂ acima de 92%.",
  "CFM 2174/2017: em sedação PROFUNDA são necessários dois médicos — um responsável pelo procedimento e outro dedicado exclusivamente à sedação e à monitorização.",
];

/**
 * Regras do bloqueio neuromuscular — indicação, pré-requisitos e reversão.
 * Só aparece quando o fármaco selecionado é um BNM.
 *
 * Fonte: Miller's Anesthesia Review 2025, capítulo de agentes bloqueadores
 * neuromusculares e de reversão (monitorização, neostigmina e sugamadex).
 * As indicações em UTI e a regra de ouro pré-BNM foram conferidas contra
 * ACURASYS e ROSE, que são os ensaios que sustentam o uso em SDRA.
 *
 * Este bloco existe porque a calculadora entregava a dose do bloqueador sem
 * nunca dizer que a sedação profunda é pré-requisito. Paciente paralisado e
 * mal sedado está consciente, com dor, e sem nenhum meio de avisar.
 */
export const REGRAS_BNM: string[] = [
  "⚠️ REGRA DE OURO — antes de qualquer BNM: sedação PROFUNDA confirmada (RASS −5) e analgesia plena, mesmo sem causa aparente de dor. O paciente paralisado e mal sedado está acordado, sentindo, e sem como avisar.",
  "Indicações em UTI, e são poucas: SDRA grave nas primeiras 48 h com PaO₂/FiO₂ abaixo de 150 e assincronia ou drive intenso refratários à sedação; hipertensão intracraniana refratária; estado de mal refratário (só com EEG, porque o BNM mascara a crise); hipertermia maligna e síndrome neuroléptica maligna; e procedimentos específicos, como a intubação.",
  "Fora dessas indicações, BNM não tem papel em sedação de rotina.",
  "Plano de retirada desde o início: reavaliar diariamente. Na SDRA, suspender quando a PaO₂/FiO₂ estiver estável acima de 150.",
  "Cuidados que só existem porque o paciente está paralisado: LUBRIFICAÇÃO OCULAR (ele não fecha os olhos) e tromboprofilaxia, farmacológica e mecânica.",
  "MONITORIZAÇÃO — recuperação adequada é razão TOF ≥ 0,9 medida no ADUTOR DO POLEGAR com estímulo do nervo ulnar. A avaliação clínica (elevar a cabeça, força de preensão, volume corrente) é imprecisa, e a monitorização apenas tátil ou visual tem sensibilidade inadequada.",
  "⚠️ NÃO titular por músculo central (diafragma, orbicular dos olhos): eles são RESISTENTES ao bloqueador adespolarizante, e dosar por eles leva a superdosagem e a mais bloqueio residual depois.",
  "Bloqueio profundo, sem respostas no TOF, é quantificado pela contagem pós-tetânica.",
  "Bloqueio residual não é detalhe: causa obstrução de via aérea, ventilação inadequada, hipóxia, dificuldade de deglutição e diplopia.",
  "REVERSÃO — NEOSTIGMINA 30 mcg/kg, e SÓ quando já houver recuperação espontânea significativa (razão TOF acima de 0,4). Ela NÃO reverte bloqueio profundo, e depois que a acetilcolinesterase está maximamente bloqueada, mais neostigmina não acrescenta nada. Início em 7–11 min; eliminação renal.",
  "Neostigmina — sempre com antimuscarínico (glicopirrolato ou atropina): os efeitos vagais incluem bradicardia, prolongamento do QT e assistolia, além de broncoespasmo, secreções, miose e aumento do tônus intestinal.",
  "REVERSÃO — SUGAMADEX encapsula rocurônio e vecurônio em proporção 1:1, com maior afinidade pelo rocurônio. Reverte QUALQUER profundidade, inclusive logo após a dose de intubação, em 2 a 3 minutos. Dose de 2 a 16 mg/kg, maior quanto mais profundo o bloqueio.",
  "Sugamadex — dose insuficiente causa RECORRÊNCIA do bloqueio. O complexo é eliminado pelos rins. Efeitos: bradicardia (pode ser grave), taquicardia, náusea e vômito, boca seca, tontura, mialgia, cefaleia e anafilaxia (rara); prolonga TTPa e TP de forma transitória e dose-dependente, sem aumentar sangramento.",
  "Sugamadex não reverte cisatracúrio nem atracúrio — nesses, a saída é aguardar a eliminação de Hofmann ou usar anticolinesterásico quando já houver recuperação parcial.",
];

const TONE_COLOR: Record<DoseRange["tone"], string> = {
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  red: "#ef4444",
};

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return "—";
  return n.toFixed(decimals).replace(".", ",");
}

function parsePt(s: string): number | null {
  const v = s.trim().replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function drugByKey(key: string): SedDrug {
  return SED_DRUGS.find((d) => d.key === key)!;
}

function activeRange(ranges: DoseRange[] | undefined, dose: number | null): DoseRange | null {
  if (!ranges || dose == null) return null;
  for (const r of ranges) {
    if (r.upTo == null || dose < r.upTo) return r;
  }
  return ranges[ranges.length - 1] ?? null;
}

type CalcState = {
  drugKey: string;
  modeId: string;
  weightKg: string;
  ampoules: string;
  diluentMl: string;
  diluent: Diluent;
  presentationId: string;
  doseInput: string;
  mgSulfate: boolean;
};

function initialState(drugKey = "propofol"): CalcState {
  const drug = drugByKey(drugKey);
  const sol = drug.standardSolutions[0];
  const mode = drug.modes[0];
  return {
    drugKey,
    modeId: mode.id,
    weightKg: "",
    ampoules: sol.ampoules,
    diluentMl: sol.diluentMl,
    diluent: sol.diluent,
    presentationId: sol.presentationId,
    doseInput: mode.defaultDose,
    mgSulfate: false,
  };
}

export default function SedationCalculatorScreen({ onVoltar }: { onVoltar?: () => void }) {
  const { width: larguraDaTela } = useWindowDimensions();
  const tr = useTr();
  const [calc, setCalc] = useState<CalcState>(() => initialState());
  const [showInfo, setShowInfo] = useState(false);
  const [showRef, setShowRef] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [savedDilutions, setSavedDilutions] = useState<SavedDilution[]>(() => getSavedDilutions("propofol"));

  const drug = useMemo(() => drugByKey(calc.drugKey), [calc.drugKey]);
  const mode: SedMode = useMemo(
    () => drug.modes.find((m) => m.id === calc.modeId) ?? drug.modes[0],
    [drug, calc.modeId]
  );
  const presentation = useMemo(
    () => drug.presentations.find((p) => p.id === calc.presentationId) ?? drug.presentations[0],
    [drug, calc.presentationId]
  );

  const amps = parsePt(calc.ampoules) ?? 0;
  const dilMl = parseFloat((calc.diluentMl || "0").replace(",", ".")) || 0;
  const wt = parsePt(calc.weightKg) ?? 0;
  const dose = parsePt(calc.doseInput);

  const conc = useMemo(
    () => sedConcentrationMcgPerMl(amps, presentation.basePerAmpoule, presentation.ampouleVolumeMl, dilMl),
    [amps, presentation, dilMl]
  );
  const concMcgPerMl = conc?.concMcgPerMl ?? 0;
  const concMgPerMl = concMcgPerMl / 1000;
  const pureConcMcgPerMl = presentation.basePerAmpoule / presentation.ampouleVolumeMl;

  // ── Result ──────────────────────────────────────────────────────────────
  const isInfusion = mode.kind === "infusion";
  const rate = isInfusion && dose != null
    ? sedRateFromDose(mode.unit as InfusionUnit, dose, wt, concMcgPerMl)
    : null;
  const bolus = !isInfusion && dose != null
    ? sedBolus(mode.unit as BolusUnit, dose, wt, pureConcMcgPerMl)
    : null;

  const range = activeRange(mode.ranges, dose);
  const overMax = range?.tone === "red" || (mode.ranges && range && range === mode.ranges[mode.ranges.length - 1] && range.tone === "orange");
  const needsWeight = mode.unit !== "mg/h" && mode.unit !== "mcg/h";
  const weightMissing = needsWeight && wt <= 0;

  // ── Handlers ────────────────────────────────────────────────────────────
  const selectDrug = useCallback((key: string) => {
    setCalc(() => initialState(key));
    setSavedDilutions(getSavedDilutions(key));
    setShowInfo(false);
    setShowRef(false);
  }, []);

  const selectMode = useCallback((m: SedMode) => {
    setCalc((c) => ({ ...c, modeId: m.id, doseInput: m.defaultDose }));
  }, []);

  const applySolution = useCallback((solId: string) => {
    const sol = drug.standardSolutions.find((s) => s.id === solId);
    if (!sol) return;
    setCalc((c) => ({ ...c, ampoules: sol.ampoules, diluentMl: sol.diluentMl, diluent: sol.diluent, presentationId: sol.presentationId }));
  }, [drug]);

  const applyAcurasys = useCallback(() => {
    if (!mode.acurasys) return;
    // garante diluição padrão (0,8 mg/mL) e dose fixa em mg/h → converter para mg/kg/h não é necessário:
    // a infusão ACURASYS é dose fixa; mostramos a taxa direto via mg/h equivalente.
    setCalc((c) => ({ ...c, doseInput: "ACURASYS" }));
  }, [mode]);

  const isActiveSolution = (solId: string) => {
    const sol = drug.standardSolutions.find((s) => s.id === solId);
    return sol?.ampoules === calc.ampoules && sol?.diluentMl === calc.diluentMl && sol?.diluent === calc.diluent;
  };

  const handleSaveDilution = () => {
    if (!saveLabel.trim() || amps <= 0) return;
    const entry = saveDilution(calc.drugKey, saveLabel.trim(), amps, dilMl, calc.diluent);
    setSavedDilutions((prev) => [...prev, entry]);
    setSaveLabel("");
    setShowSaveModal(false);
  };
  const handleDeleteSaved = (id: string) => {
    deleteSavedDilution(id);
    setSavedDilutions((prev) => prev.filter((d) => d.id !== id));
  };

  // ── ACURASYS fixed-rate handling ──────────────────────────────────────────
  const acurasysActive = mode.acurasys != null && calc.doseInput === "ACURASYS";
  const acurasysRate = acurasysActive && concMgPerMl > 0 ? mode.acurasys!.doseMgH / concMgPerMl : null;

  // ── Sidebar grouping ──────────────────────────────────────────────────────
  const groups: { group: SedGroup; drugs: SedDrug[] }[] = (["sedacao", "analgesia", "bnm"] as SedGroup[]).map((g) => ({
    group: g,
    drugs: SED_DRUGS.filter((d) => d.group === g),
  }));

  const concLabel = drug.displayUnit === "mcg/mL"
    ? `${fmt(concMcgPerMl, 2)} mcg/mL`
    : `${fmt(concMgPerMl, concMgPerMl < 1 ? 2 : 1)} mg/mL`;

  return (
    <View style={s.screen}>
      {/* ⚠️ CABEÇALHO ÚNICO E COM SAÍDA — a rota não desenha mais cromado (I7).
          Antes desta linha o `← Módulos` vinha de `app/modulos/[id].tsx`, e esta
          tela era uma das QUATRO que ficariam sem caminho de volta ao hub. */}
      <Header titulo={tr("💉 Sedoanalgesia & BNM")} onVoltar={onVoltar} labelVoltar={tr("Voltar aos módulos")} />

      <View style={[s.body, larguraDaTela >= 920 && s.bodyLateral]}>
        {/* ── Sidebar agrupada ── */}
        {/* RAIL COMUM — 92 px próprios viraram o componente do shell. O grupo
            (sedativo / analgésico / bloqueador) vira o `hint` do item, e o
            emoji vai pelo campo `icon`: mesma rota do glifo do íon. */}
        <RailDeModulo
          items={groups.flatMap(({ group, drugs }) =>
            drugs.map((d) => ({
              id: d.key,
              simbolo: d.emoji,
              label: d.name,
              hint: SED_GROUP_LABELS[group],
              accent: TEMAS.escuro.cores.primary,
            }))
          )}
          activeId={calc.drugKey}
          onSelect={(id) => selectDrug(id as typeof calc.drugKey)}
          eyebrow="Fármacos"
          titulo="Sedação e analgesia"
        />

        {/* ── Conteúdo ── */}
        <ScrollView style={s.mainScroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Princípios da analgo-sedação — vale para todos os fármacos */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("ANTES DA DOSE — PRINCÍPIOS")}</Text>
            {PRINCIPIOS_ANALGOSEDACAO.map((linha) => (
              <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>
            ))}
          </View>

          {/* Cabeçalho do fármaco */}
          <View style={s.drugHeader}>
            <Text style={s.drugName}>{drug.emoji} {tr(drug.name)}</Text>
            <Text style={s.drugClass}>{tr(drug.className)}</Text>
          </View>

          {/* Regras do BNM — só no grupo de bloqueadores */}
          {drug.group === "bnm" && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("BLOQUEIO NEUROMUSCULAR — REGRAS E REVERSÃO")}</Text>
              {REGRAS_BNM.map((linha) => (
                <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>
              ))}
            </View>
          )}

          {/* Estratégia */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("ESTRATÉGIA INICIAL")}</Text>
            {drug.strategy.map((line) => (
              <Text key={line} style={s.refLine}>• {tr(line)}</Text>
            ))}
          </View>

          {/* Paciente */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("PACIENTE")}</Text>
            <View style={s.row}>
              <Text style={s.fieldLabel}>{tr("Peso (kg)")}</Text>
              <TextInput
                style={s.modalInput}
                value={calc.weightKg}
                onChangeText={(texto) => setCalc((c) => ({ ...c, weightKg: texto }))}
                keyboardType="numeric"
                placeholder={tr("Informe o peso")}
                placeholderTextColor="#94a3b8"
                accessibilityLabel={tr("Peso em quilogramas")}
              />
              {parsePt(calc.weightKg) !== null ? (
                <NumericStepper
                  valor={Number(calc.weightKg.replace(",", "."))}
                  onChange={(n) => setCalc((c) => ({ ...c, weightKg: String(n) }))}
                  min={FAIXA_DE_ENTRADA.peso.min}
                  max={FAIXA_DE_ENTRADA.peso.max}
                  passo={FAIXA_DE_ENTRADA.peso.passo}
                  unidade="kg"
                  testID="slider-peso"
                />
              ) : null}
            </View>
            {weightMissing
              ? <Text style={s.hintWarn}>{tr("⚠️ Informe o peso para calcular esta dose.")}</Text>
              : !needsWeight ? <Text style={s.hint}>{tr("Dose por hora — não depende do peso.")}</Text> : null}
          </View>

          {/* Modo */}
          {drug.modes.length > 1 && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("MODO DE USO")}</Text>
              <HorizontalChoiceSelector
                value={calc.modeId}
                options={drug.modes.map((m) => ({ value: m.id, label: tr(m.label) }))}
                onChange={(id) => {
                  const next = drug.modes.find((m) => m.id === id);
                  if (next) selectMode(next);
                }}
                accessibilityLabel={tr("Modo de uso")}
                testID="sedacao-modo"
              />
            </View>
          )}

          {/* Diluição (apenas infusão) */}
          {isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("DILUIÇÃO")}</Text>

              <Text style={s.dilSectionLabel}>{tr("Diluições recomendadas")}</Text>
              <HorizontalChoiceSelector
                value={drug.standardSolutions.find((sol) => isActiveSolution(sol.id))?.id}
                options={drug.standardSolutions.map((sol) => ({ value: sol.id, label: tr(sol.label) }))}
                onChange={applySolution}
                accessibilityLabel={tr("Diluições recomendadas")}
                testID="sedacao-diluicoes"
              />

              {/* Diluições do usuário */}
              <View style={s.userDilHeader}>
                <Text style={s.userDilTitle}>{tr("Diluições do usuário")}</Text>
                <Pressable onPress={() => setShowSaveModal(true)} style={[s.saveDilBtn, amps <= 0 && s.saveDilBtnDisabled]} disabled={amps <= 0}>
                  <Text style={s.saveDilBtnTxt}>{tr("+ Salvar atual")}</Text>
                </Pressable>
              </View>
              {savedDilutions.length === 0 ? (
                <Text style={s.userDilEmpty}>{tr("Nenhuma diluição salva. Monte a sua abaixo (ampolas + diluente + tipo) e toque em \"+ Salvar atual\".")}</Text>
              ) : (
                <View style={s.userDilList}>
                  {savedDilutions.map((d) => (
                    <View key={d.id} style={s.userDilRow}>
                      <Pressable style={s.userDilApply} onPress={() => setCalc((c) => ({ ...c, ampoules: String(d.ampoules), diluentMl: String(d.diluentMl), diluent: d.diluent }))}>
                        <Text style={s.userDilName}>📌 {tr(d.label)}</Text>
                        <Text style={s.userDilMeta}>{d.ampoules} amp · {d.diluentMl} mL {d.diluent}</Text>
                      </Pressable>
                      <Pressable onPress={() => handleDeleteSaved(d.id)} style={s.userDilDel}><Text style={s.userDilDelTxt}>✕</Text></Pressable>
                    </View>
                  ))}
                </View>
              )}

              {/* Campos custom — criar a própria solução */}
              <Text style={s.dilSectionLabel}>{tr("Criar diluição personalizada")}</Text>
              <View style={s.dilFields}>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Ampolas")}</Text>
                  <NumericStepper
                    valor={Number(calc.ampoules.replace(",", ".")) || 1}
                    onChange={(n) => setCalc((c) => ({ ...c, ampoules: String(n) }))}
                    min={1}
                    max={20}
                    passo={1}
                    testID="slider-ampolas"
                  />
                </View>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Diluente (mL)")}</Text>
                  <NumericStepper
                    valor={Number(calc.diluentMl.replace(",", ".")) || 100}
                    onChange={(n) => setCalc((c) => ({ ...c, diluentMl: String(n) }))}
                    min={0}
                    max={500}
                    passo={1}
                    unidade="mL"
                    testID="slider-diluente"
                  />
                </View>
                <View style={s.dilField}>
                  <Text style={s.fieldLabel}>{tr("Tipo")}</Text>
                  <HorizontalChoiceSelector
                    value={calc.diluent}
                    options={(["SF", "SG"] as Diluent[]).map((d) => ({ value: d, label: d }))}
                    onChange={(d) => setCalc((c) => ({ ...c, diluent: d as Diluent }))}
                    accessibilityLabel={tr("Tipo de diluente")}
                    testID="sedacao-diluente"
                  />
                </View>
              </View>

              {/* Resumo concentração */}
              {conc && (
                <View style={s.concGrid}>
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Ampolas")}</Text><Text style={s.concVal}>{amps}</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Vol. final")}</Text><Text style={s.concVal}>{fmt(conc.finalVolumeMl, 0)} mL</Text></View>
                  <View style={s.concDivider} />
                  <View style={s.concCell}><Text style={s.concKey}>{tr("Concentração")}</Text><Text style={[s.concVal, s.concValHi]}>{concLabel}</Text></View>
                </View>
              )}
            </View>
          )}

          {/* Bolus: apresentação pura */}
          {!isInfusion && (
            <View style={s.card}>
              <Text style={s.cardLabel}>{tr("APRESENTAÇÃO (BOLUS — AMPOLA PURA)")}</Text>
              <Text style={s.refLine}>{presentation.concentrationLabel}</Text>
              {/* ⚠️ ESTE `tr()` FALTAVA, e era o único dos cinco renders de
                  `refLine` deste arquivo sem ele (312, 327, 336, 577 têm). As
                  três notas de bolus saíam em PORTUGUÊS com o app em espanhol —
                  e a tradução já existia em `lib/i18n/modules/sedacao.ts`.
                  Nenhuma palavra de espanhol foi escrita para corrigir. */}
              {mode.bolusNotes?.map((n) => <Text key={n} style={s.refLine}>• {tr(n)}</Text>)}
            </View>
          )}

          {/* Dose */}
          <View style={s.card}>
            <Text style={s.cardLabel}>{tr("DOSE")}</Text>
            {mode.acurasys && (
              <Pressable style={[s.acurasysBtn, acurasysActive && s.acurasysBtnActive]} onPress={applyAcurasys}>
                <Text style={s.acurasysTxt}>⭐ {mode.acurasys.label}</Text>
              </Pressable>
            )}
            {!acurasysActive && (
              <View style={s.calcInputRow}>
                <NumericStepper
                  valor={Number(calc.doseInput.replace(",", ".")) || faixaDaBarra(mode).min}
                  onChange={(n) =>
                    setCalc((c) => ({ ...c, doseInput: String(n).replace(".", ",") }))
                  }
                  min={faixaDaBarra(mode).min}
                  max={faixaDaBarra(mode).max}
                  passo={faixaDaBarra(mode).passo}
                  unidade={mode.unit}
                  testID="slider-dose"
                />
              </View>
            )}
            {acurasysActive && (
              <Pressable style={s.acurasysReset} onPress={() => setCalc((c) => ({ ...c, doseInput: mode.defaultDose }))}>
                <Text style={s.acurasysResetTxt}>{tr("Dose ACURASYS fixa: 37,5 mg/h · toque para voltar à dose por peso")}</Text>
              </Pressable>
            )}

            {/* Régua de faixas */}
            {mode.ranges && mode.ranges.length > 1 && !acurasysActive && (
              <View style={s.ruler}>
                <View style={s.rulerBar}>
                  {mode.ranges.map((r, i) => (
                    <View key={i} style={[s.rulerSeg, { backgroundColor: TONE_COLOR[r.tone] }, range === r && s.rulerSegActive]} />
                  ))}
                </View>
                {range && (
                  <View style={[s.rangeBox, { borderColor: TONE_COLOR[range.tone] }]}>
                    <Text style={[s.rangeLabel, { color: TONE_COLOR[range.tone] }]}>{range.label}</Text>
                    <Text style={s.rangeIndic}>{range.indication}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* MgSO4 checkbox (rocurônio) */}
          {drug.magnesiumInteraction && (
            <View style={s.mgRow}>
              <Switch value={calc.mgSulfate} onValueChange={(v) => setCalc((c) => ({ ...c, mgSulfate: v }))} />
              <Text style={s.mgTxt}>{tr("Paciente em sulfato de magnésio?")}</Text>
            </View>
          )}
          {drug.magnesiumInteraction && calc.mgSulfate && (
            <View style={s.alertWarn}>
              <Text style={s.alertTxt}>{tr("⚠️ MgSO₄ potencializa o rocurônio — reduzir a dose em 30–50% e monitorar com TOF.")}</Text>
            </View>
          )}

          {/* RESULTADO */}
          <View style={s.resultCard}>
            {isInfusion ? (
              <>
                <Text style={s.resultLabel}>{tr("TAXA NA BOMBA")}</Text>
                <Text style={s.resultValue}>
                  {acurasysActive ? fmt(acurasysRate, 1) : weightMissing ? "—" : fmt(rate, 1)} <Text style={s.resultUnit}>mL/h</Text>
                </Text>
                {acurasysActive && <Text style={s.resultSub}>ACURASYS 37,5 mg/h · conc {concLabel}</Text>}
              </>
            ) : (
              <>
                <Text style={s.resultLabel}>{tr("BOLUS — ADMINISTRAR")}</Text>
                <Text style={s.resultValue}>
                  {weightMissing ? "—" : fmt(bolus?.volumeMl, 1)} <Text style={s.resultUnit}>mL</Text>
                </Text>
                {bolus && !weightMissing && (
                  <Text style={s.resultSub}>
                    Dose total: {mode.unit === "mg/kg" ? `${fmt(bolus.totalMg, 0)} mg` : `${fmt(bolus.totalMcg, 0)} mcg`} · {presentation.concentrationLabel}
                  </Text>
                )}
              </>
            )}
            {weightMissing && <Text style={s.resultWarn}>{tr("Informe o peso para calcular.")}</Text>}
          </View>

          {/* Alerta clínico (sempre visível) */}
          <View style={[s.alertBox, drug.alert.tone === "danger" ? s.alertDanger : s.alertWarn]}>
            {drug.alert.lines.map((l, i) => (
              <Text key={i} style={s.alertTxt}>{i === 0 ? `${drug.alert.icon} ` : ""}{tr(l)}</Text>
            ))}
          </View>

          {/* Info clínica (collapsible) */}
          <Pressable style={s.collapsible} onPress={() => setShowInfo((v) => !v)}>
            <Text style={s.collapseTitle}>{tr("ℹ️ Informações clínicas")}</Text>
            <View style={[s.collapseCta, showInfo && s.collapseCtaOpen]}>
              <Text style={[s.collapseCtaText, showInfo && s.collapseCtaTextOpen]}>{showInfo ? tr("FECHAR") : tr("ABRIR")}</Text>
              <Text style={[s.collapseCtaArrow, showInfo && s.collapseCtaTextOpen]}>{showInfo ? "▲" : "▼"}</Text>
            </View>
          </Pressable>
          {showInfo && (
            <View style={s.collapseBody}>
              {drug.info.map((l, i) => <Text key={i} style={s.refLine}>• {tr(l)}</Text>)}
            </View>
          )}

          {/* Referência (collapsible) */}
          <Pressable style={s.collapsible} onPress={() => setShowRef((v) => !v)}>
            <Text style={s.collapseTitle}>{tr("📚 Referência")}</Text>
            <View style={[s.collapseCta, showRef && s.collapseCtaOpen]}>
              <Text style={[s.collapseCtaText, showRef && s.collapseCtaTextOpen]}>{showRef ? tr("FECHAR") : tr("ABRIR")}</Text>
              <Text style={[s.collapseCtaArrow, showRef && s.collapseCtaTextOpen]}>{showRef ? "▲" : "▼"}</Text>
            </View>
          </Pressable>
          {showRef && (
            <View style={s.collapseBody}>
              <Text style={s.refLine}>{tr(drug.reference)}</Text>
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>

      {/* Modal salvar diluição */}
      <Modal visible={showSaveModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{tr("Salvar diluição")}</Text>
            <Text style={s.modalSub}>{amps} amp · {fmt(dilMl, 0)} mL {calc.diluent} · {concLabel}</Text>
            <TextInput style={s.modalInput} value={saveLabel} onChangeText={setSaveLabel} placeholder={tr("Nome (ex: Padrão UTI)")} placeholderTextColor="#94a3b8" autoFocus />
            <View style={s.modalBtns}>
              <Pressable style={s.modalCancel} onPress={() => { setShowSaveModal(false); setSaveLabel(""); }}><Text style={s.modalCancelTxt}>{tr("Cancelar")}</Text></Pressable>
              <Pressable style={[s.modalSave, !saveLabel.trim() && s.modalSaveDisabled]} onPress={handleSaveDilution}><Text style={s.modalSaveTxt}>{tr("Salvar")}</Text></Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CV.cores.bg },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
  headerTitle: { color: CV.cores.text, fontSize: CV.tipo.body.fontSize, fontWeight: "800" },
  body: { flex: 1 },
  bodyLateral: { flexDirection: "row" },


  mainScroll: { flex: 1, backgroundColor: CV.cores.surface },
  scroll: { padding: 14, gap: 12, paddingBottom: 28 },

  drugHeader: { gap: 2 },
  drugName: { fontSize: CV.tipo.section.fontSize, fontWeight: "900", color: CV.cores.text },
  drugClass: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.primary },

  card: { backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, padding: 14, gap: 10, borderWidth: 1, borderColor: CV.cores.border },
  cardLabel: { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.textSecondary, letterSpacing: 1 },
  /**
   * ⚠️ EMPILHADO, e o motivo é medido: com `flexDirection: "row"` e o rótulo em
   * `flex: 1`, o NumericStepper ficava com largura ZERO — medido no DOM de
   * produção, 0 px. A barra existia e não dava para arrastar; só os botões −/+
   * funcionavam.
   *
   * Aqui isso não era estética: `weightMissing` BLOQUEIA a dose, então um campo
   * sem barra utilizável é uma conduta a mais de distância. Mesmo defeito das
   * Calculadoras Clínicas, terceira aparição — e é o padrão canônico da árvore
   * que resolve: rótulo em cima, controle na largura inteira.
   */
  row: { gap: 8 },
  fieldLabel: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.textSecondary },
  input: { flex: 1.5, borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, padding: 10, fontSize: CV.tipo.body.fontSize, fontWeight: "700", color: CV.cores.text, backgroundColor: CV.cores.surface },
  hint: { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary },
  hintWarn: { fontSize: CV.tipo.micro.fontSize, color: CV.cores.warning, fontWeight: "600" },

  modeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  modeChip: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: CV.raio.input, backgroundColor: CV.cores.surface, borderWidth: 1.5, borderColor: CV.cores.border , minHeight: 44, justifyContent: "center" },
  modeChipActive: { backgroundColor: CV.cores.surface, borderColor: CV.cores.primary },
  modeChipTxt: { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.textSecondary },
  modeChipTxtActive: { color: CV.cores.primary },

  dilSectionLabel: { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.textSecondary, letterSpacing: 0.6, textTransform: "uppercase", marginTop: 2 },
  userDilEmpty: { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary, fontStyle: "italic", paddingVertical: 4 },
  saveDilBtnDisabled: { opacity: 0.4 },
  solRow: { gap: 8, paddingVertical: 2 },
  solChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: CV.raio.input, backgroundColor: CV.cores.surface, borderWidth: 1.5, borderColor: CV.cores.border, maxWidth: 230 , minHeight: 44, justifyContent: "center" },
  solChipActive: { backgroundColor: CV.cores.surface, borderColor: CV.cores.primary },
  solChipTxt: { fontSize: CV.tipo.micro.fontSize, fontWeight: "600", color: CV.cores.textSecondary },
  solChipTxtActive: { color: CV.cores.primary, fontWeight: "800" },

  userDilHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userDilTitle: { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary },
  userDilList: { gap: 6 },
  userDilRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  userDilApply: { flex: 1, backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, padding: 10, borderWidth: 1.5, borderColor: CV.cores.primary },
  userDilName: { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary },
  userDilMeta: { fontSize: CV.tipo.micro.fontSize, color: CV.cores.primary, marginTop: 2 },
  userDilDel: { padding: 8 },
  userDilDelTxt: { color: CV.cores.critical, fontWeight: "700", fontSize: 14 },
  saveDilBtn: { backgroundColor: CV.cores.surface, borderRadius: CV.raio.botao, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: CV.cores.primary , minHeight: 44, justifyContent: "center" },
  saveDilBtnTxt: { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.primary },

  dilFields: { flexDirection: "row", gap: 8 },
  dilField: { flex: 1, gap: 4 },
  diluentSeg: { flexDirection: "row", borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, overflow: "hidden" , minHeight: 44, justifyContent: "center" },
  diluentOpt: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: CV.cores.surface , minHeight: 44, justifyContent: "center" },
  diluentOptActive: { backgroundColor: CV.cores.surface },
  diluentOptTxt: { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.textSecondary },
  diluentOptTxtActive: { color: CV.cores.text },

  concGrid: { flexDirection: "row", backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, borderWidth: 1, borderColor: CV.cores.border, overflow: "hidden" },
  concCell: { flex: 1, alignItems: "center", paddingVertical: 10, paddingHorizontal: 4 },
  concDivider: { width: 1, backgroundColor: CV.cores.border },
  concKey: { fontSize: CV.tipo.micro.fontSize, fontWeight: "700", color: CV.cores.primary, letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 2 },
  concVal: { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: CV.cores.primary, textAlign: "center" },
  concValHi: { color: CV.cores.text },

  // Empilhado: o stepper da dose media 2 px dentro da linha.
  calcInputRow: { alignItems: "stretch", borderWidth: 2, borderColor: CV.cores.primary, borderRadius: CV.raio.input, overflow: "hidden", backgroundColor: CV.cores.surface, padding: 8, gap: 4 },
  calcInput: { flex: 1, padding: 12, fontSize: 22, fontWeight: "800", color: CV.cores.text, textAlign: "right" },
  calcUnit: { fontSize: CV.tipo.micro.fontSize, fontWeight: "700", color: CV.cores.primary, paddingRight: 10, paddingLeft: 4 },

  acurasysBtn: { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, borderWidth: 1.5, borderColor: "#facc15", padding: 12, alignItems: "center" },
  acurasysBtnActive: { backgroundColor: "rgba(250,204,21,0.18)" },
  acurasysTxt: { fontSize: CV.tipo.label.fontSize, fontWeight: "800", color: "#fde047" },
  acurasysReset: { paddingVertical: 6 },
  acurasysResetTxt: { fontSize: CV.tipo.micro.fontSize, color: "#fde047", fontWeight: "600" },

  ruler: { gap: 8 },
  rulerBar: { flexDirection: "row", height: 12, borderRadius: 6, overflow: "hidden", gap: 2 },
  rulerSeg: { flex: 1, opacity: 0.35, borderRadius: 3 , minHeight: 44, justifyContent: "center" },
  rulerSegActive: { opacity: 1 },
  rangeBox: { borderWidth: 1.5, borderRadius: CV.raio.input, padding: 10, backgroundColor: CV.cores.surface },
  rangeLabel: { fontSize: CV.tipo.label.fontSize, fontWeight: "800" },
  rangeIndic: { fontSize: CV.tipo.micro.fontSize, color: CV.cores.textSecondary, marginTop: 2 },

  mgRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  mgTxt: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.text },

  resultCard: { backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, borderWidth: 1.5, borderColor: CV.cores.success, padding: 18, alignItems: "center", gap: 4 },
  resultLabel: { fontSize: CV.tipo.micro.fontSize, fontWeight: "800", color: CV.cores.success, letterSpacing: 1 },
  resultValue: { fontSize: 44, fontWeight: "900", color: "#f0fdf4", letterSpacing: -1 },
  resultUnit: { fontSize: CV.tipo.section.fontSize, fontWeight: "700", color: CV.cores.success },
  resultSub: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.success, textAlign: "center" },
  resultWarn: { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.warning },

  alertBox: { borderRadius: CV.raio.input, padding: 12, borderWidth: 1.5, gap: 4 },
  alertDanger: { backgroundColor: CV.cores.surface, borderColor: CV.cores.critical },
  alertWarn: { backgroundColor: CV.cores.surface, borderColor: CV.cores.warning },
  alertTxt: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.text, lineHeight: 18 },

  collapsible: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: CV.cores.border },
  collapseTitle: { fontSize: CV.tipo.label.fontSize, fontWeight: "700", color: CV.cores.text },
  collapseCta: { minWidth: 78, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingHorizontal: 10, borderRadius: CV.raio.botao, backgroundColor: CV.cores.primary, borderWidth: 1, borderColor: CV.cores.primary },
  collapseCtaOpen: { backgroundColor: "transparent" },
  collapseCtaText: { fontSize: CV.tipo.micro.fontSize, fontWeight: "900", color: CV.cores.onPrimary, letterSpacing: 0.45 },
  collapseCtaTextOpen: { color: CV.cores.primary },
  collapseCtaArrow: { fontSize: CV.tipo.micro.fontSize, fontWeight: "900", color: CV.cores.onPrimary },
  collapseBody: { backgroundColor: CV.cores.surface, borderRadius: CV.raio.input, paddingHorizontal: 16, paddingVertical: 12, gap: 6, marginTop: -6, borderWidth: 1, borderColor: CV.cores.border },
  refLine: { fontSize: CV.tipo.label.fontSize, color: CV.cores.textSecondary, lineHeight: 19 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: CV.cores.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle: { fontSize: CV.tipo.section.fontSize, fontWeight: "800", color: CV.cores.text },
  modalSub: { fontSize: CV.tipo.label.fontSize, color: CV.cores.textSecondary },
  modalInput: { borderWidth: 1.5, borderColor: CV.cores.border, borderRadius: CV.raio.input, padding: 14, fontSize: CV.tipo.body.fontSize, color: CV.cores.text },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancel: { flex: 1, padding: 14, borderRadius: CV.raio.input, alignItems: "center", backgroundColor: CV.cores.surface },
  modalCancelTxt: { fontWeight: "700", color: CV.cores.textSecondary },
  modalSave: { flex: 1, padding: 14, borderRadius: CV.raio.input, alignItems: "center", backgroundColor: CV.cores.primary },
  modalSaveDisabled: { backgroundColor: CV.cores.textSecondary },
  modalSaveTxt: { fontWeight: "700", color: CV.cores.text },
});
