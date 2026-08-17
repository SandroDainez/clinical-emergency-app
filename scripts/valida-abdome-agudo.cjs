#!/usr/bin/env node
/**
 * PROMETE
 *   Que o roteamento do caminho guiado continue mandando cada sinal de
 *   catástrofe abdominal para a conduta certa (conferido por EXECUÇÃO); que o
 *   volvo apareça como PAR sigmoide × cecal; que a isquemia mesentérica
 *   continue separada em quatro entidades, com a condição da peritonite
 *   visível na trombose venosa; que o aviso do abdome que despista esteja nas
 *   superfícies em que se DECIDE, e não só na de quem admitiu não saber; e que
 *   a analgesia venha com fármaco, titulação e a ressalva do AINE.
 *
 * NÃO PROMETE
 *   Cobertura do módulo inteiro, nem que o diferencial esteja completo — o
 *   módulo é triagem cirúrgica com diferencial amplo, e não fecha diagnóstico.
 *   Primeira trava do módulo, nascida depois da auditoria (R-21).
 *
 * UNIVERSO
 *   A árvore do abdome agudo compilada e as quatro libs que ela passou a
 *   consumir.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ──────────────────────────────────────────────
 *
 * 1. VOLVO COM UMA CONDUTA SÓ. O diferencial citava sigmoide e cecal; a
 *    conduta era "volvo de sigmoide: descompressão endoscópica". Quem lê
 *    "volvo" e aplica a única linha existente leva o CECAL para a endoscopia,
 *    que funciona em 10–15% dos casos e perfura — gastando o tempo que decide.
 *
 * 2. ISQUEMIA MESENTÉRICA COMO UMA DOENÇA SÓ (R-36). Uma conduta —
 *    "revascularização e/ou ressecção" — para quatro entidades. A trombose
 *    VENOSA sem peritonite é tratamento CLÍNICO: é a maior distância entre
 *    duas condutas do módulo, e a frase genérica mandava para a laparotomia.
 *
 * 3. ⚠️ O AVISO NA SUPERFÍCIE DO HESITANTE. "Idoso, diabético,
 *    imunossuprimido, em corticoide ou gestante: o exame ENGANA" existia em UM
 *    lugar do app inteiro — dentro do nó a que se chega respondendo "não sei o
 *    padrão". Quem escolhe "inflamatório" com convicção nunca via, e é ele
 *    quem precisa, porque a convicção veio de um exame que engana. É o
 *    refinamento hesitante × certo do R-48, e por isso esta trava confere a
 *    presença do aviso NOS NÓS DE PADRÃO, contando superfícies.
 *
 * 4. ANALGESIA SEM O MEIO DE EXECUTÁ-LA. O mito derrubado em três superfícies,
 *    e nenhuma dose. Instrução de administrar sem dizer o quê.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-abdome-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "acute-abdomen-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "acute-abdomen-decision-tree.js")).acuteAbdomenDecisionTree;
} catch (erro) {
  falhas.push(`a árvore do abdome agudo não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

const { textosDoNo } = require("./lib/textos-do-no.cjs");

/**
 * ⚠️ TODO o texto do nó, e TODO o texto da subárvore que sai dele.
 *
 * ── POR QUE MUDOU (2026-08-17) ────────────────────────────────────────────
 *
 * `acoesDe` lia SÓ `node.actions`. Era suficiente enquanto `vascular` era um nó
 * único de 4.771 caracteres com as quatro entidades em texto corrido — e virou
 * cego no dia em que ele se tornou uma DECISÃO com quatro saídas.
 *
 * As dez conferências deste bloco reprovaram todas, dizendo "sumiu do nó
 * vascular", e nenhum caractere havia saído do app: as quatro entidades passaram
 * a viver nos nós de resposta, que é o ponto da conversão. O nome do nó era um
 * PROXY do que as conferências queriam garantir — que as quatro NÃO estejam
 * fundidas —, e o proxy quebrou quando a estrutura melhorou.
 *
 * Agora o universo é a SUBÁRVORE: o nó e tudo que se alcança dele. O intento de
 * cada conferência está preservado — o conteúdo tem de existir no caminho que o
 * médico percorre —, e deixou de depender de o conteúdo estar num nó específico.
 */
function subarvoreDe(id, vistos = new Set()) {
  if (!arvore?.nodes?.[id] || vistos.has(id)) return [];
  vistos.add(id);
  const no = arvore.nodes[id];
  const filhos = [];
  const anda = (v) => {
    if (!v || typeof v === "string") return;
    if (Array.isArray(v)) return v.forEach(anda);
    for (const [k, x] of Object.entries(v)) {
      if (["next", "nodeId", "to"].includes(k) && typeof x === "string") filhos.push(x);
      else anda(x);
    }
  };
  anda(no);
  return [no, ...filhos.flatMap((f) => subarvoreDe(f, vistos))];
}

/**
 * Texto do nó E dos nós de resposta imediatos — não do fluxo inteiro.
 *
 * ⚠️ O LIMITE DE PROFUNDIDADE É DE PROPÓSITO: sem ele, `vascular` alcançaria
 * `cirurgia`, `reavaliar` e metade do módulo, e qualquer conferência passaria por
 * encontrar a frase em qualquer lugar. Dois níveis é o que a conversão criou —
 * pergunta, e resposta.
 */
const acoesDe = (id, profundidade = 2) => {
  const nos = [];
  const fila = [[id, 0]];
  const vistos = new Set();
  while (fila.length) {
    const [atual, d] = fila.shift();
    if (vistos.has(atual) || d > profundidade || !arvore?.nodes?.[atual]) continue;
    vistos.add(atual);
    const no = arvore.nodes[atual];
    nos.push(no);
    // só desce por nós criados NA conversão (prefixo do próprio nó de origem)
    for (const o of no.options ?? []) if (typeof o?.next === "string") fila.push([o.next, d + 1]);
    if (typeof no.next === "string" && no.next.startsWith(id.split("_")[0])) fila.push([no.next, d + 1]);
  }
  return nos.flatMap((n) => textosDoNo(n)).filter((t) => typeof t === "string");
};
const todos = arvore
  ? Object.values(arvore.nodes).flatMap((n) =>
      [...(n.actions ?? []), ...(n.exitCriteria ?? []), ...(n.evidence ?? [])].filter((t) => typeof t === "string")
    )
  : [];

// ── A0. A BIFURCAÇÃO DAS QUATRO ISQUEMIAS — o que a conversão criou ────────
//
// O nó `vascular` era `action` com as quatro entidades em texto corrido. Quem
// tinha trombose VENOSA SEM PERITONITE lia de cima para baixo e chegava na
// laparotomia. Agora é decisão, e estas conferências protegem a FORMA dela.
{
  const vascular = arvore?.nodes?.vascular;
  const qual = arvore?.nodes?.vasc_qual_padrao;

  if (vascular?.type !== "decision") {
    falhas.push(
      "`vascular` deixou de ser DECISÃO. Ele voltou a apresentar as quatro isquemias como texto " +
      "corrido, e quem tem trombose venosa sem peritonite lê de cima para baixo até a laparotomia."
    );
  } else ok++;

  // ⚠️ A PERITONITE PRIMEIRO, porque decide sozinha, sem depender do subtipo.
  if (!/peritonite/i.test(vascular?.question ?? "")) {
    falhas.push("a pergunta de `vascular` não é a da PERITONITE — ela vem primeiro porque decide sozinha, em qualquer das quatro.");
  } else ok++;

  // ⚠️ UMA PERGUNTA, QUATRO SAÍDAS, SEM REPESCAGEM. Com três rótulos, o paciente
  // de NOMI não se encontrava em nenhum e travava.
  const rotulos = (qual?.options ?? []).map((o) => String(o.label ?? ""));
  const eixos = [
    ["embolia", /abrupto/i],
    ["trombose arterial", /após comer|apos comer/i],
    ["trombose venosa", /trombofilia|cirrose|c[âa]ncer/i],
    ["NOMI", /UTI|vasoconstritor|p[óo]s-parada/i],
    ["não sei", /n[ãa]o reconhe/i],
  ];
  for (const [nome, padrao] of eixos) {
    if (!rotulos.some((r) => padrao.test(r))) {
      falhas.push(
        `a saída de ${nome} sumiu da pergunta do padrão. ⚠️ As quatro entidades + o "não sei" ` +
        `são CINCO saídas de UMA pergunta: sem uma delas, quem tem aquele quadro responde errado ou trava.`
      );
    } else ok++;
  }

  // ⚠️ SINAIS ANTES DO NOME — o que se aprendeu nas toxíndromes.
  const comNome = rotulos.filter((r) => /^(embolia|trombose|isquemia|NOMI)/i.test(r.trim()));
  if (comNome.length) {
    falhas.push(
      `${comNome.length} rótulo(s) da pergunta do padrão começam pelo NOME do diagnóstico: ` +
      `${comNome.map((r) => `"${r.slice(0, 40)}"`).join(", ")}. O médico escolhe pelo que VÊ.`
    );
  } else ok++;

  // ⚠️ A VENOSA NÃO VAI PARA A CIRURGIA. É a maior distância de conduta do módulo.
  const venosa = arvore?.nodes?.vasc_r_trombose_ven;
  if (venosa?.next === "cirurgia") {
    falhas.push(
      "o ramo da trombose VENOSA aponta para `cirurgia`. Sem peritonite ela é tratamento CLÍNICO — " +
      "anticoagulação —, e este é exatamente o defeito que a conversão existe para impedir."
    );
  } else ok++;

  // ⚠️ A CIRURGIA NÃO SUBSTITUI A CORREÇÃO HEMODINÂMICA — nos DOIS ramos em que
  // o NOMI pode estar: o cirúrgico (peritonite) e o próprio NOMI.
  for (const id of ["vasc_cirurgico", "vasc_r_nomi"]) {
    const t = (arvore?.nodes?.[id] ? textosDoNo(arvore.nodes[id]) : []).join("\n");
    if (!/n[ãa]o substitui a corre[çc][ãa]o hemodin[âa]mica/i.test(t)) {
      falhas.push(
        `\`${id}\`: sumiu que a cirurgia NÃO substitui a correção hemodinâmica. Ressecar sem corrigir ` +
        `débito e retirar o vasoconstritor tira a alça infartada e mantém o mecanismo que a infartou ` +
        `— a WSES põe as duas coisas na MESMA recomendação.`
      );
    } else ok++;
  }

  // ⚠️ TETO DE DOIS ITENS EM `evidence` (C1) — acima disso o bloco nasce FECHADO.
  // Conteúdo escondido atrás de um toque não é conteúdo entregue.
  for (const id of ["vascular", "vasc_qual_padrao"]) {
    const n = (arvore?.nodes?.[id]?.evidence ?? []).length;
    if (n > 2) {
      falhas.push(
        `\`${id}\`: ${n} itens em \`evidence\`. ListaDeCriterios recolhe com mais de DOIS ` +
        `(\`curta = itens.length <= 2\`), e o médico veria "ver critérios" em vez do texto.`
      );
    } else ok++;
  }
}

// ── A. O ROTEAMENTO DO GUIADO, POR EXECUÇÃO ───────────────────────────────
//
// Os três sinais abdominais são critérios INTEIROS por si — cada um muda o
// destino sozinho, mesmo com hemodinâmica normal. É lógica que nenhuma busca
// de texto alcança.
{
  const escolher = arvore?.nodes?.abd_instab_dados?.next?.escolher;
  if (typeof escolher !== "function") {
    falhas.push(
      "`abd_instab_dados` não tem função `escolher` — o roteamento do caminho guiado mudou de forma e " +
      "esta trava deixou de exercitar o que promete. Reescrever a trava, não removê-la."
    );
  } else {
    // ⚠️ TODOS OS CASOS VÃO COM SINAIS VITAIS NORMAIS, e isso é a metade do
    // que se quer provar: cada achado abdominal manda para a catástrofe
    // SOZINHO, sem ajuda da hemodinâmica. É por poderem aparecer com pressão
    // normal que eles precisam estar no roteamento.
    //
    // `pas` vai preenchida porque `derivarInstabilidade` LANÇA sem ela, de
    // propósito (a função se recusa a afirmar algo sobre um paciente cuja
    // pressão ninguém mediu). Pelo fluxo do app isso é inalcançável — o campo
    // é obrigatório e `advance()` barra —, então omiti-la aqui testaria a
    // guarda da lib, não o roteamento deste módulo.
    const VITAIS_NORMAIS = { pas: "120", fc: "80", spo2: "97" };
    const ESPERADO = [
      [{ ...VITAIS_NORMAIS, abdomeTabua: "sim" }, "catastrofe", "abdome em tábua é peritonite difusa — sozinho basta"],
      [{ ...VITAIS_NORMAIS, dorDesproporcional: "sim" }, "catastrofe", "dor desproporcional é isquemia mesentérica até prova em contrário"],
      [{ ...VITAIS_NORMAIS, massaPulsatil: "sim" }, "catastrofe", "massa pulsátil expansiva é aneurisma — não vai para tomografia eletiva"],
      [
        { ...VITAIS_NORMAIS, abdomeTabua: "nao", dorDesproporcional: "nao", massaPulsatil: "nao" },
        "padrao",
        "sem sinal de catástrofe e sem instabilidade, segue para o padrão",
      ],
    ];
    for (const [entrada, destino, porque] of ESPERADO) {
      let obtido;
      try {
        obtido = escolher(entrada);
      } catch (erro) {
        obtido = `ERRO: ${String(erro).slice(0, 70)}`;
      }
      if (obtido !== destino) {
        falhas.push(
          `roteamento guiado ${JSON.stringify(entrada)}: vai para "${obtido}", esperado "${destino}" — ` +
          `${porque}. ⚠️ Cada um destes achados aparece COM PRESSÃO NORMAL, e é por isso que eles não ` +
          `podem depender do grau de instabilidade.`
        );
      } else ok++;
    }
  }
}

// ── B. O par do volvo, nos dois sentidos ──────────────────────────────────
{
  const obstrutivo = acoesDe("obstrutivo").join("\n");
  for (const [nome, padrao, porque] of [
    ["o volvo CECAL", /CECAL/, "sem ele, a única conduta de volvo é a do sigmoide, e o cecal vai para a endoscopia"],
    ["a recusa da endoscopia no cecal", /redução endoscópica NÃO é recomendada/, "é o que impede o erro que gasta o tempo do intestino"],
    ["a ressecção segmentar como tratamento do cecal", /RESSECÇÃO SEGMENTAR/, "dizer só \"é cirúrgico\" não diz qual cirurgia"],
    ["a endoscopia como primeira linha no sigmoide", /endoscopia baixa é a primeira linha/, "sem ela, o par vira proibição de endoscopia em todo volvo"],
    ["o erro no sentido inverso", /ERRAR PARA O OUTRO/, "operar o sigmoide estável troca um procedimento eficaz por laparotomia"],
    ["o que se programa depois de descomprimir", /inferiores à colectomia sigmoide/, "\"cirurgia eletiva\" sem dizer qual deixa a recidiva de fora"],
  ]) {
    if (!padrao.test(obstrutivo)) {
      falhas.push(`nó obstrutivo: ${nome} sumiu — ${porque}.`);
    } else ok++;
  }
}

// ── C. As quatro entidades da isquemia, com a CONDIÇÃO visível ────────────
{
  const vascular = acoesDe("vascular").join("\n");
  for (const [nome, padrao] of [
    ["a embolia arterial", /EMBOLIA DA ARTÉRIA MESENTÉRICA SUPERIOR/],
    ["a trombose arterial", /TROMBOSE ARTERIAL MESENTÉRICA/],
    ["a trombose venosa", /TROMBOSE VENOSA MESENTÉRICA/],
    ["a NOMI", /NÃO OCLUSIVA \(NOMI\)/],
  ]) {
    if (!padrao.test(vascular)) {
      falhas.push(
        `nó vascular: ${nome} sumiu. As quatro têm tratamento diferente — fundi-las manda para a ` +
        `laparotomia quem tem indicação clínica (R-36).`
      );
    } else ok++;
  }

  const tvm = acoesDe("vascular").find((a) => /TROMBOSE VENOSA MESENTÉRICA/.test(a)) ?? "";
  for (const [nome, padrao, porque] of [
    ["a CONDIÇÃO em destaque", /SE NÃO HÁ PERITONITE/, "escrever \"TVM trata-se com anticoagulação\" faz decidir pelo NOME do diagnóstico"],
    ["a volta à cirurgia havendo peritonite", /a conduta volta a ser cirúrgica/, "sem isso, a condição vira característica da entidade"],
    ["quem decide", /QUEM DECIDE É O EXAME, NÃO O LAUDO/, "a tentação é a oposta: o laudo chega escrito e parece decidir"],
  ]) {
    if (!padrao.test(tvm)) {
      falhas.push(`trombose venosa mesentérica: ${nome} sumiu — ${porque}.`);
    } else ok++;
  }

  if (!/mucosa/i.test(vascular) || !/serosa/i.test(vascular)) {
    falhas.push(
      "nó vascular: sumiu o mecanismo mucosa → serosa. É ele que explica por que o abdome está mole com " +
      "o paciente gritando — e mandar sem explicar não gruda."
    );
  } else ok++;

  if (!/menos comum|MENOS COMUM/.test(vascular)) {
    falhas.push(
      "nó vascular: sumiu o aviso de que o quadro clássico está ficando menos comum. O módulo inteiro " +
      "ancora a suspeita na dor desproporcional, inclusive o roteamento — quem espera o clássico perde " +
      "a apresentação que hoje é mais frequente."
    );
  } else ok++;
}

// ── D. R-48, refinamento hesitante × certo: o aviso onde se DECIDE ────────
{
  const NOS_DE_DECISAO = ["inflamatorio", "obstrutivo", "perfurativo", "vascular"];
  const semAviso = NOS_DE_DECISAO.filter((id) => !acoesDe(id).some((a) => /O EXAME ENGANA/.test(a)));
  if (semAviso.length) {
    falhas.push(
      `o aviso do abdome que despista sumiu de: ${semAviso.join(", ")}. ⚠️ Ele existia em UM lugar do ` +
      `app — o nó de quem responde "não sei o padrão". Quem escolhe um padrão com convicção não o vê, e ` +
      `é ele quem precisa: a convicção veio de um exame que engana (R-48, hesitante × certo).`
    );
  } else ok++;

  if (!acoesDe("padrao_indefinido").some((a) => /O EXAME ENGANA/.test(a))) {
    falhas.push("o aviso saiu de `padrao_indefinido` — ele passou a valer em mais lugares, não em outro lugar.");
  } else ok++;

  const extra = acoesDe("extra_abdominal").join("\n");
  if (!/ANEURISMA DE AORTA ROTO SE APRESENTA COMO CÓLICA RENAL/.test(extra)) {
    falhas.push(
      "sumiu a inversão do rótulo benigno: o nó cita cólica renal entre as causas não cirúrgicas, e é " +
      "justamente esse rótulo confortável que acomoda o aneurisma roto do idoso."
    );
  } else ok++;
}

// ── E. Analgesia: a ordem COM o meio de executá-la ────────────────────────
{
  const estab = acoesDe("estabilizacao").join("\n");
  for (const [nome, padrao, porque] of [
    ["a morfina com dose", /MORFINA IV — dose inicial 0,1 mg\/kg/, "\"não postergar opioide\" sem dose é ordem inexecutável"],
    ["a titulação da morfina", /0,025–0,05 mg\/kg a cada 5–15 minutos/, "dose fixa subdosa a dor grande e sobra na pequena"],
    ["o fentanil com dose", /FENTANIL IV — 1–1,5 mcg\/kg/, "é a alternativa, e ela também precisa de número"],
    ["a ponte entre meia-vida curta e reexame", /REEXAME SERIADO/, "é o que transforma um dado farmacológico em critério de escolha AQUI"],
    ["a titulação ao conforto", /TITULE AO CONFORTO, NÃO À DOSE/, "é a conduta, não um detalhe"],
    ["a analgesia que NÃO substitui o reexame", /analgesia NÃO substitui o reexame/, "quem trata a dor e para de examinar troca um erro por outro"],
    ["o mito derrubado", /NÃO MASCARA O DIAGNÓSTICO/, "é a razão de a analgesia estar aqui"],
  ]) {
    if (!padrao.test(estab)) {
      falhas.push(`analgesia: ${nome} sumiu — ${porque}.`);
    } else ok++;
  }

  const aine = acoesDe("estabilizacao").find((a) => /AINE: PENSE DUAS VEZES/.test(a)) ?? "";
  if (!aine) {
    falhas.push("a ressalva do AINE sumiu — os três estados mais comuns do módulo são contraindicação de bula.");
  } else {
    for (const [nome, padrao] of [
      ["o cenário da perfuração possível", /PERFURAÇÃO POSSÍVEL/],
      ["o cenário do hipovolêmico", /HIPOVOLÊMICO POR JEJUM/],
      ["o cenário da laparotomia provável", /LAPAROTOMIA PROVÁVEL/],
      ["a declaração de que NÃO é proibição absoluta", /NÃO é proibição absoluta/],
    ]) {
      if (!padrao.test(aine)) {
        falhas.push(
          `AINE: ${nome} sumiu. A ressalva é ancorada no CENÁRIO de propósito — lista de contraindicação ` +
          `genérica se lê e não se aplica; cenário nomeado se reconhece. E sem a ressalva de que não é ` +
          `proibição absoluta, o texto tira da mesa a cólica renal confirmada, que é indicação clássica.`
        );
      } else ok++;
    }
  }
}

// ── E-bis. O QUINTO MECANISMO TEM PORTA, E ELA NÃO ROUBA O INSTÁVEL ──────
//
// ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): o nó `padrao` listava CINCO
// mecanismos — infecção, isquemia, obstrução, perfuração e HEMORRAGIA, "a que
// mata mais rápido" — e oferecia opção para QUATRO. O hemorrágico tinha
// critério escrito em `evidence` e nenhum botão.
//
// E o defeito só apareceu ao mover os critérios para os rótulos: quatro viraram
// rótulo e sobrou um sem destino. Uma correção de FORMA revelou um buraco de
// CONTEÚDO.
{
  const { consomeConstante } = require("./lib/consumo.cjs");
  const arq = path.join(appDir, "acute-abdomen-decision-tree.ts");
  const opcoes = arvore?.nodes?.padrao?.options ?? [];
  const hemo = opcoes.find((o) => o.id === "hemorragico");

  // 1. A porta existe e leva ao nó próprio.
  if (!hemo) {
    falhas.push(
      "a opção `hemorragico` do nó `padrao` sumiu — o quinto mecanismo volta a ser listado sem ter " +
      "botão, e o médico que reconhece sangramento não tem para onde ir."
    );
  } else if (hemo.next !== "hemorragico") {
    falhas.push(`a opção \`hemorragico\` passou a levar a "${hemo.next}" — o destino próprio foi desviado.`);
  } else ok++;

  // 2. ⚠️ O RÓTULO NÃO PODE DIZER "HIPOTENSÃO".
  //
  // A primeira versão dizia "Hipotensão ou palidez […] paciente AINDA estável",
  // que se contradiz — e roubaria do nó `instabilidade` exatamente o paciente
  // que ele existe para capturar. Quem chega ao `padrao` já respondeu "estável";
  // o rótulo descreve QUEM ESCOLHE, não o mecanismo em abstrato.
  if (hemo && /hipotens/i.test(hemo.label)) {
    falhas.push(
      `o rótulo do padrão hemorrágico voltou a citar HIPOTENSÃO: « ${hemo.label} ».\n` +
      `      ⚠️ Contradiz o próprio caminho — quem chega a este nó respondeu "estável" no ` +
      `\`instabilidade\` — e desvia para cá o paciente que deve ir para \`catastrofe\`, onde estão a ` +
      `cirurgia imediata e os hemocomponentes.`
    );
  } else ok++;

  // 3. A FRONTEIRA VAI NOS DOIS RÓTULOS, ou não vai em nenhum.
  const vasc = opcoes.find((o) => o.id === "vascular");
  const faltaFronteira = [];
  if (!vasc || !/OCLU[ÍI]DO/i.test(vasc.label)) faltaFronteira.push("`vascular` sem OCLUÍDO");
  if (!hemo || !/ROTO/i.test(hemo.label)) faltaFronteira.push("`hemorragico` sem ROTO");
  if (faltaFronteira.length) {
    falhas.push(
      `a fronteira entre os dois padrões DE VASO perdeu ${faltaFronteira.length} lado(s): ${faltaFronteira.join(" · ")}.\n` +
      `      ⚠️ "Vascular" e "hemorrágico" são ambos vasculares. Se só um rótulo disser qual é qual, ` +
      `quem lê o outro continua sem saber — o par confundível se desfaz pelos DOIS lados ou não se desfaz.`
    );
  } else ok++;

  // 4. As quatro peças e o gatilho chegam ao nó — por CONSUMO, não por menção.
  for (const c of [
    "HEMO_EXAME_PODE_ENGANAR", "HEMO_SINAIS_VITAIS_NAO_SERVEM", "HEMO_BETA_HCG_REGRA",
    "HEMO_CAUSAS_GINECOLOGICAS", "HEMO_CAUSAS_NAO_GINECOLOGICAS",
    "HEMO_FRONTEIRA_COM_ISQUEMIA", "HEMO_GATILHO_DE_RETORNO",
  ]) {
    const r = consomeConstante({ arquivo: arq, constante: c, no: "hemorragico" });
    if (!r.consome) falhas.push(`${r.motivo}. ⚠️ Import não é consumo.`);
    else ok++;
  }

  // 5. O β-hCG É REGRA, NÃO ITEM DE LISTA — e é a forma que impede o
  //    "ela disse que não está grávida" de virar exclusão.
  const hemoTexto = acoesDe("hemorragico").join("\n");
  if (!/TODA MULHER EM IDADE FÉRTIL/i.test(hemoTexto)) {
    falhas.push(
      "o β-hCG deixou de ser REGRA SEM EXCEÇÃO no padrão hemorrágico.\n" +
      "      ⚠️ \"Dosar β-hCG\" numa lista de exames é ignorável. Escrito como regra, ele bloqueia o " +
      "que faz o exame não ser pedido: a história que a paciente conta — contraceptivo, última " +
      "menstruação, \"ela disse que não está grávida\". Nenhuma dessas frases é um teste."
    );
  } else ok++;
  if (!/negativo NÃO exclui|negativo não exclui/i.test(hemoTexto)) {
    falhas.push("sumiu o aviso de que β-hCG negativo NÃO exclui ectópica rota — existe com sérico e com urina negativos.");
  } else ok++;

  // 6. O GATILHO DE RETORNO tem de dizer O QUE OBSERVAR, não só "reavalie".
  const observar = [
    ["pressão de pulso", /press[ãa]o de pulso/i],
    ["frequência cardíaca em série", /frequ[êe]ncia card[íi]aca/i],
    ["nível de consciência", /n[íi]vel de consci[êe]ncia/i],
    ["dor que muda de caráter", /muda de car[áa]ter/i],
  ].filter(([, re]) => !re.test(hemoTexto));
  if (observar.length) {
    falhas.push(
      `o gatilho de retorno perdeu ${observar.length} sinal(is) do que observar: ${observar.map((o) => o[0]).join(", ")}.\n` +
      `      ⚠️ "Reavalie" sem dizer O QUE é o defeito que esta auditoria já corrigiu em outros nós. ` +
      `Nenhuma fonte aberta dá INTERVALO para o hemoperitônio estável — por isso o texto diz o que se ` +
      `observa e declara a ausência do número, em vez de inventar uma cadência.`
    );
  } else ok++;
  if (arvore?.nodes?.hemorragico?.next !== "catastrofe") {
    falhas.push(
      `o nó \`hemorragico\` deixou de desaguar em \`catastrofe\` (agora: "${arvore?.nodes?.hemorragico?.next}").\n` +
      `      ⚠️ Este é um paciente em JANELA, e a janela fecha sem avisar: 20% com sinais vitais normais ` +
      `tinham perda classe IV. O caminho de volta à catástrofe é parte da conduta.`
    );
  } else ok++;
}

// ── F. Vacuidade: a trava rodou sobre alguma coisa? ──────────────────────
{
  if (todos.length < 60) {
    falhas.push(
      `só ${todos.length} textos no módulo — esperado bem mais. A árvore mudou de forma e as conferências ` +
      `acima podem ter rodado sobre nada (R-15 item 9).`
    );
  } else ok++;
}

console.log("\nAbdome agudo — o par do volvo, as quatro isquemias, o aviso onde se decide e a analgesia executável\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — rota por execução, condutas separadas e a ordem com o meio de cumpri-la\n`);
process.exit(0);
