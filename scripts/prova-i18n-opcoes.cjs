/**
 * PROMETE: que TODA opção tocável e TODO rótulo de grau das superfícies do AVC
 *   tenha par em espanhol — inclusive os que ⛔ nenhuma varredura de texto
 *   alcança: palavra curta sem acento ("Incerto") e rótulo **montado em tempo de
 *   execução** (`grau · descritor` do mRS). Confere também que o par ⛔ não seja
 *   a própria string portuguesa por engano, quando ela deveria mudar.
 * NÃO PROMETE: que a tradução esteja CERTA — isso é revisão humana. ⛔ Também não
 *   cobre prosa: frases exibíveis continuam sendo `test:i18n`
 *   (`varredura-pt.cjs`), que lê o fonte, e `test:traducao-runtime`, que lê o
 *   artefato compilado.
 * UNIVERSO: as opções de TODOS os campos de `TODOS_OS_CAMPOS_A`,
 *   `TODOS_OS_CAMPOS_B`, `TODOS_OS_CAMPOS_C` e `TODOS_OS_CAMPOS_P`, contadas
 *   com piso, mais os graus
 *   de `GRAUS_MRS`. ⛔ Fora do universo: qualquer módulo que ⛔ não seja o AVC.
 *
 * ── POR QUE ESTA TRAVA EXISTE (2026-08-29) ─────────────────────────────────
 *
 * `varredura-pt.cjs` procura **prosa em português** no código-fonte, e declara
 * essa fronteira no próprio cabeçalho. Duas coisas passam por baixo dela, e as
 * duas foram medidas na revisão da Superfície C:
 *
 *   · **"Incerto"** — sete letras, sem acento, ⛔ não parece prosa. Estava sem par
 *     desde a Superfície B, em doze campos, com a varredura dizendo
 *     «SEM TRADUÇÃO: 0» e a tela espanhola mostrando a palavra portuguesa;
 *   · **os seis graus do mRS** — o rótulo é `${grau} · ${descritor}`, montado em
 *     tempo de execução. A string que a tela recebe ⛔ **não existe como literal
 *     em lugar nenhum**, e por isso ⛔ nenhum leitor de texto poderia achá-la.
 *
 * ⚠️ A correção ⛔ não é endurecer a heurística de prosa — é **carregar o módulo e
 * enumerar as opções de verdade**, que é o que esta trava faz.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-i18n-opcoes-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--rootDir", appDir, "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-b.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-c.ts"),
  path.join(appDir, "avc", "conteudo", "paciente.ts"),
  path.join(appDir, "avc", "conteudo", "laboratorio.ts"),
  path.join(appDir, "avc", "conteudo", "mrs.ts"),
], { cwd: appDir, stdio: "pipe" });

const A = require(path.join(tmp, "avc", "conteudo", "superficie-a.js"));
const B = require(path.join(tmp, "avc", "conteudo", "superficie-b.js"));
const C = require(path.join(tmp, "avc", "conteudo", "superficie-c.js"));
const M = require(path.join(tmp, "avc", "conteudo", "mrs.js"));
const P = require(path.join(tmp, "avc", "conteudo", "paciente.js"));
const L = require(path.join(tmp, "avc", "conteudo", "laboratorio.js"));

/**
 * ⚠️ O dicionário é lido SEM COMENTÁRIO: uma chave citada dentro de um comentário
 * satisfaria a busca e ⛔ não traduziria nada na tela (R-92).
 */
const dicionario = lerFonte(path.join(appDir, "lib", "i18n", "modules", "avc-modulo.ts"));
const temPar = (s) => dicionario.includes(`"${s}":`);

/**
 * ⚠️ **Paciente** entrou em 2026-08-29 e traz ~40 opções novas — antecedentes e
 * medicações. É o maior universo de rótulo curto do módulo, e portanto o de
 * maior risco para o defeito que esta trava nasceu para pegar.
 */
const campos = [
  ...P.TODOS_OS_CAMPOS_P,
  ...L.TODOS_OS_CAMPOS_L,
  ...A.TODOS_OS_CAMPOS_A,
  ...B.TODOS_OS_CAMPOS_B,
  ...C.TODOS_OS_CAMPOS_C,
];

// ── 0 · O UNIVERSO EXISTE ────────────────────────────────────────────────
{
  confere("os cinco conjuntos de campos foram carregados",
    campos.length >= 60,
    "trava que roda sobre lista vazia fica verde sem medir nada (R-1)");
  const opcoes = campos.flatMap((c) => c.opcoes ?? []);
  confere("há opções a conferir, e ⛔ não uma lista vazia",
    opcoes.length >= 120,
    "se ⛔ nenhum campo declarasse opção, esta trava passaria sem olhar para nada");
}

// ── 1 · TODA OPÇÃO TOCÁVEL TEM PAR EM ESPANHOL ───────────────────────────
{
  const semPar = campos
    .flatMap((c) => (c.opcoes ?? []).map((o) => ({ campo: c.id, opcao: o })))
    .filter((x, i, todas) => todas.findIndex((y) => y.opcao === x.opcao) === i)
    .filter((x) => !temPar(x.opcao));
  confere("toda opção tocável das superfícies do AVC tem par em espanhol",
    semPar.length === 0,
    `§7.17: o app é PT-BR e ES desde o primeiro commit — ${semPar.map((x) => `${x.opcao} (${x.campo})`).join(" · ")}`);
}

/**
 * ⚠️⚠️ SEÇÃO 1b · E O PAR ⛔ NÃO PODE SER A PRÓPRIA PALAVRA PORTUGUESA.
 *
 * ⚠️ A seção 1 pergunta se a chave **existe**. `"Leve": "Leve"` satisfaz essa
 * pergunta ⛔ e ⛔ não traduz nada — é ausência com aparência de presença. A
 * regra já existia ⛔ e cobria só os seis graus do mRS; um campo novo de B caiu
 * exatamente no vão. Aqui ela passa a valer para **toda opção tocável**.
 *
 * ⚠️ A lista é EXPLÍCITA porque algumas palavras são mesmo iguais nos dois
 * idiomas. ⛔ Sem ela a trava acusaria inocente e alguém a desligaria (R-55);
 * implícita, uma tradução esquecida se esconderia atrás de "deve ser igual".
 */
{
  const IGUAIS_EM_ESPANHOL = [
    "Leve",                      // "leve" tem a mesma forma nos dois idiomas
    "Incapacitante",             // idem
    "Bilateral",                 // idem
    "Paciente",                  // idem
    "Uso de droga recreativa",   // a frase inteira coincide
    "4 · moderada a grave",      // descritor do mRS, já declarado na seção 2
    "5 · grave",                 // idem
    "SAMU",                      // sigla de serviço, ⛔ não se traduz
    "/mm³",                      // unidade
    "mil/mm³ (×10³/µL)",         // unidade
  ];
  const opcoes = [...new Set(campos.flatMap((c) => c.opcoes ?? []))];
  /** ⚠️ R-1: declaração sobre opção que ⛔ não existe mais é desculpa órfã. */
  const orfas = IGUAIS_EM_ESPANHOL.filter((o) => !opcoes.includes(o));
  confere("toda declaração de 'é igual em espanhol' aponta para uma opção VIVA",
    orfas.length === 0,
    `a lista de exceções envelhece junto com os campos; exceção órfã vira permissão silenciosa para a próxima — ${orfas.join(" · ")}`);
  const espelhadas = opcoes
    .filter((o) => dicionario.includes(`"${o}": "${o}"`))
    .filter((o) => !IGUAIS_EM_ESPANHOL.includes(o));
  confere("⛔ NENHUMA opção aponta para a própria string portuguesa sem declaração",
    espelhadas.length === 0,
    `chave que aponta para si mesma passa a seção 1 e continua mostrando português na tela espanhola — ${espelhadas.join(" · ")}`);
  confere("e as declaradas como iguais REALMENTE estão no dicionário",
    IGUAIS_EM_ESPANHOL.every((o) => temPar(o)),
    "declarar 'é igual' sobre chave que ⛔ não existe é a desculpa cobrindo a ausência");
}

// ── 2 · TODO RÓTULO DE GRAU DO mRS TEM PAR ───────────────────────────────
{
  /**
   * ⚠️⚠️ O RÓTULO MONTADO — o caso que ⛔ nenhuma varredura de texto alcança.
   * Ele é construído aqui do mesmo jeito que a tela o constrói: se a montagem
   * mudar, esta trava passa a conferir a string nova, e ⛔ não a antiga.
   */
  const rotulos = M.GRAUS_MRS.map((g) => M.rotuloDoGrau(g));
  confere("a escala inteira do mRS foi carregada",
    rotulos.length === 7,
    "0 a 6: a escala neutra é publicada assim pela fonte, e o filtro do campo é outro");
  const semPar = rotulos.filter((r) => !temPar(r));
  confere("todo grau do mRS tem par em espanhol, com o rótulo INTEIRO",
    semPar.length === 0,
    `o rótulo é montado (grau · descritor) e é ele que o tr() recebe: traduzir só o descritor deixa a string composta sem par (R-82) — ${semPar.join(" · ")}`);

  /**
   * ⚠️ E o par ⛔ não pode ser a própria frase portuguesa: os descritores MUDAM em
   * espanhol. Deixar a chave apontando para si mesma passaria a trava acima e
   * continuaria mostrando português na tela espanhola — que é o defeito inteiro.
   */
  /**
   * ⚠️ E DOIS DELES SÃO LEGITIMAMENTE IGUAIS — declarados aqui, um a um, com o
   * motivo. ⛔ Sem a lista, a trava acusaria inocente e alguém a desligaria
   * (R-55); com a lista **implícita**, uma tradução esquecida se esconderia
   * atrás da desculpa de "deve ser igual".
   */
  const IGUAIS_EM_ESPANHOL = [
    "4 · moderada a grave", // "moderada a grave" tem a mesma forma nos dois idiomas
    "5 · grave",            // "grave" tem a mesma forma nos dois idiomas
  ];
  const identicos = rotulos
    .filter((r) => dicionario.includes(`"${r}": "${r}"`))
    .filter((r) => !IGUAIS_EM_ESPANHOL.includes(r));
  confere("⛔ nenhum grau do mRS aponta para a própria string portuguesa sem declaração",
    identicos.length === 0,
    `"discapacidad leve" ⛔ não é "leve incapacidade" — chave que aponta para si mesma é tradução ausente com aparência de presente — ${identicos.join(" · ")}`);
  confere("e os declarados como iguais REALMENTE estão no dicionário",
    IGUAIS_EM_ESPANHOL.every((r) => temPar(r)),
    "declarar 'é igual' sobre uma chave que ⛔ não existe é a desculpa cobrindo a ausência");
}

// ── 3 · A PROCEDÊNCIA DO ESPANHOL ESTÁ DECLARADA ─────────────────────────
{
  /**
   * ⚠️⚠️ A DECISÃO DO AUTOR TEM DUAS METADES, e a segunda é a que se perde: o
   * espanhol é **tradução de apresentação**, e ⛔ **não** fonte independente. Sem
   * a declaração escrita, a próxima pessoa lê a tabela ES e a cita como se fosse
   * uma versão validada do mRS em espanhol — que ⛔ não existe aqui.
   */
  const fonteMrs = lerFonte(path.join(appDir, "protocols", "fontes-verbatim", "mrs-br.md"));
  confere("`mrs-br.md` declara que o espanhol é tradução de apresentação",
    /tradução de apresentação/i.test(fonteMrs) && /não .*fonte independente/i.test(fonteMrs),
    "E-30: sem a declaração, a versão ES vira procedência inventada na primeira vez que alguém a citar");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DE i18n DAS OPÇÕES — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DE i18n DAS OPÇÕES — ${ok}/${ok} conferências`);
