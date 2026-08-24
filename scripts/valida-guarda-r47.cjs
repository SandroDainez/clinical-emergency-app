#!/usr/bin/env node
/**
 * PROMETE: que o guarda do R-47 esteja de pé — `git checkout` e `git restore`
 *   falham dentro de um ciclo de mutação, `git status` e `git diff` continuam
 *   funcionando, e o `muta.cjs` RECUSA iniciar com a árvore suja.
 * NÃO PROMETE: que ninguém mute à mão, fora do harness. O guarda do PATH só
 *   alcança o que o `muta.cjs` dispara — e as quatro violações foram todas fora
 *   dele. É a pré-condição de árvore limpa que cobre esse caso, e por isso as
 *   duas metades existem.
 * UNIVERSO: o shim `scripts/guarda-r47/git` e o `scripts/muta.cjs`. Cada
 *   tentativa é executada de verdade, não inspecionada por regex.
 * ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-24) — R-118, R-128, R-133.
 *
 * ── ⚠️ POR QUE DUAS METADES ─────────────────────────────────────────────────
 *
 * **O PATH mata o verbo dentro do ciclo; a árvore limpa mata o estrago em
 * qualquer lugar.** `git checkout` só destrói o que não está salvo — se a árvore
 * estava limpa, um checkout perdido não custa nada (R-133).
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { spawnSync } = require("child_process");

const RAIZ = path.resolve(__dirname, "..");
const GUARDA = path.join(__dirname, "guarda-r47");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };
const ok = (m) => console.log(`   ✅ ${m}`);

// ── 1 · O SHIM EXISTE E É EXECUTÁVEL
{
  const shim = path.join(GUARDA, "git");
  if (!fs.existsSync(shim)) erro(`o guarda não existe em ${path.relative(RAIZ, shim)}`);
  else if (!(fs.statSync(shim).mode & 0o111)) erro(`o guarda existe mas não é executável — no PATH, um arquivo sem bit de execução é ignorado em silêncio`);
  else ok("o shim existe e é executável");
}

// ── 2 · DENTRO DO CICLO: `checkout` e `restore` FALHAM, com a razão
const comGuarda = { ...process.env, PATH: `${GUARDA}:${process.env.PATH}` };
for (const verbo of ["checkout", "restore"]) {
  const r = spawnSync("git", [verbo, "--"], { cwd: RAIZ, encoding: "utf8", env: comGuarda });
  if (r.status !== 47)
    erro(`dentro do ciclo, \`git ${verbo}\` saiu com ${r.status} — deveria ser 47. O guarda não está de pé, e a regra volta a depender de alguém lembrar.`);
  else if (!/R-47/.test(r.stderr ?? ""))
    erro(`\`git ${verbo}\` falhou sem dizer o que fazer no lugar — falhar alto é uma das três propriedades exigidas`);
  else ok(`dentro do ciclo, \`git ${verbo}\` recusa com 47 e diz o que fazer`);
}

// ── 3 · `status` e `diff` CONTINUAM PASSANDO
//
// ⚠️ Tão importante quanto o bloqueio: são eles que conferem a mutação. Guarda
// que bloqueia tudo obriga a ser desligado — e desligado ele não guarda nada.
// ⚠️ CADA VERBO COM O SEU ARGUMENTO. A primeira versão mandava `--short` para os
// dois, e `git diff --short` não existe: o teste acusou o guarda por um erro
// meu, e o código 129 era do git reclamando do MEU comando.
for (const [verbo, ...args] of [["status", "--short"], ["diff", "--stat"]]) {
  const r = spawnSync("git", [verbo, ...args], { cwd: RAIZ, encoding: "utf8", env: comGuarda });
  if (r.status !== 0 && r.status !== 1)
    erro(`\`git ${verbo}\` deixou de funcionar dentro do ciclo (código ${r.status}) — a conferência da mutação depende dele`);
  else ok(`\`git ${verbo}\` continua funcionando dentro do ciclo`);
}

// ── 4 · FORA DO CICLO, O GIT É O GIT
{
  const r = spawnSync("git", ["status", "--short"], { cwd: RAIZ, encoding: "utf8" });
  if (r.status !== 0) erro(`fora do ciclo o git não funciona — o guarda vazou para o ambiente`);
  else ok("fora do ciclo o git é o git: o guarda não vazou");
}

// ── 5 · ÁRVORE SUJA RECUSA O CICLO (R-133)
{
  const sujo = path.join(RAIZ, "scripts", ".guarda-r47-teste-sujo.tmp");
  fs.writeFileSync(sujo, "arquivo temporário do teste do guarda\n");
  try {
    const r = spawnSync(process.execPath, [path.join(RAIZ, "scripts", "muta.cjs"),
      "--alvo", "package.json", "--de", "x", "--para", "y", "--instrumento", "true"],
      { cwd: RAIZ, encoding: "utf8" });
    const saida = `${r.stdout ?? ""}${r.stderr ?? ""}`;
    if (r.status === 0) erro(`5 · o muta.cjs ACEITOU iniciar com a árvore suja — um \`git checkout\` perdido apagaria o trabalho não salvo (R-133)`);
    else if (!/R-133|árvore está suja/.test(saida)) erro(`5 · o muta.cjs recusou, mas sem dizer que foi pela árvore suja: « ${saida.slice(0, 90)} »`);
    else ok("com a árvore suja, o muta.cjs recusa iniciar e diz por quê");
  } finally {
    fs.unlinkSync(sujo);
  }
}

console.log(falhas ? `\n❌ ${falhas} falha(s)` : `\n✅ o guarda do PATH e a pré-condição de árvore limpa estão de pé`);
process.exit(falhas ? 1 : 0);
