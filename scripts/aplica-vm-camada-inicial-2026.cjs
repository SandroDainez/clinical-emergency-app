#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname, '..', 'ventilation-decision-tree.ts');
let src = fs.readFileSync(file, 'utf8');
function r(label,before,after){if(src.includes(after))return;const n=src.split(before).length-1;if(n!==1)throw new Error(`${label}: esperado 1 alvo, encontrados ${n}`);src=src.replace(before,after);}

r('indicacao',
`        "Indicação/objetivo: corrigir hipoxemia (P/F < 150–200 refratária), hipoventilação (pH < 7,25–7,30), proteger via aérea (GCS ≤ 8) ou reduzir trabalho respiratório.",`,
`        "Indicação/objetivo: oferecer suporte invasivo quando houver falha de oxigenação ou ventilação apesar do suporte adequado, incapacidade de proteger a via aérea, trabalho respiratório/fadiga incompatíveis com ventilação sustentável ou deterioração previsível que torne a intubação posterior mais arriscada. P/F, pH, PaCO₂, frequência respiratória e GCS medem gravidade, mas nenhum corte isolado é requisito universal para iniciar ventilação invasiva.",`);

r('gasometria-entry',
`        "Gasometria arterial 20–30 min após estabilizar os parâmetros.",`,
`        "Gasometria arterial quando clinicamente indicada após estabilização ou mudanças ventilatórias relevantes; capnografia, oximetria e curvas orientam reavaliação contínua. Não impor um intervalo universal fixo.",`);

r('fr-generica',
`        "FR 12–16/min (ajustar para PaCO₂ 35–45 e pH 7,35–7,45; vigiar auto-PEEP); relação I:E ~1:2; fluxo 40–60 L/min (VCV).",`,
`        "Frequência respiratória e ventilação-minuto devem ser ajustadas à fisiologia e ao distúrbio ácido-base. Em adulto sem grande alteração metabólica/obstrutiva, 12–16/min pode ser um ponto de partida, mas NÃO forçar PaCO₂ 35–45 ou pH normal antes de considerar o cenário; TCE, obstrução e acidose metabólica têm alvos próprios nos ramos abaixo. Vigiar auto-PEEP e ajustar I:E/fluxo ao tempo expiratório necessário.",`);

r('peep-fio2-generica',
`        "PEEP inicial 5 cmH₂O; FiO₂ 1,0 → reduzir o mais rápido possível para SpO₂ 94–98% / PaO₂ 60–100 (evitar hiperóxia).",`,
`        "PEEP e FiO₂ não têm um único par correto para todos. Em pulmão sem hipoxemia importante, PEEP 5 cmH₂O é um ponto de partida comum; SARA/obesidade podem exigir PEEP maior e obstrução pode exigir outra estratégia. Após a intubação, usar FiO₂ suficiente para segurança imediata e titular para a menor FiO₂ que alcance o alvo de oxigenação apropriado ao cenário, evitando hiperóxia.",`);

r('pressao-seguranca',
`        "Meta de segurança: pressão de platô ≤ 30 cmH₂O e driving pressure (platô − PEEP) ≤ 15 cmH₂O.",`,
`        "Segurança mecânica: medir pressão de platô e driving pressure. Na SARA, limitar Pplat a ≤ 30 cmH₂O tem recomendação forte. Driving pressure é marcador prognóstico útil e deve ser minimizada junto com Vt/PEEP, mas ≤ 15 cmH₂O não deve aparecer como corte universal com o mesmo nível de evidência.",`);

r('remedir-pressao',
`        "QUANDO REMEDIR: a Pplat não é medida uma vez — remedir a cada mudança de parâmetro e periodicamente (a cada 4–8 h) enquanto o paciente estiver instável. Complacência muda ao longo do dia, e um platô aceitável às 8h não garante o das 14h.",`,
`        "QUANDO REMEDIR: a Pplat não é medida uma vez. Reavaliar após mudanças relevantes de Vt, PEEP, mecânica pulmonar, posição ou condição clínica e com frequência proporcional à instabilidade; não usar um relógio universal de 4–8 h para todos.",`);

fs.writeFileSync(file,src);
console.log('✅ VM: camada inicial separa princípios universais de alvos dependentes da patologia.');
