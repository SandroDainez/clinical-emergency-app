import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o módulo AVC funcione como **UMA MÁQUINA**, atravessando
 * UI → estado → derivação → outra superfície, em episódios clínicos inteiros.
 *
 * NÃO PROMETE: correção clínica de cada regra (provas de superfície), ⛔ nem
 * alcançabilidade estática (`prova-alcancabilidade-avc`). Aqui se mede o que
 * acontece quando **uma superfície conversa com outra**.
 *
 * ── ⚠️⚠️ POR QUE ESTES TESTES EXISTEM ────────────────────────────────────────
 *
 * ⚠️ Quatro defeitos reais moraram no vão entre camadas, ⛔ e ⛔ nenhum foi
 * pego por prova de superfície: achado sem modalidade, ação sem tela, ação fora
 * do registro, ⛔ e uma derivação lendo um campo que ⛔ não existe. ⚠️⚠️ Os
 * quatro exigiam **preencher pela UI real e conferir a consequência noutra
 * superfície** — que é o que cada fluxo abaixo faz.
 *
 * ⚠️ A largura é a do `playwright.config` — Pixel 7, o tamanho real de uso.
 */
const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

/** ⚠️ Um exame, com a modalidade declarada — ⛔ sem ela ⛔ nenhum achado aparece. */
async function novoExame(page: Page, modalidade: string) {
  await aba(page, "imagem");
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId(`avc-opcao-estudo_modalidade-${modalidade}`).click();
}

/** ⚠️ Confirmar ⛔ sem mexer em hora/minuto ⛔ não é permitido — ⛔ "agora" ⛔ não é default. */
async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

test.describe("AVC · fluxos clínicos completos", () => {
  /**
   * ⚠️⚠️ FLUXO A · IVT PADRÃO — o episódio inteiro, ponta a ponta.
   *
   * ⛔ Este é o teste que teria pego TRÊS dos quatro defeitos históricos.
   */
  test("A · entrada → neurológico → imagem → reperfusão → ação → destino",
    async ({ page }) => {
      await abrir(page);

      // ── entrada: o relógio nasce em A ────────────────────────────────
      await aba(page, "estabilizacao");
      await informarHora(page, "hora_inicio_observado");

      // ── neurológico: o déficit incapacitante ──────────────────────────
      await aba(page, "neurologico");
      await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();

      // ── reperfusão: a rapidez passa a corresponder ────────────────────
      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-f-rec-ivt_rapidez")).toBeVisible();
      /**
       * ⚠️⚠️ A CONSEQUÊNCIA: ela passa a CORRESPONDER ao paciente.
       *
       * ⛔ E cai em `aplicavel`, ⛔ e ⛔ não em "com prazo correndo": §4.6.1
       * rec. 1 é afirmação sobre **velocidade**, ⛔ e ⛔ não traz janela.
       */
      await expect(page.getByTestId("avc-f-faixa-aplicavel")).toBeVisible();

      // ── a ação de trombólise, registrada em F ─────────────────────────
      await page.getByTestId("avc-nova-trombolise").click();
      await page.getByTestId("avc-opcao-ivt_agente_administrado-Alteplase").click();
      await page.getByTestId("avc-opcao-ivt_estado-Iniciada").click();
      await informarHora(page, "ivt_inicio");

      // ── destino: a Table 7 aparece porque a AÇÃO existe ───────────────
      await aba(page, "destino");
      await expect(page.getByTestId("avc-g-monitorizacao")).toBeVisible();
      await expect(page.getByTestId("avc-g-fase-atual")).toContainText(/15 min/);
      await expect(page.getByTestId("avc-g-deterioracao")).toContainText(/Cefaleia intensa/);
    });

  /**
   * ⚠️⚠️ FLUXO B · WAKE-UP — os dois relógios, ⛔ sem fusão.
   */
  test("B · acordou com o déficit → meio do sono e última vez bem, SEPARADOS",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "estabilizacao");

      /** ⚠️⚠️ O marco só aparece no contexto — ⛔ e ⛔ não por início desconhecido. */
      await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toHaveCount(0);
      await page.getByTestId("avc-opcao-acordou_com_deficit-sim").click();
      await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toBeVisible();

      await informarHora(page, "hora_meio_do_sono");
      await informarHora(page, "hora_ultima_vez_bem");

      // ── reperfusão: DOIS relógios, com marcos e faixas próprias ───────
      await aba(page, "reperfusao");
      await page.getByTestId("avc-f-divida-ivt_wakeup_ou_45_9").click();
      const meio = page.getByTestId("avc-f-relogio-midpoint_of_sleep-0");
      const lkw = page.getByTestId("avc-f-relogio-last_known_well-1");
      await expect(meio).toContainText(/Meio do sono/);
      await expect(lkw).toContainText(/Última vez visto bem/);
      /** ⚠️⚠️ FAIXAS DIFERENTES — a prova de que ⛔ não viraram uma contagem só. */
      await expect(meio).toContainText("9 h");
      await expect(lkw).toContainText("4,5–9 h");
    });

  /**
   * ⚠️⚠️ FLUXO C · EVT — e IVT e EVT seguem PARALELAS.
   *
   * ⛔ Este fluxo exercita o NIHSS, que a varredura pegou lendo um campo
   * inexistente: nove recomendações dependiam dele ⛔ e ⛔ nunca fechavam.
   */
  /**
   * ⚠️ O ASPECTS ⛔ NÃO entra neste fluxo. Num segundo exame aberto, o controle
   * numérico ⛔ não ficou alcançável por `testID` de forma estável, ⛔ e teste
   * instável é pior que teste ausente: ele ensina a ignorar vermelho.
   * ⚠️ O ASPECTS segue coberto pela prova da Superfície C ⛔ e pela varredura de
   * alcançabilidade — ⛔ o que falta aqui é o **atravessamento por UI**, e isso
   * fica registrado como pendência, ⛔ não como conferido.
   */
  test("C · sítio + NIHSS → correspondência de EVT, sem exclusividade",
    async ({ page }) => {
      await abrir(page);

      await novoExame(page, "Angiotomografia");
      /** ⚠️ O campo nasce RECOLHIDO — onze opções ocupavam 682 px no celular. */
      await page.getByTestId("avc-abrir-sitio_oclusao").click();
      await page.getByTestId("avc-opcao-sitio_oclusao-M1 da artéria cerebral média").click();

      await aba(page, "neurologico");
      /** ⚠️ O bloco do NIHSS de fora nasce RECOLHIDO — o médico o abre. */
      await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
      for (let i = 0; i < 6; i += 1) await page.getByTestId("avc-grandeza-nihss_informado-mais").click();

      await aba(page, "reperfusao");
      /** ⚠️⚠️ O NIHSS ATRAVESSOU: ⛔ ele some da lista de faltas. */
      await page.getByTestId("avc-f-faltas-resto").click().catch(() => undefined);
      await expect(page.getByTestId("avc-f-falta-nihss")).toHaveCount(0);

      /** ⚠️⚠️ AS DUAS RAIAS CONTINUAM — ⛔ nenhuma exclui a outra (COR 1 · LOE A). */
      await expect(page.getByTestId("avc-f-raia-ivt")).toBeVisible();
      await expect(page.getByTestId("avc-f-raia-evt")).toBeVisible();
      await expect(page.getByTestId("avc-f-paralelismo")).toContainText(/não atrasa a outra/);
    });

  /**
   * ⚠️⚠️ FLUXO D · SAÍDA POR HEMORRAGIA — G reusa, ⛔ e ⛔ não refaz.
   */
  test("D · imagem produz o destino, e G o reutiliza sem segunda verdade",
    async ({ page }) => {
      await abrir(page);
      await novoExame(page, "Tomografia de crânio sem contraste");
      await page.getByTestId("avc-opcao-estudo_resultado-Hemorragia intracraniana identificada").click();

      /** ⚠️ C é quem decide — o destino nasce lá. */
      await expect(page.getByTestId("avc-destino-hemorragia_intracraniana")).toBeVisible();

      await aba(page, "destino");
      const emG = page.getByTestId("avc-g-saida-hemorragia_intracraniana");
      await expect(emG).toBeVisible();
      /** ⚠️⚠️ G DIZ DE ONDE VEIO — ⛔ e ⛔ não se apresenta como autora. */
      await expect(emG).toContainText(/produzido em Imagem/i);
    });

  /**
   * ⚠️⚠️ FLUXO E · DESCONHECIDO ⛔ NUNCA VIRA NEGATIVO ⛔ NEM FAVORÁVEL.
   *
   * ⛔ O contrato mais atravessado do módulo, medido de ponta a ponta.
   */
  test("E · ausência e incerteza ⛔ não viram resposta", async ({ page }) => {
    await abrir(page);

    // ── "Incerto" na imagem ⛔ não contradiz ⛔ nem satisfaz ──────────────
    await novoExame(page, "Ressonância magnética");
    await page.getByTestId("avc-opcao-dwi_menor_que_um_terco-nao_sei").click();

    await aba(page, "reperfusao");
    /** ⚠️ A recomendação segue POTENCIAL — ⛔ e ⛔ não fora da população. */
    await page.getByTestId("avc-f-faltas-resto").click().catch(() => undefined);
    await expect(page.getByTestId("avc-f-falta-dwi_menor_que_um_terco")).toHaveCount(1);

    // ── "Sem essa informação" no relógio ⛔ não faz o tempo correr ───────
    await aba(page, "estabilizacao");
    await page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem").click();
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-sem-relogio")).toBeVisible();

    // ── ⛔ e ⛔ nenhuma recomendação virou aplicável por ausência ─────────
    await expect(page.getByTestId("avc-f-raia-evt-aplicaveis")).toHaveText("0");
  });

  /**
   * ⚠️⚠️ CONTRATO TRANSVERSAL · OPERACIONAL ⛔ NÃO É ELEGIBILIDADE.
   *
   * ⛔ Medido no episódio: responder capacidade do serviço ⛔ não pode mover
   * ⛔ nada em Reperfusão.
   */
  test("operacional ⛔ não é elegibilidade — nem com tudo respondido",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "reperfusao");
      const antes = await page.getByTestId("avc-superficie-f-conteudo").innerText();

      await aba(page, "destino");
      for (const f of ["centro_evt_disponivel", "transferencia_possivel",
        "perfusao_automatizada_disponivel"]) {
        await page.getByTestId(`avc-g-opcao-${f}-nao`).click();
      }

      await aba(page, "reperfusao");
      const depois = await page.getByTestId("avc-superficie-f-conteudo").innerText();
      expect(depois, "geografia ⛔ não pode virar critério clínico").toBe(antes);
    });

  /**
   * ⚠️⚠️ CONTRATO TRANSVERSAL · DECISÃO ⛔ NÃO É AÇÃO.
   */
  test("escolher o agente ⛔ não produz monitorização ⛔ nem dose", async ({ page }) => {
    await abrir(page);
    await aba(page, "reperfusao");
    await page.getByTestId("avc-f-agente-Tenecteplase").click();

    /** ⛔ ⛔ Sem peso ⛔ não há dose, mesmo com agente escolhido. */
    await expect(page.getByTestId("avc-f-dose-valor")).toHaveCount(0);

    /** ⛔ ⛔ E escolher ⛔ não é administrar: G ⛔ não mostra a Table 7. */
    await aba(page, "destino");
    await expect(page.getByTestId("avc-g-monitorizacao")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ CONTRATO TRANSVERSAL · A AÇÃO ⛔ NÃO CORRIGE A DECISÃO.
   *
   * ⛔ Decidir TNK e iniciar alteplase é divergência legítima — ⛔ e a trilha
   * guarda as duas.
   */
  test("decidir um agente e administrar outro: os dois sobrevivem",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "reperfusao");
      await page.getByTestId("avc-f-agente-Tenecteplase").click();

      await page.getByTestId("avc-nova-trombolise").click();
      await page.getByTestId("avc-opcao-ivt_agente_administrado-Alteplase").click();

      const agente = page.getByTestId("avc-f-agente");
      await expect(agente).toContainText("Tenecteplase");
      await expect(page.getByTestId("avc-f-acao-trombolise")).toContainText("Alteplase");
    });
});
