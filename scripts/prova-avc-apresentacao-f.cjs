#!/usr/bin/env node
/**
 * PROMETE: que as CINCO DECISÕES DE UX fechadas pelo autor em 2026-08-31 estão
 *   no código, e ⛔ não só no documento que as descreveu.
 *
 *     1 · agrupar pela FALTA, ⛔ não pela recomendação;
 *     2 · as duas raias sempre visíveis, ⛔ sem leitura de sequência;
 *     3 · dívida de fonte visível ⛔ e compacta, distinta de dado faltante;
 *     4 · ⛔ COR ⛔ NÃO governa a ordem — o relógio governa;
 *     5 · frase clínica na frente, contagem atrás.
 *
 * NÃO PROMETE: que a tela seja bonita, ⛔ nem que caiba na altura do aparelho.
 *   Isso é revisão visual, e ela é humana. ⛔ Também ⛔ não mede se a
 *   correspondência clínica está certa — isso é de `prova-avc-superficie-f`.
 *
 * UNIVERSO: o módulo puro `avc/nucleo/apresentacao-f.ts`, CARREGADO E EXECUTADO
 *   (⛔ não lido como texto), mais a fonte de `components/avc/superficie-f.tsx`
 *   e de `avc/conteudo/superficie-f.ts` lidas SEM COMENTÁRIO (R-92) — comentário
 *   ⛔ não executa, e uma regra citada em comentário satisfaria a busca ⛔ sem
 *   governar ⛔ nada na tela.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * ⚠️ Regra de apresentação é a que mais silenciosamente regride: ⛔ nada quebra
 * quando a ordem muda, ⛔ o tsc passa, e o defeito só aparece com um paciente
 * real na frente. Por isso a ordem ⛔ **não** mora no JSX — mora em
 * `apresentacao-f`, ⛔ e é medida aqui.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-apres-f-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node",
  "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "apresentacao-f.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
], { cwd: appDir, stdio: "pipe" });

const A = require(path.join(tmp, "avc", "nucleo", "apresentacao-f.js"));
const C = require(path.join(tmp, "avc", "conteudo", "superficie-f.js"));
const D = require(path.join(tmp, "avc", "nucleo", "derivacoes-f.js"));
const SA = require(path.join(tmp, "avc", "conteudo", "superficie-a.js"));

const fonteTelaA = lerFonte(path.join(appDir, "components", "avc", "superficie-a.tsx"));
const fonteSupA = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-a.ts"));
const fonteDeriv = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes.ts"));
const fonteA = lerFonte(path.join(appDir, "avc", "nucleo", "apresentacao-f.ts"));
const fonteTela = lerFonte(path.join(appDir, "components", "avc", "superficie-f.tsx"));

/** ⚠️ Leitura sintética — a trava mede a ARRUMAÇÃO, ⛔ não a correspondência. */
const leitura = (o) => ({
  id: o.id ?? "x", slot: "F-00", localizacao: "§0", terapia: o.terapia ?? "ivt",
  cor: o.cor ?? "1", loe: "A", verbo: "v", populacao: "p",
  correspondencia: o.correspondencia, sustentam: [], incompativeis: o.incompativeis ?? [],
  faltam: o.faltam ?? [], travadaPor: o.travadaPor,
});
const semRelogio = () => undefined;

// ── ⚠️ 0 · O UNIVERSO EXISTE (R-1) ───────────────────────────────────────
confere("há recomendações e insumos a arrumar",
  C.RECOMENDACOES.length >= 17 && Object.keys(C.MOTIVO_CLINICO).length >= 16,
  "⛔ trava que roda sobre lista vazia fica verde sem medir nada");

// ══ DECISÃO 4 · ⛔ COR ⛔ NÃO GOVERNA A ORDEM ══════════════════════════════
{
  confere("⚠️⚠️ a ordem das faixas é a aprovada, na sequência exata",
    A.ORDEM_DAS_FAIXAS.join(">") ===
      ["acao_com_relogio","aplicavel","a_um_dado","alerta_cor3","potencial_recolhida","sem_fonte","fora"].join(">"),
    "⛔ ação tempo-dependente → aplicável → a 1 dado → alerta COR 3 → recolhidas");

  /**
   * ⚠️⚠️ O DEFEITO QUE A DECISÃO 4 EVITA, MEDIDO.
   *
   * ⛔ Uma COR 1 ⛔ sem prazo ⛔ não pode aparecer acima de uma COR 2b com janela
   * se fechando. Se COR governasse, esta conferência reprovaria.
   */
  const cor1SemRelogio = { leitura: leitura({ id: "c1", cor: "1", correspondencia: "aplicavel" }),
    faixa: "aplicavel", relogios: [], apertoMin: undefined };
  const cor2bApertada = { leitura: leitura({ id: "c2b", cor: "2b", correspondencia: "aplicavel" }),
    faixa: "acao_com_relogio", relogios: [], apertoMin: 20 };
  confere("⚠️⚠️ COR 2b com janela fechando vem ANTES de COR 1 sem prazo",
    A.ordenarItens([cor1SemRelogio, cor2bApertada])[0].leitura.id === "c2b",
    "⛔ em emergência quem manda é o relógio; a força continua visível ⛔ e ⛔ não decide a ordem");

  confere("⚠️ dentro da faixa, o MAIS APERTADO primeiro",
    A.ordenarItens([
      { leitura: leitura({ id: "folgado" }), faixa: "acao_com_relogio", relogios: [], apertoMin: 300 },
      { leitura: leitura({ id: "apertado" }), faixa: "acao_com_relogio", relogios: [], apertoMin: 15 },
    ])[0].leitura.id === "apertado",
    "⛔ senão a faixa fica em ordem de catálogo, e 15 min aparece abaixo de 5 h");

  /** ⚠️⚠️ COR 3 aplicável é ALERTA — ⛔ e ⛔ nunca encabeça a tela. */
  confere("⚠️⚠️ COR 3 aplicável cai em alerta, ⛔ NÃO em ação",
    A.faixaDoItem(leitura({ cor: "3: No Benefit", correspondencia: "aplicavel" }),
      [{ estado: "correndo", restantesMin: 10 }]) === "alerta_cor3",
    "⛔ mesmo com relógio correndo: COR 3 é contexto, ⛔ não conduta a executar");

  confere("⚠️ e uma COR 1 aplicável COM relógio é ação",
    A.faixaDoItem(leitura({ cor: "1", correspondencia: "aplicavel" }),
      [{ estado: "correndo", restantesMin: 10 }]) === "acao_com_relogio"
    && A.faixaDoItem(leitura({ cor: "1", correspondencia: "aplicavel" }), []) === "aplicavel",
    "⛔ sem relógio ela ⛔ não some — muda de faixa");

  confere("⚠️ a tela ⛔ NÃO reordena por conta própria",
    !/\.sort\(/.test(fonteTela),
    "⛔ ordenação no JSX é regra fora do lugar onde ela se prova (I6)");
}

// ══ DECISÃO 1 · AGRUPAR PELA FALTA ════════════════════════════════════════
{
  const itens = [
    { leitura: leitura({ id: "r1", faltam: ["sitio_da_oclusao", "nihss"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] },
    { leitura: leitura({ id: "r2", faltam: ["sitio_da_oclusao", "aspects"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] },
    { leitura: leitura({ id: "r3", faltam: ["sitio_da_oclusao"], correspondencia: "potencialmente_aplicavel" }), faixa: "a_um_dado", relogios: [] },
  ];
  const g = A.faltasAgrupadas(itens);
  const sitio = g.find((x) => x.insumo === "sitio_da_oclusao");

  confere("⚠️⚠️ o mesmo dado aparece UMA vez, ⛔ não uma por recomendação",
    g.filter((x) => x.insumo === "sitio_da_oclusao").length === 1,
    "⛔ é a decisão inteira: 11 cartões repetindo a mesma ausência é a poluição que ela remove");

  confere("⚠️ e a contagem soma as recomendações recolhidas",
    sitio.quantas === 2,
    "⛔ contar errado faria o médico priorizar a pergunta errada");

  /** ⚠️⚠️ A EXCEÇÃO APROVADA ⛔ NÃO PODE SER CONTADA DUAS VEZES. */
  confere("⚠️⚠️ quem já aparece inteira (a 1 dado) ⛔ NÃO entra no agrupamento",
    sitio.quantas === 2,
    "⛔ contá-la de novo seria a duplicação que o agrupamento existe para eliminar");

  /**
   * ⚠️⚠️ O DESEMPATE DE PRODUTO — ⛔ e ⛔ NÃO o alfabético.
   *
   * ⛔ Os três empatam de propósito nesta amostra: é o empate que o alfabeto
   * resolvia errado, pondo `mrs_previo` na frente de `sitio_da_oclusao`.
   */
  {
    const empatados = ["mrs_previo", "nihss", "sitio_da_oclusao"].map((i, n) => ({
      leitura: leitura({ id: `e${n}`, faltam: [i], correspondencia: "potencialmente_aplicavel" }),
      faixa: "potencial_recolhida", relogios: [],
    }));
    confere("⚠️⚠️ no EMPATE vale a ordem de produto: sítio → NIHSS → mRS",
      A.faltasAgrupadas(empatados).map((f) => f.insumo).join(">") ===
        "sitio_da_oclusao>nihss>mrs_previo",
      "⛔ o alfabético punha o estado funcional PRÉVIO na frente do dado que abre a frente endovascular");

    confere("⚠️⚠️ ⛔ e a ordem de produto ⛔ NÃO passa por cima da contagem",
      A.faltasAgrupadas([
        { leitura: leitura({ id: "a", faltam: ["sitio_da_oclusao"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] },
        { leitura: leitura({ id: "b", faltam: ["nihss"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] },
        { leitura: leitura({ id: "c", faltam: ["nihss"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] },
      ])[0].insumo === "nihss",
      "⛔ contagem é o PRIMEIRO critério; a prioridade de UX só decide entre pesos iguais");

    /** ⚠️⚠️ A declaração é DADO — comentário ⛔ não executa (R-92). */
    const n = A.PRIORIDADE_DE_PRODUTO_NATUREZA;
    confere("⚠️⚠️ a decisão se declara como de PRODUTO, EM DADO",
      n.natureza === "decisao_de_apresentacao_do_autor"
      && n.ehGrauDeRecomendacao === false && n.ehNivelDeEvidencia === false
      && n.ehNormativaDaFonte === false
      && n.criterioPrimario === "quantas" && n.papel === "desempate",
      "⛔ ordem de interface lida como força de evidência inventaria hierarquia que a fonte ⛔ não deu");

    confere("⚠️ ⛔ e ⛔ NENHUMA recomendação empresta COR/LOE para esta ordem",
      A.PRIORIDADE_DE_PRODUTO.every((i) => typeof i === "string")
      && A.PRIORIDADE_DE_PRODUTO.length === 3,
      "⛔ a lista é de INSUMOS; misturar grau aqui faria a UX parecer normativa");
  }

  confere("⚠️ mais destravado primeiro",
    A.faltasAgrupadas(itens)[0].insumo === "sitio_da_oclusao",
    "⛔ a ordem das faltas é por quantas recomendações dependem do dado");

  confere("⚠️ a exceção existe: falta UM dado ⛔ e o cartão aparece inteiro",
    A.faixaDoItem(leitura({ correspondencia: "potencialmente_aplicavel", faltam: ["nihss"] }), []) === "a_um_dado"
    && A.faixaDoItem(leitura({ correspondencia: "potencialmente_aplicavel", faltam: ["nihss","aspects"] }), []) === "potencial_recolhida",
    "⛔ com um dado só a informação individual é acionável agora; com dois, ⛔ não");
}

// ══ DECISÃO 5 · FRASE CLÍNICA NA FRENTE, CONTAGEM ATRÁS ═══════════════════
{
  confere("⚠️⚠️ TODO insumo tem frase clínica, ⛔ e ⛔ nenhuma fala de recomendações",
    Object.values(C.MOTIVO_CLINICO).every((m) => typeof m === "string" && m.length > 20)
    && !Object.values(C.MOTIVO_CLINICO).some((m) => /\d+\s*recomenda/i.test(m)),
    "⛔ 'abre 11' é informação de arquitetura — o médico precisa saber PARA QUE o dado serve");

  confere("⚠️ a falta agrupada carrega a frase, ⛔ e ⛔ não só o número",
    A.faltasAgrupadas([{ leitura: leitura({ faltam: ["nihss","peso"], correspondencia: "potencialmente_aplicavel" }), faixa: "potencial_recolhida", relogios: [] }])
      .every((f) => f.motivo === C.MOTIVO_CLINICO[f.insumo]),
    "⛔ a tela ⛔ não pode inventar a frase: ela vem do conteúdo");

  /**
   * ⚠️⚠️ DUAS FRASES IGUAIS SÃO DUAS LINHAS INDISTINGUÍVEIS.
   *
   * ⛔ `dwi_menor_que_um_terco` e `flair_sem_alteracao_marcada` compartilhavam o
   * texto, e o agrupamento mostrava a MESMA frase duas vezes — ⛔ sem o médico
   * poder saber que eram perguntas distintas. Achado na revisão em celular.
   */
  {
    const frases = Object.values(C.MOTIVO_CLINICO);
    confere("⚠️⚠️ ⛔ NENHUM insumo repete a frase clínica de outro",
      new Set(frases).size === frases.length,
      "⛔ duas linhas idênticas na lista de faltas ⛔ não dizem qual delas já foi respondida");
  }

  /**
   * ⚠️⚠️ A CAUDA RECOLHE — ⛔ 9 cartões de mesmo peso é a poluição de volta,
   * ⛔ só trocando recomendações por dados.
   */
  confere("⚠️⚠️ o primeiro plano é limitado, ⛔ e a cauda fica a um toque",
    A.FALTAS_EM_PRIMEIRO_PLANO >= 3 && A.FALTAS_EM_PRIMEIRO_PLANO <= 5
    && /slice\(0, FALTAS_EM_PRIMEIRO_PLANO\)/.test(fonteTela)
    && /testID="avc-f-faltas-resto"/.test(fonteTela),
    "⛔ o autor pediu os dados que MAIS destravam — ⛔ e ⛔ não todos com o mesmo peso");

  confere("⚠️ ⛔ e ⛔ NADA é escondido: a cauda abre",
    /abertos\.includes\("__faltas__"\)\s*\n?\s*\?\s*faltas/.test(fonteTela),
    "⛔ recolher ⛔ não pode virar sumir — o dado continua colhível");

  /** ⚠️ Tipografia é a decisão: a frase é `body`, a contagem é `micro`. */
  confere("⚠️⚠️ na tela a frase é MAIOR que a contagem",
    /faltaMotivo:\s*\{[^}]*TIPOGRAFIA\.body\.fontSize/.test(fonteTela)
    && /faltaQuantas:\s*\{[^}]*TIPOGRAFIA\.micro\.fontSize/.test(fonteTela),
    "⛔ pôr o número grande devolveria a mensagem de arquitetura ao primeiro plano");
}

// ══ DECISÃO 2 · AS DUAS RAIAS, SEMPRE ═════════════════════════════════════
{
  confere("⚠️⚠️ as duas raias são renderizadas SEM condicional",
    /<Raia[^>]*terapia="ivt"/.test(fonteTela) && /<Raia[^>]*terapia="evt"/.test(fonteTela)
    && !/\?\s*<Raia/.test(fonteTela),
    "⛔ esconder uma faria ler sequência ou exclusão onde a fonte grada COR 1 · LOE A que ⛔ não há");

  confere("⚠️ a faixa de paralelismo ⛔ também ⛔ NÃO é condicional",
    /testID="avc-f-paralelismo"/.test(fonteTela)
    && !/\?[^]{0,80}testID="avc-f-paralelismo"/.test(fonteTela),
    "⛔ ela é a afirmação de que uma ⛔ não atrasa a outra — ⛔ e some justamente quando faltar dado");

  confere("⚠️ o placar conta por terapia, ⛔ sem a tela recontar",
    A.placar([
      { leitura: leitura({ terapia: "ivt" }), faixa: "aplicavel", relogios: [] },
      { leitura: leitura({ terapia: "evt" }), faixa: "aplicavel", relogios: [] },
    ], "ivt").aplicavel === 1,
    "⛔ contagem no JSX é a mesma regra em dois lugares (I6)");
}

// ══ DECISÃO 3 · DÍVIDA VISÍVEL E COMPACTA ═════════════════════════════════
{
  confere("⚠️⚠️ dívida de fonte tem faixa PRÓPRIA, ⛔ e ⛔ não vira 'falta dado'",
    A.faixaDoItem(leitura({ correspondencia: "nao_avaliavel", travadaPor: "F-31", faltam: ["nao_elegivel_a_evt"] }), []) === "sem_fonte",
    "⛔ 'o app ⛔ não consegue avaliar' ⛔ não é 'falta um dado do paciente' — são coisas diferentes");

  confere("⚠️⚠️ ⛔ e ⛔ NÃO entra no agrupamento de faltas",
    A.faltasAgrupadas([{ leitura: leitura({ correspondencia: "nao_avaliavel", faltam: ["nao_elegivel_a_evt"] }), faixa: "sem_fonte", relogios: [] }]).length === 0,
    "⛔ apareceria como dado a colher, ⛔ e ⛔ não há o que colher: a fonte é que ⛔ não fecha");

  confere("⚠️ a dívida usa a COR PRÓPRIA do tema, ⛔ e ⛔ não warning",
    /dividaMarcador:[^}]*tema\.cores\.debt/.test(fonteTela)
    && !/dividaMarcador:[^}]*tema\.cores\.warning/.test(fonteTela),
    "⛔ ⛔ as duas em âmbar apagam a distinção que a Superfície F existe para manter");

  confere("⚠️⚠️ o texto curto está na tela ⛔ e o longo só ao expandir",
    /Critério não definido pela fonte/.test(fonteTela)
    && /aberto \?[^]{0,400}dividaDetalhe/.test(fonteTela),
    "⛔ ocupar meia tela para dizer que o app ⛔ não sabe faria da dívida a protagonista");

  confere("⚠️ ⛔ e a dívida ⛔ NÃO é pintada como erro",
    !/divida[A-Za-z]*:[^}]*tema\.cores\.critical/.test(fonteTela),
    "⛔ ⛔ não há nada de errado acontecendo — há um limite da diretriz, declarado");
}

// ══ ⚠️⚠️ OS RELÓGIOS ══════════════════════════════════════════════════════
{
  confere("⚠️⚠️ TODO marco da fonte tem origem declarada",
    ["symptom_onset","last_known_well","onset_ou_lkw","symptom_recognition","midpoint_of_sleep"]
      .every((m) => A.ORIGEM_DO_MARCO[m] !== undefined),
    "⛔ marco sem origem viraria relógio mudo na tela");

  /**
   * ⚠️⚠️ A LACUNA FOI FECHADA COM UM MARCO PRÓPRIO — ⛔ e ⛔ não reaproveitando.
   *
   * ⛔ §4.6.3 rec. 2 cita *midpoint of sleep* ⛔ **e** *last known well* na MESMA
   * recomendação, com faixas diferentes. Apontar um para o campo do outro
   * fundiria as duas contagens numa só.
   */
  confere("⚠️⚠️ o meio do sono tem CAMPO PRÓPRIO em A",
    A.ORIGEM_DO_MARCO.midpoint_of_sleep.tipo === "campo"
    && A.ORIGEM_DO_MARCO.midpoint_of_sleep.campo === "hora_meio_do_sono",
    "⛔ é fato temporal semanticamente independente dos outros quatro");

  /** ⚠️⚠️ TODOS os campos de marco, desmontando a disjunção — ⛔ nenhum repetido. */
  {
    const todos = ["symptom_onset","last_known_well","symptom_recognition","midpoint_of_sleep","onset_ou_lkw"]
      .flatMap((m) => A.camposDoMarco(m));
    const unicos = new Set(todos);
    confere("⚠️⚠️ o meio do sono ⛔ NÃO reusa ⛔ nenhum dos outros relógios",
      !A.camposDoMarco("last_known_well").includes("hora_meio_do_sono")
      && !A.camposDoMarco("symptom_onset").includes("hora_meio_do_sono")
      && !A.camposDoMarco("symptom_recognition").includes("hora_meio_do_sono")
      && !todos.includes("hora_chegada"),
      "⛔ reaproveitar LKW, início, reconhecimento ou chegada é a fusão de relógios com outro nome");

    confere("⚠️ ⛔ e são CINCO campos de marco distintos",
      unicos.size === 4 && unicos.has("hora_meio_do_sono"),
      "⛔ quatro campos servindo cinco marcos — a disjunção reusa dois de propósito, ⛔ e ⛔ nada além dela");
  }

  /**
   * ⚠️ O tipo `sem_campo` CONTINUA existindo, ⛔ e hoje ⛔ ninguém o usa.
   * ⛔ Removê-lo obrigaria o próximo marco sem campo a mentir que tem um.
   */
  confere("⚠️ ⛔ nenhum marco fica sem campo hoje",
    Object.values(A.ORIGEM_DO_MARCO).every((o) => o.tipo === "campo"),
    "⛔ marco sem campo é relógio que ⛔ nunca conta — se voltar, tem que ser declarado");

  /** ⚠️⚠️ A disjunção da fonte vira DUAS contagens, ⛔ não uma escolhida. */
  const dois = A.relogiosDaJanela(
    { marco: "onset_ou_lkw", ateHoras: 4.5, verbatim: "within 4.5 hours of symptom onset or last known well" },
    (campo) => (campo === "hora_inicio_observado" ? 60 : 120)
  );
  confere("⚠️⚠️ 'onset OU last known well' com os dois registrados dá DUAS contagens",
    dois.length === 2 && new Set(dois.map((r) => r.rotulo)).size === 2,
    "⛔ escolher a mais conservadora seria regra clínica que a fonte ⛔ não deu");

  confere("⚠️ ⛔ e ⛔ sem ⛔ nenhum dos dois o relógio ⛔ NÃO conta",
    A.relogiosDaJanela({ marco: "onset_ou_lkw", ateHoras: 4.5, verbatim: "v" }, semRelogio)[0].estado === "sem_marco",
    "⛔ E-52: ausência de marco ⛔ não pode virar contagem a partir de agora");

  confere("⚠️ janela vencida ⛔ NÃO some ⛔ e ⛔ não vira zero",
    A.relogiosDaJanela({ marco: "symptom_onset", ateHoras: 6, verbatim: "v" }, () => 400)[0].restantesMin < 0,
    "⛔ a recomendação continua existindo, e a decisão continua sendo do médico");

  confere("⚠️⚠️ a faixa de horas usa VÍRGULA, ⛔ e ⛔ não ponto",
    /numeroCurto\(r\.ateHoras/.test(fonteTela) && !/\{r\.ateHoras\}/.test(fonteTela),
    "⛔ 4.5 h ⛔ não é como se escreve meia hora em PT-BR ⛔ nem em ES");

  confere("⚠️ a tela nomeia o relógio JUNTO do número",
    /relogioMarco/.test(fonteTela) && /relogioTempo/.test(fonteTela),
    "⛔ E-36: prazo sem o nome do seu marco esconde de QUE ele é contado");

  confere("⚠️⚠️ ⛔ e ⛔ NÃO existe contador global na tela",
    !/\bjanela\b\s*[:=]/i.test(fonteTela) && !/contadorGlobal|relogioGeral/.test(fonteTela),
    "⛔ 'a janela' é exatamente a fusão que os cinco marcos proíbem");
}

// ══ ⚠️⚠️ O MEIO DO SONO EM A: EXISTE, É INFORMADO, ⛔ E ⛔ NÃO É CALCULADO ══
{
  const campo = SA.TODOS_OS_CAMPOS_A.find((c) => c.id === "hora_meio_do_sono");

  confere("⚠️⚠️ o marco existe em A, como HORA e com relógio próprio",
    campo !== undefined && campo.tipo === "hora" && campo.relogio === "meio_do_sono",
    "⛔ ⛔ não é um sim/não sobre ter havido sono — é um INSTANTE");

  confere("⚠️⚠️ ⛔ e o relógio dele ⛔ NÃO é o de ⛔ nenhum outro marco",
    new Set(SA.TODOS_OS_CAMPOS_A.filter((c) => c.relogio).map((c) => c.relogio)).size ===
      SA.TODOS_OS_CAMPOS_A.filter((c) => c.relogio).length,
    "⛔ dois campos com o mesmo relógio é a fusão que a Superfície F existe para impedir");

  /** ⚠️⚠️ E-02: desconhecido ⛔ NÃO é ausência de resposta. */
  confere("⚠️⚠️ 'ninguém sabe dizer' é RESPOSTA neste marco",
    campo.aceitaDesconhecido === true,
    "⛔ E-02: sem isso, ⛔ não perguntei e ⛔ ninguém sabe virariam a mesma coisa");

  confere("⚠️ ⛔ e ⛔ NENHUMA hora vem pré-preenchida",
    campo.valorInicial === undefined && campo.padrao === undefined,
    "⛔ E-52: instante fabricado é o pior defeito possível num relógio clínico");

  /** ⚠️⚠️ APARECE SÓ NO CONTEXTO — ⛔ e a condição é DADO, ⛔ não código na tela. */
  confere("⚠️⚠️ aparece condicionalmente, ⛔ e a condição está DECLARADA no campo",
    campo.apareceQuando !== undefined
    && typeof campo.apareceQuando.campo === "string"
    && typeof campo.apareceQuando.valor === "string",
    "⛔ condição escrita no componente ⛔ não se prova, ⛔ e vira ruído em A quando alguém a esquecer");

  /**
   * ⚠️⚠️ A CONDIÇÃO É O CONTEXTO DE WAKE-UP — ⛔ e ⛔ NÃO início desconhecido.
   *
   * ⛔ `hora_inicio_observado = nao_sei` era amplo demais: início ⛔ não
   * testemunhado inclui paciente que estava **acordado**, para quem a pergunta
   * "meio do sono" ⛔ não faz sentido. A fonte diz *"awake with stroke
   * symptoms"* — ⛔ e ⛔ ter dormido ⛔ não é acordar com o déficit.
   */
  {
    const gatilho = SA.TODOS_OS_CAMPOS_A.find((c) => c.id === campo.apareceQuando.campo);
    confere("⚠️⚠️ o gatilho é o FATO de wake-up, ⛔ e ⛔ não um relógio",
      campo.apareceQuando.campo === "acordou_com_deficit"
      && campo.apareceQuando.valor === "Sim",
      "⛔ inferir wake-up de início desconhecido inclui paciente que estava acordado");

    confere("⚠️⚠️ ⛔ e o gatilho ⛔ NÃO é ⛔ nenhum campo de hora",
      gatilho !== undefined && gatilho.tipo === "escolha" && gatilho.relogio === undefined,
      "⛔ derivar contexto clínico de um relógio é inferência que a fonte ⛔ não autoriza");

    confere("⚠️⚠️ ⛔ ter dormido ⛔ NÃO é a pergunta — acordar COM O DÉFICIT é",
      /déficit/i.test(gatilho.rotulo) && /acord/i.test(gatilho.rotulo),
      "⛔ quem dormiu ⛔ e teve o início testemunhado acordado ⛔ não é wake-up");

    /** ⚠️ E-02: incerteza ⛔ não abre o campo ⛔ e ⛔ não some da tela. */
    confere("⚠️ só o SIM abre o marco — ⛔ 'Incerto' ⛔ não",
      gatilho.opcoes.includes("Incerto") && campo.apareceQuando.valor === "Sim",
      "⛔ abrir no incerto pediria um instante que talvez ⛔ nem exista");
  }

  /**
   * ⚠️⚠️ DECLARAR ⛔ NÃO É OBEDECER — a mutação N28 apagava o filtro da tela de A
   * ⛔ e sobrevivia: o campo seguia declarando a condição, ⛔ e a tela mostrava
   * o campo sempre. Presença ⛔ não é efeito.
   */
  confere("⚠️⚠️ a tela de A OBEDECE à condição, ⛔ e ⛔ não só a declara",
    /\.filter\(\s*\(campo\)\s*=>\s*campoAparece\(/.test(fonteTelaA)
    && /campoAparece/.test(fonteTelaA),
    "⛔ condição declarada ⛔ e ⛔ não aplicada é ruído em A com aparência de decisão");

  confere("⚠️ ⛔ e ⛔ NENHUM outro campo de A ficou condicionado por acidente",
    SA.TODOS_OS_CAMPOS_A.filter((c) => c.apareceQuando).length === 1,
    "⛔ esconder campo por engano é pior que poluir: ⛔ ninguém procura o que ⛔ não sabe que existe");

  /** ⚠️⚠️ A PROCEDÊNCIA É DADO, ⛔ e o proibido é EXECUTÁVEL. */
  const proc = SA.MEIO_DO_SONO_PROCEDENCIA;
  confere("⚠️⚠️ a procedência declara INFORMADO ⛔ e ⛔ nenhum cálculo",
    proc.origem === "informado" && proc.calculadoPor === null
    && ["hora_ultima_vez_bem", "hora_inicio_observado", "hora_reconhecimento", "hora_chegada"]
      .every((c) => proc.naoDerivarDe.includes(c)),
    "⛔ PD-17: calculado e informado ⛔ não se confundem, ⛔ e ⛔ nenhum sobrescreve o outro");

  confere("⚠️⚠️ ⛔ e ⛔ NADA no app calcula este instante",
    !new RegExp("hora_meio_do_sono").test(fonteDeriv)
    && !/hora_meio_do_sono\s*[,)]?\s*[:=][^;]*hora_(ultima_vez_bem|inicio_observado|reconhecimento|chegada)/.test(fonteSupA + fonteA),
    "⛔ derivar do último-visto-bem é exatamente o que a fonte proíbe ao citar os DOIS na mesma recomendação");

  confere("⚠️ se um dia houver cálculo, ele será OUTRO fato",
    proc.calculoSubstituiOInformado === false,
    "⛔ substituir em silêncio o valor informado é a perda de procedência que PD-17 proíbe");
}

// ══ ⚠️⚠️ NAVEGAÇÃO: INSUMO ⛔ NÃO É CAMPO ═════════════════════════════════
{
  const insumos = Object.keys(C.MOTIVO_CLINICO);
  confere("⚠️⚠️ TODO insumo declara onde é respondido",
    insumos.every((i) => Array.isArray(A.CAMPOS_DO_INSUMO[i])),
    "⛔ insumo sem campo declarado vira toque que ⛔ não faz nada, ⛔ sem erro visível");

  confere("⚠️⚠️ ⛔ e ⛔ NENHUM insumo usa o próprio nome como campo por acidente",
    A.CAMPOS_DO_INSUMO.sitio_da_oclusao[0] === "sitio_oclusao"
    && A.CAMPOS_DO_INSUMO.deficit_incapacitante[0] === "incapacitante_assumido"
    && A.CAMPOS_DO_INSUMO.efeito_de_massa_ausente[0] === "efeito_de_massa",
    "⛔ os nomes ⛔ NÃO coincidem — mandar o insumo abriria campo ⛔ nenhum");

  confere("⚠️⚠️ o insumo travado por F-31 ⛔ NÃO tem campo, e isso é a resposta",
    A.CAMPOS_DO_INSUMO.nao_elegivel_a_evt.length === 0,
    "⛔ criar campo pediria ao médico que decidisse questão que a FONTE deixou aberta");

  confere("⚠️ dado com duas propriedades declara os DOIS campos",
    A.CAMPOS_DO_INSUMO.deficit_leve_nao_incapacitante.length === 2
    && A.CAMPOS_DO_INSUMO.peso.length === 2,
    "⛔ levar a um só faria o médico responder metade ⛔ e achar que fechou");
}

// ══ ⚠️⚠️ O QUE A TELA ⛔ NÃO PODE DIZER ═══════════════════════════════════
{
  confere("⚠️⚠️ a palavra 'contraindicado' ⛔ NÃO existe na tela",
    !/contraindicad/i.test(fonteTela),
    "⛔ COR 3 da fonte é *not recommended* / *No Benefit* — converter inventa força que ela ⛔ não deu");

  confere("⚠️⚠️ ⛔ e ⛔ NÃO existe veredito de elegibilidade",
    !/pode trombolisar|podeTrombolisar|elegivelIvt|elegivel_ivt/i.test(fonteTela + fonteA),
    "⛔ o núcleo foi construído para ⛔ não produzir esse juízo; a tela ⛔ não pode produzi-lo por fora");

  confere("⚠️⚠️ a tela ⛔ NÃO decide correspondência — ela lê",
    !/correspondenciaDe|valorDoInsumo/.test(fonteTela),
    "⛔ regra clínica em componente é regra que ⛔ não se prova (I6)");

  confere("⚠️ o cálculo de dose se declara ⛔ NÃO administração",
    /não é administração/.test(fonteTela),
    "⛔ número na tela sem essa frase lê como prescrição executada");

  confere("⚠️⚠️ ⛔ e a tela ⛔ NÃO estima peso",
    !/pesoEstimado|estimarPeso|pesoPadrao|\b70\b/.test(fonteTela),
    "⛔ E-52: peso ausente ⛔ não pode virar valor fabricado — a dose simplesmente ⛔ não sai");

  confere("⚠️ princípio geral ⛔ NÃO recebe veredito de correspondência",
    /Não afirma corresponder a este caso/.test(fonteTela)
    && !/PRINCIPIOS_GERAIS[^]{0,200}correspondencia/.test(fonteTela),
    "⛔ ele pressupõe elegibilidade ⛔ e ⛔ não a avalia");

  confere("⚠️⚠️ a tela ⛔ NÃO escreve cor em hexadecimal",
    !/#[0-9a-fA-F]{3,8}\b/.test(fonteTela),
    "⛔ cor fora do design system é a duplicação que a trava de paleta nasceu para impedir");
}

// ── relatório ────────────────────────────────────────────────────────────
fs.rmSync(tmp, { recursive: true, force: true });
if (falhas.length > 0) {
  console.error(`\n❌ APRESENTAÇÃO DA SUPERFÍCIE F — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`✅ APRESENTAÇÃO DA SUPERFÍCIE F — ${ok}/${ok} conferências`);
