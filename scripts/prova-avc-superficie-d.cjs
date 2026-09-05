/**
 * PROMETE: que a Superfície D interprete segurança **sem virar veredito** — que
 *   ⛔ não exista estado agregado "contraindicado" ⛔ nem "elegível"; que **todo**
 *   item carregue o **verbo da própria fonte**; que a gradação da faixa dita
 *   absoluta seja preservada literalmente; que D ⛔ **não declare** ⛔ nenhum fato de
 *   Paciente, Laboratório, A ou C; que `unknown` ⛔ nunca vire negativo, ausência
 *   ⛔ nunca vire negativo e desconhecido ⛔ nunca vire valor fabricado; que a janela
 *   de 48 h do DOAC ⛔ **não seja calculada** enquanto F-30 estiver aberta; e que
 *   ⛔ **só** condição realmente resolvível gere pendência.
 * NÃO PROMETE: que os cortes clínicos estejam certos — eles são transcrição, e
 *   quem os confere é o autor contra o verbatim. ⛔ Também ⛔ não mede tela: isso é
 *   `e2e/avc-superficie-d`. E ⛔ não confere tradução — é `test:i18n-opcoes`.
 * UNIVERSO: `avc/conteudo/superficie-d.ts` inteiro (todos os itens de
 *   `ITENS_DE_SEGURANCA`, contados, com piso) e todas as derivações de
 *   `avc/nucleo/derivacoes-d.ts`, mais os campos de Paciente e Laboratório que D
 *   lê. ⛔ Fora do universo: as superfícies E a G.
 *
 * ── ⚠️⚠️ O QUE ESTA TRAVA EXISTE PARA IMPEDIR ────────────────────────────────
 *
 * > *"O ponto mais delicado continua sendo manter **verbo da fonte + estado
 * > derivado** sem transformar tudo num 'pode/⛔ não pode trombolisar'
 * > simplificado."* — autor, 2026-08-30
 *
 * ⚠️ Um atalho de linguagem aqui vira **bloqueio clínico mais forte do que a
 * diretriz sustenta** — e ⛔ nenhum teste de comportamento pegaria isso, porque o
 * app continuaria "funcionando".
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-d-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "instancia.ts"),
  path.join(appDir, "avc", "nucleo", "selecao.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-d.ts"),
  path.join(appDir, "avc", "conteudo", "paciente.ts"),
  path.join(appDir, "avc", "conteudo", "laboratorio.ts"),
  path.join(appDir, "avc", "conteudo", "campos.ts"),
  path.join(appDir, "avc", "conteudo", "fontes.ts"),
], { cwd: appDir, stdio: "pipe" });

const R = require(path.join(tmp, "avc", "nucleo", "relogio.js"));
const E = require(path.join(tmp, "avc", "nucleo", "estado.js"));
const I = require(path.join(tmp, "avc", "nucleo", "instancia.js"));
const D = require(path.join(tmp, "avc", "nucleo", "derivacoes-d.js"));
const S = require(path.join(tmp, "avc", "conteudo", "superficie-d.js"));
const P = require(path.join(tmp, "avc", "conteudo", "paciente.js"));
const L = require(path.join(tmp, "avc", "conteudo", "laboratorio.js"));
const CAMPOS = require(path.join(tmp, "avc", "conteudo", "campos.js"));
const FONTES = require(path.join(tmp, "avc", "conteudo", "fontes.js"));

const rel = R.relogioControlado(1_000_000);
const est = E.abrirAtendimento(rel);
const reg = (e, campo, valor) => E.registrarFato(e, { campo, valor }, rel);
const c1 = I.nomeDaInstancia(L.COLETA, 1);
const c2 = I.nomeDaInstancia(L.COLETA, 2);
const regL = (e, coleta, campo, valor) =>
  CAMPOS.registrarComInstancia(e, { campo, valor }, rel, coleta);
/**
 * ⚠️⚠️ MARCA PELA PORTA REAL — `alternarItem`, e ⛔ **não** um `join` escrito aqui.
 *
 * ⛔ O separador da seleção múltipla é **privado** (`\u001e`), e escrevê-lo à mão
 * na trava foi o erro: com `" | "` a composição virava **um item só**, e a trava
 * mediria um estado que a tela ⛔ nunca produz. É a mesma família da I6.
 */
const SEL = require(path.join(tmp, "avc", "nucleo", "selecao.js"));
const marca = (e, campo, ...opcoes) => {
  let bruto = undefined;
  for (const o of opcoes) bruto = SEL.alternarItem(bruto, o, ["Nenhum destes", "Não sei"]);
  return reg(e, campo, bruto);
};

// ── 0 · O UNIVERSO ────────────────────────────────────────────────────────
{
  confere("o mapa de itens de segurança foi carregado",
    S.ITENS_DE_SEGURANCA.length >= 25,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  /**
   * ⚠️⚠️ OS OITO ESTADOS, NOMEADOS UM A UM — e ⛔ não contados.
   *
   * ⚠️ A mutação que acrescentava `sem_restricao_declarada` de volta ao tipo
   * passava: união de tipos é **apagada em runtime**, e ⛔ nenhuma derivação
   * precisaria usá-la para o nome estar lá, esperando alguém. ⚠️ O nome recusado
   * pelo autor ⛔ não pode voltar ⛔ nem como membro morto.
   */
  const fonteD = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-d.ts"));
  const uniao = fonteD.slice(fonteD.indexOf("export type EstadoDeSeguranca"));
  const estados = (uniao.slice(0, uniao.indexOf(";")).match(/"([a-z_]+)"/g) ?? [])
    .map((x) => x.replace(/"/g, "")).sort();
  confere("os OITO estados são exatamente os aprovados",
    JSON.stringify(estados) === JSON.stringify([
      "baixa_preocupacao_declarada", "bloqueio_corrigivel",
      "contraindicacao_nao_corrigivel", "desconhecido", "informacao_insuficiente",
      "nao_perguntado", "risco_aumentado", "situacao_individualizada",
    ]),
    `estado a mais é espécie clínica nova entrando sem decisão — ${estados.join(", ")}`);
  confere("⛔ e o nome recusado pelo autor ⛔ NÃO existe em lugar nenhum",
    !/sem_restricao/.test(fonteD),
    "*\"'Sem restrição' soa mais forte do que a diretriz permite e pode ser lido como 'liberado'\"*");

  confere("os três blocos da fonte estão representados",
    S.ITENS_INTRACRANIANOS.length >= 10
    && S.ITENS_SISTEMICOS.length >= 8
    && S.ITENS_PROCEDIMENTOS.length >= 10,
    "a Table 8 tem três famílias, e cobrir uma só deixaria duas sem interpretação");
}

// ── 1 · ⛔ D ⛔ NÃO É DEPÓSITO DE FATOS ────────────────────────────────────────
{
  /**
   * ⚠️⚠️ A REGRA CENTRAL: *"D é proprietária da **interpretação** de segurança,
   * ⛔ não dos fatos"*. Ela declara **três** campos, e os três são **juízo**.
   */
  confere("D declara ⛔ SÓ três fatos próprios, e todos são juízo",
    S.FATOS_PROPRIOS_D.length === 3
    && S.FATOS_PROPRIOS_D.every((c) => c.temporalidade === "estado"),
    "antecedente em D é o começo do depósito de fatos que a arquitetura recusou");
  confere("e os três são exatamente os aprovados",
    JSON.stringify(S.FATOS_PROPRIOS_D.map((c) => c.id).sort())
      === JSON.stringify(["incerteza_diagnostica", "motivo_para_suspeitar_alteracao_coagulacao", "sangramento_tratado"]),
    "cada um tem razão declarada de ⛔ não estar em Paciente");

  /** ⚠️⚠️ E ⛔ NENHUM antecedente da fonte foi redeclarado aqui. */
  const idsDeD = S.TODOS_OS_CAMPOS_D.map((c) => c.id);
  const idsDeP = P.TODOS_OS_CAMPOS_P.map((c) => c.id);
  confere("⛔ NENHUM campo de D repete id de Paciente",
    idsDeD.every((id) => !idsDeP.includes(id)),
    "id repetido em duas casas é o mesmo fato com dois donos — e dois donos divergem");
  confere("⛔ e ⛔ NENHUM repete id do Laboratório",
    idsDeD.every((id) => !L.TODOS_OS_CAMPOS_L.some((c) => c.id === id)),
    "os cortes são lidos de lá, e ⛔ não copiados para cá");
  confere("todo item do mapa aponta para campo que EXISTE na casa dele",
    S.ITENS_DE_SEGURANCA.every((i) => idsDeP.includes(i.campo)),
    "item apontando para campo inexistente é trava medindo o nada");
  confere("e toda opção do mapa EXISTE na lista do campo de Paciente",
    S.ITENS_DE_SEGURANCA.every((i) => {
      const campo = P.TODOS_OS_CAMPOS_P.find((c) => c.id === i.campo);
      return campo && campo.opcoes.includes(i.opcao);
    }),
    "⚠️ casar por rótulo exige que o rótulo seja o MESMO: melhorar o texto de um lado quebraria a interpretação em silêncio");
  /** ⚠️ §7.3 — ⛔ só a consulta recolhe; o juízo decide agora. */
  confere("⛔ SÓ o bloco de consultas nasce recolhido",
    S.GRUPOS_D.filter((g) => g.recolhido === true).map((g) => g.id).join(",") === "consultas",
    "recolher o juízo de segurança esconderia o que decide agora; deixar as consultas abertas empurra o juízo para fora da primeira dobra");
  confere("⛔ NENHUM campo de D bloqueia terapia",
    S.TODOS_OS_CAMPOS_D.every((c) => c.bloqueiaTerapia === false),
    "**PD-23**/**E-43**: bloqueio é estado derivado, e ⛔ nunca propriedade de campo");
}

// ── 2 · ⛔ ⛔ NÃO EXISTE VEREDITO AGREGADO ─────────────────────────────────────
{
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"));
  /**
   * ⚠️⚠️ A CONFERÊNCIA MAIS IMPORTANTE DO ARQUIVO. ⚠️ Ela mede a **forma da
   * afirmação**, e ⛔ não a presença de palavras: o que ⛔ não pode existir é uma
   * função que devolva "pode" ou "⛔ não pode".
   */
  const veredito = /export function (podeTrombolisar|elegivel|contraindicado|liberado|apto)\b/i;
  confere("⛔ ⛔ NÃO existe função de veredito agregado",
    !veredito.test(fonte),
    "uma função dessas achataria oito estados num booleano, e o booleano seria lido como veredito (E-43, E-46)");
  confere("⛔ e ⛔ nenhuma leitura de D usa a palavra elegível ou contraindicado",
    !/elegív|elegib|contraindicad/i.test(
      D.leiturasDaSuperficieD(est).map((l) => `${l.curto} ${l.texto}`).join(" ")),
    "**E-46**: o sistema apoia, e ⛔ não profere veredito");

  /**
   * ⚠️⚠️ **E-45 · A GRADAÇÃO DA FAIXA 3, MEDIDA PELAS QUATRO FORMAS DA FONTE** —
   * e ⛔ não por contagem de verbos distintos.
   *
   * ⚠️ A primeira versão media `new Set(verbos).size >= 4`, e a mutação passou:
   * com seis itens na faixa, dá para **achatar dois** e ainda sobrar quatro
   * formas. ⛔ Contagem tolera achatamento; a lista nomeada, ⛔ não.
   */
  const verbos3 = S.ITENS_DE_SEGURANCA.filter((i) => i.faixa === "3").map((i) => i.verbo).join(" || ");
  const GRADACAO = [
    "should not be administered",
    "likely contraindicated",
    "potentially harmful",
    "should be avoided",
  ];
  const ausentes = GRADACAO.filter((g) => !verbos3.includes(g));
  confere("as QUATRO formas da faixa absoluta estão presentes",
    ausentes.length === 0,
    `a fonte gradua dentro da própria faixa "absoluta", e achatar é E-45 — faltando: ${ausentes.join(", ") || "—"}`);
  confere("⛔ e ⛔ NENHUMA delas foi usada onde a fonte usou outra",
    S.ITENS_DE_SEGURANCA.filter((i) => i.faixa === "3")
      .filter((i) => i.opcao === "Lesão medular aguda nos últimos 3 meses")
      .every((i) => i.verbo === "likely contraindicated")
    && S.ITENS_DE_SEGURANCA.filter((i) => i.opcao === "Endocardite infecciosa")
      .every((i) => i.verbo === "should not be administered"),
    "trocar o verbo de um item pelo de outro é reescrever a diretriz item a item");
  confere("todo item do mapa carrega verbo ⛔ NÃO vazio",
    S.ITENS_DE_SEGURANCA.every((i) => typeof i.verbo === "string" && i.verbo.length > 10),
    "item sem verbo é item achatado: diria 'risco aumentado' onde a fonte disse 'may be at increased risk'");
  /**
   * ⚠️⚠️ A TRADUÇÃO ⛔ NÃO PODE FORTALECER ⛔ NEM SUAVIZAR — e a trava mede
   * *hedge* a *hedge*, e ⛔ não "existe alguma frase em português".
   */
  const semPar = S.ITENS_DE_SEGURANCA.filter((i) => S.formulacaoDoVerbo(i.verbo) === undefined);
  confere("TODO verbo tem formulação em português declarada",
    semPar.length === 0,
    `verbo sem par cairia no inglês como texto clínico principal — ${semPar.map((i) => i.opcao).join(", ") || "—"}`);

  /** ⚠️⚠️ BIJEÇÃO: mesmo verbo ⇒ mesma frase, sempre. */
  const porVerbo = {};
  S.ITENS_DE_SEGURANCA.forEach((i) => {
    (porVerbo[i.verbo] = porVerbo[i.verbo] || new Set()).add(S.formulacaoDoVerbo(i.verbo));
  });
  confere("mesmo verbo produz SEMPRE a mesma frase",
    Object.values(porVerbo).every((s) => s.size === 1),
    "escrita item a item, a tradução deriva — e uma das cópias fica mais forte que a outra sem ⛔ ninguém perceber");
  const frases = Object.keys(S.FORMULACAO_PT).map((v) => S.FORMULACAO_PT[v]);
  confere("⛔ e frases diferentes ⛔ NÃO colapsam num verbo só",
    new Set(frases).size === frases.length,
    "duas frases idênticas para verbos diferentes é achatamento entrando pela tradução");

  /**
   * ⚠️⚠️ OS PARES DE *HEDGE* — critério de **medição**, e por isso moram aqui.
   *
   * ⚠️ Cada entrada diz: *se o verbo em inglês contém isto, a frase em português
   * precisa conter aquilo*. É o que impede a tradução de **endurecer** um
   * *"may be considered"* em "deve ser feito", ou de **amolecer** um *"should
   * not be administered"* em "avaliar com cautela".
   */
  const HEDGES = [
    { en: "likely", pt: ["provavelmente"] },
    { en: "probably", pt: ["provavelmente"] },
    { en: "may ", pt: ["pode"] },
    { en: "is unknown", pt: ["desconhecid"] },
    { en: "should not be administered", pt: ["não deve ser administrado"] },
    { en: "should be avoided", pt: ["deve ser evitada", "deve ser evitado"] },
    { en: "should be considered", pt: ["deve ser considerado"] },
    { en: "does not appear", pt: ["não parece"] },
  ];
  /**
   * ⛔⛔ AS FORMAS QUE ⛔ NENHUMA FORMULAÇÃO PODE TER — ⛔ nem a mais favorável. Elas
   * são o **veredito** entrando pela porta da tradução (**E-46**).
   */
  const PROIBIDAS = [
    "liberado", "libera a trombólise", "pode trombolisar", "não pode trombolisar",
    "elegível", "não elegível", "está contraindicado", "é seguro", "sem risco",
  ];

  const perdidos = [];
  for (const i of S.ITENS_DE_SEGURANCA) {
    const pt = S.formulacaoDoVerbo(i.verbo) ?? "";
    for (const h of HEDGES) {
      if (i.verbo.toLowerCase().includes(h.en) && !h.pt.some((x) => pt.includes(x))) {
        perdidos.push(`${i.opcao}: "${h.en}"`);
      }
    }
  }
  confere("⛔ NENHUM hedge do inglês se perde na tradução",
    perdidos.length === 0,
    `perder um "likely" ou um "may" transforma consideração em regra — ${perdidos.slice(0, 3).join(" · ") || "—"}`);

  const proibidas = frases.filter((f) => PROIBIDAS.some((x) => f.toLowerCase().includes(x)));
  confere("⛔ e ⛔ NENHUMA formulação usa forma de veredito",
    proibidas.length === 0,
    `"liberado", "é seguro", "elegível" seriam o veredito entrando pela porta da tradução (E-46) — ${proibidas.join(" · ") || "—"}`);

  confere("⛔ e ⛔ NENHUM verbo foi traduzido",
    S.ITENS_DE_SEGURANCA.every((i) => !/[áàâãéêíóôõúç]/i.test(i.verbo)),
    "traduzir o verbo de uma diretriz é reescrevê-lo");
}

// ── 3 · OS PARES DE E-06 — mesma família, faixas opostas ──────────────────
{
  const estadoDe = (opcao) => S.ITENS_DE_SEGURANCA.find((i) => i.opcao === opcao)?.estado;
  confere("neoplasia intra-axial × extra-axial ⛔ NÃO caem no mesmo estado",
    estadoDe("Neoplasia intracraniana intra-axial") === "contraindicacao_nao_corrigivel"
    && estadoDe("Neoplasia intracraniana extra-axial") === "baixa_preocupacao_declarada",
    "**E-06**: mesma família anatômica, faixas opostas — fundi-las inverteria a conduta");
  confere("dissecção cervical × intracraniana ⛔ NÃO caem no mesmo estado",
    estadoDe("Dissecção arterial cervical extracraniana") === "baixa_preocupacao_declarada"
    && estadoDe("Dissecção arterial intracraniana") === "informacao_insuficiente",
    "idem — e aqui a diferença é entre 'reasonably safe' e 'safety is unknown'");
  confere("neurocirurgia <14 dias × 14 dias a 3 meses ⛔ NÃO caem no mesmo estado",
    estadoDe("Neurocirurgia nos últimos 14 dias") === "contraindicacao_nao_corrigivel"
    && estadoDe("Neurocirurgia entre 14 dias e 3 meses") === "situacao_individualizada",
    "a JANELA é o que separa, e uma pergunta binária destruiria a distinção");
  confere("sangramento GI/GU 21 dias × remoto e estável ⛔ NÃO caem no mesmo estado",
    estadoDe("Sangramento gastrointestinal ou geniturinário nos últimos 21 dias") === "risco_aumentado"
    && estadoDe("Sangramento gastrointestinal ou geniturinário remoto e estável") === "situacao_individualizada",
    "idem");
  confere("punção arterial × dural ⛔ NÃO caem no mesmo estado",
    estadoDe("Punção arterial em vaso não compressível nos últimos 7 dias") === "informacao_insuficiente"
    && estadoDe("Punção dural nos últimos 7 dias") === "situacao_individualizada",
    "*safety is unknown* ⛔ não é *may be considered in individual cases*");
}

// ── 4 · AUSÊNCIA ⛔ NUNCA VIRA NEGATIVO ───────────────────────────────────────
{
  confere("estado vazio ⛔ NÃO produz ⛔ nenhum item",
    D.itensMarcados(est).length === 0,
    "**E-23**: silêncio ⛔ não é 'o paciente ⛔ não tem'");
  confere("⛔ e ⛔ NENHUMA leitura de D afirma ausência",
    D.leiturasDaSuperficieD(est).every((l) => !/não tem|ausência de|sem antecedente/i.test(l.curto)),
    "ausência de registro ⛔ não é ausência do fato");
  confere("⛔ e ⛔ NENHUMA pendência nasce da tela vazia",
    D.pendenciasDaSeguranca(est).length === 0,
    "**E-49**: ⛔ nada em D é obrigatório, e a tela vazia ⛔ não cobra");

  /**
   * ⚠️⚠️ DOIS ITENS MARCADOS TRAZEM **DOIS** — conferência acrescentada depois de
   * o helper da trava compor a seleção com o separador errado: com um item só,
   * o defeito ⛔ não aparecia.
   */
  const dois = marca(est, "antecedentes_intracranianos",
    "Neoplasia intracraniana intra-axial", "Doença de Moya-Moya");
  confere("dois itens marcados produzem DUAS leituras, em estados diferentes",
    D.itensMarcados(dois).length === 2
    && new Set(D.itensMarcados(dois).map((i) => i.estado)).size === 2,
    "compor a seleção pelo caminho errado faria a trava medir um estado que a tela ⛔ nunca produz");

  /** ⚠️ Marcar um item ⛔ não marca os outros. */
  const comEndocardite = marca(est, "antecedentes_cardio_sistemicos", "Endocardite infecciosa");
  confere("marcar UM item traz ⛔ SÓ ele",
    D.itensMarcados(comEndocardite).length === 1
    && D.itensMarcados(comEndocardite)[0].id === "Endocardite infecciosa",
    "um antecedente marcado ⛔ não pode arrastar os vizinhos da mesma lista");
}

// ── 5 · SANGRAMENTO TRATADO — o único item com modificação declarada ──────
{
  const opcao = "Sangramento gastrointestinal ou geniturinário nos últimos 21 dias";
  const comSangramento = marca(est, "procedimentos_recentes", opcao);
  confere("antes do tratamento, o estado é risco aumentado",
    D.itensComModificacao(comSangramento)[0].estado === "risco_aumentado",
    "*'may be at increased risk of harm'*");

  const tratado = reg(comSangramento, "sangramento_tratado", "sim");
  confere("tratado, ele passa a situação individualizada",
    D.itensComModificacao(tratado)[0].estado === "situacao_individualizada",
    "*'if the GI/GU bleeding has been treated and risk modified/reduced'*");
  confere("⛔ e ele ⛔ NÃO some da lista",
    D.itensComModificacao(tratado).length === 1,
    "apagá-lo esconderia que houve sangramento");
  confere("⛔ e ⛔ NÃO vira 'sem restrição'",
    D.itensComModificacao(tratado)[0].estado !== "baixa_preocupacao_declarada",
    "a fonte diz que o risco foi **modificado**, e ⛔ não que ele deixou de existir");

  /** ⚠️⚠️ E o tratamento ⛔ NÃO alcança item que a fonte ⛔ não declarou modificável. */
  const outro = reg(marca(est, "procedimentos_recentes", "Punção arterial em vaso não compressível nos últimos 7 dias"), "sangramento_tratado", "sim");
  confere("⛔ e ⛔ NÃO modifica item sem condição declarada",
    D.itensComModificacao(outro)[0].estado === "informacao_insuficiente",
    "⛔ só um item da Table 8 tem condição de modificação, e generalizá-la inventaria conduta");
}

// ── 6 · ⚠️⚠️ O DOAC E A F-30 ─────────────────────────────────────────────────
{
  confere("F-30 existe como slot de fonte, e está ABERTO",
    FONTES.slot("F-30") !== undefined && FONTES.slot("F-30").estado === "aberto",
    "a lacuna é da fonte-mãe: ela usa <48 h e ⛔ não declara o instante de referência");

  const semNada = D.exposicaoADoac(est);
  confere("sem registro, o DOAC é ⛔ não perguntado — e ⛔ não 'sem exposição'",
    semNada.exposicao === "nao_perguntado" && semNada.estado === "nao_perguntado",
    "**E-23**: ⛔ não haver registro ⛔ não é ⛔ não haver exposição");

  const desconhecido = reg(est, "doac_ultima_dose", "nao_sei");
  confere("horário desconhecido é informação insuficiente E individualizada",
    desconhecido && D.exposicaoADoac(desconhecido).estado === "informacao_insuficiente"
    && D.exposicaoADoac(desconhecido).individualizada === true,
    "classificado pelo autor no verbatim: dado desconhecido + pendência clínica + situação individualizada");
  confere("⛔ e ⛔ NUNCA vira contraindicação",
    D.exposicaoADoac(desconhecido).estado !== "contraindicacao_nao_corrigivel",
    "a fonte ⛔ não contraindica ⛔ nem com exposição confirmada");

  const conhecido = E.registrarFato(est, { campo: "doac_ultima_dose", valor: 900_000, horaClinica: 900_000 }, rel);
  /**
   * ⚠️⚠️ A CONFERÊNCIA QUE F-30 EXISTE PARA GUARDAR: **⛔ nem com horário em mãos**
   * a janela é classificada.
   */
  confere("⛔ com horário CONHECIDO, a janela continua ⛔ NÃO classificada",
    D.exposicaoADoac(conhecido).janelaClassificada === false,
    "⛔ sem marco declarado ⛔ não há conta a fazer, e fazer uma seria inventar o relógio");
  confere("⛔ e a leitura ⛔ NÃO diz '<48 h' ⛔ nem 'há N horas'",
    !/48\s*h|menos de 48|há \d+ hora/i.test(
      `${D.exposicaoADoac(conhecido).curto}`),
    "**E-52**: classificação fabricada sobre dado real");
  confere("⛔ e ela DECLARA que o aplicativo ⛔ não calcula",
    /não calcula|não define o instante/i.test(D.exposicaoADoac(conhecido).texto),
    "⛔ silêncio sobre a lacuna faria o médico supor que o app já considerou a janela");
  confere("⛔ e ⛔ NENHUM relógio do módulo é insumo da leitura do DOAC",
    D.exposicaoADoac(conhecido).insumos.every((i) => !/t0|ultima_vez_bem|reconhecimento|chegada/i.test(i)),
    "comparar com qualquer um deles inventaria o marco que a fonte ⛔ não deu");

  /** ⚠️⚠️ E o CÓDIGO ⛔ não pode conter a conta, ⛔ nem escondida. */
  const fonte = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-d.ts"));
  confere("⛔ o código de D ⛔ NÃO contém aritmética de 48 horas",
    !/48\s*\*\s*60|172800000|48\s*\*\s*3600/.test(fonte),
    "a conta escrita é a conta feita, mesmo que ⛔ nenhuma leitura a mostre hoje");
}

// ── 7 · OS CORTES LABORATORIAIS ──────────────────────────────────────────
{
  const semNada = D.corteDoAnalito(est, "inr");
  confere("sem exame, o corte é ⛔ não perguntado — e ⛔ não 'dentro do corte'",
    semNada.estado === "nao_perguntado",
    "**E-23**: exame que ⛔ não voltou ⛔ não é exame normal");

  const inrAlto = regL(est, c1, "inr", 2.1);
  confere("INR acima de 1,7 cruza o corte",
    D.corteDoAnalito(inrAlto, "inr").estado === "contraindicacao_nao_corrigivel",
    "*'INR>1.7 … should not be administered'*");
  confere("e o verbo carrega as DUAS metades da frase da fonte",
    /is unknown/.test(S.VERBO_DOS_CORTES) && /should not be administered/.test(S.VERBO_DOS_CORTES),
    "a fonte declara desconhecimento E mesmo assim contraindica — suavizar qualquer metade é reescrevê-la");

  const inrNormal = regL(est, c1, "inr", 1.1);
  confere("INR dentro do corte ⛔ NÃO restringe",
    D.corteDoAnalito(inrNormal, "inr").estado === "baixa_preocupacao_declarada",
    "e ⛔ não vira 'desconhecido': o valor foi medido");

  /** ⚠️⚠️ SEM UNIDADE ⛔ NÃO HÁ COMPARAÇÃO — herdado do Laboratório, ⛔ não reinventado. */
  const plaqSemUnidade = regL(est, c1, "plaquetas", 80);
  confere("plaquetas SEM unidade declarada é informação insuficiente",
    D.corteDoAnalito(plaqSemUnidade, "plaquetas").estado === "informacao_insuficiente"
    && D.corteDoAnalito(plaqSemUnidade, "plaquetas").razao === "unidade_nao_declarada",
    "⛔ 80 sem unidade ⛔ NÃO é 'abaixo de 100.000' — supor unidade é inventar");
  confere("⛔ e ⛔ NÃO é lido como cruzando o corte",
    D.corteDoAnalito(plaqSemUnidade, "plaquetas").estado !== "contraindicacao_nao_corrigivel",
    "seria contraindicação fabricada sobre unidade que ninguém declarou");

  const plaqMil = regL(plaqSemUnidade, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.milPorMm3);
  confere("declarada mil/mm³, 80 vira 80.000 e cruza o corte",
    D.corteDoAnalito(plaqMil, "plaquetas").estado === "contraindicacao_nao_corrigivel",
    "conversão exata do mesmo valor físico");
  const plaqMm3 = regL(plaqSemUnidade, c1, "plaquetas_unidade", L.UNIDADE_PLAQUETAS.porMm3);
  confere("declarada /mm³, 80 continua 80 e também cruza",
    D.corteDoAnalito(plaqMm3, "plaquetas").estado === "contraindicacao_nao_corrigivel",
    "os dois cruzam, e por caminhos diferentes — a unidade muda o número, ⛔ não o desfecho aqui");

  /** ⚠️⚠️ DIVERGÊNCIA ENTRE COLETAS — e D ⛔ não elege, como C ⛔ não elege. */
  let duas = regL(est, c1, "inr", 2.1);
  duas = regL(duas, c2, "inr", 1.1);
  confere("coletas divergentes quanto ao corte ⛔ NÃO elegem",
    D.corteDoAnalito(duas, "inr").estado === "informacao_insuficiente"
    && D.corteDoAnalito(duas, "inr").razao === "divergencia_entre_coletas",
    "preferir a 'mais recente' seria hierarquia que ⛔ ninguém autorizou");
  confere("⛔ e a divergência ⛔ NÃO libera",
    D.corteDoAnalito(duas, "inr").estado !== "baixa_preocupacao_declarada",
    "enquanto as duas valerem, ⛔ não há exclusão");
}

// ── 8 · REC. 10 · A PENDÊNCIA QUE NASCE DO JUÍZO ─────────────────────────
{
  confere("⛔ sem o juízo, coagulograma ausente ⛔ NÃO vira pendência",
    D.pendenciasDaSeguranca(est).every((p) => p.id !== "coagulograma"),
    "**COR 2a**: *'IVT not be delayed while waiting for testing if there is no reason to suspect an abnormal result'* — cobrar exame de todo paciente é o atraso que a fonte proíbe");
  const comSuspeita = reg(est, "motivo_para_suspeitar_alteracao_coagulacao", "sim");
  confere("COM o juízo, ela nasce",
    D.pendenciasDaSeguranca(comSuspeita).some((p) => p.id === "coagulograma"),
    "e ⛔ só aí — é o julgamento que a fonte nomeia como gatilho");
  confere("⛔ e ⛔ nenhuma pendência de D bloqueia terapia",
    D.pendenciasDaSeguranca(comSuspeita).every((p) => p.bloqueia !== true),
    "**E-49**: ⛔ nenhuma pendência daqui retém terapia tempo-dependente");
}

// ── 9 · CMB · ⚠️ DESCONHECIDO É ESTADO TERMINAL ACEITÁVEL ────────────────
{
  confere("sem informação prévia de CMB, ⛔ NÃO há restrição",
    D.microssangramentos(est).estado === "baixa_preocupacao_declarada",
    "**COR 1**: *'IVT be administered without first obtaining MRI to exclude CMBs'*");
  confere("⛔ e ⛔ NÃO nasce pendência para descobrir",
    D.pendenciasDaSeguranca(est).every((p) => p.id !== "informacao_previa_cmb"),
    "cobrar a informação induziria a ressonância que a rec. 11 manda ⛔ NÃO obter");
  /**
   * ⚠️⚠️ MEDE A **FORMA DA AFIRMAÇÃO**, e ⛔ não o vocabulário — pela quarta vez
   * neste módulo uma trava minha reprovou a frase que promete o oposto: o texto
   * diz *"**sem** obter ressonância"*, e a varredura por "obter ressonância"
   * acusava justamente a negativa.
   *
   * ⚠️ O que ⛔ não pode existir é **pedido**: a leitura ⛔ não pode conter forma
   * imperativa/sugestiva de solicitar exame. A negação preservada é o contrário
   * de um pedido, e precisa estar lá.
   */
  const cmb = `${D.microssangramentos(est).curto} ${D.microssangramentos(est).texto}`;
  confere("⛔ a leitura ⛔ NÃO pede exame — e PRESERVA a negativa da fonte",
    !/(solicit\w*|peça|pedir|providenci\w*)\s/i.test(cmb)
    && !/\b(obter|fazer|realizar)\s+ressonância/i.test(cmb.replace(/sem\s+(obter|fazer|realizar)\s+ressonância/gi, ""))
    && /sem obter ressonância|nada espera/i.test(cmb),
    "é o único ponto do módulo em que desconhecido é estado terminal aceitável — e a frase precisa DIZER a negativa, ⛔ não só evitar a palavra");
}

// ── 10 · O ANTIAGREGANTE — risco declarado ⛔ NÃO é proibição ──────────────
{
  const com = reg(est, "antiagregante_em_uso", "sim");
  confere("antiagregante em uso ⛔ NÃO restringe",
    D.antiagregante(com).estado === "baixa_preocupacao_declarada",
    "**COR 1**: *'IVT **is recommended** … despite an increase in risk of sICH'*");
  confere("e a leitura DIZ que há aumento de risco, sem proibir",
    /risco/i.test(D.antiagregante(com).texto) && !/não administr|contraindic/i.test(D.antiagregante(com).texto),
    "*'risco elevado' ⛔ não é automaticamente proibido* — enunciado do autor sustentado por verbatim");
}

/* ══════════════════════════════════════════════════════════════════════════
 * A AUSÊNCIA RESPONDIDA — ⚠️ as TRÊS que a tela confundia em UMA
 * ══════════════════════════════════════════════════════════════════════════ */
{
  /**
   * ⚠️⚠️ O DEFEITO QUE ISTO TRAVA: com *"Nenhum destes"* respondido em Paciente,
   * ⛔ nenhum item nasce — **exatamente como quando ⛔ ninguém abriu o painel**.
   * ⚠️ As duas situações chegavam idênticas ao olho: uma tela silenciosa.
   */
  const campo = "antecedentes_intracranianos";
  const nunca = D.estadoDoGrupoDeAntecedentes(est, campo);
  confere("grupo ⛔ nunca respondido é `nao_perguntado`, ⛔ e ⛔ NÃO `nenhum_registrado`",
    nunca.estado === "nao_perguntado" && nunca.marcados === 0,
    "inferir `nenhum` do silêncio transforma ausência de pergunta em resposta negativa");

  const nenhum = reg(est, campo, "Nenhum destes");
  confere("⛔ 'Nenhum destes' respondido é `nenhum_registrado`",
    D.estadoDoGrupoDeAntecedentes(nenhum, campo).estado === "nenhum_registrado",
    "o fato já existe em Paciente; ⛔ não mostrá-lo é jogar fora uma resposta dada");

  /** ⚠️ O RÓTULO, ⛔ e ⛔ não o slug: é assim que seleção múltipla grava. */
  const naoSei = reg(est, campo, "Não sei");
  confere("⛔ e 'Não sei' ⛔ NÃO cai em ⛔ nenhum dos outros dois",
    D.estadoDoGrupoDeAntecedentes(naoSei, campo).estado === "nao_sei",
    "alguém foi perguntado ⛔ e ⛔ não soube dizer — é estado epistêmico, ⛔ não campo vazio (E-02)");

  /** ⚠️⚠️ AS TRÊS PRECISAM SER **DISTINGUÍVEIS** — ⛔ e ⛔ não ⛔ só existir. */
  confere("os três estados de ausência são DISTINTOS entre si",
    new Set([
      D.estadoDoGrupoDeAntecedentes(est, campo).estado,
      D.estadoDoGrupoDeAntecedentes(nenhum, campo).estado,
      D.estadoDoGrupoDeAntecedentes(naoSei, campo).estado,
    ]).size === 3,
    "dois estados iguais devolvem a confusão que esta derivação existe para desfazer (E-37)");

  const comItem = reg(est, campo, "Neoplasia intracraniana intra-axial");
  const lido = D.estadoDoGrupoDeAntecedentes(comItem, campo);
  confere("grupo com item marcado conta QUANTOS, ⛔ e ⛔ não vira ausência",
    lido.estado === "com_itens" && lido.marcados === 1,
    "a contagem é o que permite ao bloco dizer o que guarda ⛔ sem reinterpretar");

  /** ⚠️ D-15: um grupo novo de antecedentes entra já coberto. */
  confere("os campos de antecedentes são DERIVADOS do catálogo de itens",
    D.CAMPOS_DE_ANTECEDENTES.length === 3
    && D.CAMPOS_DE_ANTECEDENTES.every((c) => S.ITENS_DE_SEGURANCA.some((i) => i.campo === c)),
    "lista escrita à mão deixa grupo novo sem leitura de ausência, ⛔ e ⛔ ninguém percebe");
}

/* ══════════════════════════════════════════════════════════════════════════
 * OS PARES DA FONTE — ⚠️ vizinhança em faixas OPOSTAS
 * ══════════════════════════════════════════════════════════════════════════ */
{
  const unicos = new Map();
  for (const p of D.PARES_DA_FONTE) {
    unicos.set([p.opcao, p.vizinho].sort().join("|"), p);
  }
  const faixa = (o) => S.ITENS_DE_SEGURANCA.find((i) => i.opcao === o)?.faixa;

  /**
   * ⚠️⚠️ PISO, ⛔ e ⛔ não igualdade: a trava ⛔ não pode virar uma cópia da
   * resposta. ⛔ Zero pares passaria calado se a derivação quebrasse (**R-1**).
   */
  confere("a derivação produz os pares da fonte, ⛔ e ⛔ não uma lista vazia",
    unicos.size >= 6,
    "uma trava que roda sobre lista vazia ⛔ não mede ⛔ nada");

  /**
   * ⚠️⚠️ **TODO** PAR ESTÁ EM FAIXAS DIFERENTES — ⛔ e é isso que justifica o
   * marcador existir. ⛔ Um par na mesma faixa seria ruído: dois itens que a
   * fonte trata igual ⛔ não precisam de aviso de que ela os separa.
   */
  confere("⛔ e TODO par derivado está em faixas DIFERENTES da fonte",
    [...unicos.values()].every((p) => faixa(p.opcao) !== faixa(p.vizinho)),
    "par na mesma faixa é marcador sem informação, ⛔ e marcador sem informação ensina a ignorar marcador");

  /** ⚠️ Simétrico: ⛔ um marcador de mão única existiria ⛔ só de um lado. */
  confere("cada membro do par aponta para o outro",
    D.PARES_DA_FONTE.every((p) =>
      D.PARES_DA_FONTE.some((q) => q.opcao === p.vizinho && q.vizinho === p.opcao)),
    "mão única faria o par aparecer ⛔ só quando o médico marcasse o lado 'certo'");

  /**
   * ⚠️⚠️ A FAMÍLIA É PREFIXO DE **PALAVRA INTEIRA** nos dois rótulos.
   *
   * ⛔ Sem isso, uma família poderia nascer de coincidência de letras no meio
   * de uma palavra — *"Traumatismo cranio…"* casando *cranioencefálico* com
   * *craniano* — ⛔ e o par diria que a fonte separa dois itens que ⛔ ela
   * ⛔ nem nomeia assim.
   *
   * ⚠️ Esta trava mede a **propriedade**, ⛔ e ⛔ não a consequência: com os
   * itens de hoje a regra ⛔ não muda par ⛔ nenhum, ⛔ e por isso ⛔ nenhuma
   * mutação de comportamento poderia pegá-la (ver `scripts/mutacoes/superficie-d`).
   */
  confere("a família do par é prefixo de PALAVRA INTEIRA nos dois rótulos",
    [...unicos.values()].every((p) =>
      [p.opcao, p.vizinho].every(
        (r) => r.startsWith(p.familia) && (r.length === p.familia.length || r[p.familia.length] === " ")
      )),
    "família cortada no meio de uma palavra relaciona itens que a fonte ⛔ não nomeia como parentes");

  /** ⛔ Famílias ⛔ não atravessam grupos: ⛔ nada relaciona intracraniano a procedimento. */
  confere("⛔ e ⛔ NENHUM par atravessa campos diferentes",
    D.PARES_DA_FONTE.every((p) => {
      const a = S.ITENS_DE_SEGURANCA.find((i) => i.opcao === p.opcao);
      const b = S.ITENS_DE_SEGURANCA.find((i) => i.opcao === p.vizinho);
      return a && b && a.campo === b.campo;
    }),
    "relacionar itens de grupos diferentes inventaria família que a fonte ⛔ não nomeia");

  /**
   * ⚠️⚠️ ⛔ O MARCADOR ⛔ NÃO PODE VIRAR REGRA CLÍNICA. ⛔ O par diz ⛔ só que a
   * fonte **separa** os dois; ⛔ ele ⛔ não move faixa, ⛔ não muda estado ⛔ e ⛔ não
   * cancela item.
   */
  const comUm = reg(est, "antecedentes_intracranianos", "Neoplasia intracraniana intra-axial");
  const itens = D.itensComModificacao(comUm);
  confere("marcar UM membro do par ⛔ NÃO faz o outro aparecer como item",
    itens.length === 1 && itens[0].id === "Neoplasia intracraniana intra-axial",
    "o vizinho é informação sobre a FONTE, ⛔ e ⛔ jamais um achado do paciente (E-43)");
  confere("⛔ e o item marcado MANTÉM o estado da própria faixa",
    itens[0].estado === "contraindicacao_nao_corrigivel",
    "se o par mexesse na faixa, agrupar por família teria alterado a classificação da fonte");
}

/* ══════════════════════════════════════════════════════════════════════════
 * A REGRA VIVE EM UM LUGAR — ⚠️ I6
 * ══════════════════════════════════════════════════════════════════════════ */
{
  /**
   * ⚠️⚠️ A declaração de natureza da fonte era **duas**: o aviso da superfície e
   * a nota do grupo, reescrita. ⛔ 440 caracteres de prosa quase idêntica antes
   * da primeira pergunta — ⛔ e, pior, **duas redações que podem divergir**.
   */
  const juizo = S.GRUPOS_D.find((g) => g.id === "juizo");
  confere("o grupo de juízo ⛔ NÃO reescreve a declaração de natureza da fonte",
    juizo !== undefined && juizo.nota === undefined,
    "a mesma regra em duas redações diverge com o tempo, ⛔ e ⛔ nenhuma trava veria");
}

if (falhas.length > 0) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE D — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}\n`));
  process.exit(1);
}
console.log(`\n✅ PROVA DA SUPERFÍCIE D — ${ok}/${ok} conferências · ${S.ITENS_DE_SEGURANCA.length} itens interpretados\n`);
