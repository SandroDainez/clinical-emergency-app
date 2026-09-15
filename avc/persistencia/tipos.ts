/**
 * PERSISTÊNCIA DO ATENDIMENTO — os tipos, o schema ⛔ e a migração (AC-02 · D-PEND-02).
 *
 * ⚠️ O atendimento é um LOG DE EVENTOS append-only. ⛔ Nada é sobrescrito: o estado
 * de tela é sempre reconstruído do log (`log.ts`).
 *
 * ── QUEM ORDENA ────────────────────────────────────────────────────────────
 * ⚠️⚠️ A ORDEM É DA GRAVAÇÃO, ⛔ e ⛔ nunca do produtor. O produtor cria um
 * `NovoEvento` ⛔ sem `seq`; o ARMAZENAMENTO atribui `seq` no append, dentro da
 * mesma transação, na ordem em que os eventos entram. A13 e A14 dependem disso:
 * um evento produzido antes ⛔ e gravado depois fica DEPOIS no log.
 *
 * ── SCHEMA ─────────────────────────────────────────────────────────────────
 *  · v1 — lojas `casos` (casoId) e `eventos` (id, índice `porCaso`); o evento
 *    ⛔ não tinha autor ⛔ nem versão.
 *  · v2 — acrescenta a loja `rascunhos` ([casoId, chave]), o índice
 *    `porCasoSeq` ([casoId, seq]) e, em todo evento, `autor`, `observadoEm` e
 *    `versaoDoSchema`. A migração ⛔ não toca `dados` ⛔ nem `seq`.
 *  · v3 — AC-40 (2026-09-13): em todo evento, `origemDoAutor` — `sessao` (user.id
 *    da sessão Supabase), `sessao_anonima`, `aparelho` (recurso sem sessão) ⛔ ou
 *    `nao_registrado`. A migração ⛔ não inventa autor: o v2 só gravava `local:<uuid>`
 *    (aparelho) ⛔ ou o marcador de v1 (não registrado).
 *  · v4 — AC-13 reaberto, item 4 (2026-09-14): em todo evento, `nomeDoAutor`, o nome de exibição da conta ou da
 *    sessão (`full_name`, senão `nome`), ou `null` quando não há. A migração não inventa nome: os eventos anteriores
 *    ficam `null` e a tela diz «Autoria não identificada».
 *
 * ⚠️ v1 é o primeiro schema escrito nesta rodada (2026-09-13); ⛔ não há dado real
 * de paciente gravado por ele. A migração existe e é provada com dados v1
 * sintéticos para que a próxima mudança de schema já nasça com o caminho pronto.
 *
 * ⛔ Ponto de extensão, ⛔ não implementado: sincronização (Supabase) e SQLite no
 * nativo — ver `docs/avc/persistencia.md`.
 */
import type { SuperficieId } from "../nucleo/tipos";
import type { FatoRegistrado } from "../nucleo/tipos";
import type { Instante } from "../nucleo/relogio";

export const VERSAO_DO_SCHEMA = 4 as const;
export const NOME_DO_BANCO = "avc-atendimento";

/** Autor de evento migrado de v1 — ⛔ v1 ⛔ não gravava autor, e ⛔ nenhum é inventado. */
export const AUTOR_NAO_REGISTRADO_V1 = "nao_registrado_schema_v1";

/** ⚠️ AC-40: de onde veio o autor do evento. ⛔ `aparelho` ⛔ não é identidade. */
export type OrigemDoAutor = "sessao" | "sessao_anonima" | "aparelho" | "nao_registrado";

export type TipoDeEvento =
  | "caso_aberto"
  | "fato"
  | "relogio_clinico"
  | "eixo_concluido"
  | "eixo_reaberto"
  | "superficie_vista"
  | "conclusao";

export type DadosDoCasoAberto = {
  readonly abertoEm: Instante;
  readonly relogiosClinicos: Readonly<Record<string, Instante>>;
  readonly superficieVista: SuperficieId;
  readonly eixosConcluidos: readonly string[];
};

export type EventoDoAtendimento = {
  readonly id: string;
  readonly casoId: string;
  /** ⚠️ Ordem estrita dentro do caso, ⛔ ATRIBUÍDA PELO ARMAZENAMENTO na gravação. */
  readonly seq: number;
  readonly tipo: TipoDeEvento;
  /** Quando o evento foi REGISTRADO no aparelho. */
  readonly registradoEm: Instante;
  /** Quando o fato foi OBSERVADO, se o médico disse; `null` se ⛔ não disse. */
  readonly observadoEm: Instante | null;
  readonly autor: string;
  /** ⚠️ AC-40: `user.id` da sessão, ⛔ ou o recurso do aparelho — sempre declarado. */
  readonly origemDoAutor: OrigemDoAutor;
  /** AC-13 reaberto, item 4: o nome de exibição da conta ou sessão; `null` quando não há. Nunca e-mail nem id. */
  readonly nomeDoAutor: string | null;
  readonly versaoDoSchema: typeof VERSAO_DO_SCHEMA;
  readonly dados:
    | DadosDoCasoAberto
    | { readonly fato: FatoRegistrado }
    | { readonly qual: string; readonly instante: Instante }
    | { readonly eixo: string }
    | { readonly superficie: SuperficieId }
    | { readonly nome: string; readonly valor: string; readonly baseadaEm: readonly string[] };
};

/** ⚠️ O evento como o PRODUTOR o entrega: ⛔ sem `seq`. */
export type NovoEvento = Omit<EventoDoAtendimento, "seq">;

/** O evento como v1 o gravava. */
export type EventoV1 = {
  readonly id: string;
  readonly casoId: string;
  readonly seq: number;
  readonly tipo: TipoDeEvento;
  readonly registradoEm: Instante;
  readonly dados: EventoDoAtendimento["dados"];
};

/** O evento como v2 o gravava: com autor ⛔ e sem a origem dele. */
export type EventoV2 = Omit<EventoDoAtendimento, "origemDoAutor" | "nomeDoAutor" | "versaoDoSchema"> & {
  readonly versaoDoSchema: 2;
};

/** O evento como v3 o gravava: com a origem do autor e sem o nome de exibição. */
export type EventoV3 = Omit<EventoDoAtendimento, "nomeDoAutor" | "versaoDoSchema"> & {
  readonly versaoDoSchema: 3;
};

/** ⚠️ O v2 só gravava `local:<uuid>` (aparelho) ⛔ ou o marcador de v1 — ⛔ nada além. */
function origemGravadaPeloV2(autor: string): OrigemDoAutor {
  return autor.startsWith("local:") ? "aparelho" : "nao_registrado";
}

/** ⚠️ Qualquer evento gravado por schema anterior → o schema atual, ⛔ sem tocar `dados` ⛔ nem `seq`. */
export function migrarEvento(e: EventoV1 | EventoV2 | EventoV3 | EventoDoAtendimento): EventoDoAtendimento {
  if ("versaoDoSchema" in e && e.versaoDoSchema === VERSAO_DO_SCHEMA) return e as EventoDoAtendimento;
  if ("versaoDoSchema" in e && e.versaoDoSchema === 3) {
    /** v3 → v4: o nome de exibição não era gravado, e nenhum é inventado. */
    return { ...(e as EventoV3), nomeDoAutor: null, versaoDoSchema: VERSAO_DO_SCHEMA };
  }
  if ("versaoDoSchema" in e && e.versaoDoSchema === 2) {
    const v2 = e as EventoV2;
    return { ...v2, origemDoAutor: origemGravadaPeloV2(v2.autor), nomeDoAutor: null, versaoDoSchema: VERSAO_DO_SCHEMA };
  }
  const fato = (e.dados as { fato?: FatoRegistrado }).fato;
  return {
    id: e.id,
    casoId: e.casoId,
    seq: e.seq,
    tipo: e.tipo,
    registradoEm: e.registradoEm,
    observadoEm: fato?.horaClinica ?? null,
    autor: AUTOR_NAO_REGISTRADO_V1,
    origemDoAutor: "nao_registrado",
    nomeDoAutor: null,
    versaoDoSchema: VERSAO_DO_SCHEMA,
    dados: e.dados,
  };
}

/** @deprecated nome antigo — migra v1 ⛔ e v2. */
export const migrarEventoDeV1 = migrarEvento;

export type CasoGuardado = {
  readonly casoId: string;
  readonly abertoEm: Instante;
  readonly encerradoEm: Instante | null;
};

/** ⚠️ Rascunho mora ⛔ FORA do log: pode ser sobrescrito, ⛔ e ⛔ nunca vira fato sozinho. */
export type RascunhoDoAtendimento = {
  readonly casoId: string;
  readonly chave: string;
  readonly valor: unknown;
  readonly atualizadoEm: Instante;
};

/**
 * ⚠️⚠️ A INTERFACE DE ARMAZENAMENTO — IndexedDB no navegador hoje; SQLite no
 * nativo depois (mesma interface). ⛔ Nenhuma camada acima dela sabe qual é.
 */
export interface ArmazenamentoDoAtendimento {
  /** `false` quando ⛔ nada sobrevive a fechar o app (memória). */
  readonly persistente: boolean;
  /**
   * Acrescenta eventos ⛔ e ATRIBUI `seq` na ordem de gravação. ⚠️ ID já gravado é
   * ignorado — ⛔ nunca reescrito, ⛔ nem renumerado. Devolve os eventos como
   * ficaram no log.
   */
  anexarEventos(casoId: string, eventos: readonly NovoEvento[]): Promise<readonly EventoDoAtendimento[]>;
  /** Os eventos do caso, ⚠️ na ordem de gravação (`seq`). */
  lerEventos(casoId: string): Promise<readonly EventoDoAtendimento[]>;
  casoMaisRecenteNaoEncerrado(): Promise<string | undefined>;
  encerrarCaso(casoId: string, em: Instante): Promise<void>;
  gravarRascunho(rascunho: RascunhoDoAtendimento): Promise<void>;
  lerRascunhos(casoId: string): Promise<readonly RascunhoDoAtendimento[]>;
}
