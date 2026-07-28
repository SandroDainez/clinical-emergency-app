#!/usr/bin/env node
/**
 * Caça ao defeito relatado: "mandando confirmar dose de adrenalina que foi
 * aplicada mesmo quando já se havia confirmado".
 *
 * Não lê o código: DIRIGE o engine e vigia invariantes que só quebram se uma dose
 * já confirmada voltar a ser pedida.
 *
 * ## As invariantes
 *
 * I1. `recomendadas − administradas` nunca passa de 1.
 *     Pedir a 2ª antes de a 1ª ser confirmada é legítimo (o médico pode atrasar).
 *     Chegar a 2 significa que o sistema pediu DUAS vezes a mesma dose.
 *
 * I2. Depois de confirmar, não se pede outra dose antes de 3 min.
 *     A regra da AHA (3–5 min) vista pelo outro lado: pedido reaparecendo 30 s
 *     após a confirmação é o defeito relatado, não intervalo cumprido.
 *
 * I3. Confirmação sempre incrementa a contagem.
 *     Confirmação aceita "no vazio" é ação que continuou oferecida depois de
 *     cumprida — exatamente o que ele descreve.
 *
 * ## Três cenários
 *
 * A. Confirmação IMEDIATA, ramo chocável — o caso do relato.
 * B. Confirmação ATRASADA em um ciclo — o médico ocupado. Aqui é ESPERADO o
 *    sistema insistir; o que não pode é a dose contar duas vezes.
 * C. Ramo NÃO CHOCÁVEL (assistolia/AESP) — sem cobertura de auditoria até aqui,
 *    e onde a epinefrina entra imediatamente, sem esperar dois choques.
 *
 * ⚠️ Os números (2 choques antes da 1ª epi, 3–5 min entre doses) são os que
 * scripts/auditoria-acls.cjs já conferiu contra a AHA. Aqui servem de RÉGUA para
 * achar pedido duplicado — divergência apontada aqui é de sincronia, não de dose.
 *
 * Uso: node scripts/diag-confirmacao-repetida.cjs
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "diag-confirmacao-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--outDir", tempDir,
    path.join(appDir, "engine.ts"),
  ],
  { cwd: appDir, stdio: "inherit" }
);
fs.copyFileSync(path.join(appDir, "protocol.json"), path.join(tempDir, "protocol.json"));
const engine = require(path.join(tempDir, "engine.js"));

const realNow = Date.now;
let now = 0;
Date.now = () => now;

const PEDIDOS = ["epinephrine_now", "antiarrhythmic_now", "antiarrhythmic_repeat"];
const DROGAS = ["adrenaline", "antiarrhythmic"];

function minuto() {
  return +(now / 60000).toFixed(2);
}

/**
 * `suggestedCount` no summary É o `recommendedCount` do tracker (engine.ts:721).
 *
 * Na primeira versão deste script eu li `adrenalineRecommendedCount`, que não
 * existe, e um `continue` pulava I1 em silêncio: o diagnóstico dava verde sem
 * nunca ter testado a invariante principal. Agora campo ausente é exceção.
 */
function contagens() {
  const r = engine.getEncounterSummary();
  const ler = (rec, adm, droga) => {
    if (rec === undefined || adm === undefined) {
      throw new Error(`campo ausente no summary para ${droga} — I1 não pode ser verificada`);
    }
    return { rec, adm };
  };
  return {
    adrenaline: ler(r.adrenalineSuggestedCount, r.adrenalineAdministeredCount, "adrenaline"),
    antiarrhythmic: ler(
      r.antiarrhythmicSuggestedCount,
      r.antiarrhythmicAdministeredCount,
      "antiarrhythmic"
    ),
    choques: r.shockCount,
  };
}

/**
 * @param {{nome: string, chocavel: boolean, atrasoEmCiclos: number, ciclos: number}} opcoes
 */
function rodarCenario(opcoes) {
  const falhas = [];
  const eventos = [];
  const ultimaConfirmacao = { adrenaline: null, antiarrhythmic: null };
  const picoDePendentes = { adrenaline: 0, antiarrhythmic: 0 };
  /** Ações vistas como devidas, aguardando o atraso combinado. */
  const naFila = [];

  function vigiar(rotulo) {
    const c = contagens();
    const cues = engine
      .consumeEffects()
      .filter((e) => e.type === "play_audio_cue")
      .map((e) => e.cueId);

    for (const droga of DROGAS) {
      const pendentes = c[droga].rec - c[droga].adm;
      if (pendentes > picoDePendentes[droga]) picoDePendentes[droga] = pendentes;
      // I1
      if (pendentes > 1) {
        falhas.push(
          `[I1] ${droga}: ${c[droga].rec} recomendadas × ${c[droga].adm} administradas ` +
            `(${pendentes} pendentes) em ${minuto()} min — ${rotulo}`
        );
      }
    }

    for (const cue of cues.filter((x) => PEDIDOS.includes(x))) {
      const droga = cue === "epinephrine_now" ? "adrenaline" : "antiarrhythmic";
      eventos.push({ tipo: "pedido", cue, droga, min: minuto(), choques: c.choques });
      const desde = ultimaConfirmacao[droga];
      // I2
      if (desde !== null && minuto() - desde < 2.9) {
        falhas.push(
          `[I2] ${droga}: novo pedido (${cue}) ${(minuto() - desde).toFixed(2)} min após a ` +
            `confirmação anterior — mínimo 3 min — ${rotulo}`
        );
      }
    }
  }

  function confirmar(id, rotulo) {
    const antes = contagens()[id].adm;
    engine.registerExecution(id);
    const depois = contagens()[id].adm;
    ultimaConfirmacao[id] = minuto();
    eventos.push({ tipo: "confirmou", droga: id, min: minuto() });
    // I3
    if (depois === antes) {
      falhas.push(
        `[I3] ${id}: confirmação em ${minuto()} min não aumentou a contagem ` +
          `(${antes} → ${depois}) — ação oferecida sem dose pendente — ${rotulo}`
      );
    }
    vigiar(`CONFIRMOU ${id} — ${rotulo}`);
  }

  now = 0;
  engine.resetSession();
  engine.consumeEffects();

  engine.next(); vigiar("início");
  engine.next("sem_pulso"); vigiar("sem pulso");
  engine.next(); vigiar("preparo");

  if (opcoes.chocavel) {
    engine.next("chocavel"); vigiar("chocável");
    engine.next("bifasico"); vigiar("bifásico");
    engine.registerExecution("shock"); vigiar("CHOQUE 1");
    engine.next(); vigiar("entra rcp_1");
  } else {
    engine.next("nao_chocavel"); vigiar("não chocável");
    engine.next(); vigiar("entra rcp não chocável");
  }

  for (let ciclo = 1; ciclo <= opcoes.ciclos; ciclo += 1) {
    for (let t = 0; t < 6; t += 1) {
      now += 20000;
      engine.tick();
      vigiar(`ciclo ${ciclo} +${(t + 1) * 20}s`);

      // Cumpre o que já venceu o atraso combinado.
      for (let i = naFila.length - 1; i >= 0; i -= 1) {
        if (naFila[i].liberaNoCiclo <= ciclo) {
          confirmar(naFila[i].id, `ciclo ${ciclo} (atrasada)`);
          naFila.splice(i, 1);
        }
      }

      for (const acao of engine.getDocumentationActions?.() ?? []) {
        if (!DROGAS.includes(acao.id)) continue;
        if (opcoes.atrasoEmCiclos === 0) {
          confirmar(acao.id, `ciclo ${ciclo}`);
        } else if (!naFila.some((f) => f.id === acao.id)) {
          naFila.push({ id: acao.id, liberaNoCiclo: ciclo + opcoes.atrasoEmCiclos });
        }
      }
    }

    now += 5000; engine.tick(); vigiar(`ciclo ${ciclo} fim`);
    engine.next(); vigiar(`ciclo ${ciclo} -> ritmo`);
    if (opcoes.chocavel) {
      engine.next("chocavel"); vigiar(`ciclo ${ciclo} chocável`);
      engine.registerExecution("shock"); vigiar(`CHOQUE ${ciclo + 1}`);
    } else {
      engine.next("nao_chocavel"); vigiar(`ciclo ${ciclo} não chocável`);
    }
    engine.next(); vigiar(`entra rcp ciclo ${ciclo + 1}`);
  }

  return { falhas, eventos, picoDePendentes, final: contagens() };
}

const CENARIOS = [
  { nome: "A — confirmação imediata, chocável", chocavel: true, atrasoEmCiclos: 0, ciclos: 10 },
  { nome: "B — confirmação atrasada 1 ciclo, chocável", chocavel: true, atrasoEmCiclos: 1, ciclos: 10 },
  { nome: "C — não chocável (assistolia/AESP)", chocavel: false, atrasoEmCiclos: 0, ciclos: 10 },
];

let totalDeFalhas = 0;
for (const cenario of CENARIOS) {
  const { falhas, eventos, picoDePendentes, final } = rodarCenario(cenario);
  console.log(`\n═══ ${cenario.nome} ═══\n`);
  console.log("min\ttipo\t\tdroga\t\tcue");
  for (const e of eventos) {
    console.log(
      `${String(e.min).padEnd(7)}\t${e.tipo.padEnd(10)}\t${e.droga.padEnd(14)}\t${e.cue ?? ""}`
    );
  }
  console.log(
    `\nchoques ${final.choques} · adrenalina ${final.adrenaline.adm}/${final.adrenaline.rec} · ` +
      `antiarrítmico ${final.antiarrhythmic.adm}/${final.antiarrhythmic.rec} · ` +
      `pico pendentes ${JSON.stringify(picoDePendentes)}`
  );
  if (falhas.length) {
    totalDeFalhas += falhas.length;
    console.error(`\n❌ ${falhas.length} violação(ões):`);
    for (const f of falhas) console.error(`  - ${f}`);
  } else {
    console.log("✅ I1, I2 e I3 mantidas.");
  }
}

Date.now = realNow;

console.log("\n" + "═".repeat(70));
if (totalDeFalhas) {
  console.error(`\n❌ ${totalDeFalhas} violação(ões) no total — dose pedida duas vezes.\n`);
  process.exit(1);
}
console.log("\n✅ Nos 3 cenários, nenhuma dose foi pedida duas vezes nem confirmada no vazio.\n");
