import { expect, test } from "@playwright/test";

import { abrirModulo } from "./helpers";

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
     * ⚠️ Pelos `testID` dos botões de concluir — ⛔ um por eixo, ⛔ na ordem em
     * que o cockpit os desenha. ⛔ Ler a letra pelo texto casava com qualquer
     * `A` solto da tela.
     */
    const ordem = await page
      .locator('[data-testid^="avc-concluir-"]')
      .evaluateAll((els) =>
        els.map((e) => e.getAttribute("data-testid")!.replace("avc-concluir-", ""))
      );
    expect(ordem, "⛔ o ABCDE clássico, na ordem").toEqual([
      "via_aerea", "respiracao", "pressao", "glicemia", "exposicao",
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
    /** ⚠️ Hipoxemia declarada — o eixo B acende. */
    await page.getByTestId("avc-opcao-hipoxia-sim").click();
    const b = page.getByTestId("avc-ameaca-respiracao");
    await expect(b).toContainText("O₂ suplementar");

    await page.getByTestId("avc-concluir-respiracao").click();

    /**
     * ⚠️⚠️ ⛔ *"⛔ Nunca usar 'concluído' como sinônimo de 'normal'"* — ⛔ o
     * achado continua na tela **depois** de concluir, ⛔ e o ✓ ⛔ não aparece.
     */
    await expect(b, "⛔ concluir a avaliação ⛔ não trata o paciente")
      .toContainText("O₂ suplementar");
    await expect(b).toContainText("Avaliação concluída");
    await expect(b, "⛔ favorável seria afirmar o que ⛔ ninguém afirmou").not.toContainText("✓");
  });

  test("o próximo eixo é DESTACADO, ⛔ e ⛔ não aberto sozinho", async ({ page }) => {
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
    await expect(page.getByTestId("avc-proximo-eixo")).toContainText("Via aérea");

    await page.getByTestId("avc-concluir-via_aerea").click();
    await expect(
      page.getByTestId("avc-proximo-eixo"),
      "⛔ concluído A, o destaque anda para B"
    ).toContainText("Respiração");
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
    await page.getByTestId("avc-concluir-pressao").click();
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
    await page.getByTestId("avc-num-caixa-glicemia").fill("48");
    const d = page.getByTestId("avc-ameaca-glicemia");
    await expect(d).toContainText("48");

    await page.getByTestId("avc-concluir-glicemia").click();
    await page.getByTestId("avc-concluir-glicemia").click();

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
    await page.getByTestId("avc-num-caixa-temperatura").fill("39");
    const e = page.getByTestId("avc-ameaca-exposicao");
    await expect(e).toContainText("39");
    /** ⚠️ ⛔ Sem corte transcrito, ⛔ o app ⛔ não julga (**E-31**). */
    await expect(e, "⛔ 39 °C ⛔ sem fonte ⛔ não pode acender").toContainText("Medido");
  });
});
