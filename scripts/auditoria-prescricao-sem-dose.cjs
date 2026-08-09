/**
 * Prescrição sem dose: onde o app manda dar um fármaco e não diz quanto.
 *
 * ── POR QUE ESTE SCRIPT EXISTE ───────────────────────────────────────────────
 *
 * O card da PCR na gestação dizia "interromper a infusão de magnésio e
 * ADMINISTRAR CÁLCIO" — e parava aí. Quem está no meio de uma parada, com a
 * ampola na mão, precisa do número. "Administrar cálcio" não é prescrição: é a
 * lembrança de que existe um tratamento.
 *
 * O mesmo defeito já tinha aparecido na eclâmpsia ("iniciar MgSO₄ — Pritchard
 * ou Zuspan", sem os gramas) e no TEP ("a AHA não estabelece dose"). Nos três
 * casos o texto estava clinicamente correto e operacionalmente inútil. Quando um
 * defeito aparece três vezes em lugares diferentes, ele não é um caso: é uma
 * classe, e classe se varre.
 *
 * ── O QUE ELE PROCURA ────────────────────────────────────────────────────────
 *
 * Frases de tela que MANDAM administrar um fármaco (verbo imperativo + nome de
 * fármaco) e que não trazem NEM dose NEM caminho para ela.
 *
 * "Caminho para a dose" conta como aceitável de propósito: dose repetida em
 * cinco telas é dose que um dia diverge — já aconteceu neste app. Apontar para o
 * módulo onde ela vive ("ver o módulo de Intoxicações exógenas") é melhor
 * engenharia e igualmente útil a quem lê.
 *
 * ── O QUE ELE NÃO É ──────────────────────────────────────────────────────────
 *
 * Não julga se a dose está certa — isso é trabalho humano, contra a diretriz.
 * Ele só encontra o silêncio: o lugar onde o app manda fazer e não diz como.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|lib\/i18n|e2e|scripts|auditoria|locales/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name) && !/ \d\.tsx?$/.test(f.name)) {
      saida.push(p);
    }
  }
  return saida;
}

/** Leitor de literais com estado — mesmo motivo da varredura de tradução. */
function literais(texto) {
  const achados = [];
  let i = 0;
  while (i < texto.length) {
    const c = texto[i];
    if (c === "/" && texto[i + 1] === "/") { i = texto.indexOf("\n", i); if (i < 0) break; continue; }
    if (c === "/" && texto[i + 1] === "*") { const f = texto.indexOf("*/", i + 2); i = f < 0 ? texto.length : f + 2; continue; }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1, conteudo = "";
      while (j < texto.length) {
        if (texto[j] === "\\") { conteudo += texto[j + 1] === '"' ? '"' : texto[j] + (texto[j + 1] || ""); j += 2; continue; }
        if (texto[j] === c) break;
        if (texto[j] === "\n" && c !== "`") { j = -1; break; }
        conteudo += texto[j]; j++;
      }
      if (j < 0 || j >= texto.length) { i++; continue; }
      if (conteudo.length >= 20) achados.push({ frase: conteudo, pos: i });
      i = j + 1; continue;
    }
    i++;
  }
  return achados;
}

// Fármacos e intervenções que exigem número. Lista explícita: um nome novo entra
// aqui de propósito, não por heurística que um dia pega a palavra errada.
const FARMACOS = [
  "cálcio", "gluconato de cálcio", "cloreto de cálcio", "sulfato de magnésio", "magnésio",
  "adrenalina", "epinefrina", "noradrenalina", "norepinefrina", "vasopressina", "dopamina",
  "dobutamina", "atropina", "amiodarona", "lidocaína", "adenosina", "procainamida",
  "hidrocortisona", "metilprednisolona", "dexametasona", "prednisona",
  "midazolam", "propofol", "cetamina", "etomidato", "fentanil", "morfina", "dexmedetomidina",
  "succinilcolina", "rocurônio", "cisatracúrio", "naloxona", "flumazenil",
  "glucagon", "insulina", "glicose", "bicarbonato", "tiamina",
  "alteplase", "tenecteplase", "estreptoquinase", "heparina", "enoxaparina",
  "ácido tranexâmico", "hidralazina", "labetalol", "nitroprussiato", "nitroglicerina",
  "metoprolol", "esmolol", "diltiazem", "verapamil", "furosemida", "salbutamol",
  "difenidramina", "prometazina", "ondansetrona", "fenitoína", "levetiracetam",
  "diazepam", "lorazepam", "sulfato ferroso", "carvão ativado", "n-acetilcisteína",
];
const RE_FARMACO = new RegExp(`\\b(${FARMACOS.join("|")})\\b`, "i");

// Verbo que MANDA fazer. "Considerar" e "avaliar" entram: quem considera precisa
// saber quanto, senão não consegue considerar.
const RE_MANDA = /\b(administrar|administre|dar|dê|aplicar|aplique|iniciar|inicie|infundir|infunda|repetir|repita|fazer|faça|prescrever|considerar|considere|associar|associe)\b/i;

// Uma DOSE: número + unidade reconhecível. Aceita faixa e por-quilo.
const RE_DOSE = /\b\d+(?:[,.]\d+)?\s*(?:[–-]\s*\d+(?:[,.]\d+)?\s*)?(mg|g|mcg|µg|mL|L|U|UI|mEq|mmol|ampola|amp|comprimido|mg\/kg|mcg\/kg|U\/min|mg\/min|mcg\/min|mg\/h|mL\/h|mg\/kg\/h|mcg\/kg\/min|g\/dia|mg\/dia)\b/i;

// Caminho para a dose: aponta onde ela vive. Vale como resposta.
const RE_CAMINHO = /\bver o módulo\b|\bver módulo\b|\bconsultar o módulo\b|\bpróximos passos\b|\bnos próximos passos\b|\bconforme (o )?protocolo institucional\b|\bver a calculadora\b|\bver tríade\b/i;

// Negações: não prescrevem.
const RE_NEGA = /\bnão\s+(usar|administrar|dar|fazer|iniciar|repetir|indicar|prescrever)\b|\bevitar\b|\bcontraindicad/i;

/**
 * ── O QUE NÃO É PRESCRIÇÃO ───────────────────────────────────────────────────
 *
 * A primeira execução acusou 90 frases e a maioria era ruído. Um verificador
 * ruidoso é desligado no primeiro aperto — e aí não pega mais nada, nem o caso
 * real. Os filtros abaixo saíram de ler os 90 um a um.
 */

// PASSADO. "Ambas as doses já foram administradas" INFORMA o que aconteceu; não
// manda fazer nada. Cobrar dose de um relato é cobrar o que não se aplica.
const RE_PASSADO = /\bj[áa]\s+(foi|foram|est[áa]|estão)\b|\bj[áa]\s+(feita|feitas|administrad|aplicad|iniciad)|\bforam administradas\b|\bap[óo]s\s+\d+\s+doses?\b/i;

// RÓTULO DE DOSE. "Aplicar a 2ª dose de adrenalina IM" aponta para um esquema
// numerado que a própria tela mostra — a dose está ali, no item que o rótulo
// nomeia. Exigir o número dentro do rótulo duplicaria a informação na tela.
const RE_ROTULO_DE_DOSE = /\b\d\s*ª\s*dose\b|\b(primeira|segunda|terceira)\s+dose\b|\bdose\s+de\s+ataque\b|\bdose\s+adicional\b/i;

// PREPARO E DISPONIBILIDADE. "Manter adrenalina disponível", "preparar IOT",
// "treinar o uso do autoinjetor" — organizam a cena, não prescrevem.
const RE_PREPARO = /\bdispon[íi]vel\b|\bpreparar\b|\bprepare\b|\bdeixar pronto\b|\btreinar\b|\bà beira do leito\b|\bmonitoriza|\bobservar a resposta\b/i;

// DOSE POR EXTENSO. As falas de áudio dizem "um miligrama" porque número escrito
// em dígito é lido errado pelo sintetizador. É dose, e das mais importantes.
const RE_DOSE_EXTENSO = /\b(um|dois|dois|três|quatro|cinco|seis|dez|doze|cento|trezentos|meio|meia)\b[^.;]{0,24}\b(miligrama|grama|micrograma|mililitro|unidade)/i;

const achados = [];
let examinadas = 0;

for (const arquivo of fontes(appDir)) {
  const texto = fs.readFileSync(arquivo, "utf8");
  const rel = path.relative(appDir, arquivo);
  for (const { frase, pos } of literais(texto)) {
    if (!RE_FARMACO.test(frase)) continue;
    if (!RE_MANDA.test(frase)) continue;
    if (RE_NEGA.test(frase)) continue;
    if (RE_PASSADO.test(frase)) continue;
    if (RE_PREPARO.test(frase)) continue;
    examinadas++;
    if (RE_DOSE.test(frase)) continue;
    if (RE_DOSE_EXTENSO.test(frase)) continue;
    if (RE_CAMINHO.test(frase)) continue;
    if (RE_ROTULO_DE_DOSE.test(frase)) continue;
    const linha = texto.slice(0, pos).split("\n").length;
    achados.push({ rel, linha, frase: frase.slice(0, 150) });
  }
}

console.log("\n════ PRESCRIÇÃO SEM DOSE ════\n");
console.log(`frases que mandam administrar: ${examinadas} · sem dose e sem caminho: ${achados.length}\n`);
for (const a of achados) {
  console.log(`❌ ${a.rel}:${a.linha}`);
  console.log(`   « ${a.frase} »\n`);
}
if (!achados.length) console.log("toda prescrição traz a dose, ou diz onde encontrá-la.\n");

console.log(
  "Este script NÃO falha o build — é um MAPA, e a lista pede julgamento humano.\n" +
  "Boa parte do que ele lista são frases de INDICAÇÃO (\"considerar dobutamina se\n" +
  "disfunção miocárdica\"), onde a dose vive no módulo do fármaco e repetir aqui\n" +
  "criaria a quinta cópia de um número — que é como as doses divergem.\n" +
  "O que se procura na lista é o SILÊNCIO: o lugar que manda fazer agora, no meio\n" +
  "do atendimento, e não diz quanto nem para onde olhar.\n"
);

