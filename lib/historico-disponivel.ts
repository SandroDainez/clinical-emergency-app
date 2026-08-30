/**
 * INTERRUPTOR DO HISTÓRICO — degradação **declarada**, ⛔ não disfarçada.
 *
 * ── ⚠️⚠️ PARA QUE ISTO EXISTE ──────────────────────────────────────────────
 *
 * Se o fechamento do P0 (Fase 4) quebrar a leitura legítima do histórico, a
 * saída ⛔ **não** pode ser reabrir `USING (true)`. O princípio é:
 *
 *   ⚠️⚠️ **Disponibilidade pode degradar. Confidencialidade, ⛔ não.**
 *
 * Este interruptor é o Degrau 2 da escada: desliga a superfície de histórico
 * ⛔ sem tocar em RLS, ⛔ sem apagar sessão, ⛔ sem mexer em posse.
 *
 * ── ⚠️⚠️ O QUE ELE ⛔ NÃO PODE FAZER ───────────────────────────────────────
 *
 * ⛔ ⛔ Ele ⛔ NÃO pode devolver lista vazia. Lista vazia significa *"você ⛔ não
 * tem sessões"* — uma afirmação **falsa** sobre o trabalho do médico, e da
 * mesma família do E-52: dado desconhecido apresentado como fato. O estado
 * desligado é **um terceiro estado**, `indisponivel`, que a tela nomeia.
 *
 * ⛔ ⛔ E ele ⛔ NUNCA cai para leitura global. Esconder um erro de posse lendo
 * tudo seria trocar um defeito visível por um vazamento silencioso.
 *
 * ── ⚠️ COMO LIGAR ─────────────────────────────────────────────────────────
 *
 *   EXPO_PUBLIC_HISTORICO=off      # desliga para todo mundo (exige redeploy)
 *   EXPO_PUBLIC_HISTORICO=on       # padrão
 *
 * ⚠️ E, ⛔ só no navegador, para conferir o estado degradado com o usuário junto
 * ⛔ sem esperar build:
 *
 *   localStorage.setItem("historico", "off")
 *
 * ⚠️ Precedência: localStorage (⛔ só web) → variável de ambiente → **ligado**.
 * ⚠️ O padrão é ligado ⛔ de propósito: um interruptor que falha para "desligado"
 * apagaria o histórico de todo mundo em ⛔ qualquer erro de configuração.
 */

const CHAVE_LOCAL = "historico";
const DESLIGADO = "off";

/** ⚠️ Ausente em nativo e em aba privada — por isso o `try`. */
function preferenciaLocal(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(CHAVE_LOCAL);
  } catch {
    return null;
  }
}

export function historicoDisponivel(): boolean {
  const local = preferenciaLocal();
  if (local !== null) return local.trim().toLowerCase() !== DESLIGADO;
  const env = process.env.EXPO_PUBLIC_HISTORICO;
  return String(env ?? "").trim().toLowerCase() !== DESLIGADO;
}
