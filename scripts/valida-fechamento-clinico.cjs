/**
 * PROMETE: que a migration de fechamento negue no BANCO — papel `anon` sem
 *   policy, posse por `auth.uid()`, autorização por conta `ativo`, eventos
 *   derivados da sessão pai — e que ⛔ não amplie capacidade ⛔ nem toque dado.
 * NÃO PROMETE: que esteja aplicada. ⛔ Ela ⛔ **não** está, e ⛔ por decisão: só entra
 *   depois da guarda de rota publicada.
 * UNIVERSO: `migrations-pendentes-futuras/*fecha_acesso_clinico*`, com piso.
 *
 * ── ⚠️⚠️ POR QUE ESTA TRAVA EXISTE SEPARADA DA GUARDA ─────────────────────
 *
 * ⛔ Cliente ⛔ nunca é prova. A guarda de rota impede a **navegação**; quem falar
 * direto com a API, com a chave publicável, passa por cima dela inteira.
 * ⚠️ A fronteira real é a RLS — e ⛔ é ela que esta trava mede.
 */
const fs = require("node:fs");
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const dir = path.join(appDir, "supabase", "migrations-pendentes-futuras");
const alvo = fs.existsSync(dir)
  ? fs.readdirSync(dir).filter((f) => /fecha_acesso_clinico/.test(f))
  : [];
confere("a migration de fechamento existe", alvo.length === 1, "sem ela ⛔ não há o que medir");

const sql = alvo.length ? lerFonte(path.join(dir, alvo[0])) : "";
const c = sql.replace(/^\s*--.*$/gm, "");
confere("e tem corpo", c.length > 600, "piso R-1: varredura sobre o vazio ⛔ não mede");

confere("⚠️⚠️ ⛔ ⛔ ⛔ NENHUM acesso irrestrito",
  !/using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i.test(c),
  "`using (true)` foi **exatamente** o defeito original — expôs `notes` e `event_data` a quem tivesse a chave publicável");

confere("⚠️⚠️ ⛔ ⛔ o papel `anon` ⛔ NÃO recebe policy ⛔ nenhuma",
  !/create policy[\s\S]*?\bto\s+[^;]*\banon\b/i.test(c),
  "quem ⛔ não tem sessão ⛔ nenhuma ⛔ não deve ler ⛔ nada — era assim que `/session-history` entregava tudo por URL");

confere("⚠️ toda policy exige posse por `auth.uid()`",
  (c.match(/user_id = \(select auth\.uid\(\)\)/g) || []).length >= 3,
  "sem posse, uma conta ativa leria as sessões de outra");

confere("⚠️⚠️ e autorização por conta ATIVA, no `using` E no `with check`",
  (c.match(/pode_usar_clinico\(\)/g) || []).length >= 6,
  "⛔ só no `using`, a conta `pendente` continuaria conseguindo INSERIR");

confere("⚠️⚠️ ⛔ a função ⛔ NÃO tem ramo anônimo",
  !/is_anonymous/.test(c),
  "⛔ um `or` adormecido num predicado de autorização é concessão latente: ligar Anonymous Sign-In no Dashboard — um clique — passaria a conceder acesso clínico");

confere("⚠️ a função é `stable` e `security invoker`, com `search_path`",
  /stable/i.test(c) && /security invoker/i.test(c) && /set search_path/i.test(c),
  "⛔ SECURITY DEFINER aqui contornaria a RLS que estamos criando");

confere("⚠️ `(select …)` nas duas chamadas — initplan",
  !/(?<!\(select )public\.pode_usar_clinico\(\)\s*\)?\s*(and|or|;)/i.test(c) || /\(select public\.pode_usar_clinico\(\)\)/.test(c),
  "⛔ sem o `(select …)`, a função roda POR LINHA — numa listagem de 536, a diferença entre 1 e 536 execuções");

confere("⚠️⚠️ ⛔ ⛔ NENHUMA policy de DELETE é criada",
  !/for\s+delete/i.test(c),
  "sem policy, apagar já é negado — criar uma seria CONCEDER capacidade nova, ⛔ e ⛔ não fechar buraco");

confere("⚠️ eventos derivam a autorização da sessão pai",
  /clinical_session_events[\s\S]*?exists\s*\([\s\S]*?clinical_sessions/i.test(c),
  "um `user_id` próprio nos eventos seria um segundo dono capaz de divergir do primeiro");

confere("⚠️⚠️ ⛔ ⛔ ⛔ NENHUM dado é lido, alterado ⛔ ou apagado",
  /**
   * ⚠️ Mede **DML de verdade**, ⛔ e ⛔ não a palavra solta: `for update` é
   * declaração de policy, e a primeira versão desta trava reprovou por isso.
   */
  !/update\s+public\.\w+\s+set|delete\s+from|insert\s+into/i.test(c) &&
    !/notes|event_data/i.test(c),
  "⛔ as 536 órfãs permanecem no banco, intactas — atribuí-las a alguém seria pior que o vazamento");

confere("⚠️ ⛔ `user_id IS NULL` ⛔ NUNCA concede posse",
  !/user_id\s+is\s+null/i.test(c),
  "linha sem dono virar linha de todos ⛔ **é** o vazamento, escrito de outro jeito");

confere("⚠️ roda em UMA transação",
  /^\s*begin;/im.test(c) && /^\s*commit;/im.test(c),
  "sem transação haveria um instante com as policies antigas removidas e as novas ⛔ não criadas");

confere("⚠️⚠️ ⛔ e ⛔ NÃO está na sequência executável ainda",
  !fs.readdirSync(path.join(appDir, "supabase", "migrations")).some((f) => /fecha_/.test(f)),
  "a ordem é guarda publicada → validada → só então RLS");

// ── ⚠️⚠️ A MATRIZ DE ACESSO — medida na própria lógica ────────────────────
//
// ⚠️ Ela ⛔ não pode rodar aqui: só é válida contra um banco **com a migration
// aplicada**. ⚠️ Mas o que ela promete sobre si mesma dá para medir agora — e é
// ⛔ exatamente onde um teste de segurança se corrompe sem ⛔ ninguém notar.
const mtz = lerFonte(path.join(appDir, "scripts", "matriz-de-acesso.cjs"));
const mc = mtz.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

confere("a matriz de acesso existe e tem corpo", mc.length > 1500, "piso R-1");

/**
 * ⚠️⚠️ CADA ASSERÇÃO DE PERMISSÃO PRECISA VIR DE `rest(` COM TOKEN.
 *
 * ⛔ A primeira versão tinha um `||` que a tornava quase sempre verdadeira, e a
 * mutação que trocava uma asserção de cliente por `admin()` **sobreviveu**.
 *
 * ⚠️ Há **uma** exceção legítima, nomeada aqui: `orfasNoBanco` usa service role
 * ⛔ de propósito, para provar que as órfãs **continuam existindo** — é checagem
 * de existência, ⛔ e ⛔ não de permissão. ⚠️ Exceção escrita, ⛔ e ⛔ não silenciosa.
 */
/**
 * ⚠️⚠️ CATEGORIA PRÓPRIA — ⛔ e ⛔ não "uma exceção qualquer".
 *
 * ⚠️ `orfasNoBanco` e `contarOrfas` usam service role para afirmar sobre o
 * **estado global do banco**: que as órfãs continuam existindo, e que a matriz
 * ⛔ não criou nenhuma. ⛔ Isso ⛔ NÃO é asserção de permissão — é asserção de
 * **integridade**, e ⛔ nenhum JWT de cliente poderia produzi-la, ⛔ justamente
 * porque o cliente ⛔ não deve enxergar essas linhas.
 *
 * ⛔ ⛔ A distinção precisa estar escrita AQUI. ⚠️ Sem ela, daqui a dois meses
 * alguém "simplifica" a trava e conclui que service role vale para as
 * verificações da matriz **em geral** — e aí a matriz passa a medir um banco
 * aberto, ⛔ verde.
 */
const INTEGRIDADE_GLOBAL = ["orfasNoBanco", "orfasAntes", "orfasDepois"];
const EXCECAO_SERVICE = INTEGRIDADE_GLOBAL;
const blocos = [...mc.matchAll(/confere\(([\s\S]{0,700}?)\);/g)].map((m) => m[1]);
/**
 * ⚠️⚠️ PISO ESTRUTURAL — ⛔ zero conferências ⛔ NUNCA pode dar verde.
 *
 * ⛔ Isto ⛔ não é formalidade: numa rodada desta auditoria o extrator de blocos
 * parou de casar, a trava passou a reprovar **incondicionalmente**, e todas as
 * mutações pareceram capturadas. ⚠️ Verde falso e vermelho falso vêm do mesmo
 * defeito — a medição ⛔ não estava medindo.
 */
/**
 * ⚠️ O piso existe contra **extrator quebrado**, ⛔ e ⛔ não para congelar a
 * contagem. A matriz tem 13 chamadas no fonte — várias dentro de laços, então o
 * número em execução é maior. ⛔ 12 dá folga para uma asserção sair sem virar
 * manutenção de número, e ainda assim ⛔ nenhum defeito de casamento passa.
 */
const PISO_ASSERCOES = 12;
confere(`⚠️⚠️ encontrou ao menos ${PISO_ASSERCOES} conferências na matriz`,
  blocos.length >= PISO_ASSERCOES,
  `achou ${blocos.length} — ⛔ extrator que casa zero faz toda mutação parecer pega`);

// ── ⚠️⚠️ AS QUATRO INVARIANTES DA MATRIZ ──────────────────────────────────

confere("⚠️⚠️ 1 · captura o baseline de órfãs ANTES de criar fixture",
  /const orfasAntes = await contarOrfas\(\)/.test(mc) &&
    mc.indexOf("orfasAntes") < mc.indexOf("auth/v1/admin/users"),
  "⛔ ler o baseline depois de criar fixture mediria o estado já contaminado");

confere("⚠️⚠️ 1b · e PROVA no fim que a contagem voltou ao baseline",
  /orfasDepois === orfasAntes/.test(mc),
  "⛔ conferir só que 'existem órfãs' ficaria verde JUSTAMENTE por causa do dano que a própria matriz causou");

confere("⚠️⚠️ 2 · a limpeza tolera setup parcial",
  /try\s*\{[\s\S]{0,200}?clinical_sessions\?module_key[\s\S]{0,200}?\}\s*catch/.test(mc) &&
    /for \(const c of criados\)[\s\S]{0,200}?try\s*\{/.test(mc),
  "⛔ falhar depois de criar A e antes de B ⛔ não pode virar um segundo erro que apaga o original");

confere("⚠️⚠️ 3 · sessões-fixture removidas ANTES dos usuários",
  mc.indexOf("clinical_sessions?module_key=like") < mc.indexOf("auth/v1/admin/users/${c.uid}"),
  "⛔ FK `on delete set null`: usuário primeiro deixaria a fixture ÓRFÃ PERMANENTE");

confere("⚠️⚠️ 4 · o caminho sem sessão ⛔ NÃO ACEITA token",
  /async function semSessao\(caminho, \{ metodo = "GET", corpo \} = \{\}\)/.test(mc) &&
    !/semSessao\([^)]*token/.test(mc),
  "⛔ depender de passar `{ token: undefined }` deixa um refactor herdar header — falso negativo ⛔ exatamente onde deveria gritar");

confere("⚠️ 4b · e é ele que faz a checagem de abortar",
  /semJwt = await semSessao\(/.test(mc),
  "⛔ se a guarda de aborto usasse cliente com token, ⛔ não mediria o acesso público");

confere("há asserções para medir", blocos.length > 0, "piso R-1");

const usamService = blocos.filter((b) => {
  const vars = [...b.matchAll(/\b(\w+)\.dados\b|\b(\w+)\.status\b/g)]
    .map((m) => m[1] || m[2]);
  return vars.some((v) => {
    if (EXCECAO_SERVICE.includes(v)) return false;
    const origem = new RegExp(`const ${v}\\s*=\\s*await (\\w+)\\(`).exec(mc);
    return origem?.[1] === "admin";
  });
});
confere("⚠️⚠️ ⛔ ⛔ o service role ⛔ NUNCA aparece numa asserção de permissão",
  usamService.length === 0,
  "⛔ service role passa POR CIMA da RLS por definição — usá-lo para simular cliente daria verde sobre banco aberto");

confere("⚠️⚠️ a matriz ABORTA se a migration ⛔ não estiver aplicada",
  /leitura pública ainda funciona|ABORTADO/.test(mtz) && /semJwt\.dados\.length > 0/.test(mc),
  "⛔ rodar antes do fechamento daria verde enganoso em metade das linhas");

/**
 * ⚠️ Mede a **guarda**, ⛔ e ⛔ não a menção: a mensagem de ajuda cita
 * `MATRIZ_CONFIRMO=sim`, então procurar o nome passaria mesmo sem o `if`.
 */
confere("⚠️ exige confirmação explícita para executar",
  /process\.env\.MATRIZ_CONFIRMO\s*!==\s*["']sim["'][\s\S]{0,400}?process\.exit/.test(mc),
  "⛔ teste que cria usuários em produção ⛔ não pode disparar por engano numa suíte");

/**
 * ⚠️⚠️ MEDE **INTERPOLAÇÃO DE VALOR**, ⛔ e ⛔ não a palavra.
 *
 * ⛔ A primeira versão reprovou a mensagem de ajuda que cita os NOMES das
 * variáveis de ambiente — `"Exige SUPABASE_SERVICE_ROLE_KEY."` ⛔ não vaza
 * ⛔ nada. ⚠️ O risco é `${token}`, ⛔ não a string "token".
 *
 * ⚠️ Por isso os literais saem antes: o que sobra é código de verdade.
 */
const mcSemTexto = mc.replace(/"[^"]*"|'[^']*'/g, '""');
confere("⚠️⚠️ ⛔ ⛔ ⛔ NÃO imprime token, senha ⛔ nem chave",
  !/console\.log\([^)]*\$\{[^}]*(token|senha|PUBLICA|SERVICE|access_token)/i.test(mcSemTexto) &&
    !/console\.log\(\s*(token|senha|PUBLICA|SERVICE)\b/i.test(mcSemTexto),
  "⛔ um teste que vaza credencial no log é pior que o buraco que ele mede");

confere("⚠️ as fixtures são marcadas e de domínio inalcançável",
  /\.invalid/.test(mc) && /MARCA/.test(mc),
  "⛔ e-mail real receberia mensagem; fixture sem marca ⛔ não dá para apagar com segurança");

confere("⚠️⚠️ apaga as SESSÕES antes dos usuários",
  mc.indexOf("clinical_sessions?module_key=like") < mc.indexOf("auth/v1/admin/users/"),
  "⛔ a FK é `on delete set null`: apagar o usuário primeiro deixaria a fixture ÓRFÃ, somando à contagem que a matriz acabou de conferir");

confere("⚠️ a limpeza roda mesmo se uma asserção falhar",
  /finally\s*\{/.test(mc),
  "⛔ falhar no meio ⛔ não pode deixar conta de teste viva em produção");

confere("⚠️⚠️ tem o POSITIVO obrigatório",
  /ativo A vê a PRÓPRIA sessão/.test(mtz),
  "⛔ uma matriz que ⛔ só sabe recusar passaria verde sobre um banco que nega tudo");

confere("⛔ ⛔ ⛔ não toca dado clínico real",
  !/notes|event_data/.test(mc) && /module_key: `\$\{MARCA\}/.test(mc),
  "⛔ reaproveitar sessão real num teste de permissão arrisca alterá-la");

if (falhas.length) {
  console.log(`\n❌ FECHAMENTO CLÍNICO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ FECHAMENTO CLÍNICO — ${ok}/${ok} conferências\n`);
