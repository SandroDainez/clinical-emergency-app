import { expect, test, type Page } from "@playwright/test";

import {
  GRUPOS_C,
  RESULTADO_TC,
  TODOS_OS_CAMPOS_C,
} from "../avc/conteudo/superficie-c";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície C se COMPORTE na tela como ponto de decisão da
 * imagem — que as quatro respostas da tomografia sejam tocáveis, que o destino
 * apareça como **um** cartão e ⛔ nunca dois, que a saída declare o módulo
 * inexistente em vez de virar beco, que o laudo pendente **mantenha** a
 * pendência à vista, e que ⛔ nada na tela cobre exames adicionais nem
 * cronometre a tomografia.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-c.cjs`.
 * Aqui mede-se o que só a tela mostra.
 */
async function abrirC(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-imagem").click();
  await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();
}

/** ⚠️ O valor gravado é o RÓTULO nestes campos — vocabulário próprio. */
const OPCAO = (campo: string, valor: string) => `avc-opcao-${campo}-${valor}`;

test.describe("AVC · Superfície C — Imagem", () => {
  test("a superfície abre com os três blocos, e a imagem avançada nasce fechada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    for (const grupo of GRUPOS_C) {
      await expect(page.getByTestId(`avc-grupo-${grupo.id}`)).toBeVisible();
    }
    // ⚠️ Recolhido: o cabeçalho existe, o campo ⛔ não.
    await expect(page.getByTestId("avc-bloco-abrir-imagem-avancada"))
      .toHaveAttribute("aria-expanded", "false");
    await expect(page.getByTestId("avc-campo-imagem_avancada")).toHaveCount(0);
    await page.getByTestId("avc-bloco-abrir-imagem-avancada").click();
    await expect(page.getByTestId("avc-campo-imagem_avancada")).toBeVisible();
  });

  /**
   * ⚠️⚠️ **E-23 NA TELA.** Antes de qualquer toque, ⛔ nenhuma opção pode estar
   * marcada, e a leitura ⛔ não pode afirmar ausência de hemorragia.
   */
  test("sem tomografia, a tela ⛔ não afirma ausência de hemorragia", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await expect(page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.semHemorragia)))
      .toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/ainda não registrado/i);
    // ⛔ E ⛔ nenhum destino armado.
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ **PD-22 NA TELA** — o estado que o autor mandou ⛔ não fechar.
   */
  test("laudo pendente é resposta registrada e MANTÉM a pendência à vista", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await expect(page.getByTestId("avc-pendencia-tc_resultado")).toBeVisible();
    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.aguardando)).click();

    // ⚠️ A resposta ficou marcada — ela É um fato.
    await expect(page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.aguardando)))
      .toHaveAttribute("aria-checked", "true");
    // ⛔ E a pendência continua lá, com a instrução do estado novo.
    await expect(page.getByTestId("avc-pendencia-tc_resultado"))
      .toContainText(/quando o laudo estiver disponível/i);

    // ⚠️ Só o resultado conclusivo a fecha.
    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.semHemorragia)).click();
    await expect(page.getByTestId("avc-pendencia-tc_resultado")).toHaveCount(0);
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/excluída pela tomografia/i);
  });

  /**
   * ⚠️⚠️ **E-09 NA TELA** — destino para módulo inexistente ⛔ não é beco.
   */
  test("hemorragia produz destino nomeado, que declara o módulo inexistente", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.hemorragia)).click();

    const destino = page.getByTestId("avc-destino-imagem");
    await expect(destino).toBeVisible();
    await expect(destino).toContainText(/AVC hemorrágico/i);
    await expect(page.getByTestId("avc-destino-modulo-inexistente"))
      .toContainText(/ainda não existe/i);
    // ⚠️ E o que acontece MESMO ASSIM — sem isto, o destino seria um vazio educado.
    await expect(destino).toContainText(/o atendimento continua/i);
  });

  /**
   * ⚠️⚠️ **PD-21 NA TELA, com a revisão do autor:** os dois fatos coexistem, o
   * médico vê **uma** saída — e ela é a **hemorrágica**. Uma suspeita ⛔ não
   * sobrepõe um achado de imagem confirmado.
   */
  test("com hemorragia E suspeita de HSA, a saída é hemorrágica, e a suspeita fica junto", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.hemorragia)).click();
    await page.getByTestId(OPCAO("suspeita_hsa", "sim")).click();

    // ⚠️ UM cartão de destino, e ele é o da hemorragia identificada.
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(1);
    await expect(page.getByTestId("avc-destino-hemorragia_intracraniana")).toBeVisible();
    await expect(page.getByTestId("avc-destino-suspeita_hsa")).toHaveCount(0);

    // ⛔ E a suspeita ⛔ NÃO some — vem associada, ⛔ não como destino rival.
    await expect(page.getByTestId("avc-destino-associado-suspeita_hsa"))
      .toContainText(/Há também suspeita de hemorragia subaracnóidea/i);
    // ⚠️ E as duas leituras continuam vivas, cada uma dizendo o seu.
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/Hemorragia intracraniana/i);
    await expect(page.getByTestId("avc-leitura-curto-suspeita_hsa"))
      .toContainText(/Suspeita de hemorragia subaracnóidea registrada/i);
  });

  /**
   * ⚠️ E o outro lado da mesma regra: **sem** hemorragia identificada, a suspeita
   * de HSA arma a saída específica dela.
   */
  test("suspeita de HSA sem hemorragia identificada arma a saída de HSA", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.semHemorragia)).click();
    await page.getByTestId(OPCAO("suspeita_hsa", "sim")).click();

    await expect(page.getByTestId("avc-destino-suspeita_hsa")).toBeVisible();
    await expect(page.getByTestId("avc-destino-associado-suspeita_hsa")).toHaveCount(0);
  });

  /**
   * ⚠️ "Incerto" ⛔ não arma saída e ⛔ não vira "Não": vira tarefa nomeada.
   */
  test("suspeita de HSA incerta abre pendência e ⛔ não arma a saída", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("suspeita_hsa", "nao_sei")).click();
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(0);
    await expect(page.getByTestId("avc-pendencia-suspeita_hsa")).toBeVisible();
    await expect(page.getByTestId("avc-leitura-curto-suspeita_hsa")).toContainText(/em aberto/i);
  });

  /**
   * ⚠️⚠️ **E-26 NA TELA** — a pendência que ⛔ não tem como ser resolvida ⛔ não pode
   * existir. Onde o serviço ⛔ não tem angiotomografia, cobrar angiotomografia é
   * ruído permanente.
   */
  test("a pendência vascular fecha tanto por exame feito quanto por indisponibilidade", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("suspeita_lvo", "sim")).click();
    await expect(page.getByTestId("avc-pendencia-imagem_vascular")).toBeVisible();

    await page.getByTestId(OPCAO("angio_realizada", "Não disponível neste serviço")).click();
    await expect(page.getByTestId("avc-pendencia-imagem_vascular")).toHaveCount(0);
    await expect(page.getByTestId("avc-leitura-curto-imagem_vascular"))
      .toContainText(/não disponível neste serviço/i);
  });

  /**
   * ⚠️⚠️ A ALERGIA A CONTRASTE — decisão do autor, com as três travas dele.
   */
  test("a alergia a contraste é registrada, escopada ao contraste, e ⛔ não cobra nada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("tc_resultado", RESULTADO_TC.semHemorragia)).click();
    await page.getByTestId(OPCAO("alergia_contraste", "sim")).click();

    await expect(page.getByTestId("avc-leitura-curto-alergia_contraste"))
      .toContainText(/Alergia importante a contraste/i);
    // ⛔ Nenhuma pendência nasce dela.
    await expect(page.getByTestId("avc-pendencia-alergia_contraste")).toHaveCount(0);
    // ⛔ E a exclusão de hemorragia ⛔ não muda: ela ⛔ não retém a trombólise.
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/excluída pela tomografia/i);
  });

  /**
   * ⚠️⚠️ **R2.5 / 🚫 #3 NA TELA:** ⛔ nenhum cronômetro, ⛔ nenhuma meta.
   */
  test("o horário da tomografia se registra, e ⛔ não vira meta nem contagem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/25 minutos/i);
    await expect(conteudo).not.toContainText(/atrasad/i);

    await page.getByTestId("avc-hora-hora_tc").click();
    await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();
  });

  /**
   * ⚠️⚠️ **R2.3 NA TELA:** a regra contra o atraso fica VISÍVEL, sem abrir nada —
   * e distingue a tomografia que exclui hemorragia de "exame adicional".
   */
  test("a nota contra o atraso está visível, com a distinção que o autor fixou", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const nota = page.getByTestId("avc-grupo-nota-endovascular");
    await expect(nota).toContainText(/Não atrase a trombólise por exames de imagem adicionais/i);
    await expect(nota).toContainText(/não é exame adicional/i);
  });

  /**
   * ⚠️ **E-49 na tela**: ⛔ nenhum campo é obrigatório, e ⛔ não há barra de
   * progresso, contagem de preenchimento ou "faltam N".
   */
  test("⛔ nenhum campo é obrigatório, e a tela ⛔ não cobra preenchimento", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/obrigatóri/i);
    await expect(conteudo).not.toContainText(/faltam \d/i);
    await expect(conteudo).not.toContainText(/\d+ *\/ *\d+/);
    // ⚠️ E ⛔ nenhum identificador interno vaza para a tela clínica.
    for (const campo of TODOS_OS_CAMPOS_C) {
      await expect(conteudo).not.toContainText(campo.id);
    }
  });

  /**
   * ⚠️ **E-12 / §7.17:** a superfície nasce internacionalizada — ⛔ não é
   * tradução acrescentada depois.
   */
  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-imagem").click();

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).toContainText("Tomografía sin contraste");
    await expect(conteudo).toContainText("Sospecha de hemorragia subaracnoidea");
    await expect(conteudo).toContainText(/No retrase la trombólisis/i);
    /**
     * ⚠️⚠️ A OPÇÃO, e ⛔ não só a prosa — foi aqui que "Incerto" apareceu em
     * português na tela espanhola, com `test:i18n` dizendo "SEM TRADUÇÃO: 0".
     * Uma palavra curta sem acento ⛔ não parece prosa para a varredura.
     */
    await expect(conteudo).toContainText("Incierto");
    await expect(conteudo).not.toContainText("Incerto");
  });
});
