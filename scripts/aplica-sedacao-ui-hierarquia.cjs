#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const rel = 'components/protocol-screen/sedation-calculator-screen.tsx';
const file = path.join(root, rel);
let src = fs.readFileSync(file, 'utf8');

function replaceOnce(label, before, after) {
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

replaceOnce('strategy-state',
'  const [showBnmRules, setShowBnmRules] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);',
'  const [showBnmRules, setShowBnmRules] = useState(false);\n  const [showStrategy, setShowStrategy] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);');

replaceOnce('reset-strategy-on-drug',
'    setSavedDilutions(getSavedDilutions(key));\n    setShowInfo(false);',
'    setSavedDilutions(getSavedDilutions(key));\n    setShowStrategy(false);\n    setShowInfo(false);');

replaceOnce('contextual-safety-copy',
'  const concLabel = drug.displayUnit === "mcg/mL"\n    ? `${fmt(concMcgPerMl, 2)} mcg/mL`\n    : `${fmt(concMgPerMl, concMgPerMl < 1 ? 2 : 1)} mg/mL`;\n\n  return (',
'  const concLabel = drug.displayUnit === "mcg/mL"\n    ? `${fmt(concMcgPerMl, 2)} mcg/mL`\n    : `${fmt(concMgPerMl, concMgPerMl < 1 ? 2 : 1)} mg/mL`;\n\n  const safetyLead = drug.group === "bnm"\n    ? "Garantir hipnose/sedação + analgesia antes do bloqueio"\n    : drug.group === "analgesia"\n      ? "Avaliar dor · titular ao efeito · usar analgesia multimodal"\n      : "Analgesia primeiro · definir RASS-alvo · sedação leve quando apropriada";\n  const safetyHint = drug.group === "bnm"\n    ? "Abrir segurança do BNM, monitorização, retirada e reversão"\n    : "Abrir princípios de segurança, delirium, monitorização e profundidade";\n\n  return (');

replaceOnce('principles-context',
'              <Text style={s.principlesLead}>{tr("Analgesia primeiro · definir RASS-alvo · sedação leve como padrão")}</Text>\n              <Text style={s.principlesHint}>{tr("Abrir princípios de segurança, delirium, monitorização e profundidade")}</Text>',
'              <Text style={s.principlesLead}>{tr(safetyLead)}</Text>\n              <Text style={s.principlesHint}>{tr(safetyHint)}</Text>');

replaceOnce('bnm-duplicate-lead',
'                  <Text style={s.principlesLead}>{tr("Sedação profunda + analgesia antes do bloqueio")}</Text>\n                  <Text style={s.principlesHint}>{tr("Abrir indicações, TOF, retirada e reversão")}</Text>',
'                  <Text style={s.principlesLead}>{tr("Indicação declarada · monitorização · plano de retirada")}</Text>\n                  <Text style={s.principlesHint}>{tr("Abrir critérios de uso, monitorização neuromuscular e reversão")}</Text>');

replaceOnce('strategy-collapsible',
'          {/* Estratégia */}\n          <View style={s.card}>\n            <Text style={s.cardLabel}>{tr("ESTRATÉGIA INICIAL")}</Text>\n            {drug.strategy.map((line) => (\n              <Text key={line} style={s.refLine}>• {tr(line)}</Text>\n            ))}\n          </View>',
'          {/* Estratégia clínica resumida: disponível sem empurrar o cálculo para baixo. */}\n          <Pressable style={s.strategySummary} onPress={() => setShowStrategy((v) => !v)}>\n            <View style={{ flex: 1, gap: 3 }}>\n              <Text style={s.cardLabel}>{tr("ESTRATÉGIA INICIAL")}</Text>\n              <Text style={s.strategyLead} numberOfLines={2}>{tr(drug.strategy[0] ?? "Abrir estratégia clínica")}</Text>\n            </View>\n            <Text style={s.principlesChevron}>{showStrategy ? "▲" : "▼"}</Text>\n          </Pressable>\n          {showStrategy ? (\n            <View style={s.card}>\n              {drug.strategy.map((line) => (\n                <Text key={line} style={s.refLine}>• {tr(line)}</Text>\n              ))}\n            </View>\n          ) : null}');

replaceOnce('strategy-styles',
'  principlesChevron: { fontSize: 14, fontWeight: "900", color: CV.cores.primary },\n\n  card:',
'  principlesChevron: { fontSize: 14, fontWeight: "900", color: CV.cores.primary },\n  strategySummary: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: CV.cores.border },\n  strategyLead: { fontSize: CV.tipo.label.fontSize, lineHeight: CV.tipo.body.lineHeight, fontWeight: "700", color: CV.cores.text },\n\n  card:');

fs.writeFileSync(file, src);

const translations = [
  ['Garantir hipnose/sedação + analgesia antes do bloqueio', 'Garantizar hipnosis/sedación + analgesia antes del bloqueo'],
  ['Avaliar dor · titular ao efeito · usar analgesia multimodal', 'Evaluar dolor · titular al efecto · usar analgesia multimodal'],
  ['Analgesia primeiro · definir RASS-alvo · sedação leve quando apropriada', 'Analgesia primero · definir RASS objetivo · sedación ligera cuando sea apropiada'],
  ['Abrir segurança do BNM, monitorização, retirada e reversão', 'Abrir seguridad del BNM, monitorización, retirada y reversión'],
  ['Indicação declarada · monitorização · plano de retirada', 'Indicación declarada · monitorización · plan de retirada'],
  ['Abrir critérios de uso, monitorização neuromuscular e reversão', 'Abrir criterios de uso, monitorización neuromuscular y reversión'],
  ['Abrir estratégia clínica', 'Abrir estrategia clínica'],
];
const i18nFile = path.join(root, 'lib/i18n/modules/sedacao.ts');
let i18n = fs.readFileSync(i18nFile, 'utf8');
for (const [pt, es] of translations) {
  if (i18n.includes(JSON.stringify(pt) + ':')) continue;
  const idx = i18n.lastIndexOf('\n};');
  if (idx === -1) throw new Error('Fechamento ES_SEDACAO não encontrado.');
  i18n = i18n.slice(0, idx) + `\n  ${JSON.stringify(pt)}: ${JSON.stringify(es)},` + i18n.slice(idx);
}
fs.writeFileSync(i18nFile, i18n);

console.log('✅ Sedoanalgesia UI: segurança contextual por grupo e estratégia inicial colapsável; cálculo sobe na hierarquia visual.');
