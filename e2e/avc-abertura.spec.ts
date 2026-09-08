import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o atendimento **comece em Paciente**, que a primeira tela seja
 *   **basal ⛔ e limpa**, que a progressão normal leve a **Estabilização**, ⛔ e
 *   que ⛔ nada disso vire **porta**.
 *
 * NÃO PROMETE: que os fatos movidos estejam certos ⛔ nem que os consumidores
 *   continuem lendo — ⛔ isso é `prova-avc-abertura`, que mede o conteúdo.
 *   ⛔ Aqui se mede **o que chega à tela**.
 *
 * UNIVERSO: o módulo AVC servido do `dist`.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO (inspeção clínica, 2026-09-07) ──────────────────────
 *
 * ⛔ ⛔ A barra mostrava **Paciente** como primeira fase ⛔ e o módulo abria em
 * **Estabilização** — ⛔ o fluxo começava na segunda fase. ⚠️ ⛔ E a tela
 * Paciente vinha com tomografia, NIHSS, microssangramentos ⛔ e pendências de
 * seis fases adiante.
 */

const aba = (p: Page, id: string) => p.getByTestId(`avc-aba-${id}`).click();

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

test.describe("AVC · abertura do atendimento", () => {
  /* ══ ⚠️⚠️⚠️ 1 · ATENDIMENTO NOVO ABRE EM PACIENTE ════════════════════ */

  test("atendimento novo abre em **Paciente**, ⛔ e a tela é basal ⛔ e limpa",
    async ({ page }) => {
      await abrir(page);

      /** ⚠️ ⛔ Sem tocar em ⛔ nada: a superfície aberta ⛔ já é Paciente. */
      await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();

      /**
       * ⚠️⚠️ ⛔ E A BARRA CONCORDA — ⛔ era ⛔ exatamente aqui que ela ⛔ não
       * concordava: primeiro ícone Paciente, abertura em Estabilização.
       */
      await expect(page.getByTestId("avc-aba-paciente")).toBeVisible();

      /* ── ⚠️⚠️⚠️ ⛔ O QUE ⛔ NÃO PODE ESTAR NA PRIMEIRA TELA ─────────────── */

      const corpo = page.locator("body");
      /** ⛔ Investigação. */
      await expect(page.getByTestId("avc-prioridade-imagem")).toHaveCount(0);
      await expect(page.getByTestId("avc-resumo")).toHaveCount(0);
      await expect(corpo).not.toContainText(/Solicitar a tomografia/i);
      await expect(corpo).not.toContainText(/Escala e imagem/i);
      /** ⛔ Elegibilidade ⛔ e reperfusão. */
      await expect(corpo).not.toContainText(/Microssangramentos cerebrais/i);
      await expect(corpo).not.toContainText(/Antecedentes intracranianos/i);
      await expect(corpo).not.toContainText(/Procedimentos e sangramentos recentes/i);
      await expect(corpo).not.toContainText(/Funcionalidade prévia/i);
      /**
       * ⚠️⚠️⚠️ ⛔ E ⛔ NEM OS CINCO EIXOS — ⛔ decisão do autor: *"isso aqui
       * também deve estar na página de estabilização"*.
       *
       * ⛔ ⛔ Na abertura ⛔ eles ⛔ não têm o que resumir: ⛔ nada foi avaliado
       * ⛔ ainda, ⛔ e cinco cards de *"— não avaliado"* ocupavam o topo antes
       * da primeira pergunta sobre **quem é o paciente**.
       */
      await expect(page.getByTestId("avc-ameacas-imediatas")).toHaveCount(0);
      /**
       * ⚠️ ⛔ POR `testID`, ⛔ e ⛔ NÃO por texto: ⛔ *"Via aérea"* aparece na
       * **landing page**, que fica montada acima da rota no DOM — ⛔ e a
       * primeira versão deste teste acusou ⛔ ela.
       */
      await expect(page.getByTestId("avc-ameaca-a")).toHaveCount(0);
      await expect(page.getByTestId("avc-ameaca-e")).toHaveCount(0);
      /**
       * ⚠️⚠️⚠️ ⛔ E O RELÓGIO ⛔ NÃO ABRE O ATENDIMENTO — ⛔ *"Definir · Última
       * vez bem"* era a coisa mais chamativa da primeira tela.
       */
      await expect(page.getByTestId("avc-relogio-do-topo")).toHaveCount(0);

      /* ── ⚠️⚠️ ⛔ E O QUE **PRECISA** ESTAR ─────────────────────────────── */

      await expect(page.getByTestId("avc-grupo-identificacao")).toBeVisible();
      await expect(page.getByTestId("avc-grupo-basais")).toBeVisible();
      await expect(page.getByTestId("avc-grupo-alergias")).toBeVisible();
      await expect(page.getByTestId("avc-grupo-medicacoes")).toBeVisible();
      /** ⚠️ Os antecedentes crônicos — ⛔ e ⛔ eles nascem **recolhidos**. */
      await expect(page.getByTestId("avc-bloco-abrir-comorbidades")).toBeVisible();
      await expect(corpo).not.toContainText(/Hipertensão arterial/);
      await page.getByTestId("avc-bloco-abrir-comorbidades").click();
      await expect(corpo).toContainText(/Hipertensão arterial/);
      await expect(corpo).toContainText(/Diabetes mellitus/);
    });

  /* ══ ⚠️⚠️ 2 · AS PENDÊNCIAS DA PRIMEIRA TELA SÃO ⛔ SÓ DELA ══════════ */

  test("⛔ na abertura, as pendências são ⛔ SÓ desta tela",
    async ({ page }) => {
      await abrir(page);
      const bloco = page.getByTestId("avc-pendencias");
      /**
       * ⚠️⚠️ ⛔ A NOTA ⛔ NÃO PODE MENTIR: ⛔ dizer *"de todas as superfícies"*
       * numa lista filtrada faria o médico concluir que ⛔ não há mais ⛔ nada
       * pendente no atendimento.
       */
      await expect(bloco).toContainText(/Desta tela/i);
      await expect(bloco).not.toContainText(/De todas as superfícies/i);
      /** ⛔ E ⛔ nenhuma pendência de outra fase aparece ⛔ aqui. */
      await expect(bloco).not.toContainText(/tomografia|NIHSS|glicemia|coagula/i);

      /**
       * ── ⚠️⚠️⚠️ ⛔ O ALCANCE VIROU **PROGRESSÃO** — 2026-09-08 ──────────────
       *
       * ⛔ ⛔ A garantia era *"nas outras superfícies o bloco segue
       * transversal"*. ⚠️ ⛔ Ela ⛔ não foi apagada para ficar verde: ⛔ o autor
       * a **estreitou por decisão** — *"na fase atual, mostrar ⛔ apenas
       * pendências de fases anteriores + fase atual"*.
       *
       * ⚠️⚠️ ⛔ O QUE CONTINUA VALENDO, ⛔ e é o que importa: ⛔ a pendência
       * ⛔ **⛔ não some do atendimento** — ⛔ ela aparece na casa dela. ⛔ Uma
       * lista filtrada que apagasse pendência seria pior que uma lista longa.
       */
      await aba(page, "estabilizacao");
      await expect(page.getByTestId("avc-pendencias-nota"))
        .not.toContainText(/De todas as superfícies/i);
      await expect(page.getByTestId("avc-pendencias"))
        .not.toContainText(/Tomografia/i);

      await aba(page, "imagem");
      await expect(page.getByTestId("avc-pendencias")).toContainText(/Tomografia/i);
    });

  /* ══ ⚠️⚠️⚠️ 3 · PROGRESSÃO PACIENTE → ESTABILIZAÇÃO ═════════════════ */

  test("⛔ concluir Paciente leva a **Estabilização**",
    async ({ page }) => {
      await abrir(page);

      /**
       * ⚠️⚠️ ⛔ SEM `.catch()` — ⛔ ele ⛔ não evita a espera: ⛔ o Playwright
       * espera 15 s por um elemento inexistente ⛔ e o teste estoura. ⛔ Foi
       * assim que a primeira versão deste teste falhou, ⛔ e é a mesma lição
       * da Fase 9.
       *
       * ⚠️ O gesto real: registrar a idade, ⛔ que é o primeiro dado basal.
       */
      await page.getByTestId("avc-degrau-idade-mais-10").click();

      const proximo = page.getByTestId("avc-paciente-proximo");
      await expect(proximo).toBeVisible();
      await expect(proximo).toContainText(/Estabilização/);
      await proximo.click();
      await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
    });

  /* ══ ⚠️⚠️⚠️ 4 · ⛔ ABRIR EM PACIENTE ⛔ NÃO É UMA PORTA (E-11) ═══════ */

  test("⛔ dá para ir a qualquer fase ⛔ sem preencher ⛔ nada em Paciente",
    async ({ page }) => {
      await abrir(page);
      /**
       * ⚠️⚠️ ⛔ Se Paciente virasse pré-requisito, um paciente instável faria
       * o médico preencher identificação **antes de ver a via aérea**.
       */
      for (const destino of ["reperfusao", "imagem", "neurologico", "estabilizacao"]) {
        await aba(page, destino);
        await expect(page.getByTestId(`avc-aba-${destino}`)).toBeVisible();
      }
      /**
       * ⚠️⚠️ ⛔ E O CONTEXTO DOS EIXOS **⛔ NÃO SE PERDEU**: ⛔ ele reaparece
       * fora da abertura, ⛔ que é o que a faixa persistente promete.
       */
      await aba(page, "imagem");
      await expect(page.getByTestId("avc-ameacas-imediatas")).toBeVisible();
      /** ⚠️ ⛔ E o relógio também reaparece — ⛔ §7.8 ⛔ não foi revogada. */
      await expect(page.getByTestId("avc-relogio-do-topo")).toBeVisible();
      /** ⚠️ ⛔ E ⛔ nada em Paciente ficou obrigatório. */
      await aba(page, "paciente");
      await expect(page.getByTestId("avc-paciente-nao-e-porta"))
        .toContainText(/Nada aqui é obrigatório/i);
    });

  /* ══ ⚠️⚠️⚠️ 5 · O LUGAR DO MÉDICO ⛔ NÃO VOLTA PARA PACIENTE ═════════ */

  /**
   * ── ⚠️⚠️ ⛔ O QUE ESTE TESTE **⛔ NÃO** PODE PROMETER ────────────────────
   *
   * ⛔ ⛔ O módulo AVC ⛔ **⛔ não persiste** o atendimento através de um
   * recarregamento: `useState(() => abrirAtendimento(relogio))` cria um
   * atendimento **novo** a cada montagem. ⚠️ ⛔ Isso ⛔ já era assim antes desta
   * mudança — ⛔ o reload perdia os fatos ⛔ e voltava para Estabilização;
   * ⛔ agora perde os fatos ⛔ e volta para Paciente.
   *
   * ⚠️⚠️ ⛔ Escrever ⛔ aqui *"reabrir ⛔ não reseta"* seria prometer uma
   * persistência que ⛔ não existe — ⛔ e a trava passaria a mentir. ⛔ A
   * pendência está **relatada ao autor**, ⛔ e ⛔ não fingida.
   *
   * ⚠️ O que **existe** ⛔ e ⛔ precisa continuar existindo: ⛔ dentro da sessão,
   * ⛔ o lugar do médico é **dele** — ⛔ e ⛔ nenhuma navegação o devolve à
   * primeira tela.
   */
  test("⛔ dentro da sessão, o lugar do médico ⛔ NÃO volta para Paciente",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "imagem");
      await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();

      /** ⚠️ Registrar ⛔ e navegar ⛔ não devolve ⛔ ninguém para a abertura. */
      await page.getByTestId("avc-novo-estudo").click();
      await page.getByTestId("avc-opcao-estudo_modalidade-Angiotomografia").click();
      await aba(page, "reperfusao");
      await aba(page, "imagem");
      await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();
      await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toHaveCount(0);
    });
});
