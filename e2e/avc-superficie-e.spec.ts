import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que E se COMPORTE na tela como registro de **ações** — que ⛔ nada nela
 * marque "corrigido", que o bloqueio ⛔ só caia com **nova aferição em Entrada e
 * estabilização**, que duas intervenções apareçam como duas, e que ⛔ nenhum
 * fármaco ou dose apareça enquanto F-19 estiver parcial.
 *
 * ⚠️ As provas de estado vivem em `scripts/prova-avc-superficie-e.cjs`.
 */
async function abrirAvc(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}
const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

/** ⚠️ PA alta pelos degraus — ⛔ sem digitação, como todo número do app. */
async function paAlta(page: Page) {
  await aba(page, "estabilizacao");
  for (let i = 0; i < 3; i += 1) await page.getByTestId("avc-degrau-pas-mais-50").click();
  for (let i = 0; i < 2; i += 1) await page.getByTestId("avc-degrau-pad-mais-50").click();
}

test.describe("AVC · Correções", () => {
  test("⛔ sem bloqueio, a tela ⛔ não espera por ação", async ({ page }) => {
    await abrirAvc(page);
    await aba(page, "correcoes");
    await expect(page.getByTestId("avc-e-sem-bloqueio"))
      .toContainText(/Nada nesta tela espera por ação/i);
  });

  /**
   * ⚠️⚠️ O SENTINELA DA PA, NA TELA — e a parte que importa é o que ⛔ NÃO existe.
   */
  test("o bloqueio cai por NOVA AFERIÇÃO, e ⛔ nunca por um botão em Correções",
    async ({ page }) => {
      await abrirAvc(page);
      await paAlta(page);
      await aba(page, "correcoes");

      const bloco = page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta");
      await expect(bloco).toBeVisible();
      // ⚠️ Português primeiro, verbatim abaixo — mesmo contrato de D.
      await expect(page.getByTestId("avc-e-formulacao-pressao_acima_da_meta"))
        .toContainText(/baixar a pressão antes de iniciar a trombólise/i);
      await expect(page.getByTestId("avc-e-verbo-pressao_acima_da_meta"))
        .toContainText("before IVT therapy is initiated");
      // ⚠️ E a tela DIZ o que faz o bloqueio cair.
      await expect(page.getByTestId("avc-e-resolve-pressao_acima_da_meta"))
        .toContainText(/nova aferição de pressão arterial/i);

      const tela = page.getByTestId("avc-superficie-e-conteudo");
      /** ⛔⛔ ⛔ NENHUM botão de "corrigido" — é a ausência que sustenta o contrato. */
      await expect(tela).not.toContainText(/corrigid|resolvid|normaliz/i);

      // ⚠️ Registrar a ação, e o bloqueio CONTINUA.
      await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
      await page.getByTestId("avc-opcao-acao_estado-Iniciada").click();
      await expect(bloco).toBeVisible();

      /** ⚠️⚠️ NOVA AFERIÇÃO em A — e é ela que derruba. */
      await aba(page, "estabilizacao");
      /** ⚠️ O botão é do BLOCO, e o bloco da PA se chama `pressao`. */
      await page.getByTestId("avc-nova-medida-pressao").click();
      /**
       * ⚠️⚠️ A nova aferição nasce **SEM valor** — foi este teste que revelou o
       * defeito oposto, e a correção entrou em A na mesma rodada. Daqui ela sobe
       * até ficar **abaixo de 185/110**, o limite da fonte antes da trombólise.
       */
      await expect(page.getByTestId("avc-campo-pas")).toContainText(/não informado/i);
      for (let i = 0; i < 2; i += 1) await page.getByTestId("avc-degrau-pas-mais-50").click();
      await page.getByTestId("avc-degrau-pad-mais-50").click();
      await aba(page, "correcoes");
      await expect(page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta")).toHaveCount(0);
      // ⚠️ E a ação registrada ⛔ não some da trilha por o bloqueio ter caído.
      await aba(page, "estabilizacao");
      await expect(page.getByTestId("avc-campo-pas").first()).toBeVisible();
    });

  test("duas intervenções aparecem como DUAS", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");

    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
    await page.getByTestId("avc-opcao-acao_estado-Realizada").click();
    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();

    await expect(page.getByTestId("avc-e-acao-acao_1")).toBeVisible();
    await expect(page.getByTestId("avc-e-acao-acao_2")).toBeVisible();
  });

  /**
   * ⚠️⚠️ OS ESTADOS ⛔ NÃO SÃO SEQUÊNCIA: quem chegou com o tratamento correndo
   * registra direto, ⛔ sem passar por uma sugestão que o app ⛔ nunca fez.
   */
  test("`Realizada` é registrável direto, e ⛔ não existe `Sugerida`", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");
    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();

    await expect(page.getByTestId("avc-opcao-acao_estado-Realizada")).toBeVisible();
    await expect(page.getByTestId("avc-opcao-acao_estado-Sugerida")).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-acao_estado-Disponível")).toHaveCount(0);
  });

  /** ⛔⛔ ⛔ NENHUM fármaco enquanto F-19 estiver parcial. */
  test("⛔ a tela ⛔ NÃO prescreve", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");
    const tela = await page.getByTestId("avc-superficie-e-conteudo").innerText();
    expect(tela).not.toMatch(/labetalol|esmolol|nitroprussiato|hidralazina|insulina/i);
    expect(tela).not.toMatch(/\d+\s*(mg|mcg|ml)\b(?!\s*\/\s*d[lL])/i);
    expect(tela).not.toMatch(/\bbolus\b|\bEV\b|via oral/);
  });

  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await aba(page, "correcoes");
    await expect(page.getByTestId("avc-superficie-e-conteudo"))
      .toContainText(/Ningún bloqueo corregible/i);
  });
});
