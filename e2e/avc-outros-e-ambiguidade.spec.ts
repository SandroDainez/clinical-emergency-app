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
       * ⚠️ ⛔ Os agentes nascem **fechados** desde 2026-09-09 — ⛔ o alerta
       * mora ⛔ dentro do cartão do esmolol, ⛔ então ⛔ é preciso abrir a
       * gaveta. ⛔ Ver ⛔ o alerta **⛔ quando se olha o esmolol** ⛔ é
       * ⛔ exatamente ⛔ o ponto de ⛔ ele ter saído da nota solta.
       */
      await page.getByTestId("avc-a-agentes-abrir").first().click();

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
});
