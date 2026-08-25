#!/usr/bin/env node
/**
 * PROMETE: que os três vereditos da SCA (nitrato, AAS, betabloqueador) apliquem
 *   as contraindicações em vez de imprimi-las; que 🔴 bloqueie AQUELE fármaco
 *   sem parar o atendimento nem os outros dois; que "liberado" nunca signifique
 *   "feito"; que a suspeita de VD venha de CONTEXTO e não da ausência de um
 *   exame; e que nenhum veredito seja persistido como verdade clínica.
 * NÃO PROMETE: a renderização — isso é `e2e/vereditos-sca.spec.ts`. Nem o
 *   conteúdo das doses (test:coronarias, test:farmacos).
 * UNIVERSO: lib/vereditos-sca.ts, a árvore compilada e o motor real.
 *
 * ── O QUE MUDA DE FATO ──────────────────────────────────────────────────────
 *
 * Até aqui as ressalvas eram TEXTO: "AAS 300 mg agora, SALVO alergia/
 * sangramento ativo"; "⛔ NÃO USAR nitrato se…"; "NÃO iniciar se…". O app
 * enunciava a regra e deixava a aplicação para quem lê — com o paciente na
 * frente. Veredito é a mesma regra, aplicada: o app já sabe PAS, FC, perfusão e
 * ausculta, e pode responder "não administre, PAS 82 mmHg".
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

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "vereditos-sca-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "coronary-decision-tree.ts"),
  path.join(appDir, "core", "decision-tree", "engine.ts"),
], { cwd: appDir, stdio: "pipe" });

const { DecisionTreeEngine } = require(path.join(tempDir, "core", "decision-tree", "engine.js"));
const arvore = Object.values(require(path.join(tempDir, "coronary-decision-tree.js"))).find((v) => v && v.nodes);
const { vereditoNitrato, vereditoAas, vereditoBetabloqueador, suspeitaDeVd } =
  require(path.join(tempDir, "lib", "vereditos-sca.js"));

/** O separador da seleção múltipla é privado do núcleo — aqui usa-se o helper. */
const ec = (() => {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "core", "decision-tree", "estado-clinico.ts"),
  ], { cwd: appDir, stdio: "pipe" });
  return require(path.join(tempDir, "core", "decision-tree", "estado-clinico.js"));
})();
const marcar = (...itens) => itens.reduce((acc, i) => ec.alternarSelecao(acc, i), undefined);

// ══ 1. PAS 82 — nitrato 🔴, AAS 🟢, e o fluxo segue ════════════════════════
//
// ⚠️ É O CENÁRIO QUE A REGRA DO AUTOR DESCREVE: bloqueio de medicação não é
// bloqueio de atendimento, e um fármaco bloqueado não arrasta os outros.
{
  const v = { pas: "82", aas_alergia: "nao", aas_sangramento: "nao", supra_inferior: "nao", bb_bav: "nao", bb_broncoespasmo: "nao" };
  const nit = vereditoNitrato(v);
  const aas = vereditoAas(v);

  confere("PAS 82 → nitrato vermelho", nit.nivel === "vermelho",
    `veio "${nit.nivel}" — 90 mmHg é o limiar da própria dose sublingual.`);
  confere("o motivo cita o achado concreto, não o rótulo", /82/.test(nit.motivo),
    `veio "${nit.motivo}" — "hipotensão" obriga o médico a procurar o número que o app já tem.`);
  confere("AAS continua verde com o nitrato bloqueado", aas.nivel === "verde",
    `veio "${aas.nivel}" — um fármaco bloqueado não pode arrastar outro que não tem impedimento nenhum.`);
  linhas.push(`  1. PAS 82 → nitrato 🔴 "${nit.motivo}" · AAS 🟢`);
}

// ══ 2/3. A suspeita de VD vem de CONTEXTO, não da falta de V3R–V4R ════════
//
// ⚠️ CORREÇÃO DO AUTOR (2026-08-25): bloquear nitrato em TODO inferior até
// haver V3R–V4R é overblocking. A maioria dos inferiores não tem VD
// hemodinamicamente relevante, e negar nitrato a todos troca um risco por
// outro.
{
  const base = { aas_alergia: "nao", aas_sangramento: "nao", bb_bav: "nao", bb_broncoespasmo: "nao" };

  const inferiorSemSinais = { ...base, supra_inferior: "sim", pas: "130", cor_perfusao: "nao", ausculta_pulmonar: marcar("Limpa") };
  confere("inferior SEM sinais de VD não bloqueia o nitrato",
    !suspeitaDeVd(inferiorSemSinais) && vereditoNitrato(inferiorSemSinais).nivel === "verde",
    `veio "${vereditoNitrato(inferiorSemSinais).nivel}" — o supra inferior sozinho não é suspeita de VD, ` +
    `e negar nitrato a todo inferior é o overblocking que esta regra existe para evitar.`);
  linhas.push(`  2. inferior, PAS 130, sem hipoperfusão → nitrato ${vereditoNitrato(inferiorSemSinais).nivel === "verde" ? "🟢" : "🔴"}`);

  // ⚠️ O PADRÃO DISCRIMINANTE: hipotensão COM PULMÕES LIMPOS é o que separa o
  // VD da falência de ventrículo esquerdo — no VE a mesma hipotensão vem com
  // congestão.
  const inferiorComVd = { ...base, supra_inferior: "sim", pas: "95", cor_perfusao: "sim", ausculta_pulmonar: marcar("Limpa") };
  const nitVd = vereditoNitrato(inferiorComVd);
  confere("inferior + contexto compatível bloqueia e pede V3R–V4R",
    suspeitaDeVd(inferiorComVd) && nitVd.nivel === "vermelho" && /V3R/.test(nitVd.motivo),
    `veio "${nitVd.nivel}" / "${nitVd.motivo}" — sem o pedido de V3R–V4R o bloqueio vira beco: o ` +
    `médico vê o vermelho e não tem o que fazer com ele.`);
  linhas.push(`  3. inferior + hipoperfusão + pulmões limpos → nitrato 🔴 "${nitVd.motivo.slice(0, 60)}…"`);

  // E o mesmo contexto SEM o inferior não bloqueia por VD: a parede é condição.
  confere("hipoperfusão sem supra inferior não é suspeita de VD",
    !suspeitaDeVd({ ...base, supra_inferior: "nao", pas: "95", cor_perfusao: "sim" }),
    "o VD é a extensão do infarto INFERIOR; derivá-lo de hipoperfusão isolada bloquearia nitrato " +
    "em qualquer paciente mal perfundido.");
}

// ══ 4. A queda relativa NÃO é gate (não há basal) ═════════════════════════
{
  // ⚠️ `lerFonte`, não `readFileSync` com strip à mão: o arquivo COMENTA em
  // detalhe por que a queda de 30 mmHg não é gate, e o número aparece no
  // comentário. Lendo cru, esta conferência casaria com a própria explicação e
  // reprovaria a correção que ela existe para proteger — ou, pior, passaria
  // verde por medir texto que ninguém lê.
  const corpo = lerFonte(path.join(appDir, "lib", "vereditos-sca.ts"));
  confere("nenhum veredito usa queda relativa da PA como gate",
    !/\b30\b/.test(corpo),
    "o app não tem PA basal documentada, e a primeira medida no pronto-socorro NÃO é a pressão " +
    "habitual do paciente — usá-la como basal seria inventar o dado. O critério vive em " +
    "`NITRATO_MONITORIZACAO`, como razão para INTERROMPER depois de administrar.");
}

// ══ 5. Betabloqueador — verde/vermelho, e "não sei" não libera ════════════
{
  const base = { pas: "130", fc: "80", supra_inferior: "nao", bb_broncoespasmo: "nao", bb_bav: "nao" };
  const CASOS = [
    ["BAV/PR longo", { ...base, bb_bav: "sim" }, "vermelho"],
    ["BAV não afastado (não sei)", { ...base, bb_bav: "nao_sei" }, "vermelho"],
    ["broncoespasmo ativo", { ...base, bb_broncoespasmo: "sim" }, "vermelho"],
    ["bradicardia (FC 44)", { ...base, fc: "44" }, "vermelho"],
    ["IC aguda / congestão", { ...base, cor_edema_pulmonar: "sim" }, "vermelho"],
    ["estertores à ausculta", { ...base, ausculta_pulmonar: marcar("Estertores") }, "vermelho"],
    ["baixo débito", { ...base, cor_perfusao: "sim" }, "vermelho"],
    ["estável, sem contraindicação", { ...base, ausculta_pulmonar: marcar("Limpa") }, "verde"],
  ];
  for (const [nome, values, esperado] of CASOS) {
    const r = vereditoBetabloqueador(values);
    confere(`betabloqueador — ${nome} → ${esperado}`, r.nivel === esperado,
      `veio "${r.nivel}" (${r.motivo}).`);
  }
  // ⚠️ SEM AMARELO INVENTADO: o amarelo correto seria o estável COM risco de
  // choque cardiogênico, e esse critério não foi auditado. Um amarelo aqui
  // seria número escrito de memória.
  const todosNiveis = new Set(CASOS.map(([, v]) => vereditoBetabloqueador(v).nivel));
  confere("o betabloqueador não tem faixa amarela",
    !todosNiveis.has("amarelo"),
    "faixa intermediária sem critério auditado é invenção — o app já se recusa a calcular GRACE " +
    "pelo mesmo motivo.");
  linhas.push(`  5. betabloqueador: 7 contraindicações objetivas bloqueiam; estável libera; nenhum amarelo`);
}

// ══ 6. AAS — o único amarelo, e ele exige decisão registrada ══════════════
{
  const base = { pas: "130", fc: "80", supra_inferior: "nao" };
  confere("alergia ao AAS bloqueia",
    vereditoAas({ ...base, aas_alergia: "sim", aas_sangramento: "nao" }).nivel === "vermelho",
    "a ressalva 'salvo alergia' era texto; como veredito ela impede a ação.");
  confere("sangramento ativo bloqueia",
    vereditoAas({ ...base, aas_alergia: "nao", aas_sangramento: "sim" }).nivel === "vermelho", "idem.");

  const duvida = vereditoAas({ ...base, aas_alergia: "nao_sei", aas_sangramento: "nao" });
  confere("dúvida cai no amarelo, com as três saídas nomeadas",
    duvida.nivel === "amarelo" && (duvida.decisao?.saidas ?? []).length === 3,
    `veio "${duvida.nivel}" — "não sei" tratado como "não" seria o default mais perigoso; e a ` +
    `decisão precisa registrar QUAL saída ocorreu, não apenas que houve decisão.`);
  linhas.push(`  6. AAS: alergia/sangramento 🔴 · dúvida 🟡 com ${(duvida.decisao?.saidas ?? []).length} saídas`);
}

// ══ 7/8. No MOTOR: liberado ≠ realizado, e 🔴 não para o fluxo ════════════
{
  const m = new DecisionTreeEngine(arvore, { agora: () => 1_000 });
  m.goToNode("terapia_vereditos");
  m.setValue("pas", "82");
  m.setValue("fc", "80");
  m.setValue("supra_inferior", "nao");
  m.setValue("bb_bav", "nao");
  m.setValue("bb_broncoespasmo", "nao");
  m.setValue("ausculta_pulmonar", marcar("Limpa"));

  confere("no nó real, nitrato 🔴 e betabloqueador 🟢 convivem",
    m.vereditoDe("nitrato").nivel === "vermelho" && m.vereditoDe("betabloqueador").nivel === "verde",
    `veio nitrato=${m.vereditoDe("nitrato").nivel}, bb=${m.vereditoDe("betabloqueador").nivel} — ` +
    `dois vereditos na mesma tela têm de ser independentes.`);

  let recusou = false;
  try { m.registrarExecucao("nitrato"); } catch { recusou = true; }
  confere("a execução do nitrato é RECUSADA",
    recusou && m.estadoDaAcao("nitrato") !== "realizada",
    "se passasse, 'bloqueado' seria só uma cor: o registro do caso diria que o fármaco foi dado.");

  confere("o betabloqueador liberado ainda NÃO é realizado",
    m.estadoDaAcao("betabloqueador") === "pendente",
    `veio "${m.estadoDaAcao("betabloqueador")}" — "pode fazer" e "foi feito" são coisas diferentes, e ` +
    `confundi-las é como se registra uma dose que ninguém deu.`);

  m.registrarExecucao("betabloqueador");
  confere("depois de registrar, ele vira 'realizada' — e o nitrato continua bloqueado",
    m.estadoDaAcao("betabloqueador") === "realizada" && m.estadoDaAcao("nitrato") === "contraindicada",
    "executar um não pode desbloquear o outro.");

  // ⚠️ NENHUM NÍVEL GRAVADO. Veredito persistido envelhece junto com o dado
  // que o gerou — e depois de uma correção diria o que já não é verdade.
  confere("nenhum nível de veredito é gravado em values",
    !Object.values(m.getValues()).some((x) => x === "vermelho" || x === "amarelo" || x === "verde"),
    "gravado, o veredito viraria verdade clínica congelada.");

  // E ele é RECALCULADO: corrigir a PA muda a cor sem nenhum nó novo.
  m.remedir(["pas"]);
  m.setValue("pas", "128", "aferido", "apos_intervencao");
  confere("corrigir a PA recalcula o nitrato para verde",
    m.vereditoDe("nitrato").nivel === "verde",
    `veio "${m.vereditoDe("nitrato").nivel}" — o veredito é derivado a cada render justamente para isso.`);
  linhas.push(`  7. no motor: nitrato 🔴 recusa execução · bb 🟢 → realizada · PA corrigida 128 → nitrato 🟢`);

  // ── snapshot preserva ações e decisões, NÃO o veredito ──────────────────
  const salvo = JSON.parse(JSON.stringify(m.exportarEstado()));
  confere("o snapshot não carrega nível de veredito",
    !JSON.stringify(salvo).match(/"(vermelho|amarelo|verde)"/),
    "salvar a cor a faria sobreviver ao dado que a produziu.");

  const m2 = new DecisionTreeEngine(arvore, { agora: () => 2_000 });
  m2.restaurarEstado(salvo);
  confere("depois de retomar, a ação executada continua executada e o veredito é recalculado",
    m2.estadoDaAcao("betabloqueador") === "realizada" && m2.vereditoDe("nitrato").nivel === "verde",
    "reapresentar como pendente uma ação já dada é convite à dose dobrada; e o veredito tem de " +
    "falar do agora, não do momento em que se salvou.");

  // ⚠️ POR ÚLTIMO, porque `advance()` SAI do nó — e fora dele não há veredito
  // que consultar. A primeira versão deste arquivo avançava antes e depois
  // perguntava a cor, recebendo `null`: a prova media o lugar errado.
  const seguinte = m2.advance();
  confere("o atendimento avança com o fármaco que estava bloqueado",
    !!seguinte && seguinte.id !== "terapia_vereditos",
    `parou em "${seguinte?.id}" — travar a via de SCA por causa de um fármaco deixaria o médico sem o resto.`);
  linhas.push(`  8. snapshot sem cor · bb continua realizada após retomar · fluxo seguiu para "${seguinte?.id}"`);
}

// ── Vacuidade ──────────────────────────────────────────────────────────────
confere("as oito frentes produziram evidência", linhas.length >= 7,
  `só ${linhas.length} linhas — pode ter rodado sobre nada (R-15 item 9).`);

console.log("\nVereditos da SCA — a regra aplicada, não impressa\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — cada fármaco responde pelos seus próprios impedimentos\n`);
process.exit(0);
