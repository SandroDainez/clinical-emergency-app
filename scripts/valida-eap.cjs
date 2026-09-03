#!/usr/bin/env node
/**
 * PROMETE
 *   Que o perfil QUENTE × FRIO exista antes da escolha por PA, com a
 *   assimetria escrita e o sinal de reversibilidade no ramo em que o erro
 *   acontece; que o nó de mecanismo ofereça MISTO e "ainda não sei" como
 *   caminhos reais, e não só na evidência; e que o veto de vasodilatador e
 *   diurético no choque cardiogênico não regrida.
 *
 * NÃO PROMETE
 *   Cobertura das doses — a dobutamina, a noradrenalina, o nitrato, a
 *   furosemida e a morfina têm travas próprias (test:dobutamina,
 *   test:vasoativos, test:preparos, test:teto) e não são reconferidas aqui.
 *
 * UNIVERSO
 *   A árvore do EAP compilada e lib/perfil-hemodinamico-eap.ts.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. ⚠️ PAS NÃO É PERFUSÃO. `card_classificacao` tinha QUATRO saídas, todas
 *    por PA. Busca no módulo: "quente" 0, "frio" 0, "extremidades" 0,
 *    "enchimento capilar" 0, "pressão de pulso" 0. O FRIO-ÚMIDO COM PAS
 *    NORMAL caía em "110–180 → vasodilatador", que é a conduta do QUENTE —
 *    e é o que piora quem já está com débito baixo.
 *
 * 2. ⚠️ O MISTO ESTAVA DESCRITO E NÃO TINHA BOTÃO. A evidência do nó `tipo`
 *    dizia "MISTO (sepse em cardiopata, pós-op cardíaco): tratar componente
 *    dominante" — e as opções eram duas.
 *
 *    TERCEIRO MÓDULO em que isso acontece: CAD/EHH, Choque e EAP. No balanço
 *    da auditoria está registrado como achado de DESENHO, não como três
 *    achados — o app SABIA da existência do estado misto e NÃO OFERECIA o
 *    caminho. É a família do "afirma e não faz", aplicada a uma população
 *    inteira em vez de a uma conduta.
 *
 * 3. Sem saída para quem ainda não tem POCUS nem BNP — que é justamente o que
 *    diferencia os dois mecanismos (R-48 refinado).
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-eap-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node16", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "eap-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "eap-decision-tree.js")).eapDecisionTree;
} catch (erro) {
  falhas.push(`a árvore do EAP não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const { textosDoNo } = require("./lib/textos-do-no.cjs");
const textosDe = (id) => textosDoNo(arvore?.nodes?.[id]);
const todos = arvore ? Object.keys(arvore.nodes).flatMap(textosDe) : [];

// ── A. QUENTE × FRIO ANTES DA ESCOLHA POR PA ─────────────────────────────
{
  const classificacao = textosDe("card_classificacao").join("\n");
  const checks = [
    [/QUENTE.*FRIO|quente.*frio/i, "perfil hemodinâmico: o par quente × frio sumiu — a classificação era só por PA, e PA não é perfusão."],
    [/extremidades|enchimento capilar|pressão de pulso/i, "perfil hemodinâmico: os sinais do frio sumiu — é o sinal que separa e que ninguém mede quando classifica por PA."],
    [/PAS.*normal|pressão.*normal/i, "perfil hemodinâmico: o frio com PAS normal sumiu — é o paciente que some: a vasoconstrição sustenta o número enquanto o débito já caiu."],
    [/errar|assimetr/i, "perfil hemodinâmico: a assimetria escrita sumiu — é o que diz ao médico para onde errar quando não tem certeza."],
    [/vasodilat|inotróp/i, "perfil hemodinâmico: as duas consequências, com tamanhos diferentes sumiu — vasodilatar o frio derruba o que já está baixo; inotrópico no quente se corrige suspendendo."],
  ];
  for (const [re, msg] of checks) re.test(classificacao) ? ok++ : falhas.push(msg);
}

// ── B. O RAMO EM QUE O PERFIL ERRADO ACONTECE MOSTRA COMO RECONHECER ─────
{
  // O nó 110–180 chama-se `card_vasodilatador`; `card_normo` era o ID antigo.
  const quente = textosDe("card_vasodilatador").join("\n");
  const checks = [
    [/perfil.*errado|se.*erro|frio/i, "ramo 110–180: o sinal de que o perfil estava errado sumiu. ⚠️ A ressalva tem de estar NO NÓ EM QUE A PESSOA JÁ ERROU — aviso genérico antes da escolha não é lido por quem já escolheu."],
    [/PA.*cai|hipotens/i, "ramo 110–180: a PA que cai com o vasodilatador sumiu. ⚠️ A ressalva tem de estar NO NÓ EM QUE A PESSOA JÁ ERROU — aviso genérico antes da escolha não é lido por quem já escolheu."],
    [/diurese.*não|sem.*diurese|oligúr/i, "ramo 110–180: a diurese que não vem sumiu. ⚠️ A ressalva tem de estar NO NÓ EM QUE A PESSOA JÁ ERROU — aviso genérico antes da escolha não é lido por quem já escolheu."],
    [/suspender|reclassificar|inotróp/i, "ramo 110–180: a conduta ao reconhecer sumiu. ⚠️ A ressalva tem de estar NO NÓ EM QUE A PESSOA JÁ ERROU — aviso genérico antes da escolha não é lido por quem já escolheu."],
  ];
  for (const [re, msg] of checks) re.test(quente) ? ok++ : falhas.push(msg);
}

// ── C. MECANISMO OFERECE MISTO E AINDA NÃO SEI COMO CAMINHOS REAIS ───────
{
  const no = arvore?.nodes?.tipo;
  const ids = no?.type === "decision" ? (no.options || []).map((o) => o.id) : [];
  ids.includes("misto") ? ok++ : falhas.push("o nó `tipo` voltou a ter só dois caminhos. ⚠️ O MISTO ESTÁ DESCRITO NA EVIDÊNCIA DESTE MESMO NÓ — descrever a existência e não oferecer o caminho é a família do \"afirma e não faz\", aplicada a uma população inteira. Terceiro módulo com o mesmo defeito: CAD/EHH, Choque e EAP.");
  ids.includes("nao_sei") ? ok++ : falhas.push("sumiu a saída de quem ainda não sabe o mecanismo. A diferenciação se faz com POCUS e BNP, que não voltaram quando o paciente chega — obrigar a escolher entre dois ramos que decidem a conduta inteira, na primeira tela, é pedir um chute com consequência (R-48 refinado).");
}

// ── D. RAMO MISTO TEM OS DOIS ERROS E O SINAL DE QUE O RÓTULO FALHOU ─────
{
  const misto = textosDe("eap_misto").join("\n");
  const checks = [
    [/dominante.*NÃO|dominante.*não/i, "misto: que tratar o dominante NÃO é escolher um sumiu — é a razão de o ramo existir."],
    [/SARA|restrição.*volume|lesão pulmonar/i, "misto: o erro de omissão pelo lado do SARA sumiu — congestão hidrostática real tratada com restrição de volume."],
    [/sepse|antibiótico|controle de foco/i, "misto: o erro de omissão pelo lado cardiogênico sumiu — a sepse não espera a congestão melhorar."],
    [/melhor.*parou|resposta.*parcial|duas.*causas|dois.*mecanismos/i, "misto: o sinal de que há dois mecanismos sumiu — melhorou e parou de melhorar."],
    [/POCUS|eco|VCI|linhas B/i, "misto: o que decide a proporção sumiu — e não o rótulo escolhido na primeira tela."],
  ];
  for (const [re, msg] of checks) re.test(misto) ? ok++ : falhas.push(msg);
}

// ── E. AINDA NÃO SEI: FAZ O COMUM, ADIA O QUE PODE PIORAR O OUTRO ─────────
{
  const indef = textosDe("eap_indefinido").join("\n");
  const checks = [
    [/comum|O₂|VNI|suporte/i, "ainda não sei: o que é comum aos dois sumiu."],
    [/espera|aguarda|adiar|vasodilat|diurético/i, "ainda não sei: o que ESPERA o mecanismo sumiu."],
    [/piorar|dano|risco|outro/i, "ainda não sei: a razão de esperar sumiu."],
    [/POCUS|BNP|eco/i, "ainda não sei: o que decide sumiu."],
  ];
  for (const [re, msg] of checks) re.test(indef) ? ok++ : falhas.push(msg);
}

// ── F. TRAVAS ANTIGAS QUE NÃO PODEM REGREDIR ───────────────────────────────
{
  const choque = textosDe("card_choque").join("\n");
  /NÃO usar vasodilatador/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: o veto ao vasodilatador no choque sumiu — é o erro que mata mais rápido neste módulo.");
  /DOBUTAMINA/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: a dobutamina como 1ª linha sumiu — inotrópico é a conduta do frio.");
  /NOREPINEFRINA|noradrenalina/i.test(choque) && /PAM.*65/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: a noradrenalina com alvo sumiu — vasopressor com meta declarada.");

  const suporte = textosDe("card_suporte").join("\n");
  /VNI.*PRIMEIRA LINHA/i.test(suporte) ? ok++ : falhas.push("a VNI como 1ª linha sumiu — já auditado em bloco anterior, não pode regredir.");
  /falha.*VNI|Critérios de IOT/i.test(suporte) ? ok++ : falhas.push("os critérios de falha da VNI sumiu — já auditado em bloco anterior, não pode regredir.");
  /SENTADO.*pernas pendentes/i.test(suporte) ? ok++ : falhas.push("a posição sentada com pernas pendentes sumiu — já auditado em bloco anterior, não pode regredir.");

  const arritmia = textosDe("card_causa_arritmia").join("\n");
  /NÃO usar BETABLOQUEADOR/i.test(arritmia) && /diltiazem.*verapamil/i.test(arritmia) ? ok++ : falhas.push("o veto de BB e BCC na descompensação sumiu — já auditado em bloco anterior, não pode regredir.");
}

if (todos.length < 100) {
  falhas.push(`só ${todos.length} textos no módulo — as conferências podem ter rodado sobre nada (R-15 item 9).`);
} else ok++;

try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

console.log("\nEAP — o perfil que a PA não separa, e o misto que estava descrito sem caminho\n");
if (falhas.length) {
  for (const f of falhas) console.error(`❌ ${f}`);
  console.error(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — perfil hemodinâmico, misto, incerteza e travas críticas preservados\n`);
