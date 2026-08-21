import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * DESCOBERTA GUIADA — as emergências do renal que ainda não tinham conjunto.
 *
 * ── ⚠️ ISTO ESTENDE `lib/instabilidade-guiada.ts`, NÃO O SUBSTITUI ─────────
 *
 * Aquele arquivo já tem o padrão inteiro e é o que a 2/6 (perfusão) usa sem
 * mudar uma linha: `OPCAO_GUIADA` → `InputNode` com observações de beira de
 * leito → função pura conclui → o fluxo segue. Os critérios são os da AHA, com
 * a distinção instável/limítrofe/estável, e continuam valendo aqui.
 *
 * O que faltava não era mecanismo: era CONTEÚDO. Congestão, ácido-base, uremia
 * e diurese não têm conjunto de sinais em lugar nenhum do app. É isso que este
 * arquivo acrescenta, no mesmo molde e com a mesma promessa.
 *
 * ⚠️ O NOME `instabilidade-guiada` FICOU ESTREITO — o padrão é geral e o nome
 * não é, e é o nome que vai impedir outros módulos de perceberem que podem usar
 * o padrão. O renome NÃO entra nesta rodada: renomear no meio da correção do
 * renal misturaria duas mudanças e estragaria o retrato antes/depois. Fica
 * registrado como trabalho próprio, logo depois do renal aprovado.
 *
 * ── A FORMA, QUE É O QUE IMPEDE O DEFEITO DE VOLTAR ────────────────────────
 *
 * "Não sei" é RAMO DO FLUXO, nunca parágrafo. Cada conjunto aqui é de uma a
 * seis perguntas CONCRETAS, respondíveis olhando o paciente ou o monitor, e
 * termina devolvendo a resposta à pergunta original. Nenhum deles acaba em
 * texto para ler: transformar a dúvida em explicação já foi reprovado duas
 * vezes neste app.
 */

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

/**
 * ⚠️ A ÚNICA OPÇÃO PRONTA QUE UM CAMPO DE VALOR CLÍNICO PODE TER. Ela não sugere
 * número nenhum — diz que o dado não existe, que é informação clínica de verdade
 * e muda o que o app pode concluir.
 */
export const SEM_ESSE_VALOR = { value: "", label: "Não tenho esse valor" };

/** Rótulo da terceira saída. Igual em todas as seis, para o olho reconhecer. */
export const OPCAO_DESCOBRIR = "Não sei — me ajude a descobrir";

/* ── 3/6 · CONGESTÃO ───────────────────────────────────────────────────────── */

/**
 * ⚠️ CONGESTÃO NÃO SE DEFINE POR SATURAÇÃO, e a primeira versão definia.
 *
 * Ela perguntava SpO₂ e frequência respiratória e cortava em 92% e 28 irpm —
 * dois números MEUS, sem procedência no repositório, e medindo a coisa errada:
 * um paciente pode estar francamente congesto com SpO₂ de 95%. O que aqueles
 * cortes marcavam não era congestão, era REPERCUSSÃO respiratória.
 *
 * Agora são só sinais OBSERVÁVEIS, que é o que o usuário consegue ver e o que
 * não precisa de corte numérico. Nenhum número decide nada nesta emergência.
 */
export const CAMPOS_DE_CONGESTAO: InputField[] = [
  { id: "acessoria", label: "Está usando musculatura acessória para respirar?", presets: SIM_NAO },
  { id: "satCaindo", label: "A saturação caiu, ou está precisando de mais oxigênio que antes?", presets: SIM_NAO },
  { id: "ortopneia", label: "Não consegue ficar deitado?", presets: SIM_NAO },
  { id: "crepitacoes", label: "Ouve estalidos (crepitações) na ausculta dos pulmões?", presets: SIM_NAO },
  { id: "edemaCong", label: "Edema, estase jugular, ou ganho de peso rápido?", presets: SIM_NAO, optional: true },
];

/**
 * ⚠️ SÃO DUAS COISAS, E A PERGUNTA PEDE AS DUAS: sinal de CONGESTÃO (crepitações,
 * ortopneia, edema/estase) mais REPERCUSSÃO respiratória (esforço, saturação
 * caindo, oxigênio subindo). Hipervolemia sem repercussão não é esta emergência
 * — é volume a corrigir com calma, e tratá-la aqui como emergência empurraria
 * diurético em quem não precisa agora.
 *
 * Repercussão SOZINHA ainda manda tratar: pode não ser congestão, mas é ameaça
 * à respiração, e o app não devolve "não" para quem está em esforço.
 */
export function concluiCongestao(v: TreeValues): "sim" | "nao" {
  const repercussao = v.acessoria === "sim" || v.satCaindo === "sim";
  const congestao = v.crepitacoes === "sim" || v.ortopneia === "sim" || v.edemaCong === "sim";
  if (repercussao && congestao) return "sim";
  if (repercussao) return "sim";
  return "nao";
}

/* ── 4/6 · ÁCIDO-BASE ──────────────────────────────────────────────────────── */

/**
 * ⚠️ OS PRESETS SAÍRAM EM 2026-08-21 — ELES ERAM O LIMIAR COM OUTRA ROUPA.
 *
 * A tela dizia, no topo, «NÃO USE O pH ISOLADO COMO CRITÉRIO ÚNICO» — e três
 * linhas abaixo oferecia `[7,0] [7,15] [7,25] [7,35]`. **O primeiro degrau era
 * exatamente o número que acabara de ser removido por não ter procedência.** Ele
 * saiu do texto decisório e voltou como atalho de digitação.
 *
 * ⚠️ **BOTÃO PRÉ-FABRICADO É AFIRMAÇÃO DE QUE AQUELE VALOR IMPORTA**, e quatro
 * botões em escada afirmam que existe uma escada. Para quem não tem experiência —
 * a população-alvo — a leitura da tela é "o app me deu quatro opções; a primeira
 * deve ser a grave".
 *
 * ── DE ONDE ELES VIERAM, RESPONDIDO ────────────────────────────────────────
 *
 * **Fui eu, em 2026-08-18, no commit do bloco das 6 (`eecf1ba`), sem fonte
 * nenhuma.** O 7,0 é o corte de CAD/EHH — herdado de outro módulo, na mesma
 * leva em que a transposição foi declarada. Os outros sete (7,15 · 7,25 · 7,35 ·
 * 6 · 10 · 16 · 22) foram **escolhidos por conveniência de interface**: uma
 * escada plausível para poupar digitação. O 16 e o 22 são vizinhos dos cortes de
 * cetoacidose, e não de indicação de TRS.
 *
 * É o terceiro caso da mesma família neste módulo — 126 mg/dL, pH < 7,0, estes
 * oito. **Três casos deixam de ser acidente:** ver R-99.
 *
 * ── O QUE FICOU ────────────────────────────────────────────────────────────
 *
 * Campo numérico livre e "não tenho esse valor". **Registrar o dado é legítimo;
 * sugerir os valores não é.** E nenhuma "faixa sugerida" no lugar — seria o mesmo
 * defeito com nome mais elegante.
 */
export const CAMPOS_DE_ACIDOSE: InputField[] = [
  {
    id: "ph",
    label: "pH da gasometria",
    presets: [SEM_ESSE_VALOR],
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Informar o valor",
    optional: true,
  },
  {
    id: "hco3",
    label: "Bicarbonato",
    unit: "mEq/L",
    presets: [SEM_ESSE_VALOR],
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Informar o valor",
    optional: true,
  },
];

/** Sinais que sobram quando não há gasometria — e eles são PRESUNTIVOS. */
export const CAMPOS_SEM_GASOMETRIA: InputField[] = [
  {
    id: "kussmaul",
    label: "Respiração profunda e rápida, puxando muito ar (Kussmaul)?",
    presets: SIM_NAO,
  },
  {
    id: "taquipneiaSemHipoxemia",
    label: "Respiração acelerada com saturação boa — sem hipoxemia que explique?",
    presets: SIM_NAO,
  },
  { id: "rebaixado", label: "Está rebaixado ou confuso?", presets: SIM_NAO },
];

export const ACIDOSE_SEM_GASOMETRIA =
  "⚠️ SEM GASOMETRIA A RESPOSTA É PRESUNTIVA. Estes sinais sugerem acidose metabólica, não a medem — e nenhum deles diz o pH. O exame continua sendo necessário: peça em paralelo.";

/**
 * ⚠️ O pH < 7,0 SAIU COMO LIMIAR EM 2026-08-21, E NÃO FOI SUBSTITUÍDO POR OUTRO.
 *
 * Ele era o corte de acidose grave do módulo de CAD/EHH, transposto para cá por
 * coerência interna — a transposição estava declarada, e a ressalva já dizia que
 * na cetoacidose a acidose é por CETOÁCIDOS e reverte com insulina, enquanto na
 * injúria renal é retenção de ácidos FIXOS e a decisão é sobre TRS. O autor
 * decidiu: sai, e **não entra 7,20 no lugar**.
 *
 * ── ⚠️ POR QUE NÃO 7,20 — E ISTO VALE PARA O APP INTEIRO ───────────────────
 *
 * **CRITÉRIO DE INCLUSÃO DE ENSAIO NÃO É LIMIAR DE CONDUTA.** O BICARICU-2 (JAMA
 * 2025) incluiu pacientes com pH ≤ 7,20 e IRA KDIGO 2–3 — e foi **NEGATIVO**:
 * mortalidade em 90 dias 62,1% vs 61,7%, sem efeito em subgrupo nenhum. Houve
 * menos TRS em 28 dias (35% vs 50%) **sem ganho de sobrevida**.
 *
 * Adotar 7,20 como gatilho seria ler o **critério de entrada** de um ensaio como
 * se fosse recomendação — e ainda por cima de um ensaio que não mostrou benefício.
 * Ver `auditoria/METODO.md`, R-97.
 *
 * ── O QUE FICOU NO LUGAR ───────────────────────────────────────────────────
 *
 * Uma pergunta de JULGAMENTO, ancorada na KDIGO 5.1.1 — que fala em alterações
 * AMEAÇADORAS À VIDA, não em número. A gasometria continua sendo coletada: ela
 * informa, e agora não decide sozinha.
 */
export const ACIDOSE_SEM_LIMIAR =
  "⚠️ NÃO USE O pH ISOLADO COMO CRITÉRIO ÚNICO. O que decide é acidemia metabólica GRAVE ou REFRATÁRIA — avalie contexto, causa, possibilidade de correção e indicação de TRS.";

/** A pergunta que substituiu o corte: julgamento declarado, não número. */
export const CAMPO_DE_JULGAMENTO_ACIDOSE: InputField[] = [
  {
    id: "acidemiaGrave",
    label: "Considerando contexto, causa e possibilidade de correção: é acidemia grave ou refratária?",
    // ⚠️ A TERCEIRA SAÍDA É A REGRA DO APP, não cortesia: sem ela a tela vira
    // beco para quem não tem o julgamento — que é o usuário-alvo.
    presets: [...SIM_NAO, { value: "nao_sei", label: OPCAO_DESCOBRIR }],
  },
];

/* ── O RAMO DO "NÃO SEI" DA ACIDOSE ────────────────────────────────────────── */

/**
 * ⚠️ A PERGUNTA DE JULGAMENTO TINHA VIRADO UM BECO, E O DEFEITO É NOSSO.
 *
 * Trocar `pH < 7,0` por *"é acidemia grave ou refratária?"* corrigiu a fonte e
 * criou outro problema: **transferiu o julgamento inteiro para o usuário — e o
 * usuário-alvo deste app é exatamente quem não tem esse julgamento.** Para quem
 * sabe responder, ótimo. Para quem não sabe, não havia ramo, não havia pista, e a
 * saída provável era chutar ou abandonar.
 *
 * A regra do app é anterior a esta rodada: toda decisão tem
 * **[Sim] [Não] [Não sei — me ajude a descobrir]**, e o "não sei" abre perguntas
 * **menores, respondíveis à beira do leito**. Sete módulos já fazem isso por
 * `instabilidade-guiada.ts`. Esta tela nasceu sem, e é correção, não trabalho novo.
 *
 * ⚠️ NENHUM NÚMERO NOVO ENTROU AQUI, e isso é travado: o ramo pergunta **o que se
 * pode ver**, não o que se pode medir. `valida-ira` reprova pH, BE, bicarbonato ou
 * qualquer decimal dentro deste bloco — é o buraco que o R-97 manda não preencher.
 */
export const ACIDOSE_GRAVE_DEFINICAO =
  "GRAVE (definição NOSSA) = com repercussão hemodinâmica, de ritmo, de consciência ou ventilatória ATRIBUÍVEL à acidemia.";

export const ACIDOSE_REFRATARIA_DEFINICAO =
  "REFRATÁRIA (definição NOSSA) = persiste ou piora APESAR do tratamento da causa e da restauração da perfusão.";

export const ACIDOSE_GUIADA_INTRO =
  "Nenhuma destas perguntas pede número. ⚠️ As duas palavras da pergunta anterior são operacionalização NOSSA — a KDIGO não as define por valor.";

export const CAMPOS_DE_ACIDOSE_GUIADA: InputField[] = [
  {
    id: "causaIdentificada",
    // ⚠️ ACIDOSE SEM CAUSA IDENTIFICADA NÃO É "LEVE", É NÃO AVALIADA — e era
    // assim que ela saía desta tela antes deste ramo existir.
    label: "A causa da acidose está identificada? (perfusão, sepse, cetoacidose, intoxicação, perda digestiva, a própria IRA)",
    presets: SIM_NAO,
  },
  { id: "causaTratada", label: "A causa está sendo tratada AGORA?", presets: SIM_NAO },
  {
    id: "reavaliou",
    // ⚠️ É ESTE ITEM QUE DEFINE REFRATÁRIA — e ele é TEMPORAL, não numérico.
    label: "Houve reavaliação depois de tratar a causa e restaurar a perfusão?",
    presets: [...SIM_NAO, { value: "sem_tempo", label: "Ainda não deu tempo" }],
  },
  {
    id: "repercussao",
    label: "Há repercussão atribuível à acidemia AGORA? (hipotensão que não responde a vasopressor · arritmia · rebaixamento de consciência · esforço ventilatório que o paciente não sustenta)",
    presets: SIM_NAO,
  },
  {
    id: "outraTrs",
    label: "Coexiste outra indicação de diálise? (potássio, congestão refratária, oligúria ou anúria, uremia)",
    presets: SIM_NAO,
  },
];

/**
 * A LEITURA, ESCRITA — não selo automático.
 *
 * ⚠️ O RETORNO NÃO CONCLUI TRS. Quem decide indicação dialítica é o nó da 5.1.1;
 * aqui se devolve o que foi respondido, lido junto, e o fluxo continua.
 */
export function leituraDaAcidose(v: TreeValues): string {
  const partes: string[] = [];
  partes.push(v.causaIdentificada === "sim" ? "causa identificada" : "causa NÃO identificada");
  if (v.causaIdentificada === "sim") {
    partes.push(v.causaTratada === "sim" ? "em tratamento" : "ainda sem tratamento da causa");
  }
  if (v.reavaliou === "sim") partes.push("reavaliada após correção");
  else if (v.reavaliou === "sem_tempo") partes.push("ainda sem tempo de reavaliar");
  else partes.push("sem reavaliação");
  partes.push(v.repercussao === "sim" ? "COM repercussão atribuível" : "sem repercussão atribuível");
  return partes.join(" · ");
}

/** Onde o ramo devolve — e nenhuma das saídas é "conclui diálise". */
export function destinoDaAcidoseGuiada(
  v: TreeValues
): "acid_causa" | "acid_outra_trs" | "trata_acidose" | "e5_uremia" {
  // ⚠️ A DECISÃO MIGRA quando há outra indicação — mas APONTA SEM SALTAR, e foi
  // a trava de pressuposição que mostrou por quê: saltar daqui para `trs_check`
  // criava caminho até os nós de destino PULANDO a coleta dos dados do caso, e
  // lá adiante o texto fala de creatinina e de exposição a nefrotóxico como se
  // alguém as tivesse perguntado. Mesmo desenho dos ramos do diurético.
  if (v.outraTrs === "sim") return "acid_outra_trs";
  // Sem causa identificada ou sem tratamento da causa: o passo seguinte é esse,
  // não graduar a acidemia.
  if (v.causaIdentificada !== "sim" || v.causaTratada !== "sim") return "acid_causa";
  // GRAVE (repercussão) ou REFRATÁRIA (persiste apesar de causa tratada e
  // perfusão restaurada) — as duas definições, aplicadas.
  if (v.repercussao === "sim") return "trata_acidose";
  if (v.reavaliou === "sim") return "trata_acidose";
  return "e5_uremia";
}

export function concluiAcidose(v: TreeValues): "sim" | "nao" {
  // ⚠️ O JULGAMENTO DECIDE. O pH e o bicarbonato continuam sendo colhidos porque
  // informam a decisão — mas nenhum número dispara sozinho, e é essa a mudança.
  if (v.acidemiaGrave === "sim") return "sim";
  if (v.acidemiaGrave === "nao") return "nao";
  const sinais = [v.kussmaul, v.taquipneiaSemHipoxemia, v.rebaixado].filter((x) => x === "sim");
  return sinais.length >= 2 ? "sim" : "nao";
}

/* ── 5/6 · UREMIA ──────────────────────────────────────────────────────────── */

export const CAMPOS_DE_UREMIA: InputField[] = [
  { id: "encefalopatia", label: "Está rebaixado, confuso ou com encefalopatia sem outra causa?", presets: SIM_NAO },
  { id: "asterixis", label: "Peça para estender as mãos: elas batem, como um aceno involuntário (asterixis)?", presets: SIM_NAO },
  { id: "atrito", label: "Ouve atrito ao auscultar o coração (atrito pericárdico)?", presets: SIM_NAO },
  { id: "vomitos", label: "Náusea e vômitos que não param?", presets: SIM_NAO },
  { id: "sangramento", label: "Sangramento — gengiva, nariz, digestivo, ou sítio de punção que não para?", presets: SIM_NAO },
];

/**
 * ⚠️ A TRAVA CLÍNICA DESTA EMERGÊNCIA: o que indica terapia de substituição é a
 * UREMIA SINTOMÁTICA, não o número da ureia. Por isso nenhum campo aqui pede
 * ureia — um valor alto sem sintoma não entra nesta conta, e um valor que
 * ninguém colheu não impede a conclusão.
 */
export const UREMIA_NAO_E_NUMERO =
  "⚠️ UREIA ISOLADA NÃO INDICA DIÁLISE. O que decide é a uremia SINTOMÁTICA — encefalopatia, pericardite, sangramento. Número alto sem sintoma não é indicação, e a diretriz recusa decidir por limiar isolado.";

export function concluiUremia(v: TreeValues): "sim" | "nao" {
  const sinais = [v.encefalopatia, v.asterixis, v.atrito, v.vomitos, v.sangramento];
  return sinais.some((x) => x === "sim") ? "sim" : "nao";
}

/* ── 6/6 · DIURESE ─────────────────────────────────────────────────────────── */

export const CAMPOS_DE_DIURESE: InputField[] = [
  {
    id: "temSonda",
    label: "O paciente tem sonda vesical?",
    presets: [
      { value: "sim", label: "Tem" },
      { value: "nao", label: "Não tem" },
    ],
  },
  {
    id: "debitoUltimaHora",
    label: "Com sonda: quanto saiu na última hora?",
    unit: "mL",
    presets: ["0", "10", "30", "60"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro valor",
    optional: true,
  },
  {
    // ⚠️ O PESO ENTRA AQUI PORQUE O CRITÉRIO É POR PESO. Vem preenchido do
    // contexto do paciente quando já foi informado neste atendimento — peso é
    // dado estável e compartilhável, ao contrário dos voláteis.
    id: "peso",
    label: "Peso",
    unit: "kg",
    presets: ["50", "60", "70", "80"].map((v) => ({ value: v, label: v })),
    allowCustom: true,
    customKeyboard: "numeric",
    customLabel: "Outro peso",
    optional: true,
  },
  {
    id: "bexigaPalpavel",
    label: "Sem sonda: a bexiga está palpável (globo) ou cheia ao ultrassom?",
    presets: [...SIM_NAO, { value: "nao_avaliado", label: "Não consegui avaliar" }],
    optional: true,
  },
];

/**
 * ⚠️ A TRAVA MAIS BARATA DE ERRAR DO MÓDULO: antes de chamar de anúria, excluir
 * RETENÇÃO URINÁRIA. Bexiga cheia não é anúria — é obstrução, que é reversível
 * em minutos e já tem lugar próprio no fluxo. Tratar retenção como anúria manda
 * o paciente para a investigação errada com a solução do lado.
 */
export const BEXIGA_CHEIA_NAO_E_ANURIA =
  // ⚠️ REESCRITA POR VARIÁVEIS, não por sujeito: "bexiga cheia com o paciente sem
// urinar" descrevia alguém; "bexiga cheia sem diurese" descreve o achado. Mesma
// informação, sem gente na frase (trava da vinheta).
  "⚠️ BEXIGA CHEIA NÃO É ANÚRIA — é obstrução, e ela se resolve em minutos. Rim que não filtra dá bexiga vazia; bexiga cheia sem diurese é saída bloqueada.";

/**
 * Intro do passo da diurese — FRASE INTEIRA, não concatenação.
 *
 * ⚠️ A primeira versão somava `INTRO_GUIADA + " " + DIURESE_SEM_PESO` no nó. O
 * texto chega à tela COMPOSTO, e a varredura de literais não vê a soma: fonte
 * única de TEXTO significa que a constante é a frase inteira.
 */
export const INTRO_DIURESE =
  "Responda o que dá para observar agora, à beira do leito. ⚠️ SEM O PESO, A LEITURA É APROXIMADA: o critério do KDIGO 2012 é por peso (0,5 mL/kg/h), e sem ele o app compara o volume absoluto — o que subestima em paciente grande e superestima em paciente pequeno.";

export type ConclusaoDeDiurese = "obstrucao" | "sim" | "nao";

/**
 * ⚠️ O CORTE É O DO KDIGO 2012 E É POR PESO: oligúria abaixo de 0,5 mL/kg/h.
 *
 * A primeira versão usava 30 mL/h fixo — simplificação sem peso de um critério
 * que É por peso. Trinta mL/h equivale a 0,5 mL/kg/h só num paciente de 60 kg:
 * para 45 kg classificava como oligúrico quem não era, e para 110 kg deixava
 * passar quem era. O mesmo 0,5 mL/kg/h que o estadiamento deste módulo já usa.
 *
 * Sem peso a conta não é possível, e o app NÃO inventa um: cai no volume
 * absoluto com a aproximação declarada em `DIURESE_SEM_PESO`. O piso de 30 mL/h
 * sobrevive só aí, e como aproximação assumida — não como critério.
 */
export function concluiDiurese(v: TreeValues): ConclusaoDeDiurese {
  if (v.temSonda === "nao" && v.bexigaPalpavel === "sim") return "obstrucao";
  const debito = Number(String(v.debitoUltimaHora ?? "").replace(",", "."));
  const peso = Number(String(v.peso ?? "").replace(",", "."));
  if (v.temSonda === "sim" && Number.isFinite(debito)) {
    if (Number.isFinite(peso) && peso > 0) return debito / peso < 0.5 ? "sim" : "nao";
    return debito < 30 ? "sim" : "nao";
  }
  // Sem sonda e sem globo, ou sem conseguir avaliar: não dá para afirmar que a
  // diurese está preservada. Segue como se estivesse caindo, que é o lado
  // seguro — e a próxima tela do fluxo é justamente a exclusão de obstrução.
  return "sim";
}

/* ── VOLEMIA · "o rim está recebendo sangue?" ──────────────────────────────── */

/**
 * ⚠️ NASCEU DE UMA FUSÃO INDEVIDA, E A REGRA JÁ EXISTIA (R-70): a opção do nó
 * dizia "Nem seco nem congesto, OU NÃO CONSIGO DEFINIR" — juntando DESCARTEI
 * com NÃO SEI numa tecla só. Quem avaliou e concluiu euvolemia e quem não fez
 * ideia iam para o mesmo lugar, e o app não tinha como oferecer ajuda a quem
 * precisava, nem respeitar quem não precisava.
 *
 * Os sinais aqui são os que o próprio nó já listava em `evidence` e `summary` —
 * nada de fonte nova: o que muda é que agora eles são PERGUNTA, não texto.
 */
export const CAMPOS_DE_VOLEMIA: InputField[] = [
  { id: "perdas", label: "Houve perda clara — vômito, diarreia, sangramento, dreno, jejum prolongado?", presets: SIM_NAO },
  { id: "mucosaSeca", label: "Mucosa seca, língua seca, axila sem suor?", presets: SIM_NAO },
  { id: "edema", label: "Edema de membros, ou inchaço que deixa marca do dedo?", presets: SIM_NAO },
  { id: "jugular", label: "Veias do pescoço cheias com a cabeceira elevada (estase jugular)?", presets: SIM_NAO },
  { id: "crepitacoesVol", label: "Estalidos (crepitações) na ausculta dos pulmões?", presets: SIM_NAO },
  { id: "ascite", label: "Barriga distendida com líquido (ascite)?", presets: SIM_NAO },
];

export type Volemia = "seco" | "congesto" | "indefinido";

/**
 * ⚠️ CONGESTO GANHA DO SECO QUANDO OS DOIS APARECEM. É a regra escrita no
 * próprio nó: insuficiência cardíaca descompensada e cirrose com ascite têm rim
 * hipoperfundido COM excesso de água — e ali volume PIORA. Errar para o lado do
 * volume nesses dois é o erro que não se desfaz rápido.
 */
export function concluiVolemia(v: TreeValues): Volemia {
  const congesto = [v.edema, v.jugular, v.crepitacoesVol, v.ascite].some((x) => x === "sim");
  if (congesto) return "congesto";
  if (v.perdas === "sim" || v.mucosaSeca === "sim") return "seco";
  return "indefinido";
}

/* ── CONTEXTO DE RISCO PARA HIPERCALEMIA ───────────────────────────────────── */

/**
 * Quando o traçado não dá para ler, é o risco de base que decide — e ele se
 * responde olhando prescrição e história, não o monitor.
 */
export const CAMPOS_DE_RISCO_DE_K: InputField[] = [
  { id: "kAnuria", label: "Está anúrico ou oligúrico?", presets: SIM_NAO },
  { id: "kRenal", label: "Tem injúria renal aguda ou doença renal crônica conhecida?", presets: SIM_NAO },
  { id: "kFarmaco", label: "Usa IECA, BRA, espironolactona ou suplemento de potássio?", presets: SIM_NAO },
  { id: "kLise", label: "Rabdomiólise, esmagamento, queimadura extensa ou lise tumoral?", presets: SIM_NAO },
];

export function temRiscoDeHipercalemia(v: TreeValues): boolean {
  return [v.kAnuria, v.kRenal, v.kFarmaco, v.kLise].some((x) => x === "sim");
}

/* ── DRC PRÉVIA · as pistas de cronicidade ─────────────────────────────────── */

/**
 * ⚠️ ISTO ERA UM BLOCO DE TEXTO QUE AFIRMAVA O QUE NINGUÉM PERGUNTOU.
 *
 * As pistas de cronicidade viviam num `porque` de três nós de ação, escritas
 * como se o app soubesse: "creatinina de 4 num paciente lúcido, comendo e sem
 * dispneia costuma ser crônica", "anemia normocítica sem sangramento que a
 * explique", "rins pequenos ao ultrassom". Nada disso é perguntado em caminho
 * nenhum do módulo — o app afirmava sobre um paciente que ele não examinou.
 *
 * ⚠️ E O BLOCO ABRIA COM UMA FRASE FALSA: "nenhum destes exige exame anterior".
 * Hemograma, ultrassom e cálcio/fósforo exigem, e são três dos cinco. A frase
 * saiu; cada pista agora diz o que é e o que custa.
 *
 * Tirar o bloco inteiro perderia o que a §6 da especificação chama de decisão
 * mais consequente do módulo — distinguir IRA de IRA sobre DRC. Então ele não
 * saiu: virou o RAMO DE DESCOBERTA de quem responde "não sei" àquela decisão,
 * que é exatamente quem precisa das pistas.
 */
export const CAMPOS_DE_CRONICIDADE: InputField[] = [
  {
    id: "poucoSintomatico",
    label: "À BEIRA DO LEITO — está lúcido, comendo e sem falta de ar, apesar de um número que assusta?",
    presets: [...SIM_NAO, { value: "nao_sei", label: "Não sei dizer" }],
  },
  {
    id: "usRins",
    label: "EXIGE ULTRASSOM — rins pequenos, córtex fino, ou perda da relação córtex-medular?",
    presets: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "sem_exame", label: "Não tenho o exame" },
    ],
  },
  {
    id: "anemia",
    label: "EXIGE HEMOGRAMA — anemia normocítica, sem sangramento que a explique?",
    presets: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "sem_exame", label: "Não tenho o exame" },
    ],
  },
  {
    id: "mineralOsseo",
    label: "EXIGE CÁLCIO E FÓSFORO — fósforo alto com cálcio baixo?",
    presets: [
      { value: "sim", label: "Sim" },
      { value: "nao", label: "Não" },
      { value: "sem_exame", label: "Não tenho o exame" },
    ],
  },
];

export const CRONICIDADE_INTRO =
  "Responda só o que você tiver. Duas destas exigem exame que talvez não esteja na mão, e o app diz isso em vez de fingir que basta olhar.";

export type LeituraDeCronicidade = "cronico" | "agudo" | "indeterminado";

/**
 * ⚠️ NENHUMA PISTA FECHA O DIAGNÓSTICO SOZINHA, e o desempate é conservador:
 * uma pista isolada não declara cronicidade. Duas ou mais apontam DRC prévia;
 * nenhuma pista com exame disponível aponta processo agudo; o resto é
 * INDETERMINADO — que a §6 manda existir, e que não é falha de resposta.
 */
export function concluiCronicidade(v: TreeValues): LeituraDeCronicidade {
  const chaves = ["poucoSintomatico", "usRins", "anemia", "mineralOsseo"];
  const sim = chaves.filter((k) => v[k] === "sim").length;
  const nao = chaves.filter((k) => v[k] === "nao").length;
  if (sim >= 2) return "cronico";
  if (sim === 0 && nao >= 2) return "agudo";
  return "indeterminado";
}
