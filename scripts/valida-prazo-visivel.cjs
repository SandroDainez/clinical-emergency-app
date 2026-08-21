#!/usr/bin/env node
/**
 * PROMETE: que nenhum alerta com PRAZO ou PRECEDÊNCIA viva SÓ num campo
 *   RECOLHIDO — `evidence` (o "Ver critérios (N)" dos nós de decisão) ou
 *   `porque` (o "por quê" dos passos de ação, criado em 2026-08-18).
 *
 * ⚠️ `porque` ENTROU AQUI NO MESMO COMMIT EM QUE NASCEU. Um campo recolhido que
 *   nenhuma trava conhece é conteúdo sem guarda desde o primeiro dia — e este
 *   nasceu justamente para receber texto que sai da tela, o que o torna o
 *   destino mais provável de um prazo em fuga.
 * NÃO PROMETE: que todo ⚠️ esteja visível. A maioria não precisa estar, e
 *   exigir isso faria alguém TIRAR O ⚠️ para passar (R-55). Também não diz nada
 *   sobre o conteúdo clínico do alerta.
 * UNIVERSO: as 17 árvores compiladas, derivadas do diretório.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * O `coronary/ecg` revelou que `evidence` renderiza RECOLHIDO, e a pergunta
 * seguinte foi: quanto do que esta auditoria produziu está atrás desse toque?
 *
 * Medido: 15% do conteúdo das árvores e 18% dos alertas ⚠️ — 39 itens. A
 * classificação em três colunas mostrou que a maioria está no lugar certo:
 *
 *   MUDA CONDUTA AGORA (prazo, precedência, contraindicação) → tem de subir
 *   QUALIFICA A CONDUTA (por que a dose é essa)               → fica, e é certo
 *   ENSINA (mecanismo, fisiopatologia)                        → fica, e é para
 *                                                                isso que serve
 *
 * ⚠️ E A CLASSE DO PRAZO É A ÚNICA COM CUSTO IRREVERSÍVEL: quem não viu perdeu
 * a janela, e não há como recuperar depois. Por isso a trava é ESTREITA — pega
 * prazo e precedência, e deixa em paz os 25 que estão certos onde estão.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { conferirUniverso } = require("./lib/universo.cjs");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

/** Prazo: número + unidade de tempo, ou palavra de janela. */
const PRAZO = /\b\d+([,.]\d+)?\s*(h|hora|horas|min|minutos|segundos|semanas?|dias?|meses)\b|\bjanela\b|\btermina em\b|\baté \d/i;

/** Precedência: a ordem entre duas condutas. */
const PRECEDENCIA = /\bANTES DE\b|\bantes da\b|\bantes do\b|\bnão espere\b|\bnão aguarde\b|\bprimeiro\b|\bsó depois\b|\bnão faça .{0,40}antes\b/i;

const arquivos = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$/.test(f)).sort();

// ⚠️ ESTA TRAVA RESISTIA POR ACIDENTE. Com o universo vazio ela reprovava — mas
// por causa dos tetos por módulo que não fechavam, não porque soubesse que não
// tinha olhado. Acidente não é proteção: no dia em que os tetos zerassem junto,
// o verde voltaria. Agora ela sabe dizer "não consegui olhar".
console.log("");
const universoOk = conferirUniverso("valida-prazo-visivel", "arvores", arquivos.length);
if (!universoOk) {
  console.log("❌ universo insuficiente — nenhuma conferência de prazo foi feita.\n");
  process.exit(1);
}
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prazo-visivel-"));
const arvores = {};
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      ...arquivos.map((f) => path.join(appDir, f)),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  for (const f of arquivos) {
    const mod = require(path.join(tempDir, f.replace(/\.ts$/, ".js")));
    const arv = Object.values(mod).find((v) => v && v.nodes);
    if (arv) arvores[f.replace("-decision-tree.ts", "")] = arv;
  }
} catch (erro) {
  falhas.push(`as árvores não compilaram — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

/**
 * Dívida congelada — alertas de prazo/precedência que ainda vivem só em
 * evidence. Teto por módulo, e o teto SÓ DESCE (molde da D-35).
 *
 * ⚠️ Preenchido pela medição, não por estimativa.
 */
const LEGADO = {
  // Ordem de subida decidida com o autor: AVC (prazo irreversível) → coronary
  // (porta-balão) → EAP (a frase que esta auditoria escreveu e ficou recolhida).
  // Estes são os que restam, e cada um cai no bloco do seu módulo.
  anaphylaxis: 1, // "se houve anestésico local, pense em LAST"
  politrauma: 1, //  hipotensão permissiva não se aplica ao TCE
  sepsis: 2, //      "antes de trocar, estratifique" · exceção do TCE na albumina
  shock: 1, //       "responder NÃO aqui fecha esta porta"
  // ⚠️ tep caiu de 2 para 1 quando `angiotc` subiu o TEP subsegmentar para o
  // summary — teto baixado para travar o ganho (2026-08-17).
  tep: 1, //         relativas aceitáveis em PCR
  dyspnea: 1, //     a regra dos 30–60 min
  "dka-hhs": 2, //   dose do bicarbonato · glicose aos 250
};

for (const [modulo, arv] of Object.entries(arvores)) {
  const escondidos = [];
  for (const [id, n] of Object.entries(arv.nodes)) {
    const visivel = [n.title, n.summary, n.question, ...(n.actions ?? []), ...(n.exitCriteria ?? []), n.intro]
      .filter((t) => typeof t === "string")
      .join("\n");
    // Os DOIS campos recolhidos, com o nome de cada um preservado para a
    // mensagem de falha — quem for consertar precisa saber onde procurar.
    const recolhidos = [
      ...(n.evidence ?? []).map((t) => ({ campo: "evidence", texto: t })),
      ...(n.porque ?? []).map((t) => ({ campo: "porque", texto: t })),
    ];
    for (const { campo, texto: e } of recolhidos) {
      // ⚠️ O GATILHO É O ITEM MARCADO — e a razão é o recorte.
      //
      // Sem o marcador, a trava pega o Canadian CT Head Rule ("Glasgow < 15
      // após 2 h") e o limiar de PIC ("> 22 mmHg por mais de 5 min") — que são
      // CRITÉRIO, estão certos em `evidence`, e cuja subida só faria trocar
      // escondido por ilegível. A trava seria larga demais e obrigaria a mexer
      // no que está certo.
      //
      // A mutação mostrou o buraco disso: bastaria TIRAR o ⚠️ para escapar
      // (R-55 puro). O buraco é fechado pelo PISO DE ALERTAS abaixo — o número
      // de itens marcados por módulo não pode cair.
      if (!/⚠️|⏱/.test(e)) continue;
      if (!PRAZO.test(e) && !PRECEDENCIA.test(e)) continue;
      // ⚠️ COBERTO É O PRAZO, NÃO A FRASE.
      //
      // A primeira versão comparava os 40 primeiros caracteres do item com o
      // texto visível — e reprovou justamente os dois nós que ACABARAM de ser
      // corrigidos, porque o que subiu foi um RESUMO, não uma cópia. Resumir é
      // o certo a fazer (subir os quatro itens do AVC daria 16× a densidade
      // mediana); a trava é que estava medindo a coisa errada.
      //
      // O que ela pergunta agora: o NÚMERO do prazo, ou a expressão de
      // precedência, aparece na superfície visível deste nó? Se aparece, o
      // detalhe pode e deve ficar em `evidence`.
      const prazos = e.match(new RegExp(PRAZO.source, "gi")) ?? [];
      const prazoVisivel = prazos.some((p) => visivel.toLowerCase().includes(p.toLowerCase()));
      const precedenciaVisivel = PRECEDENCIA.test(e) && PRECEDENCIA.test(visivel);
      if (prazoVisivel || precedenciaVisivel) continue;
      escondidos.push(`${id} [${campo}]: « ${e.slice(0, 74)}… »`);
    }
  }

  const teto = LEGADO[modulo];
  if (teto === undefined) {
    if (escondidos.length) {
      falhas.push(
        `\`${modulo}\`: ${escondidos.length} alerta(s) de PRAZO ou PRECEDÊNCIA só em campo RECOLHIDO.\n` +
        escondidos.map((x) => `        ${x}`).join("\n") + "\n" +
        `      ⚠️ \`evidence\` renderiza RECOLHIDO. Prazo escondido é a única classe cujo custo é ` +
        `IRREVERSÍVEL: quem não viu perdeu a janela. Suba o que DECIDE para o \`summary\` e deixe ` +
        `o detalhe aqui — e meça a densidade antes, porque trocar escondido por ilegível não resolve.`
      );
    } else ok++;
    continue;
  }

  if (escondidos.length) {
    avisos.push(`${modulo}: ${escondidos.length} pendente(s) (teto ${teto})`);
  }
  if (escondidos.length > teto) {
    falhas.push(
      `\`${modulo}\` piorou: ${escondidos.length} alertas de prazo/precedência escondidos contra um teto de ${teto}.`
    );
  } else {
    ok++;
    if (escondidos.length < teto) {
      avisos.push(`${modulo}: caiu de ${teto} para ${escondidos.length} — baixe o teto para travar o ganho.`);
    }
  }
}

// ── PISO DE ALERTAS — contra a saída fácil de tirar o ⚠️ ───────────────────
//
// A conferência acima só olha itens MARCADOS, para não pegar critério que está
// certo em `evidence`. A mutação mostrou o preço disso: bastaria remover o
// marcador para o item sumir do radar — e "piorar o texto para agradar a trava"
// é exatamente o R-55.
//
// O piso fecha essa porta: o número de alertas por módulo não pode CAIR. Subir
// pode (e deve, quando se escreve mais); descer é regressão, e a única maneira
// legítima de descer é apagando o alerta — que é o que se quer impedir.
//
// ⚠️ Números MEDIDOS em 2026-08-17, não estimados.
// ⚠️ O PISO CONTA ALERTAS ÚNICOS, NÃO OCORRÊNCIAS — e a razão é um defeito
// que ele mesmo produziu (2026-08-17).
//
// A primeira versão contava STRINGS MARCADAS por módulo. `coronary` caiu de 26
// para 25 quando dois alertas foram fundidos num só (o prazo e a consequência,
// no mesmo summary) — nenhum apagado. Depois caiu de 25 para 21 na
// deduplicação do nó `ecg`, quando NOVE constantes deixaram de ser consumidas
// duas vezes. O texto continuou vivo, aberto, em `ecg_sem_supra`.
//
// ⚠️ UM CONTADOR DE OCORRÊNCIAS PREMIA A DUPLICATA: o app que mostra o mesmo
// alerta em dois nós "tem mais alertas" que o app que o mostra num só. E a
// trava passa a punir exatamente a correção que ela deveria querer.
//
// Contando ÚNICOS, deduplicar não mexe no número e apagar continua reprovando.
// Medido na mesma passagem: NOVE dos dezessete módulos tinham duplicata —
// poisoning 7, seizure 6, dka-hhs 5, rsi 5, acute-abdomen 4, tce 2, coronary 1,
// eap 1. Os pisos abaixo são os ÚNICOS de hoje.
const PISO_DE_ALERTAS = {
  "acute-abdomen": 13, anaphylaxis: 11, avc: 16, coronary: 20, "dka-hhs": 17,
  dyspnea: 3, eap: 16, eclampsia: 9, poisoning: 26, politrauma: 8, rsi: 13,
  seizure: 9, sepsis: 17, shock: 10, tce: 12, tep: 17, ventilation: 8,
};

for (const [modulo, arv] of Object.entries(arvores)) {
  const piso = PISO_DE_ALERTAS[modulo];
  if (piso === undefined) continue;
  // ⚠️ Set, não contador: o mesmo texto em dois nós é UM alerta.
  const unicos = new Set();
  for (const n of Object.values(arv.nodes)) {
    for (const t of [n.title, n.summary, n.question, n.intro, ...(n.actions ?? []), ...(n.exitCriteria ?? []), ...(n.evidence ?? [])]) {
      if (typeof t === "string" && /⚠️|⏱/.test(t)) unicos.add(t);
    }
  }
  const marcados = unicos.size;
  if (marcados < piso) {
    falhas.push(
      `\`${modulo}\`: os alertas caíram de ${piso} para ${marcados}.\n` +
      `      ⚠️ Alerta não se apaga para passar em trava. Se o texto deixou de merecer o marcador, ` +
      `o que mudou foi a conduta — e aí a mudança é clínica, não de formatação: baixe o piso ` +
      `explicitamente, com a razão escrita.`
    );
  } else ok++;
}

// ── Vacuidade: sem árvores, a varredura passa calada ───────────────────────
if (Object.keys(arvores).length < 15) {
  falhas.push(`só ${Object.keys(arvores).length} árvores carregadas — pode ter rodado sobre nada (R-15 item 9).`);
} else ok++;

console.log("\nPrazo e precedência não podem viver recolhidos\n");
for (const a of avisos) console.log(`ℹ️  ${a}`);
if (avisos.length) console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — nenhum prazo novo escondido atrás do acordeão\n`);
process.exit(0);
