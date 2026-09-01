import { expect, test, type Page } from "@playwright/test";

import {
  MODALIDADE,
  RESULTADO_TC,
  TODOS_OS_CAMPOS_C,
} from "../avc/conteudo/superficie-c";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície C se COMPORTE na tela como ponto de decisão da
 * imagem — que as quatro respostas da tomografia sejam tocáveis, que o destino
 * apareça como **um** cartão e ⛔ nunca dois, que a saída declare o módulo
 * inexistente em vez de virar beco, que o laudo pendente **mantenha** a
 * pendência à vista, e que ⛔ nada na tela cobre exames adicionais nem
 * cronometre a tomografia.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-c.cjs`.
 * Aqui mede-se o que só a tela mostra.
 */
async function abrirC(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-imagem").click();
  await expect(page.getByTestId("avc-superficie-c-conteudo")).toBeVisible();
}

/** ⚠️ O valor gravado é o RÓTULO nestes campos — vocabulário próprio. */
const OPCAO = (campo: string, valor: string) => `avc-opcao-${campo}-${valor}`;

/** ⚠️ Abre um exame e declara a modalidade — sem ela, ⛔ nenhum achado aparece. */
async function novoExame(page: Page, modalidade: string) {
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId(OPCAO("estudo_modalidade", modalidade)).click();
}
/** ⚠️ Campo preenchido vira leitura: mexer nele exige o gesto de correção. */
async function corrigir(page: Page, campo: string) {
  await page.getByTestId(`avc-corrigir-${campo}`).click();
}

test.describe("AVC · Superfície C — Imagem", () => {
  /**
   * ⚠️⚠️ CONTRATO CLÍNICO: **juízo sobre o paciente e capacidade do serviço são
   * espécies diferentes**, e a tela ⛔ não pode juntá-las sob um cabeçalho só.
   *
   * ⚠️ Antes de 2026-09-01 este teste conferia *"os DOIS blocos"*, com
   * `suspeita_hsa`, `suspeita_lvo` e `angio_disponibilidade` sob o título
   * *"Juízo clínico e disponibilidade"*. ⛔ A asserção ⛔ não foi removida — ela
   * ficou **mais forte**: agora exige a separação, a ordem (o operacional por
   * último) ⛔ e a fronteira escrita, que é o que impede *"⛔ não temos angioTC"*
   * de ser lido como *"⛔ não há indicação de imagem vascular"*.
   */
  test("a superfície separa juízo clínico de capacidade, e ⛔ sem imagem avançada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await expect(page.getByTestId("avc-grupo-estudos")).toBeVisible();
    await expect(page.getByTestId("avc-grupo-juizo")).toBeVisible();
    await expect(page.getByTestId("avc-grupo-capacidade")).toBeVisible();

    // ⚠️ A suspeita clínica mora no juízo; a disponibilidade, ⛔ na capacidade.
    await expect(page.getByTestId("avc-grupo-juizo"))
      .toContainText(/Suspeita clínica de hemorragia subaracnóidea/i);
    await expect(page.getByTestId("avc-grupo-juizo")).not.toContainText(/Angiotomografia neste serviço/i);
    await expect(page.getByTestId("avc-grupo-capacidade")).toContainText(/Angiotomografia neste serviço/i);

    /**
     * ⚠️⚠️ E A FRONTEIRA ESTÁ **ESCRITA**, ⛔ não presumida do desenho: separar em
     * dois blocos sem dizer o que a separação significa é ⛔ só arrumação.
     */
    await expect(page.getByTestId("avc-fronteira-operacional"))
      .toContainText(/não altera indicação clínica nem equivale a contraindicação/i);

    /** ⚠️ O operacional é o ÚLTIMO — posto antes, vira filtro de entrada. */
    const ordem = await page.getByTestId("avc-superficie-c-conteudo").evaluate((raiz) => {
      const ids = ["avc-grupo-estudos", "avc-grupo-juizo", "avc-grupo-capacidade"];
      return ids.map((id) =>
        Array.from(raiz.querySelectorAll("[data-testid]")).findIndex(
          (n) => n.getAttribute("data-testid") === id
        )
      );
    });
    expect(ordem[0]).toBeLessThan(ordem[1]);
    expect(ordem[1]).toBeLessThan(ordem[2]);
    /**
     * ⛔⛔ `imagem_avancada` saiu INTEIRO em 2026-08-30, inclusive a opção
     * "Nenhuma": negativa agregada sem leitor.
     */
    await expect(page.getByTestId("avc-grupo-imagem-avancada")).toHaveCount(0);
    await expect(page.getByTestId("avc-campo-imagem_avancada")).toHaveCount(0);
    // ⚠️ E a tela nasce sem exame nenhum, dizendo isso.
    await expect(page.getByTestId("avc-estudos-vazio")).toBeVisible();
  });

  /**
   * ⚠️⚠️ A MATRIZ NA TELA: sem modalidade, ⛔ nenhum achado aparece; e a RM ⛔ não
   * herda hipodensidade ⛔ só por ser imagem de parênquima.
   */
  test("a modalidade decide o que o exame pergunta", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId("avc-novo-estudo").click();
    // ⛔ Sem modalidade declarada, o app ⛔ não sabe o que aquele exame responde.
    await expect(page.getByTestId("avc-campo-estudo_resultado")).toHaveCount(0);
    await expect(page.getByTestId("avc-campo-hipodensidade_clara")).toHaveCount(0);

    await page.getByTestId(OPCAO("estudo_modalidade", MODALIDADE.tcSemContraste)).click();
    await expect(page.getByTestId("avc-campo-estudo_resultado")).toBeVisible();
    await expect(page.getByTestId("avc-campo-hipodensidade_clara")).toBeVisible();
    await expect(page.getByTestId("avc-campo-sitio_oclusao")).toHaveCount(0);

    await novoExame(page, MODALIDADE.rm);
    // ⛔ A RM ⛔ NÃO herda hipodensidade ⛔ nem ASPECTS.
    await expect(page.getByTestId("avc-campo-hipodensidade_clara")).toHaveCount(0);
    await expect(page.getByTestId("avc-campo-aspects")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ **E-23 NA TELA.** Antes de qualquer toque, ⛔ nenhuma opção pode estar
   * marcada, e a leitura ⛔ não pode afirmar ausência de hemorragia.
   */
  test("sem tomografia, a tela ⛔ não afirma ausência de hemorragia", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    /**
     * ⚠️⚠️ **E-23**: a frase fala da TRILHA, e ⛔ nunca do mundo. "Ainda ⛔ não
     * realizada" seria afirmação tirada da ausência de registro.
     */
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/Nenhuma tomografia sem contraste registrada/i);
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .not.toContainText(/não realizada/i);
    // ⛔ E ⛔ nenhum destino armado.
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ **PD-22 NA TELA** — o estado que o autor mandou ⛔ não fechar.
   */
  test("laudo pendente é resposta registrada e MANTÉM a pendência à vista", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await expect(page.getByTestId("avc-pendencia-tc_resultado")).toBeVisible();
    /**
     * ⚠️⚠️ O laudo pendente ⛔ deixou de ser VALOR e passou a ser **estado
     * derivado**: existe o exame, ⛔ não existe o resultado.
     */
    await novoExame(page, MODALIDADE.tcSemContraste);

    await expect(page.getByTestId("avc-pendencia-tc_resultado"))
      .toContainText(/quando o laudo estiver disponível/i);

    // ⚠️ Só o resultado conclusivo a fecha.
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.semHemorragia)).click();
    await expect(page.getByTestId("avc-pendencia-tc_resultado")).toHaveCount(0);
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/excluída pela tomografia/i);
  });

  /**
   * ⚠️⚠️ **E-09 NA TELA** — destino para módulo inexistente ⛔ não é beco.
   */
  test("hemorragia produz destino nomeado, que declara o módulo inexistente", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.hemorragia)).click();

    const destino = page.getByTestId("avc-destino-imagem");
    await expect(destino).toBeVisible();
    await expect(destino).toContainText(/AVC hemorrágico/i);
    await expect(page.getByTestId("avc-destino-modulo-inexistente"))
      .toContainText(/ainda não existe/i);
    // ⚠️ E o que acontece MESMO ASSIM — sem isto, o destino seria um vazio educado.
    await expect(destino).toContainText(/o atendimento continua/i);
  });

  /**
   * ⚠️⚠️ **PD-21 NA TELA, com a revisão do autor:** os dois fatos coexistem, o
   * médico vê **uma** saída — e ela é a **hemorrágica**. Uma suspeita ⛔ não
   * sobrepõe um achado de imagem confirmado.
   */
  test("com hemorragia E suspeita de HSA, a saída é hemorrágica, e a suspeita fica junto", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.hemorragia)).click();
    await page.getByTestId(OPCAO("suspeita_hsa", "sim")).click();

    // ⚠️ UM cartão de destino, e ele é o da hemorragia identificada.
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(1);
    await expect(page.getByTestId("avc-destino-hemorragia_intracraniana")).toBeVisible();
    await expect(page.getByTestId("avc-destino-suspeita_hsa")).toHaveCount(0);

    // ⛔ E a suspeita ⛔ NÃO some — vem associada, ⛔ não como destino rival.
    await expect(page.getByTestId("avc-destino-associado-suspeita_hsa"))
      .toContainText(/Há também suspeita de hemorragia subaracnóidea/i);
    // ⚠️ E as duas leituras continuam vivas, cada uma dizendo o seu.
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/Hemorragia intracraniana/i);
    await expect(page.getByTestId("avc-leitura-curto-suspeita_hsa"))
      .toContainText(/Suspeita clínica de hemorragia subaracnóidea registrada/i);
  });

  /**
   * ⚠️ E o outro lado da mesma regra: **sem** hemorragia identificada, a suspeita
   * de HSA arma a saída específica dela.
   */
  test("suspeita de HSA sem hemorragia identificada arma a saída de HSA", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.semHemorragia)).click();
    await page.getByTestId(OPCAO("suspeita_hsa", "sim")).click();

    await expect(page.getByTestId("avc-destino-suspeita_hsa")).toBeVisible();
    await expect(page.getByTestId("avc-destino-associado-suspeita_hsa")).toHaveCount(0);
  });

  /**
   * ⚠️ "Incerto" ⛔ não arma saída e ⛔ não vira "Não": vira tarefa nomeada.
   */
  test("suspeita de HSA incerta abre pendência e ⛔ não arma a saída", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("suspeita_hsa", "nao_sei")).click();
    await expect(page.getByTestId("avc-destino-imagem")).toHaveCount(0);
    await expect(page.getByTestId("avc-pendencia-suspeita_hsa")).toBeVisible();
    await expect(page.getByTestId("avc-leitura-curto-suspeita_hsa")).toContainText(/em aberto/i);
  });

  /**
   * ⚠️⚠️ **E-26 NA TELA** — a pendência que ⛔ não tem como ser resolvida ⛔ não pode
   * existir. Onde o serviço ⛔ não tem angiotomografia, cobrar angiotomografia é
   * ruído permanente.
   */
  test("a pendência vascular fecha tanto por exame feito quanto por indisponibilidade", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await page.getByTestId(OPCAO("suspeita_lvo", "sim")).click();
    await expect(page.getByTestId("avc-pendencia-imagem_vascular")).toBeVisible();

    await page.getByTestId(OPCAO("angio_disponibilidade", "Não disponível neste serviço")).click();
    await expect(page.getByTestId("avc-pendencia-imagem_vascular")).toHaveCount(0);
    await expect(page.getByTestId("avc-leitura-curto-imagem_vascular"))
      .toContainText(/não disponível neste serviço/i);
  });

  /**
   * ⚠️⚠️ A ALERGIA A CONTRASTE — decisão do autor, com as três travas dele.
   */
  /**
   * ⚠️⚠️ A ALERGIA ⛔ NÃO É PERGUNTADA AQUI — autor, 2026-08-30: *"⛔ no A já coleta
   * sobre alergias e no C de novo, ⛔ só deixamos no A"*.
   */
  test("a alergia a contraste ⛔ não é perguntada em C, ⛔ mas é lida", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    // ⛔ A pergunta ⛔ NÃO aparece: ela mora no painel Paciente.
    await expect(page.getByTestId("avc-campo-alergia_contraste")).toHaveCount(0);
    // ⚠️ A leitura continua: ler ⛔ não é coletar.
    await expect(page.getByTestId("avc-leitura-curto-alergia_contraste")).toBeVisible();
    // ⛔ E ⛔ nenhuma pendência nasce dela.
    await expect(page.getByTestId("avc-pendencia-alergia_contraste")).toHaveCount(0);
  });

  /**
   * ⚠️⚠️ O RELATO DO AUTOR (2026-08-29): *"o usuário ⛔ não sabe classificar isso"*.
   * A tela precisa **dizer que o app ⛔ não calcula**, sem abrir ⛔ nada.
   */
  test("o ASPECTS declara que é informado, e que o app ⛔ não calcula", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    const campo = page.getByTestId("avc-campo-aspects");
    await expect(campo).toContainText(/informado no laudo ou pela equipe/i);
    // ⚠️ VISÍVEL, e ⛔ não atrás do ⓘ: quem ⛔ não abre o ⓘ é justamente quem chuta.
    await expect(campo).toContainText(/não calcula o ASPECTS/i);
    await expect(campo).toContainText(/sem estimar/i);
    // ⛔ E ⛔ nenhum território escrito enquanto F-28 está aberto.
    await expect(campo).not.toContainText(/ínsula|caudado|lentiform/i);
  });

  /**
   * ⚠️⚠️ HIPODENSIDADE CLARA — o único achado de TC com critério transcrito, e a
   * definição precisa estar **visível**, ⛔ não atrás do ⓘ.
   */
  test("a hipodensidade clara traz a definição da fonte, e ⛔ não conclui", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    const campo = page.getByTestId("avc-campo-hipodensidade_clara");
    await expect(campo).toContainText(/substância branca contralateral/i);

    await page.getByTestId(OPCAO("hipodensidade_clara", "sim")).click();
    const leitura = page.getByTestId("avc-leitura-curto-hipodensidade_clara");
    await expect(leitura).toContainText(/Hipodensidade clara registrada/i);
    // ⛔ E a tela ⛔ NÃO decide sobre trombólise.
    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/não elegív|está contraindicad|não trombolis/i);

    // ⛔ E ela ⛔ não retém a reperfusão: a exclusão de hemorragia segue intacta.
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.semHemorragia)).click();
    await expect(page.getByTestId("avc-leitura-curto-exclusao_hemorragia"))
      .toContainText(/excluída pela tomografia/i);
  });

  /**
   * ⚠️⚠️ **R2.5 / 🚫 #3 NA TELA:** ⛔ nenhum cronômetro, ⛔ nenhuma meta.
   */
  test("o horário da tomografia se registra, e ⛔ não vira meta nem contagem", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/25 minutos/i);
    await expect(conteudo).not.toContainText(/atrasad/i);

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId("avc-hora-estudo_hora").click();
    await expect(page.getByTestId("avc-seletor-hora")).toBeVisible();
  });

  /**
   * ⚠️⚠️ **R2.3 NA TELA:** a regra contra o atraso fica VISÍVEL, sem abrir nada —
   * e distingue a tomografia que exclui hemorragia de "exame adicional".
   */
  test("a nota contra o atraso está visível, com a distinção que o autor fixou", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const nota = page.getByTestId("avc-grupo-nota-estudos");
    await expect(nota).toContainText(/Não atrase a trombólise por exames de imagem adicionais/i);
    await expect(nota).toContainText(/não é exame adicional/i);
  });

  /**
   * ⚠️⚠️ **SENTINELA 1 NA TELA** — duas TCs que discordam, e a tela ⛔ não elege.
   */
  test("duas TCs discordantes: as duas aparecem, e ⛔ nenhuma é eleita", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId(OPCAO("estudo_procedencia", "Serviço externo")).click();
    await page.getByTestId("avc-hora-desconhecido-estudo_hora").click();
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.semHemorragia)).click();

    await novoExame(page, MODALIDADE.tcSemContraste);
    await page.getByTestId(OPCAO("estudo_procedencia", "Este serviço")).click();
    await page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.hemorragia)).click();

    const leitura = page.getByTestId("avc-leitura-curto-exclusao_hemorragia");
    await expect(leitura).toContainText(/resultados divergentes/i);
    /**
     * ⚠️⚠️ E ela NOMEIA os dois exames — **E-30**. Com três estudos na tela, "há
     * divergência" ⛔ não diz onde está o conflito que retém a reperfusão.
     */
    /**
     * ⚠️⚠️ E ELA NOMEIA OS DOIS EXAMES — **E-30**, ⛔ e o contrato ⛔ não mudou
     * com a migração visual: continua sendo *"a leitura precisa dizer de QUAIS
     * dois exames está falando"*.
     *
     * ⚠️ O que mudou é **como** um exame se chama. *"Exame 1"* saiu porque ⛔ não
     * diz o que o exame é ⛔ e sugere cronologia que o estado ⛔ não garante. Mas
     * ⛔ só a modalidade ⛔ não serviria **justamente aqui**: as duas são TC sem
     * contraste, ⛔ e a frase ficaria falando de dois exames idênticos. ⚠️ Por
     * isso a trava exige **os dois pedaços**: modalidade ⛔ e ordinal.
     */
    await expect(leitura).toContainText(/Tomografia de crânio sem contraste \(estudo 1\)/i);
    await expect(leitura).toContainText(/Tomografia de crânio sem contraste \(estudo 2\)/i);
    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/mais recente|prevalece/i);

    /**
     * ⚠️⚠️ E O ORDINAL ⛔ NÃO SE APRESENTA COMO CRONOLOGIA — ⛔ nem na leitura,
     * ⛔ nem no cabeçalho da instância. ⚠️ O exame 1 é o de **serviço externo com
     * horário desconhecido**: se a tela ordenasse por relógio, ⛔ ele ⛔ não
     * poderia ser o primeiro.
     */
    await expect(page.getByTestId("avc-estudo-identidade-estudo_1"))
      .toContainText(/Serviço externo · horário desconhecido · estudo 1/i);

    // ⚠️ E os dois valores continuam legíveis, cada um no seu exame.
    await page.getByTestId("avc-estudo-abrir-estudo_1").click();
    await expect(
      page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.semHemorragia)).first()
    ).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByTestId(OPCAO("estudo_resultado", RESULTADO_TC.hemorragia)).first()
    ).toHaveAttribute("aria-checked", "false");
  });

  /**
   * ⚠️⚠️ **SENTINELA 2 NA TELA** — ASPECTS 7 corrigido para 6, mesmo exame.
   */
  test("corrigir o ASPECTS fica no mesmo exame, e ⛔ não cria outro", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    await novoExame(page, MODALIDADE.tcSemContraste);
    // ⚠️ Um toque grava o primeiro valor: 1.
    await page.getByTestId("avc-grandeza-aspects-mais").click();
    await expect(page.getByTestId("avc-valor-aspects")).toContainText("1");

    /**
     * ⚠️⚠️ Preenchido, o campo ⛔ não aceita escrita direta: o gesto é **Corrigir**.
     *
     * ⚠️⚠️ E dentro da correção os toques movem o RASCUNHO — seis toques ⛔ não são
     * seis correções. Só **Confirmar** grava, e grava **um** fato.
     */
    await corrigir(page, "aspects");
    await page.getByTestId("avc-grandeza-aspects-mais").click({ clickCount: 6 });
    await page.getByTestId("avc-confirmar-aspects").click();
    await expect(page.getByTestId("avc-valor-aspects")).toContainText("7");

    // ⛔ E ⛔ NENHUM exame novo foi criado por corrigir um achado.
    await expect(page.getByTestId("avc-estudo-estudo_2")).toHaveCount(0);
    await expect(page.getByTestId("avc-estudo-estudo_1")).toBeVisible();
  });

  /**
   * ⚠️ **E-49 na tela**: ⛔ nenhum campo é obrigatório, e ⛔ não há barra de
   * progresso, contagem de preenchimento ou "faltam N".
   */
  test("⛔ nenhum campo é obrigatório, e a tela ⛔ não cobra preenchimento", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirC(page);

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    await expect(conteudo).not.toContainText(/obrigatóri/i);
    await expect(conteudo).not.toContainText(/faltam \d/i);
    await expect(conteudo).not.toContainText(/\d+ *\/ *\d+/);
    // ⚠️ E ⛔ nenhum identificador interno vaza para a tela clínica.
    for (const campo of TODOS_OS_CAMPOS_C) {
      await expect(conteudo).not.toContainText(campo.id);
    }
  });

  /**
   * ⚠️ **E-12 / §7.17:** a superfície nasce internacionalizada — ⛔ não é
   * tradução acrescentada depois.
   */
  test("a superfície inteira aparece em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await page.goto("/modulos/avc");
    await page.getByTestId("avc-aba-imagem").click();

    const conteudo = page.getByTestId("avc-superficie-c-conteudo");
    /** ⚠️ O cabeçalho vem em caixa alta por CSS; o teste lê o texto do bloco. */
    await expect(conteudo).toContainText(/estudios de imagen/i);
    await expect(conteudo).toContainText("Sospecha de hemorragia subaracnoidea");
    await expect(conteudo).toContainText(/No retrase la trombólisis/i);
    /**
     * ⚠️⚠️ A OPÇÃO, e ⛔ não só a prosa — foi aqui que "Incerto" apareceu em
     * português na tela espanhola, com `test:i18n` dizendo "SEM TRADUÇÃO: 0".
     * Uma palavra curta sem acento ⛔ não parece prosa para a varredura.
     */
    await expect(conteudo).toContainText("Incierto");
    await expect(conteudo).not.toContainText("Incerto");
  });
});
