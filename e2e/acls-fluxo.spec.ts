import { expect, test } from "@playwright/test";
import {
  abrirModulo,
  esperarEstadoDiferenteDe,
  estadoAtual,
  press,
  valorDoPainel,
} from "./helpers";

/**
 * Contrato de não-regressão do fluxo ACLS.
 *
 * Percorre a sequência real do módulo de PCR até o primeiro choque. A ordem das
 * etapas é a asserção: se a migração visual trocar a ordem, suprimir uma etapa
 * ou pular uma decisão, este teste falha.
 */
test.describe("ACLS — sequência de etapas", () => {
  test("avança na ordem correta do reconhecimento até o 1º choque", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");

    // 1. Reconhecimento inicial
    expect(await estadoAtual(page)).toContain("Reconhecimento inicial da PCR");

    // 2. Confirmar → checagem de respiração e pulso
    let anterior = await estadoAtual(page);
    await press(page, "Confirmar");
    let estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("respiração e pulso");

    // 3. Sem pulso → iniciar RCP
    anterior = estado;
    await press(page, "Sem pulso");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("Iniciar RCP");

    // 4. Iniciar RCP → preparar checagem de ritmo
    anterior = estado;
    await press(page, "Iniciar RCP");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("verificar ritmo");

    // 5. Ver ritmo → pergunta do ritmo
    anterior = estado;
    await press(page, "Ver ritmo");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("Qual é o ritmo?");

    // 6. Chocável → tipo de desfibrilador (a escolha do aparelho vem ANTES do
    //    choque; pular esta etapa seria regressão clínica)
    anterior = estado;
    await press(page, "Chocável");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("tipo de desfibrilador");

    // 7. Bifásico → aplicar choque
    anterior = estado;
    await press(page, "Bifásico");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("Aplicar choque bifásico");

    // 8. Choque aplicado → RCP de 2 minutos
    anterior = estado;
    await press(page, "Afastar todos");
    estado = await esperarEstadoDiferenteDe(page, anterior);
    expect(estado).toContain("2 minutos");
    expect(await valorDoPainel(page, "CHOQUES")).toBe("1");
  });

  test("ramo não chocável não oferece desfibrilação", async ({ page }) => {
    await abrirModulo(page, "pcr-adulto");
    await press(page, "Confirmar");
    await press(page, "Sem pulso");
    await press(page, "Iniciar RCP");
    await press(page, "Ver ritmo");

    const anterior = await estadoAtual(page);
    await press(page, "Não chocável");
    await esperarEstadoDiferenteDe(page, anterior);

    // Regra ACLS: sem desfibrilação em AESP/assistolia.
    expect(await valorDoPainel(page, "CHOQUES")).toBe("0");
    await expect(page.getByText("tipo de desfibrilador")).toHaveCount(0);
  });
});
