import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * LIMPEZA VISUAL — pedido do autor, 2026-09-13. ⛔ Nenhuma regra clínica muda.
 *
 * Medido antes, a 375 px (revisão visual da mesma data):
 *   · PA alta: a frase da recomendação aparecia no aviso "Atenção" das outras
 *     superfícies ⛔ e em "Corrigir agora"; o rodapé repetia a resolução longa.
 *   · Respiração: "O₂ suplementar — meta SpO₂ acima de 94%" no card, de novo no
 *     bloco "Atenção", ⛔ e a mesma conduta, com outras palavras, no rodapé.
 *   · Nova aferição: com bloqueio de PA, ⛔ só o gesto de dentro do tratamento
 *     aparece; sem bloqueio, ⛔ só o do topo do grupo. ⛔ Nenhum botão sai: as
 *     travas abaixo fixam os dois caminhos.
 */

async function abrirEstabilizacao(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-estabilizacao").click();
  await abrirEixosDaEstabilizacao(page);
}

async function medir(page: Page, campo: string, valor: string) {
  const caixa = page.getByTestId(`avc-num-caixa-${campo}`);
  await caixa.fill(valor);
  await caixa.blur();
}

const FRASE_DA_PA = "Recomendação: controlar a pressão arterial antes de iniciar a trombólise";

test.describe("AVC · limpeza visual (2026-09-13)", () => {
  test("PA alta: UMA recomendação completa, aviso e rodapé só com estado curto, UM gesto de nova aferição", async ({ page }) => {
    await abrirEstabilizacao(page);
    await medir(page, "pas", "198");
    await medir(page, "pad", "112");

    /** Uma recomendação terapêutica completa, ⛔ e só uma. */
    await expect(page.locator('[data-testid$="terapeutica-pressao"]')).toHaveCount(1);
    await expect(page.getByText(FRASE_DA_PA)).toHaveCount(1);

    /** Rodapé: pendências curtas de estado. */
    const rodape = page.getByTestId("avc-pendencia-pressao_acima_da_meta");
    await expect(rodape).toContainText("PA ainda acima da meta");
    await expect(rodape).toContainText("Nova aferição pendente");
    await expect(rodape, "o rodapé repete a resolução longa").not.toContainText("Uma nova aferição de pressão arterial");

    /** Um gesto de nova aferição, dentro do tratamento, ⛔ acessível. */
    const gesto = page.getByTestId("avc-a-nova-medida-pressao_acima_da_meta");
    await expect(gesto).toBeVisible();
    await expect(page.getByRole("button", { name: /nova aferição de pressão arterial/i })).toHaveCount(1);
    await expect(page.getByTestId("avc-nova-medida-pa")).toHaveCount(0);

    /** Noutra superfície, o aviso "Atenção" diz o estado ⛔ e leva ao tratamento — ⛔ sem repetir a recomendação. */
    await page.getByTestId("avc-aba-neurologico").click();
    const aviso = page.getByTestId("avc-cockpit-bloqueio-pressao_acima_da_meta");
    await expect(aviso).toContainText("PA acima da meta");
    await expect(aviso, "o aviso repete a frase da recomendação").not.toContainText(FRASE_DA_PA);
    await expect(page.getByTestId("avc-cockpit-bloqueio-acao-pressao_acima_da_meta")).toBeVisible();
  });

  test("Respiração: achado e conduta iguais aparecem UMA vez no card, ⛔ sem eco no bloco Atenção nem no rodapé", async ({ page }) => {
    await abrirEstabilizacao(page);
    await page.getByTestId("avc-opcao-hipoxia-sim").click();
    await medir(page, "spo2", "88");

    const achado = "O₂ suplementar — meta SpO₂ acima de 94%";
    await expect(page.getByTestId("avc-ameaca-respiracao")).toContainText(achado);
    await expect(page.getByTestId("avc-ameaca-conduta-respiracao"), "card compacto: sem conduta repetida").toHaveCount(0);

    const atencao = page.getByTestId("avc-bloco-atencao");
    await expect(atencao, "o bloco Atenção repete o card").not.toContainText(achado);
    await expect(atencao, "controle: fato distinto continua").toContainText("SpO₂ abaixo da meta de 94%");

    const rodape = page.getByTestId("avc-pendencia-respiracao");
    await expect(rodape).toContainText("Respiração");
    await expect(rodape, "o rodapé repete a conduta com outras palavras").not.toContainText("Oxigênio suplementar recomendado, com meta de SpO₂ maior que 94%");
  });

  test("Nova aferição sem bloqueio: o gesto do topo do grupo é a entrada, ⛔ acessível", async ({ page }) => {
    await abrirEstabilizacao(page);
    await medir(page, "pas", "150");
    await medir(page, "pad", "90");
    await expect(page.getByTestId("avc-a-corrigir-agora")).toHaveCount(0);
    const gesto = page.getByTestId("avc-nova-medida-pa");
    await expect(gesto).toBeVisible();
    await expect(gesto).toHaveAttribute("role", "button");
  });
});

/**
 * "LIMPAR" — segurança de interface (autor, 2026-09-13). Na revisão a 375 px, o
 * "Limpar" surgia ao marcar "18 anos ou mais", empurrava a linha de baixo, e um
 * toque na posição de "Não gestante e não puérpera" caiu fora da opção.
 */
test.describe("AVC · «Limpar» não desloca a tela nem se confunde com opção", () => {
  test("marcar uma resposta ⛔ move a pergunta de baixo — o toque na posição vista antes acerta a opção", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/modulos/avc");
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible({ timeout: 30_000 });

    const naoGestante = page.getByTestId("avc-opcao-gestacao_puerperio-Não gestante e não puérpera");
    const antes = await naoGestante.boundingBox();
    const adulto = await page.getByTestId("avc-opcao-faixa_etaria-18 anos ou mais").boundingBox();
    expect(antes && adulto).toBeTruthy();
    await page.mouse.click(adulto!.x + adulto!.width / 2, adulto!.y + adulto!.height / 2);
    await expect(page.getByTestId("avc-opcao-faixa_etaria-18 anos ou mais")).toHaveAttribute("aria-checked", "true");

    const depois = await naoGestante.boundingBox();
    expect(depois!.y, "a pergunta de baixo mudou de lugar quando «Limpar» apareceu").toBe(antes!.y);

    /** O toque do médico, na posição que ele viu antes. */
    await page.mouse.click(antes!.x + antes!.width / 2, antes!.y + antes!.height / 2);
    await expect(naoGestante, "o toque caiu fora da opção").toHaveAttribute("aria-checked", "true");
  });

  test("«Limpar» é ação secundária (papel e visual próprios) ⛔ e o toque nele ⛔ marca opção", async ({ page }) => {
    await fixarIdioma(page, "pt-BR");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/modulos/avc");
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);

    const sim = page.getByTestId("avc-opcao-hipoxia-sim");
    const proximo = page.getByTestId("avc-num-caixa-spo2");
    /**
     * ⚠️ Instrumento (2026-09-13): o toque pode ROLAR a tela, e a posição absoluta na
     * janela muda sem que o layout mude. O que se mede é a DISTÂNCIA entre a opção e a
     * linha de baixo — ela só muda se algo aparecer entre as duas.
     */
    await sim.scrollIntoViewIfNeeded();
    const distancia = async () => (await proximo.boundingBox())!.y - (await sim.boundingBox())!.y;
    const dAntes = await distancia();
    await sim.click();
    await expect(sim).toHaveAttribute("aria-checked", "true");
    expect(await distancia(), "a linha de baixo mudou de lugar").toBe(dAntes);

    const limpar = page.getByTestId("avc-limpar-hipoxia");
    await expect(limpar).toBeVisible();
    await expect(limpar).toHaveAttribute("role", "button");
    const caixaLimpar = (await limpar.boundingBox())!;
    /** As opções que ESTÃO na tela (valor gravado: sim · nao · nao_sei) — ⛔ não nomes supostos. */
    const opcoes = page.locator('[data-testid^="avc-opcao-hipoxia-"]');
    await expect(opcoes, "controle: as três opções da pergunta").toHaveCount(3);
    const ids = await opcoes.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid") as string));
    /**
     * Visual: corpo ⛔ e borda (afordância), mas ⛔ igual a ⛔ nenhuma opção — nem à
     * neutra ("Incerto"), que é a mais parecida. Compara fundo, raio ⛔ e tamanho do texto.
     */
    const estilo = async (sel: typeof limpar) => sel.evaluate((el) => {
      const s = getComputedStyle(el);
      const texto = el.querySelector("div,span") ?? el;
      return { corpo: s.backgroundColor, borda: s.borderTopWidth, raio: s.borderTopLeftRadius, fonte: getComputedStyle(texto).fontSize };
    });
    const eLimpar = await estilo(limpar);
    expect(eLimpar.corpo, "«Limpar» sem corpo").not.toBe("rgba(0, 0, 0, 0)");
    expect(eLimpar.borda, "«Limpar» sem borda").not.toBe("0px");
    for (const id of ids) {
      const eOp = await estilo(page.getByTestId(id));
      expect(`${eLimpar.corpo}|${eLimpar.raio}|${eLimpar.fonte}`, `«Limpar» com o visual da opção ${id}`).not.toBe(`${eOp.corpo}|${eOp.raio}|${eOp.fonte}`);
      expect(eLimpar.raio === eOp.raio || eLimpar.corpo === eOp.corpo, `«Limpar» parecido demais com ${id}: ${JSON.stringify([eLimpar, eOp])}`).toBe(false);
    }
    for (const id of ids) {
      const c = (await page.getByTestId(id).boundingBox())!;
      const sobrepoe = caixaLimpar.x < c.x + c.width && c.x < caixaLimpar.x + caixaLimpar.width && caixaLimpar.y < c.y + c.height && c.y < caixaLimpar.y + caixaLimpar.height;
      expect(sobrepoe, `«Limpar» sobrepõe a opção ${id}`).toBe(false);
    }

    await page.mouse.click(caixaLimpar.x + caixaLimpar.width / 2, caixaLimpar.y + caixaLimpar.height / 2);
    for (const id of ids) {
      await expect(page.getByTestId(id), `o toque em «Limpar» marcou ${id}`).toHaveAttribute("aria-checked", "false");
    }
    expect(await distancia(), "a linha de baixo mudou de lugar ao limpar").toBe(dAntes);
  });
});

/**
 * UMA VEZ SÓ — a mesma frase ⛔ aparece duas vezes na tela. Universo: toda frase
 * visível de 25+ caracteres na Estabilização (cockpit e superfície), nos cenários
 * base, PA alta e hipóxia. Fora do universo, com motivo: a lista de agentes do
 * tratamento (cada agente repete a própria procedência) e rótulos de controles
 * (botões, opções, caixas de seleção), que são nomes, ⛔ não frases.
 */
async function frasesRepetidas(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const raizes = ["avc-ameacas-imediatas", "avc-superficie-a-conteudo"].map((id) => document.querySelector(`[data-testid="${id}"]`)).filter(Boolean) as Element[];
    const conta = new Map<string, number>();
    for (const raiz of raizes) {
      const caminhar = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      let n: Node | null;
      while ((n = caminhar.nextNode())) {
        const el = n.parentElement;
        if (!el || el.closest('[data-testid$="terapeutica-pressao"]') || el.closest('[role="button"],[role="radio"],[role="checkbox"],input')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const frase = (n.textContent ?? "").replace(/\s+/g, " ").trim();
        if (frase.length < 25) continue;
        conta.set(frase, (conta.get(frase) ?? 0) + 1);
      }
    }
    return [...conta.entries()].filter(([, v]) => v > 1).map(([k, v]) => `${v}× ${k}`);
  });
}

test.describe("AVC · uma frase, uma vez (Estabilização)", () => {
  for (const cenario of ["base", "pa_alta", "hipoxia"] as const) {
    test(`nenhuma frase se repete · cenário ${cenario}`, async ({ page }) => {
      await abrirEstabilizacao(page);
      if (cenario === "pa_alta") { await medir(page, "pas", "198"); await medir(page, "pad", "112"); }
      if (cenario === "hipoxia") { await page.getByTestId("avc-opcao-hipoxia-sim").click(); await medir(page, "spo2", "88"); }
      await expect(page.getByTestId("avc-superficie-a-conteudo")).toBeVisible();
      expect(await frasesRepetidas(page), "frase repetida na tela").toEqual([]);
    });
  }
});
