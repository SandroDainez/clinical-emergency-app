#!/usr/bin/env node
/**
 * O CENSO DOS INSTRUMENTOS — a trava que cobre o instrumento que NÃO RODA.
 *
 * PROMETE: que todo script de instrumento do repositório esteja alcançável a
 * partir do portão `test:all`/`pretest:all` — diretamente, por outro npm script
 * ou por um runner agrupador — ou numa isenção DATADA E JUSTIFICADA; que o
 * número de instrumentos no portão não caia (piso registrado); que cada um RODE
 * de fato; e que nenhum termine com código fora de {0,1}.
 * NÃO PROMETE: que o instrumento meça a coisa certa, nem que o universo dele
 * seja suficiente. Isso é `valida-pipeline` (declaração de cobertura) e
 * `lib/universo.cjs` (piso por instrumento). O censo cobre EXISTÊNCIA,
 * ALCANÇABILIDADE NO PORTÃO e EXECUÇÃO, não qualidade.
 * UNIVERSO: `scripts/*.cjs` que casam com o padrão de instrumento, contados e
 * impressos antes do resultado, com piso em auditoria/universo-dos-instrumentos.json.
 *
 * Um detalhe importante: o portão real do npm inclui `pretest:all` antes de
 * `test:all`. Além disso, alguns blocos são runners explícitos (por exemplo,
 * `valida-emergencias-2-suite.cjs`) que executam uma lista de validadores. O
 * censo antigo olhava apenas a string literal de `test:all`; com isso, um
 * validador podia RODAR no portão e ainda ser acusado de estar fora dele.
 */
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const RAIZ = path.resolve(__dirname, "..");
const SCRIPTS_DIR = path.join(RAIZ, "scripts");
const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));

/** Scripts que SÃO instrumento — o resto de scripts/ é biblioteca e ferramenta. */
const EH_INSTRUMENTO = (n) => /^(valida|auditoria|mapa|censo)-/.test(n) && n.endsWith(".cjs");

/**
 * Isenções — cada uma com DATA e MOTIVO. Sem os dois, a lista vira gaveta.
 */
const ISENTOS = {
  "censo-de-instrumentos.cjs":
    "2026-08-23 · é o próprio censo: rodar a si mesmo dentro de si é recursão, não conferência. Ele entra no test:all pelo nome test:censo.",
  "mapa-de-presets.cjs":
    "2026-08-23 · MEDIÇÃO sem código de saída, por decisão registrada: presets são retrato, não regra. Roda por npm run mapa:presets.",
  "mapa-de-calculadoras.cjs":
    "2026-08-23 · MEDIÇÃO sem código de saída: inventário das calculadoras para leitura humana.",
  "auditoria-prescricao-sem-dose.cjs":
    "2026-08-23 · é MAPA por decisão escrita no próprio script: boa parte da lista são frases de INDICAÇÃO, onde a dose vive no módulo do fármaco e repeti-la aqui criaria a quinta cópia de um número. O que se procura na lista é o SILÊNCIO, e isso pede julgamento humano.",
  "mapa-fluxo-guiado.cjs":
    "2026-08-23 · MEDIÇÃO de cobertura do caminho guiado: varre as árvores e marca quais decisões oferecem o \"me guie pelos sinais\". É retrato para o autor decidir onde falta, não regra.",
  "mapa-de-fontes.cjs":
    "2026-08-23 · MEDIÇÃO sem código de saída: inventário de fontes por módulo.",
};

const todos = fs.readdirSync(SCRIPTS_DIR).filter(EH_INSTRUMENTO).sort();
const conjuntoInstrumentos = new Set(todos);
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

// ── 1. UNIVERSO ANTES DO RESULTADO
console.log(`\n════ CENSO DE INSTRUMENTOS ════\n`);
console.log(`UNIVERSO: ${todos.length} instrumentos em scripts/`);
const MEDICOES = fs.readdirSync(SCRIPTS_DIR).filter((n) => /^(mede|compara)-/.test(n) && n.endsWith(".cjs"));
console.log(`  fora do escopo: ${MEDICOES.length} medição(ões) sem código de saída — ${MEDICOES.join(", ")}`);

// ── 2. QUEM ESTÁ NO PORTÃO — ALCANÇABILIDADE, NÃO SÓ TEXTO EM test:all
// O npm executa `pretest:all` automaticamente. A partir desses dois roots,
// seguimos `npm run ...`, scripts .cjs chamados diretamente e runners .cjs que
// nomeiam outros instrumentos em strings de código. Comentários são removidos
// antes da leitura para uma documentação não poder fabricar cobertura.
const removerComentarios = (src) => src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const scriptsNpmAlcancados = new Set();
const arquivosAlcancados = new Set();
const filaNpm = ["pretest:all", "test:all"].filter((k) => typeof pkg.scripts[k] === "string");
const filaArquivos = [];

function enfileirarArquivo(nome) {
  const base = path.basename(nome);
  if (!base.endsWith(".cjs")) return;
  if (!fs.existsSync(path.join(SCRIPTS_DIR, base))) return;
  if (arquivosAlcancados.has(base)) return;
  arquivosAlcancados.add(base);
  filaArquivos.push(base);
}

while (filaNpm.length) {
  const nome = filaNpm.shift();
  if (!nome || scriptsNpmAlcancados.has(nome)) continue;
  scriptsNpmAlcancados.add(nome);
  const comando = pkg.scripts[nome] ?? "";

  for (const m of comando.matchAll(/npm\s+run\s+([\w:.-]+)/g)) {
    if (pkg.scripts[m[1]] && !scriptsNpmAlcancados.has(m[1])) filaNpm.push(m[1]);
  }
  for (const m of comando.matchAll(/(?:\.\/)?scripts\/([\w.-]+\.cjs)/g)) {
    enfileirarArquivo(m[1]);
  }
}

while (filaArquivos.length) {
  const arq = filaArquivos.shift();
  const src = removerComentarios(fs.readFileSync(path.join(SCRIPTS_DIR, arq), "utf8"));

  // Runner canônico: ele descobre em runtime exatamente o mesmo universo de
  // instrumentos deste censo e falha se qualquer um retornar código diferente
  // de zero. O marcador abaixo só vale se estiver em código executável do
  // runner (comentários já foram removidos). Assim o censo consegue provar
  // alcançabilidade mesmo sem uma lista manual de centenas de nomes.
  if (/COBRE_TODOS_OS_INSTRUMENTOS\s*=\s*true/.test(src)) {
    for (const instrumento of todos) enfileirarArquivo(instrumento);
  }

  // Só nomes reais de arquivos do próprio diretório contam. Isso cobre arrays
  // explícitos de runners e chamadas spawn/exec/require sem depender do estilo.
  for (const m of src.matchAll(/["'`]([\w.-]+\.cjs)["'`]/g)) {
    if (conjuntoInstrumentos.has(m[1])) enfileirarArquivo(m[1]);
  }
}

const noPortao = todos.filter((arq) => arquivosAlcancados.has(arq) || arq === "censo-de-instrumentos.cjs");
const fora = todos.filter((arq) => !noPortao.includes(arq));
console.log(`  npm scripts alcançados desde pretest:test/all: ${scriptsNpmAlcancados.size}`);
console.log(`  no portão (direto ou por runner): ${noPortao.length}  ·  fora: ${fora.length}`);
if (!conferirUniverso("censo-de-instrumentos", "instrumentos", todos.length)) falhas++;
if (!conferirUniverso("censo-de-instrumentos", "no_portao", noPortao.length)) falhas++;

for (const arq of fora) {
  if (!ISENTOS[arq]) erro(`${arq} não está alcançável pelo portão e não tem isenção — ou ligue-o ao test:all/pretest:all, ou registre isenção DATADA e JUSTIFICADA`);
  else if (!/^\d{4}-\d{2}-\d{2} · .{30,}/.test(ISENTOS[arq]))
    erro(`${arq} tem isenção sem data ou sem motivo suficiente`);
  else console.log(`  ⚠️ isento: ${arq} — ${ISENTOS[arq]}`);
}

// ── 3. CADA UM RODA DE FATO, E COM CÓDIGO QUE SIGNIFICA ALGUMA COISA
console.log(`\n  executando ${todos.length - 1} instrumento(s)…`);
const naoRodaram = [];
const repetidos = [];
for (const arq of todos) {
  if (arq === "censo-de-instrumentos.cjs") continue;
  const rodar = () => spawnSync(process.execPath, [path.join(SCRIPTS_DIR, arq)], { cwd: RAIZ, encoding: "utf8", timeout: 300000 });
  let r = rodar();
  if (r.status === null && r.signal) {
    repetidos.push(`${arq} (morto por ${r.signal} — repetido)`);
    r = rodar();
  }
  const codigo = r.status;
  if (codigo !== 0 && codigo !== 1) {
    naoRodaram.push(`${arq} (código ${codigo === null ? `sinal ${r.signal}, DUAS vezes` : codigo})`);
  }
}
if (repetidos.length) console.log(`  ⚠️ ${repetidos.length} instrumento(s) mortos por sinal e repetidos:\n     ${repetidos.join("\n     ")}`);
if (naoRodaram.length) erro(`instrumento(s) que NÃO RODARAM — código fora de {0,1}:\n     ${naoRodaram.join("\n     ")}`);

console.log(falhas
  ? `\n❌ ${falhas} falha(s) no censo`
  : `\n✅ ${todos.length} instrumentos · ${noPortao.length} no portão · ${fora.length} isento(s) com data e motivo · todos rodaram com código 0 ou 1`);
process.exit(falhas ? 1 : 0);
