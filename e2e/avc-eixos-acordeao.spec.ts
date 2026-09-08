import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que os tiles **A–E** façam algo que a rolagem ⛔ não fazia — ⛔ abrir
 *   ⛔ e fechar o eixo —, ⛔ e que o médico consiga ver **o que já preencheu**
 *   ⛔ sem abrir o bloco.
 *
 * NÃO PROMETE: que o conteúdo clínico de cada eixo esteja certo — ⛔ isso é
 *   `avc-superficie-a` ⛔ e as provas de conteúdo. ⛔ E ⛔ **⛔ não** promete
 *   estética.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px**.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO (inspeção clínica, 2026-09-08) ────────────────────
 *
 * ⛔ ⛔ *"Quando clico em um deles vou direcionado para preencher ⛔ ele, ⛔ mas
 * parece ficar um pouco confuso, porque se rolar a página estão todos juntos
 * (…) esses botões de cima A B C D E ⛔ não estão tendo sentido, ⛔ já que todos
 * direcionam para o mesmo lugar (…) o usuário pode preencher coisas ⛔ e depois
 * ⛔ nem sabe o que preencheu."*
 */

test.use({ viewport: { width: 375, height: 812 } });

const aba = (p: Page, id: string) => p.getByTestId(`avc-aba-${id}`).click();

/** ⚠️ O bloco está aberto ⛔ quando os campos ⛔ dele estão na tela. */
const camposDe = (p: Page, grupo: string) =>
  p.getByTestId(`avc-grupo-${grupo}`).locator('[data-testid^="avc-campo-"]');

async function abrirEstabilizacao(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await aba(page, "estabilizacao");
  await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
}

async function medir(page: Page, campo: string, valor: string) {
  const caixa = page.getByTestId(`avc-num-caixa-${campo}`);
  await caixa.fill(valor);
  await caixa.blur();
}

test.describe("AVC · Estabilização — o acordeão dos eixos", () => {
  /* ══ ⚠️⚠️⚠️ 1 · ⛔ SÓ O PRIMEIRO ⛔ NÃO CONCLUÍDO NASCE ABERTO ═══════════ */

  test("⛔ ao abrir, ⛔ só **A** está aberto", async ({ page }) => {
    await abrirEstabilizacao(page);

    await expect(camposDe(page, "via-aerea").first()).toBeVisible();
    for (const g of ["respiracao", "pressao", "neurologico-inicial", "exposicao"]) {
      await expect(camposDe(page, g), `⛔ ${g} nasceu aberto`).toHaveCount(0);
      /** ⚠️ ⛔ E o fechado ⛔ não fica mudo: ⛔ ele diz o que tem. */
      await expect(page.getByTestId(`avc-eixo-resumo-${g}`)).toBeVisible();
    }

    /**
     * ⚠️ ⛔ Monitorização ⛔ **não é eixo do ABCDE** — ⛔ ela ⛔ não recolhe:
     * ⛔ instalar monitor ⛔ e pegar acesso precede avaliar.
     */
    await expect(camposDe(page, "monitorizacao").first()).toBeVisible();
  });

  /* ══ ⚠️⚠️ 2 · O TILE ABRE O SEU EIXO — ⛔ E ⛔ NÃO ROLA ═══════════════ */

  test("⛔ o tile B abre B, ⛔ o tile C abre C, ⛔ e abrir B ⛔ não fecha C",
    async ({ page }) => {
      await abrirEstabilizacao(page);

      await page.getByTestId("avc-ameaca-respiracao").click();
      await expect(camposDe(page, "respiracao").first()).toBeVisible();

      await page.getByTestId("avc-ameaca-pressao").click();
      await expect(camposDe(page, "pressao").first()).toBeVisible();

      /**
       * ⚠️⚠️ ⛔ **VÁRIOS ABERTOS AO MESMO TEMPO** — decisão do autor. ⛔ Forçar
       * um por vez esconderia o que o médico quer comparar.
       */
      await expect(camposDe(page, "respiracao").first()).toBeVisible();

      /** ⚠️ ⛔ E o mesmo tile **fecha** — ⛔ ele alterna, ⛔ e ⛔ não só abre. */
      await page.getByTestId("avc-ameaca-respiracao").click();
      await expect(camposDe(page, "respiracao")).toHaveCount(0);
    });

  /* ══ ⚠️⚠️⚠️ 3 · CONCLUIR FECHA O ATUAL ⛔ E ABRE O PRÓXIMO ══════════════ */

  test("⛔ concluir **A** fecha A ⛔ e abre **B**", async ({ page }) => {
    await abrirEstabilizacao(page);
    await expect(camposDe(page, "via-aerea").first()).toBeVisible();
    await expect(camposDe(page, "respiracao")).toHaveCount(0);

    await page.getByTestId("avc-eixo-concluir-via-aerea").click();

    await expect(camposDe(page, "via-aerea")).toHaveCount(0);
    await expect(camposDe(page, "respiracao").first()).toBeVisible();
    await expect(page.getByTestId("avc-ameaca-progresso-via_aerea"))
      .toContainText(/Avaliação concluída/i);
  });

  /* ══ ⚠️⚠️ 4 · ⛔ *"PRÓXIMO"* ⛔ NÃO EXISTE MAIS ══════════════════════════ */

  test("⛔ o atalho *«Próximo»* saiu da tela", async ({ page }) => {
    await abrirEstabilizacao(page);
    await expect(page.getByTestId("avc-proximo-eixo")).toHaveCount(0);
    await expect(page.getByTestId("avc-ameacas-imediatas"))
      .not.toContainText(/^Próximo:/m);
    /** ⚠️ ⛔ E a fileira antiga de *"Concluir"* ⛔ também ⛔ não está mais ⛔ lá. */
    await expect(page.locator('[data-testid^="avc-concluir-"]')).toHaveCount(0);
  });

  /* ══ ⚠️⚠️⚠️ 5 · O RESUMO REFLETE O QUE FOI REGISTRADO ══════════════════ */

  test("⛔ o eixo fechado mostra o que foi registrado", async ({ page }) => {
    await abrirEstabilizacao(page);

    /** ⚠️ O gesto real: abrir C, medir, ⛔ e fechar. */
    await page.getByTestId("avc-ameaca-pressao").click();
    await medir(page, "pas", "200");
    await medir(page, "pad", "120");
    await medir(page, "fc", "110");
    await page.getByTestId("avc-ameaca-pressao").click();

    const resumo = page.getByTestId("avc-eixo-resumo-pressao");
    await expect(resumo).toContainText("200/120");
    await expect(resumo).toContainText("110");
    /** ⚠️⚠️ ⛔ E ⛔ ele ⛔ não interpreta: ⛔ nenhuma palavra de juízo. */
    await expect(resumo).not.toContainText(/normal|alterad|grave|favor/i);
  });

  /* ══ ⚠️⚠️⚠️ 6 · CONCLUIR ⛔ SEM DADO ⛔ NÃO VIRA *"AVALIADO"* ════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA CLÍNICA DESTE ARQUIVO.
   *
   * ⛔ ⛔ *"⛔ Não usar «concluído» como sinônimo de normal/favorável"* — ⛔ e a
   * forma mais fácil de violar isso é deixar o progresso **substituir** o
   * estado clínico. ⛔ Aqui ⛔ eles ficam em linhas diferentes, ⛔ e a frase do
   * resumo diz as duas coisas ⛔ sem que uma signifique a outra.
   */
  test("⛔ concluir ⛔ sem dados ⛔ não afirma ⛔ nada sobre o paciente",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await page.getByTestId("avc-eixo-concluir-via-aerea").click();

      await expect(page.getByTestId("avc-eixo-resumo-via-aerea"))
        .toContainText(/Sem dados clínicos registrados · Avaliação concluída/i);

      const tile = page.getByTestId("avc-ameaca-via_aerea");
      /** ⛔ ⛔ O tile ⛔ **⛔ não** vira favorável por ter sido concluído. */
      await expect(tile).not.toContainText(/Favorável/i);
      await expect(tile).not.toContainText(/Sem sinais/i);
    });

  /* ══ ⚠️⚠️ 7 · ABRIR ⛔ NÃO CONCLUI, ⛔ E CONCLUIR ⛔ NÃO REGISTRA ═══════ */

  test("⛔ tocar no tile ⛔ NÃO marca o eixo como concluído", async ({ page }) => {
    await abrirEstabilizacao(page);
    await page.getByTestId("avc-ameaca-pressao").click();
    await expect(page.getByTestId("avc-ameaca-progresso-pressao")).toHaveCount(0);
    await page.getByTestId("avc-ameaca-pressao").click();
    await expect(page.getByTestId("avc-ameaca-progresso-pressao")).toHaveCount(0);
  });

  test("⛔ concluir ⛔ NÃO cria fato clínico", async ({ page }) => {
    await abrirEstabilizacao(page);
    await page.getByTestId("avc-eixo-concluir-via-aerea").click();

    /**
     * ⚠️⚠️ ⛔ Se concluir gravasse fato, o campo apareceria **respondido** —
     * ⛔ e a trilha registraria uma avaliação que ⛔ ninguém fez.
     */
    await page.getByTestId("avc-ameaca-via_aerea").click();
    await expect(page.getByTestId("avc-campo-consciencia_rebaixada"))
      .not.toContainText(/✓/);
  });

  /* ══ ⚠️⚠️⚠️ 8 · ⛔ NENHUM CAMPO FICA INALCANÇÁVEL ═══════════════════════ */

  test("⛔ todo campo do ABCDE continua alcançável", async ({ page }) => {
    await abrirEstabilizacao(page);

    for (const [tile, grupo] of [
      ["via_aerea", "via-aerea"],
      ["respiracao", "respiracao"],
      ["pressao", "pressao"],
      ["glicemia", "neurologico-inicial"],
      ["exposicao", "exposicao"],
    ] as const) {
      const fechado = (await camposDe(page, grupo).count()) === 0;
      if (fechado) await page.getByTestId(`avc-ameaca-${tile}`).click();
      await expect(camposDe(page, grupo).first(), `⛔ ${grupo} inalcançável`).toBeVisible();
    }

    /** ⚠️ ⛔ E o `Concluir` de cada eixo mora **dentro** ⛔ dele. */
    for (const g of ["via-aerea", "respiracao", "pressao", "neurologico-inicial", "exposicao"]) {
      await expect(page.getByTestId(`avc-eixo-concluir-${g}`)).toBeVisible();
    }
  });
});
