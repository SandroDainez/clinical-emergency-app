const fs = require('node:fs');
const path = require('node:path');

function patch(rel, replacements) {
  const file = path.resolve(__dirname, '..', rel);
  let src = fs.readFileSync(file, 'utf8');
  for (const [oldText, newText, label] of replacements) {
    if (!src.includes(oldText)) throw new Error(`${rel} · ${label}: trecho esperado não encontrado`);
    src = src.replace(oldText, newText);
  }
  fs.writeFileSync(file, src);
}

patch('components/protocol-screen/pcr-inherited-context-card.tsx', [
  [
    'import { useEstilosDoTema, type Tema } from "../../design-system/theme";',
    'import { useEstilosDoTema, type Tema } from "../../design-system/theme";\nimport { tr } from "../../lib/i18n";\nimport { trf } from "../../lib/i18n/trf";',
    'imports i18n',
  ],
  ['  if (minutes < 60) return `há ${minutes} min`;', '  if (minutes < 60) return trf(tr, "há {0} min", [minutes]);', 'minutos'],
  ['  return remainder ? `há ${hours} h ${remainder} min` : `há ${hours} h`;', '  return remainder\n    ? trf(tr, "há {0} h {1} min", [hours, remainder])\n    : trf(tr, "há {0} h", [hours]);', 'horas'],
]);

patch('lib/clinical-reassessment-runtime.ts', [
  [
    'import { getCriticalTherapyReassessmentRule } from "./clinical-reassessment-policy";',
    'import { getCriticalTherapyReassessmentRule } from "./clinical-reassessment-policy";\nimport { tr } from "./i18n";\nimport { trf } from "./i18n/trf";',
    'imports i18n',
  ],
  ['    label: `Reavaliação após ${item.therapyId}`,', '    label: trf(tr, "Reavaliação após {0}", [item.therapyId]),', 'label reavaliação'],
]);

patch('lib/clinical-safety-override.ts', [
  [
    'import { appendClinicalEvent } from "./clinical-event-log";',
    'import { appendClinicalEvent } from "./clinical-event-log";\nimport { tr } from "./i18n";\nimport { trf } from "./i18n/trf";',
    'imports i18n',
  ],
  ['    label: `Override de segurança: ${input.gateId}`,', '    label: trf(tr, "Override de segurança: {0}", [input.gateId]),', 'label override'],
]);

patch('lib/clinical-shell-adapter.ts', [
  [
    '        title: rule?.label ? `Reavaliar após ${rule.label}` : `Reavaliar após ${oldest.therapyId}`,',
    '        title: trf(tr, "Reavaliar após {0}", [rule?.label ?? oldest.therapyId]),',
    'título reavaliação',
  ],
]);

// clinical-shell-adapter já usa o i18n? Se não, acrescenta imports sem duplicar.
{
  const file = path.resolve(__dirname, '..', 'lib', 'clinical-shell-adapter.ts');
  let src = fs.readFileSync(file, 'utf8');
  if (!src.includes('from "./i18n/trf"')) {
    const firstImport = src.match(/^import[^\n]+\n/);
    if (!firstImport) throw new Error('clinical-shell-adapter: primeiro import não encontrado');
    src = src.replace(firstImport[0], `${firstImport[0]}import { tr } from "./i18n";\nimport { trf } from "./i18n/trf";\n`);
    fs.writeFileSync(file, src);
  }
}

// Chaves-template usadas por trf: a tradução ocorre ANTES da interpolação.
{
  const file = path.resolve(__dirname, '..', 'lib', 'i18n', 'modules', 'pr18-convergence.ts');
  let src = fs.readFileSync(file, 'utf8');
  const additions = {
    'há {0} min': 'hace {0} min',
    'há {0} h {1} min': 'hace {0} h {1} min',
    'há {0} h': 'hace {0} h',
    'Reavaliação após {0}': 'Reevaluación después de {0}',
    'Override de segurança: {0}': 'Excepción de seguridad: {0}',
    'Reavaliar após {0}': 'Reevaluar después de {0}',
  };
  for (const [pt, es] of Object.entries(additions)) {
    const key = `  ${JSON.stringify(pt)}:`;
    if (src.includes(key)) continue;
    const close = src.lastIndexOf('\n};');
    if (close < 0) throw new Error('pr18-convergence: fechamento do dicionário não encontrado');
    src = `${src.slice(0, close)}\n  ${JSON.stringify(pt)}: ${JSON.stringify(es)},${src.slice(close)}`;
  }
  fs.writeFileSync(file, src);
}

console.log('Frases compostas novas migradas para trf + chaves ES.');
