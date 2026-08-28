/**
 * PROMETE: que os campos da Superfície A sejam FIÉIS à fonte no que se pode
 *   medir sem julgamento — que `<60 mg/dL` seja limite e `>94%` seja meta e ⛔
 *   nunca o contrário; que ausência ⛔ nunca vire negativa (E-23); que toda
 *   escolha ofereça saída de ausência de conclusão e nenhum rótulo caia cru no
 *   estado; que todo campo tenha slot de fonte (E-30) e `bloqueiaTerapia:
 *   false` (E-49); e que a faixa de cada barra ALCANCE os limites que a fonte
 *   escreve, ⛔ sem obrigar o médico a aproximar.
 * NÃO PROMETE: que os números clínicos estejam CERTOS — ele confere que o
 *   código diz o que o verbatim transcrito diz, ⛔ não que o verbatim esteja bem
 *   transcrito nem que a fonte esteja atualizada. Também ⛔ não mede tela: ordem
 *   visual, legibilidade e vazamento de dado interno são `e2e/avc-superficie-a`.
 * UNIVERSO: `avc/conteudo/superficie-a.ts` inteiro (todos os campos de
 *   `TODOS_OS_CAMPOS_A`, contados) e as derivações de `avc/nucleo/derivacoes.ts`
 *   exercitadas por estado construído. ⛔ Fora do universo: Superfícies B a G,
 *   que ainda não existem.
 */
/**
 * PROVA DA SUPERFÍCIE A — comportamento clínico, não campos.
 *
 * As oito conferências que o autor pediu, mais as travas de fidelidade que a
 * consolidação exige. ⛔ Nenhuma delas mede tela: medem o ESTADO e as
 * DERIVAÇÕES, que é onde a medicina vive.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
let ok = 0;
const confere = (d, c, p) => (c ? ok++ : falhas.push(`${d}\n      ⚠️ ${p}`));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-a-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp,
  path.join(appDir, "avc", "nucleo", "relogio.ts"),
  path.join(appDir, "avc", "nucleo", "estado.ts"),
  path.join(appDir, "avc", "nucleo", "derivacoes.ts"),
  path.join(appDir, "avc", "conteudo", "superficie-a.ts"),
], { cwd: appDir, stdio: "pipe" });

// ⚠️ Compilando arquivos de duas pastas, o tsc preserva a estrutura no outDir.
const R = require(path.join(tmp, "nucleo", "relogio.js"));
const E = require(path.join(tmp, "nucleo", "estado.js"));
const D = require(path.join(tmp, "nucleo", "derivacoes.js"));
const C = require(path.join(tmp, "conteudo", "superficie-a.js"));

// ⚠️ As pendências vivem noutro módulo; compilado à parte para não alargar o
// universo declarado deste instrumento sem dizer.
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), "prova-avc-a-pend-"));
execFileSync("npx", [
  "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
  "--moduleResolution", "node", "--skipLibCheck", "--outDir", tmp2,
  path.join(appDir, "avc", "conteudo", "superficies.ts"),
], { cwd: appDir, stdio: "pipe" });

const novo = () => {
  const rel = R.relogioControlado(1_000_000);
  return { rel, est: E.abrirAtendimento(rel) };
};
const reg = (est, campo, valor, rel) => E.registrarFato(est, { campo, valor }, rel);

// ── 1 · PA 198/114 → 168/96 preserva histórico ─────────────────────────────
{
  const { rel, est: e0 } = novo();
  let e = reg(reg(e0, "pas", 198, rel), "pad", 114, rel);
  rel.avancar(25 * 60_000);
  e = reg(reg(e, "pas", 168, rel), "pad", 96, rel);

  const hist = E.historicoDe(e, "pas");
  confere("PA: nova medida preserva a anterior",
    hist.length === 2 && hist[0].valor === 198 && hist[1].valor === 168,
    "§3.1: sem os dois valores, 'a PA está em 168' é indistinguível de 'sempre esteve'");
  confere("PA: o valor atual é o mais recente",
    E.valorAtual(e, "pas").valor === 168, "leitura do estado atual incorreta");
  confere("PA: as horas de registro diferem",
    hist[1].horaRegistro > hist[0].horaRegistro,
    "sem hora distinta, não há evolução — há substituição");
  confere("PA: nenhuma das duas medidas é 'correção'",
    hist.every((f) => f.tipo === undefined || f.tipo === "medida"),
    "§3.4: medir de novo NÃO é corrigir — confundir vira evolução clínica falsa");
}

// ── 2 · glicemia desconhecida ≠ normal ─────────────────────────────────────
{
  const { rel, est } = novo();
  const semNada = D.hipoglicemia(est);
  confere("glicemia ausente é 'desconhecido', não 'não'",
    semNada.conclusao === "desconhecido",
    "E-23: ausência de dado NUNCA vira dado negativo");

  const naoSei = reg(est, "glicemia", "nao_sei", rel);
  confere("glicemia 'não sei' também é desconhecido",
    D.hipoglicemia(naoSei).conclusao === "desconhecido",
    "'não sei' é RESPOSTA, e não pode virar valor normal");

  const baixa = reg(est, "glicemia", 52, rel);
  confere("glicemia abaixo do limite da fonte conclui hipoglicemia",
    D.hipoglicemia(baixa).conclusao === "sim", "§4.5 rec.1 · COR 1 · C-LD");
  confere("a derivação de glicemia declara a fonte",
    D.hipoglicemia(baixa).fonte === "F-06", "E-22/E-30: derivação sem fonte não entra");
}

// ── 3 · peso desconhecido não bloqueia o módulo ────────────────────────────
{
  const { rel, est } = novo();
  const leituras = D.leiturasDaSuperficieA(est);
  confere("sem peso, as demais leituras continuam existindo",
    leituras.length === 7,
    "peso ausente não pode suprimir a superfície");
  confere("peso ausente é desconhecido e declara que não atrasa",
    D.peso(est).conclusao === "desconhecido" && /não atrasa/i.test(D.peso(est).texto),
    "Table 7: 'Do not delay thrombolysis to obtain exact weight'");
  const comPeso = reg(reg(est, "peso", 78, rel), "peso_origem", "Estimado", rel);
  confere("a origem do peso aparece na leitura",
    /Estimado/.test(D.peso(comPeso).texto),
    "E-14: a origem muda a confiança sem mudar o número");
}

// ── 4 · SpO₂ normal não gera O₂ automático ─────────────────────────────────
{
  const { rel, est } = novo();
  const spo2Boa = reg(est, "spo2", 97, rel);
  confere("SpO₂ normal sozinha NÃO indica oxigênio",
    D.oxigenio(spo2Boa).conclusao === "desconhecido",
    "§4.1 rec.2: é a HIPÓXIA que indica O₂ — a SpO₂ isolada não decide");

  const spo2Baixa = reg(est, "spo2", 91, rel);
  confere("SpO₂ baixa sozinha também NÃO indica oxigênio",
    D.oxigenio(spo2Baixa).conclusao === "desconhecido",
    "94% é META na presença de hipóxia, não corte diagnóstico — meta ≠ limite (§6.1)");
  confere("mas a SpO₂ baixa é sinalizada em relação à meta",
    D.spo2AbaixoDaMeta(spo2Baixa).conclusao === "sim",
    "a informação de acompanhamento existe, sem virar gatilho de conduta");

  const semHipoxia = reg(est, "hipoxia", "nao", rel);
  confere("sem hipóxia, a fonte desaconselha O₂ suplementar",
    D.oxigenio(semHipoxia).conclusao === "nao",
    "§4.1 rec.5 · COR 3: No benefit · B-R");

  const comHipoxia = reg(est, "hipoxia", "sim", rel);
  confere("com hipóxia, O₂ é recomendado com a meta declarada",
    D.oxigenio(comHipoxia).conclusao === "sim" && /94/.test(D.oxigenio(comHipoxia).texto),
    "§4.1 rec.2 · COR 1 · C-LD");
}

// ── 5 · crise no início é contexto, não exclusão ───────────────────────────
{
  const { rel, est } = novo();
  const comCrise = reg(est, "crise_no_inicio", "sim", rel);
  const l = D.criseNoInicio(comCrise);
  confere("crise no início não exclui AVC",
    l.conclusao === "sim" && /não exclui/i.test(l.texto),
    "F-24: crise no início é mimetizador possível — a recomendação de anticonvulsivante é para crise APÓS o AVC");
  confere("crise no início não indica anticonvulsivante por si",
    /não .*indica anticonvulsivante|não indica/i.test(l.texto),
    "profilaxia é COR 3: No Benefit");
  confere("as demais leituras seguem disponíveis com crise presente",
    D.leiturasDaSuperficieA(comCrise).length === 7,
    "crise não pode encerrar a superfície");
}

// ── 6 · relógios permanecem distintos ──────────────────────────────────────
{
  const { rel, est: e0 } = novo();
  // ⚠️ Marcos afastados de propósito: o decorrido é em MINUTOS, e dois marcos a
  // 20 s de distância cairiam no mesmo minuto — o que mediria o arredondamento,
  // não a separação dos relógios. A primeira versão deste teste errou assim.
  let e = E.definirRelogioClinico(e0, "ultima_vez_bem", 400_000);   // 10 min
  e = E.definirRelogioClinico(e, "inicio_observado", 700_000);      //  5 min
  e = E.definirRelogioClinico(e, "reconhecimento", 880_000);        //  2 min

  confere("os quatro relógios coexistem com valores próprios",
    e.relogiosClinicos.ultima_vez_bem === 400_000 &&
    e.relogiosClinicos.inicio_observado === 700_000 &&
    e.relogiosClinicos.reconhecimento === 880_000 &&
    e.relogiosClinicos.t0_operacional === 1_000_000,
    "F-02: colapsar marcos torna a janela estendida incomputável");

  const m = new Set([
    E.decorridoEmMinutos(e, "ultima_vez_bem", rel),
    E.decorridoEmMinutos(e, "reconhecimento", rel),
    E.decorridoEmMinutos(e, "inicio_observado", rel),
  ]);
  confere("os decorridos são diferentes entre si",
    m.size === 3 && m.has(10) && m.has(5) && m.has(2),
    "se os decorridos coincidissem, os marcos teriam sido fundidos");

  confere("cada campo de hora aponta para UM relógio nomeado",
    C.RELOGIOS_A.filter((c) => c.tipo === "hora").every((c) => typeof c.relogio === "string"),
    "E-36: controle de tempo sem relógio nomeado é ambíguo onde o erro é caro");
  const nomes = C.RELOGIOS_A.filter((c) => c.relogio).map((c) => c.relogio);
  confere("nenhum relógio genérico do tipo 'stroke_time'",
    new Set(nomes).size === nomes.length && !nomes.some((n) => /stroke|generic|avc_time/i.test(n)),
    "F-02: campo genérico é exatamente o que a decisão do autor proíbe");
}

// ── 7 · correção de horário invalida derivações dependentes ────────────────
{
  const { rel, est: e0 } = novo();
  let e = E.definirRelogioClinico(e0, "ultima_vez_bem", 700_000);
  const antes = E.decorridoEmMinutos(e, "ultima_vez_bem", rel);

  // A testemunha chega e o marco estava errado — CORREÇÃO, não nova medida.
  e = E.corrigirFato(e, {
    campo: "hora_ultima_vez_bem", valor: 400_000,
    motivo: "Testemunha corrigiu o horário",
  }, rel);
  e = E.definirRelogioClinico(e, "ultima_vez_bem", 400_000);
  const depois = E.decorridoEmMinutos(e, "ultima_vez_bem", rel);

  confere("corrigir o marco muda o derivado que dependia dele",
    antes === 5 && depois === 10,
    "§4.4-iii: a correção de um campo derruba a cadeia inteira que dele dependia");
  confere("a correção fica na trilha, marcada como correção e com motivo",
    E.valorAtual(e, "hora_ultima_vez_bem").tipo === "correcao" &&
    E.valorAtual(e, "hora_ultima_vez_bem").motivo.length > 0,
    "§3.4: corrigir exige motivo; medir de novo, não");
  confere("nenhum derivado antigo ficou guardado no estado",
    !JSON.stringify(e).includes('"decorrido"'),
    "§4.3: derivado guardado envelhece junto com o dado que o produziu");
}

// ── 8 · nenhum campo novo viola as doze marcas 🚫 ──────────────────────────
{
  confere("nenhum campo da Superfície A bloqueia terapia",
    C.TODOS_OS_CAMPOS_A.every((c) => c.bloqueiaTerapia === false),
    "E-49: campo obrigatório novo tem de ser conferido contra as doze marcas");

  // As marcas que a Superfície A poderia violar, por id de campo.
  const MARCAS = ["peso", "glicemia", "coagulograma", "cmb", "angiotc", "creatinina"];
  const bloqueantes = C.TODOS_OS_CAMPOS_A.filter((c) => c.bloqueiaTerapia).map((c) => c.id);
  confere("nenhum campo marcado 🚫 aparece como bloqueante",
    bloqueantes.filter((id) => MARCAS.some((m) => id.includes(m))).length === 0,
    "peso e glicemia estão entre as doze marcas — não podem travar a terapia");

  confere("todo campo declara a sua fonte",
    C.TODOS_OS_CAMPOS_A.every((c) => typeof c.fonte === "string" && /^F-\d+$/.test(c.fonte)),
    "E-30: a menor unidade auditável é a afirmação, e ela precisa de endereço");

  confere("nenhuma grandeza clínica usa caixa de texto",
    C.TODOS_OS_CAMPOS_A.every((c) => ["grandeza", "escolha", "hora"].includes(c.tipo)),
    "§0.3: sem texto livre para valor clínico");

  /**
   * ⚠️ A TRAVA MEDE O VALOR GRAVADO, ⛔ NÃO O RÓTULO.
   *
   * A versão anterior procurava a string "não sei" e reprovou quando a saída de
   * `hipoxia` passou a chamar-se "Incerto" — um achado em exame não se responde
   * "não sei". O que E-02/E-37 exigem ⛔ nunca foi uma palavra: é que exista uma
   * opção que grave **ausência de conclusão**. Casar por rótulo também deixava
   * passar o inverso, que é pior: um rótulo novo qualquer que caísse cru no
   * estado e fosse lido como "não".
   */
  confere("toda escolha oferece saída para quem não sabe",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "escolha")
      .every((c) => c.opcoes.some((o) => C.valorDaOpcao(o) === "nao_sei")),
    "E-02/E-37: ausência de conclusão é resposta, e precisa existir na tela");

  confere("nenhum rótulo de opção cai cru no estado",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "escolha")
      .every((c) => c.opcoes.every((o) => ["sim", "nao", "nao_sei"].includes(C.valorDaOpcao(o))
        || c.id === "peso_origem")),
    "E-23: rótulo desconhecido vira valor cru, e ternario() o leria como 'não'");

  confere("toda grandeza declara faixa de controle utilizável",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza").every((c) =>
      c.faixa && c.faixa.min < c.faixa.max && c.faixa.passo > 0),
    "§0.3: sem faixa a barra não desenha, e o campo cai para digitação");

  /**
   * ⚠️ ⛔ NENHUMA FAIXA PODE VOLTAR A TER POSIÇÃO DE PARTIDA. Ela punha o
   * polegar no meio enquanto o texto dizia "não informado" — desenho e texto
   * discordando sobre o mesmo campo (§0.2).
   */
  confere("nenhuma grandeza declara valor predeterminado",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza")
      .every((c) => !("partida" in c.faixa) && !("padrao" in c.faixa)),
    "§0.2: campo intocado não pode ter aparência de campo respondido");

  /**
   * ⚠️ A FAIXA NÃO PODE ESCONDER O LIMITE DA FONTE. `<60 mg/dL` é o limite que
   * manda tratar (F-06); uma barra que começasse em 70, ou com passo 10, faria
   * o médico registrar um número do lado errado da recomendação por limitação
   * de controle. Mesma lógica para a meta de SpO₂ >94% (F-23).
   */
  confere("a faixa alcança os limites que a fonte escreve",
    (() => {
      const g = C.TODOS_OS_CAMPOS_A.find((c) => c.id === "glicemia").faixa;
      const s = C.TODOS_OS_CAMPOS_A.find((c) => c.id === "spo2").faixa;
      return g.min < 60 && g.passo === 1 && s.min < 94 && s.passo === 1;
    })(),
    "F-06/F-23: valor real do paciente precisa ser registrável, não aproximável");

  confere("campo de hora não declara faixa",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "hora").every((c) => c.faixa === undefined),
    "§7.5: faixa é da barra, e horário não usa barra");

  confere("horário não usa barra deslizante",
    C.TODOS_OS_CAMPOS_A.filter((c) => c.id.startsWith("hora_")).every((c) => c.tipo === "hora"),
    "§7.5: horário do AVC usa picker, nunca slider");
}

// ── travas de fidelidade adicionais ────────────────────────────────────────
{
  const { rel, est } = novo();
  const comPa = reg(reg(est, "pas", 198, rel), "pad", 110, rel);
  const l = D.pressaoArterial(comPa);
  confere("a PA não define candidatura à IVT nesta superfície",
    !/candidat[oa] a|elegív|trombóli|185|110 mmHg/i.test(l.texto) && /depende do contexto/i.test(l.texto),
    "E-06: o mesmo valor tem significados opostos, e a candidatura nasce na Reperfusão");

  const todas = D.leiturasDaSuperficieA(est);
  confere("toda leitura declara insumos e fonte",
    todas.every((x) => Array.isArray(x.insumos) && x.insumos.length > 0 && /^F-\d+$/.test(x.fonte)),
    "E-22: conclusão opaca não entra no módulo");
  confere("com o estado vazio, nenhuma leitura conclui 'não'",
    todas.filter((x) => x.conclusao === "nao").length === 0,
    "E-23: sem dado, o sistema não pode negar nada");
}

// ── 12 · ESTADO INICIAL: nada respondido, nada predeterminado ──────────────
//
// ⚠️⚠️ AS INVARIANTES DE ABERTURA (fixadas pelo autor em 2026-08-28). Elas são
// UNIVERSAIS sobre `TODOS_OS_CAMPOS_A` de propósito: enumerar nomes deixaria o
// próximo campo nascer fora da regra, em silêncio.
{
  const { rel, est: vazio } = novo();

  confere("ao abrir, a trilha está vazia",
    vazio.fatos.length === 0,
    "I-2: valor clínico só existe após interação explícita — abrir não é interação");

  // I-1 · toda grandeza abre não informada
  const grandezas = C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "grandeza");
  confere("nenhuma grandeza abre com valor",
    grandezas.length > 0 && grandezas.every((c) => E.valorAtual(vazio, c.id) === undefined),
    "I-1: campo numérico aberto com valor é medida que ninguém mediu");

  /**
   * ⚠️ O MÍNIMO É O QUE A TELA DESENHA quando não há valor — a barra precisa de
   * um número, e esse número ⛔ não pode ser o meio da faixa. Aqui trava-se o
   * CONTRATO (existe `min`, e ⛔ não existe posição de partida); que o polegar
   * apareça lá é `e2e/avc-superficie-a`.
   */
  confere("toda grandeza declara mínimo e nenhum valor de partida",
    grandezas.every((c) => typeof c.faixa.min === "number" && !("partida" in c.faixa)),
    "I-1: sem mínimo declarado a tela teria de inventar onde pousar o polegar");

  // I-3 · nenhum Sim/Não abre selecionado
  const escolhas = C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "escolha");
  confere("nenhuma escolha abre com opção marcada",
    escolhas.length > 0 && escolhas.every((c) => E.valorAtual(vazio, c.id) === undefined),
    "I-3: Sim/Não pré-marcado é resposta que o médico não deu");

  confere("nenhuma escolha declara opção padrão",
    escolhas.every((c) => !("padrao" in c) && !("valorInicial" in c)),
    "I-3: padrão declarado no conteúdo reintroduziria a pré-marcação por baixo");

  // I-4 · nenhum relógio abre preenchido
  const horas = C.TODOS_OS_CAMPOS_A.filter((c) => c.tipo === "hora");
  confere("nenhum campo de horário abre preenchido",
    horas.length === 4 && horas.every((c) => E.valorAtual(vazio, c.id) === undefined),
    "I-4: horário automático no último-visto-bem apaga a evolução do paciente");

  /**
   * ⚠️ O ÚNICO relógio que nasce definido é o `t0_operacional` — é a abertura do
   * atendimento (§0.1), ⛔ não um marco informado pelo médico, e **E-21** diz
   * que ele ⛔ não substitui nenhum relógio clínico.
   */
  confere("só o t₀ operacional nasce definido",
    Object.keys(vazio.relogiosClinicos).length === 1
    && vazio.relogiosClinicos.t0_operacional !== undefined,
    "E-21: relógio clínico que nasce preenchido é janela terapêutica inventada");

  // I-5 · desconhecido ≠ não perguntado, e os dois ≠ valor
  const comDesc = reg(vazio, "hora_ultima_vez_bem", "nao_sei", rel);
  confere("desconhecido é distinguível de não perguntado",
    E.valorAtual(vazio, "hora_ultima_vez_bem") === undefined
    && E.valorAtual(comDesc, "hora_ultima_vez_bem").valor === "nao_sei",
    "I-5/E-02: colapsar os dois faz silêncio parecer resposta");
}

// ── 13 · desconhecido é resposta, e resolve a pendência ────────────────────
{
  const { rel, est: e0 } = novo();

  confere("último-visto-bem aceita desconhecido como resposta",
    C.TODOS_OS_CAMPOS_A.find((c) => c.id === "hora_ultima_vez_bem").aceitaDesconhecido === true,
    "E-02: 'ninguém sabe dizer' tem consequência própria, e sem porta ele vira branco");

  confere("chegada ao pronto-socorro NÃO aceita desconhecido",
    !C.TODOS_OS_CAMPOS_A.find((c) => c.id === "hora_chegada").aceitaDesconhecido,
    "marcar por simetria inventaria uma resposta que não existe clinicamente");

  /**
   * ⚠️ AS DUAS ROTAS QUE A PENDÊNCIA PROMETE, medidas uma a uma. A promessa
   * está escrita em `resolvePor`; sem estas conferências ela seguia falsa.
   */
  const P = require(path.join(tmp2, "conteudo", "superficies.js"));
  const pend = P.PENDENCIAS_INICIAIS.filter((p) => p.id === "ultima_vez_bem");
  const abertas = (e) => E.pendenciasAbertas(e, pend).length;

  confere("sem resposta, a pendência do último-visto-bem fica aberta",
    abertas(e0) === 1, "pendência que nasce fechada não é pendência");

  const comHora = reg(e0, "hora_ultima_vez_bem", 900000, rel);
  confere("informar o horário resolve a pendência",
    abertas(comHora) === 0,
    "E-26: a rota escrita em resolvePor precisa existir de fato");

  const comDesconhecido = reg(e0, "hora_ultima_vez_bem", "nao_sei", rel);
  confere("registrar desconhecido também resolve a pendência",
    abertas(comDesconhecido) === 0,
    "E-02: desconhecido é RESPOSTA — deixá-la aberta trataria resposta como silêncio");

  confere("desconhecido não vira horário",
    E.valorAtual(comDesconhecido, "hora_ultima_vez_bem").valor === "nao_sei",
    "um marco temporal inventado a partir de 'não sei' produziria janela falsa");
}

if (falhas.length) {
  console.error(`\n❌ PROVA DA SUPERFÍCIE A — ${falhas.length} falha(s), ${ok} ok\n`);
  falhas.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
  process.exit(1);
}
console.log(`✅ PROVA DA SUPERFÍCIE A — ${ok}/${ok} conferências`);
