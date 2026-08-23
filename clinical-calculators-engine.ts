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
// Glasgow e RASS descrevem gravidade; quem INDICA conduta é o módulo dono
// (R-19). A frase vive lá e é consumida aqui.
import { GLASGOW_AVALIAR_VIA_AEREA } from "./rsi-decision-tree";
import { RASS_AGITACAO_PROCURAR_CAUSA, RASS_NAO_DESPERTA, SEDACAO_ABAIXO_DA_META } from "./sedation-engine";
import { QSOFA_PAPEL_APOS_SSC_2026, UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65 } from "./lib/escores-limites";
import { OSM_EFETIVA_EHH, OSM_EFETIVA_NORMAL, OSM_EFETIVA_VS_TOTAL } from "./lib/osmolalidade";
import { ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART } from "./coronary-decision-tree";
import { ANGIOTC_QUANDO_NAO_DA } from "./tep-decision-tree";
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
import { baseDe, CATALOGO_DE_ANTIMICROBIANOS, doseUsualDerivada, faixaPara, textoDaDose } from "./lib/antimicrobianos/catalogo";
import {
  AG_BAIXO,
  AG_ELEVADO_CAUSAS,
  AG_FATOR_ROTULO,
  AG_LABORATORIO_PREVALECE,
  calcularAG,
  textoDaFormula,
  AG_NA_FAIXA,
  AG_SEM_ALBUMINA,
  AG_SEM_ALBUMINA_PORQUE,
  CORTE_AG,
  FATOR_ALBUMINA,
} from "./lib/anion-gap";
import type { DoseEstruturada, LinhaRenal } from "./lib/antimicrobianos/tipos";
import { ataqueVancomicinaMg } from "./lib/dose-antibiotico-renal";

/**
 * Textos de interpretação do Glasgow e do RASS que NÃO carregam decisão de
 * outro módulo — descrevem o nível e param aqui.
 *
 * Vivem como constantes nomeadas, e não inline, porque `test:calculadoras`
 * proíbe literal dentro de `lines:` nestas três ferramentas (Glasgow, RASS,
 * NIHSS). A proibição é ESTRUTURAL de propósito: uma lista de verbos proibidos
 * seria regra dependente de vocabulário enumerado (R-8) e a próxima frase usaria
 * um verbo fora da lista. Sem literal inline, não há onde escrever conduta sem
 * que a trava veja.
 */
const GLASGOW_LEVE = "Monitorar — pode indicar disfunção.";
const GLASGOW_MODERADO = "Vigilância contínua — risco de deterioração.";
const RASS_ALVO = "Estado ideal — manter e monitorar.";
const RASS_DENTRO_DA_META = "Dentro da meta padrão de sedação leve em VM (RASS −2 a 0, PADIS 2018).";

/** CURB-65 escore 2 — enquadrado, porque a publicação não dá o valor pontual. */
const CURB65_ESCORE_2 =
  "mortalidade em 30 dias entre 3,2% (escore 1) e 17% (escore 3); valor pontual não confirmado na publicação primária";

/** SOFA ≥ 2 com infecção — o único número que vem da Sepsis-3. */
const SOFA_SEPSE = "SOFA ≥ 2 com infecção suspeita ou confirmada = SEPSE (Sepsis-3, 2016), mortalidade hospitalar em torno de 10%.";

/**
 * O que o SOFA prediz, e por que um número só engana.
 *
 * Literal sem interpolação: template com `${}` sai da varredura de tradução.
 */
const SOFA_DEPENDE_DA_TENDENCIA =
  "⚠️ A mortalidade depende de o escore CAIR ou NÃO nas primeiras 48 h — não do valor de hoje. Ferreira 2001, escore que NÃO cai (aumenta ou fica igual): inicial 2–7 → 37%; 8–11 → 60%; acima de 11 → 91%. Escore que CAI em 48 h, para qualquer valor até 11 → 6% ou menos. O mesmo SOFA 10 vale dez vezes mais ou dez vezes menos conforme a trajetória, e sem a SEGUNDA medida nenhuma destas estimativas se aplica.";

/**
 * ── ClCr ABSOLUTO × TFG INDEXADA ────────────────────────────────────────────
 *
 * Mesmo mecanismo do ureia × BUN: o número é plausível, a MEDIDA é outra.
 *
 * A ferramenta de Clearance/TFG, na mesma tela, devolve as duas — CKD-EPI em
 * mL/min/1,73 m² (indexada a uma superfície padrão) e Cockcroft-Gault em mL/min
 * (absoluta, do paciente real). O campo de dose aceitava qualquer uma sob o
 * rótulo "ClCr / TFG", e elas divergem tanto mais quanto o paciente se afasta da
 * superfície padrão.
 */
/**
 * ⚠️ AS DOSES VÊM DO CATÁLOGO, E ESTA É A ÚNICA CÓPIA (D-75 · R-95).
 *
 * Elas moravam em ternários aqui dentro E no catálogo, desde que a estrutura
 * nasceu — duas cópias das mesmas faixas, que é o mecanismo pelo qual duas partes
 * do app divergem. E não era hipótese: as duas JÁ diferiam no texto do meropeném.
 * Agora o motor não sabe clínica nenhuma: ele lê `lib/antimicrobianos/catalogo.ts`
 * e formata.
 */
const DEPENDE_DE = "a dose depende de:";

const CLCR_PARA_DOSE =
  "Informar o clearance ABSOLUTO em mL/min (Cockcroft-Gault), não a TFG indexada em mL/min/1,73 m² (CKD-EPI). São medidas diferentes: a indexada corrige para uma superfície corporal padrão e serve para estadiar doença renal; a absoluta é a do paciente que está na frente, e é a que os estudos de ajuste de dose usaram. No obeso e no caquético as duas se separam bastante. A ferramenta Clearance/TFG desta mesma tela devolve as duas, rotuladas.";

/**
 * O peso do Cockcroft-Gault, e por que a tela não escolhe por você.
 *
 * A fórmula não é repetida aqui: a ferramenta de peso predito está na mesma
 * tela e é a dona dela (R-12).
 */
const PESO_NO_COCKCROFT =
  "Só o Cockcroft-Gault usa peso — o CKD-EPI não. No obeso o peso REAL superestima o clearance, porque a gordura não filtra: a prática usual é usar peso ideal, ou peso ajustado quando o IMC é muito alto. A ferramenta \"Peso predito\" desta mesma tela calcula o peso ideal a partir de sexo e altura. Qual peso usar é escolha clínica declarada, e por isso este campo não decide por você.";

/** Linhas das faixas que ficam — desfecho validado da própria ferramenta. */
const CURB_AMBULATORIO = "Ambulatório (baixo risco).";
const CURB_INTERNACAO = "Internação hospitalar.";
const HEART_ALTA = "Alta precoce — acompanhamento ambulatorial.";
const HEART_OBSERVACAO = "Observação + troponina seriada + teste não invasivo.";
const HEART_INTERNACAO = "Internação + troponina seriada.";
const WELLS_PROVAVEL = "AngioTC diretamente — NÃO solicitar D-dímero.";
const WELLS_IMPROVAVEL = "D-dímero: se negativo (ajustado à idade se > 50 anos) → TEP excluído; se positivo → AngioTC.";

export type Tone = "green" | "yellow" | "orange" | "red" | "neutral";
export type CalcKind = "formula" | "score";

export type ToggleOption = { label: string; value: string };

export type FormulaInput =
  | { id: string; label: string; unit?: string; kind: "number"; placeholder?: string; optional?: boolean; helperText?: string }
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
      { id: "peso", label: "Peso atual (só para Cockcroft-Gault)", unit: "kg", kind: "number", placeholder: "ex: 70", helperText: PESO_NO_COCKCROFT },
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
          { label: "TFG (CKD-EPI 2021) — INDEXADA à superfície corporal", value: `${f0(tfg)} mL/min/1,73m²`, highlight: true },
          { label: "ClCr (Cockcroft-Gault) — ABSOLUTA, é esta que ajusta dose", value: cg != null ? `${f0(cg)} mL/min` : "informe o peso" },
          { label: "Estágio KDIGO", value: `${stage.k} — ${stage.v}` },
        ],
        // O estágio KDIGO já aparece na linha de métricas acima; mantê-lo fora do
        // rótulo deixa a frase inteira como chave de tradução.
        interpret: tfg < 30
          // "Evitar contraste" saiu: a tela não sabe se há exame contrastado
          // indicado nem a urgência dele, e em muitos cenários o contraste é o
          // que salva. Ajuste de dose por função renal, sim — é o desfecho da
          // ferramenta.
          ? { tone: "red", label: "Função renal gravemente reduzida", lines: ["Ajustar fármacos nefrotóxicos e de eliminação renal; discutir com nefrologia. Se houver exame contrastado indicado, a decisão é de risco × benefício com quem indicou — não é contraindicação automática."] }
          : tfg < 60
            ? { tone: "orange", label: "Redução moderada", lines: ["Ajustar dose de fármacos de eliminação renal."] }
            : { tone: "green", label: "Função preservada", lines: [] },
        tables: [{
          title: "⚠️ As duas medidas NÃO são intercambiáveis",
          rows: [
            { k: "CKD-EPI — mL/min/1,73 m²", v: "INDEXADA a uma superfície corporal padrão. Serve para ESTADIAR doença renal crônica (KDIGO) e comparar pacientes entre si." },
            { k: "Cockcroft-Gault — mL/min", v: "ABSOLUTA, do paciente que está na frente. É a que os estudos de ajuste de dose usaram, e a que se leva para a bula." },
            { k: "Quando divergem", v: "Quanto mais o paciente se afasta da superfície padrão, mais elas se separam — no obeso, no caquético e no muito baixo. Usar a indexada para ajustar dose é valor certo com MEDIDA errada, o mesmo mecanismo do ureia × BUN." },
          ],
        }, {
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
    reference: "Osmolalidade efetiva = tonicidade (não inclui ureia). Limiares de EHH: ADA/EASD, Diabetes Care 2024;47(8):1257-1275, Fig. 2B.",
    inputs: [
      { id: "na", label: "Sódio", unit: "mEq/L", kind: "number", placeholder: "ex: 140" },
      { id: "glic", label: "Glicemia", unit: "mg/dL", kind: "number", placeholder: "ex: 100" },
      { id: "ureia", label: "Ureia — não BUN", unit: "mg/dL", kind: "number", placeholder: "ex: 30", helperText: "UREIA total (faixa ~10–50 mg/dL), como reportam os laboratórios brasileiros — NÃO o nitrogênio ureico (BUN, ~7–20). Informar BUN aqui infla a osmolalidade calculada em ~2,14×." },
      { id: "medida", label: "Osm medida (opcional)", unit: "mOsm/kg", kind: "number", optional: true },
    ],
    compute: (v) => {
      const na = num(v.na), glic = num(v.glic), ureia = num(v.ureia), medida = num(v.medida);
      if (na == null || glic == null || ureia == null) return null;
      const calc = 2 * na + glic / 18 + ureia / 6;
      const efetiva = 2 * na + glic / 18;
      const gap = medida != null ? medida - calc : null;
      // ⚠️ A FAIXA USAVA 320 SOBRE A EFETIVA — o limiar da TOTAL.
      //
      // Efeito: quem tinha efetiva 310 saía como "hiperosmolalidade leve", e o
      // EHH só era sugerido acima de 320. O consenso ADA/EASD 2024 (Fig. 2B)
      // usa EFETIVA > 300. Mesmo defeito corrigido na árvore do CAD/EHH em
      // 14/ago, sobrevivendo aqui — os limiares agora vêm de lib/osmolalidade.
      //
      // O rótulo NÃO diz "é EHH" (R-19): a osmolalidade é UM dos critérios. O
      // diagnóstico exige também glicemia ≥ 600 e ausência de cetoacidose
      // significativa — e quem decide isso é a tela do módulo, não a régua.
      const interpEf: Interpretation =
        efetiva < OSM_EFETIVA_NORMAL.min ? { tone: "yellow", label: "Hipoosmolalidade — avaliar hiponatremia dilucional" }
        : efetiva <= OSM_EFETIVA_NORMAL.max ? { tone: "green", label: "Osmolalidade efetiva normal (275–295)" }
        : efetiva <= OSM_EFETIVA_EHH ? { tone: "yellow", label: "Hiperosmolalidade limítrofe — abaixo do limiar de EHH (efetiva > 300)" }
        : efetiva <= 360 ? { tone: "orange", label: "Efetiva > 300 — ATINGE o limiar osmolar do EHH. Não fecha o diagnóstico sozinho: exige também glicemia ≥ 600 e ausência de cetoacidose significativa." }
        : { tone: "red", label: "Hiperosmolalidade grave — EHH/coma hiperosmolar. Corrigir LENTO: queda ≤ 3,0–8,0 mOsm/kg/h." };
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
    reference: "Faixa de referência 8–12 com albumina 4 g/dL — ⚠️ cortes herdados, sem fonte conferida. A fórmula sai do dado e aparece junto do resultado.",
    inputs: [
      { id: "na", label: "Sódio", unit: "mEq/L", kind: "number", placeholder: "ex: 140" },
      { id: "cl", label: "Cloro", unit: "mEq/L", kind: "number", placeholder: "ex: 104" },
      { id: "hco3", label: "Bicarbonato", unit: "mEq/L", kind: "number", placeholder: "ex: 24" },
      // ⚠️ DEIXOU DE SER "OPCIONAL": sem ela o AG não é interpretável, e chamar
      // de opcional convidava a omitir justamente o dado que evita o falso
      // "normal" na hipoalbuminemia.
      { id: "alb", label: "Albumina (necessária para interpretar)", unit: "g/dL", kind: "number", optional: true },
    ],
    compute: (v) => {
      const na = numNaFaixa(v.na, ...FAIXA.sodioMeqL);
      const cl = numNaFaixa(v.cl, ...FAIXA.cloroMeqL);
      const hco3 = numNaFaixa(v.hco3, ...FAIXA.bicarbonatoMeqL);
      const alb = numNaFaixa(v.alb, ...FAIXA.albuminaGDl);
      if (na == null || cl == null || hco3 == null) return null;
      // ⚠️ O CÁLCULO VEM DA FÓRMULA DECLARADA, não de uma conta escrita aqui.
      // O app usa AG = Na − (Cl + HCO₃), SEM potássio (decisão do autor).
      const ag = calcularAG({ Na: na, Cl: cl, "HCO₃": hco3 });
      if (ag == null) return null;
      // ⚠️ O FATOR E OS CORTES VÊM DO DADO, com a procedência declarada — e
      // ambos são HERDADOS SEM FONTE, o que agora está escrito em vez de
      // suposto (lib/anion-gap.ts).
      const agCorr =
        alb != null ? ag + FATOR_ALBUMINA.valor * (FATOR_ALBUMINA.porGDlAbaixoDe - alb) : null;
      // ⚠️ SEM ALBUMINA NÃO HÁ `agRef`. A linha anterior era `agCorr ?? ag`, que
      // interpretava o AG medido COMO SE a albumina fosse 4 — e chamava de
      // "normal", em verde, o AG de 12 de um paciente com albumina 2,0, cujo AG
      // corrigido é ~17. Era conclusão por queda no exame mais consequente que
      // ela tinha (R-111).
      const agRef = agCorr;
      const dd = agRef != null && hco3 < 24 ? (agRef - CORTE_AG.elevadoAcimaDe) / (24 - hco3) : null;
      const metrics: ResultMetric[] = [
        { label: "Ânion gap", value: `${f1(ag)} mEq/L`, highlight: true },
        // ⚠️ A FÓRMULA APARECE JUNTO DO RESULTADO: existe a variante com K, e
        // quem lê o número precisa saber qual das duas o app usou.
        { label: "Fórmula", value: textoDaFormula() },
      ];
      if (agCorr != null) {
        metrics.push({ label: "AG corrigido (albumina)", value: `${f1(agCorr)} mEq/L` });
        metrics.push({ label: "Correção pela albumina", value: AG_FATOR_ROTULO });
      }
      if (dd != null) metrics.push({ label: "Delta-delta", value: f1(dd) });
      // ⚠️ TRÊS DESTINOS + O "NÃO SEI", e nenhum deles é verde.
      //
      // Verde é conclusão: diz "pode seguir". Era o que o defeito fazia de pior —
      // e nem o AG dentro da faixa volta a ser verde, porque "dentro da faixa"
      // com albumina corrigida ainda é leitura, não alta.
      const interp: Interpretation =
        agRef == null
          ? { tone: "neutral", label: AG_SEM_ALBUMINA, lines: [AG_SEM_ALBUMINA_PORQUE] }
          : agRef > CORTE_AG.elevadoAcimaDe
            ? { tone: "orange", label: "Ânion gap ELEVADO — acidose com AG aumentado", lines: [AG_ELEVADO_CAUSAS, AG_LABORATORIO_PREVALECE] }
            : agRef < CORTE_AG.baixoAbaixoDe
              ? { tone: "yellow", label: AG_BAIXO, lines: [AG_LABORATORIO_PREVALECE] }
              : { tone: "yellow", label: "Ânion gap corrigido dentro da faixa de referência", lines: [AG_NA_FAIXA, AG_LABORATORIO_PREVALECE] };
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
      : t >= 13 ? { tone: "yellow", label: "GCS 13–14 — leve", lines: [GLASGOW_LEVE] }
      : t >= 9 ? { tone: "orange", label: "GCS 9–12 — moderado", lines: [GLASGOW_MODERADO] }
      // R-19 — descreve gravidade e manda AVALIAR a via aérea; não indica IOT.
      // A TC do TCE FICA, e o critério é a assimetria de dano: TC a mais custa
      // radiação e tempo, TC a menos custa hematoma não visto. Intubação
      // indevida é dano imediato e grave — por isso ela sai e a TC não.
      : t === 8 ? { tone: "orange", label: "GCS 8 — limiar clássico de proteção de via aérea", lines: [GLASGOW_AVALIAR_VIA_AEREA] }
      : { tone: "red", label: "GCS ≤ 7 — grave", lines: [GLASGOW_AVALIAR_VIA_AEREA] },
    note: "Intubado/traqueostomizado: registrar V como 'T'. GCS < 13 em TCE → TC de crânio urgente — abrir o módulo TCE, que estratifica a indicação e os alvos.",
  },
  {
    kind: "score",
    id: "qsofa",
    name: "qSOFA",
    subtitle: "Triagem rápida de sepse (fora da UTI)",
    reference: "Limiar ≥ 2: Seymour CW et al. JAMA. 2016;315(8):762–774. Papel na triagem: Surviving Sepsis Campaign 2026.",
    layout: "toggle",
    totalRange: "0–3",
    vars: [
      { id: "fr", label: "FR ≥ 22 rpm", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "mental", label: "Alteração do estado mental (GCS < 15)", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
      { id: "pas", label: "PAS ≤ 100 mmHg", options: [{ label: "Não", points: 0 }, { label: "Sim", points: 1 }] },
    ],
    // A faixa 0–1 NÃO fica com `lines` vazio: região de aviso que às vezes fica
    // em branco ensina a ignorar a região (R-11). E é justamente no qSOFA baixo
    // que a ressalva importa — é onde o escore mais deixa passar.
    interpret: (t) => t >= 2
      ? { tone: "red", label: "qSOFA ≥ 2 — alto risco de desfecho adverso", lines: ["Acionar avaliação completa com SOFA; considerar UTI.", QSOFA_PAPEL_APOS_SSC_2026] }
      : { tone: "yellow", label: "qSOFA 0–1 — NÃO afasta sepse", lines: [QSOFA_PAPEL_APOS_SSC_2026] },
    note: "qSOFA é ferramenta de TRIAGEM fora da UTI — NÃO substitui o SOFA para diagnóstico de sepse.",
  },
  {
    kind: "score",
    id: "sofa",
    name: "SOFA",
    subtitle: "Sequential Organ Failure Assessment",
    reference: "Critério ≥ 2 = sepse: Singer M et al. JAMA. 2016;315(8):801–810 (Sepsis-3). MORTALIDADE POR FAIXA × TENDÊNCIA: Ferreira FL et al. JAMA. 2001;286(14):1754–1758.",
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
    // ── MUDANÇA DE APRESENTAÇÃO, não só de número ──────────────────────────
    //
    // Ferreira 2001 NÃO publica mortalidade por faixa de escore. Publica por
    // faixa × TENDÊNCIA em 48 h. O mesmo SOFA 10 vale ≤ 6% se está caindo e 60%
    // se não está — dez vezes de diferença, que a tela apagava ao exibir um
    // número só. E a fonte citada antes (Singer 2016) não publica faixa alguma:
    // só o critério ≥ 2 = sepse vem de lá.
    interpret: (t) =>
      t >= 12
        ? { tone: "red", label: `SOFA ${t} — escore inicial > 11`, lines: [SOFA_DEPENDE_DA_TENDENCIA] }
        : t >= 8 ? { tone: "orange", label: `SOFA ${t} — escore inicial 8–11`, lines: [SOFA_DEPENDE_DA_TENDENCIA] }
        : t >= 2 ? { tone: "yellow", label: `SOFA ${t} — escore inicial 2–7`, lines: [SOFA_SEPSE, SOFA_DEPENDE_DA_TENDENCIA] }
        : { tone: "green", label: `SOFA ${t} — sem disfunção orgânica significativa` },
    note: "SOFA ≥ 2 pontos em paciente com infecção suspeita/confirmada = Sepse (Sepsis-3, 2016). As porcentagens das faixas são de Ferreira 2001 e dependem da SEGUNDA medida em 48 h — sem ela, não se aplicam.",
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
    // A via diagnóstica FICA: é o desfecho para o qual o Wells foi construído e
    // validado. O que entrou é o outro lado — quem não pode fazer AngioTC.
    interpret: (t) => t > 4
      ? { tone: "orange", label: "TEP PROVÁVEL (Wells > 4)", lines: [WELLS_PROVAVEL, ANGIOTC_QUANDO_NAO_DA] }
      : { tone: "green", label: "TEP IMPROVÁVEL (Wells ≤ 4)", lines: [WELLS_IMPROVAVEL, ANGIOTC_QUANDO_NAO_DA] },
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
    // Valor POR ESCORE, não por faixa agrupada: a tela sabe o escore exato, e o
    // "15–40%" que estava aqui escondia que o escore 5 vale 57% — justamente o
    // paciente que não pode ir para enfermaria.
    //
    // ⚠️ O ESCORE 2 NÃO TEM VALOR PONTUAL. O resumo da publicação imprime
    // "score 2, 3%", impossível entre 3,2% (escore 1) e 17% (escore 3); outras
    // fontes citam 13%. É erro tipográfico propagado desde 2003, e a Tabela do
    // texto completo não foi obtida. Fica ENQUADRADO entre os vizinhos em vez de
    // vazio: vazio no meio de coluna preenchida parece defeito de software.
    interpret: (t) => {
      const MORT: Record<number, string> = { 0: "0,7%", 1: "3,2%", 3: "17%", 4: "41,5%", 5: "57%" };
      const risco = t === 2 ? CURB65_ESCORE_2 : `mortalidade em 30 dias ${MORT[t]}`;
      return t >= 3
        ? { tone: "red", label: `CURB-65 ${t} — ${risco}`, lines: [CURB_INTERNACAO, UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65] }
        : t === 2 ? { tone: "orange", label: `CURB-65 2 — ${risco}`, lines: [CURB_INTERNACAO] }
        : { tone: "green", label: `CURB-65 ${t} — ${risco}`, lines: [CURB_AMBULATORIO] };
    },
  },
  {
    kind: "score",
    id: "heart",
    name: "HEART Score",
    subtitle: "Risco de MACE em dor torácica",
    reference: "Escore: Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008;16(6):191–196 · Backus BE et al. Crit Pathw Cardiol. 2010;9(3):164–169. PORCENTAGENS DE MACE: Backus BE et al. Int J Cardiol. 2013;168(3):2153–2158 (n = 2440) — as três da mesma coorte.",
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
    // As TRÊS porcentagens vêm da MESMA coorte (Backus 2013, n = 2440). Antes só
    // a faixa baixa vinha: 1,7% era de lá, mas 12% e 65% não eram de nenhuma das
    // fontes citadas. Misturar percentuais de coortes diferentes é pior do que
    // usar uma coorte consistente — as faixas deixam de ser comparáveis entre si,
    // e o GRADIENTE entre elas, que é o que o escore comunica, vira artefato de
    // amostragem.
    interpret: (t) => t >= 7
      ? { tone: "red", label: `HEART ${t} — alto risco (MACE 50,1%)`, lines: [HEART_INTERNACAO, ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART] }
      : t >= 4 ? { tone: "orange", label: `HEART ${t} — risco intermediário (MACE 16,6%)`, lines: [HEART_OBSERVACAO] }
      : { tone: "green", label: `HEART ${t} — baixo risco (MACE 1,7%)`, lines: [HEART_ALTA] },
    note: "MACE = infarto, revascularização urgente ou morte em 6 semanas. As três porcentagens são da MESMA coorte (Backus 2013, 2440 pacientes) — Six 2008 e Backus 2010 são a origem do ESCORE, não a fonte destes números.",
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
      // R-19 — as faixas descrevem o nível OBSERVADO. A agitação manda procurar
      // causa; quem titula é a Sedoanalgesia, que conhece a indicação.
      t >= 2 ? { tone: "red", label: "RASS +2 a +4 — agitação", lines: [RASS_AGITACAO_PROCURAR_CAUSA] }
      : t === 1 ? { tone: "yellow", label: "RASS +1 — inquieto", lines: [RASS_AGITACAO_PROCURAR_CAUSA] }
      : t === 0 ? { tone: "green", label: "RASS 0 — alerta e calmo", lines: [RASS_ALVO] }
      : t >= -2 ? { tone: "green", label: "RASS −1 a −2 — sedação leve", lines: [RASS_DENTRO_DA_META] }
      : t === -3 ? { tone: "yellow", label: "RASS −3 — sedação moderada", lines: [SEDACAO_ABAIXO_DA_META] }
      : t === -4 ? { tone: "orange", label: "RASS −4 — sedação profunda", lines: [SEDACAO_ABAIXO_DA_META] }
      : { tone: "red", label: "RASS −5 — não desperta", lines: [RASS_NAO_DESPERTA] },
    note: "Meta padrão em VM: RASS −2 a 0 — sedação LEVE (PADIS 2018); mais profundo só por indicação declarada, e sob bloqueio o alvo é −5. Avaliar: agitado → +1 a +4; calmo → chamar pelo nome (−1/0); sem resposta à voz → estímulo físico (−3/−4); sem resposta → −5.",
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
    subtitle: "Ajuste renal — dirigido pelo catálogo, não por código",
    reference: "Cada linha declara a SUA fonte — ver lib/antimicrobianos/catalogo.ts e protocols/fontes-verbatim/.",
    // ⚠️ NENHUM `if` POR FÁRMACO, E NENHUM NOME DE REMÉDIO NESTE ARQUIVO.
    //
    // Esta ferramenta é o ENSAIO DO MOTOR: o mesmo padrão que o app inteiro
    // precisa ter — dado declarativo + renderização dirigida pelo dado. Enquanto
    // havia um bloco por fármaco, o bloco do próximo seria copiado do anterior, e
    // é exatamente aí que a divergência nasce. Com 28 fármacos seriam 28 cópias.
    //
    // ⚠️ A PERGUNTA VEM DO EIXO, não da tela. Fármaco com eixo de indicação
    // pergunta indicação; com esquema basal, pergunta esquema. O "não sei" nasce
    // do catálogo — se morasse aqui, o próximo fármaco esqueceria de oferecê-lo.
    //
    // ⚠️ E A TRAVA `test:motor-antibiotico` REPROVA nome de fármaco neste arquivo
    // e na tela: se o nome do remédio aparece no código, o código sabe clínica —
    // e clínica mora no catálogo.
    inputs: [
      { id: "farmaco", label: "Antibiótico", kind: "toggle",
        options: CATALOGO_DE_ANTIMICROBIANOS.map((a) => ({ label: a.nome, value: a.id })) },
      { id: "peso", label: "Peso (real)", unit: "kg", kind: "number", placeholder: "ex: 70", optional: true },
      // ⚠️ `metodoDaTFG` GANHA CONSEQUÊNCIA: a tela DIZ qual equação a linha
      // pressupõe, em vez de o campo existir só no dado. Campo verdadeiro sem
      // consequência é o começo de campo mentiroso — ninguém o mantém, porque
      // nada quebra quando ele erra. No dia em que um fármaco exigir CKD-EPI, a
      // divergência aparece NA TELA, e não fica no dado.
      { id: "tfg", label: "ClCr ABSOLUTO (mL/min) — Cockcroft-Gault, como nos estudos de ajuste de dose", unit: "mL/min", kind: "number", placeholder: "ex: 80", helperText: CLCR_PARA_DOSE, optional: true },
      // ⚠️ UM CAMPO SÓ PARA TODOS OS EIXOS. Os valores vêm do catálogo, e a
      // pergunta de cada fármaco aparece na tela junto do resultado.
      { id: "eixo", label: "Se o fármaco pedir: indicação · esquema basal", kind: "toggle",
        options: [
          // ⚠️ CHAVE COMPOSTA — `farmaco::valor`, nunca id global. Dois fármacos
          // com "tratamento" fariam um responder pelo outro EM SILÊNCIO, e falha
          // silenciosa é o modo de falha mais caro: nada quebra.
          ...CATALOGO_DE_ANTIMICROBIANOS.flatMap((a) => (a.eixo?.valores ?? []).map((v) => ({ label: `${a.nome} · ${v.rotulo}`, value: `${a.id}::${v.id}` }))),
          { label: "Não sei — ver todas", value: "nao_sei" },
        ] },
    ],
    compute: (v) => {
      const alvo = CATALOGO_DE_ANTIMICROBIANOS.find((a) => a.id === (v.farmaco ?? CATALOGO_DE_ANTIMICROBIANOS[0].id));
      if (!alvo) return null;
      const peso = parseFloat((v.peso ?? "").replace(",", "."));
      const tfg = parseFloat((v.tfg ?? "").replace(",", "."));
      const r0 = (x: number) => Math.round(x).toString();
      // ⚠️ O TEXTO SAI DA ESTRUTURA, e a base vem do eixo — é assim que "metade
      // da dose recomendada" vira 250 mg na indicação de pele e 500 mg na
      // intra-abdominal, sem ninguém resolver o referente à mão (D-79).
      const texto = (l: LinhaRenal, base?: DoseEstruturada) => {
        if (l.semDados) return l.semDados;
        const derivado = l.valor && l.valor.tipo !== "textoLivre" ? textoDaDose(l.valor, base) : "";
        const corpo = derivado || l.doseConcreta?.texto || l.dose || "";
        return `${corpo} ${l.intervalo ?? ""}`.trim();
      };

      const tabelas: { title: string; rows: { k: string; v: string }[] }[] = [];
      // ⚠️ O MÉTODO DA LINHA, NA TELA. Se um dia divergir do que o campo pede, a
      // divergência aparece aqui — e a trava `test:metodo-da-tfg` reprova antes.
      const METODO_NA_TELA: Record<string, string> = {
        cockcroft_gault: "Cockcroft-Gault (ClCr absoluto) — é o que este campo pede",
        ckd_epi: "⚠️ CKD-EPI (indexada por superfície) — DIFERENTE do que este campo pede",
        mdrd: "⚠️ MDRD (indexada) — DIFERENTE do que este campo pede",
        sem_dados: "sem método declarado (linha de modalidade)",
      };

      // ── ATAQUE: campo próprio, e ele NÃO desce com o clearance ─────────────
      if (alvo.doseDeAtaque?.length) {
        // ⚠️ O ATAQUE CALCULADO CHAMA A DONA DA FÓRMULA — não a reescreve. O
        // nome do cálculo diz O QUE se calcula, nunca de que remédio se trata:
        // o motor não sabe clínica, e a fórmula tem dona única no repositório
        // (a mesma que a sepse usa), porque duas cópias divergiam acima de 110 kg.
        const CALCULOS: Record<string, (kg: number) => string | null> = {
          ataque_glicopeptideo_peso_real: (kg) => {
            const a = ataqueVancomicinaMg(kg);
            return a ? `${Math.round(a.min)}–${Math.round(a.max)} mg` : null;
          },
        };
        tabelas.push({
          title: "Dose de ataque — não se ajusta por função renal",
          rows: alvo.doseDeAtaque.map((a) => {
            const calculado = a.calculo && Number.isFinite(peso) ? CALCULOS[a.calculo]?.(peso) : null;
            return { k: calculado ? `${calculado} (${a.dose})` : a.dose, v: a.quando };
          }),
        });
      }

      // ⚠️ O MOTOR NÃO ACEITA VALOR DE EIXO SEM O FÁRMACO JUNTO: se a chave não
      // pertence ao fármaco selecionado, ela é ignorada e as colunas aparecem
      // todas — em vez de uma responder pela outra.
      const [donoDoEixo, valorDoEixo] = (v.eixo ?? "").split("::");
      const escolhido = valorDoEixo && donoDoEixo === alvo.id ? valorDoEixo : undefined;

      // ── QUEM NÃO AJUSTA RESPONDE ANTES DE PEDIR O CLEARANCE ───────────────
      if (alvo.ajusteRenal !== "ajusta") {
        const modais = alvo.linhas.filter((l) => l.modalidade);
        return {
          metrics: [
            // ⚠️ A DOSE USUAL É DERIVADA do catálogo — uma cópia só (R-95).
            { label: `${alvo.nome} — dose usual`, value: `${doseUsualDerivada(alvo)} — ${alvo.doseUsual.via}`, highlight: true },
            ...(alvo.doseMaxima ? [{ label: "Teto", value: alvo.doseMaxima.valor }] : []),
          ],
          interpret: { tone: "green" as Tone, label: `${alvo.nome} — ${alvo.textoDoEstado?.texto ?? ""}` },
          tables: [
            ...tabelas,
            { title: "Substituição renal", rows: modais.map((l) => ({ k: l.modalidade!, v: texto(l, baseDe(alvo, escolhido)) })) },
            { title: "O que a fonte diz", rows: alvo.observacoes.map((o) => ({ k: "•", v: o.texto })) },
          ],
        };
      }

      if (!Number.isFinite(tfg)) return null;

      const conjuntos = alvo.eixo
        ? alvo.eixo.valores.filter((x) => !escolhido || x.id === escolhido)
        : [{ id: "", rotulo: "", linhas: alvo.linhas }];
      // ⚠️ EIXO PEDIDO E NÃO RESPONDIDO NÃO ESCOLHE POR OMISSÃO: mostra TODOS.
      if (!conjuntos.length) return null;

      const metrics = conjuntos.flatMap((c) => {
        const fx = faixaPara(alvo, tfg, c.id || undefined, Number.isFinite(peso) ? peso : undefined);
        const rotulo = c.rotulo ? `${c.rotulo} — ClCr ${r0(tfg)}` : `${alvo.nome} (ClCr ${r0(tfg)})`;
        if (!fx) {
          return [{ label: rotulo, value: "⚠️ falta o peso para esta coluna", highlight: true }];
        }
        // Dose em mg/kg vira mg quando o peso existe — sem inventar quando não existe.
        // ⚠️ `porQuilo` É CAMPO, NÃO STRING ENCONTRADA. Antes o motor procurava
        // "mg/kg" no texto e usava `parseFloat` — o que cala ou erra com
        // "1,5 g/kg", "mg/kg/dia" ou "7,5 a 10 mg/kg".
        const emMgKg = fx.valor?.tipo === "absoluta" && fx.valor.porQuilo === true;
        const valor =
          emMgKg && Number.isFinite(peso)
            ? `${texto(fx, baseDe(alvo, c.id || undefined))}  ·  ${r0((fx.valor as { min: number }).min * peso)}–${r0(((fx.valor as { max?: number }).max ?? (fx.valor as { min: number }).min) * peso)} mg`
            : texto(fx, baseDe(alvo, c.id || undefined));
        return [{ label: rotulo, value: valor, highlight: true }];
      });

      const modais = (alvo.eixo ? conjuntos[0].linhas : alvo.linhas).filter((l) => l.modalidade);
      if (alvo.eixo) {
        tabelas.push({ title: alvo.eixo.pergunta, rows: [{ k: "Não sabe?", v: alvo.eixo.naoSei }] });
      }
      tabelas.push({ title: "Substituição renal", rows: modais.map((l) => ({ k: l.modalidade!, v: texto(l) })) });
      const escolhidasParaMetodo = conjuntos.map((c) => faixaPara(alvo, tfg, c.id || undefined, Number.isFinite(peso) ? peso : undefined));
      const notas = conjuntos.flatMap((c) => {
        const fx = faixaPara(alvo, tfg, c.id || undefined, Number.isFinite(peso) ? peso : undefined);
        return fx?.notaDeFaixa ? [{ k: "⚠️", v: fx.notaDeFaixa.texto }] : [];
      });
      if (notas.length) tabelas.push({ title: "Nesta faixa", rows: notas });
      const metodos = [...new Set(escolhidasParaMetodo.filter(Boolean).map((l) => l!.metodoDaTFG))];
      tabelas.push({
        title: "Qual clearance esta faixa pressupõe",
        rows: metodos.map((m) => ({ k: m, v: METODO_NA_TELA[m] ?? m })),
      });
      tabelas.push({ title: "O que a fonte diz", rows: alvo.observacoes.map((o) => ({ k: "•", v: o.texto })) });

      // ⚠️ O TOM TAMBÉM VEM DO DADO. A primeira versão desta linha dizia
      // `tfg < 30 ? "orange" : "green"` — um limiar clínico escrito no
      // RENDERIZADOR, que é o defeito que esta ferramenta existe para não ter. E
      // foi a trava nova que pegou, no mesmo dia em que nasceu.
      //
      // Agora o alerta é ESTRUTURAL: laranja quando a linha escolhida é a faixa
      // MAIS BAIXA do conjunto (a de maior disfunção) ou quando não há dado.
      const escolhidas = conjuntos.map((c) => faixaPara(alvo, tfg, c.id || undefined, Number.isFinite(peso) ? peso : undefined));
      const naFaixaMaisBaixa = escolhidas.some((l) => l && l.de === 0);
      return {
        metrics,
        interpret: {
          tone: (naFaixaMaisBaixa ? "orange" : "green") as Tone,
          // ⚠️ FRASE MONTADA NÃO VIRA CHAVE DE DICIONÁRIO (D-19/R-82): as duas
          // partes já têm chave própria — o nome vem do catálogo e a pergunta
          // vem do eixo —, e o conector fica como constante traduzível.
          label: alvo.eixo && !escolhido ? `${alvo.nome} · ${DEPENDE_DE} ${alvo.eixo.pergunta}` : alvo.nome,
        },
        tables: tabelas,
      };
    },
    alert: ["Valores orientativos — confirmar com farmacêutico clínico e bula. Cada linha declara a sua fonte no catálogo."],
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
