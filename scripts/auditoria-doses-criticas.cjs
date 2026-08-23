#!/usr/bin/env node
/**
 * PROMETE: que as conversões dose ↔ velocidade das vasoativas e da sedação
 *   sejam monotônicas, respeitem teto e BLOQUEIEM peso ausente ou inválido; e
 *   que achado classificado como "erro" REPROVE o build.
 * NÃO PROMETE: cobertura do trombolítico. Os dois arquivos que a continham
 *   foram apagados em a9b16ad e ele passou a CRASHAR em silêncio (D-83). Hoje
 *   ele imprime `Blocos PULADOS: 2` a cada rodada, em vez de pular calado.
 * UNIVERSO: `vasoactive-engine.ts` e `sedation-engine.ts`, compilados; o número
 *   de conversões testadas sai impresso junto do resultado.
 *
 * CAMADA 4 (parte 2) — Funções críticas de dose fora do motor de calculadoras.
 *
 * O `clinical-calculators-engine` tem 15 ferramentas. As contas de MAIOR risco não
 * estão lá: conversão dose ↔ velocidade de infusão das drogas vasoativas, bolus e
 * infusão de sedação, dose de trombolítico por peso no AVC e nas síndromes
 * coronarianas. São elas que produzem o número que entra na bomba.
 *
 * ## A propriedade central: IDA E VOLTA
 *
 * `calcFromDose` transforma dose em mL/h; `calcFromRate` faz o caminho inverso.
 * Aplicar as duas em sequência tem de devolver a dose original. Se não devolver, há
 * erro de conversão — e é o tipo de erro que não aparece em revisão de código,
 * porque cada função isolada parece certa.
 *
 * É teste de PROPRIEDADE, não de exemplo: vale para toda combinação de droga, peso,
 * diluição e unidade, não para um caso escolhido a dedo.
 *
 * ## O resto
 *
 * Limites (dose máxima respeitada), monotonicidade (mais peso nunca dá menos dose),
 * peso ausente (tem de BLOQUEAR, não estimar), e valores impossíveis.
 *
 * Uso: node scripts/auditoria-doses-criticas.cjs
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "auditoria-doses-"));

execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "vasoactive-engine.ts"),
    path.join(appDir, "sedation-engine.ts"),
    // ⚠️ REAPONTADO SÓ PARA O AVC — decisão do autor, 2026-08-23, e a razão é
    // clínica, não de conveniência: no AVC a janela e os critérios de exclusão
    // são RÍGIDOS e o erro é catastrófico; nas coronárias a angioplastia
    // primária é a regra e o trombolítico é exceção. Ampliar para coronárias
    // fica para a revisão específica daquele módulo.
    //
    // ⚠️ E O ARQUIVO AINDA NÃO EXISTE: `avc/calculators.ts` foi apagado em
    // a9b16ad e a dose de trombolítico do AVC vive hoje noutro lugar, com outro
    // nome. O bloco continua PULADO e contado — o que mudou é que o escopo
    // deixou de ser dúvida: quando o alvo for localizado, ele entra aqui, e só
    // ele.
    //
    // ⚠️ COBERTURA REDUZIDA, DECLARADA (D-83): apontava também para
    // `avc/calculators.ts` e `coronary/calculators.ts`, apagados no refactor
    // a9b16ad. Desde então este instrumento CRASHAVA na compilação a cada
    // rodada — e ninguém viu, porque ele não estava no test:all. Voltou a rodar
    // sobre os dois que existem. O que deixou de ser auditado está na D-83.
  ],
  { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] }
);

const vaso = require(path.join(tempDir, "vasoactive-engine.js"));
const sed = require(path.join(tempDir, "sedation-engine.js"));
// ⚠️ D-83: os dois módulos de trombolítico não têm mais este arquivo. Objeto
// vazio faz os blocos que dependem deles serem PULADOS — e o pulo é contado e
// impresso no fim, para não virar cobertura silenciosa.
let pulados = 0;
const avc = {};
const cor = {};

const achados = [];
const registrar = (area, gravidade, tipo, detalhe) =>
  achados.push({ area, gravidade, tipo, detalhe });

// ── 1. Vasoativos: ida e volta ──────────────────────────────────────────────
const UNIDADES = ["mcg/kg/min", "mcg/min", "mg/h", "U/min"];
const PESOS = [3, 40, 70, 120, 200];
const AMPOLAS = [1, 2, 4];
const DILUENTES = [0, 100, 230, 500];
const DOSES = [0.01, 0.05, 0.5, 5, 20, 100];
const APRESENTACOES = [
  { nome: "noradrenalina 4 mg/4 mL", ampouleVolumeMl: 4, basePerAmpoule: 4000 },
  { nome: "adrenalina 1 mg/1 mL", ampouleVolumeMl: 1, basePerAmpoule: 1000 },
  { nome: "dobutamina 250 mg/20 mL", ampouleVolumeMl: 20, basePerAmpoule: 250000 },
];

let idaEVoltaTestados = 0;
for (const ap of APRESENTACOES) {
  for (const unidade of UNIDADES) {
    for (const peso of PESOS) {
      for (const ampolas of AMPOLAS) {
        for (const diluente of DILUENTES) {
          for (const dose of DOSES) {
            const params = {
              weightKg: peso,
              ampoules: ampolas,
              ampouleVolumeMl: ap.ampouleVolumeMl,
              basePerAmpoule: ap.basePerAmpoule,
              diluentMl: diluente,
              doseUnit: unidade,
            };
            const ida = vaso.calcFromDose({ ...params, dose });
            if (!ida) continue;

            if (!Number.isFinite(ida.rateMlH) || ida.rateMlH < 0) {
              registrar(
                "vasoativos", "erro", "velocidade-invalida",
                `${ap.nome} · ${unidade} · peso ${peso} · ${dose} → ${ida.rateMlH} mL/h`
              );
              continue;
            }

            const volta = vaso.calcFromRate({ ...params, rateMlH: ida.rateMlH });
            idaEVoltaTestados += 1;
            if (!volta) {
              registrar(
                "vasoativos", "erro", "ida-sem-volta",
                `${ap.nome} · ${unidade} · peso ${peso} · dose ${dose} vira ${ida.rateMlH} mL/h, mas o inverso não calcula`
              );
              continue;
            }
            const erroRelativo = Math.abs(volta.dose - dose) / dose;
            if (erroRelativo > 1e-9) {
              registrar(
                "vasoativos", "erro", "ida-e-volta-divergente",
                `${ap.nome} · ${unidade} · peso ${peso}: dose ${dose} → ${ida.rateMlH.toFixed(4)} mL/h → ${volta.dose} (erro ${(erroRelativo * 100).toFixed(4)}%)`
              );
            }
          }
        }
      }
    }
  }
}

// Entradas impossíveis têm de ser recusadas, não calculadas.
for (const [rotulo, params] of [
  ["peso zero em dose por peso", { weightKg: 0, ampoules: 1, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: 96, dose: 0.1, doseUnit: "mcg/kg/min" }],
  ["peso negativo", { weightKg: -70, ampoules: 1, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: 96, dose: 0.1, doseUnit: "mcg/kg/min" }],
  ["dose negativa", { weightKg: 70, ampoules: 1, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: 96, dose: -1, doseUnit: "mcg/kg/min" }],
  ["zero ampolas", { weightKg: 70, ampoules: 0, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: 96, dose: 0.1, doseUnit: "mcg/kg/min" }],
  ["diluente negativo", { weightKg: 70, ampoules: 1, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: -50, dose: 0.1, doseUnit: "mcg/kg/min" }],
]) {
  const r = vaso.calcFromDose(params);
  if (r !== null) {
    registrar("vasoativos", "erro", "entrada-impossivel-aceita", `${rotulo}: devolveu ${r.rateMlH} mL/h em vez de recusar`);
  }
}

// Monotonicidade: mais dose nunca pode dar menos velocidade.
for (const unidade of UNIDADES) {
  const base = { weightKg: 70, ampoules: 1, ampouleVolumeMl: 4, basePerAmpoule: 4000, diluentMl: 96, doseUnit: unidade };
  let anterior = -Infinity;
  for (const dose of [0.01, 0.1, 1, 10, 50]) {
    const r = vaso.calcFromDose({ ...base, dose });
    if (!r) continue;
    if (r.rateMlH < anterior) {
      registrar("vasoativos", "erro", "nao-monotonico", `${unidade}: dose ${dose} produz velocidade MENOR que a dose anterior`);
    }
    anterior = r.rateMlH;
  }
}

// ── 2. Trombolítico do AVC ──────────────────────────────────────────────────
if (typeof avc.calculateThrombolyticDose === "function") {
  const trombos = ["alteplase", "tenecteplase"];
  for (const id of trombos) {
    // Peso ausente TEM de bloquear: dose de trombolítico estimada é risco de sangramento.
    for (const peso of [null, 0, -70]) {
      const r = avc.calculateThrombolyticDose(id, peso, false);
      if (r && r.totalDoseMg != null) {
        registrar("avc-trombolitico", "erro", "peso-ausente-nao-bloqueia", `${id} com peso ${peso} devolveu ${r.totalDoseMg} mg`);
      }
    }

    let anterior = -Infinity;
    let tetoVisto = null;
    for (const peso of [30, 50, 70, 90, 100, 120, 200, 400]) {
      const r = avc.calculateThrombolyticDose(id, peso, false);
      if (!r || r.totalDoseMg == null) continue;
      if (!Number.isFinite(r.totalDoseMg) || r.totalDoseMg <= 0) {
        registrar("avc-trombolitico", "erro", "dose-invalida", `${id} peso ${peso} → ${r.totalDoseMg} mg`);
      }
      if (r.totalDoseMg < anterior) {
        registrar("avc-trombolitico", "erro", "nao-monotonico", `${id}: peso ${peso} recebe MENOS dose que peso menor`);
      }
      anterior = r.totalDoseMg;
      if (tetoVisto === null && peso >= 120) tetoVisto = r.totalDoseMg;
      // Bolus + infusão têm de somar o total.
      if (r.bolusDoseMg != null && r.infusionDoseMg != null) {
        const soma = r.bolusDoseMg + r.infusionDoseMg;
        if (Math.abs(soma - r.totalDoseMg) > 0.51) {
          registrar(
            "avc-trombolitico", "erro", "bolus-mais-infusao-nao-fecha",
            `${id} peso ${peso}: bolus ${r.bolusDoseMg} + infusão ${r.infusionDoseMg} = ${soma} ≠ total ${r.totalDoseMg}`
          );
        }
      }
    }
    // Teto de dose: peso alto não pode escalar sem limite.
    const gigante = avc.calculateThrombolyticDose(id, 400, false);
    const normal = avc.calculateThrombolyticDose(id, 100, false);
    if (gigante?.totalDoseMg && normal?.totalDoseMg && gigante.totalDoseMg > normal.totalDoseMg * 1.5) {
      registrar(
        "avc-trombolitico", "aviso", "sem-teto-aparente",
        `${id}: peso 400 kg → ${gigante.totalDoseMg} mg (peso 100 kg → ${normal.totalDoseMg} mg)`
      );
    }
  }

} else {
  // ⚠️ PULO CONTADO, não silencioso: o arquivo auditado não existe mais (D-83).
  pulados++;
}

// ── 3. Sedação ──────────────────────────────────────────────────────────────
for (const unidade of ["mcg/kg/min", "mcg/kg/h", "mg/kg/h", "mg/h"]) {
  for (const peso of [3, 70, 200]) {
    for (const dose of [0.5, 5, 50]) {
      let r;
      try {
        r = sed.sedRateFromDose(unidade, dose, peso, 1000);
      } catch (e) {
        registrar("sedacao", "erro", "excecao", `${unidade} peso ${peso} dose ${dose}: ${String(e.message).slice(0, 70)}`);
        continue;
      }
      if (r == null) continue;
      if (!Number.isFinite(r) || r < 0) {
        registrar("sedacao", "erro", "velocidade-invalida", `${unidade} peso ${peso} dose ${dose} → ${r}`);
      }
    }
  }
}
for (const peso of [0, -10]) {
  const r = sed.sedRateFromDose("mcg/kg/min", 5, peso, 1000);
  if (r != null && Number.isFinite(r) && r > 0) {
    registrar("sedacao", "erro", "peso-invalido-aceito", `peso ${peso} devolveu ${r}`);
  }
}

// ── 4. Trombolítico e anticoagulação coronariana ────────────────────────────
// ⚠️ ESTA GUARDA JÁ EXISTIA E ERA MUDA: pulava o bloco inteiro sem dizer, o que
// é cobertura silenciosa — a pior espécie, porque o relatório sai limpo.
if (typeof cor.calculateLyticDose !== "function") pulados++;
if (typeof cor.calculateLyticDose === "function") {
  for (const peso of [null, 0, -70, 30, 70, 120, 400]) {
    let r;
    try {
      r = cor.calculateLyticDose("tenecteplase", peso);
    } catch (e) {
      registrar("coronaria", "erro", "excecao", `calculateLyticDose peso ${peso}: ${String(e.message).slice(0, 70)}`);
      continue;
    }
    const dose = r?.totalDoseMg ?? r?.doseMg ?? null;
    if ((peso == null || peso <= 0) && dose != null) {
      registrar("coronaria", "erro", "peso-ausente-nao-bloqueia", `peso ${peso} devolveu ${dose}`);
    }
    if (dose != null && (!Number.isFinite(dose) || dose <= 0)) {
      registrar("coronaria", "erro", "dose-invalida", `peso ${peso} → ${dose}`);
    }
  }
}

// ── Relatório ───────────────────────────────────────────────────────────────
const saidaDir = path.join(appDir, "auditoria");
fs.mkdirSync(saidaDir, { recursive: true });

const erros = achados.filter((a) => a.gravidade === "erro");
const avisos = achados.filter((a) => a.gravidade === "aviso");
const porTipo = new Map();
for (const a of achados) {
  if (!porTipo.has(a.tipo)) porTipo.set(a.tipo, []);
  porTipo.get(a.tipo).push(a);
}

const L = [];
L.push("# Camada 4 (parte 2) — Funções críticas de dose");
L.push("");
L.push("> Gerado por `node scripts/auditoria-doses-criticas.cjs`. Nenhum código alterado.");
L.push("");
L.push(`- Conversões dose ↔ velocidade exercitadas: **${idaEVoltaTestados}**`);
L.push(`- Erros: **${erros.length}** · Avisos: **${avisos.length}**`);
L.push("");
if (achados.length) {
  for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
    L.push(`### ${tipo} — ${itens[0].gravidade} (${itens.length})`);
    L.push("");
    for (const a of itens.slice(0, 40)) L.push(`- **${a.area}**: ${a.detalhe}`);
    if (itens.length > 40) L.push(`- … mais ${itens.length - 40}`);
    L.push("");
  }
} else {
  L.push("Nenhum achado. As conversões fecham em ida e volta, os limites são respeitados,");
  L.push("peso ausente bloqueia o cálculo e entradas impossíveis são recusadas.");
}

fs.writeFileSync(path.join(saidaDir, "CAMADA-4-DOSES-CRITICAS.md"), L.join("\n") + "\n");
fs.writeFileSync(path.join(saidaDir, "camada-4-doses-criticas.json"), JSON.stringify({ idaEVoltaTestados, achados }, null, 1));

console.log(`\nConversões dose ↔ velocidade testadas: ${idaEVoltaTestados}`);
console.log(`⚠️ Blocos PULADOS por falta do arquivo auditado: ${pulados} (D-83)`);
console.log(`   escopo decidido pelo autor em 2026-08-23: o auditor volta SÓ para o AVC — nas coronárias a angioplastia primária é a regra e o trombolítico é exceção`);
console.log(`Erros: ${erros.length} · Avisos: ${avisos.length}`);
for (const [tipo, itens] of [...porTipo.entries()].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`  ${tipo}: ${itens.length}`);
}
console.log(`\nSaída em auditoria/CAMADA-4-DOSES-CRITICAS.md`);

// ⚠️ SE UM ACHADO IMPORTA, ELE REPROVA. SE NÃO REPROVA, É DECORAÇÃO.
//
// Este instrumento classificava achado como "erro" e saía com código 0. Em
// 2026-08-23 isso custou caro e de forma medida: o instrumento irmão (auditoria-calculos) deixou passar uma exceção em
// produção pela mesma forma. Esta linha existe antes de custar aqui também.
// Uma lista de 50 avisos onde mora 1 erro é a forma mais confiável de esconder
// o erro. Aviso continua aviso; erro reprova.
if (erros.length) {
  console.error(`\n❌ ${erros.length} achado(s) classificado(s) como ERRO por este instrumento.`);
}
process.exit(erros.length ? 1 : 0);
