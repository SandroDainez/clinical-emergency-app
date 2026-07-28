import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Barra de arrastar nos campos numéricos.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Pedido:
 *
 *   "onde se tem dados para preencher tipo peso, altura .... outros pedi uma
 *    barra de arrastar para selecionar e ainda permanece os cards para preencher"
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * O `NumericStepper` (barra + botões −/+) existia desde a Fase 2 e nunca havia
 * sido ligado ao passo de entrada dos fluxos — só isso. Os presets CONTINUAM: são
 * valores curados pelo protocolo e seguem sendo o toque mais rápido; a barra é
 * para o que está entre eles, e o "Outro…" para o que está fora da faixa.
 *
 * ## Duas armadilhas de medição que este arquivo evita
 *
 * 1. O Slider do react-native-web NÃO é `input[type=range]` — é uma `div` com
 *    `role="slider"`. Procurar pelo input me fez concluir, errado, que o controle
 *    não existia na web, e quase reescrevi um componente que funcionava.
 * 2. `page.mouse.click` NÃO rola a página. Com a barra fora da viewport, os
 *    cliques caíam no vazio e o valor "não mudava" — parecia gesto quebrado e era
 *    coordenada fora da tela. Daí o `scrollIntoViewIfNeeded` obrigatório antes de
 *    qualquer medição de arrasto.
 */

async function abrirVentilacaoNoPassoDeDados(page: Page) {
  await page.addInitScript(() => {
    try {
      window.localStorage.setItem("app-locale", "pt-BR");
    } catch {
      /* modo privado */
    }
  });
  await page.goto("/modulos/ventilacao-mecanica");
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(200);

  for (let i = 0; i < 4; i += 1) {
    if ((await page.locator('[role="slider"]').count()) > 0) return;
    const avancar = pressables(page)
      .filter({ hasText: /^\s*(Sim|Não|Feito|Confirmar)/ })
      .first();
    if (!(await avancar.isVisible().catch(() => false))) break;
    await avancar.click();
    await page.waitForTimeout(250);
  }
  expect(
    await page.locator('[role="slider"]').count(),
    "o passo de dados da ventilação deveria ter barra de arrastar"
  ).toBeGreaterThan(0);
}

/** O card do passo de entrada — escopo obrigatório nesta tela. */
function cardDeEntrada(page: Page) {
  return page.locator('[data-testid="passo-de-entrada"]');
}

/** Valor que a barra exibe (o próprio controle mostra número + unidade). */
async function alturaExibida(page: Page): Promise<number> {
  const achado = (await cardDeEntrada(page).innerText()).match(/(\d{3})\s*cm/);
  expect(achado, "a barra deveria exibir a altura em cm").not.toBeNull();
  return Number(achado![1]);
}

test("o passo de dados numéricos tem barra de arrastar", async ({ page }) => {
  await abrirVentilacaoNoPassoDeDados(page);
  expect(await page.locator('[role="slider"]').count()).toBeGreaterThan(0);
});

test("arrastar a barra grava o valor no fluxo", async ({ page }) => {
  await abrirVentilacaoNoPassoDeDados(page);

  const barra = page.locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  const caixa = await barra.boundingBox();
  expect(caixa).not.toBeNull();

  const antes = await alturaExibida(page);

  await page.mouse.click(caixa!.x + caixa!.width * 0.85, caixa!.y + caixa!.height / 2);

  // O NumericStepper é totalmente controlado por prop: não guarda estado. Se o
  // número na tela mudou, é porque o valor passou por onSetValue e voltou pelo
  // engine — este assert cobre a via inteira, não só o desenho.
  await expect
    .poll(async () => alturaExibida(page), { timeout: 5_000, message: "o valor deveria mudar" })
    .not.toBe(antes);

  const depois = await alturaExibida(page);
  expect(depois, "85% da faixa deveria cair na parte alta").toBeGreaterThan(antes);
});

test("a faixa da barra vem dos presets do protocolo, sem limite inventado", async ({ page }) => {
  // A árvore da ventilação declara alturas de 150 a 190 cm. O controle não pode
  // oferecer nada fora disso por conta própria — inventar mínimo ou máximo de
  // altura, peso ou dose seria criar regra clínica na camada de apresentação.
  await abrirVentilacaoNoPassoDeDados(page);

  const barra = page.locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  const caixa = await barra.boundingBox();

  await page.mouse.click(caixa!.x + 1, caixa!.y + caixa!.height / 2);
  await expect.poll(async () => alturaExibida(page), { timeout: 5_000 }).toBe(150);

  await page.mouse.click(caixa!.x + caixa!.width - 1, caixa!.y + caixa!.height / 2);
  await expect.poll(async () => alturaExibida(page), { timeout: 5_000 }).toBe(190);
});

test("os presets e o 'Outro…' continuam disponíveis", async ({ page }) => {
  // A barra é adição, não substituição. Preset é o toque mais rápido para os
  // valores que o protocolo curou; o "Outro…" é o que mantém alcançável um valor
  // fora da faixa (altura de 145 cm, peso de 210 kg) — é por existir que derivar
  // a faixa dos presets é seguro.
  await abrirVentilacaoNoPassoDeDados(page);

  const t = await cardDeEntrada(page).innerText();
  for (const preset of ["150", "165", "190"]) {
    expect(t, `o preset ${preset} deveria continuar na tela`).toContain(preset);
  }
  await expect(
    cardDeEntrada(page).locator('[tabindex="0"]').filter({ hasText: /Outro/i }).first(),
    "o campo para valor fora da faixa deveria continuar disponível"
  ).toBeVisible();
});

test("tocar num preset também define o valor", async ({ page }) => {
  // Contraparte: a barra não pode ter roubado o comportamento dos presets.
  await abrirVentilacaoNoPassoDeDados(page);

  // Escopado ao card: o configurador de ventilação no topo da tela também tem
  // um "160", e sem escopo o clique caía nele.
  await cardDeEntrada(page).locator('[tabindex="0"]').filter({ hasText: /^160$/ }).first().click();
  await expect.poll(async () => alturaExibida(page), { timeout: 5_000 }).toBe(160);
});

test("campo não numérico não recebe barra", async ({ page }) => {
  // "Sexo" tem presets Masculino/Feminino. Barra em campo categórico não é
  // controle, é ruído — e sugeriria que existe algo contínuo entre as opções.
  await abrirVentilacaoNoPassoDeDados(page);

  const barras = await page.locator('[role="slider"]').count();
  expect(await texto(page)).toMatch(/Masculino/);
  expect(barras, "só o campo numérico deveria ter barra").toBe(1);
});
