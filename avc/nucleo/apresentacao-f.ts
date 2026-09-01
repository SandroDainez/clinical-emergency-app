/**
 * APRESENTAÇÃO DA SUPERFÍCIE F — a ordem e o agrupamento, ⛔ sem React.
 *
 * ⚠️⚠️ POR QUE ISTO ⛔ NÃO MORA NO COMPONENTE.
 *
 * As cinco decisões de UX fechadas pelo autor em 2026-08-31 são **regras**, e
 * regra espalhada em JSX ⛔ não se prova. Aqui elas são funções puras: o
 * componente pergunta *em que ordem* e *como agrupar*, ⛔ e ⛔ nunca decide.
 *
 * ⚠️ Este módulo ⛔ **não** lê estado nem calcula correspondência. Ele recebe as
 * leituras prontas de `derivacoes-f` e as arruma. Se ele começar a decidir se
 * uma recomendação se aplica, a regra passou a viver em dois lugares (I6).
 */

import {
  MOTIVO_CLINICO,
  RECOMENDACOES,
  type Insumo,
  type JanelaDaRecomendacao,
  type Marco,
} from "../conteudo/superficie-f";
import type { LeituraDaRecomendacao } from "./derivacoes-f";

/* ────────────────────────────────────────────────────────────────────────────
 * 1 · OS MARCOS E OS CAMPOS QUE OS ALIMENTAM
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ CADA MARCO DIZ DE QUAL CAMPO ELE LÊ — ⛔ e um deles diz que ⛔ NÃO TEM.
 *
 * ⚠️ A Superfície A tem quatro relógios nomeados. A fonte usa cinco marcos. O
 * quinto — `midpoint_of_sleep` — ⛔ **não tem campo em lugar nenhum do app**.
 *
 * ⛔ Apontá-lo para `hora_ultima_vez_bem` seria a fusão de relógios que a
 * Superfície F inteira existe para impedir: são marcos diferentes, com contagens
 * diferentes, e a fonte os cita **na mesma recomendação**. ⛔ Escondê-lo seria
 * apagar que a diretriz o nomeia. Então ele é declarado como lacuna, com o
 * motivo — ⛔ e ⛔ **não** se cria campo na Superfície A a partir daqui: A ⛔ não
 * se altera nesta frente.
 */
export type OrigemDoMarco =
  | { readonly tipo: "campo"; readonly campo: string; readonly rotulo: string }
  | { readonly tipo: "sem_campo"; readonly rotulo: string; readonly motivo: string };

export const ORIGEM_DO_MARCO: Readonly<Record<Marco, OrigemDoMarco>> = {
  symptom_onset: {
    tipo: "campo",
    campo: "hora_inicio_observado",
    rotulo: "Início observado do déficit",
  },
  last_known_well: {
    tipo: "campo",
    campo: "hora_ultima_vez_bem",
    rotulo: "Última vez visto bem",
  },
  symptom_recognition: {
    tipo: "campo",
    campo: "hora_reconhecimento",
    rotulo: "Reconhecimento dos sintomas",
  },
  /**
   * ⚠️⚠️ A DISJUNÇÃO É DA FONTE, ⛔ e a tela ⛔ NÃO ESCOLHE UM LADO.
   *
   * ⛔ *"within 4.5 hours of symptom onset **or** last known well"*. Se os dois
   * estiverem registrados, os dois contam — ⛔ e a tela mostra as duas contagens.
   * Escolher a mais conservadora seria uma regra clínica que a fonte ⛔ não deu.
   */
  onset_ou_lkw: {
    tipo: "campo",
    campo: "hora_inicio_observado|hora_ultima_vez_bem",
    rotulo: "Início observado ou última vez bem",
  },
  /**
   * ⚠️⚠️ ERA LACUNA, ⛔ e VIROU CAMPO — 2026-08-31.
   *
   * ⚠️ A Superfície A ganhou `hora_meio_do_sono` como marco **próprio**, porque
   * §4.6.3 rec. 2 cita *midpoint of sleep* ⛔ **e** *last known well* na mesma
   * recomendação, com faixas diferentes. ⛔ Apontar para outro relógio fundiria
   * as duas contagens.
   */
  midpoint_of_sleep: {
    tipo: "campo",
    campo: "hora_meio_do_sono",
    rotulo: "Meio do sono",
  },
} as const;

/** ⚠️ Os campos que `onset_ou_lkw` aceita — a disjunção, desmontada uma vez só. */
export function camposDoMarco(marco: Marco): readonly string[] {
  const o = ORIGEM_DO_MARCO[marco];
  return o.tipo === "campo" ? o.campo.split("|") : [];
}

/* ────────────────────────────────────────────────────────────────────────────
 * 2 · O RELÓGIO DE UMA JANELA
 * ────────────────────────────────────────────────────────────────────────── */

export type EstadoDoRelogio =
  /** ⚠️ Correndo: há marco registrado e há prazo. */
  | "correndo"
  /** ⚠️ O marco existe como campo, ⛔ e ⛔ ninguém o registrou. */
  | "sem_marco"
  /** ⚠️⚠️ A fonte nomeia o marco, ⛔ e o app ⛔ não tem onde guardá-lo. */
  | "sem_campo";

export type LeituraDeRelogio = {
  readonly marco: Marco;
  readonly rotulo: string;
  readonly estado: EstadoDoRelogio;
  /** ⚠️ Minutos decorridos desde o marco. `undefined` quando ⛔ não corre. */
  readonly decorridosMin?: number;
  /** ⚠️ Minutos até o fim da janela. Negativo = janela vencida. */
  readonly restantesMin?: number;
  readonly deHoras?: number;
  readonly ateHoras: number;
  readonly verbatim: string;
  /** ⚠️ Campo que faz este relógio começar a contar, quando existe. */
  readonly campo?: string;
  readonly motivo?: string;
};

/**
 * ⚠️⚠️ UMA JANELA PODE PRODUZIR DUAS LEITURAS.
 *
 * ⛔ `onset_ou_lkw` com os dois marcos registrados são **duas contagens**, ⛔ não
 * uma média ⛔ nem a menor. A fonte escreveu a disjunção; a tela a preserva.
 */
export function relogiosDaJanela(
  janela: JanelaDaRecomendacao,
  minutosDesdeCampo: (campo: string) => number | undefined
): readonly LeituraDeRelogio[] {
  const origem = ORIGEM_DO_MARCO[janela.marco];
  const base = {
    marco: janela.marco,
    deHoras: janela.deHoras,
    ateHoras: janela.ateHoras,
    verbatim: janela.verbatim,
  } as const;

  if (origem.tipo === "sem_campo") {
    return [{ ...base, rotulo: origem.rotulo, estado: "sem_campo", motivo: origem.motivo }];
  }

  const campos = camposDoMarco(janela.marco);
  const comValor = campos
    .map((campo) => ({ campo, min: minutosDesdeCampo(campo) }))
    .filter((x): x is { campo: string; min: number } => typeof x.min === "number");

  /** ⚠️ ⛔ Nenhum dos campos da disjunção registrado — o relógio ⛔ não conta. */
  if (comValor.length === 0) {
    return [{ ...base, rotulo: origem.rotulo, estado: "sem_marco", campo: campos[0] }];
  }

  return comValor.map((x) => ({
    ...base,
    rotulo: rotuloDoCampo(x.campo, origem.rotulo),
    estado: "correndo" as const,
    decorridosMin: x.min,
    restantesMin: Math.round(janela.ateHoras * 60) - x.min,
    campo: x.campo,
  }));
}

/**
 * ⚠️ Quando a disjunção se desmembra, cada contagem precisa dizer de QUAL marco
 * ela é — ⛔ senão as duas apareceriam com o mesmo nome, que é a confusão exata
 * que o E-36 proíbe.
 */
function rotuloDoCampo(campo: string, padrao: string): string {
  if (campo === "hora_inicio_observado") return "Início observado do déficit";
  if (campo === "hora_ultima_vez_bem") return "Última vez visto bem";
  if (campo === "hora_reconhecimento") return "Reconhecimento dos sintomas";
  if (campo === "hora_meio_do_sono") return "Meio do sono";
  return padrao;
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3 · A ORDEM DA TELA
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ COR ⛔ NÃO GOVERNA A ORDEM — decisão do autor, 2026-08-31.
 *
 * ⛔ Ordenar por COR poria uma COR 1 sem prazo acima de uma ação com janela se
 * fechando. Em emergência, quem manda é **o relógio**; a força da recomendação
 * continua visível, ⛔ e ⛔ não decide sozinha o que se lê primeiro.
 *
 * ⚠️ E uma COR 3 aplicável ⛔ **não** sobe para o topo por estar aplicável: ela é
 * alerta de contexto, ⛔ não ação. Por isso `alerta_cor3` vem depois de tudo que
 * é acionável — e é a razão de a faixa ⛔ não poder ser derivada de
 * `correspondencia` sozinha.
 */
export type Faixa =
  /** 1 · há relógio correndo e a recomendação se aplica agora. */
  | "acao_com_relogio"
  /** 2 · aplicável, ⛔ sem prazo correndo. */
  | "aplicavel"
  /** 3 · falta **um** dado para fechar. */
  | "a_um_dado"
  /** 4 · COR 3 cuja população bate — alerta, ⛔ nunca ação. */
  | "alerta_cor3"
  /** 5 · demais potenciais — recolhidas, agrupadas pela falta. */
  | "potencial_recolhida"
  /** 6 · a fonte ⛔ não fecha o critério (F-31). */
  | "sem_fonte"
  /** 7 · critério contraditado — consultável, ⛔ fora do primeiro plano. */
  | "fora";

export const ORDEM_DAS_FAIXAS: readonly Faixa[] = [
  "acao_com_relogio",
  "aplicavel",
  "a_um_dado",
  "alerta_cor3",
  "potencial_recolhida",
  "sem_fonte",
  "fora",
];

/** ⚠️ COR 3 é reconhecida pelo texto da fonte, ⛔ e ⛔ não por um booleano nosso. */
export function ehCor3(cor: string): boolean {
  return cor.trim().startsWith("3");
}

export type ItemDaTela = {
  readonly leitura: LeituraDaRecomendacao;
  readonly faixa: Faixa;
  readonly relogios: readonly LeituraDeRelogio[];
  /** ⚠️ Minutos restantes do relógio mais apertado que ainda corre. */
  readonly apertoMin?: number;
};

export function faixaDoItem(
  leitura: LeituraDaRecomendacao,
  relogios: readonly LeituraDeRelogio[]
): Faixa {
  if (leitura.correspondencia === "nao_avaliavel") return "sem_fonte";
  if (leitura.correspondencia === "nao_corresponde") return "fora";

  if (leitura.correspondencia === "aplicavel") {
    /** ⚠️⚠️ Alerta antes de ação: COR 3 ⛔ nunca encabeça a tela. */
    if (ehCor3(leitura.cor)) return "alerta_cor3";
    return relogios.some((r) => r.estado === "correndo") ? "acao_com_relogio" : "aplicavel";
  }

  /** ⚠️ `potencialmente_aplicavel` — a exceção aprovada: falta **um** dado só. */
  if (leitura.faltam.length === 1) return "a_um_dado";
  return "potencial_recolhida";
}

/**
 * ⚠️⚠️ DENTRO DA FAIXA, O MAIS APERTADO PRIMEIRO.
 *
 * ⛔ Sem isso, "ação com relógio" seria uma faixa em ordem de catálogo — e a
 * recomendação com 20 minutos de janela apareceria abaixo de uma com 6 horas.
 */
export function ordenarItens(itens: readonly ItemDaTela[]): readonly ItemDaTela[] {
  const posicao = (f: Faixa) => ORDEM_DAS_FAIXAS.indexOf(f);
  return [...itens].sort((a, b) => {
    const df = posicao(a.faixa) - posicao(b.faixa);
    if (df !== 0) return df;
    const aa = a.apertoMin;
    const bb = b.apertoMin;
    if (typeof aa === "number" && typeof bb === "number") return aa - bb;
    if (typeof aa === "number") return -1;
    if (typeof bb === "number") return 1;
    return 0;
  });
}

/** ⚠️ Monta a tela inteira: faixa, relógios e aperto, numa passagem só. */
export function itensDaTela(
  leituras: readonly LeituraDaRecomendacao[],
  minutosDesdeCampo: (campo: string) => number | undefined
): readonly ItemDaTela[] {
  const itens = leituras.map((leitura) => {
    const rec = RECOMENDACOES.find((r) => r.id === leitura.id);
    const relogios = (rec?.janelas ?? []).flatMap((j) => relogiosDaJanela(j, minutosDesdeCampo));
    const correndo = relogios
      .map((r) => r.restantesMin)
      .filter((m): m is number => typeof m === "number");
    return {
      leitura,
      faixa: faixaDoItem(leitura, relogios),
      relogios,
      apertoMin: correndo.length > 0 ? Math.min(...correndo) : undefined,
    };
  });
  return ordenarItens(itens);
}

/* ────────────────────────────────────────────────────────────────────────────
 * 3b · ONDE CADA INSUMO É RESPONDIDO
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ INSUMO ⛔ NÃO É CAMPO, ⛔ e os nomes ⛔ NÃO COINCIDEM.
 *
 * ⛔ `sitio_da_oclusao` é o critério da recomendação; `sitio_oclusao` é o campo
 * onde o médico responde. Mandar o nome do insumo para a navegação abriria
 * campo ⛔ nenhum, ⛔ e o toque ⛔ não faria nada — sem erro visível.
 *
 * ⚠️ Dois insumos são respondidos por **um par** de campos, e o par está
 * declarado: quem toca cai no primeiro que ainda ⛔ não tem resposta.
 */
export const CAMPOS_DO_INSUMO: Readonly<Record<Insumo, readonly string[]>> = {
  sitio_da_oclusao: ["sitio_oclusao"],
  /** ⚠️ Dois campos, ⛔ e ⛔ nenhum corrige o outro — a escala e o escore de fora. */
  nihss: ["nihss_calculado", "nihss_informado"],
  mrs_previo: ["mrs_previo"],
  aspects: ["aspects"],
  pc_aspects: ["pc_aspects"],
  idade: ["idade"],
  efeito_de_massa_ausente: ["efeito_de_massa"],
  deficit_incapacitante: ["incapacitante_assumido"],
  /** ⚠️ Duas propriedades, dois campos — ⛔ e a fonte pede as duas. */
  deficit_leve_nao_incapacitante: ["incapacitante_assumido", "deficit_leve"],
  /** ⚠️ Peso ⛔ sem origem ⛔ não vira dose — os dois campos são o insumo. */
  peso: ["peso", "peso_origem"],
  agente_e_tenecteplase: ["agente_trombolitico"],
  dwi_menor_que_um_terco: ["dwi_menor_que_um_terco"],
  flair_sem_alteracao_marcada: ["flair_sem_alteracao_marcada"],
  penumbra_salvavel: ["penumbra_salvavel"],
  penumbra_por_perfusao_automatizada: ["penumbra_por_perfusao_automatizada"],
  /**
   * ⚠️⚠️ ⛔ NENHUM CAMPO, E ISSO É A RESPOSTA — F-31.
   *
   * ⛔ Criar um campo aqui seria pedir ao médico que decidisse uma questão que
   * a **fonte** deixou aberta, ⛔ e registrar isso como se fosse fato do paciente.
   */
  nao_elegivel_a_evt: [],
};

/* ────────────────────────────────────────────────────────────────────────────
 * 4 · O AGRUPAMENTO PELA FALTA
 * ────────────────────────────────────────────────────────────────────────── */

export type FaltaAgrupada = {
  readonly insumo: Insumo;
  /** ⚠️ Campos que respondem este insumo. Vazio = ⛔ não há o que tocar (F-31). */
  readonly campos: readonly string[];
  /** ⚠️⚠️ A frase clínica — é ELA que a tela mostra grande. */
  readonly motivo: string;
  /** ⚠️ Quantas recomendações destrava. ⛔ Informação de arquitetura: secundária. */
  readonly quantas: number;
};

/**
 * ⚠️⚠️ AGRUPAR PELA FALTA, ⛔ E ⛔ NÃO PELA RECOMENDAÇÃO — decisão do autor.
 *
 * ⛔ Onze recomendações de EVT compartilham o mesmo quarteto de critérios.
 * Renderizadas uma a uma, produzem onze cartões repetindo *"falta sítio, falta
 * NIHSS, falta mRS, falta ASPECTS"* — a mesma frase, onze vezes, empurrando
 * para fora da tela tudo que importa.
 *
 * ⚠️ As recolhidas ⛔ **não** entram aqui: quem já está em `a_um_dado` aparece
 * inteira, ⛔ e contá-la de novo no agrupamento seria a duplicação que este
 * agrupamento existe para eliminar.
 */
/**
 * ⚠️⚠️ DESEMPATE DE PRODUTO — ⛔ e ⛔ NÃO prioridade normativa da AHA.
 *
 * ⚠️ Decisão de apresentação do autor, 2026-08-31. Três dados empatam em nove
 * recomendações, ⛔ e o desempate alfabético punha o mRS prévio na frente do
 * sítio da oclusão — arbitrário, ⛔ e clinicamente estranho na leitura.
 *
 * ⛔ A **contagem continua sendo o primeiro critério**; esta ordem só decide
 * entre pesos IGUAIS.
 *
 * ⚠️⚠️ ⛔ ISTO ⛔ NÃO É GRAU DE RECOMENDAÇÃO ⛔ NEM FORÇA DE EVIDÊNCIA. A fonte
 * ⛔ não ordena insumos. É ordem operacional de interface, ⛔ e o motivo de cada
 * posição é do autor:
 *
 *   1 · **sítio da oclusão** — abre ou fecha a frente endovascular;
 *   2 · **NIHSS** — participa de várias recomendações e traduz gravidade atual;
 *   3 · **mRS prévio** — estado funcional **prévio**, ⛔ e ⛔ não atual.
 */
/**
 * ⚠️⚠️ A NATUREZA DA DECISÃO É **DADO**, ⛔ e ⛔ não comentário.
 *
 * ⚠️ A primeira versão declarava isto só em comentário — ⛔ e comentário ⛔ não
 * executa (R-92): a trava lia a fonte sem comentários ⛔ e ⛔ não achava
 * declaração ⛔ nenhuma. Se a distinção entre *ordem de interface* e *força de
 * evidência* importa a ponto de justificar esta lista, ela tem que ser legível
 * por quem consome o módulo ⛔ e conferível por quem o testa.
 */
export const PRIORIDADE_DE_PRODUTO_NATUREZA = {
  natureza: "decisao_de_apresentacao_do_autor",
  data: "2026-08-31",
  /** ⚠️ Identificadores, ⛔ e ⛔ não prosa — ⛔ isto ⛔ nunca chega à tela. */
  ehGrauDeRecomendacao: false,
  ehNivelDeEvidencia: false,
  ehNormativaDaFonte: false,
  criterioPrimario: "quantas",
  papel: "desempate",
} as const;

export const PRIORIDADE_DE_PRODUTO: readonly Insumo[] = [
  "sitio_da_oclusao",
  "nihss",
  "mrs_previo",
];

/** ⚠️ Fora da lista, ⛔ nenhuma posição — ⛔ e ⛔ não a posição zero. */
function posicaoDeProduto(i: Insumo): number {
  const p = PRIORIDADE_DE_PRODUTO.indexOf(i);
  return p === -1 ? PRIORIDADE_DE_PRODUTO.length : p;
}

export function faltasAgrupadas(itens: readonly ItemDaTela[]): readonly FaltaAgrupada[] {
  const conta = new Map<Insumo, number>();
  for (const item of itens) {
    if (item.faixa !== "potencial_recolhida") continue;
    for (const insumo of item.leitura.faltam) {
      conta.set(insumo, (conta.get(insumo) ?? 0) + 1);
    }
  }
  return [...conta.entries()]
    .map(([insumo, quantas]) => ({
      insumo,
      campos: CAMPOS_DO_INSUMO[insumo],
      motivo: MOTIVO_CLINICO[insumo],
      quantas,
    }))
    /**
     * ⚠️⚠️ CONTAGEM PRIMEIRO, ⛔ e a ordem de produto SÓ no empate. ⛔ Inverter
     * faria a prioridade de UX passar por cima do que realmente destrava mais.
     */
    .sort((a, b) =>
      b.quantas - a.quantas ||
      posicaoDeProduto(a.insumo) - posicaoDeProduto(b.insumo) ||
      a.insumo.localeCompare(b.insumo));
}

/**
 * ⚠️⚠️ QUANTAS FALTAS APARECEM EM PRIMEIRO PLANO.
 *
 * ⚠️ O autor pediu *"faltam estes dados que MAIS destravam decisões"*. Todas as
 * faltas com o mesmo peso reproduzem a poluição que o agrupamento removeu —
 * ⛔ só que trocando 11 recomendações por 9 dados. Visto na revisão em celular.
 *
 * ⚠️ O corte é de APRESENTAÇÃO, ⛔ e ⛔ não clínico: ⛔ nada é escondido, a cauda
 * fica a um toque. Quatro é o que cabe acima da dobra num aparelho de 6".
 */
export const FALTAS_EM_PRIMEIRO_PLANO = 4;

/** ⚠️ Contagem por faixa — o placar das raias, ⛔ sem o componente recontar. */
export function placar(
  itens: readonly ItemDaTela[],
  terapia: "ivt" | "evt"
): Readonly<Record<Faixa, number>> {
  const zero = Object.fromEntries(ORDEM_DAS_FAIXAS.map((f) => [f, 0])) as Record<Faixa, number>;
  for (const item of itens) {
    if (item.leitura.terapia !== terapia) continue;
    zero[item.faixa] += 1;
  }
  return zero;
}
