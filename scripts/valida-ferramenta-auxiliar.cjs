#!/usr/bin/env node
/**
 * PROMETE: que o botão de ferramenta auxiliar num nó de AÇÃO seja estritamente
 *   aditivo — que nó sem o campo continue idêntico; que abrir a ferramenta não
 *   avance o fluxo, não marque a ação como realizada, não resolva veredito e
 *   não registre decisão; e que a volta caia no mesmo nó com o estado inteiro.
 * NÃO PROMETE: o que a calculadora de destino faz (test:vasoativos), nem a
 *   renderização do botão — isso é estrutural aqui e visual no e2e.
 * UNIVERSO: o motor, a árvore da SCA e o shell de fluxo.
 *
 * ── POR QUE ESTE CAMPO NÃO É UMA TRANSIÇÃO ──────────────────────────────────
 *
 * `TransitionTarget` encaminha o ATENDIMENTO: o caso sai deste módulo e
 * continua em outro. A ferramenta auxiliar faz o oposto — o médico abre a
 * calculadora para descobrir quantos mL/h são 10 mcg/min e VOLTA ao mesmo
 * ponto da via de SCA.
 *
 * ⚠️ E É POR ISSO QUE ELA NÃO PODE MEXER EM NADA (regra do autor,
 * 2026-08-25). Um atalho que avançasse o passo, marcasse a ação como feita ou
 * resolvesse um veredito seria uma transição disfarçada: o médico voltaria
 * para um protocolo que andou sozinho enquanto ele fazia uma conta — e o
 * registro do caso diria que ele fez coisas que não fez.
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

function confere(desc, cond, porque) {
  if (cond) ok++;
  else falhas.push(`${desc}\n      ⚠️ ${porque}`);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ferramenta-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "core", "decision-tree", "engine.ts"),
  path.join(appDir, "coronary-decision-tree.ts"),
], { cwd: appDir, stdio: "pipe" });
const { DecisionTreeEngine } = require(path.join(tmp, "core", "decision-tree", "engine.js"));
const arvore = Object.values(require(path.join(tmp, "coronary-decision-tree.js"))).find((v) => v && v.nodes);

const motor = () => new DecisionTreeEngine(arvore, { agora: () => 1_000 });

// ── 1. NÓ SEM FERRAMENTA CONTINUA IDÊNTICO ─────────────────────────────────
//
// ⚠️ É a promessa que protege os 20 módulos: nenhum deles declara o campo, e
// nenhum pode mudar por isso.
{
  const m = motor();
  m.goToNode("entry");
  const passo = m.toFrontendStep();
  confere("nó de ação SEM ferramenta não expõe botão nenhum",
    passo.kind === "action" && passo.ferramenta === undefined,
    `veio ${JSON.stringify(passo.ferramenta)} — o campo é opcional e ausente tem de significar ausente.`);
  confere("e continua avançável normalmente",
    passo.canContinue === true && !!m.advance(),
    "o campo novo não pode alterar o comportamento de quem não o declara.");

  // Quantos nós de ação da SCA declaram ferramenta? Deve ser exatamente 1.
  const comFerramenta = Object.values(arvore.nodes).filter((n) => n.type === "action" && n.ferramenta);
  confere("só o nó de terapia declara ferramenta na SCA",
    comFerramenta.length === 1 && comFerramenta[0].id === "terapia_vereditos",
    `declaram: ${comFerramenta.map((n) => n.id).join(", ") || "nenhum"} — espalhar o botão diluiria o " +
    "significado dele.`);
  linhas.push(`  1. ${Object.values(arvore.nodes).filter((n) => n.type === "action").length} nós de ação · ${comFerramenta.length} com ferramenta`);
}

// ── 2. O NÓ COM FERRAMENTA APONTA PARA O MÓDULO CERTO ──────────────────────
{
  const m = motor();
  m.goToNode("terapia_vereditos");
  const f = m.toFrontendStep().ferramenta;
  confere("o nó de terapia oferece a calculadora de vasoativos",
    f && f.moduleId === "drogas-vasoativas",
    `veio ${JSON.stringify(f)} — é lá que vivem concentração, diluição e mL/h com fonte de bula.`);
  confere("o rótulo do botão é texto de tela (não vazio, não id)",
    f && f.label.length > 5 && !/^[a-z-]+$/.test(f.label),
    "um botão rotulado com o id do módulo não diz ao médico o que vai acontecer.");
  linhas.push(`  2. terapia_vereditos → "${f?.label}" (${f?.moduleId})`);
}

// ── 3/4/5. ABRIR A FERRAMENTA NÃO MEXE EM NADA ─────────────────────────────
//
// ⚠️ AQUI A PROVA É POR OMISSÃO, e ela é a mais importante do arquivo: o
// caminho de abrir a ferramenta é NAVEGAÇÃO PURA no shell — ele nunca chama o
// motor. Se um dia alguém ligar `onAbrirFerramenta` a `advance()` ou a
// `registrarExecucao()`, é isto que reprova.
{
  const shell = lerFonte(path.join(appDir, "components", "protocol-screen", "acls-decision-flow-screen.tsx"));
  const m = shell.match(/onAbrirFerramenta=\{\(moduleId\) => ([\s\S]{0,160}?)\}/);
  if (!m) {
    falhas.push("o shell não liga `onAbrirFerramenta` — o botão existiria sem fazer nada.");
  } else {
    const corpo = m[1];
    ok++;
    for (const [proibido, oque] of [
      // ⚠️ INSENSÍVEL A MAIÚSCULA, e o motivo é concreto: a primeira versão
      // usava /advance\s*\(/ e deixou passar `handleAdvance()` — o wrapper que
      // o shell de fato chama. A trava media o nome errado.
      [/advance\s*\(/i, "advance()"],
      [/registrarExecucao/, "registrarExecucao()"],
      [/registrarDecisao/, "registrarDecisao()"],
      [/setValue|remedir|restaurarEstado/, "escrita de estado no motor"],
    ]) {
      if (proibido.test(corpo)) {
        falhas.push(
          `abrir a ferramenta chama \`${oque}\`.\n` +
          `      ⚠️ Isso a transforma numa transição disfarçada: o médico volta para um protocolo que ` +
          `andou sozinho enquanto ele fazia uma conta, e o registro do caso diz que ele fez o que não fez.`
        );
      } else ok++;
    }
    if (!/abrirOutroModulo/.test(corpo)) {
      falhas.push(
        "o botão não usa `abrirOutroModulo`.\n" +
        "      ⚠️ Essa função já leva o `from_module`, que é o que permite voltar. Uma segunda lógica " +
        "de roteamento seria um segundo lugar para quebrar."
      );
    } else ok++;
  }
  linhas.push("  3. abrir a ferramenta: só navegação — nenhuma chamada ao motor");
}

// ── 5b. A VOLTA AUTOMÁTICA É SÓ DA FERRAMENTA ──────────────────────────────
//
// ⚠️ A PROMESSA QUE PROTEGE OS 20 MÓDULOS: voltar de outro MÓDULO clínico
// continua exigindo confirmação — pode ter passado tempo, pode ser outro
// paciente, e "retomar sozinho colocaria o médico no meio de um protocolo sem
// ele pedir". Voltar de uma FERRAMENTA reapresenta direto, porque perguntar a
// quem passou dez segundos numa calculadora é fricção sem risco.
//
// A distinção vive num marcador que SÓ a ferramenta produz. Se ele passar a
// ser emitido em outro caminho, ou se a retomada automática deixar de
// depender dele, a mudança vaza para todo mundo — e é isso que se mede aqui.
{
  const shell = lerFonte(path.join(appDir, "components", "protocol-screen", "acls-decision-flow-screen.tsx"));
  const rota = lerFonte(path.join(appDir, "app", "modulos", "[id].tsx"));

  // ── quem PRODUZ o marcador
  const producoes = (shell.match(/return_mode=auxiliary/g) ?? []).length;
  confere("o shell produz o marcador exatamente uma vez",
    producoes === 1,
    `apareceu ${producoes}x — mais de um produtor significa que outro caminho também pula a confirmação.`);
  confere("e ele nasce do caminho da ferramenta",
    /onAbrirFerramenta=\{\(moduleId\) => abrirOutroModulo\(moduleId, \{ auxiliar: true \}\)\}/.test(shell),
    "se a origem mudar, o marcador deixa de significar 'voltei de uma ferramenta'.");
  confere("`abrirOutroModulo` só marca quando pedido",
    /opcoes\?\.auxiliar && origem \? "&return_mode=auxiliary" : ""/.test(shell),
    "sem a condição, TODA navegação entre módulos passaria a voltar sem confirmação.");

  // ── quem CONSOME
  confere("a retomada automática depende do marcador",
    /if \(voltandoDeFerramenta\) \{\s*retomar\(salva\);/.test(shell),
    "sem essa guarda, qualquer retorno reapresentaria direto — inclusive de outro paciente.");
  confere("sem o marcador, o app OFERECE como sempre",
    /setOfertaDeRetomada\(salva\);/.test(shell),
    "o caminho da confirmação tem de continuar existindo — é o comportamento dos 20 módulos.");
  // ⚠️ MEDE A LIGAÇÃO, NÃO A PRESENÇA. A primeira versão conferia que
  // `voltaAuxiliar` e `return_mode=auxiliary` existiam no arquivo — e a
  // mutação `const rota = false` passou, porque as duas coisas continuavam
  // escritas ali, só que desligadas uma da outra.
  confere("a rota de volta é CONSTRUÍDA a partir de `voltaAuxiliar`",
    /const rota = voltaAuxiliar[\s\S]{0,180}?return_mode=auxiliary/.test(rota),
    "sem propagar na volta, o shell nunca sabe que veio de uma ferramenta — e a confirmação " +
    "reaparece justamente onde ela é fricção.");

  linhas.push("  5. marcador `return_mode=auxiliary`: 1 produtor, 1 consumidor, e a confirmação intacta");
}

// ── 6. A VOLTA PRESERVA O CASO INTEIRO ─────────────────────────────────────
//
// A ida e a volta passam pela sessão de fluxo, que já guarda o snapshot a cada
// etapa. Aqui se prova que o estado sobrevive ao ciclo — valores, trilha,
// decisões, ações e posição.
{
  const m = motor();
  m.goToNode("terapia_vereditos");
  m.setValue("pas", "180", "aferido");
  m.remedir(["pas"]);
  m.setValue("pas", "130", "aferido", "apos_intervencao");
  m.setValue("fc", "80");
  m.setValue("cor_ritmo", "sinusal");
  m.setValue("bb_bav", "nao");
  m.setValue("bb_broncoespasmo", "nao");
  m.setValue("supra_inferior", "nao");
  // ⚠️ SEM ISTO O NITRATO FICA BLOQUEADO — e a trava reprovou aqui quando a
  // regra "desconhecido ≠ negativo" entrou (2026-08-26). O cenário precisa
  // informar o PDE-5 porque, sem ele, o veredito bloqueia por falta do dado e
  // esta conferência passaria a medir o bloqueio por omissão em vez do
  // recálculo que ela promete medir.
  m.setValue("pde5_recente", "nao");
  m.registrarExecucao("betabloqueador");

  const salvo = JSON.parse(JSON.stringify(m.exportarEstado()));   // sai para a calculadora
  const volta = motor();
  volta.restaurarEstado(salvo);                                   // e volta

  confere("volta ao MESMO nó", volta.getCurrentNode().id === "terapia_vereditos",
    `voltou em "${volta.getCurrentNode().id}" — a ferramenta não pode mover o protocolo.`);
  confere("os valores sobrevivem", volta.getValues().pas === "130" && volta.getValues().fc === "80",
    "sair para uma calculadora não pode custar o que já foi coletado.");
  confere("a trilha sobrevive", volta.getHistorico("pas").map((x) => x.valor).join("→") === "180→130",
    `veio "${volta.getHistorico("pas").map((x) => x.valor).join("→")}" — a evidência da correção some junto.`);
  confere("a ação executada continua executada",
    volta.estadoDaAcao("betabloqueador") === "realizada",
    "reapresentar como pendente uma ação já dada é convite à dose dobrada.");
  confere("o veredito é recalculado, não restaurado",
    volta.vereditoDe("nitrato").nivel === "verde",
    `veio "${volta.vereditoDe("nitrato").nivel}" — com PAS 130 corrigida, o nitrato está liberado.`);
  linhas.push(`  6. ida e volta: nó "${volta.getCurrentNode().id}" · PA ${volta.getHistorico("pas").map((x) => x.valor).join(" → ")} · bb ${volta.estadoDaAcao("betabloqueador")}`);
}

// ── Vacuidade ──────────────────────────────────────────────────────────────
if (linhas.length < 4) falhas.push(`só ${linhas.length} linhas de evidência (R-15 item 9).`);

console.log("\nFerramenta auxiliar — abre a calculadora sem mover o protocolo\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — o atalho é aditivo e não mexe no estado\n`);
process.exit(0);
