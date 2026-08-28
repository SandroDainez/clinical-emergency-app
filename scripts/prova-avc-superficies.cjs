/**
 * PROMETE: que a LETRA de uma superfície do AVC seja apresentação e nada mais —
 *   que o identificador seja um slug estável, que a letra saia da posição e ⛔
 *   nunca seja digitada, que a ordem de apresentação seja exatamente a aprovada
 *   pelo autor, que nenhuma superfície declare vizinho ("próxima"/"anterior")
 *   nem pré-requisito de navegação, e que toda pendência e todo slot de fonte
 *   citados por uma superfície EXISTAM.
 * NÃO PROMETE: que a ordem seja a melhor ordem clínica — isso é julgamento do
 *   autor, e a trava só congela a decisão dele para que ela ⛔ não se desfaça por
 *   acidente. Também ⛔ não mede tela: que a tela RENDERIZE nesta ordem é
 *   `e2e/avc-modulo-navegavel`, e ⛔ não diz nada sobre o conteúdo clínico de
 *   nenhuma superfície.
 * UNIVERSO: `avc/conteudo/superficies.ts` e `avc/conteudo/fontes.ts` compilados
 *   — as sete superfícies e as três pendências iniciais, contadas e impressas.
 *
 * ── O DEFEITO QUE ESTA TRAVA NASCEU PARA MATAR (2026-08-28) ────────────────
 *
 * `SuperficieId` era `"A" | ... | "G"`: a letra ERA a identidade. Ao inverter E
 * e F, `superficieVista: "E"` mudaria de significado sem que uma linha de
 * estado mudasse, e uma pendência `dono: "E"` passaria a apontar para outra
 * superfície EM SILÊNCIO. Rótulo virando identidade é um defeito que passa em
 * todos os testes — é por isso que ele precisa de trava própria.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-sup-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "conteudo", "superficies.ts"),
  path.join(appDir, "avc", "conteudo", "fontes.ts"),
], { cwd: appDir, stdio: "pipe" });

const S = require(path.join(tmp, "conteudo", "superficies.js"));
const F = require(path.join(tmp, "conteudo", "fontes.js"));

const sups = S.SUPERFICIES;
console.log(`universo: ${sups.length} superfície(s) · ${S.PENDENCIAS_INICIAIS.length} pendência(s) inicial(is)`);

// ── identidade ≠ rótulo ────────────────────────────────────────────────────
confere("são sete superfícies", sups.length === 7, "§7.15: o AVC V1 tem sete janelas");

confere("todo id é único",
  new Set(sups.map((s) => s.id)).size === sups.length,
  "id repetido faz duas superfícies compartilharem estado");

/**
 * ⚠️⚠️ A CONFERÊNCIA CENTRAL DESTE ARQUIVO. Um id de uma letra é um id que
 * muda de significado quando a ordem muda — e a ordem já mudou uma vez.
 */
confere("nenhum id é uma letra de apresentação",
  sups.every((s) => !/^[A-G]$/.test(s.id) && /^[a-z]+$/.test(s.id)),
  "identidade não pode ser rótulo: reordenar reescreveria o sentido do estado");

confere("a letra é derivada da posição",
  sups.every((s, i) => s.letra === String.fromCharCode(65 + i)),
  "letra digitada pode discordar da ordem, e aí a tela e o prontuário divergem");

// ── a ordem aprovada pelo autor (2026-08-28) ───────────────────────────────
const ORDEM_APROVADA = [
  ["A", "estabilizacao", "Entrada e estabilização"],
  ["B", "neurologico", "Neurológico"],
  ["C", "imagem", "Imagem"],
  ["D", "seguranca", "Segurança e elegibilidade"],
  ["E", "correcoes", "Correções"],
  ["F", "reperfusao", "Reperfusão"],
  ["G", "destino", "Destino"],
];
confere("a ordem de apresentação é a aprovada",
  sups.length === ORDEM_APROVADA.length
  && sups.every((s, i) => s.letra === ORDEM_APROVADA[i][0]
    && s.id === ORDEM_APROVADA[i][1]
    && s.titulo === ORDEM_APROVADA[i][2]),
  "a ordem foi decidida pelo autor; mudá-la sem ele é mudar o que o médico vê primeiro");

/**
 * ⚠️ E-11 / §7.2 — ORDEM ⛔ NÃO É FLUXO. Se um dia alguém acrescentar `proxima`,
 * `anterior`, `requer` ou `depende`, a lista deixa de ser ordem de leitura e
 * vira árvore linear obrigatória, que é exatamente o que o AVC ⛔ não pode ter.
 */
const CHAVES_PERMITIDAS = ["id", "letra", "titulo", "resumo", "fontes"];
confere("nenhuma superfície declara vizinho ou pré-requisito",
  sups.every((s) => Object.keys(s).every((k) => CHAVES_PERMITIDAS.includes(k))),
  "E-11: campo de sequência transformaria apresentação em fluxo obrigatório");

// ── integridade das referências ────────────────────────────────────────────
const ids = new Set(sups.map((s) => s.id));
confere("toda pendência aponta para uma superfície existente",
  S.PENDENCIAS_INICIAIS.every((p) => ids.has(p.dono)),
  "E-26: pendência com dono inexistente é muro apontando para a parede errada");

confere("todo slot de fonte citado existe",
  sups.every((s) => s.fontes.every((f) => F.slot(f) !== undefined)),
  "E-30: a fonte é propriedade da afirmação, e endereço morto não é endereço");

confere("id desconhecido é erro, não piso silencioso",
  (() => {
    try { S.superficie("E"); return false; } catch { return true; }
  })(),
  "a letra ⛔ não é mais id: aceitá-la devolveria a superfície errada calada");

if (falhas.length) {
  console.error(`\n❌ PROVA DAS SUPERFÍCIES DO AVC — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DAS SUPERFÍCIES DO AVC — ${ok}/${ok} conferências`);
