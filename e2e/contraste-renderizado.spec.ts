import fs from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import { abrirModulo } from "./helpers";

/**
 * Contraste do que está NA TELA, não dos tokens.
 *
 * `npm run test:contraste` valida a paleta em abstrato. Este teste faz o que
 * aquele não consegue: percorre o texto renderizado, descobre o fundo real
 * (subindo a árvore até achar uma cor opaca) e mede a razão de verdade.
 *
 * Foi ele que encontrou 139 textos ilegíveis na reaplicação da paleta —
 * #334155 sobre superfície escura dá 1,60:1, praticamente invisível.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU A AMPLIAÇÃO (2026-08-16) ──────────────────────
 *
 * O usuário relatou que a barra lateral de Vasoativas estava "apagada". Medida
 * em produção: rótulos de 9 px em #aab6c6 sobre #1e6fd9 — 2,36:1, contra um
 * piso de 4,5. Estava no ar, e NENHUMA trava acusou.
 *
 * Nem `valida-contraste`, cujo universo é a paleta (ele aprovou as duas cores
 * separadamente, cada uma contra `bg` e `surface`; o par entre elas nunca foi
 * perguntado — R-66). Nem ESTE arquivo, que media a coisa certa, do jeito
 * certo, em SEIS módulos escolhidos à mão. `drogas-vasoativas` não era um
 * deles. `correcoes-eletroliticas` também não.
 *
 * ⚠️ UNIVERSO POR LISTA FIXA — R-59, quarta ocorrência da auditoria. O
 * instrumento estava correto e incompleto, e a incompletude era invisível
 * porque o verde tinha a mesma aparência.
 *
 * ── O UNIVERSO AGORA VEM DO QUE FOI PUBLICADO ───────────────────────────────
 *
 * A lista é lida de `dist/modulos/*.html` — as rotas que o build gerou. Módulo
 * novo entra sozinho, e não há lista para alguém esquecer de atualizar.
 *
 * ── POR QUE AVISA ANTES DE FALHAR ───────────────────────────────────────────
 *
 * O medidor tem falso-positivo conhecido (texto sobre gradiente, sobreposição
 * com opacidade, glifo colorido) e a dívida herdada é grande. Falhar de uma vez
 * travaria o build por causa de telas que já estavam assim antes de existir a
 * medição. Então: os módulos com dívida CONGELADA em `LEGADO` só avisam, e não
 * podem PIORAR — o número é teto, e teto que só desce (mesmo molde da D-35).
 * Módulo fora do legado falha com qualquer ocorrência.
 */

/** Mede o contraste de todo texto visível e devolve o que reprova. */
const MEDIR = `(() => {
  const lum = (r, g, b) => {
    const v = [r, g, b].map((x) => {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const parse = (s) => {
    const m = String(s).match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  // Sobe a árvore até encontrar um fundo opaco — é o que o olho enxerga atrás.
  const fundoDe = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0.9) return c;
      n = n.parentElement;
    }
    return { r: 18, g: 20, b: 23, a: 1 };
  };
  const ratio = (a, b) => {
    const x = lum(a.r, a.g, a.b), y = lum(b.r, b.g, b.b);
    const [c, d] = x > y ? [x, y] : [y, x];
    return (c + 0.05) / (d + 0.05);
  };
  // Emoji renderiza com cor própria; a cor herdada não se aplica e mede errado.
  const soEmoji = (s) => !/[a-zA-Z0-9À-ÿ]/.test(s);

  const ruins = [];
  document.querySelectorAll("div,span,p,h1,h2,h3").forEach((el) => {
    if (el.children.length) return;
    const t = (el.innerText || "").trim();
    if (!t || t.length < 2 || soEmoji(t)) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return;
    const cx = el.getBoundingClientRect();
    if (cx.width < 1 || cx.height < 1) return;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) return;
    const r = ratio(fg, fundoDe(el));
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    // WCAG AA: 3:1 para texto grande, 4.5:1 para o resto.
    const min = px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5;
    if (r < min) {
      ruins.push({
        texto: t.slice(0, 40),
        razao: +r.toFixed(2),
        min,
        cor: cs.color,
        px: +px.toFixed(1),
      });
    }
  });
  return ruins;
})()`;

/**
 * Universo: as rotas de módulo que o build publicou.
 *
 * `[id].html` é o template do expo-router, não um módulo — fica de fora.
 */
function modulosPublicados(): string[] {
  const dir = path.resolve(__dirname, "..", "dist", "modulos");
  if (!fs.existsSync(dir)) {
    throw new Error(
      "dist/modulos não existe — rode `npm run build:web` antes. " +
        "Sem build não há universo, e um teste sem universo passa por vacuidade (R-15 item 9)."
    );
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".html") && !f.startsWith("["))
    .map((f) => f.replace(/\.html$/, ""))
    .sort();
}

/**
 * Dívida herdada, CONGELADA no dia em que o universo foi ampliado.
 *
 * O número é TETO: pode descer (e aí se atualiza), nunca subir. Módulo que
 * chega a zero sai desta lista e passa a falhar como os demais.
 *
 * ⚠️ Preenchido pelo levantamento, não por estimativa.
 */
const LEGADO: Record<string, number> = {
  // Rail azul (#1e6fd9) com rótulos de 9 px em #aab6c6 — 2,36:1 nos dez
  // fármacos, 3,45:1 no ativo. É o sintoma que o usuário relatou como
  // "barra lateral apagada". Bloco (3) da convergência de UI.
  "drogas-vasoativas": 13,
  // ⚠️ CAIU DE 10 PARA 3 no bloco de convergência dos Eletrólitos: o acento
  // deixou de ser cor de texto (era 1,60:1 em "Hiponatremia") e virou fundo do
  // círculo do íon no rail e faixa na métrica do hero.
  //
  // As 3 que sobram NÃO são defeito de tela:
  //
  // ⚠️ TRÊS DAS DEZ SÃO OUTRA COISA, e ficam de propósito: "Hiponatremia",
  // "mEq/L" e "Masculino" dão 4,43:1 — reprovam por 0,07 num piso
  // convencional. É a BORDA DO TEMA (#f1f5f9 sobre #565e6c), não defeito da
  // tela.
  //
  // Decisão do autor (2026-08-16): NÃO ajustar o token para passar. Mexer na
  // paleta para satisfazer o instrumento é o R-55 aplicado à cor — piorar o
  // desenho para agradar a trava. Reavaliar quando a paleta for revista DE
  // PROPÓSITO, não como efeito colateral desta medição.
  "correcoes-eletroliticas": 3,
};

const MODULOS = modulosPublicados();

for (const id of MODULOS) {
  test(`contraste renderizado — ${id}`, async ({ page }) => {
    await abrirModulo(page, id);
    const ruins = (await page.evaluate(MEDIR)) as {
      texto: string;
      razao: number;
      min: number;
      cor: string;
      px: number;
    }[];

    const resumo = ruins.map(
      (r) => `${r.razao}:1 (mín ${r.min}) ${r.px}px "${r.texto}" ${r.cor}`
    );
    const teto = LEGADO[id];

    if (teto === undefined) {
      expect(resumo, `texto abaixo do contraste AA em "${id}"`).toEqual([]);
      return;
    }

    // Legado: avisa sempre, falha só se PIORAR.
    if (resumo.length) {
      console.warn(
        `⚠️  ${id}: ${resumo.length} texto(s) abaixo do AA (teto ${teto})\n` +
          resumo.map((l) => `      ${l}`).join("\n")
      );
    }
    expect(
      resumo.length,
      `"${id}" piorou: ${resumo.length} ocorrências contra um teto de ${teto}. ` +
        `O teto só desce — se você corrigiu, baixe o número em LEGADO.`
    ).toBeLessThanOrEqual(teto);
  });
}
