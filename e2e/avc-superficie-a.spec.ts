import { expect, test, type Page } from "@playwright/test";

import { TODOS_OS_CAMPOS_A } from "../avc/conteudo/superficie-a";
import { fixarIdioma, HORA_EXIBIDA, HORA_EXIBIDA_MARCADA } from "./helpers";

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

/**
 * ⚠️ O react-native-web OMITE `aria-disabled` quando é falso — publica o
 * atributo só para desabilitar. Afirmar `="false"` daria vermelho eterno, e
 * afirmar a ausência dele como "habilitado" seria frouxo; por isso a asserção
 * de habilitado é **não-desabilitado**, e vem sempre acompanhada da prova de
 * COMPORTAMENTO (o clique faz, ou não faz, o que devia).
 */
async function esperaConfirmar(page: Page, desabilitado: boolean) {
  const b = page.getByTestId("avc-seletor-hora-confirmar");
  if (desabilitado) await expect(b).toHaveAttribute("aria-disabled", "true");
  else await expect(b).not.toHaveAttribute("aria-disabled", "true");
}

/** Informa um horário do jeito que a regra exige: interagir, depois confirmar. */
async function informarHorario(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  // ⚠️ ⛔ Confirmar sem tocar em hora/minuto ⛔ não é permitido — e ⛔ não é
  // detalhe de teste: é a regra que impede "agora" de virar default silencioso.
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

/**
 * ⚠️⚠️ INFORMA UMA GRANDEZA PELO CONTROLE NOVO — caixa digitável.
 *
 * ⚠️ A barra e os degraus saíram por decisão do autor (2026-09-01): o valor
 * passou a ser digitado com o teclado do sistema. ⛔ Nos testes abaixo o
 * controle era só o **meio**; o contrato que eles protegem é a **leitura** que
 * resulta. Trocar o meio preserva o que eles afirmam.
 */
async function informar(page: Page, campo: string, valor: number) {
  await page.getByTestId(`avc-num-caixa-${campo}`).fill(String(valor));
}

/** ⚠️ O ajuste fino do controle novo — secundário, ⛔ e ⛔ não a via principal. */
async function ajusteFino(page: Page, campo: string, vezes: number) {
  for (let i = 0; i < vezes; i += 1) await page.getByTestId(`avc-num-mais-${campo}`).click();
}

/** ⚠️ Vazio se lê no VALOR da caixa — `innerText` ⛔ não enxerga `<input>`. */
async function vazia(page: Page, campo: string) {
  await expect(page.getByTestId(`avc-num-caixa-${campo}`)).toHaveValue("");
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

    /**
     * CONTRATO: registrar SpO₂ ⛔ NÃO responde à pergunta de hipoxemia.
     * ⚠️ 53% é hipoxemia grave — e ainda assim a leitura ⛔ não conclui, porque
     * a **pergunta** ⛔ não foi respondida. É esse o ponto do teste.
     */
    await informar(page, "spo2", 53);

    // ⚠️ 94% é META na presença de hipóxia, ⛔ não corte diagnóstico.
    await expect(page.getByTestId("avc-leitura-curto-oxigenio"))
      .toContainText(/hipoxemia ainda não/i);
  });

  test("glicemia não informada aparece como desconhecida, não como normal", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .toContainText(/ainda não informada/i);
    // ⚠️ E a frase que nomeia o erro continua existindo, atrás do ⓘ.
    await expect(await detalheDaLeitura(page, "glicemia"))
      .toContainText(/desconhecida não é normal/i);
  });

  /**
   * ⚠️⚠️ HIPERGLICEMIA GRAVE É MIMETIZADOR, ⛔ NUNCA CONTRAINDICAÇÃO — decisão do
   * autor sobre F-06, 2026-08-29. E a reavaliação do déficit ⛔ não pode sumir
   * quando a glicemia for corrigida: é DEPOIS da correção que a fonte manda
   * avaliar.
   */
  test("acima de 400 mg/dL a tela pede corrigir e reavaliar, e ⛔ não contraindica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    /** CONTRATO: hiperglicemia grave é MIMETIZADOR, ⛔ e ⛔ nunca contraindicação. */
    await informar(page, "glicemia", 470);
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .toContainText(/Hiperglicemia grave/i);
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .toContainText(/mimetizar/i);

    const tela = page.getByTestId("avc-superficie-a-conteudo");
    await expect(tela, "⛔ hiperglicemia ⛔ não contraindica trombólise")
      .not.toContainText(/contraindica|não elegív|aguardar/i);

    await expect(page.getByTestId("avc-leitura-curto-reavaliacao_glicemia"))
      .toContainText(/reavaliar o déficit/i);

    // ⚠️ Corrigida a glicemia, a reavaliação CONTINUA pedida — ela é sobre o
    // depois, ⛔ não sobre o número atual.
    /** CONTRATO: corrigida a glicemia, a reavaliação CONTINUA pedida. */
    await informar(page, "glicemia", 170);
    /**
     * ⚠️ MEDE O SENTIDO, ⛔ NÃO A PALAVRA: a frase de "corrigido" é *"Sem
     * hipoglicemia nem hiperglicemia grave"* — ela CONTÉM o termo, dentro de uma
     * negação. Uma asserção por substring diria que o alerta continua ligado.
     */
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .toContainText(/Sem hipoglicemia significativa nem hiperglicemia grave/i);
    // ⚠️ E a frase ⛔ não afirma mais do que as regras aplicam.
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .toContainText(/critérios aplicados aqui/i);
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
      .not.toContainText(/mimetizar/i);
    await expect(page.getByTestId("avc-leitura-curto-reavaliacao_glicemia"))
      .toContainText(/reavaliar o déficit/i);

    /**
     * ⚠️⚠️ E A REAVALIAÇÃO VIRA **PENDÊNCIA DO ATENDIMENTO** — decisão do autor,
     * 2026-08-29: o estado "corrigida, sem exame posterior" ⛔ não pode ser só um
     * alerta que rola para fora da tela. Ela tem dono e destino, e ⛔ não tranca
     * nada.
     */
    const pendencia = page.getByTestId("avc-pendencia-reavaliar_deficit_pos_glicemia");
    await expect(pendencia).toBeVisible();
    await expect(pendencia).toContainText(/Abrir Neurológico/i);

    // ⛔ E ⛔ não bloqueia: as superfícies continuam abrindo com ela aberta.
    for (const id of ["imagem", "reperfusao", "destino"]) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
      await expect(pendencia, "a pendência acompanha o médico (E-07)").toBeVisible();
    }

    // ⚠️ O toque leva à dona, e o registro POSTERIOR à correção a resolve.
    await pendencia.click();
    await expect(page.getByTestId("avc-superficie-neurologico")).toBeVisible();
    await page.getByTestId("avc-opcao-deficit_focal-sim").click();
    await expect(pendencia).toHaveCount(0);
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
    /** CONTRATO: a PA é registrada ⛔ sem que esta superfície defina candidatura. */
    await informar(page, "pas", 178);
    await informar(page, "pad", 96);
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
    await expect(page.getByTestId("avc-leitura-curto-glicemia"))
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

    await informarHorario(page, "hora_chegada");

    const tela = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    expect(tela, "época em milissegundos jamais pode chegar ao médico")
      .not.toMatch(/\b1[0-9]{12}\b/);
    // E o que aparece no lugar é hora legível.
    await expect(page.getByTestId("avc-hora-valor-hora_chegada"))
      .toHaveText(HORA_EXIBIDA_MARCADA);
  });

  /**
   * ⚠️ "Registrar horário" gravava `agora` sem perguntar nada. Num campo
   * chamado "última vez visto bem" isso ⛔ não é atalho: é apagar seis horas
   * de evolução com um toque. O botão tem de ABRIR o seletor.
   */
  test("registrar horário abre seletor de hora e minuto, e o marco recua", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    /**
     * ⚠️ Vazio convida à AÇÃO, com verbo — "Informar horário", ⛔ não a palavra
     * solta "registrar" em cinza itálico, que o autor leu como legenda do
     * estado do campo e ⛔ não como botão (revisão de tela, 2026-08-28).
     */
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toHaveText(/^Informar horário$/i);

    await page.getByTestId("avc-hora-hora_ultima_vez_bem").click();
    await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();

    const antes = await page.getByTestId("avc-seletor-hora-valor").innerText();
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    const depois = await page.getByTestId("avc-seletor-hora-valor").innerText();
    expect(depois, "uma hora a menos precisa mudar o mostrador").not.toBe(antes);

    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toHaveText(HORA_EXIBIDA_MARCADA);
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
      .toHaveText(/^Informar horário$/i);
  });

  /**
   * ⚠️⚠️ CONTRATO ANTIGO **OBSOLETO** — ⛔ e substituído, ⛔ não removido.
   *
   * ⛔ "Toda grandeza tem barra" era contrato de **apresentação**, ⛔ e a barra
   * saiu por decisão do autor (2026-09-01): ~140 toques para uma glicemia de
   * 240 ⛔ e arrastar num plantão ⛔ não é controle preciso. ⚠️ O contrato novo
   * afirma o mesmo em substância — **todo número é alcançável e visível** —
   * pelo controle que existe agora.
   */
  test("toda grandeza é digitável, com teclado numérico e ajuste fino", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    // ⚠️ DERIVADO DO CONTEÚDO, ⛔ não enumerado: um campo numérico novo nasce
    // dentro da regra em vez de fora dela, calado.
    const grandezas = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza").map((c) => c.id);
    expect(grandezas.length).toBeGreaterThan(0);
    for (const campo of grandezas) {
      const caixa = page.getByTestId(`avc-num-caixa-${campo}`);
      await expect(caixa, `${campo} deveria ser digitável`).toBeVisible();
      await expect(caixa, `${campo} deveria ser editável`).toBeEditable();
      /** ⚠️⚠️ TECLADO DO SISTEMA — decisão 3: ⛔ nenhum teclado próprio. */
      await expect(caixa, `${campo} deveria pedir teclado numérico`)
        .toHaveAttribute("inputmode", "numeric");
      /** ⚠️ O ajuste fino continua existindo — secundário, ⛔ e ⛔ não ausente. */
      await expect(page.getByTestId(`avc-num-mais-${campo}`)).toBeVisible();
      await expect(page.getByTestId(`avc-num-menos-${campo}`)).toBeVisible();
      /** ⚠️⚠️ §0.2: ⛔ nasce SEM valor — ⛔ nenhum número predeterminado. */
      await vazia(page, campo);
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

    /**
     * CONTRATO (ainda válido): campo intocado é **⛔ não informado**, ⛔ e ⛔ nenhum
     * número nasce na tela. ⚠️ Peso alimenta dose de tenecteplase — "70 kg" que
     * ⛔ ninguém pesou é a semente de uma dose errada.
     */
    await vazia(page, "peso");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/não informado/i);

    /**
     * ⚠️⚠️ E O GESTO QUE INFORMA MUDOU: era o primeiro toque no `+`; agora é
     * **digitar**. ⛔ O `+` ficou INERTE ⛔ enquanto ⛔ não houver valor — ⛔ senão
     * ele partiria do piso da faixa e gravaria 30 kg como se alguém tivesse
     * pesado (§0.2, o mesmo motivo do "degrau que ⛔ não move ⛔ não registra").
     */
    await expect(page.getByTestId("avc-num-mais-peso")).toBeDisabled();

    await informar(page, "peso", 78);
    await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("78");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/Peso informado/i);
    /** ⚠️ Com valor, o ajuste fino passa a existir de verdade. */
    await expect(page.getByTestId("avc-num-mais-peso")).toBeEnabled();
  });

  /**
   * ⚠️⚠️ CONTRATO NOVO, ⛔ e ⛔ não migrado: **dígito intermediário inválido ⛔ NÃO
   * REGISTRA**. ⛔ Digitando 78, o estado passa por "7" — e 7 kg na trilha
   * clínica é um valor que ⛔ ninguém mediu. ⚠️ ⛔ Não existia antes porque ⛔ não
   * havia digitação; nasce com o controle.
   */
  test("dígito intermediário fora da faixa ⛔ não vira medida", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    await page.getByTestId("avc-num-caixa-peso").fill("7");
    await expect(page.getByTestId("avc-leitura-curto-peso"),
      "7 está fora da faixa: ⛔ não pode ser registrado")
      .toContainText(/não informado/i);

    await page.getByTestId("avc-num-caixa-peso").fill("78");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/Peso informado/i);
  });

  /**
   * ⚠️⚠️ O PASSO DO MINUTO É UM MINUTO — relato do autor, 2026-08-29: *"o de min
   * quando clico no mais não passa um a um, pula vários minutos"*. Era 5.
   */
  test("o minuto anda de um em um, e o teto se anuncia em vez de engolir o toque", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    await page.getByTestId("avc-hora-hora_reconhecimento").click();
    const minuto = page.getByTestId("avc-seletor-hora-m-numero");
    const numero = async () =>
      Number((await minuto.innerText()).replace(/[^0-9]/g, ""));

    // ⚠️ Recua primeiro: o seletor abre posicionado em AGORA, que é o teto.
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    const antes = await numero();
    await page.getByTestId("avc-seletor-hora-m-menos").click();
    expect(await numero(), "cada toque move UM minuto")
      .toBe((antes - 1 + 60) % 60);

    await page.getByTestId("avc-seletor-hora-m-mais").click();
    expect(await numero()).toBe(antes);

    /**
     * ⚠️⚠️ O TETO: os quatro marcos já aconteceram, e horário futuro produziria
     * decorrido negativo. A regra ⛔ não mudou — ela passou a ser VISÍVEL.
     */
    await page.getByTestId("avc-seletor-hora-m-mais").click();
    await expect(page.getByTestId("avc-seletor-hora-teto")).toBeVisible();
    await expect(page.getByTestId("avc-seletor-hora-m-mais"))
      .toHaveAttribute("aria-disabled", "true");
  });

  /**
   * ⚠️ O seletor ⛔ não repete o rótulo do campo — o cartão logo acima já diz de
   * que marco se trata, e repetido ele produzia informação duplicada na tela.
   */
  test("o seletor não repete o nome do marco", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    await page.getByTestId("avc-hora-hora_reconhecimento").click();
    const seletor = page.getByTestId("avc-seletor-hora");
    await expect(seletor).toBeVisible();
    await expect(seletor).not.toContainText("Reconhecimento dos sintomas");
  });

  /**
   * ⚠️⚠️ DESFAZER — o relato do autor em 2026-08-28: *"cliquei em sem informação
   * e não consigo desmarcar isso"*. Era verdade, e valia para tudo: depois do
   * primeiro toque ⛔ não existia como devolver um campo a "ninguém respondeu".
   */
  test("uma resposta pode ser desfeita, e a pendência reabre", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const semInfo = page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem");
    await semInfo.click();
    await expect(semInfo).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toHaveCount(0);

    // ⚠️ O mesmo botão desfaz — é o gesto que qualquer um tenta primeiro.
    await semInfo.click();
    await expect(semInfo).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem"),
      "desfazer sem reabrir a pendência faria o app dizer 'pronto' sobre o que não está")
      .toBeVisible();
  });

  /**
   * ⚠️⚠️ *"Se tento voltar ao zero não volta, nenhum deles."* A barra VOLTAVA ao
   * mínimo — e o mínimo é um VALOR: o campo dizia "30 kg", peso que ninguém
   * mediu, pronto para alimentar dose.
   */
  test("uma grandeza informada pode voltar a 'não informado'", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    /**
     * CONTRATO (ainda válido): um valor informado pode **voltar** a ⛔ não
     * informado. ⚠️ O MECANISMO mudou — era um botão "limpar" ao lado da barra,
     * ⛔ e agora é apagar a caixa. ⛔ Apagar é **desfazer**, ⛔ e ⛔ não gravar 0:
     * uma glicemia de 0 mg/dL na trilha porque alguém limpou o campo seria a
     * família do E-52.
     */
    await vazia(page, "peso");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/não informado/i);

    await informar(page, "peso", 78);
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/Peso informado/i);

    await page.getByTestId("avc-num-caixa-peso").fill("");
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/não informado/i);
    await vazia(page, "peso");
    /**
     * ⚠️ A UNIDADE SEM NÚMERO sugeria que existe número. ⛔ No controle novo a
     * caixa fica vazia com marcador "—", ⛔ e a unidade fica FORA dela — quem
     * afirma ausência é a leitura, ⛔ e ⛔ não a ausência de "kg" no texto.
     */
    await expect(page.getByTestId("avc-leitura-curto-peso")).toContainText(/ainda não informado/i);
  });

  /**
   * ⚠️⚠️ A VIA AÉREA POR ACHADOS (pedido do autor): o nome de neurologista saiu
   * da pergunta, e os sinais que estavam escondidos na ajuda viraram alvo de
   * toque. ⛔ Sem contagem: **um** achado já é gatilho.
   */
  test("a dificuldade de via aérea se responde por achados que coexistem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const campo = page.getByTestId("avc-campo-disfuncao_bulbar");
    await expect(campo).toContainText(/Dificuldade para proteger a via aérea/i);
    await expect(campo, "termo técnico não pode voltar para a pergunta").not.toContainText(/bulbar/i);

    const engolir = page.getByTestId("avc-item-disfuncao_bulbar-Dificuldade para engolir");
    const tosse = page.getByTestId("avc-item-disfuncao_bulbar-Tosse fraca ou ineficaz");
    await engolir.click();
    await expect(page.getByTestId("avc-leitura-curto-via_aerea")).toContainText(/via aérea/i);

    // ⚠️ COEXISTEM: marcar o segundo ⛔ não desmarca o primeiro.
    await tosse.click();
    await expect(engolir).toHaveAttribute("aria-checked", "true");
    await expect(tosse).toHaveAttribute("aria-checked", "true");

    // ⚠️ E a saída exclusiva limpa os achados — os dois juntos não existem.
    await page.getByTestId("avc-item-disfuncao_bulbar-Nenhum desses").click();
    await expect(engolir).toHaveAttribute("aria-checked", "false");
    await expect(tosse).toHaveAttribute("aria-checked", "false");
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
   * ⚠️⚠️ NOVA AFERIÇÃO NASCE **SEM VALOR** — defeito achado pelo e2e de Correções
   * em 2026-08-30.
   *
   * ⛔ A tela lia o último valor do campo em **qualquer** instância, e a medida
   * nova reaparecia com o número da anterior — **a um toque de virar uma
   * aferição que ⛔ ninguém fez** (família do **E-52**).
   */
  test("Nova medida nasce SEM valor, e ⛔ não cria fato ao abrir", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    /**
     * CONTRATO (ainda válido): a aferição nova nasce SEM valor, ⛔ e abrir ⛔ não
     * cria fato. ⚠️ O valor agora se lê no `value` da caixa — `innerText` ⛔ não
     * enxerga `<input>`, ⛔ e asserção que ⛔ não enxerga o valor ⛔ não prova
     * ⛔ nada.
     */
    const pas1 = 198;
    await informar(page, "pas", pas1);
    await informar(page, "pad", 112);
    await expect(page.getByTestId("avc-num-caixa-pas")).toHaveValue(String(pas1));

    await page.getByTestId("avc-nova-medida-pressao").click();

    /** ⛔⛔ OS DOIS CONTROLES VOLTAM VAZIOS — ⛔ nem PAS ⛔ nem PAD herdam. */
    await vazia(page, "pas");
    await vazia(page, "pad");

    /** ⛔ E abrir a aferição ⛔ NÃO cria fato: a leitura da PA volta a ⛔ não ter medida. */
    await expect(page.getByTestId("avc-leitura-curto-pressao"))
      .not.toContainText(String(pas1));
  });

  /** ⚠️ E o mesmo para a glicemia, que ⛔ não é aferição composta. */
  test("glicemia ⛔ não é herdada por uma aferição de PA nova", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    /**
     * CONTRATO (ainda válido): a glicemia ⛔ NÃO tem instância, ⛔ e ⛔ não pode
     * ser zerada por uma nova aferição de **pressão** — são fatos independentes.
     */
    await informar(page, "pas", 198);
    const glic = 112;
    await informar(page, "glicemia", glic);

    await page.getByTestId("avc-nova-medida-pressao").click();
    /**
     * ⛔ A glicemia ⛔ NÃO tem instância, e ⛔ não pode ser zerada por uma nova
     * aferição de pressão: são fatos independentes.
     */
    await expect(page.getByTestId("avc-num-caixa-glicemia")).toHaveValue(String(glic));
    await expect(page.getByTestId("avc-leitura-curto-glicemia")).not.toContainText(/não informada/i);
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
    /**
     * ⚠️ Os quatro blocos do meio ganharam a letra do **ABCDE do atendimento** em
     * 2026-08-30 — moldura de prioridade, ⛔ não conduta. Relógios e crise ficam
     * fora dela de propósito.
     */
    /**
     * ⚠️ O bloco final deixou de se chamar "ALERTAS": ele virou **três** blocos
     * por tom (atenção · falta responder · registrado), ⛔ e o contrato ⛔ não
     * era o nome — é que a leitura do sistema vem **por último**, depois de
     * todos os blocos clínicos.
     */
    /**
     * ⚠️ "ESTABILIZAÇÃO PRIMEIRO" saiu como CABEÇALHO — o card virou linha, ⛔ e
     * o nome da superfície já está na faixa do cockpit ⛔ e aceso na barra.
     * ⚠️⚠️ O contrato ⛔ nunca foi o cabeçalho: é que a **moldura de prioridade
     * vem antes de tudo**, ⛔ e ela continua vindo — pela frase, logo abaixo.
     */
    expect(tela.toUpperCase().indexOf("AMEAÇAS IMEDIATAS"),
      "a prioridade precisa vir antes do primeiro bloco clínico")
      .toBeLessThan(tela.toUpperCase().indexOf("RELÓGIOS"));

    const ordem = ["RELÓGIOS", "A · VIA AÉREA", "B · RESPIRAÇÃO E OXIGENAÇÃO", "C · CIRCULAÇÃO E PRESSÃO ARTERIAL", "D · GLICEMIA", "PESO", "CRISE NO INÍCIO", "FALTA RESPONDER"];
    const posicoes = ordem.map((t) => tela.toUpperCase().indexOf(t));
    expect(posicoes.every((p) => p >= 0), `faltou bloco: ${ordem.join(" | ")}`).toBe(true);
    expect(posicoes, "prioridade visual é prioridade clínica")
      .toEqual([...posicoes].sort((a, b) => a - b));
  });

  /** ⚠️ Alerta que pede ação vem antes de alerta que só informa. */
  test("alerta de atenção precede o meramente informativo", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    // Via aérea ameaçada é atenção; a crise convulsiva ausente é informação.
    await page.getByTestId("avc-opcao-consciencia_rebaixada-sim").click();
    await page.getByTestId("avc-opcao-crise_no_inicio-nao").click();

    const tela = await page.getByTestId("avc-superficie-a-conteudo").innerText();
    expect(tela.indexOf("Via aérea pode estar ameaçada"))
      .toBeLessThan(tela.indexOf("Sem crise convulsiva no início do quadro"));
  });

  /**
   * ⚠️⚠️ CONTRATO ANTIGO **OBSOLETO**, ⛔ e substituído por prova equivalente.
   *
   * ⛔ "O polegar da barra ⛔ não pode nascer no meio da faixa" media §0.2 pela
   * **geometria** do slider: o texto dizia "⛔ não informado" ⛔ e o desenho dizia
   * 96%, ⛔ e o médico apressado lê o desenho. ⚠️ ⛔ Sem barra, ⛔ não há polegar
   * — ⛔ mas a regra que ela protegia é a mesma ⛔ e continua sendo medida:
   * **⛔ nenhum número predeterminado aparece na tela**.
   *
   * ⚠️⚠️ E o controle novo é **mais forte** aqui: ⛔ não há desenho a discordar do
   * texto. A caixa vazia ⛔ não sugere valor ⛔ nenhum, ⛔ e o `+` ⛔ nem parte.
   */
  test("⛔ nenhuma grandeza nasce com valor, e o ajuste ⛔ não parte do nada",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await abrirA(page);

      // ⚠️ DERIVADO DO CONTEÚDO, ⛔ não enumerado: um campo numérico novo nasce
      // dentro da regra em vez de fora dela, calado.
      const grandezas = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza").map((c) => c.id);
      expect(grandezas.length).toBeGreaterThan(0);

      for (const campo of grandezas) {
        await vazia(page, campo);
        /**
         * ⚠️⚠️ O `+` INERTE É O QUE SUBSTITUI "o polegar no mínimo".
         *
         * ⛔ Um `+` que partisse do piso da faixa gravaria peso 30 kg ⛔ ou
         * glicemia 20 como se alguém tivesse medido — ⛔ é o mesmo defeito que o
         * "degrau que ⛔ não move ⛔ não registra" impedia na barra.
         */
        await expect(page.getByTestId(`avc-num-mais-${campo}`),
          `${campo}: o ajuste ⛔ não pode partir do nada`).toBeDisabled();
        await expect(page.getByTestId(`avc-num-menos-${campo}`)).toBeDisabled();
      }

      /** ⚠️ E o controle CONTINUA utilizável: digitar informa. */
      await informar(page, "peso", 78);
      await expect(page.getByTestId("avc-num-caixa-peso")).toHaveValue("78");
    });

  /**
   * ⚠️⚠️ E-02 NA TELA. Sem este botão, "ninguém sabe dizer" e "ainda não
   * perguntei" caem no mesmo branco — e no último-visto-bem essa diferença
   * decide caminho, porque desconhecido é o cenário de seleção por imagem.
   */
  test("desconhecido é resposta no último-visto-bem, e resolve a pendência", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const botao = page.getByTestId("avc-hora-desconhecido-hora_ultima_vez_bem");
    await expect(botao).toBeVisible();
    await expect(botao).toHaveAttribute("aria-checked", "false");

    // ⚠️ A pendência promete por escrito "ou registrar que é desconhecido".
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toBeVisible();

    await botao.click();
    await expect(botao).toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toHaveCount(0);

    // ⛔ E desconhecido ⛔ não pode virar horário nenhum.
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .not.toHaveText(/\d{2}:\d{2}/);
  });

  /** ⚠️ A outra rota que o `resolvePor` promete: informar o horário. */
  test("informar o horário também resolve a pendência do último-visto-bem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toBeVisible();
    await informarHorario(page, "hora_ultima_vez_bem");
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toHaveCount(0);
  });

  /** ⛔ Desconhecido ⛔ não existe onde não faz sentido clínico. */
  test("a chegada ao pronto-socorro não oferece desconhecido", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await expect(page.getByTestId("avc-hora-desconhecido-hora_chegada")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ A TRAVA VISUAL DO ESTADO INICIAL — a que o autor pediu em 2026-08-28.
   *
   * ⛔ NENHUM HORÁRIO REAL PODE APARECER ANTES DE AÇÃO EXPLÍCITA. Vale para as
   * duas formas de vazamento já vistas: a época crua (`1787922516903`) e o
   * horário formatado (`05:46`) — este último é o mais perigoso dos dois,
   * porque ⛔ não parece defeito: parece um dado.
   *
   * ⚠️ Varre a TELA INTEIRA, ⛔ não só os relógios: cabeçalho, resumo, pendência
   * e alertas são caminhos por onde um horário pode escapar sem que ninguém
   * tenha informado nada.
   */
  test("nenhum horário real aparece antes de ação explícita", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const tela = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    expect(tela, "época em milissegundos jamais pode chegar ao médico")
      .not.toMatch(/\b1[0-9]{12}\b/);
    expect(tela, "horário formatado sem ninguém ter informado é dado inventado")
      .not.toMatch(/\b\d{1,2}:\d{2}\b/);

    /**
     * ⚠️ Cada relógio informável convida à ação, e ⛔ nenhum exibe hora.
     *
     * ⚠️⚠️ O universo segue DERIVADO do conteúdo (D-15) — ⛔ e agora ele tem
     * campo CONDICIONAL: `hora_meio_do_sono` só existe na tela quando o início
     * ⛔ não foi observado. Percorrê-lo aqui mediria um locator ausente, ⛔ que
     * ⛔ não é o mesmo que um campo mostrando hora inventada.
     */
    const condicionais = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "hora" && c.apareceQuando);
    expect(condicionais.length, "campo condicional novo precisa de conferência própria")
      .toBe(1);
    for (const campo of condicionais) {
      await expect(page.getByTestId(`avc-campo-${campo.id}`), campo.id).toHaveCount(0);
    }

    for (const campo of TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "hora" && !c.apareceQuando)) {
      await expect(page.getByTestId(`avc-hora-valor-${campo.id}`), campo.id)
        .not.toHaveText(/\d{1,2}:\d{2}/);
    }

    // ⚠️ E o horário só aparece DEPOIS da ação: abrir o seletor e confirmar.
    await informarHorario(page, "hora_chegada");
    await expect(page.getByTestId("avc-hora-valor-hora_chegada")).toHaveText(HORA_EXIBIDA_MARCADA);
  });

  /**
   * ⚠️ O SLUG É IDENTIDADE INTERNA e ⛔ não pode aparecer na tela clínica.
   *
   * ── A REGRESSÃO QUE ISTO TRAVA ──────────────────────────────────────────
   *
   * Enquanto o id era a letra, a pendência imprimia "A · Resolver" e ninguém
   * notava que estava imprimindo o ID. Ao virar slug, virou
   * "estabilizacao · Resolver". A trava mede a pendência diretamente porque a
   * varredura genérica ⛔ não serve aqui: "imagem" e "destino" são palavras
   * legítimas do texto clínico, e casá-las daria vermelho falso.
   */
  test("a pendência mostra o título da dona, nunca o slug", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const pend = page.getByTestId("avc-pendencia-ultima_vez_bem");
    await expect(pend).toContainText("Entrada e estabilização");
    await expect(pend, "identificador interno não é linguagem clínica")
      .not.toContainText("estabilizacao");

    await expect(page.getByTestId("avc-pendencia-deficit_focal")).toContainText("Neurológico");
    /**
     * ⛔ E a de imagem ⛔ não aparece: desde 2026-08-29 só é exibida a pendência
     * cujo campo existe, e a Superfície C ⛔ não foi construída (E-26, I-7).
     */
    await expect(page.getByTestId("avc-pendencia-tc_realizada")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ "AGORA" ⛔ NÃO É DEFAULT SILENCIOSO DE RELÓGIO CLÍNICO.
   *
   * ── O DEFEITO ────────────────────────────────────────────────────────────
   *
   * O seletor abria posicionado em agora com Confirmar já válido. Um toque
   * registrava o horário atual no **última vez visto bem** — a mesma
   * catástrofe que corrigimos um nível acima, uma camada mais fundo: paciente
   * de 6 horas de evolução vira paciente de zero minuto, com janela de
   * trombólise inventada.
   *
   * Os seis passos que o autor especificou, na ordem, num teste só — porque é
   * a SEQUÊNCIA que prova a regra, e cortá-la em pedaços deixaria passar o
   * caso do meio (clicar no Confirmar desabilitado e nada acontecer).
   */
  test("o seletor de relógio clínico não confirma sem interação explícita", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    // 1 · abrir o picker de LKW
    await page.getByTestId("avc-hora-hora_ultima_vez_bem").click();
    await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();

    // 2 · não tocar em hora/minuto — e o valor ⛔ NÃO se lê como escolhido
    await expect(page.getByTestId("avc-seletor-hora-valor")).toHaveText(/não informado/i);
    await expect(page.getByTestId("avc-seletor-hora-valor")).not.toHaveText(/\d{1,2}:\d{2}/);

    // 3 · Confirmar desabilitado
    const confirmar = page.getByTestId("avc-seletor-hora-confirmar");
    await esperaConfirmar(page, true);

    // 4 · e nenhum fato temporal entra no estado, nem forçando o clique
    await confirmar.click({ force: true });
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem")).toHaveText(/^Informar horário$/i);
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem"),
      "pendência resolvida sem o médico informar nada seria o pior desfecho").toBeVisible();

    // 5 · após interação explícita, Confirmar habilita
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    await esperaConfirmar(page, false);
    await expect(page.getByTestId("avc-seletor-hora-valor")).toHaveText(HORA_EXIBIDA);

    // 6 · ao confirmar, aí sim o fato entra na trilha
    await confirmar.click();
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem")).toHaveText(HORA_EXIBIDA_MARCADA);
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem")).toHaveCount(0);
  });

  /**
   * ⚠️ "Agora" continua sendo AÇÃO NOMEADA — o que a regra proíbe é agora como
   * default silencioso, ⛔ não a ergonomia de um atalho rotulado.
   */
  test("o atalho Agora é interação explícita e habilita Confirmar", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await page.getByTestId("avc-hora-hora_inicio_observado").click();
    await esperaConfirmar(page, true);
    await page.getByTestId("avc-seletor-hora-agora").click();
    await esperaConfirmar(page, false);
    // ⚠️ E habilitado aqui SIGNIFICA algo: o clique grava de verdade.
    await page.getByTestId("avc-seletor-hora-confirmar").click();
    await expect(page.getByTestId("avc-hora-valor-hora_inicio_observado"))
      .toHaveText(HORA_EXIBIDA_MARCADA);
  });

  /**
   * ⚠️ REEDITAR ⛔ NÃO É INFORMAR PELA PRIMEIRA VEZ: um marco já registrado é um
   * valor escolhido, e obrigar a mexer nele para reconfirmá-lo faria o médico
   * alterar um horário correto.
   */
  test("reabrir um horário já registrado nasce com Confirmar habilitado", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    await informarHorario(page, "hora_reconhecimento");

    await page.getByTestId("avc-hora-hora_reconhecimento").click();
    await esperaConfirmar(page, false);
    await expect(page.getByTestId("avc-seletor-hora-valor")).toHaveText(HORA_EXIBIDA);
  });

  /** ⚠️ I-3: pré-marcar Sim/Não é responder pelo médico. */
  test("nenhuma escolha abre selecionada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const marcadas = await page.locator('[role="radio"][aria-checked="true"]').count();
    expect(marcadas, "nenhuma opção pode nascer marcada").toBe(0);

    // ⚠️ E há opções de verdade na tela — um zero por ausência de radio seria
    // verde falso, e é o modo mais fácil de esta trava mentir.
    const total = await page.locator('[role="radio"]').count();
    const escolhas = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "escolha").length;
    expect(total, "as opções precisam existir para o zero acima significar algo")
      .toBeGreaterThanOrEqual(escolhas * 3);
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
    /**
     * ⚠️⚠️ TESTE MISTO — separado em 2026-09-01.
     *
     * ⛔ A parte clínica (o texto da pergunta ⛔ e a saída "Incerto") **continua
     * valendo**. ⛔ A parte de apresentação — *"a ajuda fica visível na tela"* —
     * ficou obsoleta: por decisão do autor, texto de apoio recolhe atrás do ⓘ.
     *
     * ⚠️⚠️ ⛔ RECOLHER ⛔ NÃO É APAGAR, ⛔ e é isso que se prova aqui: a frase
     * continua **alcançável**, a um toque. ⛔ Remover a asserção teria trocado
     * um contrato por ⛔ nada.
     */
    await expect(campo, "recolhido ⛔ não é visível de saída")
      .not.toContainText(/não define um corte numérico/i);
    await page.getByTestId("avc-info-hipoxia").click();
    await expect(campo, "⛔ e ⛔ não desapareceu: está a um toque")
      .toContainText(/não define um corte numérico/i);
  });

  /**
   * ⚠️⚠️ **D-120 NA TELA** — as duas metades de uma aferição, e o gesto que abre
   * outra. Relato do autor, 2026-08-30: *"PAS + PAD de uma mesma aferição
   * precisam pertencer à mesma instância de medida."*
   */
  test("PA: nova medida é aferição nova, e ⛔ não correção", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();

    // ⚠️ Antes da primeira medida, ⛔ não há o que suceder: o gesto ⛔ não aparece.
    await expect(page.getByTestId("avc-nova-medida-pressao")).toHaveCount(0);

    /** CONTRATO (ainda válido): as duas metades pertencem à MESMA aferição. */
    await informar(page, "pas", 178);
    await informar(page, "pad", 96);
    // ⚠️ Com uma medida registrada, o gesto existe.
    await expect(page.getByTestId("avc-nova-medida-pressao")).toBeVisible();

    await page.getByTestId("avc-nova-medida-pressao").click();
    // ⛔ A medida nova nasce VAZIA: ela ⛔ não herda a metade da anterior.
    await expect(page.getByTestId("avc-leitura-curto-pressao"))
      .toContainText(/ainda não informada/i);
  });
});
