/**
 * QUAL ARMAZENAMENTO — nativo (AC-02 · D-PEND-02).
 *
 * ⛔⛔ SEM PERSISTÊNCIA NO NATIVO NESTA RODADA: memória, `persistente: false`.
 *
 * ⚠️ Ponto de extensão: um `criarArmazenamentoSqlite()` sobre `expo-sqlite` (já
 * dependência do app, usado em `lib/armazenamento-local.native.ts`) implementa a
 * MESMA interface `ArmazenamentoDoAtendimento` — as mesmas tabelas `casos`,
 * `eventos` (append-only, ID único) e `rascunhos`, ⛔ e a mesma migração
 * `migrarEventoDeV1`. ⛔ Nenhuma camada acima desta muda.
 */
import { criarArmazenamentoEmMemoria } from "./armazenamento-memoria";
import type { ArmazenamentoDoAtendimento } from "./tipos";

export function criarArmazenamentoDoAtendimento(): ArmazenamentoDoAtendimento {
  return criarArmazenamentoEmMemoria();
}
