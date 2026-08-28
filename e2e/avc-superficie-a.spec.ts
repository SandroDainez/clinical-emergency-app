import { expect, test } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície A tenha COMPORTAMENTO, não apenas campos.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-a.cjs`
 * — aqui mede-se o que só a tela pode mostrar: que o fato entra no estado
 * compartilhado, que a derivação recalcula à vista, e que os três vazios são
 * distinguíveis olhando (E-37).
 */
async function abrirA(page: import("@playwright/test").Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-A").click();
  await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
}

test.describe("Superfície A — estabilização", () => {
  test("o fato entra no estado e a leitura recalcula à vista", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // Antes: a leitura de oxigênio não pode concluir nada.
    await expect(page.getByTestId("avc-leitura-oxigenio"))
      .toContainText(/ainda não informada/i);

    await page.getByTestId("avc-opcao-hipoxia-sim").click();

    // Depois: recalculou, e a meta declarada pela fonte aparece.
    await expect(page.getByTestId("avc-leitura-oxigenio")).toContainText(/94/);
  });

  test("SpO₂ sozinha não gera indicação de oxigênio", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // Sobe a SpO₂ com o ajuste fino — sem tocar em hipóxia.
    for (let i = 0; i < 3; i += 1) await page.getByTestId("avc-mais-spo2").click();

    // ⚠️ 94% é META na presença de hipóxia, ⛔ não corte diagnóstico.
    await expect(page.getByTestId("avc-leitura-oxigenio"))
      .toContainText(/hipóxia ainda não/i);
  });

  test("glicemia não informada aparece como desconhecida, não como normal", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-leitura-hipoglicemia"))
      .toContainText(/desconhecida não é normal/i);
  });

  test("os três vazios são distinguíveis olhando", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const campo = page.getByTestId("avc-campo-crise_no_inicio");
    // 1 · não perguntado
    await expect(campo).toContainText(/não informado/i);

    // 2 · "não sei" é resposta, e a tela mostra outra coisa
    await page.getByTestId("avc-opcao-crise_no_inicio-nao_sei").click();
    await expect(campo).toContainText(/Não sei/);

    // 3 · resposta negativa é a terceira coisa
    await page.getByTestId("avc-opcao-crise_no_inicio-nao").click();
    await expect(page.getByTestId("avc-leitura-crise")).toContainText(/Sem crise/i);
  });

  test("crise no início é contexto, e não exclui AVC", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-opcao-crise_no_inicio-sim").click();
    await expect(page.getByTestId("avc-leitura-crise")).toContainText(/não exclui AVC/i);
    // ⛔ E a superfície continua inteira — crise não encerra nada.
    await expect(page.getByTestId("avc-campo-glicemia")).toBeVisible();
  });

  test("peso desconhecido não bloqueia a superfície", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-leitura-peso")).toContainText(/não atrasa/i);
    // Sem peso, todos os outros campos seguem utilizáveis.
    await page.getByTestId("avc-opcao-consciencia_rebaixada-sim").click();
    await expect(page.getByTestId("avc-leitura-via_aerea")).toContainText(/recomendados/i);
  });

  test("a pressão é registrada sem definir candidatura", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    for (let i = 0; i < 2; i += 1) {
      await page.getByTestId("avc-mais-pas").click();
      await page.getByTestId("avc-mais-pad").click();
    }
    const leitura = page.getByTestId("avc-leitura-pressao");
    await expect(leitura).toContainText(/depende do contexto/i);
    // ⛔ Nenhuma meta pressórica de candidato pode aparecer nesta superfície.
    await expect(leitura).not.toContainText(/185|trombóli|elegív/i);
  });

  test("navegar para outra superfície e voltar não apaga os fatos", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-opcao-hipoxia-sim").click();

    await page.getByTestId("avc-aba-G").click();
    await page.getByTestId("avc-aba-A").click();

    // ⚠️ E-20 pelo outro lado: navegar não registra, e também não desfaz.
    await expect(page.getByTestId("avc-leitura-oxigenio")).toContainText(/94/);
  });

  test("a Superfície A fala espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-A").click();
    await expect(page.getByTestId("avc-campo-glicemia")).toContainText(/Glucemia/);
    await expect(page.getByTestId("avc-leitura-hipoglicemia"))
      .toContainText(/desconocida no es normal/i);
  });
});
