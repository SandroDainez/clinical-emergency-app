#!/usr/bin/env node
/**
 * PROMETE: que o módulo de coronarianas COBRE o ECG de 12 derivações contra a
 *   meta de 10 min do primeiro contato médico — que a cobrança alcança todo
 *   caminho agudo, que ela nunca afirma um atraso que não mediu, que ela não
 *   bloqueia o atendimento e que o relógio conta do contato, não do app.
 * NÃO PROMETE: que a meta de 10 min esteja certa (é a ACC/AHA 2025, decisão do
 *   autor), nem que a INTERPRETAÇÃO do ECG esteja bem desenhada — isso é o nó
 *   `ecg` e a rodada seguinte, explicitamente fora daqui.
 * UNIVERSO: `lib/ecg-tempo.ts`, a árvore de coronarianas e o motor.
 *
 * ── O DEFEITO, MEDIDO ANTES DE SER CORRIGIDO ────────────────────────────────
 *
 * A informação certa já estava no app. O nó `entry` listava:
 *
 *     "ECG de 12 derivações em até 10 min da chegada"
 *
 * como ITEM 4 DE UMA LISTA DE 8, entre "2 acessos venosos" e "coletar
 * troponina". Mesmo peso visual de "monitor cardíaco contínuo". Ninguém
 * confirmava, nada registrava a hora, nada voltava a cobrar.
 *
 * ⚠️ E TRÊS DOS CINCO ATALHOS DO MENU PULAVAM O `entry` INTEIRO — "Já tenho o
 * ECG na mão", "STEMI já confirmado" e "Só preciso das doses". Por esses
 * caminhos o lembrete não existia. É o mesmo beco que deixou o PDE-5 escapar,
 * agora no dado mais sensível ao tempo do módulo.
 *
 * ── O QUE ESTA TRAVA IMPEDE DE VOLTAR ───────────────────────────────────────
 *
 * 1. Que um caminho agudo volte a existir sem passar pela cobrança (dominância,
 *    não enumeração: a exceção de "complicações pós-IAM" é nominal, e uma
 *    segunda exceção reprova).
 * 2. Que a faixa afirme atraso sem âncora informada — "no prazo" para todo
 *    mundo é pior que silêncio.
 * 3. Que a tela vire portão: paciente instável estabiliza primeiro.
 * 4. Que o relógio volte a contar da abertura do módulo.
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { lerFonte } = require("./lib/fonte.cjs");

const appDir = path.resolve(__dirname, "..");
const falhas = [];
const linhas = [];
let ok = 0;

function confere(descricao, condicao, porque) {
  if (condicao) ok++;
  else falhas.push(`${descricao}\n      ⚠️ ${porque}`);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "ecg-tempo-"));
execFileSync(
  "npx",
  [
    "tsc", "--module", "commonjs", "--target", "es2020", "--esModuleInterop",
    "--moduleResolution", "node", "--skipLibCheck", "--outDir", tempDir,
    path.join(appDir, "core", "decision-tree", "engine.ts"),
    path.join(appDir, "lib", "ecg-tempo.ts"),
    path.join(appDir, "coronary-decision-tree.ts"),
  ],
  { cwd: appDir, stdio: "pipe" }
);
const { DecisionTreeEngine } = require(path.join(tempDir, "core", "decision-tree", "engine.js"));
const { estadoDoEcg, alertaDoEcg, META_ECG_MIN } = require(path.join(tempDir, "lib", "ecg-tempo.js"));
const { coronaryDecisionTree: ARVORE } = require(path.join(tempDir, "coronary-decision-tree.js"));

const T0 = Date.UTC(2026, 7, 26, 14, 0, 0);
const MIN = 60_000;

// ── A. O RELÓGIO CONTA DO CONTATO, NÃO DO APP ──────────────────────────────
//
// A árvore declara `fmc_min` em `marcos`. É o motor que arma a âncora — esta
// conferência passa por ele de propósito, e não escrevendo a chave na mão:
// assim ela também prova que o literal espelhado em `ecg-tempo.ts` continua
// casando com o formato que o motor produz.
{
  const motor = new DecisionTreeEngine(ARVORE, { agora: () => T0 });
  motor.setValue("fmc_min", "25");

  const estado = estadoDoEcg(motor.getValues(), T0);
  confere(
    "a âncora armada pelo MOTOR é encontrada por `ecg-tempo`",
    estado.desdeContatoMin === 25,
    `veio ${estado.desdeContatoMin}, esperado 25 — se o motor mudou o formato da chave do marco, a faixa ` +
    `emudeceria em silêncio em vez de quebrar aqui.`
  );

  confere(
    "o relógio conta do contato, não da abertura do módulo",
    estado.desdeContatoMin !== 0,
    `deu zero com "primeiro contato há 25 min": é o app respondendo "há quanto tempo estou aberto". ` +
    `Nesse modo o atraso aparece sempre como zero — o cronômetro mentindo a favor.`
  );

  // Sai do módulo, gasta 8 minutos, volta. A retomada faz REPLAY.
  const marcos = motor.exportarMarcos();
  const depois = new DecisionTreeEngine(ARVORE, { agora: () => T0 + 8 * MIN });
  depois.reaplicarValorSemTrilha("fmc_min", "25");
  const soReplay = estadoDoEcg(depois.getValues(), T0 + 8 * MIN).desdeContatoMin;
  depois.restaurarMarcos(marcos);
  const comCorrecao = estadoDoEcg(depois.getValues(), T0 + 8 * MIN).desdeContatoMin;

  confere(
    "sair e voltar não rejuvenesce o primeiro contato",
    comCorrecao === 33,
    `depois de 8 min fora, o contato ficou "há ${comCorrecao} min" em vez de 33. ` +
    `O paciente rejuvenesceu o tempo que o médico passou fora, e a cobrança do ECG afrouxa junto.`
  );
  linhas.push(
    `  âncora: contato há 25 min · 8 min fora · sem correção iria para ${soReplay} min · com correção: ${comCorrecao} min`
  );
}

// ── B. A FAIXA NUNCA AFIRMA UM ATRASO QUE NÃO MEDIU ────────────────────────
{
  const semAncora = { ecg_realizado: "nao" };
  const e = estadoDoEcg(semAncora, T0);
  confere(
    "sem âncora, o estado é `pendente_sem_ancora` — não `no prazo`",
    e.situacao === "pendente_sem_ancora",
    `veio "${e.situacao}". Tratar ausência de medida como "dentro da meta" diria "no prazo" para todo ` +
    `mundo que não informou o horário — exatamente quem mais precisa da cobrança.`
  );

  const a = alertaDoEcg(semAncora, T0);
  confere(
    "sem âncora, a faixa aparece mas NÃO diz que está atrasado",
    a !== null && a.nivel === "info" && !/atrasad/i.test(a.texto),
    `a faixa ${a === null ? "sumiu" : `disse "${a.texto}" com nível "${a.nivel}"`}. Sumir esconde a ` +
    `pendência; afirmar atraso inventa uma medida que não existe.`
  );

  confere(
    "sem âncora, a faixa DECLARA que o atraso não está sendo medido",
    a !== null && /não está sendo medido/i.test(a.detalhe ?? ""),
    `o detalhe não diz que a medida falta. Silêncio aqui é o mesmo que dizer "está tudo certo".`
  );

  confere(
    "sem âncora, a faixa não carrega número nenhum",
    a !== null && a.valores === undefined,
    `a faixa levou valores para interpolar sem ter âncora — é o zero silencioso entrando por outra porta.`
  );
}

// ── C. A VIRADA DOS 10 MINUTOS ─────────────────────────────────────────────
//
// Testada nos dois lados e NA BORDA. `META_ECG_MIN` entra da fonte, não como
// literal repetido: se a meta mudar, esta trava acompanha em vez de reprovar
// por um número que ela mesma decorou.
{
  const comContato = (min) => {
    const m = new DecisionTreeEngine(ARVORE, { agora: () => T0 });
    m.setValue("fmc_min", String(min));
    m.setValue("ecg_realizado", "nao");
    return m.getValues();
  };

  const casos = [
    [META_ECG_MIN - 1, "pendente_no_prazo"],
    [META_ECG_MIN, "pendente_no_prazo"],
    [META_ECG_MIN + 1, "pendente_atrasado"],
  ];
  for (const [min, esperado] of casos) {
    const s = estadoDoEcg(comContato(min), T0).situacao;
    confere(
      `pendente com contato há ${min} min → ${esperado}`,
      s === esperado,
      `veio "${s}". A meta é "em até ${META_ECG_MIN} min": aos ${META_ECG_MIN} exatos ainda cumpre.`
    );
  }

  const atrasado = alertaDoEcg(comContato(META_ECG_MIN + 5), T0);
  confere(
    "atrasado sobe o nível da faixa e manda agir agora",
    atrasado !== null && atrasado.nivel === "atencao" && /agora/i.test(atrasado.texto),
    `a faixa ficou "${atrasado?.nivel}" dizendo "${atrasado?.texto}". Um atraso que aparece com o mesmo ` +
    `peso do lembrete não se distingue dele.`
  );
}

// ── D. FEITO: MEDE O INTERVALO, OU DECLARA QUE NÃO MEDIU ───────────────────
{
  const feito = (fmc, ecgHa) => {
    const m = new DecisionTreeEngine(ARVORE, { agora: () => T0 });
    m.setValue("ecg_realizado", "sim");
    if (fmc !== null) m.setValue("fmc_min", String(fmc));
    if (ecgHa !== null) m.setValue("ecg_ha_min", String(ecgHa));
    return m.getValues();
  };

  // Contato há 30 min, ECG ficou pronto há 24 → intervalo de 6 min.
  const dentro = estadoDoEcg(feito(30, 24), T0);
  confere(
    "com os dois tempos, o intervalo contato→ECG sai por subtração",
    dentro.intervaloMin === 6 && dentro.situacao === "feito_no_prazo",
    `intervalo ${dentro.intervaloMin} / situação "${dentro.situacao}", esperado 6 / feito_no_prazo.`
  );

  // Contato há 40, ECG há 24 → 16 min: fora da meta.
  const fora = estadoDoEcg(feito(40, 24), T0);
  confere(
    "intervalo acima da meta é registrado como fora da meta",
    fora.intervaloMin === 16 && fora.situacao === "feito_fora_da_meta",
    `intervalo ${fora.intervaloMin} / situação "${fora.situacao}". Um atraso real classificado como ` +
    `cumprimento apagaria justamente o dado que esta camada existe para produzir.`
  );

  for (const [rotulo, v] of [["sem o tempo do contato", feito(null, 5)], ["sem o tempo do ECG", feito(30, null)]]) {
    const e = estadoDoEcg(v, T0);
    confere(
      `feito ${rotulo} → "não medido", nunca zero`,
      e.situacao === "feito_sem_medida" && e.intervaloMin === null,
      `veio "${e.situacao}" com intervalo ${e.intervaloMin}. Zero aqui seria o app afirmando um ` +
      `cumprimento perfeito que ninguém informou.`
    );
  }

  confere(
    "depois do ECG feito, a faixa SOME",
    alertaDoEcg(feito(40, 24), T0) === null,
    `a faixa continuou aparecendo depois do ECG pronto. "Obtenha agora" para quem já obteve é aviso sem ` +
    `ação possível — e é assim que se ensina o médico a ignorar a faixa.`
  );

  confere(
    "antes de perguntar, a faixa não aparece",
    alertaDoEcg({}, T0) === null && estadoDoEcg({}, T0).situacao === "nao_perguntado",
    `a faixa apareceu antes de a pergunta existir — afirmação sobre um estado que ninguém informou.`
  );
}

// ── E. ALCANCE: TODO CAMINHO AGUDO PASSA PELA COBRANÇA ─────────────────────
//
// ⚠️ POR DOMINÂNCIA, NÃO POR ENUMERAÇÃO. Enumerar caminhos estoura o limite
// nesta árvore (94 nós) e, pior, aprova quando o corte fica logo além do teto.
// Aqui o `ecg_tempo` é REMOVIDO do grafo: se algum destino agudo continuar
// alcançável, existe desvio.
{
  const N = ARVORE.nodes;
  const RAIZ = ARVORE.entryNodeId;
  const EXCECAO = "complicacoes"; // declarada no nó, e nominal aqui de propósito

  const saidas = (no) => {
    const s = [];
    if (no.options) for (const o of no.options) o.next && s.push(o.next);
    if (no.targets) for (const t of no.targets) t.next && s.push(t.next);
    const nx = no.next;
    if (typeof nx === "string") s.push(nx);
    else if (nx && Array.isArray(nx.possiveis)) s.push(...nx.possiveis);
    return s.filter((x) => N[x]);
  };

  const alcancaveis = (bloqueado) => {
    const vistos = new Set([RAIZ]);
    const fila = [RAIZ];
    while (fila.length) {
      const id = fila.shift();
      if (id === bloqueado) continue;
      for (const d of saidas(N[id])) if (!vistos.has(d)) { vistos.add(d); fila.push(d); }
    }
    return vistos;
  };

  const AGUDOS = ["entry", "ecg", "stemi_localizacao", "atalho_antitromboticos_tipo"];
  const semCobranca = alcancaveis("ecg_tempo");

  for (const destino of AGUDOS) {
    confere(
      `sem \`ecg_tempo\`, "${destino}" fica inalcançável — a cobrança domina o caminho`,
      !semCobranca.has(destino),
      `existe rota até "${destino}" que NÃO passa pela cobrança do ECG. É o beco dos atalhos voltando: ` +
      `o médico chega às condutas sem que o app tenha lembrado do ECG nem medido o atraso.`
    );
  }

  const raiz = N[RAIZ];
  const desviam = raiz.options.filter((o) => o.next !== "ecg_tempo");
  confere(
    "só um atalho desvia da cobrança, e é o declarado",
    desviam.length === 1 && desviam[0].id === EXCECAO,
    `desviam: ${desviam.map((o) => `"${o.id}"→${o.next}`).join(", ") || "nenhum"}. A única exceção prevista é ` +
    `"${EXCECAO}" (complicações de infarto já estabelecido, onde a meta de ${META_ECG_MIN} min do primeiro ` +
    `contato não corre). Exceção nova precisa de decisão clínica, não de um \`next\` trocado.`
  );

  confere(
    "todo atalho registra por onde entrou",
    raiz.options.every((o) => o.grava && o.grava.campo === "atalho_escolhido"),
    `algum atalho não grava \`atalho_escolhido\` — e é esse campo que devolve cada um ao seu destino ` +
    `depois da cobrança. Sem ele o atalho vira "fluxo completo" em silêncio.`
  );

  const destinosDeclarados = new Set(N.ecg_tempo.next.possiveis);
  confere(
    "os destinos do roteamento estão declarados em `possiveis`",
    AGUDOS.every((d) => destinosDeclarados.has(d)),
    `faltam destinos em \`possiveis\`: a análise estática não os enxerga, e toda trava de rota deste ` +
    `módulo passa a medir um grafo menor do que o real — aprovando por não ver.`
  );
}

// ── F. LEMBRAR E REGISTRAR, SEM IMPEDIR ────────────────────────────────────
{
  const no = ARVORE.nodes.ecg_tempo;
  const porId = Object.fromEntries(no.fields.map((f) => [f.id, f]));

  confere(
    "só a pergunta binária é obrigatória",
    porId.ecg_realizado && !porId.ecg_realizado.optional,
    `\`ecg_realizado\` ficou opcional — sem ele não há o "registrar" do ciclo lembrar → registrar → medir.`
  );

  for (const campo of ["fmc_min", "ecg_ha_min"]) {
    confere(
      `\`${campo}\` é opcional — a tela não vira portão`,
      porId[campo] && porId[campo].optional === true,
      `\`${campo}\` passou a bloquear o "continuar". Paciente instável estabiliza primeiro: uma tela de ` +
      `tempo que segura o fluxo atrasa justamente quem não pode esperar.`
    );
  }

  confere(
    "a pergunta do ECG é binária: feito ou ainda não",
    porId.ecg_realizado.presets.length === 2 &&
      porId.ecg_realizado.presets.every((p) => ["sim", "nao"].includes(p.value)),
    `os valores são ${JSON.stringify(porId.ecg_realizado.presets.map((p) => p.value))}. Uma terceira via ` +
    `aqui ("não sei") não tem sentido clínico: o traçado está na mão ou não está.`
  );

  confere(
    "`fmc_min` está declarado em `marcos` — é ele que arma o relógio",
    ARVORE.marcos && ARVORE.marcos.fmc_min === "primeiroContatoMedico",
    `\`marcos\` = ${JSON.stringify(ARVORE.marcos)}. Sem a declaração o campo vira número inerte, a âncora ` +
    `nunca é armada e a faixa fica presa em "não medido" para sempre.`
  );

  confere(
    "a árvore declara a faixa persistente",
    typeof ARVORE.alertaPersistente === "function",
    `sem \`alertaPersistente\` a cobrança existe uma vez e some — volta a ser o lembrete de uma tela só, ` +
    `que é o defeito de origem.`
  );
}

// ── G. "DA CHEGADA" NÃO VOLTA COMO REGRA ───────────────────────────────────
//
// Lido por `lerFonte` (sem comentários) porque os comentários deste módulo
// CITAM o texto antigo para explicar por que ele saiu — uma leitura crua casaria
// com a explicação e reprovaria a correção que ela descreve.
{
  const arvore = lerFonte("coronary-decision-tree.ts");
  const ecgTempo = lerFonte("lib/ecg-tempo.ts");

  confere(
    "nenhum texto de tela ancora a meta do ECG na chegada",
    !/10 min da chegada/i.test(arvore) && !/10 min da chegada/i.test(ecgTempo),
    `sobrou "10 min da chegada". A âncora é o PRIMEIRO CONTATO MÉDICO: no pré-hospitalar e no paciente já ` +
    `internado que passa a ter dor, "chegada" não corresponde a evento nenhum.`
  );

  confere(
    "a meta aparece ancorada no primeiro contato médico",
    /primeiro contato médico/i.test(arvore),
    `a expressão sumiu da árvore — a meta voltou a ser um número sem âncora declarada.`
  );
}

// ── H. Vacuidade ───────────────────────────────────────────────────────────
confere(
  "as conferências rodaram sobre a árvore real",
  Object.keys(ARVORE.nodes).length > 50 && Boolean(ARVORE.nodes.ecg_tempo),
  `a árvore carregada tem ${Object.keys(ARVORE.nodes).length} nós e ecg_tempo ` +
  `${ARVORE.nodes.ecg_tempo ? "existe" : "NÃO existe"} — a trava pode ter medido nada (R-15 item 9).`
);
confere(
  "a linha de medição do relógio foi produzida",
  linhas.length === 1,
  `nenhuma medição de retomada saiu; o bloco A não exercitou o defeito.`
);

console.log("\nECG de 12 derivações — meta ≤10 min do primeiro contato médico\n");
for (const l of linhas) console.log(l);
console.log("");
if (falhas.length) {
  for (const f of falhas) console.log(`❌ ${f}`);
  console.log(`\n❌ ${falhas.length} problema(s)\n`);
  process.exit(1);
}
console.log(`✅ ${ok} conferências — lembrar, registrar e medir; nunca impedir nem inventar\n`);
process.exit(0);
