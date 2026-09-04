export type FaixaDeEntrada = {
  min: number;
  max: number;
  passo: number;
  unidade: string;
};

/**
 * Faixas de ENTRADA, não faixas de normalidade nem limiares clínicos.
 * Elas existem apenas para que o controle deslizante alcance valores plausíveis
 * sem depender de teclado e sem transformar um preset em limite do paciente real.
 */
export const FAIXA_DE_ENTRADA: Record<string, FaixaDeEntrada> = {
  peso: { min: 30, max: 250, passo: 1, unidade: "kg" },
  altura: { min: 120, max: 220, passo: 1, unidade: "cm" },
  pas: { min: 40, max: 300, passo: 1, unidade: "mmHg" },
  pad: { min: 20, max: 160, passo: 1, unidade: "mmHg" },
  fc: { min: 20, max: 250, passo: 1, unidade: "bpm" },
  spo2: { min: 50, max: 100, passo: 1, unidade: "%" },
  glicemia: { min: 20, max: 1200, passo: 1, unidade: "mg/dL" },
  ph: { min: 6.6, max: 7.8, passo: 0.01, unidade: "" },
  potassio: { min: 1.5, max: 9, passo: 0.1, unidade: "mEq/L" },
  lactato: { min: 0.5, max: 20, passo: 0.1, unidade: "mmol/L" },
  nihss: { min: 0, max: 42, passo: 1, unidade: "" },
  pf: { min: 40, max: 500, passo: 1, unidade: "" },

  idade: { min: 0, max: 120, passo: 1, unidade: "anos" },
  idadeParaMetaDePas: { min: 0, max: 120, passo: 1, unidade: "anos" },
  tempoDeSulfatacao: { min: 0, max: 1440, passo: 5, unidade: "min" },
  tempoDaUltimaDose: { min: 0, max: 480, passo: 5, unidade: "min" },
  na: { min: 100, max: 190, passo: 1, unidade: "mEq/L" },
  cl: { min: 60, max: 150, passo: 1, unidade: "mEq/L" },
  k: { min: 1.5, max: 9, passo: 0.1, unidade: "mEq/L" },
  cr: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  ureia: { min: 5, max: 300, passo: 1, unidade: "mg/dL" },
  alb: { min: 0.5, max: 6, passo: 0.1, unidade: "g/dL" },
  bili: { min: 0.1, max: 40, passo: 0.1, unidade: "mg/dL" },
  ht: { min: 10, max: 65, passo: 1, unidade: "%" },
  leuco: { min: 0.1, max: 100, passo: 0.1, unidade: "×10³/mm³" },
  plaq: { min: 1, max: 800, passo: 1, unidade: "×10³/mm³" },
  fr: { min: 4, max: 60, passo: 1, unidade: "rpm" },
  pam: { min: 20, max: 200, passo: 1, unidade: "mmHg" },
  temp: { min: 28, max: 43, passo: 0.1, unidade: "°C" },
  gcs: { min: 3, max: 15, passo: 1, unidade: "" },
  tfg: { min: 0, max: 200, passo: 1, unidade: "mL/min" },
  losDias: { min: 0, max: 90, passo: 1, unidade: "dias" },
  medida: { min: 200, max: 400, passo: 1, unidade: "mOsm/kg" },
  hco3: { min: 2, max: 50, passo: 0.5, unidade: "mEq/L" },
  pao2: { min: 20, max: 600, passo: 1, unidade: "mmHg" },
  aado2: { min: 0, max: 600, passo: 1, unidade: "mmHg" },

  // Nesta calculadora a FiO₂ é exibida e informada em PORCENTAGEM (ex.: 40).
  // O motor SAPS 3 já converte valores > 1 dividindo por 100.
  fio2: { min: 21, max: 100, passo: 1, unidade: "%" },

  creatinina: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  basal: { min: 0.1, max: 20, passo: 0.1, unidade: "mg/dL" },
  diurese_ml_h: { min: 0, max: 500, passo: 1, unidade: "mL/h" },
  horas_oliguria: { min: 0, max: 72, passo: 1, unidade: "h" },
  debitoUltimaHora: { min: 0, max: 1000, passo: 5, unidade: "mL" },
};

/** Mesma grandeza com IDs diferentes em motores/telas distintos. */
FAIXA_DE_ENTRADA.glic = FAIXA_DE_ENTRADA.glicemia;
FAIXA_DE_ENTRADA.weightKg = FAIXA_DE_ENTRADA.peso;
FAIXA_DE_ENTRADA.heightCm = FAIXA_DE_ENTRADA.altura;
FAIXA_DE_ENTRADA.age = FAIXA_DE_ENTRADA.idade;

export function faixaDeEntradaDe(fieldId: string): FaixaDeEntrada | undefined {
  return FAIXA_DE_ENTRADA[fieldId];
}

export type FaixaPorUnidade = Record<string, FaixaDeEntrada>;

export const FAIXA_POR_UNIDADE: Record<string, FaixaPorUnidade> = {
  ca: {
    "mg/dL": { min: 4, max: 20, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 1, max: 5, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 2, max: 10, passo: 0.05, unidade: "mEq/L" },
  },
  mg: {
    "mg/dL": { min: 0.4, max: 10, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 0.15, max: 4.1, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 0.3, max: 8.2, passo: 0.05, unidade: "mEq/L" },
  },
  p: {
    "mg/dL": { min: 0.3, max: 15, passo: 0.1, unidade: "mg/dL" },
    "mmol/L": { min: 0.1, max: 4.8, passo: 0.01, unidade: "mmol/L" },
    "mEq/L": { min: 0.2, max: 8.7, passo: 0.05, unidade: "mEq/L" },
  },
};

export function faixaPorUnidadeDe(id: string, unidade: string): FaixaDeEntrada | undefined {
  return FAIXA_POR_UNIDADE[id]?.[unidade];
}

FAIXA_DE_ENTRADA.volumeDaBolsa = { min: 50, max: 2000, passo: 10, unidade: "mL" };
FAIXA_DE_ENTRADA.horasDeInfusao = { min: 1, max: 24, passo: 1, unidade: "h" };
