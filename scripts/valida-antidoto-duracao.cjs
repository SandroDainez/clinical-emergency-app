/**
 * valida-antidoto-duracao.cjs — R-22, item 2
 *
 * ── O EIXO ──────────────────────────────────────────────────────────────────
 *
 * Antídoto cuja duração de ação é MENOR que a do agente que ele reverte tem uma
 * consequência obrigatória: o paciente precisa ser vigiado depois de acordar,
 * porque o efeito do antídoto acaba antes do efeito do tóxico.
 *
 * Não é julgamento farmacológico — é COERÊNCIA INTERNA (R-22). O próprio app
 * afirma isto sobre a naloxona, com todas as letras, em poisoning-decision-tree:
 *
 *   "A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão
 *    respiratória PODE VOLTAR depois de o paciente já ter acordado. Vigiar por
 *    horas, não por minutos."
 *
 * Se o app afirma isso, então TODO lugar que prescreve naloxona precisa dizer o
 * mesmo. Um lugar que prescreve sem a consequência contradiz o próprio app.
 *
 * ── POR QUE ESTA TRAVA É DIFERENTE DA DE REDOSE ─────────────────────────────
 *
 * O eixo original era mais amplo — "intervalo de reavaliação × duração de ação",
 * nos dois sentidos. Ele não tem corpus neste app: de 34 fármacos varridos, 14
 * declaram intervalo de redose e apenas 6 declaram duração de ação; a
 * interseção é de 3, e as 3 são coincidência de linha, não par real.
 *
 * A ausência é o achado (R-13): o app quase nunca declara duração de ação, e
 * sem ela o cruzamento não existe. O que sobra com corpus real é este recorte —
 * o antídoto —, que é também onde o erro é mais caro.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

/**
 * Cada antídoto com a consequência que o app precisa carregar junto.
 *
 * `afirma` é a frase-âncora que o app já usa para o conceito — a trava exige o
 * CONCEITO, não a redação, para não virar cópia de texto (R-21). Por isso a
 * conferência é por qualquer um dos `sinais`.
 */
const ANTIDOTOS = [
  {
    nome: "naloxona",
    agente: "opioide",
    porque:
      "a duração da naloxona é menor que a da maioria dos opioides — a depressão " +
      "respiratória volta depois de o paciente ter acordado",
    sinais: [
      /meia-vida da naloxona é MENOR/i,
      /PODE VOLTAR depois de o paciente/i,
      /vigiar por horas/i,
      /renarcotiza/i,
    ],
  },
  {
    nome: "flumazenil",
    agente: "benzodiazepínico",
    porque:
      "a duração do flumazenil (cerca de 1 h) é menor que a da maioria dos " +
      "benzodiazepínicos — o rebaixamento pode voltar",
    sinais: [/ressedação/i, /re-?sedação/i, /rebaixamento pode voltar/i, /vigiar por horas/i],
  },
];

/** Linha que PRESCREVE (traz dose) × linha que apenas cita o nome. */
const PRESCREVE = /\d+(?:[.,]\d+)?\s*(?:[–-]\s*\d+(?:[.,]\d+)?\s*)?(mg|mcg|g)\b/;

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

const arquivos = fontes(appDir);

/**
 * ── POR QUE A TRAVA PRECISA RESOLVER IDENTIFICADORES ────────────────────────
 *
 * A primeira versão lia o TEXTO em volta da prescrição. Isso funcionava
 * enquanto as frases eram literais inline — e parou de funcionar assim que a
 * correção fez a coisa CERTA: mover o texto para constantes de fonte única, no
 * módulo dono. O bloco em volta passou a conter `NALOXONA_VIGILANCIA_APOS_REVERSAO`,
 * um identificador, e nenhum dos sinais.
 *
 * A trava acusaria justamente o app corrigido. Antes de mexer no app, a trava
 * aprende a expandir os identificadores.
 */
const CONSTANTES = new Map();
for (const arquivo of arquivos) {
  const t = fs.readFileSync(arquivo, "utf8");
  for (const m of t.matchAll(/export const ([A-Z0-9_]+)\s*=\s*\n?\s*"((?:[^"\\]|\\.)*)"/g)) {
    CONSTANTES.set(m[1], m[2].replace(/\\"/g, '"'));
  }
}
const expandir = (texto) =>
  texto.replace(/\b[A-Z][A-Z0-9_]{4,}\b/g, (nome) => CONSTANTES.get(nome) ?? nome);

for (const a of ANTIDOTOS) {
  const reNome = new RegExp(a.nome, "i");
  const prescrevem = [];
  let algumAfirma = null;

  for (const arquivo of arquivos) {
    const rel = path.relative(appDir, arquivo);
    const bruto = fs.readFileSync(arquivo, "utf8");
    // Comentários fora: esta própria trava e os cabeçalhos de módulo citam as
    // frases, e contá-los faria a conferência passar sozinha.
    const texto = bruto.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    const linhas = texto.split("\n");

    linhas.forEach((linha, i) => {
      if (/^\s*\/\//.test(linha)) return;
      // Expandir ANTES de decidir se a linha prescreve. Depois que a correção
      // moveu a dose para constante de fonte única, o sítio consumidor virou uma
      // linha com um IDENTIFICADOR e nenhum número — e a trava deixou de
      // enxergá-lo como prescrição. Mutação M1 passou limpa por isso: não havia
      // mais nada para quebrar naquele arquivo.
      // Conferir o nome do fármaco na linha ORIGINAL **e** na expandida: o
      // identificador carrega o nome (NALOXONA_TITULADA_IATROGENICA) e o texto
      // dele não precisa carregar. Testar só a expandida perdia todos os sítios
      // que consomem por constante — que são justamente os corrigidos.
      const expandida = expandir(linha);
      const alvo = linha + " " + expandida;
      if (!reNome.test(alvo)) return;
      if (a.sinais.some((s) => s.test(alvo))) algumAfirma = `${rel}:${i + 1}`;
      if (PRESCREVE.test(alvo)) prescrevem.push({ rel, i: i + 1, linha, texto });
    });
  }

  if (!prescrevem.length) {
    falhas.push(`${a.nome}: nenhuma prescrição encontrada — a conferência não rodou (o nome do fármaco mudou?).`);
    continue;
  }

  for (const p of prescrevem) {
    // A consequência vale se estiver na PRÓPRIA linha ou no mesmo bloco de
    // conteúdo — um nó de árvore, um `info`, um `lines`. Recorte: 12 linhas
    // para cada lado, que é a altura típica de um nó neste app.
    const linhas = p.texto.split("\n");
    const bloco = expandir(linhas.slice(Math.max(0, p.i - 13), p.i + 12).join("\n"));
    if (a.sinais.some((s) => s.test(bloco))) {
      ok++;
    } else {
      falhas.push(
        `${p.rel}:${p.i} prescreve ${a.nome} sem a consequência da duração curta.\n` +
        `    ${p.linha.trim().slice(0, 120)}\n` +
        `    POR QUÊ: ${a.porque}.`
      );
    }
  }

  if (!algumAfirma) {
    avisos.push(
      `${a.nome}: o app NUNCA afirma a consequência da duração curta — nem no módulo de Intoxicações. ` +
      `Achado de AUSÊNCIA (R-13): procurei em ${arquivos.length} arquivos, por ${a.sinais.length} formulações.`
    );
  } else {
    ok++;
  }
}

console.log(`\nAntídoto de duração curta — a consequência acompanha a prescrição (R-22)\n`);
for (const a of avisos) console.log(`⚠️  ${a}`);
if (falhas.length) {
  if (avisos.length) console.log("");
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} prescrição(ões) sem a consequência · ${ok} conferida(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — toda prescrição de antídoto carrega a consequência da duração curta\n`);
