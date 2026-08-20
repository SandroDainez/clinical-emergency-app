#!/usr/bin/env node
/**
 * PRESSUPOSIÇÃO CLÍNICA — nenhum nó pode AFIRMAR um achado deste paciente que
 * ninguém perguntou a montante.
 *
 * PROMETE: que nenhuma tela fale de um achado do paciente — sintoma, sinal,
 *   valor ou contexto — como fato estabelecido, se existir um caminho do início
 *   até ela em que ninguém perguntou aquele achado.
 * NÃO PROMETE: reconhecer toda forma de afirmar. A detecção é por FORMA da
 *   frase (posse, estado declarado, valor tratado como em mãos), e forma nova
 *   passa batido até alguém ler. Também não julga se a pergunta que captura o
 *   achado é boa — só que ela existe no caminho.
 * UNIVERSO: as árvores listadas em ARVORES, compiladas; hoje, o módulo renal.
 *   Cada árvore entra aqui quando migra para o formato novo.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-20) ─────────────────────────────────
 *
 * O médico leu no fluxo uma frase que tratava "falta de ar" como fato — e nada
 * no caminho até ali tinha perguntado isso. O app AFIRMAVA o que devia
 * PERGUNTAR. Não era instância: era classe.
 *
 * ── A MÁQUINA É A MESMA DA TRAVA DA CALCULADORA ────────────────────────────
 *
 * Alcançabilidade no grafo. Para cada achado, o conjunto de nós que o
 * PERGUNTAM; para cada nó que o MENCIONA, uma busca em largura de `entry` até
 * ele que não passe por nenhum nó de captura. Se esse caminho existe, existe um
 * atendimento real em que a tela fala de algo que ninguém mediu.
 *
 * ── ⚠️ E É A CLASSIFICAÇÃO QUE TORNA A TRAVA UTILIZÁVEL ────────────────────
 *
 * A primeira varredura achou 58 ocorrências candidatas no renal. Reprovar as 58
 * seria inútil: 46 não são defeito, e linter que grita lobo é linter que
 * ninguém obedece. As quatro naturezas entram aqui como DEFINIÇÃO:
 *
 *   ORDEM     "colha gasometria", "meça a diurese"     → manda fazer, não afirma
 *   CRITÉRIO  "conta como evidência de DRC:", "as seis:" → ensina o que contaria
 *   GERAL     "a creatinina sobe tarde", "costuma dar"  → fala da doença
 *   AFIRMAÇÃO "o edema dele", "com a glicemia baixa"    → ❌ fala DESTE paciente
 *
 * Só a quarta reprova.
 *
 * ⚠️ O RISCO DESTE INSTRUMENTO É O INVERSO DO USUAL: ele erra para MENOS. A
 * classificação é por forma da frase, e forma nova de afirmar passa batido. Ele
 * não substitui a leitura — corta o custo dela.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pressup-"));

/** Árvores auditadas. Uma por vez ganha a trava, conforme entra no formato novo. */
const ARVORES = ["ira-decision-tree.ts"];

execFileSync(
  "npx",
  ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule", "--esModuleInterop",
   "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
   ...ARVORES.map((f) => path.join(app, f))],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] }
);

/**
 * Vocabulário de ACHADOS do paciente — sintoma, sinal, valor ou contexto.
 *
 * Não entra aqui o que é conduta (diálise, sonda de alívio) nem o que é
 * organização do app (módulo, calculadora): a pergunta é "o app está falando de
 * algo que só se sabe examinando ESTE paciente?".
 */
const ACHADOS = [
  ["falta de ar / dispneia", /falta de ar|dispneia|dispnéia/i],
  ["edema periférico", /\bedema(?!\s+agudo)/i],
  ["estase jugular", /estase jugular|turgência|jugular/i],
  ["crepitações", /crepita|estertor|estalido/i],
  ["ascite", /ascite/i],
  ["ortopneia", /ortopneia/i],
  ["esforço respiratório", /musculatura acess|esforço respirat/i],
  ["saturação / hipoxemia", /satura|spo2|spo₂|hipoxemia/i],
  ["diurese / anúria / oligúria", /diurese|anúria|anuria|oligúria|oliguria/i],
  ["potássio", /potássio|potassio|hipercalemia/i],
  ["ECG", /\becg\b|eletrocardiog/i],
  ["creatinina", /creatinina/i],
  ["pH / gasometria / acidose", /gasometria|acidemia|acidose|bicarbonato/i],
  ["pressão / choque / perfusão", /hipotens|press[ãa]o|\bpas\b|\bpam\b|choque|perfus/i],
  ["lactato", /lactato/i],
  ["glicemia", /glicemia|hipoglicemia/i],
  ["peso", /\bpeso\b/i],
  ["bexiga / sonda vesical", /sonda vesical|bexiga|globo vesical/i],
  ["consciência rebaixada", /rebaixad|confus|encefalopat/i],
  ["vômitos", /vômito|vomito|náusea|nausea/i],
  ["sangramento", /sangramento|hemorragi/i],
  ["exposição a nefrotóxico", /contraste|aine|ieca|aminoglicos|nefrotóxic/i],
  ["rabdomiólise / CPK", /rabdomi|\bcpk\b|esmagamento/i],
  ["ultrassom / rins pequenos", /ultrassom|rins pequenos|hidronefrose/i],
  ["anemia", /anemia|hemograma/i],
  ["febre / infecção", /febre|infec/i],
  ["asterixis", /asterixis/i],
  ["atrito pericárdico", /atrito peric/i],
];

/* ── AS QUATRO NATUREZAS, E A QUARTA É DETECTADA POR PRESENÇA ────────────── */

/**
 * ⚠️ A PRIMEIRA VERSÃO DETECTAVA AS TRÊS PRIMEIRAS E CHAMAVA O RESTO DE
 * AFIRMAÇÃO — e por isso reprovava frase de critério mal formatada, título de
 * nó e enumeração. Estava medindo "não reconheci", não "afirmou".
 *
 * Agora a quarta natureza é detectada POR PRESENÇA: uma frase só afirma se
 * amarra o achado a ESTE paciente — por posse ("dele", "do paciente"), por
 * verbo de estado ("está", "apresenta") ou por preposição que trata o achado
 * como dado em mãos ("com a glicemia baixa"). Sem marca de referência, é
 * enunciado sobre a doença, e enunciado sobre a doença não é o defeito.
 *
 * O custo é errar para MENOS: forma nova de afirmar passa batido até alguém
 * ler. É o lado certo para errar num instrumento que reprova build.
 */
const AFIRMA = [
  // posse: o achado é atribuído a alguém
  /\bdo paciente\b|\bdeste paciente\b|\bdo seu paciente\b|\bdele\b|\bdela\b/i,
  // estado declarado do paciente
  /\b(o |seu )?paciente (est[áa]|apresenta|tem|chegou)\b/i,
  // ⚠️ `\b` DEPOIS DE "está" CASAVA "Estágio". A palavra tem de terminar ali:
  // sem isto, as definições de estadiamento do KDIGO eram lidas como afirmação
  // sobre o paciente, e a trava mandava apagar a diretriz.
  /^\s*(⚠️\s*)?(est[áa]|apresenta)(?=[\s,.;:])/i,
  // valor tratado como já em mãos: "com a glicemia basal abaixo de…"
  /\bcom\s+(a|o)\s+(glicemia|creatinina|potássio|satura[çc][ãa]o|press[ãa]o|lactato|diurese)\s+(basal\s+)?(abaixo|acima|baix|alt|em)/i,
];

/**
 * ⚠️ ENUNCIADO SOBRE A DOENÇA DESARMA A MARCA DE AFIRMAÇÃO.
 *
 * "A obstrução PODE DAR anúria com creatinina ainda normal" tem a marca ("com
 * creatinina…") e não afirma nada sobre ninguém: fala do que a doença faz. Sem
 * esta exclusão, a trava reprovaria o ensino e obrigaria a apagá-lo — que é o
 * oposto do que ela existe para proteger.
 */
const GERAL = /\bpode(m)? dar\b|costuma|geralmente|em geral|\bum paciente\b|\bquem\b|a diretriz|o app\b|é est[áa]gio|\bsobe tarde\b|\bleva horas\b|por definição|\bKDIGO\b/i;

const textoDeNo = (n) =>
  [n.title, n.question, n.summary, n.intro,
   ...(n.evidence ?? []), ...(n.actions ?? []), ...(n.porque ?? []), ...(n.exitCriteria ?? []),
   ...(n.comparativo ?? []).flatMap((c) => [c.rotulo, c.significado, c.conduta]),
  ].filter(Boolean);

const perguntaDeNo = (n) =>
  [n.question, ...(n.options ?? []).map((o) => o.label),
   ...(n.fields ?? []).flatMap((f) => [f.id, f.label, ...(f.presets ?? []).map((p) => p.label)]),
  ].filter(Boolean).join(" ");

const proximos = (N, n) => {
  const s = [];
  for (const o of n.options ?? []) s.push(o.next);
  const p = n.next;
  if (typeof p === "string") s.push(p);
  else if (p && Array.isArray(p.possiveis)) s.push(...p.possiveis);
  return s.filter((x) => N[x]);
};

function caminhoSemCaptura(N, entrada, alvo, capturas) {
  const visto = new Set();
  const fila = [[entrada, [entrada]]];
  while (fila.length) {
    const [id, hist] = fila.shift();
    if (id === alvo) return hist;
    if (visto.has(id)) continue;
    visto.add(id);
    for (const p of proximos(N, N[id])) {
      if (capturas.has(p) && p !== alvo) continue; // capturou: daqui o app sabe
      if (!visto.has(p)) fila.push([p, [...hist, p]]);
    }
  }
  return null;
}

const falhas = [];
let candidatas = 0;
const contagem = { nao_afirma: 0, afirmacao: 0 };

for (const arq of ARVORES) {
  const mod = require(path.join(tmp, arq.replace(/\.ts$/, ".js")));
  for (const arv of Object.values(mod)) {
    if (!arv || typeof arv !== "object" || !arv.nodes) continue;
    const N = arv.nodes;
    const capta = {};
    for (const [nome, re] of ACHADOS) {
      capta[nome] = new Set(Object.values(N).filter((n) => re.test(perguntaDeNo(n))).map((n) => n.id));
    }
    for (const n of Object.values(N)) {
      for (const [nome, re] of ACHADOS) {
        if (capta[nome].has(n.id)) continue;
        const frases = textoDeNo(n).filter((t) => re.test(t));
        if (!frases.length) continue;
        if (!caminhoSemCaptura(N, arv.entryNodeId, n.id, capta[nome])) continue;
        for (const f of frases) {
          candidatas++;
          const afirma = AFIRMA.some((re) => re.test(f)) && !GERAL.test(f);
          const natureza = afirma ? "afirmacao" : "nao_afirma";
          contagem[natureza]++;
          if (natureza === "afirmacao") {
            falhas.push(`${arq} · ${n.id} · [${nome}]\n        « ${f.slice(0, 160)} »`);
          }
        }
      }
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

console.log("\nNenhum nó afirma achado que ninguém perguntou\n");
console.log(`   ocorrências candidatas: ${candidatas}`);
console.log(`   ordem/critério/enunciado geral: ${contagem.nao_afirma} · AFIRMAÇÃO sobre este paciente: ${contagem.afirmacao}`);

if (falhas.length) {
  console.log(`\n❌ ${falhas.length} nó(s) AFIRMAM achado não capturado a montante:\n`);
  for (const f of falhas) console.log("   " + f);
  console.log(
    "\n   ⚠️ A correção é uma de duas, e o critério é o que já vale no app:\n" +
    "      · o achado MUDA o que se faz nos próximos minutos → vira PERGUNTA, com as três saídas;\n" +
    "      · não muda → a frase SAI. Texto condicional (\"se houver…\") é a poluição já reprovada.\n"
  );
  process.exit(1);
}
console.log("\n✅ nenhuma afirmação sobre achado não capturado\n");
