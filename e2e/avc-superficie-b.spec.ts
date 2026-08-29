import { expect, test, type Page } from "@playwright/test";

import {
  ACHADOS_PODEM_NAO_B,
  ACHADOS_TIPICOS_B,
  GRUPOS_B,
  TODOS_OS_CAMPOS_B,
} from "../avc/conteudo/superficie-b";
import { ITENS_NIHSS } from "../avc/conteudo/nihss";
import { SUPERFICIES } from "../avc/conteudo/superficies";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que a Superfície B se COMPORTE na tela como decomposição — que o
 * médico consiga responder, que a leitura recalcule à vista sem virar veredito,
 * e que ⛔ nada cobre preenchimento.
 *
 * ⚠️ As provas de estado e derivação vivem em `scripts/prova-avc-superficie-b.cjs`.
 * Aqui mede-se o que só a tela mostra: que o botão PARECE botão e responde ao
 * toque, que o hedge da fonte está visível sem abrir nada, e que o zero do
 * NIHSS tem porta própria.
 */
/**
 * Preenche a escala do NIHSS pelo caminho real: abre, marca cada item e
 * confirma. ⚠️ Os itens ⛔ não citados ficam em ZERO — e zero é resposta (E-10).
 */
async function preencherEscala(page: Page, pontos: Record<string, number> = {}) {
  await page.getByTestId("avc-escala-abrir-nihss_calculado").click();
  for (const item of ITENS_NIHSS) {
    const ponto = pontos[item.id] ?? 0;
    await page.getByTestId(`avc-escala-opcao-${item.id}-${ponto}`).click();
  }
  await page.getByTestId("avc-escala-confirmar-nihss_calculado").click();
}

async function abrirB(page: Page) {
  await page.goto("/modulos/avc");
  await page.getByTestId("avc-aba-neurologico").click();
  await expect(page.getByTestId("avc-superficie-b-conteudo")).toBeVisible();
}

test.describe("AVC · Superfície B — Neurológico", () => {
  /**
   * ⚠️⚠️ A QUEIXA QUE ORIGINOU ESTE TESTE (autor, 2026-08-28): *"botões ruins de
   * selecionar, não intuitivos, tem que ficar procurando onde tem que clicar"*.
   * Um botão que só se distingue por "fundo um pouco mais claro" ⛔ não se
   * distingue — e a marca `✓` é o que sobra quando a cor falha (E-39).
   */
  test("as opções são botões, e a escolhida se anuncia sem depender de cor", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    const sim = page.getByTestId("avc-opcao-deficit_focal-sim");
    await expect(sim).toBeVisible();
    // ⚠️ Antes de qualquer toque, ⛔ nenhuma opção pode estar marcada (I-3).
    await expect(sim).toHaveAttribute("aria-checked", "false");
    const caixa = await sim.boundingBox();
    expect(caixa!.height, "alvo de dedo, não de mouse").toBeGreaterThanOrEqual(44);

    await sim.click();
    await expect(sim).toHaveAttribute("aria-checked", "true");
    await expect(sim).toContainText("✓");

    // ⚠️ E o vizinho ⛔ não pode ficar marcado junto: escolha é exclusiva.
    await expect(page.getByTestId("avc-opcao-deficit_focal-nao"))
      .toHaveAttribute("aria-checked", "false");
  });

  /**
   * ⚠️⚠️ **E-10 na tela.** Com o polegar no mínimo o `−` nasce desabilitado e o
   * `+` sobe para 1: sem porta própria, **NIHSS 0** — o escore da população da
   * Table 4 — só entraria passando por um `1` que ninguém mediu.
   */
  /**
   * ⚠️⚠️ **E-10 pela escala** (decisão do autor, 2026-08-29): *"essa escala o
   * usuário não sabe, tem que ser clicável para abrir e preencher"*. O NIHSS
   * deixou de pedir um total que alguém calculou noutro lugar.
   *
   * ⚠️ E o zero continua sendo RESPOSTA: 15 itens em zero é um NIHSS 0, que é o
   * escore da população da Table 4.
   */
  test("o NIHSS se preenche item a item, e zero é resposta", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    const campo = page.getByTestId("avc-campo-nihss_calculado");
    await expect(campo).toContainText(/não informado/i);

    await page.getByTestId("avc-escala-abrir-nihss_calculado").click();
    await expect(page.getByTestId("avc-escala-nihss_calculado")).toBeVisible();
    // ⛔ Escala pela metade ⛔ não é escala: Confirmar nasce desabilitado.
    await expect(page.getByTestId("avc-escala-confirmar-nihss_calculado"))
      .toHaveAttribute("aria-disabled", "true");
    await page.getByTestId("avc-escala-abrir-nihss_calculado").click();

    await preencherEscala(page);
    await expect(campo).not.toContainText(/não informado/i);
    await expect(page.getByTestId("avc-escala-valor-nihss_calculado")).toHaveText("0");
    await expect(page.getByTestId("avc-leitura-curto-nihss")).toContainText(/NIHSS registrado/i);
  });

  /**
   * ⚠️⚠️ A DERIVAÇÃO NA TELA — opção (a) do autor: a escala responde os achados
   * que a Table 4 define por corte de item, etiquetados, e o médico pode
   * alterar. ⛔ Alterar ⛔ não mexe no NIHSS, e a divergência fica identificável.
   */
  test("a escala preenche os achados da Table 4, e o médico pode divergir", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    // Linguagem 2 → afasia grave; perna direita 3 → fraqueza e lado direito.
    await preencherEscala(page, { "9": 2, "6b": 3 });

    await expect(page.getByTestId("avc-opcao-t4_afasia_grave-sim"))
      .toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("avc-origem-t4_afasia_grave")).toContainText(/Vindo do NIHSS/i);
    /**
     * ⚠️ "Direita", e ⛔ não "Direito": o campo passou a ser **lateralidade do
     * déficit motor**, e ⛔ não "lado predominante do déficit" (correção
     * conceitual do autor, 2026-08-29).
     */
    await expect(page.getByTestId("avc-opcao-lateralidade-Direita"))
      .toHaveAttribute("aria-checked", "true");

    // ⛔ O achado QUALITATIVO ⛔ não é derivado — a escala ⛔ não o responde.
    await expect(page.getByTestId("avc-origem-t4_afasia_leve_isolada")).toHaveCount(0);

    // ⚠️ O médico diverge: o registro dele manda, e o NIHSS ⛔ não muda.
    await page.getByTestId("avc-opcao-t4_afasia_grave-nao").click();
    await expect(page.getByTestId("avc-divergencia-t4_afasia_grave")).toBeVisible();

    await expect(page.getByTestId("avc-leitura-curto-divergencia_escala"))
      .toContainText(/diferente do que a escala deriva/i);
    await expect(page.getByTestId("avc-escala-valor-nihss_calculado")).toHaveText("5");


    /**
     * ⚠️⚠️ AS TRÊS PROCEDÊNCIAS SE DISTINGUEM — checagem visual final do autor.
     * O caso do meio é o que faltava: registro do médico que COINCIDE com a
     * escala ⛔ não pode ficar sem etiqueta, ou vira resposta manual anônima.
     */
    await page.getByTestId("avc-opcao-t4_afasia_grave-sim").click();
    await expect(page.getByTestId("avc-origem-manual-t4_afasia_grave"))
      .toContainText(/^Registro do médico$/);
    await expect(page.getByTestId("avc-divergencia-t4_afasia_grave")).toHaveCount(0);
    // ⚠️ E o que continua vindo da escala segue etiquetado como tal.
    await expect(page.getByTestId("avc-origem-t4_fraqueza_contra_gravidade"))
      .toContainText(/Vindo do NIHSS/i);

    // ⛔ E divergir ⛔ não bloqueia: a decisão continua disponível.
    /**
     * ⚠️ O testID sai do VALOR gravado, e "Incerto" grava `nao_sei` — mas ⛔ isso
     * ⛔ não o torna ausência de decisão: `decisaoDoMedico` distingue os dois, e
     * é o que a leitura abaixo confere.
     */
    await page.getByTestId("avc-opcao-incapacitante_assumido-nao_sei").click();
    await expect(page.getByTestId("avc-leitura-curto-decisao_medico"))
      .toContainText(/incerto/i);
  });

  /**
   * ⚠️⚠️ **E-45 na tela.** O hedge da fonte ⛔ não pode ficar atrás de um toque:
   * quem lê "achados incapacitantes" sem o "tipicamente" lê critério onde a
   * fonte escreveu orientação.
   */
  test("o hedge dos dois quadros está visível sem abrir nada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    await expect(page.getByTestId("avc-grupo-achados-tipicos")).toContainText(/tipicamente/i);
    await expect(page.getByTestId("avc-grupo-achados-podem-nao")).toContainText(/podem não ser/i);
    // ⚠️ A população da Table 4 aparece como NOTA — e ⛔ não como porta.
    await expect(page.getByTestId("avc-grupo-nota-achados-tipicos"))
      .toContainText(/NIHSS 0 a 5/i);
  });

  /**
   * ⚠️ **E-46 na tela**: a leitura muda à vista, e ⛔ continua sendo apoio. O
   * sistema ⛔ não escreve "déficit incapacitante" em lugar nenhum.
   */
  test("achado típico muda a leitura, e a leitura ⛔ não vira veredito", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    await expect(page.getByTestId("avc-leitura-curto-achados_quadros"))
      .toContainText(/ainda não informados/i);

    /**
     * ⚠️ NIHSS 3 ANTES DO ACHADO, e ⛔ não é detalhe de teste: desde **PD-13** a
     * frase normativa da fonte só existe DENTRO da população que ela declara
     * (0–5). Sem o contexto estabelecido, o app registra e se cala — que é
     * exatamente o que o teste de D-1 mede logo abaixo.
     */
    await preencherEscala(page, { "5a": 3 });
    await page.getByTestId("avc-opcao-t4_afasia_grave-sim").click();
    const leitura = page.getByTestId("avc-leitura-curto-achados_quadros");
    await expect(leitura).toContainText(/tipicamente considerados claramente incapacitantes/i);

    // ⛔ Nem aqui, nem em nenhuma outra leitura da superfície, sai um veredito.
    await expect(page.getByTestId("avc-superficie-b-conteudo"))
      .not.toContainText(/déficit incapacitante: sim|déficit incapacitante = sim/i);
  });

  /**
   * ⚠️ §2.8-7 na tela: divergir ⛔ não é erro, ⛔ não bloqueia, e fica visível.
   */
  test("divergir da leitura fica registrado e ⛔ não bloqueia a superfície", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    // ⚠️ Dentro da população da fonte: fora dela ⛔ não há leitura normativa, e
    // portanto ⛔ não há do que divergir (PD-13).
    await preencherEscala(page, { "5a": 3 });
    await page.getByTestId("avc-opcao-t4_afasia_grave-sim").click();
    await page.getByTestId("avc-opcao-incapacitante_assumido-Não incapacitante").click();

    await expect(page.getByTestId("avc-leitura-curto-decisao_medico")).toContainText(/diverge/i);
    await page.getByTestId("avc-info-leitura-decisao_medico").click();
    await expect(page.getByTestId("avc-detalhe-leitura-decisao_medico"))
      .toContainText(/não bloqueia/i);

    // ⚠️ E os campos continuam todos operáveis — divergir ⛔ não fecha nada.
    await expect(page.getByTestId("avc-opcao-deficit_focal-sim")).toBeEnabled();
  });

  /**
   * ⚠️⚠️ **R3.10 / 🚫 do Bloco 3.** *"Delaying IVT is potentially harmful"* — a
   * tela ⛔ não pode cobrar preenchimento, e tem de DIZER que pode ser pulada.
   */
  test("a superfície declara que pode ficar incompleta, e ⛔ não cobra nada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    await expect(page.getByTestId("avc-leitura-curto-decomposicao_nao_atrasa"))
      .toContainText(/pode ser deixada incompleta/i);

    await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();
    await expect(page.getByTestId("avc-leitura-curto-decomposicao_nao_atrasa"))
      .toContainText(/não atrasar/i);

    // ⛔ Nada de "faltam N campos", ⛔ nada de barra de progresso da superfície.
    const conteudo = page.getByTestId("avc-superficie-b-conteudo");
    await expect(conteudo).not.toContainText(/obrigatóri/i);
    await expect(conteudo).not.toContainText(/faltam \d+/i);
  });

  /**
   * ⚠️ UNIVERSO DERIVADO DO CONTEÚDO, ⛔ não enumerado: um campo novo nasce
   * dentro da regra em vez de fora dela, calado.
   */
  test("todo campo da superfície está na tela, e nenhum abre respondido", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    /**
     * ⚠️ ABRE OS BLOCOS RECOLHIDOS ANTES DE CONFERIR. A promessa ⛔ não é "tudo
     * aberto" — é **nenhum campo inalcançável**: recolhido é um toque, ⛔ não um
     * sumiço. Sem abrir, a trava mediria a decisão de layout em vez da cobertura.
     */
    for (const grupo of GRUPOS_B.filter((g) => g.recolhido)) {
      await page.getByTestId(`avc-bloco-abrir-${grupo.id}`).click();
    }

    expect(TODOS_OS_CAMPOS_B.length).toBeGreaterThan(15);
    for (const campo of TODOS_OS_CAMPOS_B) {
      await expect(page.getByTestId(`avc-campo-${campo.id}`), `${campo.id} sumiu da tela`)
        .toBeVisible();
    }

    // I-3 · ⛔ nenhuma escolha abre marcada, em nenhum dos onze achados.
    for (const campo of [...ACHADOS_TIPICOS_B, ...ACHADOS_PODEM_NAO_B]) {
      await expect(page.getByTestId(`avc-opcao-${campo.id}-sim`))
        .toHaveAttribute("aria-checked", "false");
    }
  });

  /**
   * ⚠️⚠️ **D-1 NA TELA (PD-13).** O quadro da fonte vale para NIHSS 0–5. Fora
   * dele o app **registra e se cala** — e o que ⛔ NÃO pode acontecer é o campo
   * fechar: limitar o que o sistema afirma ⛔ não é limitar o que o médico
   * registra.
   */
  test("fora da população da fonte, a leitura não se estende — e nada fecha", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    // NIHSS 3 · dentro do contexto que a Table 4 escreveu para si.
    await preencherEscala(page, { "5a": 3 });
    await page.getByTestId("avc-opcao-t4_afasia_grave-sim").click();
    await expect(page.getByTestId("avc-leitura-curto-achados_quadros"))
      .toContainText(/tipicamente considerados claramente incapacitantes/i);

    // NIHSS 23 · fora dela. ⛔ A frase normativa da fonte ⛔ não é reutilizada.
    await preencherEscala(page, { "5a": 4, "5b": 4, "6a": 4, "6b": 4, "9": 3, "1a": 3, "11": 2 });
    const leitura = page.getByTestId("avc-leitura-curto-achados_quadros");
    await expect(leitura).not.toContainText(/tipicamente/i);
    await expect(leitura).toContainText(/não estende a leitura/i);

    /**
     * ⚠️⚠️ E ESTA É A METADE QUE IMPORTA: o achado continua marcado, o campo
     * continua respondível, e a decisão continua disponível. ⛔ Nada foi fechado.
     */
    await expect(page.getByTestId("avc-opcao-t4_afasia_grave-sim"))
      .toHaveAttribute("aria-checked", "true");
    await page.getByTestId("avc-opcao-t4_hemiataxia_leve-sim").click();
    await expect(page.getByTestId("avc-opcao-t4_hemiataxia_leve-sim"))
      .toHaveAttribute("aria-checked", "true");

    await page.getByTestId("avc-opcao-incapacitante_assumido-Incapacitante").click();
    await expect(page.getByTestId("avc-leitura-curto-decisao_medico"))
      .toContainText(/registrada pelo médico/i);
  });

  /**
   * ⚠️⚠️ **D-5 NA TELA (PD-14).** Registro opcional: fica na trilha, e ⛔ nunca
   * vira cobrança — ⛔ nem como pendência, ⛔ nem como tom, ⛔ nem por outra
   * leitura reagir a ele.
   */
  test("a consulta ao paciente e à família é registrável, e nunca cobrada", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    await expect(page.getByTestId("avc-leitura-curto-consulta_paciente_familia"))
      .toContainText(/opcional/i);
    // ⛔ E ⛔ não existe pendência dela em lugar nenhum do módulo (alcance global).
    await expect(page.getByTestId("avc-pendencias"))
      .not.toContainText(/consulta/i);

    const antes = await page.getByTestId("avc-leitura-curto-decisao_medico").innerText();
    await page.getByTestId("avc-opcao-consulta_paciente_familia-Paciente e família").click();

    await expect(page.getByTestId("avc-leitura-curto-consulta_paciente_familia"))
      .toContainText(/registrada/i);
    // ⚠️ ⛔ Nenhuma outra leitura pode ter reagido: seria requisito por dentro.
    expect(await page.getByTestId("avc-leitura-curto-decisao_medico").innerText()).toBe(antes);
  });

  /**
   * ⚠️⚠️ **§7.2 / E-11 na tela**: sair da B pela metade ⛔ não pode fechar nada.
   * ⛔ Não há pré-requisito de navegação, e o que foi registrado continua lá na
   * volta — navegação ⛔ não tem efeito clínico (**E-20**).
   */
  test("sair da B incompleta mantém as sete superfícies acessíveis", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    // Duas respostas, e a superfície fica deliberadamente incompleta.
    await page.getByTestId("avc-opcao-deficit_focal-sim").click();
    await page.getByTestId("avc-opcao-t4_afasia_grave-sim").click();

    // ⚠️ UNIVERSO DERIVADO: as sete, na ordem declarada, ⛔ não uma lista à mão.
    expect(SUPERFICIES.length).toBe(7);
    for (const sup of SUPERFICIES) {
      await page.getByTestId(`avc-aba-${sup.id}`).click();
      await expect(page.getByTestId(`avc-superficie-${sup.id}`), `${sup.id} não abriu`)
        .toBeVisible();
    }

    // ⚠️ E a volta preserva o que foi registrado — E-20.
    await page.getByTestId("avc-aba-neurologico").click();
    await expect(page.getByTestId("avc-opcao-deficit_focal-sim"))
      .toHaveAttribute("aria-checked", "true");
    await expect(page.getByTestId("avc-opcao-t4_afasia_grave-sim"))
      .toHaveAttribute("aria-checked", "true");
  });

  /**
   * ⚠️⚠️ O mRS COM DESCRITOR VISÍVEL — pedido do autor, 2026-08-29. E a cadeia de
   * fontes: os descritores são do Quadro 4 (SBACV, F-27), e a validação
   * brasileira é de Cincura 2009 (F-26) — ⛔ um ⛔ não responde pelo outro.
   */
  test("o mRS prévio mostra o descritor de cada grau, e ⛔ não oferece óbito", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    const campo = page.getByTestId("avc-campo-mrs_previo");
    /**
     * ⚠️ NASCE RECOLHIDO — pedido do autor, 2026-08-29: seis descritores abertos
     * empurram para baixo tudo o que vem depois. ⛔ O que fica atrás do toque é a
     * LISTA, ⛔ nunca a resposta escolhida.
     */
    await expect(campo).not.toContainText(/0 · assintomático/i);
    await page.getByTestId("avc-abrir-mrs_previo").click();
    await expect(campo).toContainText(/0 · assintomático/i);
    await expect(campo).toContainText(/3 · incapacidade moderada/i);
    // ⛔ Óbito ⛔ não é função basal de quem está sendo avaliado agora.
    await expect(campo).not.toContainText(/óbito/i);
    // ⚠️ E "não sei" continua sendo resposta — prévio desconhecido é o caso comum.
    await expect(page.getByTestId("avc-opcao-mrs_previo-nao_sei")).toBeVisible();

    await page.getByTestId("avc-opcao-mrs_previo-2 · leve incapacidade").click();
    await expect(page.getByTestId("avc-leitura-curto-funcionalidade_previa"))
      .toContainText(/registrada/i);
    // ⚠️ Fechado, o campo mostra a RESPOSTA — ⛔ não some com ela.
    await page.getByTestId("avc-abrir-mrs_previo").click();
    await expect(page.getByTestId("avc-abrir-mrs_previo")).toContainText(/leve incapacidade/i);

    // ⚠️ A fonte dos descritores fica acessível na auditoria, atrás do ⓘ.
    await page.getByTestId("avc-info-mrs_previo").click();
    await expect(page.getByTestId("avc-detalhe-mrs_previo")).toContainText(/SBACV/);
    await expect(page.getByTestId("avc-detalhe-mrs_previo")).toContainText(/F-27/);
  });

  /**
   * ⚠️⚠️ O NIHSS QUE CHEGA DE FORA — decisão do autor, 2026-08-29. É informação
   * clínica útil, e ⛔ **nunca** fabrica os itens que ⛔ não conhecemos.
   */
  test("NIHSS informado por fora convive com o daqui, e ⛔ não deriva achado", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    /**
     * ⚠️ O BLOCO DE FORA NASCE FECHADO — *"o usuário vai calcular o NIHSS"*. O
     * caminho normal é o exame aqui; o dado de fora existe e ⛔ não ocupa a tela.
     */
    await expect(page.getByTestId("avc-campo-nihss_informado")).toHaveCount(0);
    await page.getByTestId("avc-bloco-abrir-nihss-de-fora").click();

    // Chega "NIHSS 12" da regulação.
    for (let i = 0; i < 12; i += 1) await page.getByTestId("avc-grandeza-nihss_informado-mais").click();
    await page.getByTestId("avc-opcao-nihss_informado_origem-Regulação").click();

    await expect(page.getByTestId("avc-leitura-curto-nihss"))
      .toContainText(/não são derivados dele/i);
    // ⛔ NENHUM achado da Table 4 foi preenchido por um total.
    await expect(page.getByTestId("avc-origem-t4_afasia_grave")).toHaveCount(0);
    await expect(page.getByTestId("avc-opcao-t4_afasia_grave-sim"))
      .toHaveAttribute("aria-checked", "false");

    // ⚠️ O exame aqui dá 9 — e os dois passam a conviver.
    await preencherEscala(page, { "9": 2, "5a": 3, "6a": 4 });
    await expect(page.getByTestId("avc-escala-valor-nihss_calculado")).toHaveText("9");
    await expect(page.getByTestId("avc-campo-nihss_informado")).toContainText("12");
    await expect(page.getByTestId("avc-leitura-curto-nihss"))
      .toContainText(/informado por fora e um calculado aqui/i);

    // ⚠️ E agora sim o achado vem — do exame daqui, etiquetado.
    await expect(page.getByTestId("avc-origem-t4_afasia_grave")).toContainText(/Vindo do NIHSS/i);
    // ⚠️ Lateralidade MOTORA, e ⛔ não "lado predominante do déficit".
    await expect(page.getByTestId("avc-campo-lateralidade")).toContainText(/déficit motor/i);
    await expect(page.getByTestId("avc-opcao-lateralidade-Esquerda"))
      .toHaveAttribute("aria-checked", "true");
  });

  /**
   * ⚠️⚠️ O GLOSSÁRIO VEM DA ESCALA, ⛔ NÃO DE MEMÓRIA — pedido do autor para quem
   * ⛔ não lembra o termo. São as opções do próprio NIHSS que satisfazem o corte
   * da Table 4, e por isso têm fonte.
   */
  test("cada achado explica o que é, e as categorias ficam no ⓘ", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    /**
     * ⚠️⚠️ A DEFINIÇÃO É VISÍVEL, as CATEGORIAS ficam a um toque — decisão visual
     * do autor: *"senão recuperamos justamente as telas de rolagem que acabamos
     * de eliminar"*.
     */
    await expect(page.getByTestId("avc-definicao-t4_hemianopsia_completa"))
      .toContainText(/metade do campo visual/i);
    await expect(page.getByTestId("avc-definicao-t4_fraqueza_contra_gravidade"))
      .toContainText(/cai em direção ao leito/i);

    // ⛔ As categorias da escala ⛔ NÃO ficam abertas.
    await expect(page.getByTestId("avc-glossario-t4_hemianopsia_completa")).toHaveCount(0);
    await page.getByTestId("avc-info-t4_hemianopsia_completa").click();
    await expect(page.getByTestId("avc-glossario-t4_hemianopsia_completa"))
      .toContainText(/Cegueira bilateral/i);

    /**
     * ⚠️ OS QUALITATIVOS TAMBÉM EXPLICAM O TERMO (autorizado em 2026-08-29) — e
     * ⛔ NÃO classificam: a glosa diz o que o achado é, ⛔ nunca que ele é não
     * incapacitante. A Table 4 os lista como exemplos que **podem não ser**.
     */
    await expect(page.getByTestId("avc-definicao-t4_hemiataxia_leve"))
      .toContainText(/ainda consegue caminhar/i);
    await expect(page.getByTestId("avc-definicao-t4_hemiataxia_leve"))
      .not.toContainText(/incapacit/i);
    // ⛔ E eles ⛔ não têm categorias da escala: a coluna da direita ⛔ não cita item.
    await expect(page.getByTestId("avc-info-t4_hemiataxia_leve")).toBeVisible();
    await page.getByTestId("avc-info-t4_hemiataxia_leve").click();
    await expect(page.getByTestId("avc-glossario-t4_hemiataxia_leve")).toHaveCount(0);
  });

  /** ⚠️ Dentro da escala, cada item usado pela Table 4 diz COMO se testa. */
  test("os itens do NIHSS dizem como avaliar", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await abrirB(page);

    await page.getByTestId("avc-escala-abrir-nihss_calculado").click();
    await expect(page.getByTestId("avc-como-avaliar-3")).toContainText(/Confrontação/i);
    await expect(page.getByTestId("avc-como-avaliar-5a")).toContainText(/10 segundos/i);
    await expect(page.getByTestId("avc-como-avaliar-6a")).toContainText(/5 segundos/i);
    await expect(page.getByTestId("avc-como-avaliar-9")).toContainText(/nomeação/i);
    await expect(page.getByTestId("avc-como-avaliar-11")).toContainText(/simultâneo bilateral/i);

    /**
     * ⚠️ OS QUINZE, e ⛔ não só os da Table 4 (autorizado em 2026-08-29): *"não há
     * motivo para os outros oito ficarem sem 'como testar'"*.
     */
    await expect(page.getByTestId("avc-como-avaliar-1a")).toContainText(/nível de alerta/i);
    await expect(page.getByTestId("avc-como-avaliar-4")).toContainText(/mostrar os dentes/i);
    await expect(page.getByTestId("avc-como-avaliar-10")).toContainText(/articulação/i);
  });

  /** ⚠️ E-12: o módulo nasce bilíngue — ⛔ tradução não é etapa posterior. */
  test("a superfície inteira responde em espanhol", async ({ page }) => {
    await fixarIdioma(page, "es-419");
    await abrirB(page);

    const conteudo = page.getByTestId("avc-superficie-b-conteudo");
    await expect(conteudo).toContainText(/Examen neurológico/i);
    await expect(conteudo).toContainText(/Evaluación funcional/i);
    // ⚠️ E-45 também em espanhol: o hedge ⛔ não pode sumir na tradução.
    await expect(page.getByTestId("avc-grupo-achados-podem-nao")).toContainText(/pueden no ser/i);
  });
});
