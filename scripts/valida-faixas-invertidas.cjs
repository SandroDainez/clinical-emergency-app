/**
 * valida-faixas-invertidas.cjs — R-22, item 1
 *
 * ── A CLASSE ────────────────────────────────────────────────────────────────
 *
 * Verificação que NÃO depende de fonte externa. Toda outra trava desta auditoria
 * compara o app contra algo de fora — bula, publicação, massa molar, fonte única.
 * Esta compara o app contra SI MESMO: uma faixa escrita "a–b" afirma que a é o
 * limite inferior e b o superior. Se a > b, a afirmação se contradiz, e isso é
 * decidível sem sair do repositório.
 *
 * Por isso ela cobre o que a auditoria módulo a módulo não alcança: os módulos
 * sem diretriz citada (D-3) e os números atrás de paywall.
 *
 * ── O QUE NÃO É FAIXA ───────────────────────────────────────────────────────
 *
 * O travessão em texto clínico é ambíguo, e uma trava que acusa inocente é pior
 * que trava que não existe (R-22). Ficam de fora, NOMEADAMENTE:
 *
 *   · relações e proporções — "I:E 1:2", "1:10.000"
 *   · intervalos de administração — "12/12h"
 *   · sequências decrescentes deliberadas — o degrau do Vt "8–7–6" na SDRA, o
 *     desmame de PEEP, a redução escalonada de sedativo
 *   · datas, versões, referências bibliográficas ("2016;315(8):762–774")
 *   · negativos — "RASS −5 a −4" tem inferior MENOR em valor absoluto e maior
 *     em sinal; a comparação é feita com sinal
 *   · faixa cujo segundo termo é unidade diferente do primeiro
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let lidas = 0;
let arquivos = 0;

/** Só grandezas em que "a–b" significa inequivocamente um intervalo fechado. */
const UNIDADES = [
  "mg/kg/min", "mcg/kg/min", "mcg/kg/h", "mg/kg/h", "mg/kg", "mcg/kg",
  "mg/min", "mcg/min", "mg/h", "mcg/h", "U/h", "UI/kg", "U/kg",
  "mg/dL", "mEq/L", "mEq/kg", "mmol/L", "mOsm/kg", "g/dL",
  "mg", "mcg", "mL/kg", "mL", "mEq", "mmHg", "cmH₂O", "rpm", "bpm",
  "min", "horas", "dias", "semanas", "J", "%",
].map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

// Travessão de intervalo: – (en dash) ou - (hífen), com espaços opcionais.
// O sinal de menos unicode (−) é aceito no PRIMEIRO termo como negativo.
const RE = new RegExp(
  String.raw`(−?\d+(?:[.,]\d+)?)\s*[–-]\s*(−?\d+(?:[.,]\d+)?)\s*(${UNIDADES})(?![\w/])`,
  "g"
);

// Faixa dentro de `label:` ou `k:` sem unidade — típica das opções de escore e
// das tabelas de referência. Exige que o rótulo comece com o número, para não
// pegar "PAM 5–15 ou NE/Epi" e outras frases com faixa embutida em prosa.
const RE_OPCAO = /(?:label|k):\s*"(\d+(?:[.,]\d+)?)\s*[–-]\s*(\d+(?:[.,]\d+)?)"/g;

/** "1.000" é mil; "1.5" não ocorre em pt-BR neste app (usa vírgula). */
const num = (s) => parseFloat(s.replace("−", "-").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));

// Sequência de TRÊS ou mais números encadeados por travessão é um DEGRAU, não
// uma faixa: "8–7–6 mL/kg" é a descida deliberada do volume corrente na SDRA, e
// lida como faixa acusa "7–6" invertido. Foi a única armadilha que a bateria de
// falsos positivos encontrou, e ela existe no app de verdade.
const RE_DEGRAU = /\d+(?:[.,]\d+)?\s*[–-]\s*\d+(?:[.,]\d+)?\s*[–-]\s*\d+/;

const IGNORAR_LINHA = [
  RE_DEGRAU,
  /\d+:\d+/,                    // relações — I:E 1:2, 1:10.000
  /\d+\/\d+\s*h/,               // intervalos — 12/12h
  /\b(19|20)\d{2}\b\s*;/,       // referência bibliográfica
  /doi|PMID|http/i,
];

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

for (const arquivo of fontes(appDir)) {
  const rel = path.relative(appDir, arquivo);
  const bruto = fs.readFileSync(arquivo, "utf8");
  // Comentários fora: eles narram defeitos antigos de propósito, e um deles
  // citando "8–7" como o degrau errado viraria falso positivo.
  const texto = bruto.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  arquivos++;

  texto.split("\n").forEach((linha, i) => {
    if (/^\s*\/\//.test(linha)) return;
    if (IGNORAR_LINHA.some((re) => re.test(linha))) return;
    // Segunda leitura: faixas SEM unidade dentro de `options` de escore — a
    // unidade mora no rótulo da variável ("Bilirrubina (mg/dL)") e as opções
    // trazem só "1,2–1,9". A primeira versão desta trava não as via, e uma
    // mutação que inverteu "1,2–1,9" para "1,9–1,2" passou limpa.
    for (const m of linha.matchAll(RE_OPCAO)) {
      const a = num(m[1]), b = num(m[2]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      lidas++;
      if (a > b) {
        falhas.push(
          `${rel}:${i + 1} — faixa INVERTIDA em opção de escore «${m[1]}–${m[2]}»: inferior maior que o superior.\n` +
          `    ${linha.trim().slice(0, 120)}`
        );
      }
    }
    for (const m of linha.matchAll(RE)) {
      const a = num(m[1]);
      const b = num(m[2]);
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
      lidas++;
      if (a > b) {
        falhas.push(
          `${rel}:${i + 1} — faixa INVERTIDA «${m[0].trim()}»: o limite inferior (${m[1]}) é maior que o superior (${m[2]}).\n` +
          `    ${linha.trim().slice(0, 120)}`
        );
      }
    }
  });
}

// A trava só vale se leu um corpus real. Se o regex quebrar numa refatoração,
// ela passaria vazia e silenciosa — que é o modo de falha que o R-3 descreve.
if (lidas < 400) {
  falhas.push(`a varredura leu só ${lidas} faixas em ${arquivos} arquivos — universo pequeno demais para valer como trava.`);
}

console.log(`\nFaixas numéricas — limite inferior não pode exceder o superior (R-22)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${lidas} faixas lidas em ${arquivos} arquivos\n`);
  process.exit(1);
}
console.log(`✅ ${lidas} faixas conferidas em ${arquivos} arquivos — nenhuma invertida\n`);
