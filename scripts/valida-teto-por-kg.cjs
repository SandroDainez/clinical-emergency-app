/**
 *
 * PROMETE: nenhum teto absoluto satura em peso implausível, e nenhum fármaco cujo teto o APP declara é prescrito por quilo sem ele.
 * NÃO PROMETE: que exista teto onde deveria. A lista de fármacos vem do que o próprio app já declara — nenhum teto é exigido por conhecimento externo. Teto decorativo é AVISO, não falha.
 * UNIVERSO: toda a árvore de conteúdo. 39 pares dose/kg + teto conferidos.

 * valida-teto-por-kg.cjs — R-22, item 3
 *
 * ── O EIXO ──────────────────────────────────────────────────────────────────
 *
 * Dose por quilo mais teto absoluto é uma afirmação dupla, e as duas partes
 * precisam ser coerentes ENTRE SI. Três defeitos possíveis, todos decidíveis
 * sem sair do repositório:
 *
 *   A · TETO QUE SATURA EM PESO IMPLAUSÍVEL — "0,5 mg/kg, máx 3 mg" satura em
 *       6 kg. Num protocolo adulto, é teto pediátrico esquecido no lugar errado,
 *       e todo adulto recebe a mesma dose fixa sem que ninguém perceba.
 *
 *   B · TETO QUE NUNCA VINCULA — satura acima de 250 kg. É decorativo: existe
 *       no texto, nunca no paciente. Não é perigoso, é ruído que ensina a ler
 *       "máx" como enfeite.
 *
 *       ⚠️ B É AVISO, NÃO FALHA — e a escolha é DECLARADA, não acidental. O
 *       R-3 diz que detectar não é travar, e ele vale para achado que importa:
 *       teto decorativo não põe ninguém em risco, e derrubar o build por ele
 *       gastaria a autoridade do vermelho onde ela não é necessária. A
 *       consequência é que a mutação de B se confere pela SAÍDA, não pelo
 *       código de retorno (R-2) — está dito aqui para ninguém confundir com
 *       fuga.
 *
 *   C · DOSE/kg SEM TETO ONDE O APP JÁ DECLARA UM. Este é o mais forte, porque
 *       é R-22 puro: se o app diz em algum lugar que a alteplase tem máximo de
 *       90 mg, então um segundo lugar que prescreve 0,9 mg/kg sem teto
 *       CONTRADIZ o próprio app. Não é julgamento farmacológico — é a mesma
 *       afirmação feita duas vezes, de formas incompatíveis.
 *
 * ── O QUE NÃO É DEFEITO, E FICA NOMEADO ─────────────────────────────────────
 *
 * A varredura preliminar achou 240 doses por kg sem teto declarado. A esmagadora
 * maioria é legítima: cetamina, propofol, rocurônio, manitol e cristaloide não
 * têm teto absoluto — a dose acompanha o peso e ponto. Exigir teto de todas
 * seria trava que acusa inocente (R-22), e essas 240 viram ruído que faz
 * desligar o verificador.
 *
 * Por isso o caso C é conferido só contra a LISTA DO PRÓPRIO APP: fármaco cujo
 * teto o app já declara em algum lugar. Nada é exigido por conhecimento
 * externo.
 *
 * Também ficam de fora as doses pediátricas com teto adulto — "lorazepam
 * 0,1 mg/kg, máx 4 mg" satura em 40 kg de propósito, e é assim que a literatura
 * escreve. O corte de implausibilidade é bem abaixo disso.
 */

const fs = require("fs");
const path = require("path");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const avisos = [];
let ok = 0;

/** Peso abaixo do qual um teto em conteúdo adulto é implausível. */
const PESO_MINIMO_PLAUSIVEL = 25;
/** Peso acima do qual o teto nunca vincula na prática. */
const PESO_MAXIMO_UTIL = 250;

const num = (s) => parseFloat(String(s).replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));

/** Dose por kg com teto na mesma frase. */
// O `(?!\/)` depois da unidade do TETO é obrigatório: "fenitoína 15–20 mg/kg
// (máx 50 mg/min)" declara VELOCIDADE, não teto de dose. Lido como teto, satura
// em 3 kg e a trava acusa um texto correto — foi o primeiro falso positivo que
// ela produziu contra si mesma.
const COM_TETO =
  /(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(mg|mcg|g|U|UI)\/kg(?!\/)[^"]{0,55}?(?:máx\.?|máximo|teto|não exceder)\D{0,12}?(\d+(?:[.,]\d+)?)\s*(mg|mcg|g|U|UI)\b(?!\/)/gi;

/** Dose por kg, para o caso C. */
const POR_KG = /(\d+(?:[.,]\d+)?)(?:\s*[–-]\s*(\d+(?:[.,]\d+)?))?\s*(mg|mcg|g|U|UI)\/kg(?!\/)/gi;

const TEM_TETO_PERTO = /máx\.?|máximo|teto|não exceder|Math\.min/i;

/**
 * ── O FÁRMACO DA DOSE É O MAIS PRÓXIMO À ESQUERDA, NÃO QUALQUER UM DA LINHA ──
 *
 * A primeira versão procurava qualquer nome de fármaco na linha, e produziu
 * NOVE falsos positivos de uma vez — todos do mesmo jeito: a linha cita um
 * fármaco e prescreve por kg OUTRO.
 *
 *   "Rocurônio SOMENTE se houver contraindicação à succinilcolina — ...
 *    sugamadex 16 mg/kg"  → acusava a succinilcolina
 *   "cetamina 1 mg/kg ... EVITAR propofol e midazolam"  → acusava o midazolam
 *
 * Acusar inocente é pior que não travar (R-22): nove acusações falsas na
 * primeira execução bastariam para alguém desligar o script.
 */
function farmacoDaDose(linha, posicaoDaDose) {
  const antes = linha.slice(0, posicaoDaDose);
  let melhor = null;
  let maisProximo = Infinity;
  for (const f of FARMACOS) {
    const re = new RegExp(f, "gi");
    let m;
    while ((m = re.exec(antes))) {
      const distancia = antes.length - (m.index + m[0].length);
      // O nome citado como REFERÊNCIA não é o dono da dose.
      if (REFERENCIA_OUTRO.test(antes.slice(0, m.index))) continue;
      // 45 caracteres: cabe "Fármaco X mg/kg" e o que vier no meio, e não cabe
      // uma segunda oração com outro fármaco.
      if (distancia < maisProximo && distancia <= 45) {
        maisProximo = distancia;
        melhor = f;
      }
    }
  }
  return melhor;
}

function fontes(dir, saida = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!/node_modules|dist|\.git|\.expo|e2e|scripts|auditoria|locales|i18n/.test(p)) fontes(p, saida);
    } else if (/\.tsx?$/.test(f.name)) saida.push(p);
  }
  return saida;
}

const arquivos = fontes(appDir);

/** Conteúdo explicitamente pediátrico/neonatal — o corte de peso não se aplica. */
const PEDIATRICO = /pediátric|criança|neonat|recém-nascido|lactente|infantil/i;

// ── Passo 1: inventário de tetos que o PRÓPRIO app declara ──────────────────
//
// A lista do caso C nasce daqui, e só daqui. Nenhum teto é exigido por
// conhecimento externo — o que se cobra é o app concordar consigo mesmo.
const TETO_DECLARADO = new Map(); // fármaco → Set de "dose/kg + teto"
// A lista precisa incluir fármacos SEM teto também. Ela não decide o que é
// exigido — isso vem de TETO_DECLARADO —, ela decide a QUEM a dose pertence.
// Faltando "sugamadex", a dose de 16 mg/kg era atribuída à succinilcolina
// citada na oração anterior.
const FARMACOS = [
  "alteplase", "tenecteplase", "heparina não fracionada", "HNF", "succinilcolina",
  "levetiracetam", "valproato", "fenitoína", "fosfenitoína", "lorazepam", "midazolam",
  "diazepam", "fenobarbital", "lidocaína", "amiodarona", "adenosina", "atropina",
  "hidrocortisona", "metilprednisolona", "dexametasona", "ácido tranexâmico",
  // sem teto absoluto — entram só para a atribuição não escorregar
  "sugamadex", "rocurônio", "cetamina", "ketamina", "propofol", "etomidato",
  "fentanil", "morfina", "manitol", "bicarbonato", "sulfato de magnésio",
  "gluconato de cálcio", "cloreto de cálcio", "insulina", "enoxaparina",
  "naloxona", "flumazenil", "carvão ativado", "emulsão lipídica", "dantrolene",
];

/**
 * Menção que REFERENCIA outro fármaco em vez de prescrevê-lo. Sem isto,
 * "BNM adespolarizante — alternativa à succinilcolina na ISR (1,2 mg/kg)"
 * atribuía a dose do rocurônio à succinilcolina.
 */
const REFERENCIA_OUTRO = /(alternativa à|alternativa ao|contraindicação à|contraindicação ao|em vez de|no lugar de|substitui|preferir a|comparado à|versus)\s*$/i;

const linhasDoApp = [];
for (const arquivo of arquivos) {
  const rel = path.relative(appDir, arquivo);
  const texto = fs
    .readFileSync(arquivo, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  texto.split("\n").forEach((linha, i) => {
    if (/^\s*\/\//.test(linha)) return;
    linhasDoApp.push({ rel, i: i + 1, linha });
  });
}

for (const { rel, i, linha } of linhasDoApp) {
  for (const m of linha.matchAll(COM_TETO)) {
    const porKg = num(m[1]);
    const unidadeKg = m[3].toLowerCase();
    const teto = num(m[4]);
    const unidadeTeto = m[5].toLowerCase();
    if (unidadeKg !== unidadeTeto) continue; // unidades diferentes: não comparável
    if (!porKg || !teto) continue;

    const farmaco = farmacoDaDose(linha, m.index);
    if (farmaco) {
      if (!TETO_DECLARADO.has(farmaco.toLowerCase())) TETO_DECLARADO.set(farmaco.toLowerCase(), new Set());
      TETO_DECLARADO.get(farmaco.toLowerCase()).add(`${m[1]} ${unidadeKg}/kg → máx ${m[4]} ${unidadeTeto}`);
    }

    const pesoSatura = teto / porKg;
    ok++;

    // A — satura em peso implausível
    if (pesoSatura < PESO_MINIMO_PLAUSIVEL && !PEDIATRICO.test(linha)) {
      falhas.push(
        `${rel}:${i} — teto satura em ${pesoSatura.toFixed(0)} kg: «${m[0].trim().slice(0, 80)}».\n` +
        `    Abaixo de ${PESO_MINIMO_PLAUSIVEL} kg, e a linha não é pediátrica: todo adulto recebe a dose fixa, e o "por kg" vira decoração.`
      );
    }
    // B — nunca vincula
    if (pesoSatura > PESO_MAXIMO_UTIL) {
      avisos.push(
        `${rel}:${i} — teto só vincula acima de ${pesoSatura.toFixed(0)} kg: «${m[0].trim().slice(0, 80)}». ` +
        `Nunca se aplica na prática; "máx" lido como enfeite ensina a ignorar os que valem.`
      );
    }
  }
}

// ── Passo 2 (caso C): fármaco com teto declarado NO APP, prescrito sem ele ──
for (const { rel, i, linha } of linhasDoApp) {
  if (TEM_TETO_PERTO.test(linha)) continue;
  // TODAS as doses por kg da linha, não só a primeira: "Ketamina 1–2 mg/kg IV +
  // Succinilcolina 1,5 mg/kg IV" tem duas, e conferir só a primeira (cetamina,
  // que não tem teto) fazia a segunda — que tem — desaparecer da varredura.
  for (const achou of linha.matchAll(POR_KG)) {
    const farmaco = farmacoDaDose(linha, achou.index);
    if (!farmaco || !TETO_DECLARADO.has(farmaco.toLowerCase())) continue;
    const declarados = [...TETO_DECLARADO.get(farmaco.toLowerCase())].join(" · ");
    falhas.push(
      `${rel}:${i} — ${farmaco} «${achou[0].trim()}» SEM teto, e o app declara teto para ele em outro lugar (${declarados}).\n` +
      `    «${linha.trim().slice(0, 110)}»\n` +
      `    O app contradiz a si mesmo: a mesma dose aparece com e sem limite superior.`
    );
  }
}

// ⚠️ PISO SOBRE CONTAGEM DE ACHADOS, e não de arquivos — por isso a folga.
//
// A varredura de pisos (2026-08-16) encontrou dois casos apertados no app, e
// os dois contam ACHADO CLÍNICO: aqui, pares dose/kg + teto; na
// `valida-prazos`, prazos acionáveis. As outras oito travas com piso contam
// ARQUIVOS (289, 290, 1703 lidos) — número que só cai se a leitura quebrar.
//
// A diferença é que ACHADO ENCOLHE POR CORREÇÃO: quando uma diretriz aposenta
// um esquema, o par some legitimamente. Piso colado na contagem transforma a
// trava em alarme contra quem remove o que a diretriz removeu — foi o que
// aconteceu na `valida-prazos` ao fechar a D-2.
//
// Piso de vacuidade é para detectar LEITURA QUEBRADA, não mudança de conteúdo:
// fica em ~60% da contagem real (24), e a linha abaixo diz isso.
if (ok < 15) {
  falhas.push(
    `só ${ok} pares dose/kg + teto lidos — universo pequeno demais para valer como trava. ` +
    `Este piso é de LEITURA quebrada, não de conteúdo: se um par sumiu por correção de diretriz, ` +
    `a contagem cai um pouco e isto NÃO deve disparar.`
  );
}

console.log(`\nDose por kg × teto absoluto — coerência interna (R-22)\n`);
console.log(`Fármacos com teto declarado pelo app: ${[...TETO_DECLARADO.keys()].join(", ") || "—"}\n`);
for (const a of avisos) console.log(`⚠️  ${a}`);
if (falhas.length) {
  if (avisos.length) console.log("");
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s) · ${ok} pares dose/kg + teto conferidos\n`);
  process.exit(1);
}
console.log(`✅ ${ok} pares dose/kg + teto conferidos — nenhum satura em peso implausível, nenhum fármaco com teto declarado é prescrito sem ele\n`);
