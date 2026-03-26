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

compile(path.join(appDir, "acls", "canonical-audio-manifest.ts"));

const { ACLS_CANONICAL_AUDIO_MANIFEST } = requireCompiled([
  path.join(tempDir, "acls", "canonical-audio-manifest.js"),
  path.join(tempDir, "canonical-audio-manifest.js"),
]);
const cueSource = fs.readFileSync(path.join(appDir, "components", "web-audio-cues.ts"), "utf8");
const cueIds = [...cueSource.matchAll(/^\s*([a-z0-9_]+): require\(/gm)].map((match) => match[1]);
const expectedCueIds = ACLS_CANONICAL_AUDIO_MANIFEST.map((entry) => entry.key);
const errors = [];

for (const key of expectedCueIds) {
  if (!cueIds.includes(key)) {
    errors.push(`Cue canônica ausente em WEB_AUDIO_CUES: ${key}`);
  }

  const filePath = path.join(appDir, "assets", "audio", "final-acls", `${key}.mp3`);
  if (!fs.existsSync(filePath)) {
    errors.push(`Arquivo de áudio ausente: ${key}.mp3`);
  }
}

for (const cueId of cueIds) {
  if (!expectedCueIds.includes(cueId)) {
    errors.push(`Cue fora do catálogo canônico em WEB_AUDIO_CUES: ${cueId}`);
  }
}

if (errors.length > 0) {
  console.error("Validação ACLS áudio canônico falhou:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Catálogo ACLS de áudio canônico validado com sucesso.");
