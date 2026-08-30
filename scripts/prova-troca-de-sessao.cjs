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

const { trocarDeSessao, claimBemSucedido, ehProvaAnonima } = require(
  path.join(tempDir, "troca-de-sessao.js")
);

// ── ⚠️⚠️ 0 · AS DUAS REGRAS QUE A FIAÇÃO CONSOME ──────────────────────────
//
// ⚠️ Elas viviam junto do `fetch` e ⛔ duas regressões sobreviviam à mutação:
// claim que respondeu 500 tratado como sucesso, e token de conta cadastrada
// usado como prova anônima. ⛔ Regra ⛔ não mora junto de entrada e saída (I6).
confere("⚠️⚠️ ⛔ resposta ⛔ não-ok ⛔ NUNCA conta como claim bem-sucedido",
  claimBemSucedido({ ok: false }) === false && claimBemSucedido(undefined) === false,
  "⛔ um 500 do servidor tratado como sucesso instalaria a sessão nova e perderia o histórico");
confere("resposta ok conta como sucesso", claimBemSucedido({ ok: true }) === true,
  "⛔ uma regra que ⛔ só sabe recusar tornaria o login impossível");
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
function mundo({ anonima = true, autentica = true, claimOk = true, claimExplode = false } = {}) {
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
        return { ok: claimOk, transferidas: claimOk ? 3 : 0 };
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
  const m = mundo({ claimOk: false });
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

}

principal().then(() => {
if (falhas.length) {
  console.log(`\n❌ TROCA DE SESSÃO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ TROCA DE SESSÃO — ${ok}/${ok} conferências · 5 cenários\n`);
});
