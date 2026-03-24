const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "acls-audio-"));

function requireCompiled(possiblePaths) {
  for (const compiledPath of possiblePaths) {
    if (fs.existsSync(compiledPath)) {
      return require(compiledPath);
    }
  }

  throw new Error(`Arquivo compilado não encontrado. Tentativas: ${possiblePaths.join(", ")}`);
}

function compile(sourcePath) {
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
      sourcePath,
    ],
    { cwd: appDir, stdio: "inherit" }
  );
}

compile(path.join(appDir, "acls", "audio-script.ts"));

const { ACLS_AUDIO_SCRIPT } = requireCompiled([
  path.join(tempDir, "acls", "audio-script.js"),
  path.join(tempDir, "audio-script.js"),
]);
const protocol = JSON.parse(fs.readFileSync(path.join(appDir, "protocol.json"), "utf8"));
const cueSource = fs.readFileSync(path.join(appDir, "components", "web-audio-cues.ts"), "utf8");
const cueIds = [...cueSource.matchAll(/^\s*([a-z0-9_]+): require\(/gm)].map((match) => match[1]);

const expected = { ...ACLS_AUDIO_SCRIPT };
const stateIds = Object.keys(protocol.states);
const errors = [];

for (const stateId of stateIds) {
  if (["choque_2", "choque_3"].includes(stateId)) {
    continue;
  }

  if (!expected[stateId]) {
    errors.push(`Falta texto esperado para cue/state ${stateId}`);
    continue;
  }

  const protocolText = protocol.states[stateId].speak || protocol.states[stateId].text;
  if (expected[stateId] !== protocolText) {
    errors.push(`Texto divergente para ${stateId}`);
  }
}

for (const cueId of cueIds) {
  if (!expected[cueId]) {
    errors.push(`Cue sem texto esperado no manifesto: ${cueId}`);
  }
}

for (const cueId of Object.keys(expected)) {
  const filePath = path.join(appDir, "assets", "audio", "final-acls", `${cueId}.mp3`);
  if (!fs.existsSync(filePath)) {
    errors.push(`Arquivo de áudio ausente: ${cueId}.mp3`);
  }
}

if (errors.length > 0) {
  console.error("Validação ACLS áudio/script falhou:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Sincronização ACLS áudio/script validada com sucesso.");
