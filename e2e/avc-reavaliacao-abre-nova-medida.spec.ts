import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * ⚠️⚠️⚠️ « REGISTRAR UMA NOVA AFERIÇÃO » ⛔ ABRE A AFERIÇÃO — 2026-09-10.
 *
 * ── ⛔ O DEFEITO, RELATADO E MEDIDO ────────────────────────────────────────
 *
 * ⛔ Relato do autor: *"mesmo após eu colocar que foi realizada, a ação
 * permanece para correção; ⛔ deveria ter um novo lugar para adicionar a
 * pressão após a correção, ⛔ aí o app identificaria que corrigi."*
 *
 * ⛔ ⛔ Medido: ⛔ o botão levava à Estabilização ⛔ e ⛔ parava ali — ⛔ o médico
 * ⛔ encontrava a caixa ⛔ com ⛔ **⛔ 183**, ⛔ o valor ⛔ que motivou a conduta,
 * ⛔ e ⛔ « Nova medida » ⛔ e ⛔ « Corrigir » ⛔ lado a lado.
 *
 * ⚠️⚠️ ⛔ E ⛔ « Corrigir » ⛔ ali ⛔ **⛔ corrompe a trilha**: ⛔ reescreve ⛔ a
 * aferição original, ⛔ fazendo o caso dizer ⛔ que a PA ⛔ **⛔ sempre foi**
 * ⛔ 168. ⛔ O portão destravaria ⛔ sobre ⛔ uma história ⛔ que ⛔ não aconteceu.
 *
 * ⚠️ Decisão do autor: *"«Corrigir» continua existindo ⛔ apenas para erro de
 * digitação/registro, ⛔ não como caminho de reavaliação após tratamento."*
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

async function medir(page: Page, campo: string, valor: number) {
  await page.getByTestId(`avc-num-caixa-${campo}`).fill(String(valor));
  await page.getByTestId(`avc-num-caixa-${campo}`).blur();
}

async function abrirEixo(page: Page, eixo: string, grupo: string) {
  const campos = page.getByTestId(`avc-grupo-${grupo}`).locator('[data-testid^="avc-campo-"]');
  if ((await campos.count()) === 0) await page.getByTestId(`avc-ameaca-${eixo}`).click();
}

test.describe("AVC · a reavaliação abre uma nova aferição", () => {
  test("⛔ depois da conduta, o médico chega numa aferição VAZIA — ⛔ e ⛔ não no valor velho",
    async ({ page }) => {
      await abrir(page);
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixo(page, "pressao", "pressao");
      await medir(page, "pas", 183);
      await medir(page, "pad", 111);

      /** ⚠️ O caminho do médico: o problema leva às Correções. */
      await page.getByText(/Abrir Correções/i).first().click();
      await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
      await page.getByText("Realizada", { exact: true }).first().click();

      /** ⚠️⚠️ ⛔ O ciclo ⛔ **⛔ não** fecha ⛔ com a ação: ⛔ tratado ⛔ ≠ resolvido. */
      await expect(page.locator("body")).toContainText(/Falta: uma nova aferição/i);

      await page.getByTestId("avc-e-reavaliar-pressao_acima_da_meta").click();
      await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();

      /**
       * ⚠️⚠️⚠️ ⛔ A INVARIANTE: ⛔ a caixa chega ⛔ **⛔ vazia**. ⛔ Encontrar o
       * ⛔ 183 ⛔ ali ⛔ é ⛔ o defeito ⛔ — ⛔ significa ⛔ que o app ⛔ ofereceu
       * ⛔ o gesto de ⛔ **⛔ corrigir** ⛔ onde ⛔ pediu ⛔ uma ⛔ **⛔ nova medida**.
       */
      await expect(
        page.getByTestId("avc-num-caixa-pas"),
        "⛔ a reavaliação abriu sobre o valor anterior: o médico é empurrado a CORRIGIR " +
          "a aferição que motivou a conduta, apagando-a da trilha"
      ).toHaveValue("");
      await expect(page.getByTestId("avc-num-caixa-pad")).toHaveValue("");
    });

  test("⛔ registrada a nova aferição dentro da meta, o ciclo fecha",
    async ({ page }) => {
      await abrir(page);
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixo(page, "pressao", "pressao");
      await medir(page, "pas", 183);
      await medir(page, "pad", 111);
      await page.getByText(/Abrir Correções/i).first().click();
      await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
      await page.getByText("Realizada", { exact: true }).first().click();
      await page.getByTestId("avc-e-reavaliar-pressao_acima_da_meta").click();

      await medir(page, "pas", 168);
      await medir(page, "pad", 92);

      /** ⚠️ ⛔ E ⛔ só ⛔ **⛔ agora** ⛔ a recomendação sai da tela. */
      await expect(page.locator("body")).not.toContainText(
        /Recomendação: controlar a pressão arterial/i
      );
      await expect(page.locator("body")).not.toContainText(/Falta: uma nova aferição/i);
    });
});
