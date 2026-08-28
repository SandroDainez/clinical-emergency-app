import { expect, test, type Page } from "@playwright/test";

import { TODOS_OS_CAMPOS_A } from "../avc/conteudo/superficie-a";
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

    await informarHorario(page, "hora_chegada");

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
    // ⚠️ DERIVADO DO CONTEÚDO, ⛔ não enumerado: um campo numérico novo nasce
    // dentro da regra em vez de fora dela, calado.
    const grandezas = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza").map((c) => c.id);
    expect(grandezas.length).toBeGreaterThan(0);
    for (const campo of grandezas) {
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

  /**
   * ⚠️⚠️ O polegar da barra ⛔ NÃO pode nascer no meio da faixa. O texto dizia
   * "não informado" e o desenho dizia 96% — e o médico apressado lê o desenho.
   */
  test("barra intocada nasce no mínimo, sem valor predeterminado", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);
    /**
     * ⚠️ MEDIDO POR GEOMETRIA, ⛔ não por atributo: o Slider do react-native-web
     * ⛔ não publica `aria-valuenow`, e travar num detalhe interno dele seria
     * frágil. A posição do polegar é o que o médico vê — é ela que se mede.
     */
    const fracaoDoPolegar = async (campo: string) =>
      page.getByTestId(`avc-grandeza-${campo}`).locator('[role="slider"]').evaluate((el) => {
        const trilho = el.getBoundingClientRect();
        const polegar = (el.children[1] as HTMLElement).getBoundingClientRect();
        return (polegar.x + polegar.width / 2 - trilho.x) / trilho.width;
      });

    // ⚠️ DERIVADO DO CONTEÚDO, ⛔ não enumerado: um campo numérico novo nasce
    // dentro da regra em vez de fora dela, calado.
    const grandezas = TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza").map((c) => c.id);
    expect(grandezas.length).toBeGreaterThan(0);
    for (const campo of grandezas) {
      expect(await fracaoDoPolegar(campo), `${campo}: polegar deveria nascer na ponta esquerda`)
        .toBeLessThan(0.12);
      await expect(page.getByTestId(`avc-grandeza-${campo}`)).toContainText(/não informado/i);
    }

    // ⚠️ E o controle CONTINUA utilizável: o primeiro toque move e informa.
    await page.getByTestId("avc-grandeza-spo2-mais").click();
    await expect(page.getByTestId("avc-grandeza-spo2")).not.toContainText(/não informado/i);
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

    // Cada relógio informável convida à ação, e ⛔ nenhum exibe hora.
    for (const campo of TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "hora")) {
      await expect(page.getByTestId(`avc-hora-valor-${campo.id}`), campo.id)
        .not.toHaveText(/\d{1,2}:\d{2}/);
    }

    // ⚠️ E o horário só aparece DEPOIS da ação: abrir o seletor e confirmar.
    await informarHorario(page, "hora_chegada");
    await expect(page.getByTestId("avc-hora-valor-hora_chegada")).toHaveText(/^\d{2}:\d{2} ✎$/);
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
  test("a pendência mostra letra e título da dona, nunca o slug", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirA(page);

    const pend = page.getByTestId("avc-pendencia-ultima_vez_bem");
    await expect(pend).toContainText("A · Entrada e estabilização");
    await expect(pend, "identificador interno não é linguagem clínica")
      .not.toContainText("estabilizacao");

    await expect(page.getByTestId("avc-pendencia-tc_realizada")).toContainText("C · Imagem");
    await expect(page.getByTestId("avc-pendencia-deficit_focal")).toContainText("B · Neurológico");
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
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem")).toHaveText(/^registrar$/i);
    await expect(page.getByTestId("avc-pendencia-ultima_vez_bem"),
      "pendência resolvida sem o médico informar nada seria o pior desfecho").toBeVisible();

    // 5 · após interação explícita, Confirmar habilita
    await page.getByTestId("avc-seletor-hora-h-menos").click();
    await esperaConfirmar(page, false);
    await expect(page.getByTestId("avc-seletor-hora-valor")).toHaveText(/^\d{2}:\d{2}$/);

    // 6 · ao confirmar, aí sim o fato entra na trilha
    await confirmar.click();
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem")).toHaveText(/^\d{2}:\d{2} ✎$/);
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
      .toHaveText(/^\d{2}:\d{2} ✎$/);
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
    await expect(page.getByTestId("avc-seletor-hora-valor")).toHaveText(/^\d{2}:\d{2}$/);
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
    // ⛔ E a ajuda diz, na tela, que a fonte não define corte numérico.
    await expect(campo).toContainText(/não define um corte numérico/i);
  });
});
