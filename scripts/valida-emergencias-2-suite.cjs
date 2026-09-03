#!/usr/bin/env node
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const validators = [
  "valida-emergencias-2-core.cjs",
  "valida-classificacao-de-modulos.cjs",
  "valida-roadmap-vs-codigo.cjs",
  "valida-cabecalho-de-calculadoras.cjs",
  "valida-cabecalho-de-referencias.cjs",
  "valida-engasgo-padrao-fluxo.cjs",
  "valida-clinical-shell-adapter.cjs",
  "valida-clinical-shell-host.cjs",
  "valida-clinical-shell-host-pos-migracao.cjs",
  "valida-input-observation-binding.cjs",
  "valida-observacao-stale-por-decisao.cjs",
  "valida-guided-discovery-contracts.cjs",
  "valida-guided-discovery-ui.cjs",
  "valida-guided-discovery-hic-stemi.cjs",
  "valida-clinical-transition-contracts.cjs",
  "valida-navegacao-contextual-acls.cjs",
  "valida-event-log-medication-disposition.cjs",
  "valida-cobertura-other-module-registry.cjs",
  "valida-targets-versus-handoffs.cjs",
  "valida-terminal-semantic-debts.cjs",
  "valida-missing-terminal-disposition-debts.cjs",
  "valida-module-terminal-classification.cjs",
  "valida-external-terminal-handoffs.cjs",
  "valida-clinical-handoff-assembler.cjs",
  "valida-clinical-handoff-payload.cjs",
  "valida-clinical-reassessment-bindings.cjs",
  "valida-clinical-reassessment-runtime.cjs",
  "valida-clinical-reassessment-cockpit.cjs",
  "valida-decision-uncertainty-policy.cjs",
  "valida-uncertainty-classification.cjs",
  "valida-casos-executaveis-emergencias-2.cjs",
  "valida-casos-piloto-emergencias-2.cjs",
  "valida-handoff-executaveis-emergencias-2.cjs",
  "valida-interrupcoes-aninhadas-emergencias-2.cjs",
  "valida-tree-to-handoff-emergencias-2.cjs",
];

for (const validator of validators) {
  const result = spawnSync(process.execPath, [path.join(__dirname, validator)], {
    cwd: root,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`\n✅ Emergências 2: ${validators.length} validadores estruturais aprovados.\n`);
