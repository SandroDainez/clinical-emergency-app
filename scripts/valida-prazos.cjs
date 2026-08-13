/**
 * valida-prazos.cjs — R-22, item 4(D)
 *
 * PROMETE: que prazo ACIONÁVEL declarado num módulo tenha mecanismo de medir, que
 *   prazo longo nomeie o marco a partir do qual conta, e que o mesmo marco não
 *   receba valores diferentes em caminhos distintos do mesmo módulo.
 * NÃO PROMETE: que os prazos estejam clinicamente certos, nem que o cronômetro
 *   FUNCIONE — ela confere que o mecanismo EXISTE, lendo o fonte. Pôr um
 *   `return []` no início do getTimers desliga o relógio e esta trava continua
 *   verde, porque a palavra `duration:` segue no corpo, agora inalcançável.
 *   Comportamento é conferido executando, em `test:cronometro` (R-10).
 * UNIVERSO: as árvores e motores de conteúdo clínico, com os prazos de
 *   ELEGIBILIDADE nomeadamente excluídos.
 *
 * ── A DISTINÇÃO QUE FAZ OU QUEBRA ESTA TRAVA ────────────────────────────────
 *
 * Dois prazos parecem iguais no texto e não são:
 *
 *   ACIONÁVEL — manda fazer alguma coisa quando o tempo passar.
 *     "reavaliar em 5 min", "repetir a cada 3–5 min", "nova dose em 10 min".
 *     Se o app manda cronometrar e não cronometra, o prazo é decorativo — mesma
 *     família do teto que nunca vincula.
 *
 *   ELEGIBILIDADE — é critério, não contagem.
 *     "janela de 4,5 h para trombólise", "sintomas há menos de 12 h".
 *     Ninguém espera que o app conte isso: é informação para decidir SE, não
 *     alarme para tocar QUANDO. Exigir timer aqui é acusar inocente, e trava que
 *     acusa inocente termina desligada (R-22).
 *
 * A separação é feita pelo VERBO, não pelo número: prazo acionável tem imperativo
 * de conduta; prazo de elegibilidade descreve uma janela ou um tempo decorrido.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

// ── Prazo ACIONÁVEL: imperativo de conduta + tempo ──────────────────────────
const ACIONAVEL =
  /(reavaliar|reavalie|repetir|repita|nova dose|redose|reaplicar|checar|conferir|medir|refazer|titular|reavaliação|reavaliar-se)\b[^".]{0,45}?\b(em|a cada|após|dentro de)\s*(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(min|h|horas|minutos)\b/gi;

// ── Prazo de ELEGIBILIDADE: janela, tempo decorrido, critério ───────────────
//
// Nomeados um a um, e não por heurística: cada exclusão é uma decisão, e
// exclusão silenciosa é como um verificador deixa de enxergar sem avisar.
const ELEGIBILIDADE = [
  /janela/i,
  /do início dos sintomas|desde o início|início dos sintomas/i,
  /última vez visto bem|last known well/i,
  /há (menos|mais) de/i,
  /sintomas? h[áa] /i,
  /tempo de (evolução|doença|sintomas)/i,
  /idade gestacional|semanas de gestação/i,
  /validade|prazo de validade/i,
];

/**
 * Marco: o evento a partir do qual o prazo conta.
 *
 * A primeira versão listava só quatro formas e acusou "reavaliar paracetamol em
 * 4 h DA INGESTÃO" — que tem o marco mais importante do módulo escrito com
 * todas as letras. Marco em português se escreve com preposição + evento, e a
 * lista de eventos é longa; enumerar as preposições é mais confiável do que
 * enumerar os eventos.
 */
const TEM_MARCO = new RegExp(
  [
    "ap[óo]s", "a partir d", "desde", "depois d", "p[óo]s-?", "na chegada",
    "na admiss[ãa]o", "no atendimento",
    // Marco DÊITICO: "desta avaliação" ancora em AGORA, e é marco tanto quanto
    // um evento nomeado — quem lê sabe de quando conta.
    "dest[ae] (avalia[çc][ãa]o|decis[ãa]o|momento|consulta)", "a partir de agora",
    // preposição + evento: "da ingestão", "do trauma", "da primeira dose"…
    "\\bd[ao]s?\\s+(ingest[ãa]o|admiss[ãa]o|chegada|trauma|primeir|dose|coleta|" +
      "in[íi]cio|entrada|evento|parada|reperfus[ãa]o|trombólise|trombolise|cirurgia|" +
      "interna[çc][ãa]o|exame|TC|gasometria|lactato|sintomas)",
  ].join("|"),
  "i"
);

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n|components/.test(p)) fontes(p, saida);
    } else if (/-(decision-tree|engine)\.ts$/.test(f.name)) saida.push(p);
  }
  return saida;
}

const arquivos = fontes(appDir);

/** O módulo tem mecanismo de cronometrar? */
/**
 * A árvore e o motor nem sempre têm o mesmo nome — a Anafilaxia tem árvore em
 * inglês (`anaphylaxis-decision-tree`) e motor em português (`anafilaxia-engine`).
 * Sem a ponte, a trava dizia que o módulo não tem cronômetro DEPOIS de ele
 * ganhar um: falso positivo criado pela própria correção.
 */
const MOTOR_DE = { anaphylaxis: "anafilaxia" };

const temTimer = (rel) => {
  let base = rel.replace(/-(decision-tree|engine)\.ts$/, "");
  base = MOTOR_DE[base] ?? base;
  // O ACLS cronometra por mecanismo próprio (reducer + painel), fora de getTimers.
  if (/^acls/.test(base)) return true;
  const motor = path.join(appDir, `${base}-engine.ts`);
  if (!fs.existsSync(motor)) return false;
  const s = fs.readFileSync(motor, "utf8");
  const i = s.indexOf("function getTimers");
  if (i < 0) return false;
  let d = 0;
  const j = s.indexOf("{", i);
  let k = j;
  for (; k < s.length; k++) {
    if (s[k] === "{") d++;
    else if (s[k] === "}") {
      d--;
      if (d === 0) break;
    }
  }
  return /duration\s*:/.test(s.slice(j, k));
};

/**
 * Prazos cujo marco NÃO é dedutível da linha, e cuja escolha é clínica.
 *
 * Estão aqui NOMEADOS e com a pergunta escrita, em vez de silenciados: a
 * diferença entre "ainda não decidimos" e "não vimos" é a única coisa que
 * separa dívida de esquecimento. Quando a decisão vier, o item sai daqui e o
 * texto ganha o marco.
 */
const PENDENTE_DE_DECISAO = new Map([
  // Vazia: os dois itens que estavam aqui — a TC do TCE e os critérios de alta
  // da Sepse — receberam marco (D-17 resolvida). A lista fica porque a próxima
  // ambiguidade tem onde morar declarada, em vez de virar exceção silenciosa.
]);

const porModulo = new Map();

for (const arquivo of arquivos) {
  const rel = path.relative(appDir, arquivo);
  const modulo = rel.replace(/-(decision-tree|engine)\.ts$/, "");
  const texto = fs
    .readFileSync(arquivo, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));

  texto.split("\n").forEach((linha, i) => {
    if (/^\s*\/\//.test(linha)) return;
    if (ELEGIBILIDADE.some((re) => re.test(linha))) return;

    for (const m of linha.matchAll(ACIONAVEL)) {
      ok++;
      const verbo = m[1].toLowerCase();
      const conector = m[2].toLowerCase();
      const valor = m[4] ? `${m[3]}–${m[4]}` : m[3];
      const unidade = m[5].startsWith("h") ? "h" : "min";
      const registro = { rel, i: i + 1, modulo, verbo, valor, unidade, trecho: m[0].trim().slice(0, 70), linha };

      if (!porModulo.has(modulo)) porModulo.set(modulo, []);
      porModulo.get(modulo).push(registro);

      // ── Eixo 1: prazo longo sem marco declarado ──────────────────────────
      //
      // Só prazos de 2 h ou mais. "reavaliar em 5 min" ancora no agora e não
      // precisa de marco escrito; "TC de controle em 24 h" precisa dizer 24 h
      // DEPOIS DE QUÊ, ou vira contagem sem começo.
      // "a cada X" é PERIÓDICO: o marco é a medição anterior, e exigir marco
      // escrito acusaria toda rotina de reavaliação seriada. Só o prazo ÚNICO
      // ("em X h", "após X h") precisa dizer a partir de quando conta.
      const emHoras = unidade === "h" ? parseFloat(String(m[3]).replace(",", ".")) : 0;
      const periodico = conector === "a cada";
      if (emHoras >= 2 && !periodico && !TEM_MARCO.test(linha)) {
        const chave = `${rel}:${i + 1}`;
        if (PENDENTE_DE_DECISAO.has(chave)) {
          avisos.push(`${chave} — PENDENTE DE DECISÃO CLÍNICA: ${PENDENTE_DE_DECISAO.get(chave)}`);
        } else {
          falhas.push(
            `${rel}:${i + 1} — prazo de ${valor} h sem marco: «${registro.trecho}».\n` +
            `    A contagem não diz a partir de QUE evento começa.`
          );
        }
      }
    }
  });
}

// ── Eixo 3: prazo acionável em módulo sem mecanismo de medir ────────────────
for (const [modulo, registros] of porModulo) {
  if (temTimer(`${modulo}-decision-tree.ts`)) {
    ok++;
    continue;
  }
  const curtos = registros.filter((r) => r.unidade === "min");
  if (!curtos.length) continue;
  avisos.push(
    `${modulo}: declara ${curtos.length} prazo(s) acionável(is) em minutos e o módulo NÃO TEM CRONÔMETRO. ` +
    `Ex.: «${curtos[0].trecho}» (${curtos[0].rel}:${curtos[0].i}). ` +
    `Prazo que o app manda cumprir e não mede é decorativo — o médico sob pressão não conta os minutos de cabeça.`
  );
}

// ── Eixo 2: mesmo marco, prazos diferentes no mesmo módulo ──────────────────
for (const [modulo, registros] of porModulo) {
  const porVerbo = new Map();
  for (const r of registros) {
    const chave = `${r.verbo}|${r.unidade}`;
    if (!porVerbo.has(chave)) porVerbo.set(chave, new Map());
    const vals = porVerbo.get(chave);
    if (!vals.has(r.valor)) vals.set(r.valor, []);
    vals.get(r.valor).push(r);
  }
  for (const [chave, vals] of porVerbo) {
    if (vals.size < 2) continue;
    const [verbo, unidade] = chave.split("|");
    const detalhe = [...vals.entries()]
      .map(([v, rs]) => `${v} ${unidade} (${rs.map((r) => `${r.rel.split("/").pop()}:${r.i}`).join(", ")})`)
      .join(" × ");
    avisos.push(
      `${modulo}: "${verbo}" com granularidades diferentes — ${detalhe}. ` +
      `Não é erro hoje; vira divergência real quando alguém editar um dos dois.`
    );
  }
}

if (ok < 30) {
  falhas.push(`só ${ok} prazos acionáveis lidos em ${arquivos.length} arquivos — universo pequeno demais para valer como trava.`);
}

console.log(`\nPrazos declarados — marco, mecanismo e granularidade (R-22)\n`);
console.log(
  `ESCOPO: confere COERÊNCIA INTERNA dos prazos — não julga se o prazo clínico está certo.\n` +
  `        Prazos de ELEGIBILIDADE (janela de trombólise, tempo de sintomas) ficam de fora\n` +
  `        de propósito: são critério, não contagem.\n`
);
for (const a of avisos) console.log(`⚠️  ${a}\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} prazos acionáveis conferidos\n`);
  process.exit(1);
}
console.log(`✅ ${ok} prazos acionáveis conferidos · ${avisos.length} aviso(s)\n`);
