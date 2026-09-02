#!/usr/bin/env node
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cp = require("node:child_process");

const root = path.resolve(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "emergencias2-gates-"));
const outDir = path.join(temp, "out");
const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");

if (!fs.existsSync(tsc)) {
  console.error("❌ TypeScript local não encontrado em node_modules/typescript/bin/tsc");
  process.exit(1);
}

const include = [
  "clinical-safety-cases/gate-action-triggers.ts",
  "clinical-safety-cases/gate-context-observations.ts",
  "lib/clinical-action-gate.ts",
  "lib/clinical-gate-context-adapter.ts",
  "lib/clinical-gate-policy.ts",
  "lib/clinical-gate-registry.ts",
  "lib/clinical-gate-trigger.ts",
  "lib/clinical-gate-trigger-registry.ts",
  "lib/clinical-gate-runtime.ts",
  "lib/clinical-safety-override.ts",
  "lib/clinical-event-log.ts",
  "lib/clinical-observations.ts",
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

  const triggerCompiled = path.join(outDir, "clinical-safety-cases", "gate-action-triggers.js");
  const contextCompiled = path.join(outDir, "clinical-safety-cases", "gate-context-observations.js");
  const { runExecutableClinicalGateTriggerCases } = require(triggerCompiled);
  const { runExecutableClinicalGateContextCases } = require(contextCompiled);
  if (typeof runExecutableClinicalGateTriggerCases !== "function") {
    throw new Error("runner compilado não exporta runExecutableClinicalGateTriggerCases");
  }
  if (typeof runExecutableClinicalGateContextCases !== "function") {
    throw new Error("runner compilado não exporta runExecutableClinicalGateContextCases");
  }

  const issues = [
    ...runExecutableClinicalGateTriggerCases(),
    ...runExecutableClinicalGateContextCases(),
  ];
  if (issues.length) {
    console.error("\n❌ casos executáveis de safety gate falharam\n");
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log("\n✅ safety gates passaram: ativação por ação, autorização/override e contexto temporal sem inferência de dado ausente/stale.\n");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
