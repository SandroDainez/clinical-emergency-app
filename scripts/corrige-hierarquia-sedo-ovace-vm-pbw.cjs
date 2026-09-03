const fs = require('fs');

function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, src) { fs.writeFileSync(file, src); }
function replaceOnce(src, before, after, label) {
  if (!src.includes(before)) throw new Error(`âncora ausente: ${label}`);
  const out = src.replace(before, after);
  if (out === src) throw new Error(`substituição sem efeito: ${label}`);
  return out;
}

// 1) Peso corporal predito: nome global não deve sugerir uso exclusivo em VM.
{
  const file = 'clinical-calculators-engine.ts';
  let src = read(file);
  src = replaceOnce(src,
    'name: "Peso predito (VM)",\n    subtitle: "Volume corrente protetor — ARDSNet",',
    'name: "Peso corporal predito",\n    subtitle: "Estimativa antropométrica pela altura e sexo — usada na ventilação e em outras aplicações clínicas",',
    'nome do peso corporal predito'
  );
  write(file, src);
}

// 2) VM: o configurador é ferramenta auxiliar; não pode dominar a abertura do algoritmo.
{
  const file = 'components/protocol-screen/ventilator-configurator-card.tsx';
  let src = read(file);
  src = replaceOnce(src,
    'const [expanded, setExpanded] = useState(true);',
    'const [expanded, setExpanded] = useState(false);',
    'configurador recolhido por padrão'
  );
  src = src.replaceAll('tr("Peso predito → VC, PEEP e FR iniciais")', 'tr("Altura + sexo → peso corporal predito + parâmetros iniciais")');
  src = src.replaceAll('tr("Peso predito")', 'tr("Peso corporal predito")');
  src = src.replaceAll('tr("Informe altura e sexo para calcular o peso predito e os parâmetros iniciais.")', 'tr("Informe altura e sexo para calcular o peso corporal predito e, a partir dele, os parâmetros ventilatórios iniciais.")');
  write(file, src);
}
{
  const file = 'components/protocol-screen/ventilation-flow-screen.tsx';
  let src = read(file);
  src = src.replace('cálculo do peso predito (pela altura — define o volume corrente protetor)', 'cálculo do peso corporal predito pela altura e sexo para orientar o volume corrente protetor');
  write(file, src);
}

// 3) Sedoanalgesia: princípios e regras extensas deixam de competir com a tarefa atual.
{
  const file = 'components/protocol-screen/sedation-calculator-screen.tsx';
  let src = read(file);
  src = replaceOnce(src,
    'const [showInfo, setShowInfo] = useState(false);\n  const [showRef, setShowRef] = useState(false);',
    'const [showPrinciples, setShowPrinciples] = useState(false);\n  const [showBnmRules, setShowBnmRules] = useState(false);\n  const [showInfo, setShowInfo] = useState(false);\n  const [showRef, setShowRef] = useState(false);',
    'estados de expansão da sedoanalgesia'
  );

  const old = `          {/* Princípios da analgo-sedação — vale para todos os fármacos */}\n          <View style={s.card}>\n            <Text style={s.cardLabel}>{tr("ANTES DA DOSE — PRINCÍPIOS")}</Text>\n            {PRINCIPIOS_ANALGOSEDACAO.map((linha) => (\n              <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>\n            ))}\n          </View>\n\n          {/* Cabeçalho do fármaco */}\n          <View style={s.drugHeader}>\n            <Text style={s.drugName}>{drug.emoji} {tr(drug.name)}</Text>\n            <Text style={s.drugClass}>{tr(drug.className)}</Text>\n          </View>\n\n          {/* Regras do BNM — só no grupo de bloqueadores */}\n          {drug.group === "bnm" && (\n            <View style={s.card}>\n              <Text style={s.cardLabel}>{tr("BLOQUEIO NEUROMUSCULAR — REGRAS E REVERSÃO")}</Text>\n              {REGRAS_BNM.map((linha) => (\n                <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>\n              ))}\n            </View>\n          )}`;

  const neu = `          {/* A tarefa atual vem primeiro: qual fármaco está sendo calculado. */}\n          <View style={s.drugHeader}>\n            <Text style={s.drugName}>{drug.emoji} {tr(drug.name)}</Text>\n            <Text style={s.drugClass}>{tr(drug.className)}</Text>\n          </View>\n\n          {/* Princípios universais ficam disponíveis sem virar uma parede de texto. */}\n          <Pressable style={s.principlesSummary} onPress={() => setShowPrinciples((v) => !v)}>\n            <View style={{ flex: 1, gap: 3 }}>\n              <Text style={s.cardLabel}>{tr("ANTES DA DOSE")}</Text>\n              <Text style={s.principlesLead}>{tr("Analgesia primeiro · definir RASS-alvo · sedação leve como padrão")}</Text>\n              <Text style={s.principlesHint}>{tr("Abrir princípios de segurança, delirium, monitorização e profundidade")}</Text>\n            </View>\n            <Text style={s.principlesChevron}>{showPrinciples ? "▲" : "▼"}</Text>\n          </Pressable>\n          {showPrinciples ? (\n            <View style={s.card}>\n              {PRINCIPIOS_ANALGOSEDACAO.map((linha) => (\n                <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>\n              ))}\n            </View>\n          ) : null}\n\n          {/* BNM também é consulta de segurança, não a ação dominante da tela. */}\n          {drug.group === "bnm" ? (\n            <>\n              <Pressable style={s.principlesSummary} onPress={() => setShowBnmRules((v) => !v)}>\n                <View style={{ flex: 1, gap: 3 }}>\n                  <Text style={s.cardLabel}>{tr("BLOQUEIO NEUROMUSCULAR")}</Text>\n                  <Text style={s.principlesLead}>{tr("Sedação profunda + analgesia antes do bloqueio")}</Text>\n                  <Text style={s.principlesHint}>{tr("Abrir indicações, TOF, retirada e reversão")}</Text>\n                </View>\n                <Text style={s.principlesChevron}>{showBnmRules ? "▲" : "▼"}</Text>\n              </Pressable>\n              {showBnmRules ? (\n                <View style={s.card}>\n                  {REGRAS_BNM.map((linha) => (\n                    <Text key={linha} style={s.refLine}>• {tr(linha)}</Text>\n                  ))}\n                </View>\n              ) : null}\n            </>\n          ) : null}`;

  src = replaceOnce(src, old, neu, 'hierarquia inicial da sedoanalgesia');

  const styleAnchor = '  drugClass: { fontSize: CV.tipo.label.fontSize, fontWeight: "600", color: CV.cores.primary },\n';
  if (!src.includes(styleAnchor)) throw new Error('âncora de estilos da sedoanalgesia ausente');
  src = src.replace(styleAnchor, `${styleAnchor}\n  principlesSummary: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: CV.cores.surface, borderRadius: CV.raio.card, padding: 14, borderWidth: 1, borderColor: CV.cores.border },\n  principlesLead: { fontSize: CV.tipo.body.fontSize, lineHeight: CV.tipo.body.lineHeight, fontWeight: "800", color: CV.cores.text },\n  principlesHint: { fontSize: CV.tipo.micro.fontSize, lineHeight: CV.tipo.micro.lineHeight, color: CV.cores.textSecondary },\n  principlesChevron: { fontSize: 14, fontWeight: "900", color: CV.cores.primary },\n`);
  write(file, src);
}

// 4) OVACE: criar uma decisão operacional acima do material de referência.
{
  const file = 'components/protocol-screen/acls-choking-screen.tsx';
  let src = read(file);
  src = replaceOnce(src,
    'import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";',
    'import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";\nimport { useState } from "react";\nimport { HorizontalChoiceSelector } from "../ui-v2/horizontal-choice-selector";',
    'imports OVACE guiado'
  );
  src = replaceOnce(src,
    '  const tr = useTr();\n  const router = useRouter();\n  return (',
    '  const tr = useTr();\n  const router = useRouter();\n  const [gravidade, setGravidade] = useState<"leve" | "grave" | undefined>();\n  return (',
    'estado de gravidade OVACE'
  );

  const anchor = `      {/* O que mudou */}\n      <View style={s.mudouCard}>`;
  const guided = `      {/* Decisão operacional: o usuário precisa saber o que fazer antes de ler a referência. */}\n      <View style={s.guideCard}>\n        <Text style={s.guideEyebrow}>{tr("DECISÃO AGORA")}</Text>\n        <Text style={s.guideTitle}>{tr("A obstrução é leve ou grave?")}</Text>\n        <Text style={s.guideBody}>{tr("Leve: tosse forte, fala e respira. Grave: tosse fraca/ausente, incapaz de falar, cianose, alteração mental ou apneia.")}</Text>\n        <HorizontalChoiceSelector\n          value={gravidade}\n          options={[\n            { value: "leve", label: tr("Obstrução leve"), tone: "success" },\n            { value: "grave", label: tr("Obstrução grave"), tone: "critical" },\n          ]}\n          onChange={(v) => setGravidade(v as "leve" | "grave")}\n          accessibilityLabel={tr("Classificar gravidade da obstrução")}\n          testID="ovace-gravidade"\n        />\n        {gravidade === "leve" ? (\n          <View style={s.guideAction}>\n            <Text style={s.guideActionTitle}>{tr("INCENTIVE A TOSSE")}</Text>\n            <Text style={s.guideActionText}>{tr("Não faça golpes nem compressões enquanto a vítima tosse com força, fala e respira. Observe continuamente; se a tosse enfraquecer ou surgir qualquer sinal de gravidade, mude para obstrução grave.")}</Text>\n          </View>\n        ) : null}\n        {gravidade === "grave" ? (\n          <View style={[s.guideAction, s.guideActionCritical]}>\n            <Text style={s.guideActionTitle}>{tr("5 GOLPES NAS COSTAS → 5 COMPRESSÕES ABDOMINAIS")}</Text>\n            <Text style={s.guideActionText}>{tr("Acione ajuda. Repita ciclos de 5 + 5 até expelir o objeto ou a vítima ficar inconsciente. Se ficar inconsciente, inicie RCP pelas compressões.")}</Text>\n          </View>\n        ) : null}\n      </View>\n\n      {/* O que mudou */}\n      <View style={s.mudouCard}>`;
  src = replaceOnce(src, anchor, guided, 'decisão operacional OVACE');

  const styleAnchor = '  scroll: { flex: 1, backgroundColor: "#101722" },\n';
  if (!src.includes(styleAnchor)) throw new Error('âncora de estilos OVACE ausente');
  src = src.replace(styleAnchor, `${styleAnchor}  guideCard: { backgroundColor: "#192331", borderRadius: 18, padding: 18, borderWidth: 2, borderColor: "#60a5fa", gap: 12 },\n  guideEyebrow: { fontSize: 12, fontWeight: "900", letterSpacing: 1.2, color: "#93c5fd" },\n  guideTitle: { fontSize: 24, lineHeight: 30, fontWeight: "900", color: "#f8fafc" },\n  guideBody: { fontSize: 16, lineHeight: 23, fontWeight: "600", color: "#cbd5e1" },\n  guideAction: { borderRadius: 14, borderWidth: 1, borderColor: "#22c55e", backgroundColor: "rgba(34,197,94,0.10)", padding: 14, gap: 6 },\n  guideActionCritical: { borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.10)" },\n  guideActionTitle: { fontSize: 18, lineHeight: 24, fontWeight: "900", color: "#f8fafc" },\n  guideActionText: { fontSize: 15, lineHeight: 22, fontWeight: "600", color: "#cbd5e1" },\n`);
  write(file, src);
}

console.log('✓ Hierarquia corrigida: sedoanalgesia, OVACE, VM e peso corporal predito');
