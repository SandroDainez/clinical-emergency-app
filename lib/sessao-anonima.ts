/**
 * SESSÃO ANÔNIMA · a posse do trabalho feito antes de existir uma conta.
 *
 * ── ⚠️⚠️ O PROBLEMA QUE ISTO RESOLVE ───────────────────────────────────────
 *
 * O médico abre o app numa emergência e registra um caso **sem se cadastrar**.
 * Depois entra na conta dele. ⛔ Sem transferência, o trabalho fica preso na
 * identidade anônima — visível para ⛔ ninguém, e ⛔ apagável por ⛔ ninguém.
 *
 * ── ⚠️⚠️ A INVERSÃO DE ORDEM (o coração deste arquivo) ──────────────────────
 *
 * O caminho ingênuo é: **loga** → tenta transferir. ⛔ Ele ⛔ não funciona: no
 * instante em que a sessão da conta é **instalada**, a sessão anônima deixa de
 * ser a ativa, e ⛔ perdemos a prova de que éramos donos daquelas sessões.
 * Sobraria mandar o `old_user_id` no corpo — ⛔ exatamente o que ⛔ não pode ser
 * fonte de autoridade, porque um UUID conhecido ⛔ não prova posse.
 *
 * ⚠️ Então a ordem é **invertida**:
 *
 *   1. `prepareExistingAccountSession()` — obtém a sessão da conta ⛔ **SEM
 *      INSTALAR**. A sessão anônima continua sendo a ativa.
 *   2. `transferirSessoesAnonimas()` — os **dois** JWTs vivos vão juntos, e o
 *      servidor valida **cada um por conta própria**.
 *   3. ⚠️ ⛔ Só então a sessão da conta é instalada.
 *
 * ⚠️ ⛔ Em ⛔ nenhum momento o cliente **afirma** de quem é a sessão. Ele apresenta
 * duas credenciais, e quem conclui é o servidor.
 *
 * ── ⚠️⚠️ `X-Anon-Token` É CREDENCIAL ───────────────────────────────────────
 *
 * Quem tem esse token **lê as sessões clínicas daquela identidade**. Por isso
 * ⛔ ele ⛔ não vai para log, ⛔ analytics, ⛔ tracing, ⛔ dump de erro ⛔ nem
 * persistência adicional. As funções abaixo devolvem **estado**, e ⛔ nunca o
 * token — ⛔ nem em caminho de erro.
 */
import { supabase } from "./supabase";
import {
  trocarDeSessao,
  claimBemSucedido,
  ehProvaAnonima,
  type ResultadoDaTroca,
} from "./troca-de-sessao";

const URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * ⚠️ A sessão obtida e **ainda não instalada**.
 *
 * ⛔ O tipo ⛔ não é exportado: ⛔ nenhum consumidor deve guardar isto em estado de
 * componente, contexto ⛔ ou storage. Ele nasce e morre dentro de `entrarNaConta`.
 */
type SessaoPreparada = { access_token: string; refresh_token: string };

/**
 * ⚠️⚠️ OBTÉM A SESSÃO DA CONTA **SEM INSTALAR**.
 *
 * ⚠️ Isto é `fetch` cru contra `/token` porque o SDK ⛔ não oferece um
 * "autentique mas ⛔ não troque a sessão ativa" — `signInWithPassword` **sempre**
 * instala. ⚠️ E o `fetch` fica **encapsulado aqui**: espalhá-lo pelas telas
 * faria cada tela ter a sua versão do protocolo de autenticação.
 */
async function prepareExistingAccountSession(
  email: string,
  password: string
): Promise<{ sessao?: SessaoPreparada; erro?: string }> {
  if (!URL || !KEY) return { erro: "sem_configuracao" };

  const resposta = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: KEY },
    body: JSON.stringify({ email, password }),
  });

  if (!resposta.ok) {
    /**
     * ⛔ O corpo da resposta do GoTrue ⛔ não é repassado: ele distingue
     * "e-mail ⛔ não existe" de "senha errada", e isso ⛔ enumera contas.
     */
    return { erro: resposta.status === 400 ? "credenciais_invalidas" : "falha_de_rede" };
  }

  const corpo = await resposta.json();
  if (!corpo?.access_token || !corpo?.refresh_token) return { erro: "falha_de_rede" };
  return { sessao: { access_token: corpo.access_token, refresh_token: corpo.refresh_token } };
}

/**
 * ⚠️⚠️ GARANTIR IDENTIDADE ANÔNIMA — e ⛔ **falhar fechado** quando desligada.
 *
 * ⚠️ Enquanto Anonymous Sign-In estiver desabilitado no projeto, o GoTrue
 * responde 422 e esta função devolve `false` ⛔ em silêncio. O app segue
 * **exatamente como hoje**: papel `anon`, ⛔ sem `auth.uid()`.
 *
 * ⚠️ É o que permite implantar o cliente (Fase 2) **antes** de habilitar o
 * recurso (Fase 3), ⛔ sem criar dependência circular entre as duas.
 */
export async function garantirSessaoAnonima(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) return ehProvaAnonima(data.session.user);
  const { data: nova, error } = await supabase.auth.signInAnonymously();
  if (error) return false;
  return ehProvaAnonima(nova.session?.user);
}

/**
 * ⚠️⚠️ ENTRAR NA CONTA — e ⛔ **só** trocar de sessão quando a posse estiver
 * transferida. A decisão está em `trocarDeSessao`; aqui ⛔ só se ligam os fios.
 */
export async function entrarNaConta(
  email: string,
  password: string
): Promise<ResultadoDaTroca> {
  if (!supabase) return { erro: "sem_configuracao", transferidas: 0, sessaoTrocada: false };
  const cliente = supabase;

  return trocarDeSessao(
    {
      sessaoAtual: async () => {
        const { data } = await cliente.auth.getSession();
        return {
          token: data.session?.access_token,
          anonima: ehProvaAnonima(data.session?.user),
        };
      },

      autenticar: (e, senha) => prepareExistingAccountSession(e, senha),

      /**
       * ⚠️⚠️ QUALQUER falha vira `ok: false` — inclusive exceção de rede.
       * ⛔ O `catch` ⛔ não pode registrar ⛔ nada: ele tem o token anônimo em escopo.
       */
      reivindicar: async (sessao, anonToken) => {
        try {
          const r = await fetch(`${URL}/functions/v1/claim-anonymous-sessions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: KEY as string,
              Authorization: `Bearer ${(sessao as SessaoPreparada).access_token}`,
              "X-Anon-Token": anonToken,
            },
          });
          if (!claimBemSucedido(r)) return { ok: false, transferidas: 0 };
          return { ok: true, transferidas: (await r.json())?.transferred ?? 0 };
        } catch {
          return { ok: false, transferidas: 0 };
        }
      },

      instalar: async (sessao) => {
        const { error } = await cliente.auth.setSession(sessao as SessaoPreparada);
        return { erro: error ? "falha_de_rede" : undefined };
      },
    },
    email,
    password
  );
}
