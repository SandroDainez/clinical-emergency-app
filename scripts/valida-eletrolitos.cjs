/**
 *
 * PROMETE: as constantes de sódio e cálcio conferem com a massa molar por RECÁLCULO (R-17), a paridade hipo × hiper se mantém, e torsades e fentanil não divergem entre módulos.
 * NÃO PROMETE: que as condutas de reposição estejam certas — confere aritmética e uniformidade, não indicação.
 * UNIVERSO: os módulos de eletrólitos; a varredura de torsades e fentanil é de universo ABERTO.

 * Correções eletrolíticas: a aritmética fecha e os dois lados têm o mesmo cuidado.
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 * 1. AS CONSTANTES das soluções, contra a massa molar. NaCl 3% = 513 mEq/L,
 *    20% = 3,42 mEq/mL, SF = 154, 0,45% = 77 — e a fração de mistura que
 *    transforma SF + NaCl 20% em 3%. São os números de onde sai todo o resto;
 *    errar um deles erra o módulo inteiro sem que nada mais denuncie.
 *
 * 2. PARIDADE HIPO × HIPER no sódio. O limite de 8 mEq/24 h da hipernatremia
 *    estava NO CÓDIGO e nunca era dito: "edema cerebral" 0×, "sobrecorreção"
 *    0×, limite explícito 0× — contra 4× de sobrecorreção e o nome do dano do
 *    lado da hiponatremia, na MESMA tela. O erro simétrico é o esquecido.
 *
 * 3. OS DOIS SAIS DE CÁLCIO, com o fator. O módulo só oferecia gluconato,
 *    enquanto o app usa CLORETO em politrauma, choque e PCR na gestante — quem
 *    viu a droga lá lê os dois como intercambiáveis. 1 g de cloreto ≈ 3 g de
 *    gluconato em cálcio elementar.
 *
 * Este script FALHA O BUILD. Escrito com a lista do R-15.
 */

const fs = require("node:fs");
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const TELA = "components/protocol-screen/electrolyte-calculator-screen.tsx";
const bruto = fs.readFileSync(path.join(appDir, TELA), "utf8");
// R-15 item 1: comentários fora — este arquivo passou a documentar os próprios
// defeitos, e a documentação cita os números que as regras procuram.
const src = bruto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

/** Extrai o bloco de um `case` do switch de estratégia. */
function bloco(nome) {
  const linhas = src.split("\n");
  const i = linhas.findIndex((l) => l.includes(`case "${nome}": {`));
  if (i < 0) return null;
  const ordem = ["hyponatremia","hypernatremia","hypokalemia","hyperkalemia","hypocalcemia",
    "hypercalcemia","hypomagnesemia","hypermagnesemia","hypophosphatemia","hyperphosphatemia",
    "hypochloremia","hyperchloremia"];
  const proximo = ordem[ordem.indexOf(nome) + 1];
  const j = proximo
    ? linhas.findIndex((l, k) => k > i && l.includes(`case "${proximo}": {`))
    : linhas.length;
  return linhas.slice(i, j < 0 ? linhas.length : j).join("\n");
}

// ── A. As constantes, contra a massa molar do NaCl (58,44) ──────────────────
const MM = 58.44;
const CONSTANTES = [
  ["NaCl 3% = 513 mEq/L", /\(513 - /, Math.round((30 / MM) * 1000), 513],
  ["NaCl 20% = 3,42 mEq/mL", /3\.42/, Math.round((200 / MM) * 100) / 100, 3.42],
  ["SF 0,9% = 154 mEq/L", /154/, Math.round((9 / MM) * 1000), 154],
  ["NaCl 0,45% = 77 mEq/L", /\(77 - /, Math.round((4.5 / MM) * 1000), 77],
];
for (const [rotulo, re, calculado, declarado] of CONSTANTES) {
  if (calculado !== declarado) {
    falhas.push(`a referência desta trava está errada em "${rotulo}": massa molar dá ${calculado}.`);
  } else ok++;
  if (!re.test(src)) {
    falhas.push(`${TELA} não usa mais a constante de ${rotulo} — a aritmética do sódio mudou de base.`);
  } else ok++;
}
// A fração da mistura SF + NaCl 20% → 3% precisa produzir 0,513 mEq/mL.
{
  const m = src.match(/\((0\.\d+) - (0\.\d+)\) \/ \((\d\.\d+) - (0\.\d+)\)/);
  if (!m) {
    falhas.push("a fração de mistura (SF 0,9% + NaCl 20% → 3%) não foi encontrada — a leitura cegou.");
  } else {
    const [, alvo, base, forte, base2] = m.map(Number);
    const frac = (alvo - base) / (forte - base2);
    const conc = frac * forte + (1 - frac) * base;
    if (Math.abs(conc - 0.513) > 1e-4) {
      falhas.push(
        `a mistura SF + NaCl 20% produz ${conc.toFixed(4)} mEq/mL, não 0,513 (NaCl 3%). ` +
        `A alternativa oferecida ao NaCl 3% pronto não é equivalente a ele.`
      );
    } else ok++;
  }
}

// ── B. PARIDADE hipo × hiper no sódio ───────────────────────────────────────
{
  const hipo = bloco("hyponatremia");
  const hiper = bloco("hypernatremia");
  if (!hipo || !hiper) {
    falhas.push("blocos de hipo/hipernatremia não encontrados — a conferência de paridade não rodou.");
  } else {
    // Cada lado nomeia o SEU dano, e nenhum dos dois fica sem limite escrito.
    const EXIGE = [
      [hipo, /desmielin/i, "hiponatremia", "o nome do dano da correção rápida (desmielinização osmótica)"],
      [hipo, /8–10 mEq|8-10 mEq/, "hiponatremia", "o teto de 8–10 mEq/L em 24 h"],
      [hiper, /edema cerebral/i, "hipernatremia", "o nome do dano da correção rápida (EDEMA CEREBRAL)"],
      [hiper, /8–10 mEq|8-10 mEq/, "hipernatremia", "o teto de 8–10 mEq/L em 24 h"],
      [hiper, /0,5 mEq\/L\/h/, "hipernatremia", "a velocidade horária equivalente (0,5 mEq/L/h)"],
      [hiper, /agud/i, "hipernatremia", "a distinção agudo × crônico, que vem antes da escolha da velocidade"],
    ];
    for (const [texto, re, lado, oque] of EXIGE) {
      if (!re.test(texto)) {
        falhas.push(
          `${lado}: falta ${oque}. O limite pode estar no CÓDIGO e não no texto — foi exatamente ` +
          `o caso da hipernatremia, que trazia goal = max(Na − 8, 145) e nunca dizia o porquê.`
        );
      } else ok++;
    }
    // E o teto continua implementado, não só escrito.
    if (!/Math\.max\(current - 8, 145\)/.test(src)) {
      falhas.push("o teto de 8 mEq/24 h saiu da meta automática da hipernatremia — o texto ficaria sem lastro no cálculo.");
    } else ok++;
  }
}

// ── C. Os dois sais de cálcio, com o fator na mesma linha ───────────────────
{
  const hipo = bloco("hypocalcemia");
  if (!hipo) {
    falhas.push("bloco da hipocalcemia não encontrado.");
  } else {
    if (!/gluconato de cálcio 10%/i.test(hipo)) {
      falhas.push("hipocalcemia: perdeu o gluconato de cálcio.");
    } else ok++;
    if (!/CLORETO de cálcio|cloreto de cálcio/i.test(hipo)) {
      falhas.push(
        "hipocalcemia: o CLORETO de cálcio sumiu. O app usa cloreto em politrauma, choque e PCR na " +
        "gestante — oferecer só gluconato aqui faz os dois parecerem intercambiáveis, e 1 g de " +
        "cloreto ≈ 3 g de gluconato em cálcio elementar (R-6)."
      );
    } else ok++;
    // O FATOR e o elementar precisam estar escritos, não deduzíveis.
    if (!/1,36 mEq/.test(hipo) || !/0,465 mEq/.test(hipo)) {
      falhas.push("hipocalcemia: o cálcio ELEMENTAR de cada sal (1,36 × 0,465 mEq/mL) não está escrito lado a lado.");
    } else ok++;
    if (!/3×|~3 ×|três vezes/i.test(hipo)) {
      falhas.push("hipocalcemia: o FATOR entre os dois sais não está declarado — é o número que evita a troca 1:1.");
    } else ok++;
    // E a escolha é por contexto, não por disponibilidade.
    if (!/esclerosante/i.test(hipo) || !/PCR|hipercalemia/i.test(hipo)) {
      falhas.push(
        "hipocalcemia: falta a razão CLÍNICA da escolha entre os sais (cloreto na PCR/hipercalemia com " +
        "ECG alterado, mais esclerosante e de preferência central; gluconato em acesso periférico)."
      );
    } else ok++;
  }
}

// A aritmética do cálcio elementar, contra a massa molar.
{
  const glu = (100 * (40.08 / 430.4)) / 20.04;
  const clo = (100 * (40.08 / 147.0)) / 20.04;
  if (Math.abs(glu - 0.465) > 0.001) falhas.push(`gluconato 10%: o cálculo dá ${glu.toFixed(4)} mEq/mL, e o app declara 0,465.`);
  else ok++;
  if (Math.abs(clo / glu - 2.93) > 0.02) falhas.push(`a razão cloreto/gluconato dá ${(clo / glu).toFixed(2)}×, e o app declara ~3×.`);
  else ok++;
}

// ── D. Magnésio: a porta para a pré-eclâmpsia, e a faixa do torsades ───────
//
// As doses aqui são de REPOSIÇÃO. Sulfatação é outro objetivo, com esquema
// próprio (Pritchard/Zuspan), tríade de segurança e antídoto — e vive no módulo
// de Pré-eclâmpsia. Quem abrir "hipomagnesemia" numa gestante precisa da PORTA,
// não das doses repetidas aqui (R-12).
{
  const mg = bloco("hypomagnesemia");
  if (!mg) {
    falhas.push("bloco da hipomagnesemia não encontrado.");
  } else {
    if (!/GESTANTE|gestante/.test(mg) || !/sulfatação/i.test(mg)) {
      falhas.push(
        "hipomagnesemia: falta a porta para a Pré-eclâmpsia. Estas doses são de REPOSIÇÃO e não " +
        "servem para sulfatação — quem abrir esta tela numa gestante com síndrome hipertensiva " +
        "receberia a dose errada por objetivo errado."
      );
    } else ok++;
    // E a porta NÃO pode trazer as doses — seria a segunda cópia (R-12).
    if (/Pritchard[^"]{0,40}\d\s*g|Zuspan[^"]{0,40}\d\s*g/.test(mg)) {
      falhas.push(
        "hipomagnesemia: a porta para a Pré-eclâmpsia trouxe as DOSES do esquema junto. Elas vivem no " +
        "módulo próprio; duplicá-las aqui cria a divergência que a porta existe para evitar (R-12)."
      );
    } else ok++;
    // #4 REVISTO na auditoria da Taquicardia (2026-08-15).
    //
    // A versão anterior exigia "1–2 g" na linha do torsades desta tela, para
    // igualá-la ao módulo de Taquicardia. A igualdade era o DEFEITO: as duas
    // telas diziam a mesma coisa para cenários que a fonte separa por uma ordem
    // de grandeza no tempo de infusão — COM pulso 2 g em 10–20 min, SEM pulso
    // 1–2 g em 1–2 min.
    //
    // A trava agora cobra CONSUMO da fonte única, que é garantia mais forte:
    // uniformidade por construção, e não por literal conferido.
    // ⚠️ A primeira versão desta linha conferia o import em `bruto`, e a
    // mutação passou: trocar o consumo por um literal deixa o import de pé, e
    // a trava dava OK para um texto escrito à mão. Confere no BLOCO da
    // hipomagnesemia — que é onde o consumo tem de estar (R-15: medir o
    // efeito, não a presença do símbolo).
    if (/torsades/i.test(mg) && !/MAGNESIO_TORSADES_COM_PULSO/.test(mg)) {
      falhas.push(
        "hipomagnesemia: a linha do torsades voltou a escrever a dose à mão. Ela consome " +
        "MAGNESIO_TORSADES_COM_PULSO de lib/magnesio-torsades — o paciente desta tela TEM pulso, " +
        "e a carga com pulso é 2 g em 10–20 min, não a do algoritmo de parada."
      );
    } else ok++;
  }
}

// ── E. A estratégia do sódio tem diretriz, não só bula (#6 / D-10) ─────────
{
  const hipo = bloco("hyponatremia");
  if (!hipo) {
    falhas.push("bloco da hiponatremia não encontrado.");
  } else if (!/Spasovski/.test(hipo)) {
    falhas.push(
      "hiponatremia: a estratégia de correção perdeu a diretriz que a sustenta (Spasovski, Intensive " +
      "Care Med 2014). O módulo tem bula para os FÁRMACOS; bula não diz a que velocidade corrigir o " +
      "sódio — ver D-10."
    );
  } else ok++;
}

// ── F. O 3,5 da CAD é escolha declarada, não número solto (#5 / R-14) ──────
{
  const cad = fs.readFileSync(path.join(appDir, "dka-hhs-decision-tree.ts"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  if (!/K⁺ < 3,5: NÃO iniciar insulina/.test(cad)) {
    falhas.push("dka-hhs: o limiar de K⁺ para iniciar insulina mudou — era 3,5, escolha deliberada.");
  } else ok++;
  if (!/3,3 mEq\/L da ADA/.test(cad)) {
    falhas.push(
      "dka-hhs: o 3,5 voltou a ser número solto. Ele DIVERGE do 3,3 da ADA de propósito, e sem a " +
      "declaração o próximo leitor 'corrige' para 3,3 achando que achou divergência (R-14)."
    );
  } else ok++;
}

// ── D-12 · MgSO₄ no torsades: fonte única, e a distinção COM × SEM pulso ───
//
// VERSÃO ANTERIOR: exigia o literal "1–2 g" em toda linha que prescrevesse
// magnésio no torsades, em universo aberto. Ela cumpriu o papel — impediu a
// divergência entre quatro sítios durante toda a Fase 1.
//
// POR QUE MUDOU: a auditoria da Taquicardia abriu a fonte e achou que os quatro
// sítios diziam a MESMA coisa para cenários clinicamente diferentes. Com pulso,
// a carga é 2 g em 10–20 min, e o tempo existe por uma razão — magnésio
// vasodilata e freia o nó AV, e no torsades você está tratando alguém que pode
// já não ter pressão sobrando. Sem pulso é 1–2 g em 1–2 min, porque na parada
// não há pressão a proteger. A trava velha PROIBIA essa correção: exigir
// "1–2 g" em todo lugar tornava impossível escrever a dose certa do lado com
// pulso.
//
// É o caso que o método antecipa: quando uma trava acusa, perguntar se o achado
// pertence à categoria que ela vigia. Aqui não pertencia — a trava vigiava
// uniformidade, e a uniformidade é que estava errada.
//
// A GARANTIA NÃO ENFRAQUECEU, ficou mais forte: em vez de conferir um literal
// em N cópias, proíbe a cópia. Fora da lib-fonte, NENHUMA linha prescreve
// magnésio no torsades — quem precisar da dose importa de lib/magnesio-torsades,
// e aí a uniformidade é por construção.
//
// O literal continua aqui, dentro da lib, como referência de diretriz (R-21
// tipo (a)): se alguém trocar 2 g por 4 g na fonte, esta trava acusa.
{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales/.test(p2)) raiz(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };

  const LIB = "lib/magnesio-torsades.ts";
  // O módulo ES é tradução da lib, não sítio independente: traduzir é
  // obrigatório (varredura-pt), e proibir o literal ali criaria regra
  // impossível de cumprir.
  const ISENTOS_TORSADES = new Set([LIB, "lib/i18n/modules/taquicardia-farmacos.ts"]);

  let copias = 0;
  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (ISENTOS_TORSADES.has(rel)) continue;
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const linha of texto.split("\n")) {
      if (!/torsades/i.test(linha)) continue;
      // A palavra "magnésio" NÃO é exigida: a mutação 4 escreveu
      // «Se torsades: 2 g IV.» e escapou das duas checagens por não a conter.
      // Dose em gramas numa linha de torsades é magnésio — não há outro fármaco
      // ali dosado assim.
      if (!/\d\s*g\b/.test(linha)) continue;
      copias++;
      falhas.push(
        `${rel}: dose de magnésio no torsades escrita à mão — «${linha.trim().slice(0, 100)}». ` +
        `A dose tem dono: ${LIB}. Importe MAGNESIO_TORSADES_COM_PULSO (2 g em 10–20 min) ou ` +
        `MAGNESIO_TORSADES_SEM_PULSO (1–2 g em 1–2 min) conforme o paciente tenha ou não pulso — ` +
        `escrever aqui recria a uniformidade indevida que o D-12 passou a proibir.`
      );
    }
  }
  if (copias === 0) ok++;

  // A lib existe, e os três construtos continuam com os números da fonte.
  const lib = fs.readFileSync(path.join(appDir, LIB), "utf8");
  const CONSTRUTOS = [
    ["COM pulso — carga de 2 g", /MAGNESIO_TORSADES_COM_PULSO[\s\S]{0,200}?2 g IV, infundidos em 10–20 min/],
    ["SEM pulso — 1–2 g em 1–2 min", /MAGNESIO_TORSADES_SEM_PULSO[\s\S]{0,200}?1–2 g IV\/IO em 1–2 min/],
    ["manutenção — 1–4 g/h", /MAGNESIO_TORSADES_MANUTENCAO[\s\S]{0,200}?1–4 g\/h/],
    ["a RAZÃO do limite de velocidade", /hipotensão e bradicardia/],
  ];
  for (const [nome, padrao] of CONSTRUTOS) {
    if (!padrao.test(lib)) {
      falhas.push(
        `${LIB}: o construto "${nome}" mudou ou sumiu. Os números vêm de fonte aberta em sessão ` +
        `(StatPearls NBK459388 e First10EM) — não se troca por memória (R-5). E a razão do limite ` +
        `de velocidade não é ornamento: sem ela, "bolus lento" é lido como "empurre devagar".`
      );
    } else ok++;
  }
}

// ── D-12 · Fentanil em infusão: 25–100 mcg/h, universo aberto ──────────────
//
// Unificado entre ISR e Ventilação e SEM TRAVA ALGUMA até aqui. O piso importa:
// a faixa começava sem limite inferior, e infusão sem piso vira analgesia
// insuficiente no paciente que não consegue pedir.
{
  const raiz2 = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales/.test(p2)) raiz2(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };

  let infusoes = 0;
  for (const arquivo of raiz2(appDir)) {
    const rel = path.relative(appDir, arquivo);
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    for (const linha of texto.split("\n")) {
      // Só INFUSÃO contínua (mcg/h). Bólus em mcg/kg e a apresentação em
      // mcg/mL são outra coisa e não entram.
      if (!/fentanil/i.test(linha) || !/mcg\/h/.test(linha)) continue;
      infusoes++;
      if (!/25[–-]100\s*mcg\/h/.test(linha)) {
        falhas.push(
          `${rel}: infusão de fentanil fora de 25–100 mcg/h — «${linha.trim().slice(0, 100)}». ` +
          `A faixa é uma só no app, com piso declarado (D-12).`
        );
      }
    }
  }
  if (infusoes < 2) {
    falhas.push(`a varredura do fentanil achou só ${infusoes} linhas de infusão — universo pequeno demais para valer como trava.`);
  } else ok++;
}

console.log("\nCorreções eletrolíticas — constantes, paridade e os dois sais de cálcio\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — constantes contra massa molar, hipo e hiper com o mesmo cuidado, cálcio com o fator escrito\n`);
}
process.exit(falhas.length ? 1 : 0);
