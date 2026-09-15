/**
 * AUTORIA DO EVENTO — AC-40 (2026-09-13) e AC-13 reaberto, item 4 (autor, 2026-09-14; `docs/decisoes.md`, seção
 * "AC-13 reaberto", §10).
 *
 * O autor de cada evento é o `user.id` da SESSÃO SUPABASE quando ela existe. O identificador do aparelho
 * (`local:<uuid>`) é só o recurso de quem não tem sessão, e fica marcado como tal no evento (`origemDoAutor`). Sessão
 * ANÔNIMA tem `user.id`, mas não é conta: é gravada com o id e marcada `sessao_anonima`, para a auditoria não ler um
 * visitante como médico identificado.
 *
 * Item 4: o que a tela mostra é o NOME DE EXIBIÇÃO, quando ele existe: `full_name` da conta e, na falta dele, `nome`.
 * Nunca e-mail, id ou identificador técnico, e nunca um nome derivado do e-mail. Sem nome, "Autoria não identificada",
 * inclusive sem conta e nos eventos gravados antes do schema v4. A palavra "responsável" não é usada.
 *
 * Nada aqui autentica ninguém: lê a sessão que o app já tem. Falha ao ler não derruba nada: cai no recurso do
 * aparelho, sem nome.
 */
import type { EventoDoAtendimento, NovoEvento, OrigemDoAutor } from "./tipos";

export type Autoria = {
  readonly autor: string;
  readonly origemDoAutor: OrigemDoAutor;
  /** Item 4: o nome de exibição da conta ou sessão, quando existe. */
  readonly nomeDeExibicao?: string;
};

export type SessaoParaAutoria = {
  readonly userId: string;
  readonly anonima: boolean;
  readonly nomeDeExibicao?: string;
};

type ClienteComSessao = {
  readonly auth: {
    getSession(): Promise<{
      data: {
        session: {
          user?: {
            id?: string | null;
            is_anonymous?: boolean | null;
            user_metadata?: Readonly<Record<string, unknown>> | null;
          } | null;
        } | null;
      };
    }>;
  };
};

/** Item 4: `full_name`; se ausente ou em branco, `nome`. Só texto não vazio. O e-mail nunca entra. */
export function nomeDeExibicaoDosMetadados(metadados: Readonly<Record<string, unknown>> | null | undefined): string | undefined {
  for (const chave of ["full_name", "nome"] as const) {
    const valor = metadados?.[chave];
    if (typeof valor === "string" && valor.trim() !== "") return valor.trim();
  }
  return undefined;
}

export function autoriaDoEvento(sessao: SessaoParaAutoria | undefined, idDoAparelho: string): Autoria {
  if (sessao !== undefined && sessao.userId.trim() !== "") {
    return {
      autor: sessao.userId,
      origemDoAutor: sessao.anonima ? "sessao_anonima" : "sessao",
      ...(sessao.nomeDeExibicao !== undefined ? { nomeDeExibicao: sessao.nomeDeExibicao } : {}),
    };
  }
  return { autor: idDoAparelho, origemDoAutor: "aparelho" };
}

/** `undefined` = sem sessão utilizável (sem cliente, sem sessão, sem id, ou falha ao ler). */
export async function lerSessaoParaAutoria(
  cliente: ClienteComSessao | null | undefined
): Promise<SessaoParaAutoria | undefined> {
  if (!cliente) return undefined;
  try {
    const { data } = await cliente.auth.getSession();
    const user = data.session?.user;
    const id = user?.id;
    if (typeof id !== "string" || id.trim() === "") return undefined;
    const nome = nomeDeExibicaoDosMetadados(user?.user_metadata);
    return { userId: id, anonima: user?.is_anonymous === true, ...(nome !== undefined ? { nomeDeExibicao: nome } : {}) };
  } catch {
    return undefined;
  }
}

export type RotuloDeAutoria =
  | { readonly tipo: "nome"; readonly rotulo: "Registrado por:"; readonly nome: string }
  | { readonly tipo: "nao_identificada"; readonly rotulo: "Autoria não identificada" };

/** Item 4: a regra única de todas as telas. Com nome, "Registrado por:" e o nome; sem nome, "Autoria não identificada". */
export function rotuloDeAutoria(autoria: Autoria | undefined): RotuloDeAutoria {
  const nome = autoria?.nomeDeExibicao?.trim();
  if (nome) return { tipo: "nome", rotulo: "Registrado por:", nome };
  return { tipo: "nao_identificada", rotulo: "Autoria não identificada" };
}

/** Quem registrou cada fato, lido DO LOG: a trilha clínica não carrega autor. */
export function autoriaPorFatoDoLog(
  eventos: readonly (NovoEvento | EventoDoAtendimento)[]
): Readonly<Record<string, Autoria>> {
  const mapa: Record<string, Autoria> = {};
  for (const e of eventos) {
    const fato = e.tipo === "fato" ? (e.dados as { fato?: { id?: string } }).fato : undefined;
    if (!fato?.id) continue;
    const nome = typeof e.nomeDoAutor === "string" && e.nomeDoAutor.trim() !== "" ? e.nomeDoAutor.trim() : undefined;
    mapa[fato.id] = { autor: e.autor, origemDoAutor: e.origemDoAutor, ...(nome !== undefined ? { nomeDeExibicao: nome } : {}) };
  }
  return mapa;
}
