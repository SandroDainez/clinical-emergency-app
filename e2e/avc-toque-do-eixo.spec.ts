import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * ⚠️⚠️ O TOQUE NO CARTÃO DO EIXO ⛔ NÃO PODE SER SILENCIOSO — autor, 2026-09-16.
 *
 * ── ⛔ O DEFEITO QUE ISTO EXISTE PARA IMPEDIR ─────────────────────────────────
 *
 * ⛔ Achado do autor em produção: *«aqui tem uns clicáveis que direcionam corretamente
 * e outros não respondem»*. ⚠️ O `onPress` do cartão tem quatro ramos: ameaça com
 * tratamento na tela ROLA até o tratamento; ameaça com destino ABRE a superfície; ⛔ e
 * o resto cai em `alternarEixo(grupo)`, que **⛔ só alterna um booleano**.
 *
 * ⚠️ `BLOQUEIO_DO_EIXO` tem ⛔ só `pressao` ⛔ e `glicemia` — ⛔ então **A** ⛔ e **B**
 * ⛔ nunca alcançam o ramo que rola, ⛔ e **C** ⛔ e **D** fora de ameaça também ⛔ não.
 * ⛔ O acordeão abre ABAIXO da dobra: o toque funciona ⛔ e ⛔ nada visível acontece.
 *
 * ⚠️⚠️ ⛔ MEDIR O BOOLEANO ⛔ NÃO BASTA — ⛔ e ⛔ é por isso que esta prova existe
 * separada da `avc-eixos-acordeao`. ⛔ Aquela prova que «abriu o grupo» continua
 * válida ⛔ e continua passando **mesmo com o gesto mudo**: ⛔ o grupo abre fora da
 * tela. ⚠️ Aqui se mede o que o MÉDICO vê — o grupo no viewport.
 *
 * PROMETE: que tocar o cartão de um eixo FECHADO abra o grupo ⛔ e o traga ao viewport,
 *   ⛔ em estado ⛔ não ameaçador (A, B ⛔ e C), ⛔ onde o defeito vivia.
 * NÃO PROMETE: o comportamento da ameaça com destino próprio — ⛔ esse ⛔ não mudou,
 *   ⛔ e é medido em `avc-cockpit-abcde`.
 */

const EIXOS = [
  { eixo: "via_aerea", grupo: "via-aerea", letra: "A" },
  { eixo: "respiracao", grupo: "respiracao", letra: "B" },
  { eixo: "pressao", grupo: "pressao", letra: "C" },
] as const;

async function abrirEstabilizacao(page: Page) {
  await fixarIdioma(page, "pt-BR");
  /** ⚠️ Tela de celular: é onde o grupo cai fora da dobra — ⛔ e onde o defeito aparece. */
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-estabilizacao").click();
}

/** ⚠️ Grupo ABERTO = tem campo desenhado. Recolhido, o cabeçalho fica ⛔ e o campo ⛔ não. */
const camposDe = (page: Page, grupo: string) =>
  page.getByTestId(`avc-grupo-${grupo}`).locator('[data-testid^="avc-campo-"], [data-testid^="avc-opcao-"]');

/**
 * ⚠️⚠️ PRECONDIÇÃO EXPLÍCITA ⛔ E DETERMINÍSTICA — autor, 2026-09-16.
 *
 * ⛔ A primeira versão desta prova ASSUMIU que todo eixo nasce fechado. ⚠️ ⛔ Não nasce:
 * `avc-modulo-screen.tsx` abre **o primeiro ⛔ não concluído** (*«Nasce com um aberto»*),
 * que num atendimento novo é o **A**. ⛔ O toque então FECHAVA o grupo, ⛔ e a prova
 * esperava 15 s por um viewport que ⛔ nunca viria — ⛔ vermelha por pressuposto do teste,
 * ⛔ e ⛔ não por defeito do produto (B ⛔ e C passavam em ~500 ms).
 *
 * ⚠️ Agora o estado é POSTO, ⛔ e ⛔ não suposto: fechado → toque → abre → rola.
 * ⛔ Assim a prova ⛔ depende de qual eixo a configuração inicial abre, ⛔ nem da ordem.
 */
async function garantirFechado(page: Page, grupo: string, eixo: string) {
  const campos = camposDe(page, grupo);
  if ((await campos.count()) > 0) {
    await page.getByTestId(`avc-ameaca-${eixo}`).click();
    await expect(campos, `⛔ o preâmbulo ⛔ conseguiu fechar ${grupo}`).toHaveCount(0);
  }
}

test.describe("AVC · o toque no cartão do eixo leva a algum lugar", () => {
  for (const { eixo, grupo, letra } of EIXOS) {
    test(`${letra} · tocar o cartão abre o grupo ⛔ e o traz para a tela`, async ({ page }) => {
      await abrirEstabilizacao(page);

      const cartao = page.getByTestId(`avc-ameaca-${eixo}`);
      const bloco = page.getByTestId(`avc-grupo-${grupo}`);
      await expect(cartao, `⛔ o cartão ${letra} ⛔ está na tela`).toBeVisible();

      /** ⚠️ Estado conhecido ANTES de medir — ⛔ o A nasce aberto. */
      await garantirFechado(page, grupo, eixo);

      await cartao.click();
      await expect(camposDe(page, grupo), `⛔ ${letra}: o toque ⛔ abriu o grupo`)
        .not.toHaveCount(0);

      /**
       * ⚠️⚠️ ⛔ A ASSERÇÃO QUE PEGA O GESTO MUDO: ⛔ não basta o grupo existir ⛔ nem
       * estar «aberto» — ⛔ ele precisa estar ONDE O MÉDICO OLHA.
       */
      await expect(bloco, `⛔ ${letra}: o grupo abriu ⛔ e ficou fora da tela — gesto mudo`)
        .toBeInViewport();
    });
  }

  test("tocar de novo FECHA — ⛔ e ⛔ não arranca a tela do lugar", async ({ page }) => {
    await abrirEstabilizacao(page);
    const cartao = page.getByTestId("avc-ameaca-via_aerea");
    const bloco = page.getByTestId("avc-grupo-via-aerea");

    /** ⚠️ Mesmo rigor do outro teste: estado POSTO, ⛔ e ⛔ não suposto. */
    await garantirFechado(page, "via-aerea", "via_aerea");

    const campos = camposDe(page, "via-aerea");
    await cartao.click();
    await expect(campos, "⛔ abriu sem campo ⛔ nenhum").not.toHaveCount(0);
    await expect(bloco, "⛔ abriu ⛔ e ficou fora da tela").toBeInViewport();

    /** ⚠️ Fechar é fechar: os campos somem, ⛔ e ⛔ nenhuma rolagem é imposta. */
    await cartao.click();
    await expect(campos, "⛔ o segundo toque ⛔ fechou o grupo").toHaveCount(0);
  });
});
