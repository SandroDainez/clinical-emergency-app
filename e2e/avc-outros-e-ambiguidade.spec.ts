import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma } from "./helpers";

/**
 * PROMETE: que *"Outros"* aceite ser **escrito**, que o escrito ⛔ volte ⛔ ao
 *   reabrir, ⛔ e que a tela ⛔ **⛔ nunca** diga *"1 a resolver aqui"* ⛔ e
 *   *"nada espera por ação"* ⛔ ao mesmo tempo.
 *
 * NÃO PROMETE: que o que se escreve vire conduta. ⛔ ⛔ Ele ⛔ **⛔ não** vira —
 *   ⛔ e ⛔ há prova de nó medindo ⛔ isso (`test:avc-consumidores`).
 *
 * UNIVERSO: o módulo AVC servido do `dist`, em **375 px**.
 *
 * ── ⚠️⚠️⚠️ OS PEDIDOS (inspeção clínica, 2026-09-09) ────────────────────
 *
 * ⛔ ⛔ *"Onde tem outros tem que ter opção de adicionar quais outras o
 * usuário quiser adicionar escrevendo."*
 *
 * ⛔ ⛔ *"Aqui aparece 1 a resolver mas ⛔ não indica que tem que resolver,
 * ficou ambíguo."*
 */

test.use({ viewport: { width: 375, height: 812 } });

async function paciente(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-paciente").click();
  await expect(page.getByTestId("avc-superficie-paciente-conteudo")).toBeVisible();
}

test.describe("AVC · *«Outros»* se escreve, ⛔ e a tela ⛔ não se contradiz", () => {
  /* ══ ⚠️⚠️⚠️ 1 · *"OUTROS"* ABRE UMA CAIXA ══════════════════════════ */

  test("⛔ marcar *«Outros»* abre onde escrever, ⛔ e o escrito fica",
    async ({ page }) => {
      await paciente(page);

      const bloco = page.getByTestId("avc-bloco-abrir-comorbidades");
      if (await bloco.count()) await bloco.click();

      const campo = page.getByTestId("avc-campo-comorbidades");
      await campo.scrollIntoViewIfNeeded();

      /** ⛔ Fechada ⛔ antes do gesto: ⛔ ela ⛔ não ocupa a tela ⛔ sem motivo. */
      await expect(page.getByTestId("avc-outros-comorbidades")).toHaveCount(0);

      await page.getByTestId("avc-item-comorbidades-Outros").click();
      const caixa = page.getByTestId("avc-outros-comorbidades");
      await expect(caixa).toBeVisible();

      await caixa.fill("Doença de Chagas, hipotireoidismo");
      await caixa.blur();

      /** ⚠️ ⛔ E ⛔ o escrito entra ⛔ no resumo — ⛔ senão *"Outros"* ⛔ ficaria ⛔ no lugar da coisa. */
      await expect(page.getByTestId("avc-multipla-resumo-comorbidades")).toContainText(
        /Doença de Chagas/i
      );

      /** ⛔ E volta da **trilha** depois de sair ⛔ e voltar da tela. */
      await page.getByTestId("avc-aba-estabilizacao").click();
      await page.getByTestId("avc-aba-paciente").click();
      const bloco2 = page.getByTestId("avc-bloco-abrir-comorbidades");
      if (await bloco2.count()) await bloco2.click();
      await expect(page.getByTestId("avc-outros-comorbidades")).toHaveValue(
        /Doença de Chagas/
      );
    });

  /* ══ ⚠️⚠️⚠️ 2 · ⛔ ONDE ⛔ ELA ⛔ NÃO PODE EXISTIR ══════════════════ */

  /**
   * ⚠️⚠️ ⛔ ESTA É A TRAVA CLÍNICA DESTE ARQUIVO.
   *
   * ⛔ ⛔ `anticoagulante_em_uso` alimenta `derivacoes-d.ts`, ⛔ e
   * `antecedentes_intracranianos` vira **contraindicação** ⛔ opção por opção.
   * ⚠️ ⛔ Um *"outro anticoagulante"* digitado ⛔ **⛔ pareceria registrado ⛔ e
   * seria invisível ao portão** — ⛔ o pior defeito possível ⛔ neste módulo.
   */
  test("⛔ campo que alguém lê para decidir ⛔ NÃO oferece texto livre",
    async ({ page }) => {
      await paciente(page);
      /** ⚠️ ⛔ Os quatro de contraindicação mudaram de casa em 2026-09-07. */
      await page.getByTestId("avc-aba-neurologico").click();
      for (const id of ["anticoagulante_em_uso", "antecedentes_intracranianos"]) {
        await expect(
          page.getByTestId(`avc-outros-${id}`),
          `⛔ ${id} alimenta uma decisão ⛔ e ⛔ não pode aceitar texto livre`
        ).toHaveCount(0);
      }
    });

  /* ══ ⚠️⚠️⚠️ 3 · ⛔ NADA DE *"1 A RESOLVER"* COM *"NADA A FAZER"* ═══ */

  test("⛔ o que foi mandado para Correções **aparece** ⛔ em Correções",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);

      /** ⛔ 271 mg/dL — ⛔ hiperglicemia: pede conduta, ⛔ e ⛔ **⛔ não** bloqueia. */
      const glicemia = page.getByTestId("avc-num-caixa-glicemia");
      await glicemia.fill("271");
      await glicemia.blur();

      const atalho = page.getByText(/Abrir Correções/i).first();
      await atalho.click();
      const corpo = page.getByTestId("avc-superficie-e-conteudo");
      await expect(corpo).toBeVisible();

      const cabecalho = page.getByTestId("avc-fase-pendentes");
      const pendentes = (await cabecalho.innerText()).trim();

      /**
       * ⚠️⚠️ ⛔ A CONTRADIÇÃO MEDIDA: ⛔ se o cabeçalho conta ⛔ alguma coisa,
       * ⛔ o corpo ⛔ **⛔ não** pode dizer que ⛔ nada espera por ação.
       */
      if (/^[1-9]/.test(pendentes)) {
        await expect(
          corpo,
          `⛔ o cabeçalho diz "${pendentes}" ⛔ e o corpo diz que ⛔ nada espera por ação`
        ).not.toContainText(/Nada nesta tela espera por ação/i);

        /** ⛔ E o item ⛔ que o mandou para cá ⛔ está **⛔ na tela**. */
        await expect(corpo).toContainText(/Hiperglicemia/i);
      }
    });

  /* ══ ⚠️⚠️⚠️ 4 · RESPONDIDO ⛔ NÃO É PENDENTE ═══════════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09, ⛔ com captura de *"Falta responder ·
   * 1 · ⛔ Via aérea ⛔ ainda ⛔ não avaliada"*: *"aqui aponta algo que ⛔ **⛔ já
   * foi feito** como pendência"*.
   *
   * ⛔ ⛔ *"Incerto"* ⛔ e *"Não sei"* ⛔ **⛔ são respostas** — ⛔ alguém
   * perguntou ⛔ e ⛔ alguém respondeu (**E-37**). ⚠️ ⛔ A conclusão continua
   * impossível (**E-23**), ⛔ e ⛔ é ⛔ isso que ⛔ esta trava separa: ⛔ o que o
   * app **⛔ não pode concluir** ⛔ do que ⛔ ele **⛔ acusa de ⛔ não ter sido
   * feito**.
   */
  test("⛔ responder *«incerto»* tira da lista de *«falta responder»*",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);

      const corpo = page.getByTestId("avc-superficie-a-conteudo");

      /** ⛔ Antes: ⛔ ninguém perguntou — ⛔ e ⛔ isso **⛔ é** pendência. */
      await expect(corpo).toContainText(/Via aérea ainda não avaliada/i);

      /** ⛔ Agora o médico responde ⛔ os dois — ⛔ e ⛔ um deles ⛔ com incerteza. */
      await page.getByTestId("avc-campo-consciencia_rebaixada").scrollIntoViewIfNeeded();
      await page.getByTestId("avc-opcao-consciencia_rebaixada-nao_sei").click();
      await page.getByTestId("avc-campo-disfuncao_bulbar").scrollIntoViewIfNeeded();
      await page.getByTestId("avc-item-disfuncao_bulbar-Nenhum desses").click();

      /**
       * ⚠️⚠️ ⛔ ELE RESPONDEU. ⛔ A tela ⛔ **⛔ não pode** seguir dizendo que
       * ⛔ ele ⛔ não avaliou.
       */
      await expect(
        corpo,
        "⛔ respondido como incerto ⛔ continua sendo acusado de ⛔ não avaliado"
      ).not.toContainText(/Via aérea ainda não avaliada/i);

      /** ⛔ E o que ⛔ ela diz ⛔ é a verdade: ⛔ perguntado, ⛔ e ⛔ sem definição. */
      await expect(corpo).toContainText(/respondida como incerta/i);
    });

  /* ══ ⚠️⚠️⚠️ 5 · O GESTO ⛔ ESTÁ AO ALCANCE DO PROBLEMA ═════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"quando direciono para cá ⛔ e clico
   * ⛔ não acontece, ⛔ não abre opção para correção"*.
   *
   * ⛔ ⛔ **⛔ E o botão funcionava.** ⚠️ Medido ⛔ antes da correção: ⛔ ele
   * criava a ação ⛔ normalmente, ⛔ e estava **⛔ 2948 px abaixo** do título
   * do problema — ⛔ **⛔ 3,6 telas** de 812, ⛔ com o painel inteiro de
   * agentes ⛔ e doses no meio.
   *
   * ⚠️⚠️ ⛔ **⛔ Um controle que ⛔ ninguém alcança ⛔ é um controle que ⛔ não
   * existe.** ⛔ Por isso esta trava mede **distância**, ⛔ e ⛔ não
   * existência: ⛔ *"o botão está ⛔ no DOM"* ⛔ já era verdade ⛔ enquanto ⛔ ele
   * era inalcançável.
   */
  test("⛔ *«Registrar ação»* fica ⛔ ao alcance do problema que ⛔ ele resolve",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);

      /** ⛔ 210 × 120 — ⛔ acima da meta de 185 × 110 ⛔ para a trombólise. */
      for (const [id, v] of [["pas", "210"], ["pad", "120"]] as const) {
        const c = page.getByTestId(`avc-num-caixa-${id}`);
        await c.fill(v);
        await c.blur();
      }

      const atalho = page.getByText(/Corrigir a pressão arterial/i).first();
      if (await atalho.count()) await atalho.click();
      else await page.getByText(/Abrir Correções/i).first().click();
      await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();

      const bloco = await page
        .getByTestId("avc-e-bloqueio-pressao_acima_da_meta")
        .boundingBox();
      const botao = await page
        .getByTestId("avc-e-nova-acao-pressao_acima_da_meta")
        .boundingBox();
      expect(bloco, "⛔ o bloqueio da PA ⛔ não está na tela").not.toBeNull();
      expect(botao, "⛔ o botão de registrar ação ⛔ não está na tela").not.toBeNull();

      /**
       * ⚠️ ⛔ Uma tela de distância, ⛔ e ⛔ não quatro: ⛔ quem lê o problema
       * ⛔ tem de ver ⛔ o que fazer ⛔ sem atravessar a bula.
       */
      const distancia = botao!.y - bloco!.y;
      expect(
        distancia,
        `⛔ o gesto está a ${Math.round(distancia)} px do problema — ⛔ fora de alcance`
      ).toBeLessThan(812);

      /** ⚠️ ⛔ E ⛔ ele **⛔ faz** alguma coisa: ⛔ o clique cria a ação. */
      await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
      await expect(page.locator('[data-testid^="avc-e-acao-"]')).toHaveCount(1);
    });

  /* ══ ⚠️⚠️⚠️ 6 · O ALERTA MORA ⛔ ONDE ⛔ ELE FAZ SENTIDO ═════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"por que tem esse aviso aqui? ⛔ não
   * entendi"*.
   *
   * ⛔ ⛔ O alerta do esmolol ficava **⛔ solto**, depois de ⛔ todos os agentes:
   * a tela mostrava o esmolol ⛔ com a dose **⛔ certa** ⛔ e ⛔ então, ⛔ três
   * cartões abaixo, ⛔ avisava contra ⛔ um número que ⛔ ela ⛔ **⛔ nunca
   * ofereceu**.
   *
   * ⚠️ ⛔ Ele ⛔ **⛔ não** foi apagado — ⛔ o número perigoso existe ⛔ no mundo,
   * ⛔ impresso, ⛔ e ⛔ o aviso ⛔ é a defesa contra ⛔ ele.
   */
  test("⛔ o alerta do esmolol fica **dentro** do cartão do esmolol",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);
      for (const [id, v] of [["pas", "210"], ["pad", "120"]] as const) {
        const c = page.getByTestId(`avc-num-caixa-${id}`);
        await c.fill(v);
        await c.blur();
      }

      /**
       * ⚠️⚠️ ⛔ NA ESTABILIZAÇÃO ⛔ OS AGENTES NASCEM **⛔ ABERTOS** — 2026-09-12:
       * ⛔ este bloco ⛔ só existe ⛔ com bloqueio ativo, ⛔ e ⛔ é para onde o
       * card do eixo leva. ⚠️ ⛔ O alerta mora ⛔ dentro do cartão do esmolol,
       * ⛔ e ⛔ vê-lo **⛔ ao olhar o esmolol** ⛔ é o ponto de ⛔ ele ter saído
       * da nota solta. ⛔ Em **Correções**, ⛔ a gaveta de 09-09 continua.
       */
      const alerta = page.getByTestId("avc-a-alerta-esmolol").first();
      await expect(alerta).toBeVisible();

      /** ⚠️⚠️ ⛔ **⛔ DENTRO** do cartão do esmolol — ⛔ medido ⛔ na árvore. */
      const dentro = await alerta.evaluate((el) => {
        const cartao = el.closest('[data-testid*="agente-esmolol"]');
        if (cartao) return true;
        /** ⛔ Sem testID no cartão, ⛔ o pai imediato tem de falar de esmolol. */
        const pai = el.parentElement;
        return !!pai && /esmolol/i.test(pai.innerText);
      });
      expect(
        dentro,
        "⛔ o alerta está solto — ⛔ ele avisa contra uma dose que ⛔ não está ⛔ ao lado"
      ).toBe(true);

      /** ⚠️ ⛔ E ⛔ ele diz **⛔ de quem** é a ressalva, ⛔ e ⛔ qual o escopo dela. */
      await expect(alerta).toContainText(/Esmolol/i);
      await expect(alerta).toContainText(/e não do manual inteiro/i);
    });

  /* ══ ⚠️⚠️⚠️ 7 · ⛔ NÃO PEDIR O QUE ⛔ JÁ FOI FEITO ══════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"aqui mostra mandando registrar
   * exame que ⛔ **⛔ já está registrado**"*.
   *
   * ⛔ ⛔ A tabela de rótulos mandava `resultado_disponivel` ⛔ para a **mesma**
   * frase de `realizado_sem_resultado`: *"Registrar o resultado da
   * tomografia"* — ⛔ **⛔ depois** de o resultado ter sido registrado. ⚠️ ⛔ A
   * tela pedia ⛔ o que ⛔ ela ⛔ já tinha, ⛔ em vermelho.
   */
  test("⛔ com o resultado registrado, a linha da imagem ⛔ para de cobrar",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-imagem").click();
      await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();

      /** ⛔ Antes de ⛔ qualquer registro, ⛔ ela cobra — ⛔ e ⛔ deve cobrar. */
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(page.getByTestId("avc-prioridade-imagem-acao")).not.toContainText(
        /Ver o resultado/i
      );

      /** ⛔ Registra a TC ⛔ e o resultado, ⛔ pelo caminho do médico. */
      await page.getByTestId("avc-aba-imagem").click();
      const novoEstudo = page.getByTestId("avc-novo-estudo");
      if (await novoEstudo.count()) await novoEstudo.click();

      /**
       * ⚠️ ⛔ A **modalidade primeiro** — ⛔ a decisão do exame ⛔ só existe
       * ⛔ depois que o estudo diz **⛔ o que ⛔ ele é**. ⛔ Medido ⛔ na
       * árvore: ⛔ sem modalidade, ⛔ o campo do resultado ⛔ nem nasce.
       */
      await page
        .getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste")
        .click();

      const semHemorragia = page.getByTestId(
        "avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada"
      );
      await expect(
        semHemorragia,
        "⛔ o cenário mudou: ⛔ a decisão do exame ⛔ não está ⛔ na tela"
      ).toBeVisible();
      await semHemorragia.click();

      /**
       * ⚠️⚠️ ⛔ AGORA ⛔ ELA ⛔ NÃO PODE MAIS MANDAR REGISTRAR — ⛔ e ⛔ nem ficar
       * vermelha: ⛔ cor ⛔ tem de dizer ⛔ o mesmo que a palavra (**E-15**).
       */
      await page.getByTestId("avc-aba-neurologico").click();
      const acao = page.getByTestId("avc-prioridade-imagem-acao");
      await expect(
        acao,
        "⛔ manda registrar um resultado que ⛔ já está registrado"
      ).not.toContainText(/Registrar o resultado/i);
      await expect(acao).toContainText(/Ver o resultado/i);
    });

  /* ══ ⚠️⚠️⚠️ 8 · O ATALHO ⛔ NÃO LEVA AONDE ⛔ JÁ SE ESTÁ ════════════ */

  /**
   * ⚠️⚠️ ⛔ DECISÃO DO AUTOR, 2026-09-09: *"na aba neuro podemos tirar isso da
   * barra ⛔ já que tem ⛔ ao longo da aba para preenchimento"*.
   *
   * ⛔ ⛔ *"Definir · Última vez bem"* ⛔ era o botão mais chamativo do
   * cabeçalho ⛔ e levava ⛔ ao campo que está ⛔ **⛔ na própria tela**.
   * ⚠️ ⛔ Paciente ⛔ e Estabilização ⛔ já tinham saído ⛔ pela mesma razão.
   *
   * ⛔ ⛔ **⛔ E ⛔ ele ⛔ não some do atendimento** — ⛔ é ⛔ isso que a segunda
   * metade mede: **§7.8** proíbe perder o tempo de vista, ⛔ e ⛔ nas
   * superfícies em que a cronologia ⛔ não mora ⛔ o relógio ⛔ continua.
   */
  test("⛔ o relógio sai da barra ⛔ onde o campo mora, ⛔ e ⛔ fica onde ⛔ não mora",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      /** ⛔ Na Avaliação AVC ⛔ o campo está ⛔ na tela — ⛔ o atalho sobra. */
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(page.getByTestId("avc-superficie-b-conteudo")).toBeVisible();
      await expect(
        page.getByTestId("avc-campo-hora_ultima_vez_bem"),
        "⛔ o campo ⛔ não está ⛔ nesta tela — ⛔ aí o atalho ⛔ faria falta"
      ).toBeVisible();
      await expect(
        page.getByText(/^Última vez bem$/),
        "⛔ o cabeçalho ⛔ ainda oferece ir ⛔ para onde ⛔ já se está"
      ).toHaveCount(0);

      /** ⚠️ ⛔ E ⛔ onde a cronologia ⛔ não mora, ⛔ o relógio **⛔ continua**. */
      await page.getByTestId("avc-aba-imagem").click();
      await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();
      await expect(
        page.getByText(/^Última vez bem$/).first(),
        "⛔ perder o tempo de vista é o defeito que §7.8 proíbe"
      ).toBeVisible();
    });

  /* ══ ⚠️⚠️⚠️ 9 · O BOTÃO ÂMBAR ⛔ FAZ ALGUMA COISA ══════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"tem um botão em azul «corrigir
   * pressão arterial» mas quando clica nele ⛔ nada acontece, ⛔ está ⛔ sem
   * função"*.
   *
   * ⛔ ⛔ **⛔ O mesmo defeito das pendências, ⛔ noutro botão** — ⛔ e ⛔ eu
   * ⛔ tinha consertado ⛔ **⛔ só uma das duas cópias** da regra. ⚠️ ⛔ Esta
   * trava mede o botão ⛔ **⛔ de dentro das Correções**, ⛔ que é ⛔ onde ⛔ ele
   * era inerte ⛔ e ⛔ onde ⛔ nenhuma trava olhava.
   */
  test("⛔ *«Corrigir a pressão arterial»* age ⛔ até de dentro das Correções",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await abrirEixosDaEstabilizacao(page);
      for (const [id, v] of [["pas", "210"], ["pad", "120"]] as const) {
        const c = page.getByTestId(`avc-num-caixa-${id}`);
        await c.fill(v);
        await c.blur();
      }

      /** ⛔ Chega às Correções — ⛔ e ⛔ **⛔ fica** lá. */
      await page.getByTestId("avc-cockpit-bloqueio-acao-pressao_acima_da_meta").click();
      await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();

      /** ⛔ Vai para longe do bloco, ⛔ de propósito. */
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(300);
      const antes = await page
        .getByTestId("avc-e-bloqueio-pressao_acima_da_meta")
        .boundingBox();

      /**
       * ⚠️⚠️ ⛔ E TOCA ⛔ O MESMO BOTÃO **⛔ ESTANDO ⛔ NA TELA** — ⛔ era ⛔ aqui
       * que ⛔ ele ⛔ não fazia ⛔ nada.
       */
      await page.getByTestId("avc-cockpit-bloqueio-acao-pressao_acima_da_meta").click();
      await page.waitForTimeout(600);
      const depois = await page
        .getByTestId("avc-e-bloqueio-pressao_acima_da_meta")
        .boundingBox();

      expect(depois, "⛔ o bloco da PA sumiu").not.toBeNull();
      const altura = page.viewportSize()!.height;
      expect(
        depois!.y >= -1 && depois!.y < altura,
        `⛔ o botão ⛔ não levou até a correção: antes ${JSON.stringify(antes)}, depois ${JSON.stringify(depois)}`
      ).toBe(true);
    });

  /* ══ ⚠️⚠️⚠️ 10 · ⛔ UMA PROCEDÊNCIA POR CARTÃO ═════════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, 2026-09-09: *"aqui está misturando as coisas,
   * medido local com outro serviço"* ⛔ e *"aqui ⛔ já tem de outro serviço"*.
   *
   * ⛔ ⛔ O cartão *"NIHSS calculado **⛔ aqui**"* ⛔ oferecia, ⛔ dentro dele,
   * *"⛔ já tenho o total, medido **⛔ em outro serviço**"* — ⛔ duas
   * procedências ⛔ no mesmo cartão, ⛔ que é ⛔ o que este módulo separa
   * ⛔ desde 2026-08-29.
   *
   * ⚠️ ⛔ E a alternativa ⛔ **⛔ não sumiu**: ⛔ é ⛔ a segunda metade ⛔ que
   * mede ⛔ isso — ⛔ o bloco próprio ⛔ continua ⛔ na tela, ⛔ nomeado.
   */
  test("⛔ o NIHSS de fora ⛔ não é oferecido dentro do NIHSS *«calculado aqui»*",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-neurologico").click();
      const corpo = page.getByTestId("avc-superficie-b-conteudo");
      await expect(corpo).toBeVisible();

      await expect(
        page.getByTestId("avc-escala-informar-total-nihss_calculado"),
        "⛔ duas procedências ⛔ no mesmo cartão"
      ).toHaveCount(0);

      /** ⚠️ ⛔ E o caminho de fora ⛔ continua **⛔ existindo ⛔ e nomeado**. */
      await expect(corpo).toContainText(/NIHSS trazido de fora/i);
      await expect(corpo).toContainText(
        /Informação recebida da regulação, do SAMU ou de outro serviço/i
      );
    });

  /* ══ ⚠️⚠️⚠️ 11 · RESUMO ⛔ SÓ COM O QUE RESUMIR ════════════════════ */

  /**
   * ⚠️⚠️ ⛔ RELATO DO AUTOR, ⛔ em produção, 2026-09-09: *"⛔ nessa tela ⛔ ainda
   * ⛔ **⛔ não se calculou NIHSS** ⛔ e ⛔ também ⛔ **⛔ não tem resultado de
   * imagem**. ⛔ A imagem ⛔ aqui ⛔ está sendo **solicitada**"*.
   *
   * ⛔ ⛔ ⛔ **⛔ Terceira aparição ⛔ do mesmo defeito.** ⛔ O bloco ⛔ já tinha
   * saído ⛔ da abertura (2026-09-07) ⛔ e ⛔ da Estabilização (2026-09-08),
   * ⛔ com ⛔ **⛔ o mesmo motivo escrito** — *"um resumo de nada"*. ⚠️ ⛔ As
   * duas correções ⛔ prenderam a regra ⛔ a ⛔ **⛔ qual tela**, ⛔ e ⛔ não a
   * ⛔ **⛔ ter conteúdo** — ⛔ e ⛔ por isso ⛔ ele voltou.
   *
   * ⚠️ ⛔ Esta trava mede ⛔ a **⛔ regra**, ⛔ e ⛔ não ⛔ a lista de telas:
   * ⛔ **⛔ sem nada medido, ⛔ sem resumo**; ⛔ com algo medido, ⛔ ele
   * ⛔ aparece ⛔ **⛔ onde quer que seja**.
   */
  test("⛔ o resumo *«Escala e imagem»* ⛔ só existe ⛔ quando há o que resumir",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      /** ⛔ Nada registrado ⛔ ainda — ⛔ o resumo ⛔ não pode ⛔ ocupar a tela. */
      for (const aba of ["neurologico", "imagem", "seguranca"]) {
        await page.getByTestId(`avc-aba-${aba}`).click();
        await expect(
          page.getByTestId("avc-resumo"),
          `⛔ resumo de nada ⛔ na aba ${aba}: ⛔ dois travessões ⛔ ocupando o lugar do que se pede`
        ).toHaveCount(0);
      }

      /** ⚠️ ⛔ Agora ⛔ há NIHSS — ⛔ e ⛔ aí ⛔ ele **⛔ tem o que dizer**. */
      await page.getByTestId("avc-aba-neurologico").click();
      const caixa = page.getByTestId("avc-num-caixa-nihss_informado");
      if (await caixa.count()) {
        await caixa.fill("9");
        await caixa.blur();
        await page.getByTestId("avc-aba-imagem").click();
        await expect(
          page.getByTestId("avc-resumo"),
          "⛔ com NIHSS registrado, ⛔ o resumo ⛔ tem conteúdo ⛔ e ⛔ deve aparecer"
        ).toHaveCount(1);
      }
    });

  /* ══ ⚠️⚠️⚠️ 12 · ZERO É DADO, ⛔ E PEDIDO ⛔ NÃO É EXAME ═════════════ */

  /**
   * ⚠️⚠️ ⛔ PROVA **⛔ A** — pedida pelo autor ⛔ antes do deploy: *"registrar
   * `NIHSS = 0` ⛔ e provar que `Escala e imagem` aparece — ⛔ **⛔ zero é dado
   * clínico, ⛔ não ausência**"*.
   *
   * ⛔ ⛔ ⛔ É ⛔ o erro clássico ⛔ da condição: ⛔ `if (valor)` ⛔ em vez de
   * `valor === undefined` ⛔ faria ⛔ o zero ⛔ sumir ⛔ junto com ⛔ a
   * ausência. ⚠️ ⛔ E ⛔ **⛔ zero ⛔ é ⛔ a população da Table 4** (0–5) —
   * ⛔ o módulo ⛔ tem `zeroValido` ⛔ no conteúdo ⛔ exatamente ⛔ por isso
   * (**E-10**).
   */
  test("⛔ NIHSS **0** faz o resumo aparecer — ⛔ com `0`, ⛔ e ⛔ nunca travessão",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-neurologico").click();

      await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();
      /** ⛔ O gesto do médico: ⛔ o botão que registra **zero** ⛔ como resposta. */
      await page.getByTestId("avc-grandeza-zero-nihss_informado").click();

      await page.getByTestId("avc-aba-imagem").click();
      const resumo = page.getByTestId("avc-resumo");
      await expect(
        resumo,
        "⛔ zero foi lido como ausência — ⛔ o erro que `zeroValido` existe para impedir"
      ).toHaveCount(1);
      /**
       * ⚠️⚠️ ⛔ MEDIDO **⛔ NA PEÇA**, ⛔ e ⛔ não no texto colado — 2026-09-09.
       *
       * ⛔ ⛔ `innerText` ⛔ do cartão ⛔ devolve *"NIHSS00–42"*: ⛔ o valor
       * ⛔ **⛔ 0** ⛔ e a faixa ⛔ **⛔ 0–42** ⛔ ficam grudados, ⛔ e ⛔ `\b0\b`
       * ⛔ não casa. ⚠️ ⛔ O `0` ⛔ **⛔ está lá** — ⛔ quem errou ⛔ foi a
       * medida.
       *
       * ⛔ ⛔ A peça tem `testID` próprio: ⛔ medir ⛔ **⛔ ela** ⛔ diz ⛔ o que
       * ⛔ se quer saber ⛔ sem depender ⛔ de como ⛔ o DOM ⛔ junta texto.
       */
      const peca = page.getByTestId("avc-vital-nihss");
      await expect(peca).toContainText("NIHSS");
      await expect(
        peca,
        "⛔ zero virou travessão — ⛔ ausência ⛔ e ⛔ resposta ⛔ viraram a mesma coisa"
      ).not.toContainText("—");
      const texto = (await peca.innerText()).replace(/\s+/g, " ");
      expect(texto, `⛔ a peça do NIHSS ⛔ não mostra o zero: ${texto}`).toMatch(/(^|[^0-9])0([^0-9]|$)/);
    });

  /**
   * ⚠️⚠️ ⛔ PROVA **⛔ B** — ⛔ e ⛔ ela mede ⛔ **⛔ a regra**, ⛔ e ⛔ não ⛔ a
   * expectativa inicial.
   *
   * ⛔ ⛔ O pedido do autor ⛔ era provar que ⛔ o bloco aparecesse ⛔ *"com
   * linguagem de solicitação"*. ⚠️ ⛔ A medida mostrou ⛔ que ⛔ a linguagem
   * ⛔ **⛔ já existe**, ⛔ e ⛔ noutro canal: ⛔ a linha compacta ⛔ passa de
   * *"Solicitar a tomografia"* ⛔ para *"Registrar o exame"* ⛔ quando ⛔ o
   * pedido é registrado.
   *
   * ⛔ ⛔ ⛔ **⛔ Decisão do autor, ⛔ depois da medida:** ⛔ o resumo ⛔ **⛔ não**
   * aparece ⛔ só com o pedido. ⚠️ *"O pedido tem um canal próprio, o exame
   * tem outro estado, ⛔ e ⛔ o resumo ⛔ não vira ⛔ depósito de estados
   * incompletos."*
   *
   * ⛔ ⛔ **⛔ Pedido ⛔ não é exame; ⛔ exame ⛔ não é laudo.** ⛔ Os três
   * degraus ⛔ ficam medidos ⛔ abaixo, ⛔ em ordem.
   */
  test("⛔ pedido ⛔ não é exame, ⛔ exame ⛔ não é laudo — ⛔ e o resumo respeita isso",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-imagem").click();

      /* ── 1 · ⛔ só o PEDIDO ────────────────────────────────────────── */
      await page.getByTestId("avc-hora-hora_solicitacao_imagem").click();
      await page.getByText("Agora", { exact: true }).click();
      await page.getByText("Confirmar", { exact: true }).click();
      await expect(page.getByTestId("avc-hora-valor-hora_solicitacao_imagem")).toContainText(/\d/);

      await expect(
        page.getByTestId("avc-resumo"),
        "⛔ pedido ⛔ não é achado: ⛔ o resumo mostraria `Imagem —` ⛔ ao lado de um pedido"
      ).toHaveCount(0);

      /* ── 2 · ⛔ e a linha compacta **⛔ reconhece** o pedido ────────── */
      await page.getByTestId("avc-aba-neurologico").click();
      const acao = page.getByTestId("avc-prioridade-imagem-acao");
      await expect(acao, "⛔ o pedido registrado ⛔ não mudou a chamada").toContainText(
        /Registrar o exame/i
      );
      /** ⚠️⚠️ ⛔ E ⛔ **⛔ nada** de laudo ⛔ neste degrau. */
      await expect(
        acao,
        "⛔ pedido virou resultado ⛔ na linguagem da tela"
      ).not.toContainText(/resultado|laudo/i);

      /* ── 3 · ⛔ com o EXAME registrado, ⛔ o resumo **⛔ pode** existir ─ */
      await page.getByTestId("avc-aba-imagem").click();
      await page.getByTestId("avc-novo-estudo").click();

      /**
       * ⚠️⚠️ ⛔ O ESTUDO NASCE **⛔ SEM MODALIDADE** — ⛔ e ⛔ isso ⛔ é um
       * degrau, ⛔ não ⛔ um detalhe.
       *
       * ⛔ ⛔ Medido: ⛔ com o estudo criado ⛔ e ⛔ ainda ⛔ sem modalidade, ⛔ a
       * linha ⛔ **⛔ continua** dizendo *"Registrar o exame"* ⛔ e ⛔ o resumo
       * ⛔ **⛔ ainda ⛔ não existe**. ⚠️ ⛔ Faz sentido: ⛔ um estudo ⛔ sem
       * modalidade ⛔ **⛔ não é ⛔ uma tomografia** — ⛔ e ⛔ o módulo ⛔ recusa
       * ⛔ chamá-lo ⛔ assim.
       */
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(
        page.getByTestId("avc-prioridade-imagem-acao"),
        "⛔ estudo sem modalidade ⛔ virou tomografia"
      ).toContainText(/Registrar o exame/i);
      await expect(page.getByTestId("avc-resumo")).toHaveCount(0);

      await page.getByTestId("avc-aba-imagem").click();
      await page
        .getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste")
        .click();
      await expect(
        page.getByTestId("avc-resumo"),
        "⛔ com exame registrado, ⛔ o resumo ⛔ tem o que resumir"
      ).toHaveCount(1);
      /** ⛔ E ⛔ ainda ⛔ **⛔ sem** laudo: ⛔ a chamada pede ⛔ o resultado. */
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(page.getByTestId("avc-prioridade-imagem-acao")).toContainText(
        /Registrar o resultado/i
      );
      await page.getByTestId("avc-aba-imagem").click();

      /* ── 4 · ⛔ com o RESULTADO, ⛔ o texto evolui ⛔ sem confundir ──── */
      await page
        .getByTestId("avc-opcao-estudo_resultado-Sem hemorragia intracraniana identificada")
        .click();
      /**
       * ⚠️ ⛔ A linha compacta ⛔ **⛔ não existe ⛔ na Investigação** — ⛔ ela é
       * o atalho ⛔ *para* a imagem, ⛔ e ⛔ dentro dela ⛔ seria ⛔ um atalho
       * ⛔ para ⛔ onde ⛔ já se está. ⛔ Medir ⛔ noutra aba.
       */
      await page.getByTestId("avc-aba-neurologico").click();
      await expect(page.getByTestId("avc-prioridade-imagem-acao")).toContainText(
        /Ver o resultado/i
      );
      await expect(
        page.getByTestId("avc-prioridade-imagem-acao"),
        "⛔ com o resultado registrado, ⛔ a tela ⛔ ainda manda registrá-lo"
      ).not.toContainText(/Registrar o resultado/i);
    });
});
