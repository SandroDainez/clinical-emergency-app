/**
 * QUAL ARMAZENAMENTO — navegador (AC-02 · D-PEND-02).
 *
 * ⚠️ IndexedDB quando existe; ⛔ sem ele (modo privado restrito, ambiente sem DOM),
 * memória — `persistente: false`, ⛔ e a tela diz que ⛔ nada sobrevive.
 * O nativo tem o próprio arquivo (`armazenamento.native.ts`).
 */
import { criarArmazenamentoEmMemoria } from "./armazenamento-memoria";
import { criarArmazenamentoIndexedDb, indexedDbDisponivel } from "./armazenamento-indexeddb";
import type { ArmazenamentoDoAtendimento } from "./tipos";

export function criarArmazenamentoDoAtendimento(): ArmazenamentoDoAtendimento {
  return indexedDbDisponivel() ? criarArmazenamentoIndexedDb() : criarArmazenamentoEmMemoria();
}
