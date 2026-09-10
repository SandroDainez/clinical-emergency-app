import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o veredito da trombectomia **mude junto com o gesto do médico**,
 *   ⛔ e que a palavra exibida acompanhe a **força da fonte**. ⛔ Preenche pela
 *   UI real — sítio, NIHSS, mRS, ASPECTS, PC-ASPECTS ⛔ e o horário de início —
 *   ⛔ e confere o que a Reperfusão passa a dizer.
 *
 * NÃO PROMETE: que os cortes clínicos estejam certos (isso é
 *   `prova-avc-fase9-evt`, que mede o motor contra os casos discriminatórios),
 *   ⛔ nem que ⛔ nenhuma outra tela tenha regredido.
 *
 *   ⛔ ⛔ E ⛔ **⛔ NÃO** promete estética: ⛔ overflow, contraste ⛔ e tamanho de
 *   toque ⛔ não se medem aqui.
 *
 * UNIVERSO: o módulo AVC servido do `dist`, na largura do `playwright.config`
 *   — Pixel 7, o tamanho real de uso.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ESTE ARQUIVO EXISTE ────────────────────────────────────
 *
 * ⚠️ Regra do autor: *"toda fase nova ⛔ ou refatorada precisa de pelo menos um
 * teste que execute o **gesto real do médico**"*.
 *
 * ⛔ ⛔ E a Fase 9 tem uma razão a mais: ⛔ a trava que diz *"a tela ⛔ não
 * recalcula"* é uma **varredura de texto**, ⛔ e varredura de texto ⛔ já passou
 * verde sobre defeito real cinco vezes nesta sessão. ⚠️ ⛔ O que ⛔ ela ⛔ não
 * pode fingir é ⛔ isto: ⛔ mudar o NIHSS de 14 para 5 ⛔ e a palavra na tela
 * mudar junto.
 */

const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}

/**
 * ⚠️ O horário de início, ⛔ **h horas atrás** — ⛔ e ⛔ nunca "agora" por
 * omissão: confirmar ⛔ sem mexer ⛔ não é permitido (§0.2).
 */
async function inicioHaHoras(page: Page, horas: number) {
  await page.getByTestId("avc-hora-hora_inicio_observado").click();
  for (let i = 0; i < horas; i += 1) {
    await page.getByTestId("avc-seletor-hora-h-menos").click();
  }
  /** ⚠️ Um minuto a menos garante que o marco ⛔ não fique **exatamente** no teto. */
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

/**
 * ⚠️ O bloco do NIHSS de fora nasce **recolhido**, ⛔ e volta a recolher quando
 * a aba é deixada. ⛔ `count()` ⛔ não espera — ⛔ é a checagem barata que evita
 * fechar por engano um bloco ⛔ já aberto.
 */
async function abrirNihssDeFora(page: Page) {
  if (await page.getByTestId("avc-num-mais-nihss_informado").count() === 0) {
    await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
  }
}

/**
 * ⚠️⚠️⚠️ ⛔ O GESTO REAL, ⛔ E ⛔ NÃO UM `fill` — ⛔ D-127, 2026-09-10.
 *
 * ⛔ ⛔ O `+` fino ⛔ nasce **⛔ inerte** ⛔ num campo intocado: ⛔ um `+1`
 * ⛔ partindo do nada ⛔ gravaria ⛔ o piso da faixa ⛔ como se fosse ⛔ medida
 * (§0.2). ⚠️ ⛔ Quem **⛔ parte** ⛔ é ⛔ o degrau — ⛔ que é ⛔ movimento
 * declarado — ⛔ ou ⛔ « Registrar 0 », ⛔ onde o zero ⛔ é resposta.
 *
 * ⛔ ⛔ É ⛔ assim ⛔ que ⛔ o médico faz: ⛔ o degrau ⛔ leva perto ⛔ em um toque,
 * ⛔ o `+` ⛔ acerta o número.
 */
async function nihssDeFora(page: Page, quantos: number) {
  await abrirNihssDeFora(page);
  let falta = quantos;
  while (falta >= 10) {
    await page.getByTestId("avc-degrau-nihss_informado-mais-10").click();
    falta -= 10;
  }
  if (falta > 0 && quantos < 10) {
    /** ⚠️ ⛔ Abaixo de um degrau, ⛔ o zero ⛔ é a partida — ⛔ e ⛔ ele é válido aqui. */
    await page.getByTestId("avc-grandeza-zero-nihss_informado").click();
  }
  for (let i = 0; i < falta; i += 1) {
    await page.getByTestId("avc-num-mais-nihss_informado").click();
  }
}

/** ⚠️ ⛔ Baixar o escore é o mesmo controle — ⛔ este campo ⛔ não tem correção. */
async function baixarNihss(page: Page, quantos: number) {
  await abrirNihssDeFora(page);
  for (let i = 0; i < quantos; i += 1) {
    await page.getByTestId("avc-num-menos-nihss_informado").click();
  }
}

async function novoExame(page: Page, modalidade: string) {
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId(`avc-opcao-estudo_modalidade-${modalidade}`).click();
}

/** ⚠️ Grandeza vazia ⛔ não aceita `+`: o primeiro valor é **digitado** (§0.2). */
async function digitar(page: Page, campo: string, valor: string) {
  await page.getByTestId(`avc-num-caixa-${campo}`).fill(valor);
  await page.getByTestId(`avc-num-caixa-${campo}`).blur();
}

test.describe("AVC · Fase 9 — veredito da trombectomia", () => {
  /* ══ ⚠️⚠️⚠️ GESTO REAL · CIRCULAÇÃO ANTERIOR ══════════════════════════ */

  test("M1 · NIHSS 14 · ASPECTS 8 · mRS 0 em <6 h → EVT recomendada, ⛔ e o NIHSS 5 derruba",
    async ({ page }) => {
      await abrir(page);

      // ── o relógio, o NIHSS e a funcionalidade prévia ──────────────────
      await aba(page, "neurologico");
      await inicioHaHoras(page, 2);
      await nihssDeFora(page, 14);
      await page.getByTestId("avc-abrir-mrs_previo").click();
      await page.getByTestId("avc-opcao-mrs_previo-0 · assintomático").click();
      /**
       * ⚠️⚠️ ⛔ O DÉFICIT INCAPACITANTE — ⛔ e ⛔ ele ⛔ não está aqui de enfeite:
       * ⛔ sem ⛔ ele o portão da **IVT** ⛔ não libera, ⛔ e a faixa de
       * *"⛔ não aguardar"* ⛔ não tem por que aparecer. ⚠️ ⛔ Um M1 com NIHSS 14
       * **tem** déficit incapacitante — ⛔ o gesto é o que o médico faria.
       */
      await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();

      // ── a imagem: o sítio e o ASPECTS ────────────────────────────────
      await aba(page, "imagem");
      await novoExame(page, "Angiotomografia");
      /** ⚠️ Onze opções ocupavam 682 px no celular — o campo nasce recolhido. */
      await page.getByTestId("avc-abrir-sitio_oclusao").click();
      await page.getByTestId("avc-opcao-sitio_oclusao-M1 da artéria cerebral média").click();

      await novoExame(page, "Tomografia de crânio sem contraste");
      await page.getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada").click();
      await digitar(page, "aspects", "8");

      // ── a consequência, na Reperfusão ────────────────────────────────
      await aba(page, "reperfusao");
      const raia = page.getByTestId("avc-f-evt");
      await expect(page.getByTestId("avc-f-evt-estado-recomendada")).toBeVisible();
      await expect(raia).toContainText(/EVT recomendada/);

      /**
       * ⚠️⚠️ ⛔ E A FORÇA VEM DA FONTE, ⛔ visível — ⛔ veredito ⛔ sem COR/LOE
       * ⛔ não se confere.
       */
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_1")).toContainText("COR 1");
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_1")).toContainText("LOE A");

      /**
       * ⚠️⚠️⚠️ O FUNDAMENTO TRAZ **OS FATOS DESTE PACIENTE**, ⛔ com valor.
       *
       * ⛔ ⛔ E ⛔ **⛔ nenhum** deles é recalculado pela tela: o *"14"* ⛔ e o
       * *"2h01"* saem prontos de `vereditoDaTrombectomia()`.
       */
      const fatos = page.getByTestId("avc-f-evt-fatos-evt_ant_1");
      await expect(fatos).toContainText("NIHSS 14");
      await expect(fatos).toContainText("ASPECTS 8");
      await expect(fatos).toContainText(/mRS prévio 0/);
      await expect(fatos).toContainText(/M1 da artéria cerebral média/);
      await expect(fatos).toContainText(/2h0\d/);

      /**
       * ⚠️⚠️ ⛔ E ⛔ NENHUMA POPULAÇÃO ALHEIA APARECE — ⛔ nem a de mRS 2, ⛔ nem
       * a de M2, ⛔ nem a basilar. ⛔ Antes da Fase 9, **cinco** apareciam.
       */
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_5")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_6")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_m2_dominante")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_m2_nao_dominante")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_1")).toHaveCount(0);
      /** ⚠️ ⛔ E ⛔ nem o PC-ASPECTS é cobrado de um paciente de circulação anterior. */
      await expect(page.getByTestId("avc-f-evt-falta-pc_aspects")).toHaveCount(0);

      /** ⚠️⚠️ AS DUAS FRENTES CONVIVEM — ⛔ e a faixa manda ⛔ **não esperar**. */
      await expect(page.getByTestId("avc-f-evt-sem-esperar"))
        .toContainText(/não aguardar resposta clínica/i);

      /* ── ⚠️⚠️⚠️ O GESTO QUE DERRUBA: NIHSS 14 → 5 ────────────────────── */

      await aba(page, "neurologico");
      /**
       * ⚠️ O controle do NIHSS de fora continua **vivo** — ⛔ o `−` baixa o
       * escore direto, ⛔ e ⛔ não há gesto de correção neste campo.
       *
       * ⛔ ⛔ (⛔ Minha primeira versão chamava `avc-corrigir-nihss_informado`
       * com `.catch()`. ⚠️ ⛔ O elemento ⛔ não existe, ⛔ e o `.catch()`
       * ⛔ **⛔ não** evita a espera: ⛔ o Playwright esperava 15 s por ⛔ nada
       * ⛔ e o teste estourava. ⛔ `.catch()` esconde o erro, ⛔ e ⛔ não o custo.)
       */
      await baixarNihss(page, 9);

      await aba(page, "reperfusao");
      /**
       * ⚠️⚠️ *"NIHSS score ≥6"* — ⛔ **5 ⛔ não fecha**, ⛔ e a tela ⛔ deixa de
       * dizer *"recomendada"*. ⚠️ ⛔ Esta é a linha que ⛔ nenhuma varredura de
       * texto poderia fingir.
       */
      await expect(page.getByTestId("avc-f-evt-estado-recomendada")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt")).not.toContainText(/EVT recomendada/);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_1")).toHaveCount(0);
    });

  /* ══ ⚠️⚠️ A FRONTEIRA DAS 6 h — ⛔ PELA UI ═══════════════════════════ */

  test("⛔ além de 6 h, quem sustenta ⛔ NÃO é mais a rec. 1 — ⛔ e sim a rec. 2",
    async ({ page }) => {
      await abrir(page);

      await aba(page, "neurologico");
      /** ⚠️⚠️ **7 horas** — ⛔ fora de *"within 6 hours"*, ⛔ dentro de *"6 to 24"*. */
      await inicioHaHoras(page, 7);
      await nihssDeFora(page, 14);
      await page.getByTestId("avc-abrir-mrs_previo").click();
      await page.getByTestId("avc-opcao-mrs_previo-0 · assintomático").click();

      await aba(page, "imagem");
      await novoExame(page, "Angiotomografia");
      await page.getByTestId("avc-abrir-sitio_oclusao").click();
      await page.getByTestId("avc-opcao-sitio_oclusao-M1 da artéria cerebral média").click();
      await novoExame(page, "Tomografia de crânio sem contraste");
      await page.getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada").click();
      await digitar(page, "aspects", "8");

      await aba(page, "reperfusao");
      /**
       * ⚠️⚠️ ⛔ A JANELA ⛔ NÃO É MAIS DECORATIVA: ⛔ ela **trocou a
       * recomendação**. ⛔ Antes da Fase 9, `janelas` ⛔ só desenhava relógio,
       * ⛔ e um paciente de 30 horas fechava a rec. 1 igual a um de duas.
       */
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_1")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_2")).toContainText("COR 1");
      await expect(page.getByTestId("avc-f-evt-estado-recomendada")).toBeVisible();
      await expect(page.getByTestId("avc-f-evt-fatos-evt_ant_2")).toContainText(/7h/);
    });

  /* ══ ⚠️⚠️⚠️ *No Benefit* ⛔ NÃO É BLOQUEIO DE SEGURANÇA ═══════════════ */

  /**
   * ── ⚠️⚠️ ⛔ POR QUE ISTO É e2e, ⛔ E ⛔ NÃO VARREDURA ────────────────────
   *
   * ⛔ ⛔ A trava estática recorta o arquivo da tela ⛔ e procura o estilo
   * crítico. ⚠️ ⛔ Na primeira versão ⛔ ela recortava a partir do `testID`,
   * ⛔ e o `style` ficava **acima** dele — ⛔ a mutação *"voltar
   * `vereditoContra`"* passou **verde**. ⛔ Sexta varredura de texto a furar
   * nesta sessão.
   *
   * ⚠️⚠️ ⛔ Aqui se mede **a cor que o navegador pintou**, ⛔ com o bloqueio de
   * segurança da IVT ⛔ e o *No Benefit* da EVT **na mesma tela** — ⛔ e ⛔ sem
   * ⛔ nenhum hexadecimal escrito no teste: ⛔ o que se afirma é que ⛔ elas
   * ⛔ **⛔ não são a mesma**.
   */
  test("⛔ o *No Benefit* da EVT ⛔ NÃO se pinta como o bloqueio de segurança da IVT",
    async ({ page }) => {
      await abrir(page);

      /** ⚠️ Uma contraindicação ⛔ **⛔ não corrigível** — o vermelho legítimo. */
      await aba(page, "imagem");
      await page.getByTestId("avc-nova-coleta").click();
      await page.getByTestId("avc-numerico-inr").fill("2,5");
      await page.getByTestId("avc-numerico-inr").blur();

      /** ⚠️ E, ⛔ ao mesmo tempo, um M2 ⛔ não dominante dentro de 6 h. */
      await aba(page, "neurologico");
      await inicioHaHoras(page, 2);
      await aba(page, "imagem");
      await novoExame(page, "Angiotomografia");
      await page.getByTestId("avc-abrir-sitio_oclusao").click();
      await page.getByTestId("avc-opcao-sitio_oclusao-M2 não dominante ou codominante").click();

      /**
       * ⚠️⚠️ ⛔ E O VEREDITO DA **IVT** EM COR 3 — ⛔ *"mild non-disabling"*
       * exige as **duas** propriedades, ⛔ e ⛔ é ⛔ ele que carrega o vermelho
       * crítico que o autor mandou tirar da EVT.
       */
      await aba(page, "neurologico");
      await page.getByTestId("avc-opcao-incapacitante_assumido-Não incapacitante").click();
      await page.getByTestId("avc-opcao-deficit_leve-Leve").click();

      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-f-portao-estado-bloqueado_seguranca")).toBeVisible();
      await expect(page.getByTestId("avc-f-veredito-tipo")).toContainText(/não recomenda/i);
      await expect(page.getByTestId("avc-f-evt-estado-nao_recomendada_sem_beneficio"))
        .toBeVisible();

      const cor = (testId: string, prop: string) =>
        page.getByTestId(testId).evaluate(
          (el, p) => getComputedStyle(el as Element).getPropertyValue(p as string),
          prop
        );

      /** ⚠️ O vermelho crítico, medido ⛔ onde ele é legítimo: o veredito da IVT. */
      const bordaIvt = await cor("avc-f-veredito", "border-top-color");
      const seloIvt = await cor("avc-f-veredito-tipo", "color");
      /** ⚠️ A cautela, medida no portão — ⛔ que é `warning` por decisão da Fase 6. */
      const bordaPortao = await cor("avc-f-portao", "border-top-color");
      const bordaEvt = await cor("avc-f-evt", "border-top-color");
      const seloEvt = await cor("avc-f-evt-estado-nao_recomendada_sem_beneficio", "color");

      /**
       * ⚠️⚠️⚠️ ⛔ NA MESMA TELA, AS TRÊS COISAS TÊM TRÊS TRATAMENTOS — ⛔ e ⛔ o
       * do *No Benefit* ⛔ **⛔ não** é o do bloqueio.
       */
      expect(bordaEvt).not.toBe(bordaIvt);
      expect(seloEvt).not.toBe(seloIvt);
      /** ⚠️⚠️ ⛔ E ⛔ ele é o de **cautela** — ⛔ e ⛔ não uma cor inventada. */
      expect(bordaEvt).toBe(bordaPortao);
      /** ⚠️ ⛔ Nenhuma é transparente — ⛔ *"diferente"* por ausência ⛔ não vale. */
      expect(bordaEvt).not.toMatch(/rgba\(0, 0, 0, 0\)/);
      expect(bordaIvt).not.toMatch(/rgba\(0, 0, 0, 0\)/);

      /**
       * ⚠️⚠️ ⛔ E O TEXTO OBRIGATÓRIO CONTINUA INTEIRO — ⛔ o ajuste foi ⛔ só
       * de cor.
       */
      const raia = page.getByTestId("avc-f-evt");
      await expect(raia)
        .toContainText(/EVT não recomendada para melhorar desfecho — No Benefit/);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_m2_nao_dominante"))
        .toContainText("COR 3: No Benefit");
      await expect(page.getByTestId("avc-f-evt-motivo-evt_m2_nao_dominante"))
        .toContainText("LOE A");
      await expect(raia).not.toContainText(/contraindicad/i);
      /** ⚠️ ⛔ E o símbolo do bloqueio ⛔ NÃO é emprestado. */
      await expect(raia).not.toContainText("⛔");
    });

  /* ══ ⚠️⚠️⚠️ GESTO REAL · CIRCULAÇÃO POSTERIOR ════════════════════════ */

  test("basilar · NIHSS 12 · PC-ASPECTS 7 → COR 1 · ⛔ e NIHSS 7 vira *⛔ não bem estabelecida*",
    async ({ page }) => {
      await abrir(page);

      await aba(page, "neurologico");
      await inicioHaHoras(page, 10);
      await nihssDeFora(page, 12);
      await page.getByTestId("avc-abrir-mrs_previo").click();
      await page.getByTestId("avc-opcao-mrs_previo-0 · assintomático").click();

      await aba(page, "imagem");
      await novoExame(page, "Angiotomografia");
      await page.getByTestId("avc-abrir-sitio_oclusao").click();
      await page.getByTestId("avc-opcao-sitio_oclusao-Artéria basilar ou circulação posterior").click();

      /**
       * ⚠️⚠️⚠️ O CAMPO QUE ⛔ **⛔ NÃO EXISTIA** — achado ao escrever este teste.
       *
       * ⛔ ⛔ `pc_aspects` era exigido pelas duas recomendações de basilar ⛔ e
       * ⛔ ⛔ **⛔ não estava em ⛔ nenhuma superfície**. ⚠️ ⛔ As duas ⛔ nunca
       * fechavam no app real, ⛔ e este gesto ⛔ era impossível.
       */
      await novoExame(page, "Tomografia de crânio sem contraste");
      await page.getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada").click();
      await digitar(page, "pc_aspects", "7");

      await aba(page, "reperfusao");
      await expect(page.getByTestId("avc-f-evt-estado-recomendada")).toBeVisible();
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_1")).toContainText("COR 1");
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_1")).toContainText("LOE A");
      await expect(page.getByTestId("avc-f-evt-fatos-evt_basilar_1"))
        .toContainText(/pc-ASPECTS 7/i);
      /** ⚠️ ⛔ E ⛔ nenhuma recomendação de circulação anterior encosta. */
      await expect(page.getByTestId("avc-f-evt-motivo-evt_ant_1")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_m2_nao_dominante")).toHaveCount(0);

      /* ── ⚠️⚠️⚠️ NIHSS 12 → 7: A PALAVRA MUDA COM A FORÇA DA FONTE ────── */

      await aba(page, "neurologico");
      await baixarNihss(page, 5);

      await aba(page, "reperfusao");
      /**
       * ⚠️⚠️⚠️ *"NIHSS score 6 to 9 … the effectiveness … **is not well
       * established**"* — ⛔ **⛔ nem sim ⛔ nem ⛔ não**.
       *
       * ⛔ ⛔ E ⛔ isso ⛔ **⛔ não** é *"pode ser razoável"*: ⛔ colapsar os dois
       * transformaria a basilar de NIHSS 6–9 numa indicação que a fonte
       * ⛔ ⛔ **⛔ não** deu.
       */
      await expect(page.getByTestId("avc-f-evt-estado-efetividade_nao_estabelecida"))
        .toBeVisible();
      await expect(page.getByTestId("avc-f-evt"))
        .toContainText(/não bem estabelecida/i);
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_2")).toContainText("COR 2b");
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_2")).toContainText("LOE B-R");
      /** ⚠️ ⛔ E a COR 1 **saiu** — ⛔ 7 ⛔ não é ≥10. */
      await expect(page.getByTestId("avc-f-evt-motivo-evt_basilar_1")).toHaveCount(0);
      /**
       * ⚠️⚠️ ⛔ E a tela ⛔ **⛔ NUNCA** escreve *"contraindicada"* — ⛔ COR 3
       * aqui é *No Benefit*, ⛔ e este caso ⛔ nem é COR 3.
       */
      await expect(page.getByTestId("avc-f-evt")).not.toContainText(/contraindicad/i);
    });
});
