#!/usr/bin/env node
/**
 * PROMETE: que VOLTAR mova o CURSOR e nunca o FATO — medicação administrada,
 *   choque aplicado, log do caso, linha do tempo e RELÓGIO sobrevivem ao voltar;
 *   e que TODO campo de `ACLSState` esteja classificado como cursor ou fato.
 *
 * NÃO PROMETE: que a classificação esteja clinicamente certa. Ela é decisão do
 *   médico e está escrita em `acls/estado-cursor-e-fato.ts`; aqui só se exige que
 *   exista, que cubra o tipo inteiro e que o motor a respeite.
 *
 * UNIVERSO: o tipo `ACLSState` (acls/reducer.ts), a classificação
 *   (acls/estado-cursor-e-fato.ts) e o motor executado de verdade (engine.ts).
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ─────────────────────────────────
 *
 * `goBack` restaurava o instantâneo inteiro. Medido no motor real: dose 1 → 0,
 * cronômetro do ciclo 1 → 0 (DESAPARECIA), log 6 → 4, linha do tempo 15 → 9.
 *
 * ⚠️ UM DEFEITO COM TRÊS PORTAS — botão do cabeçalho, etapa da tela e comando de
 * voz chamam o MESMO `goBack`. Esta trava prova o conserto no motor E confere que
 * as portas da tela continuam convergindo para ele; consertar só uma porta criaria
 * duas com resultados diferentes.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const falhas = [];
let ok = 0;

// ── 1. COBERTURA: todo campo do ACLSState está classificado ─────────────────
{
  const reducer = lerFonte(path.join(appDir, "acls/reducer.ts"));
  const i = reducer.indexOf("type ACLSState = {");
  const corpo = reducer.slice(i, reducer.indexOf("\n};", i));
  const campos = [...corpo.matchAll(/^\s{2}(\w+)\??:/gm)].map((m) => m[1]);
  const cls = lerFonte(path.join(appDir, "acls/estado-cursor-e-fato.ts"));
  const lista = (nome) => {
    const j = cls.indexOf(nome);
    const bloco = cls.slice(j, cls.indexOf("] as const", j));
    return [...bloco.matchAll(/"(\w+)"/g)].map((m) => m[1]);
  };
  const cursor = lista("CAMPOS_DE_CURSOR"), fato = lista("CAMPOS_DE_FATO");

  // ⚠️ VACUIDADE (R-15 item 9): parser quebrado aprovaria tudo.
  if (campos.length < 20 || cursor.length + fato.length < 20) {
    console.log(`\n❌ leitura quebrada — ${campos.length} campos, ${cursor.length + fato.length} classificados\n`);
    process.exit(1);
  }

  const semClasse = campos.filter((c) => !cursor.includes(c) && !fato.includes(c));
  const nosDois = campos.filter((c) => cursor.includes(c) && fato.includes(c));
  if (semClasse.length) {
    falhas.push(
      `${semClasse.length} campo(s) de ACLSState SEM classificação: ${semClasse.join(", ")}.\n` +
      `      ⚠️ Campo novo não classificado é campo que o voltar apaga sem ninguém saber. ` +
      `Classifique em acls/estado-cursor-e-fato.ts — CURSOR (onde o protocolo está) ou ` +
      `FATO (o que aconteceu com o paciente).`
    );
  } else ok++;
  if (nosDois.length) {
    falhas.push(`campo(s) classificados nos DOIS conjuntos: ${nosDois.join(", ")}.`);
  } else ok++;
  const fantasmas = [...cursor, ...fato].filter((c) => !campos.includes(c));
  if (fantasmas.length) {
    falhas.push(
      `${fantasmas.length} campo(s) classificados que NÃO existem mais em ACLSState: ${fantasmas.join(", ")}.\n` +
      `      ⚠️ Classificação de campo morto dá falsa sensação de cobertura.`
    );
  } else ok++;
}

// ── 2. COMPORTAMENTO: o motor executado de verdade ──────────────────────────
{
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "voltar-"));
  try {
    execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--resolveJsonModule", "--outDir", tmp,
      path.join(appDir, "engine.ts")], { stdio: "pipe" });
  } catch { /* tsc reclama de tipos e ainda emite */ }
  const mod = require(path.join(tmp, "engine.js"));
  const eng = mod.default ?? mod;

  eng.reset?.();
  const id = () => eng.getCurrentStateId();
  for (let i = 0; i < 12 && id() !== "nao_chocavel_epinefrina"; i++) {
    const antes = id();
    const o = eng.getCurrentState().options;
    eng.next(o && Object.keys(o).length
      ? (o["nao_chocavel"] !== undefined ? "nao_chocavel" : Object.keys(o)[0])
      : undefined);
    if (id() === antes) break;
  }
  if (id() !== "nao_chocavel_epinefrina") {
    falhas.push(`a caminhada não chegou à epinefrina (parou em ${id()}) — nada foi conferido.`);
  } else {
    const foto = () => {
      const t = eng.getTimers?.() ?? [];
      return {
        doses: eng.getMedicationSnapshot?.()?.adrenaline?.administeredCount ?? -1,
        // ⚠️ NÃO se confere a contagem regressiva: ela é CURSOR (o motor tem
        // invariante de que timer só existe em RCP). O que se confere é o TEMPO
        // DECORRIDO, que é fato.
        decorrido: eng.getEncounterSummary?.()?.elapsedMs ?? eng.getElapsedMs?.() ?? null,
        log: (eng.getCaseLog?.() ?? []).length,
        linha: (eng.getTimeline?.() ?? []).length,
      };
    };
    eng.registerExecution?.("adrenaline");
    eng.next(undefined);
    const antes = foto();
    const estadoAntes = id();
    eng.goBack?.();
    const depois = foto();

    if (estadoAntes === id()) {
      falhas.push("o voltar não moveu o cursor — a conferência do fato passaria por acaso.");
    } else ok++;

    const conferir = [
      ["a dose de adrenalina", antes.doses, depois.doses],
      ["o log do caso", antes.log, depois.log],
      ["a linha do tempo", antes.linha, depois.linha],
      ["o tempo decorrido da parada", antes.decorrido, depois.decorrido],
    ].filter(([, a, b]) => a !== b);
    if (conferir.length) {
      falhas.push(
        `${conferir.length} FATO(s) mudaram ao voltar: ` +
        conferir.map(([n, a, b]) => `${n} ${a} → ${b}`).join(" · ") + ".\n" +
        `      ⚠️ Voltar move o CURSOR, nunca o FATO. Dose administrada continua administrada; ` +
        `o relógio da parada não retrocede nem desaparece.`
      );
    } else ok++;

    // ── sentido inverso: voltar não pode CRIAR cronômetro que não existia ──
    //
    // ⚠️ O primeiro estado exige resposta (`next(undefined)` lança). Anda-se um
    // passo pelo caminho válido antes de medir — instrumento que estoura não
    // mede nada.
    eng.reset?.();
    const semTimer = (eng.getTimers?.() ?? []).length;
    const o0 = eng.getCurrentState().options;
    eng.next(o0 && Object.keys(o0).length ? Object.keys(o0)[0] : undefined);
    eng.goBack?.();
    if ((eng.getTimers?.() ?? []).length > semTimer) {
      falhas.push(
        "voltar CRIOU um cronômetro que não existia no estado de destino.\n" +
        "      ⚠️ Preservar o fato não pode virar inventar fato — um relógio que aparece ao " +
        "navegar conta um tempo que ninguém começou."
      );
    } else ok++;
  }
}

// ── 3. AS TRÊS PORTAS CONVERGEM PARA O MESMO goBack ─────────────────────────
{
  const tela = lerFonte(path.join(appDir, "components/protocol-screen.tsx"));
  const acls = lerFonte(path.join(appDir, "components/protocol-screen/acls-protocol-screen.tsx"));
  // ⚠️ PRESENÇA DE STRING NÃO É FIAÇÃO. A primeira versão procurava
  // `engine.goBack` no arquivo INTEIRO e passou verde com a chamada desligada —
  // havia outra ocorrência da mesma string algumas linhas abaixo. Agora se
  // recorta o CORPO da função e se confere a ligação de ponta a ponta.
  const corpoDoVoltar = (() => {
    const i = tela.indexOf("function goBackStage()");
    return i < 0 ? "" : tela.slice(i, tela.indexOf("\n  }", i));
  })();
  const portas = [
    ["a etapa da tela chama o motor", /engine\.goBack\(\)/.test(corpoDoVoltar)],
    ["a etapa da tela pergunta se pode voltar", /engine\.canGoBack/.test(corpoDoVoltar)],
    ["a tela liga o botão ao goBackStage", /onGoBack=\{goBackStage\}/.test(tela)],
    ["o cabeçalho do ACLS recebe onGoBack", /onVoltar=\{[^}]*onGoBack\}/.test(acls)],
  ].filter(([, achou]) => !achou);
  if (portas.length) {
    falhas.push(
      `${portas.length} porta(s) do voltar não foram localizadas: ${portas.map((p) => p[0]).join(", ")}.\n` +
      `      ⚠️ Se uma porta deixar de passar pelo motor, ela volta a apagar fato sozinha.`
    );
  } else ok++;
}

console.log("\nVoltar move o cursor, nunca o fato\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — ACLSState inteiro classificado, fato preservado no motor real, portas convergindo\n`);
process.exit(0);
