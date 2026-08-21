/**
 * PISO DE UNIVERSO — "não consegui olhar" é diferente de "não há".
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (varrido em 2026-08-20) ──────────────────────
 *
 * Três instrumentos deste projeto passaram VERDE com o universo vazio:
 *
 *   · `valida-pressuposicao` com o vocabulário apagado → "✅ nenhuma afirmação";
 *   · a cobertura do "não sei" com o regex de gravidade sem casar → "0 pendências";
 *   · `mapa:fontes` §5 com `guidelines: []` → "0 fontes sem ano".
 *
 * Nos três, o falso negativo veio CARIMBADO DE VERDE — que é a forma mais cara
 * dele, porque ninguém vai conferir uma boa notícia.
 *
 * ── O QUE ESTE MÓDULO IMPÕE ────────────────────────────────────────────────
 *
 * 1. **Universo e resultado saem juntos.** Nenhum "0 achados" sem o "de quantos".
 * 2. **Universo abaixo do piso REPROVA**, com a frase que separa os dois casos.
 * 3. **O piso é declarado em arquivo** (`auditoria/universo-dos-instrumentos.json`),
 *    não no código do instrumento — é o retrato do universo, e serve contra
 *    EROSÃO: se o número medido cair, alguém removeu conteúdo do radar sem
 *    perceber; se subir, o piso pede atualização.
 *
 * ⚠️ O PISO NÃO É META NEM TETO. Ele responde uma pergunta só: "o instrumento
 * conseguiu olhar?". Um piso alto demais vira falso positivo; um piso zero é o
 * defeito que ele existe para matar.
 */
const fs = require("node:fs");
const path = require("node:path");

const RETRATO = path.resolve(__dirname, "..", "..", "auditoria", "universo-dos-instrumentos.json");

function lerRetrato() {
  if (!fs.existsSync(RETRATO)) {
    console.log(`\n❌ ${path.relative(process.cwd(), RETRATO)} não existe — sem o retrato do universo, "0 achados" não tem como ser distinguido de "não olhei".\n`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(RETRATO, "utf8"));
}

/**
 * Confere o universo de UMA dimensão e imprime a linha.
 *
 * Devolve `true` quando o universo é suficiente. Quando não é, imprime a falha
 * e devolve `false` — quem chama decide se aborta ali ou soma às outras falhas.
 */
function conferirUniverso(instrumento, dimensao, medido) {
  const retrato = lerRetrato();
  const esperado = retrato[instrumento]?.[dimensao];

  if (esperado === undefined) {
    console.log(
      `   ⚠️ universo "${dimensao}" = ${medido} — SEM PISO DECLARADO em auditoria/universo-dos-instrumentos.json.\n` +
      `      Enquanto não houver, este instrumento não sabe dizer se olhou.`
    );
    return true;
  }

  const ok = medido >= esperado;
  console.log(`   universo · ${dimensao}: ${medido} (piso ${esperado})${ok ? "" : "  ❌"}`);

  if (!ok) {
    console.log(
      `\n❌ ${instrumento}: o universo "${dimensao}" encolheu — ${medido}, abaixo do piso ${esperado}.\n` +
      `   ⚠️ ISTO É "NÃO CONSEGUI OLHAR", NÃO "NÃO HÁ ACHADO". Qualquer contagem impressa\n` +
      `   acima vale para ${medido} item(ns), não para o módulo. Causas usuais: o filtro\n` +
      `   parou de casar (nome de arquivo, regex, chave de JSON), ou conteúdo saiu do radar.\n` +
      `   Se a queda for legítima, baixe o piso NO RETRATO, com o motivo — nunca no código.\n`
    );
  }
  return ok;
}

module.exports = { conferirUniverso, RETRATO };
