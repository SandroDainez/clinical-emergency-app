/**
 * PROMETE: que ⛔ nenhuma rota clínica seja alcançável sem conta **ativa**, que
 *   ⛔ nenhum conteúdo clínico apareça em estado desconhecido, e que a lista de
 *   rotas públicas seja de **permissão**, com comparação exata.
 * NÃO PROMETE: que o banco negue — isso é `valida-fechamento-clinico`. Cliente
 *   ⛔ nunca é prova; esta é a **primeira** camada, ⛔ não a única.
 * UNIVERSO: `lib/guarda-de-acesso.ts` executado + a fiação da raiz, com piso.
 *
 * ── ⚠️⚠️ O DEFEITO QUE ESTA PROVA NASCEU PARA MATAR ───────────────────────
 *
 * A aprovação administrativa vivia em **um `if`** na tela de login. Mas o build
 * web publica **uma URL por módulo** — `/modulos/avc`, `/session-history` —, e
 * digitar o endereço pulava a tela inteira. ⚠️ A aprovação existia na
 * **navegação**, ⛔ e ⛔ não na segurança.
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

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-guarda-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "lib", "guarda-de-acesso.ts"),
], { cwd: appDir, stdio: "pipe" });
const G = require(path.join(tempDir, "guarda-de-acesso.js"));

// ── ⚠️⚠️ 1 · O DESTINO EM CADA ESTADO ─────────────────────────────────────
const COM = (e) => ({ backendDisponivel: true, ...e });
const casos = [
  ["carregando", COM({ carregando: true, autenticado: false }), "carregando"],
  ["carregando mesmo já autenticado", COM({ carregando: true, autenticado: true, status: "ativo" }), "carregando"],
  ["sem sessão", COM({ carregando: false, autenticado: false }), "login"],
  ["ativo", COM({ carregando: false, autenticado: true, status: "ativo" }), "liberado"],
  ["pendente", COM({ carregando: false, autenticado: true, status: "pendente" }), "aguardando_aprovacao"],
  ["bloqueado", COM({ carregando: false, autenticado: true, status: "bloqueado" }), "conta_indisponivel"],
  ["autenticado SEM perfil", COM({ carregando: false, autenticado: true }), "conta_indisponivel"],
];
for (const [nome, estado, esperado] of casos) {
  confere(`⚠️ ${nome} ⇒ ${esperado}`, G.destinoDaGuarda(estado) === esperado,
    `devolveu ${G.destinoDaGuarda(estado)} — cada estado precisa de um destino próprio`);
}

confere("⚠️⚠️ ⛔ estado desconhecido ⛔ NUNCA vira `liberado`",
  casos.filter(([, e]) => e.carregando).every(([, e]) => G.destinoDaGuarda(e) !== "liberado"),
  "⛔ um quadro de tela clínica antes da decisão É vazamento — é onde o conteúdo pisca no reload por URL");

confere("⚠️ `status` ausente ⛔ ou inesperado falha FECHADO",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, status: "inventado" })) === "conta_indisponivel",
  "⛔ estado ⛔ não previsto virando acesso é como toda regressão de autorização começa");

// ── ⚠️⚠️ 1b · OS DOIS MUNDOS ──────────────────────────────────────────────
//
// ⚠️ "Sem backend" ⛔ NÃO é "autorizado". São destinos **diferentes**, e é isso
// que impede configuração ausente de virar permissão genérica.
const SEM = (e) => ({ backendDisponivel: false, ...e });
confere("⚠️⚠️ ⛔ sem backend ⇒ `modo_local`, ⛔ e ⛔ NÃO `liberado`",
  G.destinoDaGuarda(SEM({ carregando: false, autenticado: false })) === "modo_local",
  "⛔ se devolvesse `liberado`, 'sem configuração' e 'autorizado' virariam o mesmo estado — indistinguíveis depois");

confere("⚠️ e o modo local ⛔ não depende de sessão ⛔ nem de status",
  ["ativo", "pendente", "bloqueado", undefined].every(
    (st) => G.destinoDaGuarda(SEM({ carregando: false, autenticado: !!st, status: st })) === "modo_local"
  ),
  "⛔ sem backend ⛔ não há conta ⛔ nem sessão — perguntar por status ali seria fingir que existe");

confere("⚠️⚠️ ⛔ ⛔ COM backend, a exigência de sessão é OBRIGATÓRIA",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: false })) === "login" &&
    G.destinoDaGuarda(COM({ carregando: false, autenticado: true, status: "pendente" })) !== "liberado",
  "⛔ backend presente ⛔ e ⛔ sem sessão ⛔ não pode abrir — é o buraco que a guarda existe para fechar");

// ── ⚠️⚠️ 2 · A LISTA É DE PERMISSÃO, E EXATA ──────────────────────────────
const PUBLICAS = [[], ["privacidade"], ["+not-found"]];
for (const s of PUBLICAS) {
  confere(`⚠️ pública: /${s.join("/") || "(login)"}`, G.ehRotaPublica(s) === true,
    "fechar o login trancaria todo mundo para fora");
}
const FECHADAS = [
  ["modulos", "[id]"], ["session-history"], ["session-history", "[sessionId]"],
  ["(tabs)"], ["(tabs)", "index"], ["admin-users"], ["paywall"], ["modal"], ["dev", "ui-v2"],
];
for (const s of FECHADAS) {
  confere(`⚠️⚠️ ⛔ FECHADA: /${s.join("/")}`, G.ehRotaPublica(s) === false,
    "⛔ é ⛔ exatamente por URL direta que a aprovação era pulada");
}

confere("⚠️⚠️ ⛔ ⛔ comparação EXATA — ⛔ nunca prefixo",
  ["privacidade-interna", "privacidadeX", "privacidad", "+not-found-x"]
    .every((r) => G.ehRotaPublica([r]) === false),
  "`startsWith` abriria rota pública implícita — ⛔ o defeito que uma lista de permissão existe para evitar");

confere("⛔ rota nova nasce FECHADA",
  G.ehRotaPublica(["superficie-f"]) === false && G.ehRotaPublica(["qualquer-coisa"]) === false,
  "lista de bloqueio esquece a rota de amanhã, e o esquecimento ⛔ não faz barulho");

// ── ⚠️⚠️ 3 · A FIAÇÃO DA RAIZ ─────────────────────────────────────────────
const raiz = lerFonte(path.join(appDir, "app", "_layout.tsx"));
confere("o layout raiz existe e tem corpo", raiz.length > 1000, "piso R-1");

confere("⚠️⚠️ a guarda está na RAIZ, ⛔ e ⛔ não só em (tabs)",
  /destinoDaGuarda|useAcessoClinico/.test(raiz),
  "⛔ `modulos/[id]` e `session-history` estão FORA de (tabs) — guardar as abas deixaria todo módulo clínico aberto");

const iStack = raiz.indexOf("<Stack>");
const iGuarda = raiz.indexOf("destino === 'carregando'");
confere("⚠️⚠️ ⛔ o `Stack` ⛔ NÃO é renderizado antes da decisão",
  iGuarda >= 0 && iStack >= 0 && iGuarda < iStack,
  "redirecionar em efeito ⛔ não basta: a tela desenha por um quadro antes de sair");

confere("⚠️ os três desfechos de recusa têm tela própria",
  /aguardando_aprovacao/.test(raiz) && /conta_indisponivel/.test(raiz) && /Redirect/.test(raiz),
  "⛔ mandar quem foi bloqueado esperar aprovação é falso; e sem login ⛔ não há o que aguardar");

confere("⛔ ⛔ a guarda ⛔ não usa `getAuthRole` do storage local",
  !/getAuthRole/.test(raiz),
  "⛔ papel guardado no `localStorage` é editável pelo próprio visitante — ⛔ não é autorização");

// ── ⚠️ 4 · A MIGRATION DE FECHAMENTO ⛔ NÃO está elegível ainda ────────────
const migDir = path.join(appDir, "supabase", "migrations");
confere("⚠️⚠️ ⛔ o fechamento ⛔ NÃO está na sequência executável",
  !fs.readdirSync(migDir).some((f) => /fecha_/.test(f)),
  "⛔ aplicar a RLS antes da guarda publicada deixaria o cliente pedindo dados que o banco nega, ⛔ sem tela para explicar");

// ── ⚠️⚠️ 5 · A CAPACIDADE MORA NUM LUGAR SÓ, ⛔ E ⛔ NÃO HÁ BYPASS ─────────
const cap = lerFonte(path.join(appDir, "lib", "backend-clinico.ts"));
confere("a capacidade existe e tem corpo", cap.length > 200, "piso R-1");
confere("⚠️ ela responde `supabase !== null`, ⛔ e ⛔ nada mais",
  /return supabase !== null;/.test(cap),
  "⛔ qualquer condição extra aqui vira um segundo caminho para abrir a guarda");

const fonteGuarda = lerFonte(path.join(appDir, "lib", "guarda-de-acesso.ts"));
for (const [alvo, texto] of [[fonteGuarda, "guarda-de-acesso"], [raiz, "_layout"]]) {
  confere(`⚠️⚠️ ⛔ ${texto}: ⛔ ⛔ NENHUM bypass por ambiente, teste ⛔ ou rota`,
    !/NODE_ENV|__DEV__|playwright|E2E|localhost|process\.env\.CI/i.test(alvo),
    "⛔ bypass escondido é a porta que ⛔ ninguém revisa — e a que sobrevive a toda auditoria");
}

/**
 * ⚠️⚠️ **NENHUMA** porta do histórico pode passar por fora da capacidade.
 *
 * ⛔ A primeira versão se satisfazia com uma ocorrência — e a mutação que
 * revertia **uma** das duas funções **sobreviveu**, porque a outra ainda casava.
 * ⚠️ Duas portas, duas provas.
 */
const hist = lerFonte(path.join(appDir, "lib", "clinical-session-history.ts"));
confere("⚠️⚠️ ⛔ ⛔ nenhuma porta do histórico ignora a capacidade",
  !/if \(!supabase\)/.test(hist),
  "⛔ um `if (!supabase)` cru é ⛔ exatamente o ramo que transforma configuração ausente em comportamento silencioso");
confere("⚠️⚠️ as DUAS portas declaram indisponibilidade em modo local",
  (hist.match(/backendClinicoDisponivel\(\)/g) || []).length >= 2 &&
    (hist.match(/indisponivel: true/g) || []).length >= 2,
  "⛔ devolver lista vazia tornaria 'sem backend' indistinguível de 'você ⛔ não tem sessões' — e esconderia se o ramo virou porta lateral");

const pkg = JSON.parse(lerFonte(path.join(appDir, "package.json")));
/**
 * ⚠️⚠️ AS DUAS METADES, ⛔ e ⛔ nenhuma sozinha basta.
 *
 * ⛔ Zerar as variáveis na linha de comando ⛔ NÃO funciona: o `.env.local` vence
 * e o valor é **inlined** no bundle. ⚠️ Quem desliga é `EXPO_NO_DOTENV=1`.
 *
 * ⚠️⚠️ E `--clear` ⛔ não é zelo: ⛔ **sem ele o cache do Metro devolve o bundle
 * anterior, com o backend dentro** — foi assim que uma execução inteira mediu o
 * build errado, com todas as telas clínicas presas até o timeout.
 */
const bt = pkg.scripts["build:web:teste"] ?? "";
confere("⚠️⚠️ ⛔ o bundle de teste desliga o dotenv",
  /EXPO_NO_DOTENV=1/.test(bt),
  "⛔ variável vazia na linha de comando ⛔ não vence o `.env.local` — o valor entra inlined no bundle");
confere("⚠️⚠️ ⛔ ⛔ e limpa o cache do Metro",
  /--clear/.test(bt),
  "⛔ sem `--clear` o cache devolve o bundle anterior COM backend, e a suíte mede um build que ⛔ não é o que ela pensa medir");
confere("⚠️ e é ele que o `test:all` usa",
  pkg.scripts["test:all"].includes("build:web:teste"),
  "⛔ teste de motor local ⛔ não deveria ⛔ nem conhecer o projeto de produção");

/**
 * ⚠️⚠️ A PROVA FINAL É O **ARTEFATO**, ⛔ e ⛔ não a intenção.
 *
 * ⛔ Ausência de variável de ambiente ⛔ não é evidência: a configuração pode
 * estar certa e o **artefato errado**, porque o cache do Metro devolve um bundle
 * anterior. ⚠️ Foi ⛔ exatamente o que aconteceu — e uma suíte inteira "provou"
 * algo que ⛔ não estava executando.
 *
 * ── ⚠️⚠️ CORREÇÃO DE TERMINOLOGIA (2026-08-31) ────────────────────────────
 *
 * ⛔ ⛔ A chave publicável no bundle ⛔ **NÃO É** o P0. Ela é cliente/pública
 * ⛔ por desenho, e estar ali é o comportamento correto.
 *
 * ⚠️ O **P0** é o backend aceitar essa identidade pública e entregar dado
 * clínico — `using (true)` para `anon`.
 *
 * ⚠️ O que esta varredura mede é uma **terceira** coisa: que o build de teste
 * ⛔ não está apontado para o projeto **remoto**. ⛔ Confundir as três deixaria
 * afirmação errada na auditoria.
 */
const distDir = path.join(appDir, "dist");
if (fs.existsSync(distDir)) {
  const refDoProjeto = (() => {
    const cfg = path.join(appDir, "supabase", "config.toml");
    const m = fs.existsSync(cfg) ? /project_id\s*=\s*"([^"]+)"/.exec(lerFonte(cfg)) : null;
    return m?.[1] ?? null;
  })();
  if (refDoProjeto) {
    const pilha = [distDir];
    let achou = false;
    while (pilha.length && !achou) {
      const at = pilha.pop();
      for (const n of fs.readdirSync(at)) {
        const f = path.join(at, n);
        if (fs.statSync(f).isDirectory()) pilha.push(f);
        else if (/\.(js|html|json)$/.test(n)) {
          /**
           * ⚠️ Duas assinaturas **independentes** do mesmo erro: o ref cru e a
           * URL montada. ⛔ Uma delas pode escapar a um refactor; as duas juntas,
           * ⛔ dificilmente. ⚠️ E ⛔ nenhuma delas guarda ⛔ nem compara segredo.
           */
          const txt = lerFonte(f);
          if (txt.includes(refDoProjeto) || txt.includes(`${refDoProjeto}.supabase.co`)) {
            achou = true;
            break;
          }
        }
      }
    }
    confere("⚠️⚠️ ⛔ ⛔ ⛔ o ref de produção ⛔ NÃO está no bundle de teste",
      !achou,
      "⛔ o bundle carregava `createClient(\"https://<ref>.supabase.co\", \"sb_publishable_…\")` — chave publicável inlined num artefato de teste");
  }
}

if (falhas.length) {
  console.log(`\n❌ GUARDA DE ACESSO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ GUARDA DE ACESSO — ${ok}/${ok} conferências · ${FECHADAS.length} rotas fechadas\n`);
