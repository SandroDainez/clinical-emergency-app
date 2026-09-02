const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "..");
const ler = (rel) => fs.readFileSync(path.join(raiz, rel), "utf8");

const field = ler("components/protocol-screen/clinical-input-field.tsx");
const adapter = ler("components/protocol-screen/clinical-input-step-adapter.tsx");
const calc = ler("components/protocol-screen/calculadora-embutida.tsx");
const avc = ler("avc-decision-tree.ts");
const calcEngine = ler("clinical-calculators-engine.ts");
const shell = ler("components/protocol-screen/acls-decision-flow-screen.tsx");

const falhas = [];
const exigir = (ok, msg) => { if (!ok) falhas.push(msg); };

// Nenhuma medida clínica ausente pode ser apresentada como número escolhido.
exigir(!/\(numericRange\.min\s*\+\s*numericRange\.max\)\s*\/\s*2/.test(field),
  "Campo numérico V2 voltou a inventar ponto médio quando não há dado.");
exigir(/Valor ainda não informado/.test(field),
  "Campo numérico vazio deixou de sinalizar explicitamente ausência de dado.");
exigir(/hasNumericValue\s*\?\s*\(/.test(field),
  "NumericStepper deixou de depender da existência de um valor real.");
exigir(!/useEffect\([\s\S]{0,300}onChange\(/.test(field),
  "Campo numérico parece gravar valor automaticamente.");

// NIHSS precisa existir na árvore, no registro e na apresentação embutida.
exigir(/calculadora:\s*["']nihss["']/.test(avc),
  "O campo NIHSS deixou de declarar a calculadora embutida.");
exigir(/id:\s*["']nihss["']/.test(calcEngine),
  "A calculadora NIHSS saiu do registro canônico.");
exigir(/field\.calculadora\s*\?/.test(adapter) && /calculadoraId=\{field\.calculadora\}/.test(adapter),
  "O InputStep deixou de renderizar a calculadora declarada pelo campo.");
exigir(/useState\(calculadoraId === ["']nihss["']\)/.test(calc),
  "NIHSS deixou de abrir sua calculadora por padrão.");

// Em passo > 1, Voltar retorna no algoritmo; só sai do módulo no primeiro passo.
exigir((shell.match(/engine\.canGoBack\(\) \? handleBack\(\) : router\.back\(\)/g) || []).length === 2,
  "Os cabeçalhos não estão usando histórico interno antes de router.back().");

if (falhas.length) {
  console.error("\n❌ Trava de segurança de inputs/Voltar/NIHSS falhou\n");
  for (const f of falhas) console.error(`- ${f}`);
  process.exit(1);
}

console.log("✅ Segurança de inputs, Voltar e NIHSS preservada.");
console.log("   • valor ausente continua ausente");
console.log("   • NIHSS mantém calculadora embutida e visível");
console.log("   • Voltar usa histórico clínico antes de sair do módulo");
