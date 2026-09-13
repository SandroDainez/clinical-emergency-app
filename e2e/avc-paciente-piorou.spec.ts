import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * «Paciente piorou» GLOBAL — ajuste de rota do autor, 2026-09-13 (AC-10, A11).
 * Uma ação acessível de qualquer tela do AVC: grava o evento (autor, horário, texto
 * livre opcional), cria a tarefa «reavaliar agora» em Prioridade ⛔ e reabre a avaliação
 * de ameaças da Estabilização com o histórico preservado. ⛔ Sem limiar, ⛔ sem conduta.
 * A espera da transferência usa o mesmo mecanismo.
 */

const SUPERFICIES = ["paciente", "estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"] as const;

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

/** Algum evento da trilha gravou `paciente_piorou` com autor carimbado. */
async function eventoDePioraComAutor(page: Page): Promise<boolean> {
  return page.evaluate(() => new Promise<boolean>((resolve) => {
    const req = indexedDB.open("avc-atendimento");
    req.onsuccess = () => {
      const db = req.result;
      const todos = db.transaction("eventos", "readonly").objectStore("eventos").getAll();
      todos.onsuccess = () => {
        const achado = (todos.result as { autor?: string }[]).some(
          (ev) => JSON.stringify(ev).includes("paciente_piorou") && typeof ev.autor === "string" && ev.autor.length > 0
        );
        db.close();
        resolve(achado);
      };
      todos.onerror = () => { db.close(); resolve(false); };
    };
    req.onerror = () => resolve(false);
  }));
}

test.describe("AVC · «Paciente piorou» global", () => {
  test("visível ⛔ e acionável em TODAS as superfícies a 375 px, rolado até o fim ⛔ e com bloco recolhido", async ({ page }) => {
    await abrir(page);
    let recolhidos = 0;
    for (const id of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
      /**
       * ⚠️ Os blocos nascem recolhidos: abre um ⛔ e o recolhe DE NOVO, para medir o
       * botão depois de um recolhimento feito pelo médico ⛔ e ⛔ não só no estado inicial.
       */
      const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]').first();
      if ((await fechado.count()) > 0) {
        const id = await fechado.getAttribute("data-testid");
        await fechado.click();
        await expect(page.getByTestId(id!)).toHaveAttribute("aria-expanded", "true");
        await page.getByTestId(id!).click();
        await expect(page.getByTestId(id!)).toHaveAttribute("aria-expanded", "false");
        recolhidos++;
      }
      await page.mouse.move(187, 400);
      await page.mouse.wheel(0, 30_000);
      const botao = page.getByTestId("avc-piorou");
      await expect(botao, `⛔ «Paciente piorou» fora da tela em ${id}`).toBeInViewport();
      await botao.click();
      await expect(page.getByTestId("avc-piorou-dialogo"), `⛔ o toque ⛔ não abriu nada em ${id}`).toBeVisible();
      await page.getByTestId("avc-piorou-cancelar").click();
      await expect(page.getByTestId("avc-piorou-dialogo")).toHaveCount(0);
    }
    expect(recolhidos, "⛔ nenhuma superfície tinha bloco a recolher — a condição ⛔ não foi medida").toBeGreaterThan(0);
    await expect(page.getByTestId("avc-prioridade-reavaliar"), "cancelar ⛔ registra nada").toHaveCount(0);
  });

  test("A11 · piora após trombólise → avaliação imediata: tarefa em Prioridade, eixos reabertos, trilha preservada, autor carimbado", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-eixo-concluir-via-aerea").click();
    await expect(page.getByTestId("avc-ameaca-progresso-via_aerea")).toHaveText("Avaliação concluída");

    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-nova-trombolise").click();
    await page.getByTestId("avc-opcao-ivt_estado-Realizada").click();

    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-piorou").click();
    const dialogo = page.getByTestId("avc-piorou-dialogo");
    await expect(dialogo).toContainText("Paciente piorou");
    await page.getByTestId("avc-piorou-texto").fill("rebaixou o nível de consciência");
    await page.getByTestId("avc-piorou-registrar").click();
    await expect(dialogo).toHaveCount(0);

    await expect(page.getByTestId("avc-superficie-estabilizacao"), "⛔ a avaliação de ameaças ⛔ foi reaberta").toBeVisible();
    const prioridade = page.getByTestId("avc-prioridade-reavaliar");
    await expect(prioridade, "⛔ a tarefa ⛔ aparece de imediato no topo").toBeInViewport();
    await expect(prioridade).toContainText("Reavaliar agora");
    await expect(page.getByTestId("avc-ameacas-imediatas").getByText("Avaliação concluída"), "⛔ o eixo concluído continuou concluído").toHaveCount(0);
    await expect(page.locator('[data-testid="avc-pendencias"] [data-testid^="avc-pendencia-"]').first())
      .toHaveAttribute("data-testid", "avc-pendencia-reavaliar_apos_piora");

    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-opcao-ivt_estado-Realizada"), "⛔ a piora apagou o tratamento").toHaveAttribute("aria-checked", "true");
    await expect.poll(() => eventoDePioraComAutor(page), { timeout: 5_000 }).toBe(true);

    await page.getByTestId("avc-prioridade-reavaliar").click();
    await expect(page.getByTestId("avc-superficie-estabilizacao")).toBeVisible();
  });

  test("piora durante a espera da transferência: mesmo mecanismo, ⛔ e a transferência continua", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-opcao-transf_estado-Solicitada").click();
    await page.getByTestId("avc-opcao-transf_estado-Aceite").click();

    await page.getByTestId("avc-piorou").click();
    await page.getByTestId("avc-piorou-registrar").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar")).toBeInViewport();

    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-opcao-transf_estado-Aceite"), "⛔ a piora mexeu na transferência").toHaveAttribute("aria-checked", "true");
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha).toContainText("Aceite registrado");
    await expect(linha).toContainText("Paciente piorou");
  });

  test("ES · botão, diálogo ⛔ e tarefa em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    const botao = page.getByTestId("avc-piorou");
    await expect(botao).toContainText("El paciente empeoró");
    await botao.click();
    await expect(page.getByTestId("avc-piorou-dialogo")).not.toContainText("Registra o evento");
    await page.getByTestId("avc-piorou-registrar").click();
    await expect(page.getByTestId("avc-prioridade-reavaliar")).toContainText("Reevaluar ahora");
  });
});
