import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, registrarMarcoAgora, responderPopulacaoAdulta } from "./helpers";

/**
 * 12ª rodada · Entrega 1 (autor, 2026-09-13): AC-71 (estimativa aceita futuro, observado
 * ⛔), AC-72 (teleconsulta por marcos), AC-73 (correção por engano sempre no evento da
 * linha do tempo) ⛔ e nome de exame que ⛔ trunca.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

async function ultimoValorGravado(page: Page, campo: string): Promise<unknown> {
  return page.evaluate((c) => new Promise<unknown>((resolve) => {
    const req = indexedDB.open("avc-atendimento");
    req.onsuccess = () => {
      const db = req.result;
      const todos = db.transaction("eventos", "readonly").objectStore("eventos").getAll();
      todos.onsuccess = () => {
        const fatos = (todos.result as { dados?: { fato?: { campo?: string; valor?: unknown } } }[])
          .map((ev) => ev.dados?.fato).filter((f) => f?.campo === c);
        db.close();
        resolve(fatos.length === 0 ? undefined : fatos[fatos.length - 1]!.valor);
      };
      todos.onerror = () => { db.close(); resolve(undefined); };
    };
    req.onerror = () => resolve(undefined);
  }), campo);
}

test.describe("AVC · 12ª rodada · Entrega 1", () => {
  test("AC-71 · estimativa aceita horário futuro; marco observado ⛔", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();

    await page.getByTestId("avc-g-registrar-marco").click();
    await page.getByTestId("avc-g-marco-tipo-Chegada").click();
    await page.getByTestId("avc-g-marco-informar-hora").click();
    await expect(page.getByTestId("avc-seletor-hora-mais1"), "⛔ marco observado aceitou futuro").toBeDisabled();
    await page.getByTestId("avc-seletor-hora-cancelar").click();
    await page.getByTestId("avc-g-marco-cancelar").click();

    const antes = Date.now();
    await page.getByTestId("avc-hora-transf_previsao").click();
    await expect(page.getByTestId("avc-seletor-hora-teto"), "⛔ a estimativa ⛔ é fato passado").toHaveCount(0);
    await page.getByTestId("avc-seletor-hora-mais1").click();
    await page.getByTestId("avc-seletor-hora-mais1").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect.poll(async () => Number(await ultimoValorGravado(page, "transf_previsao")), { message: "⛔ previsão futura ⛔ gravada" })
      .toBeGreaterThan(antes + 5 * 60_000);
    await expect(page.getByTestId("avc-g-linha-do-tempo")).toContainText("estimativa");
  });

  test("AC-72 · teleconsulta por marcos: parecer exige texto ⛔ e autor; engano no parecer tira a avaliação especializada", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.locator('[data-testid^="avc-opcao-tele_"]'), "⛔ ainda há seletor de estado na teleconsulta").toHaveCount(0);

    await page.getByTestId("avc-g-registrar-tele-marco").click();
    await page.getByTestId("avc-g-tele-marco-tipo-Solicitada").click();
    await page.getByTestId("avc-g-tele-marco-agora").click();
    const marcos = page.getByTestId("avc-g-tele-marcos");
    await expect(marcos).toContainText("Solicitada");

    await page.getByTestId("avc-g-registrar-tele-marco").click();
    await page.getByTestId("avc-g-tele-marco-tipo-Parecer registrado").click();
    await expect(page.getByTestId("avc-g-tele-marco-agora"), "⛔ parecer sem texto ⛔ autor pôde ser registrado").toBeDisabled();
    await page.getByTestId("avc-g-tele-parecer-texto").fill("texto do parecer");
    await page.getByTestId("avc-g-tele-parecer-autor").fill("Dra. Neuro");
    await page.getByTestId("avc-g-tele-marco-agora").click();
    await expect(marcos).toContainText("Parecer registrado");
    await expect(page.getByTestId("avc-g-situacao-avaliacao-especializada")).toHaveText("Avaliação especializada registrada");
    await expect(page.getByTestId("avc-g-linha-do-tempo")).toContainText("texto do parecer — Dra. Neuro");

    const parecer = marcos.locator('[data-testid^="avc-g-tele-marco-item-"]', { hasText: "Parecer registrado" });
    await parecer.locator('[data-testid^="avc-g-tele-marco-engano-"]').click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-g-situacao-avaliacao-especializada")).toHaveCount(0);
    await expect(marcos, "⛔ a correção atingiu outro marco").toContainText("Solicitada");
  });

  test("AC-73 · reavaliação completa: a correção por engano continua no evento da linha do tempo, ⛔ e nada volta", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-registrar").click();
    for (const g of ["via-aerea", "respiracao", "pressao", "neurologico-inicial"]) {
      await abrirEixosDaEstabilizacao(page);
      const botao = page.getByTestId(`avc-eixo-concluir-${g}`);
      if ((await botao.textContent())?.includes("Concluir")) await botao.click();
    }
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "a reavaliação ⛔ terminou").toHaveCount(0);

    await page.getByTestId("avc-aba-destino").click();
    const botao = page.getByTestId("avc-g-linha-do-tempo").locator('[data-testid^="avc-g-tempo-engano-"]');
    await expect(botao, "⛔ a correção sumiu porque o tempo passou").toHaveCount(1);
    await botao.click();
    await page.getByTestId("avc-confirmar-engano-sim").click();
    await expect(page.getByTestId("avc-g-linha-do-tempo")).toContainText("registrado por engano");
    await expect(page.getByTestId("avc-g-linha-do-tempo").locator('[data-testid^="avc-g-tempo-engano-"]'), "⛔ corrigir duas vezes").toHaveCount(0);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "⛔ a tarefa voltou").toHaveCount(0);
    /** ⚠️ Ajuste consciente (autor, 2026-09-15): quatro eixos ABCD, ⛔ há E. */
    await expect(page.getByTestId("avc-ameacas-imediatas").getByText("Avaliação concluída"), "⛔ a reavaliação feita foi desfeita").toHaveCount(4);
  });

  test("nome de exame ⛔ trunca na linha de prioridade a 375 px", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-neurologico").click();
    const linha = page.getByTestId("avc-prioridade-imagem");
    await expect(linha).toBeVisible();
    const truncados = await linha.evaluate((raiz) => {
      const alvo = Array.from(raiz.querySelectorAll("*")).find((el) => el.childElementCount === 0 && /Tomografia de crânio/.test(el.textContent ?? ""));
      if (!alvo) return "sem título";
      const cs = getComputedStyle(alvo as HTMLElement);
      const clamp = (cs as unknown as Record<string, string>).webkitLineClamp ?? cs.getPropertyValue("-webkit-line-clamp");
      const el = alvo as HTMLElement;
      return clamp && clamp !== "none" && clamp !== "" ? `line-clamp ${clamp}` : el.scrollHeight > el.clientHeight + 1 ? "cortado" : "inteiro";
    });
    expect(truncados, "⛔ nome de exame truncado").toBe("inteiro");
  });
});
