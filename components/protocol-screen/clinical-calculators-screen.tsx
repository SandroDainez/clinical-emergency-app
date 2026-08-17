/**
 * clinical-calculators-screen.tsx
 * Hub de Calculadoras Clínicas — fórmulas e escores de gravidade.
 * Cálculo em tempo real (onChange), fonte exibida, resultado crítico em destaque.
 */

import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from "react-native";
import {
  CALC_TOOLS,
  CALC_GROUPS,
  type CalcTool,
  type FormulaTool,
  type ScoreTool,
  type Tone,
} from "../../clinical-calculators-engine";
import { useTr } from "../../lib/use-tr";
import { Header } from "../ui-v2/header";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import { FAIXA_DE_ENTRADA } from "../../lib/faixas-de-entrada";
import { RailDeModulo } from "./module-flow-shell";
import { TEMAS } from "../../design-system/tokens";

const TONE: Record<Tone, { bg: string; border: string; text: string }> = {
  green: { bg: "#11261b", border: "#22c55e", text: "#86efac" },
  yellow: { bg: "#2a2410", border: "#eab308", text: "#fde047" },
  orange: { bg: "#2a1a0c", border: "#f97316", text: "#fdba74" },
  red: { bg: "#3b0a0a", border: "#ef4444", text: "#fca5a5" },
  neutral: { bg: "#0f172a", border: "#334155", text: "#cbd5e1" },
};

export default function ClinicalCalculatorsScreen({ onVoltar }: { onVoltar?: () => void }) {
  const { width: larguraDaTela } = useWindowDimensions();
  const tr = useTr();
  const [toolId, setToolId] = useState<string>(CALC_TOOLS[0].id);
  const [values, setValues] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Record<string, number>>({});

  const tool: CalcTool = useMemo(() => CALC_TOOLS.find((t) => t.id === toolId) ?? CALC_TOOLS[0], [toolId]);

  const setVal = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));
  const setScore = (key: string, points: number) => setScores((s) => ({ ...s, [key]: points }));

  return (
    <View style={s.screen}>
      {/* ⚠️ CABEÇALHO ÚNICO — este é o único desta tela, e é o `Header` canônico.
          A rota não desenha mais cromado (I7): quem não trouxer o próprio fica
          sem título E SEM SAÍDA. O `onVoltar` é o caminho para o hub. */}
      <Header titulo={`🧮 ${tr("Calculadoras Clínicas")}`} onVoltar={onVoltar} labelVoltar={tr("Voltar aos módulos")} />

      <View style={[s.body, larguraDaTela >= 920 && s.bodyLateral]}>
        {/* Sidebar */}
        {/* RAIL COMUM — 96 px próprios viraram o componente do shell. O grupo
            (calculadoras / escores) vira `hint`; o `adjustsFontSizeToFit` que
            encolhia o nome para caber some junto com a largura apertada. */}
        <RailDeModulo
          items={CALC_GROUPS.flatMap((g) =>
            CALC_TOOLS.filter((t) => t.kind === g.kind).map((t) => ({
              id: t.id,
              // Sem símbolo: a lista é ordenada e o índice do shell serve.
              label: t.name,
              hint: g.label,
              accent: TEMAS.escuro.cores.primary,
            }))
          )}
          activeId={toolId}
          onSelect={(id) => setToolId(id as typeof toolId)}
          eyebrow="Ferramentas"
          titulo="Calculadoras e escores"
        />

        {/* Conteúdo */}
        <ScrollView style={s.mainScroll} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.toolHeader}>
            <Text style={s.toolName}>{tr(tool.name)}</Text>
            <Text style={s.toolSub}>{tr(tool.subtitle)}</Text>
          </View>

          {tool.kind === "formula"
            ? <FormulaView tool={tool} values={values} setVal={setVal} />
            : <ScoreView tool={tool} scores={scores} setScore={setScore} />}

          <Text style={s.reference}>{tr("Fonte")}: {tool.reference}</Text>
          <View style={{ height: 28 }} />
        </ScrollView>
      </View>
    </View>
  );
}

function FormulaView({ tool, values, setVal }: { tool: FormulaTool; values: Record<string, string>; setVal: (k: string, v: string) => void }) {
  const tr = useTr();
  const local: Record<string, string> = {};
  for (const inp of tool.inputs) local[inp.id] = values[`${tool.id}.${inp.id}`] ?? "";
  const result = tool.compute(local);

  return (
    <>
      <View style={s.card}>
        <Text style={s.cardLabel}>{tr("DADOS")}</Text>
        {tool.inputs.map((inp) => {
          const key = `${tool.id}.${inp.id}`;
          if (inp.kind === "toggle") {
            return (
              <View key={inp.id} style={s.field}>
                <Text style={s.fieldLabel}>{tr(inp.label)}</Text>
                <View style={s.toggleRow}>
                  {inp.options.map((o) => {
                    const active = (values[key] ?? "") === o.value;
                    return (
                      <Pressable key={o.value} style={[s.toggleChip, active && s.toggleChipActive]} onPress={() => setVal(key, o.value)}>
                        <Text style={[s.toggleChipTxt, active && s.toggleChipTxtActive]}>{tr(o.label)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          }
          return (
            <View key={inp.id} style={s.fieldRow}>
              <Text style={s.fieldLabel}>{tr(inp.label)}{inp.unit ? <Text style={s.unit}> ({tr(inp.unit)})</Text> : null}</Text>
              {/* Barra, não caixa. A faixa vem de lib/faixas-de-entrada pela
                  GRANDEZA (na, k, cr, plaq…), que já é a fonte única do app —
                  criar uma segunda tabela aqui seria repetir o erro de manter
                  duas versões do mesmo número.
                  Sem faixa declarada o campo cai de volta na caixa: melhor um
                  campo fora do padrão do que uma barra com limite inventado. */}
              {FAIXA_DE_ENTRADA[inp.id] ? (
                <NumericStepper
                  valor={
                    Number((values[key] ?? "").replace(",", ".")) ||
                    FAIXA_DE_ENTRADA[inp.id].min
                  }
                  onChange={(n) => setVal(key, String(n).replace(".", ","))}
                  min={FAIXA_DE_ENTRADA[inp.id].min}
                  max={FAIXA_DE_ENTRADA[inp.id].max}
                  passo={FAIXA_DE_ENTRADA[inp.id].passo}
                  unidade={inp.unit ? tr(inp.unit) : undefined}
                  testID={`slider-${inp.id}`}
                />
              ) : (
                <TextInput
                  style={s.input}
                  value={values[key] ?? ""}
                  onChangeText={(v) => setVal(key, v)}
                  keyboardType="decimal-pad"
                  placeholder={inp.placeholder ? tr(inp.placeholder) : ""}
                  placeholderTextColor="#64748b"
                  accessibilityLabel={tr(inp.label)}
                />
              )}
              {/* A ressalva fica NO CAMPO, não numa nota longe dele: campo cuja
                  unidade ou medida pode ser confundida precisa dizer isso onde
                  o dedo digita (R-16 — o mesmo aviso longe do campo ensina que
                  o risco é menor). */}
              {"helperText" in inp && inp.helperText ? (
                <Text style={s.fieldHelper}>{tr(inp.helperText)}</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {tool.alert && tool.alert.length > 0 && (
        <View style={s.alertBox}>{tool.alert.map((a, i) => <Text key={i} style={s.alertTxt}>⚠️ {tr(a)}</Text>)}</View>
      )}

      {result ? (
        <>
          <View style={[s.resultCard, result.interpret ? { borderColor: TONE[result.interpret.tone].border, backgroundColor: TONE[result.interpret.tone].bg } : null]}>
            {result.metrics.map((m, i) => (
              m.highlight
                ? <View key={i} style={s.bigMetric}><Text style={s.bigMetricLabel}>{tr(m.label)}</Text><Text style={s.bigMetricVal}>{tr(m.value)}</Text></View>
                : <View key={i} style={s.metricRow}><Text style={s.metricLabel}>{tr(m.label)}</Text><Text style={s.metricVal}>{tr(m.value)}</Text></View>
            ))}
          </View>
          {result.interpret && <Interp interp={result.interpret} />}
          {result.tables?.map((tb, i) => (
            <View key={i} style={s.card}>
              <Text style={s.cardLabel}>{tr(tb.title).toUpperCase()}</Text>
              {tb.rows.map((r, j) => (
                <View key={j} style={s.tableRow}><Text style={s.tableK}>{tr(r.k)}</Text><Text style={s.tableV}>{tr(r.v)}</Text></View>
              ))}
            </View>
          ))}
        </>
      ) : (
        <View style={s.placeholder}><Text style={s.placeholderTxt}>{tr("Preencha os campos para calcular.")}</Text></View>
      )}
    </>
  );
}

function ScoreView({ tool, scores, setScore }: { tool: ScoreTool; scores: Record<string, number>; setScore: (k: string, p: number) => void }) {
  const tr = useTr();
  const total = tool.vars.reduce((acc, v) => acc + (scores[`${tool.id}.${v.id}`] ?? v.options[0].points), 0);
  const interp = tool.interpret(total);
  const isToggle = tool.layout === "toggle";

  return (
    <>
      {/* Resultado no topo (fica visível ao rolar os itens) */}
      <View style={[s.resultCard, { borderColor: TONE[interp.tone].border, backgroundColor: TONE[interp.tone].bg }]}>
        <Text style={s.scoreTotalLabel}>{tr("PONTUAÇÃO")} ({tool.totalRange})</Text>
        <Text style={[s.scoreTotal, { color: TONE[interp.tone].text }]}>{total.toString().replace(".", ",")}</Text>
        <Text style={[s.scoreInterp, { color: TONE[interp.tone].text }]}>{tr(interp.label)}</Text>
        {interp.lines?.map((l, i) => <Text key={i} style={s.scoreInterpLine}>{tr(l)}</Text>)}
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>{isToggle ? tr("MARQUE OS PRESENTES") : tr("SELECIONE CADA ITEM")}</Text>
        {tool.vars.map((v) => {
          const key = `${tool.id}.${v.id}`;
          const sel = scores[key] ?? v.options[0].points;
          return (
            <View key={v.id} style={s.scoreVar}>
              <Text style={s.scoreVarLabel}>{tr(v.label)}</Text>
              {/*
                `help` existia no tipo ScoreVar desde sempre e nunca era
                renderizado — regra de pontuação escrita no código e invisível
                na tela. É onde ficam as regras condicionais do NIHSS (paciente
                em coma pontua 2 na sensibilidade e 3 na linguagem, por exemplo),
                que mudam o total e que ninguém adivinha pelos rótulos.
              */}
              {v.help ? <Text style={s.scoreVarHelp}>{tr(v.help)}</Text> : null}
              <View style={s.optWrap}>
                {v.options.map((o, idx) => {
                  const isActive = sel === o.points;
                  return (
                    <Pressable key={idx} style={[s.optChip, isActive && s.optChipActive]} onPress={() => setScore(key, o.points)}>
                      <Text style={[s.optChipTxt, isActive && s.optChipTxtActive]}>{tr(o.label)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {tool.note && <View style={s.noteBox}><Text style={s.noteTxt}>ℹ️ {tr(tool.note)}</Text></View>}
    </>
  );
}

function Interp({ interp }: { interp: { tone: Tone; label: string; lines?: string[] } }) {
  const tr = useTr();
  const t = TONE[interp.tone];
  return (
    <View style={[s.interpBox, { borderColor: t.border, backgroundColor: t.bg }]}>
      <Text style={[s.interpLabel, { color: t.text }]}>{tr(interp.label)}</Text>
      {interp.lines?.map((l, i) => <Text key={i} style={s.interpLine}>{tr(l)}</Text>)}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#292e38" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.12)" },
  headerTitle: { color: "#f1f5f9", fontSize: 16, fontWeight: "800" },
  body: { flex: 1 },
  bodyLateral: { flexDirection: "row" },


  mainScroll: { flex: 1, backgroundColor: "#383e4a" },
  scroll: { padding: 14, gap: 12, paddingBottom: 28 },
  toolHeader: { gap: 2 },
  toolName: { fontSize: 20, fontWeight: "900", color: "#f1f5f9" },
  toolSub: { fontSize: 13, fontWeight: "600", color: "#7dd3fc" },

  card: { backgroundColor: "#383e4a", borderRadius: 14, padding: 14, gap: 10, borderWidth: 1, borderColor: "#565e6c" },
  cardLabel: { fontSize: 10, fontWeight: "800", color: "#aab6c6", letterSpacing: 1 },

  field: { gap: 6 },
  /**
   * Empilhado — o rótulo dividia a linha com o controle (`flex: 1`) e a barra
   * de altura media 0 px em produção. Padrão canônico da árvore de decisão.
   */
  fieldRow: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "600", color: "#cbd5e1" },
  unit: { fontSize: 11, fontWeight: "500", color: "#aab6c6" },
  fieldHelper: { fontSize: 11, lineHeight: 16, color: "#aab6c6", marginTop: 6 },
  input: { width: 110, borderWidth: 1.5, borderColor: "#565e6c", borderRadius: 10, padding: 10, fontSize: 16, fontWeight: "700", color: "#f1f5f9", backgroundColor: "#383e4a", textAlign: "right" },
  toggleRow: { flexDirection: "row", gap: 7, flexWrap: "wrap" },
  toggleChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, backgroundColor: "#383e4a", borderWidth: 1.5, borderColor: "#565e6c" , minHeight: 44, justifyContent: "center" },
  toggleChipActive: { backgroundColor: "rgba(2,132,199,0.25)", borderColor: "#0ea5e9" },
  toggleChipTxt: { fontSize: 13, fontWeight: "700", color: "#aab6c6" },
  toggleChipTxtActive: { color: "#e0f2fe" },

  alertBox: { backgroundColor: "#383e4a", borderRadius: 12, borderWidth: 1.5, borderColor: "#f59e0b", padding: 12, gap: 4 },
  alertTxt: { fontSize: 12, fontWeight: "600", color: "#fcd34d", lineHeight: 18 },

  resultCard: { backgroundColor: "#383e4a", borderRadius: 16, borderWidth: 1.5, borderColor: "#565e6c", padding: 16, gap: 8 },
  bigMetric: { alignItems: "center", gap: 2, paddingBottom: 4 },
  bigMetricLabel: { fontSize: 12, fontWeight: "700", color: "#aab6c6" },
  bigMetricVal: { fontSize: 38, fontWeight: "900", color: "#f8fafc", letterSpacing: -1 },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8, borderTopWidth: 1, borderTopColor: "#565e6c", paddingTop: 8 },
  metricLabel: { flex: 1, fontSize: 12.5, fontWeight: "600", color: "#aab6c6" },
  metricVal: { fontSize: 14, fontWeight: "800", color: "#e2e8f0" },

  scoreTotalLabel: { fontSize: 11, fontWeight: "800", color: "#aab6c6", letterSpacing: 1, textAlign: "center" },
  scoreTotal: { fontSize: 48, fontWeight: "900", letterSpacing: -1, textAlign: "center" },
  scoreInterp: { fontSize: 15, fontWeight: "800", textAlign: "center" },
  scoreInterpLine: { fontSize: 12.5, color: "#cbd5e1", textAlign: "center", lineHeight: 18 },

  scoreVar: { gap: 6, borderTopWidth: 1, borderTopColor: "#565e6c", paddingTop: 10 },
  scoreVarLabel: { fontSize: 13, fontWeight: "700", color: "#e2e8f0" },
  scoreVarHelp: { fontSize: 11.5, fontWeight: "600", color: "#94a3b8", lineHeight: 16, marginTop: -2 },
  optWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  optChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#383e4a", borderWidth: 1.5, borderColor: "#565e6c" , minHeight: 44, justifyContent: "center" },
  optChipActive: { backgroundColor: "rgba(2,132,199,0.25)", borderColor: "#38bdf8" },
  optChipTxt: { fontSize: 12.5, fontWeight: "700", color: "#aab6c6" },
  optChipTxtActive: { color: "#e0f2fe" },

  interpBox: { borderRadius: 12, borderWidth: 1.5, padding: 12, gap: 4 },
  interpLabel: { fontSize: 14, fontWeight: "800" },
  interpLine: { fontSize: 12.5, color: "#cbd5e1", lineHeight: 18 },

  tableRow: { flexDirection: "row", gap: 10, borderTopWidth: 1, borderTopColor: "#565e6c", paddingTop: 8 , minHeight: 44, justifyContent: "center" },
  tableK: { width: 92, fontSize: 12, fontWeight: "800", color: "#7dd3fc" },
  tableV: { flex: 1, fontSize: 12.5, color: "#cbd5e1", lineHeight: 18 },

  noteBox: { backgroundColor: "#383e4a", borderRadius: 12, borderWidth: 1, borderColor: "#565e6c", padding: 12 },
  noteTxt: { fontSize: 12.5, color: "#aab6c6", lineHeight: 18 },

  placeholder: { backgroundColor: "#383e4a", borderRadius: 12, borderWidth: 1, borderColor: "#565e6c", padding: 16 },
  placeholderTxt: { fontSize: 13, color: "#aab6c6" },

  reference: { fontSize: 11, color: "#aab6c6", fontStyle: "italic", lineHeight: 16 },
});
