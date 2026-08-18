#!/usr/bin/env node
/**
 * PROMETE: que os três nós de contraindicação (AVC, SCA, TEP) tenham saída de
 *   dúvida com a lista completa; que as JANELAS PRÓPRIAS de cada indicação não
 *   se contaminem entre si; que os dois itens comuns venham da CONSTANTE
 *   COMPARTILHADA e não de cópia; que a exceção da SCA traga a razão; e que a
 *   divergência do TEP nomeie as duas fontes.
 * NÃO PROMETE: que as listas estejam completas segundo a diretriz primária — as
 *   fontes abertas foram bula, tabela adaptada e revisão (R-52), o que está
 *   declarado na tela. Não confere doses (test:coronarias, test:avc, test:tep).
 * UNIVERSO: as três árvores compiladas e lib/contraindicacao-trombolise.ts.
 *
 * ── O ACHADO QUE DESENHOU ISTO ──────────────────────────────────────────────
 *
 * A tentação era fonte única com acréscimos: as três listas se parecem. O autor
 * mandou conferir JANELA A JANELA antes, e das quatro que pareciam núcleo,
 * DUAS eram:
 *
 *   cirurgia intracraniana/intraespinhal → 3 MESES no AVC, 2 MESES na SCA
 *   AVC isquêmico recente → 3 meses no AVC; 3 meses na SCA COM EXCEÇÃO de 4,5 h;
 *                           3 (StatPearls) × 6 (ESC) no TEP
 *   pressão arterial → ALVO TRATÁVEL no AVC; relativa nas outras duas
 *   dissecção de aorta → absoluta no AVC e na SCA; não consta no TEP
 *
 * Fundir teria criado limiar errado em duas das três telas. Esta trava existe
 * para que a fusão não volte por descuido.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { textoDoNo } = require("./lib/textos-do-no.cjs");
const { exigeConsumo } = require("./lib/consumo.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const ARVORES = {
  avc: "avc-decision-tree.ts",
  coronary: "coronary-decision-tree.ts",
  tep: "tep-decision-tree.ts",
};

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ci-trombo-"));
const arv = {};
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      ...Object.values(ARVORES).map((f) => path.join(appDir, f)),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  for (const [k, f] of Object.entries(ARVORES)) {
    const mod = require(path.join(tempDir, f.replace(/\.ts$/, ".js")));
    arv[k] = Object.values(mod).find((v) => v && v.nodes);
  }
} catch (erro) {
  falhas.push(`as árvores não compilaram — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const NOS = {
  avc: ["isq_contraindicacoes", "ci_avc_lista"],
  coronary: ["stemi_fibrino_check", "ci_sca_lista"],
  tep: ["ar_trombolise_check", "ci_tep_lista"],
};

// ── A. A saída de dúvida existe nas três, e leva à lista ───────────────────
for (const [mod, [decisao, lista]] of Object.entries(NOS)) {
  const n = arv[mod]?.nodes?.[decisao];
  if (!n) {
    falhas.push(`\`${mod}/${decisao}\` não existe mais.`);
    continue;
  }
  const duvida = (n.options ?? []).find((o) => /não sei/i.test(o.label ?? ""));
  if (!duvida) {
    falhas.push(
      `\`${mod}/${decisao}\` voltou a ter só sim/não.\n` +
      `      ⚠️ Aqui o default sob dúvida é TROMBOLISAR: quem hesita responde "sem contraindicação" ` +
      `porque é o caminho de menor resistência.`
    );
  } else if (duvida.next !== lista) {
    falhas.push(`a saída de dúvida de \`${mod}\` aponta para "${duvida.next}", não para a lista.`);
  } else if (!arv[mod].nodes[lista]) {
    falhas.push(`a lista \`${lista}\` não existe — a saída de dúvida ficou órfã.`);
  } else ok++;
}

// ── B. OS DOIS COMUNS VÊM DA CONSTANTE, e aparecem inteiros nas três ───────
//
// Cópia à mão é o padrão que gerou metade dos achados desta auditoria; duas
// linhas não são exceção à regra.
{
  const fonte = lerFonte(path.join(appDir, "lib", "contraindicacao-trombolise.ts"));
  const comuns = ["CI_COMUM_HEMORRAGIA_INTRACRANIANA", "CI_COMUM_SANGRAMENTO_ATIVO"];
  for (const c of comuns) {
    if (!new RegExp(`export const ${c} =`).test(fonte)) {
      falhas.push(`a constante compartilhada \`${c}\` sumiu — os itens comuns voltaram a ser texto solto.`);
      continue;
    }
    ok++;
    for (const [mod, arquivo] of Object.entries(ARVORES)) {
      // Consumo DENTRO do bloco do nó — via helper, que já sabe descontar
      // import, comentário e uso em outro nó.
      if (!exigeConsumo(falhas, {
        arquivo: path.join(appDir, arquivo),
        constante: c,
        no: NOS[mod][1],
        porque:
          "Os dois itens comuns aparecem INTEIROS nas três telas, mas de uma fonte só — " +
          "três cópias à mão de \"hemorragia intracraniana prévia\" divergem no primeiro ajuste.",
      })) continue;
      ok++;
    }
  }
  // E o marcador de "comum" tem de estar visível ao médico, não só no código.
  for (const c of comuns) {
    const m = fonte.match(new RegExp(`export const ${c} =\\s*\\n?\\s*"([^"]+)"`));
    if (m && !/COMUM ÀS TRÊS INDICAÇÕES/.test(m[1])) {
      falhas.push(`\`${c}\` deixou de se declarar comum NA TELA — a marcação é o que o médico vê.`);
    } else ok++;
  }
}

// ── C. AS JANEIRAS PRÓPRIAS NÃO SE CONTAMINAM ──────────────────────────────
//
// É o coração desta trava: a semelhança de NOME entre as listas é altíssima e a
// de JANELA não — e é a janela que decide.
{
  const alvo = (mod) => textoDoNo(arv[mod]?.nodes?.[NOS[mod][1]]);

  const REGRAS = [
    ["avc", /cirurgia intracraniana ou intraespinhal, OU traumatismo craniano grave, nos ÚLTIMOS 3 MESES/i,
      "no AVC a janela de cirurgia intracraniana é 3 MESES"],
    ["coronary", /cirurgia intracraniana ou intraespinhal nos últimos 2 MESES/i,
      "na SCA a janela de cirurgia intracraniana é 2 MESES — não 3"],
    ["coronary", /EXCETO quando o AVC isquêmico é AGUDO, dentro de 4,5 h/i,
      "a exceção do AVC agudo é específica da SCA"],
    ["avc", /A PRESSÃO AQUI NÃO É CONTRAINDICAÇÃO — É ALVO/i,
      "no AVC a PA é alvo tratável, e nas outras duas é contraindicação relativa"],
    ["tep", /StatPearls[\s\S]{0,80}3 MESES[\s\S]{0,200}ESC 2019[\s\S]{0,40}6 MESES/i,
      "a divergência do TEP tem de dizer QUAL fonte diz o quê"],
  ];
  for (const [mod, padrao, porque] of REGRAS) {
    if (!padrao.test(alvo(mod))) falhas.push(`\`${mod}\`: ${porque} — e isso sumiu da lista.`);
    else ok++;
  }

  // ⚠️ CONTAMINAÇÃO CRUZADA: cada janela própria só pode existir na sua lista.
  const PROIBIDO = [
    ["avc", /2 MESES/i, "a janela de 2 meses é da SCA (cirurgia intracraniana) e não do AVC"],
    ["tep", /2 MESES/i, "a janela de 2 meses é da SCA e não do TEP"],
    ["avc", /4,5 h/i, "a exceção de 4,5 h é da SCA — no AVC ela seria a própria indicação, e confunde"],
    ["tep", /4,5 h/i, "a exceção de 4,5 h é da SCA e não existe no TEP"],
    ["coronary", /6 MESES/i, "a janela de 6 meses é a divergência do TEP e não vale na SCA"],
    ["avc", /6 MESES/i, "a janela de 6 meses é a divergência do TEP e não vale no AVC"],
  ];
  for (const [mod, padrao, porque] of PROIBIDO) {
    if (padrao.test(alvo(mod))) {
      falhas.push(
        `\`${mod}\`: ${porque}.\n` +
        `      ⚠️ É o R-36 nesta família: a semelhança de NOME entre as listas é altíssima e a de ` +
        `JANELA não — e é a janela que decide.`
      );
    } else ok++;
  }
}

// ── D. A frase do que fazer com a dúvida está nas três ─────────────────────
{
  for (const mod of Object.keys(NOS)) {
    const t = textoDoNo(arv[mod]?.nodes?.[NOS[mod][1]]);
    if (!/conta como PRESENTE at[ée] que alguém o afaste/i.test(t)) {
      falhas.push(
        `\`${mod}\`: sumiu o que fazer com o item que não se conseguiu excluir.\n` +
        `      ⚠️ Sem isso o ramo devolve uma lista e nenhuma conduta — e o caminho alternativo ` +
        `(angioplastia, trombectomia, embolectomia) é o que faz a dúvida não virar espera.`
      );
    } else ok++;
  }
}

// ── E. Vacuidade ───────────────────────────────────────────────────────────
{
  const total = Object.keys(NOS).reduce((s, m) => s + textoDoNo(arv[m]?.nodes?.[NOS[m][1]]).length, 0);
  if (total < 3000) falhas.push(`só ${total} caracteres nas três listas — pode ter rodado sobre nada (R-15 item 9).`);
  else ok++;
}

// ── F. OS DOIS RAMOS QUE FECHAM O BLOCO: ECG e oclusão de grande vaso ──────
//
// ⚠️ O do ECG é PONTEIRO, não escrita: os cinco padrões já eram constantes de
// lib/oclusao-sem-supra.ts e já estavam no módulo — em `evidence`, que a tela
// renderiza RECOLHIDA atrás do "Ver critérios (15)". O defeito era de ALCANCE.
//
// O do AVC é o COMO quando o QUANDO já existe (padrão do RUSH no Choque), e
// nomeia os ITENS 2, 3, 9 e 11 do NIHSS em vez de repetir a lista de sinais
// corticais — o médico que acabou de pontuar não reexamina o paciente.
{
  const { consomeConstante } = require("./lib/consumo.cjs");

  const ecg = arv.coronary?.nodes?.ecg;
  const duvidaEcg = (ecg?.options ?? []).find((o) => /não sei/i.test(o.label ?? ""));
  if (!duvidaEcg) {
    falhas.push(
      "`coronary/ecg` não tem saída de dúvida.\n" +
      "      ⚠️ O default sob dúvida é classificar como \"sem supra\" e seguir pela via do NSTEMI — " +
      "perdendo a sala de hemodinâmica de quem tem oclusão sem elevação."
    );
  } else if (duvidaEcg.next !== "ecg_sem_supra") {
    falhas.push(`a saída de dúvida do ECG aponta para "${duvidaEcg.next}".`);
  } else ok++;

  // Ponteiro de verdade: as MESMAS constantes nas duas superfícies.
  //
  // ⚠️ O UNIVERSO É O SUB-FLUXO DO ECG, NÃO UM NÓ (R-87). A conferência garante que
  // o ramo CONSUMA as constantes em vez de reescrever o padrão — ela nunca foi
  // sobre o nó em que cada uma vive.
  //
  // Em 2026-08-17 a varredura ganhou saída e o procedimento das derivações extras
  // virou passo próprio: `DERIVACOES_POSTERIORES_COMO` passou de `ecg_sem_supra`
  // para `ecg_derivacoes_extras`. Esta conferência reprovou, e nenhum caractere
  // saiu do app — proxy quebrado, não regressão.
  const SUBFLUXO_ECG = ["ecg_sem_supra", "ecg_sem_supra_saida", "ecg_derivacoes_extras", "ecg_sem_supra_achei", "ecg_sem_supra_duvida"];
  for (const c of ["OCLUSAO_DE_WINTER", "OCLUSAO_POSTERIOR", "OCLUSAO_T_HIPERAGUDA", "OCLUSAO_AVR_TRONCO", "DERIVACOES_POSTERIORES_COMO"]) {
    const onde = SUBFLUXO_ECG.filter(
      (no) => consomeConstante({ arquivo: path.join(appDir, "coronary-decision-tree.ts"), constante: c, no }).consome
    );
    const noRamo = { consome: onde.length > 0 };
    if (!noRamo.consome) {
      falhas.push(
        `nenhum nó do sub-fluxo do ECG consome \`${c}\` (${SUBFLUXO_ECG.join(", ")}).\n` +
        `      ⚠️ Este ramo é PONTEIRO: se ele reescrever o padrão em vez de consumir a constante, ` +
        `passam a existir duas versões do mesmo achado — e uma delas envelhece.`
      );
    } else ok++;
  }

  const lvo = arv.avc?.nodes?.lvo_como_saber;
  if (!lvo) {
    falhas.push("`avc/lvo_como_saber` não existe — o COMO da oclusão de grande vaso sumiu.");
  } else {
    ok++;
    const t = textoDoNo(lvo);
    for (const [nome, padrao, porque] of [
      ["os itens do NIHSS nomeados", /ITEM 2[\s\S]{0,300}ITEM 11/i,
       "os sinais corticais JÁ são coletados nos itens 2, 3, 9 e 11 — repetir a lista faria o médico reexaminar o paciente (R-48)"],
      ["o NIHSS sem limiar", /N[ÃA]O EXISTE UM N[ÚU]MERO QUE DEFINA/i,
       "a fonte prediz com AUROC 0,86 e NÃO estabelece ponto de corte — escrever um seria inventar precisão (R-41)"],
      ["as escalas fora de escopo", /RACE, LAMS, FAST-ED[\s\S]{0,120}N[ÃA]O S[ÃA]O PARA ESTA TELA/i,
       "são de triagem pré-hospitalar; aqui a angioTC responde direto — escopo declarado, não omissão"],
      ["o que NÃO se espera pela imagem", /N[ÃA]O ESPERE O LAUDO PARA TROMBOLISAR/i,
       "o risco de \"peça a angioTC\" é virar espera, com a janela andando"],
    ]) {
      if (!padrao.test(t)) falhas.push(`\`avc/lvo_como_saber\`: ${nome} sumiu — ${porque}.`);
      else ok++;
    }
  }
}

console.log("\nContraindicação ao trombolítico — três listas, dois itens comuns\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — janelas próprias sem contaminação, comuns de fonte única\n`);
process.exit(0);
