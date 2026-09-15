import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * ARQ-APOIO-01 · F1 (autor, 2026-09-15; AP-1, AP-3, AP-10) — a decisão médica registrada no alerta do portão.
 *
 * O alerta é do sistema; a decisão é do médico. Registrar sem médico responsável ⛔ grava e diz o que falta; com médico e
 * CRM/UF, grava a decisão e o alerta ⛔ some — o estado derivado ⛔ é reescrito pela decisão.
 */

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

test.describe("AVC · ARQ-APOIO-01 · decisão médica no portão", () => {
  test("suspeita de HSA: alerta clínico, registro com médico e CRM, e o alerta do sistema continua", async ({ page }) => {
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
    await expect(page.getByTestId("avc-f-portao-categoria-suspeita_hsa")).toContainText("Alerta clínico");

    await page.getByTestId("avc-f-julgamento-suspeita_hsa-prosseguir").click();
    await page.getByTestId("avc-f-decisao-suspeita_hsa-registrar").click();
    await expect(page.getByTestId("avc-f-decisao-suspeita_hsa-falta"), "⛔ gravou sem médico responsável").toContainText("Médico responsável");
    await expect(page.getByTestId("avc-f-decisao-suspeita_hsa-vigente")).toHaveCount(0);

    await page.getByTestId("avc-f-decisao-suspeita_hsa-decisao_medico_responsavel").fill("Dra. Teste");
    await page.getByTestId("avc-f-decisao-suspeita_hsa-decisao_registro_profissional").fill("CRM 12345/SP");
    await page.getByTestId("avc-f-decisao-suspeita_hsa-registrar").click();

    await expect(page.getByTestId("avc-f-decisao-suspeita_hsa-vigente")).toContainText("Decisão médica registrada");
    await expect(page.getByTestId("avc-f-decisao-suspeita_hsa-vigente")).toContainText("Dra. Teste");
    await expect(motivo, "⛔ a decisão apagou o alerta derivado pelo sistema").toBeVisible();
  });
});
