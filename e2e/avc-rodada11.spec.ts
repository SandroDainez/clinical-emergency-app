import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, registrarMarcoAgora, responderPopulacaoAdulta } from "./helpers";

/**
 * 11ª rodada (autor, 2026-09-13): eixos reabertos com a última avaliação; piora por
 * engano (AC-67); marcos da transferência como linha do tempo com dois horários (AC-69);
 * texto livre que confirma ao sair ou em «Registrar» (AC-68).
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function registrarPiora(page: Page) {
  await page.getByTestId("avc-piorou").click();
  await page.getByTestId("avc-piorou-registrar").click();
  await expect(page.getByTestId("avc-prioridade-reavaliar")).toBeVisible();
}

/** Quantos fatos do campo foram gravados na trilha persistida. */
async function fatosNaTrilha(page: Page, campo: string): Promise<number> {
  return page.evaluate((c) => new Promise<number>((resolve) => {
    const req = indexedDB.open("avc-atendimento");
    req.onsuccess = () => {
      const db = req.result;
      const todos = db.transaction("eventos", "readonly").objectStore("eventos").getAll();
      todos.onsuccess = () => {
        const n = (todos.result as { tipo?: string; dados?: { fato?: { campo?: string } } }[])
          .filter((ev) => JSON.stringify(ev).includes(`"campo":"${c}"`)).length;
        db.close();
        resolve(n);
      };
      todos.onerror = () => { db.close(); resolve(-1); };
    };
    req.onerror = () => resolve(-1);
  }), campo);
}

test.describe("AVC · 11ª rodada", () => {
  test("eixos reabertos mostram a última avaliação com hora ⛔ e «reavaliação pendente», nunca vazio", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-opcao-hipoxia-sim").click();
    await registrarPiora(page);
    const anterior = page.getByTestId("avc-ameaca-anterior-respiracao");
    await expect(anterior, "⛔ o eixo reaberto ⛔ mostra a avaliação anterior").toContainText("Antes da piora");
    await expect(anterior).toContainText(/\d{2}:\d{2}/);
    await expect(page.getByTestId("avc-ameaca-reavaliacao-pendente-respiracao")).toBeVisible();
    /** ⚠️ Ajuste consciente (autor, 2026-09-15): ⛔ há eixo E; o eixo sem dado antes da piora é o D (glicemia). */
    await expect(page.getByTestId("avc-ameaca-anterior-glicemia"), "⛔ eixo sem dado ⛔ diz nada").toContainText("sem dados registrados");

    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-eixo-concluir-respiracao").click();
    await expect(page.getByTestId("avc-ameaca-reavaliacao-pendente-respiracao"), "⛔ concluir ⛔ tirou a marca").toHaveCount(0);
    await expect(page.getByTestId("avc-ameaca-reavaliacao-pendente-via_aerea")).toBeVisible();
  });

  test("AC-67 · piora por engano sem reavaliação: confirmação, tarefa cai, eixo volta a concluído, evento fica na trilha", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-eixo-concluir-via-aerea").click();
    await expect(page.getByTestId("avc-ameaca-progresso-via_aerea")).toHaveText("Avaliação concluída");
    await registrarPiora(page);
    await expect(page.getByTestId("avc-ameacas-imediatas").getByText("Avaliação concluída")).toHaveCount(0);

    await page.getByTestId("avc-piora-engano").click();
    const dialogo = page.getByTestId("avc-confirmar-engano");
    await expect(dialogo, "⛔ corrigiu sem confirmação").toBeVisible();
    await page.getByTestId("avc-confirmar-engano-manter").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "«manter» apagou a piora").toBeVisible();

    await page.getByTestId("avc-piora-engano").click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "⛔ a tarefa ⛔ caiu").toHaveCount(0);
    await expect(page.getByTestId("avc-ameaca-progresso-via_aerea"), "⛔ o eixo ⛔ voltou a concluído").toHaveText("Avaliação concluída");
    await page.getByTestId("avc-aba-destino").click();
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha, "⛔ o evento sumiu da trilha").toContainText("Paciente piorou");
    await expect(linha).toContainText("registrado por engano");
  });

  test("AC-67 · reavaliação começada depois da piora: a correção ⛔ derruba a tarefa", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await registrarPiora(page);
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-opcao-hipoxia-nao").click();
    await page.getByTestId("avc-piora-engano").click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "⛔ a reavaliação começada foi desfeita").toBeVisible();
    await expect(page.getByTestId("avc-opcao-hipoxia-nao")).toHaveAttribute("aria-checked", "true");
  });

  test("AC-69 · marcos como linha do tempo: registrar, hora observada ⛔ e «registrado às», correção por marco, chegada sem saída avisada", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.locator('[data-testid^="avc-opcao-transf_"]'), "⛔ ainda há seletor de estado").toHaveCount(0);

    await registrarMarcoAgora(page, "Solicitada");
    await page.getByTestId("avc-g-registrar-marco").click();
    await page.getByTestId("avc-g-marco-tipo-Chegada").click();
    await page.getByTestId("avc-g-marco-informar-hora").click();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    const marcos = page.getByTestId("avc-g-marcos");
    await expect(marcos).toContainText("Chegada");
    await expect(marcos).toContainText("registrado às");
    await expect(page.getByTestId("avc-g-situacao-saida-nao-registrada"), "⛔ chegada sem saída ⛔ avisada").toBeVisible();

    const chegada = marcos.locator('[data-testid^="avc-g-marco-item-"]', { hasText: "Chegada" });
    await chegada.locator('[data-testid^="avc-g-marco-corrigir-hora-"]').click();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(marcos.locator('[data-testid^="avc-g-marco-item-"]', { hasText: "Chegada" })).toContainText("registrado às");

    const solicitada = marcos.locator('[data-testid^="avc-g-marco-item-"]', { hasText: "Solicitada" });
    await solicitada.locator('[data-testid^="avc-g-marco-engano-"]').click();
    await expect(page.getByTestId("avc-confirmar-engano"), "⛔ correção sem confirmação").toBeVisible();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(marcos.locator('[data-testid^="avc-g-marco-item-"]', { hasText: "Solicitada" })).toHaveCount(0);
    await expect(marcos, "⛔ a correção atingiu outro marco").toContainText("Chegada");
    await expect(page.getByTestId("avc-g-linha-do-tempo")).toContainText("registrado às");
  });

  test("AC-68 · texto livre grava ao sair do campo ou em «Registrar», ⛔ nunca por tecla", async ({ page }) => {
    await abrir(page);
    const campo = page.getByTestId("avc-texto-identificacao");
    await campo.pressSequentially("Leito 12");
    await page.waitForTimeout(400);
    expect(await fatosNaTrilha(page, "identificacao"), "⛔ gravou por tecla").toBe(0);
    await campo.blur();
    await expect.poll(() => fatosNaTrilha(page, "identificacao"), { message: "⛔ sair do campo ⛔ gravou" }).toBe(1);

    await campo.pressSequentially("A");
    await page.waitForTimeout(400);
    expect(await fatosNaTrilha(page, "identificacao")).toBe(1);
    await page.getByTestId("avc-texto-registrar-identificacao").click();
    await expect.poll(() => fatosNaTrilha(page, "identificacao"), { message: "⛔ «Registrar» ⛔ gravou" }).toBe(2);
  });
});
