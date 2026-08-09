/**
 * Drogas vasoativas: o atalho tem de descrever a bolsa que o app calcula, e a
 * ampola cadastrada tem de existir no Brasil.
 *
 * ── OS DOIS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ──────────────────────────────
 *
 * 1. A tela montava o preparo inicial de DUAS fontes: ampolas e diluente vinham
 *    da solução padrão, a apresentação vinha de `presentations[0]`. Na dopamina
 *    elas discordavam. O atalho "1600 mcg/mL" aparecia ACESO e a conta rodava
 *    com 816 mcg/mL — quase o dobro na taxa da bomba. Nada na tela denunciava,
 *    porque todos os números eram coerentes ENTRE SI: só não descreviam a mesma
 *    bolsa.
 *
 * 2. Essa dopamina tinha ampolas de 200 mg e 400 mg — o concentrado americano,
 *    40 mg/mL. A ampola brasileira é 5 mg/mL × 10 mL = 50 mg. Fator 8. Quem
 *    preparasse com a ampola que tem na mão receberia uma taxa oito vezes menor
 *    que a pretendida: subdose de vasopressor em choque.
 *
 *    O app já sabia a resposta certa — a tela de Farmacologia do ACLS traz
 *    "Dopamina — 50 mg / 10 mL". Duas telas, duas ampolas, mesma droga.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 *   A. Toda solução padrão: a concentração e o volume final ANUNCIADOS no
 *      rótulo do atalho batem com o que sai da aritmética do preparo.
 *   B. O estado inicial de cada droga reproduz exatamente a solução padrão que
 *      a tela exibe como ativa — o defeito 1 não pode voltar por outro caminho.
 *   C. Toda apresentação declara `fonte`. Sem fonte, ninguém conferiu a bula, e
 *      é assim que apresentação estrangeira entra: copiada de uma referência
 *      que não é a nossa.
 *
 * Este script FALHA O BUILD. Erro de bolsa é erro de dose.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-vasoativos-"));

// Um validador que MORRE não é um validador que aprova — mas foi assim que um
// script desta auditoria já produziu "0 falhas" com o processo caído. Aqui a
// falha de compilação é RELATADA e falha o build, nunca vira stack trace solto.
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
      "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
      "--outDir", tempDir,
      path.join(appDir, "vasoactive-engine.ts"),
    ],
    { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
  );
} catch {
  console.error(
    "\n❌ vasoactive-engine.ts não compila — a conferência das bolsas não chegou a rodar.\n" +
    "   (Apresentação sem `fonte` cai aqui: o campo é obrigatório no tipo.)\n"
  );
  fs.rmSync(tempDir, { recursive: true, force: true });
  process.exit(1);
}

const mod = require(path.join(tempDir, "vasoactive-engine.js"));
const { DRUGS, preparoDaSolucao, mesmoPreparo } = mod;

if (!Array.isArray(DRUGS) || !DRUGS.length) {
  console.error("DRUGS não foi exportado — a varredura não enxergaria nada.");
  process.exit(1);
}

const falhas = [];
let ok = 0;

/** Números com vírgula decimal e o menos tipográfico do texto clínico. */
function numero(bruto) {
  return Number(String(bruto).replace(/−/g, "-").replace(",", "."));
}

/**
 * O que o RÓTULO do atalho anuncia. O formato é
 *   "1000 mcg/mL • 5 amp + 200 mL → 250 mL final"
 * e o que interessa é o primeiro número (concentração) e o último (volume).
 */
function anunciadoNoRotulo(label) {
  const conc = label.match(/^\s*([\d.,]+)\s*(mcg\/mL|U\/mL|mg\/mL)/i);
  const vol = label.match(/→\s*([\d.,]+)\s*mL/i);
  return {
    concentracao: conc ? numero(conc[1]) : null,
    unidade: conc ? conc[2] : null,
    volumeFinal: vol ? numero(vol[1]) : null,
  };
}

/** A bolsa que a aritmética do app produz a partir de um preparo. */
function bolsaDoPreparo(drug, preparo) {
  const apresentacao = drug.presentations.find((p) => p.id === preparo.presentationId);
  if (!apresentacao) return null;
  const amp = numero(preparo.ampoules);
  const dil = numero(preparo.diluentMl);
  const volumeFinal = dil + amp * apresentacao.ampouleVolumeMl;
  if (!(volumeFinal > 0)) return null;
  return {
    volumeFinal,
    concentracao: (amp * apresentacao.basePerAmpoule) / volumeFinal,
    apresentacao,
  };
}

for (const drug of DRUGS) {
  // ── C. Toda apresentação tem fonte rastreável ─────────────────────────────
  for (const p of drug.presentations) {
    if (!p.fonte || !String(p.fonte).trim()) {
      falhas.push(
        `${drug.name} · apresentação "${p.id}" sem \`fonte\` — apresentação sem bula conferida ` +
        `é como a dopamina americana entrou no app.`
      );
    } else ok++;
  }

  for (const sol of drug.standardSolutions || []) {
    const preparo = preparoDaSolucao(sol);
    const bolsa = bolsaDoPreparo(drug, preparo);

    if (!bolsa) {
      falhas.push(`${drug.name} · atalho "${sol.id}" aponta para apresentação inexistente ou volume zero.`);
      continue;
    }

    const anunciado = anunciadoNoRotulo(sol.label);

    // ── A1. Concentração anunciada × concentração calculada ─────────────────
    if (anunciado.concentracao == null) {
      falhas.push(
        `${drug.name} · atalho "${sol.id}": o rótulo «${sol.label}» não anuncia concentração legível. ` +
        `Rótulo que não pode ser conferido não pode ser vigiado.`
      );
    } else if (Math.abs(anunciado.concentracao - bolsa.concentracao) > 1e-6) {
      falhas.push(
        `${drug.name} · atalho "${sol.id}": rótulo anuncia ${anunciado.concentracao} ${anunciado.unidade}, ` +
        `o preparo produz ${bolsa.concentracao} — o atalho descreve uma bolsa e o app calcula outra.`
      );
    } else ok++;

    // ── A2. Volume final anunciado × volume final calculado ─────────────────
    if (anunciado.volumeFinal == null) {
      falhas.push(`${drug.name} · atalho "${sol.id}": o rótulo não anuncia volume final ("→ N mL").`);
    } else if (Math.abs(anunciado.volumeFinal - bolsa.volumeFinal) > 1e-6) {
      falhas.push(
        `${drug.name} · atalho "${sol.id}": rótulo anuncia ${anunciado.volumeFinal} mL finais, ` +
        `o preparo produz ${bolsa.volumeFinal} mL.`
      );
    } else ok++;
  }

}

/**
 * ── B. NINGUÉM MONTA PREPARO CAMPO A CAMPO ───────────────────────────────────
 *
 * A primeira versão desta verificação comparava `preparoInicial(drug)` com
 * `preparoDaSolucao(primeiraSolucao)` — e os dois, depois da correção, saem da
 * MESMA função. A regra passava sempre, por construção. Era a quinta vez nesta
 * auditoria que eu escrevia uma regra incapaz de falhar, e regra assim é pior
 * que regra nenhuma: ocupa o lugar da proteção sem proteger.
 *
 * O que pode drift de verdade não é a aritmética — é alguém, daqui a um ano,
 * voltar a escrever `presentationId: algo` à mão num ponto novo da tela, que é
 * literalmente como o defeito da dopamina nasceu. Então é isso que se vigia, no
 * FONTE: o preparo entra no estado por espalhamento do objeto derivado, nunca
 * campo a campo.
 *
 * O único `presentationId:` literal autorizado é o do preparo manual em
 * `preparoInicial`, no motor — a droga sem atalho cadastrado precisa de um.
 */
const TELA = path.join(appDir, "components/protocol-screen/vasoactive-calculator-screen.tsx");
const fonteDaTela = fs.readFileSync(TELA, "utf8");
const semComentarios = fonteDaTela
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

const montagensManuais = (semComentarios.match(/\bpresentationId\s*:/g) || []).length;
if (montagensManuais > 0) {
  falhas.push(
    `vasoactive-calculator-screen.tsx atribui \`presentationId\` à mão (${montagensManuais}×). ` +
    `Preparo se deriva de \`preparoDaSolucao\`/\`preparoInicial\` e entra por espalhamento — ` +
    `montar campo a campo é exatamente como a apresentação da dopamina descolou do atalho.`
  );
} else ok++;

if (!/preparoDaSolucao/.test(semComentarios) || !/mesmoPreparo/.test(semComentarios)) {
  falhas.push(
    `vasoactive-calculator-screen.tsx deixou de usar a derivação compartilhada ` +
    `(\`preparoDaSolucao\` / \`mesmoPreparo\`) — a tela voltou a decidir preparo sozinha.`
  );
} else ok++;

console.log("\nDrogas vasoativas — atalho, bolsa e ampola\n");
for (const drug of DRUGS) {
  const sols = (drug.standardSolutions || []).length;
  console.log(`   ${drug.name.padEnd(16)} ${drug.presentations.length} apresentação(ões) · ${sols} atalho(s)`);
}

if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`\n✅ ${ok} verificações — todo atalho descreve a bolsa que o app calcula, toda ampola tem fonte\n`);
}

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
