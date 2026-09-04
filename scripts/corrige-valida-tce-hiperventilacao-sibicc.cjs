#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const file = path.resolve(__dirname, "valida-tce.cjs");
let src = fs.readFileSync(file, "utf8");

const re = /\/\/ ── E\. A hiperventilação de 3ª linha:[\s\S]*?\n\/\/ ── F\. D-18:/;
if (!re.test(src)) {
  console.error("❌ Bloco E do validator TCE não localizado; reauditar valida-tce.cjs.");
  process.exit(1);
}

const replacement = `// ── E. Hiperventilação refratária: tiers SIBICC + fronteira BTF ────────────
{
  const refrataria = todos.find((t) => /HIPERVENTILAÇÃO NA HIC REFRATÁRIA/.test(t)) ?? "";
  if (!refrataria) {
    falhas.push("a hiperventilação refratária sumiu — o fluxo perdeu a separação entre resgate e profilaxia.");
  } else {
    for (const [nome, padrao, porque] of [
      ["tier 2 32–35", /PaCO₂ 32–35 mmHg.*tier 2/, "SIBICC usa hiperventilação leve neste intervalo no tier 2"],
      ["tier 3 30–32", /PaCO₂ 30–32 mmHg.*tier 3/, "a faixa mais baixa pertence ao resgate de tier 3"],
      ["condição de oxigenação cerebral", /somente quando não há hipoxia tecidual cerebral/, "o tier 3 mais agressivo não pode ignorar oxigenação cerebral"],
      ["piso de 30", /Evitar PaCO₂ <30 mmHg/, "abaixo de 30 aumenta risco de hipoperfusão cerebral"],
      ["fronteira BTF <=25", /NÃO usar PaCO₂ ≤25 mmHg de forma profilática ou prolongada/, "BTF contraindica hiperventilação profilática prolongada intensa"],
      ["reversão precoce", /reverter a hipocapnia assim que a medida de resgate deixar de ser necessária/, "hipocapnia de resgate não deve virar alvo crônico"],
    ]) {
      if (!padrao.test(refrataria)) falhas.push(\`hiperventilação refratária: \${nome} sumiu — \${porque}.\`);
      else ok++;
    }
  }
  if (/HIPERVENTILAÇÃO DE 3ª LINHA — PaCO₂ 25–34 mmHg/.test(todos.join("\\n"))) {
    falhas.push("o antigo alvo institucional 25–34 reapareceu como faixa genérica de 3ª linha.");
  } else ok++;
  const ponte = todos.find((t) => /ponte para herniação iminente/.test(t)) ?? "";
  if (!/30–35 mmHg/.test(ponte)) {
    falhas.push("a hiperventilação-ponte perdeu o 30–35 — ela continua separada do resgate escalonado da HIC.");
  } else ok++;
}

// ── F. D-18:`;

src = src.replace(re, replacement);
fs.writeFileSync(file, src);
console.log("✅ Validator legado TCE atualizado para a semântica SIBICC/BTF.");
