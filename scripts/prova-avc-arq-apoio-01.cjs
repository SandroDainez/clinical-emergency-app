#!/usr/bin/env node
/**
 * PROVA · ARQ-APOIO-01 · F1 — portão da trombólise e telas E/F no modo de apoio à decisão (autor, 2026-09-15).
 *
 * PROMETE:
 *  · cada motivo do portão tem categoria (informação · alerta clínico · dados a corrigir) e os críticos são marcados
 *    (hemorragia na imagem, cortes laboratoriais, COR 3, item absoluto da Table 8) — AP-1;
 *  · estudos de imagem divergentes seguem alerta crítico em `bloqueado_seguranca` (toda divergência inclui um achado de
 *    hemorragia; prova dos críticos, caso 5);
 *  · a decisão médica registrada guarda decisão, justificativa, médico, registro profissional, retrato dos critérios e
 *    horário, com origem clínica (AP-3); duas decisões do mesmo alvo ⛔ misturam acompanhantes; a última é a vigente;
 *  · registrar decisão sobre um alerta ⛔ muda o estado derivado pelo sistema (AP-10): hemorragia + «prosseguir» segue
 *    `bloqueado_seguranca` ⛔ não liberado; o julgamento do D-139-3 continua lendo o mesmo valor gravado (AP-7);
 *  · as quatro invariantes da F1 (autor, 2026-09-15): (1) a decisão ⛔ altera o alerta derivado (rótulo, categoria,
 *    criticidade, ordem); (2) «prosseguir» ⛔ reclassifica o veredito da fonte; (3) médico, origem da identificação,
 *    CRM/UF na atestação, retrato ⛔ justificativa no crítico ausentes → decisão INCOMPLETA, com a mesma regra na tela ⛔ na
 *    leitura; (4) mudar a decisão é novo registro, e cada registro anterior segue reconstruível sem vazamento;
 *  · E ⛔ F ⛔ usam «Contraindicação de segurança ativa», «Trombólise indicada», «bloqueio cair» ⛔ «Nada mais bloqueia».
 * NÃO PROMETE: a população fora do escopo, a aba Reperfusão no caminho hemorrágico ⛔ a origem do peso (F2); a PCR
 *   (ARQ-APOIO-02); nenhuma regra clínica da fonte muda.
 * UNIVERSO: `avc/nucleo/{portao-ivt,decisao-medica,derivacoes-d}.ts`, `avc/conteudo/superficie-f.ts`,
 *   `components/avc/{superficie-e,superficie-f}.tsx`.
 * FONTE: decisões AP-1 a AP-10 do autor (2026-09-15); `docs/avc/revisao/ARQ-APOIO-01-mapa.md`.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "arq-apoio-01-"));
const fontes = [
  ["avc", "nucleo", "estado.ts"], ["avc", "nucleo", "relogio.ts"], ["avc", "nucleo", "portao-ivt.ts"], ["avc", "nucleo", "decisao-medica.ts"],
  ["avc", "nucleo", "derivacoes-d.ts"], ["avc", "nucleo", "instancia.ts"], ["avc", "conteudo", "campos.ts"], ["avc", "conteudo", "campo.ts"],
  ["avc", "conteudo", "superficie-c.ts"], ["avc", "conteudo", "superficie-f.ts"],
].map((p) => path.join(appDir, ...p));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--rootDir", appDir, "--outDir", tmp, ...fontes], { cwd: appDir, stdio: "pipe" });
} catch { /* erros de tipo de dependência ⛔ impedem a emissão */ }
const emT = (...p) => { try { return require(path.join(tmp, ...p)); } catch { return undefined; } };
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const DM = emT("avc", "nucleo", "decisao-medica.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const I = emT("avc", "nucleo", "instancia.js");
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const V = emT("avc", "nucleo", "veredito-da-trombolise.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ✗ ${nome}\n      ${porque}`);
}
function bloco(nome, fn) {
  try { fn(); } catch (e) { conf(nome, false, `exceção: ${String(e && e.message).slice(0, 200)}`); }
}

conf("os módulos existem", P?.estadoDoPortaoIVT && DM?.registrarDecisaoMedica && DM?.decisoesMedicasRegistradas && P?.categoriaDoMotivo, "⛔ módulo ou exportação ausente");

const T0 = 1_800_000_000_000;
const MIN = 60_000;
const rel = R.relogioControlado(T0);
const agora = T0 + MIN;
const vazio = () => E.abrirAtendimento(rel);
const regI = (e, inst, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, inst);
const comTc = (e, resultado) => {
  const inst = I.proximaInstancia(e, SC.ESTUDO);
  let x = regI(e, inst, "estudo_modalidade", CAMPO.valorDaOpcao("Tomografia de crânio sem contraste"));
  x = regI(x, inst, "estudo_hora", T0);
  return regI(x, inst, "estudo_resultado", CAMPO.valorDaOpcao(resultado));
};
const portao = (e) => P.estadoDoPortaoIVT(e, agora);
const motivo = (e, id) => portao(e).motivos.find((m) => m.id === id);
const dados = (decisao, extra = {}) => ({ decisao, justificativa: "", medico: "Dra. Teste", registroProfissional: "CRM 12345/SP", identificacao: "atestacao", criterios: [], ...extra });

/* ── 1 · categorias (AP-1) ── */
bloco("categorias", () => {
  const cat = (m) => P.categoriaDoMotivo(m, new Set());
  const c = (m) => `${cat(m).categoria}${cat(m).critico ? "+critico" : ""}`;
  conf("hemorragia na imagem → alerta crítico", c({ id: "imagem", camada: "seguranca" }) === "alerta+critico", c({ id: "imagem", camada: "seguranca" }));
  conf("imagem não excluída → dados a corrigir", c({ id: "imagem_nao_excluida", camada: "classe" }) === "dados_a_corrigir", c({ id: "imagem_nao_excluida", camada: "classe" }));
  conf("corte de INR → alerta crítico", c({ id: "corte-inr", camada: "seguranca", efeito: "impede" }) === "alerta+critico", "⛔");
  conf("corte de plaquetas → alerta crítico", c({ id: "corte-plaquetas", camada: "seguranca", efeito: "impede" }) === "alerta+critico", "⛔");
  conf("COR 3 → alerta crítico", c({ id: "cor3-x", camada: "veredito" }) === "alerta+critico", "⛔");
  conf("item absoluto da Table 8 → alerta crítico", c({ id: "item-x", camada: "seguranca", efeito: "impede" }) === "alerta+critico", "⛔");
  conf("item com «não prosseguir» registrado → alerta, ⛔ crítico",
    `${P.categoriaDoMotivo({ id: "item-x", camada: "seguranca", efeito: "impede" }, new Set(["item-x"])).critico ?? ""}` === "", "⛔");
  conf("divergência de coleta → dados a corrigir", c({ id: "divergencia-inr", camada: "seguranca", efeito: "impede_ate_reconciliar" }) === "dados_a_corrigir", "⛔");
  conf("juízo sem resposta → dados a corrigir", c({ id: "juizo_coagulacao", camada: "seguranca", efeito: "aguarda_juizo" }) === "dados_a_corrigir", "⛔");
  conf("meia aferição → dados a corrigir", c({ id: "afericao_incompleta", camada: "correcao" }) === "dados_a_corrigir", "⛔");
  conf("DOAC → alerta comum", c({ id: "doac", camada: "seguranca", efeito: "exige_julgamento" }) === "alerta", "⛔");
  conf("suspeita de HSA → alerta comum", c({ id: "suspeita_hsa", camada: "destino" }) === "alerta", "⛔");
  conf("pressão acima da meta → alerta comum", c({ id: "pressao_acima_da_meta", camada: "correcao" }) === "alerta", "⛔");
  conf("condição resolutiva → informação", c({ id: "x", camada: "seguranca", efeito: "condicao_resolutiva" }) === "informacao", "⛔");
  conf("risco declarado → informação", c({ id: "item-y", camada: "seguranca", efeito: "informa" }) === "informacao", "⛔");
  conf("última pressão completa → informação", c({ id: "ultima_pressao_completa", camada: "correcao" }) === "informacao", "⛔");
});

/* ── 2 · divergência de imagem segue alerta crítico (toda divergência inclui um achado de hemorragia) ── */
bloco("divergência de imagem", () => {
  const e = comTc(comTc(vazio(), "Hemorragia intracraniana identificada"), "Sem hemorragia intracraniana identificada");
  const p = portao(e);
  conf("estado `bloqueado_seguranca`, como na prova dos críticos (caso 5)", p.estado === "bloqueado_seguranca", `⛔ ${p.estado}`);
  conf("⛔ liberado", p.liberado === false, "⛔ liberado");
  conf("o motivo é alerta crítico", motivo(e, "imagem")?.categoria === "alerta" && motivo(e, "imagem")?.critico === true, `⛔ ${JSON.stringify(motivo(e, "imagem"))}`);
});

/* ── 3 · invariantes 1 e 2: a decisão ⛔ muda o alerta ⛔ o veredito (AP-10) ── */
bloco("decisão médica sobre alerta crítico", () => {
  const hem = comTc(vazio(), "Hemorragia intracraniana identificada");
  const antes = portao(hem);
  const motivoAntes = motivo(hem, "imagem");
  conf("controle: hemorragia → `bloqueado_seguranca`, motivo crítico", antes.estado === "bloqueado_seguranca" && motivoAntes?.critico === true, `⛔ ${antes.estado}`);
  const criterios = antes.motivos.filter((m) => m.categoria !== "informacao").map((m) => ({ id: m.id, rotulo: m.rotulo, categoria: m.categoria, critico: m.critico === true }));
  const decidido = DM.registrarDecisaoMedica(hem, "imagem", dados("prosseguir", { justificativa: "Avaliação neurocirúrgica: sangue antigo", criterios }), rel);
  const depois = portao(decidido);
  const motivoDepois = motivo(decidido, "imagem");
  conf("⚠️ inv. 1: estado ⛔ liberação iguais depois de «prosseguir»", depois.estado === antes.estado && depois.liberado === false, `⛔ ${depois.estado}`);
  conf("⚠️ inv. 1: o alerta continua com rótulo, categoria ⛔ criticidade idênticos",
    motivoDepois !== undefined && motivoDepois.rotulo === motivoAntes.rotulo && motivoDepois.categoria === motivoAntes.categoria && motivoDepois.critico === motivoAntes.critico,
    `⛔ ${JSON.stringify(motivoDepois)}`);
  conf("⚠️ inv. 1: a mesma lista de motivos, na mesma ordem", JSON.stringify(depois.motivos.map((m) => m.id)) === JSON.stringify(antes.motivos.map((m) => m.id)), "⛔ motivo sumiu ou mudou de lugar");
  const vAntes = V.vereditoDaTrombolise(hem, agora);
  const vDepois = V.vereditoDaTrombolise(decidido, agora);
  conf("⚠️ inv. 2: o veredito da fonte ⛔ é reclassificado (tipo ⛔ critérios iguais)",
    vDepois.tipo === vAntes.tipo && vDepois.tipo === "retida"
      && JSON.stringify(vDepois.criteriosAvaliados.map((c) => [c.id, c.estado])) === JSON.stringify(vAntes.criteriosAvaliados.map((c) => [c.id, c.estado])),
    `⛔ ${vAntes.tipo} → ${vDepois.tipo}`);
  const d = motivoDepois?.decisaoMedica;
  conf("o motivo carrega a decisão vigente, completa", d?.decisao === "prosseguir" && d?.vigente === true && d?.completa === true && d?.falta.length === 0, `⛔ ${JSON.stringify(d)}`);
  conf("decisão com origem clínica, médico, registro, identificação, justificativa, horário e retrato",
    d?.origem === "clinico" && d?.medico === "Dra. Teste" && d?.registroProfissional === "CRM 12345/SP" && d?.identificacao === "atestacao"
      && d?.justificativa === "Avaliação neurocirúrgica: sangue antigo" && typeof d?.horaRegistro === "number" && d?.critico === true
      && d?.criteriosNoMomento.some((c) => c.id === "imagem" && c.critico === true), `⛔ ${JSON.stringify(d)}`);
  conf("o portão expõe a trilha de decisões", depois.decisoesMedicas.length === 1, `⛔ ${depois.decisoesMedicas.length}`);
});

/* ── 3b · invariante 3: decisão incompleta ⛔ é completa por inferência ── */
bloco("decisão incompleta", () => {
  const hem = comTc(vazio(), "Hemorragia intracraniana identificada");
  const inst = SF.instanciaDoJulgamento("imagem");
  const soValor = regI(hem, inst, "julgamento_individual_registrado", "Prosseguir");
  const d1 = DM.decisoesMedicasRegistradas(soValor)[0];
  conf("só o valor gravado (sem médico, identificação ⛔ retrato) → incompleta",
    d1?.completa === false && ["Médico responsável", "Origem da identificação do médico", "Critérios pendentes no momento da decisão"].every((x) => d1.falta.includes(x)),
    `⛔ ${JSON.stringify(d1)}`);
  const critico = [{ id: "imagem", rotulo: "Hemorragia", categoria: "alerta", critico: true }];
  const semCrm = DM.decisoesMedicasRegistradas(DM.registrarDecisaoMedica(hem, "imagem", dados("nao_prosseguir", { registroProfissional: "", criterios: critico }), rel))[0];
  conf("atestação sem CRM/UF → incompleta, falta o registro", semCrm?.completa === false && semCrm.falta.includes("Registro profissional (CRM/UF)"), `⛔ ${JSON.stringify(semCrm)}`);
  const semJust = DM.decisoesMedicasRegistradas(DM.registrarDecisaoMedica(hem, "imagem", dados("prosseguir", { criterios: critico }), rel))[0];
  conf("prosseguir em alerta crítico sem justificativa → incompleta, falta a justificativa", semJust?.completa === false && semJust.falta.includes("Justificativa da decisão médica"), `⛔ ${JSON.stringify(semJust)}`);
  const semMedico = DM.decisoesMedicasRegistradas(DM.registrarDecisaoMedica(hem, "imagem", dados("nao_prosseguir", { medico: "", criterios: critico }), rel))[0];
  conf("sem médico → incompleta, falta o médico", semMedico?.completa === false && semMedico.falta.includes("Médico responsável"), `⛔ ${JSON.stringify(semMedico)}`);
  const sessao = DM.decisoesMedicasRegistradas(DM.registrarDecisaoMedica(hem, "doac", dados("prosseguir", { registroProfissional: "", identificacao: "sessao_autenticada", criterios: [{ id: "doac", rotulo: "DOAC", categoria: "alerta", critico: false }] }), rel))[0];
  conf("sessão autenticada com médico, sem CRM, alerta comum → completa", sessao?.completa === true && sessao.identificacao === "sessao_autenticada", `⛔ ${JSON.stringify(sessao)}`);
  conf("a mesma regra na tela ⛔ na leitura (`requisitosFaltantes`)", typeof DM.requisitosFaltantes === "function"
    && JSON.stringify(DM.faltaNaDecisao({ decisao: "prosseguir", justificativa: "", medico: "", registroProfissional: "" }, { critico: true, sessaoNominal: false }))
      === JSON.stringify(DM.requisitosFaltantes({ decisao: "prosseguir", justificativa: "", medico: "", registroProfissional: "", identificacao: "atestacao", critico: true, comRetrato: true })), "⛔ regras diferentes");
});

/* ── 4 · invariante 4: mudança de decisão é novo registro; o anterior segue reconstruível ── */
bloco("trilha de decisões", () => {
  const hem = comTc(vazio(), "Hemorragia intracraniana identificada");
  const crit1 = [{ id: "imagem", rotulo: "Hemorragia na TC", categoria: "alerta", critico: true }];
  const crit2 = [...crit1, { id: "pressao_acima_da_meta", rotulo: "PA acima da meta", categoria: "alerta", critico: false }];
  const um = DM.registrarDecisaoMedica(hem, "imagem", dados("prosseguir", { justificativa: "primeira", criterios: crit1 }), rel);
  const dois = DM.registrarDecisaoMedica(um, "imagem", dados("nao_prosseguir", { medico: "Dr. Outro", registroProfissional: "", identificacao: "sessao_autenticada", criterios: crit2 }), rel);
  const trilha = DM.decisoesMedicasRegistradas(dois);
  conf("duas decisões, na ordem", trilha.length === 2 && trilha[0].decisao === "prosseguir" && trilha[1].decisao === "nao_prosseguir", `⛔ ${JSON.stringify(trilha)}`);
  conf("⚠️ inv. 4: a primeira segue reconstruível — médico, CRM, identificação, justificativa, critérios, horário",
    trilha[0].medico === "Dra. Teste" && trilha[0].registroProfissional === "CRM 12345/SP" && trilha[0].identificacao === "atestacao"
      && trilha[0].justificativa === "primeira" && trilha[0].criteriosNoMomento.length === 1 && typeof trilha[0].horaRegistro === "number" && trilha[0].completa === true,
    `⛔ ${JSON.stringify(trilha[0])}`);
  conf("⚠️ inv. 4: a segunda tem os seus próprios dados, ⛔ herdados",
    trilha[1].medico === "Dr. Outro" && trilha[1].registroProfissional === undefined && trilha[1].identificacao === "sessao_autenticada"
      && trilha[1].justificativa === undefined && trilha[1].criteriosNoMomento.length === 2,
    `⛔ ${JSON.stringify(trilha[1])}`);
  conf("fatos distintos na trilha, ⛔ sobrescrita", trilha[0].fatoId !== trilha[1].fatoId && dois.fatos.filter((f) => f.campo === "julgamento_individual_registrado").length === 2, "⛔");
  conf("só a última é vigente", trilha[0].vigente === false && trilha[1].vigente === true, "⛔");
});

/* ── 5 · compatibilidade com o D-139-3 (AP-7) ── */
bloco("D-139-3", () => {
  const e = DM.registrarDecisaoMedica(vazio(), "doac", dados("prosseguir"), rel);
  conf("o valor gravado é o mesmo do julgamento: «Prosseguir»", DD.julgamentoRegistrado(e, "doac") === "prosseguir", `⛔ ${DD.julgamentoRegistrado(e, "doac")}`);
  const n = DM.registrarDecisaoMedica(vazio(), "doac", dados("nao_prosseguir"), rel);
  conf("… e «Não prosseguir»", DD.julgamentoRegistrado(n, "doac") === "nao_prosseguir", "⛔");
  conf("o campo do julgamento continua com as opções gravadas", JSON.stringify(SF.CAMPO_DO_JULGAMENTO.opcoes) === JSON.stringify(["Prosseguir", "Não prosseguir"]), "⛔");
});

/* ── 6 · o que falta (AP-2, AP-3) ── */
bloco("o que falta", () => {
  const f = (d, ctx) => DM.faltaNaDecisao({ justificativa: "", medico: "", registroProfissional: "", ...d }, ctx);
  conf("sem médico → falta o médico", f({ decisao: "nao_prosseguir" }, { critico: false, sessaoNominal: true }).includes("Médico responsável"), "⛔");
  conf("sem sessão nominal e sem CRM → falta o registro", f({ decisao: "nao_prosseguir", medico: "X" }, { critico: false, sessaoNominal: false }).includes("Registro profissional (CRM/UF)"), "⛔");
  conf("com sessão nominal, o CRM ⛔ é exigido", f({ decisao: "nao_prosseguir", medico: "X" }, { critico: false, sessaoNominal: true }).length === 0, "⛔");
  conf("prosseguir em alerta crítico sem justificativa → falta a justificativa", f({ decisao: "prosseguir", medico: "X", registroProfissional: "Y" }, { critico: true, sessaoNominal: false }).includes("Justificativa da decisão médica"), "⛔");
  conf("⛔ não prosseguir em alerta crítico ⛔ exige justificativa", f({ decisao: "nao_prosseguir", medico: "X", registroProfissional: "Y" }, { critico: true, sessaoNominal: false }).length === 0, "⛔");
  conf("⛔ alerta comum ⛔ exige justificativa", f({ decisao: "prosseguir", medico: "X", registroProfissional: "Y" }, { critico: false, sessaoNominal: false }).length === 0, "⛔");
});

/* ── 7 · linguagem de E e F ── */
bloco("linguagem", () => {
  const telaF = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  const telaE = lerFonte(path.join(appDir, "components", "avc", "superficie-e.tsx"));
  for (const velho of ["Contraindicação de segurança ativa", "✓ Trombólise indicada", "✕ A diretriz não recomenda", "✕ Reperfusão retida pela imagem"]) {
    conf(`F ⛔ diz «${velho}»`, !telaF.includes(velho), "⛔ texto antigo");
  }
  for (const velho of ["O que faz este bloqueio cair", "Nada mais bloqueia a trombólise", "Há contraindicação de segurança", "Nenhum bloqueio corrigível"]) {
    conf(`E ⛔ diz «${velho}»`, !telaE.includes(velho), "⛔ texto antigo");
  }
  conf("F nomeia a categoria e o alerta crítico", /avc-f-portao-categoria-/.test(telaF) && /Alerta crítico/.test(telaF), "⛔");
  conf("F registra a decisão com médico, registro e justificativa", /RegistroDeDecisaoMedica/.test(telaF) && /faltaNaDecisao\(/.test(telaF) && /CAMPOS_DA_DECISAO_MEDICA\.map\(/.test(telaF), "⛔");
  conf("⚠️ inv. 3: F mostra decisão incompleta como incompleta", /Decisão médica incompleta — falta/.test(telaF) && /vigente\.completa/.test(telaF), "⛔");
  conf("E ⛔ F leem «não prosseguir» do mesmo jeito (✕)", /decisao_de_nao_prosseguir:\s*"impede"/.test(telaE), "⛔ E ainda lê como favorável");
  conf("⛔ «contraindicad» na tela F", !/contraindicad/i.test(telaF), "⛔");
});

console.log(`\n${falhas === 0 ? "✅" : "❌"} PROVA · ARQ-APOIO-01 · F1 — ${ok} verde(s) · ${falhas} vermelho(s)`);
process.exit(falhas === 0 ? 0 : 1);
