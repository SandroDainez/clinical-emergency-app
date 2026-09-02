#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const parentPath = path.join(root, "components/protocol-screen.tsx");
const screenPath = path.join(root, "components/protocol-screen/acls-protocol-screen.tsx");

let parent = fs.readFileSync(parentPath, "utf8");
let screen = fs.readFileSync(screenPath, "utf8");
const parentOriginal = parent;
const screenOriginal = screen;

function replaceOnce(source, from, to, label) {
  const first = source.indexOf(from);
  if (first < 0) throw new Error(`Contexto não encontrado para ${label}`);
  if (source.indexOf(from, first + from.length) >= 0) throw new Error(`Contexto duplicado para ${label}`);
  return source.replace(from, to);
}

if (!parent.includes('consumePcrInheritedContext')) {
  parent = replaceOnce(
    parent,
    'import { openClinicalModule } from "../lib/open-clinical-module";\n',
    'import { openClinicalModule } from "../lib/open-clinical-module";\nimport { consumePcrInheritedContext } from "../lib/pcr-inherited-context-runtime";\n',
    "import do runtime de contexto herdado"
  );
}

if (!parent.includes('const [pcrInheritedContext]')) {
  parent = replaceOnce(
    parent,
    '  const router = useRouter();\n',
    '  const router = useRouter();\n  const [pcrInheritedContext] = useState(() =>\n    engine.getEncounterSummary().protocolId === "pcr_adulto"\n      ? consumePcrInheritedContext()\n      : undefined\n  );\n',
    "consumo único do contexto herdado"
  );
}

if (!parent.includes('inheritedContext={pcrInheritedContext}')) {
  parent = replaceOnce(
    parent,
    '            encounterSummary={encounterSummary}\n',
    '            encounterSummary={encounterSummary}\n            inheritedContext={pcrInheritedContext}\n',
    "prop inheritedContext"
  );
}

if (!screen.includes('PcrInheritedContextCard')) {
  screen = replaceOnce(
    screen,
    'import CprGuidanceCard, { textoDaTrocaDeCompressor } from "./cpr-guidance-card";\n',
    'import CprGuidanceCard, { textoDaTrocaDeCompressor } from "./cpr-guidance-card";\nimport PcrInheritedContextCard from "./pcr-inherited-context-card";\nimport type { PcrInheritedContextViewModel } from "../../lib/pcr-handoff-context-adapter";\n',
    "imports do card herdado"
  );
}

if (!screen.includes('inheritedContext?: PcrInheritedContextViewModel;')) {
  screen = replaceOnce(
    screen,
    '  encounterSummary: EncounterSummary;\n',
    '  encounterSummary: EncounterSummary;\n  inheritedContext?: PcrInheritedContextViewModel;\n',
    "tipo da prop herdada"
  );
}

if (!screen.includes('  inheritedContext,\n  options,')) {
  screen = replaceOnce(
    screen,
    '  encounterSummary,\n  options,\n',
    '  encounterSummary,\n  inheritedContext,\n  options,\n',
    "desestruturação da prop herdada"
  );
}

if (!screen.includes('<PcrInheritedContextCard model={inheritedContext} />')) {
  const anchor = `        {painelEmV2 ? null : (\n        <ModuleFlowHero`;
  const insertion = `        {inheritedContext ? <PcrInheritedContextCard model={inheritedContext} /> : null}\n\n${anchor}`;
  screen = replaceOnce(screen, anchor, insertion, "render do card herdado");
}

const invariants = [
  [parent, 'consumePcrInheritedContext()', "parent não consome contexto"],
  [parent, 'protocolId === "pcr_adulto"', "consumo não está restrito ao PCR"],
  [parent, 'inheritedContext={pcrInheritedContext}', "parent não passa prop"],
  [screen, 'inheritedContext?: PcrInheritedContextViewModel;', "prop não é opcional"],
  [screen, '<PcrInheritedContextCard model={inheritedContext} />', "card não renderiza"],
];
for (const [source, token, message] of invariants) {
  if (!source.includes(token)) throw new Error(message);
}

if (parent === parentOriginal && screen === screenOriginal) {
  console.log("Integração do contexto herdado do PCR já aplicada; nenhuma alteração necessária.");
  process.exit(0);
}

fs.writeFileSync(parentPath, parent, "utf8");
fs.writeFileSync(screenPath, screen, "utf8");
console.log("Contexto herdado do PCR integrado de forma opcional e informativa.");
