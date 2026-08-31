/**
 * BACKEND CLÍNICO · a **capacidade**, num lugar só.
 *
 * ── ⚠️⚠️ POR QUE ISTO É UMA CAPACIDADE, ⛔ E ⛔ NÃO UM `if (!supabase)` ─────
 *
 * ⛔ `if (!supabase) return true` espalhado pela autorização transforma
 * **configuração ausente** em **permissão genérica**. ⚠️ São coisas diferentes,
 * e confundi-las é como um ramo de conveniência vira porta lateral: basta uma
 * build perder a variável para a guarda abrir ⛔ sem ⛔ ninguém decidir isso.
 *
 * ⚠️⚠️ Aqui a pergunta tem **nome**: *existe backend clínico?* A resposta ⛔ não é
 * "pode entrar" — é *"há dado remoto em jogo?"*. Quem decide acesso é a guarda,
 * lendo esta capacidade como **insumo**, ⛔ e ⛔ não como veredito.
 *
 * ── ⚠️ OS DOIS MUNDOS ─────────────────────────────────────────────────────
 *
 * ⛔ **Sem backend** — modo local. Os motores clínicos são código local e
 * funcionam; ⛔ não há sessão remota, ⛔ nem histórico, ⛔ nem claim, ⛔ nem sync.
 * ⛔ ⛔ ⛔ Não há dado a proteger porque ⛔ não há dado.
 *
 * ⚠️ **Com backend** — autenticação e autorização **normais**, ⛔ sem exceção.
 *
 * ⛔ ⛔ ⛔ NÃO EXISTE terceiro caminho: ⛔ nenhum `NODE_ENV`, ⛔ nenhum nome de
 * teste, ⛔ nenhuma rota especial, ⛔ nenhuma flag escondida abre a guarda.
 */
import { supabase } from "./supabase";

/**
 * ⚠️ `true` quando há backend configurado — e ⛔ portanto dado remoto em jogo.
 *
 * ⛔ Ausência de configuração ⛔ **nunca** significa autorização. Significa que
 * ⛔ não há o que autorizar.
 */
export function backendClinicoDisponivel(): boolean {
  return supabase !== null;
}

/**
 * ⚠️⚠️ A SEGUNDA CAPACIDADE — e ela é **mais estreita** que a primeira.
 *
 * ⛔ Ter backend configurado ⛔ NÃO basta para tocar em dado remoto: a
 * autorização precisa estar **confirmada pelo servidor agora**. ⚠️ Em modo
 * degradado há backend, ⛔ mas ⛔ não há confirmação — e prova local ⛔ nunca vira
 * credencial (ver `prova-de-acesso.ts`).
 *
 * ⛔ ⛔ ⛔ UM ÚNICO ESCRITOR: a guarda de acesso, ao resolver o destino.
 * ⚠️ Muitos leitores. ⛔ Espalhar a escrita criaria duas verdades sobre a mesma
 * autorização, e a que ⛔ ninguém revisasse seria a que fica errada.
 */
let remotaConfirmada = false;

/** ⚠️ Chamado ⛔ SOMENTE pela guarda. */
export function definirPersistenciaRemota(confirmada: boolean): void {
  remotaConfirmada = confirmada;
}

export function persistenciaRemotaAutorizada(): boolean {
  return backendClinicoDisponivel() && remotaConfirmada;
}
