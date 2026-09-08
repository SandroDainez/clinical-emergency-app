#!/usr/bin/env node
/**
 * TRAVA DA ABERTURA — ⚠️ **o atendimento começa em Paciente**, ⛔ e a primeira
 * tela ⛔ não carrega o que pertence às fases seguintes.
 *
 * PROMETE:
 *   · que `abrirAtendimento()` abra em **`paciente`**, ⛔ e ⛔ não na segunda fase;
 *   · que a sequência oficial comece em Paciente ⛔ e siga para Estabilização;
 *   · que a superfície Paciente contenha **⛔ só dados basais** — ⛔ e ⛔ nenhuma
 *     das listas de **contraindicação** (F-07), que são leitura de segurança;
 *   · que ⛔ **⛔ nenhum fato fique duplicado** ao ser movido: ⛔ ele tem uma
 *     casa, ⛔ e ⛔ o `Resolver ›` leva ⛔ até ⛔ ela;
 *   · que os **consumidores** dos fatos movidos continuem lendo.
 *
 * NÃO PROMETE: que a composição visual esteja bonita — ⛔ isso é a revisão de
 *   375 px. ⛔ E ⛔ **⛔ não** promete que abrir em Paciente vire **porta**:
 *   ⛔ nada ali bloqueia navegar para ⛔ qualquer outra fase (**E-11**).
 *
 * UNIVERSO: `avc/nucleo/estado.ts` × `avc/conteudo/paciente.ts` ×
 *   `avc/conteudo/superficie-b.ts` × `avc/conteudo/superficies.ts`.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA (inspeção clínica, 2026-09-07) ────────
 *
 * ⛔ ⛔ A barra inferior mostrava **Paciente** como primeira fase, ⛔ e o módulo
 * abria em **Estabilização**. ⚠️ ⛔ O fluxo começava na segunda fase — ⛔ e a
 * ordem mental do médico (*quem é o paciente → está estável? → é AVC?*)
 * começava pelo meio.
 *
 * ⛔ ⛔ E a primeira tela vinha carregada de **contraindicações à trombólise**:
 * hemorragia intracraniana prévia, neurocirurgia recente, microssangramentos.
 * ⚠️ ⛔ Elas ⛔ não são *"quem é o paciente"* — ⛔ são leitura de segurança da
 * reperfusão, ⛔ três fases adiante.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "abertura-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "superficies.ts"),
    path.join(appDir, "avc", "conteudo", "consumidores.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const E = emT("avc", "nucleo", "estado.js");
const R = emT("avc", "nucleo", "relogio.js");
const P = emT("avc", "conteudo", "paciente.js");
const B = emT("avc", "conteudo", "superficie-b.js");
const S = emT("avc", "conteudo", "superficies.js");
const C = emT("avc", "conteudo", "campos.js");
const CONS = emT("avc", "conteudo", "consumidores.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️⚠️ 1 · O ATENDIMENTO ABRE EM PACIENTE ═══════════════════════════ */
{
  const rel = R.relogioControlado(1_000_000);
  const novo = E.abrirAtendimento(rel);
  conf(
    "⚠️⚠️⚠️ atendimento novo abre em **Paciente**",
    novo.superficieVista === "paciente",
    `⛔ ${novo.superficieVista} — a barra dizia Paciente ⛔ e o módulo abria na segunda fase`
  );

  /**
   * ⚠️⚠️ ⛔ E A SEQUÊNCIA CONFIRMA A ORDEM — ⛔ abertura ⛔ e barra ⛔ não podem
   * discordar, ⛔ que era ⛔ exatamente o defeito.
   */
  const seq = S.SEQUENCIA_OFICIAL.map((s) => s.id);
  conf(
    "⚠️⚠️ a sequência oficial começa em Paciente ⛔ e segue para Estabilização",
    seq[0] === "paciente" && seq[1] === "estabilizacao",
    `⛔ ${seq.slice(0, 3).join(" → ")}`
  );
  conf(
    "⚠️ ⛔ e a abertura é **a primeira** da sequência, ⛔ e ⛔ não um id escrito à mão",
    novo.superficieVista === seq[0],
    `⛔ abertura=${novo.superficieVista} · primeira=${seq[0]}`
  );
  /** ⚠️ ⛔ Correções segue **fora** da sequência fixa. */
  conf(
    "⚠️ ⛔ e Correções continua FORA da sequência fixa",
    !seq.includes("correcoes"),
    `⛔ ${seq.join(" → ")}`
  );
}

/* ══ ⚠️⚠️⚠️ 2 · A PRIMEIRA TELA SÓ TEM DADOS BASAIS ═══════════════════ */
{
  const naTela = new Set(P.GRUPOS_P.flatMap((g) => g.campos.map((c) => c.id)));

  /**
   * ⚠️⚠️ ⛔ AS QUATRO LISTAS DE **CONTRAINDICAÇÃO** SAÍRAM.
   *
   * ⛔ Elas são do slot **F-07** — hemorragia intracraniana prévia, neurocirurgia
   * nos últimos 14 dias, endocardite, microssangramentos. ⚠️ ⛔ Nenhuma delas
   * responde *"quem é este paciente"*: ⛔ elas respondem *"pode trombolisar?"*.
   */
  const FORA = [
    "antecedentes_intracranianos",
    "antecedentes_cardio_sistemicos",
    "procedimentos_recentes",
    "informacao_previa_cmb",
    "mrs_previo",
  ];
  const sobraram = FORA.filter((id) => naTela.has(id));
  conf(
    "⚠️⚠️⚠️ ⛔ a tela Paciente ⛔ NÃO tem contraindicação ⛔ nem mRS",
    sobraram.length === 0,
    `⛔ ${sobraram.join(" · ")} — pertencem à Avaliação AVC`
  );

  /** ⚠️ ⛔ E o que É basal continua ⛔ lá. */
  const BASAIS = ["identificacao", "idade", "peso", "altura", "peso_origem",
    "alergias", "anticoagulante_em_uso", "antiagregante_em_uso", "medicacoes_em_uso"];
  const perdidos = BASAIS.filter((id) => !naTela.has(id));
  conf(
    "⚠️⚠️ ⛔ e os dados basais ⛔ NÃO foram levados junto",
    perdidos.length === 0,
    `⛔ ${perdidos.join(" · ")} — limpar ⛔ não é esvaziar`
  );

  /**
   * ⚠️⚠️ ⛔ E A TELA ⛔ NÃO FICOU **VAZIA DE ANTECEDENTES**: ⛔ o autor pediu
   * *"antecedentes como DM, HAS, ⛔ e outros crônicos"* — ⛔ que ⛔ **⛔ não
   * existiam** em campo ⛔ nenhum do módulo.
   */
  conf(
    "⚠️⚠️ existe um campo de **comorbidades crônicas**, recolhível",
    naTela.has("comorbidades"),
    "⛔ as listas que saíram eram de contraindicação — ⛔ HAS/DM ⛔ não estavam em ⛔ nenhuma"
  );
  const campoCom = C.campoDoModulo("comorbidades");
  conf(
    "⚠️ ⛔ e ⛔ ele oferece as comorbidades mais comuns no contexto do AVC",
    campoCom !== undefined
    && ["Hipertensão arterial", "Diabetes mellitus", "Fibrilação atrial"]
      .every((o) => (campoCom.opcoes ?? []).includes(o)),
    `⛔ ${JSON.stringify(campoCom && campoCom.opcoes)}`
  );
  /**
   * ⚠️⚠️⚠️ ⛔ E ⛔ ELE ⛔ **⛔ NÃO** TEM CONSUMIDOR CLÍNICO.
   *
   * ⛔ ⛔ A AHA/ASA ⛔ não publica lista de comorbidades. ⚠️ Este campo é
   * **contexto administrativo**, como `medicacoes_em_uso` — ⛔ e ⛔ um chip de
   * *"hipertensão"* ⛔ **⛔ não pode** alimentar decisão ⛔ nenhuma (**E-31**).
   */
  conf(
    "⚠️⚠️⚠️ ⛔ e ⛔ NENHUMA derivação clínica o consome",
    Array.isArray(CONS.CONSUMIDORES.comorbidades) && CONS.CONSUMIDORES.comorbidades.length === 0,
    `⛔ ${JSON.stringify(CONS.CONSUMIDORES.comorbidades)} — ⛔ sem fonte, ⛔ ele ⛔ não decide ⛔ nada`
  );
  conf(
    "⚠️ ⛔ e ⛔ ele ⛔ NÃO bloqueia terapia",
    campoCom?.bloqueiaTerapia === false,
    `⛔ bloqueiaTerapia=${campoCom?.bloqueiaTerapia}`
  );
  conf(
    "⚠️ ⛔ e ⛔ ele nasce **recolhido** — ⛔ a primeira tela é limpa",
    P.GRUPOS_P.some((g) => g.campos.some((c) => c.id === "comorbidades") && g.recolhido === true),
    "⛔ lista longa aberta na abertura é ⛔ exatamente o que se veio remover"
  );
}

/* ══ ⚠️⚠️⚠️ 3 · O QUE SAIU **CHEGOU** NA AVALIAÇÃO AVC ═══════════════ */
{
  const naB = new Set(B.TODOS_OS_CAMPOS_B.map((c) => c.id));
  const MOVIDOS = [
    "antecedentes_intracranianos",
    "antecedentes_cardio_sistemicos",
    "procedimentos_recentes",
    "informacao_previa_cmb",
    "mrs_previo",
  ];
  const sumiram = MOVIDOS.filter((id) => !naB.has(id));
  conf(
    "⚠️⚠️⚠️ os cinco fatos existem na **Avaliação AVC**",
    sumiram.length === 0,
    `⛔ ${sumiram.join(" · ")} — mover ⛔ não pode ser apagar`
  );

  /**
   * ⚠️⚠️⚠️ ⛔ E ⛔ **⛔ NENHUM DELES FICOU EM DUAS CASAS**.
   *
   * ⛔ ⛔ Um fato com duas donas é duas verdades (**I6**), ⛔ e o `Resolver ›`
   * passaria a ter dois destinos possíveis para o mesmo id.
   */
  const naP = new Set(P.TODOS_OS_CAMPOS_P.map((c) => c.id));
  const emDuas = MOVIDOS.filter((id) => naP.has(id));
  conf(
    "⚠️⚠️⚠️ ⛔ e ⛔ NENHUM deles continua sendo de Paciente",
    emDuas.length === 0,
    `⛔ ${emDuas.join(" · ")} — o fato mudou de casa, ⛔ e ⛔ não ganhou uma segunda`
  );
  /** ⚠️ ⛔ E a casa declarada acompanha. */
  const casaErrada = B.TODOS_OS_CAMPOS_B
    .filter((c) => MOVIDOS.includes(c.id) && c.casa !== "neurologico")
    .map((c) => `${c.id}=${c.casa}`);
  conf(
    "⚠️⚠️ ⛔ e a **casa** deles é `neurologico`",
    casaErrada.length === 0,
    `⛔ ${casaErrada.join(" · ")} — casa errada manda o *«Resolver ›»* para a tela errada`
  );

  /** ⚠️⚠️ ⛔ E ⛔ ninguém os empresta de volta para Paciente. */
  const emprestadosEmP = P.GRUPOS_P.flatMap((g) => g.emprestados ?? []).map((c) => c.id);
  conf(
    "⚠️ ⛔ e Paciente ⛔ NÃO os empresta de volta",
    MOVIDOS.every((id) => !emprestadosEmP.includes(id)),
    `⛔ ${emprestadosEmP.join(" · ")}`
  );
}

/* ══ ⚠️⚠️ 4 · OS CONSUMIDORES CONTINUAM LENDO ════════════════════════ */
{
  /**
   * ⚠️⚠️ ⛔ MOVER A CASA ⛔ NÃO PODE MOVER O DADO: ⛔ as derivações leem **por
   * id**, ⛔ e a declaração de consumo ⛔ não muda porque a tela mudou.
   */
  conf(
    "⚠️⚠️ `informacao_previa_cmb` continua declarado para `derivacoes-d.ts`",
    (CONS.CONSUMIDORES.informacao_previa_cmb ?? []).includes("derivacoes-d.ts"),
    `⛔ ${JSON.stringify(CONS.CONSUMIDORES.informacao_previa_cmb)}`
  );
  conf(
    "⚠️⚠️ `mrs_previo` continua declarado para os TRÊS consumidores",
    ["apresentacao-f.ts", "derivacoes-b.ts", "derivacoes-f.ts"]
      .every((f) => (CONS.CONSUMIDORES.mrs_previo ?? []).includes(f)),
    `⛔ ${JSON.stringify(CONS.CONSUMIDORES.mrs_previo)}`
  );

  /** ⚠️ ⛔ E todo campo movido continua **no registro** do módulo. */
  const registro = new Set(C.todosOsCampos().map((c) => c.id));
  const foraDoRegistro = ["antecedentes_intracranianos", "antecedentes_cardio_sistemicos",
    "procedimentos_recentes", "informacao_previa_cmb", "mrs_previo", "comorbidades"]
    .filter((id) => !registro.has(id));
  conf(
    "⚠️⚠️ ⛔ e TODOS eles continuam no registro do módulo",
    foraDoRegistro.length === 0,
    `⛔ ${foraDoRegistro.join(" · ")} — fora do registro, ⛔ o fato é gravado sem casa`
  );
}

/* ══ ⚠️⚠️ 5 · ABRIR EM PACIENTE ⛔ NÃO É UMA PORTA ═══════════════════ */
{
  /**
   * ⚠️⚠️⚠️ **E-11** — ⛔ o módulo ⛔ não tem wizard. ⛔ Abrir em Paciente muda
   * ⛔ **onde se começa**, ⛔ e ⛔ **⛔ não** o que se pode alcançar.
   *
   * ⛔ ⛔ Se Paciente virasse pré-requisito, um paciente instável faria o médico
   * preencher identificação antes de ver a via aérea.
   */
  const rel = R.relogioControlado(1_000_000);
  const novo = E.abrirAtendimento(rel);
  for (const destino of ["estabilizacao", "neurologico", "imagem", "reperfusao", "destino"]) {
    const ido = E.verSuperficie(novo, destino);
    conf(
      `⚠️ ⛔ dá para ir direto a **${destino}** ⛔ sem preencher ⛔ nada`,
      ido.superficieVista === destino,
      `⛔ ${ido.superficieVista}`
    );
  }
  /** ⚠️⚠️ ⛔ E ⛔ nenhum campo de Paciente bloqueia terapia. */
  const bloqueiam = P.TODOS_OS_CAMPOS_P.filter((c) => c.bloqueiaTerapia === true).map((c) => c.id);
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM campo da primeira tela bloqueia terapia",
    bloqueiam.length === 0,
    `⛔ ${bloqueiam.join(" · ")} — a primeira tela ⛔ não pode ser porta`
  );
}

/* ══ ⚠️⚠️⚠️ 6 · O RODAPÉ DE FONTES DIZ A VERDADE ═════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O DEFEITO (o autor, olhando o rodapé da 1ª tela) ────────────
   *
   * > *"embaixo na primeira tela aparece isso, está certo?"*
   *
   * ⛔ ⛔ ⛔ Não estava: a tela Paciente declarava governar-se por **F-27 ·
   * mRS** ⛔ e por **F-08 · elegibilidade para trombectomia** ⛔ depois de os
   * campos correspondentes terem mudado de casa. ⚠️ ⛔ A lista de fontes é
   * **escrita à mão** — ⛔ e lista à mão ⛔ não acompanha sozinha.
   *
   * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO PODE SER DERIVADA DOS CAMPOS: ⛔ Reperfusão ⛔ e
   * Correções tiram fontes das **recomendações**, ⛔ e ⛔ não de campo ⛔ nenhum.
   * ⛔ Por isso a trava é de **duas mãos**, ⛔ com teto congelado.
   */
  const campos = C.todosOsCampos();
  const fontesDosCampos = (id) =>
    [...new Set(campos.filter((c) => c.casa === id).map((c) => String(c.fonte)))]
      .filter((f) => /^F-\d+$/.test(f)).sort();

  /** ⚠️⚠️ ⛔ 1 · A primeira tela ⛔ NÃO declara fonte que ⛔ ninguém usa ⛔ lá. */
  const decP = [...(S.superficie("paciente").fontes ?? [])].sort();
  const orfasP = decP.filter((f) => !fontesDosCampos("paciente").includes(f));
  conf(
    "⚠️⚠️⚠️ ⛔ a primeira tela ⛔ NÃO declara fonte ÓRFÃ",
    orfasP.length === 0,
    `⛔ ${orfasP.join(" · ")} — declarar a fonte de um campo que saiu é o rodapé mentindo`
  );

  /**
   * ⚠️⚠️ ⛔ 2 · E O QUE ELA **DESENHA** ESTÁ DECLARADO — ⛔ nos dois lados da
   * mudança de 2026-09-07.
   */
  for (const sup of ["paciente", "neurologico"]) {
    const dec = new Set(S.superficie(sup).fontes ?? []);
    const faltando = fontesDosCampos(sup).filter((f) => !dec.has(f));
    /**
     * ⚠️⚠️ ⛔ TETO CONGELADO — ⛔ o Neurológico ⛔ já devia F-02, F-03, F-11 ⛔ e
     * F-13 **antes** desta mudança. ⛔ A dívida ⛔ não nasceu aqui, ⛔ e ⛔ ela
     * ⛔ só pode **descer**.
     */
    const TETO = { paciente: 0, neurologico: 4 };
    conf(
      `⚠️⚠️ ⛔ ${sup} declara as fontes dos campos que desenha (teto ${TETO[sup]})`,
      faltando.length <= TETO[sup],
      `⛔ ${faltando.join(" · ")} — ${faltando.length} > ${TETO[sup]}`
    );
  }

  /**
   * ⚠️⚠️⚠️ ⛔ 3 · E AS QUE **MUDARAM DE CASA** ESTÃO NO LUGAR CERTO — ⛔ é a
   * conferência que teria pego o defeito ⛔ no dia em que ⛔ ele nasceu.
   */
  const decN = new Set(S.superficie("neurologico").fontes ?? []);
  conf(
    "⚠️⚠️⚠️ ⛔ F-07 ⛔ e F-27 seguiram os fatos para a **Avaliação AVC**",
    decN.has("F-07") && decN.has("F-27"),
    `⛔ ${[...decN].join(" · ")} — a fonte mora com o fato, ⛔ e ⛔ não com a tela que ele deixou`
  );
  conf(
    "⚠️ ⛔ e F-27 ⛔ NÃO ficou para trás em Paciente",
    !decP.includes("F-27"),
    `⛔ ${decP.join(" · ")}`
  );
}

console.log("");
console.log(`  medido: ${P.GRUPOS_P.length} grupos em Paciente · ${P.TODOS_OS_CAMPOS_P.length} campos · ${B.TODOS_OS_CAMPOS_B.length} campos em B`);
if (falhas > 0) {
  console.log(`\n❌ ABERTURA — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ ABERTURA — ${ok}/${ok} conferências · começa em Paciente, e ela é basal`);
