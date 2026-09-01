import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície G CHEGUE À TELA na largura de celular como a
 * proposta aprovada — a diferença entre recomendação graduada e Table 7 sem
 * grau, os três estados da monitorização, a lacuna pós-EVT, e o bloco
 * operacional ⛔ sem efeito ⛔ nenhum sobre a Superfície F.
 *
 * NÃO PROMETE: que a ordem interna esteja certa (isso é
 * `prova-avc-superficie-g`, que executa as funções puras). Aqui se mede o que
 * o médico VÊ ⛔ e o que acontece quando ele toca.
 *
 * ⚠️ A largura é a do `playwright.config` — Pixel 7, o tamanho real de uso.
 */
async function abrirG(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-destino").click();
  await expect(page.getByTestId("avc-superficie-g-conteudo")).toBeVisible();
}

/** ⚠️ Registrar a trombólise em **F** — é lá que a ação mora. */
async function registrarTrombolise(page: Page, comHorario: boolean) {
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
  if (comHorario) {
    await page.getByTestId("avc-hora-ivt_inicio").click();
    /**
     * ⚠️ Confirmar ⛔ sem tocar em hora/minuto ⛔ não é permitido — é a regra que
     * impede "agora" de virar default silencioso. Recuo um minuto e confirmo.
     */
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();
  }
  await page.getByTestId("avc-aba-destino").click();
}

test.describe("AVC · Destino", () => {
  /**
   * ⚠️⚠️ A DECISÃO CENTRAL, NA TELA: a ausência de grau é ESCRITA.
   */
  test("a recomendação traz COR/LOE e a regra da tabela DIZ que não tem",
    async ({ page }) => {
      await abrirG(page);
      await expect(page.getByTestId("avc-g-grau-unidade_de_avc")).toContainText("COR 1");
      await expect(page.getByTestId("avc-g-grau-unidade_de_avc")).toContainText("LOE B-R");

      const regra = page.getByTestId("avc-g-op-internacao_para_monitorizacao");
      await expect(regra).toContainText(/a fonte não atribui COR\/LOE/i);
      /** ⛔ ⛔ Nenhum grau fabricado para a tabela. */
      await expect(regra).not.toContainText(/COR\s*[123]/);
    });

  /** ⚠️⚠️ O "OU" da fonte — exigir UTI pediria recurso mais escasso. */
  test("o \"OU\" da Table 7 chega à tela", async ({ page }) => {
    await abrirG(page);
    await expect(page.getByTestId("avc-g-op-internacao_para_monitorizacao"))
      .toContainText(/terapia intensiva OU em unidade de AVC/i);
  });

  /**
   * ⚠️⚠️ A MONITORIZAÇÃO ⛔ NÃO É CONDUTA GERAL DO AVC.
   */
  test("⛔ sem trombólise registrada, ⛔ NÃO há bloco de monitorização",
    async ({ page }) => {
      await abrirG(page);
      await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
      await expect(page.getByTestId("avc-g-deterioracao")).toHaveCount(0);
    });

  /** ⚠️⚠️ ESTADO 1 · fase calculável. */
  test("com início registrado, a fase atual aparece destacada", async ({ page }) => {
    await abrirG(page);
    await registrarTrombolise(page, true);
    await expect(page.getByTestId("avc-g-fase-atual")).toContainText(/15 min/);
    /** ⚠️ As três fases visíveis, ⛔ e ⛔ só uma ativa. */
    await expect(page.getByTestId("avc-g-fase-0-ativa")).toBeVisible();
    await expect(page.getByTestId("avc-g-fase-2")).toBeVisible();
    await expect(page.getByTestId("avc-g-fase-8")).toBeVisible();
  });

  /**
   * ⚠️⚠️ ESTADO 2 · ⛔ SEM HORÁRIO — o bloco ⛔ NÃO SOME.
   *
   * ⛔ Este é o erro que a separação pertinência × fase existe para impedir: o
   * app **desistir** de mostrar o contexto pós-trombólise por faltar a hora.
   */
  test("⛔ sem horário, o contexto é AFIRMADO e a fase ⛔ não é inventada",
    async ({ page }) => {
      await abrirG(page);
      await registrarTrombolise(page, false);
      await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
      await expect(page.getByTestId("avc-g-fase-sem-horario"))
        .toContainText(/Trombólise iniciada/i);
      await expect(page.getByTestId("avc-g-fase-sem-horario"))
        .toContainText(/falta o horário de início/i);
      /** ⚠️⚠️ As três fases seguem visíveis, ⛔ e ⛔ NENHUMA ativa. */
      await expect(page.getByTestId("avc-g-fase-0")).toBeVisible();
      await expect(page.getByTestId("avc-g-fase-0-ativa")).toHaveCount(0);
      await expect(page.getByTestId("avc-g-fase-atual")).toHaveCount(0);
    });

  /** ⚠️⚠️ E tocar a pendência leva ao campo, em Reperfusão. */
  test("tocar a pendência abre a superfície onde o horário se registra",
    async ({ page }) => {
      await abrirG(page);
      await registrarTrombolise(page, false);
      await page.getByTestId("avc-g-fase-sem-horario").click();
      await expect(page.getByTestId("avc-superficie-f-conteudo")).toBeVisible();
    });

  /**
   * ⚠️⚠️ GATILHOS EM LISTA — ⛔ e a consequência SEPARADA.
   */
  test("os sinais de deterioração são lista, com a conduta abaixo",
    async ({ page }) => {
      await abrirG(page);
      await registrarTrombolise(page, true);
      const bloco = page.getByTestId("avc-g-deterioracao");
      for (const s of ["Cefaleia intensa", "Hipertensão aguda", "Náusea", "Vômito",
        "Piora do exame neurológico"]) {
        await expect(bloco).toContainText(s);
      }
      await expect(page.getByTestId("avc-g-condutas"))
        .toContainText(/Interromper a infusão de alteplase, se estiver em curso/i);
      await expect(page.getByTestId("avc-g-condutas"))
        .toContainText(/tomografia de crânio de emergência/i);
    });

  /** ⚠️⚠️ A LACUNA PÓS-EVT — compacta, ⛔ e ⛔ sem número ⛔ nenhum. */
  test("a lacuna pós-trombectomia é dita, ⛔ e ⛔ não preenchida", async ({ page }) => {
    await abrirG(page);
    const lacuna = page.getByTestId("avc-g-lacuna-pos-evt");
    await expect(lacuna).toContainText(/não publica tabela de monitorização pós-trombectomia/i);
    /** ⛔ ⛔ Nenhum horário, ⛔ nenhuma frequência: copiar por analogia é E-31. */
    await expect(lacuna).not.toContainText(/\d+\s*(min|h\b)/i);
  });

  /**
   * ⚠️⚠️ A FRONTEIRA — ⛔ NENHUMA resposta operacional chega à Superfície F.
   */
  test("responder o contexto operacional ⛔ NÃO muda ⛔ NADA em Reperfusão",
    async ({ page }) => {
      await abrirG(page);
      await page.getByTestId("avc-aba-reperfusao").click();
      const antes = await page.getByTestId("avc-f-raia-evt").innerText();

      await page.getByTestId("avc-aba-destino").click();
      await page.getByTestId("avc-g-opcao-centro_evt_disponivel-nao").click();
      await page.getByTestId("avc-g-opcao-transferencia_possivel-nao").click();
      await page.getByTestId("avc-g-opcao-perfusao_automatizada_disponivel-nao").click();

      await page.getByTestId("avc-aba-reperfusao").click();
      const depois = await page.getByTestId("avc-f-raia-evt").innerText();
      expect(depois, "geografia ⛔ não pode virar critério clínico").toBe(antes);
    });

  /** ⚠️⚠️ ⛔ E as recomendações travadas por F-31 seguem ⛔ não avaliáveis. */
  test("⛔ ausência de centro EVT ⛔ NÃO destrava F-31", async ({ page }) => {
    await abrirG(page);
    await page.getByTestId("avc-g-opcao-centro_evt_disponivel-nao").click();
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-f-divida-ivt_lvo_sem_evt"))
      .toContainText(/Critério não definido pela fonte/i);
  });

  /** ⚠️ A nota nomeia o que a ausência É — indisponibilidade operacional. */
  test("negar o recurso mostra que isso é indisponibilidade OPERACIONAL",
    async ({ page }) => {
      await abrirG(page);
      await page.getByTestId("avc-g-opcao-centro_evt_disponivel-nao").click();
      await expect(page.getByTestId("avc-g-nota-centro_evt_disponivel"))
        .toContainText(/Não torna o paciente inelegível/i);
    });

  /** ⚠️⚠️ LARGURA DE CELULAR: ⛔ NENHUMA ROLAGEM LATERAL. */
  test("⛔ a tela ⛔ NÃO rola para o lado na largura do aparelho", async ({ page }) => {
    await abrirG(page);
    await registrarTrombolise(page, true);
    const estouro = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(estouro).toBeLessThanOrEqual(1);
  });
});
