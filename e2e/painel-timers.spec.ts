import { expect, test } from "@playwright/test";
import {
  abrirModulo,
  cronometros,
  emSegundos,
  esperarEstadoDiferenteDe,
  estadoAtual,
  press,
  valorDoPainel,
} from "./helpers";

/**
 * Painel de acompanhamento e cronômetros.
 *
 * O plano UI 2.0 vai reorganizar o painel em grid (Fase 5) e mexer no timer
 * (tabular-nums, pulso de opacidade). Estes testes garantem que a mudança fica
 * na apresentação: os VALORES continuam vindo do estado real.
 */
test.describe("Painel de acompanhamento", () => {
  test("começa zerado e reflete o choque aplicado", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");

    expect(await valorDoPainel(page, "CHOQUES")).toBe("0");
    expect(await valorDoPainel(page, "EPINEFRINA")).toBe("0 doses");
    expect(await valorDoPainel(page, "ANTIARRÍTMICO")).toBe("Não administrado");
    expect(await valorDoPainel(page, "VIA AÉREA")).toBe("Não registrada");

    await press(page, "Confirmar");
    await press(page, "Sem pulso");
    await press(page, "Iniciar RCP");
    await press(page, "Ver ritmo");
    await press(page, "Chocável");
    await press(page, "Bifásico");
    const anterior = await estadoAtual(page);
    await press(page, "Afastar todos");
    await esperarEstadoDiferenteDe(page, anterior);

    // ⚠️ "×1"/"×0", não "1"/"0 doses": neste estado (pós-choque, rcp_1) o card
    // dos QUATRO RELÓGIOS é quem mostra Choques e Epinefrina — o painel resumido
    // some daqui de propósito, para o mesmo número não aparecer duas vezes na
    // tela (2026-08-18). "×N" é o formato aprovado, simétrico nos dois.
    expect(await valorDoPainel(page, "CHOQUES")).toBe("×1");
    // Regra ACLS: epinefrina não entra no 1º ciclo pós-choque do ramo chocável.
    expect(await valorDoPainel(page, "EPINEFRINA")).toBe("×0");
  });
});

test.describe("Cronômetros", () => {
  test("o tempo do caso corre e é monotônico", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    await press(page, "Confirmar");
    await press(page, "Sem pulso");

    const inicio = (await cronometros(page))[0];
    expect(inicio, "deveria haver um cronômetro mm:ss na tela").toBeTruthy();

    await expect
      .poll(
        async () => {
          const agora = (await cronometros(page))[0];
          return agora ? emSegundos(agora) : -1;
        },
        { message: "o cronômetro do caso deveria avançar", timeout: 20_000 }
      )
      .toBeGreaterThan(emSegundos(inicio));
  });

  test("o ciclo pós-choque tem contagem regressiva de 2 minutos", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    await press(page, "Confirmar");
    await press(page, "Sem pulso");
    await press(page, "Iniciar RCP");
    await press(page, "Ver ritmo");
    await press(page, "Chocável");
    await press(page, "Bifásico");
    const anterior = await estadoAtual(page);
    await press(page, "Afastar todos");
    await esperarEstadoDiferenteDe(page, anterior);

    // O ciclo aparece como "NNs" e deve DECRESCER (é regressivo).
    const lerCiclo = async () => {
      const t = await page.locator("body").innerText();
      const m = t.match(/\b(\d{1,3})s\b/);
      return m ? Number(m[1]) : -1;
    };

    const primeiro = await lerCiclo();
    expect(primeiro, "deveria haver contagem do ciclo em segundos").toBeGreaterThan(0);
    expect(primeiro, "o ciclo do ACLS é de 2 minutos").toBeLessThanOrEqual(120);

    await expect
      .poll(lerCiclo, { message: "o ciclo deveria decrescer", timeout: 20_000 })
      .toBeLessThan(primeiro);
  });
});
