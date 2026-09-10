import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * ⚠️⚠️⚠️ UM CONTROLE NUMÉRICO SÓ NO MÓDULO — D-127.
 *
 * ── ⛔ A DÍVIDA, MEDIDA ────────────────────────────────────────────────────
 *
 * ⛔ ⛔ O **⛔ mesmo** `tipo: "grandeza"` do conteúdo ⛔ nascia ⛔ com ⛔ **⛔ dois
 * gestos**: ⛔ em Paciente, `NumericStepper` ⛔ com degraus ⛔ e ⛔ **⛔ sem caixa
 * digitável**; ⛔ em Estabilização, `Numero` ⛔ com caixa ⛔ e ⛔ **⛔ sem
 * degraus**. ⚠️ Medido em 375 px, ⛔ antes: ⛔ cartão de Peso ⛔ com **259 px**
 * ⛔ de altura ⛔ contra ⛔ **116** ⛔ do de PAS, ⛔ controle ⛔ começando em
 * ⛔ `x=36` ⛔ contra `x=16`, ⛔ e ⛔ **⛔ duas famílias de `testID`**.
 *
 * ⛔ ⛔ Custou ⛔ quatro tentativas de seletor ⛔ numa prova ⛔ deste projeto —
 * ⛔ e ⛔ divergência que ⛔ engana ⛔ quem escreve o teste ⛔ engana ⛔ quem usa
 * ⛔ a tela.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

async function abrirEstabilizacao(page: Page) {
  await page.getByTestId("avc-aba-estabilizacao").click();
  for (const [eixo, grupo] of [
    ["pressao", "pressao"],
    ["glicemia", "neurologico-inicial"],
  ] as const) {
    const campos = page.getByTestId(`avc-grupo-${grupo}`).locator('[data-testid^="avc-campo-"]');
    if ((await campos.count()) === 0) await page.getByTestId(`avc-ameaca-${eixo}`).click();
  }
}

const caixaDe = async (page: Page, testID: string) => {
  const b = await page.getByTestId(testID).first().boundingBox();
  if (!b) throw new Error(`⛔ ${testID} não tem caixa — não está na tela`);
  return { x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height) };
};

test.describe("AVC · o controle numérico é um só", () => {
  /* ══ ⚠️⚠️⚠️ 1 · A MESMA COMPOSIÇÃO NOS DOIS LADOS ════════════════════ */

  test("Peso e PAS oferecem os MESMOS gestos — caixa, `−/+`, degraus e barra",
    async ({ page }) => {
      await abrir(page);

      /** ⚠️ Paciente. */
      await expect(page.getByTestId("avc-num-caixa-peso")).toBeVisible();
      await expect(page.getByTestId("avc-num-mais-peso")).toBeVisible();
      await expect(page.getByTestId("avc-num-menos-peso")).toBeVisible();
      await expect(page.getByTestId("avc-num-barra-peso")).toBeVisible();
      await expect(page.getByTestId("avc-degrau-peso-mais-10")).toBeVisible();
      await expect(page.getByTestId("avc-degrau-peso-mais-50")).toBeVisible();

      /** ⚠️ Estabilização — ⛔ a MESMA lista, ⛔ e ⛔ não uma parecida. */
      await abrirEstabilizacao(page);
      await expect(page.getByTestId("avc-num-caixa-pas")).toBeVisible();
      await expect(page.getByTestId("avc-num-mais-pas")).toBeVisible();
      await expect(page.getByTestId("avc-num-menos-pas")).toBeVisible();
      await expect(page.getByTestId("avc-num-barra-pas")).toBeVisible();
      await expect(page.getByTestId("avc-degrau-pas-mais-10")).toBeVisible();
      await expect(page.getByTestId("avc-degrau-pas-mais-50")).toBeVisible();
    });

  /* ══ ⚠️⚠️⚠️ 2 · A LARGURA ⛔ NÃO QUEBRA EM 375 px ════════════════════ */

  test("⛔ os degraus cabem em UMA linha nos dois cartões, a 375 px",
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await abrir(page);

      /**
       * ⚠️⚠️ ⛔ A PROVA É **GEOMÉTRICA**, ⛔ e ⛔ não « parece igual ».
       *
       * ⛔ ⛔ Com `minWidth: 72` fixo, ⛔ os quatro degraus somavam ⛔ 312 px ⛔ e
       * ⛔ **⛔ não cabiam** ⛔ nos 306 px ⛔ do cartão de Paciente — ⛔ quebravam
       * ⛔ para a segunda linha, ⛔ e o cartão ⛔ ia a **259 px**. ⛔ Aqui se mede
       * ⛔ que ⛔ os quatro ⛔ dividem ⛔ **⛔ a mesma faixa de y**.
       */
      const ys = [];
      for (const d of ["menos-50", "menos-10", "mais-10", "mais-50"]) {
        ys.push((await caixaDe(page, `avc-degrau-peso-${d}`)).h);
      }
      const topo = [];
      for (const d of ["menos-50", "menos-10", "mais-10", "mais-50"]) {
        const el = page.getByTestId(`avc-degrau-peso-${d}`);
        const b = await el.boundingBox();
        topo.push(Math.round(b!.y));
      }
      expect(
        new Set(topo).size,
        `⛔ os degraus de Peso quebraram em ${new Set(topo).size} linhas a 375 px — ` +
          `topos: ${topo.join(", ")}`
      ).toBe(1);
      expect(new Set(ys).size, "⛔ degraus com alturas diferentes na mesma linha").toBe(1);
    });

  /* ══ ⚠️⚠️⚠️ 3 · A CALCULADORA ⛔ NÃO ESPREME O CONTROLE ══════════════ */

  test("⛔ com a calculadora ao lado, a barra do Glasgow ⛔ NÃO encolhe",
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await abrir(page);
      /** ⚠️ ⛔ Os DOIS eixos: ⛔ a comparação é ⛔ com a PAS, ⛔ que mora ⛔ noutro. */
      await abrirEstabilizacao(page);

      /**
       * ⚠️⚠️ ⛔ ISTO JÁ QUEBROU UMA VEZ — 2026-09-09: ⛔ pendurar a calculadora
       * ⛔ dentro da LINHA do número ⛔ espremeu a barra ⛔ de **249 px para 60**.
       * ⛔ O olho ⛔ pegou; ⛔ a medição ⛔ é que ⛔ não deixa voltar.
       */
      await expect(page.getByTestId("avc-glasgow-abrir")).toBeVisible();
      const barra = await caixaDe(page, "avc-num-barra-glasgow");
      const barraPas = await caixaDe(page, "avc-num-barra-pas");
      expect(
        barra.w,
        `⛔ a barra do Glasgow ficou com ${barra.w} px — a calculadora ao lado a espremeu`
      ).toBeGreaterThan(200);
      expect(
        Math.abs(barra.w - barraPas.w),
        `⛔ Glasgow ${barra.w} px × PAS ${barraPas.w} px — o convidado da linha mudou a geometria`
      ).toBeLessThanOrEqual(2);
    });

  /* ══ ⚠️⚠️⚠️ 4 · ZERO CONTINUA SENDO VALOR ═══════════════════════════ */

  test("⛔ zero é resposta onde o conteúdo diz que é, ⛔ e o degrau parte do piso",
    async ({ page }) => {
      await abrir(page);

      /**
       * ⚠️⚠️ ⛔ O `+` FINO NASCE INERTE ⛔ e ⛔ o DEGRAU ⛔ **⛔ não** — ⛔ e ⛔ os
       * dois ⛔ estão certos: ⛔ um `+1` ⛔ partindo do nada ⛔ gravaria ⛔ o piso
       * ⛔ como medida (§0.2); ⛔ um degrau ⛔ é ⛔ movimento declarado.
       */
      await expect(page.getByTestId("avc-num-mais-peso")).toBeDisabled();
      await page.getByTestId("avc-degrau-peso-mais-50").click();
      await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("80");
      await expect(page.getByTestId("avc-num-mais-peso")).toBeEnabled();

      /** ⚠️ ⛔ E o zero ⛔ continua ⛔ sendo ⛔ **⛔ resposta** ⛔ no NIHSS. */
      await page.getByTestId("avc-aba-neurologico").click();
      await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
      await page.getByTestId("avc-grandeza-zero-nihss_informado").click();
      await expect(page.getByTestId("avc-num-caixa-nihss_informado")).toHaveValue("0");
    });
});
