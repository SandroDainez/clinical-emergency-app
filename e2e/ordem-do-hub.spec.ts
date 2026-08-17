import { expect, test } from "@playwright/test";

import { MODULE_AREA_LABELS } from "../constants/module-area-labels";
import { getClinicalModules } from "../clinical-modules";
import { fixarIdioma } from "./helpers";

/**
 * PROMETE: que no hub os módulos de CONSULTA (tabela, calculadora) apareçam DEPOIS
 *   de todos os módulos de CENÁRIO, na ordem em que os cards são desenhados na
 *   tela. Mede a POSIÇÃO VERTICAL renderizada.
 * NÃO PROMETE: a ordem entre os módulos de cenário (é alfabética, e isso é
 *   decisão de previsibilidade, não de clínica), nem a posição do card do PCR
 *   (é herói e vem primeiro por regra própria). Também não vê o que acontece
 *   depois de rolar — mede as coordenadas, que existem independentemente da
 *   dobra.
 * UNIVERSO: os módulos de `getClinicalModules()` cruzados com
 *   `MODULE_AREA_LABELS` — derivados da fonte, para que módulo novo entre sem
 *   ninguém lembrar.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ────────────────────────────────────
 *
 * O bloco das etiquetas consertou o RÓTULO: `ritmos-acls` e `farmacologia-acls`
 * passaram a dizer CONSULTA. A POSIÇÃO seguiu dizendo o contrário — o hub ordenava
 * os 31 módulos por título, e o alfabeto punha `Farmacologia no ACLS` na 5ª
 * posição e `Ritmos de Parada` na 7ª, duas TABELAS no meio dos guias.
 *
 * Etiqueta e posição são lidas juntas, e quem abre o app com um paciente lê a
 * posição primeiro.
 *
 * ── ⚠️ POR QUE ESTA TRAVA MEDE A TELA, E NÃO O ARRAY ───────────────────────
 *
 * Porque eu tentei o array e errei. Reordenei `constants/module-groups.ts` — que
 * tem os módulos agrupados por tema — e relatei a queixa como resolvida. Aquele
 * arquivo NÃO desenha tela: existe para cobertura e validação, e o seu próprio
 * cabeçalho diz isso. A produção mostrou os cards ainda em ordem alfabética.
 *
 * A ordem que vale é a de `components/module-hub.tsx`. Uma trava sobre o array
 * teria passado verde com o defeito intacto na tela — é o R-85 e o R-83 juntos:
 * a razão estava escrita e eu agi sem ler, e medi a forma no lugar do objeto.
 */

const MODULOS = getClinicalModules();
const SO_CONSULTA = new Set(["CONSULTA", "Calculadoras"]);
const ehConsulta = (id: string) => SO_CONSULTA.has(MODULE_AREA_LABELS[id] ?? "");

test.describe("Ordem do hub", () => {
  test("consulta vem depois de cenário, na tela", async ({ page }) => {
    // ⚠️ VACUIDADE: sem esta conferência, um hub que não renderiza card nenhum
    // passaria — a lista de consulta ficaria vazia e "nenhuma antes" seria trivial.
    const esperados = MODULOS.filter((m) => !ehConsulta(m.id)).length;
    expect(esperados, "deveria haver módulos de cenário para comparar").toBeGreaterThan(20);

    await fixarIdioma(page, "pt-BR");
    await page.goto("/(tabs)");
    await expect
      .poll(async () => (await page.locator("body").innerText()).length, { timeout: 30_000 })
      .toBeGreaterThan(500);

    const titulos = MODULOS.map((m) => ({ id: m.id, title: m.title, consulta: ehConsulta(m.id) }));
    const posicoes = await page.evaluate((alvos) => {
      const achados: { id: string; y: number }[] = [];
      for (const el of Array.from(document.querySelectorAll("div,span"))) {
        if (el.children.length) continue;
        const t = ((el as HTMLElement).innerText || "").trim();
        if (!t) continue;
        const alvo = alvos.find((a) => t === a.title);
        if (!alvo || achados.some((x) => x.id === alvo.id)) continue;
        achados.push({ id: alvo.id, y: Math.round(el.getBoundingClientRect().top) });
      }
      return achados;
    }, titulos);

    // ⚠️ VACUIDADE: card não encontrado não pode virar aprovação silenciosa.
    expect(
      posicoes.length,
      `só ${posicoes.length} dos ${MODULOS.length} cards foram localizados no hub — ` +
        "a leitura pode ter quebrado, e uma comparação sobre 2 cards passa por acaso"
    ).toBeGreaterThan(25);

    const consulta = posicoes.filter((p) => ehConsulta(p.id));
    const cenario = posicoes.filter((p) => !ehConsulta(p.id) && p.id !== "pcr-adulto");
    expect(consulta.length, "nenhum módulo de CONSULTA encontrado na tela").toBeGreaterThan(0);

    const maisBaixoCenario = Math.max(...cenario.map((c) => c.y));
    const errados = consulta.filter((c) => c.y < maisBaixoCenario);

    expect(
      errados.map((e) => `${e.id} (y=${e.y})`),
      "MÓDULO DE CONSULTA ANTES DE MÓDULO DE CENÁRIO no hub.\n" +
        "Quem abre o app tem um paciente; quem quer tabela vai buscá-la.\n" +
        `O cenário mais baixo está em y=${maisBaixoCenario}.\n` +
        "⚠️ A ordem vale em `components/module-hub.tsx` — reordenar\n" +
        "`constants/module-groups.ts` não muda a tela (foi o erro cometido)."
    ).toEqual([]);
  });
});
