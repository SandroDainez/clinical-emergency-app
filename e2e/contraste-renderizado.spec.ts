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
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.5) return;
    const r = ratio(fg, fundoDe(el));
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    // WCAG AA: 3:1 para texto grande, 4.5:1 para o resto.
    const min = px >= 24 || (px >= 18.66 && bold) ? 3 : 4.5;
    if (r < min) {
      ruins.push({ texto: t.slice(0, 40), razao: +r.toFixed(2), min, cor: cs.color });
    }
  });
  return ruins;
})()`;

const TELAS = [
  "pcr-adulto",
  "ritmos-acls",
  "anafilaxia",
  "sepse-adulto",
  "calculadoras-clinicas",
  "avc",
];

for (const id of TELAS) {
  test(`contraste renderizado — ${id}`, async ({ page }) => {
    await abrirModulo(page, id);
    const ruins = (await page.evaluate(MEDIR)) as {
      texto: string;
      razao: number;
      min: number;
      cor: string;
    }[];

    const resumo = ruins.map((r) => `${r.razao}:1 (mín ${r.min}) "${r.texto}" ${r.cor}`);
    expect(resumo, `texto abaixo do contraste AA em "${id}"`).toEqual([]);
  });
}
