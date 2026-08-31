/**
 * PROMETE: que F leia as recomendações da diretriz **uma a uma**, preservando
 *   marco, força e verbo — e que ⛔ nunca produza veredito agregado.
 * NÃO PROMETE: que a fiação com A–E exista. Ela ⛔ **não** existe ainda: esta
 *   rodada fecha o modelo, e a tela ⛔ não foi desenhada.
 * UNIVERSO: `superficie-f.ts` + `derivacoes-f.ts`, executados, com piso.
 *
 * ── ⚠️⚠️ O ERRO QUE ESTA PROVA EXISTE PARA IMPEDIR ────────────────────────
 *
 * ⛔ Transformar uma diretriz com **populações sobrepostas, cinco relógios e
 * forças graduadas** num algoritmo binário de *"elegível / ⛔ não elegível"*.
 *
 * ⚠️ A fonte adverte disso ⛔ ela mesma, em F-08: *"`EVT elegível = sim/não`
 * ⛔ **NÃO** é fato armazenado"*.
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

/**
 * ⚠️ Os dois arquivos compilam **juntos**: `derivacoes-f` importa o catálogo, e
 * o `tsc` preserva a estrutura de diretórios relativa à raiz comum.
 */
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "prova-f-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
  path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-f.ts"),
], { cwd: appDir, stdio: "pipe" });
const C = require(path.join(tempDir, "conteudo", "superficie-f.js"));
const D = require(path.join(tempDir, "nucleo", "derivacoes-f.js"));

// ── ⚠️ R-1 · piso ─────────────────────────────────────────────────────────
confere("o catálogo tem recomendações", C.RECOMENDACOES.length >= 15,
  "⛔ varredura sobre o vazio ⛔ não mede ⛔ nada");

// ── ⚠️⚠️ 1 · OS CINCO RELÓGIOS ────────────────────────────────────────────
const marcos = new Set(C.RECOMENDACOES.flatMap((r) => r.janelas.map((j) => j.marco)));
confere("⚠️⚠️ os CINCO marcos estão preservados",
  ["symptom_onset", "last_known_well", "onset_ou_lkw", "symptom_recognition", "midpoint_of_sleep"]
    .every((m) => marcos.has(m)),
  `⛔ a fonte usa cinco relógios e ⛔ não os converte — achatá-los apagaria a diferença que decide qual recomendação se aplica. Presentes: ${[...marcos].join(", ")}`);

confere("⚠️⚠️ ⛔ ⛔ ⛔ NÃO existe marco agregado",
  ![...marcos].some((m) => /janela|dentro|tempo_desde/i.test(m)),
  "⛔ `dentro_da_janela` global apagaria os cinco relógios num só");

const dois = C.RECOMENDACOES.find((r) => r.id === "ivt_wakeup_ou_45_9");
confere("⚠️⚠️ uma recomendação carrega DOIS marcos alternativos",
  dois && dois.janelas.length === 2 &&
    dois.janelas[0].marco === "midpoint_of_sleep" && dois.janelas[1].marco === "last_known_well",
  "§4.6.3 rec. 2 tem 9 h do *midpoint of sleep* OU 4,5–9 h do LKW — ⛔ durações diferentes, ⛔ não conversíveis");

confere("⚠️ toda janela carrega o verbatim da fonte",
  C.RECOMENDACOES.every((r) => r.janelas.every((j) => typeof j.verbatim === "string" && j.verbatim.length > 8)),
  "⛔ **E-31**: ⛔ nenhum número clínico sem a frase que o sustenta");

confere("⚠️ recomendação sem janela é permitida",
  C.RECOMENDACOES.find((r) => r.id === "ivt_rapidez").janelas.length === 0,
  "§4.6.1 rec. 1 é afirmação sobre **velocidade**, ⛔ não sobre prazo — forçar janela inventaria uma");

// ── ⚠️⚠️ 2 · QUATRO ESTADOS, ⛔ E ⛔ NÃO DOIS ──────────────────────────────
const sat = () => "satisfaz";
const nada = () => undefined;
const contra = () => "contradiz";

confere("⚠️ tudo presente e compatível ⇒ `aplicavel`",
  D.correspondenciaDe(["nihss", "mrs_previo"], sat).correspondencia === "aplicavel",
  "⛔ sem isto a leitura ⛔ nunca conclui");

confere("⚠️⚠️ ⛔ insumo AUSENTE ⇒ `potencialmente_aplicavel`, ⛔ e ⛔ NÃO `nao_corresponde`",
  D.correspondenciaDe(["nihss", "mrs_previo"], (i) => (i === "nihss" ? "satisfaz" : undefined))
    .correspondencia === "potencialmente_aplicavel",
  "⛔ **unknown ≠ negative** (E-02): ausência ⛔ não é resposta contrária");

confere("⚠️⚠️ e a leitura NOMEIA o que falta",
  D.correspondenciaDe(["nihss", "mrs_previo"], (i) => (i === "nihss" ? "satisfaz" : undefined))
    .faltam.join() === "mrs_previo",
  '⛔ "talvez" genérico ⛔ não diz ao médico o que colher');

confere("⚠️⚠️ insumo INCOMPATÍVEL ⇒ `nao_corresponde`",
  D.correspondenciaDe(["nihss"], contra).correspondencia === "nao_corresponde",
  "resposta presente e fora do critério é **resposta**, ⛔ não ausência");

confere("⚠️⚠️ ⛔ incompatível VENCE dado faltante",
  D.correspondenciaDe(["nihss", "mrs_previo"], (i) => (i === "nihss" ? "contradiz" : undefined))
    .correspondencia === "nao_corresponde",
  "⛔ critério já contrariado ⛔ não vira potencial esperando outro dado chegar");

confere("⚠️⚠️ ⛔ dívida de fonte ⇒ `nao_avaliavel`, mesmo com TUDO presente",
  D.correspondenciaDe(["nihss"], sat, "F-31").correspondencia === "nao_avaliavel",
  "⛔ se a pré-condição ⛔ não é determinável, a correspondência ⛔ não é determinável");

confere("⚠️⚠️ ⛔ mas incompatível ainda vence a dívida",
  D.correspondenciaDe(["nihss"], contra, "F-31").correspondencia === "nao_corresponde",
  "⛔ o paciente está fora do critério **independentemente** da dívida — dizer `nao_avaliavel` esconderia uma resposta que existe");

// ── ⚠️⚠️ 3 · F-31 TRAVA AS DUAS, E ⛔ SÓ AS DUAS ──────────────────────────
const travadas = C.RECOMENDACOES.filter((r) => r.travadaPor === "F-31").map((r) => r.id);
confere("⚠️⚠️ F-31 trava as recs. 2 e 3 de §4.6.3",
  travadas.length === 2 && travadas.includes("ivt_wakeup_ou_45_9") && travadas.includes("ivt_lvo_sem_evt"),
  `⛔ "not eligible for EVT" e "cannot receive EVT" ⛔ não são definidas pela fonte — encontradas: ${travadas.join(", ")}`);

const todas = D.leiturasDasRecomendacoes(sat);
confere("⚠️⚠️ ⛔ e F-31 ⛔ NÃO bloqueia o resto de F",
  todas.filter((l) => l.correspondencia === "aplicavel").length >= 10,
  "⛔ uma dívida numa pré-condição ⛔ não pode paralisar a superfície inteira");

confere("⚠️ a leitura travada NOMEIA a dívida",
  todas.find((l) => l.id === "ivt_lvo_sem_evt").travadaPor === "F-31",
  "⛔ `nao_avaliavel` sem dizer **por quê** ⛔ não é informação");

/**
 * ⚠️⚠️ F-29 ⛔ NÃO TRAVA RECOMENDAÇÃO ⛔ NENHUMA — e a razão é a mesma de F-28.
 *
 * ⛔ Eu tinha travado as recs. 3 e 4 por F-29, e estava errado. C ⛔ não registra
 * *presença* de efeito de massa: ⛔ ele registra o **julgamento sobre
 * significância**, com a expressão da fonte e a nota de que ⛔ ela ⛔ não define
 * medida.
 *
 * ⚠️ F-29 proíbe **calcular** significância e **dizer como** decidir — ⛔ não
 * proíbe consumir o julgamento de quem interpreta a imagem. ⚠️ É a mesma
 * fronteira de F-28: calcular ASPECTS trava; consumir o informado ⛔ não.
 */
confere("⚠️⚠️ ⛔ F-29 ⛔ NÃO trava recomendação ⛔ nenhuma",
  C.RECOMENDACOES.every((r) => r.travadaPor !== "F-29"),
  "⛔ travá-las deixaria `nao_avaliavel` um paciente cujo radiologista já respondeu — e F-29 proíbe **calcular**, ⛔ não **consumir**");

confere("⚠️ e as recs. 3 e 4 continuam EXIGINDO o insumo",
  ["evt_ant_3", "evt_ant_4"].every((id) =>
    C.RECOMENDACOES.find((r) => r.id === id).exige.includes("efeito_de_massa_ausente")),
  '⛔ elas exigem *"without significant mass effect"* — tirar o insumo apagaria o critério');

// ── ⚠️⚠️ 4 · ⛔ NENHUM VEREDITO AGREGADO ──────────────────────────────────
const fonteD = lerFonte(path.join(appDir, "avc", "nucleo", "derivacoes-f.ts"));
confere("⚠️⚠️ ⛔ ⛔ ⛔ ⛔ NÃO existe booleano de elegibilidade",
  !/elegivel[A-Za-z]*\s*[:=]|podeTrombolisar|pode_trombolisar/i.test(fonteD),
  "⛔ a própria fonte adverte: *`EVT elegível = sim/não` ⛔ NÃO é fato armazenado*");

confere("⚠️ a derivação devolve LISTA, ⛔ e ⛔ não escolha",
  Array.isArray(todas) && todas.length === C.RECOMENDACOES.length,
  "⛔ um paciente corresponde a **várias** — escolher 'a melhor' silenciosamente esconderia as outras");

confere("⚠️⚠️ ⛔ ⛔ nenhuma recomendação é filtrada na derivação",
  D.leiturasDasRecomendacoes(nada).length === C.RECOMENDACOES.length,
  "⛔ filtrar aqui esconderia da tela que uma recomendação **existe e ⛔ não pôde ser avaliada**");

// ── ⚠️⚠️ 5 · FORÇA E VERBO PRESERVADOS ────────────────────────────────────
confere("⚠️⚠️ ⛔ `not recommended` ⛔ NUNCA vira 'contraindicado'",
  !/contraindicad/i.test(fonteD) && !/contraindicad/i.test(lerFonte(path.join(appDir, "avc", "conteudo", "superficie-f.ts"))),
  "⛔ a fonte escreveu *not recommended* / *No Benefit* — converter inventaria força que ela ⛔ não deu");

const m2d = C.RECOMENDACOES.find((r) => r.id === "evt_m2_dominante");
const m2n = C.RECOMENDACOES.find((r) => r.id === "evt_m2_nao_dominante");
confere("⚠️⚠️ M2 dominante × ⛔ NÃO dominante são recomendações SEPARADAS",
  m2d && m2n && m2d.cor === "2a" && m2n.cor === "3: No Benefit",
  "⛔ achatar em 'oclusão de M2' inverteria a recomendação para metade dos pacientes");

const tnk25 = C.RECOMENDACOES.find((r) => r.id === "ivt_agente");
const tnk04 = C.RECOMENDACOES.find((r) => r.id === "ivt_tnk_04");
confere("⚠️⚠️ TNK 0,25 e 0,4 são regras OPOSTAS, ⛔ nunca faixa",
  tnk25.cor === "1" && tnk04.cor === "3: No Benefit",
  '⛔ representar como intervalo "0,25–0,4" inverteria o sentido da fonte');

confere("⚠️ todo COR e LOE vêm verbatim",
  C.RECOMENDACOES.every((r) => r.cor.length > 0 && r.loe.length > 0 && r.verbo.length > 3),
  "⛔ força sem verbo é recomendação sem gradiente");

// ── ⚠️⚠️ 6 · NEGATIVAS APARECEM ⛔ SÓ QUANDO CORRESPONDEM ─────────────────
confere("⚠️⚠️ alerta negativo aparece quando a população corresponde",
  D.alertasNegativos(D.leiturasDasRecomendacoes(sat)).length >= 2,
  "⛔ omitir a recomendação negativa deixaria a tela mostrar ⛔ apenas as opções favoráveis — e isso **distorce a diretriz**");

confere("⚠️⚠️ ⛔ e ⛔ NÃO aparece quando ⛔ não corresponde",
  !D.alertasNegativos(D.leiturasDasRecomendacoes(contra)).some((l) => l.id === "evt_m2_nao_dominante"),
  "⛔ lista fixa de 'não fazer' vira ruído e ⛔ não informa sobre **este** paciente");

/**
 * ⚠️⚠️ Uma recomendação sobre **dose de um fármaco** ⛔ não pode aparecer para
 * quem ⛔ não está considerando aquele fármaco.
 *
 * ⛔ A trava pegou isto: `ivt_tnk_04` ⛔ não exigia insumo ⛔ nenhum, então era
 * `aplicavel` **sempre** — e alertava sobre TNK 0,4 mg/kg até para quem vai
 * receber alteplase.
 */
confere("⚠️⚠️ ⛔ recomendação de dose exige o agente em consideração",
  C.RECOMENDACOES.find((r) => r.id === "ivt_tnk_04").exige.includes("agente_e_tenecteplase"),
  "⛔ sem isso o alerta de TNK 0,4 apareceria para todo paciente");

/**
 * ⚠️⚠️ O INVARIANTE, na forma geral: **⛔ nenhuma recomendação NEGATIVA pode ter
 * zero insumos.**
 *
 * ⛔ Recomendação sem insumo é `aplicavel` **sempre**. Numa COR 1 isso é correto
 * — *"inicie o quanto antes"* vale para todo elegível. ⚠️ Numa **COR 3** seria um
 * alerta permanente de *"⛔ não faça"* sobre um paciente que talvez ⛔ nem esteja
 * naquela população.
 */
const negativasSemInsumo = C.RECOMENDACOES
  .filter((r) => r.cor.startsWith("3") && r.exige.length === 0)
  .map((r) => r.id);
confere("⚠️⚠️ ⛔ ⛔ NENHUMA recomendação negativa tem zero insumos",
  negativasSemInsumo.length === 0,
  `⛔ ela alertaria para todo paciente — encontradas: ${negativasSemInsumo.join(", ")}`);

// ── ⚠️⚠️ 7 · DOSE ⛔ NÃO É PREPARO ────────────────────────────────────────
confere("⚠️⚠️ ⛔ ⛔ SEM PESO ⛔ NÃO EXISTE DOSE",
  D.doseDerivada("alteplase", undefined, "medido") === undefined &&
    D.doseDerivada("alteplase", 70, undefined) === undefined,
  "⛔ ⛔ ⛔ não estimar, ⛔ não assumir 70 kg — dose fabricada é a pior espécie de E-52");

confere("⚠️ a dose sai do peso, com o teto da fonte",
  D.doseDerivada("alteplase", 70, "medido").totalMg === 63 &&
    D.doseDerivada("alteplase", 120, "medido").totalMg === 90 &&
    D.doseDerivada("tenecteplase", 70, "medido").totalMg === 17.5 &&
    D.doseDerivada("tenecteplase", 200, "medido").totalMg === 25,
  "0,9 mg/kg máx 90 · 0,25 mg/kg máx 25 (F-09)");

confere("⚠️⚠️ a ORIGEM do peso viaja com a dose",
  D.doseDerivada("alteplase", 70, "estimado").origemDoPeso === "estimado",
  "⛔ medido e estimado ⛔ não se confundem — a dose carrega de onde veio");

confere("⚠️⚠️ ⛔ ⛔ ⛔ cálculo ⛔ NÃO produz preparo ⛔ nem administração",
  !/preparo|reconstitu|diluent|equipo|bolus|infus|administrar/i.test(fonteD),
  "⛔ F-20 está **parcial**, e para TNK a indicação para AVC e o preparo ⛔ NÃO estão confirmados por fonte primária");

// ── ⚠️⚠️ 8 · OPERACIONAL ⛔ NÃO SATISFAZ PRÉ-CONDIÇÃO CLÍNICA ─────────────
confere("⚠️⚠️ ⛔ disponibilidade ⛔ NÃO entra na correspondência",
  !/centroEvt[\s\S]{0,200}?correspondencia|correspondencia[\s\S]{0,200}?centroEvt/.test(fonteD),
  '⛔ F-03 §12: disponibilidade é *"DISPONIBILIDADE / LOCALIZAÇÃO, ⛔ nunca contraindicação clínica"* — usá-la transformaria **geografia em critério clínico**');

confere("⚠️ e `desconhecido` é valor de primeira classe no contexto operacional",
  /desconhecido/.test(fonteD),
  "⛔ ausência de informação operacional ⛔ não é 'não disponível'");

// ── ⚠️⚠️ 9 · IVT e EVT ⛔ NÃO SÃO EXCLUSIVAS ──────────────────────────────
const fonteC = lerFonte(path.join(appDir, "avc", "conteudo", "superficie-f.ts"));
confere("⚠️⚠️ o paralelismo IVT × EVT está declarado, com COR 1 · LOE A",
  C.IVT_E_EVT_EM_PARALELO.cor === "1" && C.IVT_E_EVT_EM_PARALELO.loe === "A",
  '⛔ *"a strategy to forgo (or skip) IVT to facilitate EVT is not recommended"*');

confere("⚠️⚠️ ⛔ ⛔ e ⛔ NENHUMA exclusividade implícita entre as duas frentes",
  !/exclusiv|ou_evt|apenas_ivt|somente_evt/i.test(fonteD + fonteC),
  "⛔ tratar uma como exclusão automática da outra contrariaria COR 1 · LOE A");

const ivt = todas.filter((l) => l.terapia === "ivt" && l.correspondencia === "aplicavel");
const evt = todas.filter((l) => l.terapia === "evt" && l.correspondencia === "aplicavel");
confere("⚠️⚠️ as duas frentes podem estar aplicáveis ao MESMO tempo",
  ivt.length > 0 && evt.length > 0,
  "⛔ é ⛔ exatamente o que §4.7.1 rec. 1 recomenda");

// ── ⚠️⚠️ 10 · A FIAÇÃO COM A–E, EXECUTADA ────────────────────────────────
const E = (() => {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "prova-fe-"));
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", t,
    path.join(appDir, "avc", "nucleo", "estado.ts"),
    path.join(appDir, "avc", "nucleo", "relogio.ts"),
  ], { cwd: appDir, stdio: "pipe" });
  return require(path.join(t, "estado.js"));
})();

/** ⚠️ A MESMA função que a tela usa para gravar — ⛔ nunca uma cópia. */
const CAMPO = (() => {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "prova-f-campo-"));
  execFileSync("npx", [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--rootDir", path.join(appDir, "avc"),
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", t,
    path.join(appDir, "avc", "conteudo", "campo.ts"),
  ], { cwd: appDir, stdio: "pipe" });
  return require(path.join(t, "conteudo", "campo.js"));
})();

/**
 * ⚠️⚠️ ESTADO MÍNIMO — GRAVADO COMO A TELA GRAVA, ⛔ e ⛔ não como eu escrevo.
 *
 * ⚠️⚠️ ESTA FUNÇÃO JÁ FOI O DEFEITO. Ela inseria o RÓTULO (`"Sim"`) direto no
 * estado, ⛔ e a tela grava `valorDaOpcao("Sim")`, que é `"sim"`. As derivações
 * comparavam com o rótulo ⛔ e ficavam eternamente `undefined` no app real —
 * ⛔ enquanto TODA conferência daqui passava verde.
 *
 * ⚠️ Trava que fabrica o próprio estado ⛔ não mede o app: mede a si mesma.
 * Passar por `valorDaOpcao` faz o vazio da prova ser o vazio de verdade.
 */
function com(fatos) {
  let e = E.estadoInicial ? E.estadoInicial() : { fatos: [] };
  for (const [campo, valor] of fatos) {
    const gravado = typeof valor === "string" ? CAMPO.valorDaOpcao(valor) : valor;
    e = { ...e, fatos: [...e.fatos, { id: String(e.fatos.length + 1), campo, valor: gravado }] };
  }
  return e;
}
const vi = (fatos, insumo) => D.valorDoInsumo(com(fatos), insumo);

// ── ⚠️⚠️ déficit leve NÃO incapacitante — DUAS propriedades ───────────────
confere("⚠️⚠️ ⛔ \"Não incapacitante\" sozinho ⛔ NÃO satisfaz leve+não-incapacitante",
  vi([["incapacitante_assumido", "Não incapacitante"]], "deficit_leve_nao_incapacitante") === undefined,
  "⛔ B ⛔ não representa **leve** — afirmar satisfaz declararia *IVT not recommended* sobre déficit que pode ⛔ não ser leve");

confere("⚠️⚠️ e \"Incapacitante\" CONTRADIZ essa população",
  vi([["incapacitante_assumido", "Incapacitante"]], "deficit_leve_nao_incapacitante") === "contradiz",
  "quem tem déficit incapacitante ⛔ não está na população da rec. 8");

confere("⚠️ o eixo incapacitante, por sua vez, resolve nos dois sentidos",
  vi([["incapacitante_assumido", "Incapacitante"]], "deficit_incapacitante") === "satisfaz" &&
    vi([["incapacitante_assumido", "Não incapacitante"]], "deficit_incapacitante") === "contradiz" &&
    vi([["incapacitante_assumido", "Incerto"]], "deficit_incapacitante") === undefined,
  "⛔ \"Incerto\" é decisão registrada, ⛔ mas ⛔ não sustenta a população");

// ── ⚠️⚠️ efeito de massa · a assimetria real ─────────────────────────────
confere("⚠️⚠️ \"Não\" satisfaz *without significant mass effect*",
  vi([["efeito_de_massa", "Não"]], "efeito_de_massa_ausente") === "satisfaz",
  "C pergunta pelo **significativo**, com a expressão da fonte — a resposta é o julgamento do intérprete");

confere("⚠️⚠️ ⛔ \"Sim\" CONTRADIZ, ⛔ e ⛔ não vira indeterminado",
  vi([["efeito_de_massa", "Sim"]], "efeito_de_massa_ausente") === "contradiz",
  "⛔ tratar como indeterminado deixaria as recs. 3 e 4 `nao_avaliavel` num paciente cujo radiologista AFIRMOU haver efeito significativo — o app deixaria de excluir quem a fonte exclui");

confere("⚠️⚠️ ⛔ \"Incerto\" e vazio ⇒ `undefined`",
  vi([["efeito_de_massa", "Incerto"]], "efeito_de_massa_ausente") === undefined &&
    vi([], "efeito_de_massa_ausente") === undefined,
  "⛔ **unknown ≠ negative** — marcação vazia ⛔ nunca significa ausência");

// ── ⚠️⚠️ F-31 · nenhum fato operacional preenche ─────────────────────────
confere("⚠️⚠️ ⛔ ⛔ `nao_elegivel_a_evt` é SEMPRE undefined",
  vi([], "nao_elegivel_a_evt") === undefined &&
    vi([["centro_evt_disponivel", "Não"]], "nao_elegivel_a_evt") === undefined &&
    vi([["transferencia_possivel", "Não"]], "nao_elegivel_a_evt") === undefined,
  "⛔ ⛔ ⛔ nenhum fato operacional satisfaz a pré-condição — F-31 aberta, e F-03 §12 é a norma");

// ── ⚠️ ausência ⛔ nunca vira negativa, em NENHUM insumo ──────────────────
const todosOsInsumos = [...new Set(C.RECOMENDACOES.flatMap((r) => r.exige))];
confere("há insumos para varrer", todosOsInsumos.length >= 8, "piso R-1");
/**
 * ⚠️⚠️ AUSÊNCIA PRODUZ `undefined` — ⛔ e ⛔ NÃO "⛔ não é contradiz".
 *
 * ⛔ A primeira versão só proibia `"contradiz"`, e a mutação que fazia ASPECTS
 * devolver `"satisfaz"` **sempre** sobreviveu. ⚠️ Ausência tem **um** resultado,
 * ⛔ não dois permitidos: *"⛔ não se sabe"*.
 */
const vazioErrado = todosOsInsumos.filter((i) => vi([], i) !== undefined);
confere("⚠️⚠️ ⛔ ⛔ ⛔ estado VAZIO produz `undefined` em TODO insumo",
  vazioErrado.length === 0,
  `⛔ **E-02**: ausência ⛔ não é resposta contrária ⛔ NEM confirmação — encontrados: ${vazioErrado.join(", ")}`);

// ── ⚠️⚠️ 11 · OS QUATRO CAMPOS NOVOS, NAS SUAS CASAS ─────────────────────
confere("⚠️⚠️ leve + ⛔ não incapacitante exige os DOIS eixos",
  vi([["incapacitante_assumido", "Não incapacitante"], ["deficit_leve", "Leve"]],
     "deficit_leve_nao_incapacitante") === "satisfaz",
  '⛔ a fonte pede *"mild non-disabling"* — duas propriedades');

confere("⚠️⚠️ ⛔ e um eixo só ⛔ NÃO basta",
  vi([["deficit_leve", "Leve"]], "deficit_leve_nao_incapacitante") === undefined &&
    vi([["incapacitante_assumido", "Não incapacitante"]], "deficit_leve_nao_incapacitante") === undefined,
  "⛔ afirmar a população com metade da resposta declararia *IVT not recommended* sem base");

confere("⚠️ ⛔ contrário em QUALQUER eixo contradiz",
  vi([["deficit_leve", "Não leve"]], "deficit_leve_nao_incapacitante") === "contradiz" &&
    vi([["incapacitante_assumido", "Incapacitante"]], "deficit_leve_nao_incapacitante") === "contradiz",
  "⛔ basta um dos dois estar fora para o paciente ⛔ não ser dessa população");

/**
 * ⚠️⚠️ O MÉTODO DA PENUMBRA DIFERE ENTRE AS RECOMENDAÇÕES.
 *
 * ⛔ A rec. 2 exige perfusão **automatizada**; a rec. 3 ⛔ não qualifica. Um
 * insumo só imporia à rec. 3 uma exigência que a fonte ⛔ não fez.
 */
const rec2 = C.RECOMENDACOES.find((r) => r.id === "ivt_wakeup_ou_45_9");
const rec3 = C.RECOMENDACOES.find((r) => r.id === "ivt_lvo_sem_evt");
confere("⚠️⚠️ penumbra: a rec. 2 exige perfusão AUTOMATIZADA",
  rec2.exige.includes("penumbra_por_perfusao_automatizada") &&
    !rec2.exige.includes("penumbra_salvavel"),
  '⛔ *"detected on **automated perfusion imaging**"*');

confere("⚠️⚠️ ⛔ e a rec. 3 ⛔ NÃO qualifica o método",
  rec3.exige.includes("penumbra_salvavel") &&
    !rec3.exige.includes("penumbra_por_perfusao_automatizada"),
  '⛔ ela diz apenas *"with salvageable ischemic penumbra"* — impor o método inventaria critério');

confere("⚠️⚠️ RM: os DOIS componentes, separados",
  C.RECOMENDACOES.find((r) => r.id === "ivt_inicio_desconhecido").exige.sort().join() ===
    ["dwi_menor_que_um_terco", "flair_sem_alteracao_marcada"].sort().join(),
  "⛔ um booleano apagaria **qual** dos dois falta — e que o segundo é uma **ausência**");

/**
 * ⚠️⚠️ RESPONDER "SIM" TEM QUE SATISFAZER — a conferência que faltava.
 *
 * ⛔ A prova tinha só os casos NEGATIVOS (vazio ⛔ não satisfaz, um ⛔ não
 * responde o outro). Com eles, uma derivação que ⛔ NUNCA satisfizesse passava
 * verde — que foi exatamente o que aconteceu: `simNaoIncerto` comparava com o
 * rótulo `"Sim"`, o estado guardava `"sim"`, ⛔ e os quatro insumos ficavam
 * `undefined` para sempre no app real.
 *
 * ⚠️ Trava só com o lado negativo mede que ⛔ nada acontece — ⛔ e ⛔ não que a
 * coisa certa acontece.
 */
for (const campo of ["penumbra_salvavel", "penumbra_por_perfusao_automatizada",
                     "dwi_menor_que_um_terco", "flair_sem_alteracao_marcada"]) {
  confere(`⚠️⚠️ "Sim" em ${campo} SATISFAZ`,
    vi([[campo, "Sim"]], campo) === "satisfaz",
    "⛔ se responder ⛔ não muda ⛔ nada, o campo ⛔ não serve para ⛔ nada");
  confere(`⚠️⚠️ "Não" em ${campo} CONTRADIZ`,
    vi([[campo, "Não"]], campo) === "contradiz",
    "⛔ negar ⛔ não é o mesmo que ⛔ não responder — E-02");
  confere(`⚠️ "Incerto" em ${campo} ⛔ NÃO decide`,
    vi([[campo, "Incerto"]], campo) === undefined,
    "⛔ E-37: perguntei e ⛔ ninguém sabe ⛔ não é ⛔ nem sim ⛔ nem não");
}

confere("⚠️ ⛔ ausência no FLAIR ⛔ não é presumida",
  vi([["dwi_menor_que_um_terco", "Sim"]], "flair_sem_alteracao_marcada") === undefined,
  "⛔ ⛔ responder um ⛔ não responde o outro");

// ── ⚠️⚠️ F-09 É SOBRE TENECTEPLASE, ⛔ e ⛔ NÃO SOBRE "trombolítico" ───────
confere("⚠️⚠️ TNK 0,4 ⛔ só alcança quem considera TENECTEPLASE",
  vi([["agente_trombolitico", "Tenecteplase"]], "agente_e_tenecteplase") === "satisfaz",
  "⛔ é a população da recomendação, dita por ela");

confere("⚠️⚠️ ⛔ e ALTEPLASE CONTRADIZ ⛔ — ⛔ não é ausência de dado",
  vi([["agente_trombolitico", "Alteplase"]], "agente_e_tenecteplase") === "contradiz",
  "⛔ devolver undefined deixaria a rec. potencialmente aplicável ⛔ e a tela alertaria sobre dose de TNK para quem está em alteplase");

confere("⚠️ ⛔ e \"Indefinido\"/vazio ⛔ NÃO decidem nem para um lado nem para o outro",
  vi([["agente_trombolitico", "Indefinido"]], "agente_e_tenecteplase") === undefined &&
    vi([], "agente_e_tenecteplase") === undefined,
  "⛔ decidir ⛔ não escolher é decisão — ⛔ e ⛔ não escolha");

confere("⚠️ o nome do insumo CARREGA a polaridade",
  !fonteC.includes("agente_em_consideracao") && !fonteD.includes("agente_em_consideracao"),
  "⛔ insumo de nome genérico com derivação específica de TNK convida a próxima recomendação a reutilizá-lo ⛔ e alcançar a população errada");

// ── ⚠️⚠️ 12 · PRINCÍPIO GERAL ⛔ NÃO É CORRESPONDÊNCIA COM O PACIENTE ─────
{
  confere("⚠️ há princípios gerais declarados, ⛔ e a lista ⛔ não é vazia",
    C.PRINCIPIOS_GERAIS.length > 0,
    "⛔ trava que roda sobre lista vazia fica verde sem medir nada (R-1)");

  confere("⚠️⚠️ princípio geral ⛔ NÃO tem insumo ⛔ nem população avaliável",
    C.PRINCIPIOS_GERAIS.every((g) => g.exige === undefined && g.populacao === undefined
      && typeof g.pressupoe === "string" && g.pressupoe.length > 0),
    "⛔ o tipo sem `exige` é o que torna IMPOSSÍVEL passá-lo a correspondenciaDe; `pressupoe` diz o que ele assume ⛔ e ⛔ não filtra");

  confere("⚠️ ⛔ e mesmo assim ele carrega COR, LOE e verbo da fonte",
    C.PRINCIPIOS_GERAIS.every((g) => g.cor && g.loe && g.verbo && g.localizacao && g.slot),
    "⛔ separar categoria ⛔ não é apagar procedência — ele aparece na tela com o mesmo lastro");

  /**
   * ⚠️⚠️ ⛔ E A JANELA DELE TAMBÉM — buraco aberto pela PRÓPRIA separação.
   *
   * ⛔ A trava de verbatim das janelas percorria só `RECOMENDACOES`. Ao mover
   * `ivt_padrao` para cá, a sua janela saiu do alcance dela: a mutação que
   * esvaziava o verbatim passou verde. ⚠️ E-36/E-31 valem nas DUAS listas.
   */
  confere("⚠️⚠️ TODA janela de princípio nomeia o seu marco ⛔ e traz verbatim",
    C.PRINCIPIOS_GERAIS.flatMap((g) => g.janelas).length > 0 &&
      C.PRINCIPIOS_GERAIS.flatMap((g) => g.janelas).every((j) =>
        typeof j.verbatim === "string" && j.verbatim.length > 10 && j.marco),
    "⛔ E-36: controle de tempo sem o seu relógio nomeado; E-31: prazo sem a frase que o sustenta");

  confere("⚠️ ⛔ nenhum id vive nas DUAS listas",
    C.PRINCIPIOS_GERAIS.every((g) => !C.RECOMENDACOES.some((r) => r.id === g.id)),
    "⛔ id em duas listas é contagem dupla — o mesmo texto afirmando e ⛔ não afirmando correspondência");

  confere("⚠️ ⛔ e ⛔ nenhum princípio entra nas leituras de correspondência",
    D.recomendacoesDoEstado(com([])).every((l) => !C.PRINCIPIOS_GERAIS.some((g) => g.id === l.id)),
    "⛔ é a consequência inteira da separação: ele ⛔ não recebe veredito de correspondência");

  /**
   * ⚠️⚠️ A INVARIANTE, ⛔ e ⛔ não a lista de exceções.
   *
   * ⛔ Conferir "ivt_padrao saiu" prenderia a trava a UM id ⛔ e a próxima
   * recomendação sem insumo entraria sem ⛔ nenhum ruído.
   */
  confere("⚠️⚠️ TODA recomendação clínica exige ao menos um insumo",
    C.RECOMENDACOES.every((r) => r.exige.length > 0),
    "⛔ recomendação com exige vazio ⛔ não pode ser avaliada contra paciente ⛔ nenhum — ela sai aplicavel sem olhar o caso");

  const vazio = D.recomendacoesDoEstado(com([]));
  confere("⚠️⚠️ ⛔ e ⛔ NENHUMA é `aplicavel` no estado COMPLETAMENTE VAZIO",
    vazio.length > 0 && vazio.every((l) => l.correspondencia !== "aplicavel"),
    "⛔ afirmar que uma recomendação corresponde a um paciente sobre quem ⛔ nada se sabe é o defeito que a separação nasceu para impedir");

  confere("⚠️ ⛔ e ⛔ nenhuma delas é `nao_corresponde` no vazio",
    vazio.every((l) => l.correspondencia !== "nao_corresponde"),
    "⛔ do outro lado: excluir população sem dado seria E-52 — ausência virando valor");
}

confere("⚠️⚠️ ⛔ escolher o agente ⛔ NÃO produz dose ⛔ nem administração",
  !/agente_trombolitico[\s\S]{0,200}?doseDerivada|doseDerivada[\s\S]{0,200}?agente_trombolitico/.test(fonteD),
  "⛔ escolher TNK ⛔ não significa que foi administrado");

// ── ⚠️ F ⛔ não redeclara fato de A–E ─────────────────────────────────────
const idsDeF = (fonteC.match(/id: "([a-z_0-9]+)"/g) || []).map((m) => m.slice(5, -1));
confere("⚠️⚠️ ⛔ F ⛔ não declara campo ⛔ nenhum de A–E",
  !idsDeF.some((i) => ["incapacitante_assumido", "efeito_de_massa", "aspects", "nihss", "peso"].includes(i)),
  "⛔ um fato tem **uma** casa semântica — F lê, ⛔ e ⛔ não redeclara");

if (falhas.length) {
  console.log(`\n❌ SUPERFÍCIE F — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`\n✅ SUPERFÍCIE F — ${ok}/${ok} conferências · ${C.RECOMENDACOES.length} recomendações\n`);
