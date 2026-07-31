export type DecisionOption = {
  id: string;
  label: string;
  next: string;
  /** Opcional: torna a opção visível apenas se a expressão de guarda for verdadeira. */
  showIf?: (values: TreeValues) => boolean;
};

type BaseNode = {
  id: string;
  title: string;
  summary?: string;
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
