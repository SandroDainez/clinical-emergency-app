import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * 17ª rodada (autor, 2026-09-14): AC-106 (vocabulário por transversal), AC-107 (pendente com nome),
 * AC-108 (sem inglês visível), AC-109 (motivos por terapia), AC-110 (um nome) ⛔ AC-111 (declaração).
 * ⛔ Nenhum conteúdo clínico novo: o gesto real ⛔ a palavra exibida.
 * ⚠️ As travas genéricas (inglês ⛔ pendente sem nome, em toda aba) moram em
 * `e2e/avc-procedencia-fora-do-card.spec.ts`.
 */

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

async function tc(page: Page, resultado: string) {
  await page.getByTestId("avc-aba-imagem").click();
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
  await informarHora(page, "estudo_hora");
  await page.getByTestId(`avc-opcao-estudo_resultado-${resultado}`).click();
}

async function planoDaTrombolise(page: Page) {
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Administrada/concluída").click();
  await informarHora(page, "ivt_inicio");
  await page.getByTestId("avc-aba-destino").click();
}

test.describe("AVC · 17ª rodada · vocabulário, nomes ⛔ idioma", () => {
  test("AC-106: mobilização tem vocabulário próprio; o resultado dela ⛔ mexe na trava de via oral", async ({ page }) => {
    await abrir(page);
    await tc(page, "Sem hemorragia intracraniana identificada");
    await planoDaTrombolise(page);
    const mob = page.getByTestId("avc-plano-tarefa-mobilizacao");
    await mob.scrollIntoViewIfNeeded();
    await expect(mob.getByTestId("avc-opcao-plano_mobilizacao-Contraindicada no momento")).toBeVisible();
    await expect(mob, "⛔ vocabulário da deglutição na mobilização").not.toContainText(/Aprovada|Reprovada/);
    for (const id of ["tev", "dispositivos"]) {
      await expect(page.getByTestId(`avc-plano-tarefa-${id}`), `⛔ ${id} herdou aprovada/reprovada`).not.toContainText(/Aprovada|Reprovada/);
    }
    await expect(page.getByTestId("avc-plano-tarefa-degluticao")).toContainText("Reprovada");
    await mob.getByTestId("avc-opcao-plano_mobilizacao-Realizada").click();
    await expect(mob).toContainText("concluída");
    await expect(page.getByTestId("avc-trava-via-oral"), "⛔ a mobilização mexeu na trava").toContainText("Nada por via oral");
  });

  test("AC-107: pendente do catálogo HIC diz o tema", async ({ page }) => {
    await abrir(page);
    await tc(page, "Hemorragia intracraniana identificada");
    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-destino-abrir-hemorragia_intracraniana").click();
    const card = page.getByTestId("avc-hem-rec-pa_titulacao");
    await card.scrollIntoViewIfNeeded();
    await expect(card).toContainText("Pressão arterial aguda");
    await expect(card).toContainText("conteúdo pendente de validação");
  });

  test("AC-108: Destino mostra a força traduzida; o verbo em inglês só no ⓘ", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();
    const rec = page.getByTestId("avc-g-rec-unidade_de_avc");
    await rec.scrollIntoViewIfNeeded();
    await expect(rec).toContainText("Recomendado");
    await expect(rec, "⛔ inglês no card").not.toContainText("is recommended");
    await page.getByTestId("avc-info-g-rec-unidade_de_avc").click();
    await expect(page.getByTestId("avc-info-texto-g-rec-unidade_de_avc")).toContainText("is recommended");
  });

  test("AC-109: «Centro de referência recusou» ⛔ «Indisponível» só na trombectomia", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-f-desfechos").scrollIntoViewIfNeeded();
    await expect(page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Centro de referência recusou")).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Indisponível")).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-ivt_nao_prosseguir_motivo-Impedida")).toBeVisible();
    await expect(page.getByTestId("avc-opcao-evt_desfecho_motivo-Centro de referência recusou")).toBeVisible();
    await expect(page.getByTestId("avc-opcao-evt_desfecho_motivo-Indisponível")).toBeVisible();
  });

  test("AC-110 ⛔ AC-111: um nome no cabeçalho, no bloco ⛔ na aba; o marco diz que é declaração", async ({ page }) => {
    await abrir(page);
    await tc(page, "Hemorragia intracraniana identificada");
    await expect(page.getByTestId("avc-cabecalho-titulo")).toHaveText("Hemorragia intracraniana (HIC)");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-g-bloco-hem-caminho")).toContainText("Hemorragia intracraniana (HIC)");
    const marco = page.getByTestId("avc-plano-tarefa-hemorragia_caminho_proprio");
    await marco.scrollIntoViewIfNeeded();
    await expect(marco).toContainText(/declara/i);
    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-destino-abrir-hemorragia_intracraniana").click();
    await expect(page.getByTestId("avc-cabecalho-titulo")).toHaveText("Hemorragia intracraniana (HIC)");
    await expect(page.getByTestId("avc-aba-hic")).toContainText("Hemorragia intracraniana (HIC)");
  });

  test("ES · vocabulário da mobilização ⛔ nome do caminho em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await tc(page, "Hemorragia intracraniana identificada");
    await expect(page.getByTestId("avc-cabecalho-titulo")).toHaveText("Hemorragia intracraneal (HIC)");
    await page.getByTestId("avc-aba-destino").click();
    const mob = page.getByTestId("avc-plano-tarefa-mobilizacao");
    await mob.scrollIntoViewIfNeeded();
    await expect(mob).toContainText("Contraindicada en este momento");
  });
});
