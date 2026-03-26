const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "acls-microcopy-"));

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

function flattenStrings(value, collector = []) {
  if (typeof value === "string") {
    collector.push(value);
    return collector;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => flattenStrings(item, collector));
  }

  return collector;
}

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function extractQuotedStrings(source) {
  return [...source.matchAll(/["'`]([^"'`\n]{2,})["'`]/g)].map((match) => match[1].trim());
}

function extractDirectTextNodes(source) {
  return [...source.matchAll(/<Text[^>]*>\s*([^<{][^<]{1,80}?)\s*<\/Text>/g)].map((match) =>
    match[1].trim()
  );
}

function isCandidateVisibleString(value) {
  if (!value || value.length < 3) {
    return false;
  }

  if (value.includes("{") || value.includes("}") || value.includes("=>")) {
    return false;
  }

  if (/[./#]/.test(value) || value.includes("://") || value.includes("/")) {
    return false;
  }

  if (/^(pt-BR|loading|idle|ready|error|all|drugs|shocks|rhythm|voice|causes)$/.test(value)) {
    return false;
  }

  if (/^#?[0-9a-f]{3,8}$/i.test(value)) {
    return false;
  }

  if (!/[A-Za-zÀ-ÿ]/.test(value)) {
    return false;
  }

  return /\s/.test(value) || /[À-ÿ]/.test(value) || /^[A-ZÀ-Ý][a-zà-ÿ]/.test(value);
}

compile(path.join(appDir, "acls", "microcopy.ts"));
compile(path.join(appDir, "acls", "speech-map.ts"));

const { ACLS_COPY } = require(path.join(tempDir, "microcopy.js"));
const { SPEECH_MAP } = require(path.join(tempDir, "speech-map.js"));

const warnings = [];
const forbiddenPatterns = [
  /\bverificar\b/i,
  /\bverifique\b/i,
  /\bveja\b/i,
  /\badministrar\b/i,
  /\badministre\b/i,
];

const operationalStrings = flattenStrings(ACLS_COPY.operational);
const allowedOperationalStrings = new Set([
  ...operationalStrings,
  ...Object.values(SPEECH_MAP),
  "Atualizar",
  "Atualizando",
]);

for (const value of operationalStrings) {
  if (countWords(value) > 4) {
    warnings.push(`Microcopy operacional com mais de 4 palavras: "${value}"`);
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(value)) {
      warnings.push(`Microcopy operacional com sinônimo proibido: "${value}"`);
      break;
    }
  }
}

for (const [key, value] of Object.entries(SPEECH_MAP)) {
  if (countWords(value) > 4) {
    warnings.push(`SPEECH_MAP com mais de 4 palavras em ${key}: "${value}"`);
  }

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(value)) {
      warnings.push(`SPEECH_MAP com sinônimo proibido em ${key}: "${value}"`);
      break;
    }
  }
}

const operationalComponentFiles = [
  path.join(appDir, "components", "protocol-screen", "acls-protocol-screen.tsx"),
  path.join(appDir, "components", "protocol-screen", "protocol-header-card.tsx"),
  path.join(appDir, "components", "protocol-screen", "acls-ai-assistant-card.tsx"),
  path.join(appDir, "components", "protocol-screen", "template", "VoiceStatusPanel.tsx"),
  path.join(appDir, "components", "protocol-screen", "voice-command-card.tsx"),
];

for (const filePath of operationalComponentFiles) {
  const source = fs.readFileSync(filePath, "utf8");
  const candidates = [...extractQuotedStrings(source), ...extractDirectTextNodes(source)]
    .map((item) => item.trim())
    .filter(isCandidateVisibleString);

  for (const value of candidates) {
    const isCopyReference = allowedOperationalStrings.has(value);
    const isTechnical = value.startsWith("ACLS") || value.startsWith("IA ");

    if (!isCopyReference && !isTechnical) {
      warnings.push(`String operacional hardcoded fora do ACLS_COPY em ${path.relative(appDir, filePath)}: "${value}"`);
    }
  }
}

if (warnings.length > 0) {
  console.error("Validação de microcopy ACLS encontrou problemas:");
  warnings.forEach((warning) => console.error(`- ${warning}`));
  process.exit(1);
}

console.log("Microcopy ACLS validada com sucesso.");
