#!/usr/bin/env node
/**
 * TRAVA DAS AMEAÇAS IMEDIATAS — ⛔ o eixo ⛔ NÃO pode afirmar o negativo.
 *
 * PROMETE: que ⛔ nenhum eixo da checagem inicial diga *"avaliado, sem ameaça"*
 *   a partir de um valor que ⛔ não é resposta negativa — seleção múltipla
 *   preenchida, campo desfeito ⛔ ou ignorância declarada.
 *
 * NÃO PROMETE: que os quatro eixos sejam os certos, ⛔ nem que os cortes de PA
 *   ⛔ e glicemia estejam corretos — ⛔ isso é F-04 ⛔ e F-06.
 *
 * UNIVERSO: `avc/nucleo/ameacas-imediatas.ts`.
 *
 * ── ⚠️⚠️ O BUG QUE ORIGINOU (auditoria de 2026-09-06) ──────────────────────
 *
 * ⛔ A primeira versão lia os campos por conta própria: *"se ⛔ não é `sim`,
 * ⛔ então é `sem_ameaca`"*. ⚠️ `disfuncao_bulbar` é seleção **múltipla**: o
 * estado guarda os rótulos unidos por separador, ⛔ e ⛔ nunca `"sim"`.
 *
 * ⛔ Um paciente com tosse ineficaz ⛔ e acúmulo de saliva caía no `else`, ⛔ e a
 * tela desenhava **✓ "Avaliado"** na via aérea dele. ⛔ ⛔ Isso ⛔ não é *"a
 * ameaça ⛔ não acendeu"*: é o app **afirmando o negativo** (**E-23**).
 *
 * ⚠️⚠️ ⛔ E O AVISO JÁ ESTAVA ESCRITO em `leitura.ts`, em letras garrafais:
 * *"⛔ NUNCA LER ESSE CAMPO POR `ternario()`: cinco achados presentes lidos
 * como 'não há disfunção'."* ⛔ A leitura foi reimplementada por fora, ⛔ e caiu
 * exatamente nela — a duplicação que **I6** existe para impedir.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ameacas-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tmp, path.join(appDir, "avc", "nucleo", "ameacas-imediatas.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

/**
 * ⚠️ O `rootDir` que o `tsc` calcula depende de onde estão os imports: com tudo
 * em `avc/nucleo`, a saída fica **plana**; com um import de `avc/conteudo`, ela
 * ganha a árvore. ⛔ Fixar um dos dois caminhos quebraria na primeira vez que um
 * import novo mudasse a raiz — ⛔ então a prova **procura**.
 */
function achar(nome) {
  const pilha = [tmp];
  while (pilha.length > 0) {
    const dir = pilha.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const alvo = path.join(dir, e.name);
      if (e.isDirectory()) pilha.push(alvo);
      else if (e.name === nome) return alvo;
    }
  }
  throw new Error(`⛔ compilado ⛔ não encontrado: ${nome}`);
}

const A = require(achar("ameacas-imediatas.js"));
const E = require(achar("estado.js"));
const I = require(achar("instancia.js"));

const relogio = { agora: () => 1000000 };

/**
 * ⚠️ O RECORD SEPARATOR é privado de `selecao.ts` — ⛔ e aqui ele é reproduzido
 * de propósito, porque a prova precisa simular **o que a tela grava**, ⛔ e ⛔ não
 * o que a API pública oferece. ⛔ Se o separador mudar, esta prova quebra — ⛔ e
 * ⛔ isso é desejável: ela deixaria de reproduzir o caso real.
 */
const SEP = "";

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const novo = () => E.abrirAtendimento(relogio);
const com = (e, campo, valor) => E.registrarFato(e, { campo, valor }, relogio);
const eixo = (e, id) => A.ameacasImediatas(e).find((x) => x.id === id);

/* ══ ⚠️⚠️ O CASO QUE ESTAVA QUEBRADO ═════════════════════════════════════ */
{
  let e = novo();
  e = com(e, "consciencia_rebaixada", "nao");
  e = com(e, "disfuncao_bulbar", `Tosse fraca ou ineficaz${SEP}Acúmulo de saliva ou secreção`);
  const a = eixo(e, "via_aerea");
  conf(
    "⚠️⚠️ disfunção bulbar marcada ACENDE a via aérea",
    a.estado === "ameaca",
    `⛔ estado="${a.estado}" — antes da correção lia "sem_ameaca", ⛔ e a tela desenhava ✓ Avaliado num paciente que engasga`
  );
}

/* ══ ⚠️ DESFAZER ⛔ NÃO É AVALIAR ════════════════════════════════════════ */
{
  let e = novo();
  e = com(e, "pas", 190);
  e = E.desfazerRegistro(e, "pas", relogio);
  const a = eixo(e, "pressao");
  conf(
    "⚠️ campo desfeito ⛔ NÃO vira avaliado",
    a.estado === "nao_avaliado",
    `⛔ estado="${a.estado}" — desfazer grava \`nao_perguntado\`, que TEM valor; a checagem antiga o aceitava como medida`
  );
}

/* ══ ⚠️ IGNORÂNCIA DECLARADA ⛔ NÃO É ACHADO NEGATIVO (E-37) ═════════════ */
{
  let e = novo();
  e = com(e, "hipoxia", "nao_sei");
  const a = eixo(e, "respiracao");
  conf(
    '⚠️ "⛔ não sei" ⛔ NÃO vira sem_ameaca',
    a.estado === "nao_avaliado",
    `⛔ estado="${a.estado}"`
  );
}

/* ══ ⚠️ E O NEGATIVO LEGÍTIMO CONTINUA FUNCIONANDO ══════════════════════ */
{
  let e = novo();
  e = com(e, "hipoxia", "nao");
  const a = eixo(e, "respiracao");
  conf(
    '⚠️ resposta "⛔ não" vira sem_ameaca',
    a.estado === "sem_ameaca",
    `⛔ estado="${a.estado}" — a trava ⛔ não pode impedir o achado negativo REAL`
  );
}

/* ══ ⚠️ AMEAÇA COM CORTE TRANSCRITO ═════════════════════════════════════ */
{
  /**
   * ⚠️⚠️ A PA ENTRA POR **INSTÂNCIA**, ⛔ e ⛔ não como fato solto — ⛔ e a
   * primeira versão desta prova errou nisso.
   *
   * ⚠️ `pressaoArterial()` exige que sistólica ⛔ e diastólica venham da
   * **mesma aferição** (D-120): lendo campo a campo, a sistólica das 14h se
   * juntaria à diastólica das 15h ⛔ e o app exibiria uma pressão que ⛔ nunca
   * existiu. ⛔ A prova precisa simular o gesto real, ⛔ e ⛔ não um atalho.
   */
  let e = novo();
  const inst = I.instanciaParaRegistrar(e, "pa");
  e = E.registrarFato(e, { campo: "pas", valor: 198, instancia: inst }, relogio);
  e = E.registrarFato(e, { campo: "pad", valor: 112, instancia: inst }, relogio);
  const a = eixo(e, "pressao");
  conf(
    "⚠️ PA acima do limite pré-IVT acende o eixo C, com o achado nomeado",
    a.estado === "ameaca" && typeof a.achado === "string" && a.achado.length > 0,
    `⛔ estado="${a.estado}" · achado=${JSON.stringify(a.achado)}`
  );
}

/* ══ ⚠️⚠️ O NÚMERO VIAJA COM O JULGAMENTO ═══════════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ ELES ⛔ NÃO PODEM VOLTAR A MORAR EM BLOCOS DIFERENTES.
   *
   * ⛔ PA ⛔ e glicemia apareciam num card de vitais (o **número**) ⛔ e nos eixos
   * (o **julgamento**), separados pelo card da tomografia. ⚠️ Com PA 198/112 o
   * médico lia *"198/112"* num lugar ⛔ e *"acima da meta pré-trombólise"*
   * noutro — ⛔ dois blocos para entender um fato só.
   */
  let e = novo();
  const inst = I.instanciaParaRegistrar(e, "pa");
  e = E.registrarFato(e, { campo: "pas", valor: 198, instancia: inst }, relogio);
  e = E.registrarFato(e, { campo: "pad", valor: 112, instancia: inst }, relogio);
  e = com(e, "glicemia", 48);
  const c = eixo(e, "pressao");
  const d = eixo(e, "glicemia");
  conf(
    "⚠️⚠️ o eixo carrega o VALOR MEDIDO junto do achado",
    c.valor === "198/112" && c.unidade === "mmHg" && typeof c.achado === "string"
      && d.valor === "48" && d.unidade === "mg/dL" && typeof d.achado === "string",
    `⛔ C=${JSON.stringify({ v: c.valor, u: c.unidade })} · D=${JSON.stringify({ v: d.valor, u: d.unidade })}`
  );
  conf(
    "⚠️ a sistólica ⛔ e a diastólica vêm da MESMA aferição",
    c.valor === "198/112",
    "⛔ lendo campo a campo, a sistólica das 14h se juntaria à diastólica das 15h (D-120)"
  );
}

/* ══ ⚠️ ATENDIMENTO VAZIO: ⛔ NENHUM EIXO AFIRMA ⛔ NADA ══════════════════ */
{
  const lista = A.ameacasImediatas(novo());
  conf(
    "⚠️ atendimento vazio deixa os quatro eixos em ⛔ NÃO avaliado, ⛔ e ⛔ sem valor",
    lista.length === 4 && lista.every((a) => a.estado === "nao_avaliado" && a.valor === undefined),
    `⛔ ${lista.map((a) => `${a.id}=${a.estado}`).join(" · ")}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ AMEAÇAS IMEDIATAS — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ AMEAÇAS IMEDIATAS — ${ok}/${ok} conferências · 4 eixos`);
