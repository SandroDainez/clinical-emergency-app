#!/usr/bin/env node
/**
 * PROMETE: que o vocabulário de busca nasça COMPLETO e continue completo —
 *   todo módulo do hub tem sinônimos, nenhum termo é ambíguo entre módulos,
 *   e nenhum módulo se apoia só no próprio título.
 * NÃO PROMETE: que os termos sejam os CERTOS. Nenhuma trava sabe como o médico
 *   digita sob pressão; isso é decisão de quem escreve.
 * UNIVERSO: os ids derivados de `clinical-modules.ts`, não uma lista à mão
 *   (D-15) — módulo novo entra no radar sozinho e reprova até ser nomeado.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * Medido: NÃO EXISTE BUSCA no app. A conclusão foi que os sinônimos vêm antes
 * dela, porque uma busca sobre os títulos já nasceria inútil — casaria
 * "Engasgo (OVACE)" e não casaria "corpo estranho" nem "sufocamento".
 *
 * ⚠️ E O RISCO DESTE ARQUIVO É PRECISAMENTE O DE NASCER PELA METADE: dado sem
 * consumidor apodrece calado. Trinta módulos hoje, e o trigésimo primeiro entra
 * sem ninguém lembrar. É contra isso que a trava existe.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

// ── O universo: DERIVADO, não listado ──────────────────────────────────────
const fonteModulos = fs.readFileSync(path.join(appDir, "clinical-modules.ts"), "utf8");
const modulos = [...fonteModulos.matchAll(/^\s{4}id: "([^"]+)",\n\s{4}title: "([^"]+)"/gm)]
  .map((m) => ({ id: m[1], title: m[2] }));

const fonteSinonimos = fs.readFileSync(path.join(appDir, "constants/sinonimos-de-modulo.ts"), "utf8");

/** Lê um bloco `const NOME: ... = { ... };` e devolve { moduleId: termos[] }. */
function lerBloco(nome) {
  const i = fonteSinonimos.indexOf(`const ${nome}:`);
  if (i < 0) return null;
  const corpo = fonteSinonimos.slice(i, fonteSinonimos.indexOf("\n};", i));
  const out = {};
  for (const m of corpo.matchAll(/\n  "?([a-z0-9-]+)"?: \[([^\]]*)\]/g)) {
    out[m[1]] = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }
  return out;
}

const IDIOMAS = { "pt-BR": "PT_BR", "es-419": "ES_419" };
const porIdioma = {};
for (const [locale, constante] of Object.entries(IDIOMAS)) {
  const b = lerBloco(constante);
  if (!b) falhas.push(`bloco \`${constante}\` (${locale}) não encontrado — a varredura não conferiu este idioma.`);
  else porIdioma[locale] = b;
}
// ⚠️ O PT é o que carrega o título e o coloquialismo; as conferências de
// título e piso rodam nos DOIS, mas a de ambiguidade também — um termo
// espanhol ambíguo leva à tela errada tanto quanto um português.
const mapa = porIdioma["pt-BR"] ?? {};

if (modulos.length < 25) {
  falhas.push(`só ${modulos.length} módulos extraídos de clinical-modules.ts — a varredura pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;
if (Object.keys(mapa).length < 25) {
  falhas.push(`só ${Object.keys(mapa).length} entradas lidas de sinonimos-de-modulo.ts — o parser pode ter quebrado.`);
} else ok++;

// ── 1. COBERTURA: todo módulo tem entrada EM CADA IDIOMA ───────────────────
//
// ⚠️ A trava exige cobertura nos dois, e NÃO exige o mesmo número de termos:
// obrigar paridade numérica faria alguém inventar sinônimo para fechar a
// conta (R-55). "Atragantamiento" cobre sozinho o que o português divide em
// "engasgo" e "sufocamento", e isso é correto, não é falta.
const idsReais = new Set(modulos.map((m) => m.id));
const MINIMO = 6;

for (const [locale, mapaIdioma] of Object.entries(porIdioma)) {
  const semEntrada = modulos.filter((m) => !mapaIdioma[m.id]);
  if (semEntrada.length) {
    falhas.push(
      `[${locale}] ${semEntrada.length} módulo(s) sem sinônimo: ${semEntrada.map((m) => m.id).join(", ")}.\n` +
      `      ⚠️ Módulo sem sinônimo é módulo que a busca futura não acha. Foi exatamente ` +
      `o que aconteceu com o Engasgo, e o custo de escrever agora é uma linha.`
    );
  } else ok++;

  const orfas = Object.keys(mapaIdioma).filter((id) => !idsReais.has(id));
  if (orfas.length) {
    falhas.push(`[${locale}] entrada(s) para módulo inexistente: ${orfas.join(", ")} — id renomeado ou módulo removido.`);
  } else ok++;

  // ── 2. PISO: sinônimo de menos é o mesmo que nenhum ──────────────────────
  const magros = Object.entries(mapaIdioma).filter(([, ts]) => ts.length < MINIMO);
  if (magros.length) {
    falhas.push(
      `[${locale}] ${magros.length} módulo(s) com menos de ${MINIMO} sinônimos: ` +
      magros.map(([id, ts]) => `${id} (${ts.length})`).join(", ") + ".\n" +
      `      ⚠️ Duas ou três palavras cobrem o jeito que UMA pessoa pensa. O piso ` +
      `não garante qualidade — garante que ninguém preencheu por obrigação.`
    );
  } else ok++;

  // ── 3. AMBIGUIDADE, dentro do idioma ─────────────────────────────────────
  const dono = {};
  const ambiguos = [];
  for (const [id, termos] of Object.entries(mapaIdioma)) {
    for (const t of termos) {
      const chave = t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      if (dono[chave] && dono[chave] !== id) ambiguos.push(`« ${t} » → ${dono[chave]} e ${id}`);
      else dono[chave] = id;
    }
  }
  if (ambiguos.length) {
    falhas.push(
      `[${locale}] ${ambiguos.length} termo(s) apontando para mais de um módulo:\n` +
      ambiguos.map((a) => `        ${a}`).join("\n") + "\n" +
      `      ⚠️ Termo ambíguo é pior que termo ausente: a busca leva à tela errada com ` +
      `a confiança de quem acertou. Decida a quem o termo pertence.`
    );
  } else ok++;
}

// ── 4. O TÍTULO NÃO CONTA (conferido no PT, que é onde o título vive) ──────
//
// A saída fácil desta trava é preencher a lista com pedaços do próprio título:
// "Engasgo (OVACE)" viraria ["engasgo", "ovace"] e passaria no piso — sem
// acrescentar nada, porque a busca já casaria o título. O que se paga aqui é
// o vocabulário que o título NÃO tem.
const semNada = [];
for (const m of modulos) {
  const termos = mapa[m.id] ?? [];
  const tituloNorm = m.title.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const novos = termos.filter((t) => {
    const n = t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    return !tituloNorm.includes(n);
  });
  if (novos.length < 4) {
    semNada.push(`${m.id} — só ${novos.length} termo(s) fora do título « ${m.title} »`);
  }
}
if (semNada.length) {
  falhas.push(
    `${semNada.length} módulo(s) cujos sinônimos quase só repetem o título:\n` +
    semNada.map((x) => `        ${x}`).join("\n") + "\n" +
    `      ⚠️ Repetir o título não acrescenta nada — a busca já casa o título. ` +
    `O que falta é como o médico chama a coisa quando não lembra o nome do módulo.`
  );
} else ok++;

console.log("\nO vocabulário de busca nasce completo\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
const porLocale = Object.entries(porIdioma)
  .map(([l, m]) => `${l}: ${Object.values(m).reduce((a, ts) => a + ts.length, 0)}`)
  .join(" · ");
console.log(
  `✅ ${ok} conferências — ${modulos.length} módulos em ${Object.keys(porIdioma).length} idiomas ` +
  `(${porLocale} termos), nenhum ambíguo\n`
);
process.exit(0);
