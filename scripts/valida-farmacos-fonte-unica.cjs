#!/usr/bin/env node
/**
 * PROMETE
 *   Que os quatro construtos farmacológicos da Taquicardia — adenosina,
 *   amiodarona COM PULSO, magnésio no torsades e a conduta de recorrência do
 *   torsades — existam em UM lugar só, e que todo consumidor os CONSUMA em vez
 *   de reescrevê-los.
 *
 * NÃO PROMETE
 *   Que os números estejam certos. Isso é auditoria de conteúdo com fonte
 *   aberta, e já foi feita: a trava protege a DISTRIBUIÇÃO, não o valor.
 *   Também não promete achar paráfrase — quem reescrever "seis miligramas por
 *   via venosa" com outras palavras passa. O alvo é a cópia, que é o que
 *   aconteceu de fato quatro vezes nesta auditoria.
 *
 * UNIVERSO
 *   Todo .ts/.tsx do app fora de node_modules, dist, .expo, scripts, e2e,
 *   locales e lib/i18n. As libs-fonte são o único lugar onde os literais podem
 *   aparecer.
 *
 * POR QUE ELA EXISTE
 *   R-48. Os quatro construtos estavam escritos à mão em 2 a 4 lugares cada, e
 *   a distribuição estava errada de um jeito específico: a superfície de
 *   CONSULTA (Farmacologia) sabia o volume do flush da adenosina e o volume da
 *   ampola; a superfície de AÇÃO (a árvore, onde a dose é administrada) não.
 *
 *   E havia um caso pior que duplicação: os quatro sítios do magnésio diziam a
 *   MESMA coisa em cenários clinicamente diferentes — com pulso e sem pulso —
 *   quando o tempo de infusão muda por uma ordem de grandeza entre os dois.
 *
 * O QUE ELA FAZ QUANDO ALGUÉM ESCREVER O NÚMERO DE NOVO
 *   Falha nomeando o arquivo, a linha e a lib que já tem aquilo.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");

/**
 * Cada alvo: o padrão que denuncia a cópia, o dono e a razão que o autor da
 * cópia precisa ler. As libs-fonte ficam isentas por caminho, não por nome de
 * arquivo — renomear a lib não desliga a trava, quebra o import primeiro.
 */
const ALVOS = [
  {
    nome: "adenosina — esquema 6–12–12",
    padrao: /adenosina[^.]{0,80}\b6\s*mg\b|\b6\s*mg[^.]{0,40}adenosina/i,
    dono: "lib/adenosina.ts",
    consts: "ADENOSINA_DOSE_TSV / ADENOSINA_ADMINISTRACAO",
  },
  {
    nome: "adenosina — volume do flush",
    padrao: /flush\s*(de\s*)?20\s*mL|20\s*mL\s*de\s*(salina|soro)/i,
    dono: "lib/adenosina.ts",
    consts: "ADENOSINA_ADMINISTRACAO",
  },
  {
    nome: "amiodarona com pulso — carga e manutenção",
    padrao: /150\s*mg[^.]{0,60}(10\s*min|dez\s*min)|1\s*mg\/min[^.]{0,40}6\s*h|0,5\s*mg\/min/i,
    dono: "lib/amiodarona-com-pulso.ts",
    consts: "AMIODARONA_COM_PULSO_CARGA / _MANUTENCAO / _RECORRENCIA",
  },
  {
    nome: "magnésio no torsades",
    padrao: /magnésio[^.]{0,60}\b(1[–-]2|2)\s*g\b|\b(1[–-]2|2)\s*g\b[^.]{0,40}magnésio/i,
    dono: "lib/magnesio-torsades.ts",
    consts: "MAGNESIO_TORSADES_COM_PULSO / _SEM_PULSO / _MANUTENCAO",
  },
  {
    nome: "sobre-estimulação no torsades",
    padrao: /90\s*[–-]\s*110\s*bpm|isoproterenol|isoprenalina/i,
    dono: "lib/torsades-recorrente.ts",
    consts: "TORSADES_ACELERAR",
  },
];

/**
 * Exceções nomeadas, cada uma com a razão. Sem lista genérica: quem precisar
 * de exceção nova escreve aqui por que o construto dali é outro.
 */
const ISENTOS = new Set([
  "lib/adenosina.ts",
  "lib/amiodarona-com-pulso.ts",
  "lib/magnesio-torsades.ts",
  "lib/torsades-recorrente.ts",
  // A PCR tem regime PRÓPRIO de amiodarona (300 mg em bolus → 150 mg um ciclo
  // depois). É outro construto, não cópia deste — R-36.
  "acls/reducer.ts",
  "acls/phase-notes.ts",
  "acls/presentation.ts",
  "engine.ts",
  "components/protocol-screen/acls-protocol-screen.tsx",
  // O EAP tem os dois regimes de amiodarona na FA, com razão documentada lá.
  "eap-decision-tree.ts",
  // Eclâmpsia, CAD, asma e eletrólitos usam magnésio com OUTRA indicação e
  // outra dose — mesmo fármaco, construto diferente.
  "eclampsia-decision-tree.ts",
  "dka-hhs-decision-tree.ts",
  "ventilation-decision-tree.ts",
  "dyspnea-decision-tree.ts",
  "seizure-decision-tree.ts",
  "shock-decision-tree.ts",
  "sedation-engine.ts",
  "lib/broncoespasmo-anafilaxia.ts",
  "components/protocol-screen/electrolyte-calculator-screen.tsx",
  "components/protocol-screen/stabilization-first-card.tsx",
]);

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|scripts|e2e|locales/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name) && !/lib\/i18n/.test(p)) {
      saida.push(p);
    }
  }
  return saida;
}

const falhas = [];
let vistos = 0;

for (const arquivo of fontes(appDir)) {
  const rel = path.relative(appDir, arquivo);
  if (ISENTOS.has(rel)) continue;
  vistos++;
  const linhas = fs.readFileSync(arquivo, "utf8").split("\n");
  linhas.forEach((linha, i) => {
    // Só literais de texto interessam: import, comentário e nome de const não
    // são conteúdo que o médico lê.
    if (/^\s*(\/\/|\*|\/\*|import|})/.test(linha)) return;
    if (!/["'`]/.test(linha)) return;
    for (const alvo of ALVOS) {
      if (alvo.padrao.test(linha)) {
        falhas.push({ rel, linha: i + 1, texto: linha.trim().slice(0, 110), alvo });
      }
    }
  });
}

console.log(`\n   ${vistos} arquivos varridos · ${ALVOS.length} construtos vigiados\n`);

if (falhas.length === 0) {
  console.log("✅ adenosina, amiodarona com pulso, magnésio no torsades e sobre-estimulação vivem só nas libs-fonte\n");
  process.exit(0);
}

for (const f of falhas) {
  console.log(`❌ ${f.rel}:${f.linha} — ${f.alvo.nome}`);
  console.log(`    «${f.texto}»`);
  console.log(`    Este construto tem dono: ${f.alvo.dono} (${f.alvo.consts}).`);
  console.log(`    Importe de lá. Se o construto daqui for OUTRO — cenário diferente, dose`);
  console.log(`    diferente — declare a isenção com a razão em ISENTOS, nesta trava.\n`);
}
console.log(`❌ ${falhas.length} cópia(s) de construto que tem fonte única\n`);
process.exit(1);
