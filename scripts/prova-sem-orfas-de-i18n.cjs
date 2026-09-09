/**
 * TRAVA DAS CHAVES ÓRFÃS — ⚠️ **texto que ⛔ ninguém mostra ⛔ ainda volta**.
 *
 * PROMETE: que ⛔ nenhuma chave de tradução ⛔ que este arquivo lista como
 *   **aposentada** ⛔ continue ⛔ no dicionário — ⛔ e ⛔ que ⛔ nenhuma tela
 *   ⛔ volte a renderizá-la.
 *
 * NÃO PROMETE: que ⛔ **⛔ toda** chave ⛔ sem consumidor ⛔ seja detectada.
 *   ⛔ O dicionário tem milhares de entradas, ⛔ e ⛔ muitas ⛔ pertencem a
 *   ⛔ outros módulos ⛔ ou ⛔ a caminhos ⛔ raros. ⚠️ ⛔ Esta trava guarda
 *   ⛔ **⛔ as que ⛔ foram deliberadamente aposentadas** — ⛔ que ⛔ são as
 *   ⛔ que ⛔ alguém ⛔ pode ressuscitar ⛔ por engano.
 *
 * UNIVERSO: `lib/i18n/modules`, `components` ⛔ e `avc`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO EXISTE PARA FECHAR ─────────────────────────
 *
 * ⛔ ⛔ Em 2026-09-09 o disclaimer manual *"Apoio ao julgamento clínico. A
 * decisão permanece do médico."* ⛔ foi substituído ⛔ pelo componente único.
 * ⚠️ ⛔ A **⛔ renderização** saiu ⛔ das três telas — ⛔ e a **⛔ chave de
 * tradução ⛔ ficou**, ⛔ publicada ⛔ no bundle de produção.
 *
 * ⚠️⚠️ ⛔ ⛔ **⛔ Chave órfã ⛔ é ⛔ como a frase volta.** ⛔ Alguém procura o
 * texto, ⛔ acha a chave, ⛔ e ⛔ conclui ⛔ que ⛔ ele ⛔ ainda é usado — ⛔ e
 * ⛔ reusa. ⛔ Foi ⛔ medido ⛔ **⛔ no bundle**, ⛔ e ⛔ não ⛔ na fonte: ⛔ a
 * página ⛔ não a mostrava, ⛔ e ⛔ ela ⛔ estava ⛔ lá.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/**
 * ⚠️⚠️ ⛔ AS APOSENTADAS — ⛔ cada uma ⛔ com ⛔ **⛔ o que ⛔ a substituiu**.
 *
 * ⛔ ⛔ Sem o substituto escrito, ⛔ a lista vira ⛔ proibição ⛔ sem saída —
 * ⛔ e ⛔ quem precisar do texto ⛔ vai reescrevê-lo ⛔ à mão, ⛔ que é
 * ⛔ exatamente ⛔ o que ⛔ se quis ⛔ acabar.
 */
const APOSENTADAS = [
  {
    chave: "Apoio ao julgamento clínico. A decisão permanece do médico.",
    substituto: "AvisoDeApoioClinico, variante `recomendacao` (design-system)",
    quando: "2026-09-09",
  },
];

/* ══ ⚠️⚠️ 1 · A CHAVE SAIU DO DICIONÁRIO ═══════════════════════════════ */

{
  const dir = path.join(appDir, "lib", "i18n", "modules");
  const dicionarios = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
  for (const { chave, substituto } of APOSENTADAS) {
    const onde = dicionarios.filter((f) => lerFonte(path.join(dir, f)).includes(`"${chave}"`));
    confere(
      `⚠️⚠️ ⛔ a chave aposentada saiu do dicionário — «${chave.slice(0, 40)}…»`,
      onde.length === 0,
      `⛔ ${onde.join(", ")} — ⛔ ela é publicada ⛔ no bundle ⛔ mesmo ⛔ sem tela ⛔ que a use. ⛔ Use: ${substituto}`
    );
  }
}

/* ══ ⚠️⚠️ 2 · ⛔ E ⛔ NENHUMA TELA VOLTOU A RENDERIZÁ-LA ════════════════ */

{
  const raizes = [
    path.join(appDir, "components"),
    path.join(appDir, "avc"),
  ];
  const arquivos = [];
  const anda = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) anda(p);
      else if (/\.(ts|tsx)$/.test(e.name)) arquivos.push(p);
    }
  };
  raizes.forEach(anda);

  for (const { chave, substituto } of APOSENTADAS) {
    /** ⛔ `tr("…")` — ⛔ a **renderização**, ⛔ e ⛔ não a menção em comentário. */
    const alvo = `tr("${chave}")`;
    const onde = arquivos
      .filter((p) => lerFonte(p).includes(alvo))
      .map((p) => path.relative(appDir, p));
    confere(
      `⚠️ ⛔ nenhuma tela renderiza a frase aposentada`,
      onde.length === 0,
      `⛔ ${onde.join(", ")} — ⛔ duas redações ⛔ para o mesmo recado. ⛔ Use: ${substituto}`
    );
  }
}

if (falhas > 0) {
  console.log(`\n❌ CHAVES ÓRFÃS — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ CHAVES ÓRFÃS — ${ok}/${ok} conferências · ${APOSENTADAS.length} frase(s) aposentada(s)\n`);
