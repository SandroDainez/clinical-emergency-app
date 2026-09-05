/**
 * PROMETE: que divergências de PADRÃO DE INTERAÇÃO não aumentem e que campos
 * numéricos clínicos não voltem silenciosamente a caixas de digitação.
 *
 * A regra de produto é simples:
 *   número clínico -> slider/stepper;
 *   texto verdadeiro -> TextInput.
 *
 * Este auditor mede quatro classes de dívida bloqueantes e uma inconsistência
 * visual informativa:
 *  1. TextInput numérico em telas de módulo;
 *  2. campo numérico de árvore sem faixa de entrada;
 *  3. módulo fora da UI v2;
 *  4. decisão de estabilidade/gravidade sem caminho guiado;
 *  5. slider que ainda representa "não informado" com ponto inicial no meio da
 *     faixa em vez do estado neutro/origem do NumericStepper.
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
const slidersPendentesForaDoPadrao = [];
for (const t of telas(path.join(app, "components")).concat(telas(path.join(app, "app")))) {
  const rel = path.relative(app, t);
  if (NEUTRO.test(rel)) continue;
  const src = fs.readFileSync(t, "utf8");
  const n = (src.match(/<TextInput/g) || []).length;
  if (n) {
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

  // Estado pendente canônico: `valorVisivel=false` faz o NumericStepper manter o
  // thumb na origem visual sem expor/gravar o mínimo. O padrão antigo do módulo
  // de eletrólitos calculava explicitamente o ponto médio quando o campo estava
  // vazio; isso é visualmente diferente dos demais módulos e pode parecer uma
  // sugestão clínica. Mantemos esta detecção explícita enquanto o legado existir.
  if (/Number\(\(\(faixa\.min\s*\+\s*faixa\.max\)\s*\/\s*2\)/.test(src)) {
    slidersPendentesForaDoPadrao.push(rel);
  }
}

// ── 2/4. Árvores: faixa de entrada e caminho guiado ──────────────────────────
const arqs = fs.readdirSync(app).filter((f) => /-(decision-)?tree\.ts$/.test(f)).sort();
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
  "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(app, "lib", "faixas-de-entrada.ts"), ...arqs.map((f) => path.join(app, f))],
  { cwd: app, stdio: ["ignore", "ignore", "inherit"] });
const { FAIXA_DE_ENTRADA } = require(path.join(tmp, "lib", "faixas-de-entrada.js"));

const ESTAB = /instabil|instável|instavel|est[áa]vel|gravidade|grave\b|crítico|critico|choque/i;
const GUIADO = /não sei|nao sei|me guie/i;
const semFaixa = [];
const semGuiado = [];
let nosDeDecisao = 0;
let decisoesNoRadar = 0;

/**
 * Nós internos de um caminho explicitamente guiado não precisam repetir
 * "Não sei — me guie" em cada micropergunta.
 *
 * O que conta como interno é deliberadamente estrito: o nó precisa ser alcançado
 * apenas pelo ramo guiado (ou por outros nós que também sejam exclusivos dele).
 * Quando o fluxo reconverge com um caminho normal, a isenção termina. Assim uma
 * opção guiada não vira um guarda-chuva capaz de esconder dívida clínica adiante.
 */
function nosInternosDoGuiado(arv) {
  const incoming = new Map();
  const sementes = [];

  const registrar = (origem, destino, guiado = false) => {
    if (typeof destino !== "string" || !arv.nodes[destino]) return;
    if (!incoming.has(destino)) incoming.set(destino, []);
    incoming.get(destino).push({ origem, guiado });
    if (guiado) sementes.push(destino);
  };

  for (const no of Object.values(arv.nodes)) {
    if (typeof no.next === "string") registrar(no.id, no.next, false);
    for (const op of no.options || []) {
      registrar(no.id, op.next, GUIADO.test(op.label || ""));
    }
  }

  const internos = new Set();
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const id of sementes.concat([...internos])) {
      if (internos.has(id)) continue;
      const entradas = incoming.get(id) || [];
      if (!entradas.length) continue;
      const exclusivo = entradas.every((e) => e.guiado || internos.has(e.origem));
      if (exclusivo) {
        internos.add(id);
        mudou = true;
      }
    }

    for (const no of Object.values(arv.nodes)) {
      if (!internos.has(no.id)) continue;
      if (typeof no.next === "string") {
        const entradas = incoming.get(no.next) || [];
        if (entradas.length && entradas.every((e) => e.guiado || internos.has(e.origem))) {
          if (!internos.has(no.next)) {
            internos.add(no.next);
            mudou = true;
          }
        }
      }
      for (const op of no.options || []) {
        if (typeof op.next !== "string") continue;
        const entradas = incoming.get(op.next) || [];
        if (entradas.length && entradas.every((e) => e.guiado || internos.has(e.origem))) {
          if (!internos.has(op.next)) {
            internos.add(op.next);
            mudou = true;
          }
        }
      }
    }
  }

  return internos;
}

for (const f of arqs) {
  const out = path.join(tmp, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod;
  try { mod = require(out); } catch { continue; }
  const nome = f.replace(/\.ts$/, "");
  for (const arv of Object.values(mod).filter((v) => v && v.nodes && v.entryNodeId)) {
    const internosDoGuiado = nosInternosDoGuiado(arv);
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
      if (!GUIADO.test(rot) && !temRegraDeDuvida && !internosDoGuiado.has(no.id)) {
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
L(`\n5. SLIDER PENDENTE FORA DO PADRÃO — ${slidersPendentesForaDoPadrao.length}`);
for (const s of slidersPendentesForaDoPadrao) L(`   ⚠️  ${s} · estado vazio ainda parte do meio da faixa`);
const pendencias = caixas.filter((c) => c.numericos > 0).length + semFaixa.length + foraV2.length + semGuiado.length;
L(`\nTotal de pendências bloqueantes: ${pendencias}\n`);
fs.rmSync(tmp, { recursive: true, force: true });

if (!universoOk) {
  console.log("❌ universo insuficiente — as contagens acima NÃO significam ausência de pendência.\n");
  process.exit(1);
}

// Dívida congelada. O teto só desce depois de a queda aparecer no CI desta
// branch; nunca é aumentado para fazer teste passar.
const TETO = 9;

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
