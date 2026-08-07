const { chromium } = require("playwright");
const fs = require("fs");
const mods = fs.readFileSync("lib/modulos-canonicos.ts","utf8")
  .match(/\{\s*id:\s*"([a-z0-9-]+)"/g).map(m=>m.match(/"([a-z0-9-]+)"/)[1]);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); // celular
  const achados = [];
  for (const m of mods) {
    try {
      await p.goto(`http://localhost:4173/modulos/${m}`, { waitUntil: "networkidle", timeout: 20000 });
      await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const body = document.body;
        const txt = body.innerText || "";
        // 1. estouro horizontal
        const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        // 2. alvos de toque pequenos
        const pequenos = [...document.querySelectorAll('[tabindex="0"]')]
          .filter(n => { const r = n.getBoundingClientRect(); return r.height > 0 && r.height < 44; }).length;
        // 3. texto cortado (elemento com scrollWidth > clientWidth)
        const cortados = [...document.querySelectorAll("div,span")]
          .filter(n => n.children.length === 0 && n.scrollWidth > n.clientWidth + 2).length;
        return { len: txt.length, overflow, pequenos, cortados, vazio: txt.trim().length < 120 };
      });
      achados.push({ m, ...r });
    } catch (e) { achados.push({ m, erro: String(e).slice(0,60) }); }
  }
  await b.close();
  const ruim = achados.filter(a => a.erro || a.vazio || a.overflow > 2 || a.pequenos > 0 || a.cortados > 3);
  console.log(`\nmódulos varridos: ${achados.length} · com achado: ${ruim.length}\n`);
  for (const a of ruim) {
    console.log(`❌ ${a.m.padEnd(26)} ${a.erro ? "ERRO " + a.erro :
      [a.vazio && "tela vazia", a.overflow > 2 && `estouro ${a.overflow}px`,
       a.pequenos > 0 && `${a.pequenos} alvo(s) < 44px`, a.cortados > 3 && `${a.cortados} texto(s) cortado(s)`]
      .filter(Boolean).join(" · ")}`);
  }
  if (!ruim.length) console.log("nenhum achado automático");
})();
