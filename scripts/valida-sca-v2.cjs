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

  const n = Object.keys(V2.nodes).length;
  confere(
    "a V2 fica na ordem de grandeza aprovada (15–25 nós principais)",
    n >= 15 && n <= 25,
    `a V2 tem ${n} nós. Acima de 25 ela está virando a V1 de novo; abaixo de 15, faltou caminho crítico.`
  );
  linhas.push(`  A. V2 com ${n} nós · V1 intacta com ${Object.keys(V1.nodes).length}`);
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

  const terapias = V2.nodes.v2_terapias;
  const ids = (terapias.vereditos ?? []).map((v) => v.id);
  confere(
    "o nó de terapias governa nitrato e morfina por veredito",
    ids.includes("nitrato") && ids.includes("morfina"),
    `vereditos: ${JSON.stringify(ids)}. Sem eles a V2 nasceria sem a camada que custou três rodadas na V1.`
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
confere(
  "as seis linhas de medição foram produzidas",
  linhas.length === 6,
  `só ${linhas.length} de 6 blocos mediram algo.`
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
