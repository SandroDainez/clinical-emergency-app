#!/usr/bin/env node
/**
 * PROVA · A PORTA DO E2E ⛔ É HERDADA EM SILÊNCIO — autor, 2026-09-13 (11ª rodada).
 *
 * ⚠️ Na 10ª rodada um `serve -s dist` esquecido na 4173 foi reaproveitado pelo
 * `webServer` do Playwright (`reuseExistingServer: true`): toda rota recebeu o HTML da
 * home ⛔ e 66 testes caíram com React #418. ⛔ A suíte ⛔ disse o motivo.
 *
 * PROMETE: que `scripts/porta-e2e-livre.cjs` sai com erro ⛔ e mensagem clara (porta, PID)
 *   quando a porta está ocupada, ⛔ e sai 0 quando está livre; ⛔ e que o `test:all` o roda
 *   ANTES de `test:e2e`.
 * NÃO PROMETE: encerrar o processo alheio — ⛔ ele pode ser do autor; a trava recusa ⛔ e diz
 *   como resolver.
 * UNIVERSO: `scripts/porta-e2e-livre.cjs`, `package.json`.
 * FONTE: `docs/decisoes.md` — 11ª rodada, ajuste 3.
 */
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const guarda = path.join(appDir, "scripts", "porta-e2e-livre.cjs");
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(appDir, "package.json"), "utf8"));
const all = pkg.scripts["test:all"] ?? "";
conf("a trava existe", fs.existsSync(guarda), "⛔ scripts/porta-e2e-livre.cjs ausente");
conf("o test:all roda a trava ANTES de test:e2e",
  all.includes("npm run test:porta-e2e") && all.indexOf("npm run test:porta-e2e") < all.indexOf("npm run test:e2e")
    && /porta-e2e-livre\.cjs/.test(pkg.scripts["test:porta-e2e"] ?? ""),
  "⛔ test:porta-e2e ausente, fora do test:all ou depois de test:e2e");

async function main() {
  if (!fs.existsSync(guarda)) return;
  const servidor = net.createServer();
  await new Promise((r) => servidor.listen(0, "0.0.0.0", r));
  const porta = servidor.address().port;
  const ocupada = spawnSync(process.execPath, [guarda, String(porta)], { encoding: "utf8" });
  const texto = `${ocupada.stdout}${ocupada.stderr}`;
  conf("porta ocupada → sai com erro", ocupada.status !== 0, `⛔ status ${ocupada.status}`);
  conf("… ⛔ e a mensagem diz a porta ⛔ e o que fazer", texto.includes(String(porta)) && /ocupada/i.test(texto) && /encerre|kill/i.test(texto), `⛔ ${texto.slice(0, 300)}`);
  await new Promise((r) => servidor.close(r));
  const livre = spawnSync(process.execPath, [guarda, String(porta)], { encoding: "utf8" });
  conf("porta livre → sai 0", livre.status === 0, `⛔ status ${livre.status} · ${livre.stdout}${livre.stderr}`);
}

main().then(() => {
  console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · PORTA DO E2E — ${ok} verde(s) · ${falhas} vermelho(s)`);
  process.exit(falhas === 0 ? 0 : 1);
});
