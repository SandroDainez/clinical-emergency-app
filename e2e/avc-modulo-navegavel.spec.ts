import { expect, test } from "@playwright/test";

import { SUPERFICIES } from "../avc/conteudo/superficies";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o módulo AVC exista, abra pela sua rota própria, e seja
 *   NAVEGÁVEL entre as sete superfícies em qualquer ordem — sem árvore linear.
 *   Mede também o resumo persistente, as pendências acionáveis e o espanhol.
 *
 * ⛔ NÃO mede medicina: o esqueleto não tem regra clínica, e um teste que
 * afirmasse conduta aqui estaria medindo o que não existe.
 *
 * ⚠️ A trava mais importante deste arquivo é a ÚLTIMA: navegar entre superfícies
 * não pode registrar ação clínica nenhuma (E-20). É a que protege o módulo do
 * defeito que a spec nomeia.
 */
test.describe("Módulo AVC — esqueleto navegável", () => {
  test("abre pela rota própria, com cabeçalho e saída", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await expect(page.getByText("AVC isquêmico agudo").first()).toBeVisible();
    // I7: a tela desenha o próprio cabeçalho, e ele tem volta.
    await expect(page.getByRole("button", { name: "Voltar" })).toBeVisible();
  });

  test("as sete superfícies abrem em qualquer ordem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ Ordem deliberadamente EMBARALHADA: se houvesse árvore linear, abrir G
    // antes de B falharia. É exatamente isso que a trava mede (§7.2, E-11).
    const ordem = ["G", "B", "E", "A", "D", "C", "F"] as const;
    for (const id of ordem) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
    }

    expect(SUPERFICIES.length).toBe(7);
  });

  test("o resumo persistente acompanha todas as superfícies", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
      // ⚠️ O resumo é persistente porque o RELÓGIO é o único valor que muda
      // sozinho: escondê-lo numa superfície faria o médico trabalhar noutra sem
      // vê-lo correr (§7.8).
      await expect(page.getByTestId("avc-resumo")).toBeVisible();
    }
  });

  test("pendência é acionável de qualquer superfície e leva à sua dona", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // Abre uma superfície que NÃO é a dona da pendência...
    await page.getByTestId("avc-aba-G").click();
    await expect(page.getByTestId("avc-superficie-G")).toBeVisible();

    // ...e a pendência continua visível e acionável dali (E-07).
    const pendencia = page.getByTestId("avc-pendencia-tc_realizada");
    await expect(pendencia).toBeVisible();
    await pendencia.click();

    // A dona de `tc_realizada` é a superfície C.
    await expect(page.getByTestId("avc-superficie-C")).toBeVisible();
  });

  test("o módulo fala espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await expect(page.getByText("ACV isquémico agudo").first()).toBeVisible();
    await page.getByTestId("avc-aba-C").click();
    await expect(page.getByText("Imagen").first()).toBeVisible();
    // ⛔ Nenhum texto clínico visível pode ficar em português com ES ativo.
    await expect(page.getByText("Superfície em construção")).toHaveCount(0);
  });

  test("navegar entre superfícies não registra ação clínica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ E-20: percorrer TODAS as superfícies não pode mudar nada — as pendências
    // continuam exatamente as mesmas, porque navegação não é fato clínico.
    const antes = await page.getByTestId("avc-pendencias").innerText();
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
    }
    const depois = await page.getByTestId("avc-pendencias").innerText();
    expect(depois).toBe(antes);
  });
});
