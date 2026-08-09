import { expect, test } from "@playwright/test";

import { abrirModulo, texto } from "./helpers";

/**
 * O card "Estabilização primeiro" tem de nascer RECOLHIDO em todo módulo.
 *
 * ── O DEFEITO QUE ESTE ARQUIVO TRAVA ─────────────────────────────────────────
 *
 * O card já foi compactado uma vez por medição: expandido ele ocupava ~859 px e
 * empurrava o passo clínico para 1078 px numa tela de 839. Mesmo depois disso,
 * a tela do fluxo o abria no 1º passo (`defaultExpanded={stepCount === 1}`), com
 * a intenção de destacar o lembrete na entrada do módulo.
 *
 * O efeito real foi o oposto: ao abrir o AVC, o card tomava a tela inteira e o
 * passo 1 — a razão de ter aberto o módulo — nascia abaixo da dobra. Foi o que
 * o usuário relatou, com print, e é a segunda vez que a mesma classe de defeito
 * aparece. Por isso virou teste, e não só correção.
 *
 * ── O QUE ELE COBRA ──────────────────────────────────────────────────────────
 *
 * 1. Ao abrir o módulo, o DETALHE do card não está na tela — nem o ABCDE nem os
 *    atalhos de estabilização.
 * 2. A REGRA continua visível sem tocar em nada. Recolher não pode virar
 *    esconder: o médico precisa ler "ABCDE antes do guia" de olho, sempre.
 * 3. Existe convite explícito para abrir. Um triângulo sozinho não avisa que há
 *    algo atrás — e o que está atrás é o que fazer ANTES de seguir o fluxo.
 * 4. Um toque abre. O conteúdo continua a um gesto de distância.
 *
 * O teste roda em módulos de rotas diferentes porque o card é renderizado pela
 * concha compartilhada: se ele voltar a abrir sozinho, volta em todos.
 */

const MODULOS = ["avc", "sepse-adulto", "bradicardia-acls"];

for (const modulo of MODULOS) {
  test(`Estabilização primeiro — nasce recolhida em "${modulo}"`, async ({ page }) => {
    await abrirModulo(page, modulo);

    const alternar = page.getByTestId("estabilizacao-alternar");
    if ((await alternar.count()) === 0) {
      test.skip(true, `módulo "${modulo}" não desenha o card de estabilização`);
      return;
    }

    /**
     * A comparação é feita em MINÚSCULAS, e isso não é zelo: o rótulo dos
     * atalhos é escrito "Abrir módulo de estabilização:" no código e chega ao
     * `innerText` como "ABRIR MÓDULO DE ESTABILIZAÇÃO:", porque a caixa alta vem
     * de `text-transform` no CSS.
     *
     * Vale registrar como este arquivo quase nasceu inútil: escrito com a
     * comparação sensível a caixa, o `not.toContain` da asserção 1 passava por
     * NUNCA casar — passaria igualmente com o card escancarado. O teste só
     * revelou o engano ao chegar na asserção 4, que espera encontrar o texto.
     * Asserção negativa que nunca casa não prova nada.
     */
    const naTela = async () => (await texto(page)).toLowerCase();
    const inicial = await naTela();

    // 1. O detalhe não pode estar na tela ao abrir o módulo.
    expect(
      inicial,
      "os atalhos de estabilização não deveriam aparecer sem o usuário pedir — " +
        "expandidos, empurram o passo clínico para baixo da dobra",
    ).not.toContain("abrir módulo de estabilização");
    expect(inicial, "o ABCDE não deveria estar aberto ao entrar no módulo").not.toContain("disfunção neuro");

    // 2. A regra continua visível — recolher não é esconder.
    expect(inicial, "a regra de prioridade tem de ficar legível sem tocar em nada").toContain("abcde antes do guia");

    // 3. O convite para abrir precisa existir.
    expect(
      inicial,
      "recolhido, o card precisa dizer que há algo atrás dele",
    ).toContain("toque para ver o que fazer antes de prosseguir");

    // 4. Um toque abre.
    //
    // O clique é repetido até a tela responder. Não é teimosia: `abrirModulo`
    // espera o CONTEÚDO aparecer, e na web o conteúdo vem do pré-render do
    // build — existe no DOM antes de o React hidratar. Um clique nessa janela
    // acerta o elemento certo e não dispara handler nenhum, porque ainda não há
    // handler. Os outros testes não esbarram nisso por já terem interagido
    // antes; este toca no primeiro elemento da tela recém-aberta.
    await expect
      .poll(
        async () => {
          if ((await naTela()).includes("abrir módulo de estabilização")) return true;
          await alternar.first().click();
          return (await naTela()).includes("abrir módulo de estabilização");
        },
        {
          message: "um toque no cabeçalho deveria revelar os atalhos",
          timeout: 15_000,
        },
      )
      .toBe(true);
  });
}

/**
 * Dois dos 19 módulos NÃO devem oferecer o atalho "Choque / vasopressor".
 *
 * Nos dois o atalho fura a ORDEM da conduta do próprio módulo: a pré-eclâmpsia
 * é síndrome hipertensiva (o atalho aponta a classe oposta), e na CAD/EHH o
 * vasopressor é segunda linha, depois da expansão — o módulo já diz isso na
 * sequência certa, e o atalho oferecia o segundo passo antes do primeiro.
 *
 * O teste confere os dois lados: ausente onde não cabe, PRESENTE onde cabe.
 * Só a metade negativa passaria se alguém removesse o atalho de todo mundo.
 */
const SEM_VASOPRESSOR = ["pre-eclampsia", "cetoacidose-hiperosmolar"];
const COM_VASOPRESSOR = ["avc", "choque", "sepse-adulto"];

for (const modulo of SEM_VASOPRESSOR) {
  test(`"Choque / vasopressor" NÃO aparece em "${modulo}"`, async ({ page }) => {
    await abrirModulo(page, modulo);
    const alternar = page.getByTestId("estabilizacao-alternar");
    if ((await alternar.count()) === 0) test.skip(true, "sem card de estabilização");
    await alternar.first().click();
    await expect
      .poll(async () => (await texto(page)).toLowerCase().includes("abrir módulo de estabilização"), { timeout: 5_000 })
      .toBe(true);
    expect(
      (await texto(page)).toLowerCase(),
      "o atalho de vasopressor fura a ordem da conduta deste módulo",
    ).not.toContain("choque / vasopressor");
  });
}

for (const modulo of COM_VASOPRESSOR) {
  test(`"Choque / vasopressor" CONTINUA em "${modulo}"`, async ({ page }) => {
    await abrirModulo(page, modulo);
    const alternar = page.getByTestId("estabilizacao-alternar");
    if ((await alternar.count()) === 0) test.skip(true, "sem card de estabilização");
    await alternar.first().click();
    await expect
      .poll(async () => (await texto(page)).toLowerCase().includes("choque / vasopressor"), {
        timeout: 5_000,
        message: "a remoção deveria valer só para os dois módulos, não para todos",
      })
      .toBe(true);
  });
}
