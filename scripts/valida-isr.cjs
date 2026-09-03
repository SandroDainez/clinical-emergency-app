/**
 *
 * PROMETE: que o derive do ISR, EXECUTADO, devolva as doses da publicação; que
 *   nenhum multiplicador esteja escrito à mão nele; que o import de MG_POR_KG não
 *   seja decorativo (provado por perturbação da fonte); e que o formatador
 *   mgPorKg() nunca seja interpolado dentro de frase traduzível.
 * NÃO PROMETE: que a prosa esteja unificada. As linhas que citam dose dentro de
 *   frase que o usuário lê CONTINUAM duplicadas e vigiadas por trava — contrato
 *   vigiado, não fonte única (R-25). O universo do contrato ENCOLHEU com a D-14,
 *   não fechou: o cálculo virou fonte real, a prosa não pode virar.
 * UNIVERSO: ISR e Sedoanalgesia para as doses; árvore INTEIRA para o teto da
 *   succinilcolina e para o veto do formatador.

 * ISR: a dose do instável tem UMA fonte, e a via acordada é caminho, não menção.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("node:path");
const { consomeConstante } = require("./lib/consumo.cjs");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const arvore = lerFonte(path.join(appDir, "rsi-decision-tree.ts"));
const sedacao = lerFonte(path.join(appDir, "sedation-engine.ts"));

{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p2)) raiz(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };

  let vistos = 0;
  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/doses-isr.ts") continue;
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    for (const linha of texto.split("\n")) {
      if (/^\s*\/\//.test(linha)) continue;
      if (!/succinilcolina/i.test(linha)) continue;
      if (!/succinilcolina[^"]{0,40}?\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*mg\/kg/i.test(linha)) continue;
      if (/(alternativa à|contraindicação à|em vez de|no lugar de|substitui)\s*succinilcolina/i.test(linha)) continue;
      vistos++;
      if (!/200\s*mg/.test(linha)) {
        falhas.push(`${rel}: prescreve succinilcolina por quilo sem o teto de 200 mg.`);
      }
    }
  }
  if (vistos < 1) falhas.push(`a varredura do teto da succinilcolina achou ${vistos} prescrições por quilo.`);
  else ok++;
}
const doses = lerFonte(path.join(appDir, "lib/doses-isr.ts"));

{
  const { execFileSync } = require("node:child_process");
  const os = require("node:os");
  const PUBLICADO = [
    ["etom", 0.3, "etomidato"],
    ["ketaInd", 1.5, "cetamina — indução no estável"],
    ["ketaShock", 1, "cetamina — instável"],
    ["ketaAsma", 2, "cetamina — asma"],
    ["propInd", 2, "propofol — estável"],
    ["propLow", 1, "propofol — dose reduzida"],
    ["succLow", 1, "succinilcolina — piso"],
    ["succHigh", 1.5, "succinilcolina — teto por quilo"],
    ["rocu", 1.2, "rocurônio"],
    ["sugam", 16, "sugamadex"],
    ["lido", 1.5, "lidocaína — pré-tratamento"],
  ];
  const PESO = 70;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "isr-derive-"));
  let compilou = true;
  try {
    execFileSync(
      "npx",
      ["tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--resolveJsonModule",
       "--esModuleInterop", "--moduleResolution", "node16", "--skipLibCheck", "--outDir", tmp,
       path.join(appDir, "rsi-decision-tree.ts")],
      { stdio: "pipe", cwd: appDir }
    );
  } catch (e) {
    compilou = false;
    falhas.push("rsi-decision-tree.ts não compila — a conferência do derive não rodou.");
  }

  if (compilou) {
    const modArvore = path.join(tmp, "rsi-decision-tree.js");
    const arvoreCompilada = require(modArvore);
    const def = arvoreCompilada.rsiDecisionTree || arvoreCompilada.default || arvoreCompilada;
    const derive = def.derive || (def.rsiDecisionTree && def.rsiDecisionTree.derive);

    if (typeof derive !== "function") {
      falhas.push("não consegui obter o derive do ISR — a conferência não rodou.");
    } else {
      const saida = derive({ peso: String(PESO) });
      for (const [campo, mult, nome] of PUBLICADO) {
        const esperado = campo === "sugam"
          ? String(Math.round(mult * PESO))
          : (Math.round(mult * PESO * 10) / 10).toString().replace(".", ",");
        const obtido = String(saida[campo]);
        if (obtido !== esperado) falhas.push(`derive do ISR · ${nome}: ${obtido} ≠ ${esperado}`);
        else ok++;
      }

      const compiladoFonte = path.join(tmp, "lib", "doses-isr.js");
      if (!fs.existsSync(compiladoFonte)) {
        falhas.push("lib/doses-isr.js não foi compilado junto — o teste de perturbação não rodou.");
      } else {
        const original = fs.readFileSync(compiladoFonte, "utf8");
        const perturbado = original.replace(/etomidato:\s*0\.3/, "etomidato: 9.9");
        if (perturbado === original) {
          falhas.push("não consegui perturbar o etomidato na fonte compilada — o teste de perturbação não rodou.");
        } else {
          fs.writeFileSync(compiladoFonte, perturbado);
          for (const k of Object.keys(require.cache)) delete require.cache[k];
          const reCarregado = require(modArvore);
          const def2 = reCarregado.rsiDecisionTree || reCarregado.default || reCarregado;
          const derive2 = def2.derive;
          const saida2 = derive2({ peso: String(PESO) });
          const esperadoPerturbado = (Math.round(9.9 * PESO * 10) / 10).toString().replace(".", ",");
          if (String(saida2.etom) !== esperadoPerturbado) falhas.push("o derive NÃO acompanhou a fonte perturbada.");
          else ok++;
          fs.writeFileSync(compiladoFonte, original);
        }
      }
    }
  }
}

// Contratos de consumo e vias clínicas essenciais.
if (!consomeConstante(arvore, "MG_POR_KG")) falhas.push("rsi-decision-tree.ts não consome MG_POR_KG."); else ok++;
if (!/via_dificil_estrategia/.test(arvore) || !/via_acordada/.test(arvore) || !/adiar_iot/.test(arvore)) {
  falhas.push("via acordada/deferimento deixaram de ser caminhos executáveis.");
} else ok++;
if (!/ISR_AJUSTE_NO_INSTAVEL/.test(arvore)) falhas.push("ISR perdeu a regra assimétrica de ajuste no instável."); else ok++;
if (!/0,5 mg\/kg se choque grave/.test(sedacao)) falhas.push("Sedoanalgesia perdeu a redução da cetamina no choque grave."); else ok++;
if (!/SUCCINILCOLINA_TETO_MG/.test(doses)) falhas.push("fonte de doses perdeu o teto da succinilcolina."); else ok++;

console.log("\nISR — dose do instável com fonte única, via acordada como caminho\n");
if (falhas.length) {
  for (const f of falhas) console.error(`❌ ${f}`);
  console.error(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} verificações — ISR estrutural e cálculo executável preservados\n`);
