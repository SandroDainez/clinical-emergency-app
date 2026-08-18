#!/usr/bin/env node
/**
 * PROMETE
 *   Que a gestante e a PUÉRPERA apareçam na TELA — nas superfícies em que a
 *   crise é conduzida —, com os dois papéis separados (o benzodiazepínico
 *   aborta, o magnésio trata e previne) e sem fechar diagnóstico; que exista
 *   ponteiro navegável para o módulo de eclâmpsia; que as duas causas em que
 *   escalar não resolve (isoniazida e hiponatremia) estejam antes da escalada;
 *   e que os limiares de 5/20/40/60 min e as doses da 1ª linha não regridam.
 *
 * NÃO PROMETE
 *   Que as doses estejam clinicamente certas — elas não foram alteradas nesta
 *   auditoria, e o comportamento do cronômetro é conferido por
 *   `test:cronometro-arvore`, com 36 conferências executadas.
 *
 * UNIVERSO
 *   A árvore das convulsões compilada, e o catálogo de módulos para o ponteiro.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * ⚠️ A EXCLUSÃO DE ESCOPO EXISTIA SÓ EM COMENTÁRIO. O cabeçalho do arquivo
 * dizia que a diretriz EXCLUI a população obstétrica e que na gestante o
 * fármaco de primeira linha é o sulfato de magnésio. Na árvore não havia ramo,
 * ressalva nem ponteiro; "gestante" aparecia UMA vez na tela, como
 * contraindicação do valproato. O β-hCG era colhido e nada agia sobre ele.
 *
 * Comentário protege o autor de ter esquecido; não protege o paciente. Está
 * registrado no METODO como regra, e esta trava é a contraparte executável:
 * ela lê o que a ÁRVORE ENTREGA, não o que o arquivo comenta.
 *
 * ── AS TRÊS PRECISÕES QUE ELA VIGIA ────────────────────────────────────────
 *
 * 1. Os dois papéis separados. "Magnésio, não benzodiazepínico" faria alguém
 *    deixar de abortar uma crise em curso.
 * 2. Gestante OU PUÉRPERA. A eclâmpsia pós-parto é a que mais escapa.
 * 3. Suspeita, não diagnóstico. A epiléptica grávida tratada como eclâmptica é
 *    o erro inverso, e ele também existe.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-conv-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "seizure-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "seizure-decision-tree.js")).seizureDecisionTree;
} catch (erro) {
  falhas.push(`a árvore das convulsões não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

/**
 * ⚠️ OS TEXTOS DOS PRAZOS ENTRAM — e a primeira versão desta trava provou por
 * quê: ela acusou "o limiar de 5 min sumiu", e o texto estava vivo, no
 * `aoVencer` do prazo. Num módulo cujo protocolo É o relógio, deixar os textos
 * de prazo fora do universo é ler tudo menos o que define a conduta.
 */
/**
 * ⚠️ TODO o texto do nó — via helper canônico, não por lista de campos.
 *
 * A versão anterior listava campos à mão e ficava cega para os demais (aqui,
 * `options`, `intro` e `targets`). O helper deriva do objeto: campo novo entra
 * sozinho (R-73, D-15).
 */
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const textosDe = (id) => textosDoNo(arvore?.nodes?.[id]);
const todos = arvore ? Object.keys(arvore.nodes).flatMap(textosDe) : [];
const tudo = todos.join("\n");

// ── A. A GESTANTE E A PUÉRPERA CHEGAM À TELA ─────────────────────────────
{
  // ⚠️ NAS SUPERFÍCIES EM QUE SE CONDUZ, e não só numa. Quem entra pela 1ª
  // linha e escala não passa pela estabilização de novo.
  const CONDUZEM = ["estabilizacao", "primeira_linha", "segunda_linha", "terceira_linha", "pos_ictal"];
  const semAviso = CONDUZEM.filter((id) => !textosDe(id).some((t) => /GESTANTE OU PUÉRPERA/.test(t)));
  // A 2ª linha é a única que pode ficar de fora sem prejuízo: quem chegou lá
  // passou pela 1ª, que traz o aviso. Exigir em TODAS transformaria a tela num
  // repetidor — e bloco repetido treina o leitor a pular (D-35/R-50).
  const faltamCriticas = semAviso.filter((id) => id !== "segunda_linha");
  if (faltamCriticas.length) {
    falhas.push(
      `o aviso de gestante/puérpera sumiu de: ${faltamCriticas.join(", ")}. ⚠️ Ele existia SÓ NO COMENTÁRIO do ` +
      `arquivo, e comentário não chega ao usuário. O β-hCG é colhido na estabilização e sem este aviso nada ` +
      `no fluxo age sobre ele.`
    );
  } else ok++;

  const aviso = todos.find((t) => /GESTANTE OU PUÉRPERA/.test(t)) ?? "";
  for (const [nome, padrao, porque] of [
    [
      "os DOIS papéis separados",
      /benzodiazepínico ABORTA a crise; o magnésio TRATA A CAUSA/,
      "escrever \"magnésio, não benzodiazepínico\" faria alguém deixar de abortar uma crise em curso",
    ],
    [
      "a crise que se aborta como qualquer outra",
      /se aborta com BENZODIAZEPÍNICO, como qualquer outra/,
      "é o que impede a leitura de que o benzo está proibido aqui",
    ],
    ["a PUÉRPERA", /PUÉRPERA CONTA/, "a eclâmpsia pós-parto é a que mais escapa — a pessoa já não está grávida"],
    ["a janela tardia", /TARDIA, além das 48 h/, "as 48 h separam precoce de tardia, não marcam o fim do risco"],
    [
      "que NÃO fecha diagnóstico",
      /E ISTO NÃO FECHA DIAGNÓSTICO/,
      "a epiléptica grávida tratada como eclâmptica é o erro inverso, e ele também existe",
    ],
    ["o que EXCLUIR eclâmpsia exige", /medir a pressão, procurar proteinúria/, "sem isso, \"pense em eclâmpsia\" é só um susto"],
  ]) {
    if (!padrao.test(aviso)) falhas.push(`gestante/puérpera: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  // O β-hCG passa a ter consequência declarada.
  if (!textosDe("estabilizacao").some((t) => /β-hCG NÃO É SÓ PARA REGISTRO/.test(t))) {
    falhas.push(
      "o β-hCG voltou a ser coleta sem consequência. Ele é colhido na estabilização, e um exame que se pede " +
      "sem dizer o que muda quando volta positivo é registro, não conduta."
    );
  } else ok++;
}

// ── B. O PONTEIRO PARA A ECLÂMPSIA EXISTE E APONTA PARA MÓDULO REAL ──────
{
  const alvos = Object.values(arvore?.nodes ?? {}).flatMap((n) => n.targets ?? []);
  const alvo = alvos.find((t) => /eclampsia/i.test(t.moduleId ?? ""));
  if (!alvo) {
    falhas.push(
      "não há ponteiro para o módulo de pré-eclâmpsia/eclâmpsia. O módulo existe e está pronto — mandar " +
      "pensar em eclâmpsia sem caminho até ela é aviso sem saída."
    );
  } else {
    ok++;
    // ⚠️ E O ID TEM DE SER REAL — ponteiro para módulo inexistente é pior que
    // ponteiro nenhum: ele parece resolver.
    const catalogo = lerFonte(path.join(appDir, "clinical-modules.ts"));
    if (!new RegExp(`id:\\s*"${alvo.moduleId}"`).test(catalogo)) {
      falhas.push(
        `o ponteiro aponta para "${alvo.moduleId}", que não existe em clinical-modules.ts. Ponteiro para ` +
        `módulo inexistente é pior que ponteiro nenhum — ele parece resolver.`
      );
    } else ok++;
  }
}

// ── C. AS CAUSAS EM QUE ESCALAR NÃO RESOLVE, ANTES DA ESCALADA ───────────
{
  const segunda = textosDe("segunda_linha").join("\n");
  for (const [nome, padrao, porque] of [
    ["a isoniazida", /PERGUNTE POR ISONIAZIDA/, "a crise é refratária a benzo e a antiepiléptico, e o antídoto é piridoxina"],
    ["a piridoxina com dose", /grama por grama da dose ingerida; se a dose for desconhecida, 5 g/, "R-48: mandar dar sem dizer quanto"],
    ["o mecanismo da isoniazida", /bloqueia a síntese de GABA/, "sem o mecanismo, a regra não gruda"],
    ["a hiponatremia", /SÓDIO BAIXO — A CRISE QUE O ANTIEPILÉPTICO NÃO RESOLVE/, "o que trata é o sódio"],
    ["o encaminhamento sem duplicar a dose", /CORREÇÕES ELETROLÍTICAS, que os calculam/, "a dose tem dono, e duplicá-la recria a divergência"],
  ]) {
    if (!padrao.test(segunda)) falhas.push(`2ª linha: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  // ⚠️ AQUI HAVIA UMA CONFERÊNCIA DE POSIÇÃO, E ELA FOI REMOVIDA — não por
  // ser difícil, mas por não proteger o que dizia proteger.
  //
  // Ela exigia que as causas específicas não fossem o ÚLTIMO item do nó. A
  // mutação realista — mover as duas para o penúltimo lugar, depois de toda a
  // lista de fármacos — PASSAVA, porque a condição continuava satisfeita. Uma
  // conferência que só cai no caso extremo mede o caso extremo, não a
  // propriedade.
  //
  // E a propriedade que eu queria, pensando bem, não existe: dentro deste nó
  // a ordem não decide nada — quem chega aqui lê a tela inteira antes de
  // escalar para o refratário, que é outro nó. O que DECIDE é as causas
  // estarem no nó da 2ª linha E no do refratário, e isso é conferido acima e
  // abaixo, por presença.
  //
  // Trava que mede o que não importa constrange o autor sem proteger o
  // paciente (R-55). Removida com o registro, em vez de mantida por parecer
  // rigor.

  // E o refratário repete as duas, porque é onde o erro se consuma.
  const terceira = textosDe("terceira_linha").join("\n");
  if (!/PERGUNTE POR ISONIAZIDA/.test(terceira) || !/SÓDIO BAIXO/.test(terceira)) {
    falhas.push(
      "o nó do refratário perdeu as causas específicas. É exatamente ali que o paciente está sob anestésico " +
      "sem que ninguém tenha perguntado por isoniazida ou olhado o sódio."
    );
  } else ok++;
}

// ── D. O QUE NÃO PODE REGREDIR: limiares e 1ª linha ──────────────────────
{
  for (const [nome, padrao, porque] of [
    ["o limiar de 5 min", /5 MIN DE CRISE — é mal epiléptico/, "é a definição de estado de mal"],
    ["a 2ª linha aos 20 min", /20–40 min · 2ª linha/, "o relógio e o título andam juntos"],
    ["o refratário aos 40 min", /40–60 min · Refratário/, "idem"],
    ["o midazolam IM em dose FIXA", /Midazolam 10 mg IM, dose FIXA no adulto/, "RAMPART; calcular por peso só adiciona erro no meio da crise"],
    ["a ausência declarada da via retal", /A via RETAL não entra neste módulo/, "ausência declarada é diferente de esquecimento (R-13)"],
    ["o ESETT na 2ª linha", /Nenhum é comprovadamente superior \(ESETT\)/, "é o que autoriza escolher por comorbidade e disponibilidade"],
    ["o não-convulsivo", /MAL EPILÉPTICO NÃO-CONVULSIVO/, "é o que se perde depois de a crise parar"],
    ["a proibição da interrupção diária da sedação", /NÃO fazer interrupção diária da sedação/, "a regra geral da UTI não vale aqui"],
  ]) {
    if (!padrao.test(tudo)) falhas.push(`${nome} sumiu — ${porque}.`);
    else ok++;
  }
}

// ── E. Vacuidade ─────────────────────────────────────────────────────────
{
  if (todos.length < 50) {
    falhas.push(`só ${todos.length} textos no módulo — as conferências podem ter rodado sobre nada (R-15 item 9).`);
  } else ok++;
}

console.log("\nConvulsões — a gestante e a puérpera na tela, e as causas em que escalar não resolve\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — exclusão de escopo virou conteúdo, com ponteiro navegável e sem fechar diagnóstico\n`);
process.exit(0);
