import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { predictedBodyWeight } from "../../ventilation-decision-tree";
import { ALVOS_TCE } from "../../lib/alvos-tce";
import { useTr } from "../../lib/use-tr";
import { NumericStepper } from "../ui-v2/numeric-stepper";
import { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";
import { FAIXA_DE_ENTRADA } from "../../lib/faixas-de-entrada";
import { guardarNoContexto, lerDoContexto } from "../../lib/contexto-do-paciente";
import { useEffect } from "react";

/**
 * Configurador da ventilação mecânica.
 * Peso predito (altura + sexo) → VC protetor, PEEP inicial, FR e I:E,
 * ajustados por patologia. Integrado ao protocolo de VM (parâmetros iguais
 * aos da árvore de decisão). Card colapsável no topo do fluxo.
 */

type Sexo = "masculino" | "feminino";

type Patologia = {
  id: string;
  label: string;
  /** VC em mL/kg de peso predito (min–max). */
  vc: [number, number];
  peep: string;
  fr: string;
  ie: string;
  nota: string;
};

const PATOLOGIAS: Patologia[] = [
  { id: "padrao", label: "Padrão", vc: [6, 8], peep: "5", fr: "12–16", ie: "1:2", nota: "Pulmão normal — ventilação protetora mesmo sem doença." },
  { id: "sara", label: "SARA", vc: [4, 6], peep: "8–13 · grave 13–18 (tabela no módulo de VM)", fr: "12–35", ie: "1:1–1:2", nota: "Pplat ≤ 30, driving pressure ≤ 15. Prona se P/F ≤ 150." },
  { id: "obstrutivo", label: "Asma/DPOC", vc: [6, 8], peep: "0–5 (mínimo)", fr: "8–12", ie: "1:3–1:4", nota: "Expiração longa, fluxo alto; vigiar auto-PEEP (pausa expiratória)." },
  { id: "tce", label: "TCE", vc: [6, 8], peep: ALVOS_TCE.peep.replace(" cmH₂O", ""), fr: "14–18", ie: "1:2",
    nota: `Normocapnia: PaCO₂ ${ALVOS_TCE.paco2}. PEEP ${ALVOS_TCE.peep} — ${ALVOS_TCE.peepTeto} PPC ${ALVOS_TCE.ppc}, PIC ${ALVOS_TCE.pic}.` },
  { id: "obeso", label: "Obeso", vc: [6, 6], peep: "8–12", fr: "14–18", ie: "1:2", nota: "VC pelo peso PREDITO (nunca o atual). Ramped position." },
];

export default function VentilatorConfiguratorCard() {
  const tr = useTr();
  const [expanded, setExpanded] = useState(false);
  const [altura, setAltura] = useState<string>(() => lerDoContexto("altura")?.valor ?? "");
  const [sexo, setSexo] = useState<Sexo | null>(
    () => (lerDoContexto("sexo")?.valor as Sexo | undefined) ?? null
  );

  useEffect(() => {
    if (altura.trim()) guardarNoContexto("altura", altura, "ventilacao-mecanica");
  }, [altura]);

  useEffect(() => {
    if (sexo) guardarNoContexto("sexo", sexo, "ventilacao-mecanica");
  }, [sexo]);
  const [patId, setPatId] = useState<string>("padrao");

  const pat = PATOLOGIAS.find((p) => p.id === patId) ?? PATOLOGIAS[0];
  const alturaNumerica = Number(String(altura).replace(",", "."));
  const alturaValida =
    Number.isFinite(alturaNumerica) &&
    altura.trim().length > 0 &&
    alturaNumerica >= FAIXA_DE_ENTRADA.altura.min &&
    alturaNumerica <= FAIXA_DE_ENTRADA.altura.max;

  const calc = useMemo(() => {
    const h = parseFloat((altura || "").replace(",", "."));
    if (!Number.isFinite(h) || h <= 100 || !sexo) return null;
    const pbwCalc = predictedBodyWeight(h, sexo);
    if (pbwCalc == null) return null;
    const pbw = Math.max(pbwCalc, 0);
    const vcAlvo = Math.round(((pat.vc[0] + pat.vc[1]) / 2) * pbw);
    const vcMin = Math.round(pat.vc[0] * pbw);
    const vcMax = Math.round(pat.vc[1] * pbw);
    return { pbw: Math.round(pbw), vcAlvo, vcMin, vcMax };
  }, [altura, sexo, pat]);

  return (
    <View style={s.wrap}>
      <Pressable
        style={({ pressed }) => [s.header, pressed && { opacity: 0.85 }]}
        onPress={() => setExpanded((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={tr("Configurador da ventilação mecânica")}>
        <Text style={s.headerIcon}>🎛️</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{tr("Configurador da VM")}</Text>
          <Text style={s.headerSub}>{tr("Altura + sexo → peso corporal predito + parâmetros iniciais")}</Text>
        </View>
        <View style={[s.headerCta, expanded && s.headerCtaOpen]}>
          <Text style={[s.headerCtaText, expanded && s.headerCtaTextOpen]}>
            {expanded ? tr("FECHAR") : tr("ABRIR")}
          </Text>
          <Text style={[s.headerCtaArrow, expanded && s.headerCtaTextOpen]}>
            {expanded ? "▲" : "▼"}
          </Text>
        </View>
      </Pressable>

      {expanded ? (
        <View style={s.body}>
          <Text style={s.label}>{tr("Altura (cm)")}</Text>
          <NumericStepper
            valor={alturaValida ? alturaNumerica : FAIXA_DE_ENTRADA.altura.min}
            valorVisivel={alturaValida}
            onChange={(n) => setAltura(String(n))}
            onConfirmar={(n) => setAltura(String(n))}
            min={FAIXA_DE_ENTRADA.altura.min}
            max={FAIXA_DE_ENTRADA.altura.max}
            passo={FAIXA_DE_ENTRADA.altura.passo}
            unidade="cm"
            testID="slider-altura"
          />

          <Text style={s.label}>{tr("Sexo")}</Text>
          <HorizontalChoiceSelector
            value={sexo ?? undefined}
            options={([
              { value: "masculino", label: tr("Masculino") },
              { value: "feminino", label: tr("Feminino") },
            ] as const)}
            onChange={(sx) => setSexo(sx as Sexo)}
            accessibilityLabel={tr("Sexo")}
            testID="vm-sexo"
          />

          <Text style={s.label}>{tr("Cenário")}</Text>
          <HorizontalChoiceSelector
            value={patId}
            options={PATOLOGIAS.map((p) => ({ value: p.id, label: tr(p.label) }))}
            onChange={setPatId}
            accessibilityLabel={tr("Cenário")}
            testID="vm-cenario"
          />

          {calc ? (
            <View style={s.result}>
              <View style={s.pbwRow}>
                <Text style={s.pbwLabel}>{tr("Peso corporal predito")}</Text>
                <Text style={s.pbwValue}>{calc.pbw} kg</Text>
              </View>
              <View style={s.grid}>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>{tr("Volume corrente")}</Text>
                  <Text style={s.cellValue}>{calc.vcAlvo} mL</Text>
                  <Text style={s.cellSub}>{pat.vc[0]}–{pat.vc[1]} mL/kg ({calc.vcMin}–{calc.vcMax} mL)</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>{tr("PEEP inicial")}</Text>
                  <Text style={s.cellValue}>{pat.peep}</Text>
                  <Text style={s.cellSub}>{tr("cmH₂O")}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>{tr("Freq. respiratória")}</Text>
                  <Text style={s.cellValue}>{pat.fr}</Text>
                  <Text style={s.cellSub}>rpm · I:E {pat.ie}</Text>
                </View>
                <View style={s.cell}>
                  <Text style={s.cellLabel}>{tr("Segurança")}</Text>
                  <Text style={s.cellValue}>{tr("Pplat ≤ 30")}</Text>
                  <Text style={s.cellSub}>{tr("driving pressure ≤ 15")}</Text>
                </View>
              </View>
              <Text style={s.nota}>{tr(pat.nota)}</Text>
              <Text style={s.fio2}>FiO₂: começar em 1,0 e reduzir o quanto antes para SpO₂ {patId === "sara" ? "88–95%" : "94–98%"}.</Text>
              <Text style={s.hint}>{tr("Valores INICIAIS — siga o passo a passo abaixo para titulação, segurança e desmame.")}</Text>
            </View>
          ) : (
            <View style={s.placeholder}>
              <Text style={s.placeholderTxt}>{tr("Informe altura e sexo para calcular o peso corporal predito e, a partir dele, os parâmetros ventilatórios iniciais.")}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1.5, borderColor: "#7fb3ff", backgroundColor: "#06222b", overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "rgba(77,154,255,0.18)" },
  headerIcon: { fontSize: 20 },
  headerTitle: { fontSize: 15, fontWeight: "900", color: "#a5f3fc", letterSpacing: -0.2 },
  headerSub: { fontSize: 11.5, fontWeight: "600", color: "#67e8f9", marginTop: 1 },
  headerCta: { minWidth: 78, minHeight: 36, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, backgroundColor: "#67e8f9", borderWidth: 1, borderColor: "#67e8f9", paddingHorizontal: 10 },
  headerCtaOpen: { backgroundColor: "transparent" },
  headerCtaText: { fontSize: 10, fontWeight: "900", color: "#06222b", letterSpacing: 0.5 },
  headerCtaTextOpen: { color: "#67e8f9" },
  headerCtaArrow: { fontSize: 10, fontWeight: "900", color: "#06222b" },
  body: { padding: 14, gap: 8 },
  label: { fontSize: 11, fontWeight: "800", color: "#aab6c6", textTransform: "uppercase", letterSpacing: 0.6, marginTop: 4 },
  result: { marginTop: 8, gap: 10, borderTopWidth: 1, borderTopColor: "#7fb3ff", paddingTop: 12 },
  pbwRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  pbwLabel: { fontSize: 12, fontWeight: "700", color: "#aab6c6" },
  pbwValue: { fontSize: 22, fontWeight: "900", color: "#7fb3ff", letterSpacing: -0.4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cell: { flexGrow: 1, flexBasis: "47%", backgroundColor: "#383e4a", borderRadius: 12, borderWidth: 1, borderColor: "#565e6c", padding: 10, gap: 2 },
  cellLabel: { fontSize: 10.5, fontWeight: "800", color: "#aab6c6", textTransform: "uppercase", letterSpacing: 0.4 },
  cellValue: { fontSize: 17, fontWeight: "900", color: "#e2e8f0", letterSpacing: -0.3 },
  cellSub: { fontSize: 11, fontWeight: "600", color: "#aab6c6" },
  nota: { fontSize: 12.5, lineHeight: 18, color: "#cbd5e1", fontWeight: "600" },
  fio2: { fontSize: 12, lineHeight: 17, color: "#aab6c6" },
  hint: { fontSize: 11.5, lineHeight: 16, color: "#67e8f9", fontWeight: "700" },
  placeholder: { marginTop: 8, padding: 12, borderRadius: 12, backgroundColor: "#383e4a", borderWidth: 1, borderColor: "#565e6c" },
  placeholderTxt: { fontSize: 13, lineHeight: 19, color: "#aab6c6" },
});