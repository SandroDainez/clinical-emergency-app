/**
 * CURSOR × FATO — o que o VOLTAR pode desfazer, e o que ele nunca pode.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (medido em 2026-08-18) ────────────────────────
 *
 * `goBack` restaurava o instantâneo INTEIRO do estado. Medição, com o motor
 * real, indo até a epinefrina do ramo não chocável:
 *
 *     antes do voltar : doses 1 · timers 1 (119 s) · log 6 · linha do tempo 15
 *     DEPOIS do voltar: doses 0 · timers 0         · log 4 · linha do tempo  9
 *
 * A dose administrada voltava a zero, o cronômetro do ciclo DESAPARECIA e a
 * linha do tempo perdia 7 eventos. Numa parada, tocar «voltar» para reler um
 * passo apagava o relógio de quem estava em RCP.
 *
 * ⚠️ E É UM DEFEITO COM TRÊS PORTAS: o botão do cabeçalho, a etapa da tela e
 * (agora) o comando de voz chamam o MESMO `goBack`. Consertar o motor conserta
 * as três; consertar só a voz criaria duas portas com resultados diferentes.
 *
 * ── A REGRA ─────────────────────────────────────────────────────────────────
 *
 * **VOLTAR MOVE O CURSOR, NUNCA O FATO.** Medicação administrada, choque
 * aplicado, log do caso e relógio não voltam — nem por botão, nem por voz, nem
 * por gesto. Só `resetSession` («recomeçar») limpa, e é a única que pode,
 * porque é a única pedida explicitamente.
 *
 * ── ⚠️ POR QUE ESTE ARQUIVO EXISTE, EM VEZ DE UMA LISTA DENTRO DO goBack ────
 *
 * Porque a classificação precisa ser CONFERÍVEL. `test:voltar-preserva-fato`
 * lê o tipo `ACLSState` e exige que TODO campo esteja aqui, num dos dois
 * conjuntos. Campo novo sem classificação REPROVA — sem isso, daqui a três
 * meses alguém acrescenta um contador, ninguém lembra da lista, e o voltar
 * volta a apagar fato sem que nada avise.
 */

/**
 * CURSOR — onde o protocolo está. Isto o voltar restaura.
 *
 * São as coordenadas da navegação: qual estado, qual ramo, qual fase, qual
 * passo do fluxo chocável, e os contadores de POSIÇÃO que o algoritmo usa para
 * saber o que oferecer em seguida.
 */
export const CAMPOS_DE_CURSOR = [
  "protocolId",
  "currentStateId",
  "algorithmBranch",
  "clinicalPhase",
  "clinicalIntent",
  "clinicalIntentConfidence",
  "currentRhythm",
  "shockableFlowStep",
  "stateEntrySequence",
  "currentStateEnteredAt",
  "defibrillatorType",
  "cycleCount",
  "rcp3CycleIndex",
  "antiarrhythmicReminderStage",
  "emittedPreCueKeys",
  /**
   * ⚠️ `timers` É CURSOR, e quem ensinou isso foi um invariante do motor.
   *
   * A primeira classificação o pôs em FATO — «o relógio da parada é fato». O
   * motor recusou, com `Timers clínicos do ACLS só podem existir durante CPR`:
   * o cronômetro ATIVO pertence ao ciclo de RCP, e carregá-lo para um estado que
   * não é RCP cria um relógio contando algo que não está acontecendo.
   *
   * A distinção que sobrou é mais fina e é a certa: a CONTAGEM REGRESSIVA é
   * posição (some ao sair do ciclo, reaparece ao voltar a ele); o TEMPO
   * DECORRIDO — `clock`, `protocolStartedAt`, `initialCprStartedAt` — é fato, e
   * é esse que nunca retrocede.
   */
  "timers",
] as const;

/**
 * FATO — o que aconteceu com o paciente. Isto o voltar NUNCA desfaz.
 *
 * ⚠️ `clock`, `protocolStartedAt` e `initialCprStartedAt` estão aqui: o TEMPO
 * DECORRIDO da parada é fato clínico, não posição de tela. Um relógio que
 * retrocede ao navegar mente sobre há quanto tempo se reanima.
 */
export const CAMPOS_DE_FATO = [
  "clock",
  "timeline",
  "protocolStartedAt",
  "documentedExecutionKeys",
  "deliveredShockCount",
  "closedEpisodes",
  "lastShockAt",
  "initialCprStartedAt",
  "medications",
  "advancedAirwaySecuredAt",
  "reversibleCauseRecords",
] as const;

export type CampoDeCursor = (typeof CAMPOS_DE_CURSOR)[number];
export type CampoDeFato = (typeof CAMPOS_DE_FATO)[number];

/**
 * Devolve o estado do CURSOR do instantâneo, com o FATO do estado atual.
 *
 * ⚠️ A CÓPIA É DO ATUAL PARA O ANTIGO, e não o contrário: o instantâneo é
 * velho por definição, e é justamente o fato dele que está desatualizado.
 */
export function cursorDoInstantaneoComFatoAtual<T extends Record<string, unknown>>(
  instantaneo: T,
  atual: T
): T {
  const saida = { ...instantaneo } as Record<string, unknown>;
  for (const campo of CAMPOS_DE_FATO) {
    if (campo in atual) {
      saida[campo] = atual[campo];
    } else {
      delete saida[campo];
    }
  }
  return saida as T;
}
