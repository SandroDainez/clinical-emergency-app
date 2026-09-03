#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'lib/i18n/modules/isr.ts');
let src = fs.readFileSync(file, 'utf8');
const entries = [
  ["Confirmar a indicação pela fisiologia e trajetória, não por um número isolado (FLOW): Failure — apneia ou falha ventilatória com hipercapnia/acidemia apesar do suporte adequado; Lungs — falha de oxigenação apesar de oxigênio/suporte não invasivo otimizados; Obstruction — obstrução de via aérea presente ou ameaçadora; Work — trabalho respiratório crescente, fadiga ou incapacidade de sustentar ventilação. Acrescentar incapacidade de proteger a via aérea por rebaixamento de consciência e deterioração previsível que torne a intubação posterior mais arriscada. PaCO₂, pH, SpO₂, frequência respiratória e GCS ajudam a medir gravidade, mas nenhum valor isolado é requisito universal para intubar.", "Confirmar la indicación por la fisiología y la trayectoria, no por un número aislado (FLOW): Failure — apnea o fracaso ventilatorio con hipercapnia/acidemia a pesar del soporte adecuado; Lungs — fracaso de oxigenación a pesar de oxígeno/soporte no invasivo optimizados; Obstruction — obstrucción de la vía aérea presente o amenazante; Work — aumento del trabajo respiratorio, fatiga o incapacidad para sostener la ventilación. Añadir incapacidad para proteger la vía aérea por disminución del nivel de conciencia y deterioro previsible que haga más riesgosa una intubación posterior. PaCO₂, pH, SpO₂, frecuencia respiratoria y GCS ayudan a medir la gravedad, pero ningún valor aislado es un requisito universal para intubar."],
  ["Há instabilidade ou risco hemodinâmico relevante — hipotensão, choque ou hipoperfusão?", "¿Hay inestabilidad o riesgo hemodinámico relevante — hipotensión, choque o hipoperfusión?"],
  ["GATILHOS DE RETORNO IMEDIATO à estratégia de via aérea: piora do nível de consciência/proteção da via aérea, deterioração da oxigenação apesar do suporte, trabalho respiratório ou frequência respiratória em ascensão, estridor/obstrução progressiva, fadiga ou instabilidade hemodinâmica. Não esperar um corte numérico isolado se a trajetória clínica estiver piorando.", "DESENCADENANTES DE RETORNO INMEDIATO a la estrategia de vía aérea: empeoramiento del nivel de conciencia/protección de la vía aérea, deterioro de la oxigenación a pesar del soporte, aumento del trabajo respiratorio o de la frecuencia respiratoria, estridor/obstrucción progresiva, fatiga o inestabilidad hemodinámica. No esperar un punto de corte numérico aislado si la trayectoria clínica está empeorando."],
  ["Definir explicitamente quando e por quais sinais reavaliar, proporcionalmente ao risco e à velocidade de deterioração. Adiar sem plano de reavaliação é abandono; impor um intervalo universal também é inadequado.", "Definir explícitamente cuándo y por qué signos reevaluar, de forma proporcional al riesgo y a la velocidad de deterioro. Posponer sin un plan de reevaluación es abandono; imponer un intervalo universal también es inadecuado."],
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
console.log(`✅ ISR i18n: ${entries.length} chaves de indicação/retorno garantidas.`);
