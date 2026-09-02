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

async function escolherPrimeiraDecisao(page: Page) {
  const raiz = page.getByTestId("passo-de-decisao");
  await expect(raiz).toBeVisible();
  const botoes = raiz.locator('[tabindex="0"]:visible');
  const total = await botoes.count();

  for (let i = 0; i < total; i++) {
    const alvo = botoes.nth(i);
    const rotulo = ((await alvo.innerText()) || "").trim();
    if (!rotulo || /Ver critérios|Ocultar critérios/i.test(rotulo)) continue;
    await alvo.click();
    await page.waitForTimeout(200);
    return;
  }

  throw new Error("Nenhuma opção clínica encontrada no DecisionStep");
}

const CONTROLE_AUXILIAR = new RegExp(
  [
    "^(←|‹|↺)",
    "Voltar",
    "Recomeçar",
    "Módulos",
    "ATIVAR VOZ",
    "FERRAMENTAS",
    "Estabilização primeiro",
    "Ver ABCDE",
    "ver mais",
    "Ver critérios",
    "Ocultar critérios",
    "Outro…",
    "^(PT|ES)$",
    "Parada / RCP",
    "Via aérea / IOT",
    "Ventilação mecânica",
    "Choque / vasopressor",
    "Bradicardia instável",
    "Taquicardia instável",
  ].join("|"),
  "i"
);

async function avancarEtapaReconhecida(page: Page): Promise<boolean> {
  if (await page.getByTestId("passo-de-decisao").count()) {
    await escolherPrimeiraDecisao(page);
    return true;
  }

  if (await page.getByTestId("passo-de-conduta").count()) {
    const concluir = pressables(page)
      .filter({ hasText: /Feito\s*[—-]\s*continuar/i })
      .first();
    await expect(concluir).toBeVisible();
    await concluir.click();
    await page.waitForTimeout(200);
    return true;
  }

  // Não inventa valores para InputStep. Se chegamos aqui e ele não é o alvo do
  // teste, a travessia para em vez de fabricar dado clínico só para avançar CI.
  if (await page.getByTestId("passo-de-entrada").count()) return false;

  const candidatos = pressables(page);
  const total = await candidatos.count();
  for (let i = 0; i < total; i++) {
    const alvo = candidatos.nth(i);
    const rotulo = ((await alvo.innerText()) || "").replace(/\n/g, " ").trim();
    if (!rotulo || CONTROLE_AUXILIAR.test(rotulo)) continue;
    const disabled = await alvo.getAttribute("aria-disabled");
    if (disabled === "true") continue;
    await alvo.click();
    await page.waitForTimeout(200);
    return true;
  }

  return false;
}

async function avancarAte(page: Page, testID: string, maxPassos = 8) {
  for (let i = 0; i < maxPassos; i++) {
    const alvo = page.getByTestId(testID);
    if (await alvo.count()) {
      await expect(alvo).toBeVisible();
      return alvo;
    }
    if (!(await avancarEtapaReconhecida(page))) break;
  }

  throw new Error(`Etapa integrada "${testID}" não foi alcançada sem inventar dados clínicos`);
}

test("DecisionStep integrado escolhe opção e muda de etapa", async ({ page }) => {
  await abrirV2(page, "bradicardia-acls");
  const decisao = await avancarAte(page, "passo-de-decisao");
  const antes = await page.locator("body").innerText();
  await escolherPrimeiraDecisao(page);
  await expect.poll(async () => page.locator("body").innerText()).not.toBe(antes);
  await expect(decisao).not.toBeVisible();
});

test("InputStep integrado aparece na sepse com campos clínicos", async ({ page }) => {
  await abrirV2(page, "sepse-adulto");
  const entrada = await avancarAte(page, "passo-de-entrada");
  await expect(entrada).toBeVisible();
  await expect(page.locator('[data-testid^="campo-clinico-"]').first()).toBeVisible();
});

test("ActionStep integrado mantém gesto explícito de conclusão", async ({ page }) => {
  // Bradicardia entra diretamente em uma ActionStep canônica de reconhecimento
  // e monitorização. Assim o smoke valida o gesto de conclusão sem fabricar
  // valores clínicos nem depender de uma decisão diagnóstica prévia.
  await abrirV2(page, "bradicardia-acls");
  const conduta = page.getByTestId("passo-de-conduta");
  await expect(conduta).toBeVisible();

  const concluir = pressables(page)
    .filter({ hasText: /Feito\s*[—-]\s*continuar/i })
    .first();
  await expect(concluir).toBeVisible();
  await concluir.click();
  await expect(conduta).not.toBeVisible();
  await expect(page.getByTestId("passo-de-decisao")).toBeVisible();
});
