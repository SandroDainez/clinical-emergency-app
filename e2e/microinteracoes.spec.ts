import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Microinterações — Fase 8.
 *
 * A regra que manda aqui é do plano, e é clínica:
 *
 *   "Proibido: animação que atrase feedback de ação crítica.
 *    Em emergência, resposta imediata > elegância."
 *
 * Por isso o teste central não mede se a animação é bonita — mede se ela
 * ATRASA. O conteúdo da etapa nova tem de estar presente e tocável logo após o
 * toque, sem esperar transição.
 */

async function abrirFluxo(page: Page, id: string) {
  await page.addInitScript(
    ([modulo]) => {
      try {
        window.localStorage.setItem("app-locale", "pt-BR");
        window.localStorage.setItem("ui-v2", modulo as string);
      } catch {
        /* modo privado */
      }
    },
    [id]
  );
  await page.goto(`/modulos/${id}`);
  await expect
    .poll(async () => (await texto(page)).includes("Passo"), { timeout: 30_000 })
    .toBe(true);
}

/** Primeiro tocável que avança o fluxo (ignora navegação e atalhos). */
function opcaoDeAvanco(page: Page) {
  return pressables(page)
    .filter({ hasText: /^\s*(Sim|Não|Feito)/ })
    .first();
}

test("a troca de etapa não atrasa o conteúdo novo", async ({ page }) => {
  await abrirFluxo(page, "anafilaxia");

  const antes = await texto(page);
  await opcaoDeAvanco(page).click();

  // Sem espera artificial: logo após o toque, a tela já tem de ter mudado. Se a
  // animação segurasse o conteúdo, este `poll` curto falharia.
  await expect
    .poll(async () => (await texto(page)) !== antes, { timeout: 1_000 })
    .toBe(true);
});

test("o conteúdo da etapa nova é tocável de imediato", async ({ page }) => {
  await abrirFluxo(page, "anafilaxia");
  await opcaoDeAvanco(page).click();

  // O fade anima a opacidade de 0,4 para 1 — nunca de 0 — e o conteúdo é montado
  // no mesmo frame. Portanto há tocável disponível já no início da transição.
  await expect(pressables(page).first()).toBeVisible({ timeout: 1_000 });
});

test("com movimento reduzido, nada anima", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await abrirFluxo(page, "anafilaxia");

  const antes = await texto(page);
  await opcaoDeAvanco(page).click();
  await expect.poll(async () => (await texto(page)) !== antes, { timeout: 1_000 }).toBe(true);

  // Com movimento reduzido a opacidade fica fixa em 1: nada de conteúdo clínico
  // pode ficar semitransparente para quem pediu menos movimento.
  const opacidades = (await page.evaluate(`(() => {
    return [...document.querySelectorAll("div")]
      .map((e) => parseFloat(getComputedStyle(e).opacity))
      .filter((o) => !Number.isNaN(o) && o < 1 && o > 0);
  })()`)) as number[];

  expect(opacidades, "elemento semitransparente com movimento reduzido").toEqual([]);
});

test("o toque em botão dá retorno visual", async ({ page }) => {
  // O plano pede scale sutil (0.97) no toque. Os componentes da UI 2.0 já
  // nascem com isso; aqui se confirma que a transformação existe de fato.
  await page.goto("/dev/ui-v2");
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(500);

  const botao = pressables(page).filter({ hasText: /^Primary$/ }).first();
  await expect(botao).toBeVisible();

  const caixa = await botao.boundingBox();
  expect(caixa).not.toBeNull();

  await page.mouse.move(caixa!.x + caixa!.width / 2, caixa!.y + caixa!.height / 2);
  await page.mouse.down();

  // O estado "pressionado" do Pressable não é síncrono ao mouse.down: o
  // react-native-web só re-renderiza no próximo frame. Sem este poll o teste
  // mede o estilo de repouso e falha por motivo errado.
  const reagiu = await expect
    .poll(
      async () => {
        const t = await botao.evaluate((e) => getComputedStyle(e).transform);
        const o = await botao.evaluate((e) => getComputedStyle(e).opacity);
        return t !== "none" || parseFloat(o) < 1;
      },
      { timeout: 2_000, message: "botão deveria reagir ao toque" }
    )
    .toBe(true)
    .then(() => true)
    .catch(() => false);

  await page.mouse.up();
  expect(reagiu, "botão sem retorno visual no toque").toBe(true);
});
