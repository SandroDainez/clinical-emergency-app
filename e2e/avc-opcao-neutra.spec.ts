import { expect, test, type Page } from "@playwright/test";

import { abrirEixosDaEstabilizacao, fixarIdioma, responderPopulacaoAdulta } from "./helpers";

/**
 * D-PEND-21 (autor, 2026-09-13) — opção NÃO marcada é neutra (contorno, sem
 * preenchimento de cor semântica); cor só após marcação, sempre com ✓ e borda.
 *
 * UNIVERSO: toda pergunta cujas opções são SÓ sim · nao · nao_sei, visível em cada
 * superfície com aba (paciente, estabilização, neurológico, imagem, segurança,
 * reperfusão, destino), depois de abrir todo bloco recolhível
 * (`aria-expanded="false"`) e os eixos da Estabilização. Para cada uma: todas as
 * opções não marcadas são neutras; marcar Sim, depois Não, depois Incerto (com
 * «Limpar» entre elas) deixa a marcada com borda ≥ 2 px ⛔ e ✓ — ⛔ e só Sim/Não
 * ganham cor — ⛔ e as demais continuam neutras.
 * FORA DO UNIVERSO, com motivo: perguntas que só aparecem depois de outra resposta
 * (a varredura ⛔ responde nada além do portão de população) ⛔ e opções com rótulos
 * clínicos (⛔ não são Sim/Não/Incerto).
 */

/** successFill e criticalFill dos dois temas (`design-system/tokens.ts`). */
const VERDE = new Set(["rgb(21, 128, 61)", "rgb(18, 131, 63)"]);
const VERMELHO = new Set(["rgb(179, 38, 30)"]);
const ABAS = ["paciente", "estabilizacao", "neurologico", "imagem", "seguranca", "reperfusao", "destino"] as const;

type Leitura = { id: string; marcada: boolean; fundo: string; borda: number; texto: string; corDaBorda: string; fundoAtras: string };

async function ler(page: Page, id: string): Promise<Leitura> {
  return page.getByTestId(id).evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      id: el.getAttribute("data-testid") as string,
      marcada: el.getAttribute("aria-checked") === "true",
      fundo: s.backgroundColor,
      borda: parseFloat(s.borderTopWidth),
      texto: (el.textContent ?? "").trim(),
      corDaBorda: s.borderTopColor,
      /** O fundo real atrás da opção: o primeiro ancestral com cor opaca. */
      fundoAtras: (() => {
        let n = el.parentElement;
        while (n) {
          const c = getComputedStyle(n).backgroundColor;
          if (c && c !== "transparent" && !/rgba\(\s*0,\s*0,\s*0,\s*0\s*\)/.test(c)) return c;
          n = n.parentElement;
        }
        return getComputedStyle(document.body).backgroundColor;
      })(),
    };
  });
}

async function abrirTudo(page: Page) {
  for (let i = 0; i < 40; i++) {
    const fechado = page.locator('[data-testid^="avc-bloco-abrir-"][aria-expanded="false"], [data-testid^="avc-coleta-abrir-"][aria-expanded="false"]');
    if ((await fechado.count()) === 0) return;
    await fechado.first().click();
  }
}

/** Perguntas visíveis cujas opções são só sim · nao · nao_sei. */
async function perguntasSimNao(page: Page): Promise<{ campo: string; ids: string[] }[]> {
  return page.evaluate(() => {
    const grupos = new Map<string, { ids: string[]; puro: boolean }>();
    for (const el of Array.from(document.querySelectorAll('[data-testid^="avc-opcao-"]'))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      const id = el.getAttribute("data-testid") as string;
      const m = id.match(/^avc-opcao-(.+)-(sim|nao|nao_sei)$/);
      const campo = m ? m[1] : id.replace(/^avc-opcao-/, "").replace(/-[^-]*$/, "");
      const g = grupos.get(campo) ?? { ids: [], puro: true };
      g.ids.push(id);
      if (!m) g.puro = false;
      grupos.set(campo, g);
    }
    return [...grupos.entries()]
      .filter(([, g]) => g.puro && g.ids.some((i) => i.endsWith("-sim")) && g.ids.some((i) => i.endsWith("-nao")))
      .map(([campo, g]) => ({ campo, ids: g.ids }));
  });
}

/** WCAG: razão de contraste entre duas cores `rgb(…)`. */
function razao(a: string, b: string): number {
  const lum = (c: string) => {
    const [r, g, bl] = (c.match(/\d+(\.\d+)?/g) ?? ["0", "0", "0"]).slice(0, 3).map((v) => {
      const x = Number(v) / 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

function conferirNeutra(l: Leitura, falhas: string[], onde: string) {
  if (VERDE.has(l.fundo) || VERMELHO.has(l.fundo)) falhas.push(`${onde}: ${l.id} NÃO marcada com preenchimento semântico (${l.fundo})`);
  if (l.texto.startsWith("✓")) falhas.push(`${onde}: ${l.id} NÃO marcada exibe ✓`);
  if (l.borda < 1) falhas.push(`${onde}: ${l.id} NÃO marcada sem contorno`);
  /** AC-59: o contorno da neutra ≥ 3:1 contra o fundo real atrás dela. */
  const r = razao(l.corDaBorda, l.fundoAtras);
  if (r < 3) falhas.push(`${onde}: ${l.id} contorno ${l.corDaBorda} × fundo ${l.fundoAtras} = ${r.toFixed(2)}:1 (< 3)`);
}

function conferirMarcada(l: Leitura, falhas: string[], onde: string) {
  const valor = l.id.match(/-(sim|nao|nao_sei)$/)![1];
  if (!l.marcada) falhas.push(`${onde}: ${l.id} não ficou marcada`);
  if (!l.texto.startsWith("✓")) falhas.push(`${onde}: ${l.id} marcada sem ✓`);
  if (l.borda < 2) falhas.push(`${onde}: ${l.id} marcada com borda ${l.borda}px (< 2)`);
  if (valor === "sim" && !VERDE.has(l.fundo)) falhas.push(`${onde}: ${l.id} Sim marcado sem verde (${l.fundo})`);
  if (valor === "nao" && !VERMELHO.has(l.fundo)) falhas.push(`${onde}: ${l.id} Não marcado sem vermelho (${l.fundo})`);
  if (valor === "nao_sei" && (VERDE.has(l.fundo) || VERMELHO.has(l.fundo))) falhas.push(`${onde}: ${l.id} Incerto marcado com cor semântica (${l.fundo})`);
}

test.describe("AVC · D-PEND-21 · opção não marcada é neutra", () => {
  for (const aba of ABAS) {
    test(`superfície ${aba}: toda pergunta Sim/Não/Incerto`, async ({ page }) => {
      await fixarIdioma(page, "pt-BR");
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/modulos/avc");
      await responderPopulacaoAdulta(page);
      await page.getByTestId(`avc-aba-${aba}`).click();
      if (aba === "estabilizacao") await abrirEixosDaEstabilizacao(page);
      await abrirTudo(page);

      const perguntas = await perguntasSimNao(page);
      const falhas: string[] = [];
      let marcadasConferidas = 0;
      for (const { campo, ids } of perguntas) {
        const onde = `${aba}/${campo}`;
        const leituras = await Promise.all(ids.map((id) => ler(page, id)));
        for (const l of leituras) (l.marcada ? conferirMarcada : conferirNeutra)(l, falhas, onde);
        if (leituras.some((l) => l.marcada)) continue;

        for (const alvo of ids) {
          const opcao = page.getByTestId(alvo);
          if ((await opcao.count()) === 0) { falhas.push(`${onde}: ${alvo} sumiu durante a varredura`); break; }
          await opcao.scrollIntoViewIfNeeded();
          await opcao.click();
          const depois = await Promise.all(ids.map((id) => ler(page, id)));
          for (const l of depois) (l.id === alvo ? conferirMarcada : conferirNeutra)(l, falhas, `${onde} (marcou ${alvo.split("-").pop()})`);
          marcadasConferidas++;
          const limpar = page.getByTestId(`avc-limpar-${campo}`);
          if ((await limpar.count()) === 0) { falhas.push(`${onde}: sem «Limpar» depois de marcar`); break; }
          await limpar.click();
          /** ⚠️ D-PEND-26: resposta que sustenta retenção ⛔ ou bloqueio pede confirmação — ⛔ a varredura confirma. */
          const confirmar = page.getByTestId("avc-confirmar-limpar-sim");
          if (await confirmar.isVisible().catch(() => false)) await confirmar.click();
          await expect(opcao).toHaveAttribute("aria-checked", "false");
        }
      }
      console.log(`  · ${aba}: ${perguntas.length} pergunta(s) Sim/Não/Incerto · ${marcadasConferidas} marcação(ões) conferida(s)`);
      if (aba === "estabilizacao" || aba === "neurologico") {
        expect(perguntas.length, `controle: ${aba} tem perguntas Sim/Não/Incerto visíveis`).toBeGreaterThan(0);
      }
      expect(falhas, falhas.join("\n")).toEqual([]);
    });
  }
});
