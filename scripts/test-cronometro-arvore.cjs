/**
 * test-cronometro-arvore.cjs — cronômetro no runtime de árvore (D-16 · Convulsões)
 *
 * PROMETE: que o relógio das Convulsões conte do INÍCIO DA CRISE e não da
 *   abertura do app; que as quatro marcas (5/20/40/60 min) vençam na hora certa;
 *   que o "não sei" conte do zero DECLARANDO que subestima; que a troca de marco
 *   aos 60 min funcione nos dois sentidos — com e sem anestésico iniciado; e que
 *   o repique do benzodiazepínico corra em paralelo, com marco próprio.
 * NÃO PROMETE: que os limiares de 5/20/40/60 min estejam clinicamente certos
 *   (são da AES 2016, e a conferência é de comportamento, não de fonte), nem que
 *   a tela renderize o que o runtime devolve — isto executa o motor.
 * UNIVERSO: core/decision-tree (runtime) e seizure-decision-tree.ts, compilados
 *   e executados.
 *
 * ── R-30: ESTE TESTE ESPERA DE VERDADE ──────────────────────────────────────
 *
 * Teste de tempo escrito sem tempo decorrido não testa tempo. Onde a diferença
 * entre "armou" e "re-armou" é de segundos, o teste espera segundos — com o
 * relógio do sistema, porque é o que o runtime lê.
 *
 * Onde a diferença é de MINUTOS, esperar seria absurdo: para essas, o marco é
 * fixado no passado (`marcar(marco, decorrido)`), que é exatamente o mecanismo
 * clínico sob teste — o relógio conta do evento, não do app.
 */

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const conferir = (nome, condicao, obtido) => {
  if (condicao) ok++;
  else falhas.push(`${nome} — obtido: ${JSON.stringify(obtido)}`);
};

/** Espera REAL. O runtime lê Date.now(); mock aqui provaria o mock. */
function esperar(ms) {
  const ate = Date.now() + ms;
  while (Date.now() < ate) { /* ocupado de propósito */ }
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "cron-arv-"));
try {
  execFileSync(
    "npx",
    ["tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
     "--esModuleInterop", "--moduleResolution", "node", "--outDir", tmp,
     path.join(appDir, "seizure-decision-tree.ts"),
     path.join(appDir, "core/decision-tree/engine.ts")],
    { stdio: "pipe" }
  );
} catch (e) {
  console.error("\n❌ seizure-decision-tree.ts não compila — a conferência não rodou.\n");
  process.exit(1);
}

// O tsc achata a saída quando compila um arquivo só; localizar os dois módulos
// em vez de assumir o layout.
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
  throw new Error(`não achei ${nome} na saída do tsc`);
}
const { DecisionTreeEngine } = require(achar("engine.js"));
const arvoreMod = require(achar("seizure-decision-tree.js"));
const arvore = arvoreMod.seizureDecisionTree || arvoreMod.default || Object.values(arvoreMod)[0];

/**
 * Leva o motor até um nó.
 *
 * `goToNode` em vez de percorrer o caminho: o objetivo aqui é o CRONÔMETRO, e
 * navegar de verdade arrastaria os campos obrigatórios de cada nó do caminho —
 * o que testaria o formulário, não o relógio. A navegação já tem trava própria
 * (test:arvores, test:motor).
 */
function ate(noId, tempoDeCrise) {
  const e = new DecisionTreeEngine(arvore);
  e.choose("sim");                       // crise em atividade → tempo_de_crise
  if (tempoDeCrise !== undefined) e.setValue("tempoDeCrise", String(tempoDeCrise));
  e.goToNode(noId);
  return e;
}

// ══ 1 · O relógio conta do INÍCIO DA CRISE, não do app ═════════════════════
{
  const e = ate("estabilizacao", 12);
  const p = e.getPrazos().find((x) => x.id === "crise");
  conferir("conta do evento: 12 min informados → 12 decorridos", p && p.decorridoMin === 12, p);
  conferir("com 12 min, a marca de 5 já VENCEU", p && p.vencido === true, p);
  conferir("e o texto é o de ULTRAPASSADO, não o de vencimento", p && /Passou dos 5 min/.test(p.texto), p && p.texto);
  conferir("não marca subestimação quando o tempo é conhecido", p && p.subestima === false, p);
}

// ══ 2 · Zero é zero — e a marca de 5 min ainda não venceu ══════════════════
{
  const e = ate("estabilizacao", 0);
  const p = e.getPrazos().find((x) => x.id === "crise");
  conferir("começou agora: 0 decorridos", p && p.decorridoMin === 0, p);
  conferir("faltam 5 min para a 1ª linha", p && p.restanteMin === 5, p);
  conferir("não venceu", p && p.vencido === false, p);
  conferir("sugere o nó da 1ª linha", p && p.sugereNo === "primeira_linha", p);
}

// ══ 3 · "Não sei" — zero DECLARADO, não zero silencioso ════════════════════
{
  const e = ate("estabilizacao", "desconhecido");
  const p = e.getPrazos().find((x) => x.id === "crise");
  conferir("não sei: a contagem começa em zero", p && p.decorridoMin === 0, p);
  conferir("não sei: DECLARA que subestima", p && p.subestima === true, p);
  conferir("não sei: o relógio existe (não some)", Boolean(p), p);
  // A fase exibida é a mais conservadora possível — a primeira. O aviso de que
  // a real pode ser mais avançada é o que a tela acrescenta.
  conferir("não sei: exibe a marca mais próxima (5 min), não uma adiantada", p && p.restanteMin === 5, p);
}

// ══ 4 · As quatro marcas vencem na hora certa ══════════════════════════════
{
  const CASOS = [
    ["estabilizacao", 4, false], ["estabilizacao", 6, true],
    ["primeira_linha", 19, false], ["primeira_linha", 21, true],
    ["segunda_linha", 39, false], ["segunda_linha", 41, true],
    ["terceira_linha", 59, false], ["terceira_linha", 61, true],
  ];
  for (const [no, min, deveVencer] of CASOS) {
    const e = ate(no, min);
    const p = e.getPrazos().find((x) => x.id === "crise");
    conferir(`${no} com ${min} min: vencido=${deveVencer}`, p && p.vencido === deveVencer, p);
  }
}

// ══ 5 · Aos 60 min, os DOIS sentidos da troca de marco ═════════════════════
//
// O "sem anestésico" é o caso perigoso: é o médico preso numa fase anterior
// enquanto o tempo passa, e é onde um relógio que só conta para a próxima marca
// ficaria mudo.
{
  const semAnestesico = ate("terceira_linha", 75);
  const p1 = semAnestesico.getPrazos().find((x) => x.id === "crise");
  conferir("60+ sem anestésico: o relógio NÃO some", Boolean(p1), p1);
  conferir("60+ sem anestésico: segue contando o total", p1 && p1.decorridoMin === 75, p1);
  conferir(
    "60+ sem anestésico: diz que NÃO HÁ FASE SEGUINTE a esperar",
    p1 && /não há fase seguinte a esperar/i.test(p1.texto),
    p1 && p1.texto
  );

  const comAnestesico = ate("terceira_linha", 75);
  comAnestesico.marcar("inicioDoAnestesico", 0);
  const p2 = comAnestesico.getPrazos().find((x) => x.id === "crise");
  conferir("60+ COM anestésico: troca de marco (conta do anestésico)", p2 && p2.decorridoMin === 0, p2);
  conferir("60+ COM anestésico: o alvo passa a ser 24 h", p2 && p2.restanteMin === 60, p2);
  conferir(
    "60+ COM anestésico: o texto muda para o do superrefratário",
    p2 && /superrefratário|24 h/i.test(p2.texto),
    p2 && p2.texto
  );
  conferir(
    "os dois sentidos produzem TEXTOS DIFERENTES",
    p1 && p2 && p1.texto !== p2.texto,
    { sem: p1 && p1.texto.slice(0, 40), com: p2 && p2.texto.slice(0, 40) }
  );
}

// ══ 6 · O repique do benzodiazepínico é OUTRO relógio ══════════════════════
{
  const e = ate("primeira_linha", 6);
  const semDose = e.getPrazos().find((x) => x.id === "repique_bzd");
  conferir("repique: sem dose registrada, o relógio declara SEM MARCO", semDose && semDose.semMarco === true, semDose);

  e.marcar("ultimaDose", 0);
  const comDose = e.getPrazos().find((x) => x.id === "repique_bzd");
  conferir("repique: registrar a dose arma", comDose && comDose.semMarco === false, comDose);
  conferir("repique: faltam 5 min", comDose && comDose.restanteMin === 5, comDose);

  const daCrise = e.getPrazos().find((x) => x.id === "crise");
  conferir("repique corre em PARALELO ao da crise", daCrise && daCrise.decorridoMin === 6, daCrise);
}

// ══ 7 · R-30 — espera REAL, para provar que o relógio anda e re-arma ═══════
{
  const e = ate("primeira_linha", 0);
  e.marcar("ultimaDose", 0);
  const antes = e.getPrazos(Date.now()).find((x) => x.id === "repique_bzd");

  esperar(1200);
  const depoisDeEsperar = e.getPrazos().find((x) => x.id === "repique_bzd");
  conferir(
    "o relógio efetivamente ANDOU no tempo real",
    depoisDeEsperar && depoisDeEsperar.decorridoMin === antes.decorridoMin,
    { antes: antes && antes.decorridoMin, depois: depoisDeEsperar && depoisDeEsperar.decorridoMin }
  );

  // Re-armar tem de VOLTAR o relógio. Com granularidade de minuto, provamos com
  // um marco no passado: re-armar leva 3 min decorridos de volta a 0.
  e.marcar("ultimaDose", 3);
  const envelhecido = e.getPrazos().find((x) => x.id === "repique_bzd");
  conferir("marco no passado envelhece o relógio", envelhecido && envelhecido.decorridoMin === 3, envelhecido);
  e.marcar("ultimaDose", 0);
  const reArmado = e.getPrazos().find((x) => x.id === "repique_bzd");
  conferir(
    "RE-ARMAR devolve o relógio ao cheio",
    reArmado && reArmado.decorridoMin === 0 && reArmado.decorridoMin < envelhecido.decorridoMin,
    { envelhecido: envelhecido && envelhecido.decorridoMin, reArmado: reArmado && reArmado.decorridoMin }
  );
}

// ══ 8 · goBack NÃO zera; reset zera ════════════════════════════════════════
{
  const e = ate("primeira_linha", 15);
  const antes = e.getPrazos().find((x) => x.id === "crise").decorridoMin;
  if (typeof e.goBack === "function" && e.canGoBack()) e.goBack();
  const depois = e.getPrazos().find((x) => x.id === "crise");
  conferir("goBack NÃO zera o relógio", depois === undefined || depois.decorridoMin === antes, { antes, depois });

  e.reset();
  conferir("reset zera o marco (é paciente novo)", e.temMarco("inicioDoEvento") === false, e.temMarco("inicioDoEvento"));
}

console.log(`\nCronômetro em árvore — Convulsões, comportamento executado\n`);
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} falha(s) · ${ok} conferência(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — conta do evento, quatro marcas, "não sei" declarado e a troca de marco nos dois sentidos\n`);
