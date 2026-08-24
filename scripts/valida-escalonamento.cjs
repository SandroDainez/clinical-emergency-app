#!/usr/bin/env node
/**
 * PROMETE: que o estado de escalonamento obedeça às seis provas do autor — a
 *   primeira piora NÃO dispara, a segunda dispara, a recorrência dispara, o
 *   estado não classifica, a terceira volta silenciosa é impossível, e um novo
 *   atendimento zera o anterior.
 * NÃO PROMETE: que os gatilhos sejam os clinicamente certos. A escolha é do
 *   autor e é regra de PRODUTO — a trava confere que o app obedece, não que a
 *   regra esteja certa.
 * UNIVERSO: `lib/escalonamento.ts` compilado + `lib/flow-session.ts` + a árvore
 *   renal, para a prova 4. Contagens impressas antes do resultado.
 * ORIGEM DO CRITÉRIO: decisão do autor datada (2026-08-23 e 2026-08-24) — R-118.
 *
 * ── ⚠️ A PROVA 1 É NEGATIVA, E ISSO É RARO AQUI ─────────────────────────────
 *
 * Quase toda trava deste repositório prova que algo ACONTECE. Esta prova que
 * algo **não acontece**: que o gatilho não é ansioso.
 *
 * **Trava só de disparo transforma qualquer instabilidade em escalonamento — e
 * um app que escalona sempre é um app que ninguém escuta.** Aí ele deixa de
 * escalonar quando importa.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const RAIZ = path.resolve(__dirname, "..");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };
const ok = (m) => console.log(`   ✅ ${m}`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "esc-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
    path.join(RAIZ, "lib", "escalonamento.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
} catch {
  console.error("❌ `lib/escalonamento.ts` não compila — a conferência não rodou.");
  process.exit(1);
}
const E = require(path.join(tmp, "escalonamento.js"));

console.log(`\nUNIVERSO: 6 provas do autor · estado com ${Object.keys(E.ESTADO_INICIAL).length} campos · ${E.ESCALONAR_COM_SUPORTE.length + E.ESCALONAR_SEM_SUPORTE.length} linhas nas duas realidades\n`);

// ── 1 · PRIMEIRA PIORA ISOLADA NÃO DISPARA
{
  const s = E.registrarPassagem(E.ESTADO_INICIAL, { tipo: "piorou" });
  if (E.deveEscalonar(s)) erro(`1 · a PRIMEIRA piora disparou o escalonamento — o gatilho ficou ansioso, e um app que escalona sempre é um app que ninguém escuta`);
  else ok("1 · a primeira piora isolada NÃO dispara");
}
// ── 2 · SEGUNDA PIORA DISPARA
{
  let s = E.registrarPassagem(E.ESTADO_INICIAL, { tipo: "piorou" });
  s = E.registrarPassagem(s, { tipo: "piorou" });
  if (E.deveEscalonar(s) !== "segunda_piora") erro(`2 · a SEGUNDA piora não disparou — devolveu ${JSON.stringify(E.deveEscalonar(s))}`);
  else ok("2 · a segunda piora dispara");
}
// ── 3 · RECORRÊNCIA DA MESMA AMEAÇA DISPARA
{
  let s = E.registrarPassagem(E.ESTADO_INICIAL, { tipo: "ameaca", id: "hipercalemia", jaAbordada: false });
  if (E.deveEscalonar(s)) erro(`3 · identificar uma ameaça pela primeira vez disparou o escalonamento — só a RECORRÊNCIA dispara`);
  s = E.registrarPassagem(s, { tipo: "ameaca", id: "hipercalemia", jaAbordada: true });
  if (E.deveEscalonar(s) !== "ameaca_reapareceu") erro(`3 · a mesma ameaça reaparecendo após abordagem não disparou`);
  else ok("3 · a recorrência da mesma ameaça dispara (e a primeira vez não)");
  // e uma ameaça DIFERENTE não conta como recorrência
  const outra = E.registrarPassagem(E.ESTADO_INICIAL, { tipo: "ameaca", id: "choque", jaAbordada: true });
  if (E.deveEscalonar(outra)) erro(`3b · uma ameaça NOVA marcada como "já abordada" disparou — recorrência exige ter sido identificada ANTES neste atendimento`);
}
// ── 4 · O ESTADO NÃO CLASSIFICA
//
// ⚠️ Conferido nos DOIS lados: o módulo não exporta nada de classificação, e a
// árvore renal não lê nenhum campo do estado.
{
  const exporta = Object.keys(E);
  const proibidos = exporta.filter((k) => /gravidade|estagio|kdigo|classific|severidade|diagnost/i.test(k));
  if (proibidos.length) erro(`4 · lib/escalonamento.ts exporta ${proibidos.join(", ")} — o estado de navegação não pode ter nada de classificação`);
  const arvore = lerFonte(path.join(RAIZ, "ira-decision-tree.ts"));
  const campos = Object.keys(E.ESTADO_INICIAL);
  const lidos = campos.filter((c) => new RegExp(`v\\.${c}\\b|values\\.${c}\\b`).test(arvore));
  if (lidos.length) erro(`4 · a árvore lê ${lidos.join(", ")} do estado de escalonamento — ele interrompe o ciclo e mostra a saída, NUNCA muda gravidade, diagnóstico ou estágio`);
  else ok("4 · o estado não classifica: nada de gravidade no módulo, nada lido pela árvore");
}
// ── 5 · TERCEIRA VOLTA SILENCIOSA É IMPOSSÍVEL
{
  let s = E.registrarPassagem(E.registrarPassagem(E.ESTADO_INICIAL, { tipo: "piorou" }), { tipo: "piorou" });
  if (!E.deveEscalonar(s)) erro(`5 · o gatilho não estava ativo antes do disparo`);
  s = E.marcarDisparado(s);
  if (!s.jaDisparou) erro(`5 · marcarDisparado não registrou o disparo — sem esse registro o ciclo recomeça calado`);
  const terceira = E.registrarPassagem(s, { tipo: "piorou" });
  if (!E.deveEscalonar(terceira)) erro(`5 · a TERCEIRA passagem deixou de disparar — a volta silenciosa voltou a ser possível`);
  else ok("5 · a terceira volta continua disparando: silêncio é impossível");
}
// ── 6 · NOVO ATENDIMENTO ZERA O ESTADO
//
// ⚠️ A PROVA MAIS PERIGOSA DAS SEIS: estado que sobrevive ao fim do atendimento
// faz a ameaça do paciente A contar para o paciente B — e o contador dispararia
// escalonamento num paciente que nunca piorou.
{
  // ⚠️ O COMPORTAMENTO, NÃO O TIPO. A primeira versão desta prova conferia que
  // o CAMPO existia em `SessaoDeFluxo` — e aprovava um contador que nunca era
  // gravado: ele vivia só num ref da tela e morria a cada navegação, muito antes
  // dos 30 minutos. Campo declarado é promessa; valor gravado é o objeto.
  const tela = lerFonte(path.join(RAIZ, "components", "protocol-screen", "acls-decision-flow-screen.tsx"));
  if (!/salvarSessaoDeFluxo\([\s\S]{0,400}?escalonamento:/.test(tela))
    erro(`6 · a tela NÃO grava o estado de escalonamento na sessão — ele morre a cada navegação, e a expiração de 30 min nunca chega a ser o que o zera`);
  if (!/escalonamentoRef\.current = salva\.escalonamento/.test(tela))
    erro(`6 · retomar não restaura o contador — retomar viraria uma terceira porta de reinício, silenciosa`);

  const sessao = lerFonte(path.join(RAIZ, "lib", "flow-session.ts"));
  if (!/escalonamento\?:\s*EstadoDeEscalonamento/.test(sessao))
    erro(`6 · o estado de escalonamento não vive dentro de SessaoDeFluxo — fora dela, ele não é apagado por "começar do início" nem pela expiração, e sobrevive ao paciente`);
  else if (!/descartarSessaoDeFluxo/.test(sessao) || !/VALIDADE_DA_SESSAO_MS/.test(sessao))
    erro(`6 · a sessão perdeu uma das duas portas de reinício (botão "começar do início" ou expiração)`);
  else ok(`6 · o estado mora na sessão, e as duas portas de reinício que o app já tinha o zeram junto`);

  const zerado = { ...E.ESTADO_INICIAL };
  if (zerado.piorou !== 0 || zerado.ameacasIdentificadas.length || zerado.ameacasQueReapareceram.length || zerado.jaDisparou)
    erro(`6 · ESTADO_INICIAL não está zerado`);
}

// ── E A TELA NÃO INVENTA CONDUTA
{
  const texto = [...E.ESCALONAR_COM_SUPORTE, ...E.ESCALONAR_SEM_SUPORTE].join(" ");
  if (/\d+\s*(mg|mcg|mL|UI|g)\b/i.test(texto))
    erro(`a tela de escalonamento escreveu DOSE — as medidas vêm dos ramos que já existem, a tela aponta para eles`);
  else ok("a tela aponta para os ramos existentes e não escreve dose");
}

console.log(falhas ? `\n❌ ${falhas} falha(s)` : `\n✅ as seis provas do autor passam`);
process.exit(falhas ? 1 : 0);
