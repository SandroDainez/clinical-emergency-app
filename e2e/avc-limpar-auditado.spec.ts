import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-PEND-26 (AC-63, autor, 2026-09-13) — «Limpar» sobre resposta que sustenta retenção
 * ou bloqueio pede confirmação ("foi engano?"), grava correção com motivo "toque errado"
 * ⛔ e devolve a pergunta a "não respondida" — ⛔ nunca a "Não". Regra genérica: HSA ⛔ e
 * coagulação. Controles: resposta que ⛔ sustenta nada limpa direto, sem diálogo.
 */

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

async function abrir(page: Page, aba: string) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId(`avc-aba-${aba}`).click();
  if (aba === "estabilizacao") await abrirEixosDaEstabilizacao(page);
  await abrirTudo(page);
}

async function nenhumaMarcada(page: Page, campo: string) {
  for (const v of ["sim", "nao", "nao_sei"]) {
    await expect(page.getByTestId(`avc-opcao-${campo}-${v}`), `${campo}-${v} marcada`).toHaveAttribute("aria-checked", "false");
  }
}

/** A trilha: algum evento gravado com motivo "toque errado" ⛔ e o fato corrigido. */
async function trilhaTemToqueErrado(page: Page, campo: string): Promise<boolean> {
  return page.evaluate((c) => new Promise<boolean>((resolve) => {
    const req = indexedDB.open("avc-atendimento");
    req.onsuccess = () => {
      const db = req.result;
      const tx = db.transaction("eventos", "readonly");
      const todos = tx.objectStore("eventos").getAll();
      todos.onsuccess = () => {
        const texto = JSON.stringify(todos.result);
        db.close();
        resolve(texto.includes("toque errado") && texto.includes(c) && texto.includes("corrigeFatoId"));
      };
      todos.onerror = () => { db.close(); resolve(false); };
    };
    req.onerror = () => resolve(false);
  }), campo);
}

test.describe("AVC · D-PEND-26 · «Limpar» auditado", () => {
  test("HSA «Sim» → «Limpar» pede confirmação; cancelar mantém; confirmar limpa, a retenção cai e a trilha diz «toque errado»", async ({ page }) => {
    await abrir(page, "imagem");
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    await page.getByTestId("avc-limpar-suspeita_hsa").click();

    const dialogo = page.getByTestId("avc-confirmar-limpar");
    await expect(dialogo, "⛔ «Limpar» liberou a retenção sem confirmação").toBeVisible();
    await expect(dialogo).toContainText("Foi engano?");
    await expect(dialogo).toContainText("toque errado");
    await page.getByTestId("avc-confirmar-limpar-cancelar").click();
    await expect(dialogo).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-suspeita_hsa-sim"), "cancelar apagou a resposta").toHaveAttribute("aria-checked", "true");

    await page.getByTestId("avc-limpar-suspeita_hsa").click();
    await page.getByTestId("avc-confirmar-limpar-sim").click();
    await nenhumaMarcada(page, "suspeita_hsa");
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-portao-motivo-suspeita_hsa"), "a retenção ⛔ caiu depois da correção").toHaveCount(0);
    await expect.poll(() => trilhaTemToqueErrado(page, "suspeita_hsa"), { timeout: 5_000 }).toBe(true);
  });

  test("D-PEND-27 · o destaque visual fica em «Manter a resposta»; «Foi engano — limpar» é secundário", async ({ page }) => {
    await abrir(page, "imagem");
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    await page.getByTestId("avc-limpar-suspeita_hsa").click();
    await expect(page.getByTestId("avc-confirmar-limpar")).toBeVisible();
    const fundo = (id: string) => page.getByTestId(id).evaluate((el) => getComputedStyle(el).backgroundColor);
    /** `primaryFill` dos dois temas (`design-system/tokens.ts`): o preenchimento da ação padrão. */
    const AZUL = "rgb(26, 107, 213)";
    expect(await fundo("avc-confirmar-limpar-cancelar"), "⛔ o caminho seguro ⛔ é a ação padrão").toBe(AZUL);
    expect(await fundo("avc-confirmar-limpar-sim"), "⛔ «limpar» ainda tem o destaque da ação padrão").not.toBe(AZUL);
  });

  test("coagulação «Sim» (bloqueio até resultado) → «Limpar» pede confirmação; confirmar deixa sem resposta", async ({ page }) => {
    const COAG = "motivo_para_suspeitar_alteracao_coagulacao";
    await abrir(page, "seguranca");
    await page.getByTestId(`avc-opcao-${COAG}-sim`).click();
    await page.getByTestId(`avc-limpar-${COAG}`).click();
    await expect(page.getByTestId("avc-confirmar-limpar"), "⛔ bloqueio limpo sem confirmação").toBeVisible();
    await page.getByTestId("avc-confirmar-limpar-sim").click();
    await nenhumaMarcada(page, COAG);
    await expect.poll(() => trilhaTemToqueErrado(page, COAG), { timeout: 5_000 }).toBe(true);
  });

  test("controles: coagulação «Não» ⛔ e hipóxia «Sim» ⛔ sustentam bloqueio — «Limpar» limpa direto, sem diálogo", async ({ page }) => {
    const COAG = "motivo_para_suspeitar_alteracao_coagulacao";
    await abrir(page, "seguranca");
    await page.getByTestId(`avc-opcao-${COAG}-nao`).click();
    await page.getByTestId(`avc-limpar-${COAG}`).click();
    await expect(page.getByTestId("avc-confirmar-limpar")).toHaveCount(0);
    await nenhumaMarcada(page, COAG);

    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-opcao-hipoxia-sim").click();
    await page.getByTestId("avc-limpar-hipoxia").click();
    await expect(page.getByTestId("avc-confirmar-limpar")).toHaveCount(0);
    await nenhumaMarcada(page, "hipoxia");
  });
});
