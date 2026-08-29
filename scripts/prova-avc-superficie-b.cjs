/**
 * PROMETE: que a Superfície B se comporte como DECOMPOSIÇÃO e ⛔ nunca como
 *   veredito — que o sistema ⛔ não conclua "déficit incapacitante"; que o NIHSS
 *   **total** ⛔ não classifique nada (a leitura é idêntica de 0 a 42); que os
 *   dois quadros da Table 4 preservem o hedge e ⛔ não se cancelem; que a leitura
 *   da fonte ⛔ NÃO seja estendida fora da população que ela declara (D-1) sem que
 *   isso feche campo nenhum; que a consulta a paciente e família seja registro
 *   opcional e ⛔ nunca requisito (D-5); que a divergência tenha UMA direção só e
 *   só exista dentro do contexto da fonte; que ⛔ nenhum campo bloqueie terapia
 *   (E-49) e que ⛔ nenhuma leitura fale de elegibilidade; que campo de
 *   vocabulário próprio ⛔ nunca seja lido por `ternario()`; e que o zero do
 *   NIHSS seja resposta, ⛔ não ausência (E-10).
 * NÃO PROMETE: que os números clínicos estejam CERTOS — ela confere que o
 *   código diz o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem
 *   transcrito. ⛔ Também não mede tela: ordem visual, tamanho de alvo e
 *   legibilidade são `e2e/avc-superficie-b`. E ⛔ não diz nada sobre a
 *   Superfície A nem sobre elegibilidade, que ainda não existe.
 * UNIVERSO: `avc/conteudo/superficie-b.ts` inteiro (todos os campos de
 *   `TODOS_OS_CAMPOS_B`, contados, com piso) e todas as derivações de
 *   `avc/nucleo/derivacoes-b.ts` exercitadas por estado construído, mais o
 *   TEXTO desse arquivo para a trava de `ternario()`. ⛔ Fora do universo:
 *   Superfícies A e C a G.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
// ⚠️ `lerFonte` e ⛔ NÃO `fs.readFileSync`: comentário ⛔ não executa nada, e uma
// trava que casa dentro dele mede o que ninguém roda (R-92, scripts/lib/fonte.cjs).
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-b-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  // ⚠️ `--rootDir` FIXO: sem ele, o tsc escolhe a raiz comum dos arquivos, e ela
  // MUDA quando o grafo cresce. Ao consumir a escala NIHSS da calculadora (raiz
  // do repo), a saída deixou de ser `tmp/nucleo/…` e virou `tmp/avc/nucleo/…` —
  // e a trava passou a morrer no require, ⛔ não a medir.
  "--rootDir", appDir,
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-b.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-b.ts"),
  path.join(appDir, "avc", "conteudo", "superficies.ts"),
  // ⚠️ Entram no grafo porque a cadeia de fontes do mRS é medida aqui.
  path.join(appDir, "avc", "conteudo", "mrs.ts"),
  path.join(appDir, "avc", "conteudo", "fontes.ts"),
  path.join(appDir, "avc", "conteudo", "explicacoes.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const D = require(path.join(tmp, "avc", "nucleo", "derivacoes-b.js"));
const C = require(path.join(tmp, "avc", "conteudo", "superficie-b.js"));
const N = require(path.join(tmp, "avc", "conteudo", "nihss.js"));
const X = require(path.join(tmp, "avc", "conteudo", "explicacoes.js"));
const P = require(path.join(tmp, "avc", "conteudo", "superficies.js"));

const novo = () => {
  const rel = R.relogioControlado(1_000_000);
  return { rel, est: E.abrirAtendimento(rel) };
};
const reg = (est, campo, valor, rel) => E.registrarFato(est, { campo, valor }, rel);

// ── 0 · O UNIVERSO EXISTE, e ⛔ não passou sobre o vazio ────────────────────
{
  confere("o universo de campos foi carregado",
    Array.isArray(C.TODOS_OS_CAMPOS_B) && C.TODOS_OS_CAMPOS_B.length >= 15,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  confere("os dois quadros da Table 4 têm o número de linhas da fonte",
    C.IDS_ACHADOS_TIPICOS.length === 4 && C.IDS_ACHADOS_PODEM_NAO.length === 7,
    "Table 4 tem 4 achados à esquerda e 7 à direita — perder um é perder conteúdo da fonte");
  const ids = C.TODOS_OS_CAMPOS_B.map((c) => c.id);
  confere("⛔ nenhum id duplicado",
    new Set(ids).size === ids.length,
    "dois campos com o mesmo id gravam um por cima do outro na trilha");
}

// ── 1 · E-49 · ⛔ NENHUM CAMPO BLOQUEIA TERAPIA ─────────────────────────────
{
  const bloqueantes = C.TODOS_OS_CAMPOS_B.filter((c) => c.bloqueiaTerapia).map((c) => c.id);
  confere("⛔ nenhum campo da Superfície B bloqueia terapia",
    bloqueantes.length === 0,
    `🚫 do Bloco 3: exigir a decomposição antes de tratar fabrica o atraso que a fonte chama de potencialmente prejudicial — ${bloqueantes.join(", ")}`);

  confere("todo campo declara slot de fonte",
    C.TODOS_OS_CAMPOS_B.every((c) => typeof c.fonte === "string" && /^F-\d+$/.test(c.fonte)),
    "E-30: afirmação clínica sem endereço de fonte não entra no módulo");
}

// ── 2 · E-19 · A DECOMPOSIÇÃO SÓ TEM PERGUNTA QUE A FONTE SUSTENTA ─────────
{
  const decomposicao = ["funcional", "achados-tipicos", "achados-podem-nao", "decisao"];
  const campos = C.GRUPOS_B.filter((g) => decomposicao.includes(g.id)).flatMap((g) => [...g.campos]);
  confere("a decomposição inteira aponta para F-17",
    campos.length > 0 && campos.every((c) => c.fonte === "F-17"),
    "E-19: pergunta que a fonte não sustenta ⛔ não entra na decomposição — e F-17 é quem a sustenta");
}

// ── 3 · E-02/E-37 · TODA ESCOLHA TEM SAÍDA DE AUSÊNCIA DE CONCLUSÃO ────────
{
  const { valorDaOpcao } = require(path.join(tmp, "avc", "conteudo", "campo.js"));
  /**
   * ⚠️ "escolha", "grau" e "multipla" gravam RÓTULO — as três precisam da mesma
   * conferência. Deixar o `grau` de fora foi o que aconteceu quando o mRS mudou
   * de tipo: a trava parou de olhar para ele sem que ninguém decidisse isso.
   */
  const escolhas = C.TODOS_OS_CAMPOS_B.filter((c) =>
    ["escolha", "grau", "multipla"].includes(c.tipo)
  );
  confere("toda escolha oferece saída para quem não concluiu",
    escolhas.every((c) => c.opcoes.some((o) => valorDaOpcao(o) === "nao_sei")),
    "E-02/E-37: sem a saída, 'não sei' e 'não' caem no mesmo lugar");

  /**
   * ⚠️ RÓTULO CRU SÓ ONDE ESTÁ DECLARADO, E COM MOTIVO. Sem esta conferência,
   * um campo novo com vocabulário próprio nasceria mudo: o valor gravado seria
   * o rótulo, `ternario()` o leria como "não", e a negativa silenciosa é
   * exatamente o que E-23 proíbe.
   */
  const declarados = new Set(C.VOCABULARIO_PROPRIO_B.map((v) => v.id));
  const crus = escolhas
    .filter((c) => c.opcoes.some((o) => !["sim", "nao", "nao_sei"].includes(valorDaOpcao(o))))
    .map((c) => c.id);
  confere("rótulo cru só nos campos declarados de vocabulário próprio",
    crus.every((id) => declarados.has(id)),
    `campo com vocabulário próprio precisa entrar em VOCABULARIO_PROPRIO_B, com motivo: ${crus.filter((id) => !declarados.has(id)).join(", ")}`);
  confere("⛔ nenhum campo declarado sem motivo",
    C.VOCABULARIO_PROPRIO_B.every((v) => typeof v.motivo === "string" && v.motivo.length > 10),
    "R-55: lista de exceção sem motivo vira gaveta, e a próxima pessoa acrescenta um item para calar a trava");
  confere("⛔ nenhum campo declarado que não use vocabulário próprio",
    C.VOCABULARIO_PROPRIO_B.every((v) => crus.includes(v.id)),
    "declarar quem não precisa afrouxa a trava para o que vier depois");
}

// ── 4 · ⛔ CAMPO DE VOCABULÁRIO PRÓPRIO ⛔ NUNCA PASSA POR `ternario()` ──────
//
// ⚠️ Esta é a trava que impede o defeito mais silencioso da superfície: em
// `lateralidade`, `ternario()` devolveria `false` para "Direito", "Esquerdo" e
// "Bilateral" — três respostas legítimas indistinguíveis de "não".
{
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-b.ts"));
  const violacoes = C.VOCABULARIO_PROPRIO_B
    .map((v) => v.id)
    .filter((id) => new RegExp(`ternario\\(estado,\\s*"${id}"`).test(fonte));
  confere("⛔ nenhuma derivação lê vocabulário próprio por ternario()",
    violacoes.length === 0,
    `ternario() só conhece sim/nao/nao_sei: todo rótulo próprio viraria "não" — ${violacoes.join(", ")}`);
}

// ── 5 · E-23 · COM ESTADO VAZIO, ⛔ NADA É NEGADO ──────────────────────────
{
  const { est } = novo();
  const todas = D.leiturasDaSuperficieB(est);
  confere("as leituras existem e declaram insumos e fonte",
    todas.length === 10 && todas.every((l) => l.insumos.length > 0 && /^F-\d+$/.test(l.fonte)),
    "E-22: conclusão opaca não entra no módulo");
  const negativas = todas.filter((l) => l.conclusao === "nao").map((l) => l.id);
  confere("com o estado vazio, ⛔ nenhuma leitura conclui 'não'",
    negativas.length === 0,
    `E-23: sem dado, o sistema ⛔ não pode negar nada — ${negativas.join(", ")}`);
}

// ── 6 · 🚫 O NIHSS **TOTAL** ⛔ NÃO CLASSIFICA ──────────────────────────────
//
// ⚠️⚠️ A CONFERÊNCIA É POR VARREDURA DA ESCALA INTEIRA, ⛔ não por amostra: é
// assim que um `if (total >= 15)` acrescentado de boa-fé reprova. Verbatim:
// *"Use of the NIHSS score alone does not suffice"*.
{
  const { rel, est } = novo();
  const leituras = [];
  for (let n = 0; n <= 42; n += 1) leituras.push(D.nihssRegistrado(reg(est, "nihss_calculado", n, rel)));
  const primeira = JSON.stringify(leituras[0]);
  confere("a leitura do NIHSS é idêntica de 0 a 42",
    leituras.every((l) => JSON.stringify(l) === primeira),
    "🚫 do Bloco 3: usar o total como classificador é o que a fonte diz não bastar");

}

// ── 6b · D-1 · ⛔ A LEITURA DA FONTE ⛔ NÃO SAI DA POPULAÇÃO DA FONTE ────────
//
// ⚠️⚠️ REGRA DECIDIDA PELO AUTOR (2026-08-28): a decomposição da Table 4 é
// suportada SÓ no contexto que a fonte sustenta; fora dele o sistema ⛔ não
// extrapola e ⛔ não cria classificação normativa — mas o médico continua
// registrando tudo, e ⛔ nada fecha.
{
  const { rel, est } = novo();
  const achado = (e) => reg(e, "t4_afasia_grave", "sim", rel);

  const dentro = achado(reg(est, "nihss_calculado", 3, rel));
  const fora = achado(reg(est, "nihss_calculado", 20, rel));
  const semEscore = achado(est);

  confere("dentro da população da fonte, a leitura normativa existe",
    D.achadosDosQuadros(dentro).nivel === "achados_tipicos"
    && D.achadosDosQuadros(dentro).contexto === "dentro"
    && /tipicamente/i.test(D.achadosDosQuadros(dentro).curto),
    "é o contexto que a Table 4 escreveu para si — aqui a orientação da fonte vale");

  confere("FORA da população, ⛔ a frase normativa da fonte ⛔ não é reutilizada",
    D.achadosDosQuadros(fora).nivel === "achados_marcados_fora_do_contexto"
    && D.achadosDosQuadros(fora).contexto === "fora"
    && !/tipicamente|podem não ser/i.test(D.achadosDosQuadros(fora).curto),
    "D-1: estender o quadro além da população seria inventar a classificação que a fonte ⛔ não fez");

  confere("com o NIHSS não registrado, o contexto ⛔ não é presumido favorável",
    D.achadosDosQuadros(semEscore).contexto === "nao_estabelecido"
    && D.achadosDosQuadros(semEscore).nivel === "achados_marcados_fora_do_contexto",
    "presumir 'dentro' por omissão é extrapolar em silêncio — e é a forma mais fácil de a regra vazar");

  confere("⛔ e isso ⛔ não vira exigência de registrar o NIHSS",
    /nada aqui espera por ele/i.test(D.achadosDosQuadros(semEscore).texto)
    && D.achadosDosQuadros(semEscore).tom !== "pendente",
    "limitar o que o sistema afirma ⛔ não pode virar cobrança de campo — seria a espera que 🚫 proíbe");

  /**
   * ⚠️⚠️ O LIMITE É DO SISTEMA, ⛔ NÃO DO MÉDICO. Fora do contexto tudo continua
   * registrável e decidível: se o app fechasse o campo, o limite de EVIDÊNCIA
   * teria virado limite de REGISTRO, que é outra coisa e ⛔ não foi decidido.
   */
  confere("fora do contexto, o achado continua sendo gravado na trilha",
    E.valorAtual(fora, "t4_afasia_grave").valor === "sim",
    "D-1 limita a leitura, ⛔ não a coleta");

  const decidiuFora = reg(fora, "incapacitante_assumido", "Incapacitante", rel);
  confere("fora do contexto, o médico continua registrando o julgamento final",
    D.decisaoDoMedico(decidiuFora).conclusao === "sim"
    && /registrada pelo médico/i.test(D.decisaoDoMedico(decidiuFora).curto),
    "a decisão é do médico em qualquer contexto — o escopo governa o app, ⛔ não ele");

  confere("o número de leituras ⛔ não muda com o contexto",
    D.leiturasDaSuperficieB(dentro).length === D.leiturasDaSuperficieB(fora).length
    && D.leiturasDaSuperficieB(fora).length === D.leiturasDaSuperficieB(semEscore).length,
    "superfície que encolhe fora do contexto esconderia apoio em vez de limitar afirmação");

  /**
   * ⚠️ DENTRO do contexto, o VALOR do escore continua ⛔ não classificando nada —
   * a marca 🚫 do NIHSS total segue valendo, e D-1 ⛔ não a afrouxou.
   */
  const leiturasDentro = [];
  for (let n = 0; n <= 5; n += 1) {
    leiturasDentro.push(JSON.stringify(D.achadosDosQuadros(achado(reg(est, "nihss_calculado", n, rel)))));
  }
  confere("dentro do contexto, o valor do NIHSS ⛔ não muda a leitura",
    new Set(leiturasDentro).size === 1,
    "🚫: o total delimita o CONTEXTO da fonte, e ⛔ continua não classificando o déficit");

  const leiturasFora = [];
  for (let n = 6; n <= 42; n += 1) {
    leiturasFora.push(JSON.stringify(D.achadosDosQuadros(achado(reg(est, "nihss_calculado", n, rel)))));
  }
  confere("fora do contexto, o valor do NIHSS também ⛔ não muda a leitura",
    new Set(leiturasFora).size === 1,
    "⛔ nenhuma gradação de gravidade pode nascer por baixo do limite de escopo");
}

// ── 7 · E-10 · O ZERO DO NIHSS É RESPOSTA ─────────────────────────────────
{
  const { rel, est } = novo();
  const campo = C.TODOS_OS_CAMPOS_B.find((c) => c.id === "nihss_calculado");
  confere("o NIHSS declara que o zero é válido",
    campo.zeroValido === true && campo.faixa.min === 0,
    "E-10: em escala o zero é resposta legítima, e sem a declaração a tela ⛔ não oferece como registrá-lo");
  const comZero = reg(est, "nihss_calculado", 0, rel);
  confere("NIHSS 0 é registrado como valor, ⛔ não como ausência",
    E.valorAtual(comZero, "nihss_calculado").valor === 0
    && D.nihssRegistrado(comZero).conclusao === "sim",
    "§0.2: a fronteira das duas famílias de campo numérico — aqui o zero ⛔ não é campo vazio");

  /**
   * ⚠️ O zero é resposta em ESCORE — e os dois NIHSS são escore: o calculado
   * aqui e o informado por fora. ⛔ Fora deles, marcar zero válido faria um toque
   * gravar um valor clinicamente impossível.
   */
  const escores = ["nihss_calculado", "nihss_informado"];
  const zeroIndevido = C.TODOS_OS_CAMPOS_B.filter(
    (c) => c.zeroValido && !escores.includes(c.id)
  );
  confere("⛔ zero válido só nos escores",
    zeroIndevido.length === 0,
    `marcar por simetria faria um toque gravar um valor clinicamente impossível: ${zeroIndevido.map((c) => c.id).join(", ")}`);
}

// ── 8 · E-46 · O SISTEMA ⛔ NÃO EMITE VEREDITO ──────────────────────────────
//
// ⚠️ A varredura cobre as combinações que importam, ⛔ não uma delas: o veredito
// só é proibido se for proibido em TODAS.
{
  const { rel, est: cru } = novo();
  /**
   * ⚠️ AS COMBINAÇÕES NASCEM DENTRO DA POPULAÇÃO DA FONTE (NIHSS 3), de
   * propósito: é ali que a leitura normativa existe, e é ela que ⛔ não pode
   * virar veredito. O comportamento FORA do contexto tem seção própria (6b) —
   * misturar os dois deixaria cada um dos dois sem prova.
   */
  const est = reg(cru, "nihss_calculado", 3, rel);
  const combinacoes = [
    est,
    reg(est, "t4_afasia_grave", "sim", rel),
    reg(est, "t4_hemiataxia_leve", "sim", rel),
    reg(reg(est, "t4_afasia_grave", "sim", rel), "t4_hemiataxia_leve", "sim", rel),
    C.IDS_ACHADOS_TIPICOS.concat(C.IDS_ACHADOS_PODEM_NAO)
      .reduce((e, id) => reg(e, id, "nao", rel), est),
    reg(reg(est, "funcional_avd_trabalho", "nao", rel), "t4_afasia_grave", "sim", rel),
    // ⚠️ E uma FORA, para que a lista de níveis permitidos cubra os dois mundos.
    reg(reg(cru, "nihss_calculado", 20, rel), "t4_afasia_grave", "sim", rel),
  ];
  confere("os quadros ⛔ nunca emitem veredito",
    combinacoes.every((e) => {
      const l = D.achadosDosQuadros(e);
      return l.veredito === false && l.conclusao === "desconhecido";
    }),
    "E-46: o app ⛔ não produz 'déficit incapacitante = SIM/NÃO' a partir da Table 4 — o quadro é orientação, não critério");

  confere("as três formas autorizadas por §2.8-5 são as únicas",
    combinacoes.every((e) =>
      ["achados_tipicos", "achados_que_podem_nao_ser", "achados_marcados_fora_do_contexto",
       "nenhum_achado_marcado", "nada_informado"]
        .includes(D.achadosDosQuadros(e).nivel)),
    "§2.8-5 lista as leituras permitidas; qualquer outra é conclusão inventada");

  confere("achado típico ⛔ não é cancelado por achado da outra coluna",
    D.achadosDosQuadros(combinacoes[3]).nivel === "achados_tipicos",
    "os dois coexistem no mesmo paciente, e a fonte ⛔ não manda subtrair um do outro");

  confere("nada informado ⛔ não é o mesmo que nada marcado",
    D.achadosDosQuadros(combinacoes[0]).nivel === "nada_informado"
    && D.achadosDosQuadros(combinacoes[4]).nivel === "nenhum_achado_marcado",
    "E-23 na leitura: silêncio ⛔ não é resposta negativa");
}

// ── 9 · E-45 · O HEDGE DA FONTE SOBREVIVE ─────────────────────────────────
{
  const { rel, est: cru } = novo();
  // ⚠️ Dentro da população da fonte: é lá que as frases da Table 4 são ditas.
  const est = reg(cru, "nihss_calculado", 3, rel);
  const tipico = D.achadosDosQuadros(reg(est, "t4_afasia_grave", "sim", rel));
  confere("o quadro da esquerda preserva 'tipicamente'",
    /tipicamente/i.test(tipico.curto) && !/sempre incapacitante/i.test(tipico.curto),
    "E-45: 'would typically be considered' ⛔ não é 'sempre'");

  const podeNao = D.achadosDosQuadros(reg(est, "t4_hemiataxia_leve", "sim", rel));
  confere("o quadro da direita preserva 'podem não ser'",
    /podem não ser/i.test(podeNao.curto) && !/não incapacitante/i.test(podeNao.curto),
    "E-45: 'may not be clearly disabling' ⛔ não é 'não incapacitante' — achatar destrói a gradação da fonte");

  const quadro = C.GRUPOS_B.find((g) => g.id === "achados-podem-nao");
  confere("o título do quadro da direita ⛔ não afirma a negativa",
    /podem não ser/i.test(quadro.titulo),
    "o título é o que o médico lê primeiro, e é onde o hedge se perde mais fácil");
}

// ── 10 · A DIVERGÊNCIA TEM UMA DIREÇÃO SÓ ─────────────────────────────────
{
  const { rel, est } = novo();
  const comTipico = reg(est, "t4_afasia_grave", "sim", rel);

  const dentroDoContexto = reg(comTipico, "nihss_calculado", 3, rel);
  const divergente = D.decisaoDoMedico(reg(dentroDoContexto, "incapacitante_assumido", "Não incapacitante", rel));
  confere("decidir 'não incapacitante' com achado típico registra divergência",
    /diverge/i.test(divergente.curto) && divergente.tom === "atencao",
    "§4.5/§4.7: a divergência fica identificável — e ⛔ não bloqueia nada");

  const comPodeNao = reg(est, "t4_hemiataxia_leve", "sim", rel);
  const inverso = D.decisaoDoMedico(reg(comPodeNao, "incapacitante_assumido", "Incapacitante", rel));
  confere("decidir 'incapacitante' com achado da coluna da direita ⛔ NÃO é divergência",
    !/diverge/i.test(inverso.curto),
    "E-45: 'may not be clearly disabling in an individual patient' é exatamente a circunstância individual que a fonte manda considerar — acusar divergência ali achataria o hedge");

  /**
   * ⚠️⚠️ "INCERTO" É DECISÃO, ⛔ NÃO É AUSÊNCIA DE DECISÃO. Ele grava `nao_sei`,
   * que em quase todo campo significa "não concluí" — aqui significa que o
   * médico CONCLUIU que o caso é incerto, e §2.8-6 lista isso como uma das três.
   */
  const semNada = D.decisaoDoMedico(est);
  const comIncerto = D.decisaoDoMedico(reg(est, "incapacitante_assumido", "nao_sei", rel));
  confere("'Incerto' é decisão registrada, ⛔ não 'ainda não assumida'",
    /incerto/i.test(comIncerto.curto) && !/ainda não assumida/i.test(comIncerto.curto)
    && /ainda não assumida/i.test(semNada.curto),
    "E-23/E-37 na espécie mais cara: colapsar as duas apaga a diferença entre o médico não ter chegado na pergunta e ter decidido que o caso é incerto");

  /**
   * ⚠️⚠️ **D-1 PELA PORTA DOS FUNDOS.** Divergência é divergir DA LEITURA DO
   * SISTEMA. Fora da população da Table 4 o sistema ⛔ não emite leitura
   * normativa — logo ⛔ não há do que divergir, e acusar divergência ali aplicaria
   * o quadro fora do escopo exatamente como se ele valesse.
   */
  const foraDoContexto = reg(reg(comTipico, "nihss_calculado", 20, rel),
    "incapacitante_assumido", "Não incapacitante", rel);
  confere("fora do contexto da fonte, ⛔ NÃO se acusa divergência",
    !/diverge/i.test(D.decisaoDoMedico(foraDoContexto).curto),
    "seria o quadro sendo aplicado fora da população dele, com outro nome");

  confere("⛔ divergir não bloqueia o atendimento",
    /não bloqueia/i.test(divergente.texto),
    "§2.8-7: divergir ⛔ não é erro");
}

// ── 11 · R3.10 · A SUPERFÍCIE É PULÁVEL, E DIZ ISSO ───────────────────────
{
  const { rel, est } = novo();
  const assumido = reg(est, "incapacitante_assumido", "Incapacitante", rel);
  const l = D.decomposicaoNaoAtrasa(assumido);
  confere("com déficit assumido como incapacitante, a leitura manda ⛔ não atrasar",
    l.tom === "atencao" && /não atrasar/i.test(l.curto),
    "verbatim: 'delaying IVT is potentially harmful' — 🚫 do Bloco 3");
  confere("sem decisão, a leitura declara que a superfície pode ficar incompleta",
    /pode ser deixada incompleta/i.test(D.decomposicaoNaoAtrasa(est).curto),
    "E-49: campo que parece obrigatório vira espera, e espera aqui é dano");
}

// ── 12 · ⛔ A SUPERFÍCIE B ⛔ NÃO DECIDE ELEGIBILIDADE ──────────────────────
//
// ⚠️ Mesma fronteira que a Superfície A respeita com a PA (E-06): a candidatura
// nasce na Reperfusão, que ⛔ ainda não existe. R3.9 — déficit leve não
// incapacitante ≤4,5 h, COR 3: No Benefit — é afirmação sobre a IVT, e ⛔ não
// pode ser dita aqui.
{
  const { rel, est } = novo();
  const cheio = C.TODOS_OS_CAMPOS_B
    .filter((c) => c.tipo === "escolha")
    .reduce((e, c) => reg(e, c.id, c.opcoes[0] === "Sim" ? "sim" : c.opcoes[0], rel), est);
  const textos = D.leiturasDaSuperficieB(cheio)
    .flatMap((l) => [l.curto, l.texto])
    .join(" | ");
  confere("⛔ nenhuma leitura fala de elegibilidade ou candidatura",
    !/elegív|candidat|contraindica|4,5 ?h|dupla antiagreg/i.test(textos),
    `E-06/R3.9: afirmação sobre terapia mora onde a terapia mora — ${textos.slice(0, 120)}`);
}

// ── 13 · E-26 · A PENDÊNCIA DO EXAME TEM ROTA DE RESOLUÇÃO ────────────────
{
  const { rel, est } = novo();
  const pend = P.pendenciasVigentes().filter((p) => p.id === "deficit_focal");
  confere("a pendência do déficit aponta para um campo que existe",
    pend.length === 1 && C.TODOS_OS_CAMPOS_B.some((c) => c.id === pend[0].campo),
    "E-26: pendência que aponta para campo inexistente é muro, ⛔ não tarefa — foi o defeito medido em 2026-08-28");
  const abertas = (e) => E.pendenciasAbertas(e, pend).length;
  confere("sem resposta, a pendência fica aberta",
    abertas(est) === 1, "pendência que nasce fechada ⛔ não é pendência");
  confere("responder resolve a pendência",
    abertas(reg(est, "deficit_focal", "sim", rel)) === 0,
    "a rota escrita em resolvePor precisa existir de fato");
  confere("responder 'incerto' também resolve",
    abertas(reg(est, "deficit_focal", "nao_sei", rel)) === 0,
    "E-02: incerteza é RESPOSTA — deixá-la aberta trataria resposta como silêncio");
}

// ── 14 · ⛔ A RESPOSTA NEGATIVA DO EXAME ⛔ NÃO EXCLUI AVC ──────────────────
{
  const { rel, est } = novo();
  const semFocal = D.exameNeurologico(reg(est, "deficit_focal", "nao", rel));
  confere("sem déficit focal, a leitura ⛔ não exclui AVC",
    /não exclui/i.test(semFocal.texto),
    "F-13, achado negativo: a fonte ⛔ não define critério de suspeita intra-hospitalar, e um 'não' que fechasse o quadro seria regra inventada");
}

// ── 15 · mRS · CONTEXTO, ⛔ NUNCA PORTA ────────────────────────────────────
{
  const { rel, est } = novo();
  const campo = C.TODOS_OS_CAMPOS_B.find((c) => c.id === "mrs_previo");
  const M = require(path.join(tmp, "avc", "conteudo", "mrs.js"));

  /**
   * ⚠️⚠️ A CADEIA DE FONTES (decisão do autor, 2026-08-29): a escala é NEUTRA e
   * vai de 0 a 6 porque a fonte a publica assim; o CAMPO do AVC agudo pergunta
   * a função PRÉVIA, e ⛔ não existe função basal "óbito" em quem está sendo
   * avaliado agora.
   */
  confere("a escala neutra tem os sete graus, com descritor",
    M.GRAUS_MRS.length === 7
    && M.GRAUS_MRS.every((g) => typeof g.descritor === "string" && g.descritor.length > 3),
    "os descritores vêm do Quadro 4 (F-27) — ⛔ escrever de memória é E-31 violada");

  confere("o campo do AVC agudo oferece 0 a 5, e ⛔ não o 6",
    campo.opcoes.length === 7 && campo.opcoes.every((o) => !/^6 ·/.test(o)),
    "grau 6 é óbito, e ⛔ não existe como função basal de quem está sendo avaliado");

  confere("cada opção mostra o DESCRITOR, ⛔ não o número sozinho",
    campo.opcoes.filter((o) => /^\d/.test(o)).every((o) => /^\d · .{3,}/.test(o)),
    "pedido do autor: 'essa escala o usuário não sabe' — número solto exige a tabela na cabeça");

  /**
   * ⚠️⚠️ RASTREABILIDADE POR AFIRMAÇÃO (E-30): o campo aponta para F-27, que é
   * quem publica os descritores. ⛔ Atribuí-los a Cincura (F-26) seria inventar
   * procedência — lá está a validação brasileira, ⛔ não a tabela.
   */
  confere("o campo aponta para a fonte dos DESCRITORES",
    campo.fonte === "F-27",
    "E-30: cada afirmação com o seu endereço, e ⛔ não uma fonte provando o que é da outra");
  confere("as duas fontes do mRS estão registradas com papéis distintos",
    (() => {
      const F = require(path.join(tmp, "avc", "conteudo", "fontes.js"));
      const validacao = F.slot("F-26");
      const descritores = F.slot("F-27");
      return validacao && descritores
        && /valida/i.test(validacao.assunto) && /descritor/i.test(descritores.assunto);
    })(),
    "uma fonte sustenta a versão brasileira, a outra publica a tabela — e ⛔ nenhuma responde pela outra");

  const l = D.funcionalidadePrevia(reg(est, "mrs_previo", "4", rel));
  confere("mRS elevado ⛔ não vira contraindicação nem veredito",
    l.tom === "informativo" && /não nomeia valor de corte/i.test(l.texto),
    "F-14/P-05: a fonte ⛔ sequer nomeia um valor de mRS, e em nenhuma terapia ele é contraindicação automática");
}

// ── 15b · A ESCALA DERIVA, ⛔ E NÃO DECIDE ─────────────────────────────────
//
// ⚠️⚠️ DECISÃO DO AUTOR (2026-08-29), opção (a): com o NIHSS preenchido, os
// achados que a **própria Table 4 define como corte de item** vêm da escala,
// etiquetados, e o médico pode alterar. ⛔ O NIHSS ⛔ não é alterado, ⛔ a
// divergência fica identificável, e ⛔ nada disso vira decisão de incapacitância.
{
  const { rel, est } = novo();

  confere("a escala vem da calculadora, com os 15 itens",
    N.ITENS_NIHSS.length === 15 && N.ITENS_NIHSS.every((v) => v.options.length > 0),
    "§10.1: calculadora neutra pode ser consumida — copiar a escala seria a I6 aplicada a escore");

  confere("⛔ os itens ⛔ não são reescritos no módulo",
    N.NIHSS.reference.includes("Brott") && /Pontes-Neto/.test(N.NIHSS.reference),
    "a fonte da escala é a da calculadora, e ⛔ não uma cópia sem procedência");

  /** ⚠️ Preenche a escala inteira com zeros, e sobe só o que o caso exige. */
  const preencher = (e, pontos) =>
    N.ITENS_NIHSS.reduce(
      (acc, v) => reg(acc, N.CAMPO_DE_ITEM(v.id), pontos[v.id] ?? 0, rel),
      e
    );

  const semEscala = D.achadoDerivado(est, "t4_afasia_grave");
  confere("⛔ item não respondido ⛔ não deriva nada",
    semEscala === undefined,
    "E-23: derivar 'não' do silêncio é a negativa silenciosa entrando por porta nova");

  const comAfasia = preencher(est, { "9": 2 });
  confere("linguagem ≥2 deriva afasia grave",
    D.achadoDerivado(comAfasia, "t4_afasia_grave") === "sim",
    "Table 4: 'Severe aphasia (≥2 on the NIHSS best language question)'");
  confere("linguagem <2 deriva a ausência do achado",
    D.achadoDerivado(preencher(est, { "9": 1 }), "t4_afasia_grave") === "nao",
    "o corte é da fonte, e vale nos dois sentidos quando o item foi respondido");

  confere("os quatro achados da coluna típica são deriváveis",
    N.ACHADOS_DERIVAVEIS.length === 4
    && N.ACHADOS_DERIVAVEIS.every((r) => C.IDS_ACHADOS_TIPICOS.includes(r.campo)),
    "são exatamente os que a Table 4 define por corte de item");

  confere("⛔ os achados QUALITATIVOS ⛔ não são derivados",
    C.IDS_ACHADOS_PODEM_NAO.every((id) => D.derivadoDaEscala(preencher(est, {}), id) === undefined),
    "'afasia leve mas ainda comunicando' ⛔ não é corte de item — o app ⛔ não adivinha");

  confere("qualquer item motor ≥2 deriva fraqueza contra a gravidade",
    D.achadoDerivado(preencher(est, { "6b": 2 }), "t4_fraqueza_contra_gravidade") === "sim",
    "Table 4 fala das 'motor questions' no plural, e ⛔ não nomeia um membro");

  // ── lateralidade: derivável só quando os itens motores realmente dizem ──
  /**
   * ⚠️⚠️ LATERALIDADE **MOTORA**, POR PRESENÇA — correção conceitual do autor,
   * 2026-08-29. ⛔ Não é "lado predominante do déficit", e ⛔ não sai de diferença
   * de somas: afasia, hemianopsia e negligência importantes convivem com motor
   * quase normal, e a aritmética ⛔ não sabe disso.
   */
  confere("déficit motor de um lado só deriva aquele lado",
    D.lateralidadeDerivada(preencher(est, { "5a": 3, "6a": 2 })) === "Esquerda"
    && D.lateralidadeDerivada(preencher(est, { "5b": 2 })) === "Direita",
    "é presença nos itens motores daquele lado, ⛔ não julgamento sobre o AVC");

  confere("⛔ diferença de somas ⛔ NÃO vira lado: os dois acometidos são bilaterais",
    D.lateralidadeDerivada(preencher(est, { "5a": 3, "5b": 2 })) === "Bilateral",
    "3 contra 2 ⛔ não é 'lado predominante' — é déficit dos dois lados, e é isso que os itens dizem");

  confere("⛔ motor zerado ⛔ não deriva lateralidade",
    D.lateralidadeDerivada(preencher(est, {})) === undefined,
    "ausência de déficit MOTOR ⛔ não é ausência de lateralidade: o lado pode estar num déficit que estes itens ⛔ não medem");

  confere("o campo mudou de nome junto com a regra",
    /motor/i.test(C.TODOS_OS_CAMPOS_B.find((c) => c.id === "lateralidade").rotulo),
    "derivar lateralidade motora e chamá-la de 'lado predominante do déficit' seria a interpretação voltando pelo rótulo");

  // ── o registro do médico manda, e a divergência fica identificável ──────
  const alterado = reg(comAfasia, "t4_afasia_grave", "nao", rel);
  confere("o registro do médico prevalece sobre a escala",
    D.valorEfetivo(alterado, "t4_afasia_grave") === "nao",
    "⛔ valor derivado que sobrescreve o dedo do médico é o app decidindo por ele");

  confere("⛔ alterar o achado ⛔ NÃO altera o NIHSS",
    E.valorAtual(alterado, N.CAMPO_DE_ITEM("9")).valor === 2
    && D.achadoDerivado(alterado, "t4_afasia_grave") === "sim",
    "decisão do autor: o NIHSS original ⛔ não é modificado");

  confere("a divergência fica identificável",
    D.divergenciasComAEscala(alterado).join() === "t4_afasia_grave"
    && /diferente do que a escala deriva/i.test(D.divergenciaDaEscala(alterado).curto),
    "sem isso, a alteração some e ninguém sabe que escala e médico discordaram");

  /**
   * ⚠️⚠️ MEDE O EFEITO, ⛔ NÃO A PALAVRA — e a lição custou duas tentativas hoje.
   *
   * Varrer o texto por "bloqueia/aguardar/obrigatório" acusa as frases que
   * prometem o CONTRÁRIO: *"nenhum campo desta superfície é obrigatório"*,
   * *"não bloqueia o atendimento"*. Português tem negação demais para uma regex
   * — e trava que acusa inocente é desligada no primeiro aperto (R-55).
   *
   * O que importa é comportamento: divergir do que a escala deriva ⛔ não pode
   * ELEVAR nenhuma leitura a `atencao`. Compara-se o antes e o depois.
   */
  const tonsDe = (e) =>
    Object.fromEntries(D.leiturasDaSuperficieB(e).map((l) => [l.id, l.tom]));
  const antesDaAlteracao = tonsDe(comAfasia);
  const depoisDaAlteracao = tonsDe(alterado);
  confere("⛔ a divergência ⛔ não eleva nenhuma leitura a atenção",
    D.divergenciaDaEscala(alterado).tom !== "atencao"
    && Object.keys(depoisDaAlteracao).every(
      (id) => !(depoisDaAlteracao[id] === "atencao" && antesDaAlteracao[id] !== "atencao")
    ),
    "divergir da escala é julgamento clínico, ⛔ não erro a corrigir — e ⛔ não pode acender alarme");

  confere("desfazer a alteração devolve o valor da escala",
    D.valorEfetivo(E.desfazerRegistro(alterado, "t4_afasia_grave", rel), "t4_afasia_grave") === "sim",
    "§7.16: desfazer devolve ao estado anterior — aqui, ao que a escala diz");

  // ── ⛔ derivar ⛔ NÃO é decidir ─────────────────────────────────────────
  const cheia = preencher(reg(est, "nihss_calculado", 3, rel), { "9": 2, "3": 2 });
  confere("⛔ achado derivado ⛔ não decide incapacitância",
    D.decisaoDoMedico(cheia).conclusao === "desconhecido"
    && D.achadosDosQuadros(cheia).veredito === false,
    "§2.8-2: usar item do NIHSS ⛔ não autoriza algoritmo automático de elegibilidade");

  confere("mas o achado derivado CONTA na leitura dos quadros",
    D.achadosDosQuadros(cheia).nivel === "achados_tipicos",
    "a escala respondeu — ignorar isso seria reperguntar o que já se sabe");
}

// ── 15c · O NIHSS DE FORA ⛔ NÃO FABRICA ITENS ─────────────────────────────
//
// ⚠️⚠️ REGRA CRUCIAL DO AUTOR (2026-08-29): *"um NIHSS total informado
// externamente ⛔ nunca pode fabricar os itens que ⛔ não conhecemos"*. NIHSS
// externo 12 ⛔ não permite concluir hemianopsia, afasia, negligência ou paresia.
{
  const { rel, est } = novo();
  const preencher = (e, pontos) =>
    N.ITENS_NIHSS.reduce((acc, v) => reg(acc, N.CAMPO_DE_ITEM(v.id), pontos[v.id] ?? 0, rel), e);

  const soExterno = reg(reg(est, "nihss_informado", 12, rel), "nihss_informado_origem", "SAMU", rel);

  confere("⛔ NIHSS externo ⛔ NÃO deriva nenhum achado",
    C.IDS_ACHADOS_TIPICOS.every((id) => D.derivadoDaEscala(soExterno, id) === undefined)
    && D.lateralidadeDerivada(soExterno) === undefined,
    "um total ⛔ não diz quais itens pontuaram — derivar dali seria inventar um exame que ninguém fez aqui");

  confere("⛔ NIHSS externo ⛔ não estabelece o contexto da Table 4",
    D.contextoDaTable4(reg(est, "nihss_informado", 3, rel)) === "nao_estabelecido",
    "a população da fonte é 'NIHSS 0–5 AT PRESENTATION', e o de fora pode ser de outro momento");

  confere("o calculado aqui estabelece o contexto",
    D.contextoDaTable4(preencher(est, { "5a": 3 })) === "dentro",
    "é o exame desta avaliação — é dele que a fonte fala");

  /**
   * ⚠️⚠️ OS DOIS CONVIVEM, e ⛔ um ⛔ não corrige o outro: podem ser observações de
   * momentos diferentes, e apagar uma delas apagaria a evolução.
   */
  rel.avancar(40 * 60_000);
  const ambos = preencher(soExterno, { "9": 2, "5a": 3, "6a": 4 });
  confere("os dois totais coexistem, cada um no seu campo",
    D.nihssInformado(ambos) === 12 && D.nihssCalculado(ambos) === 9,
    "⛔ nenhum sobrescreve o outro — são entidades diferentes, com procedência diferente");

  confere("a leitura DIZ que há os dois",
    /informado por fora e um calculado aqui/i.test(D.nihssRegistrado(ambos).curto),
    "esconder um deles faria a tela mentir sobre o que se sabe do paciente");

  confere("com o externo sozinho, a leitura avisa que ⛔ nada é derivado dele",
    /não são derivados dele/i.test(D.nihssRegistrado(soExterno).curto),
    "sem esse aviso, o médico esperaria os achados preenchidos e ⛔ eles não viriam");

  confere("o externo registra origem e horário",
    C.TODOS_OS_CAMPOS_B.some((c) => c.id === "nihss_informado_origem")
    && C.TODOS_OS_CAMPOS_B.some((c) => c.id === "nihss_informado_hora" && c.tipo === "hora"),
    "E-03: total sem procedência é número órfão, e sem hora ⛔ não se sabe de quando é");

  confere("⛔ o externo ⛔ não bloqueia nem atrasa nada",
    C.TODOS_OS_CAMPOS_B.filter((c) => c.id.startsWith("nihss_"))
      .every((c) => c.bloqueiaTerapia === false),
    "E-49: informação recebida ⛔ não vira porta");
}

// ── 15d · AS EXPLICAÇÕES — o que é, e como se testa ───────────────────────
//
// ⚠️⚠️ AUTORIZADAS PELO AUTOR (2026-08-29) como **redação condensada das
// instruções oficiais do NIHSS/AHA**, ⛔ não de memória, com conferência contra o
// documento declarada como pendente.
{
  confere("todo achado derivável tem definição visível",
    N.ACHADOS_DERIVAVEIS.every((r) => (X.definicaoDoAchado(r.campo) ?? "").length > 20),
    "quem ⛔ não lembra o termo precisa da definição no momento de responder, ⛔ não a um toque");

  /**
   * ⚠️⚠️ DUAS LINHAS, DUAS PERGUNTAS DIFERENTES: **o que avalia** vem antes de
   * **como testar**. Quem ⛔ não usa a escala todo dia precisa saber o que está
   * medindo antes de saber como medir — e a trava guarda as duas.
   */
  confere("TODOS os quinze itens dizem O QUE avaliam",
    N.ITENS_NIHSS.every((v) => (X.oQueAvaliaItem(v.id) ?? "").length > 15),
    "'extinção/desatenção' ⛔ não se decodifica sozinho, e o nome ⛔ não é explicação");

  confere("⛔ nenhuma das duas linhas repete a outra",
    N.ITENS_NIHSS.every((v) => X.oQueAvaliaItem(v.id) !== X.comoAvaliarItem(v.id)),
    "duas linhas dizendo o mesmo é a duplicação que a revisão de tela já tirou uma vez");

  confere("TODOS os quinze itens dizem COMO testar",
    N.ITENS_NIHSS.every((v) => (X.comoAvaliarItem(v.id) ?? "").length > 10),
    "⛔ item sem manobra devolve o médico ao 'sei o nome, ⛔ não sei o que fazer'");

  /**
   * ⚠️⚠️ TODO ACHADO EXPLICA O TERMO — inclusive os sete qualitativos, que ⛔ não
   * são deriváveis do NIHSS e por isso dependem de redação autorizada.
   */
  const todosOsAchados = [...C.IDS_ACHADOS_TIPICOS, ...C.IDS_ACHADOS_PODEM_NAO];
  confere("os onze achados têm definição",
    todosOsAchados.every((id) => (X.definicaoDoAchado(id) ?? "").length > 20),
    "o médico que ⛔ não lembra o termo ⛔ não responde — e a coluna da direita é a que mais tem termo");

  /**
   * ⛔⛔ A GLOSA EXPLICA O TERMO, e ⛔ NUNCA classifica — exigência do autor: a
   * Table 4 lista estes achados como exemplos que **podem não ser** claramente
   * incapacitantes, *"sempre considerando as circunstâncias individuais"*. Uma
   * glosa dizendo "não incapacitante" achataria o hedge (E-45).
   */
  confere("⛔ nenhuma glosa classifica incapacitância",
    todosOsAchados.every((id) => !/incapacit/i.test(X.definicaoDoAchado(id) ?? "")),
    "explicação que classifica vira critério sem passar por fonte");

  /**
   * ⚠️⚠️ EXPLICAÇÃO ⛔ NÃO É REGRA. Nenhuma delas pode conter pontuação, corte ou
   * conduta: o dia em que uma disser "≥2 indica trombólise", a glosa virou
   * critério sem passar por fonte nenhuma.
   */
  const frases = [
    ...Object.values(X.DEFINICAO_DO_ACHADO),
    ...Object.values(X.COMO_AVALIAR_ITEM),
    ...Object.values(X.O_QUE_AVALIA_ITEM),
  ].join(" | ");
  confere("⛔ nenhuma explicação carrega pontuação, corte ou conduta",
    !/≥|escore \d|ponto[s]? \d|trombóli|elegív|contraindic|indicad/i.test(frases),
    `explicação que vira regra é regra sem fonte: ${frases.slice(0, 100)}`);

  confere("⛔ a explicação ⛔ não muda nenhuma derivação",
    (() => {
      const { rel, est } = novo();
      const preencher = (e, pontos) =>
        N.ITENS_NIHSS.reduce((acc, v) => reg(acc, N.CAMPO_DE_ITEM(v.id), pontos[v.id] ?? 0, rel), e);
      const comAfasia = preencher(est, { "9": 2 });
      return D.achadoDerivado(comAfasia, "t4_afasia_grave") === "sim";
    })(),
    "as frases explicam, e ⛔ a lógica derivada ⛔ não olha para elas");
}

// ── 15e · O APP ⛔ NÃO REPERGUNTA O QUE JÁ SABE (PD-20) ────────────────────
//
// ⚠️⚠️ PRINCÍPIO FIXADO PELO AUTOR (2026-08-29): *"o app deve lembrar o que já
// sabe e ⛔ não perguntar novamente por padrão"*. Com a escala preenchida, os
// quatro achados que a Table 4 define por corte de item já estão respondidos.
//
// ⚠️ O que a trava guarda é o LIMITE do princípio: recolher a pergunta ⛔ não pode
// custar a divergência (PD-19) nem o registro de quem ⛔ não preencheu a escala.
{
  const { rel, est } = novo();
  const preencher = (e, pontos) =>
    N.ITENS_NIHSS.reduce((acc, v) => reg(acc, N.CAMPO_DE_ITEM(v.id), pontos[v.id] ?? 0, rel), e);

  confere("⛔ sem escala preenchida, ⛔ nada é derivado — e a pergunta continua sendo a única via",
    !D.escalaPreenchida(est)
    && C.IDS_ACHADOS_TIPICOS.every((id) => D.valorEfetivo(est, id) === undefined),
    "recolher a pergunta sem ter a resposta apagaria o campo em vez de lembrá-lo");

  const cheia = preencher(est, { "9": 2 });
  confere("com a escala preenchida, os quatro achados já têm resposta",
    D.escalaPreenchida(cheia)
    && C.IDS_ACHADOS_TIPICOS.every((id) => D.valorEfetivo(cheia, id) !== undefined),
    "é isto que autoriza ⛔ não reperguntar: a resposta EXISTE, e veio de quem examinou");

  confere("e todas vêm etiquetadas como da escala",
    C.IDS_ACHADOS_TIPICOS.every((id) => D.veioDaEscala(cheia, id)),
    "resumo sem procedência seria o app afirmando por conta própria");

  /**
   * ⚠️⚠️ O LIMITE: `Ajustar` existe porque a divergência ⛔ não pode morrer no
   * resumo. Depois de ajustar, o registro do médico prevalece e a divergência
   * continua identificável — PD-19 intacta.
   */
  const ajustado = reg(cheia, "t4_afasia_grave", "nao", rel);
  confere("ajustar preserva a divergência e o registro do médico",
    D.valorEfetivo(ajustado, "t4_afasia_grave") === "nao"
    && !D.veioDaEscala(ajustado, "t4_afasia_grave")
    && D.divergenciasComAEscala(ajustado).includes("t4_afasia_grave"),
    "⛔ um resumo que não pudesse ser contrariado seria decisão automática com outro nome");
}

// ── 16 · D-5 · A CONSULTA É REGISTRO OPCIONAL, ⛔ NUNCA REQUISITO ──────────
//
// ⚠️⚠️ REGRA DECIDIDA PELO AUTOR (2026-08-28): ação opcional registrável, ⛔ nunca
// requisito, ⛔ nunca bloqueia, ⛔ nunca atrasa reperfusão.
{
  const { rel, est } = novo();
  const campo = C.TODOS_OS_CAMPOS_B.find((c) => c.id === "consulta_paciente_familia");

  confere("a consulta existe como campo registrável",
    campo !== undefined && campo.tipo === "escolha" && campo.fonte === "F-17",
    "sem campo, a orientação da fonte fica sem trilha — que é o que D-5 resolveu");

  confere("a consulta ⛔ não bloqueia terapia",
    campo.bloqueiaTerapia === false,
    "⛔ nunca requisito, ⛔ nunca bloqueia, ⛔ nunca atrasa reperfusão");

  /**
   * ⚠️ PENDÊNCIA É COBRANÇA COM OUTRO NOME. Uma pendência de consulta apareceria
   * em TODAS as superfícies (alcance global, E-07) e viraria tarefa aberta o
   * atendimento inteiro — a forma mais silenciosa de um opcional virar requisito.
   */
  confere("⛔ a consulta ⛔ não gera pendência",
    P.pendenciasVigentes().every((p) => p.campo !== "consulta_paciente_familia"),
    "pendência tem alcance global e vira tarefa aberta o atendimento inteiro");

  const semRegistro = D.consultaAoPacienteEFamilia(est);
  confere("sem registro, a leitura ⛔ não cobra — e ⛔ não usa o tom de pendência",
    semRegistro.tom !== "pendente" && /opcional/i.test(semRegistro.curto)
    && /não impede continuar/i.test(semRegistro.texto),
    "'pendente' é vocabulário de coisa que falta, e aqui ⛔ não falta nada");

  const comRegistro = reg(est, "consulta_paciente_familia", "Paciente e família", rel);
  const l = D.consultaAoPacienteEFamilia(comRegistro);
  confere("registrada, a leitura confirma o registro sem virar condição",
    l.conclusao === "sim" && /registrada/i.test(l.curto)
    && /não impede continuar/i.test(l.texto),
    "o registro é trilha, ⛔ não porta");

  /** ⚠️ A TRILHA: o fato entra com hora, e a hora vem do relógio (§3.2). */
  const fato = E.valorAtual(comRegistro, "consulta_paciente_familia");
  confere("o registro entra na trilha com hora",
    fato.valor === "Paciente e família" && typeof fato.horaRegistro === "number",
    "§3.2: sem hora, o registro ⛔ não reconstitui o que se sabia e quando");

  rel.avancar(9 * 60_000);
  const segunda = reg(comRegistro, "consulta_paciente_familia", "Não foi possível", rel);
  const historico = E.historicoDe(segunda, "consulta_paciente_familia");
  confere("registrar de novo ⛔ não apaga o registro anterior",
    historico.length === 2 && historico[1].horaRegistro > historico[0].horaRegistro,
    "§3.1: a trilha é append-only, e uma conversa que mudou de resultado ⛔ não apaga a primeira");

  /**
   * ⚠️⚠️ A CONFERÊNCIA QUE REALMENTE GUARDA D-5: "requisito" ⛔ não precisa estar
   * escrito para existir. Basta UMA leitura reagir à consulta e ela vira
   * pré-condição por dentro — a decisão passaria a esperar por ela sem que
   * nenhuma frase da tela dissesse isso.
   */
  const outras = (e) =>
    JSON.stringify(D.leiturasDaSuperficieB(e).filter((x) => x.id !== "consulta_paciente_familia"));
  const cenario = reg(reg(est, "nihss_calculado", 3, rel), "t4_afasia_grave", "sim", rel);
  const valores = ["Paciente", "Família", "Paciente e família", "Não foi possível", "nao_sei"];
  confere("⛔ NENHUMA outra leitura muda com a consulta",
    valores.every((v) => outras(reg(cenario, "consulta_paciente_familia", v, rel)) === outras(cenario)),
    "uma leitura que reage à consulta a transforma em pré-condição sem dizer que é");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE B — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA SUPERFÍCIE B — ${ok}/${ok} conferências`);
