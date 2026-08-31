/**
 * DERIVAÇÕES DE F · a leitura das recomendações — ⛔ **nunca um veredito**.
 *
 * ── ⚠️⚠️ O QUE ESTE ARQUIVO ⛔ NÃO PRODUZ ──────────────────────────────────
 *
 * ⛔ ⛔ ⛔ `elegivel_ivt`. ⛔ `elegivel_evt`. ⛔ `pode_trombolisar`.
 * ⛔ ⛔ ⛔ ⛔ **⛔ Nenhum booleano agregado.**
 *
 * ⚠️ Ele devolve uma **lista de leituras**, uma por recomendação, cada uma com
 * seu COR/LOE, seu verbo verbatim, o que a sustentou e o que falta. ⚠️ Um mesmo
 * paciente corresponde a **várias** — e ⛔ o app ⛔ não escolhe "a melhor".
 *
 * ── ⚠️⚠️ QUATRO ESTADOS, ⛔ E ⛔ NÃO DOIS ──────────────────────────────────
 *
 * ⛔ `nao_corresponde` e `nao_avaliavel` são coisas **diferentes**: a primeira é
 * uma **resposta** — o insumo está lá e está fora do critério. A segunda é
 * **ausência** — ⛔ não se sabe. ⚠️ É `unknown ≠ negative` (E-02) na camada de
 * recomendação, e colapsá-los faria o app afirmar exclusão que ⛔ ninguém disse.
 */
import { valorAtual, type EstadoAvc } from "./estado";
import {
  DOSES,
  RECOMENDACOES,
  type Insumo,
  type Recomendacao,
} from "../conteudo/superficie-f";

export type Correspondencia =
  | "aplicavel"
  | "potencialmente_aplicavel"
  | "nao_corresponde"
  | "nao_avaliavel";

export type LeituraDaRecomendacao = {
  readonly id: string;
  readonly slot: string;
  readonly localizacao: string;
  readonly terapia: "ivt" | "evt";
  readonly cor: string;
  readonly loe: string;
  /** ⚠️ Verbatim. ⛔ `not recommended` ⛔ NUNCA vira "contraindicado". */
  readonly verbo: string;
  readonly populacao: string;
  readonly correspondencia: Correspondencia;
  /** Insumos presentes que **sustentaram** a leitura. */
  readonly sustentam: readonly Insumo[];
  /** Insumos presentes que a **contradizem**. */
  readonly incompativeis: readonly Insumo[];
  /** ⚠️ Insumos ausentes — o que colher para poder concluir. */
  readonly faltam: readonly Insumo[];
  /** ⚠️ Dívida de fonte que impede concluir. ⛔ Ver F-31, F-29. */
  readonly travadaPor?: string;
};

/**
 * ⚠️ O que o estado sabe sobre cada insumo — **três valores**, ⛔ e ⛔ não dois.
 *
 * ⛔ `undefined` significa *"⛔ não se sabe"*, e ⛔ **nunca** *"⛔ não"*.
 */
export type ValorDoInsumo = "satisfaz" | "contradiz" | undefined;

/**
 * ⚠️⚠️ A REGRA DE CORRESPONDÊNCIA — pura, e a razão de existir.
 *
 * ⛔ A ordem importa e ⛔ não é estilo:
 *
 *   1. ⚠️ **Incompatível vence tudo.** Um insumo presente e fora do critério
 *      ⛔ não vira "potencial" ⛔ nem espera dado faltante. É resposta.
 *   2. ⚠️ **Dívida de fonte** trava mesmo com todos os insumos presentes — se a
 *      pré-condição ⛔ não é determinável, a correspondência ⛔ não é determinável.
 *   3. ⚠️ Faltando insumo, é **potencial** — e a leitura **nomeia quais faltam**,
 *      porque *"talvez"* genérico ⛔ não diz ao médico o que colher.
 *   4. ⚠️ ⛔ Só então `aplicavel`.
 */
export function correspondenciaDe(
  exige: readonly Insumo[],
  valor: (i: Insumo) => ValorDoInsumo,
  travadaPor?: string
): {
  correspondencia: Correspondencia;
  sustentam: Insumo[];
  incompativeis: Insumo[];
  faltam: Insumo[];
} {
  const sustentam: Insumo[] = [];
  const incompativeis: Insumo[] = [];
  const faltam: Insumo[] = [];

  for (const i of exige) {
    const v = valor(i);
    if (v === "satisfaz") sustentam.push(i);
    else if (v === "contradiz") incompativeis.push(i);
    else faltam.push(i);
  }

  /** ⚠️ 1 · resposta contrária ⛔ não vira potencial. */
  if (incompativeis.length > 0) {
    return { correspondencia: "nao_corresponde", sustentam, incompativeis, faltam };
  }
  /** ⚠️ 2 · dívida de fonte trava mesmo com tudo presente. */
  if (travadaPor) {
    return { correspondencia: "nao_avaliavel", sustentam, incompativeis, faltam };
  }
  /** ⚠️ 3 · falta dado nomeável. */
  if (faltam.length > 0) {
    return { correspondencia: "potencialmente_aplicavel", sustentam, incompativeis, faltam };
  }
  return { correspondencia: "aplicavel", sustentam, incompativeis, faltam };
}

/**
 * ⚠️⚠️ TODAS as recomendações, sempre — ⛔ nenhuma filtrada aqui.
 *
 * ⛔ Filtrar na derivação esconderia da tela a informação de que uma recomendação
 * **existe e ⛔ não pôde ser avaliada**. ⚠️ Quem decide o que recolher é a tela.
 */
export function leiturasDasRecomendacoes(
  valor: (r: Recomendacao, i: Insumo) => ValorDoInsumo
): readonly LeituraDaRecomendacao[] {
  return RECOMENDACOES.map((r) => {
    const c = correspondenciaDe(r.exige, (i) => valor(r, i), r.travadaPor);
    return {
      id: r.id,
      slot: r.slot,
      localizacao: r.localizacao,
      terapia: r.terapia,
      cor: r.cor,
      loe: r.loe,
      verbo: r.verbo,
      populacao: r.populacao,
      correspondencia: c.correspondencia,
      sustentam: c.sustentam,
      incompativeis: c.incompativeis,
      faltam: c.faltam,
      travadaPor: r.travadaPor,
    };
  });
}

/**
 * ⚠️ Recomendações **negativas** que se aplicam a este paciente.
 *
 * ⛔ ⛔ Elas ⛔ NÃO viram seção fixa de "⛔ não fazer": aparecem ⛔ **só** quando os
 * fatos colocam o caso na população correspondente. ⚠️ Omiti-las deixaria a tela
 * mostrar ⛔ apenas as opções favoráveis, e isso **distorce a diretriz**.
 */
export function alertasNegativos(
  leituras: readonly LeituraDaRecomendacao[]
): readonly LeituraDaRecomendacao[] {
  return leituras.filter(
    (l) => l.cor.startsWith("3") && l.correspondencia === "aplicavel"
  );
}

/** ⚠️ ⛔ Medido, estimado e informado ⛔ não se confundem. */
export type OrigemDoPeso = "medido" | "estimado" | "informado";

export type DoseDerivada = {
  readonly agente: "alteplase" | "tenecteplase";
  readonly mgPorKg: number;
  readonly maximoMg: number;
  readonly pesoKg: number;
  /**
   * ⚠️⚠️ A ORIGEM VIAJA COM A DOSE, ⛔ e ela tem TRÊS valores ⛔ e ⛔ não dois.
   *
   * ⚠️ O campo `peso_origem` oferece *"Informado pelo paciente ou família"* e
   * *"Estimado pela equipe"*. ⛔ **Informado ⛔ não é medido** — dobrar um no
   * outro faria a dose declarar uma procedência que ⛔ ninguém deu (PD-17).
   * ⚠️ Descoberto ao ligar a primeira tela que consome esta função.
   */
  readonly origemDoPeso: OrigemDoPeso;
  readonly totalMg: number;
  readonly slot: string;
};

/**
 * ⚠️⚠️ CÁLCULO ⛔ NÃO É PREPARO, E PREPARO ⛔ NÃO É ADMINISTRAÇÃO.
 *
 * ⚠️ A dose está sustentada por F-09 (COR 1 · LOE A). ⛔ O **preparo brasileiro**
 * está em F-20, **parcial** — e para tenecteplase a indicação para AVC e o
 * preparo ⛔ **não estão confirmados** por fonte primária. ⛔ Este arquivo ⛔ não
 * emite preparo ⛔ nem administração.
 *
 * ⛔ ⛔ **Sem peso ⛔ não existe dose.** ⛔ Não estimar, ⛔ não assumir 70 kg,
 * ⛔ não arredondar sem regra de fonte.
 */
export function doseDerivada(
  agente: "alteplase" | "tenecteplase",
  pesoKg: number | undefined,
  origemDoPeso: OrigemDoPeso | undefined
): DoseDerivada | undefined {
  if (pesoKg === undefined || origemDoPeso === undefined) return undefined;
  if (!(pesoKg > 0)) return undefined;
  const d = DOSES[agente];
  return {
    agente,
    mgPorKg: d.mgPorKg,
    maximoMg: d.maximoMg,
    pesoKg,
    origemDoPeso,
    totalMg: Math.min(pesoKg * d.mgPorKg, d.maximoMg),
    slot: d.slot,
  };
}

/**
 * ⚠️ Fatos operacionais — ⛔ **fora** da avaliação clínica.
 *
 * ⛔ ⛔ ⛔ **⛔ NENHUM deles satisfaz `not eligible for EVT` ⛔ nem
 * `cannot receive EVT`** (**F-31**). F-03 §12 é a norma: disponibilidade é
 * *"DISPONIBILIDADE / LOCALIZAÇÃO, ⛔ nunca contraindicação clínica"*, e ausência
 * gera **destino**, ⛔ não veredito de exclusão.
 */
export type ContextoOperacional = {
  readonly centroEvtDisponivel?: "sim" | "nao" | "desconhecido";
  readonly transferenciaPossivel?: "sim" | "nao" | "desconhecido";
  readonly perfusaoAutomatizadaDisponivel?: "sim" | "nao" | "desconhecido";
  readonly ressonanciaDisponivel?: "sim" | "nao" | "desconhecido";
};

/**
 * ⚠️⚠️ A FIAÇÃO COM A–E — F **lê**, ⛔ e ⛔ não redeclara.
 *
 * ⛔ ⛔ Cada insumo tem **uma casa semântica** noutra superfície. F ⛔ não pergunta
 * de novo o que A–E já perguntaram, e ⛔ não guarda cópia.
 *
 * ⚠️⚠️ E a regra de leitura é sempre a mesma: **⛔ ausência ⛔ NUNCA vira
 * negativa** (E-02). ⛔ Campo em branco, "Incerto" e opção ⛔ não marcada
 * produzem `undefined` — ⛔ jamais `"contradiz"`.
 */
function escolha(estado: EstadoAvc, campo: string): string | undefined {
  const f = valorAtual(estado, campo);
  const v = f?.valor;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/** ⚠️ Sim/Não/Incerto → satisfaz/contradiz/undefined. ⛔ Vazio ⛔ nunca é "não". */
function simNaoIncerto(estado: EstadoAvc, campo: string): ValorDoInsumo {
  const v = escolha(estado, campo);
  if (v === "Sim") return "satisfaz";
  if (v === "Não") return "contradiz";
  return undefined;
}

export function valorDoInsumo(estado: EstadoAvc, insumo: Insumo): ValorDoInsumo {
  switch (insumo) {
    /**
     * ⚠️⚠️ **DUAS propriedades.** A fonte pede *"mild non-disabling"*, e B ⛔ só
     * representa o eixo incapacitante. ⛔ Enquanto ⛔ não houver representação de
     * **leve**, este insumo é `undefined` — e a recomendação COR 3 fica
     * **potencial**, nomeando a falta.
     *
     * ⛔ ⛔ Mapear `"Não incapacitante"` para `satisfaz` afirmaria **leve** sem
     * ⛔ ninguém ter dito, e faria o app declarar *"IVT not recommended"* sobre
     * um déficit que pode ⛔ não ser leve.
     */
    case "deficit_leve_nao_incapacitante": {
      const inc = escolha(estado, "incapacitante_assumido");
      const leve = escolha(estado, "deficit_leve");
      /** ⚠️ ⛔ Qualquer resposta contrária, em ⛔ qualquer dos dois eixos, contradiz. */
      if (inc === "Incapacitante" || leve === "Não leve") return "contradiz";
      /** ⚠️⚠️ ⛔ Só satisfaz com os **dois** sustentados. */
      if (inc === "Não incapacitante" && leve === "Leve") return "satisfaz";
      return undefined;
    }

    case "deficit_incapacitante": {
      const inc = escolha(estado, "incapacitante_assumido");
      if (inc === "Incapacitante") return "satisfaz";
      if (inc === "Não incapacitante") return "contradiz";
      /** ⚠️ "Incerto" é **decisão registrada**, ⛔ e ⛔ não ausência — mas ⛔ não
       * sustenta a população. ⛔ Permanece indeterminado. */
      return undefined;
    }

    /**
     * ⚠️⚠️ A ASSIMETRIA DO EFEITO DE MASSA — e ⛔ ela ⛔ não é a que eu supus.
     *
     * ⛔ C ⛔ não registra *presença* de efeito de massa: ele registra o
     * **julgamento sobre significância**, com a expressão da fonte
     * (*"efeito de massa significativo"*) e a nota de que a fonte ⛔ não define
     * medida — a leitura é de quem interpreta a imagem.
     *
     * ⚠️ Por isso `"Não"` **satisfaz** *"without significant mass effect"*, e
     * `"Sim"` **contradiz**. ⛔ Tratar `"Sim"` como indeterminado deixaria as
     * recs. 3 e 4 `nao_avaliavel` num paciente cujo radiologista **afirmou** que
     * há efeito significativo — ⛔ o app deixaria de excluir quem a fonte exclui.
     *
     * ⚠️ `"Incerto"` e vazio permanecem `undefined`.
     */
    case "efeito_de_massa_ausente": {
      const em = escolha(estado, "efeito_de_massa");
      if (em === "Não") return "satisfaz";
      if (em === "Sim") return "contradiz";
      return undefined;
    }

    /**
     * ⚠️⚠️ **F-31 · sempre `undefined`.**
     *
     * ⛔ ⛔ ⛔ ⛔ NENHUM fato operacional preenche esta pré-condição: ⛔ não
     * disponibilidade de centro, ⛔ não transferência, ⛔ não ausência de imagem
     * avançada, ⛔ não avaliação clínica. A fonte ⛔ não define o que a satisfaz,
     * e F-03 §12 é a norma: disponibilidade é *"DISPONIBILIDADE / LOCALIZAÇÃO,
     * ⛔ nunca contraindicação clínica"*.
     */
    case "nao_elegivel_a_evt":
      return undefined;

    /** ⚠️ Valor **informado** — F-28 proíbe calcular, ⛔ não consumir. */
    case "aspects":
    case "pc_aspects": {
      const v = valorAtual(estado, insumo === "aspects" ? "aspects" : "pc_aspects")?.valor;
      return typeof v === "number" ? "satisfaz" : undefined;
    }

    case "nihss": {
      const v = valorAtual(estado, "nihss")?.valor;
      return typeof v === "number" ? "satisfaz" : undefined;
    }

    case "mrs_previo": {
      const v = valorAtual(estado, "mrs_previo")?.valor;
      return typeof v === "number" ? "satisfaz" : undefined;
    }

    case "idade": {
      const v = valorAtual(estado, "idade")?.valor;
      return typeof v === "number" ? "satisfaz" : undefined;
    }

    case "sitio_da_oclusao":
      return escolha(estado, "sitio_oclusao") ? "satisfaz" : undefined;

    /**
     * ⚠️⚠️ DOIS INSUMOS, porque o **método difere entre as recomendações**:
     * a rec. 2 exige perfusão **automatizada**; a rec. 3 ⛔ não qualifica o
     * método. ⛔ Um insumo só imporia à rec. 3 exigência que a fonte ⛔ não fez.
     */
    case "penumbra_salvavel":
      return simNaoIncerto(estado, "penumbra_salvavel");

    case "penumbra_por_perfusao_automatizada":
      return simNaoIncerto(estado, "penumbra_por_perfusao_automatizada");

    /**
     * ⚠️⚠️ Os dois componentes de §4.6.3 rec. 1, **separados**. ⛔ O segundo é
     * uma **ausência** — e ⛔ não responder ⛔ não equivale a ausência (E-02).
     */
    case "dwi_menor_que_um_terco":
      return simNaoIncerto(estado, "dwi_menor_que_um_terco");

    case "flair_sem_alteracao_marcada":
      return simNaoIncerto(estado, "flair_sem_alteracao_marcada");

    /** ⚠️ Peso com **origem** — ⛔ sem os dois ⛔ não há dose. */
    case "peso": {
      const v = valorAtual(estado, "peso")?.valor;
      return typeof v === "number" && v > 0 ? "satisfaz" : undefined;
    }

    /**
     * ⚠️⚠️ TRÊS SAÍDAS, ⛔ e ⛔ não duas. A rec. F-09 fala de **tenecteplase
     * 0,4 mg/kg**, ⛔ e ⛔ não de "trombolítico".
     *
     * ⚠️ `Alteplase` ⛔ **não** é ausência de informação: é a afirmação de que
     * ⛔ **não** é este o agente. Devolver `undefined` ali deixaria a
     * recomendação `potencialmente_aplicavel` ⛔ e a tela alertaria sobre uma
     * dose de TNK para quem está considerando alteplase.
     */
    case "agente_e_tenecteplase": {
      const a = escolha(estado, "agente_trombolitico");
      if (a === "Tenecteplase") return "satisfaz";
      if (a === "Alteplase") return "contradiz";
      /** ⛔ "Indefinido" é decisão de ⛔ não escolher — ⛔ e ⛔ não escolha. */
      return undefined;
    }
  }
}

export function recomendacoesDoEstado(
  estado: EstadoAvc
): readonly LeituraDaRecomendacao[] {
  return leiturasDasRecomendacoes((_r, i) => valorDoInsumo(estado, i));
}
