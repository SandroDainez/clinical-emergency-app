import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-PEND-22, D-PEND-23, D-PEND-24 (autor, 2026-09-13) — pelo gesto do médico.
 *
 *   D-PEND-22 · tenecteplase 0,25 mg/kg exato, teto 25 mg, sem arredondar mg; volume
 *   a 5 mg/mL com 0,1 mL; faixa da Table 7 como conferência, divergência explícita;
 *   situação regulatória "pendente de conferência" visível.
 *   D-PEND-23 · suspeita clínica de HSA com TC sem sangue retém a reperfusão como
 *   "requer avaliação especializada / corrigir e reavaliar", adaptação do projeto.
 *   D-PEND-24 · portão de população com a janela de 14 dias pós-parto.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
}

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"], [data-testid^="avc-coleta-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

async function tenecteplaseCom(page: Page, kg: number) {
  await abrir(page);
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-paciente").click();
  const peso = page.getByTestId("avc-num-caixa-peso");
  await peso.fill(String(kg));
  await peso.blur();
  await page.getByTestId("avc-opcao-peso_origem-Estimado pela equipe").click();
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-f-agente-Tenecteplase").click();
  await expect(page.getByTestId("avc-f-dose-valor")).toBeVisible();
}

test.describe("AVC · D-PEND-22 · dose exata de tenecteplase", () => {
  test("70 kg → 17,5 mg · 3,5 mL; Table 7 20 mg · 4 mL com divergência; regulatório pendente", async ({ page }) => {
    await tenecteplaseCom(page, 70);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("17,5 mg");
    await expect(page.getByTestId("avc-f-dose-valor")).not.toContainText("18 mg");
    await expect(page.getByTestId("avc-f-dose-volume")).toContainText("3,5 mL");
    const t7 = page.getByTestId("avc-f-dose-table7");
    /** ⚠️ 8ª rodada: a conferência ⛔ mostra mL; a fonte (Table 7, p. e358) fica no ⓘ. */
    await expect(t7).toContainText("20 mg");
    await expect(t7).not.toContainText("mL");
    await page.getByTestId("avc-info-table7").click();
    await expect(page.getByTestId("avc-info-texto-table7")).toContainText("Table 7, p. e358");
    await expect(page.getByTestId("avc-f-dose-table7-divergencia")).toBeVisible();
    await expect(page.getByTestId("avc-f-dose-regulatorio")).toContainText("pendente de conferência");
  });

  test("100 kg e 120 kg → 25 mg · 5,0 mL (teto); Table 7 coincide, ⛔ sem divergência", async ({ page }) => {
    await tenecteplaseCom(page, 100);
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("25 mg");
    await expect(page.getByTestId("avc-f-dose-volume")).toContainText("5,0 mL");
    await expect(page.getByTestId("avc-f-dose-table7")).toContainText("25 mg");
    await expect(page.getByTestId("avc-f-dose-table7-divergencia")).toHaveCount(0);

    await page.getByTestId("avc-aba-paciente").click();
    const peso = page.getByTestId("avc-num-caixa-peso");
    await peso.fill("120");
    await peso.blur();
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("25 mg");
    await expect(page.getByTestId("avc-f-dose-volume")).toContainText("5,0 mL");
  });
});

test.describe("AVC · D-PEND-23 · suspeita clínica de HSA", () => {
  test("«Sim» → motivo «Requer avaliação especializada — corrigir e reavaliar», adaptação do projeto", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-imagem").click();
    await abrirTudo(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    await page.getByTestId("avc-aba-reperfusao").click();

    const motivo = page.getByTestId("avc-f-portao-motivo-suspeita_hsa");
    await expect(motivo).toBeVisible();
    await expect(motivo).toContainText("Requer avaliação especializada");
    await expect(motivo).toContainText(/corrigir e reavaliar/i);
    /** ⚠️ 8ª rodada: a procedência ("adaptação do projeto") fica no ⓘ do motivo. */
    await page.getByTestId("avc-info-portao-suspeita_hsa").click();
    await expect(page.getByTestId("avc-info-texto-portao-suspeita_hsa")).toContainText(/adaptação do projeto/i);
    await expect(motivo).not.toContainText(/contraindica|impede pela diretriz|Saída diagnóstica armada/i);
  });
});

test.describe("AVC · D-PEND-24 · puerpério 14 dias", () => {
  test("o portão diz a janela de 14 dias e a marcação da fonte; «Não sei» mantém a pergunta", async ({ page }) => {
    await abrir(page);
    const pergunta = page.getByTestId("avc-portao-pergunta-pendente");
    await expect(pergunta).toContainText("até 14 dias após o parto");
    /** ⚠️ 8ª rodada: a marcação da fonte fica no ⓘ do campo, ⛔ não no card. */
    await expect(page.getByTestId("avc-portao-populacao")).not.toContainText("a confirmar");
    await page.getByTestId("avc-info-gestacao_puerperio").click();
    await expect(page.getByTestId("avc-portao-populacao")).toContainText("AHA 2019, a confirmar na Table 8 de 2026");
    await expect(page.getByTestId("avc-portao-populacao")).not.toContainText("10 dias");
    await page.getByTestId("avc-opcao-faixa_etaria-18 anos ou mais").click();
    await page.getByTestId("avc-opcao-gestacao_puerperio-nao_sei").click();
    await expect(pergunta).toBeVisible();
  });
});
