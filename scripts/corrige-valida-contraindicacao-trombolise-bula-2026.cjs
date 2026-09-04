#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const target = path.resolve(__dirname, 'valida-contraindicacao-trombolise.cjs');
let src = fs.readFileSync(target, 'utf8');

const replacements = [
  [
    ' *   divergência do TEP nomeie as duas fontes.',
    ' *   regra do TEP permaneça ancorada na bula/protocolo atual, sem inventar janela universal.'
  ],
  [
    ' *   fontes abertas foram bula, tabela adaptada e revisão (R-52), o que está\n *   declarado na tela.',
    ' *   fontes abertas e contratos clínicos sejam verdadeiros; a lista do TEP é ancorada\n *   na bula/protocolo atual e não transforma fontes secundárias antigas em janela universal.'
  ],
  [
    ' *   AVC isquêmico recente → 3 meses no AVC; 3 meses na SCA COM EXCEÇÃO de 4,5 h;\n *                           3 (StatPearls) × 6 (ESC) no TEP',
    ' *   AVC isquêmico recente → 3 meses no AVC; 3 meses na SCA COM EXCEÇÃO de 4,5 h;\n *                           no TEP, seguir bula/protocolo atual sem inventar 3 × 6 meses'
  ],
  [
    'const duvida = (n.options ?? []).find((o) => /não sei/i.test(o.label ?? ""));',
    'const duvida = (n.options ?? []).find((o) => /não sei|incert|revisar contraindica/i.test(o.label ?? ""));'
  ],
  [
    '["tep", /StatPearls[\\s\\S]{0,80}3 MESES[\\s\\S]{0,200}ESC 2019[\\s\\S]{0,40}6 MESES/i,\n      "a divergência do TEP tem de dizer QUAL fonte diz o quê"],',
    '["tep", /bula oficial atual do Activase[\\s\\S]{0,160}história de AVC recente/i,\n      "no TEP a incerteza temporal do AVC prévio deve ficar ancorada na bula atual, sem falsa janela universal"],'
  ],
];

for (const [from, to] of replacements) {
  if (!src.includes(from) && !src.includes(to)) {
    throw new Error(`Trecho legado não localizado: ${from.slice(0, 100)}`);
  }
  if (src.includes(from)) src = src.replace(from, to);
}

fs.writeFileSync(target, src);
console.log('✅ Validator legado de trombólise alinhado à saída explícita de incerteza e à bula atual do TEP.');
