#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'tce-i18n-runtime-'));
try {
  execFileSync('npx', [
    'tsc', '--module', 'node16', '--target', 'es2020', '--esModuleInterop',
    '--moduleResolution', 'node16', '--skipLibCheck', '--outDir', temp,
    path.join(root, 'tce-decision-tree.ts'), path.join(root, 'lib/i18n/index.ts')
  ], { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] });
} catch (e) {
  console.error('❌ não foi possível compilar o recorte TCE+i18n para teste de runtime');
  fs.rmSync(temp, { recursive: true, force: true });
  process.exit(1);
}

const { tceDecisionTree } = require(path.join(temp, 'tce-decision-tree.js'));
const { tr } = require(path.join(temp, 'lib/i18n/index.js'));
const checks = [];
function locate(strings, fragment) {
  const hit = strings.find((s) => typeof s === 'string' && s.includes(fragment));
  if (!hit) throw new Error(`não encontrei string TCE com fragmento: ${fragment}`);
  return hit;
}
function assertTranslated(label, pt) {
  const es = tr(pt, 'es-419');
  if (!es || es === pt) throw new Error(`${label}: permaneceu em português no runtime: ${pt}`);
  checks.push(label);
  console.log(`✅ ${label}`);
}

try {
  const grave = tceDecisionTree.nodes.tce_grave.actions;
  const hic = tceDecisionTree.nodes.conduta_hic.actions;
  const anticoag = tceDecisionTree.nodes.anticoag.evidence;
  const reversao = tceDecisionTree.nodes.reversao.actions;
  const uti = tceDecisionTree.nodes.uti.exitCriteria;
  const neuro = tceDecisionTree.nodes.neurocirurgia.exitCriteria;

  assertTranslated('metas de neuroproteção', locate(grave, 'SpO₂ ≥ 94% (PaO₂ 80–100 mmHg'));
  assertTranslated('causas reversíveis sem atrasar herniação', locate(hic, 'Em paralelo à terapia urgente'));
  assertTranslated('osmoterapia e limites de segurança', locate(hic, 'Na 155–160 mEq/L'));
  assertTranslated('EVD sem volume fixo universal', locate(hic, 'Não prescrever volume fixo universal'));
  assertTranslated('TC normal sem repetição automática', locate(anticoag, 'TC normal não cria indicação automática'));
  assertTranslated('antiagregação sem reversão rotineira', locate(reversao, 'transfusão de plaquetas NÃO é rotina no TCE'));
  assertTranslated('sódio basal sem hipernatremia profilática', locate(uti, 'Na 135–145 mEq/L como alvo basal'));
  assertTranslated('metas UTI atualizadas', locate(uti, 'SpO₂ ≥ 94% e PaO₂ 80–100 mmHg'));
  assertTranslated('neurocirurgia com alvo de oxigenação atualizado', locate(neuro, 'SpO₂ ≥ 94% e PaO₂ 80–100 mmHg'));
} catch (e) {
  console.error(`❌ ${e.message}`);
  fs.rmSync(temp, { recursive: true, force: true });
  process.exit(1);
}

fs.rmSync(temp, { recursive: true, force: true });
console.log(`\n✅ TCE runtime ES-419: ${checks.length} superfícies críticas traduzidas.`);
