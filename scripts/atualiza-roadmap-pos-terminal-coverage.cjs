#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const file = path.join(root, "EMERGENCIAS-2-ROADMAP.md");
let source = fs.readFileSync(file, "utf8");

const replacements = [
  [
    "- [ ] Substituir navegações improvisadas progressivamente.",
    "- [x] Navegações clínicas com proveniência (`from_module`) migradas para executores canônicos; a UI assistencial não monta mais essa proveniência manualmente."
  ],
  [
    "- [ ] Ligar `disposition` à UI apenas onde houver confirmação explícita de transferência/destino; entrada em nó terminal não basta.",
    "- [x] `disposition` ligado à UI apenas após confirmação explícita em dois tempos de transferência terminal externa; entrada no nó não registra destino e repetição do toque não duplica o evento."
  ],
  [
    "- [ ] Continuar classificando os demais achados reais do inventário.",
    "- [x] Todos os módulos `flow` do catálogo possuem classificação terminal explícita; PCR e OVACE usam `crisis_pathway` para não inventar alta/UTI ou retorno artificial."
  ],
  [
    "- [ ] Garantir cobertura terminal/retorno para todos os módulos e arestas reais.",
    "- [x] Cobertura terminal dos 22 fluxos do catálogo é auditada no CI; linhas de cuidado, subfluxos, caminhos embutíveis e fluxos de crise têm semântica própria."
  ],
];

for (const [from, to] of replacements) {
  if (source.includes(to)) continue;
  if (!source.includes(from)) throw new Error(`Roadmap sem marcador esperado: ${from}`);
  source = source.replace(from, to);
}

fs.writeFileSync(file, source);
console.log("✅ Roadmap sincronizado com navegação canônica, disposition explícito e cobertura terminal 22/22.");
// one-shot sync trigger: 2026-09-03
