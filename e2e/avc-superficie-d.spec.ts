import { expect, test, type Page } from "@playwright/test";

import { ITENS_DE_SEGURANCA, TODOS_OS_CAMPOS_D } from "../avc/conteudo/superficie-d";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície D se COMPORTE na tela como interpretação, e ⛔ nunca
 * como veredito — que ⛔ nada nela diga "pode" ⛔ ou "⛔ não pode" trombolisar, que
 * **cada item mostre o verbo da fonte**, que a advertência sobre a natureza da
 * tabela apareça **antes** de qualquer item, e que a janela de 48 h do DOAC
 * ⛔ **não** seja classificada ⛔ nem com horário em mãos.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-d.cjs`.
 */
async function abrirD(page: Page) {
  await page.goto("/modulos/avc");
  await irParaD(page);
}
/**
 * ⚠️⚠️ TROCA DE ABA, e ⛔ **não** `page.goto` — a sessão vive em memória, e uma
 * carga de documento apagaria o que acabou de ser marcado em Paciente. Foi
 * exatamente esse o defeito do primeiro e2e desta superfície.
 */
async function irParaD(page: Page) {
  await page.getByTestId("avc-aba-seguranca").click();
  await expect(page.getByTestId("avc-superficie-d-conteudo")).toBeVisible();
}
async function abrirPaciente(page: Page) {
  await page.getByTestId("avc-aba-paciente").click();
}
const ITEM = (campo: string, op: string) => `avc-item-${campo}-${op}`;

test.describe("AVC · Superfície D — Segurança", () => {
  test("abre declarando a NATUREZA da fonte, antes de qualquer item", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);

    const aviso = page.getByTestId("avc-d-natureza-da-fonte");
    await expect(aviso).toContainText(/não traz classe de recomendação/i);
    await expect(aviso).toContainText(/não sustentada por evidência clínica/i);
  });

  /**
   * ⚠️⚠️ A PROMESSA CENTRAL: ⛔ nenhum veredito agregado, em ⛔ nenhum estado da tela.
   */
  test("⛔ a tela ⛔ NUNCA diz se pode ou ⛔ não pode trombolisar", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    const conteudo = page.getByTestId("avc-superficie-d-conteudo");
    await expect(conteudo).not.toContainText(/elegív|elegib|pode trombolisar|não pode trombolisar|candidato a trombólise/i);

    // ⚠️ E ⛔ nem depois de marcar o item mais grave que existe.
    await abrirPaciente(page);
    await page.getByTestId("avc-bloco-abrir-antecedentes-sistemicos").click();
    await page.getByTestId(ITEM("antecedentes_cardio_sistemicos", "Endocardite infecciosa")).click();
    await irParaD(page);
    await expect(page.getByTestId("avc-d-item-Endocardite infecciosa")).toBeVisible();
    await expect(conteudo).not.toContainText(/elegív|elegib|pode trombolisar|não pode trombolisar/i);
  });

  /**
   * ⚠️⚠️ **E-45 NA TELA** — o verbo da fonte chega ao olho, em inglês, e dois
   * itens da mesma faixa mostram frases DIFERENTES.
   */
  test("cada item mostra o VERBO da fonte, e a gradação ⛔ não é achatada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    await abrirPaciente(page);
    await page.getByTestId("avc-bloco-abrir-antecedentes-intracranianos").click();
    await page.getByTestId(ITEM("antecedentes_intracranianos", "Neoplasia intracraniana intra-axial")).click();
    await page.getByTestId(ITEM("antecedentes_intracranianos", "Lesão medular aguda nos últimos 3 meses")).click();
    await irParaD(page);

    /**
     * ⚠️⚠️ A FORMULAÇÃO EM PORTUGUÊS VEM PRIMEIRO — em emergência o médico ⛔ não
     * deveria precisar traduzir a diretriz sob pressão.
     */
    await expect(page.getByTestId("avc-d-formulacao-Neoplasia intracraniana intra-axial"))
      .toContainText(/potencialmente danoso, e a fonte diz que não deve ser administrado/i);
    await expect(page.getByTestId("avc-d-formulacao-Lesão medular aguda nos últimos 3 meses"))
      .toContainText(/provavelmente contraindicado/i);
    /** ⚠️ E o verbatim continua visível, como autoridade. */
    await expect(page.getByTestId("avc-d-verbo-Neoplasia intracraniana intra-axial"))
      .toContainText("potentially harmful and should not be administered");
    await expect(page.getByTestId("avc-d-verbo-Lesão medular aguda nos últimos 3 meses"))
      .toContainText("likely contraindicated");
    /**
     * ⛔⛔ E A TRADUÇÃO ⛔ NÃO ACHATA: as duas frases em português são **diferentes**,
     * como os dois verbos são.
     */
    const pt1 = await page.getByTestId("avc-d-formulacao-Neoplasia intracraniana intra-axial").innerText();
    const pt2 = await page.getByTestId("avc-d-formulacao-Lesão medular aguda nos últimos 3 meses").innerText();
    expect(pt1).not.toBe(pt2);
  });

  /**
   * ⚠️⚠️ **E-06 NA TELA** — mesma família anatômica, blocos opostos.
   */
  test("intra-axial e extra-axial caem em blocos DIFERENTES", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    await abrirPaciente(page);
    await page.getByTestId("avc-bloco-abrir-antecedentes-intracranianos").click();
    await page.getByTestId(ITEM("antecedentes_intracranianos", "Neoplasia intracraniana intra-axial")).click();
    await page.getByTestId(ITEM("antecedentes_intracranianos", "Neoplasia intracraniana extra-axial")).click();
    await irParaD(page);

    await expect(page.getByTestId("avc-d-estado-contraindicacao_nao_corrigivel"))
      .toContainText(/intra-axial/i);
    await expect(page.getByTestId("avc-d-estado-baixa_preocupacao_declarada"))
      .toContainText(/extra-axial/i);
  });

  /**
   * ⚠️⚠️ **F-30 NA TELA** — ⛔ nem com horário em mãos a janela é classificada.
   */
  test("o DOAC ⛔ não classifica a janela de 48 horas, e DIZ isso", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    const leitura = page.getByTestId("avc-leitura-curto-doac");
    await expect(leitura).toContainText(/ainda não registrada/i);
    // ⛔ E ⛔ não afirma ausência de exposição.
    await expect(leitura).not.toContainText(/sem exposição|não usa/i);

    await abrirPaciente(page);
    await page.getByTestId("avc-hora-desconhecido-doac_ultima_dose").click();
    await irParaD(page);

    await expect(page.getByTestId("avc-leitura-curto-doac")).toContainText(/desconhecido/i);
    const conteudo = page.getByTestId("avc-superficie-d-conteudo");
    // ⛔ ⛔ NENHUMA contagem aparece.
    await expect(conteudo).not.toContainText(/há \d+ horas|menos de 48|48 h atrás/i);
    // ⚠️ E a pendência DECLARA o que ⛔ não resolve.
    await expect(page.getByTestId("avc-pendencia-doac_ultima_dose"))
      .toContainText(/não classifica a janela de 48 horas/i);
  });

  /**
   * ⚠️⚠️ **REC. 10 NA TELA** — a pendência do coagulograma nasce do juízo.
   */
  test("o coagulograma ⛔ só vira pendência quando há razão para suspeitar", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    await expect(page.getByTestId("avc-pendencia-coagulograma")).toHaveCount(0);

    await page.getByTestId("avc-opcao-motivo_para_suspeitar_alteracao_coagulacao-sim").click();
    await expect(page.getByTestId("avc-pendencia-coagulograma")).toBeVisible();
  });

  /**
   * ⚠️⚠️ §7.3 NA TELA — e o defeito que a revisão visual de 2026-08-30 achou: o
   * bloco declarava `recolhido` e a tela desenhava as sete consultas abertas,
   * empurrando o juízo de segurança para fora da primeira dobra.
   */
  test("as consultas nascem RECOLHIDAS, e o juízo de segurança ⛔ não", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);

    await expect(page.getByTestId("avc-bloco-abrir-consultas"))
      .toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("avc-campo-consultas_acionadas")).toHaveCount(0);
    // ⛔ E o juízo ⛔ NÃO recolhe: ele decide agora.
    await expect(page.getByTestId("avc-campo-incerteza_diagnostica")).toBeVisible();

    await page.getByTestId("avc-bloco-abrir-consultas").click();
    await expect(page.getByTestId("avc-campo-consultas_acionadas")).toBeVisible();
  });

  /**
   * ⚠️ **E-49 na tela**: ⛔ nenhum campo obrigatório, ⛔ nenhuma barra de progresso.
   */
  test("⛔ nenhum campo é obrigatório, e a tela ⛔ não cobra preenchimento", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirD(page);
    const conteudo = page.getByTestId("avc-superficie-d-conteudo");
    await expect(conteudo).not.toContainText(/obrigatóri/i);
    await expect(conteudo).not.toContainText(/faltam \d/i);
    for (const campo of TODOS_OS_CAMPOS_D) {
      await expect(conteudo).not.toContainText(campo.id);
    }
  });

  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-seguranca").click();
    const conteudo = page.getByTestId("avc-superficie-d-conteudo");
    await expect(conteudo).toContainText(/juicio de seguridad/i);
    /**
     * ⚠️ O nome da superfície ⛔ não tem "elegibilidade" — o contrato é esse, ⛔ e
     * ⛔ ele ⛔ não mudou.
     *
     * ⚠️⚠️ MUDOU O LUGAR: com o cockpit, a navegação passou a usar **nome curto**
     * de uma linha ("Seguridad"), ⛔ e o nome completo vive no cabeçalho da
     * superfície aberta. ⛔ Asserção no lugar errado ⛔ não prova a tradução —
     * prova onde o texto **estava**.
     */
    await expect(page.getByTestId("avc-aba-seguranca")).toContainText(/seguridad/i);
    await expect(page.getByTestId("avc-superficie-seguranca")).toContainText(/trombólisis/i);
    await expect(page.getByTestId("avc-superficie-seguranca")).not.toContainText(/elegibilidad/i);
    await expect(conteudo).toContainText("Incierto");
    await expect(conteudo).not.toContainText("Incerto");
  });

  test("o mapa de itens tem cobertura, e ⛔ nenhum verbo vazio", async () => {
    expect(ITENS_DE_SEGURANCA.length).toBeGreaterThanOrEqual(25);
    for (const i of ITENS_DE_SEGURANCA) expect(i.verbo.length).toBeGreaterThan(10);
  });
});
