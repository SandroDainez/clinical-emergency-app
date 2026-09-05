const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const arquivos = [
  "components/protocol-screen/ventilator-configurator-card.tsx",
  "components/protocol-screen/sedation-calculator-screen.tsx",
  "components/protocol-screen/vasoactive-calculator-screen.tsx",
];

const ler = (rel) => fs.readFileSync(path.join(raiz, rel), "utf8");
const falhas = [];

for (const rel of arquivos) {
  const fonte = ler(rel);
  if (/valor=\{Number\([^\n]+\)\s*\|\|\s*(70|170)\}/.test(fonte)) {
    falhas.push(`${rel}: NumericStepper ainda possui fallback clínico 70/170.`);
  }
  if (/barra parte de 70 kg/i.test(fonte)) {
    falhas.push(`${rel}: texto ainda normaliza 70 kg como ponto de partida visual.`);
  }
}

const vm = ler(arquivos[0]);
if (!/valor=\{alturaValida \? alturaNumerica : FAIXA_DE_ENTRADA\.altura\.min\}/.test(vm)) {
  falhas.push("VM: barra de altura não usa apenas o mínimo como origem visual neutra quando vazia.");
}
if (!/valorVisivel=\{alturaValida\}/.test(vm)) {
  falhas.push("VM: altura vazia deixou de permanecer visualmente não informada.");
}
if (!/testID="slider-altura"/.test(vm)) {
  falhas.push("VM: slider de altura canônico não está identificável.");
}
if (/vm-altura-presets/.test(vm)) {
  falhas.push("VM: presets numéricos de altura reapareceram junto da barra.");
}

const sed = ler(arquivos[1]);
if (!/valor=\{parsePt\(calc\.weightKg\) \?\? FAIXA_DE_ENTRADA\.peso\.min\}/.test(sed)) {
  falhas.push("Sedoanalgesia: peso vazio não usa origem visual neutra no mínimo da faixa.");
}
if (!/valorVisivel=\{parsePt\(calc\.weightKg\) !== null\}/.test(sed)) {
  falhas.push("Sedoanalgesia: peso vazio deixou de permanecer visualmente não informado.");
}
if (!/testID="slider-peso"/.test(sed)) {
  falhas.push("Sedoanalgesia: slider de peso canônico não está identificável.");
}

const vaso = ler(arquivos[2]);
if (!/valor=\{wt > 0 \? wt : FAIXA_DE_ENTRADA\.peso\.min\}/.test(vaso)) {
  falhas.push("Vasoativos: peso vazio não usa origem visual neutra no mínimo da faixa.");
}
if (!/valorVisivel=\{wt > 0\}/.test(vaso)) {
  falhas.push("Vasoativos: peso vazio deixou de permanecer visualmente não informado.");
}
if (!/Valor ainda não informado — toque na barra para definir/.test(vaso)) {
  falhas.push("Vasoativos: estado de peso ainda não informado perdeu explicação explícita.");
}

if (falhas.length) {
  console.error("\n❌ Regressão de valores clínicos fictícios:\n" + falhas.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}

console.log("✅ Altura/peso: barras neutras e visíveis sem fabricar valor clínico nas calculadoras especiais.");
