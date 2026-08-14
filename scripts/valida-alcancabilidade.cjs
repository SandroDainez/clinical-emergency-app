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
 *   contra os arquivos de conteúdo clínico da raiz.
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
  "anafilaxia-engine.ts": "D-22",
  "eap-engine.ts": "D-22",
  "ventilation-engine.ts": "D-22",
  "sepsis-engine.ts": "D-22 (parcial — 2 exports vivos p/ Calculadoras)",
  "sepsis-antibiotic-engine.ts": "D-22 (5º — achado por grep, fora da varredura dos 4)",
  // Achados PELA PRÓPRIA TRAVA, na primeira execução real. Nenhum deles
  // aparecia em varredura manual nenhuma — é o argumento de que instrumento
  // acha o que leitura não acha (R-29), agora em ~4.900 linhas.
  "avc-engine.ts": "D-22 (6º — 1.645 linhas; tela usa avc-decision-tree.ts)",
  "coronary-syndromes-engine.ts": "D-22 (7º — 1.239 linhas; tela usa coronary-decision-tree.ts)",
  "dka-hhs-engine.ts": "D-22 (8º — 1.984 linhas; tela usa dka-hhs-decision-tree.ts)",
};

// ── 0. Duplicata de arquivo (" 2.tsx") — nunca é intencional ────────────────
{
  const achados = [];
  const varrer = (d) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) { if (!/node_modules|dist|\.git|\.expo/.test(p2)) varrer(p2); }
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
  const CONTEUDO = /-(decision-tree|engine)\.ts$|^(reasoning-engines|clinical-modules)\.ts$/;
  for (const nome of fs.readdirSync(appDir)) {
    if (!CONTEUDO.test(nome)) continue;
    const abs = path.join(appDir, nome);
    if (alcancaveis.has(abs)) { ok++; continue; }
    if (MORTOS_CONHECIDOS[nome]) { ok++; continue; }
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
  const catalogo = fs.readFileSync(path.join(appDir, "clinical-modules.ts"), "utf8");
  const app = fs.readFileSync(path.join(appDir, "components/clinical-app.tsx"), "utf8");

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
