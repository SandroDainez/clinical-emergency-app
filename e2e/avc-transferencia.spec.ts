import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, registrarMarcoAgora, responderPopulacaoAdulta } from "./helpers";

/**
 * Transferência ⛔ e telestroke (T07, A12, A08) — pedido do autor, 2026-09-13.
 * Ciclo de vida como fatos com horário; aceite ⛔ nunca presumido; estimativa marcada;
 * recusa com motivo; teleconsulta como ator com parecer registrado (texto + autor +
 * horário) que aparece ⛔ só como «Avaliação especializada registrada». ⛔ Nenhum
 * critério de transferência ⛔ nem centro de destino é afirmado.
 */

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-destino").click();
  await expect(page.getByTestId("avc-superficie-g-conteudo")).toBeVisible();
}

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

test.describe("AVC · transferência ⛔ e telestroke", () => {
  test("A12 · sem recurso → plano local ⛔ e tarefa de revisão do acesso", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-g-opcao-transferencia_possivel-nao").click();
    await expect(page.getByTestId("avc-g-situacao-plano-local")).toBeVisible();
    await expect(page.getByTestId("avc-pendencia-revisar_acesso_transferencia")).toHaveCount(1);
  });

  test("recusa registrada: sem motivo vira pendência; com motivo entra na linha do tempo", async ({ page }) => {
    await abrir(page);
    await registrarMarcoAgora(page, "Solicitada");
    await registrarMarcoAgora(page, "Recusa");
    await expect(page.getByTestId("avc-pendencia-motivo_da_recusa")).toHaveCount(1);
    await page.getByTestId("avc-texto-transf_recusa_motivo").fill("sem leito");
    /** ⚠️ AC-68 (11ª rodada): o texto grava ao sair do campo, ⛔ e ⛔ por tecla. */
    await page.getByTestId("avc-texto-transf_recusa_motivo").blur();
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha).toContainText("Transferência solicitada");
    await expect(linha).toContainText("Recusa registrada");
    await expect(linha).toContainText("sem leito");
    await expect(page.getByTestId("avc-pendencia-motivo_da_recusa")).toHaveCount(0);
    await expect(page.getByTestId("avc-g-situacao-plano-local")).toBeVisible();
    await expect(page.getByTestId("avc-pendencia-revisar_acesso_transferencia")).toHaveCount(1);
  });

  test("aceite ⛔ nunca presumido: transporte confirmado sem aceite é dito", async ({ page }) => {
    await abrir(page);
    await registrarMarcoAgora(page, "Solicitada");
    await registrarMarcoAgora(page, "Transporte confirmado");
    await expect(page.getByTestId("avc-g-situacao-aceite-nao-registrado")).toBeVisible();
    await page.getByTestId("avc-hora-transf_previsao").click();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-g-linha-do-tempo")).toContainText("estimativa");
  });

  test("telestroke por marcos (AC-72): parecer registrado com texto, autor ⛔ e horário → «Avaliação especializada registrada»", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-g-registrar-tele-marco").click();
    await page.getByTestId("avc-g-tele-marco-tipo-Solicitada").click();
    await page.getByTestId("avc-g-tele-marco-agora").click();
    await expect(page.getByTestId("avc-g-situacao-avaliacao-especializada"), "⛔ parecer presumido sem registro").toHaveCount(0);
    await page.getByTestId("avc-g-registrar-tele-marco").click();
    await page.getByTestId("avc-g-tele-marco-tipo-Parecer registrado").click();
    await page.getByTestId("avc-g-tele-parecer-texto").fill("texto do parecer");
    await page.getByTestId("avc-g-tele-parecer-autor").fill("Dra. Neuro");
    await page.getByTestId("avc-g-tele-marco-informar-hora").click();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-g-situacao-avaliacao-especializada")).toHaveText("Avaliação especializada registrada");
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha).toContainText("Teleconsulta solicitada");
    await expect(linha).toContainText("Avaliação especializada registrada");
    await expect(linha).toContainText("Dra. Neuro");
  });

  test("A08 · IVT impedida, EVT avaliada, transferência em curso — nada se cancela", async ({ page }) => {
    const COAG = "motivo_para_suspeitar_alteracao_coagulacao";
    await abrir(page);
    await page.getByTestId("avc-aba-seguranca").click();
    await abrirTudo(page);
    await page.getByTestId(`avc-opcao-${COAG}-sim`).click();
    await page.getByTestId("avc-aba-destino").click();
    await registrarMarcoAgora(page, "Solicitada");
    await registrarMarcoAgora(page, "Aceite");
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-portao-motivo-coagulograma"), "⛔ a transferência apagou o impedimento").toBeVisible();
    await expect(page.getByTestId("avc-f-evt"), "⛔ a EVT sumiu com a IVT impedida").toBeVisible();
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-marcos"), "⛔ o marco sumiu").toContainText("Aceite");
    await expect(page.getByTestId("avc-g-situacao-transferencia")).toBeVisible();
  });

  test("ES · rótulos da transferência ⛔ e da teleconsulta em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await page.getByTestId("avc-g-registrar-marco").click();
    await expect(page.getByTestId("avc-g-marco-tipo-Solicitada")).toContainText("Solicitud");
    await expect(page.getByTestId("avc-g-registrar-tele-marco")).toContainText(/teleconsulta/i);
    await expect(page.getByTestId("avc-g-marco-tipo-Solicitada")).not.toContainText("Solicitada");
  });
});
