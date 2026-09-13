import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * HSA SEM ATALHO (autor, 2026-09-13, prioridade alta). O card dizia *"Resolver a
 * suspeita: responder «Não», ou corrigir o registro"* — ⛔ ensina a virar a resposta.
 * Condição corrigível exige DADO NOVO. Enquanto ⛔ não houver conteúdo validado do que
 * resolve a suspeita, o card diz "Requer investigação antes de reperfundir — conteúdo
 * pendente de validação", ⛔ e trocar «Sim» por «Não» ⛔ desfaz a retenção.
 */

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

test.describe("AVC · HSA · trocar a resposta ⛔ desfaz a retenção", () => {
  test("Sim → card sem «responder Não» ⛔ e sem «Resolver»; depois «Não» → a retenção CONTINUA", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/modulos/avc");
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-imagem").click();
    await abrirTudo(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();

    await page.getByTestId("avc-aba-reperfusao").click();
    const motivo = page.getByTestId("avc-f-portao-motivo-suspeita_hsa");
    await expect(motivo).toBeVisible();
    await expect(motivo).toContainText("Requer investigação antes de reperfundir — conteúdo pendente de validação");
    await expect(motivo, "⛔ o card ensina a virar a resposta").not.toContainText(/«Não»|responder/i);
    await expect(page.getByTestId("avc-f-portao-ir-suspeita_hsa"), "⛔ «Resolver» leva a trocar a resposta").toHaveCount(0);

    /** O atalho que o card ensinava: voltar e responder «Não», ⛔ sem fato novo. */
    await page.getByTestId("avc-aba-imagem").click();
    await abrirTudo(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-nao").click();
    await expect(page.getByTestId("avc-opcao-suspeita_hsa-nao")).toHaveAttribute("aria-checked", "true");
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-portao-motivo-suspeita_hsa"), "⛔ trocar «Sim» por «Não» desfez a retenção").toBeVisible();
  });
});
