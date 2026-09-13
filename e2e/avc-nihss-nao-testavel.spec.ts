import { expect, test, type Page } from "@playwright/test";

import { ITENS_NIHSS } from "../avc/conteudo/nihss";
import { fixarIdioma } from "./helpers";

/**
 * AC-01 · NIHSS — item NÃO TESTÁVEL (UN), pelo gesto do médico.
 *
 * Fonte: `protocols/fontes-verbatim/nih-nihss-2024.md` (NINDS, fev. 2024):
 * 5a/5b/6a/6b/7 aceitam UN por amputação ou fusão articular; 10 aceita UN por
 * intubação ou outra barreira física; cada UN com explicação escrita.
 * Decisão do autor (2026-09-13): UN fora da soma; total dito como
 * "X, com N itens não testáveis".
 */

const ACEITAM_UN = ["5a", "5b", "6a", "6b", "7", "10"];

async function abrirEscala(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-neurologico").click();
  await page.getByTestId("avc-escala-abrir-nihss_calculado").click();
  await expect(page.getByTestId("avc-escala-nihss_calculado")).toBeVisible();
}

test.describe("AVC · NIHSS — item não testável", () => {
  test("⛔ o item 10 ⛔ não pontua intubação como 2, ⛔ e oferece «Não testável»", async ({ page }) => {
    await abrirEscala(page);
    await expect(page.getByTestId("avc-escala-opcao-10-2")).not.toContainText(/intubad/i);
    await expect(page.getByTestId("avc-escala-opcao-10-UN")).toBeVisible();
  });

  test("UN existe em 5a, 5b, 6a, 6b, 7 e 10 ⛔ e só neles", async ({ page }) => {
    await abrirEscala(page);
    for (const item of ITENS_NIHSS) {
      const un = page.getByTestId(`avc-escala-opcao-${item.id}-UN`);
      if (ACEITAM_UN.includes(item.id)) await expect(un, `${item.id} deveria aceitar UN`).toBeVisible();
      else await expect(un, `${item.id} ⛔ não aceita UN`).toHaveCount(0);
    }
  });

  test("⛔ UN sem justificativa ⛔ não confirma; escrita, confirma", async ({ page }) => {
    await abrirEscala(page);
    for (const item of ITENS_NIHSS) {
      await page.getByTestId(`avc-escala-opcao-${item.id}-${item.id === "10" ? "UN" : 0}`).click();
    }
    const confirmar = page.getByTestId("avc-escala-confirmar-nihss_calculado");
    await expect(confirmar).toHaveAttribute("aria-disabled", "true");

    await page.getByTestId("avc-escala-justificativa-10").fill("   ");
    await expect(confirmar).toHaveAttribute("aria-disabled", "true");

    await page.getByTestId("avc-escala-justificativa-10").fill("Intubação orotraqueal");
    /**
     * ⚠️ O react-native-web só escreve `aria-disabled` quando é verdadeiro: habilitado,
     * o atributo ⛔ some. A prova é pelo efeito — o toque confirma e o total aparece.
     */
    await expect(confirmar).not.toHaveAttribute("aria-disabled", "true");
    await confirmar.click();
    await expect(page.getByTestId("avc-escala-valor-nihss_calculado")).toHaveText("0, com 1 item não testável");
  });

  test("o total com UN diz quantos itens ⛔ não foram testados, ⛔ nunca como total completo", async ({ page }) => {
    await abrirEscala(page);
    for (const item of ITENS_NIHSS) {
      await page.getByTestId(`avc-escala-opcao-${item.id}-${item.id === "10" ? "UN" : 1}`).click();
    }
    await page.getByTestId("avc-escala-justificativa-10").fill("Intubação orotraqueal");
    await page.getByTestId("avc-escala-confirmar-nihss_calculado").click();

    const valor = page.getByTestId("avc-escala-valor-nihss_calculado");
    await expect(valor).toHaveText("14, com 1 item não testável");
    await expect(valor).not.toHaveText("14");
  });

  test("a nota sobre itens não testáveis aparece ⛔ no campo do AVC", async ({ page }) => {
    await abrirEscala(page);
    await expect(page.getByTestId("avc-escala-nota-nao-testavel")).toBeVisible();
    await expect(page.getByTestId("avc-escala-nota-nao-testavel")).toContainText(/não testáve/i);
  });
});
