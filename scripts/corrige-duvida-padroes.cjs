const fs = require('node:fs');

function addSummary(path, needle, insertion, label) {
  const src = fs.readFileSync(path, 'utf8');
  const count = src.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: âncora encontrada ${count} vez(es)`);
  fs.writeFileSync(path, src.replace(needle, insertion));
}

addSummary(
  'acls-bradycardia-tree.ts',
  `      question: "O paciente está estável com MP-TC e/ou infusão de droga cronotrópica?",\n      evidence: [`,
  `      question: "O paciente está estável com MP-TC e/ou infusão de droga cronotrópica?",\n      summary: "Na dúvida, se FC, PA, perfusão ou captura não estão claramente adequadas e sustentadas, considere a resposta ainda inadequada e mantenha o suporte enquanto reavalia.",\n      evidence: [`,
  'bradicardia pós-segunda linha'
);

addSummary(
  'shock-decision-tree.ts',
  `      question: "Há instabilidade/peri-parada com sinais que sugiram obstrução ao enchimento ou à circulação pulmonar (pneumotórax hipertensivo, tamponamento ou TEP de alto risco)?",\n      evidence: [`,
  `      question: "Há instabilidade/peri-parada com sinais que sugiram obstrução ao enchimento ou à circulação pulmonar (pneumotórax hipertensivo, tamponamento ou TEP de alto risco)?",\n      summary: "Na dúvida, não descarte causa obstrutiva por falta de confirmação: mantenha a hipótese aberta e procure rapidamente sinais dirigidos no exame e no POCUS à beira-leito.",\n      evidence: [`,
  'choque obstrutivo'
);

console.log('✅ regras explícitas de dúvida adicionadas sem alterar roteamento clínico');
