#!/usr/bin/env node
const fs=require('node:fs');
const path=require('node:path');
const file=path.resolve(__dirname,'valida-choque.cjs');
let s=fs.readFileSync(file,'utf8');
const old='// ── D. A exceção do IAM de VD, que era o modelo ───────────────────────────\n{\n  if (!/EXCEÇÃO — IAM de ventrículo direito/.test(arvore)) {\n    falhas.push(\n      `${ARVORE}: sumiu a exceção do IAM de VD. Ela é o MODELO de como o módulo nomeia uma confusão ` +\n      `perigosa e escreve a conduta invertida — e é por isso que o texto novo foi escrito na mesma forma.`\n    );\n  } else ok++;\n}';
const neu='// ── D. A ressalva do IAM de VD, preservada semanticamente ─────────────────\n{\n  const nomeiaVD = /IAM de ventrículo direito/.test(arvore);\n  const evitaVolumeLiberal = /NÃO autoriza volume liberal/.test(arvore) || /volume NÃO é tratamento automático/.test(arvore);\n  const pequenaAliquota = /pequenas alíquotas|pequena alíquota/.test(arvore);\n  const reavaliaCongestao = /congestão|ausência de resposta/.test(arvore);\n  if (!(nomeiaVD && evitaVolumeLiberal && pequenaAliquota && reavaliaCongestao)) {\n    falhas.push(\n      `${ARVORE}: a ressalva do IAM de VD perdeu a inversão clínica segura: deve nomear o IAM de VD, ` +\n      `impedir volume liberal, limitar a pequenas alíquotas quando baixa pré-carga for provável e exigir reavaliação.`\n    );\n  } else ok++;\n}';
if(s.includes(neu)){console.log('✅ valida-choque já usa semântica atual do IAM de VD.');process.exit(0)}
if(!s.includes(old)) throw new Error('Bloco legado do IAM de VD não encontrado');
s=s.replace(old,neu);
fs.writeFileSync(file,s);
console.log('✅ Validator de choque atualizado para a semântica segura do IAM de VD.');
