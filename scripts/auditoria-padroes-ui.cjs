/**
 * PROMETE: que divergências de PADRÃO DE INTERAÇÃO não aumentem e que campos
 * numéricos clínicos não voltem silenciosamente a caixas de digitação.
 *
 * A regra de produto é simples:
 *   número clínico -> slider/stepper;
 *   texto verdadeiro -> TextInput.
 *
 * Este auditor mede quatro classes de dívida:
 *  1. TextInput numérico em telas de módulo;
 *  2. campo numérico de árvore sem faixa de entrada;
 *  3. módulo fora da UI v2;
 *  4. decisão de estabilidade/gravidade sem caminho guiado.
 *
 * O teto é dívida congelada: só pode descer.
 */
const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const { conferirUniverso } = require("./lib/universo.cjs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "padroes-"));

function telas(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git/.test(p)) telas(p, out);
    } else if (/\.tsx$/.test(f.name)) {
      out.push(p);
    }
  }
  return out;
}

// Inputs de autenticação e o componente genérico de texto não pertencem à regra
// clínica. app/index é autenticação/infra e app/dev contém apenas showcases de
// componentes; nenhum dos dois representa uma tela de atendimento em produção.
const NEUTRO = /password-input|ui-v2\/input|app\/index|app\/dev\//;
const caixas = [];
for (const t of telas(path.join(app, "components")).concat(telas(path.join(app, "app")))) {
  const rel = path.relative(app, t);
  if (NEUTRO.test(rel)) continue;
  const src = fs.readFileSync(t, "utf8");
  const n = (src.match(/<TextInput/g) || []).length;
  if (!n) continue;

  // Contamos o próprio bloco do TextInput. Além do literal keyboardType="numeric",
  // também tratamos como numérico qualquer expressão de keyboardType que contenha
  // um ramo "numeric"/"decimal-pad"/"number-pad". Isso captura o legado do shell,
  // por exemplo `keyboardType={field.customKeyboard === "numeric" ? "numeric" : "default"}`.
  const blocos = [...src.matchAll(/<TextInput\b[\s\S]*?(?:\/>|>)/g)].map((m) => m[0]);
  const numericos = blocos.filter((b) => {
    const prop = b.match(/keyboardType\s*=\s*(?:\{[\s\S]*?\}|["'][^"']+["'])/);
    return Boolean(prop && /["'](?:numeric|decimal-pad|number-pad)["']/.test(prop[0]));
  }).length;
  caixas.push({ rel, total: n, numericos });
}

// ── 2/4. Árvores: faixa de entrada e caminho guiado ──────────────────────────
const arqs = fs.readdirSync(app).filter((f) => /-(decision-)?tree\.ts$/.test(f)).sort();
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib", "faixas-de-entrada.ts"), ...arqs.map((f) => path.join(app, f))],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] });
const { FAIXA_DE_ENTRADA } = require(path.join(tmp, "lib", "faixas-de-entrada.js"));

const ESTAB = /instabil|instável|instavel|est[áa]vel|gravidade|grave\b|crítico|critico|choque/i;
const semFaixa = [];
const semGuiado = [];
let nosDeDecisao = 0;
let decisoesNoRadar = 0;
for (const f of arqs) {
  const out = path.join(tmp, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod;
  try { mod = require(out); } catch { continue; }
  const nome = f.replace(/\.ts$/, "");
  for (const arv of Object.values(mod).filter((v) => v && v.nodes && v.entryNodeId)) {
    for (const no of Object.values(arv.nodes)) {
      if (no.type === "input") {
        for (const c of no.fields || []) {
          if (c.customKeyboard === "numeric" && !FAIXA_DE_ENTRADA[c.id]) {
            semFaixa.push(`${nome} · ${no.id} · ${c.id}`);
          }
        }
      }
      if (no.type !== "decision") continue;
      nosDeDecisao += 1;
      const txt = [no.title, no.question].filter(Boolean).join(" ");
      if (!ESTAB.test(txt)) continue;
      decisoesNoRadar += 1;
      const rot = (no.options || []).map((o) => o.label).join(" | ");
      const temRegraDeDuvida = /NA D[ÚU]VIDA|SE VOC[ÊE] EST[ÁA] (SE PERGUNTANDO|EM D[ÚU]VIDA)|N[ÃA]O É CRISE CESSADA|N[ÃA]O É RECUPERA[ÇC][ÃA]O|É RESPOSTA INADEQUADA|É N[ÃA]O-RESPOSTA/i.test(no.summary ?? "");
      if (!/não sei|nao sei|me guie/i.test(rot) && !temRegraDeDuvida) {
        semGuiado.push(`${nome} · ${no.id} · ${no.title}`);
      }
    }
  }
}

// ── 3. UI v2 por módulo ──────────────────────────────────────────────────────
const flag = lerFonte(path.join(app, "lib", "ui-v2-flag.ts"));
const mPadrao = flag.match(/const PADRAO = (\w+);/);
const uiV2Padrao = mPadrao ? mPadrao[1] : "?";
const canon = lerFonte(path.join(app, "lib", "modulos-canonicos.ts"));
const todos = [...canon.matchAll(/\{\s*id:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
const foraV2 = uiV2Padrao === "TUDO" ? [] : todos;

const L = (t) => console.log(t);
L("\n════ AUDITORIA DE PADRÕES DE INTERFACE ════\n");
L(`1. CAIXAS DE DIGITAÇÃO — ${caixas.length} tela(s)`);
for (const c of caixas.sort((a, b) => b.numericos - a.numericos)) {
  L(`   ${c.numericos > 0 ? "❌" : "⚠️ "} ${c.rel.padEnd(58)} ${c.total} caixa(s), ${c.numericos} numérica(s)`);
}
L(`\n2. CAMPO NUMÉRICO SEM FAIXA — ${semFaixa.length}`);
for (const s of semFaixa) L(`   ❌ ${s}`);
L(`\n3. UI v2 — padrão do app: ${uiV2Padrao} · ${todos.length - foraV2.length} de ${todos.length} módulos`);
for (const m of foraV2) L(`   ❌ ${m}`);
L("");
let universoOk = conferirUniverso("auditoria-padroes-ui", "arvores", arqs.length);
if (!conferirUniverso("auditoria-padroes-ui", "nos_de_decisao", nosDeDecisao)) universoOk = false;
if (!conferirUniverso("auditoria-padroes-ui", "decisoes_no_radar_de_gravidade", decisoesNoRadar)) universoOk = false;
L(`\n4. DECISÃO DE GRAVIDADE SEM CAMINHO GUIADO — ${semGuiado.length} (de ${decisoesNoRadar} no radar)`);
for (const s of semGuiado) L(`   ❌ ${s}`);
const pendencias = caixas.filter((c) => c.numericos > 0).length + semFaixa.length + foraV2.length + semGuiado.length;
L(`\nTotal de pendências: ${pendencias}\n`);
fs.rmSync(tmp, { recursive: true, force: true });

if (!universoOk) {
  console.log("❌ universo insuficiente — as contagens acima NÃO significam ausência de pendência.\n");
  process.exit(1);
}

// Dívida congelada. Mantemos o teto atual até rodar a auditoria no CI desta
// branch; depois da leitura do resultado ele deve ser reduzido para a contagem
// real. Nunca aumentar para fazer teste passar.
const TETO = 10;

if (pendencias > TETO) {
  console.log(
    `❌ as pendências de padrão subiram de ${TETO} para ${pendencias}.\n` +
    `   O teto SÓ DESCE — se você corrigiu alguma, baixe o TETO neste arquivo.\n`
  );
  process.exit(1);
}
if (pendencias < TETO) {
  console.log(
    `ℹ️  pendências caíram de ${TETO} para ${pendencias} — baixe o TETO para travar o ganho.\n`
  );
}
console.log(`✅ padrões de interface dentro do teto (${pendencias}/${TETO})\n`);
process.exit(0);
