/**
 * valida-frase-composta.cjs — D-19
 *
 * PROMETE: que nenhuma frase de tela NOVA seja montada com template literal e
 *   `${}`. As 55 que já existem estão nomeadas como legado e o passivo é
 *   impresso a cada execução — a lista só encolhe.
 * NÃO PROMETE: que o VALOR interpolado esteja traduzido — ela vê a forma da
 *   frase, não o idioma do que entra nela. Quando {0} é uma frase (e não número
 *   ou nome de fármaco), o valor continua em português mesmo com a frase
 *   traduzida: é a D-20. Também não promete que as legadas estejam traduzidas. Elas NÃO estão: o usuário
 *   em espanhol lê português nas 55. Esta trava para o sangramento; a conversão
 *   é trabalho de bloco.
 * UNIVERSO: os arquivos de conteúdo (.ts/.tsx), fora scripts, e2e, locales e
 *   i18n. Erro de dev, telemetria e log ficam de fora — não são frase de tela.
 *
 * ── POR QUE O test:i18n NÃO PEGA ISTO ───────────────────────────────────────
 *
 * A varredura de tradução pula template literal com `${}` POR DESENHO. Uma
 * violação bem formada faz o `test:i18n` dizer `SEM TRADUÇÃO: 0` — silêncio
 * completo. E o mecanismo é direto: `tr(pt)` devolve `pt` inalterado quando não
 * há chave, e frase montada em runtime nunca é chave.
 *
 * ── COMO CORRIGIR ───────────────────────────────────────────────────────────
 *
 * A solução já existe no app: `lib/i18n/trf.ts`. A chave passa a ser a frase com
 * marcadores e os valores entram DEPOIS da tradução:
 *
 *   ❌ `Dose sugerida: ${dose} mEq de KCl (${ml} mL).`
 *   ✅ trf(tr, "Dose sugerida: {0} mEq de KCl ({1} mL).", [dose, ml])
 *
 * Já é usada em 60 lugares. As 55 são as que ficaram para trás.
 *
 * ── A CHAVE É A FRASE, NÃO A LINHA ──────────────────────────────────────────
 *
 * Número de linha muda a cada edição e transformaria a lista em ruído. A
 * assinatura é `arquivo :: frase com {} no lugar da interpolação`, então mover
 * código não mexe na lista — e mudar a FRASE tira o item dela, que é
 * exatamente quando se quer reexaminar.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const PT = /[áàâãéêíóôõúç]|\b(de|do|da|em|para|com|não|por|que|uma|dose|paciente)\b/i;
/**
 * Erro de validação, telemetria e log NÃO são frase de tela.
 *
 * `issues.push` entrou depois: o validador da árvore acumula
 * DecisionTreeValidationIssue e o construtor os transforma em Error. São
 * mensagens para quem escreve árvore, não para quem atende paciente — e a trava
 * as acusou como texto de tela quando o cronômetro em árvore foi escrito.
 */
const DEV = /throw |new Error\(|console\.|assert|telemetr|errors\.push|issues\.push|message: `/;
/** Posições em que uma string vira texto que o usuário lê. */
const CONTEUDO =
  /^\s*(label|title|summary|text|value|helperText|question|body|message|speak|rationale|impact)\s*:|feedback\.push|lines:|actions:|return `/;

/**
 * As frases que JÁ existiam quando esta trava nasceu.
 *
 * ⚠️ AS 19 PRIMEIRAS SÃO DE RISCO CLÍNICO MAIOR e convertem antes das outras,
 * independentemente do módulo. A razão é linguística: português e espanhol são
 * próximos o bastante para que número, unidade e nome de fármaco sobrevivam à
 * leitura aproximada. O que NÃO sobrevive é negação, condicional e advérbio de
 * tempo — "não", "se", "antes de", "a cada". É aí que a leitura por semelhança
 * falha, e é aí que estão as instruções que mudam conduta.
 */
const LEGADO = new Set([
  // As 19 de RISCO CLÍNICO (negação, condicional, ordem) já foram CONVERTIDAS
  // para trf — saíram desta lista. Ficam as 35 puramente descritivas, que vão
  // por módulo junto com a Fase 2.
  "acls/case-log-evaluation.ts :: Primeira epinefrina em {}.",
  "acls/case-log-evaluation.ts :: Duração média dos ciclos em {}.",
  "acls/case-log-evaluation.ts :: Checagens de ritmo registradas: {}.",
  "clinical-calculators-engine.ts :: HEART {} — risco intermediário (MACE 16,6%)",
  "components/clinical-session-history.tsx :: Encerrado em {}",
  "components/protocol-screen/electrolyte-calculator-screen.tsx :: {} ({} mL de {})",
  "coronary/calculators.ts :: Dose em bolus único: {} mg",
  "coronary/calculators.ts :: Bolus: {} U IV",
  "coronary/calculators.ts :: Infusão: {} U/h",
  "coronary-syndromes-engine.ts :: <!doctype html><html><head><meta charset=\"utf-8\"/><title>Síndromes Cor",
  "vasoactive-engine.ts :: Qual solução deseja usar para {}?",
  "vasoactive-engine.ts :: Selecionar solução para {}",
  "vasoactive-engine.ts :: Definir modo de cálculo para {}",
  "vasoactive-engine.ts :: Revisar conduta para {}",
  "vasoactive-engine.ts :: Revisar conduta para {}",
  "vasoactive-engine.ts :: Ajustar dose de {} conforme perfusão",
]);

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n|__tests__/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

const encontradas = new Set();
let arquivos = 0;

for (const arquivo of fontes(appDir)) {
  const rel = path.relative(appDir, arquivo);
  const texto = fs.readFileSync(arquivo, "utf8").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  arquivos++;
  texto.split("\n").forEach((linha, i) => {
    if (/^\s*\/\//.test(linha) || DEV.test(linha) || !CONTEUDO.test(linha)) return;
    for (const m of linha.matchAll(/`(?:[^`\\]|\\.)*`/g)) {
      const tl = m[0];
      // `continue`, não `return`: dentro de um forEach, `return` abandona a
      // LINHA inteira e some com os literais seguintes dela. A primeira versão
      // contava 53 de 55 por isso — subcontagem silenciosa, que é o modo de
      // falha que ninguém investiga (R-15 item 10).
      if (!tl.includes("${")) continue;
      const comMarca = tl.replace(/\$\{[^}]*\}/g, "{}");
      if (!PT.test(comMarca.replace(/\{\}/g, " "))) continue;
      const assinatura = `${rel} :: ${comMarca.slice(1, -1).replace(/\s+/g, " ").trim().slice(0, 70)}`;
      encontradas.add(assinatura);
      if (!LEGADO.has(assinatura)) {
        falhas.push(
          `${rel}:${i + 1} — frase de tela NOVA montada com template literal.\n` +
          `    «${comMarca.slice(1, -1).trim().slice(0, 95)}»\n` +
          `    O usuário em espanhol lerá isto em PORTUGUÊS: frase montada em runtime nunca vira\n` +
          `    chave de dicionário. Use trf(tr, "…{0}…", [valor]) — lib/i18n/trf.ts.`
        );
      }
    }
  });
}

if (arquivos < 100) {
  falhas.push(`a varredura leu só ${arquivos} arquivos — universo pequeno demais para valer como trava.`);
} else ok++;

const convertidas = [...LEGADO].filter((k) => !encontradas.has(k));

console.log(`\nFrase de tela composta com template literal — o que sai da tradução (D-19)\n`);
console.log(
  `PASSIVO: ${encontradas.size} frase(s) que o usuário em espanhol lê EM PORTUGUÊS.\n` +
  `         Esta trava NÃO as corrige — impede a próxima.\n`
);
if (convertidas.length) {
  console.log(`✅ ${convertidas.length} frase(s) saíram do legado desde a última vez:`);
  for (const c of convertidas) console.log(`     ${c.slice(0, 110)}`);
  console.log(`   Tire-as de LEGADO nesta trava — a lista só encolhe.\n`);
}

if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} frase(s) nova(s) fora da tradução · passivo de ${encontradas.size}\n`);
  process.exit(1);
}
console.log(`✅ nenhuma frase composta NOVA · passivo legado de ${encontradas.size} declarado\n`);
