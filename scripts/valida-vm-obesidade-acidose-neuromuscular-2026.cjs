#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const t=fs.readFileSync(path.resolve(__dirname,'..','ventilation-decision-tree.ts'),'utf8');const c=[];const ok=(n,v)=>c.push([n,!!v]);
ok('obesidade usa PBW 6–8 e PEEP individualizada',t.includes('VC 6–8 mL/kg do peso PREDITO')&&t.includes('não usar 8–12 cmH₂O como faixa obrigatória'));
ok('obesidade sem normocapnia/SpO2 universal',t.includes('sem perseguir normocapnia automaticamente')&&!t.includes('Alvos: SpO₂ ≥ 94%, PaCO₂ 35–45. Desmame tende a ser mais lento.'));
ok('acidose preserva compensação e evita normocapnia',t.includes('preservar a compensação ventilatória')&&t.includes('não buscar 35–45 mmHg por rotina'));
ok('Winter é estimativa e não alvo obrigatório',t.includes('estima a compensação esperada')&&t.includes('não substitui o estado real do paciente'));
ok('sem fórmula universal de ventilação-minuto',!t.includes('~120 mL/kg/min')&&t.includes('Não aplicar uma fórmula universal em mL/kg/min'));
ok('sem gasometria 20–30 min/pH 7,25 obrigatório',!t.includes('TITULAR PELA GASOMETRIA em 20–30 min')&&t.includes('sem impor intervalo fixo de 20–30 min ou alvo universal de pH'));
ok('bicarbonato/TRS contextualizados',t.includes('apenas quando houver indicação pela etiologia, gravidade e contexto'));
ok('neuromuscular sem percentuais fixos de coorte',!t.includes('56% em Guillain-Barré')&&!t.includes('Atelectasia ocorre em 49%'));
ok('neuromuscular prioriza secreções/tosse',t.includes('DEPURAÇÃO DE SECREÇÕES é parte central do tratamento'));
ok('liberação neuromuscular é multimodal',t.includes('pressão inspiratória máxima ou capacidade vital isoladas não devem decidir sozinhas'));
const f=c.filter(([,v])=>!v);if(f.length){console.error('\n❌ VM obesidade/acidose/neuromuscular 2026:');for(const [n] of f)console.error('   - '+n);process.exit(1);}console.log(`✅ VM obesidade/acidose/neuromuscular 2026: ${c.length} travas aprovadas.`);