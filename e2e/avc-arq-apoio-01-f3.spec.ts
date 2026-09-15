import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * ARQ-APOIO-01 · F3 (autor, 2026-09-15) — a tela.
 *
 * · 5c: motivo + «Horário desconhecido» nas duas terapias → o plano abre o caminho sem reperfusão com «horário
 *   desconhecido — nenhum prazo calculado», e a pendência de horário some.
 * · 5c: uma hora conhecida e outra desconhecida → o caminho abre sem horário global.
 * · `ivt_indicacao_confirmada` fica, e a tela diz junto do gesto que ele ⛔ altera veredito, elegibilidade ⛔ exposição.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

async function horaHa(page: Page, campo: string, horas: number) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  for (let i = 0; i < horas; i += 1) await page.getByTestId("avc-seletor-hora-h-menos").click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function desfecho(page: Page, terapia: "ivt" | "evt", motivo: string, hora: "desconhecida" | "ha-1h") {
  const campoMotivo = terapia === "ivt" ? "ivt_nao_prosseguir_motivo" : "evt_desfecho_motivo";
  const campoHora = terapia === "ivt" ? "ivt_nao_prosseguir_hora" : "evt_desfecho_hora";
  await aba(page, "reperfusao");
  await page.getByTestId("avc-f-desfechos").scrollIntoViewIfNeeded();
  await page.getByTestId(`avc-opcao-${campoMotivo}-${motivo}`).click();
  if (hora === "desconhecida") await page.getByTestId(`avc-hora-desconhecido-${campoHora}`).click();
  else await horaHa(page, campoHora, 1);
}

test.describe("AVC · ARQ-APOIO-01 · F3", () => {
  test("5c: motivo + «Horário desconhecido» nas duas terapias → caminho sem reperfusão aberto, sem prazo, sem pendência de horário", async ({ page }) => {
    await abrir(page);
    await desfecho(page, "ivt", "Sem indicação", "desconhecida");
    await desfecho(page, "evt", "Indisponível", "desconhecida");
    await aba(page, "destino");
    const caminho = page.getByTestId("avc-plano-caminho-sem_reperfusao");
    await expect(caminho, "o caminho sem reperfusão ficou fechado com o horário declarado desconhecido").toBeVisible();
    await expect(caminho).toContainText(/horário desconhecido — nenhum prazo calculado/i);
    await expect(page.getByTestId("avc-plano-pendencia-sem_reperfusao"), "a pendência continua pedindo o horário").toHaveCount(0);
  });

  test("5c: hora conhecida na trombólise e desconhecida na trombectomia → o caminho abre sem horário global", async ({ page }) => {
    await abrir(page);
    await desfecho(page, "ivt", "Sem indicação", "ha-1h");
    await desfecho(page, "evt", "Centro de referência recusou", "desconhecida");
    await aba(page, "destino");
    const caminho = page.getByTestId("avc-plano-caminho-sem_reperfusao");
    await expect(caminho, "o caminho sem reperfusão ficou fechado").toBeVisible();
    await expect(caminho, "fabricou um horário global a partir da hora conhecida").toContainText(/horário desconhecido — nenhum prazo calculado/i);
  });

  test("`ivt_indicacao_confirmada` fica, com o aviso visível de que não altera veredito, elegibilidade nem exposição", async ({ page }) => {
    await abrir(page);
    await aba(page, "neurologico");
    await horaHa(page, "hora_inicio_observado", 2);
    await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();
    await aba(page, "seguranca");
    await page.getByTestId("avc-opcao-motivo_para_suspeitar_alteracao_coagulacao-nao").click();
    await aba(page, "imagem");
    await page.getByTestId("avc-novo-estudo").click();
    await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
    await page.getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada").click();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada"), "controle: o registro continua oferecido com o portão liberado").toBeVisible();
    await expect(page.getByTestId("avc-f-decisao-ivt-nota"), "o aviso só existe atrás do ⓘ").toContainText(
      "Registro da decisão médica de prosseguir. Não altera o veredito, não cria elegibilidade e não significa administração."
    );
  });
});
