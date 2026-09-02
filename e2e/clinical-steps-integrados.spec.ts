import { expect, test, type Page } from "@playwright/test";
import { fixarIdioma, pressables } from "./helpers";

async function abrirV2(page: Page, id: string) {
  await fixarIdioma(page, "pt-BR");
  await page.addInitScript((modulo) => {
    window.localStorage.setItem("ui-v2", modulo as string);
  }, id);
  await page.goto(`/modulos/${id}`);
  await expect(page.getByText(/Passo/).first()).toBeVisible({ timeout: 30_000 });
}

async function primeiraOpcaoClinica(page: Page) {
  const raiz = page.locator('[data-testid="passo-de-decisao"]');
  await expect(raiz).toBeVisible();
  const botoes = raiz.locator('[role="button"]');
  const total = await botoes.count();
  for (let i = 0; i < total; i++) {
    const b = botoes.nth(i);
    const t = ((await b.innerText()) || "").trim();
    if (/Ver critérios|Ocultar critérios/i.test(t)) continue;
    await b.click();
    return;
  }
  throw new Error("Nenhuma opção clínica encontrada no DecisionStep");
}

test("DecisionStep integrado escolhe opção e muda de etapa", async ({ page }) => {
  await abrirV2(page, "bradicardia-acls");
  await primeiraOpcaoClinica(page);
  await expect.poll(async () => page.locator('[data-testid="passo-de-decisao"]').count()).toBeLessThanOrEqual(1);
  await expect(page.getByText(/Passo/).first()).toBeVisible();
});

test("InputStep integrado aparece na sepse com campos clínicos", async ({ page }) => {
  await abrirV2(page, "sepse-adulto");
  await primeiraOpcaoClinica(page);
  const entrada = page.locator('[data-testid="passo-de-entrada"]');
  await expect(entrada).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('[data-testid^="campo-clinico-"]').first()).toBeVisible();
});

test("ActionStep integrado mantém gesto explícito de conclusão", async ({ page }) => {
  await abrirV2(page, "anafilaxia");
  for (let i = 0; i < 4; i++) {
    const conduta = page.locator('[data-testid="passo-de-conduta"]');
    if (await conduta.count()) {
      await expect(conduta).toBeVisible();
      const avancar = page.getByRole("button", { name: /Conduta executada|Feito — continuar/i }).first();
      await expect(avancar).toBeVisible();
      await avancar.click();
      return;
    }
    const decisao = page.locator('[data-testid="passo-de-decisao"]');
    if (await decisao.count()) {
      await primeiraOpcaoClinica(page);
      await page.waitForTimeout(200);
      continue;
    }
    const candidatos = pressables(page).filter({ hasText: /Feito — continuar/ });
    if (await candidatos.count()) {
      await candidatos.first().click();
      await page.waitForTimeout(200);
      continue;
    }
    break;
  }
  throw new Error("ActionStep integrado não foi alcançado no smoke de anafilaxia");
});
