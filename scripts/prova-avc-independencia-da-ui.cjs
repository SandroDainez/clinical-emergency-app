#!/usr/bin/env node
/**
 * TRAVA DA INDEPENDÊNCIA — ⚠️ **⛔ o motor ⛔ não sabe onde o campo é desenhado**.
 *
 * PROMETE:
 *   · que **⛔ nenhum arquivo do núcleo clínico** importe de `components/`
 *     ⛔ ou de `design-system/`;
 *   · que **⛔ nenhuma derivação** leia id de **grupo de tela**;
 *   · que as derivações da glicemia funcionem a partir de **fatos puros**,
 *     ⛔ sem ⛔ nenhuma tela carregada;
 *   · que a **série temporal** distinga medida inicial, correção ⛔ e
 *     reavaliação — ⛔ e ⛔ que mover a apresentação ⛔ não a toque.
 *
 * NÃO PROMETE: que os cortes clínicos estejam certos (F-06, F-18 têm provas
 *   próprias), ⛔ nem que a tela esteja bonita.
 *
 * UNIVERSO: `avc/nucleo/*.ts` × os fatos de `glicemia`.
 *
 * ── ⚠️⚠️ ⛔ O CASO **D** DO AUTOR (2026-09-07) ────────────────────────────
 *
 * > *"Mover componente visual de D para outro ponto temporariamente em mutation
 * >  test. Resultado: regras clínicas continuam funcionando, demonstrando que
 * >  consumidores ⛔ não dependem da árvore de UI."*
 *
 * ⚠️⚠️ ⛔ E ⛔ ELA NASCEU ACHANDO UM DEFEITO MEU. ⛔ Ao escrevê-la descobri que
 * **eu mesmo** havia acoplado o núcleo ao design system na Fase 1:
 * `ameacas-imediatas.ts` ⛔ e `problemas-ativos.ts` importavam `EstadoClinico`
 * de `design-system/`. ⛔ Mexer numa cor tocaria o grafo de quem decide conduta.
 * ⛔ Eu ia escrever *"o núcleo ⛔ não depende de UI"* com a dependência dentro.
 *
 * ⚠️ A semântica dos estados foi para `lib/clinico/estados`; ⛔ o desenho ficou
 * no design system. ⛔ Esta trava impede a volta.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "independencia-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "nucleo", "derivacoes.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"),
    path.join(appDir, "avc", "nucleo", "ameacas-imediatas.ts"),
    path.join(appDir, "avc", "nucleo", "problemas-ativos.ts"),
    path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const nucleo = (f) => require(path.join(tmp, "avc", "nucleo", f));
const E = nucleo("estado.js");
const R = nucleo("relogio.js");
const D = nucleo("derivacoes.js");
const DD = nucleo("derivacoes-d.js");
const A = nucleo("ameacas-imediatas.js");
const P = nucleo("problemas-ativos.js");

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

/* ══ ⚠️⚠️ 1 · O NÚCLEO ⛔ NÃO IMPORTA APRESENTAÇÃO ═══════════════════════ */
{
  const dir = path.join(appDir, "avc", "nucleo");
  const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith(".ts"));
  conf(
    "⚠️ há arquivos de núcleo a varrer",
    arquivos.length >= 8,
    `⛔ ${arquivos.length} arquivo(s) — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
  );

  /**
   * ⚠️ ⛔ **⛔ Sem comentário**: metade destes arquivos cita `components/` em
   * prosa explicando ⛔ por que ⛔ **não** depende de tela. ⛔ Contar comentário
   * reprovaria ⛔ exatamente quem documentou a decisão certa.
   */
  const acoplados = arquivos.filter((f) => {
    const fonte = lerFonte(path.join(dir, f));
    return /^import[^\n]*from ["'][^"']*(components|design-system)\//m.test(fonte);
  });
  conf(
    "⚠️⚠️ ⛔ NENHUM arquivo do núcleo importa de `components/` ⛔ ou `design-system/`",
    acoplados.length === 0,
    `⛔ ${acoplados.join(" · ")} — o motor clínico ⛔ não pode depender do sistema de desenho`
  );
}

/* ══ ⚠️⚠️ 2 · ⛔ NENHUMA DERIVAÇÃO LÊ ID DE GRUPO DE TELA ════════════════ */
{
  /**
   * ⚠️ Os grupos são **arranjo visual**: `via-aerea`, `respiracao`, `pressao`,
   * `crise`. ⛔ Uma derivação que lesse o id de um grupo passaria a depender de
   * **onde** o campo foi desenhado — ⛔ e mover o card quebraria conduta.
   *
   * ⚠️⚠️ ⛔ `"pressao"` ⛔ e `"glicemia"` ⛔ NÃO entram nesta lista, ⛔ e ⛔ isso
   * ⛔ não é descuido: ⛔ eles são **ids de eixo ⛔ e de campo** também, ⛔ e
   * proibi-los aqui reprovaria a leitura legítima do fato.
   */
/**
   * ⚠️⚠️ ⛔ A LISTA VEM DO **CONTEÚDO**, ⛔ e ⛔ não é escrita à mão — ⛔ e a
   * primeira versão dela produziu um **falso positivo** que vale registrar.
   *
   * ⛔ Eu havia listado `"crise"` como id de grupo. ⚠️ `derivacoes.ts:534` o
   * cita — ⛔ mas como **id de uma leitura** (`{ id: "crise", ...`), ⛔ e ⛔ não
   * como grupo de tela. ⛔ A trava reprovava quem ⛔ não tinha feito ⛔ nada de
   * errado.
   *
   * ⚠️ Agora ⛔ ela subtrai do universo todo id que **também** é id de campo —
   * ⛔ porque aí a citação é legítima, ⛔ e distinguir uma da outra por texto
   * ⛔ não é possível.
   */
  const A_CONT = require(path.join(tmp, "avc", "conteudo", "superficie-a.js"));
  const idsDeCampo = new Set(A_CONT.TODOS_OS_CAMPOS_A.map((c) => c.id));
  /**
   * ⚠️⚠️ ⛔ E ⛔ TAMBÉM OS IDS DE **LEITURA** ⛔ e de **EIXO** — ⛔ e ⛔ isto é uma
   * limitação honesta desta conferência, ⛔ e ⛔ não um afrouxamento.
   *
   * ⛔ Os grupos de A se chamam `pressao`, `respiracao`, `glicemia`, `peso`,
   * `crise` — ⛔ e ⛔ esses são **também** os nomes dos domínios clínicos, ⛔ e
   * ⛔ das leituras que o núcleo produz. ⚠️ ⛔ Distinguir *"leu o grupo"* de
   * *"nomeou a leitura"* **por texto ⛔ não é possível**.
   *
   * ⚠️ ⛔ Sobram os que são **inequivocamente de tela** — ⛔ e ⛔ é ⛔ só sobre
   * ⛔ eles que esta conferência fala. ⚠️ A garantia forte contra acoplamento
   * está nas outras duas: ⛔ o núcleo ⛔ não **importa** apresentação, ⛔ e as
   * derivações **rodam ⛔ sem tela ⛔ nenhuma**.
   */
  const vazioParaIds = E.abrirAtendimento(R.relogioControlado(1));
  const idsDeLeitura = new Set([
    ...D.leiturasDaSuperficieA(vazioParaIds).map((l) => l.id),
    /** ⚠️ ⛔ E os **eixos** do ABCDE: `respiracao` é id de eixo, ⛔ e de grupo. */
    ...A.ameacasImediatas(vazioParaIds).map((x) => x.id),
  ]);
  const IDS_DE_GRUPO = A_CONT.GRUPOS_A
    .map((g) => g.id)
    .filter((g) => !idsDeCampo.has(g) && !idsDeLeitura.has(g));

  conf(
    "⚠️ há ids de grupo a vigiar",
    IDS_DE_GRUPO.length >= 2,
    `⛔ ${IDS_DE_GRUPO.length} — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
  );

  const dir = path.join(appDir, "avc", "nucleo");
  const violacoes = [];
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
    const fonte = lerFonte(path.join(dir, f));
    for (const g of IDS_DE_GRUPO) {
      if (fonte.includes(`"${g}"`)) violacoes.push(`${f} lê grupo "${g}"`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUMA derivação lê id de grupo de tela",
    violacoes.length === 0,
    `⛔ ${violacoes.join(" · ")} — derivação que sabe o nome do card quebra quando o card se move`
  );
}

/* ══ ⚠️⚠️ 3 · AS DERIVAÇÕES RODAM SOBRE FATOS PUROS ═════════════════════ */
{
  /**
   * ⚠️ ⛔ Este bloco inteiro roda **⛔ sem React, ⛔ sem tela, ⛔ sem componente**
   * ⛔ nenhum carregado. ⛔ Se as regras respondem aqui, ⛔ elas ⛔ não dependem
   * da árvore de UI — ⛔ que é o **Caso D** do autor.
   */
  const relogio = R.relogioControlado(1_000_000);
  const vazio = E.abrirAtendimento(relogio);
  const com = (e, v) => E.registrarFato(e, { campo: "glicemia", valor: v }, relogio);

  /* ⚠️ CASO A — ⛔ não informada ⛔ não vira normal. */
  {
    const eixo = A.ameacasImediatas(vazio).find((x) => x.id === "glicemia");
    conf(
      "⚠️⚠️ CASO A · glicemia ⛔ não informada ⛔ NÃO vira normal",
      eixo.estado === "nao_avaliado"
      && eixo.valor === undefined
      && D.glicemia(vazio).conclusao === "desconhecido",
      `⛔ eixo="${eixo.estado}" · leitura="${D.glicemia(vazio).conclusao}" — ausência ⛔ não é achado (E-23)`
    );
  }

  /* ⚠️ CASO B — hipoglicemia acende em todos os consumidores. */
  {
    const e = com(vazio, 48);
    const eixo = A.ameacasImediatas(e).find((x) => x.id === "glicemia");
    const bloqueio = DD.bloqueiosCorrigiveis(e).some((b) => b.id === "glicemia_alterada");
    const problema = P.problemasAtivos(e).some((p) => p.id === "glicemia" || p.id === "glicemia_alterada");
    conf(
      "⚠️⚠️ CASO B · hipoglicemia acende eixo, bloqueio ⛔ E problema ativo",
      eixo.estado === "ameaca" && bloqueio && problema,
      `⛔ eixo="${eixo.estado}" · bloqueio=${bloqueio} · problema=${problema}`
    );
  }

  /* ⚠️⚠️ CASO C — a SÉRIE distingue correção de medida inicial. */
  {
    /**
     * ⚠️⚠️ ⛔ ESTA É A LEITURA MAIS FRÁGIL DA MIGRAÇÃO, ⛔ e ⛔ por isso ⛔ ela
     * tem caso próprio: `estadoDaReavaliacao()` ⛔ **não** lê o valor vigente —
     * ⛔ ela filtra **todos** os fatos de glicemia ⛔ e compara a última medida
     * com as anteriores.
     *
     * ⛔ Uma migração que preservasse o **valor** ⛔ e mexesse na **ordem** dos
     * fatos quebraria ⛔ só esta, ⛔ e ⛔ nenhuma outra — ⛔ e a tela continuaria
     * parecendo certa.
     */
    const so48 = com(vazio, 48);
    conf(
      "⚠️ CASO C.1 · ⛔ só a medida alterada = **alterada agora**",
      D.estadoDaReavaliacao(so48) === "alterada_agora",
      `⛔ "${D.estadoDaReavaliacao(so48)}"`
    );

    /**
     * ⚠️⚠️ ⛔ **CORRIGIDA ⛔ NÃO É REAVALIADA** — ⛔ e eu presumi errado ao
     * escrever esta prova.
     *
     * ⛔ Eu esperava `reavaliado` ⛔ só por a glicemia ter normalizado. ⚠️ O
     * código é **mais rigoroso**, ⛔ e está certo: corrigir a glicemia ⛔ não
     * responde se o **déficit** mudou. ⛔ O comentário da função já dizia —
     * *"um exame anterior ⛔ não responde: ⛔ ele descreve o paciente de antes,
     * que é justamente o que o mimetizador pode ter alterado"*.
     *
     * ⚠️ ⛔ São **dois** estados, ⛔ e a distinção é clínica.
     */
    const corrigida = com(so48, 110);
    conf(
      "⚠️⚠️ CASO C.2 · corrigida ⛔ SEM exame depois = **corrigida_sem_exame**",
      D.estadoDaReavaliacao(corrigida) === "corrigida_sem_exame",
      `⛔ "${D.estadoDaReavaliacao(corrigida)}" — normalizar a glicemia ⛔ não responde se o déficit mudou`
    );

    const reavaliada = E.registrarFato(
      corrigida,
      { campo: "nihss_informado", valor: 4 },
      R.relogioControlado(1_000_100)
    );
    conf(
      "⚠️⚠️ CASO C.3 · exame neurológico DEPOIS da correção = **reavaliado**",
      D.estadoDaReavaliacao(reavaliada) === "reavaliado",
      `⛔ "${D.estadoDaReavaliacao(reavaliada)}" — é a ORDEM dos fatos que fecha esta leitura`
    );

    conf(
      "⚠️ CASO C.4 · ⛔ e o bloqueio corrigível some com a nova medida",
      DD.bloqueiosCorrigiveis(corrigida).every((b) => b.id !== "glicemia_alterada"),
      `⛔ ${DD.bloqueiosCorrigiveis(corrigida).map((b) => b.id).join(" · ")}`
    );

    /**
     * ── ⚠️⚠️ ⛔ O PACIENTE QUE **PIOROU** ────────────────────────────────────
     *
     * ⛔ Este caso existe porque a mutação que ordenava a série **por valor**
     * ⛔ em vez de por tempo **⛔ passou verde** nos anteriores: ⛔ eles iam de
     * 48 para 110, ⛔ e ⛔ as duas ordens coincidem. ⚠️ A prova media uma
     * coincidência aritmética, ⛔ e ⛔ não a regra.
     *
     * ⚠️ Aqui a glicemia vai de **110 para 48** — ⛔ o paciente piorou. ⛔ Por
     * tempo, a última é 48: **alterada agora**. ⛔ Por valor, a última seria
     * 110: *"corrigida"* — ⛔ e o app diria que está resolvido num paciente em
     * hipoglicemia.
     */
    {
      const piorou = com(com(vazio, 110), 48);
      conf(
        "⚠️⚠️ CASO C.5 · normal ⛔ e depois HIPO = **alterada agora**",
        D.estadoDaReavaliacao(piorou) === "alterada_agora",
        `⛔ "${D.estadoDaReavaliacao(piorou)}" — ordenar a série por VALOR diria "corrigida" num paciente que piorou`
      );
      conf(
        "⚠️ ⛔ e o bloqueio corrigível **volta** a existir",
        DD.bloqueiosCorrigiveis(piorou).some((b) => b.id === "glicemia_alterada"),
        `⛔ ${DD.bloqueiosCorrigiveis(piorou).map((b) => b.id).join(" · ") || "⛔ nenhum"}`
      );
    }

    conf(
      "⚠️ ⛔ e o atendimento vazio ⛔ NÃO afirma 'sem alteração'",
      D.estadoDaReavaliacao(vazio) === "sem_glicemia",
      `⛔ "${D.estadoDaReavaliacao(vazio)}" — ⛔ sem glicemia ⛔ nenhuma, ⛔ não se nega ⛔ nada`
    );
  }

  /* ⚠️ ⛔ E a ordem dos fatos é a ordem em que foram registrados. */
  {
    const e = com(com(com(vazio, 48), 110), 300);
    const serie = e.fatos.filter((f) => f.campo === "glicemia").map((f) => f.valor);
    conf(
      "⚠️⚠️ a SÉRIE preserva a ordem de registro, ⛔ e ⛔ não reordena",
      JSON.stringify(serie) === JSON.stringify([48, 110, 300]),
      `⛔ ${JSON.stringify(serie)} — trilha é append-only (§3.1)`
    );
  }
}

/* ══ ⚠️⚠️ A PAM É DERIVADA — ⛔ E ⛔ NUNCA UM DADO ═══════════════════════ */
{
  /**
   * ⚠️ Testes discriminatórios do **item 16** do autor:
   * ⛔ PAS ⛔ sem PAD → indefinida · PAD ⛔ sem PAS → indefinida · as duas →
   * calculada.
   *
   * ⚠️⚠️ ⛔ E ⛔ ELA VEM DA **MESMA AFERIÇÃO**: ⛔ metades de medidas diferentes
   * dariam a PAM de uma pressão que ⛔ nunca existiu (**D-120**).
   */
  const relogio = R.relogioControlado(1_000_000);
  const I = nucleo("instancia.js");
  const vazio = E.abrirAtendimento(relogio);

  conf(
    "⚠️ ⛔ sem PA ⛔ nenhuma, a PAM é **indefinida**",
    D.pressaoArterialMedia(vazio) === undefined,
    `⛔ ${JSON.stringify(D.pressaoArterialMedia(vazio))} — ⛔ ausência ⛔ não vira zero`
  );

  const inst = I.instanciaParaRegistrar(vazio, "pa");
  const soPas = E.registrarFato(vazio, { campo: "pas", valor: 120, instancia: inst }, relogio);
  conf(
    "⚠️⚠️ PAS ⛔ SEM PAD → PAM **indefinida**",
    D.pressaoArterialMedia(soPas) === undefined,
    `⛔ ${JSON.stringify(D.pressaoArterialMedia(soPas))} — ⛔ meia pressão ⛔ não é pressão`
  );

  const soPad = E.registrarFato(vazio, { campo: "pad", valor: 80, instancia: inst }, relogio);
  conf(
    "⚠️⚠️ PAD ⛔ SEM PAS → PAM **indefinida**",
    D.pressaoArterialMedia(soPad) === undefined,
    `⛔ ${JSON.stringify(D.pressaoArterialMedia(soPad))}`
  );

  const completa = E.registrarFato(soPas, { campo: "pad", valor: 80, instancia: inst }, relogio);
  conf(
    "⚠️ com as duas metades, a PAM é calculada — 120/80 → 93",
    D.pressaoArterialMedia(completa) === 93,
    `⛔ ${JSON.stringify(D.pressaoArterialMedia(completa))} — diastólica + um terço da diferença`
  );

  /**
   * ⚠️⚠️ ⛔ E ⛔ ELA ⛔ NÃO É FATO: ⛔ persistir a PAM criaria um **segundo
   * produtor** para algo que já se sabe de PAS ⛔ e PAD, ⛔ e os dois poderiam
   * divergir.
   */
  conf(
    "⚠️⚠️ a PAM ⛔ NÃO existe como fato na trilha",
    completa.fatos.every((f) => f.campo !== "pam" && f.campo !== "pressao_media"),
    `⛔ ${completa.fatos.map((f) => f.campo).join(" · ")} — derivação ⛔ não se guarda`
  );
}

if (falhas > 0) {
  console.log(`\n❌ INDEPENDÊNCIA DA UI — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ INDEPENDÊNCIA DA UI — ${ok}/${ok} conferências · casos A, B, C e D`);
