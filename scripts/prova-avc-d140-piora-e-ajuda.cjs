#!/usr/bin/env node
/**
 * PROVA · D-140 — «Piora clínica: o que fazer agora» e «Preciso de ajuda» como roteador (autor, 2026-09-16).
 *
 * PROMETE:
 *  (as linhas não marcadas como controle nascem vermelhas no HEAD 9f9a37c)
 *  · depois de registrar a piora, o núcleo devolve as AÇÕES da piora: reavaliar ABCD e repetir o exame neurológico
 *    (NIHSS), sempre; e, com trombolítico em curso ou exposição registrada, as DUAS condutas da Table 7 — as mesmas
 *    palavras de `MONITORIZACAO_POS_IVT.deterioracao.condutas`, ⛔ reescritas;
 *  · interromper a infusão só APARECE com a infusão EM CURSO, e aí é gesto; com exposição já concluída, só a TC de
 *    emergência aparece (correção do autor, 2026-09-16 — ⛔ mandar interromper o que ⛔ está correndo);
 *  · sem trombolítico, a piora mostra só reavaliar ABCD e repetir o NIHSS;
 *  · piora isolada ⛔ diagnostica hemorragia ⛔ nem cria contraindicação: portão, veredito e caminho hemorrágico ficam
 *    idênticos antes e depois de registrar a piora (controle de invariante);
 *  · «Preciso de ajuda» é ROTEADOR: toda opção tem caminho; ⛔ nenhuma tem como texto principal «este módulo não tem
 *    conteúdo»; falta de medicamento e de equipamento levam ao Destino; «não melhorou» leva à reavaliação; «piorou»
 *    abre a piora; registrar conduta externa continua existindo, como ação secundária.
 * NÃO PROMETE: conteúdo clínico novo — nenhuma frase nasce aqui; a tela é medida em `e2e/avc-d140-piora-e-ajuda.spec.ts`.
 * UNIVERSO: `avc/nucleo/deterioracao.ts`, `avc/nucleo/derivacoes-f.ts`, `avc/conteudo/{ajuda,superficie-g}.ts`,
 *   `components/avc/{piora-acoes,preciso-de-ajuda,avc-modulo-screen}.tsx`.
 * FONTE: decisão do autor de 2026-09-16 (D-140 implementar; «Preciso de ajuda» como roteador) e a Table 7 já transcrita
 *   em `avc/conteudo/superficie-g.ts` (`MONITORIZACAO_POS_IVT.deterioracao`).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "d140-"));
const fontes = [
  ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "deterioracao.ts"],
  ["avc", "nucleo", "derivacoes-f.ts"], ["avc", "nucleo", "portao-ivt.ts"], ["avc", "nucleo", "veredito-da-trombolise.ts"],
  ["avc", "nucleo", "caminho-hemorragico.ts"], ["avc", "nucleo", "instancia.ts"],
  ["avc", "conteudo", "campos.ts"], ["avc", "conteudo", "campo.ts"], ["avc", "conteudo", "superficie-f.ts"],
  ["avc", "conteudo", "superficie-g.ts"], ["avc", "conteudo", "ajuda.ts"],
].map((p) => path.join(appDir, ...p));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erro de tipo de dependência ⛔ impede a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const D = emT("avc", "nucleo", "deterioracao.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");
const HN = emT("avc", "nucleo", "caminho-hemorragico.js");
const I = emT("avc", "nucleo", "instancia.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const SG = emT("avc", "conteudo", "superficie-g.js");
const AJ = emT("avc", "conteudo", "ajuda.js");

const linhas = new Map();
function conf(id, nome, cond, porque) {
  const l = linhas.get(id) ?? { ok: 0, falhas: [] };
  if (cond) l.ok++; else l.falhas.push(`${nome} — ${porque}`);
  linhas.set(id, l);
}
function bloco(id, nome, fn) {
  try { fn(); } catch (e) { conf(id, nome, false, `exceção: ${String(e && e.message).slice(0, 180)}`); }
}

const T0 = 1_800_000_000_000;
const MIN = 60_000;
const rel = R.relogioControlado(T0);
const vazio = () => E.abrirAtendimento(rel);
const piora = (e, texto = "") => D.registrarPiora(e, texto, rel);
/** Uma administração com exposição: «Iniciada» (infusão em curso) ⛔ «Administrada/concluída» (exposta, sem infusão). */
const administrada = (e, estadoDaAcao) => {
  const inst = I.nomeDaInstancia(SF.TROMBOLISE_IV, 1);
  let x = K.registrarComInstancia(e, { campo: "ivt_estado", valor: CAMPO.valorDaOpcao(estadoDaAcao) }, rel, inst);
  return K.registrarComInstancia(x, { campo: "ivt_inicio", valor: T0 - 30 * MIN }, rel, inst);
};
const acoes = (e) => (typeof D.acoesDaPioraClinica === "function" ? D.acoesDaPioraClinica(e) : undefined);
const ids = (e) => (acoes(e) ?? []).map((a) => a.id);
const CONDUTAS = SG?.MONITORIZACAO_POS_IVT?.deterioracao?.condutas ?? [];

/* ══ 1 · as ações existem depois da piora ═════════════════════════════════ */
bloco("D140-ACOES", "ações da piora", () => {
  conf("D140-ACOES", "o núcleo expõe as ações da piora (`acoesDaPioraClinica`)", typeof D.acoesDaPioraClinica === "function", "⛔ ausente");
  const semPiora = acoes(vazio());
  conf("D140-ACOES", "sem piora registrada, ⛔ há ações", semPiora !== undefined && semPiora.length === 0, `⛔ ${JSON.stringify(semPiora)}`);
  const comPiora = acoes(piora(vazio()));
  conf("D140-ACOES", "com piora: reavaliar ABCD ⛔ repetir o exame neurológico, nessa ordem",
    JSON.stringify((comPiora ?? []).map((a) => a.id)) === JSON.stringify(["reavaliar_abcd", "repetir_neurologico"]), `⛔ ${JSON.stringify(comPiora)}`);
  conf("D140-ACOES", "cada ação leva a uma superfície do módulo",
    (comPiora ?? []).every((a) => ["estabilizacao", "neurologico"].includes(a.leva)), `⛔ ${JSON.stringify((comPiora ?? []).map((a) => a.leva))}`);
});

/* ══ 2 · Table 7 · só com trombolítico ════════════════════════════════════ */
bloco("D140-TABLE7-EM-CURSO", "infusão em curso", () => {
  const e = piora(administrada(vazio(), "Iniciada"));
  const lista = acoes(e) ?? [];
  conf("D140-TABLE7-EM-CURSO", "as duas condutas da Table 7 entram, com as palavras da fonte",
    CONDUTAS.length === 2 && CONDUTAS.every((c) => lista.some((a) => a.rotulo === c)), `⛔ ${JSON.stringify(lista.map((a) => a.rotulo))}`);
  conf("D140-TABLE7-EM-CURSO", "a conduta da fonte é citada, ⛔ reescrita: a prova lê a constante da Table 7",
    lista.filter((a) => a.fonte === "Table 7").length === 2, `⛔ ${JSON.stringify(lista.map((a) => [a.id, a.fonte]))}`);
  conf("D140-TABLE7-EM-CURSO", "com a infusão EM CURSO, interromper é um gesto (⛔ só leitura)",
    lista.find((a) => a.id === "interromper_infusao")?.gesto === true, `⛔ ${JSON.stringify(lista.find((a) => a.id === "interromper_infusao"))}`);
  conf("D140-TABLE7-EM-CURSO", "a tomografia de emergência ⛔ é gesto: o app ⛔ a executa",
    lista.find((a) => a.id === "tc_de_emergencia")?.gesto !== true, `⛔ ${JSON.stringify(lista.find((a) => a.id === "tc_de_emergencia"))}`);
});
bloco("D140-TABLE7-EXPOSTA", "exposição já concluída", () => {
  const e = piora(administrada(vazio(), "Administrada/concluída"));
  const lista = acoes(e) ?? [];
  /**
   * ⚠️⚠️ CORREÇÃO DO AUTOR, 2026-09-16 — declarada antes de implementar.
   *
   * ⛔ A primeira versão desta linha exigia as DUAS condutas com exposição concluída, com a de
   * interromper apenas sem gesto. ⚠️ O autor foi mais restrito: *«interromper a infusão só pode
   * aparecer quando houver infusão efetivamente em curso»*. ⚠️ Sem infusão correndo, mandar
   * interromper ⛔ é conduta — é ruído numa tela de piora.
   *
   * ⚠️ A conduta da Table 7 continua CITADA palavra por palavra; muda só QUANDO cada uma aparece.
   */
  conf("D140-TABLE7-EXPOSTA", "com exposição concluída, a TC de emergência aparece — com as palavras da fonte",
    lista.some((a) => a.id === "tc_de_emergencia" && a.rotulo === CONDUTAS[1] && a.fonte === "Table 7"),
    `⛔ ${JSON.stringify(lista.map((a) => a.rotulo))}`);
  conf("D140-TABLE7-EXPOSTA", "⛔ interromper a infusão ⛔ aparece: ⛔ há infusão em curso para interromper",
    !lista.some((a) => a.id === "interromper_infusao"), `⛔ ${JSON.stringify(lista.find((a) => a.id === "interromper_infusao"))}`);
});
bloco("D140-SEM-TROMBOLITICO", "controle", () => {
  const lista = acoes(piora(vazio())) ?? [];
  conf("D140-SEM-TROMBOLITICO", "controle: sem trombolítico, só reavaliar ABCD ⛔ repetir o neurológico",
    lista.length === 2 && !lista.some((a) => a.fonte === "Table 7"), `⛔ ${JSON.stringify(lista.map((a) => a.id))}`);
});

/* ══ 3 · piora isolada ⛔ diagnostica ⛔ nem contraindica (invariante) ═════ */
bloco("D140-INVARIANTE", "piora ⛔ muda a decisão", () => {
  const base = administrada(vazio(), "Iniciada");
  const antes = { portao: P.estadoDoPortaoIVT(base, T0), veredito: V.vereditoDaTrombolise(base, T0), hem: HN.caminhoHemorragico(base) };
  const depois = (() => { const e = piora(base, "piorou o exame"); return { portao: P.estadoDoPortaoIVT(e, T0), veredito: V.vereditoDaTrombolise(e, T0), hem: HN.caminhoHemorragico(e) }; })();
  conf("D140-INVARIANTE", "o portão da IVT é o mesmo antes ⛔ depois da piora",
    JSON.stringify(antes.portao) === JSON.stringify(depois.portao), `⛔ ${antes.portao.estado} → ${depois.portao.estado}`);
  conf("D140-INVARIANTE", "o veredito da trombólise ⛔ muda", antes.veredito.tipo === depois.veredito.tipo, `⛔ ${antes.veredito.tipo} → ${depois.veredito.tipo}`);
  conf("D140-INVARIANTE", "a piora ⛔ abre o caminho hemorrágico (⛔ diagnostica hemorragia)",
    antes.hem.ativo === false && depois.hem.ativo === false, `⛔ ${JSON.stringify(depois.hem.ativo)}`);
});

/* ══ 4 · «Preciso de ajuda» como roteador ═════════════════════════════════ */
bloco("AJUDA-ROTEADOR", "opções", () => {
  const ops = AJ?.OPCOES_DE_AJUDA ?? [];
  conf("AJUDA-ROTEADOR", "controle: as cinco opções do PDF continuam", ops.length === 5, `⛔ ${ops.length}`);
  const semCaminho = ops.filter((o) => o.abrePiora !== true && (o.caminhos ?? []).length === 0);
  conf("AJUDA-ROTEADOR", "toda opção leva a um caminho (⛔ termina em anotação)", semCaminho.length === 0, `⛔ ${semCaminho.map((o) => o.id).join(" · ")}`);
  const semConteudo = ops.filter((o) => /não tem conteúdo|⛔ tem conteúdo/i.test(o.texto ?? ""));
  conf("AJUDA-ROTEADOR", "⛔ nenhuma opção tem «este módulo não tem conteúdo» como texto principal",
    semConteudo.length === 0, `⛔ ${semConteudo.map((o) => o.id).join(" · ")}`);
  const destino = (id) => (ops.find((o) => o.id === id)?.caminhos ?? []).map((c) => c.superficie);
  conf("AJUDA-ROTEADOR", "falta de medicamento leva ao Destino (transferência ⛔ telestroke)", destino("sem_medicamento").includes("destino"), `⛔ ${destino("sem_medicamento")}`);
  conf("AJUDA-ROTEADOR", "falta de equipamento leva ao Destino", destino("sem_equipamento").includes("destino"), `⛔ ${destino("sem_equipamento")}`);
  conf("AJUDA-ROTEADOR", "«não sei avaliar» leva a ABCD ⛔ ao neurológico",
    ["estabilizacao", "neurologico"].every((s) => destino("nao_sei_avaliar").includes(s)), `⛔ ${destino("nao_sei_avaliar")}`);
  conf("AJUDA-ROTEADOR", "«não melhorou» leva à reavaliação (ABCD ⛔ neurológico)",
    ["estabilizacao", "neurologico"].every((s) => destino("nao_melhorou").includes(s)), `⛔ ${destino("nao_melhorou")}`);
  conf("AJUDA-ROTEADOR", "controle: «piorou» abre a piora, ⛔ tem caminho próprio", ops.find((o) => o.id === "paciente_piorou")?.abrePiora === true, "⛔");
  conf("AJUDA-ROTEADOR", "controle: registrar conduta externa continua existindo", ops.some((o) => o.registraCondutaExterna === true), "⛔");
});

/* ══ 5 · a tela ═══════════════════════════════════════════════════════════ */
bloco("D140-TELA", "a tela", () => {
  const existe = fs.existsSync(path.join(appDir, "components", "avc", "piora-acoes.tsx"));
  conf("D140-TELA", "existe a tela «Piora clínica — o que fazer agora»", existe, "⛔ componente ausente");
  const tela = existe ? lerFonte(path.join(appDir, "components", "avc", "piora-acoes.tsx")) : "";
  conf("D140-TELA", "ela lê as ações do núcleo, ⛔ redige conduta", /acoesDaPioraClinica/.test(tela), "⛔");
  conf("D140-TELA", "o título é «Piora clínica — o que fazer agora»", /Piora clínica — o que fazer agora/.test(tela), "⛔");
  conf("D140-TELA", "cada ação tem testID próprio", /avc-piora-acao-\$\{/.test(tela) || /testID=\{`avc-piora-acao-/.test(tela), "⛔");
  const modulo = lerFonte(path.join(appDir, "components", "avc", "avc-modulo-screen.tsx"));
  /**
   * ⚠️⚠️ AJUSTE CONSCIENTE (2026-09-16) — a versão anterior era UM regex de nome
   * (`/PioraAcoes|avc-piora-acoes/`) sobre o arquivo inteiro. ⛔ Ela reprovava por
   * DESCASAMENTO DE NOME (o componente chama-se `DialogoDaPioraClinica`), ⛔ e ⛔ não por
   * falta de comportamento — ⛔ e passaria com o nome certo ⛔ em qualquer lugar do
   * arquivo, ⛔ até solto num comentário.
   *
   * ⚠️ Trocada por TRÊS exigências, ⛔ e ⛔ isto é mais apertado, ⛔ não menos: o módulo
   * IMPORTA a tela, MONTA a tela ⛔ e a ABRE **dentro de `registrarPioraDaTela`** — ⛔ o
   * vínculo que o autor pediu («após registrar a piora, abrir uma tela»).
   */
  const corpoDoRegistro = (modulo.match(/function registrarPioraDaTela[\s\S]*?\n {2}\}/) ?? [""])[0];
  conf("D140-TELA", "o módulo importa ⛔ e monta a tela de ações",
    /from "\.\/piora-acoes"/.test(modulo) && /<DialogoDaPioraClinica/.test(modulo), "⛔ importada ou ⛔ montada");
  conf("D140-TELA", "registrar a piora abre a tela de ações",
    corpoDoRegistro !== "" && /\(true\)/.test(corpoDoRegistro), "⛔ a tela ⛔ é aberta pelo registro");
  /**
   * ⚠️⚠️ TRAVA PEDIDA PELO AUTOR (2026-09-16): dispensar a tela ⛔ toca no fato de piora.
   * ⚠️ O comportamento é medido no e2e; AQUI se trava a FORMA: o `onFechar` só pode virar
   * um booleano — ⛔ `setEstado`, ⛔ `corrigir…`, ⛔ nada que escreva na trilha. ⚠️ Isto
   * impede que alguém, um dia, pendure uma correção «por engano» no botão de dispensar.
   */
  conf("D140-TELA", "dispensar a tela ⛔ escreve na trilha: `onFechar` só fecha",
    /onFechar=\{\(\) => setAcoesDaPioraAbertas\(false\)\}/.test(modulo), "⛔ o fechar faz mais do que fechar");
  const ajuda = lerFonte(path.join(appDir, "components", "avc", "preciso-de-ajuda.tsx"));
  conf("D140-TELA", "no «Preciso de ajuda», registrar conduta externa é ação secundária",
    /secundari|secundária|acaoSecundaria/i.test(ajuda), "⛔ o campo de anotação continua no caminho principal");
});

const ordem = ["D140-ACOES", "D140-TABLE7-EM-CURSO", "D140-TABLE7-EXPOSTA", "D140-SEM-TROMBOLITICO", "D140-INVARIANTE", "AJUDA-ROTEADOR", "D140-TELA"];
let verdes = 0, vermelhas = 0;
for (const id of ordem) {
  const l = linhas.get(id) ?? { ok: 0, falhas: ["linha sem asserção"] };
  if (l.falhas.length === 0) { verdes++; console.log(`🟢 ${id.padEnd(22)} ${l.ok} ok`); }
  else { vermelhas++; console.log(`🔴 ${id.padEnd(22)} ${l.ok} ok · ${l.falhas.length} falha(s)`); for (const f of l.falhas) console.log(`      ✗ ${f}`); }
}
console.log(`\n${vermelhas === 0 ? "✅" : "❌"} PROVA · D-140 — ${verdes} linha(s) verde(s) · ${vermelhas} linha(s) vermelha(s)`);
process.exit(vermelhas === 0 ? 0 : 1);
