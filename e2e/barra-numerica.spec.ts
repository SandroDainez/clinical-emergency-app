import { expect, test, type Locator, type Page } from "@playwright/test";
import { pressables, texto, abrirEstabilizacao, fixarIdioma} from "./helpers";

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

/**
 * ⚠️ VEÍCULO TROCADO EM 2026-08-27 — era `ventilacao-mecanica`, removida com a
 * arquitetura clínica antiga. O que este arquivo mede NÃO é ventilação: é o
 * comportamento da barra no passo de entrada, desenhado pela concha compartilhada.
 * Qualquer módulo com campo numérico serve de veículo.
 *
 * A bradicardia foi escolhida porque o passo de instabilidade tem exatamente a
 * forma que estes testes precisam: UM campo numérico (`pas`, presets 70–140 e
 * faixa de grandeza 40–300 em `lib/faixas-de-entrada.ts` — logo, piso e teto
 * SEPARADOS dos presets, que é o ponto do terceiro teste) ao lado de campos
 * categóricos Sim/Não, que provam que barra não nasce onde não deve.
 */
async function abrirBradicardiaNoPassoDeDados(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/bradicardia-acls");
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(200);

  for (let i = 0; i < 4; i += 1) {
    if ((await cardDeEntrada(page).locator('[role="slider"]').count()) > 0) return;
    const avancar = pressables(page)
      .filter({ hasText: /^\s*(Sim|Não|Feito|Confirmar)/ })
      .first();
    if (!(await avancar.isVisible().catch(() => false))) break;
    await avancar.click();
    await page.waitForTimeout(250);
  }
  expect(
    await cardDeEntrada(page).locator('[role="slider"]').count(),
    "o passo de instabilidade da bradicardia deveria ter barra de arrastar"
  ).toBeGreaterThan(0);
}

/** O card do passo de entrada — escopo obrigatório nesta tela. */
function cardDeEntrada(page: Page) {
  return page.locator('[data-testid="passo-de-entrada"]');
}

/** Valor que a barra exibe (o próprio controle mostra número + unidade). */
async function pasExibida(page: Page): Promise<number> {
  const achado = (await cardDeEntrada(page).innerText()).match(/(\d{2,3})\s*mmHg/);
  expect(achado, "a barra deveria exibir a PAS em mmHg").not.toBeNull();
  return Number(achado![1]);
}

test("o passo de dados numéricos tem barra de arrastar", async ({ page }) => {
  await abrirBradicardiaNoPassoDeDados(page);
  expect(await page.locator('[role="slider"]').count()).toBeGreaterThan(0);
});

test("arrastar a barra grava o valor no fluxo", async ({ page }) => {
  await abrirBradicardiaNoPassoDeDados(page);

  // ESCOPO no card do passo. A tela da ventilação tem DUAS alturas: a do
  // configurador de ventilador (topo, sempre visível) e a do passo do fluxo.
  // A duplicação é anterior a este teste — o que mudou foi o configurador
  // ganhar barra no lugar da caixa "Outro", e aí `.first()` passou a pegar a
  // barra dele. O teste sempre quis a do PASSO; agora diz isso.
  const barra = cardDeEntrada(page).locator('[role="slider"]').first();
  await barra.scrollIntoViewIfNeeded();
  const caixa = await barra.boundingBox();
  expect(caixa).not.toBeNull();

  const antes = await pasExibida(page);

  await page.mouse.click(caixa!.x + caixa!.width * 0.85, caixa!.y + caixa!.height / 2);

  // O NumericStepper é totalmente controlado por prop: não guarda estado. Se o
  // número na tela mudou, é porque o valor passou por onSetValue e voltou pelo
  // engine — este assert cobre a via inteira, não só o desenho.
  await expect
    .poll(async () => pasExibida(page), { timeout: 5_000, message: "o valor deveria mudar" })
    .not.toBe(antes);

  const depois = await pasExibida(page);
  expect(depois, "85% da faixa deveria cair na parte alta").toBeGreaterThan(antes);
});

/**
 * Leva a barra ao extremo CLICANDO ATÉ O VALOR PARAR DE MUDAR.
 *
 * ⚠️ SUBSTITUIU UM NÚMERO FIXO DE CLIQUES EM 2026-08-27, e a razão é a mesma que
 * este arquivo já registra sobre `waitForTimeout`: "110 cliques" é uma promessa
 * sobre a máquina, não sobre o app. Com a PAS (faixa 40–300, contra a altura de
 * 120–220 do veículo anterior) o percurso ficou maior, cliques se perderam entre
 * re-renders, e o teste parou em 60 — falha que parecia erro de faixa e era
 * clique engolido. Falha por lentidão é indistinguível de falha por defeito.
 *
 * Parar quando o valor ESTABILIZA mede o que interessa — onde a barra trava — e
 * não depende de quantos cliques chegaram. O teto existe só para não girar para
 * sempre se a barra nunca travar, e nesse caso a asserção de valor é que acusa.
 */
async function levarAoExtremo(page: Page, botao: Locator) {
  let anterior = await pasExibida(page);
  for (let rodada = 0; rodada < 40; rodada += 1) {
    for (let i = 0; i < 20; i += 1) await botao.click({ force: true });
    const agora = await pasExibida(page);
    if (agora === anterior) return;
    anterior = agora;
  }
}

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
  await abrirBradicardiaNoPassoDeDados(page);

  // ── Medido pelos BOTÕES, não por clique em coordenada ─────────────────────
  //
  // A versão anterior clicava na borda esquerda e na direita da barra, por
  // coordenada. Funcionou até o card do configurador de ventilador ganhar uma
  // barra e ficar mais alto: o ponto calculado passou a cair sobre outro
  // elemento, o clique não chegava ao controle, e o valor ficava nos 170
  // iniciais — falha que parecia erro de faixa e era erro de mira.
  //
  // Levar o "−" até o fim leva ao piso, e o "+" ao teto, sem depender de pixel
  // nenhum. É também o gesto que o usuário faz de verdade.
  //
  // O escopo é o CARD DO PASSO: a tela da ventilação tem duas alturas, a do
  // configurador (topo) e a do passo, e o teste sempre quis a segunda.
  const menos = cardDeEntrada(page).locator('[data-testid="slider-pas-menos"]');
  const mais = cardDeEntrada(page).locator('[data-testid="slider-pas-mais"]');
  await menos.scrollIntoViewIfNeeded();

  await levarAoExtremo(page, menos);
  await expect
    .poll(async () => pasExibida(page), {
      timeout: 5_000,
      message: "o piso da barra deveria ser o da grandeza (40), não o menor preset (70)",
    })
    .toBe(40);

  await levarAoExtremo(page, mais);
  await expect
    .poll(async () => pasExibida(page), {
      timeout: 5_000,
      message: "o teto da barra deveria ser o da grandeza (300), não o maior preset (140)",
    })
    .toBe(300);
});

test("campo numérico tem SÓ a barra — sem presets e sem 'Outro…'", async ({ page }) => {
  // ── Outra mudança de regra ─────────────────────────────────────────────────
  //
  // O teste anterior cobrava que os presets e o "Outro…" continuassem na tela.
  // O usuário pediu o oposto: "só devemos ter as barras para seleção em todo o
  // app, nada de caixas". Com a barra cobrindo a faixa inteira da grandeza e os
  // botões −/+ dando o ajuste fino, não sobrou valor que só o chip alcançasse —
  // era essa a razão de os chips existirem.
  await abrirBradicardiaNoPassoDeDados(page);

  const card = cardDeEntrada(page);
  const t = await card.innerText();

  for (const preset of ["70", "100", "140"]) {
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
  // Os campos de instabilidade ("está confuso?", "a pele está pálida, fria ou
  // suada?") são Sim/Não. Barra em campo categórico não é controle, é ruído — e
  // sugeriria que existe algo contínuo entre as opções.
  await abrirBradicardiaNoPassoDeDados(page);

  const barras = await cardDeEntrada(page).locator('[role="slider"]').count();
  expect(await texto(page)).toMatch(/Sim/);
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

/**
 * ⚠️ TESTE REMOVIDO EM 2026-08-27 — "o app reaproveita o peso entre módulos, e
 * avisa que reaproveitou". Ele media a travessia sepse-adulto → ISR pelo atalho
 * de estabilização, informando o peso no primeiro e conferindo o aviso
 * «Aproveitado do que você já informou» no segundo. Os DOIS módulos saíram com a
 * arquitetura clínica antiga.
 *
 * ⚠️ NÃO FOI REDIRECIONADO, E ISSO É UMA PENDÊNCIA DECLARADA, não um descarte:
 * nenhum par de módulos sobreviventes coleta peso em árvore de decisão
 * (bradicardia e taquicardia coletam PAS e sintomas; as calculadoras pedem peso
 * mas não se alcançam por dentro do fluxo). Escrever a travessia com um par que
 * não existe seria um teste que passa sem exercitar o caminho.
 *
 * A REGRA continua travada onde ela vive: `scripts/test-contexto-paciente.cjs`
 * mede quem pode ser reaproveitado (peso e altura sim, sinal vital nunca). O que
 * ficou sem cobertura é o CAMINHO de ponta a ponta — e ele volta a ser medível
 * quando o primeiro módulo da arquitetura nova coletar peso.
 *
 * Registrado como **D-105** em `auditoria/DIVIDAS-CONHECIDAS.md`.
 */
