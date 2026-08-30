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

/**
 * As sete superfícies do AVC V1 (§7.15). ⚠️ Não são etapas: são janelas.
 *
 * ⚠️⚠️ O IDENTIFICADOR ⛔ NÃO É A LETRA, e a diferença tem consequência clínica.
 *
 * ── O DEFEITO QUE ISTO IMPEDE (2026-08-28) ─────────────────────────────────
 *
 * Até aqui `SuperficieId` era `"A" | ... | "G"`: a letra ERA a identidade. Ao
 * aprovar a inversão de E e F — Correções passa a ser E, Reperfusão passa a ser
 * F —, uma troca de rótulo reescreveria o SENTIDO do estado compartilhado.
 * `superficieVista: "E"` deixaria de significar Reperfusão e passaria a
 * significar Correções sem que uma linha de estado mudasse, e uma pendência
 * declarada `dono: "E"` apontaria para outra superfície **em silêncio** — um
 * muro apontando para a parede errada, que é o pior tipo de defeito que existe
 * aqui: o que passa nos testes.
 *
 * ⚠️ A letra é APRESENTAÇÃO e vive em `SUPERFICIES`, derivada da posição. O id é
 * IDENTIDADE e ⛔ nunca muda ao reordenar. ⛔ Não voltar a usar letra como id,
 * nem acrescentar uma letra a este tipo: `prova-avc-superficies` reprova.
 */
export type SuperficieId =
  /**
   * ⚠️⚠️ AS DUAS PRIMEIRAS SÃO **PAINÉIS**, e ⛔ não etapas — acrescentadas em
   * 2026-08-29, com a reabertura de **P-09** decidida pelo autor.
   *
   * ⚠️ Elas ⛔ **não têm letra**. A letra carrega a leitura de fluxo clínico
   * (A → G), e dar letra a um painel transversal sugeriria que ele é passo. O
   * paciente e os exames do episódio são **contexto**, consultáveis de qualquer
   * lugar e a qualquer momento.
   *
   * ⚠️ E ⛔ nenhuma das duas é porta: `Paciente` incompleto ⛔ não impede abrir
   * ⛔ nenhuma superfície, ⛔ não esconde ⛔ nenhuma, e ⛔ não cria bloqueio.
   */
  | "paciente"
  | "laboratorio"
  | "estabilizacao"
  | "neurologico"
  | "imagem"
  | "seguranca"
  | "correcoes"
  | "reperfusao"
  | "destino";

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
  /**
   * ⚠️⚠️ A INSTÂNCIA A QUE ESTE FATO PERTENCE — acrescentada em 2026-08-30.
   *
   * ── O DEFEITO QUE ELA FECHA (D-120) ───────────────────────────────────────
   *
   * `pas` e `pad` são duas metades de **uma** aferição, e a trilha as guardava
   * como fatos independentes. Com duas medidas, ela tinha quatro números e
   * ⛔ **nenhuma indicação de quais dois foram medidos juntos** — PAS 198 às 14h
   * e PAD 96 às 15h podiam ser lidos como uma PA que ⛔ nunca existiu.
   *
   * ⚠️ **É UMA ETIQUETA, e ⛔ não uma segunda estrutura.** A trilha continua plana
   * e append-only (§3.1); o agrupamento é **leitura**, ⛔ não armazenamento
   * paralelo. `valorAtual()` continua devolvendo o último.
   *
   * ⚠️ **Opcional de propósito:** ⛔ nem todo fato pertence a um evento composto.
   * Quem exige instância é o campo que declara `instanciaDe` — e a prova reprova
   * o fato que a esqueça.
   *
   * ⏳ Hoje **só a pressão arterial** a usa. Laboratório e Imagem entram depois,
   * na ordem aprovada pelo autor — e ⛔ nenhum motor genérico nasce antes (§9.1).
   */
  readonly instancia?: string;
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
  /**
   * O CAMPO cuja resposta resolve esta pendência.
   *
   * ⚠️⚠️ EXPLÍCITO, ⛔ NUNCA DEDUZIDO DO `id`. Era deduzido, e o resultado foi
   * medido em 2026-08-28: a pendência `ultima_vez_bem` procurava um campo com
   * esse nome, o campo na tela chamava-se `hora_ultima_vez_bem`, e os dois
   * ⛔ nunca casaram. A pendência ficava aberta PARA SEMPRE, informasse o médico
   * o horário ou não — E-26 ao pé da letra: muro, ⛔ não tarefa.
   *
   * ⚠️ É a mesma lição de `SuperficieId`: quando identidade e referência são a
   * mesma string por coincidência, uma renomeação quebra a outra em silêncio.
   */
  readonly campo: string;
  /** ⚠️ Pendência que não diz o que a resolve é muro, não tarefa (E-26). */
  readonly resolvePor: string;
};

/** Ciclo de vida da ação (§2.3, E-20). ⛔ Navegação nunca move uma ação. */
export type EstadoDaAcao = "sugerida" | "disponivel" | "iniciada" | "realizada" | "cancelada";
