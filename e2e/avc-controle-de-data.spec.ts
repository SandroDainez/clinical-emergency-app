import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o controle de tempo consiga representar **datas além de hoje** —
 * hoje, ontem, três dias atrás e data escolhida —, que o **desconhecido**
 * continue sendo resposta, que **"Agora"** continue existindo como ação nomeada,
 * e que ⛔ **nenhum valor clínico nasça selecionado**.
 *
 * ── O DEFEITO QUE ELE FECHA (D-118) ────────────────────────────────────────
 *
 * O controle tinha hora ±1, minuto ±1 e "Agora", e ⛔ nenhuma dimensão de dia.
 * Um paciente **visto bem anteontem à noite** ⛔ não era representável — no
 * relógio que decide janela terapêutica. E a última dose de DOAC, que a fonte
 * conta em **48 horas**, exigiria ~40 toques em "hora −".
 */
async function abrirSeletor(page: Page, campo: string, aba: string) {
  await page.goto("/modulos/avc");
  await page.getByTestId(`avc-aba-${aba}`).click();
  await page.getByTestId(`avc-hora-${campo}`).click();
  await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();
}

/** ⚠️ O valor exibido, como o médico o lê. */
const valor = (page: Page) => page.getByTestId("avc-seletor-hora-valor");

test.describe("AVC · controle de data e hora", () => {
  /**
   * ⚠️⚠️ A REGRA QUE ⛔ NÃO PODE CAIR: posição ⛔ não é valor. O seletor abre
   * posicionado em algum lugar, e esse lugar ⛔ não se lê como escolha.
   */
  test("⛔ nenhum valor nasce selecionado, e mexer no DIA ⛔ não habilita confirmar", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirSeletor(page, "hora_ultima_vez_bem", "estabilizacao");

    await expect(valor(page)).toContainText(/não informado/i);
    await expect(page.getByTestId("avc-seletor-hora-confirmar"))
      .toHaveAttribute("aria-disabled", "true");

    // ⚠️ "Ontem" muda o DIA — e a hora continua onde o controle estava.
    await page.getByTestId("avc-seletor-data-ontem").click();
    await expect(valor(page)).toContainText(/não informado/i);
    await expect(page.getByTestId("avc-seletor-hora-confirmar"))
      .toHaveAttribute("aria-disabled", "true");

    // ⚠️ Só mexer na HORA é escolher o valor.
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    /**
     * ⚠️ HABILITADO = **ausência** do atributo, e ⛔ não `"false"`: o
     * `react-native-web` ⛔ não emite `aria-disabled` quando o botão está ativo.
     */
    await expect(page.getByTestId("avc-seletor-hora-confirmar"))
      .not.toHaveAttribute("aria-disabled", "true");
  });

  test("HOJE, ONTEM e TRÊS DIAS ATRÁS são representáveis", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirSeletor(page, "hora_ultima_vez_bem", "estabilizacao");

    // ── hoje ────────────────────────────────────────────────────────────
    await page.getByTestId("avc-seletor-data-hoje").click();
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    // ⚠️ Hoje ⛔ não mostra data: `horaDeExibicao` só a acrescenta quando o dia muda.
    await expect(valor(page)).toHaveText(/^\d{2}:\d{2}$/);

    // ── ontem ───────────────────────────────────────────────────────────
    await page.getByTestId("avc-seletor-data-ontem").click();
    await expect(valor(page)).toHaveText(/^\d{2}\/\d{2} \d{2}:\d{2}$/);
    const ontem = await valor(page).innerText();

    // ── três dias atrás, pelo passo de dia ──────────────────────────────
    await page.getByTestId("avc-seletor-data-escolher").click();
    await expect(page.getByTestId("avc-seletor-data-passo-numero")).toBeVisible();
    await page.getByTestId("avc-seletor-data-passo-menos").click();
    await page.getByTestId("avc-seletor-data-passo-menos").click();
    const tresDias = await valor(page).innerText();
    expect(tresDias, "três dias atrás ⛔ não pode ser o mesmo dia que ontem").not.toBe(ontem);
    await expect(valor(page)).toHaveText(/^\d{2}\/\d{2} \d{2}:\d{2}$/);

    // ⚠️ E o registro guarda o que foi escolhido.
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem")).toContainText(tresDias);
  });

  /**
   * ⚠️ O teto continua sendo `agora`: um marco no futuro produziria decorrido
   * negativo, e decorrido negativo vira janela impossível.
   */
  test("⛔ o futuro continua inalcançável, mesmo pelo passo de dia", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirSeletor(page, "hora_ultima_vez_bem", "estabilizacao");

    await page.getByTestId("avc-seletor-data-hoje").click();
    // ⚠️ Hoje já é o teto: o `+` do dia ⛔ não pode avançar.
    await page.getByTestId("avc-seletor-data-escolher").click();
    await expect(page.getByTestId("avc-seletor-data-passo-mais"))
      .toHaveAttribute("aria-disabled", "true");
  });

  test("AGORA continua sendo ação nomeada, e escolhe o valor", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirSeletor(page, "hora_ultima_vez_bem", "estabilizacao");

    await page.getByTestId("avc-seletor-hora-agora").click();
    await expect(valor(page)).toHaveText(/^\d{2}:\d{2}$/);
    /**
     * ⚠️ HABILITADO = **ausência** do atributo, e ⛔ não `"false"`: o
     * `react-native-web` ⛔ não emite `aria-disabled` quando o botão está ativo.
     */
    await expect(page.getByTestId("avc-seletor-hora-confirmar"))
      .not.toHaveAttribute("aria-disabled", "true");
  });

  /**
   * ⚠️⚠️ **E-52 na tela**: desconhecido é resposta, e ⛔ não um horário fabricado.
   */
  test("DESCONHECIDO continua sendo resposta, no DOAC", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-paciente").click();

    await page.getByTestId("avc-hora-desconhecido-doac_ultima_dose").click();
    await expect(page.getByTestId("avc-hora-desconhecido-doac_ultima_dose"))
      .toHaveAttribute("aria-checked", "true");
  });

  /**
   * ⚠️ E o controle novo serve o DOAC, que é o campo cuja fonte conta **48 horas**.
   */
  test("o DOAC alcança anteontem sem dezenas de toques", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirSeletor(page, "doac_ultima_dose", "paciente");

    await page.getByTestId("avc-seletor-data-ontem").click();
    await page.getByTestId("avc-seletor-data-escolher").click();
    await page.getByTestId("avc-seletor-data-passo-menos").click();
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();

    await expect(page.getByTestId("avc-hora-valor-doac_ultima_dose"))
      .toHaveText(/\d{2}\/\d{2} \d{2}:\d{2}/);
  });

  test("o controle de data aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();
    await page.getByTestId("avc-hora-hora_ultima_vez_bem").click();

    const data = page.getByTestId("avc-seletor-data");
    await expect(data).toContainText("Hoy");
    await expect(data).toContainText("Ayer");
    await expect(data).toContainText("Elegir fecha");
  });
});
