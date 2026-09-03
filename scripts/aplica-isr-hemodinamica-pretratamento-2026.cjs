#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceExact(rel, before, after) {
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${rel}: esperado 1 alvo, encontrados ${count}\nALVO: ${before}`);
  src = src.replace(before, after);
  fs.writeFileSync(file, src);
}

// ── Árvore ISR: retirar gatilhos rígidos e adjuvante sem lastro ──────────────
replaceExact('rsi-decision-tree.ts',
`    out.lido = round1(MG_POR_KG.lidocaina * peso);\n`,
``);
replaceExact('rsi-decision-tree.ts',
`    out.lido = mgPorKg(MG_POR_KG.lidocaina);\n`,
``);

replaceExact('rsi-decision-tree.ts',
`        "Índice de choque (FC ÷ PAS) acima de 0,9 prevê colapso/PCR peri-intubação mesmo com pressão ainda normal (Heffner, J Crit Care 2013) — some 100 de FC com 100 de PAS e o risco já está lá. A partir de 0,8 já se prevê hipotensão pós-intubação; 0,9 é o limiar do desfecho mais grave, e é o que este passo vigia.",`,
`        "Índice de choque (FC ÷ PAS) pode ajudar a reconhecer risco hemodinâmico peri-intubação, mas NÃO deve funcionar como corte isolado de 0,8 ou 0,9. Interpretar junto com pressão arterial, perfusão, lactato, contexto do choque e tendência clínica.",`);

replaceExact('rsi-decision-tree.ts',
`        "Escolha a dose do indutor pensando na hemodinâmica: reduzir a dose do indutor e manter a do bloqueador é o padrão em quem está no limite.",`,
`        "Escolha o indutor e sua dose conforme reserva hemodinâmica e profundidade necessária. Não reduzir automaticamente todo indutor por um único marcador; o bloqueador continua em dose adequada para não comprometer as condições de laringoscopia.",`);

replaceExact('rsi-decision-tree.ts',
`        "Volume: bolus de cristaloide 250–500 mL se responsivo; iniciar/otimizar vasopressor (noradrenalina) para PAS adequada.",`,
`        "Volume somente quando houver contexto de hipovolemia/responsividade: bolus rotineiro antes da intubação não reduziu colapso cardiovascular em ensaios. Corrigir o mecanismo do choque e evitar sobrecarga.",`);

replaceExact('rsi-decision-tree.ts',
`        "Ter push-dose pressor à mão para hipotensão pós-indução (ex.: noradrenalina 8–12 mcg IV em bolus, repetir conforme resposta).",`,
`        "Se houver hipotensão ou alto risco de colapso, preparar vasopressor antes da indução. Preferir infusão titulável quando houver tempo; push-dose pode ser ponte em cenário selecionado, conforme protocolo local e monitorização, sem transformar uma dose fixa em regra universal.",`);

replaceExact('rsi-decision-tree.ts',
`        "Preferir indutor hemodinamicamente estável (cetamina; etomidato em dose plena).",`,
`        "Escolher o indutor conforme o perfil hemodinâmico. Etomidato e cetamina são opções frequentes; a evidência não sustenta uma regra universal de dose plena ou de redução automática para todos os pacientes instáveis.",`);

replaceExact('rsi-decision-tree.ts',
`        "Lidocaína {lido} mg IV (1,5 mg/kg, 3 min antes): atenua HIC e broncoespasmo. Considerar em TCE grave e asma/DPOC (evidência limitada, perfil seguro).",`,
`        "Lidocaína IV NÃO é pré-tratamento rotineiro da ISR para atenuar hipertensão intracraniana ou broncoespasmo: não há evidência clínica suficiente de benefício nesses cenários. Se houver outra indicação específica para lidocaína, tratá-la como indicação separada.",`);

replaceExact('rsi-decision-tree.ts',
`        "Manter vasopressor/push-dose disponível (noradrenalina 8–12 mcg IV em bolus).",`,
`        "Preparar suporte vasopressor antes da indução quando houver risco de hipotensão; preferir infusão titulável quando factível e reservar push-dose como ponte selecionada conforme protocolo local.",`);

// ── Fonte única: remover dose órfã de lidocaína e corrigir regra excessiva ──
replaceExact('lib/doses-isr.ts',
` * A prática recomendada é REDUZIR o indutor em pelo menos 50% no choque (índice\n * de choque elevado). A evidência é reconhecidamente limitada — dose plena de\n * cetamina se associou à maior taxa de hipotensão pós-intubação —, e por isso a\n * redução vem com o motivo escrito, não como número solto.\n`,
` * A dose do indutor deve ser individualizada no choque. Estudos recentes não\n * sustentam uma regra universal de reduzir todo indutor por um corte isolado de\n * índice de choque; em pacientes com baixa reserva hemodinâmica pode ser\n * apropriado usar doses menores de alguns agentes, sem reduzir o bloqueador.\n`);

replaceExact('lib/doses-isr.ts',
`  /** Hemodinamicamente neutro — não se reduz no choque. */\n  etomidato: 0.3,`,
`  /** Dose de referência do cálculo; individualizar conforme contexto clínico. */\n  etomidato: 0.3,`);

replaceExact('lib/doses-isr.ts',
`  fentanilMcg: 2,\n  lidocaina: 1.5,`,
`  fentanilMcg: 2,`);

replaceExact('lib/doses-isr.ts',
`    /** Hemodinamicamente neutro — não se reduz no choque. */\n    todos: mgPorKg(MG_POR_KG.etomidato),`,
`    /** Dose de referência do cálculo; a dose clínica pode ser individualizada. */\n    todos: mgPorKg(MG_POR_KG.etomidato),`);

replaceExact('lib/doses-isr.ts',
`export const ISR_AJUSTE_NO_INSTAVEL =\n  "No instável, REDUZIR o indutor e MANTER o bloqueador. Cetamina 1 mg/kg (0,5 mg/kg no choque grave) em vez de 1,5; etomidato segue 0,3 mg/kg, que é hemodinamicamente neutro; evitar propofol e midazolam. Reduzir o bloqueador junto daria relaxamento insuficiente e mais tentativas — exatamente o que quem está no limite não tolera.";`,
`export const ISR_AJUSTE_NO_INSTAVEL =\n  "No instável, INDIVIDUALIZAR o indutor e MANTER o bloqueador em dose adequada. Cetamina pode exigir dose menor quando a reserva hemodinâmica é muito baixa; etomidato 0,3 mg/kg permanece a dose de referência do cálculo, sem transformar dose plena ou redução em regra universal. Reduzir o bloqueador junto pode piorar as condições de laringoscopia e aumentar tentativas.";`);

// ── Teste legado: lidocaína deixa de ser dose publicada/operacional do ISR ─
replaceExact('scripts/valida-isr.cjs',
`    ["lido", 1.5, "lidocaína — pré-tratamento"],\n`,
``);

// ── Espanhol: adicionar apenas novas frases efetivamente exibidas ───────────
{
  const rel = 'lib/i18n/modules/isr.ts';
  const file = path.join(root, rel);
  let src = fs.readFileSync(file, 'utf8');
  const entries = [
    [`Índice de choque (FC ÷ PAS) pode ajudar a reconhecer risco hemodinâmico peri-intubação, mas NÃO deve funcionar como corte isolado de 0,8 ou 0,9. Interpretar junto com pressão arterial, perfusão, lactato, contexto do choque e tendência clínica.`, `El índice de choque (FC ÷ PAS) puede ayudar a reconocer riesgo hemodinámico periintubación, pero NO debe funcionar como un punto de corte aislado de 0,8 o 0,9. Interpretarlo junto con la presión arterial, la perfusión, el lactato, el contexto del choque y la tendencia clínica.`],
    [`Escolha o indutor e sua dose conforme reserva hemodinâmica e profundidade necessária. Não reduzir automaticamente todo indutor por um único marcador; o bloqueador continua em dose adequada para não comprometer as condições de laringoscopia.`, `Elija el inductor y su dosis según la reserva hemodinámica y la profundidad necesaria. No reducir automáticamente todo inductor por un único marcador; el bloqueante se mantiene en una dosis adecuada para no comprometer las condiciones de laringoscopia.`],
    [`Volume somente quando houver contexto de hipovolemia/responsividade: bolus rotineiro antes da intubação não reduziu colapso cardiovascular em ensaios. Corrigir o mecanismo do choque e evitar sobrecarga.`, `Volumen solo cuando exista un contexto de hipovolemia/respuesta a fluidos: el bolo rutinario antes de la intubación no redujo el colapso cardiovascular en ensayos. Corregir el mecanismo del choque y evitar la sobrecarga.`],
    [`Se houver hipotensão ou alto risco de colapso, preparar vasopressor antes da indução. Preferir infusão titulável quando houver tempo; push-dose pode ser ponte em cenário selecionado, conforme protocolo local e monitorização, sem transformar uma dose fixa em regra universal.`, `Si hay hipotensión o alto riesgo de colapso, preparar el vasopresor antes de la inducción. Preferir una infusión titulable cuando haya tiempo; el push-dose puede ser un puente en escenarios seleccionados, según el protocolo local y la monitorización, sin convertir una dosis fija en regla universal.`],
    [`Escolher o indutor conforme o perfil hemodinâmico. Etomidato e cetamina são opções frequentes; a evidência não sustenta uma regra universal de dose plena ou de redução automática para todos os pacientes instáveis.`, `Elegir el inductor según el perfil hemodinámico. Etomidato y ketamina son opciones frecuentes; la evidencia no respalda una regla universal de dosis plena ni de reducción automática para todos los pacientes inestables.`],
    [`Lidocaína IV NÃO é pré-tratamento rotineiro da ISR para atenuar hipertensão intracraniana ou broncoespasmo: não há evidência clínica suficiente de benefício nesses cenários. Se houver outra indicação específica para lidocaína, tratá-la como indicação separada.`, `La lidocaína IV NO es un pretratamiento rutinario de la ISR para atenuar la hipertensión intracraneal o el broncoespasmo: no hay evidencia clínica suficiente de beneficio en estos escenarios. Si existe otra indicación específica para lidocaína, tratarla como una indicación separada.`],
    [`Preparar suporte vasopressor antes da indução quando houver risco de hipotensão; preferir infusão titulável quando factível e reservar push-dose como ponte selecionada conforme protocolo local.`, `Preparar soporte vasopresor antes de la inducción cuando exista riesgo de hipotensión; preferir una infusión titulable cuando sea factible y reservar el push-dose como puente seleccionado según el protocolo local.`],
  ];
  const anchor = '\n};\n';
  const pos = src.lastIndexOf(anchor);
  if (pos < 0) throw new Error('isr.ts: fechamento do dicionário não encontrado');
  for (const [pt, es] of entries) {
    const key = JSON.stringify(pt);
    if (!src.includes(`${key}:`)) {
      const line = `  ${key}: ${JSON.stringify(es)},\n`;
      src = src.slice(0, pos) + line + src.slice(pos);
    }
  }
  fs.writeFileSync(file, src);
}

console.log('✅ ISR: otimização hemodinâmica e pré-tratamento atualizados sem cortes rígidos, bolus rotineiro ou lidocaína IV de rotina.');
