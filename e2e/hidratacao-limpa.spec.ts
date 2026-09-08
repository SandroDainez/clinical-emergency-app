import { expect, test, type Page } from "@playwright/test";

/**
 * PROMETE: que **⛔ nenhuma rota do app lance erro de hidratação** ao abrir —
 *   ⛔ em telefone estreito, em telefone comum ⛔ e em tela larga.
 *
 * NÃO PROMETE: que a tela esteja certa depois de hidratar — ⛔ isso é dos e2e
 *   de cada módulo. ⛔ Aqui se mede **⛔ uma coisa só**: o primeiro quadro do
 *   cliente bate com o HTML do build.
 *
 * UNIVERSO: o `dist` servido — ⛔ que é o mesmo artefato que vai para a Vercel.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (2026-09-08) ────────────────────────
 *
 * ⛔ ⛔ **React #418 em ⛔ toda rota `/modulos/*`**, ⛔ em produção.
 *
 * ⛔ `react-native-web` inicia `Dimensions` em `width: 0`, ⛔ e ⛔ o pré-render
 * do `expo export` ⛔ não tem DOM para corrigi-lo. ⚠️ ⛔ Resultado: **toda**
 * comparação `width < N` era verdadeira no HTML do build ⛔ e falsa no
 * navegador. ⛔ O nó exato: `ModuleFlowHero` → `tinyPhone &&
 * badgeRowNarrowMobile` — ⛔ `flexDirection` `column` no build, `row` na tela.
 *
 * ⚠️⚠️ ⛔ E ⛔ ELE ⛔ NÃO APARECIA: o React descarta o HTML do build ⛔ e
 * redesenha tudo no cliente. ⛔ O app **parecia** funcionar — ⛔ e a hidratação
 * estava morta em ⛔ todos os módulos, ⛔ pagando um render inteiro a mais ⛔ em
 * cima de aparelho de plantão.
 *
 * ── ⚠️⚠️ ⛔ POR QUE A LARGURA É PARTE DO TESTE ────────────────────────────
 *
 * ⛔ ⛔ Em 1280 px o defeito **⛔ não aparecia** em parte das telas: ⛔ o build
 * ⛔ e o navegador caíam no mesmo lado de alguns cortes. ⚠️ ⛔ Medir numa
 * largura só é ⛔ como ⛔ ele sobreviveu ⛔ até aqui.
 */

/** ⚠️ As rotas pré-renderizadas — ⛔ e o AVC entra, ⛔ que é o módulo em obra. */
const ROTAS = [
  "/",
  "/modulos/avc",
  "/modulos/pcr-adulto",
  "/modulos/calculadoras-clinicas",
  "/modulos/drogas-vasoativas",
  "/modulos/correcoes-eletroliticas",
  "/modulos/ritmos-acls",
  /**
   * ⚠️⚠️ ⛔ AS DUAS QUE ENTRARAM COM A UI 2.0 NO PRÉ-RENDER (2026-09-08).
   *
   * ⛔ ⛔ Elas estão entre as **sete** rotas cujo HTML de build mudou quando o
   * padrão de ambiente passou a ler `PADRAO`. ⚠️ ⛔ Rota que muda de primeiro
   * quadro é ⛔ exatamente onde uma divergência nova nasceria.
   */
  "/modulos/bradicardia-acls",
  "/modulos/taquicardia-acls",
] as const;

/**
 * ⚠️⚠️ ⛔ TRÊS LARGURAS, ⛔ E ⛔ ELAS ⛔ NÃO SÃO DECORATIVAS: ⛔ os cortes do app
 * ficam em **361 · 390 · 430 · 560 · 760 · 920**. ⛔ 375 fica entre dois deles,
 * ⛔ 412 é o Pixel ⛔ e 1280 é o consultório.
 */
const LARGURAS = [375, 412, 1280] as const;

async function errosAoAbrir(page: Page, rota: string): Promise<string[]> {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(e.message.split("\n")[0]));
  page.on("console", (m) => {
    if (m.type() === "error" && /hydrat/i.test(m.text())) erros.push("hidratação: " + m.text().slice(0, 120));
  });
  await page.goto(rota);
  /** ⚠️ ⛔ O erro nasce **na hidratação** — ⛔ esperar o conteúdo basta. */
  await expect.poll(async () => (await page.locator("body").innerText()).length, {
    timeout: 30_000,
  }).toBeGreaterThan(200);
  return erros;
}

for (const largura of LARGURAS) {
  test.describe(`hidratação a ${largura} px`, () => {
    test.use({ viewport: { width: largura, height: 800 } });

    for (const rota of ROTAS) {
      test(`⛔ ${rota} abre sem erro de hidratação`, async ({ page }) => {
        const erros = await errosAoAbrir(page, rota);
        /**
         * ⚠️⚠️ ⛔ **#418** é o erro desta trava. ⛔ Qualquer outro `pageerror`
         * ⛔ também reprova — ⛔ erro em rota clínica ⛔ não tem versão aceitável.
         */
        expect(erros, `${rota} @ ${largura}px`).toEqual([]);
      });
    }
  });
}
