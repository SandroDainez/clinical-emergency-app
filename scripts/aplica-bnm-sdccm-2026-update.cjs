#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceOnce(rel, label, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  const count = src.split(before).length - 1;
  if (count === 0 && src.includes(after)) return;
  if (count !== 1) throw new Error(`${rel} · ${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

replaceOnce(
  'sedation-engine.ts',
  'rocuronium-continuous-strategy',
  '      "Infusão contínua na UTI para SARA grave/assincronia refratária — sempre com sedação e analgesia plenas.",',
  '      "Bloqueio contínuo na UTI deve ser reservado a indicação fisiológica clara, com sedação e analgesia adequadas; na SDRA, a SCCM 2026 sugere BNM quando P/F < 150 e há hipoxemia persistente e/ou metas ventilatórias não atingidas apesar da sedação.",'
);

replaceOnce(
  'sedation-engine.ts',
  'cis-strategy-choice',
  '      "BNM de escolha para infusão prolongada em UTI — eliminação de Hofmann (independe de rim e fígado).",',
  '      "Cisatracúrio é uma opção útil quando se escolhe bloqueio sustentado em UTI, especialmente quando a eliminação de Hofmann é vantajosa; não tratar nenhum BNM como escolha universal apenas pelo contexto de UTI.",'
);
replaceOnce(
  'sedation-engine.ts',
  'cis-acurasys-strategy',
  '      "Protocolo ACURASYS: 37,5 mg/h × 48 h na SARA grave.",',
  '      "ACURASYS: 37,5 mg/h × 48 h é um regime histórico de dose fixa. A SCCM 2026 aceita tanto estratégia fixa quanto estratégia titulada quando BNM é indicado na SDRA; não confundir protocolo estudado com obrigação universal.",'
);
replaceOnce(
  'sedation-engine.ts',
  'cis-tof-mandatory',
  '        "Monitorar com TOF obrigatoriamente. Sempre com sedação e analgesia plenas.",',
  '        "Garantir analgesia e sedação adequadas antes e durante o bloqueio. TOF/monitorização neuromuscular é especialmente útil quando a estratégia é titulada, mas a SCCM 2026 não estabelece TOF como obrigação universal em toda estratégia fixa de BNM na SDRA.",'
);
replaceOnce(
  'sedation-engine.ts',
  'cis-info-choice',
  '      "✅ BNM de escolha em UTI para infusão prolongada.",',
  '      "✅ Opção de BNM sustentado em UTI quando há indicação; eliminação de Hofmann favorece seu uso quando disfunção renal/hepática torna outros agentes menos previsíveis.",'
);
replaceOnce(
  'sedation-engine.ts',
  'cis-evidence-2026',
  '      "⚠️ EVIDÊNCIA CONFLITANTE — o ROSE (NEJM 2019, 1.006 pacientes, PETAL Network) reavaliou o ACURASYS com protocolos modernos: bloqueio precoce + sedação PROFUNDA contra cuidado usual SEM bloqueio de rotina e com sedação LEVE. Foi interrompido por futilidade; mortalidade em 90 dias igual (43%), com MAIS fraqueza adquirida na UTI e mais eventos cardiovasculares graves no braço bloqueado. O uso ROTINEIRO de BNM na SDRA deixou de ser recomendação forte — o regime de dose fixa é opção em situação selecionada (dissincronia grave, drive excessivo, prona), não conduta corrente.",',
  '      "⚠️ EVIDÊNCIA ATUALIZADA — ACURASYS e ROSE produziram resultados diferentes. A diretriz SCCM 2026 sugere BNM em adultos com SDRA e P/F < 150 quando persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar da sedação; aceita estratégia fixa ou titulada. Portanto, não usar bloqueio contínuo por rotina apenas pelo diagnóstico de SDRA, nem exigir que todo caso replique o ACURASYS.",'
);
replaceOnce(
  'sedation-engine.ts',
  'cis-reference-2026',
  '    reference: "ACURASYS (NEJM 2010) / ROSE (NEJM 2019).",',
  '    reference: "ACURASYS (NEJM 2010) · ROSE (NEJM 2019) · SCCM Guideline for Neuromuscular Blockade in Adults With ARDS, 2026.",'
);

const translations = [
  [
    '  "Infusão contínua na UTI para SARA grave/assincronia refratária — sempre com sedação e analgesia plenas.":',
    '  "Bloqueio contínuo na UTI deve ser reservado a indicação fisiológica clara, com sedação e analgesia adequadas; na SDRA, a SCCM 2026 sugere BNM quando P/F < 150 e há hipoxemia persistente e/ou metas ventilatórias não atingidas apesar da sedação.":\n    "El bloqueo continuo en UCI debe reservarse para una indicación fisiológica clara, con sedación y analgesia adecuadas; en el SDRA, la SCCM 2026 sugiere BNM cuando P/F < 150 y persiste hipoxemia y/o no se alcanzan los objetivos ventilatorios pese a la sedación.",\n'
  ],
  [
    '  "BNM de escolha para infusão prolongada em UTI — eliminação de Hofmann (independe de rim e fígado).":',
    '  "Cisatracúrio é uma opção útil quando se escolhe bloqueio sustentado em UTI, especialmente quando a eliminação de Hofmann é vantajosa; não tratar nenhum BNM como escolha universal apenas pelo contexto de UTI.":\n    "El cisatracurio es una opción útil cuando se elige bloqueo sostenido en UCI, especialmente cuando la eliminación de Hofmann es ventajosa; no tratar ningún BNM como elección universal solo por el contexto de UCI.",\n'
  ],
  [
    '  "Protocolo ACURASYS: 37,5 mg/h × 48 h na SARA grave.":',
    '  "ACURASYS: 37,5 mg/h × 48 h é um regime histórico de dose fixa. A SCCM 2026 aceita tanto estratégia fixa quanto estratégia titulada quando BNM é indicado na SDRA; não confundir protocolo estudado com obrigação universal.":\n    "ACURASYS: 37,5 mg/h × 48 h es un régimen histórico de dosis fija. La SCCM 2026 acepta tanto estrategia fija como titulada cuando el BNM está indicado en el SDRA; no confundir un protocolo estudiado con una obligación universal.",\n'
  ],
  [
    '  "Monitorar com TOF obrigatoriamente. Sempre com sedação e analgesia plenas.":',
    '  "Garantir analgesia e sedação adequadas antes e durante o bloqueio. TOF/monitorização neuromuscular é especialmente útil quando a estratégia é titulada, mas a SCCM 2026 não estabelece TOF como obrigação universal em toda estratégia fixa de BNM na SDRA.":\n    "Garantizar analgesia y sedación adecuadas antes y durante el bloqueo. El TOF/monitorización neuromuscular es especialmente útil cuando la estrategia es titulada, pero la SCCM 2026 no establece el TOF como obligación universal en toda estrategia fija de BNM en el SDRA.",\n'
  ],
  [
    '  "✅ BNM de escolha em UTI para infusão prolongada.":',
    '  "✅ Opção de BNM sustentado em UTI quando há indicação; eliminação de Hofmann favorece seu uso quando disfunção renal/hepática torna outros agentes menos previsíveis.":\n    "✅ Opción de BNM sostenido en UCI cuando existe indicación; la eliminación de Hofmann favorece su uso cuando la disfunción renal/hepática hace menos predecibles otros agentes.",\n'
  ],
  [
    '  "⚠️ EVIDÊNCIA CONFLITANTE — o ROSE (NEJM 2019, 1.006 pacientes, PETAL Network) reavaliou o ACURASYS com protocolos modernos: bloqueio precoce + sedação PROFUNDA contra cuidado usual SEM bloqueio de rotina e com sedação LEVE. Foi interrompido por futilidade; mortalidade em 90 dias igual (43%), com MAIS fraqueza adquirida na UTI e mais eventos cardiovasculares graves no braço bloqueado. O uso ROTINEIRO de BNM na SDRA deixou de ser recomendação forte — o regime de dose fixa é opção em situação selecionada (dissincronia grave, drive excessivo, prona), não conduta corrente.":',
    '  "⚠️ EVIDÊNCIA ATUALIZADA — ACURASYS e ROSE produziram resultados diferentes. A diretriz SCCM 2026 sugere BNM em adultos com SDRA e P/F < 150 quando persiste hipoxemia e/ou não se atingem metas de ventilação mecânica apesar da sedação; aceita estratégia fixa ou titulada. Portanto, não usar bloqueio contínuo por rotina apenas pelo diagnóstico de SDRA, nem exigir que todo caso replique o ACURASYS.":\n    "⚠️ EVIDENCIA ACTUALIZADA — ACURASYS y ROSE produjeron resultados diferentes. La guía SCCM 2026 sugiere BNM en adultos con SDRA y P/F < 150 cuando persiste hipoxemia y/o no se alcanzan objetivos de ventilación mecánica pese a la sedación; acepta estrategia fija o titulada. Por tanto, no usar bloqueo continuo de rutina solo por el diagnóstico de SDRA ni exigir que todo caso replique ACURASYS.",\n'
  ]
];

for (const [oldKey, newEntry] of translations) {
  const file = path.join(root, 'lib/i18n/modules/sedacao.ts');
  let src = fs.readFileSync(file, 'utf8');
  const idx = src.indexOf(oldKey);
  if (idx === -1) {
    if (src.includes(newEntry.split(':\\n')[0])) continue;
    throw new Error(`tradução alvo não encontrada: ${oldKey}`);
  }
  const lineEnd = src.indexOf('\n', idx);
  const nextLineEnd = src.indexOf('\n', lineEnd + 1);
  const current = src.slice(idx, nextLineEnd + 1);
  src = src.slice(0, idx) + newEntry + src.slice(nextLineEnd + 1);
  fs.writeFileSync(file, src);
}

console.log('✅ BNM/SDRA: semântica atualizada para SCCM 2026 sem alterar doses nem cálculo.');
