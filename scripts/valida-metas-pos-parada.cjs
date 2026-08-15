#!/usr/bin/env node
/**
 * PROMETE
 *   Que os alvos do pós-parada existam em UM lugar (lib/metas-pos-parada) e
 *   sejam consumidos pelas DUAS superfícies — o módulo de consulta e o fluxo
 *   guiado —, e que os números conferidos contra a fonte não mudem sozinhos.
 *
 * NÃO PROMETE
 *   Que os alvos estejam clinicamente certos: isso é auditoria de conteúdo com
 *   fonte aberta, e foi feita. Aqui a garantia é de DISTRIBUIÇÃO e de
 *   não-regressão dos números que a fonte fixou.
 *
 * UNIVERSO
 *   A lib-fonte, o módulo Pós-PCR e a tela do fluxo ACLS. Universo fechado de
 *   propósito: os alvos não devem aparecer em mais lugar nenhum, e a proibição
 *   de cópia em universo aberto é feita pela regra de literais abaixo.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A DIVERGÊNCIA QUE AINDA NÃO EXISTIA. O protocol.json tinha a sua versão
 *    dos alvos (escrita para voz) e o módulo tinha a dele. Os números
 *    CONCORDAVAM — e concordar hoje é o estado ANTES da divergência, não a
 *    ausência dela. Foi assim que a dopamina e o magnésio começaram.
 *
 * 2. O ARREDONDAMENTO DE VOLTA no limiar de febre. O app usava 37,7 °C, que
 *    abria uma janela de 0,2 °C em que ele declarava "não é febre" enquanto a
 *    meta que ele mesmo enuncia (32–37,5) já estava estourada. Quem não souber
 *    a razão vai "arredondar" de novo.
 *
 * 3. O DESAPARECIMENTO DO 80 (R-45). O alvo de PAM ≥ 80 foi proposto em 2023 e
 *    não endossado em 2025. Apagá-lo do app não apaga a ideia da cabeça de quem
 *    já a ouviu — apaga só o aviso de que ela não se confirmou.
 *
 * 4. A FUSÃO DE 36 h COM 72 h. São cuidados DIFERENTES: 36 h de controle ativo
 *    de temperatura, 72 h de prevenção de febre. Lidos como um só, viram
 *    "manter tudo por 72 h", que não é o que a fonte diz.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const LIB = "lib/metas-pos-parada.ts";
const MODULO = "components/protocol-screen/acls-post-rosc-screen.tsx";
const FLUXO = "components/protocol-screen/acls-protocol-screen.tsx";

const falhas = [];
let ok = 0;

const semComentarios = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const semImports = (rel) =>
  semComentarios(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

// ── A. Os números que a fonte fixou ────────────────────────────────────────
//
// Literais escritos AQUI porque são a referência da diretriz, não cópia do app
// (R-21 tipo (a)). Se o app mudar sozinho, esta lista acusa.
const lib = semComentarios(LIB);
const NUMEROS = [
  ["SpO₂ 90–98%", /90[–-]98%/],
  ["PaO₂ 60–105 mmHg", /60[–-]105\s*mmHg/],
  ["PaCO₂ 35–45 mmHg", /35[–-]45\s*mmHg/],
  ["PAM ≥ 65", /PAM\s*≥\s*65/],
  ["PAS ≥ 90", /PAS\s*≥\s*90/],
  ["temperatura 32–37,5 °C", /32[–-]37,5\s*°C/],
  ["controle ativo ≥ 36 h", /36\s*h/],
  ["prevenção de febre ≥ 72 h", /72\s*h/],
  ["limiar de febre 37,5 °C", /37,5\s*°C/],
  ["glicemia 140–180 mg/dL", /140[–-]180\s*mg\/dL/],
  ["proibição do 80–110 mg/dL", /80[–-]110\s*mg\/dL/],
  ["piso de hipoglicemia < 70", /<\s*70\s*mg\/dL/],
  ["prognóstico ≥ 72 h", /72\s*h/],
];
for (const [nome, padrao] of NUMEROS) {
  if (!padrao.test(lib)) {
    falhas.push(
      `${LIB}: o número "${nome}" mudou ou sumiu. Estes vieram de fonte aberta em sessão ` +
      `(AHA 2025 Part 11 via PulmCCM/PulmCrit; AHA Part 8 2015 PMC4959439 para a glicemia) — ` +
      `não se troca por memória (R-5).`
    );
  } else ok++;
}

// ── B. O 37,7 não pode voltar, em lugar nenhum do app ──────────────────────
{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales/.test(p)) raiz(p, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p);
    }
    return saida;
  };
  let achados = 0;
  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel.startsWith("lib/i18n/")) continue;
    const texto = semComentarios(rel);
    for (const linha of texto.split("\n")) {
      if (/37,7|37\.7/.test(linha)) {
        achados++;
        falhas.push(
          `${rel}: reapareceu 37,7 °C — «${linha.trim().slice(0, 90)}». O limiar de febre é 37,5, ` +
          `o MESMO teto da faixa de controle: com 37,7 o app declara "não é febre" enquanto a meta ` +
          `que ele enuncia já está estourada. O 37,5 é o padrão do app (AVC usa em 5 lugares).`
        );
      }
    }
  }
  if (achados === 0) ok++;
}

// ── C. As duas superfícies CONSUMEM (import fora — R-15 item 10) ───────────
const CONSUMIDORES = [
  [MODULO, ["META_OXIGENACAO", "META_VENTILACAO", "META_PRESSAO", "META_GLICEMIA", "META_TEMPERATURA", "META_FEBRE", "META_PROGNOSTICO"]],
  [FLUXO, ["METAS_POR_ESTADO_POS_ROSC"]],
];
for (const [rel, nomes] of CONSUMIDORES) {
  const texto = semImports(rel);
  for (const nome of nomes) {
    if (!new RegExp(`\\b${nome}\\b`).test(texto)) {
      falhas.push(
        `${rel}: não consome ${nome} — a fonte única existe e este sítio parou de usá-la. ` +
        `(Conferido com o import REMOVIDO: import não é consumo.)`
      );
    } else ok++;
  }
}

// ── D. O 80 continua NOMEADO, com a atribuição e o não-endosso ─────────────
{
  const exige = [
    ["o alvo de 80 continua citado", /80/],
    ["a atribuição de 2023", /Neurocritical Care Society/],
    ["o não-endosso de 2025", /NÃO o endossaram|não endossaram/i],
  ];
  for (const [nome, padrao] of exige) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: ${nome} sumiu do texto da PAM. R-45 — apagar o 80 não apaga a ideia da cabeça de ` +
        `quem já a ouviu; apaga só o aviso de que ela não se confirmou.`
      );
    } else ok++;
  }
}

// ── E. 36 h e 72 h continuam DISTINTOS ─────────────────────────────────────
{
  const t = lib.match(/META_TEMPERATURA[\s\S]{0,700}?;/)?.[0] ?? "";
  if (!/CONTROLE ATIVO/.test(t) || !/PREVENIR FEBRE/.test(t)) {
    falhas.push(
      `${LIB}: a distinção entre CONTROLE ATIVO (36 h) e PREVENIR FEBRE (72 h) se perdeu. ` +
      `São cuidados diferentes: lidos como um só viram "manter tudo por 72 h", que não é o que a ` +
      `fonte diz.`
    );
  } else ok++;
}

// ── F. A incerteza da glicemia é CONTEÚDO, não comentário ─────────────────
{
  const g = lib.match(/META_GLICEMIA[\s\S]{0,900}?;/)?.[0] ?? "";
  if (!/INCERTO|incerto/.test(g)) {
    falhas.push(
      `${LIB}: a incerteza declarada pela AHA sumiu do TEXTO da glicemia. Ela é informação ` +
      `clínica, não justificativa interna: impede que alguém trate 175 mg/dL como problema a ` +
      `corrigir agressivamente.`
    );
  } else ok++;
}

console.log("\nMetas do pós-parada — fonte única nas duas superfícies\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — alvos em fonte única, consumidos pelo módulo e pelo fluxo\n`);
process.exit(0);
