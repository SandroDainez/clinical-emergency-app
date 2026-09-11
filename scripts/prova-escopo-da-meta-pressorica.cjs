#!/usr/bin/env node
/**
 * TRAVA DO ESCOPO DA META PRESSÓRICA NO CHOQUE — D-137.
 *
 * PROMETE: que nenhum arquivo de runtime atribua a meta de **PAM 90–100 mmHg**
 *   a "lesão cerebral grave"; que toda ocorrência dessa meta venha acompanhada
 *   de "hipertensão intracraniana", que é o escopo literal da fonte (F-33
 *   §4.2, p. 5); que a classificação do choque hemorrágico NÃO seja atribuída
 *   ao ATLS, que o documento não cita; que a afirmação de metas hemodinâmicas
 *   gerais carregue a ressalva do próprio documento de que as metas variam com
 *   o contexto clínico.
 *
 * NÃO PROMETE: que os números estejam certos contra o PDF — isso é a
 *   transcrição F-33, e trava nenhuma substitui leitura. Também NÃO promete
 *   que o texto chegue ou não chegue à tela: mede o texto, não a renderização.
 *   A medição de alcance está em `auditoria/D-137-ESCOPO-DA-META-PRESSORICA.md`.
 *
 * UNIVERSO: todos os arquivos versionados, EXCETO `auditoria/` e
 *   `protocols/fontes-verbatim/`. Esses dois precisam poder citar o texto
 *   errado — um para transcrever a fonte, o outro para documentar o defeito.
 *   Isentar por natureza do arquivo, e nunca por pasta de conveniência.
 *
 * ── ⚠️⚠️⚠️ O DEFEITO QUE ELA FECHA ────────────────────────────────────────
 *
 * A fonte tem DUAS afirmações independentes na mesma página:
 *
 *   1. "Até hemostasia efetiva, deve-se tolerar PAM <65 mmHg em pacientes com
 *      sangramento ativo e SEM LESÃO CEREBRAL GRAVE"
 *   2. "Para pacientes neurológicos agudos COM HIPERTENSÃO INTRACRANIANA
 *      (suspeita ou confirmada) : meta de PAM 90 a 100mmHg"
 *
 * O transporte antigo fundiu as duas e escreveu que 90–100 valia para "lesão
 * cerebral grave". A exclusão da primeira virou a condição da segunda, e a
 * população se ampliou de uma CONDIÇÃO para um UNIVERSO.
 *
 * ⚠️ Nenhuma trava pegava isso. A varredura de i18n exige que exista par
 * PT/ES, e não olha o conteúdo — corrigir os dois lados juntos a mantém verde
 * mesmo quando os dois lados estão errados.
 */
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

/** Arquivos que PODEM citar o texto errado, e por quê. Natureza, não pasta. */
const PODEM_CITAR = [
  {
    prefixo: "protocols/fontes-verbatim/",
    motivo: "transcrição verbatim: precisa reproduzir a fonte, inclusive a linha que o app deturpou",
  },
  {
    prefixo: "auditoria/",
    motivo: "auditoria e dívidas: documentam o defeito citando o texto errado lado a lado com o certo",
  },
  {
    prefixo: "scripts/prova-escopo-da-meta-pressorica.cjs",
    motivo: "a própria trava: precisa carregar os padrões que procura",
  },
];

const versionados = execFileSync("git", ["ls-files", "-z"], { cwd: appDir })
  .toString()
  .split("\0")
  .filter(Boolean)
  .filter((f) => !PODEM_CITAR.some((e) => f.startsWith(e.prefixo)));

/**
 * ⚠️ Lê a ÁRVORE DE TRABALHO, e nunca o índice do git. Uma trava que lê
 * `git show :arquivo` mede o que foi adicionado, não o que está escrito — e
 * aprovaria uma correção que ninguém salvou, ou reprovaria uma que ninguém
 * ainda deu `git add`.
 */
function conteudo(rel) {
  return require("node:fs").readFileSync(path.join(appDir, rel), "utf8");
}

/** Só arquivos de texto: binário não carrega afirmação clínica. */
const TEXTO = /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sql|yml|yaml|toml)$/;
const alvos = versionados.filter((f) => TEXTO.test(f));

/**
 * ⚠️⚠️ A FAIXA SOZINHA NÃO IDENTIFICA A AFIRMAÇÃO. "PAD 90–100 mmHg" é meta
 * de pré-eclâmpsia e não tem nada com choque; casar só pelo número
 * transformaria esta trava em falso positivo sobre outro módulo — e o preço
 * de silenciar isso por pasta seria um falso negativo silencioso.
 *
 * Por isso: acha a faixa, e depois pergunta QUAL parâmetro a governa, olhando
 * o último token de pressão antes dela na mesma linha. Só PAM/MAP conta.
 */
const FAIXA = /90\s*[–\-a]\s*100/g;
const TOKEN_DE_PRESSAO = /\b(PAM|MAP|PAD|PAS|TAM)\b/g;

function ehMetaDePAM(linha) {
  FAIXA.lastIndex = 0;
  let m;
  while ((m = FAIXA.exec(linha)) !== null) {
    const antes = linha.slice(0, m.index);
    TOKEN_DE_PRESSAO.lastIndex = 0;
    let ultimo = null;
    let t;
    while ((t = TOKEN_DE_PRESSAO.exec(antes)) !== null) ultimo = t[1];
    if (ultimo === "PAM" || ultimo === "MAP" || ultimo === "TAM") return true;
  }
  return false;
}
const LESAO_GRAVE = /les[ãa]o cerebral grave|lesi[óo]n cerebral grave/i;
const HIC = /hipertens[ãa]o intracraniana|hipertensi[óo]n intracraneal/i;

let arquivosLidos = 0;
let ocorrenciasDaMeta = 0;

for (const rel of alvos) {
  const txt = conteudo(rel);
  arquivosLidos++;
  if (!/90\s*[–\-a]\s*100/.test(txt)) continue;

  // Mede por LINHA: a afirmação clínica vive na linha, e é nela que a
  // população foi trocada.
  txt.split("\n").forEach((linha, i) => {
    if (!ehMetaDePAM(linha)) return;
    ocorrenciasDaMeta++;
    const onde = `${rel}:${i + 1}`;

    confere(
      `${onde} — a meta de 90–100 não é atribuída a "lesão cerebral grave"`,
      !LESAO_GRAVE.test(linha) || HIC.test(linha),
      `a fonte atribui essa meta a "pacientes neurológicos agudos COM hipertensão intracraniana (suspeita ou confirmada)". ` +
        `"Lesão cerebral grave" é a EXCLUSÃO de outra linha — a de tolerar PAM < 65 — e não é equivalente.`
    );

    confere(
      `${onde} — a meta de 90–100 declara o escopo da fonte`,
      HIC.test(linha),
      `toda ocorrência de PAM 90–100 tem de nomear "hipertensão intracraniana". Sem isso a meta fica sem população, ` +
        `e meta sem população é a porta de entrada para virar meta geral de AVC.`
    );
  });
}

confere(
  "a meta de 90–100 continua existindo em algum lugar do runtime",
  ocorrenciasDaMeta > 0,
  "zero ocorrências: ou o conteúdo sumiu, ou os padrões desta trava pararam de casar. " +
    "Uma trava que não encontra nada não está aprovando nada — está cega."
);

// ── A atribuição da tabela de classes do choque hemorrágico ───────────────
for (const rel of alvos) {
  const txt = conteudo(rel);
  txt.split("\n").forEach((linha, i) => {
    if (!/classifica[çc][ãa]o d[eo] choque hemorr[áa]gico|clasificaci[óo]n del choque hemorr[áa]gico/i.test(linha)) return;
    confere(
      `${rel}:${i + 1} — a classificação hemorrágica não é atribuída ao ATLS`,
      !/\bATLS\b/.test(linha) || /N[ãa]o [ée] ATLS|NO es ATLS/i.test(linha),
      `o pathway referencia essa tabela como Cannon JW, N Engl J Med 2018 (referência 8). ` +
        `O ATLS não é citado em nenhuma das 8 páginas do documento.`
    );
  });
}

// ── A ressalva das metas gerais ───────────────────────────────────────────
let achouMetasGerais = 0;
for (const rel of alvos) {
  const txt = conteudo(rel);
  txt.split("\n").forEach((linha, i) => {
    if (!/metas hemodin[âa]micas gerais|metas gerais: PAM/i.test(linha)) return;
    achouMetasGerais++;
    confere(
      `${rel}:${i + 1} — as metas gerais carregam a ressalva da fonte`,
      /podem variar|pueden variar/i.test(linha),
      `o documento traz, sob a própria tabela, "As metas podem variar de acordo com o contexto clínico. ` +
        `Consultar também as Metas Específicas para as várias causas de choque". Sem a ressalva, ` +
        `uma meta condicional vira alvo universal.`
    );
  });
}

confere(
  "a afirmação de metas gerais continua no universo da trava",
  achouMetasGerais > 0,
  "nenhuma linha de metas gerais encontrada — trava cega."
);

console.log(
  `\n${falhas.length ? "❌" : "✅"} ESCOPO DA META PRESSÓRICA (D-137) — ` +
    `${ok}/${ok + falhas.length} conferências · ${arquivosLidos} arquivos · ` +
    `${ocorrenciasDaMeta} ocorrência(s) da meta de 90–100\n`
);
if (falhas.length) {
  falhas.forEach((f) => console.log(`   ❌ ${f}\n`));
  console.log("   Isentos por natureza:");
  PODEM_CITAR.forEach((e) => console.log(`     · ${e.prefixo} — ${e.motivo}`));
  process.exit(1);
}
