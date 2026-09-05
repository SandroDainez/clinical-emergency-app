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
      "tsc", "--module", "node16", "--target", "es2020", "--esModuleInterop",
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

{
  const quente = textosDe("card_vasodilatador").join("\n");
  const checks = [
    [/perfil.*errado|se.*erro|frio/i, "ramo 110–180: o sinal de que o perfil estava errado sumiu."],
    [/PA.*cai|hipotens/i, "ramo 110–180: a PA que cai com o vasodilatador sumiu."],
    [/diurese.*não|sem.*diurese|oligúr/i, "ramo 110–180: a diurese que não vem sumiu."],
    [/suspender|reclassificar|inotróp/i, "ramo 110–180: a conduta ao reconhecer sumiu."],
  ];
  for (const [re, msg] of checks) re.test(quente) ? ok++ : falhas.push(msg);
}

{
  const no = arvore?.nodes?.tipo;
  const ids = no?.type === "decision" ? (no.options || []).map((o) => o.id) : [];
  ids.includes("misto") ? ok++ : falhas.push("o nó `tipo` voltou a ter só dois caminhos; o misto precisa existir como rota real.");
  ids.includes("nao_sei") ? ok++ : falhas.push("sumiu a saída de quem ainda não sabe o mecanismo.");
}

{
  const misto = textosDe("eap_misto").join("\n");
  const checks = [
    [/dominante.*NÃO|dominante.*não/i, "misto: que tratar o dominante NÃO é escolher um sumiu."],
    [/SARA|restrição.*volume|lesão pulmonar/i, "misto: o componente pulmonar/SARA sumiu."],
    [/sepse|antibiótico|controle de foco/i, "misto: o componente séptico sumiu."],
    [/melhor.*parou|resposta.*parcial|duas.*causas|dois.*mecanismos/i, "misto: o sinal de que há dois mecanismos sumiu."],
    [/POCUS|eco|VCI|linhas B/i, "misto: o que decide a proporção sumiu."],
  ];
  for (const [re, msg] of checks) re.test(misto) ? ok++ : falhas.push(msg);
}

{
  const indef = textosDe("eap_indefinido").join("\n");
  const checks = [
    [/comum|O₂|VNI|suporte/i, "ainda não sei: o que é comum aos dois sumiu."],
    [/espera|aguarda|adiar|vasodilat|diurético/i, "ainda não sei: o que espera o mecanismo sumiu."],
    [/piorar|dano|risco|outro/i, "ainda não sei: a razão de esperar sumiu."],
    [/POCUS|BNP|eco/i, "ainda não sei: o que decide sumiu."],
  ];
  for (const [re, msg] of checks) re.test(indef) ? ok++ : falhas.push(msg);
}

{
  const choque = textosDe("card_choque").join("\n");
  /NÃO usar vasodilatador/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: o veto ao vasodilatador no choque sumiu.");
  /DOBUTAMINA/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: a dobutamina como 1ª linha sumiu.");
  /NOREPINEFRINA|noradrenalina/i.test(choque) && /PAM.*65/i.test(choque) ? ok++ : falhas.push("choque cardiogênico: a noradrenalina com alvo sumiu.");

  const suporte = textosDe("card_suporte").join("\n");
  /VNI.*PRIMEIRA LINHA/i.test(suporte) ? ok++ : falhas.push("a VNI como 1ª linha sumiu.");
  /falha.*VNI|Critérios de IOT/i.test(suporte) ? ok++ : falhas.push("os critérios de falha da VNI sumiram.");
  /SENTADO.*pernas pendentes/i.test(suporte) ? ok++ : falhas.push("a posição sentada com pernas pendentes sumiu.");

  const arritmia = textosDe("card_causa_arritmia").join("\n");
  /NÃO usar BETABLOQUEADOR/i.test(arritmia) && /diltiazem.*verapamil/i.test(arritmia) ? ok++ : falhas.push("o veto de BB e BCC na descompensação sumiu.");
}

if (todos.length < 100) {
  falhas.push(`só ${todos.length} textos no módulo — as conferências podem ter rodado sobre nada.`);
} else ok++;

try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}

console.log("\nEAP — perfil hemodinâmico, misto e incerteza\n");
if (falhas.length) {
  for (const f of falhas) console.error(`❌ ${f}`);
  console.error(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — perfil hemodinâmico, misto, incerteza e travas críticas preservados\n`);
