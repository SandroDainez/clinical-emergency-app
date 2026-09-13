/**
 * AUTORIA DO EVENTO — AC-40 (2026-09-13).
 *
 * ⚠️ O autor de cada evento é o `user.id` da SESSÃO SUPABASE quando ela existe. O
 * identificador do aparelho (`local:<uuid>`) é só o RECURSO de quem ⛔ não tem
 * sessão — ⛔ e fica MARCADO como tal: no evento (`origemDoAutor`) ⛔ e na linha do
 * tempo (`marcaDeAutoria`).
 *
 * ⚠️ Sessão ANÔNIMA tem `user.id`, ⛔ mas ⛔ não é conta: é gravada com o id ⛔ e marcada
 * `sessao_anonima`, para a auditoria ⛔ não ler um visitante como médico identificado.
 *
 * ⛔ Nada aqui autentica ninguém: lê a sessão que o app já tem. Falha ao ler ⛔ derruba
 * nada — cai no recurso do aparelho, marcado.
 */
import type { EventoDoAtendimento, NovoEvento, OrigemDoAutor } from "./tipos";

export type Autoria = { readonly autor: string; readonly origemDoAutor: OrigemDoAutor };

export type SessaoParaAutoria = { readonly userId: string; readonly anonima: boolean };

type ClienteComSessao = {
  readonly auth: {
    getSession(): Promise<{
      data: { session: { user?: { id?: string | null; is_anonymous?: boolean | null } | null } | null };
    }>;
  };
};

export function autoriaDoEvento(sessao: SessaoParaAutoria | undefined, idDoAparelho: string): Autoria {
  if (sessao !== undefined && sessao.userId.trim() !== "") {
    return { autor: sessao.userId, origemDoAutor: sessao.anonima ? "sessao_anonima" : "sessao" };
  }
  return { autor: idDoAparelho, origemDoAutor: "aparelho" };
}

/** ⚠️ `undefined` = ⛔ sem sessão utilizável (sem cliente, sem sessão, sem id, ou falha ao ler). */
export async function lerSessaoParaAutoria(
  cliente: ClienteComSessao | null | undefined
): Promise<SessaoParaAutoria | undefined> {
  if (!cliente) return undefined;
  try {
    const { data } = await cliente.auth.getSession();
    const user = data.session?.user;
    const id = user?.id;
    if (typeof id !== "string" || id.trim() === "") return undefined;
    return { userId: id, anonima: user?.is_anonymous === true };
  } catch {
    return undefined;
  }
}

/** ⚠️ A marca da linha do tempo — ⛔ autor de conta ⛔ não ganha marca. */
export const MARCA_DA_ORIGEM: Readonly<Record<Exclude<OrigemDoAutor, "sessao">, string>> = {
  aparelho: "registrado neste aparelho, sem conta",
  sessao_anonima: "registrado em sessão anônima, sem conta",
  nao_registrado: "autor não registrado",
};

export function marcaDeAutoria(autoria: Autoria | undefined): string | undefined {
  if (autoria === undefined || autoria.origemDoAutor === "sessao") return undefined;
  return MARCA_DA_ORIGEM[autoria.origemDoAutor];
}

/** ⚠️ Quem registrou cada fato, lido DO LOG — ⛔ a trilha clínica ⛔ não carrega autor. */
export function autoriaPorFatoDoLog(
  eventos: readonly (NovoEvento | EventoDoAtendimento)[]
): Readonly<Record<string, Autoria>> {
  const mapa: Record<string, Autoria> = {};
  for (const e of eventos) {
    const fato = e.tipo === "fato" ? (e.dados as { fato?: { id?: string } }).fato : undefined;
    if (fato?.id) mapa[fato.id] = { autor: e.autor, origemDoAutor: e.origemDoAutor };
  }
  return mapa;
}
