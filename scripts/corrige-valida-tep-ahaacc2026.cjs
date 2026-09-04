#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const p = path.resolve(__dirname, 'valida-tep.cjs');
let s = fs.readFileSync(p, 'utf8');

const reps = [
  [
    'if (!/Intermediário-ALTO: disfunção de VD E biomarcadores/.test(arvore)) {',
    'const separacaoC3 = /Intermediário-ALTO: disfunção de VD E biomarcadores/.test(arvore) || /C3 = VD anormal E pelo menos um biomarcador anormal/.test(arvore);\n  if (!separacaoC3) {'
  ],
  [
    '["o critério hemodinâmico do alto risco", /PAS < 90 mmHg ou queda ≥ 40 mmHg/],',
    '["a separação hemodinâmica D/E ou o critério legado equivalente", /PAS < 90 mmHg ou queda ≥ 40 mmHg|D1: hipotensão transitória\\/recorrente|E1: hipotensão recorrente ou persistente/],'
  ],
  [
    '["a inversão da conta em PCR", /EM PCR OU COLAPSO IMINENTE, AS RELATIVAS TORNAM-SE ACEITÁVEIS/],',
    '["o balanço risco-benefício em PCR", /EM PCR OU COLAPSO IMINENTE, AS RELATIVAS TORNAM-SE ACEITÁVEIS|contraindicações relativas não devem funcionar como veto mecânico/],'
  ],
  [
    '["a saída de menor dose pelo cateter", /via de CATETER, que usa dose menor/],',
    '["a alternativa por cateter sem promessa universal de menor risco", /via de CATETER, que usa dose menor|Trombólise cateter-dirigida|embolectomia mecânica/],'
  ],
  [
    'if (/AHA\\/ACC 2026 — nova classificação A–E/.test(arvore) && !/A subclínico/.test(arvore)) {',
    'const citaClassificacao2026 = /AHA\\/ACC 2026|Classificação clínica AHA\\/ACC 2026/.test(arvore);\n  const categorias2026Explicitas = (/A subclínico/.test(arvore) && /B baixa gravidade/.test(arvore) && /C gravidade elevada/.test(arvore) && /D falência incipiente/.test(arvore) && /E falência cardiopulmonar/.test(arvore)) || (/A = TEP incidental assintomático/.test(arvore) && /B = sintomático com baixo escore de gravidade/.test(arvore) && /C = sintomático com escore elevado/.test(arvore) && /D = falência cardiopulmonar incipiente/.test(arvore) && /E = falência cardiopulmonar/.test(arvore));\n  if (citaClassificacao2026 && !categorias2026Explicitas) {'
  ],
];

let changed = 0;
for (const [from, to] of reps) {
  if (s.includes(to)) continue;
  if (!s.includes(from)) throw new Error(`Trecho do validator não encontrado: ${from.slice(0, 100)}`);
  s = s.replace(from, to);
  changed++;
}
fs.writeFileSync(p, s);
console.log(`✅ valida-tep modernizado semanticamente para AHA/ACC 2026 (${changed} ajustes).`);
