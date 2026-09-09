/**
 * TRAVA DA HIPODENSIDADE — ⚠️ **a definição que a diretriz ⛔ NÃO dá**.
 *
 * PROMETE: que ⛔ nenhuma comparação com a **substância branca contralateral**
 *   volte a definir hipodensidade — ⛔ em direção ⛔ nenhuma —, que a
 *   explicação ⛔ na tela seja a da fonte (*hipoatenuação grave, como no AVC
 *   subagudo*), que o rótulo diga **franca**, ⛔ e que o `id` do fato
 *   ⛔ continue `hipodensidade_clara`.
 *
 * NÃO PROMETE: que a **⛔ tradução ⛔ inteira** do módulo esteja conferida
 *   contra o PDF. ⛔ Ela mede **⛔ este** achado, ⛔ que foi conferido pelo
 *   autor em 2026-09-09 — ⛔ e ⛔ o defeito que ⛔ ela fecha (⛔ verbatim
 *   fabricado ⛔ com página) ⛔ pode existir ⛔ noutros slots. ⛔ Suíte verde
 *   ⛔ é coerência interna, ⛔ e ⛔ **⛔ não** fidelidade à fonte.
 *
 * UNIVERSO: texto clínico ⛔ em `avc/conteudo`, `avc/nucleo`, `components/avc`
 *   ⛔ e `lib/i18n/modules`.
 *
 * ── ⚠️⚠️⚠️ ⛔ O DEFEITO QUE ISTO EXISTE PARA IMPEDIR ────────────────────────
 *
 * ⛔ ⛔ Até 2026-09-09 o módulo escrevia, ⛔ na linha de decisão do campo:
 *
 * > *"A fonte define hipodensidade clara como aquela cuja densidade é
 * > **⛔ maior** que a da substância branca contralateral ⛔ não acometida."*
 *
 * ⚠️ Conferência do autor **⛔ no PDF da AHA/ASA 2026**: ⛔ a frase
 * ⛔ **⛔ não é sustentada pela diretriz**.
 *
 * ── ⚠️⚠️ ⛔ ELA ERRAVA **⛔ DUAS** VEZES ───────────────────────────────────
 *
 * ⛔ ⛔ **1 · Inventava um critério.** ⛔ A diretriz ⛔ não dá definição
 * quantitativa: ⛔ ela diz *"frank hypodensity"*, ⛔ explicada no texto de
 * apoio como *"severe hypoattenuation as seen with subacute stroke"*.
 *
 * ⛔ ⛔ **2 · Invertia o sentido.** ⚠️ Hipodensidade ⛔ é atenuação
 * ⛔ **⛔ menor**; ⛔ a frase dizia ⛔ **⛔ maior**. ⛔ Um médico que ⛔ não
 * conhecesse o termo ⛔ aprenderia ⛔ o contrário ⛔ do que ⛔ ele significa,
 * ⛔ num campo que alimenta a superfície de segurança.
 *
 * ── ⚠️⚠️⚠️ ⛔ E ⛔ POR QUE A TRAVA ⛔ PROÍBE **⛔ OS DOIS LADOS** ────────────
 *
 * ⛔ ⛔ ⛔ Corrigir *"maior"* ⛔ para *"menor"* ⛔ seria **⛔ trocar uma
 * invenção por outra** — ⛔ o autor foi explícito: *"⛔ não substituir por uma
 * definição quantitativa inventada do tipo «menor que a substância branca
 * contralateral»"*.
 *
 * ⚠️ ⛔ Então ⛔ o que ⛔ esta trava recusa ⛔ é a **comparação com a
 * substância branca contralateral**, ⛔ em qualquer direção, ⛔ ao lado de
 * hipodensidade.
 *
 * ── ⚠️⚠️ ⛔ A ORIGEM, ⛔ PARA ⛔ NÃO SE REPETIR ─────────────────────────────
 *
 * ⛔ ⛔ *"Frank"* ⛔ virou *"clara"* ⛔ na tradução. ⚠️ ⛔ E *"clara"*, ⛔ em
 * imagem, ⛔ sugere **⛔ mais clara**, ⛔ isto é ⛔ **⛔ mais densa** — ⛔ e a
 * explicação inventada ⛔ veio **⛔ atrás da palavra errada**. ⛔ Por isso o
 * rótulo ⛔ diz **franca**, ⛔ e ⛔ a trava mede ⛔ isso também.
 */
const path = require("node:path");
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.join(__dirname, "..");
let falhas = 0;
let ok = 0;

function confere(nome, condicao, porque) {
  if (condicao) {
    ok++;
    return;
  }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/** ⚠️ Onde texto clínico pode nascer — ⛔ conteúdo, núcleo, tela ⛔ e traduções. */
function arquivos() {
  const dirs = [
    ["avc", "conteudo"],
    ["avc", "nucleo"],
    ["components", "avc"],
    ["lib", "i18n", "modules"],
  ];
  const saida = [];
  for (const d of dirs) {
    const base = path.join(appDir, ...d);
    for (const f of fs.readdirSync(base)) {
      const abs = path.join(base, f);
      if (fs.statSync(abs).isFile() && /\.(ts|tsx)$/.test(f)) saida.push(abs);
    }
  }
  return saida;
}

const TODOS = arquivos().map((abs) => ({ abs, txt: lerFonte(abs) }));

/* ══ ⚠️⚠️⚠️ 1 · A COMPARAÇÃO INVENTADA ⛔ NÃO VOLTA ═════════════════════ */

{
  /**
   * ⚠️ Uma frase que ligue **hipodensidade/hipoatenuação** a uma comparação
   * com a **substância branca contralateral** — ⛔ em qualquer direção.
   */
  const PROIBIDO =
    /(hipodensid|hipoatenua|hypodens|hypoattenu)[^.]{0,200}?(maior|menor|greater|less)[^.]{0,80}?(substância branca|sustancia blanca|white matter)/i;
  const culpados = TODOS.filter((f) => PROIBIDO.test(f.txt)).map((f) =>
    path.relative(appDir, f.abs)
  );
  confere(
    "⚠️⚠️ ⛔ nenhuma definição por comparação com a substância branca",
    culpados.length === 0,
    `⛔ ${culpados.join(", ")} — ⛔ a diretriz ⛔ não dá critério quantitativo, ⛔ e trocar "maior" por "menor" ⛔ é inventar de novo`
  );
}

/* ══ ⚠️⚠️ 2 · O QUE A FONTE **DIZ** CHEGA À TELA ═══════════════════════ */

{
  const campo = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-c.ts"));
  confere(
    "⚠️ a explicação vem da fonte: hipoatenuação grave, como no AVC subagudo",
    /hipoatenuação grave/i.test(campo) && /subagudo/i.test(campo),
    "⛔ sem a frase da fonte, o campo volta a ser um termo que o médico ⛔ não sabe ler"
  );
  confere(
    "⚠️⚠️ ⛔ o rótulo diz **franca**, ⛔ e ⛔ não *clara*",
    /Hipodensidade franca na tomografia/.test(campo),
    "⛔ *frank* ⛔ não é *clara* — ⛔ e foi a tradução errada que puxou a definição invertida"
  );
}

/* ══ ⚠️⚠️ 3 · A IDENTIDADE DO FATO ⛔ NÃO MUDOU ════════════════════════ */

{
  /**
   * ⚠️⚠️ ⛔ **⛔ RÓTULO ⛔ NÃO É IDENTIDADE.** ⛔ O `id` segue `hipodensidade_clara`
   * ⛔ porque ⛔ ele é a **casa do fato** ⛔ e a chave dos consumidores —
   * ⛔ renomeá-lo moveria fato clínico ⛔ para arrumar uma palavra.
   */
  const conteudo = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-c.ts"));
  const consumidores = lerFonte(path.join(appDir, "avc", "conteudo", "consumidores.ts"));
  confere(
    "⚠️ o `id` do fato continua `hipodensidade_clara`",
    /id: "hipodensidade_clara"/.test(conteudo) &&
      /hipodensidade_clara: \[/.test(consumidores),
    "⛔ trocar o `id` junto com o rótulo apagaria a trilha de quem já respondeu"
  );
}

if (falhas > 0) {
  console.log(`\n❌ HIPODENSIDADE — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`\n✅ HIPODENSIDADE — ${ok}/${ok} conferências · a definição inventada ⛔ não volta\n`);
