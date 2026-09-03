#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const rel = 'rsi-decision-tree.ts';
const file = path.join(root, rel);
let src = fs.readFileSync(file, 'utf8');

function replaceOnce(label, before, after) {
  if (src.includes(after)) return;
  const count = src.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrados ${count}`);
  src = src.replace(before, after);
}

// ── Via aérea acordada: preparo + resultado executável ──────────────────────
replaceOnce('topicalizacao',
`        "Topização: lidocaína tópica na via aérea (spray/atomizador 4%; máx ~4 mg/kg somando todas as vias) — é a base da técnica, não a sedação.",`,
`        "Topização: usar lidocaína tópica na menor dose eficaz, somando TODAS as vias. A DAS define teto de 9 mg/kg de peso corporal magro — teto de segurança, não dose-alvo. Testar a eficácia da topização antes de instrumentar a via aérea.",`);

replaceOnce('sedacao-acordada',
`        "Sedação LEVE mantendo o drive: cetamina em doses fracionadas de 10–20 mg IV (dissociação leve preservando respiração) OU dexmedetomidina 1 mcg/kg em 10 min. NÃO usar bolus de indução.",`,
`        "Sedação mínima e cautelosa, apenas se necessária, mantendo ventilação espontânea e cooperação. Não há regime sedativo único demonstrado como superior; sedação NÃO substitui topização inadequada e, idealmente, deve ser administrada por profissional independente.",`);

replaceOnce('confirmacao-acordada',
`        "Visualizou as cordas e passou o tubo → confirmar por capnografia. SÓ ENTÃO induzir e aprofundar sedação.",`,
`        "Após passar o tubo, fazer confirmação em DOIS pontos: visualização da posição traqueal + capnografia com CO₂ expirado sustentado. SÓ ENTÃO induzir/anestesiar e aprofundar sedação.",`);

replaceOnce('falha-acordada-prosa',
`        "Falhou ou o paciente não tolera → ainda está ventilando: recuar, reoxigenar e reavaliar a estratégia (nova tentativa, ISR com kit cirúrgico aberto, ou via cirúrgica eletiva com equipe).",`,
`        "Se falhar ou o paciente não tolerar: interromper a instrumentação, manter ventilação espontânea se possível, reoxigenar e seguir para a decisão explícita de resgate — não presumir tubo confirmado.",`);

replaceOnce('next-acordada',
`      next: "confirmacao",\n    },\n\n    adiar_iot: {`,
`      next: "via_acordada_resultado",\n    },\n\n    via_acordada_resultado: {\n      id: "via_acordada_resultado",\n      type: "decision",\n      title: "Resultado da via aérea acordada",\n      question: "O tubo está confirmado por visualização traqueal E capnografia com CO₂ expirado sustentado?",\n      summary: "Só induzir/anestesiar após a confirmação em dois pontos. Sem ambos, tratar como técnica ainda não concluída.",\n      options: [\n        { id: "confirmado", label: "Sim — visualização + capnografia confirmam", next: "pos_intubacao" },\n        { id: "nao_confirmado", label: "Não — falhou, não tolerou ou não confirmou", next: "via_acordada_falha" },\n      ],\n    },\n\n    via_acordada_falha: {\n      id: "via_acordada_falha",\n      type: "decision",\n      title: "Via aérea acordada não concluída — escolha o resgate",\n      question: "Após recuar e reoxigenar, qual é a estratégia mais segura agora?",\n      summary: "Preservar oxigenação e não transformar uma técnica acordada malsucedida em indução não planejada. A DAS limita a técnica acordada a 3 tentativas + 1 tentativa final por operador mais experiente.",\n      evidence: [\n        "Nova tentativa acordada: somente se as condições melhoraram, ainda há cooperação/ventilação espontânea e o limite de tentativas não foi atingido.",\n        "Converter para ISR: apenas se a urgência exigir e houver plano A/B/C/D preparado, incluindo eFONA se o resgate também for difícil.",\n        "Adiar/otimizar: quando a indicação não é imediata e há tempo para melhorar condições, recursos ou equipe antes de nova abordagem.",\n      ],\n      options: [\n        { id: "repetir", label: "Nova tentativa acordada — dentro do limite 3+1", next: "via_acordada" },\n        { id: "isr", label: "Converter para ISR com resgate/eFONA preparados", next: "preoxigenacao" },\n        { id: "adiar", label: "Adiar — otimizar e reavaliar", next: "adiar_iot" },\n      ],\n    },\n\n    adiar_iot: {`);

// ── Tentativas convencionais: remover cortes universais improvisados ────────
replaceOnce('summary-tentativas',
`      summary: "Aguardar relaxamento (45–60 s). Tentativa otimizada; limitar a apneia. Máx 2 tentativas por operador/dispositivo.",`,
`      summary: "Aguardar relaxamento e priorizar sucesso na primeira tentativa. Limitar tentativas, reoxigenar entre elas e declarar falha cedo se a trajetória estiver insegura.",`);

replaceOnce('acao-tentativas',
`        "Limitar a tentativa a ~30 s ou até SpO₂ ~90% → reoxigenar (BVM/HFN) entre tentativas. Máximo 2 tentativas com o mesmo operador/dispositivo.",`,
`        "Interromper a tentativa quando a oxigenação, a fisiologia ou as condições técnicas estiverem se deteriorando; reoxigenar antes de nova tentativa. No algoritmo DAS 2025, o teto do Plano A é 3 tentativas + 1 por operador mais experiente, mas a falha pode e deve ser declarada ANTES se insistir estiver aumentando o risco.",`);

// ── Confirmação em dois pontos ──────────────────────────────────────────────
replaceOnce('confirmacao-pergunta',
`      question: "A capnografia (ETCO₂) confirma a posição traqueal?",`,
`      question: "Há confirmação traqueal em dois pontos — visualização E capnografia com CO₂ expirado sustentado?",`);
replaceOnce('confirmacao-summary',
`        "⚠️ ETCO₂ AUSENTE É ESÔFAGO ATÉ PROVA EM CONTRÁRIO — retire o tubo e ventile. Nenhum outro sinal desfaz esta conclusão.",`,
`        "⚠️ SEM CO₂ EXPIRADO SUSTENTADO, NÃO PRESUMIR POSIÇÃO TRAQUEAL. Reavaliar imediatamente e excluir intubação esofágica; sinais clínicos isolados não substituem capnografia.",`);
replaceOnce('confirmacao-evidence-capno',
`        "Capnografia waveform é o padrão-ouro: onda de ETCO₂ persistente em ≥ 6 ventilações.",`,
`        "Confirmação principal: visualização do tubo atravessando a glote quando possível + capnografia com CO₂ expirado sustentado. Se a capnografia não sustentar a posição, tratar a localização como não confirmada e investigar imediatamente.",`);
replaceOnce('confirmacao-opcao-sim',
`        { id: "sim", label: "Sim — ETCO₂ confirma traqueia", next: "pos_intubacao" },`,
`        { id: "sim", label: "Sim — visualização + capnografia confirmam", next: "pos_intubacao" },`);
replaceOnce('confirmacao-opcao-nao',
`        { id: "nao", label: "Não — sem confirmação / esôfago", next: "falha" },`,
`        { id: "nao", label: "Não — posição não confirmada", next: "falha" },`);

// ── CICO: eFONA não espera reversão farmacológica ──────────────────────────
replaceOnce('cico-sugamadex',
`        "Se usou rocurônio: sugamadex {sugam} mg IV (16 mg/kg) — reverte em < 3 min; considerar despertar o paciente.",`,
`        "CICO é falha de oxigenação: NÃO esperar sugamadex, retorno do bloqueio ou nova tentativa repetitiva antes de avançar para eFONA. Reversão farmacológica só pode integrar um plano de despertar quando a oxigenação já foi restaurada — nunca substituir o resgate da via aérea.",`);
replaceOnce('cico-efona',
`        "Se a oxigenação não for restaurada → via aérea cirúrgica SEM demora.",`,
`        "Se a oxigenação não for restaurada com as manobras de resgate → declarar CICO e executar eFONA sem demora.",`);

// ── Pós-IOT: tratar mecanismo, não protocolo fixo ───────────────────────────
replaceOnce('posiot-hipotensao',
`        "Hipotensão pós-IOT (comum): SF 250–500 mL, reduzir PEEP, descartar pneumotórax; noradrenalina 8–12 mcg IV em bolus se refratária.",`,
`        "Hipotensão pós-IOT: procurar e tratar o mecanismo imediatamente — efeito de drogas/vasoplegia, hipovolemia, pressão intratorácica/auto-PEEP excessiva ou pneumotórax hipertensivo. Dar volume apenas quando houver contexto de hipovolemia/responsividade; titular vasopressor, preferindo infusão quando factível. Push-dose é ponte selecionada conforme protocolo local, não dose fixa universal.",`);
replaceOnce('posiot-gaso',
`        "Gasometria arterial 20–30 min após a IOT para ajuste fino. Capnografia contínua.",`,
`        "Capnografia contínua. Obter gasometria e reavaliar ventilação/oxigenação quando clinicamente indicado após estabilização ou mudanças relevantes do ventilador — sem intervalo universal fixo.",`);

fs.writeFileSync(file, src);
console.log('✅ ISR: via acordada, tentativas, confirmação, CICO e pós-IOT atualizados com fluxo executável e sem limites arbitrários.');
