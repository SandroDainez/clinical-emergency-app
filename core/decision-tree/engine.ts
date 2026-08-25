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
  DecisaoRegistrada,
  EstadoDaAcao,
  EstadoSerializado,
  InputNode,
  Medicao,
  ProcedenciaDaConduta,
  ProximoNo,
  TransitionNode,
  TipoDeSaida,
  TreeValues,
  Veredito,
  VereditoSpec,
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
  /**
   * ⚠️ HISTÓRICO EM MAPA SEPARADO, NUNCA DENTRO DE `values` (2026-08-25).
   *
   * `TreeValues` é `Record<string, string>` e é lido por 30 módulos, por todas
   * as funções `escolher` de roteamento e por todos os validadores. Trocar seu
   * formato para carregar histórico obrigaria a revisar cada um desses
   * consumidores — e um único esquecido vira roteamento clínico errado. O mapa
   * paralelo dá memória ao motor sem mexer no contrato que o app inteiro usa.
   */
  private historico: Record<string, Medicao[]> = {};
  /**
   * Relógio injetável. O motor precisa carimbar a hora de cada medição, e
   * teste com relógio real seria teste com resultado variável.
   */
  private readonly agora: () => number;
  /** Ações efetivamente executadas, por id de VereditoSpec. */
  private realizadas: Record<string, number> = {};
  /** Decisões clínicas tomadas, em ordem. */
  private decisoes: DecisaoRegistrada[] = [];

  constructor(tree: DecisionTreeDefinition, opcoes?: { agora?: () => number }) {
    const issues = validateDecisionTree(tree).filter((issue) => issue.level === "error");
    if (issues.length) {
      throw new Error(
        `Invalid decision tree "${tree.id}": ${issues.map((issue) => issue.message).join(" | ")}`
      );
    }

    this.tree = tree;
    this.agora = opcoes?.agora ?? (() => Date.now());
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

  /**
   * Abre a re-medida: apaga os VALORES dos campos indicados e PRESERVA a
   * trilha.
   *
   * ⚠️ APAGAR O VALOR É O PONTO — e preservar a trilha é a razão de existirem
   * dois mapas. Sem apagar, a tela de input não volta a pedir o dado (ela só
   * cobra campo vazio) e a "correção" viraria confirmação do valor antigo. Sem
   * a trilha, o médico perderia a evidência de que havia um impedimento: a
   * tela mostraria 168/96 como se nunca tivesse havido 194/116.
   */
  remedir(campos: string[]): void {
    for (const campo of campos) delete this.values[campo];
  }

  /**
   * Reaplica um valor SEM criar trilha — só para o replay de sessão antiga.
   *
   * ⚠️ A REGRA DO AUTOR É EXPLÍCITA (2026-08-25): sessão antiga restaura
   * `values` e inicializa `historico`, `realizadas` e `decisoes` VAZIOS —
   * "nunca inventar trilha anterior".
   *
   * `setValue` normal criaria, para cada campo reaplicado, uma medição
   * carimbada no instante da RETOMADA e marcada como `primeira_medida`. Não é
   * uma trilha falsa no sentido de inventar um valor que nunca existiu — mas é
   * uma medição que ninguém fez naquela hora, e o sumário do caso a leria como
   * se fosse. Trilha ausente é um estado honesto; trilha inventada não.
   *
   * Delega a `setValue` de propósito, em vez de reimplementar: os efeitos
   * colaterais que o replay PRECISA manter (marco armado, log) moram lá, e uma
   * segunda cópia deles divergiria no primeiro ajuste.
   */
  reaplicarValorSemTrilha(fieldId: string, value: string): void {
    const antes = this.historico[fieldId] ? [...this.historico[fieldId]] : undefined;
    this.setValue(fieldId, value);
    if (antes) this.historico[fieldId] = antes;
    else delete this.historico[fieldId];
  }

  /** A trilha bruta de um campo — vazia quando nunca foi medido. */
  getHistorico(fieldId: string): Medicao[] {
    return [...(this.historico[fieldId] ?? [])];
  }

  /** Todas as trilhas, para a tela montar o "de → para" sem consultar campo a campo. */
  getHistoricoCompleto(): Record<string, Medicao[]> {
    const saida: Record<string, Medicao[]> = {};
    for (const [k, v] of Object.entries(this.historico)) saida[k] = [...v];
    return saida;
  }

  private getDerived(): Record<string, string> {
    try {
      return this.tree.derive?.({ ...this.values }) ?? {};
    } catch {
      return {};
    }
  }

  /**
   * @param origem de onde veio o dado. Um valor "estimado" e um "aferido" têm
   *   peso clínico diferente e a tela precisa poder distingui-los; "corrigido"
   *   é o que a re-medida grava depois de tratar a condição corrigível.
   */
  setValue(
    fieldId: string,
    value: string,
    origem?: Medicao["origem"],
    motivo?: Medicao["motivo"]
  ): void {
    if (value.trim().length === 0) {
      delete this.values[fieldId];
    } else {
      this.values[fieldId] = value;
      // ⚠️ A TRILHA SÓ CRESCE QUANDO O VALOR MUDA. Reabrir a mesma tela e
      // confirmar o mesmo número não é uma nova medição — se contasse, a
      // trilha viraria "168/96 → 168/96 → 168/96" e deixaria de comunicar o
      // que ela existe para comunicar: que houve correção.
      const trilhaCampo = (this.historico[fieldId] ??= []);
      const ultima = trilhaCampo[trilhaCampo.length - 1];
      if (!ultima || ultima.valor !== value) {
        // ⚠️ `anterior` é redundante com a trilha DE PROPÓSITO: quem mostra uma
        // linha de sumário ("PA 194/116 → 168/96, após intervenção, 13:42") lê
        // UMA medição, e reconstruir o par obrigaria cada consumidor a parear
        // índices por conta própria — alguns fariam certo, outros não.
        trilhaCampo.push({
          valor: value,
          em: this.agora(),
          origem,
          anterior: ultima?.valor,
          motivo: motivo ?? (ultima ? undefined : "primeira_medida"),
        });
      }
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
    // Pelo relógio injetável, e não por `Date.now()` direto: sem isso, provar o
    // deslocamento do marco exigiria substituir `Date.now` global no teste — o
    // que testa o mundo, não o motor.
    const origem = this.agora() - decorridoMin * 60_000;
    this.values[DecisionTreeEngine.chaveDoMarco(marco)] = String(origem);
    if (opcoes?.subestima) {
      this.values[`${DecisionTreeEngine.chaveDoMarco(marco)}__subestima`] = "1";
    } else {
      delete this.values[`${DecisionTreeEngine.chaveDoMarco(marco)}__subestima`];
    }
    this.record("value", this.getCurrentNode(), undefined, undefined, DecisionTreeEngine.chaveDoMarco(marco), String(origem));
  }


  // ── PRESERVAÇÃO DO MARCO NA RETOMADA ──────────────────────────────────
  //
  // ⚠️ CAUSA RAIZ DO DEFEITO (medido em 2026-08-25): a retomada de fluxo não
  // restaura estado — ela faz REPLAY (`reset()` + `setValue` de cada valor
  // salvo). E `setValue` de um campo declarado em `tree.marcos` chama
  // `marcar()`, que ancora o marco em `Date.now() − decorrido`. No replay,
  // `Date.now()` é o instante da RETOMADA — então um paciente que convulsiona
  // há 12 min, cujo médico saiu para consultar outro protocolo por 8 minutos,
  // volta com a crise "rejuvenescida" em 8 minutos. Em estado epiléptico, isso
  // atrasa a segunda e a terceira linha exatamente pelo tempo que ele gastou
  // consultando.
  //
  // A correção é deliberadamente pequena: a tela guarda os marcos como estavam
  // e os recoloca DEPOIS do replay, sobrescrevendo os que o replay regenerou.
  //
  // ⚠️ POR QUE NÃO PASSA POR `setValue`: (a) o valor voltaria a disparar
  // `marcar()` e o problema se repetiria; (b) `setValue` alimenta a trilha
  // clínica, e um campo interno de relógio não é uma medição do paciente —
  // criar histórico para ele seria sintetizar trilha, que é justamente o que
  // não se pode fazer aqui.

  /** Os marcos como estão, para a sessão guardar. Chaves `__marco_*`. */
  exportarMarcos(): Record<string, string> {
    const saida: Record<string, string> = {};
    for (const [k, v] of Object.entries(this.values)) {
      if (k.startsWith("__marco_")) saida[k] = v;
    }
    return saida;
  }

  /**
   * Recoloca marcos salvos, com os instantes ORIGINAIS.
   *
   * Só aceita chaves `__marco_*`: é restauração de relógio, não uma porta
   * lateral para gravar valor clínico sem passar pelo caminho normal.
   */
  restaurarMarcos(marcos: Record<string, string> | undefined): void {
    if (!marcos) return;
    for (const [k, v] of Object.entries(marcos)) {
      if (!k.startsWith("__marco_")) continue;
      this.values[k] = v;
    }
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


  // ── AÇÕES CLÍNICAS: veredito, decisão e execução ──────────────────────────
  //
  // ⚠️ ESTE BLOCO É A INVARIANTE MAIS IMPORTANTE DO NÚCLEO (exigência do autor,
  // 2026-08-25): "`canContinue=true` pode permitir continuar o atendimento, mas
  // nunca libera a ação clínica bloqueada".
  //
  // As duas coisas vivem em portas separadas de propósito. `advance()` move o
  // ATENDIMENTO — e bloquear o atendimento por causa de um fármaco deixaria o
  // médico sem o resto da via. `registrarExecucao()` marca a AÇÃO como feita, e
  // é ela que recusa. Enquanto o veredito impeditivo estiver ativo, não existe
  // caminho no motor que marque a ação como realizada.

  /** O veredito atual de uma ação declarada pelo nó em que se está. */
  vereditoDe(vereditoId: string): Veredito | null {
    const node = this.getCurrentNode();
    const specs = node.type === "transition" ? undefined : node.vereditos;
    const spec = (specs ?? []).find((v) => v.id === vereditoId);
    return spec ? spec.avaliar(this.getValues()) : null;
  }

  /** O estado de execução de uma ação — deriva do veredito e do que já foi feito. */
  estadoDaAcao(vereditoId: string): EstadoDaAcao {
    const v = this.vereditoDe(vereditoId);
    if (this.realizadas[vereditoId] !== undefined) return "realizada";
    if (!v) return "nao_indicada";
    if (v.nivel === "vermelho") return "contraindicada";
    return "pendente";
  }

  /**
   * Registra QUAL decisão o médico tomou diante de um veredito amarelo.
   *
   * ⚠️ UM BOOLEANO NÃO BASTA (correção do autor, 2026-08-25). "Houve decisão"
   * não permite reconstruir o atendimento; o sumário precisa poder dizer
   * "hipotensão identificada → intervenção realizada → PA corrigida →
   * medicamento liberado", e para isso a saída escolhida tem de ficar
   * registrada — junto com o nível e o motivo COMO ESTAVAM no momento, porque
   * o veredito é derivado e, depois de uma correção, já não diz o que dizia
   * quando a decisão foi tomada.
   */
  registrarDecisao(vereditoId: string, tipo: TipoDeSaida): void {
    const v = this.vereditoDe(vereditoId);
    if (!v) throw new Error(`Veredito "${vereditoId}" não existe no nó "${this.currentNodeId}".`);
    const oferecida = (v.decisao?.saidas ?? []).some((s) => s.tipo === tipo);
    if (!oferecida) {
      throw new Error(
        `Decisão "${tipo}" não é oferecida por "${vereditoId}" no nível ${v.nivel}. ` +
        `Registrar uma saída que a tela não ofereceu inventaria consentimento que ninguém deu.`
      );
    }
    if (v.decisao) this.values[v.decisao.campo] = tipo;
    this.decisoes.push({
      vereditoId,
      tipo,
      nivelNoMomento: v.nivel,
      motivoNoMomento: v.motivo,
      em: this.agora(),
    });
  }

  /** As decisões tomadas, em ordem — matéria-prima do sumário do caso. */
  getDecisoes(): DecisaoRegistrada[] {
    return [...this.decisoes];
  }

  /**
   * Marca uma ação como EXECUTADA — e recusa quando o veredito não permite.
   *
   * ⚠️ ESTA É A ÚNICA PORTA PARA "realizada", e por isso ela é o lugar certo da
   * trava. Se a tela pudesse marcar execução por conta própria, a invariante
   * viraria disciplina de quem escreve tela — e disciplina não é trava.
   *
   * Vermelho recusa sempre: não há "prosseguir mesmo assim". Amarelo só passa
   * com a decisão `prosseguir` já registrada — o consentimento tem de existir
   * ANTES da execução, senão o registro viraria justificativa retroativa.
   */
  registrarExecucao(vereditoId: string): void {
    const v = this.vereditoDe(vereditoId);
    if (!v) throw new Error(`Veredito "${vereditoId}" não existe no nó "${this.currentNodeId}".`);
    if (v.nivel === "vermelho") {
      throw new Error(
        `Ação "${vereditoId}" está contraindicada (${v.motivo}) e não pode ser marcada como realizada. ` +
        `O caminho é corrigir o dado que impede ou seguir sem ela.`
      );
    }
    if (v.nivel === "amarelo") {
      const decidiuProsseguir = this.decisoes.some(
        (d) => d.vereditoId === vereditoId && d.tipo === "prosseguir"
      );
      if (!decidiuProsseguir) {
        throw new Error(
          `Ação "${vereditoId}" exige decisão clínica explícita antes da execução (${v.motivo}).`
        );
      }
    }
    this.realizadas[vereditoId] = this.agora();
  }

  // ── SNAPSHOT: sair da tela e voltar sem perder o caso ─────────────────────
  //
  // ⚠️ ANTES DISTO, A RETOMADA FALSIFICAVA A TRILHA. `lib/flow-session.ts`
  // guardava só `valores` e reconstruía o motor reaplicando cada valor — o que
  // criava um histórico de UM ponto por campo, carimbado na hora da retomada. A
  // tela voltaria mostrando "168/96, aferido agora", sem o 194/116 e sem a
  // evidência de que houve um impedimento corrigido. Estado clínico que não
  // sobrevive à retomada não é estado clínico: é rascunho.

  exportarEstado(): EstadoSerializado {
    return {
      noAtual: this.currentNodeId,
      caminho: [...this.history],
      valores: { ...this.values },
      historico: this.getHistoricoCompleto(),
      realizadas: { ...this.realizadas },
      decisoes: this.getDecisoes(),
    };
  }

  /**
   * Recoloca o motor num estado salvo.
   *
   * O nó é conferido contra a árvore: um snapshot de uma versão anterior do
   * módulo pode citar um nó que não existe mais, e entrar num nó inexistente
   * quebraria a tela no meio de um atendimento. Nesse caso a retomada é
   * recusada, e quem chama começa do início — que é sempre o caminho seguro.
   */
  restaurarEstado(estado: EstadoSerializado): void {
    assertNodeExists(this.tree, estado.noAtual);
    this.currentNodeId = estado.noAtual;
    this.history = [...estado.caminho];
    // `TreeValues` admite `undefined` como valor; o mapa interno não. Um campo
    // com `undefined` explícito significa AUSENTE — deixá-lo entrar faria
    // `"pressao" in values` responder verdadeiro para um dado que não existe.
    this.values = {};
    for (const [k, v] of Object.entries(estado.valores)) {
      if (v !== undefined) this.values[k] = v;
    }
    this.historico = {};
    for (const [k, v] of Object.entries(estado.historico)) this.historico[k] = [...v];
    this.realizadas = { ...estado.realizadas };
    this.decisoes = [...estado.decisoes];
  }

  toFrontendStep(): FrontendTreeStep {
    const node = this.getCurrentNode();
    if (node.type === "decision") {
      return mapDecisionNode(node, this.getValues(), (t) => this.interpolate(t));
    }
    if (node.type === "action") {
      return mapActionNode(node, this.getValues(), (t) => this.interpolate(t));
    }
    if (node.type === "input") {
      return mapInputNode(
        node,
        this.values,
        this.getValues(),
        this.getHistoricoCompleto(),
        (t) => this.interpolate(t)
      );
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

/**
 * ⚠️ O VEREDITO É DERIVADO A CADA RENDER, NUNCA GRAVADO (regra do autor,
 * 2026-08-25). Se fosse gravado num campo, uma correção posterior — tratar a
 * PA e re-medir — deixaria o app mostrando o vermelho antigo sobre um dado
 * novo. Avaliando aqui, corrigir o dado JÁ muda a cor, sem nenhum nó extra.
 *
 * `titulo` e `motivo` são texto de tela e por isso passam por interpolação;
 * `nivel`, `campo` e os valores da decisão são referência, não texto.
 */
function avaliarVereditos(
  specs: VereditoSpec[] | undefined,
  values: TreeValues,
  interpolate: (t: string) => string
): Veredito[] {
  return (specs ?? []).map((spec) => {
    const v = spec.avaliar(values);
    // O id vem do SPEC, não do retorno: quem escreve a regra clínica não
    // precisa repetir a chave, e não há como os dois divergirem.
    return { ...v, id: spec.id, titulo: interpolate(v.titulo), motivo: interpolate(v.motivo) };
  });
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
      // `optionId` e `imagemReal` são referência/id, não texto — não passam
      // por interpolação.
      optionId: c.optionId,
      imagemReal: c.imagemReal,
    })),
    // ⚠️ AÇÃO PARALELA — `label` é texto de tela e por isso é interpolado;
    // `id`/`tipo`/`campo` são referência, não texto.
    emParalelo: (node.emParalelo ?? []).map((a) => ({ ...a, label: interpolate(a.label) })),
    vereditos: avaliarVereditos(node.vereditos, values, interpolate),
    options: node.options
      .filter((option) => !option.showIf || option.showIf(values))
      .map((option) => ({ id: option.id, label: interpolate(option.label), gravidade: option.gravidade })),
  };
}

function mapActionNode(
  node: ActionNode,
  values: TreeValues,
  interpolate: (t: string) => string
): FrontendTreeStep {
  return {
    id: node.id,
    kind: "action",
    title: interpolate(node.title),
    summary: node.summary ? interpolate(node.summary) : undefined,
    actions: node.actions.map(interpolate),
    // ⚠️ AÇÃO PARALELA — `label` é texto de tela e por isso é interpolado.
    emParalelo: (node.emParalelo ?? []).map((a) => ({ ...a, label: interpolate(a.label) })),
    vereditos: avaliarVereditos(node.vereditos, values, interpolate),
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
    enfase: node.enfase,
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
  values: TreeValues,
  historico: Record<string, Medicao[]>,
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
    historico,
    vereditos: avaliarVereditos(node.vereditos, values, interpolate),
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
    // ⚠️ `reason` E `label` SÃO TEXTO DE TELA e por isso passam a ser
    // interpolados (2026-08-25). Antes, `targets` era copiado cru — o que
    // obrigava o motivo do encaminhamento a ser uma frase FIXA, escrita sem
    // saber o que de fato disparou. Na SCA isso produziu um card que dizia
    // "Ritmo irregular + FC alta" para um paciente com ritmo REGULAR: o app
    // dava um motivo que não era o motivo. `moduleId` continua cru — é
    // referência, não texto.
    targets: node.targets.map((t) => ({
      ...t,
      label: interpolate(t.label),
      reason: t.reason ? interpolate(t.reason) : t.reason,
    })),
  };
}
