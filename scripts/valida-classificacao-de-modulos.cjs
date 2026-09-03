#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const catalog = fs.readFileSync(path.join(root, "clinical-modules.ts"), "utf8");
const hub = fs.readFileSync(path.join(root, "components/module-hub.tsx"), "utf8");

const entries = [...catalog.matchAll(/id:\s*"([^"]+)"[\s\S]*?route:\s*"([^"]+)"[\s\S]*?presentation:\s*"(flow|reference|calculator)"/g)]
  .map((match) => ({ id: match[1], route: match[2], presentation: match[3] }));

if (entries.length !== 31) throw new Error(`Catálogo deve classificar 31 módulos; classificou ${entries.length}.`);
if (new Set(entries.map((item) => item.id)).size !== entries.length) throw new Error("Classificação contém módulo duplicado.");

const counts = entries.reduce((acc, item) => {
  acc[item.presentation] = (acc[item.presentation] ?? 0) + 1;
  if (item.route !== `/modulos/${item.id}`) throw new Error(`${item.id}: rota diverge do id canônico.`);
  return acc;
}, {});

for (const [kind, expected] of [["flow", 22], ["reference", 5], ["calculator", 4]]) {
  if (counts[kind] !== expected) throw new Error(`${kind}: esperados ${expected}, encontrados ${counts[kind] ?? 0}.`);
}

for (const id of ["bradicardia-acls", "taquicardia-acls", "ovace-adulto"]) {
  const item = entries.find((entry) => entry.id === id);
  if (item?.presentation !== "flow") {
    throw new Error(`${id}: contém decisão/progressão assistencial e deve permanecer classificado como flow.`);
  }
}

if (!hub.includes('a.presentation === "flow"') || !hub.includes('b.presentation === "flow"')) {
  throw new Error("Hub voltou a inferir função do módulo por rótulo visual.");
}
if (/SO_CONSULTA|ehConsulta/.test(hub)) throw new Error("Hub ainda mantém classificação textual duplicada.");

console.log("✅ Catálogo canônico: 31 módulos classificados em 22 fluxos, 5 referências e 4 calculadoras.");
