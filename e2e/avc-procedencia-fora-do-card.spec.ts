import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";
import { SUPERFICIES, SEQUENCIA_OFICIAL } from "../avc/conteudo/superficies";

/**
 * PROCEDÊNCIA FORA DO CARD CLÍNICO (autor, 2026-09-13; ampliada na 16ª rodada). Metadado de
 * auditoria — "repositório", "spec §", "transcrito", "D-PEND", "a confirmar", "Fonte:",
 * "Conclusão:", "Fonte candidata", "§ a localizar", "slot" — ⛔ é orientação: no card é ruído
 * que reduz a confiança. Ele mora ⛔ só no bloco de ajuda (ⓘ).
 *
 * ⚠️ 16ª rodada (regressão das capturas da 15ª): o plano até 48 h ⛔ o caminho hemorrágico
 * nasceram fora desta trava, porque ela percorria UMA LISTA de abas. ⚠️ Agora ela percorre as
 * abas que a própria barra mostra, em vários estados do caso, ⛔ e cada superfície do registro
 * fora da barra é visitada por um gesto real (`visita("…")`).
 *
 * UNIVERSO: todo texto VISÍVEL do módulo AVC com os ⓘ fechados, nos cenários abaixo. Um texto
 * proibido só passa dentro de um bloco de ajuda aberto (`avc-info-texto-*`, `avc-detalhe-*`).
 */

const PROIBIDAS = /repositório|spec §|transcrit|D-PEND|a confirmar|\bFonte\s*:|Fonte candidata|Conclusão\s*:|a localizar|\bslot\b/i;

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

async function informarHora(page: Page, campo: string) {
  await page.getByTestId(`avc-hora-${campo}`).click();
  await page.getByTestId("avc-seletor-hora-m-menos").click();
  await page.getByTestId("avc-seletor-hora-confirmar").click();
}

/** ⚠️ Toda aba que a barra mostra AGORA — ⛔ lista fixa: a próxima superfície nova entra sozinha. */
async function varrerAbas(page: Page, cenario: string): Promise<string[]> {
  const ids = await page.locator('[data-testid^="avc-aba-"]').evaluateAll((els) =>
    els.map((el) => (el.getAttribute("data-testid") ?? "").replace("avc-aba-", "")));
  expect(ids.length, `${cenario}: ⛔ barra vazia`).toBeGreaterThan(0);
  const falhas: string[] = [];
  for (const aba of ids) {
    await page.getByTestId(`avc-aba-${aba}`).click();
    if (aba === "estabilizacao") await abrirEixosDaEstabilizacao(page);
    await abrirTudo(page);
    falhas.push(...(await proibidasVisiveis(page, `${cenario} · ${aba}`)));
  }
  return falhas;
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

async function tcComResultado(page: Page, resultado: string) {
  await page.getByTestId("avc-aba-imagem").click();
  await page.getByTestId("avc-novo-estudo").click();
  await page.getByTestId("avc-opcao-estudo_modalidade-Tomografia de crânio sem contraste").click();
  await informarHora(page, "estudo_hora");
  await page.getByTestId(`avc-opcao-estudo_resultado-${resultado}`).click();
}

test.describe("AVC · procedência ⛔ renderizada fora do bloco de ajuda", () => {
  test("1 · portão de população pendente", async ({ page }) => {
    await abrir(page);
    await expect(page.getByTestId("avc-portao-populacao")).toBeVisible();
    const f = await proibidasVisiveis(page, "portão");
    expect(f, f.join("\n")).toEqual([]);
  });

  test("2 · toda aba da barra, blocos abertos, caso vazio", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    const falhas = await varrerAbas(page, "vazio");
    /** ⚠️ visita("laboratorio") — painel dentro da Investigação, coberto pela varredura da aba. */
    await page.getByTestId("avc-aba-imagem").click();
    await expect(page.getByTestId("avc-superficie-laboratorio-conteudo")).toBeVisible();
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  test("9 · correção relevante (PA 198/112): a aba Correções entra na varredura", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-estabilizacao").click();
    await abrirEixosDaEstabilizacao(page);
    await page.getByTestId("avc-num-caixa-pas").fill("198");
    await page.getByTestId("avc-num-caixa-pad").fill("112");
    await page.getByTestId("avc-num-caixa-pad").blur();
    await expect(page.getByTestId("avc-aba-correcoes")).toBeVisible();
    const falhas = await varrerAbas(page, "correção relevante");
    /**
     * ⚠️ Visita à superfície Correções, medida (⛔ só marcada em comentário: a leitura de fonte da prova de
     * cobertura ignora comentários — ajuste de instrumento da 16ª rodada).
     */
    await page.getByTestId("avc-aba-correcoes").click();
    await expect(page.getByTestId("avc-superficie-correcoes")).toBeVisible();
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

  /* ── ⚠️ 16ª rodada · as telas das capturas da 15ª ─────────────────────── */

  test("5 · plano até 48 h · trombólise (toda aba)", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-nova-trombolise").click();
    await page.getByTestId("avc-opcao-ivt_estado-Realizada").click();
    await informarHora(page, "ivt_inicio");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-plano-48h")).toBeVisible();
    const falhas = await varrerAbas(page, "plano IVT");
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  test("6 · plano até 48 h · trombectomia ⛔ sem reperfusão (decisão global)", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-destino").click();
    await page.getByTestId("avc-plano-48h").scrollIntoViewIfNeeded();
    await informarHora(page, "evt_fim");
    await page.getByTestId("avc-aba-reperfusao").click();
    await page.getByTestId("avc-f-decisao-global").scrollIntoViewIfNeeded();
    await page.getByTestId("avc-f-decisao-global").click();
    await page.getByTestId("avc-f-decisao-global-motivo-Recusa do paciente ou família").click();
    await page.getByTestId("avc-f-decisao-global-agora").click();
    const falhas = await varrerAbas(page, "plano EVT + sem reperfusão");
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  test("7 · caminho hemorrágico: toda aba da barra ⛔ os catálogos HIC ⛔ HSA", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await tcComResultado(page, "Hemorragia intracraniana identificada");
    const falhas = await varrerAbas(page, "hemorrágico");
    await page.getByTestId("avc-aba-destino").click();
    await expect(page.getByTestId("avc-hem-caminho")).toBeVisible();
    /** ⚠️ visita("hic") — a superfície do catálogo, aberta pelo gesto da Imagem. */
    await page.getByTestId("avc-aba-imagem").click();
    await page.getByTestId("avc-destino-abrir-hemorragia_intracraniana").click();
    await expect(page.getByTestId("avc-superficie-hic")).toBeVisible();
    falhas.push(...(await proibidasVisiveis(page, "catálogo HIC")));
    expect(falhas, falhas.join("\n")).toEqual([]);
  });

  test("8 · suspeita de HSA: catálogo HSA ⛔ correções", async ({ page }) => {
    await abrir(page);
    await responderPopulacaoAdulta(page);
    await page.getByTestId("avc-aba-imagem").click();
    await abrirTudo(page);
    await page.getByTestId("avc-opcao-suspeita_hsa-sim").click();
    /** ⚠️ visita("hsa") */
    await page.getByTestId("avc-destino-abrir-suspeita_hsa").click();
    await expect(page.getByTestId("avc-superficie-hsa")).toBeVisible();
    const falhas = await proibidasVisiveis(page, "catálogo HSA");
    expect(falhas, falhas.join("\n")).toEqual([]);
  });
});

/** ⚠️ Referência tipada ao registro: a prova de módulo confere que cada superfície fora da barra tem `visita("…")`. */
void SUPERFICIES;
void SEQUENCIA_OFICIAL;
