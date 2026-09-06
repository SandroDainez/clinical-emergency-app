#!/usr/bin/env node
/**
 * TRAVA DO F-19 — anti-hipertensivos IV no AVC.
 *
 * PROMETE: que o app ⛔ não reproduza a dose histórica perigosa de esmolol, que
 *   ⛔ nenhuma dose apareça ⛔ sem procedência, que a atribuição dos fármacos ⛔ não
 *   seja lavada para *"AHA/ASA"* ⛔ sem ano, ⛔ e que os alvos pressóricos ⛔ não
 *   colapsem uns nos outros.
 *
 * NÃO PROMETE: que a dose esteja clinicamente **certa** — ⛔ ela ⛔ não sabe
 *   farmacologia. ⚠️ Ela guarda a **rastreabilidade** ⛔ e a **não-reprodução** do
 *   valor histórico.
 *
 * UNIVERSO: `avc/conteudo/antihipertensivos.ts` ⛔ e a tela que o consome.
 *
 * ── ⚠️⚠️ O QUE ORIGINOU ────────────────────────────────────────────────────
 *
 * ⚠️ A revisão clínica do autor (2026-09-06) encontrou, no *Manual de Rotinas*
 * do MS de 2013, manutenção de esmolol até **3 mg/kg/min** — ⛔ **dez vezes** o
 * teto contemporâneo de **300 mcg/kg/min**, acima do qual a bula declara que a
 * segurança ⛔ **não foi estudada**.
 *
 * ⛔ ⛔ Um valor desses ⛔ não pode voltar por descuido de edição.
 */
const path = require("node:path");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const conteudo = lerFonte(path.join(appDir, "avc", "conteudo", "antihipertensivos.ts"));
const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-e.tsx"));

let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️⚠️ A DOSE QUE ⛔ NÃO PODE VOLTAR ══════════════════════════════════ */

confere("⚠️⚠️ esmolol a 3 mg/kg/min ⛔ NÃO existe como dose",
  !/dose:[^]{0,200}3\s*mg\s*(por quilo|\/kg)/i.test(conteudo),
  "⛔ é ~10× o teto contemporâneo de 300 mcg/kg/min — a bula ⛔ não estudou acima disso");

confere("⚠️⚠️ ⛔ e o alerta contra ela EXISTE",
  /ALERTA_DO_ESMOLOL/.test(conteudo) && /ALERTA_DO_ESMOLOL/.test(tela),
  "⛔ o achado ⛔ não pode morrer no arquivo de fonte — ele tem de chegar à tela");

/* ══ ⚠️⚠️ RASTREABILIDADE — E-30 ═════════════════════════════════════════ */

{
  /** ⚠️ Todo agente declara `procedencia` — ⛔ dose ⛔ sem origem ⛔ não confere. */
  const agentes = conteudo.split(/\n  \{\n/).filter((b) => /id: "/.test(b) && /nome: "/.test(b));
  const semProcedencia = agentes.filter((b) => !/procedencia: "/.test(b));
  confere("⚠️ todo agente declara procedência",
    agentes.length >= 8 && semProcedencia.length === 0,
    `⛔ ${semProcedencia.length} agente(s) ⛔ sem procedência — dose ⛔ sem origem ⛔ não é rastreável (E-30)`);
}

confere("⚠️⚠️ ⛔ NENHUMA procedência diz 'AHA/ASA' ⛔ sem o ano",
  !/procedencia: "AHA\/ASA(?!\s+\d{4})/.test(conteudo),
  "⛔ a edição de 2026 ⛔ não nomeia fármaco algum; a tabela dos três é de **2019**");

confere("⚠️ a tela diz que a diretriz vigente ⛔ NÃO nomeia fármaco",
  /não nomeia fármaco/.test(tela),
  "⛔ sem essa frase, o médico lê que a edição atual endossa os três");

/* ══ ⚠️⚠️ ⛔ O APP ⛔ NÃO ESCOLHE AGENTE ══════════════════════════════════ */

confere("⚠️⚠️ ⛔ NÃO existe agente marcado como 'melhor' ⛔ ou 'primeira escolha'",
  !/melhor|superior|primeira escolha|escolha ideal/i.test(
    conteudo.replace(/\/\*\*[^]*?\*\//g, "")
  ),
  "⛔ ⛔ não há evidência de superioridade em mortalidade, independência ⛔ ou mRS em 90 dias");

confere("⚠️ a tela declara que a escolha é do médico",
  /escolha é do médico/.test(tela),
  "⛔ listar oito agentes ⛔ sem dizer isso lê como algoritmo de prescrição");

/* ══ ⚠️⚠️ OS ALVOS ⛔ NÃO COLAPSAM ═══════════════════════════════════════ */

confere("⚠️⚠️ a única COR 3 · Harm está declarada",
  /"3: Harm"/.test(conteudo) && /72 horas/.test(conteudo),
  "⛔ `<140` por 72 h após recanalização é a mais forte da série — ⛔ e faltava no documento de origem");

confere("⚠️ os alvos da trombectomia existem",
  /antes_evt/.test(conteudo) && /durante_evt/.test(conteudo),
  "⛔ o módulo tem EVT; alvos ⛔ só de IVT deixariam a trombectomia ⛔ sem meta");

confere("⚠️⚠️ a faixa 140–180 se declara ⛔ SEM grau",
  /faixa_pos_trombolise[^]{0,400}apoioSemGrau: true/.test(conteudo),
  "⛔ ela vive ⛔ só no *Supportive Text* 7 — a recomendação graduada dá ⛔ apenas teto (E-45)");

confere("⚠️ ⛔ e a tela DIZ isso quando a mostra",
  /sem grau de recomendação/.test(tela),
  "⛔ exibir a faixa ⛔ sem a ressalva empresta força de recomendação a texto de apoio");

/* ══ ⚠️ ⛔ E ⛔ NÃO SE PRESCREVE ══════════════════════════════════════════ */

confere("⚠️⚠️ ⛔ NENHUM preparo, diluição ⛔ ou bomba",
  !/diluir|diluição|soro fisiológico|bomba de infusão|ampola/i.test(
    conteudo.replace(/\/\*\*[^]*?\*\//g, "")
  ),
  "⛔ dose ⛔ não é receita — preparo é F-20, ⛔ e ele ⛔ ainda é parcial");

if (falhas > 0) {
  console.log(`\n❌ F-19 · ANTI-HIPERTENSIVOS — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ F-19 · ANTI-HIPERTENSIVOS — ${ok}/${ok} conferências · 8 agentes · 7 alvos`);
