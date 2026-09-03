#!/usr/bin/env node
const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');const src=fs.readFileSync(path.join(root,'tce-decision-tree.ts'),'utf8');
const failures=[];let ok=0;const checks=[
['normotermia 36-37.5 presente',/normotermia controlada[^\n]+36,0–37,5 °C/],
['hipotermia apenas apos tiers 1-2',/PIC permanecer refratária apesar dos tiers 1–2[^\n]+hipotermia terapêutica <36 °C/],
['alvo hipotermia perto da fisiologia',/manter o alvo o mais próximo possível da fisiologia/],
['sem alvo universal 32-34',!/temperatura central de 32–34 °C/.test(src)],
['barbiturico apenas refrataria e estabilidade',/barbitúrico em dose alta para PIC refratária apenas com estabilidade hemodinâmica/],
['sem padrao universal burst suppression',/não impõe um agente, esquema de dose ou padrão universal de surto-supressão/],
['sem surto 5-20s ou 50%',!/surtos de 5–20 s, ou 50% do traçado em supressão/.test(src)],
['sem TC UTI 6-12h',!/TC de controle em 6–12 h/.test(src)],
['TC seriada UTI individualizada',/individualizar imagem de controle conforme padrão da lesão/],
['UTI sem natremia mais alta',!/2ª \(sedação profunda, natremia mais alta, craniectomia\)/.test(src)],
['sem ordem obrigatoria entre resgates',/Não impor 32–34 °C como alvo universal nem uma ordem obrigatória entre hipotermia, barbitúrico e craniectomia/]
];for(const [name,rule] of checks){const pass=typeof rule==='boolean'?rule:rule.test(src);if(pass)ok++;else failures.push(name);}if(failures.length){console.error('❌ TCE HIC refratária 2026:');for(const f of failures)console.error(' - '+f);process.exit(1);}console.log(`✅ TCE HIC refratária 2026: ${ok} travas aprovadas.`);
