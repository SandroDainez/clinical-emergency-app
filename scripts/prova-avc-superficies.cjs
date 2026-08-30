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
  path.join(appDir, "avc", "nucleo", "estado.ts"),
], { cwd: appDir, stdio: "pipe" });

const S = require(path.join(tmp, "conteudo", "superficies.js"));
const F = require(path.join(tmp, "conteudo", "fontes.js"));
// ⚠️ O estado entra aqui só para medir COMPORTAMENTO de pendência (I-6/I-7);
// o conteúdo clínico das superfícies continua sendo o universo declarado.
const R = require(path.join(tmp, "nucleo", "relogio.js"));
const E = require(path.join(tmp, "nucleo", "estado.js"));

const sups = S.SUPERFICIES;
console.log(`universo: ${sups.length} superfície(s) · ${S.pendenciasVigentes().length} pendência(s) inicial(is)`);

// ── identidade ≠ rótulo ────────────────────────────────────────────────────
/**
 * ⚠️⚠️ NOVE, e ⛔ não sete — **P-09 reaberta pelo autor em 2026-08-29**.
 *
 * As sete clínicas de §7.15 continuam intactas, e entraram **dois painéis
 * transversais**: `paciente` e `laboratorio`. Eles ⛔ não são etapas, e é por isso
 * que ⛔ não têm letra.
 */
const comLetra = sups.filter((s) => !s.painel);
const paineis = sups.filter((s) => s.painel);
confere("são nove superfícies: sete etapas e dois painéis",
  sups.length === 9 && comLetra.length === 7 && paineis.length === 2,
  "§7.15 fixou sete janelas clínicas; P-09 acrescentou Paciente e Laboratório como painéis");

/**
 * ⛔⛔ ⛔ NENHUMA LETRA NA APRESENTAÇÃO — autor, 2026-08-30.
 *
 * ⚠️⚠️ O A–G do módulo colidia com o **ABCDE do atendimento**, e o caso que
 * decidiu foi o **D**: aqui *Segurança para trombólise*, lá **Disfunção
 * neurológica** — e o paciente do AVC **tem** disfunção neurológica.
 *
 * ⚠️ E ⛔ nada entrou no lugar: ⛔ nem números, que seriam outra convenção
 * arbitrária. O fluxo ⛔ não tem "próximo obrigatório" — os nomes bastam.
 */
confere("⛔ NENHUMA superfície carrega letra de apresentação",
  sups.every((s) => s.letra === undefined),
  "A–G colidia com o ABCDE do atendimento, e no 'D' as duas leituras eram plausíveis no mesmo paciente");
confere("⛔ e ⛔ nenhuma carrega número no lugar",
  sups.every((s) => s.numero === undefined && s.ordem === undefined),
  "trocar letra por número seria trocar uma convenção arbitrária por outra");
confere("a distinção painel × etapa SOBREVIVEU à remoção da letra",
  paineis.length === 2 && paineis.every((s) => s.painel === true)
  && comLetra.every((s) => s.painel === undefined),
  "ela ⛔ nunca foi sobre a letra: é sobre ser ou ⛔ não ser passo do atendimento");

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



// ── a ordem aprovada pelo autor (2026-08-28) ───────────────────────────────
const ORDEM_APROVADA = [
  ["paciente", "Paciente"],
  ["laboratorio", "Laboratório"],
  ["estabilizacao", "Entrada e estabilização"],
  ["neurologico", "Neurológico"],
  ["imagem", "Imagem"],
  ["seguranca", "Segurança para trombólise"],
  ["correcoes", "Correções"],
  ["reperfusao", "Reperfusão"],
  ["destino", "Destino"],
];
confere("a ordem de apresentação é a aprovada",
  sups.length === ORDEM_APROVADA.length
  && sups.every((s, i) => s.id === ORDEM_APROVADA[i][0]
    && s.titulo === ORDEM_APROVADA[i][1]),
  "a ordem foi decidida pelo autor; mudá-la sem ele é mudar o que o médico vê primeiro");

/**
 * ⚠️ E-11 / §7.2 — ORDEM ⛔ NÃO É FLUXO. Se um dia alguém acrescentar `proxima`,
 * `anterior`, `requer` ou `depende`, a lista deixa de ser ordem de leitura e
 * vira árvore linear obrigatória, que é exatamente o que o AVC ⛔ não pode ter.
 */
/**
 * ⚠️ `painel` entrou em 2026-08-29 e ⛔ **não** é sequência: ela diz que a
 * superfície ⛔ não é etapa — o oposto de `proxima`/`requer`.
 */
const CHAVES_PERMITIDAS = ["id", "letra", "titulo", "resumo", "fontes", "painel"];
confere("nenhuma superfície declara vizinho ou pré-requisito",
  sups.every((s) => Object.keys(s).every((k) => CHAVES_PERMITIDAS.includes(k))),
  "E-11: campo de sequência transformaria apresentação em fluxo obrigatório");

// ── integridade das referências ────────────────────────────────────────────
const ids = new Set(sups.map((s) => s.id));
/**
 * ⚠️⚠️ A PENDÊNCIA PRECISA SER RESOLVÍVEL — E-26: pendência sem condição de
 * resolução é muro, ⛔ não tarefa. Medido em 2026-08-28: `ultima_vez_bem`
 * procurava um campo com o próprio nome, o campo chamava-se
 * `hora_ultima_vez_bem`, e ela ficava aberta para sempre.
 */
confere("toda pendência declara o campo que a resolve",
  S.pendenciasVigentes().every((p) => typeof p.campo === "string" && p.campo.length > 0),
  "E-26: sem campo declarado, a resolução volta a ser dedução por coincidência de nome");

confere("nenhuma pendência deduz o campo do próprio id",
  S.pendenciasVigentes().every((p) => p.resolvePor && p.resolvePor.length > 0),
  "E-26: a condição de resolução é do médico, e precisa estar escrita");

confere("toda pendência aponta para uma superfície existente",
  S.pendenciasVigentes().every((p) => ids.has(p.dono)),
  "E-26: pendência com dono inexistente é muro apontando para a parede errada");

/**
 * ⚠️⚠️ PENDÊNCIA EXIBIDA TEM DE TER CAMPO QUE EXISTE — relato do autor,
 * 2026-08-29: *"aparece como pendência mas não tem isso nessa tela"*.
 *
 * "Tomografia de crânio" apontava para a Superfície de Imagem, ⛔ não construída:
 * tocar levava a "em construção". É **E-26** ao pé da letra — muro, ⛔ não tarefa
 * — e a invariante I-7 do próprio autor: pendência sem mecanismo de resolução
 * REPROVA teste, ⛔ não fica aberta em silêncio.
 *
 * ⚠️ O filtro é DERIVADO dos campos que existem: a pendência declarada volta
 * sozinha quando o campo nascer, e ⛔ não depende de alguém lembrar.
 */
{
  const A = require(path.join(tmp, "conteudo", "superficie-a.js"));
  const B = require(path.join(tmp, "conteudo", "superficie-b.js"));
  const campos = new Set([...A.TODOS_OS_CAMPOS_A, ...B.TODOS_OS_CAMPOS_B].map((c) => c.id));

  confere("toda pendência EXIBIDA tem campo que existe",
    S.pendenciasVigentes().every((p) => campos.has(p.campo)),
    "pendência que aponta para campo inexistente é muro: o médico toca e cai numa tela em construção");

  confere("a pendência de imagem fica declarada, e ⛔ não exibida",
    !S.pendenciasVigentes().some((p) => p.id === "tc_realizada"),
    "a Superfície de Imagem ⛔ não existe — exibi-la seria prometer uma tarefa sem porta");

  confere("⛔ o filtro ⛔ não é lista à mão",
    S.pendenciasVigentes().length > 0 && S.pendenciasVigentes().length < 3,
    "filtro derivado dos campos: a pendência volta sozinha quando a superfície dona nascer");
}

confere("todo slot de fonte citado existe",
  sups.every((s) => s.fontes.every((f) => F.slot(f) !== undefined)),
  "E-30: a fonte é propriedade da afirmação, e endereço morto não é endereço");

/**
 * ⚠️⚠️ I-6 MEDIDA POR COMPORTAMENTO, ⛔ não por presença de campo.
 *
 * Declarar `campo` ⛔ não prova que ele é USADO. As duas metades abaixo separam
 * as duas coisas que antes eram a mesma string por coincidência: uma pendência
 * cujo `id` casa um campo respondido ⛔ continua aberta se o `campo` dela aponta
 * para outro lugar; e uma cujo `campo` casa resolve, mesmo com `id` diferente.
 *
 * ⚠️ Sem estas duas, voltar a filtrar por `id` passaria despercebido — foi
 * exatamente assim que a pendência do último-visto-bem ficou aberta para sempre.
 */
{
  const rel = R.relogioControlado(1_000_000);
  const est = E.registrarFato(E.abrirAtendimento(rel), { campo: "respondido", valor: 1 }, rel);
  const abertas = (p) => E.pendenciasAbertas(est, [p]).length;

  confere("resolução ignora o id e obedece ao campo",
    abertas({ id: "respondido", campo: "outro_campo", rotulo: "x", dono: "estabilizacao", resolvePor: "y" }) === 1,
    "I-6: filtrar por id faria a pendência fechar sem o dado que ela pede");

  confere("campo declarado diferente do id resolve normalmente",
    abertas({ id: "nome_qualquer", campo: "respondido", rotulo: "x", dono: "estabilizacao", resolvePor: "y" }) === 0,
    "I-6: identidade e referência são coisas distintas, e a referência é que resolve");

  confere("pendência sem campo falha alto, não fica aberta calada",
    (() => {
      try {
        E.pendenciasAbertas(est, [{ id: "x", rotulo: "x", dono: "estabilizacao", resolvePor: "y" }]);
        return false;
      } catch { return true; }
    })(),
    "I-7: sem mecanismo de resolução, a pendência tem de reprovar teste — nunca virar muro");
}

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
