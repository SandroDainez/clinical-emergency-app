import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, preencherNihssComSoma, responderPopulacaoAdulta } from "./helpers";

/**
 * 16ª rodada (autor, 2026-09-13): AC-95 (uma fonte de verdade para as condutas de hemorragia),
 * AC-98, AC-91, AC-92 ⛔ textos. ⛔ Nenhum conteúdo clínico novo: o gesto real ⛔ a palavra exibida.
 * ⚠️ A procedência fora do card é medida em `e2e/avc-procedencia-fora-do-card.spec.ts` (ampliada).
 */

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function tc(page: Page, resultado: string) {
  await page.getByTestId("avc-aba-imagem").click();
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
  await informarHora(page, "estudo_hora");
  await page.getByTestId(`avc-opcao-estudo_resultado-${resultado}`).click();
}

test.describe("AVC · 16ª rodada · uma fonte de verdade ⛔ travas", () => {
  test("AC-95: a mesma conduta tem o mesmo estado no catálogo ⛔ no caminho hemorrágico", async ({ page }) => {
    await abrir(page);
    await tc(page, "Hemorragia intracraniana identificada");
    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-opcao-hem_tipo-Intraparenquimatosa").click();
    const noCaminho = page.getByTestId("avc-hem-item-hic-pa_alvo");
    await noCaminho.scrollIntoViewIfNeeded();
    await expect(noCaminho).toContainText("Pode ser considerado");
    await expect(page.getByTestId("avc-hem-item-hic-pa_titulacao")).toContainText("conteúdo pendente de validação");
    await expect(page.getByTestId("avc-hem-item-hic-reversao-vka")).toContainText("conteúdo pendente de validação");
    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-destino-abrir-hemorragia_intracraniana").click();
    await expect(page.getByTestId("avc-hem-rec-pa_alvo")).toContainText("Pode ser considerado");
    await expect(page.getByTestId("avc-hem-rec-pa_titulacao")).toContainText("conteúdo pendente de validação");
    await expect(page.getByTestId("avc-hem-reversao-vka")).toContainText("conteúdo pendente de validação");
    await expect(page.getByTestId("avc-hem-reversao-vka"), "⛔ dose da figura 2 visível com item pendente").not.toContainText(/UI\/kg/);
  });

  test("AC-98: o motivo diz «Centro de referência recusou»", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-f-desfechos").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Centro de referência recusou")).toBeVisible();
    await expect(page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Recusada")).toHaveCount(0);
  });

  test("AC-91: via aérea com sedação não registrada + exame → pendência visível para liberar o basal", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-chamar-modulo-via_aerea").click();
    await page.getByTestId("avc-va-va_avancada-sim").click();
    await page.getByTestId("avc-va-va_tipo-Intubação orotraqueal").click();
    await page.getByTestId("avc-va-hora-agora").click();
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-modulo-voltar").click();
    await page.getByTestId("avc-aba-neurologico").click();
    await preencherNihssComSoma(page, 6);
    await expect(page.getByTestId("avc-b-exames-nihss")).toContainText("Sedação não registrada — informe para liberar o exame como basal");
  });

  test("AC-92: TC sem hemorragia, sem plano aberto → «Nada por via oral» no cabeçalho", async ({ page }) => {
    await abrir(page);
    await expect(page.getByTestId("avc-trava-via-oral"), "⛔ trava antes do caminho definido").toHaveCount(0);
    await tc(page, "Sem hemorragia intracraniana identificada");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-sem-evento"), "⛔ o plano abriu").toBeVisible();
    await expect(page.getByTestId("avc-trava-via-oral")).toContainText("Nada por via oral");
  });

  test("textos: «1 registro de conduta externa» (⛔ «registro(s)») ⛔ pendências do caminho sem prefixo", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-chamar-modulo-via_aerea").click();
    await page.getByTestId("avc-va-va_avancada-sim").click();
    await page.getByTestId("avc-va-registrar").click();
    await page.getByTestId("avc-modulo-voltar").click();
    await expect(page.getByTestId("avc-retorno-modulo")).toContainText("1 registro de conduta externa");
    await expect(page.getByTestId("avc-retorno-modulo")).not.toContainText("registro(s)");

    await tc(page, "Hemorragia intracraniana identificada");
    await page.getByTestId("avc-aba-destino").click();
    const caminho = page.getByTestId("avc-hem-caminho");
    await expect(caminho.locator('[data-testid^="avc-hem-pendencia-"]').first()).toBeVisible();
    for (const t of await caminho.locator('[data-testid^="avc-hem-pendencia-"]').allInnerTexts()) {
      expect(t, "⛔ prefixo redundante dentro do caminho").not.toMatch(/^Caminho hemorrágico:/);
    }
  });

  test("ES · motivo e trava em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    /** ⚠️ O id da opção usa o valor gravado (PT); o texto na tela é ES. */
    await tc(page, "Sem hemorragia intracraniana identificada");
    await expect(page.getByTestId("avc-trava-via-oral")).toContainText("Nada por vía oral");
  });
});
