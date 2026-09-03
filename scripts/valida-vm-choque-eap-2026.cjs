#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const src=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');
const checks=[
 ['sepse sem SARA usa 6–8 PBW',src.includes('Sem SARA: VC 6–8 mL/kg PBW')],
 ['sepse não fixa PEEP 5–8',!src.includes('PEEP 5–8 (moderado — evitar reduzir o retorno venoso)')],
 ['sepse não fixa SpO2 >=94/PaCO2 35–45',!src.includes('Alvos: SpO₂ ≥ 94%, PaCO₂ 35–45, lactato em queda')],
 ['sepse contextualiza oxigenação 90–96',src.includes('aproximadamente entre SpO₂ 90–96%')],
 ['lactato não é alvo ventilatório',src.includes('lactato como alvos ventilatórios universais')],
 ['EAP não fixa PEEP 8–12',!src.includes('PEEP 8–12 cmH₂O: reduz pré/pós-carga')],
 ['EAP não fixa PaCO2 35–45',src.includes('35–45 mmHg não é alvo ventilatório universal no EAP')],
 ['EAP reconhece risco hemodinâmico de pressão positiva',src.includes('choque cardiogênico ou falência de VD')],
 ['VNI precoce sem atrasar IOT',src.includes('CPAP/BiPAP deve ser considerada precocemente')&&src.includes('não atrasar IOT')],
];
const f=checks.filter(([,ok])=>!ok);if(f.length){console.error('\n❌ VM sepse/EAP 2026:');for(const [n] of f)console.error('   - '+n);process.exit(1);}console.log(`✅ VM sepse/EAP 2026: ${checks.length} travas aprovadas.`);
