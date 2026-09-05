import { expect, test } from "@playwright/test";
import { CHAVE_CONSENTIMENTO, texto } from "./helpers";

/**
 * ⚠️⚠️ O ACEITE PRECEDE O CONTEÚDO CLÍNICO — e é isto que se prova aqui.
 *
 * O app calcula dose de trombolítico por peso. A landing convida ("Começar
 * agora"); esta tela cobra ciência ("Li e estou ciente"). ⛔ Sem a parede, um
 * link direto para `/modulos/avc` entregaria conduta a quem nunca leu de quem
 * é a decisão.
 *
 * ⛔ Estes testes NÃO usam `abrirModulo`/`fixarIdioma` de propósito: esses
 * helpers pré-aceitam o consentimento, que é justamente o que se quer medir.
 */
/**
 * ⛔ ANULA o `storageState` global do playwright.config: é esta suíte que mede a
 * parede, ⛔ e ela precisa chegar sem aceite nenhum.
 */
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Consentimento de uso", () => {
  test("um link direto para um módulo clínico bate na parede antes da conduta", async ({ page }) => {
    await page.goto("/modulos/avc");
    await expect(page.getByTestId("consentimento")).toBeVisible({ timeout: 30_000 });

    const t = await texto(page);
    expect(t, "o aceite tem de nomear quem decide").toContain("A decisão final é do profissional");
    expect(t, "o rótulo é de ciência, não de navegação").toContain("Li e estou ciente");
    expect(t, "conduta clínica não pode aparecer antes do aceite").not.toContain("mg/kg");
  });

  test("aceitar libera, e o aceite sobrevive ao reload", async ({ page }) => {
    await page.goto("/modulos/avc");
    await page.getByTestId("consentimento-aceitar").click();
    await expect(page.getByTestId("consentimento")).toBeHidden({ timeout: 15_000 });

    // O aceite ficou gravado sob a chave versionada.
    const gravado = await page.evaluate(
      (chave) => window.localStorage.getItem(chave as string),
      CHAVE_CONSENTIMENTO
    );
    expect(gravado, "o aceite deveria persistir").toBe("1");

    // E não reaparece no reload — senão viraria ruído a cada abertura.
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.getByTestId("consentimento")).toBeHidden();
  });

  test("versão nova do texto pede o aceite de novo", async ({ page }) => {
    // Aceite de uma versão ANTERIOR não vale para o texto atual.
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem("consentimento-clinico:2020-01-01", "1");
      } catch {
        /* modo privado */
      }
    });
    await page.goto("/modulos/avc");
    await expect(
      page.getByTestId("consentimento"),
      "aceite de outra versão não pode liberar o texto atual"
    ).toBeVisible({ timeout: 30_000 });
  });
});
