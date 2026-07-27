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
 * Rótulos de NAVEGAÇÃO que a Fase 4 colapsou de propósito.
 *
 * A tela antiga tinha três cabeçalhos empilhados dizendo a mesma coisa — a barra
 * do expo-router, o cromado do módulo e um card dentro da tela — somando 191 px,
 * 27% da altura. A versão nova tem UMA linha. Estes rótulos existem só numa das
 * versões por decisão de projeto, e comparar isso não diz nada sobre conteúdo
 * clínico.
 *
 * A lista é FECHADA e nomeada de propósito: excluir "o que difere" transformaria
 * o teste num carimbo. Perder uma dose continua falhando.
 */
const ROTULOS_DE_CROMADO = new Set([
  "Voltar",
  "ACLS",
  "Módulos",
  "← Módulos",
  "Referência",
  // O título do módulo aparecia DUAS vezes no corpo da tela antiga (no card de
  // cabeçalho e como h1 da introdução). Na versão nova ele existe uma vez, na
  // linha de cabeçalho, fora do corpo rolável. Não é conteúdo perdido, é o
  // objetivo da Fase 4 — e está verificado no teste do cabeçalho compacto.
  "Ritmos de Parada",
]);

/**
 * Conteúdo clínico do CORPO ROLÁVEL do módulo.
 *
 * Lê o container de scroll que contém o material dos ritmos, e não a página
 * inteira. Duas razões:
 *
 * 1. A landing fica montada sob todo módulo (`anchor: index` em app/_layout.tsx)
 *    e o texto dela não é do módulo.
 * 2. O cabeçalho é justamente o que a Fase 4 reorganizou: na versão nova o
 *    título do módulo passou do corpo para a única linha de cabeçalho, junto com
 *    a etapa. Comparar cabeçalho contra corpo mediria a mudança de projeto, não
 *    perda de conteúdo.
 *
 * O título continua verificado — só num teste próprio, onde ele pertence.
 */
async function conteudoClinico(page: Page): Promise<string[]> {
  const bruto = await page.evaluate(`(() => {
    const roladores = [...document.querySelectorAll("div")].filter(
      (e) => e.scrollHeight > e.clientHeight + 100 && e.clientHeight > 200
    );
    // O corpo do módulo é o rolador que contém o material clínico.
    const corpo = roladores.find((e) => (e.innerText || "").includes("Fibrilação Ventricular"));
    return (corpo ?? document.body).innerText;
  })()`);

  return String(bruto)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !ROTULOS_DE_CROMADO.has(l));
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

  test("o cabeçalho compacto mostra módulo e etapa numa única linha", async ({ page }) => {
    await abrirPiloto(page, true);

    // Fase 4: as três camadas de cabeçalho (191 px, 27% da tela) viraram uma.
    // O conteúdo tem de começar perto do topo.
    const inicioDoConteudo = await page.evaluate(`(() => {
      const tag = [...document.querySelectorAll("div")].find(
        (e) => (e.innerText || "").trim().startsWith("ACLS · REFER")
      );
      return tag ? Math.round(tag.getBoundingClientRect().top) : -1;
    })()`);

    expect(Number(inicioDoConteudo), "conteúdo deveria começar perto do topo").toBeGreaterThan(0);
    expect(
      Number(inicioDoConteudo),
      "cabeçalho acima de 100 px significa camadas empilhadas de volta"
    ).toBeLessThan(100);

    // Módulo e etapa continuam visíveis — o que mudou é onde, não se aparecem.
    const t = await texto(page);
    expect(t).toContain("Ritmos de Parada");
    expect(t).toContain("Referência");
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
