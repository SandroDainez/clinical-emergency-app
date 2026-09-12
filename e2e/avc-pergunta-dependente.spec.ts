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

/**
 * ── ⚠️⚠️ ⛔ A MESMA CLASSE, ⛔ OUTRA TELA — 2026-09-12 ─────────────────────
 *
 * ⛔ Relato do autor, com captura da Superfície **Segurança**: *"O SANGRAMENTO
 * FOI TRATADO, O RISCO FOI REDUZIDO (QUE SANGRAMENTO? ⛔ NÃO FOI DITO
 * SANGRAMENTO ALGUM, ISSO EU JÁ HAVIA PEDIDO CORREÇÃO ⛔ E ⛔ NÃO FOI FEITA)"*.
 *
 * ⚠️⚠️ ⛔ E A CORREÇÃO TINHA SIDO FEITA **⛔ PELA METADE**: o campo declara
 * `apareceQuando` desde 2026-09-09, ⛔ e a tela que o desenha ⛔ nunca chamou
 * `campoAparece`. ⛔ Perguntar *"o sangramento foi tratado?"* ⛔ a quem ⛔ não
 * registrou sangramento ⛔ nenhum ⛔ é **afirmar** o sangramento na pergunta.
 */
const SANGRAMENTO = "avc-campo-sangramento_tratado";
const GI_21D = "Sangramento gastrointestinal ou geniturinário nos últimos 21 dias";

test.describe("AVC · Segurança — a pergunta que pressupunha o sangramento", () => {
  test("⛔ sem antecedente de sangramento, a pergunta ⛔ NÃO existe", async ({ page }) => {
    await abrir(page);
    await page.getByTestId("avc-aba-seguranca").click();
    await expect(page.getByTestId("avc-superficie-d-conteudo")).toBeVisible();

    /** ⚠️ ⛔ O juízo de segurança está lá — ⛔ o que ⛔ não pode estar é a pressuposição. */
    await expect(page.getByTestId("avc-campo-motivo_para_suspeitar_alteracao_coagulacao")).toBeVisible();
    await expect(page.getByTestId(SANGRAMENTO)).toHaveCount(0);
  });

  /**
   * ⚠️ O antecedente mora na Superfície **Neurológico**, no bloco recolhido
   * *"Procedimentos e sangramentos recentes"* — ⛔ é lá que o médico o marca,
   * ⛔ e a Segurança ⛔ só **lê**.
   */
  async function marcarSangramentoGI(page: Page) {
    await page.getByTestId("avc-aba-neurologico").click();
    await page.getByTestId("avc-bloco-abrir-procedimentos").click();
    await page.getByTestId(`avc-item-procedimentos_recentes-${GI_21D}`).click();
  }

  test("⛔ e o sangramento REGISTRADO faz a pergunta aparecer", async ({ page }) => {
    await abrir(page);
    await marcarSangramentoGI(page);

    await page.getByTestId("avc-aba-seguranca").click();
    await expect(page.getByTestId(SANGRAMENTO)).toBeVisible();
    await expect(page.getByTestId(SANGRAMENTO)).toContainText(/sangramento foi tratado/i);

    /** ⚠️⚠️ ⛔ E desmarcar o antecedente a esconde de novo. */
    await marcarSangramentoGI(page);
    await page.getByTestId("avc-aba-seguranca").click();
    await expect(page.getByTestId(SANGRAMENTO)).toHaveCount(0);
  });
});
