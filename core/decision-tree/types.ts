export type DecisionOption = {
  id: string;
  label: string;
  next: string;
  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */
  showIf?: (values: TreeValues) => boolean;
  /**
   * ⚠️ A RESPOSTA VIAJA — e é por isso que este campo existe (R-122).
   *
   * Uma pergunta cujas respostas convergem para o mesmo destino só se justifica
   * se a resposta for CARREGADA ADIANTE. Se não é carregada, é toque que não
   * muda nada e não guarda nada — e o app vai reperguntar a mesma coisa três
   * telas depois.
   *
   * ⚠️ E O LIMITE, QUE É A METADE QUE PROTEGE: o que se grava aqui NÃO PODE
   * INFLUENCIAR CLASSIFICAÇÃO CLÍNICA. Serve para não reperguntar; nunca para
   * decidir gravidade. `valida-estado-nao-classifica` cobra isso.
   */
  grava?: { campo: string; valor: string };
};

/**
 * ── PRAZO DECLARADO NUM NÓ ──────────────────────────────────────────────────
 *
 * A árvore é DADO; o cronômetro é COMPORTAMENTO. O prazo é a costura, e por isso
 * é declarado como dado — mesmo precedente do `Roteamento`, que declara
 * `possiveis` porque a auditoria de grafo percorre estaticamente e não segue
 * função.
 *
 * ── A IDEIA QUE ORGANIZA O TIPO ─────────────────────────────────────────────
 *
 * O cronômetro NÃO é um contador — é uma pergunta sobre O QUE MEDIR, e a
 * pergunta muda com a fase. Por isso `marco` não tem default: um relógio sem
 * marco declarado responde "quanto tempo o app está aberto", que é a única
 * pergunta que nunca interessa.
 */
export type MarcoDePrazo =
  /** O evento clínico: início da crise, do trauma, da ingestão. */
  | "inicioDoEvento"
  /** A última dose administrada — para repique de fármaco. */
  | "ultimaDose"
  /** O início de uma terapia que muda o critério (anestésico no status). */
  | "inicioDoAnestesico"
  /** A entrada neste nó. Só para prazos que de fato começam na tela. */
  | "entradaNoNo";

export type Prazo = {
  /** Identidade do relógio. Nós da mesma linha do tempo compartilham. */
  id: string;
  /** Minutos desde o MARCO. */
  aos: number;
  /** De onde conta. SEM default de propósito. */
  marco: MarcoDePrazo;
  /** O que a tela diz quando vence. Literal, para ser traduzível (D-19). */
  aoVencer: string;
  /** Para onde o fluxo DEVERIA ir. Sugere; nunca navega sozinho. */
  sugereNo?: string;
  /**
   * O que acontece DEPOIS de vencer. Sem default: um relógio que estoura em
   * silêncio ensina que o problema acabou justamente quando ele piorou.
   */
  aoUltrapassar: "seguirContando" | "trocarDeMarco";
  /** Obrigatório quando `aoUltrapassar` é "trocarDeMarco". */
  proximoMarco?: MarcoDePrazo;
  /** Texto exibido depois da última marca da linha. Literal. */
  aoUltrapassarTexto?: string;
};

/** O que o runtime devolve para a tela sobre um prazo. */
export type PrazoAtivo = {
  id: string;
  /** Minutos decorridos desde o marco. */
  decorridoMin: number;
  /** Minutos até vencer. Negativo quando já venceu. */
  restanteMin: number;
  vencido: boolean;
  /** true quando o marco de origem não existe — contagem impossível. */
  semMarco: boolean;
  /** true quando a contagem começou do "não sei" e SUBESTIMA o real. */
  subestima: boolean;
  texto: string;
  sugereNo?: string;
};

type BaseNode = {
  id: string;
  title: string;
  summary?: string;
  /** Prazos que este nó declara. Ausente na esmagadora maioria dos nós. */
  prazos?: Prazo[];
};

/**
 * COMPARATIVO VISUAL — padrões desenhados lado a lado, dentro de uma decisão.
 *
 * ── ⚠️ POR QUE UM CAMPO NOVO NO NÚCLEO ─────────────────────────────────────
 *
 * Porque havia uma classe de pergunta que o app não sabia fazer: a de
 * RECONHECIMENTO DE PADRÃO. "O ECG tem ondas T apiculadas?" é, para quem não
 * tem experiência, uma tradução de frase em imagem — e ela caía justamente no
 * ramo mais letal do módulo renal. Descrever em texto o que se reconhece com o
 * olho transfere ao usuário a tarefa mais difícil da tela.
 *
 * `evidence` não serve: é lista de critérios em texto, e o problema é
 * exatamente o texto. Um nó de ação também não: a pergunta ainda não foi
 * respondida quando o desenho aparece — ele é o INSTRUMENTO da resposta.
 *
 * ── A REGRA QUE IMPEDE ISTO DE VIRAR ENFEITE ────────────────────────────────
 *
 * ⚠️ UMA IMAGEM SÓ ENTRA NUMA TELA SE MUDA A RESPOSTA DA PERGUNTA DAQUELA TELA.
 * Padrão diagnóstico que o usuário precisa reconhecer entra; anatomia
 * ilustrativa, ícone decorativo e esquema "educativo" não. É decisão do médico,
 * e existe porque a poluição de tela já foi o defeito mais caro deste app.
 *
 * Os três textos são literais, e por isso traduzíveis (D-19). `figura` é id de
 * desenho, não texto: não passa por tradução e é conferido por trava.
 */
export type ComparativoVisual = {
  /** Id do traçado em `design-system/tracado-de-ecg.ts`. */
  figura: string;
  /** Como se chama o padrão. */
  rotulo: string;
  /** O que ele significa — uma linha. */
  significado: string;
  /** O que fazer diante dele. Sem isto o desenho vira ilustração. */
  conduta: string;
};

export type DecisionNode = BaseNode & {
  type: "decision";
  question: string;
  evidence?: string[];
  /**
   * Padrões desenhados que a pergunta manda comparar. Ver `ComparativoVisual`.
   *
   * ⚠️ NÃO É CAMADA RECOLHIDA. `evidence` e `porque` ficam atrás de um toque
   * porque explicam; o comparativo é o instrumento da resposta e aparece
   * aberto — esconder o desenho devolveria a pergunta ao texto.
   */
  comparativo?: ComparativoVisual[];
  options: DecisionOption[];
};

/**
 * Roteamento DERIVADO — o app conclui em vez de perguntar.
 *
 * Nasceu de um pedido explícito: o usuário sem experiência não sabe responder
 * "há sinais de instabilidade?". A saída escolhida foi desmembrar a pergunta de
 * especialista em observações simples que qualquer um responde (a PA está
 * abaixo de 90? o paciente está sonolento?) e deixar o APP concluir.
 *
 * Para isso o nó de coleta precisa poder ir para lugares diferentes conforme o
 * que foi respondido. Mas um `next` que é função pura quebraria a auditoria: o
 * script de máquinas de estado percorre o grafo estaticamente e não consegue
 * seguir uma função.
 *
 * Por isso o roteamento declara os alvos POSSÍVEIS separadamente da escolha:
 * `possiveis` alimenta a validação e a alcançabilidade, `escolher` decide em
 * tempo de execução, e o motor garante que a escolha esteja entre os possíveis.
 */
export type Roteamento = {
  /** Todos os destinos que este nó pode assumir. Usado na validação estática. */
  possiveis: string[];
  /** Destino a partir dos valores coletados. Deve devolver um dos `possiveis`. */
  escolher: (values: TreeValues) => string;
};

export type ProximoNo = string | Roteamento;

/**
 * A FORÇA DA AFIRMAÇÃO — que TIPO de coisa a tela está dizendo.
 *
 * ── ⚠️ POR QUE `fonte` NÃO BASTA ───────────────────────────────────────────
 *
 * `fonte` responde DE ONDE VEIO. Não responde QUE TIPO DE AFIRMAÇÃO É. Hoje, na
 * mesma tela e com a mesma aparência, convivem:
 *
 *   · "5 golpes nas costas + 5 compressões abdominais" — AHA 2025, Classe 1, Nível A;
 *   · "furosemida pode aumentar a excreção urinária de potássio" — plausibilidade
 *     fisiológica, sem estudo de eficácia no cenário agudo.
 *
 * As duas têm fonte. As duas parecem iguais. **O usuário sem experiência não tem
 * como distinguir** — e ele é a população-alvo do app.
 *
 * A §20 da especificação do renal já mandava distinguir "recomendação
 * estabelecida · prática razoável · evidência limitada · decisão dependente do
 * contexto". Ficou como intenção em prosa por meses, e prosa não se cumpre
 * sozinha: virou campo.
 */
export type ForcaDaAfirmacao =
  /** A diretriz recomenda, e a classe/grau dela está declarada. */
  | "recomendacao_formal"
  /** Consenso, painel de especialistas, prática difundida. Não é recomendação graduada. */
  | "pratica_aceita"
  /** Plausível pela fisiologia; SEM evidência de eficácia no cenário. */
  | "mecanismo_fisiologico"
  /**
   * ⚠️ DEFINIÇÃO NÃO SE GRADUA — e por isso ela é um valor, não um caso especial
   * de recomendação.
   *
   * Uma diretriz não RECOMENDA que o estágio 3 seja o estágio 3: ela ESTABELECE.
   * Não se discorda de uma definição — adota-se ou não. Exigir classe/grau aqui
   * produziria uma classe que a fonte não dá, que é declaração falsa.
   *
   * ⚠️ E O RISCO DELA É OUTRO: não é evidência fraca, é VERSÃO DESATUALIZADA.
   * Por isso o campo obrigatório é a VERSÃO, e ela aparece na tela. Liga direto
   * na emenda E-9: a KDIGO 2026 segue draft, e no dia em que mudar o
   * estadiamento, é este campo que denuncia o app.
   */
  | "definicao";

/**
 * A procedência de um nó de conduta — força, fonte e o que cada força obriga.
 *
 * ⚠️ `contextoDaFonte` É O CAMPO QUE IMPEDE A TRANSPOSIÇÃO, e ele nasceu do erro
 * mais repetido deste projeto: pH < 7,0 vindo da cetoacidose, 126 mg/dL vindo do
 * diagnóstico de diabetes em jejum, UKKA 7.1 vindo da hipercalemia crônica na
 * comunidade. Nenhum linter julga semanticamente se houve transposição — mas
 * **exigir o campo obriga quem escreve a olhar**, e o que se declara, se confere.
 */
export type ProcedenciaDaConduta = {
  forca: ForcaDaAfirmacao;
  /** Referência curta, como aparece na tela. */
  fonte: string;
  /** Obrigatório em `recomendacao_formal`: a classe/grau LITERAL da fonte. */
  classeOuGrau?: string;
  /** Obrigatório em `pratica_aceita`: consenso, painel, revisão, bula… */
  tipoDeDocumento?: string;
  /** Obrigatório em `mecanismo_fisiologico`: o que falta de evidência. */
  lacunaDeEvidencia?: string;
  /**
   * Obrigatório em `definicao`: a versão adotada. É ela que envelhece — e é o
   * único aviso que o app dá quando a fonte publica uma revisão.
   */
  versao?: string;
  /**
   * Obrigatório quando o contexto ORIGINAL da fonte — população, cenário,
   * agudo × crônico — difere do nó que a usa.
   */
  contextoDaFonte?: string;
};

/**
 * UMA DECLARAÇÃO POR AFIRMAÇÃO — porque uma tela pode afirmar duas coisas.
 *
 * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-21) ────────────────────────────────
 *
 * `procedencia` é do NÓ, e isso pressupõe que toda tela faz uma afirmação só.
 * A revisão das dez pendências do renal mostrou que não: `pre_renal` diz
 * "cristaloide isotônico, não coloide" — que é **recomendação formal 2B** — e
 * também "dê em alíquotas e reavalie", que a KDIGO **não recomenda em lugar
 * nenhum**. `fazer_agora` mistura conduta com transição para outro módulo.
 *
 * Com um selo por tela, as duas viram uma: ou o 2B carimba a alíquota (força
 * emprestada), ou a alíquota rebaixa o 2B (força perdida). **As duas mentem, e
 * mentem para lados opostos.**
 *
 * ── COMO ISSO É DIFERENTE DE PARTIR O NÓ ──────────────────────────────────
 *
 * Partir seria a solução de arquitetura, e ela custa um passo a mais no fluxo —
 * quem está com o paciente na frente pagaria por um problema de catalogação.
 * Aqui a tela continua uma; **o que se separa é a declaração**.
 *
 * ⚠️ `afirmacao` É O TEXTO EXATO do item de `actions` que a declaração cobre. Não
 * é rótulo nem resumo: a trava confere identidade, não semelhança — se o item
 * mudar de redação, a declaração precisa mudar junto, e é isso que impede a
 * procedência ficar apontando para uma frase que já não existe.
 */
export type DeclaracaoDeAfirmacao = {
  /** O item de `actions`, LITERAL, que esta declaração cobre. */
  afirmacao: string;
  /** Ausente = `conduta`, e conduta exige `procedencia`. Ver `ActionNode.natureza`. */
  natureza?: "conduta" | "transicao" | "organizacao_do_atendimento";
  /** Proibida quando a natureza não é conduta — declarar força ali seria mentira. */
  procedencia?: ProcedenciaDaConduta;
};

export type ActionNode = BaseNode & {
  type: "action";
  /** Decisão de origem quando este nó materializa uma descoberta guiada canônica. */
  guidedDiscoveryOrigin?: string;
  actions: string[];
  /**
   * O PORQUÊ — atrás de um toque, ao lado da ação que ele explica.
   *
   * ── ⚠️ O DEFEITO QUE ORIGINOU (2026-08-18) ────────────────────────────────
   *
   * O passo de entrada da IRA tinha 44 instruções numa tela. Cada uma legível —
   * essa parte já tinha sido consertada —, o conjunto impossível. O critério que
   * faltava é do médico: UM PASSO MOSTRA SÓ O QUE PRECISA SER FEITO ANTES DA
   * PRÓXIMA DECISÃO. O que explica, justifica, lista critérios, estadia ou cita
   * fonte sai da tela e fica atrás de um toque. Nada se perde: muda de camada.
   *
   * `ActionNode` não tinha onde pôr isso. `evidence` existe só em `DecisionNode`
   * (C2), e nenhum nó de ação a usava — então a camada não existia para passos
   * de ação, que são a maioria.
   *
   * ── ⚠️ POR QUE UM CAMPO NOVO, E NÃO `evidence` NO ActionNode ──────────────
   *
   * Porque as duas coisas têm promessas diferentes, e juntá-las apagaria a
   * distinção que `valida-prazo-visivel` protege. `evidence` é o CRITÉRIO que
   * sustenta uma DECISÃO — quem lê está escolhendo entre opções. `porque` é a
   * RAZÃO de uma AÇÃO já decidida — quem lê está executando, e o "por quê"
   * existe para o usuário SEM EXPERIÊNCIA, que é a maior parte deles.
   *
   * ⚠️ VALE A MESMA REGRA DE PRAZO: nada com PRAZO ou PRECEDÊNCIA pode viver só
   * aqui. `valida-prazo-visivel` vigia este campo junto com `evidence`, pelo
   * mesmo motivo e com o mesmo teto — o toque esconde, e prazo escondido é a
   * única classe cujo custo é o paciente.
   *
   * OPCIONAL de propósito: os nós que já existem seguem válidos sem tocar em
   * nenhum deles.
   */
  porque?: string[];
  /**
   * Que tipo de afirmação esta tela faz. Ver `ProcedenciaDaConduta`.
   *
   * ⚠️ OPCIONAL NO TIPO, OBRIGATÓRIO NA TRAVA — e a diferença é deliberada: os
   * módulos que ainda não foram classificados continuam compilando, e
   * `test:forca-da-afirmacao` cobra por módulo, conforme cada um entra. Nó sem
   * procedência e sem pendência declarada reprova.
   */
  procedencia?: ProcedenciaDaConduta;
  /**
   * QUANDO A TELA AFIRMA MAIS DE UMA COISA — uma declaração por afirmação.
   *
   * ⚠️ `procedencia` É O PADRÃO DA TELA; `declaracoes` são as EXCEÇÕES NOMEADAS.
   * Não são duas fontes de verdade: são default e exceção, e a exceção diz a
   * qual item ela se aplica. `pre_renal` é o caso: a tela inteira é prática
   * aceita — desafio volêmico não é recomendado por diretriz nenhuma —, MENOS a
   * escolha do fluido, que é recomendação formal 2B. Um selo só faria o 2B
   * carimbar a alíquota, ou a alíquota rebaixar o 2B.
   *
   * ⚠️ Uma declaração que repete o padrão é ruído e reprova: exceção que não
   * excepciona só ensina a ignorar exceções.
   */
  declaracoes?: DeclaracaoDeAfirmacao[];
  /**
   * O QUE ESTE NÓ É — e nem todo nó de ação faz afirmação clínica.
   *
   * ⚠️ `transicao` — só roteia para outro módulo. A força é a das condutas do
   * módulo de DESTINO, e restá-la aqui seria DUPLICAR PROCEDÊNCIA, que é
   * exatamente como dois módulos divergem com o tempo.
   *
   * ⚠️ `organizacao_do_atendimento` — "acionar a nefrologia", "colher o exame",
   * "abrir a prescrição". Não são recomendações graduadas: são o fluxo do
   * atendimento. **Exigir força delas produziria declaração falsa** — o defeito
   * que este campo existe para impedir.
   *
   * Ausente = `conduta`, e conduta exige `procedencia`.
   */
  natureza?: "conduta" | "transicao" | "organizacao_do_atendimento";
  next: ProximoNo;
};

export type TransitionTarget = {
  moduleId: string;
  label: string;
  reason: string;
};

export type TransitionNode = BaseNode & {
  type: "transition";
  disposition: "discharge" | "observation" | "icu" | "other_module";
  exitCriteria: string[];
  targets: TransitionTarget[];
};

// ── Nó de coleta de valor por TOQUE (sem digitação obrigatória) ───────────────
export type InputPreset = {
  /** Valor armazenado (string). */
  value: string;
  /** Rótulo exibido no botão. */
  label: string;
};

export type InputField = {
  /** Chave onde o valor é guardado (usável em tokens {chave}). */
  id: string;
  label: string;
  unit?: string;
  /** Botões de valores rápidos. */
  presets: InputPreset[];
  /** Permite o usuário adicionar um valor próprio quando não está nos presets. */
  allowCustom?: boolean;
  /** Texto do campo "outro" (quando allowCustom). */
  customLabel?: string;
  /** Teclado do campo custom. */
  customKeyboard?: "numeric" | "default";
  /** Campo opcional não bloqueia o "continuar". */
  optional?: boolean;
  /**
   * ID de um escore de `clinical-calculators-engine` a ser embutido no passo,
   * recolhido, para o usuário calcular ali mesmo em vez de sair do fluxo.
   *
   * Existe porque pedir NIHSS e mandar abrir outro módulo trava quem não sabe o
   * escore — e quem sabe não precisava do desvio. Vale para qualquer escore
   * registrado: os pesos vêm de lá, nunca copiados, para que a calculadora do
   * fluxo e a da tela de calculadoras não possam divergir.
   */
  calculadora?: string;
};

export type InputNode = BaseNode & {
  type: "input";
  /** Instrução curta acima dos campos. */
  intro?: string;
  fields: InputField[];
  next: ProximoNo;
};

export type DecisionTreeNode = DecisionNode | ActionNode | TransitionNode | InputNode;

/** Valores coletados + derivados, usados em tokens {chave} e guardas. */
export type TreeValues = Record<string, string | undefined>;

export type DecisionTreeDefinition = {
  /**
   * Campos de entrada que FIXAM um marco de tempo.
   *
   * Declarado como dado, e não escondido num `if` do runtime, pelo mesmo motivo
   * do `Roteamento.possiveis`: quem lê a árvore precisa ver que aquele campo
   * arma um relógio. O valor do campo é o TEMPO DECORRIDO em minutos, ou
   * "desconhecido".
   */
  marcos?: Record<string, MarcoDePrazo>;
  id: string;
  version: string;
  label: string;
  entryNodeId: string;
  nodes: Record<string, DecisionTreeNode>;
  /**
   * Calcula valores DERIVADOS a partir dos valores coletados (ex.: dose por peso).
   * Os derivados ficam disponíveis em tokens {chave} nos textos e em guardas showIf.
   * Função pura — não deve ter efeitos colaterais.
   */
  derive?: (values: TreeValues) => Record<string, string>;
};

export type DecisionTreeLogEntry = {
  timestamp: number;
  event: "enter" | "answer" | "advance" | "reset" | "value";
  nodeId: string;
  nodeType: DecisionTreeNode["type"];
  optionId?: string;
  optionLabel?: string;
  fieldId?: string;
  value?: string;
};

export type DecisionTreeValidationIssue = {
  level: "error" | "warning";
  message: string;
  nodeId?: string;
};

export type FrontendTreeStep =
  | {
      id: string;
      kind: "decision";
      title: string;
      question: string;
      summary?: string;
      evidence: string[];
      /** Padrões desenhados, já interpolados. Ver `DecisionNode.comparativo`. */
      comparativo: ComparativoVisual[];
      options: Array<{ id: string; label: string }>;
    }
  | {
      id: string;
      kind: "action";
      title: string;
      summary?: string;
      /** Decisão para a qual a descoberta guiada deve retornar. */
      guidedDiscoveryOrigin?: string;
      actions: string[];
      /** O porquê, recolhido. Ver `ActionNode.porque`. */
      porque: string[];
      /** Força e procedência, já interpoladas. Ver `ProcedenciaDaConduta`. */
      procedencia?: ProcedenciaDaConduta;
      /** Uma declaração por afirmação, já interpoladas. Ver `DeclaracaoDeAfirmacao`. */
      declaracoes: DeclaracaoDeAfirmacao[];
      canContinue: true;
    }
  | {
      id: string;
      kind: "input";
      title: string;
      summary?: string;
      intro?: string;
      fields: InputField[];
      /** Valores atuais por field id. */
      values: TreeValues;
      /** true quando todos os campos obrigatórios têm valor. */
      canContinue: boolean;
    }
  | {
      id: string;
      kind: "transition";
      title: string;
      summary?: string;
      disposition: TransitionNode["disposition"];
      exitCriteria: string[];
      targets: TransitionTarget[];
    };
