#!/usr/bin/env node
/**
 * PROMETE
 *   Que os pares que se confundem continuem NOMEADOS com as condutas opostas
 *   escritas; que a ressalva esteja no nó em que o erro acontece; que o RUSH
 *   diga o que olhar; e que o choque misto tenha saída.
 *
 * NÃO PROMETE
 *   Cobertura dos quatro tipos. É a primeira auditoria do módulo, e a trava
 *   nasceu depois dela (R-21).
 *
 * UNIVERSO
 *   A árvore do choque e a lib do diferencial.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A PERDA DA EXCLUSÃO DO OBSTRUTIVO. Cardiogênico e obstrutivo compartilham
 *    frio, jugular distendida, PVC alta e débito baixo — e a conduta quanto a
 *    VOLUME é oposta. Sem a ressalva, o app tem os dois nós e nada que impeça
 *    trocá-los.
 *
 * 2. A RESSALVA VIRAR AVISO GENÉRICO. Ela precisa estar NO NÓ DO CARDIOGÊNICO
 *    e NO NÓ DE DECISÃO DO OBSTRUTIVO — é onde a pessoa erra. Aviso geral de
 *    "reavalie" não é lido.
 *
 * 3. A PERDA DO SINAL DE ERRO. "Se piorar com diurético ou não melhorar com
 *    inotrópico, o ramo estava errado" é o que devolve reversibilidade a uma
 *    cascata sim/não em que um "não" no obstrutivo é irreversível no grafo.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "shock-decision-tree.ts";
const LIB = "lib/choque-diferencial.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  lerFonte(path.join(appDir, rel))
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const arvore = limpo(ARVORE);
const lib = limpo(LIB);

// ── A0. O GATILHO DO LAST — a porta que faltava ao caso TARDIO ────────────
//
// ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): o LAST tinha QUATRO portas, e as quatro
// eram do caso IMEDIATO ("após bloqueio/infiltração"). O paciente com cateter
// perineural ou peridural contínua que deteriora HORAS depois cai neste módulo, e
// os 31 nós daqui não mencionavam anestésico local uma única vez.
//
// Mesmo defeito da puérpera com crise: o conteúdo existe e não alcança quem
// precisa.
//
// ⚠️ ESTA SEÇÃO LÊ O ARTEFATO COMPILADO, não o fonte (R-82) — o que se confere é
// o texto que a TELA recebe.
{
  const os = require("node:os");
  const { execFileSync } = require("node:child_process");
  const { textosDoNo } = require("./lib/textos-do-no.cjs");
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "choque-last-"));
  let arv = null;
  try {
    execFileSync("npx", [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
      "shock-decision-tree.ts",
    ], { cwd: appDir, stdio: "pipe" });
  } catch { /* tsc reclama de tipos e ainda emite */ }
  const js = path.join(tmp, "shock-decision-tree.js");
  if (fs.existsSync(js)) {
    const mod = require(js);
    arv = Object.values(mod).find((v) => v && v.nodes) ?? null;
  }
  if (!arv) {
    falhas.push("a árvore do choque não compilou — as conferências do gatilho do LAST NÃO RODARAM.");
  } else {
    ok++;
    const texto = (id) => (arv.nodes[id] ? textosDoNo(arv.nodes[id]).join("\n") : "");

    // ── (1) O NÓ DE ENTRADA, antes de classificar o padrão ──────────────
    const entrada = texto("estabilizacao_metas");
    if (!/anest[ée]sico local/i.test(entrada)) {
      falhas.push(
        "`estabilizacao_metas` perdeu o gatilho do LAST. ⚠️ É o último nó por onde TODO choque passa " +
        "antes da primeira pergunta de classificação — e o LAST não é distributivo nem hipovolêmico: " +
        "quem classifica primeiro já errou."
      );
    } else ok++;

    // ⚠️ AS TRÊS COISAS QUE O GATILHO PRECISA TER, e nenhuma é decorativa.
    const exigencias = [
      ["a JANELA (\"últimas horas\", infusão contínua)", /[úu]ltimas horas|infus[ãa]o cont[íi]nua|horas ou dias/i,
       "sem a janela ele vira a QUINTA porta do LAST imediato — que já tem quatro — e o tardio segue sem nenhuma"],
      // ⚠️ "bloqueio" SAIU DA REGEX, e a MUTAÇÃO foi quem mostrou: em português a
      // palavra é ambígua — bloqueio ANESTÉSICO (o procedimento) e bloqueio AV (o
      // ritmo). O gatilho encurtado dizia "colapso após bloqueio ou infiltração",
      // sem padrão cardíaco nenhum, e esta conferência PASSOU casando com o
      // procedimento. Ficam só os termos que não têm outro sentido aqui.
      ["o PADRÃO cardíaco (bradicardia, arritmia ventricular, assistolia)",
       /bradicardia|arritmia ventricular|assistolia/i,
       "gatilho que diz só \"colapso\" não ajuda a reconhecer: todo choque colapsa"],
      ["o QUE PROCURAR sem quem responder (cateter, curativo, bomba)", /cateter|curativo|bomba de infus/i,
       "se não há quem informe o procedimento, \"não sei\" sem o que procurar é um beco (I2)"],
    ];
    for (const [nome, padrao, porque] of exigencias) {
      if (!padrao.test(entrada)) {
        falhas.push(`o gatilho do LAST no choque perdeu ${nome} — ${porque}.`);
      } else ok++;
    }

    // ── (2) A REDE NO DISTRIBUTIVO, com a razão OPOSTA ──────────────────
    const distributivo = texto("dx_distributivo_outro");
    if (!/anest[ée]sico local/i.test(distributivo)) {
      falhas.push(
        "`dx_distributivo_outro` perdeu a rede do LAST. Aqui ela pega quem já classificou ERRADO, " +
        "e é por isso que existe além do gatilho da entrada."
      );
    } else ok++;
    if (!/n[ãa]o pertence a este ramo|n[ãa]o [ée] distributivo|vasoplegia/i.test(distributivo)) {
      falhas.push(
        "a rede do LAST no distributivo virou cópia do gatilho da entrada. ⚠️ Ela precisa dizer o que o outro " +
        "NÃO diz: o colapso do LAST vem de BLOQUEIO DE CANAL DE SÓDIO — depressão miocárdica e arritmia —, " +
        "não de vasoplegia, e insistir em volume e noradrenalina atrasa o antídoto."
      );
    } else ok++;
  }
}

// ── A. O par cardiogênico × obstrutivo, com a conduta oposta ──────────────
{
  for (const [nome, padrao] of [
    ["a exclusão do obstrutivo antes do cardiogênico", /ANTES DE TRATAR COMO CARDIOGÊNICO, EXCLUA TAMPONAMENTO E TEP/],
    ["o que os torna indistinguíveis à beira do leito", /jugular distendida, PVC alta e débito baixo/],
    ["a conduta OPOSTA quanto a volume", /ponte de sobrevida[\s\S]{0,60}afoga/],
    ["o SINAL de que o ramo estava errado", /PIORAR com diurético ou NÃO MELHORAR com inotrópico/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: ${nome} sumiu. Sem isso o app tem os dois nós e nada que impeça trocá-los — e a ` +
        `cascata torna o erro irreversível: quem responde "não" ao obstrutivo nunca mais volta lá.`
      );
    } else ok++;
  }

  // ⚠️ A ressalva tem de estar NOS DOIS NÓS onde o erro acontece.
  if (!/CHOQUE_CARDIOGENICO_EXCLUIR_OBSTRUTIVO/.test(semImports(ARVORE))) {
    falhas.push(`${ARVORE}: o nó do cardiogênico não consome a exclusão do obstrutivo.`);
  } else ok++;
  if (!/RESPONDER \\"NÃO\\" AQUI FECHA ESTA PORTA|RESPONDER "NÃO" AQUI FECHA ESTA PORTA/.test(arvore)) {
    falhas.push(
      `${ARVORE}: o nó de DECISÃO do obstrutivo perdeu o aviso de que responder "não" fecha a porta. ` +
      `A ressalva no nó do cardiogênico chega tarde para quem já saiu do ramo.`
    );
  } else ok++;
}

// ── B. Choque misto: o dominante manda, sem negar o outro ─────────────────
{
  for (const [nome, padrao] of [
    ["a saída para o choque misto", /CHOQUE MISTO/],
    ["o critério do mecanismo dominante", /mecanismo DOMINANTE/],
    ["que escolher um não é negar o outro", /NÃO É NEGAR O OUTRO/],
    ["o sinal do segundo mecanismo", /melhorou e parou de melhorar/],
    ["o caso concreto do séptico com hipovolemia", /DISTRIBUTIVO E HIPOVOLÊMICO ANDAM JUNTOS/],
    ["o erro seguinte, de culpar o diagnóstico", /concluir que o DIAGNÓSTICO está errado/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: ${nome} sumiu. O misto é regra, não exceção — e a cascata força escolher um, que é a ` +
        `mesma classe do defeito do CAD/EHH.`
      );
    } else ok++;
  }
}

// ── C. O RUSH como COMO, ancorado no par que resolve ──────────────────────
{
  for (const [nome, padrao] of [
    ["a janela da VCI", /VCI — colabável/],
    ["a janela do pericárdio", /PERICÁRDIO — derrame com colapso/],
    ["a janela do ventrículo direito", /VENTRÍCULO DIREITO — dilatado/],
    ["a janela da contratilidade", /CONTRATILIDADE do ventrículo esquerdo/],
    ["a pergunta que o exame responde", /ESTE PACIENTE ACEITA VOLUME/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: ${nome} sumiu do RUSH. Citar o exame sem dizer o que olhar deixa a ressalva do par ` +
        `sendo só aviso — um bloco resolve o outro.`
      );
    } else ok++;
  }
  if (!/CHOQUE_RUSH_COMO/.test(semImports(ARVORE))) {
    falhas.push(`${ARVORE}: não consome CHOQUE_RUSH_COMO.`);
  } else ok++;
}

// ── D. A ressalva do IAM de VD, preservada semanticamente ─────────────────
{
  const nomeiaVD = /IAM de ventrículo direito/.test(arvore);
  const evitaVolumeLiberal = /NÃO autoriza volume liberal/.test(arvore) || /volume NÃO é tratamento automático/.test(arvore);
  const pequenaAliquota = /pequenas alíquotas|pequena alíquota/.test(arvore);
  const reavaliaCongestao = /congestão|ausência de resposta/.test(arvore);
  if (!(nomeiaVD && evitaVolumeLiberal && pequenaAliquota && reavaliaCongestao)) {
    falhas.push(
      `${ARVORE}: a ressalva do IAM de VD perdeu a inversão clínica segura: deve nomear o IAM de VD, ` +
      `impedir volume liberal, limitar a pequenas alíquotas quando baixa pré-carga for provável e exigir reavaliação.`
    );
  } else ok++;
}

console.log("\nChoque — os pares que se confundem, e o ultrassom que os separa\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — a ressalva está onde o erro acontece\n`);
process.exit(0);
