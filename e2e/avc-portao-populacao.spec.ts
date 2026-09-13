import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * AC-03 · PORTÃO DE POPULAÇÃO na entrada do AVC, pelo gesto do médico.
 *
 * Fonte: `protocols/fontes-verbatim/escopo-populacional-avc.md` — [CORREÇÃO 12/09]
 * e instrução escrita do autor (2026-09-13): menor de 18 anos, gestante ou
 * puérpera ⇒ "Fora do escopo validado — encaminhar", ⛔ sem dose por peso; idade
 * ou gestação desconhecidas ⛔ não viram adulto; só a Estabilização abre antes.
 */

const FORA = "Fora do escopo validado — encaminhar";

async function abrirCru(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await expect(page.getByText("AVC isquêmico agudo").first()).toBeVisible();
}

async function responder(page: Page, faixa: string, gestacao?: string) {
  await page.getByTestId(`avc-opcao-faixa_etaria-${faixa}`).click();
  if (gestacao !== undefined) await page.getByTestId(`avc-opcao-gestacao_puerperio-${gestacao}`).click();
}

async function aba(page: Page, id: string) {
  await page.getByTestId(`avc-aba-${id}`).click();
}

test.describe("AVC · portão de população", () => {
  test("abrir o AVC pergunta a população ⛔ antes do protocolo", async ({ page }) => {
    await abrirCru(page);
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible();
    await expect(page.getByTestId("avc-f-raia-ivt")).toHaveCount(0);
  });

  test("com a população sem resposta, a Estabilização continua aberta", async ({ page }) => {
    await abrirCru(page);
    await aba(page, "estabilizacao");
    await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
    await expect(page.getByTestId("avc-portao-populacao")).toHaveCount(0);
  });

  for (const [nome, faixa, gestacao] of [
    ["menos de 18 anos", "Menos de 18 anos", undefined],
    ["gestante", "18 anos ou mais", "Gestante"],
    ["puérpera", "18 anos ou mais", "Puérpera"],
  ] as const) {
    test(`${nome} → «${FORA}», ⛔ e o protocolo ⛔ não abre`, async ({ page }) => {
      await abrirCru(page);
      await responder(page, faixa, gestacao);
      await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText(FORA);
      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText(FORA);
      await expect(page.getByTestId("avc-f-raia-ivt")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-dose-valor")).toHaveCount(0);
    });
  }

  test("idade «não sei» ⛔ não é adulto: a pergunta continua", async ({ page }) => {
    await abrirCru(page);
    await responder(page, "nao_sei", "Não gestante e não puérpera");
    await expect(page.getByTestId("avc-portao-pergunta-pendente")).toBeVisible();
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toHaveCount(0);
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-raia-ivt")).toHaveCount(0);
  });

  test("gestação «não sei» ⛔ não é negativo: a pergunta continua", async ({ page }) => {
    await abrirCru(page);
    await responder(page, "18 anos ou mais", "nao_sei");
    await expect(page.getByTestId("avc-portao-pergunta-pendente")).toBeVisible();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-raia-ivt")).toHaveCount(0);
  });

  test("adulto validado: a dose por peso aparece; ⛔ corrigido para menor de 18, some", async ({ page }) => {
    await abrirCru(page);
    await responder(page, "18 anos ou mais", "Não gestante e não puérpera");
    await expect(page.getByTestId("avc-portao-populacao")).toHaveCount(0);

    await aba(page, "paciente");
    await page.getByTestId("avc-num-caixa-peso").fill("70");
    await page.getByTestId("avc-num-caixa-peso").blur();
    await page.getByTestId("avc-opcao-peso_origem-Estimado pela equipe").click();
    await aba(page, "reperfusao");
    /** ⚠️ Controle positivo: validado, a Reperfusão desenha a raia que os outros testes veem ausente. */
    await expect(page.getByTestId("avc-f-raia-ivt")).toBeVisible();
    await page.getByTestId("avc-f-agente-Alteplase").click();
    await expect(page.getByTestId("avc-f-dose-valor")).toBeVisible();

    await aba(page, "paciente");
    await page.getByTestId("avc-opcao-faixa_etaria-Menos de 18 anos").click();
    await expect(page.getByTestId("avc-portao-fora-do-escopo")).toContainText(FORA);
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-dose-valor")).toHaveCount(0);
  });
});
