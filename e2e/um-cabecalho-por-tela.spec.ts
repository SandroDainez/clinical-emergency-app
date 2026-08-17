import { expect, test } from "@playwright/test";

import { getClinicalModules } from "../clinical-modules";
import { abrirModulo, texto } from "./helpers";

/**
 * PROMETE: que cada tela de módulo mostre EXATAMENTE UM cabeçalho — nem dois
 *   empilhados, nem nenhum — e que esse cabeçalho ofereça caminho de volta.
 * NÃO PROMETE: que o cabeçalho seja bonito, nem que o título esteja correto, nem
 *   nada abaixo do topo da tela. Também não vê o passo 2 em diante: mede o
 *   estado de ENTRADA de cada módulo.
 * UNIVERSO: os módulos de `getClinicalModules()` — derivado da fonte do app, não
 *   listado aqui, para que módulo novo entre no teste sem ninguém lembrar — × os
 *   DOIS idiomas (`pt-BR` e `es-419`), porque o rótulo de volta é traduzido e uma
 *   trava que só roda num idioma não vê o outro.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ────────────────────────────────────
 *
 * `app/modulos/[id].tsx` desenhava um cromado (voltar + título) suprimido por
 * `COM_CABECALHO_PROPRIO`, lista escrita à mão com 24 dos 31 módulos. A medição
 * em produção mostrou a lista errada nas SETE ausências: os sete módulos que
 * recebiam o cromado desenhavam cabeçalho próprio também, e mostravam o título
 * DUAS VEZES. Um deles era a Injúria Renal Aguda, criada no dia anterior.
 *
 * A rota deixou de desenhar cabeçalho. Esta trava é o que substitui a lista.
 *
 * ── ⚠️ POR QUE COORDENADA **E** CONTEÚDO, e não só coordenada (R-83) ────────
 *
 * A primeira medição contou "faixa larga, baixa, com borda inferior, no topo" e
 * devolveu DOIS cabeçalhos em 19 módulos. Estava errada nos dois sentidos:
 *
 *   · FALSO POSITIVO (19×) — a segunda faixa era o card "Estabilização
 *     primeiro". Mesma geometria de um cabeçalho, objeto completamente outro.
 *   · FALSO NEGATIVO (1×) — em `correcoes-eletroliticas` o herói já mostrava o
 *     nome do módulo, mas SEM borda inferior: o critério não o contou, e a tela
 *     entrou no relatório como "só o cromado" quando também duplicava.
 *
 * Geometria mede a forma e erra o objeto. Por isso o critério aqui tem duas
 * partes que precisam concordar: a faixa está no topo (coordenada) E carrega o
 * CAMINHO DE VOLTA (conteúdo).
 *
 * ⚠️ E o segundo critério não é "o texto é o nome do módulo" — tentei, e nove
 * módulos reprovaram tendo cabeçalho: eles escrevem outra coisa. « ACLS · Adulto
 * · Suspeita de PCR » para `pcr-adulto`, « CAD / EHH · Passo 1 » para
 * `cetoacidose-hiperosmolar`, « TCE · Passo 1 » para `tce`. Exigir o título
 * transformaria variação legítima de rótulo em defeito.
 *
 * O retorno é o que um cabeçalho de módulo TEM e um card de conteúdo NÃO: o card
 * "Estabilização primeiro" tem a geometria toda e nenhuma saída. É o atributo que
 * distingue o objeto, não a forma dele.
 */

const MODULOS = getClinicalModules();

test.describe("Um cabeçalho por tela", () => {
  test("nenhum módulo mostra o título duas vezes no topo, e nenhum fica sem cabeçalho", async ({
    page,
  }) => {
    const duplicados: string[] = [];
    const semCabecalho: string[] = [];
    const semSaida: string[] = [];

    // ⚠️ OS 31 EM PORTUGUÊS **E** EM ESPANHOL. Rodar só num idioma deixaria de
    // fora a superfície em que o defeito de cabeçalho apareceu para o autor.
    for (const locale of ["pt-BR", "es-419"] as const)
    for (const mod of MODULOS) {
      await abrirModulo(page, mod.id, locale);

      const medida = await page.evaluate(() => {
        /**
         * ⚠️ SÓ A SETA E O VERBO. Não "módulos", não "hub".
         *
         * A versão anterior aceitava `\bm[oó]dulos\b` e marcou como cabeçalho o
         * herói de `correcoes-eletroliticas`, cujo título é "Calculadora alinhada
         * ao padrão dos módulos". A palavra é de CONTEÚDO; usá-la como marca de
         * ESTRUTURA devolveu duplicação onde há uma só. Terceira vez que o mesmo
         * erro aparece nesta trava, e é o próprio R-83: o critério tem de dizer o
         * que a coisa É, não com o que ela se parece.
         */
        // ⚠️ OS DOIS IDIOMAS, e este `|volver|atrás` custou um falso positivo.
        //
        // Na verificação em produção com o app em ESPANHOL, `ovace-adulto` e
        // `pcr-gestacao-acls` apareceram com ZERO cabeçalho e ZERO saída — e os
        // dois estavam intactos. O rótulo deles é "Voltar", que em espanhol vira
        // "Volver"/"Atrás", e o detector só conhecia português. Eu quase relatei
        // dois módulos sem caminho de volta.
        //
        // ⚠️ E O BURACO É DA TRAVA, não só do script: ela roda em `pt-BR` (o
        // padrão de `abrirModulo`), então NUNCA exercita o rótulo traduzido. Com a
        // regex só em português, uma regressão que só aparecesse em espanhol
        // passaria — é a mesma família do R-81, em que o teste controlava a chave
        // errada e nenhum teste jamais rodou em espanhol.
        const VOLTA = /^←|\b(voltar|volver|atr[áa]s)\b/i;
        const rotuloDe = (el: Element) =>
          `${(el as HTMLElement).innerText || ""} ${el.getAttribute("aria-label") ?? ""}`.trim();
        /**
         * A faixa carrega o retorno — nela mesma ou num descendente.
         *
         * ⚠️ SEM PISO DE ALTURA. A primeira versão exigia 18 px do descendente e
         * perdeu `ovace-adulto` e `pcr-gestacao-acls`: o rótulo "Voltar" deles
         * tem 13 px de altura. Filtro geométrico esconder a própria coisa que se
         * procura é o R-83 outra vez, agora dentro da trava contra o R-83.
         *
         * O que substitui o piso é o limite de TAMANHO DO RÓTULO (< 60 ch): o que
         * exclui texto de card é ele ser prosa, não ser pequeno.
         */
        const temVolta = (raiz: Element) =>
          [raiz, ...Array.from(raiz.querySelectorAll("div,span,a"))].some((el) => {
            const rotulo = rotuloDe(el);
            return rotulo.length < 60 && VOLTA.test(rotulo);
          });

        const faixas: { y: number; texto: string }[] = [];
        let saidas = 0;

        for (const el of Array.from(document.querySelectorAll("div,span,a"))) {
          const r = el.getBoundingClientRect();
          const t = ((el as HTMLElement).innerText || "").trim();
          const rotulo = rotuloDe(el);

          // caminho de volta em QUALQUER altura da tela — é o que separa
          // "sem cabeçalho" de "cabeçalho sem saída".
          if (rotulo.length < 60 && VOLTA.test(rotulo)) saidas += 1;

          // ── (1) COORDENADA: faixa no topo, larga, de altura de cabeçalho ──
          // Sem exigir borda inferior: o herói de eletrólitos não tem, e foi por
          // isso que a primeira medição o perdeu (R-83, falso negativo).
          if (r.top > 140 || r.height < 24 || r.height > 110 || r.width < 300) continue;

          // ── (2) CONTEÚDO: a faixa carrega o RETORNO ──────────────────────
          // O card "Estabilização primeiro" tem esta geometria e nenhuma saída:
          // é aqui que ele sai (R-83, falso positivo).
          if (!t || t.length > 140) continue;
          if (!temVolta(el)) continue;

          faixas.push({ y: Math.round(r.top), texto: t.replace(/\n/g, " ⏎ ").slice(0, 70) });
        }

        // agrupa por linha (±12 px): nós aninhados do MESMO cabeçalho não são
        // dois cabeçalhos.
        const linhas: { y: number; texto: string }[] = [];
        for (const f of faixas.sort((a, b) => a.y - b.y)) {
          if (!linhas.some((l) => Math.abs(l.y - f.y) <= 12)) linhas.push(f);
        }
        return { linhas, saidas };
      });

      if (medida.linhas.length === 0) semCabecalho.push(`${mod.id} [${locale}]`);
      if (medida.linhas.length > 1) {
        duplicados.push(
          `${mod.id} [${locale}]: ${medida.linhas.length} cabeçalhos — ${medida.linhas
            .map((l) => `y${l.y} «${l.texto}»`)
            .join(" + ")}`
        );
      }
      if (medida.saidas === 0) semSaida.push(`${mod.id} [${locale}]`);

      // sanidade: a tela renderizou de fato (universo vazio não passa calado)
      expect((await texto(page)).length, `${mod.id} [${locale}] deveria ter conteúdo`).toBeGreaterThan(200);
    }

    expect(
      duplicados,
      "CABEÇALHO DUPLICADO — a tela mostra o nome do módulo duas vezes no topo.\n" +
        "A rota NÃO desenha cabeçalho (I7): se aparecem dois, a própria tela desenha dois,\n" +
        "ou alguém devolveu o cromado a `app/modulos/[id].tsx`.\n" +
        duplicados.join("\n")
    ).toEqual([]);

    expect(
      semCabecalho,
      "TELA SEM CABEÇALHO — a rota não desenha nenhum, então esta tela ficou sem título.\n" +
        "Use o `Header` de `components/ui-v2/header.tsx`, com `onVoltar`.\n" +
        semCabecalho.join(", ")
    ).toEqual([]);

    expect(
      semSaida,
      "TELA SEM SAÍDA — nenhum caminho de volta ao hub em nenhuma altura da tela.\n" +
        "⚠️ Quatro calculadoras dependiam do cromado da rota como único retorno;\n" +
        "ao remover o cromado elas ganharam `onVoltar`. Uma tela nova precisa do mesmo.\n" +
        semSaida.join(", ")
    ).toEqual([]);
  });
});
