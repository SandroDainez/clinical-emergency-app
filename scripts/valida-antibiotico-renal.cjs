#!/usr/bin/env node
/**
 * PROMETE: que os nove esquemas empíricos de antibiótico digam o que fazer com
 *   a função renal — o PISO em todos, o PONTEIRO nos que citam os três fármacos
 *   cobertos —, e que o ataque de vancomicina tenha FONTE ÚNICA de cálculo.
 * NÃO PROMETE: que os esquemas estejam clinicamente certos, nem que a
 *   calculadora cubra os fármacos certos — isso é PD-6, decidido e declarado.
 * UNIVERSO: os nós de esquema derivados da árvore da sepse pelo prefixo `atb_`,
 *   não uma lista à mão (D-15). Esquema novo entra no radar sozinho.
 *
 * ── OS DOIS DEFEITOS QUE ORIGINARAM (2026-08-17) ────────────────────────────
 *
 * 1 · Os nove nós prescreviam REGIME COMPLETO (dose E intervalo) e nenhum
 *     mencionava função renal. Varrido na árvore: `ClCr`, `TFG`, `ajuste
 *     renal`, `creatinina`, `hemodiálise` — nenhum. E a Sepse não sabia que a
 *     calculadora existia.
 *
 * 2 · ⚠️ O `{vancoLoad}` DIVERGIA DA CALCULADORA. Aqui era `27.5 * peso` sem
 *     teto; lá, 25–30 mg/kg com máximo de 3 g. A partir de 110 kg o lado que
 *     PRESCREVE ultrapassava o teto — 3.575 mg contra 3.000 mg a 130 kg. R-12
 *     com cálculo é pior que com texto: dois lugares divergem em silêncio, e um
 *     deles prescreve.
 *
 * ⚠️ E O PISO É INVERTIDO PELO TEMPO, NÃO PELA FUNÇÃO RENAL. O texto óbvio
 * ("ajuste se a função renal estiver ruim") contraria a evidência no cenário
 * mais comum deste módulo. As conferências abaixo vigiam a direção certa — e a
 * de nº 3 existe para impedir que alguém "corrija" o piso para a versão
 * intuitiva e errada.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { consomeConstante } = require("./lib/consumo.cjs");
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "atb-renal-"));
let arvore = null;
let lib = null;
try {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "sepsis-decision-tree.ts"),
  ], { cwd: appDir, stdio: "pipe" });
  arvore = Object.values(require(path.join(tempDir, "sepsis-decision-tree.js"))).find((v) => v && v.nodes);
  lib = require(path.join(tempDir, "lib/dose-antibiotico-renal.js"));
} catch (erro) {
  falhas.push(`a árvore da sepse não compilou — NADA foi conferido: ${String(erro).slice(0, 200)}`);
}

// ── O universo: DERIVADO pelo prefixo, não listado ─────────────────────────
const esquemas = arvore
  ? Object.entries(arvore.nodes).filter(([id, n]) => /^atb_/.test(id) && n.type === "action")
  : [];

if (esquemas.length < 8) {
  falhas.push(`só ${esquemas.length} nós \`atb_*\` encontrados — esperado 9. A varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

// ── 1. O PISO EM TODOS — inclusive nos que a calculadora não cobre ─────────
//
// ⚠️ É NELES QUE O PISO É A ÚNICA PROTEÇÃO. Ceftriaxona, cefepima, ertapeném,
// metronidazol e clindamicina saem do app em dose fixa; para quem os prescreve,
// esta frase é tudo o que existe sobre função renal.
{
  const semPiso = esquemas.filter(([, n]) =>
    !/NÃO SE AJUSTA POR FUNÇÃO RENAL/.test(textosDoNo(n).join("\n")));
  if (semPiso.length) {
    falhas.push(
      `${semPiso.length} esquema(s) sem o piso de função renal: ${semPiso.map(([id]) => id).join(", ")}.\n` +
      `      ⚠️ Os nove prescrevem dose E intervalo. Sem esta frase, quem lê aplica o intervalo da ` +
      `função renal normal desde a primeira dose — ou, pior, reduz por prudência e subdosa o séptico.`
    );
  } else ok++;

  for (const [id] of esquemas) {
    const r = consomeConstante({
      arquivo: path.join(appDir, "sepsis-decision-tree.ts"),
      constante: "ATB_PRIMEIRA_DOSE_NAO_AJUSTA", no: id,
    });
    if (!r.consome) falhas.push(`${r.motivo}. ⚠️ Import não é consumo.`);
    else ok++;
  }
}

// ── 2. O PONTEIRO onde os três cobertos aparecem ───────────────────────────
//
// ⚠️ O UNIVERSO AQUI TAMBÉM É DERIVADO: quais nós citam vanco, pip-tazo ou
// meropeném é lido do texto, não de uma lista. Se um esquema passar a citar
// meropeném amanhã, ele entra na exigência sozinho.
{
  const TRES = /vancomicina|piperacilina|pip-tazo|tazobactam|meropen/i;

  // ⚠️ UNIVERSO CIRCULAR EVITADO (R-71) — e a primeira versão caiu nele.
  //
  // O critério é "o esquema cita um dos três fármacos cobertos". Mas o PISO que
  // esta mesma trava exige contém a frase "A VANCOMICINA SEGUE OUTRO REGIME" —
  // então, depois de injetado, TODOS os nove passavam a "citar vancomicina", e a
  // trava exigia ponteiro em `atb_pac` (ceftriaxona + azitromicina) e
  // `atb_meningite` (ceftriaxona + ampicilina), onde nenhum dos três aparece.
  //
  // O texto que a trava manda escrever não pode alimentar o critério que ela
  // usa para decidir onde exigi-lo. As constantes injetadas saem do universo.
  const semInjetadas = (n) =>
    textosDoNo(n)
      .filter((t) => t !== lib?.ATB_PRIMEIRA_DOSE_NAO_AJUSTA && t !== lib?.ATB_PONTEIRO_CALCULADORA)
      .join("\n");
  const devem = esquemas.filter(([, n]) => TRES.test(semInjetadas(n)));
  if (devem.length < 5) {
    falhas.push(`só ${devem.length} esquemas citam os três fármacos cobertos — esperado 7. O parser pode ter quebrado.`);
  } else ok++;

  const semPonteiro = devem.filter(([, n]) =>
    !/CALCULADORAS & ESCORES/.test(textosDoNo(n).join("\n")));
  if (semPonteiro.length) {
    falhas.push(
      `${semPonteiro.length} esquema(s) citam vanco/pip-tazo/meropeném e NÃO apontam a calculadora: ` +
      `${semPonteiro.map(([id]) => id).join(", ")}.\n` +
      `      ⚠️ O ajuste desses três EXISTE no app e fica a duas telas de distância. Prescrever sem ` +
      `apontar é o R-12: o conteúdo existe e não chega a quem precisa.`
    );
  } else ok++;

  // ⚠️ O PONTEIRO NÃO PODE PROMETER TOQUE. `targets` (navegação real) é campo
  // exclusivo de TransitionNode, e estes nós são `action`. Prometer navegação
  // que não existe é a falta do ponteiro para módulo inexistente.
  const texto = esquemas.map(([, n]) => textosDoNo(n).join("\n")).join("\n");
  if (/toque (aqui|no card|no bot)/i.test(texto)) {
    falhas.push(
      "o ponteiro da calculadora passou a prometer TOQUE.\n" +
      "      ⚠️ `targets` é exclusivo de TransitionNode e estes nós são `action` — não há navegação " +
      "aqui. O texto diz ONDE a calculadora está, no vocabulário do hub, e não finge um botão."
    );
  } else ok++;

  // E precisa dizer o ClCr ABSOLUTO, que é o erro de uso mais provável.
  if (!/ClCr ABSOLUTO/i.test(texto)) {
    falhas.push("o ponteiro perdeu o aviso de que a calculadora pede ClCr ABSOLUTO, não a TFG indexada.");
  } else ok++;

  // E precisa declarar a lacuna dos outros — PD-6, R-13 aplicado ao escopo.
  if (!/NÃO TÊM AJUSTE RENAL IMPLEMENTADO/i.test(texto)) {
    falhas.push(
      "sumiu a declaração de que os demais antibióticos do app NÃO têm ajuste renal.\n" +
      "      ⚠️ Apontar a calculadora sem dizer o que ela NÃO cobre sugere que ela cobre tudo — e " +
      "quem prescreve ceftriaxona sai daqui achando que o app o ajustou (PD-6)."
    );
  } else ok++;
}

// ── 3. A DIREÇÃO DO PISO — contra a "correção" intuitiva e errada ──────────
//
// ⚠️ ESTA É A CONFERÊNCIA QUE PROTEGE A EVIDÊNCIA CONTRA O BOM SENSO.
//
// Alguém revisando o texto tende a "arrumá-lo" para "ajuste a dose se houver
// disfunção renal", que é o que a formação ensina. A coorte de sepse com LRA
// mostra o contrário: adiar o ajuste além de 24 h associou-se a MENOR
// mortalidade (HR 0,588). O piso precisa manter as três peças.
{
  const piso = lib?.ATB_PRIMEIRA_DOSE_NAO_AJUSTA ?? "";
  const pecas = [
    ["o MECANISMO (volume de distribuição)", /VOLUME DE DISTRIBUI[ÇC][ÃA]O/i],
    ["que ele não depende de depuração renal", /n[ãa]o depende de depura[çc][ãa]o renal/i],
    ["o número da coorte (HR 0,588)", /0,588/],
    ["que o ajuste é da MANUTENÇÃO", /O QUE SE AJUSTA É A MANUTEN[ÇC][ÃA]O/i],
    ["a janela de 24 a 48 h", /24 a 48 h/],
    ["o que fazer até lá (dosar, não reduzir)", /DOSE A FUN[ÇC][ÃA]O RENAL/i],
    ["a exceção da vancomicina", /A VANCOMICINA SEGUE OUTRO REGIME/i],
  ].filter(([, re]) => !re.test(piso));
  if (pecas.length) {
    falhas.push(
      `o piso perdeu ${pecas.length} peça(s): ${pecas.map((x) => x[0]).join(" · ")}.\n` +
      `      ⚠️ SEM O MECANISMO, "não ajuste agora" soa como negligência e quem lê desobedece POR ` +
      `PRUDÊNCIA — subdosando o séptico, que é o erro que mata mais rápido. E sem a exceção da ` +
      `vancomicina o piso contradiz a própria calculadora, que a ajusta por nível/AUC.`
    );
  } else ok++;

  // A direção invertida: o piso não pode virar "ajuste porque a função está ruim".
  if (/ajuste (a dose )?(se|caso|quando) (houver|h[áa]) (disfun|insufici)/i.test(piso)) {
    falhas.push(
      "o piso foi invertido para a versão intuitiva: \"ajuste se houver disfunção renal\".\n" +
      "      ⚠️ Contraria a evidência aberta no cenário mais comum deste módulo. Ajustar nas " +
      "primeiras 24 h associou-se a MAIOR mortalidade que adiar (HR 0,588 a favor de adiar)."
    );
  } else ok++;
}

// ── 4. FONTE ÚNICA DO ATAQUE DE VANCOMICINA ────────────────────────────────
{
  const sep = lerFonte(path.join(appDir, "sepsis-decision-tree.ts"));
  const calc = lerFonte(path.join(appDir, "clinical-calculators-engine.ts"));
  const semComentario = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/[^\n]*/g, "$1");

  // ⚠️ NENHUM DOS DOIS pode recalcular por conta. O padrão procurado é a
  // multiplicação do peso por um fator de mg/kg de vancomicina.
  for (const [nome, fonte] of [["sepsis-decision-tree.ts", sep], ["clinical-calculators-engine.ts", calc]]) {
    // ⚠️ O REGEX PRECISA DO CONTEXTO, e a primeira versão não tinha: ela pegou
    // `const vol = 30 * peso` — os 30 mL/kg de VOLUME da ressuscitação — e
    // acusou recálculo de vancomicina. Procurar "número × peso" solto acha toda
    // dose por quilo do app. A busca é por linha que fale de vanco E multiplique.
    const proprio = semComentario(fonte)
      .split("\n")
      .filter((l) => /vanco/i.test(l) && /(27[.,]5|25|30)\s*\*\s*peso/.test(l))
      .map((l) => l.trim().slice(0, 70));
    if (proprio.length) {
      falhas.push(
        `\`${nome}\` voltou a calcular o ataque de vancomicina por conta: ${proprio.join(", ")}.\n` +
        `      ⚠️ R-12 COM CÁLCULO. Os dois lados JÁ divergiram: 27,5×peso sem teto aqui contra ` +
        `25–30 mg/kg com máximo de 3 g lá — a 130 kg, 3.575 mg contra 3.000 mg, e o lado que ` +
        `prescrevia era o errado. A fonte única é \`ataqueVancomicinaMg\`.`
      );
    } else ok++;
  }

  for (const [arq, cons] of [
    ["sepsis-decision-tree.ts", "rotuloAtaqueVancomicina"],
    ["clinical-calculators-engine.ts", "ataqueVancomicinaMg"],
  ]) {
    const r = consomeConstante({ arquivo: path.join(appDir, arq), constante: cons });
    if (!r.consome) falhas.push(`${r.motivo}. ⚠️ Import não é consumo.`);
    else ok++;
  }

  // E o TETO tem de valer — é ele que a Sepse não aplicava.
  const f = lib?.ataqueVancomicinaMg;
  if (typeof f !== "function") {
    falhas.push("`ataqueVancomicinaMg` não é exportada — a fonte única não existe.");
  } else {
    const casos = [[70, 1750, 2100], [130, 3000, 3000], [150, 3000, 3000]];
    const erra = casos.filter(([p, lo, hi]) => {
      const r = f(p);
      return !r || r.min !== lo || r.max !== hi;
    });
    if (erra.length) {
      falhas.push(
        `o ataque de vancomicina errou em ${erra.length} caso(s) de referência: ` +
        erra.map(([p, lo, hi]) => `${p} kg esperava ${lo}–${hi}, veio ${JSON.stringify(f(p))}`).join(" · ") + ".\n" +
        `      ⚠️ O caso de 130 kg é o que importa: sem o teto de 3 g ele dá 3.575 mg, que era o que ` +
        `a Sepse prescrevia.`
      );
    } else ok++;
    if (f(0) !== null || f(NaN) !== null) {
      falhas.push("`ataqueVancomicinaMg` não devolve null para peso ausente ou zero — sem isso o rótulo mostraria um número inventado.");
    } else ok++;
  }
}

console.log("\nAntibiótico e função renal — o piso nos nove, o ponteiro nos três, e um só cálculo\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ${esquemas.length} esquemas com piso, ponteiro onde há cobertura, ataque de vanco com fonte única e teto\n`);
process.exit(0);
