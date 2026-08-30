/**
 * PROMETE: que ⛔ nenhuma Edge Function versionada alcance operação privilegiada
 *   — chamada paga ao provedor, ⛔ ou uso do service role — **antes** de rejeitar
 *   requisição ⛔ não autenticada; e que ⛔ nenhuma delas confie em `verify_jwt`
 *   como se fosse autenticação.
 * NÃO PROMETE: que as funções implantadas estejam corrigidas — elas ⛔ **não**
 *   foram. Esta trava mede o **fonte versionado**, que é o que será implantado
 *   quando o autor aprovar.
 * UNIVERSO: todo `supabase/functions/**\/index.ts`, contado, com piso.
 *
 * ── ⚠️⚠️ POR QUE A ORDEM É O QUE SE MEDE ─────────────────────────────────────
 *
 * ⛔ *"Existe uma checagem de token"* ⛔ não basta: em `create-user` existia, e era
 * **opcional** — o `if (token)` calculava se o chamador era admin e seguia para
 * `admin.auth.admin.createUser` **de qualquer forma**.
 *
 * ⚠️ O que importa é **onde** a rejeição acontece: antes, ou depois, do ponto em
 * que a função gasta dinheiro ⛔ ou usa privilégio.
 */
const fs = require("node:fs");
const path = require("node:path");
/**
 * ⚠️⚠️ `lerFonte`, e ⛔ **não** `fs.readFileSync` — R-92, e a trava do repositório
 * me pegou nisto depois de eu ter **citado a regra** no comentário abaixo e ⛔ não
 * a seguido. ⚠️ Comentário ⛔ não executa: uma guarda que só existisse no texto
 * explicativo satisfaria a busca sem existir no código.
 */
const { lerFonte, lerCru } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const dir = path.join(appDir, "supabase", "functions");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const funcoes = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => fs.existsSync(path.join(dir, f, "index.ts")))
  : [];

confere("há funções versionadas para medir",
  funcoes.length >= 2,
  "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");

/** ⚠️ O que caracteriza operação privilegiada — dinheiro ⛔ ou service role. */
const PRIVILEGIO = [
  { nome: "chamada ao provedor de IA", re: /fetch\(\s*["'`]https:\/\/api\.openai\.com/ },
  { nome: "leitura da chave da OpenAI", re: /Deno\.env\.get\(\s*["'`]OPENAI_API_KEY/ },
  { nome: "criação de usuário", re: /auth\.admin\.createUser/ },
  { nome: "alteração de usuário", re: /auth\.admin\.(updateUserById|deleteUser)/ },
];
/** ⚠️ O que caracteriza rejeição por falta de autenticação. */
const REJEICAO = /return\s+\w+\(\s*\{[^}]*\}\s*,\s*401\s*\)|,\s*401\s*\);/;

/**
 * ⚠️⚠️ A EXCEÇÃO ⛔ NÃO É SILENCIOSA — e ⛔ não é generosa.
 *
 * ⛔ `request-access` é a porta **pública** de solicitação de acesso: exigir
 * autenticação nela seria exigir que a pessoa já tenha conta para pedir conta.
 * ⚠️ Ela ⛔ não pode ser medida pela regra "rejeite ⛔ antes de usar privilégio",
 * porque ⛔ não há quem rejeitar.
 *
 * ⚠️⚠️ Mas ela usa **service role**, então ⛔ não fica sem medição ⛔ nenhuma: a
 * regra troca de forma. Ela precisa **declarar os riscos residuais no próprio
 * fonte**, e ⛔ não pode alcançar operação privilegiada ⛔ além da criação de
 * conta pendente — ⛔ nada de apagar, promover ⛔ ou trocar senha.
 *
 * ⛔ ⛔ Exceção sem motivo escrito é o defeito que estas travas combatem. Esta
 * tem motivo, ⛔ tem data, e ⛔ tem uma medição que a substitui.
 */
const PUBLICAS_POR_DESENHO = {
  "request-access": "2026-08-30 · porta pública de cadastro: exigir token aqui exigiria conta para pedir conta",
};

for (const f of Object.keys(PUBLICAS_POR_DESENHO)) {
  if (!funcoes.includes(f)) continue;
  const c = lerFonte(path.join(dir, f, "index.ts"));
  /**
   * ⚠️⚠️ `lerCru` AQUI, ⛔ e ⛔ não `lerFonte` — porque nesta conferência **o
   * comentário É o objeto medido**, ⛔ e ⛔ não um lugar onde um termo poderia me
   * enganar. ⚠️ A trava caiu primeiro por isto: `lerFonte` apaga comentário
   * ⛔ por desenho, então a documentação que eu acabara de escrever era invisível.
   */
  const cru = lerCru(path.join(dir, f, "index.ts"));
  confere(`⚠️⚠️ ${f}: declara os riscos residuais NO FONTE`,
    /RISCOS RESIDUAIS/i.test(cru) && /email_confirm/.test(cru) && /teto de cria|rate limit/i.test(cru),
    "⛔ função pública com service role que ⛔ não nomeia o próprio risco vira risco esquecido");
  confere(`⚠️⚠️ ⛔ ${f}: ⛔ ⛔ NÃO alcança operação privilegiada além de criar conta`,
    !/deleteUser|updateUserById|generateLink|admin\.listUsers/.test(c),
    "⛔ a exceção cobre criar conta pendente — ⛔ apagar, promover ⛔ ou trocar senha ⛔ sem autenticação ⛔ nenhuma seria outra coisa");
  confere(`⚠️ ${f}: a conta nasce PENDENTE, ⛔ e ⛔ não ativa`,
    /pendente/.test(c),
    "⛔ sem isso, uma porta pública criaria acesso ativo — o `status` é o que contém o dano do `email_confirm: true`");
}

for (const f of funcoes) {
  if (PUBLICAS_POR_DESENHO[f]) continue;
  /** ⚠️ Já vem sem comentário — ver o `require` no topo. */
  const codigo = lerFonte(path.join(dir, f, "index.ts"));

  confere(`${f}: exige Authorization`,
    /req\.headers\.get\(\s*["'`]Authorization/i.test(codigo),
    "sem ler o cabeçalho, ⛔ não há como distinguir chamador ⛔ nenhum");
  confere(`${f}: valida o token contra um usuário REAL`,
    /auth\.getUser\(/.test(codigo),
    "**`verify_jwt` sozinho ⛔ não basta**: a chave `anon` é um JWT válido e viaja no bundle do cliente");
  /**
   * ⚠️⚠️ O TOKEN É **OBRIGATÓRIO**, e ⛔ não opcional — e a diferença é o defeito.
   *
   * ⛔ Em `create-user` havia `if (token) { …calcula admin… }` e a função
   * **seguia** para `createUser` sem token. ⚠️ "Existe um 401 em algum lugar"
   * ⛔ não mede isso: mede-se que a **ausência** de token **retorna**.
   */
  /**
   * ⚠️⚠️ MEDE COMPORTAMENTO, e ⛔ não o **nome da variável** — a primeira versão
   * exigia literalmente `if (!token)` e reprovou uma função correta ⛔ só porque
   * ela chamava a variável de `bearer`. ⛔ Trava que casa identificador mede
   * estilo, e ⛔ não segurança.
   */
  const ausenciaFecha = /if\s*\(\s*!\s*\w+\s*\)[\s\S]{0,140}?return[^;]{0,140}?401/.test(codigo);
  confere(`${f}: a AUSÊNCIA de token retorna, e ⛔ não segue`,
    ausenciaFecha,
    "`if (token) { … }` sem `else` é falha ABERTA — foi exatamente o defeito de create-user");
  confere(`${f}: e o token inválido também retorna`,
    /if\s*\(\s*!\s*\w+[^)]{0,40}\)\s*\{?\s*return[^;]{0,80}401/.test(codigo),
    "token presente mas sem usuário por trás ⛔ não pode passar");

  /**
   * ⚠️⚠️ A CONFERÊNCIA CENTRAL: a rejeição vem **antes** do privilégio.
   */
  const posRejeicao = codigo.search(/,\s*401\s*\)/);
  for (const p of PRIVILEGIO) {
    const pos = codigo.search(p.re);
    if (pos < 0) continue;
    confere(`${f}: rejeita ANTES de ${p.nome}`,
      posRejeicao >= 0 && posRejeicao < pos,
      `⛔ requisição ⛔ não autenticada ⛔ não pode alcançar ${p.nome} — era exatamente o defeito de create-user`);
  }

  /**
   * ⚠️⚠️ OPERAÇÃO SOBRE USUÁRIOS EXIGE **ADMIN ATIVO** — e antes da operação.
   *
   * ⛔ Validar identidade ⛔ não basta: qualquer usuário autenticado ⛔ não pode criar,
   * alterar senha ⛔ ou apagar contas.
   */
  const mexeEmUsuarios = /auth\.admin\.(createUser|updateUserById|deleteUser)/.exec(codigo);
  if (mexeEmUsuarios) {
    const guarda = codigo.search(/role\s*===\s*["'`]admin["'`][\s\S]{0,120}status\s*===\s*["'`]ativo["'`]/);
    confere(`${f}: exige admin ATIVO antes de mexer em usuários`,
      guarda >= 0 && guarda < mexeEmUsuarios.index,
      "identidade ⛔ não é autorização: usuário comum ⛔ não cria ⛔ nem apaga contas");
    confere(`${f}: e nega com 403 quem ⛔ não é admin`,
      /,\s*403\s*\)/.test(codigo),
      "sem o 403, a guarda existiria e ⛔ não rejeitaria");
  }

  /** ⛔⛔ E a chave do provedor ⛔ NUNCA pode sair no corpo da resposta. */
  confere(`${f}: ⛔ NÃO devolve a chave do provedor`,
    !/OPENAI_API_KEY[^;]{0,80}(jsonResponse|json\(|JSON\.stringify)/.test(codigo),
    "chave em corpo de resposta é vazamento, mesmo em erro");
}

console.log(`\nFunções versionadas: ${funcoes.join(", ") || "—"}`);
if (falhas.length > 0) {
  console.error(`\n❌ PROVA DAS EDGE FUNCTIONS — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ PROVA DAS EDGE FUNCTIONS — ${ok}/${ok} conferências · ${funcoes.length} funções\n`);
