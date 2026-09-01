import { expect, test, type Page } from "@playwright/test";

import { GRUPOS_P, TODOS_OS_CAMPOS_P } from "../avc/conteudo/paciente";
import { SUPERFICIES } from "../avc/conteudo/superficies";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a superfície **Paciente** se comporte na tela como **painel** e
 * ⛔ nunca como porta — que com ela vazia todas as superfícies abram, que o campo
 * emprestado apareça nas duas telas escrevendo **no mesmo fato**, e que o texto
 * livre exista só na identificação.
 *
 * ⚠️ As provas de propriedade, insumo e temporalidade vivem em
 * `scripts/prova-avc-paciente.cjs`. Aqui mede-se o que só a tela mostra.
 */
async function abrirPaciente(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-paciente").click();
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
}

test.describe("AVC · Paciente — painel de contexto", () => {
  test("os nove blocos abrem, e a tela declara que ⛔ não é porta", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirPaciente(page);

    for (const grupo of GRUPOS_P) {
      await expect(page.getByTestId(`avc-grupo-${grupo.id}`)).toBeVisible();
    }
    /**
     * ⚠️ Os três de antecedente nascem FECHADOS: o cabeçalho existe, o campo ⛔ não.
     * Abertos, eles somavam quase metade dos 4.630 px da superfície.
     */
    for (const id of ["antecedentes-intracranianos", "antecedentes-sistemicos", "procedimentos"]) {
      await expect(page.getByTestId(`avc-bloco-abrir-${id}`)).toHaveAttribute("aria-expanded", "false");
    }
    await expect(page.getByTestId("avc-campo-antecedentes_intracranianos")).toHaveCount(0);
    await page.getByTestId("avc-bloco-abrir-antecedentes-intracranianos").click();
    await expect(page.getByTestId("avc-campo-antecedentes_intracranianos")).toBeVisible();
    await expect(page.getByTestId("avc-paciente-nao-e-porta"))
      .toContainText(/Nada aqui é obrigatório para seguir/i);
  });

  /**
   * ⚠️⚠️ A CONDIÇÃO QUE O AUTOR IMPÔS: *"se chegar um paciente instável, o médico
   * precisa conseguir tocar direto em estabilização, imagem ou qualquer
   * superfície necessária. O painel Paciente pode continuar incompleto."*
   */
  test("com Paciente VAZIO, as nove superfícies abrem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    expect(SUPERFICIES.length).toBe(9);
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
      await expect(page.getByTestId(`avc-superficie-${sup.id}`), `${sup.id} ⛔ não abriu`)
        .toBeVisible();
    }
    // ⛔ E ⛔ nenhuma pendência nasceu de o painel estar vazio.
    await expect(page.getByTestId("avc-pendencia-identificacao")).toHaveCount(0);
    await expect(page.getByTestId("avc-pendencia-idade")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ **A REGRA CENTRAL NA TELA:** o mesmo fato, dois lugares de preenchimento,
   * **uma** trilha. É o que o autor formulou como *"propriedade do fato ⛔ não é
   * local de preenchimento"*.
   */
  test("o peso preenchido em A aparece em Paciente — mesmo fato", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();

    // ⚠️ Na A ele aparece EMPRESTADO, com a etiqueta de onde mora.
    await expect(page.getByTestId("avc-emprestado-peso")).toContainText(/Do painel Paciente/i);
    await page.getByTestId("avc-num-caixa-peso").fill("78");

    await page.getByTestId("avc-aba-paciente").click();
    // ⛔ E lá ele ⛔ não é emprestado: é a casa dele.
    await expect(page.getByTestId("avc-emprestado-peso")).toHaveCount(0);
    await expect(page.getByTestId("avc-campo-peso")).not.toContainText(/não informado/i);
  });

  /**
   * ⚠️ O mRS mudou de casa e ⛔ não mudou de experiência — decisão do autor.
   */
  test("o mRS prévio continua preenchível na B, com os descritores", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-neurologico").click();

    await expect(page.getByTestId("avc-emprestado-mrs_previo")).toBeVisible();
    await page.getByTestId("avc-abrir-mrs_previo").click();
    await expect(page.getByTestId("avc-campo-mrs_previo")).toContainText(/incapacidade moderada/i);
    await page.getByTestId("avc-opcao-mrs_previo-3 · incapacidade moderada").click();

    // ⚠️ E o mesmo fato aparece na casa dele.
    await page.getByTestId("avc-aba-paciente").click();
    await expect(page.getByTestId("avc-campo-mrs_previo")).toContainText(/incapacidade moderada/i);
  });

  /**
   * ⚠️⚠️ **E-52 NA TELA** — o exemplo normativo do autor: anticoagulante conhecido
   * com horário desconhecido, os dois registrados ao mesmo tempo.
   */
  test("DOAC conhecido convive com horário desconhecido", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirPaciente(page);

    await page.getByTestId("avc-item-anticoagulante_em_uso-Anticoagulante oral direto (DOAC)").click();
    await page.getByTestId("avc-hora-desconhecido-doac_ultima_dose").click();

    await expect(page.getByTestId("avc-campo-anticoagulante_em_uso")).toContainText(/DOAC/);
    await expect(page.getByTestId("avc-hora-desconhecido-doac_ultima_dose"))
      .toHaveAttribute("aria-checked", "true");
  });

  /**
   * ⚠️ Texto livre existe para **um** campo, e ⛔ não é clínico.
   */
  test("⛔ só a identificação é texto livre, e ela ⛔ não afeta ⛔ nada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirPaciente(page);

    const textos = TODOS_OS_CAMPOS_P.filter((c) => c.tipo === "texto");
    expect(textos.map((c) => c.id)).toEqual(["identificacao"]);

    await page.getByTestId("avc-texto-identificacao").fill("Leito 12");
    await expect(page.getByTestId("avc-campo-identificacao")).toContainText(/Opcional/i);
    // ⛔ E ⛔ nenhuma pendência ⛔ nem alerta nasce disso.
    await expect(page.getByTestId("avc-pendencia-identificacao")).toHaveCount(0);
  });

  test("⛔ nenhum campo é obrigatório, e a tela ⛔ não cobra preenchimento", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirPaciente(page);

    const conteudo = page.getByTestId("avc-superficie-paciente-conteudo");
    /**
     * ⚠️⚠️ ⛔ AQUI ⛔ NÃO SE VARRE A PALAVRA "obrigatório" — e a razão é que **esta**
     * tela é a única do módulo que a usa, na frase que diz o **oposto**:
     * *"Nada aqui é obrigatório para seguir."* Varrer o termo reprovaria
     * justamente a garantia. É a mesma armadilha da hipodensidade em C.
     *
     * ⚠️ O que se mede é o **efeito**: ⛔ nenhuma contagem de preenchimento,
     * ⛔ nenhuma barra de progresso, ⛔ nenhum "faltam N".
     */
    await expect(conteudo).not.toContainText(/faltam \d/i);
    await expect(conteudo).not.toContainText(/\d+ *\/ *\d+/);
    /**
     * ⚠️⚠️ ⛔ SÓ OS IDS COM `_`, e a razão é uma falha desta própria trava: `peso`
     * é id **e** palavra do vocabulário clínico — ela aparece legitimamente em
     * *"Como o peso foi obtido"*. Varrer o id cru acusava a tela por escrever
     * português.
     *
     * ⚠️ O que ⛔ não pode vazar é o **identificador interno**, e ele se reconhece
     * pelo sublinhado: `alergia_contraste`, `doac_ultima_dose`, `mrs_previo`.
     */
    for (const campo of TODOS_OS_CAMPOS_P.filter((c) => c.id.includes("_"))) {
      await expect(conteudo).not.toContainText(campo.id);
    }
  });

  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-paciente").click();

    const conteudo = page.getByTestId("avc-superficie-paciente-conteudo");
    /**
     * ⚠️ REGEX INSENSÍVEL A CAIXA: o cabeçalho de bloco é maiúsculo por CSS, e
     * `innerText` aplica `text-transform`. Comparar a string exata mediria a
     * folha de estilo, ⛔ não a tradução.
     */
    await expect(conteudo).toContainText(/Medicaciones en uso/i);
    await expect(conteudo).toContainText(/Antecedentes intracraneales/i);
    await expect(conteudo).toContainText("Warfarina u otro antagonista de la vitamina K");
    await expect(conteudo).toContainText(/Nada aquí es obligatorio/i);
  });
});
