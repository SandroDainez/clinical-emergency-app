/**
 * TOQUE DUPLO NO REGISTRO — a proteção do A17, para TODA ação (2026-09-13).
 *
 * ⚠️ Antes ela morava só em `abrirNovaInstancia` (os três botões de "nova
 * instância"). Agora mora no registro: o hook do atendimento aplica esta regra a
 * TODA mudança de estado, venha do gesto que vier.
 *
 * ── A REGRA ────────────────────────────────────────────────────────────────
 * Um gesto é REPETIÇÃO do gesto anterior quando os fatos que ele acrescenta são,
 * um a um, equivalentes aos últimos fatos da trilha — ⛔ sem nada registrado entre
 * os dois. Equivalente = mesmo campo, valor, tipo, motivo, hora clínica e
 * procedência; ⚠️ com duas tolerâncias, as duas por construção do toque duplo:
 *   · instância NOVA contra instância que NASCEU no gesto anterior (o segundo
 *     toque, depois de a tela redesenhar, calcula a "próxima" instância);
 *   · correção que aponta para a correção do gesto anterior (desfazer 2×).
 *
 * ⛔ SEM JANELA DE TEMPO: a regra ⛔ não lê relógio — nenhum número foi inventado.
 * ⚠️ Consequência declarada: repetir de propósito, com o MESMO valor ⛔ e nada
 * registrado entre os dois, ⛔ não gera segundo fato (o valor atual ⛔ muda nada).
 * Ver `docs/avc/persistencia.md`.
 */
import type { EstadoAvc } from "./estado";
import type { FatoRegistrado } from "./tipos";

const MARCADOR_DE_ABERTURA = "_nova_medida";

export function repeteOGestoAnterior(anterior: EstadoAvc, proximo: EstadoAvc): boolean {
  if (anterior === proximo) return false;
  const n = anterior.fatos.length;
  const novos = proximo.fatos.length - n;
  if (novos <= 0 || n < novos) return false;
  for (let i = 0; i < n; i += 1) {
    if (proximo.fatos[i] !== anterior.fatos[i]) return false;
  }
  const inicio = n - novos;
  const instancias = new Map<string, string>();
  for (let i = 0; i < novos; i += 1) {
    if (!equivalentes(proximo.fatos[n + i], anterior.fatos[inicio + i], anterior, inicio, instancias)) return false;
  }
  return true;
}

function mesmoValor(a: unknown, b: unknown): boolean {
  return a === b || JSON.stringify(a) === JSON.stringify(b);
}

function equivalentes(
  a: FatoRegistrado,
  t: FatoRegistrado,
  anterior: EstadoAvc,
  inicio: number,
  instancias: Map<string, string>
): boolean {
  if (a.campo !== t.campo) return false;
  if ((a.tipo ?? "medida") !== (t.tipo ?? "medida")) return false;
  if ((a.motivo ?? null) !== (t.motivo ?? null)) return false;
  if ((a.horaClinica ?? null) !== (t.horaClinica ?? null)) return false;
  if (!mesmoValor(a.procedencia ?? null, t.procedencia ?? null)) return false;
  if (!mesmaInstancia(a.instancia, t.instancia, anterior, inicio, instancias)) return false;
  const abertura = a.campo.endsWith(MARCADOR_DE_ABERTURA) && a.valor === a.instancia && t.valor === t.instancia;
  if (!abertura && !mesmoValor(a.valor, t.valor)) return false;
  if ((a.corrigeFatoId ?? null) !== (t.corrigeFatoId ?? null) && a.corrigeFatoId !== t.id) return false;
  return true;
}

function mesmaInstancia(
  a: string | undefined,
  t: string | undefined,
  anterior: EstadoAvc,
  inicio: number,
  instancias: Map<string, string>
): boolean {
  if (a === t) return true;
  if (a === undefined || t === undefined) return false;
  const ja = instancias.get(a);
  if (ja !== undefined) return ja === t;
  const aNova = !anterior.fatos.some((f) => f.instancia === a);
  const tNasceuNoGesto = anterior.fatos.every((f, i) => f.instancia !== t || i >= inicio);
  if (!aNova || !tNasceuNoGesto) return false;
  instancias.set(a, t);
  return true;
}
