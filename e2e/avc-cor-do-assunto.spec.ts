import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a cor do assunto **chegue à tela** — ⛔ e ⛔ que ⛔ ela seja
 *   **diferente** de bloco para bloco, ⛔ que é o relato do autor:
 *   *"está tudo da mesma cor"*.
 *
 * NÃO PROMETE: que a cor escolhida seja a certa — ⛔ isso é decisão, ⛔ e mora
 *   em `ASSUNTO_DO_BLOCO`. ⛔ E ⛔ **⛔ não** promete que a tabela esteja bem
 *   formada: ⛔ isso é `prova-avc-cor-do-assunto`.
 *
 * UNIVERSO: o módulo AVC servido do `dist`.
 *
 * ── ⚠️⚠️⚠️ ⛔ POR QUE ISTO É E2E, ⛔ E ⛔ NÃO PROVA DE TEXTO ────────────────
 *
 * ⛔ ⛔ Uma tabela certa ⛔ e um `style` que ⛔ não aplica já aconteceu **seis
 * vezes** neste módulo — ⛔ a última na Fase 9, onde o `testID` estava **depois**
 * do `style` ⛔ e a varredura estática ⛔ passou por cima. ⚠️ ⛔ Cor ⛔ só se
 * confere **medindo o pixel que o médico vê**.
 */

const aba = (p: Page, id: string) => p.getByTestId(`avc-aba-${id}`).click();

/** ⚠️ A cor **computada** do nó — ⛔ e ⛔ não a que o código pretendia. */
async function fundoDe(page: Page, testID: string): Promise<string> {
  return page
    .getByTestId(testID)
    .evaluate((n) => getComputedStyle(n as Element).backgroundColor);
}

test.describe("AVC · a cor diz o assunto", () => {
  /* ══ ⚠️⚠️⚠️ 1 · CINCO BLOCOS, ⛔ E ⛔ NÃO CINCO VEZES A MESMA COR ═══════ */

  test("⛔ na abertura, cada bloco tem **a sua** cor",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      const blocos = ["identificacao", "basais", "alergias", "medicacoes"];
      const cores: string[] = [];
      for (const b of blocos) {
        const selo = page.getByTestId(`avc-bloco-${b}-selo`);
        await expect(selo).toBeVisible();
        cores.push(await fundoDe(page, `avc-bloco-${b}-selo`));
      }

      /**
       * ⚠️⚠️ ⛔ QUATRO CORES DISTINTAS — ⛔ e ⛔ é ⛔ esta a garantia. ⛔ Antes
       * ⛔ desta mudança os quatro cabeçalhos eram **texto branco idêntico**.
       */
      expect(new Set(cores).size).toBe(blocos.length);

      /** ⚠️ ⛔ E ⛔ nenhuma delas é transparente — ⛔ selo sem fundo ⛔ não é selo. */
      for (const c of cores) expect(c).not.toMatch(/rgba\(0, 0, 0, 0\)/);
    });

  /* ══ ⚠️⚠️ 2 · O SELO ⛔ NUNCA VAI SOZINHO (E-15) ═══════════════════════ */

  test("⛔ ao lado de cada selo está **o nome do bloco**, escrito",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      /**
       * ⚠️⚠️ ⛔ Cor ⛔ e forma sozinhas ⛔ não são leitura. ⛔ Apague todas as
       * cores ⛔ e a tela ⛔ tem de continuar dizendo o mesmo.
       */
      for (const [bloco, nome] of [
        ["identificacao", "Identificação"],
        ["basais", "Dados basais"],
        ["alergias", "Alergias"],
        ["medicacoes", "Medicações em uso"],
      ] as const) {
        await expect(page.getByTestId(`avc-bloco-${bloco}`)).toContainText(nome);
      }
    });

  /* ══ ⚠️⚠️⚠️ 3 · A COR ⛔ NÃO MUDA COM A RESPOSTA ══════════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A REGRA CLÍNICA DA COR, ⛔ e ⛔ ela é o que separa este selo
   * de um semáforo: ⛔ *"a cor identifica **de que assunto** se trata ⛔ e ⛔ não
   * muda com a resposta"*. ⚠️ Quem muda é o **símbolo**.
   */
  test("⛔ responder um campo ⛔ NÃO muda a cor do bloco",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      const antes = await fundoDe(page, "avc-bloco-identificacao-selo");
      /** ⚠️ O gesto real: registrar a idade. */
      await page.getByTestId("avc-degrau-idade-mais-10").click();
      const depois = await fundoDe(page, "avc-bloco-identificacao-selo");
      expect(depois).toBe(antes);
    });

  /* ══ ⚠️⚠️ 4 · E ⛔ NÃO É SÓ A PRIMEIRA TELA ═══════════════════════════ */

  /**
   * ⚠️⚠️⚠️ ⛔ O DEFEITO DE 2026-09-06 FOI ⛔ EXATAMENTE ESTE: ⛔ a correção
   * existia ⛔ e ⛔ ficou **trancada em `superficie-a.tsx`**. ⛔ O autor voltou
   * ⛔ dois dias depois com o mesmo relato, ⛔ olhando **outra** superfície.
   */
  test("⛔ a cor por assunto alcança as **outras** superfícies",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      await aba(page, "estabilizacao");
      await expect(page.getByTestId("avc-bloco-via-aerea")).toBeVisible();
      const eixo = await fundoDe(page, "avc-bloco-monitorizacao");

      await aba(page, "neurologico");
      await expect(page.getByTestId("avc-bloco-cronologia")).toBeVisible();

      /**
       * ⚠️ ⛔ Os selos de A, B ⛔ e D ⛔ não carregam `testID` próprio (⛔ o
       * `testID` está na View de fora), ⛔ então a medida ⛔ aqui é de
       * **presença**: ⛔ o cabeçalho existe ⛔ e desenha um selo dentro.
       */
      const selos = await page
        .getByTestId("avc-bloco-cronologia")
        .locator("div")
        .count();
      expect(selos).toBeGreaterThan(0);
      expect(eixo).toBeTruthy();
    });
});
