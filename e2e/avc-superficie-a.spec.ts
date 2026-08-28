import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície A tenha COMPORTAMENTO, não apenas campos.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-a.cjs`
 * — aqui mede-se o que só a tela pode mostrar: que o fato entra no estado
 * compartilhado, que a derivação recalcula à vista, e que os três vazios são
 * distinguíveis olhando (E-37).
 *
 * ⚠️ ESTE ARQUIVO MUDOU COM AS CORREÇÕES DE UX DE 2026-08-28, e a mudança
 * mais importante é conceitual: a tela deixou de escrever a frase LONGA da
 * leitura e passou a escrever a curta, com a frase completa, os insumos e o
 * slot de fonte atrás do ⓘ. Onde o teste antes lia o texto longo direto, agora
 * ele ABRE o ⓘ — porque é lá que E-22 e E-30 continuam sendo cumpridos.
 */
async function abrirA(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-estabilizacao").click();
  await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
}

/** Abre o ⓘ de uma leitura e devolve o painel de rastreabilidade. */
async function detalheDaLeitura(page: Page, id: string) {
  await page.getByTestId(`avc-info-leitura-${id}`).click();
  return page.getByTestId(`avc-detalhe-leitura-${id}`);
}

/** Move a barra de uma grandeza pelo −/+, que grava ao toque. */
async function ajustar(page: Page, campo: string, vezes: number) {
  for (let i = 0; i < vezes; i += 1) {
    await page.getByTestId(`avc-grandeza-${campo}-mais`).click();
  }
}

test.describe("Superfície A — estabilização", () => {
  test("o fato entra no estado e a leitura recalcula à vista", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // Antes: a leitura de oxigênio não pode concluir nada.
    await expect(page.getByTestId("avc-leitura-curto-oxigenio"))
      .toContainText(/ainda não informada/i);

    await page.getByTestId("avc-opcao-hipoxia-sim").click();

    // Depois: recalculou, e a meta declarada pela fonte aparece.
    await expect(page.getByTestId("avc-leitura-curto-oxigenio")).toContainText(/94/);
  });

  test("SpO₂ sozinha não gera indicação de oxigênio", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // Sobe a SpO₂ com o ajuste fino — sem tocar em hipoxemia.
    await ajustar(page, "spo2", 3);

    // ⚠️ 94% é META na presença de hipóxia, ⛔ não corte diagnóstico.
    await expect(page.getByTestId("avc-leitura-curto-oxigenio"))
      .toContainText(/hipoxemia ainda não/i);
  });

  test("glicemia não informada aparece como desconhecida, não como normal", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-leitura-curto-hipoglicemia"))
      .toContainText(/ainda não informada/i);
    // ⚠️ E a frase que nomeia o erro continua existindo, atrás do ⓘ.
    await expect(await detalheDaLeitura(page, "hipoglicemia"))
      .toContainText(/desconhecida não é normal/i);
  });

  test("os três vazios são distinguíveis olhando", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const naoSei = page.getByTestId("avc-opcao-crise_no_inicio-nao_sei");
    const nao = page.getByTestId("avc-opcao-crise_no_inicio-nao");

    // 1 · não perguntado: nenhuma opção marcada, e a leitura o diz.
    await expect(naoSei).toHaveAttribute("aria-checked", "false");
    await expect(nao).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("avc-leitura-curto-crise"))
      .toContainText(/ainda não informada/i);

    // 2 · "incerto" é RESPOSTA — a opção fica marcada, e ⛔ não vira "não".
    await naoSei.click();
    await expect(naoSei).toHaveAttribute("aria-checked", "true");
    await expect(nao).toHaveAttribute("aria-checked", "false");

    // 3 · a negativa é a terceira coisa, e move a leitura.
    await nao.click();
    await expect(nao).toHaveAttribute("aria-checked", "true");
    await expect(naoSei).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("avc-leitura-curto-crise")).toContainText(/Sem crise/i);
  });

  test("crise no início é contexto, e não exclui AVC", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-opcao-crise_no_inicio-sim").click();
    await expect(page.getByTestId("avc-leitura-curto-crise")).toContainText(/não exclui AVC/i);
    // ⛔ E a superfície continua inteira — crise não encerra nada.
    await expect(page.getByTestId("avc-campo-glicemia")).toBeVisible();
  });

  test("peso desconhecido não bloqueia a superfície", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/não atrasar/i);
    // Sem peso, todos os outros campos seguem utilizáveis.
    await page.getByTestId("avc-opcao-consciencia_rebaixada-sim").click();
    await expect(page.getByTestId("avc-leitura-curto-via_aerea"))
      .toContainText(/via aérea pode estar ameaçada/i);
  });

  test("a pressão é registrada sem definir candidatura", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await ajustar(page, "pas", 2);
    await ajustar(page, "pad", 2);
    await expect(page.getByTestId("avc-leitura-curto-pressao")).toContainText(/PA registrada/i);

    // ⛔ Nenhuma meta pressórica de candidato pode aparecer nesta superfície —
    // nem na frase curta, nem no detalhe.
    const detalhe = await detalheDaLeitura(page, "pressao");
    await expect(detalhe).toContainText(/depende do contexto/i);
    await expect(detalhe).not.toContainText(/185|trombóli|elegív/i);
  });

  test("navegar para outra superfície e voltar não apaga os fatos", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-opcao-hipoxia-sim").click();

    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-aba-estabilizacao").click();

    // ⚠️ E-20 pelo outro lado: navegar não registra, e também não desfaz.
    await expect(page.getByTestId("avc-leitura-curto-oxigenio")).toContainText(/94/);
  });

  test("a Superfície A fala espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();
    await expect(page.getByTestId("avc-campo-glicemia")).toContainText(/Glucemia/);
    await expect(page.getByTestId("avc-leitura-curto-hipoglicemia"))
      .toContainText(/Glucemia aún no informada/i);
  });
});

/**
 * ── AS SETE CORREÇÕES DE UX (testes visuais de 2026-08-28) ─────────────────
 *
 * ⚠️ Cada teste abaixo trava UM defeito que o app mostrou em uso, e não um
 * comportamento hipotético. Sem eles, a lógica continuaria correta e a tela
 * continuaria inutilizável — que foi exatamente o estado em que ela passou.
 */
test.describe("Superfície A — UX clínica", () => {
  /**
   * ⚠️⚠️ O DEFEITO MAIS GRAVE DOS SETE: a tela escrevia `1787922516903` onde
   * devia escrever `05:40`. Não é feiúra — é um horário ilegível no campo em
   * que o erro de leitura vira janela terapêutica errada.
   *
   * A trava varre a TELA INTEIRA, ⛔ não só o campo: um timestamp pode vazar
   * por qualquer caminho novo (resumo, pendência, detalhe), e é a ausência
   * dele em todo lugar que interessa.
   */
  test("nenhum timestamp cru aparece na tela", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    await page.getByTestId("avc-hora-hora_chegada").click();
    await page.getByTestId("avc-seletor-hora-confirmar").click();

    const tela = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    expect(tela, "época em milissegundos jamais pode chegar ao médico")
      .not.toMatch(/\b1[0-9]{12}\b/);
    // E o que aparece no lugar é hora legível.
    await expect(page.getByTestId("avc-hora-valor-hora_chegada"))
      .toHaveText(/^\d{2}:\d{2} ✎$/);
  });

  /**
   * ⚠️ "Registrar horário" gravava `agora` sem perguntar nada. Num campo
   * chamado "última vez visto bem" isso ⛔ não é atalho: é apagar seis horas
   * de evolução com um toque. O botão tem de ABRIR o seletor.
   */
  test("registrar horário abre seletor de hora e minuto, e o marco recua", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // ⚠️ Vazio convida à ação; a ausência já está dita pela falta do número.
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toHaveText(/^registrar$/i);

    await page.getByTestId("avc-hora-hora_ultima_vez_bem").click();
    await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();

    const antes = await page.getByTestId("avc-seletor-hora-valor").innerText();
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    const depois = await page.getByTestId("avc-seletor-hora-valor").innerText();
    expect(depois, "uma hora a menos precisa mudar o mostrador").not.toBe(antes);

    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toHaveText(/^\d{2}:\d{2} ✎$/);
  });

  /** ⛔ O seletor de tempo ⛔ não pode ser barra deslizante (§7.5). */
  test("o seletor de horário não usa barra deslizante", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-hora-hora_reconhecimento").click();
    const seletor = page.getByTestId("avc-seletor-hora");
    await expect(seletor).toBeVisible();
    expect(await seletor.locator('[role="slider"]').count()).toBe(0);
  });

  /** ⚠️ Cancelar ⛔ não pode gravar nada — o marco só existe se confirmado. */
  test("cancelar o seletor não registra horário", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-hora-hora_inicio_observado").click();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    await page.getByTestId("avc-seletor-hora-cancelar").click();
    await expect(page.getByTestId("avc-hora-valor-hora_inicio_observado"))
      .toHaveText(/^registrar$/i);
  });

  /**
   * ⚠️ Cinco grandezas, cinco barras. Só −/+ obrigava ~140 toques para chegar a
   * uma glicemia de 240 — na prática, o campo não seria preenchido.
   */
  test("toda grandeza tem barra, valor visível e ajuste fino", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    for (const campo of ["spo2", "pas", "pad", "glicemia", "peso"]) {
      const bloco = page.getByTestId(`avc-grandeza-${campo}`);
      await expect(bloco, `${campo} deveria ter barra`).toBeVisible();
      expect(await bloco.locator('[role="slider"]').count(), `barra de ${campo}`).toBe(1);
      await expect(page.getByTestId(`avc-grandeza-${campo}-menos`)).toBeVisible();
      await expect(page.getByTestId(`avc-grandeza-${campo}-mais`)).toBeVisible();
    }
  });

  /**
   * ⚠️⚠️ §0.2 na tela: a barra precisa de um número para desenhar, e esse
   * número ⛔ NÃO pode parecer uma medida. Peso alimenta dose de tenecteplase —
   * "70 kg" que ninguém pesou é a semente de uma dose errada.
   */
  test("grandeza intocada lê 'não informado', e o primeiro toque a informa", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const peso = page.getByTestId("avc-grandeza-peso");
    await expect(peso).toContainText(/não informado/i);
    await expect(peso, "unidade sem número sugere que existe número").not.toContainText("kg");

    await page.getByTestId("avc-grandeza-peso-mais").click();
    await expect(peso).not.toContainText(/não informado/i);
    await expect(peso).toContainText("kg");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/Peso informado/i);
  });

  /**
   * ⚠️ Nomes internos e slots de fonte competiam com a conduta pelo mesmo
   * espaço. ⛔ Não sumiram — E-22 e E-30 continuam obrigatórios; mudaram de
   * camada.
   */
  test("nome interno e slot de fonte ficam atrás do ⓘ, nunca na tela", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const tela = await page.getByTestId("avc-superficie-a-conteudo").innerText();
    expect(tela, "identificador interno não é linguagem clínica")
      .not.toMatch(/consciencia_rebaixada|peso_origem|crise_no_inicio/);
    expect(tela, "slot de fonte não disputa espaço com conduta").not.toMatch(/F-\d\d/);

    // E um toque devolve tudo: a frase completa, os insumos e a fonte.
    const detalhe = await detalheDaLeitura(page, "via_aerea");
    await expect(detalhe).toContainText("F-23");
    await expect(detalhe).toContainText(/Nível de consciência rebaixado/i);
    await expect(detalhe).toContainText(/decisão permanece do médico/i);
  });

  /**
   * ⚠️ A ORDEM É CLÍNICA (§7.3). Relógio primeiro porque corre sozinho; via
   * aérea logo depois porque mata em minutos; crise por último porque é
   * contexto. ⛔ Não é preferência estética.
   */
  test("a ordem visual é a ordem clínica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    const tela = await page.getByTestId("avc-superficie-a-conteudo").innerText();
    const ordem = ["RELÓGIOS", "VIA AÉREA E OXIGENAÇÃO", "PRESSÃO ARTERIAL", "GLICEMIA", "PESO", "CRISE NO INÍCIO", "ALERTAS"];
    const posicoes = ordem.map((t) => tela.toUpperCase().indexOf(t));
    expect(posicoes.every((p) => p >= 0), `faltou bloco: ${ordem.join(" | ")}`).toBe(true);
    expect(posicoes, "prioridade visual é prioridade clínica")
      .toEqual([...posicoes].sort((a, b) => a - b));
  });

  /** ⚠️ Alerta que pede ação vem antes de alerta que só informa. */
  test("alerta de atenção precede o meramente informativo", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    // Via aérea ameaçada é atenção; "sem crise no início" é informação.
    await page.getByTestId("avc-opcao-consciencia_rebaixada-sim").click();
    await page.getByTestId("avc-opcao-crise_no_inicio-nao").click();

    const tela = await page.getByTestId("avc-superficie-a-conteudo").innerText();
    expect(tela.indexOf("Via aérea pode estar ameaçada"))
      .toBeLessThan(tela.indexOf("Sem crise no início"));
  });

  /** ⚠️ A pergunta de hipoxemia ⛔ não pode voltar a ser "Há hipóxia?". */
  test("a pergunta de oxigenação é respondível à beira do leito", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    const campo = page.getByTestId("avc-campo-hipoxia");
    await expect(campo).toContainText("Há hipoxemia ou necessidade clínica de oxigênio?");
    // ⚠️ A saída se chama "Incerto": em achado que se examina agora, "não sei"
    // empurra para um "Não" apressado.
    await expect(campo).toContainText("Incerto");
    // ⛔ E a ajuda diz, na tela, que a fonte não define corte numérico.
    await expect(campo).toContainText(/não define um corte numérico/i);
  });
});
