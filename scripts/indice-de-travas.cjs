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
const { execFileSync: exec } = require("child_process");
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

// ── COBERTURA POR MÓDULO ────────────────────────────────────────────────────
//
// O índice dizia o que cada trava NÃO promete, e não dizia nada sobre MÓDULO
// QUE NÃO TEM TRAVA NENHUMA. Quem lia "38 travas" não via os buracos.
//
// A distinção que importa é entre dois tipos de cobertura:
//   ESTRUTURA — o grafo da árvore é percorrido (test:arvores, test:motor) e o
//     módulo abre sem erro (e2e/modulos.spec.ts). Vale para TODOS por
//     construção; não diz nada sobre o conteúdo clínico estar certo.
//   CONTEÚDO — existe trava que confere doses, limiares, fontes ou condutas
//     daquele módulo especificamente.
//
// Módulo sem cobertura de CONTEÚDO não é defeito por si — é informação que
// quem for mexer nele precisa ter ANTES, e o índice é o que se abre.
{
  // ⚠️ AUDITADO é DECLARADO, não derivado — e a distinção é o ponto desta seção.
  //
  // Nenhuma consulta ao código responde "este módulo foi auditado?": trava que
  // cita a árvore prova que a árvore CONSOME uma fonte única, não que o
  // conteúdo clínico foi conferido contra fonte externa. A primeira versão
  // desta tabela derivava "Conteúdo ✅" da citação e marcava AVC como coberto
  // por `test:peso` — que confere peso predito, não AVC.
  //
  // Por isso a coluna da direita mudou de nome: ela diz o que o dado sustenta
  // ("travas que TOCAM o módulo"), e a coluna de auditoria é escrita à mão.
  const AUDITADOS = new Set([
    // Fase 1 — dos seis módulos auditados, só DOIS têm árvore de decisão.
    "ventilation", "rsi",
    // D-22 — tocados nos Blocos 1–3, com fonte aberta por item
    "anaphylaxis", "eap", "sepsis", "dka-hhs",
  ]);

  // Auditados que NÃO aparecem nesta tabela porque não têm árvore: são telas de
  // calculadora (Vasoativas, Sedoanalgesia, Eletrólitos, Calculadoras
  // Clínicas), com conteúdo em `*-engine.ts` ou na própria tela. A tabela
  // abaixo cobre módulos de ÁRVORE — dizer isso evita que alguém leia a
  // ausência deles como lacuna de auditoria.
  const AUDITADOS_SEM_ARVORE = ["Vasoativas", "Sedoanalgesia", "Eletrólitos", "Calculadoras Clínicas"];

  const modulos = fs.readdirSync(appDir)
    .filter((f) => /-decision-tree\.ts$/.test(f))
    .map((f) => f.replace("-decision-tree.ts", ""))
    .sort();

  // Uma trava cobre CONTEÚDO de um módulo se cita a árvore dele pelo nome.
  const cobertura = new Map(modulos.map((m) => [m, []]));
  for (const etapa of etapas) {
    const arq = arquivoDa(etapa);
    if (!arq) continue;
    let txt;
    try { txt = fs.readFileSync(path.join(appDir, arq), "utf8"); } catch { continue; }
    // ⚠️ CITAR A ÁRVORE NÃO É COBRIR O MÓDULO. Travas TRANSVERSAIS (peso
    // predito, fluxo guiado, prazos) citam quase todas as árvores porque
    // varrem o app inteiro — contá-las como cobertura de conteúdo daria
    // "✅" ao AVC e às Coronárias, que é exatamente o oposto da D-25.
    //
    // O critério é de EFEITO: trava que cita MUITAS árvores é transversal
    // (vigia uma propriedade comum); trava que cita POUCAS é do módulo.
    const citadas = modulos.filter((m) => txt.includes(`${m}-decision-tree`));
    if (citadas.length > 4) continue;
    for (const m of citadas) cobertura.get(m).push(etapa);
  }

  md.push("---", "", "## Cobertura por módulo — e onde ela NÃO existe", "");
  md.push(
    "**ESTRUTURA** vale para todos por construção: `test:arvores` percorre o grafo",
    "de cada árvore e `e2e/modulos.spec.ts` abre os 30 módulos. Isso NÃO diz que o",
    "conteúdo clínico está certo — diz que ele é alcançável e que a tela monta.", "",
    `**Fora desta tabela, e auditados:** ${AUDITADOS_SEM_ARVORE.join(" · ")} — são telas`,
    "de calculadora, sem árvore de decisão. A ausência deles aqui não é lacuna.", ""
  );
  // ⚠️ NÓS INTERROGADOS — a coluna que faltava para o índice significar algo.
  //
  // "Tem trava" não é informação: `valida-choque` lê o arquivo inteiro, é verde,
  // e não pergunta nada sobre 20 dos 31 nós do módulo (R-74). "Guarda 11 de 31"
  // é o dado útil, e ele vem MEDIDO — `scripts/cobertura-por-no.cjs` —, nunca
  // escrito à mão, para não apodrecer como coluna declarada.
  const porNo = new Map();
  try {
    const saida = exec("node", [path.join(appDir, "scripts", "cobertura-por-no.cjs")], {
      cwd: appDir,
      encoding: "utf8",
    });
    for (const linha of saida.split("\n")) {
      const m = linha.match(/^\s{2}(\S+)\s+(\d+)\s+(\d+)\s+(\d+)%/);
      if (m) porNo.set(m[1], { total: +m[2], cobertos: +m[3], pct: +m[4] });
    }
  } catch {
    /* medição indisponível — a coluna sai como "—", e isso é visível */
  }

  md.push(
    "| Módulo | Estrutura | Auditado na Fase 1–2 | **Nós interrogados** | Travas que TOCAM o módulo |",
    "|---|---|---|---|---|"
  );
  const semConteudo = [];
  for (const m of modulos) {
    const ts = cobertura.get(m);
    if (!ts.length) semConteudo.push(m);
    const c = porNo.get(m.replace(/-adulto$/, "")) ?? porNo.get(m);
    const nos = c ? `${c.cobertos}/${c.total} (${c.pct}%)` : "—";
    md.push(
      `| \`${m}\` | ✅ | ${AUDITADOS.has(m) ? "✅" : "—"} | ${nos} | ${ts.length ? ts.join(", ") : "**nenhuma**"} |`
    );
  }
  md.push(
    "",
    "⚠️ **Nós interrogados** é medida de ALCANCE, não de qualidade: conta os nós",
    "em que ao menos um padrão da trava casa com algum texto. Nó fora da conta",
    "está dentro do universo da trava e fora de toda asserção dela — uma regressão",
    "ali passa verde (R-74, D-44). `npm run mapa:cobertura -- --mudos` lista quais."
  );
  md.push("");

  // ── A DISCIPLINA QUE IMPEDE A COLUNA DECLARADA DE ENVELHECER ─────────────
  //
  // Coluna escrita à mão apodrece: alguém audita um módulo, fecha, e não
  // volta aqui. O acoplamento é o mesmo que já existe entre trava nova e
  // declaração de PROMETE/NÃO PROMETE — a lista só é útil se quem fecha o
  // módulo a toca.
  //
  // A invariante é fraca de propósito: auditar um módulo produz pelo menos
  // UMA trava que o cita nominalmente. Se alguém marcar "auditado" sem trava
  // nenhuma, ou é marcação sem lastro, ou a auditoria não deixou rastro
  // executável — e as duas merecem parar o build.
  const auditadoSemTrava = [...AUDITADOS].filter(
    (m) => modulos.includes(m) && !cobertura.get(m).length
  );
  if (auditadoSemTrava.length) {
    console.error(
      `\n❌ ${auditadoSemTrava.length} módulo(s) marcado(s) como AUDITADO sem nenhuma trava que o cite: ` +
      `${auditadoSemTrava.join(", ")}.\n` +
      `   Auditar um módulo produz trava — se não produziu, ou a marcação está errada,\n` +
      `   ou a auditoria não deixou rastro executável. Fechar módulo inclui atualizar\n` +
      `   esta coluna E deixar uma trava que o nomeie.\n`
    );
    process.exit(1);
  }

  // E o inverso: módulo na lista que não existe mais (renomeado ou deletado).
  const auditadoInexistente = [...AUDITADOS].filter((m) => !modulos.includes(m));
  if (auditadoInexistente.length) {
    console.error(
      `\n❌ AUDITADOS cita módulo(s) que não existem: ${auditadoInexistente.join(", ")}.\n` +
      `   Lista declarada que sobrevive ao módulo vira ficção — atualize ou remova.\n`
    );
    process.exit(1);
  }

  if (semConteudo.length) {
    md.push(
      `### ⚠️ ${semConteudo.length} módulo(s) sem cobertura de CONTEÚDO`, "",
      `\`${semConteudo.join("`, `")}\``, "",
      "Nenhuma trava toca estes módulos, e nenhum foi auditado. A",
      "estrutura é vigiada; o conteúdo clínico não. **AVC e Coronárias estão aqui",
      "por decisão declarada (D-25)**: as travas que existiam validavam os engines",
      "mortos, e reescrevê-las contra as árvores exige auditar os módulos, o que a",
      "Fase 1 nunca fez. Cobertura zero DECLARADA é aceitável; silenciosa não.", ""
    );
  }
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
  // "test:avc" e "test:coronary" SAÍRAM da lista: os scripts legados foram
  // removidos na D-22 (validavam engines mortos), e os que existem hoje com
  // esses nomes são travas NOVAS, escritas depois da auditoria de cada módulo,
  // com PROMETE/NÃO PROMETE/UNIVERSO declarados. A lista só encolhe.
  "test:sulfatacao",
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
