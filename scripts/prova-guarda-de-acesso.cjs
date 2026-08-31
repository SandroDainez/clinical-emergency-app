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
const P = G;

// ── ⚠️⚠️ 1 · O DESTINO EM CADA ESTADO ─────────────────────────────────────
const COM = (e) => ({ backendDisponivel: true, ...e });
const casos = [
  ["carregando", COM({ carregando: true, autenticado: false }), "carregando"],
  ["carregando mesmo já autenticado", COM({ carregando: true, autenticado: true, status: "ativo" }), "carregando"],
  ["sem sessão", COM({ carregando: false, autenticado: false }), "login"],
  ["ativo", COM({ carregando: false, autenticado: true, status: "ativo" }), "liberado_online"],
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
    G.destinoDaGuarda(COM({ carregando: false, autenticado: true, status: "pendente" })) !== "liberado_online",
  "⛔ backend presente ⛔ e ⛔ sem sessão ⛔ não pode abrir — é o buraco que a guarda existe para fechar");

// ── ⚠️⚠️ 1c · DEGRADAÇÃO LOCAL SEGURA ─────────────────────────────────────
//
// ⚠️⚠️ A linha inteira do desenho: **prova local autoriza o motor, ⛔ NUNCA o
// dado remoto**. E ausência de resposta ⛔ não é autorização ⛔ nem recusa
// automática — degrada ⛔ só quem já provou ser ativo neste aparelho.
const AGORA = 1_800_000_000_000;
const DIA = 24 * 60 * 60 * 1000;

confere("⚠️⚠️ ativo previamente validado + backend indisponível ⇒ SÓ local",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, rpcFalhou: true, provaLocalValida: true }))
    === "liberado_local_degradado",
  "⛔ tirar o motor de PCR da mão de quem foi autorizado ontem, porque o Supabase caiu, é o pior momento possível");

confere("⚠️⚠️ ⛔ ⛔ RPC falhou SEM prova ⇒ FECHA",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, rpcFalhou: true, provaLocalValida: false }))
    === "conta_indisponivel",
  "⛔ 'RPC falhou → libera' daria acesso a uma conta pendente que apenas derrubasse a internet");

confere("⚠️⚠️ ⛔ primeira instalação offline ⛔ NÃO abre",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, rpcFalhou: true })) === "conta_indisponivel",
  "⛔ sem prova prévia neste aparelho ⛔ não há o que degradar");

confere("⚠️⚠️ ⛔ ⛔ recusa CONFIRMADA vence prova local válida",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, status: "bloqueado", rpcFalhou: true, provaLocalValida: true }))
    === "conta_indisponivel" &&
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, status: "pendente", provaLocalValida: true }))
    === "aguardando_aprovacao",
  "⛔ assim que o servidor responde, ele é a autoridade — a prova ⛔ não sobrevive a um bloqueio confirmado");

confere("⚠️⚠️ e `liberado_local_degradado` ⛔ NÃO é `liberado_online`",
  G.destinoDaGuarda(COM({ carregando: false, autenticado: true, rpcFalhou: true, provaLocalValida: true }))
    !== "liberado_online",
  "⛔ se fossem o mesmo destino, 'degradado' e 'autorizado' ficariam indistinguíveis — no código e na tela");

// ── ⚠️⚠️ 1d · A VALIDADE DA PROVA, EXECUTADA ──────────────────────────────
confere("⚠️ prova do próprio usuário, dentro do prazo, vale",
  P.provaValida({ userId: "A", em: AGORA - 1000 }, "A", AGORA) === true,
  "⛔ sem isto ⛔ não há degradação ⛔ nenhuma");
confere("⚠️⚠️ ⛔ ⛔ prova de A ⛔ NÃO autoriza B",
  P.provaValida({ userId: "A", em: AGORA }, "B", AGORA) === false,
  "⛔ reaproveitar prova entre identidades é dar a autorização de um médico a outro");
confere("⚠️⚠️ ⛔ prova vencida ⛔ não abre",
  P.provaValida({ userId: "A", em: AGORA - DIA - 1 }, "A", AGORA) === false,
  "⛔ 24 h é a decisão de produto; sem o corte, a prova viraria permanente");
confere("⚠️ prova ausente ⛔ ou identidade ausente ⇒ inválida",
  P.provaValida(null, "A", AGORA) === false &&
    P.provaValida({ userId: "A", em: AGORA }, undefined, AGORA) === false,
  "⛔ falha fechada em todo caminho de ausência");
confere("⚠️ a validade padrão é de 24 horas",
  P.VALIDADE_DA_PROVA_MS === DIA,
  "⛔ minutos ⛔ não cobrem plantão com Wi-Fi ruim — foi decisão explícita");

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

/**
 * ⚠️⚠️ EM `carregando`, O NAVEGADOR CONTINUA MONTADO — e a cobertura esconde.
 *
 * ⛔ Substituir o `<Stack>` por uma tela de carregamento **destruía a navegação
 * em curso**: o login fazia `router.replace("/(tabs)")`, a rota deixava de ser
 * pública, o destino virava `carregando`, o navegador desmontava e a navegação
 * sumia. ⚠️ O médico voltava ao login, e ⛔ só entrava na segunda tentativa.
 *
 * ⚠️ A propriedade — ⛔ nenhum quadro de conteúdo clínico — é cumprida por uma
 * cobertura **opaca em tela cheia**, ⛔ e ⛔ não por desmontar o navegador.
 */
confere("⚠️⚠️ `carregando` COBRE, ⛔ e ⛔ não substitui o `Stack`",
  /const cobrindo = destino === 'carregando'/.test(raiz) &&
    !/if \(destino === 'carregando'\)\s*\{?\s*return/.test(raiz),
  "⛔ retorno antecipado em `carregando` desmonta o navegador no meio da navegação do login — e a navegação some junto");

confere("⚠️⚠️ e a cobertura é OPACA e em tela cheia",
  /cobertura:\s*\{[\s\S]{0,260}?position: 'absolute'[\s\S]{0,260}?backgroundColor: CORES\.bg/.test(raiz),
  "⛔ sem fundo sólido, o conteúdo clínico apareceria por baixo — a cobertura deixaria de cumprir o que a substituição cumpria");

confere("⚠️ os estados TERMINAIS seguem com retorno antecipado",
  /destino === 'aguardando_aprovacao' \|\| destino === 'conta_indisponivel'\)\s*\{[\s\S]{0,80}?return/.test(raiz),
  "⛔ neles ⛔ não há navegação em curso para perder, e manter o navegador montado deixaria a tela clínica montar atrás da recusa");

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
  (hist.match(/persistenciaRemotaAutorizada\(\)/g) || []).length >= 2 &&
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

// ── ⚠️⚠️ 6 · A PROVA ⛔ NUNCA VIRA CREDENCIAL ──────────────────────────────
const pv = lerFonte(path.join(appDir, "lib", "prova-de-acesso.ts"));
confere("o módulo da prova existe e tem corpo", pv.length > 800, "piso R-1");

confere("⚠️⚠️ ⛔ ⛔ ⛔ a prova ⛔ NÃO é enviada a lugar nenhum",
  !/fetch\(|supabase|Authorization|rpc\(/i.test(pv),
  "⛔ prova local que viaja vira credencial — e credencial que o próprio aparelho fabrica ⛔ não é autorização");

confere("⚠️⚠️ a prova carrega identidade E instante",
  /userId: string/.test(fonteGuarda) && /em: number/.test(fonteGuarda),
  "⛔ sem `userId` a prova de A vale para B; sem instante, vale para sempre");

const lay = raiz;
confere("⚠️⚠️ a prova só é GRAVADA para `ativo` confirmado",
  /status === 'ativo'[^\n]*gravarProva|gravarProva\(uid[\s\S]{0,40}\)/.test(lay) &&
    /perfil\?\.status === 'ativo' && uid\) gravarProva/.test(lay),
  "⛔ gravar noutro estado faria uma conta pendente virar prova ao ser vista uma vez");

confere("⚠️⚠️ e é INVALIDADA em recusa confirmada",
  /pendente'[\s\S]{0,60}bloqueado'\) invalidarProva\(\)/.test(lay),
  "⛔ prova que sobrevive a um bloqueio confirmado é autorização revogada que continua valendo");

const cap2 = lerFonte(path.join(appDir, "lib", "backend-clinico.ts"));
confere("⚠️⚠️ dado remoto exige confirmação ATUAL, ⛔ não prova local",
  /persistenciaRemotaAutorizada/.test(cap2) && /remotaConfirmada/.test(cap2),
  "⛔ prova local autoriza o MOTOR; dado remoto exige o servidor — misturar os dois é o defeito que o desenho existe para evitar");

confere("⚠️⚠️ ⛔ e há UM ÚNICO escritor da persistência remota",
  (lerFonte(path.join(appDir, "app", "_layout.tsx")).match(/definirPersistenciaRemota\(/g) || []).length === 1 &&
    !/definirPersistenciaRemota/.test(lerFonte(path.join(appDir, "lib", "clinical-session-history.ts"))),
  "⛔ dois escritores criariam duas verdades sobre a mesma autorização");

confere("⚠️ o histórico remoto exige a capacidade ESTREITA",
  /persistenciaRemotaAutorizada\(\)/.test(hist) && !/backendClinicoDisponivel\(\)/.test(hist),
  "⛔ em modo degradado há backend, ⛔ mas ⛔ não há confirmação — histórico fica indisponível");

// ── ⚠️⚠️ 7 · SAÍDA E VISIBILIDADE DA DEGRADAÇÃO ───────────────────────────
const auth = lerFonte(path.join(appDir, "lib", "auth-session.ts"));
confere("⚠️⚠️ existe UMA porta de saída, e ela destrói a prova",
  /export async function sairDaConta/.test(auth) && /invalidarProva\(\)/.test(auth),
  "⛔ estado residual de autorização ⛔ não pode sobreviver a uma saída explícita");

const saidas = [];
for (const dir of ["app", "components", "lib"]) {
  const raizD = path.join(appDir, dir);
  const pilha = fs.existsSync(raizD) ? [raizD] : [];
  while (pilha.length) {
    const at = pilha.pop();
    for (const n of fs.readdirSync(at)) {
      const f = path.join(at, n);
      if (fs.statSync(f).isDirectory()) pilha.push(f);
      else if (/\.tsx?$/.test(n) && f !== path.join(appDir, "lib", "auth-session.ts")
               && /auth\.signOut\(/.test(lerFonte(f))) saidas.push(path.relative(appDir, f));
    }
  }
}
/**
 * ⚠️⚠️ E A PORTA PRECISA SER ATRAVESSADA **INCONDICIONALMENTE**.
 *
 * ⛔ `module-hub.tsx` envolvia `sairDaConta()` num `if (supabase)`. A porta
 * existia, ⛔ mas dava para contorná-la: em modo local a prova **sobrevivia ao
 * logout**. ⚠️ A trava media que ⛔ ninguém mais chamava `signOut` — ⛔ não que a
 * saída fosse sempre percorrida.
 */
const condicionais = [];
for (const dir of ["app", "components"]) {
  const raizD = path.join(appDir, dir);
  const pilha = fs.existsSync(raizD) ? [raizD] : [];
  while (pilha.length) {
    const at = pilha.pop();
    for (const n of fs.readdirSync(at)) {
      const f = path.join(at, n);
      if (fs.statSync(f).isDirectory()) pilha.push(f);
      else if (/\.tsx?$/.test(n)) {
        const t = lerFonte(f);
        if (/if\s*\([^)]*\)\s*\{[^}]{0,200}?sairDaConta\(/.test(t)) {
          condicionais.push(path.relative(appDir, f));
        }
      }
    }
  }
}
confere("⚠️⚠️ ⛔ a saída ⛔ NÃO é condicional em lugar nenhum",
  condicionais.length === 0,
  `⛔ envolver a saída num \`if\` deixa a prova sobreviver ao logout no ramo que ⛔ não passa — encontrado: ${condicionais.join(", ")}`);

confere("⚠️⚠️ ⛔ ⛔ e ⛔ NENHUM outro lugar chama `signOut` direto",
  saidas.length === 0,
  `⛔ com duas saídas, a próxima regra de logout entra numa e ⛔ não na outra — encontrado: ${saidas.join(", ")}`);

/**
 * ⚠️⚠️ MEDE QUE A FAIXA É **RENDERIZADA**, ⛔ e ⛔ não que existe.
 *
 * ⛔ A primeira versão se satisfazia com o `testID` do contêiner e com a
 * **definição** do componente — remover o `<FaixaDegradada />` do JSX deixava a
 * faixa vazia e a trava verde. ⚠️ Componente definido e ⛔ não usado é ⛔ nada na
 * tela.
 */
confere("⚠️⚠️ o modo degradado é VISÍVEL na tela",
  /degradado \? \([\s\S]{0,300}?<FaixaDegradada\s*\/>/.test(raiz) && /Modo local/.test(raiz),
  "⛔ o médico precisa saber que o que registrar ⛔ não está sendo persistido — senão descobre depois, procurando um registro que ⛔ nunca existiu");

/**
 * ⚠️ Mede a **ausência de retorno antecipado** para o destino degradado — ⛔ e
 * ⛔ não a proximidade textual, que casava `const degradado = …` com o `return`
 * final do componente.
 */
confere("⚠️⚠️ ⛔ e a faixa ⛔ NÃO bloqueia o uso",
  !/if \(destino === 'liberado_local_degradado'\)\s*\{?\s*return/.test(raiz),
  "⛔ modal ⛔ ou spinner aqui seria o oposto do desenho: ele entrou porque o motor funciona sem servidor");

if (falhas.length) {
  console.log(`\n❌ GUARDA DE ACESSO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ GUARDA DE ACESSO — ${ok}/${ok} conferências · ${FECHADAS.length} rotas fechadas\n`);
