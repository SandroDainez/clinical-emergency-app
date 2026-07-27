import { expect, test, type Page } from "@playwright/test";
import { pressables, texto } from "./helpers";

/**
 * Piloto da Fase 3 — Ritmos de Parada na UI 2.0.
 *
 * O teste central é a comparação de conteúdo: abre a MESMA rota nas duas
 * versões e exige que o texto clínico seja idêntico. É o que prova que a
 * migração mexeu só na apresentação.
 *
 * Se um dia alguém editar dose ou conduta em só uma das versões, é aqui que
 * aparece — e é por isso que este teste importa mais que qualquer screenshot.
 */

/** Abre o módulo com a flag da UI 2.0 ligada ou desligada. */
async function abrirPiloto(page: Page, v2: boolean) {
  await page.addInitScript(
    ([ligar]) => {
      try {
        window.localStorage.setItem("app-locale", "pt-BR");
        if (ligar) window.localStorage.setItem("ui-v2", "ritmos-acls");
        else window.localStorage.removeItem("ui-v2");
      } catch {
        /* modo privado — cai no padrão, que é a UI antiga */
      }
    },
    [v2]
  );
  await page.goto("/modulos/ritmos-acls");
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(500);
}

/**
 * Reduz a tela ao conteúdo clínico comparável.
 *
 * Descarta o que é legitimamente diferente entre as versões: a landing que fica
 * montada sob todo módulo (ver `anchor: index` em app/_layout.tsx) e o cromado
 * de navegação. O que sobra é o material do módulo.
 */
async function conteudoClinico(page: Page): Promise<string[]> {
  const bruto = await texto(page);
  const inicio = bruto.indexOf("Ritmos de Parada");
  const relevante = inicio === -1 ? bruto : bruto.slice(inicio);
  return relevante
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);
}

test.describe("Piloto UI 2.0 — Ritmos de Parada", () => {
  test("a flag desligada mantém a tela antiga", async ({ page }) => {
    await abrirPiloto(page, false);
    const t = await texto(page);
    expect(t).toContain("Ritmos de Parada");
    expect(t).toContain("Fibrilação Ventricular");
  });

  test("a flag ligada renderiza a tela nova sem erro", async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (e) => erros.push(e.message));

    await abrirPiloto(page, true);
    const t = await texto(page);
    expect(t).toContain("Ritmos de Parada");
    expect(t).toContain("Fibrilação Ventricular");
    expect(erros, "a tela migrada não deveria lançar exceção").toEqual([]);
  });

  test("o conteúdo clínico é idêntico nas duas versões", async ({ page }) => {
    await abrirPiloto(page, false);
    const antiga = await conteudoClinico(page);

    await abrirPiloto(page, true);
    const nova = await conteudoClinico(page);

    // Toda linha da versão antiga tem de existir na nova. A comparação é por
    // conjunto, não por ordem: reorganizar a hierarquia visual é permitido —
    // perder ou alterar conteúdo clínico não é.
    const faltando = antiga.filter((linha) => !nova.includes(linha));
    expect(faltando, "conteúdo clínico perdido na migração").toEqual([]);

    // E nada de conteúdo clínico inventado na versão nova.
    const sobrando = nova.filter((linha) => !antiga.includes(linha));
    expect(sobrando, "conteúdo que só existe na versão nova").toEqual([]);
  });

  test("todo tocável da tela migrada respeita o alvo de 44 px", async ({ page }) => {
    await abrirPiloto(page, true);

    // Escopado ao ScrollView do módulo: o cabeçalho do expo-router traz uma seta
    // de 30×30 que é cromado do framework, não componente nosso (L-004).
    const alvos = pressables(page);
    const total = await alvos.count();
    const pequenos: string[] = [];

    for (let i = 0; i < total; i++) {
      const caixa = await alvos.nth(i).boundingBox();
      if (!caixa) continue;
      if (caixa.height < 43 || caixa.width < 43) {
        const rotulo = (await alvos.nth(i).innerText()).replace(/\n/g, " ").slice(0, 30);
        // A seta do cabeçalho do framework é exceção conhecida (L-004).
        if (/^←?\s*$/.test(rotulo)) continue;
        pequenos.push(`"${rotulo}" ${Math.round(caixa.width)}×${Math.round(caixa.height)}`);
      }
    }

    expect(pequenos, "alvo de toque abaixo de 44 px na tela migrada").toEqual([]);
  });
});
