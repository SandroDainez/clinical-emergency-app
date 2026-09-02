#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const root = path.resolve(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "emergencias2-handoff-"));
const outDir = path.join(temp, "out");
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

if (!fs.existsSync(tsc)) {
  console.error("❌ TypeScript local não encontrado em node_modules/typescript/bin/tsc");
  process.exit(1);
}

const include = [
  "clinical-safety-cases/handoff-executaveis.ts",
  "lib/clinical-event-log.ts",
  "lib/clinical-observations.ts",
  "lib/clinical-handoff-payload.ts",
  "lib/clinical-handoff-contract.ts",
  "lib/clinical-handoff-runtime.ts",
  "lib/clinical-handoff-assembler.ts",
  "lib/clinical-handoff-orchestrator.ts",
  "lib/pcr-terminal-handoff-context.ts",
];

const tsconfig = {
  compilerOptions: {
    target: "ES2020",
    module: "CommonJS",
    moduleResolution: "Node",
    esModuleInterop: true,
    skipLibCheck: true,
    strict: true,
    rootDir: root,
    outDir,
  },
  files: include.map((file) => path.join(root, file)),
};

const tsconfigPath = path.join(temp, "tsconfig.json");
fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2), "utf8");

try {
  cp.execFileSync(process.execPath, [tsc, "-p", tsconfigPath], {
    cwd: root,
    stdio: "inherit",
  });

  const compiled = path.join(outDir, "clinical-safety-cases", "handoff-executaveis.js");
  if (!fs.existsSync(compiled)) throw new Error(`arquivo compilado ausente: ${compiled}`);

  const { runExecutableClinicalHandoffCases } = require(compiled);
  if (typeof runExecutableClinicalHandoffCases !== "function") {
    throw new Error("runner compilado não exporta runExecutableClinicalHandoffCases");
  }

  const issues = runExecutableClinicalHandoffCases();
  if (issues.length) {
    console.error("\n❌ trajetórias executáveis de handoff falharam\n");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log("\n✅ trajetórias executáveis de handoff passaram: complete→publish→consume-once; incomplete→no-publish; observation precedence.\n");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
