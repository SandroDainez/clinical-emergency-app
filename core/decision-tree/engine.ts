import type {
  ActionNode,
  MarcoDePrazo,
  Prazo,
  PrazoAtivo,
  DecisionNode,
  DecisionTreeDefinition,
  DecisionTreeLogEntry,
  DecisionTreeNode,
  DecisionTreeValidationIssue,
  FrontendTreeStep,
  InputNode,
  ProcedenciaDaConduta,
  ProximoNo,
  TransitionNode,
  TreeValues,
} from "./types";

/**
 * Destinos possíveis de um `next`, seja ele fixo ou derivado.
 *
 * A validação e a alcançabilidade percorrem o grafo ESTATICAMENTE. Um `next`
 * que é função não pode ser seguido — por isso o roteamento derivado declara
 * `possiveis` à parte, e é isso que estas duas checagens consomem.
 */
function destinosPossiveis(next: ProximoNo): string[] {
  return typeof next === "string" ? [next] : next.possiveis;
}


function assertNodeExists(tree: DecisionTreeDefinition, nodeId: string): DecisionTreeNode {
  const node = tree.nodes[nodeId];
  if (!node) {
    throw new Error(`Decision tree "${tree.id}" references missing node "${nodeId}".`);
  }
  return node;
}

export function validateDecisionTree(tree: DecisionTreeDefinition): DecisionTreeValidationIssue[] {
  const issues: DecisionTreeValidationIssue[] = [];
  const nodeIds = new Set(Object.keys(tree.nodes));

  if (!nodeIds.has(tree.entryNodeId)) {
    issues.push({
      level: "error",
      nodeId: tree.entryNodeId,
      message: `Entry node "${tree.entryNodeId}" does not exist.`,
    });
  }

  for (const node of Object.values(tree.nodes)) {
    // ── Prazos declarados ────────────────────────────────────────────────
    //
    // O `marco` e o `aoUltrapassar` não têm default no tipo, e a validação
    // cobra os dois: o silêncio é o defeito que a proposta existe para
    // impedir. `sugereNo` tem de existir, senão a auditoria de grafo vê um
    // órfão que não há — o mesmo tropeço do Roteamento sem `possiveis`.
    for (const prazo of node.prazos ?? []) {
      if (!prazo.marco) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Prazo "${prazo.id}" sem marco declarado — contaria do app em vez do evento.`,
        });
      }
      if (!prazo.aoUltrapassar) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Prazo "${prazo.id}" sem aoUltrapassar — relógio que estoura em silêncio.`,
        });
      }
      if (prazo.aoUltrapassar === "trocarDeMarco" && !prazo.proximoMarco) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Prazo "${prazo.id}" troca de marco sem declarar proximoMarco.`,
        });
      }
      if (prazo.aoUltrapassar === "seguirContando" && !prazo.aoUltrapassarTexto) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Prazo "${prazo.id}" segue contando sem texto para depois da última marca.`,
        });
      }
      if (prazo.sugereNo && !nodeIds.has(prazo.sugereNo)) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: `Prazo "${prazo.id}" sugere no "${prazo.sugereNo}", que não existe.`,
        });
      }
    }

    if (node.type === "decision") {
      if (!node.options.length) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: "Decision node must expose at least one option.",
        });
      }

      for (const option of node.options) {
        if (!nodeIds.has(option.next)) {
          issues.push({
            level: "error",
            nodeId: node.id,
            message: `Decision option "${option.id}" points to missing node "${option.next}".`,
          });
        }
      }
    }

    if (node.type === "action") {
      for (const destino of destinosPossiveis(node.next)) {
        if (!nodeIds.has(destino)) {
          issues.push({
            level: "error",
            nodeId: node.id,
            message: `Action node points to missing next node "${destino}".`,
          });
        }
      }
    }

    if (node.type === "input") {
      if (!node.fields.length) {
        issues.push({
          level: "error",
          nodeId: node.id,
          message: "Input node must expose at least one field.",
        });
      }
      for (const destino of destinosPossiveis(node.next)) {
        if (!nodeIds.has(destino)) {
          issues.push({
            level: "error",
            nodeId: node.id,
            message: `Input node points to missing next node "${destino}".`,
          });
        }
      }
      if (typeof node.next !== "string" && node.next.possiveis.length < 2) {
        issues.push({
          level: "warning",
          nodeId: node.id,
          // Em inglês como as demais mensagens de validação deste arquivo: é
          // diagnóstico de desenvolvimento, não texto de tela — e a varredura de
          // português cobra tradução de qualquer literal em PT.
          message:
            "Derived routing declares fewer than two possible targets; use a fixed next when there is only one path.",
        });
      }
    }

    if (node.type === "transition" && !node.targets.length) {
      issues.push({
        level: "warning",
        nodeId: node.id,
        message: "Transition node has no declared targets.",
      });
    }
  }

  const reachable = new Set<string>();
  const stack = [tree.entryNodeId];
  while (stack.length) {
    const nodeId = stack.pop();
    if (!nodeId || reachable.has(nodeId) || !nodeIds.has(nodeId)) continue;
    reachable.add(nodeId);
    const node = tree.nodes[nodeId];
    if (node.type === "decision") {
      node.options.forEach((option) => stack.push(option.next));
    } else if (node.type === "action" || node.type === "input") {
      destinosPossiveis(node.next).forEach((destino) => stack.push(destino));
    }
  }

  for (const nodeId of nodeIds) {
    if (!reachable.has(nodeId)) {
      issues.push({
        level: "warning",
        nodeId,
        message: `Node "${nodeId}" is unreachable from entry node.`,
      });
    }
  }

  return issues;
}

export class DecisionTreeEngine {
  private readonly tree: DecisionTreeDefinition;
  private currentNodeId: string;
  private readonly log: DecisionTreeLogEntry[] = [];
  private history: string[] = [];
  private values: Record<string, string> = {};

  constructor(tree: DecisionTreeDefinition) {
    const issues = validateDecisionTree(tree).filter((issue) => issue.level === "error");
    if (issues.length) {
      throw new Error(
        `Invalid decision tree "${tree.id}": ${issues.map((issue) => issue.message).join(" | ")}`
      );
    }

    this.tree = tree;
    this.currentNodeId = tree.entryNodeId;
    this.history = [tree.entryNodeId];
    this.record("enter", this.getCurrentNode());
  }

  getCurrentNode(): DecisionTreeNode {
    return assertNodeExists(this.tree, this.currentNodeId);
  }

  getLog(): DecisionTreeLogEntry[] {
    return [...this.log];
  }

  // ── Valores coletados + derivados ───────────────────────────────────────────
  getValues(): TreeValues {
    return { ...this.values, ...this.getDerived() };
  }

  private getDerived(): Record<string, string> {
    try {
      return this.tree.derive?.({ ...this.values }) ?? {};
    } catch {
      return {};
    }
  }

  setValue(fieldId: string, value: string): void {
    if (value.trim().length === 0) {
      delete this.values[fieldId];
    } else {
      this.values[fieldId] = value;
    }

    // Campo que ARMA um relógio: a árvore declara quais são (tree.marcos).
    //
    // "desconhecido" NÃO cai em zero silencioso — cai em zero DECLARADO, com a
    // marca de subestimação, para a tela dizer que a fase real pode ser mais
    // avançada que a exibida.
    const marco = this.tree.marcos?.[fieldId];
    if (marco) {
      const desconhecido = value.trim().toLowerCase() === "desconhecido";
      const decorrido = desconhecido ? 0 : Number(value);
      if (desconhecido || Number.isFinite(decorrido)) {
        this.marcar(marco, desconhecido ? 0 : decorrido, { subestima: desconhecido });
      }
    }

    this.record("value", this.getCurrentNode(), undefined, undefined, fieldId, value);
  }

  // ── MARCOS ────────────────────────────────────────────────────────────
  //
  // O marco é um VALOR, gravado em `values` como qualquer campo — então
  // persistência, log e auditoria já funcionam sem código novo. A chave é
  // `__marco_<nome>` e guarda o timestamp em milissegundos.
  //
  // ⚠️ `marcarAgoraMenos` existe porque o relógio conta do EVENTO, não do app.
  // Um paciente que convulsiona há 12 min quando o app abre já está na janela
  // da segunda linha; contar do zero diria "faltam 8 min para a 1ª linha".

  private static chaveDoMarco(marco: MarcoDePrazo): string {
    return `__marco_${marco}`;
  }

  /** Fixa o marco em (agora − decorridoMin). Zero = começa agora. */
  marcar(marco: MarcoDePrazo, decorridoMin = 0, opcoes?: { subestima?: boolean }): void {
    const origem = Date.now() - decorridoMin * 60_000;
    this.values[DecisionTreeEngine.chaveDoMarco(marco)] = String(origem);
    if (opcoes?.subestima) {
      this.values[`${DecisionTreeEngine.chaveDoMarco(marco)}__subestima`] = "1";
    } else {
      delete this.values[`${DecisionTreeEngine.chaveDoMarco(marco)}__subestima`];
    }
    this.record("value", this.getCurrentNode(), undefined, undefined, DecisionTreeEngine.chaveDoMarco(marco), String(origem));
  }

  temMarco(marco: MarcoDePrazo): boolean {
    return Boolean(this.values[DecisionTreeEngine.chaveDoMarco(marco)]);
  }

  /**
   * Prazos ATIVOS do nó atual.
   *
   * Devolve sempre — inclusive vencidos e inclusive sem marco. Sumir é o modo
   * de falha que a proposta existe para evitar: relógio que desaparece ensina
   * que o problema acabou.
   */
  getPrazos(agora = Date.now()): PrazoAtivo[] {
    const no = this.getCurrentNode();
    const prazos = no.prazos ?? [];
    return prazos.map((p) => this.avaliarPrazo(p, agora));
  }

  private avaliarPrazo(p: Prazo, agora: number): PrazoAtivo {
    const marcoAtual: MarcoDePrazo =
      p.aoUltrapassar === "trocarDeMarco" && p.proximoMarco && this.temMarco(p.proximoMarco)
        ? p.proximoMarco
        : p.marco;

    const bruto = this.values[DecisionTreeEngine.chaveDoMarco(marcoAtual)];
    if (!bruto) {
      // Falha DECLARADA em vez de contagem errada silenciosa.
      return {
        id: p.id,
        decorridoMin: 0,
        restanteMin: p.aos,
        vencido: false,
        semMarco: true,
        subestima: false,
        texto: p.aoVencer,
        sugereNo: p.sugereNo,
      };
    }

    const decorridoMin = Math.floor((agora - Number(bruto)) / 60_000);
    const restanteMin = p.aos - decorridoMin;
    const vencido = restanteMin <= 0;
    const trocou = marcoAtual !== p.marco;

    // Depois da última marca o relógio NÃO some: muda o que ele diz.
    const texto = vencido && !trocou && p.aoUltrapassarTexto ? p.aoUltrapassarTexto : p.aoVencer;

    return {
      id: p.id,
      decorridoMin,
      restanteMin,
      vencido,
      semMarco: false,
      subestima: this.values[`${DecisionTreeEngine.chaveDoMarco(marcoAtual)}__subestima`] === "1",
      texto,
      sugereNo: p.sugereNo,
    };
  }

  /** Substitui tokens {chave} pelos valores coletados/derivados. */
  private interpolate(text: string): string {
    const all = this.getValues();
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const v = all[key];
      return v !== undefined && v !== "" ? v : match;
    });
  }

  reset(): DecisionTreeNode {
    this.currentNodeId = this.tree.entryNodeId;
    this.history = [this.tree.entryNodeId];
    this.values = {};
    this.record("reset", this.getCurrentNode());
    this.record("enter", this.getCurrentNode());
    return this.getCurrentNode();
  }

  canGoBack(): boolean {
    return this.history.length > 1;
  }

  goToNode(nodeId: string): DecisionTreeNode {
    const nextNode = assertNodeExists(this.tree, nodeId);
    if (this.currentNodeId === nodeId) {
      return nextNode;
    }

    this.currentNodeId = nodeId;
    this.history.push(nodeId);
    this.record("enter", nextNode);
    return nextNode;
  }

  goBack(): DecisionTreeNode {
    if (!this.canGoBack()) {
      return this.getCurrentNode();
    }

    this.history = this.history.slice(0, -1);
    this.currentNodeId = this.history[this.history.length - 1];
    return this.getCurrentNode();
  }

  choose(optionId: string): DecisionTreeNode {
    const node = this.getCurrentNode();
    if (node.type !== "decision") {
      throw new Error(`Cannot answer node "${node.id}" because it is not a decision node.`);
    }

    const option = node.options.find((item) => item.id === optionId);
    if (!option) {
      throw new Error(`Decision node "${node.id}" does not contain option "${optionId}".`);
    }

    // ⚠️ A RESPOSTA VIAJA (R-122): a opção pode gravar o que foi respondido, para
    // que o fluxo não repergunte adiante. O que se grava é DISPONIBILIDADE DE
    // DADO, nunca classificação — ver `DecisionOption.grava`.
    if (option.grava) this.setValue(option.grava.campo, option.grava.valor);
    this.record("answer", node, option.id, option.label);
    this.currentNodeId = option.next;
    this.history.push(option.next);
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  advance(): DecisionTreeNode {
    const node = this.getCurrentNode();
    if (node.type !== "action" && node.type !== "input") {
      throw new Error(`Cannot advance node "${node.id}" because it is not an action/input node.`);
    }

    // ── Campo obrigatório é conferido AQUI, não na tela ──────────────────────
    //
    // `canContinue` já era calculado, mas só chegava até `disabled` no botão de
    // avançar. Validação que vive na apresentação vale para quem passa pelo
    // botão — e mais ninguém: comando de voz, link direto, teste e código
    // futuro entravam por baixo dela.
    //
    // Isso importa porque o roteamento derivado LÊ esses campos. Avançar sem
    // preencher não dava erro: a derivação recebia valor vazio, e um campo em
    // branco não é "resposta negativa" — é ausência de resposta. O caso concreto
    // era a pressão sistólica: vazia, virava "não hipotenso", e o app concluía
    // ESTÁVEL sem ninguém ter medido a pressão.
    //
    // Campo `optional` continua podendo faltar, e isso é parte do desenho: os
    // pares de confirmação dos critérios compostos (enchimento capilar,
    // congestão) existem justamente para poderem não ser avaliados — a ausência
    // deles significa "não confirmado", que é diferente de "não preenchido".
    if (node.type === "input") {
      // Basta comparar com `undefined`: `setValue` já normaliza — valor só com
      // espaços APAGA a chave em vez de gravar string vazia. A primeira versão
      // desta linha também testava `=== ""`, uma condição que não tem como
      // acontecer pela API e que nenhuma mutação conseguia derrubar. Regra que
      // não pode falhar não protege nada; foi retirada.
      const faltando = node.fields.filter((f) => !f.optional && this.values[f.id] === undefined);
      if (faltando.length) {
        throw new Error(
          `Node "${node.id}": campo obrigatório não preenchido — ` +
            `${faltando.map((f) => `"${f.id}"`).join(", ")}. ` +
            `advance() recusa avançar: o roteamento derivado leria valor ausente como resposta.`
        );
      }
    }

    this.record("advance", node);

    let destino: string;
    if (typeof node.next === "string") {
      destino = node.next;
    } else {
      destino = node.next.escolher(this.getValues());
      // Sem esta trava, um roteamento derivado poderia sair do grafo declarado e
      // a auditoria estática deixaria de valer para ele.
      if (!node.next.possiveis.includes(destino)) {
        throw new Error(
          `Node "${node.id}": roteamento derivado escolheu "${destino}", que não está entre os possíveis (${node.next.possiveis.join(", ")}).`
        );
      }
    }

    this.currentNodeId = destino;
    this.history.push(destino);
    const nextNode = this.getCurrentNode();
    this.record("enter", nextNode);
    return nextNode;
  }

  toFrontendStep(): FrontendTreeStep {
    const node = this.getCurrentNode();
    if (node.type === "decision") {
      return mapDecisionNode(node, this.getValues(), (t) => this.interpolate(t));
    }
    if (node.type === "action") {
      return mapActionNode(node, (t) => this.interpolate(t));
    }
    if (node.type === "input") {
      return mapInputNode(node, this.values, (t) => this.interpolate(t));
    }
    return mapTransitionNode(node, (t) => this.interpolate(t));
  }

  private record(
    event: DecisionTreeLogEntry["event"],
    node: DecisionTreeNode,
    optionId?: string,
    optionLabel?: string,
    fieldId?: string,
    value?: string
  ) {
    this.log.push({
      timestamp: 0,
      event,
      nodeId: node.id,
      nodeType: node.type,
      optionId,
      optionLabel,
      fieldId,
      value,
    });
  }
}

function mapDecisionNode(
  node: DecisionNode,
  values: TreeValues,
  interpolate: (t: string) => string
): FrontendTreeStep {
  return {
    id: node.id,
    kind: "decision",
    title: interpolate(node.title),
    question: interpolate(node.question),
    summary: node.summary ? interpolate(node.summary) : undefined,
    evidence: (node.evidence ?? []).map(interpolate),
    // Interpolado como o resto: o rótulo e a conduta do padrão podem citar
    // valores do caso. `figura` é id de desenho e não passa por interpolação.
    comparativo: (node.comparativo ?? []).map((c) => ({
      figura: c.figura,
      rotulo: interpolate(c.rotulo),
      significado: interpolate(c.significado),
      conduta: interpolate(c.conduta),
    })),
    options: node.options
      .filter((option) => !option.showIf || option.showIf(values))
      .map((option) => ({ id: option.id, label: interpolate(option.label) })),
  };
}

function mapActionNode(node: ActionNode, interpolate: (t: string) => string): FrontendTreeStep {
  return {
    id: node.id,
    kind: "action",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    guidedDiscoveryOrigin: node.guidedDiscoveryOrigin,
    actions: node.actions.map(interpolate),
    // Interpolado como as ações: o porquê pode citar peso, dose ou valor do caso.
    porque: (node.porque ?? []).map(interpolate),
    procedencia: node.procedencia ? interpolarProcedencia(node.procedencia, interpolate) : undefined,
    // ⚠️ A AFIRMAÇÃO TAMBÉM É INTERPOLADA — ela é o texto LITERAL do item, e o
    // item pode citar peso ou dose. Interpolar um lado só faria a declaração
    // deixar de casar com a ação que ela cobre, justamente nos nós com valor.
    declaracoes: (node.declaracoes ?? []).map((d) => ({
      ...d,
      afirmacao: interpolate(d.afirmacao),
      procedencia: d.procedencia ? interpolarProcedencia(d.procedencia, interpolate) : undefined,
    })),
    canContinue: true,
  };
}

/** Interpola os campos de texto da procedência — um lugar só, dois usos. */
function interpolarProcedencia(
  p: ProcedenciaDaConduta,
  interpolate: (t: string) => string
): ProcedenciaDaConduta {
  return {
    ...p,
    fonte: interpolate(p.fonte),
    lacunaDeEvidencia: p.lacunaDeEvidencia ? interpolate(p.lacunaDeEvidencia) : undefined,
    contextoDaFonte: p.contextoDaFonte ? interpolate(p.contextoDaFonte) : undefined,
  };
}

function mapInputNode(
  node: InputNode,
  rawValues: Record<string, string>,
  interpolate: (t: string) => string
): FrontendTreeStep {
  const canContinue = node.fields.every(
    (f) => f.optional || (rawValues[f.id] !== undefined && rawValues[f.id] !== "")
  );
  return {
    id: node.id,
    kind: "input",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    intro: node.intro ? interpolate(node.intro) : undefined,
    fields: node.fields,
    values: { ...rawValues },
    canContinue,
  };
}

function mapTransitionNode(
  node: TransitionNode,
  interpolate: (t: string) => string
): FrontendTreeStep {
  return {
    id: node.id,
    kind: "transition",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    disposition: node.disposition,
    exitCriteria: node.exitCriteria.map(interpolate),
    targets: [...node.targets],
  };
}
