const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const protocolSchemaPath = path.join(appDir, "acls", "protocol-schema.ts");
const protocolPath = path.join(appDir, "protocol.json");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "acls-validate-"));

execFileSync(
  "npx",
  [
    "tsc",
    "--module",
    "commonjs",
    "--target",
    "es2020",
    "--resolveJsonModule",
    "--esModuleInterop",
    "--moduleResolution",
    "node",
    "--outDir",
    tempDir,
    protocolSchemaPath,
  ],
  {
    cwd: appDir,
    stdio: "inherit",
  }
);

const { validateAclsProtocolDefinition } = require(path.join(tempDir, "protocol-schema.js"));
const protocol = JSON.parse(fs.readFileSync(protocolPath, "utf8"));
const validation = validateAclsProtocolDefinition(protocol);

if (!validation.valid) {
  console.error("Protocol ACLS inválido:");
  for (const error of validation.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Protocol ACLS validado com sucesso.");
