/**
 * Ventilação: peso predito tem UMA fonte, e ela recusa o que não sabe.
 *
 * ── OS DEFEITOS QUE ORIGINARAM ESTE SCRIPT ───────────────────────────────────
 *
 * 1. DUAS implementações de PBW, discordando onde ninguém olha — no sexo
 *    AUSENTE. A árvore assumia HOMEM (`sexo === "feminino" ? 45,5 : 50`); o
 *    motor assumia MULHER (`/^m/i` falha em string vazia). Mesmo paciente,
 *    mesmo app: a 175 cm, PBW 70,6 × 66,1 kg → Vt 423 × 396 mL. As duas
 *    devolviam um número, nenhuma avisava.
 *
 * 2. O `/^m/i` do motor classificava **"Mulher" como masculino**, por testar a
 *    INICIAL. Não era hipótese: o campo é `TextInput` de valor livre, com os
 *    presets como botões de conveniência abaixo.
 *
 * 3. O portão do plano ventilatório era `!pbw || !scenario`. Com sexo em branco
 *    o PBW saía preenchido (pelo default feminino), então o app montava modo,
 *    Vt, FR, PEEP e FiO₂ enquanto declarava, na mesma tela, que faltava o sexo.
 *
 * ── POR QUE A TRAVA ÓBVIA PASSARIA VERDE ─────────────────────────────────────
 *
 * Comparar as duas fórmulas com sexo INFORMADO não pega nada: elas sempre
 * concordaram aí. A divergência morava só na ausência. Por isso o caso
 * "sexo ausente" é verificado EXPLICITAMENTE, e o esperado não é concordância
 * de número — é RECUSA nos dois lados.
 *
 * Este script FALHA O BUILD. Vt errado é dose errada.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-ventilacao-"));

// R-2: morrer não é veredicto.
try {
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--resolveJsonModule",
    "--esModuleInterop", "--moduleResolution", "node", "--skipLibCheck",
    "--outDir", tempDir,
    path.join(appDir, "ventilation-decision-tree.ts"),
  ], { cwd: appDir, stdio: ["ignore", "ignore", "inherit"] });
} catch {
  console.error("\n❌ ventilation-decision-tree.ts não compila — a conferência do PBW não rodou.\n");
  fs.rmSync(tempDir, { recursive: true, force: true });
  process.exit(1);
}

const { predictedBodyWeight, normalizarSexo } = require(path.join(tempDir, "ventilation-decision-tree.js"));

const falhas = [];
let ok = 0;

/** ARDSNet, NEJM 2000;342:1301-8 — a referência, escrita aqui à mão. */
function pbwEsperado(sexo, alturaCm) {
  const base = sexo === "feminino" ? 45.5 : 50;
  return base + 0.91 * (alturaCm - 152.4);
}

// ── 1. A fórmula, contra a publicação ──────────────────────────────────────
for (const [sexo, altura] of [
  ["masculino", 152.4], ["masculino", 175], ["masculino", 190],
  ["feminino", 152.4], ["feminino", 160], ["feminino", 175],
]) {
  const obtido = predictedBodyWeight(altura, sexo);
  const esperado = pbwEsperado(sexo, altura);
  if (obtido == null || Math.abs(obtido - esperado) > 1e-9) {
    falhas.push(`PBW ${sexo} ${altura} cm: obtido ${obtido}, ARDSNet dá ${esperado.toFixed(2)}`);
  } else ok++;
}

// Na altura de referência (152,4 cm) o incremento zera e sobra só a base.
if (predictedBodyWeight(152.4, "masculino") !== 50) falhas.push("PBW masculino a 152,4 cm deveria ser exatamente 50 kg");
else ok++;
if (predictedBodyWeight(152.4, "feminino") !== 45.5) falhas.push("PBW feminino a 152,4 cm deveria ser exatamente 45,5 kg");
else ok++;

// ── 2. O CASO CENTRAL: sexo que não dá para afirmar → RECUSA ───────────────
//
// Este bloco é a razão de o script existir. Uma trava que só comparasse sexo
// informado passaria verde sobre o defeito inteiro.
const INDETERMINADOS = [
  ["ausente", undefined],
  ["nulo", null],
  ["vazio", ""],
  ["só espaços", "   "],
  ["lixo", "xyz"],
  ["inicial solta", "masc?"],
];
for (const [rotulo, valor] of INDETERMINADOS) {
  if (normalizarSexo(valor) !== null) {
    falhas.push(`normalizarSexo(${rotulo}) devia recusar e devolveu "${normalizarSexo(valor)}"`);
  } else ok++;
  if (predictedBodyWeight(175, valor) !== null) {
    falhas.push(
      `predictedBodyWeight com sexo ${rotulo} devolveu ${predictedBodyWeight(175, valor)} — ` +
      `sexo desconhecido não é homem nem mulher por omissão. Foi assim que as duas ` +
      `implementações antigas divergiram: uma chutava homem, a outra mulher.`
    );
  } else ok++;
}

// ── 3. "Mulher" NUNCA é masculino ──────────────────────────────────────────
const MULHER = ["mulher", "Mulher", "MULHER", "feminino", "Feminino", " feminino "];
for (const v of MULHER) {
  if (normalizarSexo(v) !== "feminino") {
    falhas.push(`normalizarSexo("${v}") devolveu "${normalizarSexo(v)}" — o /^m/i antigo lia "Mulher" como MASCULINO`);
  } else ok++;
}
const HOMEM = ["masculino", "Masculino", "homem", "Homem", "MASCULINO"];
for (const v of HOMEM) {
  if (normalizarSexo(v) !== "masculino") {
    falhas.push(`normalizarSexo("${v}") devolveu "${normalizarSexo(v)}"`);
  } else ok++;
}

// ── 3b. LETRA SOLTA É AMBÍGUA NESTE APP, e tem de ser RECUSADA ─────────────
//
// Não é preciosismo de validação. O EAP gravava "m" para MULHER; o motor de VM
// lia /^m/i como MASCULINO. E o valor CRUZA os módulos pelo contexto do
// paciente, então a mesma letra chegava do outro lado com o sexo trocado.
// Escolher um dos dois significados erraria o outro em silêncio.
for (const v of ["m", "M", "f", "F", "h", "H"]) {
  if (normalizarSexo(v) !== null) {
    falhas.push(
      `normalizarSexo("${v}") devolveu "${normalizarSexo(v)}" — letra solta é ambígua no próprio app ` +
      `("m" era Mulher no EAP e Masculino no motor de VM) e precisa ser recusada, não adivinhada.`
    );
  } else ok++;
  if (predictedBodyWeight(175, v) !== null) {
    falhas.push(`predictedBodyWeight com sexo "${v}" devolveu número a partir de letra ambígua`);
  } else ok++;
}

// ── 3c. Nenhum campo `sexo` do app oferece letra solta como valor ──────────
//
// A recusa acima protege o cálculo; esta trava protege a COLETA. Um preset que
// grave "h"/"m" faria o app pedir o sexo e jogar a resposta fora — pior que o
// bug original, porque parece funcionar.
{
  const arquivosDeArvore = fs.readdirSync(appDir).filter((f) => /-decision-tree\.ts$/.test(f));
  let camposEncontrados = 0;
  for (const f of arquivosDeArvore) {
    const texto = fs.readFileSync(path.join(appDir, f), "utf8");
    if (!/id:\s*"sexo"/.test(texto)) continue;
    camposEncontrados++;
    // A janela precisa alcançar o bloco `presets` mesmo com comentário longo
    // entre o id e ele — a primeira versão usava 400 caracteres, o comentário
    // do EAP passou disso, e o campo sumiu da conferência sem uma linha de
    // aviso. Regra que "não encontra" e segue em frente não protege nada.
    const campo = texto.match(/id:\s*"sexo"[\s\S]{0,2000}?presets:\s*\[([\s\S]{0,600}?)\]/);
    if (!campo) {
      falhas.push(
        `${f}: tem campo "sexo" mas a leitura dos presets falhou — a conferência não ` +
        `enxergou os valores oferecidos. Formato mudou; ajuste a leitura em vez de confiar nela.`
      );
      continue;
    }
    const valores = [...campo[1].matchAll(/value:\s*"([^"]*)"/g)].map((m) => m[1]);
    if (!valores.length) {
      falhas.push(`${f}: campo "sexo" sem nenhum preset legível.`);
      continue;
    }
    const ruins = valores.filter((v) => normalizarSexo(v) === null);
    if (ruins.length) {
      falhas.push(
        `${f}: o campo "sexo" oferece ${ruins.map((r) => `"${r}"`).join(", ")} — valor que ` +
        `normalizarSexo recusa. O app perguntaria o sexo e descartaria a resposta — e foi ` +
        `assim que "m" significou Mulher aqui e Masculino no motor de ventilação.`
      );
    } else ok++;
  }
  // O app tem campos de sexo em mais de uma árvore. Zero achados significa que
  // a varredura deixou de enxergar o arquivo, não que está tudo certo.
  if (camposEncontrados < 2) {
    falhas.push(
      `só ${camposEncontrados} árvore(s) com campo "sexo" — a varredura provavelmente parou de ` +
      `enxergar os arquivos (ventilação e EAP têm o campo).`
    );
  } else ok++;
}

// ── 4. Altura implausível → recusa, não extrapolação ───────────────────────
for (const h of [0, 60, 119, 231, 400, NaN]) {
  if (predictedBodyWeight(h, "masculino") !== null) {
    falhas.push(`predictedBodyWeight(${h} cm) devolveu número — altura fora da faixa adulta deve recusar`);
  } else ok++;
}

// ── 5. FONTE ÚNICA: ninguém mais implementa a fórmula ──────────────────────
//
// A trava de comportamento acima não impede alguém de escrever uma SEGUNDA
// cópia amanhã — que é exatamente como este defeito nasceu. Então se vigia o
// fonte: as constantes da fórmula só podem aparecer no arquivo que a define.
function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|lib\/i18n|e2e|scripts|auditoria|locales/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

const DONO = "ventilation-decision-tree.ts";
for (const arquivo of fontes(appDir)) {
  const rel = path.relative(appDir, arquivo);
  if (rel === DONO) continue;
  const texto = fs.readFileSync(arquivo, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  // 152,4 é a constante que define a fórmula. Quem a escreve, está
  // reimplementando o peso predito.
  if (/\b152\.4\b/.test(texto)) {
    falhas.push(
      `${rel} contém a constante 152.4 — segunda implementação de peso predito. ` +
      `A fórmula vive só em ${DONO}; duas cópias foi o defeito que este script existe para impedir.`
    );
  } else ok++;
}

// ── 6. A tabela PEEP/FiO₂ existe, e quem manda usá-la aponta para ela ──────
//
// QUATRO pontos do app instruíam a titular "pela tabela PEEP/FiO₂ ARDSNet" e a
// tabela não existia em lugar nenhum. Mandar fazer algo impossível dentro do
// próprio app é pior que omitir: quem procura e não acha conclui que o problema
// é dele.
{
  const tabela = fs.readFileSync(path.join(appDir, "lib/tabela-peep.ts"), "utf8");
  const pares = [...tabela.matchAll(/fio2:\s*"([^"]+)",\s*peep:\s*"([^"]+)"/g)];
  if (pares.length < 8) {
    falhas.push(`lib/tabela-peep.ts tem ${pares.length} pares FiO₂/PEEP — a low-PEEP do ARDSNet tem 8 degraus.`);
  } else ok++;
  // O último degrau é o que separa a low-PEEP do degrau do app: 18–24 em FiO₂
  // 1,0. Se ele sumir, a tabela deixa de mostrar o referencial mais alto e a
  // ressalva "o app trabalha abaixo dela" perde o objeto.
  if (!/1,00[\s\S]{0,40}18–24/.test(tabela)) {
    falhas.push("lib/tabela-peep.ts não traz FiO₂ 1,00 → PEEP 18–24 — sem o degrau mais alto, a ressalva do app perde referência.");
  } else ok++;

  const arvoreVm = fs.readFileSync(path.join(appDir, "ventilation-decision-tree.ts"), "utf8");
  if (!/tabela_peep:/.test(arvoreVm) || !/TABELA_LOW_PEEP/.test(arvoreVm)) {
    falhas.push("a árvore de ventilação não expõe o nó `tabela_peep` alimentado por TABELA_LOW_PEEP.");
  } else ok++;

  // Quem MANDA usar a tabela tem de dizer ONDE ela está.
  const citam = {
    "eap-decision-tree.ts": null,
    "ventilation-engine.ts": null,
    "components/protocol-screen/ventilator-configurator-card.tsx": null,
  };
  for (const arq of Object.keys(citam)) {
    const t = fs.readFileSync(path.join(appDir, arq), "utf8");
    // A conferência é POR LINHA, não por arquivo. A primeira versão procurava o
    // ponteiro em qualquer lugar do arquivo — e o EAP menciona o módulo de
    // ventilação noutro nó, então uma instrução órfã passava verde de carona
    // numa frase distante. É o "medir o efeito, não a grafia" do R-10 aplicado
    // à granularidade: a pergunta é se ESTA instrução diz onde, não se o
    // arquivo diz onde em algum lugar.
    let orfas = 0;
    for (const linha of t.split("\n")) {
      if (/^\s*\/\//.test(linha) || /^\s*\*/.test(linha)) continue;
      if (!/tabela[^"']{0,25}(PEEP|FiO)/i.test(linha)) continue;
      if (/passo "Tabela PEEP\/FiO₂"|tabela no módulo de VM|módulo de Ventilação Mecânica/i.test(linha)) continue;
      orfas++;
    }
    if (orfas) {
      falhas.push(
        `${arq}: ${orfas} instrução(ões) mandam usar a tabela PEEP/FiO₂ sem dizer ONDE ela está — ` +
        `instrução para algo que o leitor procura e não encontra.`
      );
    } else ok++;
  }
}

console.log("\nVentilação — peso predito: fonte única, e recusa o que não sabe\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log("");
} else {
  console.log(`✅ ${ok} verificações — fórmula ARDSNet conferida, sexo indeterminado recusado em todas as formas\n`);
}

fs.rmSync(tempDir, { recursive: true, force: true });
process.exit(falhas.length ? 1 : 0);
