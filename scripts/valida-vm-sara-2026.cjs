#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
const tree=fs.readFileSync(path.join(root,'ventilation-decision-tree.ts'),'utf8');const tabela=fs.readFileSync(path.join(root,'lib/tabela-peep.ts'),'utf8');const checks=[];const ok=(n,v)=>checks.push([n,!!v]);
ok('Global Definition 2024 explícita',tree.includes('Global Definition 2024 amplia Berlim')&&tree.includes('S/F ≤ 315 quando SpO₂ ≤ 97%')&&tree.includes('HFNO ≥ 30 L/min'));
ok('título não promete terapia única',!tree.includes('único tratamento que reduz mortalidade'));
ok('Pplat preservada e DP não é corte universal',tree.includes('Pplat ≤ 30 cmH₂O')&&tree.includes('não tratá-la como corte universal isolado'));
ok('sem faixas próprias de PEEP por gravidade',!tree.includes('leve 5–8 · moderada 8–13 · grave 13–18')&&!tree.includes('partida sugerida 8 · 10 · 14'));
ok('PEEP parte de estratégia validada e individualiza',tree.includes('iniciar por estratégia PEEP/FiO₂ validada')&&tree.includes('individualizar por oxigenação, recrutabilidade, mecânica e hemodinâmica'));
ok('PEEP moderada-grave pode ser mais alta sem LRM alta pressão',tree.includes('PEEP mais alta sem manobras de recrutamento de alta pressão'));
ok('recrutamento agressivo/prolongado evitado',tree.includes('evitar recrutamento agressivo/prolongado')&&tabela.includes('evitar manobras de recrutamento de alta pressão ou prolongadas'));
ok('prona em PF <150 e sessão prolongada',tree.includes('P/F < 150')&&tree.includes('≥ 12–16 h/dia'));
ok('BNM não é rotina',tree.includes('Bloqueador neuromuscular NÃO é rotina')&&tree.includes('pacientes selecionados'));
ok('ECMO sem cortes EOLIA transformados em regra',tree.includes('avaliação precoce para ECMO-VV')&&!tree.includes('ECMO-VV se refratária (P/F < 80, pH < 7,25'));
ok('tabela virou ponto de partida, não degrau próprio',tree.includes('Tabela PEEP/FiO₂ (ARDSNet) — referência para titulação')&&tree.includes('ponto de partida validado'));
const failed=checks.filter(([,v])=>!v);if(failed.length){console.error('\n❌ VM/SARA 2026:');for(const [n] of failed)console.error('   - '+n);process.exit(1);}console.log(`\n✅ VM/SARA 2026: ${checks.length} verificações aprovadas.\n`);
