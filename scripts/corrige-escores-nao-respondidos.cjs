const fs = require('fs');

const file = 'components/protocol-screen/clinical-calculators-screen.tsx';
let src = fs.readFileSync(file, 'utf8');

const oldHeader = `function ScoreView({ tool, scores, setScore }: { tool: ScoreTool; scores: Record<string, number>; setScore: (k: string, p: number) => void }) {\n  const tr = useTr();\n  const total = tool.vars.reduce((acc, v) => acc + (scores[\`${'${tool.id}.${v.id}'}\`] ?? v.options[0].points), 0);\n  const interp = tool.interpret(total);\n  const isToggle = tool.layout === "toggle";`;

const newHeader = `function ScoreView({ tool, scores, setScore }: { tool: ScoreTool; scores: Record<string, number>; setScore: (k: string, p: number) => void }) {\n  const tr = useTr();\n  const respondidos = tool.vars.filter((v) => scores[\`${'${tool.id}.${v.id}'}\`] !== undefined).length;\n  const completo = respondidos === tool.vars.length;\n  const total = completo\n    ? tool.vars.reduce((acc, v) => acc + scores[\`${'${tool.id}.${v.id}'}\`], 0)\n    : null;\n  const interp = total !== null ? tool.interpret(total) : null;\n  const isToggle = tool.layout === "toggle";`;

if (!src.includes(oldHeader)) throw new Error('cabeçalho antigo de ScoreView não encontrado');
src = src.replace(oldHeader, newHeader);

const oldResult = `      {/* Resultado no topo (fica visível ao rolar os itens) */}\n      <View style={[s.resultCard, { borderColor: TONE[interp.tone].border, backgroundColor: TONE[interp.tone].bg }]}>\n        <Text style={s.scoreTotalLabel}>{tr("PONTUAÇÃO")} ({tool.totalRange})</Text>\n        <Text style={[s.scoreTotal, { color: TONE[interp.tone].text }]}>{total.toString().replace(".", ",")}</Text>\n        <Text style={[s.scoreInterp, { color: TONE[interp.tone].text }]}>{tr(interp.label)}</Text>\n        {interp.lines?.map((l, i) => <Text key={i} style={s.scoreInterpLine}>{tr(l)}</Text>)}\n      </View>`;

const newResult = `      {/* Resultado só existe depois de TODAS as respostas explícitas. */}\n      {interp && total !== null ? (\n        <View style={[s.resultCard, { borderColor: TONE[interp.tone].border, backgroundColor: TONE[interp.tone].bg }]}>\n          <Text style={s.scoreTotalLabel}>{tr("PONTUAÇÃO")} ({tool.totalRange})</Text>\n          <Text style={[s.scoreTotal, { color: TONE[interp.tone].text }]}>{total.toString().replace(".", ",")}</Text>\n          <Text style={[s.scoreInterp, { color: TONE[interp.tone].text }]}>{tr(interp.label)}</Text>\n          {interp.lines?.map((l, i) => <Text key={i} style={s.scoreInterpLine}>{tr(l)}</Text>)}\n        </View>\n      ) : (\n        <View style={s.resultCard}>\n          <Text style={s.scoreTotalLabel}>{tr("PONTUAÇÃO")} ({tool.totalRange})</Text>\n          <Text style={s.scorePending}>{tr("Aguardando respostas")}</Text>\n          <Text style={s.scoreProgress}>{respondidos}/{tool.vars.length} {tr("itens respondidos")}</Text>\n        </View>\n      )}`;

if (!src.includes(oldResult)) throw new Error('resultado antigo de score não encontrado');
src = src.replace(oldResult, newResult);

const oldSel = `          const sel = scores[key] ?? v.options[0].points;`;
const newSel = `          const sel = scores[key];`;
if (!src.includes(oldSel)) throw new Error('seleção implícita antiga não encontrada');
src = src.replace(oldSel, newSel);

const oldActive = `                  const isActive = sel === o.points;`;
const newActive = `                  const isActive = sel !== undefined && sel === o.points;`;
if (!src.includes(oldActive)) throw new Error('estado ativo antigo não encontrado');
src = src.replace(oldActive, newActive);

const styleAnchor = `  scoreInterpLine: { fontSize: 12.5, color: "#cbd5e1", textAlign: "center", lineHeight: 18 },\n`;
if (!src.includes(styleAnchor)) throw new Error('âncora de estilos de score não encontrada');
src = src.replace(
  styleAnchor,
  `${styleAnchor}  scorePending: { fontSize: 18, fontWeight: "800", color: "#f1f5f9", textAlign: "center" },\n  scoreProgress: { fontSize: 12, fontWeight: "700", color: "#aab6c6", textAlign: "center" },\n`
);

const forbidden = [
  'scores[`${tool.id}.${v.id}`] ?? v.options[0].points',
  'const sel = scores[key] ?? v.options[0].points',
];
for (const pattern of forbidden) {
  if (src.includes(pattern)) throw new Error(`fallback de score ainda presente: ${pattern}`);
}
if (!src.includes('Aguardando respostas')) throw new Error('estado pendente não foi criado');

fs.writeFileSync(file, src);
console.log('✓ Escores exigem respostas explícitas antes de selecionar/interpretar');
