/**
 * test-acls-troca-de-ritmo.cjs — Fase 2, passo 1
 *
 * PROMETE: que a máquina de estados do ACLS se comporte corretamente quando o
 *   ritmo MUDA no meio do ciclo — nos dois sentidos —, que o teto de 2 doses de
 *   antiarrítmico sobreviva a conversão e recaída, que `deliveredShockCount`
 *   atravesse a troca de ramo, e que as duas invariantes descobertas ao
 *   exercitar isto continuem valendo: o antiarrítmico é barrado por CONTAGEM DE
 *   CHOQUES (não por nome de estado) e as doses são espaçadas pela cadência
 *   par/ímpar do `rcp3CycleIndex`.
 * NÃO PROMETE: que os limiares clínicos estejam certos (3 choques antes do
 *   antiarrítmico, teto de 2 doses, 2 min de ciclo são da AHA e a conferência
 *   aqui é de COMPORTAMENTO, não de fonte). Não cobre ROSC, re-parada, OVACE
 *   nem gestação — esses têm caminhos próprios.
 *
 *   E NÃO PROMETE O ENFORCEMENT DO TETO DE 2 EM SI. Mutação executada: afrouxar
 *   `canRecommendAntiarrhythmic` (2→5) E o fechamento do
 *   `antiarrhythmicReminderStage` juntos NÃO derruba esta trava — as doses
 *   param em 2 mesmo assim, o que indica uma TERCEIRA guarda que não foi
 *   mapeada. O teto é vigiado por `npm run test:acls`; o que ESTA trava
 *   promete sobre ele é outra coisa: que ele SOBREVIVE a conversão de ritmo e
 *   recaída, e que as duas doses caem em ciclos rcp_3 PARES.
 * UNIVERSO: acls/reducer.ts compilado e executado, com protocol.json real.
 *
 * ── POR QUE ESTA TRAVA EXISTE ───────────────────────────────────────────────
 *
 * A mudança de ritmo no meio do ciclo era a lacuna de cobertura conhecida do
 * reducer — o único motor do app com máquina de estados real, do qual os nove
 * módulos do ACLS dependem. Auditar conteúdo sobre motor não verificado é a
 * inversão que a Fase 1 ensinou a evitar.
 *
 * Exercitados os quatro casos, O REDUCER ESTAVA CORRETO NOS QUATRO. Isto aqui
 * não corrige nada: converte "provavelmente certo" em "verificado", e prende o
 * comportamento contra refatoração.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const conferir = (nome, cond, obtido) => {
  if (cond) ok++;
  else falhas.push(`${nome} — obtido: ${JSON.stringify(obtido)}`);
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "acls-ritmo-"));
try {
  execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020",
    "--resolveJsonModule", "--esModuleInterop", "--moduleResolution", "node",
    "--skipLibCheck", "--outDir", tmp, path.join(appDir, "acls/reducer.ts")], { stdio: "pipe" });
} catch {
  console.error("\n❌ acls/reducer.ts não compila — a conferência não rodou.\n");
  process.exit(1);
}
function achar(nome) {
  const pilha = [tmp];
  while (pilha.length) {
    const dir = pilha.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) pilha.push(p);
      else if (e.name === nome) return p;
    }
  }
  throw new Error(`não achei ${nome}`);
}
const R = require(achar("reducer.js"));

// ── Harness ────────────────────────────────────────────────────────────────
//
// O relógio avança de verdade: `timer_elapsed` só é aceito quando o ciclo
// realmente completou (R-30 — teste de tempo sem tempo decorrido não testa
// tempo). Aqui isso é feito saltando 125 s, não esperando.
let t = 0;
const ev = (s, e) => R.reduceAclsState(s, { ...e, at: (t += 1000) }).state;
const resp = (s, input) => ev(s, { type: "question_answered", input });
const conf = (s) => ev(s, { type: "action_confirmed" });
const rec = (s, actionId) => ev(s, { type: "execution_recorded", actionId });
const tipo = (s) => R.resolveDynamicAclsProtocolState(s).type;
const ativos = (s) => (s.timers || []).filter((x) => !x.completed);
const ciclar = (s) => {
  const tm = ativos(s)[0];
  if (!tm) return s;
  t += 125000;
  return R.reduceAclsState(s, { type: "timer_elapsed", timerId: tm.id, at: t }).state;
};
const RESPOSTA_PADRAO = { checar_respiracao_pulso: "sem_pulso", tipo_desfibrilador: "bifasico" };
// Navegação tolerante a falha: uma mutação no roteamento pode levar a um
// estado onde a resposta padrão é inválida, e o reducer lança. Engolir a
// exceção aqui faz a trava FALHAR PELA CONFERÊNCIA CLÍNICA (mensagem legível)
// em vez de morrer com stack trace — trava que explode não diz o que quebrou.
const passo = (s, ritmo = "chocavel") => {
  try {
    return tipo(s) === "question"
      ? resp(s, RESPOSTA_PADRAO[s.currentStateId] || ritmo)
      : (ativos(s).length ? ciclar(s) : conf(s));
  } catch {
    return s; // travou aqui; o `ate` desiste e a conferência acusa o estado errado
  }
};
const ate = (s, alvo, ritmo = "chocavel", max = 30) => {
  for (let i = 0; i < max && s.currentStateId !== alvo; i++) s = passo(s, ritmo);
  return s;
};
const novo = () => R.createInitialAclsState((t += 1000));
const doses = (s) => s.medications?.antiarrhythmic?.administeredCount ?? 0;

// ══ 1 · CHOCÁVEL → NÃO CHOCÁVEL com ciclo de 2 min em curso ════════════════
{
  let s = ate(novo(), "tipo_desfibrilador");
  s = resp(s, "bifasico");
  s = conf(s); // aplica o choque → RCP
  conferir("há ciclo de 2 min correndo durante a RCP", ativos(s).length === 1, s.currentStateId);
  const flowAntes = s.shockableFlowStep;

  s = ciclar(s);
  s = ate(s, "avaliar_ritmo_2");
  conferir("o ciclo COMPLETA na checagem de ritmo (não fica órfão)", ativos(s).length === 0, ativos(s));

  s = resp(s, "nao_chocavel");
  conferir("responder NÃO CHOCÁVEL troca de ramo", s.algorithmBranch === "nonshockable", s.algorithmBranch);
  conferir("e um ciclo NOVO nasce no ramo não-chocável", ativos(s).length === 1, ativos(s));
  // O progresso do ramo chocável NÃO é apagado: se o ritmo voltar a ser
  // chocável, o paciente retoma de onde parou em vez de recomeçar do 1º choque.
  conferir("o progresso do ramo chocável é PRESERVADO", s.shockableFlowStep === flowAntes,
    { antes: flowAntes, depois: s.shockableFlowStep });
}

// ══ 2 · NÃO CHOCÁVEL → CHOCÁVEL em paciente que NUNCA chocou ═══════════════
//
// O caso perigoso: assistolia que converte para FV. O protocol.json declara
// `options.chocavel: "choque_2"`, e `choque_2` deriva o texto de
// `defibrillatorType` — que estaria `undefined`, caindo silenciosamente no
// ramo bifásico com a instrução "usar carga equivalente ou maior QUE A
// ANTERIOR", sem que houvesse choque anterior.
//
// O reducer IGNORA o options para "chocavel" e roteia por
// `resolveShockableNextStateFromRhythmCheck`. Esta conferência é o que
// impede alguém de "simplificar" isso para seguir o JSON como os outros.
{
  let s = novo();
  s = ate(s, "avaliar_ritmo", "nao_chocavel");
  s = resp(s, "nao_chocavel");
  conferir("entrou no ramo não-chocável sem tipo de desfibrilador definido",
    s.defibrillatorType === undefined && s.shockableFlowStep === "not_started",
    { defib: s.defibrillatorType, flow: s.shockableFlowStep });

  s = ate(s, "avaliar_ritmo_nao_chocavel", "nao_chocavel");
  s = resp(s, "chocavel");
  conferir("converter para CHOCÁVEL pergunta o tipo de desfibrilador",
    s.currentStateId === "tipo_desfibrilador", s.currentStateId);
  conferir("NÃO vai direto a choque_2 (que presumiria bifásico e carga anterior)",
    s.currentStateId !== "choque_2", s.currentStateId);
}

// ══ 3 · deliveredShockCount atravessando a troca de ramo ═══════════════════
{
  let s = ate(novo(), "tipo_desfibrilador");
  s = resp(s, "bifasico");
  s = rec(s, "shock");
  s = ate(s, "choque_2");
  s = rec(s, "shock");
  conferir("dois choques documentados", s.deliveredShockCount === 2, s.deliveredShockCount);

  s = ate(s, "avaliar_ritmo_3");
  s = resp(s, "nao_chocavel");
  conferir("a contagem de choques SOBREVIVE à ida para não-chocável",
    s.deliveredShockCount === 2, s.deliveredShockCount);

  s = ate(s, "avaliar_ritmo_nao_chocavel", "nao_chocavel");
  s = resp(s, "chocavel");
  conferir("e sobrevive à VOLTA para chocável", s.deliveredShockCount === 2, s.deliveredShockCount);
  conferir("a volta retoma do histórico, não do primeiro choque",
    s.currentStateId === "choque_3", s.currentStateId);
}

// ══ 4 · INVARIANTE — o antiarrítmico é barrado por CONTAGEM DE CHOQUES ═════
//
// Descoberta ao exercitar o caso 3: chegar a `rcp_3` NÃO autoriza o
// antiarrítmico. O gate é `deliveredShockCount >= 3`, e estado alcançado não é
// o mesmo que choque dado — um paciente pode ciclar pelo ramo não-chocável e
// chegar a rcp_3 com menos choques.
{
  let s = ate(novo(), "tipo_desfibrilador");
  s = resp(s, "bifasico");
  s = rec(s, "shock");
  s = ate(s, "rcp_3");
  conferir("dá para chegar a rcp_3 com menos de 3 choques", s.deliveredShockCount < 3, s.deliveredShockCount);
  let recusou = false;
  try { s = rec(s, "antiarrhythmic"); } catch { recusou = true; }
  conferir("e o antiarrítmico é RECUSADO ali — o gate é o choque, não o estado",
    recusou && doses(s) === 0, { recusou, doses: doses(s) });
}

// ══ 5 · INVARIANTE — cadência par/ímpar espaça as duas doses ═══════════════
//
// A amiodarona só é oferecida em `rcp_3` de ciclo PAR (`rcp3CycleIndex % 2`),
// alternando com a epinefrina. Uma refatoração que liberasse a dose em
// qualquer `rcp_3` daria 300 mg e 150 mg em ciclos CONSECUTIVOS.
// ══ 6 · e o TETO DE 2 sobrevive a conversão e recaída ══════════════════════
{
  let s = ate(novo(), "tipo_desfibrilador");
  s = resp(s, "bifasico");
  const tentativas = [];
  const indices = [];
  for (let i = 0; i < 400 && s.deliveredShockCount < 12; i++) {
    if (/^choque/.test(s.currentStateId)) { try { s = rec(s, "shock"); } catch { /* já documentado */ } }
    if (s.currentStateId === "rcp_3" && s.deliveredShockCount >= 3) {
      const antes = doses(s);
      try { s = rec(s, "antiarrhythmic"); tentativas.push({ aceita: doses(s) > antes, idx: s.rcp3CycleIndex }); }
      catch { tentativas.push({ aceita: false, idx: s.rcp3CycleIndex }); }
      indices.push(s.rcp3CycleIndex);
    }
    s = passo(s);
  }
  const aceitas = tentativas.filter((x) => x.aceita);
  conferir("as DUAS doses de antiarrítmico são alcançáveis", aceitas.length === 2, tentativas);
  conferir("e nenhuma terceira entra — teto de 2", doses(s) === 2, doses(s));
  // ⚠️ A CONFERÊNCIA É A PARIDADE, NÃO A DIFERENÇA. Conferir só que os índices
  // diferem deixa passar a remoção da cadência: sem ela as doses caem em ciclos
  // CONSECUTIVOS, que também são "diferentes". O que a cadência garante é que
  // ambas caiam em índice PAR — 300 mg e 150 mg espaçadas por um ciclo de
  // epinefrina, como no algoritmo circular.
  conferir("ambas as doses caem em ciclo rcp_3 PAR (cadência alternada com a epinefrina)",
    aceitas.length === 2 && aceitas.every((x) => x.idx % 2 === 0), aceitas.map((x) => x.idx));
  conferir("e estão separadas por pelo menos um ciclo (não consecutivas)",
    aceitas.length === 2 && Math.abs(aceitas[1].idx - aceitas[0].idx) >= 2, aceitas.map((x) => x.idx));
}

// ══ 7 · a declaração do JSON não pode voltar a mentir ══════════════════════
//
// `dynamicOptions` declara os destinos POSSÍVEIS do ritmo chocável e nomeia a
// função que decide — o mesmo precedente do `Roteamento` das árvores, que
// declara `possiveis` porque a auditoria de grafo percorre estaticamente e não
// segue função. Sem isso, `options.chocavel` diz um destino e o reducer entrega
// outro, e a declaração mente.
{
  const proto = JSON.parse(fs.readFileSync(path.join(appDir, "protocol.json"), "utf8"));
  const RITMO = ["avaliar_ritmo", "avaliar_ritmo_2", "avaliar_ritmo_3", "avaliar_ritmo_nao_chocavel"];
  for (const id of RITMO) {
    const din = proto.states[id]?.dynamicOptions?.chocavel;
    if (!din) {
      falhas.push(`${id}: perdeu \`dynamicOptions.chocavel\` — o JSON voltou a declarar um destino fixo para o ritmo chocável, que o reducer não obedece.`);
      continue;
    }
    conferir(`${id} nomeia a função que decide`,
      din.escolher === "resolveShockableNextStateFromRhythmCheck", din.escolher);
    conferir(`${id} declara tipo_desfibrilador entre os possíveis`,
      (din.possiveis || []).includes("tipo_desfibrilador"), din.possiveis);
    for (const alvo of din.possiveis || []) {
      if (!proto.states[alvo]) falhas.push(`${id}: dynamicOptions aponta para estado inexistente "${alvo}".`);
      else ok++;
    }
  }
  const reducer = fs.readFileSync(path.join(appDir, "acls/reducer.ts"), "utf8");
  conferir("o reducer continua SOBREPONDO o options do JSON para chocavel",
    /normalizedInput === "chocavel"\s*\?\s*resolveShockableNextStateFromRhythmCheck/.test(reducer),
    "o roteamento dinâmico do ritmo chocável sumiu do reducer");
}

console.log(`\nACLS — troca de ritmo no meio do ciclo (Fase 2, passo 1)\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} falha(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — troca nos dois sentidos, contagem preservada, teto de 2 e a declaração honesta\n`);
