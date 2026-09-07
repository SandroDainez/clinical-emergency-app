#!/usr/bin/env node
/**
 * TRAVA DOS CONSUMIDORES — ⚠️ **dependência declarada, ⛔ ou ⛔ não existe**.
 *
 * PROMETE:
 *   · que **⛔ nenhum campo de escopo `global`** seja lido por uma derivação do
 *     núcleo ⛔ sem estar declarado em `CONSUMIDORES`;
 *   · que **altura ⛔ não influencie ⛔ nada** no AVC — ⛔ nem derivação, ⛔ nem
 *     problema ativo, ⛔ nem pendência;
 *   · que **valor visual ⛔ não vire fato**: campo intocado devolve `undefined`,
 *     ⛔ e ⛔ o cálculo por peso ⛔ não consome fantasma.
 *
 * NÃO PROMETE: que a leitura seja clinicamente correta — ⛔ isso é das provas
 *   de superfície. ⛔ Aqui se mede **quem lê o quê**, ⛔ e ⛔ não como.
 *
 * UNIVERSO: `avc/conteudo/consumidores.ts` × `avc/nucleo/*.ts`.
 *
 * ── ⚠️⚠️ A REGRA, ⛔ E ⛔ POR QUE ⛔ NÃO É *"global ⛔ não se lê"* ────────────
 *
 * ⛔ Minha primeira proposta era travar *"⛔ nenhuma derivação do AVC lê campo
 * global"*. ⚠️ O autor apontou o furo em 2026-09-07: ⛔ isso proibiria **o peso
 * de alimentar a dose do trombolítico**, ⛔ que é ⛔ exatamente para o que ⛔ ele
 * existe.
 *
 * ⚠️ A regra dele: *"um campo só pode influenciar uma derivação clínica se essa
 * dependência estiver explicitamente declarada ⛔ e testada"*. ⛔ Escopo diz **de
 * quem é o dado**; ⛔ a lista diz **quem pode lê-lo**.
 */
const path = require("node:path");
const os = require("node:os");
const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "consumidores-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--rootDir", appDir, "--outDir", tmp,
    path.join(appDir, "avc", "conteudo", "campos.ts"),
    path.join(appDir, "avc", "conteudo", "consumidores.ts"),
    path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"),
    path.join(appDir, "avc", "nucleo", "ameacas-imediatas.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);

const K = require(path.join(tmp, "avc", "conteudo", "campos.js"));
const CONS = require(path.join(tmp, "avc", "conteudo", "consumidores.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const F = require(path.join(tmp, "avc", "nucleo", "derivacoes-f.js"));

/** ⚠️ Procura o compilado ⛔ onde quer que o `rootDir` o tenha posto. */
function achar(nome) {
  const pilha = [tmp];
  while (pilha.length > 0) {
    const dir = pilha.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const alvo = path.join(dir, e.name);
      if (e.isDirectory()) pilha.push(alvo);
      else if (e.name === nome) return alvo;
    }
  }
  throw new Error(`⛔ compilado ⛔ não encontrado: ${nome}`);
}

let ok = 0;
let falhas = 0;
function conf(nome, cond, porque) {
  if (cond) { ok++; return; }
  falhas++;
  console.log(`\n  ${falhas}. ${nome}\n      ${porque}`);
}

const campos = K.todosOsCampos();
const globais = campos.filter((c) => c.escopo === "global");

/* ══ ⚠️ O UNIVERSO EXISTE ══════════════════════════════════════════════ */
conf(
  "⚠️ há campos de escopo global a conferir",
  globais.length >= 4,
  `⛔ ${globais.length} campo(s) global(is) — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
);

conf(
  "⚠️ todo campo global tem consumidores DECLARADOS (ainda que ⛔ nenhum)",
  globais.every((c) => Array.isArray(CONS.CONSUMIDORES[c.id])),
  `⛔ ${globais.filter((c) => !Array.isArray(CONS.CONSUMIDORES[c.id])).map((c) => c.id).join(" · ")} — ⛔ lista ausente ⛔ não é "⛔ nenhum": é decisão ⛔ não tomada`
);

/* ══ ⚠️⚠️ QUEM LÊ, LEU PORQUE FOI DECLARADO ═══════════════════════════ */
{
  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const arquivos = fs.readdirSync(dirNucleo).filter((f) => f.endsWith(".ts"));

  const violacoes = [];
  for (const c of globais) {
    const permitidos = CONS.CONSUMIDORES[c.id] ?? [];
    for (const arq of arquivos) {
      /**
       * ⚠️ **⛔ SEM COMENTÁRIO** — ⛔ e ⛔ isso ⛔ não é detalhe: metade dos
       * arquivos deste núcleo cita o nome de um campo em prosa explicando por
       * que ⛔ **não** o lê. ⛔ Contar comentário como leitura reprovaria
       * ⛔ exatamente quem documentou a decisão certa.
       */
      const fonte = lerFonte(path.join(dirNucleo, arq));
      /** ⚠️ A leitura de um fato é sempre por `"<id>"` entre aspas. */
      if (!fonte.includes(`"${c.id}"`)) continue;
      if (permitidos.includes(arq)) continue;
      violacoes.push(`${c.id} lido em ${arq}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM campo global é lido fora do que foi DECLARADO",
    violacoes.length === 0,
    `⛔ ${violacoes.join(" · ")} — declare o consumidor **antes** do código que lê`
  );
}

/* ══ ⚠️⚠️ CAMPO ⛔ SEM FONTE ⛔ NÃO ALIMENTA DERIVAÇÃO ⛔ NENHUMA ═════════ */
{
  /**
   * ── ⚠️⚠️ **E-30 AO PÉ DA LETRA**, ⛔ e ⛔ a regra veio de um conflito real ──
   *
   * ⛔ Havia uma trava dizendo *"⛔ o AVC ⛔ não usa Glasgow — a fonte ⛔ não o
   * menciona uma única vez"*. ⚠️ Em 2026-09-07 o autor pediu Glasgow, FC, FR ⛔ e
   * temperatura na estabilização (**item 14**), ⛔ com a condição: *"⛔ sem
   * consumidor inventado"*.
   *
   * ⚠️⚠️ ⛔ AS DUAS COISAS CONVIVEM, ⛔ e ⛔ esta conferência é o ponto exato onde:
   * ⛔ **registrar** um sinal vital ⛔ não é **derivar conduta** dele. ⛔ O que a
   * trava antiga protegia — ⛔ que ⛔ nenhuma recomendação nasça de um número
   * ⛔ sem fonte transcrita — ⛔ continua inteiro, ⛔ e agora vale para **todos**
   * os campos ⛔ sem slot, ⛔ e ⛔ não ⛔ só para Glasgow.
   *
   * ⚠️ ⛔ No dia em que uma fonte der corte para FC ⛔ ou temperatura, ⛔ o campo
   * ganha `fonte: "F-nn"` ⛔ e o consumidor entra em `CONSUMIDORES` — ⛔ nessa
   * ordem.
   */
  const semFonte = campos.filter(
    (c) => !/^F-\d+$/.test(String(c.fonte)) && c.natureza === "administrativo"
  );
  conf(
    "⚠️ há campos ⛔ sem slot de fonte a vigiar",
    semFonte.length >= 4,
    `⛔ ${semFonte.length} — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
  );

  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const arquivos = fs.readdirSync(dirNucleo).filter((f) => f.endsWith(".ts"));
  /**
   * ⚠️⚠️ ⛔ **DECLARADA**, ⛔ e ⛔ não proibida — ⛔ e a distinção veio de a trava
   * ter pego o meu próprio código.
   *
   * ⛔ A primeira versão proibia **⛔ qualquer** leitura de campo ⛔ sem fonte.
   * ⚠️ ⛔ Mas o eixo **E** precisa ler `temperatura` para **exibir** o valor —
   * ⛔ e exibir ⛔ não é julgar. ⛔ A regra do autor ⛔ nunca foi *"⛔ não pode
   * ler"*: é *"⛔ só influencia se estiver **declarado ⛔ e testado**"*.
   *
   * ⚠️ ⛔ E o que impede isso de virar escape: ⛔ a conferência abaixo, que
   * exige que **⛔ nenhum campo ⛔ sem fonte produza estado de ameaça**.
   */
  const naoDeclarados = [];
  for (const c of semFonte) {
    const permitidos = CONS.CONSUMIDORES[c.id] ?? [];
    for (const arq of arquivos) {
      const fonte = lerFonte(path.join(dirNucleo, arq));
      if (!fonte.includes(`"${c.id}"`)) continue;
      if (permitidos.includes(arq)) continue;
      naoDeclarados.push(`${c.id} lido em ${arq}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM campo ⛔ SEM slot de fonte é lido ⛔ sem DECLARAÇÃO (**E-30**)",
    naoDeclarados.length === 0,
    `⛔ ${naoDeclarados.join(" · ")} — declare o consumidor **antes** do código que lê`
  );

  conf(
    "⚠️ ⛔ e todo campo ⛔ sem fonte declara os seus consumidores (ainda que ⛔ nenhum)",
    semFonte.every((c) => Array.isArray(CONS.CONSUMIDORES[c.id])),
    `⛔ ${semFonte.filter((c) => !Array.isArray(CONS.CONSUMIDORES[c.id])).map((c) => c.id).join(" · ")}`
  );

  /**
   * ── ⚠️⚠️ ⛔ E ⛔ NENHUM DELES ACENDE ─────────────────────────────────────
   *
   * ⛔ Esta é a conferência que impede *"declarar"* de virar permissão para
   * derivar conduta. ⚠️ Um campo ⛔ sem corte transcrito pode ser **exibido**;
   * ⛔ ele ⛔ **não** pode produzir ameaça — ⛔ isso seria limiar inventado
   * (**E-31**).
   */
  {
    const AM = require(achar("ameacas-imediatas.js"));
    const relogio = R.relogioControlado(1_000_000);
    let e = E.abrirAtendimento(relogio);
    /** ⚠️ Valores que num módulo COM fonte acenderiam — ⛔ aqui ⛔ não podem. */
    e = E.registrarFato(e, { campo: "temperatura", valor: 39 }, relogio);
    e = E.registrarFato(e, { campo: "fc", valor: 180 }, relogio);
    e = E.registrarFato(e, { campo: "fr", valor: 38 }, relogio);
    e = E.registrarFato(e, { campo: "glasgow", valor: 6 }, relogio);
    const acesos = AM.ameacasImediatas(e).filter((x) => x.estado === "ameaca");
    conf(
      "⚠️⚠️ ⛔ NENHUM campo ⛔ sem fonte produz **ameaça**, ⛔ nem no extremo",
      acesos.length === 0,
      `⛔ ${acesos.map((x) => `${x.letra}=${x.achado}`).join(" · ")} — temperatura 39, FC 180, FR 38 e Glasgow 6 ⛔ sem fonte ⛔ não podem acender`
    );
  }
}

/* ══ ⚠️⚠️ DECLARAR EM `CONSUMIDORES` É O QUE **ARMA** A TRAVA ════════════ */
{
  /**
   * ── ⚠️⚠️ O BURACO QUE ISTO FECHA (autor, 2026-09-07) ─────────────────────
   *
   * ⛔ As duas varreduras acima cobrem **campo global** ⛔ e **campo ⛔ sem slot
   * de fonte**. ⚠️ Os `t4_*` ⛔ não são ⛔ nem um ⛔ nem outro: ⛔ eles são de
   * módulo ⛔ e têm **F-17**. ⛔ Uma derivação nova podia passar a lê-los ⛔ sem
   * que ⛔ nada reclamasse — ⛔ e foi ⛔ exatamente isso que a mutação M3 mostrou,
   * ⛔ passando verde.
   *
   * ⚠️ A regra do autor: *"⛔ possuir fonte clínica ⛔ não significa possuir
   * autorização automática para alimentar ⛔ qualquer derivação. Fonte +
   * consumidor declarado + prova são requisitos distintos."*
   *
   * ⚠️⚠️ ⛔ ENTÃO A TRAVA ⛔ NÃO É MAIS SOBRE ESCOPO ⛔ NEM SOBRE FONTE: **estar
   * declarado aqui** é o que sujeita o campo à varredura, ⛔ seja ⛔ ele qual for.
   */
  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const arquivos = fs.readdirSync(dirNucleo).filter((f) => f.endsWith(".ts"));

  const declarados = Object.keys(CONS.CONSUMIDORES);
  conf(
    "⚠️ há campos DECLARADOS a vigiar",
    declarados.length >= 12,
    `⛔ ${declarados.length} — trava sobre lista vazia fica verde ⛔ sem medir ⛔ nada`
  );

  const foraDaDeclaracao = [];
  for (const id of declarados) {
    const permitidos = CONS.CONSUMIDORES[id];
    for (const arq of arquivos) {
      const fonte = lerFonte(path.join(dirNucleo, arq));
      if (!fonte.includes(`"${id}"`)) continue;
      if (permitidos.includes(arq)) continue;
      foraDaDeclaracao.push(`${id} lido em ${arq}`);
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM campo DECLARADO é lido fora do que a declaração permite",
    foraDaDeclaracao.length === 0,
    `⛔ ${foraDaDeclaracao.join(" · ")} — ter fonte ⛔ não é ter autorização`
  );

  /* ── ⚠️⚠️ OS ONZE ACHADOS DA TABLE 4, ⛔ E A ROTA INDIRETA ────────────── */
  /**
   * ⚠️⚠️ ⛔ POR CAMINHO EXPLÍCITO, ⛔ E ⛔ NÃO POR `achar()` — ⛔ e a conferência
   * de vacuidade logo abaixo é quem apontou: há **dois** `nihss.js` na árvore
   * compilada (`lib/` ⛔ e `avc/conteudo/`), ⛔ e a busca em profundidade
   * devolvia o de `lib/`, ⛔ que ⛔ não exporta `ACHADOS_DERIVAVEIS`.
   *
   * ⛔ ⛔ Nome de arquivo ⛔ não é identidade. ⚠️ Sem a conferência *"cada portador
   * carrega mesmo ids `t4_*`"*, a varredura teria rodado sobre um portador
   * vazio ⛔ e passado verde.
   */
  const conteudo = (nome) => require(path.join(tmp, "avc", "conteudo", nome));
  const B = conteudo("superficie-b.js");
  const N = conteudo("nihss.js");
  const T4 = [...B.IDS_ACHADOS_TIPICOS, ...B.IDS_ACHADOS_PODEM_NAO];

  conf(
    "⚠️ os onze achados da Table 4 estão no universo",
    T4.length === 11 && T4.every((id) => String(id).startsWith("t4_")),
    `⛔ ${T4.length} id(s) — ⛔ se a varredura perder os campos, ⛔ ela fica verde ⛔ sem medir`
  );
  conf(
    "⚠️⚠️ ⛔ todo `t4_*` DECLARA os seus consumidores (**item 1**, autor)",
    T4.every((id) => Array.isArray(CONS.CONSUMIDORES[id])),
    `⛔ ${T4.filter((id) => !Array.isArray(CONS.CONSUMIDORES[id])).join(" · ")} — declaração ausente ⛔ não é "⛔ nenhum": é decisão ⛔ não tomada`
  );

  /**
   * ── ⚠️⚠️ ⛔ E A VARREDURA POR LITERAL ⛔ NÃO ENXERGA O CONSUMIDOR REAL ─────
   *
   * ⛔ `derivacoes-b.ts` **⛔ não escreve `"t4_afasia_grave"` uma única vez**:
   * ⛔ ele importa `IDS_ACHADOS_TIPICOS` ⛔ e espalha o array. ⚠️ Um `grep` por
   * aspas diria que ⛔ ele ⛔ não lê ⛔ nada — ⛔ e a trava passaria verde sobre o
   * único arquivo que de fato lê.
   *
   * ⚠️⚠️ ⛔ E é ⛔ por essa porta que a mutação entraria: importar o array
   * ⛔ noutro arquivo do núcleo é ⛔ *ler os onze* ⛔ sem escrever ⛔ nenhum id.
   * ⚠️ Então **os portadores contam como leitura**.
   */
  const D = conteudo("superficie-d.js");
  /**
   * ── ⚠️⚠️ ⛔ O MESMO BURACO, ⛔ ACHADO DE NOVO — 2026-09-07, Fase 5 ─────────
   *
   * ⛔ `CORTES_LABORATORIAIS` é portador de **quatro** ids —
   * `plaquetas · inr · aptt · tp` —, ⛔ e `derivacoes-d.ts` os lê por
   * `Object.keys(...)`, ⛔ sem escrever ⛔ nenhum literal.
   *
   * ⚠️⚠️ ⛔ EU MAPEEI *"aPTT ⛔ e TP ⛔ não têm consumidor"* ⛔ e ⛔ estava errado:
   * ⛔ a varredura por literal ⛔ não os via. ⛔ O autor decidiu declará-los `[]`
   * ⛔ **sobre o meu mapa errado** — ⛔ e a fonte os nomeia na mesma frase que
   * INR ⛔ e plaquetas (**F-10**).
   *
   * ⛔ ⛔ A correção ⛔ não é lembrar de olhar: ⛔ é o portador entrar aqui.
   */
  const PORTADORES = [
    ["IDS_ACHADOS_TIPICOS", B],
    ["IDS_ACHADOS_PODEM_NAO", B],
    ["ACHADOS_TIPICOS_B", B],
    ["ACHADOS_PODEM_NAO_B", B],
    ["ACHADOS_DERIVAVEIS", N],
  ];
  const PORTADORES_DE_ANALITO = [["CORTES_LABORATORIAIS", D]];
  const carrega = (v) =>
    Array.isArray(v)
    && v.some((x) => String(typeof x === "string" ? x : (x && (x.campo ?? x.id))).startsWith("t4_"));
  conf(
    "⚠️⚠️ ⛔ cada PORTADOR existe ⛔ e carrega mesmo ids `t4_*`",
    PORTADORES.every(([nome, mod]) => carrega(mod[nome])),
    `⛔ ${PORTADORES.filter(([n, m]) => !carrega(m[n])).map(([n]) => n).join(" · ")} — nome renomeado esvazia a varredura ⛔ sem ⛔ ninguém notar`
  );

  const ANALITOS = Object.keys(D.CORTES_LABORATORIAIS);
  conf(
    "⚠️⚠️ ⛔ o portador dos ANALITOS carrega os quatro cortes de **F-10**",
    ANALITOS.length === 4
    && ["plaquetas", "inr", "aptt", "tp"].every((k) => ANALITOS.includes(k))
    && ANALITOS.every((k) => Array.isArray(CONS.CONSUMIDORES[k])),
    `⛔ ${ANALITOS.join(" · ")} — ⛔ a fonte nomeia os quatro na MESMA frase`
  );

  /**
   * ⚠️ ⛔ Cada grupo de portadores varre o **seu** universo de ids: um arquivo
   * que importa `CORTES_LABORATORIAIS` lê os quatro analitos, ⛔ e ⛔ não os
   * onze achados.
   */
  const GRUPOS = [
    { nomes: PORTADORES.map(([n]) => n), ids: T4, rotulo: "`t4_*`" },
    { nomes: PORTADORES_DE_ANALITO.map(([n]) => n), ids: ANALITOS, rotulo: "analito de F-10" },
  ];
  const porRota = [];
  for (const g of GRUPOS) {
    for (const arq of arquivos) {
      const fonte = lerFonte(path.join(dirNucleo, arq));
      const portador = g.nomes.find((n) => fonte.includes(n));
      if (portador === undefined) continue;
      const barrados = g.ids.filter((id) => !(CONS.CONSUMIDORES[id] ?? []).includes(arq));
      if (barrados.length > 0) {
        porRota.push(`${arq} lê ${barrados.length} ${g.rotulo} via ${portador}`);
      }
    }
  }
  conf(
    "⚠️⚠️ ⛔ NENHUM arquivo lê pela rota INDIRETA ⛔ sem declaração",
    porRota.length === 0,
    `⛔ ${porRota.join(" · ")} — **fonte + consumidor declarado + prova** são requisitos distintos`
  );
}

/* ══ ⚠️⚠️ ALTURA ⛔ NÃO INFLUENCIA ⛔ NADA ═════════════════════════════ */
{
  const dirNucleo = path.join(appDir, "avc", "nucleo");
  const citam = fs.readdirSync(dirNucleo)
    .filter((f) => f.endsWith(".ts"))
    .filter((f) => lerFonte(path.join(dirNucleo, f)).includes('"altura"'));
  conf(
    "⚠️⚠️ ⛔ NENHUMA derivação do AVC lê `altura`",
    CONS.CONSUMIDORES.altura.length === 0 && citam.length === 0,
    `⛔ ${citam.join(" · ")} — *"⛔ não altera ⛔ nenhuma derivação atual do AVC"* (autor, 2026-09-07)`
  );

  const campoAltura = campos.find((c) => c.id === "altura");
  conf(
    "⚠️ altura existe, é global, ⛔ e ⛔ não bloqueia terapia",
    campoAltura !== undefined
      && campoAltura.escopo === "global"
      && campoAltura.bloqueiaTerapia === false,
    `⛔ ${JSON.stringify(campoAltura && { escopo: campoAltura.escopo, bloqueia: campoAltura.bloqueiaTerapia })}`
  );
}

/* ══ ⚠️⚠️ O VALOR FANTASMA ⛔ NÃO É FATO ══════════════════════════════ */
{
  /**
   * ── ⚠️⚠️ ⛔ O QUE ISTO IMPEDE ────────────────────────────────────────────
   *
   * ⛔ A barra ⛔ e o `NumericStepper` precisam de **um número para desenhar** o
   * polegar. ⚠️ Esse número ⛔ **⛔ não é uma medida** — ⛔ e se ⛔ ele virasse
   * fato, a dose do trombolítico sairia calculada sobre um peso que ⛔ ninguém
   * mediu (§0.2).
   *
   * ⚠️ ⛔ A garantia mora em `numero()`: ⛔ sem **fato** na trilha, ⛔ não há
   * valor. ⛔ A tela ⛔ não tem como contornar isso — ⛔ ela ⛔ não escreve
   * estado, ⛔ ela chama `registrarFato`.
   */
  const relogio = R.relogioControlado(1_000_000);
  const vazio = E.abrirAtendimento(relogio);

  for (const campo of ["peso", "altura"]) {
    conf(
      `⚠️⚠️ \`${campo}\` intocado devolve **undefined**, ⛔ e ⛔ não o piso da faixa`,
      E.valorAtual(vazio, campo) === undefined,
      `⛔ devolveu ${JSON.stringify(E.valorAtual(vazio, campo))} — valor visual ⛔ não cria fato`
    );
  }

  /**
   * ⚠️⚠️ ⛔ A PRIMEIRA VERSÃO DESTA CONFERÊNCIA PASSAVA POR **VACUIDADE**.
   *
   * ⛔ Ela chamava `F.insumoDoCalculo`, que **⛔ não existe** — ⛔ e a guarda
   * `=== undefined ||` deixava a expressão verdadeira ⛔ sem medir ⛔ nada.
   * ⚠️ A função real é `valorDoInsumo`, ⛔ e ⛔ ela devolve `"satisfaz"` ⛔ só
   * quando há **fato** com número positivo.
   */
  conf(
    "⚠️ a prova aponta para a função que EXISTE",
    typeof F.valorDoInsumo === "function",
    "⛔ asserção sobre função inexistente é verde ⛔ sem medida — R-1"
  );
  conf(
    "⚠️⚠️ o cálculo do trombolítico ⛔ NÃO consome peso fantasma",
    F.valorDoInsumo(vazio, "peso") === undefined,
    `⛔ devolveu ${JSON.stringify(F.valorDoInsumo(vazio, "peso"))} — dose por quilo sobre peso ⛔ não medido é a semente de uma dose errada três telas adiante`
  );

  /** ⚠️ ⛔ E o gesto **explícito** cria o fato — ⛔ senão a trava seria vacuidade. */
  const comPeso = E.registrarFato(vazio, { campo: "peso", valor: 82 }, relogio);
  conf(
    "⚠️ ⛔ e a interação CRIA o fato — a trava ⛔ não cega o caminho legítimo",
    E.valorAtual(comPeso, "peso")?.valor === 82
    && F.valorDoInsumo(comPeso, "peso") === "satisfaz",
    `⛔ ${JSON.stringify(E.valorAtual(comPeso, "peso"))} · insumo=${JSON.stringify(F.valorDoInsumo(comPeso, "peso"))}`
  );
}

if (falhas > 0) {
  console.log(`\n❌ CONSUMIDORES — ${falhas} falha(s), ${ok} ok\n`);
  process.exit(1);
}
console.log(`✅ CONSUMIDORES — ${ok}/${ok} conferências · ${globais.length} campo(s) global(is)`);
