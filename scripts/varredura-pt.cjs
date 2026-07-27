#!/usr/bin/env node
/**
 * Varredura exaustiva de texto em português no código VIVO do app.
 *
 * Por que existe: a checagem antiga só perguntava se as chamadas tr() já
 * existentes tinham tradução — e por isso dizia "faltando 0" com o app inteiro
 * em português. Aqui o critério é outro: extrai TODO literal com prosa em
 * português, esteja ele dentro de tr() ou não, e confronta com os dicionários.
 *
 * Uso:  node scripts/varredura-pt.cjs [--json <arquivo>]
 * Saída: por arquivo, as frases sem tradução em es-419; código de saída 1 se
 * houver pendências.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DICT_DIR = path.join(ROOT, "lib", "i18n", "modules");

// Diretórios que não fazem parte do código vivo de tela.
const SKIP_DIRS = new Set([
  "node_modules", ".git", "dist", ".expo", "web-build", "scripts",
  "__tests__", "coverage", "android", "ios",
  // Testes E2E: texto em português é descrição de teste, não tela do app.
  "e2e", "test-results", "playwright-report",
]);
// Arquivos que SÃO tradução (não devem ser varridos como origem).
const isDictFile = (p) =>
  p.includes(path.join("lib", "i18n")) || p.includes(path.join("acls", "locales"));

/**
 * Fontes em português cujo par em espanhol existe por CHAVE, não por dicionário
 * de texto: o áudio/TTS do ACLS resolve por cueId em locales/es-419/speech-cues.ts
 * e o reconhecimento de voz por locales/es-419/voice-phrases.ts. Varrer o texto PT
 * desses arquivos gera falso positivo — o espanhol já existe, só não é indexado
 * pela string portuguesa.
 */
const BY_KEY_SOURCES = new Set([
  "acls/voice-intents.ts",          // phrases + panelLabel → voice-phrases.ts
  "acls/speech-map.ts",             // mapa de cueId
  "acls/canonical-audio-manifest.ts", // texto dos MP3 → speech-cues.ts
  "acls/voice-resolver.ts",         // padrões de reconhecimento → voice-phrases.ts
]);

/**
 * Português que NÃO é texto de tela e por isso não entra na tradução.
 * Cada entrada precisa do motivo — sem isso a lista vira gaveta de exceção.
 */
const NAO_E_TELA = new Set([
  // Prompt de sistema do LLM, roda no servidor e nunca aparece ao médico.
  "supabase/functions/acls-assistant/index.ts",
  // console.log de diagnóstico + nome de voz do TTS ("google português" é
  // identificador de voz do navegador, não frase traduzível).
  "components/audio-session.ts",
  // Erros de validação de schema dirigidos ao desenvolvedor.
  "acls/protocol-schema.ts",
  // Preços em reais. Traduzir aqui seria errado: cobrar em espanhol exige
  // decisão de moeda e valor, não tradução. Fica em aberto de propósito.
  "lib/subscription.ts",
]);
/**
 * Mensagem de efeito SPEAK: falada por cueId (nunca renderizada como texto).
 * Reconhecida por estar num campo `message:` até 10 linhas depois de
 * `type: "SPEAK"`.
 */
/**
 * Mensagem de violação de invariante: erro lançado para o desenvolvedor
 * (throwInvariantViolation), nunca exibido ao médico.
 */
function isInvariantMessage(lines, lit) {
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(lit)) continue;
    for (let j = Math.max(0, i - 8); j < i; j++) {
      if (/throwInvariantViolation\(/.test(lines[j])) return true;
    }
  }
  return false;
}

function isSpeakMessage(lines, lit) {
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(lit)) continue;
    if (!/^\s*message:/.test(lines[i])) continue;
    for (let j = Math.max(0, i - 10); j < i; j++) {
      if (/type:\s*"SPEAK"/.test(lines[j])) return true;
    }
  }
  return false;
}

/**
 * Pista de que o literal é português. Acento resolve a maioria dos casos, mas
 * não todos: "Assinar plano anual" e "Cancele a qualquer momento" passaram
 * batido na primeira versão por não terem acento nem cair na lista curta de
 * palavras. A lista abaixo cobre função gramatical (artigo, preposição,
 * conjunção, verbo comum) — é o que distingue prosa de identificador.
 */
const PT_HINT = new RegExp(
  "[ãõçáéíóúâêôàÁÉÍÓÚÂÊÔÃÕÇ]|\\b(" +
    [
      // artigos, preposições e conjunções
      "não", "para", "com", "após", "sem", "conforme", "quando", "caso",
      "de", "da", "do", "das", "dos", "na", "no", "nas", "nos", "em", "ao",
      "aos", "pelo", "pela", "que", "ou", "se", "como", "entre", "sobre",
      "até", "cada", "todo", "toda", "todos", "todas", "qualquer", "outro",
      // verbos e formas frequentes na interface clínica
      "deve", "dose", "usar", "manter", "iniciar", "avaliar", "considerar",
      "registrar", "confirmar", "assinar", "cancele", "cancelar", "seguir",
      "repetir", "aplicar", "checar", "revisar", "monitorar", "solicitar",
      "preencher", "informe", "selecione", "escolher", "voltar", "abrir",
      "salvar", "enviar", "buscar", "acesse", "toque", "clique",
    ].join("|") +
    ")\\b",
  "i"
);

/** Um literal só interessa se parece frase de tela, não identificador/código. */
function isProse(s) {
  if (s.length < 4 || s.length > 4000) return false;
  if (!/\s/.test(s)) return false;                 // palavra única → id/rótulo técnico
  if (!PT_HINT.test(s)) return false;
  if (/^[\s\d.,:;%/+-]*$/.test(s)) return false;   // só números/pontuação
  if (/^(https?:|data:|#|\.\/|\.\.\/|@)/.test(s)) return false;
  if (/^[a-z-]+=[^\s=]/.test(s)) return false;     // string de configuração (chave=valor)
  // Inglês: a lista de pistas tem palavras que também existem em inglês ("no",
  // "de", "se"). Sem acento e com duas ou mais palavras só-inglesas, é mensagem
  // de desenvolvedor, não texto de tela em português.
  if (!/[ãõçáéíóúâêôàÁÉÍÓÚÂÊÔÃÕÇ]/.test(s)) {
    const en = (s.match(
      /\b(the|has|have|is|are|was|were|be|been|node|nodes|target|targets|declared|and|of|to|from|with|this|that|must|should|invalid|missing|expected)\b/gi
    ) || []).length;
    if (en >= 2) return false;
  }
  if (/[{}<>]\s*$/.test(s) && /\$\{/.test(s)) return false; // fragmento de template
  // Chaves desbalanceadas = pedaço de interpolação capturado por engano
  // (ex.: `: "texto"}` vindo de um ternário dentro de template literal).
  const open = (s.match(/\{/g) || []).length;
  const close = (s.match(/\}/g) || []).length;
  if (close > open) return false;
  return true;
}

function collectFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") && e.name !== ".") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      collectFiles(p, out);
    } else if (/\.tsx?$/.test(e.name) && !isDictFile(p)) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Extrai literais respeitando escapes; ignora o miolo interpolado de templates.
 *
 * Templates com ${...} são removidos ANTES da varredura por aspas: sem isso o
 * regex de aspas duplas emparelha o fecha-aspas de um ramo do ternário com o
 * abre-aspas do outro e inventa frases como `: "texto"}` — falso positivo que
 * aponta uma string já traduzida como pendente.
 */
function extractLiterals(src) {
  const out = [];
  for (const q of ['"', "'", "`"]) {
    // Aspas simples/duplas não atravessam quebra de linha em JS. Sem o \n na
    // classe negada, o regex emparelhava a aspa de uma linha com a de outra e
    // produzia frases costuradas (ex.: `: "texto já traduzido"}`) — falso
    // positivo. Template literal (crase) é o único que pode ser multilinha.
    const nl = q === "`" ? "" : "\\n";
    const re = new RegExp(
      `${q}((?:[^${q}${nl}\\\\]|\\\\.)*)${q}`.replace("`", "\\`"),
      "g"
    );
    let m;
    while ((m = re.exec(src))) {
      let v = m[1];
      if (q === "`") {
        if (v.includes("${")) continue; // composto em runtime → tratado no código
      }
      try {
        v = JSON.parse('"' + v.replace(/"/g, '\\"').replace(/\\'/g, "'") + '"');
      } catch {
        continue;
      }
      out.push(v);
    }
  }
  return out;
}

function loadDictKeys() {
  const keys = new Set();
  const files = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.ts$/.test(e.name)) files.push(p);
    }
  };
  walk(path.join(ROOT, "lib", "i18n"));
  walk(path.join(ROOT, "acls", "locales"));
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const re = /^\s{2,}"((?:[^"\\]|\\.)*)":/gm;
    let m;
    while ((m = re.exec(src))) {
      try {
        keys.add(JSON.parse('"' + m[1] + '"'));
      } catch {}
    }
  }
  return keys;
}

const dict = loadDictKeys();
const report = {};
let total = 0;

for (const file of collectFiles(ROOT)) {
  const rel = path.relative(ROOT, file).split(path.sep).join("/");
  if (BY_KEY_SOURCES.has(rel) || NAO_E_TELA.has(rel)) continue;
  const src = fs.readFileSync(file, "utf8");
  const lines = src.split("\n");
  const missing = [];
  const seen = new Set();
  for (const lit of extractLiterals(src)) {
    if (!isProse(lit) || seen.has(lit) || dict.has(lit)) continue;
    if (isSpeakMessage(lines, lit) || isInvariantMessage(lines, lit)) continue;
    seen.add(lit);
    missing.push(lit);
  }
  if (missing.length) {
    report[rel] = missing.sort();
    total += missing.length;
  }
}

const jsonFlag = process.argv.indexOf("--json");
if (jsonFlag !== -1 && process.argv[jsonFlag + 1]) {
  fs.writeFileSync(process.argv[jsonFlag + 1], JSON.stringify(report, null, 1));
}

for (const [f, list] of Object.entries(report).sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n== ${f} (${list.length})`);
  for (const s of list) console.log("   " + s);
}
console.log(`\n===== SEM TRADUÇÃO: ${total} =====`);
process.exit(total ? 1 : 0);
