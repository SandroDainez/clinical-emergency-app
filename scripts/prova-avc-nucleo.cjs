/**
 * PROMETE: que o núcleo do AVC obedeça às três decisões de Q-01/Q-02/Q-03 —
 *   uma porta única de relógio (⛔ nenhum `Date.now()` disperso), trilha
 *   APPEND-ONLY em que correção convive com a medida corrigida e exige motivo,
 *   e os três vazios (não perguntado / não sei / valor) como estados distintos
 *   que ⛔ nunca colapsam.
 * NÃO PROMETE: nada sobre MEDICINA. Ele ⛔ não confere corte, dose, janela nem
 *   fidelidade à AHA/ASA — isso é `prova-avc-superficie-a` (fidelidade dos
 *   campos) e, acima dela, a conferência de fonte, que é do médico. Também ⛔ não
 *   diz nada sobre a tela: um núcleo correto renderizado errado passa aqui, e
 *   foi exatamente o que aconteceu nos testes visuais de 2026-08-28.
 * UNIVERSO: `avc/nucleo/*.ts` compilados — relogio.ts, tipos.ts, estado.ts e
 *   derivacoes.ts. ⛔ Fora do universo: `avc/conteudo/`, `components/avc/`.
 */
/**
 * PROVA DO NÚCLEO DO AVC — Q-01 e Q-02.
 *
 * Mede o que o esqueleto promete e nada além:
 *   · o relógio é injetável e o tempo anda sob controle (Q-01, natureza T);
 *   · a trilha é append-only e a hora de registro vem do relógio (§3.1, §3.2);
 *   · "não sei" ≠ ausência de marco: o derivado não vira zero (E-02);
 *   · navegar não altera nada clínico (E-20);
 *   · pendência tem dono e some quando o dado chega (§2.5).
 *
 * ⛔ Não mede medicina — não há medicina no esqueleto.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tempDir, "relogio.js"));
const E = require(path.join(tempDir, "estado.js"));

// ── Q-01 · o relógio ───────────────────────────────────────────────────────
const rel = R.relogioControlado(1_000_000);
confere("relógio controlado devolve o instante definido", rel.agora() === 1_000_000,
  "o relógio de teste não é determinístico");

rel.avancar(60_000);
confere("avancar move o tempo para frente", rel.agora() === 1_060_000,
  "sem avanço controlado, provas de natureza T não existem (§8.2)");

let recusou = false;
try { rel.avancar(-1); } catch { recusou = true; }
confere("o tempo não anda para trás", recusou,
  "avanço negativo corromperia toda derivação temporal");

confere("minutosDesde devolve undefined sem marco",
  R.minutosDesde(undefined, rel) === undefined,
  "E-02: marco desconhecido virando 0 seria a mentira mais cara do módulo");

confere("minutosDesde calcula com marco conhecido",
  R.minutosDesde(1_000_000, rel) === 1,
  "cálculo de decorrido incorreto");

// ── Q-02 · o estado ────────────────────────────────────────────────────────
const rel2 = R.relogioControlado(500_000);
let est = E.abrirAtendimento(rel2);

confere("t₀ operacional nasce com o atendimento",
  est.relogiosClinicos.t0_operacional === 500_000,
  "§0.1: o t₀ é a chegada");

confere("nenhum relógio clínico é preenchido por engano",
  est.relogiosClinicos.ultima_vez_bem === undefined,
  "E-21: o t₀ não substitui relógio clínico");

confere("atendimento abre sem fatos", est.fatos.length === 0,
  "estado inicial sujo");

// trilha append-only
rel2.avancar(120_000);
est = E.registrarFato(est, { campo: "glicemia", valor: 90 }, rel2);
rel2.avancar(60_000);
est = E.registrarFato(est, { campo: "glicemia", valor: 110 }, rel2);

confere("registrar acrescenta, nunca substitui", est.fatos.length === 2,
  "§3.1: a trilha é append-only — sobrescrever apaga a evolução");

confere("o valor atual é o último registrado",
  E.valorAtual(est, "glicemia").valor === 110,
  "leitura do estado atual incorreta");

confere("o valor anterior permanece na trilha",
  est.fatos[0].valor === 90,
  "§3.1: sem o valor anterior, 'está em 110' é indistinguível de 'sempre esteve'");

confere("a hora de registro vem do relógio, não do chamador",
  est.fatos[0].horaRegistro === 620_000 && est.fatos[1].horaRegistro === 680_000,
  "§3.2: hora de registro informável deixaria a trilha ser reescrita");

// derivado que muda sozinho
const antes = E.decorridoEmMinutos(est, "t0_operacional", rel2);
rel2.avancar(300_000);
const depois = E.decorridoEmMinutos(est, "t0_operacional", rel2);
confere("o derivado temporal muda SEM nenhum dado mudar",
  antes === 3 && depois === 8,
  "§4.4-ii: é o gatilho que não emite evento — se não muda, o módulo mente sobre o tempo");

confere("marco clínico ausente não vira zero",
  E.decorridoEmMinutos(est, "ultima_vez_bem", rel2) === undefined,
  "E-02: desconhecido não é agora");

// navegação não altera clínica
const antesNav = est.fatos.length;
// ⚠️ Alvo por SLUG, ⛔ não por letra: a letra é rótulo e pode ser reordenada
// (E e F trocaram em 2026-08-28). Um teste ancorado na letra continuaria verde
// medindo outra superfície.
const navegado = E.verSuperficie(est, "reperfusao");
confere("navegar não registra nada",
  navegado.fatos.length === antesNav && navegado.superficieVista === "reperfusao",
  "E-20: nenhuma ação clínica nasce de avanço de tela");

// pendências
const exigidas = [
  { id: "tc_realizada", rotulo: "TC", dono: "C", resolvePor: "registrar" },
  { id: "glicemia", rotulo: "Glicemia", dono: "A", resolvePor: "medir" },
];
const abertas = E.pendenciasAbertas(est, exigidas);
confere("pendência some quando o dado chega",
  abertas.length === 1 && abertas[0].id === "tc_realizada",
  "§2.5: pendência é ausência qualificada — a glicemia já foi registrada");

confere("pendência declara quem a resolve",
  abertas[0].resolvePor.length > 0,
  "E-26: pendência sem condição de desbloqueio é muro, não tarefa");

// ── Relatório ──────────────────────────────────────────────────────────────
if (falhas.length) {
  console.error(`\n❌ PROVA DO NÚCLEO DO AVC — ${falhas.length} falha(s), ${ok} conferência(s) ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DO NÚCLEO DO AVC — ${ok}/${ok} conferências`);
