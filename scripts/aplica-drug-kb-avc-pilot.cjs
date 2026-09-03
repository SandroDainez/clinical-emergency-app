#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const write = (rel, content) => fs.writeFileSync(path.join(root, rel), content);

function replaceOnce(content, before, after, label) {
  if (content.includes(after)) return content;
  const count = content.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrado ${count}`);
  return content.replace(before, after);
}

// 1) Contrato: cálculo estruturado é propriedade da instrução/indicação, não do fármaco global.
{
  const rel = "lib/drug-knowledge/types.ts";
  let s = read(rel);
  s = replaceOnce(
    s,
    "export type DrugInstruction = {\n",
    `export type WeightBasedDrugCalculation = {\n  kind: \"weight_based\";\n  doseMgPerKg: number;\n  maxDoseMg: number;\n  roundingStepMg: number;\n  bolusOnly: boolean;\n};\n\nexport type DrugInstruction = {\n`,
    `${rel}: adicionar WeightBasedDrugCalculation`
  );
  s = replaceOnce(
    s,
    "  maximum?: string;\n",
    "  maximum?: string;\n  /** Regra computável específica desta indicação; nunca derivada por parsing do texto humano. */\n  calculation?: WeightBasedDrugCalculation;\n",
    `${rel}: ligar cálculo à indicação`
  );
  write(rel, s);
}

// 2) Fonte canônica: regra AVC estruturada, com os mesmos valores já validados no legado.
{
  const rel = "lib/drug-knowledge/tenecteplase.ts";
  let s = read(rel);
  s = replaceOnce(
    s,
    'import type { CanonicalDrug } from "./types";\n',
    `import type { CanonicalDrug, WeightBasedDrugCalculation } from \"./types\";\n\nexport const TENECTEPLASE_AVC_WEIGHT_BASED: WeightBasedDrugCalculation = Object.freeze({\n  kind: \"weight_based\",\n  doseMgPerKg: 0.25,\n  maxDoseMg: 25,\n  roundingStepMg: 0.1,\n  bolusOnly: true,\n});\n`,
    `${rel}: criar regra estruturada AVC`
  );
  s = replaceOnce(
    s,
    '      maximum: "25 mg",\n',
    '      maximum: "25 mg",\n      calculation: TENECTEPLASE_AVC_WEIGHT_BASED,\n',
    `${rel}: vincular regra à indicação AVC`
  );
  write(rel, s);
}

// 3) Consumidor real: derive do fluxo clássico usa a Drug KB, preservando round1 e fallback.
{
  const rel = "avc-decision-tree.ts";
  let s = read(rel);
  s = replaceOnce(
    s,
    'import { TENECTEPLASE_APRESENTACAO, TENECTEPLASE_REGIME_AVC } from "./lib/tenecteplase";\n',
    'import { TENECTEPLASE_APRESENTACAO, TENECTEPLASE_REGIME_AVC } from "./lib/tenecteplase";\nimport { TENECTEPLASE_AVC_WEIGHT_BASED } from "./lib/drug-knowledge/tenecteplase";\n',
    `${rel}: importar regra canônica`
  );
  s = replaceOnce(
    s,
    "    out.tnkDose = round1(Math.min(0.25 * peso, 25));\n",
    `    out.tnkDose = round1(\n      Math.min(\n        TENECTEPLASE_AVC_WEIGHT_BASED.doseMgPerKg * peso,\n        TENECTEPLASE_AVC_WEIGHT_BASED.maxDoseMg\n      )\n    );\n`,
    `${rel}: migrar cálculo TNK`
  );
  write(rel, s);
}

// 4) Configuração do módulo também deixa de duplicar a regra numérica.
{
  const rel = "avc/protocol-config.ts";
  let s = read(rel);
  if (!s.includes('from "../lib/drug-knowledge/tenecteplase"')) {
    s = `import { TENECTEPLASE_AVC_WEIGHT_BASED } from \"../lib/drug-knowledge/tenecteplase\";\n${s}`;
  }
  s = replaceOnce(
    s,
    `    id: \"tenecteplase\",\n    label: \"Tenecteplase\",\n    doseMgPerKg: 0.25,\n    maxDoseMg: 25,\n    roundingStepMg: 0.1,\n    bolusOnly: true,\n`,
    `    id: \"tenecteplase\",\n    label: \"Tenecteplase\",\n    doseMgPerKg: TENECTEPLASE_AVC_WEIGHT_BASED.doseMgPerKg,\n    maxDoseMg: TENECTEPLASE_AVC_WEIGHT_BASED.maxDoseMg,\n    roundingStepMg: TENECTEPLASE_AVC_WEIGHT_BASED.roundingStepMg,\n    bolusOnly: TENECTEPLASE_AVC_WEIGHT_BASED.bolusOnly,\n`,
    `${rel}: migrar configuração TNK`
  );
  write(rel, s);
}

// 5) TypeScript 6: o validador compila arquivos isolados e deve declarar resolução moderna explicitamente.
{
  const rel = "scripts/valida-avc.cjs";
  let s = read(rel);
  s = replaceOnce(
    s,
    '        "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",\n        "--moduleResolution", "node", "--outDir", tempDir,\n',
    '        "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--esModuleInterop",\n        "--moduleResolution", "node16", "--outDir", tempDir,\n',
    `${rel}: compatibilidade com TypeScript 6`
  );
  write(rel, s);
}

// 6) A trava entra na suíte estrutural do Emergências 2.
{
  const rel = "scripts/valida-emergencias-2-suite.cjs";
  let s = read(rel);
  s = replaceOnce(
    s,
    '  "valida-tree-to-handoff-emergencias-2.cjs",\n',
    '  "valida-tree-to-handoff-emergencias-2.cjs",\n  "valida-drug-kb-avc-pilot.cjs",\n',
    `${rel}: registrar validação do piloto`
  );
  write(rel, s);
}

console.log("✅ Migração Drug KB → AVC aplicada de forma idempotente.");
