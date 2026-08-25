#!/usr/bin/env node
/**
 * PROMETE: que as cinco capacidades novas do NÚCLEO funcionem de verdade, sobre
 *   o motor real, numa árvore de prova — seleção múltipla, valor com histórico,
 *   veredito derivado que muda de cor ao corrigir o dado, estado de ação, e
 *   bloqueio de medicação SEM bloqueio do atendimento.
 * NÃO PROMETE: nada sobre a SCA nem sobre qualquer módulo clínico — a árvore
 *   aqui é sintética de propósito. O núcleo não conhece doença.
 * UNIVERSO: core/decision-tree/{engine,types,estado-clinico}.ts.
 *
 * ── POR QUE UMA ÁRVORE SINTÉTICA E NÃO A SCA ────────────────────────────────
 *
 * O pedido foi explícito: implementar e testar SÓ o núcleo antes de tocar em
 * qualquer tela. Provar sobre a SCA misturaria dois riscos — "o núcleo
 * funciona?" e "o módulo usa o núcleo direito?" — e uma falha não diria qual
 * dos dois quebrou. A árvore daqui existe só para exercitar as capacidades.
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

// ── Compilação do núcleo ───────────────────────────────────────────────────
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-nucleo-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "core", "decision-tree", "engine.ts"),
    path.join(appDir, "core", "decision-tree", "estado-clinico.ts"),
  ],
  { cwd: appDir, stdio: "pipe" }
);
const base = tempDir;
const { DecisionTreeEngine } = require(path.join(base, "engine.js"));
const ec = require(path.join(base, "estado-clinico.js"));

// ── Relógio de teste ───────────────────────────────────────────────────────
//
// Relógio real daria resultado diferente a cada execução — e um teste que muda
// sozinho é um teste que ninguém acredita quando falha.
let relogio = 1_000;
const agora = () => (relogio += 60_000); // um minuto entre medições

// ── A árvore de prova ──────────────────────────────────────────────────────
//
// Nada aqui é conduta: são nomes genéricos justamente para que ninguém leia
// este arquivo como referência clínica.
const PAS = (v) => Number((v.pressao ?? "").split("/")[0] || NaN);

const veredictoMedicamento = {
  id: "med_x",
  avaliar: (v) => {
    const pas = PAS(v);
    if (!Number.isFinite(pas)) {
      return { nivel: "vermelho", titulo: "Medicamento X bloqueado", motivo: "pressão não medida" };
    }
    if (pas >= 180) {
      return { nivel: "vermelho", titulo: "Medicamento X bloqueado", motivo: `PAS ${pas} acima do limite` };
    }
    if (pas >= 160) {
      return {
        nivel: "amarelo",
        titulo: "Medicamento X — decisão clínica",
        motivo: `PAS ${pas} na faixa de risco`,
        decisao: {
          campo: "decisao_med_x",
          saidas: [
            { tipo: "prosseguir", label: "Benefício supera o risco — administrar" },
            { tipo: "corrigir_antes", label: "Tratar a pressão e reavaliar" },
            { tipo: "nao_prosseguir", label: "Seguir sem o medicamento" },
            { tipo: "escalonar", label: "Discutir com a referência" },
          ],
        },
      };
    }
    return { nivel: "verde", titulo: "Medicamento X liberado", motivo: `PAS ${pas} dentro da faixa` };
  },
};

const arvore = {
  id: "prova-nucleo",
  entryNodeId: "coleta",
  nodes: {
    coleta: {
      id: "coleta",
      type: "input",
      title: "Coleta",
      fields: [
        { id: "queixas", label: "Queixas", presets: [{ label: "dor" }, { label: "sudorese" }, { label: "náusea" }], multiplo: true },
        { id: "pressao", label: "Pressão", presets: [{ label: "194/116" }, { label: "168/96" }, { label: "140/85" }] },
      ],
      next: "administrar",
      vereditos: [veredictoMedicamento],
    },
    administrar: {
      id: "administrar",
      type: "action",
      title: "Conduta",
      actions: ["Administrar medicamento X", "Manter monitorização"],
      next: "seguimento",
      vereditos: [veredictoMedicamento],
      corrigiveis: [
        { id: "pa_alta", remedir: ["pressao"], persiste: (v) => PAS(v) >= 180 },
      ],
    },
    seguimento: { id: "seguimento", type: "action", title: "Seguimento", actions: ["Reavaliar"], next: "fim" },
    fim: {
      id: "fim",
      type: "transition",
      title: "Fim",
      disposition: "observacao",
      exitCriteria: ["fim da prova"],
      targets: [],
    },
  },
};

const novoMotor = () => new DecisionTreeEngine(arvore, { agora });

// ══ PROVA 1 — checklist múltiplo ═══════════════════════════════════════════
{
  const m = new DecisionTreeEngine(arvore, { agora });
  let bruto = undefined;
  for (const q of ["dor", "sudorese", "náusea"]) bruto = ec.alternarSelecao(bruto, q);
  m.setValue("queixas", bruto);

  const sel = ec.selecionados(m.getValues(), "queixas");
  confere(
    "as três queixas ficam marcadas ao mesmo tempo",
    sel.length === 3 && sel.includes("dor") && sel.includes("sudorese") && sel.includes("náusea"),
    `veio ${JSON.stringify(sel)} — o campo múltiplo voltou a se comportar como escolha única, ` +
    `e o quadro do paciente seria descartado na entrada do fluxo.`
  );
  linhas.push(`  1. queixas marcadas → ${sel.join(" + ")}`);

  // Desmarcar é a metade que costuma faltar: marcar sem desmarcar não é checklist.
  m.setValue("queixas", ec.alternarSelecao(m.getValues().queixas, "sudorese"));
  const dep = ec.selecionados(m.getValues(), "queixas");
  confere(
    "desmarcar remove só o item desmarcado",
    dep.length === 2 && !dep.includes("sudorese") && dep.includes("dor"),
    `veio ${JSON.stringify(dep)} — desmarcar um item não pode levar os outros junto.`
  );
  linhas.push(`     após desmarcar sudorese → ${dep.join(" + ")}`);

  confere(
    "temAlgum responde sobre o conjunto",
    ec.temAlgum(m.getValues(), "queixas", ["náusea", "inexistente"]) === true &&
      ec.temAlgum(m.getValues(), "queixas", ["sudorese"]) === false,
    "o roteamento derivado lê seleção múltipla por aqui; se `temAlgum` errar, erra a rota."
  );
}

// ══ PROVA 2 — 194/116 → 168/96 mantendo histórico ══════════════════════════
{
  const m = new DecisionTreeEngine(arvore, { agora });
  m.setValue("pressao", "194/116", "aferido");
  m.setValue("pressao", "168/96", "corrigido");

  const h = m.getHistorico("pressao");
  confere(
    "a trilha da pressão guarda as duas medições",
    h.length === 2 && h[0].valor === "194/116" && h[1].valor === "168/96",
    `veio ${JSON.stringify(h.map((x) => x.valor))} — sem a trilha, tratar e re-medir apagaria a ` +
    `evidência de que houve um impedimento, e a tela mostraria 168/96 como se sempre tivesse sido.`
  );
  confere(
    "o valor atual é o último medido",
    m.getValues().pressao === "168/96",
    "o histórico não pode custar o presente: quem decide usa o valor de agora."
  );
  confere(
    "cada medição carrega hora e origem",
    h[0].em < h[1].em && h[0].origem === "aferido" && h[1].origem === "corrigido",
    "sem hora e origem, 'estimado às 14h' e 'aferido agora' pesariam igual na decisão."
  );
  confere(
    "reconfirmar o mesmo valor não infla a trilha",
    (m.setValue("pressao", "168/96", "aferido"), m.getHistorico("pressao").length === 2),
    "senão a trilha vira '168/96 → 168/96 → 168/96' e deixa de comunicar que houve correção."
  );
  linhas.push(`  2. pressão → ${ec.trilha(m.getHistorico("pressao"), " mmHg")}`);
}

// ══ PROVA 3 — veredito vermelho vira verde depois da correção ══════════════
{
  const m = new DecisionTreeEngine(arvore, { agora });
  m.setValue("pressao", "194/116", "aferido");

  const antes = m.toFrontendStep().vereditos[0];
  confere(
    "com PAS 194 o veredito nasce vermelho",
    antes.nivel === "vermelho",
    `veio "${antes.nivel}" — se o app não bloqueia com o dado que impede, ele não bloqueia nada.`
  );
  linhas.push(`  3. PAS 194 → 🔴 ${antes.titulo} (${antes.motivo})`);

  // A CORREÇÃO: abre a re-medida, o valor some, a trilha fica.
  m.remedir(["pressao"]);
  confere(
    "a re-medida apaga o valor e preserva a trilha",
    m.getValues().pressao === undefined && m.getHistorico("pressao").length === 1,
    "se o valor não some, a tela não volta a pedir o dado e 'corrigir' vira confirmar o número velho."
  );

  m.setValue("pressao", "168/96", "corrigido");
  const meio = m.toFrontendStep().vereditos[0];
  confere(
    "168/96 sai do vermelho e cai no amarelo, com decisão explícita",
    meio.nivel === "amarelo" && !!meio.decisao,
    `veio "${meio.nivel}" — a faixa intermediária existe para devolver a escolha ao médico, registrada.`
  );
  // ⚠️ AMARELO NÃO É LIBERAÇÃO. O erro fácil aqui é `nivel !== "vermelho"`:
  // ele funciona no verde e no vermelho e faz o amarelo sair liberado sozinho,
  // sem que ninguém registre a decisão de que o benefício supera o risco.
  confere(
    "o amarelo NÃO libera a ação sozinho — exige decisão registrada",
    ec.acaoLiberada(meio) === false && ec.exigeDecisaoMedica(meio) === true,
    "liberar no amarelo transformaria 'decisão clínica' em execução automática, sem registro de quem decidiu."
  );
  confere(
    "no amarelo a ação continua pendente, não realizada nem contraindicada",
    ec.estadoDaAcao(meio, false) === "pendente",
    "o estado tem de refletir que falta a decisão — 'contraindicada' esconderia a saída que existe."
  );

  linhas.push(`     re-medida 168/96 → 🟡 ${meio.titulo} (${meio.motivo})`);

  m.setValue("pressao", "140/85", "corrigido");
  const depois = m.toFrontendStep().vereditos[0];
  confere(
    "com o dado corrigido o veredito fica verde SEM nenhum nó extra",
    depois.nivel === "verde",
    `veio "${depois.nivel}" — o veredito é derivado a cada render justamente para que corrigir o ` +
    `dado já mude a cor; se precisasse de um nó de 'reavaliar', o vermelho antigo sobreviveria ao dado novo.`
  );
  linhas.push(`     correção 140/85 → 🟢 ${depois.titulo} (${depois.motivo})`);

  confere(
    "o veredito nunca é gravado em values",
    Object.keys(m.getValues()).every((k) => !/veredito/i.test(k)),
    "gravado, ele envelheceria junto com o dado que o gerou — que é exatamente o defeito a evitar."
  );
}

// ══ PROVA 4 — medicação bloqueada SEM bloquear o atendimento ═══════════════
//
// ⚠️ É A REGRA QUE O AUTOR FECHOU EM 2026-08-25, e a que este arquivo existe
// sobretudo para travar: contraindicação de UMA medicação não pode parar o
// fluxo inteiro, e o vermelho não tem botão de "prosseguir mesmo assim".
{
  const m = new DecisionTreeEngine(arvore, { agora });
  m.setValue("queixas", ec.alternarSelecao(undefined, "dor"));
  m.setValue("pressao", "194/116", "aferido");
  m.advance(); // sai da coleta e entra no nó de conduta

  const passo = m.toFrontendStep();
  const v = passo.vereditos[0];

  confere(
    "a ação medicamentosa está contraindicada",
    ec.estadoDaAcao(v, false) === "contraindicada" && ec.acaoLiberada(v) === false,
    "o comando específico tem de ficar indisponível — é o que 'bloqueado' significa."
  );
  confere(
    "o vermelho NÃO oferece prosseguir mesmo assim",
    ec.exigeDecisaoMedica(v) === false && !v.decisao,
    "um botão de 'seguir assim mesmo' no vermelho transformaria o bloqueio em sugestão."
  );
  confere(
    "mas o passo segue avançável — o atendimento não parou",
    passo.canContinue === true,
    "bloqueio de medicação ≠ bloqueio do atendimento: travar o fluxo por causa de um fármaco " +
    "deixaria o médico sem o resto da via."
  );
  linhas.push(`  4. PAS 194 → 🔴 ${v.titulo}; fluxo segue: canContinue=${passo.canContinue}`);

  const seguinte = m.advance();
  confere(
    "e o próximo passo é alcançado com a medicação bloqueada",
    seguinte.id === "seguimento",
    `parou em "${seguinte.id}" — a via clínica seguinte tem de continuar disponível.`
  );
  linhas.push(`     avançou para "${seguinte.id}" com o medicamento bloqueado`);

  // A condição corrigível: declarada no nó, ela é o que oferece o caminho de
  // correção em vez do beco sem saída.
  const corrigivel = arvore.nodes.administrar.corrigiveis[0];
  confere(
    "a condição corrigível persiste com o dado ruim e cede com o dado corrigido",
    corrigivel.persiste({ pressao: "194/116" }) === true &&
      corrigivel.persiste({ pressao: "140/85" }) === false,
    "sem isso o bloqueio seria um beco: o médico veria o vermelho e não teria o que fazer com ele."
  );
}


// ══ PROVA 5 — o vermelho NÃO libera a ação, e o fluxo segue mesmo assim ════
//
// ⚠️ É A INVARIANTE QUE O AUTOR EXIGIU POR ESCRITO (2026-08-25):
// "`canContinue=true` pode permitir continuar o atendimento, mas nunca libera a
// ação clínica bloqueada". As duas metades são medidas separadamente aqui,
// porque confundi-las é exatamente o erro que a frase alerta.
{
  const m = novoMotor();
  m.setValue("queixas", ec.alternarSelecao(undefined, "dor"));
  m.setValue("pressao", "194/116", "aferido");
  m.advance();

  confere(
    "a ação está contraindicada",
    m.estadoDaAcao("med_x") === "contraindicada",
    `veio "${m.estadoDaAcao("med_x")}".`
  );

  // A metade que importa: NÃO EXISTE CAMINHO que marque como realizada.
  let recusou = false;
  try { m.registrarExecucao("med_x"); } catch { recusou = true; }
  confere(
    "registrarExecucao RECUSA enquanto o veredito impeditivo estiver ativo",
    recusou && m.estadoDaAcao("med_x") === "contraindicada",
    "se a execução passasse, 'bloqueado' seria só uma cor na tela — o médico veria vermelho e " +
    "o registro do caso diria que o fármaco foi administrado."
  );

  // Nem por decisão: o vermelho não oferece saída nenhuma, então nem a
  // tentativa de registrar "prosseguir" é aceita.
  let recusouDecisao = false;
  try { m.registrarDecisao("med_x", "prosseguir"); } catch { recusouDecisao = true; }
  confere(
    "o vermelho não aceita nem a decisão de prosseguir",
    recusouDecisao,
    "aceitar a decisão e recusar a execução deixaria no prontuário a marca de um consentimento " +
    "que a tela nunca ofereceu."
  );

  // E o atendimento continua — a outra metade.
  const seguinte = m.advance();
  confere(
    "o atendimento avança com a ação ainda bloqueada",
    seguinte.id === "seguimento" && m.estadoDaAcao("med_x") !== "realizada",
    "bloqueio de medicação não é bloqueio de atendimento; mas avançar não pode desbloquear nada."
  );
  // ⚠️ FORA DO NÓ QUE A DECLARA, a ação não é reavaliada — `nao_indicada` aqui
  // significa "esta tela não julga esse fármaco", não "liberada". O que a
  // invariante promete é o que se mede acima: nunca "realizada".
  linhas.push(`  5. 🔴 execução recusada; atendimento seguiu para "${seguinte.id}"; a ação NUNCA ficou realizada`);
}

// ══ PROVA 6 — o amarelo exige QUAL decisão, e ela fica registrada ══════════
{
  const m = novoMotor();
  m.setValue("queixas", ec.alternarSelecao(undefined, "dor"));
  m.setValue("pressao", "168/96", "aferido");
  m.advance();

  confere(
    "o amarelo não deixa executar sem decisão",
    (() => { try { m.registrarExecucao("med_x"); return false; } catch { return true; } })(),
    "executar antes de decidir faria o registro da decisão virar justificativa retroativa."
  );

  // ⚠️ QUAL saída — não um booleano. É o que permite o sumário distinguir
  // "seguiu sem o medicamento" de "corrigiu antes" de "escalonou".
  m.registrarDecisao("med_x", "corrigir_antes");
  const d1 = m.getDecisoes()[0];
  confere(
    "a decisão registra o tipo, o nível e o motivo como estavam",
    d1.tipo === "corrigir_antes" && d1.nivelNoMomento === "amarelo" && /168/.test(d1.motivoNoMomento),
    "o veredito é derivado: depois da correção ele já não diz o que dizia quando se decidiu — " +
    "congelar o motivo é o que torna o registro reconstituível."
  );
  confere(
    "decidir 'corrigir antes' NÃO libera a execução",
    (() => { try { m.registrarExecucao("med_x"); return false; } catch { return true; } })(),
    "só `prosseguir` libera; tratar qualquer decisão como consentimento anularia as outras três saídas."
  );
  confere(
    "uma saída que o nó não oferece é recusada",
    (() => { try { m.registrarDecisao("med_x", "contraindicar"); return false; } catch { return true; } })(),
    "registrar saída não oferecida inventaria uma conduta que a tela nunca apresentou."
  );
  linhas.push(`  6. 🟡 decisão registrada: ${d1.tipo} (nível ${d1.nivelNoMomento}, "${d1.motivoNoMomento}")`);

  // E o caminho do consentimento explícito funciona.
  m.registrarDecisao("med_x", "prosseguir");
  m.registrarExecucao("med_x");
  confere(
    "com 'prosseguir' registrado, a execução passa e vira 'realizada'",
    m.estadoDaAcao("med_x") === "realizada",
    "o amarelo tem de ter saída: bloquear os dois lados transformaria decisão clínica em beco."
  );
  linhas.push(`     após 'prosseguir' → ação ${m.estadoDaAcao("med_x")}`);
}

// ══ PROVA 7 — o CICLO COMPLETO da reavaliação ═════════════════════════════
//
// valor ruim → vermelho → ação bloqueada → remedir → valor novo → veredito
// recalculado → ação liberada — com a trilha inteira preservada.
{
  const m = novoMotor();
  m.setValue("queixas", ec.alternarSelecao(undefined, "dor"));
  m.setValue("pressao", "194/116", "aferido", "primeira_medida");
  m.advance();

  const etapas = [];
  etapas.push(`${m.getValues().pressao} → ${m.vereditoDe("med_x").nivel} · ação ${m.estadoDaAcao("med_x")}`);

  // A condição corrigível declarada pelo nó diz O QUE re-medir.
  const corrigivel = arvore.nodes.administrar.corrigiveis[0];
  confere(
    "a condição corrigível está ativa e aponta o campo a re-medir",
    corrigivel.persiste(m.getValues()) && corrigivel.remedir.includes("pressao"),
    "sem isso o vermelho seria beco: o médico veria o bloqueio e não teria o que fazer com ele."
  );

  m.remedir(corrigivel.remedir);
  confere(
    "durante a re-medida o valor some e a trilha permanece",
    m.getValues().pressao === undefined && m.getHistorico("pressao").length === 1,
    "se o valor não some, a tela não repergunta e 'corrigir' vira confirmar o número velho."
  );

  m.setValue("pressao", "138/84", "aferido", "apos_intervencao");
  etapas.push(`${m.getValues().pressao} → ${m.vereditoDe("med_x").nivel} · ação ${m.estadoDaAcao("med_x")}`);

  m.registrarExecucao("med_x");
  confere(
    "depois da correção a ação executa sem exigir decisão nenhuma",
    m.estadoDaAcao("med_x") === "realizada",
    "o veredito virou verde: exigir decisão clínica de um verde seria fricção sem risco."
  );

  const h = m.getHistorico("pressao");
  confere(
    "a trilha guarda as duas medições, com o par anterior→novo e o motivo",
    h.length === 2 && h[0].valor === "194/116" && h[1].valor === "138/84" &&
      h[1].anterior === "194/116" && h[1].motivo === "apos_intervencao",
    `veio ${JSON.stringify(h)} — sem o par e o motivo, o sumário não distingue "a PA baixou porque ` +
    `foi tratada" de "a PA baixou sozinha", e a diferença é clínica.`
  );
  linhas.push(`  7. ciclo: ${etapas.join("  →  ")}`);
  linhas.push(`     trilha preservada: ${ec.trilha(h, " mmHg")} (${h[1].motivo})`);
}

// ══ PROVA 8 — REIDRATAÇÃO: salvar, reabrir, e o caso continua o mesmo ═════
//
// ⚠️ O DEFEITO QUE ISTO FECHA: `lib/flow-session.ts` guardava só `valores` e
// reconstruía o motor reaplicando cada valor — o que criava histórico de UM
// ponto por campo, carimbado na hora da retomada. A tela voltaria mostrando
// "168/96 aferido agora", sem o 194/116, e uma ação já realizada reapareceria
// como pendente.
{
  const m = novoMotor();
  let bruto = undefined;
  for (const q of ["dor", "sudorese"]) bruto = ec.alternarSelecao(bruto, q);
  m.setValue("queixas", bruto);
  m.setValue("pressao", "194/116", "aferido", "primeira_medida");
  m.advance();
  m.remedir(["pressao"]);
  m.setValue("pressao", "168/96", "aferido", "apos_intervencao");
  m.registrarDecisao("med_x", "prosseguir");
  m.registrarExecucao("med_x");

  // Sair da tela: o estado vira JSON, como iria para a sessão de fluxo.
  const salvo = JSON.parse(JSON.stringify(m.exportarEstado()));

  // Reabrir: motor novo, árvore igual, estado restaurado.
  const m2 = novoMotor();
  m2.restaurarEstado(salvo);

  confere(
    "o checklist múltiplo sobrevive ao salvar/reabrir",
    ec.selecionados(m2.getValues(), "queixas").join("+") === "dor+sudorese",
    `veio "${ec.selecionados(m2.getValues(), "queixas").join("+")}" — se a serialização quebrasse o ` +
    `separador, a seleção voltaria vazia ou partida ao meio, em silêncio.`
  );
  confere(
    "o histórico sobrevive inteiro, com par e motivo",
    m2.getHistorico("pressao").length === 2 &&
      m2.getHistorico("pressao")[1].anterior === "194/116" &&
      m2.getHistorico("pressao")[1].motivo === "apos_intervencao",
    `veio ${JSON.stringify(m2.getHistorico("pressao"))} — retomada que perde a trilha devolve o ` +
    `número atual como se nunca tivesse havido impedimento.`
  );
  confere(
    "o veredito é RECALCULADO após a reidratação, não restaurado",
    m2.vereditoDe("med_x").nivel === "amarelo" && /168/.test(m2.vereditoDe("med_x").motivo),
    "veredito salvo envelheceria junto com o dado; recalcular é o que garante que ele fale do agora."
  );
  confere(
    "a ação continua 'realizada' — não volta a pendente",
    m2.estadoDaAcao("med_x") === "realizada",
    "reapresentar como pendente uma ação já executada é convite direto à dose dobrada."
  );
  confere(
    "as decisões sobrevivem com o tipo escolhido",
    m2.getDecisoes().length === 1 && m2.getDecisoes()[0].tipo === "prosseguir",
    "sem elas o sumário do caso perde o consentimento que autorizou a execução."
  );
  confere(
    "o nó atual sobrevive — a retomada volta onde parou",
    m2.getCurrentNode().id === "administrar",
    "voltar para a entrada da árvore é o defeito que a sessão de fluxo existe para evitar."
  );

  // E remedir() DEPOIS da retomada continua preservando a trilha herdada.
  m2.remedir(["pressao"]);
  m2.setValue("pressao", "132/80", "aferido", "reavaliacao");
  confere(
    "remedir() preserva o histórico herdado da sessão reaberta",
    m2.getHistorico("pressao").map((x) => x.valor).join(" → ") === "194/116 → 168/96 → 132/80",
    `veio "${m2.getHistorico("pressao").map((x) => x.valor).join(" → ")}" — a trilha não pode ` +
    `recomeçar do zero só porque a tela foi reaberta no meio.`
  );
  linhas.push(`  8. reidratado: queixas=${ec.selecionados(m2.getValues(), "queixas").join("+")} · nó "${m2.getCurrentNode().id}" · ação realizada`);
  linhas.push(`     trilha após reabrir e re-medir: ${ec.trilha(m2.getHistorico("pressao"), " mmHg")}`);
}

// ── Vacuidade ──────────────────────────────────────────────────────────────
confere(
  "as quatro provas produziram evidência",
  linhas.length >= 14,
  `só ${linhas.length} linhas de evidência — pode ter rodado sobre nada (R-15 item 9).`
);

console.log("\nNúcleo — checklist, valor com histórico, veredito derivado, bloqueio de ação\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o núcleo entrega as cinco capacidades\n`);
process.exit(0);
