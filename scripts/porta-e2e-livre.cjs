#!/usr/bin/env node
/**
 * TRAVA · A PORTA DO E2E PRECISA ESTAR LIVRE ANTES DA SUÍTE (autor, 2026-09-13, 11ª rodada).
 *
 * ⚠️ O `webServer` do Playwright usa `reuseExistingServer: true`: um servidor esquecido
 * na porta é HERDADO em silêncio. Na 10ª rodada um `serve -s dist` fez toda rota receber
 * o HTML da home ⛔ e 66 testes caíram com React #418, ⛔ sem dizer o motivo.
 *
 * PROMETE: sair com erro, antes do e2e, quando algo escuta na porta (IPv4, IPv6 ou bind
 *   recusado), dizendo a porta, o PID (via lsof) ⛔ e o que fazer; sair 0 com a porta livre.
 * NÃO PROMETE: encerrar o processo alheio (pode ser do autor) — ⛔ ele RECUSA; ⛔ nem
 *   proteger outras portas.
 * UNIVERSO: a porta do `webServer` do `playwright.config.ts` (padrão 4173).
 * Uso: `node scripts/porta-e2e-livre.cjs [porta]`. Prova: `prova-porta-e2e.cjs`.
 */
const net = require("node:net");
const { execFileSync } = require("node:child_process");

const porta = Number(process.argv[2] || process.env.PORTA_E2E || 4173);

function conecta(host) {
  return new Promise((resolve) => {
    const s = net.connect({ port: porta, host });
    s.setTimeout(800);
    s.once("connect", () => { s.destroy(); resolve(true); });
    s.once("timeout", () => { s.destroy(); resolve(false); });
    s.once("error", () => resolve(false));
  });
}

function escuta() {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.listen(porta, () => srv.close(() => resolve(true)));
  });
}

(async () => {
  const ocupada = (await conecta("127.0.0.1")) || (await conecta("::1")) || !(await escuta());
  if (!ocupada) {
    console.log(`✅ porta ${porta} livre para o e2e`);
    process.exit(0);
  }
  let quem = "";
  try {
    quem = execFileSync("lsof", ["-nP", `-iTCP:${porta}`, "-sTCP:LISTEN"], { encoding: "utf8" });
  } catch { /* lsof ausente ou sem permissão */ }
  console.error(
    `\n❌ PORTA ${porta} OCUPADA — o Playwright reaproveitaria esse servidor em silêncio (reuseExistingServer).\n\n`
    + (quem ? `${quem}\n` : "")
    + `Encerre o processo (kill <PID>) e rode de novo. Nenhum processo foi encerrado por esta trava.\n`
  );
  process.exit(1);
})();
