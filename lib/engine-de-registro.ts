/**
 * Engine de REGISTRO — a interface mínima que o catálogo exige (D-22).
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────────
 *
 * `clinical-modules.ts` exige `engine: ClinicalEngine` para cada módulo, e o
 * campo é usado em UM lugar só (`app/modulos/[id].tsx`): para descobrir o
 * `protocolId` do módulo de origem no retorno da via aérea, e para repassar ao
 * `ClinicalApp` — que, para todo módulo com tela própria, IGNORA o engine e
 * renderiza a árvore.
 *
 * Os oito engines deletados na D-22 serviam só a esse registro: eram órfãos de
 * RENDER, com ~20.000 linhas de conteúdo clínico que nenhuma tela executava.
 * Deletá-los deixaria o catálogo sem o campo obrigatório.
 *
 * ── POR QUE UMA FÁBRICA, E NÃO OITO ARQUIVOS ─────────────────────────────────
 *
 * O app já tinha DOZE shims de registro (ACLS, TEP, eclâmpsia, eletrólitos,
 * ISR), cada um um arquivo de 79–199 linhas repetindo a mesma estrutura vazia.
 * Substituir oito mortos por oito shims novos seria trocar 20.000 linhas mortas
 * por 1.000 linhas cerimoniais.
 *
 * Esta fábrica devolve o mesmo contrato em uma linha por módulo. Os doze shims
 * antigos podem migrar para cá quando alguém passar por eles — não vale um
 * commit próprio, mas vale a nota.
 *
 * ── O QUE ELE NÃO FAZ, DECLARADAMENTE ────────────────────────────────────────
 *
 * `updateAuxiliaryField` é NO-OP, e isso não é regressão: nos módulos de
 * árvore o engine registrado nunca recebeu esses valores de fato — a escrita já
 * caía em objeto que a tela não lê. O retorno da via aérea (ISR → módulo de
 * origem) depende desse caminho e, para módulos de árvore, JÁ ESTAVA INERTE
 * antes da deleção. Fica registrado como D-28 em vez de sumir junto.
 */

import type {
  ClinicalEngine,
  ClinicalLogEntry,
  DocumentationAction,
  EncounterSummary,
  EngineEffect,
  ProtocolState,
  ReversibleCause,
  TimerState,
} from "../clinical-engine";

export function criarEngineDeRegistro(protocolId: string, rotulo: string): ClinicalEngine {
  const estado: ProtocolState = { type: "action", text: rotulo };

  const resumo = (): EncounterSummary => ({
    protocolId,
    durationLabel: "—",
    currentStateId: "inicio",
    currentStateText: rotulo,
    shockCount: 0,
    adrenalineSuggestedCount: 0,
    adrenalineAdministeredCount: 0,
    antiarrhythmicSuggestedCount: 0,
    antiarrhythmicAdministeredCount: 0,
    suspectedCauses: [],
    addressedCauses: [],
    lastEvents: [],
  });

  return {
    consumeEffects: (): EngineEffect[] => [],
    getClinicalLog: (): ClinicalLogEntry[] => [],
    getCurrentState: (): ProtocolState => estado,
    getCurrentStateId: () => "inicio",
    getDocumentationActions: (): DocumentationAction[] => [],
    getEncounterReportHtml: () => "",
    getEncounterSummary: resumo,
    getEncounterSummaryText: () => rotulo,
    getReversibleCauses: (): ReversibleCause[] => [],
    getTimers: (): TimerState[] => [],
    next: (): ProtocolState => estado,
    registerExecution: (): ClinicalLogEntry[] => [],
    resetSession: (): ProtocolState => estado,
    tick: (): ProtocolState => estado,
    updateReversibleCauseStatus: (): ReversibleCause[] => [],
  } as ClinicalEngine;
}
