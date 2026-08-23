#!/usr/bin/env node
/**
 * PROMETE: que os 12 distúrbios eletrolíticos tenham a classificação de
 *   gravidade COMO DADO, cada degrau com procedência de ALVO NOMEADO; que
 *   nenhum distúrbio fique sem degrau de base; que `getSeveritySummary` não
 *   volte a comparar contra o valor do paciente; e que um distúrbio existente
 *   SÓ no dado seja classificado sem tocar no componente.
 * NÃO PROMETE: que os 12 cortes estejam clínicos certos — nenhum tem fonte
 *   ainda, e é exatamente isso que o campo `alvo` declara. Também não cobre o
 *   resto da tela: imprime, a cada rodada, quantas comparações contra o valor
 *   do paciente continuam no componente (D-84).
 * UNIVERSO: `lib/eletrolitos/gravidade.ts`, compilado, com piso no retrato de
 *   2026-08-23 (12 distúrbios, 24 degraus).
 *
 * A GRAVIDADE ELETROLÍTICA CONTINUA SENDO DADO — e o componente continua sem
 * classificar.
 *
 * ⚠️ O QUE ESTA TRAVA IMPEDE: que o próximo corte volte para dentro do JSX. A
 * extração é barata de fazer e barata de desfazer — basta alguém escrever
 * `current < 3` numa condição de tela e o conteúdo clínico volta a morar onde
 * nenhum instrumento o vê.
 *
 * ⚠️ E ELA CONFERE O QUE FOI EXTRAÍDO, não se a extração aconteceu: conta os
 * degraus, exige procedência com ALVO nomeado em cada um, e prova que um
 * distúrbio que existe SÓ no dado é classificado sem ninguém tocar no
 * componente.
 */
const fs = require("fs"), os = require("os"), path = require("path");
const { execFileSync } = require("child_process");
const { conferirUniverso } = require("./lib/universo.cjs");

const RAIZ = path.resolve(__dirname, "..");
const TELA = path.join(RAIZ, "components", "protocol-screen", "electrolyte-calculator-screen.tsx");
let falhas = 0;
const erro = (m) => { console.error(`❌ ${m}`); falhas++; };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "grav-"));
execFileSync("npx", ["tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(RAIZ, "lib", "eletrolitos", "gravidade.ts")], { cwd: RAIZ, stdio: ["ignore", "ignore", "inherit"] });
const G = require(path.join(tmp, "eletrolitos", "gravidade.js"));

// ── 1. UNIVERSO ANTES DO RESULTADO
const disturbios = Object.keys(G.GRAVIDADE_POR_DISTURBIO);
const degraus = disturbios.flatMap((d) => G.GRAVIDADE_POR_DISTURBIO[d]);
const cortesNumericos = degraus.flatMap((d) => d.cortes).filter((c) => "valor" in c);
console.log(`\nUNIVERSO: ${disturbios.length} distúrbios · ${degraus.length} degraus · ${cortesNumericos.length} cortes numéricos`);
let ok = conferirUniverso("gravidade-eletrolitica", "disturbios", disturbios.length);
ok = conferirUniverso("gravidade-eletrolitica", "degraus", degraus.length) && ok;
if (!ok) falhas++;

// ── 2. TODO DEGRAU DECLARA PROCEDÊNCIA COM ALVO NOMEADO
for (const d of disturbios)
  for (const g of G.GRAVIDADE_POR_DISTURBIO[d]) {
    if (!g.procedencia) erro(`${d} · "${g.rotulo}" sem procedência`);
    else if (!g.procedencia.alvo || g.procedencia.alvo.trim().length < 20)
      erro(`${d} · "${g.rotulo}" com alvo vazio ou genérico — pendência sem alvo é campo em branco com outro nome`);
  }

// ── 3. TODO DISTÚRBIO TERMINA EM `restante`
for (const d of disturbios) {
  const lista = G.GRAVIDADE_POR_DISTURBIO[d];
  const ultimo = lista[lista.length - 1];
  if (!ultimo.cortes.some((c) => c.tipo === "restante"))
    erro(`${d} não termina em degrau "restante" — valor fora de todos os cortes ficaria SEM classificação`);
  for (let i = 0; i < lista.length - 1; i++)
    if (lista[i].cortes.some((c) => c.tipo === "restante"))
      erro(`${d} tem "restante" no degrau ${i + 1} de ${lista.length} — ele engole os seguintes`);
}

// ── 4. O COMPONENTE NÃO CLASSIFICA MAIS
// ⚠️ Procura COMPARAÇÃO CONTRA O VALOR ATUAL, que é a forma que a classificação
// tinha. Não é busca por número: a tela tem números legítimos (faixas de
// entrada, conversões de unidade) e acusá-los seria ruído.
const tela = fs.readFileSync(TELA, "utf8");
const corpo = tela.slice(tela.indexOf("function getSeveritySummary("));
const fim = corpo.indexOf("\n}\n");
const comparacoes = [...corpo.slice(0, fim).matchAll(/\bcurrent\s*(?:<|>|<=|>=|===|!==)\s*-?\d/g)].map((m) => m[0]);
if (comparacoes.length) erro(`getSeveritySummary voltou a classificar por número: ${comparacoes.join(" · ")}`);

// ⚠️ O QUE AINDA NÃO SAIU, CONTADO E NÃO ESCONDIDO (D-84). A extração desta
// rodada foi a CAMADA DE GRAVIDADE. O resto da tela — detecção do distúrbio,
// meta automática, e o `calculateResult` de 1.300 linhas — continua comparando
// contra o valor do paciente dentro do componente. Imprimir o número é a
// diferença entre "extraído" e "extraída uma camada".
const restantes = [...tela.matchAll(/\bcurrent\s*(?:<|>|<=|>=|===|!==)\s*-?\d/g)].length;
console.log(`⚠️ Comparações contra o valor do paciente AINDA no componente, fora da gravidade: ${restantes} (D-84)`);

// ── 3b. O CRITÉRIO QUE NÃO É NÚMERO — as três conferências
//
// ⚠️ POR QUE ELAS EXISTEM: a fonte da hipocalcemia diz "grave: < 1,9 mmol/L
// E/OU sintomas em qualquer valor abaixo da referência". Um modelo que só sabe
// número apaga a segunda metade — e apagar a segunda metade foi como se chegou a
// "grave é abaixo de X" onde a fonte nunca escreveu X sozinho.
{
  const todos = [];
  const achatar = (c) => { todos.push(c); if (c.tipo === "combinado") { achatar(c.faixa); achatar(c.clinico); } };
  for (const d of disturbios) for (const g of G.GRAVIDADE_POR_DISTURBIO[d]) g.cortes.forEach(achatar);
  // ⚠️ OS QUE NÃO ESTÃO EM DEGRAU TAMBÉM CONTAM. `apoia` e `exigeCompatibilidade`
  // existem para ser lembrados na tela, e por isso não vivem dentro de nenhum
  // degrau — mas seguem sendo afirmação clínica com procedência a conferir.
  // Deixá-los fora do universo seria auditá-los por não existirem.
  [...G.APOIAM_SINTOMATICO, ...G.EXIGEM_COMPATIBILIDADE].forEach(achatar);

  const clinicos = todos.filter((c) => c.tipo === "clinico");
  const pendentes = clinicos.filter((c) => !c.texto.trim());
  const ativos = clinicos.filter((c) => c.texto.trim());
  console.log(`  critérios clínicos: ${clinicos.length} (${ativos.length} com texto · ${pendentes.length} PENDENTES, estrutura sem conteúdo)`);

  // (1) TODO CLÍNICO COM TEXTO CHEGA À TELA. ⚠️ Hoje o universo de ativos é 0 —
  // a regra existe e não tem o que conferir, e isto sai impresso de propósito:
  // regra silenciosa com universo vazio é o falso verde que o R-101 persegue.
  // ⚠️ "CHEGA À TELA" NÃO É "ESTÁ ESCRITO NO ARQUIVO DA TELA". A primeira versão
  // procurava o texto literal e acusou os seis do núcleo — que a tela renderiza
  // por `NUCLEO_SINTOMATICO.map(... tr(c.texto) ...)`. Era o R-87 dentro do
  // próprio instrumento: literal no arquivo é proxy de renderização.
  //
  // O que vale é a COLEÇÃO ser percorrida e o texto de cada item ser impresso.
  const COLECOES = { NUCLEO_SINTOMATICO: G.NUCLEO_SINTOMATICO, APOIAM_SINTOMATICO: G.APOIAM_SINTOMATICO, EXIGEM_COMPATIBILIDADE: G.EXIGEM_COMPATIBILIDADE };
  const renderizados = new Set();
  for (const [nome, lista] of Object.entries(COLECOES)) {
    const percorre = new RegExp(`${nome}\\.map\\(`);
    const imprime = /tr\(c\.texto\)/;
    if (percorre.test(tela) && imprime.test(tela)) for (const c of lista) renderizados.add(c.texto);
  }
  for (const c of ativos)
    if (!tela.includes(c.texto) && !renderizados.has(c.texto))
      erro(`critério clínico não chega à tela: « ${c.texto.slice(0, 60)} » — degrau com critério clínico não pode ser renderizado só pelo número`);

  // (2) `combinado` DECLARA A LIGAÇÃO, e ela é escrita, não inferida.
  for (const c of todos.filter((x) => x.tipo === "combinado"))
    if (c.ligacao !== "e" && c.ligacao !== "ou")
      erro(`combinado sem ligação declarada: "e" e "ou" mudam a conduta e não se deduzem do texto da fonte`);

  // (3) CRITÉRIO CLÍNICO SEM PROCEDÊNCIA REPROVA, como já vale para o numérico.
  for (const c of clinicos)
    if (!c.procedencia?.alvo || c.procedencia.alvo.trim().length < 20)
      erro(`critério clínico sem alvo de procedência: « ${(c.texto || "(pendente)").slice(0, 40)} »`);

  // (3b) O PAPEL É CAMPO, NÃO REDAÇÃO — e há afirmações que NUNCA podem definir.
  //
  // ⚠️ A razão é do autor e é clínica: hipotensão refratária a vasopressor e
  // disfunção miocárdica aguda são ALTAMENTE INESPECÍFICAS no paciente crítico.
  // Elas podem ser LEMBRADAS quando o cálcio já está baixo; usá-las para concluir
  // que está seria transformar cinquenta causas possíveis num diagnóstico.
  // Broncoespasmo aparece, não define.
  const NUNCA_DEFINE = {
    "Hipotensão refratária a vasopressor":
      "altamente inespecífica no paciente crítico — tem cinquenta causas antes do cálcio",
    "Disfunção miocárdica aguda":
      "altamente inespecífica no paciente crítico — possível na hipocalcemia grave, jamais definidora",
    Broncoespasmo: "manifestação possível, não definidora (decisão do autor, 2026-08-23)",
  };
  const PAPEIS = ["define", "apoia", "exigeCompatibilidade"];
  for (const c of clinicos) {
    if (!PAPEIS.includes(c.papel))
      erro(`critério clínico sem papel válido: « ${c.texto.slice(0, 40)} » tem papel ${JSON.stringify(c.papel)}`);
    if (NUNCA_DEFINE[c.texto] && c.papel === "define")
      erro(`« ${c.texto} » foi promovida a "define" — ${NUNCA_DEFINE[c.texto]}`);
  }
  // E o inverso, medido no COMPORTAMENTO e não no campo: nenhum critério que não
  // seja `define` pode classificar sozinho.
  for (const c of clinicos.filter((x) => x.papel !== "define")) {
    const fake = { hypo_teste: [{ rotulo: "casou", sinais: "", cortes: [c], procedencia: c.procedencia }] };
    Object.assign(G.GRAVIDADE_POR_DISTURBIO, fake);
    if (G.degrauDeGravidade("hypo_teste", null, false, true))
      erro(`« ${c.texto} » (papel ${c.papel}) classificou SOZINHA — só "define" pode concluir`);
    delete G.GRAVIDADE_POR_DISTURBIO.hypo_teste;
  }
  const porPapel = PAPEIS.map((p) => `${clinicos.filter((c) => c.papel === p).length} ${p}`).join(" · ");
  console.log(`  papéis: ${porPapel}`);

  // (4) E O CASO QUE A FONTE NOMEIA: a hipocalcemia grave TEM critério clínico.
  // ⚠️ É esta linha que a mutação prevista derruba — apagar o `clinico` faz o
  // degrau voltar a classificar só por número, que é o defeito de origem.
  const grave = G.GRAVIDADE_POR_DISTURBIO.hypocalcemia[0];
  const temClinico = JSON.stringify(grave.cortes).includes('"clinico"');
  if (!temClinico)
    erro("hipocalcemia grave voltou a classificar SÓ por número — a fonte diz «< 1,9 mmol/L E/OU sintomas em qualquer valor abaixo da referência», e a segunda metade sumiu");
}

// ── 4b. UM CÁLCIO SÓ — gravidade e dose leem o MESMO valor
//
// ⚠️ O DEFEITO QUE ISTO IMPEDE JÁ ACONTECEU, e era erro clínico ativo: a tela
// classificava gravidade pelo cálcio BRUTO (`< 7` → "Grave") e calculava a dose
// pelo AJUSTADO pela albumina, dentro do mesmo card e com o mesmo rótulo. Em
// hipoalbuminemia — a regra em UTI — isso chama de "hipocalcemia grave" um
// paciente com cálcio ajustado normal e o manda para gluconato EV.
{
  const formula = /0\.8\s*\*\s*\(\s*4\s*-/;
  if (formula.test(tela))
    erro("a correção pela albumina voltou a ser calculada DENTRO da tela — ela vive em lib/eletrolitos/calcio.ts, e duas cópias foram exatamente o defeito");
  if (!/getSeveritySummary\(\s*disorder,\s*leituraDoCalcio\.valor/.test(tela))
    erro("a gravidade não está lendo o MESMO cálcio da dose (`leituraDoCalcio.valor`) — é o defeito dos dois cálcios voltando");
  const usosNaDose = (tela.match(/calcioParaClassificar\(/g) ?? []).length;
  if (usosNaDose < 3)
    erro(`a dose deveria ler pelo mesmo caminho da gravidade: esperava ao menos 3 usos de calcioParaClassificar (gravidade + hipo + hipercalcemia), achei ${usosNaDose}`);
}

// ── 5. O DISTÚRBIO FICTÍCIO — só no dado, sem tocar no componente
const FICTICIO = "sandroemia";
G.GRAVIDADE_POR_DISTURBIO[FICTICIO] = [
  { rotulo: "Grave (fictício)", sinais: "linha de teste", cortes: [{ tipo: "abaixoDe", valor: 42 }], procedencia: { fonte: null, alvo: "teste — não é afirmação clínica" } },
  { rotulo: "Moderada (fictício)", sinais: "linha de teste", cortes: [{ tipo: "restante" }], procedencia: { fonte: null, alvo: "teste — não é afirmação clínica" } },
];
const grave = G.degrauDeGravidade(FICTICIO, 10);
const moderada = G.degrauDeGravidade(FICTICIO, 99);
if (grave?.rotulo !== "Grave (fictício)" || moderada?.rotulo !== "Moderada (fictício)")
  erro(`distúrbio que existe só no dado não foi classificado — a tela ainda depende de código por distúrbio`);
if (G.degrauDeGravidade("nao-existe-este", 10) !== null)
  erro(`distúrbio desconhecido recebeu degrau por omissão — deveria ser null`);

console.log(falhas ? `\n❌ ${falhas} falha(s)` : `\n✅ ${degraus.length} degraus, ${cortesNumericos.length} cortes, todos com alvo de fonte nomeado · o componente não classifica · distúrbio só-no-dado classifica`);
process.exit(falhas ? 1 : 0);
