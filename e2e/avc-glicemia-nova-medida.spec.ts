import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * ⚠️⚠️⚠️ A NOVA GLICEMIA É UMA MEDIDA NOVA — D-133, 2026-09-10.
 *
 * ⛔ ⛔ `F-06` manda tratar abaixo de 60, ⛔ e a ação de correção declara que o
 * bloqueio cai por *"Uma nova glicemia"*. ⛔ Só que o campo ⛔ **⛔ não tinha
 * instância**: ⛔ « nova glicemia » ⛔ e ⛔ « corrigir a glicemia » ⛔ eram ⛔ **⛔ o
 * mesmo gesto**, ⛔ e ⛔ o app ⛔ destravaria ⛔ a trombólise ⛔ sobre um número
 * ⛔ que ⛔ **⛔ apagou** ⛔ o 38 ⛔ que ⛔ motivou ⛔ a correção.
 *
 * ⚠️ A trilha ⛔ é medida ⛔ em `scripts/prova-instancia-de-glicemia.cjs`; ⛔ aqui
 * ⛔ se mede ⛔ **⛔ o gesto do médico**.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
  const campos = page.getByTestId("avc-grupo-neurologico-inicial").locator('[data-testid^="avc-campo-"]');
  if ((await campos.count()) === 0) await page.getByTestId("avc-ameaca-glicemia").click();
}

const medir = async (page: Page, v: number) => {
  await page.getByTestId("avc-num-caixa-glicemia").fill(String(v));
  await page.getByTestId("avc-num-caixa-glicemia").blur();
};

test.describe("AVC · a nova glicemia é medida nova", () => {
  test("⛔ hipoglicemia: a reavaliação abre uma glicemia VAZIA, ⛔ e o ciclo fecha",
    async ({ page }) => {
      await abrir(page);
      await medir(page, 38);

      await page.getByTestId("avc-conduta-glicemia").click();
      await expect(page.getByTestId("avc-e-bloqueio-glicemia_alterada")).toBeVisible();
      await page.getByTestId("avc-e-nova-acao-glicemia_alterada").click();
      await page.getByText("Realizada", { exact: true }).first().click();

      /** ⚠️ ⛔ Tratado ⛔ ≠ resolvido: ⛔ o ciclo espera ⛔ a medida. */
      await expect(page.locator("body")).toContainText(/Falta: uma nova glicemia/i);

      await page.getByTestId("avc-e-reavaliar-glicemia_alterada").click();
      await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
      await expect(
        page.getByTestId("avc-num-caixa-glicemia"),
        "⛔ a reavaliação abriu sobre o 38: o médico é empurrado a CORRIGIR a " +
          "hipoglicemia que motivou a conduta, apagando-a da trilha"
      ).toHaveValue("");

      await medir(page, 96);
      await expect(page.locator("body")).not.toContainText(/tratar a hipoglicemia/i);
    });

  test("⛔ o botão de nova medida DIZ o que abre — ⛔ e ⛔ não fica solto acima do Glasgow",
    async ({ page }) => {
      await abrir(page);
      await medir(page, 250);

      /**
       * ⚠️⚠️ ⛔ D · Neurológico ⛔ tem ⛔ **⛔ Glasgow ⛔ e glicemia**. ⛔ Um botão
       * ⛔ « Nova medida » ⛔ genérico ⛔ ali ⛔ se lê ⛔ como ⛔ « novo Glasgow ».
       */
      const botao = page.getByTestId("avc-nova-medida-glicemia");
      await expect(botao).toBeVisible();
      await expect(botao).toContainText(/Nova glicemia/i);
      await expect(page.getByTestId("avc-nova-medida-neurologico-inicial")).toHaveCount(0);

      /** ⚠️ ⛔ E abrir uma nova ⛔ deixa a caixa vazia — ⛔ a anterior ⛔ não é editada. */
      await botao.click();
      await expect(page.getByTestId("avc-num-caixa-glicemia")).toHaveValue("");
    });

  test("⛔ hiperglicemia ⛔ NÃO ganha ciclo de correção — ⛔ ela ⛔ não bloqueia",
    async ({ page }) => {
      await abrir(page);
      await medir(page, 318);
      await page.getByTestId("avc-conduta-glicemia").click();

      /** ⚠️⚠️ ⛔ Instância ⛔ **⛔ não é** bloqueio: ⛔ F-06 ⛔ diz que a hiper ⛔ não trava. */
      await expect(page.getByTestId("avc-e-bloqueio-glicemia_alterada")).toHaveCount(0);
      await expect(page.getByTestId("avc-e-sem-bloqueio")).toBeVisible();
      /** ⚠️ ⛔ Mas ⛔ ela tem ⛔ caminho de volta: ⛔ pode ser remedida. */
      await expect(page.locator('[data-testid^="avc-e-reavaliar-enviado-"]')).toHaveCount(1);
    });
});
