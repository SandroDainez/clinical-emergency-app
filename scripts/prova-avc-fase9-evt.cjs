#!/usr/bin/env node
/**
 * TRAVA DA TROMBECTOMIA — ⚠️ **catálogo completo, motores separados**.
 *
 * PROMETE: que `vereditoDaTrombectomia()` responda **pelo critério da fonte**,
 *   ⛔ e ⛔ nunca pela presença do dado. Em quatro camadas:
 *
 *   · **domínio** — ⛔ só recomendações de **elegibilidade** entram; técnica,
 *     dispositivo ⛔ e anestesia existem no catálogo ⛔ e ⛔ não mudam candidatura;
 *     ⛔ e o domínio é **estrutural**, ⛔ nunca deduzido do id ⛔ ou de texto;
 *   · **valor** — sítio anatômico, NIHSS, mRS, ASPECTS, PC-ASPECTS, idade ⛔ e
 *     **janela** são conferidos contra a faixa **daquela** recomendação, ⛔ com
 *     três saídas: satisfaz · contradiz · ⛔ ausente;
 *   · **população** — ⛔ um paciente de uma anatomia ⛔ NÃO alcança recomendação
 *     escrita para outra ⛔ apenas porque os mesmos campos estão preenchidos;
 *   · **hedges** — `*` ⛔ e `†` presas às suas recomendações, COR/LOE ⛔ e verbo
 *     verbatim preservados, ⛔ e *"No Benefit"* ⛔ nunca virando *"contraindicada"*.
 *
 * NÃO PROMETE: que a indicação de EVT esteja clinicamente certa neste paciente
 *   — ⛔ isso é do médico. ⛔ Aqui se mede **o que o motor conclui a partir do
 *   que a fonte escreve**.
 *
 *   ⛔ ⛔ E ⛔ **⛔ NÃO** promete ⛔ nada sobre a **tela**: ⛔ nenhuma conferência
 *   aqui abre um componente. ⚠️ Um veredito correto exibido com a palavra
 *   errada passaria verde por completo — ⛔ quem cobre isso é o teste de gesto
 *   real ⛔ e a revisão visual, ⛔ e ⛔ eles ⛔ ainda ⛔ não existem para a EVT.
 *
 *   ⛔ ⛔ E ⛔ **⛔ NÃO** promete que a rec. 8 (COR 3) tenha janela: a frase da
 *   fonte ⛔ não traz ⛔ nenhuma, ⛔ e o cabeçalho da tabela traz *"0 to 6
 *   hours"*. ⚠️ A divergência fica **registrada, ⛔ não harmonizada** (**§50**).
 *
 * UNIVERSO: `avc/conteudo/superficie-f.ts` × `avc/nucleo/veredito-da-trombectomia.ts`
 *   × `avc/nucleo/derivacoes-f.ts`.
 *
 * ── ⚠️⚠️ ⛔ O QUE ESTA FASE **⛔ NÃO** FEZ, ⛔ E ⛔ POR QUÊ ──────────────────
 *
 * ⛔ ⛔ Ela ⛔ **não transcreveu** o catálogo EVT. ⚠️ A conferência contra o PDF
 * da AHA/ASA 2026 (Prabhakaran et al · Stroke 2026;57:e316–e436) mostrou que as
 * dez recomendações **já correspondiam** — mesmo COR, LOE, verbo, seção ⛔ e
 * página. ⛔ Retranscrever teria refeito trabalho correto.
 *
 * ⚠️ ⛔ É a regra do projeto executada: **antes de declarar dívida, verificar
 * por execução se o conteúdo já existe**.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase9-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "nucleo", "veredito-da-trombectomia.ts"),
    /**
     * ⚠️ O vocabulário visual entra no universo desta prova ⛔ porque a Fase 9
     * passou a **prometer** que ⛔ nenhum estado da EVT usa o papel de `impede`.
     */
    path.join(appDir, "design-system", "estados-clinicos.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const SF = emT("avc", "conteudo", "superficie-f.js");
const VT = emT("avc", "nucleo", "veredito-da-trombectomia.js");
const SC = emT("avc", "conteudo", "superficie-c.js");
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const I = emT("avc", "nucleo", "instancia.js");
const CAMPOS = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const MRS = emT("avc", "conteudo", "mrs.js");
const DF = emT("avc", "nucleo", "derivacoes-f.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const evt = SF.RECOMENDACOES.filter((r) => r.terapia === "evt");

/* ══ ⚠️⚠️ 1 · O DOMÍNIO É ESTRUTURAL ═══════════════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ E ⛔ NÃO DEDUZIDO DO NOME ────────────────────────────────────
   *
   * ⚠️ Regra do autor: *"⛔ Não distinguir isso por nome do ID ⛔ ou busca
   * textual."* ⛔ Um `id.startsWith("evt_tecnica_")` seria a quinta varredura de
   * texto desta sessão — ⛔ e ⛔ a quarta passou verde sobre defeito real.
   */
  conf(
    "⚠️ há recomendações de EVT a conferir",
    evt.length >= 10,
    `⛔ ${evt.length} — trava sobre lista vazia fica verde ⛔ sem medir`
  );
  const semDominio = evt.filter((r) => r.dominio === undefined);
  conf(
    "⚠️⚠️ ⛔ TODA recomendação de EVT declara o seu **domínio**",
    semDominio.length === 0,
    `⛔ ${semDominio.map((r) => r.id).join(" · ")} — domínio ausente ⛔ não é *"elegibilidade"*: é decisão ⛔ não tomada`
  );
  const DOMINIOS = ["elegibilidade", "tecnica", "procedimento"];
  const invalidos = evt.filter((r) => !DOMINIOS.includes(r.dominio));
  conf(
    "⚠️ ⛔ e ⛔ nenhum domínio fora do vocabulário declarado",
    invalidos.length === 0,
    `⛔ ${invalidos.map((r) => `${r.id}=${r.dominio}`).join(" · ")}`
  );
}

/* ══ ⚠️⚠️ 2 · O VEREDITO CONSOLIDA ⛔ SÓ ELEGIBILIDADE ═════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ **A GARANTIA CENTRAL DA FASE**: ⛔ uma recomendação de **dispositivo**
   * ⛔ não pode responder *"este paciente é candidato a EVT?"*.
   *
   * ⛔ §4.7.4 rec. 5 diz que **stent retrievers** ⛔ não beneficiam em vaso
   * médio/distal. ⚠️ ⛔ Isso é escolha de **técnica** — ⛔ e deixá-la entrar no
   * veredito faria o app negar candidatura por causa de um dispositivo.
   */
  const usados = VT.RECOMENDACOES_DE_ELEGIBILIDADE;
  conf(
    "⚠️⚠️ o veredito parte ⛔ SÓ das recomendações de elegibilidade",
    Array.isArray(usados)
    && usados.length > 0
    && usados.every((r) => r.dominio === "elegibilidade" && r.terapia === "evt"),
    `⛔ ${(usados ?? []).filter((r) => r.dominio !== "elegibilidade").map((r) => r.id).join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA recomendação de técnica entra nele",
    (usados ?? []).every((r) => r.dominio !== "tecnica"),
    "⛔ dispositivo ⛔ não decide candidatura"
  );

  /** ⚠️ ⛔ E o catálogo **⛔ não perdeu** a de técnica — ⛔ ela existe, ⛔ à parte. */
  const tecnicas = evt.filter((r) => r.dominio === "tecnica");
  conf(
    "⚠️⚠️ ⛔ e a de TÉCNICA existe no catálogo, ⛔ com COR/LOE próprios",
    tecnicas.length >= 1
    && tecnicas.some((r) => /4\.7\.4/.test(r.localizacao) && /No Benefit/i.test(r.cor) && r.loe === "A"),
    `⛔ ${tecnicas.map((r) => `${r.id}[${r.cor}·${r.loe}·${r.localizacao}]`).join(" · ")} — conteúdo da fonte ⛔ não se joga fora`
  );

  /**
   * ⚠️ ⛔ E ⛔ ela ⛔ NÃO duplica a rec. 8 de §4.7.2: ⛔ uma fala de
   * **elegibilidade** por sítio, ⛔ a outra de **dispositivo**.
   */
  const rec8 = evt.find((r) => /4\.7\.2 rec\. 8/.test(r.localizacao));
  const tec5 = evt.find((r) => /4\.7\.4 rec\. 5/.test(r.localizacao));
  conf(
    "⚠️⚠️ ⛔ e ⛔ ela ⛔ NÃO substitui a rec. 8 de elegibilidade",
    rec8 !== undefined && tec5 !== undefined
    && rec8.id !== tec5.id
    && rec8.dominio === "elegibilidade" && tec5.dominio === "tecnica",
    `⛔ rec8=${rec8 && rec8.id}[${rec8 && rec8.dominio}] · tec5=${tec5 && tec5.id}[${tec5 && tec5.dominio}]`
  );
}

/* ══ ⚠️⚠️ 3 · `evt_ant_5` EXIGE ASPECTS ═══════════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O VERBATIM, AO PÉ DA LETRA (§4.7.2 rec. 5 · e368) ───────────
   *
   * > *"…presenting within 6 hours from onset of symptoms, with NIHSS score
   * >  ≥6, **and ASPECTS ≥6**, who have a prestroke mRS score of 2, EVT is
   * >  reasonable…"*
   *
   * ⛔ O `exige` trazia ⛔ só `sitio · nihss · mrs_previo`. ⚠️ ⛔ Sem `aspects`,
   * um paciente com **ASPECTS 2** fecharia a rec. 5 — ⛔ um critério que a
   * fonte ⛔ exige, ⛔ e que o motor ⛔ não cobrava.
   */
  const r5 = evt.find((r) => r.id === "evt_ant_5");
  conf(
    "⚠️⚠️ `evt_ant_5` exige **aspects**, como o verbatim manda",
    r5 !== undefined && r5.exige.includes("aspects"),
    `⛔ ${JSON.stringify(r5 && r5.exige)} — ⛔ *"and ASPECTS ≥6"* está na frase`
  );
  conf(
    "⚠️ ⛔ e ⛔ os outros quatro insumos continuam lá",
    r5 !== undefined
    && ["sitio_da_oclusao", "nihss", "mrs_previo"].every((i) => r5.exige.includes(i)),
    `⛔ ${JSON.stringify(r5 && r5.exige)}`
  );
}

/* ══ ⚠️⚠️ 4 · AS NOTAS `*` ⛔ E `†` ⛔ NÃO SE MISTURAM ═════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ DUAS NOTAS, ⛔ E ⛔ ELAS ⛔ NÃO SÃO A MESMA ───────────────────
   *
   * ⛔ A `*` pertence à rec. **3** (6–24 h · ASPECTS 3–5) ⛔ e cita insuficiência
   * renal, hipertensão refratária (PAS ≥185 ⛔ ou PAD ≥110) ⛔ e expectativa de
   * vida **<3 meses**.
   *
   * ⛔ A `†` pertence à rec. **4** (0–6 h · ASPECTS 0–2) ⛔ e cita tortuosidade
   * de vasos, crises no início que dificultem o NIHSS, suspeita de estenose
   * intracraniana ⛔ e expectativa de vida **<6 meses**.
   *
   * ⚠️⚠️ ⛔ **⛔ NÃO** é uma lista global de *"limitações da EVT"*: ⛔ fundi-las
   * inventaria critério para as duas.
   */
  const r3 = evt.find((r) => r.id === "evt_ant_3");
  const r4 = evt.find((r) => r.id === "evt_ant_4");
  conf(
    "⚠️ as duas recomendações carregam nota de generalização PRÓPRIA",
    r3 !== undefined && r4 !== undefined
    && r3.generalizacao !== undefined && r4.generalizacao !== undefined,
    `⛔ r3=${r3 && !!r3.generalizacao} · r4=${r4 && !!r4.generalizacao}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ elas ⛔ NÃO são o mesmo objeto ⛔ nem o mesmo texto",
    r3.generalizacao !== r4.generalizacao
    && r3.generalizacao.verbatim !== r4.generalizacao.verbatim,
    "⛔ uma lista global apagaria a diferença entre as duas populações"
  );
  conf(
    "⚠️⚠️ ⛔ e a EXPECTATIVA DE VIDA difere — **<3 meses** × **<6 meses**",
    /<3 months/.test(r3.generalizacao.verbatim)
    && /<6 months/.test(r4.generalizacao.verbatim),
    `⛔ r3="${r3.generalizacao.verbatim.slice(-60)}" · r4="${r4.generalizacao.verbatim.slice(-60)}"`
  );
  conf(
    "⚠️ ⛔ e cada uma cita o que ⛔ só ⛔ ela cita",
    /renal/i.test(r3.generalizacao.verbatim)
    && !/renal/i.test(r4.generalizacao.verbatim)
    && /tortuosity/i.test(r4.generalizacao.verbatim)
    && !/tortuosity/i.test(r3.generalizacao.verbatim),
    "⛔ trocar as notas entre as duas seria aplicar critério da população errada"
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ ELAS ⛔ NÃO SÃO CONTRAINDICAÇÃO — ⛔ decisão do autor: são
   * **limitações de generalização**, ⛔ e ⛔ o veredito ⛔ não as usa para negar.
   */
  const usaComoCriterio = evt.some((r) =>
    r.generalizacao !== undefined && (r.exige ?? []).some((i) => /generaliza|idade_80|expectativa/i.test(i))
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA delas virou critério de exclusão",
    !usaComoCriterio,
    "⛔ *«limited generalizability»* ⛔ não é *«não elegível»* — ⛔ é julgamento clínico necessário"
  );
}

/* ══ ⚠️⚠️ 5 · ⛔ NENHUM DOMÍNIO DEDUZIDO DE TEXTO ═════════════════════ */
{
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "veredito-da-trombectomia.ts"));
  conf(
    "⚠️⚠️ ⛔ o veredito ⛔ NÃO deduz domínio de id ⛔ nem de localização",
    !/startsWith\("evt_|includes\("tecnica"\)|\/4\\?\.7\\?\.4\//.test(fonte)
    && /dominio === "elegibilidade"/.test(fonte),
    "⛔ regra que pode virar dado ⛔ deve virar dado — ⛔ quatro varreduras de texto ⛔ já passaram verde nesta sessão"
  );

  /**
   * ── ⚠️⚠️⚠️ R1 (commit 2 · 2026-09-12) · A EVT ⛔ SÓ PODE IMPORTAR C ────
   *
   * ⛔ A barreira de classe (`barreiraDeReperfusao`, em `derivacoes-c`) é a
   * **única** coisa comum a IVT ⛔ e EVT. ⛔ `derivacoes-d` (cortes, DOAC,
   * antecedentes), `derivacoes-e` (correções), `portao-ivt` ⛔ e
   * `veredito-da-trombolise` são **da IVT** — ⛔ importá-los faria a EVT herdar
   * contraindicação que ⛔ não é dela (**E-11**).
   */
  const importsProibidos = fonte.match(/from "\.\/(derivacoes-d|derivacoes-e|portao-ivt|veredito-da-trombolise|derivacoes-lab)"/g) ?? [];
  conf(
    "⚠️⚠️⚠️ ⛔ a EVT ⛔ NÃO importa D, E, portão ⛔ nem veredito da IVT",
    importsProibidos.length === 0 && /from "\.\/derivacoes-c"/.test(fonte),
    `⛔ ${importsProibidos.join(" · ")} — a única coisa comum é a leitura de C`
  );
}


/* ══════════════════════════════════════════════════════════════════════════
 * ⚠️⚠️⚠️ 6 · O MOTOR TESTA O **CRITÉRIO**, ⛔ E ⛔ NÃO A PRESENÇA DO DADO
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ESTA PARTE FECHA (achado por execução, 2026-09-07)
 *
 * ⛔ `valorDoInsumo()` respondia *"há dado registrado?"*. ⚠️ ⛔ Para a IVT isso
 * bastava — os insumos dela são quase todos ternários. ⛔ **A EVT é o primeiro
 * consumidor cujos critérios são faixas numéricas ⛔ e sítios anatômicos**, ⛔ e
 * ali a presença ⛔ não diz ⛔ nada.
 *
 * ⛔ Um M1 com NIHSS 14, ASPECTS 8 ⛔ e mRS 0 fechava **cinco** recomendações de
 * populações que se excluem — inclusive a de **mRS 3–4** ⛔ e a de **M2**. ⛔ E um
 * paciente com **⛔ só** *"basilar"* registrado recebia veredito **negativo** por
 * uma recomendação escrita para **M2 ⛔ não dominante**.
 *
 * ⚠️⚠️ ⛔ A REGRA VIRA DADO: cada recomendação declara `criterios`, ⛔ e ⛔ o motor
 * ⛔ não carrega ⛔ nenhum corte no código.
 * ══════════════════════════════════════════════════════════════════════════ */

const rel = R.relogioControlado(1_000_000_000);
const AGORA = 1_000_000_000;
const H = 3_600_000;
const est1 = I.nomeDaInstancia("estudo", 1);
const regI = (e, c, v) => CAMPOS.registrarComInstancia(e, { campo: c, valor: v }, rel, est1);
const reg = (e, c, v) => E.registrarFato(e, { campo: c, valor: v }, rel);

/**
 * ⚠️ Monta um paciente do jeito que as telas montam — ⛔ campo a campo, ⛔ e
 * ⛔ nenhum atalho por dentro do estado.
 */
function paciente(p) {
  let e = E.abrirAtendimento(rel);
  if (p.sitio !== undefined) {
    e = regI(e, "estudo_modalidade", CAMPO.valorDaOpcao("Angiotomografia"));
    e = regI(e, "sitio_oclusao", CAMPO.valorDaOpcao(p.sitio));
  }
  if (p.aspects !== undefined) e = regI(e, "aspects", p.aspects);
  if (p.pcAspects !== undefined) e = regI(e, "pc_aspects", p.pcAspects);
  if (p.massa !== undefined) e = regI(e, "efeito_de_massa", CAMPO.valorDaOpcao(p.massa));
  if (p.nihss !== undefined) e = reg(e, "nihss_informado", p.nihss);
  /**
   * ⚠️⚠️⚠️ ⛔ O mRS ENTRA COMO A **TELA** O GRAVA — ⛔ e ⛔ isto ⛔ não é detalhe.
   *
   * ⛔ ⛔ Eu gravava `mrs_previo: 0`, um número cru. ⚠️ ⛔ A tela grava
   * `"0 · assintomático"`, ⛔ porque o campo é de **escolha** — ⛔ e o motor
   * lia `typeof v === "number"`, ⛔ devolvendo `undefined` **para sempre**.
   *
   * ⚠️⚠️ ⛔ A prova ficava verde medindo **um formato que o app ⛔ nunca
   * produz**. ⛔ Quem pegou foi o **e2e de gesto real**, ⛔ e ⛔ é por isso que
   * a regra dele existe.
   */
  if (p.mrs !== undefined) {
    e = reg(e, "mrs_previo", CAMPO.valorDaOpcao(MRS.rotuloDoGrau(
      MRS.GRAUS_MRS.find((g) => g.grau === String(p.mrs))
    )));
  }
  if (p.idade !== undefined) e = reg(e, "idade", p.idade);
  if (p.horas !== undefined) e = reg(e, "hora_inicio_observado", AGORA - p.horas * H);
  return e;
}

const ver = (p) => VT.vereditoDaTrombectomia(paciente(p), AGORA);
const ids = (ms) => ms.map((m) => m.id).sort();

const M1 = "M1 da artéria cerebral média";
const BASILAR = "Artéria basilar ou circulação posterior";
const M2ND = "M2 não dominante ou codominante";
const M2D = "M2 dominante da artéria cerebral média";

/* ── ⚠️ 6.1 · o vocabulário anatômico é dado, ⛔ e cobre o campo inteiro ── */
{
  conf(
    "⚠️⚠️ existe um mapa **opção do laudo → território**, ⛔ e ⛔ ele ⛔ não é busca textual",
    SC.TERRITORIO_DA_OPCAO !== undefined
    && SC.TERRITORIO_DA_OPCAO[M1] === "m1"
    && SC.TERRITORIO_DA_OPCAO[BASILAR] === "basilar"
    && SC.TERRITORIO_DA_OPCAO[M2D] === "m2_dominante"
    && SC.TERRITORIO_DA_OPCAO[M2ND] === "m2_nao_dominante",
    "⛔ sem vocabulário estrutural, o sítio volta a ser comparado por rótulo"
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ NENHUMA OPÇÃO FICA DE FORA — ⛔ uma opção sem território seria
   * um sítio que ⛔ nunca contradiz ⛔ nada, ⛔ e o defeito voltaria calado por ali.
   */
  const semMapa = (SC.OPCOES_SITIO_OCLUSAO ?? []).filter(
    (o) => !(o in (SC.TERRITORIO_DA_OPCAO ?? {}))
  );
  conf(
    "⚠️⚠️ ⛔ e as ONZE opções do campo estão TODAS mapeadas",
    semMapa.length === 0,
    `⛔ sem território: ${semMapa.join(" · ")}`
  );
}

/* ── ⚠️ 6.2 · toda recomendação de elegibilidade declara seus critérios ── */
{
  const eleg = VT.RECOMENDACOES_DE_ELEGIBILIDADE ?? [];
  const semCriterios = eleg.filter((r) => r.criterios === undefined);
  conf(
    "⚠️⚠️ ⛔ TODA recomendação de elegibilidade declara `criterios`",
    eleg.length >= 10 && semCriterios.length === 0,
    `⛔ ${semCriterios.map((r) => r.id).join(" · ")} — sem critério declarado, ⛔ ela conclui por presença`
  );
  /** ⚠️ ⛔ E ⛔ nenhum insumo exigido fica **sem** critério que o julgue. */
  const orfaos = [];
  for (const r of eleg) {
    for (const i of r.exige) {
      if (i === "janela") continue;
      if (!(r.criterios ?? {})[i]) orfaos.push(`${r.id}:${i}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM insumo exigido fica sem critério que o julgue",
    orfaos.length === 0,
    `⛔ ${orfaos.join(" · ")} — insumo exigido ⛔ sem critério ⛔ é presença disfarçada`
  );
  /** ⚠️⚠️ ⛔ E ⛔ NÃO existe critério global: cada uma carrega o seu. */
  const fonte = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-f.ts"));
  conf(
    "⚠️⚠️ ⛔ e ⛔ NÃO existe um `CRITERIOS_EVT_GERAIS` sobrescrito depois",
    !/CRITERIOS_EVT|CRITERIOS_GERAIS|criteriosPadrao/i.test(fonte),
    "⛔ um molde global parcialmente sobrescrito repetiria o erro das notas fundidas"
  );
}

/* ── ⚠️⚠️ 6.3 · OS CINCO CASOS ─────────────────────────────────────────── */

/** ⚠️ CASO 1 · M1 · NIHSS 14 · ASPECTS 8 · mRS 0 · 2 h. */
{
  const v = ver({ sitio: M1, nihss: 14, aspects: 8, mrs: 0, horas: 2 });
  conf(
    "⚠️⚠️ CASO 1 · M1/NIHSS 14/ASPECTS 8/mRS 0 em 2 h → **recomendada**",
    v.tipo === "recomendada",
    `⛔ ${v.tipo}`
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ SÓ A REC. 1 SUSTENTA. ⛔ As outras são de **outras populações**:
   * mRS 2, mRS 3–4, M2 dominante, M2 ⛔ não dominante, basilar. ⛔ Antes, cinco
   * apareciam juntas.
   */
  conf(
    "⚠️⚠️ ⛔ e ⛔ SÓ a rec. 1 sustenta — ⛔ nenhuma população alheia",
    JSON.stringify(ids(v.sustentam)) === JSON.stringify(["evt_ant_1"]),
    `⛔ ${ids(v.sustentam).join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA COR 3 alcança um M1",
    v.contra.length === 0,
    `⛔ ${ids(v.contra).join(" · ")} — a rec. 8 é de M2 ⛔ não dominante, ⛔ ACM distal, ACA ⛔ e ACP`
  );
}

/** ⚠️ CASO 2 · M1 · NIHSS 3 · ASPECTS 2 — ⛔ os dois abaixo do corte. */
{
  const v = ver({ sitio: M1, nihss: 3, aspects: 2, mrs: 0, horas: 2 });
  conf(
    "⚠️⚠️ CASO 2 · NIHSS 3 ⛔ NÃO fecha recomendação que exige ≥6",
    v.tipo !== "recomendada"
    && !ids(v.sustentam).includes("evt_ant_1")
    && !ids(v.sustentam).includes("evt_ant_4"),
    `⛔ ${v.tipo} · ${ids(v.sustentam).join(" · ")}`
  );
}

/** ⚠️ CASO 3 · basilar · NIHSS 12 · PC-ASPECTS 7 · mRS 0 · 10 h. */
{
  const v = ver({ sitio: BASILAR, nihss: 12, pcAspects: 7, mrs: 0, horas: 10 });
  conf(
    "⚠️⚠️ CASO 3 · basilar/NIHSS 12/PC-ASPECTS 7 em 10 h → **recomendada** pela posterior",
    v.tipo === "recomendada"
    && JSON.stringify(ids(v.sustentam)) === JSON.stringify(["evt_basilar_1"]),
    `⛔ ${v.tipo} · ${ids(v.sustentam).join(" · ")}`
  );
  conf(
    "⚠️ ⛔ e ⛔ nenhuma recomendação de circulação ANTERIOR entra",
    [...v.sustentam, ...v.contra].every((m) => !m.id.startsWith("evt_ant")
      && !m.id.startsWith("evt_m2")),
    `⛔ ${[...ids(v.sustentam), ...ids(v.contra)].join(" · ")}`
  );
}

/** ⚠️ CASO 4 · basilar · NIHSS 7 — a faixa 6–9 da fonte. */
{
  const v = ver({ sitio: BASILAR, nihss: 7, pcAspects: 7, mrs: 0, horas: 10 });
  conf(
    "⚠️⚠️ CASO 4 · basilar/NIHSS 7 → **efetividade ⛔ não estabelecida**, ⛔ e ⛔ NÃO COR 1",
    v.tipo === "efetividade_nao_estabelecida",
    `⛔ ${v.tipo} · sustentam=${ids(v.sustentam).join(" · ")}`
  );
  /**
   * ⚠️⚠️⚠️ ⛔ E ⛔ ELA CARREGA **COR/LOE**, ⛔ numa lista PRÓPRIA.
   *
   * ⛔ ⛔ Antes, este estado saía com `sustentam` ⛔ e `contra` **vazios** — ⛔ e
   * a tela ⛔ **⛔ não tinha como mostrar** *COR 2b · LOE B-R*. ⚠️ Achado pelo
   * e2e da basilar, ⛔ e ⛔ não por ⛔ nenhuma conferência de motor.
   *
   * ⚠️⚠️ ⛔ E ⛔ ela ⛔ NÃO entra em `sustentam`: ⛔ *"is not well established"*
   * ⛔ não sustenta ⛔ nada.
   */
  conf(
    "⚠️⚠️⚠️ ⛔ e a recomendação vem em `semForca`, ⛔ com COR 2b · LOE B-R ⛔ e o verbo",
    v.semForca.length === 1
    && v.semForca[0].id === "evt_basilar_2"
    && v.semForca[0].cor === "2b" && v.semForca[0].loe === "B-R"
    && /not well established/i.test(v.semForca[0].verbo)
    && v.sustentam.length === 0,
    `⛔ semForca=${JSON.stringify((v.semForca ?? []).map((m) => m.id))} sustentam=${ids(v.sustentam).join(",")}`
  );
}

/** ⚠️ CASO 5 · M2 proximal ⛔ não dominante. */
{
  const v = ver({ sitio: M2ND, nihss: 12, aspects: 8, mrs: 0, horas: 2 });
  conf(
    "⚠️⚠️ CASO 5 · M2 ⛔ não dominante → **⛔ não recomendada, sem benefício**",
    v.tipo === "nao_recomendada_sem_beneficio"
    && ids(v.contra).includes("evt_m2_nao_dominante"),
    `⛔ ${v.tipo} · contra=${ids(v.contra).join(" · ")}`
  );
  conf(
    "⚠️ ⛔ e ⛔ ela ⛔ NÃO contamina as anatomias vizinhas",
    ids(v.sustentam).length === 0,
    `⛔ ${ids(v.sustentam).join(" · ")} — M2 ⛔ não dominante ⛔ não fecha rec. de ICA/M1 ⛔ nem de M2 dominante`
  );
}

/**
 * ⚠️⚠️⚠️ CASO 6 · **A POPULAÇÃO ⛔ NÃO SE TROCA POR CAMPO PREENCHIDO**.
 *
 * ── ⚠️⚠️ ⛔ O CASO QUE FALTAVA (mutação **M10** sobreviveu, 2026-09-07) ────
 *
 * ⛔ ⛔ Eu deixei a rec. 1 (ICA/M1) aceitar `basilar` ⛔ e a prova **passou
 * verde**: ⛔ nenhum caso dava a um paciente posterior o conjunto **completo**
 * de dados anteriores, ⛔ então a rec. 1 morria por *falta de ASPECTS* — ⛔ e
 * ⛔ não pelo território. ⚠️ ⛔ Ela morria pelo motivo errado.
 *
 * ⚠️⚠️ ⛔ Aqui **tudo** está registrado. ⛔ Se o território ⛔ não discriminar,
 * ⛔ nada mais o fará — ⛔ é o critério de autorização da UI, ao pé da letra:
 * *"⛔ um paciente de uma população ⛔ não pode satisfazer recomendação escrita
 * para outra população ⛔ apenas porque os mesmos campos estão preenchidos."*
 */
{
  const tudo = {
    sitio: BASILAR, nihss: 14, aspects: 8, pcAspects: 7,
    mrs: 0, idade: 60, massa: "Não", horas: 2,
  };
  const v = ver(tudo);
  const alcancadas = [...v.sustentam, ...v.contra].map((m) => m.id);
  conf(
    "⚠️⚠️⚠️ CASO 6 · basilar com **TODOS** os campos anteriores preenchidos",
    alcancadas.every((id) => id.startsWith("evt_basilar")),
    `⛔ ${alcancadas.join(" · ")} — ⛔ campo preenchido ⛔ não é população`
  );
  /** ⚠️ ⛔ E o espelho: um M1 com PC-ASPECTS anotado ⛔ não vira basilar. */
  const anterior = ver({ ...tudo, sitio: M1 });
  const alcAnt = [...anterior.sustentam, ...anterior.contra].map((m) => m.id);
  conf(
    "⚠️⚠️ ⛔ e o espelho — M1 com PC-ASPECTS anotado ⛔ NÃO alcança a basilar",
    alcAnt.every((id) => !id.startsWith("evt_basilar")),
    `⛔ ${alcAnt.join(" · ")}`
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ NENHUM TERRITÓRIO alcança recomendação de outro — ⛔ a varredura
   * inteira, ⛔ e ⛔ não ⛔ só os dois pares que eu lembrei de escrever.
   */
  const TERRITORIOS = Object.keys(SC.TERRITORIO_DA_OPCAO ?? {});
  const vazamentos = [];
  for (const rotulo of TERRITORIOS) {
    const t = SC.TERRITORIO_DA_OPCAO[rotulo];
    if (t === "indeterminado" || t === "nenhuma") continue;
    const vd = ver({ ...tudo, sitio: rotulo });
    for (const m of [...vd.sustentam, ...vd.contra]) {
      const rec = evt.find((r) => r.id === m.id);
      const aceitos = rec?.criterios?.sitio_da_oclusao?.in ?? [];
      if (!aceitos.includes(t)) vazamentos.push(`${t}→${m.id}`);
    }
  }
  conf(
    "⚠️⚠️⚠️ ⛔ e ⛔ NENHUM dos oito territórios alcança recomendação alheia",
    vazamentos.length === 0,
    `⛔ ${vazamentos.join(" · ")}`
  );
}

/* ── ⚠️⚠️ 6.4 · FRONTEIRAS ─────────────────────────────────────────────── */
{
  const base = { sitio: M1, aspects: 8, mrs: 0, horas: 2 };
  conf(
    "⚠️⚠️ NIHSS **5 × 6** — a fronteira da fonte (*≥6*)",
    !ids(ver({ ...base, nihss: 5 }).sustentam).includes("evt_ant_1")
    && ids(ver({ ...base, nihss: 6 }).sustentam).includes("evt_ant_1"),
    "⛔ *«NIHSS score ≥6»* ⛔ não admite 5"
  );
  const bas = { sitio: BASILAR, pcAspects: 7, mrs: 0, horas: 10 };
  conf(
    "⚠️⚠️ NIHSS **9 × 10** na basilar — 9 é *not well established*, 10 é COR 1",
    ver({ ...bas, nihss: 9 }).tipo === "efetividade_nao_estabelecida"
    && ver({ ...bas, nihss: 10 }).tipo === "recomendada",
    `⛔ 9→${ver({ ...bas, nihss: 9 }).tipo} · 10→${ver({ ...bas, nihss: 10 }).tipo}`
  );
  conf(
    "⚠️⚠️ ASPECTS **2 × 3** — a rec. 1 pede *3 to 10*",
    !ids(ver({ ...base, nihss: 14, aspects: 2 }).sustentam).includes("evt_ant_1")
    && ids(ver({ ...base, nihss: 14, aspects: 3 }).sustentam).includes("evt_ant_1"),
    "⛔ ASPECTS 2 ⛔ não está em 3–10"
  );
  conf(
    "⚠️⚠️ ASPECTS **5 × 6** — a rec. 5 pede *≥6*",
    !ids(ver({ sitio: M1, nihss: 14, aspects: 5, mrs: 2, horas: 2 }).sustentam).includes("evt_ant_5")
    && ids(ver({ sitio: M1, nihss: 14, aspects: 6, mrs: 2, horas: 2 }).sustentam).includes("evt_ant_5"),
    "⛔ *«and ASPECTS ≥6»*"
  );
  /**
   * ⚠️⚠️ ⛔ IDADE **79 × 80** — ⛔ e a fonte escreve **`<80`**, ⛔ estritamente.
   * ⛔ Virar `≤80` incluiria uma idade que os ensaios ⛔ não sustentaram.
   */
  const r3 = { sitio: M1, nihss: 14, aspects: 4, mrs: 0, massa: "Não", horas: 10 };
  conf(
    "⚠️⚠️ IDADE **79 × 80** — *«age <80 years»* é estrito",
    ids(ver({ ...r3, idade: 79 }).sustentam).includes("evt_ant_3")
    && !ids(ver({ ...r3, idade: 80 }).sustentam).includes("evt_ant_3"),
    `⛔ 79→${ids(ver({ ...r3, idade: 79 }).sustentam).join(",")} · 80→${ids(ver({ ...r3, idade: 80 }).sustentam).join(",")}`
  );
  /** ⚠️⚠️ mRS 0/1 · 2 · 3–4 — ⛔ TRÊS populações que ⛔ não se substituem. */
  const m = (mrs) => ids(ver({ sitio: M1, nihss: 14, aspects: 8, mrs, horas: 2 }).sustentam);
  conf(
    "⚠️⚠️ mRS **0 · 2 · 3** caem em recomendações DIFERENTES",
    JSON.stringify(m(0)) === JSON.stringify(["evt_ant_1"])
    && JSON.stringify(m(2)) === JSON.stringify(["evt_ant_5"])
    && JSON.stringify(m(3)) === JSON.stringify(["evt_ant_6"]),
    `⛔ mRS0=${m(0).join(",")} · mRS2=${m(2).join(",")} · mRS3=${m(3).join(",")}`
  );
  /**
   * ⚠️⚠️ ⛔ A JANELA — ⛔ e ⛔ ela ⛔ NÃO é mais decorativa.
   *
   * ⚠️⚠️ ⛔ **A SOBREPOSIÇÃO EM 6 h É DA FONTE**, ⛔ e ⛔ não minha: a rec. 1 diz
   * *"within 6 hours"* ⛔ e a rec. 2 diz *"between 6 and 24 hours"*. ⛔ Em
   * ⛔ exatamente 6 h ⛔ as duas alcançam o paciente, ⛔ e o app mostra as duas.
   * ⛔ Escolher um lado seria regra clínica que a fonte ⛔ não deu.
   */
  const j = (horas) => ids(ver({ sitio: M1, nihss: 14, aspects: 8, mrs: 0, horas }).sustentam);
  conf(
    "⚠️⚠️ JANELA **5h59 × 6h01** — a rec. 1 vale até 6 h, a rec. 2 começa em 6 h",
    j(5.983).includes("evt_ant_1") && !j(5.983).includes("evt_ant_2")
    && j(6.017).includes("evt_ant_2") && !j(6.017).includes("evt_ant_1"),
    `⛔ 5h59=${j(5.983).join(",")} · 6h01=${j(6.017).join(",")}`
  );
  conf(
    "⚠️⚠️ ⛔ e em **6 h exatas** as DUAS alcançam — ⛔ a sobreposição é da fonte",
    j(6).includes("evt_ant_1") && j(6).includes("evt_ant_2"),
    `⛔ ${j(6).join(",")} — *«within 6 hours»* ⛔ e *«between 6 and 24 hours»* se tocam em 6`
  );
  const b = (horas) => ids(ver({ sitio: BASILAR, nihss: 12, pcAspects: 7, mrs: 0, horas }).sustentam);
  conf(
    "⚠️⚠️ JANELA **23h59 × 24h01** na basilar — *«within 24 hours»*",
    b(23.983).includes("evt_basilar_1") && !b(24.017).includes("evt_basilar_1"),
    `⛔ 23h59=${b(23.983).join(",")} · 24h01=${b(24.017).join(",")}`
  );
  /** ⚠️ ⛔ Sem marco horário, a janela é **ausência** — ⛔ e ⛔ nunca "dentro". */
  const semHora = ver({ sitio: M1, nihss: 14, aspects: 8, mrs: 0 });
  conf(
    "⚠️⚠️ ⛔ SEM horário de início, a janela ⛔ NÃO se dá por cumprida",
    semHora.tipo === "incompleta" && semHora.faltam.some((f) => f.insumo === "janela"),
    `⛔ ${semHora.tipo} · faltam=${semHora.faltam.map((f) => f.insumo).join(",")} — ⛔ ausência de relógio ⛔ não é *«dentro da janela»*`
  );
}

/* ── ⚠️⚠️ 6.4b · A JANELA DA REC. 8 — ⛔ o cabeçalho **é** da fonte ───────── */
{
  /**
   * ── ⚠️⚠️ ⛔ DECISÃO DO AUTOR, 2026-09-07 ────────────────────────────────
   *
   * ⚠️ Eu havia deixado `janelas: []` ⛔ porque a **frase** da rec. 8 ⛔ não
   * repete a janela. ⛔ O autor decidiu, ⛔ e a fonte lhe dá razão: o cabeçalho
   * ⛔ imediatamente acima da linha é explícito —
   *
   * > *"Thrombectomy **0 to 6 hours** for nondominant proximal M2 division MCA,
   * >  distal MCA, anterior cerebral artery, and posterior cerebral artery
   * >  occlusions"*
   *
   * ⚠️⚠️ ⛔ E a consequência clínica é grande: ⛔ sem janela, um M2 ⛔ não
   * dominante de **30 horas** recebia *"⛔ não recomendada"* de uma
   * recomendação cujo cabeçalho a limita às primeiras seis.
   */
  const r8 = evt.find((r) => r.id === "evt_m2_nao_dominante");
  conf(
    "⚠️⚠️ a rec. 8 declara a janela **0–6 h** do cabeçalho da tabela",
    r8 !== undefined
    && r8.janelas.length === 1
    && (r8.janelas[0].deHoras ?? 0) === 0
    && r8.janelas[0].ateHoras === 6
    && r8.criterios?.janela !== undefined
    && r8.exige.includes("janela"),
    `⛔ janelas=${JSON.stringify(r8 && r8.janelas)} · exige=${JSON.stringify(r8 && r8.exige)}`
  );
  conf(
    "⚠️ ⛔ e o verbatim guardado é o **do cabeçalho**, ⛔ não o da frase",
    r8 !== undefined && /0 to 6 hours for nondominant/i.test(r8.janelas[0]?.verbatim ?? ""),
    `⛔ "${r8 && r8.janelas[0] && r8.janelas[0].verbatim}"`
  );

  const w = (horas) => ver({ sitio: M2ND, nihss: 12, aspects: 8, mrs: 0, horas });
  conf(
    "⚠️⚠️ M2 ⛔ não dominante em **5h59** → a COR 3 alcança o caso",
    w(5.983).tipo === "nao_recomendada_sem_beneficio"
    && ids(w(5.983).contra).includes("evt_m2_nao_dominante"),
    `⛔ ${w(5.983).tipo} · contra=${ids(w(5.983).contra).join(",")}`
  );
  conf(
    "⚠️⚠️ ⛔ e em **6h01** ⛔ ELA ⛔ NÃO se aplica mais",
    !ids(w(6.017).contra).includes("evt_m2_nao_dominante"),
    `⛔ contra=${ids(w(6.017).contra).join(",")} — ⛔ fora da janela do cabeçalho`
  );
  conf(
    "⚠️⚠️ ⛔ e em **6h exatas** vale a MESMA semântica inclusiva de *0–6 h*",
    ids(w(6).contra).includes("evt_m2_nao_dominante"),
    `⛔ contra=${ids(w(6).contra).join(",")} — ⛔ inventar 5:59:59 seria regra que a fonte ⛔ não deu`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ E **SEM HORÁRIO** ELA ⛔ NÃO CONCLUI — ⛔ nem a favor ⛔ nem contra.
   *
   * ⛔ ⛔ Consequência direta da correção: ⛔ antes, a rec. 8 fechava ⛔ só com o
   * sítio. ⚠️ Agora falta o relógio, ⛔ e o veredito precisa **dizer isso** —
   * ⛔ `sem_criterios` ali seria falso, ⛔ porque um critério **alcança** o caso;
   * ⛔ o que ⛔ não dá é para terminar de avaliá-lo (**E-23**, **E-26**).
   */
  const semHora = ver({ sitio: M2ND, nihss: 12, aspects: 8, mrs: 0 });
  conf(
    "⚠️⚠️⚠️ M2 ⛔ não dominante ⛔ SEM horário → **incompleta**, nomeando o relógio",
    semHora.tipo === "incompleta" && semHora.faltam.some((f) => f.insumo === "janela"),
    `⛔ ${semHora.tipo} · faltam=[${semHora.faltam.map((f) => f.insumo).join(",")}] — ⛔ pendência ⛔ sem saída viola **E-26**`
  );
  /** ⚠️ ⛔ E ⛔ nada é cobrado de recomendação **já contradita** pelo sítio. */
  conf(
    "⚠️⚠️ ⛔ e ⛔ NADA é cobrado das recomendações já contraditas",
    semHora.faltam.every((f) => f.insumo !== "pc_aspects" && f.insumo !== "idade"),
    `⛔ faltam=[${semHora.faltam.map((f) => f.insumo).join(",")}] — ⛔ PC-ASPECTS é da basilar, ⛔ que o sítio já excluiu`
  );
}

/* ── ⚠️ 6.5 · EFEITO DE MASSA — três saídas, ⛔ e ⛔ não duas ────────────── */
{
  const r3 = { sitio: M1, nihss: 14, aspects: 4, mrs: 0, idade: 60, horas: 10 };
  const semResposta = ver(r3);
  conf(
    "⚠️⚠️ efeito de massa ⛔ NÃO informado → **falta nomeada**, ⛔ e ⛔ não ausência",
    semResposta.tipo === "incompleta"
    && semResposta.faltam.some((f) => f.insumo === "efeito_de_massa_ausente"),
    `⛔ ${semResposta.tipo} · faltam=${semResposta.faltam.map((f) => f.insumo).join(",")}`
  );
  conf(
    "⚠️ ⛔ e *«Não»* satisfaz · *«Sim»* contradiz",
    ids(ver({ ...r3, massa: "Não" }).sustentam).includes("evt_ant_3")
    && !ids(ver({ ...r3, massa: "Sim" }).sustentam).includes("evt_ant_3"),
    "⛔ a fonte pede *«without significant mass effect on imaging»*"
  );
}

/* ── ⚠️⚠️ 6.6 · PC-ASPECTS ⛔ NÃO É ASPECTS ────────────────────────────── */
{
  const comAnterior = ver({ sitio: BASILAR, nihss: 12, aspects: 9, mrs: 0, horas: 10 });
  conf(
    "⚠️⚠️ ASPECTS anterior ⛔ NÃO substitui PC-ASPECTS na basilar",
    comAnterior.tipo === "incompleta" && comAnterior.faltam.some((f) => f.insumo === "pc_aspects"),
    `⛔ ${comAnterior.tipo} · faltam=${comAnterior.faltam.map((f) => f.insumo).join(",")} — ⛔ são escalas diferentes, ⛔ de territórios diferentes`
  );
}

/* ── ⚠️⚠️ 6.7 · A REC. DE TÉCNICA ⛔ NÃO MOVE O VEREDITO (executado) ───── */
{
  /**
   * ⚠️⚠️ ⛔ A conferência estrutural da seção 2 mede o **array**. ⛔ Esta mede o
   * **veredito**, ⛔ que é o que o médico lê. ⛔ Um motor que ignorasse a
   * constante ⛔ e relesse `RECOMENDACOES` passaria lá ⛔ e morreria aqui.
   *
   * ⛔ A rec. de técnica tem `exige: []` — ⛔ ela é `aplicavel` em **todo**
   * paciente. ⛔ Se entrasse, **todo** veredito viraria COR 3.
   */
  /**
   * ⚠️⚠️ ⛔ O PACIENTE É **M2 ⛔ NÃO DOMINANTE** DE PROPÓSITO — ⛔ e ⛔ isto foi
   * corrigido depois de eu quase deixar a conferência cega.
   *
   * ⛔ ⛔ Com um M1, a rec. de técnica ⛔ já ⛔ não alcançaria o caso **pelo
   * território**, ⛔ e a trava ficaria verde ⛔ sem medir o **domínio**. ⚠️ Aqui
   * ⛔ ela **é** do território — ⛔ e ⛔ o que a mantém fora do veredito é ⛔ só a
   * separação entre elegibilidade ⛔ e técnica.
   */
  const v = ver({ sitio: M2ND, nihss: 12, aspects: 8, mrs: 0, horas: 2 });
  const todos = [...v.sustentam, ...v.contra].map((m) => m.id);
  conf(
    "⚠️⚠️ ⛔ a recomendação de TÉCNICA ⛔ NÃO aparece no veredito executado",
    !todos.includes("evt_tecnica_stent_retriever_distal")
    /** ⚠️ ⛔ E a de **elegibilidade** do mesmo território aparece — ⛔ prova de
     *  que o caso ⛔ realmente alcança as duas, ⛔ e ⛔ só uma passa. */
    && todos.includes("evt_m2_nao_dominante"),
    `⛔ ${todos.join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ ela continua `aplicavel` na leitura crua — ⛔ o domínio é que a barra",
    DF.recomendacoesDoEstado(paciente({ sitio: M2ND, nihss: 12, aspects: 8, mrs: 0, horas: 2 }), AGORA)
      .some((l) => l.id === "evt_tecnica_stent_retriever_distal" && l.correspondencia === "aplicavel")
    /** ⚠️⚠️ ⛔ E ⛔ ela ⛔ NÃO alcança quem ⛔ não é do território dela. */
    && DF.recomendacoesDoEstado(paciente({ sitio: M1, nihss: 14, aspects: 8, mrs: 0, horas: 2 }), AGORA)
      .every((l) => l.id !== "evt_tecnica_stent_retriever_distal"
        || l.correspondencia === "nao_corresponde"),
    "⛔ se ⛔ nem aplicável ⛔ ela fosse, a trava do domínio ficaria verde ⛔ sem medir ⛔ nada"
  );
}

/* ── ⚠️⚠️ 6.8 · A IVT ⛔ NÃO FOI TOCADA ────────────────────────────────── */
{
  /**
   * ⚠️⚠️ ⛔ O motor da IVT lê a **mesma** camada de insumos. ⛔ Nenhuma
   * recomendação de IVT declara `criterios` — ⛔ e por isso ⛔ nenhuma delas muda
   * de comportamento. ⚠️ ⛔ Isto é o **§50** executado: a regra clínica que já
   * funcionava ⛔ não se altera de carona.
   */
  const ivtComCriterios = SF.RECOMENDACOES.filter(
    (r) => r.terapia === "ivt" && r.criterios !== undefined
  );
  conf(
    "⚠️⚠️ ⛔ NENHUMA recomendação de IVT ganhou `criterios` de carona",
    ivtComCriterios.length === 0,
    `⛔ ${ivtComCriterios.map((r) => r.id).join(" · ")}`
  );
}

/* ══ ⚠️⚠️ 6.9 · ⛔ NENHUM SLUG CHEGA À TELA ════════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ **UM** mapa de rótulos, ⛔ e ⛔ não dois.
   *
   * ⛔ ⛔ Eu havia criado um `ROTULO_CLINICO_DO_INSUMO` ⛔ só para a EVT — ⛔ uma
   * segunda verdade sobre o mesmo fato, livre para divergir de
   * `ROTULO_CLINICO` (**I6**). ⚠️ Apagado; ⛔ o que ficou foi **esta** trava,
   * ⛔ que dá ao mapa único a exaustividade que o `Record<Insumo, …>` daria.
   */
  const RC = emT("avc", "conteudo", "rotulos-clinicos.js");
  const INSUMOS = new Set();
  for (const r of SF.RECOMENDACOES) for (const i of r.exige) INSUMOS.add(i);
  const semRotulo = [...INSUMOS].filter((i) => RC.ROTULO_CLINICO[i] === undefined);
  conf(
    "⚠️⚠️ ⛔ TODO insumo exigido tem rótulo clínico — ⛔ nenhum slug na tela",
    INSUMOS.size >= 10 && semRotulo.length === 0,
    `⛔ sem rótulo: ${semRotulo.join(" · ")} — ⛔ o identificador ⛔ nunca chega ao médico`
  );

  /**
   * ⚠️⚠️ ⛔ E O **FUNDAMENTO** VEM COM VALOR, ⛔ formatado no núcleo.
   *
   * ⛔ ⛔ Regra do autor: *"A tela ⛔ não pode recalcular … ⛔ Tudo vem do
   * núcleo."* ⛔ Se `fechouCom` trouxesse ⛔ só os nomes, a tela teria de reler
   * o estado para escrever *"NIHSS 14"* — ⛔ e ⛔ seriam duas leituras do mesmo
   * fato.
   */
  const v = ver({ sitio: M1, nihss: 14, aspects: 8, mrs: 0, horas: 2.133 });
  const f = v.sustentam[0]?.fechouCom ?? [];
  const por = (i) => f.find((x) => x.insumo === i);
  conf(
    "⚠️⚠️ o fundamento traz **rótulo ⛔ e valor**, ⛔ e ⛔ nenhum slug",
    por("nihss")?.valor === "14"
    && por("aspects")?.valor === "8"
    && por("mrs_previo")?.valor === "0"
    && por("sitio_da_oclusao")?.valor === M1
    && f.every((x) => x.rotulo !== x.insumo && !/_/.test(x.rotulo)),
    `⛔ ${f.map((x) => `${x.rotulo}=${x.valor}`).join(" · ")}`
  );
  conf(
    "⚠️⚠️ ⛔ e a JANELA vem em **horas e minutos**, ⛔ e ⛔ não em minutos crus",
    por("janela")?.valor === "2h08",
    `⛔ "${por("janela")?.valor}" — *"128 min"* obriga a dividir de cabeça (**E-21**)`
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ SÓ OS FATOS **DAQUELA** RECOMENDAÇÃO — ⛔ regra do autor:
   * *"⛔ Não listar critérios de populações que foram descartadas."*
   */
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM fato de população descartada entra no fundamento",
    f.every((x) => x.insumo !== "pc_aspects" && x.insumo !== "idade"),
    `⛔ ${f.map((x) => x.insumo).join(" · ")} — ⛔ PC-ASPECTS é da basilar; idade, das recs. 3 ⛔ e 4`
  );

  /** ⚠️ ⛔ E as faltas sabem **onde se resolvem** (**E-26**). */
  const inc = ver({ sitio: M1, mrs: 0, horas: 2 });
  conf(
    "⚠️⚠️ cada falta carrega o campo onde se resolve",
    inc.tipo === "incompleta"
    && inc.faltam.length > 0
    && inc.faltam.every((x) => x.campos.length > 0 && !/_/.test(x.rotulo)),
    `⛔ ${inc.faltam.map((x) => `${x.rotulo}→[${x.campos.join(",")}]`).join(" · ")}`
  );
}

/* ══ ⚠️⚠️ 6.10 · O PARALELISMO IVT × EVT É DADO ════════════════════════ */
{
  const P = SF.IVT_E_EVT_EM_PARALELO;
  conf(
    "⚠️⚠️ a frase de ⛔ NÃO ESPERAR existe como dado, com verbatim ⛔ e COR 1 · LOE A",
    P.cor === "1" && P.loe === "A"
    && /without observation/.test(P.verbatim)
    && /aguardar resposta clínica/i.test(P.frase),
    `⛔ ${JSON.stringify(P)}`
  );
  /**
   * ⚠️⚠️ ⛔ O VERBATIM CONFERIDO NO PDF — ⛔ e ⛔ eu o havia escrito errado.
   *
   * ⛔ ⛔ Meu comentário dizia *"without **pause to** assess clinical
   * response"*. ⚠️ A fonte escreve *"without **observation, to** assess
   * clinical response or delay in initiating EVT"* (p. e368). ⛔ Memória ⛔ não
   * é fonte.
   */
  conf(
    "⚠️ ⛔ e ⛔ NENHUMA paráfrase do verbatim sobrou no núcleo",
    !/without pause to assess/i.test(
      lerFonte(path.join(appDir, "avc", "nucleo", "veredito-da-trombectomia.ts"))
      + lerFonte(path.join(appDir, "avc", "conteudo", "superficie-f.ts"))
    ),
    "⛔ *«without pause to assess»* ⛔ não está na fonte"
  );
}

/* ══ ⚠️⚠️⚠️ 6.11 · A TELA ⛔ NÃO RECALCULA ═══════════════════════════ */
{
  /**
   * ⚠️ Regra do autor, 2026-09-07: *"A tela ⛔ não pode recalcular: janela,
   * NIHSS, ASPECTS, PC-ASPECTS, mRS, idade, sítio, efeito de massa, COR/LOE.
   * ⛔ Tudo vem do núcleo."*
   *
   * ⚠️⚠️ ⛔ ISTO É UMA VARREDURA DE TEXTO, ⛔ E ⛔ ELAS JÁ PASSARAM VERDE SOBRE
   * DEFEITO REAL nesta sessão. ⛔ Por isso ⛔ ela ⛔ **não** está sozinha: quem
   * prova de verdade que o número exibido é o do motor são os **e2e de gesto
   * real**, ⛔ que mudam o NIHSS ⛔ e conferem a palavra que a tela passa a
   * mostrar.
   *
   * ⚠️ O que ⛔ esta trava pega, ⛔ e ⛔ que os e2e ⛔ não pegam, é a **volta**
   * do cálculo por um caminho novo, ⛔ meses depois.
   */
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  /**
   * ⚠️⚠️⚠️ ⛔ A TRAVA MEDE **ACESSO AO FATO**, ⛔ E ⛔ NÃO A FORMA DA CONTA.
   *
   * ── ⚠️⚠️ ⛔ A PRIMEIRA VERSÃO ⛔ NÃO MORDEU (2026-09-07) ─────────────────
   *
   * ⛔ ⛔ Eu procurava `nihss >= 6`. ⚠️ Injetei `const nihssAlto = 14 >= 6;` na
   * tela ⛔ e a trava ficou **verde** — ⛔ a comparação ⛔ não encostava no nome.
   * ⛔ Seria a **quinta** varredura de texto desta sessão a passar por cima de
   * defeito real.
   *
   * ⚠️⚠️ ⛔ O que ⛔ não depende da forma que alguém escreve a conta é ⛔ **o
   * nome do campo**: ⛔ sem nomear `nihss_informado`, `aspects`, `mrs_previo`,
   * `sitio_oclusao`, `pc_aspects` ⛔ ou `efeito_de_massa`, a tela ⛔ **⛔ não tem
   * como** ler o fato — ⛔ e ⛔ então ⛔ não tem como recalculá-lo.
   *
   * ⚠️ ⛔ A navegação das faltas ⛔ não viola ⛔ isso: ⛔ ela usa `f.campos[0]`,
   * ⛔ que é **valor vindo do núcleo**, ⛔ e ⛔ não um literal escrito aqui.
   */
  const CAMPOS_CLINICOS_DA_EVT = [
    "nihss_informado", "nihss_calculado", "aspects", "pc_aspects",
    "mrs_previo", "sitio_oclusao", "efeito_de_massa", "hora_inicio_observado",
  ];
  const recalculos = [
    ...CAMPOS_CLINICOS_DA_EVT.map((c) => [
      `nomeia o campo ${c}`,
      new RegExp(`["'\`]${c}["'\`]`),
    ]),
    ["lê os critérios", /\.criterios\b/],
    ["lê as janelas da recomendação", /\.janelas\b/],
    ["mapeia território anatômico", /TERRITORIO_DA_OPCAO/],
    ["decide COR por conta própria", /cor\s*===\s*"[123]/],
    ["compara faixa clínica", /(nihss|aspects|mrs|idade)[A-Za-z_]*\s*[<>]=?\s*\d/i],
  ];
  const achados = recalculos.filter(([, re]) => re.test(tela)).map(([n]) => n);
  conf(
    "⚠️⚠️⚠️ ⛔ a tela de Reperfusão ⛔ NÃO refaz ⛔ nenhum critério do motor",
    achados.length === 0,
    `⛔ ${achados.join(" · ")} — ⛔ duas leituras do mesmo fato divergem (**I6**)`
  );

  /** ⚠️ ⛔ E a frase envelhecida ⛔ **saiu**: ⛔ hoje ⛔ ela seria falsa. */
  conf(
    "⚠️⚠️ ⛔ e a nota *«critérios ⛔ ainda ⛔ não incorporados ao motor»* ⛔ NÃO ficou na tela",
    !/ainda não incorporados ao motor/i.test(tela),
    "⛔ os critérios **estão** no motor agora — ⛔ manter a frase seria mentir sobre o próprio app"
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ NENHUM SLUG DE ESTADO CHEGA COMO TEXTO.
   *
   * ⛔ ⛔ `avc-f-evt-estado-${tipo}` é `testID` — ⛔ isso é fiação de teste ⛔ e
   * ⛔ não conteúdo. ⚠️ O que ⛔ não pode é o slug **dentro de um `<Text>`**.
   */
  const SLUGS = ["recomendada", "razoavel", "pode_ser_razoavel",
    "efetividade_nao_estabelecida", "nao_recomendada_sem_beneficio",
    "incompleta", "sem_criterios"];
  const A = emT("avc", "nucleo", "apresentacao-f.js");
  const semSelo = SLUGS.filter((t) => A.SELO_DO_VEREDITO_EVT?.[t] === undefined);
  conf(
    "⚠️⚠️ os SETE estados têm selo em linguagem clínica",
    semSelo.length === 0
    && SLUGS.every((t) => !/_/.test(A.SELO_DO_VEREDITO_EVT[t].rotulo)),
    `⛔ sem selo: ${semSelo.join(" · ")}`
  );
  /**
   * ⚠️⚠️ ⛔ E ⛔ **⛔ NENHUM** SELO DIZ *"CONTRAINDICADA"* — ⛔ nem em português
   * ⛔ nem no espanhol.
   */
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUM selo da EVT usa a palavra *«contraindicada»*",
    SLUGS.every((t) => !/contraindic/i.test(A.SELO_DO_VEREDITO_EVT[t].rotulo)),
    "⛔ COR 3 aqui é *«No Benefit»* — ⛔ ausência de benefício, ⛔ e ⛔ não risco proibitivo"
  );
  /**
   * ⚠️⚠️ ⛔ E *"⛔ não bem estabelecida"* ⛔ NÃO SE PARECE COM UM SIM: ⛔ o selo
   * ⛔ dela ⛔ não é `✓`, ⛔ e ⛔ ela ⛔ não pinta de favorável.
   */
  conf(
    "⚠️⚠️ *«efetividade ⛔ não bem estabelecida»* ⛔ NÃO se veste de recomendação",
    A.SELO_DO_VEREDITO_EVT.efetividade_nao_estabelecida.simbolo !== "✓"
    && A.PAPEL_DO_VEREDITO_EVT.efetividade_nao_estabelecida === "neutro"
    && A.PAPEL_DO_VEREDITO_EVT.pode_ser_razoavel === "neutro"
    && A.PAPEL_DO_VEREDITO_EVT.recomendada === "sucesso"
    && A.PAPEL_DO_VEREDITO_EVT.nao_recomendada_sem_beneficio === "atencao",
    "⛔ um *nem sim nem não* com a cor de um COR 1 apaga a gradação inteira"
  );
}

/* ══ ⚠️⚠️⚠️ 6.12 · TODO INSUMO TEM ⛔ ONDE SER RESPONDIDO ═════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O DEFEITO MUDO (achado ao escrever o e2e da basilar) ─────────
   *
   * ⛔ ⛔ `pc_aspects` era exigido pelas **duas** recomendações de oclusão
   * basilar ⛔ e ⛔ **⛔ não existia como campo** em ⛔ nenhuma superfície.
   * ⚠️ Medido: as duas ⛔ **nunca fechavam** no app real — ⛔ um paciente com
   * basilar ⛔ jamais chegava a *"EVT recomendada"*, ⛔ e o *«Resolver ›»* da
   * pendência levava a um campo inexistente.
   *
   * ⚠️⚠️ ⛔ E ⛔ ELE ERA MUDO POR CONSTRUÇÃO: ler id inexistente ⛔ não quebra
   * ⛔ nada — ⛔ devolve ausência, ⛔ que é resposta legítima. ⛔ Idêntico ao
   * defeito histórico do `nihss` (id de **grupo**, ⛔ não de campo).
   *
   * ⚠️ ⛔ A minha própria prova ⛔ não o pegava: ⛔ ela registra os fatos por
   * `registrarComInstancia`, ⛔ que **contorna** o catálogo de campos.
   */
  const C = emT("avc", "conteudo", "campos.js");
  const A2 = emT("avc", "nucleo", "apresentacao-f.js");
  const insumos = new Set();
  for (const r of SF.RECOMENDACOES) for (const i of r.exige) insumos.add(i);

  /**
   * ⚠️⚠️ ⛔ "EXISTE" É **RESPONDÍVEL**, ⛔ e ⛔ não *"está no catálogo central"*.
   *
   * ⛔ ⛔ A primeira versão acusou `agente_trombolitico` — ⛔ e ⛔ ele **é**
   * respondível: mora em `CAMPO_AGENTE`, na própria Superfície F, ⛔ e a tela o
   * desenha a partir dali. ⚠️ ⛔ A guarda presumia **uma casa só**, ⛔ e o
   * módulo tem duas.
   *
   * ⚠️ ⛔ A exceção aponta para a **constante**, ⛔ e ⛔ não para o texto do id:
   * ⛔ se ela for renomeada, a trava a acompanha.
   */
  const COM_CASA_PROPRIA = new Set([SF.CAMPO_AGENTE.id]);
  const respondivel = (campo) =>
    C.campoDoModulo(campo) !== undefined || COM_CASA_PROPRIA.has(campo);

  const inexistentes = [];
  for (const i of insumos) {
    for (const campo of A2.CAMPOS_DO_INSUMO[i] ?? []) {
      if (!respondivel(campo)) inexistentes.push(`${i}→${campo}`);
    }
  }
  conf(
    "⚠️⚠️⚠️ ⛔ TODO campo declarado para um insumo **EXISTE** no catálogo",
    insumos.size >= 10 && inexistentes.length === 0,
    `⛔ ${inexistentes.join(" · ")} — ⛔ pendência que aponta para campo inexistente é muro (**E-26**)`
  );

  /**
   * ⚠️ ⛔ E ⛔ nenhum insumo de **elegibilidade de EVT** fica sem campo: ⛔ um
   * critério irrespondível trava a recomendação para sempre.
   */
  const semCampo = [];
  for (const r of VT.RECOMENDACOES_DE_ELEGIBILIDADE) {
    for (const i of r.exige) {
      if ((A2.CAMPOS_DO_INSUMO[i] ?? []).length === 0) semCampo.push(`${r.id}:${i}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM critério de elegibilidade de EVT é irrespondível",
    semCampo.length === 0,
    `⛔ ${semCampo.join(" · ")} — ⛔ recomendação que ⛔ nunca fecha ⛔ não é recomendação`
  );
}

/* ══ ⚠️⚠️⚠️ 6.13 · *No Benefit* ⛔ NÃO É BLOQUEIO DE SEGURANÇA ═══════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ DECISÃO DO AUTOR, 2026-09-07 ────────────────────────────────
   *
   * > *"COR 3: No Benefit ⛔ não deve usar o mesmo tratamento visual de
   * >  bloqueio crítico/contraindicação… ⛔ O motor já distingue corretamente;
   * >  a UI precisa preservar essa distinção também."*
   *
   * ⚠️⚠️ ⛔ E ⛔ ELE ESTÁ CERTO SOBRE O QUE A COR DIZ: ⛔ o vermelho crítico do
   * módulo é o de `impede` — ⛔ *"Contraindicação de segurança ativa"*, INR
   * 2,5, plaquetas abaixo do corte. ⚠️ ⛔ Emprestá-lo a *"⛔ não recomendada
   * **por ausência de benefício**"* faria a tela dizer, ⛔ pela cor, uma coisa
   * que o texto ⛔ nega.
   *
   * ⚠️ ⛔ São **três** coisas diferentes, ⛔ e ⛔ agora as três se distinguem
   * ⛔ sem ler: bloqueio de segurança · ⛔ ausência de benefício · efetividade
   * ⛔ não estabelecida.
   */
  const A3 = emT("avc", "nucleo", "apresentacao-f.js");
  const EC = emT("design-system", "estados-clinicos.js");
  const TIPOS = ["recomendada", "razoavel", "pode_ser_razoavel",
    "efetividade_nao_estabelecida", "nao_recomendada_sem_beneficio",
    "incompleta", "sem_criterios"];

  const mapa = A3.PAPEL_DO_VEREDITO_EVT ?? {};
  conf(
    "⚠️⚠️ os SETE estados da EVT declaram um **papel** do vocabulário compartilhado",
    A3.PAPEL_DO_VEREDITO_EVT !== undefined
    && TIPOS.every((t) => ["sucesso", "atencao", "acao", "critico", "neutro"].includes(mapa[t])),
    `⛔ ${JSON.stringify(mapa)}`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ **⛔ NENHUM** ESTADO DA EVT É `critico` — ⛔ e ⛔ isso vale para
   * os sete, ⛔ e ⛔ não ⛔ só para o que eu lembrei de conferir.
   */
  const criticos = TIPOS.filter((t) => mapa[t] === "critico");
  conf(
    "⚠️⚠️⚠️ ⛔ NENHUM estado da EVT usa o papel **crítico**",
    criticos.length === 0,
    `⛔ ${criticos.join(" · ")} — ⛔ crítico é o papel de *impede*, ⛔ e ⛔ EVT ⛔ não bloqueia ⛔ nada`
  );
  conf(
    "⚠️⚠️ ⛔ e *No Benefit* usa **cautela**, ⛔ e ⛔ não sucesso ⛔ nem neutro puro",
    mapa.nao_recomendada_sem_beneficio === "atencao",
    `⛔ ${mapa.nao_recomendada_sem_beneficio} — ⛔ ausência de benefício ⛔ não é indiferença`
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ ele ⛔ NÃO recebe o mesmo papel de `impede`",
    mapa.nao_recomendada_sem_beneficio !== EC.ESTADOS.impede.papel,
    `⛔ ${mapa.nao_recomendada_sem_beneficio} === ${EC.ESTADOS.impede.papel}`
  );
  /** ⚠️ ⛔ Nem o mesmo símbolo — ⛔ `⛔` é do bloqueio. */
  conf(
    "⚠️ ⛔ e ⛔ nem o SÍMBOLO de `impede`",
    A3.SELO_DO_VEREDITO_EVT.nao_recomendada_sem_beneficio.simbolo !== EC.ESTADOS.impede.simbolo,
    `⛔ ${A3.SELO_DO_VEREDITO_EVT.nao_recomendada_sem_beneficio.simbolo}`
  );

  /**
   * ⚠️⚠️ ⛔ E O BLOQUEIO DE SEGURANÇA DA IVT **CONTINUA CRÍTICO** — ⛔ atenuar
   * ⛔ ele para *"harmonizar as raias"* seria o defeito espelhado.
   */
  conf(
    "⚠️⚠️ ⛔ e o bloqueio de segurança da IVT ⛔ CONTINUA crítico",
    EC.ESTADOS.impede.papel === "critico" && EC.ESTADOS.impede.simbolo === "⛔",
    `⛔ ${JSON.stringify(EC.ESTADOS.impede)}`
  );

  /**
   * ⚠️⚠️ ⛔ E A TELA ⛔ NÃO USA O ESTILO CRÍTICO NA RAIA DA EVT.
   *
   * ⛔ `vereditoContra` ⛔ e `vereditoSeloContra` são os estilos **do veredito
   * da IVT** (borda ⛔ e fundo `critical`). ⚠️ ⛔ Enquanto a raia da EVT os
   * usava, ⛔ o *No Benefit* saía com a cara de um bloqueio.
   */
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));
  const bloco = tela.slice(tela.indexOf('testID="avc-f-evt"'), tela.indexOf('avc-f-evt-sem-esperar'));
  conf(
    "⚠️⚠️⚠️ ⛔ a raia da EVT ⛔ NÃO usa os estilos críticos do veredito da IVT",
    bloco.length > 200
    && !/vereditoContra|vereditoSeloContra|criticalTint|cores\.critical/.test(bloco),
    "⛔ o estilo crítico é o do bloqueio de segurança — ⛔ e a EVT ⛔ não bloqueia"
  );

  /** ⚠️⚠️ ⛔ E O TEXTO OBRIGATÓRIO ⛔ NÃO MUDOU — ⛔ o ajuste é ⛔ só de cor. */
  conf(
    "⚠️⚠️ ⛔ e o selo continua dizendo *«⛔ não recomendada para melhorar desfecho — No Benefit»*",
    A3.SELO_DO_VEREDITO_EVT.nao_recomendada_sem_beneficio.rotulo
      === "EVT não recomendada para melhorar desfecho — No Benefit",
    `⛔ "${A3.SELO_DO_VEREDITO_EVT.nao_recomendada_sem_beneficio.rotulo}"`
  );
  const r8 = evt.find((r) => r.id === "evt_m2_nao_dominante");
  conf(
    "⚠️ ⛔ e a COR/LOE da fonte seguem intactas — **COR 3: No Benefit · LOE A**",
    r8.cor === "3: No Benefit" && r8.loe === "A",
    `⛔ ${r8 && r8.cor} · ${r8 && r8.loe}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ TROMBECTOMIA — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ TROMBECTOMIA — ${ok}/${ok} conferências · catálogo preservado, motores separados`);
