/**
 * valida-dobutamina.cjs — D-11
 *
 * PROMETE: que nenhum sítio escreva faixa de dobutamina própria — inclusive
 *   quando o nome da droga está no `title:` de um bloco e a dose numa linha
 *   adiante (R-10); que os textos do regime venham de lib/dobutamina.ts; que
 *   as três ressalvas do teto estejam na constante; e que a força FRACA da
 *   recomendação de 2026 esteja escrita onde a indicação aparece.
 * NÃO PROMETE: que as doses estejam clinicamente certas — o lastro é a bula
 *   (dose) e a SSC 2026 (indicação), e a trava confere coerência interna e
 *   procedência, não julgamento. Também não cobre as demais drogas vasoativas.
 *   E não pega nome e dose separados por MAIS de um bloco `title:`/`lines:` —
 *   só o bloco imediatamente ativo.
 * UNIVERSO: toda a árvore de conteúdo (.ts/.tsx), fora scripts, e2e, locales e
 *   i18n.
 *
 * ── O DEFEITO ───────────────────────────────────────────────────────────────
 *
 * Seis afirmações de dose para a mesma droga, com a SEPSE limitando abaixo da
 * própria fonte de três jeitos diferentes (nenhum teto, 5 e 10) enquanto a bula
 * registra que até 20 são frequentemente necessários.
 *
 * ── DUAS FONTES QUE NÃO PODEM SER FUNDIDAS ──────────────────────────────────
 *
 * A DOSE vem da BULA; a INDICAÇÃO vem da SSC 2026, que NÃO especifica dose. Uma
 * citação única cobrindo as duas seria citar diretriz para o que ela não diz —
 * o erro do ART (D-6). A trava confere que as duas atribuições existem e estão
 * separadas.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

// ── R-10 — O BURACO DO REGEX, PROVADO POR MUTAÇÃO ANTES DE USAR ────────────
//
// A trava original só via nome e dose na MESMA linha. Em `recs.push({ title:
// "🚨 Dobutamina...", lines: ["Dose inicial: 2–3 mcg/kg/min..."] })` o nome
// está no campo `title`, a dose numa string do array `lines` — linhas
// diferentes — e a trava passava batido. Achado real: eap-engine.ts:298 tinha
// "2–3 mcg/kg/min" (piso divergente, nunca convertido para a fonte única) e
// isso nunca disparou.
//
// A correção rastreia o `title:` ativo (o último visto) e associa dose a
// nome pelo BLOCO, não pela linha — sem inventar uma janela de N linhas, que
// teria pego "dobutamina" mencionada de passagem no bloco de OUTRA droga
// (testado abaixo: o bloco de noradrenalina cita "...mesmo com dobutamina."
// na prosa, e não pode acender o alarme).
{
  const RANGE_RE = /\d+(?:[.,]\d+)?\s*[–-]\s*\d+(?:[.,]\d+)?\s*mcg\/kg\/min/;
  const NOME_MESMA_LINHA_RE = /dobutamina[^"]{0,60}?\d+(?:[.,]\d+)?\s*[–-]\s*\d+(?:[.,]\d+)?\s*mcg\/kg\/min/i;
  const OUTRAS_DROGAS = /noradrenalina|epinefrina|adrenalina|dopamina|milrinona|vasopressina|nitroglicerina|nitroprussiato/i;

  function detectaFaixaPropria(texto) {
    const achados = [];
    let tituloAtual = "";
    texto.split("\n").forEach((linha, i) => {
      if (/^\s*\/\//.test(linha)) return;
      const tm = linha.match(/title:\s*["'`]([^"'`]*)["'`]/);
      if (tm) tituloAtual = tm[1];

      const mesmaLinha = NOME_MESMA_LINHA_RE.test(linha);
      const viaTitulo =
        !mesmaLinha &&
        RANGE_RE.test(linha) &&
        /dobutamina/i.test(tituloAtual) &&
        !OUTRAS_DROGAS.test(linha);

      if (mesmaLinha || viaTitulo) achados.push({ linha: i + 1, texto: linha });
    });
    return achados;
  }

  const CENARIO_NOME_SEPARADO_DA_DOSE = [
    '    recs.push({',
    '      title: "🚨 Dobutamina — inotrópico (choque cardiogênico)",',
    '      lines: [',
    '        "Dose inicial: 2–3 mcg/kg/min IV contínuo → titular até 20 mcg/kg/min.",',
    '      ],',
    '    });',
  ].join("\n");
  const antigaAchava = NOME_MESMA_LINHA_RE.test(
    CENARIO_NOME_SEPARADO_DA_DOSE.split("\n").find((l) => RANGE_RE.test(l))
  );
  if (antigaAchava) {
    falhas.push("R-10 (dobutamina): o cenário de mutação não prova mais nada — a checagem antiga (mesma linha) passou a achar o caso separado. Reescreva o cenário.");
  } else ok++;
  const novaAcha = detectaFaixaPropria(CENARIO_NOME_SEPARADO_DA_DOSE).length > 0;
  if (!novaAcha) {
    falhas.push("R-10 (dobutamina): a trava nova não pegou nome e dose em linhas separadas — o buraco continua aberto.");
  } else ok++;

  const CENARIO_OUTRA_DROGA_MENCIONA_DOBUTAMINA = [
    '    recs.push({',
    '      title: "🚨 Noradrenalina — vasopressor (hipotensão refratária)",',
    '      lines: [',
    '        "Indicação: choque com hipotensão refratária (PAM < 65 após volume e dobutamina).",',
    '        "Dose: 0,1–0,3 mcg/kg/min IV contínuo → titular até PAM ≥ 65 mmHg.",',
    '      ],',
    '    });',
  ].join("\n");
  if (detectaFaixaPropria(CENARIO_OUTRA_DROGA_MENCIONA_DOBUTAMINA).length > 0) {
    falhas.push("R-10 (dobutamina): a trava nova acendeu no bloco de OUTRA droga só porque \"dobutamina\" aparece na prosa — falso positivo (o mesmo defeito que o R-15 já catalogou noutras travas).");
  } else ok++;
}

const fonteTexto = fs.readFileSync(path.join(appDir, "lib/dobutamina.ts"), "utf8");

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

// ── 1. Os números do regime, e o texto derivando deles ─────────────────────
//
// Referência EXTERNA (bula do cloridrato de dobutamina 12,5 mg/mL): início 2,5 ·
// usual 2,5–10 · até 20 quando necessário. Escrita aqui de propósito — se viesse
// do app, a conferência giraria em falso (R-21).
{
  const ESPERADO = { inicio: "2.5", usualMin: "2.5", usualMax: "10", teto: "20" };
  for (const [campo, valor] of Object.entries(ESPERADO)) {
    if (!new RegExp(`${campo}:\\s*${valor.replace(".", "\\.")}\\b`).test(fonteTexto)) {
      falhas.push(`lib/dobutamina.ts: ${campo} não é ${valor} — a referência é a bula, não o app.`);
    } else ok++;
  }
  // O texto tem de mostrar os mesmos números que a camada numérica declara.
  for (const [trecho, onde] of [["2,5 mcg/kg/min", "DOBUTAMINA_INICIO"], ["2,5–10 mcg/kg/min", "DOBUTAMINA_FAIXA_USUAL"], ["20 mcg/kg/min", "DOBUTAMINA_ATE_20"]]) {
    if (!fonteTexto.includes(trecho)) {
      falhas.push(`lib/dobutamina.ts: ${onde} não exibe "${trecho}" — texto e número divergiram.`);
    } else ok++;
  }
}

// ── 2. As TRÊS ressalvas do teto ───────────────────────────────────────────
//
// Declarar "até 20" sem elas convida a subir até 20. Cada uma existe por um
// motivo distinto, e faltar UMA já muda o que o leitor faz.
{
  const RESSALVAS = [
    [/taquiarritmia/i, "taquiarritmia e consumo miocárdico de O₂"],
    [/vasodilata[çc][ãa]o beta-?2|PIORA DA HIPOTENS/i, "piora da hipotensão por vasodilatação beta-2"],
    [/MARCADORES DE PERFUS|lactato, débito urinário/i, "titulação por marcadores de perfusão, não por número da faixa"],
  ];
  for (const [re, nome] of RESSALVAS) {
    if (!re.test(fonteTexto)) {
      falhas.push(`lib/dobutamina.ts: a ressalva do teto perdeu "${nome}". As três são necessárias — faltar uma muda o que o leitor faz.`);
    } else ok++;
  }
}

// ── 3. As duas fontes, separadas ───────────────────────────────────────────
{
  const temBula = /bula do cloridrato de dobutamina|bula \(cloridrato/i.test(fonteTexto) || /\(bula/i.test(fonteTexto);
  const temDiretriz = /SSC 2026/.test(fonteTexto);
  if (!temBula) falhas.push("lib/dobutamina.ts: a DOSE perdeu a atribuição à bula.");
  else ok++;
  if (!temDiretriz) falhas.push("lib/dobutamina.ts: a INDICAÇÃO perdeu a atribuição à SSC 2026.");
  else ok++;
  // A dose NÃO pode ser atribuída à diretriz: ela não especifica dose nenhuma.
  const linhaDose = fonteTexto.split("\n").find((l) => /FAIXA USUAL:/.test(l)) || "";
  if (/SSC/.test(linhaDose)) {
    falhas.push("lib/dobutamina.ts: a faixa de dose foi atribuída à SSC, que NÃO especifica dose. É o erro do ART (D-6).");
  } else ok++;
}

// ── 4. A força FRACA da recomendação, escrita ──────────────────────────────
{
  if (!/RECOMENDA[ÇC][ÃA]O FRACA/i.test(fonteTexto)) {
    falhas.push(
      "lib/dobutamina.ts: a força da recomendação sumiu. A SSC 2026 REBAIXOU a escolha do agente, e o app " +
      "apresentava a dobutamina como A resposta — dizer o que a evidência sustenta é o mesmo princípio do SOFA."
    );
  } else ok++;
  if (!/milrinona/i.test(fonteTexto)) {
    falhas.push("lib/dobutamina.ts: sumiu o registro de que os dados são insuficientes para decidir entre dobutamina e milrinona.");
  } else ok++;
}

// ── 5. Nenhum sítio escreve faixa própria ──────────────────────────────────
//
// A regra é de EFEITO, não de grafia: qualquer intervalo de dobutamina escrito
// fora da fonte é uma sétima (agora oitava) afirmação nascendo — inclusive
// quando o nome da droga está no `title:` e a dose numa linha adiante (R-10).
{
  let vistos = 0;
  for (const arquivo of fontes(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/dobutamina.ts") continue;
    const texto = fs.readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    vistos++;
    for (const achado of detectaFaixaPropria(texto)) {
      const linha = achado.texto;
      // Exceção NOMEADA: a tabela de associações das Vasoativas mostra a faixa
      // em coluna curta, onde o texto dos três eixos não cabe. Ela repete os
      // números da fonte e é conferida logo abaixo — contrato vigiado (R-25),
      // declarado, não silencioso.
      if (rel.endsWith("vasoactive-calculator-screen.tsx") && /início 2,5; até 20 se necessário/.test(linha)) continue;
      falhas.push(
        `${rel}:${achado.linha} — faixa de dobutamina escrita fora da fonte única: «${linha.trim().slice(0, 95)}».\n` +
        `    O regime vive em lib/dobutamina.ts (D-11). Escrever aqui é uma nova afirmação nascendo.`
      );
    }
  }
  if (vistos < 100) falhas.push(`a varredura leu só ${vistos} arquivos — universo pequeno demais para valer como trava.`);
  else ok++;
}

// ── 6. A exceção da tabela repete os números CERTOS ────────────────────────
{
  const tela = fs.readFileSync(path.join(appDir, "components/protocol-screen/vasoactive-calculator-screen.tsx"), "utf8");
  const linhas = tela.split("\n").filter((l) => /drug: "Dobutamina"/.test(l));
  if (!linhas.length) {
    falhas.push("vasoactive-calculator-screen: nenhuma entrada de dobutamina — a conferência da exceção não rodou.");
  } else {
    for (const l of linhas) {
      if (!/2,5–10 mcg\/kg\/min \(início 2,5; até 20 se necessário\)/.test(l)) {
        falhas.push(`vasoactive-calculator-screen: a linha curta da dobutamina divergiu da fonte — «${l.trim().slice(0, 95)}».`);
      } else ok++;
    }
  }
}

// ── 7. Os sítios consomem a fonte ──────────────────────────────────────────
{
  const CONSOMEM = [
    ["tep-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
    ["eap-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
    ["sepsis-decision-tree.ts", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20", "DOBUTAMINA_INDICACAO_SEPSE_FRACA"]],
    ["components/protocol-screen/acls-post-rosc-screen.tsx", ["DOBUTAMINA_INICIO", "DOBUTAMINA_FAIXA_USUAL", "DOBUTAMINA_ATE_20"]],
  ];
  for (const [rel, nomes] of CONSOMEM) {
    const texto = fs.readFileSync(path.join(appDir, rel), "utf8");
    for (const nome of nomes) {
      if (!new RegExp(`\\b${nome}\\b`).test(texto)) {
        falhas.push(`${rel}: não consome ${nome} — a fonte única existe e este sítio não a usa (R-25).`);
      } else ok++;
    }
  }
}

console.log(`\nDobutamina — regime em fonte única, com a dose da bula e a indicação da diretriz (D-11)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — um regime só, duas fontes separadas, três ressalvas e a força declarada\n`);
