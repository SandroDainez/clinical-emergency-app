import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que *"Não sei"* tenha **a mesma cara** em todo campo do módulo —
 *   ⛔ escolha ⛔ ou múltipla —, ⛔ e que ⛔ ela seja **diferente** da cara de
 *   uma resposta clínica.
 *
 * NÃO PROMETE: que a distinção seja bonita — ⛔ isso é revisão visual. ⛔ Aqui
 *   se mede que ⛔ ela **existe**, ⛔ e que ⛔ é a mesma nos dois renderizadores.
 *
 * UNIVERSO: a tela Paciente servida do `dist`, ⛔ que tem os dois tipos lado a
 *   lado — `peso_origem` (escolha) ⛔ e `alergias` (múltipla).
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO (inspeção clínica, 2026-09-07) ──────────────────────
 *
 * ⛔ ⛔ O autor pôs as duas capturas lado a lado: em *"Como o peso foi obtido"*
 * o *"Não sei"* aparecia **tracejado ⛔ e apagado**; em *"Alergias conhecidas"*,
 * **sólido, com caixa ⛔ e branco**, ⛔ igual a *"Penicilina"*.
 *
 * ⚠️ ⛔ O tratamento existia ⛔ e tinha razão declarada no código:
 *
 * > *"«Não sei» ⛔ NÃO É UMA RESPOSTA CLÍNICA — ⛔ e ⛔ não pode parecer uma.
 * >  Com a mesma forma das outras, ⛔ ele competia visualmente com «Varfarina»
 * >  ⛔ e «Heparina» — ⛔ e um dos três ⛔ não é um achado."*
 *
 * ⛔ ⛔ Ele ⛔ só ⛔ **nunca foi aplicado à lista múltipla**.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
}

/** ⚠️ ⛔ O estilo **renderizado**, ⛔ e ⛔ não o que o arquivo diz. */
const estilo = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    const c = getComputedStyle(el as Element);
    const texto = Array.from((el as Element).querySelectorAll("*"))
      .find((x) => (x.textContent ?? "").trim().length > 2) ?? el;
    return {
      borda: c.borderTopStyle,
      fundo: c.backgroundColor,
      cor: getComputedStyle(texto as Element).color,
    };
  });

test.describe("AVC · *Não sei* tem uma cara só", () => {
  test('⛔ o "Não sei" da ESCOLHA e o da MÚLTIPLA são iguais entre si', async ({ page }) => {
    await abrir(page);

    /** ⚠️ ⛔ Os dois vizinhos na mesma tela, ⛔ e no mesmo estado: ⛔ não marcados. */
    const escolha = await estilo(page, "avc-opcao-peso_origem-nao_sei");
    const multipla = await estilo(page, "avc-item-alergias-Não sei");

    expect(multipla.borda, "⛔ a múltipla ⛔ não recebia o tracejado").toBe(escolha.borda);
    expect(multipla.cor, "⛔ e o texto dela ficava branco, como o de um achado").toBe(escolha.cor);
  });

  test('⛔ e ⛔ ele ⛔ NÃO se parece com uma resposta clínica', async ({ page }) => {
    await abrir(page);

    /**
     * ⚠️⚠️ ⛔ A DISTINÇÃO É O PONTO — ⛔ igualar os dois "Não sei" ⛔ **⛔ não
     * pode** ser conseguido tirando o tracejado dos dois. ⛔ Esta conferência
     * mata essa saída.
     */
    for (const [naoSei, achado] of [
      ["avc-opcao-peso_origem-nao_sei", "avc-opcao-peso_origem-Estimado pela equipe"],
      ["avc-item-alergias-Não sei", "avc-item-alergias-Penicilina ou betalactâmicos"],
    ] as const) {
      const ig = await estilo(page, naoSei);
      const clinico = await estilo(page, achado);
      expect(ig.borda, `⛔ ${naoSei} tem a borda de um achado`).not.toBe(clinico.borda);
      expect(ig.cor, `⛔ ${naoSei} tem a cor de um achado`).not.toBe(clinico.cor);
    }
  });

  /**
   * ⚠️⚠️⚠️ ⛔ *"Nenhuma"* ⛔ **⛔ NÃO** É *"Não sei"* — ⛔ e ⛔ ela ⛔ NÃO pode
   * ganhar a mesma cara.
   *
   * ⛔ ⛔ *"Nenhuma alergia conhecida"* é uma **resposta clínica**: ⛔ alguém
   * perguntou ⛔ e alguém respondeu. ⚠️ *"Não sei"* é **ignorância declarada**.
   * ⛔ Achatar as duas apagaria a distinção que **E-37** existe para manter.
   */
  test('⛔ "Nenhuma" continua com cara de RESPOSTA, ⛔ e ⛔ não de ignorância', async ({ page }) => {
    await abrir(page);
    const nenhuma = await estilo(page, "avc-item-alergias-Nenhuma");
    const naoSei = await estilo(page, "avc-item-alergias-Não sei");
    const achado = await estilo(page, "avc-item-alergias-Penicilina ou betalactâmicos");

    expect(nenhuma.borda, "⛔ respondida ⛔ não é ignorada").toBe(achado.borda);
    expect(nenhuma.cor).toBe(achado.cor);
    expect(nenhuma.borda).not.toBe(naoSei.borda);
  });
});
