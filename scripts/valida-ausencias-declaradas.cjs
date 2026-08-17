#!/usr/bin/env node
/**
 * PROMETE: que toda AUSÊNCIA DECLARADA — lugar onde o app diz que NÃO fixa um
 *   número porque a fonte não o dá — continue declarada, e que o número plausível
 *   que alguém escreveria "completando" não apareça no lugar dela.
 * NÃO PROMETE: que a decisão de não fixar esteja certa. Ela é clínica e está
 *   argumentada no arquivo de conteúdo; aqui só se garante que ela não seja
 *   desfeita em silêncio. Também não vê declarações escritas de forma que os
 *   padrões abaixo não reconheçam — e é por isso que o universo é DERIVADO, não
 *   listado: uma declaração nova reprova até ganhar guarda.
 * UNIVERSO: os literais de tela de `lib/**.ts` e das árvores, varridos pelos
 *   padrões de DECLARAÇÃO. Comentário não conta — o que protege o médico é o que
 *   ele lê.
 *
 * ── POR QUE ESTA CLASSE EXISTE (R-88) ──────────────────────────────────────
 *
 * Onde o app declara que não fixa um número, a AUSÊNCIA É CONTEÚDO. E o ataque
 * tem forma própria: alguém lê "este app não fixa o intervalo", enxerga uma
 * OMISSÃO, e a corrige de memória. O resultado parece melhoria — um número onde
 * havia lacuna — e é regressão do R-5: precisão inventada com a autoridade de
 * estar no app.
 *
 * ⚠️ A MUTAÇÃO DESTA TRAVA É ESCREVER O NÚMERO PLAUSÍVEL, não uma quebra
 * artificial. Por isso cada caso declara `proibido`: o número que um revisor
 * competente escreveria de boa-fé.
 *
 * ── A VARREDURA QUE A ORIGINOU (2026-08-17) ────────────────────────────────
 *
 * Oito ausências declaradas em texto de tela; DUAS tinham guarda. As seis
 * restantes eram D-52 — e as três primeiras são números que todo médico "sabe",
 * que é o que torna o preenchimento provável.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

// ── 1 · O UNIVERSO, DERIVADO ───────────────────────────────────────────────
//
// Padrões que reconhecem uma DECLARAÇÃO DE AUSÊNCIA em texto de tela.
const DECLARACAO = [
  /N[ÃA]O FIXA O INTERVALO/i,
  /n[ãa]o fixa o n[úu]mero de horas/i,
  /N[ÃA]O EXISTE UM N[ÚU]MERO QUE DEFINA/i,
  /N[ÃA]O FOI VERIFICADA POR ESTE APP/i,
  /n[ãa]o fixa esquema/i,
  /A LITERATURA ABERTA N[ÃA]O SUSTENTA/i,
  /JANELA, N[ÃA]O UM PACIENTE EST[ÁA]VEL/i,
  /Se o protocolo do seu servi[çc]o prev[êe]/i,
];

/**
 * OS CASOS COM GUARDA. `proibido` é o número plausível — o que alguém
 * escreveria "ajudando". Cada linha nasceu de uma decisão clínica argumentada no
 * arquivo de conteúdo; aqui só se impede que ela seja desfeita calada.
 */
const GUARDADOS = [
  {
    nome: "intervalo do ECG seriado",
    arquivo: "lib/oclusao-sem-supra.ts",
    declara: /N[ÃA]O FIXA O INTERVALO/,
    proibido: /repet(ir|e) o ECG (em|a cada) \d/i,
    porque:
      "as fontes abertas para o módulo (JACC 2025, ACEP Now, LITFL) tratam de RECONHECIMENTO, " +
      "não de cadência de repetição. Um intervalo aqui teria vindo de memória.",
  },
  {
    nome: "horas de vigilância no LAST",
    arquivo: "lib/last-emulsao-lipidica.ts",
    declara: /n[ãa]o fixa o n[úu]mero de horas/i,
    proibido: /vigi(ar|lância)[^.]{0,40}\b(12|24|48)\s*h\b/i,
    porque:
      "a ASRA estratifica o tempo de observação POR GRAVIDADE, num gráfico do checklist que não foi " +
      "aberto em sessão. Uma fonte secundária diz 12–24 h sem que se possa conferir.",
  },
  {
    nome: "NIHSS sem ponto de corte para oclusão de grande vaso",
    arquivo: "lib/oclusao-grande-vaso.ts",
    declara: /N[ÃA]O EXISTE UM N[ÚU]MERO QUE DEFINA/,
    // ⚠️ o número que todo mundo escreveria: "NIHSS ≥ 6"
    proibido: /NIHSS\s*(≥|>=|maior|acima de)\s*\d/i,
    porque:
      "a MESMA fonte que mostra o NIHSS predizendo melhor que as escalas de triagem (AUROC 0,86 × " +
      "0,80–0,81) NÃO estabelece ponto de corte. Escrever um limiar transformaria uma medida contínua " +
      "em critério de elegibilidade que a fonte não autoriza.",
  },
  {
    nome: "janela do hemoperitônio — cadência da reavaliação",
    arquivo: "lib/hemoperitonio.ts",
    declara: /JANELA, N[ÃA]O UM PACIENTE EST[ÁA]VEL/,
    // ⚠️ o número plausível: "reavaliar a cada 15 min"
    proibido: /reavali(ar|e)[^.]{0,30}a cada \d+\s*min/i,
    porque:
      "o texto descreve O QUE OBSERVAR (pressão de pulso estreitando, FC, perfusão) porque é o SINAL " +
      "que muda, não o relógio. Fixar cadência daria a impressão de que entre uma medida e outra há " +
      "segurança — e a janela fecha sem avisar.",
  },
  {
    nome: "cinética de envelhecimento da colinesterase por composto",
    arquivo: "lib/pralidoxima-controversia.ts",
    // ⚠️ O MESMO padrão da lista de DECLARAÇÃO, e isto não é detalhe: a conferência
    // do universo derivado casa guarda × declaração pelo `source` da regex. Escrever
    // duas variantes da mesma frase faz a declaração parecer desguardada — foi o que
    // aconteceu na primeira execução, e a trava acusou.
    declara: /N[ÃA]O FOI VERIFICADA POR ESTE APP/i,
    // ⚠️ o número plausível: "até 24–48 h"
    proibido: /envelhecimento[^.]{0,40}\b\d+\s*(a|–|-)?\s*\d*\s*h(oras)?\b/i,
    porque:
      "o envelhecimento varia por composto e o app NÃO verificou a cinética de cada um. Uma janela em " +
      "horas aqui viraria autorização para dar a oxima tarde — ou para não a dar por achar que passou.",
  },
  {
    nome: "pralidoxima — a decisão fica com o protocolo do serviço",
    arquivo: "lib/pralidoxima-controversia.ts",
    declara: /Se o protocolo do seu servi[çc]o prev[êe]/,
    // ⚠️ o "conserto" plausível: transformar a controvérsia em indicação fechada
    proibido: /\b(indicar|administre|d[êe]) pralidoxima (sempre|em todo|de rotina)/i,
    porque:
      "as três posições (Conitec CONTRA, OMS MANTÉM, meta-análise sem benefício) existem para que o " +
      "MÉDICO decida. Fechar a indicação escolheria por um serviço que o app não conhece (PD-5).",
  },
  {
    nome: "fibrinólise no TEP durante a PCR — a AHA não fixa esquema",
    arquivo: "lib/causas-reversiveis-detalhe.ts",
    declara: /n[ãa]o fixa esquema/i,
    // ⚠️ o conserto plausível: atribuir o esquema do ERC à AHA
    proibido: /AHA[^.]{0,40}alteplase 50 mg|alteplase 50 mg[^.]{0,30}\(AHA/i,
    porque:
      "o esquema de 50 mg em bólus vem do ERC e de séries publicadas, e o texto diz isso. Atribuí-lo à " +
      "AHA daria chancela de diretriz a uma prática descrita — e a diferença é o que o médico registra " +
      "no prontuário.",
  },
  {
    nome: "hiperventilação no TCE — o piso de 30 mmHg",
    arquivo: "lib/alvos-tce.ts",
    declara: /A LITERATURA ABERTA N[ÃA]O SUSTENTA/,
    // ⚠️ o conserto plausível: adotar o 25 do protocolo institucional como piso geral
    proibido: /piso[^.]{0,20}\b2[0-9]\s*mmHg/i,
    porque:
      "o 25–34 vem de UM protocolo institucional e vale COM a monitorização de oxigenação cerebral que " +
      "ele mesmo exige. O consenso aberto diz 'never decrease below 30'. Adotar o 25 como piso geral " +
      "levaria o número para fora da condição que o sustenta.",
  },
];

// ── 2 · CADA GUARDA, CONFERIDA SOZINHA (R-1 corolário) ─────────────────────
const conteudo = {};
const ler = (rel) => {
  if (conteudo[rel] === undefined) {
    const p = path.join(appDir, rel);
    conteudo[rel] = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
  }
  return conteudo[rel];
};
/** Só os literais de tela — comentário não protege ninguém. */
const soTela = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

for (const c of GUARDADOS) {
  const bruto = ler(c.arquivo);
  if (bruto === null) {
    falhas.push(`\`${c.arquivo}\` não existe — a guarda de "${c.nome}" não rodou.`);
    continue;
  }
  const tela = soTela(bruto);

  if (!c.declara.test(tela)) {
    falhas.push(
      `A DECLARAÇÃO DE AUSÊNCIA SUMIU: ${c.nome} (${c.arquivo}).\n` +
      `      ⚠️ ${c.porque}\n` +
      `      A ausência é CONTEÚDO: sem a declaração, o próximo leitor a completa de memória (R-88).`
    );
  } else ok++;

  if (c.proibido.test(tela)) {
    const m = tela.match(c.proibido);
    falhas.push(
      `NÚMERO ESCRITO ONDE O APP DECLARA NÃO FIXAR: ${c.nome} (${c.arquivo}).\n` +
      `      encontrado: « ${String(m && m[0]).slice(0, 90)} »\n` +
      `      ⚠️ ${c.porque}\n` +
      `      Se a fonte passou a dar o número, abra-a em sessão, cite-a no arquivo e ajuste esta guarda — ` +
      `não escreva o número sozinho.`
    );
  } else ok++;
}

// ── 3 · O UNIVERSO DERIVADO: declaração nova sem guarda REPROVA ────────────
//
// ⚠️ É o que impede esta trava de virar a lista do D-15. Quem escrever a nona
// declaração de ausência amanhã e não lhe der guarda é reprovado aqui.
const arquivosDeConteudo = [];
const anda = (dir) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!/node_modules|\.git|dist|\.expo|i18n|locales|scripts|e2e/.test(e.name)) anda(p);
      continue;
    }
    if (/\.tsx?$/.test(e.name)) arquivosDeConteudo.push(path.relative(appDir, p));
  }
};
anda(path.join(appDir, "lib"));
for (const f of fs.readdirSync(appDir)) {
  if (/-decision-tree\.ts$/.test(f)) arquivosDeConteudo.push(f);
}

const semGuarda = [];
for (const rel of arquivosDeConteudo) {
  const tela = soTela(ler(rel) ?? "");
  for (const padrao of DECLARACAO) {
    if (!padrao.test(tela)) continue;
    const temGuarda = GUARDADOS.some((g) => g.arquivo === rel && g.declara.source === padrao.source);
    if (!temGuarda) semGuarda.push(`${rel} → ${padrao}`);
  }
}
if (semGuarda.length) {
  falhas.push(
    `DECLARAÇÃO DE AUSÊNCIA SEM GUARDA (${semGuarda.length}):\n` +
    semGuarda.map((x) => `        ${x}`).join("\n") + "\n" +
    `      ⚠️ Toda declaração de ausência recebe guarda no MESMO commit em que é escrita (R-88).\n` +
    `      Se a decisão de não fixar o número vale o parágrafo que a explica, vale a linha que a defende.`
  );
} else ok++;

// ── Vacuidade: universo vazio passa calado ─────────────────────────────────
if (arquivosDeConteudo.length < 60) {
  falhas.push(
    `só ${arquivosDeConteudo.length} arquivos de conteúdo varridos — esperado 90+. ` +
    `A varredura pode ter rodado sobre quase nada (R-15 item 9).`
  );
} else ok++;

console.log("\nAusências declaradas — o que o app decidiu NÃO fixar continua não fixado\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${GUARDADOS.length} ausências declaradas, todas com guarda e sem número\n`);
process.exit(0);
