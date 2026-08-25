#!/usr/bin/env node
/**
 * PROMETE: que "arritmia instável" só seja declarada quando a FREQUÊNCIA é
 *   plausivelmente a causa do comprometimento — faixa da AHA 2025
 *   (taquiarritmia ≥150/min, bradiarritmia <50/min) E comprometimento
 *   atribuível a ela; que a faixa intermediária não vire arritmia; que ritmo
 *   irregular não seja pré-requisito; e que o motivo EXIBIDO descreva o que de
 *   fato disparou.
 * NÃO PROMETE: a conduta dentro dos módulos de bradi/taquicardia (test:acls),
 *   nem os demais gatilhos de ameaça (test:coronarias).
 * UNIVERSO: lib/instabilidade-coronariana.ts e os dois nós de transição da SCA.
 *
 * ── O DEFEITO, ENCONTRADO NO CELULAR PELO AUTOR (2026-08-25) ────────────────
 *
 * A tela dizia "Arritmia instável — frequência alta" para um paciente com
 * FC 100 e ritmo REGULAR, e o motivo impresso era "Ritmo irregular + FC alta +
 * sinais objetivos de hipoperfusão". Dois defeitos num card só:
 *
 *   1. O LIMIAR ERA 100. Dor torácica, ansiedade, vasoconstrição e FC 100 é o
 *      quadro mais banal do pronto-socorro — e o app mandava para o módulo de
 *      taquicardia, cuja conduta para instabilidade é CARDIOVERSÃO
 *      SINCRONIZADA. Cardioverter taquicardia sinusal compensatória é dano.
 *
 *   2. O MOTIVO ERA TEXTO FIXO. Dizia "ritmo irregular" para quem havia
 *      informado ritmo REGULAR — o app dava um motivo que não era o motivo, e
 *      isso destrói a confiança no "porquê" que o app inteiro promete.
 *
 * ⚠️ E O ERRO DE FUNDO NÃO ERA O NÚMERO: era atribuir o comprometimento à
 * frequência sem prova de que ela é a causa.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arritmia-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "lib", "instabilidade-coronariana.ts"),
  path.join(appDir, "coronary-decision-tree.ts"),
], { cwd: appDir, stdio: "pipe" });

const { avaliarAmeacaImediata } = require(path.join(tmp, "lib", "instabilidade-coronariana.js"));
const arvore = Object.values(require(path.join(tmp, "coronary-decision-tree.js"))).find((v) => v && v.nodes);

// ── A. OS CASOS QUE O AUTOR EXIGIU ─────────────────────────────────────────
const CASOS = [
  // ── O caso que o autor encontrou no celular ──────────────────────────────
  ["FC 100 sinusal + perfusão ruim", { fc: "100", cor_ritmo: "sinusal", cor_perfusao: "sim", cor_pulso_alterado: "normal" }, "nao-arritmia",
   "FC 100 é o LIMITE INFERIOR de taquicardia, não taquiarritmia instável — e o destino levaria a cardioversão"],
  ["FC 58 sinusal + hipoperfusão", { fc: "58", cor_ritmo: "sinusal", cor_perfusao: "sim", cor_pulso_alterado: "normal" }, "nao-arritmia",
   "50–59 com hipoperfusão é, muito mais vezes, resposta a outra coisa"],

  // ── A CAUSALIDADE PRECISA SER SUSTENTADA ────────────────────────────────
  //
  // ⚠️ ESTE É O CORAÇÃO DA TRAVA (correção do autor, 2026-08-25): "FC 160 +
  // PAS 78" NÃO prova que a arritmia é a causa. A taquicardia pode ser
  // compensatória a sepse, hipovolemia ou ao próprio infarto; a bradicardia
  // pode coexistir com outra causa de choque ou rebaixamento. Sem um ritmo que
  // seja de fato ARRITMIA, o app não pode roubar o caso do ramo de choque.
  ["FC 165 + PAS 78 + dor isquêmica + ARRITMIA", { fc: "165", pas: "78", cor_dor_isquemica_atual: "sim", cor_ritmo: "arritmia", cor_pulso_alterado: "normal" }, "arritmia_taqui",
   "aqui a causalidade está sustentada: há arritmia E comprometimento"],
  ["FC 165 compensatório — ritmo SINUSAL", { fc: "165", pas: "78", cor_ritmo: "sinusal", cor_perfusao: "sim", cor_pulso_alterado: "normal" }, "nao-arritmia",
   "taquicardia sinusal a 165 com PAS 78 é resposta, não causa — cardioverter isso é dano direto"],
  ["FC 165 + PAS 78, ritmo NÃO AVALIADO", { fc: "165", pas: "78", cor_ritmo: "nao_avaliado", cor_perfusao: "sim", cor_pulso_alterado: "normal" }, "nao-arritmia",
   "a dúvida não classifica: o caso segue pelo ramo que investiga a causa, que continua disponível"],
  ["FC 42 + PAS 80 + BAV (arritmia)", { fc: "42", pas: "80", cor_ritmo: "arritmia", cor_pulso_alterado: "normal" }, "arritmia_bradi",
   "bradiarritmia com hipotensão tem conduta própria (atropina/marcapasso)"],
  ["FC 42 + rebaixamento, ritmo SINUSAL", { fc: "42", cor_consciencia: "sim", cor_ritmo: "sinusal", cor_pulso_alterado: "normal" }, "nao-arritmia",
   "bradicardia sinusal com rebaixamento de causa neurológica não é bradiarritmia instável"],

  // ── ⚠️ CHOQUE COM PAS 140 NÃO EXISTE (achado do autor no celular) ───────
  //
  // A primeira versão desta correção roteava a faixa do meio (FC 100–149 /
  // 50–59 com hipoperfusão) para o ramo de CHOQUE. Testado com PAS 140, o app
  // concluía "choque" — trocar um rótulo errado (arritmia) por outro (choque)
  // não é correção. Um paciente com IAM, FC 110, sudoreico e PAS 140 é o
  // quadro adrenérgico banal do infarto: segue a via de SCA.
  ["PAS 140 + FC 100 + pele fria + sinusal", { pas: "140", fc: "100", cor_perfusao: "sim", cor_ritmo: "sinusal", cor_pulso_alterado: "normal" }, "sem-ameaca",
   "choque com pressão de 140 é contradição; e não é arritmia porque o ritmo é sinusal"],
  ["PAS 140 + FC 50 + pele fria + sinusal", { pas: "140", fc: "50", cor_perfusao: "sim", cor_ritmo: "sinusal", cor_pulso_alterado: "normal" }, "sem-ameaca",
   "mesma coisa do outro lado da frequência"],
  ["PAS 140 + FC 165 + pele fria + SINUSAL", { pas: "140", fc: "165", cor_perfusao: "sim", cor_ritmo: "sinusal", cor_pulso_alterado: "normal" }, "sem-ameaca",
   "taquicardia sinusal a 165 com pressão de 140 não é arritmia instável nem choque"],

  // ── Os compostos que MERECEM o ramo de choque continuam funcionando ─────
  ["Pulso filiforme + pele fria (PAS 120)", { pas: "120", fc: "90", cor_perfusao: "sim", cor_pulso_alterado: "filiforme", cor_ritmo: "sinusal" }, "choque",
   "esse é específico e sempre foi motivo de choque — a correção não pode tê-lo levado junto"],
  ["Arritmia + pele fria, FC 90 (PAS 120)", { pas: "120", fc: "90", cor_perfusao: "sim", cor_ritmo: "arritmia", cor_pulso_alterado: "normal" }, "choque",
   "arritmia em FC normal com hipoperfusão merece investigar a causa, sem virar arritmia instável"],
  ["PAS 78 — hipotensão real", { pas: "78", fc: "100", cor_perfusao: "sim", cor_ritmo: "sinusal", cor_pulso_alterado: "normal" }, "choque",
   "hipotensão de verdade continua sendo choque"],

  // ── Sem comprometimento não há instabilidade ────────────────────────────
  ["FC 165 ARRITMIA, sem comprometimento", { fc: "165", cor_ritmo: "arritmia", cor_perfusao: "nao", cor_pulso_alterado: "normal" }, "sem-ameaca",
   "taquiarritmia ESTÁVEL não entra no ramo de instabilidade — a conduta é vagal/adenosina, não cardioversão"],
  ["FC 45 ARRITMIA, sem comprometimento", { fc: "45", cor_ritmo: "arritmia", cor_perfusao: "nao", cor_pulso_alterado: "normal" }, "sem-ameaca",
   "bradicardia assintomática não recebe atropina nem marcapasso"],

  // ── Ritmo irregular não é pré-requisito ────────────────────────────────
  ["TV monomórfica (regular) 168 + perfusão ruim", { fc: "168", cor_ritmo: "arritmia", cor_perfusao: "sim", cor_pulso_alterado: "normal" }, "arritmia_taqui",
   "exigir irregularidade deixaria passar TV monomórfica e flutter de condução fixa, que são REGULARES"],

  // ── Precedência: só PCR e obstrução mecânica passam à frente ────────────
  ["PCR (pulso ausente) a 42", { fc: "42", cor_ritmo: "arritmia", cor_pulso_alterado: "ausente" }, "pcr", "PCR não espera nada"],
  ["Estridor + FC 160 arritmia", { fc: "160", cor_ritmo: "arritmia", cor_via_aerea_livre: "nao", cor_perfusao: "sim" }, "via_aerea", "obstrução mecânica não espera nada"],
];

for (const [nome, values, esperado, porque] of CASOS) {
  const r = avaliarAmeacaImediata(values);
  const destino = r ? r.destino : "—";
  const passou =
    esperado === "nao-arritmia" ? !destino.startsWith("arritmia")
    : esperado === "sem-ameaca" ? r === null
    : destino === esperado;
  if (!passou) {
    falhas.push(`${nome} → "${destino}", esperado ${esperado}.\n      ⚠️ ${porque}.`);
  } else ok++;
  linhas.push(`  ${passou ? "✅" : "❌"} ${nome.padEnd(38)} → ${destino}`);
}

// ── B. OS LIMIARES SÃO OS DA AHA 2025, NÃO OS ANTIGOS ──────────────────────
{
  const fonte = lerFonte(path.join(appDir, "lib", "instabilidade-coronariana.ts"));
  for (const [padrao, nome, porque] of [
    [/fc\s*<\s*50/, "bradiarritmia usa < 50/min", "60 rotulava como bradiarritmia quem só tinha FC no limite baixo do normal"],
    [/fc\s*>=\s*150/, "taquiarritmia usa >= 150/min", "100 mandava taquicardia sinusal compensatória para cardioversão"],
    [/ritmoEhArritmia = v\.cor_ritmo === "arritmia"/, "a causalidade exige que o ritmo SEJA arritmia",
     "FC extrema + comprometimento não prova que a arritmia é a causa — pode ser resposta a sepse, hipovolemia ou ao próprio infarto"],
    [/comprometimentoAtribuivel = ritmoEhArritmia && comprometimento/, "atribuível = arritmia E comprometimento",
     "os dois juntos; qualquer um sozinho presume causalidade"],
    [/comprometimentoAtribuivel/, "o gatilho exige comprometimento atribuível à frequência",
     "FC alta + qualquer sinal de má perfusão não é taquiarritmia instável — o algoritmo da AHA trata de arritmia CAUSANDO o comprometimento"],
  ]) {
    if (!padrao.test(fonte)) falhas.push(`${nome}: sumiu — ${porque}.`);
    else ok++;
  }
  if (/fc\s*>=\s*100\s*\)\s*\{\s*return \{ id: "arritmia/.test(fonte)) {
    falhas.push("o limiar de 100 voltou como gatilho de arritmia instável.");
  } else ok++;
}

// ── C. O MOTIVO EXIBIDO NÃO PODE SER TEXTO FIXO ────────────────────────────
//
// ⚠️ É a metade do defeito que mais corrói confiança: um motivo que não é o
// motivo. A `reason` tem de vir do caso.
for (const id of ["coronariana_arritmia_bradi", "coronariana_arritmia_taqui"]) {
  const no = arvore?.nodes?.[id];
  if (!no) { falhas.push(`\`${id}\` sumiu.`); continue; }
  const reasons = (no.targets ?? []).map((t) => t.reason ?? "");
  if (reasons.some((r) => /irregular/i.test(r))) {
    falhas.push(
      `\`${id}\`: a \`reason\` voltou a afirmar "ritmo irregular".\n` +
      `      ⚠️ O gatilho NÃO olha o ritmo — dizer isso a quem informou ritmo regular é dar um ` +
      `motivo que não é o motivo.`
    );
  } else ok++;
  if (!reasons.some((r) => r.includes("{ameacaEncontrada}"))) {
    falhas.push(`\`${id}\`: a \`reason\` deixou de derivar do caso ({ameacaEncontrada}).`);
  } else ok++;
}

// ── D. Vacuidade ───────────────────────────────────────────────────────────
if (linhas.length !== CASOS.length) falhas.push("nem todos os casos rodaram (R-15 item 9).");

console.log("\nArritmia instável — a frequência precisa ser a causa, não a companhia\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — 100 bpm não é mais arritmia instável\n`);
process.exit(0);
