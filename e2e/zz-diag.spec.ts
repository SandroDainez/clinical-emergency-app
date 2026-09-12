import { test } from "@playwright/test";
import { fixarIdioma } from "./helpers";
test.use({ viewport: { width: 375, height: 900 } });
const abertos = async (page: any) => {
  const r: string[] = [];
  for (const g of ["via-aerea","respiracao","pressao","neurologico-inicial"])
    if ((await page.getByTestId(`avc-grupo-${g}`).locator('[data-testid^="avc-campo-"]').count()) > 0) r.push(g);
  return r.join(",") || "(nenhum)";
};
test("concluir B manda para onde?", async ({ page }) => {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
  console.log("inicial:", await abertos(page));
  await page.getByTestId("avc-ameaca-respiracao").click();
  console.log("abri B:", await abertos(page));
  await page.getByTestId("avc-eixo-concluir-respiracao").click();
  await page.waitForTimeout(400);
  console.log("conclui B →", await abertos(page));
  console.log("B tem Concluir?", await page.getByTestId("avc-eixo-concluir-respiracao").count());
  await page.getByTestId("avc-ameaca-respiracao").click();
  console.log("reabri B, botão diz:", await page.getByTestId("avc-eixo-concluir-respiracao").innerText());
  console.log("selo de concluída em B:", await page.getByTestId("avc-eixo-selo-respiracao").count());
  console.log("texto do selo:", await page.getByTestId("avc-eixo-selo-respiracao").innerText().catch(() => "—"));
  await page.getByTestId("avc-ameaca-respiracao").click();
  console.log("fechado, selo continua?", await page.getByTestId("avc-eixo-selo-respiracao").count());
});
