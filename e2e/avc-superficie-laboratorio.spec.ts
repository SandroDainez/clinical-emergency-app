import { expect, test, type Page } from "@playwright/test";

import { IDS_ANALITOS, TODOS_OS_CAMPOS_L } from "../avc/conteudo/laboratorio";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o Laboratório se comporte na tela como **painel de coletas** —
 * que uma coleta exista antes do resultado, que duas coletas coexistam sem se
 * misturar, que a tela ⛔ **nunca** chame de "mais recente" o que ⛔ não sabe datar,
 * que a entrada numérica aceite decimal com vírgula, e que **plaqueta 0** seja
 * registrável.
 *
 * ⚠️ As provas de ordem, unidade e pendência vivem em
 * `scripts/prova-avc-laboratorio.cjs`. Aqui mede-se o que só a tela mostra.
 */
async function abrirLab(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-laboratorio").click();
  await expect(page.getByTestId("avc-superficie-laboratorio-conteudo")).toBeVisible();
}

const criarColeta = async (page: Page) => page.getByTestId("avc-nova-coleta").click();

test.describe("AVC · Laboratório", () => {
  test("nasce vazio, e ⛔ nada espera por ele", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);

    await expect(page.getByTestId("avc-laboratorio-vazio"))
      .toContainText(/Nada no atendimento espera por isto/i);
    await expect(page.getByTestId("avc-nova-coleta")).toBeVisible();
    // ⛔ E ⛔ nenhuma pendência nasce de ⛔ não haver coleta.
    await expect(page.getByTestId("avc-pendencia-coleta_hora_coleta_1")).toHaveCount(0);
  });

  /**
   * ⚠️ **PD-22 aplicado à coleta**: ela existe antes do resultado.
   */
  test("a coleta existe antes do resultado, e diz o que ⛔ não sabe", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    await expect(page.getByTestId("avc-coleta-coleta_1")).toBeVisible();
    // ⚠️ Sem procedência e sem horário, a linha DIZ isso — ⛔ não fica em branco.
    await expect(page.getByTestId("avc-coleta-identidade-coleta_1"))
      .toContainText(/procedência não informada · horário não informado/i);

    await page.getByTestId("avc-opcao-coleta_procedencia-Serviço externo").click();
    await page.getByTestId("avc-hora-desconhecido-coleta_hora").click();
    // ⚠️ E "desconhecido" ⛔ não se confunde com "⛔ não informado" (E-37).
    await expect(page.getByTestId("avc-coleta-identidade-coleta_1"))
      .toContainText(/Serviço externo · horário desconhecido/i);
  });

  /**
   * ⚠️⚠️ **O CASO-SENTINELA NA TELA.** INR 1,4 numa coleta externa **sem
   * horário**, INR 1,1 numa coleta local **com horário** — e a tela ⛔ não elege.
   */
  test("dois INR sem ordem: os dois aparecem, e ⛔ nenhum é o mais recente", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);

    await criarColeta(page);
    await page.getByTestId("avc-opcao-coleta_procedencia-Serviço externo").click();
    await page.getByTestId("avc-hora-desconhecido-coleta_hora").click();
    await page.getByTestId("avc-numerico-inr").fill("1,4");
    await page.getByTestId("avc-numerico-inr").blur();

    await criarColeta(page);
    // ⚠️ A coleta anterior recolhe, e a nova nasce aberta.
    await page.getByTestId("avc-numerico-inr").fill("1,1");
    await page.getByTestId("avc-numerico-inr").blur();

    await expect(page.getByTestId("avc-leitura-curto-inr"))
      .toContainText(/sem ordem estabelecida/i);
    const conteudo = page.getByTestId("avc-superficie-laboratorio-conteudo");
    await expect(conteudo).not.toContainText(/mais recente/i);

    // ⚠️ E os dois valores continuam legíveis, cada um na sua coleta.
    await page.getByTestId("avc-coleta-abrir-coleta_1").click();
    await expect(page.getByTestId("avc-valor-inr").first()).toContainText("1,4");
  });

  /**
   * ⚠️⚠️ **DECIMAL COM VÍRGULA** — `1,4` precisa ficar `1,4`.
   */
  test("a entrada numérica aceita decimal, e devolve vírgula", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const inr = page.getByTestId("avc-numerico-inr");
    await expect(inr).toHaveAttribute("placeholder", /não informado/i);
    await inr.fill("1,4");
    await inr.blur();
    // ⚠️ Respondido, o campo vira LEITURA — ver o contrato de correção abaixo.
    await expect(page.getByTestId("avc-valor-inr")).toContainText("1,4");

    // ⚠️ O passo ajusta em 0,1, e ⛔ não em 1 — medido dentro da correção.
    await page.getByTestId("avc-corrigir-inr").click();
    await page.getByTestId("avc-numerico-mais-inr").click();
    await expect(page.getByTestId("avc-valor-inr")).toContainText("1,5");
    await page.getByTestId("avc-corrigir-inr").click();
    await page.getByTestId("avc-numerico-menos-inr").click();
    await expect(page.getByTestId("avc-valor-inr")).toContainText("1,4");
  });

  /**
   * ⚠️⚠️ **ZERO É NÚMERO** — plaqueta 0 é resultado que laboratório reporta.
   */
  test("plaquetas aceita zero, e zero ⛔ não é ausência", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const plaquetas = page.getByTestId("avc-numerico-plaquetas");
    await expect(plaquetas).toHaveValue("");
    await page.getByTestId("avc-numerico-zero-plaquetas").click();
    // ⚠️ Zero é RESPOSTA: o campo vira leitura, mostrando 0 — e ⛔ não vazio.
    await expect(page.getByTestId("avc-valor-plaquetas")).toContainText("0");

    // ⛔ INR ⛔ não oferece a porta do zero: zero ⛔ não é valor da grandeza.
    await expect(page.getByTestId("avc-numerico-zero-inr")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ O DEFEITO ACHADO NA REVISÃO VISUAL DE 2026-08-30: digitar **80** em
   * plaquetas mostrava **0**, porque o valor digitado estava sendo preso à grade
   * do passo (`1000`). O componente **apagava um resultado verdadeiro**.
   */
  test("o valor digitado ⛔ não é movido para o múltiplo mais próximo", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const plaquetas = page.getByTestId("avc-numerico-plaquetas");
    await plaquetas.fill("80");
    await plaquetas.blur();
    await expect(page.getByTestId("avc-valor-plaquetas")).toContainText("80");

    await page.getByTestId("avc-corrigir-plaquetas").click();
    await page.getByTestId("avc-numerico-plaquetas").fill("87432");
    await page.getByTestId("avc-confirmar-plaquetas").click();
    await expect(page.getByTestId("avc-valor-plaquetas")).toContainText("87432");
  });

  /**
   * ⚠️⚠️ ACHADO NA REVISÃO VISUAL DE 2026-08-30: a coleta anterior recolhia e o
   * cabeçalho ficava **idêntico** ao de uma coleta aberta. Os valores dela
   * sumiam sem ⛔ nenhum sinal de que dava para trazê-los de volta.
   */
  test("a coleta recolhida DIZ que está recolhida, e volta a abrir", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const inr1 = page.getByTestId("avc-numerico-inr");
    await inr1.fill("1,4");
    await inr1.blur();
    await expect(page.getByTestId("avc-coleta-cabecalho-coleta_1-estado")).toContainText(/aberta/i);

    await criarColeta(page);
    // ⚠️ Recolhida: o VALOR sai da tela — então o cabeçalho precisa dizer isso.
    await expect(page.getByTestId("avc-coleta-cabecalho-coleta_1-estado")).toContainText(/recolhida/i);
    await expect(page.getByTestId("avc-valor-inr")).toHaveCount(0);
    // ⚠️ E a identidade da coleta ⛔ nunca some — ela é o que distingue as duas.
    await expect(page.getByTestId("avc-coleta-identidade-coleta_1")).toBeVisible();

    await page.getByTestId("avc-coleta-abrir-coleta_1").click();
    await expect(page.getByTestId("avc-coleta-cabecalho-coleta_1-estado")).toContainText(/aberta/i);
    await expect(page.getByTestId("avc-valor-inr").first()).toContainText("1,4");
  });

  /**
   * ⚠️⚠️ ACHADO NA MESMA REVISÃO: os Alertas traziam quatro linhas e
   * ⛔ **nenhuma dizia de qual exame falava** — três delas sobre exames que
   * ninguém informou.
   */
  test("o alerta diz de qual exame fala, e ⛔ não fala do que ninguém informou", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const inr = page.getByTestId("avc-numerico-inr");
    await inr.fill("1,4");
    await inr.blur();

    await expect(page.getByTestId("avc-leitura-curto-inr")).toContainText(/INR —/);
    await expect(page.getByTestId("avc-leitura-aptt")).toHaveCount(0);
    await expect(page.getByTestId("avc-leitura-tp")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ O CASO-SENTINELA 3 PELO CAMINHO REAL. As provas de trilha vivem em
   * `scripts/prova-avc-laboratorio.cjs`; aqui mede-se ⛔ só o que a tela garante:
   * corrigir a unidade ⛔ **não** mexe no valor e ⛔ **não** abre coleta nova.
   */
  test("corrigir a unidade ⛔ não altera o valor ⛔ nem cria coleta", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const plaquetas = page.getByTestId("avc-numerico-plaquetas");
    await plaquetas.fill("80");
    await plaquetas.blur();
    await page.getByTestId("avc-opcao-plaquetas_unidade-mil/mm³ (×10³/µL)").click();

    /**
     * ⚠️⚠️ A UNIDADE DECLARADA ⛔ NÃO ACEITA TROCA DIRETA: o botão é nomeado
     * **Corrigir unidade**, porque ⛔ não se corrige um "resultado" aqui.
     */
    await expect(page.getByTestId("avc-valor-plaquetas_unidade"))
      .toContainText(/mil\/mm³/);
    await expect(page.getByTestId("avc-corrigir-plaquetas_unidade"))
      .toContainText(/Corrigir unidade/i);

    await page.getByTestId("avc-corrigir-plaquetas_unidade").click();
    await page.getByTestId("avc-opcao-plaquetas_unidade-/mm³").click();

    await expect(page.getByTestId("avc-valor-plaquetas_unidade")).toContainText("/mm³");
    await expect(page.getByTestId("avc-valor-plaquetas")).toContainText("80");
    await expect(page.getByTestId("avc-coleta-coleta_2")).toHaveCount(0);
    await expect(page.getByTestId("avc-coleta-identidade-coleta_1")).toBeVisible();
  });

  /**
   * ⚠️⚠️ O CONTRATO DE CORREÇÃO NA TELA (autor, 2026-08-30):
   *
   * > *"redigitar um analito já informado na mesma coleta ⛔ não pode ter
   * > semântica implícita. O gesto precisa ser explícito."*
   */
  test("preenchido, o analito ⛔ não aceita escrita direta — e oferece as DUAS saídas",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await abrirLab(page);
      await criarColeta(page);

      // ⚠️ Vazio: entrada direta, como sempre.
      await expect(page.getByTestId("avc-numerico-inr")).toBeVisible();
      await page.getByTestId("avc-numerico-inr").fill("1,4");
      await page.getByTestId("avc-numerico-inr").blur();

      // ⚠️⚠️ Preenchido: a entrada SAI da tela, e os dois gestos aparecem.
      await expect(page.getByTestId("avc-numerico-inr")).toHaveCount(0);
      await expect(page.getByTestId("avc-valor-inr")).toContainText("1,4");
      await expect(page.getByTestId("avc-corrigir-inr")).toContainText(/Corrigir resultado/i);
      /**
       * ⚠️ **Nova coleta AQUI**, no ponto onde a ambiguidade nasce — e ⛔ não ⛔ só no
       * fim do painel. ⛔ Sem ela, quem quis medir de novo é empurrado a
       * "corrigir" o que ⛔ não era correção.
       */
      await expect(page.getByTestId("avc-nova-medida-inr")).toContainText(/Nova coleta/i);
    });

  test("cancelar a correção ⛔ NÃO grava nada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);
    await page.getByTestId("avc-numerico-inr").fill("1,4");
    await page.getByTestId("avc-numerico-inr").blur();

    await page.getByTestId("avc-corrigir-inr").click();
    await page.getByTestId("avc-numerico-inr").fill("9,9");
    /**
     * ⚠️⚠️ Desiste ANTES de confirmar. ⚠️ Em correção o `blur` ⛔ não grava — foi
     * este teste que achou o contrário, e ele é a razão de `Confirmar` existir.
     */
    await page.getByTestId("avc-cancelar-correcao-inr").click();

    await expect(page.getByTestId("avc-valor-inr")).toContainText("1,4");
    await expect(page.getByTestId("avc-valor-inr")).not.toContainText("9,9");
  });

  test("`Nova coleta` a partir do campo abre coleta, e ⛔ não corrige", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);
    await page.getByTestId("avc-numerico-inr").fill("1,4");
    await page.getByTestId("avc-numerico-inr").blur();

    await page.getByTestId("avc-nova-medida-inr").click();
    await expect(page.getByTestId("avc-coleta-coleta_2")).toBeVisible();
    // ⚠️ E a coleta 1 guarda o seu valor, intocado.
    await page.getByTestId("avc-coleta-abrir-coleta_1").click();
    await expect(page.getByTestId("avc-valor-inr").first()).toContainText("1,4");
  });

  test("⛔ nenhum limite técnico aparece como faixa clínica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirLab(page);
    await criarColeta(page);

    const conteudo = page.getByTestId("avc-superficie-laboratorio-conteudo");
    await expect(conteudo).not.toContainText(/valor máximo/i);
    await expect(conteudo).not.toContainText(/mínimo permitido/i);
    // ⛔ E ⛔ nenhum corte da fonte aparece aqui: eles são interpretação de D.
    await expect(conteudo).not.toContainText("1,7");
    await expect(conteudo).not.toContainText("100.000");
    // ⛔ E ⛔ nenhum identificador interno vaza.
    for (const campo of TODOS_OS_CAMPOS_L.filter((c) => c.id.includes("_"))) {
      await expect(conteudo).not.toContainText(campo.id);
    }
  });

  test("o painel inteiro aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-laboratorio").click();
    await page.getByTestId("avc-nova-coleta").click();

    const conteudo = page.getByTestId("avc-superficie-laboratorio-conteudo");
    await expect(conteudo).toContainText(/Procedencia de la toma/i);
    await expect(conteudo).toContainText(/Horario de la toma/i);
    await expect(conteudo).toContainText(/TP \(segundos\)/i);
    expect(IDS_ANALITOS.length).toBe(4);
  });
});
