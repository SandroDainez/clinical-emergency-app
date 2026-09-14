import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * 18ª rodada (autor, 2026-09-14): documentos oficiais no lugar dos dossiês. Bula profissional Actilyse
 * (I23-01): tabela de dose por peso como conferência, duração do bolus nas duas posições rotuladas, frase
 * literal da HSA no ⓘ, janela estendida com a posição da bula ao lado da diretriz.
 * ⛔ Nenhuma divergência é resolvida pela tela: as duas posições aparecem, rotuladas.
 */

async function doseCom(page: Page, agente: "Tenecteplase" | "Alteplase", kg: number, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-paciente").click();
  await page.getByTestId("avc-num-caixa-peso").fill(String(kg));
  await page.getByTestId("avc-num-caixa-peso").blur();
  await page.getByTestId("avc-opcao-peso_origem-Estimado pela equipe").click();
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId(`avc-f-agente-${agente}`).click();
  await expect(page.getByTestId("avc-f-dose-valor")).toBeVisible();
}

test.describe("AVC · 18ª rodada · bula Actilyse × diretriz", () => {
  test("alteplase 70 kg: tabela da bula como conferência (63,0 · 6,3 · 56,7), só mg, rotulada", async ({ page }) => {
    await doseCom(page, "Alteplase", 70);
    const bula = page.getByTestId("avc-f-dose-bula");
    await bula.scrollIntoViewIfNeeded();
    await expect(bula).toContainText("tabela da bula, para conferência — não é a dose a preparar");
    await expect(bula).toContainText("63,0 mg");
    await expect(bula).toContainText("6,3 mg");
    await expect(bula).toContainText("56,7 mg");
    await expect(bula, "⛔ mL na conferência lê como dose a preparar").not.toContainText("mL");
    await expect(page.getByTestId("avc-f-dose-valor"), "a dose continua a exata").toContainText("63 mg");
  });

  test("alteplase 71 kg: a tabela da bula não traz a linha — nada interpolado", async ({ page }) => {
    await doseCom(page, "Alteplase", 71);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("63,9 mg");
    const bula = page.getByTestId("avc-f-dose-bula");
    await expect(bula).toContainText("A tabela da bula não traz 71 kg");
    await expect(bula).not.toContainText(/63,[0-9] mg/);
  });

  test("duração do bolus: diretriz (1 min) × bula brasileira (sem duração na posologia do AVC), rotuladas", async ({ page }) => {
    await doseCom(page, "Alteplase", 70);
    await expect(page.getByTestId("avc-f-dose-bolus-diretriz")).toContainText("Diretriz AHA/ASA 2026");
    await expect(page.getByTestId("avc-f-dose-bolus-diretriz")).toContainText("1 min");
    await expect(page.getByTestId("avc-f-dose-bolus-bula")).toContainText("Bula brasileira");
    await expect(page.getByTestId("avc-f-dose-bolus-bula")).toContainText("sem duração");
  });

  test("tenecteplase 70 kg: sem tabela da alteplase", async ({ page }) => {
    await doseCom(page, "Tenecteplase", 70);
    await expect(page.getByTestId("avc-f-dose-bula")).toHaveCount(0);
  });

  test("HSA suspeita: a retenção cita a bula no ⓘ, com a frase literal e a página", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/modulos/avc");
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-imagem").click();
    for (let i = 0; i < 20; i++) {
      const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
      if ((await fechado.count()) === 0) break;
      await fechado.first().click();
    }
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    await page.getByTestId("avc-aba-reperfusao").click();
    /** ⚠️ Ajuste de instrumento (vermelho da 18ª rodada): o ⓘ é o do motivo da HSA (`suspeita_hsa`), ⛔ o primeiro do portão. */
    const info = page.getByTestId("avc-info-portao-suspeita_hsa");
    await info.scrollIntoViewIfNeeded();
    await info.click();
    const texto = page.getByTestId("avc-info-texto-portao-suspeita_hsa");
    await expect(texto).toContainText("incluindo hemorragia subaracnóidea");
    await expect(texto).toContainText("Actilyse");
    await expect(texto).toContainText("p. 4");
    await expect(page.locator("body"), "⛔ procedência antiga").not.toContainText("trecho não transcrito");
  });

  test("ES · conferência da bula em espanhol", async ({ page }) => {
    await doseCom(page, "Alteplase", 70, "es-419");
    await expect(page.getByTestId("avc-f-dose-bula")).toContainText("63,0 mg");
    await expect(page.getByTestId("avc-f-dose-bula")).toContainText("tabla del prospecto, para verificación — no es la dosis a preparar");
  });
});
