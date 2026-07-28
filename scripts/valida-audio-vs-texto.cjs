#!/usr/bin/env node
/**
 * O MP3 corresponde ao texto que o app declara falar?
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O problema que motivou este script
 *
 * O texto de `start_cpr` foi enriquecido em algum momento — ganhou "de alta
 * qualidade", "trinta compressões para duas ventilações" e "minimizar as
 * interrupções". O MP3 em espanhol foi regravado com o texto novo. O em português
 * NÃO. Resultado: por meses o app declarou um comando e tocou outro, e nada
 * apontava isso — `validate:acls-audio` confere as CHAVES, não o conteúdo.
 *
 * Numa reanimação, "o app fala o que está escrito" não é detalhe.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ## Como medir sem ouvir
 *
 * Ajustando, POR IDIOMA, um modelo de duração esperada em cima do próprio acervo:
 *
 *     duração ≈ caracteres / velocidade + pausa × (frases − 1)
 *
 * `velocidade` e `pausa` saem de mínimos quadrados sobre todas as cues daquele
 * idioma. Depois se compara a duração real com a prevista: um arquivo muito mais
 * curto do que o texto exige não pode estar dizendo aquele texto.
 *
 * ## Duas tentativas erradas antes desta, registradas para não se repetirem
 *
 * 1. **Taxa absoluta de caracteres por segundo.** Não serve: a taxa cai quando o
 *    texto tem mais frases, porque cada ponto vira pausa. O `start_cpr` completo
 *    tem SEIS frases e deveria estar entre as taxas mais baixas do acervo —
 *    aparecia na mais alta, mas cues curtas de uma frase apareciam junto e a
 *    lista de suspeitos ficava cheia de falso positivo.
 *
 * 2. **Comparar PT contra ES na mesma cue.** Parecia autocalibrante e não é: a voz
 *    ES fala ~18% mais rápido que a PT, e várias traduções têm tamanho diferente
 *    por razão legítima ("Qual é o ritmo?" tem 47 caracteres; a versão ES, 80).
 *    Essa medida acusou 6 cues em espanhol que estão corretas — atribuía a
 *    "áudio truncado" o que era voz mais lenta e tradução mais verbosa.
 *
 * O modelo por idioma resolve os dois: cada acervo é sua própria régua, e o número
 * de frases entra na conta.
 *
 * ## Calibração (medida, não escolhida no chute)
 *
 * PT: 16,5 caracteres/s e 0,48 s de pausa por frase extra. ES: 17,6 e 0,54 s.
 * Razão real/prevista: em PT, `start_cpr` fica em 0,61× e a segunda menor em 0,68×;
 * em ES a menor de todas é 0,75×. O limite de 0,65 fica abaixo de tudo que foi
 * medido como correto e acima do caso real. As cues entre o limite e 0,80× saem
 * como AVISO, sem falhar: valem uma escuta, não uma acusação.
 *
 * Uso: node scripts/valida-audio-vs-texto.cjs
 */
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");

/** Abaixo disto, o arquivo é curto demais para dizer o texto. Falha. */
const LIMITE_FALHA = 0.65;
/** Entre o limite e este valor, sai como aviso — vale escutar. */
const LIMITE_AVISO = 0.8;

/**
 * Divergências já conhecidas, aguardando regravação.
 *
 * A lista existe para a pendência ficar VISÍVEL a cada execução em vez de sumir
 * num limite afrouxado. Some daqui quando o arquivo for substituído — e o
 * validador volta a cobrar sozinho.
 */
const AGUARDANDO_REGRAVACAO = new Map([
  [
    "pt:start_cpr",
    "MP3 em PT diz o texto curto antigo: 9,64 s onde o texto completo exige ~15,8 s. " +
      "O ES já foi regravado com o texto completo. Regravar o PT com o texto de " +
      "acls/speech-map.ts.",
  ],
]);

const LOCAIS = [
  { id: "pt", textos: "acls/speech-map.ts", padrao: /^ {2}([a-z0-9_]+):\s*"((?:[^"\\]|\\.)*)"/gm, pasta: "assets/audio/final-acls" },
  {
    id: "es",
    textos: "acls/locales/es-419/speech-cues.ts",
    padrao: /([a-z0-9_]+):\s*\n?\s*"((?:[^"\\]|\\.)*)"/g,
    pasta: "assets/audio/final-acls-es",
  },
];

let semFerramenta = false;

function duracaoSegundos(arquivo) {
  // afinfo existe em todo macOS; ffprobe cobre o resto. Sem nenhum dos dois o
  // script AVISA e sai em zero: falta de ferramenta local não é defeito do app, e
  // travar por isso ensinaria a ignorar o validador.
  try {
    const saida = execFileSync("afinfo", [arquivo], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const m = saida.match(/estimated duration:\s*([\d.]+)/);
    if (m) return Number(m[1]);
  } catch {
    /* tenta ffprobe */
  }
  try {
    const saida = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", arquivo],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
    );
    const valor = Number(String(saida).trim());
    return Number.isFinite(valor) ? valor : undefined;
  } catch {
    semFerramenta = true;
    return undefined;
  }
}

function contarFrases(texto) {
  return Math.max(1, texto.split(/[.?!]+/).filter((parte) => parte.trim().length > 0).length);
}

/**
 * Mínimos quadrados para `duração ≈ a·caracteres + b·(frases−1)`.
 *
 * Duas incógnitas, equações normais resolvidas na mão — não vale trazer
 * dependência para uma matriz 2×2.
 */
function ajustar(amostras) {
  let sxx = 0, sxy = 0, syy = 0, sxd = 0, syd = 0;
  for (const { caracteres, frases, duracao } of amostras) {
    const x = caracteres;
    const y = frases - 1;
    sxx += x * x;
    sxy += x * y;
    syy += y * y;
    sxd += x * duracao;
    syd += y * duracao;
  }
  const det = sxx * syy - sxy * sxy;
  if (Math.abs(det) < 1e-9) {
    // Sem variação de frases no acervo: cai para o modelo só de caracteres.
    return { a: sxd / (sxx || 1), b: 0 };
  }
  return { a: (sxd * syy - syd * sxy) / det, b: (syd * sxx - sxd * sxy) / det };
}

const falhas = [];
const avisos = [];
const pendentes = [];
const resumoPorIdioma = [];

for (const local of LOCAIS) {
  const fonte = fs.readFileSync(path.join(appDir, local.textos), "utf8");
  const amostras = [];

  for (const m of fonte.matchAll(local.padrao)) {
    const cue = m[1];
    const texto = m[2].replace(/\\"/g, '"').replace(/\s+/g, " ").trim();
    if (!texto) continue;
    const arquivo = path.join(appDir, local.pasta, `${cue}.mp3`);
    if (!fs.existsSync(arquivo)) continue;
    const duracao = duracaoSegundos(arquivo);
    if (duracao === undefined || duracao <= 0.5) continue;
    amostras.push({ cue, caracteres: texto.length, frases: contarFrases(texto), duracao });
  }

  if (amostras.length < 5) continue;

  const { a, b } = ajustar(amostras);
  resumoPorIdioma.push(
    `${local.id.toUpperCase()}: ${(1 / a).toFixed(1)} caracteres/s · ` +
      `${b.toFixed(2)}s de pausa por frase extra · ${amostras.length} cues`
  );

  for (const amostra of amostras) {
    const prevista = a * amostra.caracteres + b * (amostra.frases - 1);
    if (prevista <= 0) continue;
    const razao = amostra.duracao / prevista;
    if (razao >= LIMITE_AVISO) continue;

    const registro = {
      chave: `${local.id}:${amostra.cue}`,
      razao,
      real: amostra.duracao,
      prevista,
      caracteres: amostra.caracteres,
      frases: amostra.frases,
      nota: AGUARDANDO_REGRAVACAO.get(`${local.id}:${amostra.cue}`),
    };

    if (registro.nota) pendentes.push(registro);
    else if (razao < LIMITE_FALHA) falhas.push(registro);
    else avisos.push(registro);
  }
}

if (semFerramenta && resumoPorIdioma.length === 0) {
  console.log(
    "\n⚠️  Sem `afinfo` (macOS) nem `ffprobe` no PATH — não é possível medir duração.\n" +
      "   Verificação IGNORADA. Instale ffmpeg para habilitá-la.\n"
  );
  process.exit(0);
}

console.log("");
for (const linha of resumoPorIdioma) console.log(`  ${linha}`);
console.log(`\n  limite de falha ${LIMITE_FALHA}× · limite de aviso ${LIMITE_AVISO}×`);

const descrever = (r) =>
  `${r.chave}: ${r.razao.toFixed(2)}× — real ${r.real.toFixed(2)}s, ` +
  `previsto ${r.prevista.toFixed(2)}s (${r.caracteres} caracteres, ${r.frases} frases)`;

if (pendentes.length) {
  console.log(`\n${"─".repeat(78)}`);
  console.log(`AGUARDANDO REGRAVAÇÃO — ${pendentes.length}`);
  console.log("─".repeat(78));
  for (const r of pendentes) {
    console.log(`\n▸ ${descrever(r)}`);
    console.log(`   ${r.nota}`);
  }
}

if (avisos.length) {
  console.log(`\n${"─".repeat(78)}`);
  console.log(`AVISO — vale escutar, sem falhar (${avisos.length})`);
  console.log("─".repeat(78));
  for (const r of avisos) console.log(`  ▸ ${descrever(r)}`);
  console.log(
    "\n  Curtos em relação ao texto, mas dentro do que o acervo mostra como possível.\n" +
      "  Frases muito curtas encurtam pausas e derrubam a previsão — pode ser normal."
  );
}

if (falhas.length) {
  console.error(`\n${"═".repeat(78)}`);
  console.error(`❌ ÁUDIO CURTO DEMAIS PARA O TEXTO — ${falhas.length}`);
  console.error("═".repeat(78));
  for (const r of falhas) {
    console.error(`\n▸ ${descrever(r)}`);
    console.error(
      "   O app declara falar um texto e o arquivo não tem duração para dizê-lo.\n" +
        "   Ou o MP3 precisa ser regravado, ou o texto mudou e a gravação ficou atrás."
    );
  }
  console.error("");
  process.exit(1);
}

console.log(
  `\n✅ Nenhum MP3 curto demais para o texto que o app declara falar` +
    (pendentes.length ? ` (${pendentes.length} aguardando regravação).` : ".") +
    "\n"
);
