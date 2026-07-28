#!/usr/bin/env node
/**
 * Nota de fase × cronômetro de epinefrina — coerência.
 *
 * Defeito reportado pelo usuário: a tela mostrava "PRÓXIMA ADRENALINA · Dose 5 ·
 * 51 s" e, logo abaixo, um card dizendo "Adrenalina 1 mg IV/IO agora". Duas
 * instruções contraditórias sobre a mesma droga, na mesma tela.
 *
 * Causa: a nota de fase era ESTÁTICA por estado (`rcp_2` sempre dizia "agora"),
 * enquanto o contador vinha da medicação real.
 *
 * Uso: npm run test:nota-epi
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "nota-epi-"));

execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "acls", "phase-notes.ts"),
], { cwd: appDir, stdio: "inherit" });

const { getPhaseNote } = require(path.join(tempDir, "acls", "phase-notes.js"));

let ok = 0;
const falhas = [];
const diz = (nota) => `${nota?.heading ?? ""} ${nota?.body ?? ""}`;

for (const estado of ["rcp_2", "nao_chocavel_ciclo"]) {
  // Com dose já dada e próxima AGENDADA, a nota não pode mandar dar agora.
  const comContador = getPhaseNote(estado, {
    adrenalineAdministeredCount: 3,
    adrenalineAguardandoProxima: true,
  });
  if (/agora/i.test(diz(comContador))) {
    falhas.push(`${estado}: nota diz "agora" com a próxima dose já agendada — ${comContador.heading}`);
  } else ok++;

  if (!/administrada/i.test(diz(comContador))) {
    falhas.push(`${estado}: nota deveria informar que a dose foi administrada`);
  } else ok++;

  // Sem dose dada, a orientação de administrar PRECISA aparecer.
  const semDose = getPhaseNote(estado, {
    adrenalineAdministeredCount: 0,
    adrenalineAguardandoProxima: false,
  });
  if (!/epinefrina/i.test(diz(semDose))) {
    falhas.push(`${estado}: sem dose dada, a nota deveria orientar a epinefrina`);
  } else ok++;

  // Dose dada mas JÁ DEVIDA de novo: aí sim pode mandar dar.
  const devida = getPhaseNote(estado, {
    adrenalineAdministeredCount: 2,
    adrenalineAguardandoProxima: false,
  });
  if (!/epinefrina/i.test(diz(devida))) {
    falhas.push(`${estado}: dose devida, a nota deveria orientar a epinefrina`);
  } else ok++;
}

console.log(`\n===== nota de epinefrina: ${ok} OK, ${falhas.length} falhas =====`);
if (falhas.length) {
  falhas.forEach((f) => console.error("  ✗ " + f));
  process.exit(1);
}
