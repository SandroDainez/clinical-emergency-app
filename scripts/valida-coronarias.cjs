#!/usr/bin/env node
/**
 * PROMETE
 *   Que os QUATRO GRUPOS de padrão sem supra continuem SEPARADOS, com as quatro
 *   condutas distintas; que os prazos digam de ONDE contam; que a fibrinólise
 *   tenha absolutas E relativas com a conduta do meio; e que o TNK e a
 *   enoxaparina digam a apresentação onde a dose é administrada.
 *
 * NÃO PROMETE
 *   Que os critérios de ECG estejam completos — auditoria de conteúdo com fonte
 *   aberta já foi feita, e novos padrões podem entrar. A trava protege as
 *   distinções que, fundidas, produzem erro.
 *
 * UNIVERSO
 *   A árvore coronariana e as três libs que ela passou a consumir.
 *
 * ── POR QUE ELA EXISTE ──────────────────────────────────────────────────────
 *
 * D-25: `test:coronary` validava `coronary-syndromes-engine.ts`, órfão de
 * render — duas entradas verdes no test:all davam sensação de cobertura sobre
 * dois módulos que a Fase 1 nunca auditou. Os scripts foram removidos na
 * deleção da D-22, e o módulo ficou com ZERO cobertura de conteúdo.
 *
 * ⚠️ ESTA TRAVA NASCEU DEPOIS DA AUDITORIA, NÃO ANTES (R-21). Escrita antes,
 * ela teria fotografado o app como estava — sem De Winter, sem Wellens, sem
 * posterior, sem VD — e chamado isso de contrato.
 *
 * ── O QUE ELA IMPEDE ────────────────────────────────────────────────────────
 *
 * 1. A FUSÃO DOS QUATRO GRUPOS. Se alguém "simplificar" para uma lista de
 *    equivalentes de STEMI, o app passa a mandar trombolisar um Wellens sem dor
 *    e a não contraindicar nitrato no VD. Os dois erros matam, por mecanismos
 *    OPOSTOS — e nenhuma trava de número os pega, porque os números continuam
 *    certos.
 *
 * 2. A PERDA DO LIMIAR PRÓPRIO DE V7–V9. 0,5 mm é metade do critério padrão;
 *    sem ele, quem faz as derivações posteriores aplica o ≥ 1 mm que acabou de
 *    ler e DESCARTA o infarto que foi procurar.
 *
 * 3. O PRAZO SEM MARCO (D-17). "Porta-balão ≤ 120 min" sem dizer que o relógio
 *    começa no PRIMEIRO CONTATO MÉDICO faz contar do lugar errado — e o erro
 *    ENCURTA o prazo percebido, empurrando para ICP quem já devia lisar.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const ARVORE = "coronary-decision-tree.ts";
const LIB = "lib/oclusao-sem-supra.ts";

const falhas = [];
let ok = 0;

const limpo = (rel) =>
  fs
    .readFileSync(path.join(appDir, rel), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
const semImports = (rel) => limpo(rel).replace(/^\s*import[\s\S]*?from\s+"[^"]+";\s*$/gm, "");

const arvore = limpo(ARVORE);
const lib = limpo(LIB);

// ── A. OS QUATRO GRUPOS, E O QUE OS SEPARA ────────────────────────────────
{
  const GRUPOS = [
    ["1 · De Winter (oclusão)", /DE WINTER — OCLUSÃO AGUDA/, /1[–-]3 mm/],
    ["1 · posterior (oclusão)", /POSTERIOR ISOLADO — OCLUSÃO AGUDA/, /R\/S > 1 em V2/],
    ["1 · T hiperaguda (oclusão)", /T HIPERAGUDA/, /REPETIR O ECG É PARTE DA CONDUTA/],
    ["2 · aVR (tronco)", /SUPRA EM aVR/, /NÃO É INDICAÇÃO DE FIBRINÓLISE/],
    ["3 · Wellens (NÃO é oclusão)", /NÃO É OCLUSÃO EM CURSO/, /NUNCA TESTE ERGOMÉTRICO/],
    ["4 · VD (contraindicação)", /INFARTO DE VD/, /NITRATO E MORFINA ESTÃO CONTRAINDICADOS/],
  ];
  for (const [nome, presente, oQueOSepara] of GRUPOS) {
    if (!presente.test(lib)) {
      falhas.push(`${LIB}: o grupo "${nome}" sumiu.`);
    } else ok++;
    if (!oQueOSepara.test(lib)) {
      falhas.push(
        `${LIB}: o grupo "${nome}" perdeu o que o distingue dos outros. Os quatro têm CONDUTAS ` +
        `diferentes — fundi-los faz trombolisar Wellens e nitratar VD, e nenhum número fica errado ` +
        `no caminho.`
      );
    } else ok++;
  }

  // A abertura que impede a leitura de "lista de sinônimos".
  if (!/NÃO SÃO SINÔNIMOS|QUATRO GRUPOS COM QUATRO CONDUTAS/.test(lib)) {
    falhas.push(
      `${LIB}: sumiu a abertura que diz que estes NÃO são sinônimos de STEMI. Sem ela, a lista se lê ` +
      `como equivalentes e a distinção morre na primeira leitura apressada.`
    );
  } else ok++;

  // A razão da proibição do ergométrico — sem ela a regra se esquece.
  if (!/APARÊNCIA DE ESTABILIDADE/.test(lib)) {
    falhas.push(
      `${LIB}: a proibição do ergométrico no Wellens perdeu a RAZÃO. O paciente está sem dor e com ` +
      `marcadores normais — é essa aparência de estabilidade que faz alguém pedir o teste, e é ela ` +
      `que precisa estar escrita.`
    );
  } else ok++;
}

// ── B. O limiar próprio das derivações posteriores ────────────────────────
{
  if (!/0,5 mm em V7[–-]V9|apenas 0,5 mm/.test(lib)) {
    falhas.push(
      `${LIB}: sumiu o limiar de 0,5 mm de V7–V9. É METADE do critério padrão: quem faz as ` +
      `derivações posteriores e aplica o ≥ 1 mm descarta o diagnóstico que foi procurar.`
    );
  } else ok++;

  for (const [nome, padrao] of [
    ["a técnica de V7–V9", /plano horizontal de V6|MESMO PLANO HORIZONTAL DE V6/i],
    ["a técnica de V3R–V4R", /5º espaço intercostal DIREITO/],
    ["o critério do VD", /≥ 1 mm em V3R[–-]V6R/],
  ]) {
    if (!padrao.test(lib)) {
      falhas.push(`${LIB}: ${nome} sumiu — é superfície de AÇÃO, e quem nunca fez não deriva do nome.`);
    } else ok++;
  }
}

// ── B-bis. OS PADRÕES PRECISAM CHEGAR A UM NÓ — e a UM só ────────────────
//
// ⚠️ A CONFERÊNCIA ACIMA LÊ `lib/oclusao-sem-supra.ts`, QUE É A FONTE. Ela
// prova que o texto EXISTE; não prova que ele CHEGA À TELA. É a mesma classe de
// universo estreito que já custou duas correções nesta auditoria.
//
// ── O QUE ORIGINOU (2026-08-17) ──────────────────────────────────────────
//
// As dez constantes eram consumidas DUAS vezes: como `actions` de
// `ecg_sem_supra` (abertas) e como `evidence` do nó `ecg` (recolhidas atrás de
// "Ver critérios (15)"). A duplicata foi removida — e, sem esta conferência,
// remover o consumo RESTANTE também passaria verde, porque a lib continuaria
// intacta.
//
// E ela vigia os DOIS lados: chegar a nenhum nó é conteúdo morto; voltar a
// chegar a dois é a duplicata de volta.
{
  const { consomeConstante } = require("./lib/consumo.cjs");
  const PADROES = [
    "OCLUSAO_SEM_SUPRA_ABERTURA", "OCLUSAO_DE_WINTER", "OCLUSAO_POSTERIOR",
    "DERIVACOES_POSTERIORES_COMO", "OCLUSAO_T_HIPERAGUDA", "OCLUSAO_AVR_TRONCO",
    "WELLENS_NAO_E_OCLUSAO", "WELLENS_NUNCA_ERGOMETRICO", "VD_QUANDO_PROCURAR",
    "VD_DERIVACOES_COMO", "OMI_ENQUADRAMENTO",
  ];
  const arq = path.join(appDir, ARVORE);
  const mortas = [], duplicadas = [];
  for (const c of PADROES) {
    const r = consomeConstante({ arquivo: arq, constante: c });
    if (!r.consome) mortas.push(c);
    // ⚠️ `OCLUSAO_SEM_SUPRA_ABERTURA` é a exceção declarada: ela é o `summary`
    // do nó `ecg` E a primeira ação de `ecg_sem_supra`, de propósito — é a
    // linha que manda usar a terceira opção, e precisa estar nos dois lados.
    else if (r.usos > 1 && c !== "OCLUSAO_SEM_SUPRA_ABERTURA") duplicadas.push(`${c} (${r.usos}×)`);
  }
  if (mortas.length) {
    falhas.push(
      `${mortas.length} padrão(ões) de oclusão sem supra NÃO CHEGAM A NENHUM NÓ: ${mortas.join(", ")}.\n` +
      `      ⚠️ A constante existe em ${LIB} e ninguém a consome — import não é consumo. O texto está ` +
      `escrito, revisado, traduzido, e a tela não o mostra.`
    );
  } else ok++;
  if (duplicadas.length) {
    falhas.push(
      `${duplicadas.length} padrão(ões) voltaram a ser consumidos em MAIS DE UM NÓ: ${duplicadas.join(", ")}.\n` +
      `      ⚠️ Era assim antes: os mesmos textos abertos em \`ecg_sem_supra\` e recolhidos atrás de ` +
      `"Ver critérios (15)" no \`ecg\`. O conteúdo bom no lugar certo E no errado, e é a cópia errada ` +
      `que infla o nó de triagem.`
    );
  } else ok++;
}

// ── C. Prazos com MARCO declarado (D-17) ──────────────────────────────────
//
// ⚠️ O UNIVERSO DESTA CONFERÊNCIA ESTAVA ESTREITO DEMAIS (corrigido 2026-08-17).
//
// Ela lia SÓ o fonte de `coronary-decision-tree.ts`. Quando o marco do
// porta-balão migrou de um item literal de `evidence` para dentro da constante
// `STEMI_RELOGIO_DECIDE` — que vive em `lib/contraindicacao-trombolise.ts` e é
// importada aqui —, a trava reprovou dizendo que o marco "sumiu". Ele não
// sumiu: subiu para a superfície visível, em outro arquivo.
//
// É o espelho do "import não é consumo": ali o nome estava presente sem o texto
// chegar à tela; aqui o texto chega à tela sem o nome estar no arquivo. A
// pergunta certa não é "esta frase está neste .ts?" e sim "esta frase chega ao
// médico?" — e quem responde isso é a árvore COMPILADA, com as constantes já
// resolvidas.
const textoRenderizado = (() => {
  const os = require("node:os");
  const { execFileSync } = require("node:child_process");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coronarias-"));
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
    path.join(appDir, ARVORE),
  ], { cwd: appDir, stdio: "pipe" });
  const mod = require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")));
  const arv = Object.values(mod).find((v) => v && v.nodes);
  const { textosDoNo } = require("./lib/textos-do-no.cjs");
  return textosDoNo(arv.nodes).join("\n");
})();

// ── A SAÍDA DA VARREDURA DO ECG SEM SUPRA ────────────────────────────────
//
// ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17): `ecg_sem_supra` é o destino do
// "Não sei dizer" da pergunta do supra e lista CINCO padrões de oclusão — sem
// opção nenhuma, `next` fixo para a troponina. Quem reconhecia um De Winter,
// que é sala AGORA, era levado para o mesmo lugar de quem não achou nada.
//
// Varredura sem saída é decisão não perguntada (a mesma do `vascular`).
{
  const os = require("node:os");
  const { execFileSync } = require("node:child_process");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coron-saida-"));
  let arv = null;
  try {
    execFileSync("npx", [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
      path.join(appDir, ARVORE),
    ], { cwd: appDir, stdio: "pipe" });
    arv = Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
  } catch { /* tsc reclama de tipos e ainda emite */ }

  if (!arv) {
    falhas.push("a árvore das coronárias não compilou — as conferências da saída do ECG NÃO RODARAM.");
  } else {
    const { textosDoNo } = require("./lib/textos-do-no.cjs");
    const n = (id) => arv.nodes[id];
    const saida = n("ecg_sem_supra_saida");

    if (n("ecg_sem_supra")?.next !== "ecg_sem_supra_saida") {
      falhas.push(
        "`ecg_sem_supra` voltou a despejar direto no destino seguinte. ⚠️ Ele é o destino do \"não sei\" " +
        "e lista cinco padrões de OCLUSÃO — sem a pergunta de saída, quem reconhece um De Winter " +
        "(que é sala AGORA) segue para a troponina do mesmo jeito."
      );
    } else ok++;

    if (saida?.type !== "decision") {
      falhas.push("`ecg_sem_supra_saida` deixou de ser decisão — a varredura voltou a não ter saída.");
    } else ok++;

    // ⚠️ AS TRÊS SAÍDAS, e cada uma é conferida SOZINHA (R-1 corolário).
    const esperadas = [
      ["ACHEI um padrão", "ecg_achei", /^SIM/i, "ecg_sem_supra_achei"],
      ["NÃO TENHO CERTEZA", "ecg_incerto", /certeza|duvidos/i, "ecg_sem_supra_duvida"],
      ["NÃO achei nenhum", "ecg_nao", /^N[ÃA]O\b/i, "nste_trop"],
    ];
    for (const [nome, id, rotulo, destino] of esperadas) {
      const o = (saida?.options ?? []).find((x) => x.id === id);
      if (!o) {
        falhas.push(
          `a saída "${nome}" sumiu de \`ecg_sem_supra_saida\`. ⚠️ São TRÊS: quem chegou aqui já disse ` +
          `"não sei dizer" UMA VEZ — obrigá-lo a escolher entre achei e não achei é obrigá-lo a mentir para seguir.`
        );
        continue;
      }
      ok++;
      if (!rotulo.test(String(o.label ?? ""))) {
        falhas.push(`o rótulo da saída "${nome}" deixou de dizer o que ela é: « ${String(o.label).slice(0, 60)} ».`);
      } else ok++;
      if (o.next !== destino) {
        falhas.push(
          `a saída "${nome}" aponta para \`${o.next}\` e não para \`${destino}\`. ` +
          `⚠️ Quem reconheceu um padrão de oclusão tem a urgência do STEMI; quem duvida NÃO pode ser liberado.`
        );
      } else ok++;
    }

    // ⚠️ O DEFAULT ASSIMÉTRICO DA DÚVIDA — as três coisas que duvidar NÃO impede.
    const duvida = n("ecg_sem_supra_duvida") ? textosDoNo(n("ecg_sem_supra_duvida")).join("\n") : "";
    for (const [nome, padrao] of [
      ["repetir/seriar o ECG", /REPETIR o ECG|SERIAR/i],
      ["colher troponina", /TROPONINA/i],
      ["não liberar", /N[ÃA]O LIBERAR/i],
    ]) {
      if (!padrao.test(duvida)) {
        falhas.push(
          `o ramo da DÚVIDA perdeu "${nome}". ⚠️ O default aqui é assimétrico: duvidar não impede repetir o ` +
          `ECG, colher troponina nem manter o paciente — impede apenas LIBERAR. A evolução do traçado é o que resolve.`
        );
      } else ok++;
    }

    // ── A VARREDURA SÓ COM PADRÃO — o procedimento saiu (item 2) ─────────
    //
    // ⚠️ Os blocos "como fazer V7–V9" e "como fazer V3R–V4R" (805 ch) ficavam
    // INTERLEAVED entre os padrões. Quem está varrendo padrão não está montando
    // derivação — e quem precisa montar tem passo próprio, com volta.
    const varredura = n("ecg_sem_supra") ? textosDoNo(n("ecg_sem_supra")).join("\n") : "";
    for (const [nome, padrao] of [
      ["como fazer V7–V9", /V7 na linha axilar posterior/i],
      ["como fazer V3R–V4R", /espelhe as precordiais/i],
    ]) {
      if (padrao.test(varredura)) {
        falhas.push(
          `o bloco "${nome}" voltou para dentro da varredura. ⚠️ São 805 caracteres de PROCEDIMENTO no meio ` +
          `de uma lista de PADRÕES — quem varre não está montando derivação. O passo próprio é ` +
          `\`ecg_derivacoes_extras\`, alcançado por quem precisa registrar, e ele volta para a pergunta.`
        );
      } else ok++;
    }
    const extras = n("ecg_derivacoes_extras");
    if (!extras) {
      falhas.push("`ecg_derivacoes_extras` sumiu — o procedimento das derivações extras ficou sem lugar.");
    } else ok++;
    if (extras && extras.next !== "ecg_sem_supra_saida") {
      falhas.push(
        "o passo das derivações extras não VOLTA para a pergunta. ⚠️ Quem foi registrar V7–V9 precisa " +
        "responder o que viu — mandá-lo adiante é perder o traçado que ele acabou de fazer."
      );
    } else if (extras) ok++;

    // ── O OMI/NOMI MUDOU DE LUGAR, NÃO SAIU (item 3) ────────────────────
    //
    // ⚠️ Ele tinha UM único consumo no app. Tirá-lo da varredura sem destino
    // seria apagar conteúdo, e o retrato provaria a diferença.
    const saidaTexto = saida ? textosDoNo(saida).join("\n") : "";
    if (!/OMI\/NOMI|occlusion MI/i.test(saidaTexto)) {
      falhas.push(
        "o enquadramento OMI/NOMI não está na saída da varredura. ⚠️ Ele tinha UM único consumo no app " +
        "(dentro do nó da varredura): se saiu de lá e não chegou aqui, foi APAGADO, não realocado."
      );
    } else ok++;

    // ── O WELLENS ABRE PELO QUE O DISTINGUE (item 4) ────────────────────
    if (!/[ÚU]NICO DESTA LISTA EM QUE O ERRO [ÉE] FAZER/i.test(varredura)) {
      falhas.push(
        "o rótulo do Wellens perdeu o que o distingue dos outros. ⚠️ Nos demais o erro é DEIXAR de fazer; " +
        "no Wellens é FAZER — mandar para teste ergométrico alguém com estenose crítica de DA. Quem varre " +
        "lendo só padrões trata o Wellens como mais um achado."
      );
    } else ok++;

    // ⚠️ E O INTERVALO CONTINUA DECLARADO COMO NÃO FIXADO (R-5): as fontes abertas
    // para este módulo tratam de RECONHECIMENTO, não de cadência de repetição.
    // Se alguém escrever um número aqui, ele veio de memória.
    if (!/N[ÃA]O FIXA O INTERVALO/i.test(duvida)) {
      falhas.push(
        "o ramo da dúvida deixou de declarar que o app NÃO FIXA o intervalo do ECG seriado. ⚠️ As fontes " +
        "abertas para este módulo (JACC 2025, ACEP Now, LITFL) tratam de reconhecimento, não de cadência — " +
        "um número aqui teria vindo de memória (R-5)."
      );
    } else ok++;
  }
}

if (textoRenderizado.length < 5000) {
  falhas.push(`só ${textoRenderizado.length} caracteres renderizados — a conferência pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

{
  for (const [nome, padrao] of [
    ["o marco do porta-balão", /PRIMEIRO CONTATO MÉDICO/],
    ["o marco do ECG", /10 min da chegada/],
    ["o marco da agulha", /entre o diagnóstico e a agulha/],
  ]) {
    if (!padrao.test(textoRenderizado)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. Prazo sem marco é o defeito mais comum do app (D-17) — e no ` +
        `porta-balão contar do lugar errado ENCURTA o prazo percebido.`
      );
    } else ok++;
  }
}

// ── D. Fibrinólise: absolutas, relativas e a conduta do meio ──────────────
{
  for (const [nome, padrao] of [
    ["as contraindicações RELATIVAS", /CONTRAINDICAÇÕES RELATIVAS/],
    ["a conduta com relativa e sem absoluta", /COM RELATIVA E SEM ABSOLUTA/],
    ["o critério que decide (tempo até ICP)", /dentro de 120 min do primeiro contato/],
    ["os rótulos das opções falando de ABSOLUTA", /Sem contraindicação ABSOLUTA/],
  ]) {
    if (!padrao.test(arvore)) {
      falhas.push(
        `${ARVORE}: ${nome} sumiu. Perguntar só por absolutas e rotular a saída como "sem ` +
        `contraindicação" faz o médico responder "não" tendo uma relativa na frente.`
      );
    } else ok++;
  }
}

// ── E. R-48: apresentação onde a dose é administrada ──────────────────────
{
  for (const [rel, nome] of [
    ["lib/tenecteplase.ts", "TENECTEPLASE_APRESENTACAO"],
    ["lib/enoxaparina.ts", "ENOXAPARINA_APRESENTACAO"],
  ]) {
    if (!new RegExp(`\\b${nome}\\b`).test(semImports(ARVORE))) {
      falhas.push(`${ARVORE}: não consome ${nome} — a dose é administrada aqui e a forma do fármaco vive noutro lugar (R-48).`);
    } else ok++;
  }

  // A confusão mg × U do TNK é o que torna o erro catastrófico.
  if (!/1 mg = 200 U/.test(limpo("lib/tenecteplase.ts"))) {
    falhas.push(
      `lib/tenecteplase.ts: sumiu a equivalência 1 mg = 200 U. O frasco traz as DUAS escalas, a dose ` +
      `se prescreve em mg, e confundi-las erra por um fator de 200 num bolus ÚNICO.`
    );
  } else ok++;
}

// ── F. O enquadramento OMI declarado como em consolidação ─────────────────
{
  if (!/MANTÉM STEMI\/NSTEMI/.test(lib)) {
    falhas.push(
      `${LIB}: o enquadramento OMI perdeu a ressalva de que a ACC/AHA 2025 MANTÉM STEMI/NSTEMI. ` +
      `Trocar a nomenclatura sem avisar deixa o médico com um vocabulário que a equipe ao lado não usa.`
    );
  } else ok++;
}

console.log("\nSíndromes coronarianas — quatro grupos, quatro condutas, e os prazos com marco\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — os grupos separados, o limiar de V7–V9 e a conduta do meio\n`);
process.exit(0);
