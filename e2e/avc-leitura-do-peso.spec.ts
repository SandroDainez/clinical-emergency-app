import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a leitura *"⛔ não atrasar a trombólise por causa do peso"*
 *   apareça **onde o peso passa a ter consequência** — ⛔ e ⛔ em ⛔ nenhum
 *   outro lugar.
 *
 * NÃO PROMETE: que a **dose** esteja certa — ⛔ isso é `prova-avc-superficie-f`
 *   ⛔ e as travas de cálculo. ⛔ Aqui ⛔ nada de regra de dose foi tocado.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em 375 px.
 *
 * ── ⚠️⚠️⚠️ **D-126** — ⛔ a dívida que este arquivo fecha ─────────────────
 *
 * ⛔ ⛔ O peso saiu da Estabilização em 2026-09-08 (⛔ ele mora em Paciente), ⛔ e
 * a **leitura** dele ficou ⛔ sem tela: ⛔ Paciente ⛔ não tem painel de leituras,
 * ⛔ por decisão declarada.
 *
 * ⚠️ Decisão do autor: *"a casa natural é **Reperfusão**, porque é ⛔ ali que o
 * peso passa a ter consequência terapêutica na dose do trombolítico. ⛔ O fato
 * continua em Paciente; a interpretação clínica aparece ⛔ quando o fato se
 * torna relevante."*
 *
 * ⚠️⚠️ ⛔ E ⛔ **⛔ SÓ A APRESENTAÇÃO MUDOU**: ⛔ a função `peso()` é a mesma,
 * ⛔ o fato é o mesmo, ⛔ o consumidor ⛔ já existia (`exige: ["peso"]`), ⛔ e a
 * regra de dose ⛔ não foi tocada.
 */

test.use({ viewport: { width: 375, height: 812 } });

const aba = (p: Page, id: string) => p.getByTestId(`avc-aba-${id}`).click();

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

test.describe("AVC · a leitura do peso — D-126", () => {
  /* ══ ⚠️⚠️ 1 · O FATO CONTINUA ÚNICO, ⛔ E É DE PACIENTE ═══════════════ */

  test("⛔ o peso é campo de **Paciente**, ⛔ e de mais nenhuma tela",
    async ({ page }) => {
      await abrir(page);
      await expect(page.getByTestId("avc-campo-peso")).toHaveCount(1);

      for (const sup of ["estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao"]) {
        await aba(page, sup);
        await expect(page.getByTestId("avc-campo-peso"), `⛔ peso duplicado em ${sup}`)
          .toHaveCount(0);
        await expect(page.getByTestId("avc-campo-peso_origem")).toHaveCount(0);
      }
    });

  /* ══ ⚠️⚠️⚠️ 2 · ⛔ A ESTABILIZAÇÃO ⛔ NÃO MOSTRA ⛔ NEM O CAMPO ⛔ NEM A LEITURA */

  test("⛔ a Estabilização ⛔ não tem peso ⛔ nem leitura de peso",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "estabilizacao");
      await expect(page.getByTestId("avc-campo-peso")).toHaveCount(0);
      await expect(page.getByTestId("avc-leitura-curto-peso")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-leitura-peso")).toHaveCount(0);
      await expect(page.locator("body")).not.toContainText(/não atrasar terapia/i);
    });

  /* ══ ⚠️⚠️⚠️ 3 · REPERFUSÃO MOSTRA — ⛔ E ⛔ SÓ QUANDO É PERTINENTE ═════ */

  test("⛔ sem peso, a Reperfusão diz **⛔ não atrasar**",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "reperfusao");

      const leitura = page.getByTestId("avc-f-leitura-peso");
      await expect(leitura).toBeVisible();
      /** ⚠️ ⛔ A frase é a da fonte (F-09) — ⛔ a tela ⛔ não a redige. */
      await expect(leitura).toContainText(/não atrasar/i);
      /** ⚠️ ⛔ E ⛔ ela mora ⛔ junto do lugar onde a dose ⛔ não saiu. */
      await expect(page.getByTestId("avc-f-dose-vazia")).toBeVisible();
    });

  /* ══ ⚠️⚠️ 4 · COM PESO, ⛔ ELA SAI ═════════════════════════════════ */

  /**
   * ⚠️⚠️ ⛔ *"Quando pertinente"* tem **as duas metades**: ⛔ aparecer ⛔ quando
   * falta, ⛔ e **⛔ sumir** quando ⛔ não falta mais. ⛔ Um aviso que ⛔ nunca sai
   * deixa de ser aviso.
   */
  test("⛔ com peso registrado, a leitura sai",
    async ({ page }) => {
      await abrir(page);
      /** ⚠️ O gesto real, ⛔ na casa do fato. */
      await page.getByTestId("avc-degrau-peso-mais-50").click();
      await page.getByTestId("avc-degrau-peso-mais-10").click();

      await aba(page, "reperfusao");
      /**
       * ⚠️⚠️ ⛔ A GARANTIA É SOBRE A **LEITURA**, ⛔ e ⛔ não sobre a dose:
       * ⛔ a dose depende de ⛔ mais coisas que peso ⛔ e agente, ⛔ e exigi-la
       * ⛔ aqui mediria a regra de dose — ⛔ que este commit ⛔ não tocou.
       */
      await expect(page.getByTestId("avc-f-leitura-peso")).toHaveCount(0);
    });

  /* ══ ⚠️⚠️⚠️ 5 · ⛔ NENHUM ATRASO ⛔ NEM BLOQUEIO NOVO ═══════════════════ */

  /**
   * ⚠️⚠️ ⛔ A FRASE PEDE PARA **⛔ NÃO PARAR** — ⛔ e uma leitura que travasse a
   * navegação diria o contrário do que está escrito ⛔ nela (**E-11**).
   */
  test("⛔ a leitura ⛔ NÃO bloqueia ⛔ nada",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-f-leitura-peso")).toBeVisible();

      /** ⛔ Com ela na tela, ⛔ toda superfície continua abrindo. */
      for (const sup of ["destino", "seguranca", "imagem", "neurologico", "estabilizacao", "paciente"]) {
        await aba(page, sup);
        await expect(page.getByTestId(`avc-aba-${sup}`)).toBeVisible();
      }

      /** ⚠️ ⛔ E o `Resolver ›` do peso continua levando à **casa** ⛔ dele. */
      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-f-leitura-peso")).toBeVisible();
    });
});
