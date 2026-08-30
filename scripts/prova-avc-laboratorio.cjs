/**
 * PROMETE: que o painel **Laboratório** ⛔ nunca escolha o "valor atual" de um
 *   analito por *"último digitado"* — que a ordem venha de **regra temporal
 *   explícita**, que `sem_ordem` seja estado terminal legítimo quando o horário
 *   é genuinamente desconhecido, e que ⛔ **nenhuma** coleta seja chamada de mais
 *   recente sem horário conhecido; que **⛔ nenhum resultado exista órfão de
 *   instância**; que a **unidade das plaquetas** seja lida da **mesma coleta** do
 *   valor, e que **sem unidade declarada ⛔ não haja conversão**; que **plaqueta 0**
 *   seja registrável; que a pendência do horário nasça ⛔ **só** quando a ordem
 *   passa a ser necessária; e que **nova coleta ⛔ não seja correção**.
 * NÃO PROMETE: que os cortes clínicos estejam certos — eles ⛔ não moram aqui:
 *   são interpretação da Superfície D. ⛔ Também não mede tela: isso é
 *   `e2e/avc-superficie-laboratorio`. E ⛔ não confere tradução — é
 *   `test:i18n-opcoes`.
 * UNIVERSO: `avc/conteudo/laboratorio.ts` inteiro (todos os campos de
 *   `TODOS_OS_CAMPOS_L`, contados, com piso) e todas as derivações de
 *   `avc/nucleo/derivacoes-lab.ts`, exercitadas por estado construído.
 *   ⛔ Fora do universo: as superfícies A a G.
 *
 * ── ⚠️⚠️ OS TRÊS CASOS-SENTINELA ─────────────────────────────────────────
 *
 * **1 · A ordem** — montado pelo autor: `INR 1,4` numa coleta **externa sem
 * horário**, e `INR 1,1` numa coleta **local às 22h**. Ele existe para impedir
 * que *"último digitado"* volte escondido no sistema.
 *
 * **2 · A unidade** — `plaquetas 80` **sem unidade declarada** ⛔ não pode ser
 * comparada com `100.000`. Converter é transformar; **supor unidade é inventar**.
 *
 * **3 · A correção da unidade** — `plaquetas 80` em `mil/mm³`, e depois o médico
 * percebe que o laudo era `/mm³`. A comparação passa de `80.000` para `80` na
 * **mesma** coleta, a trilha preserva **marcada** a unidade anterior, e as
 * outras coletas ⛔ não são reinterpretadas. ⚠️ É onde *"atributo da medida"*
 * vira bug histórico se ⛔ não estiver amarrado.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-lab-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "instancia.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-lab.ts"),
  path.join(appDir, "avc", "conteudo", "laboratorio.ts"),
  path.join(appDir, "avc", "conteudo", "campos.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const I = require(path.join(tmp, "avc", "nucleo", "instancia.js"));
const D = require(path.join(tmp, "avc", "nucleo", "derivacoes-lab.js"));
const L = require(path.join(tmp, "avc", "conteudo", "laboratorio.js"));
const CAMPOS = require(path.join(tmp, "avc", "conteudo", "campos.js"));

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
/** ⚠️ Registra numa coleta EXPLÍCITA — o mesmo caminho que a tela usa. */
const reg = (e, coleta, campo, valor) =>
  CAMPOS.registrarComInstancia(e, { campo, valor }, rel, coleta);
const c1 = I.nomeDaInstancia(L.COLETA, 1);
const c2 = I.nomeDaInstancia(L.COLETA, 2);

// ── 0 · O UNIVERSO ────────────────────────────────────────────────────────
{
  confere("o universo de campos do Laboratório foi carregado",
    L.TODOS_OS_CAMPOS_L.length >= 7,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  confere("os quatro analitos que a fonte nomeia estão declarados",
    JSON.stringify([...L.IDS_ANALITOS].sort()) === JSON.stringify(["aptt", "inr", "plaquetas", "tp"]),
    "F-10 §3 nomeia plaquetas, INR, aPTT e PT — ⛔ nenhum a mais entra sem fonte (E-19)");
  confere("⛔ NENHUM campo de creatinina ou função renal",
    !/creatinin|função renal|clearance|ureia/i.test(
      L.TODOS_OS_CAMPOS_L.map((c) => `${c.id} ${c.rotulo} ${c.ajuda ?? ""}`).join(" ")),
    "🚫 #5: a maneira de ⛔ NÃO exigir creatinina ⛔ não é escrever a frase — é ⛔ não existir o campo");
  confere("⛔ nenhum campo do Laboratório bloqueia terapia",
    L.TODOS_OS_CAMPOS_L.every((c) => c.bloqueiaTerapia === false),
    "E-49: os cortes são interpretação de D, e ⛔ nenhum campo daqui trava coisa alguma");
}

// ── 1 · ⛔ NENHUM RESULTADO ÓRFÃO DE INSTÂNCIA ────────────────────────────
{
  confere("todo campo do Laboratório declara pertencer à coleta",
    L.TODOS_OS_CAMPOS_L.every((c) => c.instanciaDe === L.COLETA),
    "resultado sem instância ⛔ não sabe de que coleta veio, e a ordem entre coletas deixa de existir");

  const e = reg(vazio, c1, "inr", 1.4);
  confere("o resultado registrado carrega a instância",
    I.valorNaInstancia(e, c1, "inr").instancia === c1,
    "sem a etiqueta, dois INRs viram dois números soltos");
  confere("e ⛔ não vaza para outra coleta",
    I.valorNaInstancia(e, c2, "inr") === undefined,
    "o valor de uma coleta ⛔ não pode aparecer noutra");
}

// ── 2 · A ENTRADA NUMÉRICA, E O LIMITE TÉCNICO ───────────────────────────
{
  const numericos = L.TODOS_OS_CAMPOS_L.filter((c) => c.tipo === "numerico");
  confere("os analitos usam entrada NUMÉRICA, e ⛔ não barra",
    numericos.length === 4,
    "§0.3 aprovado em 2026-08-30: barra sugere contínuo e faixa normal, e a fonte dá LIMIAR, ⛔ não faixa");

  /**
   * ⚠️⚠️ A FAIXA É **TÉCNICA**, e a conferência mede isso pelo tamanho: uma faixa
   * apertada em torno do "plausível" é limite clínico disfarçado, e deixaria um
   * resultado verdadeiro **irregistrável**.
   */
  confere("⛔ nenhuma faixa é apertada em torno do corte da fonte",
    L.TODOS_OS_CAMPOS_L.find((c) => c.id === "inr").faixa.max >= 20
    && L.TODOS_OS_CAMPOS_L.find((c) => c.id === "plaquetas").faixa.max >= 1_000_000
    && L.TODOS_OS_CAMPOS_L.find((c) => c.id === "aptt").faixa.max >= 200,
    "o corte pode ser INR > 1,7; isso ⛔ não significa que o INR máximo registrável seja 8");

  confere("⛔ nenhum corte da fonte foi escrito no conteúdo do Laboratório",
    !/1[.,]7|100\.?000|>\s*40|>\s*15/.test(
      lerFonte(path.join(appDir, "avc", "conteudo", "laboratorio.ts"))),
    "os limiares são interpretação de segurança, e escrevê-los aqui os duplicaria fora da casa deles");

  confere("o TP diz **segundos** no próprio rótulo",
    /segundos/i.test(L.TODOS_OS_CAMPOS_L.find((c) => c.id === "tp").rotulo),
    "o TP é reportado em segundos, INR ou atividade %; sem a unidade no rótulo, 70% entra como 70 s");
}

// ── 3 · ZERO É NÚMERO, E ⛔ NUNCA SENTINELA ───────────────────────────────
{
  const plaquetas = L.TODOS_OS_CAMPOS_L.find((c) => c.id === "plaquetas");
  confere("plaquetas aceita ZERO como valor",
    plaquetas.zeroValido === true && plaquetas.faixa.min === 0,
    "correção do autor: *\"o laboratório pode reportar contagem zero. Raro ⛔ não significa impossível\"*");

  const comZero = reg(vazio, c1, "plaquetas", 0);
  confere("e o zero registrado é DIFERENTE de ⛔ não informado",
    I.valorNaInstancia(comZero, c1, "plaquetas").valor === 0
    && I.valorNaInstancia(vazio, c1, "plaquetas") === undefined,
    "E-52 pelo componente numérico: ausência ⛔ nunca é representada por número sentinela");

  confere("INR, aPTT e TP ⛔ não oferecem zero — e por impossibilidade da grandeza",
    ["inr", "aptt", "tp"].every((id) => {
      const c = L.TODOS_OS_CAMPOS_L.find((x) => x.id === id);
      return !c.zeroValido && c.faixa.min > 0;
    }),
    "INR é razão e coagulação em 0 s ⛔ não é medida — o critério é impossibilidade, ⛔ não raridade");
}

// ── 4 · SENTINELA 1 · A ORDEM ────────────────────────────────────────────
{
  /**
   * ⚠️⚠️ O CASO DO AUTOR, montado exatamente como ele o escreveu — e a ordem de
   * REGISTRO é deliberadamente **inversa** da clínica: a externa entra primeiro.
   */
  let e = reg(vazio, c1, "coleta_procedencia", "Serviço externo");
  e = reg(e, c1, "coleta_hora", "nao_sei");
  e = reg(e, c1, "inr", 1.4);
  e = reg(e, c2, "coleta_procedencia", "Este serviço");
  e = reg(e, c2, "coleta_hora", 950_000);
  e = reg(e, c2, "inr", 1.1);

  const t = D.estadoTemporalDoAnalito(e, "inr");
  confere("duas coletas com INR e uma sem horário ⇒ **sem_ordem**",
    t.estado === "sem_ordem",
    "⛔ o app ⛔ não elege a local por ser local ⛔ nem a que tem horário por ter horário");
  confere("e as DUAS candidatas aparecem, com os dois valores",
    t.candidatas.length === 2
    && t.candidatas.some((x) => x.valor === 1.4)
    && t.candidatas.some((x) => x.valor === 1.1),
    "⛔ nenhum dos dois é apagado, e ⛔ nenhum é escondido");
  confere("⛔ NENHUMA delas é chamada de vigente",
    t.estado !== "vigente" && t.coleta === undefined,
    "*\"se ⛔ não houver ordem clínica confiável, ⛔ não chamar uma delas de mais recente\"*");
  confere("a leitura diz que ⛔ não há ordem, e ⛔ não escolhe",
    /sem ordem estabelecida/i.test(D.leituraDoAnalito(e, "inr").curto)
    && !/mais recente/i.test(D.leituraDoAnalito(e, "inr").curto),
    "a frase da tela ⛔ não pode sugerir uma escolha que a derivação ⛔ não fez");

  /**
   * ⚠️⚠️ ACHADO NA REVISÃO VISUAL DE 2026-08-30: os Alertas mostravam quatro
   * linhas — `Resultado registrado`, `Resultado ainda ⛔ não informado` ×3 — e
   * ⛔ **nenhuma dizia de qual exame falava**. "Resultado registrado" cabe nos
   * quatro analitos, e quatro frases iguais ⛔ não informam nada.
   */
  confere("cada leitura diz DE QUAL analito ela fala",
    D.leituraDoAnalito(e, "inr").sujeito === "INR"
    && D.leituraDoAnalito(e, "plaquetas").sujeito === "Plaquetas",
    "sem sujeito, a mesma frase serve a quatro exames e ⛔ não identifica ⛔ nenhum");
  confere("e a tela ⛔ não enche os Alertas com exames que ninguém informou",
    D.leiturasDoLaboratorio(e).every((l) => l.id !== "aptt" && l.id !== "tp"),
    "⚠️ ruído sobre exames ⛔ não pedidos ESCONDE a única linha que importa — a de ordem ⛔ não estabelecida");
  confere("⛔ mas o núcleo continua sabendo descrever o ⛔ não informado",
    D.leituraDoAnalito(e, "aptt").curto === "Resultado ainda não informado",
    "omitir da tela ⛔ não é apagar o estado — **E-23**, ausência ⛔ nunca vira negativa");
  confere("e a linha que importa continua na tela, nomeada",
    D.leiturasDoLaboratorio(e).some((l) => l.id === "inr" && l.sujeito === "INR"
      && /sem ordem estabelecida/i.test(l.curto)),
    "o filtro ⛔ não pode levar embora o alerta do caso-sentinela");

  /** ⚠️⚠️ E O 1,4 SOBREVIVEU AO DECIMAL — é o valor do caso-sentinela. */
  confere("o INR 1,4 ficou 1,4 na trilha",
    I.valorNaInstancia(e, c1, "inr").valor === 1.4,
    "1.4000000000000001 seria um número que ninguém digitou, comparado depois com um limiar");

  /** ⚠️ Informado o horário da externa, a ordem passa a EXISTIR — sem apagar nada. */
  const comHora = reg(e, c1, "coleta_hora", 900_000);
  const t2 = D.estadoTemporalDoAnalito(comHora, "inr");
  confere("informado o horário que faltava, a ordem vira **vigente**",
    t2.estado === "vigente" && t2.valor === 1.1,
    "a ordem ⛔ não foi criada: passou a ser sabida");
  confere("e o outro resultado continua legível, ⛔ não apagado",
    t2.outras.length === 1 && t2.outras[0].valor === 1.4,
    "§3.1: a trilha é append-only, e estabelecer ordem ⛔ não é operação sobre os fatos");
  confere("os DOIS fatos continuam inteiros na trilha",
    I.valorNaInstancia(comHora, c1, "inr").valor === 1.4
    && I.valorNaInstancia(comHora, c2, "inr").valor === 1.1,
    "⛔ nenhum resultado verdadeiro se perde ao ordenar");
}

// ── 5 · ⛔ ORDEM DE REGISTRO ⛔ NÃO É ORDEM CLÍNICA ────────────────────────
{
  /**
   * ⚠️⚠️ A CONFERÊNCIA QUE MATA *"ÚLTIMO DIGITADO"*: a coleta digitada **por
   * último** é a **mais antiga** no relógio. Se a derivação usasse ordem de
   * registro, elegeria 2,0 — e ⛔ não 1,1.
   */
  let e = reg(vazio, c1, "coleta_hora", 950_000);
  e = reg(e, c1, "inr", 1.1);
  e = reg(e, c2, "coleta_hora", 900_000);
  e = reg(e, c2, "inr", 2.0);

  const t = D.estadoTemporalDoAnalito(e, "inr");
  confere("a coleta digitada por ÚLTIMO, mas mais antiga, ⛔ não vence",
    t.estado === "vigente" && t.valor === 1.1,
    "*\"o valor atual só pode ser escolhido por regra temporal explícita; ⛔ não usar último digitado\"*");
}

// ── 5b · EMPATE DE HORÁRIO ⛔ NÃO ESTABELECE ORDEM ────────────────────────
{
  /**
   * ⚠️⚠️ DUAS COLETAS NO MESMO INSTANTE — e o caso ⛔ não é hipotético: dois tubos
   * do mesmo momento, digitados como duas coletas.
   *
   * ⚠️ Com horários **iguais**, ⛔ não existe "a mais recente". Escolher qualquer
   * uma seria voltar a *"último digitado"* por outro caminho — e a única
   * diferença entre elas seria a ordem de digitação.
   */
  let e = reg(vazio, c1, "coleta_hora", 900_000);
  e = reg(e, c1, "inr", 1.4);
  e = reg(e, c2, "coleta_hora", 900_000);
  e = reg(e, c2, "inr", 1.1);
  confere("dois horários IGUAIS ⛔ não estabelecem ordem",
    D.ordemEntreColetas(e, "inr") === "nao_estabelecivel"
    && D.estadoTemporalDoAnalito(e, "inr").estado === "sem_ordem",
    "com horários idênticos, a única diferença entre as coletas seria a ordem de digitação");
}

// ── 6 · SENTINELA 2 · A UNIDADE ──────────────────────────────────────────
{
  const semUnidade = reg(vazio, c1, "plaquetas", 80);
  const r = D.plaquetasComparaveis(semUnidade, c1);
  confere("plaquetas sem unidade declarada ⛔ NÃO é comparável",
    r.comparavel === false && r.razao === "unidade_nao_declarada",
    "converter é transformar; **supor unidade é inventar** — e 80 ⛔ não se compara com 100.000");
  confere("e o valor digitado continua na trilha, intacto",
    I.valorNaInstancia(semUnidade, c1, "plaquetas").valor === 80,
    "⛔ não comparável ⛔ não é ⛔ não registrado");

  const mil = reg(semUnidade, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.milPorMm3);
  confere("declarada `mil/mm³`, 80 vira 80.000 na comparação",
    D.plaquetasComparaveis(mil, c1).emMm3 === 80_000,
    "conversão exata do mesmo valor físico — determinística e reversível");
  confere("e a trilha continua guardando **80**, e ⛔ não 80.000",
    I.valorNaInstancia(mil, c1, "plaquetas").valor === 80,
    "§4.3: gravar o normalizado faria a trilha afirmar um número que ninguém escreveu");

  const porMm3 = reg(semUnidade, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.porMm3);
  confere("declarada `/mm³`, 80 continua 80",
    D.plaquetasComparaveis(porMm3, c1).emMm3 === 80,
    "a mesma digitação com outra unidade é outra medida — e é por isso que a unidade ⛔ não se supõe");

  /**
   * ⚠️⚠️ A CONFERÊNCIA QUE GUARDA A CORREÇÃO DO AUTOR: a unidade vem da **mesma
   * coleta** do valor. Lida globalmente, a unidade de uma coleta se colaria ao
   * valor de outra.
   */
  let duas = reg(vazio, c1, "plaquetas", 80);
  duas = reg(duas, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.milPorMm3);
  duas = reg(duas, c2, "plaquetas", 90_000);
  confere("a unidade de uma coleta ⛔ NÃO se aplica ao valor de outra",
    D.plaquetasComparaveis(duas, c1).emMm3 === 80_000
    && D.plaquetasComparaveis(duas, c2).comparavel === false,
    "*\"separar demais cria a possibilidade de a unidade de uma aferição ser associada ao valor de outra\"*");
}

// ── 6b · SENTINELA 3 · CORRIGIR A UNIDADE DA MESMA AFERIÇÃO ──────────────
/**
 * ⚠️⚠️ O CASO MONTADO PELO AUTOR (2026-08-30):
 *
 * > *"coleta 1: `plaquetas = 80`, unidade `mil/mm³`; depois o médico percebe que
 * > o laudo era `/mm³` e corrige a unidade. A trilha precisa preservar que a
 * > unidade anterior foi corrigida, e a comparação precisa passar de `80.000`
 * > para `80`, sem criar uma nova coleta."*
 *
 * ⚠️ É **exatamente aqui** que "atributo da medida" vira bug histórico se ⛔ não
 * estiver amarrado: trocar a unidade ⛔ **não** é medir de novo (§3.4), ⛔ **não**
 * abre coleta, e ⛔ **não** pode reinterpretar as **outras** coletas.
 */
{
  /** ⚠️ Uma segunda coleta com unidade PRÓPRIA — a testemunha de que ⛔ nada vaza. */
  let e = reg(vazio, c1, "plaquetas", 80);
  e = reg(e, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.milPorMm3);
  e = reg(e, c2, "plaquetas", 90);
  e = reg(e, c2, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.porMm3);

  confere("antes da correção, a coleta 1 compara como 80.000",
    D.plaquetasComparaveis(e, c1).emMm3 === 80_000,
    "o ponto de partida do caso do autor precisa estar montado, ⛔ senão a trava mede outra coisa");

  const coletasAntes = I.instanciasDe(e, L.COLETA).length;
  const corrigido = reg(e, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.porMm3);

  confere("corrigida para `/mm³`, a comparação passa de 80.000 para 80",
    D.plaquetasComparaveis(corrigido, c1).emMm3 === 80,
    "a unidade é atributo da MEDIDA — mudá-la muda o que aquele 80 significa, e ⛔ nada mais");
  confere("e o valor digitado ⛔ NUNCA foi reescrito",
    corrigido.fatos.filter((f) => f.instancia === c1 && f.campo === "plaquetas").length === 1
    && I.valorNaInstancia(corrigido, c1, "plaquetas").valor === 80,
    "§4.3: normalizar na trilha faria o app afirmar um número que ⛔ nenhum laudo trouxe");
  confere("corrigir a unidade ⛔ NÃO abre coleta nova",
    I.instanciasDe(corrigido, L.COLETA).length === coletasAntes,
    "§3.4 ao contrário: isto ⛔ não é nova aferição, é a MESMA aferição melhor descrita");
  confere("e continua sendo a MESMA instância",
    I.valorNaInstancia(corrigido, c1, "plaquetas_unidade").instancia === c1,
    "atributo que troca de instância deixa o valor órfão da própria unidade");

  /**
   * ⚠️⚠️ A TRILHA PRESERVA A UNIDADE ERRADA. Apagá-la esconderia que houve erro —
   * e ⚠️ é justamente o erro de unidade que produz um valor **mil vezes** fora.
   */
  const trilha = corrigido.fatos.filter(
    (f) => f.instancia === c1 && f.campo === "plaquetas_unidade"
  );
  confere("a trilha guarda as DUAS unidades, na ordem em que foram declaradas",
    trilha.length === 2
    && trilha[0].valor === L.UNIDADE_PLAQUETAS.milPorMm3
    && trilha[1].valor === L.UNIDADE_PLAQUETAS.porMm3,
    "§3.1 é append-only: sobrescrever apagaria a evidência de que a unidade estava errada");
  confere("e a correção está MARCADA como correção na trilha",
    trilha[1].tipo === "correcao" && typeof trilha[1].motivo === "string" && trilha[1].motivo.length > 0,
    "sem marca, a trilha mostra duas declarações e ⛔ não diz que a segunda corrige a primeira (§3.4)");

  /** ⚠️⚠️ E A OUTRA COLETA ⛔ NÃO FOI TOCADA — ⛔ nenhuma reinterpretação silenciosa. */
  confere("a coleta 2 continua comparando como 90, com a unidade dela",
    D.plaquetasComparaveis(corrigido, c2).emMm3 === 90,
    "*\"⛔ não reinterpretar silenciosamente outras coletas\"* — unidade é por aferição, ⛔ nunca global");
  /**
   * ⚠️⚠️ A FRONTEIRA DA REGRA, e ⛔ ela ⛔ não pode ficar cega.
   *
   * A marca de correção segue a **temporalidade declarada**, e ⛔ não "segundo
   * valor na instância". A primeira versão marcava qualquer redeclaração e a
   * trava da Superfície A a reprovou: `PA 198/114` → `168/96` 25 min depois é
   * **medida nova**, e chamá-la de correção viraria evolução clínica falsa.
   */
  const inrRedigitado = reg(reg(vazio, c1, "inr", 1.4), c1, "inr", 1.1);
  const fatosInr = inrRedigitado.fatos.filter((f) => f.campo === "inr");
  confere("redigitar uma AFERIÇÃO ⛔ não é marcado por inferência",
    fatosInr.length === 2 && fatosInr[1].tipo === undefined,
    "onde a aferição pode se repetir, a ambiguidade ⛔ não se resolve adivinhando — §3.4 pede gesto explícito");
  confere("⛔ mas a unidade, que é ESTÁVEL, é marcada",
    trilha[1].tipo === "correcao",
    "a distinção é a temporalidade declarada, e ⛔ não a contagem de valores na instância");

  confere("e a correção ⛔ NÃO transformou uma medida em duas",
    D.ordemEntreColetas(corrigido, "plaquetas") === "nao_estabelecivel"
    && D.coletasComAnalito(corrigido, "plaquetas").length === 2,
    "corrigir atributo ⛔ não pode inflar a contagem de aferições do analito");
}

// ── 7 · A PENDÊNCIA NASCE TARDE, E ⛔ NÃO CEDO ────────────────────────────
{
  /** ⚠️ Uma coleta externa sozinha, sem horário: ⛔ NADA precisa da ordem. */
  let uma = reg(vazio, c1, "coleta_procedencia", "Serviço externo");
  uma = reg(uma, c1, "inr", 1.4);
  confere("uma coleta só, sem horário, ⛔ NÃO gera pendência",
    D.pendenciasDoLaboratorio(uma).length === 0,
    "*\"⛔ não pedir informação que naquele momento ninguém precisa usar\"* — o princípio que já apareceu quatro vezes");

  /** ⚠️ Entra a segunda coleta, e a ordem passa a importar. */
  let duas = reg(uma, c2, "coleta_hora", 950_000);
  duas = reg(duas, c2, "inr", 1.1);
  const p = D.pendenciasDoLaboratorio(duas);
  confere("com a segunda coleta e ordem necessária, a pendência nasce",
    p.length === 1 && p[0].dono === "laboratorio" && p[0].resolvePor.length > 0,
    "E-26: e ela diz o que a resolve — informar o horário, ou que ⛔ não foi possível determinar");

  /** ⚠️⚠️ Respondido "desconhecido", a pendência FECHA — e `sem_ordem` permanece. */
  const respondeu = reg(duas, c1, "coleta_hora", "nao_sei");
  confere("respondido DESCONHECIDO, a pendência fecha",
    D.pendenciasDoLaboratorio(respondeu).length === 0,
    "E-52 e E-26: muro permanente por dado genuinamente desconhecido é pendência sem porta");
  confere("e o estado permanece **sem_ordem**, que é a verdade",
    D.estadoTemporalDoAnalito(respondeu, "inr").estado === "sem_ordem",
    "fechar a pendência ⛔ não pode fabricar a ordem que ⛔ não existe");
}

// ── 8 · NOVA COLETA ⛔ NÃO É CORREÇÃO ─────────────────────────────────────
{
  let e = reg(vazio, c1, "inr", 1.4);
  e = reg(e, c2, "inr", 1.1);
  confere("duas coletas coexistem, cada uma com o seu resultado",
    I.instanciasDe(e, L.COLETA).length === 2
    && I.valorNaInstancia(e, c1, "inr").valor === 1.4
    && I.valorNaInstancia(e, c2, "inr").valor === 1.1,
    "§3.4: nova coleta ⛔ não é correção — os dois valores valem, cada um no seu momento");

  /** ⚠️ Corrigir aponta para a MESMA instância, e ⛔ não cria uma terceira. */
  const corrigido = reg(e, c1, "inr", 1.3);
  confere("corrigir um resultado ⛔ não cria coleta nova",
    I.instanciasDe(corrigido, L.COLETA).length === 2
    && I.valorNaInstancia(corrigido, c1, "inr").valor === 1.3,
    "*\"o INR das 20h era 1,3, ⛔ não 1,4\"* ⛔ não é uma segunda coleta");
  confere("e o valor anterior continua na trilha",
    E.historicoDe(corrigido, "inr").filter((f) => f.instancia === c1).length === 2,
    "§3.1: append-only — apagar esconderia que houve erro");
}

// ── 9 · A COLETA EXISTE ANTES DO RESULTADO ───────────────────────────────
{
  let e = reg(vazio, c1, "coleta_procedencia", "Este serviço");
  e = reg(e, c1, "coleta_hora", 900_000);
  confere("coleta com procedência e horário, e ⛔ sem analito, é estado válido",
    D.coletas(e).length === 1 && D.coletas(e)[0].horaConhecida === true,
    "PD-22 aplicado ao laboratório: *coleta realizada, resultados ainda pendentes* é fato verdadeiro");
  confere("e ⛔ nenhum analito aparece como informado",
    L.IDS_ANALITOS.every((a) => D.estadoTemporalDoAnalito(e, a).estado === "nao_informado"),
    "E-23: coleta existir ⛔ não é resultado existir");
}

// ── 10 · OS TRÊS ESTADOS DO HORÁRIO SÃO DISTINGUÍVEIS ────────────────────
{
  const naoPerguntado = reg(vazio, c1, "coleta_procedencia", "Este serviço");
  const desconhecido = reg(naoPerguntado, c1, "coleta_hora", "nao_sei");
  const conhecido = reg(naoPerguntado, c1, "coleta_hora", 900_000);
  const q = (e) => D.coletas(e)[0];
  confere("⛔ não perguntado, desconhecido e conhecido são três estados distintos",
    q(naoPerguntado).horaConhecida === false && q(naoPerguntado).horaDesconhecida === false
    && q(desconhecido).horaConhecida === false && q(desconhecido).horaDesconhecida === true
    && q(conhecido).horaConhecida === true && q(conhecido).horaDesconhecida === false,
    "E-37: e é a diferença entre eles que decide se a pendência do horário nasce");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DO LABORATÓRIO — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DO LABORATÓRIO — ${ok}/${ok} conferências`);
