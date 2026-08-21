#!/usr/bin/env node
/**
 * O CICLO DE MUTAÇÃO, COMO FERRAMENTA — porque como regra ele falhou três vezes.
 *
 * PROMETE: executar o ciclo inteiro sem que ninguém decida nada no meio —
 *   copiar o alvo para FORA da árvore do git, mutar, rodar o instrumento,
 *   restaurar DA CÓPIA, e falhar se a árvore não voltar ao estado inicial.
 * NÃO PROMETE: que a mutação seja a certa. Escolher a mutação PLAUSÍVEL — a
 *   correção que um revisor competente faria — continua sendo trabalho de quem
 *   audita (R-80).
 * UNIVERSO: um arquivo por execução.
 *
 * ── ⚠️ POR QUE FERRAMENTA, E NÃO MAIS UM REGISTRO ──────────────────────────
 *
 * O R-47 foi violado TRÊS VEZES EM 2026-08-21, no mesmo dia em que ganhou forma
 * operacional. A terceira apagou oitenta linhas não commitadas de
 * `scripts/valida-ira.cjs`, porque o arquivo era RASTREADO e o `git checkout`
 * funcionou: executou, saiu limpo, e levou junto tudo desde o último commit.
 *
 * **Uma regra que depende de alguém lembrar dela já falhou três vezes.**
 * Registrar uma quarta não muda a taxa — a decisão sai da cabeça e vira passo.
 *
 * ── ⚠️ `git checkout` E `git restore` NÃO EXISTEM AQUI ──────────────────────
 *
 * Para arquivo novo são inúteis (não restauram o que não está rastreado); para
 * arquivo rastreado são destrutivos (desfazem até o último commit, não até antes
 * da mutação). **Não há terceiro caso.** Este script restaura da CÓPIA, sempre.
 *
 * USO:
 *   node scripts/muta.cjs --alvo <arquivo> --de <texto> --para <texto> \
 *                         --instrumento "npm run test:x" [--espera falha|verde]
 *   node scripts/muta.cjs --alvo <arquivo> --patch <arquivo.py> --instrumento ...
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");

const app = path.resolve(__dirname, "..");
const arg = (nome, padrao) => {
  const i = process.argv.indexOf(`--${nome}`);
  return i > -1 ? process.argv[i + 1] : padrao;
};

const alvo = arg("alvo");
const de = arg("de");
const para = arg("para");
const instrumento = arg("instrumento");
const espera = arg("espera", "falha");
// ⚠️ ESCAPE HATCH DE TESTE, e ele existe para o script poder ser provado contra
// si mesmo: com --sem-conferencia-final o passo 5 não roda. Um script de mutação
// que não se prova é mais um proxy (R-87).
const semConferencia = process.argv.includes("--sem-conferencia-final");

if (!alvo || !instrumento || (de === undefined && !arg("patch"))) {
  console.log("uso: node scripts/muta.cjs --alvo <arq> --de <texto> --para <texto> --instrumento <cmd> [--espera falha|verde]");
  process.exit(2);
}

const caminho = path.join(app, alvo);
if (!fs.existsSync(caminho)) {
  console.log(`\n❌ alvo não existe: ${alvo}\n`);
  process.exit(1);
}

// ── 0 · O ESTADO INICIAL DA ÁRVORE, para comparar no fim ───────────────────
const statusAntes = execSync("git status --short", { cwd: app }).toString();

// ── 1 · CÓPIA FORA DA ÁRVORE DO GIT ────────────────────────────────────────
const cofre = fs.mkdtempSync(path.join(os.tmpdir(), "muta-"));
const backup = path.join(cofre, path.basename(alvo) + ".bak");
fs.copyFileSync(caminho, backup);

const original = fs.readFileSync(caminho, "utf8");
let resultado = { codigo: null, saida: "" };
let erroDeMutacao = null;

try {
  // ── 2 · A MUTAÇÃO ────────────────────────────────────────────────────────
  if (de !== undefined) {
    const ocorrencias = original.split(de).length - 1;
    if (ocorrencias !== 1) {
      throw new Error(
        `o texto de origem aparece ${ocorrencias}× no alvo — a mutação precisa ser inequívoca ` +
        `(0 = não casou; 2+ = mutaria mais de um lugar).`
      );
    }
    fs.writeFileSync(caminho, original.replace(de, para ?? ""));
  }

  // ── 3 · O INSTRUMENTO ────────────────────────────────────────────────────
  try {
    resultado.saida = execSync(instrumento, { cwd: app, stdio: "pipe" }).toString();
    resultado.codigo = 0;
  } catch (e) {
    resultado.saida = `${e.stdout ?? ""}${e.stderr ?? ""}`;
    resultado.codigo = e.status ?? 1;
  }
} catch (e) {
  erroDeMutacao = e;
} finally {
  // ── 4 · RESTAURA DA CÓPIA — NUNCA DE `git` ──────────────────────────────
  fs.copyFileSync(backup, caminho);
}

// ── 5 · A ÁRVORE VOLTOU AO ESTADO INICIAL? ─────────────────────────────────
//
// ⚠️ NENHUMA TRAVA CONHECE O ESTADO ANTERIOR DA ÁRVORE. Esta comparação é a
// única que enxerga "a mutação não voltou" — um `??` a mais, um ` M` inesperado.
let voltou = true;
if (!semConferencia) {
  const statusDepois = execSync("git status --short", { cwd: app }).toString();
  const conteudoIgual = fs.readFileSync(caminho, "utf8") === original;
  voltou = statusDepois === statusAntes && conteudoIgual;
  if (!voltou) {
    console.log("\n❌ A ÁRVORE NÃO VOLTOU AO ESTADO INICIAL — pare e confira à mão.\n");
    console.log("   antes:\n" + (statusAntes || "   (limpa)"));
    console.log("   depois:\n" + (statusDepois || "   (limpa)"));
    console.log(`   conteúdo do alvo idêntico ao original: ${conteudoIgual}`);
  }
}

fs.rmSync(cofre, { recursive: true, force: true });

if (erroDeMutacao) {
  console.log(`\n❌ mutação não aplicada: ${erroDeMutacao.message}\n`);
  process.exit(1);
}

const obtido = resultado.codigo === 0 ? "verde" : "falha";
const conforme = obtido === espera;
const linhaDeFalha = resultado.saida.split("\n").find((l) => /❌/.test(l)) ?? "";

console.log("\nCICLO DE MUTAÇÃO (R-47, como ferramenta)\n");
console.log(`   arquivo:     ${alvo}`);
console.log(`   mutação:     « ${String(de).slice(0, 70)} » → « ${String(para ?? "").slice(0, 70)} »`);
console.log(`   instrumento: ${instrumento}`);
console.log(`   esperado:    ${espera}`);
console.log(`   obtido:      ${obtido}${linhaDeFalha ? `  ${linhaDeFalha.trim().slice(0, 100)}` : ""}`);
console.log(`   árvore restaurada: ${semConferencia ? "NÃO CONFERIDA (--sem-conferencia-final)" : voltou ? "sim" : "NÃO"}`);

if (!conforme) {
  console.log(`\n❌ o instrumento não reagiu como esperado — ele pode estar olhando o lugar errado (R-87).\n`);
  process.exit(1);
}
if (!voltou) process.exit(1);
console.log("\n✅ mutação provada e árvore intacta\n");
