import { expect, test, type Page } from "@playwright/test";
import { press, texto, fixarIdioma} from "./helpers";

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
  await fixarIdioma(page, "pt-BR");
  await page.addInitScript(
    ([ligar]) => {
      try {
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
  // O marcador depende da versão, e não dá para usar um só:
  //   • a v2 abre com o painel FECHADO, então "ESTADO ATUAL" ainda não existe —
  //     esperar por ele estourava o tempo e derrubava o arquivo inteiro;
  //   • o painel ANTIGO não usa o rótulo "TEMPO DE PARADA", então esperar por
  //     ele quebrava o caminho de comparação.
  const marcador = v2 ? "TEMPO DE PARADA" : "ESTADO ATUAL";
  await expect
    .poll(async () => (await texto(page)).includes(marcador), { timeout: 30_000 })
    .toBe(true);
}

/**
 * Lê os valores de acompanhamento pelo rótulo, em qualquer das duas versões.
 *
 * Expande o painel antes: na faixa fechada os rótulos são CURTOS ("CHOQ",
 * "EPI"), porque os longos truncavam em "CHO…" e "EPINE…" numa tela de 390 px.
 * Os rótulos completos, que é o que este helper procura, só existem no grid
 * expandido.
 */
async function valores(page: Page) {
  const alternar = page.getByTestId("painel-acompanhamento-v2-alternar");
  if ((await alternar.count()) > 0 && !(await texto(page)).includes("VIA AÉREA")) {
    await alternar.first().click();
    await page
      .waitForFunction(`document.body.innerText.includes("VIA AÉREA")`, null, { timeout: 5_000 })
      .catch(() => {});
  }
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
  test("nada se perdeu — as mesmas informações, atrás de um toque", async ({ page }) => {
    // ── O contrato mudou de forma, não de conteúdo ────────────────────────────
    //
    // A versão anterior deste teste comparava o texto das duas versões e exigia
    // igualdade IMEDIATA. Isso travava a informação toda visível de uma vez, que
    // é justamente o que fazia o painel roubar a tela da ação no celular.
    //
    // A garantia que importa continua: nenhuma informação foi REMOVIDA. Ela
    // passou a ser revelada em dois tempos. Então o teste agora expande o painel
    // antes de comparar — se algum rótulo sumir de verdade, ele quebra igual.
    await abrirPcr(page, false);
    const antigo = await valores(page);

    await abrirPcr(page, true);
    await page.getByTestId("painel-acompanhamento-v2-alternar").click();
    await expect
      .poll(async () => (await texto(page)).includes("VIA AÉREA"), { timeout: 5_000 })
      .toBe(true);
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

    // ⚠️ "×1"/"×0": neste estado o card dos QUATRO RELÓGIOS mostra Choques e
    // Epinefrina, e o painel resumido some daqui de propósito para o mesmo
    // número não repetir na tela (2026-08-18).
    await expect.poll(async () => (await valores(page)).choques).toBe("×1");
    // Regra ACLS preservada: sem epinefrina no 1º ciclo pós-choque.
    expect((await valores(page)).epinefrina).toBe("×0");
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

  test("a faixa começa fechada e abre no toque", async ({ page }) => {
    // O painel encolheu para não roubar a área da ação. Fechado, mostra só o
    // cronômetro e os dois contadores de relance; o resto abre no toque.
    //
    // Escopado ao testID do painel de propósito: os mesmos rótulos aparecem em
    // outros pontos da tela, e ler o texto da página inteira — como o teste de
    // paridade faz — não distingue o que está DENTRO do painel. Foi por isso
    // que aquele teste continuou passando enquanto o painel mudava.
    await abrirPcr(page, true);
    const painel = page.getByTestId("painel-acompanhamento-v2");
    await expect(painel).toBeVisible();

    const fechado = (await painel.innerText()).toUpperCase();
    expect(fechado, "o cronômetro fica na faixa fechada").toContain("TEMPO DE PARADA");
    expect(
      fechado.includes("VIA AÉREA"),
      "via aérea é consulta, não decisão de relance — deveria estar recolhida"
    ).toBe(false);

    await painel.getByTestId("painel-acompanhamento-v2-alternar").click();

    await expect
      .poll(async () => (await painel.innerText()).toUpperCase().includes("VIA AÉREA"), {
        timeout: 5_000,
        message: "abrir a faixa deveria revelar o restante",
      })
      .toBe(true);
  });

  test("no celular a ação continua acima da dobra", async ({ page }) => {
    // ── A lacuna que deixou o defeito passar ──────────────────────────────────
    //
    // O teste de dobra ao lado roda no viewport padrão do Playwright, que é de
    // desktop. Nele a ação sobra espaço e o assert passa mesmo com o painel
    // alto. O usuário viu o problema no celular, onde a mesma altura de painel
    // é uma fração muito maior da tela.
    //
    // Aqui o viewport é de celular e o limite é mais duro: a ação tem de começar
    // na metade de cima.
    await page.setViewportSize({ width: 390, height: 844 });
    await abrirPcr(page, true);

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
      `no celular a ação começa em ${medida.topo}px de ${medida.janela}px — o painel voltou a empurrar a área principal para baixo`
    ).toBeLessThan(medida.janela * 0.5);
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
