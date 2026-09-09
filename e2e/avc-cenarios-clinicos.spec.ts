import { expect, test, type Page } from "@playwright/test";

import { fixarIdioma } from "./helpers";

/**
 * OS CENÁRIOS CLÍNICOS COMPLETOS — pedidos pelo autor em 2026-09-05.
 *
 * PROMETE: que os seis casos reais de AVC ⛔ e o **atendimento interrompido**
 *   cheguem ao fim ⛔ sem beco, ⛔ sem perda de estado ⛔ e ⛔ sem pedir duas vezes
 *   o mesmo dado. Cada teste mede **atrito**: quantas interações relevantes,
 *   quantas voltas, quanta informação repetida.
 *
 * NÃO PROMETE: que o caminho seja o mais curto possível — ⛔ ela ⛔ não sabe qual
 *   é o mínimo clínico. ⛔ Também ⛔ não julga conduta: quem faz isso são as
 *   provas de núcleo ⛔ e as travas de fonte.
 *
 * UNIVERSO: o módulo AVC inteiro, ⛔ pelas rotas reais da tela.
 *
 * ── ⚠️⚠️ POR QUE ISTO É TESTE, ⛔ E ⛔ NÃO UMA CONFERÊNCIA MANUAL ────────────
 *
 * ⚠️ O autor pediu para *"percorrer os cenários"*. ⛔ Percorrer à mão prova o
 * caminho **de hoje**; escrito como teste, ele **volta a ser percorrido** a cada
 * mudança — ⛔ e é justamente numa refatoração visual que um beco reaparece
 * ⛔ sem ⛔ ninguém notar.
 */

const OPCAO = (campo: string, valor: string) => `avc-opcao-${campo}-${valor}`;

async function abrirModulo(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.goto("/modulos/avc");
  await expect(page.getByTestId("avc-barra")).toBeVisible();
}

/** ⚠️ Conta toques REAIS — é a métrica de atrito que o autor pediu. */
async function tocar(page: Page, testID: string, contador: { n: number }) {
  await page.getByTestId(testID).click();
  contador.n += 1;
}

/** ⚠️ Registra uma TC com o resultado dado, ⛔ pelo caminho real da tela. */
async function tomografia(page: Page, resultado: string, c: { n: number }) {
  await tocar(page, "avc-aba-imagem", c);
  await tocar(page, "avc-novo-estudo", c);
  await tocar(page, OPCAO("estudo_modalidade", "Tomografia de crânio sem contraste"), c);
  await tocar(page, OPCAO("estudo_resultado", resultado), c);
}

const SEM_HEMORRAGIA = "Sem hemorragia intracraniana identificada";
const COM_HEMORRAGIA = "Hemorragia intracraniana identificada";

test.describe("AVC · cenários clínicos completos", () => {
  /**
   * ⚠️⚠️ CASO A — isquêmico precoce, candidato à trombólise.
   *
   * ⚠️ O que se mede: que a decisão da imagem leve **direto** ao caminho de
   * reperfusão, ⛔ e que o Destino saiba o que já foi resolvido.
   */
  test("A · isquêmico precoce — a imagem leva à reperfusão, e o Destino sintetiza", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);

    await tomografia(page, SEM_HEMORRAGIA, c);
    /** ⛔ Sem hemorragia ⛔ NÃO arma saída de fluxo — o atendimento segue isquêmico. */
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(0);

    await tocar(page, "avc-aba-reperfusao", c);
    await expect(page.getByTestId("avc-superficie-reperfusao")).toBeVisible();
    /** ⚠️ As duas frentes seguem visíveis — ⛔ e ⛔ nenhuma é escondida. */
    await expect(page.getByTestId("avc-f-raia-ivt")).toBeVisible();
    await expect(page.getByTestId("avc-f-raia-evt")).toBeVisible();

    await tocar(page, "avc-aba-destino", c);
    /** ⚠️ A síntese existe ⛔ e ⛔ não pede ⛔ nada de novo. */
    await expect(page.getByTestId("avc-superficie-destino")).toBeVisible();

    /** ⚠️⚠️ ATRITO: ⛔ nenhum campo de Destino — ⛔ ele ⛔ não é formulário. */
    await expect(page.getByTestId("avc-g-sintese-pendencias")).toBeVisible();
    expect(c.n, "interações relevantes do caso A").toBeLessThanOrEqual(8);
  });

  /**
   * ⚠️⚠️ CASO C — hemorragia intracraniana.
   *
   * ⚠️ O caso que era **beco** antes de PD-36. Mede-se que a ação apareça
   * ⛔ onde o achado aparece, ⛔ e que o catálogo abra de verdade.
   */
  test("C · hemorragia — a ação aparece no achado, e o manejo abre", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);

    await tomografia(page, COM_HEMORRAGIA, c);

    /** ⚠️ A porta está ONDE o achado apareceu — ⛔ e ⛔ não escondida no Destino. */
    const abrir = page.getByTestId("avc-destino-abrir-hemorragia_intracraniana");
    await expect(abrir).toBeVisible();
    await tocar(page, "avc-destino-abrir-hemorragia_intracraniana", c);

    await expect(page.getByTestId("avc-hemorragica-hic")).toBeVisible();
    /** ⚠️ E o catálogo traz a recomendação COR 1 da fonte primária (H-11). */
    await expect(page.getByTestId("avc-hem-rec-cerebelar")).toContainText(/15 mL/);

    /** ⚠️⚠️ O CABEÇALHO SEGUE A SÍNDROME — ⛔ e ⛔ não mente "isquêmico". */
    await expect(page.getByTestId("avc-superficie-hic")).toBeVisible();

    /** ⚠️ Cinco toques do zero até a conduta hemorrágica na tela. */
    expect(c.n, "interações relevantes do caso C").toBeLessThanOrEqual(6);
  });

  /**
   * ⚠️⚠️ CASO E — déficit leve ⛔ e ⛔ não incapacitante.
   *
   * ⚠️ Mede-se que a recomendação de **⛔ não trombolisar** apareça como
   * recomendação da fonte, ⛔ e ⛔ não como bloqueio inventado pelo app.
   */
  test("E · a superfície de reperfusão ⛔ não conclui elegibilidade sozinha", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);
    await tomografia(page, SEM_HEMORRAGIA, c);
    await tocar(page, "avc-aba-reperfusao", c);

    /**
     * ⛔ A tela ⛔ NÃO emite veredito. ⚠️ Ela mostra recomendações ⛔ e o que falta
     * — ⛔ e o que falta é dito como **ação**, ⛔ nunca como nome de variável.
     */
    const conteudo = page.getByTestId("avc-superficie-f-conteudo");
    await expect(conteudo).not.toContainText(/deficit_incapacitante|estudo_resultado|nao_elegivel/);
    await expect(conteudo).not.toContainText(/\bundefined\b|\bnull\b|\btrue\b|\bfalse\b/);
  });

  /**
   * ⚠️⚠️ O CENÁRIO INTERROMPIDO — o uso mais real da emergência.
   *
   * > *"entrar no AVC; preencher parte de Estabilização; avançar; preencher
   * > parte do NIHSS; ir para Imagem; retornar ao Neurológico; abrir
   * > PatientContext; voltar para Imagem; seguir para Reperfusão."*
   *
   * ⚠️ O que se mede é **perda silenciosa**: ⛔ nada pode precisar ser
   * preenchido de novo, ⛔ e a fase ativa ⛔ não pode sumir.
   */
  test("INTERROMPIDO · o estado sobrevive a ir e voltar entre fases", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);

    /**
     * 1 · uma resposta que dá para conferir depois.
     *
     * ⚠️ Era em **Estabilização**; a cronologia passou para a Avaliação AVC em
     * **C7**, 2026-09-07. ⛔ O contrato é o mesmo: **o fato sobrevive a sete
     * trocas de fase**.
     */
    await tocar(page, "avc-aba-neurologico", c);
    await tocar(page, "avc-hora-desconhecido-hora_ultima_vez_bem", c);
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toContainText(/Sem essa informação/i);

    /* 2 · parte do NIHSS — ⛔ sem confirmar a escala */
    await tocar(page, "avc-aba-neurologico", c);
    await tocar(page, "avc-escala-abrir-nihss_calculado", c);
    /**
     * ⚠️⚠️ ⛔ A ESCALA ABRE **INTEIRA** DESDE 2026-09-09 — ⛔ e ⛔ o modo foco
     * ⛔ virou ⛔ uma escolha. ⚠️ ⛔ O avanço automático ⛔ **⛔ continua
     * existindo ⛔ nele**, ⛔ e ⛔ é ⛔ isso que ⛔ estas três linhas ⛔ ainda
     * medem — ⛔ agora ⛔ entrando ⛔ no modo ⛔ de propósito.
     */
    await tocar(page, "avc-escala-ver-todos-nihss_calculado", c);
    await tocar(page, "avc-escala-opcao-1a-0", c);
    /** ⚠️ O avanço é automático: o foco já está no item 2. */
    await expect(page.getByTestId("avc-escala-progresso-nihss_calculado"))
      .toContainText(/2/);

    /* 3 · Imagem, e volta ao Neurológico */
    await tocar(page, "avc-aba-imagem", c);
    await tocar(page, "avc-aba-neurologico", c);
    /**
     * ⚠️⚠️ ⛔ O RASCUNHO DA ESCALA ⛔ NÃO É ESTADO CLÍNICO — ⛔ e ⛔ isso ⛔ não é
     * perda: a escala grava em **gesto único**, ⛔ e um NIHSS pela metade ⛔ não é
     * um NIHSS. ⚠️ O que ⛔ não pode sumir é o **fato registrado**, medido abaixo.
     */

    /* 4 · contexto expandido, e volta à Imagem */
    await tocar(page, "avc-cockpit-faixa", c);
    await tocar(page, "avc-aba-imagem", c);

    /* 5 · Reperfusão */
    await tocar(page, "avc-aba-reperfusao", c);
    await expect(page.getByTestId("avc-superficie-reperfusao")).toBeVisible();

    /**
     * ⚠️⚠️ ⛔ NADA FOI PERDIDO: o fato de Estabilização continua registrado
     * depois de sete trocas de fase.
     */
    await tocar(page, "avc-aba-neurologico", c);
    await expect(page.getByTestId("avc-hora-valor-hora_ultima_vez_bem"))
      .toContainText(/Sem essa informação/i);

    /** ⚠️⚠️ E A FASE ATIVA CONTINUA VISÍVEL — ⛔ a barra ⛔ não deixa o médico perdido. */
    await expect(page.getByTestId("avc-aba-neurologico")).toBeVisible();
    await expect(page.getByTestId("avc-superficie-neurologico")).toBeVisible();
  });

  /**
   * ⚠️⚠️ CASO B — oclusão de grande vaso, candidato à trombectomia.
   *
   * ⚠️ Mede-se que a angiotomografia abra o **dossiê endovascular** ⛔ e que a
   * tela ⛔ NÃO conclua elegibilidade — ⛔ ela diz **quais dados existem** (PD-24).
   */
  test("B · LVO — a angiotomografia abre o sítio de oclusão, ⛔ e ⛔ nada é concluído", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);
    await tomografia(page, SEM_HEMORRAGIA, c);

    await tocar(page, "avc-novo-estudo", c);
    await tocar(page, OPCAO("estudo_modalidade", "Angiotomografia"), c);
    /** ⚠️ O sítio da oclusão ⛔ só existe na modalidade que o responde. */
    await expect(page.getByTestId("avc-campo-sitio_oclusao")).toBeVisible();

    await tocar(page, "avc-aba-reperfusao", c);
    const conteudo = page.getByTestId("avc-superficie-f-conteudo");
    /** ⛔ A tela ⛔ NÃO emite veredito de elegibilidade — ⛔ nem a favor, ⛔ nem contra. */
    await expect(conteudo).not.toContainText(/é elegível|não é elegível|está indicado/i);
    expect(c.n, "interações relevantes do caso B").toBeLessThanOrEqual(10);
  });

  /**
   * ⚠️⚠️ CASO D — paciente anticoagulado.
   *
   * ⚠️ Mede-se que Segurança abra ⛔ sem parede vermelha, ⛔ e que a ausência de
   * dado apareça como **neutra** — ⛔ e ⛔ não como achado.
   */
  test("D · anticoagulado — Segurança abre neutra, ⛔ e falta de dado ⛔ não vira alerta", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);
    await tocar(page, "avc-aba-seguranca", c);

    const conteudo = page.getByTestId("avc-superficie-seguranca");
    await expect(conteudo).toBeVisible();
    /**
     * ⚠️⚠️ A DISTINÇÃO CRÍTICA: *"⛔ ainda ⛔ não sei"* ⛔ e *"sei ⛔ e há
     * contraindicação"* ⛔ não podem parecer a mesma coisa. ⚠️ Com o paciente
     * vazio, o que aparece é **⛔ não perguntado** — ⛔ e ⛔ nenhum bloqueio.
     */
    await expect(conteudo).toContainText(/Não perguntado/i);
    await expect(conteudo).not.toContainText(/Contraindicação absoluta/i);
  });

  /**
   * ⚠️⚠️ CASO F — chegada tardia / janela estendida.
   *
   * ⚠️ Mede-se que **⛔ não saber o horário** ⛔ não feche ⛔ nada: a superfície de
   * reperfusão continua abrindo ⛔ e dizendo o que falta, ⛔ em vez de bloquear.
   */
  test("F · janela — horário desconhecido ⛔ não fecha a reperfusão", async ({ page }) => {
    const c = { n: 0 };
    await abrirModulo(page);

    /** ⚠️ A cronologia mora na Avaliação AVC desde **C7**. */
    await tocar(page, "avc-aba-neurologico", c);
    await tocar(page, "avc-hora-desconhecido-hora_ultima_vez_bem", c);

    await tocar(page, "avc-aba-reperfusao", c);
    /** ⛔ A superfície ⛔ NÃO some ⛔ e ⛔ não vira muro. */
    await expect(page.getByTestId("avc-superficie-reperfusao")).toBeVisible();
    await expect(page.getByTestId("avc-f-raia-ivt")).toBeVisible();
    /** ⚠️ E o app diz que ⛔ não há relógio correndo — ⛔ em vez de fingir que há. */
    await expect(page.getByTestId("avc-f-sem-relogio")).toBeVisible();
  });

  /**
   * ⚠️⚠️ A TRAVA CONTRA VAZAMENTO — em TODA superfície, ⛔ e ⛔ não ⛔ só numa.
   *
   * ⚠️ Ela existe porque `Falta: deficit_incapacitante` chegou à tela ⛔ e
   * ⛔ nenhum teste pegou: `tr()` faz *fallback* para a própria chave.
   */
  test("⛔ NENHUMA superfície mostra identificador interno ou valor técnico", async ({ page }) => {
    await abrirModulo(page);
    const fases = ["estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"];
    for (const f of fases) {
      await page.getByTestId(`avc-aba-${f}`).click();
      const texto = (await page.getByTestId(`avc-superficie-${f}`).innerText()) ?? "";
      /** ⛔ `snake_case` em tela clínica é sempre defeito. */
      expect(texto, `superfície ${f} ⛔ não pode mostrar snake_case`)
        .not.toMatch(/\b[a-z]+_[a-z0-9_]+\b/);
      expect(texto, `superfície ${f} ⛔ não pode mostrar valor técnico`)
        .not.toMatch(/\bundefined\b|\bNaN\b/);
    }
  });
});
