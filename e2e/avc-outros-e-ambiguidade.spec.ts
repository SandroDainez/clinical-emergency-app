import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma } from "./helpers";

/**
 * PROMETE: que *"Outros"* aceite ser **escrito**, que o escrito ⛔ volte ⛔ ao
 *   reabrir, ⛔ e que a tela ⛔ **⛔ nunca** diga *"1 a resolver aqui"* ⛔ e
 *   *"nada espera por ação"* ⛔ ao mesmo tempo.
 *
 * NÃO PROMETE: que o que se escreve vire conduta. ⛔ ⛔ Ele ⛔ **⛔ não** vira —
 *   ⛔ e ⛔ há prova de nó medindo ⛔ isso (`test:avc-consumidores`).
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px**.
 *
 * ── ⚠️⚠️⚠️ OS PEDIDOS (inspeção clínica, 2026-09-09) ────────────────────
 *
 * ⛔ ⛔ *"Onde tem outros tem que ter opção de adicionar quais outras o
 * usuário quiser adicionar escrevendo."*
 *
 * ⛔ ⛔ *"Aqui aparece 1 a resolver mas ⛔ não indica que tem que resolver,
 * ficou ambíguo."*
 */

test.use({ viewport: { width: 375, height: 812 } });

async function paciente(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-paciente").click();
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
}

test.describe("AVC · *«Outros»* se escreve, ⛔ e a tela ⛔ não se contradiz", () => {
  /* ══ ⚠️⚠️⚠️ 1 · *"OUTROS"* ABRE UMA CAIXA ══════════════════════════ */

  test("⛔ marcar *«Outros»* abre onde escrever, ⛔ e o escrito fica",
    async ({ page }) => {
      await paciente(page);

      const bloco = page.getByTestId("avc-bloco-abrir-comorbidades");
      if (await bloco.count()) await bloco.click();

      const campo = page.getByTestId("avc-campo-comorbidades");
      await campo.scrollIntoViewIfNeeded();

      /** ⛔ Fechada ⛔ antes do gesto: ⛔ ela ⛔ não ocupa a tela ⛔ sem motivo. */
      await expect(page.getByTestId("avc-outros-comorbidades")).toHaveCount(0);

      await page.getByTestId("avc-item-comorbidades-Outros").click();
      const caixa = page.getByTestId("avc-outros-comorbidades");
      await expect(caixa).toBeVisible();

      await caixa.fill("Doença de Chagas, hipotireoidismo");
      await caixa.blur();

      /** ⚠️ ⛔ E ⛔ o escrito entra ⛔ no resumo — ⛔ senão *"Outros"* ⛔ ficaria ⛔ no lugar da coisa. */
      await expect(page.getByTestId("avc-multipla-resumo-comorbidades")).toContainText(
        /Doença de Chagas/i
      );

      /** ⛔ E volta da **trilha** depois de sair ⛔ e voltar da tela. */
      await page.getByTestId("avc-aba-estabilizacao").click();
      await page.getByTestId("avc-aba-paciente").click();
      const bloco2 = page.getByTestId("avc-bloco-abrir-comorbidades");
      if (await bloco2.count()) await bloco2.click();
      await expect(page.getByTestId("avc-outros-comorbidades")).toHaveValue(
        /Doença de Chagas/
      );
    });

  /* ══ ⚠️⚠️⚠️ 2 · ⛔ ONDE ⛔ ELA ⛔ NÃO PODE EXISTIR ══════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA CLÍNICA DESTE ARQUIVO.
   *
   * ⛔ ⛔ `anticoagulante_em_uso` alimenta `derivacoes-d.ts`, ⛔ e
   * `antecedentes_intracranianos` vira **contraindicação** ⛔ opção por opção.
   * ⚠️ ⛔ Um *"outro anticoagulante"* digitado ⛔ **⛔ pareceria registrado ⛔ e
   * seria invisível ao portão** — ⛔ o pior defeito possível ⛔ neste módulo.
   */
  test("⛔ campo que alguém lê para decidir ⛔ NÃO oferece texto livre",
    async ({ page }) => {
      await paciente(page);
      /** ⚠️ ⛔ Os quatro de contraindicação mudaram de casa em 2026-09-07. */
      await page.getByTestId("avc-aba-neurologico").click();
      for (const id of ["anticoagulante_em_uso", "antecedentes_intracranianos"]) {
        await expect(
          page.getByTestId(`avc-outros-${id}`),
          `⛔ ${id} alimenta uma decisão ⛔ e ⛔ não pode aceitar texto livre`
        ).toHaveCount(0);
      }
    });

  /* ══ ⚠️⚠️⚠️ 3 · ⛔ NADA DE *"1 A RESOLVER"* COM *"NADA A FAZER"* ═══ */

  test("⛔ o que foi mandado para Correções **aparece** ⛔ em Correções",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);

      /** ⛔ 271 mg/dL — ⛔ hiperglicemia: pede conduta, ⛔ e ⛔ **⛔ não** bloqueia. */
      const glicemia = page.getByTestId("avc-num-caixa-glicemia");
      await glicemia.fill("271");
      await glicemia.blur();

      const atalho = page.getByText(/Abrir Correções/i).first();
      await atalho.click();
      const corpo = page.getByTestId("avc-superficie-e-conteudo");
      await expect(corpo).toBeVisible();

      const cabecalho = page.getByTestId("avc-fase-pendentes");
      const pendentes = (await cabecalho.innerText()).trim();

      /**
       * ⚠️⚠️ ⛔ A CONTRADIÇÃO MEDIDA: ⛔ se o cabeçalho conta ⛔ alguma coisa,
       * ⛔ o corpo ⛔ **⛔ não** pode dizer que ⛔ nada espera por ação.
       */
      if (/^[1-9]/.test(pendentes)) {
        await expect(
          corpo,
          `⛔ o cabeçalho diz "${pendentes}" ⛔ e o corpo diz que ⛔ nada espera por ação`
        ).not.toContainText(/Nada nesta tela espera por ação/i);

        /** ⛔ E o item ⛔ que o mandou para cá ⛔ está **⛔ na tela**. */
        await expect(corpo).toContainText(/Hiperglicemia/i);
      }
    });
});
