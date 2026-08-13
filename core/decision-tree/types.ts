export type DecisionOption = {
  id: string;
  label: string;
  next: string;
  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */
  showIf?: (values: TreeValues) => boolean;
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

export type DecisionNode = BaseNode & {
  type: "decision";
  question: string;
  evidence?: string[];
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

export type ActionNode = BaseNode & {
  type: "action";
  actions: string[];
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
      options: Array<{ id: string; label: string }>;
    }
  | {
      id: string;
      kind: "action";
      title: string;
      summary?: string;
      actions: string[];
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
