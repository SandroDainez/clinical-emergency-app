import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * ⚠️⚠️⚠️ O HISTÓRICO DAS AFERIÇÕES — D-134, 2026-09-10.
 *
 * ⛔ ⛔ *"Um histórico clínico preservado ⛔ mas ⛔ invisível ⛔ ainda é ⛔ meio
 * histórico"* (autor). ⛔ A trilha ⛔ **⛔ já guardava** as medidas anteriores;
 * ⛔ ao provar a **D-133** ⛔ eu fui procurar a glicemia anterior ⛔ na tela ⛔ e
 * ⛔ **⛔ não achei onde olhar**.
 *
 * ⚠️ ⛔ Ele é ⛔ **⛔ janela de auditoria**, ⛔ e ⛔ não segunda fonte: ⛔ o motor
 * clínico ⛔ continua derivando ⛔ da mesma trilha, ⛔ do mesmo jeito
 * (`scripts/prova-historico-de-afericoes.cjs` confere).
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
}

async function abrirEixo(page: Page, eixo: string, grupo: string) {
  const campos = page.getByTestId(`avc-grupo-${grupo}`).locator('[data-testid^="avc-campo-"]');
  if ((await campos.count()) === 0) await page.getByTestId(`avc-ameaca-${eixo}`).click();
}

const medir = async (page: Page, campo: string, v: number) => {
  await page.getByTestId(`avc-num-caixa-${campo}`).fill(String(v));
  await page.getByTestId(`avc-num-caixa-${campo}`).blur();
};

/**
 * ⚠️⚠️ ⛔ O GESTO MUDOU DE LUGAR — 2026-09-12, ⛔ decisão do autor
 * ⛔ **⛔ depois de medir**: ⛔ com bloqueio ativo, ⛔ registrar a nova
 * aferição ⛔ mora ⛔ **⛔ dentro do bloco de tratamento**, ⛔ junto do
 * agente ⛔ e da dose. ⛔ O botão genérico do topo do grupo ⛔ cede ⛔ aí,
 * ⛔ e ⛔ continua existindo ⛔ **⛔ sem bloqueio** — ⛔ que é quando ⛔ não
 * há tratamento ⛔ para acompanhá-lo.
 */
test.describe("AVC · o histórico das aferições", () => {
  test("PA: 183/111 → nova aferição 168/92 — ⛔ as DUAS aparecem",
    async ({ page }) => {
      await abrir(page);
      await abrirEixo(page, "pressao", "pressao");
      await medir(page, "pas", 183);
      await medir(page, "pad", 111);

      /** ⚠️ ⛔ Com UMA medida ⛔ não há histórico — ⛔ e ⛔ não há ruído. */
      await expect(page.getByTestId("avc-historico-pa")).toHaveCount(0);

      await page.getByTestId("avc-a-nova-medida-pressao_acima_da_meta").click();
      await medir(page, "pas", 168);
      await medir(page, "pad", 92);

      const hist = page.getByTestId("avc-historico-pa");
      await expect(hist).toContainText("2 medidas");
      await page.getByTestId("avc-historico-abrir-pa").click();

      /** ⚠️⚠️ ⛔ QUAL É A ATUAL ⛔ TEM DE SE LER ⛔ sem contar linhas. */
      await expect(page.getByTestId("avc-historico-pa-2")).toContainText(/Medida atual/i);
      await expect(page.getByTestId("avc-historico-pa-2")).toContainText("168");
      await expect(page.getByTestId("avc-historico-pa-1")).toContainText(/1ª medida/i);
      await expect(
        page.getByTestId("avc-historico-pa-1"),
        "⛔ a aferição que MOTIVOU a conduta sumiu da tela — o médico não consegue " +
          "ver a que pressão o paciente estava antes do tratamento"
      ).toContainText("183");
      await expect(page.getByTestId("avc-historico-pa-1")).toContainText("111");
    });

  test("glicemia: 38 → 96 — ⛔ as DUAS aparecem, ⛔ no MESMO componente",
    async ({ page }) => {
      await abrir(page);
      await abrirEixo(page, "glicemia", "neurologico-inicial");
      await medir(page, "glicemia", 38);
      await page.getByTestId("avc-a-nova-medida-glicemia_alterada").click();
      await medir(page, "glicemia", 96);

      await expect(page.getByTestId("avc-historico-glicemia")).toContainText("2 medidas");
      await page.getByTestId("avc-historico-abrir-glicemia").click();
      await expect(page.getByTestId("avc-historico-glicemia-2")).toContainText(/Medida atual/i);
      await expect(page.getByTestId("avc-historico-glicemia-2")).toContainText("96");
      await expect(page.getByTestId("avc-historico-glicemia-1")).toContainText("38");
    });

  test("⛔ corrigir ⛔ NÃO cria uma terceira medida — ⛔ e o valor original ⛔ continua visível",
    async ({ page }) => {
      await abrir(page);
      await abrirEixo(page, "glicemia", "neurologico-inicial");
      await medir(page, "glicemia", 38);
      await page.getByTestId("avc-a-nova-medida-glicemia_alterada").click();
      await medir(page, "glicemia", 96);

      /** ⚠️ ⛔ Erro de digitação ⛔ na medida atual: ⛔ era 69. */
      await medir(page, "glicemia", 69);

      await expect(
        page.getByTestId("avc-historico-glicemia"),
        "⛔ uma correção virou uma terceira aferição: o caso passa a ter uma medida " +
          "que o paciente nunca teve"
      ).toContainText("2 medidas");
      await page.getByTestId("avc-historico-abrir-glicemia").click();
      await expect(page.getByTestId("avc-historico-glicemia-2")).toContainText("69");
      await expect(page.getByTestId("avc-historico-glicemia-1")).toContainText("38");
    });

  /**
   * ⚠️⚠️ ⛔ ZERO ⛔ — ⛔ e ⛔ por que ⛔ a prova ⛔ dele ⛔ **⛔ não** ⛔ mora aqui.
   *
   * ⛔ ⛔ A glicemia ⛔ tem faixa ⛔ **20–800**: ⛔ zero ⛔ **⛔ não é registrável**
   * ⛔ ali, ⛔ e ⛔ isso ⛔ é conteúdo clínico ⛔ correto — ⛔ glicemia capilar 0
   * ⛔ não é medida. ⛔ Forçar o gesto ⛔ testaria ⛔ um estado ⛔ que ⛔ o app
   * ⛔ **⛔ recusa por desenho**.
   *
   * ⚠️ ⛔ O que ⛔ **⛔ tem** de ser provado ⛔ é ⛔ que ⛔ o LEITOR ⛔ do histórico
   * ⛔ não trata ⛔ `0` ⛔ como ausência — ⛔ e ⛔ isso ⛔ se mede ⛔ no módulo puro:
   * `scripts/prova-historico-de-afericoes.cjs`.
   */

  test("⛔ o histórico nasce FECHADO — ⛔ o passado ⛔ não ocupa a tela do plantão",
    async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 900 });
      await abrir(page);
      await abrirEixo(page, "pressao", "pressao");
      await medir(page, "pas", 183);
      await medir(page, "pad", 111);
      await page.getByTestId("avc-a-nova-medida-pressao_acima_da_meta").click();
      await medir(page, "pas", 168);
      await medir(page, "pad", 92);

      await expect(page.getByTestId("avc-historico-pa-1")).toHaveCount(0);
      await expect(page.getByTestId("avc-historico-pa")).toContainText(/Ver histórico/i);
      await page.getByTestId("avc-historico-abrir-pa").click();
      await expect(page.getByTestId("avc-historico-pa-1")).toBeVisible();

      /** ⚠️ ⛔ E ⛔ a tela ⛔ não passa a rolar ⛔ para o lado ⛔ em 375 px. */
      const largura = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(largura, `⛔ a tela passou a rolar para o lado: ${largura} px`).toBeLessThanOrEqual(375);
    });
});
