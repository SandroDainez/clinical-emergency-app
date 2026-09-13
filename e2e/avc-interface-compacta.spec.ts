import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * ACHADOS DE INTERFACE (autor, 2026-09-13), sem decisão clínica. Medidos a 375 px
 * nas capturas da D-PEND-21:
 *   1. o cabeçalho ocupava ~150 px — "AVC isquêmico agudo" em três linhas de título
 *      grande (spec p.418: "Cabeçalho | Paciente, relógio clínico, dados críticos e
 *      suporte atual; detalhes recolhidos"; p.462: "Reduzir cabeçalho");
 *   2. ponto vermelho em "Atendimento aberto" — vermelho é ameaça e erro (spec
 *      p.462: "evitar vermelho para simples atividade");
 *   3. a barra de fases cortava a quinta aba ("Rep…") sem indicação visível de que
 *      há mais fases;
 *   4. SpO₂ vazio com "+10" habilitado e "−10" apagado.
 *
 * UNIVERSO: o cabeçalho e a barra de fases do módulo AVC, e todo campo numérico com
 * degraus visível na Estabilização aberta.
 */

/** `critical` e `criticalFill` dos dois temas (`design-system/tokens.ts`). */
const VERMELHOS = new Set(["rgb(179, 38, 30)", "rgb(216, 34, 34)", "rgb(255, 107, 117)"]);

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-estabilizacao").click();
}

test.describe("AVC · interface compacta (achados de 2026-09-13)", () => {
  test("1 · o título do cabeçalho cabe em UMA linha, ⛔ sem reticências, e o cabeçalho encolhe", async ({ page }) => {
    await abrir(page);
    const titulo = page.getByText("AVC isquêmico agudo", { exact: true }).first();
    await expect(titulo).toBeVisible();
    const m = await titulo.evaluate((el) => {
      const s = getComputedStyle(el);
      const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.25;
      const r = el.getBoundingClientRect();
      return { linhas: Math.round(r.height / lh), cortado: el.scrollWidth > el.clientWidth + 1, fonte: parseFloat(s.fontSize) };
    });
    expect(m.linhas, `título em ${m.linhas} linha(s)`).toBe(1);
    expect(m.cortado, "o nome clínico foi cortado").toBe(false);
    /**
     * O BLOCO inteiro do cabeçalho — de cima do «Voltar»/relógio até o fim do título.
     * Antes: ~150 px (título em três linhas). Critério de interface desta rodada: ≤ 96 px.
     */
    const bloco = await page.evaluate(() => {
      const els = ['[data-testid="avc-voltar"]', '[data-testid="avc-relogio-do-topo"]']
        .map((s) => document.querySelector(s))
        .filter(Boolean) as Element[];
      const titulo = Array.from(document.querySelectorAll("div,span")).find((n) => n.children.length === 0 && n.textContent === "AVC isquêmico agudo");
      if (titulo) els.push(titulo);
      const rs = els.map((e) => e.getBoundingClientRect());
      return { altura: Math.round(Math.max(...rs.map((r) => r.bottom)) - Math.min(...rs.map((r) => r.top))), n: els.length, titulo: titulo !== undefined };
    });
    /** O relógio do topo ⛔ existe em toda superfície (na Estabilização ele ⛔ aparece): voltar e título são obrigatórios. */
    expect(bloco.n, "controle: voltar e título medidos").toBeGreaterThanOrEqual(2);
    expect(bloco.titulo, "controle: o título entrou na medida").toBe(true);
    expect(bloco.altura, `bloco do cabeçalho com ${bloco.altura} px`).toBeLessThanOrEqual(96);
  });

  test("2 · «Atendimento aberto» ⛔ não usa vermelho (texto nem ponto)", async ({ page }) => {
    await abrir(page);
    const marcador = page.getByText(/^Atendimento aberto há/).first();
    await expect(marcador).toBeVisible();
    const cores = await marcador.evaluate((el) => {
      const ponto = el.previousElementSibling as HTMLElement | null;
      return { texto: getComputedStyle(el).color, ponto: ponto ? getComputedStyle(ponto).backgroundColor : "" };
    });
    expect(VERMELHOS.has(cores.texto), `texto em ${cores.texto}`).toBe(false);
    expect(VERMELHOS.has(cores.ponto), `ponto em ${cores.ponto}`).toBe(false);
  });

  test("3 · fase fora da tela tem indicação VISÍVEL e tocável, ⛔ e tocar leva até ela", async ({ page }) => {
    await abrir(page);
    const vw = 375;
    const fora = await page.evaluate((largura) =>
      Array.from(document.querySelectorAll('[data-testid^="avc-aba-"]'))
        .filter((el) => /^avc-aba-[a-z_]+$/.test(el.getAttribute("data-testid") ?? ""))
        .filter((el) => el.getBoundingClientRect().right > largura + 1)
        .map((el) => el.getAttribute("data-testid") as string), vw);
    expect(fora.length, "controle: a 375 px há fase fora da tela").toBeGreaterThan(0);

    /** ⛔ O botão ‹ ⛔ cobre a aba ATIVA (defeito visto na captura de 2026-09-13: "stabilizar"). */
    const menos = page.getByTestId("avc-barra-mais-esquerda");
    if ((await menos.count()) > 0 && (await menos.isVisible())) {
      const bMenos = (await menos.boundingBox())!;
      const bAtiva = (await page.getByTestId("avc-aba-estabilizacao").boundingBox())!;
      expect(bAtiva.x, `a aba ativa começa em ${bAtiva.x} px, sob o botão ‹ que termina em ${bMenos.x + bMenos.width} px`)
        .toBeGreaterThanOrEqual(bMenos.x + bMenos.width);
    }

    const mais = page.getByTestId("avc-barra-mais-direita");
    await expect(mais, "⛔ nenhuma indicação tocável de que há mais fases à direita").toBeVisible();
    await expect(mais).toHaveAttribute("role", "button");
    const caixa = (await mais.boundingBox())!;
    expect(caixa.width, "indicação estreita demais para o polegar").toBeGreaterThanOrEqual(32);
    expect(caixa.height).toBeGreaterThanOrEqual(32);

    const ultima = fora[fora.length - 1];
    for (let i = 0; i < 6; i++) {
      const r = await page.getByTestId(ultima).evaluate((el) => el.getBoundingClientRect().right);
      if (r <= vw) break;
      if ((await mais.count()) === 0 || !(await mais.isVisible())) break;
      await mais.click();
    }
    const r = await page.getByTestId(ultima).evaluate((el) => {
      const b = el.getBoundingClientRect();
      return { left: b.left, right: b.right };
    });
    expect(r.left, `${ultima} continua fora (left ${r.left})`).toBeGreaterThanOrEqual(0);
    expect(r.right, `${ultima} continua fora (right ${r.right})`).toBeLessThanOrEqual(vw);
  });

  test("4 · campo numérico vazio: −10 e +10 no MESMO estado (inertes); com valor, ambos movem", async ({ page }) => {
    await abrir(page);
    await abrirEixosDaEstabilizacao(page);
    const menos = page.getByTestId("avc-degrau-spo2-menos-10");
    const mais = page.getByTestId("avc-degrau-spo2-mais-10");
    await menos.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("avc-num-caixa-spo2")).toHaveValue("");
    const estado = async () => ({
      menos: await menos.isDisabled(),
      mais: await mais.isDisabled(),
      opMenos: await menos.evaluate((el) => getComputedStyle(el).opacity),
      opMais: await mais.evaluate((el) => getComputedStyle(el).opacity),
    });
    const vazio = await estado();
    expect(vazio.menos === vazio.mais && vazio.opMenos === vazio.opMais, `vazio: −10 ${JSON.stringify([vazio.menos, vazio.opMenos])} × +10 ${JSON.stringify([vazio.mais, vazio.opMais])}`).toBe(true);
    expect(vazio.mais, "vazio: +10 gravaria o piso da faixa como medida").toBe(true);
    await mais.click({ force: true });
    await expect(page.getByTestId("avc-num-caixa-spo2"), "⛔ o toque em +10 vazio gravou um número").toHaveValue("");

    const caixa = page.getByTestId("avc-num-caixa-spo2");
    await caixa.fill("88");
    await caixa.blur();
    await expect(mais).toBeEnabled();
    await expect(menos).toBeEnabled();
    await menos.click();
    await expect(caixa).toHaveValue("78");
  });
});
