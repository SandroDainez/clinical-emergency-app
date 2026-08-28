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

// ⚠️ LISTA PODADA EM 2026-08-27. Eram "avc" e "sepse-adulto", removidos com a
// arquitetura clínica antiga. O card é desenhado por `acls-decision-flow-screen`,
// e hoje as ÚNICAS telas que passam por essa concha são as duas do
// LEGACY_ACLS_RUNTIME — por isso a lista tem exatamente elas, e por isso o
// `test.skip` abaixo deixou de ser rede de segurança e virou risco: se as duas
// pularem, o arquivo passa sem ter medido nada. A conferência de universo logo
// depois existe para isso.
const MODULOS = ["bradicardia-acls", "taquicardia-acls"];

test("as telas medidas realmente desenham o card — senão este arquivo é vazio", async ({ page }) => {
  let desenharam = 0;
  for (const modulo of MODULOS) {
    await abrirModulo(page, modulo);
    if ((await page.getByTestId("estabilizacao-alternar").count()) > 0) desenharam++;
  }
  expect(desenharam, "nenhum módulo desenhou o card — as asserções abaixo pularam todas").toBeGreaterThan(0);
});

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
 * ⚠️ BLOCO REMOVIDO EM 2026-08-27 — media a exceção do atalho "Choque /
 * vasopressor" em `pre-eclampsia` e `cetoacidose-hiperosmolar`, contra os
 * positivos `avc`, `choque` e `sepse-adulto`. Os CINCO módulos saíram do app com
 * a arquitetura clínica antiga, e o mapa `ATALHOS_REMOVIDOS` foi esvaziado junto.
 *
 * Não foi trocado por um teste equivalente porque não sobrou par onde a exceção
 * se aplique: mantê-lo pulando os cinco seria um arquivo que passa sem medir. O
 * raciocínio clínico das duas exceções continua escrito em
 * `stabilization-first-card.tsx`, para quando os módulos voltarem.
 */
