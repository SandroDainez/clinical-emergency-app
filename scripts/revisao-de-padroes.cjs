#!/usr/bin/env node
/**
 * PÁGINA DE REVISÃO DOS PADRÕES VISUAIS — o instrumento que torna 40 painéis
 * revisáveis por um médico só.
 *
 * ── ⚠️ POR QUE ISTO É FERRAMENTA DO REPOSITÓRIO, E NÃO SCRIPT SOLTO ────────
 *
 * Ele existia como arquivo no scratchpad da conversa — foi assim que os cinco
 * traçados da hipercalemia foram aprovados. Scratchpad some com a sessão, e o
 * modo de falha é exatamente o que acabou de acontecer com a especificação de
 * 22 seções: documento que decide o rumo do módulo vivendo fora do controle de
 * versão, recuperável só enquanto alguém lembrar que existe.
 *
 * ── O QUE ELE FAZ ──────────────────────────────────────────────────────────
 *
 * Lê as ÁRVORES, não uma lista à parte: todo nó de decisão com `comparativo`
 * entra. Isso significa que a página não pode ficar desatualizada em relação ao
 * app — painel novo aparece aqui no mesmo commit em que aparece na tela, e
 * painel removido some dos dois.
 *
 * Renderiza cada família numa tela só, com o desenho, o rótulo, o que significa
 * e A CONDUTA — que é o campo sem o qual o comparativo vira atlas
 * (`auditoria/PADRAO-VISUAL.md` §3).
 *
 * ── ⚠️ O QUE ELE NÃO É ─────────────────────────────────────────────────────
 *
 * Não é trava e não reprova nada: julgar se um traçado está desenhado certo é
 * do olho do médico, não de script. Ele existe para que esse olho gaste um
 * minuto por família em vez de quarenta toques em quarenta telas.
 *
 * Uso:  npm run revisao:padroes   →   auditoria/revisao/padroes-visuais.html
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "revisao-padroes-"));

// As árvores e o catálogo de desenhos, compilados juntos.
const arvores = fs
  .readdirSync(app)
  .filter((f) => /-(decision-)?tree\.ts$/.test(f))
  .sort();

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tmp,
    path.join(app, "design-system", "tracado-de-ecg.ts"),
    ...arvores.map((f) => path.join(app, f)),
  ],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] }
);

const req = (rel) => {
  const a = path.join(tmp, rel);
  const b = path.join(tmp, path.basename(rel));
  return require(fs.existsSync(a) ? a : b);
};
const { tracadoDeEcg } = req("design-system/tracado-de-ecg.js");

const familias = [];
for (const arq of arvores) {
  const mod = req(arq.replace(/\.ts$/, ".js"));
  for (const arv of Object.values(mod)) {
    if (!arv || typeof arv !== "object" || !arv.nodes) continue;
    for (const no of Object.values(arv.nodes)) {
      if (!no.comparativo || !no.comparativo.length) continue;
      familias.push({ arvore: arq, no: no.id, titulo: no.title, pergunta: no.question, aviso: no.summary, paineis: no.comparativo });
    }
  }
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const COR = "#e8edf5";

let html = `<!doctype html><meta charset="utf-8"><title>Revisão dos padrões visuais</title>
<style>
 body{background:#1c212b;color:${COR};font:16px/1.5 system-ui,-apple-system,sans-serif;margin:0;padding:24px}
 h1{font-size:20px;margin:0 0 4px} .sub{color:#9fb0c8;font-size:14px;margin-bottom:24px}
 .familia{background:#242b38;border:1px solid #37404f;border-radius:14px;padding:16px;margin-bottom:22px}
 .familia h2{font-size:17px;margin:0 0 2px} .familia .q{color:#9fb0c8;font-size:14px;margin:0 0 8px}
 .aviso{color:#ffb4a8;font-size:13px;margin:0 0 14px}
 .grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
 .painel{background:#1c212b;border:1px solid #37404f;border-radius:11px;padding:10px}
 .painel svg{width:100%;height:auto;display:block}
 .rot{font-weight:700;margin-top:8px} .sig{color:#9fb0c8;font-size:14px} .cond{color:#ffb4a8;font-weight:700;font-size:14px;margin-top:2px}
 .falta{color:#ff8a75;font-weight:700}
 footer{color:#6d7c92;font-size:13px;margin-top:20px}
</style>
<h1>Revisão dos padrões visuais</h1>
<div class="sub">${familias.length} família(s) · ${familias.reduce((n, f) => n + f.paineis.length, 0)} painéis · lidos das árvores, não de lista à parte</div>`;

for (const f of familias) {
  html += `<div class="familia"><h2>${esc(f.titulo)}</h2><p class="q">${esc(f.pergunta ?? "")} <span style="color:#6d7c92">· ${esc(f.arvore)} · ${esc(f.no)}</span></p>`;
  if (f.aviso) html += `<p class="aviso">${esc(f.aviso)}</p>`;
  html += `<div class="grade">`;
  for (const p of f.paineis) {
    const xml = tracadoDeEcg(p.figura, COR);
    html += `<div class="painel">${xml ?? `<div class="falta">SEM DESENHO — id "${esc(p.figura)}" não existe no catálogo</div>`}
      <div class="rot">${esc(p.rotulo)}</div>
      <div class="sig">${esc(p.significado)}</div>
      <div class="cond">${esc(p.conduta)}</div></div>`;
  }
  html += `</div></div>`;
}

html += `<footer>Gerado por <code>npm run revisao:padroes</code>. Escala: 6 px = 1 mm · 25 mm/s · 10 mm/mV — a mesma em todos os painéis, que é o requisito da §5 de PADRAO-VISUAL.md.</footer>`;

const saida = path.join(app, "auditoria", "revisao");
fs.mkdirSync(saida, { recursive: true });
const arqSaida = path.join(saida, "padroes-visuais.html");
fs.writeFileSync(arqSaida, html);
fs.rmSync(tmp, { recursive: true, force: true });

const semDesenho = familias.flatMap((f) => f.paineis).filter((p) => !tracadoDeEcg(p.figura, COR)).length;
console.log(`\n✅ ${familias.length} família(s), ${familias.reduce((n, f) => n + f.paineis.length, 0)} painéis`);
if (semDesenho) console.log(`⚠️  ${semDesenho} painel(éis) sem desenho no catálogo — aparecem marcados na página`);
console.log(`   ${path.relative(app, arqSaida)}\n`);
