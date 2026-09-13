import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * PROCEDÊNCIA FORA DO CARD CLÍNICO (autor, 2026-09-13). Metadado de auditoria —
 * "repositório", "spec §", "transcrito", "D-PEND", "a confirmar" — ⛔ é orientação:
 * no card é ruído que reduz a confiança. Ele mora ⛔ só no bloco de ajuda (ⓘ).
 *
 * UNIVERSO: todo texto VISÍVEL do módulo AVC com os ⓘ fechados, em quatro cenários —
 * (1) o portão de população pendente; (2) cada superfície com aba, com blocos
 * recolhíveis e eixos abertos; (3) suspeita clínica de HSA + tenecteplase 70 kg na
 * Reperfusão; (4) alteplase 70 kg na Reperfusão. Um texto proibido só passa se estiver
 * dentro de um bloco de ajuda aberto (`avc-info-texto-*`, `avc-detalhe-*`).
 */

const PROIBIDAS = /repositório|spec §|transcrit|D-PEND|a confirmar/i;

async function proibidasVisiveis(page: Page, onde: string): Promise<string[]> {
  const achados = await page.evaluate((fonte) => {
    const re = new RegExp(fonte, "i");
    const out: string[] = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = w.nextNode())) {
      const t = (n.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!t || !re.test(t)) continue;
      const el = n.parentElement;
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.closest('[data-testid^="avc-info-texto-"], [data-testid^="avc-detalhe-"]')) continue;
      out.push(t.slice(0, 140));
    }
    return out;
  }, PROIBIDAS.source);
  return [...new Set(achados)].map((t) => `${onde}: «${t}»`);
}

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"], [data-testid^="avc-coleta-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

async function abrir(page: Page) {
  await fixarIdioma(page, "pt-BR");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/modulos/avc");
}

async function reperfusaoCom(page: Page, agente: "Tenecteplase" | "Alteplase", hsa: boolean) {
  await abrir(page);
  await responderPopulacaoAdulta(page);
  await page.getByTestId("avc-aba-paciente").click();
  await page.getByTestId("avc-num-caixa-peso").fill("70");
  await page.getByTestId("avc-num-caixa-peso").blur();
  await page.getByTestId("avc-opcao-peso_origem-Estimado pela equipe").click();
  if (hsa) {
    await page.getByTestId("avc-aba-imagem").click();
    await abrirTudo(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
  }
  await page.getByTestId("avc-aba-reperfusao").click();
  await page.getByTestId(`avc-f-agente-${agente}`).click();
  await abrirTudo(page);
}

test.describe("AVC · procedência ⛔ renderizada fora do bloco de ajuda", () => {
  test("1 · portão de população pendente", async ({ page }) => {
    await abrir(page);
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible();
    const f = await proibidasVisiveis(page, "portão");
    expect(f, f.join("\n")).toEqual([]);
  });

  test("2 · cada superfície com aba, blocos abertos", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    const falhas: string[] = [];
    for (const aba of ["paciente", "estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"]) {
      await page.getByTestId(`avc-aba-${aba}`).click();
      if (aba === "estabilizacao") await abrirEixosDaEstabilizacao(page);
      await abrirTudo(page);
      falhas.push(...(await proibidasVisiveis(page, aba)));
    }
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  test("3 · suspeita de HSA + tenecteplase 70 kg na Reperfusão", async ({ page }) => {
    await reperfusaoCom(page, "Tenecteplase", true);
    const f = await proibidasVisiveis(page, "reperfusão HSA+TNK");
    expect(f, f.join("\n")).toEqual([]);
  });

  test("4 · alteplase 70 kg na Reperfusão", async ({ page }) => {
    await reperfusaoCom(page, "Alteplase", false);
    const f = await proibidasVisiveis(page, "reperfusão alteplase");
    expect(f, f.join("\n")).toEqual([]);
  });
});
