/**
 * TRAVA DA CONTA DE TESTE — ⚠️ **validação autenticada**, ⛔ e ⛔ não porta dos
 * fundos.
 *
 * PROMETE: que ⛔ nenhuma credencial entre no repositório, que o `storageState`
 *   autenticado — ⛔ que carrega **token vivo** — more ⛔ fora da árvore
 *   sincronizada, que o projeto autenticado ⛔ só exista quando o ambiente o
 *   declara (⛔ e por isso `test:all` ⛔ não muda), que a falta de credencial
 *   ⛔ **⛔ falhe**, ⛔ e ⛔ nunca ⛔ pule verde, que a validação autenticada
 *   ⛔ recuse cair ⛔ no `dist` local, ⛔ e que os testes autenticados ⛔ não
 *   criem conta, ⛔ não escrevam sessão clínica ⛔ e ⛔ não digitem dado que
 *   possa ser de gente.
 *
 * NÃO PROMETE: que a conta ⛔ exista, que ⛔ ela esteja `ativo`, ⛔ nem que a
 *   senha esteja guardada num cofre — ⛔ isso é do dono da conta, ⛔ e ⛔ uma
 *   trava ⛔ não pode conferir ⛔ o que ⛔ não está no repositório. ⛔ E ⛔ não
 *   promete que a produção esteja ⛔ certa: ⛔ ela promete que ⛔ **⛔ se** a
 *   produção estiver errada, ⛔ a corrida autenticada ⛔ **⛔ falha** ⛔ em vez
 *   de medir a tela de login.
 *
 * UNIVERSO: `e2e/conta-de-teste.ts`, `e2e/conta-de-teste.setup.ts`,
 *   `e2e/autenticado/`, `playwright.config.ts`, `.gitignore`, ⛔ e a árvore
 *   rastreada pelo git.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ⛔ ELA GUARDA ───────────────────────────────────────────
 *
 * ⚠️ Pedido do autor, 2026-09-09: *"conta de teste dedicada para validação
 * autenticada em produção (…) ⛔ não usar credenciais pessoais ⛔ nem dados
 * clínicos reais."*
 *
 * ⛔ O risco ⛔ não é a suíte ficar vermelha. ⛔ É o contrário: ⛔ credencial
 * commitada ⛔ passa despercebida ⛔ porque ⛔ **⛔ nada quebra** — ⛔ o teste
 * fica ⛔ mais fácil de rodar, ⛔ e por isso ⛔ ninguém desfaz. ⛔ E ⛔ um projeto
 * autenticado que ⛔ « pula » ⛔ quando falta a conta ⛔ some ⛔ do relatório
 * ⛔ verde ⛔ sem ⛔ ninguém notar ⛔ que a validação ⛔ inteira ⛔ parou de rodar.
 */
const path = require("node:path");
const fs = require("node:fs");
const { execSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) {
    ok++;
    return;
  }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const bruto = (rel) => fs.readFileSync(path.join(appDir, rel), "utf8");

const MODULO = bruto("e2e/conta-de-teste.ts");
const SETUP = bruto("e2e/conta-de-teste.setup.ts");
const CONFIG = bruto("playwright.config.ts");
const GITIGNORE = fs.existsSync(path.join(appDir, ".gitignore")) ? bruto(".gitignore") : "";

const PASTA_AUTENTICADA = path.join(appDir, "e2e", "autenticado");
const SPECS_AUTENTICADOS = fs.existsSync(PASTA_AUTENTICADA)
  ? fs.readdirSync(PASTA_AUTENTICADA).filter((f) => f.endsWith(".spec.ts"))
  : [];

/* ══ ⚠️⚠️⚠️ 1 · ⛔ NENHUMA CREDENCIAL NO REPOSITÓRIO ═════════════════════ */

{
  /**
   * ⚠️⚠️ A varredura é sobre ⛔ **⛔ o que o git rastreia**, ⛔ e ⛔ não sobre
   * a pasta: ⛔ `.env.local` ⛔ pode ter a senha ⛔ — ⛔ é o lugar dela. ⛔ O que
   * ⛔ não pode ⛔ é ⛔ **⛔ entrar no commit**.
   */
  let rastreados = [];
  try {
    rastreados = execSync("git ls-files", { cwd: appDir, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    /* ⛔ sem git ⛔ a trava ⛔ não mente: ⛔ ela avisa ⛔ abaixo. */
  }

  confere(
    "⚠️ o repositório é legível pelo git (⛔ sem isto ⛔ a varredura ⛔ não vale)",
    rastreados.length > 0,
    "⛔ `git ls-files` não devolveu nada — ⛔ a conferência de credencial ⛔ ficaria cega"
  );

  /**
   * ⚠️ Um valor **atribuído** a essas variáveis. ⛔ A menção do nome é
   * ⛔ legítima ⛔ (documentação, código que lê `process.env`); ⛔ o que ⛔ não
   * é ⛔ é ⛔ um valor ⛔ do lado direito.
   */
  const ATRIBUICAO = /E2E_CONTA_TESTE_(EMAIL|SENHA)\s*[:=]\s*["'`]?[^\s"'`,;)}]+/;
  const comCredencial = rastreados.filter((rel) => {
    const abs = path.join(appDir, rel);
    if (!fs.existsSync(abs) || fs.statSync(abs).isDirectory()) return false;
    if (rel.endsWith(".png") || rel.endsWith(".pdf") || rel.endsWith(".mp3")) return false;
    let txt;
    try {
      txt = fs.readFileSync(abs, "utf8");
    } catch {
      return false;
    }
    const m = txt.match(ATRIBUICAO);
    if (!m) return false;
    /** ⛔ `E2E_CONTA_TESTE_EMAIL=x` num exemplo de shell ⛔ com placeholder ⛔ não é vazamento. */
    /**
     * ⚠️ ⛔ Reticências ⛔ e ⛔ variável de shell ⛔ **⛔ não são** credencial —
     * ⛔ e a documentação ⛔ precisa poder mostrar ⛔ a forma do comando. ⛔ O
     * que ⛔ **⛔ não** passa daqui ⛔ é ⛔ algo ⛔ que ⛔ alguém ⛔ poderia
     * ⛔ colar ⛔ e ⛔ usar.
     */
    return !/["'`]?(x|y|SEU_EMAIL|SUA_SENHA|…|\.\.\.|\$\{?\w+\}?|<[^>]+>)["'`]?$/.test(m[0].trim());
  });

  confere(
    "⚠️⚠️ ⛔ nenhuma credencial da conta de teste ⛔ está rastreada pelo git",
    comCredencial.length === 0,
    `⛔ ${comCredencial.join(", ")} — ⛔ credencial em arquivo commitado ⛔ vaza ⛔ para sempre, ⛔ inclusive ⛔ no histórico`
  );

  confere(
    "⚠️ a infraestrutura lê as credenciais ⛔ só do ambiente",
    /process\.env\.E2E_CONTA_TESTE_EMAIL/.test(MODULO) &&
      /process\.env\.E2E_CONTA_TESTE_SENHA/.test(MODULO) &&
      !/E2E_CONTA_TESTE_(EMAIL|SENHA)\s*=\s*["'][^"']+["']/.test(MODULO),
    "⛔ `e2e/conta-de-teste.ts` deveria ⛔ apenas ⛔ ler o ambiente"
  );

  confere(
    "⚠️ ⛔ os specs autenticados ⛔ não trazem credencial ⛔ dentro",
    SPECS_AUTENTICADOS.every(
      (f) => !/E2E_CONTA_TESTE|@gmail|@hotmail|@outlook|senha\s*[:=]\s*["']/.test(
        bruto(path.join("e2e", "autenticado", f))
      )
    ),
    "⛔ um spec autenticado ⛔ carrega credencial ⛔ ou e-mail literal"
  );
}

/* ══ ⚠️⚠️⚠️ 2 · O ESTADO GRAVADO MORA FORA DA ÁRVORE ════════════════════ */

{
  const m = MODULO.match(/CAMINHO_DO_ESTADO_AUTENTICADO\s*=\s*\n?\s*["']([^"']+)["']/);
  const caminho = m ? m[1] : null;

  confere(
    "⚠️ o caminho do `storageState` está declarado ⛔ em ⛔ um lugar só",
    Boolean(caminho),
    "⛔ `CAMINHO_DO_ESTADO_AUTENTICADO` não encontrado — ⛔ caminho repetido ⛔ é como nasce ⛔ o terceiro"
  );

  confere(
    "⚠️⚠️ o estado autenticado ⛔ é gravado ⛔ **fora** da árvore do repositório",
    Boolean(caminho) && !path.resolve(caminho).startsWith(path.resolve(appDir) + path.sep),
    `⛔ ${caminho} ⛔ está dentro do repositório — ⛔ ele contém ⛔ access token ⛔ e refresh token ⛔ vivos, ⛔ e a árvore ⛔ ainda é sincronizada ⛔ pelo iCloud`
  );

  confere(
    "⚠️ o `.gitignore` cobre ⛔ um estado de autenticação ⛔ que escape ⛔ para dentro",
    GITIGNORE.split("\n")
      .map((l) => l.trim())
      /** ⚠️ ⛔ Comentário ⛔ não ignora arquivo: ⛔ a primeira versão desta
       *  conferência casou ⛔ com a **própria explicação** ⛔ que eu escrevi
       *  acima da regra — ⛔ e ⛔ passou verde ⛔ com o `.gitignore` ⛔ vazio. */
      .filter((l) => l && !l.startsWith("#"))
      .some((l) => /conta-de-teste\.json|\*\.storagestate|auth\.json|\.auth\//i.test(l)),
    "⛔ `.gitignore` ⛔ não tem rede de segurança ⛔ para um estado gravado ⛔ por engano ⛔ na árvore"
  );

  confere(
    "⚠️ a config lê a constante, ⛔ e ⛔ não redigita o caminho",
    /CAMINHO_DO_ESTADO_AUTENTICADO/.test(CONFIG) &&
      !/storageState:\s*["'][^"']*\.json["']/.test(CONFIG),
    "⛔ caminho redigitado ⛔ na config ⛔ sai de sincronia ⛔ com o setup ⛔ sem ninguém ver"
  );
}

/* ══ ⚠️⚠️⚠️ 3 · O PROJETO AUTENTICADO É CONDICIONAL ═════════════════════ */

{
  confere(
    "⚠️⚠️ o projeto autenticado ⛔ só nasce ⛔ com credencial ⛔ no ambiente",
    /contaDeTesteConfigurada\(\)\s*\n?\s*\?/.test(CONFIG),
    "⛔ sem a condição, ⛔ `test:all` ⛔ passaria a exigir ⛔ uma conta — ⛔ e ⛔ quebraria ⛔ para quem ⛔ só quer rodar a suíte"
  );

  confere(
    "⚠️ a suíte do `dist` ⛔ ignora ⛔ o mundo autenticado",
    /testIgnore:\s*\[[^\]]*autenticado/.test(CONFIG) &&
      /testIgnore:\s*\[[^\]]*conta-de-teste\.setup/.test(CONFIG),
    "⛔ o projeto `dist` ⛔ tentaria rodar ⛔ o login ⛔ contra ⛔ o dist ⛔ sem Supabase"
  );

  confere(
    "⚠️ o mundo autenticado ⛔ depende do setup, ⛔ e ⛔ não torce ⛔ para ele ter rodado",
    /dependencies:\s*\[\s*["']autenticacao["']\s*\]/.test(CONFIG),
    "⛔ sem `dependencies`, ⛔ os specs ⛔ rodariam ⛔ com estado ⛔ velho ⛔ ou ⛔ inexistente"
  );

  /**
   * ⚠️⚠️ ⛔ **⛔ PULAR ⛔ NÃO ⛔ É ⛔ PASSAR.** ⛔ Um `test.skip` condicional
   * ⛔ deixaria o relatório verde ⛔ com ⛔ zero validação ⛔ autenticada.
   */
  confere(
    "⚠️⚠️ ⛔ nenhum spec autenticado ⛔ se ⛔ auto-pula",
    SPECS_AUTENTICADOS.every(
      (f) => !/test\.skip\(|test\.fixme\(/.test(bruto(path.join("e2e", "autenticado", f)))
    ) && !/test\.skip\(|test\.fixme\(/.test(SETUP),
    "⛔ pulo condicional ⛔ transforma ⛔ « não rodou » ⛔ em ⛔ « passou »"
  );
}

/* ══ ⚠️⚠️⚠️ 4 · A FALTA FALHA, ⛔ E FALA ════════════════════════════════ */

{
  confere(
    "⚠️ credencial ausente ⛔ levanta erro ⛔ que diz ⛔ o que fazer",
    /throw new Error\(/.test(MODULO) && /status='ativo'/.test(MODULO),
    "⛔ um `?? \"\"` ⛔ faria o login ⛔ falhar como ⛔ « senha inválida » — ⛔ mentira ⛔ sobre a causa"
  );

  confere(
    "⚠️⚠️ a validação autenticada ⛔ recusa cair ⛔ no `dist` local",
    /E2E_BASE_URL/.test(MODULO) && /baseUrlAutenticada/.test(MODULO) &&
      /throw new Error\([\s\S]{0,400}E2E_BASE_URL/.test(MODULO),
    "⛔ sem URL declarada, ⛔ a corrida ⛔ mediria ⛔ `localhost:4173` — ⛔ exatamente ⛔ o artefato ⛔ que ⛔ esta infraestrutura ⛔ existe ⛔ para ⛔ **⛔ não** ⛔ usar"
  );

  confere(
    "⚠️⚠️ o setup ⛔ lê o erro da tela ⛔ antes de estourar ⛔ por timeout",
    /entrada-erro/.test(SETUP) && /Promise\.race/.test(SETUP),
    "⛔ conta `pendente` ⛔ — ⛔ o estado ⛔ em que ⛔ toda conta nasce ⛔ — ⛔ falharia ⛔ como ⛔ « timeout », ⛔ escondendo ⛔ a mensagem ⛔ que ⛔ diz ⛔ o que fazer"
  );

  confere(
    "⚠️⚠️ o setup ⛔ prova a **rota clínica**, ⛔ e ⛔ não ⛔ a URL",
    /modulos\/avc/.test(SETUP) && /avc-superficie-paciente-conteudo/.test(SETUP),
    "⛔ `waitForURL` ⛔ sozinho ⛔ aceitaria ⛔ um redirecionamento ⛔ de volta ⛔ para ⛔ a porta"
  );
}

/* ══ ⚠️⚠️⚠️ 5 · ⛔ NEM CONTA, ⛔ NEM CASO, ⛔ NEM GENTE ══════════════════ */

{
  const corpos = SPECS_AUTENTICADOS.map((f) => bruto(path.join("e2e", "autenticado", f))).join("\n");

  confere(
    "⚠️ ⛔ os testes autenticados ⛔ não criam conta",
    !/signUpAppUser|Criar conta|entrada-enviar/.test(corpos),
    "⛔ criar conta ⛔ na produção ⛔ enche o painel de admin ⛔ de lixo, ⛔ e ⛔ é gesto ⛔ do dono ⛔ da conta"
  );

  /**
   * ⚠️⚠️ ⛔ O AVC ⛔ **⛔ não** ⛔ abre sessão clínica no banco:
   * `lib/open-clinical-module.ts` ⛔ só o faz ⛔ para `pcr-adulto`. ⛔ Quem
   * entrasse ⛔ pelo card do hub ⛔ de ⛔ **⛔ outro** módulo ⛔ escreveria linha
   * ⛔ em `clinical_sessions` ⛔ com a conta de teste.
   */
  confere(
    "⚠️⚠️ ⛔ os testes autenticados ⛔ entram por URL, ⛔ e ⛔ não pelo card do hub",
    !/card-de-modulo|module-hub|getByTestId\(["']modulo-card/.test(corpos),
    "⛔ entrar pelo card ⛔ chama `openClinicalModule` ⛔ — ⛔ e ⛔ para módulos ⛔ com sessão ⛔ isso ⛔ **⛔ escreve no banco**"
  );

  confere(
    "⚠️ ⛔ os dados digitados ⛔ estão declarados ⛔ como sintéticos",
    /DADOS_SINTETICOS/.test(corpos),
    "⛔ valor solto ⛔ no meio do spec ⛔ é ⛔ como ⛔ um dado de gente ⛔ entra ⛔ sem ⛔ ninguém decidir"
  );

  confere(
    "⚠️ o módulo AVC ⛔ continua ⛔ sem campo ⛔ de identificação ⛔ de paciente",
    !/nome_do_paciente|prontuario|cpf|data_de_nascimento/i.test(
      fs.readdirSync(path.join(appDir, "avc", "conteudo"))
        .filter((f) => f.endsWith(".ts"))
        .map((f) => lerFonte(path.join(appDir, "avc", "conteudo", f)))
        .join("\n")
    ),
    "⛔ ⛔ se um campo ⛔ de identificação ⛔ nascer, ⛔ a validação autenticada ⛔ passa ⛔ a poder ⛔ carregar ⛔ dado ⛔ de gente ⛔ — ⛔ e ⛔ esta ⛔ trava ⛔ tem ⛔ que ⛔ ser ⛔ revista ⛔ antes"
  );
}

if (falhas > 0) {
  console.log(`\n❌ CONTA DE TESTE — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ CONTA DE TESTE — ${ok}/${ok} conferências · segredo fora do repo · projeto condicional · sem dado de gente\n`);
