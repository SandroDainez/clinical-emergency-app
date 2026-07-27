import { expect, test } from "@playwright/test";
import { abrirModulo, press, pressables, texto } from "./helpers";

/**
 * Voz — lado da interface.
 *
 * O casamento transcrição → intent é coberto por `npm run test:voice`, em Node,
 * porque reconhecimento de voz exige microfone e permissão do navegador: um E2E
 * teria de mockar a Web Speech API e passaria a testar o mock.
 *
 * O que se verifica aqui é o que o E2E pode verificar de verdade: o painel de
 * voz existe, é alcançável e mostra à equipe quais comandos valem na etapa
 * atual. Numa emergência, um painel de voz que some é uma regressão real.
 */
test.describe("Painel de voz", () => {
  test("é alcançável e anuncia os comandos válidos da etapa", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");

    // Existe o acionador de voz desde a primeira etapa.
    await expect(pressables(page).filter({ hasText: /ATIVAR VOZ/i }).first()).toBeVisible();

    await press(page, "Confirmar");
    await press(page, "Sem pulso");
    await press(page, "FERRAMENTAS");

    const t = await texto(page);
    expect(t, "o painel de apoio deveria expor a seção de voz").toMatch(/Voz/);
    expect(
      t,
      "a equipe precisa ver qual comando falar nesta etapa"
    ).toMatch(/reanimação|pulso|ritmo|compress/i);
  });

  test("o acionador de voz continua presente ao longo do fluxo", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    const acionador = pressables(page).filter({ hasText: /ATIVAR VOZ/i }).first();

    for (const passo of ["Confirmar", "Sem pulso", "Iniciar RCP"]) {
      await press(page, passo);
      await expect(
        acionador,
        `voz deveria seguir disponível após "${passo}"`
      ).toBeVisible();
    }
  });
});
