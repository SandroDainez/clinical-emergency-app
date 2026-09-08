import { expect, test } from "@playwright/test";

import { SUPERFICIES, SEQUENCIA_OFICIAL } from "../avc/conteudo/superficies";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que o módulo AVC exista, abra pela sua rota própria, e seja
 *   NAVEGÁVEL entre as sete superfícies em qualquer ordem — sem árvore linear.
 *   Mede também o resumo persistente, as pendências acionáveis e o espanhol.
 *
 * ⛔ NÃO mede medicina: o esqueleto não tem regra clínica, e um teste que
 * afirmasse conduta aqui estaria medindo o que não existe.
 *
 * ⚠️ A trava mais importante deste arquivo é a ÚLTIMA: navegar entre superfícies
 * não pode registrar ação clínica nenhuma (E-20). É a que protege o módulo do
 * defeito que a spec nomeia.
 */
test.describe("Módulo AVC — esqueleto navegável", () => {
  test("abre pela rota própria, com cabeçalho e saída", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await expect(page.getByText("AVC isquêmico agudo").first()).toBeVisible();
    // I7: a tela desenha o próprio cabeçalho, e ele tem saída — agora rotulada
    // "Módulos" e FIXA no topo (fora do ScrollView), para não sumir no scroll
    // das superfícies longas.
    await expect(
      page.getByRole("button", { name: "Sair do módulo e voltar para a lista" })
    ).toBeVisible();
  });

  test("a saída leva de volta ao hub, MESMO após rolar uma superfície longa", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await expect(page.getByText("AVC isquêmico agudo").first()).toBeVisible();

    // Vai para uma superfície longa e rola até o fim — onde o médico se perdia.
    const est = page.getByText("Entrada e estabilização", { exact: false }).first();
    if (await est.count()) await est.click();
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(300);

    // A saída continua visível (cabeçalho fixo) e leva ao hub.
    const sair = page.getByRole("button", { name: "Sair do módulo e voltar para a lista" });
    await expect(sair, "a saída deve permanecer visível após o scroll").toBeVisible();
    await sair.click();
    await expect
      .poll(async () => page.url(), { timeout: 15_000 })
      .not.toContain("/modulos/avc");
  });

  test("as nove superfícies abrem em qualquer ordem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ Ordem deliberadamente EMBARALHADA: se houvesse árvore linear, abrir o
    // Destino antes do Neurológico falharia. É isso que a trava mede (§7.2, E-11).
    //
    // ⚠️ Endereçado por SLUG, ⛔ não por letra: em 2026-08-28 E e F trocaram de
    // letra, e um teste ancorado em "E" continuaria verde medindo outra
    // superfície — verde falso é pior que vermelho.
    /**
     * ⚠️ **Os dois painéis entram embaralhados junto com as sete clínicas** — e
     * `paciente` vem DEPOIS de quatro superfícies de propósito: é a prova de
     * que ele ⛔ não é passo 1 (**PD-29**).
     */
    /**
     * ⚠️⚠️ ⛔ A LISTA PERDEU `laboratorio` ⛔ e `correcoes` — 2026-09-06 (**C3**).
     *
     * ⛔ ⛔ Elas ⛔ não sumiram do app: o laboratório vive **dentro de
     * Investigação** (**§16**) ⛔ e Correções é **condicional**, alcançada pelo
     * problema que a exige. ⚠️ O que este teste mede é *"toda fase da barra
     * abre, em qualquer ordem"* — ⛔ e ⛔ nenhuma das duas é fase da barra.
     */
    const ordem = [
      "destino", "neurologico", "reperfusao", "estabilizacao",
      "paciente", "seguranca", "imagem",
    ] as const;
    for (const id of ordem) {
      await page.getByTestId(`avc-aba-${id}`).click();
      await expect(page.getByTestId(`avc-superficie-${id}`)).toBeVisible();
    }

    /**
     * ⚠️⚠️ ⛔ SETE, ⛔ e ⛔ não nove — 2026-09-06, decisão **C3**.
     *
     * ⛔ Laboratório ⛔ e Correções saíram da **barra**, ⛔ e ⛔ não do app:
     * ⛔ o laboratório é renderizado **dentro de Investigação** (**§16**), ⛔ e
     * Correções é alcançada **pelo problema que a exige**. ⚠️ A §61 pede uma
     * resposta ⛔ só para *"qual caminho o médico percorre"* — ⛔ e ⛔ um atalho
     * ao lado da barra era uma segunda resposta.
     */
    expect(SEQUENCIA_OFICIAL.length).toBe(7);
  });

  /**
   * ⚠️ A ORDEM VISUAL APROVADA PELO AUTOR (2026-08-28), medida na TELA.
   *
   * `prova-avc-superficies` já congela a ordem no CONTEÚDO; esta trava mede a
   * outra ponta — que a tela desenhe nessa ordem e que a letra que ela pinta
   * seja a da posição. As duas juntas fecham o caminho: conteúdo certo
   * renderizado fora de ordem passaria na prova e reprovaria aqui.
   *
   * ⚠️ E-11 continua valendo: isto é ordem de LEITURA. O teste acima já provou,
   * abrindo as sete embaralhadas, que ⛔ não existe pré-requisito de navegação.
   */
  test("as abas aparecem na ordem aprovada, com a letra da posição", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    /**
     * ⛔⛔ ⛔ SEM LETRA — 2026-08-30. O A–G colidia com o **ABCDE do atendimento**, e
     * o "D" era o caso decisivo: aqui *Segurança para trombólise*, lá
     * **Disfunção neurológica**, num paciente que tem as duas.
     *
     * ⚠️ Os painéis continuam marcados com `·` — a distinção painel × etapa
     * ⛔ nunca foi sobre a letra (**PD-29**).
     */
    /**
     * ⚠️⚠️ TESTE MISTO — separado em 2026-09-01, na reescrita do cockpit.
     *
     * ⛔ **CONTINUA VALENDO:** ⛔ nenhuma letra (o A–G colidia com o ABCDE do
     * atendimento), as NOVE superfícies existem ⛔ e todas são alcançáveis, ⛔ e a
     * distinção **painel × etapa** (PD-29) sobrevive.
     *
     * ⛔ **FICOU OBSOLETO:** a lista única com `·` ⛔ e o título por extenso. Por
     * decisão do autor, os painéis saíram da jornada clínica para uma faixa
     * auxiliar, ⛔ e os nomes viraram curtos para caber em UMA linha — nome que
     * quebra ⛔ não identifica a superfície que ele existe para nomear.
     *
     * ⚠️⚠️ A distinção agora se prova por **posição**, ⛔ e ⛔ não por marcador: os
     * painéis vêm DEPOIS de todas as etapas. ⛔ Trocar a prova por ⛔ nada teria
     * sido perder PD-29 numa mudança de layout.
     */
    const principais = ["estabilizacao", "neurologico", "imagem", "seguranca",
      "reperfusao", "destino"];
    /**
     * ⚠️⚠️ **CORREÇÕES É ETAPA NO MODELO**, ⛔ e acesso SECUNDÁRIO na tela.
     *
     * ⚠️ Decisão do autor, 2026-09-01: sete etapas visualmente equivalentes
     * ⛔ não são hierarquia. ⛔ Ela ⛔ não virou painel — `painel` continua
     * marcado ⛔ só em Paciente e Laboratório, ⛔ e é isso que PD-29 afirma.
     * ⚠️ A posição na tela é **apresentação**; a espécie é do modelo.
     */
    const secundarios = ["correcoes", "laboratorio"];

    /**
     * ⚠️⚠️ ⛔ A BARRA TEM **SETE**, ⛔ e ⛔ ela É a sequência oficial — **§61**.
     *
     * ⛔ Eram nove abas: as seis clínicas mais Paciente, Laboratório ⛔ e
     * Correções numa faixa auxiliar ao lado. ⚠️ Decisão **C3** do autor:
     * ⛔ **Paciente virou a primeira fase**, ⛔ e os outros dois saíram da barra
     * — ⛔ o painel auxiliar era o *"caminho concorrente"* que a §61 proíbe.
     */
    const ordem = await page.locator('[data-testid^="avc-aba-"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")!.replace("avc-aba-", "")));
    expect(ordem.sort(), "a barra é exatamente a sequência oficial")
      .toEqual([...SEQUENCIA_OFICIAL.map((s) => s.id)].sort());

    /**
     * ⚠️⚠️ ⛔ E ⛔ NADA FICOU INALCANÇÁVEL — ⛔ que é a única razão pela qual
     * remover as abas foi seguro.
     *
     * ⛔ A garantia antiga era *"existe uma aba"*. ⚠️ Ela ficou **mais forte**:
     * agora o teste **chega lá**, ⛔ e ⛔ não confere a existência de um botão.
     */
    await page.getByTestId("avc-aba-imagem").click();
    await expect(
      page.getByTestId("avc-superficie-laboratorio-conteudo"),
      "⛔ o Laboratório tem de viver dentro de Investigação (§16)"
    ).toBeVisible();

    /**
     * ⚠️⚠️ PD-29 POR POSIÇÃO: os painéis vêm DEPOIS de todas as etapas.
     *
     * ⛔ Antes a distinção era o `·`; agora é a faixa auxiliar. ⛔ A prova mudou
     * de forma, ⛔ e ⛔ não de objeto: painel ⛔ continua ⛔ não sendo etapa.
     */
    /**
     * ⚠️⚠️ A PROVA É POR **CONTAINER**, ⛔ e ⛔ não por ordem no DOM.
     *
     * ⛔ A ordem era um proxy frágil: com a barra inferior fixa, os auxiliares
     * passaram a vir ANTES no DOM ⛔ e depois na tela. ⚠️ O contrato ⛔ nunca foi
     * a posição no documento — é que **as seis clínicas são um grupo**, ⛔ e os
     * acessos secundários ⛔ não se misturam a ele.
     */
    const naBarra = await page.locator('[data-testid="avc-barra"] [data-testid^="avc-aba-"]')
      .evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")!.replace("avc-aba-", "")));
    expect(naBarra.sort(), "a barra inferior é a sequência oficial")
      .toEqual([...principais, "paciente"].sort());
    for (const id of secundarios) {
      expect(naBarra, `${id} ⛔ não pertence à navegação clínica`).not.toContain(id);
    }

    /**
     * ⚠️⚠️ **PD-29 CONTINUA NO MODELO**, ⛔ e ⛔ com ⛔ um painel a menos.
     *
     * ⛔ Paciente deixou de ser painel porque virou **fase** — ⛔ e ⛔ isso ⛔ não
     * afrouxa PD-29: a distinção ⛔ nunca foi sobre quantos são, ⛔ e sim sobre
     * **ser ⛔ ou ⛔ não ser passo do atendimento**.
     */
    expect(SUPERFICIES.filter((s) => s.painel).map((s) => s.id))
      .toEqual(["laboratorio"]);

    /**
     * ⚠️⚠️ ⛔ NENHUM nome chega TRUNCADO ⛔ nem QUEBRADO — o contrato de 2026-08-30
     * sobrevive à mudança para nome curto, ⛔ e ganha a exigência de UMA linha.
     */
    /**
     * ⚠️ Mede o NOME, ⛔ e ⛔ não o item: o item contém ícone **e** nome em
     * coluna, ⛔ e a quebra entre os dois ⛔ não é o nome quebrando.
     */
    const nomes = await page.locator('[data-testid^="avc-rotulo-aba-"]').allInnerTexts();
    /** ⚠️ Sete rótulos — a sequência oficial (**C3**). */
    expect(nomes.length).toBe(SEQUENCIA_OFICIAL.length);
    for (const t of nomes) {
      expect(t, `nome truncado: ${t}`).not.toMatch(/…|\.\.\./);
      expect(t.trim(), `nome em duas linhas: ${t}`).not.toMatch(/\n/);
    }

    /** ⛔⛔ E ⛔ NENHUMA aba carrega letra solta — ⛔ nem número. */
    for (const t of nomes) {
      const limpo = t.replace(/\s+/g, " ").trim();
      expect(limpo, `aba com letra: ${t}`).not.toMatch(/^[A-G]\s*·/);
      expect(limpo, `aba com número: ${t}`).not.toMatch(/^\d+\s*[·.]/);
    }

    // ⚠️ E o cabeçalho da superfície aberta também vem só pelo nome.
    await page.getByTestId("avc-aba-reperfusao").click();
    await expect(page.getByTestId("avc-superficie-reperfusao")).toContainText("Reperfusão");
    await expect(page.getByTestId("avc-superficie-reperfusao")).not.toContainText("F · Reperfusão");
  });

  /**
   * ⚠️⚠️ TROCAR DE FASE LEVA O OLHO JUNTO — regressão de 2026-09-06.
   *
   * ⛔ **O defeito, ⛔ e ⛔ ele ⛔ não era de estilo.** O autor relatou *"clica ⛔ e
   * ⛔ nada acontece"* em dois controles diferentes. ⚠️ A superfície trocava ⛔ de
   * verdade — ⛔ mas o `scrollTop` ficava onde estava, ⛔ e o médico continuava
   * parado a 1500 px dentro de **outra** tela.
   *
   * ⚠️ Do ponto de vista de quem usa, o botão ⛔ não fez ⛔ nada. ⛔ E ⛔ nenhum
   * teste via isso, porque todos mediam **qual superfície abriu**, ⛔ e ⛔ nenhum
   * media **onde o olho ficou**.
   */
  /**
   * ⚠️⚠️ ESTABILIZAÇÃO VEM ANTES DA IMAGEM — regra clínica, ⛔ e ⛔ não layout.
   *
   * > *"O princípio de atendimento emergencial é estabilização — ⛔ não adianta
   * > seguir um fluxo bonito ⛔ e bem feito com a deterioração ⛔ sem
   * > intervenção."* — autor, 2026-09-06
   *
   * ⛔ O card da tomografia chegou a ser o **primeiro bloco do módulo**, ⛔ e com
   * isso a imagem passou a valer mais que a via aérea. ⚠️ A ordem na tela **é**
   * a ordem de prioridade que o médico lê, ⛔ e por isso ela é medida.
   */
  test("estabilização aparece antes da prioridade de imagem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    /**
     * ⚠️⚠️ ⛔ O MÓDULO ABRE EM **PACIENTE** DESDE 2026-09-07 — ⛔ e ⛔ lá ⛔ não
     * há ⛔ nem eixos ⛔ nem prioridade de imagem, ⛔ por decisão do autor.
     * ⚠️ A **ordem entre os dois** é o que este teste mede, ⛔ e ⛔ ela ⛔ não
     * mudou: ⛔ ele navega até onde os dois existem.
     */
    /**
     * ⚠️⚠️ ⛔ E ⛔ NÃO É MAIS NA ESTABILIZAÇÃO — 2026-09-08: ⛔ a prioridade da
     * imagem saiu da tela do ABCDE a pedido do autor. ⚠️ **A ordem entre os
     * dois** continua sendo o que se mede, ⛔ e ⛔ ela se mede ⛔ onde os dois
     * existem — ⛔ na faixa compacta das superfícies seguintes.
     */
    await page.getByTestId("avc-aba-neurologico").click();

    const estabilizacao = page.getByTestId("avc-ameacas-imediatas");
    const imagem = page.getByTestId("avc-prioridade-imagem");
    await expect(estabilizacao).toBeVisible();
    await expect(imagem).toBeVisible();

    const yDe = async (loc: ReturnType<typeof page.getByTestId>) =>
      (await loc.boundingBox())?.y ?? -1;
    expect(
      await yDe(estabilizacao),
      "⛔ a imagem ⛔ não pode ser lida antes da estabilização"
    ).toBeLessThan(await yDe(imagem));
  });

  test("trocar de fase volta a rolagem ao topo", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-estabilizacao").click();

    /**
     * ⚠️ O contêiner rolável do conteúdo — o **maior** da tela.
     *
     * ⛔ A primeira versão procurava `scrollHeight > 5000`, que era o tamanho
     * no MEU ambiente ⛔ e ⛔ não no viewport do teste (375×812). ⚠️ Achar pelo
     * maior rolável ⛔ não depende de altura absoluta ⛔ nenhuma.
     */
    const maiorRolavel = `
      [...document.querySelectorAll("*")]
        .filter((x) => x.scrollHeight > x.clientHeight + 100)
        .sort((a, b) => b.scrollHeight - a.scrollHeight)[0]
    `;
    const rolar = async (y: number) =>
      page.evaluate(
        ([expr, alvo]) => {
          const el = eval(expr as string) as HTMLElement | undefined;
          if (el) el.scrollTop = alvo as number;
        },
        [maiorRolavel, y] as const
      );
    const posicao = () =>
      page.evaluate((expr) => {
        const el = eval(expr) as HTMLElement | undefined;
        return el ? el.scrollTop : -1;
      }, maiorRolavel);

    await rolar(1500);
    expect(await posicao()).toBeGreaterThan(1000);

    await page.getByTestId("avc-aba-imagem").click();
    await expect(page.getByTestId("avc-superficie-imagem")).toBeVisible();
    expect(await posicao(), "⛔ a fase abriu, ⛔ mas o olho ficou na tela anterior").toBe(0);
  });

  /**
   * ── ⚠️⚠️⚠️ ⛔ ESTA GARANTIA MUDOU DE FORMA — 2026-09-07 ──────────────────
   *
   * ⛔ ⛔ Ela dizia *"acompanha **todas** as superfícies"*. ⚠️ ⛔ Na inspeção
   * clínica o autor tirou o resumo ⛔ e o relógio da **abertura**: ⛔ na
   * primeira tela ⛔ eles ⛔ não têm o que resumir — ⛔ nada foi registrado
   * ⛔ ainda — ⛔ e ocupavam o topo antes da primeira pergunta.
   *
   * ⚠️⚠️ ⛔ O QUE **§7.8** PROTEGE CONTINUA PROTEGIDO: ⛔ o médico ⛔ não pode
   * trabalhar numa fase ⛔ sem ver o tempo correr. ⛔ Da segunda superfície em
   * diante, ⛔ o resumo está ⛔ em todas — ⛔ e é ⛔ isso que se mede.
   */
  test("o resumo persistente acompanha todas as superfícies, ⛔ exceto a abertura", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    /**
     * ⚠️ ⛔ **DUAS** exceções desde 2026-09-08: a abertura ⛔ e a Estabilização.
     * ⛔ *"Escala e imagem"* resume NIHSS ⛔ e imagem — ⛔ duas fases adiante —,
     * ⛔ e na tela do ABCDE ⛔ elas competiam com o que mata em minutos.
     */
    for (const sup of SEQUENCIA_OFICIAL.filter(
      (x) => x.id !== "paciente" && x.id !== "estabilizacao"
    )) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
      // ⚠️ O resumo é persistente porque o RELÓGIO é o único valor que muda
      // sozinho: escondê-lo numa superfície faria o médico trabalhar noutra sem
      // vê-lo correr (§7.8).
      await expect(page.getByTestId("avc-resumo")).toBeVisible();
    }
  });

  test("pendência é acionável de qualquer superfície e leva à sua dona", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // Abre uma superfície que NÃO é a dona da pendência...
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-superficie-destino")).toBeVisible();

    /**
     * ...e a pendência continua visível e acionável dali (E-07).
     *
     * ⚠️ USA `deficit_focal`, e ⛔ não mais `tc_realizada`: desde 2026-08-29 só
     * é EXIBIDA a pendência cujo campo existe. A da tomografia aponta para a
     * Superfície de Imagem, ⛔ não construída — e uma pendência que leva a "em
     * construção" é muro, ⛔ não tarefa (E-26, I-7).
     */
    const pendencia = page.getByTestId("avc-pendencia-deficit_focal");
    await expect(pendencia).toBeVisible();
    await pendencia.click();

    // A dona de `deficit_focal` é o Neurológico — e ela tem porta de saída lá.
    await expect(page.getByTestId("avc-superficie-neurologico")).toBeVisible();
    await expect(page.getByTestId("avc-campo-deficit_focal")).toBeVisible();

    // ⛔ E a pendência sem porta ⛔ não aparece em lugar nenhum.
    await expect(page.getByTestId("avc-pendencia-tc_realizada")).toHaveCount(0);
  });

  test("o módulo fala espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await expect(page.getByText("ACV isquémico agudo").first()).toBeVisible();
    await page.getByTestId("avc-aba-imagem").click();
    await expect(page.getByText("Imagen").first()).toBeVisible();
    // ⛔ Nenhum texto clínico visível pode ficar em português com ES ativo.
    await expect(page.getByText("Superfície em construção")).toHaveCount(0);
  });

  test("navegar entre superfícies não registra ação clínica", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");

    // ⚠️ E-20: percorrer TODAS as superfícies não pode mudar nada — as pendências
    // continuam exatamente as mesmas, porque navegação não é fato clínico.
    /**
     * ⚠️⚠️ ⛔ A LEITURA É NA **MESMA SUPERFÍCIE** — 2026-09-07.
     *
     * ⛔ ⛔ Comparar a lista da **abertura** com a de outra tela ⛔ não mede
     * **E-20**: ⛔ desde 2026-09-07 a primeira tela mostra ⛔ só as pendências
     * ⛔ dela, ⛔ e as outras seguem globais. ⚠️ ⛔ A diferença seria de
     * **filtro**, ⛔ e ⛔ não de fato registrado — ⛔ o teste acusaria o que ⛔ não
     * quis medir.
     */
    await page.getByTestId("avc-aba-destino").click();
    const antes = await page.getByTestId("avc-pendencias").innerText();
    for (const sup of SEQUENCIA_OFICIAL) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
    }
    await page.getByTestId("avc-aba-destino").click();
    const depois = await page.getByTestId("avc-pendencias").innerText();
    expect(depois).toBe(antes);
  });

  /**
   * ⚠️⚠️ A BARRA FIXA ⛔ NÃO PODE COBRIR CONTEÚDO CLÍNICO.
   *
   * ⛔ Barra fixa sem `paddingBottom` no conteúdo esconde **o último campo, o
   * último alerta ⛔ e a última ação** — ⛔ e conteúdo clínico coberto ⛔ não é
   * detalhe de layout. ⚠️ O padding é `altura da barra + safe area`, ⛔ e as
   * duas medidas vivem numa constante só justamente para ⛔ não divergirem.
   */
  test("⛔ a barra inferior ⛔ NÃO cobre o fim de ⛔ nenhuma superfície",
    async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.goto("/modulos/avc");

      for (const [aba, letra] of Object.entries({
        estabilizacao: "a", neurologico: "b", reperfusao: "f", destino: "g",
      })) {
        await page.getByTestId(`avc-aba-${aba}`).click();
        const medida = await page.evaluate((l) => {
          const sc = document.querySelector(`[data-testid="avc-superficie-${l}-conteudo"]`);
          if (!sc) return null;
          sc.scrollIntoView(false);
          const ultimo = sc.lastElementChild?.getBoundingClientRect();
          const barra = document
            .querySelector('[data-testid="avc-barra"]')!
            .getBoundingClientRect();
          return ultimo ? { fim: ultimo.bottom, topoDaBarra: barra.top } : null;
        }, letra);
        expect(medida, `${aba}: superfície ⛔ não renderizou`).not.toBeNull();
        expect(medida!.fim, `${aba}: o fim do conteúdo ficou DEBAIXO da barra`)
          .toBeLessThanOrEqual(medida!.topoDaBarra + 1);
      }
    });

  /** ⚠️⚠️ ⛔ A BARRA ⛔ NÃO É PAINEL DE ALERTA — ⛔ nenhum badge com número. */
  test("⛔ a barra ⛔ NÃO carrega contagem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    const texto = await page.getByTestId("avc-barra").innerText();
    expect(texto, "badge numérico na navegação vira painel de alerta")
      .not.toMatch(/\d/);
  });

  /** ⚠️ ALCANCE: qualquer clínica abre a partir de qualquer outra, em UM toque. */
  test("as seis são alcançáveis de qualquer uma delas", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.goto("/modulos/avc");
    const seis = ["estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"];
    for (const de of seis) {
      await page.getByTestId(`avc-aba-${de}`).click();
      for (const para of seis) {
        await expect(
          page.getByTestId(`avc-aba-${para}`),
          `de ${de} ⛔ não se alcança ${para} em um toque`
        ).toBeVisible();
      }
    }
  });
});
