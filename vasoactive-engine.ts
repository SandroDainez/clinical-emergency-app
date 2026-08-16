import protocol from "./protocols/drogas_vasoativas.json";
import { ADRENALINA_CHOQUE_FAIXA, ADRENALINA_CHOQUE_LIMIARES } from "./lib/adrenalina-no-choque";
import type {
  AuxiliaryPanel,
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "./clinical-engine";
import { NITRATO_CONTRAINDICACAO_PDE5, NITRATO_PDE5_USO_CRONICO } from "./lib/nitrato-contraindicacoes";

type StateType = "action" | "question" | "end";
type Diluent = "SF" | "SG";
type DoseUnit = "mcg/kg/min" | "mcg/min" | "mg/h" | "U/min";
type BaseUnit = "mcg" | "mg" | "U";
type DrugKey =
  | "noradrenalina"
  | "adrenalina"
  | "vasopressina"
  | "dopamina"
  | "dobutamina"
  | "milrinona"
  | "levosimendan"
  | "nitroprussiato"
  | "nitroglicerina"
  | "fenilefrina";
type CalculatorMode = "doseToRate" | "rateToDose";

type State = {
  type: StateType;
  text: string;
  speak?: string;
  details?: string[];
  next?: string;
  options?: Record<string, string>;
};

type Protocol = {
  id: string;
  initialState: string;
  states: Record<string, State>;
};

type Presentation = {
  id: string;
  label: string;
  container: "Ampola" | "Frasco-ampola";
  volumeLabel: string;
  concentrationLabel: string;
  ampouleVolumeMl: number;
  basePerAmpoule: number;
  notes?: string;
  /**
   * De onde veio esta apresentação — obrigatório, e cobrado pelo build.
   *
   * ── POR QUE ESTE CAMPO EXISTE ─────────────────────────────────────────────
   *
   * A dopamina entrou aqui com 200 mg/5 mL e 400 mg/10 mL: o concentrado
   * AMERICANO, 40 mg/mL. A ampola brasileira é 5 mg/mL × 10 mL = 50 mg.
   * Fator 8.
   *
   * O erro não aparecia em lugar nenhum, porque tudo o mais era coerente: o
   * rótulo do frasco batia com a conta, a conta batia com a taxa. Quem pegasse
   * a ampola que tem na mão (50 mg), tocasse no atalho "1 amp + 240 mL →
   * 1600 mcg/mL" e programasse a taxa exibida, infundiria OITO VEZES MENOS
   * dopamina do que pretendia — subdose de vasopressor em choque.
   *
   * E o app já sabia a resposta: a tela de Farmacologia do ACLS traz
   * "Dopamina — 50 mg / 10 mL", certa, há tempos. Duas telas do mesmo app com
   * ampolas diferentes da mesma droga.
   *
   * Uma apresentação sem fonte é uma apresentação que alguém copiou de uma
   * referência estrangeira sem perceber. O campo obriga a olhar a bula ANTES
   * de cadastrar, e `npm run test:vasoativos` recusa o build sem ele.
   */
  fonte: string;
};

type StandardSolution = {
  id: string;
  label: string;
  diluent: Diluent;
  presentationId: string;
  ampoules: string;
  diluentMl: string;
};

type Drug = {
  key: DrugKey;
  name: string;
  emoji: string;
  baseUnit: BaseUnit;
  doseUnit: DoseUnit;
  recommendedDiluent?: Diluent;
  presentations: Presentation[];
  standardSolutions?: StandardSolution[];
  reference: {
    usual?: string;
    titration?: string;
    max?: string;
    notes?: string[];
  };
  vasopressinAlert?: {
    threshold: number;
    message: string;
  };
  /**
   * Limites da BARRA de dose — entrada, não recomendação.
   *
   * O app tinha caixa de digitação aqui, e o pedido é barra em todo lugar:
   * teclado numérico em emergência abre teclado sobre a tela, aceita
   * "0,,1" e "10" no lugar de "1,0", e custa um passo a mais com o paciente
   * na frente. A barra não erra de ordem de grandeza.
   *
   * Os limites são generosos DE PROPÓSITO, como em lib/faixas-de-entrada: eles
   * dizem o que a barra ALCANÇA, não o que é seguro. Faixa apertada demais foi
   * o defeito que impedia registrar o paciente real — aqui, a noradrenalina
   * chega a 3 mcg/kg/min porque o próprio módulo documenta doses excepcionais
   * até ~3 em choque vasoplégico refratário. Quem julga a dose é o texto de
   * referência e os alertas, não o fim da barra.
   */
  faixaDeDose: { min: number; max: number; passo: number };
};

type Event = {
  timestamp: number;
  type: string;
  data?: Record<string, string | number | boolean | null | undefined>;
};

type Session = {
  protocolId: string;
  currentStateId: string;
  history: Event[];
  pendingEffects: EngineEffect[];
  protocolStartedAt: number;
  selectedDrugKey?: DrugKey;
  selectedSolutionId?: string;
  mode: CalculatorMode;
  diluent: Diluent;
  presentationId: string;
  ampoules: string;
  diluentMl: string;
  weightKg: string;
  heightCm: string;
  doseInput: string;
  rateInput: string;
  confirmedConfigToken?: string;
  lastConfirmedAction?: "prepare" | "adjust";
  lastConfirmedSummary?: string;
  vasopressinAlertToken?: string;
};

type CalculationResult = {
  ampoules: number;
  diluentMl: number;
  finalVolumeMl: number;
  totalBase: number;
  concentration: number;
  weightKg: number;
  outRateMlH: number | null;
  outDose: number | null;
  currentDoseMcgKgMin: number | null;
  presentation: Presentation;
};

const protocolData = protocol as Protocol;

/**
 * ⚠️ EXPORTADO por causa da D-34.
 *
 * Enquanto `DRUGS` era privado, NENHUMA árvore conseguia importar dose de
 * vasoativo — e por isso todas copiavam à mão. A varredura achou 10 fármacos,
 * 19 sítios de cópia e 9 árvores. Não era descuido repetido: era a única saída
 * que o código oferecia.
 *
 * Exportar não resolve sozinho — quem consome precisa de uma lib com a fonte
 * aberta (o precedente da dobutamina). Mas sem isto, nem essa opção existe.
 */
export const DRUGS: Drug[] = [
  {
    key: "noradrenalina",
    faixaDeDose: { min: 0.01, max: 3, passo: 0.01 },
    name: "Noradrenalina",
    emoji: "🩸",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "nora-4mg-base-4ml",
        label: "Ampola 4 mL • 4 mg base por ampola",
        container: "Ampola",
        volumeLabel: "4 mL",
        concentrationLabel: "2 mg/mL hemitartarato",
        ampouleVolumeMl: 4,
        basePerAmpoule: 4000,
        fonte: "Hemitartarato de noradrenalina 2 mg/mL, ampola 4 mL (Hypofarma / Cristália) — bula ANVISA.",
        notes:
          "Ampola 4 mL com 2 mg/mL de hemitartarato equivale a 4 mg de noradrenalina base.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-16",
        label: "16 mcg/mL • 1 amp + 246 mL → 250 mL final",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "1",
        diluentMl: "246",
      },
      {
        id: "padrao-32",
        label: "32 mcg/mL • 2 amp + 242 mL → 250 mL final",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "2",
        diluentMl: "242",
      },
      {
        id: "padrao-64",
        label: "64 mcg/mL • 4 amp + 234 mL → 250 mL final",
        diluent: "SG",
        presentationId: "nora-4mg-base-4ml",
        ampoules: "4",
        diluentMl: "234",
      },
    ],
    reference: {
      usual: "0,01–1 mcg/kg/min (faixa habitual); > 1 mcg/kg/min = dose alta (marcador de gravidade — SOFA cardiovascular)",
      titration: "Ajustar a cada 2–5 min conforme PAM e perfusão; acima de 1 mcg/kg/min, associar vasopressores de segunda linha",
      max: "Não existe dose máxima estabelecida formalmente. Doses > 1 mcg/kg/min: receptores alfa-adrenérgicos saturam progressivamente (Intensive Care Med 2024), reduzindo eficiência incremental — associar vasopressores adjuvantes. Doses excepcionais documentadas em UTI chegam a ~3 mcg/kg/min em choque vasoplégico refratário com monitorização invasiva contínua e estratégia multimodal. Relatos isolados acima de 3 mcg/kg/min existem em situações extremas, mas representam falência terapêutica e não uma faixa de uso — a decisão de escalar além de 3 mcg/kg/min deve envolver equipe experiente e contexto de suporte máximo.",
      notes: [
        "Objetivo inicial: PAM ≥ 65 mmHg (SSC 2021 — vasopressor de 1ª linha em choque séptico).",
        "Preferir acesso central; em urgência, acesso periférico curto prazo (< 48h, < 15 mcg/min — Chest 2023) é aceito com vigilância de extravasamento.",
        "⚠️ Dose excepcional (> 1–3 mcg/kg/min): eficiência reduzida por saturação de receptores — adicionar vasopressina 0,03 U/min, considerar hidrocortisona 200 mg/dia e angiotensina II se disponível (estratégia multimodal).",
      ],
    },
    /**
     * O gatilho dispara em 0,25 — o INÍCIO da janela, não o fim.
     *
     * Os três números que circulam (> 0,25; 0,25–0,5; 0,4) não se contradizem:
     * têm origens diferentes. A SSC 2021 nunca transformou nenhum deles em
     * recomendação graduada — a faixa 0,25–0,5 aparece no texto de PRÁTICA
     * ("in our practice, vasopressin is usually started when…"), não na
     * recomendação. A SSC 2026 retirou o número de vez: o gatilho passou a ser
     * "doses em escalada". O 0,4 é de protocolo institucional, sem lastro em
     * diretriz.
     *
     * Por isso o app avisa em 0,25 e ensina a faixa: avisar em 0,5 seria avisar
     * no fim da janela, quando a decisão já devia ter sido tomada. O erro de
     * avisar cedo é uma leitura a mais; o de avisar tarde é escalar alfa sozinho.
     */
    vasopressinAlert: {
      threshold: 0.25,
      message:
        "Noradrenalina ≥ 0,25 mcg/kg/min — janela para associar VASOPRESSINA 0,03 U/min (dose FIXA, não titular). A faixa usual de início é 0,25–0,5 mcg/kg/min — REFERÊNCIA DE PRÁTICA (SSC 2021, texto de prática, nunca recomendação graduada), NÃO É PORTÃO. A SSC 2026 retirou o número: o gatilho passou a ser dose em ESCALADA. Se a noradrenalina está subindo, associar poupa alfa — não esperar chegar a 0,5.",
    },
  },
  {
    key: "adrenalina",
    faixaDeDose: { min: 0.01, max: 2, passo: 0.01 },
    name: "Adrenalina",
    emoji: "⚡",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "epi-1mg-1ml",
        label: "Ampola 1 mL • 1 mg por ampola",
        container: "Ampola",
        volumeLabel: "1 mL",
        concentrationLabel: "1 mg/mL",
        ampouleVolumeMl: 1,
        basePerAmpoule: 1000,
        fonte: "Epinefrina 1 mg/mL, ampola 1 mL (Hipolabor / Cristália) — bula ANVISA.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-20",
        label: "20 mcg/mL • 2 amp + 98 mL → 100 mL final",
        diluent: "SG",
        presentationId: "epi-1mg-1ml",
        ampoules: "2",
        diluentMl: "98",
      },
      {
        id: "padrao-40",
        label: "40 mcg/mL • 4 amp + 96 mL → 100 mL final",
        diluent: "SG",
        presentationId: "epi-1mg-1ml",
        ampoules: "4",
        diluentMl: "96",
      },
      // ── TERCEIRA DILUIÇÃO, E O CONTEXTO É O QUE A DISTINGUE ───────────────
      //
      // 10 mcg/mL é a diluição clássica da ANAFILAXIA REFRATÁRIA, e vivia
      // solta em anaphylaxis-decision-tree.ts. Não é erro — é outro contexto,
      // com dose por kg mais baixa e titulação por PAS.
      //
      // Subiu para cá porque o construto é o mesmo ("como diluir adrenalina
      // para infusão") e o app tinha TRÊS diluições em DOIS lugares, com duas
      // delas sem saber que a terceira existia. Com as três aqui, quem escolhe
      // escolhe sabendo — e a quarta não nasce solta (R-12 aplicado ao
      // construto, como na hipercapnia permissiva).
      {
        id: "anafilaxia-10",
        label: "10 mcg/mL • 1 amp + 99 mL → 100 mL final (anafilaxia refratária)",
        diluent: "SF",
        presentationId: "epi-1mg-1ml",
        ampoules: "1",
        diluentMl: "99",
      },
    ],
    reference: {
      // R-56: "0,01–1" apresentava um LIMIAR DE GRAVIDADE como teto de faixa,
      // e divergia do 0,01–0,5 da Sepse — mesmo construto, dois números.
      usual: ADRENALINA_CHOQUE_FAIXA,
      titration: ADRENALINA_CHOQUE_LIMIARES,
      notes: [
        "Monitorar frequência cardíaca, pressão arterial e lactato.",
        "Risco de taquiarritmia e aumento de consumo miocárdico — reservar para choque refratário a noradrenalina.",
      ],
    },
  },
  {
    key: "dobutamina",
    faixaDeDose: { min: 0.5, max: 20, passo: 0.5 },
    name: "Dobutamina",
    emoji: "💓",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "dobu-250mg-20ml",
        label: "Ampola 20 mL • 250 mg por ampola",
        container: "Ampola",
        volumeLabel: "20 mL",
        concentrationLabel: "12,5 mg/mL",
        ampouleVolumeMl: 20,
        basePerAmpoule: 250000,
        fonte: "Cloridrato de dobutamina 12,5 mg/mL, ampola 20 mL (Hipolabor / Teuto) — bula ANVISA.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-2000",
        label: "2000 mcg/mL • 1 amp + 105 mL → 125 mL final",
        diluent: "SG",
        presentationId: "dobu-250mg-20ml",
        ampoules: "1",
        diluentMl: "105",
      },
      {
        id: "padrao-4000",
        label: "4000 mcg/mL • 2 amp + 85 mL → 125 mL final",
        diluent: "SG",
        presentationId: "dobu-250mg-20ml",
        ampoules: "2",
        diluentMl: "85",
      },
    ],
    reference: {
      usual: "2,5–20 mcg/kg/min",
      titration: "Ajustar por perfusão, diurese e resposta ecocardiográfica",
      notes: [
        "Se houver hipotensão, associar vasopressor (noradrenalina 1ª linha).",
        "Indicação principal: disfunção sistólica do VE / choque cardiogênico.",
      ],
    },
  },
  {
    key: "dopamina",
    faixaDeDose: { min: 0.5, max: 20, passo: 0.5 },
    name: "Dopamina",
    emoji: "🧪",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    /**
     * ⚠️ APRESENTAÇÃO BRASILEIRA — 5 mg/mL × 10 mL = 50 mg por ampola.
     *
     * Este módulo trazia 200 mg/5 mL e 400 mg/10 mL (40 mg/mL), que é o
     * concentrado americano e NÃO é comercializado no Brasil. Ver o comentário
     * do campo `fonte` em `Presentation` para o que isso causava.
     *
     * As soluções padrão abaixo foram remontadas sobre a ampola de 50 mg, com
     * volumes que se preparam de verdade à beira do leito.
     */
    presentations: [
      {
        id: "dopa-50mg-10ml",
        label: "Ampola 10 mL • 50 mg por ampola",
        container: "Ampola",
        volumeLabel: "10 mL",
        concentrationLabel: "5 mg/mL",
        ampouleVolumeMl: 10,
        basePerAmpoule: 50000,
        fonte:
          "Cloridrato de dopamina 5 mg/mL, ampola 10 mL — referência Revivan; genéricos Blau (Dopabane), Hipolabor, União Química. Bula ANVISA.",
        notes:
          "A ampola brasileira tem 50 mg. Apresentações de 200 mg e 400 mg (40 mg/mL) são norte-americanas e não são vendidas aqui — conferir o rótulo antes de preparar.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-1000",
        label: "1000 mcg/mL • 5 amp + 200 mL → 250 mL final",
        diluent: "SG",
        presentationId: "dopa-50mg-10ml",
        ampoules: "5",
        diluentMl: "200",
      },
      {
        id: "padrao-2000",
        label: "2000 mcg/mL • 5 amp + 75 mL → 125 mL final",
        diluent: "SG",
        presentationId: "dopa-50mg-10ml",
        ampoules: "5",
        diluentMl: "75",
      },
    ],
    reference: {
      usual: "5–20 mcg/kg/min",
      notes: [
        "⚠️ Segunda linha para choque séptico — SSC 2021 prefere noradrenalina; usar dopamina apenas se contraindicação ou indisponibilidade.",
        "Maior risco de taquiarritmias e piores desfechos no choque séptico (De Backer et al., NEJM 2010).",
      ],
    },
  },
  {
    key: "vasopressina",
    faixaDeDose: { min: 0.01, max: 0.06, passo: 0.01 },
    name: "Vasopressina",
    emoji: "🧷",
    baseUnit: "U",
    doseUnit: "U/min",
    recommendedDiluent: "SF",
    presentations: [
      {
        id: "vaso-20u-1ml",
        label: "Ampola 1 mL • 20 U por ampola",
        container: "Ampola",
        volumeLabel: "1 mL",
        concentrationLabel: "20 U/mL",
        ampouleVolumeMl: 1,
        basePerAmpoule: 20,
        fonte: "Vasopressina 20 UI/mL, ampola 1 mL (Encrise — Blau) — bula ANVISA.",
      },
    ],
    standardSolutions: [
      {
        id: "padrao-0_2",
        label: "0,2 U/mL • 1 amp + 99 mL → 100 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "99",
      },
      {
        id: "padrao-0_4",
        label: "0,4 U/mL • 1 amp + 49 mL → 50 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "49",
      },
      {
        id: "padrao-1",
        label: "1 U/mL • 1 amp + 19 mL → 20 mL final",
        diluent: "SF",
        presentationId: "vaso-20u-1ml",
        ampoules: "1",
        diluentMl: "19",
      },
    ],
    reference: {
      usual: "0,03 U/min (dose fixa — choque séptico); 0,01–0,04 U/min em outros contextos",
      notes: [
        "Choque séptico (SSC 2021): dose fixa de 0,03 U/min — NÃO titular como vasopressor principal; usar como adjuvante para poupar noradrenalina.",
        "Não titulada para efeito vasopressor — manter dose fixa até desmame.",
      ],
    },
  },
  {
    key: "milrinona",
    faixaDeDose: { min: 0.125, max: 0.75, passo: 0.125 },
    name: "Milrinona",
    emoji: "💛",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "milri-10mg-10ml",
        label: "Frasco-ampola 10 mL • 10 mg (1 mg/mL)",
        container: "Frasco-ampola",
        volumeLabel: "10 mL",
        concentrationLabel: "1 mg/mL",
        ampouleVolumeMl: 10,
        basePerAmpoule: 10000,
        fonte: "Lactato de milrinona 1 mg/mL, frasco-ampola 10 mL (Primacor — Sanofi; genéricos Blau) — bula ANVISA.",
        notes: "Inibidor de fosfodiesterase III — efeito inotrópico e vasodilatador. Meia-vida longa (~2,5h). Ajuste em insuficiência renal.",
      },
    ],
    standardSolutions: [
      {
        id: "milri-100ugml",
        label: "100 mcg/mL • 1 fr + 90 mL → 100 mL final",
        diluent: "SG",
        presentationId: "milri-10mg-10ml",
        ampoules: "1",
        diluentMl: "90",
      },
      {
        id: "milri-200ugml",
        label: "200 mcg/mL • 2 fr + 80 mL → 100 mL final",
        diluent: "SG",
        presentationId: "milri-10mg-10ml",
        ampoules: "2",
        diluentMl: "80",
      },
    ],
    reference: {
      usual: "0,375–0,75 mcg/kg/min (manutenção); ataque opcional: 50 mcg/kg em 10 min",
      titration: "Ajustar conforme resposta hemodinâmica e diurese. Reduzir em IRA.",
      notes: [
        "⚠️ Dose de ataque (50 mcg/kg em 10 min) pode causar hipotensão — considerar omitir em pacientes instáveis.",
        "Renalmente eliminada — reduzir dose em CrCl < 50 mL/min; evitar em IRA grave.",
        "Efeito persiste horas após suspensão (meia-vida longa) — desmame gradual.",
        "Frequentemente associada a noradrenalina para prevenir hipotensão (efeito vasodilatador).",
      ],
    },
  },
  {
    key: "levosimendan",
    faixaDeDose: { min: 0.05, max: 0.2, passo: 0.05 },
    name: "Levosimendan",
    emoji: "🫀",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "levo-12mg5ml",
        label: "Frasco-ampola 5 mL • 12,5 mg (2,5 mg/mL)",
        container: "Frasco-ampola",
        volumeLabel: "5 mL",
        concentrationLabel: "2,5 mg/mL",
        ampouleVolumeMl: 5,
        basePerAmpoule: 12500,
        fonte: "Levosimendana 2,5 mg/mL, frasco-ampola 5 mL (Simdax — Orion/Abbott) — bula ANVISA.",
        notes: "Sensibilizador de cálcio + abertura de canais K-ATP. Efeito hemodinâmico persiste 7–9 dias (metabólito ativo OR-1896).",
      },
    ],
    standardSolutions: [
      {
        id: "levo-50ugml",
        label: "50 mcg/mL • 1 fr + 245 mL → 250 mL final",
        diluent: "SG",
        presentationId: "levo-12mg5ml",
        ampoules: "1",
        diluentMl: "245",
      },
      {
        id: "levo-25ugml",
        label: "25 mcg/mL • 1 fr + 495 mL → 500 mL final",
        diluent: "SG",
        presentationId: "levo-12mg5ml",
        ampoules: "1",
        diluentMl: "495",
      },
    ],
    reference: {
      usual: "0,05–0,2 mcg/kg/min por 24h; ataque: 6–12 mcg/kg em 10 min (opcional)",
      titration: "Infusão única de 24h contínua.",
      notes: [
        "Dose de ataque frequentemente OMITIDA em pacientes instáveis — risco de hipotensão.",
        "Efeito hemodinâmico se estende 7–9 dias pelo metabólito ativo OR-1896.",
        "Monitorar PA durante infusão — pode necessitar suporte vasopressor.",
        "Diluir SG 5% SOMENTE. Proteger da luz. Não repetir dentro de 90 dias sem reavaliação.",
        "Indicações: ICC descompensada grave, choque cardiogênico, desmame de suporte circulatório mecânico.",
      ],
    },
  },
  {
    key: "nitroprussiato",
    faixaDeDose: { min: 0.1, max: 10, passo: 0.1 },
    name: "Nitroprussiato",
    emoji: "🩵",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "nitrop-50mg",
        label: "Frasco-ampola 50 mg pó liofilizado",
        container: "Frasco-ampola",
        volumeLabel: "≈ 2 mL reconstituído",
        concentrationLabel: "50 mg/frasco",
        ampouleVolumeMl: 2,
        basePerAmpoule: 50000,
        fonte:
          "Nitroprusseto de sódio 50 mg, pó liofilizado para solução injetável (Nitroprus — Cristália) — bula profissional. A apresentação em solução 25 mg/mL × 2 mL (Nipride) tem registro vencido na ANVISA; o pó de 50 mg é o que circula.",
        notes: "⚠️ FOTOSSENSÍVEL — proteger da luz com papel alumínio. Usar SG 5% SOMENTE. Toxicidade por cianeto em doses > 2 mcg/kg/min por > 24–48h.",
      },
    ],
    standardSolutions: [
      {
        id: "nitrop-200ugml",
        label: "200 mcg/mL • 1 fr + 248 mL → 250 mL final",
        diluent: "SG",
        presentationId: "nitrop-50mg",
        ampoules: "1",
        diluentMl: "248",
      },
      {
        id: "nitrop-100ugml",
        label: "100 mcg/mL • 1 fr + 498 mL → 500 mL final",
        diluent: "SG",
        presentationId: "nitrop-50mg",
        ampoules: "1",
        diluentMl: "498",
      },
    ],
    reference: {
      usual: "0,3–2 mcg/kg/min; máx seguro 10 mcg/kg/min por < 10 min",
      titration: "Titular a cada 5 min conforme PA alvo. Iniciar com dose mínima.",
      max: "10 mcg/kg/min somente por curto período. Acima de 2 mcg/kg/min por > 24–48h: risco de toxicidade por cianeto.",
      notes: [
        "⚠️ FOTOSSENSÍVEL — enrolar equipo e seringa em papel alumínio.",
        "⚠️ Toxicidade por cianeto: alerta em doses altas ou uso prolongado (IH/IR). Sinais: taquicardia, confusão, acidose láctica. Antídoto: hidroxocobalamina ou tiossulfato de sódio.",
        "Usar SG 5% SOMENTE — precipita com SF.",
        "Contraindicado em HIC (vasodilatação cerebral aumenta PIC).",
        "Indicações: emergência hipertensiva, dissecção de aorta, IC aguda grave com PAM muito elevada.",
      ],
    },
  },
  {
    key: "nitroglicerina",
    faixaDeDose: { min: 5, max: 200, passo: 5 },
    name: "Nitroglicerina",
    emoji: "💚",
    baseUnit: "mcg",
    doseUnit: "mcg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "ntg-50mg-10ml",
        label: "Ampola 10 mL • 50 mg (5 mg/mL)",
        container: "Ampola",
        volumeLabel: "10 mL",
        concentrationLabel: "5 mg/mL",
        ampouleVolumeMl: 10,
        basePerAmpoule: 50000,
        fonte: "Nitroglicerina 5 mg/mL, ampola 10 mL (Tridil — Cristália) — bula ANVISA.",
        notes: "⚠️ NÃO usar equipo de PVC — adsorção reduz concentração. Usar vidro ou polietileno.",
      },
      {
        id: "ntg-25mg-5ml",
        label: "Ampola 5 mL • 25 mg (5 mg/mL)",
        container: "Ampola",
        volumeLabel: "5 mL",
        concentrationLabel: "5 mg/mL",
        ampouleVolumeMl: 5,
        basePerAmpoule: 25000,
        fonte: "Nitroglicerina 5 mg/mL, ampola 5 mL (Tridil — Cristália) — bula ANVISA.",
        notes: "⚠️ NÃO usar equipo de PVC — adsorção reduz concentração. Usar vidro ou polietileno.",
      },
    ],
    standardSolutions: [
      {
        id: "ntg-200ugml",
        label: "200 mcg/mL • 1 amp + 240 mL → 250 mL final",
        diluent: "SG",
        presentationId: "ntg-50mg-10ml",
        ampoules: "1",
        diluentMl: "240",
      },
      {
        id: "ntg-100ugml",
        label: "100 mcg/mL • 1 amp + 245 mL → 250 mL final",
        diluent: "SG",
        presentationId: "ntg-25mg-5ml",
        ampoules: "1",
        diluentMl: "245",
      },
    ],
    reference: {
      usual: "5–200 mcg/min (dose NÃO depende do peso)",
      titration: "Iniciar 5–10 mcg/min; aumentar 5–10 mcg/min a cada 3–5 min conforme PA e sintomas.",
      max: "200–400 mcg/min; tolerância desenvolve em 24–48h de uso contínuo.",
      notes: [
        "⚠️ NÃO usar equipo de PVC — usar vidro ou polietileno.",
        "Doses baixas (< 40 mcg/min): vasodilatação venosa predominante — reduz pré-carga.",
        "Doses altas (> 150 mcg/min): vasodilatação arterial — reduz pós-carga.",
        "Tolerância: pode desenvolver em 24–48h contínuos — janela de 8–12h sem droga.",
        "Indicações: EPA hipertensivo, SCA com IC/angina, emergência hipertensiva.",
        NITRATO_CONTRAINDICACAO_PDE5,
        NITRATO_PDE5_USO_CRONICO,
      ],
    },
  },
  {
    key: "fenilefrina",
    faixaDeDose: { min: 0.1, max: 5, passo: 0.1 },
    name: "Fenilefrina",
    emoji: "🔵",
    baseUnit: "mcg",
    doseUnit: "mcg/kg/min",
    recommendedDiluent: "SG",
    presentations: [
      {
        id: "feni-10mg-1ml",
        label: "Ampola 1 mL • 10 mg (10 mg/mL)",
        container: "Ampola",
        volumeLabel: "1 mL",
        concentrationLabel: "10 mg/mL",
        ampouleVolumeMl: 1,
        basePerAmpoule: 10000,
        fonte: "Cloridrato de fenilefrina 10 mg/mL, ampola 1 mL (Hipolabor / Cristália) — bula ANVISA.",
      },
    ],
    standardSolutions: [
      {
        id: "feni-100ugml",
        label: "100 mcg/mL • 1 amp + 99 mL → 100 mL final",
        diluent: "SG",
        presentationId: "feni-10mg-1ml",
        ampoules: "1",
        diluentMl: "99",
      },
      {
        id: "feni-200ugml",
        label: "200 mcg/mL • 2 amp + 98 mL → 100 mL final",
        diluent: "SG",
        presentationId: "feni-10mg-1ml",
        ampoules: "2",
        diluentMl: "98",
      },
    ],
    reference: {
      usual: "0,5–5 mcg/kg/min IV contínuo",
      titration: "Titular pela PAM. Reduzir se bradicardia reflexa excessiva.",
      notes: [
        "Agonista alfa-1 PURO — sem efeito beta: causa bradicardia reflexa (reduz FC).",
        "Vantagem: útil em hipotensão com taquicardia (evita o efeito cronotrópico da noradrenalina).",
        "Desvantagem: pode reduzir débito cardíaco por aumento da pós-carga — avaliar função ventricular antes.",
        "Indicações: hipotensão perioperatória, choque vasodilatador sem disfunção cardíaca, contraindicação a noradrenalina.",
        "Segunda linha em choque séptico vs. noradrenalina — evidência menor.",
      ],
    },
  },
];

/**
 * O preparo COMPLETO descrito por uma solução padrão.
 *
 * ── POR QUE ISTO É UMA FUNÇÃO, E NÃO QUATRO ATRIBUIÇÕES ──────────────────────
 *
 * A tela montava o estado inicial assim:
 *
 *     ampoules       ← standardSolutions[0].ampoules
 *     diluentMl      ← standardSolutions[0].diluentMl
 *     presentationId ← presentations[0].id          ← outra fonte
 *
 * Três linhas, duas origens. Na dopamina elas discordavam, e o resultado foi um
 * atalho pintado como ATIVO exibindo "1600 mcg/mL" enquanto a conta rodava com
 * 816 mcg/mL — quase o dobro na taxa da bomba, sem nada na tela denunciando.
 *
 * Trocar `presentations[0]` por `sol.presentationId` consertaria a dopamina de
 * hoje e deixaria a armadilha armada: no dia em que a solução padrão ganhar um
 * quinto campo, quem esquecer de copiá-lo reproduz o mesmo defeito, idêntico.
 *
 * Por isso o preparo é DERIVADO DE UMA VEZ, do objeto inteiro. Campo novo em
 * `StandardSolution` entra aqui, num lugar só, e todos os consumidores —
 * estado inicial, aplicar atalho, marcar atalho como ativo — o recebem juntos.
 * Nenhum ponto do app tem permissão de montar preparo campo a campo.
 */
export type Preparo = {
  ampoules: string;
  diluentMl: string;
  diluent: Diluent;
  presentationId: string;
};

export function preparoDaSolucao(solution: StandardSolution): Preparo {
  return {
    ampoules: solution.ampoules,
    diluentMl: solution.diluentMl,
    diluent: solution.diluent,
    presentationId: solution.presentationId,
  };
}

/**
 * Preparo de partida de uma droga: o da primeira solução padrão, INTEIRO.
 *
 * Vive aqui, e não na tela, para que exista um único lugar no app capaz de
 * responder "com o que esta droga abre". A tela consome; o validador confere o
 * mesmo objeto que a tela usa, e não uma cópia dele.
 *
 * Sem solução padrão cadastrada, cai num preparo manual coerente.
 */
export function preparoInicial(drug: Drug): Preparo {
  const solucao = drug.standardSolutions?.[0];
  if (solucao) return preparoDaSolucao(solucao);
  return {
    ampoules: "1",
    diluentMl: "250",
    diluent: drug.recommendedDiluent ?? "SG",
    presentationId: drug.presentations[0].id,
  };
}

/** Dois preparos são o mesmo preparo? Comparação do objeto INTEIRO. */
export function mesmoPreparo(a: Preparo, b: Preparo): boolean {
  return (
    a.ampoules === b.ampoules &&
    a.diluentMl === b.diluentMl &&
    a.diluent === b.diluent &&
    a.presentationId === b.presentationId
  );
}

function parseDecimal(input: string) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  if (
    value === "." ||
    value === "," ||
    value.endsWith(".") ||
    value.endsWith(",")
  ) {
    const core = value.slice(0, -1);
    if (!core) {
      return null;
    }

    const parsedCore = Number(core.replace(",", "."));
    return Number.isFinite(parsedCore) ? parsedCore : null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, decimals = 2) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  return value.toFixed(decimals).replace(".", ",");
}

function createSession(): Session {
  const firstDrug = DRUGS[0];
  return {
    protocolId: protocolData.id,
    currentStateId: protocolData.initialState,
    history: [
      {
        timestamp: Date.now(),
        type: "PROTOCOL_STARTED",
      },
    ],
    pendingEffects: [],
    protocolStartedAt: Date.now(),
    mode: "doseToRate",
    diluent: firstDrug.recommendedDiluent ?? "SF",
    presentationId: firstDrug.presentations[0].id,
    ampoules: "1",
    diluentMl: "250",
    weightKg: "80",
    heightCm: "",
    doseInput: "0,05",
    rateInput: "",
  };
}

let session = createSession();

function getDrugByKey(key?: string) {
  return DRUGS.find((drug) => drug.key === key);
}

function getSelectedDrug() {
  return getDrugByKey(session.selectedDrugKey);
}

function getPresentation(drug: Drug, presentationId?: string) {
  return (
    drug.presentations.find((presentation) => presentation.id === presentationId) ??
    drug.presentations[0]
  );
}

function getCurrentStateId() {
  return session.currentStateId;
}

function buildSolutionOptionKey(solution: StandardSolution) {
  return `solucao_padrao:${solution.id}:${solution.label}`;
}

function getStateTemplate(stateId: string) {
  const state = protocolData.states[stateId];
  if (!state) {
    throw new Error(`Estado inválido: ${stateId}`);
  }

  return state;
}

function getSolutionLabelById(drug: Drug, solutionId?: string) {
  const solution = drug.standardSolutions?.find((item) => item.id === solutionId);
  return solution ? solution.label : "Configuração manual";
}

function getModeLabel(mode: CalculatorMode) {
  return mode === "doseToRate" ? "Dose → mL/h" : "mL/h → dose";
}

function getConfigToken() {
  return [
    session.selectedDrugKey ?? "",
    session.selectedSolutionId ?? "manual",
    session.mode,
    session.diluent,
    session.presentationId,
    session.ampoules,
    session.diluentMl,
    session.weightKg,
    session.doseInput,
    session.rateInput,
  ].join("|");
}

function logEvent(type: string, data?: Event["data"]) {
  session.history.push({
    timestamp: Date.now(),
    type,
    data,
  });
}

function enqueueEffect(effect: EngineEffect) {
  session.pendingEffects.push(effect);
}

function consumeEffects() {
  const effects = [...session.pendingEffects];
  session.pendingEffects = [];
  return effects;
}

function applyDrugDefaults(drug: Drug) {
  session.selectedDrugKey = drug.key;
  session.selectedSolutionId = undefined;
  session.mode = "doseToRate";
  session.diluent = drug.recommendedDiluent ?? "SF";
  session.presentationId = drug.presentations[0].id;
  session.ampoules = "1";
  session.diluentMl = drug.key === "vasopressina" ? "99" : "250";
  session.weightKg = session.weightKg || "80";
  session.doseInput = drug.doseUnit === "U/min" ? "0,03" : "0,05";
  session.rateInput = "";
  session.confirmedConfigToken = undefined;
  session.lastConfirmedAction = undefined;
  session.lastConfirmedSummary = undefined;
  session.vasopressinAlertToken = undefined;
}

function applyStandardSolution(drug: Drug, solutionId: string) {
  const solution = drug.standardSolutions?.find((item) => item.id === solutionId);
  if (!solution) {
    throw new Error("Solução padrão inválida.");
  }

  // Preparo derivado de uma vez — ver `preparoDaSolucao`.
  const preparo = preparoDaSolucao(solution);
  session.selectedSolutionId = solutionId;
  session.diluent = preparo.diluent;
  session.presentationId = preparo.presentationId;
  session.ampoules = preparo.ampoules;
  session.diluentMl = preparo.diluentMl;
  session.confirmedConfigToken = undefined;
}

function calculate(drug: Drug): CalculationResult {
  const presentation = getPresentation(drug, session.presentationId);
  const ampoules = parseDecimal(session.ampoules) ?? 0;
  const diluentMl = parseDecimal(session.diluentMl) ?? 0;
  const finalVolumeMl = diluentMl + ampoules * presentation.ampouleVolumeMl;
  const totalBase = ampoules * presentation.basePerAmpoule;
  const concentration = finalVolumeMl > 0 ? totalBase / finalVolumeMl : 0;
  const weightKg = parseDecimal(session.weightKg) ?? 0;
  const doseInput = parseDecimal(session.doseInput);
  const rateInput = parseDecimal(session.rateInput);

  const toMlH = (basePerMinute: number) => {
    if (concentration <= 0) {
      return null;
    }

    return (basePerMinute / concentration) * 60;
  };

  const fromMlH = (mlPerHour: number) => {
    if (concentration <= 0) {
      return null;
    }

    return (mlPerHour * concentration) / 60;
  };

  let outRateMlH: number | null = null;
  let outDose: number | null = null;

  if (session.mode === "doseToRate") {
    if (doseInput != null) {
      let basePerMinute = 0;

      if (drug.doseUnit === "mcg/kg/min") {
        if (weightKg > 0) {
          basePerMinute = doseInput * weightKg;
        }
      } else if (drug.doseUnit === "mcg/min") {
        basePerMinute = doseInput;
      } else if (drug.doseUnit === "mg/h") {
        basePerMinute = doseInput / 60;
      } else if (drug.doseUnit === "U/min") {
        basePerMinute = doseInput;
      }

      outRateMlH = toMlH(basePerMinute);
    }
  } else if (rateInput != null) {
    const basePerMinute = fromMlH(rateInput);

    if (basePerMinute != null) {
      if (drug.doseUnit === "mcg/kg/min") {
        outDose = weightKg > 0 ? basePerMinute / weightKg : null;
      } else if (drug.doseUnit === "mcg/min") {
        outDose = basePerMinute;
      } else if (drug.doseUnit === "mg/h") {
        outDose = basePerMinute * 60;
      } else if (drug.doseUnit === "U/min") {
        outDose = basePerMinute;
      }
    }
  }

  return {
    ampoules,
    diluentMl,
    finalVolumeMl,
    totalBase,
    concentration,
    weightKg,
    outRateMlH,
    outDose,
    currentDoseMcgKgMin:
      drug.key === "noradrenalina"
        ? session.mode === "doseToRate"
          ? doseInput
          : outDose
        : null,
    presentation,
  };
}

function buildConcentrationLabel(drug: Drug, calculation: CalculationResult) {
  if (calculation.concentration <= 0) {
    return "—";
  }

  if (drug.baseUnit === "U") {
    return `${formatNumber(calculation.concentration, 3)} U/mL`;
  }

  if (drug.baseUnit === "mg") {
    return `${formatNumber(calculation.concentration, 3)} mg/mL`;
  }

  return `${formatNumber(
    calculation.concentration,
    calculation.concentration < 100 ? 2 : 1
  )} mcg/mL`;
}

function buildPrimaryResultLabel(drug: Drug, calculation: CalculationResult) {
  if (session.mode === "doseToRate") {
    if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
      return "Informar peso em kg";
    }

    if (calculation.outRateMlH == null) {
      return "—";
    }

    return `${formatNumber(
      calculation.outRateMlH,
      calculation.outRateMlH < 10 ? 2 : 1
    )} mL/h`;
  }

  if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
    return "Informar peso em kg";
  }

  if (calculation.outDose == null) {
    return "—";
  }

  const decimals = drug.doseUnit === "U/min" ? 3 : 3;
  return `${formatNumber(calculation.outDose, decimals)} ${drug.doseUnit}`;
}

function buildReferenceLines(drug: Drug) {
  const details: string[] = [];

  if (drug.reference.usual) {
    details.push(`Faixa usual: ${drug.reference.usual}`);
  }

  if (drug.reference.titration) {
    details.push(`Titulação: ${drug.reference.titration}`);
  }

  if (drug.reference.max) {
    details.push(`Limite / observação: ${drug.reference.max}`);
  }

  if (drug.reference.notes?.length) {
    details.push(...drug.reference.notes);
  }

  return details;
}

function buildConfirmedSummary(drug: Drug, calculation: CalculationResult) {
  const result = buildPrimaryResultLabel(drug, calculation);
  const concentration = buildConcentrationLabel(drug, calculation);
  const targetLabel =
    session.mode === "doseToRate"
      ? `Dose alvo ${session.doseInput || "—"} ${drug.doseUnit}`
      : `Velocidade ${session.rateInput || "—"} mL/h`;

  return [
    `${drug.name}`,
    `${concentration}`,
    `${targetLabel}`,
    `${result}`,
    `${getSolutionLabelById(drug, session.selectedSolutionId)}`,
  ].join(" • ");
}

function validateCurrentConfiguration(drug: Drug, calculation: CalculationResult) {
  if (!session.selectedDrugKey) {
    throw new Error("Selecione uma droga antes de confirmar a conduta.");
  }

  if (calculation.finalVolumeMl <= 0 || calculation.concentration <= 0) {
    throw new Error("Defina ampolas e volume final válidos antes de confirmar.");
  }

  if (drug.doseUnit === "mcg/kg/min" && calculation.weightKg <= 0) {
    throw new Error("Informe o peso em kg para drogas dependentes de peso.");
  }

  if (session.mode === "doseToRate") {
    if (parseDecimal(session.doseInput) == null) {
      throw new Error("Informe a dose desejada antes de confirmar.");
    }

    if (calculation.outRateMlH == null) {
      throw new Error("Não foi possível calcular a velocidade da bomba.");
    }
  } else {
    if (parseDecimal(session.rateInput) == null) {
      throw new Error("Informe a velocidade da bomba antes de confirmar.");
    }

    if (calculation.outDose == null) {
      throw new Error("Não foi possível calcular a dose a partir da velocidade.");
    }
  }
}

function getCurrentState(): ProtocolState {
  const template = getStateTemplate(session.currentStateId);
  const drug = getSelectedDrug();

  if (session.currentStateId === "selecionar_preparo" && drug) {
    const options: Record<string, string> = {};

    for (const solution of drug.standardSolutions ?? []) {
      options[buildSolutionOptionKey(solution)] = "selecionar_modo";
    }

    options.configuracao_manual_sf = "selecionar_modo";
    options.configuracao_manual_sg = "selecionar_modo";

    return {
      ...template,
      text: `Qual solução deseja usar para ${drug.name}?`,
      speak: `Selecionar solução para ${drug.name}`,
      details: [
        "Escolha uma solução padrão ou montagem manual.",
        `Diluente preferencial: ${drug.recommendedDiluent ?? "conforme protocolo local"}.`,
      ],
      options,
    };
  }

  if (session.currentStateId === "selecionar_modo" && drug) {
    return {
      ...template,
      text: `Como deseja calcular ${drug.name}?`,
      speak: `Definir modo de cálculo para ${drug.name}`,
      details: [
        `Solução: ${getSolutionLabelById(drug, session.selectedSolutionId)}`,
        "Escolha entre calcular a taxa da bomba a partir da dose ou converter mL por hora em dose.",
      ],
      options: {
        dose_para_velocidade: "configurar_infusao",
        velocidade_para_dose: "configurar_infusao",
      },
    };
  }

  if (session.currentStateId === "configurar_infusao" && drug) {
    const calculation = calculate(drug);
    return {
      ...template,
      text: `Configurar ${drug.name}`,
      speak:
        session.lastConfirmedAction === "adjust"
          ? `Ajustar dose de ${drug.name}`
          : `Iniciar ${drug.name}`,
      details: [
        `Modo: ${getModeLabel(session.mode)}`,
        `Concentração atual: ${buildConcentrationLabel(drug, calculation)}`,
        "Use o painel para revisar preparo, concentração e resultado.",
        "Confirme a sugestão no painel antes de avançar.",
      ],
    };
  }

  if (session.currentStateId === "revisar_infusao" && drug) {
    const details = session.lastConfirmedSummary
      ? [
          `Conduta confirmada: ${session.lastConfirmedSummary}`,
          "Revisar perfusão, hemodinâmica e metas clínicas antes de aplicar.",
        ]
      : [
          "Nenhum preparo confirmado ainda.",
          "Retorne para configurar a infusão.",
        ];

    return {
      ...template,
      text: `Revisar conduta para ${drug.name}`,
      speak: `Revisar conduta para ${drug.name}`,
      details,
    };
  }

  return template;
}

function getTimers(): TimerState[] {
  return [];
}

function getDocumentationActions(): DocumentationAction[] {
  return [];
}

function getReversibleCauses(): ReversibleCause[] {
  return [];
}

function updateReversibleCauseStatus(): ReversibleCause[] {
  return [];
}

function registerExecution(): ClinicalLogEntry[] {
  return getClinicalLog();
}

function resetSession() {
  session = createSession();
  return getCurrentState();
}

function transitionTo(nextStateId: string) {
  session.currentStateId = nextStateId;
  logEvent("STATE_CHANGED", { to: nextStateId });
  return getCurrentState();
}

function next(input?: string) {
  const state = getCurrentState();
  const template = getStateTemplate(session.currentStateId);

  if (state.type === "action") {
    if (session.currentStateId === "configurar_infusao") {
      if (session.confirmedConfigToken !== getConfigToken()) {
        throw new Error("Confirme o preparo ou ajuste no painel antes de avançar.");
      }
    }

    if (!template.next) {
      throw new Error("Não há próximo estado configurado.");
    }

    if (session.currentStateId === "introducao") {
      logEvent("INTRO_COMPLETED");
    }

    return transitionTo(template.next);
  }

  if (state.type === "end") {
    return state;
  }

  if (!input) {
    throw new Error("Resposta inválida.");
  }

  if (session.currentStateId === "selecionar_droga") {
    const drug = getDrugByKey(input);
    if (!drug) {
      throw new Error("Droga inválida.");
    }

    applyDrugDefaults(drug);
    logEvent("DRUG_SELECTED", { drug: drug.name });
    return transitionTo("selecionar_preparo");
  }

  if (session.currentStateId === "selecionar_preparo") {
    const drug = getSelectedDrug();
    if (!drug) {
      throw new Error("Selecione uma droga antes da solução.");
    }

    if (input.startsWith("solucao_padrao:")) {
      const [, solutionId] = input.split(":", 3);
      applyStandardSolution(drug, solutionId);
      logEvent("SOLUTION_SELECTED", {
        drug: drug.name,
        solution: getSolutionLabelById(drug, solutionId),
      });
      return transitionTo("selecionar_modo");
    }

    if (input === "configuracao_manual_sf" || input === "configuracao_manual_sg") {
      session.selectedSolutionId = undefined;
      session.diluent = input === "configuracao_manual_sf" ? "SF" : "SG";
      session.confirmedConfigToken = undefined;
      logEvent("SOLUTION_SELECTED", {
        drug: drug.name,
        solution: `Configuração manual ${session.diluent}`,
      });
      return transitionTo("selecionar_modo");
    }

    throw new Error("Opção de solução inválida.");
  }

  if (session.currentStateId === "selecionar_modo") {
    if (input !== "dose_para_velocidade" && input !== "velocidade_para_dose") {
      throw new Error("Modo inválido.");
    }

    session.mode = input === "dose_para_velocidade" ? "doseToRate" : "rateToDose";
    session.confirmedConfigToken = undefined;
    logEvent("MODE_SELECTED", { mode: getModeLabel(session.mode) });
    return transitionTo("configurar_infusao");
  }

  const nextStateId = state.options?.[input];
  if (!nextStateId) {
    throw new Error("Resposta inválida.");
  }

  if (session.currentStateId === "revisar_infusao" && input === "concluir") {
    logEvent("MODULE_COMPLETED", {
      drug: getSelectedDrug()?.name ?? "Não definida",
    });
  }

  return transitionTo(nextStateId);
}

function buildAuxiliaryActions(drug: Drug) {
  const actions = [];

  if (drug.presentations.length > 1) {
    for (const presentation of drug.presentations) {
      actions.push({
        id: `presentation:${presentation.id}`,
        label: presentation.label,
      });
    }
  }

  actions.push({
    id: "diluent:SF",
    label: "Usar SF",
  });
  actions.push({
    id: "diluent:SG",
    label: "Usar SG",
  });
  actions.push({
    id: session.mode === "doseToRate" ? "confirm_prepare" : "confirm_adjust",
    label:
      session.mode === "doseToRate"
        ? "Confirmar preparo e taxa"
        : "Confirmar revisão de ajuste",
    requiresConfirmation: true,
  });

  return actions;
}

function getAuxiliaryPanel(): AuxiliaryPanel | null {
  const drug = getSelectedDrug();
  if (!drug) {
    return null;
  }

  if (
    session.currentStateId !== "configurar_infusao" &&
    session.currentStateId !== "revisar_infusao"
  ) {
    return null;
  }

  const calculation = calculate(drug);
  const concentrationLabel = buildConcentrationLabel(drug, calculation);
  const resultLabel = buildPrimaryResultLabel(drug, calculation);

  return {
    title: `${drug.emoji} ${drug.name}`,
    description: `${getSolutionLabelById(drug, session.selectedSolutionId)} • ${getModeLabel(
      session.mode
    )}`,
    fields: [
      {
        id: "weightKg",
        label: "Peso (kg)",
        value: session.weightKg,
        placeholder: "80",
        keyboardType: "numeric",
        helperText:
          drug.doseUnit === "mcg/kg/min"
            ? "Obrigatório para drogas dependentes de peso."
            : "Opcional para esta droga.",
      },
      {
        id: "heightCm",
        label: "Altura (cm)",
        value: session.heightCm,
        placeholder: "170",
        keyboardType: "numeric",
        helperText: "Registrar junto ao peso para manter os dados antropométricos completos.",
      },
      {
        id: "ampoules",
        label: "Número de ampolas",
        value: session.ampoules,
        placeholder: "1",
        keyboardType: "numeric",
      },
      {
        id: "diluentMl",
        label: "Volume do diluente (mL)",
        value: session.diluentMl,
        placeholder: "250",
        keyboardType: "numeric",
        helperText: `Diluente atual: ${session.diluent}`,
      },
      {
        id: session.mode === "doseToRate" ? "doseInput" : "rateInput",
        label:
          session.mode === "doseToRate"
            ? `Dose alvo (${drug.doseUnit})`
            : "Velocidade da bomba (mL/h)",
        value: session.mode === "doseToRate" ? session.doseInput : session.rateInput,
        placeholder: session.mode === "doseToRate" ? "0,05" : "5",
        keyboardType: "numeric",
        helperText:
          session.mode === "doseToRate"
            ? "Aceita 0,05 ou 0.05."
            : "Use a velocidade programada na bomba.",
      },
    ],
    metrics: [
      { label: "Apresentação", value: calculation.presentation.label },
      { label: "Concentração", value: concentrationLabel },
      {
        label: "Volume final",
        value:
          calculation.finalVolumeMl > 0
            ? `${formatNumber(calculation.finalVolumeMl, 0)} mL`
            : "—",
      },
      {
        label: `Total (${drug.baseUnit})`,
        value:
          calculation.totalBase > 0
            ? formatNumber(
                calculation.totalBase,
                drug.baseUnit === "U" ? 2 : calculation.totalBase < 10000 ? 1 : 0
              )
            : "—",
      },
      { label: "Resultado principal", value: resultLabel },
      ...(drug.reference.usual
        ? [{ label: "Faixa usual", value: drug.reference.usual }]
        : []),
    ],
    actions: buildAuxiliaryActions(drug),
  };
}

function updateAuxiliaryField(fieldId: string, value: string) {
  if (
    fieldId !== "weightKg" &&
    fieldId !== "heightCm" &&
    fieldId !== "ampoules" &&
    fieldId !== "diluentMl" &&
    fieldId !== "doseInput" &&
    fieldId !== "rateInput"
  ) {
    return getAuxiliaryPanel();
  }

  session[fieldId] = value;
  return getAuxiliaryPanel();
}

function getActionSpeech(drug: Drug, actionId: string) {
  if (actionId === "confirm_adjust") {
    return `Ajustar dose de ${drug.name} conforme perfusão`;
  }

  if (drug.key === "noradrenalina") {
    return "Iniciar noradrenalina";
  }

  if (drug.key === "adrenalina") {
    return "Iniciar adrenalina";
  }

  if (drug.key === "vasopressina") {
    return "Iniciar vasopressina";
  }

  return `Iniciar ${drug.name}`;
}

function runAuxiliaryAction(actionId: string) {
  const drug = getSelectedDrug();
  if (!drug) {
    throw new Error("Selecione uma droga antes de usar o painel.");
  }

  if (actionId.startsWith("presentation:")) {
    session.presentationId = actionId.replace("presentation:", "");
    session.confirmedConfigToken = undefined;
    logEvent("PRESENTATION_SELECTED", {
      drug: drug.name,
      presentation: getPresentation(drug, session.presentationId).label,
    });
    return getClinicalLog();
  }

  if (actionId === "diluent:SF" || actionId === "diluent:SG") {
    session.diluent = actionId.replace("diluent:", "") as Diluent;
    session.selectedSolutionId = undefined;
    session.confirmedConfigToken = undefined;
    logEvent("DILUENT_SELECTED", {
      drug: drug.name,
      diluent: session.diluent,
    });
    return getClinicalLog();
  }

  if (actionId !== "confirm_prepare" && actionId !== "confirm_adjust") {
    return getClinicalLog();
  }

  const calculation = calculate(drug);
  validateCurrentConfiguration(drug, calculation);
  const summary = buildConfirmedSummary(drug, calculation);
  const title =
    actionId === "confirm_prepare" ? "Preparo sugerido" : "Ajuste sugerido";
  const primaryResult = buildPrimaryResultLabel(drug, calculation);
  const details = [
    summary,
    ...buildReferenceLines(drug).slice(0, 2),
  ].join("\n");

  session.confirmedConfigToken = getConfigToken();
  session.lastConfirmedAction = actionId === "confirm_prepare" ? "prepare" : "adjust";
  session.lastConfirmedSummary = summary;

  enqueueEffect({
    type: "alert",
    title,
    message: details,
  });
  enqueueEffect({
    type: "speak",
    message: getActionSpeech(drug, actionId),
    suppressStateSpeech: true,
  });

  logEvent(actionId === "confirm_prepare" ? "PREPARATION_CONFIRMED" : "ADJUSTMENT_CONFIRMED", {
    drug: drug.name,
    summary,
    result: primaryResult,
    concentration: buildConcentrationLabel(drug, calculation),
  });

  const alertToken = `${drug.key}:${session.mode}:${calculation.currentDoseMcgKgMin ?? ""}`;
  if (
    drug.vasopressinAlert &&
    calculation.currentDoseMcgKgMin != null &&
    calculation.currentDoseMcgKgMin >= drug.vasopressinAlert.threshold &&
    session.vasopressinAlertToken !== alertToken
  ) {
    session.vasopressinAlertToken = alertToken;
    enqueueEffect({
      type: "alert",
      title: "Atenção clínica",
      message: drug.vasopressinAlert.message,
    });
    enqueueEffect({
      type: "speak",
      message: "Considerar associação de vasopressina",
      suppressStateSpeech: true,
    });
    logEvent("VASOPRESSIN_ASSOCIATION_SUGGESTED", {
      drug: drug.name,
      threshold: drug.vasopressinAlert.threshold,
    });
  }

  return getClinicalLog();
}

function getClinicalLog(): ClinicalLogEntry[] {
  return session.history.map((event) => {
    switch (event.type) {
      case "PROTOCOL_STARTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Módulo de drogas vasoativas iniciado",
          details: "Ferramenta prática de preparo e ajuste de infusões contínuas.",
        };
      case "DRUG_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Droga selecionada",
          details: String(event.data?.drug ?? ""),
        };
      case "SOLUTION_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Solução selecionada",
          details: `${event.data?.drug ?? ""} • ${event.data?.solution ?? ""}`,
        };
      case "MODE_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Modo de cálculo definido",
          details: String(event.data?.mode ?? ""),
        };
      case "PRESENTATION_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Apresentação farmacológica selecionada",
          details: String(event.data?.presentation ?? ""),
        };
      case "DILUENT_SELECTED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Diluente ajustado",
          details: `${event.data?.drug ?? ""} • ${event.data?.diluent ?? ""}`,
        };
      case "PREPARATION_CONFIRMED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Preparo confirmado",
          details: String(event.data?.summary ?? ""),
        };
      case "ADJUSTMENT_CONFIRMED":
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Ajuste confirmado",
          details: String(event.data?.summary ?? ""),
        };
      case "VASOPRESSIN_ASSOCIATION_SUGGESTED":
        return {
          timestamp: event.timestamp,
          kind: "vasopressor_reminder",
          title: "Associação de vasopressina sugerida",
          details: "Dose elevada de noradrenalina com necessidade de estratégia poupadora de catecolamina.",
        };
      case "MODULE_COMPLETED":
        return {
          timestamp: event.timestamp,
          kind: "encerramento",
          title: "Módulo concluído",
          details: `Droga final: ${event.data?.drug ?? "não definida"}`,
        };
      default:
        return {
          timestamp: event.timestamp,
          kind: "action_executed",
          title: "Atualização do módulo",
          details: event.type,
        };
    }
  });
}

function formatElapsedTime(timestamp: number) {
  const totalSeconds = Math.max(
    0,
    Math.floor((timestamp - session.protocolStartedAt) / 1000)
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getEncounterSummary(): EncounterSummary {
  const drug = getSelectedDrug();
  const calculation = drug ? calculate(drug) : null;
  const concentration = drug && calculation ? buildConcentrationLabel(drug, calculation) : "—";
  const result = drug && calculation ? buildPrimaryResultLabel(drug, calculation) : "—";
  const durationLabel = formatElapsedTime(Date.now());
  const log = getClinicalLog();

  return {
    protocolId: session.protocolId,
    durationLabel,
    currentStateId: session.currentStateId,
    currentStateText: getCurrentState().text,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: log.slice(-3).map((entry) => entry.title),
    metrics: [
      { label: "Peso", value: session.weightKg ? `${session.weightKg} kg` : "—" },
      { label: "Altura", value: session.heightCm ? `${session.heightCm} cm` : "—" },
      { label: "Droga", value: drug?.name ?? "Não definida" },
      { label: "Solução", value: drug ? getSolutionLabelById(drug, session.selectedSolutionId) : "—" },
      { label: "Modo", value: getModeLabel(session.mode) },
      { label: "Concentração", value: concentration },
      { label: "Resultado", value: result },
      {
        label: "Status",
        value:
          session.lastConfirmedAction === "prepare"
            ? "Preparo confirmado"
            : session.lastConfirmedAction === "adjust"
              ? "Ajuste confirmado"
              : "Pendente de confirmação",
      },
    ],
    panelMetrics: [
      { label: "Peso", value: session.weightKg ? `${session.weightKg} kg` : "—" },
      { label: "Altura", value: session.heightCm ? `${session.heightCm} cm` : "—" },
      { label: "Droga", value: drug?.name ?? "Não definida" },
      { label: "Concentração", value: concentration },
      { label: "Resultado", value: result },
      { label: "Modo", value: getModeLabel(session.mode) },
    ],
  };
}

function getEncounterSummaryText() {
  const summary = getEncounterSummary();
  const lines = [
    `Módulo: Drogas Vasoativas`,
    `Duração: ${summary.durationLabel}`,
    `Estado atual: ${summary.currentStateText}`,
  ];

  for (const metric of summary.metrics ?? []) {
    lines.push(`${metric.label}: ${metric.value}`);
  }

  if (session.lastConfirmedSummary) {
    lines.push(`Última conduta confirmada: ${session.lastConfirmedSummary}`);
  }

  lines.push("");
  lines.push("Log clínico:");
  for (const entry of getClinicalLog()) {
    lines.push(`- ${formatElapsedTime(entry.timestamp)} • ${entry.title}${entry.details ? ` — ${entry.details}` : ""}`);
  }

  return lines.join("\n");
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getEncounterReportHtml() {
  const summary = getEncounterSummary();
  const rows = (summary.metrics ?? [])
    .map(
      (metric) =>
        `<tr><td>${escapeHtml(metric.label)}</td><td>${escapeHtml(metric.value)}</td></tr>`
    )
    .join("");
  const log = getClinicalLog()
    .map(
      (entry) =>
        `<li><strong>${escapeHtml(formatElapsedTime(entry.timestamp))} • ${escapeHtml(
          entry.title
        )}</strong>${entry.details ? `<br/>${escapeHtml(entry.details)}` : ""}</li>`
    )
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>Relatório clínico • Drogas vasoativas</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 32px; color: #111827; }
      h1, h2 { margin-bottom: 12px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
      td { border: 1px solid #d1d5db; padding: 10px; vertical-align: top; }
      ul { padding-left: 20px; }
      li { margin-bottom: 12px; }
    </style>
  </head>
  <body>
    <h1>Relatório clínico • Drogas vasoativas</h1>
    <p>Duração: ${escapeHtml(summary.durationLabel)}</p>
    <p>Estado atual: ${escapeHtml(summary.currentStateText)}</p>
    <h2>Resumo operacional</h2>
    <table><tbody>${rows}</tbody></table>
    <h2>Log clínico</h2>
    <ul>${log}</ul>
  </body>
</html>`;
}

function tick() {
  return getCurrentState();
}

// ── Public pure-calculation API (used by VasoactiveCalculatorScreen) ─────────
export type { Drug, DrugKey, DoseUnit, Diluent, CalculationResult, StandardSolution, Presentation };


/**
 * Stateless dose calculator — does not touch the session.
 * Used by the standalone calculator screen.
 */
export function calcFromDose(params: {
  weightKg: number;
  ampoules: number;
  ampouleVolumeMl: number;
  basePerAmpoule: number;
  diluentMl: number;
  dose: number;
  doseUnit: DoseUnit;
}): { rateMlH: number; concentration: number; finalVolumeMl: number; totalBase: number } | null {
  const { weightKg, ampoules, ampouleVolumeMl, basePerAmpoule, diluentMl, dose, doseUnit } = params;
  if (ampoules <= 0 || diluentMl < 0 || dose <= 0) return null;
  if (doseUnit === "mcg/kg/min" && weightKg <= 0) return null;
  const finalVolumeMl = diluentMl + ampoules * ampouleVolumeMl;
  const totalBase = ampoules * basePerAmpoule;
  const concentration = totalBase / finalVolumeMl;
  if (concentration <= 0) return null;
  let basePerMin: number;
  if (doseUnit === "mcg/kg/min") basePerMin = dose * weightKg;
  else if (doseUnit === "U/min") basePerMin = dose;
  else if (doseUnit === "mcg/min") basePerMin = dose;
  else basePerMin = dose / 60; // mg/h
  const rateMlH = (basePerMin / concentration) * 60;
  return { rateMlH, concentration, finalVolumeMl, totalBase };
}

export function calcFromRate(params: {
  weightKg: number;
  ampoules: number;
  ampouleVolumeMl: number;
  basePerAmpoule: number;
  diluentMl: number;
  rateMlH: number;
  doseUnit: DoseUnit;
}): { dose: number; concentration: number; finalVolumeMl: number; totalBase: number } | null {
  const { weightKg, ampoules, ampouleVolumeMl, basePerAmpoule, diluentMl, rateMlH, doseUnit } = params;
  if (ampoules <= 0 || diluentMl < 0 || rateMlH <= 0) return null;
  if (doseUnit === "mcg/kg/min" && weightKg <= 0) return null;
  const finalVolumeMl = diluentMl + ampoules * ampouleVolumeMl;
  const totalBase = ampoules * basePerAmpoule;
  const concentration = totalBase / finalVolumeMl;
  if (concentration <= 0) return null;
  const basePerMin = (rateMlH * concentration) / 60;
  let dose: number;
  if (doseUnit === "mcg/kg/min") dose = basePerMin / weightKg;
  else if (doseUnit === "U/min") dose = basePerMin;
  else if (doseUnit === "mcg/min") dose = basePerMin;
  else dose = basePerMin * 60; // mg/h
  return { dose, concentration, finalVolumeMl, totalBase };
}

export {
  consumeEffects,
  getAuxiliaryPanel,
  getClinicalLog,
  getCurrentState,
  getCurrentStateId,
  getDocumentationActions,
  getEncounterReportHtml,
  getEncounterSummary,
  getEncounterSummaryText,
  getReversibleCauses,
  getTimers,
  next,
  registerExecution,
  resetSession,
  runAuxiliaryAction,
  tick,
  updateAuxiliaryField,
  updateReversibleCauseStatus,
};

export type { ClinicalEngine };
