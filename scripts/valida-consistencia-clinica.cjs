/**
 * Consistência dos fatos clínicos que aparecem em MAIS DE UM lugar.
 *
 * ── POR QUE ESTE SCRIPT EXISTE ───────────────────────────────────────────────
 *
 * O mesmo fato clínico costuma ser escrito em vários módulos: o gatilho para
 * associar vasopressina aparece na calculadora de drogas vasoativas, na tabela
 * de associações, no motor da sepse e no texto de ajuda de um campo. Cada cópia
 * foi escrita numa data diferente, e elas divergiram — foi o que o autor do app
 * viu ao encontrar "≥ 0,25", "0,25–0,5" e "0,4" e não saber qual valia.
 *
 * Divergência aqui não dá erro, não quebra teste e não aparece em revisão de
 * arquivo: só aparece para quem lê os dois módulos e percebe que dizem coisas
 * diferentes. Enquanto isso, um dos dois está errado.
 *
 * A varredura encontrou, além da divergência de números, um ERRO DE FATO: uma
 * linha afirmava "SSC 2021 forte" para a vasopressina. A recomendação da SSC
 * 2021 é FRACA (condicional), evidência moderada — "we suggest adding
 * vasopressin". Rotular como forte inverte o peso da diretriz.
 *
 * ── COMO FUNCIONA ────────────────────────────────────────────────────────────
 *
 * Cada FATO declara o que o assunto é (`assunto`) e o que toda frase sobre ele
 * precisa (`exige`) ou não pode ter (`proibe`). O script lê os literais de
 * string do código de produção e confere um a um.
 *
 * `excecoes` é parte do desenho, não remendo: um mesmo fármaco pode ter dose
 * diferente em indicação diferente, e nesse caso a diferença é correta e
 * precisa ficar declarada — com o motivo por escrito.
 *
 * Este script NÃO julga se o número está certo. Ele garante que o app diz a
 * MESMA coisa em todo lugar. Conferir o número contra a diretriz continua sendo
 * trabalho humano; o que deixa de existir é a divergência silenciosa.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");

/** Arquivos de produção — fora dicionários, testes e scripts. */
function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|lib\/i18n|e2e|scripts|auditoria|locales/.test(p)) {
        fontes(p, saida);
      }
    } else if (/\.tsx?$/.test(f.name)) {
      saida.push(p);
    }
  }
  return saida;
}

const FATOS = [
  {
    id: "gatilho-vasopressina",
    descricao: "gatilho de dose para associar vasopressina à noradrenalina",
    // Precisa falar da NORADRENALINA (ou dizer "a partir de"): a frase da dose
    // excepcional — "> 1–3 mcg/kg/min … adicionar vasopressina 0,03 U/min" —
    // cita vasopressina e mcg/kg/min, mas o número dela é de outro degrau. Sem
    // este recorte o script cobrava "0,25" de uma frase que fala de 1–3.
    assunto: (t) =>
      /vasopressina/i.test(t) &&
      /mcg\/kg\/min/i.test(t) &&
      /(associar|adjuvante|adicionar|a partir de|janela)/i.test(t) &&
      /(noradrenalina|\bnora\b|a partir de)/i.test(t),
    exige: [
      { re: /0,25/, porque: "o gatilho é 0,25 mcg/kg/min — início da faixa 0,25–0,5 (SSC 2021, texto de prática)" },
    ],
    proibe: [
      { re: /\b0,4\s*mcg/i, porque: "0,4 mcg/kg/min é limiar de protocolo institucional, sem lastro em diretriz" },
    ],
  },
  {
    id: "forca-da-recomendacao-vasopressina",
    descricao: "peso da recomendação da SSC para vasopressina",
    assunto: (t) => /vasopressina/i.test(t) && /SSC\s*20\d\d/i.test(t),
    proibe: [
      {
        re: /\bforte\b/i,
        porque:
          "a SSC 2021 SUGERE adicionar vasopressina — recomendação fraca/condicional, evidência moderada. " +
          "Chamar de forte inverte o peso da diretriz.",
      },
    ],
  },
  {
    id: "hidrocortisona-4h",
    descricao: "corticoide no choque séptico exige as 4 h, não só a dose",
    assunto: (t) => /hidrocortisona/i.test(t) && /0,25/.test(t),
    exige: [
      {
        re: /4\s*h/i,
        porque:
          "a SSC 2021 condiciona o corticoide a noradrenalina ou adrenalina ≥ 0,25 mcg/kg/min há PELO MENOS 4 h. " +
          "Sem as 4 h o gatilho vira 'dose alcançada', que é mais precoce e não é o da diretriz.",
      },
    ],
  },
  {
    id: "dose-de-manutencao-da-vasopressina",
    descricao: "vasopressina é dose fixa de 0,03 U/min",
    // O "UI" precisa entrar no ASSUNTO, não só na proibição: procurando apenas
    // "U/min", a frase escrita "UI/min" nunca era selecionada — e a regra que
    // proíbe "UI/min" ficava impossível de disparar. Regra que não pode falhar
    // não protege nada; só foi descoberta ao tentar quebrá-la de propósito.
    assunto: (t) => /vasopressina/i.test(t) && /\bU\.?I?\/min/i.test(t),
    exige: [{ re: /0,03/, porque: "a dose é fixa em 0,03 U/min (VASST/SSC), não titulada" }],
    proibe: [{ re: /\bUI\/min\b/, porque: "a unidade no app é U/min — 'UI/min' é a mesma coisa escrita diferente" }],
    excecoes: [
      {
        contem: "0,03–0,04",
        porque:
          "anafilaxia refratária à adrenalina usa 0,03–0,04 U/min. Indicação diferente, faixa " +
          "legitimamente diferente — declarada aqui para não virar divergência silenciosa.",
      },
    ],
  },
];

// Literais de string do código — aspas duplas, simples e template de uma linha.
//
// A quebra de linha é excluída dos TRÊS casos, inclusive do template. Sem isso
// a crase casava blocos inteiros de JSX entre uma crase e a seguinte, e o
// script passou a acusar trechos de código que não são frase nenhuma.
const LITERAL = /"((?:[^"\\\n]|\\.){12,})"|'((?:[^'\\\n]|\\.){12,})'|`((?:[^`\\$\n]|\\.){12,})`/g;

const falhas = [];
const porFato = new Map(FATOS.map((f) => [f.id, 0]));

for (const arquivo of fontes(appDir)) {
  const texto = fs.readFileSync(arquivo, "utf8");
  const rel = path.relative(appDir, arquivo);

  for (const m of texto.matchAll(LITERAL)) {
    const frase = (m[1] || m[2] || m[3] || "").replace(/\\"/g, '"');
    const linha = texto.slice(0, m.index).split("\n").length;

    for (const fato of FATOS) {
      if (!fato.assunto(frase)) continue;

      const excecao = (fato.excecoes || []).find((e) => frase.includes(e.contem));
      if (excecao) continue;

      porFato.set(fato.id, porFato.get(fato.id) + 1);

      for (const regra of fato.exige || []) {
        if (!regra.re.test(frase)) {
          falhas.push(
            `❌ ${rel}:${linha} — ${fato.descricao}\n   FALTA ${regra.re}: ${regra.porque}\n   « ${frase.slice(0, 150)} »`
          );
        }
      }
      for (const regra of fato.proibe || []) {
        if (regra.re.test(frase)) {
          falhas.push(
            `❌ ${rel}:${linha} — ${fato.descricao}\n   NÃO PODE ${regra.re}: ${regra.porque}\n   « ${frase.slice(0, 150)} »`
          );
        }
      }
    }
  }
}

console.log("\nConsistência dos fatos clínicos repetidos\n");
for (const fato of FATOS) {
  console.log(`   ${String(porFato.get(fato.id)).padStart(3)} frase(s)  ${fato.descricao}`);
}

// Um fato sem nenhuma frase é um fato que deixou de ser vigiado — o texto pode
// ter sido reescrito de um jeito que o `assunto` não reconhece mais, e aí a
// trava passa a aprovar tudo por não olhar nada.
for (const fato of FATOS) {
  if (porFato.get(fato.id) === 0) {
    falhas.push(
      `❌ o fato "${fato.id}" não encontrou NENHUMA frase — ou o assunto sumiu do app, ou foi reescrito ` +
      `de forma que este script não reconhece. Trava que não vê nada aprova tudo.`
    );
  }
}

if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(f + "\n");
} else {
  console.log(`\n✅ ${FATOS.length} fatos conferidos em todas as suas ocorrências — o app diz a mesma coisa em todo lugar`);
}
console.log("");

process.exit(falhas.length ? 1 : 0);
