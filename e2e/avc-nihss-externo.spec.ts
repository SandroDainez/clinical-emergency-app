import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-PEND-14 · NIHSS INFORMADO POR OUTRO SERVIÇO É CONTEXTO, NUNCA CRITÉRIO.
 *
 * Decisão do autor (2026-09-13, `docs/decisoes.md`): o app pergunta se houve itens
 * não testáveis; salvo "não, escala completa", o escore externo aparece só na
 * síntese. Toda regra consome apenas o NIHSS basal feito neste atendimento (a parte
 * de regra é provada em `scripts/prova-avc-nihss-criterios.cjs`).
 */

async function abrirNeurologico(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-neurologico").click();
}

/** ⚠️ O gesto real do NIHSS de fora — o mesmo de `e2e/avc-fase9-trombectomia.spec.ts`. */
async function nihssDeFora(page: Page, quantos: number) {
  if (await page.getByTestId("avc-num-mais-nihss_informado").count() === 0) {
    await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
  }
  let falta = quantos;
  if (falta >= 10) {
    /** ⚠️ Campo vazio: os degraus ficam inertes (achado do autor, 2026-09-13) — as dezenas entram digitadas. */
    const caixa = page.getByTestId("avc-num-caixa-nihss_informado");
    await caixa.fill(String(falta - (falta % 10)));
    await caixa.blur();
    falta %= 10;
  }
  if (falta > 0 && quantos < 10) {
    await page.getByTestId("avc-grandeza-zero-nihss_informado").click();
  }
  for (let i = 0; i < falta; i += 1) {
    await page.getByTestId("avc-num-mais-nihss_informado").click();
  }
}

test.describe("AVC · NIHSS de outro serviço (D-PEND-14)", () => {
  test("o escore de fora vem com a pergunta: houve itens não testáveis?", async ({ page }) => {
    await abrirNeurologico(page);
    await nihssDeFora(page, 14);
    await expect(page.getByTestId("avc-campo-nihss_informado_nao_testaveis")).toBeVisible();
  });

  test("⛔ sem «Não, escala completa», o escore de fora ⛔ não aparece fora da síntese", async ({ page }) => {
    await abrirNeurologico(page);
    await nihssDeFora(page, 14);
    /**
     * ⚠️ Sem nenhum sinal com valor, a peça ⛔ nem é desenhada — então a prova é pela
     * contagem: ⛔ nenhuma peça NIHSS com 14. O controle positivo é o teste seguinte.
     */
    await expect(page.locator('[data-testid="avc-vital-nihss"]', { hasText: "14" })).toHaveCount(0);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-superficie-destino")).toContainText(/NIHSS[^0-9]{0,60}14/);
  });

  test("com «Não, escala completa», o escore de fora aparece como contexto", async ({ page }) => {
    await abrirNeurologico(page);
    await nihssDeFora(page, 14);
    await page.getByTestId("avc-opcao-nihss_informado_nao_testaveis-Não, escala completa").click();
    await expect(page.getByTestId("avc-vital-nihss")).toContainText("14");
  });
});
