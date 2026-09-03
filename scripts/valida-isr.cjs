/**
 *
 * PROMETE: que o derive do ISR, EXECUTADO, devolva as doses da publicação; que
 *   nenhum multiplicador esteja escrito à mão nele; que o import de MG_POR_KG não
 *   seja decorativo (provado por perturbação da fonte); e que o formatador
 *   mgPorKg() nunca seja interpolado dentro de frase traduzível.
 * NÃO PROMETE: que a prosa esteja unificada. As linhas que citam dose dentro de
 *   frase que o usuário lê CONTINUAM duplicadas e vigiadas por trava — contrato
 *   vigiado, não fonte única (R-25). O universo do contrato ENCOLHEU com a D-14,
 *   não fechou: o cálculo virou fonte real, a prosa não pode virar.
 * UNIVERSO: ISR e Sedoanalgesia para as doses; árvore INTEIRA para o teto da
 *   succinilcolina e para o veto do formatador.

 * ISR: a dose do instável tem UMA fonte, e a via acordada é caminho, não menção.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ───────────────────────────────────
 *
 * 1. A Sedoanalgesia dizia "ISR (paciente instável): 1,5–2 mg/kg" de cetamina —
 *    a faixa CHEIA de indução, rotulada como a do instável. O módulo de ISR,
 *    para o MESMO paciente, manda 1 mg/kg (0,5 no choque grave). Um mandava
 *    reduzir, o outro mandava dose plena, a um clique de distância.
 *
 * 2. O nó de via aérea difícil dizia "considerar intubação acordada" e seguia
 *    DIRETO para a indução: quem escolhesse a técnica acordada não tinha para
 *    onde ir. Primeiro achado da auditoria que não é número errado — é uma VIA
 *    CLÍNICA que o app não permitia percorrer. Também não existia a saída
 *    "não intubar agora".
 *
 * ── O QUE ESTE SCRIPT COBRA ──────────────────────────────────────────────────
 *
 *   A. Os multiplicadores do derive da árvore de ISR batem com lib/doses-isr.ts.
 *   B. A Sedoanalgesia ensina a REDUÇÃO no instável — nunca a faixa plena
 *      rotulada como dose do instável.
 *   C. A via acordada e o deferimento são NÓS ALCANÇÁVEIS, oferecidos como
 *      opção na decisão de estratégia — não menções em texto.
 *   D. As frases literais de doses-isr.ts repetem os números de DOSES_ISR
 *      (são literais para a tradução enxergar; o vínculo é esta trava).
 *
 * Este script FALHA O BUILD. Dose de indução errada no chocado é PCR
 * peri-intubação.
 */

const fs = require("node:fs");
const { lerFonte } = require("./lib/fonte.cjs");
const path = require("node:path");
const { consomeConstante } = require("./lib/consumo.cjs");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const arvore = lerFonte(path.join(appDir, "rsi-decision-tree.ts"));
const sedacao = lerFonte(path.join(appDir, "sedation-engine.ts"));

// ── O UNIVERSO DO CONTRATO (R-25) ───────────────────────────────────────────
//
// lib/doses-isr.ts é uma FONTE ÚNICA APARENTE: ninguém a importa. O que mantém
// os números alinhados é ESTA trava, comparando texto — um contrato vigiado, não
// uma fonte de verdade. Contrato só cobre o universo que a trava enxerga, e a
// Sepse estava fora dele: prescrevia "Succinilcolina 1,5 mg/kg" sem o teto de
// 200 mg que a fonte declara.
//
// Enquanto a D-14 não resolver a estrutura, o universo cresce por aqui — e todo
// arquivo que prescrever succinilcolina por quilo tem de trazer o teto.
{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p2)) raiz(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };

  let vistos = 0;
  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/doses-isr.ts") continue;
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    for (const linha of texto.split("\n")) {
      if (/^\s*\/\//.test(linha)) continue;
      if (!/succinilcolina/i.test(linha)) continue;
      // Só linhas que PRESCREVEM por quilo; citar o fármaco não obriga a nada.
      if (!/succinilcolina[^"]{0,40}?\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*mg\/kg/i.test(linha)) continue;
      // O fármaco citado como REFERÊNCIA não é o dono da dose: "BNM
      // adespolarizante — alternativa à succinilcolina na ISR (1,2 mg/kg)"
      // descreve o ROCURÔNIO. Sem esta guarda a trava acusa inocente, que é o
      // caminho mais curto para alguém desligá-la (R-22).
      if (/(alternativa à|contraindicação à|em vez de|no lugar de|substitui)\s*succinilcolina/i.test(linha)) continue;
      vistos++;
      if (!/200\s*mg/.test(linha)) {
        falhas.push(
          `${rel}: prescreve succinilcolina por quilo sem o teto de 200 mg — «${linha.trim().slice(0, 95)}». ` +
          `lib/doses-isr.ts declara "1–1,5 mg/kg (2 mg/kg em obeso; máx 200 mg)" e o derive calcula Math.min(1,5 × peso, 200).`
        );
      }
    }
  }
  // ⚠️ O PISO É 1, E ISSO É CONSEQUÊNCIA DA AUDITORIA, NÃO AFROUXAMENTO.
  //
  // Era 2 quando existiam dois sítios prescrevendo succinilcolina por quilo: o
  // ISR e o `sepsis-engine`. O da Sepse foi o achado R-25 da Fase 1 (prescrevia
  // "1,5 mg/kg" SEM o teto de 200 mg, com lib/doses-isr.ts já declarando o
  // teto ao lado) — e aquele arquivo era órfão de render, deletado na D-22.
  //
  // A Sepse hoje DELEGA a via aérea ao ISR (D-24, R-33) em vez de prescrever
  // por conta. Um sítio é o número CERTO: é o que a fonte única quer. Exigir
  // dois seria exigir a duplicação que a auditoria removeu.
  if (vistos < 1) {
    falhas.push(`a varredura do teto da succinilcolina achou ${vistos} prescrições por quilo — a varredura cegou ou o ISR parou de prescrever.`);
  } else ok++;
}
const doses = lerFonte(path.join(appDir, "lib/doses-isr.ts"));

// ── A. O DERIVE, EXECUTADO, CONTRA A REFERÊNCIA EXTERNA ────────────────────
//
// ⚠️ POR QUE ESTE BLOCO FOI REESCRITO — E A ARMADILHA QUE ELE EVITA.
//
// Antes da D-14, o derive escrevia os multiplicadores à mão e esta trava
// comparava o literal do derive contra o texto de lib/doses-isr.ts. Fazia
// sentido: eram DUAS fontes e a trava conferia se concordavam.
//
// Depois que o derive passou a IMPORTAR a fonte, essa comparação vira
// TAUTOLOGIA — e não uma tautologia óbvia, do tipo que se vê lendo. Foi
// demonstrada por mutação antes de ser corrigida: com `etomidato: 0.3` virando
// `3`, o app passa a calcular 210 mg num paciente de 70 kg, e a versão ingênua
// da trava (conferir se o derive usa `MG_POR_KG.etomidato` e se a fonte declara
// `etomidato`) segue VERDE. Os dois lados se moveram juntos.
//
// A saída é a mesma do R-21: o valor de referência tem de ser EXTERNO. Os
// números abaixo são da literatura de ISR — é por isso que estão escritos aqui,
// e é o que impede a conferência de girar em falso.
{
  const { execFileSync } = require("node:child_process");
  const os = require("node:os");

  // Referência EXTERNA — Walls, Manual of Emergency Airway Management, 6ª ed.
  // Não vem do app: se viesse, voltaríamos à tautologia.
  const PUBLICADO = [
    ["etom", 0.3, "etomidato"],
    ["ketaInd", 1.5, "cetamina — indução no estável"],
    ["ketaShock", 1, "cetamina — instável"],
    ["ketaAsma", 2, "cetamina — asma"],
    ["propInd", 2, "propofol — estável"],
    ["propLow", 1, "propofol — dose reduzida"],
    ["succLow", 1, "succinilcolina — piso"],
    ["succHigh", 1.5, "succinilcolina — teto por quilo"],
    ["rocu", 1.2, "rocurônio"],
    ["sugam", 16, "sugamadex"],
  ];
  const PESO = 70;

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "isr-derive-"));
  let compilou = true;
  try {
    execFileSync(
      "npx",
      ["tsc", "--ignoreConfig", "--module", "node16", "--target", "es2020", "--resolveJsonModule",
       "--esModuleInterop", "--moduleResolution", "node16", "--skipLibCheck", "--outDir", tmp,
       path.join(appDir, "rsi-decision-tree.ts")],
      { stdio: "pipe", cwd: appDir }
    );
  } catch (e) {
    compilou = false;
    falhas.push("rsi-decision-tree.ts não compila — a conferência do derive não rodou.");
  }

  if (compilou) {
    const modArvore = path.join(tmp, "rsi-decision-tree.js");
    const arvoreCompilada = require(modArvore);
    const def = arvoreCompilada.rsiDecisionTree || arvoreCompilada.default || arvoreCompilada;
    const derive = def.derive || (def.rsiDecisionTree && def.rsiDecisionTree.derive);

    if (typeof derive !== "function") {
      falhas.push("não consegui obter o derive do ISR — a conferência não rodou.");
    } else {
      const saida = derive({ peso: String(PESO) });
      for (const [campo, mult, nome] of PUBLICADO) {
        const esperado = campo === "sugam"
          ? String(Math.round(mult * PESO))
          : (Math.round(mult * PESO * 10) / 10).toString().replace(".", ",");
        const obtido = String(saida[campo]);
        // A succinilcolina tem teto: em 70 kg ele não vincula, e por isso o
        // valor puro vale. O teto é conferido no bloco próprio, adiante.
        if (obtido !== esperado) {
          falhas.push(
            `derive do ISR · ${nome}: com ${PESO} kg devolve ${obtido}, e ${mult} mg/kg dá ${esperado}. ` +
            `A referência é a publicação, não o app.`
          );
        } else ok++;
      }

      // ── O IMPORT NÃO PODE SER DECORATIVO — CONFERIDO POR EFEITO ───────────
      //
      // Importar e não usar é exatamente o defeito que o R-25 documentou. Testar
      // por PRESENÇA do import não prova nada: prova-se PERTURBANDO a fonte e
      // exigindo que a saída do derive MUDE. Se ela não muda, o número está
      // escrito à mão em algum lugar e a fonte única é decorativa.
      const compiladoFonte = path.join(tmp, "lib", "doses-isr.js");
      if (!fs.existsSync(compiladoFonte)) {
        falhas.push("lib/doses-isr.js não foi compilado junto — o teste de perturbação não rodou.");
      } else {
        const original = fs.readFileSync(compiladoFonte, "utf8");
        const perturbado = original.replace(/etomidato:\s*0\.3/, "etomidato: 9.9");
        if (perturbado === original) {
          falhas.push("não consegui perturbar o etomidato na fonte compilada — o teste de perturbação não rodou.");
        } else {
          fs.writeFileSync(compiladoFonte, perturbado);
          for (const k of Object.keys(require.cache)) delete require.cache[k];
          const reCarregado = require(modArvore);
          const def2 = reCarregado.rsiDecisionTree || reCarregado.default || reCarregado;
          const derive2 = def2.derive;
          const saida2 = derive2({ peso: String(PESO) });
          const esperadoPerturbado = (Math.round(9.9 * PESO * 10) / 10).toString().replace(".", ",");
          if (String(saida2.etom) !== esperadoPerturbado) {
            falhas.push(
              `o derive NÃO acompanhou a fonte: perturbando MG_POR_KG.etomidato para 9,9 a saída ficou ` +
              `${saida2.etom} em vez de ${esperadoPerturbado}. O import existe mas o número está escrito à mão.`
            );
          } else ok++;
          fs.writeFileSync(compiladoFonte, original);
        }
      }
    }
  }
}

// ── O UNIVERSO DO CONTRATO (R-25) ───────────────────────────────────────────
//
// lib/doses-isr.ts é uma FONTE ÚNICA APARENTE: ninguém a importa. O que mantém
// os números alinhados é ESTA trava, comparando texto — um contrato vigiado, não
// uma fonte de verdade. Contrato só cobre o universo que a trava enxerga, e a
// Sepse estava fora dele: prescrevia "Succinilcolina 1,5 mg/kg" sem o teto de
// 200 mg que a fonte declara.
//
// Enquanto a D-14 não resolver a estrutura, o universo cresce por aqui — e todo
// arquivo que prescrever succinilcolina por quilo tem de trazer o teto.
{
  const raiz = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p2)) raiz(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };

  let vistos = 0;
  for (const arquivo of raiz(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/doses-isr.ts") continue;
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    for (const linha of texto.split("\n")) {
      if (/^\s*\/\//.test(linha)) continue;
      if (!/succinilcolina/i.test(linha)) continue;
      // Só linhas que PRESCREVEM por quilo; citar o fármaco não obriga a nada.
      if (!/succinilcolina[^"]{0,40}?\d+(?:[.,]\d+)?(?:\s*[–-]\s*\d+(?:[.,]\d+)?)?\s*mg\/kg/i.test(linha)) continue;
      // O fármaco citado como REFERÊNCIA não é o dono da dose: "BNM
      // adespolarizante — alternativa à succinilcolina na ISR (1,2 mg/kg)"
      // descreve o ROCURÔNIO. Sem esta guarda a trava acusa inocente, que é o
      // caminho mais curto para alguém desligá-la (R-22).
      if (/(alternativa à|contraindicação à|em vez de|no lugar de|substitui)\s*succinilcolina/i.test(linha)) continue;
      vistos++;
      if (!/200\s*mg/.test(linha)) {
        falhas.push(
          `${rel}: prescreve succinilcolina por quilo sem o teto de 200 mg — «${linha.trim().slice(0, 95)}». ` +
          `lib/doses-isr.ts declara "1–1,5 mg/kg (2 mg/kg em obeso; máx 200 mg)" e o derive calcula Math.min(1,5 × peso, 200).`
        );
      }
    }
  }
  // ⚠️ O PISO É 1, E ISSO É CONSEQUÊNCIA DA AUDITORIA, NÃO AFROUXAMENTO.
  //
  // Era 2 quando existiam dois sítios prescrevendo succinilcolina por quilo: o
  // ISR e o `sepsis-engine`. O da Sepse foi o achado R-25 da Fase 1 (prescrevia
  // "1,5 mg/kg" SEM o teto de 200 mg, com lib/doses-isr.ts já declarando o
  // teto ao lado) — e aquele arquivo era órfão de render, deletado na D-22.
  //
  // A Sepse hoje DELEGA a via aérea ao ISR (D-24, R-33) em vez de prescrever
  // por conta. Um sítio é o número CERTO: é o que a fonte única quer. Exigir
  // dois seria exigir a duplicação que a auditoria removeu.
  if (vistos < 1) {
    falhas.push(`a varredura do teto da succinilcolina achou ${vistos} prescrições por quilo — a varredura cegou ou o ISR parou de prescrever.`);
  } else ok++;
}

// ── A1b. O VETO DO FORMATADOR — vigiado, não só declarado ──────────────────
//
// `mgPorKg()` existe para produzir valor de token ("0,3 mg/kg"), que não é texto
// traduzível. O mau uso é interpolá-lo DENTRO de frase que o usuário lê:
//
//     `cetamina ${mgPorKg(1.5)} na indução`   ← template com ${} sai da
//                                                varredura de tradução, e o
//                                                usuário em espanhol vê português
//
// ⚠️ ESTA TRAVA EXISTE PORQUE O test:i18n NÃO PEGA ISSO. A varredura pula
// template literal com ${} POR DESENHO — é justamente essa a armadilha. Uma
// mutação bem formada passaria calada por lá; a que testei só ficou vermelha
// porque quebrou o parsing do arquivo, o que é acidente e não proteção.
{
  const raizConteudo = (d, saida = []) => {
    for (const f of fs.readdirSync(d, { withFileTypes: true })) {
      const p2 = path.join(d, f.name);
      if (f.isDirectory()) {
        if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p2)) raizConteudo(p2, saida);
      } else if (/\.tsx?$/.test(f.name)) saida.push(p2);
    }
    return saida;
  };
  let vistosVeto = 0;
  for (const arquivo of raizConteudo(appDir)) {
    const rel = path.relative(appDir, arquivo);
    if (rel === "lib/doses-isr.ts") continue; // o dono documenta o veto no comentário
    const texto = fs.readFileSync(arquivo, "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
    vistosVeto++;
    texto.split("\n").forEach((linha, i) => {
      if (/^\s*\/\//.test(linha)) return;
      if (/\$\{[^}]*mgPorKg\s*\(/.test(linha)) {
        falhas.push(
          `${rel}:${i + 1} — mgPorKg() interpolado dentro de template literal: ` +
          `«${linha.trim().slice(0, 90)}». A frase sai da varredura de tradução e o ` +
          `usuário em espanhol vê português. Escreva a frase inteira como literal.`
        );
      }
    });
  }
  if (vistosVeto < 40) {
    falhas.push(`a varredura do veto leu só ${vistosVeto} arquivos — universo pequeno demais para valer como trava.`);
  } else ok++;
}

// ── A2. O CHOQUE GRAVE — o número que NÃO tem token no derive ──────────────
//
// 0,5 mg/kg não é calculado: vive no texto, porque a tela oferece a redução como
// escolha declarada e não como valor pronto. Continua conferido contra a camada
// numérica e contra o que a árvore ensina.
if (!/choqueGrave: MG_POR_KG\.cetamina\.choqueGrave|choqueGrave: 0\.5/.test(doses)) {
  falhas.push("lib/doses-isr.ts perdeu a dose do choque grave (0,5 mg/kg).");
} else ok++;
if (!/0,5 mg\/kg (em|no) choque grave/.test(arvore)) {
  falhas.push("rsi-decision-tree não ensina a redução para 0,5 mg/kg no choque grave.");
} else ok++;

// ── A3. NENHUM MULTIPLICADOR ESCRITO À MÃO NO DERIVE ───────────────────────
//
// Complementa o teste de perturbação: aquele prova que o etomidato acompanha a
// fonte; este prova que NENHUM outro campo voltou a ser literal. Sem ele, alguém
// pode hard-codar a cetamina e o teste de perturbação — que perturba só o
// etomidato — não veria.
{
  const bloco = arvore.slice(arvore.indexOf("function deriveRsi"), arvore.indexOf("function deriveRsi") + 3000);
  const literais = [...bloco.matchAll(/out\.\w+ = [\w.]+\((?:Math\.(?:min|round)\()?(\d+(?:\.\d+)?) \* peso/g)];
  if (literais.length) {
    falhas.push(
      `o derive do ISR voltou a escrever ${literais.length} multiplicador(es) à mão ` +
      `(${literais.map((m) => m[1]).join(", ")}). Os números vêm de MG_POR_KG (D-14).`
    );
  } else ok++;
}

// ── B. A Sedoanalgesia ensina a redução, não a faixa plena ──────────────────
// Comentários saem antes da conferência: o comentário que documenta o defeito
// antigo CITA a frase proibida, e a regra acusava a própria narração do
// conserto. Regra de conteúdo lê conteúdo, não documentação.
const sedacaoSemComentarios = sedacao.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const cetamina = sedacaoSemComentarios.match(/key: "cetamina"[\s\S]*?strategy:/);
if (!cetamina) {
  falhas.push("sedation-engine: bloco da cetamina não encontrado — a leitura cegou.");
} else {
  const bloco = cetamina[0];
  if (!/1 mg\/kg/.test(bloco) || !/0,5 mg\/kg/.test(bloco)) {
    falhas.push(
      "sedation-engine · cetamina: a nota de ISR não traz a REDUÇÃO do instável (1 mg/kg; 0,5 no choque grave) — " +
      "era exatamente a divergência original: dose plena rotulada como dose do instável."
    );
  } else ok++;
  if (/inst[áa]vel[^"]{0,20}1,5\s*[–-]\s*2\s*mg\/kg/i.test(bloco)) {
    falhas.push(
      "sedation-engine · cetamina: a faixa plena (1,5–2 mg/kg) voltou a ser rotulada como dose do INSTÁVEL."
    );
  } else ok++;
  if (!/MANTER a dose do bloqueador|manter a do bloqueador/i.test(bloco)) {
    falhas.push("sedation-engine · cetamina: perdeu a regra 'reduzir o indutor e MANTER o bloqueador'.");
  } else ok++;
}

// ── C. Via acordada e deferimento: caminhos, não menções ────────────────────
if (!/via_acordada: \{/.test(arvore)) {
  falhas.push("rsi-decision-tree: o nó via_acordada sumiu — a via acordada voltou a ser menção sem caminho.");
} else ok++;
if (!/adiar_iot: \{/.test(arvore)) {
  falhas.push("rsi-decision-tree: o nó adiar_iot sumiu — a avaliação de via aérea voltou a só poder terminar em intubação.");
} else ok++;
const estrategia = arvore.match(/via_dificil_estrategia: \{[\s\S]*?\n    \},/);
if (!estrategia) {
  falhas.push("rsi-decision-tree: a decisão via_dificil_estrategia sumiu — o plano de via difícil voltou a fluir direto para a indução.");
} else {
  // Após o #5, a opção de ISR leva à PRÉ-OXIGENAÇÃO (a avaliação de via
  // difícil passou para antes dela, como no 7 P's) — e dali para a otimização.
  for (const destino of ["via_acordada", "adiar_iot", "preoxigenacao"]) {
    if (!new RegExp(`next: "${destino}"`).test(estrategia[0])) {
      falhas.push(`via_dificil_estrategia perdeu a opção que leva a ${destino}.`);
    } else ok++;
  }
}
// O nó acordado não pode mandar bloquear.
const acordada = arvore.match(/via_acordada: \{[\s\S]*?\n    \},/);
if (acordada && !/N[ÃA]O usar bloqueador/i.test(acordada[0])) {
  falhas.push("via_acordada não proíbe o bloqueador — a técnica inteira depende de manter a ventilação espontânea.");
} else if (acordada) ok++;

// ── D. Frases literais × números da fonte ────────────────────────────────────
const PARES_LITERAIS = [
  ["ISR_AJUSTE_NO_INSTAVEL", ["1 mg/kg", "0,5 mg/kg", "0,3 mg/kg"]],
  ["ANAFILAXIA_BLOQUEADOR", ["45–70 min", "1,2 mg/kg"]],
  ["ANAFILAXIA_BLOQUEADOR_ROCURONIO", ["16 mg/kg", "45–70 min"]],
  ["ANAFILAXIA_GATILHO_BLOQUEADOR", ["44%", "24%"]],
];
for (const [nome, numeros] of PARES_LITERAIS) {
  const bloco = doses.match(new RegExp(`export const ${nome} =[\\s\\S]*?";`));
  if (!bloco) {
    falhas.push(`lib/doses-isr.ts não exporta ${nome}.`);
    continue;
  }
  for (const n of numeros) {
    if (!bloco[0].includes(n)) {
      falhas.push(`${nome} perdeu "${n}" — a frase literal descolou dos números da fonte.`);
    } else ok++;
  }
}

// ── E. BLOQUEADOR NA ANAFILAXIA: regra única, consumida pelos dois módulos ──
//
// A Anafilaxia mandava "EVITAR succinilcolina em angioedema extenso (usar
// rocurônio)" — agente LONGO porque a via é difícil, invertendo a lógica do
// risco: em possível CICO o rocurônio compromete 45–70 min. A regra corrigida
// vive em lib/doses-isr.ts e os DOIS módulos a consomem — regra clínica em
// dois lugares diverge (R-12).
const anafilaxia = lerFonte(path.join(appDir, "anaphylaxis-decision-tree.ts"));
// Comentários E IMPORTS saem antes da conferência de consumo. A linha de
// import contém o nome da constante — um módulo que importa e não usa
// satisfaria a regra sem exibir nada. Foi exatamente a fuga da mutação M2:
// removidas as linhas de uso, o import sozinho mantinha a trava verde.
const limpar = (t) => t
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "")
  .replace(/^import[\s\S]*?from ".*";$/gm, "");
const anafilaxiaSemComentarios = limpar(anafilaxia);
const arvoreSemComentarios = limpar(arvore);

for (const [rel, texto, consts] of [
  ["anaphylaxis-decision-tree.ts", anafilaxiaSemComentarios,
   ["ANAFILAXIA_BLOQUEADOR", "ANAFILAXIA_BLOQUEADOR_ROCURONIO", "ANAFILAXIA_GATILHO_BLOQUEADOR", "ANAFILAXIA_BLOQUEADOR_LASTRO"]],
  ["rsi-decision-tree.ts", arvoreSemComentarios,
   ["ANAFILAXIA_BLOQUEADOR", "ANAFILAXIA_GATILHO_BLOQUEADOR"]],
]) {
  for (const c of consts) {
    // ⚠️ Via helper: import não é consumo, comentário não é consumo. A versão
    // anterior testava o nome no texto do arquivo e um `import` órfão bastava.
    if (!consomeConstante({ arquivo: path.join(appDir, rel), constante: c }).consome) {
      falhas.push(`${rel} deixou de consumir ${c} — a regra do bloqueador na anafilaxia voltou a existir num lugar só, ou foi reescrita à mão.`);
    } else ok++;
  }
}

// O texto INVERTIDO não pode voltar: evitar SCh e preferir rocurônio no
// angioedema, sem a condição de contraindicação.
if (/EVITAR succinilcolina[^"]{0,80}(usar|preferir) rocur[ôo]nio/i.test(anafilaxiaSemComentarios)) {
  falhas.push(
    "anaphylaxis-decision-tree voltou a mandar evitar succinilcolina e usar rocurônio no angioedema — " +
    "é a lógica invertida do risco: em possível CICO, o agente longo compromete 45–70 min."
  );
} else ok++;

// ── G. A avaliação de via difícil vem ANTES da pré-oxigenação (#5) ──────────
// A ordem antiga gastava 3–5 min de MNR antes de saber a estratégia — inclusive
// antes da decisão de técnica acordada. No 7 P's a avaliação é Preparação.
{
  const dados = arvoreSemComentarios.match(/dados: \{[\s\S]*?next: "(\w+)"/);
  if (!dados || dados[1] !== "via_dificil") {
    falhas.push(`o passo de dados leva a "${dados ? dados[1] : "?"}" — a avaliação de via difícil voltou para depois da pré-oxigenação.`);
  } else ok++;
}

// ── F. Inibição adquirida da colinesterase na lista do ISR (#3) ─────────────
// A lista trazia só a deficiência GENÉTICA (pseudocolinesterase atípica); a
// inibição por organofosforado vivia apenas no módulo de intoxicações.
if (!/organofosforado/i.test(arvoreSemComentarios)) {
  falhas.push("rsi-decision-tree perdeu a contraindicação por organofosforado (inibição adquirida da colinesterase).");
} else ok++;

console.log("\nISR — dose do instável com fonte única, via acordada como caminho\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — doses casadas, redução ensinada, via acordada e deferimento alcançáveis\n`);
}
process.exit(falhas.length ? 1 : 0);
