import { expect, test } from "@playwright/test";

import { SUPERFICIES } from "../avc/conteudo/superficies";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o módulo AVC exista, abra pela sua rota própria, e seja
 *   NAVEGÁVEL entre as sete superfícies em qualquer ordem — sem árvore linear.
 *   Mede também o resumo persistente, as pendências acionáveis e o espanhol.
 *
 * ⛔ NÃO mede medicina: o esqueleto não tem regra clínica, e um teste que
 * afirmasse conduta aqui estaria medindo o que não existe.
 *
 * ⚠️ A trava mais importante deste arquivo é a ÚLTIMA: navegar entre superfícies
 * não pode registrar ação clínica nenhuma (E-20). É a que protege o módulo do
 * defeito que a spec nomeia.
 */
test.describe("Módulo AVC — esqueleto navegável", () => {
  test("abre pela rota própria, com cabeçalho e saída", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await expect(page.getByText("AVC isquêmico agudo").first()).toBeVisible();
    // I7: a tela desenha o próprio cabeçalho, e ele tem volta.
    await expect(page.getByRole("button", { name: "Voltar" })).toBeVisible();
  });

  test("as nove superfícies abrem em qualquer ordem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ Ordem deliberadamente EMBARALHADA: se houvesse árvore linear, abrir o
    // Destino antes do Neurológico falharia. É isso que a trava mede (§7.2, E-11).
    //
    // ⚠️ Endereçado por SLUG, ⛔ não por letra: em 2026-08-28 E e F trocaram de
    // letra, e um teste ancorado em "E" continuaria verde medindo outra
    // superfície — verde falso é pior que vermelho.
    /**
     * ⚠️ **Os dois painéis entram embaralhados junto com as sete clínicas** — e
     * `paciente` vem DEPOIS de quatro superfícies de propósito: é a prova de
     * que ele ⛔ não é passo 1 (**PD-29**).
     */
    const ordem = [
      "destino", "neurologico", "reperfusao", "estabilizacao",
      "paciente", "seguranca", "imagem", "laboratorio", "correcoes",
    ] as const;
    for (const id of ordem) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
    }

    expect(SUPERFICIES.length).toBe(9);
  });

  /**
   * ⚠️ A ORDEM VISUAL APROVADA PELO AUTOR (2026-08-28), medida na TELA.
   *
   * `prova-avc-superficies` já congela a ordem no CONTEÚDO; esta trava mede a
   * outra ponta — que a tela desenhe nessa ordem e que a letra que ela pinta
   * seja a da posição. As duas juntas fecham o caminho: conteúdo certo
   * renderizado fora de ordem passaria na prova e reprovaria aqui.
   *
   * ⚠️ E-11 continua valendo: isto é ordem de LEITURA. O teste acima já provou,
   * abrindo as sete embaralhadas, que ⛔ não existe pré-requisito de navegação.
   */
  test("as abas aparecem na ordem aprovada, com a letra da posição", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    /**
     * ⚠️ Os painéis vêm primeiro na LEITURA e ⛔ não têm letra — a letra carrega
     * fluxo (A → G), e os dois são contexto transversal (**PD-29**).
     */
    const esperado = [
      ["·", "paciente", "Paciente"],
      ["·", "laboratorio", "Laboratório"],
      ["A", "estabilizacao", "Entrada e estabilização"],
      ["B", "neurologico", "Neurológico"],
      ["C", "imagem", "Imagem"],
      ["D", "seguranca", "Segurança e elegibilidade"],
      ["E", "correcoes", "Correções"],
      ["F", "reperfusao", "Reperfusão"],
      ["G", "destino", "Destino"],
    ];

    const abas = await page.locator('[data-testid^="avc-aba-"]').allInnerTexts();
    expect(abas.length).toBe(9);
    for (let i = 0; i < esperado.length; i += 1) {
      const [letra, , titulo] = esperado[i];
      expect(abas[i].replace(/\s+/g, " "), `posição ${i + 1}`).toContain(letra);
      expect(abas[i].replace(/\s+/g, " "), `posição ${i + 1}`).toContain(titulo);
    }

    // ⚠️ E o cabeçalho da superfície aberta usa a MESMA letra — Correções é E.
    await page.getByTestId("avc-aba-correcoes").click();
    await expect(page.getByTestId("avc-superficie-correcoes")).toContainText("E · Correções");
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-superficie-reperfusao")).toContainText("F · Reperfusão");
  });

  test("o resumo persistente acompanha todas as superfícies", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
      // ⚠️ O resumo é persistente porque o RELÓGIO é o único valor que muda
      // sozinho: escondê-lo numa superfície faria o médico trabalhar noutra sem
      // vê-lo correr (§7.8).
      await expect(page.getByTestId("avc-resumo")).toBeVisible();
    }
  });

  test("pendência é acionável de qualquer superfície e leva à sua dona", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // Abre uma superfície que NÃO é a dona da pendência...
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-superficie-destino")).toBeVisible();

    /**
     * ...e a pendência continua visível e acionável dali (E-07).
     *
     * ⚠️ USA `deficit_focal`, e ⛔ não mais `tc_realizada`: desde 2026-08-29 só
     * é EXIBIDA a pendência cujo campo existe. A da tomografia aponta para a
     * Superfície de Imagem, ⛔ não construída — e uma pendência que leva a "em
     * construção" é muro, ⛔ não tarefa (E-26, I-7).
     */
    const pendencia = page.getByTestId("avc-pendencia-deficit_focal");
    await expect(pendencia).toBeVisible();
    await pendencia.click();

    // A dona de `deficit_focal` é o Neurológico — e ela tem porta de saída lá.
    await expect(page.getByTestId("avc-superficie-neurologico")).toBeVisible();
    await expect(page.getByTestId("avc-campo-deficit_focal")).toBeVisible();

    // ⛔ E a pendência sem porta ⛔ não aparece em lugar nenhum.
    await expect(page.getByTestId("avc-pendencia-tc_realizada")).toHaveCount(0);
  });

  test("o módulo fala espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await expect(page.getByText("ACV isquémico agudo").first()).toBeVisible();
    await page.getByTestId("avc-aba-imagem").click();
    await expect(page.getByText("Imagen").first()).toBeVisible();
    // ⛔ Nenhum texto clínico visível pode ficar em português com ES ativo.
    await expect(page.getByText("Superfície em construção")).toHaveCount(0);
  });

  test("navegar entre superfícies não registra ação clínica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ E-20: percorrer TODAS as superfícies não pode mudar nada — as pendências
    // continuam exatamente as mesmas, porque navegação não é fato clínico.
    const antes = await page.getByTestId("avc-pendencias").innerText();
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
    }
    const depois = await page.getByTestId("avc-pendencias").innerText();
    expect(depois).toBe(antes);
  });
});
