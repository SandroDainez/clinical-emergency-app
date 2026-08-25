#!/usr/bin/env node
/**
 * PROMETE: que sair de um módulo e retomá-lo NÃO desloque os marcos temporais —
 *   que um marco criado às 14:00 continue sendo 14:00 depois de o usuário ficar
 *   8 minutos fora. Mede nas duas árvores que declaram `marcos` (crises
 *   convulsivas e pré-eclâmpsia) e confere que o shell recoloca os marcos
 *   DEPOIS do replay.
 * NÃO PROMETE: que a retomada preserve histórico, ações realizadas ou decisões
 *   — isso é `test:retomada-snapshot`. Nem que os limiares de tempo de cada
 *   módulo estejam clinicamente certos (test:prazos, test:convulsoes,
 *   test:eclampsia).
 * UNIVERSO: as duas árvores com `marcos`, o motor, e o `retomar()` do shell.
 *
 * ── O DEFEITO, MEDIDO ANTES DE SER CORRIGIDO ────────────────────────────────
 *
 * A retomada de fluxo não restaura estado: ela faz REPLAY — `reset()` e depois
 * `setValue` de cada valor salvo. E `setValue` de um campo declarado em
 * `tree.marcos` chama `marcar()`, que ancora o relógio em
 * `agora − decorrido`. No replay, "agora" é o instante da RETOMADA.
 *
 * Sondagem original, na árvore real de crises convulsivas:
 *
 *     marco antes  : 16:59:06Z
 *     marco depois : 17:07:06Z
 *     deslocamento : 8 min PARA A FRENTE
 *
 * Paciente convulsionando há 12 minutos. O médico sai para consultar outro
 * protocolo, gasta 8, volta — e o app volta a achar que a crise tem 12 minutos.
 *
 * ⚠️ EM ESTADO EPILÉPTICO ISSO ATRASA A SEGUNDA E A TERCEIRA LINHA EXATAMENTE
 * PELO TEMPO QUE ELE GASTOU CONSULTANDO. O relógio que deveria empurrar o
 * escalonamento é o que passa a segurá-lo.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const ARVORES = {
  "crises-convulsivas": "seizure-decision-tree.ts",
  "pre-eclampsia": "eclampsia-decision-tree.ts",
};

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "marco-retomada-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "core", "decision-tree", "engine.ts"),
    ...Object.values(ARVORES).map((f) => path.join(appDir, f)),
  ],
  { cwd: appDir, stdio: "pipe" }
);
const { DecisionTreeEngine } = require(path.join(tempDir, "core", "decision-tree", "engine.js"));

// ── A. O CICLO REAL, MÓDULO A MÓDULO ───────────────────────────────────────
//
// A sequência abaixo é a MESMA que o shell executa em `retomar()`: reset,
// replay de cada valor salvo e, por último, a recolocação dos marcos.
const T0 = Date.UTC(2026, 7, 25, 14, 0, 0); // 14:00 — o instante do marco
const SAIU_AOS = 5 * 60_000;                // sai do módulo às 14:05
const VOLTOU_AOS = 13 * 60_000;             // volta às 14:13

for (const [slug, arquivo] of Object.entries(ARVORES)) {
  const mod = require(path.join(tempDir, arquivo.replace(/\.ts$/, ".js")));
  const arvore = Object.values(mod).find((v) => v && v.nodes);
  if (!arvore) {
    falhas.push(`\`${slug}\`: a árvore não carregou — a conferência NÃO RODOU.`);
    continue;
  }
  const campoDoMarco = Object.keys(arvore.marcos ?? {})[0];
  if (!campoDoMarco) {
    falhas.push(
      `\`${slug}\` não declara mais \`marcos\`.\n` +
      `      ⚠️ Esta trava perde o alvo: ela passaria a rodar sobre um módulo sem relógio clínico.`
    );
    continue;
  }

  // 14:00 — o médico registra que a crise começou há 12 minutos.
  let relogio = T0;
  const m1 = new DecisionTreeEngine(arvore, { agora: () => relogio });
  m1.setValue(campoDoMarco, "12");
  const marcos = m1.exportarMarcos();
  const chave = Object.keys(marcos)[0];
  const original = Number(marcos[chave]);

  confere(
    `\`${slug}\`: o marco nasce ancorado no evento, não na abertura do app`,
    original === T0 - 12 * 60_000,
    `veio ${new Date(original).toISOString()}, esperado ${new Date(T0 - 12 * 60_000).toISOString()} — ` +
    `um relógio que conta da tela responde "há quanto tempo o app está aberto".`
  );

  // 14:05 sai · 14:13 volta. O shell reconstrói por REPLAY.
  relogio = T0 + VOLTOU_AOS;
  const m2 = new DecisionTreeEngine(arvore, { agora: () => relogio });
  const salvos = { [campoDoMarco]: "12" }; // é o que `valoresRef` guarda
  for (const [k, v] of Object.entries(salvos)) m2.setValue(k, v);

  const soComReplay = Number(m2.exportarMarcos()[chave]);
  confere(
    `\`${slug}\`: o replay SOZINHO desloca o marco — o defeito continua reproduzível`,
    soComReplay !== original,
    `o replay devolveu o marco original sem a correção.\n` +
    `      ⚠️ Isso não é boa notícia: significa que esta trava deixou de exercitar o defeito, e ` +
    `passaria a aprovar mesmo se a correção fosse removida (R-87).`
  );

  // A correção: os marcos originais voltam DEPOIS do replay.
  m2.restaurarMarcos(marcos);
  const depois = Number(m2.exportarMarcos()[chave]);

  confere(
    `\`${slug}\`: depois da retomada o marco continua sendo o original`,
    depois === original,
    `saiu ${new Date(original).toISOString()} e voltou ${new Date(depois).toISOString()} — ` +
    `deslocamento de ${Math.round((depois - original) / 60_000)} min. O paciente "rejuvenesceu" o ` +
    `tempo que o médico passou fora do módulo, e o escalonamento atrasa junto.`
  );

  const deslocouSemCorrecao = Math.round((soComReplay - original) / 60_000);
  linhas.push(
    `  ${slug}: marco ${new Date(original).toISOString().slice(11, 19)} · ` +
    `sem correção iria para ${new Date(soComReplay).toISOString().slice(11, 19)} (+${deslocouSemCorrecao} min) · ` +
    `com correção: ${new Date(depois).toISOString().slice(11, 19)}`
  );

  // ── Nenhum outro valor clínico pode mudar na retomada ───────────────────
  //
  // Uma correção de relógio que mexesse em valor de paciente seria pior que o
  // defeito que ela conserta.
  const antes = m1.getValues();
  const dep = m2.getValues();
  const chavesClinicas = (o) => Object.keys(o).filter((k) => !k.startsWith("__marco_")).sort();
  confere(
    `\`${slug}\`: nenhum valor clínico muda na retomada`,
    JSON.stringify(chavesClinicas(antes).map((k) => [k, antes[k]])) ===
      JSON.stringify(chavesClinicas(dep).map((k) => [k, dep[k]])),
    `os valores divergiram entre antes e depois da retomada — a correção do relógio não pode tocar ` +
    `em nada além do relógio.`
  );

  // E a restauração não pode virar porta lateral para gravar valor clínico.
  m2.restaurarMarcos({ peso: "999", __marco_falso: "1" });
  confere(
    `\`${slug}\`: restaurarMarcos recusa chave que não é marco`,
    m2.getValues().peso !== "999",
    `"peso" entrou por \`restaurarMarcos\` — uma porta que grava valor clínico sem passar pelo ` +
    `caminho normal contorna toda a validação de entrada.`
  );

  // A trilha clínica NÃO pode ganhar pontos por causa disso.
  confere(
    `\`${slug}\`: restaurar marcos não sintetiza histórico`,
    m2.getHistorico(chave).length === 0,
    `o campo interno de relógio ganhou trilha — e trilha inventada é exatamente o que a regra do ` +
    `autor proíbe ("nunca inventar trilha anterior").`
  );
}

// ── B. O SHELL RECOLOCA OS MARCOS, E DEPOIS DO REPLAY ──────────────────────
//
// ⚠️ ESTA CONFERÊNCIA É ESTRUTURAL, e a limitação está declarada: ela lê o
// arquivo do shell, não executa React. O que ela mede é a ORDEM, porque a
// ordem é a parte que falha em silêncio — recolocar os marcos ANTES do replay
// não dá erro nenhum, apenas não corrige nada.
{
  const shell = path.join(appDir, "components", "protocol-screen", "acls-decision-flow-screen.tsx");
  const fonte = fs.readFileSync(shell, "utf8");

  if (!/marcos:\s*engine\.exportarMarcos\(\)/.test(fonte)) {
    falhas.push(
      "o shell não salva mais os marcos na sessão.\n" +
      "      ⚠️ Sem salvar, não há o que recolocar: a retomada volta a reancorar o relógio."
    );
  } else ok++;

  // ⚠️ A REFERÊNCIA MUDOU DE NOME NO PASSO B (2026-08-25), e esta trava
  // REPROVOU em vez de passar em silêncio — que é o comportamento certo (R-87).
  // O laço de replay passou a usar `reaplicarValorSemTrilha`, porque reaplicar
  // por `setValue` inventava uma medição na hora da volta. A ordem medida aqui
  // continua sendo a mesma e continua importando: pela via de FALLBACK, o
  // replay ainda regenera os marcos, e recolocá-los antes dele não corrigiria
  // nada — sem erro e sem aviso.
  const iReplay = fonte.indexOf("engine.reaplicarValorSemTrilha(campo, valor)");
  const iRestaura = fonte.indexOf("engine.restaurarMarcos(");
  if (iRestaura < 0) {
    falhas.push("o shell não chama `engine.restaurarMarcos(` na retomada — a correção sumiu.");
  } else if (iReplay < 0) {
    falhas.push(
      "o laço de replay (`engine.reaplicarValorSemTrilha(campo, valor)`) não está mais no shell.\n" +
      "      ⚠️ A conferência de ORDEM perdeu a referência — ela não mede mais nada (R-87)."
    );
  } else if (iRestaura < iReplay) {
    falhas.push(
      "`restaurarMarcos` foi chamado ANTES do replay.\n" +
      "      ⚠️ Nessa ordem o replay sobrescreve os marcos originais logo depois, e a correção " +
      "deixa de ter efeito — sem erro, sem aviso, sem nada na tela."
    );
  } else ok++;
}

// ── C. Vacuidade ───────────────────────────────────────────────────────────
confere(
  "as duas árvores com relógio foram exercitadas",
  linhas.length === 2,
  `só ${linhas.length} de 2 módulos mediram — a trava pode ter rodado sobre nada (R-15 item 9).`
);

console.log("\nMarco temporal na retomada — o relógio conta do evento, não da volta\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — sair e voltar não rejuvenesce o paciente\n`);
process.exit(0);
