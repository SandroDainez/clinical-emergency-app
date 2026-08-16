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
 *    NORMAL caía em "110–180 → vasodilatador + diurético", que é a conduta do
 *    QUENTE — e é o que piora quem já está com débito baixo.
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
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "eap-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "eap-decision-tree.js")).eapDecisionTree;
} catch (erro) {
  falhas.push(`a árvore do EAP não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const textosDe = (id) => {
  const no = arvore?.nodes?.[id];
  const dosPrazos = (no?.prazos ?? []).flatMap((p) => [p.aoVencer, p.aoUltrapassarTexto]);
  return [no?.title, no?.summary, no?.question, ...dosPrazos, ...(no?.actions ?? []), ...(no?.exitCriteria ?? []), ...(no?.evidence ?? [])].filter(
    (t) => typeof t === "string"
  );
};
const todos = arvore ? Object.keys(arvore.nodes).flatMap(textosDe) : [];

// ── A. QUENTE × FRIO ANTES DA ESCOLHA POR PA ─────────────────────────────
{
  const classificacao = textosDe("card_classificacao").join("\n");
  for (const [nome, padrao, porque] of [
    ["o par quente × frio", /QUENTE OU FRIO/, "a classificação era só por PA, e PA não é perfusão"],
    ["os sinais do frio", /PRESSÃO DE PULSO ESTREITA/, "é o sinal que separa e que ninguém mede quando classifica por PA"],
    [
      "o frio com PAS normal",
      /O FRIO-ÚMIDO PODE TER PAS NORMAL/,
      "é o paciente que some: a vasoconstrição sustenta o número enquanto o débito já caiu",
    ],
    ["a assimetria escrita", /NA DÚVIDA, ERRE PARA O LADO DO INOTRÓPICO/, "é o que diz ao médico para onde errar quando não tem certeza"],
    [
      "as duas consequências, com tamanhos diferentes",
      /o efeito é IMEDIATO[\s\S]{0,200}EXCESSO, não catástrofe/,
      "vasodilatar o frio derruba o que já está baixo; inotrópico no quente se corrige suspendendo",
    ],
  ]) {
    if (!padrao.test(classificacao)) falhas.push(`perfil hemodinâmico: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  // ⚠️ O SINAL DE REVERSIBILIDADE NO RAMO EM QUE O ERRO ACONTECE — e não como
  // aviso genérico antes da escolha. Mesma forma do Choque.
  const vaso = textosDe("card_vasodilatador").join("\n");
  for (const [nome, padrao] of [
    ["o sinal de que o perfil estava errado", /SE O PERFIL ESTAVA ERRADO, O PACIENTE AVISA/],
    ["a PA que cai com o vasodilatador", /se a PA CAIR com o vasodilatador/],
    ["a diurese que não vem", /DIURESE NÃO VIER/],
    ["a conduta ao reconhecer", /passe ao inotrópico — não aumente a dose do que não está funcionando/],
  ]) {
    if (!padrao.test(vaso)) {
      falhas.push(
        `ramo 110–180: ${nome} sumiu. ⚠️ A ressalva tem de estar NO NÓ EM QUE A PESSOA JÁ ERROU — aviso ` +
        `genérico antes da escolha não é lido por quem já escolheu.`
      );
    } else ok++;
  }
}

// ── B. O MISTO É CAMINHO, NÃO SÓ DESCRIÇÃO ───────────────────────────────
{
  const opcoes = arvore?.nodes?.tipo?.options ?? [];
  const misto = opcoes.find((o) => o.id === "misto");
  const naoSei = opcoes.find((o) => o.id === "nao_sei");

  if (!misto) {
    falhas.push(
      "o nó `tipo` voltou a ter só dois caminhos. ⚠️ O MISTO ESTÁ DESCRITO NA EVIDÊNCIA DESTE MESMO NÓ — " +
      "descrever a existência e não oferecer o caminho é a família do \"afirma e não faz\", aplicada a uma " +
      "população inteira. Terceiro módulo com o mesmo defeito: CAD/EHH, Choque e EAP."
    );
  } else {
    ok++;
    if (!arvore?.nodes?.[misto.next]) {
      falhas.push(`a opção MISTO aponta para "${misto.next}", que não existe — botão sem destino.`);
    } else ok++;
  }

  if (!naoSei) {
    falhas.push(
      "sumiu a saída de quem ainda não sabe o mecanismo. A diferenciação se faz com POCUS e BNP, que não " +
      "voltaram quando o paciente chega — obrigar a escolher entre dois ramos que decidem a conduta " +
      "inteira, na primeira tela, é pedir um chute com consequência (R-48 refinado)."
    );
  } else ok++;

  const textoMisto = textosDe("eap_misto").join("\n");
  for (const [nome, padrao, porque] of [
    [
      "que tratar o dominante NÃO é escolher um",
      /TRATAR O COMPONENTE DOMINANTE NÃO É ESCOLHER UM/,
      "é a razão de o ramo existir",
    ],
    [
      "o erro de omissão pelo lado do SARA",
      /Quem rotula como SARA perde o vasodilatador e o diurético/,
      "congestão hidrostática real tratada com restrição de volume",
    ],
    [
      "o erro de omissão pelo lado cardiogênico",
      /precisa de ANTIBIÓTICO PRECOCE e de RESSUSCITAÇÃO/,
      "a sepse não espera a congestão melhorar",
    ],
    ["o sinal de que há dois mecanismos", /resposta PARCIAL/i, "melhorou e parou de melhorar"],
    ["o que decide a proporção", /POCUS/, "e não o rótulo escolhido na primeira tela"],
  ]) {
    if (!padrao.test(textoMisto)) falhas.push(`misto: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  const indefinido = textosDe("eap_indefinido").join("\n");
  for (const [nome, padrao] of [
    ["o que é comum aos dois", /FAÇA AGORA, vale para cardiogênico, SARA e misto/],
    ["o que ESPERA o mecanismo", /O QUE ESPERA O MECANISMO/],
    ["a razão de esperar", /no SARA puro não tratam nada/],
    ["o que decide", /ultrassom à beira do leito/],
  ]) {
    if (!padrao.test(indefinido)) falhas.push(`ainda não sei: ${nome} sumiu.`);
    else ok++;
  }
}

// ── C. O que não pode regredir ───────────────────────────────────────────
{
  const choque = textosDe("card_choque").join("\n");
  for (const [nome, padrao, porque] of [
    ["o veto ao vasodilatador no choque", /NÃO usar vasodilatador/, "é o erro que mata mais rápido neste módulo"],
    ["a dobutamina como 1ª linha", /DOBUTAMINA/, "inotrópico é a conduta do frio"],
    ["a noradrenalina com alvo", /PAM ≥ 65/, "vasopressor com meta declarada"],
  ]) {
    if (!padrao.test(choque)) falhas.push(`choque cardiogênico: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  const tudo = todos.join("\n");
  for (const [nome, padrao] of [
    ["a VNI como 1ª linha", /VNI é PRIMEIRA LINHA/],
    ["os critérios de falha da VNI", /Critérios de IOT \(falha de VNI\)/],
    ["a posição sentada com pernas pendentes", /SENTADO com as pernas pendentes/],
    ["o veto de BB e BCC na descompensação", /NÃO usar BETABLOQUEADOR/],
  ]) {
    if (!padrao.test(tudo)) falhas.push(`${nome} sumiu — já auditado em bloco anterior, não pode regredir.`);
    else ok++;
  }
}

// ── D. Vacuidade ─────────────────────────────────────────────────────────
{
  if (todos.length < 60) {
    falhas.push(`só ${todos.length} textos no módulo — as conferências podem ter rodado sobre nada (R-15 item 9).`);
  } else ok++;
}

console.log("\nEAP — o perfil que a PA não separa, e o misto que estava descrito sem caminho\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — quente × frio antes da PA, assimetria escrita e o misto com botão\n`);
process.exit(0);
