import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma } from "./helpers";

/**
 * PROMETE: que o Glasgow possa ser **calculado por E · V · M** dentro da
 *   Estabilização, ⛔ que o total volte para o campo, ⛔ que reabrir mostre o
 *   que foi escolhido — ⛔ e que **a origem do número fique registrada**.
 *
 * NÃO PROMETE: que os pontos de cada opção estejam certos — ⛔ eles vêm de
 *   `CALC_TOOLS` (**Teasdale & Jennett, 1974**), ⛔ e quem os mede é
 *   `test:calculadoras`. ⛔ E ⛔ **⛔ não** promete interpretação: ⛔ ela ⛔ não
 *   existe ⛔ aqui, ⛔ de propósito.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px**.
 *
 * ── ⚠️⚠️⚠️ ⛔ O PEDIDO (inspeção clínica, 2026-09-08) ────────────────────
 *
 * ⛔ ⛔ *"Neurológico ao clicar tem que abrir calculadora para o usuário
 * escolher os números, ⛔ e a calculadora coloca no APP o resultado."*
 *
 * ⚠️ ⛔ E a condição que veio junto: *"⛔ não criar interpretação clínica
 * nova"*, ⛔ e *"⛔ não misturar origens silenciosamente"*.
 */

test.use({ viewport: { width: 375, height: 812 } });

async function abrirD(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
  await expect(page.getByTestId("avc-campo-glasgow")).toBeVisible();
}

/** ⚠️ E 3 (à dor) + V 4 (confusa) + M 5 (localiza) = **12**. */
async function escolherEVM(page: Page, e: number, v: number, m: number) {
  await page.getByTestId(`avc-glasgow-e-${e}`).click();
  await page.getByTestId(`avc-glasgow-v-${v}`).click();
  await page.getByTestId(`avc-glasgow-m-${m}`).click();
}

test.describe("AVC · Glasgow — a calculadora", () => {
  /* ══ ⚠️⚠️⚠️ 1 · ABRE PELO CAMPO, SOMA ⛔ E PREENCHE ═══════════════════ */

  test("⛔ abrir, escolher E · V · M, ⛔ e o total cai no campo",
    async ({ page }) => {
      await abrirD(page);

      /** ⛔ Antes de abrir, ⛔ a calculadora ⛔ não ocupa a tela. */
      await expect(page.getByTestId("avc-glasgow-calculadora")).toHaveCount(0);
      await page.getByTestId("avc-glasgow-abrir").click();
      await expect(page.getByTestId("avc-glasgow-calculadora")).toBeVisible();

      /** ⚠️⚠️ ⛔ SEM OS TRÊS, ⛔ NÃO HÁ SOMA — ⛔ nem soma parcial. */
      await page.getByTestId("avc-glasgow-e-3").click();
      await expect(page.getByTestId("avc-glasgow-total"))
        .toContainText(/Escolha E, V e M/i);

      await page.getByTestId("avc-glasgow-v-4").click();
      await page.getByTestId("avc-glasgow-m-5").click();
      await expect(page.getByTestId("avc-glasgow-total")).toContainText("12");

      /** ⚠️ ⛔ E ⛔ só o gesto explícito grava. */
      await page.getByTestId("avc-glasgow-usar").click();
      await expect(page.getByTestId("avc-num-caixa-glasgow")).toHaveValue("12");
      await expect(page.getByTestId("avc-glasgow-calculadora")).toHaveCount(0);
    });

  /* ══ ⚠️⚠️⚠️ 2 · REABRIR MOSTRA O QUE FOI ESCOLHIDO ══════════════════ */

  test("⛔ reabrir traz E · V · M preenchidos, ⛔ e editar um refaz o total",
    async ({ page }) => {
      await abrirD(page);
      await page.getByTestId("avc-glasgow-abrir").click();
      await escolherEVM(page, 3, 4, 5);
      await page.getByTestId("avc-glasgow-usar").click();

      /** ⚠️⚠️ ⛔ O botão passa a dizer **rever** — ⛔ ele ⛔ não finge que é novo. */
      await expect(page.getByTestId("avc-glasgow-abrir")).toContainText(/Rever/i);
      await page.getByTestId("avc-glasgow-abrir").click();

      /** ⛔ Os três voltam marcados. */
      for (const id of ["avc-glasgow-e-3", "avc-glasgow-v-4", "avc-glasgow-m-5"]) {
        await expect(page.getByTestId(id)).toHaveAttribute("aria-checked", "true");
      }
      await expect(page.getByTestId("avc-glasgow-total")).toContainText("12");

      /** ⚠️ Editar **um** componente refaz a soma: E 4 → 13. */
      await page.getByTestId("avc-glasgow-e-4").click();
      await expect(page.getByTestId("avc-glasgow-total")).toContainText("13");
      await page.getByTestId("avc-glasgow-usar").click();
      await expect(page.getByTestId("avc-num-caixa-glasgow")).toHaveValue("13");
    });

  /* ══ ⚠️⚠️ 3 · O VALOR DIRETO CONTINUA ═══════════════════════════════ */

  test("⛔ digitar o total direto continua funcionando", async ({ page }) => {
    await abrirD(page);
    const caixa = page.getByTestId("avc-num-caixa-glasgow");
    await caixa.fill("14");
    await caixa.blur();
    await expect(caixa).toHaveValue("14");
    /** ⚠️ ⛔ E a calculadora segue **oferecida**, ⛔ e ⛔ não imposta. */
    await expect(page.getByTestId("avc-glasgow-abrir")).toBeVisible();
  });

  /* ══ ⚠️⚠️⚠️ 4 · AS DUAS ORIGENS SÃO DISTINGUÍVEIS ═══════════════════ */

  /**
   * ⚠️⚠️ ⛔ EXIGÊNCIA DO AUTOR: *"⛔ não misturar origens silenciosamente"* ⛔ e
   * *"registrar a nova origem ⛔ sem apagar silenciosamente a trilha
   * anterior"*.
   *
   * ⚠️ ⛔ A origem é medida **no histórico do campo**, ⛔ que é onde a trilha
   * aparece para o médico.
   */
  test("⛔ calculado ⛔ e informado ficam distinguíveis na trilha",
    async ({ page }) => {
      await abrirD(page);

      /** ⛔ Antes de qualquer número, ⛔ não há origem a declarar. */
      await expect(page.getByTestId("avc-glasgow-origem")).toHaveCount(0);

      /** ⛔ 1 · digitado — ⛔ e a tela **diz** que foi digitado. */
      const caixa = page.getByTestId("avc-num-caixa-glasgow");
      await caixa.fill("14");
      await caixa.blur();
      await expect(page.getByTestId("avc-glasgow-origem"))
        .toContainText(/Informado diretamente/i);

      /** ⛔ 2 · depois, calculado — ⛔ e a leitura **vira**. */
      await page.getByTestId("avc-glasgow-abrir").click();
      await escolherEVM(page, 3, 4, 5);
      await page.getByTestId("avc-glasgow-usar").click();
      await expect(caixa).toHaveValue("12");
      await expect(page.getByTestId("avc-glasgow-origem"))
        .toContainText(/Calculado pelos componentes/i);

      /**
       * ⚠️⚠️ ⛔ E O CONTRÁRIO **⛔ NÃO APAGA OS COMPONENTES**: digitar por cima
       * troca a origem, ⛔ e a divergência entre total ⛔ e E · V · M fica
       * **visível** — ⛔ e ⛔ não corrigida sozinha.
       */
      await caixa.fill("9");
      await caixa.blur();
      await expect(caixa).toHaveValue("9");
      /** ⚠️ ⛔ E a origem volta a dizer a **verdade** sobre este 9. */
      await expect(page.getByTestId("avc-glasgow-origem"))
        .toContainText(/Informado diretamente/i);

      await page.getByTestId("avc-glasgow-abrir").click();
      for (const id of ["avc-glasgow-e-3", "avc-glasgow-v-4", "avc-glasgow-m-5"]) {
        await expect(
          page.getByTestId(id),
          "⛔ digitar o total apagou os componentes"
        ).toHaveAttribute("aria-checked", "true");
      }
      /** ⛔ Os componentes seguem somando 12, ⛔ e o total gravado é 9. */
      await expect(page.getByTestId("avc-glasgow-total")).toContainText("12");
    });

  /* ══ ⚠️⚠️⚠️ 5 · ⛔ NENHUMA CONDUTA NOVA ═════════════════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA CLÍNICA DESTE ARQUIVO.
   *
   * ⛔ ⛔ A ferramenta original interpreta — *"GCS 8 — limiar clássico de
   * proteção de via aérea"*, *"GCS ≤ 7 — grave"*. ⚠️ ⛔ Essas frases são das
   * fontes **daquele** módulo, ⛔ e o motor do AVC declara que ⛔ **⛔ nenhuma
   * fonte deste módulo dá corte para Glasgow** (**E-31**).
   */
  test("⛔ a calculadora traz o número, ⛔ e ⛔ NÃO o juízo", async ({ page }) => {
    await abrirD(page);
    await page.getByTestId("avc-glasgow-abrir").click();
    /** ⛔ Um Glasgow **8** — ⛔ o limiar que a outra ferramenta comenta. */
    await escolherEVM(page, 2, 2, 4);
    await expect(page.getByTestId("avc-glasgow-total")).toContainText("8");
    await page.getByTestId("avc-glasgow-usar").click();

    /**
     * ⚠️⚠️ ⛔ NA **SUPERFÍCIE**, ⛔ e ⛔ não no `body`: ⛔ a landing fica montada
     * acima da rota no DOM, ⛔ e ⛔ ela fala de *"intubação em sequência
     * rápida"* ⛔ no texto de marketing. ⛔ Medir o `body` acusaria a landing.
     */
    const corpo = page.getByTestId("avc-superficie-a-conteudo");
    await expect(corpo).not.toContainText(/GCS\s*8/i);
    await expect(corpo).not.toContainText(/proteção de via aérea/i);
    await expect(corpo).not.toContainText(/intubar|intubação/i);
    await expect(corpo).not.toContainText(/limiar clássico/i);
    await expect(corpo).not.toContainText(/grave/i);

    /**
     * ⚠️ ⛔ E o eixo **D** continua acendendo pelo que ⛔ ele sempre acendeu —
     * ⛔ a **glicemia** —, ⛔ e ⛔ não pelo Glasgow.
     */
    await expect(page.getByTestId("avc-ameaca-glicemia")).toContainText(/Não avaliado/i);
  });
});
