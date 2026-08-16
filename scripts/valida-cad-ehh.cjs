#!/usr/bin/env node
/**
 * PROMETE
 *   Que o bicarbonato tenha UM ramo e UMA dose (a do consenso 2024), sem a
 *   faixa 6,9–7,0 de 2009; que o potássio continue ANTES da insulina no fluxo,
 *   conferido por travessia do grafo; que a taxa de queda osmolar seja a MESMA
 *   nos dois nós que a declaram; que os sete números do consenso 2024 não
 *   regridam para os de 2009; e que exista o que fazer antes do exame voltar.
 *
 * NÃO PROMETE
 *   Cobertura do módulo inteiro. O ramo MISTO, a osmolalidade efetiva × total e
 *   o divisor da ureia já têm travas próprias (test:osmolaridade,
 *   test:consistencia) e não são reconferidos aqui.
 *
 * UNIVERSO
 *   A árvore de CAD/EHH compilada e lib/crise-hiperglicemica-2024.ts.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * ⚠️ O MÓDULO CITAVA O CONSENSO ADA/EASD 2024 — no id (`cad_ehh_ada_2024`), no
 * cabeçalho e em várias evidências — E CARREGAVA NÚMEROS DE 2009 EM SETE
 * PONTOS. A D-2 registrava isso para o bicarbonato; ao abrir a fonte para
 * fechá-la, o bicarbonato revelou-se um caso de um padrão que atravessava o
 * módulo.
 *
 * É R-52 PELO AVESSO, e a diferença importa: o "ACLS 2025" que recusamos era
 * fonte de TERCEIRO rotulando ano novo sobre conteúdo velho; aqui era o NOSSO
 * PRÓPRIO APP afirmando uma procedência que os números não tinham.
 *
 * Por isso esta trava não confere "o número existe" — confere que o número é O
 * DE 2024 e que o de 2009 não voltou. Cada par vem com os dois valores.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "valida-cad-"));
let arvore = null;
try {
  execFileSync(
    "npx",
    [
      "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
      "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
      path.join(appDir, "dka-hhs-decision-tree.ts"),
    ],
    { cwd: appDir, stdio: "pipe" }
  );
  arvore = require(path.join(tempDir, "dka-hhs-decision-tree.js")).dkaHhsDecisionTree;
} catch (erro) {
  falhas.push(`a árvore de CAD/EHH não compilou — as conferências NÃO RODARAM: ${String(erro).slice(0, 180)}`);
}

/**
 * ⚠️ TODO o texto do nó — via helper canônico, não por lista de campos.
 *
 * A versão anterior listava campos à mão e ficava cega para os demais. Seis
 * vezes numa sessão isso produziu conclusão errada, a pior delas declarando
 * "beco sem conteúdo" um nó cuja conduta vivia em `exitCriteria` e `targets`.
 * O helper deriva do objeto: campo novo entra sozinho (R-73, D-15).
 */
const { textosDoNo } = require("./lib/textos-do-no.cjs");

const textosDe = (id) => textosDoNo(arvore?.nodes?.[id]);
const todos = arvore ? Object.keys(arvore.nodes).flatMap(textosDe) : [];
const tudo = todos.join("\n");

// ── A. BICARBONATO: um ramo, uma dose (D-2) ──────────────────────────────
{
  const no = arvore?.nodes?.bicarbonato;
  const saidas = (no?.options ?? []).map((o) => o.id);
  if (!no) {
    falhas.push("o nó `bicarbonato` sumiu.");
  } else {
    if (saidas.length !== 2) {
      falhas.push(
        `o nó do bicarbonato tem ${saidas.length} saídas — o consenso 2024 tem DOIS estados (pH ≥ 7,0 e ` +
        `pH < 7,0). Um terceiro ramo é a faixa 6,9–7,0 de 2009 voltando, e ela prescrevia METADE da dose ` +
        `a quem a diretriz atual trata com a dose cheia.`
      );
    } else ok++;

    const texto = textosDe("bicarbonato").join("\n") + "\n" + textosDe("bic_admin").join("\n");
    if (/6,9\s*[–-]\s*7,0\s*:/.test(texto) || /50 mEq/.test(texto)) {
      falhas.push(
        "voltou a faixa 6,9–7,0 com a dose de 50 mEq — números do protocolo de 2009. O consenso 2024 tem " +
        "um limiar (pH < 7,0) e uma dose (100 mmol em 400 mL a cada 2 h)."
      );
    } else ok++;

    for (const [nome, padrao, porque] of [
      ["a dose única de 100 mmol", /100 mmol de bicarbonato/, "é a única dose do consenso 2024"],
      ["o veículo", /400 mL de ÁGUA ESTÉRIL/, "a diluição é o que torna a solução isotônica"],
      ["a repetição até pH > 7,0", /a cada 2 h até atingir pH > 7,0/, "é o alvo, e não normalizar o pH"],
      ["os danos nomeados", /ACIDOSE PARADOXAL/, "proibir sem explicar não gruda — e aqui o dano não aparece no monitor"],
      ["a procedência do KCl", /NÃO VEM DO CONSENSO 2024/, "o KCl junto é do protocolo clássico, e a procedência diferente fica declarada"],
    ]) {
      if (!padrao.test(texto)) falhas.push(`bicarbonato: ${nome} sumiu — ${porque}.`);
      else ok++;
    }
  }
}

// ── B. POTÁSSIO ANTES DA INSULINA — por travessia do grafo ───────────────
//
// Não basta o texto dizer "segurar a insulina": o que importa é que NÃO exista
// caminho da classificação até a insulina sem passar pelo nó do potássio.
{
  const nodes = arvore?.nodes ?? {};
  const saidasDe = (id) => {
    const n = nodes[id];
    if (!n) return [];
    if (typeof n.next === "string") return [n.next];
    if (n.next?.possiveis) return n.next.possiveis;
    return (n.options ?? []).map((o) => o.next).filter(Boolean);
  };
  const alcancaInsulinaSemK = (inicio) => {
    const vistos = new Set();
    const fila = [inicio];
    while (fila.length) {
      const id = fila.shift();
      if (id === "potassio") continue; // barreira: este é o nó que precisa vir antes
      if (id === "insulina") return true;
      if (vistos.has(id)) continue;
      vistos.add(id);
      fila.push(...saidasDe(id));
    }
    return false;
  };
  const PARTIDAS = ["hidratacao_cad", "hidratacao_ehh", "misto"];
  for (const partida of PARTIDAS) {
    if (!nodes[partida]) {
      falhas.push(`o nó \`${partida}\` sumiu — a conferência de ordem não rodou sobre ele.`);
      continue;
    }
    if (alcancaInsulinaSemK(partida)) {
      falhas.push(
        `existe caminho de \`${partida}\` até a INSULINA sem passar pelo nó do POTÁSSIO. ⚠️ Iniciar ` +
        `insulina com K⁺ < 3,5 é a decisão que mata quando errada: a insulina empurra o potássio para ` +
        `dentro da célula e o K⁺ já está falsamente elevado pela acidose.`
      );
    } else ok++;
  }

  const kBaixo = textosDe("k_baixo").join("\n");
  if (!/SEGURAR a insulina até K⁺ ≥ 3,5/.test(kBaixo)) {
    falhas.push("o nó `k_baixo` deixou de mandar SEGURAR a insulina — é a instrução, e ela é explícita de propósito.");
  } else ok++;
}

// ── C. Os sete números: 2024, e não 2009 ─────────────────────────────────
{
  const PARES = [
    ["a glicose entra aos 250", /ACRESCENTAR GLICOSE AOS 250 mg\/dL/, /troca para SG aos 200 mg\/dL/, "2009 usava 200 — esperar 50 mg/dL a mais com insulina correndo aproxima da hipoglicemia"],
    ["a redução da insulina para 0,05", /0,05 U\/kg\/h\) — e NÃO desligar/, /0,02[–-]0,05 U\/kg\/h/, "o piso de 0,02 pode não sustentar o fechamento da cetose"],
    ["a meta do EHH em 200–250", /EHH, manter 200–250 mg\/dL/, /manter glicemia 250–300 mg\/dL/, "2009 mantinha mais alto que o consenso atual"],
    ["a taxa de queda osmolar 3,0–8,0", /entre 3,0 e 8,0 mOsm\/kg\/h/, /≤ 3 mOsm\/kg\/h/, "o app tinha DOIS tetos para a mesma grandeza, e o do EHH puro era o errado"],
    ["a reposição de K⁺ em 10–20 mmol/L/h", /10–20 mmol\/L POR HORA/, /KCl 20–40 mEq\/h/, "o app trazia o DOBRO da taxa da fonte"],
    ["o KCl de manutenção em 10–20 por litro", /10–20 mmol de KCl por LITRO/, /20–40 mEq de KCl por litro/, "idem, o dobro"],
    ["o débito urinário na resolução do EHH", /DÉBITO URINÁRIO > 0,5 mL\/kg\/h/, /osmolalidade efetiva < 315/, "o critério de volume é o que prova que a perfusão renal voltou"],
  ];
  for (const [nome, deve, naoDeve, porque] of PARES) {
    if (!deve.test(tudo)) {
      falhas.push(`sumiu ${nome} — número do consenso 2024. ${porque}.`);
    } else ok++;
    if (naoDeve.test(tudo)) {
      falhas.push(
        `⚠️ REGRESSÃO PARA 2009: ${nome} voltou ao valor antigo. O módulo CITA o consenso 2024 — número de ` +
        `outra versão sob esse rótulo é má atribuição INTERNA de procedência (R-52 pelo avesso).`
      );
    } else ok++;
  }

  // ⚠️ ADJACÊNCIA: a ressalva do acesso central tem de estar NA MESMA FRASE do
  // número, e não numa linha adiante. Quem precisa de mais que 10–20 mmol/h
  // precisa saber ali por que a veia periférica não serve — senão a taxa sobe
  // na bomba que está ao lado.
  //
  // Esta conferência nasceu de uma mutação que NÃO criou defeito: retirar a
  // ressalva de junto do número passava, porque a trava só perguntava se as
  // duas coisas existiam no módulo (R-15 item 13 — a string certa no papel
  // errado, aqui na POSIÇÃO errada).
  {
    const frase = todos.find((t) => /10–20 mmol\/L POR HORA/.test(t)) ?? "";
    if (!frase) {
      falhas.push("não achei a frase da taxa de reposição de K⁺ — a conferência de adjacência não rodou.");
    } else if (!/ACESSO VENOSO CENTRAL/.test(frase)) {
      falhas.push(
        "a ressalva do ACESSO VENOSO CENTRAL saiu de junto do número da taxa de K⁺. Ela precisa estar na " +
        "MESMA frase: quem precisa de mais que 10–20 mmol/L/h precisa saber ali por que a periférica não " +
        "serve — potássio concentrado em veia periférica causa dor, flebite e necrose se extravasar."
      );
    } else ok++;
  }

  // A taxa osmolar tem de ser a MESMA nos dois nós que a declaram.
  const misto = textosDe("misto").join("\n");
  const ehh = textosDe("hidratacao_ehh").join("\n");
  const taxa = /3,0 e 8,0 mOsm\/kg\/h/;
  if (!taxa.test(misto) || !taxa.test(ehh)) {
    falhas.push(
      "os nós `misto` e `hidratacao_ehh` não declaram a MESMA taxa de queda osmolar. Foi assim que o " +
      "módulo passou a ter dois tetos para a mesma grandeza — e o do EHH puro, que é o paciente de maior " +
      "risco osmolar, era o errado."
    );
  } else ok++;
}

// ── D. Insulina: a exceção do bólus e a CAD leve ─────────────────────────
{
  const ins = textosDe("insulina").join("\n");
  for (const [nome, padrao, porque] of [
    ["a regra do sem-bólus", /SEM BOLUS DE ROTINA/, "continua sendo a regra"],
    ["a exceção do acesso difícil", /DEMORA para obter acesso venoso/, "é a condição em que a própria fonte admite o bólus, e é o cenário do serviço real"],
    ["a via intramuscular", /IV OU INTRAMUSCULAR/, "é a via que resolve quando a veia é o problema"],
    ["a taxa própria da CAD leve", /CAD LEVE TEM TAXA PRÓPRIA/, "0,05 U/kg/h na leve — a condição vem antes do número"],
  ]) {
    if (!padrao.test(ins)) falhas.push(`insulina: ${nome} sumiu — ${porque}.`);
    else ok++;
  }

  const res = textosDe("resolucao").join("\n");
  for (const [nome, padrao] of [
    ["a sobreposição de 1–2 h", /SOBREPOSIÇÃO OBRIGATÓRIA de 1 a 2 h/],
    ["o basal do recém-diagnosticado", /0,15–0,3 U\/kg/],
    ["a resolução da CAD sem critério de glicemia", /NÃO HÁ CRITÉRIO DE GLICEMIA/],
  ]) {
    if (!padrao.test(res)) falhas.push(`resolução/transição: ${nome} sumiu.`);
    else ok++;
  }
}

// ── E. O que começar antes do exame voltar ───────────────────────────────
{
  const entry = textosDe("entry").join("\n");
  if (!/COMECE AGORA — O QUE NÃO DEPENDE DE NENHUM EXAME/.test(entry)) {
    falhas.push(
      "sumiu o bloco do que fazer antes do exame voltar. ⚠️ Os campos de glicemia, pH e K⁺ são " +
      "OBRIGATÓRIOS e a classificação depende deles — sem esse bloco, a tela sugere que sem o número não " +
      "há conduta, e o médico ESPERA."
    );
  } else {
    for (const [nome, padrao] of [
      ["a hidratação como o que independe", /HIDRATAÇÃO, que é o primeiro passo dos três quadros/],
      ["o ECG como leitura de potássio", /onda T apiculada/],
      ["o precipitante", /BUSCAR O PRECIPITANTE/],
      ["o que DEPENDE do exame", /O QUE DEPENDE DO EXAME/],
      ["a gasometria venosa", /VENOSA basta/],
    ]) {
      if (!padrao.test(entry)) falhas.push(`antes do exame: ${nome} sumiu.`);
      else ok++;
    }
  }
}

// ── F. Vacuidade ─────────────────────────────────────────────────────────
{
  if (todos.length < 50) {
    falhas.push(`só ${todos.length} textos no módulo — as conferências acima podem ter rodado sobre nada (R-15 item 9).`);
  } else ok++;
}

// ── ⚠️ O TEXTO DE "COMEÇAR SEM O EXAME" ESTÁ ONDE A PESSOA TRAVA ──────────
//
// R-48 puro: `ANTES_DO_EXAME_VOLTAR` existia e vivia no nó `entry`, uma tela
// ANTES do `dados` — que é justamente o nó que EXIGE glicemia, pH e K⁺ como
// obrigatórios. Quem chega antes da gasometria não avança dali, e a frase que
// diz "dá para começar" tinha ficado para trás.
//
// A conferência é de POSIÇÃO, não de existência: a constante tem de estar no
// nó que bloqueia, não só no que introduz.
{
  const noBloqueio = textosDe("dados").join("\n");
  if (!/COMECE AGORA — O QUE NÃO DEPENDE DE NENHUM EXAME/.test(noBloqueio)) {
    falhas.push(
      "o texto de começar sem o exame sumiu do nó `dados`.\n" +
      "      ⚠️ Ele é obrigatório AQUI porque é aqui que o fluxo trava: três campos " +
      "obrigatórios que o paciente da primeira hora não tem. No `entry` ele informa; " +
      "no `dados` ele desbloqueia (R-48)."
    );
  } else ok++;

  const obrigatorios = (arvore?.nodes?.dados?.fields ?? []).filter((c) => !c.optional).map((c) => c.id);
  if (!["glicemia", "ph", "potassio"].every((c) => obrigatorios.includes(c))) {
    falhas.push(
      "o nó `dados` deixou de exigir glicemia/pH/K⁺ — e a conferência acima perdeu o sentido.\n" +
      "      Se os campos não travam mais, o texto de desbloqueio guarda um cenário que não existe (R-15 item 9)."
    );
  } else ok++;
}

console.log("\nCAD/EHH — os números do consenso que o módulo cita, o potássio antes da insulina e o que começar sem exame\n");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — um ramo de bicarbonato, sete números de 2024 e a ordem provada por travessia\n`);
process.exit(0);
