import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * AC-15 · SUSPEITA DE HSA NA TELA (autor, 2026-09-15) — linhas E-a e E-b da matriz.
 *
 * E-a: «Sim» → «Não» sem fato novo. O portão continua retendo (E2), ⛔ e a Imagem precisa dizer o mesmo: a suspeita
 * segue visível como investigação pendente (E13), leitura sem «Sem suspeita», ⛔ sem «manejo» de HSA confirmada.
 * E-b: «Incerto» é suspeita ativa (E1): retém na Reperfusão, ⛔ e «Limpar» pede «Foi engano?» como pede com «Sim».
 *
 * As marcas `test.fail` saíram no commit do bloco A, que tornou os três testes verdes.
 */

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

async function abrirImagem(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-imagem").click();
  await abrirTudo(page);
}

test.describe("AVC · AC-15 · suspeita de HSA", () => {
  test("E-a · Sim → Não: a Reperfusão retém ⛔ e a Imagem mantém a suspeita visível", async ({ page }) => {
    await abrirImagem(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    await page.getByTestId("avc-opcao-suspeita_hsa-nao").click();
    await expect(page.getByTestId("avc-opcao-suspeita_hsa-nao")).toHaveAttribute("aria-checked", "true");

    await expect(page.getByTestId("avc-leitura-curto-suspeita_hsa"), "⛔ a Imagem diz «sem suspeita» com o portão retendo").not.toContainText(/sem suspeita/i);
    await expect(page.locator('[data-testid^="avc-destino-"]').filter({ hasText: /investiga/i }).first(), "⛔ a suspeita ativa sumiu da Imagem").toBeVisible();
    await expect(page.locator('[data-testid^="avc-destino-"]').filter({ hasText: /manejo de hemorragia subarac/i }), "⛔ suspeita tratada como HSA confirmada").toHaveCount(0);

    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-portao-motivo-suspeita_hsa"), "⛔ o «Não» desfez a retenção").toBeVisible();
  });

  test("E-b · «Incerto» retém na Reperfusão", async ({ page }) => {
    await abrirImagem(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-nao_sei").click();
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-portao-motivo-suspeita_hsa"), "⛔ «Incerto» ⛔ reteve").toBeVisible();
  });

  test("E-b · «Limpar» sobre «Incerto» pede «Foi engano?»", async ({ page }) => {
    await abrirImagem(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-nao_sei").click();
    await page.getByTestId("avc-limpar-suspeita_hsa").click();
    await expect(page.getByTestId("avc-confirmar-limpar"), "⛔ «Limpar» apagou «Incerto» sem confirmação").toBeVisible();
    await expect(page.getByTestId("avc-confirmar-limpar")).toContainText("Foi engano?");
  });
});
