#!/usr/bin/env node
/**
 * PROMETE: que sair de um módulo e voltar preserve o CASO, não só o passo —
 *   valores, trilha de medições, ações já executadas, decisões tomadas e
 *   marcos; que o veredito seja recalculado (nunca restaurado como verdade
 *   congelada); que o vermelho continue bloqueando execução depois da volta; e
 *   que uma sessão salva ANTES desta versão continue abrindo, com trilha vazia
 *   e sem nenhuma medição inventada.
 * NÃO PROMETE: nada sobre `valoresRef`/`caminhoRef`, que continuam existindo
 *   (Passo C, não feito). Nem que o conteúdo clínico de cada módulo esteja
 *   certo — isso é dos validadores de cada árvore.
 * UNIVERSO: o motor, o `retomar()` do shell, e duas árvores reais
 *   (crises-convulsivas, síndromes coronarianas) além da árvore de prova.
 *
 * ── O DEFEITO QUE O PASSO A+B FECHA ─────────────────────────────────────────
 *
 * A retomada nasceu para responder "em que passo eu estava?" e guardava caminho
 * e valores, reconstruindo por REPLAY. Bastava enquanto o motor não tinha
 * memória clínica.
 *
 * ⚠️ AGORA TEM — e o replay não apenas PERDE trilha, ações e decisões: ele
 * FABRICA uma trilha, com um ponto por campo carimbado na hora da volta. O
 * médico corrige uma PA de 194/116 para 168/96, sai para consultar outro
 * protocolo, volta, e a tela mostra "168/96, aferido agora" — sem o 194/116 e
 * sem sinal de que houve impedimento corrigido. Uma ação já administrada
 * voltaria como pendente, que é convite direto à dose dobrada.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const ARVORES_REAIS = {
  "crises-convulsivas": "seizure-decision-tree.ts",
  "sindromes-coronarianas": "coronary-decision-tree.ts",
};

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "retomada-snap-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "core", "decision-tree", "engine.ts"),
    path.join(appDir, "core", "decision-tree", "estado-clinico.ts"),
    ...Object.values(ARVORES_REAIS).map((f) => path.join(appDir, f)),
  ],
  { cwd: appDir, stdio: "pipe" }
);
const { DecisionTreeEngine } = require(path.join(tempDir, "core", "decision-tree", "engine.js"));
const ec = require(path.join(tempDir, "core", "decision-tree", "estado-clinico.js"));

let relogio = Date.UTC(2026, 7, 25, 14, 0, 0);
const agora = () => (relogio += 60_000);

// ── A ÁRVORE DE PROVA — a única com vereditos declarados ────────────────────
//
// Nenhum dos 30 módulos declara `vereditos` ainda; sem esta árvore, as
// conferências sobre bloqueio e decisão rodariam sobre nada.
const PAS = (v) => Number((v.pressao ?? "").split("/")[0] || NaN);
const vereditoMedX = {
  id: "med_x",
  avaliar: (v) => {
    const pas = PAS(v);
    if (!Number.isFinite(pas)) return { nivel: "vermelho", titulo: "Medicamento X", motivo: "pressão não medida" };
    if (pas >= 180) return { nivel: "vermelho", titulo: "Medicamento X", motivo: `PAS ${pas} acima do limite` };
    if (pas >= 160)
      return {
        nivel: "amarelo",
        titulo: "Medicamento X",
        motivo: `PAS ${pas} na faixa de risco`,
        decisao: {
          campo: "decisao_med_x",
          saidas: [
            { tipo: "prosseguir", label: "Benefício supera o risco" },
            { tipo: "nao_prosseguir", label: "Seguir sem o medicamento" },
          ],
        },
      };
    return { nivel: "verde", titulo: "Medicamento X", motivo: `PAS ${pas} dentro da faixa` };
  },
};
const arvoreProva = {
  id: "prova-retomada",
  entryNodeId: "coleta",
  nodes: {
    coleta: {
      id: "coleta",
      type: "input",
      title: "Coleta",
      fields: [
        { id: "queixas", label: "Queixas", presets: [{ label: "dor" }, { label: "sudorese" }], multiplo: true },
        { id: "pressao", label: "Pressão", presets: [{ label: "194/116" }, { label: "168/96" }] },
      ],
      next: "conduta",
    },
    conduta: {
      id: "conduta",
      type: "action",
      title: "Conduta",
      actions: ["Administrar medicamento X"],
      next: "fim",
      vereditos: [vereditoMedX],
    },
    fim: { id: "fim", type: "transition", title: "Fim", disposition: "observacao", exitCriteria: ["fim"], targets: [] },
  },
};

/**
 * O CICLO DO SHELL, na via nova. É a sequência que `retomar()` executa quando
 * `salva.estado` existe — passando por JSON, como passaria pela sessão.
 */
function sairEVoltar(motor, arvore) {
  const sessao = JSON.parse(JSON.stringify({ estado: motor.exportarEstado(), marcos: motor.exportarMarcos() }));
  const novo = new DecisionTreeEngine(arvore, { agora });
  novo.restaurarEstado(sessao.estado);
  novo.restaurarMarcos(sessao.marcos);
  return novo;
}

// ══ 1. O CASO INTEIRO SOBREVIVE ════════════════════════════════════════════
{
  const m = new DecisionTreeEngine(arvoreProva, { agora });
  let q;
  for (const x of ["dor", "sudorese"]) q = ec.alternarSelecao(q, x);
  m.setValue("queixas", q);
  m.setValue("pressao", "194/116", "aferido", "primeira_medida");
  m.advance();
  m.remedir(["pressao"]);
  m.setValue("pressao", "168/96", "aferido", "apos_intervencao");
  m.registrarDecisao("med_x", "prosseguir");
  m.registrarExecucao("med_x");

  const v = sairEVoltar(m, arvoreProva);

  confere(
    "o passo em que se estava sobrevive",
    v.getCurrentNode().id === "conduta",
    `voltou em "${v.getCurrentNode().id}" — voltar para a entrada da árvore é o defeito que a ` +
    `sessão de fluxo existe para evitar.`
  );
  confere(
    "o checklist múltiplo sobrevive à serialização",
    ec.selecionados(v.getValues(), "queixas").join("+") === "dor+sudorese",
    `veio "${ec.selecionados(v.getValues(), "queixas").join("+")}" — se o separador não sobrevivesse ` +
    `ao JSON, a seleção voltaria vazia ou partida ao meio, em silêncio.`
  );
  confere(
    "a trilha inteira sobrevive, com par anterior→novo e motivo",
    v.getHistorico("pressao").length === 2 &&
      v.getHistorico("pressao")[1].anterior === "194/116" &&
      v.getHistorico("pressao")[1].motivo === "apos_intervencao",
    `veio ${JSON.stringify(v.getHistorico("pressao"))} — sem ela, a tela mostra o número atual como ` +
    `se nunca tivesse havido um impedimento corrigido.`
  );
  confere(
    "a ação executada continua 'realizada'",
    v.estadoDaAcao("med_x") === "realizada",
    "reapresentar como pendente uma ação já administrada é convite direto à dose dobrada."
  );
  confere(
    "a decisão amarela sobrevive COM O TIPO escolhido",
    v.getDecisoes().length === 1 && v.getDecisoes()[0].tipo === "prosseguir",
    "sem ela o caso perde o consentimento que autorizou a execução — e o sumário não distingue " +
    "quem prosseguiu de quem seguiu sem o fármaco."
  );
  linhas.push(
    `  1. caso restaurado: nó "${v.getCurrentNode().id}" · ${ec.trilha(v.getHistorico("pressao"), " mmHg")} · ` +
    `ação ${v.estadoDaAcao("med_x")} · decisão ${v.getDecisoes()[0].tipo}`
  );
}

// ══ 2. O VEREDITO É RECALCULADO, NUNCA RESTAURADO COMO VERDADE ═════════════
//
// ⚠️ Veredito salvo envelheceria junto com o dado que o gerou. A prova mede o
// caso duro: o valor MUDA depois da volta, e a cor tem de acompanhar sem
// nenhum nó de "reavaliar".
{
  const m = new DecisionTreeEngine(arvoreProva, { agora });
  m.setValue("queixas", ec.alternarSelecao(undefined, "dor"));
  m.setValue("pressao", "194/116", "aferido");
  m.advance();
  const v = sairEVoltar(m, arvoreProva);

  confere(
    "depois de retomar, o vermelho continua vermelho",
    v.vereditoDe("med_x").nivel === "vermelho",
    `veio "${v.vereditoDe("med_x").nivel}" — perder o impedimento na volta é o pior modo de falhar aqui.`
  );

  let recusou = false;
  try { v.registrarExecucao("med_x"); } catch { recusou = true; }
  confere(
    "🔴 continua BLOQUEANDO a execução depois de retomar",
    recusou && v.estadoDaAcao("med_x") !== "realizada",
    "se a retomada devolvesse a ação liberada, bastaria sair e voltar para contornar a " +
    "contraindicação — um bypass que a regra do vermelho existe para não ter."
  );

  // E corrigir o dado depois da volta muda a cor, sem nó extra.
  v.remedir(["pressao"]);
  v.setValue("pressao", "132/80", "aferido", "apos_intervencao");
  confere(
    "corrigir o dado após a retomada recalcula o veredito para verde",
    v.vereditoDe("med_x").nivel === "verde",
    `veio "${v.vereditoDe("med_x").nivel}" — se o nível viesse do snapshot, o vermelho antigo ` +
    `sobreviveria ao dado novo.`
  );
  confere(
    "remedir() após a retomada preserva a trilha herdada",
    v.getHistorico("pressao").map((x) => x.valor).join(" → ") === "194/116 → 132/80",
    `veio "${v.getHistorico("pressao").map((x) => x.valor).join(" → ")}" — a trilha não pode ` +
    `recomeçar do zero porque a tela foi reaberta.`
  );
  confere(
    "nenhum nível de veredito é gravado em values",
    !Object.entries(v.getValues()).some(([, val]) => val === "vermelho" || val === "amarelo" || val === "verde"),
    "gravar o nível o transformaria em verdade clínica congelada, que é o que ele não pode ser."
  );
  linhas.push(`  2. 🔴 após retomar: execução recusada; corrigido para 132/80 → ${v.vereditoDe("med_x").nivel}`);
}

// ══ 3. SESSÃO ANTIGA (sem `estado`) CONTINUA ABRINDO — sem inventar trilha ══
//
// É a via de compatibilidade: sessão salva antes desta versão traz só caminho e
// valores, e o shell cai no replay.
{
  const antiga = {
    caminho: ["coleta", "conduta"],
    valores: { queixas: "dor", pressao: "168/96" },
    trilha: ["Coleta", "Conduta"],
    salvoEm: relogio,
    // sem `estado`, sem `marcos` — como era antes
  };

  const v = new DecisionTreeEngine(arvoreProva, { agora });
  let abriu = true;
  try {
    v.reset();
    for (const id of antiga.caminho.slice(1)) v.goToNode(id);
    for (const [k, val] of Object.entries(antiga.valores)) v.reaplicarValorSemTrilha(k, val);
  } catch {
    abriu = false;
  }

  confere(
    "sessão antiga continua abrindo, no passo em que estava",
    abriu && v.getCurrentNode().id === "conduta",
    "quebrar a retomada de quem já estava no meio de um atendimento seria pior que o defeito " +
    "que esta migração conserta."
  );
  confere(
    "os valores da sessão antiga são restaurados",
    v.getValues().pressao === "168/96" && ec.selecionados(v.getValues(), "queixas").join() === "dor",
    "a via de compatibilidade tem de entregar o que ela sempre entregou."
  );
  confere(
    "a trilha abre VAZIA — nenhuma medição é inventada",
    v.getHistorico("pressao").length === 0 && v.getHistorico("queixas").length === 0,
    `veio ${JSON.stringify(v.getHistorico("pressao"))} — reaplicar por \`setValue\` criaria uma ` +
    `medição carimbada na hora da volta, que ninguém fez. Trilha ausente é estado honesto; ` +
    `trilha inventada, não.`
  );
  confere(
    "ações e decisões abrem vazias",
    v.getDecisoes().length === 0 && v.estadoDaAcao("med_x") !== "realizada",
    "herdar execução ou consentimento que a sessão antiga não registrou seria fabricar conduta."
  );
  confere(
    "e o veredito é calculado a partir dos valores restaurados",
    v.vereditoDe("med_x").nivel === "amarelo",
    `veio "${v.vereditoDe("med_x").nivel}" — sem histórico, o veredito ainda tem de funcionar: ele ` +
    `depende do valor atual, não da trilha.`
  );
  linhas.push(
    `  3. sessão antiga: nó "${v.getCurrentNode().id}" · PA ${v.getValues().pressao} · ` +
    `trilha vazia · veredito ${v.vereditoDe("med_x").nivel}`
  );
}

// ══ 4. AS ÁRVORES REAIS — valores e marcos coerentes na volta ══════════════
for (const [slug, arquivo] of Object.entries(ARVORES_REAIS)) {
  const mod = require(path.join(tempDir, arquivo.replace(/\.ts$/, ".js")));
  const arvore = Object.values(mod).find((v) => v && v.nodes);
  if (!arvore) {
    falhas.push(`\`${slug}\`: a árvore não carregou — a conferência NÃO RODOU.`);
    continue;
  }
  const m = new DecisionTreeEngine(arvore, { agora });
  const campoMarco = Object.keys(arvore.marcos ?? {})[0];
  if (campoMarco) m.setValue(campoMarco, "12");
  m.setValue("peso", "70", "informado");

  relogio += 8 * 60_000; // o médico passa 8 minutos fora do módulo
  const v = sairEVoltar(m, arvore);

  confere(
    `\`${slug}\`: todos os valores voltam idênticos`,
    JSON.stringify(v.getValues()) === JSON.stringify(m.getValues()),
    "a retomada por snapshot não pode alterar nenhum valor — é restauração, não recálculo."
  );
  if (campoMarco) {
    confere(
      `\`${slug}\`: o marco temporal não se desloca pela via do snapshot`,
      v.getValues().__marco_inicioDoEvento === m.getValues().__marco_inicioDoEvento,
      "o marco viaja dentro de `values`; se divergir aqui, a via nova reintroduziu o defeito que a " +
      "correção dos marcos fechou."
    );
  }
  confere(
    `\`${slug}\`: a trilha do peso sobrevive`,
    v.getHistorico("peso").length === 1 && v.getHistorico("peso")[0].origem === "informado",
    "peso alimenta cálculo de dose: perder a origem do dado muda a confiança na dose calculada."
  );
  linhas.push(`  4. ${slug}: ${Object.keys(v.getValues()).length} valores idênticos${campoMarco ? " · marco preservado" : ""}`);
}

// ══ 5. O SHELL PREFERE O SNAPSHOT E MANTÉM O FALLBACK ═════════════════════
//
// ⚠️ ESTRUTURAL, e a limitação está declarada: lê o arquivo do shell, não
// executa React. Mede o que falha em silêncio — uma via que existe no motor
// mas que a tela nunca chama não conserta nada.
{
  const shell = path.join(appDir, "components", "protocol-screen", "acls-decision-flow-screen.tsx");
  const fonte = fs.readFileSync(shell, "utf8");

  for (const [padrao, nome, porque] of [
    [/estado:\s*engine\.exportarEstado\(\)/, "o shell salva o estado na sessão",
     "sem salvar não há snapshot para preferir, e a retomada cai no replay para sempre"],
    [/if\s*\(salva\.estado\)\s*\{\s*\n\s*engine\.restaurarEstado\(salva\.estado\);/, "o shell prefere o snapshot quando existe",
     "a via nova sem chamador é código morto que dá falsa sensação de correção"],
    [/engine\.reaplicarValorSemTrilha\(campo, valor\)/, "o fallback reaplica SEM trilha",
     "reaplicar por `setValue` inventaria uma medição na hora da volta — o que a regra proíbe"],
    [/for \(const nodeId of salva\.caminho\.slice\(1\)\)/, "o replay antigo continua existindo",
     "sem fallback, sessão salva antes desta versão deixaria de abrir"],
  ]) {
    if (!padrao.test(fonte)) falhas.push(`${nome}: sumiu do shell — ${porque}.`);
    else ok++;
  }
}

// ── Vacuidade ──────────────────────────────────────────────────────────────
confere(
  "as quatro frentes produziram evidência",
  linhas.length >= 5,
  `só ${linhas.length} linhas — a trava pode ter rodado sobre nada (R-15 item 9).`
);

console.log("\nRetomada por snapshot — o que volta é o caso, não só o passo\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o caso sobrevive à saída, e a sessão antiga ainda abre\n`);
process.exit(0);
