import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-140 (autor, 2026-09-16) — a tela, pelo gesto do médico.
 *
 * · Registrar a piora abre «Piora clínica — o que fazer agora»: reavaliar ABCD e repetir o exame neurológico.
 * · Com trombolítico em curso, as duas condutas da Table 7 aparecem ali, e interromper a infusão é gesto.
 * · Sem trombolítico, a tela mostra só as duas reavaliações.
 * · «Preciso de ajuda» é roteador: cada opção leva a um caminho; registrar conduta externa é ação secundária.
 *
 * Núcleo: `scripts/prova-avc-d140-piora-e-ajuda.cjs`.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

async function registrarPiora(page: Page) {
  await page.getByTestId("avc-piorou").click();
  await page.getByTestId("avc-piorou-registrar").click();
}

async function trombolisePelaTela(page: Page) {
  await aba(page, "reperfusao");
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
}

test.describe("AVC · D-140 · piora clínica e «Preciso de ajuda»", () => {
  test("sem trombolítico: registrar a piora abre a tela de ações com as duas reavaliações", async ({ page }) => {
    await abrir(page);
    await registrarPiora(page);

    const tela = page.getByTestId("avc-piora-acoes");
    await expect(tela, "⛔ registrar a piora ⛔ abriu a tela de ações").toBeVisible();
    await expect(tela).toContainText("Piora clínica — o que fazer agora");
    await expect(page.getByTestId("avc-piora-acao-reavaliar_abcd")).toBeVisible();
    await expect(page.getByTestId("avc-piora-acao-repetir_neurologico")).toBeVisible();
    /** ⚠️ Sem trombolítico, ⛔ há conduta da Table 7 — ⛔ nenhuma conduta nasce da piora isolada. */
    await expect(page.getByTestId("avc-piora-acao-interromper_infusao")).toHaveCount(0);
    await expect(page.getByTestId("avc-piora-acao-tc_de_emergencia")).toHaveCount(0);
  });

  test("a ação leva à reavaliação: ABCD abre a Estabilização; o neurológico abre o NIHSS", async ({ page }) => {
    await abrir(page);
    await registrarPiora(page);
    await page.getByTestId("avc-piora-acao-reavaliar_abcd").click();
    await expect(page.getByTestId("avc-ameacas-imediatas"), "⛔ ABCD ⛔ levou à Estabilização").toBeVisible();

    await registrarPiora(page);
    await page.getByTestId("avc-piora-acao-repetir_neurologico").click();
    await expect(page.getByTestId("avc-superficie-neurologico"), "⛔ o neurológico ⛔ abriu").toBeVisible();
  });

  test("com trombolítico em curso: as duas condutas da Table 7, e interromper a infusão é gesto", async ({ page }) => {
    await abrir(page);
    await trombolisePelaTela(page);
    await registrarPiora(page);

    const tela = page.getByTestId("avc-piora-acoes");
    await expect(tela).toBeVisible();
    await expect(tela, "⛔ a conduta da fonte ⛔ apareceu").toContainText("Interromper a infusão de alteplase, se estiver em curso.");
    await expect(tela).toContainText("Obter tomografia de crânio de emergência.");
    /** ⚠️ Interromper é gesto do app; a tomografia ⛔ é — ⛔ o app ⛔ a executa. */
    await page.getByTestId("avc-piora-acao-interromper_infusao").click();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-superficie-f-conteudo"), "⛔ a interrupção ⛔ ficou registrada").toContainText("Interrompida");
  });

  test("«Preciso de ajuda» é roteador: falta de medicamento leva ao Destino, sem tela de anotação no caminho", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-ajuda").click();
    await page.getByTestId("avc-ajuda-opcao-sem_medicamento").click();

    const painel = page.getByTestId("avc-ajuda-painel-sem_medicamento");
    await expect(painel, "⛔ a opção diz que ⛔ tem conteúdo em vez de levar a algum lugar").not.toContainText(/não tem conteúdo/i);
    /** ⚠️ Registrar conduta externa continua existindo — como ação SECUNDÁRIA, ⛔ no caminho principal. */
    await expect(page.getByTestId("avc-ajuda-conduta"), "⛔ o campo de anotação ⛔ é o caminho principal").toHaveCount(0);
    await expect(page.getByTestId("avc-ajuda-conduta-abrir")).toBeVisible();

    await page.getByTestId("avc-ajuda-caminho-sem_medicamento-destino").click();
    await expect(page.getByTestId("avc-superficie-destino"), "⛔ o caminho ⛔ abriu o Destino").toBeVisible();
  });

  test("«Preciso de ajuda» → «Paciente piorou» abre a piora e, depois de registrar, a tela de ações", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-ajuda").click();
    await page.getByTestId("avc-ajuda-opcao-paciente_piorou").click();
    await expect(page.getByTestId("avc-piorou-dialogo")).toBeVisible();
    await page.getByTestId("avc-piorou-registrar").click();
    await expect(page.getByTestId("avc-piora-acoes")).toBeVisible();
  });

  /**
   * ⚠️⚠️ TRAVA PEDIDA PELO AUTOR (2026-09-16): *«fechar o modal não desfaz nem altera o
   * evento de piora. A piora já foi registrada; o modal é apenas a camada de ação
   * imediata.»* ⛔ Dispensar ⛔ é corrigir por engano — ⛔ e ⛔ são gestos diferentes.
   */
  test("dispensar a tela ⛔ apaga ⛔ nem corrige o fato de piora", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-texto").fill("rebaixou o nível de consciência");
    await page.getByTestId("avc-piorou-registrar").click();
    await page.getByTestId("avc-piora-acoes-fechar").click();
    await expect(page.getByTestId("avc-piora-acoes")).toHaveCount(0);

    /** ⚠️ O evento continua na trilha, com o texto ⛔ e sem marca de engano. */
    await aba(page, "destino");
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha, "⛔ o evento de piora sumiu ao dispensar a tela").toContainText("rebaixou o nível de consciência");
    await expect(linha).not.toContainText("registrado por engano");
    /** ⚠️ E a tarefa que a piora criou ⛔ some junto com o modal. */
    await aba(page, "estabilizacao");
    await expect(page.getByTestId("avc-prioridade-reavaliar")).toContainText("Reavaliar agora");
  });

  /** ⚠️ Autor, 2026-09-16: «não deve ser possível abrir dois modais de piora sobrepostos». */
  test("⛔ dois modais de piora sobrepostos", async ({ page }) => {
    await abrir(page);
    await registrarPiora(page);
    await expect(page.getByTestId("avc-piora-acoes")).toBeVisible();
    /**
     * ⚠️ Com a tela de ações aberta, ⛔ existe diálogo de piora atrás dela — ⛔ duas
     * camadas. ⚠️ ⛔ Adianta tentar o clique no botão global aqui: o modal intercepta o
     * toque, que é exatamente o que ele deve fazer.
     */
    await expect(page.getByTestId("avc-piorou-dialogo"), "⛔ dois modais empilhados").toHaveCount(0);

    /** ⚠️⚠️ E a trava ⛔ pode quebrar o botão para sempre: dispensada a tela, ele volta. */
    await page.getByTestId("avc-piora-acoes-fechar").click();
    await expect(page.getByTestId("avc-piora-acoes")).toHaveCount(0);
    await page.getByTestId("avc-piorou").click();
    await expect(page.getByTestId("avc-piorou-dialogo"), "⛔ o botão global ficou inutilizado").toHaveCount(1);
  });
});
