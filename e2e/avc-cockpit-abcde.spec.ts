import { expect, test } from "@playwright/test";

import { abrirModulo, abrirEixosDaEstabilizacao } from "./helpers";

/**
 * O COCKPIT ABCDE — ⚠️ **progresso ⛔ NÃO é estado clínico**, na tela.
 *
 * ⚠️ `scripts/prova-avc-cockpit.cjs` mede a **regra** sobre fatos puros.
 * ⛔ Aqui mede-se o que ⛔ só a tela mostra: o destaque do próximo eixo, a
 * navegação livre ⛔ e a convivência entre *"avaliado"* ⛔ e *"alterado"*.
 *
 * NÃO PROMETE: ⛔ nenhum corte clínico — ⛔ isso é das provas de superfície.
 */
test.describe("AVC · cockpit ABCDE", () => {
  test("os cinco eixos aparecem, na ordem", async ({ page }) => {
    await abrirModulo(page, "avc");
  /**
   * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
   * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
   * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
   * ⛔ não.
   */
  await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
     * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
     * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
     * ⛔ não.
     */
    await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);
    /**
     * ⚠️ Pelos `testID` dos **tiles** — ⛔ um por eixo, ⛔ na ordem em que o
     * cockpit os desenha. ⛔ Ler a letra pelo texto casava com qualquer `A`
     * solto da tela.
     *
     * ⚠️⚠️ ⛔ ERA PELOS BOTÕES DE CONCLUIR, ⛔ e ⛔ eles saíram do cockpit em
     * 2026-09-08: ⛔ *"o botão `Concluir` fica dentro do próprio eixo"*.
     * ⛔ A garantia — **a ordem do ABCDE** — ⛔ não mudou; ⛔ mudou quem a
     * carrega.
     */
    const ordem = await page
      .locator('[data-testid^="avc-ameaca-"]:not([data-testid*="progresso"])')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-testid")!.replace("avc-ameaca-", ""))
      );
    /** ⚠️ ⛔ QUATRO desde 2026-09-12: ⛔ o `E · Exposição` saiu (decisão do autor). */
    expect(ordem, "⛔ os quatro eixos, na ordem").toEqual([
      "via_aerea", "respiracao", "pressao", "glicemia",
    ]);
  });

  test("concluir um eixo ⛔ NÃO o torna favorável", async ({ page }) => {
    await abrirModulo(page, "avc");
  /**
   * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
   * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
   * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
   * ⛔ não.
   */
  await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
     * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
     * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
     * ⛔ não.
     */
    await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);
    /** ⚠️ Hipoxemia declarada — o eixo B acende. */
    await page.getByTestId("avc-opcao-hipoxia-sim").click();
    const b = page.getByTestId("avc-ameaca-respiracao");
    await expect(b).toContainText("O₂ suplementar");

    await page.getByTestId("avc-eixo-concluir-respiracao").click();

    /**
     * ⚠️⚠️ ⛔ *"⛔ Nunca usar 'concluído' como sinônimo de 'normal'"* — ⛔ o
     * achado continua na tela **depois** de concluir, ⛔ e o ✓ ⛔ não aparece.
     */
    await expect(b, "⛔ concluir a avaliação ⛔ não trata o paciente")
      .toContainText("O₂ suplementar");
    await expect(b).toContainText("Avaliação concluída");
    await expect(b, "⛔ favorável seria afirmar o que ⛔ ninguém afirmou").not.toContainText("✓");
  });

  /**
   * ── ⚠️⚠️⚠️ ⛔ INVERTIDO — 2026-09-08, ⛔ e ⛔ não apagado ──────────────────
   *
   * ⛔ ⛔ Ele prometia *"o próximo eixo é **destacado**, ⛔ e ⛔ não aberto
   * sozinho"*, ⛔ e media isso no atalho `avc-proximo-eixo`.
   *
   * ⚠️ Decisão do autor, na inspeção de 2026-09-08: *"concluir um eixo fecha o
   * atual ⛔ e abre automaticamente o próximo ⛔ não concluído"*, ⛔ e
   * *"remover o botão/linha `Próximo`, porque vira redundante"*.
   *
   * ⚠️⚠️ ⛔ Então a garantia ⛔ **⛔ virou o contrário do que dizia** — ⛔ e é
   * ⛔ isso que se mede ⛔ agora: ⛔ concluir A **abre B**. ⛔ Quem cobre o
   * acordeão inteiro é `avc-eixos-acordeao`.
   */
  test("⛔ concluir um eixo abre o **próximo**, ⛔ e o atalho antigo saiu",
    async ({ page }) => {
      await abrirModulo(page, "avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);

      await expect(page.getByTestId("avc-proximo-eixo")).toHaveCount(0);
      await page.getByTestId("avc-eixo-concluir-via-aerea").click();

      await expect(
        page.getByTestId("avc-grupo-respiracao").locator('[data-testid^="avc-campo-"]').first(),
        "⛔ concluído A, B abre"
      ).toBeVisible();
    });

  test("⛔ NENHUMA ordem é imposta: C conclui ⛔ sem A ⛔ nem B", async ({ page }) => {
    /**
     * ⚠️ *"se chegar um paciente com choque evidente, deve poder acessar C
     * imediatamente"* — autor, 2026-09-07.
     */
    await abrirModulo(page, "avc");
  /**
   * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
   * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
   * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
   * ⛔ não.
   */
  await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
     * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
     * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
     * ⛔ não.
     */
    await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-eixo-concluir-pressao").click();
    await expect(page.getByTestId("avc-ameaca-pressao")).toContainText("Avaliação concluída");
    await expect(
      page.getByTestId("avc-ameaca-via_aerea"),
      "⛔ A continua por avaliar, ⛔ e ⛔ isso ⛔ não impediu ⛔ nada"
    ).not.toContainText("Avaliação concluída");
  });

  test("reabrir preserva o dado registrado", async ({ page }) => {
    await abrirModulo(page, "avc");
  /**
   * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
   * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
   * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
   * ⛔ não.
   */
  await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
     * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
     * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
     * ⛔ não.
     */
    await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-num-caixa-glicemia").fill("48");
    const d = page.getByTestId("avc-ameaca-glicemia");
    await expect(d).toContainText("48");

    /**
     * ⚠️⚠️ ⛔ CONCLUIR **FECHA O EIXO** desde 2026-09-08 — ⛔ então o botão de
     * reabrir ⛔ não está mais na tela logo depois. ⚠️ ⛔ O caminho passou a ser
     * o do médico: ⛔ abrir o eixo pelo tile, ⛔ e ⛔ então reabrir a avaliação.
     *
     * ⛔ A garantia ⛔ não mudou: **reabrir ⛔ não apaga medida**.
     */
    await page.getByTestId("avc-eixo-concluir-neurologico-inicial").click();
    await page.getByTestId("avc-ameaca-glicemia").click();
    await page.getByTestId("avc-eixo-concluir-neurologico-inicial").click();

    await expect(d, "⛔ reabrir é gesto de tela — ⛔ ele ⛔ não apaga medida")
      .toContainText("48");
    await expect(d).not.toContainText("Avaliação concluída");
  });

  test("completar E ⛔ não cria ameaça", async ({ page }) => {
    await abrirModulo(page, "avc");
  /**
   * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
   * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
   * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
   * ⛔ não.
   */
  await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e o cockpit
     * ABCDE é o trabalho da **Estabilização**. ⛔ Este teste mede o cockpit,
     * ⛔ então ⛔ ele navega até ⛔ ele: ⛔ a abertura mudou, ⛔ e a garantia
     * ⛔ não.
     */
    await page.getByTestId("avc-aba-estabilizacao").click();
    /**
     * ⚠️⚠️ ⛔ O `Concluir` mora **dentro do eixo** desde 2026-09-08 — ⛔ e um
     * eixo recolhido ⛔ não tem botão. ⚠️ ⛔ Abrir é pré-condição ⛔ aqui, ⛔ e
     * ⛔ não a garantia: ⛔ quem mede o acordeão é `avc-eixos-acordeao`.
     */
    await abrirEixosDaEstabilizacao(page);
    /**
     * ⚠️⚠️ ⛔ O eixo `E · Exposição` SAIU em 2026-09-12 (decisão do autor):
     * ⛔ ele media temperatura, ⛔ que ⛔ nenhuma fonte transcrita do AVC
     * qualifica, ⛔ e ⛔ por isso ⛔ nunca acendia. ⚠️ A trava passa a cobrar a
     * ausência — ⛔ do eixo ⛔ e do campo.
     */
    await expect(page.getByTestId("avc-num-caixa-temperatura")).toHaveCount(0);
    await expect(page.getByTestId("avc-ameaca-exposicao")).toHaveCount(0);
  });
});
