/**
 * Q-02 · TIPOS DO MÓDULO AVC — locais, mínimos, e deliberadamente NÃO GERAIS.
 *
 * ⚠️ ISTO NÃO É UM MOTOR GENÉRICO. A Parte 9 da spec proíbe: nada vira
 * infraestrutura do app porque funcionou no AVC. Estes tipos vivem em `avc/` e
 * só saem daqui quando um SEGUNDO módulo clínico forçar a mesma necessidade de
 * forma independente (§9.1).
 *
 * ⛔ Não importar `core/decision-tree` (LEGACY_ACLS_RUNTIME, D-107).
 * ⛔ Não há `Node`, `Tree` nem `next`: o estado é o conjunto de frentes abertas,
 * e não existe ponteiro de próximo passo (§5.9).
 */

import type { Instante } from "./relogio";

/** As sete superfícies do AVC V1 (§7.15). ⚠️ Não são etapas: são janelas. */
export type SuperficieId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

/**
 * Os relógios clínicos do módulo (§1.1, E-36).
 *
 * ⛔ NÃO existe `stroke_time` genérico — decisão do autor em F-02. Cada regra
 * aponta para o marco EXATO que a sua recomendação usa, e duas formulações só
 * viram o mesmo campo quando a fonte disser que são o mesmo evento.
 */
export type RelogioClinicoId =
  | "ultima_vez_bem"
  | "inicio_observado"
  | "reconhecimento"
  | "t0_operacional";

/**
 * De onde veio o dado (E-03). A procedência muda a confiança sem mudar o valor.
 */
export type Procedencia = "paciente" | "acompanhante" | "testemunha" | "pre_hospitalar" | "equipe" | "prontuario";

/**
 * Os três vazios que não podem colapsar (E-23, §4.2).
 *
 * ⚠️ `nao_perguntado` é ausência de pergunta; `nao_sei` é RESPOSTA. Tratar um
 * como o outro é o erro que a spec nomeia como mais provável.
 */
export type Vazio = "nao_perguntado" | "nao_sei";

/**
 * Duas operações que produzem valor diferente no mesmo campo, e que ⛔ NÃO são a
 * mesma coisa (§3.4).
 *
 * ⚠️ Confundi-las transforma **erro de entrada em evolução clínica falsa**: uma
 * PA informada errada e depois "corrigida" apareceria como resposta a um
 * tratamento que ninguém deu.
 */
export type TipoDeRegistro =
  /** O paciente mudou, ou mediu-se outra vez. Os dois valores valem. */
  | "medida"
  /** O valor anterior NUNCA foi verdade. Ele fica invalidado, e visível. */
  | "correcao";

/** Um fato informado pelo médico. ⛔ Nunca carrega a própria interpretação (§4.1). */
export type FatoRegistrado = {
  readonly campo: string;
  readonly valor: string | number | Vazio;
  /** Quando o fato aconteceu no paciente. */
  readonly horaClinica?: Instante;
  /** Quando entrou no sistema. Automático, nunca informado (§3.2). */
  readonly horaRegistro: Instante;
  readonly procedencia?: Procedencia;
  /** Por que este registro existe: correção, reavaliação, achado novo. */
  readonly motivo?: string;
  /** Ausente equivale a `"medida"` — o caso comum. */
  readonly tipo?: TipoDeRegistro;
};

/**
 * Pendência — ausência QUALIFICADA de um dado (§2.5).
 *
 * ⚠️ `dono` é a superfície que precisa do dado; o ALCANCE é sempre global
 * (E-07): ela permanece visível e acionável de qualquer superfície.
 */
export type Pendencia = {
  readonly id: string;
  readonly rotulo: string;
  readonly dono: SuperficieId;
  /** ⚠️ Pendência que não diz o que a resolve é muro, não tarefa (E-26). */
  readonly resolvePor: string;
};

/** Ciclo de vida da ação (§2.3, E-20). ⛔ Navegação nunca move uma ação. */
export type EstadoDaAcao = "sugerida" | "disponivel" | "iniciada" | "realizada" | "cancelada";
