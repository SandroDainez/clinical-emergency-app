/**
 * PROMETE: que a posse de sessões clínicas ⛔ nunca dependa de uma **afirmação
 *   do cliente**; que a transferência aconteça **antes** de a sessão da conta
 *   ser instalada; e que o token anônimo ⛔ nunca vaze para log, analytics,
 *   tracing ⛔ ou persistência.
 * NÃO PROMETE: que a migration esteja aplicada — ⛔ ela **não** está. Isto mede o
 *   fonte versionado, que é o que será aplicado quando o autor aprovar.
 * UNIVERSO: `lib/sessao-anonima.ts` + a migration de posse, ambas com piso.
 *
 * ── ⚠️⚠️ POR QUE A **ORDEM** É O INVARIANTE ─────────────────────────────────
 *
 * ⚠️ Se `setSession` rodar **antes** do claim, a sessão anônima deixa de ser a
 * ativa e ⛔ perdemos a prova de posse. O que sobraria seria mandar o
 * `old_user_id` no corpo — ⛔ exatamente o que ⛔ não pode ser autoridade.
 *
 * ⚠️⚠️ Por isso ⛔ não basta medir *"o claim é chamado"*: ele pode ser chamado
 * **tarde**, e aí ⛔ não prova ⛔ nada. Mede-se a **posição relativa**.
 */
const fs = require("node:fs");
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const cliente = lerFonte(path.join(appDir, "lib", "sessao-anonima.ts"));

/** ⚠️ R-1: ⛔ nenhuma trava pode passar por rodar sobre o vazio. */
confere("o fonte do cliente existe e tem corpo", cliente.length > 800,
  "arquivo ausente ⛔ ou vazio faria todas as conferências abaixo passarem sem medir ⛔ nada");

/** ⚠️ Só o **código** — comentário ⛔ não executa (R-92), e este arquivo tem muito. */
const codigo = cliente
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

// ── ⚠️⚠️ 1 · A INVERSÃO DE ORDEM ──────────────────────────────────────────
const posClaim = codigo.indexOf("claim-anonymous-sessions");
const posInstala = codigo.indexOf("setSession");

confere("a transferência é chamada, e a sessão é instalada", posClaim >= 0 && posInstala >= 0,
  "sem as duas operações ⛔ não há ordem para medir");

confere("⚠️⚠️ o claim acontece ANTES de a sessão da conta ser instalada",
  posClaim >= 0 && posInstala >= 0 && posClaim < posInstala,
  "instalar primeiro derruba a sessão anônima e destrói a prova de posse — sobraria confiar num `old_user_id` do cliente");

// ── ⚠️⚠️ 2 · O CLIENTE ⛔ NÃO AFIRMA DE QUEM É A SESSÃO ────────────────────
confere("⛔ o cliente ⛔ não envia `old_user_id` ⛔ nem lista de sessões",
  !/old_user_id|session_ids|sessionIds/.test(codigo),
  "⛔ UUID conhecido ⛔ não é prova de posse — a autoridade tem de ser o JWT anônimo, validado pelo servidor");

/**
 * ⚠️⚠️ A FIAÇÃO **CONSOME** AS REGRAS — ⛔ não as reescreve.
 *
 * ⚠️ As duas moram em `troca-de-sessao.ts`, onde são **executadas** por
 * `test:troca-de-sessao`. Reimplementá-las aqui criaria a segunda cópia, e a
 * cópia ⛔ não medida seria a que regride (I6).
 */
confere("⚠️ a fiação usa `ehProvaAnonima`, ⛔ e ⛔ não uma cópia da regra",
  /ehProvaAnonima\(/.test(codigo) && !/is_anonymous\s*===/.test(codigo),
  "mandar o access_token de uma conta **cadastrada** como prova anônima exporia a credencial e faria ⛔ todo login comum falhar o claim");

confere("⚠️ a fiação usa `desfechoDoClaim`, ⛔ e ⛔ não uma cópia da regra",
  /desfechoDoClaim\(/.test(codigo) && !/!r\.ok/.test(codigo) && !/error\s*===\s*["']conta_/.test(codigo),
  "⛔ ler a resposta é REGRA: enquanto morava junto do `fetch`, tratar um 500 como sucesso sobrevivia à mutação");

confere("⚠️⚠️ a fiação ⛔ NÃO decide sozinha quando trocar a sessão",
  /trocarDeSessao\(/.test(codigo),
  "a decisão precisa ficar no módulo sem imports, que é o único exercível contra falhas forçadas");

// ── ⚠️⚠️ 3 · `X-Anon-Token` É CREDENCIAL ──────────────────────────────────
const VAZAMENTOS = /(console\.\w+|analytics|track\(|captureException|Sentry|localStorage|sessionStorage|AsyncStorage)/;
confere("⛔ ⛔ o módulo ⛔ não registra ⛔ nem persiste ⛔ nada",
  !VAZAMENTOS.test(codigo),
  "quem tem o `X-Anon-Token` lê as sessões clínicas daquela identidade — ⛔ ele ⛔ não pode ir para log, analytics, tracing ⛔ ou storage");

/**
 * ⚠️ Mede a **superfície exportada**, e ⛔ não qualquer `return` do arquivo — a
 * primeira versão casava o `return` da função **privada**, cujo resultado ⛔ nunca
 * sai daqui. ⚠️ O que importa é o que o módulo **entrega para fora**.
 */
/**
 * ⚠️⚠️ A ASSINATURA É LIDA CONTANDO DELIMITADORES, e ⛔ não com `[^{]*`.
 *
 * ⛔ A primeira versão parava no `{` de `Promise<{ … }>` — ⛔ **antes** dos campos.
 * ⚠️ A mutação que acrescentava `anonToken?: string` ao retorno **sobreviveu**:
 * a trava lia `Promise<` e ⛔ não via o resto. ⚠️ Uma trava que mede metade da
 * assinatura promete o que ⛔ não cumpre.
 */
function assinaturaDe(fonte, inicio) {
  let i = fonte.indexOf("(", inicio), chaves = 0, angulos = 0, parens = 0;
  for (; i < fonte.length; i++) {
    const c = fonte[i];
    if (c === "(") parens++;
    else if (c === ")") parens--;
    else if (c === "<") angulos++;
    else if (c === ">") angulos--;
    else if (c === "{") {
      if (parens === 0 && angulos === 0) return fonte.slice(inicio, i);
      chaves++;
    } else if (c === "}") chaves--;
  }
  return fonte.slice(inicio);
}
const exportadas = [...codigo.matchAll(/export\s+(?:async\s+)?function/g)]
  .map((m) => assinaturaDe(codigo, m.index));
confere("há função exportada para medir", exportadas.length > 0,
  "sem superfície exportada a conferência abaixo passaria sobre o vazio");
confere("⛔ ⛔ ⛔ NENHUMA função exportada devolve token",
  exportadas.every((t) => !/token/i.test(t)),
  "devolver o token ⛔ o espalharia para o estado da tela, ⛔ fora do controle deste módulo");

// ── ⚠️⚠️ 4 · O `fetch` CRU FICA ENCAPSULADO ───────────────────────────────
confere("⚠️ `prepareExistingAccountSession` existe e ⛔ NÃO é exportada",
  /function prepareExistingAccountSession/.test(codigo) &&
    !/export\s+(async\s+)?function prepareExistingAccountSession/.test(codigo),
  "exportá-la convidaria cada tela a ter a sua versão do protocolo de autenticação");

const outros = [];
for (const dir of ["app", "components", "lib"]) {
  const raiz = path.join(appDir, dir);
  const pilha = fs.existsSync(raiz) ? [raiz] : [];
  while (pilha.length) {
    const atual = pilha.pop();
    for (const nome of fs.readdirSync(atual)) {
      const p = path.join(atual, nome);
      if (fs.statSync(p).isDirectory()) pilha.push(p);
      else if (/\.tsx?$/.test(nome) && p !== path.join(appDir, "lib", "sessao-anonima.ts")) outros.push(p);
    }
  }
}
confere("há telas e bibliotecas para varrer", outros.length > 20, "piso: varredura sobre o vazio ⛔ não mede");

const infratores = outros.filter((p) => /grant_type=password|X-Anon-Token/i.test(lerFonte(p)));
confere("⛔ ⛔ ⛔ NENHUM outro arquivo fala o protocolo cru de token",
  infratores.length === 0,
  `⛔ o protocolo mora num lugar só (I6) — encontrados: ${infratores.map((p) => path.relative(appDir, p)).join(", ")}`);

// ── ⚠️⚠️ 5 · AS TRÊS VALIDAÇÕES DO SERVIDOR ───────────────────────────────
//
// ⚠️⚠️ A regra central: *"só transferir quando o servidor provar
// **simultaneamente** que a identidade anônima é dona **e** que a conta
// autenticada é o destino"*. ⚠️ Uma prova só ⛔ não basta, e é isso que se mede.
const claim = lerFonte(
  path.join(appDir, "supabase", "functions", "claim-anonymous-sessions", "index.ts")
).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

confere("a Edge Function de claim existe e tem corpo", claim.length > 500, "piso R-1");

confere("⚠️⚠️ valida a conta de DESTINO por conta própria",
  /getUser\s*\(\s*bearer|getUser\s*\(\s*\w*[Tt]oken/.test(claim) && /Authorization/.test(claim),
  "sem isto qualquer um chama o endpoint sem conta ⛔ nenhuma");

confere("⚠️⚠️ valida a identidade ANÔNIMA de forma independente",
  /x-anon-token/i.test(claim) && (claim.match(/getUser\s*\(/g) || []).length >= 2,
  "⛔ uma prova só ⛔ não basta: sem validar a origem, o `old_uid` viria do cliente — e ⛔ UUID conhecido ⛔ não é posse");

confere("⚠️⚠️ exige que a origem seja MESMO anônima",
  /is_anonymous\s*!==\s*true|!==\s*true[\s\S]{0,40}is_anonymous/.test(claim),
  "⛔ sem isto, um token roubado de conta **cadastrada** drenaria as sessões dela para outra conta");

confere("⚠️⚠️ o servidor exige que a conta destino esteja ATIVA",
  /app_users[\s\S]{0,200}?status[\s\S]{0,200}?!==\s*["']ativo["']/.test(claim),
  "⛔ transferir para conta pendente move o trabalho para onde ⛔ ninguém lê — o mesmo sumiço que a regra do claim existe para evitar");

confere("⚠️⚠️ `pendente` e bloqueada recebem respostas DISTINTAS",
  /conta_pendente/.test(claim) && /conta_indisponivel/.test(claim),
  "dizer \"aguardando aprovação\" a quem foi BLOQUEADO manda esperar por algo que ⛔ não vai acontecer");

confere("⛔ a checagem de status falha FECHADA",
  /destinoPerfil\?\.status\s*!==\s*["']ativo["']/.test(claim),
  "⛔ sem linha em `app_users`, ⛔ ou com erro na consulta, o desfecho tem de ser recusa — ⛔ nunca transferência");

confere("⛔ ⛔ a recusa ⛔ não revela detalhe administrativo",
  !/role|bloqueado_por|motivo_do_bloqueio/.test(claim),
  "o cliente precisa saber que ⛔ não pode entrar — ⛔ não o histórico administrativo da conta");

confere("⚠️ a cláusula é a autoridade — ⛔ não uma lista do cliente",
  /\.eq\(\s*["']user_id["']\s*,\s*oldUid\s*\)/.test(claim) && !/session_ids|in\(/.test(claim),
  "aceitar uma lista de ids deixaria o cliente escolher o que migra");

confere("⛔ ⛔ a auditoria ⛔ não carrega conteúdo clínico ⛔ nem o token",
  !/notes|event_data|anonToken/.test(claim.slice(claim.indexOf("console.log"))),
  "auditoria é quem/para quem/quantas/quando — ⛔ e ⛔ nada de paciente");

// ── ⚠️⚠️ 6 · A MIGRATION DE POSSE ─────────────────────────────────────────
const migDir = path.join(appDir, "supabase", "migrations");
/**
 * ⚠️⚠️ SÃO **DUAS** MIGRATIONS, e a separação é o que torna o rollout possível:
 * `compatibilidade_identidade_anonima` é inerte para o app e habilita o login
 * anônimo; `fecha_leitura_publica_de_sessoes` fecha o P0 e ⛔ só pode rodar
 * depois de o cliente ter `auth.uid()`. ⛔ Juntas, ⛔ não havia ordem segura.
 */
const migCompat = fs.readdirSync(migDir).filter((f) => /compatibilidade_identidade_anonima/.test(f));
const migFecha = fs.readdirSync(migDir).filter((f) => /fecha_leitura_publica/.test(f));
confere("as duas migrations do rollout existem, separadas",
  migCompat.length === 1 && migFecha.length === 1,
  "⛔ uma migration só ⛔ não tem ordem de aplicação segura: fechar a RLS antes do cliente ter `auth.uid()` interrompe o app");

const sqlCompat = migCompat.length ? lerFonte(path.join(migDir, migCompat[0])) : "";
const sqlFecha = migFecha.length ? lerFonte(path.join(migDir, migFecha[0])) : "";

confere("⚠️⚠️ a migration de compatibilidade ⛔ NÃO mexe em política ⛔ nenhuma",
  !/create policy|drop policy/i.test(sqlCompat.replace(/^\s*--.*$/gm, "")),
  "se ela fechasse acesso, deixaria de ser aplicável antes de Anonymous Sign-In — e a fase 1 perderia a razão de existir");

confere("⚠️ o fechamento do P0 acontece em UMA transação",
  /^\s*begin;/im.test(sqlFecha) && /^\s*commit;/im.test(sqlFecha),
  "sem transação haveria um instante com as políticas antigas removidas e as novas ainda ⛔ não criadas");

// ── ⚠️⚠️ 6b · A COMPATIBILIDADE ⛔ NÃO FABRICA POSSE ───────────────────────
const compatCodigo = sqlCompat.replace(/^\s*--.*$/gm, "");

confere("⚠️⚠️ `user_id` continua NULLABLE",
  /add column if not exists user_id uuid\s*;/.test(compatCodigo) &&
    !/user_id[^;]*set not null|alter column user_id[^;]*not null/i.test(compatCodigo),
  "`not null` obrigaria a INVENTAR um valor para as linhas legadas — `NULL` é o registro honesto de \"⛔ não se sabe de quem é\"");

confere("⚠️⚠️ ⛔ ⛔ ⛔ NENHUM `update` na migration de compatibilidade",
  !/\bupdate\s+public\.clinical_sessions/i.test(compatCodigo),
  "atribuir dono a linha órfã seria PIOR que o vazamento: daria a sessão de um paciente a um dono inventado");

confere("⛔ ⛔ ⛔ nenhum `NULL` é convertido, herdado ⛔ ou adivinhado",
  !/coalesce\s*\([^)]*user_id|user_id\s*=\s*coalesce/i.test(compatCodigo),
  "⛔ fabricar ownership é ⛔ exatamente o que a regra proíbe");

confere("⚠️⚠️ a troca de FK tem PRECONDIÇÃO que aborta se houver linha inválida",
  /raise exception/i.test(compatCodigo) &&
    /not exists\s*\(\s*select 1 from auth\.users/i.test(compatCodigo),
  "raciocínio ⛔ não é medição — este banco JÁ tem desvio, e a suposição precisa falhar alto ANTES de alterar ⛔ qualquer coisa");

confere("⚠️ a precondição CONTA linhas, ⛔ e ⛔ não lê conteúdo clínico",
  !/notes|event_data/i.test(compatCodigo),
  "⛔ auditoria ⛔ não abre dado de paciente");

// ── ⚠️⚠️ 6c · O ROLLBACK FICA FORA DO CAMINHO DE DEPLOY ───────────────────
const revDir = path.join(appDir, "supabase", "reversoes");
const revs = fs.existsSync(revDir)
  ? fs.readdirSync(revDir).filter((f) => f.endsWith(".sql"))
  : [];

confere("há reversão preparada", revs.length >= 1,
  "reversão que ⛔ não existe ⛔ não é reversão — é intenção");

/**
 * ⚠️⚠️ MEDE **CONTEÚDO**, ⛔ e ⛔ não nome de arquivo.
 *
 * ⛔ A primeira versão procurava `/revers|rollback/` no nome — e ⛔ não pegou o
 * arquivo copiado como `20260830192000_reverte.sql`, porque "reverte" ⛔ não tem
 * o `s` de "revers". ⚠️ Mas o defeito ⛔ não era o regex: era medir o **rótulo**.
 * Quem copia um rollback para `migrations/` sob pressão ⛔ não o batiza de
 * "rollback" — e ⛔ nem precisa, porque o que faz estrago é o SQL.
 *
 * ⚠️ `HISTORICAS` são as migrations **já aplicadas** antes desta auditoria. Elas
 * contêm `using (true)` — é ⛔ exatamente o defeito que estamos fechando — e ⛔ não
 * podem ser alteradas (regra do autor). ⛔ Toda migration fora dessa lista está
 * proibida de reabrir o acesso público às tabelas clínicas.
 */
const HISTORICAS = new Set(["20260324103000_create_clinical_session_tables.sql"]);
const reabrem = fs.readdirSync(migDir).filter((f) => {
  if (HISTORICAS.has(f)) return false;
  const t = lerFonte(path.join(migDir, f)).replace(/^\s*--.*$/gm, "");
  return /create policy[\s\S]{0,400}?clinical_session[\s\S]{0,400}?using\s*\(\s*true\s*\)/i.test(t)
    || /clinical_session[\s\S]{0,200}?to\s+anon\b/i.test(t);
});
confere("⚠️⚠️ ⛔ ⛔ ⛔ NENHUMA migration nova reabre o acesso público às tabelas clínicas",
  reabrem.length === 0,
  `⛔ o CLI aplica TUDO que está em migrations/ — reabrir ali significa vazamento no próximo \`db push\`. Encontrado em: ${reabrem.join(", ")}`);

confere("⚠️⚠️ ⛔ ⛔ nenhum arquivo de reversão tem prefixo de timestamp",
  revs.every((f) => !/^\d{10,}_/.test(f)),
  "o CLI ⛔ só executa `<timestamp>_nome.sql` — sem o prefixo, copiar para migrations/ por engano ⛔ AINDA ⛔ não roda; é a segunda barreira, porque a primeira (\"estava no diretório certo\") falha sob pressão");

confere("⚠️ o README da reversão declara que ela REABRE a exposição",
  fs.existsSync(path.join(revDir, "README.md")) &&
    /reabre a exposição/i.test(lerFonte(path.join(revDir, "README.md"))),
  "rollback cujo custo ⛔ não está escrito vira escolha feita sem saber o preço");

confere("⚠️ a config do Supabase ⛔ não aponta para a pasta de reversões",
  !/reversoes/.test(lerFonte(path.join(appDir, "supabase", "config.toml"))),
  "bastaria uma linha de config para trazer o rollback de volta para o caminho automático");

confere("⚠️ existe reversão preparada para o fechamento",
  revs.length >= 1,
  "reversão que ⛔ não existe ⛔ não é reversão — é intenção, e a janela vira o tempo de escrever SQL sob pressão");

const sql = sqlCompat + "\n" + sqlFecha;
const sqlCodigo = sql.replace(/^\s*--.*$/gm, "");

confere("⚠️⚠️ ⛔ ⛔ ⛔ NENHUMA política nova concede acesso irrestrito",
  !/using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i.test(sqlCodigo),
  "`using (true)` foi **exatamente** o defeito original — ele expôs `notes` e `event_data` a quem tivesse a chave publicável");

confere("⛔ ⛔ o papel `anon` ⛔ não recebe política clínica ⛔ nenhuma",
  !/create policy[\s\S]*?to\s+[^;]*\banon\b/i.test(sqlCodigo),
  "quem ⛔ não tem sessão ⛔ nenhuma ⛔ não deve ler ⛔ nada — o usuário **anônimo** do Supabase é `authenticated`, e ⛔ não `anon`");

confere("⛔ ⛔ `user_id IS NULL` ⛔ NUNCA concede posse",
  !/user_id\s+is\s+null/i.test(sqlCodigo),
  "linha sem dono ⛔ não pode virar linha de todos — seria recriar o vazamento com outra escrita");

confere("⚠️⚠️ a chave estrangeira aponta para `auth.users`, ⛔ e ⛔ não `app_users`",
  /references\s+auth\.users\s*\(\s*id\s*\)/i.test(sqlCodigo) &&
    !/user_id\s*\)\s*references\s+public\.app_users/i.test(sqlCodigo),
  "`app_users_email_key` é UNIQUE: ⛔ todo anônimo tem e-mail vazio, então o **segundo** colidiria — a FK para `app_users` torna a identidade anônima impossível");

confere("⚠️⚠️ o trigger de cadastro ignora o usuário anônimo",
  /is_anonymous[\s\S]{0,80}return new/i.test(sqlCodigo),
  "sem a guarda, ⛔ toda emergência registrada sem login entraria na fila de aprovação do administrador — e o **segundo** anônimo derrubaria o login com erro de UNIQUE");

confere("⚠️ o dono na escrita é carimbado pelo servidor",
  /new\.user_id\s*:=\s*auth\.uid\(\)/i.test(sqlCodigo),
  "só `with check` ⛔ não impede **omitir** o `user_id` e criar uma sessão órfã — a categoria de linha que acabamos de fechar");

confere("⚠️ os eventos derivam a autorização da sessão pai",
  /clinical_session_events[\s\S]*?exists\s*\([\s\S]*?clinical_sessions/i.test(sqlCodigo),
  "um `user_id` próprio nos eventos seria um segundo dono capaz de divergir do primeiro (I6)");

if (falhas.length) {
  console.log(`\n❌ POSSE DE SESSÃO CLÍNICA — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ POSSE DE SESSÃO CLÍNICA — ${ok}/${ok} conferências\n`);
