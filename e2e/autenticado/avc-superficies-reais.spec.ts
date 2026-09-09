import { expect, test, type Page } from "@playwright/test";

import { baseUrlAutenticada } from "../conta-de-teste";
import { fixarIdioma } from "../helpers";

/**
 * ⚠️⚠️ VALIDAÇÃO AUTENTICADA EM PRODUÇÃO — ⛔ o que o `dist` ⛔ não alcança.
 *
 * ⛔ A suíte de 461 testes roda contra `build:web:teste`, ⛔ sem Supabase: a
 * guarda de `app/_layout.tsx` cai no ramo local ⛔ e ⛔ nunca resolve sessão,
 * perfil nem status. Ela prova a **tela**; ⛔ ela ⛔ não prova a **produção**.
 *
 * ⚠️ Aqui a guarda é a de verdade: sessão do Supabase, `loadCurrentAppUser`,
 * `status === 'ativo'`, prova local. ⛔ Se qualquer degrau desse caminho
 * quebrar num deploy, ⛔ é aqui que aparece — ⛔ e ⛔ não no `dist`.
 *
 * ⚠️⚠️ ⛔ NENHUM DADO CLÍNICO REAL ENTRA AQUI. Os valores abaixo são
 * declarados, sintéticos ⛔ e conferidos por `scripts/prova-conta-de-teste.cjs`.
 * ⛔ O módulo AVC ⛔ não tem campo de identificação de paciente ⛔ e ⛔ não abre
 * sessão clínica no banco (`lib/open-clinical-module.ts` só o faz para
 * `pcr-adulto`) — ⛔ então esta corrida ⛔ não escreve caso nenhum.
 */

/** ⚠️ Valores de fantasia, escolhidos por ⛔ não serem plausíveis como caso real. */
const DADOS_SINTETICOS = {
  nihssInformado: 0,
} as const;

/**
 * ⚠️ As sete fases com aba (`SEQUENCIA_OFICIAL`), com a raiz que cada uma
 * renderiza. ⛔ A lista é escrita, ⛔ e ⛔ não derivada da tela: se a tela
 * deixar de renderizar uma, ⛔ o teste tem que **falhar**, ⛔ e ⛔ não encolher.
 */
const FASES = [
  { id: "paciente", raiz: "avc-superficie-paciente-conteudo" },
  { id: "estabilizacao", raiz: "avc-superficie-a-conteudo" },
  { id: "neurologico", raiz: "avc-superficie-b-conteudo" },
  { id: "imagem", raiz: "avc-superficie-c-conteudo" },
  { id: "seguranca", raiz: "avc-superficie-d-conteudo" },
  { id: "reperfusao", raiz: "avc-superficie-f-conteudo" },
  { id: "destino", raiz: "avc-superficie-g-conteudo" },
] as const;

const PASTA_DAS_TELAS = "/tmp/playwright-clinical-emergency/telas-autenticadas";

async function abrirAvc(page: Page) {
  const base = baseUrlAutenticada();
  await fixarIdioma(page, "pt-BR");
  await page.goto(`${base}/modulos/avc`);
}

test.describe("AVC · produção autenticada", () => {
  /* ══ ⚠️⚠️⚠️ 1 · A GUARDA DEIXA PASSAR ═══════════════════════════════ */

  test("`/modulos/avc` abre autenticado ⛔ e ⛔ não é devolvido para a porta",
    async ({ page }) => {
      await abrirAvc(page);

      /**
       * ⚠️⚠️ ⛔ O REDIRECIONAMENTO É SILENCIOSO: sem sessão, a guarda manda para
       * `/` ⛔ e a tela de login aparece ⛔ sem erro nenhum. ⛔ Um teste que só
       * checasse « algo visível » passaria verde medindo o login.
       */
      await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
      expect(page.url()).toContain("/modulos/avc");
      await expect(page.getByTestId("entrada-email")).toHaveCount(0);
    });

  /* ══ ⚠️⚠️⚠️ 2 · AS SETE FASES RENDERIZAM ════════════════════════════ */

  test("as sete fases com aba abrem ⛔ e cada uma traz o seu conteúdo",
    async ({ page }) => {
      await abrirAvc(page);

      for (const fase of FASES) {
        await page.getByTestId(`avc-aba-${fase.id}`).click();
        await expect(
          page.getByTestId(fase.raiz),
          `⛔ a fase « ${fase.id} » abriu sem renderizar ${fase.raiz}`,
        ).toBeVisible();

        /**
         * ⚠️ E a barra concorda com a tela — ⛔ era exatamente esse o defeito
         * relatado em produção: barra apontando uma fase, tela mostrando outra.
         */
        await expect(page.getByTestId(`avc-info-superficie-${fase.id}`)).toBeVisible();
      }
    });

  /* ══ ⚠️⚠️⚠️ 3 · INTERAÇÃO REAL, DADO SINTÉTICO ══════════════════════ */

  test("registrar NIHSS sintético em produção muda a tela ⛔ e persiste entre fases",
    async ({ page }) => {
      await abrirAvc(page);

      await page.getByTestId("avc-aba-neurologico").click();
      await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
      await page.getByTestId(`avc-grandeza-zero-nihss_informado`).click();
      expect(DADOS_SINTETICOS.nihssInformado).toBe(0);

      await page.getByTestId("avc-aba-imagem").click();

      /**
       * ⚠️⚠️ ⛔ ZERO É DADO CLÍNICO, ⛔ e ⛔ não ausência — a mesma regra provada
       * no `dist` (prova A), ⛔ agora medida na produção autenticada.
       */
      const peca = page.getByTestId("avc-vital-nihss");
      await expect(peca).toBeVisible();
      await expect(peca).not.toContainText("—");
    });

  /* ══ ⚠️⚠️⚠️ 4 · CAPTURAS PARA REVISÃO VISUAL ════════════════════════ */

  /**
   * ⚠️ ⛔ Este teste ⛔ não julga aparência — ⛔ medição ⛔ não substitui olho
   * (a ordem do aviso de alto risco foi pega ⛔ olhando, ⛔ não medindo). Ele
   * ⛔ só produz o material da revisão visual, ⛔ no tamanho real de uso.
   */
  test("capturar as sete fases a 375 px para revisão visual", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await abrirAvc(page);

    for (const [i, fase] of FASES.entries()) {
      await page.getByTestId(`avc-aba-${fase.id}`).click();
      await expect(page.getByTestId(fase.raiz)).toBeVisible();
      await page.screenshot({
        path: `${PASTA_DAS_TELAS}/${String(i + 1).padStart(2, "0")}-${fase.id}.png`,
        fullPage: true,
      });
    }
  });
});
