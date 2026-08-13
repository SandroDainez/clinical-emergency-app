/**
 * valida-ordem-clinica-parcial.cjs — R-22, item 4(C) · PARCIAL
 *
 * PROMETE: que SEIS pares "A antes de B" nomeados nesta trava sejam respeitados
 *   onde o app os expressa — ordem de nó no grafo, índice em array de conduta,
 *   ou presença da frase que fixa a ordem.
 * NÃO PROMETE: que a ordem clínica do app esteja verificada. São 6 pares de uma
 *   lista de 10, e a lista de 10 não pretende cobrir a medicina de emergência.
 *   QUATRO pares ficam de fora e são impressos a cada execução com o motivo —
 *   dois porque o app não expressa a ordem em lugar nenhum, um porque vive em
 *   outra máquina (o reducer do ACLS) e um porque já é coberto por test:sedacao.
 * UNIVERSO: as 19 árvores de decisão, os motores, e a tela de correções
 *   eletrolíticas — declarada à parte por ser React e não árvore.
 *
 * ── POR QUE "PARCIAL" ESTÁ NO NOME ──────────────────────────────────────────
 *
 * Porque o perigo de uma tabela curta não é a incompletude — é a incompletude
 * que SE APRESENTA COMO COMPLETA. Uma trava chamada "ordem-clinica" que passa
 * verde ensina que a ordem clínica do app foi conferida. Ela não foi: foram seis
 * pares.
 *
 * A palavra no nome e a lista impressa a cada execução existem para que ninguém
 * leia o verde como mais do que ele é.
 *
 * ── DE ONDE VEIO A TABELA, E O QUE ELA CUSTOU (R-26) ────────────────────────
 *
 * Dos 10 pares propostos:
 *   · 1 era fisicamente impossível como escrito ("confirmar o tubo antes de
 *     ventilar" — capnografia em onda EXIGE ventilação para gerar onda);
 *   · 3 tinham exceção nomeável (PCR para o bloqueador; pré-hospitalar para o
 *     antídoto; e a tiamina, que virou regra de PRESENÇA depois de se ver que a
 *     formulação original faria a trava acusar texto correto e empurrar para
 *     atrasar glicose em hipoglicemia documentada);
 *   · 3 não são verificáveis na estrutura de hoje;
 *   · 4 sobreviveram intactos.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const ler = (rel) => {
  const abs = path.join(appDir, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
};

/** Índice da primeira linha que casa, dentro de um recorte. */
const linhaDe = (texto, re) => {
  const linhas = texto.split("\n");
  for (let i = 0; i < linhas.length; i++) {
    if (/^\s*\/\//.test(linhas[i])) continue;
    if (re.test(linhas[i])) return i;
  }
  return -1;
};

// ══ OS SEIS PARES CONFERIDOS ═══════════════════════════════════════════════

const PARES = [
  {
    n: 3,
    nome: "glicemia capilar antes de tratar o rebaixamento",
    porque: "hipoglicemia é a causa reversível que se trata em segundos; tratar o coma sem medir é tratar às cegas",
    conferir() {
      const t = ler("poisoning-decision-tree.ts");
      if (!t) return "poisoning-decision-tree.ts não encontrado";
      const glicemia = linhaDe(t, /GLICEMIA CAPILAR/);
      const antidotos = linhaDe(t, /Antídotos do coma/);
      if (glicemia < 0 || antidotos < 0) return "não achei uma das duas linhas — a conferência não rodou";
      return glicemia < antidotos ? null : `a glicemia (linha ${glicemia + 1}) vem DEPOIS dos antídotos (linha ${antidotos + 1})`;
    },
  },
  {
    n: 4,
    nome: "tiamina PRESENTE sempre que houver glicose no etilista/desnutrido",
    porque:
      "é regra de PRESENÇA e não de ordem — nunca se atrasa glicose em hipoglicemia documentada para dar tiamina. " +
      "Wernicke por um bólus é largamente teórico; hipoglicemia prolongada não é",
    conferir() {
      const t = ler("poisoning-decision-tree.ts");
      if (!t) return "poisoning-decision-tree.ts não encontrado";
      const linhas = t.split("\n").filter((l) => !/^\s*\/\//.test(l));
      const comGlicose = linhas.filter((l) => /glicose 50%|glicose hipertônica/i.test(l) && /coma|rebaixament|etilista|desnutrid/i.test(l));
      if (!comGlicose.length) return "nenhuma linha prescreve glicose no coma — a conferência não rodou";
      const semTiamina = comGlicose.filter((l) => !/tiamina/i.test(l));
      return semTiamina.length
        ? `${semTiamina.length} linha(s) dão glicose no coma sem tiamina ao lado: «${semTiamina[0].trim().slice(0, 90)}»`
        : null;
    },
  },
  {
    n: 6,
    nome: "cálcio (estabilização de membrana) antes das medidas que deslocam K⁺",
    porque: "com ECG alterado, o cálcio protege o miocárdio em minutos; o shift leva dezenas de minutos e não protege enquanto age",
    conferir() {
      const t = ler("components/protocol-screen/electrolyte-calculator-screen.tsx");
      if (!t) return "tela de eletrólitos não encontrada";
      const calcio = linhaDe(t, /title: "Estabilização de membrana"/);
      const shift = linhaDe(t, /title: "Shift intracelular"/);
      const remocao = linhaDe(t, /title: "Remoção de potássio"/);
      if (calcio < 0 || shift < 0 || remocao < 0) return "não achei os três blocos de estratégia — a conferência não rodou";
      if (!(calcio < shift)) return `estabilização de membrana (linha ${calcio + 1}) vem depois do shift (linha ${shift + 1})`;
      if (!(shift < remocao)) return `shift (linha ${shift + 1}) vem depois da remoção (linha ${remocao + 1})`;
      return null;
    },
  },
  {
    n: 8,
    nome: "hemocultura antes do antibiótico — SEM atrasar o antibiótico",
    porque: "a ressalva é parte do par: coletar antes só vale se não empurrar o ATB para fora da primeira hora",
    conferir() {
      const t = ler("sepsis-decision-tree.ts");
      if (!t) return "sepsis-decision-tree.ts não encontrado";
      // ⚠️ ANCORADO NO NÓ, não no arquivo. A primeira versão perguntava se o
      // arquivo continha "não atrasar" em qualquer lugar — e continha, sobre
      // TC/punção lombar e sobre acesso central. Duas mutações passaram limpas
      // por isso: dá para apagar a ressalva DA CULTURA e a trava seguir verde
      // porque sobrou "não atrasar" falando de outra coisa.
      const linhas = t.split("\n").filter((l) => !/^\s*\/\//.test(l));
      const daCultura = linhas.filter((l) => /hemocultura|cultura/i.test(l));
      if (!daCultura.length) return "não achei nenhuma linha de hemocultura — a conferência não rodou";

      const comOrdem = daCultura.filter((l) => /ANTES do (antibiótico|ATB)/i.test(l));
      if (!comOrdem.length) {
        return "nenhuma linha de hemocultura diz que ela vem ANTES do antibiótico";
      }
      const comRessalva = daCultura.some((l) => /n[ãa]o atrasar|sem atrasar/i.test(l));
      if (!comRessalva) {
        return "a ordem está escrita mas a RESSALVA sumiu DA LINHA DA CULTURA — sem ela, o par manda atrasar o antibiótico";
      }
      return null;
    },
  },
  {
    n: 9,
    nome: "dexametasona antes ou junto do primeiro antibiótico na meningite",
    porque: "o benefício depende de o corticoide preceder ou acompanhar a primeira dose; depois dela, não há benefício demonstrado",
    conferir() {
      const t = ler("sepsis-decision-tree.ts");
      if (!t) return "sepsis-decision-tree.ts não encontrado";
      const linha = t.split("\n").find((l) => !/^\s*\/\//.test(l) && /Dexametasona/i.test(l) && /meningite|ATB|antibiótico|Ceftriaxona/i.test(l));
      if (!linha) return "não achei a linha da dexametasona na meningite — a conferência não rodou";
      return /ANTES ou junto|antes ou junto/i.test(linha)
        ? null
        : `a linha da dexametasona perdeu a ordem em relação ao 1º ATB: «${linha.trim().slice(0, 95)}»`;
    },
  },
  {
    n: 10,
    nome: "confirmação de posição do tubo antes de FIXAR e antes de assumir a via aérea como segura",
    porque:
      "a redação original do par dizia 'antes de ventilar', e isso é impossível: capnografia em onda EXIGE ventilação " +
      "para gerar onda. O invariante é confirmar antes de FIXAR e antes de tratar a via aérea como resolvida",
    conferir() {
      const t = ler("rsi-decision-tree.ts");
      if (!t) return "rsi-decision-tree.ts não encontrado";
      const confirmacao = linhaDe(t, /id: "confirmacao"/);
      if (confirmacao < 0) return "o nó de confirmação sumiu do fluxo de ISR";
      const pergunta = linhaDe(t, /capnografia \(ETCO₂\) confirma a posição traqueal/i);
      if (pergunta < 0) return "o nó de confirmação não pergunta pela capnografia";
      const posIntubacao = linhaDe(t, /id: "pos_intubacao"|id: "pos-intubacao"|id: "posIntubacao"/);
      if (posIntubacao >= 0 && !(confirmacao < posIntubacao)) {
        return `o nó de confirmação (linha ${confirmacao + 1}) vem depois do pós-intubação (linha ${posIntubacao + 1})`;
      }
      return null;
    },
  },
];

// ══ OS QUATRO NÃO COBERTOS — impressos, não silenciados ════════════════════

const NAO_COBERTOS = [
  {
    n: 1,
    nome: "nunca paralisar quem pode perceber sem sedação",
    motivo:
      "JÁ COBERTO por test:sedacao, que exige o aviso do BNM com o mesmo peso visual nos três bloqueadores. " +
      "Exceção nomeada: na PCR não se seda, porque não há consciência a proteger. E na ISR indutor e bloqueador " +
      "são empurrados com segundos de diferença — 'antes' ali é sequência de seringa, não etapa do fluxo.",
  },
  {
    n: 2,
    nome: "confirmação de ritmo antes de desfibrilação",
    motivo:
      "vive em OUTRA MÁQUINA. O ACLS não é árvore de decisão: é um reducer com fases (RECOGNITION → SHOCK → CPR → " +
      "RHYTHM_CHECK) e ACLSShockableFlowStep. A ordem existe e é forte, mas conferi-la é teste do reducer, não desta trava.",
  },
  {
    n: 5,
    nome: "descompressão do pneumotórax hipertensivo antes de ventilação com pressão positiva",
    motivo:
      "o app cita pneumotórax hipertensivo em cinco lugares (politrauma, choque, Hs&Ts do ACLS, ventilação), SEMPRE " +
      "como causa a procurar e NUNCA em relação de ordem com a VPP. Verificar exigiria conteúdo que não existe.",
  },
  {
    n: 7,
    nome: "via aérea/oxigenação antes de antídoto na intoxicação — INTRA-HOSPITALAR",
    motivo:
      "existe como frase («Ventilar com bolsa-válvula-máscara enquanto a naloxona não age»), não como ordem estrutural. " +
      "E o escopo importa: no PRÉ-HOSPITALAR a relação se INVERTE — a naloxona IM/IN É a intervenção de via aérea " +
      "disponível, e vem primeiro.",
  },
];

// ══ Execução ═══════════════════════════════════════════════════════════════

for (const par of PARES) {
  const problema = par.conferir();
  if (problema) falhas.push(`par ${par.n} — ${par.nome}\n    ${problema}\n    POR QUÊ IMPORTA: ${par.porque}.`);
  else ok++;
}

console.log(`\nOrdem clínica — SEIS pares de uma lista de dez (PARCIAL)\n`);
console.log(`⚠️  ESTA TRAVA NÃO VERIFICA A ORDEM CLÍNICA DO APP. Verifica seis pares nomeados.\n`);

console.log(`CONFERIDOS (${PARES.length}):`);
for (const p of PARES) console.log(`   ${String(p.n).padStart(2)} · ${p.nome}`);

console.log(`\nNÃO COBERTOS (${NAO_COBERTOS.length}) — e por quê:`);
for (const p of NAO_COBERTOS) {
  console.log(`   ${String(p.n).padStart(2)} · ${p.nome}`);
  console.log(`        ${p.motivo}`);
}
console.log("");

if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} par(es) violado(s) · ${ok} conferido(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} pares conferidos · ${NAO_COBERTOS.length} declaradamente fora do alcance\n`);
