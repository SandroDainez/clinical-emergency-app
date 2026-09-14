import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * 19ª rodada (autor, 2026-09-14; `docs/decisoes.md`, C7 ⛔ D8): o julgamento registrado no motivo do portão da IVT.
 * ⚠️ O gesto real: DOAC com hora da última dose desconhecida → «Não prosseguir» → o portão nomeia a DECISÃO
 * (⛔ contraindicação) → «Prosseguir» é novo registro ⛔ e retira ⛔ só o motivo do DOAC.
 */

async function doacSemHora(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
  await page.getByTestId("avc-item-anticoagulante_em_uso-Anticoagulante oral direto (DOAC)").click();
  await page.getByTestId("avc-hora-desconhecido-doac_ultima_dose").click();
  await page.getByTestId("avc-aba-reperfusao").click();
  await expect(page.getByTestId("avc-f-portao-motivo-doac")).toBeVisible();
}

test.describe("AVC · 19ª rodada · julgamento registrado no portão da IVT", () => {
  test("DOAC: «Não prosseguir» nomeia a decisão; «Prosseguir» é novo registro e retira o motivo", async ({ page }) => {
    await doacSemHora(page);
    const naoProsseguir = page.getByTestId("avc-f-julgamento-doac-nao-prosseguir");
    await naoProsseguir.scrollIntoViewIfNeeded();
    /**
     * ⚠️ Revisão das capturas a 375 px (antes do commit): em PT, «Prosseguir» dividia a linha com o rótulo e
     * «Não prosseguir» caía sozinho na linha de baixo. Os dois gestos da mesma decisão ficam lado a lado.
     */
    const caixaSim = await page.getByTestId("avc-f-julgamento-doac-prosseguir").boundingBox();
    const caixaNao = await naoProsseguir.boundingBox();
    expect(Math.abs((caixaSim?.y ?? 0) - (caixaNao?.y ?? -100)), "os dois gestos na mesma linha").toBeLessThan(4);
    await naoProsseguir.click();

    const estado = page.getByTestId("avc-f-portao-estado-decisao_de_nao_prosseguir");
    await expect(estado).toContainText("Decisão clínica registrada: não prosseguir com a trombólise");
    await expect(estado, "⛔ a decisão ⛔ é contraindicação").not.toContainText(/contraindica/i);
    await expect(page.getByTestId("avc-f-portao-dado-doac")).toContainText("Decisão clínica registrada: não prosseguir");

    await page.getByTestId("avc-f-julgamento-doac-prosseguir").click();
    await expect(page.getByTestId("avc-f-portao-motivo-doac")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-portao-estado-decisao_de_nao_prosseguir")).toHaveCount(0);
  });

  /**
   * ⚠️ Decisão do autor (2026-09-14, conclusão do D-139-3, itens 2 ⛔ 3): «não prosseguir» vigente é o motivo principal
   * (a TC ⛔ registrada segue como adicional); decisão vigente + autor + data/hora na trilha expansível, ⛔ no card.
   */
  test("«não prosseguir» vigente é o motivo principal; a trilha mostra decisão, autor e data/hora", async ({ page }) => {
    await doacSemHora(page);
    await page.getByTestId("avc-f-julgamento-doac-nao-prosseguir").click();
    const motivos = page.locator('[data-testid^="avc-f-portao-motivo-"]');
    await expect(motivos.first()).toHaveAttribute("data-testid", "avc-f-portao-motivo-doac");
    expect(await motivos.count(), "os outros motivos continuam visíveis").toBeGreaterThan(1);

    const abrir = page.getByTestId("avc-f-julgamentos-abrir");
    await abrir.scrollIntoViewIfNeeded();
    await abrir.click();
    const primeiro = page.getByTestId("avc-f-julgamentos-0");
    await expect(primeiro).toContainText("Não prosseguir");
    await expect(primeiro).toContainText("decisão vigente");
    await expect(primeiro).toContainText(/\d{2}\/\d{2} \d{2}:\d{2}/);
    await expect(primeiro).toContainText("registrado neste aparelho, sem conta");

    await page.getByTestId("avc-f-julgamento-doac-prosseguir").click();
    const segundo = page.getByTestId("avc-f-julgamentos-1");
    await expect(segundo).toContainText("Prosseguir");
    await expect(segundo).toContainText("decisão vigente");
    await expect(primeiro, "⛔ sobrescrita: o registro anterior continua, ⛔ vigente").toContainText("Não prosseguir");
    await expect(primeiro).not.toContainText("decisão vigente");
    await expect(motivos.first()).not.toHaveAttribute("data-testid", "avc-f-portao-motivo-doac");
  });

  test("o motivo do DOAC mostra os dois gestos em espanhol", async ({ page }) => {
    await doacSemHora(page, "es-419");
    await expect(page.getByTestId("avc-f-julgamento-doac-prosseguir")).toHaveText("Continuar");
    await expect(page.getByTestId("avc-f-julgamento-doac-nao-prosseguir")).toHaveText("No continuar");
  });
});
