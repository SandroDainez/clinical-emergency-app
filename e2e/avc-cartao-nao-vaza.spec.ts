import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma } from "./helpers";

/**
 * PROMETE: que ⛔ nada que o médico abre **escape do cartão**, ⛔ que ⛔ nenhuma
 *   frase apareça **duas vezes**, ⛔ que ⛔ nenhum insumo chegue à tela como
 *   **identificador de programa**, ⛔ e que a barra de fases **⛔ sempre diga
 *   onde ele está**.
 *
 * NÃO PROMETE: que o texto seja bonito. ⛔ Estas são quatro medidas, ⛔ e ⛔ não
 *   quatro opiniões.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px**.
 *
 * ── ⚠️⚠️⚠️ O PEDIDO (inspeção clínica, 2026-09-09) ──────────────────────
 *
 * ⛔ ⛔ *"Isso está confuso, foge do card, as palavras e ⛔ não está mostrando
 * o que precisa mostrar de forma adequada."* · *"Tem várias coisas fugindo
 * dos cards."* · *"De acordo com a página que eu estiver aberta essa barra
 * deve marcar para eu saber onde estou."*
 */

test.use({ viewport: { width: 375, height: 812 } });

/** ⚠️ Abre ⛔ todo `ⓘ` visível — ⛔ é fechado que ⛔ nenhum deles vaza. */
async function abrirTodosOsCriterios(page: Page) {
  const gatilhos = page.locator('[data-testid^="avc-info-"]:visible');
  for (let i = 0; i < (await gatilhos.count()); i++) {
    const t = await gatilhos.nth(i).getAttribute("data-testid");
    if (!t || t.startsWith("avc-info-texto-")) continue;
    await gatilhos.nth(i).click({ timeout: 3000 }).catch(() => {});
  }
}

/** ⚠️ ⛔ O que passou da largura da janela — ⛔ medido, ⛔ e ⛔ não olhado. */
async function oQueVaza(page: Page) {
  return page.evaluate(() => {
    const fora: { id: string; direita: number }[] = [];
    document.querySelectorAll('[data-testid^="avc-info-texto-"]').forEach((el) => {
      const r = (el as HTMLElement).getBoundingClientRect();
      if (r.width === 0) return;
      /** ⛔ 1 px de folga: arredondamento de layout ⛔ não é vazamento. */
      if (r.right > window.innerWidth + 1) {
        fora.push({ id: (el as HTMLElement).dataset.testid || "?", direita: Math.round(r.right) });
      }
    });
    return fora;
  });
}

async function estabilizacao(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
}

test.describe("AVC · o cartão segura o que está dentro dele", () => {
  /* ══ ⚠️⚠️⚠️ 1 · ⛔ NADA ESCAPA PELA DIREITA ═════════════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA QUE FALTAVA. ⛔ Antes da correção, ⛔ com a janela em
   * **375**, `disfuncao_bulbar` terminava em **1119 px**, `consciencia_rebaixada`
   * em **1104** ⛔ e `a-prioridade` em **976** — ⛔ e ⛔ nenhuma trava reclamava.
   */
  test("⛔ nenhum critério aberto sai do cartão, ⛔ em 375 px", async ({ page }) => {
    await estabilizacao(page);
    await abrirTodosOsCriterios(page);

    const vazando = await oQueVaza(page);
    expect(vazando, `⛔ texto fora da janela de 375 px: ${JSON.stringify(vazando)}`).toEqual([]);

    /** ⚠️ ⛔ E a página ⛔ não rola de lado — ⛔ o sintoma pelo outro lado. */
    const rolaDeLado = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1
    );
    expect(rolaDeLado, "⛔ a página rola na horizontal").toBe(false);
  });

  /* ══ ⚠️⚠️⚠️ 2 · A MESMA FRASE ⛔ NÃO APARECE DUAS VEZES ═════════════ */

  test("⛔ o critério da leitura ⛔ não é escrito duas vezes", async ({ page }) => {
    await estabilizacao(page);
    await abrirTodosOsCriterios(page);

    const repetidas = await page.evaluate(() => {
      const ruins: { id: string; frase: string }[] = [];
      document.querySelectorAll('[data-testid^="avc-leitura-"]').forEach((el) => {
        const txt = (el as HTMLElement).innerText;
        /** ⛔ Frases longas ⛔ só: um *"Sim"* repetido ⛔ não é duplicação. */
        for (const linha of new Set(txt.split("\n").map((l) => l.trim()))) {
          if (linha.length < 40) continue;
          const vezes = txt.split(linha).length - 1;
          if (vezes > 1) {
            ruins.push({ id: (el as HTMLElement).dataset.testid || "?", frase: linha.slice(0, 60) });
          }
        }
      });
      return ruins;
    });
    expect(repetidas, `⛔ frase repetida na mesma leitura: ${JSON.stringify(repetidas)}`).toEqual([]);
  });

  /* ══ ⚠️⚠️⚠️ 3 · ⛔ NENHUM `id` CRU NA TELA ══════════════════════════ */

  /**
   * ⚠️ ⛔ A tela escrevia *"Insumos: Glicemia capilar, **deficit_focal**,
   * **nihss_calculado**, **nihss_informado**"* — ⛔ um nome ⛔ e três
   * identificadores de programa ⛔ na mesma frase.
   */
  test("⛔ os insumos são nomeados, ⛔ e ⛔ não identificados", async ({ page }) => {
    await estabilizacao(page);
    await abrirTodosOsCriterios(page);

    const crus = await page.evaluate(() => {
      const corpo = document.querySelector('[data-testid="avc-superficie-a-conteudo"]');
      const txt = (corpo as HTMLElement | null)?.innerText ?? "";
      /** ⛔ `minúsculas_com_underline` ⛔ é como um `id` se parece, ⛔ e ⛔ não uma palavra. */
      return [...new Set(txt.match(/\b[a-z]+(?:_[a-z0-9]+)+\b/g) ?? [])];
    });
    expect(crus, `⛔ identificador cru na tela: ${JSON.stringify(crus)}`).toEqual([]);
  });

  /* ══ ⚠️⚠️⚠️ 4 · A BARRA ⛔ SEMPRE DIZ ONDE VOCÊ ESTÁ ════════════════ */

  /**
   * ⚠️⚠️ ⛔ O caminho real do autor: pendência de **hiperglicemia** →
   * *"Abrir Correções"*. ⛔ ⛔ Hiperglicemia ⛔ não é bloqueio, ⛔ então
   * `correcoesEhRelevante` é falso — ⛔ e a aba ⛔ não entrava ⛔ na barra ⛔ com
   * ⛔ ele parado ⛔ em cima dela.
   */
  test("⛔ a aba da tela aberta fica marcada, ⛔ inclusive em Correções",
    async ({ page }) => {
      await estabilizacao(page);

      /** ⛔ 271 mg/dL — ⛔ hiperglicemia, ⛔ e ⛔ **⛔ não** bloqueio. */
      const caixa = page.getByTestId("avc-num-caixa-glicemia");
      await caixa.fill("271");
      await caixa.blur();

      const marcada = async () =>
        page.locator('[data-testid^="avc-aba-"][aria-selected="true"]').count();

      expect(await marcada(), "⛔ a Estabilização ⛔ não está marcada").toBe(1);

      /** ⛔ Vai para Correções pelo mesmo gesto que ⛔ ele usou. */
      const abrir = page.getByTestId("avc-prioridade-imagem-acao");
      const atalho = page.getByText(/Abrir Correções/i).first();
      if (await atalho.count()) await atalho.click();
      else if (await abrir.count()) await abrir.click();

      await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();
      expect(
        await marcada(),
        "⛔ o médico está numa tela que a barra diz ⛔ não existir"
      ).toBe(1);

      /**
       * ⚠️⚠️ ⛔ E ⛔ ELA PRECISA ESTAR **⛔ VISÍVEL**. ⛔ A primeira versão desta
       * trava parou ⛔ na linha acima ⛔ e passou — ⛔ enquanto a captura ⛔ do
       * autor mostrava a barra ⛔ sem marca ⛔ nenhuma. ⛔ A aba marcada existia,
       * ⛔ **⛔ fora da tela**: a barra rola, ⛔ e ⛔ ela ⛔ não tinha rolado.
       *
       * ⛔ ⛔ *"Para eu saber onde estou"* ⛔ é sobre o que se **vê**.
       */
      const abaMarcada = page.locator('[data-testid^="avc-aba-"][aria-selected="true"]').first();
      const cx = await abaMarcada.boundingBox();
      expect(cx, "⛔ a aba marcada ⛔ não tem posição").not.toBeNull();
      const janela = page.viewportSize()!.width;
      expect(
        cx!.x >= -1 && cx!.x + cx!.width <= janela + 1,
        `⛔ a aba marcada está fora da tela: ${JSON.stringify(cx)} em ${janela} px`
      ).toBe(true);
    });

  /* ══ ⚠️⚠️⚠️ 5 · *"ABRIR"* ⛔ ABRE ALGUMA COISA ══════════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"quando clico em abrir nessas
   * pendências ⛔ não abre ⛔ nada"* — ⛔ com uma captura de **três** cartões
   * dizendo *"Abrir Avaliação AVC"*, ⛔ tirada **⛔ de dentro** da Avaliação
   * AVC.
   *
   * ⛔ ⛔ Um botão que promete uma viagem ⛔ e ⛔ não sai do lugar ⛔ é pior que
   * ⛔ botão nenhum: ⛔ ele faz o médico duvidar ⛔ do toque, ⛔ e ⛔ não do app.
   */
  test("⛔ a pendência da tela em que já se está **leva até o campo**",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(page.getByTestId("avc-superficie-b-conteudo")).toBeVisible();

      const pendencia = page.getByTestId("avc-pendencia-deficit_focal");
      await expect(
        pendencia,
        "⛔ o cenário mudou: ⛔ esta pendência ⛔ não está mais aberta ⛔ aqui"
      ).toBeVisible();

      /** ⛔ Longe do campo ⛔ de propósito — ⛔ é ⛔ isso que o toque tem de vencer. */
      await pendencia.scrollIntoViewIfNeeded();
      const campo = page.getByTestId("avc-campo-deficit_focal");
      const antes = await campo.boundingBox();

      await pendencia.click();
      await page.waitForTimeout(600);

      const depois = await campo.boundingBox();
      expect(depois, "⛔ o campo sumiu depois do toque").not.toBeNull();

      /**
       * ⚠️ ⛔ A medida é **⛔ o campo dentro da janela**, ⛔ e ⛔ não *"a tela
       * mudou"* — ⛔ porque ⛔ aqui ⛔ ela ⛔ não muda: ⛔ é a mesma superfície.
       */
      const altura = page.viewportSize()!.height;
      expect(
        depois!.y >= -1 && depois!.y < altura,
        `⛔ o toque ⛔ não levou até o campo: antes ${JSON.stringify(antes)}, depois ${JSON.stringify(depois)}, janela ${altura}`
      ).toBe(true);
    });
});
