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

/** ⚠️ 24 h ⛔ por decisão: minutos ⛔ não cobrem plantão com Wi-Fi ruim. */
export const VALIDADE_DA_PROVA_MS = 24 * 60 * 60 * 1000;

const CHAVE = "cea_prova_de_acesso";

export type ProvaLocal = {
  /** ⚠️⚠️ A identidade. ⛔ Sem ela, a prova de A autorizaria B. */
  userId: string;
  /** Instante da confirmação. */
  em: number;
};

/**
 * ⚠️⚠️ A REGRA DE VALIDADE — pura, ⛔ e por isso **executável** contra cada caso.
 *
 * ⛔ Três formas de invalidar, e ⛔ nenhuma delas é opcional:
 *   · ⛔ prova ausente;
 *   · ⛔ **identidade diferente** — a prova de A ⛔ não vale para B;
 *   · ⛔ vencida.
 */
export function provaValida(
  prova: ProvaLocal | null,
  userId: string | undefined,
  agora: number,
  validadeMs: number = VALIDADE_DA_PROVA_MS
): boolean {
  if (!prova || !userId) return false;
  if (prova.userId !== userId) return false;
  return agora - prova.em < validadeMs;
}

/** ⚠️ Os estados que a tela precisa distinguir — ⛔ e são cinco, ⛔ não dois. */
export type DestinoDaGuarda =
  | "modo_local"
  | "carregando"
  | "login"
  | "aguardando_aprovacao"
  | "conta_indisponivel"
  /** ⚠️ Estado confirmado pelo servidor **agora**: tudo liberado. */
  | "liberado_online"
  /**
   * ⚠️⚠️ Servidor inalcançável, ⛔ mas há prova local válida desta identidade.
   *
   * ⛔ O motor clínico abre; ⛔ **dado remoto ⛔ NÃO**. É um destino próprio
   * ⛔ justamente para que "degradado" ⛔ nunca se confunda com "autorizado" —
   * ⛔ nem no código, ⛔ nem na tela.
   */
  | "liberado_local_degradado";

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
  /**
   * ⚠️ A RPC de autorização ⛔ não respondeu — rede, servidor fora, timeout.
   * ⛔ Isto ⛔ NÃO é "conta inválida": é **ausência de resposta**, e confundir as
   * duas é o que tira o motor de PCR da mão de quem foi autorizado ontem.
   */
  rpcFalhou?: boolean;
  /**
   * ⚠️⚠️ Há prova local válida **para esta mesma identidade**, dentro do prazo.
   * ⛔ Ver `prova-de-acesso.ts` — ela autoriza ⛔ SOMENTE o motor local.
   */
  provaLocalValida?: boolean;
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

  /** ⚠️ Confirmado pelo servidor tem precedência sobre ⛔ qualquer prova local. */
  if (estado.status === "ativo") return "liberado_online";
  if (estado.status === "pendente") return "aguardando_aprovacao";
  if (estado.status === "bloqueado") return "conta_indisponivel";

  /**
   * ⚠️⚠️ AUSÊNCIA DE RESPOSTA ⛔ NÃO É AUTORIZAÇÃO — e ⛔ nem é recusa automática.
   *
   * ⛔ Só degrada quem **já provou** ser ativo neste aparelho, nesta identidade,
   * dentro do prazo. ⚠️ Sem prova, falha **fechada**: uma conta pendente ⛔ não
   * ganha acesso derrubando a internet, e primeira instalação offline ⛔ não abre.
   *
   * ⚠️ Note a ordem: `pendente` e `bloqueado` são tratados **acima**, então uma
   * recusa confirmada ⛔ nunca cai aqui, ⛔ nem com prova válida no aparelho.
   */
  if (estado.rpcFalhou && estado.provaLocalValida) return "liberado_local_degradado";

  return "conta_indisponivel";
}
