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
import { nihssCalculado, nihssInformado } from "./derivacoes-b";
import { ternario } from "./leitura";
import { fatosDaInstancia, instanciasDe, valorNaInstancia } from "./instancia";
import {
  DOSES,
  RECOMENDACOES,
  TROMBOLISE_IV,
  type CriterioDeFaixa,
  type Insumo,
  type JanelaDaRecomendacao,
  type Recomendacao,
} from "../conteudo/superficie-f";
import { rotuloClinico } from "../conteudo/rotulos-clinicos";
import { grauDoRotulo } from "../conteudo/mrs";
import { TERRITORIO_DA_OPCAO } from "../conteudo/superficie-c";
import { ORIGEM_DO_MARCO, camposDoMarco } from "./apresentacao-f";

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
    /**
     * ⚠️⚠️⚠️ ⛔ SEM LIXO DE PONTO FLUTUANTE — 2026-09-12.
     *
     * ⛔ Relato do autor, com captura: *"ALTEPLASE OLHA O TANTO DE CASAS
     * DECIMAIS, ISSO NEM DÁ PARA MEDIR NA PRÁTICA"* — a tela mostrava
     * **`89.10000000000001 mg`** para 99 kg.
     *
     * ⚠️⚠️ ⛔ ISTO ⛔ NÃO É ARREDONDAMENTO CLÍNICO. `99 × 0,9` **É** 89,1 em
     * decimal; ⛔ o rabo de casas é o erro de representação binária do
     * `double` (`0,9` ⛔ não existe exato em base 2) — ⛔ artefato da máquina,
     * ⛔ e ⛔ nunca um dado clínico. ⚠️ As seis casas preservadas são folga: ⛔ elas
     * ⛔ não alcançam ⛔ nenhum produto real desta conta (peso tem `passo: 1`,
     * ⛔ e o maior produto tem **duas** casas), ⛔ e ⛔ por isso ⛔ nenhum valor
     * verdadeiro é alterado.
     *
     * ⛔ ⛔ **Quantas casas EXIBIR é decisão do autor** ⛔ e ⛔ não foi tomada
     * aqui: ⛔ arredondar 15,625 para 15,6 ⛔ mudaria a dose, ⛔ e a fonte
     * ⛔ não define arredondamento (Table 7 dá ⛔ só mg/kg ⛔ e teto).
     */
    totalMg: Math.min(Math.round(pesoKg * d.mgPorKg * 1e6) / 1e6, d.maximoMg),
    slot: d.slot,
  };
}

/**
 * ⚠️⚠️ OS FATOS OPERACIONAIS SAÍRAM DAQUI — 2026-08-31.
 *
 * ⚠️ `ContextoOperacional` morava neste arquivo, ⛔ sem campo ⛔ e ⛔ sem
 * consumidor. Mudou para `conteudo/superficie-g`, que é a casa deles.
 *
 * ⚠️⚠️ E a mudança ⛔ **não é organizacional**: enquanto o tipo vivia aqui, a
 * ponte entre disponibilidade e elegibilidade era um `import` de distância. ⛔ A
 * vizinhança é o primeiro convite — ⛔ e F-31 é exatamente a dívida que essa
 * ponte fecharia por inferência.
 *
 * ⛔ ⛔ ⛔ **⛔ NENHUM fato operacional entra em `valorDoInsumo`.** Disponibilidade
 * é *"DISPONIBILIDADE / LOCALIZAÇÃO, ⛔ nunca contraindicação clínica"* (F-03
 * §12), ⛔ e ausência gera **destino**, ⛔ não veredito de exclusão.
 */

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

/**
 * ⚠️⚠️ Sim/Não/Incerto → satisfaz/contradiz/undefined. ⛔ Vazio ⛔ nunca é "não".
 *
 * ⚠️⚠️ USA `ternario()`, ⛔ e ⛔ NÃO comparação com o rótulo. A primeira versão
 * comparava `v === "Sim"` — ⛔ e o estado ⛔ nunca guarda `"Sim"`: a tela grava o
 * valor de `valorDaOpcao()`, que é `"sim"`. Os quatro insumos de imagem ficavam
 * `undefined` para sempre no app real, ⛔ e as travas passavam porque
 * **injetavam o rótulo direto no estado** — mediam o meu vazio, ⛔ não o do app.
 *
 * ⚠️ A leitura de Sim/Não/Incerto já existia em `leitura.ts`; escrever outra
 * aqui foi a duplicação que a I6 proíbe, ⛔ e o defeito veio dela.
 */
function simNaoIncerto(estado: EstadoAvc, campo: string): ValorDoInsumo {
  const v = ternario(estado, campo);
  if (v === true) return "satisfaz";
  if (v === false) return "contradiz";
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
    /**
     * ⚠️⚠️ ASSIMETRIA PRESERVADA — ⛔ e agora lida pelo `ternario()`.
     *
     * ⛔ A fonte pede *"without significant mass effect"*: **ausência** satisfaz,
     * ⛔ e presença contradiz. ⛔ O insumo é a ausência; o campo pergunta a
     * presença — por isso os dois lados vêm invertidos, de propósito.
     */
    case "efeito_de_massa_ausente": {
      const em = ternario(estado, "efeito_de_massa");
      if (em === false) return "satisfaz";
      if (em === true) return "contradiz";
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

    /**
     * ⚠️⚠️ ⛔ ⛔ ⛔ **⛔ NÃO EXISTE CAMPO `nihss`.**
     *
     * ⛔ `nihss` é id de **grupo** na Superfície B; os campos são
     * `nihss_calculado` e `nihss_informado`. ⚠️ `valorAtual(estado, "nihss")`
     * devolvia `undefined` **para sempre** — ⛔ e as NOVE recomendações de EVT
     * que dependem do NIHSS ⛔ nunca fechavam no app real.
     *
     * ⚠️⚠️ Achado pela varredura de alcançabilidade, ⛔ e ⛔ por ⛔ nenhuma prova
     * de superfície: ler id inexistente ⛔ não quebra ⛔ nada — devolve ausência,
     * ⛔ que é uma resposta legítima. ⛔ O defeito é mudo por construção.
     *
     * ⚠️ F pergunta **se há NIHSS registrado**, ⛔ e ⛔ não qual valor: calculado
     * e informado convivem ⛔ e ⛔ nenhum corrige o outro (PD-17). Qualquer um
     * dos dois satisfaz o critério de haver escore.
     */
    case "nihss": {
      const v = nihssCalculado(estado) ?? nihssInformado(estado);
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

    /**
     * ⚠️⚠️⚠️ LIDO POR **TERRITÓRIO**, ⛔ e ⛔ NÃO por "há string gravada".
     *
     * ── ⚠️⚠️ ⛔ O DEFEITO (auditoria final, 2026-09-07) ────────────────────
     *
     * ⛔ ⛔ Isto era `escolha(...) ? "satisfaz" : undefined` — ⛔ **qualquer**
     * valor gravado satisfazia. ⚠️ Medido:
     *
     *   · `"Não sei"` → **satisfaz**: ⛔ ignorância sustentando critério (**E-02**);
     *   · `"Nenhuma oclusão identificada"` → **satisfaz**: ⛔ o laudo que ⛔ **⛔
     *     nega** a oclusão sustentando *"há sítio de oclusão"*.
     *
     * ⛔ ⛔ E a Superfície F **lista os insumos que sustentam** — ⛔ a tela
     * mostrava *"Sítio da oclusão"* como critério **atendido** num paciente
     * cujo laudo diz que ⛔ não há oclusão. ⛔ Negativa virando positiva.
     *
     * ⚠️⚠️ ⛔ A leitura correta ⛔ já existia desde a Fase 9
     * (`territorioDoEstado`), ⛔ e ⛔ era usada ⛔ **só** pelas recomendações de
     * EVT. ⛔ O caminho cru ficou para trás — ⛔ e ⛔ isso é a **I6** de novo:
     * duas leituras do mesmo laudo, ⛔ discordando.
     */
    case "sitio_da_oclusao": {
      const rotulo = escolha(estado, "sitio_oclusao");
      if (rotulo === undefined) return undefined;
      const t = TERRITORIO_DA_OPCAO[rotulo];
      /** ⚠️ ⛔ *"Não sei"* ⛔ e *"Não especificado no laudo"* ⛔ não resolvem. */
      if (t === undefined || t === "indeterminado") return undefined;
      /** ⚠️⚠️ ⛔ E *"Nenhuma oclusão identificada"* é **resposta**: contradiz. */
      return t === "nenhuma" ? "contradiz" : "satisfaz";
    }

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
    /**
     * ⚠️⚠️ *"(a) have unknown time of onset"* — O6b, 2026-09-12. ⛔ Só o
     * **declarado** «não sei» satisfaz; hora conhecida contradiz; ⛔ não
     * perguntado fica ausente — ⛔ e ⛔ nunca vira desconhecido por conveniência.
     */
    case "inicio_desconhecido": {
      const f = valorAtual(estado, "hora_inicio_observado");
      if (f === undefined || String(f.valor) === "nao_perguntado") return undefined;
      if (String(f.valor) === "nao_sei") return "satisfaz";
      return typeof f.valor === "number" && Number.isFinite(f.valor) ? "contradiz" : undefined;
    }

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

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ O CRITÉRIO — ⛔ E ⛔ ELE ⛔ NÃO É A PRESENÇA DO DADO
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ESTA CAMADA FECHA (achado por execução, 2026-09-07)
 *
 * ⛔ ⛔ `valorDoInsumo()` responde *"há dado registrado?"*. ⚠️ Para a **IVT**
 * ⛔ isso basta: os insumos dela são quase todos ternários — *"o déficit é
 * incapacitante?"* tem sim, ⛔ não ⛔ e ⛔ não sei, ⛔ e cada um é uma resposta.
 *
 * ⚠️⚠️ ⛔ A **EVT** é o primeiro consumidor cujos critérios são **faixas
 * numéricas ⛔ e territórios anatômicos**. ⛔ Ali a presença ⛔ não diz ⛔ nada:
 * um M1 com NIHSS 14, ASPECTS 8 ⛔ e mRS 0 fechava **cinco** recomendações de
 * populações que se excluem — mRS 2, mRS 3–4, M2 dominante ⛔ e M2 ⛔ não
 * dominante entre elas. ⛔ E um paciente com ⛔ **só** *"basilar"* anotado
 * recebia veredito **negativo** por uma recomendação de M2.
 *
 * ── ⚠️⚠️ ⛔ A IVT ⛔ E OS CRITÉRIOS — ⛔ revisto no commit 5 (2026-09-12) ────
 *
 * ⛔ Até o commit 5 **⛔ nenhuma** recomendação de IVT declarava `criterios`, ⛔ e
 * ⛔ isso era o §50 executado ⛔ ao criar os critérios da EVT: ⛔ não alterar de
 * carona. ⚠️ ⛔ A auditoria (AVC-02) mediu o preço: ⛔ a janela ⛔ nunca era
 * insumo da IVT, ⛔ e um início há **72 h** fechava como um de duas.
 *
 * ⚠️ Agora as recomendações IVT **de elegibilidade** declaram
 * `criterios.janela` — ⛔ **⛔ só a janela**, ⛔ e ⛔ nenhuma faixa numérica:
 * ⛔ os demais insumos da IVT continuam ternários ⛔ e ⛔ continuam lidos por
 * presença/resposta, ⛔ exatamente como antes. ⛔ Agente, posologia ⛔ e
 * princípio ⛔ não declaram critério porque ⛔ não decidem candidatura.
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️⚠️ O NÚMERO DE UM INSUMO — ⛔ e ⛔ **⛔ NEM TODO ⛔ ELE MORA COMO NÚMERO**.
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO MUDO (achado pelo e2e da Fase 9, 2026-09-07) ─────────
 *
 * ⛔ ⛔ `mrs_previo` é campo de **escolha**: o estado guarda
 * `"0 · assintomático"`. ⚠️ Lido com `typeof v === "number"`, ⛔ ele devolvia
 * `undefined` **para sempre** — ⛔ e ⛔ **⛔ nenhuma** das nove recomendações
 * que exigem mRS ⛔ jamais fechou no app real.
 *
 * ⚠️⚠️ ⛔ E ⛔ o gesto real foi o único a pegar: as provas gravavam o número
 * cru, ⛔ medindo um formato que a tela ⛔ **nunca** produz.
 *
 * ⚠️ ⛔ Uma leitura só, ⛔ aqui — ⛔ para que o fundamento exiba ⛔ exatamente o
 * número que o critério julgou (**I6**).
 */
function valorNumericoDoInsumo(estado: EstadoAvc, insumo: Insumo): number | undefined {
  if (insumo === "nihss") {
    const n = nihssCalculado(estado) ?? nihssInformado(estado);
    return typeof n === "number" && Number.isFinite(n) ? n : undefined;
  }
  /** ⚠️⚠️ Escala com rótulo — ⛔ o grau sai da própria lista, ⛔ e ⛔ não de um `parseInt`. */
  if (insumo === "mrs_previo") return grauDoRotulo(escolha(estado, "mrs_previo"));
  const v = valorAtual(estado, insumo)?.valor;
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/** ⚠️ `min`/`max` inclusivos; os `…Exclusivo` existem porque a fonte diz `<80`. */
function naFaixa(v: number, f: CriterioDeFaixa): boolean {
  if (f.min !== undefined && v < f.min) return false;
  if (f.max !== undefined && v > f.max) return false;
  if (f.minExclusivo !== undefined && v <= f.minExclusivo) return false;
  if (f.maxExclusivo !== undefined && v >= f.maxExclusivo) return false;
  return true;
}

/**
 * ⚠️⚠️ MINUTOS DESDE UM CAMPO DE HORA — ⛔ **um** relógio, ⛔ e ⛔ não dois.
 *
 * ⛔ ⛔ A tela de F tinha esta conta inline. ⛔ Duplicá-la aqui daria duas
 * contagens livres para divergir num arredondamento (**I6**) — ⛔ por isso a
 * tela passou a chamar **esta**.
 *
 * ⚠️ ⛔ Devolve `undefined`, ⛔ **nunca zero**, quando o marco ⛔ não foi
 * registrado: zero é uma contagem; ausência ⛔ não é (**E-02**).
 */
export function minutosDesdeCampoDoEstado(
  estado: EstadoAvc,
  campo: string,
  agoraMs: number
): number | undefined {
  const ms = msDesdeCampoDoEstado(estado, campo, agoraMs);
  return ms === undefined ? undefined : Math.round(ms / 60_000);
}

/**
 * ⚠️⚠️⚠️ A DURAÇÃO **PRECISA**, ⛔ para quem DECIDE — commit 3 · 2026-09-12
 * (AVC-18, decisão do autor: *"comparar tempo preciso e arredondar apenas
 * para apresentação"*).
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA ─────────────────────────────────────
 *
 * ⛔ `valorDaJanela` comparava **minutos arredondados**: 24 h + 24 s virava
 * 1.440 min ⛔ e ⛔ ainda cabia em *"within 24 hours"*; 24 h + 36 s ⛔ não.
 * ⚠️ Formatação decidindo fronteira de janela terapêutica (**E-01**).
 *
 * ⚠️ ⛔ `Math.max(0, …)` preservado: ⛔ um marco no futuro (relógio do
 * aparelho atrasado) ⛔ continua contando zero, ⛔ e ⛔ não negativo — ⛔ é o
 * comportamento que já existia, ⛔ e ⛔ mudá-lo seria regra nova.
 * ⚠️ `undefined`, ⛔ **nunca zero**, quando o marco ⛔ não foi registrado (**E-02**).
 */
export function msDesdeCampoDoEstado(
  estado: EstadoAvc,
  campo: string,
  agoraMs: number
): number | undefined {
  const v = valorAtual(estado, campo)?.valor;
  return typeof v === "number" && Number.isFinite(v) ? Math.max(0, agoraMs - v) : undefined;
}

/**
 * ⚠️⚠️ A JANELA COMO CRITÉRIO — ⛔ e ⛔ **nenhuma hora nova**.
 *
 * ⛔ Os números continuam ⛔ só em `janelas`; a contagem continua ⛔ só em
 * `ORIGEM_DO_MARCO`. ⚠️ ⛔ E a **disjunção** da fonte é preservada: quando o
 * marco aceita dois campos, ⛔ basta que **um** deles caia dentro — ⛔ escolher
 * o mais conservador seria regra clínica que a fonte ⛔ não deu.
 */
/**
 * ⚠️ Exportada no commit 6 (2026-09-12): ⛔ a composição D1 do veredito da IVT
 * lê a janela padrão **pela mesma função** que as recomendações usam (**I6**) —
 * ⛔ uma segunda contagem divergiria num arredondamento.
 */
/**
 * ⚠️⚠️⚠️ MARCOS **INCOMPATÍVEIS** — decisão do autor, 2026-09-12 (O4).
 *
 * ⛔ Quando um marco disjuntivo (`onset_ou_lkw`) tem os **dois** campos
 * conhecidos ⛔ e eles respondem de forma **oposta** à mesma janela — um dentro,
 * outro fora —, ⛔ escolher qualquer um deles é decidir por conveniência: ⛔ o
 * favorável libera fora da janela real; ⛔ o conservador nega dentro dela.
 * ⚠️ Nenhum dos dois é a fonte. ⛔ O que existe é **contradição entre dois
 * fatos**, ⛔ e contradição se **reconcilia** (mesma classe de AVC-04: coletas
 * discordantes ⛔ não se elegem).
 *
 * ⚠️ ⛔ Um marco só segue HR-1. ⛔ Dois marcos concordes (ambos dentro ⛔ ou ambos
 * fora) ⛔ não são conflito. ⛔ Nenhum limite muda; ⛔ nenhum relógio sintético
 * nasce; ⛔ os dois fatos ficam na trilha.
 */
export type ConflitoDeMarcos = {
  readonly janela: JanelaDaRecomendacao;
  /** ⚠️ Os campos em conflito — ⛔ os dois, nomeados (**E-26**). */
  readonly campos: readonly string[];
  readonly dentro: readonly string[];
  readonly fora: readonly string[];
};

export function conflitoDeMarcos(
  estado: EstadoAvc,
  janelas: readonly JanelaDaRecomendacao[],
  agoraMs: number | undefined
): ConflitoDeMarcos | undefined {
  if (agoraMs === undefined) return undefined;
  for (const j of janelas) {
    const origem = ORIGEM_DO_MARCO[j.marco];
    if (origem.tipo !== "campo") continue;
    const campos = camposDoMarco(j.marco);
    if (campos.length < 2) continue;
    const dentro: string[] = [];
    const fora: string[] = [];
    const de = (j.deHoras ?? 0) * 3_600_000;
    const ate = j.ateHoras * 3_600_000;
    for (const campo of campos) {
      const ms = msDesdeCampoDoEstado(estado, campo, agoraMs);
      if (ms === undefined) continue;
      (ms >= de && ms <= ate ? dentro : fora).push(campo);
    }
    if (dentro.length > 0 && fora.length > 0) {
      return { janela: j, campos: [...dentro, ...fora], dentro, fora };
    }
  }
  return undefined;
}

export function valorDaJanela(
  estado: EstadoAvc,
  janelas: readonly JanelaDaRecomendacao[],
  agoraMs: number | undefined
): ValorDoInsumo {
  /**
   * ⚠️⚠️ ⛔ SEM `agoraMs`, A JANELA É **AUSÊNCIA** — ⛔ e ⛔ nunca *"dentro"*.
   *
   * ⚠️ ⛔ A degradação é para o lado seguro **por construção**: ausente ⛔ nunca
   * torna uma recomendação aplicável; ⛔ só a deixa potencial, nomeando a falta.
   */
  if (agoraMs === undefined || janelas.length === 0) return undefined;
  /**
   * ⚠️⚠️ ⛔ MARCOS INCOMPATÍVEIS ⛔ NÃO PRODUZEM CONCLUSÃO — ⛔ nem positiva ⛔ nem
   * negativa (O4). ⛔ A disjunção só vale quando os marcos conhecidos concordam.
   */
  if (conflitoDeMarcos(estado, janelas, agoraMs) !== undefined) return undefined;

  let algumMarco = false;
  for (const j of janelas) {
    const origem = ORIGEM_DO_MARCO[j.marco];
    if (origem.tipo !== "campo") continue;
    for (const campo of camposDoMarco(j.marco)) {
      /**
       * ⚠️⚠️ ⛔ EM MILISSEGUNDOS, ⛔ e ⛔ sem arredondar (AVC-18, commit 3).
       * ⛔ Os limites são **inclusivos** como sempre foram (*"within 6 hours"*
       * inclui 6 h em ponto) — ⛔ o que mudou é ⛔ só que 6 h + 1 ms ⛔ já ⛔ não
       * cabe. ⛔ A fronteira em que 6 h pertence à rec. 1 **e** à rec. 2 é da
       * fonte, ⛔ e continua ⛔ não harmonizada.
       */
      const ms = msDesdeCampoDoEstado(estado, campo, agoraMs);
      if (ms === undefined) continue;
      algumMarco = true;
      const de = (j.deHoras ?? 0) * 3_600_000;
      const ate = j.ateHoras * 3_600_000;
      if (ms >= de && ms <= ate) return "satisfaz";
    }
  }
  /** ⚠️ Marco registrado ⛔ e fora de toda janela é **resposta**, ⛔ não falta. */
  return algumMarco ? "contradiz" : undefined;
}

/** ⚠️ O território que o laudo descreve. ⛔ `indeterminado` ⛔ não é resposta. */
function territorioDoEstado(estado: EstadoAvc) {
  const rotulo = escolha(estado, "sitio_oclusao");
  if (rotulo === undefined) return undefined;
  const t = TERRITORIO_DA_OPCAO[rotulo];
  return t === undefined || t === "indeterminado" ? undefined : t;
}

/**
 * ⚠️⚠️⚠️ A LEITURA DE UM INSUMO **DENTRO DE UMA RECOMENDAÇÃO**.
 *
 * ⛔ ⛔ O parâmetro `r` já existia na assinatura de `leiturasDasRecomendacoes` ⛔ e
 * era **descartado** (`_r`). ⚠️ Era ⛔ exatamente ali que o critério cabia.
 *
 * ⚠️ ⛔ Três saídas, ⛔ e as três importam:
 *   · **satisfaz**  — o dado existe ⛔ e cai no critério **desta** recomendação;
 *   · **contradiz** — o dado existe ⛔ e está fora dele (⛔ é resposta, ⛔ não falta);
 *   · `undefined`   — ⛔ o dado ⛔ não foi registrado (⛔ e ⛔ isso ⛔ não é um "não").
 */
export function valorDoInsumoNaRecomendacao(
  estado: EstadoAvc,
  r: Recomendacao,
  insumo: Insumo,
  agoraMs: number | undefined
): ValorDoInsumo {
  const c = r.criterios;
  /** ⚠️ ⛔ Sem critério declarado, ⛔ nada muda — a IVT passa por aqui intacta. */
  if (c === undefined) return valorDoInsumo(estado, insumo);

  if (insumo === "janela" && c.janela !== undefined) {
    return valorDaJanela(estado, r.janelas, agoraMs);
  }

  if (insumo === "sitio_da_oclusao" && c.sitio_da_oclusao !== undefined) {
    const t = territorioDoEstado(estado);
    if (t === undefined) return undefined;
    return c.sitio_da_oclusao.in.includes(t) ? "satisfaz" : "contradiz";
  }

  const faixa =
    insumo === "nihss" ? c.nihss
    : insumo === "mrs_previo" ? c.mrs_previo
    : insumo === "aspects" ? c.aspects
    : insumo === "pc_aspects" ? c.pc_aspects
    : insumo === "idade" ? c.idade
    : undefined;

  if (faixa !== undefined) {
    const v = valorNumericoDoInsumo(estado, insumo);
    if (v === undefined) return undefined;
    return naFaixa(v, faixa) ? "satisfaz" : "contradiz";
  }

  /**
   * ⚠️ `efeito_de_massa_ausente` já era lido por valor — ⛔ o critério ⛔ só
   * torna a exigência **declarada**. ⛔ A conduta ⛔ não muda, ⛔ e ⛔ não deve.
   */
  return valorDoInsumo(estado, insumo);
}

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ O FATO QUE FECHOU O CRITÉRIO — ⛔ COM VALOR, ⛔ E FORMATADO **AQUI**
 *
 * ── ⚠️⚠️ ⛔ POR QUE A TELA ⛔ NÃO FORMATA ────────────────────────────────
 *
 * ⚠️ Regra do autor, 2026-09-07: *"A tela ⛔ não pode recalcular: janela, NIHSS,
 * ASPECTS, PC-ASPECTS, mRS, idade, sítio, efeito de massa, COR/LOE. ⛔ Tudo vem
 * do núcleo."*
 *
 * ⛔ ⛔ Uma tela que lesse `valorAtual(estado, "nihss_informado")` para escrever
 * *"NIHSS 14"* teria **duas** leituras do mesmo fato — a do motor ⛔ e a dela.
 * ⚠️ ⛔ Elas divergiriam ⛔ no dia em que o NIHSS calculado passasse a existir,
 * ⛔ e a tela mostraria o número que o veredito ⛔ não usou (**I6**).
 * ────────────────────────────────────────────────────────────────────────── */

export type FatoQueFechou = {
  readonly insumo: Insumo;
  /** ⚠️ Nome clínico do fato. ⛔ **⛔ Nunca** o slug. */
  readonly rotulo: string;
  /** ⚠️ O valor **como o médico o lê**. ⛔ Já formatado, ⛔ e ⛔ não um número cru. */
  readonly valor: string;
};

/**
 * ⚠️⚠️ *"2h08"* — ⛔ e ⛔ não *"128 min"* ⛔ nem *"2,13 h"*.
 *
 * ⛔ A janela da fonte é contada em horas; ⛔ minutos soltos obrigam o médico a
 * dividir de cabeça ⛔ enquanto decide (**E-21**).
 */
export function horasEMinutos(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/**
 * ⚠️ O valor de um insumo, ⛔ já em linguagem clínica. ⛔ `undefined` quando ⛔ o
 * fato ⛔ não está lá — ⛔ e ⛔ então ⛔ ele ⛔ não entra no fundamento.
 */
function valorLegivel(
  estado: EstadoAvc,
  r: Recomendacao,
  insumo: Insumo,
  agoraMs: number | undefined
): string | undefined {
  if (insumo === "sitio_da_oclusao") return escolha(estado, "sitio_oclusao");

  if (insumo === "janela") {
    if (agoraMs === undefined) return undefined;
    for (const j of r.janelas) {
      if (ORIGEM_DO_MARCO[j.marco].tipo !== "campo") continue;
      for (const campo of camposDoMarco(j.marco)) {
        const min = minutosDesdeCampoDoEstado(estado, campo, agoraMs);
        if (min !== undefined) return horasEMinutos(min);
      }
    }
    return undefined;
  }

  /**
   * ⚠️⚠️ ⛔ A **AUSÊNCIA** SE DIZ POR EXTENSO — ⛔ e ⛔ não como *"efeito de
   * massa: não"*, ⛔ que se lê como campo ⛔ não respondido.
   */
  if (insumo === "efeito_de_massa_ausente") {
    return ternario(estado, "efeito_de_massa") === false
      ? "Sem efeito de massa significativo"
      : undefined;
  }

  const n = valorNumericoDoInsumo(estado, insumo);
  return n === undefined ? undefined : String(n);
}

/**
 * ⚠️⚠️⚠️ OS FATOS QUE FECHARAM **ESTA** RECOMENDAÇÃO — ⛔ e ⛔ SÓ ELES.
 *
 * ⛔ ⛔ Regra do autor: *"Mostrar ⛔ apenas fatos pertinentes à recomendação
 * aplicada. ⛔ Não listar critérios de populações que foram descartadas."*
 *
 * ⚠️ Por isso a lista sai de `r.exige` — ⛔ o que **aquela** frase pede — ⛔ e
 * ⛔ nunca de uma lista fixa de dados da EVT.
 */
export function fatosQueFecharam(
  estado: EstadoAvc,
  r: Recomendacao,
  agoraMs: number | undefined
): readonly FatoQueFechou[] {
  const fatos: FatoQueFechou[] = [];
  for (const insumo of r.exige) {
    const valor = valorLegivel(estado, r, insumo, agoraMs);
    if (valor === undefined) continue;
    fatos.push({ insumo, rotulo: rotuloClinico(insumo), valor });
  }
  return fatos;
}

/**
 * ⚠️⚠️ `agoraMs` é **opcional**, ⛔ e a omissão é segura por construção: ⛔ sem
 * ele o insumo `janela` fica **ausente**, ⛔ e ausência ⛔ nunca torna uma
 * recomendação aplicável — ⛔ só a deixa potencial, nomeando a falta.
 *
 * ⛔ Quem **decide** (o veredito da trombectomia) o **exige**; quem ⛔ só
 * **lista** (a IVT, a tela de recomendações) pode ⛔ não ter relógio em mãos.
 */
export function recomendacoesDoEstado(
  estado: EstadoAvc,
  agoraMs?: number
): readonly LeituraDaRecomendacao[] {
  return leiturasDasRecomendacoes((r, i) =>
    valorDoInsumoNaRecomendacao(estado, r, i, agoraMs)
  );
}


/* ────────────────────────────────────────────────────────────────────────────
 * A AÇÃO DE TROMBÓLISE — F EXPÕE O FATO; ⛔ QUEM DECIDE O QUE FAZER COM ELE
 * É QUEM CONSOME
 * ────────────────────────────────────────────────────────────────────────── */

export type EstadoDaTrombolise = "iniciada" | "realizada" | "interrompida" | "cancelada";

export type AcaoDeTrombolise = {
  readonly instancia: string;
  /** ⚠️ O agente **efetivamente utilizado** — ⛔ e ⛔ não o em consideração. */
  readonly agente: string | undefined;
  readonly estado: EstadoDaTrombolise | undefined;
  /**
   * ⚠️⚠️ `undefined` quando ⛔ ninguém anotou a hora — ⛔ e ⛔ NUNCA "agora".
   * ⛔ Preencher com o instante da leitura deslocaria a fase da Table 7 para uma
   * hora que ⛔ ninguém observou (E-52).
   */
  readonly inicioMs: number | undefined;
};

/** ⚠️ Rótulo gravado → estado. ⛔ Qualquer outra coisa é `undefined`. */
function estadoDaAcao(v: unknown): EstadoDaTrombolise | undefined {
  if (v === "Iniciada") return "iniciada";
  if (v === "Realizada") return "realizada";
  if (v === "Interrompida") return "interrompida";
  if (v === "Cancelada") return "cancelada";
  return undefined;
}

/**
 * ⚠️⚠️ AS AÇÕES REGISTRADAS — uma por instância, ⛔ e ⛔ nenhuma inferida.
 *
 * ⛔ ⛔ **⛔ NÃO** existe caminho daqui até a escolha do agente ⛔ nem até a
 * correspondência das recomendações: decidir ⛔ não é agir, ⛔ e uma recomendação
 * aplicável ⛔ não é uma infusão correndo.
 */
export function acoesDeTrombolise(estado: EstadoAvc): readonly AcaoDeTrombolise[] {
  return instanciasDe(estado, TROMBOLISE_IV).map((instancia) => {
    const hora = valorNaInstancia(estado, instancia, "ivt_inicio")?.valor;
    return {
      instancia,
      agente: (() => {
        const a = valorNaInstancia(estado, instancia, "ivt_agente_administrado")?.valor;
        return typeof a === "string" && a.length > 0 ? a : undefined;
      })(),
      estado: estadoDaAcao(valorNaInstancia(estado, instancia, "ivt_estado")?.valor),
      inicioMs: typeof hora === "number" && Number.isFinite(hora) ? hora : undefined,
    };
  });
}

/* ────────────────────────────────────────────────────────────────────────────
 * ⚠️⚠️⚠️ A EXPOSIÇÃO AO TROMBOLÍTICO — **derivada do histórico**, ⛔ e ⛔ não do
 * último estado (R4 · D2 · commit 8b · 2026-09-12 · AVC-07, AVC-09, AVC-13)
 *
 * ── ⚠️⚠️ ⛔ O DEFEITO QUE ISTO FECHA ─────────────────────────────────────
 *
 * ⛔ `acoesDeTrombolise()` lia o **último** `ivt_estado` da instância, ⛔ e G
 * contava ⛔ só `iniciada | realizada`. ⚠️ Medido por execução:
 *
 *   · **Iniciada → Cancelada** na mesma instância ⇒ *"⛔ sem administração
 *     registrada"* — ⛔ a monitorização da Table 7 sumia ⛔ exatamente na
 *     deterioração (AVC-07);
 *   · **Iniciada ⛔ sem hora** ⇒ o antitrombótico dizia *"fora do contexto
 *     pós-IVT"* ⛔ e a aspirina IV dos 90 min saía `false` — ⛔ desconhecido
 *     virando negativo (AVC-09);
 *   · **instância aberta ⛔ e vazia** ⇒ a síntese escrevia *"Trombólise
 *     indicada"* — ⛔ formulário virando conduta (AVC-13).
 *
 * ── ⚠️⚠️ D2, ⛔ E A REGRA DO HISTÓRICO ────────────────────────────────────
 *
 * > *"A exposição deve ser derivada do histórico de eventos, ⛔ não somente do
 * >  estado final atual. Interromper uma infusão ⛔ nunca pode fazer o sistema
 * >  concluir que o paciente ⛔ não recebeu trombolítico."*
 *
 * ⚠️ Uma instância está **exposta** se **alguma vez** teve `Iniciada`,
 * `Realizada` ⛔ ou `Interrompida`; ⛔ a `fase` é a última dessas três.
 * ⛔ `Cancelada` ⛔ só significa *"antes do início"* quando **⛔ nenhuma** delas
 * a precedeu. ⚠️ **HR-5**: trilha legada `Iniciada → Cancelada` **preserva** a
 * exposição ⛔ e é marcada `contraditoria` — ⛔ nunca reinterpretada em silêncio.
 *
 * ── ⚠️ O QUE ⛔ NÃO É EVENTO ────────────────────────────────────────────
 *
 * ⛔ O marcador `trombolise_iv_nova_medida` (abrir o formulário) ⛔ e a escolha
 * do agente em consideração ⛔ **⛔ não** produzem exposição: ⛔ `registro_em_aberto`
 * é o nome disso, ⛔ e ⛔ nenhuma derivação clínica o consome (**E-20**, **E-40**).
 * ────────────────────────────────────────────────────────────────────────── */

export type FaseDaExposicao = "iniciada" | "realizada" | "interrompida";

/** ⚠️ Os **três** vazios do horário (**E-37**) — ⛔ e ⛔ nenhum é *"agora"* (**E-52**). */
export type InicioDaExposicao =
  | { readonly tipo: "conhecido"; readonly ms: number }
  | { readonly tipo: "desconhecido_declarado" }
  | { readonly tipo: "nao_perguntado" };

export type Exposicao =
  | { readonly estado: "nenhuma_administracao" }
  /** ⚠️ Instância aberta ⛔ sem situação registrada — ⛔ formulário, ⛔ não evento. */
  | { readonly estado: "registro_em_aberto"; readonly instancia: string }
  | { readonly estado: "cancelada_antes_do_inicio"; readonly instancia: string }
  | {
      readonly estado: "exposta";
      readonly instancia: string;
      readonly fase: FaseDaExposicao;
      readonly inicio: InicioDaExposicao;
      /** ⚠️ O agente **efetivamente utilizado** — ⛔ não o em consideração. */
      readonly agente?: string;
      /** ⚠️⚠️ HR-5: `Cancelada` registrada **depois** de uma exposição — ⛔ trilha contraditória, ⛔ preservada. */
      readonly contraditoria: boolean;
    };

const FASES_QUE_EXPOEM: readonly string[] = ["iniciada", "realizada", "interrompida"];

/** ⚠️ A exposição de **uma** instância, lida do histórico dela. */
export function exposicaoDaInstancia(estado: EstadoAvc, instancia: string): Exposicao {
  const historico = fatosDaInstancia(estado, instancia)
    .filter((f) => f.campo === "ivt_estado")
    .map((f) => estadoDaAcao(f.valor))
    .filter((v): v is EstadoDaTrombolise => v !== undefined);

  const expoentes = historico.filter((v) => FASES_QUE_EXPOEM.includes(v));
  if (expoentes.length > 0) {
    const fase = expoentes[expoentes.length - 1] as FaseDaExposicao;
    const ultimo = historico[historico.length - 1];
    const hora = valorNaInstancia(estado, instancia, "ivt_inicio")?.valor;
    const inicio: InicioDaExposicao =
      typeof hora === "number" && Number.isFinite(hora)
        ? { tipo: "conhecido", ms: hora }
        : String(hora ?? "") === "nao_sei"
          ? { tipo: "desconhecido_declarado" }
          : { tipo: "nao_perguntado" };
    const a = valorNaInstancia(estado, instancia, "ivt_agente_administrado")?.valor;
    return {
      estado: "exposta",
      instancia,
      fase,
      inicio,
      agente: typeof a === "string" && a.length > 0 ? a : undefined,
      contraditoria: ultimo === "cancelada",
    };
  }
  if (historico.length > 0 && historico[historico.length - 1] === "cancelada") {
    return { estado: "cancelada_antes_do_inicio", instancia };
  }
  return { estado: "registro_em_aberto", instancia };
}

/** ⚠️ Todas as instâncias, na ordem de registro — ⛔ a síntese lista uma a uma. */
export function exposicoesPorInstancia(estado: EstadoAvc): readonly Exposicao[] {
  return instanciasDe(estado, TROMBOLISE_IV).map((i) => exposicaoDaInstancia(estado, i));
}

/**
 * ⚠️⚠️ A EXPOSIÇÃO DO ATENDIMENTO — ⛔ a **última** instância exposta responde
 * (uma iniciada depois de uma cancelada vale; ⛔ a trilha guarda as duas).
 * ⛔ Sem ⛔ nenhuma exposta: cancelada antes do início > registro em aberto >
 * ⛔ nenhuma administração.
 */
export function exposicaoAoTrombolitico(estado: EstadoAvc): Exposicao {
  const todas = exposicoesPorInstancia(estado);
  const expostas = todas.filter((x) => x.estado === "exposta");
  if (expostas.length > 0) return expostas[expostas.length - 1];
  const canceladas = todas.filter((x) => x.estado === "cancelada_antes_do_inicio");
  if (canceladas.length > 0) return canceladas[canceladas.length - 1];
  if (todas.length > 0) return todas[todas.length - 1];
  return { estado: "nenhuma_administracao" };
}

/** ⚠️ Quantas administrações **com exposição** existem — ⛔ e ⛔ não quantas instâncias. */
export function administracoesRegistradas(estado: EstadoAvc): number {
  return exposicoesPorInstancia(estado).filter((x) => x.estado === "exposta").length;
}
