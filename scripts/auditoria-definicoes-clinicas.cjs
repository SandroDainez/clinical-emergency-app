/**
 * INVENTÁRIO DAS AFIRMAÇÕES CLÍNICAS — ⚠️ **para conferência humana**.
 *
 * ⛔ ⛔ ⛔ **⛔ ISTO ⛔ NÃO É UMA TRAVA.** ⚠️ ⛔ Ele ⛔ não reprova ⛔ nada:
 * ⛔ ele **⛔ lista**, ⛔ classifica ⛔ e ⛔ **⛔ diz ⛔ o que ⛔ não sabe**.
 *
 * ⛔ ⛔ O que ⛔ ele mede ⛔ é ⛔ **`app ↔ transcrição`** — mecânico.
 * ⛔ O que ⛔ ele **⛔ não** mede ⛔ é **`transcrição ↔ PDF`** — ⛔ que ⛔ é
 * ⛔ onde ⛔ o defeito da hipodensidade ⛔ estava, ⛔ e ⛔ que ⛔ **⛔ só uma
 * pessoa ⛔ com a fonte ⛔ resolve**.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
const TRANSCRICOES = ["aha-asa-2026-avc-isquemico.md", "aha-asa-2022-hic.md", "aha-asa-2023-hsa.md", "f18-correcao-glicemica-avc.md"]
  .map((f) => path.join(appDir, "protocols", "fontes-verbatim", f))
  .filter((p) => fs.existsSync(p))
  .map((p) => lerFonte(p))
  .join("\n");

/** ⚠️ ⛔ Os padrões ⛔ que o autor pediu, ⛔ e o **tipo** que cada um denuncia. */
const PADROES = [
  [/\bdefine\b|\bdefinid[ao]\b|define-se/i, "definição"],
  [/\bconsiderad[ao]\b/i, "definição"],
  [/\bcorresponde\b/i, "definição"],
  [/\bsignifica\b/i, "definição"],
  [/contraindica/i, "contraindicação"],
  [/\bcorte\b|\blimiar\b/i, "corte"],
  [/\bjanela\b/i, "janela temporal"],
  [/\bdose\b|mg\/kg|\bmcg\b|micrograma/i, "dose"],
  [/mmHg|mg\/dL|UI\b|Hounsfield/i, "unidade/intervalo"],
  [/\bCOR\b\s*[123]|LOE\b/i, "força de recomendação"],
  [/verbatim|p\.\s*e\d{3}|Table\s*\d/i, "verbatim com página"],
];

function classifica(txt) {
  const tipos = new Set();
  for (const [re, tipo] of PADROES) if (re.test(txt)) tipos.add(tipo);
  return [...tipos];
}

/** ⚠️ ⛔ Trechos longos ⛔ o bastante ⛔ para ⛔ serem afirmação, ⛔ e ⛔ não rótulo. */
function afirmacoes() {
  const out = [];
  const dirs = [path.join(appDir, "avc", "conteudo"), path.join(appDir, "avc", "nucleo")];
  for (const d of dirs) {
    for (const f of fs.readdirSync(d).filter((x) => x.endsWith(".ts"))) {
      const txt = lerFonte(path.join(d, f));
      const semComentario = txt.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      for (const m of semComentario.matchAll(/"((?:[^"\\]|\\.){45,400})"/g)) {
        const frase = m[1];
        if (!/[a-záéíóúâêôãõç]/i.test(frase)) continue;
        const tipos = classifica(frase);
        if (tipos.length === 0) continue;
        out.push({ arquivo: `${path.basename(d)}/${f}`, frase, tipos });
      }
    }
  }
  return out;
}

/**
 * ⚠️⚠️ ⛔ `app ↔ transcrição`: ⛔ a frase do app ⛔ é **paráfrase** ⛔ do
 * português; ⛔ o que ⛔ dá para casar ⛔ é ⛔ o **⛔ número ⛔ e a unidade**.
 * ⛔ Casar prosa ⛔ daria falso ⛔ nos dois sentidos.
 */
function ancoras(frase) {
  return [...frase.matchAll(/\d+(?:[.,]\d+)?\s*(?:mg\/kg|mg\/dL|mmHg|mg|mcg|UI|horas?|minutos?|dias|meses|%)/gi)].map((x) => x[0]);
}

/**
 * ── ⚠️⚠️⚠️ ⛔ NORMALIZAÇÃO — 2026-09-09 ────────────────────────────────────
 *
 * ⛔ ⛔ ⛔ **⛔ A primeira versão ⛔ deu ⛔ 15 alarmes ⛔ para ⛔ 1 item real.**
 * ⚠️ ⛔ Os 14 ⛔ eram ⛔ o **⛔ mesmo número**, ⛔ escrito ⛔ diferente:
 * a transcrição usa `mm Hg` ⛔ com espaço ⛔ e `24 h` ⛔ abreviado;
 * o app escreve `220 mmHg` ⛔ e `24 horas`.
 *
 * ⚠️⚠️ ⛔ **⛔ Auditoria ⛔ que ⛔ grita ⛔ 14 vezes ⛔ à toa ⛔ é ⛔ pior que
 * ⛔ auditoria ⛔ nenhuma**: ⛔ ela gasta ⛔ a atenção ⛔ de quem confere,
 * ⛔ e ⛔ ensina ⛔ a ignorar ⛔ o alarme.
 *
 * ── ⚠️⚠️ ⛔ O QUE ⛔ **⛔ NÃO** SE NORMALIZA ───────────────────────────────
 *
 * ⛔ ⛔ **⛔ Decimal ⛔ nunca vira ⛔ inteiro.** ⚠️ Regra do autor: *"⛔ não
 * normalizar de forma que `0,25` ⛔ possa virar `25`"* — ⛔ a vírgula
 * ⛔ vira ponto, ⛔ e ⛔ **⛔ o zero à esquerda ⛔ fica**.
 *
 * ⛔ ⛔ **⛔ Unidade ⛔ nunca some.** ⛔ `50 UI/kg` ⛔ e `50 mg/kg` ⛔ têm ⛔ o
 * mesmo número ⛔ e ⛔ não são ⛔ a mesma coisa.
 */
function normalizar(t) {
  return (
    String(t)
      .toLowerCase()
      /** ⛔ Espaços não separáveis ⛔ e travessões ⛔ viram os comuns. */
      .replace(/[\u00a0\u202f\u2009]/g, " ")
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      /** ⛔ `mm Hg` → `mmhg`; ⛔ `mg / dL` → `mg/dl`. */
      .replace(/mm\s*hg/g, "mmhg")
      .replace(/mg\s*\/\s*dl/g, "mg/dl")
      .replace(/mg\s*\/\s*kg/g, "mg/kg")
      .replace(/ui\s*\/\s*kg/g, "ui/kg")
      /** ⚠️ ⛔ `h` ⛔ e `horas` ⛔ só quando ⛔ vêm **⛔ depois de número**. */
      .replace(/(\d)\s*(?:horas?|hours?|hrs?|h)\b/g, "$1h")
      .replace(/(\d)\s*(?:minutos?|minutes?|mins?|min)\b/g, "$1min")
      /** ⛔ Vírgula decimal ⛔ vira ponto — ⛔ e ⛔ **⛔ só entre dígitos**. */
      .replace(/(\d),(\d)/g, "$1.$2")
      /** ⛔ Cola o número ⛔ à unidade, ⛔ sem ⛔ **⛔ apagar** ⛔ a unidade. */
      .replace(/(\d)\s+(?=[a-z%])/g, "$1")
      .replace(/\s+/g, " ")
  );
}

const itens = afirmacoes();
const linhas = [];
let comAncora = 0;
let ancoraAusente = 0;

for (const it of itens) {
  const a = ancoras(it.frase);
  let estado = "sem âncora numérica — conferir por leitura";
  if (a.length > 0) {
    comAncora++;
    const T = normalizar(TRANSCRICOES);
    const faltando = a.filter((x) => !T.includes(normalizar(x)));
    estado = faltando.length === 0
      ? "âncoras presentes na transcrição"
      : `⚠️ ÂNCORA AUSENTE na transcrição: ${faltando.join(", ")}`;
    if (faltando.length > 0) ancoraAusente++;
  }
  linhas.push({ ...it, ancoras: a, estado });
}

/* ── relatório ─────────────────────────────────────────────────────────── */

const porTipo = {};
for (const l of linhas) for (const t of l.tipos) porTipo[t] = (porTipo[t] ?? 0) + 1;

console.log("\n═══ INVENTÁRIO DAS AFIRMAÇÕES CLÍNICAS DO AVC ═══\n");
console.log(`  afirmações classificadas: ${linhas.length}`);
console.log(`  com âncora numérica:      ${comAncora}`);
console.log(`  âncora AUSENTE na transcrição: ${ancoraAusente}\n`);
console.log("  por tipo:");
for (const [t, n] of Object.entries(porTipo).sort((a, b) => b[1] - a[1])) {
  console.log(`    ${String(n).padStart(4)}  ${t}`);
}

const suspeitas = linhas.filter((l) => l.estado.startsWith("⚠️"));
if (suspeitas.length > 0) {
  console.log(`\n  ── ${suspeitas.length} afirmação(ões) com número que ⛔ NÃO aparece na transcrição ──\n`);
  for (const s of suspeitas.slice(0, 40)) {
    console.log(`    · ${s.arquivo}`);
    console.log(`      "${s.frase.slice(0, 110)}${s.frase.length > 110 ? "…" : ""}"`);
    console.log(`      ${s.estado}\n`);
  }
}

console.log("\n  ⚠️  transcrição ↔ PDF: NÃO CONFERIDO para todos os itens,");
console.log("      salvo os registrados em avc/conteudo/conferencia.ts.");
console.log("      Página citada NÃO é prova de que o texto existe.\n");

const saida = path.join(appDir, "auditoria", "INVENTARIO-AFIRMACOES-AVC.json");
fs.writeFileSync(saida, JSON.stringify(linhas, null, 2));
console.log(`  inventário completo: ${path.relative(appDir, saida)}\n`);
