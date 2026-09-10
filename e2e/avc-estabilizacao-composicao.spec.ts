import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, abrirEixosDaEstabilizacao } from "./helpers";
import { dosesNoTexto } from "../avc/nucleo/unidade-clinica";

/**
 * PROMETE: que a **Estabilização** contenha ⛔ só estabilização — ⛔ e que ⛔ ela
 *   passe a **ajudar a agir**, com a conduta que a fonte ⛔ já sustenta.
 *
 * NÃO PROMETE: que a conduta esteja certa neste paciente — ⛔ isso é do médico.
 *   ⛔ E ⛔ não promete que os textos clínicos estejam certos: ⛔ eles vêm de
 *   `antihipertensivos.ts` ⛔ e `correcao-glicemica.ts`, ⛔ e ⛔ quem os mede são
 *   as provas de conteúdo.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px** — ⛔ a largura em que
 *   o autor fez a inspeção.
 *
 * ── ⚠️⚠️⚠️ ⛔ O QUE ELE VIU (inspeção clínica, 2026-09-08) ─────────────────
 *
 * ⛔ ⛔ A Estabilização abria com **tomografia**, *"Solicitar a tomografia"*,
 * *"Já foi feita"*, **última vez visto bem**, **Escala e imagem** com NIHSS,
 * **peso** ⛔ e **crise convulsiva** — ⛔ e as pendências listavam TC, última
 * vez bem ⛔ e déficit neurológico, ⛔ três fases adiante.
 *
 * ⚠️⚠️ ⛔ E os controles numéricos tinham **larguras diferentes**: ⛔ o rótulo
 * dividia a linha com o controle, ⛔ e cada slider media um tanto.
 */

test.use({ viewport: { width: 375, height: 812 } });

const aba = (p: Page, id: string) => p.getByTestId(`avc-aba-${id}`).click();

async function abrirEstabilizacao(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await aba(page, "estabilizacao");
  await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
  /**
   * ⚠️ ⛔ Desde o acordeão (2026-09-08), ⛔ só o primeiro eixo nasce aberto.
   * ⛔ Estes testes medem **a composição** da tela — ⛔ e o que ⛔ ela ⛔ não
   * carrega —, ⛔ então ⛔ eles precisam de tudo à vista.
   */
  await abrirEixosDaEstabilizacao(page);
}

/** ⚠️ Registrar um número **pelo gesto da caixa** — ⛔ e ⛔ não por estado interno. */
async function medir(page: Page, campo: string, valor: string) {
  const caixa = page.getByTestId(`avc-num-caixa-${campo}`);
  await caixa.fill(valor);
  await caixa.blur();
}

test.describe("AVC · Estabilização — composição", () => {
  /* ══ ⚠️⚠️⚠️ 1 · ⛔ NADA DE FASE FUTURA ═══════════════════════════════════ */

  test("⛔ a Estabilização ⛔ NÃO carrega TC, NIHSS, última vez bem, crise ⛔ nem peso",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      const corpo = page.locator("body");

      /** ⛔ Investigação. */
      await expect(page.getByTestId("avc-prioridade-imagem")).toHaveCount(0);
      await expect(page.getByTestId("avc-resumo")).toHaveCount(0);
      await expect(corpo).not.toContainText(/Solicitar a tomografia/i);
      await expect(corpo).not.toContainText(/Já foi feita/i);
      await expect(corpo).not.toContainText(/Escala e imagem/i);

      /** ⛔ Avaliação AVC. */
      await expect(page.getByTestId("avc-relogio-do-topo")).toHaveCount(0);
      await expect(corpo).not.toContainText(/Última vez bem/i);
      await expect(page.getByTestId("avc-campo-crise_no_inicio")).toHaveCount(0);

      /** ⛔ Paciente. */
      await expect(page.getByTestId("avc-campo-peso")).toHaveCount(0);
      await expect(page.getByTestId("avc-campo-peso_origem")).toHaveCount(0);
      await expect(corpo).not.toContainText(/Do painel Paciente/i);

      /* ── ⚠️ E O QUE **PRECISA** ESTAR ──────────────────────────────────── */

      await expect(page.getByTestId("avc-ameacas-imediatas")).toBeVisible();
      for (const g of ["via-aerea", "respiracao", "pressao", "neurologico-inicial", "exposicao"]) {
        await expect(page.getByTestId(`avc-grupo-${g}`)).toBeVisible();
      }
    });

  /* ══ ⚠️⚠️ 2 · O PESO ⛔ NÃO FICOU DUPLICADO ════════════════════════════ */

  test("⛔ o peso existe **uma vez**, ⛔ e é em Paciente",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await expect(page.getByTestId("avc-campo-peso")).toHaveCount(0);

      await aba(page, "paciente");
      /**
       * ⚠️⚠️ ⛔ TIRAR DE UMA TELA ⛔ SEM ESTAR NA OUTRA apagaria o campo do
       * atendimento — ⛔ e é o erro que esta metade impede.
       */
      await expect(page.getByTestId("avc-campo-peso")).toHaveCount(1);
      await expect(page.getByTestId("avc-campo-peso_origem")).toHaveCount(1);
    });

  /* ══ ⚠️⚠️⚠️ 3 · PENDÊNCIAS ⛔ ATÉ A FASE ATUAL ═══════════════════════════ */

  test("⛔ na Estabilização, ⛔ nenhuma pendência de fase futura",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      const bloco = page.getByTestId("avc-pendencias");

      /** ⛔ TC é de Investigação; ⛔ última vez bem ⛔ e déficit, de Avaliação AVC. */
      await expect(bloco).not.toContainText(/Tomografia/i);
      await expect(bloco).not.toContainText(/Última vez visto bem/i);
      await expect(bloco).not.toContainText(/Déficit neurológico/i);
      await expect(bloco).not.toContainText(/NIHSS/i);

      /** ⚠️⚠️ ⛔ E A NOTA ⛔ NÃO MENTE sobre a lista que está mostrando. */
      await expect(page.getByTestId("avc-pendencias-nota"))
        .not.toContainText(/De todas as superfícies/i);

      /**
       * ⚠️⚠️ ⛔ E ELAS ⛔ NÃO SUMIRAM DO ATENDIMENTO — ⛔ **isto é a outra
       * metade**: uma lista filtrada que apagasse a pendência seria pior que
       * uma lista longa.
       */
      await aba(page, "imagem");
      await expect(page.getByTestId("avc-pendencias")).toContainText(/Tomografia/i);
    });

  /* ══ ⚠️⚠️ 4 · A CRISE MORA NA AVALIAÇÃO AVC ═══════════════════════════ */

  test("⛔ a crise no início aparece **na Avaliação AVC**",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await expect(page.getByTestId("avc-campo-crise_no_inicio")).toHaveCount(0);

      await aba(page, "neurologico");
      await expect(page.getByTestId("avc-campo-crise_no_inicio")).toHaveCount(1);
      /** ⚠️ ⛔ E o gesto funciona lá — ⛔ mudar de casa ⛔ não pode custar o registro. */
      await page.getByTestId("avc-opcao-crise_no_inicio-sim").click();
      await expect(page.getByTestId("avc-opcao-crise_no_inicio-sim")).toBeVisible();
    });

  /* ══ ⚠️⚠️⚠️ 5 · TODOS OS SLIDERS COM A MESMA LARGURA ═══════════════════ */

  /**
   * ⚠️⚠️ ⛔ MEDIDO NO PIXEL, ⛔ e ⛔ não no estilo: ⛔ a causa era o **hospedeiro**
   * — ⛔ o controle nascia `flex: 0 0 auto` numa linha, ⛔ e o slider ficava com
   * 104 px de 343 disponíveis. ⚠️ É a lição de `barra-utilizavel.spec`.
   */
  test("⛔ os oito sliders começam ⛔ e terminam no mesmo x",
    async ({ page }) => {
      await abrirEstabilizacao(page);

      /**
       * ── ⚠️⚠️⚠️ ⛔ MEDIR **⛔ ZERO** ⛔ NÃO É MEDIR — 2026-09-09 ────────────
       *
       * ⛔ ⛔ Esta conferência ⛔ falhou ⛔ **⛔ uma vez ⛔ em quatro rodadas
       * completas**, ⛔ com o trilho da temperatura ⛔ em `x:50, fim:50` —
       * ⛔ **⛔ largura zero** —, ⛔ enquanto ⛔ os outros sete ⛔ mediam 299.
       *
       * ⚠️⚠️ ⛔ Zero ⛔ **⛔ não é ⛔ «errado»**: ⛔ é ⛔ **⛔ não renderizado**.
       * ⛔ O elemento existe ⛔ no DOM ⛔ e ⛔ ainda ⛔ não tem caixa — ⛔ e
       * ⛔ `getBoundingClientRect` ⛔ devolve ⛔ zeros ⛔ sem reclamar.
       *
       * ⛔ ⛔ ⛔ **⛔ Uma trava que ⛔ às vezes ⛔ mede o que ⛔ não existe
       * ⛔ grita ⛔ em dia aleatório ⛔ e ⛔ é ignorada ⛔ no dia seguinte** —
       * ⛔ o mesmo padrão ⛔ dos 14 falsos positivos ⛔ do auditor, ⛔ na
       * mesma tarde.
       *
       * ⚠️ ⛔ Então ⛔ ela **⛔ espera** ⛔ os oito terem caixa ⛔ antes de
       * comparar. ⛔ Se ⛔ algum ⛔ nunca tiver, ⛔ ela ⛔ falha ⛔ **⛔ por
       * isso**, ⛔ e ⛔ com ⛔ essa palavra.
       */
      await expect
        .poll(
          async () =>
            page.evaluate(
              () =>
                Array.from(document.querySelectorAll('[data-testid^="avc-num-barra-"]')).filter(
                  (n) => (n as HTMLElement).getBoundingClientRect().width > 0
                ).length
            ),
          { message: "⛔ trilho sem caixa: o layout ainda não assentou" }
        )
        .toBeGreaterThanOrEqual(8);

      const medidas = await page.evaluate(() =>
        Array.from(document.querySelectorAll('[data-testid^="avc-num-barra-"]')).map((n) => {
          const r = (n as HTMLElement).getBoundingClientRect();
          return { id: n.getAttribute("data-testid"), x: Math.round(r.x), fim: Math.round(r.right) };
        })
      );
      expect(medidas.length, "⛔ os controles numéricos sumiram").toBeGreaterThanOrEqual(8);
      /** ⚠️ ⛔ E ⛔ nenhum deles ⛔ pode ter entrado ⛔ na conta ⛔ com zero. */
      const semCaixa = medidas.filter((m) => m.fim - m.x === 0).map((m) => m.id);
      expect(semCaixa, `⛔ trilho com largura zero: ${JSON.stringify(semCaixa)}`).toEqual([]);
      expect(new Set(medidas.map((m) => m.x)).size, `⛔ inícios diferentes: ${JSON.stringify(medidas)}`).toBe(1);
      expect(new Set(medidas.map((m) => m.fim)).size, `⛔ fins diferentes: ${JSON.stringify(medidas)}`).toBe(1);

      /** ⚠️ ⛔ E ⛔ eles usam a largura útil — ⛔ um trilho de 104 px ⛔ não é controle. */
      expect(medidas[0].fim - medidas[0].x).toBeGreaterThan(200);
    });

  /* ══ ⚠️⚠️ 6 · HIPOXEMIA — A ORIENTAÇÃO QUE ⛔ JÁ EXISTIA ═══════════════ */

  test("⛔ hipoxemia mostra a conduta da fonte, ⛔ sem inventar",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await expect(page.getByTestId("avc-ameacas-conduta")).toHaveCount(0);

      await page.getByTestId("avc-opcao-hipoxia-sim").click();
      const conduta = page.getByTestId("avc-ameacas-conduta");
      await expect(conduta).toBeVisible();
      /** ⚠️ A meta é **da fonte** (F-23), ⛔ e ⛔ a tela ⛔ não a redige. */
      await expect(conduta).toContainText(/94/);
    });

  /* ══ ⚠️⚠️⚠️ 7 · PA ACIMA DA META — F-19 ⛔ NA PRÓPRIA ESTABILIZAÇÃO ════ */

  test("⛔ PA acima da meta traz agentes ⛔ e doses **aqui**",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await expect(page.getByTestId("avc-a-corrigir-agora")).toHaveCount(0);

      await medir(page, "pas", "200");
      await medir(page, "pad", "120");

      const bloco = page.getByTestId("avc-a-corrigir-agora");
      await expect(bloco).toBeVisible();
      await expect(page.getByTestId("avc-a-terapeutica-pressao")).toBeVisible();
      /**
       * ⚠️ ⛔ Os agentes nascem **fechados** desde 2026-09-09 (*"⛔ não poderia
       * ser expansível ⛔ ao invés de ficar tudo aberto na tela?"*). ⛔ A dose
       * ⛔ continua ⛔ na tela — ⛔ **⛔ a um toque** —, ⛔ e ⛔ é ⛔ o toque que
       * ⛔ mudou, ⛔ e ⛔ não a garantia.
       */
      await page.getByTestId("avc-a-agentes-abrir").first().click();
      /** ⚠️ O agente ⛔ e a dose, ⛔ como F-19 os escreve. */
      await expect(page.getByTestId("avc-a-agente-labetalol")).toContainText(/10 a 20 mg/);
      /** ⚠️⚠️ ⛔ E a procedência: **a diretriz vigente ⛔ não nomeia fármaco**. */
      await expect(bloco).toContainText(/não nomeia fármaco/i);
      /** ⚠️ O alerta de segurança fica **junto** dos agentes. */
      await expect(page.getByTestId("avc-a-alerta-esmolol")).toBeVisible();
      /** ⚠️ E o alvo. */
      await expect(bloco).toContainText(/185/);
    });

  /* ══ ⚠️⚠️⚠️ 8 · GLICEMIA COM CONDUTA — TRATAMENTO ⛔ E ALVO **AQUI** ═══ */

  test("⛔ glicemia com indicação traz tratamento ⛔ e alvo **aqui**",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await medir(page, "glicemia", "40");

      await expect(page.getByTestId("avc-a-terapeutica-glicemia")).toBeVisible();
      /** ⚠️ ⛔ A pergunta que decide vem **antes** das faixas. */
      await expect(page.getByTestId("avc-a-pergunta-glicemia")).toBeVisible();
      /** ⚠️⚠️ ⛔ E as leituras antigas erradas ficam **na tela**. */
      await expect(page.getByTestId("avc-a-erros-glicemia")).toBeVisible();
    });

  /* ══ ⚠️⚠️⚠️ 9 · ⛔ SEM FONTE, ⛔ SEM CONDUTA ═════════════════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA CLÍNICA DESTE ARQUIVO.
   *
   * ⛔ ⛔ **⛔ Nenhuma fonte transcrita do AVC** dá corte para **temperatura**,
   * limiar inferior para **hipotensão** ⛔ ou corte para **Glasgow**. ⚠️ ⛔ Uma
   * conduta ⛔ aqui nasceria na tela (**E-31**), ⛔ e ⛔ é ⛔ exatamente o que o
   * autor proibiu: *"⛔ sem corte, alvo ⛔ ou fármaco até existir fonte
   * específica transcrita para AVC"*.
   */
  test("⛔ temperatura, hipotensão ⛔ e Glasgow ⛔ NÃO geram conduta",
    async ({ page }) => {
      await abrirEstabilizacao(page);

      /** ⛔ Hipotensão franca. */
      await medir(page, "pas", "80");
      await medir(page, "pad", "46");
      /** ⛔ Febre. */
      await medir(page, "temperatura", "39");
      /** ⛔ Glasgow rebaixado. */
      await medir(page, "glasgow", "8");

      await expect(page.getByTestId("avc-a-corrigir-agora")).toHaveCount(0);
      await expect(page.getByTestId("avc-a-terapeutica-pressao")).toHaveCount(0);

      const corpo = page.locator("body");
      /** ⛔ ⛔ Nenhum fármaco, ⛔ nenhuma dose, ⛔ nenhum alvo inventado. */
      await expect(corpo).not.toContainText(/Labetalol|Nicardipino|Noradrenalina|dipirona|paracetamol/i);
      /**
       * ⚠️⚠️⚠️ ⛔ « TEM BARRA » ⛔ **⛔ NÃO** ⛔ É ⛔ « É CONCENTRAÇÃO » — 2026-09-10.
       *
       * ⛔ ⛔ Para matar ⛔ o falso positivo « 50mg/dL » (⛔ o degrau `+50` ⛔ colado
       * ⛔ à unidade da glicemia), ⛔ a primeira correção ⛔ foi ⛔ `(?!\/)`.
       * ⚠️⚠️ ⛔ Ela ⛔ **⛔ apagaria** ⛔ `alteplase 0,9 mg/kg`,
       * ⛔ `tenecteplase 0,4 mg/kg` ⛔ e ⛔ `mcg/kg/min` — ⛔ doses ⛔ que ⛔ estão
       * ⛔ **⛔ no conteúdo deste módulo**. ⛔ Falso positivo barulhento ⛔ trocado
       * ⛔ por ⛔ falso negativo ⛔ **⛔ silencioso**.
       *
       * ⚠️ ⛔ Quem decide ⛔ agora ⛔ é ⛔ `classificarUnidade` — ⛔ tabela nomeada,
       * ⛔ provada ⛔ por `npm run test:unidade-de-dose`.
       */
      expect(
        dosesNoTexto(await corpo.innerText()),
        "⛔ nenhuma DOSE pode aparecer nesta superfície — concentração (mg/dL) não conta"
      ).toEqual([]);
    });

  /* ══ ⚠️⚠️⚠️ 10 · ⛔ NADA É REGISTRADO SOZINHO ══════════════════════════ */

  test("⛔ ver a conduta ⛔ NÃO registra que ela foi feita",
    async ({ page }) => {
      await abrirEstabilizacao(page);
      await medir(page, "pas", "200");
      await medir(page, "pad", "120");
      const bloco = page.getByTestId("avc-a-corrigir-agora");
      await expect(bloco).toBeVisible();

      /**
       * ⚠️⚠️ ⛔ O BLOCO ⛔ NÃO TEM CONTROLE QUE GRAVE: ⛔ o estado da ação mora
       * em Correções, ⛔ e ⛔ é lá que o médico o move — ⛔ com gesto explícito.
       */
      await expect(bloco.locator('[data-testid^="avc-opcao-acao_estado"]')).toHaveCount(0);

      /** ⚠️ A saída **leva**, ⛔ e ⛔ não trata (**E-09**). */
      await page.getByTestId("avc-a-registrar-pressao_acima_da_meta").click();
      await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();

      /**
       * ⚠️⚠️ ⛔ E ⛔ LÁ A AÇÃO CONTINUA ⛔ SEM ESTADO: ⛔ se ⛔ só de olhar a
       * conduta o app marcasse *"feita"*, a trilha registraria um tratamento
       * que ⛔ ninguém deu.
       */
      await expect(page.locator("body")).not.toContainText(/Corrigido e reavaliado/i);
    });
});
