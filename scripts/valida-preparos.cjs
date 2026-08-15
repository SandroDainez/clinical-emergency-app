/**
 * valida-preparos.cjs — preparo escrito FORA do dono (R-46)
 *
 * PROMETE: que nenhuma DILUIÇÃO de fármaco vasoativo seja declarada fora de
 *   `vasoactive-engine.ts`, que é o dono das soluções padrão. Sítio que precisa
 *   ensinar preparo aponta para lá ou consome de lá — não escreve o seu.
 * NÃO PROMETE: que as diluições do DONO estejam certas — isso é
 *   `test:vasoativos`, que confere preparo contra rótulo DENTRO do módulo.
 *   Também não cobre diluição de fármaco não-vasoativo (antibiótico,
 *   anticonvulsivante), que tem donos próprios ainda não unificados.
 * UNIVERSO: toda a árvore .ts/.tsx de conteúdo, fora do dono, scripts e i18n.
 *
 * ── POR QUE ESTA TRAVA EXISTE (R-46) ────────────────────────────────────────
 *
 * A auditoria corrigiu a dopamina no lugar onde o número é CALCULADO
 * (vasoactive-engine) e não onde ele é ENSINADO (o card de Farmacologia, que
 * seguiu mandando preparar "200 mg em 250 mL" — a apresentação AMERICANA).
 * Ninguém notou porque `test:vasoativos` vigiava o dono, e o dono estava certo.
 *
 * A varredura que encontrou isso achou o mesmo defeito na dobutamina: o EAP
 * ensinava 1000 mcg/mL, uma concentração que NÃO EXISTE na tabela do dono
 * (2000 e 4000). Programar a bomba pela tabela errada erra por fator 2 ou 4.
 *
 * `test:vasoativos` olha para DENTRO. Esta olha para FORA.
 */

const fs = require("node:fs");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const DONO = "vasoactive-engine.ts";
const falhas = [];
let ok = 0;

const FARMACOS = [
  "dopamina", "dobutamina", "noradrenalina", "norepinefrina",
  "adrenalina", "epinefrina", "nitroglicerina", "nitroprussiato",
  "vasopressina", "milrinona", "levosimendan",
];

// Preparo = massa + volume na mesma frase, ou concentração final declarada.
// ⚠️ mcg/kg/min é DOSE, não preparo — e o regex ingênuo de mcg/mL casa com
// ele. A distinção é a barra seguinte: concentração termina em /mL; dose
// continua em /kg/min. Falso positivo já cometido aqui (R-20: trava que acusa
// inocente é pior que trava que não existe).
const PREPARO = /(\d[\d.,]*)\s*(mg|g|mcg|UI)\s*(?:em|\+)\s*(\d[\d.,]*)\s*mL|(\d[\d.,]*)\s*mcg\/mL(?!\/)/i;

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|scripts|e2e|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

let vistos = 0;
for (const arquivo of fontes(appDir)) {
  const rel = path.relative(appDir, arquivo);
  if (rel === DONO) continue;
  const texto = fs.readFileSync(arquivo, "utf8");
  vistos++;
  texto.split("\n").forEach((linha, i) => {
    // comentários explicam o defeito — não podem ser acusados por citá-lo (R-21
    // pela porta dos fundos: a trava proibiria a própria documentação dela).
    if (/^\s*(\/\/|\*|\/\*)/.test(linha)) return;
    const l = linha.toLowerCase();
    const farmaco = FARMACOS.find((f) => l.includes(f));
    if (!farmaco) return;
    if (!PREPARO.test(linha)) return;
    // Apontar para o dono é o comportamento CERTO — e a linha que aponta cita
    // os números de lá para o médico não precisar navegar. Isso é consumo, não
    // preparo próprio.
    if (/m[óo]dulo Drogas Vasoativas|solu[çc][õo]es padr[ãa]o do m[óo]dulo|standardSolutions/i.test(linha)) return;
    // Apresentação de ampola (o que VEM no frasco) é outra categoria, coberta
    // pela D-4 — aqui só entra o que se FAZ com ela.
    if (/ampola\s+\d|amp\s+\d|\bfrasco\b|genericName/i.test(linha)) return;
    // DILUIÇÃO DE BOLUS ≠ PREPARO DE BOMBA. Converter a ampola 1:1.000 em
    // 1:10.000 (1 mL + 9 mL) é manobra de seringa para dose única, não solução
    // de infusão — não pertence à tabela de soluções padrão e não pode ser
    // acusada por ela.
    if (/1:10\.?000|1:1\.?000/.test(linha)) return;
    falhas.push(
      `${rel}:${i + 1} — preparo de ${farmaco.toUpperCase()} escrito fora do dono:\n` +
      `    «${linha.trim().slice(0, 100)}»\n` +
      `    As soluções padrão vivem em ${DONO}. Duas concentrações do mesmo fármaco no app é erro de bomba.`
    );
  });
}
if (vistos < 100) falhas.push(`a varredura leu só ${vistos} arquivos — universo pequeno demais.`);
else ok++;

console.log(`\nPreparos — diluição declarada fora do módulo dono (R-46)\n`);
console.log(`   ${vistos} arquivos varridos\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ nenhuma diluição de vasoativo escrita fora de ${DONO}\n`);
