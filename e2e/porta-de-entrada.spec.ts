import { expect, test } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * ⚠️⚠️ A PORTA DE ENTRADA, MEDIDA ⛔ NA SUÍTE QUE ⛔ SEMPRE RODA.
 *
 * ⛔ `e2e/conta-de-teste.setup.ts` depende destes quatro `testID` para
 * autenticar em produção. ⛔ Mas ⛔ ele ⛔ **⛔ só roda** ⛔ quando há credencial
 * no ambiente — ⛔ ou seja, ⛔ quase nunca. ⛔ Se um `testID` sumisse num
 * refactor, ⛔ o defeito ⛔ ficaria dormindo ⛔ até ⛔ o dia ⛔ do deploy, ⛔ e
 * apareceria ⛔ como ⛔ « timeout no login » — ⛔ longe da causa.
 *
 * ⚠️ Aqui eles são medidos ⛔ a cada `test:all`, ⛔ contra o `dist` de teste,
 * ⛔ **⛔ sem** Supabase ⛔ e ⛔ **⛔ sem** ⛔ credencial nenhuma: a tela de
 * entrada é rota pública, ⛔ e a recusa por campo vazio ⛔ acontece ⛔ antes
 * ⛔ de qualquer chamada de rede.
 */
test.describe("Porta de entrada · os seletores da validação autenticada", () => {
  test("a landing, o formulário e o erro são alcançáveis ⛔ por `testID`",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/");

      /**
       * ⚠️ ⛔ « Entrar » aparece ⛔ duas vezes ⛔ na landing ⛔ e muda ⛔ em
       * espanhol — ⛔ por isso ⛔ o alvo ⛔ é o `testID`, ⛔ e ⛔ não o texto.
       */
      await page.getByTestId("intro-entrar").click();

      await expect(page.getByTestId("entrada-email")).toBeVisible();
      await expect(page.getByTestId("entrada-senha")).toBeVisible();
      await expect(page.getByTestId("entrada-enviar")).toBeVisible();

      /**
       * ⚠️⚠️ ⛔ E O ERRO TEM QUE ⛔ **⛔ APARECER**: ⛔ é ⛔ nele que o setup
       * lê ⛔ « conta pendente » ⛔ em vez de estourar ⛔ por timeout ⛔ e
       * ⛔ esconder ⛔ a causa.
       */
      await page.getByTestId("entrada-enviar").click();
      await expect(page.getByTestId("entrada-erro")).toBeVisible();
    });

  test("⛔ entrar ⛔ não some da tela ⛔ quando o idioma é espanhol",
    async ({ page }) => {
      await fixarIdioma(page, "es-419");
      await page.goto("/");
      await page.getByTestId("intro-entrar").click();
      await expect(page.getByTestId("entrada-email")).toBeVisible();
      await expect(page.getByTestId("entrada-enviar")).toBeVisible();
    });
});
