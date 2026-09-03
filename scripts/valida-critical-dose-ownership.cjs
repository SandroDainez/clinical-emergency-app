#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const ownership = JSON.parse(
  fs.readFileSync(path.join(root, "lib/drug-knowledge/critical-dose-ownership.json"), "utf8")
);

const fail = (message) => {
  console.error(`❌ Critical dose ownership: ${message}`);
  process.exit(1);
};
const expect = (condition, message) => {
  if (!condition) fail(message);
};

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", ".expo", "dist", "auditoria", "scripts"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Remove comentários e conteúdo de strings/templates, preservando o esqueleto
 * executável. Assim textos clínicos como "0,25 mg/kg (máx 25)" não contam como
 * duplicação computacional. Não é parser TypeScript: é deliberadamente um
 * detector estreito das formas que queremos proibir depois que uma regra ganha
 * ownership exclusivo na Drug KB.
 */
function stripNonExecutable(text) {
  let out = "";
  let i = 0;
  let state = "code";
  let quote = null;

  while (i < text.length) {
    const c = text[i];
    const n = text[i + 1];

    if (state === "line-comment") {
      if (c === "\n") {
        state = "code";
        out += "\n";
      } else out += " ";
      i += 1;
      continue;
    }

    if (state === "block-comment") {
      if (c === "*" && n === "/") {
        out += "  ";
        i += 2;
        state = "code";
      } else {
        out += c === "\n" ? "\n" : " ";
        i += 1;
      }
      continue;
    }

    if (state === "string") {
      if (c === "\\") {
        out += "  ";
        i += 2;
        continue;
      }
      if (c === quote) {
        out += " ";
        i += 1;
        state = "code";
        quote = null;
        continue;
      }
      out += c === "\n" ? "\n" : " ";
      i += 1;
      continue;
    }

    if (c === "/" && n === "/") {
      out += "  ";
      i += 2;
      state = "line-comment";
      continue;
    }
    if (c === "/" && n === "*") {
      out += "  ";
      i += 2;
      state = "block-comment";
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      state = "string";
      out += " ";
      i += 1;
      continue;
    }

    out += c;
    i += 1;
  }

  return out;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasExclusiveFormula(code, dose, max) {
  const d = escapeRegExp(dose);
  const m = escapeRegExp(max);
  const numberBoundary = "(?![0-9.])";

  // Detecta Math.min(0.25 * peso, 25) e variantes com expressão em qualquer
  // lado, sem exigir nome específico para a variável de peso.
  const minCalls = [...code.matchAll(/Math\s*\.\s*min\s*\(([^)]{0,240})\)/g)];
  for (const match of minCalls) {
    const args = match[1];
    const hasDoseMultiplication = new RegExp(`(?:^|[^0-9.])${d}${numberBoundary}\\s*\\*|\\*\\s*${d}${numberBoundary}`).test(args);
    const hasMaxLiteral = new RegExp(`(?:^|[^0-9.])${m}${numberBoundary}`).test(args);
    if (hasDoseMultiplication && hasMaxLiteral) return true;
  }

  return false;
}

function hasExclusiveRuleObject(code, dose, max) {
  const d = escapeRegExp(dose);
  const m = escapeRegExp(max);
  const objects = [...code.matchAll(/\{[^{}]{0,900}\}/g)];
  return objects.some(({ 0: body }) => {
    const hasDose = new RegExp(`doseMgPerKg\\s*:\\s*${d}(?![0-9.])`).test(body);
    const hasMax = new RegExp(`maxDoseMg\\s*:\\s*${m}(?![0-9.])`).test(body);
    return hasDose && hasMax;
  });
}

expect(Array.isArray(ownership.rules) && ownership.rules.length > 0, "registry sem regras");

const files = sourceFiles(root);
for (const rule of ownership.rules) {
  expect(rule.status === "exclusive", `${rule.ruleId}: status não é exclusive`);
  expect(rule.canonicalFile && rule.canonicalSymbol, `${rule.ruleId}: owner canônico incompleto`);

  const canonicalPath = path.join(root, rule.canonicalFile);
  expect(fs.existsSync(canonicalPath), `${rule.ruleId}: arquivo canônico não existe`);
  const canonical = fs.readFileSync(canonicalPath, "utf8");
  expect(canonical.includes(rule.canonicalSymbol), `${rule.ruleId}: símbolo canônico ausente`);
  expect(canonical.includes(`doseMgPerKg: ${rule.doseMgPerKg}`), `${rule.ruleId}: dose/kg canônica divergiu`);
  expect(canonical.includes(`maxDoseMg: ${rule.maxDoseMg}`), `${rule.ruleId}: teto canônico divergiu`);

  for (const full of files) {
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    if (rel === rule.canonicalFile) continue;

    const text = fs.readFileSync(full, "utf8");
    const code = stripNonExecutable(text);
    const duplicateFormula = hasExclusiveFormula(code, rule.doseMgPerKg, rule.maxDoseMg);
    const duplicateObject = hasExclusiveRuleObject(code, rule.doseMgPerKg, rule.maxDoseMg);
    if (duplicateFormula || duplicateObject) {
      fail(`${rule.ruleId}: regra computacional duplicada fora da Drug KB em ${rel}`);
    }
  }

  for (const consumer of rule.allowedConsumers || []) {
    const consumerPath = path.join(root, consumer);
    expect(fs.existsSync(consumerPath), `${rule.ruleId}: consumidor declarado não existe: ${consumer}`);
    const text = fs.readFileSync(consumerPath, "utf8");
    expect(
      text.includes(rule.canonicalSymbol),
      `${rule.ruleId}: consumidor ${consumer} não referencia ${rule.canonicalSymbol}`
    );
  }
}

console.log(`✅ Critical dose ownership: ${ownership.rules.length} regra(s) exclusiva(s) protegida(s) sem duplicação computacional fora da Drug KB.`);
