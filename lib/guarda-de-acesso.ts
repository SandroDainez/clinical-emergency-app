/**
 * GUARDA DE ACESSO · a decisão de **quem pode ver a área clínica** — e ⛔ nada mais.
 *
 * ⛔ ⛔ ESTE ARQUIVO ⛔ NÃO IMPORTA ⛔ NADA, ⛔ de propósito. A regra abaixo é a
 * fronteira entre *"o médico aprovado usa o app"* e *"qualquer um com a URL
 * usa"*, e uma regra dessas ⛔ não pode ⛔ só ser **lida** numa varredura — ela
 * precisa ser **executada** contra cada estado possível.
 *
 * ── ⚠️⚠️ O DEFEITO QUE ISTO FECHA ─────────────────────────────────────────
 *
 * ⚠️ A aprovação administrativa existia em **um `if`**, na tela de login
 * (`app/index.tsx`), que impedia o `router.replace`. ⛔ E ⛔ nada mais.
 *
 * ⚠️⚠️ Só que o build web publica **uma URL por módulo**: `/modulos/avc`,
 * `/modulos/bradicardia-acls`, `/session-history`… ⛔ Digitar o endereço pulava
 * a tela de login inteira. Um médico com cadastro **pendente** — ⛔ ainda ⛔ não
 * aprovado — usava tudo. E quem ⛔ nem tinha conta, também.
 *
 * ⚠️ A aprovação existia na **navegação**, ⛔ e ⛔ não na segurança.
 *
 * ── ⚠️⚠️ ESTA GUARDA ⛔ NÃO É A FRONTEIRA ──────────────────────────────────
 *
 * ⛔ Ela é a **primeira** camada, ⛔ e ⛔ não a única. A fronteira real está na RLS:
 * mesmo que alguém contorne o cliente inteiro e fale direto com a API, o banco
 * nega. ⚠️ Cliente ⛔ nunca é prova.
 */

/** ⚠️ Os estados que a tela precisa distinguir — ⛔ e são cinco, ⛔ não dois. */
export type DestinoDaGuarda =
  | "modo_local"
  | "carregando"
  | "login"
  | "aguardando_aprovacao"
  | "conta_indisponivel"
  | "liberado";

export type EstadoDeAcesso = {
  /**
   * ⚠️⚠️ Existe backend clínico? ⛔ Isto ⛔ NÃO é "pode entrar" — é *"há dado
   * remoto em jogo?"*. Ver `backend-clinico.ts`.
   */
  backendDisponivel: boolean;
  /** ⚠️ `true` enquanto a sessão ⛔ ou o perfil ainda ⛔ não foram resolvidos. */
  carregando: boolean;
  /** Há sessão instalada? */
  autenticado: boolean;
  /** `status` do `app_users`. ⛔ `undefined` quando ⛔ não há perfil. */
  status?: "pendente" | "ativo" | "bloqueado";
};

/**
 * ⚠️⚠️ AS ROTAS PÚBLICAS SÃO UMA **LISTA DE PERMISSÃO**, ⛔ e ⛔ não de bloqueio.
 *
 * ⛔ Lista de bloqueio esquece a rota que alguém criar amanhã — e o esquecimento
 * ⛔ não faz barulho: a tela nova simplesmente nasce aberta. ⚠️ Com permissão, a
 * rota nova nasce **fechada**, e abrir exige decisão escrita ⛔ aqui.
 *
 * ⚠️ Três, e o motivo de cada uma:
 *   · **login** — é onde se autentica; fechá-la trancaria todo mundo para fora;
 *   · **privacidade** — política de privacidade, exigida por loja e por lei;
 *   · **+not-found** — 404; fechá-la transformaria erro de digitação em redirect.
 *
 * ⛔ `paywall`, `modal`, `dev/ui-v2` e `admin-users` ⛔ **NÃO** são públicas.
 * ⛔ Nenhuma delas tem razão para ser, e `admin-users` seria grave.
 */
const ROTAS_PUBLICAS = ["privacidade", "+not-found"] as const;

/**
 * ⚠️⚠️ COMPARAÇÃO **EXATA** DE SEGMENTO — ⛔ nunca prefixo.
 *
 * ⛔ `startsWith("privacidade")` abriria `privacidade-interna`, `privacidadeX`,
 * ⛔ qualquer coisa. ⚠️ É ⛔ exatamente a "rota pública implícita por erro de
 * matching" que ⛔ não pode existir numa lista de permissão.
 *
 * ⚠️ Lista vazia de segmentos é a raiz (`app/index.tsx`), a tela de login.
 */
export function ehRotaPublica(segmentos: readonly string[]): boolean {
  if (segmentos.length === 0) return true;
  return (ROTAS_PUBLICAS as readonly string[]).includes(segmentos[0]);
}

/**
 * ⚠️⚠️ O DESTINO — e `carregando` vem **antes de tudo**.
 *
 * ⛔ Se o estado desconhecido caísse em `liberado`, a tela clínica apareceria por
 * um quadro antes de sumir. ⚠️⚠️ Um quadro **é** vazamento: no reload por URL
 * direta, é ⛔ exatamente onde o conteúdo pisca.
 *
 * ⛔ E se caísse em `login`, quem já está autenticado seria jogado para fora a
 * cada recarga.
 *
 * ⚠️ Falha fechada: `status` ausente ⛔ ou desconhecido ⇒ `conta_indisponivel`.
 * ⛔ Estado ⛔ não previsto ⛔ nunca vira acesso.
 */
export function destinoDaGuarda(estado: EstadoDeAcesso): DestinoDaGuarda {
  /**
   * ⚠️⚠️ MODO LOCAL — ⛔ e ⛔ é um destino PRÓPRIO, ⛔ não `liberado`.
   *
   * ⚠️ Sem backend ⛔ não há sessão remota, histórico, claim ⛔ nem sync: ⛔ nada a
   * proteger, porque ⛔ nada existe. Os motores clínicos são locais e abrem.
   *
   * ⛔ ⛔ Nomeá-lo à parte importa: se devolvesse `liberado`, "sem configuração"
   * e "autorizado" virariam **o mesmo estado** — e ⛔ ninguém conseguiria medir
   * a diferença depois.
   */
  if (!estado.backendDisponivel) return "modo_local";
  if (estado.carregando) return "carregando";
  if (!estado.autenticado) return "login";
  if (estado.status === "ativo") return "liberado";
  if (estado.status === "pendente") return "aguardando_aprovacao";
  return "conta_indisponivel";
}
