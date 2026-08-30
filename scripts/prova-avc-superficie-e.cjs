/**
 * PROMETE: que a Superfície E registre **ações**, e ⛔ nunca conclua correção —
 *   que ⛔ nenhum estado de ação derrube bloqueio, que `cancelada` ⛔ nunca produza
 *   derivação favorável, que os estados ⛔ **não** formem sequência obrigatória,
 *   que cada intervenção seja uma **instância** própria, que E ⛔ não invente
 *   causalidade entre ação e aferição, que E ⛔ não declare PA ⛔ nem glicemia, e que
 *   ⛔ nenhum fármaco, dose, via ou esquema apareça enquanto F-19 estiver parcial.
 * NÃO PROMETE: que os limiares estejam certos — são transcrição, conferida pelo
 *   autor contra o verbatim. ⛔ Não mede tela: isso é `e2e/avc-superficie-e`.
 * UNIVERSO: `avc/conteudo/superficie-e.ts` inteiro e todas as derivações de
 *   `avc/nucleo/derivacoes-e.ts`, mais os bloqueios de `derivacoes-d.ts` e os
 *   campos de A que os sustentam. ⛔ Fora: F e G.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-e-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "instancia.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-e.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-e.ts"),
  path.join(appDir, "avc", "conteudo", "campos.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const I = require(path.join(tmp, "avc", "nucleo", "instancia.js"));
const DE = require(path.join(tmp, "avc", "nucleo", "derivacoes-e.js"));
const DD = require(path.join(tmp, "avc", "nucleo", "derivacoes-d.js"));
const S = require(path.join(tmp, "avc", "conteudo", "superficie-e.js"));
const CAMPOS = require(path.join(tmp, "avc", "conteudo", "campos.js"));

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, undefined);
const regA = (e, inst, campo, valor) => CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const a1 = I.nomeDaInstancia("acao", 1);
const a2 = I.nomeDaInstancia("acao", 2);
const pa1 = I.nomeDaInstancia("pa", 1);
const pa2 = I.nomeDaInstancia("pa", 2);
const EST = S.ESTADO_DA_ACAO;
const PA_ALTA = (e) => regA(regA(e, pa1, "pas", 190), pa1, "pad", 110);

// ── 0 · O UNIVERSO ────────────────────────────────────────────────────────
{
  confere("E nasce com DUAS ações, e ⛔ nem uma a mais",
    S.ACOES_DE_CORRECAO.length === 2
    && JSON.stringify(S.ACOES_DE_CORRECAO.map((a) => a.bloqueio).sort())
      === JSON.stringify(["glicemia_alterada", "pressao_acima_da_meta"]),
    "*\"se começarem a entrar anticoagulação, imagem, DOAC ou critérios de reperfusão ali, a superfície perde o propósito\"*");
  confere("todo campo de E declara instância de ação",
    S.TODOS_OS_CAMPOS_E.every((c) => c.instanciaDe === S.ACAO),
    "ação sem instância seria um estado global, e a segunda intervenção apagaria a primeira");
  confere("⛔ NENHUM campo de E bloqueia terapia",
    S.TODOS_OS_CAMPOS_E.every((c) => c.bloqueiaTerapia === false),
    "**E-43**: bloqueio é derivado, e ⛔ nunca propriedade de campo");
}

// ── 1 · ⛔ E ⛔ NÃO POSSUI PA ⛔ NEM GLICEMIA ─────────────────────────────────────
{
  const ids = S.TODOS_OS_CAMPOS_E.map((c) => c.id);
  confere("⛔ E ⛔ NÃO declara PA, glicemia ⛔ nem qualquer fato de A",
    !ids.some((id) => ["pas", "pad", "glicemia", "spo2"].includes(id)),
    "E lê de A pela leitura de D — redeclarar criaria dois donos para o mesmo fato");
  confere("e os bloqueios vêm de D, ⛔ não de E",
    typeof DD.bloqueiosCorrigiveis === "function",
    "*\"D apenas interpreta segurança; E executa/cataloga a correção\"*");
}

// ── 2 · ⛔⛔ ⛔ NENHUM FÁRMACO ENQUANTO F-19 ESTIVER PARCIAL ────────────────────
{
  const texto = [
    ...S.ACOES_DE_CORRECAO.map((a) => `${a.rotulo} ${a.formulacao} ${a.resolvePor}`),
    ...S.TODOS_OS_CAMPOS_E.map((c) => `${c.rotulo} ${c.ajuda ?? ""} ${c.nota ?? ""} ${(c.opcoes ?? []).join(" ")}`),
  ].join(" ").toLowerCase();
  /**
   * ⛔⛔ AS FORMAS DE PRESCRIÇÃO — critério de **medição**, e por isso moram aqui.
   *
   * ⚠️⚠️ São **formas**, e ⛔ não lista de palavras: a primeira versão varria
   * substrings (`"mg"`, `"ev"`) e reprovou o texto que ela existe para proteger
   * — **`60 mg/dL`** é o limiar que a fonte escreve, e **`ev`** aparece dentro
   * de *"deve"*. ⚠️ Varredura de vocabulário acusa a frase certa e deixa passar a
   * errada. ⛔ Unidade de laboratório ⛔ não é dose.
   */
  const FORMAS = [
    { nome: "dose", re: /\d+\s*(mg|mcg|µg|g|ml|ui)\b(?!\s*\/\s*d[lL])/i },
    { nome: "dose por peso", re: /\b(mg|mcg)\s*\/\s*kg\b/i },
    { nome: "via", re: /\b(endovenos[oa]|intravenos[oa]|via oral|sublingual|EV|IV)\b/ },
    { nome: "forma", re: /\b(bolus|ampola|comprimido|infus[\u00e3a]o cont[\u00edi]nua)\b/i },
    { nome: "farmaco", re: /\b(labetalol|esmolol|nitroprussiato|nicardipina|hidralazina|clevidipina|metoprolol|insulina|glucagon)\b/i },
    { nome: "posologia", re: /\b(posologia|prescri[\u00e7c][\u00e3a]o|titular|repetir a cada)\b/i },
  ];
  const achadas = FORMAS.filter((f) => f.re.test(texto)).map((f) => f.nome);
  confere("⛔ ⛔ NENHUM fármaco, dose, via ou esquema aparece em E",
    achadas.length === 0,
    `F-04 item 9: *"a fonte ⛔ não nomeia ⛔ nenhum fármaco"*, e F-19 está parcial — ${achadas.join(", ") || "—"}`);
  /**
   * ⚠️⚠️ E A TRAVA PRECISA PEGAR PRESCRIÇÃO DE VERDADE — ⛔ senão ela só prova que
   * o texto atual passa. ⚠️ Aqui ela é exercida contra frases construídas.
   */
  const pega = (t) => FORMAS.some((f) => f.re.test(t));
  confere("a trava PEGA prescrição escrita de verdade",
    pega("labetalol 10 mg EV em bolus")
    && pega("hidralazina 20 mg") && pega("0,5 mg/kg") && pega("via oral")
    && pega("insulina regular") && pega("titular conforme resposta"),
    "trava que ⛔ só aprova o texto de hoje ⛔ não impede a prescrição de amanhã");
  confere("⛔ e ⛔ NÃO pega o limiar que a fonte enuncia",
    !pega("hipoglicemia abaixo de 60 mg/dL deve ser tratada")
    && !pega("baixar a pressão antes de iniciar a trombólise"),
    "`mg/dL` é unidade de laboratório, e 'deve' contém 'ev' — varredura de vocabulário acusa a frase certa");

  confere("a ação é ABSTRATA, e diz o que a fonte diz",
    S.ACOES_DE_CORRECAO.every((a) => a.verbo.length > 20 && a.formulacao.length > 20),
    "sem verbo e sem frase, a ação viraria um botão sem procedência");
}

// ── 3 · OS ESTADOS ⛔ NÃO SÃO SEQUÊNCIA OBRIGATÓRIA ────────────────────────
{
  /**
   * ⚠️⚠️ Quem chega em E com o tratamento **já correndo** ⛔ não pode ser obrigado
   * a passar por `sugerida`: isso gravaria na trilha uma sugestão que o app
   * ⛔ nunca fez, num instante em que ela ⛔ não existiu.
   */
  confere("`iniciada`, `realizada` e `cancelada` são registráveis DIRETO",
    JSON.stringify(S.OPCOES_ESTADO_DA_ACAO) === JSON.stringify([EST.iniciada, EST.realizada, EST.cancelada]),
    "*\"⛔ não fabricar estados intermediários\"*");
  confere("⛔ e `disponível`/`sugerida` ⛔ NÃO são opções graváveis",
    !S.OPCOES_ESTADO_DA_ACAO.includes(EST.disponivel)
    && !S.OPCOES_ESTADO_DA_ACAO.includes(EST.sugerida),
    "são como a ação nasce, e ⛔ não resposta do médico");

  let e = PA_ALTA(vazio);
  e = regA(e, a1, "acao_tipo", "Tratamento anti-hipertensivo");
  e = regA(e, a1, "acao_estado", EST.realizada);
  confere("registrar `realizada` direto ⛔ NÃO exige estado anterior",
    DE.acoes(e)[0].estado === EST.realizada
    && e.fatos.filter((f) => f.campo === "acao_estado").length === 1,
    "um estado intermediário fabricado é um fato que ⛔ ninguém declarou");
}

// ── 4 · ⛔⛔ ⛔ NENHUM ESTADO RESOLVE BLOQUEIO ────────────────────────────────
{
  let e = PA_ALTA(vazio);
  e = regA(e, a1, "acao_tipo", "Tratamento anti-hipertensivo");
  const comEstado = (v) => regA(e, a1, "acao_estado", v);

  for (const v of [EST.iniciada, EST.realizada, EST.cancelada]) {
    const est = comEstado(v);
    confere(`com a ação em "${v}", o bloqueio CONTINUA aberto`,
      DD.bloqueiosCorrigiveis(est).some((b) => b.id === "pressao_acima_da_meta"),
      "quem derruba o bloqueio é **uma nova aferição**, e ⛔ nunca o registro da ação");
  }
  confere("⛔ e ⛔ NENHUMA ação, em estado nenhum, se declara resolvedora",
    [EST.iniciada, EST.realizada, EST.cancelada]
      .every((v) => DE.acaoResolveBloqueio({ instancia: a1, estado: v }) === false),
    "**E-43**: 'realizada' diz que a ação aconteceu, e ⛔ não que funcionou");

  /** ⚠️⚠️ `cancelada` ⛔ NUNCA produz derivação favorável — trava do autor. */
  const cancelada = comEstado(EST.cancelada);
  confere("⛔ `cancelada` ⛔ NÃO abre a pendência de reavaliar déficit",
    DE.pendenciasOriginadasEmE(
      regA(regA(reg(vazio, "glicemia", 40), a1, "acao_tipo", "Correção glicêmica"), a1, "acao_estado", EST.cancelada)
    ).length === 0,
    "⛔ nada foi corrigido — ⛔ não há 'depois da correção' para reavaliar");
  confere("⛔ e ⛔ não conta como tratamento realizado",
    DE.acoesDoBloqueio(cancelada, "pressao_acima_da_meta")
      .every((a) => a.estado !== EST.realizada),
    "cancelada é registro da decisão, e ⛔ nada mais");
}

// ── 5 · AÇÕES SÃO INSTÂNCIAS, E SE REPETEM ───────────────────────────────
{
  let e = PA_ALTA(vazio);
  e = regA(regA(e, a1, "acao_tipo", "Tratamento anti-hipertensivo"), a1, "acao_estado", EST.realizada);
  e = regA(regA(e, a2, "acao_tipo", "Tratamento anti-hipertensivo"), a2, "acao_estado", EST.iniciada);

  confere("DUAS intervenções antes da nova aferição aparecem como DUAS",
    DE.acoesDoBloqueio(e, "pressao_acima_da_meta").length === 2,
    "*\"pode haver mais de uma intervenção terapêutica antes da nova aferição\"*");
  confere("⛔ e a segunda ⛔ NÃO sobrescreve a primeira",
    DE.acoes(e)[0].estado === EST.realizada && DE.acoes(e)[1].estado === EST.iniciada,
    "estado global apagaria que houve duas — §3.1");
  confere("⛔ e ⛔ nenhuma delas resolve o bloqueio",
    DD.bloqueiosCorrigiveis(e).some((b) => b.id === "pressao_acima_da_meta"),
    "duas ações ⛔ não somam uma correção");
}

// ── 6 · ⛔ ⛔ NENHUMA CAUSALIDADE POR ORDEM DE REGISTRO ────────────────────────
{
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-e.ts"));
  /**
   * ⚠️⚠️ ⛔ E ⛔ não pode dizer *"esta aferição respondeu a esta ação"*. O vínculo
   * ⛔ não existe no modelo, e inventá-lo por ordem de log seria afirmar uma causa
   * que ⛔ ninguém declarou.
   */
  confere("⛔ a leitura de E ⛔ NÃO expõe ligação ação → aferição",
    !/aferic\w*DaAcao|respostaDa|aferic\w*Seguinte|apos\w*Acao/i.test(fonte),
    "*\"⛔ não inventar causalidade temporal ⛔ só porque uma veio depois no log\"*");
  confere("⛔ e ⛔ não ordena ações por horaRegistro para inferir resposta",
    !/horaRegistro/.test(fonte),
    "ordem de digitação ⛔ não é ordem clínica, e aqui ⛔ nem sequer é causa");

  /** ⚠️ Com duas aferições e duas ações, E continua ⛔ sem dizer qual respondeu qual. */
  let e = PA_ALTA(vazio);
  e = regA(regA(e, a1, "acao_tipo", "Tratamento anti-hipertensivo"), a1, "acao_estado", EST.realizada);
  e = regA(regA(e, pa2, "pas", 170), pa2, "pad", 95);
  e = regA(regA(e, a2, "acao_tipo", "Tratamento anti-hipertensivo"), a2, "acao_estado", EST.iniciada);
  const leitura = DE.bloqueiosComAcoes(e);
  confere("⛔ a leitura ⛔ NÃO carrega campo de aferição que respondeu",
    leitura.every((l) => !("afericaoResposta" in l) && !("respondidaPor" in l)),
    "o vínculo ⛔ não existe no modelo — e ⛔ não pode nascer na leitura");
}

// ── 7 · SENTINELA · PRESSÃO ARTERIAL ─────────────────────────────────────
{
  let e = PA_ALTA(vazio);
  confere("PA 190/110 abre bloqueio corrigível em D",
    DD.bloqueiosCorrigiveis(e)[0]?.id === "pressao_acima_da_meta"
    && DD.bloqueiosCorrigiveis(e)[0]?.estado === "bloqueio_corrigivel",
    "**F-04 rec. 5 · COR 1 · B-NR** — e é bloqueio CORRIGÍVEL, ⛔ não contraindicação");
  confere("e E oferece a ação — ⛔ só porque D declarou o bloqueio",
    DE.acoesDisponiveis(e).length === 1
    && DE.acoesDisponiveis(e)[0].id === "tratamento_pressao",
    "E ⛔ não decide sozinha que há bloqueio");

  e = regA(regA(e, a1, "acao_tipo", "Tratamento anti-hipertensivo"), a1, "acao_estado", EST.iniciada);
  confere("com a ação iniciada, o bloqueio CONTINUA",
    DD.bloqueiosCorrigiveis(e).length === 1,
    "⛔ nenhum botão em E marca 'corrigido'");

  /** ⚠️⚠️ NOVA AFERIÇÃO — instância nova, e é ELA que derruba. */
  const depois = regA(regA(e, pa2, "pas", 170), pa2, "pad", 95);
  confere("nova PA 170/95 em NOVA instância derruba o bloqueio",
    DD.bloqueiosCorrigiveis(depois).length === 0,
    "o bloqueio é derivado da aferição vigente — tratar ⛔ não o derruba, medir de novo sim");
  confere("⛔ e a PA 190/110 permanece INTACTA na trilha",
    I.valorNaInstancia(depois, pa1, "pas").valor === 190
    && I.valorNaInstancia(depois, pa1, "pad").valor === 110,
    "§3.1: nova medida ⛔ não corrige a anterior — ela registra evolução real");
  confere("⛔ e a nova aferição ⛔ NÃO é marcada como correção",
    I.valorNaInstancia(depois, pa2, "pas").tipo === undefined,
    "*\"PA 190/110 → tratamento → PA 170/95 ⛔ não corrige a primeira\"*");
  confere("⛔ e E ⛔ NÃO deixa de mostrar a ação por o bloqueio ter caído",
    DE.acoes(depois).length === 1,
    "a ação aconteceu, e a trilha guarda que aconteceu");
}

// ── 8 · SENTINELA · GLICEMIA ─────────────────────────────────────────────
{
  /** ⚠️⚠️ OS TRÊS NÚMEROS ⛔ NÃO COLAPSAM — ⛔ só <60 é limiar de tratamento. */
  confere("os três cortes glicêmicos existem SEPARADOS",
    DD.CORTES_GLICEMIA.tratarAbaixoDe === 60
    && DD.CORTES_GLICEMIA.gravidadeAbaixoDe === 50
    && DD.CORTES_GLICEMIA.gravidadeAcimaDe === 400,
    "<60 é limiar de tratamento (COR 1); <50 e >400 são rótulo de gravidade em texto de apoio");
  confere("⛔ e ⛔ SÓ <60 abre bloqueio corrigível",
    DD.bloqueiosCorrigiveis(reg(vazio, "glicemia", 55)).some((b) => b.id === "glicemia_alterada")
    && !DD.bloqueiosCorrigiveis(reg(vazio, "glicemia", 450)).some((b) => b.id === "glicemia_alterada"),
    "**⛔ promover >400 a cutoff terapêutico seria inventar conduta com cara de citação**");

  let e = reg(vazio, "glicemia", 40);
  e = regA(regA(e, a1, "acao_tipo", "Correção glicêmica"), a1, "acao_estado", EST.realizada);
  confere("a ação glicêmica ⛔ NÃO grava 'glicemia corrigida' como fato",
    e.fatos.every((f) => f.campo !== "glicemia" || typeof f.valor === "number"),
    "E ⛔ não substitui o fato de A por um veredito próprio");
  confere("e o bloqueio ⛔ SÓ cai com nova glicemia",
    DD.bloqueiosCorrigiveis(e).length === 1
    && DD.bloqueiosCorrigiveis(reg(e, "glicemia", 95)).length === 0,
    "quem responde é a medida, e ⛔ não o registro do tratamento");

  /** ⚠️⚠️ A PENDÊNCIA DE REAVALIAR O DÉFICIT É DE **B**, e ⛔ não de E. */
  const p = DE.pendenciasOriginadasEmE(e);
  confere("a correção glicêmica ORIGINA a pendência de reavaliar o déficit",
    p.length === 1 && p[0].id === "reavaliar_deficit_apos_glicemia",
    "**F-06**: *\"clinical deficits should be assessed after correction of glucose\"*");
  confere("⛔ mas o DONO da pendência é B · Neurológico",
    p[0].dono === "neurologico" && p[0].campo === "deficit_focal",
    "*\"E pode ser a origem, mas ⛔ não é sua dona — o fechamento ocorre em B\"*");
  confere("⛔ e ela ⛔ NÃO nasce ⛔ sem ação registrada",
    DE.pendenciasOriginadasEmE(reg(vazio, "glicemia", 40)).length === 0,
    "⛔ enquanto ⛔ ninguém corrigiu, ⛔ não há 'depois da correção' para reavaliar");
}

if (falhas.length > 0) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE E — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ PROVA DA SUPERFÍCIE E — ${ok}/${ok} conferências · ${S.ACOES_DE_CORRECAO.length} ações\n`);
