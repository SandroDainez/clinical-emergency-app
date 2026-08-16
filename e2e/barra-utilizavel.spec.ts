import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import { abrirModulo } from "./helpers";

/**
 * TODA barra numérica renderizada tem de ser ARRASTÁVEL — em todos os módulos.
 *
 * ── POR QUE ISTO É UMA CLASSE, E NÃO TRÊS CASOS ─────────────────────────────
 *
 * O mesmo defeito apareceu TRÊS vezes, por três caminhos diferentes, e nenhuma
 * das três veio de procurar — as três vieram de tropeçar:
 *
 *   · Calculadoras Clínicas — `fieldRow: row` + `fieldLabel: flex: 1`
 *   · Eletrólitos           — coluna de `flexBasis: 48%`
 *   · Sedoanalgesia         — `row` + `flex: 1`, com o slider medindo 0 px
 *
 * Em todos, o `NumericStepper` estava CORRETO. O que quebra é o hospedeiro:
 * quando o rótulo divide a linha com o controle, ou a coluna é estreita, os
 * botões −/+ (44 px cada, alvo mínimo de toque) consomem a largura e sobra uma
 * bolinha. ⚠️ O defeito é INVISÍVEL no código do componente e invisível na
 * revisão do estilo — só a largura RENDERIZADA o mostra.
 *
 * Na Sedoanalgesia isso tinha consequência clínica: sem peso confirmado a taxa
 * da bomba não sai, e a barra tinha 0 px.
 *
 * ── UNIVERSO DERIVADO, NÃO LISTADO (D-15) ───────────────────────────────────
 *
 * A primeira versão desta medição vivia em `eletrolitos-na-tela.spec.ts` e
 * cobria UMA tela. Era o defeito do D-15 de novo: instrumento certo, universo
 * escolhido à mão. Aqui o universo vem de `dist/modulos/*.html` — os módulos
 * que o build publicou —, então a quarta tela entra sozinha.
 *
 * NÃO PROMETE: cobre o que está na PRIMEIRA tela de cada módulo. Os campos que
 * só aparecem depois de navegar (as árvores de decisão) têm cobertura própria
 * em `barra-numerica.spec.ts`, que percorre o fluxo. Também não diz nada sobre
 * contraste (é do `contraste-renderizado.spec.ts`) nem sobre a faixa do campo
 * (é do `test:faixas`).
 */

/**
 * Piso de largura útil.
 *
 * Não é estético: abaixo disto o polegar do controle cobre boa parte da trilha
 * e o arrasto vira sorte — com luva, no plantão, é inutilizável. Os casos reais
 * encontrados mediam 0 px, 2 px e 30 px; as barras corretas medem 165 px numa
 * tela de 375.
 */
const LARGURA_MINIMA = 120;

function modulosPublicados(): string[] {
  const dir = path.resolve(__dirname, "..", "dist", "modulos");
  if (!fs.existsSync(dir)) {
    throw new Error(
      "dist/modulos não existe — rode `npm run build:web` antes. Sem build não há universo, " +
        "e um teste sem universo passa por vacuidade (R-15 item 9)."
    );
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html") && !f.startsWith("["))
    .map((f) => f.replace(/\.html$/, ""))
    .sort();
}

/**
 * Dívida congelada — barras estreitas que ainda não foram corrigidas.
 *
 * Teto por módulo, e o teto SÓ DESCE (molde da D-35 e do legado de cor).
 * Módulo fora desta lista falha com qualquer barra abaixo do piso.
 */
const LEGADO: Record<string, number> = {
  // ⚠️ ESTES SEIS SAÍRAM DA VARREDURA, NÃO DE RELATO. O autor relatou dois
  // casos, tropeçamos em um terceiro, e a primeira execução desta trava achou
  // mais DOIS módulos que ninguém tinha olhado — a barra de altura da
  // Ventilação Mecânica e os campos de dose e taxa das Vasoativas.
  //
  // Cada um cai no bloco de convergência da sua tela; o teto só desce.
  "calculadoras-clinicas": 1, // slider-altura: 0 px
  "drogas-vasoativas": 2, //     slider-dose: 40 px · slider-taxa: 0 px
  "sedoanalgesia": 1, //         slider-dose: 2 px (o peso já foi corrigido)
  "ventilacao-mecanica": 1, //   slider-altura: 0 px
};

for (const id of modulosPublicados()) {
  test(`barra utilizável — ${id}`, async ({ page }) => {
    await abrirModulo(page, id);

    const estreitas = await page.evaluate((minimo: number) => {
      return Array.from(document.querySelectorAll('[role="slider"]'))
        .map((el) => {
          const r = el.getBoundingClientRect();
          const dono = el.closest("[data-testid]") as HTMLElement | null;
          return {
            campo: dono?.dataset?.testid ?? "(sem testID)",
            largura: Math.round(r.width),
            visivel: r.height > 0,
          };
        })
        .filter((b) => b.visivel && b.largura < minimo)
        .map((b) => `${b.campo}: ${b.largura} px`);
    }, LARGURA_MINIMA);

    const teto = LEGADO[id];
    if (teto === undefined) {
      expect(
        estreitas,
        `barra numérica esmagada em "${id}" — com menos de ${LARGURA_MINIMA} px o controle não é ` +
          `arrastável. A causa costuma ser o hospedeiro: rótulo em \`flex: 1\` na mesma linha, ou ` +
          `coluna estreita. O padrão canônico é empilhado, com o controle na largura inteira.`
      ).toEqual([]);
      return;
    }

    if (estreitas.length) {
      console.warn(`⚠️  ${id}: ${estreitas.length} barra(s) estreita(s) (teto ${teto})\n      ${estreitas.join("\n      ")}`);
    }
    expect(
      estreitas.length,
      `"${id}" piorou: ${estreitas.length} barras estreitas contra um teto de ${teto}.`
    ).toBeLessThanOrEqual(teto);
  });
}
