import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a pergunta da **última dose do anticoagulante** ⛔ só exista
 *   quando há **anticoagulante**. ⛔ Perguntar a hora da última dose a quem
 *   ⛔ não usa anticoagulante ⛔ não é ⛔ só ruído: ⛔ é convite a registrar um
 *   horário que ⛔ não corresponde a ⛔ nada — ⛔ e `doac_ultima_dose` é lido
 *   por `derivacoes-d.ts`, na segurança da trombólise.
 *
 * NÃO PROMETE: que ⛔ nenhuma outra pergunta dependente esteja certa — ⛔ esta
 *   trava mede **uma**, ⛔ a que o autor viu.
 *
 * UNIVERSO: a tela Paciente servida do `dist`.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO (inspeção clínica, 2026-09-07) ──────────────────────
 *
 * > *"marquei que ⛔ não faz uso de anticoagulante ⛔ e embaixo pede hora da
 * >  última dose"*
 *
 * ⛔ ⛔ A infraestrutura ⛔ já existia (`apareceQuando` + `campoAparece`) ⛔ e
 * era usada nas Superfícies **A** ⛔ e **B**. ⚠️ ⛔ A tela **Paciente** ⛔ nunca
 * a chamou, ⛔ e o campo ⛔ nunca declarou condição.
 */

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
}

const ITEM = (op: string) => `avc-item-anticoagulante_em_uso-${op}`;
const ULTIMA_DOSE = "avc-campo-doac_ultima_dose";

test.describe("AVC · Paciente — a pergunta que depende da resposta", () => {
  test('⛔ "Nenhum" anticoagulante ⛔ NÃO pede a hora da última dose', async ({ page }) => {
    await abrir(page);

    /**
     * ⚠️ ⛔ Antes de responder, ⛔ ela também ⛔ não faz sentido: ⛔ ⛔ ninguém
     * disse que há anticoagulante.
     */
    await expect(page.getByTestId(ULTIMA_DOSE)).toHaveCount(0);

    /** ⚠️ O gesto do autor: marcar que ⛔ não faz uso. */
    await page.getByTestId(ITEM("Nenhum")).click();
    await expect(page.getByTestId(ULTIMA_DOSE)).toHaveCount(0);
  });

  test('⛔ e um anticoagulante REAL faz a pergunta aparecer', async ({ page }) => {
    await abrir(page);

    await page.getByTestId(ITEM("Anticoagulante oral direto (DOAC)")).click();
    await expect(page.getByTestId(ULTIMA_DOSE)).toBeVisible();
    await expect(page.getByTestId(ULTIMA_DOSE))
      .toContainText(/última dose do anticoagulante/i);

    /**
     * ⚠️⚠️ ⛔ E VOLTAR ATRÁS A ESCONDE — ⛔ marcar *"Nenhum"* é **exclusivo**,
     * ⛔ e desmarca o DOAC.
     */
    await page.getByTestId(ITEM("Nenhum")).click();
    await expect(page.getByTestId(ULTIMA_DOSE)).toHaveCount(0);
  });

  /**
   * ⚠️⚠️⚠️ ⛔ *"Não sei"* ⛔ **⛔ NÃO** É *"Nenhum"* — ⛔ e ⛔ aqui a diferença
   * decide se a pergunta existe.
   *
   * ⛔ ⛔ Quem responde *"⛔ não sei se usa anticoagulante"* ⛔ **⛔ não** disse
   * que ⛔ não usa. ⚠️ ⛔ Mas ⛔ também ⛔ não há anticoagulante **nomeado** de
   * que perguntar a última dose — ⛔ e a fonte conta as 48 h de uma exposição
   * **conhecida**. ⛔ A pergunta reaparece ⛔ assim que alguém nomear o agente.
   */
  test('⛔ "Não sei" ⛔ também ⛔ não faz a pergunta nascer', async ({ page }) => {
    await abrir(page);
    await page.getByTestId(ITEM("Não sei")).click();
    await expect(page.getByTestId(ULTIMA_DOSE)).toHaveCount(0);
    /** ⚠️ ⛔ E a resposta ⛔ não some: ⛔ ela fica registrada. */
    await expect(page.getByTestId(ITEM("Não sei"))).toHaveAttribute("aria-checked", "true");
  });
});
