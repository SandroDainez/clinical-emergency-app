import { expect, test, type Page } from "@playwright/test";
import { pressables, texto, abrirEstabilizacao } from "./helpers";

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

test("a faixa da barra vem da GRANDEZA, não dos presets", async ({ page }) => {
  // ── Mudança de regra, registrada de propósito ──────────────────────────────
  //
  // A versão anterior deste teste afirmava o contrário: que a faixa vinha dos
  // presets, "sem limite inventado". A intenção era boa — não criar regra
  // clínica na camada de apresentação —, mas o efeito era outro: a árvore da
  // ventilação declara alturas de 150 a 190 cm, então a barra ia de 150 a 190 e
  // um paciente de 145 ou de 195 cm ficava fora do alcance do controle rápido.
  // O mesmo acontecia com peso (50–100 kg), PAS na sepse (70–120), SpO₂ (80–98)
  // e NIHSS (0–25, numa escala que vai a 42).
  //
  // Os limites agora vêm de lib/faixas-de-entrada.ts, que são limites de
  // ENTRADA e não de normalidade ou gravidade — existem para o médico alcançar
  // o valor que o paciente tem. Altura: 120 a 220 cm.
  await abrirVentilacaoNoPassoDeDados(page);

  const barra = page.locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  const caixa = await barra.boundingBox();

  await page.mouse.click(caixa!.x + 1, caixa!.y + caixa!.height / 2);
  await expect
    .poll(async () => alturaExibida(page), {
      timeout: 5_000,
      message: "o piso da barra deveria ser o da grandeza (120), não o menor preset (150)",
    })
    .toBe(120);

  await page.mouse.click(caixa!.x + caixa!.width - 1, caixa!.y + caixa!.height / 2);
  await expect
    .poll(async () => alturaExibida(page), {
      timeout: 5_000,
      message: "o teto da barra deveria ser o da grandeza (220), não o maior preset (190)",
    })
    .toBe(220);
});

test("campo numérico tem SÓ a barra — sem presets e sem 'Outro…'", async ({ page }) => {
  // ── Outra mudança de regra ─────────────────────────────────────────────────
  //
  // O teste anterior cobrava que os presets e o "Outro…" continuassem na tela.
  // O usuário pediu o oposto: "só devemos ter as barras para seleção em todo o
  // app, nada de caixas". Com a barra cobrindo a faixa inteira da grandeza e os
  // botões −/+ dando o ajuste fino, não sobrou valor que só o chip alcançasse —
  // era essa a razão de os chips existirem.
  await abrirVentilacaoNoPassoDeDados(page);

  const card = cardDeEntrada(page);
  const t = await card.innerText();

  for (const preset of ["150", "165", "190"]) {
    expect(
      t.includes(`\n${preset}\n`),
      `o chip de preset ${preset} não deveria mais existir no campo numérico`
    ).toBe(false);
  }

  await expect(
    card.locator('[tabindex="0"]').filter({ hasText: /Outro/i }),
    "o 'Outro…' saiu junto com os chips"
  ).toHaveCount(0);
});

test("campo não numérico não recebe barra", async ({ page }) => {
  // "Sexo" tem presets Masculino/Feminino. Barra em campo categórico não é
  // controle, é ruído — e sugeriria que existe algo contínuo entre as opções.
  await abrirVentilacaoNoPassoDeDados(page);

  const barras = await page.locator('[role="slider"]').count();
  expect(await texto(page)).toMatch(/Masculino/);
  expect(barras, "só o campo numérico deveria ter barra").toBe(1);
});

test("os critérios do passo de decisão vêm recolhidos", async ({ page }) => {
  // Cada nó de decisão exibia a lista de evidências inteira e aberta. Num passo
  // como "há sinais de instabilidade?" são cinco linhas antes de chegar aos
  // botões — e isso se repete em 19 árvores. Era o maior consumidor de altura
  // do fluxo, e o pedido foi "o melhor possível sem muita poluição de tela".
  //
  // Recolhidos, o passo cabe na tela. Não somem: ficam a um toque, porque são a
  // justificativa clínica da pergunta.
  await page.goto("/modulos/bradicardia-acls");
  // /Feito/ solto casava com "Feito para o plantão: …" e o clique pendurava.
  await page.getByText(/Feito — continuar/).first().click();

  const alternar = page.getByText(/Ver critérios \(\d+\)/).first();
  await expect(alternar, "os critérios deveriam vir recolhidos").toBeVisible();

  const antes = await page.evaluate(`document.body.innerText`);
  expect(
    String(antes).includes("Hipotensão (PAS < 90"),
    "o critério não deveria estar visível antes do toque"
  ).toBe(false);

  await alternar.click();

  await expect
    .poll(async () => String(await page.evaluate(`document.body.innerText`)).includes("Hipotensão (PAS < 90"), {
      timeout: 5_000,
      message: "tocar deveria revelar os critérios",
    })
    .toBe(true);
});

test("o app reaproveita o peso entre módulos, e avisa que reaproveitou", async ({ page }) => {
  // "O app tem que se comunicar com informações que foram dadas anteriormente,
  // ele já sabe isso, tem que vir automático e não para preencher de novo."
  //
  // A navegação aqui é CLIENT-SIDE de propósito. A primeira versão deste teste
  // usava page.goto() entre os módulos e falhava: goto recarrega a página e zera
  // a memória do contexto. Em uso real a troca de módulo é router.push, e a
  // memória sobrevive — o teste com goto media outra coisa, não o app.
  //
  // A regra clínica de quem PODE ser reaproveitado (peso e altura sim, sinal
  // vital nunca) é travada em scripts/test-contexto-paciente.cjs, que é onde ela
  // pertence. Aqui só se verifica o caminho de ponta a ponta.
  await page.goto("/modulos/sepse-adulto");
  await page.getByText(/Feito — continuar/).first().click();

  // TODAS as barras do passo: na sepse o campo de peso é o terceiro (vem depois
  // de PA e lactato), e a primeira versão deste teste clicava só na primeira —
  // informava a PA e nunca o peso, então não havia o que herdar.
  const barras = page.locator('[role="slider"]');
  for (let i = 0; i < (await barras.count()); i++) {
    const b = barras.nth(i);
    await b.scrollIntoViewIfNeeded();
    const cx = await b.boundingBox();
    if (cx) await page.mouse.click(cx.x + cx.width * 0.6, cx.y + cx.height / 2);
  }

  // Troca de módulo POR DENTRO do app, pelo atalho de estabilização.
  await abrirEstabilizacao(page);
  await page.locator('div[tabindex="0"]').filter({ hasText: /Via aérea \/ IOT/i }).first().click();
  await expect.poll(() => page.url(), { timeout: 15_000 }).toContain("isr-rapida");

  await page.getByText(/Feito — continuar/).first().click();

  await expect
    .poll(
      async () =>
        String(await page.evaluate(`document.body.innerText`)).includes(
          "Aproveitado do que você já informou"
        ),
      {
        timeout: 10_000,
        message: "o peso informado na sepse deveria vir preenchido na ISR, com aviso",
      }
    )
    .toBe(true);
});
