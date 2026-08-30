/**
 * PROMETE: que ⛔ nenhum mecanismo de degradação recrie acesso público; que o modo
 *   desligado ⛔ não consulte sessões ⛔ nem finja que elas ⛔ não existem; e que
 *   ⛔ nenhum caminho de rollback toque `notes`, `event_data` ou posse.
 * NÃO PROMETE: que os SQLs tenham sido aplicados — ⛔ nenhum foi.
 * UNIVERSO: `supabase/reversoes/**`, o interruptor e a porta única do histórico.
 *
 * ── ⚠️⚠️ O PRINCÍPIO QUE ISTO DEFENDE ─────────────────────────────────────
 *
 *   ⚠️⚠️ **Disponibilidade pode degradar. Confidencialidade, ⛔ não.**
 *
 * ⚠️ Sob pressão, o reflexo é *"reabre o acesso enquanto a gente investiga"*.
 * ⛔ Esta trava existe para que esse reflexo ⛔ não tenha para onde ir: ⛔ nenhum dos
 * caminhos **fáceis** reabre ⛔ nada, e o único que reabre está atrás de fricção.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

// ── ⚠️⚠️ 1 · O INTERRUPTOR, EXECUTADO ─────────────────────────────────────
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-degrada-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "lib", "historico-disponivel.ts"),
], { cwd: appDir, stdio: "pipe" });
const H = require(path.join(tempDir, "historico-disponivel.js"));

delete process.env.EXPO_PUBLIC_HISTORICO;
confere("⚠️⚠️ ⛔ sem configuração, o histórico fica DISPONÍVEL",
  H.historicoDisponivel() === true,
  "⛔ um interruptor que falha para 'desligado' apagaria o histórico de todo mundo em ⛔ qualquer erro de config");

process.env.EXPO_PUBLIC_HISTORICO = "off";
confere("`off` desliga", H.historicoDisponivel() === false, "sem isto ⛔ não há Degrau 2");
process.env.EXPO_PUBLIC_HISTORICO = "OFF";
confere("⚠️ o valor ⛔ não depende de caixa", H.historicoDisponivel() === false,
  "sob pressão ⛔ ninguém confere maiúscula — `OFF` tem de funcionar");
process.env.EXPO_PUBLIC_HISTORICO = "on";
confere("`on` liga de volta", H.historicoDisponivel() === true, "⛔ o modo ⛔ não pode ser de mão única");
delete process.env.EXPO_PUBLIC_HISTORICO;

// ── ⚠️⚠️ 2 · A PORTA ÚNICA ⛔ NÃO CONSULTA QUANDO DESLIGADA ────────────────
const porta = lerFonte(path.join(appDir, "lib", "clinical-session-history.ts"));
const portaCodigo = porta.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

confere("a porta do histórico existe e tem corpo", portaCodigo.length > 300, "piso R-1");

for (const fn of ["loadClinicalSessions", "loadClinicalSessionById"]) {
  const i = portaCodigo.indexOf(fn);
  const corpo = portaCodigo.slice(i, portaCodigo.indexOf("\n}", i));
  const guarda = corpo.indexOf("historicoDisponivel");
  const consulta = corpo.indexOf(".from(");
  confere(`⚠️⚠️ ${fn}: a guarda vem ANTES de qualquer consulta`,
    guarda >= 0 && (consulta < 0 || guarda < consulta),
    "consultar e só depois descartar deixaria o cliente batendo numa RLS quebrada — e o log encheria de erro sem motivo");
  confere(`⚠️ ${fn}: o modo desligado devolve \`indisponivel\``,
    /indisponivel:\s*true/.test(corpo),
    "⛔ devolver lista vazia afirmaria 'você ⛔ não tem sessões' — falso sobre o trabalho do médico (E-52/E-37)");
}

confere("⚠️⚠️ ⛔ ⛔ o modo desligado ⛔ NUNCA cai para leitura global",
  !/historicoDisponivel[\s\S]{0,300}?(select\("?\*|\.limit\(|order\()/i.test(portaCodigo),
  "esconder erro de posse lendo tudo trocaria defeito visível por vazamento silencioso");

// ── ⚠️⚠️ 3 · AS TELAS **NOMEIAM** O ESTADO ────────────────────────────────
for (const rel of ["components/clinical-session-history.tsx", "app/session-history/[sessionId].tsx"]) {
  const t = lerFonte(path.join(appDir, rel));
  confere(`⚠️ ${path.basename(rel)}: consome \`indisponivel\``,
    /indisponivel/.test(t), "sem consumir, a tela cairia no caminho de vazio ⛔ ou de erro");
  confere(`⚠️⚠️ ${path.basename(rel)}: declara indisponibilidade TEMPORÁRIA`,
    /temporariamente indispon/i.test(t) && /nada foi apagado/i.test(t),
    "⛔ o médico precisa saber que o trabalho dele está preservado — silêncio aqui parece perda de dado");
}

// ── ⚠️⚠️ 4 · ⛔ NENHUMA DEGRADAÇÃO SEGURA REABRE ⛔ NADA ───────────────────
const revDir = path.join(appDir, "supabase", "reversoes");
const seguros = fs.readdirSync(revDir).filter((f) => f.endsWith(".sql"));
confere("há pelo menos um caminho de degradação segura preparado", seguros.length >= 1,
  "⛔ enquanto ⛔ só o caminho perigoso existir, ele é o único executável sob pressão");

for (const f of seguros) {
  const t = lerFonte(path.join(revDir, f)).replace(/^\s*--.*$/gm, "");
  confere(`⚠️⚠️ ⛔ ${f}: ⛔ ⛔ NENHUM \`using (true)\`/\`with check (true)\``,
    !/using\s*\(\s*true\s*\)|with check\s*\(\s*true\s*\)/i.test(t),
    "⛔ um caminho 'seguro' que reabre acesso ⛔ não é degradação — é o incidente com outro nome");
  confere(`⛔ ${f}: ⛔ não concede ⛔ nada ao papel \`anon\``,
    !/to\s+[^;]*\banon\b/i.test(t),
    "quem ⛔ não tem sessão ⛔ nenhuma ⛔ não deve ler ⛔ nada, ⛔ nem em modo degradado");
  confere(`⚠️⚠️ ⛔ ${f}: ⛔ ⛔ ⛔ ⛔ NÃO toca dado clínico ⛔ nem posse`,
    !/\b(update|delete|insert)\b/i.test(t) && !/notes|event_data|user_id\s*=/i.test(t),
    "⛔ rollback que altera dado ⛔ não é rollback — é um segundo incidente por cima do primeiro");
  confere(`⚠️ ${f}: roda em UMA transação`,
    /^\s*begin;/im.test(t) && /^\s*commit;/im.test(t),
    "sem transação haveria um instante sem policy ⛔ nenhuma, e a tabela negaria tudo ⛔ sem declarar");
}

// ── ⚠️⚠️ 5 · O CAMINHO PERIGOSO TEM FRICÇÃO ───────────────────────────────
const ultimo = path.join(revDir, "ULTIMO-RECURSO");
confere("⚠️⚠️ o arquivo que reabre exposição ⛔ NÃO está junto dos caminhos seguros",
  fs.existsSync(ultimo) && !seguros.some((f) => /reabre|reversao/i.test(f)),
  "⛔ o caminho mais perigoso ⛔ não pode ser o mais fácil de alcançar — sob pressão, alcance é o que decide");

confere("⚠️ o último recurso vem com aviso lido ANTES do arquivo",
  fs.existsSync(path.join(ultimo, "LEIA-ANTES.md")) &&
    /recria o incidente|reabrir a exposição/i.test(lerFonte(path.join(ultimo, "LEIA-ANTES.md"))),
  "⛔ decisão cara tomada sem o preço na frente ⛔ não é decisão");

confere("⚠️⚠️ o aviso enumera os degraus seguros a tentar antes",
  /DEGRADAR-historico-fechado/.test(lerFonte(path.join(ultimo, "LEIA-ANTES.md"))) &&
    /EXPO_PUBLIC_HISTORICO/.test(lerFonte(path.join(ultimo, "LEIA-ANTES.md"))),
  "⛔ dizer 'último recurso' ⛔ sem dizer quais são os anteriores ⛔ não cria fricção ⛔ nenhuma");

confere("⚠️ o princípio está escrito onde a decisão é tomada",
  /Disponibilidade pode degradar/i.test(lerFonte(path.join(ultimo, "LEIA-ANTES.md"))),
  "o princípio serve para decidir sob pressão — ele precisa estar NO ponto de decisão, ⛔ não ⛔ só no runbook");

// ── ⚠️⚠️ 6 · OS STUBS 503 — o degrau do meio das Edge Functions ───────────
//
// ⚠️ Sem eles, a escada de uma Edge Function tinha ⛔ só dois degraus: corrigir
// para frente, ⛔ ou voltar a versão **vulnerável**. ⛔ Sob pressão, a escolha real
// era reabrir o risco.
const stubDir = path.join(appDir, "supabase", "functions-disabled");
const stubs = fs.existsSync(stubDir)
  ? fs.readdirSync(stubDir).filter((f) => fs.existsSync(path.join(stubDir, f, "index.ts")))
  : [];

confere("há stubs de degradação preparados", stubs.length >= 2,
  "⛔ sem stub, 'desabilitar temporariamente' é intenção, ⛔ e ⛔ não um arquivo que dá para implantar");

for (const nome of stubs) {
  const t = lerFonte(path.join(stubDir, nome, "index.ts"));
  const c = t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

  confere(`⚠️⚠️ ${nome}: responde SEMPRE 503`,
    /status:\s*503/.test(c) && !/status:\s*(200|201|401|403|500)\b/.test(c),
    "⛔ um stub que às vezes responde outra coisa ⛔ não é degradação previsível");

  confere(`⚠️⚠️ ⛔ ${nome}: ⛔ ⛔ ⛔ NENHUMA credencial de privilégio`,
    !/SERVICE_ROLE_KEY|OPENAI_API_KEY|SUPABASE_ANON_KEY|apikey/i.test(c),
    "⛔ o stub existe para NÃO ter privilégio — se ele lê a chave, ⛔ não é degradação, é a função com outra resposta");

  confere(`⛔ ${nome}: ⛔ não fala com Supabase`,
    !/createClient|supabase-js|SUPABASE_URL|\.from\(/i.test(c),
    "⛔ nenhum acesso a banco: ⛔ não há consulta que possa vazar ⛔ nem escrita que possa corromper");

  confere(`⛔ ${nome}: ⛔ ⛔ não faz \`fetch\` para lugar ⛔ nenhum`,
    !/\bfetch\s*\(/.test(c),
    "⛔ chamada externa num stub reabriria custo ⛔ ou vazamento pelo caminho que ele deveria fechar");

  confere(`⛔ ${nome}: ⛔ não importa o código real`,
    !/from\s+["']\.\.?\//.test(c) && !/functions\//.test(c),
    "⛔ o stub ⛔ não pode 'quase' rodar a função — importar traria de volta o que ele existe para desligar");

  confere(`⛔ ${nome}: ⛔ ⛔ ⛔ NÃO registra ⛔ nada`,
    !/console\.\w+/.test(c),
    "⛔ log num stub de emergência é a chance de imprimir cabeçalho ⛔ ou credencial ⛔ sem ⛔ ninguém revisar");

  confere(`⛔ ${nome}: ⛔ nem lê o corpo da requisição`,
    !/req\.json\(\)|req\.text\(\)|await req\./.test(c),
    "⛔ não há o que dar errado num stub que ⛔ não lê entrada ⛔ nenhuma");
}

confere("⚠️⚠️ ⛔ os stubs ⛔ NÃO estão no diretório normal de deploy",
  !fs.existsSync(path.join(appDir, "supabase", "functions", "functions-disabled")) &&
    stubs.every((n) => {
      const real = path.join(appDir, "supabase", "functions", n, "index.ts");
      return !fs.existsSync(real) || lerFonte(real).indexOf("503") !== lerFonte(real).length;
    }),
  "⛔ um stub em `functions/` iria junto no próximo `functions deploy` e derrubaria função saudável");

for (const nome of stubs) {
  const real = path.join(appDir, "supabase", "functions", nome, "index.ts");
  confere(`⚠️⚠️ ${nome}: o ORIGINAL segue versionado — o stub é restaurável`,
    fs.existsSync(real) && !/status:\s*503/.test(lerFonte(real)),
    "⛔ implantar stub sobre função cuja fonte ⛔ não existe APAGA a única cópia — a fonte precisa vir antes do stub");
}

const readmeStub = lerFonte(path.join(stubDir, "README.md"));
confere("⚠️ o README declara a precondição de fonte restaurável",
  /⛔ não consegue restaurar|recuperar a fonte primeiro/i.test(readmeStub),
  "⛔ a armadilha aqui ⛔ não é o stub — é implantá-lo sobre algo que ⛔ não volta");

confere("⚠️ o README proíbe cópia automática e a versão vulnerável",
  /⛔ NÃO automatizar|não automatizar/i.test(readmeStub) && /reabre o risco/i.test(readmeStub),
  "sem isso, o stub vira um script de conveniência — e conveniência é como o degrau errado é escolhido");

if (falhas.length) {
  console.log(`\n❌ DEGRADAÇÃO SEGURA — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ DEGRADAÇÃO SEGURA — ${ok}/${ok} conferências · ${seguros.length} caminho(s) seguro(s)\n`);
