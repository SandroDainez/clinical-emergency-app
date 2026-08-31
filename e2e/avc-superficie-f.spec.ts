import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície F se COMPORTE na largura de celular como a proposta
 * aprovada — duas raias sempre visíveis, faltas agrupadas pelo dado, dívida de
 * fonte compacta e distinta, relógios nomeados, ⛔ e ⛔ nenhuma rolagem lateral.
 *
 * NÃO PROMETE: que a ordem esteja certa (isso é `prova-avc-apresentacao-f`, que
 * mede a função pura), ⛔ nem que a correspondência clínica esteja certa (isso é
 * `prova-avc-superficie-f`). Aqui se mede o que CHEGA À TELA.
 *
 * ⚠️ A largura é a do `playwright.config` — Pixel 7, o tamanho real de uso.
 */
async function abrirF(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-reperfusao").click();
  await expect(page.getByTestId("avc-superficie-f-conteudo")).toBeVisible();
}

test.describe("AVC · Reperfusão", () => {
  /**
   * ⚠️⚠️ A DECISÃO 2, MEDIDA NA TELA: as duas raias ⛔ NÃO somem ⛔ nem no
   * paciente vazio — é assim que a tela ⛔ não sugere sequência nem exclusão.
   */
  test("as duas raias e o paralelismo aparecem no paciente VAZIO", async ({ page }) => {
    await abrirF(page);
    await expect(page.getByTestId("avc-f-raia-ivt")).toBeVisible();
    await expect(page.getByTestId("avc-f-raia-evt")).toBeVisible();
    await expect(page.getByTestId("avc-f-paralelismo"))
      .toContainText(/uma não atrasa a outra/i);
  });

  /**
   * ⚠️⚠️ ⛔ NENHUMA RECOMENDAÇÃO APLICÁVEL NO VAZIO — a invariante do núcleo,
   * conferida onde o médico a veria.
   */
  test("⛔ o paciente vazio ⛔ NÃO tem recomendação aplicável", async ({ page }) => {
    await abrirF(page);
    await expect(page.getByTestId("avc-f-faixa-acao")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-faixa-aplicavel")).toHaveCount(0);
    await expect(page.getByTestId("avc-f-raia-evt-aplicaveis")).toHaveText("0");
  });

  /**
   * ⚠️⚠️ A DECISÃO 1 — o dado aparece UMA vez, ⛔ e ⛔ não uma por recomendação.
   *
   * ⛔ Este é o teste que reprova a tela que despeja 11 cartões repetindo a
   * mesma ausência.
   */
  test("a falta agrupa: o sítio da oclusão aparece UMA vez", async ({ page }) => {
    await abrirF(page);
    await expect(page.getByTestId("avc-f-falta-sitio_da_oclusao")).toHaveCount(1);
  });

  /**
   * ⚠️⚠️ A DECISÃO 5 — a frase clínica é o que se lê; a contagem vem atrás.
   */
  test("a falta fala em clínica, ⛔ e ⛔ não em quantas recomendações abre",
    async ({ page }) => {
      await abrirF(page);
      const linha = page.getByTestId("avc-f-falta-sitio_da_oclusao");
      await expect(linha).toContainText(/opções endovasculares/i);
      /** ⚠️ O número existe — ⛔ e ⛔ não é a mensagem principal. */
      await expect(page.getByTestId("avc-f-falta-quantas-sitio_da_oclusao"))
        .toContainText(/recomendações dependem deste dado/i);
    });

  /**
   * ⚠️⚠️ A DECISÃO 3 — dívida compacta, ⛔ e a explicação SÓ ao tocar.
   */
  test("a dívida F-31 é curta na tela e explica ao ser tocada", async ({ page }) => {
    await abrirF(page);
    const cartao = page.getByTestId("avc-f-divida-ivt_lvo_sem_evt");
    await expect(cartao).toContainText(/Critério não definido pela fonte/i);
    /** ⚠️ Fechada, ⛔ ela ⛔ NÃO ocupa a tela com a explicação inteira. */
    await expect(page.getByTestId("avc-f-divida-detalhe-ivt_lvo_sem_evt")).toHaveCount(0);
    await cartao.click();
    await expect(page.getByTestId("avc-f-divida-detalhe-ivt_lvo_sem_evt"))
      .toContainText(/não é dado faltando do paciente, e não é falha do app/i);
  });

  /**
   * ⚠️⚠️ E-52 NA TELA: ⛔ sem peso ⛔ e ⛔ sem agente, ⛔ NÃO SAI NÚMERO.
   */
  test("⛔ a dose ⛔ NÃO aparece sem peso, e o cálculo se diz ⛔ não-administração",
    async ({ page }) => {
      await abrirF(page);
      await expect(page.getByTestId("avc-f-dose-vazia")).toContainText(/não estima peso/i);
      await expect(page.getByTestId("avc-f-dose-valor")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-dose")).toContainText(/não é administração/i);
    });

  /**
   * ⚠️⚠️ O AGENTE É DECISÃO, ⛔ E ESCOLHER ⛔ NÃO É ADMINISTRAR.
   */
  test("escolher o agente ⛔ não produz dose enquanto ⛔ não houver peso",
    async ({ page }) => {
      await abrirF(page);
      await page.getByTestId("avc-f-agente-Tenecteplase").click();
      await expect(page.getByTestId("avc-f-dose-valor")).toHaveCount(0);
      await expect(page.getByTestId("avc-f-agente"))
        .toContainText(/Escolher não significa administrar/i);
    });

  /**
   * ⚠️⚠️ E-36 NA TELA — o relógio tem NOME, ⛔ e ⛔ não há "a janela".
   */
  test("todo prazo aparece com o nome do seu marco", async ({ page }) => {
    await abrirF(page);
    /** ⚠️ Os relógios vivem DENTRO do cartão — abre-se o da dívida para vê-los. */
    await page.getByTestId("avc-f-divida-ivt_wakeup_ou_45_9").click();
    await expect(page.getByTestId("avc-f-relogio-last_known_well-1"))
      .toContainText(/Última vez visto bem/i);
  });

  /**
   * ⚠️⚠️ O CASO MAIS DIFÍCIL NA TELA: UMA recomendação, DOIS relógios, com
   * marcos e faixas diferentes — empilhados, ⛔ e ⛔ nunca fundidos.
   */
  test("a recomendação de wake-up mostra os DOIS relógios, separados",
    async ({ page }) => {
      await abrirF(page);
      await page.getByTestId("avc-f-divida-ivt_wakeup_ou_45_9").click();
      await expect(page.getByTestId("avc-f-relogio-midpoint_of_sleep-0")).toBeVisible();
      await expect(page.getByTestId("avc-f-relogio-last_known_well-1")).toBeVisible();
    });

  /**
   * ⚠️⚠️ O ACHADO DA REVISÃO EM CELULAR: ⛔ sem este aviso, o paciente vazio
   * ⛔ não mostrava relógio ⛔ NENHUM — e tempo é o dado mais urgente do AVC.
   */
  test("⛔ sem relógio correndo, a tela DIZ isso — ⛔ e ⛔ sem contador global",
    async ({ page }) => {
      await abrirF(page);
      const aviso = page.getByTestId("avc-f-sem-relogio");
      await expect(aviso).toContainText(/Nenhum relógio iniciado/i);
      /** ⛔ ⛔ Nenhum número: ⛔ contador global é exatamente o que ⛔ não pode existir. */
      await expect(aviso).not.toContainText(/\d/);
    });

  /**
   * ⚠️⚠️ O QUINTO MARCO APARECE SÓ NO CONTEXTO — ⛔ e ⛔ não polui A.
   */
  test("⛔ o meio do sono ⛔ NÃO aparece sem contexto de wake-up",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await expect(page.getByTestId("avc-campo-acordou_com_deficit")).toBeVisible();
      await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toHaveCount(0);
    });

  /**
   * ⚠️⚠️ ⛔ INÍCIO DESCONHECIDO SOZINHO ⛔ NÃO É WAKE-UP — o paciente pode ter
   * estado acordado com início ⛔ não testemunhado, ⛔ e aí a pergunta sobre
   * sono ⛔ não faz sentido ⛔ nenhum.
   */
  test("⛔ início desconhecido SEM sono ⛔ NÃO revela o meio do sono",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await page.getByTestId("avc-hora-desconhecido-hora_inicio_observado").click();
      await page.getByTestId("avc-opcao-acordou_com_deficit-nao").click();
      await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toHaveCount(0);
    });

  /**
   * ⚠️⚠️ ⛔ E APARECE quando o início ⛔ NÃO foi observado — que é o recorte em
   * que perguntar pelo sono faz sentido.
   */
  test("acordar COM O DÉFICIT revela o meio do sono em A", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();
    await page.getByTestId("avc-opcao-acordou_com_deficit-sim").click();
    await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toBeVisible();
  });

  /** ⚠️ E-02: incerteza ⛔ não abre o marco, ⛔ e a pergunta continua na tela. */
  test("⛔ 'Incerto' ⛔ NÃO abre o marco, ⛔ e ⛔ não esconde a pergunta",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");
      await page.getByTestId("avc-aba-estabilizacao").click();
      await page.getByTestId("avc-opcao-acordou_com_deficit-nao_sei").click();
      await expect(page.getByTestId("avc-campo-hora_meio_do_sono")).toHaveCount(0);
      await expect(page.getByTestId("avc-campo-acordou_com_deficit")).toBeVisible();
    });

  /**
   * ⚠️⚠️ F CONSOME O MARCO DE A — ⛔ e os DOIS relógios da recomendação de
   * wake-up seguem separados, com marcos e faixas próprias.
   */
  test("F lê o meio do sono de A, ⛔ sem fundir com a última vez bem",
    async ({ page }) => {
      await abrirF(page);
      await page.getByTestId("avc-f-divida-ivt_wakeup_ou_45_9").click();
      const meio = page.getByTestId("avc-f-relogio-midpoint_of_sleep-0");
      const lkw = page.getByTestId("avc-f-relogio-last_known_well-1");
      await expect(meio).toContainText(/Meio do sono/i);
      await expect(lkw).toContainText(/Última vez visto bem/i);
      /** ⚠️ Faixas DIFERENTES na mesma recomendação — a prova de que ⛔ não fundiram. */
      await expect(meio).toContainText("9 h");
      await expect(lkw).toContainText("4,5–9 h");
      /** ⚠️ E cada um leva ao SEU campo, ⛔ não ao do outro. */
      await expect(page.getByTestId("avc-f-relogio-registrar-midpoint_of_sleep")).toBeVisible();
    });

  /**
   * ⚠️⚠️ RESPONDER MUDA A TELA — o teste que faltava.
   *
   * ⛔ Todos os outros mediam o paciente VAZIO. Com isso, uma derivação que
   * ⛔ nunca reconhecesse resposta ⛔ nenhuma passaria verde — e foi o que
   * aconteceu: as comparações usavam o rótulo, ⛔ e a tela grava o slug.
   *
   * ⚠️ Este percorre o caminho inteiro: responder em C → a falta some da lista
   * de F. É a prova de que o dado ATRAVESSA.
   */
  test("responder um critério de imagem em C tira a falta da lista em F",
    async ({ page }) => {
      await abrirF(page);
      /** ⚠️ O critério de RM vive na cauda recolhida — abre-se para vê-lo. */
      await page.getByTestId("avc-f-faltas-resto").click();
      await expect(page.getByTestId("avc-f-falta-dwi_menor_que_um_terco")).toHaveCount(1);

      await page.getByTestId("avc-aba-imagem").click();
      /** ⚠️ Achado vive DENTRO de um estudo — sem a modalidade, ⛔ nada aparece. */
      await page.getByTestId("avc-novo-estudo").click();
      await page.getByTestId("avc-opcao-estudo_modalidade-Ressonância magnética").click();
      await page.getByTestId("avc-opcao-dwi_menor_que_um_terco-sim").click();

      await page.getByTestId("avc-aba-reperfusao").click();
      await page.getByTestId("avc-f-faltas-resto").click();
      await expect(page.getByTestId("avc-f-falta-dwi_menor_que_um_terco")).toHaveCount(0);
    });

  /**
   * ⚠️⚠️ E RESPONDER "NÃO" ⛔ NÃO É O MESMO QUE ⛔ NÃO RESPONDER (E-02).
   */
  test("negar o critério tira a recomendação da população, ⛔ e ⛔ não a deixa pendente",
    async ({ page }) => {
      await abrirF(page);
      await page.getByTestId("avc-aba-imagem").click();
      await page.getByTestId("avc-novo-estudo").click();
      /** ⚠️ Efeito de massa é achado de TC sem contraste — ⛔ não de RM. */
      await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
      await page.getByTestId("avc-opcao-efeito_de_massa-sim").click();
      await page.getByTestId("avc-aba-reperfusao").click();
      /** ⚠️ Efeito de massa PRESENTE contradiz a população que pede ausência. */
      await expect(page.getByTestId("avc-f-fora-abrir")).toBeVisible();
    });

  /**
   * ⚠️⚠️ LARGURA DE CELULAR: ⛔ NENHUMA ROLAGEM LATERAL.
   *
   * ⛔ Rolagem horizontal em tela de emergência esconde conteúdo sem avisar —
   * e as duas raias lado a lado são exatamente o lugar onde isso apareceria.
   */
  test("⛔ a tela ⛔ NÃO rola para o lado na largura do aparelho", async ({ page }) => {
    await abrirF(page);
    const estouro = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(estouro).toBeLessThanOrEqual(1);
  });

  /**
   * ⚠️ ALVO DE TOQUE: ⛔ nada abaixo de 44 px de altura — uma mão, três da manhã.
   */
  test("as linhas de falta são tocáveis com o polegar", async ({ page }) => {
    await abrirF(page);
    const caixa = await page.getByTestId("avc-f-falta-sitio_da_oclusao").boundingBox();
    expect(caixa!.height).toBeGreaterThanOrEqual(44);
  });

  /**
   * ⚠️⚠️ A NAVEGAÇÃO LEVA AO CAMPO CERTO — insumo ⛔ não é campo, ⛔ e tocar
   * ⛔ não pode ser um gesto que ⛔ não faz nada.
   */
  test("tocar a falta abre a superfície onde o dado se responde", async ({ page }) => {
    await abrirF(page);
    await page.getByTestId("avc-f-falta-sitio_da_oclusao").click();
    await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();
  });

  /**
   * ⚠️⚠️ A PALAVRA PROIBIDA — COR 3 da fonte ⛔ NUNCA vira "contraindicado".
   */
  test("⛔ a tela ⛔ NUNCA escreve contraindicado", async ({ page }) => {
    await abrirF(page);
    const texto = await page.getByTestId("avc-superficie-f-conteudo").innerText();
    expect(texto).not.toMatch(/contraindicad/i);
  });
});
