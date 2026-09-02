#!/usr/bin/env node
/**
 * Inventário estático de sinais de reavaliação e destino nas árvores clínicas.
 *
 * Não decide se uma reavaliação é clinicamente suficiente. Apenas descobre onde
 * a árvore já declara nós/ações com linguagem de reavaliação e onde existem
 * nós de transição/destino, para que a revisão clínica trabalhe sobre o universo
 * real em vez de uma lista manual.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const files = fs
  .readdirSync(root)
  .filter((name) => /decision-tree\.ts$/i.test(name))
  .sort();

const reNode = /([A-Za-z0-9_]+):\s*\{[\s\S]{0,700}?id:\s*["']([^"']+)["'][\s\S]{0,700}?(reavali|reassess|resposta|response)/gi;
const transitionNode = /([A-Za-z0-9_]+):\s*\{[\s\S]{0,500}?id:\s*["']([^"']+)["'][\s\S]{0,300}?type:\s*["']transition["']/gi;
const destinationWords = /(alta|uti|observa|transfer|intern|destino|disposition|hemodin|centro cir)/i;

let totalRe = 0;
let totalDest = 0;
console.log("\nInventário — reavaliação e destino\n");

for (const file of files) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  const reavaliacoes = [];
  const destinos = [];

  for (const match of src.matchAll(reNode)) {
    const id = match[2];
    if (!reavaliacoes.includes(id)) reavaliacoes.push(id);
  }

  for (const match of src.matchAll(transitionNode)) {
    const id = match[2];
    const trecho = match[0];
    if (destinationWords.test(trecho) && !destinos.includes(id)) destinos.push(id);
  }

  if (!reavaliacoes.length && !destinos.length) continue;
  totalRe += reavaliacoes.length;
  totalDest += destinos.length;
  console.log(`• ${file}`);
  if (reavaliacoes.length) console.log(`  reavaliação: ${reavaliacoes.join(", ")}`);
  if (destinos.length) console.log(`  destino: ${destinos.join(", ")}`);
}

console.log(`\nTotal: ${totalRe} marcador(es) de reavaliação · ${totalDest} destino(s) detectado(s)\n`);
