/**
 * PROMETE: que a sessão anônima ⛔ **nunca** seja substituída antes de a posse
 *   das sessões clínicas estar transferida — nem quando a autenticação falha,
 *   nem quando o claim falha, nem quando o claim explode.
 * NÃO PROMETE: que o servidor esteja implantado. Isto EXECUTA a decisão do
 *   cliente contra falhas forçadas; a prova do servidor é `test:edge-functions`.
 * UNIVERSO: `lib/troca-de-sessao.ts`, executado — ⛔ não varrido.
 *
 * ── ⚠️⚠️ POR QUE ESTA PROVA EXECUTA, EM VEZ DE LER O FONTE ─────────────────
 *
 * ⛔ A versão anterior desta arquitetura afirmava, num comentário, que *"falha
 * no claim ⛔ nunca derruba o login"* — e a afirmação estava **errada**: se a
 * sessão nova é instalada com o claim falho, as sessões continuam do `old_uid`
 * enquanto o cliente vira `new_uid`, e ⛔ o histórico **some naquele instante**.
 *
 * ⚠️⚠️ Uma varredura de fonte teria aprovado as duas versões — a certa e a
 * errada — porque as duas *chamam* o claim. ⛔ O que distingue ⛔ não é quem é
 * chamado, é **o que ⛔ NÃO acontece depois da falha**. Isso só se mede rodando.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-troca-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "lib", "troca-de-sessao.ts"),
], { cwd: appDir, stdio: "pipe" });

const { trocarDeSessao, desfechoDoClaim, ehProvaAnonima } = require(
  path.join(tempDir, "troca-de-sessao.js")
);

// ── ⚠️⚠️ 0 · AS DUAS REGRAS QUE A FIAÇÃO CONSOME ──────────────────────────
//
// ⚠️ Elas viviam junto do `fetch` e ⛔ duas regressões sobreviviam à mutação:
// claim que respondeu 500 tratado como sucesso, e token de conta cadastrada
// usado como prova anônima. ⛔ Regra ⛔ não mora junto de entrada e saída (I6).
confere("⚠️⚠️ ⛔ resposta ⛔ não-ok ⛔ NUNCA vira desfecho `ok`",
  desfechoDoClaim({ ok: false }, null) === "falha" && desfechoDoClaim(undefined, null) === "falha",
  "⛔ um 500 do servidor tratado como sucesso instalaria a sessão nova e perderia o histórico");
confere("resposta ok vira `ok`", desfechoDoClaim({ ok: true }, null) === "ok",
  "⛔ uma regra que ⛔ só sabe recusar tornaria o login impossível");
confere("⚠️⚠️ `pendente` e bloqueada ⛔ NÃO se confundem",
  desfechoDoClaim({ ok: false }, { error: "conta_pendente" }) === "conta_pendente" &&
    desfechoDoClaim({ ok: false }, { error: "conta_indisponivel" }) === "conta_indisponivel",
  "dizer \"aguardando aprovação\" a quem foi BLOQUEADO manda a pessoa esperar por algo que ⛔ não vai acontecer");
confere("⛔ desfecho desconhecido falha FECHADO",
  desfechoDoClaim({ ok: false }, { error: "qualquer_coisa_nova" }) === "falha",
  "⛔ estado ⛔ não reconhecido virando sucesso é como um erro de servidor instalaria a sessão");
confere("⚠️⚠️ ⛔ ⛔ ⛔ SÓ sessão marcada como anônima vira prova de posse",
  ehProvaAnonima({ is_anonymous: true }) === true &&
    ehProvaAnonima({ is_anonymous: false }) === false &&
    ehProvaAnonima({}) === false &&
    ehProvaAnonima(null) === false,
  "mandar o token de conta CADASTRADA no `X-Anon-Token` exporia a credencial a um endpoint que ⛔ não precisa dela, e faria ⛔ todo login comum falhar o claim");


/**
 * ⚠️ O MUNDO FALSO. `instalar` ⛔ não instala ⛔ nada: ela **registra que foi
 * chamada** — e é esse registro que carrega toda a prova.
 */
function mundo({ anonima = true, autentica = true, desfecho = "ok", claimExplode = false } = {}) {
  const chamadas = [];
  /** ⚠️ A sessão instalada AGORA. Começa anônima, como no consultório real. */
  let instalada = anonima ? "anon-A" : "nenhuma";
  return {
    chamadas,
    sessaoInstalada: () => instalada,
    portas: {
      sessaoAtual: async () => ({ token: anonima ? "tok-anon-A" : undefined, anonima }),
      autenticar: async () => {
        chamadas.push("autenticar");
        return autentica ? { sessao: { access_token: "tok-X" } } : { erro: "credenciais_invalidas" };
      },
      reivindicar: async () => {
        chamadas.push("reivindicar");
        if (claimExplode) throw new Error("rede caiu");
        return { desfecho, transferidas: desfecho === "ok" ? 3 : 0 };
      },
      instalar: async (s) => {
        chamadas.push("instalar");
        instalada = s.access_token === "tok-X" ? "conta-X" : "?";
        return {};
      },
    },
  };
}

async function principal() {

// ── ⚠️⚠️ 1 · O CENÁRIO EXIGIDO: claim falha, sessão anônima PERMANECE ──────
{
  const m = mundo({ desfecho: "falha" });
  const r = await trocarDeSessao(m.portas, "medico@exemplo.com", "senha");
  confere("claim falho ⇒ a autenticação da conta chegou a acontecer",
    m.chamadas.includes("autenticar"),
    "sem autenticar, o cenário ⛔ não é o que se quer medir");
  confere("claim falho ⇒ o claim foi mesmo tentado",
    m.chamadas.includes("reivindicar"),
    "se o claim ⛔ nem foi tentado, a prova abaixo passaria por engano");
  confere("⚠️⚠️ ⛔ ⛔ claim falho ⇒ `instalar` ⛔ NUNCA foi chamada",
    !m.chamadas.includes("instalar"),
    "instalar com o claim falho deixa as sessões no `old_uid` enquanto o cliente vira `new_uid` — o histórico SOME");
  confere("⚠️⚠️ a sessão instalada continua sendo a anônima A",
    m.sessaoInstalada() === "anon-A",
    "o médico precisa continuar lendo o que registrou, e poder tentar de novo");
  confere("o resultado nomeia a falha, e ⛔ não mente sobre a troca",
    r.erro === "claim_falhou" && r.sessaoTrocada === false && r.transferidas === 0,
    "⛔ relatar troca que ⛔ não houve faria a tela mostrar sucesso sobre um histórico perdido");
}

// ── ⚠️ 2 · CLAIM QUE EXPLODE conta como claim falho ────────────────────────
{
  const m = mundo({ claimExplode: true });
  let estourou = false;
  try { await trocarDeSessao(m.portas, "medico@exemplo.com", "senha"); } catch { estourou = true; }
  confere("⚠️ exceção no claim ⛔ não instala a sessão nova",
    !m.chamadas.includes("instalar"),
    "⛔ falha de rede ⛔ não pode ser mais permissiva que falha declarada");
  confere("a sessão instalada continua sendo a anônima A (exceção)",
    m.sessaoInstalada() === "anon-A", "mesma regra, outro caminho de falha");
  confere("a exceção ⛔ não vaza crua para a tela",
    estourou === false,
    "⛔ exceção não tratada deixaria a tela sem mensagem e sem estado");
}

// ── ⚠️ 3 · AUTENTICAÇÃO FALHA: ⛔ nem chega ao claim ───────────────────────
{
  const m = mundo({ autentica: false });
  const r = await trocarDeSessao(m.portas, "medico@exemplo.com", "senha");
  confere("⛔ credencial inválida ⇒ `instalar` ⛔ não é chamada",
    !m.chamadas.includes("instalar"), "⛔ não há sessão para instalar");
  confere("⛔ credencial inválida ⇒ o claim ⛔ nem é tentado",
    !m.chamadas.includes("reivindicar"),
    "mandar o token anônimo sem ter a conta ⛔ exporia a credencial à toa");
  confere("a sessão instalada continua sendo a anônima A (credencial)",
    m.sessaoInstalada() === "anon-A" && r.sessaoTrocada === false, "⛔ nada foi tocado");
}

// ── ⚠️ 4 · O CAMINHO FELIZ ainda funciona ─────────────────────────────────
{
  const m = mundo({});
  const r = await trocarDeSessao(m.portas, "medico@exemplo.com", "senha");
  confere("⚠️ claim bem-sucedido ⇒ a sessão da conta é instalada",
    m.sessaoInstalada() === "conta-X" && r.sessaoTrocada === true,
    "uma trava que ⛔ só sabe recusar tornaria o login impossível");
  confere("⚠️⚠️ e a instalação vem DEPOIS do claim, ⛔ nunca antes",
    m.chamadas.indexOf("reivindicar") < m.chamadas.indexOf("instalar"),
    "instalar primeiro derruba a sessão anônima e destrói a prova de posse");
  confere("o número transferido é o que o servidor disse", r.transferidas === 3,
    "⛔ o cliente ⛔ não inventa quantas foram");
}

// ── ⚠️ 5 · LOGIN COMUM (⛔ sem sessão anônima) ⛔ não exige claim ───────────
{
  const m = mundo({ anonima: false });
  const r = await trocarDeSessao(m.portas, "medico@exemplo.com", "senha");
  confere("⚠️ ⛔ sem sessão anônima, o claim ⛔ nem é chamado",
    !m.chamadas.includes("reivindicar"),
    "⛔ não há posse para transferir — exigir claim aqui deixaria o login comum refém de uma função que ⛔ nem precisa existir");
  confere("⚠️ e o login comum instala normalmente",
    m.sessaoInstalada() === "conta-X" && r.sessaoTrocada === true,
    "⛔ quebrar o login de quem ⛔ nunca usou o app anônimo seria regressão pura");
}


// ── ⚠️⚠️ 6 · O CICLO COMPLETO: anônimo → pendente → aprovação ──────────────
//
// ⚠️⚠️ A CORREÇÃO QUE ESTE CENÁRIO CARREGA: o claim **É CHAMADO** para a conta
// pendente. ⛔ A versão anterior desta prova dizia *"claim ⛔ não chamado"* — e
// isso contradizia a arquitetura, porque ⛔ só o servidor conhece o `status`.
//
// ⛔ Se o cliente pudesse antecipar, ele voltaria a ser autoridade sobre a
// própria autorização — ⛔ exatamente o defeito do `old_user_id`.
{
  const chamadas = [];
  let instalada = "anon-A";
  let statusDeX = "pendente";
  const portas = {
    sessaoAtual: async () => ({ token: "tok-anon-A", anonima: true }),
    autenticar: async () => {
      chamadas.push("autenticar");
      return { sessao: { access_token: "tok-X" } };
    },
    /** ⚠️ O servidor decide: é ele que enxerga o `status`. */
    reivindicar: async () => {
      chamadas.push("reivindicar");
      if (statusDeX !== "ativo") return { desfecho: "conta_pendente", transferidas: 0 };
      return { desfecho: "ok", transferidas: 4 };
    },
    instalar: async (sess) => {
      chamadas.push("instalar");
      instalada = sess.access_token === "tok-X" ? "conta-X" : "?";
      return {};
    },
  };

  const r1 = await trocarDeSessao(portas, "medico@exemplo.com", "senha");

  confere("⚠️⚠️ conta pendente: o claim FOI chamado",
    chamadas.filter((c) => c === "reivindicar").length === 1,
    "⛔ o cliente ⛔ não pode antecipar o `status` — se pudesse, seria autoridade sobre a própria autorização");
  confere("⚠️⚠️ ⛔ conta pendente: ⛔ NENHUMA sessão foi transferida",
    r1.transferidas === 0,
    "posse ⛔ só muda quando a nova identidade está autorizada a exercê-la");
  confere("⚠️⚠️ ⛔ conta pendente: `instalar` ⛔ NÃO foi chamada",
    !chamadas.includes("instalar"),
    "⛔ trocar para uma conta que ⛔ não pode ler é indistinguível de perder o histórico");
  confere("⚠️ a sessão instalada continua sendo anon A",
    instalada === "anon-A", "o médico continua vendo o que registrou");
  confere("⚠️⚠️ e a razão é `conta_pendente`, ⛔ não falha técnica",
    r1.erro === "conta_pendente" && r1.sessaoTrocada === false,
    "⛔ \"tente novamente\" mandaria o médico repetir para sempre algo que depende de um administrador");

  /** ⚠️ O administrador aprova. ⛔ Nada mais muda no cliente. */
  statusDeX = "ativo";
  const r2 = await trocarDeSessao(portas, "medico@exemplo.com", "senha");

  confere("⚠️⚠️ depois da aprovação: a transferência acontece",
    r2.transferidas === 4, "é o primeiro login em que a conta pode exercer a posse");
  confere("⚠️⚠️ e ⛔ SÓ ENTÃO a sessão é instalada",
    instalada === "conta-X" && r2.sessaoTrocada === true,
    "instalar antes do claim bem-sucedido destruiria a prova de posse");
  confere("⚠️ a instalação veio DEPOIS do claim bem-sucedido",
    chamadas.lastIndexOf("reivindicar") < chamadas.lastIndexOf("instalar"),
    "a ordem é o invariante — ⛔ não a presença das chamadas");
}

// ── ⚠️ 7 · CONTA BLOQUEADA ⛔ nunca recebe claim bem-sucedido ──────────────
{
  const m = mundo({ desfecho: "conta_indisponivel" });
  const r = await trocarDeSessao(m.portas, "medico@exemplo.com", "senha");
  confere("⚠️ conta bloqueada: o claim é chamado, e ⛔ nada transfere",
    m.chamadas.includes("reivindicar") && r.transferidas === 0,
    "mesma autoridade, mesmo caminho — muda ⛔ só o desfecho");
  confere("⚠️⚠️ ⛔ conta bloqueada: ⛔ NÃO instala, e ⛔ NÃO diz \"aguardando aprovação\"",
    !m.chamadas.includes("instalar") && r.erro === "conta_indisponivel",
    "⛔ mandar quem foi bloqueado esperar aprovação é uma mentira que custa uma espera inteira");
}

}

principal().then(() => {
if (falhas.length) {
  console.log(`\n❌ TROCA DE SESSÃO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ TROCA DE SESSÃO — ${ok}/${ok} conferências · 5 cenários\n`);
});
