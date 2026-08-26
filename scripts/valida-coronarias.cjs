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
  // ⚠️ EXCEÇÕES DECLARADAS. `OCLUSAO_SEM_SUPRA_ABERTURA` é `summary` do `ecg`
  // E primeira ação de `ecg_sem_supra`, de propósito. Desde 2026-08-24,
  // `OCLUSAO_AVR_TRONCO`/`WELLENS_NAO_E_OCLUSAO`/`WELLENS_NUNCA_ERGOMETRICO`
  // também repetem de propósito: aparecem na VARREDURA (`ecg_sem_supra`,
  // lista os 5 padrões para reconhecimento) E no nó de CONDUTA do padrão
  // específico (`ecg_avr_conduta`/`wellens_conduta`, alcançado só depois de
  // o usuário já ter identificado aquele padrão) — não é a duplicata antiga
  // (mesmo texto recolhido atrás de "Ver critérios"), é o mesmo texto em
  // dois PASSOS DIFERENTES do fluxo, cada um com função própria.
  const EXCECOES_DUPLICATA = new Set([
    "OCLUSAO_SEM_SUPRA_ABERTURA",
    "OCLUSAO_AVR_TRONCO",
    "WELLENS_NAO_E_OCLUSAO",
    "WELLENS_NUNCA_ERGOMETRICO",
  ]);
  for (const c of PADROES) {
    const r = consomeConstante({ arquivo: arq, constante: c });
    if (!r.consome) mortas.push(c);
    else if (r.usos > 1 && !EXCECOES_DUPLICATA.has(c)) duplicadas.push(`${c} (${r.usos}×)`);
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

// ── CINCO TELAS DE 2 CARDS — imagem grande, zero scroll (quarta correção
// pós-validação física, 2026-08-24) ────────────────────────────────────────
//
// ⚠️ O QUE MUDOU DESTA VEZ: os traçados de ECG reais (antes só rótulo+texto)
// engordaram os cards o bastante para reintroduzir scroll mesmo com 3 cards +
// 3 saídas (tela única anterior) ou 4 cards (tela de território). Pedido
// explícito: "não resolver comprimindo a imagem... se imagem + opções não
// cabem, dividir em mais uma tela curta". Cada tela de comparação agora tem
// NO MÁXIMO 2 cards — contrato numérico desta rodada, e ela vale para as
// CINCO telas de comparação visual do módulo:
//
//   `ecg_supra_qual`      — Supra anterior + Supra inferior      (+ "Outro padrão")
//   `ecg_supra_qual_2`    — Supra lateral + BRE novo
//   `ecg_sem_supra`       — De Winter + Posterior                (+ "Outro padrão")
//   `ecg_padroes_t_avr`   — T hiperagudas + aVR                  (+ "Outro padrão")
//   `ecg_padroes_wellens` — Wellens A + Wellens B
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
    falhas.push("a árvore das coronárias não compilou — as conferências das telas de padrões sem supra NÃO RODARAM.");
  } else {
    const { textosDoNo } = require("./lib/textos-do-no.cjs");
    const n = (id) => arv.nodes[id];

    // ⚠️ PERGUNTA SIMPLES DE 3 OPÇÕES (2026-08-24, quarta correção pós-
    // validação física) — "Não — descartei os padrões sem supra" e "Não sei
    // dizer — ver os padrões que NÃO fazem supra" confundiam o usuário
    // (relato do autor: "não correspondem ao raciocínio real"). Agora é
    // Sim/Não/Não sei, com "Não" e "Não sei" convergindo para a tela visual.
    const ecgNode = n("ecg");
    const opcoesEcg = ecgNode?.options ?? [];
    if (opcoesEcg.length !== 3) {
      falhas.push(`\`ecg\` tem ${opcoesEcg.length} opções, esperava EXATAMENTE 3 (Sim/Não/Não sei).`);
    } else ok++;
    // ⚠️ ORDEM NOVA (2026-08-25): o portão de dissecção deixou de bloquear a
    // INTERPRETAÇÃO do ECG e passou a bloquear só o antitrombótico — por isso
    // as saídas de `ecg` vão ao portão, e a CLASSIFICAÇÃO (`ecg_supra_qual` /
    // `ecg_sem_supra`) vem depois do AAS. E "não sei" deixou de ser sinônimo
    // de "não": tem destino próprio (`ecg_ajuda_supra`), com ajuda real.
    for (const [id, destino] of [["sim", "portao_grupo_a"], ["nao", "portao_grupo_a"], ["nao_sei", "ecg_ajuda_supra"]]) {
      const o = opcoesEcg.find((x) => x.id === id);
      if (!o) falhas.push(`\`ecg\`: a opção "${id}" sumiu.`);
      else if (o.next !== destino) falhas.push(`\`ecg\`: a opção "${id}" aponta para \`${o.next}\`, esperava \`${destino}\`.`);
      else ok++;
    }
    // ⚠️ AS FRASES PROIBIDAS NÃO PODEM VOLTAR — confundiam o raciocínio real.
    const textoEcg = ecgNode ? textosDoNo(ecgNode).join("\n") : "";
    for (const proibida of [/descartei os padr[õo]es sem supra/i, /ver os padr[õo]es que N[ÃA]O fazem supra/i, /BRE\s*\/\s*BRD/i]) {
      if (proibida.test(textoEcg)) {
        falhas.push(`\`ecg\` ainda tem a frase proibida "${proibida}" — pedido explícito de remoção (confundia o usuário).`);
      } else ok++;
    }

    // ── AS CINCO TELAS DE 2 CARDS — mesmo contrato, checado uma vez por tela.
    const TELAS = [
      {
        id: "ecg_supra_qual", rotulos: ["Supra anterior/septal (V1–V4)", "Supra inferior (DII, DIII, aVF)"],
        opcoes: [
          ["anterior", "stemi_localizacao"], ["inferior", "stemi_localizacao"], ["outro", "ecg_supra_qual_2"],
          // ⚠️ NOVO (correção final 2026-08-25, item I5/C) — supra já
          // estabelecido; território incerto não muda a indicação.
          ["incerto", "stemi_localizacao"],
        ],
        totalOpcoes: 4,
      },
      {
        id: "ecg_supra_qual_2", rotulos: ["Supra lateral (DI, aVL, V5–V6)", "BRE novo/presumivelmente novo"],
        opcoes: [["lateral", "stemi_localizacao"], ["bre", "lbbb_correlacao"], ["incerto", "stemi_localizacao"]],
        totalOpcoes: 3,
      },
      {
        id: "ecg_sem_supra", rotulos: ["De Winter", "Posterior"],
        opcoes: [
          ["de_winter", "ecg_grupoB_oclusao"], ["posterior", "ecg_grupoB_oclusao"],
          ["outro_padrao", "ecg_padroes_t_avr"], ["nenhum", "nste_trop"], ["incerto", "ecg_sem_supra_duvida"],
        ],
        totalOpcoes: 5,
      },
      {
        id: "ecg_padroes_t_avr", rotulos: ["T hiperagudas", "aVR + infra difuso"],
        opcoes: [
          ["t_hiperaguda", "ecg_grupoB_oclusao"], ["avr", "ecg_avr_conduta"],
          ["outro_padrao", "ecg_padroes_wellens"], ["nenhum", "nste_trop"], ["incerto", "ecg_sem_supra_duvida"],
        ],
        totalOpcoes: 5,
      },
      {
        id: "ecg_padroes_wellens", rotulos: ["Wellens A", "Wellens B"],
        opcoes: [
          ["wellens_a", "wellens_conduta"], ["wellens_b", "wellens_conduta"],
          ["nenhum", "nste_trop"], ["incerto", "ecg_sem_supra_duvida"],
        ],
        totalOpcoes: 4,
      },
    ];

    for (const t of TELAS) {
      const no = n(t.id);
      if (!no || no.type !== "decision") {
        falhas.push(`\`${t.id}\` sumiu ou deixou de ser decisão.`);
        continue;
      }
      ok++;

      // ⚠️ EXATAMENTE 2 CARDS — contrato numérico desta rodada. Mais que 2
      // reintroduz o scroll medido em screenshot real; menos que 2 não é
      // "comparar padrões".
      if ((no.comparativo?.length ?? 0) !== 2) {
        falhas.push(
          `\`${t.id}\` tem ${no.comparativo?.length ?? 0} cards, esperava EXATAMENTE 2 — contrato numérico ` +
          `desta rodada ("se imagem + opções não cabem, dividir em mais uma tela curta").`
        );
      } else ok++;
      const rotulosNo = new Set((no.comparativo ?? []).map((c) => c.rotulo));
      for (const esperado of t.rotulos) {
        if (!rotulosNo.has(esperado)) falhas.push(`\`${t.id}\`: o card "${esperado}" sumiu.`);
        else ok++;
      }

      // Cada card tem NO MÁXIMO 2 linhas de "significado" — se voltar a ter
      // parágrafo, a tela virou livro de novo.
      for (const item of no.comparativo ?? []) {
        if ((item.significado ?? "").length > 120) {
          falhas.push(
            `o card "${item.rotulo}" (\`${t.id}\`) tem "significado" com ${item.significado.length} ` +
            `caracteres — mais que 1 frase de reconhecimento. O texto completo pertence a \`evidence\`.`
          );
        } else ok++;
      }

      // ⚠️ CADA CARD PRECISA SER O PRÓPRIO BOTÃO — sem `optionId`, o card
      // volta a ser só ilustração e a lista de opções abaixo duplica cada
      // nome como linha de texto, que é exatamente o que estoura 375×667.
      for (const [id] of t.opcoes) {
        const card = (no.comparativo ?? []).find((c) => c.optionId === id);
        // nem toda opção tem card correspondente (saídas como "outro_padrao"/
        // "nenhum"/"incerto" não são padrão visual) — só confere quando o id
        // aparece em `rotulos` via optionId batendo com uma opção de padrão.
        if (["anterior", "inferior", "lateral", "bre", "de_winter", "posterior", "t_hiperaguda", "avr", "wellens_a", "wellens_b"].includes(id) && !card) {
          falhas.push(`\`${t.id}\`: nenhum card declara \`optionId: "${id}"\` — a opção "${id}" não tem card tocável correspondente.`);
        } else if (card) ok++;
      }

      // ⚠️ AS SAÍDAS/OPÇÕES — roteamento clínico inalterado, conferido opção
      // por opção.
      for (const [id, destino] of t.opcoes) {
        const o = (no.options ?? []).find((x) => x.id === id);
        if (!o) {
          falhas.push(`\`${t.id}\`: a opção "${id}" sumiu.`);
          continue;
        }
        ok++;
        if (o.next !== destino) {
          falhas.push(
            `\`${t.id}\`: a opção "${id}" aponta para \`${o.next}\` e não para \`${destino}\`. ⚠️ Wellens NUNCA ` +
            "pode apontar para um destino de STEMI/fibrinólise — a Seção G confere isso por alcançabilidade; " +
            "esta checagem pega o desvio mais cedo, pelo rótulo."
          );
        } else ok++;
      }
      if ((no.options?.length ?? 0) !== t.totalOpcoes) {
        falhas.push(`\`${t.id}\` tem ${no.options?.length ?? 0} opções, esperava exatamente ${t.totalOpcoes}.`);
      } else ok++;
    }

    // ⚠️ O CARD DO aVR NÃO PODE CONCLUIR TRONCO/MULTIARTERIAL (pedido
    // explícito, 2026-08-24): isso é o que o ECG SUGERE, não o que ele PROVA
    // sozinho. "Tronco"/"multiarterial" só podem aparecer em `evidence`
    // (`OCLUSAO_AVR_TRONCO`, camada "Por quê?"), nunca no card principal.
    const cardAvr = (n("ecg_padroes_t_avr")?.comparativo ?? []).find((c) => /aVR/i.test(c.rotulo));
    if (cardAvr && /tronco|multiarterial/i.test(cardAvr.significado ?? "")) {
      falhas.push(
        `o card do aVR conclui "tronco"/"multiarterial" no \`significado\` — o ECG SUGERE isso, não PROVA. ` +
        `O card deve dizer só o que o traçado permite concluir ("isquemia subendocárdica/global de alto ` +
        `risco"); a associação com tronco/multiarterial fica em "Por quê?".`
      );
    } else if (cardAvr) ok++;
    if (cardAvr && !/n[ãa]o [ée] indica[çc][ãa]o autom[áa]tica de fibrin[óo]lise/i.test(cardAvr.conduta ?? "")) {
      falhas.push(`o card do aVR perdeu a ressalva "não é indicação automática de fibrinólise" na \`conduta\`.`);
    } else if (cardAvr) ok++;

    // ⚠️ WELLENS: "SEM DOR ATIVA" NÃO É MAIS CRITÉRIO DO CARD (pedido
    // explícito, 2026-08-24) — é dado de contexto avaliado em
    // `wellens_conduta`, não pré-requisito de reconhecimento visual.
    for (const item of n("ecg_padroes_wellens")?.comparativo ?? []) {
      if (/sem dor ativa/i.test(item.significado ?? "")) {
        falhas.push(
          `o card "${item.rotulo}" ainda tem "sem dor ativa" no \`significado\` — isso virou contexto avaliado ` +
          `na conduta, não critério obrigatório do card de reconhecimento visual.`
        );
      } else ok++;
    }

    // ⚠️ O DEFAULT ASSIMÉTRICO DA DÚVIDA — as três coisas que duvidar NÃO impede.
    // Alcançável a partir de QUALQUER uma das três telas de "sem supra".
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

    // ⚠️ `ecg_derivacoes_extras` foi REMOVIDO de propósito (2026-08-24,
    // terceira correção): o link genérico de V7–V9/V3R–V4R saiu da tela 1. A
    // orientação de V7–V9 (relevante só quando "Posterior" está em jogo) foi
    // para `evidence` de `ecg_sem_supra`; a de V3R–V4R (relevante só em
    // inferior + suspeita de VD) foi para `porque` de `stemi_localizacao` —
    // cada uma no nó em que é relevante, não num passo genérico solto.
    if (n("ecg_derivacoes_extras")) {
      falhas.push("`ecg_derivacoes_extras` deveria ter sido removido (conteúdo realocado) — voltou a existir como passo solto.");
    } else ok++;
    const textoStemiLoc = n("stemi_localizacao") ? textosDoNo(n("stemi_localizacao")).join("\n") : "";
    if (!/V3R[–-]V4R/.test(textoStemiLoc)) {
      falhas.push("`stemi_localizacao` perdeu a orientação de V3R–V4R (deveria estar em `porque`, relocada de `ecg_derivacoes_extras`).");
    } else ok++;

    // ── O TEXTO COMPLETO FOI PARA "VER CRITÉRIOS", NÃO APAGADO ───────────
    //
    // ⚠️ As constantes de padrão + OMI/NOMI + VD vivem em `evidence` das duas
    // telas — camada secundária, mas CONSUMIDAS, não apagadas. A Seção B-bis
    // (mais acima) já confere "consome pelo menos uma vez"; aqui confere-se
    // que o texto chega ao ARTEFATO COMPILADO das telas específicas.
    const textoTela1 = n("ecg_sem_supra") ? textosDoNo(n("ecg_sem_supra")).join("\n") : "";
    const textoTelaWellens = n("ecg_padroes_wellens") ? textosDoNo(n("ecg_padroes_wellens")).join("\n") : "";
    if (!/OMI\/NOMI|occlusion MI/i.test(textoTela1)) {
      falhas.push("o enquadramento OMI/NOMI não chega a `ecg_sem_supra` (evidence) — foi apagado, não realocado.");
    } else ok++;
    if (!/[ÚU]NICO DESTA LISTA EM QUE O ERRO [ÉE] FAZER/i.test(textoTelaWellens)) {
      falhas.push(
        "o texto completo do Wellens (o que o distingue — erro é FAZER, não deixar de fazer) não chega a " +
        "`ecg_padroes_wellens` (evidence). Continua sendo a informação mais fácil de perder numa varredura de padrões."
      );
    } else ok++;

    // ⚠️ E O INTERVALO CONTINUA DECLARADO COMO NÃO FIXADO (R-5).
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

// ── G. GRUPOS FUNCIONAIS (2026-08-24) — a correção do pedido do autor ─────
//
// "Não agrupar todos os padrões sob a conclusão única 'oclusão → reperfusão'.
// Wellens não pode acionar automaticamente o mesmo ramo terapêutico da
// STEMI." Esta seção prova isso na ÁRVORE COMPILADA, por alcançabilidade real
// — não por texto adjacente, que é exatamente o que enganava antes.
{
  const arv = (() => {
    const os = require("node:os");
    const { execFileSync } = require("node:child_process");
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coron-grupos-"));
    try {
      execFileSync("npx", [
        "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
        "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
        path.join(appDir, ARVORE),
      ], { cwd: appDir, stdio: "pipe" });
      return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
    } catch {
      return null;
    }
  })();

  if (!arv) {
    falhas.push("a árvore das coronárias não compilou — as conferências de grupos funcionais NÃO RODARAM.");
  } else {
    const n = (id) => arv.nodes[id];

    // Alcançabilidade real a partir de um nó, seguindo `next` (string ou
    // Roteamento — neste caso soma os `possiveis`) e `options[].next`.
    function alcancaveisDe(id) {
      const vistos = new Set();
      const fila = [id];
      while (fila.length) {
        const atual = fila.pop();
        if (vistos.has(atual)) continue;
        vistos.add(atual);
        const no = n(atual);
        if (!no) continue;
        if (typeof no.next === "string") fila.push(no.next);
        else if (no.next && Array.isArray(no.next.possiveis)) fila.push(...no.next.possiveis);
        for (const o of no.options ?? []) if (o.next) fila.push(o.next);
      }
      vistos.delete(id);
      return vistos;
    }

    // ⚠️ A CONFERÊNCIA CENTRAL: de `wellens_conduta`, fibrinólise é
    // INALCANÇÁVEL. Se algum dia alguém reconectar Wellens a `stemi_reperfusao`
    // "para simplificar", esta trava reprova por ALCANÇABILIDADE, não por
    // grep de texto vizinho.
    if (n("wellens_conduta")) {
      const alcance = alcancaveisDe("wellens_conduta");
      for (const proibido of ["stemi_fibrinolise", "stemi_fibrino_check", "stemi_reperfusao"]) {
        if (alcance.has(proibido)) {
          falhas.push(
            `Wellens ALCANÇA \`${proibido}\` na árvore compilada. ⚠️ A pesquisa clínica desta rodada ` +
            `confirmou (literatura complementar, Turkish J Emerg Med 2025): Wellens NÃO é indicação de ` +
            `reperfusão emergente nem de fibrinólise — é o padrão de reperfusão espontânea de uma estenose ` +
            `crítica, tratado com internação e cateterismo não emergencial.`
          );
        } else ok++;
      }
    } else {
      falhas.push("`wellens_conduta` sumiu — o Grupo C (Wellens) perdeu o nó dedicado.");
    }

    // De Winter/posterior/T-hiperaguda/aVR (Grupo B) DEVEM alcançar ICP ou
    // transferência — mas NUNCA a decisão de fibrinólise, porque a pesquisa
    // desta rodada não confirmou via de fibrinólise estabelecida para esses
    // padrões (eficácia inconsistente na literatura para De Winter).
    for (const origem of ["ecg_grupoB_oclusao", "ecg_avr_conduta"]) {
      if (!n(origem)) {
        falhas.push(`\`${origem}\` sumiu — o Grupo B perdeu um dos seus nós.`);
        continue;
      }
      const alcance = alcancaveisDe(origem);
      if (alcance.has("stemi_fibrino_check") || alcance.has("stemi_fibrinolise")) {
        falhas.push(
          `\`${origem}\` (Grupo B) alcança a decisão de fibrinólise. ⚠️ Fibrinólise não é a via padrão para ` +
          `estes padrões — a via é ICP/transferência.`
        );
      } else ok++;
      if (!alcance.has("stemi_icp") && !alcance.has("stemi_transfer")) {
        falhas.push(`\`${origem}\` (Grupo B) não alcança nem ICP nem transferência — ficou sem via de reperfusão.`);
      } else ok++;
    }

    // Grupo A (STEMI clássico) precisa continuar alcançando fibrinólise —
    // esta trava não pode virar "nunca fibrinolisar ninguém".
    if (n("stemi_localizacao")) {
      const alcance = alcancaveisDe("stemi_localizacao");
      if (!alcance.has("stemi_fibrinolise")) {
        falhas.push("`stemi_localizacao` (Grupo A) deixou de alcançar `stemi_fibrinolise` — STEMI clássico perdeu a via de fibrinólise.");
      } else ok++;
    }
  }
}

// ── H. LBBB — correlação clínica, não equivalência automática ─────────────
//
// A pesquisa desta rodada leu o texto completo da diretriz 2025 (busca
// literal, ~7.684 linhas do PDF oficial) e confirmou: LBBB novo isolado
// assintomático NÃO constitui equivalente de STEMI; Sgarbossa/Sgarbossa
// modificado NÃO aparecem em nenhum lugar do texto.
{
  const lbbbLib = limpo("lib/lbbb-sgarbossa.ts");
  for (const [nome, padrao] of [
    ["a citação literal da diretriz sobre LBBB", /does not constitute a STEMI equivalent/],
    ["a confirmação de ausência de Sgarbossa no texto", /N[ÃA]O ENCONTROU NENHUMA\s*\n?\s*OCORR[ÊE]NCIA|NENHUMA OCORR[ÊE]NCIA/],
    ["Sgarbossa rotulado como apoio, não regra desta diretriz", /N[ÃA]O É REGRA DESTA DIRETRIZ|apoio ao julgamento cl[ií]nico/i],
  ]) {
    if (!padrao.test(lbbbLib)) {
      falhas.push(`lib/lbbb-sgarbossa.ts: ${nome} sumiu.`);
    } else ok++;
  }

  if (!/lbbb_correlacao/.test(arvore)) {
    falhas.push(`${ARVORE}: o nó \`lbbb_correlacao\` sumiu — LBBB voltou a não ter correlação clínica própria.`);
  } else ok++;

  // O nó `ecg` não pode mais bundlar "supra OU BRE/BRD novo" numa opção só.
  if (/supra de ST \/ BRE-BRD novo|BRE\/BRD novo \(STEMI\)/.test(arvore)) {
    falhas.push(
      `${ARVORE}: o nó \`ecg\` voltou a tratar BRE/BRD novo como equivalente automático de STEMI numa ` +
      `opção só. A diretriz 2025 rebaixa isso — precisa de nó de correlação próprio.`
    );
  } else ok++;
}

// ── I. Portão de dissecção — antes do AAS (Etapa 2, correção final
// 2026-08-25: os 3 blocos "triagem_disseccao_*" foram DELETADOS por
// redundância comprovada em auditoria — o Portão sozinho já garante a
// checagem antes de liberar AAS). ──────────────────────────────────────────
{
  if (!/portao_grupo_a/.test(arvore)) {
    falhas.push(`${ARVORE}: \`portao_grupo_a\` sumiu — AAS voltaria a ser liberado sem checagem de dissecção.`);
  } else ok++;

  // O `entry` não pode mais administrar AAS diretamente — precisa passar
  // pela triagem primeiro.
  const entryTexto = (() => {
    const arv = (() => {
      try {
        const os = require("node:os");
        const { execFileSync } = require("node:child_process");
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coron-entry-"));
        execFileSync("npx", [
          "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
          "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
          path.join(appDir, ARVORE),
        ], { cwd: appDir, stdio: "pipe" });
        return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
      } catch {
        return null;
      }
    })();
    return arv?.nodes?.entry ?? null;
  })();

  if (entryTexto) {
    // ⚠️ DOMINÂNCIA, NÃO `next` LITERAL (2026-08-25). O comentário antigo já
    // dizia "reachability", mas o código media o ponteiro direto — e o
    // ponteiro reprovou quando a Tela 1 (`entrada_paciente`) entrou entre
    // `entry` e a avaliação de estabilidade, sem que nada clínico tivesse
    // mudado de ordem. Medir o ponteiro proíbe INSERIR um passo; a promessa
    // clínica nunca foi essa.
    //
    // O que a promessa é: nenhum caminho pode alcançar o ECG sem passar antes
    // pela avaliação de estabilidade. Isso se prova removendo o nó do grafo e
    // exigindo que o alvo fique INALCANÇÁVEL — se ainda houver rota, existe um
    // desvio que pula a estabilidade, que é o defeito real.
    {
      const arvGrafo = (() => {
        const os = require("node:os");
        const { execFileSync } = require("node:child_process");
        try {
          const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cor-estab-"));
          execFileSync("npx", [
            "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
            "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
            path.join(appDir, ARVORE),
          ], { cwd: appDir, stdio: "pipe" });
          return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
        } catch { return null; }
      })();

      if (!arvGrafo) {
        falhas.push("a árvore não compilou para a prova de dominância da estabilidade — a conferência NÃO RODOU.");
      } else {
        const alcanca = (de, alvo, semNo) => {
          const vistos = new Set();
          const pilha = [de];
          while (pilha.length) {
            const id = pilha.pop();
            if (!id || id === semNo || vistos.has(id)) continue;
            vistos.add(id);
            if (id === alvo) return true;
            const no = arvGrafo.nodes[id];
            if (!no) continue;
            if (typeof no.next === "string") pilha.push(no.next);
            else if (no.next?.possiveis) pilha.push(...no.next.possiveis);
            for (const o of no.options ?? []) pilha.push(o.next);
          }
          return false;
        };

        if (!alcanca("entry", "avaliar_estabilidade")) {
          falhas.push(
            "a partir de `entry` não se alcança mais `avaliar_estabilidade` — a avaliação de " +
            "estabilidade saiu do fluxo."
          );
        } else ok++;

        if (alcanca("entry", "ecg", "avaliar_estabilidade")) {
          falhas.push(
            "existe caminho de `entry` até o ECG SEM passar por `avaliar_estabilidade`.\n" +
            "      ⚠️ A estabilização tem precedência sobre o protocolo: um desvio que pula o ABCD " +
            "leva o médico a classificar o ECG de um paciente que ainda não foi avaliado."
          );
        } else ok++;
      }
    }
    const acoes = (entryTexto.actions ?? []).join(" ");
    if (/AAS 300 mg mastig/.test(acoes)) {
      falhas.push("`entry` voltou a liberar AAS diretamente, antes da triagem de dissecção.");
    } else ok++;
  } else {
    falhas.push("não foi possível compilar `entry` para checar a ordem AAS × triagem de dissecção.");
  }
}

// ── I-bis. Estabilidade como PASSO do fluxo, não card fixo (refinamento v3) ─
{
  const arv = (() => {
    try {
      const os = require("node:os");
      const { execFileSync } = require("node:child_process");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coron-estab-"));
      execFileSync("npx", [
        "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
        "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
        path.join(appDir, ARVORE),
      ], { cwd: appDir, stdio: "pipe" });
      return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
    } catch {
      return null;
    }
  })();

  if (!arv) {
    falhas.push("a árvore das coronárias não compilou — as conferências de estabilidade NÃO RODARAM.");
  } else {
    const n = (id) => arv.nodes[id];
    function alcancaveisDe(id) {
      const vistos = new Set();
      const fila = [id];
      while (fila.length) {
        const atual = fila.pop();
        if (vistos.has(atual)) continue;
        vistos.add(atual);
        const no = n(atual);
        if (!no) continue;
        if (typeof no.next === "string") fila.push(no.next);
        else if (no.next && Array.isArray(no.next.possiveis)) fila.push(...no.next.possiveis);
        for (const o of no.options ?? []) if (o.next) fila.push(o.next);
      }
      vistos.delete(id);
      return vistos;
    }

    // ⚠️ 2026-08-24 (pós-validação física): `avaliar_estabilidade_dados`
    // (um passo só, 7 campos genéricos) virou 5 BLOCOS PRÓPRIOS — pedido
    // explícito: "evitar exibir 10 perguntas simultaneamente... agrupar em
    // poucos blocos clínicos". Cada bloco é um nó de entrada dedicado.
    const BLOCOS = ["estab_bloco1", "estab_bloco2", "estab_bloco3", "estab_bloco4", "estab_bloco5"];
    for (const id of ["avaliar_estabilidade", ...BLOCOS, "estabilizacao_ramo"]) {
      if (!n(id)) falhas.push(`\`${id}\` sumiu — a avaliação de estabilidade como passo do fluxo foi perdida.`);
      else ok++;
    }

    // Cada bloco tem no máximo 3 campos — se crescer, voltou a virar uma
    // lista comprida disfarçada de "bloco".
    for (const id of BLOCOS) {
      const bloco = n(id);
      // ⚠️ TETO DE 4 NO BLOCO 5 (2026-08-25): o quarto campo é `tempo_dor`, e
      // ele é `optional: true` — não bloqueia a tela nem conta como pergunta
      // obrigatória. Dado precoce que não vira gate (decisão do autor).
      const teto = id === "estab_bloco5" ? 4 : 3;
      if (bloco && (bloco.fields?.length ?? 0) > teto) {
        falhas.push(`\`${id}\` tem ${bloco.fields.length} campos — mais que os ${teto} esperados por bloco clínico.`);
      } else if (bloco) ok++;
    }

    // ⚠️ EARLY EXIT DEPOIS DE CADA BLOCO, NÃO SÓ DO ÚLTIMO — e desde o Bloco 2
    // (2026-08-24) o destino não é mais binário: cada ameaça vai para o
    // ramo/módulo correspondente (PCR, via aérea, respiratório, choque,
    // arritmia bradi/taqui) ou, se for do próprio assunto deste módulo (dor
    // isquêmica atual, edema pulmonar), para `estabilizacao_ramo`.
    const DESTINOS_AMEACA = [
      "coronariana_pcr_pulso_ausente", "coronariana_via_aerea_ameacada",
      "coronariana_suporte_respiratorio", "coronariana_choque",
      "coronariana_arritmia_bradi", "coronariana_arritmia_taqui", "estabilizacao_ramo",
      "coronariana_isquemia_em_curso",
    ];
    const proximoDoBloco = ["estab_bloco2", "estab_bloco3", "estab_bloco4", "estab_bloco5", "ecg"];
    for (let i = 0; i < BLOCOS.length; i++) {
      const bloco = n(BLOCOS[i]);
      const possiveis = bloco?.next?.possiveis;
      if (typeof bloco?.next === "string" || !Array.isArray(possiveis)) {
        falhas.push(
          `\`${BLOCOS[i]}\` não termina em Roteamento — voltou a ser encadeamento fixo, e o early exit pedido ` +
          `("parar assim que houver informação suficiente, não obrigar os 5 blocos") deixou de existir.`
        );
        continue;
      }
      ok++;
      for (const destino of [proximoDoBloco[i], ...DESTINOS_AMEACA]) {
        if (!possiveis.includes(destino)) {
          falhas.push(`\`${BLOCOS[i]}\`: o Roteamento não declara \`${destino}\` como possível.`);
        } else ok++;
      }
    }

    // ⚠️ COMPORTAMENTO REAL DO EARLY EXIT — chamando `escolher()` de verdade
    // com valores simulados, não só a estrutura. Prova o contrato do autor:
    // só achado `suficiente_para_instabilidade` interrompe SOZINHO; ritmo
    // irregular/perfusão/pulso filiforme isolados NÃO interrompem; e cada
    // ameaça vai para o módulo/ramo certo (Bloco 2).
    const escolherDoBloco = (id, values) => {
      const bloco = n(id);
      if (typeof bloco?.next === "string" || typeof bloco?.next?.escolher !== "function") return undefined;
      return bloco.next.escolher(values);
    };
    const CENARIOS = [
      ["bloco1 sem nenhum achado → segue para bloco2 (não obriga early exit sem dado)",
        "estab_bloco1", {}, "estab_bloco2"],
      ["consciência aguda (bloco1) → via aérea (risco de perda de proteção), não os 4 blocos restantes",
        "estab_bloco1", { cor_consciencia: "sim" }, "coronariana_via_aerea_ameacada"],
      // ⚠️ A PERGUNTA DO BLOCO 4 MUDOU EM 2026-08-25, e com ela o que estes
      // cenários medem. Antes era "ritmo irregular?" — e irregular NÃO é
      // arritmia: taquicardia sinusal é regular, TV monomórfica é regular,
      // BAV total é regular, FA crônica estável é irregular sem ser ameaça.
      // Agora o campo é `cor_ritmo` (sinusal / arritmia / não avaliei), que é
      // o achado que de fato decide o roteamento para bradi/taqui.
      ["arritmia ISOLADA (bloco4) NÃO dispara sozinha",
        "estab_bloco4", { cor_ritmo: "arritmia" }, "estab_bloco5"],
      ["arritmia + perfusão alterada, FC não extrema (achado composto) → choque",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "arritmia" }, "coronariana_choque"],
      ["arritmia + perfusão alterada + FC < 50 → arritmia bradicardia",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "arritmia", fc: "40" }, "coronariana_arritmia_bradi"],
      ["arritmia + perfusão alterada + FC >= 150 → arritmia taquicardia",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "arritmia", fc: "160" }, "coronariana_arritmia_taqui"],
      // ⚠️ REGULARIDADE NÃO É PRÉ-REQUISITO — e agora isso se testa pelo que
      // importa: BAV total e TV monomórfica são REGULARES, mas são ARRITMIAS,
      // e é o campo `cor_ritmo` que os identifica.
      ["BAVT (regular, mas ARRITMIA) + perfusão alterada + FC 40 → arritmia bradicardia",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "arritmia", fc: "40" }, "coronariana_arritmia_bradi"],
      ["TV monomórfica (regular, mas ARRITMIA) + perfusão + FC 160 → arritmia taquicardia",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "arritmia", fc: "160" }, "coronariana_arritmia_taqui"],
      // ⚠️ E O CASO QUE O AUTOR ENCONTROU NO CELULAR: ritmo SINUSAL nunca é
      // arritmia instável, por mais extrema que seja a frequência — a
      // taquicardia sinusal a 165 com hipotensão é RESPOSTA, e cardiovertê-la
      // é dano direto.
      // ⚠️ E NÃO É CHOQUE TAMPOUCO (segunda correção, 2026-08-25): a primeira
      // versão mandava a faixa do meio para o ramo de choque, e o autor testou
      // com PAS 140 — "choque" com pressão de 140 é contradição. Sem
      // hipotensão, sem pulso filiforme e sem arritmia, o caso simplesmente
      // SEGUE a via de SCA (bloco 5).
      ["FC 165 SINUSAL + perfusão alterada, PAS normal → segue o fluxo",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "sinusal", fc: "165", pas: "140" }, "estab_bloco5"],
      ["FC 100 SINUSAL + perfusão alterada, PAS normal → segue o fluxo",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "sinusal", fc: "100", pas: "140" }, "estab_bloco5"],
      ["FC 165 + perfusão, ritmo NÃO AVALIADO, PAS normal → a dúvida não classifica",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "nao_avaliado", fc: "165", pas: "140" }, "estab_bloco5"],
      ["FC 165 SINUSAL + PAS 78 → choque (hipotensão real)",
        "estab_bloco4", { cor_perfusao: "sim", cor_ritmo: "sinusal", fc: "165", pas: "78" }, "coronariana_choque"],
      ["perfusão alterada ISOLADA (bloco3) NÃO dispara sozinha",
        "estab_bloco3", { cor_perfusao: "sim" }, "estab_bloco4"],
      ["PAS < 90 (bloco3) continua suficiente sozinha → choque",
        "estab_bloco3", { pas: "80" }, "coronariana_choque"],
      ["pulso filiforme ISOLADO (bloco5) NÃO dispara sozinho",
        "estab_bloco5", { cor_pulso_alterado: "filiforme" }, "ecg"],
      ["pulso filiforme + perfusão alterada (achado composto) → choque",
        "estab_bloco5", { cor_perfusao: "sim", cor_pulso_alterado: "filiforme" }, "coronariana_choque"],
      ["pulso central AUSENTE vai para PCR, não para estabilização genérica",
        "estab_bloco5", { cor_pulso_alterado: "ausente" }, "coronariana_pcr_pulso_ausente"],
      ["dor isquêmica atual (bloco5) NÃO é instabilidade — vai para o ramo próprio que ACELERA a via, não 'estabiliza'",
        "estab_bloco5", { cor_dor_isquemica_atual: "sim" }, "coronariana_isquemia_em_curso"],
      ["nada encontrado em nenhum bloco (bloco5) → deriva estável",
        "estab_bloco5", {}, "ecg"],
    ];
    for (const [nome, id, values, esperado] of CENARIOS) {
      const destino = escolherDoBloco(id, values);
      if (destino !== esperado) {
        falhas.push(
          `cenário "${nome}": \`${id}\`.next.escolher(${JSON.stringify(values)}) devolveu "${destino}", ` +
          `esperava "${esperado}". ⚠️ O contrato de classificação (suficiente/alerta-dependente-de-contexto/` +
          `não-instabilidade), aprovado pelo autor, está sendo violado.`
        );
      } else ok++;
    }

    // Os 6 nós de transição de ameaça (Bloco 2) precisam existir, ser
    // transição e apontar para o módulo certo — mesmo padrão já usado em
    // `bradi_sem_pulso` (acls-bradycardia-tree.ts) e `ira-decision-tree.ts`.
    const TRANSICOES_AMEACA = [
      ["coronariana_pcr_pulso_ausente", "pcr-adulto"],
      ["coronariana_via_aerea_ameacada", "isr-rapida"],
      ["coronariana_suporte_respiratorio", "insuficiencia-respiratoria"],
      ["coronariana_choque", "choque"],
      ["coronariana_arritmia_bradi", "bradicardia-acls"],
      ["coronariana_arritmia_taqui", "taquicardia-acls"],
    ];
    for (const [id, moduleId] of TRANSICOES_AMEACA) {
      const no = n(id);
      if (!no || no.type !== "transition") {
        falhas.push(`\`${id}\` sumiu ou deixou de ser nó de transição.`);
        continue;
      }
      ok++;
      if (!(no.targets ?? []).some((t) => t.moduleId === moduleId)) {
        falhas.push(`\`${id}\` não aponta para o módulo \`${moduleId}\`.`);
      } else ok++;
    }

    // ⚠️ A TELA DE ESTABILIZAÇÃO PRECISA NOMEAR A AMEAÇA (pedido explícito,
    // 2026-08-24: "o resultado deve indicar a ameaça encontrada" — SpO₂ baixa
    // não pode aparecer rotulada genericamente como "instabilidade
    // hemodinâmica").
    const ramo = n("estabilizacao_ramo");
    if (!/\{ameacaEncontrada\}/.test(ramo?.summary ?? "")) {
      falhas.push("`estabilizacao_ramo` não usa o token {ameacaEncontrada} — a tela voltaria a não dizer qual ameaça foi encontrada.");
    } else ok++;

    // ⚠️ `estabilizacao_ramo` NÃO PODE MAIS mencionar dor isquêmica — essa
    // ameaça tem ramo próprio (`coronariana_isquemia_em_curso`) desde a
    // correção 2026-08-24: dor isquêmica atual, sozinha, não é instabilidade.
    if (/dor isqu[eê]mica/i.test((ramo?.actions ?? []).join(" "))) {
      falhas.push("`estabilizacao_ramo` ainda menciona dor isquêmica nas ações — esse achado não é mais tratado como instabilidade neste nó.");
    } else ok++;

    // ⚠️ NOVO RAMO (correção 2026-08-24): isquemia em curso não é
    // "estabilizar antes de seguir" — é acelerar a via coronariana. Ação em
    // PRESENTE ("iniciar"), nunca "reavaliar/otimizar" (pressuporia terapia
    // já em curso, que não existe neste ponto do fluxo).
    const isquemiaEmCurso = n("coronariana_isquemia_em_curso");
    if (!isquemiaEmCurso || isquemiaEmCurso.type !== "action") {
      falhas.push("`coronariana_isquemia_em_curso` sumiu ou deixou de ser nó de ação.");
    } else {
      ok++;
      const textoAcoes = (isquemiaEmCurso.actions ?? []).join(" ");
      if (/reavaliar\/otimizar|reavaliar e otimizar/i.test(textoAcoes)) {
        falhas.push("`coronariana_isquemia_em_curso` usa linguagem que pressupõe tratamento prévio ('reavaliar/otimizar') — proibido pela regra de não-pressuposição.");
      } else ok++;
      if (isquemiaEmCurso.next !== "ecg") {
        falhas.push(`\`coronariana_isquemia_em_curso\`.next é \`${isquemiaEmCurso.next}\`, esperava \`ecg\` — o ECG não pode ficar atrás do portão de dissecção.`);
      } else ok++;
    }

    // De `entry`, os caminhos (instável direto/estável direto/blocos)
    // precisam alcançar `disseccao_investigacao`, `estabilizacao_ramo` e
    // todos os 6 ramos de transição — nenhum pode ficar sem saída.
    if (n("entry")) {
      const alcance = alcancaveisDe("entry");
      if (!alcance.has("disseccao_investigacao")) {
        falhas.push("`entry` deixou de alcançar `disseccao_investigacao` — algum caminho de estabilidade ficou sem saída.");
      } else ok++;
      if (!alcance.has("estabilizacao_ramo")) {
        falhas.push("`entry` não alcança `estabilizacao_ramo` — o ramo de instabilidade ficou inatingível.");
      } else ok++;
      if (!alcance.has("coronariana_isquemia_em_curso")) {
        falhas.push("`entry` não alcança `coronariana_isquemia_em_curso` — o ramo de isquemia em curso ficou inatingível.");
      } else ok++;
      if (!alcance.has("estab_bloco1")) {
        falhas.push("`entry` não alcança `estab_bloco1` — o caminho padrão (achados observáveis) ficou inatingível.");
      } else ok++;
      for (const [id] of TRANSICOES_AMEACA) {
        if (!alcance.has(id)) {
          falhas.push(`\`entry\` não alcança \`${id}\` — esse ramo de ameaça ficou inatingível.`);
        } else ok++;
      }
      if (!alcance.has("portao_grupo_a")) {
        falhas.push("`entry` não alcança `portao_grupo_a` — o portão de entrada da dissecção ficou inatingível.");
      } else ok++;
    }

    // ── PORTÃO DE ENTRADA DA DISSECÇÃO — trava de exceção (correção final
    // 2026-08-25). Grupo A abre sozinho; Grupo B precisa de ≥2 domínios;
    // "não sei" nunca conta como positivo; nenhuma tela sem saída real.
    {
      for (const id of ["portao_grupo_a", "portao_ajuda_grupo_a", "portao_grupo_b", "portao_ajuda_grupo_b"]) {
        if (!n(id)) falhas.push(`\`${id}\` sumiu — o portão de entrada da dissecção foi perdido.`);
        else ok++;
      }

      // O aviso "não é escore validado" precisa aparecer no primeiro nó.
      const portaoA = n("portao_grupo_a");
      if (!/não substitui ADD-RS/i.test(portaoA?.intro ?? "")) {
        falhas.push("`portao_grupo_a` não avisa que não é escore validado nem substitui ADD-RS/avaliação formal.");
      } else ok++;

      // Nenhum antecedente/predisposição no Grupo A — ADD-RS trata condição
      // predisponente como domínio de risco, não indicação isolada.
      const camposGrupoA = (portaoA?.fields ?? []).map((f) => f.id);
      if (camposGrupoA.some((id) => /predispo/i.test(id))) {
        falhas.push("`portao_grupo_a` inclui um campo de predisposição — isso deveria estar só no Grupo B (não abre sozinho).");
      } else ok++;
      if (camposGrupoA.length !== 3) {
        falhas.push(`\`portao_grupo_a\` tem ${camposGrupoA.length} campos, esperava exatamente 3.`);
      } else ok++;

      const portaoB = n("portao_grupo_b");
      const camposGrupoB = (portaoB?.fields ?? []).map((f) => f.id);
      if (camposGrupoB.length !== 3) {
        falhas.push(`\`portao_grupo_b\` tem ${camposGrupoB.length} campos, esperava exatamente 3.`);
      } else ok++;

      // ⚠️ COMPORTAMENTO REAL — Grupo A: qualquer "sim" abre sozinho; "não
      // sei" sem "sim" pede ajuda; tudo "não" segue para o Grupo B.
      const escolherA = (values) => {
        const no = n("portao_grupo_a");
        return typeof no?.next?.escolher === "function" ? no.next.escolher(values) : undefined;
      };
      const CENARIOS_PORTAO_A = [
        ["nada marcado → segue para Grupo B", {}, "portao_grupo_b"],
        ["déficit de pulso/PA sozinho → abre direto", { portaoA_pulso_pa: "sim" }, "disseccao_investigacao"],
        ["déficit neurológico focal sozinho → abre direto", { portaoA_neuro_focal: "sim" }, "disseccao_investigacao"],
        ["sopro de IAo sozinho → abre direto", { portaoA_sopro_iao: "sim" }, "disseccao_investigacao"],
        ["um item 'não sei', nenhum 'sim' → pede ajuda, NÃO abre direto", { portaoA_pulso_pa: "nao_sei" }, "portao_ajuda_grupo_a"],
        ["'não sei' nunca abre sozinho, mesmo com outro 'não'", { portaoA_pulso_pa: "nao_sei", portaoA_neuro_focal: "nao" }, "portao_ajuda_grupo_a"],
      ];
      for (const [nome, values, esperado] of CENARIOS_PORTAO_A) {
        const destino = escolherA(values);
        if (destino !== esperado) {
          falhas.push(`cenário portão A "${nome}": escolher(${JSON.stringify(values)}) devolveu "${destino}", esperava "${esperado}".`);
        } else ok++;
      }

      // ⚠️ ALCANCE, NÃO PONTEIRO (2026-08-25). Estas conferências mediam o
      // destino LITERAL `aas_liberado` e reprovaram quando a Tela 2c entrou
      // com `aas_check` (as duas perguntas que substituíram a ressalva "salvo
      // alergia/sangramento") entre o portão e o AAS — sem que nada clínico
      // tivesse mudado. A promessa nunca foi o ponteiro: é que a via do AAS
      // seja alcançada, e que a investigação de dissecção NÃO seja.
      const alcanca = (de, alvo) => {
        const vistos = new Set();
        const pilha = [de];
        while (pilha.length) {
          const id = pilha.pop();
          if (!id || vistos.has(id)) continue;
          vistos.add(id);
          if (id === alvo) return true;
          const no = n(id);
          if (!no) continue;
          if (no.type === "decision") (no.options ?? []).forEach((o) => pilha.push(o.next));
          else if (typeof no.next === "string") pilha.push(no.next);
          else if (no.next?.possiveis) pilha.push(...no.next.possiveis);
        }
        return false;
      };
      /** O destino satisfaz a promessa "vai para o AAS, e não para a investigação"? */
      const vaiParaOAas = (destino) =>
        destino !== "disseccao_investigacao" && alcanca(destino, "aas_liberado");

      // ⚠️ COMPORTAMENTO REAL — Grupo B: 1 domínio "sim" isolado NÃO abre
      // (o caso central que esta correção existe para matar); só ≥2 abrem.
      const escolherB = (values) => {
        const no = n("portao_grupo_b");
        return typeof no?.next?.escolher === "function" ? no.next.escolher(values) : undefined;
      };
      const CENARIOS_PORTAO_B = [
        ["nada marcado → não abre, AAS liberado", {}, "aas_liberado"],
        ["só dor abrupta/rasgando (B1) ISOLADA → NÃO abre", { portaoB1_dor_abrupta: "sim" }, "aas_liberado"],
        ["só choque inexplicado (B2) ISOLADO → NÃO abre", { portaoB2_choque: "sim" }, "aas_liberado"],
        ["só predisposição (B3) ISOLADA → NÃO abre", { portaoB3_predisposicao: "sim" }, "aas_liberado"],
        ["B1 + B2 (2 domínios independentes) → abre", { portaoB1_dor_abrupta: "sim", portaoB2_choque: "sim" }, "disseccao_investigacao"],
        ["B1 + B3 (2 domínios independentes) → abre", { portaoB1_dor_abrupta: "sim", portaoB3_predisposicao: "sim" }, "disseccao_investigacao"],
        ["1 'sim' + 1 'não sei' (pode chegar a 2) → pede ajuda", { portaoB1_dor_abrupta: "sim", portaoB2_choque: "nao_sei" }, "portao_ajuda_grupo_b"],
        ["1 'não sei' isolado, sem chance de chegar a 2 → NÃO abre sem perguntar mais", { portaoB1_dor_abrupta: "nao_sei" }, "aas_liberado"],
      ];
      for (const [nome, values, esperado] of CENARIOS_PORTAO_B) {
        const destino = escolherB(values);
        const ok_ = esperado === "aas_liberado" ? vaiParaOAas(destino) : destino === esperado;
        if (!ok_) {
          falhas.push(
            `cenário portão B "${nome}": escolher(${JSON.stringify(values)}) devolveu "${destino}", ` +
            (esperado === "aas_liberado"
              ? "e daí NÃO se alcança `aas_liberado` sem passar pela investigação de dissecção."
              : `esperava "${esperado}".`)
          );
        } else ok++;
      }

      // As telas de ajuda precisam ter as 3 saídas reais (nenhuma para "Sim"
      // vira "afastado" sem querer, e "incerto" nunca abre sozinho).
      for (const [id, destinoAbre, destinoNao] of [
        ["portao_ajuda_grupo_a", "disseccao_investigacao", "portao_grupo_b"],
        ["portao_ajuda_grupo_b", "disseccao_investigacao", "aas_liberado"],  // "não" alcança o AAS
      ]) {
        const no = n(id);
        if (!no || no.type !== "decision") {
          falhas.push(`\`${id}\` sumiu ou deixou de ser decisão.`);
          continue;
        }
        ok++;
        const opts = no.options ?? [];
        if (opts.length !== 3) {
          falhas.push(`\`${id}\` tem ${opts.length} opções, esperava exatamente 3.`);
        } else ok++;
        const confirma = opts.find((o) => o.next === destinoAbre);
        const incerto = opts.find((o) => o.grava?.valor === "desconhecido");
        if (!confirma) falhas.push(`\`${id}\`: nenhuma opção leva a \`${destinoAbre}\` — a confirmação positiva sumiu.`);
        else ok++;
        if (!incerto) falhas.push(`\`${id}\`: nenhuma opção grava "desconhecido" — "não sei" persistente virou outra coisa.`);
        // ⚠️ A PROMESSA É "A DÚVIDA NÃO ABRE A INVESTIGAÇÃO SOZINHA", e é isso
        // que se mede: o destino não pode ser a investigação, e tem de alcançar
        // o alvo. Medir o ponteiro literal reprovaria a Tela 2c, que inseriu
        // `aas_check` no caminho sem mudar conduta nenhuma.
        else if (incerto.next === destinoAbre || !alcanca(incerto.next, destinoNao)) {
          falhas.push(
            `\`${id}\`: a opção "desconhecido" leva a \`${incerto.next}\`, e daí não se alcança ` +
            `\`${destinoNao}\` — dúvida persistente não pode abrir a investigação sozinha.`
          );
        } else ok++;
      }
    }

    // Alcançabilidade estática — segue `next` fixo, `possiveis` do roteamento
    // derivado e as opções de decisão. Definida aqui porque é a medida certa
    // para "o caminho existe?", que é a pergunta de várias travas abaixo.
    const alcancaDe = (de) => {
      const vistos = new Set(); const pilha = [de];
      while (pilha.length) {
        const x = pilha.pop();
        if (!x || vistos.has(x)) continue;
        vistos.add(x);
        const nn = arv.nodes[x];
        if (!nn) continue;
        if (nn.type === "decision") (nn.options ?? []).forEach((o) => pilha.push(o.next));
        else if (nn.next) {
          if (typeof nn.next === "string") pilha.push(nn.next);
          else (nn.next.possiveis ?? []).forEach((d) => pilha.push(d));
        }
      }
      return vistos;
    };

    // ── ORDEM OPERACIONAL (reorganização de 2026-08-25) ────────────────────
    // As quatro regras que esta rodada existiu para garantir. Cada uma nasceu
    // de um defeito MEDIDO na auditoria, não de preferência de layout.
    {
      // 1. O ECG não pode ficar atrás do portão de dissecção.
      const portaoA = n("portao_grupo_a");
      const alcanceDoPortao = portaoA ? alcancaveisDe("portao_grupo_a") : new Set();
      if (alcanceDoPortao.has("ecg")) {
        falhas.push("`portao_grupo_a` alcança `ecg` — o portão voltou a ficar ANTES da interpretação do ECG. Ele bloqueia o antitrombótico, não o traçado.");
      } else ok++;

      // 2. "Não sei" no ECG ≠ "não": destinos distintos, ajuda real.
      const ecgNo = n("ecg");
      const oNaoSei = (ecgNo?.options ?? []).find((o) => o.id === "nao_sei");
      const oNao = (ecgNo?.options ?? []).find((o) => o.id === "nao");
      if (!oNaoSei || !oNao || oNaoSei.next === oNao.next) {
        falhas.push("`ecg`: \"não sei\" voltou a ter o mesmo destino de \"não\" — são estados clínicos diferentes e o segundo pede ajuda real.");
      } else ok++;
      const ajudaEcg = n("ecg_ajuda_supra");
      if (!ajudaEcg || ajudaEcg.type !== "decision" || (ajudaEcg.evidence ?? []).length < 3) {
        falhas.push("`ecg_ajuda_supra` sumiu ou deixou de trazer critérios objetivos — \"não sei\" viraria rota alternativa sem ajuda.");
      } else ok++;

      // 3. A decisão de reperfusão vem ANTES do peso e das 22 ações.
      const locNext = n("stemi_localizacao")?.next;
      const locPossiveis = typeof locNext === "string" ? [locNext] : (locNext?.possiveis ?? []);
      // ⚠️ ALCANCE, NÃO ARESTA LITERAL (2026-08-25): entre a localização e a
      // decisão de reperfusão passaram a existir os nós de tempo/cenário
      // logístico — todos condicionais e todos ANTES de qualquer dose. O que
      // a trava protege é que peso/medicação não voltem para essa frente.
      if (!alcancaDe("stemi_localizacao").has("stemi_reperfusao")) {
        falhas.push("`stemi_localizacao` não alcança `stemi_reperfusao` — a decisão de reperfusão saiu do caminho.");
      } else ok++;
      if (locPossiveis.includes("stemi_dados") || locPossiveis.includes("stemi_meds")) {
        falhas.push("`stemi_localizacao` vai a peso/medicação antes de decidir a reperfusão — a fila de telas volta a ensinar que a sala espera as doses.");
      } else ok++;
      // ⚠️ COMPORTAMENTO, NÃO SÓ `possiveis` (R-87) — declarar o destino certo
      // e escolher outro passaria batido se a trava só lesse a lista.
      const escolherLoc = typeof locNext === "object" ? locNext.escolher : null;
      if (typeof escolherLoc !== "function") {
        falhas.push("`stemi_localizacao` não roteia por função — o desvio condicional do tempo sumiu.");
      } else {
        const CEN_LOC = [
          ["com tempo confiável → vai ao cenário logístico, sem dose no meio", { tempo_dor: "< 1 h" }, "stemi_cenario_icp"],
          ["sem tempo → pede o tempo primeiro", {}, "tempo"],
          ["tempo indefinido → resolve a confiabilidade antes de tudo", { tempo_dor: "intermitente / indefinido" }, "stemi_tempo_confiavel"],
        ];
        for (const [nome, values, esperado] of CEN_LOC) {
          const d = escolherLoc(values);
          if (d !== esperado) {
            falhas.push(`cenário reperfusão "${nome}": \`stemi_localizacao\`.next.escolher(${JSON.stringify(values)}) devolveu "${d}", esperava "${esperado}".`);
          } else ok++;
        }
      }

      // 4. NSTE: muito alto risco é reconhecido ANTES das 24 ações.
      const tropPositivo = (n("nste_trop")?.options ?? []).find((o) => o.id === "positivo");
      if (tropPositivo?.next !== "nste_risco_criterios") {
        falhas.push(`\`nste_trop\` positivo vai a \`${tropPositivo?.next}\`, esperava \`nste_risco_criterios\` — o timing da invasiva é decisão precoce, não vem depois de 24 ações.`);
      } else ok++;

      // 5. Wellens volta a passar pela troponina, e a troponina negativa NÃO
      //    pode rebaixar quem já teve padrão de oclusão reconhecido.
      if (n("wellens_conduta")?.next !== "nste_trop") {
        falhas.push("`wellens_conduta` não passa por `nste_trop` — a troponina/seriação voltou a ser pulada no Wellens.");
      } else ok++;
      const negativo = (n("nste_trop")?.options ?? []).find((o) => o.id === "negativo");
      if (typeof negativo?.showIf !== "function") {
        falhas.push("a saída de baixo risco de `nste_trop` não tem guarda — troponina negativa poderia rebaixar um padrão de alto risco já reconhecido.");
      } else {
        ok++;
        if (negativo.showIf({ padrao_alto_risco: "sim" })) {
          falhas.push("a guarda de `nste_trop` não esconde a saída de baixo risco com `padrao_alto_risco` ativo — Wellens sairia para observação/alta.");
        } else ok++;
        if (!negativo.showIf({})) {
          falhas.push("a guarda de `nste_trop` esconde a saída de baixo risco mesmo sem padrão de alto risco — bloquearia o caminho legítimo.");
        } else ok++;
      }
      for (const wid of ["wellens_a", "wellens_b"]) {
        const o = (n("ecg_padroes_wellens")?.options ?? []).find((x) => x.id === wid);
        if (o?.grava?.campo !== "padrao_alto_risco") {
          falhas.push(`\`ecg_padroes_wellens\`: a opção "${wid}" não grava \`padrao_alto_risco\` — a proteção contra rebaixamento depende dessa marca.`);
        } else ok++;
      }

      // 6. `tempo` deixou de ser gate do ECG e virou condicional.
      if (alcanceDoPortao.has("tempo") === false && n("tempo")) ok++;
      const tempoNode = n("tempo");
      if (!tempoNode) falhas.push("`tempo` sumiu — o dado ainda é necessário antes da estratégia de reperfusão.");
      else if (!alcancaDe("tempo").has("stemi_reperfusao")) {
        falhas.push("`tempo` não alcança `stemi_reperfusao` — ele só existe para destravar a decisão de reperfusão.");
      } else ok++;
      const campoTempo = (n("estab_bloco5")?.fields ?? []).find((f) => f.id === "tempo_dor");
      if (!campoTempo) {
        falhas.push("`estab_bloco5` não coleta `tempo_dor` — o dado deixaria de ser obtido precocemente.");
      } else if (campoTempo.optional !== true) {
        falhas.push("`tempo_dor` no `estab_bloco5` não é `optional` — dado importante virou tela bloqueante, que é o defeito que esta rodada corrigiu.");
      } else ok++;

      // 7. Ações paralelas existem e não viraram nós.
      const comParalelo = Object.values(arv.nodes).filter((x) => (x.emParalelo ?? []).length);
      if (!comParalelo.length) {
        falhas.push("nenhum nó declara `emParalelo` — o que corre junto voltou a ser fila de telas.");
      } else ok++;
      for (const x of comParalelo) {
        for (const a of x.emParalelo) {
          if (!a.label || typeof a.label !== "string") {
            falhas.push(`\`${x.id}\`: ação paralela sem \`label\` — o usuário não veria o que corre junto.`);
          } else ok++;
        }
      }
      if (!(n("stemi_icp")?.emParalelo ?? []).length) {
        falhas.push("`stemi_icp` não declara `emParalelo` — peso/antitrombóticos voltariam a parecer pré-requisito da hemodinâmica.");
      } else ok++;
    }

    // ══ PROPRIEDADE GLOBAL DA FIBRINÓLISE ═════════════════════════════════
    //
    // ⚠️ A TRAVA MAIS IMPORTANTE DO MÓDULO (exigência do autor, 2026-08-25).
    //
    // Aqui uma falha de roteamento não é defeito de interface: liberar
    // fibrinólise para quem tem início indeterminado, apresentação tardia ou
    // contraindicação não resolvida é conduta potencialmente catastrófica.
    // Por isso esta trava NÃO testa casos selecionados — ela ENUMERA todos
    // os caminhos do grafo capazes de alcançar `stemi_fibrinolise` e cobra,
    // de cada um, que passe pelos gates obrigatórios.
    //
    // ⚠️ POR QUE ENUMERAR, E NÃO SÓ TESTAR CENÁRIOS: a alcançabilidade deste
    // app é ESTÁTICA (segue `possiveis`, não `escolher`). Já aconteceu duas
    // vezes nesta auditoria de um `possiveis` compartilhado abrir um caminho
    // clinicamente proibido que nenhum cenário escolhido teria encontrado —
    // foi assim que o Grupo B passou a alcançar a fibrinólise. Enumerar é a
    // única medida que pega a aresta que ninguém pensou em testar.
    {
      const ALVO = "stemi_fibrinolise";
      // Os gates que TODO caminho até a administração precisa atravessar.
      const GATES = {
        stemi_via_sem_icp: "a ICP precisa ter sido descartada dentro da meta (o funil da janela)",
        stemi_dados_fibrino: "o peso precisa ter sido coletado (dose de tenecteplase)",
      };
      // Pelo menos um destes precisa aparecer: são as três únicas portas que
      // resolvem as contraindicações.
      const PORTAS_CI = ["stemi_fibrino_confirma", "stemi_fibrino_ajuda", "stemi_fibrino_relativa"];

      const ENTRADAS = ["entry", "atalhos_coronarianas", "avaliar_estabilidade"];
      const arestas = (id, excluir = new Set()) => {
        const nn = arv.nodes[id];
        if (!nn) return [];
        let saidas;
        if (nn.type === "decision") saidas = (nn.options ?? []).map((o) => o.next);
        else if (nn.type === "transition" || !nn.next) saidas = [];
        else saidas = typeof nn.next === "string" ? [nn.next] : (nn.next.possiveis ?? []);
        return saidas.filter((x) => !excluir.has(x));
      };

      // ⚠️ DOMINADORES, NÃO ENUMERAÇÃO (2026-08-25). A primeira versão desta
      // trava enumerava caminhos simples e ESTOUROU um teto de 4000 — e teto
      // silencioso é exatamente o defeito que este projeto combate: teria
      // dito "todos os caminhos conferidos" tendo conferido uma fração.
      //
      // A pergunta certa não é "quais são os caminhos?" e sim "existe ALGUM
      // caminho que contorne este gate?". Isso se responde exatamente, e sem
      // teto: remove-se o gate do grafo e vê-se se o alvo continua
      // alcançável. Se continuar, o gate não é obrigatório — e a trava tem o
      // contraexemplo.
      const alcancaSem = (excluir) => {
        const vistos = new Set();
        const pilha = [...ENTRADAS];
        while (pilha.length) {
          const x = pilha.pop();
          if (!x || vistos.has(x) || excluir.has(x)) continue;
          vistos.add(x);
          for (const p of arestas(x, excluir)) pilha.push(p);
        }
        return vistos.has(ALVO);
      };

      // Sanidade: o alvo tem de ser alcançável com o grafo inteiro.
      if (!alcancaSem(new Set())) {
        falhas.push("nenhum caminho alcança `stemi_fibrinolise` — a fibrinólise ficou inatingível, o que também é defeito.");
      } else ok++;

      // Cada gate é obrigatório: sem ele, o alvo tem de ficar inalcançável.
      for (const [gate, porque] of Object.entries(GATES)) {
        if (alcancaSem(new Set([gate]))) {
          falhas.push(
            `EXISTE CAMINHO até \`${ALVO}\` que contorna \`${gate}\` — ${porque}.\n` +
            `      ⚠️ Este é o defeito de classe mais grave do módulo: um estado clínico inadequado ` +
            `alcançaria a administração do fibrinolítico.`
          );
        } else ok++;
      }

      // As três portas de contraindicação, juntas, também são obrigatórias:
      // removendo todas, o alvo tem de sumir.
      if (alcancaSem(new Set(PORTAS_CI))) {
        falhas.push(
          `EXISTE CAMINHO até \`${ALVO}\` sem passar por nenhuma das portas de contraindicação ` +
          `(${PORTAS_CI.join("/")}) — a fibrinólise seria alcançável com contraindicação não resolvida.`
        );
      } else ok++;

      // E os padrões sem supra não podem alcançar o alvo por caminho nenhum.
      for (const proibido of ["ecg_grupoB_oclusao", "ecg_avr_conduta", "wellens_conduta", "ecg_padroes_wellens"]) {
        const vistos = new Set(); const pilha = [proibido];
        let achou = false;
        while (pilha.length && !achou) {
          const x = pilha.pop();
          if (!x || vistos.has(x)) continue;
          vistos.add(x);
          if (x === ALVO) { achou = true; break; }
          for (const q of arestas(x)) pilha.push(q);
        }
        if (achou) falhas.push(`\`${proibido}\` alcança \`${ALVO}\` — padrão sem supra não tem via de fibrinólise.`);
        else ok++;
      }

      // Antecessores diretos do alvo — nomeados, para que qualquer aresta
      // nova precise ser declarada aqui antes de existir.
      const antecessores = Object.keys(arv.nodes).filter((id) => arestas(id).includes(ALVO));
      const ESPERADOS = ["stemi_dados_fibrino"];
      if (antecessores.sort().join(",") !== ESPERADOS.sort().join(",")) {
        falhas.push(
          `antecessores de \`${ALVO}\` mudaram: [${antecessores.join(", ")}], esperava [${ESPERADOS.join(", ")}].\n` +
          `      ⚠️ Toda aresta nova para a administração do fibrinolítico precisa ser declarada e revisada aqui.`
        );
      } else ok++;
      console.log(`   \`${ALVO}\`: antecessor único (${antecessores.join(", ")}) · gates obrigatórios provados por dominância: ${Object.keys(GATES).join(", ")}, contraindicação resolvida.`);

      // ⚠️ COMPORTAMENTO do funil: só `<12h` chega ao check de contraindicação.
      const funil = n("stemi_via_sem_icp");
      const escolherFunil = typeof funil?.next === "object" ? funil.next.escolher : null;
      if (typeof escolherFunil !== "function") {
        falhas.push("`stemi_via_sem_icp` não roteia por função — o funil da janela sumiu.");
      } else {
        const CEN_FUNIL = [
          ["< 12 h → única janela que abre o check de contraindicação", { tempo_dor: "3–6 h" }, "stemi_fibrino_check"],
          ["12–24 h → transferência, nunca fibrinólise", { tempo_dor: "12–24 h" }, "stemi_12_24"],
          ["> 24 h → pergunta isquemia/instabilidade antes", { tempo_dor: "> 24 h" }, "stemi_tardio_isquemia"],
          ["indefinido sem confirmação → indeterminado, sem fibrinólise", { tempo_dor: "intermitente / indefinido" }, "stemi_tempo_indeterminado"],
          ["indefinido com confiabilidade mas SEM janela confirmada → ainda indeterminado", { tempo_dor: "intermitente / indefinido", tempo_confiavel: "sim" }, "stemi_tempo_indeterminado"],
          ["indefinido reclassificado para < 12 h → abre o check", { tempo_dor: "intermitente / indefinido", tempo_confiavel: "sim", tempo_confirmado: "1–3 h" }, "stemi_fibrino_check"],
          ["indefinido reclassificado para > 24 h → ramo tardio", { tempo_dor: "intermitente / indefinido", tempo_confiavel: "sim", tempo_confirmado: "> 24 h" }, "stemi_tardio_isquemia"],
          ["sem tempo nenhum → indeterminado", {}, "stemi_tempo_indeterminado"],
        ];
        for (const [nome, values, esperado] of CEN_FUNIL) {
          const d = escolherFunil(values);
          if (d !== esperado) {
            falhas.push(`cenário funil "${nome}": escolher(${JSON.stringify(values)}) devolveu "${d}", esperava "${esperado}".`);
          } else ok++;
        }
      }

      // ⚠️ COMPORTAMENTO da ajuda de contraindicação: dúvida nunca libera.
      const ajudaCi = n("stemi_fibrino_ajuda");
      const escolherCi = typeof ajudaCi?.next === "object" ? ajudaCi.next.escolher : null;
      if (typeof escolherCi !== "function") {
        falhas.push("`stemi_fibrino_ajuda` não roteia por função — a dúvida voltaria a não ser recalculada.");
      } else {
        const CEN_CI = [
          ["nenhuma contraindicação → libera", { ciAbsolutas: "nao", ciRelativas: "nao" }, "stemi_dados_fibrino"],
          ["absoluta → transferência", { ciAbsolutas: "sim", ciRelativas: "nao" }, "stemi_transfer"],
          ["relativa → decisão médica explícita", { ciAbsolutas: "nao", ciRelativas: "sim" }, "stemi_fibrino_relativa"],
          ["NÃO SEI nas absolutas → transferência, JAMAIS fibrinólise", { ciAbsolutas: "nao_sei", ciRelativas: "nao" }, "stemi_transfer"],
          ["NÃO SEI nas relativas → transferência, JAMAIS fibrinólise", { ciAbsolutas: "nao", ciRelativas: "nao_sei" }, "stemi_transfer"],
          ["nada respondido → transferência", {}, "stemi_transfer"],
        ];
        for (const [nome, values, esperado] of CEN_CI) {
          const d = escolherCi(values);
          if (d !== esperado) {
            falhas.push(`cenário contraindicação "${nome}": escolher(${JSON.stringify(values)}) devolveu "${d}", esperava "${esperado}".`);
          } else ok++;
        }
      }

      // ⚠️ FARMACOINVASIVA — as três recomendações Classe 1 presentes.
      const posLise = n("stemi_pos_fibrinolise");
      if (!posLise) falhas.push("`stemi_pos_fibrinolise` sumiu — a transferência imediata pós-lise (Classe 1 A) deixaria de existir.");
      else {
        ok++;
        if (n("stemi_fibrinolise")?.next !== "stemi_pos_fibrinolise") {
          falhas.push("`stemi_fibrinolise` não leva à transferência imediata — a farmacoinvasiva ficaria opcional.");
        } else ok++;
      }
      const farmaco = n("stemi_farmacoinvasiva");
      if (!farmaco) falhas.push("`stemi_farmacoinvasiva` sumiu — a angiografia precoce 2–24 h (Classe 1 B-R) deixaria de existir.");
      else {
        ok++;
        const txt = (farmaco.actions ?? []).join(" ");
        if (!/2 e 24 h/.test(txt)) falhas.push("`stemi_farmacoinvasiva` não declara a janela de 2–24 h.");
        else ok++;
        if (!/Classe 1, nível B-R/.test(txt)) falhas.push("`stemi_farmacoinvasiva` não declara a força da recomendação (Classe 1, B-R).");
        else ok++;
      }
      // ⚠️ ALCANÇABILIDADE, não só existência (achado ao extrair a árvore,
      // 2026-08-25): `stemi_farmacoinvasiva` existia e estava ÓRFÃO — a
      // trava anterior só conferia que o nó existia e o texto certo estava
      // nele. Nó correto e inalcançável é o mesmo que nó ausente.
      if (!alcancaDe("stemi_pos_fibrinolise").has("stemi_farmacoinvasiva")) {
        falhas.push("de `stemi_pos_fibrinolise` não se alcança `stemi_farmacoinvasiva` — a angiografia precoce 2–24 h ficaria órfã.");
      } else ok++;
      const optMelhora = (n("reavaliacao_pos_intervencao")?.options ?? []).find((o) => o.next === "stemi_farmacoinvasiva");
      if (!optMelhora || typeof optMelhora.showIf !== "function") {
        falhas.push("a reavaliação não leva à farmacoinvasiva sob condição de ter havido fibrinólise.");
      } else {
        ok++;
        if (!optMelhora.showIf({ estrategiaFibrinolise: "sim" })) falhas.push("a saída para a farmacoinvasiva não aparece para quem foi fibrinolisado.");
        else ok++;
        if (optMelhora.showIf({})) falhas.push("a saída para a farmacoinvasiva aparece para quem NÃO foi fibrinolisado.");
        else ok++;
      }
      if (!alcancaDe("stemi_pos_fibrinolise").has("icp_resgate")) {
        falhas.push("de `stemi_pos_fibrinolise` não se alcança `icp_resgate` — a falha de reperfusão ficaria sem via.");
      } else ok++;

      // ⚠️ A META DE TEMPO NÃO É FRASE ÚNICA — dois cenários, duas metas.
      const cen = n("stemi_cenario_icp");
      if (!cen || (cen.options ?? []).length !== 2) {
        falhas.push("`stemi_cenario_icp` sumiu ou deixou de separar os dois cenários logísticos.");
      } else ok++;
      const somaMetas = JSON.stringify(arv.derive?.({ cenarioIcp: "no_local" }) ?? {}) + JSON.stringify(arv.derive?.({ cenarioIcp: "transferencia" }) ?? {});
      if (!/90 minutos/.test(somaMetas) || !/120 minutos/.test(somaMetas)) {
        falhas.push("as duas metas (90 min no local · 120 min com transferência) não são derivadas — voltou a regra única.");
      } else ok++;
    }

    // ── NÍVEL DE SUSPEITA PÓS-PORTÃO (correção final 2026-08-25) ────────────
    // ⚠️ Os 3 blocos "triagem_disseccao_*" foram DELETADOS — redundância
    // comprovada com o Portão (mesmos achados, perguntados de novo). Quem
    // chega a `disseccao_investigacao` só chega via Portão (Grupo A sozinho
    // ou ≥2 domínios do Grupo B) — "baixa suspeita" não é mais alcançável
    // aqui por desenho: o Portão já filtrou isso antes.
    {
      for (const id of ["triagem_disseccao_dor", "triagem_disseccao_exame", "triagem_disseccao_predisponente"]) {
        if (n(id)) falhas.push(`\`${id}\` ainda existe na árvore — deveria ter sido deletado por redundância com o Portão.`);
        else ok++;
      }

      if (typeof arv?.derive !== "function") {
        falhas.push("a árvore não expõe `derive` — não dá para checar o nível pós-portão ({disseccaoNivel}).");
      } else {
        // ⚠️ COMPORTAMENTO REAL — Grupo A sozinho ou ≥2 domínios do Grupo B
        // (achado direto) → "alta suspeita"; confirmado só via tela de ajuda
        // → "suspeita intermediária" (um degrau de cautela abaixo do achado
        // direto). Testado através do MESMO `derive()` que a tela usa — não
        // duplica a lógica, prova o comportamento real de produção.
        const CENARIOS_NIVEL = [
          ["Grupo A positivo (achado direto) → alta", { portaoA_pulso_pa: "sim" }, "alta suspeita"],
          ["Grupo B com 2 domínios (achado direto) → alta", { portaoB1_dor_abrupta: "sim", portaoB2_choque: "sim" }, "alta suspeita"],
          ["confirmado só via ajuda do Grupo A (sem sim direto) → intermediária", { portao_ajuda_a: "confirmado" }, "suspeita intermediária"],
          ["confirmado só via ajuda do Grupo B (sem 2 sim diretos) → intermediária", { portao_ajuda_b: "confirmado" }, "suspeita intermediária"],
        ];
        for (const [nome, values, esperado] of CENARIOS_NIVEL) {
          const destino = arv.derive(values)?.disseccaoNivel;
          if (destino !== esperado) {
            falhas.push(`cenário nível pós-portão "${nome}": derive(${JSON.stringify(values)}).disseccaoNivel devolveu "${destino}", esperava "${esperado}".`);
          } else ok++;
        }
      }

      // ⚠️ REESCRITO (correção 2026-08-24): `disseccao_resultado` (3 opções,
      // pedia CONCLUSÃO pronta) foi substituído por um fluxo baseado em
      // FATOS — disponibilidade do exame → conteúdo do laudo — nunca pede
      // ao usuário "qual o resultado?" diretamente.
      const disponibilidade = n("disseccao_resultado_disponibilidade");
      if (!disponibilidade || disponibilidade.type !== "decision") {
        falhas.push("`disseccao_resultado_disponibilidade` sumiu ou deixou de ser decisão.");
      } else {
        ok++;
        const saidasDisp = [
          ["sim_tenho_laudo", "disseccao_resultado_laudo"],
          ["sim_mas_nao_sei_ler", "disseccao_ajuda_laudo"],
          ["ainda_nao", "disseccao_aguardando"],
          ["nao_sera_possivel", "disseccao_exame_nao_possivel"],
        ];
        if ((disponibilidade.options ?? []).length !== 4) {
          falhas.push(`\`disseccao_resultado_disponibilidade\` tem ${disponibilidade.options?.length ?? 0} opções, esperava exatamente 4.`);
        } else ok++;
        for (const [id, destino] of saidasDisp) {
          const o = (disponibilidade.options ?? []).find((x) => x.id === id);
          if (!o) falhas.push(`\`disseccao_resultado_disponibilidade\`: a saída "${id}" sumiu.`);
          else if (o.next !== destino) falhas.push(`\`disseccao_resultado_disponibilidade\`: a saída "${id}" aponta para \`${o.next}\`, esperava \`${destino}\`.`);
          else ok++;
        }
      }

      // Os dois loops de espera/indisponibilidade não podem virar becos sem
      // saída — voltam para a pergunta de disponibilidade.
      for (const id of ["disseccao_aguardando", "disseccao_exame_nao_possivel"]) {
        const no = n(id);
        if (!no) falhas.push(`\`${id}\` sumiu.`);
        else if (no.next !== "disseccao_resultado_disponibilidade") {
          falhas.push(`\`${id}\`.next é \`${no.next}\`, esperava voltar a \`disseccao_resultado_disponibilidade\` — ramo de segurança sem saída real.`);
        } else ok++;
      }

      // ⚠️ MESMA MIGRAÇÃO DAS CONFERÊNCIAS DO PORTÃO (2026-08-25): a promessa
      // é "afastar a dissecção leva à via do AAS", não "aponta literalmente
      // para `aas_liberado`". A Tela 2c pôs `aas_check` no caminho, e medir o
      // ponteiro reprovaria uma inserção que não muda conduta nenhuma.
      const alcancaDaqui = (de, alvo) => {
        const vistos = new Set();
        const pilha = [de];
        while (pilha.length) {
          const id = pilha.pop();
          if (!id || vistos.has(id)) continue;
          vistos.add(id);
          if (id === alvo) return true;
          const no = n(id);
          if (!no) continue;
          if (no.type === "decision") (no.options ?? []).forEach((o) => pilha.push(o.next));
          else if (typeof no.next === "string") pilha.push(no.next);
          else if (no.next?.possiveis) pilha.push(...no.next.possiveis);
        }
        return false;
      };

      const resultadoLaudo = n("disseccao_resultado_laudo");
      const saidasEsperadas = [
        ["confirma", "disseccao_confirmada"],
        ["afasta", "aas_liberado"],
        ["inconclusivo", "disseccao_investigacao"],
        ["nao_sei_ler", "disseccao_ajuda_laudo"],
      ];
      if (!resultadoLaudo || resultadoLaudo.type !== "decision") {
        falhas.push("`disseccao_resultado_laudo` sumiu ou deixou de ser decisão.");
      } else {
        ok++;
        if ((resultadoLaudo.options ?? []).length !== 4) {
          falhas.push(`\`disseccao_resultado_laudo\` tem ${resultadoLaudo.options?.length ?? 0} opções, esperava exatamente 4.`);
        } else ok++;
        for (const [id, destino] of saidasEsperadas) {
          const o = (resultadoLaudo.options ?? []).find((x) => x.id === id);
          if (!o) falhas.push(`\`disseccao_resultado_laudo\`: a saída "${id}" sumiu.`);
          else if (destino === "aas_liberado"
            ? !alcancaDaqui(o.next, "aas_liberado")
            : o.next !== destino) {
            falhas.push(
              `\`disseccao_resultado_laudo\`: a saída "${id}" aponta para \`${o.next}\`, ` +
              (destino === "aas_liberado"
                ? "e daí NÃO se alcança a via do AAS."
                : `esperava \`${destino}\`.`)
            );
          }
          else ok++;
        }
      }

      // ⚠️ "Não sei interpretar" nunca pede conclusão — decompõe em achados
      // objetivos (blocoAjudaLaudo), UMA PERGUNTA POR TELA (evita rolagem),
      // e deriva via Roteamento na segunda tela.
      const ajudaLaudo = n("disseccao_ajuda_laudo");
      if (!ajudaLaudo || ajudaLaudo.type !== "input") {
        falhas.push("`disseccao_ajuda_laudo` sumiu ou deixou de ser nó de entrada.");
      } else {
        ok++;
        if ((ajudaLaudo.fields ?? []).length !== 1) {
          falhas.push(`\`disseccao_ajuda_laudo\` tem ${ajudaLaudo.fields?.length ?? 0} campos — esperava exatamente 1 (uma pergunta por tela, sem rolagem).`);
        } else ok++;
        if (ajudaLaudo.next !== "disseccao_ajuda_laudo_afasta") {
          falhas.push(`\`disseccao_ajuda_laudo\`.next é \`${ajudaLaudo.next}\`, esperava \`disseccao_ajuda_laudo_afasta\`.`);
        } else ok++;
      }
      const ajudaLaudoAfasta = n("disseccao_ajuda_laudo_afasta");
      if (!ajudaLaudoAfasta || ajudaLaudoAfasta.type !== "input") {
        falhas.push("`disseccao_ajuda_laudo_afasta` sumiu ou deixou de ser nó de entrada.");
      } else {
        ok++;
        if ((ajudaLaudoAfasta.fields ?? []).length !== 1) {
          falhas.push(`\`disseccao_ajuda_laudo_afasta\` tem ${ajudaLaudoAfasta.fields?.length ?? 0} campos — esperava exatamente 1.`);
        } else ok++;
        const possiveisAjuda = ajudaLaudoAfasta.next?.possiveis;
        if (typeof ajudaLaudoAfasta.next === "string" || !Array.isArray(possiveisAjuda)) {
          falhas.push("`disseccao_ajuda_laudo_afasta` não termina em Roteamento — a derivação a partir dos achados do laudo sumiu.");
        } else {
          ok++;
          for (const destino of ["disseccao_confirmada", "aas_check", "disseccao_investigacao"]) {
            if (!possiveisAjuda.includes(destino)) falhas.push(`\`disseccao_ajuda_laudo_afasta\`: o Roteamento não declara \`${destino}\` como possível.`);
            else ok++;
          }
        }
      }

      // ⚠️ NENHUM RAMO DE SEGURANÇA TERMINA SÓ EM VOLTAR/RECOMEÇAR — a
      // investigação sempre leva à pergunta de disponibilidade, que sempre
      // resolve em uma das 3 saídas reais (confirmada sai do módulo;
      // afastada retoma o AAS; inconclusiva volta a investigar).
      const investigacao = n("disseccao_investigacao");
      if (investigacao?.next !== "disseccao_resultado_disponibilidade") {
        falhas.push("`disseccao_investigacao` não leva a `disseccao_resultado_disponibilidade` — o ramo de segurança ficaria sem saída real.");
      } else ok++;
    }

    // ⚠️ AS PERGUNTAS PRECISAM EXCLUIR O QUE O AUTOR PEDIU (2026-08-24) — não
    // é comportamento simulável por `escolher()`, é o ENUNCIADO da pergunta.
    const bloco1 = n("estab_bloco1");
    const labelConsciencia = (bloco1?.fields ?? []).find((f) => f.id === "cor_consciencia")?.label ?? "";
    if (!/AGUDA/i.test(labelConsciencia) || !/basal/i.test(labelConsciencia)) {
      falhas.push(
        "o campo `cor_consciencia` deixou de pedir explicitamente a mudança AGUDA (vs. o BASAL do paciente) " +
        "— sem isso, alteração CRÔNICA de consciência (demência, sequela prévia) volta a ser lida como ameaça nova."
      );
    } else ok++;

    const bloco5 = n("estab_bloco5");
    const labelEap = (bloco5?.fields ?? []).find((f) => f.id === "cor_edema_pulmonar")?.label ?? "";
    // ⚠️ REESCRITO (correção 2026-08-24) — "relevante" trocado por critérios
    // objetivos de repercussão (desconforto/hipoxemia/repercussão hemodinâmica/
    // suporte ventilatório); "isoladas" continua excluindo crepitação isolada.
    if (!/repercuss/i.test(labelEap) || !/isoladas/i.test(labelEap)) {
      falhas.push(
        "o campo `cor_edema_pulmonar` deixou de exigir repercussão clínica REAL (vs. crepitação " +
        "isolada) — o pedido do autor foi explícito: crepitação isolada não é o mesmo achado."
      );
    } else ok++;

    const presetsPulso = (bloco5?.fields ?? []).find((f) => f.id === "cor_pulso_alterado")?.presets ?? [];
    const valoresPulso = presetsPulso.map((p) => p.value);
    if (!valoresPulso.includes("ausente") || !valoresPulso.includes("filiforme")) {
      falhas.push(
        "o campo `cor_pulso_alterado` deixou de separar \"ausente\" de \"filiforme\" — pulso ausente (PCR) e " +
        "pulso filiforme (estabilização, e só associado a outro sinal) são condutas DIFERENTES e não podem " +
        "voltar a ser uma resposta só."
      );
    } else ok++;

    // ⚠️ A INVERSÃO DE PRIORIDADE (pedido central desta correção): a
    // descoberta guiada precisa ser a PRIMEIRA opção de `avaliar_estabilidade`,
    // não a última — "achados observáveis são o caminho padrão".
    const av = n("avaliar_estabilidade");
    if (av) {
      if (av.options?.[0]?.id !== "guiado") {
        falhas.push(
          "a opção guiada ('Avaliar por achados observáveis') não é mais a PRIMEIRA de `avaliar_estabilidade` " +
          "— a inversão pedida (achados observáveis = padrão, julgamento direto = atalho) exige que ela venha primeiro."
        );
      } else ok++;
      const instavel = (av.options ?? []).find((o) => o.id === "instavel");
      const estavel = (av.options ?? []).find((o) => o.id === "estavel");
      if (!instavel?.grava || instavel.grava.valor !== "instavel") {
        falhas.push("a opção 'instável' de `avaliar_estabilidade` não grava `estabilidade_avaliada` — o indicador compacto não teria o que mostrar.");
      } else ok++;
      if (!estavel?.grava || estavel.grava.valor !== "estavel") {
        falhas.push("a opção 'estável' de `avaliar_estabilidade` não grava `estabilidade_avaliada`.");
      } else ok++;
    }
  }
}

// ── J. GRACE — deriva da categoria a partir do número, não fabrica o escore ─
{
  if (!/function categoriaPorGrace/.test(arvore)) {
    falhas.push(`${ARVORE}: \`categoriaPorGrace\` sumiu — a derivação automática do GRACE foi perdida.`);
  } else ok++;
  if (!/n[ãa]o foram confirmados em fonte|não confirmados em fonte/i.test(arvore)) {
    falhas.push(
      `${ARVORE}: sumiu a ressalva de que os COEFICIENTES do escore GRACE não foram confirmados em fonte ` +
      `— sem ela, alguém pode achar que o app calcula o GRACE (não calcula, só deriva a categoria a partir do número).`
    );
  } else ok++;
  if (!/nste_risco_criterios/.test(arvore) || !/nste_risco_grace_valor/.test(arvore)) {
    falhas.push(`${ARVORE}: os nós de derivação automática de risco (critérios booleanos + valor do GRACE) sumiram.`);
  } else ok++;
}

// ── K. Reavaliação pós-intervenção formal (Etapa 7) ────────────────────────
{
  if (!/reavaliacao_pos_intervencao/.test(arvore)) {
    falhas.push(`${ARVORE}: \`reavaliacao_pos_intervencao\` sumiu — reperfusão voltaria a ir direto para prevenção secundária, sem checar sucesso/falha.`);
  } else ok++;

  const arv = (() => {
    try {
      const os = require("node:os");
      const { execFileSync } = require("node:child_process");
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "coron-reaval-"));
      execFileSync("npx", [
        "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
        "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
        path.join(appDir, ARVORE),
      ], { cwd: appDir, stdio: "pipe" });
      return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
    } catch {
      return null;
    }
  })();

  if (arv) {
    const terminais = [
      "stemi_icp", "stemi_fibrinolise", "stemi_transfer",
      "nste_invasiva_imediata", "nste_invasiva_precoce", "nste_seletiva",
    ];
    const alcancaDe = (de) => {
      const vistos = new Set(); const pilha = [de];
      while (pilha.length) {
        const x = pilha.pop();
        if (!x || vistos.has(x)) continue;
        vistos.add(x);
        const nn = arv.nodes[x];
        if (!nn) continue;
        if (nn.type === "decision") (nn.options ?? []).forEach((o) => pilha.push(o.next));
        else if (nn.next) {
          if (typeof nn.next === "string") pilha.push(nn.next);
          else (nn.next.possiveis ?? []).forEach((d) => pilha.push(d));
        }
      }
      return vistos;
    };
    for (const id of terminais) {
      const no = arv.nodes[id];
      if (!no) {
        falhas.push(`\`${id}\` sumiu da árvore.`);
        continue;
      }
      // ⚠️ ALCANÇABILIDADE, NÃO `next` DIRETO (2026-08-25). A promessa é que
      // NENHUMA reperfusão termine sem passar pela reavaliação — não que ela
      // seja o próximo nó literal. Desde a reorganização da ordem, peso e
      // antitrombóticos ficam ENTRE a reperfusão acionada e a reavaliação
      // (declarados como paralelos ao preparo). Medir o `next` literal
      // reprovaria justamente a correção que tirou as doses da frente da
      // decisão de reperfusão; medir alcance mantém a promessa intacta.
      if (!alcancaDe(id).has("reavaliacao_pos_intervencao")) {
        falhas.push(`\`${id}\` não alcança \`reavaliacao_pos_intervencao\` (segue para \`${no.next}\`) — reperfusão sem checar sucesso/falha.`);
      } else ok++;
    }
    if (!arv.nodes.icp_resgate) {
      falhas.push("`icp_resgate` sumiu — falha de fibrinólise perdeu o destino de resgate.");
    } else ok++;
  } else {
    falhas.push("não foi possível compilar a árvore para checar a reavaliação pós-intervenção.");
  }
}


// ── TELA 1 · ENTRADA DO PACIENTE ───────────────────────────────────────────
//
// ⚠️ O QUE ESTA TELA NÃO PODE FAZER É BLOQUEAR. Ela fica entre as ações
// paralelas e o bloco de ameaça, e a regra mestra do app é que a estabilização
// tem precedência sobre o protocolo: um campo obrigatório aqui faria o médico
// de um paciente em choque preencher idade antes de o app perguntar sobre
// pulso.
{
  const os = require("node:os");
  const { execFileSync } = require("node:child_process");
  const arvT1 = (() => {
    try {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), "cor-tela1-"));
      execFileSync("npx", [
        "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
        "--moduleResolution", "node", "--skipLibCheck", "--outDir", dir,
        path.join(appDir, ARVORE),
      ], { cwd: appDir, stdio: "pipe" });
      return Object.values(require(path.join(dir, ARVORE.replace(/\.ts$/, ".js")))).find((v) => v && v.nodes);
    } catch { return null; }
  })();

  if (!arvT1) {
    falhas.push("a árvore não compilou para as conferências da Tela 1 — elas NÃO RODARAM.");
  } else {
    const t1 = arvT1.nodes.entrada_paciente;
    if (!t1) {
      falhas.push("`entrada_paciente` (Tela 1) não existe.");
    } else {
      const campo = (id) => (t1.fields ?? []).find((f) => f.id === id);

      const obrigatorios = (t1.fields ?? []).filter((f) => !f.optional).map((f) => f.id);
      if (obrigatorios.length) {
        falhas.push(
          `a Tela 1 tem campo(s) OBRIGATÓRIO(s): ${obrigatorios.join(", ")}.\n` +
          `      ⚠️ Ela fica antes do bloco de ameaça. Um campo que trava aqui atrasa o ABCD de um ` +
          `paciente instável — e a regra mestra é que a estabilização vem primeiro.`
        );
      } else ok++;

      // O checklist, com os 13 sintomas da especificação.
      // ⚠️ O CHECKLIST MORA NA 1b, POR MEDIÇÃO: com os cinco campos juntos, o
      // card media 1383 px num viewport de 667 e os sintomas começavam em
      // y = 940 — tela-livro, com o que o médico veio marcar fora de vista.
      const t1b = arvT1.nodes.entrada_sintomas;
      const sint = (t1b?.fields ?? []).find((f) => f.id === "sintomas");
      if (!t1b) falhas.push("`entrada_sintomas` (Tela 1b) não existe.");
      else if (t1b.next !== "avaliar_estabilidade") {
        falhas.push(`a Tela 1b não leva ao bloco de ameaça (vai para "${t1b.next}").`);
      } else if ((t1b.fields ?? []).some((f) => !f.optional)) {
        falhas.push("a Tela 1b tem campo obrigatório — ela também fica antes do ABCD e não pode travar.");
      } else ok++;
      if (!sint) {
        falhas.push("o checklist de sintomas sumiu da Tela 1.");
      } else if (!sint.multiplo) {
        falhas.push(
          "`sintomas` deixou de ser `multiplo` — voltou a ser escolha única.\n" +
          "      ⚠️ Tocar o segundo item passaria a DESMARCAR o primeiro: \"dor retroesternal + " +
          "irradiação + sudorese\" é UM paciente, e o quadro seria descartado na entrada do fluxo."
        );
      } else if ((sint.presets ?? []).length < 13) {
        falhas.push(`o checklist perdeu itens: ${(sint.presets ?? []).length} de 13.`);
      } else ok++;

      // ⚠️ O PESO É COLHIDO CEDO E COBRADO TARDE. Aqui ele é opcional; o ramo
      // da fibrinólise tem nó próprio e obrigatório. As duas coisas juntas são
      // o que evita reperguntar sem afrouxar a dose.
      if (!campo("peso")) {
        falhas.push("o peso saiu da Tela 1 — ele volta a ser pedido só lá na frente, no meio da reperfusão.");
      } else ok++;

      // ⚠️ OS RÓTULOS DE `tempo_dor` SÃO CONTRATO COM `derivarJanelaReperfusao`.
      // Um rótulo diferente aqui não dá erro: cai silenciosamente em
      // "indeterminada", e o paciente perde a janela de fibrinólise sem que
      // nada na tela denuncie.
      const td = campo("tempo_dor");
      const ESPERADOS = ["< 1 h", "1–3 h", "3–6 h", "6–12 h", "12–24 h", "> 24 h", "Indefinido"];
      if (!td) {
        falhas.push("`tempo_dor` saiu da Tela 1 — o início dos sintomas voltaria a ser pedido depois.");
      } else {
        const rotulos = (td.presets ?? []).map((x) => x.label);
        const faltando = ESPERADOS.filter((e) => !rotulos.includes(e));
        if (faltando.length) {
          falhas.push(
            `\`tempo_dor\` da Tela 1 não oferece: ${faltando.join(", ")}.\n` +
            `      ⚠️ Os rótulos são contrato com \`derivarJanelaReperfusao\`. Divergir não dá erro — ` +
            `cai em "indeterminada", e a fibrinólise fecha sem que nada na tela explique por quê.`
          );
        } else ok++;
      }

      if (t1.next !== "entrada_sintomas") {
        falhas.push(`a Tela 1a não leva mais à Tela 1b (vai para "${t1.next}").`);
      } else ok++;
    }
  }
}


// ── NITRATOS: DUAS VIAS, DUAS PROCEDÊNCIAS, UMA FONTE DE CÁLCULO ───────────
//
// ⚠️ O DEFEITO QUE ISTO IMPEDE (2026-08-25): a versão anterior oferecia SÓ
// nitroglicerina sublingual — o que a ACC/AHA 2025 nomeia, mas não o que está
// na gaveta da maior parte dos serviços brasileiros. Um app que só oferece o
// que não existe manda o médico procurar outra fonte no meio do atendimento.
//
// ⚠️ E A TENTAÇÃO SEGUINTE ERA PIOR: escrever no card da SCA uma tabela de
// mL/h da nitroglicerina EV. `vasoactive-engine.ts` já traz a droga com
// apresentação real (Tridil, bula ANVISA), soluções de 100 e 200 mcg/mL e o
// cálculo — duas verdades sobre a mesma droga divergem no primeiro ajuste.
{
  const { lerFonte } = require("./lib/fonte.cjs");
  const fonte = lerFonte(path.join(appDir, "lib", "nitrato-dose.ts"));

  for (const [padrao, nome, porque] of [
    [/DINITRATO DE ISOSSORBIDA 5 mg SL/, "o dinitrato é a opção sublingual do Brasil",
     "sem ele o app só oferece o que a maioria dos serviços não tem"],
    [/diretriz brasileira de SCA/, "o dinitrato declara a fonte BRASILEIRA",
     "atribuí-lo à ACC/AHA 2025 daria à guideline americana uma recomendação que ela não faz"],
    [/NITROGLICERINA 0,3 ou 0,4 mg SL/, "a nitroglicerina SL continua como alternativa",
     "ela é o que a guideline nomeia — tirá-la perderia a referência"],
    [/iniciar a 10 mcg\/min/, "a EV inicia a 10 mcg/min no card da SCA",
     "é o valor específico da ACC/AHA 2025 para síndrome coronariana; a calculadora geral mostra 5–10 pela fonte dela, e o card não pode contradizer a guideline específica"],
    [/N[ÃA]O administrar IV direto/, "o card avisa que não se administra IV direto",
     "a apresentação brasileira é concentrada e exige diluição — omitir isso é omitir um erro de administração possível"],
    [/calculadora de drogas vasoativas/, "o card aponta para a calculadora",
     "é lá que vivem concentração, diluição e mL/h, com fonte de bula"],
  ]) {
    if (!padrao.test(fonte)) falhas.push(`${nome}: sumiu — ${porque}.`);
    else ok++;
  }

  // ⚠️ NENHUM NÚMERO DE CONCENTRAÇÃO OU mL/h PODE APARECER AQUI. Se aparecer,
  // existem duas fontes para a mesma droga — e `test:preparos` cobre o resto
  // do app, mas este arquivo é da SCA e precisa da sua própria guarda.
  // ⚠️ O QUE SE PROÍBE É O NÚMERO, NÃO A PALAVRA. A primeira versão desta
  // conferência reprovou a própria frase que APONTA para a calculadora
  // ("Concentração, diluição e mL/h na calculadora…") — proibir a menção
  // impediria justamente o ponteiro que resolve a duplicação. O que não pode
  // existir aqui é um VALOR: "6 mL/h", "100 mcg/mL", "50 mg em 500 mL".
  for (const [padrao, oque] of [
    [/\d+\s*mL\s*\/\s*h/, "uma vazão numérica em mL/h"],
    [/\d+\s*mcg\s*\/\s*mL/, "uma concentração numérica em mcg/mL"],
    [/\d+\s*mg em \d+\s*mL/, "uma receita de diluição"],
  ]) {
    if (padrao.test(fonte)) {
      falhas.push(
        `\`lib/nitrato-dose.ts\` escreve ${oque} — isso é da calculadora.\n` +
        `      ⚠️ Duas fontes para a mesma droga divergem no primeiro ajuste, e a que fica para trás ` +
        `segue sendo lida como se estivesse certa.`
      );
    } else ok++;
  }

  // E a alternativa tem de estar EM USO, não só declarada.
  //
  // ⚠️ O UNIVERSO MUDOU EM 2026-08-26, e esta trava reprovou por medir o lugar
  // errado (R-87). As doses saíram das `actions` da árvore e passaram a viver
  // em `Veredito.instrucao` — porque `actions` é renderizada mesmo no
  // vermelho, e a dose aparecia ao lado do próprio bloqueio. Continuar
  // procurando a constante na árvore contaria zero e acusaria uma perda que
  // não houve.
  const usos = lerFonte(path.join(appDir, "lib", "vereditos-sca.ts")).match(/NITRATO_DOSE_SL_ALTERNATIVA/g) ?? [];
  if (usos.length < 2) {
    falhas.push(
      `a alternativa de nitroglicerina SL é consumida ${usos.length}x em \`lib/vereditos-sca.ts\` — ` +
      `esperado ao menos 2 (import + uso).\n` +
      `      ⚠️ Declarar a constante e não consumi-la deixa a opção existindo só no código.`
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
