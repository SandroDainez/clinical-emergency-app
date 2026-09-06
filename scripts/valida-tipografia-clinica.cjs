#!/usr/bin/env node
/**
 * TRAVA DA TIPOGRAFIA CLÍNICA — pedida pelo autor em 2026-09-05.
 *
 * PROMETE: que ⛔ nenhum arquivo da lista `MIGRADAS` — os que já vestem o
 *   sistema clínico do AVC — escreva `fontSize`, `fontWeight` ⛔ ou `lineHeight`
 *   avulso, ⛔ nem hexadecimal de cor. Todo texto sai de `PAPEL`
 *   (`design-system/tipografia-clinica.ts`) ⛔ e toda cor sai de `tema.cores`,
 *   ⛔ que é o que faz os dois temas nascerem corretos ao mesmo tempo.
 *
 * NÃO PROMETE: que o papel escolhido seja o **certo** para aquele texto — ela
 *   ⛔ não sabe se um título virou legenda. ⛔ Também ⛔ não cobre os arquivos
 *   fora de `MIGRADAS`: as superfícies antigas do AVC ⛔ ainda usam a escala
 *   global, ⛔ e cobrar delas hoje reprovaria o build por trabalho que ⛔ ainda
 *   ⛔ não foi feito. ⛔ E ⛔ não mede contraste — quem faz isso é
 *   `valida-contraste` ⛔ e `e2e/contraste-renderizado`.
 *
 * UNIVERSO: os arquivos declarados em `MIGRADAS`, ⛔ e ⛔ nada além. A lista
 *   ⛔ só cresce: arquivo que entra ⛔ nunca mais sai, ⛔ e é assim que a trava
 *   avança sem bloquear a migração.
 *
 * ── ⚠️⚠️ O QUE ELA IMPEDE ──────────────────────────────────────────────────
 *
 * `fontSize`, `fontWeight` ⛔ e `lineHeight` **avulsos** dentro do sistema
 * clínico do AVC. ⚠️ Foi exatamente essa liberdade que produziu, no código
 * antigo, dezenas de combinações de tamanho+peso+cor inventadas tela a tela — o
 * que o autor descreveu como *"não quero dezenas de combinações diferentes"*.
 *
 * ⚠️ Todo texto sai de `PAPEL` (`design-system/tipografia-clinica.ts`), que
 * descreve **função**, ⛔ e ⛔ não tamanho.
 *
 * ── ⚠️⚠️ O ESCOPO CRESCE COM A MIGRAÇÃO, ⛔ E ⛔ NÃO DE UMA VEZ ─────────────
 *
 * ⛔ As superfícies antigas do AVC ⛔ ainda ⛔ não passaram pelo sistema novo, ⛔ e
 * cobrar delas hoje reprovaria o build por trabalho que ⛔ ainda ⛔ não foi
 * feito. ⚠️ `MIGRADAS` é a lista do que **já veste** o sistema — arquivo que
 * entra ali ⛔ nunca mais pode sair, ⛔ e é assim que a trava avança sem
 * bloquear.
 *
 * ⛔ Este é o mesmo mecanismo de `legado-de-cor.json`: teto que só desce.
 */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

/**
 * ⚠️ Arquivos que JÁ vestem o sistema clínico. ⛔ Nenhum `fontSize`,
 * `fontWeight` ⛔ ou `lineHeight` avulso é tolerado aqui.
 */
const MIGRADAS = [
  "components/avc/sistema/index.tsx",
  /** ⚠️ PD-37 · propagação: os catálogos hemorrágicos vestiram o sistema. */
  "components/avc/superficie-hemorragica.tsx",
  /** ⚠️ PD-37 · propagação: painéis e correções. */
  "components/avc/superficie-paciente.tsx",
  "components/avc/superficie-laboratorio.tsx",
  "components/avc/superficie-e.tsx",
];

/**
 * ⚠️⚠️ AS ÚNICAS EXCEÇÕES, ⛔ e cada uma com o motivo escrito.
 *
 * ⛔ Exceção sem justificativa vira gaveta — ⛔ e a gaveta esvazia a trava.
 */
const EXCECOES = [
  {
    arquivo: "design-system/tipografia-clinica.ts",
    motivo: "É a DEFINIÇÃO dos papéis. ⛔ Proibir tamanho aqui proibiria a escala de existir.",
  },
];

const PROIBIDOS = [
  { chave: "fontSize", regex: /\bfontSize\s*:/g },
  { chave: "fontWeight", regex: /\bfontWeight\s*:/g },
  { chave: "lineHeight", regex: /\blineHeight\s*:/g },
];

let falhas = [];
let ok = 0;

for (const rel of MIGRADAS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    falhas.push(`${rel} — declarado como MIGRADA, ⛔ mas ⛔ não existe no repositório`);
    continue;
  }
  const fonte = fs.readFileSync(abs, "utf8");
  /**
   * ⚠️ O spread de PAPEL é a forma CERTA de usar tamanho, ⛔ e ele contém a
   * palavra proibida ⛔ apenas dentro do objeto importado — ⛔ não no arquivo.
   * ⚠️ Contamos ocorrências literais, ⛔ e `...PAPEL.x` ⛔ não é uma delas.
   */
  for (const { chave, regex } of PROIBIDOS) {
    const achados = fonte.match(regex) ?? [];
    if (achados.length > 0) {
      falhas.push(
        `${rel} — ${achados.length}× \`${chave}\` avulso. `
        + `⚠️ Use um papel de \`PAPEL\` (design-system/tipografia-clinica.ts).`
      );
    } else {
      ok++;
    }
  }
  /** ⚠️ E hex cru continua proibido — a cor vem do tema, ⛔ nos dois temas. */
  const hex = fonte.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
  if (hex.length > 0) {
    falhas.push(`${rel} — ${hex.length}× hex cru (${hex.slice(0, 3).join(", ")}). ⚠️ Use \`tema.cores\`.`);
  } else {
    ok++;
  }
}

if (falhas.length > 0) {
  console.log(`\n❌ TIPOGRAFIA CLÍNICA — ${falhas.length} falha(s)\n`);
  for (const f of falhas) console.log(`  · ${f}`);
  console.log(
    `\n⚠️ ${MIGRADAS.length} arquivo(s) na lista MIGRADAS.`
    + ` ⛔ Arquivo que entra nela ⛔ nunca mais sai.\n`
  );
  process.exit(1);
}

console.log(
  `✅ TIPOGRAFIA CLÍNICA — ${ok} conferência(s) · `
  + `${MIGRADAS.length} arquivo(s) vestindo o sistema · ${EXCECOES.length} exceção(ões) justificada(s)`
);
