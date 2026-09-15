import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-PEND-18 (AC-44) e D-PEND-19 (AC-45), pelo gesto do médico.
 * Módulo: `scripts/prova-avc-decisoes-d18-d20.cjs`.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

test.describe("AVC · D-PEND-19 · segundo toque em opção marcada é ignorado", () => {
  test("escolha: o segundo toque ⛔ desmarca; «limpar» desmarca", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    const opcao = page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante");
    await opcao.click();
    await expect(opcao).toHaveAttribute("aria-checked", "true");

    await opcao.click();
    await expect(opcao, "o segundo toque desfez a escolha").toHaveAttribute("aria-checked", "true");

    await page.getByTestId("avc-limpar-incapacitante_assumido").click();
    await expect(opcao).toHaveAttribute("aria-checked", "false");
  });

  test("«Sem essa informação»: o segundo toque ⛔ desmarca; «limpar» desmarca", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    const semInfo = page.getByTestId("avc-hora-desconhecido-hora_inicio_observado");
    await semInfo.click();
    await expect(semInfo).toHaveAttribute("aria-checked", "true");

    await semInfo.click();
    await expect(semInfo, "o segundo toque desfez «Sem essa informação»").toHaveAttribute("aria-checked", "true");

    await page.getByTestId("avc-limpar-hora_inicio_observado").click();
    await expect(semInfo).toHaveAttribute("aria-checked", "false");
  });
});

test.describe("AVC · D-PEND-18 · temperatura no caminho isquêmico", () => {
  /**
   * ⚠️ Ajuste consciente (autor, 2026-09-15): a temperatura fica, mas ⛔ num eixo «E · Exposição» — mora em
   * «C · Circulação», junto de PAS, PAD ⛔ FC. ⛔ Sem corte na recomendação, 39 °C ⛔ acende nada.
   */
  test("a temperatura está em «C · Circulação», ⛔ e 39 °C ⛔ vira ameaça", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    const caixa = page.getByTestId("avc-grupo-pressao").getByTestId("avc-num-caixa-temperatura");
    await expect(caixa, "⛔ a temperatura ⛔ está em C").toBeVisible();
    await caixa.fill("39");
    await caixa.blur();
    await expect(page.getByTestId("avc-ameaca-exposicao"), "⛔ o eixo E voltou").toHaveCount(0);
    await expect(page.getByTestId("avc-ameaca-pressao"), "⛔ 39 °C sem corte na recomendação ⛔ não pode acender o cartão C").not.toContainText("39");
  });
});
