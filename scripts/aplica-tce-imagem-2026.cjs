#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

function replaceExact(file, before, after, label) {
  let s = fs.readFileSync(file, 'utf8');
  if (s.includes(after)) return false;
  const count = s.split(before).length - 1;
  if (count !== 1) throw new Error(`${label}: esperado 1 alvo, encontrado ${count}`);
  s = s.replace(before, after);
  fs.writeFileSync(file, s);
  return true;
}

const tree = path.join(root, 'tce-decision-tree.ts');
const test = path.join(root, 'scripts', 'valida-tce.cjs');

replaceExact(
  tree,
  '"⚠️ INDEPENDENTEMENTE DE QUALQUER REGRA DE IMAGEM, ESTES CINCO PEDEM TC: anticoagulação ou antiagregação, coagulopatia, déficit focal, convulsão pós-trauma e intoxicação. Nenhum escore os dispensa — a regra canadense abaixo é para quem NÃO tem nenhum deles.",',
  '"⚠️ NÃO transformar a Canadian CT Head Rule em regra universal. Déficit focal, convulsão pós-trauma, suspeita de fratura e outros sinais de alto risco indicam TC. Em anticoagulante ou antiagregante (EXCETO aspirina em monoterapia), considerar TC mesmo sem outro critério; intoxicação isolada torna o exame menos confiável e exige julgamento/observação, mas não é indicação automática de TC por si só.",',
  'summary TCE leve'
);

replaceExact(
  tree,
  '"Independentemente da regra: ANTICOAGULAÇÃO ou antiagregação, coagulopatia, déficit focal, convulsão pós-trauma ou intoxicação = TC.",',
  '"Fora da Canadian CT Head Rule: déficit focal, convulsão pós-trauma e sinais de fratura/lesão grave têm indicação própria de TC. Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), o NICE recomenda CONSIDERAR TC mesmo sem outra indicação; coagulopatia aumenta o risco. Intoxicação isolada reduz a confiabilidade do exame e exige julgamento clínico/observação, não TC automática apenas por esse motivo.",',
  'evidence antitromboticos'
);

replaceExact(
  tree,
  '"Se anticoagulado: observação prolongada e TC mesmo com exame normal.",',
  '"Em anticoagulante ou antiagregante (exceto aspirina em monoterapia), considerar TC mesmo sem outro critério conforme risco e possibilidade de seguimento. Após TC normal, não impor observação prolongada apenas pelo fármaco: decidir pela evolução clínica, confiabilidade do exame, supervisão disponível e capacidade de retorno.",',
  'observacao anticoagulado'
);

replaceExact(
  tree,
  '"Repetir TC em 6–12 h da TC INICIAL ou se houver qualquer deterioração neurológica.",',
  '"Repetir TC IMEDIATAMENTE se houver deterioração neurológica. Em paciente estável com lesão já conhecida, individualizar TC seriada conforme tipo/tamanho da lesão, gravidade do TCE, exame neurológico, anticoagulação/coagulopatia, intervenção planejada e protocolo neurocirúrgico — não impor janela fixa de 6–12 h a todos.",',
  'TC seriada'
);

// Compatibilidade do validador legado com TypeScript atual, sem remover nenhuma checagem.
replaceExact(
  test,
  '"tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",\n      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,',
  '"tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--esModuleInterop",\n      "--moduleResolution", "node16", "--skipLibCheck", "--outDir", tempDir,',
  'TypeScript valida-tce'
);

console.log('✅ TCE imagem 2026: critérios de TC, antitrombóticos e repetição seriada contextualizados.');
