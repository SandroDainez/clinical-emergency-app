#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tree = fs.readFileSync(path.join(root, 'rsi-decision-tree.ts'), 'utf8');
const checks = [];
const ok = (name, value) => checks.push([name, Boolean(value)]);

ok('via acordada não presume confirmação', tree.includes('next: "via_acordada_resultado"'));
ok('resultado acordado é decisão executável', tree.includes('id: "via_acordada_resultado"') && tree.includes('next: "via_acordada_falha"'));
ok('falha acordada tem três estratégias', tree.includes('id: "via_acordada_falha"') && tree.includes('Nova tentativa acordada — dentro do limite 3+1') && tree.includes('Converter para ISR com resgate/eFONA preparados') && tree.includes('Adiar — otimizar e reavaliar'));
ok('lidocaína tópica usa teto DAS por peso magro', tree.includes('teto de 9 mg/kg de peso corporal magro') && !tree.includes('máx ~4 mg/kg'));
ok('sedação acordada não elege regime fixo', tree.includes('Não há regime sedativo único demonstrado como superior') && !tree.includes('dexmedetomidina 1 mcg/kg em 10 min'));
ok('oxigênio contínuo acordado preservado', tree.includes('O₂ contínuo (cânula nasal/HFN) durante toda a tentativa'));
ok('confirmação acordada em dois pontos', tree.includes('visualização da posição traqueal + capnografia com CO₂ expirado sustentado'));
ok('tentativas convencionais sem corte 30 s/SpO2 90', !tree.includes('Limitar a tentativa a ~30 s ou até SpO₂ ~90%'));
ok('tentativas convencionais sem regra de duas por operador', !tree.includes('Máximo 2 tentativas com o mesmo operador/dispositivo') && !tree.includes('Máx 2 tentativas por operador/dispositivo'));
ok('DAS 2025 3+1 com declaração precoce de falha', tree.includes('teto do Plano A é 3 tentativas + 1 por operador mais experiente') && tree.includes('declarada ANTES'));
ok('confirmação RSI em dois pontos', tree.includes('Há confirmação traqueal em dois pontos — visualização E capnografia'));
ok('sem regra rígida de seis ventilações', !tree.includes('persistente em ≥ 6 ventilações'));
ok('CICO não espera sugamadex', tree.includes('CICO é falha de oxigenação: NÃO esperar sugamadex') && !tree.includes('sugamadex {sugam} mg IV (16 mg/kg) — reverte em < 3 min; considerar despertar'));
ok('CICO explicita eFONA sem demora', tree.includes('declarar CICO e executar eFONA sem demora'));
ok('pós-IOT sem norepinefrina fixa', !tree.includes('noradrenalina 8–12 mcg IV em bolus se refratária'));
ok('pós-IOT sem volume rotineiro', tree.includes('Dar volume apenas quando houver contexto de hipovolemia/responsividade'));
ok('pós-IOT sem gasometria em prazo fixo', !tree.includes('Gasometria arterial 20–30 min') && tree.includes('sem intervalo universal fixo'));
ok('capnografia contínua pós-IOT preservada', tree.includes('Capnografia contínua. Obter gasometria'));

const failed = checks.filter(([, value]) => !value);
if (failed.length) {
  console.error('\n❌ ISR/via-acordada-resgate-pós-IOT 2026:');
  for (const [name] of failed) console.error(`   - ${name}`);
  process.exit(1);
}
console.log(`\n✅ ISR/via-acordada-resgate-pós-IOT 2026: ${checks.length} verificações aprovadas.\n`);
