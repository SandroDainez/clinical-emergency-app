import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * «Preciso de ajuda» GLOBAL — decisão do autor, 2026-09-13 (11ª rodada; fecha AC-10).
 * No mesmo topo fixo do «Paciente piorou». Opções do PDF: não sei avaliar · não tenho o
 * medicamento · não tenho o equipamento · não melhorou · paciente piorou. Cada opção leva
 * a conteúdo ou caminho com retorno preservado; sem conteúdo, a tela diz ⛔ e permite
 * registrar a conduta externa, ⛔ sem simular execução.
 */

const SUPERFICIES = ["paciente", "estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"] as const;
const OPCOES_COM_PAINEL = ["nao_sei_avaliar", "sem_medicamento", "sem_equipamento", "nao_melhorou"] as const;

async function abrir(page: Page, idioma: "pt-BR" | "es-419" = "pt-BR") {
  await fixarIdioma(page, idioma);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

/** A rolagem do conteúdo: o ancestral rolável da superfície aberta. */
async function rolagem(page: Page, definir?: number): Promise<number> {
  return page.evaluate((y) => {
    let n = document.querySelector('[data-testid^="avc-superficie-"]') as HTMLElement | null;
    while (n && !(n.scrollHeight > n.clientHeight && /auto|scroll/.test(getComputedStyle(n).overflowY))) n = n.parentElement;
    if (!n) return -1;
    if (y !== undefined) { n.scrollTop = y; n.dispatchEvent(new Event("scroll")); }
    return n.scrollTop;
  }, definir);
}

test.describe("AVC · «Preciso de ajuda» global", () => {
  test("visível ⛔ e acionável nas 7 superfícies a 375 px, rolado até o fim; as cinco opções do PDF", async ({ page }) => {
    await abrir(page);
    for (const id of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
      await page.mouse.move(187, 500);
      await page.mouse.wheel(0, 30_000);
      const botao = page.getByTestId("avc-ajuda");
      await expect(botao, `⛔ «Preciso de ajuda» fora da tela em ${id}`).toBeInViewport();
      await expect(page.getByTestId("avc-piorou"), `⛔ os dois botões globais juntos em ${id}`).toBeInViewport();
      await botao.click();
      const dialogo = page.getByTestId("avc-ajuda-dialogo");
      await expect(dialogo, `⛔ o toque ⛔ abriu nada em ${id}`).toBeVisible();
      for (const op of [...OPCOES_COM_PAINEL, "paciente_piorou"]) {
        await expect(page.getByTestId(`avc-ajuda-opcao-${op}`)).toBeVisible();
      }
      await page.getByTestId("avc-ajuda-fechar").click();
      await expect(dialogo).toHaveCount(0);
    }
  });

  test("⛔ beco sem saída: toda opção tem texto, caminho, registro, «voltar às opções» ⛔ e «fechar»", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-ajuda").click();
    for (const op of OPCOES_COM_PAINEL) {
      await page.getByTestId(`avc-ajuda-opcao-${op}`).click();
      const painel = page.getByTestId(`avc-ajuda-painel-${op}`);
      await expect(painel, `⛔ ${op} ⛔ abriu painel`).toBeVisible();
      await expect(painel.getByTestId("avc-ajuda-texto-da-opcao")).not.toBeEmpty();
      expect(await painel.locator('[data-testid^="avc-ajuda-caminho-"]').count(), `⛔ ${op} sem caminho`).toBeGreaterThan(0);
      await expect(painel.getByTestId("avc-ajuda-conduta")).toBeVisible();
      await expect(painel.getByTestId("avc-ajuda-registrar")).toBeVisible();
      await expect(painel.getByTestId("avc-ajuda-fechar")).toBeVisible();
      await painel.getByTestId("avc-ajuda-voltar").click();
    }
    await expect(page.getByTestId("avc-ajuda-opcao-nao_sei_avaliar")).toBeVisible();
  });

  test("cada caminho leva à superfície ⛔ e a faixa de retorno volta ao ponto de origem, com a rolagem", async ({ page }) => {
    await abrir(page);
    for (const op of OPCOES_COM_PAINEL) {
      await page.getByTestId("avc-aba-reperfusao").click();
      await expect(page.getByTestId("avc-superficie-reperfusao")).toBeVisible();
      await rolagem(page, 900);
      const antes = await rolagem(page);
      expect(antes, "⛔ a Reperfusão ⛔ rolou — a condição ⛔ foi medida").toBeGreaterThan(300);
      await page.getByTestId("avc-ajuda").click();
      await page.getByTestId(`avc-ajuda-opcao-${op}`).click();
      const caminhos = page.getByTestId(`avc-ajuda-painel-${op}`).locator('[data-testid^="avc-ajuda-caminho-"]');
      const n = await caminhos.count();
      for (let i = 0; i < n; i++) {
        if (i > 0) {
          await rolagem(page, 900);
          await page.getByTestId("avc-ajuda").click();
          await page.getByTestId(`avc-ajuda-opcao-${op}`).click();
        }
        const alvo = page.getByTestId(`avc-ajuda-painel-${op}`).locator('[data-testid^="avc-ajuda-caminho-"]').nth(i);
        const superficie = (await alvo.getAttribute("data-testid"))!.replace(`avc-ajuda-caminho-${op}-`, "");
        await alvo.click();
        await expect(page.getByTestId("avc-ajuda-dialogo")).toHaveCount(0);
        await expect(page.getByTestId(`avc-superficie-${superficie}`), `⛔ ${op} → ${superficie}`).toBeVisible();
        const retorno = page.getByTestId("avc-ajuda-retorno");
        await expect(retorno, `⛔ ${op} → ${superficie} sem caminho de volta`).toBeInViewport();
        await expect(retorno).toContainText("Reperfusão");
        await retorno.click();
        await expect(page.getByTestId("avc-superficie-reperfusao"), "⛔ ⛔ voltou à origem").toBeVisible();
        await expect.poll(() => rolagem(page), { message: "⛔ a rolagem da origem ⛔ foi preservada" }).toBeGreaterThan(antes - 60);
        await expect(retorno).toHaveCount(0);
      }
    }
  });

  test("registrar conduta externa: fica na origem, entra na linha do tempo como registro da equipe", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-ajuda").click();
    await page.getByTestId("avc-ajuda-opcao-sem_equipamento").click();
    const painel = page.getByTestId("avc-ajuda-painel-sem_equipamento");
    await expect(painel.getByTestId("avc-ajuda-texto-da-opcao")).toContainText("não tem conteúdo");
    await painel.getByTestId("avc-ajuda-conduta").fill("TC do hospital em manutenção; regulação acionada");
    await painel.getByTestId("avc-ajuda-registrar").click();
    await expect(painel.getByTestId("avc-ajuda-registrado")).toBeVisible();
    await painel.getByTestId("avc-ajuda-fechar").click();
    await expect(page.getByTestId("avc-superficie-imagem"), "⛔ registrar tirou o médico da tela").toBeVisible();
    await page.getByTestId("avc-aba-destino").click();
    const linha = page.getByTestId("avc-g-linha-do-tempo");
    await expect(linha).toContainText("Conduta externa registrada");
    await expect(linha).toContainText("TC do hospital em manutenção; regulação acionada");
  });

  test("«paciente piorou» chama o mecanismo existente", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-ajuda").click();
    await page.getByTestId("avc-ajuda-opcao-paciente_piorou").click();
    await expect(page.getByTestId("avc-ajuda-dialogo")).toHaveCount(0);
    await expect(page.getByTestId("avc-piorou-dialogo")).toBeVisible();
  });

  test("ES · botão, opções ⛔ e painel em espanhol", async ({ page }) => {
    await abrir(page, "es-419");
    await expect(page.getByTestId("avc-ajuda")).toContainText("Necesito ayuda");
    await page.getByTestId("avc-ajuda").click();
    await expect(page.getByTestId("avc-ajuda-opcao-sem_medicamento")).toContainText("No tengo el medicamento");
    await page.getByTestId("avc-ajuda-opcao-sem_medicamento").click();
    await expect(page.getByTestId("avc-ajuda-painel-sem_medicamento")).not.toContainText("não tem conteúdo");
  });
});
