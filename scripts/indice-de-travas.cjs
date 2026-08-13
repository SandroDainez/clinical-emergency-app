/**
 * indice-de-travas.cjs — D-15
 *
 * PROMETE: que exista um índice VERIFICÁVEL do que cada trava do `test:all`
 *   cobre, gerado do próprio código, e que nenhuma trava nova entre no pipeline
 *   sem declarar o que promete, o que não promete e o universo que enxerga.
 * NÃO PROMETE: que as declarações sejam VERDADEIRAS. Ele lê o que a trava diz
 *   de si mesma; provar que ela faz o que diz é o papel da mutação (R-1).
 * UNIVERSO: todas as etapas de `test:all` que executam um script em scripts/.
 *
 * ── POR QUE ISTO EXISTE ─────────────────────────────────────────────────────
 *
 * Duas vezes nesta auditoria eu comecei a construir um verificador que JÁ
 * EXISTIA — a lista de siglas do D-3 e a alcançabilidade do grafo. Nas duas o
 * instrumento estava correto e completo; a lacuna era do INVENTÁRIO.
 *
 * Com 34 etapas no `test:all`, ninguém sabe de cabeça o que o pipeline cobre. E
 * "módulo fechado" (R-20) só significa alguma coisa se der para verificar QUAIS
 * travas guardam aquele módulo — o que exige saber o que cada uma promete.
 *
 * ── O CABEÇALHO PADRÃO ──────────────────────────────────────────────────────
 *
 * Três campos no comentário de topo, exatamente com estes rótulos:
 *
 *   PROMETE:      o que ela garante quando passa
 *   NÃO PROMETE:  o que o verde dela NÃO diz — a parte que evita falsa segurança
 *   UNIVERSO:     onde ela olha (árvore inteira? lista fixa? um arquivo?)
 *
 * O campo NÃO PROMETE não é decorativo: foi a falta dele que deixou o
 * `test:arvores` parecer cobrir correção clínica, e é o mecanismo da D-5.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const pkg = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));

const etapas = pkg.scripts["test:all"]
  .split("&&")
  .map((x) => x.trim().replace(/^npm run /, ""));

/** Resolve uma etapa até o arquivo de script, seguindo um nível de indireção. */
const arquivoDa = (etapa) => {
  const cmd = pkg.scripts[etapa] || etapa;
  const m = cmd.match(/node\s+\.\/(scripts\/[\w.-]+\.cjs)/);
  return m ? m[1] : null;
};

const CAMPOS = ["PROMETE", "NÃO PROMETE", "UNIVERSO"];

const linhas = [];
const semDeclaracao = [];
let completos = 0;

for (const etapa of etapas) {
  const rel = arquivoDa(etapa);
  if (!rel) {
    linhas.push({ etapa, rel: "—", campos: null, nota: "não executa script em scripts/ (e2e, playwright)" });
    continue;
  }
  const abs = path.join(appDir, rel);
  if (!fs.existsSync(abs)) {
    linhas.push({ etapa, rel, campos: null, nota: "ARQUIVO NÃO ENCONTRADO" });
    continue;
  }
  const texto = fs.readFileSync(abs, "utf8");
  const topo = texto.slice(0, texto.indexOf("*/") + 2);

  const campos = {};
  for (const campo of CAMPOS) {
    // O campo vai do rótulo até o próximo rótulo ou o fim do bloco.
    const re = new RegExp(`\\*\\s*${campo.replace("Ã", "Ã")}:\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\s*(?:${CAMPOS.join("|")}):|\\n\\s*\\*\\s*$|\\*/)`);
    const m = topo.match(re);
    if (m) {
      campos[campo] = m[1]
        .split("\n")
        .map((l) => l.replace(/^\s*\*\s?/, "").trim())
        .filter(Boolean)
        .join(" ");
    }
  }
  const completo = CAMPOS.every((c) => campos[c]);
  if (completo) completos++;
  else semDeclaracao.push({ etapa, rel, faltando: CAMPOS.filter((c) => !campos[c]) });
  linhas.push({ etapa, rel, campos, completo });
}

// ── Relatório ───────────────────────────────────────────────────────────────
const comScript = linhas.filter((l) => l.campos !== null || l.rel !== "—");
const md = [];
md.push("# Índice das travas do `test:all`");
md.push("");
md.push("**GERADO DE `scripts/indice-de-travas.cjs` — não editar à mão.**");
md.push("");
md.push(
  "Este índice existe porque o `test:all` ficou grande demais para alguém saber de " +
  "cabeça o que ele cobre. Duas vezes nesta auditoria começou-se a construir um " +
  "verificador que já existia; a lacuna era de inventário, não de cobertura."
);
md.push("");
md.push(
  "⚠️ Ele lê o que cada trava **diz de si mesma**. Que a declaração seja verdadeira " +
  "é o que a mutação prova (R-1), não este índice."
);
md.push("");
md.push(`**${completos} de ${comScript.length} travas com declaração completa.**`);
md.push("");

for (const l of linhas) {
  if (!l.campos) {
    md.push(`## \`${l.etapa}\``);
    md.push("");
    md.push(`_${l.nota}_`);
    md.push("");
    continue;
  }
  md.push(`## \`${l.etapa}\` → \`${l.rel}\``);
  md.push("");
  if (l.completo) {
    for (const c of CAMPOS) md.push(`- **${c}:** ${l.campos[c]}`);
  } else {
    for (const c of CAMPOS) {
      md.push(l.campos[c] ? `- **${c}:** ${l.campos[c]}` : `- **${c}:** ⚠️ NÃO DECLARADO`);
    }
  }
  md.push("");
}

fs.writeFileSync(path.join(appDir, "auditoria/INDICE-DE-TRAVAS.md"), md.join("\n"));

console.log(`\nÍndice das travas — o que o test:all promete\n`);
console.log(`Etapas: ${etapas.length} · com script: ${comScript.length} · declaração completa: ${completos}`);
console.log(`Saída em auditoria/INDICE-DE-TRAVAS.md`);

if (semDeclaracao.length) {
  console.log(`\n⚠️  ${semDeclaracao.length} trava(s) sem declaração completa:`);
  for (const s of semDeclaracao) {
    console.log(`     ${s.etapa.padEnd(24)} falta: ${s.faltando.join(", ")}`);
  }
  console.log(
    `\n   Isto NÃO derruba o build hoje: as travas antigas nasceram antes da convenção,\n` +
    `   e exigir tudo de uma vez transformaria a D-15 em bloqueio. O que a trava\n` +
    `   impede é a REGRESSÃO — ver abaixo.`
  );
}

// ── A parte que TRAVA ───────────────────────────────────────────────────────
//
// Um PISO numérico não serve, e a mutação mostrou por quê: com o piso em 14 e
// 15 declarações reais, dava para uma trava perder o cabeçalho sem derrubar
// nada — e uma trava NOVA entrar sem declarar, porque o piso continuava de pé.
// Piso mede quantidade; o que importa é QUEM.
//
// Então a lista é explícita: estas 19 nasceram antes da convenção e estão
// isentas POR NOME. Qualquer coisa fora dela declara ou o build cai. Quando
// alguém declarar uma legada, tira daqui — e a lista só encolhe.
const LEGADO_SEM_DECLARACAO = new Set([
  "test:engine", "test:guiado", "test:contexto", "test:faixas", "test:voice",
  "test:nota-epi", "node ./scripts/verify-acls-flow.cjs", "audit:confirmacao", "validate:acls-audio",
  "validate:audio-textos", "validate:audio-duracao", "validate:sem-ia",
  "test:contraste", "test:acls", "test:motor", "test:consistencia",
  "test:sulfatacao", "test:avc", "test:coronary",
]);

const novasSemDeclarar = semDeclaracao.filter((s) => !LEGADO_SEM_DECLARACAO.has(s.etapa));
const legadasQueDeclararam = [...LEGADO_SEM_DECLARACAO].filter(
  (nome) => !semDeclaracao.some((s) => s.etapa === nome) && etapas.includes(nome)
);

if (novasSemDeclarar.length) {
  console.error(`\n❌ ${novasSemDeclarar.length} trava(s) no test:all sem declarar o que cobrem:\n`);
  for (const s of novasSemDeclarar) {
    console.error(`     ${s.etapa.padEnd(24)} falta: ${s.faltando.join(", ")}`);
  }
  console.error(
    `\n   Toda trava precisa de PROMETE / NÃO PROMETE / UNIVERSO no comentário de topo.\n` +
    `   O campo NÃO PROMETE é o que impede o verde dela de virar falsa segurança (D-5).\n` +
    `   Se for legado anterior à convenção, acrescente o nome a LEGADO_SEM_DECLARACAO\n` +
    `   nesta trava — de propósito, para ficar visível que a dívida cresceu.\n`
  );
  process.exit(1);
}

if (legadasQueDeclararam.length) {
  console.error(
    `\n❌ ${legadasQueDeclararam.length} trava(s) já declaram e continuam na lista de legado: ` +
    `${legadasQueDeclararam.join(", ")}.\n   Tire-as de LEGADO_SEM_DECLARACAO — a lista só encolhe.\n`
  );
  process.exit(1);
}

console.log(`\n✅ ${completos} declaradas · ${LEGADO_SEM_DECLARACAO.size} isentas por serem anteriores à convenção\n`);
