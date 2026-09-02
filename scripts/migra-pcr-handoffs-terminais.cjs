#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const paths = {
  tachy: path.join(raiz, "acls-tachycardia-tree.ts"),
  brady: path.join(raiz, "acls-bradycardia-tree.ts"),
  transitions: path.join(raiz, "lib/clinical-transition-contracts.ts"),
  targets: path.join(raiz, "lib/clinical-target-semantics.ts"),
  debts: path.join(raiz, "clinical-safety-cases/target-promotion-debts.ts"),
};

for (const [nome, arquivo] of Object.entries(paths)) {
  if (!fs.existsSync(arquivo)) throw new Error(`Arquivo ${nome} não encontrado: ${arquivo}`);
}

const original = Object.fromEntries(
  Object.entries(paths).map(([nome, arquivo]) => [nome, fs.readFileSync(arquivo, "utf8")]),
);
const next = { ...original };

function nodeRange(source, nodeId) {
  const marker = `    ${nodeId}: {`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Nó ${nodeId} não encontrado`);

  const tail = source.slice(start + marker.length);
  const sibling = tail.match(/\n    [A-Za-z0-9_]+:\s*\{/);
  const end = sibling ? start + marker.length + sibling.index : source.length;
  return { start, end, node: source.slice(start, end) };
}

function replaceDispositionInNode(source, nodeId) {
  const { start, end, node } = nodeRange(source, nodeId);
  if (node.includes('disposition: "other_module"')) return source;
  if (!node.includes('disposition: "icu"')) {
    throw new Error(`${nodeId}: disposition esperado \"icu\" não encontrado no nó completo`);
  }

  const migrated = node.replace('disposition: "icu"', 'disposition: "other_module"');
  return source.slice(0, start) + migrated + source.slice(end);
}

function removeObjectById(source, id) {
  const marker = `    id: "${id}",`;
  const idIndex = source.indexOf(marker);
  if (idIndex < 0) return source;
  const objectStart = source.lastIndexOf("  {\n", idIndex);
  if (objectStart < 0) throw new Error(`Início do objeto ${id} não encontrado`);
  const objectEnd = source.indexOf("\n  },", idIndex);
  if (objectEnd < 0) throw new Error(`Fim do objeto ${id} não encontrado`);
  return source.slice(0, objectStart) + source.slice(objectEnd + "\n  },".length);
}

next.tachy = replaceDispositionInNode(next.tachy, "unstable_sem_pulso");
next.brady = replaceDispositionInNode(next.brady, "bradi_sem_pulso");

const transitionInsertion = `  {\n    id: "taquicardia-sem-pulso-pcr-terminal",\n    from: "acls_tachycardia_2025",\n    to: "pcr-adulto",\n    trigger: "Perda de pulso durante taquiarritmia ou após cardioversão",\n    mode: "terminal",\n    destinationKind: "module",\n    preserves: [\n      "ritmo_pre_parada",\n      "energia_ultima_cardioversao",\n      "numero_cardioversoes",\n      "antiarritmico_em_curso",\n      "tempo_perda_pulso",\n      "suspeita_causa_reversivel",\n    ],\n  },\n  {\n    id: "bradicardia-sem-pulso-pcr-terminal",\n    from: "acls_bradycardia_2025",\n    to: "pcr-adulto",\n    trigger: "Perda de pulso durante bradicardia grave ou durante suporte cronotrópico/marcapasso",\n    mode: "terminal",\n    destinationKind: "module",\n    preserves: [\n      "ritmo_pre_parada",\n      "atropina_administrada",\n      "marcapasso_em_uso",\n      "captura_marcapasso",\n      "cronotropico_em_curso",\n      "tempo_perda_pulso",\n      "suspeita_causa_reversivel",\n    ],\n  },\n`;

if (!next.transitions.includes('id: "taquicardia-sem-pulso-pcr-terminal"')) {
  const anchor = "] as const;";
  const at = next.transitions.lastIndexOf(anchor);
  if (at < 0) throw new Error("Final do registry de transições não encontrado");
  next.transitions = next.transitions.slice(0, at) + transitionInsertion + next.transitions.slice(at);
}
if (!next.transitions.includes('id: "bradicardia-sem-pulso-pcr-terminal"')) {
  throw new Error("Contrato terminal de bradicardia não foi inserido");
}

// Os IDs dos targets são históricos e permanecem sem o sufixo -terminal.
next.targets = removeObjectById(next.targets, "taquicardia-sem-pulso-pcr");
next.targets = removeObjectById(next.targets, "bradicardia-sem-pulso-pcr");
next.debts = removeObjectById(next.debts, "tachy-pulseless-to-pcr");
next.debts = removeObjectById(next.debts, "brady-pulseless-to-pcr");

const invariants = [
  [nodeRange(next.tachy, "unstable_sem_pulso").node, 'disposition: "other_module"', "taquicardia: handoff não promovido"],
  [nodeRange(next.brady, "bradi_sem_pulso").node, 'disposition: "other_module"', "bradicardia: handoff não promovido"],
  [next.transitions, 'id: "taquicardia-sem-pulso-pcr-terminal"', "contrato terminal de taquicardia ausente"],
  [next.transitions, 'id: "bradicardia-sem-pulso-pcr-terminal"', "contrato terminal de bradicardia ausente"],
  [next.transitions, '"energia_ultima_cardioversao"', "contexto de cardioversão não preservado"],
  [next.transitions, '"captura_marcapasso"', "contexto de marcapasso não preservado"],
];
for (const [source, token, message] of invariants) {
  if (!source.includes(token)) throw new Error(message);
}

if (next.targets.includes('id: "taquicardia-sem-pulso-pcr"') || next.targets.includes('id: "bradicardia-sem-pulso-pcr"')) {
  throw new Error("Target promovido permaneceu no registry de targets");
}
if (next.debts.includes('id: "tachy-pulseless-to-pcr"') || next.debts.includes('id: "brady-pulseless-to-pcr"')) {
  throw new Error("Dívida de promoção permaneceu aberta após a migração preparada");
}

// A política de não atrasar PCR vive no contrato de contexto/orquestrador,
// não no ClinicalTransitionContract. Esta migração apenas torna a aresta real.
const pcrContext = fs.readFileSync(path.join(raiz, "lib/pcr-terminal-handoff-context.ts"), "utf8");
for (const token of [
  'transitionId: "taquicardia-sem-pulso-pcr-terminal"',
  'transitionId: "bradicardia-sem-pulso-pcr-terminal"',
  'transferPolicy: "do_not_delay_destination"',
]) {
  if (!pcrContext.includes(token)) throw new Error(`Contrato PCR atual sem ${token}`);
}

// Só escreve depois que TODAS as transformações e invariantes passaram.
for (const [nome, arquivo] of Object.entries(paths)) {
  if (next[nome] !== original[nome]) fs.writeFileSync(arquivo, next[nome], "utf8");
}

console.log("Handoffs terminais taquicardia/bradicardia → PCR migrados com contexto preservado.");
