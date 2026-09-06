import { expect, test } from "@playwright/test";

import { abrirModulo } from "./helpers";

/**
 * O QUE SE TOCA PARECE QUE SE TOCA — ⛔ e o "Voltar" volta UM PASSO.
 *
 * ── ⚠️⚠️ POR QUE ESTE ARQUIVO EXISTE ───────────────────────────────────────
 *
 * ⛔ O autor relatou **seis vezes** que os controles do módulo *"parecem texto
 * ⛔ e ⛔ não botões"*, ⛔ e nas cinco primeiras eu corrigi ⛔ só o que aparecia na
 * captura. ⚠️ `prova-avc-afordancia.cjs` varre o **código**; ⛔ este arquivo
 * mede o que o navegador **desenhou** — ⛔ que é onde o defeito morava: a
 * moldura existia no arquivo ⛔ e media 1,2:1 na tela.
 *
 * ⚠️ ⛔ E ele cobre a segunda queixa da mesma mensagem: *"quando clico nos
 * botões de estabilização ⛔ e depois tento voltar, volta para a página onde tem
 * os módulos"*.
 *
 * NÃO PROMETE: ⛔ nada de clínica. ⛔ Nenhum corte, ⛔ nenhuma dose, ⛔ nenhuma
 *   elegibilidade — isso é das provas de superfície.
 */

/** ⚠️ Um alvo tem **corpo** ⛔ ou **borda**. ⛔ Sem nenhum dos dois, é parágrafo. */
async function temMolduraDeAlvo(loc: import("@playwright/test").Locator) {
  return loc.evaluate((el) => {
    const s = getComputedStyle(el);
    const fundo = s.backgroundColor;
    const transparente =
      fundo === "transparent" || /rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(fundo);
    const borda = parseFloat(s.borderTopWidth) + parseFloat(s.borderLeftWidth);
    return { transparente, borda, fundo, altura: el.getBoundingClientRect().height };
  });
}

test.describe("AVC — afordância e navegação", () => {
  test("o relógio do topo é um BOTÃO cheio, ⛔ e ⛔ não duas palavras soltas", async ({ page }) => {
    await abrirModulo(page, "avc");
    const relogio = page.getByTestId("avc-relogio-do-topo");
    await expect(relogio).toBeVisible();

    const m = await temMolduraDeAlvo(relogio);
    expect(m.transparente, `⛔ sem preenchimento: ${m.fundo}`).toBe(false);
    /**
     * ⚠️ *"tem que ser maior ⛔ e mais destacado"* — autor, 2026-09-06. ⛔ Em
     * 44 px o rótulo quebrava em três linhas espremidas de 11 px.
     */
    expect(m.altura, "⛔ o botão que pede a última vez bem ⛔ não pode ser miúdo").toBeGreaterThanOrEqual(50);
  });

  test("⛔ NENHUMA linha de relógio oferece a ação como texto solto", async ({ page }) => {
    await abrirModulo(page, "avc");

    const valores = page.locator('[data-testid^="avc-hora-valor-"]');
    const quantos = await valores.count();
    expect(quantos, "⛔ sem relógios na tela, este teste passaria por vacuidade").toBeGreaterThan(2);

    for (let i = 0; i < quantos; i++) {
      const alvo = valores.nth(i).locator("xpath=..");
      const m = await temMolduraDeAlvo(alvo);
      const id = await valores.nth(i).getAttribute("data-testid");
      expect(m.transparente, `⛔ ${id} ⛔ sem preenchimento — foi exatamente a queixa`).toBe(false);
      expect(m.borda, `⛔ ${id} ⛔ sem borda`).toBeGreaterThan(0);
    }
  });

  test("⛔ NENHUM rótulo clínico chega à tela CORTADO", async ({ page }) => {
    await abrirModulo(page, "avc");

    /**
     * ⚠️⚠️ ⛔ ESTA É A ARMADILHA DA AFORDÂNCIA, ⛔ e eu caí nela **duas vezes**
     * hoje: dar corpo ⛔ e borda ao botão consome largura, ⛔ e o que cede é o
     * **texto ao lado**.
     *
     * ⛔ Aconteceu com o nome do marco (*"Chegada ao pronto-…"*) ⛔ e com o
     * rótulo da opção (*"Informado pelo paciente ou f…"*). ⚠️ ⛔ Nos dois casos
     * o texto cortado **é a pergunta** — ⛔ e pergunta cortada ⛔ não é
     * respondível. ⛔ Quem cede é o layout, ⛔ e ⛔ nunca o nome clínico.
     */
    const cortados = await page.evaluate(() => {
      /**
       * ⚠️⚠️ ⛔ MEDIR CORTE DE `numberOfLines` ⛔ NÃO É COMPARAR `scrollWidth`.
       *
       * ⛔ Duas versões desta trava passaram **verdes sobre o defeito real**:
       * `numberOfLines` no react-native-web vira `-webkit-line-clamp` num
       * `-webkit-box`, ⛔ e ali ⛔ nem `scrollWidth` ⛔ nem `scrollHeight`
       * denunciam o corte — a caixa clampada **já é** do tamanho do conteúdo
       * que ela mostra.
       *
       * ⚠️ O que funciona é medir **o mesmo texto ⛔ sem a trava**, na **mesma
       * largura**: se ⛔ ele precisa de mais altura do que a caixa tem, ⛔ o que
       * está na tela está cortado.
       */
      function estaCortado(el: HTMLElement): boolean {
        const cs = getComputedStyle(el);
        const clampado = cs.webkitLineClamp !== "none" || cs.textOverflow === "ellipsis";
        if (!clampado) return false;

        const sonda = el.cloneNode(true) as HTMLElement;
        sonda.style.position = "absolute";
        sonda.style.visibility = "hidden";
        sonda.style.pointerEvents = "none";
        sonda.style.width = `${el.clientWidth}px`;
        sonda.style.maxWidth = `${el.clientWidth}px`;
        sonda.style.height = "auto";
        sonda.style.maxHeight = "none";
        sonda.style.overflow = "visible";
        sonda.style.display = "block";
        sonda.style.webkitLineClamp = "none";
        sonda.style.textOverflow = "clip";
        sonda.style.whiteSpace = "normal";
        document.body.appendChild(sonda);
        const inteiro = sonda.getBoundingClientRect().height;
        sonda.remove();

        /** ⚠️ Meia linha de folga — ⛔ subpixel ⛔ não é corte. */
        const linha = parseFloat(cs.lineHeight) || 16;
        return inteiro > el.getBoundingClientRect().height + linha / 2;
      }

      const alvos = [
        ...document.querySelectorAll('[data-testid^="avc-hora-hora_"]'),
        ...document.querySelectorAll('[data-testid^="avc-opcao-"]'),
      ];
      const fora: string[] = [];
      for (const alvo of alvos) {
        for (const t of alvo.querySelectorAll("div, span")) {
          const el = t as HTMLElement;
          if (el.children.length > 0 || !el.textContent?.trim()) continue;
          if (estaCortado(el)) fora.push(el.textContent.trim());
        }
      }
      return fora;
    });

    expect(cortados, `⛔ rótulo(s) cortado(s) na tela: ${cortados.join(" | ")}`).toEqual([]);
  });

  test("arrastar a barra da pressão GRAVA a medida", async ({ page }) => {
    await abrirModulo(page, "avc");

    const caixa = page.getByTestId("avc-num-caixa-pas");
    await caixa.scrollIntoViewIfNeeded();
    /** ⚠️ ⛔ Intocado é **⛔ não informado** — ⛔ e ⛔ nunca o piso da faixa (§0.2). */
    await expect(caixa).toHaveValue("");

    const barra = page.getByTestId("avc-num-barra-pas");
    await expect(barra).toBeVisible();
    const cx = await barra.boundingBox();
    if (!cx) throw new Error("⛔ a barra ⛔ não tem caixa — ⛔ ela ⛔ não foi desenhada");

    await page.mouse.move(cx.x + 6, cx.y + cx.height / 2);
    await page.mouse.down();
    await page.mouse.move(cx.x + cx.width * 0.55, cx.y + cx.height / 2, { steps: 12 });
    await page.mouse.up();

    const valor = await caixa.inputValue();
    expect(valor, "⛔ soltar a barra tem de deixar um número na caixa").not.toBe("");
    /**
     * ⚠️ Meio da faixa 40–300 ≈ 180. ⛔ A margem é larga de propósito: o que se
     * mede aqui é *"o gesto virou medida"*, ⛔ e ⛔ não a precisão do arrasto.
     */
    expect(Number(valor)).toBeGreaterThan(100);
    expect(Number(valor)).toBeLessThanOrEqual(300);
  });

  test('"Voltar" desfaz UM passo dentro do módulo, ⛔ e ⛔ não sai dele', async ({ page }) => {
    await abrirModulo(page, "avc");
    await expect(page.getByTestId("avc-ameacas-imediatas")).toBeVisible();

    /** ⚠️ O gesto que o autor descreveu: tocar no card da imagem ⛔ e voltar. */
    await page.getByTestId("avc-prioridade-imagem-registrar").click();
    await expect(page.getByTestId("avc-superficie-imagem")).toBeVisible();

    await page.getByTestId("avc-voltar").click();

    /**
     * ⚠️⚠️ ⛔ **ELE VOLTA PARA ESTABILIZAR**, ⛔ e ⛔ não para a lista de módulos.
     *
     * ⛔ O módulo inteiro é **uma** rota: ⛔ sem pilha, *"Voltar"* ⛔ só sabia
     * sair — ⛔ e quem tocava num eixo ⛔ e queria desfazer o passo perdia o
     * atendimento aberto.
     */
    await expect(page.getByTestId("avc-ameacas-imediatas")).toBeVisible();
    expect(page.url(), "⛔ o atendimento ⛔ não pode ter sido fechado").toContain("/modulos/avc");
  });

  test("a imagem se SOLICITA antes de existir, ⛔ e pedir ⛔ não é ter feito", async ({ page }) => {
    await abrirModulo(page, "avc");

    const acao = page.getByTestId("avc-prioridade-imagem-acao");
    await expect(acao).toContainText("Solicitar");

    await acao.click();
    /** ⚠️ ⛔ Ela leva ao campo do PEDIDO — ⛔ e ⛔ não a um exame que ⛔ não existe. */
    await expect(page.getByTestId("avc-campo-hora_solicitacao_imagem")).toBeVisible();

    /**
     * ⚠️⚠️ ⛔ E A TELA CONTINUA DIZENDO QUE ⛔ NENHUM EXAME FOI REGISTRADO —
     * **E-23**. ⛔ Se o pedido virasse instância de estudo, aqui apareceria
     * *"Tomografia registrada, resultado ⛔ ainda ⛔ não informado"* sobre um
     * exame que ⛔ ninguém fez.
     */
    await expect(page.getByTestId("avc-estudos-vazio")).toBeVisible();
  });
});
