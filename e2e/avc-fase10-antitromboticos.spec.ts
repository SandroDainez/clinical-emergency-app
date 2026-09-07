import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a escada do pós-trombólise **mude com o gesto do médico**, ⛔ e
 *   que ⛔ nenhum degrau vire conclusão:
 *
 *     imagem ⛔ não feita → realizada ⛔ sem laudo → laudo disponível
 *
 *   ⛔ e que *"sem hemorragia"* ⛔ **⛔ não** produza início de antitrombótico
 *   ⛔ nenhum.
 *
 * NÃO PROMETE: que a conduta esteja certa neste paciente — ⛔ isso é do médico.
 *   ⛔ E ⛔ **⛔ não** promete estética: overflow ⛔ e contraste ⛔ não se medem
 *   aqui.
 *
 * UNIVERSO: a Superfície G servida do `dist`, na largura do
 *   `playwright.config`.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO EXISTE ────────────────────────────────────
 *
 * ⛔ ⛔ A trava do motor registra os fatos **por dentro**. ⚠️ ⛔ Ela ⛔ não pode
 * mostrar que o médico consegue **chegar** ⛔ ao campo do julgamento, ⛔ nem
 * que a palavra na tela muda quando o laudo entra. ⛔ Foi um e2e assim que, na
 * Fase 9, achou dois defeitos mudos que ⛔ nenhuma prova de motor pegava.
 */

const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

/** ⚠️ Confirmar ⛔ sem mexer ⛔ não é permitido — ⛔ "agora" ⛔ não é padrão (§0.2). */
async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

/**
 * ⚠️⚠️ A TROMBÓLISE **ADMINISTRADA** — ⛔ documentação retrospectiva, ⛔ e ⛔ não
 * decisão. ⛔ Ela nunca é bloqueada (arquitetura da Fase 6).
 */
async function registrarIvt(page: Page) {
  await aba(page, "reperfusao");
  await page.getByTestId("avc-nova-trombolise").click();
  await page.getByTestId("avc-opcao-ivt_estado-Realizada").click();
  await informarHora(page, "ivt_inicio");
}

test.describe("AVC · Fase 10 — antitrombóticos pós-IVT", () => {
  /* ══ ⚠️⚠️⚠️ GESTO REAL · A ESCADA DA IMAGEM DE CONTROLE ═══════════════ */

  test("imagem ⛔ não feita → realizada ⛔ sem laudo → laudo: a palavra muda, ⛔ e ⛔ nada é iniciado",
    async ({ page }) => {
      await abrir(page);
      await registrarIvt(page);

      /* ── 1 · ⛔ ainda ⛔ sem imagem de controle ────────────────────────── */

      await aba(page, "destino");
      const bloco = page.getByTestId("avc-g-antitromboticos");
      await expect(bloco).toBeVisible();
      await expect(page.getByTestId("avc-g-antitrombotico-estado-antes_da_imagem_controle"))
        .toBeVisible();

      /**
       * ⚠️⚠️ ⛔ A ORDEM DA TABLE 7 ESTÁ NA TELA, ⛔ e ⛔ ela é o motivo do
       * bloco existir: imagem **antes** do antitrombótico.
       */
      await expect(page.getByTestId("avc-g-antitrombotico-ordem"))
        .toContainText(/ANTES de iniciar anticoagulante ou antiagregante/i);

      /**
       * ⚠️⚠️⚠️ ⛔ E ⛔ **⛔ NENHUM** BOTÃO DE INICIAR ⛔ NADA — ⛔ nem aqui, ⛔ nem
       * depois do laudo. ⛔ A decisão terapêutica ⛔ não mora neste app.
       */
      await expect(bloco).not.toContainText(/iniciar antiagregante agora|prescrever|administrar aspirina/i);

      /* ── 2 · imagem realizada, ⛔ e o laudo ⛔ ainda ⛔ não veio ────────── */

      await aba(page, "imagem");
      await page.getByTestId("avc-novo-estudo").click();
      await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
      /**
       * ⚠️⚠️ ⛔ A HORA É O QUE TORNA O ESTUDO *DE CONTROLE* — ⛔ e ⛔ sem ela o
       * app ⛔ não assume: assumir daria por cumprida uma imagem que ⛔ ninguém
       * datou (**E-23**).
       */
      await informarHora(page, "estudo_hora");

      await aba(page, "destino");
      await expect(
        page.getByTestId("avc-g-antitrombotico-estado-imagem_realizada_sem_resultado")
      ).toBeVisible();
      await expect(page.getByTestId("avc-g-antitrombotico-frase"))
        .toContainText(/resultado ainda não disponível/i);

      /* ── 3 · o laudo entra ────────────────────────────────────────────── */

      await aba(page, "imagem");
      await page.getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada").click();

      await aba(page, "destino");
      /**
       * ⚠️⚠️⚠️ ⛔ O ESTADO MUDA — ⛔ e ⛔ **⛔ SÓ ISSO**.
       *
       * ⛔ ⛔ *"Sem hemorragia"* ⛔ **⛔ não** é *"pode iniciar"*. ⚠️ ⛔ Este é o
       * degrau que a fase inteira existe para ⛔ não pular.
       */
      await expect(page.getByTestId("avc-g-antitrombotico-estado-resultado_disponivel"))
        .toBeVisible();
      await expect(page.getByTestId("avc-g-antitrombotico-resultado"))
        .toContainText(/Sem hemorragia intracraniana identificada/);

      /** ⚠️⚠️ ⛔ E ⛔ NENHUMA palavra de liberação ⛔ ou de prescrição apareceu. */
      await expect(bloco).not.toContainText(/liberad|pode iniciar|indicado iniciar|autorizad/i);
      await expect(bloco).not.toContainText(/\b\d+\s*mg\b/);
      /** ⚠️ ⛔ E a ordem continua visível, ⛔ e ⛔ não some com o laudo. */
      await expect(page.getByTestId("avc-g-antitrombotico-ordem")).toBeVisible();
      /** ⚠️⚠️ ⛔ E a lacuna da anticoagulação é **declarada**, ⛔ e ⛔ não calada. */
      await expect(page.getByTestId("avc-g-antitrombotico-lacuna"))
        .toContainText(/não emite conduta anticoagulante/i);
    });

  /* ══ ⚠️⚠️⚠️ GESTO REAL · A EXCEÇÃO DAS PRIMEIRAS 24 h ════════════════ */

  test("condição concomitante <24 h → risco incerto · COR 2b · LOE B-NR, ⛔ e ⛔ sem linguagem de rotina",
    async ({ page }) => {
      await abrir(page);
      await registrarIvt(page);
      await aba(page, "destino");

      /**
       * ⚠️⚠️ ⛔ A EXCEÇÃO ⛔ NÃO NASCE SOZINHA — ⛔ ela exige o julgamento
       * **registrado**. ⛔ Uma exceção oferecida a todo paciente vira rotina.
       */
      await expect(
        page.getByTestId("avc-g-antitrombotico-estado-excecao_precoce_pode_ser_considerada")
      ).toHaveCount(0);

      /** ⚠️ O gesto: o médico afirma a condição concomitante. */
      await page.getByTestId("avc-opcao-condicao_concomitante_antiagregante-sim").click();

      await expect(
        page.getByTestId("avc-g-antitrombotico-estado-excecao_precoce_pode_ser_considerada")
      ).toBeVisible();

      /**
       * ⚠️⚠️⚠️ ⛔ *"RISCO INCERTO"*, ⛔ e a força da fonte **visível** — ⛔ um
       * *"pode ser considerado"* ⛔ sem COR/LOE ⛔ não se confere.
       */
      const frase = page.getByTestId("avc-g-antitrombotico-frase");
      await expect(frase).toContainText(/risco incerto/i);
      await expect(frase).toContainText(/[Pp]ode ser considerado/);
      await expect(page.getByTestId("avc-g-antitrombotico-grau")).toContainText("COR 2b");
      await expect(page.getByTestId("avc-g-antitrombotico-grau")).toContainText("LOE B-NR");

      /**
       * ⚠️⚠️⚠️ ⛔ E ⛔ **⛔ NENHUMA** DAS QUATRO PALAVRAS PROIBIDAS.
       *
       * ⛔ Autor, 2026-09-07: *"⛔ Não chamar de: seguro; recomendado
       * rotineiramente; liberado; contraindicado."*
       */
      const bloco = page.getByTestId("avc-g-antitromboticos");
      await expect(bloco).not.toContainText(/seguro/i);
      await expect(bloco).not.toContainText(/rotineir/i);
      await expect(bloco).not.toContainText(/liberad/i);
      await expect(bloco).not.toContainText(/contraindicad/i);

      /** ⚠️⚠️ ⛔ E *«Não»* ⛔ desfaz a exceção — ⛔ o julgamento é revisável. */
      await page.getByTestId("avc-opcao-condicao_concomitante_antiagregante-nao").click();
      await expect(
        page.getByTestId("avc-g-antitrombotico-estado-excecao_precoce_pode_ser_considerada")
      ).toHaveCount(0);
    });

  /* ══ ⚠️⚠️⚠️ A ASPIRINA IV DOS 90 min É OUTRA REGRA ══════════════════ */

  test("⛔ a regra dos 90 min aparece separada, ⛔ com COR 3: Harm — ⛔ e ⛔ não se funde com a das 24 h",
    async ({ page }) => {
      await abrir(page);
      await registrarIvt(page);
      await aba(page, "destino");

      /**
       * ⚠️⚠️ A trombólise acabou de ser registrada — ⛔ estamos **dentro** dos
       * 90 minutos ⛔ e **dentro** das 24 horas ⛔ ao mesmo tempo.
       */
      const noventa = page.getByTestId("avc-g-antitrombotico-aspirina-iv");
      await expect(noventa).toBeVisible();
      await expect(noventa).toContainText("COR 3: Harm");
      await expect(noventa).toContainText("LOE B-R");
      await expect(noventa).toContainText(/90 minutos/);
      /** ⚠️⚠️ ⛔ **IV**, ⛔ e ⛔ não a aspirina oral — ⛔ a fonte é específica. */
      await expect(noventa).toContainText(/Aspirina IV/);

      /**
       * ⚠️⚠️⚠️ ⛔ E AS DUAS CORREM **JUNTAS**: ⛔ o estado da imagem continua
       * sendo o das 24 h, ⛔ e a regra dos 90 min ⛔ não o substituiu.
       */
      await expect(page.getByTestId("avc-g-antitrombotico-estado-antes_da_imagem_controle"))
        .toBeVisible();
      /** ⚠️ ⛔ E ⛔ ela ⛔ NÃO é rotulada como *No Benefit* — ⛔ ali é **dano**. */
      await expect(noventa).not.toContainText(/No Benefit/);
    });

  /* ══ ⚠️⚠️ ⛔ SEM TROMBÓLISE, A REGRA ⛔ NÃO SE APLICA ═══════════════ */

  test("⛔ sem IVT registrada, o bloco antitrombótico ⛔ NÃO aparece",
    async ({ page }) => {
      await abrir(page);
      await aba(page, "destino");
      /**
       * ⚠️⚠️ ⛔ Aplicar a ordem pós-IVT a quem ⛔ não trombolisou é usar a
       * regra fora do contexto que a fonte define — ⛔ e ⛔ ausência de bloco
       * ⛔ aqui ⛔ não é pendência.
       */
      await expect(page.getByTestId("avc-g-antitromboticos")).toHaveCount(0);
    });
});
