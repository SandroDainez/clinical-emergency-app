#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'sedation-engine.ts'), 'utf8');
const es = fs.readFileSync(path.join(root, 'lib/i18n/modules/sedacao.ts'), 'utf8');
const falhas = [];
let ok = 0;
function tem(hay, needle, label) {
  if (!hay.includes(needle)) falhas.push(label); else ok++;
}
function naoTem(hay, needle, label) {
  if (hay.includes(needle)) falhas.push(label); else ok++;
}

tem(src, 'P/F < 150', 'BNM/SDRA deve declarar o critério P/F < 150 da SCCM 2026.');
tem(src, 'hipoxemia persistente e/ou metas ventilatórias não atingidas apesar da sedação', 'BNM/SDRA deve exigir falha fisiológica apesar da sedação, não apenas diagnóstico de SDRA.');
tem(src, 'estratégia fixa quanto estratégia titulada', 'Cisatracúrio deve reconhecer estratégias fixa e titulada da SCCM 2026.');
tem(src, 'não estabelece TOF como obrigação universal', 'TOF não pode permanecer como obrigação universal em toda estratégia fixa.');
naoTem(src, 'Monitorar com TOF obrigatoriamente.', 'Texto antigo de TOF obrigatório não pode reaparecer.');
naoTem(src, 'BNM de escolha para infusão prolongada em UTI', 'Cisatracúrio não pode ser apresentado como escolha universal de UTI.');
naoTem(src, '✅ BNM de escolha em UTI para infusão prolongada.', 'Rótulo absoluto de escolha em UTI não pode reaparecer.');
tem(src, 'SCCM Guideline for Neuromuscular Blockade in Adults With ARDS, 2026', 'Referência SCCM 2026 deve permanecer explícita no cisatracúrio.');
tem(es, 'La guía SCCM 2026 sugiere BNM', 'Tradução ES deve carregar a atualização SCCM 2026.');
tem(es, 'no establece el TOF como obligación universal', 'Tradução ES deve preservar a nuance de TOF.');

if (falhas.length) {
  console.error('\nBNM/SDRA SCCM 2026 — falhas:\n');
  for (const f of falhas) console.error(`❌ ${f}`);
  process.exit(1);
}
console.log(`\n✅ BNM/SDRA SCCM 2026: ${ok} verificações aprovadas.\n`);
