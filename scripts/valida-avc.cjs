#!/usr/bin/env node
/**
 * PROMETE
 *   Que o ROTEAMENTO por janela ofereça a trombólise guiada por imagem a quem a
 *   fonte torna elegível (conferido por EXECUÇÃO, não por leitura); que os dois
 *   critérios de imagem fiquem separados por exame e população; que o critério
 *   dos 9 h esteja no nó em que decide; e que os dois regimes de tenecteplase
 *   não se confundam.
 *
 * NÃO PROMETE
 *   Que as contraindicações estejam completas, nem que a conduta do AVC esteja
 *   auditada por inteiro — isto é a primeira auditoria do módulo, e a trava
 *   nasceu DEPOIS dela (R-21).
 *
 * UNIVERSO
 *   A árvore do AVC, a lib de imagem avançada e a de tenecteplase.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O FLUXO CONTRADIZIA O PRÓPRIO TEXTO. O nó de janela dizia que existe janela
 * estendida de 4,5–9 h e para o wake-up com mismatch — e o roteamento mandava
 * TODAS as janelas acima de 4,5 h direto para a trombectomia.
 *
 * O paciente que sumia é a população do ensaio: no WAKE-UP, oclusão de grande
 * vaso NÃO era exigida (só 33,7% tinham), e trombectomia planejada era critério
 * de EXCLUSÃO. Dois terços dos pacientes tratados não iriam para a sala.
 *
 * Nenhuma trava de texto pegaria: o texto estava certo. Só a execução do
 * roteamento revela — e é por isso que esta trava EXECUTA a função de escolha.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

// ── A. O ROTEAMENTO, POR EXECUÇÃO ─────────────────────────────────────────
{
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-avc-"));
  try {
    execFileSync(
      "npx",
      [
        "tsc", "--module", "node16", "--target", "es2020", "--esModuleInterop",
        "--moduleResolution", "node16", "--outDir", tempDir,
        path.join(appDir, "avc-decision-tree.ts"),
        path.join(appDir, "lib/trombolise-guiada-por-imagem.ts"),
      ],
      { cwd: appDir, stdio: "pipe" }
    );
  } catch (erro) {
    falhas.push(`a árvore do AVC não compilou — a conferência de roteamento NÃO RODOU: ${String(erro).slice(0, 160)}`);
  }

  let arvore;
  try {
    const mod = require(path.join(tempDir, "avc-decision-tree.js"));
    arvore = mod.avcDecisionTree ?? Object.values(mod)[0];
  } catch (erro) {
    falhas.push(`não consegui carregar a árvore compilada: ${String(erro).slice(0, 160)}`);
  }

  const janela = arvore?.nodes?.isq_janela;
  const escolher = janela?.next?.escolher;

  if (typeof escolher !== "function") {
    falhas.push(
      "o nó `isq_janela` não tem função `escolher` — o roteamento por janela mudou de forma, e esta " +
      "trava deixou de exercitar o que promete. Reescrever a trava, não removê-la."
    );
  } else {
    const ESPERADO = [
      ["< 3 h", "isq_contraindicacoes", "dentro de 4,5 h vai direto às contraindicações"],
      ["3–4,5 h", "isq_contraindicacoes", "dentro de 4,5 h vai direto às contraindicações"],
      ["4,5–6 h", "isq_imagem_avancada", "está INTEIRAMENTE dentro dos 9 h — janela estendida por perfusão"],
      ["6–24 h", "isq_imagem_avancada", "CRUZA os 9 h: de 6 a 9 h ainda há trombólise por perfusão"],
      ["desconhecido / ao acordar", "isq_imagem_avancada", "é a população do WAKE-UP — 2/3 sem oclusão de grande vaso"],
      ["", "isq_imagem_avancada", "sem janela informada, exigir imagem antes do trombolítico"],
    ];
    for (const [entrada, destino, porque] of ESPERADO) {
      let obtido;
      try {
        obtido = escolher({ janela: entrada });
      } catch (erro) {
        obtido = `ERRO: ${String(erro).slice(0, 80)}`;
      }
      if (obtido !== destino) {
        falhas.push(
          `roteamento da janela ${JSON.stringify(entrada)}: vai para "${obtido}", esperado ` +
          `"${destino}" — ${porque}. ⚠️ Mandar a janela estendida direto para a trombectomia faz o ` +
          `paciente do WAKE-UP sumir do fluxo sem receber nada, e o app já AFIRMA no texto que ele ` +
          `é elegível.`
        );
      } else ok++;
    }
  }

  // O nó novo existe e tem as duas saídas.
  const no = arvore?.nodes?.isq_imagem_avancada;
  if (!no) {
    falhas.push("o nó `isq_imagem_avancada` sumiu — a janela estendida deixou de ter caminho.");
  } else {
    const saidas = (no.options ?? []).map((o) => o.next);
    if (!saidas.includes("isq_contraindicacoes")) {
      falhas.push(
        "`isq_imagem_avancada` não leva mais às contraindicações da trombólise — quem tem mismatch " +
        "voltou a não receber trombolítico."
      );
    } else ok++;
    if (!saidas.includes("isq_trombectomia_check")) {
      falhas.push("`isq_imagem_avancada` não leva mais à trombectomia — quem não tem mismatch fica sem saída.");
    } else ok++;
  }
}

// ── B. Os DOIS critérios, separados por exame e população (R-36) ──────────
{
  const lib = limpo("lib/trombolise-guiada-por-imagem.ts");
  for (const [nome, padrao] of [
    ["DWI-FLAIR exige RM", /EXIGE RESSONÂNCIA/],
    ["perfusão aceita TC", /A TC DE PERFUSÃO SERVE/],
    ["os critérios de perfusão (core, razão, penumbra)", /core isquêmico < 70 mL[\s\S]{0,80}1,2[\s\S]{0,60}10 mL/],
    ["o critério dos 9 h", /TERMINA EM 9 h/],
    ["quem vai para trombectomia SAI", /critério de EXCLUSÃO/],
    ["a ausência dos dois exames", /SEM RM E SEM TC DE PERFUSÃO/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `lib/trombolise-guiada-por-imagem: ${nome} sumiu. Fundir os dois critérios manda procurar o ` +
        `exame que o hospital não tem, e o médico conclui "não elegível" quando existe outro caminho.`
      );
    } else ok++;
  }
}

// ── C. Contraindicações: relativas, conduta do meio, rótulo do botão ──────
{
  const arv = limpo("avc-decision-tree.ts");
  for (const [nome, padrao] of [
    ["as contraindicações RELATIVAS", /CONTRAINDICAÇÕES RELATIVAS/],
    ["a conduta com relativa e sem absoluta", /COM RELATIVA E SEM ABSOLUTA/],
    ["o rótulo do botão falando de ABSOLUTA", /Sem contraindicação ABSOLUTA/],
    ["o déficit não incapacitante como a relativa que decide contra", /não incapacitante é a única relativa/],
  ]) {
    if (!padrao.test(arv)) {
      falhas.push(
        `avc-decision-tree: ${nome} sumiu. Perguntar só por absolutas e rotular a saída como "sem ` +
        `contraindicação" faz o médico responder "não" tendo uma relativa na frente.`
      );
    } else ok++;
  }
}

// ── D. Os dois regimes de tenecteplase não se confundem (R-36) ────────────
{
  const tnk = limpo("lib/tenecteplase.ts");
  for (const [nome, padrao] of [
    ["o regime do IAM", /TNK NO IAM/],
    ["o regime do AVC com teto 25", /TETO DE 25 mg/],
    ["a consequência nas DUAS direções", /subdosa a reperfusão[\s\S]{0,120}hemorragia intracraniana/],
  ]) {
    if (!padrao.test(tnk)) {
      falhas.push(
        `lib/tenecteplase: ${nome} sumiu. O teto difere por DUAS VEZES entre os dois cenários, e a ` +
        `confusão erra nos dois sentidos.`
      );
    } else ok++;
  }
  if (!/TENECTEPLASE_REGIME_AVC/.test(semImports("avc-decision-tree.ts"))) {
    falhas.push("avc-decision-tree: não consome TENECTEPLASE_REGIME_AVC.");
  } else ok++;
  if (!/TENECTEPLASE_REGIME_IAM/.test(semImports("coronary-decision-tree.ts"))) {
    falhas.push("coronary-decision-tree: não consome TENECTEPLASE_REGIME_IAM.");
  } else ok++;
}

// ── E. O marco do último-visto-bem, que o módulo já acertava ──────────────
{
  const arv = limpo("avc-decision-tree.ts");
  if (!/último momento visto bem/.test(arv)) {
    falhas.push(
      "avc-decision-tree: sumiu o marco do ÚLTIMO MOMENTO VISTO BEM. É o precedente de D-17 do app " +
      "inteiro — contar do início percebido dos sintomas alarga a janela e trombolisa fora dela."
    );
  } else ok++;
}

console.log("\nAVC isquêmico — o roteamento oferece o que o texto promete\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — rota verificada por execução, critérios separados, regimes rotulados\n`);
process.exit(0);
