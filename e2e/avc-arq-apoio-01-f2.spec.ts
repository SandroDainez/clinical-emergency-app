import { expect, test, type Locator, type Page } from "@playwright/test";

import { fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * ARQ-APOIO-01 · F2 (autor, 2026-09-15) — a tela.
 *
 * · «Limpar» do resultado de exame que sustenta alerta pede «Foi engano?» e corrige a instância TOCADA: com duas TCs ou
 *   duas coletas, a outra fica intocada (trava por identidade da instância).
 * · AP-5: no caminho hemorrágico a Reperfusão fica acessível, em modo contextual, sem controles executáveis.
 * · Dose e AP-6: origem «Medido»; peso com origem «Não sei» calcula e diz «origem do peso não informada»; o teto aplicado
 *   é dito; a mensagem de dose vazia não culpa o dado que não falta.
 *
 * VERMELHAS DECLARADAS: `test.fail` marca cada teste como vermelho esperado até o commit que o torna verde. Se passar
 * antes disso, a suíte reprova — a marca sai no commit que o torna verde.
 */

const COM_HEMORRAGIA = "Hemorragia intracraniana identificada";
const SEM_HEMORRAGIA = "Sem hemorragia intracraniana identificada";

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
}

/** O cartão da instância, aberto. */
async function cartao(page: Page, tipo: "estudo" | "coleta", id: string): Promise<Locator> {
  const alternar = page.getByTestId(`avc-${tipo}-abrir-${id}`);
  if ((await alternar.count()) > 0 && (await alternar.getAttribute("aria-expanded")) === "false") await alternar.click();
  await abrirTudo(page);
  return page.getByTestId(`avc-${tipo}-${id}`);
}

async function novaTc(page: Page, id: string, resultado: string) {
  await page.getByTestId("avc-aba-imagem").click();
  await page.getByTestId("avc-novo-estudo").click();
  const c = await cartao(page, "estudo", id);
  await c.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
  await abrirTudo(page);
  await c.getByTestId(`avc-opcao-estudo_resultado-${resultado}`).click();
}

async function pesoEAgente(page: Page, kg: number | undefined, origem: string | undefined, agente: "Alteplase" | undefined) {
  await page.getByTestId("avc-aba-paciente").click();
  if (kg !== undefined) {
    await page.getByTestId("avc-num-caixa-peso").fill(String(kg));
    await page.getByTestId("avc-num-caixa-peso").blur();
  }
  if (origem !== undefined) await page.getByTestId(`avc-opcao-peso_origem-${origem}`).click();
  await page.getByTestId("avc-aba-reperfusao").click();
  if (agente !== undefined) await page.getByTestId(`avc-f-agente-${agente}`).click();
}

test.describe("AVC · ARQ-APOIO-01 · F2", () => {
  test("Limpar: o resultado da TC com hemorragia pede «Foi engano?»", async ({ page }) => {
    await abrir(page);
    await novaTc(page, "estudo_1", COM_HEMORRAGIA);
    await page.getByTestId("avc-limpar-estudo_resultado").click();
    await expect(page.getByTestId("avc-confirmar-limpar"), "o alerta crítico sumiu sem correção auditada").toBeVisible();
    await expect(page.getByTestId("avc-confirmar-limpar")).toContainText("Foi engano?");
  });

  test("Limpar por instância: TC com hemorragia e TC sem — limpar a primeira deixa a segunda intocada", async ({ page }) => {
    await abrir(page);
    await novaTc(page, "estudo_1", COM_HEMORRAGIA);
    await novaTc(page, "estudo_2", SEM_HEMORRAGIA);

    const um = await cartao(page, "estudo", "estudo_1");
    await um.getByTestId("avc-limpar-estudo_resultado").click();
    await expect(page.getByTestId("avc-confirmar-limpar"), "a divergência crítica sumiu sem correção auditada").toBeVisible();
    await page.getByTestId("avc-confirmar-limpar-sim").click();

    await expect(um.getByTestId(`avc-opcao-estudo_resultado-${COM_HEMORRAGIA}`), "a primeira TC continua com o achado").toHaveAttribute("aria-checked", "false");
    const dois = await cartao(page, "estudo", "estudo_2");
    await expect(dois.getByTestId(`avc-opcao-estudo_resultado-${SEM_HEMORRAGIA}`), "corrigiu a TC errada").toHaveAttribute("aria-checked", "true");
  });

  /**
   * ⚠️ Coletas: na tela, resultado de laboratório já registrado não tem «Limpar» — muda só por «Corrigir resultado»
   * (autor, 2026-08-30: redigitar um analito não tem semântica implícita). A trava por instância das coletas é medida no
   * núcleo (`prova-avc-arq-apoio-01-f2`, LIMPAR-DUAS-COLETAS); aqui, nas duas TCs.
   */

  test("AP-5: Reperfusão acessível no caminho hemorrágico, contextual, sem controles executáveis", async ({ page }) => {
    await abrir(page);
    await novaTc(page, "estudo_1", COM_HEMORRAGIA);
    await expect(page.getByTestId("avc-aba-reperfusao"), "a aba sumiu").toBeVisible();
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-contexto-hemorragia")).toContainText("Hemorragia identificada — reperfusão do AVC isquêmico não se aplica neste estado.");
    await expect(page.getByTestId("avc-nova-trombolise")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-agente-Alteplase")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-decisao-imagem")).toHaveCount(0);
    /** ⚠️ Fica, só leitura: o motivo do portão com a fonte. */
    await expect(page.getByTestId("avc-f-portao-motivo-imagem")).toBeVisible();
    /** ⚠️ Sem administração, ⛔ nenhum aviso de ordem. */
    await expect(page.locator('[data-testid^="avc-f-hemorragia-sequencia-"]')).toHaveCount(0);
  });

  test("AP-6: origem «Não sei» calcula a dose e diz «origem do peso não informada»", async ({ page }) => {
    await abrir(page);
    await pesoEAgente(page, 70, "nao_sei", "Alteplase");
    await expect(page.getByTestId("avc-f-dose-valor"), "a origem impediu o cálculo").toContainText("63 mg");
    await expect(page.getByTestId("avc-f-dose-origem")).toContainText("origem do peso não informada");
  });

  test("AP-6 + teto: 108 kg medido → «Dose calculada limitada ao máximo de 90 mg», origem na linha da dose", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-paciente").click();
    await page.getByTestId("avc-opcao-peso_origem-Medido").click({ timeout: 5_000 });
    await pesoEAgente(page, 108, undefined, "Alteplase");
    await expect(page.getByTestId("avc-f-dose-valor")).toContainText("90 mg");
    await expect(page.getByTestId("avc-f-dose-teto")).toContainText(/dose calculada limitada ao máximo de 90 mg/i);
    await expect(page.getByTestId("avc-f-dose-origem")).toContainText(/108 kg.*medido/i);
  });

  /** ⚠️ Ajuste de instrumento: os dois casos em testes separados (contexto novo) — com o agente já marcado, a dose sai e ⛔ há texto vazio a ler. */
  test("dose vazia sem peso: diz que falta o peso, sem culpar o agente já escolhido", async ({ page }) => {
    await abrir(page);
    await pesoEAgente(page, undefined, undefined, "Alteplase");
    await expect(page.getByTestId("avc-f-dose-vazia")).toContainText("Sem peso registrado, não há dose. O app não estima peso.");
    await expect(page.getByTestId("avc-f-dose-vazia"), "culpa o agente, que já foi escolhido").not.toContainText(/agente/i);
  });

  test("dose vazia com peso e sem agente: pede o agente, sem culpar o peso já registrado", async ({ page }) => {
    await abrir(page);
    await pesoEAgente(page, 70, "Estimado pela equipe", undefined);
    await expect(page.getByTestId("avc-f-dose-vazia")).toContainText("Escolha o agente para ver a dose.");
    await expect(page.getByTestId("avc-f-dose-vazia"), "culpa o peso, que já foi registrado").not.toContainText(/Sem peso registrado/);
  });
});
