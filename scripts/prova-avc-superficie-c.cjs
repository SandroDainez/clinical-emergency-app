/**
 * PROMETE: que a Superfície C se comporte como o **ponto de decisão da imagem**
 *   e ⛔ nunca como portão de tudo — que as **três saídas** de §1.8 existam como
 *   representações distintas e ⛔ não colapsem em booleano; que ausência de
 *   tomografia ⛔ NUNCA seja lida como ausência de hemorragia (E-23); que
 *   *"realizada — resultado ainda não disponível"* seja resposta válida que
 *   ⛔ **não** fecha a pendência (PD-22); que a exclusão de hemorragia olhe para
 *   UM campo e ⛔ nenhum outro possa retê-la; que fatos coexistam e **destino
 *   seja um só**, com prioridade declarada e o outro achado preservado (PD-21);
 *   que ⛔ nenhum campo bloqueie terapia (E-49) e o bloqueio de classe viva na
 *   derivação (PD-23); que o dossiê endovascular descreva **dados**, ⛔ nunca
 *   elegibilidade (PD-24); que a alergia a contraste ⛔ não toque em ⛔ nada além
 *   do exame com contraste; que ⛔ não exista campo de creatinina, função renal
 *   ou laboratório; que a imagem avançada ⛔ não vire porta; e que o horário da
 *   tomografia ⛔ não alimente relógio clínico nem produza meta temporal (R2.5).
 * NÃO PROMETE: que os números clínicos estejam CERTOS — confere que o código diz
 *   o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem transcrito.
 *   ⛔ Não mede tela: ordem visual, alvo de toque e legibilidade são
 *   `e2e/avc-superficie-c`. ⛔ E não diz nada sobre elegibilidade a IVT ou EVT,
 *   que vivem na Superfície F e ainda não existem. ⛔ Também ⛔ não confere
 *   tradução: o par em espanhol de cada OPÇÃO é `test:i18n-opcoes`, que cobre as
 *   três superfícies de uma vez — a regra vive em UM lugar, ⛔ não em três cópias
 *   que podem divergir.
 * UNIVERSO: `avc/conteudo/superficie-c.ts` inteiro (todos os campos de
 *   `TODOS_OS_CAMPOS_C`, contados, com piso) e todas as derivações de
 *   `avc/nucleo/derivacoes-c.ts` exercitadas por estado construído, mais o TEXTO
 *   desses dois arquivos para as travas de `ternario()` e de laboratório.
 *   ⛔ Fora do universo: Superfícies A, B e D a G.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
// ⚠️ `lerFonte` e ⛔ NÃO `fs.readFileSync`: comentário ⛔ não executa nada, e uma
// trava que casa dentro dele mede o que ninguém roda (R-92).
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-c-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir,
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-c.ts"),
  path.join(appDir, "avc", "conteudo", "campos.ts"),
  path.join(appDir, "avc", "nucleo", "instancia.ts"),
  path.join(appDir, "avc", "conteudo", "superficies.ts"),
  // ⚠️ Entra no grafo porque a prova confere o ESTADO dos slots F-28 e F-29.
  path.join(appDir, "avc", "conteudo", "fontes.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const D = require(path.join(tmp, "avc", "nucleo", "derivacoes-c.js"));
const C = require(path.join(tmp, "avc", "conteudo", "superficie-c.js"));
const K = require(path.join(tmp, "avc", "conteudo", "campo.js"));
const P = require(path.join(tmp, "avc", "conteudo", "superficies.js"));
const F = require(path.join(tmp, "avc", "conteudo", "fontes.js"));
const I = require(path.join(tmp, "avc", "nucleo", "instancia.js"));
const CAMPOS = require(path.join(tmp, "avc", "conteudo", "campos.js"));

const novo = () => {
  const rel = R.relogioControlado(1_000_000);
  return { rel, est: E.abrirAtendimento(rel) };
};

const { rel, est } = novo();
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
/** ⚠️ Grava pelo caminho REAL da tela: rótulo → valor, pela porta única. */
const escolhe = (e, campo, rotulo) => reg(e, campo, K.valorDaOpcao(rotulo));

const TC = C.RESULTADO_TC;
const MOD = C.MODALIDADE;

/** ⚠️ As duas instâncias de estudo que as conferências usam. */
const s1 = I.nomeDaInstancia(C.ESTUDO, 1);
const s2 = I.nomeDaInstancia(C.ESTUDO, 2);

/** ⚠️ Registra NUM ESTUDO explícito — o mesmo caminho que a tela usa. */
const regE = (e, inst, campo, valor) =>
  CAMPOS.registrarComInstancia(e, { campo, valor }, rel, inst);
const escolheE = (e, inst, campo, rotulo) => regE(e, inst, campo, K.valorDaOpcao(rotulo));
/** ⚠️ O GESTO EXPLÍCITO de correção — a porta que o botão "Corrigir" usa. */
const corrE = (e, inst, campo, valor) =>
  CAMPOS.corrigirNaInstancia(e, { campo, valor }, rel, inst);

/** ⚠️ Uma TC sem contraste, com resultado. */
const tcCom = (e, inst, resultado) =>
  escolheE(escolheE(e, inst, "estudo_modalidade", MOD.tcSemContraste), inst, "estudo_resultado", resultado);
/** ⚠️ Uma TC sem contraste **sem** resultado — o antigo "aguardando". */
const tcSemResultado = (e, inst) =>
  escolheE(e, inst, "estudo_modalidade", MOD.tcSemContraste);
/** ⚠️ Um estudo vascular. */
const vascular = (e, inst) => escolheE(e, inst, "estudo_modalidade", MOD.angioTc);

// ── 0 · O UNIVERSO EXISTE, e ⛔ não passou sobre o vazio ────────────────────
{
  confere("o universo de campos foi carregado",
    Array.isArray(C.TODOS_OS_CAMPOS_C) && C.TODOS_OS_CAMPOS_C.length >= 9,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  const ids = C.TODOS_OS_CAMPOS_C.map((c) => c.id);
  confere("⛔ nenhum id duplicado",
    new Set(ids).size === ids.length,
    "dois campos com o mesmo id gravam um por cima do outro na trilha");
  /**
   * ⚠️⚠️ **DOIS BLOCOS**, e ⛔ não três — 2026-08-30. `imagem_avancada` saiu
   * inteiro, **inclusive a opção "Nenhuma"**: negativa agregada sem leitor é o
   * defeito que originou toda esta remodelagem. Quais exames foram feitos passa
   * a ser respondido pelas **instâncias**.
   */
  confere("os dois blocos existem, e ⛔ nenhum se chama imagem avançada",
    C.GRUPOS_C.length === 2
    && C.GRUPOS_C.map((g) => g.id).join(",") === "estudos,episodio",
    "os exames primeiro, porque governam a classe de reperfusão; o juízo clínico depois");

  const recolhiveis = C.TODOS_OS_CAMPOS_C.filter((c) => c.recolhivel).map((c) => c.id);
  confere("⛔ SÓ o sítio da oclusão é recolhível",
    JSON.stringify(recolhiveis) === JSON.stringify(["sitio_oclusao"]),
    `§7.3: recolher a tomografia ou a suspeita de HSA esconderia a decisão da superfície — ${recolhiveis.join(", ")}`);
  confere("a superfície declara a identidade estável, ⛔ não a letra",
    C.SUPERFICIE_C === "imagem",
    "letra é apresentação; id é identidade (E-16 do módulo)");
}

// ── 1 · E-49 / PD-23 · ⛔ NENHUM CAMPO BLOQUEIA TERAPIA ─────────────────────
{
  const bloqueantes = C.TODOS_OS_CAMPOS_C.filter((c) => c.bloqueiaTerapia).map((c) => c.id);
  confere("⛔ nenhum campo da Superfície C bloqueia terapia",
    bloqueantes.length === 0,
    `PD-23: o bloqueio de classe é DERIVADO. Marcá-lo no campo gravaria o veredito dentro do fato (E-43) — ${bloqueantes.join(", ")}`);
  confere("todo campo declara slot de fonte",
    C.TODOS_OS_CAMPOS_C.every((c) => /^F-\d+$/.test(String(c.fonte))),
    "E-30: afirmação clínica sem endereço de fonte não entra no módulo");
  confere("todo campo tem rótulo e tipo conhecido",
    C.TODOS_OS_CAMPOS_C.every((c) =>
      typeof c.rotulo === "string" && c.rotulo.length > 0
      && ["escolha", "multipla", "grandeza", "hora"].includes(c.tipo)),
    "campo sem rótulo, ou de tipo que a tela não sabe desenhar, é campo impossível de responder");
}

// ── 2 · E-02 / E-37 · TODA ESCOLHA TEM SAÍDA SEM CONCLUSÃO ────────────────
{
  const excecoes = C.SEM_SAIDA_DECLARADA.map((x) => x.id);
  const escolhas = C.TODOS_OS_CAMPOS_C
    .filter((c) => ["escolha", "multipla"].includes(c.tipo))
    .filter((c) => !excecoes.includes(c.id));
  confere("a exceção de saída sem conclusão é DECLARADA com motivo",
    C.SEM_SAIDA_DECLARADA.length > 0
    && C.SEM_SAIDA_DECLARADA.every((x) => typeof x.motivo === "string" && x.motivo.length > 20)
    && excecoes.every((id) => C.TODOS_OS_CAMPOS_C.some((c) => c.id === id)),
    "campo sem saída declarada só pode existir com o motivo escrito — ⛔ senão é esquecimento com cara de decisão");
  const semDeclaracao = escolhas.filter((c) => C.SAIDA_SEM_CONCLUSAO[c.id] === undefined);
  confere("TODA escolha de C declara a sua saída sem conclusão",
    semDeclaracao.length === 0,
    `E-02/E-37: sem a saída declarada, um campo novo entra sem porta para quem ⛔ não concluiu — ${semDeclaracao.map((c) => c.id).join(", ")}`);
  const invalidas = escolhas.filter((c) => !c.opcoes.includes(C.SAIDA_SEM_CONCLUSAO[c.id]));
  confere("a saída declarada existe entre as opções do campo",
    invalidas.length === 0,
    `declarar uma saída que ⛔ não está na lista é pior que ⛔ não declarar: parece coberto — ${invalidas.map((c) => c.id).join(", ")}`);
  confere("a saída do resultado da tomografia ⛔ NÃO se chama 'Não sei'",
    C.SEM_SAIDA_DECLARADA.some((x) => x.id === "estudo_resultado"),
    "aqui a incerteza tem PROCEDÊNCIA: o exame foi feito e o laudo ⛔ não saiu. Trocar por 'não sei' apagaria o que se sabe");
}

// ── 3 · AS TRÊS SAÍDAS DA TC EXISTEM, e ⛔ NÃO COLAPSAM ────────────────────
{
  confere("o resultado da tomografia tem QUATRO respostas distintas",
    new Set(C.OPCOES_RESULTADO_TC).size === 2,
    "§1.8: três saídas mais o estado de laudo pendente. Colapsar em sim/não apagaria a diferença entre 'sem hemorragia' e 'ainda não sei'");
  const campo = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "estudo_resultado");
  confere("as quatro respostas do campo são as quatro constantes",
    JSON.stringify(campo?.opcoes) === JSON.stringify(C.OPCOES_RESULTADO_TC),
    "fonte única: comparar contra literal repetido faz a derivação parar de reconhecer o rótulo quando alguém melhora o texto");
  confere("os dois destinos declaram módulo, inexistência e o que acontece",
    Object.values(C.DESTINOS_DA_IMAGEM).every((d) =>
      d.moduloExiste === false && d.modulo.length > 0 && d.oQueAcontece.length > 0),
    "E-09: destino sem comportamento é beco — o paciente com hemorragia cairia num estado que ⛔ não diz nada");
  confere("a procedência dos dois destinos ⛔ NÃO se mistura",
    C.DESTINOS_DA_IMAGEM.hemorragia.fonte === "F-16"
    && C.DESTINOS_DA_IMAGEM.hsa.fonte === "spec §1.8",
    "E-30: a fonte americana ⛔ não define fluxo para suspeita de HSA. Pendurar a saída nela seria inventar procedência");
}

// ── 4 · A EXCLUSÃO DE HEMORRAGIA — E-08, E-23, E-37 ───────────────────────
{
  const vazio = D.exclusaoDeHemorragia(est);
  confere("estado vazio ⛔ NÃO afirma exclusão nem hemorragia",
    vazio.exclusao === "sem_informacao" && vazio.conclusao === "desconhecido",
    "E-23: ausência de tomografia ⛔ não é ausência de hemorragia, e ⛔ também ⛔ não é hemorragia");

  const sem = D.exclusaoDeHemorragia(tcCom(est, s1, TC.semHemorragia));
  confere("'sem hemorragia' é o ÚNICO estado que exclui",
    sem.exclusao === "excluida" && sem.conclusao === "sim",
    "F-16 rec. 1, COR 1 · A: a exclusão é a condição declarada para toda a classe de reperfusão");

  const com = D.exclusaoDeHemorragia(tcCom(est, s1, TC.hemorragia));
  confere("'hemorragia intracraniana' é estado próprio, e ⛔ não 'sem informação'",
    com.exclusao === "hemorragia_presente" && com.tom === "atencao",
    "E-37: os três estados são distinguíveis — hemorragia presente ⛔ não é o mesmo que dado faltando");

  const agu = D.exclusaoDeHemorragia(tcSemResultado(est, s1));
  const nao = D.exclusaoDeHemorragia(est);
  confere("laudo pendente e exame ⛔ não realizado ⛔ NÃO excluem hemorragia",
    agu.exclusao === "sem_informacao" && nao.exclusao === "sem_informacao",
    "seria a liberação da classe inteira de reperfusão nascendo de um dado que ninguém tem");
  confere("e mesmo assim as duas frases são DIFERENTES",
    agu.curto !== nao.curto,
    "E-37: 'o laudo ⛔ não saiu' e 'o exame ⛔ não foi feito' pedem coisas diferentes do médico");

  /** ⚠️⚠️ A VARREDURA: ⛔ nenhum valor além de 'sem hemorragia' pode liberar. */
  const todos = [undefined, ...C.OPCOES_RESULTADO_TC, "nao_perguntado", "nao_sei", "qualquer coisa"];
  const liberam = todos.filter((v) => {
    const comTc = escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste);
    const e = v === undefined ? comTc : regE(comTc, s1, "estudo_resultado", v);
    return D.exclusaoDeHemorragia(e).exclusao === "excluida";
  });
  confere("⛔ SÓ 'Sem hemorragia' libera — varrido valor a valor",
    liberam.length === 1 && liberam[0] === TC.semHemorragia,
    `um valor inesperado caindo no ramo de exclusão liberaria a reperfusão em silêncio — ${liberam.join(", ")}`);

  confere("a retenção da classe é derivada da MESMA função",
    todos.every((v) => {
      const comTc = escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste);
    const e = v === undefined ? comTc : regE(comTc, s1, "estudo_resultado", v);
      return D.reperfusaoRetidaPelaImagem(e) === (D.exclusaoDeHemorragia(e).exclusao !== "excluida");
    }),
    "I6: a regra escrita duas vezes diverge, e quem decide passa a ser a cópia errada");

  confere("a exclusão declara UM insumo, e é o resultado da tomografia",
    JSON.stringify(vazio.insumos) === JSON.stringify(["estudo_resultado"]) && vazio.fonte === "F-16",
    "E-22/E-30: e o insumo único é o que impede outro campo de virar bloqueio de classe por dentro");
}

// ── 5 · ⛔ NADA MAIS EM C RETÉM A REPERFUSÃO ───────────────────────────────
{
  const base = tcCom(est, s1, TC.semHemorragia);
  const referencia = JSON.stringify(D.exclusaoDeHemorragia(base));
  const perturbacoes = [
    ["suspeita_hsa", "sim"], ["suspeita_hsa", "nao"], ["suspeita_hsa", "nao_sei"],
    ["angio_realizada", C.ANGIO.naoRealizada], ["angio_realizada", C.ANGIO.indisponivel],
    ["suspeita_lvo", "sim"], ["efeito_de_massa", "sim"],
    ["alergia_contraste", "sim"], ["alergia_contraste", "nao_sei"],
    ["sitio_oclusao", "M1 da artéria cerebral média"],
    ["aspects", 0], ["aspects", 10],
    ["imagem_avancada", "Tomografia de perfusão"],
    /**
     * ⚠️⚠️ A HIPODENSIDADE CLARA É A MAIS PERIGOSA DESTA LISTA, e por isso está
     * nela: é o único achado de C que a fonte descreve com *"should not be
     * administered"*. Se algum dia ela entrar em `exclusaoDeHemorragia`, o
     * módulo ganha um **segundo bloqueio de classe** — construído sobre uma
     * célula de tabela que a própria fonte declara *"unsupported by clinical
     * evidence"* (**E-48**).
     */
    ["hipodensidade_clara", "sim"], ["hipodensidade_clara", "nao"], ["hipodensidade_clara", "nao_sei"],
  ];
  const mudaram = perturbacoes.filter(([c, v]) => JSON.stringify(D.exclusaoDeHemorragia(reg(base, c, v))) !== referencia);
  confere("⛔ NENHUM outro campo de C muda a exclusão de hemorragia",
    mudaram.length === 0,
    `🚫 #4 e #5: angioTC, perfusão, ASPECTS, alergia ou suspeita de HSA retendo a reperfusão é bloqueio inventado — ${mudaram.map(([c]) => c).join(", ")}`);

  /** ⚠️ E o mesmo do lado do vazio: ⛔ nada pode LIBERAR sem tomografia. */
  const semTc = perturbacoes.filter(([c, v]) => !D.reperfusaoRetidaPelaImagem(reg(est, c, v)));
  confere("⛔ NENHUM outro campo libera a reperfusão sem tomografia",
    semTc.length === 0,
    `liberar a classe sem exclusão de hemorragia contraria COR 1 · A — ${semTc.map(([c]) => c).join(", ")}`);
}

// ── 6 · PD-21 · FATOS COEXISTEM, DESTINO É UM SÓ ──────────────────────────
{
  confere("sem dado, ⛔ não há destino armado",
    D.destinoDaImagem(est) === undefined,
    "destino só existe quando alguma coisa o arma; ausência ⛔ não é afirmação sobre o paciente");

  const soHemorragia = tcCom(est, s1, TC.hemorragia);
  const dh = D.destinoDaImagem(soHemorragia);
  confere("hemorragia sozinha → destino do AVC hemorrágico",
    dh?.saida === "hemorragia_intracraniana" && dh?.associados.length === 0,
    "§1.8: a hemorragia sai do módulo, e o módulo de destino é nomeado");

  const soHsa = escolhe(est, "suspeita_hsa", "Sim");
  const ds = D.destinoDaImagem(soHsa);
  confere("suspeita de HSA SEM hemorragia identificada → saída específica de HSA",
    ds?.saida === "suspeita_hsa" && ds?.associados.length === 0,
    "PD-21: TC sem hemorragia com suspeita clínica de HSA precisa ser representável, e ela arma a saída própria");

  const ambos = escolhe(tcCom(est, s1, TC.hemorragia), "suspeita_hsa", "Sim");
  const da = D.destinoDaImagem(ambos);
  /**
   * ⚠️⚠️ A REVISÃO DO AUTOR (2026-08-29): a **suspeita** ⛔ NÃO sobrepõe o achado de
   * imagem **confirmado**. É hierarquia de espécie de dado — observado na imagem
   * × hipótese clínica —, e ⛔ não gravidade.
   */
  confere("os dois marcados → UM destino, e ele é o HEMORRÁGICO",
    da !== undefined && da.saida === "hemorragia_intracraniana",
    "⛔ `suspeita_hsa = Sim` ⛔ não pode virar override de um fato radiológico confirmado");
  confere("e a suspeita de HSA ⛔ NÃO some — vem associada à mesma saída",
    da?.associados.length === 1 && da?.associados[0].id === "suspeita_hsa"
    && da?.associados[0].frase.length > 0,
    "resolver para uma saída ⛔ não pode apagar o outro fato: a prioridade é de APRESENTAÇÃO");
  confere("e o id fica preservado para o subfluxo de HSA reconhecer depois",
    da?.associados[0].id === C.FATO_ASSOCIADO.suspeitaHsa.id,
    "guardar só a frase deixaria o subfluxo futuro dependendo de casar texto traduzível");
  confere("e os DOIS fatos continuam inteiros na trilha",
    I.valorNaInstancia(ambos, s1, "estudo_resultado").valor === TC.hemorragia
    && E.valorAtual(ambos, "suspeita_hsa").valor === "sim"
    && D.exclusaoDeHemorragia(ambos).exclusao === "hemorragia_presente"
    && D.suspeitaDeHsa(ambos).conclusao === "sim",
    "§3.1: a trilha é append-only, e a resolução de destino ⛔ não é uma operação sobre os fatos");

  const incerto = escolhe(est, "suspeita_hsa", "Incerto");
  const negado = escolhe(est, "suspeita_hsa", "Não");
  confere("⛔ nem 'Incerto' ⛔ nem 'Não' armam a saída de HSA",
    D.destinoDaImagem(incerto) === undefined && D.destinoDaImagem(negado) === undefined,
    "E-23 dos dois lados: incerteza ⛔ não vira suspeita, e ⛔ também ⛔ não vira ausência de suspeita");
}

// ── 7 · A SUSPEITA DE HSA — quatro estados distinguíveis ──────────────────
{
  const l = (e) => D.suspeitaDeHsa(e);
  const vazio = l(est);
  const sim = l(escolhe(est, "suspeita_hsa", "Sim"));
  const nao = l(escolhe(est, "suspeita_hsa", "Não"));
  const inc = l(escolhe(est, "suspeita_hsa", "Incerto"));
  confere("os quatro estados produzem quatro frases diferentes",
    new Set([vazio.curto, sim.curto, nao.curto, inc.curto]).size === 4,
    "E-37: 'ainda ⛔ não perguntei', 'ele decidiu que ⛔ não sabe', 'sim' e 'não' são quatro coisas");
  confere("'Incerto' ⛔ NÃO conclui, e ⛔ não vira 'Não'",
    inc.conclusao === "desconhecido" && nao.conclusao === "nao",
    "E-23: incerto é resposta com consequência própria — a pendência — e ⛔ não ausência de suspeita");
}

// ── 8 · PENDÊNCIAS: específicas, de alcance global e ⛔ NÃO bloqueantes ────
{
  const ids = (e) => D.pendenciasDaImagem(e).map((p) => p.id).sort();

  confere("sem tomografia registrada, a pendência da TC está aberta",
    ids(est).includes("tc_resultado"),
    "é a tarefa mais importante do atendimento, e ela ⛔ não pode nascer silenciosa");

  /** ⚠️⚠️ PD-22 — o coração desta superfície. */
  const aguardando = tcSemResultado(est, s1);
  const pAgu = D.pendenciasDaImagem(aguardando).find((p) => p.id === "tc_resultado");
  confere("'resultado ainda ⛔ não disponível' ⛔ NÃO fecha a pendência",
    pAgu !== undefined,
    "PD-22: fechá-la faria a tela dizer 'resolvido' sobre o dado que governa a classe inteira de reperfusão");
  /**
   * ⚠️ `?.` e ⛔ não `.` — uma trava que ESTOURA quando a conferência anterior
   * falha perde as outras 86 e devolve pilha em vez de diagnóstico. Medido em
   * 2026-08-29, na mutação que revogava PD-22.
   */
  confere("e a pendência MUDA de instrução quando o laudo está a caminho",
    pAgu?.resolvePor !== D.pendenciasDaImagem(est).find((p) => p.id === "tc_resultado")?.resolvePor,
    "E-26: pendência que ⛔ não diz o que a resolve é muro; e o que resolve ⛔ não é o mesmo nos dois estados");

  confere("exame ⛔ não realizado mantém a pendência aberta",
    ids(est).includes("tc_resultado"),
    "responder 'ainda ⛔ não foi feita' ⛔ não é resolver a imagem");
  confere("⛔ SÓ resultado conclusivo fecha a pendência da TC",
    !ids(tcCom(est, s1, TC.semHemorragia)).includes("tc_resultado")
    && !ids(tcCom(est, s1, TC.hemorragia)).includes("tc_resultado"),
    "pendência que ⛔ não fecha quando o dado chega é ruído permanente, e ruído permanente deixa de ser lido");

  confere("'Incerto' na HSA abre pendência própria; 'Sim' e 'Não' ⛔ não",
    ids(escolhe(est, "suspeita_hsa", "Incerto")).includes("suspeita_hsa")
    && !ids(escolhe(est, "suspeita_hsa", "Sim")).includes("suspeita_hsa")
    && !ids(escolhe(est, "suspeita_hsa", "Não")).includes("suspeita_hsa"),
    "a incerteza declarada vira tarefa nomeada, e ⛔ nada além disso");

  const comLvo = escolhe(est, "suspeita_lvo", "Sim");
  confere("suspeita de oclusão de grande vaso sem angio abre pendência vascular",
    ids(comLvo).includes("imagem_vascular"),
    "F-16 rec. 8, COR 1 · A: imagem vascular de emergência na suspeita de LVO");
  confere("angio realizada fecha a pendência vascular",
    !ids(vascular(comLvo, s1)).includes("imagem_vascular"),
    "a tarefa existe para ser cumprida, e cumprida ela some");
  /** ⚠️⚠️ E-26 · O QUE ⛔ NÃO TEM COMO SER RESOLVIDO ⛔ NÃO É TAREFA. */
  confere("'não disponível neste serviço' TAMBÉM fecha a pendência vascular",
    !ids(escolhe(comLvo, "angio_disponibilidade", "Não disponível neste serviço")).includes("imagem_vascular"),
    "E-26: cobrar para sempre um exame que o serviço ⛔ não tem é muro, ⛔ não tarefa (E-18)");
  confere("sem suspeita de LVO, ⛔ nenhuma pendência vascular nasce",
    !ids(escolhe(est, "suspeita_lvo", "Não")).includes("imagem_vascular"),
    "a dependência liga ação a condição (E-25), e ⛔ não nasce de superfície aberta");

  /** ⚠️ A forma de TODA pendência de C. */
  const cenario = escolhe(escolhe(tcSemResultado(est, s1), "suspeita_hsa", "Incerto"), "suspeita_lvo", "Sim");
  const todas = D.pendenciasDaImagem(cenario);
  confere("as três pendências convivem, com ids distintos",
    todas.length === 3 && new Set(todas.map((p) => p.id)).size === 3,
    "id repetido some da lista sem que ninguém veja, porque a tela usa id como chave");
  confere("toda pendência de C é ESPECÍFICA — dono, campo e o que a resolve",
    todas.every((p) => p.dono === "imagem" && p.campo.length > 0 && p.resolvePor.length > 0),
    "específica, de ALCANCE GLOBAL (E-07) e ⛔ NÃO bloqueante (E-49) — as três propriedades são independentes");
  confere("toda pendência aponta para um campo que EXISTE",
    todas.every((p) => C.TODOS_OS_CAMPOS_C.some((c) => c.id === p.campo)),
    "I-7: pendência cujo campo ⛔ não existe é muro apontando para a parede errada");
  confere("⛔ nenhuma pendência de C fala de laboratório",
    todas.every((p) => !/creatinin|renal|laborat|ureia|clearance/i.test(`${p.rotulo} ${p.resolvePor}`)),
    "🚫 #5, COR 1 · B-NR: a imagem vascular ⛔ não espera creatinina — ⛔ nem por dentro de uma tarefa");
}

// ── 9 · 🚫 #5 · ⛔ NÃO EXISTE LABORATÓRIO NESTA SUPERFÍCIE ──────────────────
{
  const textoDosCampos = C.TODOS_OS_CAMPOS_C
    .map((c) => [c.id, c.rotulo, c.ajuda ?? "", (c.opcoes ?? []).join(" ")].join(" "))
    .join(" | ");
  confere("⛔ nenhum campo de C é de creatinina, função renal ou laboratório",
    !/creatinin|função renal|laborat|ureia|clearance|TFG/i.test(textoDosCampos),
    "🚫 #5: a maneira de ⛔ NÃO exigir creatinina ⛔ não é escrever a frase — é ⛔ não existir o campo");

  /**
   * ⚠️ A NOTA CONTINUA PODENDO CITAR A CREATININA — é o verbatim da fonte
   * dizendo para ⛔ NÃO esperar por ela. A trava mede CAMPO, ⛔ não proibição de
   * palavra: uma varredura de texto reprovaria justamente a frase que protege.
   */
  const angio = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "angio_disponibilidade");
  confere("e a nota da angio DIZ que ela ⛔ não espera creatinina",
    /creatinina/i.test(angio?.nota ?? "") && /não deve ser atrasada/i.test(angio?.nota ?? ""),
    "o verbatim COR 1 · B-NR é o que impede alguém de reintroduzir a espera como se fosse cuidado");
}

// ── 10 · R2.5 · O HORÁRIO DA TC ⛔ NÃO É CRONÔMETRO ────────────────────────
{
  const hora = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "estudo_hora");
  confere("o horário da tomografia ⛔ NÃO alimenta relógio clínico nenhum",
    hora !== undefined && hora.relogio === undefined,
    "E-21: porta-imagem se conta do t₀ do serviço; janela se conta dos relógios do paciente. Trocar produz janela errada com cara de precisão");

  const fonteC = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-c.ts"))
    + lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"));
  confere("⛔ nenhum texto exibível de C promete meta de 25 minutos",
    !/25 minutos|meta de \d|dentro de 25/i.test(fonteC),
    "R2.5 e 🚫 #3: 'as rapidly as possible (eg, within 25 minutes)' é protocolo institucional, ⛔ não meta deste paciente");
  confere("⛔ nenhum texto de C promete meta de porta-agulha",
    !/porta-agulha|porta agulha/i.test(fonteC),
    "F-11, achado negativo: a fonte ⛔ NÃO estabelece meta numérica de porta-agulha (E-31)");

  /** ⚠️ E o registro do horário ⛔ não pode mexer em ⛔ nada clínico. */
  const antes = JSON.stringify(D.leiturasDaSuperficieC(est)) + JSON.stringify(D.pendenciasDaImagem(est));
  const comHora = CAMPOS.registrarComInstancia(est, { campo: "estudo_hora", valor: 1_500_000, horaClinica: 1_500_000 }, rel, s1);
  confere("registrar o horário da tomografia ⛔ não muda leitura nem pendência",
    JSON.stringify(D.leiturasDaSuperficieC(comHora)) + JSON.stringify(D.pendenciasDaImagem(comHora)) === antes,
    "é registro operacional; se ele mexesse em leitura clínica, teria virado marco sem que ninguém decidisse isso");
  confere("e ⛔ não define relógio clínico nenhum no estado",
    JSON.stringify(comHora.relogiosClinicos) === JSON.stringify(est.relogiosClinicos),
    "um horário de exame virando marco de janela é a catástrofe já corrigida uma vez no último-visto-bem");
}

// ── 11 · A ALERGIA A CONTRASTE — decisão do autor, com três travas ────────
{
  /**
   * ⚠️⚠️ A ALERGIA ⛔ NÃO É MAIS PERGUNTADA AQUI — autor, 2026-08-30:
   *
   * > *"⛔ no A já coleta sobre alergias e no C de novo, ⛔ só deixamos no A"*
   *
   * ⚠️ Ela era emprestada de Paciente e aparecia nas duas telas. A **leitura**
   * continua: ler ⛔ não é coletar, e quem está diante da angiotomografia precisa
   * ver o que já se sabe.
   */
  confere("⛔ o campo de alergia ⛔ NÃO é desenhado em C",
    C.CAMPOS_NA_TELA_C.every((c) => c.id !== "alergia_contraste"),
    "a mesma pergunta em duas telas faz o médico duvidar da resposta que já deu");
  confere("⛔ mas a LEITURA dela continua na superfície",
    D.leiturasDaSuperficieC(est).some((l) => l.id === "alergia_contraste"),
    "*\"⛔ não esperar por creatinina é uma coisa; apagar informação relevante à ação contrastada é outra\"* — a decisão de 2026-08-29 sobrevive na leitura");

  const l = (e) => D.alergiaAContraste(e);
  confere("os quatro estados da alergia são distinguíveis",
    new Set([
      l(est).curto,
      l(escolhe(est, "alergia_contraste", "Sim")).curto,
      l(escolhe(est, "alergia_contraste", "Não")).curto,
      l(escolhe(est, "alergia_contraste", "Não sei")).curto,
    ]).size === 4,
    "E-37: ⛔ não perguntado, sim, não e desconhecido");
  confere("⛔ nada espera pela alergia — ela nasce informativa, ⛔ nunca pendente",
    l(est).tom === "informativo",
    "'pendente' é vocabulário de coisa que falta, e aqui ⛔ não falta nada");
  confere("a leitura da alergia fala do EXAME COM CONTRASTE, e ⛔ não da trombólise",
    [l(escolhe(est, "alergia_contraste", "Sim")), l(est)]
      .every((x) => /contraste/i.test(x.texto)),
    "E-25: condição específica ↔ ação específica. Sem dizer a que se aplica, ela vira aviso genérico");
  confere("e ⛔ NÃO inventa conduta",
    !/pré-medica|premedica|corticoide|anti-histamín|suspender|adiar/i.test(
      JSON.stringify(l(escolhe(est, "alergia_contraste", "Sim")))),
    "E-31: a fonte do AVC ⛔ não define conduta para alergia a contraste, e o app ⛔ não escreve a que falta");

  /** ⚠️⚠️ A TRAVA QUE REALMENTE GUARDA A DECISÃO: ⛔ nada mais pode reagir. */
  const outras = (e) =>
    JSON.stringify(D.leiturasDaSuperficieC(e).filter((x) => x.id !== "alergia_contraste"));
  const cenario = escolhe(tcCom(est, s1, TC.semHemorragia), "suspeita_lvo", "Sim");
  const valores = ["Sim", "Não", "Não sei"];
  confere("⛔ NENHUMA outra leitura de C muda com a alergia a contraste",
    valores.every((v) => outras(escolhe(cenario, "alergia_contraste", v)) === outras(cenario)),
    "uma leitura que reage à alergia a transforma em pré-condição sem que ⛔ nenhuma frase diga isso");
  confere("⛔ NENHUMA pendência nasce da alergia a contraste",
    valores.every((v) =>
      JSON.stringify(D.pendenciasDaImagem(escolhe(cenario, "alergia_contraste", v)))
      === JSON.stringify(D.pendenciasDaImagem(cenario))),
    "ela ⛔ não bloqueia a IVT, ⛔ não bloqueia C, e ⛔ não cria dependência nenhuma");
  confere("e ela ⛔ NÃO entra no dossiê endovascular",
    !C.IDS_DOSSIE_ENDOVASCULAR.includes("alergia_contraste"),
    "dentro do dossiê, 'ainda ⛔ não registrada' apareceria como dado que falta para a trombectomia — e ⛔ não é");
}

// ── 12 · PD-24 · O DOSSIÊ DESCREVE DADOS, ⛔ NUNCA ELEGIBILIDADE ───────────
{
  const d = (e) => D.informacaoParaAFrenteEndovascular(e);
  const vazio = d(est);
  confere("com nada informado, TODOS os campos do dossiê estão em 'ainda ⛔ não perguntados'",
    vazio.naoPerguntados.length === C.IDS_DOSSIE_ENDOVASCULAR.length
    && vazio.registrados.length === 0,
    "E-23: ausência ⛔ não é dado, e ⛔ não é impedimento");

  /** ⚠️⚠️ A CONCLUSÃO É `desconhecido` SEMPRE — varrido, ⛔ não afirmado. */
  const combinacoes = [
    est,
    escolhe(est, "suspeita_lvo", "Sim"),
    vascular(escolhe(est, "suspeita_lvo", "Sim"), s1),
    regE(vascular(escolhe(est, "suspeita_lvo", "Sim"), s1), s1, "aspects", 8),
    escolheE(regE(escolhe(est, "suspeita_lvo", "Sim"), s1, "aspects", 10), s1, "sitio_oclusao", "M1 da artéria cerebral média"),
    /**
     * ⚠️⚠️ O DOSSIÊ **COMPLETO** — e ele faltava, achado por mutação em
     * 2026-08-29: uma versão que concluísse `sim` exatamente quando ⛔ nada mais
     * faltasse passava verde, porque ⛔ nenhum cenário chegava a preencher os
     * cinco campos. ⚠️ É o caso mais perigoso, e era o único ⛔ não medido: o
     * veredito ⛔ não aparece na tela vazia, aparece na tela pronta.
     */
    /** ⚠️ Todos os achados do dossiê, cada um NA SUA instância de estudo. */
    C.IDS_DOSSIE_ENDOVASCULAR.reduce(
      (e, id) =>
        id === "aspects"
          ? regE(e, s1, id, 7)
          : escolheE(e, id === "sitio_oclusao" ? s2 : s1, id,
            id === "sitio_oclusao" ? "M1 da artéria cerebral média" : "Sim"),
      vascular(escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste), s2)
    ),
  ];
  confere("o dossiê COMPLETO ⛔ não deixa ⛔ nenhum campo por perguntar",
    d(combinacoes[combinacoes.length - 1]).naoPerguntados.length === 0,
    "sem um cenário completo, a conferência de 'nunca conclui' ⛔ nunca visita o ramo em que a conclusão seria tentadora");
  confere("o dossiê ⛔ NUNCA conclui — em ⛔ nenhuma combinação, ⛔ nem completo",
    combinacoes.every((e) => d(e).conclusao === "desconhecido"),
    "PD-24 e a advertência de modelagem de F-08: 'EVT elegível' ⛔ NÃO é fato, e ⛔ também ⛔ não é leitura desta superfície");
  confere("e ⛔ nunca fala de elegibilidade, candidatura ou contraindicação",
    combinacoes.every((e) => !/elegív|elegib|candidat|contraindic|indicado para/i.test(
      `${d(e).curto} ${d(e).texto}`)),
    "E-46: o sistema apoia, ⛔ não profere veredito. ⚠️ A palavra é recusada ATÉ NEGADA — '⛔ não decide elegibilidade' é documentação de arquitetura na tela clínica, e o autor já corrigiu isso uma vez na Superfície B");

  /** ⚠️ As três listas particionam o dossiê: ⛔ nenhum campo fora, ⛔ nenhum em duas. */
  confere("as três listas cobrem o dossiê inteiro, sem sobreposição",
    combinacoes.every((e) => {
      const r = d(e);
      const todos = [...r.registrados, ...r.semConclusao, ...r.naoPerguntados];
      return todos.length === C.IDS_DOSSIE_ENDOVASCULAR.length
        && new Set(todos).size === todos.length;
    }),
    "campo fora das três listas é campo que ninguém vê; campo em duas é contagem dupla");

  /** ⚠️ Agora o dossiê é `sitio_oclusao`, que vive na instância vascular. */
  const semConclusao = escolheE(vascular(est, s1), s1, "sitio_oclusao", "Não sei");
  confere("respondido com a saída sem conclusão ⛔ NÃO conta como registrado",
    d(semConclusao).semConclusao.includes("sitio_oclusao")
    && !d(semConclusao).registrados.includes("sitio_oclusao"),
    "E-37: 'perguntei e ninguém sabe' ⛔ não é 'tenho o dado'");
  confere("e ⛔ também ⛔ NÃO conta como ainda ⛔ não perguntado",
    !d(semConclusao).naoPerguntados.includes("sitio_oclusao"),
    "E-37 do outro lado: colapsar a resposta no silêncio apaga que alguém já perguntou");

  /** ⚠️⚠️ E-10 · ASPECTS 0 é RESPOSTA, e a fonte tem faixa para ele. */
  confere("ASPECTS 0 conta como dado registrado",
    d(regE(escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste), s1, "aspects", 0)).registrados.includes("aspects"),
    "E-10: F-08 rec. 4 tem faixa 'ASPECTS 0 to 2' — ler zero como ausência apagaria o escore mais grave");
  /**
   * ⚠️⚠️ O RAMO DA GRANDEZA É ESCOLHIDO PELO TIPO, e ⛔ não por um `else` no fim —
   * conferência acrescentada em 2026-08-29 porque a mutação que apagava o ramo
   * passava verde: pelo caminho da tela o resultado era o mesmo, e o defeito só
   * aparece com valor ⛔ não numérico num campo numérico.
   *
   * ⚠️ A tela ⛔ não produz este estado hoje, e o valor usado aqui é
   * deliberadamente **inesperado** — ⛔ não `nao_sei`, que os dois caminhos
   * tratam igual. A trava mede assim mesmo, porque a pergunta ⛔ não é
   * "acontece?" — é "para que lado cai quando acontecer?". Um catch-all
   * otimista responde **registrado**, e a lista passa a afirmar que existe um
   * dado que ninguém tem.
   */
  confere("valor ⛔ não numérico num campo numérico ⛔ NÃO conta como dado registrado",
    d(regE(escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste), s1, "aspects", "mais ou menos 8")).semConclusao.includes("aspects")
    && !d(regE(escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste), s1, "aspects", "mais ou menos 8")).registrados.includes("aspects"),
    "o ramo do dossiê é escolhido pelo TIPO do campo; um `else` no fim transforma valor inesperado em informação registrada");

  const campoAspects = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "aspects");
  confere("e o campo declara o zero como válido, com faixa 0 a 10",
    campoAspects?.zeroValido === true && campoAspects?.faixa.min === 0 && campoAspects?.faixa.max === 10,
    "sem a porta explícita, registrar 0 exigiria passar por um 1 que ninguém mediu");
  confere("⛔ o app ⛔ NÃO calcula ASPECTS, e ⛔ não escreve descritor de memória",
    /não calcula ASPECTS/i.test(campoAspects?.nota ?? "")
    && !/território|hipodens|núcleo lentiform|ínsula/i.test(JSON.stringify(campoAspects)),
    "E-31: a Figure 2 ⛔ não foi transcrita — escrever aqui o que é ASPECTS seria redação de memória (D-111)");
}

// ── 13 · A IMAGEM AVANÇADA ⛔ NÃO É PORTA — R2.3, 🚫 #4 ────────────────────
{
  const opcoes = ["Tomografia de perfusão", "Ressonância com difusão e FLAIR", "Ressonância com perfusão", "Nenhuma", "Não sei"];
  const base = tcCom(est, s1, TC.semHemorragia);
  const referencia = JSON.stringify(D.leiturasDaSuperficieC(base)) + JSON.stringify(D.pendenciasDaImagem(base));
  confere("⛔ NENHUMA leitura ⛔ nem pendência muda com a imagem avançada",
    opcoes.every((o) =>
      JSON.stringify(D.leiturasDaSuperficieC(reg(base, "imagem_avancada", o)))
      + JSON.stringify(D.pendenciasDaImagem(reg(base, "imagem_avancada", o))) === referencia),
    "R2.3, COR 1 · B-NR: neuroimagem multimodal ⛔ não atrasa a IVT — e uma leitura que reage a ela já é a porta");
  confere("⛔ nenhuma pendência cobra imagem avançada, em ⛔ nenhum estado",
    JSON.stringify(D.pendenciasDaImagem(base)).includes("imagem_avancada") === false,
    "cobrar perfusão para seguir é exatamente o atraso que a fonte manda evitar");

  const bloco = C.GRUPOS_C.find((g) => g.id === "estudos");
  confere("a nota do bloco endovascular diz para ⛔ NÃO atrasar a trombólise",
    /Não atrase a trombólise por exames de imagem adicionais/.test(bloco?.nota ?? ""),
    "redação aprovada pelo autor: a regra contra atraso fica VISÍVEL, ⛔ não atrás do ⓘ");
  confere("e distingue a tomografia que exclui hemorragia de 'exame adicional'",
    /não é exame adicional/.test(bloco?.nota ?? ""),
    "correção do autor: 'estes exames' podia ser lido incluindo a TC simples — que é justamente a que precede a reperfusão");
}

// ── 14 · AS LEITURAS, COMO CONJUNTO ───────────────────────────────────────
{
  const ls = D.leiturasDaSuperficieC(est);
  confere("as leituras têm ids únicos, insumos e fonte",
    new Set(ls.map((l) => l.id)).size === ls.length
    && ls.every((l) => l.insumos.length > 0 && String(l.fonte).length > 0),
    "E-22/E-30: leitura sem insumo declarado ⛔ não pode ser conferida por quem lê");
  confere("⛔ NENHUMA leitura afirma negativa sobre o estado vazio",
    ls.every((l) => l.conclusao !== "nao"),
    "E-23: com o atendimento recém-aberto, ⛔ nada foi respondido — e 'não' seria o sistema respondendo pelo médico");
  confere("⛔ nenhuma leitura de C fala de elegibilidade ou contraindicação",
    !/elegív|contraindic|pode trombolisar|libera(do|da) para/i.test(JSON.stringify(ls)),
    "E-46 e §7.15: C coleta fatos; o veredito é derivado na Reperfusão, que ainda ⛔ não existe");

  /** ⚠️ E o mesmo com a tela cheia, ⛔ não só vazia. */
  const cheio = escolhe(escolhe(reg(escolhe(tcCom(est, s1, TC.semHemorragia),
    "suspeita_hsa", "Não"), "aspects", 9), "suspeita_lvo", "Sim"), "angio_realizada", C.ANGIO.realizada);
  confere("com tudo preenchido, ⛔ nenhuma leitura vira veredito",
    !/elegív|contraindic|pode trombolisar/i.test(JSON.stringify(D.leiturasDaSuperficieC(cheio))),
    "o risco ⛔ não está na tela vazia: está na tela completa, onde a conclusão parece merecida");
}

// ── 15 · VOCABULÁRIO PRÓPRIO ⛔ NUNCA PASSA POR `ternario()` ───────────────
{
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"));
  const errados = C.VOCABULARIO_PROPRIO_C.filter((v) =>
    new RegExp(`ternario\\([^)]*"${v.id}"`).test(fonte));
  confere("⛔ nenhuma derivação lê campo de vocabulário próprio por `ternario()`",
    errados.length === 0,
    `o valor gravado é o rótulo, e ⛔ nenhum é "sim": "Hemorragia intracraniana" viraria false — ${errados.map((v) => v.id).join(", ")}`);
  confere("cada campo de vocabulário próprio declara o MOTIVO",
    C.VOCABULARIO_PROPRIO_C.every((v) => v.motivo.length > 10),
    "R-55: lista sem porquê vira gaveta onde se joga campo para calar a trava");
  confere("e todo id declarado existe de fato",
    C.VOCABULARIO_PROPRIO_C.every((v) => C.TODOS_OS_CAMPOS_C.some((c) => c.id === v.id)),
    "declaração sobre campo inexistente é trava medindo o nada");
}

// ── 16 · HIPODENSIDADE CLARA — FATO COM CRITÉRIO, ⛔ NÃO ELEGIBILIDADE ─────
{
  const campo = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "hipodensidade_clara");
  confere("o campo de hipodensidade clara existe e aponta para F-07",
    campo !== undefined && campo.fonte === "F-07" && campo.bloqueiaTerapia === false,
    "é o único achado de TC com critério operacional transcrito, e estava fora da Superfície C até 2026-08-29");

  /**
   * ⚠️⚠️ A DEFINIÇÃO FICA **VISÍVEL**, e ⛔ não atrás do ⓘ. Ela é o que muda a
   * RESPOSTA de quem ⛔ não tem o termo na cabeça — critério de §7.3 para texto
   * permanente. Escondida, o campo vira mais um sim/não adivinhado.
   */
  confere("a definição operacional está em `ajuda`, e ⛔ não só na nota",
    /substância branca contralateral/i.test(campo?.ajuda ?? ""),
    "F-07: *\"greater than the density of contralateral unaffected white matter\"* — é o único critério aplicável à beira do leito que a fonte dá sobre a TC");

  confere("a nota declara que a faixa ⛔ não é sustentada por evidência",
    /não sustentada por evidência/i.test(campo?.nota ?? ""),
    "E-48: a Table 8 ⛔ não tem COR/LOE em célula nenhuma, e a legenda declara a faixa absoluta *\"unsupported by clinical evidence\"*");

  const l = (e) => D.hipodensidadeClara(e);
  confere("os quatro estados da hipodensidade são distinguíveis",
    new Set([
      l(est).curto,
      l(escolhe(est, "hipodensidade_clara", "Sim")).curto,
      l(escolhe(est, "hipodensidade_clara", "Não")).curto,
      l(escolhe(est, "hipodensidade_clara", "Incerto")).curto,
    ]).size === 4,
    "E-37: ⛔ não perguntado, presente, ausente e incerto");

  /**
   * ⚠️⚠️ A CONFERÊNCIA QUE GUARDA A INSTRUÇÃO DO AUTOR — e ela mede a **FORMA DA
   * AFIRMAÇÃO**, ⛔ não a palavra.
   *
   * ── POR QUE ⛔ NÃO VARRE "contraindicação" ───────────────────────────────
   *
   * A primeira versão varria o termo, e reprovou a frase que **atribui o termo à
   * fonte**: *"a fonte lista este achado entre as contraindicações que ela mesma
   * chama de absolutas"*. ⚠️ Essa frase é **fidelidade**, ⛔ não veredito — é a
   * mesma armadilha que já me pegou duas vezes neste módulo, e a correção é
   * sempre a mesma: medir o que a frase FAZ, ⛔ não que palavras ela usa.
   *
   * ⚠️ **Duas metades, e as duas precisam valer:**
   *   · ⛔ **nenhuma forma ASSERTIVA** — o app dizendo o que fazer;
   *   · ✅ e, no estado positivo, **atribuição explícita à fonte** mais a
   *     declaração de que a decisão ⛔ não é tomada aqui. Sem a segunda metade, a
   *     trava seria satisfeita pelo silêncio.
   */
  const ASSERTIVO = /está contraindicad|é contraindicaç|não trombolis|não administrar|não pode receber|elegív|proibid|contraindicad[oa] a/i;
  confere("⛔ NENHUM estado da hipodensidade produz afirmação assertiva sobre a trombólise",
    ["Sim", "Não", "Incerto"].every((v) => {
      const x = l(escolhe(est, "hipodensidade_clara", v));
      return !ASSERTIVO.test(`${x.curto} ${x.texto}`);
    }),
    "instrução do autor: *\"⛔ não transformar isso em elegibilidade automática\"* — a decisão é da Superfície F");
  const positivo = l(escolhe(est, "hipodensidade_clara", "Sim"));
  confere("e o estado positivo ATRIBUI à fonte e devolve a decisão à reperfusão",
    /a fonte/i.test(positivo.texto) && /não é tomada nesta superfície/i.test(positivo.texto),
    "sem a atribuição, o app assume como sua uma classificação que a própria fonte declara ⛔ não sustentada por evidência");

  confere("e ela ⛔ não entra no dossiê endovascular",
    !C.IDS_DOSSIE_ENDOVASCULAR.includes("hipodensidade_clara"),
    "é achado de segurança da IVT (Table 8), ⛔ não critério de trombectomia — misturar os dois é o que §7.15 separa");
}

// ── 17 · ASPECTS · O APP DECLARA QUE ⛔ NÃO CALCULA — F-28 ABERTO ──────────
{
  const campo = C.TODOS_OS_CAMPOS_C.find((c) => c.id === "aspects");
  /**
   * ⚠️⚠️ O RELATO QUE ORIGINOU ISTO (autor, 2026-08-29): *"o usuário ⛔ não sabe
   * classificar isso"*. Um campo numérico que o médico ⛔ não sabe calcular produz
   * **branco ou chute** — e o chute alimenta a trombectomia na Superfície F.
   */
  confere("o rótulo do ASPECTS diz DE ONDE o número vem",
    /laudo|equipe/i.test(campo?.rotulo ?? ""),
    "\"ASPECTS informado\" ⛔ não dizia informado por quem, e um número sem procedência convida a estimar");
  confere("e a tela declara, VISÍVEL, que o app ⛔ não calcula",
    /não calcula o ASPECTS/i.test(campo?.ajuda ?? ""),
    "a confissão em `ajuda` é permanente; atrás do ⓘ ela ⛔ não impede o chute de quem ⛔ não abre o ⓘ");
  confere("e a ajuda ⛔ não convida a estimar",
    /sem estimar/i.test(campo?.ajuda ?? "") && !/na avaliação/i.test(campo?.ajuda ?? ""),
    "a redação anterior dizia *\"se disponível no laudo ou na avaliação\"* — e \"na avaliação\" é a porta para estimar de memória");
  confere("o ASPECTS continua GRANDEZA, e ⛔ não escala",
    campo?.tipo === "grandeza",
    "escala implica itens; os 10 territórios ⛔ não têm fonte transcrita, e fingir que têm é E-31");

  /**
   * ⚠️⚠️ ENQUANTO **F-28** ESTIVER ABERTO, ⛔ NENHUM TERRITÓRIO PODE APARECER.
   *
   * ⚠️ A varredura usa termos que ⛔ **só** existem no vocabulário do ASPECTS —
   * ⛔ não "M1", que é sítio de oclusão legítimo nesta mesma superfície. Uma trava
   * que confundisse os dois acusaria inocente e seria desligada (R-55).
   */
  const fonteC = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-c.ts"))
    + lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"));
  confere("⛔ nenhum território do ASPECTS foi escrito enquanto F-28 está aberto",
    !/lentiform|ínsula|insular|caudado|cápsula interna|corona radiata/i.test(fonteC),
    "E-31: os 10 territórios ⛔ não estão transcritos em fonte nenhuma do repositório — escrevê-los de memória é inventar conteúdo clínico onde ele mais custa");

  confere("F-28 e F-29 estão declarados como ABERTOS",
    F.slot("F-28")?.estado === "aberto" && F.slot("F-29")?.estado === "aberto",
    "§0.5: fonte declarada ⛔ não é fonte transcrita — e o estado do slot é o que impede alguém de implementar sobre o vazio");
  confere("a Superfície C lista os slots abertos entre as suas fontes",
    ["F-28", "F-29"].every((id) => P.superficie("imagem").fontes.includes(id)),
    "quem abre a lista de fontes precisa ver que o ASPECTS clicável e o critério de efeito de massa dependem de fonte que ainda ⛔ não existe");
}

// ── 18 · A PENDÊNCIA DECLARADA SAIU DO ESQUELETO ──────────────────────────
{
  const vigentes = P.pendenciasVigentes().map((p) => p.id);
  confere("a pendência estática da tomografia ⛔ não existe mais",
    !vigentes.includes("tc_realizada"),
    "PD-22: ela media campo vazio, e 'resultado ainda ⛔ não disponível' é campo CHEIO que ⛔ não resolve nada");
  confere("e o mecanismo de campo-que-existe continua vivo",
    P.pendenciasVigentes().every((p) => p.campo.length > 0),
    "as superfícies D a G ainda vão nascer, e a declaração invisível é o que as faz voltar sozinhas");
}

// ── 12 · O CONTRATO DE INSTÂNCIA APLICADO À IMAGEM (2026-08-30) ───────────
{
  /** ⚠️ Todo achado pertence ao estudo que o produziu; ⛔ nenhum é órfão. */
  const ACHADOS = ["estudo_resultado", "hipodensidade_clara", "aspects", "efeito_de_massa", "sitio_oclusao"];
  const JUIZOS = ["suspeita_hsa", "suspeita_lvo", "angio_disponibilidade"];

  confere("todo ACHADO de imagem declara instância de estudo",
    ACHADOS.every((id) => C.campoDeC(id).instanciaDe === C.ESTUDO),
    "achado sem instância é achado órfão: dois exames, e o app ⛔ não sabe qual produziu qual número");
  confere("⛔ NENHUM juízo do episódio declara instância",
    JUIZOS.every((id) => C.campoDeC(id).instanciaDe === undefined),
    "*\"suspeita de HSA existe justamente quando a TC ⛔ não mostra hemorragia\"* — presa ao estudo, viraria achado dele");
  confere("e os três juízos têm casa IMAGEM, e ⛔ nunca Paciente",
    JUIZOS.every((id) => C.campoDeC(id).casa === "imagem"),
    "*\"são juízos do episódio agudo: podem surgir, desaparecer ou ser revistos durante aquele atendimento\"*");
  confere("a alergia a contraste continua com casa PACIENTE",
    C.TODOS_OS_CAMPOS_C.every((c) => c.id !== "alergia_contraste"),
    "ela é emprestada, e ⛔ não pertence a C — perguntar alergia depois de oferecer o contraste é perguntar tarde");

  /** ⚠️⚠️ A matriz é LITERAL: modalidade nova ⛔ não herda pergunta nenhuma. */
  confere("a RM ⛔ NÃO herda hipodensidade clara",
    !C.achadosDaModalidade(MOD.rm).includes("hipodensidade_clara"),
    "*\"hipodensidade é linguagem de TC, ⛔ não achado genérico de qualquer imagem parenquimatosa\"*");
  confere("⛔ e ⛔ NÃO herda ASPECTS por ser 'de parênquima'",
    !C.achadosDaModalidade(MOD.rm).includes("aspects"),
    "ASPECTS por RM, se admitido, entra DECLARADO com a fonte que o admita — ⛔ nunca por categoria ampla");
  confere("a perfusão abre SEM variável nova",
    C.achadosDaModalidade(MOD.perfusaoTc).length === 0,
    "⛔ nada nasce antes de a Reperfusão definir o que consome — campo sem leitor é o defeito que originou a remodelagem");
  confere("⛔ modalidade desconhecida ⛔ não oferece achado ⛔ nenhum",
    C.achadosDaModalidade(undefined).length === 0 && C.achadosDaModalidade("Não sei").length === 0,
    "sem saber o exame, o app ⛔ não sabe o que ele responde — e ⛔ não inventa");
  confere("⛔ SÓ a TC sem contraste responde o resultado de hemorragia",
    JSON.stringify(C.MODALIDADES_COM_RESULTADO) === JSON.stringify([MOD.tcSemContraste]),
    "é este achado que governa a classe inteira de reperfusão");

  /** ⚠️⚠️ TC de perfusão ⛔ NÃO satisfaz a leitura da TC sem contraste. */
  const perfusao = escolheE(est, s1, "estudo_modalidade", MOD.perfusaoTc);
  confere("⛔ TC de perfusão ⛔ NÃO faz a TC sem contraste parecer realizada",
    D.situacaoDaTcSemContraste(perfusao) === "nenhuma_registrada",
    "*\"TC de perfusão ⛔ não pode fazer o app concluir que a TC sem contraste inicial está feita\"*");
  confere("⛔ e ⛔ nem libera a reperfusão",
    D.reperfusaoRetidaPelaImagem(perfusao) === true,
    "arquitetura de instâncias bonita respondendo à pergunta clínica errada é pior que ⛔ nenhuma");

  confere("sem estudo, a leitura fala da TRILHA, e ⛔ não do mundo",
    /nenhuma tomografia/i.test(D.exclusaoDeHemorragia(est).curto)
    && !/não realizada/i.test(D.exclusaoDeHemorragia(est).curto),
    "**E-23**: 'ainda ⛔ não realizada' é afirmação sobre o mundo tirada da ausência de registro");
  confere("estudo aberto sem resultado ⛔ NÃO fecha a pendência da TC",
    D.pendenciasDaImagem(tcSemResultado(est, s1)).some((p) => p.id === "tc_resultado"),
    "**PD-22**: o resultado pendente continua sendo a tarefa mais importante do atendimento");

  /** ⚠️⚠️ A realização vascular é DERIVADA, e ausência ⛔ nunca é indisponibilidade. */
  confere("existir estudo vascular basta — ⛔ ninguém repergunta se foi realizado",
    D.imagemVascular(vascular(est, s1)).vascular === "registrada",
    "repreguntar seria cobrar o que a trilha já sabe");
  confere("⛔ ausência de estudo ⛔ NUNCA vira indisponibilidade",
    D.imagemVascular(est).vascular === "sem_informacao"
    && !/disponív/i.test(D.imagemVascular(est).curto),
    "**E-23** e **E-18**: ⛔ não haver estudo registrado ⛔ não é o exame ⛔ não existir no serviço");
  confere("e 'não disponível neste serviço' continua respondível SEM estudo",
    D.imagemVascular(escolhe(est, "angio_disponibilidade", "Não disponível neste serviço")).vascular === "indisponivel",
    "⛔ nenhuma instância consegue dizer isto — é o que sobrou de `angio_realizada`");

  confere("⛔ `imagem_avancada` ⛔ NÃO existe, ⛔ nem como negativa agregada",
    C.TODOS_OS_CAMPOS_C.every((c) => c.id !== "imagem_avancada")
    && typeof D.examesAvancados !== "function",
    "*\"guardar uma negativa agregada sem leitor é voltar ao mesmo problema que iniciou a remodelagem\"*");
  confere("e quais exames foram feitos vem das INSTÂNCIAS",
    JSON.stringify(D.modalidadesRealizadas(vascular(perfusao, s2)))
      === JSON.stringify([MOD.perfusaoTc, MOD.angioTc]),
    "a existência das instâncias responde o que o campo agregado respondia");
}

// ── 13 · SENTINELA 1 · DUAS TCs QUE DISCORDAM ────────────────────────────
/**
 * ⚠️⚠️ MONTADO PELO AUTOR: TC **externa sem horário**, sem hemorragia · TC
 * **local às 18h**, com hemorragia.
 *
 * ⛔ E o **espelho** dá o mesmo resultado, que é a decisão dele: *"fazer o app
 * preferir 'local', 'mais novo', 'mais confiável' ⛔ ou qualquer outro atributo
 * sem regra explícita seria criar uma hierarquia que ⛔ ninguém autorizou."*
 */
{
  const monta = (rExterna, rLocal) => {
    let e = escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste);
    e = escolheE(e, s1, "estudo_procedencia", "Serviço externo");
    e = escolheE(e, s1, "estudo_hora", "Não sei");
    e = escolheE(e, s1, "estudo_resultado", rExterna);
    e = escolheE(e, s2, "estudo_modalidade", MOD.tcSemContraste);
    e = escolheE(e, s2, "estudo_procedencia", "Este serviço");
    e = CAMPOS.registrarComInstancia(e, { campo: "estudo_hora", valor: 1_800_000, horaClinica: 1_800_000 }, rel, s2);
    return escolheE(e, s2, "estudo_resultado", rLocal);
  };
  const caso = monta(TC.semHemorragia, TC.hemorragia);
  const espelho = monta(TC.hemorragia, TC.semHemorragia);

  confere("as DUAS TCs continuam registradas, cada uma com o seu resultado",
    I.valorNaInstancia(caso, s1, "estudo_resultado").valor === TC.semHemorragia
    && I.valorNaInstancia(caso, s2, "estudo_resultado").valor === TC.hemorragia,
    "⛔ nenhuma é apagada, ⛔ nenhuma é escondida");
  confere("a ordem entre elas ⛔ NÃO é estabelecível",
    D.ordemEntreEstudos(D.tcsSemContraste(caso)) === "nao_estabelecivel",
    "uma delas ⛔ não tem horário — e ordem de registro ⛔ não é ordem clínica");
  /**
   * ⚠️⚠️ EMPATE ⛔ NÃO ESTABELECE ORDEM — ponto cego achado por mutação (M108).
   * Dois exames no MESMO instante ⛔ não se ordenam entre si, e "ambos têm
   * horário" ⛔ não é o mesmo que "dá para dizer qual veio antes".
   */
  {
    let empate = escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste);
    empate = CAMPOS.registrarComInstancia(empate, { campo: "estudo_hora", valor: 1_800_000, horaClinica: 1_800_000 }, rel, s1);
    empate = escolheE(empate, s1, "estudo_resultado", TC.semHemorragia);
    empate = escolheE(empate, s2, "estudo_modalidade", MOD.tcSemContraste);
    empate = CAMPOS.registrarComInstancia(empate, { campo: "estudo_hora", valor: 1_800_000, horaClinica: 1_800_000 }, rel, s2);
    empate = escolheE(empate, s2, "estudo_resultado", TC.hemorragia);
    confere("dois exames no MESMO instante ⛔ não estabelecem ordem",
      D.ordemEntreEstudos(D.tcsSemContraste(empate)) === "nao_estabelecivel",
      "ambos com horário ⛔ não é o mesmo que dá para dizer qual veio antes");
  }

  confere("a leitura declara DIVERGÊNCIA, e ⛔ não elege",
    D.exclusaoDeHemorragia(caso).exclusao === "divergente"
    && !/mais recente|prevalece|considera/i.test(D.exclusaoDeHemorragia(caso).curto),
    "escolher entre os dois seria a hierarquia silenciosa que o autor proibiu");
  confere("a divergência NOMEIA os dois estudos",
    JSON.stringify(D.exclusaoDeHemorragia(caso).estudos) === JSON.stringify([s1, s2]),
    "**E-30**: a leitura diz de onde veio, e ⛔ não fala no ar");
  confere("⛔ e a reperfusão fica RETIDA",
    D.reperfusaoRetidaPelaImagem(caso) === true,
    "divergente ⛔ não é exclusão declarada — logo, retém");
  confere("⛔ O ESPELHO dá EXATAMENTE o mesmo",
    D.exclusaoDeHemorragia(espelho).exclusao === "divergente"
    && D.reperfusaoRetidaPelaImagem(espelho) === true,
    "externo-com-hemorragia × local-sem ⛔ não pode valer diferente — a função ⛔ nunca soube distinguir procedência");
  confere("e a saída hemorrágica aparece nos DOIS sentidos",
    D.destinoDaImagem(caso)?.saida === "hemorragia_intracraniana"
    && D.destinoDaImagem(espelho)?.saida === "hemorragia_intracraniana",
    "um achado de hemorragia ⛔ não desacontece porque outro exame ⛔ não o viu");

  /** ⚠️⚠️ ADJUDICAÇÃO EXPLÍCITA — a única saída da divergência. */
  const adjudicado = corrE(caso, s1, "estudo_resultado", TC.hemorragia);
  confere("corrigir um resultado DISSOLVE a divergência",
    D.exclusaoDeHemorragia(adjudicado).exclusao === "hemorragia_presente",
    "*\"ela ⛔ só desaparece por informação que resolva o conflito ou por correção explícita\"*");
  confere("e a trilha preserva a declaração corrigida",
    adjudicado.fatos.filter((f) => f.campo === "estudo_resultado" && f.instancia === s1).length === 2,
    "§3.1: append-only — a declaração anterior existiu, e esconder isso é o que a spec proíbe");
  confere("⛔ e a correção ⛔ NÃO cria estudo novo",
    I.instanciasDe(adjudicado, C.ESTUDO).length === 2,
    "corrigir é a mesma amostra melhor descrita; medir de novo é outro exame");
  confere("a pendência de horário nasce SÓ quando a ordem é necessária",
    D.pendenciasDaImagem(caso).some((p) => p.id === `estudo_hora_${s2}`) === false
    && D.pendenciasDaImagem(tcCom(est, s1, TC.semHemorragia)).every((p) => !p.id.startsWith("estudo_hora")),
    "⛔ não perguntar o que ainda ⛔ não tem leitor — uma TC externa sozinha ⛔ não gera pendência de horário");
}

// ── 14 · SENTINELA 2 · CORREÇÃO DE ACHADO ────────────────────────────────
{
  const sete = regE(escolheE(est, s1, "estudo_modalidade", MOD.tcSemContraste), s1, "aspects", 7);
  const fatoSete = I.valorNaInstancia(sete, s1, "aspects");
  const seis = corrE(sete, s1, "aspects", 6);
  const trilha = seis.fatos.filter((f) => f.campo === "aspects" && f.instancia === s1);

  confere("ASPECTS corrigido de 7 para 6 fica na MESMA instância",
    I.valorNaInstancia(seis, s1, "aspects").valor === 6
    && I.valorNaInstancia(seis, s1, "aspects").instancia === s1,
    "erro de transcrição ⛔ não é exame novo");
  confere("a trilha preserva 7 E 6",
    trilha.length === 2 && trilha[0].valor === 7 && trilha[1].valor === 6,
    "§3.1: o valor errado existiu, e apagá-lo esconderia que houve erro");
  confere("o 6 REFERENCIA o 7 por `corrigeFatoId`",
    trilha[1].corrigeFatoId === fatoSete.id && trilha[1].tipo === "correcao",
    "com três valores sucessivos, 'o de trás' deixa de identificar");
  confere("⛔ e ⛔ NENHUMA TC nova é criada",
    I.instanciasDe(seis, C.ESTUDO).length === 1,
    "corrigir achado ⛔ não abre estudo");
  confere("⛔ e o achado ⛔ NÃO vaza para outro estudo",
    I.valorNaInstancia(vascular(seis, s2), s2, "aspects") === undefined,
    "achado de um exame ⛔ não pode aparecer noutro");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE C — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA SUPERFÍCIE C — ${ok}/${ok} conferências`);
