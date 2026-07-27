import { expect, test } from "@playwright/test";
import {
  abrirModulo,
  esperarEstadoDiferenteDe,
  estadoAtual,
  press,
  pressables,
  texto,
} from "./helpers";

/** Abre o painel de ferramentas e o log clínico dentro dele. */
async function abrirLogClinico(page: import("@playwright/test").Page) {
  await press(page, "FERRAMENTAS");
  const log = pressables(page).filter({ hasText: /^\s*Ver log clínico/i }).first();
  await expect(log).toBeVisible();
  await log.click();
}

/**
 * Registro de eventos.
 *
 * O log clínico é a memória do caso — alimenta debrief, histórico e o resumo
 * enviado ao Supabase. Nenhuma fase visual pode fazer o app parar de registrar.
 */
test.describe("Registro clínico", () => {
  test("registra o início do caso com horário", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    await press(page, "Confirmar");
    await press(page, "Sem pulso");

    await abrirLogClinico(page);
    const t = await texto(page);

    expect(t, "o log deveria registrar o início da PCR").toContain("PCR iniciada");
    expect(t, "cada entrada do log deveria ter horário").toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  test("registra o choque aplicado", async ({ page }) => {
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

    await abrirLogClinico(page);
    const t = (await texto(page)).toLowerCase();

    expect(t, "o log deveria conter o registro do choque").toMatch(
      /choque|desfibrila/
    );
  });
});
