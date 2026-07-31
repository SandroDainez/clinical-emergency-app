/**
 * Trava das faixas de entrada dos campos numéricos.
 *
 * POR QUE ESTE SCRIPT EXISTE
 * --------------------------
 * A barra de arrastar dos campos numéricos tirava o mínimo e o máximo dos
 * PRESETS do próprio campo. Como preset é valor curado pelo protocolo (peso 50,
 * 60, 70, 80, 90, 100), a barra ia de 50 a 100 kg e o paciente de 45 ou de 120
 * ficava fora do alcance do controle rápido. O mesmo valia para PAS na sepse
 * (começava em 70), SpO₂ (parava em 98), glicemia no AVC (começava em 50) e
 * NIHSS (parava em 25, numa escala que vai a 42).
 *
 * O defeito era invisível: nada quebrava, nada dava erro, o app simplesmente
 * não deixava chegar no número. Só aparece quando alguém tenta usar.
 *
 * O QUE ESTE SCRIPT COBRA
 * -----------------------
 * 1. Todo campo numérico de fluxo tem faixa de entrada declarada. Sem isso o
 *    código volta a derivar dos presets — que é exatamente o defeito.
 * 2. Todo preset cabe dentro da faixa do seu campo. Preset fora da faixa seria
 *    um valor que o chip oferece e a barra não alcança.
 * 3. A unidade declarada na faixa bate com a do campo. Pega peso em libras,
 *    altura em metros e trocas parecidas.
 * 4. A faixa é mais larga que os presets. Se não for, ela não resolveu nada.
 *
 * O QUE ELE NÃO É
 * ---------------
 * As faixas são limites de ENTRADA, não de normalidade nem de gravidade. Este
 * script não afirma nada clínico: só garante que o médico consegue registrar o
 * paciente que tem na frente.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-faixas-"));

const arquivos = fs
  .readdirSync(appDir)
  .filter((f) => /-(decision-)?tree\.ts$/.test(f))
  .sort();

const faixasSrc = path.join(appDir, "lib", "faixas-de-entrada.ts");

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    faixasSrc,
    ...arquivos.map((f) => path.join(appDir, f)),
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const { FAIXA_DE_ENTRADA } = require(path.join(tempDir, "lib", "faixas-de-entrada.js"));

const falhas = [];
const linhas = [];
const vistos = new Map();

function numerico(v) {
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

for (const arquivo of arquivos) {
  const saida = path.join(tempDir, arquivo.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(saida)) continue;

  let mod;
  try {
    mod = require(saida);
  } catch {
    continue;
  }

  const arvores = Object.values(mod).filter(
    (v) => v && typeof v === "object" && v.nodes && v.entryNodeId
  );

  for (const arvore of arvores) {
    for (const no of Object.values(arvore.nodes)) {
      if (no.type !== "input" || !Array.isArray(no.fields)) continue;

      for (const campo of no.fields) {
        if (campo.customKeyboard !== "numeric") continue;

        const presets = (campo.presets || [])
          .map((p) => numerico(p.value))
          .filter((n) => n !== null);

        const faixa = FAIXA_DE_ENTRADA[campo.id];
        const onde = `${arquivo.replace(/\.ts$/, "")} · ${no.id} · ${campo.id}`;

        if (!faixa) {
          falhas.push(
            `❌ ${onde}\n   campo numérico SEM faixa de entrada declarada — a barra volta a herdar ` +
            `os limites dos presets (${presets.length ? `${Math.min(...presets)}–${Math.max(...presets)}` : "sem presets"}), ` +
            `que é o defeito que a tabela existe para corrigir.\n` +
            `   Acrescente "${campo.id}" em lib/faixas-de-entrada.ts.`
          );
          continue;
        }

        const unidadeCampo = campo.unit || "";
        if (unidadeCampo !== faixa.unidade) {
          falhas.push(
            `❌ ${onde}\n   unidade divergente — o campo usa "${unidadeCampo || "(nenhuma)"}" ` +
            `e a faixa declara "${faixa.unidade || "(nenhuma)"}".`
          );
        }

        const fora = presets.filter((n) => n < faixa.min || n > faixa.max);
        if (fora.length) {
          falhas.push(
            `❌ ${onde}\n   presets fora da faixa ${faixa.min}–${faixa.max}: ${fora.join(", ")}. ` +
            `O chip ofereceria um valor que a barra não alcança.`
          );
        }

        if (presets.length >= 2) {
          const pMin = Math.min(...presets);
          const pMax = Math.max(...presets);
          if (faixa.min >= pMin && faixa.max <= pMax) {
            falhas.push(
              `❌ ${onde}\n   a faixa ${faixa.min}–${faixa.max} não é mais larga que os presets ` +
              `${pMin}–${pMax} — não amplia nada.`
            );
          } else {
            const ganho = `${faixa.min}–${faixa.max} (presets ${pMin}–${pMax})`;
            if (!vistos.has(campo.id)) {
              vistos.set(campo.id, ganho);
              linhas.push(`✅ ${campo.id.padEnd(10)} ${faixa.unidade.padEnd(7)} ${ganho}`);
            }
          }
        }
      }
    }
  }
}

console.log("\nFaixas de entrada dos campos numéricos\n");
for (const l of linhas.sort()) console.log(l);
if (falhas.length) {
  console.log("");
  for (const f of falhas) console.log(f);
}

const declaradasSemUso = Object.keys(FAIXA_DE_ENTRADA).filter((k) => !vistos.has(k));
if (declaradasSemUso.length) {
  console.log(`\n⚠️  Declaradas e não usadas por nenhum campo: ${declaradasSemUso.join(", ")}`);
}

console.log(
  `\n${vistos.size} grandezas com faixa própria · ${falhas.length} falhas\n`
);

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
