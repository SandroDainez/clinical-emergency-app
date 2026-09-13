import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * AC-29 · CALCULADORA AVULSA DE NIHSS — item NÃO TESTÁVEL (UN).
 *
 * Fonte: `protocols/fontes-verbatim/nih-nihss-2024.md` (NINDS, fev. 2024). A regra
 * mora em `lib/nihss.ts` e é a MESMA do módulo AVC (AC-01, `ec8f107`): UN só em
 * 5a/5b/6a/6b/7 (amputação ou fusão articular) e 10 (intubação ou outra barreira
 * física), com justificativa; UN fora da soma; total "X, com N itens não testáveis"
 * (decisão do autor, 2026-09-13).
 */

const ITENS = ["1a", "1b", "1c", "2", "3", "4", "5a", "5b", "6a", "6b", "7", "8", "9", "10", "11"];
const ACEITAM_UN = ["5a", "5b", "6a", "6b", "7", "10"];

async function abrirNihss(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/calculadoras-clinicas");
  await page.getByTestId("rail-simbolo-nihss").click();
  await expect(page.getByTestId("calc-opcao-nihss-10-0")).toBeVisible();
}

test.describe("Calculadora · NIHSS — item não testável", () => {
  test("⛔ item 10 com intubação ⛔ não recebe 2: a opção 2 não fala em intubação, e existe UN", async ({ page }) => {
    await abrirNihss(page);
    await expect(page.getByTestId("calc-opcao-nihss-10-2")).not.toContainText(/intubad/i);
    await expect(page.getByTestId("calc-opcao-nihss-10-UN")).toBeVisible();
  });

  test("UN existe nos mesmos itens do módulo AVC ⛔ e só neles", async ({ page }) => {
    await abrirNihss(page);
    for (const id of ITENS) {
      const un = page.getByTestId(`calc-opcao-nihss-${id}-UN`);
      if (ACEITAM_UN.includes(id)) await expect(un, `${id} deveria aceitar UN`).toBeVisible();
      else await expect(un, `${id} ⛔ não aceita UN`).toHaveCount(0);
    }
  });

  test("⛔ UN sem justificativa ⛔ não dá total; justificado, o total diz quantos ficaram fora", async ({ page }) => {
    await abrirNihss(page);
    await page.getByTestId("calc-opcao-nihss-10-UN").click();
    const total = page.getByTestId("calc-total-nihss");
    await expect(total).toContainText(/Falta justificar/i);

    await page.getByTestId("calc-justificativa-nihss-10").fill("Intubação orotraqueal");
    await expect(total).toHaveText("0, com 1 item não testável");
  });
});
