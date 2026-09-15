#!/usr/bin/env node
/**
 * PROVA · AC-15 · SUSPEITA DE HSA — primeiro conjunto de provas vermelhas (autor, 2026-09-15).
 *
 * PROMETE: medir, no núcleo, as linhas autorizadas da matriz do AC-15 (versão 4):
 *  · A0: um derivado único `estadoDaSuspeitaDeHsa` com estados nomeados (NAO_AVALIADA, SEM_SUSPEITA, ATIVA);
 *  · A1–A12, A17–A20: histórico, correção, desfazer, «Incerto» ativo (E1), «Não» posterior que ⛔ desativa
 *    (Sim → Não e Incerto → Não, E2), «Limpar» que ⛔ toca exames (E11), déficit/NIHSS/horários que ⛔ abrem a
 *    suspeita, e nenhuma leitura direta de `suspeita_hsa` fora do derivado;
 *  · A3b/A4/A5/A6/A9 (E13): suspeita ativa («Sim» ou «Incerto») fica visível na Imagem, nas pendências ⛔ na síntese
 *    com linguagem de INVESTIGAÇÃO; ⛔ nunca «manejo» de HSA confirmada;
 *  · A21a (invariante do bloco A): evidência confirmatória legada («Subaracnóidea») vence «Não» ⛔ «Limpar» no derivado
 *    (HSA_CONFIRMADA), sem corrigir o exame; o nome «HIC» do legado é medido em D8 (bloco D);
 *  · VERMELHAS DECLARADAS (autor, 2026-09-15): a prova passa só quando as linhas vermelhas observadas são EXATAMENTE
 *    as declaradas; uma vermelha a mais ⛔ uma verde a mais reprovam, e cada bloco remove da lista o que tornou verde;
 *  · C10: nenhuma regra temporal punção lombar → IVT (C3); C12: o motivo da HSA segue sem `leva`;
 *  · D1, D2, D7–D11: valores persistidos do resultado da TC intactos, legado lido igual, HIC ⛔ HSA confirmada
 *    separadas (E9), sem queda silenciosa no catálogo de HSA, par es-419 da terceira opção (E9b).
 * NÃO PROMETE: as rotas de resolução (B), a punção lombar e a conclusão (C1–C9, C11), nem a tela (e2e
 *   `e2e/avc-ac15-hsa.spec.ts`); nenhuma regra clínica nova; nenhuma citação literal da AHA/ASA 2023.
 * UNIVERSO: `avc/nucleo/{estado,derivacoes-c,portao-ivt,veredito-da-trombectomia,sintese-do-caso,caminho-hemorragico,limpar-auditado,instancia}.ts`,
 *   `avc/conteudo/{campos,campo,superficie-c,caminho-hemorragico}.ts`, `avc/persistencia/log.ts`,
 *   `components/avc/{superficie-c,superficie-g}.tsx`, `lib/i18n/modules/avc-modulo.ts`.
 * FONTE: `docs/decisoes.md` (19ª rodada §1 C1–C4; complemento D1, D3); decisões do autor de 2026-09-15 (E1–E12).
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ac15-hsa-"));
const fontes = [
  ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "derivacoes-c.ts"], ["avc", "nucleo", "portao-ivt.ts"],
  ["avc", "nucleo", "veredito-da-trombectomia.ts"], ["avc", "nucleo", "sintese-do-caso.ts"], ["avc", "nucleo", "caminho-hemorragico.ts"],
  ["avc", "nucleo", "limpar-auditado.ts"], ["avc", "nucleo", "instancia.ts"], ["avc", "conteudo", "campos.ts"], ["avc", "conteudo", "campo.ts"],
  ["avc", "conteudo", "superficie-c.ts"], ["avc", "conteudo", "caminho-hemorragico.ts"], ["avc", "persistencia", "log.ts"],
  ["lib", "i18n", "modules", "avc-modulo.ts"],
].map((p) => path.join(appDir, ...p));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const DC = emT("avc", "nucleo", "derivacoes-c.js");
const PI = emT("avc", "nucleo", "portao-ivt.js");
const VE = emT("avc", "nucleo", "veredito-da-trombectomia.js");
const SI = emT("avc", "nucleo", "sintese-do-caso.js");
const H = emT("avc", "nucleo", "caminho-hemorragico.js");
const L = emT("avc", "nucleo", "limpar-auditado.js");
const I = emT("avc", "nucleo", "instancia.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const LOG = emT("avc", "persistencia", "log.js");
const I18N = emT("lib", "i18n", "modules", "avc-modulo.js");

/* ── instrumento: resultado por linha da matriz ── */
const linhas = new Map();
function conf(id, nome, cond, porque) {
  const l = linhas.get(id) ?? { ok: 0, falhas: [] };
  if (cond) l.ok++; else l.falhas.push(`${nome} — ${porque}`);
  linhas.set(id, l);
}
function bloco(id, nome, fn) {
  try { fn(); } catch (e) { conf(id, nome, false, `exceção: ${String(e && e.message).slice(0, 160)}`); }
}

const T0 = 1_800_000_000_000;
const MIN = 60_000;
const rel = R.relogioControlado(T0);
const agora = T0 + MIN;
const vazio = () => E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const ultimoFato = (e, campo) => [...e.fatos].reverse().find((f) => f.campo === campo);
const retencao = (e) => DC.retencaoDiagnostica(e).estado;
const motivoHsa = (e) => PI.estadoDoPortaoIVT(e, agora).motivos.find((m) => m.id === "suspeita_hsa");
const evtRetem = (e) => VE.vereditoDaTrombectomia(e, agora).retencaoDiagnostica?.estado === "retida";
const pendenciaHsa = (e) => DC.pendenciasDaImagem(e).some((p) => p.campo === "suspeita_hsa");
const leitura = (e) => DC.suspeitaDeHsa(e);
const destino = (e) => DC.destinoDaImagem(e);
const acoes = (e) => { const s = SI.sinteseDoCaso(e, rel, []); return s.proximaAcao ?? s.proximasAcoes ?? []; };
/** E13: a suspeita ativa aparece como investigação pendente — ⛔ como manejo de HSA confirmada. */
const textosHsa = (e) => [JSON.stringify(leitura(e)), ...acoes(e).map((a) => a.texto), ...DC.pendenciasDaImagem(e).map((p) => p.rotulo), destino(e)?.rotulo ?? "", destino(e)?.modulo ?? ""].join(" · ");
function visivelComoInvestigacao(id, e) {
  conf(id, "E13: a Imagem ⛔ diz «sem suspeita» nem «ainda não avaliada»", leitura(e).conclusao !== "nao" && !/ainda n[aã]o avaliada|sem suspeita/i.test(leitura(e).curto), `⛔ ${leitura(e).conclusao} · ${leitura(e).curto}`);
  conf(id, "E13: há saída da Imagem para a suspeita (⛔ HIC)", destino(e) !== undefined && destino(e).saida !== "hemorragia_intracraniana", `⛔ ${destino(e)?.saida}`);
  conf(id, "E13: pendência nomeada de investigação de HSA", DC.pendenciasDaImagem(e).some((p) => p.campo === "suspeita_hsa" && /investiga/i.test(p.rotulo)), `⛔ ${JSON.stringify(DC.pendenciasDaImagem(e).filter((p) => p.campo === "suspeita_hsa").map((p) => p.rotulo))}`);
  conf(id, "E13: a síntese pede continuar a investigação", acoes(e).some((a) => /investiga/i.test(a.texto)), `⛔ ${JSON.stringify(acoes(e).map((a) => a.texto))}`);
  conf(id, "E13: nenhum texto oferece «manejo» de HSA", !/manejo de hemorragia subarac/i.test(textosHsa(e)), "⛔ «Abrir o manejo de hemorragia subaracnóidea»");
}
const regI = (e, inst, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
const comTc = (e, resultado) => {
  const inst = I.proximaInstancia(e, SC.ESTUDO);
  let x = regI(e, inst, "estudo_modalidade", CAMPO.valorDaOpcao("Tomografia de crânio sem contraste"));
  x = regI(x, inst, "estudo_hora", T0);
  return regI(x, inst, "estudo_resultado", CAMPO.valorDaOpcao(resultado));
};

/* ── instrumento: controles que validam os leitores usados abaixo ── */
const simBase = reg(vazio(), "suspeita_hsa", "sim");
conf("instrumento", "síntese expõe próxima ação com «Sim»", Array.isArray(acoes(simBase)) && acoes(simBase).length > 0, `⛔ ${JSON.stringify(acoes(simBase))}`);
conf("instrumento", "portão expõe o motivo `suspeita_hsa` com «Sim»", motivoHsa(simBase) !== undefined, "⛔ sem motivo");

/* ══ A0 · o derivado único ══════════════════════════════════════════════════ */
const derivado = [DC, PI, SI].map((m) => m?.estadoDaSuspeitaDeHsa).find((f) => typeof f === "function");
const nomeDoEstado = (e) => { const x = derivado(e); return String(x?.estado ?? x).toUpperCase(); };
conf("A0", "existe `estadoDaSuspeitaDeHsa` exportado", derivado !== undefined, "⛔ ausente");
if (derivado !== undefined) {
  bloco("A0", "estados nomeados", () => {
    conf("A0", "nunca respondida → NAO_AVALIADA", nomeDoEstado(vazio()) === "NAO_AVALIADA", `⛔ ${nomeDoEstado(vazio())}`);
    conf("A0", "«Não» → SEM_SUSPEITA", nomeDoEstado(reg(vazio(), "suspeita_hsa", "nao")) === "SEM_SUSPEITA", "⛔");
    conf("A0", "«Sim» → ATIVA", nomeDoEstado(simBase) === "ATIVA", "⛔");
    conf("A0", "«Incerto» → ATIVA (E1)", nomeDoEstado(reg(vazio(), "suspeita_hsa", "nao_sei")) === "ATIVA", "⛔");
  });
}

/* ══ A · máquina de estados ═════════════════════════════════════════════════ */
bloco("A1", "nunca respondida", () => {
  const e = vazio();
  conf("A1", "livre", retencao(e) === "livre", `⛔ ${retencao(e)}`);
  conf("A1", "sem motivo, sem pendência, sem saída de HSA", motivoHsa(e) === undefined && !pendenciaHsa(e) && destino(e) === undefined, "⛔");
});
bloco("A2", "«Não» desde o início", () => {
  const e = reg(vazio(), "suspeita_hsa", "nao");
  conf("A2", "livre; leitura «não»", retencao(e) === "livre" && leitura(e).conclusao === "nao", `⛔ ${retencao(e)} · ${leitura(e).conclusao}`);
});
bloco("A3", "«Sim»", () => {
  const m = motivoHsa(simBase);
  conf("A3", "retida no portão e na EVT", retencao(simBase) === "retida" && m !== undefined && evtRetem(simBase), "⛔");
  conf("A3", "motivo sem `leva`", m !== undefined && m.leva === undefined, `⛔ ${JSON.stringify(m?.leva)}`);
});
bloco("A3b", "«Sim» visível como investigação (E13)", () => visivelComoInvestigacao("A3b", simBase));
bloco("A4", "«Incerto» desde o início (E1)", () => {
  const e = reg(vazio(), "suspeita_hsa", "nao_sei");
  conf("A4", "retida no portão e na EVT", retencao(e) === "retida" && motivoHsa(e) !== undefined && evtRetem(e), `⛔ ${retencao(e)}`);
  conf("A4", "nenhum texto diz «não retém»", !/n[aã]o ret[eé]m/i.test(JSON.stringify(leitura(e))), `⛔ ${leitura(e).curto}`);
  visivelComoInvestigacao("A4", e);
});
bloco("A5", "Sim → Não (E2)", () => {
  const e = reg(simBase, "suspeita_hsa", "nao");
  conf("A5", "retida no portão", retencao(e) === "retida" && motivoHsa(e) !== undefined, `⛔ ${retencao(e)}`);
  visivelComoInvestigacao("A5", e);
});
bloco("A6", "Sim → Incerto", () => {
  const e = reg(simBase, "suspeita_hsa", "nao_sei");
  conf("A6", "retida", retencao(e) === "retida", `⛔ ${retencao(e)}`);
  conf("A6", "nenhum texto diz «não retém»", !/n[aã]o ret[eé]m/i.test(JSON.stringify(leitura(e))), `⛔ ${leitura(e).curto}`);
  visivelComoInvestigacao("A6", e);
});
bloco("A7", "Incerto → Não, sem fato novo (E2)", () => {
  const e = reg(reg(vazio(), "suspeita_hsa", "nao_sei"), "suspeita_hsa", "nao");
  conf("A7", "retida no portão", retencao(e) === "retida" && motivoHsa(e) !== undefined, `⛔ ${retencao(e)}`);
});
bloco("A8", "Não → Sim", () => {
  const e = reg(reg(vazio(), "suspeita_hsa", "nao"), "suspeita_hsa", "sim");
  conf("A8", "retida", retencao(e) === "retida", `⛔ ${retencao(e)}`);
});
bloco("A9", "Sim → Não → desfazer", () => {
  const e = E.desfazerRegistro(reg(simBase, "suspeita_hsa", "nao"), "suspeita_hsa", rel);
  conf("A9", "retida", retencao(e) === "retida", `⛔ ${retencao(e)}`);
  visivelComoInvestigacao("A9", e);
});
bloco("A10", "correção explícita do «Sim»", () => {
  const sim = ultimoFato(simBase, "suspeita_hsa");
  const e = E.corrigirFato(simBase, { campo: "suspeita_hsa", valor: "nao", corrigeFatoId: sim.id, motivo: "erro de registro" }, rel);
  conf("A10", "livre", retencao(e) === "livre" && motivoHsa(e) === undefined, `⛔ ${retencao(e)}`);
});
bloco("A11", "«Limpar» sobre «Incerto»", () => {
  const e = reg(vazio(), "suspeita_hsa", "nao_sei");
  conf("A11", "«Incerto» sustenta retenção (pede «Foi engano?»)", L.campoSustentaRetencaoOuBloqueio(e, "suspeita_hsa", rel) === true, "⛔ false");
  const limpo = L.limparComCorrecaoAuditada(e, "suspeita_hsa", rel);
  conf("A11", "confirmado → livre e «não respondida»", retencao(limpo) === "livre" && String(E.valorAtual(limpo, "suspeita_hsa")?.valor) === "nao_perguntado",
    `⛔ ${retencao(limpo)} · ${E.valorAtual(limpo, "suspeita_hsa")?.valor}`);
});
bloco("A12", "«Limpar» com NCCT negativa registrada (E11)", () => {
  const e = reg(comTc(vazio(), "Sem hemorragia intracraniana identificada"), "suspeita_hsa", "sim");
  const tc = ultimoFato(e, "estudo_resultado");
  const limpo = L.limparComCorrecaoAuditada(e, "suspeita_hsa", rel);
  const novos = limpo.fatos.slice(e.fatos.length);
  conf("A12", "nenhuma correção aponta para fato de estudo", !novos.some((f) => String(f.campo).startsWith("estudo_")) && !limpo.fatos.some((f) => f.corrigeFatoId === tc.id), `⛔ ${JSON.stringify(novos)}`);
  conf("A12", "a leitura da imagem é a mesma", JSON.stringify(DC.exclusaoDeHemorragia(limpo)) === JSON.stringify(DC.exclusaoDeHemorragia(e)), "⛔ mudou");
  conf("A12", "livre", retencao(limpo) === "livre", `⛔ ${retencao(limpo)}`);
});
bloco("A17", "déficit focal + NIHSS alto + horários; suspeita nunca respondida", () => {
  let e = reg(vazio(), "deficit_focal", "sim");
  e = reg(e, "nihss_calculado", 20);
  e = reg(e, "hora_ultima_vez_bem", T0 - 30 * MIN);
  e = reg(e, "hora_inicio_observado", T0 - 20 * MIN);
  conf("A17", "livre; sem motivo, pendência nem saída de HSA", retencao(e) === "livre" && motivoHsa(e) === undefined && !pendenciaHsa(e) && destino(e) === undefined, `⛔ ${retencao(e)}`);
});
bloco("A18", "déficit focal + «Não»", () => {
  const e = reg(reg(vazio(), "deficit_focal", "sim"), "suspeita_hsa", "nao");
  conf("A18", "livre", retencao(e) === "livre" && motivoHsa(e) === undefined, `⛔ ${retencao(e)}`);
});
bloco("A19", "«Não sei» em outros campos; suspeita nunca respondida (E1)", () => {
  let e = reg(vazio(), "deficit_focal", "nao_sei");
  e = reg(e, "hora_ultima_vez_bem", "nao_sei");
  e = reg(e, "hora_inicio_observado", "nao_sei");
  e = reg(e, "t4_afasia_grave", "nao_sei");
  conf("A19", "livre; sem motivo, pendência nem saída de HSA", retencao(e) === "livre" && motivoHsa(e) === undefined && !pendenciaHsa(e) && destino(e) === undefined, `⛔ ${retencao(e)}`);
});
bloco("A20", "nenhuma leitura direta de `suspeita_hsa` fora do derivado", () => {
  /** Trava estrutural do bloco A (autor, 2026-09-15): núcleo ⛔ telas. */
  const achados = [];
  const alvos = [[["avc", "nucleo"], ".ts"], [["components", "avc"], ".tsx"]]
    .flatMap(([sub, ext]) => fs.readdirSync(path.join(appDir, ...sub)).filter((n) => n.endsWith(ext)).map((n) => [path.join(appDir, ...sub, n), `${sub.join("/")}/${n}`]));
  for (const [caminho, arq] of alvos) {
    let src = lerFonte(caminho);
    const i = src.indexOf("function estadoDaSuspeitaDeHsa");
    if (i >= 0) {
      let j = src.indexOf("{", i), prof = 0, k = j;
      for (; k < src.length; k++) { if (src[k] === "{") prof++; else if (src[k] === "}" && --prof === 0) break; }
      src = src.slice(0, i) + src.slice(k + 1);
    }
    const re = /(ternario|valorAtual|respondeuDesconhecido|respondidoComoIncerto|rotuloGravado|historicoDe|escolha)\(\s*estado\s*,\s*"suspeita_hsa"|campo\s*===\s*"suspeita_hsa"/g;
    const n = (src.match(re) || []).length;
    if (n > 0) achados.push(`${arq}: ${n}`);
  }
  conf("A20", "0 leituras diretas", achados.length === 0 && derivado !== undefined, `⛔ ${achados.join(" · ") || "derivado ausente"}`);
});

bloco("A21a", "evidência confirmatória legada vence «Não» e «Limpar» (invariante do bloco A)", () => {
  const hem = E.registrarFato(comTc(vazio(), "Hemorragia intracraniana identificada"), { campo: "hem_tipo", valor: "Subaracnóidea" }, rel);
  const comNao = reg(hem, "suspeita_hsa", "nao");
  const limpo = L.limparComCorrecaoAuditada(reg(hem, "suspeita_hsa", "sim"), "suspeita_hsa", rel);
  for (const [nome, e] of [["«Não»", comNao], ["«Limpar»", limpo]]) {
    conf("A21a", `${nome}: a barreira de segurança continua retendo`, DC.barreiraDeReperfusao(e).estado === "retida", `⛔ ${DC.barreiraDeReperfusao(e).estado}`);
    conf("A21a", `${nome}: o derivado põe a evidência confirmatória acima da suspeita`, derivado !== undefined && nomeDoEstado(e) === "HSA_CONFIRMADA", `⛔ ${derivado === undefined ? "derivado ausente" : nomeDoEstado(e)}`);
    conf("A21a", `${nome}: o exame ⛔ foi corrigido`, !e.fatos.some((f) => (f.campo === "hem_tipo" || f.campo === "estudo_resultado") && f.corrigeFatoId), "⛔ correção em exame");
  }
});

/* ══ C · o que já dá para medir ═════════════════════════════════════════════ */
bloco("C10", "nenhuma regra temporal punção lombar → IVT (C3)", () => {
  const achados = [];
  for (const sub of [["avc", "nucleo"], ["avc", "conteudo"]]) {
    const dir = path.join(appDir, ...sub);
    for (const arq of fs.readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
      for (const linha of lerFonte(path.join(dir, arq)).split("\n")) {
        if (/pun[cç][aã]o[_ ]lombar|xantocrom|\bpl_[a-z]/i.test(linha) && /\d+\s*\*\s*60|3_?600_?000|\bhoras?\b|\bminutos?\b|_H\b|_MIN\b/i.test(linha)) achados.push(`${arq}: ${linha.trim().slice(0, 100)}`);
      }
    }
  }
  conf("C10", "nenhuma linha liga punção lombar a limiar de tempo", achados.length === 0, `⛔ ${achados.join(" · ")}`);
});
bloco("C12", "motivo da HSA sem `leva`", () => {
  conf("C12", "o motivo não leva a trocar a resposta", motivoHsa(simBase)?.leva === undefined, `⛔ ${JSON.stringify(motivoHsa(simBase))}`);
});

/* ══ D · imagem ══════════════════════════════════════════════════════════════ */
const SEM = "Sem hemorragia intracraniana identificada";
const COM = "Hemorragia intracraniana identificada";
const NOVA = "Hemorragia subaracnóidea identificada";
bloco("D1", "as duas opções atuais intactas", () => {
  conf("D1", "rótulos idênticos", SC.RESULTADO_TC.semHemorragia === SEM && SC.RESULTADO_TC.hemorragia === COM, `⛔ ${JSON.stringify(SC.RESULTADO_TC)}`);
  conf("D1", "valor gravado = rótulo", CAMPO.valorDaOpcao(SEM) === SEM && CAMPO.valorDaOpcao(COM) === COM, "⛔");
  conf("D1", "continuam oferecidas", SC.OPCOES_RESULTADO_TC.includes(SEM) && SC.OPCOES_RESULTADO_TC.includes(COM), `⛔ ${JSON.stringify(SC.OPCOES_RESULTADO_TC)}`);
});
bloco("D2", "caso v4 com «Hemorragia intracraniana identificada» retomado pelo log", () => {
  let id = 0;
  const ctx = { casoId: "caso-ac15", autor: "u-1", origemDoAutor: "sessao", nomeDoAutor: null, agora: rel.agora(), gerarId: () => `ev-${++id}`, proximoSeq: () => id };
  const e0 = vazio();
  const e1 = comTc(e0, COM);
  const rec = LOG.reconstruirEstado([...LOG.eventosDeAbertura(e0, ctx), ...LOG.eventosDaTransicao(e0, e1, ctx)]);
  conf("D2", "o valor gravado volta idêntico", ultimoFato(rec, "estudo_resultado")?.valor === COM, `⛔ ${ultimoFato(rec, "estudo_resultado")?.valor}`);
  conf("D2", "a barreira lida é a mesma", JSON.stringify(DC.barreiraDeReperfusao(rec)) === JSON.stringify(DC.barreiraDeReperfusao(e1)), "⛔ mudou");
});
const hemCom = (tipo) => E.registrarFato(comTc(vazio(), COM), { campo: "hem_tipo", valor: tipo }, rel);
bloco("D7", "hemorragia não-HSA segue HIC", () => {
  const e = hemCom("Intraparenquimatosa");
  conf("D7", "síntese «abrir-hic» com «(HIC)»", acoes(e).some((a) => a.id === "abrir-hic" && /\(HIC\)/.test(a.texto)), `⛔ ${JSON.stringify(acoes(e))}`);
  conf("D7", "caminho com pendências «(HIC)»", H.caminhoHemorragico(e).pendencias.some((p) => /\(HIC\)/.test(p.rotulo)), "⛔");
});
bloco("D8", "legado: NCCT hemorragia + hem_tipo «Subaracnóidea» (E9)", () => {
  const e = hemCom("Subaracnóidea");
  conf("D8", "a barreira de segurança continua retendo", DC.barreiraDeReperfusao(e).estado === "retida", `⛔ ${DC.barreiraDeReperfusao(e).estado}`);
  conf("D8", "o dado persistido fica intacto", ultimoFato(e, "hem_tipo")?.valor === "Subaracnóidea" && !e.fatos.some((f) => f.campo === "hem_tipo" && f.corrigeFatoId), "⛔");
  const textos = [...acoes(e).map((a) => a.texto), ...H.caminhoHemorragico(e).pendencias.map((p) => p.rotulo), destino(e)?.modulo ?? ""];
  conf("D8", "lido como HSA: nenhum texto com «HIC»", !textos.some((t) => /\bHIC\b/.test(t)), `⛔ ${textos.filter((t) => /\bHIC\b/.test(t)).join(" · ")}`);
});
bloco("D9", "novo caso: `hem_tipo` ⛔ oferece «Subaracnóidea»", () => {
  const opcoes = K.campoDoModulo("hem_tipo")?.opcoes ?? [];
  conf("D9", "opção ausente", opcoes.length > 0 && !opcoes.includes("Subaracnóidea"), `⛔ ${JSON.stringify(opcoes)}`);
});
bloco("D10", "saída desconhecida ⛔ cai sozinha no catálogo de HSA", () => {
  const re = /saida\s*===\s*"hemorragia_intracraniana"\s*\?\s*"hic"\s*:\s*"hsa"/;
  for (const arq of ["superficie-c.tsx", "superficie-g.tsx"]) {
    conf("D10", `${arq}: mapeamento explícito`, !re.test(lerFonte(path.join(appDir, "components", "avc", arq))), "⛔ ternário «≠ hemorragia_intracraniana → hsa»");
  }
});
bloco("D11", "terceira opção com par es-419 (E9b)", () => {
  conf("D11", "«Hemorragia subaracnóidea identificada» oferecida", SC.OPCOES_RESULTADO_TC.includes(NOVA), `⛔ ${JSON.stringify(SC.OPCOES_RESULTADO_TC)}`);
  conf("D11", "par es-419", typeof I18N?.ES_AVC_MODULO?.[NOVA] === "string" && I18N.ES_AVC_MODULO[NOVA].trim() !== "", "⛔ sem par");
});

/* ── vermelhas declaradas (autor, 2026-09-15): cada linha, com o bloco que a torna verde ── */
const VERMELHAS_DECLARADAS = {
  /** Vazia: as linhas do bloco A saíram com o bloco A, ⛔ e as do bloco D (D8–D11) com o bloco D (AC-15, 2026-09-15). */
};

/* ── relatório ── */
const ordem = ["instrumento", "A0", "A1", "A2", "A3", "A3b", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "A11", "A12", "A17", "A18", "A19", "A20", "A21a", "C10", "C12", "D1", "D2", "D7", "D8", "D9", "D10", "D11"];
let divergencias = 0, declaradas = 0, verdes = 0;
for (const id of Object.keys(VERMELHAS_DECLARADAS)) {
  if (!ordem.includes(id)) { divergencias++; console.log(`✗ ${id} declarada vermelha, mas a linha não existe`); }
}
for (const id of ordem) {
  const l = linhas.get(id) ?? { ok: 0, falhas: ["linha sem asserção"] };
  const vermelha = l.falhas.length > 0;
  const declarada = Object.prototype.hasOwnProperty.call(VERMELHAS_DECLARADAS, id);
  if (vermelha && declarada) { declaradas++; console.log(`🔴 ${id.padEnd(11)} vermelha declarada · ${VERMELHAS_DECLARADAS[id]}`); }
  else if (!vermelha && !declarada) { verdes++; console.log(`🟢 ${id.padEnd(11)} ${l.ok} ok`); }
  else if (vermelha) { divergencias++; console.log(`✗  ${id.padEnd(11)} VERMELHA NÃO DECLARADA`); }
  else { divergencias++; console.log(`✗  ${id.padEnd(11)} VERDE, mas declarada vermelha — remova da lista (${VERMELHAS_DECLARADAS[id]})`); }
  if (vermelha) for (const f of l.falhas) console.log(`      ✗ ${f}`);
}
console.log(`\n${divergencias === 0 ? "✅" : "❌"} PROVA · AC-15 · SUSPEITA DE HSA — ${verdes} verde(s) · ${declaradas} vermelha(s) declarada(s) · ${divergencias} divergência(s)`);
process.exit(divergencias === 0 ? 0 : 1);
