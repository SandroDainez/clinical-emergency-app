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
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "shock-decision-tree.ts";
const LIB = "lib/choque-diferencial.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs.readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const arvore = limpo(ARVORE);
const lib = limpo(LIB);

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

// ── D. A exceção do IAM de VD, que era o modelo ───────────────────────────
{
  if (!/EXCEÇÃO — IAM de ventrículo direito/.test(arvore)) {
    falhas.push(
      `${ARVORE}: sumiu a exceção do IAM de VD. Ela é o MODELO de como o módulo nomeia uma confusão ` +
      `perigosa e escreve a conduta invertida — e é por isso que o texto novo foi escrito na mesma forma.`
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
