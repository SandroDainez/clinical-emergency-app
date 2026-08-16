#!/usr/bin/env node
/**
 * PROMETE
 *   Que a meta de PAS no TCE saia de UMA fonte (texto e lógica), com a
 *   estratificação por idade IMPLEMENTADA; que o damage control diga QUANDO
 *   abreviar e que a decisão é intraoperatória; e que as quatro causas de não
 *   resposta estejam nomeadas, com o padrão invertido do neurogênico.
 *
 * NÃO PROMETE
 *   Cobertura do XABCDE inteiro — ele foi auditado e estava correto, e travar
 *   um algoritmo que a fonte fixa seria fotografar o que já está certo.
 *
 * UNIVERSO
 *   As árvores de politrauma e TCE (as duas exibem a meta) e as libs novas.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A D-1 VOLTAR. O texto estratificava por idade e a lógica aplicava 110
 *    liso: um paciente de 60 anos com PAS 105 estava na meta pelo que lia e era
 *    marcado como hipotenso pela derivação. Agora os dois saem da mesma fonte —
 *    e esta trava confere a LÓGICA por execução, não o texto por leitura.
 *
 * 2. O DAMAGE CONTROL VOLTAR A SER CONCEITO SEM CRITÉRIO. A única porta era o
 *    botão "não respondeu", que é resposta hemodinâmica: quem espera por ela já
 *    passou do ponto, porque a decisão é INTRAOPERATÓRIA.
 *
 * 3. O NEUROGÊNICO SUMIR. O botão "não respondeu" leva direto à sala — e um
 *    neurogênico puro vai para laparotomia atrás de sangramento que não existe.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs.readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

// ── A. D-1: a lógica, POR EXECUÇÃO ────────────────────────────────────────
{
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-politrauma-"));
  let limiar;
  try {
    execFileSync("npx", [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--outDir", tempDir,
      path.join(appDir, "lib/pas-no-tce.ts"),
    ], { cwd: appDir, stdio: "pipe" });
    limiar = require(path.join(tempDir, "pas-no-tce.js")).limiarDePasNoTce;
  } catch (erro) {
    falhas.push(`lib/pas-no-tce não compilou — a conferência da D-1 NÃO RODOU: ${String(erro).slice(0, 140)}`);
  }

  if (typeof limiar !== "function") {
    falhas.push("`limiarDePasNoTce` não é exportada — a estratificação da D-1 deixou de existir como lógica.");
  } else {
    const ESPERADO = [
      [30, 110, "15–49 anos"],
      [49, 110, "limite superior da faixa jovem"],
      [50, 100, "início da faixa 50–69 — é aqui que a D-1 doía"],
      [60, 100, "o caso da dívida: PAS 105 estava na meta pelo texto e era hipotenso pela lógica"],
      [69, 100, "limite superior da faixa intermediária"],
      [70, 110, "acima de 70 volta a 110"],
      [undefined, 110, "sem idade informada: sobre-triagem, a direção tolerável"],
    ];
    for (const [idade, esperado, porque] of ESPERADO) {
      const obtido = limiar(idade);
      if (obtido !== esperado) {
        falhas.push(`limiarDePasNoTce(${idade}) = ${obtido}, esperado ${esperado} — ${porque}.`);
      } else ok++;
    }
  }

  // A derivação do politrauma consome a função, e não um número liso.
  if (!/limiarDePasNoTce\(v\.idadeParaMetaDePas\)/.test(limpo("politrauma-decision-tree.ts"))) {
    falhas.push(
      "politrauma-decision-tree: a derivação voltou a usar limiar fixo. A D-1 é exatamente isto — " +
      "texto que estratifica e lógica que não."
    );
  } else ok++;

  // E o campo local existe (sem depender do contexto compartilhado, D-7).
  if (!/id: "idadeParaMetaDePas"/.test(limpo("politrauma-decision-tree.ts"))) {
    falhas.push("politrauma-decision-tree: sumiu o campo local de idade — sem ele a estratificação não tem entrada.");
  } else ok++;
}

// ── B. UMA fonte para o texto, nos dois módulos ───────────────────────────
{
  for (const rel of ["politrauma-decision-tree.ts", "tce-decision-tree.ts"]) {
    if (/BTF: ≥ 110 para 15–49/.test(limpo(rel))) {
      falhas.push(
        `${rel}: a estratificação voltou a ser texto solto. Fechar a lógica e deixar textos soltos ` +
        `recria a D-1 pelo outro lado — a próxima correção de redação faz o par divergir de novo.`
      );
    } else ok++;
    if (!/PAS_TCE_META|PAS_TCE_LIMIAR_CURTO/.test(semImports(rel))) {
      falhas.push(`${rel}: não consome a fonte única da meta de PAS no TCE.`);
    } else ok++;
  }

  if (!/PAS_TCE_POR_QUE_NAO_VALE_A_PERMISSIVA/.test(semImports("politrauma-decision-tree.ts"))) {
    falhas.push(
      "politrauma-decision-tree: sumiu a ressalva de que a hipotensão permissiva NÃO vale no TCE. " +
      "Havendo hemorragia E lesão cerebral, a meta do cérebro manda."
    );
  } else ok++;
}

// ── C. Damage control: o critério, e que a decisão é intraoperatória ──────
{
  const lib = limpo("lib/trauma-nao-responde.ts");
  for (const [nome, padrao] of [
    ["que a decisão é INTRAOPERATÓRIA", /A DECISÃO É INTRAOPERATÓRIA/],
    ["o aviso de que esperar o 'não respondeu' já passou do ponto", /já passou do ponto/],
    ["a hipotermia como sinal", /< 35 °C/],
    ["a acidose como sinal", /pH < 7,2/],
    ["a coagulopatia CLÍNICA, que aparece antes do exame", /sangramento difuso em superfície cruenta/],
    ["que a reoperação é o plano, não a falha", /reoperação programada é o plano, não a falha/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `lib/trauma-nao-responde: ${nome} sumiu. Sem o critério, o app descreve damage control e não ` +
        `diz quando abreviar — e a única porta vira a resposta hemodinâmica, que chega tarde.`
      );
    } else ok++;
  }
  if (!/DAMAGE_CONTROL_QUANDO_ABREVIAR/.test(semImports("politrauma-decision-tree.ts"))) {
    falhas.push("politrauma-decision-tree: não consome DAMAGE_CONTROL_QUANDO_ABREVIAR.");
  } else ok++;
}

// ── D. As quatro causas, e o neurogênico nos dois sentidos ───────────────
{
  const lib = limpo("lib/trauma-nao-responde.ts");
  for (const [nome, padrao] of [
    ["as quatro causas de não resposta", /são QUATRO explicações/],
    ["o padrão invertido do neurogênico", /hipotensão COM BRADICARDIA/],
    ["o aviso de que a bradicardia é descartada como artefato", /artefato do monitor/],
    ["a consequência de errar para um lado", /vai para laparotomia/],
    ["⚠️ e para o OUTRO — o padrão não exclui sangramento", /NÃO EXCLUI SANGRAMENTO/],
    ["o mecanismo do mascaramento", /MASCARA a taquicardia/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `lib/trauma-nao-responde: ${nome} sumiu. O par tem de vir nas DUAS direções — tratar ` +
        `neurogênico como hemorrágico leva à sala sem motivo; o inverso deixa o sangramento sem ` +
        `tratamento, e o tônus perdido esconde a taquicardia que o denunciaria.`
      );
    } else ok++;
  }
  if (!/TRAUMA_CHOQUE_NEUROGENICO/.test(semImports("politrauma-decision-tree.ts"))) {
    falhas.push("politrauma-decision-tree: não consome TRAUMA_CHOQUE_NEUROGENICO.");
  } else ok++;
}

console.log("\nPolitrauma — a D-1 fechada por execução, o critério de abreviar e as quatro causas\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — texto e lógica na mesma fonte, e o neurogênico nos dois sentidos\n`);
process.exit(0);
