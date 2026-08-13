#!/usr/bin/env node
/**
 * CAMADA 5 — Auditoria das máquinas de estado clínicas.
 *
 * Compila as árvores de decisão e analisa o GRAFO de cada uma. Não julga conduta:
 * julga estrutura. Um nó órfão ou um beco sem saída é defeito objetivo — ou o
 * médico não chega àquela conduta, ou chega e fica preso.
 *
 * O que procura, seguindo a lista do plano de auditoria:
 *
 *  - estados sem saída (nó que não é final e não leva a lugar nenhum);
 *  - estados órfãos (existem no arquivo mas nenhum caminho chega até eles);
 *  - transições para nó inexistente;
 *  - opções duplicadas dentro do mesmo nó de decisão;
 *  - opções distintas que levam ao MESMO destino (escolha sem efeito);
 *  - ciclos sem saída para um nó final (o fluxo nunca termina);
 *  - nós de entrada cujos campos obrigatórios não têm preset nem valor livre;
 *  - textos de conduta vazios.
 *
 * O validador que já existia (`validateDecisionTree`) cobre só referência
 * quebrada. Isto é o resto.
 *
 * Uso: node scripts/auditoria-maquinas-estado.cjs
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auditoria-estado-"));

const arquivos = fs
  .readdirSync(appDir)
  .filter((f) => /-(decision-)?tree\.ts$/.test(f))
  .sort();

console.log(`Compilando ${arquivos.length} árvores de decisão…`);
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    ...arquivos.map((f) => path.join(appDir, f)),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const achados = [];
const resumo = [];

function registrar(arvore, gravidade, tipo, no, detalhe) {
  achados.push({ arvore, gravidade, tipo, no, detalhe });
}

for (const arquivo of arquivos) {
  const saida = path.join(tempDir, arquivo.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(saida)) {
    registrar(arquivo, "erro", "compilacao", "-", "não compilou");
    continue;
  }

  let mod;
  try {
    mod = require(saida);
  } catch (erro) {
    registrar(arquivo, "erro", "carregamento", "-", String(erro.message).slice(0, 120));
    continue;
  }

  const arvores = Object.entries(mod).filter(
    ([, v]) => v && typeof v === "object" && v.nodes && v.entryNodeId
  );
  if (!arvores.length) continue;

  for (const [nomeExport, arvore] of arvores) {
    const nome = `${arquivo.replace(/\.ts$/, "")} (${nomeExport})`;
    const nos = arvore.nodes;
    const ids = new Set(Object.keys(nos));

    // ── Destinos de cada nó ─────────────────────────────────────────────────
    const destinos = (no) => {
      if (no.type === "decision") return (no.options ?? []).map((o) => o.next);
      if (no.type === "action" || no.type === "input") {
        // `next` pode ser um id fixo OU um roteamento derivado — o caso em que o
        // app conclui a partir do que foi respondido, em vez de perguntar. O
        // roteamento declara `possiveis` justamente para que a auditoria
        // estática continue valendo; sem ler esse campo, o objeto virava a
        // string "[object Object]" e o grafo aparecia quebrado.
        if (!no.next) return [];
        if (typeof no.next === "string") return [no.next];
        return Array.isArray(no.next.possiveis) ? no.next.possiveis : [];
      }
      return [];
    };

    // ── Alcançabilidade a partir da entrada ─────────────────────────────────
    const alcancados = new Set();
    const fila = [arvore.entryNodeId];
    while (fila.length) {
      const id = fila.pop();
      if (alcancados.has(id) || !ids.has(id)) continue;
      alcancados.add(id);
      for (const d of destinos(nos[id])) fila.push(d);
    }

    for (const id of ids) {
      if (!alcancados.has(id)) {
        registrar(nome, "erro", "no-orfao", id, "nenhum caminho a partir da entrada chega a este nó");
      }
    }

    // ── Beco sem saída e transições quebradas ───────────────────────────────
    for (const [id, no] of Object.entries(nos)) {
      const saidas = destinos(no);

      if (no.type !== "transition" && saidas.length === 0) {
        registrar(nome, "erro", "beco-sem-saida", id, `nó do tipo "${no.type}" sem próximo nó`);
      }

      for (const d of saidas) {
        if (!ids.has(d)) {
          registrar(nome, "erro", "transicao-quebrada", id, `aponta para nó inexistente "${d}"`);
        }
      }

      if (no.type === "decision") {
        const opcoes = no.options ?? [];
        const vistos = new Set();
        for (const o of opcoes) {
          if (vistos.has(o.id)) {
            registrar(nome, "erro", "opcao-duplicada", id, `opção "${o.id}" aparece mais de uma vez`);
          }
          vistos.add(o.id);
          if (!String(o.label ?? "").trim()) {
            registrar(nome, "erro", "opcao-sem-rotulo", id, `opção "${o.id}" sem texto`);
          }
        }
        const porDestino = new Map();
        for (const o of opcoes) {
          if (!porDestino.has(o.next)) porDestino.set(o.next, []);
          porDestino.get(o.next).push(o.id);
        }
        for (const [destino, quais] of porDestino) {
          if (quais.length > 1) {
            registrar(
              nome, "aviso", "escolha-sem-efeito", id,
              `opções ${quais.join(", ")} levam todas a "${destino}" — a escolha não muda o fluxo`
            );
          }
        }
        if (opcoes.length === 1) {
          registrar(nome, "aviso", "decisao-de-uma-opcao", id, "nó de decisão com uma única opção");
        }
      }

      if (no.type === "input") {
        for (const campo of no.fields ?? []) {
          const temPreset = (campo.presets ?? []).length > 0;
          if (!temPreset && !campo.allowCustom) {
            registrar(
              nome, "erro", "campo-impreenchivel", id,
              `campo "${campo.id}" não tem preset nem entrada livre`
            );
          }
          if (!campo.optional && !temPreset && !campo.allowCustom) {
            registrar(nome, "erro", "campo-obrigatorio-travado", id, `campo "${campo.id}" trava o fluxo`);
          }
        }
      }

      const texto = `${no.title ?? ""}${no.summary ?? ""}${(no.actions ?? []).join("")}`;
      if (!texto.trim()) {
        registrar(nome, "erro", "no-sem-conteudo", id, "nó sem título, resumo ou ações");
      }
    }

    // ── Todo nó alcançável leva a um final? ─────────────────────────────────
    const terminais = new Set(
      Object.entries(nos).filter(([, n]) => n.type === "transition").map(([id]) => id)
    );
    const chegaAoFim = new Set(terminais);
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const [id, no] of Object.entries(nos)) {
        if (chegaAoFim.has(id)) continue;
        if (destinos(no).some((d) => chegaAoFim.has(d))) {
          chegaAoFim.add(id);
          mudou = true;
        }
      }
    }
    for (const id of alcancados) {
      if (!chegaAoFim.has(id)) {
        registrar(nome, "erro", "sem-caminho-para-o-fim", id, "nenhum caminho a partir daqui chega a uma conclusão");
      }
    }

    // ── Existe caminho até o fim SEM passar por nenhuma conduta? ──────────────
    //
    // Navegável e clinicamente vazio: o médico entra, responde, sai com um
    // destino — e o app não mandou fazer NADA no meio. É um defeito que a
    // alcançabilidade sozinha não vê, porque todo nó tem saída e todo caminho
    // termina; o que falta é conteúdo no percurso.
    //
    // Nó de CONDUTA = `action` com pelo menos uma ação escrita. `decision` e
    // `input` perguntam, não mandam fazer; `transition` é o desfecho, e chegar
    // a ele não é ter tratado.
    {
      const ehConduta = (no) =>
        no && no.type === "action" && Array.isArray(no.actions) && no.actions.some((a) => String(a).trim());

      // Alcançabilidade RESTRITA: caminha só por nós que não são conduta.
      const semConduta = new Set();
      if (!ehConduta(nos[arvore.entryNodeId])) {
        const f = [arvore.entryNodeId];
        while (f.length) {
          const id = f.pop();
          if (semConduta.has(id) || !ids.has(id)) continue;
          semConduta.add(id);
          for (const d of destinos(nos[id])) {
            if (!ehConduta(nos[d])) f.push(d);
          }
        }
      }

      // ── DUAS ISENÇÕES, e as duas nasceram da trava acusando INOCENTE ───────
      //
      // 1. Terminal que ENCAMINHA (`targets`) não precisa de conduta no caminho:
      //    ela vive no módulo de destino. Sem isto, toda árvore de TRIAGEM era
      //    acusada — e triagem existe justamente para identificar e entregar.
      //    (17 acusações removidas.)
      //
      // 2. Terminal cujo `exitCriteria` traz conduta. Este app tem DOIS formatos
      //    de árvore: a de passo a passo, em que a conduta está em nós `action`,
      //    e a de triagem-e-desfecho, em que o terminal carrega o tratamento no
      //    próprio critério de saída — "hipertensivo → descompressão imediata
      //    (agulha 14G) → dreno" vive no exitCriteria do nó PNEUMOTÓRAX, não num
      //    nó de ação antes dele. Ignorar isso acusava 9 desfechos que estão
      //    completos. (9 acusações removidas.)
      //
      // O que sobra é o desfecho que não trata, não encaminha e não diz o que
      // fazer — navegável e clinicamente vazio de verdade.
      const conduzNoCriterio = (no) =>
        Array.isArray(no.exitCriteria) && no.exitCriteria.some((c) => String(c).trim());

      for (const id of terminais) {
        const encaminha = Array.isArray(nos[id].targets) && nos[id].targets.length > 0;
        if (semConduta.has(id) && !encaminha && !conduzNoCriterio(nos[id])) {
          registrar(
            nome,
            "erro",
            "caminho-sem-conduta",
            id,
            "existe caminho da entrada até este desfecho sem passar por nenhum nó de conduta — navegável e clinicamente vazio"
          );
        }
      }

      const condutas = Object.values(nos).filter(ehConduta).length;
      if (condutas === 0) {
        registrar(nome, "erro", "arvore-sem-conduta", arvore.entryNodeId, "a árvore inteira não tem nenhum nó de conduta");
      }
    }

    resumo.push({
      arvore: nome,
      nos: ids.size,
      alcancados: alcancados.size,
      terminais: terminais.size,
      achados: achados.filter((a) => a.arvore === nome).length,
    });
  }
}

// ── Relatório ───────────────────────────────────────────────────────────────
const saidaDir = path.join(appDir, "auditoria");
fs.mkdirSync(saidaDir, { recursive: true });

const erros = achados.filter((a) => a.gravidade === "erro");
const avisos = achados.filter((a) => a.gravidade === "aviso");

const L = [];
L.push("# Camada 5 — Auditoria das máquinas de estado");
L.push("");
L.push("> Gerado por `node scripts/auditoria-maquinas-estado.cjs`. Nenhum código alterado.");
L.push("> Analisa ESTRUTURA do grafo, não conduta clínica.");
L.push("");
L.push(`- Árvores analisadas: **${resumo.length}**`);
L.push(`- Erros estruturais: **${erros.length}**`);
L.push(`- Avisos: **${avisos.length}**`);
L.push("");
L.push("## Visão por árvore");
L.push("");
L.push("| árvore | nós | alcançáveis | finais | achados |");
L.push("|---|---:|---:|---:|---:|");
for (const r of resumo.sort((a, b) => b.achados - a.achados)) {
  const orfaos = r.nos - r.alcancados;
  L.push(`| ${r.arvore} | ${r.nos} | ${r.alcancados}${orfaos ? ` (${orfaos} órfãos)` : ""} | ${r.terminais} | ${r.achados} |`);
}
L.push("");

const porTipo = new Map();
for (const a of achados) {
  if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, []);
  porTipo.get(a.tipo).push(a);
}
L.push("## Achados por tipo");
L.push("");
L.push("| tipo | gravidade | ocorrências |");
L.push("|---|---|---:|");
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  L.push(`| ${tipo} | ${itens[0].gravidade} | ${itens.length} |`);
}
L.push("");
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  L.push(`### ${tipo} (${itens.length})`);
  L.push("");
  L.push("| árvore | nó | detalhe |");
  L.push("|---|---|---|");
  for (const a of itens.slice(0, 60)) L.push(`| ${a.arvore} | \`${a.no}\` | ${a.detalhe} |`);
  if (itens.length > 60) L.push(`| … | | mais ${itens.length - 60} |`);
  L.push("");
}

fs.writeFileSync(path.join(saidaDir, "CAMADA-5-MAQUINAS-ESTADO.md"), L.join("\n") + "\n");
fs.writeFileSync(
  path.join(saidaDir, "camada-5-maquinas-estado.json"),
  JSON.stringify({ resumo, achados }, null, 1)
);

// ── O QUE ESTA AUDITORIA NÃO FAZ ────────────────────────────────────────────
//
// Precisa estar na SAÍDA, não só no cabeçalho do arquivo: verificador que
// parece cobrir mais do que cobre vira falsa segurança, que é o mecanismo
// documentado na D-5. Quem lê "0 erros estruturais" tem de ler junto o que
// esse zero não promete.
console.log(
  "\nESCOPO: verifica ALCANÇABILIDADE e estrutura do grafo — não verifica CORREÇÃO CLÍNICA." +
  "\n        Um fluxo pode passar aqui com todas as condutas erradas."
);
console.log(`\nÁrvores: ${resumo.length}`);
console.log(`Erros estruturais: ${erros.length}`);
console.log(`Avisos: ${avisos.length}`);
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${tipo}: ${itens.length}`);
}
console.log(`\nSaída em auditoria/CAMADA-5-MAQUINAS-ESTADO.md`);

/**
 * ── ISTO É UMA TRAVA, NÃO SÓ UM RELATÓRIO ────────────────────────────────────
 *
 * Até aqui o script DETECTAVA erro estrutural e saía com código 0 — imprimia
 * "Erros estruturais: 11" e o pipeline seguia satisfeito. Verificador que
 * enxerga e não barra protege exatamente nada: a regressão passa, o relatório
 * fica no disco, e ninguém lê relatório de coisa que passou.
 *
 * Descoberto ao refazer as verificações por mutação com o instrumento certo.
 * A primeira leva usava `grep -c "❌"` na saída, que conta zero tanto quando
 * nada falhou quanto quando o processo morreu — e também não distingue
 * "detectou e reportou" de "detectou e não barrou".
 *
 * AVISO continua sem barrar, e é proposital: "escolha sem efeito" é sinal de
 * desenho a revisar, não defeito objetivo. Barrar em aviso transformaria o
 * script em ruído, e verificador ruidoso é desligado no primeiro aperto.
 */
if (erros.length) {
  console.error(
    `\n❌ ${erros.length} erro(s) estrutural(is) — o fluxo tem nó inalcançável, ` +
    `beco sem saída ou transição para nó inexistente. Detalhes no relatório acima.`
  );
}
process.exit(erros.length ? 1 : 0);
