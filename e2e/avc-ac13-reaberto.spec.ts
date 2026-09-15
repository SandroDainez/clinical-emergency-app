/**
 * AC-13 REABERTO (autor, 2026-09-14; `docs/decisoes.md`, seção "AC-13 reaberto"), pelo gesto do médico.
 *
 * Item 1: «Não sei» na situação da trombólise não pode aparecer como "sem trombólise". A tela declara
 * a exposição desconhecida e preserva a conduta atual: a conduta final diante dela ainda não foi decidida.
 */
import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

async function tromboliseCom(page: Page, ...rotulos: string[]) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  for (const r of rotulos) await page.getByTestId(`avc-opcao-ivt_estado-${r}`).click();
}

test.describe("AVC · AC-13 reaberto · item 1 · exposição desconhecida", () => {
  test("«Não sei» → o Destino declara a exposição desconhecida, sem monitorização nem ordem pós-trombólise", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-situacao-trombolise-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
    await expect(page.getByTestId("avc-g-antitrombotico-ordem")).toHaveCount(0);
  });

  test("«Iniciada» e depois «Não sei» → continua exposta: a monitorização pós-trombólise aparece", async ({ page }) => {
    await tromboliseCom(page, "Iniciada", "nao_sei");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toHaveCount(0);
  });

  test("«Não sei» com o portão fechado → a Reperfusão declara a situação desconhecida", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await expect(page.getByTestId("avc-f-exposicao-desconhecida")).toBeVisible();
  });

  test("«Não sei» com PA acima da meta → os alvos pressóricos declaram a exposição desconhecida", async ({ page }) => {
    await tromboliseCom(page, "nao_sei");
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    for (const [id, v] of [["pas", "200"], ["pad", "120"]] as const) {
      const c = page.getByTestId(`avc-num-caixa-${id}`);
      await c.fill(v);
      await c.blur();
    }
    await expect(page.getByTestId("avc-a-alvos-exposicao-desconhecida")).toBeVisible();
  });
});

test.describe("AVC · AC-13 reaberto · item 2 · a trilha fiel", () => {
  test("«Iniciada» e «Limpar» → a trilha mostra a limpeza, nenhuma situação vigente, e a exposição continua", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-limpar-ivt_estado").click();
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("Iniciada");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText("Campo limpo");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1")).not.toContainText("situação vigente");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
  });

  test("«Iniciada» e «Foi engano — corrigir» na trilha → o registro fica invalidado e o Destino declara a exposição desconhecida", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await page.getByTestId("avc-transicoes-corrigir-trombolise_iv_1-0").click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("invalidado por correção");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toContainText("registrado por engano");
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1")).not.toContainText("situação vigente");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-exposicao-desconhecida")).toBeVisible();
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
  });

  test("«Manter o registro» no diálogo ⛔ muda nada", async ({ page }) => {
    await tromboliseCom(page, "Iniciada");
    await page.getByTestId("avc-transicoes-abrir-trombolise_iv_1").click();
    await page.getByTestId("avc-transicoes-corrigir-trombolise_iv_1-0").click();
    await page.getByTestId("avc-confirmar-engano-manter").click();
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-1")).toHaveCount(0);
    await expect(page.getByTestId("avc-transicoes-trombolise_iv_1-0")).toContainText("situação vigente");
  });
});
