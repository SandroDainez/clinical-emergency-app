#!/usr/bin/env node
/**
 * PROVA · 12ª RODADA DO AVC · ENTREGA 1 — AC-71 (estimativa aceita futuro), AC-72
 * (teleconsulta por marcos), AC-73 (correção por engano sempre no evento) ⛔ e nome de
 * exame que ⛔ trunca. Decisões do autor, 2026-09-13 (`docs/decisoes.md`, 12ª rodada).
 *
 * PROMETE:
 *  · AC-71: o campo rotulado como estimativa (previsão do transporte) é declarado
 *    estimativa ⛔ e o seletor de hora tem teto só para horário observado; os marcos
 *    observados (transferência, teleconsulta) ⛔ passam como estimativa.
 *  · AC-72: teleconsulta ⛔ tem campo de estado; marcos solicitada · em andamento · parecer
 *    registrado · não disponível; parecer exige texto ⛔ e autor; o parecer mora no marco
 *    (hora = horário observado); corrigir o horário mantém o parecer; engano no marco do
 *    parecer tira a avaliação especializada ⛔ e ⛔ mexe nos outros marcos.
 *  · AC-73: a linha do tempo oferece a correção por engano no evento de piora, ligada à
 *    mesma regra do AC-67.
 *  · Nome de exame: a linha de prioridade da imagem ⛔ limita linhas do título.
 * NÃO PROMETE: o gesto a 375 px, o horário futuro gravado de fato ⛔ e a medição de
 *   truncamento no navegador (isso é `e2e/avc-rodada12.spec.ts`).
 * UNIVERSO: `avc/conteudo/{campo,superficie-g}.ts`, `avc/nucleo/transferencia.ts`,
 *   `components/avc/{seletor-de-hora,campos-clinicos,marcos-da-transferencia,superficie-g,
 *   avc-modulo-screen}.tsx`.
 * FONTE: `docs/decisoes.md` — 12ª rodada. ⛔ Nenhum conteúdo clínico novo.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rodada12-"));
let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
const arq = (...p) => path.join(appDir, ...p);
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop", "--jsx", "react-jsx",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp,
    arq("avc", "nucleo", "estado.ts"), arq("avc", "nucleo", "relogio.ts"), arq("avc", "nucleo", "transferencia.ts"),
    arq("avc", "nucleo", "sintese-do-caso.ts"), arq("avc", "conteudo", "campos.ts")], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => require(path.join(tmp, ...p));
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const T = emT("avc", "nucleo", "transferencia.js");
const S = emT("avc", "nucleo", "sintese-do-caso.js");
const K = emT("avc", "conteudo", "campos.js");
const MIN = 60_000;

/* ══ AC-71 ══════════════════════════════════════════════════════════════ */
{
  const previsao = K.campoDoModulo("transf_previsao");
  conf("AC-71 · a previsão do transporte é declarada ESTIMATIVA", previsao !== undefined && previsao.estimativa === true, `⛔ ${JSON.stringify(previsao)}`);
  const seletor = lerFonte(arq("components", "avc", "seletor-de-hora.tsx"));
  conf("AC-71 · o seletor recebe «estimativa» ⛔ e o teto só vale para horário observado",
    /estimativa\??:\s*boolean/.test(seletor) && /estimativa\s*\?\s*Infinity\s*:\s*agora/.test(seletor), "⛔ seletor sem distinção previsão × fato");
  const campoDeHora = lerFonte(arq("components", "avc", "campos-clinicos.tsx"));
  conf("AC-71 · o campo de hora repassa a declaração do conteúdo", /estimativa=\{campo\.estimativa === true\}/.test(campoDeHora), "⛔ CampoDeHora ⛔ repassa");
  const marcos = lerFonte(arq("components", "avc", "marcos-da-transferencia.tsx"));
  conf("AC-71 · marcos OBSERVADOS ⛔ usam o seletor como estimativa", !/estimativa/.test(marcos.replace(/rotulo[^\n]*/g, "")), "⛔ marco observado aceitando futuro");
}

/* ══ AC-72 ══════════════════════════════════════════════════════════════ */
conf("AC-72 · teleconsulta ⛔ tem campo de estado nem hora de parecer avulsa; tem marco",
  !K.todosOsCampos().some((c) => c.id === "tele_estado" || c.id === "tele_parecer_hora") && K.todosOsCampos().some((c) => c.id === "tele_marco"),
  `⛔ ${K.todosOsCampos().filter((c) => c.id.startsWith("tele_")).map((c) => c.id)}`);
conf("AC-72 · as ações de marco da teleconsulta existem", typeof T.registrarMarcoDeTeleconsulta === "function" && typeof T.marcosDaTeleconsulta === "function",
  "⛔ registrarMarcoDeTeleconsulta / marcosDaTeleconsulta ausentes");
if (typeof T.registrarMarcoDeTeleconsulta === "function") {
  const rel = R.relogioControlado(1_800_000_000_000);
  const t = rel.agora();
  let e = T.registrarMarcoDeTeleconsulta(E.abrirAtendimento(rel), "Solicitada", t - 20 * MIN, rel);
  const semTexto = T.registrarMarcoDeTeleconsulta(e, "Parecer registrado", t - 5 * MIN, rel, { texto: "  ", autor: "Dra. Neuro" });
  const semAutor = T.registrarMarcoDeTeleconsulta(e, "Parecer registrado", t - 5 * MIN, rel, { texto: "trombectomia a discutir", autor: "" });
  conf("AC-72 · parecer ⛔ entra sem texto ⛔ ou sem autor", semTexto.fatos.length === e.fatos.length && semAutor.fatos.length === e.fatos.length, "⛔ parecer incompleto registrado");
  e = T.registrarMarcoDeTeleconsulta(e, "Em andamento", t - 15 * MIN, rel);
  rel.avancar(2 * MIN);
  e = T.registrarMarcoDeTeleconsulta(e, "Parecer registrado", t - 5 * MIN, rel, { texto: " texto do parecer ", autor: " Dra. Neuro " });
  const esp = T.avaliacaoEspecializadaRegistrada(e);
  conf("AC-72 · parecer no marco: texto, autor ⛔ e hora = horário observado", esp !== undefined && esp.texto === "texto do parecer" && esp.autor === "Dra. Neuro" && esp.quando === t - 5 * MIN,
    `⛔ ${JSON.stringify(esp)}`);
  conf("AC-72 · síntese: «Avaliação especializada registrada»", S.sinteseDoCaso(e, rel, []).situacao.some((l) => l.id === "avaliacao-especializada"), "⛔");
  const marcos = T.marcosDaTeleconsulta(e);
  conf("AC-72 · três marcos em ordem observada", marcos.map((m) => m.tipo).join(">") === "Solicitada>Em andamento>Parecer registrado", `⛔ ${marcos.map((m) => m.tipo)}`);
  const item = T.linhaDoTempoDoCaso(e).find((i) => i.texto === "Avaliação especializada registrada");
  conf("AC-72 · linha do tempo: parecer com texto — autor ⛔ e os dois horários",
    item !== undefined && item.detalhe === "texto do parecer — Dra. Neuro" && item.quando === t - 5 * MIN && item.registradoEm === t + 2 * MIN, `⛔ ${JSON.stringify(item)}`);
  const parecerId = marcos[2].fatoId;
  const horaCorrigida = T.corrigirHorarioDoMarco(e, parecerId, t - 7 * MIN, rel);
  const esp2 = T.avaliacaoEspecializadaRegistrada(horaCorrigida);
  conf("AC-72 · corrigir o horário do parecer mantém texto ⛔ e autor", esp2 !== undefined && esp2.quando === t - 7 * MIN && esp2.texto === "texto do parecer", `⛔ ${JSON.stringify(esp2)}`);
  const engano = T.marcoPorEngano(horaCorrigida, T.marcosDaTeleconsulta(horaCorrigida)[2].fatoId, rel);
  conf("AC-72 · engano no parecer tira a avaliação especializada ⛔ e ⛔ mexe nos outros marcos",
    T.avaliacaoEspecializadaRegistrada(engano) === undefined && T.marcosDaTeleconsulta(engano).map((m) => m.tipo).join(">") === "Solicitada>Em andamento",
    `⛔ ${JSON.stringify(T.marcosDaTeleconsulta(engano))}`);
  conf("AC-72 · «Não disponível» é marco da linha do tempo",
    T.linhaDoTempoDoCaso(T.registrarMarcoDeTeleconsulta(E.abrirAtendimento(rel), "Não disponível", t, rel)).some((i) => i.texto === "Teleconsulta não disponível"), "⛔");
  conf("AC-72 · marco da transferência ⛔ vira marco de teleconsulta (campos separados)",
    T.marcosDaTransferencia(e).length === 0 && T.marcosDaTeleconsulta(T.registrarMarco(E.abrirAtendimento(rel), "Solicitada", t, rel)).length === 0, "⛔ campos misturados");
}

/* ══ AC-73 ══════════════════════════════════════════════════════════════ */
{
  const g = lerFonte(arq("components", "avc", "superficie-g.tsx"));
  conf("AC-73 · a linha do tempo oferece «registrado por engano» no evento de piora",
    /avc-g-tempo-engano-/.test(g) && /item\.ator === "piora"/.test(g) && /onPioraPorEngano\(/.test(g), "⛔ sem correção no evento");
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  conf("AC-73 · a tela liga a correção do evento à regra do AC-67", /onPioraPorEngano=\{[^}]*corrigirPioraPorEngano/.test(tela), "⛔ onPioraPorEngano ⛔ usa corrigirPioraPorEngano");
}

/* ══ NOME DE EXAME ⛔ TRUNCA ═════════════════════════════════════════════ */
{
  const tela = lerFonte(arq("components", "avc", "avc-modulo-screen.tsx"));
  const titulo = (tela.match(/<Text style=\{s\.imagemLinhaTexto\}[^>]*>/) || [""])[0];
  conf("o título do exame na linha de prioridade ⛔ tem numberOfLines", titulo !== "" && !/numberOfLines/.test(titulo), `⛔ ${titulo}`);
}

console.log(`\n${falhas === 0 ? "✅" : "🔴"} PROVA · 12ª RODADA · ENTREGA 1 — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
