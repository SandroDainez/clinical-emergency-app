#!/usr/bin/env node
/**
 * TRAVA DO CICLO DE CORREÇÕES — ⚠️ **meia medida ⛔ não é medida**.
 *
 * PROMETE:
 *   · que uma aferição **pela metade** ⛔ NÃO derrube o bloqueio pressórico,
 *     ⛔ não substitua a última completa ⛔ e ⛔ não libere o portão;
 *   · que PAS ⛔ e PAD de uma aferição ⛔ **nunca** se completem com a metade de
 *     outra (**D-120**);
 *   · que **⛔ nenhum** estado de ação resolva bloqueio — ⛔ nem `Realizada`;
 *   · que o ciclo glicêmico mantenha o degrau da fonte: corrigir ⛔ não reavalia;
 *   · que a ordem temporal decida, ⛔ e ⛔ não o valor.
 *
 * NÃO PROMETE: qual anti-hipertensivo usar — ⛔ **F-19 proíbe hierarquia**, ⛔ e
 *   ⛔ esta trava ⛔ não inventa uma.
 *
 * UNIVERSO: `avc/nucleo/{derivacoes,derivacoes-d,derivacoes-e,portao-ivt}.ts`
 *   × `avc/conteudo/superficie-e.ts` × a tela de Correções.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ESTA TRAVA NASCEU PARA FECHAR ────────────────────
 *
 * ⛔ Medido no mapeamento da Fase 7, 2026-09-07: com **198/112** bloqueando ⛔ e
 * uma nova aferição contendo **só a PAS**, `bloqueiosCorrigiveis()` **parava de
 * acusar**. ⚠️ ⛔ O médico digita 170 de sistólica, ⛔ é interrompido antes da
 * diastólica, ⛔ e o app **destrava** — ⛔ sobre uma aferição que ⛔ não existe.
 *
 * ⚠️ Regra do autor: *"Medida parcial ⛔ não é nova normalidade, ⛔ não é
 * ausência de medida ⛔ e ⛔ não é resolução."*
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "fase7-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "nucleo", "portao-ivt.ts"),
    path.join(appDir, "avc", "conteudo", "antihipertensivos.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const emT = (...p) => require(path.join(tmp, ...p));
const K = emT("avc", "conteudo", "campos.js");
const CAMPO = emT("avc", "conteudo", "campo.js");
const R = emT("avc", "nucleo", "relogio.js");
const E = emT("avc", "nucleo", "estado.js");
const I = emT("avc", "nucleo", "instancia.js");
const D = emT("avc", "nucleo", "derivacoes.js");
const DD = emT("avc", "nucleo", "derivacoes-d.js");
const DE = emT("avc", "nucleo", "derivacoes-e.js");
const P = emT("avc", "nucleo", "portao-ivt.js");
const SE = emT("avc", "conteudo", "superficie-e.js");
const AH = emT("avc", "conteudo", "antihipertensivos.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
const pa = (n) => I.nomeDaInstancia("pa", n);
const ac = (n) => I.nomeDaInstancia(SE.ACAO, n);
const regI = (e, i, c, v) => K.registrarComInstancia(e, { campo: c, valor: v }, rel, i);
const escI = (e, i, c, r) => regI(e, i, c, CAMPO.valorDaOpcao(r));
const reg = (e, c, v, t) => E.registrarFato(e, { campo: c, valor: v }, R.relogioControlado(t));
const acao = (e, i, t, s) => escI(escI(e, i, "acao_tipo", t), i, "acao_estado", s);

/** ⚠️ PA 198/112 com tratamento já registrado — ⛔ o ponto de partida dos casos. */
const base = acao(
  regI(regI(vazio, pa(1), "pas", 198), pa(1), "pad", 112),
  ac(1), "Tratamento anti-hipertensivo", SE.ESTADO_DA_ACAO.realizada
);
const bloq = (e) => DD.bloqueiosCorrigiveis(e).map((b) => b.id);
const portao = (e) => P.estadoDoPortaoIVT(e).estado;

/* ══ ⚠️⚠️ 1 · OS CINCO CASOS DA PA ══════════════════════════════════════ */
{
  conf(
    "⚠️ CASO A · melhora 174/98 → o bloqueio CAI",
    (() => {
      const e = regI(regI(base, pa(2), "pas", 174), pa(2), "pad", 98);
      return bloq(e).length === 0 && portao(e) !== "afericao_incompleta";
    })(),
    "⛔ aferição completa abaixo do corte é ⛔ exatamente o que resolve"
  );

  conf(
    "⚠️ CASO B · continua alta 190/108 → o bloqueio PERMANECE",
    (() => {
      const e = regI(regI(base, pa(2), "pas", 190), pa(2), "pad", 108);
      return bloq(e).includes("pressao_acima_da_meta");
    })(),
    "⛔ medir de novo ⛔ não é baixar"
  );

  /**
   * ⚠️⚠️ ⛔ OS DOIS CASOS QUE O DEFEITO DEIXAVA PASSAR — ⛔ e ⛔ eles são
   * simétricos: ⛔ falta a diastólica, ⛔ ou falta a sistólica.
   */
  for (const [nome, campo, valor, falta] of [
    ["CASO C · só PAS 170", "pas", 170, "pad"],
    ["CASO D · só PAD 96", "pad", 96, "pas"],
  ]) {
    const e = regI(base, pa(2), campo, valor);
    conf(
      `⚠️⚠️ ${nome} → **afericao_incompleta**, ⛔ e o bloqueio PERMANECE`,
      bloq(e).includes("pressao_acima_da_meta") && portao(e) === "afericao_incompleta",
      `⛔ bloq=${JSON.stringify(bloq(e))} portao=${portao(e)} — ⛔ meia medida ⛔ não prova resolução`
    );
    conf(
      `⚠️ ⛔ e ⛔ ela ⛔ NÃO substitui a última completa (${falta} em falta)`,
      (() => {
        const u = D.ultimaPressaoCompleta(e);
        return u !== undefined && u.pas === 198 && u.pad === 112;
      })(),
      `⛔ ${JSON.stringify(D.ultimaPressaoCompleta(e))} — a PA conhecida ⛔ continua sendo 198/112`
    );
    const m = P.estadoDoPortaoIVT(e).motivos.find((x) => x.id === "afericao_incompleta");
    conf(
      "⚠️ ⛔ e o motivo diz QUAL metade falta",
      m !== undefined && m.campo === falta && m.fonte === "F-04",
      `⛔ ${JSON.stringify(m)} — *"complete a aferição"* ⛔ sem dizer o quê ⛔ não é instrução`
    );
  }

  conf(
    "⚠️ CASO E · tratamento ⛔ SEM nova medida → **aguardando_reavaliacao**",
    portao(base) === "aguardando_reavaliacao" && bloq(base).includes("pressao_acima_da_meta"),
    `⛔ ${portao(base)}`
  );

  /**
   * ⚠️⚠️ ⛔ **D-120 PELO OUTRO LADO**: ⛔ a PAS nova ⛔ **NUNCA** se junta com a
   * PAD antiga. ⛔ 170 com 112 produziria uma **170/112 que ⛔ ninguém mediu**.
   */
  {
    const e = regI(base, pa(2), "pas", 170);
    const u = D.ultimaPressaoCompleta(e);
    conf(
      "⚠️⚠️ ⛔ a metade nova ⛔ NÃO se completa com a metade antiga (**D-120**)",
      u.instancia === pa(1) && !(u.pas === 170 && u.pad === 112),
      `⛔ ${JSON.stringify(u)} — PA fictícia é a família de defeito que D-120 fechou`
    );
  }
}

/* ══ ⚠️⚠️ 2 · AÇÃO REGISTRADA ⛔ NUNCA RESOLVE ═════════════════════════ */
{
  /**
   * ⚠️ ⛔ `acaoResolveBloqueio()` devolve `false` **por construção** — ⛔ e ⛔ a
   * conferência varre **⛔ todos** os estados, ⛔ inclusive `Realizada`.
   */
  const estados = Object.values(SE.ESTADO_DA_ACAO);
  conf(
    "⚠️ há estados de ação a vigiar",
    estados.length >= 5,
    `⛔ ${estados.length} — trava sobre lista vazia fica verde ⛔ sem medir`
  );
  const resolvem = estados.filter((st) => DE.acaoResolveBloqueio({ estado: st }) !== false);
  conf(
    "⚠️⚠️ ⛔ NENHUM estado de ação resolve bloqueio — ⛔ nem `Realizada`",
    resolvem.length === 0,
    `⛔ ${resolvem.join(" · ")} — *"realizada"* diz que aconteceu, ⛔ e ⛔ não que funcionou`
  );
  const aindaBloqueia = estados.every((st) =>
    bloq(acao(regI(regI(vazio, pa(1), "pas", 198), pa(1), "pad", 112), ac(1), "Tratamento anti-hipertensivo", st))
      .includes("pressao_acima_da_meta")
  );
  conf(
    "⚠️⚠️ ⛔ e o bloqueio SOBREVIVE a ⛔ qualquer estado de ação",
    aindaBloqueia,
    "⛔ quem responde se funcionou é a **nova aferição**"
  );
}

/* ══ ⚠️⚠️ 3 · O CICLO GLICÊMICO — ⛔ E ⛔ ELE ⛔ NÃO É SIMÉTRICO ═════════ */
{
  /**
   * ⚠️ Decisão do autor (**item 12**): *"⛔ Não simplificar esse ciclo para
   * ficar simétrico com PA. PA ⛔ e glicemia têm semânticas de reavaliação
   * **diferentes**."*
   *
   * ⛔ A PA resolve com **uma nova aferição**. ⚠️ A glicemia ⛔ **não**: F-06
   * exige exame neurológico **depois** da correção.
   */
  let g = reg(vazio, "glicemia", 48, 1_000_100);
  g = acao(g, ac(1), "Correção glicêmica", SE.ESTADO_DA_ACAO.realizada);
  const g110 = reg(g, "glicemia", 110, 1_000_200);
  conf(
    "⚠️⚠️ glicemia 110 ⛔ SEM exame → **corrigida_sem_exame**, ⛔ e o portão ⛔ NÃO libera",
    D.estadoDaReavaliacao(g110) === "corrigida_sem_exame"
    && portao(g110) === "aguardando_reavaliacao",
    `⛔ ${D.estadoDaReavaliacao(g110)} · ${portao(g110)}`
  );
  const comExame = reg(g110, "deficit_focal", "sim", 1_000_300);
  conf(
    "⚠️ ⛔ e ⛔ só o exame POSTERIOR fecha",
    D.estadoDaReavaliacao(comExame) === "reavaliado"
    && portao(comExame) !== "aguardando_reavaliacao",
    `⛔ ${D.estadoDaReavaliacao(comExame)} · ${portao(comExame)}`
  );

  /**
   * ⚠️⚠️ ⛔ O INVERSO — ⛔ e ⛔ ele existe para provar que quem decide é a
   * **ORDEM**, ⛔ e ⛔ não o valor: ⛔ um paciente que **piora** ⛔ não pode ler
   * *"resolvido"*.
   */
  const piora = reg(reg(reg(vazio, "glicemia", 110, 1_000_100), "deficit_focal", "sim", 1_000_150), "glicemia", 48, 1_000_200);
  conf(
    "⚠️⚠️ 110 → 48 (PIORA) → **alterada_agora**, ⛔ e ⛔ nunca reavaliado",
    D.estadoDaReavaliacao(piora) === "alterada_agora"
    && bloq(piora).includes("glicemia_alterada"),
    `⛔ ${D.estadoDaReavaliacao(piora)} — ordenar por VALOR diria "resolvido" ⛔ num paciente que piorou`
  );

  /** ⚠️ ⛔ E os dois ciclos ⛔ não colapsaram num só. */
  conf(
    "⚠️ ⛔ PA ⛔ e glicemia continuam com ciclos DIFERENTES",
    (() => {
      const paOk = regI(regI(base, pa(2), "pas", 174), pa(2), "pad", 98);
      /** ⛔ A PA fecha com a aferição; ⛔ a glicemia ⛔ ainda pede o exame. */
      return bloq(paOk).length === 0 && portao(g110) === "aguardando_reavaliacao";
    })(),
    "⛔ simetria inventada apagaria o degrau que **F-06** acrescenta"
  );
}

/* ══ ⚠️⚠️ 4 · F-19 — REFERÊNCIA ⛔ SEM HIERARQUIA ══════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ A ADVERTÊNCIA DA PRÓPRIA FONTE ──────────────────────────────
   *
   * > *"A lista dos sete **⛔ NÃO** é 'anti-hipertensivos recomendados para AVC
   * >  isquêmico'. É a tabela geral de **emergências hipertensivas**. ⛔ Não
   * >  criar hierarquia ⛔ nem preferência ⛔ sem fonte."*
   *
   * ⚠️ ⛔ E há divergências internas: a nicardipina é citada para AVC ⛔ e ⛔ não
   * consta da lista de disponíveis do **mesmo documento**; o labetalol está sob
   * divergência de disponibilidade no Brasil.
   */
  const agentes = AH.AGENTES_ANTI_HIPERTENSIVOS;
  conf(
    "⚠️ há agentes transcritos a vigiar",
    Array.isArray(agentes) && agentes.length >= 5,
    `⛔ ${agentes && agentes.length}`
  );

  /**
   * ── ⚠️⚠️ ⛔ A PRIMEIRA VERSÃO DESTA CONFERÊNCIA ERA CRUA DEMAIS ─────────
   *
   * ⛔ Ela reprovava a palavra *"preferencial"* — ⛔ e reprovou
   * `preferencial_2019`, ⛔ que é **atribuído ⛔ e datado**: um fato sobre a
   * tabela da AHA/ASA de **2019**, ⛔ e ⛔ não uma preferência que o app inventa.
   *
   * ⚠️⚠️ ⛔ O que a fonte proíbe é **hierarquia ⛔ sem fonte**. ⚠️ Então o que se
   * mede é ⛔ **a atribuição**: ⛔ todo papel que soe a preferência carrega ano
   * ⛔ ou procedência, ⛔ e ⛔ nenhum agente tem dose ⛔ sem dizer de onde veio.
   */
  const fonteConteudo = lerFonte(path.join(appDir, "avc", "conteudo", "antihipertensivos.ts"));
  const telaE = lerFonte(path.join(appDir, "components", "avc", "superficie-e.tsx"));
  const INVENTADOS = ["primeira escolha", "segunda escolha", "droga de escolha", "recomendado para avc", "melhor opção"];
  const comRanking = INVENTADOS.filter((r) => (fonteConteudo + telaE).toLowerCase().includes(r));
  conf(
    "⚠️⚠️ ⛔ NENHUM ranking INVENTADO — a fonte proíbe hierarquia ⛔ sem fonte",
    comRanking.length === 0,
    `⛔ ${comRanking.join(" · ")} — tabela geral de EH ⛔ não vira ranking para AVC`
  );

  const papeis = [...new Set(agentes.map((a) => a.papel))];
  const semAtribuicao = papeis.filter((p) => /preferen|escolha|melhor/i.test(p) && !/\d{4}/.test(p));
  conf(
    "⚠️⚠️ ⛔ todo papel que soa PREFERÊNCIA carrega o ANO da fonte",
    semAtribuicao.length === 0,
    `⛔ ${semAtribuicao.join(" · ")} — *"preferencial"* ⛔ sem ano é o app assinando a escolha`
  );

  const semProcedencia = agentes.filter((a) => a.dose !== undefined && !a.procedencia);
  conf(
    "⚠️⚠️ ⛔ e ⛔ NENHUMA dose sem procedência (**E-30**)",
    semProcedencia.length === 0,
    `⛔ ${semProcedencia.map((a) => a.nome).join(" · ")} — dose ⛔ sem origem ⛔ não se audita`
  );

  /**
   * ⚠️⚠️ ⛔ E O REGISTRO DA AÇÃO ⛔ NÃO PRESUME O AGENTE — ⛔ a referência
   * terapêutica ⛔ e o registro do que foi feito são responsabilidades
   * **distintas** (autor, **item 8**).
   */
  const acaoTipo = K.campoDoModulo("acao_tipo");
  conf(
    "⚠️ o registro da ação ⛔ NÃO nomeia fármaco",
    acaoTipo !== undefined
    && (acaoTipo.opcoes ?? []).every((o) =>
      !agentes.some((a) => String(o).toLowerCase().includes(String(a.nome ?? a.id ?? "").toLowerCase()))),
    `⛔ ${JSON.stringify(acaoTipo && acaoTipo.opcoes)} — registrar o que foi feito ⛔ não é escolher o que dar`
  );

  /** ⚠️⚠️ ⛔ E a justificativa ENVELHECIDA saiu: F-19 ⛔ não está mais parcial. */
  const conteudoE = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-e.ts"));
  conf(
    "⚠️⚠️ ⛔ e ⛔ nenhum comentário ainda diz *«enquanto F-19 estiver parcial»*",
    !/F-19 estiver parcial|enquanto F-19/.test(conteudoE + telaE),
    "⛔ razão envelhecida sustentando conduta certa é a próxima decisão errada"
  );
}

/* ══ ⚠️⚠️ 5 · A TELA MOSTRA O CICLO, ⛔ E ⛔ NÃO O RECALCULA ═══════════ */
{
  const telaE = lerFonte(path.join(appDir, "components", "avc", "superficie-e.tsx"));
  conf(
    "⚠️⚠️ Correções mostra o estado do PORTÃO — ⛔ sem mandar o médico à Reperfusão",
    /estadoDoPortaoIVT/.test(telaE),
    "⛔ *«voltar para descobrir se liberou»* é a tela ⛔ não ter fechado o ciclo (item 11)"
  );
  conf(
    "⚠️ ⛔ e ⛔ NÃO recompõe a regra a partir das camadas",
    !/bloqueiosCorrigiveis|ultimaPressaoCompleta\(/.test(telaE),
    "⛔ regra recalculada no JSX envelhece junto com o layout (**I6**)"
  );
}

/* ══ ⚠️⚠️ 6 · ⛔ NENHUM IDENTIFICADOR INTERNO NA TELA ═══════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ ACHADO NA REVISÃO VISUAL, ⛔ DUAS VEZES ──────────────────────
   *
   * ⛔ Na Fase 6 a divergência mostrava `inr` em vez de **INR**. ⚠️ Na Fase 7 o
   * ciclo glicêmico mostrava *"— corrigida_sem_exame"*.
   *
   * ⛔ ⛔ Slug ⛔ **não** é linguagem clínica, ⛔ e ⛔ a prova estrutural ⛔ não
   * pegava: ⛔ ela conferia o **estado**, ⛔ e ⛔ não a **palavra exibida**.
   */
  const SLUG = /^[a-z][a-z0-9]*(_[a-z0-9]+)+$/;
  const cenarios = [
    ["PA parcial", regI(base, pa(2), "pas", 170)],
    ["PA alta", base],
    ["glicemia corrigida sem exame", (() => {
      let g = reg(vazio, "glicemia", 48, 1_000_100);
      g = acao(g, ac(1), "Correção glicêmica", SE.ESTADO_DA_ACAO.realizada);
      return reg(g, "glicemia", 110, 1_000_200);
    })()],
  ];
  const vazados = [];
  for (const [nome, e] of cenarios) {
    for (const m of P.estadoDoPortaoIVT(e).motivos) {
      for (const [chave, valor] of [["rotulo", m.rotulo], ["dado", m.dado], ["oQueFalta", m.oQueFalta]]) {
        if (typeof valor === "string" && SLUG.test(valor.trim())) {
          vazados.push(`${nome}/${m.id}.${chave}="${valor}"`);
        }
      }
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM motivo mostra identificador interno ao médico",
    vazados.length === 0,
    `⛔ ${vazados.join(" · ")} — slug ⛔ não é linguagem clínica`
  );
}

if (falhas > 0) {
  console.log(`\n❌ CORREÇÕES — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ CORREÇÕES — ${ok}/${ok} conferências · 5 casos de PA, 2 ciclos`);
