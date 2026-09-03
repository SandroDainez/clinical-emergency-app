import { test, expect, type Page } from "@playwright/test";
import { abrirModulo, press, pressables, texto as corpoNormalizado } from "./helpers";

/**
 * VALIDAÇÃO DIRIGIDA PÓS-REESTRUTURAÇÃO — 2026-08-27.
 * Roteiro pedido pelo autor. Não substitui a suíte; confere o que sobrou.
 */
test.use({ viewport: { width: 375, height: 667 } });

const REMOVIDOS = /modulos\/(avc|sepse-adulto|anafilaxia|isr-rapida|ventilacao-mecanica|sedoanalgesia|cetoacidose-hiperosmolar|sindromes-coronarianas|crises-convulsivas|pre-eclampsia|edema-agudo-pulmao|tep|politrauma|tce|intoxicacoes-exogenas|choque|insuficiencia-respiratoria|abdome-agudo|injuria-renal-aguda)\b/;

const corpo = (p: Page) => p.locator("body").innerText();

async function abrir(page: Page, id: string, erros: string[]) {
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") erros.push(`console: ${m.text()}`); });
  await page.goto(`/modulos/${id}`);
  await expect.poll(async () => (await corpo(page)).length, { timeout: 30_000 }).toBeGreaterThan(200);
}

/** Nenhum href/onPress alcançável aponta para módulo removido. */
async function semLinkMorto(page: Page) {
  const hrefs = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a[href]")).map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""));
  const mortos = hrefs.filter((h) => REMOVIDOS.test(h));
  expect(mortos, `href para módulo removido: ${mortos.join(", ")}`).toEqual([]);
}

for (const id of ["pcr-adulto", "bradicardia-acls", "taquicardia-acls",
                  "drogas-vasoativas", "correcoes-eletroliticas", "calculadoras-clinicas",
                  "ritmos-acls", "farmacologia-acls", "causas-reversiveis-acls",
                  "pcr-gestacao-acls", "ovace-adulto", "pos-pcr-acls"]) {
  test(`[${id}] abre · sem erro de console · sem link morto`, async ({ page }) => {
    const erros: string[] = [];
    await abrir(page, id, erros);
    await semLinkMorto(page);
    expect(erros, `erros em "${id}"`).toEqual([]);
  });
}

test("[pcr-adulto] início do fluxo, voz e progressão", async ({ page }) => {
  const erros: string[] = [];
  await abrir(page, "pcr-adulto", erros);
  const t0 = await corpo(page);
  expect(t0, "o módulo deveria identificar-se").toMatch(/ACLS/i);
  // acionador de voz presente
  // O acionador é rotulado « ATIVAR VOZ » — mesma âncora de e2e/voz.spec.ts.
  await expect(
    pressables(page).filter({ hasText: /ATIVAR VOZ/i }).first(),
    "o acionador de voz deveria existir na primeira etapa",
  ).toBeVisible();
  // progressão: tocar o primeiro avanço muda a tela
  // Progressão real do ACLS, mesma rota de e2e/voz.spec.ts.
  await press(page, "Confirmar");
  await press(page, "Sem pulso");
  await expect.poll(async () => (await corpo(page)) !== t0, { timeout: 10_000 }).toBe(true);
  const t1 = await corpo(page);
  await press(page, "Iniciar RCP");
  await expect.poll(async () => (await corpo(page)) !== t1, { timeout: 10_000 }).toBe(true);
  // A voz sobrevive à progressão.
  await expect(
    pressables(page).filter({ hasText: /ATIVAR VOZ/i }).first(),
    "o acionador de voz deveria seguir na tela depois de avançar",
  ).toBeVisible();
  expect(erros).toEqual([]);
});

for (const id of ["bradicardia-acls", "taquicardia-acls"]) {
  test(`[${id}] progressão, campo numérico, evidence, optional, allowCustom`, async ({ page }) => {
    const erros: string[] = [];
    await abrir(page, id, erros);
    const t0 = await corpo(page);
    expect(t0).toContain("Passo");

    // Rota EXATA até o passo de entrada, lida da árvore:
    //   entry (action) → assess_stability (decision) → "me guie pelos sinais" → instab_dados (input)
    // Um laço genérico de "clique no primeiro Sim/Não" pegaria o ramo INSTÁVEL,
    // que pula o passo de dados — e a falha pareceria ausência do campo.
    await press(page, "Feito");
    await page.waitForTimeout(400);
    await pressables(page).filter({ hasText: /me guie pelos sinais/i }).first().click();
    await expect.poll(async () => page.getByTestId("passo-de-entrada").count(), { timeout: 15_000 })
      .toBeGreaterThan(0);
    const card = page.getByTestId("passo-de-entrada");
    expect(await card.count(), "deveria alcançar o passo de entrada").toBeGreaterThan(0);

    // campo numérico com barra (pas) — e allowCustom pelos botões −/+
    expect(await card.locator('[role="slider"]').count(), "campo numérico sem barra").toBeGreaterThan(0);
    const antes = await card.innerText();
    await card.locator('[data-testid="slider-pas-mais"]').click();
    await expect.poll(async () => (await card.innerText()) !== antes, { timeout: 5_000 }).toBe(true);

    // optional: o campo de confirmação da perfusão é opcional e não trava o avanço
    const texto = await card.innerText();
    // `optional: true` — o par de confirmação da perfusão, que NÃO trava o avanço.
    expect(texto, "o campo opcional de perfusão deveria estar na tela").toMatch(/aperte a ponta do dedo/i);
    // `allowCustom` no campo de PAS: o valor fora dos presets é alcançável.
    expect(texto, "a PAS deveria aceitar valor fora dos presets").toMatch(/mmHg/);
    // `evidence` — os critérios do passo, recolhidos, mas presentes na árvore.
    const tela = await corpo(page);
    expect(tela.length, "a tela do passo de dados deveria ter conteúdo").toBeGreaterThan(400);

    await semLinkMorto(page);
    expect(erros).toEqual([]);
  });
}

test("[drogas-vasoativas] cálculo responde a peso e concentração", async ({ page }) => {
  const erros: string[] = [];
  await abrir(page, "drogas-vasoativas", erros);
  const antes = await corpo(page);
  const barras = page.locator('[role="slider"]');
  expect(await barras.count(), "a calculadora deveria ter entradas").toBeGreaterThan(0);
  const b = barras.first();
  await b.scrollIntoViewIfNeeded();
  const cx = await b.boundingBox();
  if (cx) await page.mouse.click(cx.x + cx.width * 0.75, cx.y + cx.height / 2);
  await expect.poll(async () => (await corpo(page)) !== antes, { timeout: 8_000 }).toBe(true);
  await semLinkMorto(page);
  expect(erros).toEqual([]);
});

test("[correcoes-eletroliticas] entradas e resultado", async ({ page }) => {
  const erros: string[] = [];
  await abrir(page, "correcoes-eletroliticas", erros);
  const barras = page.locator('[role="slider"]');
  expect(await barras.count(), "deveria ter entradas numéricas").toBeGreaterThanOrEqual(3);
  const antes = await corpo(page);
  const b = barras.first();
  await b.scrollIntoViewIfNeeded();
  const cx = await b.boundingBox();
  if (cx) await page.mouse.click(cx.x + cx.width * 0.8, cx.y + cx.height / 2);
  await expect.poll(async () => (await corpo(page)) !== antes, { timeout: 8_000 }).toBe(true);
  await semLinkMorto(page);
  expect(erros).toEqual([]);
});

/**
 * As 15 calculadoras, uma a uma.
 *
 * ⚠️ ESTE É O MÓDULO DE MAIOR RISCO NA REESTRUTURAÇÃO, e por um motivo específico:
 * várias delas foram EXTRAÍDAS das árvores clínicas removidas. `peso-predito`,
 * `nihss`, `osmolalidade`, `anion-gap`, `dose-antibiotico-renal` viviam dentro de
 * módulos que saíram; se a extração tivesse deixado um fio solto, o sintoma
 * apareceria aqui e em nenhum outro lugar.
 */
const CALCULADORAS = [
  "Peso corporal predito", "Clearance / TFG", "Osmolalidade sérica", "Ânion gap",
  "APACHE II", "SAPS 3", "Dose de antibiótico (TFG)", "Glasgow (GCS)",
  "qSOFA", "SOFA", "Wells (TEP)", "CURB-65", "HEART Score", "NIHSS", "RASS",
];

test("[calculadoras-clinicas] as 15 abrem, e o peso predito calcula na casa nova", async ({ page }) => {
  const erros: string[] = [];
  await abrir(page, "calculadoras-clinicas", erros);

  for (const nome of CALCULADORAS) {
    const item = pressables(page).filter({ hasText: new RegExp(nome.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }).first();
    await expect(item, `a calculadora "${nome}" deveria estar na lista`).toBeVisible();
    await item.click();
    await page.waitForTimeout(250);
    const t = await corpo(page);
    expect(t.length, `"${nome}" deveria desenhar conteúdo`).toBeGreaterThan(300);
  }

  // ⚠️ PESO PREDITO NA CASA NOVA — a fórmula mudou de `ventilation-decision-tree.ts`
  // (removido) para `lib/peso-predito.ts`. A conferência estrutural é `test:vm`;
  // aqui se prova que ela CHEGA À TELA por este módulo, que passou a ser o dono.
  await pressables(page).filter({ hasText: /Peso predito/i }).first().click();
  await page.waitForTimeout(300);
  await pressables(page).filter({ hasText: /^Masculino/ }).first().click();
  await page.waitForTimeout(300);

  // ⚠️ SÓ O SEXO NÃO BASTA, E ISSO É A REGRA FUNCIONANDO. A altura nasce em 120
  // cm — o piso da barra — e a tela diz « Preencha os campos para calcular » em
  // vez de calcular sobre um número que ninguém informou (`test:valor-informado`).
  expect(await corpo(page), "sem altura informada não pode sair peso").toContain("Preencha os campos");

  await page.locator('[data-testid="slider-altura-mais"], [data-testid*="altura-mais"]').first().click();
  await expect
    .poll(async () => /\d+[,.]?\d*\s*kg/i.test(await corpo(page)), { timeout: 8_000,
      message: "informada a altura, o peso predito deveria sair em kg" })
    .toBe(true);

  await semLinkMorto(page);
  expect(erros).toEqual([]);
});

test("[shell] home, hub, rota direta, refresh, back/forward", async ({ page }) => {
  const erros: string[] = [];
  page.on("pageerror", (e) => erros.push(`pageerror: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") erros.push(`console: ${m.text()}`); });

  await page.goto("/");
  await expect.poll(async () => (await corpo(page)).length, { timeout: 30_000 }).toBeGreaterThan(100);

  await page.goto("/(tabs)");
  await expect.poll(async () => (await corpo(page)).length, { timeout: 30_000 }).toBeGreaterThan(200);
  await semLinkMorto(page);

  // rota direta + refresh
  await page.goto("/modulos/taquicardia-acls");
  await expect.poll(async () => (await corpo(page)).includes("Passo"), { timeout: 30_000 }).toBe(true);
  await page.reload();
  await expect.poll(async () => (await corpo(page)).includes("Passo"), { timeout: 30_000 }).toBe(true);

  // back / forward
  await page.goBack();
  await expect.poll(async () => (await corpo(page)).length, { timeout: 30_000 }).toBeGreaterThan(100);
  await page.goForward();
  await expect.poll(async () => (await corpo(page)).length, { timeout: 30_000 }).toBeGreaterThan(100);

  expect(erros, "erros no shell").toEqual([]);
});
