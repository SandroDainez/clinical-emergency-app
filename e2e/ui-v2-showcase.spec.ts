import { expect, test } from "@playwright/test";
import { aceitarConsentimento, press, pressables, texto } from "./helpers";

/**
 * Showcase da UI 2.0 (/dev/ui-v2).
 *
 * Cobre o que dá para verificar sem olho humano: os componentes montam, o
 * stepper numérico realmente altera valor, as sobreposições abrem, e o alvo
 * mínimo de toque de 44 px é respeitado — este último é requisito clínico do
 * plano, não estética, e é o tipo de coisa que regride sem ninguém notar.
 *
 * A aprovação visual continua sendo sua; isto só garante que a página não
 * quebrou.
 */
test.describe("Showcase UI 2.0", () => {
  test.beforeEach(async ({ page }) => {
    const erros: string[] = [];
    page.on("pageerror", (e) => erros.push(e.message));
    await aceitarConsentimento(page);
    await page.goto("/dev/ui-v2");
    await expect.poll(async () => (await texto(page)).length).toBeGreaterThan(500);
    expect(erros, "o showcase não deveria lançar exceção").toEqual([]);
  });

  test("monta os 16 componentes", async ({ page }) => {
    const t = await texto(page);
    for (const secao of [
      "HEADER COMPACTO",
      "BUTTON",
      "STEPPER NUMÉRICO",
      "TIMER",
      "CARD",
      "INPUT",
      "CHIP, BADGE E TAG",
      "PROGRESS",
      "SWITCH",
      "SOBREPOSIÇÕES",
      "NAVEGAÇÃO INFERIOR",
      "BOTÃO FLUTUANTE",
    ]) {
      expect(t, `seção "${secao}" deveria aparecer`).toContain(secao);
    }
  });

  test("o cronômetro formata mm:ss e hh:mm:ss", async ({ page }) => {
    const t = await texto(page);
    expect(t).toContain("02:34");
    expect(t).toContain("01:32");
    // Acima de uma hora muda de formato — é o caso que quebra formatador ingênuo.
    expect(t).toContain("01:02:05");
  });

  test("o stepper numérico altera o valor", async ({ page }) => {
    const lerPeso = async () => {
      const m = (await texto(page)).match(/Peso\n([\d.,]+)/);
      return m ? Number(m[1].replace(",", ".")) : NaN;
    };

    const antes = await lerPeso();
    expect(antes, "o peso inicial deveria estar visível").toBeGreaterThan(0);

    await pressables(page).filter({ hasText: /^\+$/ }).first().click();
    await expect.poll(lerPeso).toBeGreaterThan(antes);

    await pressables(page).filter({ hasText: /^−$/ }).first().click();
    await expect.poll(lerPeso).toBe(antes);
  });

  test("modal e bottom sheet abrem e fecham", async ({ page }) => {
    await press(page, "Abrir modal");
    await expect(page.getByText("Confirmar encerramento")).toBeVisible();
    await press(page, "Fechar");
    await expect(page.getByText("Confirmar encerramento")).toHaveCount(0);

    await press(page, "Abrir bottom sheet");
    await expect(page.getByText("Critérios de anafilaxia")).toBeVisible();
  });

  test("todo elemento tocável respeita o alvo mínimo de 44 px", async ({ page }) => {
    // Escopado ao conteúdo do showcase: o cabeçalho de navegação do expo-router
    // fica FORA dele e traz uma seta de voltar de 30×30, abaixo do mínimo. É
    // chrome do framework, não componente nosso — some quando o Header compacto
    // substituir esse cabeçalho na Fase 4. Registrado em NOTAS-LOGICA.md (L-004).
    const alvos = page.getByTestId("showcase-ui-v2").locator('[tabindex="0"]:visible');
    const total = await alvos.count();
    expect(total).toBeGreaterThan(10);

    const pequenos: string[] = [];
    for (let i = 0; i < total; i++) {
      const alvo = alvos.nth(i);
      const caixa = await alvo.boundingBox();
      if (!caixa) continue;
      // 44 é o mínimo do plano. Tolerância de 1 px para arredondamento de layout.
      if (caixa.height < 43 || caixa.width < 43) {
        const rotulo = (await alvo.innerText()).replace(/\n/g, " ").slice(0, 30);
        pequenos.push(`"${rotulo}" ${Math.round(caixa.width)}×${Math.round(caixa.height)}`);
      }
    }

    expect(pequenos, "alvo de toque abaixo de 44 px").toEqual([]);
  });
});
