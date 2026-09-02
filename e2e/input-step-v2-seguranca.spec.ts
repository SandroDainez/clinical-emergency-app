import { expect, test, type Page } from "@playwright/test";
import { fixarIdioma, pressables } from "./helpers";

async function abrirVentilacaoV2(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.addInitScript(() => {
    window.localStorage.setItem("ui-v2", "ventilacao-mecanica");
  });
  await page.goto("/modulos/ventilacao-mecanica");
  await expect(page.getByText(/Passo/).first()).toBeVisible({ timeout: 30_000 });
}

async function avancarAteInput(page: Page, maxPassos = 6) {
  for (let i = 0; i < maxPassos; i += 1) {
    const input = page.getByTestId("passo-de-entrada");
    if (await input.count()) {
      await expect(input).toBeVisible();
      return input;
    }

    const action = page.getByTestId("passo-de-conduta");
    if (await action.count()) {
      const concluir = pressables(page).filter({ hasText: /Feito\s*[—-]\s*continuar/i }).first();
      await expect(concluir).toBeVisible();
      await concluir.click();
      await page.waitForTimeout(150);
      continue;
    }

    const decision = page.getByTestId("passo-de-decisao");
    if (await decision.count()) {
      const botoes = decision.locator('[tabindex="0"]:visible');
      const total = await botoes.count();
      let clicou = false;
      for (let j = 0; j < total; j += 1) {
        const alvo = botoes.nth(j);
        const rotulo = ((await alvo.innerText()) || "").trim();
        if (!rotulo || /Ver critérios|Ocultar critérios/i.test(rotulo)) continue;
        await alvo.click();
        await page.waitForTimeout(150);
        clicou = true;
        break;
      }
      if (clicou) continue;
    }

    throw new Error("Não foi possível alcançar o InputStep sem inventar dado clínico");
  }

  throw new Error("InputStep da ventilação não foi alcançado no limite esperado");
}

test("InputStep v2 mantém número vazio até interação real e só libera após os obrigatórios", async ({ page }) => {
  await abrirVentilacaoV2(page);
  const input = await avancarAteInput(page);

  // Invariante principal: campo numérico ausente NÃO ganha midpoint/preset implícito.
  const alturaVazia = page.getByTestId("campo-clinico-altura-numeric-empty");
  await expect(alturaVazia).toBeVisible();
  await expect(alturaVazia.getByText(/Valor ainda não informado/i)).toBeVisible();

  // A etapa continua bloqueada enquanto altura + sexo ainda não foram realmente informados.
  await expect(input.getByText(/Faltam informar\s+2\s+campos obrigatórios/i)).toBeVisible();

  // Uma interação real grava a altura no engine e troca a UI vazia pelo NumericStepper.
  await page.getByTestId("campo-clinico-altura-numeric-input").fill("170");
  await page.getByTestId("campo-clinico-altura-numeric-confirm").click();
  await expect(alturaVazia).not.toBeVisible();
  await expect(page.getByTestId("campo-clinico-altura-numeric")).toBeVisible();
  await expect(input.getByText(/Falta informar:\s*Sexo/i)).toBeVisible();

  // Só depois do segundo obrigatório o CTA de avanço fica disponível.
  const sexo = page.getByTestId("campo-clinico-sexo-categorical");
  await expect(sexo).toBeVisible();
  await sexo.getByRole("radio").first().click();

  const confirmar = input.getByRole("button", { name: /Confirmar e continuar/i });
  await expect(confirmar).toBeEnabled();
  await confirmar.click();
  await expect(page.getByTestId("passo-de-entrada")).not.toBeVisible();
});
