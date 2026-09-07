#!/usr/bin/env node
/**
 * TRAVA DO PÓS-REPERFUSÃO — ⚠️ **dentro do alvo agora ⛔ não é controle mantido**.
 *
 * PROMETE:
 *   · que `<180/105` seja **estritamente abaixo**, ⛔ e ⛔ nas duas metades —
 *     ⛔ com fronteiras medidas uma a uma;
 *   · que o alvo pós-IVT ⛔ **só** valha no contexto que **F-04** define;
 *   · que aferição incompleta ⛔ e ausência de PA ⛔ **não** classifiquem;
 *   · que *"dentro do alvo"* ⛔ **nunca** vire *"24 h controladas"*;
 *   · que o **180/105** tenha **uma** fonte de verdade ⛔ e dois consumidores
 *     com semânticas declaradas (**U-01**);
 *   · que **F-04** ⛔ e **F-19** ⛔ não se fundam numa hierarquia terapêutica.
 *
 * NÃO PROMETE: que a PA esteja clinicamente bem manejada — ⛔ isso é do médico.
 *   ⛔ Aqui se mede **a relação entre a medida vigente ⛔ e o alvo do contexto**,
 *   ⛔ e ⛔ nada além.
 *
 * UNIVERSO: `avc/nucleo/derivacoes-g.ts` × `avc/conteudo/{superficie-g,
 *   antihipertensivos}.ts` × a tela do Destino.
 *
 * ── ⚠️⚠️ A REGRA PERMANENTE, APLICADA AO TEMPO ────────────────────────────
 *
 * ⚠️ *"Estado intermediário ⛔ nunca é evidência concluída"* (autor, Fase 7).
 * ⛔ Aqui: ⛔ trombólise registrada ≠ pós-reperfusão concluído · ⛔ PA medida uma
 * vez ≠ controle mantido por 24 h · ⛔ tempo decorrido parcial ≠ período
 * completo.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase8-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const G = emT("avc", "nucleo", "derivacoes-g.js");
const SF = emT("avc", "conteudo", "superficie-f.js");
const SG = emT("avc", "conteudo", "superficie-g.js");
const AH = emT("avc", "conteudo", "antihipertensivos.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const T0 = 1_000_000;
const rel = R.relogioControlado(T0);
const pa = (n) => I.nomeDaInstancia("pa", n);
const iv = (n) => I.nomeDaInstancia(SF.TROMBOLISE_IV, n);
const regI = (e, i, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, i);
const escI = (e, i, c, r) => regI(e, i, c, CAMPO.valorDaOpcao(r));

/** ⚠️ Uma trombólise iniciada, com horário — ⛔ o contexto que abre a janela. */
const semHorario = escI(E.abrirAtendimento(rel), iv(1), "ivt_estado", "Iniciada");
const ivt = regI(semHorario, iv(1), "ivt_inicio", T0);
const medir = (e, n, s, d) => {
  let x = e;
  if (s !== undefined) x = regI(x, pa(n), "pas", s);
  if (d !== undefined) x = regI(x, pa(n), "pad", d);
  return x;
};
const em = (e, horas) => G.estadoPressoricoPosIvt(e, T0 + horas * 3_600_000);

/* ══ ⚠️⚠️ 1 · AS FRONTEIRAS — ⛔ `<` ⛔ E ⛔ NUNCA `≤` ═══════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ POR QUE CADA UMA DELAS ESTÁ AQUI ────────────────────────────
   *
   * ⛔ Pedido do autor (**item 3**): *"Isso evita transformar `<` em `≤` por
   * acidente."* ⚠️ ⛔ E ⛔ não basta uma: **179/105** ⛔ e **180/104** provam que
   * as **duas** metades são exigidas — ⛔ uma sozinha ⛔ não classifica.
   */
  const FRONTEIRAS = [
    [179, 104, "dentro_do_alvo"],
    [180, 104, "acima_do_alvo"],
    [179, 105, "acima_do_alvo"],
    [180, 105, "acima_do_alvo"],
    [181, 106, "acima_do_alvo"],
  ];
  for (const [pas, pad, esperado] of FRONTEIRAS) {
    const r = em(medir(ivt, 1, pas, pad), 2);
    conf(
      `⚠️⚠️ ${pas}/${pad} → **${esperado}**`,
      r !== undefined && r.estado === esperado && r.pas === pas && r.pad === pad,
      `⛔ "${r && r.estado}" — ⛔ trocar \`<\` por \`≤\` incluiria ⛔ exatamente 180/105 no alvo`
    );
  }
}

/* ══ ⚠️⚠️ 2 · O QUE ⛔ NÃO CLASSIFICA ═════════════════════════════════════ */
{
  conf(
    "⚠️ ⛔ sem PA registrada → **sem_pa**, ⛔ e ⛔ nunca *«dentro»*",
    em(ivt, 2).estado === "sem_pa",
    `⛔ "${em(ivt, 2).estado}" — ⛔ ausência ⛔ não é normalidade (**§0.2**)`
  );

  /**
   * ⚠️⚠️ ⛔ A REGRA DA FASE 7 VALE IGUAL AQUI — ⛔ meia medida ⛔ não é medida.
   */
  for (const [nome, s, d] of [["só PAS 170", 170, undefined], ["só PAD 98", undefined, 98]]) {
    const r = em(medir(ivt, 1, s, d), 2);
    conf(
      `⚠️⚠️ ${nome} → **afericao_incompleta**, ⛔ nem dentro ⛔ nem fora`,
      r.estado === "afericao_incompleta" && r.pas === undefined && r.pad === undefined,
      `⛔ "${r.estado}" — ⛔ classificar meia aferição é a Fase 7 voltando`
    );
  }
}

/* ══ ⚠️⚠️ 3 · O CONTEXTO TEMPORAL ═══════════════════════════════════════ */
{
  conf(
    "⚠️⚠️ ⛔ SEM trombólise registrada, a pergunta ⛔ NÃO existe",
    em(medir(E.abrirAtendimento(rel), 1, 170, 98), 2) === undefined,
    "⛔ aplicar o alvo pós-IVT a quem ⛔ não recebeu IVT é usar a regra fora do contexto da fonte"
  );
  conf(
    "⚠️ ⛔ com IVT ⛔ e ⛔ sem horário → **sem_horario_ivt**, ⛔ e ⛔ nenhum substituto",
    em(semHorario, 2).estado === "sem_horario_ivt",
    `⛔ "${em(semHorario, 2).estado}" — ⛔ assumir *«agora»* inventaria a janela`
  );
  conf(
    "⚠️⚠️ ⛔ passadas 24 h → **fora_da_janela**, ⛔ mesmo com PA ótima",
    em(medir(ivt, 1, 170, 98), 25).estado === "fora_da_janela",
    `⛔ "${em(medir(ivt, 1, 170, 98), 25).estado}" — ⛔ a recomendação graduada ⛔ define ⛔ este alvo ⛔ só nas 24 h`
  );
  /** ⚠️ ⛔ E a fronteira das 24 h também é `<`, ⛔ e ⛔ não `≤`. */
  conf(
    "⚠️ ⛔ em 23,9 h ⛔ ainda dentro da janela",
    em(medir(ivt, 1, 170, 98), 23.9).estado === "dentro_do_alvo",
    `⛔ "${em(medir(ivt, 1, 170, 98), 23.9).estado}"`
  );
}

/* ══ ⚠️⚠️ 4 · *«DENTRO»* ⛔ NÃO É *«CONTROLADA POR 24 h»* ════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ A DISTINÇÃO OBRIGATÓRIA (autor, **item 8**) ─────────────────
   *
   * ⛔ Uma PA 170/98 agora significa `dentro_do_alvo`. ⚠️ ⛔ Afirmar
   * *"controlada nas últimas 24 horas"* exigiria a **série inteira** do
   * período — ⛔ e o app ⛔ não a tem.
   */
  const r = em(medir(ivt, 1, 170, 98), 2);
  conf(
    "⚠️ o estado nomeia a MEDIDA, ⛔ e ⛔ não o período",
    r.estado === "dentro_do_alvo" && !/mantid|control|24/i.test(r.estado),
    `⛔ "${r.estado}"`
  );

  const telas = ["superficie-g.tsx"];
  const PROIBIDAS = /controlada nas últimas|controle mantido|24 ?h controlad|pressão controlada/i;
  const mentem = telas.filter((f) => {
    const caminho = path.join(appDir, "components", "avc", f);
    return fs.existsSync(caminho) && PROIBIDAS.test(lerFonte(caminho));
  });
  conf(
    "⚠️⚠️ ⛔ NENHUMA tela afirma controle SUSTENTADO a partir de uma medida",
    mentem.length === 0,
    `⛔ ${mentem.join(" · ")} — ⛔ uma aferição ⛔ não prova um período`
  );
}

/* ══ ⚠️⚠️ 5 · U-01 — UMA VERDADE, DOIS CONSUMIDORES ════════════════════ */
{
  const u = AH.PA_POS_REPERFUSAO;
  conf(
    "⚠️ o 180/105 tem fonte ÚNICA, com os dois consumidores declarados",
    u !== undefined && u.pas === 180 && u.pad === 105
    && u.consumidores.alvoTerapeuticoPosIvt.fonte === "F-04"
    && u.consumidores.gatilhoDeFrequencia.fonte === "F-15",
    `⛔ ${JSON.stringify(u && { pas: u.pas, pad: u.pad })}`
  );

  /**
   * ⚠️⚠️ ⛔ E A TABLE 7 **CONSOME** A CONSTANTE — ⛔ ela ⛔ não repete o número.
   *
   * ⛔ Eram dois literais independentes: corrigir um ⛔ e ⛔ não o outro deixaria
   * as duas semânticas discordando ⛔ em silêncio (**U-01**).
   */
  conf(
    "⚠️⚠️ ⛔ e a Table 7 LÊ a constante, ⛔ em vez de repetir o número",
    /**
     * ⚠️⚠️ ⛔ **IDENTIDADE**, ⛔ e ⛔ não igualdade de valor — ⛔ e ⛔ a primeira
     * versão desta conferência passou verde sobre a mutação que devolvia os
     * literais: ⛔ `180 === 180` ⛔ é verdade, ⛔ e o nome ⛔ ainda aparecia no
     * arquivo. ⛔ Um literal ⛔ nunca é a **mesma referência**.
     */
    SG.MONITORIZACAO_POS_IVT.gatilhoPressorico.origem === u,
    "⛔ dois literais do mesmo número é como as duas semânticas passam a discordar"
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ NENHUM CONSUMIDOR USA A FRASE DO OUTRO. ⛔ *"Aumentar a
   * frequência das medidas"* ⛔ não é *"o alvo terapêutico é"*.
   */
  conf(
    "⚠️⚠️ ⛔ cada consumidor carrega a SUA semântica, ⛔ e ⛔ não a do outro",
    u.consumidores.alvoTerapeuticoPosIvt.frase !== u.consumidores.gatilhoDeFrequencia.frase
    && /frequência/i.test(u.consumidores.gatilhoDeFrequencia.frase)
    && !/frequência/i.test(u.consumidores.alvoTerapeuticoPosIvt.frase),
    "⛔ trocar as frases faz a tela prometer conduta onde a fonte pede vigilância"
  );

  /** ⚠️ ⛔ E o alvo que a derivação usa é o **do consumidor certo**. */
  const r = em(medir(ivt, 1, 170, 98), 2);
  conf(
    "⚠️ a derivação usa o alvo TERAPÊUTICO, com COR ⛔ e LOE da fonte",
    r.fonte === "F-04" && r.cor === "1" && r.loe === "B-R"
    && r.alvo.pas === 180 && r.alvo.pad === 105,
    `⛔ ${JSON.stringify({ fonte: r.fonte, cor: r.cor, loe: r.loe, alvo: r.alvo })}`
  );
}

/* ══ ⚠️⚠️ 6 · F-04 ⛔ E F-19 ⛔ NÃO SE FUNDEM ══════════════════════════ */
{
  /**
   * ⚠️ Regra do autor (**item 10**): ⛔ **não** produzir automaticamente
   * *"PA acima de 180/105 → use o medicamento X"*. ⛔ Nenhuma das duas fontes
   * sustenta ⛔ essa ligação como hierarquia.
   */
  const fonteG = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"));
  conf(
    "⚠️⚠️ ⛔ a derivação do alvo ⛔ NÃO importa os agentes de F-19",
    !/AGENTES_ANTI_HIPERTENSIVOS/.test(fonteG),
    "⛔ meta ⛔ e opções são fontes diferentes — ⛔ fundi-las cria conduta que ⛔ ninguém escreveu"
  );

  /**
   * ⚠️⚠️ ⛔ E AS DUAS **COR 3** CONTINUAM SEPARADAS — ⛔ e ⛔ elas ⛔ não viram
   * *"piso de 140"*: ⛔ a recomendação graduada dá **teto**, ⛔ e a faixa
   * prática ~140–180 é *supportive text* **⛔ sem grau**.
   */
  const alvos = AH.ALVOS_PRESSORICOS;
  const cor3 = alvos.filter((a) => String(a.cor).startsWith("3"));
  conf(
    "⚠️ as DUAS COR 3 existem, ⛔ e com forças diferentes",
    cor3.length === 2
    && cor3.some((a) => /Harm/i.test(a.cor)) && cor3.some((a) => /No Benefit/i.test(a.cor)),
    `⛔ ${cor3.map((a) => `${a.id}=${a.cor}`).join(" · ")} — ⛔ *No Benefit* ⛔ e *Harm* ⛔ não são a mesma coisa`
  );
  const faixa = alvos.find((a) => a.apoioSemGrau === true);
  conf(
    "⚠️⚠️ ⛔ e a faixa prática ~140–180 segue marcada como APOIO SEM GRAU",
    faixa !== undefined && faixa.cor === "—" && faixa.loe === "—",
    `⛔ ${JSON.stringify(faixa && { cor: faixa.cor, loe: faixa.loe })} — ⛔ *supportive text* ⛔ não é recomendação graduada (**E-45**)`
  );
}

/* ══ ⚠️⚠️ 7 · AS DÍVIDAS QUE CONTINUAM ABERTAS ════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ E ⛔ TRÊS DAS QUATRO **⛔ NÃO** ERAM DÍVIDA ──────────────────
   *
   * ⛔ Eu declarei quatro pendências pós-trombólise. ⚠️ O mapeamento mediu:
   * frequência de monitorização, deterioração neurológica ⛔ e imagem de
   * controle **⛔ já estavam transcritas** em `MONITORIZACAO_POS_IVT` (F-15,
   * Table 7). ⛔ A única ausente é o **antitrombótico** — ⛔ e ⛔ dela existe
   * ⛔ só a regra de **ordem**.
   */
  const m = SG.MONITORIZACAO_POS_IVT;
  conf(
    "⚠️ frequência, deterioração ⛔ e imagem de controle ESTÃO transcritas",
    m.fases.length === 3
    && m.deterioracao.sinais.length >= 5 && m.deterioracao.condutas.length === 2
    && m.imagemDeControle.prazoHoras === 24,
    "⛔ declarar dívida sobre conteúdo que existe esconde o que ⛔ já se pode usar"
  );
  conf(
    "⚠️⚠️ ⛔ e a ORDEM da imagem sobrevive: exame ANTES do antitrombótico",
    /ANTES de iniciar anticoagulante ou antiagregante/i.test(m.imagemDeControle.texto),
    "⛔ *«TC em 24 h»* ⛔ sem a ordem perde a razão de ser da regra"
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUM antitrombótico específico foi inventado",
    !/aspirina|clopidogrel|heparina|enoxaparina|dupla antiagrega/i.test(
      lerFonte(path.join(appDir, "avc", "conteudo", "superficie-g.ts"))
      + lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-g.ts"))
    ),
    "⛔ a fonte dá a ORDEM, ⛔ e ⛔ não o agente — ⛔ preencher seria **E-31**"
  );
}

/* ══ ⚠️⚠️ 8 · A TELA MOSTRA O ESTADO, ⛔ E ⛔ NÃO O RECALCULA ═══════════ */
{
  const tela = lerFonte(path.join(appDir, "components", "avc", "superficie-g.tsx"));

  conf(
    "⚠️⚠️ o Destino DESENHA `estadoPressoricoPosIvt`",
    /estadoPressoricoPosIvt/.test(tela) && /avc-g-pa-estado/.test(tela),
    "⛔ ⛔ sem ⛔ ele, o alvo pós-IVT fica ⛔ só no núcleo, ⛔ longe de quem monitoriza"
  );
  conf(
    "⚠️⚠️ ⛔ e ⛔ NÃO compara número ⛔ nenhum por conta própria",
    !/pas\s*[<>]=?\s*180|pad\s*[<>]=?\s*105/.test(tela),
    "⛔ `<` ⛔ ou `≤` é decisão clínica — ⛔ recalculada no JSX, ⛔ ela envelhece com o layout (**I6**)"
  );

  /**
   * ⚠️⚠️ ⛔ E A FRASE NOMEIA **A AFERIÇÃO**, ⛔ e ⛔ não o período — ⛔ item 2 do
   * autor. ⛔ *"Dentro do alvo"* ⛔ sozinho já convida à leitura longitudinal.
   */
  conf(
    "⚠️⚠️ ⛔ a frase do estado diz **«na aferição atual»**",
    /Dentro do alvo na aferição atual/.test(tela)
    && /Acima do alvo na aferição atual/.test(tela),
    "⛔ ⛔ sem o qualificador, uma medida vira um período"
  );

  /** ⚠️ ⛔ E ⛔ nenhum slug interno chega ao médico (Fases 6 ⛔ e 7). */
  const SLUG = /"(dentro_do_alvo|acima_do_alvo|sem_horario_ivt|fora_da_janela|sem_pa)"\s*\)/;
  conf(
    "⚠️ ⛔ e ⛔ nenhum identificador interno é exibido como texto",
    !SLUG.test(tela),
    "⛔ slug ⛔ não é linguagem clínica"
  );

  /**
   * ⚠️⚠️ ⛔ A REGRA VIGENTE CARREGA **CONTEXTO ⛔ E GRAU** — ⛔ e ⛔ nunca vira
   * *"Meta PA"* (item 1): ⛔ há **quatro** estatutos pressóricos, ⛔ e o número
   * sozinho apagaria **quando** ⛔ ele vale.
   */
  conf(
    "⚠️⚠️ ⛔ e ⛔ NUNCA escreve *«Meta PA»* solta",
    !/"Meta PA"|>Meta PA</.test(tela) && /avc-g-pa-regra/.test(tela),
    "⛔ um alvo ⛔ sem contexto temporal é o pré-IVT ⛔ e o pós-IVT virando o mesmo número"
  );
}

if (falhas > 0) {
  console.log(`\n❌ PÓS-REPERFUSÃO — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ PÓS-REPERFUSÃO — ${ok}/${ok} conferências · 5 fronteiras, 6 estados`);
