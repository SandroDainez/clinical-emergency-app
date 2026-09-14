import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * CARD DE DOSE (autor, 2026-09-13) — ⛔ duas doses completas. Com a seringa na mão,
 * "20 mg · 4 mL" é instrução. Uma dose só com mL; a faixa da Table 7 só em mg, menor,
 * rotulada "faixa da diretriz, para conferência — não é a dose a preparar"; "×" vira
 * "em vez de". D-PEND-25: alteplase 0,9 mg/kg exata, bolus de 10% em 1 min, restante em
 * 60 min, a 1 mg/mL. Contadores de Reperfusão em linguagem direta. "Mesma força" com
 * a frase literal e a página no ⓘ.
 */

async function doseCom(page: Page, agente: "Tenecteplase" | "Alteplase", kg: number) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-paciente").click();
  await page.getByTestId("avc-num-caixa-peso").fill(String(kg));
  await page.getByTestId("avc-num-caixa-peso").blur();
  await page.getByTestId("avc-opcao-peso_origem-Estimado pela equipe").click();
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId(`avc-f-agente-${agente}`).click();
  await expect(page.getByTestId("avc-f-dose-valor")).toBeVisible();
}

const fonte = (page: Page, id: string) => page.getByTestId(id).evaluate((el) => {
  const t = (el.querySelector("div,span") ?? el) as HTMLElement;
  return parseFloat(getComputedStyle(t).fontSize);
});

test.describe("AVC · card de dose · uma dose só", () => {
  test("tenecteplase 70 kg: 17,5 mg, sem volume (C5); conferência só em mg, menor, rotulada; «em vez de»", async ({ page }) => {
    await doseCom(page, "Tenecteplase", 70);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("17,5 mg");
    /** ⚠️ Ajuste consciente (19ª rodada, C5): sem bula brasileira de Metalyse 25 mg, a TNK ⛔ mostra volume. */
    await expect(page.getByTestId("avc-f-dose-volume")).toHaveCount(0);
    const t7 = page.getByTestId("avc-f-dose-table7");
    await expect(t7).toContainText("faixa da diretriz, para conferência — não é a dose a preparar");
    await expect(t7).toContainText("20 mg");
    await expect(t7, "⛔ a conferência mostra mL — lê como dose a preparar").not.toContainText("mL");
    await expect(page.getByTestId("avc-f-dose-table7-divergencia")).toContainText("em vez de");
    await expect(page.getByTestId("avc-f-dose")).not.toContainText("×");
    /** ⚠️ Ajuste consciente (C5): sem a linha do volume, a conferência é medida contra a linha da dose. */
    expect(await fonte(page, "avc-f-dose-table7"), "a conferência ⛔ é menor que a linha da dose").toBeLessThan(await fonte(page, "avc-f-dose-valor"));
  });

  test("alteplase 70 kg (D-PEND-25): 63 mg · 63,0 mL; bolus 6,3 mg/6,3 mL em 1 min; restante 56,7 mg/56,7 mL em 60 min", async ({ page }) => {
    await doseCom(page, "Alteplase", 70);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("63 mg");
    await expect(page.getByTestId("avc-f-dose-volume")).toContainText("63,0 mL");
    await expect(page.getByTestId("avc-f-dose-bolus")).toContainText("6,3 mg");
    await expect(page.getByTestId("avc-f-dose-bolus")).toContainText("6,3 mL");
    await expect(page.getByTestId("avc-f-dose-bolus")).toContainText("1 min");
    await expect(page.getByTestId("avc-f-dose-infusao")).toContainText("56,7 mg");
    await expect(page.getByTestId("avc-f-dose-infusao")).toContainText("56,7 mL");
    await expect(page.getByTestId("avc-f-dose-infusao")).toContainText("60 min");
  });

  test("alteplase 100 kg → 90 mg (bolus 9 mg · restante 81 mg); 120 kg → 90 mg (teto)", async ({ page }) => {
    await doseCom(page, "Alteplase", 100);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("90 mg");
    await expect(page.getByTestId("avc-f-dose-bolus")).toContainText("9 mg");
    await expect(page.getByTestId("avc-f-dose-infusao")).toContainText("81 mg");
    await page.getByTestId("avc-aba-paciente").click();
    await page.getByTestId("avc-num-caixa-peso").fill("120");
    await page.getByTestId("avc-num-caixa-peso").blur();
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("90 mg");
    await expect(page.getByTestId("avc-f-dose-volume")).toContainText("90,0 mL");
  });

  test("contadores de Reperfusão em linguagem direta; «mesma força» com literal e página no ⓘ", async ({ page }) => {
    await doseCom(page, "Tenecteplase", 70);
    for (const raia of ["avc-f-raia-ivt", "avc-f-raia-evt"]) {
      await expect(page.getByTestId(raia)).not.toContainText(/aplicáveis|potenciais|sem critério na fonte/);
    }
    await expect(page.locator("body")).not.toContainText("A fonte recomenda os dois com a mesma força");
    await page.getByTestId("avc-info-agente").click();
    const info = page.getByTestId("avc-info-texto-agente");
    await expect(info).toContainText("e357");
    await expect(info).toContainText("or alteplase at a dose of 0.9 mg/kg body weight (max 90 mg)");
  });
});
