#!/usr/bin/env node
/**
 * O CENSO DOS INSTRUMENTOS — a trava que cobre o instrumento que NÃO RODA.
 *
 * PROMETE: que todo script de instrumento do repositório esteja no `test:all`
 *   ou numa isenção DATADA E JUSTIFICADA; que o número de instrumentos no
 *   portão não caia (piso registrado); que cada um RODE de fato; e que nenhum
 *   termine com código fora de {0,1} — porque 127, 126 e 2 são "não rodou", e
 *   "não rodou" saindo como verde é a mentira que este censo existe para matar.
 * NÃO PROMETE: que o instrumento meça a coisa certa, nem que o universo dele
 *   seja suficiente. Isso é `valida-pipeline` (declaração de cobertura) e
 *   `lib/universo.cjs` (piso por instrumento). O censo cobre EXISTÊNCIA e
 *   EXECUÇÃO, não qualidade.
 * UNIVERSO: `scripts/*.cjs` que casam com o padrão de instrumento, contados e
 *   impressos antes do resultado, com piso em auditoria/universo-dos-instrumentos.json.
 *
 * ── A FAMÍLIA QUE ELE NASCEU PARA MATAR (2026-08-23) ────────────────────────
 *
 * Cinco coisas de uma rodada só, todas a mesma mentira — "está tudo bem" quando
 * o correto era "nada foi olhado":
 *
 *   1. erro classificado saindo com código 0 (severidade não amarrada à saída)
 *   2. três instrumentos FORA do test:all — 349 commits desde que nasceram
 *   3. auditoria-doses-criticas MORTO desde a9b16ad, crashando na compilação
 *   4. bloco pulado por `typeof === "function"`, relatório saindo limpo
 *   5. uma varredura minha com `timeout` (inexistente no macOS): 53 instrumentos
 *      voltaram 127, e a saída vazia leu-se como "ninguém tem esse defeito"
 *
 * As duas últimas são as piores: o silêncio é indistinguível do sucesso.
 */
const fs = require("fs"), path = require("path");
const { spawnSync } = require("child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const RAIZ = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));
const TEST_ALL = pkg.scripts["test:all"];

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

const todos = fs.readdirSync(path.join(RAIZ, "scripts")).filter(EH_INSTRUMENTO).sort();
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

// ── 1. UNIVERSO ANTES DO RESULTADO
console.log(`\n════ CENSO DE INSTRUMENTOS ════\n`);
console.log(`UNIVERSO: ${todos.length} instrumentos em scripts/`);

// ── 2. QUEM ESTÁ NO PORTÃO
const noPortao = [], fora = [];
for (const arq of todos) {
  const alvo = `scripts/${arq}`;
  // ⚠️ TODAS as entradas npm que rodam este arquivo, não a primeira. O mesmo
  // instrumento tem apelidos (`audit:estado` e `test:arvores` rodam o mesmo
  // script), e olhar só o primeiro acusou de "fora do portão" um que está
  // dentro pelo segundo nome — R-87 dentro do censo, no dia em que ele nasceu.
  const entradas = Object.entries(pkg.scripts).filter(([, v]) => v.includes(alvo)).map(([k]) => k);
  const ligado = entradas.some((k) => TEST_ALL.includes(`npm run ${k}`));
  (ligado ? noPortao : fora).push(arq);
}
console.log(`  no test:all: ${noPortao.length}  ·  fora: ${fora.length}`);
if (!conferirUniverso("censo-de-instrumentos", "instrumentos", todos.length)) falhas++;
if (!conferirUniverso("censo-de-instrumentos", "no_portao", noPortao.length)) falhas++;

for (const arq of fora) {
  if (!ISENTOS[arq]) erro(`${arq} não está no test:all e não tem isenção — ou entra, ou vira isenção DATADA e JUSTIFICADA`);
  else if (!/^\d{4}-\d{2}-\d{2} · .{30,}/.test(ISENTOS[arq]))
    erro(`${arq} tem isenção sem data ou sem motivo suficiente`);
  else console.log(`  ⚠️ isento: ${arq} — ${ISENTOS[arq]}`);
}

// ── 3. CADA UM RODA DE FATO, E COM CÓDIGO QUE SIGNIFICA ALGUMA COISA
// ⚠️ 0 = passou · 1 = reprovou (as duas são respostas). Qualquer outro código é
// "não rodou": 127 é comando inexistente, 126 é sem permissão, 2 é erro de uso.
// Foi 127 que fez 53 instrumentos parecerem sem defeito na varredura de hoje.
console.log(`\n  executando ${todos.length - 1} instrumento(s)…`);
const naoRodaram = [];
for (const arq of todos) {
  if (arq === "censo-de-instrumentos.cjs") continue;
  const r = spawnSync(process.execPath, [path.join(RAIZ, "scripts", arq)], { cwd: RAIZ, encoding: "utf8", timeout: 300000 });
  const codigo = r.status;
  if (codigo !== 0 && codigo !== 1) {
    naoRodaram.push(`${arq} (código ${codigo === null ? `sinal ${r.signal}` : codigo})`);
  }
}
if (naoRodaram.length) erro(`instrumento(s) que NÃO RODARAM — código fora de {0,1}:\n     ${naoRodaram.join("\n     ")}`);

console.log(falhas
  ? `\n❌ ${falhas} falha(s) no censo`
  : `\n✅ ${todos.length} instrumentos · ${noPortao.length} no portão · ${fora.length} isento(s) com data e motivo · todos rodaram com código 0 ou 1`);
process.exit(falhas ? 1 : 0);
