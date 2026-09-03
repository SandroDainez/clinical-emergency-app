#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

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

function numericValue(node) {
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
    return -Number(node.operand.text);
  }
  return null;
}

function containsNumeric(node, value) {
  let found = false;
  const visit = (n) => {
    if (found) return;
    if (numericValue(n) === value) {
      found = true;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(node);
  return found;
}

function isMathMin(node) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.expression.getText() === "Math" &&
    node.expression.name.text === "min"
  );
}

function hasWeightBasedMin(sourceFile, dose, max) {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (isMathMin(node) && node.arguments.length >= 2) {
      const hasDose = node.arguments.some((arg) => containsNumeric(arg, dose));
      const hasMax = node.arguments.some((arg) => numericValue(arg) === max);
      if (hasDose && hasMax) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function hasLocalWeightRuleObject(sourceFile, dose, max) {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (ts.isObjectLiteralExpression(node)) {
      const props = new Map();
      for (const prop of node.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const name = prop.name.getText().replace(/["']/g, "");
        const value = numericValue(prop.initializer);
        if (value !== null) props.set(name, value);
      }
      if (props.get("doseMgPerKg") === dose && props.get("maxDoseMg") === max) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
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
    const sourceFile = ts.createSourceFile(
      rel,
      text,
      ts.ScriptTarget.Latest,
      true,
      rel.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    );

    const duplicateFormula = hasWeightBasedMin(sourceFile, rule.doseMgPerKg, rule.maxDoseMg);
    const duplicateObject = hasLocalWeightRuleObject(sourceFile, rule.doseMgPerKg, rule.maxDoseMg);
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
