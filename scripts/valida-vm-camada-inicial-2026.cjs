#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const tree=fs.readFileSync(path.join(root,'ventilation-decision-tree.ts'),'utf8');const checks=[];const ok=(n,v)=>checks.push([n,Boolean(v)]);
ok('indicação sem P/F/pH/GCS como requisitos',!tree.includes('P/F < 150–200 refratária')&&!tree.includes('pH < 7,25–7,30')&&!tree.includes('proteger via aérea (GCS ≤ 8)')&&tree.includes('nenhum corte isolado é requisito universal para iniciar ventilação invasiva'));
ok('gasometria sem relógio fixo',!tree.includes('Gasometria arterial 20–30 min após estabilizar os parâmetros')&&tree.includes('Não impor um intervalo universal fixo'));
ok('FR genérica não força normocapnia',!tree.includes('ajustar para PaCO₂ 35–45 e pH 7,35–7,45')&&tree.includes('NÃO forçar PaCO₂ 35–45 ou pH normal'));
ok('ramos especiais mantêm propriedade dos alvos',tree.includes('TCE, obstrução e acidose metabólica têm alvos próprios nos ramos abaixo'));
ok('PEEP 5 é ponto de partida contextual',tree.includes('PEEP 5 cmH₂O é um ponto de partida comum')&&tree.includes('não têm um único par correto para todos'));
ok('oxigênio é titulado ao cenário',!tree.includes('SpO₂ 94–98% / PaO₂ 60–100')&&tree.includes('alvo de oxigenação apropriado ao cenário'));
ok('Pplat <=30 vinculada à SARA',tree.includes('Na SARA, limitar Pplat a ≤ 30 cmH₂O tem recomendação forte'));
ok('driving pressure não é corte universal',!tree.includes('driving pressure (platô − PEEP) ≤ 15 cmH₂O')&&tree.includes('≤ 15 cmH₂O não deve aparecer como corte universal'));
ok('sem relógio 4-8h para Pplat',!tree.includes('periodicamente (a cada 4–8 h)')&&tree.includes('não usar um relógio universal de 4–8 h'));
const failed=checks.filter(([,v])=>!v);if(failed.length){console.error('\n❌ VM/camada inicial 2026:');for(const[n]of failed)console.error('   - '+n);process.exit(1);}console.log(`\n✅ VM/camada inicial 2026: ${checks.length} verificações aprovadas.\n`);
