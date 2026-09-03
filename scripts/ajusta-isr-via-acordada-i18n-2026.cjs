#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'lib/i18n/modules/isr.ts');
let src = fs.readFileSync(file, 'utf8');

const entries = [
  ["Topização: usar lidocaína tópica na menor dose eficaz, somando TODAS as vias. A DAS define teto de 9 mg/kg de peso corporal magro — teto de segurança, não dose-alvo. Testar a eficácia da topização antes de instrumentar a via aérea.", "Topicalización: usar lidocaína tópica en la menor dosis eficaz, sumando TODAS las vías. La DAS define un límite máximo de 9 mg/kg de peso corporal magro — límite de seguridad, no dosis objetivo. Comprobar la eficacia de la topicalización antes de instrumentar la vía aérea."],
  ["Sedação mínima e cautelosa, apenas se necessária, mantendo ventilação espontânea e cooperação. Não há regime sedativo único demonstrado como superior; sedação NÃO substitui topização inadequada e, idealmente, deve ser administrada por profissional independente.", "Sedación mínima y cautelosa, solo si es necesaria, manteniendo ventilación espontánea y cooperación. No existe un régimen sedante único demostrado como superior; la sedación NO sustituye una topicalización inadecuada y, de forma ideal, debe ser administrada por un profesional independiente."],
  ["Após passar o tubo, fazer confirmação em DOIS pontos: visualização da posição traqueal + capnografia com CO₂ expirado sustentado. SÓ ENTÃO induzir/anestesiar e aprofundar sedação.", "Tras pasar el tubo, realizar confirmación en DOS puntos: visualización de la posición traqueal + capnografía con CO₂ espirado sostenido. SOLO ENTONCES inducir/anestesiar y profundizar la sedación."],
  ["Se falhar ou o paciente não tolerar: interromper a instrumentação, manter ventilação espontânea se possível, reoxigenar e seguir para a decisão explícita de resgate — não presumir tubo confirmado.", "Si falla o el paciente no lo tolera: interrumpir la instrumentación, mantener ventilación espontánea si es posible, reoxigenar y seguir a la decisión explícita de rescate — no asumir que el tubo está confirmado."],
  ["Resultado da via aérea acordada", "Resultado de la vía aérea despierta"],
  ["O tubo está confirmado por visualização traqueal E capnografia com CO₂ expirado sustentado?", "¿El tubo está confirmado por visualización traqueal Y capnografía con CO₂ espirado sostenido?"],
  ["Só induzir/anestesiar após a confirmação em dois pontos. Sem ambos, tratar como técnica ainda não concluída.", "Inducir/anestesiar solo después de la confirmación en dos puntos. Sin ambos, considerar que la técnica aún no está concluida."],
  ["Sim — visualização + capnografia confirmam", "Sí — visualización + capnografía confirman"],
  ["Não — falhou, não tolerou ou não confirmou", "No — falló, no toleró o no se confirmó"],
  ["Via aérea acordada não concluída — escolha o resgate", "Vía aérea despierta no concluida — elija el rescate"],
  ["Após recuar e reoxigenar, qual é a estratégia mais segura agora?", "Tras retirarse y reoxigenar, ¿cuál es ahora la estrategia más segura?"],
  ["Preservar oxigenação e não transformar uma técnica acordada malsucedida em indução não planejada. A DAS limita a técnica acordada a 3 tentativas + 1 tentativa final por operador mais experiente.", "Preservar la oxigenación y no convertir una técnica despierta fallida en una inducción no planificada. La DAS limita la técnica despierta a 3 intentos + 1 intento final por un operador más experimentado."],
  ["Nova tentativa acordada: somente se as condições melhoraram, ainda há cooperação/ventilação espontânea e o limite de tentativas não foi atingido.", "Nuevo intento despierto: solo si las condiciones mejoraron, aún hay cooperación/ventilación espontánea y no se alcanzó el límite de intentos."],
  ["Converter para ISR: apenas se a urgência exigir e houver plano A/B/C/D preparado, incluindo eFONA se o resgate também for difícil.", "Convertir a ISR: solo si la urgencia lo exige y existe un plan A/B/C/D preparado, incluyendo eFONA si el rescate también es difícil."],
  ["Adiar/otimizar: quando a indicação não é imediata e há tempo para melhorar condições, recursos ou equipe antes de nova abordagem.", "Posponer/optimizar: cuando la indicación no es inmediata y hay tiempo para mejorar las condiciones, los recursos o el equipo antes de un nuevo abordaje."],
  ["Nova tentativa acordada — dentro do limite 3+1", "Nuevo intento despierto — dentro del límite 3+1"],
  ["Converter para ISR com resgate/eFONA preparados", "Convertir a ISR con rescate/eFONA preparados"],
  ["Aguardar relaxamento e priorizar sucesso na primeira tentativa. Limitar tentativas, reoxigenar entre elas e declarar falha cedo se a trajetória estiver insegura.", "Esperar la relajación y priorizar el éxito en el primer intento. Limitar los intentos, reoxigenar entre ellos y declarar el fracaso precozmente si la trayectoria se vuelve insegura."],
  ["Interromper a tentativa quando a oxigenação, a fisiologia ou as condições técnicas estiverem se deteriorando; reoxigenar antes de nova tentativa. No algoritmo DAS 2025, o teto do Plano A é 3 tentativas + 1 por operador mais experiente, mas a falha pode e deve ser declarada ANTES se insistir estiver aumentando o risco.", "Interrumpir el intento cuando la oxigenación, la fisiología o las condiciones técnicas se estén deteriorando; reoxigenar antes de un nuevo intento. En el algoritmo DAS 2025, el límite del Plan A es de 3 intentos + 1 por un operador más experimentado, pero el fracaso puede y debe declararse ANTES si insistir está aumentando el riesgo."],
  ["Há confirmação traqueal em dois pontos — visualização E capnografia com CO₂ expirado sustentado?", "¿Hay confirmación traqueal en dos puntos — visualización Y capnografía con CO₂ espirado sostenido?"],
  ["⚠️ SEM CO₂ EXPIRADO SUSTENTADO, NÃO PRESUMIR POSIÇÃO TRAQUEAL. Reavaliar imediatamente e excluir intubação esofágica; sinais clínicos isolados não substituem capnografia.", "⚠️ SIN CO₂ ESPIRADO SOSTENIDO, NO ASUMIR POSICIÓN TRAQUEAL. Reevaluar de inmediato y excluir intubación esofágica; los signos clínicos aislados no sustituyen la capnografía."],
  ["Confirmação principal: visualização do tubo atravessando a glote quando possível + capnografia com CO₂ expirado sustentado. Se a capnografia não sustentar a posição, tratar a localização como não confirmada e investigar imediatamente.", "Confirmación principal: visualización del tubo atravesando la glotis cuando sea posible + capnografía con CO₂ espirado sostenido. Si la capnografía no sostiene la posición, considerar la localización como no confirmada e investigar de inmediato."],
  ["Não — posição não confirmada", "No — posición no confirmada"],
  ["CICO é falha de oxigenação: NÃO esperar sugamadex, retorno do bloqueio ou nova tentativa repetitiva antes de avançar para eFONA. Reversão farmacológica só pode integrar um plano de despertar quando a oxigenação já foi restaurada — nunca substituir o resgate da via aérea.", "CICO es un fracaso de oxigenación: NO esperar sugammadex, recuperación del bloqueo ni nuevos intentos repetitivos antes de avanzar a eFONA. La reversión farmacológica solo puede integrar un plan de despertar cuando la oxigenación ya se haya restaurado — nunca sustituir el rescate de la vía aérea."],
  ["Se a oxigenação não for restaurada com as manobras de resgate → declarar CICO e executar eFONA sem demora.", "Si la oxigenación no se restablece con las maniobras de rescate → declarar CICO y ejecutar eFONA sin demora."],
  ["Hipotensão pós-IOT: procurar e tratar o mecanismo imediatamente — efeito de drogas/vasoplegia, hipovolemia, pressão intratorácica/auto-PEEP excessiva ou pneumotórax hipertensivo. Dar volume apenas quando houver contexto de hipovolemia/responsividade; titular vasopressor, preferindo infusão quando factível. Push-dose é ponte selecionada conforme protocolo local, não dose fixa universal.", "Hipotensión posintubación: buscar y tratar el mecanismo de inmediato — efecto de fármacos/vasoplejía, hipovolemia, presión intratorácica/auto-PEEP excesiva o neumotórax a tensión. Administrar volumen solo cuando exista un contexto de hipovolemia/respuesta a fluidos; titular el vasopresor, prefiriendo infusión cuando sea factible. El push-dose es un puente seleccionado según protocolo local, no una dosis fija universal."],
  ["Capnografia contínua. Obter gasometria e reavaliar ventilação/oxigenação quando clinicamente indicado após estabilização ou mudanças relevantes do ventilador — sem intervalo universal fixo.", "Capnografía continua. Obtener gasometría y reevaluar ventilación/oxigenación cuando esté clínicamente indicado tras la estabilización o cambios relevantes del ventilador — sin un intervalo universal fijo."],
];

const anchor = '\n};\n';
for (const [pt, es] of entries) {
  const key = JSON.stringify(pt);
  if (src.includes(`${key}:`)) continue;
  const pos = src.lastIndexOf(anchor);
  if (pos < 0) throw new Error('isr.ts: fechamento do dicionário não encontrado');
  src = src.slice(0, pos) + `  ${key}: ${JSON.stringify(es)},\n` + src.slice(pos);
}
fs.writeFileSync(file, src);
console.log(`✅ ISR i18n: ${entries.length} chaves de via acordada/resgate/pós-IOT garantidas.`);
