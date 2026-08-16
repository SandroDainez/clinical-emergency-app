/**
 * PROMETE: que o número de divergências de PADRÃO DE INTERAÇÃO não suba —
 *   caixa de digitação onde a decisão foi ter barra, campo numérico sem faixa
 *   declarada, módulo fora da UI v2 e decisão de gravidade sem "não sei — me
 *   guie". O teto de hoje (11) só desce.
 * NÃO PROMETE: que as 11 pendências atuais sejam aceitáveis — elas são dívida
 *   congelada, e são a lista de trabalho do bloco de convergência de UI. Também
 *   não diz nada sobre COR: origem é `test:paleta`, legibilidade é o
 *   `contraste-renderizado`.
 * UNIVERSO: todas as telas sob components/ (derivado do diretório) e todas as
 *   árvores de decisão compiladas; a flag de UI vem de `lib/ui-v2-flag.ts` e os
 *   módulos de `lib/modulos-canonicos.ts`.
 *
 * Auditoria de PADRÕES DE INTERFACE, módulo a módulo.
 *
 * O autor do app relatou, usando: "ainda tem módulos com padrões diferentes,
 * com caixas para preenchimento onde deveria ter rolagem lateral, ainda tem
 * módulos sem 'não sei me guie'".
 *
 * Padronizar sem medir é apostar. Este script varre TODAS as telas de módulo e
 * responde, por módulo, o que está fora do padrão — para que a padronização
 * seja uma lista finita, e não uma impressão.
 *
 * O QUE ELE MEDE
 * --------------
 *  1. ENTRADA NUMÉRICA POR CAIXA. Campo de digitação livre onde a decisão foi
 *     ter barra deslizante ("só devemos ter as barras para seleção em todo o
 *     app, nada de caixas"). Caixa numérica em emergência é teclado abrindo,
 *     erro de digitação e um passo a mais com o paciente na frente.
 *  2. FAIXA DE ENTRADA AUSENTE. Campo numérico sem faixa declarada volta a
 *     herdar os limites dos presets — o defeito que impedia registrar o
 *     paciente real.
 *  3. UI v2. Módulo fora da interface nova tem cabeçalho, cartões e navegação
 *     diferentes dos demais.
 *  4. CAMINHO GUIADO. Decisão de estabilidade/gravidade sem "não sei — me
 *     guie".
 *
 * Ele NÃO falha o build: é um mapa de trabalho. O que ele garante é que a lista
 * exista por escrito, em vez de depender de alguém reparar tela por tela.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const app = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "padroes-"));

// ── 1. Telas com caixa de digitação ──────────────────────────────────────────
function telas(dir, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) { if (!/node_modules|dist|\.git/.test(p)) telas(p, out); }
    else if (/\.tsx$/.test(f.name)) out.push(p);
  }
  return out;
}
const NEUTRO = /password-input|ui-v2\/input|app\/index/;
const caixas = [];
for (const t of telas(path.join(app, "components")).concat(telas(path.join(app, "app")))) {
  const rel = path.relative(app, t);
  if (NEUTRO.test(rel)) continue;
  const src = fs.readFileSync(t, "utf8");
  const n = (src.match(/<TextInput/g) || []).length;
  if (!n) continue;
  const numericos = (src.match(/keyboardType=\{?["']?(numeric|decimal-pad|number-pad)/g) || []).length;
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
for (const f of arqs) {
  const out = path.join(tmp, f.replace(/\.ts$/, ".js"));
  if (!fs.existsSync(out)) continue;
  let mod; try { mod = require(out); } catch { continue; }
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
      // ⚠️ O UNIVERSO NÃO PODE DEPENDER DA COBERTURA — era circular.
      //
      // Antes isto lia também o `summary`. Como as regras de "na dúvida" vivem
      // no summary e falam de instabilidade e gravidade, um nó ENTRAVA no radar
      // ao ganhar a regra e SAÍA ao perdê-la: remover a cobertura fazia o
      // problema desaparecer da contagem, e a mutação passava limpa.
      //
      // Natureza do nó é `title` + `question` — o que ele pergunta. O summary é
      // o que fizemos com ele, e não pode definir se ele deveria ser medido.
      const txt = [no.title, no.question].filter(Boolean).join(" ");
      if (!ESTAB.test(txt)) continue;
      const rot = (no.options || []).map((o) => o.label).join(" | ");
      // ⚠️ REGRA TAMBÉM COBRE A DÚVIDA — e às vezes é a cobertura CERTA.
      //
      // Esta conferência nasceu procurando "não sei" nas opções, e por isso
      // contava como descoberto todo nó de gravidade sem ramo. Mas o bloco do
      // sistema de hesitação decidiu que NEM TODO "NÃO SEI" MERECE RAMO:
      // onde a dúvida JÁ DECIDE a conduta (CICO, indutor no instável,
      // succinilcolina, PE grave), abrir um passo custa segundos que não
      // existem — a resposta certa é a regra escrita no próprio nó.
      //
      // Sem isto, a trava reprovava exatamente os nós que acabaram de ser
      // cobertos, e a "correção" seria desfazer a decisão de produto para
      // agradar o instrumento (R-55).
      const temRegraDeDuvida = /NA D[ÚU]VIDA|SE VOC[ÊE] EST[ÁA] (SE PERGUNTANDO|EM D[ÚU]VIDA)|N[ÃA]O É CRISE CESSADA|N[ÃA]O É RECUPERA[ÇC][ÃA]O|É RESPOSTA INADEQUADA|É N[ÃA]O-RESPOSTA/i.test(no.summary ?? "");
      if (!/não sei|nao sei|me guie/i.test(rot) && !temRegraDeDuvida) {
        semGuiado.push(`${nome} · ${no.id} · ${no.title}`);
      }
    }
  }
}

// ── 3. UI v2 por módulo ──────────────────────────────────────────────────────
//
// A primeira versão deste script leu a lista COM_CABECALHO_PROPRIO e concluiu
// "29 de 29 módulos fora da UI v2" — o que era visivelmente falso, porque as
// telas na tela estavam na versão nova. Aquela lista é sobre QUEM DESENHA O
// PRÓPRIO CABEÇALHO, não sobre migração.
//
// O que decide a migração é `PADRAO` em ui-v2-flag.ts, e ele vale para o app
// inteiro: hoje é TUDO. Um auditor que lê a constante errada dá um número
// preciso e errado — pior do que não medir, porque parece resposta.
const flag = fs.readFileSync(path.join(app, "lib", "ui-v2-flag.ts"), "utf8");
const mPadrao = flag.match(/const PADRAO = (\w+);/);
const uiV2Padrao = mPadrao ? mPadrao[1] : "?";
const canon = fs.readFileSync(path.join(app, "lib", "modulos-canonicos.ts"), "utf8");
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
L(`\n4. DECISÃO DE GRAVIDADE SEM CAMINHO GUIADO — ${semGuiado.length}`);
for (const s of semGuiado) L(`   ❌ ${s}`);
const pendencias =
  caixas.filter((c) => c.numericos > 0).length + semFaixa.length + foraV2.length + semGuiado.length;
L(`\nTotal de pendências: ${pendencias}\n`);
fs.rmSync(tmp, { recursive: true, force: true });

// ── ⚠️ DE MAPA A TRAVA (2026-08-16) ────────────────────────────────────────
//
// Este script existia, media coisa real e NÃO RODAVA no `test:all` — só via
// `npm run mapa:padroes`. Acusava 11 pendências que ninguém lia.
//
// Mapa que não roda dá a sensação de cobertura sem a cobertura: é o mesmo
// defeito do `dist` de nove dias, em que a evidência existia e estava velha.
// Perfil D-5 pelo outro lado — ali a trava prometia mais do que cumpria, aqui
// ela cumpre e ninguém escuta.
//
// Não duplica as duas travas de cor: `test:paleta` mede ORIGEM da cor e
// `contraste-renderizado` mede LEGIBILIDADE do par. Este mede PADRÃO DE
// INTERAÇÃO — caixa onde deveria haver barra, campo sem faixa, decisão de
// gravidade sem "não sei, me guie". Zero sobreposição, então entra em vez de
// morrer.
//
// TETO CONGELADO, mesmo molde do legado de cor e da D-35: o número de hoje é o
// máximo. Só desce. Cada bloco da convergência de UI aperta o próprio teto.
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
