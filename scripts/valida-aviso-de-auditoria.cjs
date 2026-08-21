#!/usr/bin/env node
/**
 * O AVISO DA AUDITORIA PARCIAL — ausência de marca não é marca de ausência.
 *
 * PROMETE: que, ENQUANTO houver módulo sem declaração de força por conduta, as
 *   duas telas onde o usuário COMPARA módulos (o hub e a página de produto)
 *   mostrem o aviso; e que a lista de módulos auditados não possa "adiantar" —
 *   ela é conferida contra o instrumento que realmente audita.
 * NÃO PROMETE: que o aviso esteja legível, nem que o usuário o leia. Isso é
 *   medição de layout e de comportamento, e nenhuma das duas é feita aqui.
 * UNIVERSO: os módulos clínicos declarados no app, com piso no retrato.
 *
 * ── ⚠️ POR QUE ISTO É TRAVA E NÃO OBSERVAÇÃO ───────────────────────────────
 *
 * A assimetria (1 módulo com selo, 30 sem) é do tipo que NINGUÉM NOTA: ela não
 * quebra tela, não falha teste, não aparece em relatório. E ela mente para o
 * lado perigoso — quem compara lê "sem selo" como "recomendação mais fraca",
 * quando o que ela significa é "ainda não auditado".
 *
 * É a mesma regra do piso de universo, agora virada para o usuário: um "não
 * medi" apresentado sem etiqueta é lido como "medi e não achei".
 *
 * ── ⚠️ E POR QUE ELA SE DESARMA SOZINHA ────────────────────────────────────
 *
 * Quando `MODULOS_COM_FORCA_DECLARADA` cobrir todos os módulos, o aviso deixa de
 * ser exigido — e passa a ser exigida a REMOÇÃO dele, porque aviso que sobrevive
 * ao seu motivo vira ruído e ensina a ignorar avisos.
 */
const fs = require("fs");
const path = require("path");
const { lerFonte } = require("./lib/fonte.cjs");
const { conferirUniverso } = require("./lib/universo.cjs");

const app = path.resolve(__dirname, "..");
const falhas = [];

const LIB = path.join(app, "lib", "auditoria-de-forca.ts");
/** As telas onde o usuário COMPARA módulos — é lá que a assimetria engana. */
const SUPERFICIES = [
  { arquivo: "components/module-hub.tsx", o_que_e: "o hub, onde os 31 cards ficam lado a lado" },
  { arquivo: "components/paywall-screen.tsx", o_que_e: "a página de produto, que fala de procedência" },
];

if (!fs.existsSync(LIB)) {
  console.log("\n❌ lib/auditoria-de-forca.ts não existe — o aviso não tem fonte única.\n");
  process.exit(1);
}
const libTexto = lerFonte(LIB);

// ── 1 · QUANTOS MÓDULOS EXISTEM, E QUANTOS ESTÃO AUDITADOS ─────────────────
const modulos = lerFonte(path.join(app, "clinical-modules.ts"));
const totalDeModulos = [...modulos.matchAll(/^\s*id:\s*"([a-z0-9-]+)"/gm)].length;
const declarados = (libTexto.match(/MODULOS_COM_FORCA_DECLARADA\s*=\s*\[([^\]]*)\]/) || [])[1] ?? "";
const auditados = (declarados.match(/"[^"]+"/g) || []).length;

const universoOk = conferirUniverso("valida-aviso-de-auditoria", "modulos_clinicos", totalDeModulos);

// ── 2 · A LISTA NÃO PODE ADIANTAR ──────────────────────────────────────────
//
// ⚠️ Sem esta conferência, bastaria acrescentar nomes em
// `MODULOS_COM_FORCA_DECLARADA` para o aviso sumir — auditoria por declaração,
// que é o oposto de auditoria. O número vem de quem realmente audita.
const instrumento = lerFonte(path.join(app, "scripts", "valida-forca-da-afirmacao.cjs"));
const arvoresAuditadas = ((instrumento.match(/const ARVORES\s*=\s*\[([^\]]*)\]/) || [])[1] || "")
  .match(/"[^"]+"/g) || [];
if (auditados !== arvoresAuditadas.length) {
  falhas.push(
    `MODULOS_COM_FORCA_DECLARADA tem ${auditados} módulo(s), mas valida-forca-da-afirmacao audita ${arvoresAuditadas.length} árvore(s).\n` +
    `      ⚠️ A lista NÃO pode adiantar: ela é o que faz o aviso sumir da tela. Auditoria por\n` +
    `      declaração é o oposto de auditoria — o número vem de quem mede, não de quem escreve.`
  );
}

// ── 3 · O AVISO NAS DUAS SUPERFÍCIES ───────────────────────────────────────
const incompleta = auditados < totalDeModulos;
for (const { arquivo, o_que_e } of SUPERFICIES) {
  const texto = lerFonte(path.join(app, arquivo));
  // ⚠️ PROCURA A CHAMADA, NÃO O IMPORT. A primeira versão desta linha procurava
  // só os NOMES no arquivo — e passou VERDE com o bloco JSX inteiro apagado do
  // hub, porque os imports ficaram para trás. Import é proxy de render; o que o
  // usuário vê é a chamada. (Continua sendo proxy de "aparece na tela": layout e
  // legibilidade não são medidos aqui, e o cabeçalho diz isso.)
  const mostra =
    /tr\(AVISO_DE_AUDITORIA_PARCIAL\)/.test(texto) && /auditoriaDeForcaIncompleta\(/.test(texto);
  if (incompleta && !mostra) {
    falhas.push(
      `${arquivo} não mostra o aviso — e é ${o_que_e}.\n` +
      `      ⚠️ ${auditados} de ${totalDeModulos} módulos declaram força por conduta. Sem o aviso, quem compara\n` +
      `      lê a AUSÊNCIA de selo nos outros ${totalDeModulos - auditados} como "recomendação mais fraca". É falso: significa\n` +
      `      "ainda não auditado". Ausência de marca não é marca de ausência.`
    );
  }
  if (!incompleta && mostra) {
    falhas.push(
      `${arquivo} ainda mostra o aviso de auditoria parcial — mas os ${totalDeModulos} módulos já estão auditados.\n` +
      `      ⚠️ Aviso que sobrevive ao seu motivo vira ruído, e ruído ensina a ignorar avisos.`
    );
  }
}

// ── 4 · O TEXTO É UM SÓ ────────────────────────────────────────────────────
if (!/ausência de selo NÃO significa recomendação forte/i.test(libTexto)) {
  falhas.push(
    "a frase que carrega o sentido saiu de AVISO_DE_AUDITORIA_PARCIAL.\n" +
    "      ⚠️ O aviso existe para dizer UMA coisa: que a ausência de selo não é sinal clínico."
  );
}

console.log("\nO aviso da auditoria parcial — ausência de marca não é marca de ausência\n");
console.log(`   módulos clínicos: ${totalDeModulos} · com força por conduta: ${auditados} · aviso exigido: ${incompleta ? "sim" : "não"}`);
console.log(`   superfícies conferidas: ${SUPERFICIES.map((s) => s.arquivo).join(" · ")}`);

if (!universoOk) {
  console.log("❌ universo insuficiente — as contagens acima NÃO significam cobertura.\n");
  process.exit(1);
}
if (falhas.length) {
  console.log(`\n❌ ${falhas.length} falha(s):\n`);
  for (const f of falhas) console.log("   " + f);
  console.log("");
  process.exit(1);
}
console.log("\n✅ a assimetria está declarada onde o usuário compara\n");
