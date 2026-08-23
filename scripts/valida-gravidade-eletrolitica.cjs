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
const { lerFonte } = require("./lib/fonte.cjs");

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

// ── 3c. O CORTE MORA NA UNIDADE DA FONTE
//
// ⚠️ O DEFEITO QUE ISTO IMPEDE JÁ CUSTOU (D-90): alguém leu "1,9 mmol/L" na
// diretriz, converteu de cabeça, arredondou para 7 e digitou. A conta ficou FORA
// do repositório, e por isso ninguém a conferiu por meses — a faixa 7,00–7,62
// mg/dL ficou "leve a moderada" onde a fonte dizia GRAVE.
//
// ⚠️ E A MUTAÇÃO QUE ESTA REGRA TEM DE PEGAR NÃO MUDA O NÚMERO DA TELA: trocar
// `{ valor: 1.9, unidade: "mmol/L" }` por `{ valor: 7.6 }` exibe o mesmo 7,6 e
// mesmo assim é o defeito, porque a conta volta a sair do repositório.
{
  const EM_UNIDADE_DA_FONTE = {
    hypocalcemia: "mmol/L",
    hypercalcemia: "mmol/L",
  };
  for (const [disturbio, unidade] of Object.entries(EM_UNIDADE_DA_FONTE)) {
    const numericos = [];
    const colher = (c) => {
      if (["abaixoDe", "aPartirDe", "acimaDe", "faixa"].includes(c.tipo)) numericos.push(c);
      if (c.tipo === "combinado") { colher(c.faixa); colher(c.clinico); }
    };
    for (const g of G.GRAVIDADE_POR_DISTURBIO[disturbio]) g.cortes.forEach(colher);
    for (const c of numericos)
      if (c.unidade !== unidade)
        erro(`${disturbio}: corte numérico sem a unidade da fonte (${unidade}) — ele veio de uma diretriz que escreve em ${unidade}, e guardar o valor já convertido tira a conta do repositório (D-90)`);
    console.log(`  ${disturbio}: ${numericos.length} corte(s) numérico(s), todos em ${unidade} (unidade da fonte)`);
  }
}

// ── 3b-bis. CONDUTA NÃO É CLASSIFICAÇÃO — e `sinais` não é onde ela mora
//
// ⚠️ O ACHATAMENTO É INVISÍVEL NA TELA: mover o texto da conduta para dentro de
// `sinais` mostra AS MESMAS PALAVRAS ao usuário. É o defeito, não as palavras —
// e sem esta trava a distinção viraria prosa e sumiria na próxima edição.
{
  const comConduta = [];
  for (const d of disturbios)
    for (const g of G.GRAVIDADE_POR_DISTURBIO[d]) if (g.conduta) comConduta.push({ d, g });
  console.log(`  degraus com conduta própria: ${comConduta.length}`);

  for (const { d, g } of comConduta) {
    if (!g.conduta.procedencia?.alvo || g.conduta.procedencia.alvo.trim().length < 20)
      erro(`${d} · "${g.rotulo}": conduta sem procedência própria`);
    if (g.sinais.includes(g.conduta.texto))
      erro(`${d} · "${g.rotulo}": a conduta foi ACHATADA dentro de sinais — mesmas palavras na tela, camadas diferentes no dado`);
    if (g.rotulo === g.conduta.texto)
      erro(`${d} · "${g.rotulo}": rótulo e conduta são o mesmo texto — a classificação diz o que o caso É, a conduta diz o que muda a urgência`);
  }

  // ⚠️ O CASO NOMEADO: a faixa intermediária da hipercalcemia TEM conduta, e ela
  // é o texto do autor. Apagá-la ou mudá-la de campo reprova.
  const media = G.GRAVIDADE_POR_DISTURBIO.hypercalcemia.find((g) => g.rotulo === "Significativa");
  if (!media?.conduta)
    erro('hipercalcemia · "Significativa" perdeu a conduta própria — o texto do autor modula a urgência sem mudar a classificação, e enfiá-lo em `sinais` acha[ta] as duas camadas');
  // E a tela renderiza a conduta em lugar DISTINTO da classificação.
  if (media?.conduta && !/condutaDoDegrau/.test(tela))
    erro("a tela não renderiza a conduta em lugar próprio — sem isso o campo existe no dado e some para o usuário");
}

// ── 3b-ter. AS FAIXAS DE TOXICIDADE DO MAGNÉSIO NÃO PODEM CLASSIFICAR
//
// ⚠️ O autor deu a progressão aproximada (perda de reflexos ~8–10 mEq/L,
// depressão respiratória ~10–15, risco de parada ~25–30) e disse com todas as
// letras: **não são limites absolutos nem recomendação graduada**. São
// REFERÊNCIA DE PROGRESSÃO — a decisão considera sintomas, função renal e
// tendência da concentração.
//
// ⚠️ Estes números NÃO ESTÃO NO APP: a estrutura ainda não sabe guardar
// referência que não classifica, e a forma foi proposta antes de implementar
// (auditoria/PROPOSTA-REFERENCIA-QUE-NAO-CLASSIFICA.md). Esta trava existe para
// o dia em que alguém os digitar no lugar errado — que é o caminho mais curto
// entre "referência de progressão" e "corte de gravidade".
{
  // ⚠️ DERIVADA DO CAMPO, não escrita à mão. A lista era `[8, 10, 15, 25, 30]`
  // digitada aqui — uma segunda cópia dos mesmos números dentro da trava que
  // existe para impedir que eles virem número em outro lugar. Com
  // `referencias`, ela sai do próprio dado: um lugar só.
  const PROIBIDOS_COMO_CORTE = G.valoresQueNaoClassificam();
  console.log(`  referências que NÃO classificam: ${PROIBIDOS_COMO_CORTE.length} valor(es), derivados do campo`);
  const numericos = [];
  const colher = (c) => {
    if (["abaixoDe", "aPartirDe", "acimaDe"].includes(c.tipo)) numericos.push(c.valor);
    if (c.tipo === "faixa") numericos.push(c.de, c.ate);
    if (c.tipo === "combinado") { colher(c.faixa); colher(c.clinico); }
  };
  for (const d of ["hypomagnesemia", "hypermagnesemia"])
    for (const g of G.GRAVIDADE_POR_DISTURBIO[d]) g.cortes.forEach(colher);
  for (const v of numericos)
    if (PROIBIDOS_COMO_CORTE.includes(v))
      erro(`magnésio: ${v} virou corte de gravidade — é número da PROGRESSÃO DE TOXICIDADE, que o autor declarou não ser limite absoluto nem recomendação graduada. Referência de progressão não classifica`);
  // E o corte que saiu não pode voltar.
  if (numericos.includes(4.9))
    erro(`o corte ≥ 4,9 mg/dL da hipermagnesemia voltou — ele foi REMOVIDO em 2026-08-23 porque colide com a faixa esperada em magnesioterapia e mistura concentração terapêutica com toxicidade`);
  console.log(`  magnésio: ${numericos.length} corte(s) numérico(s) — nenhum da progressão de toxicidade`);

  // ⚠️ E "ALVO TERAPÊUTICO" É PROIBIDO EM QUALQUER LUGAR: a redação foi decidida
  // pelo autor, e a razão (a concentração para prevenir eclâmpsia não está
  // estabelecida com precisão) vai escrita junto — senão alguém "simplifica".
  const textos = JSON.stringify(G.GRAVIDADE_POR_DISTURBIO);
  if (/alvo terapêutico obrigat[óo]rio/i.test(textos.replace(/NÃO é alvo terapêutico obrigatório/gi, "")))
    erro('"alvo terapêutico obrigatório" apareceu como afirmação — a redação decidida é "faixa sérica tradicionalmente considerada terapêutica/esperada"');
}

// ── 3c-bis. O VALOR DE TELA É SAÍDA, NUNCA ENTRADA DA LÓGICA
//
// ⚠️ TRAVA DE UMA DECISÃO, e é o caminho pelo qual ela seria desfeita sem ninguém
// perceber. O autor decidiu (2026-08-23) que o corte canônico é > 3,5 mmol/L e
// que 14,0 mg/dL exatos NÃO entram em correção urgente por número isolado —
// porque 3,5 mmol/L = 14,03. Basta alguém arredondar 14,03 para 14,0 na EXIBIÇÃO
// e, três meses depois, outra pessoa ler "14,0" na tela e escrever `>= 14` na
// comparação: a decisão volta ao contrário e o commit parece cosmético.
{
  // (a) a comparação usa o valor EXATO na unidade da fonte
  const em14 = G.degrauDeGravidade("hypercalcemia", 14.0);
  const em14e1 = G.degrauDeGravidade("hypercalcemia", 14.1);
  if (em14?.rotulo !== "Significativa")
    erro(`14,0 mg/dL devolveu « ${em14?.rotulo} » — a decisão do autor é que 14,0 exatos NÃO entram em correção urgente por número isolado (3,5 mmol/L = 14,03). O valor de tela é derivado e arredondado; classificar por ele desfaz a decisão`);
  if (em14e1?.rotulo !== "Correção urgente")
    erro(`14,1 mg/dL devolveu « ${em14e1?.rotulo} » — acima de 14,03 tem de ser correção urgente`);

  // (b) nenhum corte de classificação guarda o número ARREDONDADO DA EXIBIÇÃO
  // ⚠️ SEM COMENTÁRIO: o arquivo EXPLICA a decisão citando 14,03 e 7,62, e uma
  // leitura crua acusaria a própria explicação — o mesmo defeito que já corrigi
  // duas vezes nesta sequência.
  const fonteDaGravidade = lerFonte(path.join(RAIZ, "lib", "eletrolitos", "gravidade.ts"));
  const suspeitos = [...fonteDaGravidade.matchAll(/(?:valor|de|ate):\s*(14|7\.6|12|12\.02|14\.03|7\.62)\b/g)];
  for (const m of suspeitos)
    erro(`corte guardando o número da EXIBIÇÃO (${m[1]}) — o valor convertido é saída; a comparação usa o exato na unidade da fonte`);

  // (c) e a faixa aparece nas DUAS unidades para quem digita em mg/dL
  const texto = G.corteDoDegrau("hypercalcemia", G.GRAVIDADE_POR_DISTURBIO.hypercalcemia[0]);
  if (!texto || !/mmol\/L/.test(texto) || !/mg\/dL/.test(texto))
    erro(`o corte da hipercalcemia não sai nas duas unidades: « ${texto} »`);
  else console.log(`  corte exibido: ${texto}`);
}

// ── 3d. O IONIZADO NÃO RECEBE O CORTE DO TOTAL/AJUSTADO
//
// ⚠️ Proibição explícita do autor, e é o erro mais provável desta rodada: o
// número está ali do lado, na mesma estrutura. Conferido pelo COMPORTAMENTO.
{
  const baixo = 6.0; // mg/dL — grave por qualquer corte de total/ajustado
  const comoTotal = G.degrauDeGravidade("hypocalcemia", baixo, false, false, "total");
  const comoIonizado = G.degrauDeGravidade("hypocalcemia", baixo, false, false, "ionico");
  if (comoTotal?.rotulo !== "Grave")
    erro(`o corte do total/ajustado deixou de funcionar: ${baixo} mg/dL devolveu ${JSON.stringify(comoTotal?.rotulo)}`);
  if (comoIonizado !== null)
    erro(`⚠️ O CORTE DO TOTAL/AJUSTADO ALCANÇOU UM VALOR DE IONIZADO: ${baixo} declarado como ionizado devolveu « ${comoIonizado?.rotulo} ». Proibição explícita do autor — o ionizado não tem faixa de gravidade neste app`);
  const ionizadoComSintoma = G.degrauDeGravidade("hypocalcemia", baixo, false, true, "ionico");
  if (ionizadoComSintoma?.rotulo !== "Grave")
    erro(`o ramo sintomático deixou de responder ao ionizado — era ele que tirava o beco de quem tem o melhor exame`);
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
