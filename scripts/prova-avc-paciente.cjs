/**
 * PROMETE: que a superfície **Paciente** seja **painel e ⛔ nunca porta** — que
 *   com ela inteiramente vazia todas as superfícies continuem acessíveis, que
 *   ⛔ nenhum bloqueio genérico nasça dela e que ausência ⛔ nunca vire negativa;
 *   que a **propriedade do fato** seja única (⛔ nenhum id declarado em duas
 *   casas) e que **preenchimento compartilhado ⛔ não seja duplicação** — o campo
 *   emprestado é o MESMO objeto, com o mesmo id; que toda derivação do módulo só
 *   mude quando muda um fato **declarado como insumo dela**; que todo campo
 *   declare **casa** e **temporalidade**; que texto livre ⛔ não exista em campo
 *   clínico; e que o campo administrativo ⛔ não afrouxe a exigência de fonte dos
 *   demais.
 * NÃO PROMETE: que os números clínicos estejam CERTOS — confere que o código diz
 *   o que o verbatim transcrito diz. ⛔ Não mede tela: ordem visual, alvo de
 *   toque e legibilidade são `e2e/avc-superficie-paciente`. ⛔ Não confere
 *   tradução: o par em espanhol é `test:i18n-opcoes`.
 * UNIVERSO: `avc/conteudo/paciente.ts` inteiro (todos os campos de
 *   `TODOS_OS_CAMPOS_P`, contados, com piso) mais as superfícies A, B e C para
 *   medir empréstimo e propriedade única, e TODAS as derivações do módulo
 *   (A, B e C) para a trava de insumos. ⛔ Fora do universo: Laboratório e D a G.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-p-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-b.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-c.ts"),
  path.join(appDir, "avc", "conteudo", "paciente.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-b.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-c.ts"),
  path.join(appDir, "avc", "conteudo", "superficies.ts"),
  path.join(appDir, "avc", "conteudo", "consumidores.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const K = require(path.join(tmp, "avc", "conteudo", "campo.js"));
const P = require(path.join(tmp, "avc", "conteudo", "paciente.js"));
const CONS = require(path.join(tmp, "avc", "conteudo", "consumidores.js"));

/**
 * ⚠️⚠️ O CAMPO PELA CONSTANTE, ⛔ e ⛔ NÃO pela tela — 2026-09-07.
 *
 * ⛔ ⛔ `CAMPO_DO_PACIENTE` ⛔ só enxerga o que `GRUPOS_P` ainda **desenha**.
 * ⚠️ Cinco fatos mudaram de casa para a Avaliação AVC, ⛔ e as garantias sobre
 * o **conteúdo** deles (verbatim, pares de **E-06**, slot F-07) continuam
 * valendo — ⛔ elas são do fato, ⛔ e ⛔ não da tela que o compõe.
 */
const TODAS_AS_CONSTANTES_P = [
  ...P.IDENTIFICACAO_P, ...P.BASAIS_P, ...P.ALERGIAS_P, ...P.MEDICACOES_P,
  ...P.COMORBIDADES_P, ...P.ANTECEDENTES_INTRACRANIANOS_P,
  ...P.ANTECEDENTES_SISTEMICOS_P, ...P.PROCEDIMENTOS_P,
  ...P.MICROSSANGRAMENTOS_P, ...P.FUNCIONAL_PREVIA_P,
];
const campoP = (id) => {
  const achado = TODAS_AS_CONSTANTES_P.find((c) => c.id === id);
  if (!achado) throw new Error(`campoP: id desconhecido "${id}"`);
  return achado;
};
const A = require(path.join(tmp, "avc", "conteudo", "superficie-a.js"));
const B = require(path.join(tmp, "avc", "conteudo", "superficie-b.js"));
const C = require(path.join(tmp, "avc", "conteudo", "superficie-c.js"));
const S = require(path.join(tmp, "avc", "conteudo", "superficies.js"));
const DA = require(path.join(tmp, "avc", "nucleo", "derivacoes.js"));
const DB = require(path.join(tmp, "avc", "nucleo", "derivacoes-b.js"));
const DC = require(path.join(tmp, "avc", "nucleo", "derivacoes-c.js"));

const rel = R.relogioControlado(1_000_000);
const vazio = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const escolhe = (e, campo, rotulo) => reg(e, campo, K.valorDaOpcao(rotulo));

const TODOS = [
  ...P.TODOS_OS_CAMPOS_P,
  ...A.TODOS_OS_CAMPOS_A,
  ...B.TODOS_OS_CAMPOS_B,
  ...C.TODOS_OS_CAMPOS_C,
];

// ── 0 · O UNIVERSO EXISTE ────────────────────────────────────────────────
{
  confere("o universo de campos de Paciente foi carregado",
    Array.isArray(P.TODOS_OS_CAMPOS_P) && P.TODOS_OS_CAMPOS_P.length >= 10,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  /**
   * ⚠️⚠️⚠️ ⛔ ERAM NOVE, ⛔ E VIRARAM CINCO — 2026-09-07, inspeção clínica.
   *
   * ⛔ ⛔ Saíram os três de **antecedente/contraindicação** (slot F-07), o CMB
   * ⛔ e a funcionalidade prévia. ⚠️ ⛔ Nenhum deles responde *"quem é este
   * paciente"* — ⛔ e a abertura do atendimento vinha carregada de três fases
   * adiante. ⛔ Eles mudaram de casa para a **Avaliação AVC**.
   *
   * ⚠️ ⛔ E entrou **um**: `comorbidades` — ⛔ os antecedentes crônicos (HAS,
   * DM, DPOC) que ⛔ **⛔ não existiam** em campo ⛔ nenhum do módulo.
   */
  confere("⚠️⚠️ os CINCO blocos basais de Paciente existem",
    P.GRUPOS_P.length === 5,
    `identificação · basais · alergias · medicações · antecedentes crônicos — ${P.GRUPOS_P.map((g) => g.id).join(", ")}`);
  const ids = P.TODOS_OS_CAMPOS_P.map((c) => c.id);
  confere("⛔ nenhum id duplicado dentro de Paciente",
    new Set(ids).size === ids.length,
    "dois campos com o mesmo id gravam um por cima do outro na trilha");
}

// ── 0b · §7.3 · ⛔ O QUE DECIDE AGORA ⛔ NÃO NASCE RECOLHIDO ────────────────
{
  const recolhidos = P.GRUPOS_P.filter((g) => g.recolhido).map((g) => g.id).sort();
  /**
   * ⚠️⚠️ O CRITÉRIO É **ESPÉCIE DE CONTEÚDO**, e ⛔ não contagem de itens — E-35
   * proíbe recolher por aritmética. Antecedente é conteúdo de **exceção**: a
   * maioria dos pacientes responde "nenhum destes", e o cabeçalho declara o que
   * o bloco guarda.
   *
   * ⛔ Medicações em uso ⛔ NÃO entra aqui: anticoagulante é a primeira coisa que
   * a segurança da trombólise pergunta.
   */
  /**
   * ⚠️⚠️ ⛔ AGORA É **UM SÓ**: os três de antecedente saíram para a Avaliação
   * AVC, ⛔ e ⛔ lá nascem recolhidos pela mesma razão. ⛔ O que ficou é
   * `comorbidades` — ⛔ lista longa, ⛔ e ⛔ nada ali decide agora.
   */
  confere("⚠️⚠️ ⛔ SÓ o bloco de antecedentes crônicos nasce recolhido",
    JSON.stringify(recolhidos) === JSON.stringify(["comorbidades"]),
    `§7.3: identificação, basais, alergias ⛔ e medicações decidem agora ⛔ e ⛔ não podem nascer escondidos — ${recolhidos.join(", ")}`);
}

// ── 1 · PROPRIEDADE ÚNICA · ⛔ NENHUM ID EM DUAS CASAS ────────────────────
{
  /**
   * ⚠️⚠️ A CONFERÊNCIA CENTRAL DESTA ARQUITETURA. A regra do autor é
   * *"um fato tem um único id e uma única casa semântica"* — e o modo de
   * quebrá-la ⛔ não é maldade: é alguém precisar do peso na Superfície A e
   * **declarar um campo `peso` ali**, em vez de tomá-lo emprestado.
   */
  const casas = new Map();
  const duplicados = [];
  for (const c of TODOS) {
    const anterior = casas.get(c.id);
    if (anterior && anterior !== c.casa) duplicados.push(`${c.id}: ${anterior} × ${c.casa}`);
    casas.set(c.id, c.casa);
  }
  confere("⛔ NENHUM id de fato é declarado em duas casas",
    duplicados.length === 0,
    `propriedade do fato é única — declarar o mesmo id noutra casa é a duplicação voltando disfarçada — ${duplicados.join(" · ")}`);

  confere("todo campo declara casa e temporalidade",
    TODOS.every((c) => typeof c.casa === "string" && ["estavel", "afericao", "estado"].includes(c.temporalidade)),
    "a temporalidade decide qual operação de §7.16 a tela oferece; sem ela, tudo vira 'corrigir'");

  /** ⚠️ A casa é carimbada pelo módulo, e ⛔ não escrita campo a campo. */
  confere("cada módulo carimba UMA casa em todos os seus campos",
    P.TODOS_OS_CAMPOS_P.every((c) => c.casa === "paciente")
    && A.TODOS_OS_CAMPOS_A.every((c) => c.casa === "estabilizacao")
    && B.TODOS_OS_CAMPOS_B.every((c) => c.casa === "neurologico")
    && C.TODOS_OS_CAMPOS_C.every((c) => c.casa === "imagem"),
    "casa escrita à mão poderia discordar do arquivo que a declara");
}

// ── 2 · EMPRÉSTIMO ⛔ NÃO É DUPLICAÇÃO ────────────────────────────────────
{
  /**
   * ⚠️⚠️ O EMPRESTADO É O **MESMO OBJETO**, e ⛔ não uma cópia com o mesmo id.
   * Uma cópia divergiria no dia em que alguém melhorasse o rótulo de um lado só
   * — e o médico veria a mesma pergunta com dois textos.
   */
  const emprestados = [...A.GRUPOS_A, ...B.GRUPOS_B, ...C.GRUPOS_C]
    .flatMap((g) => g.emprestados ?? []);
  /**
   * ⚠️⚠️ ⛔ ERAM TRÊS, ⛔ E VIRARAM DOIS em 2026-09-07: ⛔ o `mrs_previo`
   * deixou de ser **emprestado** ⛔ e passou a ser **próprio** da Avaliação
   * AVC, ⛔ quando a funcionalidade prévia saiu da primeira tela.
   *
   * ⛔ ⛔ Emprestado cuja dona ⛔ não o desenha mais ficaria **inalcançável**
   * pelo *«Resolver ›»* (**E-26**) — ⛔ por isso ⛔ ele mudou de casa, ⛔ e ⛔ não
   * ⛔ só de tela.
   */
  confere("as superfícies tomam campos emprestados",
    emprestados.length >= 2,
    "peso e origem do peso mudaram de casa e continuam nas telas onde eram respondidos");

  const naoSaoOMesmo = emprestados.filter((c) => P.CAMPO_DO_PACIENTE(c.id) !== c);
  confere("todo campo emprestado é o MESMO objeto da casa dele",
    naoSaoOMesmo.length === 0,
    `cópia com o mesmo id diverge no dia da primeira melhoria de rótulo — ${naoSaoOMesmo.map((c) => c.id).join(", ")}`);

  confere("e ⛔ nenhum emprestado aparece na lista de campos PRÓPRIOS de quem o exibe",
    emprestados.every((c) =>
      !A.TODOS_OS_CAMPOS_A.some((x) => x.id === c.id)
      && !B.TODOS_OS_CAMPOS_B.some((x) => x.id === c.id)
      && !C.TODOS_OS_CAMPOS_C.some((x) => x.id === c.id)),
    "se o emprestado entrasse na lista própria, ele seria contado duas vezes e a casa deixaria de ser única");

  /** ⚠️ Os três que mudaram de casa em 2026-08-29, nomeados. */
  /**
   * ⚠️ `alergia_contraste` virou **um item** de `alergias` em 2026-09-06
   * (**§3**, **§55**): o contraste é uma das alergias, ⛔ e ⛔ não outra
   * pergunta. ⛔ A casa ⛔ não mudou.
   */
  /** ⚠️ ⛔ `mrs_previo` saiu desta lista em 2026-09-07 — ⛔ mudou de casa. */
  for (const id of ["peso", "peso_origem", "alergias"]) {
    confere(`\`${id}\` mora em Paciente`,
      P.TODOS_OS_CAMPOS_P.some((c) => c.id === id),
      "mudou de casa em 2026-08-29, e a experiência de preenchimento ⛔ não mudou");
  }
  /**
   * ⚠️⚠️⚠️ ⛔ E O mRS AGORA MORA NA **AVALIAÇÃO AVC** — ⛔ e ⛔ em ⛔ uma casa
   * só. ⛔ Ele esteve em Paciente entre 2026-08-29 ⛔ e 2026-09-07.
   */
  confere("⚠️⚠️ `mrs_previo` mora na Avaliação AVC, ⛔ e ⛔ NÃO em Paciente",
    B.TODOS_OS_CAMPOS_B.some((c) => c.id === "mrs_previo" && c.casa === "neurologico")
    && !P.TODOS_OS_CAMPOS_P.some((c) => c.id === "mrs_previo"),
    "⛔ a funcionalidade prévia saiu da abertura, ⛔ e o fato foi junto — ⛔ sem ganhar uma segunda casa");
  confere("e os que seguem emprestados continuam DESENHADOS nas telas de origem",
    K.camposDoGrupo(A.GRUPOS_A.find((g) => g.id === "peso")).some((c) => c.id === "peso")
    && K.camposDoGrupo(B.GRUPOS_B.find((g) => g.id === "basal")).some((c) => c.id === "mrs_previo"),
    "mudar a propriedade ⛔ não pode custar a experiência: o autor foi explícito sobre o mRS na B");

  /**
   * ⚠️⚠️ A ALERGIA A CONTRASTE DEIXOU DE SER EMPRESTADA — autor, 2026-08-30:
   *
   * > *"⛔ no A já coleta sobre alergias e no C de novo, ⛔ só deixamos no A"*
   *
   * ⚠️ Empréstimo ⛔ não duplica o **fato** — a trilha é a mesma —, mas duplica a
   * **pergunta**. E a segunda pergunta é pior que redundante: ela faz o médico
   * duvidar da primeira.
   *
   * ⚠️ A **leitura** continua em C: ler ⛔ não é coletar.
   */
  confere("a alergia a contraste é perguntada em UM lugar só",
    K.camposDoGrupo(C.GRUPOS_C.find((g) => g.id === "juizo"))
      .every((c) => c.id !== "alergias")
    && P.GRUPOS_P.some((g) => K.camposDoGrupo(g).some((c) => c.id === "alergias")),
    "a mesma pergunta em duas telas faz duvidar da resposta que já foi dada");
  confere("⛔ e ⛔ NENHUMA superfície do módulo a desenha além de Paciente",
    [A.GRUPOS_A, B.GRUPOS_B, C.GRUPOS_C]
      .every((gs) => gs.every((g) => K.camposDoGrupo(g).every((c) => c.id !== "alergias"))),
    "a trava vale para o módulo inteiro, e ⛔ não ⛔ só para C — ⛔ senão volta pela próxima superfície");
}

// ── 3 · PACIENTE ⛔ NÃO É PORTA ───────────────────────────────────────────
{
  /**
   * ⚠️⚠️ A CONDIÇÃO QUE O AUTOR IMPÔS PARA ELA EXISTIR. Uma tela de admissão
   * antes do fluxo é a forma mais natural de reintroduzir o atraso que as doze
   * marcas 🚫 proíbem — e ⛔ nem pareceria bloqueio: pareceria organização.
   */
  /**
   * ⚠️⚠️ O NÚMERO SAIU DAQUI EM 2026-09-05 (PD-36), ⛔ e ⛔ isso ⛔ não é
   * afrouxamento — é a trava ficando **mais forte**.
   *
   * ⛔ `length === 9` reprovava por **ganhar** superfície: no dia em que os dois
   * destinos hemorrágicos (`hic`, `hsa`) nasceram, a prova acusou falha ⛔ sem
   * ⛔ nenhuma superfície ter sumido. ⚠️ E um contador ⛔ nunca diz **qual**
   * sumiu — que é justamente o que a invariante existe para detectar.
   *
   * ⚠️ Conferindo o **conjunto de ids**, acrescentar superfície exige declarar a
   * intenção aqui (uma linha), ⛔ e remover uma acusa pelo nome.
   */
  const SUPERFICIES_ESPERADAS = [
    "paciente", "laboratorio", "estabilizacao", "neurologico", "imagem",
    "seguranca", "correcoes", "reperfusao", "destino",
    // ⚠️ Destinos hemorrágicos (PD-36) — ⛔ não são etapas do fluxo isquêmico.
    "hic", "hsa",
  ];
  const declaradas = S.SUPERFICIES.map((s) => s.id);
  const faltando = SUPERFICIES_ESPERADAS.filter((id) => !declaradas.includes(id));
  const inesperadas = declaradas.filter((id) => !SUPERFICIES_ESPERADAS.includes(id));
  confere("com Paciente VAZIO, todas as superfícies declaradas continuam declaradas",
    faltando.length === 0 && inesperadas.length === 0,
    `⛔ nenhuma superfície some por falta de dado do paciente`
    + (faltando.length ? ` · SUMIU: ${faltando.join(", ")}` : "")
    + (inesperadas.length ? ` · NÃO DECLARADA NA PROVA: ${inesperadas.join(", ")}` : ""));

  confere("⛔ nenhum campo de Paciente bloqueia terapia",
    P.TODOS_OS_CAMPOS_P.every((c) => c.bloqueiaTerapia === false),
    "E-49: ⛔ nenhum campo obrigatório novo sem checagem contra as doze marcas 🚫");

  /** ⚠️ Vazia, ela ⛔ não pode gerar pendência nenhuma — ⛔ nem uma. */
  const pendencias = E.pendenciasAbertas(vazio, S.pendenciasVigentes())
    .filter((p) => p.dono === "paciente");
  confere("⛔ Paciente VAZIO ⛔ não gera pendência alguma",
    pendencias.length === 0,
    "pendência de painel transversal viraria cobrança permanente por dado que ⛔ não atrasa nada");

  /** ⚠️ E ⛔ nenhuma leitura de A, B ou C muda por ela estar vazia — ⛔ nem some. */
  const leiturasVazio = JSON.stringify([
    DA.leiturasDaSuperficieA(vazio).length,
    DB.leiturasDaSuperficieB(vazio).length,
    DC.leiturasDaSuperficieC(vazio).length,
  ]);
  confere("as leituras de A, B e C EXISTEM com Paciente vazio",
    leiturasVazio === JSON.stringify([DA.leiturasDaSuperficieA(vazio).length, 10, 6]),
    "⛔ nenhuma superfície perde leitura por falta de dado de identificação");
}

// ── 4 · E-22 REFORÇADA · A DECLARAÇÃO DE INSUMOS É VERDADEIRA ────────────
{
  /**
   * ⚠️⚠️ A TRAVA QUE O AUTOR CORRIGIU, e ela é a mais forte do módulo.
   *
   * Minha versão dizia *"⛔ nenhuma leitura muda por Paciente estar incompleta"* —
   * e estava **conceitualmente errada**: registrar DOAC **deve** mudar a leitura
   * de segurança. A regra certa é a dele:
   *
   * > *"Uma derivação só pode mudar quando mudar um fato explicitamente
   * > declarado como entrada dela."*
   *
   * ⚠️ Ela transforma **E-22** de *"declare seus insumos"* em *"sua declaração é
   * verdadeira"* — e vale para o módulo inteiro, ⛔ não só para Paciente.
   */
  const valorDe = (c) => {
    if (c.tipo === "grandeza" || c.tipo === "escala") {
      return c.faixa ? Math.round((c.faixa.min + c.faixa.max) / 2) : 5;
    }
    if (c.tipo === "hora") return 900_000;
    if (c.tipo === "texto") return "Fulano";
    return K.valorDaOpcao((c.opcoes || ["Sim"])[0]);
  };
  const conjuntos = [
    ["A", DA.leiturasDaSuperficieA],
    ["B", DB.leiturasDaSuperficieB],
    ["C", DC.leiturasDaSuperficieC],
  ];
  const violacoes = [];
  let comparacoes = 0;
  for (const [sup, fn] of conjuntos) {
    const antes = fn(vazio);
    for (const c of TODOS) {
      const depois = fn(reg(vazio, c.id, valorDe(c)));
      for (let i = 0; i < antes.length; i += 1) {
        comparacoes += 1;
        if (JSON.stringify(antes[i]) === JSON.stringify(depois[i])) continue;
        if (!antes[i].insumos.includes(c.id)) {
          violacoes.push(`${sup}·${antes[i].id} mudou com ${c.id}`);
        }
      }
    }
  }
  confere("a varredura de insumos comparou o universo inteiro",
    comparacoes >= 1000,
    "trava de insumo que roda sobre poucos pares ⛔ não prova declaração nenhuma (R-1)");
  confere("⛔ NENHUMA leitura muda com um fato que ela ⛔ não declara como insumo",
    violacoes.length === 0,
    `E-22: insumo declarado que ⛔ não corresponde ao que a função lê é rastreabilidade falsa — ${[...new Set(violacoes)].join(" · ")}`);
}

// ── 5 · E-52 · O FATO PRINCIPAL SOBREVIVE AO ATRIBUTO DESCONHECIDO ──────
{
  /**
   * ⚠️⚠️ **E-52 CONSTRUÍDA, e ⛔ não afirmada.** O exemplo normativo do autor:
   * *"última dose de DOAC desconhecida sem instante artificial"*.
   *
   * ⚠️ A prova monta o estado que o formulário desenhado para completude
   * apagaria: **anticoagulante conhecido + horário desconhecido**, os dois
   * registrados ao mesmo tempo.
   */
  const comDoac = escolhe(vazio, "anticoagulante_em_uso", "Anticoagulante oral direto (DOAC)");
  const semHora = reg(comDoac, "doac_ultima_dose", "nao_sei");
  confere("DOAC conhecido e horário DESCONHECIDO coexistem",
    String(E.valorAtual(semHora, "anticoagulante_em_uso").valor).includes("DOAC")
    && E.valorAtual(semHora, "doac_ultima_dose").valor === "nao_sei",
    "E-52: exigir o horário para aceitar o fato trocaria uma verdade por um instante inventado");

  confere("e o campo do horário ACEITA desconhecido como resposta",
    P.CAMPO_DO_PACIENTE("doac_ultima_dose").aceitaDesconhecido === true,
    "E-02: sem a saída declarada, o médico é empurrado a escolher uma hora fictícia");

  /** ⚠️ E o desconhecido ⛔ não vira negativo: ⛔ não perguntado ≠ respondido desconhecido. */
  confere("⛔ não perguntado e desconhecido continuam distinguíveis",
    E.valorAtual(comDoac, "doac_ultima_dose") === undefined
    && E.valorAtual(semHora, "doac_ultima_dose").valor === "nao_sei",
    "E-37: colapsar os dois apagaria a diferença entre 'ninguém perguntou' e 'ninguém sabe'");
}

// ── 6 · TEXTO LIVRE ⛔ SÓ EM CAMPO ADMINISTRATIVO ─────────────────────────
{
  const textos = TODOS.filter((c) => c.tipo === "texto");
  confere("⛔ TODO campo de texto livre é administrativo",
    textos.every((c) => c.natureza === "administrativo"),
    "§0.3: caixa de texto para valor clínico ⛔ não tem opções, ⛔ não tem os três vazios, ⛔ não tem faixa e ⛔ não se deriva");
  confere("e existe exatamente UM campo de texto no módulo",
    textos.length === 1 && textos[0].id === "identificacao",
    "cada campo de texto novo é uma porta de entrada de conteúdo sem fonte; ⛔ nenhum entra sem decisão");

  /** ⚠️ A exceção de fonte é do campo administrativo, e ⛔ não de todos. */
  /**
   * ⚠️⚠️ `administrativo` é **slot declarado**, ⛔ e ⛔ não ausência de slot —
   * ⛔ o mesmo de `medicacoes_em_uso`. ⚠️ Ele diz *"⛔ isto ⛔ não é afirmação
   * clínica"*, ⛔ e a trava abaixo confere que ⛔ ninguém o lê.
   */
  const semFonte = TODOS.filter(
    (c) => !/^F-\d+$/.test(String(c.fonte)) && String(c.fonte) !== "administrativo"
  );
  confere("⛔ SÓ o campo administrativo pode ⛔ não ter slot de fonte",
    semFonte.every((c) => c.natureza === "administrativo"),
    `E-30: afirmação clínica sem endereço de fonte ⛔ não entra — ${semFonte.map((c) => c.id).join(", ")}`);
  confere("e ⛔ nenhuma derivação lê o campo administrativo",
    !lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes.ts")).includes("identificacao")
    && !lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-b.ts")).includes("identificacao")
    && !lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-c.ts")).includes("identificacao"),
    "dado pessoal ⛔ não tem efeito sobre conduta — foi a condição do autor ao aprová-lo");
}

// ── 7 · E-02/E-37 · TODA ESCOLHA DE PACIENTE TEM SAÍDA ──────────────────
{
  const escolhas = P.TODOS_OS_CAMPOS_P.filter((c) => ["escolha", "multipla", "grau"].includes(c.tipo));
  const semDeclaracao = escolhas.filter((c) => P.SAIDA_SEM_CONCLUSAO_P[c.id] === undefined);
  confere("TODA escolha de Paciente declara a saída sem conclusão",
    semDeclaracao.length === 0,
    `E-02/E-37 — ${semDeclaracao.map((c) => c.id).join(", ")}`);
  const invalidas = escolhas.filter((c) => !c.opcoes.includes(P.SAIDA_SEM_CONCLUSAO_P[c.id]));
  confere("e a saída declarada existe entre as opções",
    invalidas.length === 0,
    `declarar saída que ⛔ não está na lista é pior que ⛔ não declarar — ${invalidas.map((c) => c.id).join(", ")}`);
}

// ── 8 · E-19 · ⛔ NENHUM ANTECEDENTE INVENTADO ────────────────────────────
{
  /**
   * ⚠️⚠️ *"Comorbidades"* ⛔ não pode ser lista aberta: §0.3 proíbe texto livre para
   * valor clínico, e **E-19** proíbe pergunta que a fonte ⛔ não sustenta. Os
   * antecedentes daqui são **exatamente** os que Table 8 e F-10 nomeiam.
   */
  /**
   * ⚠️⚠️ ⛔ OS TRÊS SAÍRAM DA TELA PACIENTE em 2026-09-07 — ⛔ e a garantia
   * ⛔ **⛔ não** saiu com eles: as constantes seguem declaradas ⛔ aqui, ⛔ com
   * verbatim ⛔ e slot intactos, ⛔ e a Avaliação AVC as compõe.
   *
   * ⛔ ⛔ Por isso a leitura é da **constante**, ⛔ e ⛔ não de
   * `CAMPO_DO_PACIENTE` — ⛔ que ⛔ só enxerga o que a tela de Paciente ainda
   * desenha.
   */
  const DOS_ANTECEDENTES = [
    ...P.ANTECEDENTES_INTRACRANIANOS_P,
    ...P.ANTECEDENTES_SISTEMICOS_P,
    ...P.PROCEDIMENTOS_P,
  ];
  confere("os três blocos de antecedentes apontam para F-07",
    DOS_ANTECEDENTES.length === 3 && DOS_ANTECEDENTES.every((c) => c.fonte === "F-07"),
    "E-19: antecedente sem fonte é comorbidade inventada com cara de critério");
  confere("e ⛔ nenhum deles é campo de texto",
    DOS_ANTECEDENTES.every((c) => c.tipo === "multipla"),
    "lista aberta de comorbidade é a porta de entrada de conteúdo sem fonte");
  /**
   * ⚠️⚠️⚠️ ⛔ E ⛔ ELES ⛔ NÃO ESTÃO MAIS NA PRIMEIRA TELA.
   *
   * ⛔ ⛔ São contraindicação à trombólise; ⛔ a abertura do atendimento
   * pergunta **quem é o paciente**.
   */
  const naTelaP = new Set(P.TODOS_OS_CAMPOS_P.map((c) => c.id));
  confere("⚠️⚠️ ⛔ e ⛔ NENHUM deles é mais renderizado em Paciente",
    DOS_ANTECEDENTES.every((c) => !naTelaP.has(c.id)),
    "⛔ contraindicação na primeira tela é três fases adiante");

  /**
   * ⚠️⚠️⚠️ ⛔ A EXCEÇÃO DE **E-19**, DECLARADA — ⛔ e ⛔ ela é estreita.
   *
   * ⛔ ⛔ `comorbidades` é uma pergunta que a fonte ⛔ **⛔ não sustenta**: a
   * AHA/ASA ⛔ não publica lista de comorbidades. ⚠️ ⛔ O que **E-19** proíbe é
   * *"comorbidade inventada **com cara de critério**"* — ⛔ e a cara de
   * critério é o que se mede aqui.
   *
   * ⚠️ ⛔ Ela pode existir ⛔ **⛔ enquanto** for `administrativo`, ⛔ sem
   * consumidor ⛔ e ⛔ sem bloqueio. ⛔ Ganhar um slot clínico, um leitor ⛔ ou
   * `bloqueiaTerapia` a transforma ⛔ exatamente no que **E-19** proíbe.
   */
  const com = campoP("comorbidades");
  confere("⚠️⚠️⚠️ `comorbidades` é **administrativo**, ⛔ e ⛔ NÃO tem cara de critério",
    com.fonte === "administrativo" && com.bloqueiaTerapia === false && com.tipo === "multipla",
    `⛔ fonte=${com.fonte} bloqueia=${com.bloqueiaTerapia} tipo=${com.tipo} — ⛔ sem fonte, ⛔ ela ⛔ não pode decidir`);
  confere("⚠️⚠️ ⛔ e ⛔ NENHUMA derivação a consome",
    Array.isArray(CONS.CONSUMIDORES.comorbidades) && CONS.CONSUMIDORES.comorbidades.length === 0,
    `⛔ ${JSON.stringify(CONS.CONSUMIDORES.comorbidades)}`);
  /** ⚠️ ⛔ E ⛔ ela ⛔ não repete um antecedente que já é critério em outra casa. */
  const rotulosF07 = new Set(DOS_ANTECEDENTES.flatMap((c) => c.opcoes ?? []));
  /**
   * ⚠️ ⛔ *"Nenhum destes"* ⛔ e *"Não sei"* são **saídas de ausência**, ⛔ e
   * ⛔ não itens clínicos: ⛔ toda lista múltipla do módulo as tem.
   */
  const GENERICAS = new Set(["Nenhum destes", "Nenhuma", "Não sei"]);
  const repetidas = (com.opcoes ?? []).filter((o) => rotulosF07.has(o) && !GENERICAS.has(o));
  confere("⚠️⚠️ ⛔ e ⛔ NENHUMA opção dela repete um item de contraindicação",
    repetidas.length === 0,
    `⛔ ${repetidas.join(" · ")} — o mesmo fato em duas casas é duas verdades (I6)`);

  /** ⚠️ Os pares de E-06 sobrevivem como itens SEPARADOS. */
  const intra = campoP("antecedentes_intracranianos").opcoes;
  confere("neoplasia extra-axial e intra-axial são itens SEPARADOS",
    intra.includes("Neoplasia intracraniana extra-axial")
    && intra.includes("Neoplasia intracraniana intra-axial"),
    "E-06: mesma palavra, sentidos opostos na fonte — juntá-las destrói a distinção que ela fez questão de escrever");
  const proc = campoP("procedimentos_recentes").opcoes;
  confere("as janelas da fonte estão no rótulo, e os pares de E-06 são separados",
    proc.includes("Neurocirurgia nos últimos 14 dias")
    && proc.includes("Neurocirurgia entre 14 dias e 3 meses")
    && proc.includes("Sangramento gastrointestinal ou geniturinário nos últimos 21 dias")
    && proc.includes("Sangramento gastrointestinal ou geniturinário remoto e estável"),
    "o mesmo antecedente muda de sentido conforme a janela; uma pergunta binária destruiria quatro distinções de uma vez");
}

// ── 9 · 🚫 #3 · A PERGUNTA DO CMB ⛔ NÃO INDUZ RESSONÂNCIA ────────────────
{
  const cmb = campoP("informacao_previa_cmb");
  confere("a pergunta do CMB é sobre INFORMAÇÃO PRÉVIA",
    /informação prévia/i.test(cmb.rotulo),
    "🚫 #3 e R6.2: *\"CMB presente?\"* induz a ressonância que a rec. 11 (COR 1) manda ⛔ NÃO obter");
  confere("e a tela diz que ⛔ não é preciso obter ressonância",
    /não é preciso obter ressonância/i.test(cmb.ajuda ?? ""),
    "desconhecido aqui é estado terminal ACEITÁVEL, por recomendação de classe 1");
  confere("⛔ não haver informação prévia é uma das opções",
    cmb.opcoes.includes("Não há informação prévia"),
    "é resposta completa, e ⛔ não ausência de resposta");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE PACIENTE — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA SUPERFÍCIE PACIENTE — ${ok}/${ok} conferências`);
