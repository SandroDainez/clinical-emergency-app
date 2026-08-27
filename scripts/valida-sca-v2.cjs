#!/usr/bin/env node
/**
 * PROMETE: que a SCA V2 nasça AO LADO da V1 sem tocá-la; que reutilize a camada
 *   de segurança em vez de reescrevê-la; que as três decisões existam e sejam
 *   alcançáveis; que `supra_inferior` seja DERIVADO e não perguntado; e que
 *   nenhum estado de dúvida vire conclusão — nem no ECG nem na reperfusão.
 * NÃO PROMETE: que o conteúdo clínico da V2 esteja completo — ela implementa
 *   só o caminho crítico, e os terminais dizem isso. Nem o comportamento de
 *   tela (`test:e2e`), nem as janelas do PDE-5 (`test:pde5-janela`), nem a
 *   governança de dose (`test:dose-governada`), que valem para as duas árvores.
 * UNIVERSO: `coronary-v2-decision-tree.ts`, o motor e as libs compartilhadas.
 *
 * ── POR QUE UMA V2 EXISTE ───────────────────────────────────────────────────
 *
 * A V1 ficou segura e estruturalmente errada ao mesmo tempo. Decisão do autor,
 * 2026-08-26: "não quero continuar remodelando a árvore atual nó por nó — o
 * problema é que estávamos tentando transformar a árvore em algo que ela não
 * nasceu para ser".
 *
 * A unidade deixa de ser "Passo 17 de 95" e passa a ser a decisão clínica. Mas
 * a camada de segurança — vereditos, janela do PDE-5, dose governada, marcos
 * temporais, retomada — é herança da V1 e entra INTEIRA, por reutilização.
 *
 * ── O QUE ESTA TRAVA IMPEDE ─────────────────────────────────────────────────
 *
 * 1. Que a V2 duplique lógica clínica em vez de consumir as libs. Duas cópias
 *    da mesma regra divergem em silêncio, e a que estiver errada é a que decide.
 * 2. Que a V1 seja tocada enquanto a V2 não estiver aprovada.
 * 3. Que `supra_inferior` volte a ser CAMPO — foi a repergunta que o autor
 *    encontrou testando no celular, e a razão de a V2 existir.
 * 4. Que "não sei" no ECG caia no ramo sem supra, ou que "não consegui avaliar"
 *    a reperfusão vire falha. Desconhecido ≠ negativo E ≠ positivo.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sca-v2-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "core", "decision-tree", "engine.ts"),
  path.join(appDir, "coronary-v2-decision-tree.ts"),
  path.join(appDir, "coronary-decision-tree.ts"),
], { cwd: appDir, stdio: "pipe" });

const { DecisionTreeEngine, validateDecisionTree } = require(path.join(tmp, "core", "decision-tree", "engine.js"));
const { coronaryV2DecisionTree: V2 } = require(path.join(tmp, "coronary-v2-decision-tree.js"));
const { coronaryDecisionTree: V1 } = require(path.join(tmp, "coronary-decision-tree.js"));

// ── A. A V2 É VÁLIDA E A V1 CONTINUA INTEIRA ───────────────────────────────
{
  const issues = validateDecisionTree(V2).filter((i) => i.level === "error");
  confere(
    "a V2 passa na validação estrutural do motor",
    issues.length === 0,
    `${issues.length} erro(s): ${issues.map((i) => `${i.nodeId}: ${i.message}`).join(" · ")}`
  );

  confere(
    "a V1 continua com os 95 nós — a V2 não a tocou",
    Object.keys(V1.nodes).length === 95,
    `a V1 tem ${Object.keys(V1.nodes).length} nós. A decisão do autor foi explícita: "não altere nem apague a ` +
    `árvore atual". Ela segue publicada em produção enquanto a V2 não for aprovada.`
  );

  confere(
    "as duas árvores têm ids distintos",
    V1.id !== V2.id && V2.id === "sca_v2_2025",
    `V1="${V1.id}" · V2="${V2.id}". Id repetido colidiria em sessão, log e persistência.`
  );

  // ⚠️ A FAIXA APROVADA É DE NÓS PRINCIPAIS, e a distinção não é contábil.
  // O acordo com o autor foi explícito: "as telas de ajuda continuam existindo,
  // mas penduradas na decisão que as pede, não como etapas do fluxo". Contar
  // ajuda como etapa faria a trava reprovar exatamente quando o app melhora —
  // acrescentar uma ajuda visual é o oposto de virar a V1 de novo.
  //
  // A primeira versão desta conferência contava tudo e reprovou quando a
  // checagem de oclusão sem supra entrou. O teto não subiu: a contagem é que
  // passou a medir o que a faixa sempre significou.
  const AUXILIARES = /ajuda|indeterminad|estabilizar|ci_lista/;
  const todos = Object.keys(V2.nodes);
  const principais = todos.filter((id) => !AUXILIARES.test(id));
  const auxiliares = todos.length - principais.length;
  confere(
    "a V2 fica na ordem de grandeza aprovada (15–25 nós principais)",
    principais.length >= 15 && principais.length <= 25,
    `a V2 tem ${principais.length} nós principais (${todos.length} no total, ${auxiliares} de ajuda ou desvio). ` +
    `Acima de 25 ela está virando a V1 de novo; abaixo de 15, faltou caminho crítico.`
  );
  confere(
    "os auxiliares não são a maioria da árvore",
    auxiliares < principais.length,
    `${auxiliares} auxiliares contra ${principais.length} principais. Se a ajuda passa a pesar mais que o ` +
    `fluxo, a V2 deixou de ser navegação por decisões.`
  );
  linhas.push(
    `  A. V2 com ${principais.length} principais + ${auxiliares} auxiliares · V1 intacta com ${Object.keys(V1.nodes).length}`
  );
}

// ── B. AS TRÊS DECISÕES EXISTEM, NUMERADAS E ALCANÇÁVEIS ───────────────────
{
  const DECISOES = ["v2_decisao1", "v2_decisao2", "v2_decisao3"];
  for (const id of DECISOES) {
    const no = V2.nodes[id];
    confere(
      `\`${id}\` existe e é uma decisão`,
      no && no.type === "decision",
      `nó ausente ou de tipo "${no?.type}". As três decisões são o esqueleto da V2 — sem elas o médico volta ` +
      `a navegar por número de passo.`
    );
    if (!no) continue;
    confere(
      `\`${id}\` se anuncia como "Decisão N de 3"`,
      /Decis[ãa]o \d de 3/.test(no.title),
      `título é "${no.title}". O ganho da V2 é o médico saber onde está na cronologia clínica, não no app.`
    );
  }

  // Alcançabilidade a partir da entrada.
  const N = V2.nodes;
  const saidas = (no) => {
    const s = [];
    if (no.options) for (const o of no.options) o.next && s.push(o.next);
    const nx = no.next;
    if (typeof nx === "string") s.push(nx);
    else if (nx && Array.isArray(nx.possiveis)) s.push(...nx.possiveis);
    return s.filter((x) => N[x]);
  };
  const vistos = new Set([V2.entryNodeId]);
  const fila = [V2.entryNodeId];
  while (fila.length) {
    for (const d of saidas(N[fila.shift()])) if (!vistos.has(d)) { vistos.add(d); fila.push(d); }
  }
  const orfaos = Object.keys(N).filter((k) => !vistos.has(k));
  confere(
    "nenhum nó da V2 é órfão",
    orfaos.length === 0,
    `inalcançáveis a partir de \`${V2.entryNodeId}\`: ${orfaos.join(", ")}.`
  );

  for (const id of ["v2_icp", "v2_fibrinolise", "v2_reavaliacao", "v2_icp_resgate", "v2_farmacoinvasiva"]) {
    confere(
      `\`${id}\` é alcançável pelo caminho crítico`,
      vistos.has(id),
      `o destino existe mas ninguém chega nele — o caminho crítico está partido.`
    );
  }
  linhas.push(`  B. 3 decisões numeradas · ${vistos.size} nós alcançáveis, 0 órfãos`);
}

// ── C. `supra_inferior` É DERIVADO, NUNCA PERGUNTADO ───────────────────────
//
// ⚠️ ESTA É A REPERGUNTA QUE ORIGINOU A V2. Na V1 o ECG é lido cedo e, seis
// passos depois, o app pergunta `supra_inferior` — dois campos para o mesmo
// achado no mesmo traçado. O autor encontrou testando no celular.
{
  const perguntado = Object.entries(V2.nodes)
    .filter(([, n]) => (n.fields ?? []).some((f) => f.id === "supra_inferior"))
    .map(([id]) => id);
  confere(
    "`supra_inferior` não é campo em nenhum nó da V2",
    perguntado.length === 0,
    `perguntado em: ${perguntado.join(", ")}. O território já responde por ele — reperguntar é o app ` +
    `ignorando o que ele mesmo acabou de receber.`
  );

  const casos = [
    ["inferior", "sim"],
    ["anterior", "nao"],
    ["lateral", "nao"],
    ["posterior", "nao"],
  ];
  for (const [territorio, esperado] of casos) {
    const derivado = V2.derive({ territorio });
    confere(
      `território "${territorio}" deriva supra_inferior = "${esperado}"`,
      derivado.supra_inferior === esperado,
      `veio "${derivado.supra_inferior}". O veredito do nitrato e \`suspeitaDeVd\` leem esta chave sem saber ` +
      `de onde ela veio — derivar errado erra o gating do nitrato em todos os nós de uma vez.`
    );
  }

  confere(
    "sem território informado, `supra_inferior` NÃO é inventado",
    V2.derive({}).supra_inferior === undefined,
    `a derivação produziu um valor sem território. Isso afirmaria que não há supra inferior quando ninguém ` +
    `disse — e o veredito do nitrato liberaria sobre um dado que não existe.`
  );
  linhas.push(`  C. supra_inferior derivado do território em 4 casos, e ausente quando não há território`);
}

// ── D. DÚVIDA NÃO VIRA CONCLUSÃO ───────────────────────────────────────────
{
  // O ECG indeterminado não pode cair no ramo sem supra.
  const d1 = V2.nodes.v2_decisao1;
  const naoSei = d1.options.find((o) => o.id === "nao_sei");
  confere(
    "na Decisão 1, `não sei` tem destino próprio",
    naoSei && naoSei.next !== "v2_sem_supra_parcial",
    `"não sei" vai para "${naoSei?.next}". Mandar a dúvida para o ramo sem supra converteria ausência de ` +
    `leitura em ausência de oclusão — o paciente sairia da fila da reperfusão por um dado que ninguém tem.`
  );

  const ajuda = V2.nodes.v2_d1_ajuda;
  const persistente = (ajuda.options ?? []).find((o) => o.id === "indeterminado");
  confere(
    "a ajuda do ECG preserva a dúvida — não força Sim/Não",
    persistente && persistente.next === "v2_ecg_indeterminado",
    `a ajuda oferece ${(ajuda.options ?? []).length} saídas e a terceira leva a "${persistente?.next}". ` +
    `Uma tela que só existe porque o médico disse "não sei" não pode obrigá-lo a escolher.`
  );

  // ⚠️ O CASO QUE O AUTOR CORRIGIU NO WIREFRAME: eu havia roteado
  // "parcial/não consigo dizer" como FALHA de reperfusão.
  const reav = V2.nodes.v2_reavaliacao;
  const estados = (reav.options ?? []).map((o) => o.grava?.valor);
  confere(
    "a reavaliação pós-fibrinólise tem TRÊS estados",
    estados.length === 3 && ["provavel", "falha", "indeterminado"].every((e) => estados.includes(e)),
    `estados: ${JSON.stringify(estados)}. Dois estados obrigam o indeterminado a virar falha ou sucesso — ` +
    `e falha de reperfusão se define por achado OBJETIVO (resolução do ST < 50%, dor persistente, ` +
    `instabilidade), não por ausência de avaliação.`
  );

  const indet = (reav.options ?? []).find((o) => o.grava?.valor === "indeterminado");
  confere(
    "o indeterminado da reperfusão NÃO roteia para resgate nem para fármaco-invasiva",
    indet && indet.next === "v2_reperfusao_indeterminada",
    `o indeterminado vai para "${indet?.next}". Ele precisa de destino próprio, que diz o que falta para ` +
    `decidir — não pode ficar parado nem virar conclusão.`
  );

  const orienta = V2.nodes.v2_reperfusao_indeterminada;
  confere(
    "a tela do indeterminado orienta a completar a avaliação e volta",
    orienta && (orienta.actions ?? []).length >= 4 && orienta.next === "v2_reavaliacao",
    `${(orienta?.actions ?? []).length} orientações, próximo = "${orienta?.next}". Sem a volta, o médico ` +
    `fica preso; sem as orientações, a tela só declara a dúvida sem ajudar a resolvê-la.`
  );
  linhas.push(`  D. 3 estados na reperfusão · dúvida com destino próprio no ECG e na reavaliação`);
}

// ── E. A V2 REUTILIZA, NÃO REESCREVE ───────────────────────────────────────
{
  const fonte = lerFonte("coronary-v2-decision-tree.ts");

  const IMPORTES = [
    ["./lib/vereditos-sca", "os vereditos"],
    ["./lib/instabilidade-coronariana", "a avaliação de ameaça imediata"],
    ["./lib/ecg-tempo", "a faixa e a meta de 10 min"],
    ["./lib/tenecteplase", "o regime do TNK"],
    ["./lib/enoxaparina", "o regime da enoxaparina"],
    ["./lib/oclusao-sem-supra", "os padrões de oclusão sem supra"],
  ];
  for (const [mod, oQue] of IMPORTES) {
    confere(
      `a V2 importa ${oQue} de \`${mod}\``,
      fonte.includes(`from "${mod}"`),
      `não importa. Reescrever a regra aqui criaria uma segunda cópia que diverge em silêncio da que a V1 usa — ` +
      `e a que estiver errada é a que decide.`
    );
  }

  // ⚠️ NENHUMA DOSE SOLTA. Mesma regra da V1, cobrada aqui também.
  const DOSE = /(DINITRATO|NITROGLICERINA|MORFINA)[^.]{0,40}\d\s*(–|-|a)?\s*\d*\s*mg/i;
  const comDose = Object.entries(V2.nodes)
    .filter(([, n]) => DOSE.test((n.actions ?? []).join(" ")))
    .map(([id]) => id);
  confere(
    "nenhuma dose de nitrato ou morfina solta em `actions` na V2",
    comDose.length === 0,
    `dose solta em: ${comDose.join(", ")}. A dose pertence a \`Veredito.instrucao\`, que só aparece no verde.`
  );

  // ⚠️ OS VEREDITOS SAÍRAM DO NÓ E FORAM PARA O BLOCO EM PARALELO (2026-08-27).
  // Esta conferência media `v2_terapias.vereditos` e reprovou quando a mudança
  // entrou — corretamente: ela perdeu o alvo. O teto não mudou; o que mudou foi
  // ONDE as terapias vivem, e é isso que ela passa a medir.
  const ids = ((V2.terapiasEmParalelo ?? {}).vereditos ?? []).map((v) => v.id);
  confere(
    "as terapias em paralelo governam AAS, nitrato e morfina por veredito",
    ["aas", "nitrato", "morfina"].every((f) => ids.includes(f)),
    `vereditos: ${JSON.stringify(ids)}. Sem eles a V2 ficaria sem a camada que custou três rodadas na V1 — e o ` +
    `AAS, que não existia na primeira versão da V2, voltaria a sumir.`
  );

  const comBloco = Object.entries(V2.nodes).filter(([, n]) => n.comTerapias).map(([id]) => id);
  confere(
    "o bloco acompanha as decisões, não é uma tela",
    comBloco.includes("v2_decisao1") && comBloco.includes("v2_decisao2") && comBloco.includes("v2_decisao3"),
    `nós com bloco: ${comBloco.join(", ")}. As três decisões precisam mostrá-lo — a terapia corre EM PARALELO ` +
    `à reperfusão, e era a décima tela antes desta rodada.`
  );

  const campos = ((V2.terapiasEmParalelo ?? {}).campos ?? []).map((c) => c.id);
  confere(
    "`dor_persiste` vive no bloco e só aparece depois do nitrato registrado",
    campos.includes("dor_persiste") &&
      ((V2.terapiasEmParalelo.campos.find((c) => c.id === "dor_persiste") ?? {}).showIf?.({ __realizada_nitrato: "1" }) === true) &&
      ((V2.terapiasEmParalelo.campos.find((c) => c.id === "dor_persiste") ?? {}).showIf?.({}) === false),
    `campos do bloco: ${JSON.stringify(campos)}. Perguntar se a dor persiste antes de o nitrato existir é ` +
    `perguntar sobre a resposta a um tratamento que não houve.`
  );

  confere(
    "a V2 declara os três marcos temporais",
    V2.marcos &&
      V2.marcos.fmc_min === "primeiroContatoMedico" &&
      V2.marcos.tempo_dor === "inicioDoEvento" &&
      V2.marcos.tnk_ha_min === "ultimaDose",
    `marcos = ${JSON.stringify(V2.marcos)}. São eles que fazem as Decisões 2 e 3 e a reavaliação MOSTRAREM o ` +
    `tempo em vez de perguntá-lo.`
  );
  linhas.push(`  E. 6 libs reutilizadas · 3 marcos · 0 doses soltas`);
}

// ── F. OS RELÓGIOS CONTAM DO EVENTO, NÃO DA TELA ───────────────────────────
{
  const T0 = Date.UTC(2026, 7, 26, 15, 0, 0);
  const motor = new DecisionTreeEngine(V2, { agora: () => T0 });
  motor.setValue("fmc_min", "40");
  motor.setValue("tempo_dor", "200");
  motor.setValue("tnk_ha_min", "70");

  const v = motor.getValues();
  const desde = (chave) => Math.floor((T0 - Number(v[chave])) / 60_000);

  for (const [chave, esperado, oQue] of [
    ["__marco_primeiroContatoMedico", 40, "a janela de 120 min da ICP"],
    ["__marco_inicioDoEvento", 200, "a janela de 12 h da fibrinólise"],
    ["__marco_ultimaDose", 70, "os 60–90 min da reavaliação"],
  ]) {
    confere(
      `o marco de ${oQue} conta do evento (${esperado} min), não da tela`,
      desde(chave) === esperado,
      `veio ${desde(chave)} min. Ancorar em "agora" responderia "há quanto tempo o app está aberto" — e as ` +
      `três janelas apareceriam sempre como recém-começadas.`
    );
  }
  linhas.push(`  F. 3 relógios ancorados no evento: contato 40 min · dor 200 min · bolus 70 min`);
}

// ── G. OS TERMINAIS DIZEM A VERDADE SOBRE O QUE NÃO EXISTE ─────────────────
//
// ⚠️ Um ramo pela metade que finge estar completo é pior que um destino
// honesto: o médico segue o app até um fim que não existe.
{
  for (const id of ["v2_fim_do_caminho", "v2_sem_supra_parcial"]) {
    const no = V2.nodes[id];
    // ⚠️ LÊ OS DOIS FORMATOS. `v2_fim_do_caminho` virou nó de TRANSIÇÃO quando
    // `test:arvores` mostrou que a árvore não tinha fim — e transição guarda o
    // texto em `exitCriteria`, não em `actions`. Uma trava que lesse só um dos
    // dois aprovaria por não ver, que é o modo de falha mais caro aqui.
    const texto = [no?.title, no?.summary, ...(no?.actions ?? []), ...(no?.exitCriteria ?? [])].join(" ");
    confere(
      `\`${id}\` declara que ainda não foi construído e aponta a V1`,
      /ainda não|não foram construíd|não existe/i.test(texto) && /V1|Síndromes Coronarianas/.test(texto),
      `o terminal não avisa. Enquanto o ramo não existe, ele precisa mandar o médico para o módulo que está ` +
      `completo — silêncio aqui é o app fingindo cobertura.`
    );
  }
}

// ── H. Vacuidade ───────────────────────────────────────────────────────────
confere(
  "as conferências rodaram sobre as duas árvores reais",
  Object.keys(V2.nodes).length > 10 && Object.keys(V1.nodes).length > 50,
  `V2 com ${Object.keys(V2.nodes).length} nós e V1 com ${Object.keys(V1.nodes).length} — a trava pode ter ` +
  `medido nada (R-15 item 9).`
);

// ── I. O BLOCO INICIAL SEGUE A SEQUÊNCIA CLÍNICA DO AUTOR ──────────────────
//
// ⚠️ A ORDEM É CLÍNICA, NÃO DE CONVENIÊNCIA (decisão do autor, 2026-08-27,
// depois de percorrer a V2 no celular): entrada → dados do paciente →
// estabilidade → medidas iniciais → analgesia e exames com o ECG em destaque →
// interpretação. Trocar a ordem muda o atendimento, não só a navegação.
{
  const ESPERADA = [
    ["v2_entrada", "action"],
    ["v2_dados_paciente", "input"],
    ["v2_ameacas", "input"],
    ["v2_medidas_iniciais", "action"],
    ["v2_analgesia_exames", "input"],
    ["v2_decisao1", "decision"],
  ];
  let atual = V2.entryNodeId;
  const percorrido = [];
  for (let i = 0; i < ESPERADA.length && atual; i++) {
    const no = V2.nodes[atual];
    if (!no) break;
    percorrido.push([atual, no.type]);
    if (no.type === "decision") break;
    const nx = no.next;
    // No caminho SEM ameaça — que é o que define a sequência do bloco inicial.
    atual = typeof nx === "string" ? nx : nx && nx.possiveis ? nx.possiveis[1] ?? nx.possiveis[0] : null;
  }
  confere(
    "o bloco inicial segue a sequência clínica aprovada",
    JSON.stringify(percorrido) === JSON.stringify(ESPERADA),
    `percorrido: ${percorrido.map(([i, t]) => `${i}(${t})`).join(" → ")}\n` +
    `      esperado:  ${ESPERADA.map(([i, t]) => `${i}(${t})`).join(" → ")}`
  );
  linhas.push(`  I. ${percorrido.length} telas na ordem: ${percorrido.map(([i]) => i.replace("v2_", "")).join(" → ")}`);
}

// ── J. NENHUM CAMPO É PERGUNTADO DUAS VEZES ────────────────────────────────
//
// ⚠️ ESTA É A REGRA QUE ORIGINOU A V2, generalizada. O autor encontrou
// `supra_inferior` sendo perguntado depois de o ECG já ter sido lido, e o
// PDE-5 reaparecendo seis passos adiante. Um campo em dois nós é o app
// desconfiando do que ele mesmo guardou — e abre a porta para dois valores
// diferentes do mesmo dado decidirem coisas diferentes no mesmo atendimento.
{
  const onde = {};
  for (const [id, n] of Object.entries(V2.nodes)) {
    for (const f of n.fields ?? []) (onde[f.id] ??= []).push(id);
  }
  const duplicados = Object.entries(onde).filter(([, nos]) => nos.length > 1);
  confere(
    "nenhum campo da V2 é coletado em mais de um nó",
    duplicados.length === 0,
    `${duplicados.map(([c, nos]) => `\`${c}\` em ${nos.join(" e ")}`).join(" · ")}.`
  );

  const campos = Object.keys(onde).length;
  confere(
    "há campos suficientes para a conferência medir algo",
    campos >= 10,
    `só ${campos} campos na árvore inteira — a trava pode ter rodado sobre nada (R-15 item 9).`
  );
  linhas.push(`  J. ${campos} campos distintos, cada um coletado em um nó só`);
}

// ── K. A DECISÃO 1 PERGUNTA SÓ SOBRE SUPRA, E MOSTRA O TRAÇADO ─────────────
{
  const d1 = V2.nodes.v2_decisao1;
  confere(
    "a Decisão 1 não mistura BRE na pergunta do supra",
    !/BRE|bloqueio de ramo|ramo esquerdo/i.test(d1.question),
    `a pergunta é "${d1.question}". Decisão do autor: a novidade do BRE depende de ECG prévio ou de contexto ` +
    `— é outra variável, e merece decisão própria. Misturar obriga a responder por duas coisas com um toque.`
  );

  for (const [id, minimo] of [["v2_decisao1", 2], ["v2_d1_ajuda", 3]]) {
    const reais = (V2.nodes[id].comparativo ?? []).filter((c) => c.imagemReal);
    confere(
      `\`${id}\` mostra ao menos ${minimo} traçados de referência`,
      reais.length >= minimo,
      `tem ${reais.length}. A decisão que bifurca o módulo — e a tela que existe porque o médico disse que ` +
      `não sabe reconhecer — não podem ensinar padrão de ECG por texto.`
    );
  }

  const ajuda = V2.nodes.v2_d1_ajuda.comparativo ?? [];
  const ids = ajuda.map((c) => c.imagemReal);
  confere(
    "a ajuda compara normal, supra E infra",
    ["ecg-normal", "ecg-supra-st", "ecg-infra-st"].every((i) => ids.includes(i)),
    `imagens: ${JSON.stringify(ids)}. É o contraste entre os três que faz reconhecer — normal sozinho não ` +
    `ensina, e supra sem infra não distingue o que NÃO é supra.`
  );
  linhas.push(`  K. Decisão 1 sem BRE · ${ajuda.filter((c) => c.imagemReal).length} traçados reais na ajuda`);
}

// ── L. "SEM SUPRA" NÃO VIRA NSTE AUTOMÁTICO ────────────────────────────────
//
// ⚠️ ACHADO DO AUTOR, 2026-08-27: a V2 mandava o "Não" da Decisão 1 direto para
// o ramo sem supra. Cinco padrões ocluem a coronária SEM elevar o ST nas 12
// derivações padrão, e dois deles só aparecem em derivações que ninguém
// colocou — "não vi" pode significar apenas "não olhei". Tirar esses pacientes
// da fila da reperfusão por ausência de supra clássico é o erro que esta
// conferência existe para impedir.
{
  const d1 = V2.nodes.v2_decisao1;
  const nao = d1.options.find((o) => o.id === "nao");
  confere(
    'o "Não" da Decisão 1 passa pela checagem de oclusão sem supra',
    nao && nao.next === "v2_oclusao_sem_supra",
    `"Não" vai direto para "${nao?.next}". Sem a checagem, De Winter e infarto posterior — que são sala de ` +
    `hemodinâmica agora — seriam classificados como síndrome sem supra e estratificados por troponina.`
  );

  const ajuda = V2.nodes.v2_d1_ajuda.options.find((o) => o.id === "nao");
  confere(
    'o "Não tem" da ajuda do ECG também passa pela checagem',
    ajuda && ajuda.next === "v2_oclusao_sem_supra",
    `vai para "${ajuda?.next}". A ajuda não pode ser o atalho que contorna a trava.`
  );

  const chk = V2.nodes.v2_oclusao_sem_supra;
  confere(
    "a checagem nomeia De Winter e posterior",
    chk && chk.options.some((o) => o.id === "de_winter") && chk.options.some((o) => o.id === "posterior"),
    `opções: ${(chk?.options ?? []).map((o) => o.id).join(", ")}. São os dois padrões que o autor nomeou.`
  );

  confere(
    "a checagem mostra traçado — o reconhecimento é visual",
    (chk?.comparativo ?? []).length >= 3,
    `${(chk?.comparativo ?? []).length} traçados. Descrever De Winter em texto transfere ao médico a tradução ` +
    `mais difícil justamente onde ela decide reperfusão.`
  );

  confere(
    "a checagem é curta — não virou galeria",
    (chk?.options ?? []).length <= 5,
    `${(chk?.options ?? []).length} opções. Decisão do autor: "não quero uma galeria extensa aqui" — a ` +
    `varredura completa dos cinco padrões continua na V1.`
  );

  // ⚠️ E O aVR NÃO PODE CHEGAR À FIBRINÓLISE.
  const avr = chk?.options.find((o) => o.id === "avr");
  confere(
    "o padrão de tronco (aVR) tem caminho próprio, fora da fibrinólise",
    avr && avr.next === "v2_avr_alto_risco",
    `aVR vai para "${avr?.next}". A V1 já separa este ramo ("Sala urgente — fibrinólise fora"): tronco ou ` +
    `doença multiarterial NÃO é candidato a trombolítico, e roteá-lo pela reperfusão comum o levaria à ` +
    `Decisão 3, que oferece fibrinólise.`
  );

  // Alcançabilidade: partindo de v2_avr_alto_risco, a Decisão 3 tem de ser inalcançável.
  const N = V2.nodes;
  const saidas = (no) => {
    const out = [];
    if (no.options) for (const o of no.options) o.next && out.push(o.next);
    const nx = no.next;
    if (typeof nx === "string") out.push(nx);
    else if (nx && Array.isArray(nx.possiveis)) out.push(...nx.possiveis);
    return out.filter((x) => N[x]);
  };
  const daqui = new Set(["v2_avr_alto_risco"]);
  const fila = ["v2_avr_alto_risco"];
  while (fila.length) for (const d of saidas(N[fila.shift()])) if (!daqui.has(d)) { daqui.add(d); fila.push(d); }
  confere(
    "de `v2_avr_alto_risco` não se alcança a Decisão 3 (fibrinólise)",
    !daqui.has("v2_decisao3") && !daqui.has("v2_fibrinolise"),
    `alcançáveis a partir do ramo de tronco: ${[...daqui].join(", ")}. O trombolítico não pode estar entre eles.`
  );

  const indet = V2.nodes.v2_oclusao_indeterminado;
  confere(
    "a dúvida sobre o padrão não vira `nenhum destes`",
    indet && indet.next === "v2_oclusao_sem_supra" && (indet.actions ?? []).length >= 3,
    `a tela do indeterminado ${indet ? `volta para "${indet.next}"` : "não existe"}. Dois dos padrões só ` +
    `aparecem em derivações que ninguém colocou — a dúvida manda registrá-las, não reclassificar.`
  );

  linhas.push(
    `  L. "não" → checagem de oclusão (${(chk?.options ?? []).length} opções, ${(chk?.comparativo ?? []).length} traçados) · aVR fora da fibrinólise`
  );
}

// ── M. DUAS REDAÇÕES CLÍNICAS QUE O AUTOR CORRIGIU ─────────────────────────
{
  // ⚠️ O ECG NÃO DIAGNOSTICA TRONCO. Eu havia escrito que supra em aVR com
  // infra difuso "sugere tronco ou doença multiarterial" e roteado por isso. O
  // autor corrigiu: o que o padrão estabelece é isquemia subendocárdica extensa
  // de alto risco e que o trombolítico está fora. A anatomia quem define é a
  // angiografia — nomear a artéria a partir do traçado é diagnosticar por
  // inferência e escrever isso no app como se fosse achado.
  const avr = V2.nodes.v2_avr_alto_risco;
  const textoAvr = [avr?.title, avr?.summary, ...(avr?.actions ?? []), ...(avr?.porque ?? [])].join(" ");
  confere(
    "o ramo do aVR NÃO afirma lesão de tronco",
    avr && !/lesão de tronco|tronco da coronária|tronco esquerdo/i.test(textoAvr),
    `o texto nomeia a anatomia. O ECG sugere alto risco; ele não fecha qual artéria está acometida.`
  );
  confere(
    "o ramo do aVR declara isquemia extensa de alto risco e exclui o trombolítico",
    /alto risco/i.test(textoAvr) && /(não|nao).{0,40}(trombolítico|fibrinólise)/i.test(textoAvr),
    `o texto precisa dizer as duas coisas: por que é grave, e por que a fibrinólise está fora.`
  );

  // ⚠️ DERIVAÇÃO CONFORME A SUSPEITA, NÃO EM BLOCO. V7–V9 responde "é
  // posterior?"; V3R–V4R responde "o VD está acometido?". Pedir os dois em todo
  // caso indeterminado é ruído que treina a ignorar o pedido.
  for (const id of ["v2_oclusao_indeterminado", "v2_ecg_indeterminado"]) {
    const no = V2.nodes[id];
    const linhas7 = (no?.actions ?? []).filter((a) => /V7|V9/.test(a));
    const linhas3r = (no?.actions ?? []).filter((a) => /V3R|V4R/.test(a));
    confere(
      `\`${id}\` pede V7–V9 e V3R–V4R de forma CONDICIONAL`,
      linhas7.every((a) => /\bse\b/i.test(a)) && linhas3r.every((a) => /\bse\b/i.test(a)),
      `há pedido incondicional de derivação adicional. Cada conjunto responde a uma pergunta diferente — ` +
      `pedir os dois sempre sugere que o app suspeita das duas coisas quando ele não suspeita de nenhuma.`
    );
    confere(
      `\`${id}\` prevê o caso de não distinguir o padrão`,
      (no?.actions ?? []).some((a) => /não (for )?possível distinguir|sem assumir/i.test(a)),
      `falta a saída para quem não consegue distinguir: completar a avaliação SEM assumir nenhum dos padrões.`
    );
  }
  linhas.push(`  M. aVR sem diagnóstico de tronco · derivações adicionais condicionais em 2 telas`);
}

// ── N. A V2 É ALCANÇÁVEL POR TOQUE, NÃO SÓ POR URL ─────────────────────────
//
// ⚠️ ACHADO DO AUTOR, 2026-08-27: "não estou vendo a modificação das telas, não
// sei se estou entrando em link errado". A rota funcionava e o módulo estava
// registrado em `clinical-modules.ts` — mas o hub monta os cards a partir de
// `constants/module-groups.ts`, e a V2 não estava em grupo nenhum.
//
// Registrar o módulo dá a ROTA. O card é outra coisa, e sem ele o módulo existe
// e é inalcançável por toque: só chega quem digita a URL. Uma tela que ninguém
// alcança é uma tela que não existe.
{
  const fonteGrupos = lerFonte("constants/module-groups.ts");
  const fonteModulos = lerFonte("clinical-modules.ts");
  const fonteHub = lerFonte("components/module-hub.tsx");
  const SLUG = "sindromes-coronarianas-v2";

  confere(
    "a V2 está registrada em `clinical-modules.ts` (a rota existe)",
    fonteModulos.includes(`"${SLUG}"`),
    `sem registro não há rota — /modulos/${SLUG} devolveria 404.`
  );
  confere(
    "a V2 tem card em `constants/module-groups.ts` (dá para chegar por toque)",
    fonteGrupos.includes(`"${SLUG}"`),
    `o módulo existe e não aparece no hub. Só chega quem digita a URL — que foi exatamente o que ` +
    `aconteceu quando o autor tentou testar.`
  );
  confere(
    "a V1 continua no hub, ao lado da V2",
    /"sindromes-coronarianas"[^\n]*"sindromes-coronarianas-v2"|"sindromes-coronarianas-v2"[^\n]*"sindromes-coronarianas"/.test(fonteGrupos),
    `as duas precisam aparecer juntas: o objetivo do preview é comparar uma com a outra no telefone.`
  );
  confere(
    "a V2 tem ícone próprio no hub",
    fonteHub.includes(`"${SLUG}"`),
    `sem entrada no mapa de ícones o card nasce sem símbolo.`
  );
  linhas.push(`  N. V2 com rota, card no hub e ícone — alcançável por toque`);
}

confere(
  "as doze linhas de medição foram produzidas",
  linhas.length === 12,
  `só ${linhas.length} de 12 blocos mediram algo.`
);

console.log("\nSCA V2 — navegação por decisões, ao lado da V1 e sobre a mesma segurança\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — a V2 conduz decisões e herda a segurança inteira\n`);
process.exit(0);
