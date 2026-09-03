#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceRequired(file, from, to, label) {
  const full = path.join(root, file);
  let s = fs.readFileSync(full, 'utf8');
  if (!s.includes(from)) throw new Error(`Missing expected text (${label}) in ${file}`);
  s = s.replace(from, to);
  fs.writeFileSync(full, s);
}

replaceRequired(
  'lib/alvos-tce.ts',
  '  spo2: "≥ 90%",',
  '  /** ACS TBI Best Practices 2024: alvo inicial de oxigenação. */\n  spo2: "≥ 94%",',
  'SpO2 target'
);

replaceRequired(
  'lib/alvos-tce.ts',
  '  "Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos) · SpO₂ ≥ 90% · PaCO₂ 35–40 mmHg · normotermia (evitar febre) · normoglicemia · sódio normal-alto.";',
  '  "Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como alvo inicial) · PaCO₂ 35–40 mmHg na ausência de HIC · normotermia · glicemia 100–180 mg/dL · Na 135–145 mEq/L como alvo basal; evitar hiponatremia e não induzir hipernatremia profilática.";',
  'neuroprotection targets'
);

replaceRequired(
  'lib/alvos-tce.ts',
  '  "Metas mantidas: PIC < 22 mmHg, PPC 60–70 mmHg, PaCO₂ 35–40 mmHg, SpO₂ ≥ 90%, PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos), normotermia e normoglicemia.";',
  '  "Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg para 15–49 e >70 anos e ≥ 100 mmHg para 50–69 anos; normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.";',
  'ICU targets'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Repetir TC precocemente mesmo se a primeira foi normal.",',
  '        "TC normal não cria indicação automática de repetição apenas por anticoagulação/antiagregação. Repetir diante de deterioração neurológica ou quando houver lesão intracraniana conhecida, risco de progressão, intervenção planejada ou protocolo neurocirúrgico que exija documentação de estabilidade.",',
  'repeat CT after normal scan'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Antiagregante: transfusão de plaquetas NÃO é rotina (estudo PATCH mostrou pior desfecho na hemorragia espontânea) — reservar para neurocirurgia iminente, com discussão conjunta.",',
  '        "Antiagregante: transfusão de plaquetas NÃO é rotina no TCE. Em paciente sem procedimento invasivo planejado, não usar plaquetas ou desmopressina apenas para reverter antiagregação. Se houver neurocirurgia/EVD/monitor de PIC, considerar estratégia hemostática individualizada, idealmente com teste de função plaquetária quando disponível; desmopressina 0,4 mcg/kg IV pode ser considerada no contexto perioperatório, com vigilância de sódio.",',
  'antiplatelet reversal'
);

replaceRequired(
  'tce-decision-tree.ts',
  '        "Evitar hipo-osmolaridade; sódio sérico normal-alto conforme protocolo.",',
  '        "Evitar hiponatremia. Usar Na 135–145 mEq/L como alvo basal; durante terapia hiperosmolar, qualquer elevação deve ser terapêutica, transitória e guiada pela resposta/PIC e segurança — não perseguir hipernatremia profilática.",',
  'sodium target'
);

const i18nFile = path.join(root, 'lib/i18n/modules/tce.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
const anchor = '\n};\n';
if (!i18n.endsWith(anchor)) throw new Error('Unexpected tce i18n ending');
const entries = [
  ['Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 e > 70 anos; ≥ 100 para 50–69 anos) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como alvo inicial) · PaCO₂ 35–40 mmHg na ausência de HIC · normotermia · glicemia 100–180 mg/dL · Na 135–145 mEq/L como alvo basal; evitar hiponatremia e não induzir hipernatremia profilática.', 'Metas: PAS ≥ 110 mmHg (BTF: ≥ 110 para 15–49 y > 70 años; ≥ 100 para 50–69 años) · SpO₂ ≥ 94% (PaO₂ 80–100 mmHg como objetivo inicial) · PaCO₂ 35–40 mmHg en ausencia de HIC · normotermia · glucemia 100–180 mg/dL · Na 135–145 mEq/L como objetivo basal; evitar hiponatremia y no inducir hipernatremia profiláctica.'],
  ['Metas mantidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada pela autorregulação quando disponível; SpO₂ ≥ 94% e PaO₂ 80–100 mmHg como alvos iniciais; PaCO₂ 35–40 mmHg na ausência de HIC; PAS ≥ 110 mmHg para 15–49 e >70 anos e ≥ 100 mmHg para 50–69 anos; normotermia; glicemia 100–180 mg/dL; Na 135–145 mEq/L como alvo basal.', 'Metas mantenidas: PIC < 22 mmHg; PPC 60–70 mmHg, individualizada por la autorregulación cuando esté disponible; SpO₂ ≥ 94% y PaO₂ 80–100 mmHg como objetivos iniciales; PaCO₂ 35–40 mmHg en ausencia de HIC; PAS ≥ 110 mmHg para 15–49 y >70 años y ≥ 100 mmHg para 50–69 años; normotermia; glucemia 100–180 mg/dL; Na 135–145 mEq/L como objetivo basal.'],
  ['TC normal não cria indicação automática de repetição apenas por anticoagulação/antiagregação. Repetir diante de deterioração neurológica ou quando houver lesão intracraniana conhecida, risco de progressão, intervenção planejada ou protocolo neurocirúrgico que exija documentação de estabilidade.', 'Una TC normal no crea una indicación automática de repetición solo por anticoagulación/antiagregación. Repetir ante deterioro neurológico o cuando exista lesión intracraneal conocida, riesgo de progresión, intervención planificada o protocolo neuroquirúrgico que exija documentar estabilidad.'],
  ['Antiagregante: transfusão de plaquetas NÃO é rotina no TCE. Em paciente sem procedimento invasivo planejado, não usar plaquetas ou desmopressina apenas para reverter antiagregação. Se houver neurocirurgia/EVD/monitor de PIC, considerar estratégia hemostática individualizada, idealmente com teste de função plaquetária quando disponível; desmopressina 0,4 mcg/kg IV pode ser considerada no contexto perioperatório, com vigilância de sódio.', 'Antiagregante: la transfusión de plaquetas NO es rutinaria en el TCE. En pacientes sin procedimiento invasivo planificado, no usar plaquetas ni desmopresina solo para revertir la antiagregación. Si habrá neurocirugía/DVE/monitor de PIC, considerar una estrategia hemostática individualizada, idealmente con prueba de función plaquetaria cuando esté disponible; puede considerarse desmopresina 0,4 mcg/kg IV en el contexto perioperatorio, con vigilancia del sodio.'],
  ['Evitar hiponatremia. Usar Na 135–145 mEq/L como alvo basal; durante terapia hiperosmolar, qualquer elevação deve ser terapêutica, transitória e guiada pela resposta/PIC e segurança — não perseguir hipernatremia profilática.', 'Evitar hiponatremia. Usar Na 135–145 mEq/L como objetivo basal; durante la terapia hiperosmolar, cualquier elevación debe ser terapéutica, transitoria y guiada por la respuesta/PIC y la seguridad; no perseguir hipernatremia profiláctica.']
];
for (const [pt, es] of entries) {
  if (!i18n.includes(JSON.stringify(pt))) {
    i18n = i18n.slice(0, -anchor.length) + `  ${JSON.stringify(pt)}: ${JSON.stringify(es)},\n` + anchor;
  }
}
fs.writeFileSync(i18nFile, i18n);
console.log('✅ TCE v2: alvos ACS 2024, TC seriada, antiagregação e sódio atualizados preservando PAS estratificada.');
