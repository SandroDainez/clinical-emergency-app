#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','shock-decision-tree.ts'),'utf8');const checks=[
['obstrutivo não depende de tríade fixa',src.includes('sinais que sugiram obstrução ao enchimento ou à circulação pulmonar')],
['pneumotórax não exige desvio de traqueia',!src.includes('Murmúrio ausente + desvio de traqueia + timpanismo')],
['pneumotórax instável é clínico/POCUS sem RX',src.includes('Diagnóstico no paciente instável é clínico e/ou por POCUS')&&src.includes('NÃO aguardar radiografia')],
['desvio/JVD são tardios não obrigatórios',src.includes('frequentemente tardios')&&src.includes('sua ausência não exclui pneumotórax hipertensivo')],
['trauma extremo privilegia toracostomia',src.includes('toracostomia aberta/finger no 4º–5º espaço intercostal')],
['tamponamento não depende da tríade de Beck',!src.includes('Sons cardíacos abafados + distensão jugular + hipotensão (tríade de Beck)')],
['tamponamento usa POCUS/contexto',src.includes('ecocardiografia/POCUS à beira leito')&&src.includes('não são necessários nem suficientemente sensíveis')],
['trauma penetrante diferencia abordagem cirúrgica',src.includes('trauma penetrante com peri-parada/parada')&&src.includes('toracotomia ressuscitativa')],
['TEP alto risco prioriza reperfusão',src.includes('TEP de ALTO RISCO')&&src.includes('priorizar reperfusão emergencial')],
['TEP evita volume agressivo',src.includes('Evitar expansão volêmica agressiva')],
['noradrenalina e dobutamina contextualizadas',src.includes('Noradrenalina é o vasopressor de escolha')&&src.includes('não como associação automática')]
];let f=0;for(const [n,o] of checks){if(o)console.log('✅ '+n);else{console.error('❌ '+n);f++}}if(f)process.exit(1);console.log(`\n✅ Choque obstrutivo ERC/ESC — ${checks.length} travas aprovadas`);
