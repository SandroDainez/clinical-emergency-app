/**
 * CONTEÚDO DA SUPERFÍCIE A — Entrada e estabilização.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma cor, ⛔ nenhuma decisão de tela.
 * A medicina mora aqui e a superfície apenas a renderiza (E-29).
 *
 * ⚠️ Todo campo declara `bloqueiaTerapia: false`. Isso ⛔ não é decoração: é a
 * aplicação de **E-49** — nenhum campo obrigatório novo pode ser criado sem
 * checagem contra as doze marcas 🚫, e a Superfície A ⛔ não cria nenhum.
 */

import type { SuperficieId } from "../nucleo/tipos";

/** Como o campo é preenchido. ⛔ Nunca caixa de texto para valor clínico (§0.3). */
export type TipoDeCampo =
  /** Grandeza: barra + ajuste fino. `0` = não informado até a interação (§0.2). */
  | "grandeza"
  /** Escolha tocável. `0` não se aplica; ⛔ sem texto livre (§7.6). */
  | "escolha"
  /** Hora e minuto. ⛔ Nunca barra deslizante (§7.5). */
  | "hora";

export type CampoA = {
  readonly id: string;
  readonly rotulo: string;
  readonly tipo: TipoDeCampo;
  /** Para `escolha`: as opções, em PT. ⚠️ Sempre com saída para quem não sabe. */
  readonly opcoes?: readonly string[];
  readonly unidade?: string;
  /** Qual relógio clínico este campo alimenta — ⛔ nunca um genérico (E-36). */
  readonly relogio?: string;
  /** O slot que sustenta a existência clínica do campo (E-30). */
  readonly fonte: string;
  /**
   * ⚠️ SEMPRE `false` nesta superfície.
   *
   * Se algum dia alguém puser `true`, o campo tem de ser conferido contra as
   * doze marcas de `CONSOLIDACAO-CLINICA-AVC.md` — e `prova-avc-superficie-a`
   * reprova o arquivo se aparecer um `true` sem passar por lá.
   */
  readonly bloqueiaTerapia: false;
  /** Nota de fidelidade quando a fonte exige cuidado de leitura. */
  readonly nota?: string;
};

/** ⚠️ As três respostas que nunca colapsam (E-23, §7.7). */
export const SIM_NAO_NAO_SEI = ["Sim", "Não", "Não sei"] as const;

/**
 * OS RELÓGIOS — coletados **separadamente**, ⛔ jamais fundidos.
 *
 * ⚠️ Decisão do autor em F-02: ⛔ não existe campo genérico de "hora do AVC".
 * A fonte usa seis formulações e conta janelas de quatro marcos distintos; um
 * campo único tornaria as recomendações de janela estendida incomputáveis.
 */
export const RELOGIOS_A: readonly CampoA[] = [
  {
    id: "hora_chegada",
    rotulo: "Chegada ao pronto-socorro",
    tipo: "hora",
    relogio: "t0_operacional",
    fonte: "F-11",
    bloqueiaTerapia: false,
    nota: "Referência de porta. Não substitui nenhum relógio clínico.",
  },
  {
    id: "hora_ultima_vez_bem",
    rotulo: "Última vez visto bem",
    tipo: "hora",
    relogio: "ultima_vez_bem",
    fonte: "F-02",
    bloqueiaTerapia: false,
    nota: "Desconhecido é resposta, e tem consequência própria.",
  },
  {
    id: "hora_inicio_observado",
    rotulo: "Início observado do déficit",
    tipo: "hora",
    relogio: "inicio_observado",
    fonte: "F-02",
    bloqueiaTerapia: false,
  },
  {
    id: "hora_reconhecimento",
    rotulo: "Reconhecimento dos sintomas",
    tipo: "hora",
    relogio: "reconhecimento",
    fonte: "F-03",
    bloqueiaTerapia: false,
    nota: "A fonte conta uma janela a partir deste marco, e ele não é o início.",
  },
  {
    id: "houve_sono",
    rotulo: "Houve sono entre a última vez bem e o achado",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-03",
    bloqueiaTerapia: false,
  },
] as const;

/** ESTABILIZAÇÃO — via aérea, oxigenação, circulação. */
export const ESTABILIZACAO_A: readonly CampoA[] = [
  {
    id: "consciencia_rebaixada",
    rotulo: "Nível de consciência rebaixado",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-23",
    bloqueiaTerapia: false,
  },
  {
    id: "disfuncao_bulbar",
    rotulo: "Disfunção bulbar",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "Junto com o rebaixamento, é um dos dois gatilhos que a fonte nomeia.",
  },
  {
    id: "spo2",
    rotulo: "SpO₂",
    tipo: "grandeza",
    unidade: "%",
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "A meta de 94% vale para quem tem hipóxia. A fonte não define corte numérico de hipóxia.",
  },
  {
    id: "hipoxia",
    rotulo: "Há hipóxia",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-23",
    bloqueiaTerapia: false,
    nota: "É a presença de hipóxia que indica oxigênio — não o número isolado.",
  },
  {
    id: "pas",
    rotulo: "Pressão sistólica",
    tipo: "grandeza",
    unidade: "mmHg",
    fonte: "F-04",
    bloqueiaTerapia: false,
    nota: "Registrada aqui. A meta depende do contexto de reperfusão, que esta superfície não define.",
  },
  {
    id: "pad",
    rotulo: "Pressão diastólica",
    tipo: "grandeza",
    unidade: "mmHg",
    fonte: "F-04",
    bloqueiaTerapia: false,
  },
  {
    id: "glicemia",
    rotulo: "Glicemia capilar",
    tipo: "grandeza",
    unidade: "mg/dL",
    fonte: "F-06",
    bloqueiaTerapia: false,
    nota: "Desconhecida não é normal.",
  },
  {
    id: "crise_no_inicio",
    rotulo: "Crise convulsiva no início do quadro",
    tipo: "escolha",
    opcoes: SIM_NAO_NAO_SEI,
    fonte: "F-24",
    bloqueiaTerapia: false,
    nota: "Contexto e possível mimetizador. Não exclui AVC.",
  },
] as const;

/** PESO — grandeza com **origem**, porque a origem muda a confiança (E-14). */
export const PESO_A: readonly CampoA[] = [
  {
    id: "peso",
    rotulo: "Peso",
    tipo: "grandeza",
    unidade: "kg",
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Não atrasa terapia tempo-dependente.",
  },
  {
    id: "peso_origem",
    rotulo: "Origem do peso",
    tipo: "escolha",
    opcoes: ["Balança", "Informado", "Estimado", "Não sei"],
    fonte: "F-09",
    bloqueiaTerapia: false,
    nota: "Com peso estimado, a fonte diz que a banda fina não é necessariamente mais segura.",
  },
] as const;

export const GRUPOS_A: readonly { titulo: string; campos: readonly CampoA[] }[] = [
  { titulo: "Relógios", campos: RELOGIOS_A },
  { titulo: "Estabilização", campos: ESTABILIZACAO_A },
  { titulo: "Peso", campos: PESO_A },
] as const;

export const TODOS_OS_CAMPOS_A: readonly CampoA[] = GRUPOS_A.flatMap((g) => [...g.campos]);

export const SUPERFICIE_A: SuperficieId = "A";
