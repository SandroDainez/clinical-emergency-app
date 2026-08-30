/**
 * valida-alcancabilidade.cjs — R-32 virando instrumento (D-22)
 *
 * PROMETE: que todo arquivo de CONTEÚDO CLÍNICO seja alcançável a partir de
 *   uma rota real do app, nas DUAS classes de morte:
 *   (1) órfão de IMPORT — ninguém o importa;
 *   (2) órfão de RENDER — importado pelo catálogo (`clinical-modules.ts`),
 *       mas a tela decide por `protocolId` e devolve um componente que
 *       IGNORA o engine registrado.
 *   Todo arquivo morto conhecido precisa estar declarado em MORTOS_CONHECIDOS
 *   com a dívida que o cobre — morte silenciosa é o defeito.
 * NÃO PROMETE: que o conteúdo alcançável esteja clinicamente certo, nem que
 *   todo NÓ de uma árvore alcançável seja alcançável (isso é `test:arvores`).
 *   Também não detecta função exportada e nunca chamada dentro de um arquivo
 *   vivo — a granularidade aqui é o ARQUIVO.
 * UNIVERSO: grafo de imports a partir de `app/**` (rotas do expo-router),
 *   contra os arquivos de conteúdo clínico da RAIZ **e de `lib/`**.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * A auditoria corrigiu conteúdo clínico DENTRO de `anafilaxia-engine.ts`,
 * `eap-engine.ts` e `ventilation-engine.ts` — três vezes, ao longo de semanas
 * — sem saber que a tela nunca os executa. ~13.000 linhas inalcançáveis, e o
 * defeito só apareceu por acidente, ao tentar mostrar um número de cronômetro
 * na tela.
 *
 * Um `grep` de "quem importa este arquivo?" NÃO teria pegado: os três SÃO
 * importados, por `clinical-modules.ts`, que é alcançável. A morte deles é de
 * RENDER, não de import — e é a classe que esconde volume, porque tudo parece
 * conectado.
 *
 * Um quinto arquivo (`sepsis-antibiotic-engine.ts`, 364 linhas) era da
 * primeira classe e passou despercebido pela varredura manual dos quatro.
 * Foi encontrado por grep, não por leitura — R-29 outra vez.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

/**
 * Mortos CONHECIDOS e declarados, com a dívida que os cobre.
 *
 * Estar nesta lista NÃO é permissão para existir — é o registro de que a
 * morte é sabida e tem destino. Um arquivo morto fora desta lista é o
 * defeito que a trava persegue; um arquivo aqui cuja dívida já fechou
 * também é acusado (abaixo), para a lista não virar cemitério permanente.
 */
const MORTOS_CONHECIDOS = {
  // ⚠️⚠️ PRONTO, PROVADO, E **DESLIGADO POR DECISÃO** — D-123.
  //
  // `lib/sessao-anonima.ts` implementa a transferência de posse das sessões
  // anônimas. Ligá-lo em `app/index.tsx` trocaria o caminho de login que
  // FUNCIONA por um ainda não exercido contra o servidor real — e, com
  // Anonymous Sign-In **desabilitado** no projeto, `is_anonymous` seria sempre
  // falso e a troca ⛔ não compraria ⛔ nada hoje.
  //
  // ⚠️ A ordem certa está em D-123, em QUATRO fases — e a que eu tinha escrito
  // antes (habilitar o login anônimo primeiro) era **proibida**: sem a guarda
  // do trigger, o segundo anônimo colide em `app_users_email_key`. A ligação
  // com a tela é o último passo da Fase 4.
  //
  // ⛔ ⛔ ISTO ⛔ NÃO É ISENÇÃO DE MEDIÇÃO: `test:posse-de-sessao` exerce este
  // arquivo com 25 conferências e 18 mutações reprovadas. O que está suspenso é
  // a **ligação com a tela**, ⛔ não a prova.
  "lib/troca-de-sessao.ts":
    "D-123 · a DECISÃO da troca, sem imports por decisão — executada por test:troca-de-sessao (16 conferências)",
  "lib/sessao-anonima.ts":
    "D-123 · aguarda habilitar Anonymous Sign-In + aplicar migration + implantar claim; medido por test:posse-de-sessao",
  // ⚠️ NÃO É MORTO — É VIVO FORA DO APP. Único órfão que a inclusão de `lib/`
  // revelou (1 em 77). `lib/modulos-canonicos.ts` é a tabela de nomes e
  // apelidos dos módulos, consumida pelos SCRIPTS de auditoria — não pela
  // tela. Fica declarado aqui porque a alternativa seria a trava acusá-lo
  // para sempre, e exceção silenciosa é o defeito que ela combate.
  "lib/modulos-canonicos.ts":
    "consumido por scripts/ (inventário e índice de travas), não por app/ — alcançável pelo instrumento, não pelo usuário",
  // ⚠️ ESTRUTURA PRONTA, AINDA NÃO CONSUMIDA — e é assim de PROPÓSITO.
  //
  // O catálogo de antimicrobianos existe porque a ordem foi decidida: primeiro a
  // estrutura com fonte por faixa (AM-7), depois os fármacos, um a um. Ligá-lo à
  // tela agora significaria escrever dose nesta rodada, que é exatamente o que a
  // instrução proíbe — e as três calculadoras atuais continuam no ar.
  //
  // ⚠️ A DÍVIDA QUE O COBRE É A D-75, e ela tem a data de fechamento amarrada ao
  // primeiro fármaco novo: nenhum entra sem que o motor leia daqui.
  "lib/antimicrobianos/catalogo.ts":
    "estrutura pronta e não consumida — D-75; ligar ao motor é a próxima etapa, e nenhum fármaco novo entra antes disso",
  "lib/antimicrobianos/tipos.ts":
    "tipos do catálogo acima — mesma dívida (D-75)",
  // VAZIO PARA CONTEÚDO DE TELA — e é o desfecho da D-22. Os oito engines órfãos de render foram
  // deletados (ver auditoria/DELECAO.md). Entrada aqui cujo arquivo não exista
  // mais é acusada logo abaixo: a lista não pode virar cemitério permanente.
};

// ── 0. Duplicata de arquivo (" 2.tsx") — nunca é intencional ────────────────
{
  const achados = [];
  const varrer = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      // `test-results/` é saída do Playwright, não código: ele cria
      // `.last-run 2.json`, `3`, `4`… a cada execução repetida, e a trava de
      // duplicata acusava a própria suíte. Pasta ignorada pelo git, e agora
      // pela varredura — cópia acidental ali não é defeito do app.
      if (f.isDirectory()) { if (!/node_modules|dist|\.git|\.expo|test-results|playwright-report/.test(p2)) varrer(p2); }
      else if (/ \d+\.(tsx?|json)$/.test(f.name)) achados.push(path.relative(appDir, p2));
    }
  };
  varrer(appDir);
  for (const rel of achados) {
    if (MORTOS_CONHECIDOS[rel]) { ok++; continue; }
    falhas.push(
      `DUPLICATA DE ARQUIVO — ${rel}: nome com sufixo " N" é cópia acidental (Finder/editor).\n` +
      `    Perigo específico: ordena ao lado do original numa listagem, e editar a cópia é editar o nada.`
    );
  }
}

// ── 1. Grafo de imports a partir das ROTAS ──────────────────────────────────

function listar(dir, filtro, saida = []) {
  if (!fs.existsSync(dir)) return saida;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo/.test(p)) listar(p, filtro, saida);
    } else if (filtro.test(f.name)) saida.push(p);
  }
  return saida;
}

function resolverImport(deArquivo, especificador) {
  if (!especificador.startsWith(".")) return null;
  const base = path.resolve(path.dirname(deArquivo), especificador);
  for (const cand of [`${base}.ts`, `${base}.tsx`, `${base}.json`, path.join(base, "index.ts"), path.join(base, "index.tsx")]) {
    if (fs.existsSync(cand) && fs.statSync(cand).isFile()) return cand;
  }
  return null;
}

const alcancaveis = new Set();
const fila = listar(path.join(appDir, "app"), /\.tsx?$/);
for (const r of fila) alcancaveis.add(r);

while (fila.length) {
  const arquivo = fila.pop();
  let texto;
  try { texto = fs.readFileSync(arquivo, "utf8"); } catch { continue; }
  const specs = [...texto.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((m) => m[1]);
  for (const spec of specs) {
    const alvo = resolverImport(arquivo, spec);
    if (alvo && !alcancaveis.has(alvo)) {
      alcancaveis.add(alvo);
      fila.push(alvo);
    }
  }
}

if (alcancaveis.size < 50) {
  falhas.push(`o grafo alcançou só ${alcancaveis.size} arquivos — travessia quebrada, a trava não vale nada assim.`);
} else ok++;

// ── 2. Órfão de IMPORT ──────────────────────────────────────────────────────
//
// Conteúdo clínico da raiz que o grafo nunca alcança.
{
  // ⚠️ `lib/` ENTROU NO UNIVERSO — e a razão é a própria auditoria.
  //
  // Esta trava conferia só os arquivos de conteúdo da RAIZ, reconhecidos por
  // PADRÃO DE NOME (`*-decision-tree.ts`, `*-engine.ts`). Enquanto o conteúdo
  // clínico morava lá, o filtro bastava.
  //
  // Só que a recomendação desta auditoria, módulo após módulo, é MOVER o
  // conteúdo para constantes de fonte única em `lib/`. Uma lib órfã — criada,
  // preenchida com dose e ressalva, e nunca consumida — passava invisível por
  // esta trava, que é justamente a que existe para impedir conteúdo clínico
  // inalcançável.
  //
  // ⚠️ E A IRONIA É O ACHADO: a trava de ALCANÇABILIDADE falhava no próprio
  // teste de alcançabilidade — ela não alcançava a metade nova do app. Está
  // registrado no METODO: toda regra nova tem de ser rodada contra as próprias
  // travas antes de ser considerada estável.
  //
  // A migração custou pouco porque a travessia por IMPORTS já existia e já é
  // por conteúdo (ela resolve `from "./lib/x"` de verdade). O que era por nome
  // era só a lista de CANDIDATOS a órfão.
  const CONTEUDO = /-(decision-tree|engine)\.ts$|^(reasoning-engines|clinical-modules)\.ts$/;
  const candidatos = fs
    .readdirSync(appDir)
    .filter((nome) => CONTEUDO.test(nome))
    .map((nome) => path.join(appDir, nome));

  // Toda lib é candidata: elas existem para carregar conteúdo clínico, e é
  // conteúdo por CONTEÚDO — não por nome. `lib/i18n` fica de fora porque é
  // dicionário, alcançado por chave e não por import de módulo.
  const andarLib = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) {
        if (!/i18n/.test(p)) andarLib(p);
      } else if (f.name.endsWith(".ts")) {
        candidatos.push(p);
      }
    }
  };
  andarLib(path.join(appDir, "lib"));

  if (candidatos.length < 60) {
    falhas.push(
      `só ${candidatos.length} arquivos de conteúdo candidatos — a listagem quebrou. Este piso é de ` +
      `LEITURA, não de conteúdo: ele detecta a varredura muda, e por isso fica bem abaixo da contagem real.`
    );
  } else ok++;

  for (const abs of candidatos) {
    const nome = path.relative(appDir, abs);
    if (alcancaveis.has(abs)) { ok++; continue; }
    if (MORTOS_CONHECIDOS[nome] || MORTOS_CONHECIDOS[path.basename(abs)]) { ok++; continue; }
    falhas.push(
      `ÓRFÃO DE IMPORT — ${nome}: nenhuma rota de app/ alcança este arquivo, direta ou indiretamente.\n` +
      `    Conteúdo clínico inalcançável atrai manutenção e não chega a ninguém (R-32). Ou conecte, ou apague,\n` +
      `    ou declare em MORTOS_CONHECIDOS com a dívida que o cobre.`
    );
  }
}

/**
 * STUB DE REGISTRO × CONTEÚDO CLÍNICO MORTO — a distinção que evita alarme falso.
 *
 * Vários engines do catálogo (os 8 do ACLS, TEP, eclâmpsia, eletrólitos, ISR)
 * são SHIMS: existem só para satisfazer `engine: X as ClinicalEngine` em
 * clinical-modules.ts, com STATIC_STATE e PROTOCOL_ID, enquanto a tela do
 * módulo renderiza o conteúdo real. Não têm dose nenhuma. Que não sejam
 * "executados" é o desenho, não um defeito — acusá-los seria ruído que faz
 * a trava ser ignorada.
 *
 * O defeito é o arquivo com CONTEÚDO CLÍNICO (doses, condutas) inalcançável.
 * O critério é de efeito: presença de unidade posológica.
 */
function temConteudoClinico(abs) {
  const t = fs.readFileSync(abs, "utf8");
  const linhas = t.split("\n").length;
  // ⚠️ CONTAR DOSE NÃO SERVE (R-10): avc-engine.ts tem 1.645 linhas e ZERO
  // unidades posológicas — escore de NIHSS e elegibilidade de trombólise são
  // conteúdo clínico sem dose. O critério é ESTRUTURAL: shim de registro é
  // pequeno e devolve estado estático; conteúdo é grande, com qualquer coisa.
  const ehShim = /STATIC_STATE|getCurrentState/.test(t) && linhas <= 250;
  return !ehShim;
}

// ── 3. Órfão de RENDER — a classe que escondeu 13.000 linhas ────────────────
//
// `clinical-app.tsx` recebe `engine` como prop. Para vários protocolId ele
// devolve um componente hard-coded que NÃO repassa esse engine — e aí o
// engine registrado em `clinical-modules.ts` fica importado, compilando,
// testado, e nunca executado.
//
// ⚠️ A PRIMEIRA VERSÃO DESTA SEÇÃO ERA TAUTOLÓGICA: tinha uma condição
// `/ProtocolScreen/.test(app) === false` que é sempre falsa (o arquivo
// contém ProtocolScreen), então o ramo nunca disparava. Passou verde com
// anafilaxia-engine.ts fora da lista de mortos — o caso que ela existe para
// pegar. Só a mutação mostrou (R-15). A versão abaixo é medida por EFEITO:
// lê o branch real e confere se o engine chega ao componente.
{
  const catalogo = lerFonte(path.join(appDir, "clinical-modules.ts"));
  const app = lerFonte(path.join(appDir, "components/clinical-app.tsx"));

  const importados = new Map();
  for (const m of catalogo.matchAll(/import \* as (\w+) from "\.\/([\w-]+)"/g)) {
    importados.set(m[1], `${m[2]}.ts`);
  }
  // engine → protocolId REAL, lido do protocols/*.json que o engine importa.
  //
  // ⚠️ NÃO casar por semelhança de nome: a primeira versão ligava o id do
  // módulo ao nome da variável de branch por prefixo, e "sindromes-
  // coronarianas" nunca casa com "isCoronaryModule" — coronary-syndromes-
  // engine.ts passou como vivo sendo morto. Falso NEGATIVO, achado por
  // conferência manual depois da trava já estar verde (R-15).
  const engineDoProtocolo = new Map();
  for (const arq of new Set(importados.values())) {
    const abs = path.join(appDir, arq);
    if (!fs.existsSync(abs)) continue;
    const t = fs.readFileSync(abs, "utf8");
    const imp = t.match(/from "\.\/protocols\/([\w.]+)\.json"/);
    let protocolId = null;
    if (imp) {
      const j = path.join(appDir, "protocols", `${imp[1]}.json`);
      if (fs.existsSync(j)) protocolId = (JSON.parse(fs.readFileSync(j, "utf8")) || {}).id ?? null;
    }
    if (!protocolId) {
      const direto = t.match(/protocolId:\s*"([\w_]+)"/);
      if (direto) protocolId = direto[1];
    }
    // ⚠️ SEM protocolId LEGÍVEL NÃO É "OK" — é NÃO VERIFICÁVEL, e trava que
    // pula em silêncio o que não sabe ler é a mesma falha do R-15. Entra no
    // mapa com chave nula e é acusada abaixo se também não tiver consumidor.
    engineDoProtocolo.set(protocolId ?? `__sem_protocolid__${arq}`, arq);
  }
  if (engineDoProtocolo.size < 10) {
    falhas.push(`só ${engineDoProtocolo.size} pares rota→engine lidos do catálogo — leitura quebrada.`);
  } else ok++;

  // protocolId → nome da variável de branch  (const isXModule = protocolId === "y")
  const branchDoProtocolId = new Map();
  for (const m of app.matchAll(/const\s+(is\w+Module)\s*=\s*protocolId\s*===\s*"([\w_]+)"/g)) {
    branchDoProtocolId.set(m[2], m[1]);
  }

  // variável de branch → o return dela repassa `engine`?
  const branchRepassaEngine = new Map();
  for (const m of app.matchAll(/if\s*\((is\w+Module)\)\s*\{\s*return\s*(<[^;]*?\/>)/gs)) {
    branchRepassaEngine.set(m[1], /\bengine\s*=|\bengine\}/.test(m[2]));
  }

  for (const [modId, arq] of engineDoProtocolo) {
    // engine consumido por alguma tela alcançável, pelo nome? então está vivo.
    const base = arq.replace(/\.ts$/, "");
    let consumido = false;
    for (const vivo of alcancaveis) {
      const rel = path.relative(appDir, vivo);
      if (rel === "clinical-modules.ts" || rel === arq) continue;
      if (new RegExp(`from ["'](?:\\.\\/|\\.\\.\\/|\\.\\.\\/\\.\\.\\/)${base}["']`).test(fs.readFileSync(vivo, "utf8"))) {
        consumido = true; break;
      }
    }
    if (consumido) { ok++; continue; }

    // não é consumido por nome. Vive só se a tela genérica o receber — isto
    // é, se NÃO houver branch próprio, ou se o branch repassar `engine`.
    const branch = branchDoProtocolId.get(modId);
    const temBranch = Boolean(branch);
    const repassa = branch ? branchRepassaEngine.get(branch) : undefined;

    if (MORTOS_CONHECIDOS[arq]) { ok++; continue; }
    if (!temConteudoClinico(path.join(appDir, arq))) { ok++; continue; }

    if (String(modId).startsWith("__sem_protocolid__")) {
      falhas.push(
        `NÃO VERIFICÁVEL — ${arq}: registrado no catálogo, sem consumidor além dele, e sem protocolId\n` +
        `    legível (não importa protocols/*.json nem declara protocolId). A trava não consegue provar que\n` +
        `    executa. Trate como morto até prova em contrário — não presuma vivo o que não deu para ler.`
      );
      continue;
    }

    if (temBranch && repassa === false) {
      falhas.push(
        `ÓRFÃO DE RENDER — ${arq}: registrado em clinical-modules.ts para "${modId}", mas clinical-app.tsx\n` +
        `    tem o branch \`${branch}\` devolvendo um componente que NÃO recebe \`engine\`. O arquivo compila,\n` +
        `    é importado e nunca executa (R-32). Ou conecte, ou apague, ou declare em MORTOS_CONHECIDOS.`
      );
    } else ok++;
  }
}

// ── 4. A lista de mortos não pode virar cemitério permanente ────────────────
{
  for (const [nome, divida] of Object.entries(MORTOS_CONHECIDOS)) {
    if (!fs.existsSync(path.join(appDir, nome))) {
      falhas.push(
        `${nome} está em MORTOS_CONHECIDOS mas não existe mais — a dívida ${divida} fechou.\n` +
        `    Remova a entrada: lista de exceção que sobrevive ao problema vira permissão silenciosa.`
      );
    } else ok++;
  }
}

console.log(`\nAlcançabilidade — conteúdo clínico que a rota real não executa (R-32)\n`);
console.log(`   ${alcancaveis.size} arquivos alcançáveis a partir de app/`);
console.log(`   ${Object.keys(MORTOS_CONHECIDOS).length} mortos declarados (D-22)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — nenhum morto silencioso, nas duas classes\n`);
