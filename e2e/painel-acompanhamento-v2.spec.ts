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
        // "off" explícito: a UI 2.0 agora é o PADRÃO, então remover a chave devolveria
        // a versão nova. Para comparar com a antiga é preciso desligá-la.
        else window.localStorage.setItem("ui-v2", "off");
      } catch {
        /* modo privado — cai na UI antiga */
      }
    },
    [v2]
  );
  await page.goto("/modulos/pcr-adulto");
  // Espera por um MARCADOR, não por um tamanho de texto: o limiar de caracteres
  // quebrou quando a Fase 6 removeu o hero da tela e ela ficou (corretamente)
  // mais enxuta. Tamanho de página não é sinal de que ela carregou.
  await expect
    .poll(async () => (await texto(page)).includes("ESTADO ATUAL"), { timeout: 30_000 })
    .toBe(true);
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

  test("a ação principal cabe na primeira tela, sem rolar", async ({ page }) => {
    await abrirPcr(page, true);

    // O achado que motivou o cabeçalho compacto no PCR: com as três camadas
    // antigas (cromado 61 px + StepHeaderBar 60 px + hero 140 px) o botão de
    // ação principal começava em 832 px numa tela de 839 px. Numa parada, a ação
    // primária ficava abaixo da dobra e exigia rolagem.
    const medida = (await page.evaluate(`(() => {
      const acao = [...document.querySelectorAll("div")].find(
        (e) => /^(PREPARAR|CRÍTICO|URGENTE|MANTER|VERIFICAR)/.test((e.innerText || "").trim())
      );
      return {
        topo: acao ? Math.round(acao.getBoundingClientRect().top) : -1,
        janela: window.innerHeight,
      };
    })()`)) as { topo: number; janela: number };

    expect(medida.topo, "não encontrei o cartão de ação").toBeGreaterThan(0);
    expect(
      medida.topo,
      `ação principal em ${medida.topo}px de ${medida.janela}px — voltou para baixo da dobra`
    ).toBeLessThan(medida.janela * 0.75);
  });

  test("a tela migrada tem cabeçalho, seja o próprio ou o cromado", async ({ page }) => {
    await abrirPcr(page, true);
    const t = await texto(page);

    // Na Fase 5 o PCR tinha só o painel e dependia do cromado; na Fase 6 ganhou
    // cabeçalho compacto próprio e o cromado saiu. O que NÃO pode acontecer, em
    // nenhuma das duas situações, é a tela ficar sem cabeçalho — foi o defeito
    // que a Fase 4 introduziu e este teste existe para travar.
    const temCabecalhoProprio = /ACLS · Adulto/.test(t);
    const temCromado = t.includes("← Módulos");

    expect(
      temCabecalhoProprio || temCromado,
      "a tela ficou sem cabeçalho nenhum"
    ).toBe(true);
  });
});
