/**
 * clinical-calculators-engine.ts
 *
 * Dados e cálculo do hub "Calculadoras Clínicas".
 * Dois tipos de ferramenta: "formula" (cálculo customizado) e "score" (soma de pontos).
 * Todas as fórmulas/valores são da literatura citada — não inventar.
 *
 * Inclui também o stub ClinicalEngine para registro/roteamento no hub.
 */

import { predictedBodyWeight } from "./ventilation-decision-tree";
// A classificação de gravidade do NIHSS pertence ao módulo AVC, que é quem a
// usa para decidir. Aqui ela é apenas consumida (R-12).
import { faixaNihss, NIHSS_SEM_INDICACAO } from "./avc/nihss";
import type {
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";

export type Tone = "green" | "yellow" | "orange" | "red" | "neutral";
export type CalcKind = "formula" | "score";

export type ToggleOption = { label: string; value: string };

export type FormulaInput =
  | { id: string; label: string; unit?: string; kind: "number"; placeholder?: string; optional?: boolean }
  | { id: string; label: string; kind: "toggle"; options: ToggleOption[] };

export type ResultMetric = { label: string; value: string; highlight?: boolean };
export type Interpretation = { tone: Tone; label: string; lines?: string[] };
export type RefTable = { title: string; rows: { k: string; v: string }[] };

export type FormulaResult = {
  metrics: ResultMetric[];
  interpret?: Interpretation;
  tables?: RefTable[];
} | null;

export type FormulaTool = {
  kind: "formula";
  id: string;
  name: string;
  subtitle: string;
  reference: string;
  inputs: FormulaInput[];
  compute: (v: Record<string, string>) => FormulaResult;
  alert?: string[];
};

export type ScoreVarOption = { label: string; points: number };
export type ScoreVar = { id: string; label: string; options: ScoreVarOption[]; help?: string };

export type ScoreTool = {
  kind: "score";
  id: string;
  name: string;
  subtitle: string;
  reference: string;
  layout: "radio" | "toggle";
  totalRange: string;
  vars: ScoreVar[];
  interpret: (total: number) => Interpretation;
  note?: string;
};

export type CalcTool = FormulaTool | ScoreTool;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function num(v: string | undefined): number | null {
  if (v == null) return null;
  const n = parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Número dentro de uma faixa FISIOLOGICAMENTE POSSÍVEL, ou `null`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Isto NÃO é limiar clínico. É guarda de entrada.
 *
 * As faixas são propositalmente largas: cabem o prematuro e o obeso mórbido, a
 * creatinina de 20 e o sódio de 190. Não existe paciente fora delas — existe dedo
 * errado no teclado. O objetivo é só impedir que um erro de digitação vire número
 * com cara de resultado válido.
 *
 * O que motivou: a auditoria da Camada 4 mostrou `clearance-creatinina` devolvendo
 * **−253 mL/min** para idade de 400 anos, porque Cockcroft-Gault usa (140 − idade)
 * e acima de 140 o numerador inverte de sinal. Ninguém digita 400 de propósito —
 * mas digita 40 querendo 4, e nada reclamava. O ânion gap fazia o mesmo com sódio
 * zero ou negativo.
 *
 * Nenhuma fórmula foi alterada. Fora da faixa, a calculadora não devolve resultado.
 */
function numNaFaixa(
  v: string | undefined,
  minimo: number,
  maximo: number
): number | null {
  const n = num(v);
  if (n == null) return null;
  return n >= minimo && n <= maximo ? n : null;
}

/** Faixas de entrada plausível. Largas de propósito — ver `numNaFaixa`. */
const FAIXA = {
  idadeAnos: [0, 120],
  pesoKg: [0.3, 400],
  alturaCm: [30, 260],
  creatininaMgDl: [0.05, 30],
  sodioMeqL: [80, 200],
  cloroMeqL: [40, 180],
  bicarbonatoMeqL: [1, 60],
  albuminaGDl: [0.5, 8],
  glasgow: [3, 15],
} as const;
function f1(n: number): string { return (Math.round(n * 10) / 10).toString().replace(".", ","); }
function f0(n: number): string { return Math.round(n).toString(); }

function kdigoStage(tfg: number): { k: string; v: string } {
  if (tfg >= 90) return { k: "G1", v: "Normal ou alta" };
  if (tfg >= 60) return { k: "G2", v: "Levemente reduzida" };
  if (tfg >= 45) return { k: "G3a", v: "Leve a moderada" };
  if (tfg >= 30) return { k: "G3b", v: "Moderada a grave" };
  if (tfg >= 15) return { k: "G4", v: "Gravemente reduzida" };
  return { k: "G5", v: "Falência renal" };
}

// ─── Ferramentas ─────────────────────────────────────────────────────────────

export const CALC_TOOLS: CalcTool[] = [
  // ══ FÓRMULAS ══
  {
    kind: "formula",
    id: "peso-predito",
    name: "Peso predito (VM)",
    subtitle: "Volume corrente protetor — ARDSNet",
    reference: "ARDSNet. N Engl J Med. 2000;342:1301–1308.",
    inputs: [
      { id: "sexo", label: "Sexo", kind: "toggle", options: [{ label: "Masculino", value: "masculino" }, { label: "Feminino", value: "feminino" }] },
      { id: "altura", label: "Altura", unit: "cm", kind: "number", placeholder: "ex: 175" },
    ],
    alert: ["SEMPRE usar peso predito (altura), NUNCA o peso atual. Em obesos, o VC pelo peso real causa lesão pulmonar (volutrauma)."],
    compute: (v) => {
      const altura = num(v.altura);
      if (!altura || altura <= 100 || !v.sexo) return null;
      // `predictedBodyWeight` recusa sexo indeterminado e altura implausível —
      // não devolve chute. Sem PBW, a calculadora não exibe VC nenhum.
      const pbwCalc = predictedBodyWeight(altura, v.sexo);
      if (pbwCalc == null) return null;
      const pbw = Math.max(pbwCalc, 0);
      return {
        metrics: [
          { label: "Peso predito", value: `${f1(pbw)} kg`, highlight: true },
          { label: "VC 6 mL/kg (padrão ARDSNet)", value: `${f0(6 * pbw)} mL` },
          { label: "VC 4 mL/kg (SARA grave)", value: `${f0(4 * pbw)} mL` },
          { label: "VC 5 mL/kg (SARA moderada)", value: `${f0(5 * pbw)} mL` },
          { label: "VC 7 mL/kg (pulmão não-SARA)", value: `${f0(7 * pbw)} mL` },
          { label: "VC 8 mL/kg (pulmão normal/pós-op)", value: `${f0(8 * pbw)} mL` },
        ],
        tables: [{
          title: "Parâmetros iniciais (ARDSNet)",
          rows: [
            { k: "Pressão de platô", v: "≤ 30 cmH₂O" },
            { k: "Driving pressure", v: "≤ 15 cmH₂O (Pplat − PEEP)" },
            { k: "PEEP inicial", v: "5 cmH₂O (titular por tabela)" },
            { k: "FiO₂", v: "1,0 → titular p/ SpO₂ 94–98%" },
            { k: "FR inicial", v: "12–16 rpm (pH ≥ 7,30)" },
            { k: "I:E", v: "1:2 (asma/DPOC 1:3–1:4)" },
          ],
        }],
      };
    },
  },
  {
    kind: "formula",
    id: "clearance-creatinina",
    name: "Clearance / TFG",
    subtitle: "Cockcroft-Gault · CKD-EPI 2021 · KDIGO",
    reference: "Cockcroft & Gault 1976 · CKD-EPI Inker NEJM 2021 · KDIGO 2012.",
    inputs: [
      { id: "sexo", label: "Sexo", kind: "toggle", options: [{ label: "Masculino", value: "masculino" }, { label: "Feminino", value: "feminino" }] },
      { id: "idade", label: "Idade", unit: "anos", kind: "number", placeholder: "ex: 70" },
      { id: "peso", label: "Peso atual", unit: "kg", kind: "number", placeholder: "ex: 70" },
      { id: "cr", label: "Creatinina sérica", unit: "mg/dL", kind: "number", placeholder: "ex: 1,5" },
    ],
    compute: (v) => {
      const idade = numNaFaixa(v.idade, ...FAIXA.idadeAnos);
      const peso = numNaFaixa(v.peso, ...FAIXA.pesoKg);
      const cr = numNaFaixa(v.cr, ...FAIXA.creatininaMgDl);
      if (!idade || !cr || cr <= 0 || !v.sexo) return null;
      const female = v.sexo === "feminino";
      // Cockcroft-Gault (precisa de peso)
      let cg: number | null = null;
      if (peso && peso > 0) {
        cg = ((140 - idade) * peso) / (72 * cr);
        if (female) cg *= 0.85;
      }
      // CKD-EPI 2021 (sem raça)
      const kappa = female ? 0.7 : 0.9;
      const alpha = female ? (cr <= 0.7 ? -0.241 : -1.2) : (cr <= 0.9 ? -0.302 : -1.2);
      let tfg = 142 * Math.pow(cr / kappa, alpha) * Math.pow(0.9938, idade);
      if (female) tfg *= 1.012;
      const stage = kdigoStage(tfg);
      return {
        metrics: [
          { label: "TFG (CKD-EPI 2021)", value: `${f0(tfg)} mL/min/1,73m²`, highlight: true },
          { label: "ClCr (Cockcroft-Gault)", value: cg != null ? `${f0(cg)} mL/min` : "informe o peso" },
          { label: "Estágio KDIGO", value: `${stage.k} — ${stage.v}` },
        ],
        // O estágio KDIGO já aparece na linha de métricas acima; mantê-lo fora do
        // rótulo deixa a frase inteira como chave de tradução.
        interpret: tfg < 30
          ? { tone: "red", label: "Função renal gravemente reduzida", lines: ["Ajustar fármacos nefrotóxicos e de eliminação renal; evitar contraste; considerar nefrologia."] }
          : tfg < 60
            ? { tone: "orange", label: "Redução moderada", lines: ["Ajustar dose de fármacos de eliminação renal."] }
            : { tone: "green", label: "Função preservada", lines: [] },
        tables: [{
          title: "Ajuste de fármacos comuns",
          rows: [
            { k: "Vancomicina", v: "ajustar por AUC/TFG; diálise: pós-sessão" },
            { k: "Enoxaparina", v: "TFG < 30: 1 mg/kg/dia; < 15: evitar (preferir HNF)" },
            { k: "Pip-tazo / Meropeném", v: "reduzir intervalo conforme TFG" },
            { k: "Metformina / SGLT2i", v: "suspender se TFG < 30" },
            { k: "DOACs", v: "rivaroxabana/dabigatrana: cautela/contraindicado em TFG baixa" },
          ],
        }],
      };
    },
    alert: [
      "CKD-EPI 2021 removeu a variável raça. Cockcroft-Gault é preferido para ajuste de dose de fármacos. Valores orientativos — confirmar com farmacêutico clínico.",
      // ⚠️ Aqui "peso ideal" está CERTO e não deve virar "predito" numa varredura
      // de uniformização. São conceitos distintos: peso PREDITO (ARDSNet, pela
      // altura) é para volume corrente; peso IDEAL/ajustado é o da farmacologia
      // e do clearance renal. Trocar um pelo outro aqui erraria a dose renal.
      "Peso no Cockcroft-Gault: usar o peso atual no eutrófico. No OBESO, o peso atual superestima o clearance — usar peso ideal ou ajustado; no muito magro/edemaciado, também preferir o peso ideal.",
    ],
  },
  {
    kind: "formula",
    id: "osmolalidade",
    name: "Osmolalidade sérica",
    subtitle: "Osm calculada · efetiva · gap osmolar",
    reference: "Osmolalidade efetiva = tonicidade (não inclui ureia).",
    inputs: [
      { id: "na", label: "Sódio", unit: "mEq/L", kind: "number", placeholder: "ex: 140" },
      { id: "glic", label: "Glicemia", unit: "mg/dL", kind: "number", placeholder: "ex: 100" },
      { id: "ureia", label: "Ureia", unit: "mg/dL", kind: "number", placeholder: "ex: 30" },
      { id: "medida", label: "Osm medida (opcional)", unit: "mOsm/kg", kind: "number", optional: true },
    ],
    compute: (v) => {
      const na = num(v.na), glic = num(v.glic), ureia = num(v.ureia), medida = num(v.medida);
      if (na == null || glic == null || ureia == null) return null;
      const calc = 2 * na + glic / 18 + ureia / 6;
      const efetiva = 2 * na + glic / 18;
      const gap = medida != null ? medida - calc : null;
      const interpEf: Interpretation =
        efetiva < 275 ? { tone: "yellow", label: "Hipoosmolalidade — avaliar hiponatremia dilucional" }
        : efetiva <= 295 ? { tone: "green", label: "Osmolalidade efetiva normal (275–295)" }
        : efetiva <= 320 ? { tone: "yellow", label: "Hiperosmolalidade leve — hiperglicemia/hipernatremia" }
        : efetiva <= 360 ? { tone: "orange", label: "Hiperosmolalidade moderada — suspeitar EHH" }
        : { tone: "red", label: "Hiperosmolalidade grave — EHH/coma hiperosmolar" };
      const metrics: ResultMetric[] = [
        { label: "Osm calculada", value: `${f1(calc)} mOsm/kg`, highlight: true },
        { label: "Osm efetiva (tonicidade)", value: `${f1(efetiva)} mOsm/kg` },
      ];
      if (gap != null) metrics.push({ label: "Gap osmolar", value: `${f1(gap)} mOsm/kg` });
      const tables: RefTable[] = [];
      if (gap != null) {
        tables.push({
          title: "Gap osmolar",
          rows: [
            { k: "< 10", v: "Normal" },
            { k: "10–20", v: "Borderline — avaliar contexto" },
            { k: "> 20", v: "Elevado — suspeitar intoxicação (metanol, etilenoglicol, etanol)" },
          ],
        });
      }
      return { metrics, interpret: interpEf, tables };
    },
  },
  {
    kind: "formula",
    id: "anion-gap",
    name: "Ânion gap",
    subtitle: "AG · correção pela albumina · delta-delta",
    reference: "AG = Na − (Cl + HCO₃). Normal 8–12 (albumina 4 g/dL).",
    inputs: [
      { id: "na", label: "Sódio", unit: "mEq/L", kind: "number", placeholder: "ex: 140" },
      { id: "cl", label: "Cloro", unit: "mEq/L", kind: "number", placeholder: "ex: 104" },
      { id: "hco3", label: "Bicarbonato", unit: "mEq/L", kind: "number", placeholder: "ex: 24" },
      { id: "alb", label: "Albumina (opcional)", unit: "g/dL", kind: "number", optional: true },
    ],
    compute: (v) => {
      const na = numNaFaixa(v.na, ...FAIXA.sodioMeqL);
      const cl = numNaFaixa(v.cl, ...FAIXA.cloroMeqL);
      const hco3 = numNaFaixa(v.hco3, ...FAIXA.bicarbonatoMeqL);
      const alb = numNaFaixa(v.alb, ...FAIXA.albuminaGDl);
      if (na == null || cl == null || hco3 == null) return null;
      const ag = na - (cl + hco3);
      const agCorr = alb != null ? ag + 2.5 * (4 - alb) : null;
      const agRef = agCorr ?? ag;
      const dd = hco3 < 24 ? (agRef - 12) / (24 - hco3) : null;
      const metrics: ResultMetric[] = [
        { label: "Ânion gap", value: `${f1(ag)} mEq/L`, highlight: true },
      ];
      if (agCorr != null) metrics.push({ label: "AG corrigido (albumina)", value: `${f1(agCorr)} mEq/L` });
      if (dd != null) metrics.push({ label: "Delta-delta", value: f1(dd) });
      const interp: Interpretation = agRef > 12
        ? { tone: "orange", label: "Ânion gap ELEVADO — acidose com AG aumentado", lines: ["MUDPILES: Metanol/Metformina, Uremia, Diabética (CAD), Propilenoglicol/Paracetaldeído, Isoniazida, Lactato, Etilenoglicol, Salicilatos."] }
        : { tone: "green", label: "Ânion gap normal", lines: ["Se acidose: hiperclorêmica (HARDUPS): HCO₃ perdido (diarreia), ATR, reposição de NaCl, fístula pancreática, urostomia, pós-hipocápnia, espironolactona."] };
      const tables: RefTable[] = [];
      if (dd != null) {
        tables.push({
          title: "Delta-delta",
          rows: [
            { k: "< 0,4", v: "Acidose hiperclorêmica (AG normal)" },
            { k: "0,4–1,0", v: "AG aumentado + componente hiperclorêmico misto" },
            { k: "1,0–2,0", v: "Acidose com AG aumentado pura" },
            { k: "> 2,0", v: "AG aumentado + alcalose metabólica sobreposta" },
          ],
        });
      }
      return { metrics, interpret: interp, tables };
    },
  },

  // ══ ESCORES ══
  {
    kind: "score",
    id: "glasgow",
    name: "Glasgow (GCS)",
    subtitle: "Escala de coma de Glasgow",
    reference: "Teasdale & Jennett, Lancet 1974.",
    layout: "radio",
    totalRange: "3–15",
    vars: [
      { id: "e", label: "Abertura ocular (E)", options: [
        { label: "Espontânea", points: 4 }, { label: "À voz", points: 3 }, { label: "À dor", points: 2 }, { label: "Nenhuma", points: 1 } ] },
      { id: "v", label: "Resposta verbal (V)", options: [
        { label: "Orientada", points: 5 }, { label: "Confusa", points: 4 }, { label: "Palavras inapropriadas", points: 3 }, { label: "Sons incompreensíveis", points: 2 }, { label: "Nenhuma", points: 1 } ] },
      { id: "m", label: "Resposta motora (M)", options: [
        { label: "Obedece comandos", points: 6 }, { label: "Localiza a dor", points: 5 }, { label: "Retirada inespecífica", points: 4 }, { label: "Flexão anormal (decorticação)", points: 3 }, { label: "Extensão (descerebração)", points: 2 }, { label: "Nenhuma", points: 1 } ] },
    ],
    interpret: (t) =>
      t === 15 ? { tone: "green", label: "GCS 15 — normal", lines: [] }
      : t >= 13 ? { tone: "yellow", label: "GCS 13–14 — leve", lines: ["Monitorar — pode indicar disfunção."] }
      : t >= 9 ? { tone: "orange", label: "GCS 9–12 — moderado", lines: ["Vigilância contínua — risco de deterioração."] }
      : t === 8 ? { tone: "orange", label: "GCS 8 — limiar de IOT", lines: ["⚠️ Proteção de via aérea — considerar intubação orotraqueal."] }
      : { tone: "red", label: "GCS ≤ 8 — grave", lines: ["🚨 IOT indicada — risco de aspiração. TCE: TC de crânio urgente."] },
    note: "Intubado/traqueostomizado: registrar V como 'T'. GCS < 13 em TCE → TC de crânio urgente.",
  },
  {
    kind: "score",
    id: "qsofa",
    name: "qSOFA",
    subtitle: "Triagem rápida de sepse (fora da UTI)",
    reference: "Seymour CW et al. JAMA. 2016;315(8):762–774.",
    layout: "toggle",
    totalRange: "0–3",
    vars: [
      { id: "fr", label: "FR ≥ 22 rpm", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "mental", label: "Alteração do estado mental (GCS < 15)", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "pas", label: "PAS ≤ 100 mmHg", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
    ],
    interpret: (t) => t >= 2
      ? { tone: "red", label: "qSOFA ≥ 2 — alto risco de desfecho adverso", lines: ["Acionar avaliação completa com SOFA; considerar UTI."] }
      : { tone: "green", label: "qSOFA 0–1 — baixo risco", lines: [] },
    note: "qSOFA é ferramenta de TRIAGEM fora da UTI — NÃO substitui o SOFA para diagnóstico de sepse.",
  },
  {
    kind: "score",
    id: "sofa",
    name: "SOFA",
    subtitle: "Sequential Organ Failure Assessment",
    reference: "Singer M et al. JAMA. 2016;315(8):801–810 (Sepsis-3).",
    layout: "radio",
    totalRange: "0–24",
    vars: [
      { id: "resp", label: "Respiratório — PaO₂/FiO₂", options: [
        { label: "≥ 400", points: 0 }, { label: "300–399", points: 1 }, { label: "200–299", points: 2 }, { label: "100–199 (com VM)", points: 3 }, { label: "< 100 (com VM)", points: 4 } ] },
      { id: "coag", label: "Coagulação — Plaquetas (×10³)", options: [
        { label: "≥ 150", points: 0 }, { label: "100–149", points: 1 }, { label: "50–99", points: 2 }, { label: "20–49", points: 3 }, { label: "< 20", points: 4 } ] },
      { id: "hep", label: "Hepático — Bilirrubina (mg/dL)", options: [
        { label: "< 1,2", points: 0 }, { label: "1,2–1,9", points: 1 }, { label: "2,0–5,9", points: 2 }, { label: "6,0–11,9", points: 3 }, { label: "≥ 12,0", points: 4 } ] },
      { id: "cv", label: "Cardiovascular (PAM/vasopressor)", options: [
        { label: "PAM ≥ 70", points: 0 }, { label: "PAM < 70", points: 1 }, { label: "Dopa < 5 ou dobuta", points: 2 }, { label: "Dopa 5–15 ou NE/Epi ≤ 0,1", points: 3 }, { label: "Dopa > 15 ou NE/Epi > 0,1", points: 4 } ] },
      { id: "neuro", label: "Neurológico — Glasgow", options: [
        { label: "15", points: 0 }, { label: "13–14", points: 1 }, { label: "10–12", points: 2 }, { label: "6–9", points: 3 }, { label: "< 6", points: 4 } ] },
      { id: "renal", label: "Renal — Creatinina (mg/dL)/diurese", options: [
        { label: "< 1,2", points: 0 }, { label: "1,2–1,9", points: 1 }, { label: "2,0–3,4", points: 2 }, { label: "3,5–4,9 ou < 500 mL/d", points: 3 }, { label: "≥ 5,0 ou < 200 mL/d", points: 4 } ] },
    ],
    interpret: (t) => t >= 12
      ? { tone: "red", label: `SOFA ${t} — risco muito alto (> 60% mortalidade)` }
      : t >= 8 ? { tone: "orange", label: `SOFA ${t} — risco alto (~40% mortalidade)` }
      : t >= 2 ? { tone: "yellow", label: `SOFA ${t} — risco moderado (~10% mortalidade)`, lines: ["SOFA ≥ 2 com infecção = SEPSE (Sepsis-3)."] }
      : { tone: "green", label: `SOFA ${t} — baixo risco` },
    note: "SOFA ≥ 2 pontos em paciente com infecção suspeita/confirmada = Sepse (Sepsis-3, 2016).",
  },
  {
    kind: "score",
    id: "wells-tep",
    name: "Wells (TEP)",
    subtitle: "Probabilidade pré-teste de TEP",
    reference: "Wells PS et al. Ann Intern Med. 2001;135:98–107 (escore original). Tabela de itens e pesos conferida contra o pathway Einstein/SBIBAE de Tromboembolismo Pulmonar v.3, que a reproduz por extenso.",
    layout: "toggle",
    totalRange: "0–12,5",
    vars: [
      { id: "tvp", label: "Sinais/sintomas clínicos de TVP", options: [{ label: "Não", points: 0 }, { label: "Sim (+3)", points: 3 }] },
      { id: "alt", label: "Diagnóstico alternativo menos provável que TEP", options: [{ label: "Não", points: 0 }, { label: "Sim (+3)", points: 3 }] },
      { id: "fc", label: "FC > 100 bpm", options: [{ label: "Não", points: 0 }, { label: "Sim (+1,5)", points: 1.5 }] },
      { id: "imob", label: "Imobilização ≥ 3 dias ou cirurgia nas últimas 4 semanas", options: [{ label: "Não", points: 0 }, { label: "Sim (+1,5)", points: 1.5 }] },
      { id: "prev", label: "TVP/TEP prévios", options: [{ label: "Não", points: 0 }, { label: "Sim (+1,5)", points: 1.5 }] },
      { id: "hemo", label: "Hemoptise", options: [{ label: "Não", points: 0 }, { label: "Sim (+1)", points: 1 }] },
      { id: "ca", label: "Câncer ativo (tratamento < 6 meses ou paliativo)", options: [{ label: "Não", points: 0 }, { label: "Sim (+1)", points: 1 }] },
    ],
    interpret: (t) => t > 4
      ? { tone: "orange", label: "TEP PROVÁVEL (Wells > 4)", lines: ["AngioTC diretamente — NÃO solicitar D-dímero."] }
      : { tone: "green", label: "TEP IMPROVÁVEL (Wells ≤ 4)", lines: ["D-dímero: se negativo (ajustado à idade se > 50 anos) → TEP excluído; se positivo → AngioTC."] },
  },
  {
    kind: "score",
    id: "curb-65",
    name: "CURB-65",
    subtitle: "Gravidade da pneumonia (internação × ambulatório)",
    reference: "Lim WS et al. Thorax. 2003;58(5):377–382.",
    layout: "toggle",
    totalRange: "0–5",
    vars: [
      { id: "c", label: "Confusão mental (nova desorientação)", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "u", label: "Ureia > 43 mg/dL (BUN > 20)", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "r", label: "FR ≥ 30 rpm", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "b", label: "PA: PAS < 90 ou PAD ≤ 60 mmHg", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "age", label: "Idade ≥ 65 anos", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
    ],
    interpret: (t) => t >= 3
      ? { tone: "red", label: `CURB-65 ${t} — 15–40% mortalidade`, lines: ["Internação; UTI especialmente se ≥ 4."] }
      : t === 2 ? { tone: "orange", label: "CURB-65 2 — 9,2% mortalidade", lines: ["Internação hospitalar."] }
      : { tone: "green", label: `CURB-65 ${t} — < 3% mortalidade`, lines: ["Ambulatório (baixo risco)."] },
  },
  {
    kind: "score",
    id: "heart",
    name: "HEART Score",
    subtitle: "Risco de MACE em dor torácica",
    reference: "Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008;16(6):191–196 (escore original) · Backus BE et al. Crit Pathw Cardiol. 2010;9(3):164–169 (validação multicêntrica) · Backus BE et al. Int J Cardiol. 2013;168(3):2153–2158 (validação prospectiva).",
    layout: "radio",
    totalRange: "0–10",
    vars: [
      { id: "h", label: "História (características da dor)", options: [
        { label: "Levemente suspeita", points: 0 }, { label: "Moderadamente suspeita", points: 1 }, { label: "Altamente suspeita", points: 2 } ] },
      { id: "e", label: "ECG", options: [
        { label: "Normal", points: 0 }, { label: "Alteração inespecífica (BRE, HVE)", points: 1 }, { label: "Depressão de ST / inversão de T nova", points: 2 } ] },
      { id: "a", label: "Idade", options: [
        { label: "< 45 anos", points: 0 }, { label: "45–64 anos", points: 1 }, { label: "≥ 65 anos", points: 2 } ] },
      { id: "r", label: "Fatores de risco", options: [
        { label: "Nenhum", points: 0 }, { label: "1–2 fatores", points: 1 }, { label: "≥ 3 ou aterosclerose conhecida", points: 2 } ] },
      { id: "t", label: "Troponina inicial", options: [
        { label: "Normal (≤ LSR)", points: 0 }, { label: "1–3× LSR", points: 1 }, { label: "> 3× LSR", points: 2 } ] },
    ],
    interpret: (t) => t >= 7
      ? { tone: "red", label: `HEART ${t} — alto risco (MACE ~65%)`, lines: ["Internação + troponina seriada + coronariografia precoce."] }
      : t >= 4 ? { tone: "orange", label: `HEART ${t} — risco intermediário (MACE ~12%)`, lines: ["Observação + troponina seriada + teste não invasivo."] }
      : { tone: "green", label: `HEART ${t} — baixo risco (MACE 1,7%)`, lines: ["Alta precoce — acompanhamento ambulatorial."] },
    note: "MACE = infarto, revascularização urgente ou morte em 6 semanas.",
  },
  {
    kind: "score",
    id: "nihss",
    name: "NIHSS",
    subtitle: "Gravidade do AVC isquêmico",
    reference: "Brott T, Adams HP Jr, Olinger CP, et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864–870 (escala original) · Versão traduzida e adaptada para o Brasil por Octávio Marques Pontes-Neto, Neurologia HCFMRP-USP (conferida item a item).",
    layout: "radio",
    totalRange: "0–42",
    vars: [
      { id: "1a", label: "1a. Nível de consciência", options: [
        { label: "Alerta", points: 0 }, { label: "Sonolento (responsivo)", points: 1 }, { label: "Obnubilado", points: 2 }, { label: "Sem resposta", points: 3 } ] },
      { id: "1b", label: "1b. NC — perguntas (mês, idade)", help:
          "Afasia ou estupor que impede compreender as perguntas → 2. Impossibilidade de FALAR por intubação, trauma oral, disartria grave ou barreira de idioma → 1. Só vale a primeira resposta; não dar dica.",
        options: [
        { label: "Ambas corretas", points: 0 }, { label: "Uma correta", points: 1 }, { label: "Nenhuma", points: 2 } ] },
      { id: "1c", label: "1c. NC — comandos (olhos, mão)", help:
          "Vale a tentativa inequívoca não completada por fraqueza. Se não responde ao comando, demonstrar por pantomima. Só a primeira tentativa é registrada.",
        options: [
        { label: "Ambos corretos", points: 0 }, { label: "Um correto", points: 1 }, { label: "Nenhum", points: 2 } ] },
      { id: "2", label: "2. Movimentos oculares", options: [
        { label: "Normal", points: 0 }, { label: "Paralisia parcial", points: 1 }, { label: "Desvio forçado", points: 2 } ] },
      { id: "3", label: "3. Campos visuais", options: [
        { label: "Sem perda", points: 0 }, { label: "Hemianopsia parcial", points: 1 }, { label: "Hemianopsia completa", points: 2 }, { label: "Cegueira bilateral", points: 3 } ] },
      { id: "4", label: "4. Paralisia facial", options: [
        { label: "Normal", points: 0 }, { label: "Discreta", points: 1 }, { label: "Parcial", points: 2 }, { label: "Completa", points: 3 } ] },
      { id: "5a", label: "5a. Motor — braço ESQUERDO", help:
          "Braço a 90° sentado, ou 45° deitado, por 10 s. Começar pelo lado NÃO parético. Amputação ou fusão do ombro = não testável.",
        options: [
        { label: "Sem queda", points: 0 }, { label: "Queda < 10s", points: 1 }, { label: "Esforço contra gravidade", points: 2 }, { label: "Sem esforço", points: 3 }, { label: "Sem movimento", points: 4 } ] },
      { id: "5b", label: "5b. Motor — braço DIREITO", options: [
        { label: "Sem queda", points: 0 }, { label: "Queda < 10s", points: 1 }, { label: "Esforço contra gravidade", points: 2 }, { label: "Sem esforço", points: 3 }, { label: "Sem movimento", points: 4 } ] },
      { id: "6a", label: "6a. Motor — perna ESQUERDA", help:
          "Perna a 30°, sempre em decúbito dorsal, por 5 s. Começar pelo lado NÃO parético. Amputação ou fusão do quadril = não testável.",
        options: [
        { label: "Sem queda", points: 0 }, { label: "Queda < 5s", points: 1 }, { label: "Esforço contra gravidade", points: 2 }, { label: "Sem esforço", points: 3 }, { label: "Sem movimento", points: 4 } ] },
      { id: "6b", label: "6b. Motor — perna DIREITA", options: [
        { label: "Sem queda", points: 0 }, { label: "Queda < 5s", points: 1 }, { label: "Esforço contra gravidade", points: 2 }, { label: "Sem esforço", points: 3 }, { label: "Sem movimento", points: 4 } ] },
      { id: "7", label: "7. Ataxia de membros", help:
          "Só conta se for DESPROPORCIONAL à fraqueza. Considerar ausente em quem não compreende ou está hemiplégico.",
        options: [
        { label: "Ausente", points: 0 }, { label: "Um membro", points: 1 }, { label: "Dois membros", points: 2 } ] },
      { id: "8", label: "8. Sensibilidade", help:
          "Paciente em coma (item 1a = 3) recebe 2 obrigatoriamente. AVC de tronco com perda bilateral = 2. Quadriplégico sem resposta = 2. Estupor e afasia costumam ficar em 0 ou 1.",
        options: [
        { label: "Normal", points: 0 }, { label: "Perda leve", points: 1 }, { label: "Perda grave/ausente", points: 2 } ] },
      { id: "9", label: "9. Linguagem", help:
          "Paciente em coma (item 1a = 3) recebe 3 obrigatoriamente. O 3 é reservado a quem está mudo e não segue nenhum comando simples. Intubado deve ser incentivado a escrever.",
        options: [
        { label: "Normal", points: 0 }, { label: "Afasia leve", points: 1 }, { label: "Afasia grave", points: 2 }, { label: "Mudo/afasia global", points: 3 } ] },
      { id: "10", label: "10. Disartria", help:
          "Só é não testável se houver intubação ou outra barreira física. Não dizer ao paciente por que ele está sendo testado.",
        options: [
        { label: "Normal", points: 0 }, { label: "Discreta a moderada", points: 1 }, { label: "Grave/intubado", points: 2 } ] },
      { id: "11", label: "11. Extinção/desatenção", help:
          "Como só pontua se estiver presente, este item NUNCA é não testável.",
        options: [
        { label: "Sem anormalidade", points: 0 }, { label: "Extinção 1 modalidade", points: 1 }, { label: "Hemi-inatenção grave", points: 2 } ] },
    ],
    // R-19 — esta faixa DESCREVE gravidade e não indica conduta. A indicação de
    // reperfusão sai de incapacitância + janela + contraindicações, e esta tela
    // não pergunta nenhuma das três. O módulo AVC pergunta as três.
    //
    // O rótulo vem de `faixaNihss` (avc/nihss.ts), fonte única com o AVC como
    // dono — antes eram duas classificações divergentes do mesmo escore.
    interpret: (t) => {
      const f = faixaNihss(t);
      return {
        tone: f.tone,
        label: `NIHSS ${t} — ${f.rotulo}`,
        lines: [NIHSS_SEM_INDICACAO],
      };
    },
    note: "Atenção à LATERALIDADE: na escala padrão 5a e 6a são o lado ESQUERDO e 5b e 6b o DIREITO — inverter isso troca o hemisfério ao passar o caso adiante. Itens não testáveis (amputação, fusão articular, intubação) não são pontuados nesta tela; registre a ressalva por escrito.",
  },
  {
    kind: "score",
    id: "rass",
    name: "RASS",
    subtitle: "Richmond Agitation-Sedation Scale",
    reference: "Sessler CN et al. Am J Respir Crit Care Med. 2002;166(10):1338–1344.",
    layout: "radio",
    totalRange: "−5 a +4",
    vars: [
      { id: "rass", label: "Nível observado", options: [
        { label: "+4 Combativo", points: 4 },
        { label: "+3 Muito agitado", points: 3 },
        { label: "+2 Agitado", points: 2 },
        { label: "+1 Inquieto", points: 1 },
        { label: "0 Alerta e calmo", points: 0 },
        { label: "−1 Sonolento", points: -1 },
        { label: "−2 Sedação leve", points: -2 },
        { label: "−3 Sedação moderada", points: -3 },
        { label: "−4 Sedação profunda", points: -4 },
        { label: "−5 Não desperta", points: -5 },
      ] },
    ],
    interpret: (t) =>
      t >= 2 ? { tone: "red", label: "RASS +2 a +4 — agitação", lines: ["Aumentar sedação/analgesia; tratar a causa. +4: contenção + sedação urgente."] }
      : t === 1 ? { tone: "yellow", label: "RASS +1 — inquieto", lines: ["Analgésico / sedação leve."] }
      : t === 0 ? { tone: "green", label: "RASS 0 — alerta e calmo", lines: ["Estado ideal — manter e monitorar."] }
      : t >= -2 ? { tone: "green", label: "RASS −1 a −2 — sedação leve", lines: ["Meta padrão em VM (bundle ABCDEF). −1: ideal no desmame."] }
      : t === -3 ? { tone: "yellow", label: "RASS −3 — sedação moderada", lines: ["Indicado em procedimentos / SARA."] }
      : t === -4 ? { tone: "orange", label: "RASS −4 — sedação profunda", lines: ["Evitar de rotina — risco de PICS e mais dias de VM."] }
      : { tone: "red", label: "RASS −5 — não desperta", lines: ["Coma — investigar causa; reduzir sedação se excessiva."] },
    note: "Meta padrão em VM: RASS −1 a −2 (PADIS 2018). Avaliar: agitado → +1 a +4; calmo → chamar pelo nome (−1/0); sem resposta à voz → estímulo físico (−3/−4); sem resposta → −5.",
  },
  {
    kind: "formula",
    id: "apache2",
    name: "APACHE II",
    subtitle: "Gravidade e mortalidade estimada em UTI",
    reference: "Knaus WA et al. Crit Care Med. 1985;13(10):818–829.",
    inputs: [
      { id: "temp", label: "Temperatura", unit: "°C", kind: "number", placeholder: "ex: 37" },
      { id: "pam", label: "PAM", unit: "mmHg", kind: "number", placeholder: "ex: 80" },
      { id: "fc", label: "FC", unit: "bpm", kind: "number", placeholder: "ex: 90" },
      { id: "fr", label: "FR", unit: "rpm", kind: "number", placeholder: "ex: 18" },
      { id: "fio2high", label: "FiO₂ ≥ 0,5?", kind: "toggle", options: [{ label: "Não (usar PaO₂)", value: "nao" }, { label: "Sim (usar A-aDO₂)", value: "sim" }] },
      { id: "pao2", label: "PaO₂ (se FiO₂ < 0,5)", unit: "mmHg", kind: "number", optional: true },
      { id: "aado2", label: "A-aDO₂ (se FiO₂ ≥ 0,5)", unit: "mmHg", kind: "number", optional: true },
      { id: "ph", label: "pH arterial", kind: "number", placeholder: "ex: 7,40" },
      { id: "na", label: "Sódio", unit: "mEq/L", kind: "number", placeholder: "ex: 140" },
      { id: "k", label: "Potássio", unit: "mEq/L", kind: "number", placeholder: "ex: 4" },
      { id: "cr", label: "Creatinina", unit: "mg/dL", kind: "number", placeholder: "ex: 1,0" },
      { id: "ira", label: "Insuficiência renal aguda?", kind: "toggle", options: [{ label: "Não", value: "nao" }, { label: "Sim (dobra Cr)", value: "sim" }] },
      { id: "ht", label: "Hematócrito", unit: "%", kind: "number", placeholder: "ex: 40" },
      { id: "leuco", label: "Leucócitos", unit: "×10³/mm³", kind: "number", placeholder: "ex: 10" },
      { id: "gcs", label: "Glasgow (GCS)", kind: "number", placeholder: "3–15" },
      { id: "idade", label: "Idade", unit: "anos", kind: "number", placeholder: "ex: 60" },
      { id: "cronica", label: "Doença crônica grave", kind: "toggle", options: [{ label: "Nenhuma", value: "0" }, { label: "Cirurgia eletiva (+2)", value: "2" }, { label: "Emergência/clínico (+5)", value: "5" }] },
    ],
    compute: (v) => {
      const n = (k: string) => { const x = parseFloat((v[k] ?? "").replace(",", ".")); return Number.isFinite(x) ? x : null; };
      const temp = n("temp"), pam = n("pam"), fc = n("fc"), fr = n("fr"), ph = n("ph"), na = n("na"), k = n("k"), cr = n("cr"), ht = n("ht"), leuco = n("leuco"), gcs = n("gcs"), idade = n("idade");
      if ([temp, pam, fc, fr, ph, na, k, cr, ht, leuco, gcs, idade].some((x) => x == null)) return null;
      const T = temp!, PAM = pam!, FC = fc!, FR = fr!, PH = ph!, NA = na!, K = k!, CR = cr!, HT = ht!, LE = leuco!, GCS = gcs!, AGE = idade!;
      const pTemp = T >= 41 ? 4 : T >= 39 ? 3 : T >= 38.5 ? 1 : T >= 36 ? 0 : T >= 34 ? 1 : T >= 32 ? 2 : T >= 30 ? 3 : 4;
      const pPam = PAM >= 160 ? 4 : PAM >= 130 ? 3 : PAM >= 110 ? 2 : PAM >= 70 ? 0 : PAM >= 50 ? 2 : 4;
      const pFc = FC >= 180 ? 4 : FC >= 140 ? 3 : FC >= 110 ? 2 : FC >= 70 ? 0 : FC >= 55 ? 2 : FC >= 40 ? 3 : 4;
      const pFr = FR >= 50 ? 4 : FR >= 35 ? 3 : FR >= 25 ? 1 : FR >= 12 ? 0 : FR >= 10 ? 1 : FR >= 6 ? 2 : 4;
      let pOxi = 0;
      if (v.fio2high === "sim") { const a = n("aado2"); if (a == null) return null; pOxi = a >= 500 ? 4 : a >= 350 ? 3 : a >= 200 ? 2 : 0; }
      else { const p = n("pao2"); if (p == null) return null; pOxi = p > 70 ? 0 : p >= 61 ? 1 : p >= 55 ? 3 : 4; }
      const pPh = PH >= 7.7 ? 4 : PH >= 7.6 ? 3 : PH >= 7.5 ? 1 : PH >= 7.33 ? 0 : PH >= 7.25 ? 2 : PH >= 7.15 ? 3 : 4;
      const pNa = NA >= 180 ? 4 : NA >= 160 ? 3 : NA >= 155 ? 2 : NA >= 150 ? 1 : NA >= 130 ? 0 : NA >= 120 ? 2 : NA >= 111 ? 3 : 4;
      const pK = K >= 7 ? 4 : K >= 6 ? 3 : K >= 5.5 ? 1 : K >= 3.5 ? 0 : K >= 3 ? 1 : K >= 2.5 ? 2 : 4;
      const pCrBase = CR >= 3.5 ? 4 : CR >= 2 ? 3 : CR >= 1.5 ? 2 : CR >= 0.6 ? 0 : 2;
      const pCr = pCrBase * (v.ira === "sim" ? 2 : 1);
      const pHt = HT >= 60 ? 4 : HT >= 50 ? 2 : HT >= 46 ? 1 : HT >= 30 ? 0 : HT >= 20 ? 2 : 4;
      const pLe = LE >= 40 ? 4 : LE >= 20 ? 2 : LE >= 15 ? 1 : LE >= 3 ? 0 : LE >= 1 ? 2 : 4;
      // Sem esta guarda, o Glasgow entrava sem limite: digitar 0 (erro comum de
      // quem entende "0" como "não avaliado") somava 15 pontos em vez dos 12 do
      // Glasgow 3, e um negativo por engano de teclado gerava escore absurdo.
      // O máximo teórico do APACHE II passava de 71 para 94 na varredura.
      const gcsValido = numNaFaixa(v.gcs, ...FAIXA.glasgow);
      if (gcsValido == null) return null;
      const pGcs = Math.max(0, 15 - gcsValido);
      const pAge = AGE < 45 ? 0 : AGE < 55 ? 2 : AGE < 65 ? 3 : AGE < 75 ? 5 : 6;
      const pCron = parseInt(v.cronica ?? "0", 10) || 0;
      const total = pTemp + pPam + pFc + pFr + pOxi + pPh + pNa + pK + pCr + pHt + pLe + pGcs + pAge + pCron;
      const mort = total < 5 ? "~2%" : total < 10 ? "~8%" : total < 15 ? "~15%" : total < 20 ? "~25%" : total < 25 ? "~40%" : total < 30 ? "~55%" : total < 35 ? "~73%" : "> 85%";
      const tone: Tone = total >= 25 ? "red" : total >= 15 ? "orange" : total >= 10 ? "yellow" : "green";
      return {
        metrics: [
          { label: "APACHE II total", value: `${total} pontos`, highlight: true },
          { label: "Mortalidade hospitalar estimada", value: mort },
          { label: "Componente agudo (12 variáveis)", value: `${pTemp + pPam + pFc + pFr + pOxi + pPh + pNa + pK + pCr + pHt + pLe + pGcs}` },
          { label: "Idade + doença crônica", value: `${pAge + pCron}` },
        ],
        interpret: { tone, label: `APACHE II ${total} — mortalidade estimada ${mort}` },
        tables: [{ title: "Observação", rows: [
          { k: "Quando calcular", v: "Nas PRIMEIRAS 24 h de internação na UTI, usando os PIORES valores do período (ou, por praticidade, os da admissão). Calcular fora dessa janela descaracteriza o escore." },
          { k: "Não recalcular", v: "O APACHE II é pontual, da admissão. NÃO deve ser recalculado em série para acompanhar melhora ou piora durante a internação." },
          { k: "Uso", v: "Comparação de populações e triagem de UTI. NÃO usar isoladamente para limitação de suporte." },
          { k: "Regra geral", v: "Índices prognósticos NÃO devem ser usados para avaliação individual de paciente. Servem para descrever gravidade de população, comparar braços de estudo e alocar recursos." },
          { k: "Viés temporal", v: "O APACHE II é de 1985. Monitorização e tratamento mudaram desde então, e seu uso para avaliar qualidade assistencial é desencorajado." },
        ] }],
      };
    },
    alert: ["Preencher todas as variáveis (escolher PaO₂ ou A-aDO₂ conforme a FiO₂). Mortalidade é estimativa por faixa (equação completa do artigo original)."],
  },
  {
    kind: "formula",
    id: "saps3",
    name: "SAPS 3",
    subtitle: "Gravidade na admissão em UTI — 20 variáveis",
    reference:
      "Moreno RP, Metnitz PGH, Almeida E, et al.; SAPS 3 Investigators. SAPS 3 — From evaluation of the patient to evaluation of the intensive care unit. Part 2: Development of a prognostic model for hospital mortality at ICU admission. Intensive Care Med. 2005 Oct;31(10):1345–1355 (PMID 16132892). Folha de pontuação transcrita em protocols/saps3-scoresheet.md.",
    inputs: [
      // ── Caixa I ──
      { id: "idade", label: "Idade", unit: "anos", kind: "number", placeholder: "ex: 60" },
      { id: "cQuimio", label: "Quimio/radio/corticoide/imunossupressão", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+3)", value: "3" }] },
      { id: "cIcc", label: "ICC classe IV (NYHA)", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+6)", value: "6" }] },
      { id: "cHemato", label: "Neoplasia hematológica", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+6)", value: "6" }] },
      { id: "cCirrose", label: "Cirrose", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+8)", value: "8" }] },
      { id: "cAids", label: "AIDS", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+8)", value: "8" }] },
      { id: "cCancer", label: "Câncer metastático", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+11)", value: "11" }] },
      { id: "losDias", label: "Dias de hospital ANTES da UTI", unit: "dias", kind: "number", placeholder: "ex: 2" },
      { id: "local", label: "Local antes da UTI", kind: "toggle", options: [
        { label: "Centro cirúrgico / recuperação (0)", value: "0" }, { label: "Emergência (+5)", value: "5" }, { label: "Outra UTI (+7)", value: "7" }, { label: "Enfermaria / outro (+8)", value: "8" } ] },
      { id: "vaso", label: "Droga vasoativa antes da UTI", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+3)", value: "3" }] },

      // ── Caixa II ──
      { id: "planejada", label: "Admissão", kind: "toggle", options: [{ label: "Planejada (0)", value: "0" }, { label: "NÃO planejada (+3)", value: "3" }] },
      { id: "cirurgico", label: "Status cirúrgico", kind: "toggle", options: [
        { label: "Cirurgia programada (0)", value: "0" }, { label: "Não operado (+5)", value: "5" }, { label: "Cirurgia de emergência (+6)", value: "6" } ] },
      { id: "infNoso", label: "Infecção nosocomial", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+4)", value: "4" }] },
      { id: "infResp", label: "Infecção respiratória", kind: "toggle", options: [{ label: "Não", value: "0" }, { label: "Sim (+5)", value: "5" }] },
      { id: "motivo", label: "Motivo predominante da admissão", kind: "toggle", options: [
        { label: "Distúrbio de ritmo (−5)", value: "-5" },
        { label: "Convulsões (−4)", value: "-4" },
        { label: "Outros (0)", value: "0" },
        { label: "Choque hipovolêmico / abdome agudo (+3)", value: "3" },
        { label: "Coma, torpor, confusão, agitação (+4)", value: "4" },
        { label: "Choque séptico / anafilático / misto (+5)", value: "5" },
        { label: "Falência hepática (+6)", value: "6" },
        { label: "Déficit neurológico focal (+7)", value: "7" },
        { label: "Pancreatite grave (+9)", value: "9" },
        { label: "Efeito de massa intracraniano (+10)", value: "10" } ] },
      { id: "sitio", label: "Sítio da cirurgia", kind: "toggle", options: [
        { label: "Transplante (−11)", value: "-11" },
        { label: "Trauma isolado ou múltiplo (−8)", value: "-8" },
        { label: "Revascularização sem troca valvar (−6)", value: "-6" },
        { label: "Não cirúrgico / outros (0)", value: "0" },
        { label: "Neurocirurgia por AVC (+5)", value: "5" } ] },

      // ── Caixa III ──
      { id: "gcs", label: "Glasgow (menor)", kind: "number", placeholder: "3–15" },
      { id: "bili", label: "Bilirrubina total (maior)", unit: "mg/dL", kind: "number", placeholder: "ex: 1,0" },
      { id: "temp", label: "Temperatura (maior)", unit: "°C", kind: "number", placeholder: "ex: 37" },
      { id: "cr", label: "Creatinina (maior)", unit: "mg/dL", kind: "number", placeholder: "ex: 1,0" },
      { id: "fc", label: "Frequência cardíaca (maior)", unit: "bpm", kind: "number", placeholder: "ex: 90" },
      { id: "leuco", label: "Leucócitos (maior)", unit: "×10³/mm³", kind: "number", placeholder: "ex: 10" },
      { id: "ph", label: "pH (menor)", kind: "number", placeholder: "ex: 7,40" },
      { id: "plaq", label: "Plaquetas (menor)", unit: "×10³/mm³", kind: "number", placeholder: "ex: 200" },
      { id: "pas", label: "PA sistólica (menor)", unit: "mmHg", kind: "number", placeholder: "ex: 120" },
      { id: "vm", label: "Em ventilação mecânica?", kind: "toggle", options: [{ label: "Não", value: "nao" }, { label: "Sim", value: "sim" }] },
      { id: "pao2", label: "PaO₂", unit: "mmHg", kind: "number", placeholder: "ex: 90" },
      { id: "fio2", label: "FiO₂ (se em VM)", unit: "%", kind: "number", optional: true, placeholder: "ex: 40" },
    ],
    alert: [
      "Colher as variáveis fisiológicas em até 1 HORA da admissão na UTI, usando os piores valores (ou os melhores, quando a tabela pede o maior/menor).",
      "MOTIVO DA ADMISSÃO: o artigo permite somar mais de um motivo. Esta tela usa o motivo PREDOMINANTE — se houver mais de um, o escore real é maior.",
      "Índice prognóstico é populacional. NÃO usar para decidir conduta em paciente individual.",
    ],
    compute: (v) => {
      const n = (k: string) => { const x = parseFloat((v[k] ?? "").replace(",", ".")); return Number.isFinite(x) ? x : null; };
      const tog = (k: string) => { const x = parseInt(v[k] ?? "", 10); return Number.isFinite(x) ? x : null; };

      const idade = numNaFaixa(v.idade, ...FAIXA.idadeAnos);
      const gcs = numNaFaixa(v.gcs, 3, 15);
      const los = n("losDias"), bili = n("bili"), temp = n("temp"), cr = n("cr");
      const fc = n("fc"), leuco = n("leuco"), ph = n("ph"), plaq = n("plaq"), pas = n("pas"), pao2 = n("pao2");
      const emVm = v.vm === "sim";
      if ([idade, gcs, los, bili, temp, cr, fc, leuco, ph, plaq, pas, pao2].some((x) => x == null)) return null;
      const motivo = tog("motivo"), sitio = tog("sitio");
      if (motivo == null || sitio == null || !v.local || !v.cirurgico || !v.planejada || !v.vm) return null;

      // Caixa I
      const pIdade = idade! < 40 ? 0 : idade! < 60 ? 5 : idade! < 70 ? 9 : idade! < 75 ? 13 : idade! < 80 ? 15 : 18;
      const pComorb = ["cQuimio", "cIcc", "cHemato", "cCirrose", "cAids", "cCancer"]
        .reduce((soma, k) => soma + (parseInt(v[k] ?? "0", 10) || 0), 0);
      const pLos = los! < 14 ? 0 : los! < 28 ? 6 : 7;
      const pLocal = parseInt(v.local, 10) || 0;
      const pVaso = parseInt(v.vaso ?? "0", 10) || 0;

      // Caixa II — offset obrigatório de 16 pontos (nota 12 da Tabela 2)
      const OFFSET = 16;
      const pPlanejada = parseInt(v.planejada, 10) || 0;
      const pCirurgico = parseInt(v.cirurgico, 10) || 0;
      const pInf = (parseInt(v.infNoso ?? "0", 10) || 0) + (parseInt(v.infResp ?? "0", 10) || 0);

      // Caixa III
      const pGcs = gcs! <= 4 ? 15 : gcs! === 5 ? 10 : gcs! === 6 ? 7 : gcs! <= 12 ? 2 : 0;
      const pBili = bili! < 2 ? 0 : bili! < 6 ? 4 : 5;
      const pTemp = temp! < 35 ? 7 : 0;
      const pCr = cr! < 1.2 ? 0 : cr! < 2 ? 2 : cr! < 3.5 ? 7 : 8;
      const pFc = fc! < 120 ? 0 : fc! < 160 ? 5 : 7;
      const pLeuco = leuco! < 15 ? 0 : 2;
      const pPh = ph! <= 7.25 ? 3 : 0;
      const pPlaq = plaq! < 20 ? 13 : plaq! < 50 ? 8 : plaq! < 100 ? 5 : 0;
      const pPas = pas! < 40 ? 11 : pas! < 70 ? 8 : pas! < 120 ? 3 : 0;
      let pOxi: number;
      if (emVm) {
        const fio2 = n("fio2");
        if (fio2 == null || fio2 <= 0) return null;
        const pf = pao2! / (fio2 > 1 ? fio2 / 100 : fio2);
        pOxi = pf < 100 ? 11 : 7;
      } else {
        pOxi = pao2! < 60 ? 5 : 0;
      }

      const total =
        OFFSET + pIdade + pComorb + pLos + pLocal + pVaso +
        pPlanejada + pCirurgico + pInf + motivo! + sitio! +
        pGcs + pBili + pTemp + pCr + pFc + pLeuco + pPh + pPlaq + pPas + pOxi;

      const logit = -32.6659 + Math.log(total + 20.5958) * 7.3068;
      const mort = (Math.exp(logit) / (1 + Math.exp(logit))) * 100;
      const tone: Tone = mort >= 50 ? "red" : mort >= 25 ? "orange" : mort >= 10 ? "yellow" : "green";

      return {
        metrics: [
          { label: "SAPS 3", value: `${total} pontos`, highlight: true },
          { label: "Mortalidade hospitalar prevista (equação GLOBAL)", value: `${(Math.round(mort * 10) / 10).toString().replace(".", ",")}%` },
          { label: "Caixa I — antes da internação", value: `${pIdade + pComorb + pLos + pLocal + pVaso}` },
          { label: "Caixa II — admissão (inclui offset 16)", value: `${OFFSET + pPlanejada + pCirurgico + pInf + motivo! + sitio!}` },
          { label: "Caixa III — fisiologia", value: `${pGcs + pBili + pTemp + pCr + pFc + pLeuco + pPh + pPlaq + pPas + pOxi}` },
        ],
        interpret: { tone, label: `SAPS 3 ${total} — mortalidade prevista ~${Math.round(mort)}% (equação global)` },
        tables: [{ title: "Como ler", rows: [
          { k: "⚠️ Equação global subestima aqui", v: "O artigo mede razão observado/esperado de 1,30 (IC 1,23–1,37) para América Central e do Sul — o pior desempenho entre todas as regiões. A mortalidade real na nossa região tende a ser MAIOR que a prevista. Existe equação regional customizada (Tabela 5 do artigo), ainda não implementada." },
          { k: "Offset de 16", v: "Todo paciente admitido recebe 16 pontos por definição do modelo. É o que permite ao escore ter mínimo 0 apesar dos pesos negativos (transplante −11, distúrbio de ritmo −5)." },
          { k: "Referência da coorte", v: "Nos 16.784 pacientes do estudo: mínimo 5, máximo 124, média 49,9 ± 16,6, mediana 48 (38–60). Faixa teórica 0–217." },
          { k: "Uso", v: "Índices prognósticos NÃO servem para avaliação individual. A razão entre mortalidade observada e esperada (SMR) compara UTIs, mas depende do case mix e das políticas de fim de vida." },
        ] }],
      };
    },
  },
  {
    kind: "formula",
    id: "dose-antibiotico",
    name: "Dose de antibiótico (TFG)",
    subtitle: "Vancomicina · Pip-tazo · Meropeném por função renal",
    reference: "ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022.",
    inputs: [
      { id: "farmaco", label: "Antibiótico", kind: "toggle", options: [
        { label: "Vancomicina", value: "vanco" }, { label: "Pip-tazo", value: "piptazo" }, { label: "Meropeném", value: "meropenem" } ] },
      { id: "peso", label: "Peso (real)", unit: "kg", kind: "number", placeholder: "ex: 70" },
      { id: "tfg", label: "ClCr / TFG", unit: "mL/min", kind: "number", placeholder: "ex: 80" },
    ],
    compute: (v) => {
      const peso = parseFloat((v.peso ?? "").replace(",", ".")); const tfg = parseFloat((v.tfg ?? "").replace(",", "."));
      const f = v.farmaco ?? "vanco";
      if (!Number.isFinite(tfg)) return null;
      const r0 = (x: number) => Math.round(x).toString();
      if (f === "vanco") {
        if (!Number.isFinite(peso) || peso <= 0) return null;
        const loadLo = r0(Math.min(25 * peso, 3000)), loadHi = r0(Math.min(30 * peso, 3000));
        const band = tfg > 90 ? { d: "15–20 mg/kg", i: "8/8h" } : tfg >= 60 ? { d: "15–20 mg/kg", i: "12/12h" } : tfg >= 40 ? { d: "10–15 mg/kg", i: "12/12h" } : tfg >= 20 ? { d: "10–15 mg/kg", i: "24/24h" } : { d: "10–15 mg/kg", i: "48/48h ou por nível" };
        const mLo = r0(parseFloat(band.d) * peso), mHi = r0((band.d.includes("15–20") ? 20 : 15) * peso);
        return {
          metrics: [
            { label: "Dose de ataque (peso real)", value: `${loadLo}–${loadHi} mg (25–30 mg/kg, máx 3 g)`, highlight: true },
            { label: `Manutenção (ClCr ${r0(tfg)})`, value: `${mLo}–${mHi} mg ${band.i}` },
          ],
          interpret: { tone: tfg < 20 ? "orange" : "green", label: `Vancomicina — ${band.d} ${band.i}` },
          tables: [{ title: "Monitorização", rows: [
            { k: "Alvo", v: "AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível." },
            { k: "Infusão", v: "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho." },
            { k: "Hemodiálise", v: "15–20 mg/kg após a sessão; dosar nível pré-diálise." },
          ] }],
        };
      }
      if (f === "piptazo") {
        const band = tfg > 40 ? "4,5 g IV 6/6h (Pseudomonas: infusão estendida 4 h)" : tfg >= 20 ? "4,5 g IV 8/8h" : "2,25 g IV 8/8h (HD: 2,25 g 12/12h + 0,75 g pós-diálise)";
        return {
          metrics: [{ label: `Pip-tazo (ClCr ${r0(tfg)})`, value: band, highlight: true }],
          interpret: { tone: tfg < 20 ? "orange" : "green", label: "Piperacilina-tazobactam" },
          tables: [{ title: "Infusão estendida (Pseudomonas)", rows: [{ k: "PK/PD", v: "4,5 g em 250 mL SF → infundir em 4 h (maximiza tempo > MIC)." }] }],
        };
      }
      // meropenem
      const band = tfg > 50 ? "1 g IV 8/8h (MDR: 2 g 8/8h infusão 3 h; meningite: 2 g 8/8h)" : tfg >= 25 ? "1 g IV 12/12h (MDR/meningite: 2 g 12/12h)" : tfg >= 10 ? "500 mg–1 g IV 12/12h (MDR/meningite: 1 g 12/12h)" : "500 mg IV 24/24h (MDR/meningite: 1 g 24/24h)";
      return {
        metrics: [{ label: `Meropeném (ClCr ${r0(tfg)})`, value: band, highlight: true }],
        interpret: { tone: tfg < 25 ? "orange" : "green", label: "Meropeném" },
        tables: [{ title: "Infusão estendida (MDR)", rows: [{ k: "PK/PD", v: "2 g em 100 mL SF → infundir em 3 h." }] }],
      };
    },
    alert: ["Valores orientativos — confirmar com farmacêutico clínico e bula. Vancomicina: ataque pelo PESO REAL; ajustar manutenção por nível/AUC e função renal."],
  },
];

export const CALC_GROUPS: { kind: CalcKind; label: string }[] = [
  { kind: "formula", label: "Calculadoras" },
  { kind: "score", label: "Escores" },
];

// ─── ClinicalEngine stub ─────────────────────────────────────────────────────

const PROTOCOL_ID = "calculadoras_clinicas";
const STATIC_STATE: ProtocolState = { type: "action", text: "Calculadoras clínicas" };

function consumeEffects(): EngineEffect[] { return []; }
function getClinicalLog(): ClinicalLogEntry[] { return []; }
function getCurrentState(): ProtocolState { return STATIC_STATE; }
function getCurrentStateId(): string { return "calc_inicio"; }
function getDocumentationActions(): DocumentationAction[] { return []; }
function getEncounterReportHtml(): string { return ""; }
function getEncounterSummary(): EncounterSummary {
  return {
    protocolId: PROTOCOL_ID, durationLabel: "Calculadora", currentStateId: "calc_inicio",
    currentStateText: "Calculadoras clínicas", shockCount: 0, adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0, antiarrhythmicSuggestedCount: 0, antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [], addressedCauses: [], lastEvents: [],
  };
}
function getEncounterSummaryText(): string { return "Calculadoras clínicas e escores de gravidade."; }
function getReversibleCauses(): ReversibleCause[] { return []; }
function getTimers(): TimerState[] { return []; }
function next(): ProtocolState { return STATIC_STATE; }
function registerExecution(): ClinicalLogEntry[] { return []; }
function resetSession(): ProtocolState { return STATIC_STATE; }
function tick(): ProtocolState { return STATIC_STATE; }
function updateReversibleCauseStatus(): ReversibleCause[] { return []; }

export {
  consumeEffects, getClinicalLog, getCurrentState, getCurrentStateId, getDocumentationActions,
  getEncounterReportHtml, getEncounterSummary, getEncounterSummaryText, getReversibleCauses,
  getTimers, next, registerExecution, resetSession, tick, updateReversibleCauseStatus,
};
export type { ClinicalEngine };
