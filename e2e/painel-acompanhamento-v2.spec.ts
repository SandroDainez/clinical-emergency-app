import { expect, test, type Page } from "@playwright/test";
import { press, texto } from "./helpers";

/**
 * Painel de acompanhamento em grid — Fase 5.
 *
 * O contrato é o mesmo do plano: MESMAS informações, ZERO alteração de fonte de
 * dados. Por isso o teste central compara os valores do painel novo com os do
 * painel antigo, na mesma etapa clínica.
 *
 * Também trava a regressão que a Fase 4 introduziu: ligar a flag num módulo que
 * recebeu só parte da migração não pode remover o cabeçalho da tela.
 */

async function abrirPcr(page: Page, v2: boolean) {
  await page.addInitScript(
    ([ligar]) => {
      try {
        window.localStorage.setItem("app-locale", "pt-BR");
        if (ligar) window.localStorage.setItem("ui-v2", "pcr-adulto");
        else window.localStorage.removeItem("ui-v2");
      } catch {
        /* modo privado — cai na UI antiga */
      }
    },
    [v2]
  );
  await page.goto("/modulos/pcr-adulto");
  await expect.poll(async () => (await texto(page)).length, { timeout: 30_000 }).toBeGreaterThan(500);
}

/** Lê os valores de acompanhamento pelo rótulo, em qualquer das duas versões. */
async function valores(page: Page) {
  const t = await texto(page);
  const ler = (rotulo: string) => {
    const m = t.match(new RegExp(`${rotulo}\\n([^\\n]+)`, "i"));
    return m ? m[1].trim() : null;
  };
  return {
    estado: ler("ESTADO ATUAL"),
    choques: ler("CHOQUES"),
    epinefrina: ler("EPINEFRINA"),
    antiarritmico: ler("ANTIARRÍTMICO"),
    viaAerea: ler("VIA AÉREA"),
  };
}

test.describe("Painel de acompanhamento (Fase 5)", () => {
  test("mostra as mesmas informações que o painel antigo", async ({ page }) => {
    await abrirPcr(page, false);
    const antigo = await valores(page);

    await abrirPcr(page, true);
    const novo = await valores(page);

    // Todo rótulo precisa existir nas duas versões e com o MESMO valor.
    expect(antigo.estado, "o painel antigo deveria expor o estado").toBeTruthy();
    expect(novo).toEqual(antigo);
  });

  test("o painel reflete o choque aplicado", async ({ page }) => {
    await abrirPcr(page, true);
    expect((await valores(page)).choques).toBe("0");

    await press(page, "Confirmar");
    await press(page, "Sem pulso");
    await press(page, "Iniciar RCP");
    await press(page, "Ver ritmo");
    await press(page, "Chocável");
    await press(page, "Bifásico");
    await press(page, "Afastar todos");

    await expect.poll(async () => (await valores(page)).choques).toBe("1");
    // Regra ACLS preservada: sem epinefrina no 1º ciclo pós-choque.
    expect((await valores(page)).epinefrina).toBe("0 doses");
  });

  test("o cronômetro usa dígitos de largura fixa", async ({ page }) => {
    await abrirPcr(page, true);

    const tabular = await page.evaluate(`(() => {
      const rotulo = [...document.querySelectorAll("div")].find(
        (e) => (e.innerText || "").trim() === "TEMPO DE PARADA"
      );
      if (!rotulo) return null;
      const valor = rotulo.parentElement?.querySelector("div:nth-child(2)");
      return valor ? getComputedStyle(valor).fontVariantNumeric : null;
    })()`);

    // Sem tabular-nums os dígitos mudam de largura e o número treme a cada
    // segundo — no elemento que se olha de relance durante a parada.
    expect(String(tabular)).toContain("tabular-nums");
  });

  test("ligar a flag não remove o cabeçalho de módulo parcialmente migrado", async ({ page }) => {
    await abrirPcr(page, true);
    const t = await texto(page);

    // O PCR recebeu só o painel na Fase 5, não o ScreenTemplate. Sem o cromado
    // ele ficaria sem cabeçalho nenhum — foi o que aconteceu, e este teste é a
    // trava para não repetir.
    expect(t, "o PCR deveria manter o cromado de navegação").toContain("← Módulos");
  });
});
