import type { Antimicrobiano, ProcedenciaDeFaixa } from "./tipos";

/**
 * O CATÁLOGO — hoje com os TRÊS que já existiam, migrados sem mudar um número.
 *
 * ⚠️ NENHUMA DOSE FOI ESCRITA NESTA MIGRAÇÃO. Cada faixa abaixo é a transcrição
 * literal do que o motor já calculava (`clinical-calculators-engine.ts`,
 * ferramenta `dose-antibiotico`), incluindo as fronteiras: onde o código dizia
 * `tfg > 50 ? A : tfg >= 25 ? B`, a faixa de baixo termina COM o 50 e a de cima
 * começa SEM ele. O teste de fronteira prova valor por valor.
 *
 * ⚠️ E NENHUMA PROCEDÊNCIA FOI INVENTADA. A ferramenta declarava UMA referência
 * para os dez cortes — "ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI
 * 2022" — e nada dizia qual sustentava qual. Migrar não descobre a fonte: cada
 * faixa entra com `forca: "pendente"` e a pendência escrita. É o estado honesto,
 * e é o que o portão da AM-7 cobra antes de qualquer fármaco novo.
 */

/** A pendência que TODA faixa migrada carrega, escrita uma vez. */
const PENDENTE_DA_MIGRACAO: ProcedenciaDeFaixa = {
  fonte: "⚠️ SEM FONTE NO NÍVEL DA FAIXA — a ferramenta declarava «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para os dez cortes juntos",
  forca: "pendente",
  pendencia:
    "Abrir a bula/prescribing information do fármaco, seção de ajuste renal, e declarar a fonte DESTA faixa — com seção e ano. ⚠️ Referência terciária (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` com nome do produto e data de consulta, NUNCA como recomendação formal.",
};

/**
 * ⚠️ O MÉTODO DA TFG ESTÁ DECLARADO NO REPOSITÓRIO, e por isso não é suposição:
 * o campo de entrada da ferramenta diz «ClCr ABSOLUTO (mL/min) — não a TFG
 * indexada», e o texto de ajuda (`CLCR_PARA_DOSE`) explica que a absoluta é a que
 * os estudos de ajuste de dose usaram. Logo: Cockcroft-Gault.
 */
const METODO = "cockcroft_gault" as const;

/**
 * ⚠️ A FRASE É LITERAL E A MODALIDADE VIAJA À PARTE. Montá-la com template
 * (`... para ${o_que} ...`) produziria uma frase que nunca vira chave de
 * dicionário — o usuário em espanhol a leria em português (D-19/R-82). O texto
 * é um só, e o `sobre` diz de qual modalidade se trata.
 */
const SEM_DADOS_DIALISE = (sobre: string) => ({
  estado: "sem_dados" as const,
  sobre,
  pendencia:
    "⚠️ SEM DADOS NO REPOSITÓRIO para esta modalidade. Isto é ausência DECLARADA, não \"não precisa ajustar\" — e aparece na tela como tal.",
});

export const CATALOGO_DE_ANTIMICROBIANOS: Antimicrobiano[] = [
  {
    id: "vancomicina",
    nome: "Vancomicina",
    classe: "Glicopeptídeo",
    doseUsual: {
      dose: "25–30 mg/kg de ataque (peso real, máx 3 g)",
      via: "IV",
      intervalo: "dose única de ataque",
      procedencia: PENDENTE_DA_MIGRACAO,
    },
    ajusteRenal: "ajusta",
    faixas: [
      { de: 0, ate: 20, dose: "10–15 mg/kg", intervalo: "48/48h ou por nível", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 20, ate: 40, dose: "10–15 mg/kg", intervalo: "24/24h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 40, ate: 60, dose: "10–15 mg/kg", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      // ⚠️ O 90 PERTENCE A ESTA FAIXA: o código dizia `tfg > 90 ? … : tfg >= 60 ? …`.
      { de: 60, ate: 90, ateInclusivo: true, dose: "15–20 mg/kg", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 90, ate: null, deInclusivo: false, dose: "15–20 mg/kg", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
    ],
    dialise: {
      HD: {
        dose: "15–20 mg/kg",
        intervalo: "após a sessão",
        relacaoComASessao: "depois",
        procedencia: PENDENTE_DA_MIGRACAO,
      },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
    fonteDoFarmaco: PENDENTE_DA_MIGRACAO,
    observacoes: [
      { texto: "Alvo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível.", procedencia: PENDENTE_DA_MIGRACAO },
      { texto: "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho.", procedencia: PENDENTE_DA_MIGRACAO },
      { texto: "Dosar nível pré-diálise.", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
  {
    id: "piperacilina-tazobactam",
    nome: "Piperacilina-tazobactam",
    classe: "Beta-lactâmico + inibidor de beta-lactamase",
    doseUsual: { dose: "4,5 g", via: "IV", intervalo: "6/6h", procedencia: PENDENTE_DA_MIGRACAO },
    ajusteRenal: "ajusta",
    faixas: [
      { de: 0, ate: 20, dose: "2,25 g", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 20, ate: 40, ateInclusivo: true, dose: "4,5 g", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 40, ate: null, deInclusivo: false, dose: "4,5 g", intervalo: "6/6h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
    ],
    dialise: {
      HD: { dose: "2,25 g", intervalo: "12/12h + 0,75 g pós-diálise", relacaoComASessao: "depois", procedencia: PENDENTE_DA_MIGRACAO },
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
    fonteDoFarmaco: PENDENTE_DA_MIGRACAO,
    observacoes: [
      { texto: "Pseudomonas: 4,5 g em 250 mL SF → infundir em 4 h (maximiza tempo > MIC).", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
  {
    id: "meropenem",
    nome: "Meropeném",
    classe: "Carbapenêmico",
    doseUsual: { dose: "1 g", via: "IV", intervalo: "8/8h", procedencia: PENDENTE_DA_MIGRACAO },
    ajusteRenal: "ajusta",
    faixas: [
      { de: 0, ate: 10, dose: "500 mg (MDR/meningite: 1 g)", intervalo: "24/24h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 10, ate: 25, dose: "500 mg–1 g (MDR/meningite: 1 g)", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 25, ate: 50, ateInclusivo: true, dose: "1 g (MDR/meningite: 2 g)", intervalo: "12/12h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
      { de: 50, ate: null, deInclusivo: false, dose: "1 g (MDR: 2 g infusão 3 h; meningite: 2 g)", intervalo: "8/8h", metodoDaTFG: METODO, procedencia: PENDENTE_DA_MIGRACAO },
    ],
    dialise: {
      HD: SEM_DADOS_DIALISE("hemodiálise intermitente"),
      CRRT: SEM_DADOS_DIALISE("CVVHD/CVVHDF"),
      SLED: SEM_DADOS_DIALISE("SLED"),
    },
    fonteDoFarmaco: PENDENTE_DA_MIGRACAO,
    observacoes: [
      { texto: "MDR: 2 g em 100 mL SF → infundir em 3 h.", procedencia: PENDENTE_DA_MIGRACAO },
    ],
  },
];

/** A faixa que contém um ClCr — respeitando a inclusividade declarada. */
export function faixaPara(farmaco: Antimicrobiano, clcr: number) {
  return farmaco.faixas.find((f) => {
    const acimaDoPiso = f.deInclusivo === false ? clcr > f.de : clcr >= f.de;
    const abaixoDoTeto = f.ate === null ? true : f.ateInclusivo ? clcr <= f.ate : clcr < f.ate;
    return acimaDoPiso && abaixoDoTeto;
  });
}
