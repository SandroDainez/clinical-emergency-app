#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "emergencias2-tree-handoff-"));
const entry = path.join(root, "clinical-safety-cases", "handoff-trajetorias-executaveis.ts");

function collectTsFiles(startFile) {
  const seen = new Set();
  const files = [];

  function visit(file) {
    const normalized = path.resolve(file);
    if (seen.has(normalized)) return;
    seen.add(normalized);
    files.push(normalized);
    const src = fs.readFileSync(normalized, "utf8");
    const re = /from\s+["']([^"']+)["']/g;
    let m;
    while ((m = re.exec(src))) {
      if (!m[1].startsWith(".")) continue;
      const base = path.resolve(path.dirname(normalized), m[1]);
      const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
      const found = candidates.find((candidate) => fs.existsSync(candidate));
      if (found) visit(found);
    }
  }

  visit(startFile);
  return files;
}

const files = collectTsFiles(entry);
const program = ts.createProgram(files, {
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  esModuleInterop: true,
  skipLibCheck: true,
  strict: false,
  outDir,
  rootDir: root,
});

const diagnostics = ts.getPreEmitDiagnostics(program);
if (diagnostics.length) {
  for (const diag of diagnostics) {
    const msg = ts.flattenDiagnosticMessageText(diag.messageText, "\n");
    if (diag.file && diag.start != null) {
      const pos = diag.file.getLineAndCharacterOfPosition(diag.start);
      console.error(`${path.relative(root, diag.file.fileName)}:${pos.line + 1}:${pos.character + 1} ${msg}`);
    } else console.error(msg);
  }
  process.exit(1);
}

const emit = program.emit();
if (emit.emitSkipped) process.exit(1);

const compiled = path.join(outDir, "clinical-safety-cases", "handoff-trajetorias-executaveis.js");
const { runExecutableTreeToHandoffCases } = require(compiled);
const issues = runExecutableTreeToHandoffCases();
if (issues.length) {
  console.error("\n❌ trajetórias árvore → handoff falharam\n");
  for (const issue of issues) console.error(`- ${issue}`);
  process.exit(1);
}
console.log("\n✅ trajetórias árvore → perda de pulso → handoff → PCR passaram.\n");
