#!/usr/bin/env node
/**
 * PROVA — PORTÃO DE POPULAÇÃO na entrada do AVC · AC-03 de
 * `docs/avc/auditoria-vs-spec.md`.
 *
 * PROMETE: que menor de 18 anos, gestante ou puérpera informados em Paciente
 * levam a "Fora do escopo validado — encaminhar"; que idade ou gestação/puerpério
 * desconhecidos ⛔ não viram adulto e mantêm a pergunta; que só a Estabilização
 * fica aberta antes de a população ser validada; e que dose calculada por peso só
 * aparece para adulto não gestante e não puérpera.
 * NÃO PROMETE: nenhuma conduta para essas populações — a única é encaminhar.
 * UNIVERSO: `avc/nucleo/populacao.ts`, `avc/conteudo/paciente.ts`,
 * `components/avc/avc-modulo-screen.tsx`, `components/avc/superficie-f.tsx`.
 * FONTE: `protocols/fontes-verbatim/escopo-populacional-avc.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "populacao-"));
const alvos = [
  ["avc", "nucleo", "populacao.ts"],
  ["avc", "nucleo", "estado.ts"],
  ["avc", "nucleo", "relogio.ts"],
  ["avc", "conteudo", "paciente.ts"],
  ["avc", "conteudo", "superficies.ts"],
  ["avc", "conteudo", "campo.ts"],
].map((p) => path.join(appDir, ...p)).filter((p) => fs.existsSync(p));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp, ...alvos,
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const ler = (...p) => fs.readFileSync(path.join(appDir, ...p), "utf8");
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const PAC = emT("avc", "conteudo", "paciente.js");
const SUP = emT("avc", "conteudo", "superficies.js");
const CAMPO = emT("avc", "conteudo", "campo.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}

let P;
try { P = emT("avc", "nucleo", "populacao.js"); } catch (e) {
  conf("avc/nucleo/populacao.ts existe", false, `⛔ ${String(e && e.message).slice(0, 120)}`);
}
const temP = P !== undefined;

const ADULTO = "18 anos ou mais";
const MENOR = "Menos de 18 anos";
const NAO_GP = "Não gestante e não puérpera";
const GEST = "Gestante";
const PUERP = "Puérpera";
const NS = CAMPO.NAO_SEI;

/* ══ 1 · os dois campos, em Paciente ════════════════════════════════════════ */

const campo = (id) => PAC.TODOS_OS_CAMPOS_P.find((c) => c.id === id);
conf("campo `faixa_etaria` em Paciente, com três opções",
  campo("faixa_etaria") !== undefined
  && JSON.stringify(campo("faixa_etaria").opcoes) === JSON.stringify([ADULTO, MENOR, NS]),
  `⛔ ${JSON.stringify(campo("faixa_etaria"))}`);
conf("campo `gestacao_puerperio` em Paciente, com quatro opções",
  campo("gestacao_puerperio") !== undefined
  && JSON.stringify(campo("gestacao_puerperio").opcoes) === JSON.stringify([NAO_GP, GEST, PUERP, NS]),
  `⛔ ${JSON.stringify(campo("gestacao_puerperio"))}`);

/* ══ 2 · o estado da população, combinação por combinação ═══════════════════ */

const rel = R.relogioControlado(1_800_000_000_000);
const op = (e, c, rotulo) => E.registrarFato(e, { campo: c, valor: CAMPO.valorDaOpcao(rotulo) }, rel);
function caso(faixa, gest) {
  let e = E.abrirAtendimento(rel);
  if (faixa !== undefined) e = op(e, "faixa_etaria", faixa);
  if (gest !== undefined) e = op(e, "gestacao_puerperio", gest);
  return e;
}
const estadoDe = (e) => (temP ? P.estadoDaPopulacao(e) : undefined);

conf("vazio → pergunta pendente, nomeando os dois campos",
  temP && estadoDe(caso()).estado === "pergunta_pendente"
  && ["faixa_etaria", "gestacao_puerperio"].every((c) => estadoDe(caso()).faltam.includes(c)),
  `⛔ ${JSON.stringify(estadoDe(caso()))}`);
conf("menos de 18 anos → fora do escopo, mesmo com gestação sem resposta",
  temP && estadoDe(caso(MENOR)).estado === "fora_do_escopo" && estadoDe(caso(MENOR)).motivos.includes("menor_de_18"),
  `⛔ ${JSON.stringify(estadoDe(caso(MENOR)))}`);
conf("gestante → fora do escopo",
  temP && estadoDe(caso(ADULTO, GEST)).estado === "fora_do_escopo" && estadoDe(caso(ADULTO, GEST)).motivos.includes("gestante"),
  `⛔ ${JSON.stringify(estadoDe(caso(ADULTO, GEST)))}`);
conf("puérpera → fora do escopo",
  temP && estadoDe(caso(ADULTO, PUERP)).estado === "fora_do_escopo" && estadoDe(caso(ADULTO, PUERP)).motivos.includes("puerpera"),
  `⛔ ${JSON.stringify(estadoDe(caso(ADULTO, PUERP)))}`);
conf("idade «não sei» ⛔ não é adulto: a pergunta continua",
  temP && estadoDe(caso(NS, NAO_GP)).estado === "pergunta_pendente" && estadoDe(caso(NS, NAO_GP)).faltam.includes("faixa_etaria"),
  `⛔ ${JSON.stringify(estadoDe(caso(NS, NAO_GP)))}`);
conf("gestação «não sei» ⛔ não é negativo: a pergunta continua",
  temP && estadoDe(caso(ADULTO, NS)).estado === "pergunta_pendente" && estadoDe(caso(ADULTO, NS)).faltam.includes("gestacao_puerperio"),
  `⛔ ${JSON.stringify(estadoDe(caso(ADULTO, NS)))}`);
conf("adulto, não gestante e não puérpera → validado",
  temP && estadoDe(caso(ADULTO, NAO_GP)).estado === "adulto_validado",
  `⛔ ${JSON.stringify(estadoDe(caso(ADULTO, NAO_GP)))}`);

const violacoes = [];
for (const f of [undefined, ADULTO, MENOR, NS]) {
  for (const g of [undefined, NAO_GP, GEST, PUERP, NS]) {
    if (!temP) continue;
    const esperado = f === MENOR || g === GEST || g === PUERP
      ? "fora_do_escopo"
      : f === ADULTO && g === NAO_GP ? "adulto_validado" : "pergunta_pendente";
    const obtido = estadoDe(caso(f, g)).estado;
    if (obtido !== esperado) violacoes.push({ f, g, esperado, obtido });
  }
}
conf("propriedade: só «adulto + não gestante e não puérpera» valida, em 20 combinações",
  temP && violacoes.length === 0, `⛔ ${JSON.stringify(violacoes)}`);

conf('a mensagem é exatamente "Fora do escopo validado — encaminhar"',
  temP && P.MENSAGEM_FORA_DO_ESCOPO === "Fora do escopo validado — encaminhar",
  `⛔ ${JSON.stringify(temP && P.MENSAGEM_FORA_DO_ESCOPO)}`);

/* ══ 3 · o que o portão retém ═══════════════════════════════════════════════ */

const retencoes = [];
for (const [rotulo, e, validado] of [
  ["pendente", caso(), false], ["fora", caso(MENOR), false], ["validado", caso(ADULTO, NAO_GP), true],
]) {
  for (const s of SUP.SUPERFICIES) {
    if (!temP) continue;
    const esperado = validado ? false : s.id !== "estabilizacao";
    if (P.superficieRetidaPeloPortao(e, s.id) !== esperado) retencoes.push({ rotulo, id: s.id, esperado });
  }
}
conf("antes de validar, só a Estabilização abre; depois, todas",
  temP && retencoes.length === 0, `⛔ ${JSON.stringify(retencoes)}`);

conf("dose por peso: ⛔ pendente, ⛔ fora, ✓ validado",
  temP && P.exibeDosePorPeso(caso()) === false && P.exibeDosePorPeso(caso(MENOR)) === false
  && P.exibeDosePorPeso(caso(ADULTO, PUERP)) === false && P.exibeDosePorPeso(caso(NS, NAO_GP)) === false
  && P.exibeDosePorPeso(caso(ADULTO, NAO_GP)) === true,
  "⛔ exibeDosePorPeso não segue o estado da população");

/* ══ 4 · sem conteúdo clínico novo, e a tela obedece ════════════════════════ */

const fontePortao = fs.existsSync(path.join(appDir, "avc", "nucleo", "populacao.ts")) ? ler("avc", "nucleo", "populacao.ts") : "";
conf("o portão ⛔ não carrega dose, unidade ⛔ nem número clínico",
  fontePortao.length > 0 && !/\b\d+(?:[.,]\d+)?\s*(mg|mcg|UI|mL|kg|mmHg)\b/i.test(fontePortao),
  "⛔ avc/nucleo/populacao.ts ausente ou com número clínico");
conf("a Reperfusão só mostra dose por peso depois de consultar o portão",
  /exibeDosePorPeso\(/.test(ler("components", "avc", "superficie-f.tsx")),
  "⛔ components/avc/superficie-f.tsx não consulta exibeDosePorPeso");
conf("a tela do módulo consulta o portão antes de desenhar a superfície",
  /superficieRetidaPeloPortao\(/.test(ler("components", "avc", "avc-modulo-screen.tsx")),
  "⛔ components/avc/avc-modulo-screen.tsx não consulta superficieRetidaPeloPortao");

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA PORTÃO DE POPULAÇÃO — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
