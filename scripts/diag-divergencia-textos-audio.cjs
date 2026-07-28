#!/usr/bin/env node
/**
 * Divergência entre as TRÊS fontes do mesmo comando falado.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O que existe hoje, por cue:
 *
 *  1. `acls/speech-map.ts` — o texto que o app FALA por TTS quando não há MP3.
 *  2. `acls/AUDIO_SCRIPT.md` — o roteiro de onde os MP3 foram GRAVADOS. É o que o
 *     médico realmente ouve, porque o áudio resolve por cueId e o arquivo existe.
 *  3. `acls/canonical-audio-manifest.ts` — o catálogo tratado como canônico e
 *     verificado por `validate:acls-audio`.
 *
 * Nada garante que os três concordem, e não concordam. Isso importa por dois
 * motivos concretos:
 *
 *  - se um MP3 falhar em carregar, o médico ouve por TTS uma instrução DIFERENTE
 *    da que foi gravada — no meio de uma reanimação;
 *  - o manifesto, que é a referência para regravar, pode ser o mais pobre dos
 *    três. Regravar por ele empobreceria o áudio sem ninguém notar.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Este script NÃO decide qual texto é o certo. Escolher o comando falado numa PCR
 * é decisão clínica de quem assina o conteúdo. Ele só põe as três versões lado a
 * lado para a decisão ser possível.
 *
 * Uso: node scripts/diag-divergencia-textos-audio.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");

function normalizar(texto) {
  return String(texto ?? "").replace(/\s+/g, " ").trim();
}

/** speech-map.ts — pares `chave: "texto"` do dicionário PT. */
function lerSpeechMap() {
  const fonte = fs.readFileSync(path.join(appDir, "acls", "speech-map.ts"), "utf8");
  const mapa = new Map();
  for (const m of fonte.matchAll(/^\s{2}([a-z0-9_]+):\s*"((?:[^"\\]|\\.)*)"/gm)) {
    mapa.set(m[1], normalizar(m[2].replace(/\\"/g, '"')));
  }
  return mapa;
}

/** canonical-audio-manifest.ts — pares key/text das entradas do catálogo. */
function lerManifesto() {
  const fonte = fs.readFileSync(
    path.join(appDir, "acls", "canonical-audio-manifest.ts"),
    "utf8"
  );
  const mapa = new Map();
  for (const m of fonte.matchAll(
    /key:\s*"([a-z0-9_]+)"[\s\S]{0,80}?text:\s*"((?:[^"\\]|\\.)*)"/g
  )) {
    mapa.set(m[1], normalizar(m[2].replace(/\\"/g, '"')));
  }
  return mapa;
}

/** AUDIO_SCRIPT.md — linhas de tabela `| n | \`arquivo.mp3\` | texto | uso |`. */
function lerRoteiro() {
  const caminho = path.join(appDir, "acls", "AUDIO_SCRIPT.md");
  if (!fs.existsSync(caminho)) return new Map();
  const mapa = new Map();
  for (const linha of fs.readFileSync(caminho, "utf8").split("\n")) {
    const m = linha.match(/^\|\s*\d+\s*\|\s*`([a-z0-9_]+)\.mp3`\s*\|\s*([^|]+)\|/i);
    if (m) mapa.set(m[1], normalizar(m[2]));
  }
  return mapa;
}

const speechMap = lerSpeechMap();
const manifesto = lerManifesto();
const roteiro = lerRoteiro();

/**
 * A comparação que MANDA: `speech-map` × roteiro de gravação.
 *
 * São essas duas que o médico ouve. O MP3 foi gravado do roteiro, e o áudio
 * resolve por cueId — então o roteiro é o que toca. O `speech-map` é o que o TTS
 * fala quando o MP3 falha. Divergir entre si significa que a mesma cue diz coisas
 * diferentes conforme o arquivo carregue ou não, no meio de uma reanimação.
 *
 * O `text` do manifesto NÃO entra nesta trava: em 27 das 30 cues ele é uma
 * paráfrase encurtada dos outros dois, e `validate:acls-audio` só verifica as
 * CHAVES, não o texto. Ele é catálogo descritivo, não fonte de gravação — apesar
 * do nome "canonical". Fica exibido no relatório porque quem regravar por ele
 * empobreceria o áudio sem perceber.
 */
const DECISAO_PENDENTE = new Set([
  // `start_cpr`: o speech-map ganhou "de alta qualidade", "trinta compressões
  // para duas ventilações" e "minimizar as interrupções"; o MP3 gravado diz
  // "Iniciar RCP agora ... permitir o retorno total do tórax". Qual dos dois é o
  // comando a ser falado numa PCR é decisão de quem assina o conteúdo clínico —
  // não se resolve alinhando o código pelo que é mais fácil.
  "start_cpr",
]);

const cues = [...new Set([...manifesto.keys(), ...roteiro.keys()])].sort();

const divergentes = [];
const ausentes = [];
const falhas = [];
const pendentes = [];

for (const cue of cues) {
  const versoes = {
    "speech-map": speechMap.get(cue),
    roteiro: roteiro.get(cue),
    manifesto: manifesto.get(cue),
  };
  const presentes = Object.entries(versoes).filter(([, v]) => v !== undefined);
  const distintos = new Set(presentes.map(([, v]) => v));

  if (presentes.length < 3) {
    ausentes.push({
      cue,
      faltando: Object.entries(versoes)
        .filter(([, v]) => v === undefined)
        .map(([k]) => k),
    });
  }
  if (distintos.size > 1) divergentes.push({ cue, versoes });

  // A trava: speech-map tem de bater com o roteiro.
  const falado = versoes["speech-map"];
  const gravado = versoes.roteiro;
  if (falado !== undefined && gravado !== undefined && falado !== gravado) {
    (DECISAO_PENDENTE.has(cue) ? pendentes : falhas).push({ cue, falado, gravado });
  }
}

console.log(
  `\nCues no manifesto: ${manifesto.size} · no roteiro: ${roteiro.size} · no speech-map: ${speechMap.size}\n`
);

if (divergentes.length) {
  console.log("═".repeat(78));
  console.log(`TEXTOS DIVERGENTES — ${divergentes.length} cue(s)`);
  console.log("═".repeat(78));
  for (const { cue, versoes } of divergentes) {
    console.log(`\n▸ ${cue}`);
    for (const [fonte, texto] of Object.entries(versoes)) {
      console.log(`   ${fonte.padEnd(12)} ${texto === undefined ? "(ausente)" : texto}`);
    }
  }
}

if (ausentes.length) {
  console.log(`\n${"═".repeat(78)}`);
  console.log(`CUES SEM AS TRÊS FONTES — ${ausentes.length}`);
  console.log("═".repeat(78));
  for (const { cue, faltando } of ausentes) {
    console.log(`  ${cue.padEnd(34)} falta em: ${faltando.join(", ")}`);
  }
}

console.log(`\n${"═".repeat(78)}`);
console.log(
  `RESUMO: ${divergentes.length} cue(s) com texto divergente · ` +
    `${ausentes.length} cue(s) sem as três fontes`
);
if (pendentes.length) {
  console.log(`\n${"─".repeat(78)}`);
  console.log(`AGUARDANDO DECISÃO CLÍNICA — ${pendentes.length} cue(s)`);
  console.log("─".repeat(78));
  for (const { cue, falado, gravado } of pendentes) {
    console.log(`\n▸ ${cue}`);
    console.log(`   TTS falaria: ${falado}`);
    console.log(`   MP3 diz:     ${gravado}`);
  }
  console.log(
    "\nEscolher o comando falado numa PCR é decisão de quem assina o conteúdo\n" +
      "clínico. Enquanto não houver decisão, a divergência fica VISÍVEL aqui em vez\n" +
      "de sumir num teste ajustado para passar."
  );
}

if (falhas.length) {
  console.error(`\n❌ ${falhas.length} cue(s) em que o TTS fala texto diferente do MP3 gravado:\n`);
  for (const { cue, falado, gravado } of falhas) {
    console.error(`  ▸ ${cue}\n     TTS: ${falado}\n     MP3: ${gravado}`);
  }
  process.exit(1);
}

console.log(
  `\n✅ speech-map e roteiro de gravação batem em todas as cues` +
    (pendentes.length ? ` (${pendentes.length} aguardando decisão clínica).` : ".") +
    "\n"
);
