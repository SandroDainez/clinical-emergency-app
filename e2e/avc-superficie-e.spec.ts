import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma, abrirEixosDaEstabilizacao } from "./helpers";

/**
 * PROMETE: que E se COMPORTE na tela como registro de **ações** — que ⛔ nada nela
 * marque "corrigido", que o bloqueio ⛔ só caia com **nova aferição em Entrada e
 * estabilização**, que duas intervenções apareçam como duas, e que ⛔ nenhum
 * fármaco ou dose apareça enquanto F-19 estiver parcial.
 *
 * ⚠️ As provas de estado vivem em `scripts/prova-avc-superficie-e.cjs`.
 */
async function abrirAvc(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
}
const aba = (page: Page, id: string) => page.getByTestId(`avc-aba-${id}`).click();

/**
 * ⚠️⚠️ ⛔ CORREÇÕES ⛔ NÃO É FASE FIXA — 2026-09-06, decisão **C3**.
 *
 * ⛔ Ela era um cartão permanente numa faixa auxiliar. ⚠️ Agora ⛔ ela é um
 * **fluxo condicional**: aparece na barra quando há bloqueio a corrigir ⛔ ou
 * ação já registrada — ⛔ e some do caminho quando ⛔ não há ⛔ nem uma coisa
 * ⛔ nem outra.
 *
 * ⚠️ ⛔ Este helper existe para as specs chegarem lá **como o médico chega**:
 * ⛔ pelo problema que a exige.
 */
const abrirCorrecoes = (page: Page) => aba(page, "correcoes");

/** ⚠️ PA alta pelos degraus — ⛔ sem digitação, como todo número do app. */
async function paAlta(page: Page) {
  await aba(page, "estabilizacao");
  /** ⚠️ ⛔ Desde o acordeão, o eixo C nasce recolhido — ⛔ abrir é o caminho. */
  await abrirEixosDaEstabilizacao(page);
  /**
   * ⚠️ A PA entra pelo controle NOVO da Superfície A — caixa digitável.
   * ⛔ O contrato que esta spec protege é de **Correções**; a A é só o meio.
   */
  await page.getByTestId("avc-num-caixa-pas").fill("198");
  await page.getByTestId("avc-num-caixa-pad").fill("112");
}

/** ⚠️ Glicemia abaixo do corte de tratamento — ⛔ pelo mesmo caminho da PA. */
async function glicemiaBaixa(page: Page) {
  await aba(page, "estabilizacao");
  await abrirEixosDaEstabilizacao(page);
  await page.getByTestId("avc-num-caixa-glicemia").fill("48");
}

test.describe("AVC · Correções", () => {

  /* ══ ⚠️⚠️ O CICLO INTEIRO — GESTO REAL, Fase 7 ═══════════════════════════ */

  /**
   * ── ⚠️⚠️ ⛔ O DEFEITO QUE ESTE TESTE IMPEDE DE VOLTAR ─────────────────────
   *
   * ⛔ Medido em 2026-09-07: com **198/112** bloqueando ⛔ e uma nova aferição
   * contendo **só a PAS**, o bloqueio **desaparecia** — ⛔ o app destravava
   * sobre uma aferição que ⛔ **não existe**.
   *
   * ⚠️ ⛔ O gesto vai até o fim: detecta, trata, ⛔ **ainda** bloqueia, mede
   * ⛔ pela metade, ⛔ **continua** bloqueando, completa, ⛔ e ⛔ só então cai.
   */
  test("PA · o ciclo inteiro, ⛔ e meia aferição ⛔ NÃO destrava", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);

    /** ⚠️ 1 · problema detectado. */
    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-e-ciclo-bloqueado_corrigivel")).toBeVisible();

    /** ⚠️ 2 · ação corretiva registrada — ⛔ e ⛔ ela ⛔ NÃO resolve. */
    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
    await page.getByTestId("avc-opcao-acao_estado-Realizada").click();
    await expect(page.getByTestId("avc-e-ciclo-aguardando_reavaliacao")).toBeVisible();
    await expect(page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta")).toBeVisible();

    /** ⚠️⚠️ 3 · NOVA aferição, ⛔ e ⛔ só a sistólica. */
    await aba(page, "estabilizacao");
    await page.getByTestId("avc-nova-medida-pressao").click();
    await page.getByTestId("avc-num-caixa-pas").fill("170");

    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-e-ciclo-afericao_incompleta")).toBeVisible();
    /** ⚠️ ⛔ O bloqueio **⛔ não** sumiu. */
    await expect(page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta")).toBeVisible();
    /** ⚠️⚠️ ⛔ E a última COMPLETA continua sendo 198/112 — ⛔ D-120. */
    await expect(page.getByTestId("avc-e-ciclo-falta-ultima_pressao_completa"))
      .toContainText("198/112");
    await expect(page.getByTestId("avc-e-ciclo-falta-afericao_incompleta"))
      .toContainText(/PAS 170/);

    /** ⚠️⚠️ ⛔ E AS DUAS TELAS CONTAM A MESMA HISTÓRIA. */
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-afericao_incompleta")).toBeVisible();
    await expect(page.getByTestId("avc-campo-ivt_indicacao_confirmada")).toHaveCount(0);

    /** ⚠️ 4 · a diastólica **da mesma aferição** — ⛔ e ⛔ só agora fecha. */
    await aba(page, "estabilizacao");
    await page.getByTestId("avc-num-caixa-pad").fill("98");

    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta")).toHaveCount(0);

    /** ⚠️⚠️ ⛔ E o portão atualizou ⛔ **sem o médico voltar para descobrir**. */
    await expect(page.getByTestId("avc-e-ciclo-afericao_incompleta")).toHaveCount(0);
    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-motivo-pressao_acima_da_meta")).toHaveCount(0);
  });

  /**
   * ── ⚠️⚠️ ⛔ O CICLO GLICÊMICO TEM UM DEGRAU A MAIS, ⛔ E ⛔ ELE É DA FONTE ──
   *
   * ⛔ **F-06**: *"clinical deficits **should be assessed after correction of
   * glucose** to evaluate thrombolytic eligibility"*. ⚠️ ⛔ Normalizar a
   * glicemia ⛔ **não** reavalia o paciente.
   */
  test("glicemia · corrigir ⛔ não reavalia, ⛔ e a ORDEM é que fecha", async ({ page }) => {
    await abrirAvc(page);
    await glicemiaBaixa(page);

    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-e-ciclo-bloqueado_corrigivel")).toBeVisible();

    await page.getByTestId("avc-e-nova-acao-glicemia_alterada").click();
    await page.getByTestId("avc-opcao-acao_estado-Realizada").click();
    await expect(page.getByTestId("avc-e-ciclo-aguardando_reavaliacao")).toBeVisible();

    /** ⚠️ Glicemia normalizada — ⛔ e ⛔ **ainda** ⛔ não resolvido. */
    await aba(page, "estabilizacao");
    await page.getByTestId("avc-num-caixa-glicemia").fill("110");

    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-e-ciclo-aguardando_reavaliacao")).toBeVisible();
    await expect(page.getByTestId("avc-e-ciclo-falta-reavaliacao_neurologica"))
      .toContainText(/exame neurológico depois da correção/i);

    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-estado-aguardando_reavaliacao")).toBeVisible();

    /** ⚠️⚠️ ⛔ O exame **DEPOIS** da correção — ⛔ e ⛔ é a ordem que fecha. */
    await aba(page, "neurologico");
    await page.getByTestId("avc-opcao-deficit_focal-sim").click();

    await aba(page, "reperfusao");
    await expect(page.getByTestId("avc-f-portao-motivo-reavaliacao_neurologica")).toHaveCount(0);
  });

  /**
   * ── ⚠️⚠️ ⛔ ESTE TESTE MUDOU DE OBJETO (2026-09-06, decisão **C3**) ────────
   *
   * ⛔ Ele abria Correções **⛔ sem bloqueio ⛔ nenhum** ⛔ e conferia a frase de
   * vazio. ⚠️ Correções ⛔ deixou de ser fase fixa: ⛔ sem o que corrigir, ⛔ ela
   * **⛔ não está na barra** — ⛔ então esse cenário ⛔ nem é alcançável.
   *
   * ⚠️⚠️ ⛔ A GARANTIA FICOU MAIS FORTE, ⛔ e ⛔ são duas agora:
   *
   *   ⛔ **⛔ sem bloqueio, ⛔ ela ⛔ não ocupa a barra** — ⛔ é o fluxo condicional
   *      que o autor pediu, ⛔ medido na tela;
   *   ⛔ **resolvido o bloqueio, ⛔ ela CONTINUA alcançável** — ⛔ e ⛔ esta é a
   *      parte que quase me escapou: alcançá-la ⛔ só pelo problema deixaria o
   *      médico ⛔ sem porta para o anti-hipertensivo que ⛔ ele mesmo iniciou.
   */
  test("⛔ sem bloqueio, Correções ⛔ NÃO ocupa a barra", async ({ page }) => {
    await abrirAvc(page);
    await expect(page.getByTestId("avc-aba-correcoes")).toHaveCount(0);
  });

  test("com bloqueio, ⛔ ela aparece — e a frase de vazio continua existindo", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();
  });

  /**
   * ⚠️⚠️ O SENTINELA DA PA, NA TELA — e a parte que importa é o que ⛔ NÃO existe.
   */
  test("o bloqueio cai por NOVA AFERIÇÃO, e ⛔ nunca por um botão em Correções",
    async ({ page }) => {
      await abrirAvc(page);
      await paAlta(page);
      await aba(page, "correcoes");

      const bloco = page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta");
      await expect(bloco).toBeVisible();
      // ⚠️ Português primeiro, verbatim abaixo — mesmo contrato de D.
      await expect(page.getByTestId("avc-e-formulacao-pressao_acima_da_meta"))
        /**
       * ⚠️ ⛔ A frase mudou ⛔ em 2026-09-09, ⛔ a pedido do autor: *"a
       * recomendação é controlar a PA"*. ⛔ O que a trava mede — ⛔ que a
       * formulação da fonte **⛔ chega à tela** — ⛔ é o mesmo.
       */
        .toContainText(/controlar a pressão arterial antes de iniciar a trombólise/i);
      await expect(page.getByTestId("avc-e-verbo-pressao_acima_da_meta"))
        .toContainText("before IVT therapy is initiated");
      // ⚠️ E a tela DIZ o que faz o bloqueio cair.
      await expect(page.getByTestId("avc-e-resolve-pressao_acima_da_meta"))
        .toContainText(/nova aferição de pressão arterial/i);

      const tela = page.getByTestId("avc-superficie-e-conteudo");
      /** ⛔⛔ ⛔ NENHUM botão de "corrigido" — é a ausência que sustenta o contrato. */
      await expect(tela).not.toContainText(/corrigid|resolvid|normaliz/i);

      // ⚠️ Registrar a ação, e o bloqueio CONTINUA.
      await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
      await page.getByTestId("avc-opcao-acao_estado-Iniciada").click();
      await expect(bloco).toBeVisible();

      /** ⚠️⚠️ NOVA AFERIÇÃO em A — e é ela que derruba. */
      await aba(page, "estabilizacao");
      /** ⚠️ O botão é do BLOCO, e o bloco da PA se chama `pressao`. */
      await page.getByTestId("avc-nova-medida-pressao").click();
      /**
       * ⚠️⚠️ A nova aferição nasce **SEM valor** — foi este teste que revelou o
       * defeito oposto, e a correção entrou em A na mesma rodada. Daqui ela sobe
       * até ficar **abaixo de 185/110**, o limite da fonte antes da trombólise.
       */
      /** ⚠️ Vazio se lê no VALOR da caixa — `innerText` ⛔ não vê `<input>`. */
      await expect(page.getByTestId("avc-num-caixa-pas")).toHaveValue("");
      /** ⚠️ Daqui ela sobe até ficar ABAIXO de 185/110, o limite da fonte. */
      await page.getByTestId("avc-num-caixa-pas").fill("150");
      await page.getByTestId("avc-num-caixa-pad").fill("90");
      await aba(page, "correcoes");
      await expect(page.getByTestId("avc-e-bloqueio-pressao_acima_da_meta")).toHaveCount(0);
      // ⚠️ E a ação registrada ⛔ não some da trilha por o bloqueio ter caído.
      await aba(page, "estabilizacao");
      await expect(page.getByTestId("avc-campo-pas").first()).toBeVisible();
    });

  test("duas intervenções aparecem como DUAS", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");

    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();
    await page.getByTestId("avc-opcao-acao_estado-Realizada").click();
    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();

    await expect(page.getByTestId("avc-e-acao-acao_1")).toBeVisible();
    await expect(page.getByTestId("avc-e-acao-acao_2")).toBeVisible();
  });

  /**
   * ⚠️⚠️ OS ESTADOS ⛔ NÃO SÃO SEQUÊNCIA: quem chegou com o tratamento correndo
   * registra direto, ⛔ sem passar por uma sugestão que o app ⛔ nunca fez.
   */
  test("`Realizada` é registrável direto, e ⛔ não existe `Sugerida`", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");
    await page.getByTestId("avc-e-nova-acao-pressao_acima_da_meta").click();

    await expect(page.getByTestId("avc-opcao-acao_estado-Realizada")).toBeVisible();
    await expect(page.getByTestId("avc-opcao-acao_estado-Sugerida")).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-acao_estado-Disponível")).toHaveCount(0);
  });

  /**
   * ── ⚠️⚠️ ESTA PROVA MUDOU EM 2026-09-06, ⛔ E O MOTIVO ESTÁ ESCRITO ────────
   *
   * ⛔ A versão anterior proibia **qualquer fármaco na tela**, ⛔ e a própria
   * frase dela dizia por quê: *"⛔ NENHUM fármaco **enquanto F-19 estiver
   * parcial**"*. ⚠️ A premissa era a **ausência de fonte**, ⛔ e ⛔ não uma regra
   * clínica permanente.
   *
   * ⚠️ O autor entregou a revisão clínica em 2026-09-06; ela foi transcrita
   * (`f19-antihipertensivo-avc.md`), conferida contra a AHA/ASA 2026 ⛔ e
   * corrigida em **cinco atribuições**. ⛔ F-19 deixou de ser `parcial`.
   *
   * ⚠️⚠️ ⛔ MAS A PROVA ⛔ NÃO FOI AFROUXADA — ⛔ ela **trocou de eixo**, ⛔ e ficou
   * mais exigente no que continua valendo:
   *
   *   ⛔ mostrar dose ⛔ **não é** prescrever. ⛔ Continua proibido **preparo**,
   *      **diluição**, **bomba** ⛔ e instrução de **administração**.
   *   ⛔ ⛔ Nenhum agente pode ser apresentado como *"melhor"* ⛔ ou *"primeira
   *      escolha"* — ⛔ não há evidência de superioridade entre eles.
   *   ⛔ ⛔ Nenhuma dose pode aparecer **sem procedência** (**E-30**).
   *   ⛔ ⛔ E a dose histórica perigosa de esmolol ⛔ nunca pode voltar.
   */
  test("⛔ a tela mostra dose, ⛔ e ⛔ NÃO prescreve", async ({ page }) => {
    await abrirAvc(page);
    await paAlta(page);
    await aba(page, "correcoes");
    /**
     * ⚠️ ⛔ Os agentes nascem **fechados** desde 2026-09-09 (pedido do autor:
     * *"⛔ não poderia ser expansível?"*). ⛔ Quem mede o texto ⛔ deles ⛔ tem
     * de **abrir a gaveta** — ⛔ o conteúdo ⛔ não mudou, ⛔ o gesto ⛔ mudou.
     */
    for (const g of await page.getByTestId("avc-e-agentes-abrir").all()) {
      await g.click().catch(() => undefined);
    }
    const tela = await page.getByTestId("avc-superficie-e-conteudo").innerText();

    /** ⚠️ O que passou a ser **esperado**: F-19 transcrito chega ao médico. */
    expect(tela).toMatch(/Labetalol/i);
    expect(tela).toMatch(/10 a 20 mg/i);

    /** ⚠️⚠️ ⛔ E CADA DOSE VEM COM PROCEDÊNCIA — ⛔ e ⛔ nunca "AHA/ASA" ⛔ sem ano. */
    expect(tela).toMatch(/AHA\/ASA 2019/);
    expect(tela).not.toMatch(/AHA\/ASA(?!\s+(de\s+)?\d{4})/);
    expect(tela).toMatch(/não nomeia fármaco/i);

    /** ⛔ ⛔ PRESCREVER continua proibido. */
    expect(tela).not.toMatch(/diluir|diluição|soro fisiológico 0,9|bomba de infusão|ampola/i);

    /** ⛔ ⛔ E O APP ⛔ NÃO ESCOLHE O AGENTE. */
    expect(tela).not.toMatch(/primeira escolha|é superior|o melhor agente/i);
    expect(tela).toMatch(/escolha é do médico/i);

    /**
     * ⚠️⚠️ A DOSE HISTÓRICA PERIGOSA ⛔ NUNCA VOLTA — ⛔ **como dose**.
     *
     * ⚠️ ⛔ E ⛔ não basta proibir o texto: para **avisar** contra 3 mg/kg/min, o
     * alerta precisa **nomear** o valor. ⛔ A primeira versão desta asserção
     * proibia a string inteira ⛔ e reprovou o próprio aviso — bug da prova,
     * ⛔ e ⛔ não do app.
     *
     * ⚠️ A regra certa: **a proibição vem antes**. ⛔ O valor pode ser citado
     * — ⛔ no título que o proíbe ⛔ e na explicação do porquê —, ⛔ mas ⛔ nunca
     * antes de o leitor saber que ⛔ não deve usá-lo.
     */
    /**
     * ⚠️⚠️ ⛔ A FRASE MUDOU, ⛔ E A **REGRA ⛔ NÃO** — 2026-09-09.
     *
     * ⚠️ O autor perguntou *"por que tem esse aviso aqui? ⛔ não entendi"*:
     * ⛔ o alerta estava **⛔ solto**, ⛔ longe do esmolol. ⛔ Ele foi ⛔ para
     * ⛔ dentro do cartão do agente, ⛔ e o título passou a **nomeá-lo**:
     * *"Esmolol — ⛔ não usar 3 mg por quilo por minuto"*.
     *
     * ⛔ ⛔ **⛔ O que esta trava protege ⛔ continua idêntico:** ⛔ a proibição
     * vem **⛔ antes** do valor, ⛔ e o motivo vem junto. ⛔ Só os caracteres
     * mudaram.
     */
    const proibicao = tela.search(/não usar 3\s*mg/i);
    const valorPerigoso = tela.search(/3\s*mg\s*(?:por quilo|\/kg)\s*(?:por minuto|\/min)/i);
    expect(proibicao).toBeGreaterThanOrEqual(0);
    expect(valorPerigoso).toBeGreaterThanOrEqual(proibicao);
    /** ⚠️ ⛔ E o motivo aparece junto — ⛔ proibição ⛔ sem motivo ⛔ não ensina. */
    expect(tela).toMatch(/dez vezes o teto/i);
  });

  /**
   * ⚠️⚠️ F-18 · GLICEMIA — ⛔ o reflexo antigo ⛔ não pode voltar pela tela.
   *
   * ⛔ `<50` ⛔ e `>400` foram, por anos, critério de **exclusão**. ⚠️ Um app que
   * os apresente assim faria o médico **deixar de trombolisar alguém elegível**
   * — ⛔ e esse erro ⛔ não aparece em log ⛔ nenhum.
   */
  test("⛔ disglicemia grave ⛔ NÃO é apresentada como contraindicação", async ({ page }) => {
    await abrirAvc(page);
    await glicemiaBaixa(page);
    await aba(page, "correcoes");
    /**
     * ⚠️ ⛔ Os agentes nascem **fechados** desde 2026-09-09 (pedido do autor:
     * *"⛔ não poderia ser expansível?"*). ⛔ Quem mede o texto ⛔ deles ⛔ tem
     * de **abrir a gaveta** — ⛔ o conteúdo ⛔ não mudou, ⛔ o gesto ⛔ mudou.
     */
    for (const g of await page.getByTestId("avc-e-agentes-abrir").all()) {
      await g.click().catch(() => undefined);
    }
    const tela = await page.getByTestId("avc-superficie-e-conteudo").innerText();

    /** ⚠️ A pergunta que decide ⛔ e os dois ramos dela. */
    expect(tela).toMatch(/déficit neurológico persiste depois de corrigir/i);
    expect(tela).toMatch(/mimetizador metabólico/i);

    /** ⛔ ⛔ E a negação está **escrita**, ⛔ e ⛔ não implícita. */
    expect(tela).toMatch(/não é contraindicação absoluta/i);

    /** ⛔ ⛔ NENHUMA dose fixa de insulina. */
    expect(tela).not.toMatch(/\d+\s*(UI|unidades)\b/i);
    expect(tela).toMatch(/Não existe dose fixa recomendada/i);
  });

  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    /** ⚠️ ⛔ Correções ⛔ só existe na barra quando há o que corrigir (**C3**). */
    await paAlta(page);
    await abrirCorrecoes(page);
    await expect(page.getByTestId("avc-superficie-e-conteudo")).toBeVisible();
  });
});
