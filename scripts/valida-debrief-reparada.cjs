#!/usr/bin/env node
/**
 * PROMETE
 *   Que o resumo clínico, o relatório e o histórico de casos relatem o
 *   atendimento INTEIRO — inclusive depois de ROSC seguido de nova parada — e
 *   que os totais batam com o TIMELINE, que é fonte independente.
 *
 * NÃO PROMETE
 *   Que os contadores do episódio corrente estejam certos: eles são conferidos
 *   por `verify-acls-flow` e `test-acls-troca-de-ritmo`. Aqui a pergunta é
 *   outra — se o REGISTRO sobrevive ao zeramento que a DECISÃO exige.
 *   Confere TAMBÉM os três campos que hoje sobrevivem sozinhos — via aérea,
 *   causas abordadas e duração. Eles estão certos por ACIDENTE DE ESCOPO (o
 *   handler de re-parada não os toca), não por desenho: se alguém ampliar o
 *   handler, caem junto, e uma trava que só olhasse os seis corrigidos
 *   aprovaria a regressão.
 *
 * UNIVERSO
 *   Um cenário executado ponta a ponta no motor real (engine.ts compilado),
 *   não leitura de arquivo.
 *
 * ── O DEFEITO QUE ELA IMPEDE ────────────────────────────────────────────────
 *
 * CONTADOR DE DECISÃO USADO COMO FONTE DE DOCUMENTAÇÃO.
 *
 * `deliveredShockCount`, `cycleCount` e os trackers de medicação são variáveis
 * de CONTROLE do algoritmo: é lendo `antiarrhythmic.administeredCount` que o
 * reducer sabe se já bateu o teto de 2 doses, e é lendo `cycleCount` que ele
 * mantém a cadência. Na re-parada o reducer ZERA os três — e está certo: o
 * segundo episódio recomeça com direito às suas duas doses.
 *
 * O erro estava na camada de registro, que lia essas mesmas variáveis. Medido
 * por execução antes da correção: uma reanimação com 4 choques, 2 adrenalinas,
 * 1 antiarrítmico e 3 ciclos, seguida de ROSC e re-parada SEM NENHUMA
 * intervenção nova, produzia:
 *
 *     RESUMO diz: choques: 0 | adrenalina: 0 | antiarrítmico: 0 | ciclos: 0
 *     RELATÓRIO:  "Choques aplicados: 0"
 *
 * enquanto o timeline guardava shock_applied = 4 e medication_administered = 3.
 *
 * Isso vai para prontuário. É a única classe de defeito desta auditoria que
 * produz DOCUMENTO CLÍNICO FALSO — não conduta subótima, não informação
 * ausente: um número errado num registro assinado.
 *
 * ── POR QUE CONFERIR CONTRA O TIMELINE ──────────────────────────────────────
 *
 * A correção soma os episódios encerrados (`closedEpisodes`). Conferir a soma
 * contra ela mesma giraria em falso (R-21). O timeline é fonte INDEPENDENTE:
 * é escrito por outro caminho de código, não é tocado pela re-parada, e guarda
 * evento a evento. Se as duas contas divergirem, uma das duas está errada — e
 * a trava não precisa saber qual para acusar.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "debrief-reparada-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--resolveJsonModule", "--esModuleInterop", "--moduleResolution", "node",
    "--outDir", tempDir, path.join(appDir, "engine.ts"),
  ],
  { cwd: appDir, stdio: "pipe" }
);
fs.copyFileSync(path.join(appDir, "protocol.json"), path.join(tempDir, "protocol.json"));
const engine = require(path.join(tempDir, "engine.js"));

let now = 0;
Date.now = () => now;
const advance = (ms) => (now += ms);
const go = (fn) => { fn(); engine.consumeEffects(); };

const falhas = [];
let ok = 0;
function confere(nome, obtido, esperado) {
  if (obtido === esperado) { ok++; return; }
  falhas.push(`${nome}: obtido ${JSON.stringify(obtido)}, esperado ${JSON.stringify(esperado)}`);
}

// ── Cenário: parada chocável com 4 choques → ROSC → re-parada ──────────────
engine.resetSession();
engine.consumeEffects();
go(() => engine.next());
go(() => engine.next("sem_pulso"));
go(() => engine.next());
go(() => engine.next("chocavel"));
go(() => engine.next("bifasico"));
go(() => engine.registerExecution("shock"));
go(() => engine.next());
go(() => engine.registerExecution("advanced_airway"));

for (let c = 0; c < 3; c += 1) {
  advance(121000);
  go(() => engine.tick());
  go(() => engine.next());
  go(() => engine.next("chocavel"));
  go(() => engine.registerExecution("shock"));
  go(() => engine.next());
  const snap = engine.getMedicationSnapshot();
  if (snap.adrenaline.pendingConfirmation) go(() => engine.registerExecution("adrenaline"));
  if (snap.antiarrhythmic.pendingConfirmation) go(() => engine.registerExecution("antiarrhythmic"));
}

// Marcar uma causa como abordada — sem isso a conferência das causas rodaria
// sobre lista vazia e passaria por vacuidade.
go(() => engine.updateReversibleCauseStatus("hipoxia", "abordada"));

const antes = engine.getEncounterSummary();
if (antes.shockCount < 2) {
  falhas.push(
    `o cenário não chegou a aplicar choques (${antes.shockCount}) — a trava não rodou sobre nada. ` +
    `O fluxo do ACLS mudou e este script precisa ser reescrito, não ignorado.`
  );
}

// ROSC e re-parada, SEM nenhuma intervenção nova.
advance(121000);
go(() => engine.tick());
go(() => engine.next());
go(() => engine.next("rosc"));
if (!engine.getDocumentationActions().some((a) => a.id === "rearrest")) {
  falhas.push("pós-ROSC não oferece a ação `rearrest` — o cenário desta trava deixou de existir.");
}
go(() => engine.registerExecution("rearrest"));

const depois = engine.getEncounterSummary();
const timeline = engine.getTimeline ? engine.getTimeline() : [];
const noTimeline = (tipo) => timeline.filter((e) => e.type === tipo).length;

// ── 1. O episódio corrente TEM de zerar. Se não zerar, o teto de 2 doses do
//       antiarrítmico vaza para o segundo episódio e o paciente perde uma dose
//       a que tem direito. Esta conferência protege a DECISÃO.
confere("episódio corrente zerou os choques", depois.shockCount, 0);
confere("episódio corrente zerou o antiarrítmico", depois.antiarrhythmicAdministeredCount, 0);

// ── 2. Os TOTAIS não podem ter zerado. Esta conferência protege o REGISTRO.
confere("totais existem", typeof depois.totais, "object");
confere("totais contam 2 episódios", depois.totais?.episodios, 2);
confere("totais preservam os choques", depois.totais?.shockCount, antes.shockCount);
confere(
  "totais preservam a adrenalina administrada",
  depois.totais?.adrenalineAdministeredCount,
  antes.adrenalineAdministeredCount
);
confere(
  "totais preservam o antiarrítmico administrado",
  depois.totais?.antiarrhythmicAdministeredCount,
  antes.antiarrhythmicAdministeredCount
);

// ── 2b. OS TRÊS QUE SOBREVIVERAM POR ACIDENTE DE ESCOPO.
//
// `advancedAirwaySecured`, as causas abordadas e a duração não zeraram porque o
// handler de re-parada simplesmente não os toca — não porque alguém decidiu
// preservá-los. Isso não é desenho, é omissão que calhou de estar certa.
//
// Se um dia o handler for ampliado ("limpar o estado do episódio anterior"),
// eles caem junto com os outros seis, e uma trava que só olhasse os seis
// corrigidos APROVARIA a regressão. Ficam conferidos aqui, com o mesmo peso.
confere(
  "via aérea avançada sobrevive à re-parada",
  depois.advancedAirwaySecured,
  true
);
confere(
  "causas abordadas sobrevivem à re-parada",
  JSON.stringify(depois.addressedCauses),
  JSON.stringify(antes.addressedCauses)
);
if (antes.addressedCauses.length === 0) {
  falhas.push(
    "o cenário não marcou nenhuma causa como abordada — a conferência das causas não rodou " +
    "sobre nada. Corrigir o cenário, não remover a conferência."
  );
} else ok++;

// A duração é do ATENDIMENTO, não do episódio: tem de continuar crescendo. Se
// zerar, o prontuário passa a dizer que a reanimação durou o tempo da segunda
// parada — e é o oposto do erro dos contadores, com o mesmo efeito.
{
  const emSegundos = (rotulo) => {
    const [m, sg] = String(rotulo).split(":").map(Number);
    return (m || 0) * 60 + (sg || 0);
  };
  if (emSegundos(depois.durationLabel) < emSegundos(antes.durationLabel)) {
    falhas.push(
      `a duração ENCOLHEU na re-parada: ${antes.durationLabel} → ${depois.durationLabel}. ` +
      `Ela mede o atendimento inteiro, não o episódio corrente.`
    );
  } else ok++;
}

// ── 3. Conferência INDEPENDENTE contra o timeline.
confere("choques: totais × timeline", depois.totais?.shockCount, noTimeline("shock_applied"));
confere(
  "medicações: totais × timeline",
  (depois.totais?.adrenalineAdministeredCount ?? 0) + (depois.totais?.antiarrhythmicAdministeredCount ?? 0),
  noTimeline("medication_administered")
);

// ── 4. O texto que vai para prontuário diz o número certo, e AVISA que houve
//       mais de um episódio — sem isso, "4 choques" num atendimento com duas
//       paradas é ambíguo.
const texto = engine.getEncounterSummaryText();
if (!new RegExp(`Choques aplicados: ${noTimeline("shock_applied")}\\b`).test(texto)) {
  falhas.push(
    `o resumo clínico não relata os ${noTimeline("shock_applied")} choques do timeline — ` +
    `«${(texto.split("\n").find((l) => /Choques aplicados/.test(l)) ?? "linha ausente").trim()}»`
  );
} else ok++;

if (!/Episódios de parada: 2/.test(texto)) {
  falhas.push(
    "o resumo soma os episódios sem AVISAR que houve mais de um. Um total correto sem essa " +
    "linha lê-se como se tudo tivesse acontecido numa parada só."
  );
} else ok++;

// ── 5. O relatório HTML é outro caminho de código e erra sozinho.
const html = engine.getEncounterReportHtml();
if (!new RegExp(`>${noTimeline("shock_applied")}<`).test(html)) {
  falhas.push(
    `o relatório HTML não mostra os ${noTimeline("shock_applied")} choques — ele monta os campos ` +
    `por conta própria e não herda a correção do resumo em texto.`
  );
} else ok++;

console.log("\nDebrief após re-parada — o registro sobrevive ao zeramento que a decisão exige\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(
    `\n❌ ${falhas.length} problema(s) · contador de DECISÃO não pode ser fonte de DOCUMENTAÇÃO:\n` +
    `   o reducer zera certo na re-parada; quem registra é que não pode ler a variável de controle.\n`
  );
  process.exit(1);
}
console.log(`✅ ${ok} conferências — totais preservados e conferidos contra o timeline\n`);
process.exit(0);
