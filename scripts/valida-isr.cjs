/**
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
const path = require("node:path");
const appDir = path.resolve(__dirname, "..");

const falhas = [];
let ok = 0;

const arvore = fs.readFileSync(path.join(appDir, "rsi-decision-tree.ts"), "utf8");
const sedacao = fs.readFileSync(path.join(appDir, "sedation-engine.ts"), "utf8");

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
  if (vistos < 2) {
    falhas.push(`a varredura do teto da succinilcolina achou só ${vistos} prescrições por quilo — universo pequeno demais.`);
  } else ok++;
}
const doses = fs.readFileSync(path.join(appDir, "lib/doses-isr.ts"), "utf8");

// ── A. Multiplicadores do derive × fonte única ──────────────────────────────
// O derive calcula em número (0.3 * peso); a fonte declara em texto ("0,3
// mg/kg"). A trava casa os dois — mudar um sem o outro quebra o build.
const MULTIPLICADORES = [
  ["etom", "0.3", /todos: "0,3 mg\/kg"/, "etomidato 0,3 mg/kg"],
  ["ketaInd", "1.5", /estavel: "1,5 mg\/kg"/, "cetamina estável 1,5 mg/kg"],
  ["ketaShock", "1", /instavel: "1 mg\/kg"/, "cetamina instável 1 mg/kg"],
  ["ketaAsma", "2", /asma: "2 mg\/kg"/, "cetamina asma 2 mg/kg"],
  ["rocu", "1.2", /rocuronio: "1,2 mg\/kg"/, "rocurônio 1,2 mg/kg"],
  ["sugam", "16", /sugamadex: "16 mg\/kg"/, "sugamadex 16 mg/kg"],
];
for (const [campo, mult, reFonte, rotulo] of MULTIPLICADORES) {
  const noDerive = new RegExp(`out\\.${campo} = [\\w.]+\\(${mult.replace(".", "\\.")} \\* peso`).test(arvore) ||
    new RegExp(`out\\.${campo} = [\\w.]+\\(Math\\.min\\(${mult.replace(".", "\\.")} \\* peso`).test(arvore) ||
    new RegExp(`out\\.${campo} = Math\\.round\\(${mult.replace(".", "\\.")} \\* peso`).test(arvore);
  if (!noDerive) {
    falhas.push(`rsi-decision-tree: o derive não calcula ${rotulo} com o multiplicador ${mult} — divergiu da fonte única.`);
  } else ok++;
  if (!reFonte.test(doses)) {
    falhas.push(`lib/doses-isr.ts perdeu ${rotulo} — a fonte única mudou sem esta trava acompanhar.`);
  } else ok++;
}
// O choque grave (0,5) não tem token no derive — vive no texto. Cobra nos dois.
if (!/choqueGrave: "0,5 mg\/kg"/.test(doses)) {
  falhas.push("lib/doses-isr.ts perdeu a dose do choque grave (0,5 mg/kg).");
} else ok++;
if (!/0,5 mg\/kg (em|no) choque grave/.test(arvore)) {
  falhas.push("rsi-decision-tree não ensina a redução para 0,5 mg/kg no choque grave.");
} else ok++;

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
const anafilaxia = fs.readFileSync(path.join(appDir, "anaphylaxis-decision-tree.ts"), "utf8");
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
    if (!new RegExp(`\\b${c}\\b`).test(texto)) {
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
