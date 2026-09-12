/**
 * O VEREDITO DA TROMBECTOMIA — ⚠️ **outro motor, ⛔ e ⛔ não outro ramo**.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ⛔ NÃO MORA EM `veredito-da-trombolise.ts` ─────────────
 *
 * ⚠️ Decisão do autor, 2026-09-07:
 *
 * > *"IVT ⛔ e EVT são decisões **paralelas**. O paciente pode ser elegível
 * >  para ambas."*
 *
 * ⛔ ⛔ Um motor só, com um `if terapia`, ⛔ acabaria produzindo **um** veredito
 * — ⛔ e ⛔ a pergunta *"este paciente recebe trombólise?"* ⛔ não é a pergunta
 * *"este paciente recebe trombectomia?"*. ⚠️ ⛔ Elas se respondem ao mesmo
 * tempo, ⛔ e ⛔ nenhuma espera a outra.
 *
 * ── ⚠️⚠️ ⛔ E A GUIDELINE É EXPLÍCITA SOBRE ⛔ NÃO ESPERAR ─────────────────
 *
 * ⛔ §4.7.1 rec. 2 · **COR 1 · LOE A**:
 *
 * > *"In patients with AIS who are eligible for both IVT and EVT, IVT should
 * >  be administered as rapidly as possible, **without observation, to assess
 * >  clinical response or delay in initiating EVT**, to improve treatment
 * >  times and clinical outcomes."*
 *
 * ⚠️ ⛔ (⛔ Eu havia escrito *"without pause to assess"* aqui, ⛔ de memória.
 * ⛔ A frase da fonte é a de cima, conferida no PDF · p. e368.)
 *
 * ⚠️ ⛔ Por isso ⛔ **não existe** aqui ⛔ nenhuma leitura do estado da IVT:
 * ⛔ este motor ⛔ não sabe ⛔ nem pergunta se a trombólise foi dada. ⛔ Um fluxo
 * *"IVT → esperar melhora → decidir EVT"* ⛔ seria construído ⛔ exatamente por
 * uma dependência assim.
 *
 * ── ⚠️ O QUE ELE ⛔ NÃO FAZ ────────────────────────────────────────────────
 *
 * ⛔ **⛔ Não grava fato** — função pura, recalculada a cada leitura (**E-43**).
 * ⛔ **⛔ Não lê técnica.** ⛔ Dispositivo, anestesia ⛔ e adjuvante existem no
 *    catálogo ⛔ e ⛔ não decidem candidatura.
 * ⛔ **⛔ Não nega por generalização.** ⛔ *"Limited generalizability"* ⛔ é
 *    julgamento clínico necessário, ⛔ e ⛔ nunca exclusão.
 */
import type { EstadoAvc } from "./estado";
/**
 * ⚠️⚠️⚠️ ⛔ O ÚNICO IMPORT PERMITIDO ⛔ FORA DE F — ⛔ e ⛔ ele é de **C**.
 *
 * ── ⚠️⚠️ R1 · A BARREIRA DE CLASSE (commit 2 · 2026-09-12) ────────────────
 *
 * ⛔ Este motor ⛔ não lia imagem ⛔ nenhuma, ⛔ e por isso um M1 completo **com
 * TC hemorrágica** saía `recomendada` (AVC-05) — ⛔ enquanto a IVT, ⛔ na mesma
 * tela, dizia *"retida pela imagem"* ⛔ e o destino apontava para HIC.
 *
 * ⚠️ F-16 rec. 1 vale para *"reperfusion **interventions**"*, ⛔ e §5.3 da spec
 * nomeia *"**realizar** trombectomia"* entre as ações que a exclusão de
 * hemorragia governa. ⚠️ A barreira é **classe**, ⛔ não contraindicação de
 * IVT — ⛔ e ⛔ é ⛔ por isso que ⛔ só `derivacoes-c` pode entrar ⛔ aqui:
 * ⛔ `derivacoes-d` (cortes, DOAC, antecedentes) ⛔ e `derivacoes-e`
 * (correções) são **⛔ da IVT**, ⛔ e ⛔ importá-los faria a EVT herdar o que
 * ⛔ não é dela. ⛔ `prova-avc-fase9-evt` varre ⛔ isto, ⛔ e a prova dos críticos
 * mede byte a byte (caso 17).
 *
 * ⚠️ ⛔ E a barreira **⛔ não substitui** a seleção: ⛔ ela viaja **ao lado**
 * (`classe`), ⛔ porque *avaliar* a população ⛔ não é *realizar* o procedimento.
 */
import { barreiraDeReperfusao, type BarreiraDeReperfusao } from "./derivacoes-c";
import {
  fatosQueFecharam,
  recomendacoesDoEstado,
  type FatoQueFechou,
  type LeituraDaRecomendacao,
} from "./derivacoes-f";
import { CAMPOS_DO_INSUMO } from "./apresentacao-f";
import {
  RECOMENDACOES,
  type Insumo,
  type NotaDeGeneralizacao,
  type Recomendacao,
} from "../conteudo/superficie-f";
import { rotuloClinico } from "../conteudo/rotulos-clinicos";

/**
 * ⚠️⚠️ ⛔ O UNIVERSO DO VEREDITO — ⛔ filtrado por **domínio**, ⛔ e ⛔ nunca por
 * nome de id ⛔ ou por seção.
 *
 * ⛔ Exportado ⛔ de propósito: ⛔ a prova ⛔ o lê ⛔ e confere que ⛔ **nenhuma**
 * recomendação de técnica entrou.
 */
export const RECOMENDACOES_DE_ELEGIBILIDADE: readonly Recomendacao[] =
  RECOMENDACOES.filter((r) => r.terapia === "evt" && r.dominio === "elegibilidade");

/**
 * ⚠️⚠️ ⛔ SETE ESTADOS, ⛔ E ⛔ ELES SÃO OS **VERBOS DA FONTE** — ⛔ e ⛔ não uma
 * escala inventada.
 *
 * ⛔ *"is recommended"* · *"is reasonable"* · *"might be reasonable"* · *"is not
 * recommended"* · *"is not well established"*. ⚠️ ⛔ Achatá-los em sim/não
 * destruiria a gradação que **E-45** manda preservar.
 */
export type TipoDoVereditoEvt =
  /** ⚠️ **COR 1** — *"is recommended"*. */
  | "recomendada"
  /** ⚠️ **COR 2a** — *"is reasonable"*. */
  | "razoavel"
  /** ⚠️ **COR 2b** — *"might be reasonable"*. */
  | "pode_ser_razoavel"
  /** ⚠️ **COR 2b** — *"is not well established"*. ⛔ ⛔ NÃO é negativa. */
  | "efetividade_nao_estabelecida"
  /** ⚠️ **COR 3: No Benefit** — ⛔ e ⛔ **nunca** *"contraindicada"*. */
  | "nao_recomendada_sem_beneficio"
  /** ⚠️ Falta dado que o próprio critério exige — ⛔ e ⛔ ele é nomeado. */
  | "incompleta"
  /** ⚠️ ⛔ Nenhum critério alcança este caso. ⛔ Nem sim ⛔ nem não (**E-23**). */
  | "sem_criterios";

export type MotivoDoVereditoEvt = {
  readonly id: string;
  readonly verbo: string;
  readonly populacao: string;
  readonly cor: string;
  readonly loe: string;
  readonly slot: string;
  readonly localizacao: string;
  /**
   * ⚠️⚠️ ⛔ Os fatos que **fecharam** este critério — ⛔ com **valor**, ⛔ e ⛔ só
   * os que **esta** recomendação pede. ⛔ A tela ⛔ não relê o estado.
   */
  readonly fechouCom: readonly FatoQueFechou[];
  /** ⚠️ ⛔ A nota da fonte, ⛔ quando ⛔ ela existe — ⛔ e ⛔ ela é **desta** rec. */
  readonly generalizacao?: NotaDeGeneralizacao;
};

export type VereditoDaTrombectomia = {
  /** ⚠️ A **seleção** — ⛔ o que o catálogo diz sobre a população deste paciente. */
  readonly tipo: TipoDoVereditoEvt;
  /**
   * ⚠️⚠️⚠️ A **CLASSE** — ⛔ a exclusão de hemorragia que governa **realizar**
   * (R1, commit 2). ⛔ Dois eixos, ⛔ e ⛔ nenhum sobrescreve o outro: ⛔ um M1
   * que fecha COR 1 **⛔ e** tem hemorragia na TC é *"seleção atende · reperfusão
   * retida pela imagem"* — ⛔ e a tela mostra os dois. ⛔ Achatar num só estado
   * ⛔ ou esconderia a seleção, ⛔ ou pintaria de sucesso o que ⛔ não se pode
   * fazer.
   */
  readonly classe: BarreiraDeReperfusao;
  readonly frase: string;
  /** ⚠️ ⛔ O que sustenta — ⛔ com COR/LOE ⛔ e verbatim. */
  readonly sustentam: readonly MotivoDoVereditoEvt[];
  /** ⚠️ ⛔ O que a diretriz desaconselha, ⛔ e que alcança este caso. */
  readonly contra: readonly MotivoDoVereditoEvt[];
  /**
   * ⚠️⚠️⚠️ ⛔ **⛔ NEM SIM ⛔ NEM ⛔ NÃO** — ⛔ e ⛔ esta terceira lista existe
   * ⛔ porque a fonte tem **três** posturas, ⛔ e ⛔ não duas.
   *
   * ── ⚠️⚠️ ⛔ O QUE EU ERREI ⛔ ANTES (achado pelo e2e da basilar) ─────────
   *
   * ⛔ ⛔ `efetividade_nao_estabelecida` saía com `sustentam: []` ⛔ e
   * `contra: []` — ⛔ e ⛔ então a tela ⛔ **⛔ não tinha como mostrar COR 2b ·
   * LOE B-R**. ⚠️ ⛔ Um veredito ⛔ sem a força da fonte ⛔ não se confere.
   *
   * ⚠️⚠️ ⛔ E ⛔ ela ⛔ **⛔ NÃO** entra em `sustentam`: ⛔ *"is not well
   * established"* ⛔ não sustenta ⛔ nada. ⛔ Enfiá-la ali para *"aproveitar a
   * lista"* seria transformar um **⛔ nem sim ⛔ nem ⛔ não** em apoio.
   */
  readonly semForca: readonly MotivoDoVereditoEvt[];
  /** ⚠️ ⛔ O que **falta**, nomeado ⛔ e **resolvível** — ⛔ nunca *"dados insuficientes"*. */
  readonly faltam: readonly FaltaDaEvt[];
  readonly ressalva: string;
};

/**
 * ⚠️⚠️ A FALTA CARREGA **ONDE SE RESOLVE** — ⛔ e ⛔ isso é **E-26**.
 *
 * ⛔ ⛔ Uma pendência sem destino é um beco: o médico lê *"falta ASPECTS"* ⛔ e
 * ⛔ não sabe em que tela responder. ⚠️ Os campos vêm de `CAMPOS_DO_INSUMO`,
 * ⛔ que é a mesma fiação que a lista de recomendações já usa.
 */
export type FaltaDaEvt = {
  readonly insumo: Insumo;
  readonly rotulo: string;
  readonly campos: readonly string[];
};

const RESSALVA =
  "Conferência dos critérios da diretriz contra o que foi registrado. A decisão é do médico.";

/** ⚠️ **COR 3** na fonte é *"not recommended"* / *"No Benefit"*. */
const ehCor3 = (cor: string): boolean => cor.startsWith("3");
/** ⚠️ *"is not well established"* é **2b**, ⛔ e ⛔ não uma negativa. */
const ehNaoEstabelecida = (l: LeituraDaRecomendacao): boolean =>
  /not well established/i.test(l.verbo);

function motivo(
  estado: EstadoAvc,
  agoraMs: number,
  l: LeituraDaRecomendacao
): MotivoDoVereditoEvt {
  const r = RECOMENDACOES_DE_ELEGIBILIDADE.find((x) => x.id === l.id);
  return {
    id: l.id,
    verbo: l.verbo,
    populacao: l.populacao,
    cor: l.cor,
    loe: l.loe,
    slot: l.slot,
    localizacao: l.localizacao,
    fechouCom: r ? fatosQueFecharam(estado, r, agoraMs) : [],
    /**
     * ⚠️⚠️ ⛔ A NOTA VIAJA COM A RECOMENDAÇÃO — ⛔ e ⛔ nunca é agregada numa
     * lista global de *"limitações da EVT"*. ⛔ As duas notas da fonte têm
     * conteúdos ⛔ e expectativas de vida **diferentes**.
     */
    generalizacao: r?.generalizacao,
  };
}

/**
 * ⚠️⚠️ ⛔ A ORDEM DE PRECEDÊNCIA — ⛔ e ⛔ ela ⛔ não é *"gravidade visual"*.
 *
 *   1. ⚠️ **O que fechou a favor**, ⛔ e o mais forte primeiro: ⛔ COR 1 antes
 *      de 2a, 2a antes de 2b. ⛔ A fonte grada, ⛔ e a gradação é a resposta.
 *   2. ⚠️ **COR 3 que se aplica** — ⛔ quando ⛔ nada fechou a favor.
 *   3. ⚠️ **Falta dado**, nomeado.
 *   4. ⚠️ **⛔ Nenhum critério alcança** o caso.
 *
 * ⚠️⚠️ ⛔ E O FAVORÁVEL VEM **ANTES** DA COR 3 ⛔ DE PROPÓSITO: ⛔ um paciente
 * com **M1 ocluído** ⛔ e uma **M2 não dominante** ⛔ concomitante ⛔ não deixa de
 * ser candidato porque a segunda ⛔ não beneficia. ⚠️ ⛔ As duas aparecem —
 * ⛔ uma como veredito, ⛔ a outra em `contra`, ⛔ como contexto.
 */
const FORCA: Readonly<Record<string, number>> = { "1": 3, "2a": 2, "2b": 1 };

/**
 * ⚠️⚠️ ⛔ `agoraMs` É **OBRIGATÓRIO** AQUI, ⛔ e opcional na derivação.
 *
 * ⛔ ⛔ A diferença é a diferença entre **listar** ⛔ e **decidir**: uma tela pode
 * exibir recomendações sem relógio em mãos; ⛔ um veredito que diz *"os
 * critérios sustentam a trombectomia"* ⛔ não pode, ⛔ porque a janela é um dos
 * critérios (**E-21**).
 */
export function vereditoDaTrombectomia(
  estado: EstadoAvc,
  agoraMs: number
): VereditoDaTrombectomia {
  /**
   * ⚠️ A classe é lida **uma** vez ⛔ e viaja em toda saída — ⛔ inclusive nas
   * negativas ⛔ e nas incompletas: ⛔ saber que a imagem ⛔ ainda ⛔ não excluiu
   * hemorragia importa ⛔ mesmo quando a seleção ⛔ não fechou.
   */
  const base = { ressalva: RESSALVA, classe: barreiraDeReperfusao(estado) };
  /**
   * ⚠️⚠️ ⛔ FILTRA POR **DOMÍNIO**, ⛔ e ⛔ não por id: ⛔ a recomendação de
   * *stent retriever* (§4.7.4 rec. 5) ⛔ existe no catálogo ⛔ e ⛔ **não**
   * chega aqui.
   */
  const permitidos = new Set(RECOMENDACOES_DE_ELEGIBILIDADE.map((r) => r.id));
  const leituras = recomendacoesDoEstado(estado, agoraMs).filter((l) => permitidos.has(l.id));

  const aplicaveis = leituras.filter((l) => l.correspondencia === "aplicavel");
  const aFavor = aplicaveis.filter((l) => !ehCor3(l.cor) && !ehNaoEstabelecida(l));
  const contra = aplicaveis.filter((l) => ehCor3(l.cor));
  const naoEstabelecidas = aplicaveis.filter(ehNaoEstabelecida);

  /* ── 1 · o que fechou a favor, do mais forte para o mais fraco ────────── */

  if (aFavor.length > 0) {
    const ordenadas = [...aFavor].sort(
      (a, b) => (FORCA[b.cor] ?? 0) - (FORCA[a.cor] ?? 0)
    );
    const forte = ordenadas[0];
    const tipo: TipoDoVereditoEvt =
      forte.cor === "1" ? "recomendada" : forte.cor === "2a" ? "razoavel" : "pode_ser_razoavel";
    return {
      ...base,
      tipo,
      /**
       * ⚠️ ⛔ A frase usa o **verbo da fonte**, ⛔ e ⛔ não uma paráfrase mais
       * dura ⛔ nem mais macia.
       */
      frase:
        tipo === "recomendada"
          ? "Os critérios registrados sustentam a trombectomia"
          : tipo === "razoavel"
            ? "Os critérios registrados tornam a trombectomia razoável"
            : "Os critérios registrados tornam a trombectomia possivelmente razoável",
      sustentam: ordenadas.map((l) => motivo(estado, agoraMs, l)),
      /** ⚠️ ⛔ A COR 3 concomitante ⛔ não some — ⛔ ela vira **contexto**. */
      contra: contra.map((l) => motivo(estado, agoraMs, l)),
      /** ⚠️ ⛔ E a *"⛔ não bem estabelecida"* concomitante também ⛔ não some. */
      semForca: naoEstabelecidas.map((l) => motivo(estado, agoraMs, l)),
      faltam: [],
    };
  }

  /* ── 2 · o que a diretriz desaconselha ────────────────────────────────── */

  if (contra.length > 0) {
    return {
      ...base,
      tipo: "nao_recomendada_sem_beneficio",
      /**
       * ⚠️⚠️ *"⛔ não recomendada"*, ⛔ e ⛔ **nunca** *"contraindicada"*. ⚠️ A
       * fonte diz **No Benefit** — ⛔ endurecer seria força fabricada pela tela.
       */
      frase: "A diretriz não recomenda a trombectomia neste caso, por ausência de benefício",
      sustentam: [],
      contra: contra.map((l) => motivo(estado, agoraMs, l)),
      semForca: naoEstabelecidas.map((l) => motivo(estado, agoraMs, l)),
      faltam: [],
    };
  }

  /* ── 3 · efetividade ⛔ não estabelecida ──────────────────────────────── */

  if (naoEstabelecidas.length > 0) {
    return {
      ...base,
      tipo: "efetividade_nao_estabelecida",
      /**
       * ⚠️⚠️ ⛔ **⛔ NEM SIM ⛔ NEM NÃO** — ⛔ e ⛔ este estado existe ⛔ porque a
       * basilar com NIHSS 6–9 ⛔ é ⛔ exatamente isso: ⛔ a fonte ⛔ não
       * recomenda ⛔ e ⛔ não desaconselha.
       */
      frase: "A efetividade da trombectomia neste cenário não está bem estabelecida",
      sustentam: [],
      contra: [],
      /** ⚠️⚠️ ⛔ AQUI ELA APARECE — ⛔ com COR, LOE ⛔ e o verbo verbatim. */
      semForca: naoEstabelecidas.map((l) => motivo(estado, agoraMs, l)),
      faltam: [],
    };
  }

  /* ── 4 · falta dado, ⛔ e ⛔ ele é nomeado ────────────────────────────── */

  /**
   * ⚠️⚠️⚠️ ⛔ SÓ O QUE FALTA A QUEM **⛔ AINDA ALCANÇA** O CASO.
   *
   * ⚠️ `potencialmente_aplicavel` já significa *"⛔ nenhum insumo contradiz"* —
   * ⛔ então uma recomendação **descartada pelo sítio** ⛔ não cobra ⛔ nada.
   * ⛔ É a regra do autor ao pé da letra: *"⛔ Não cobrar dados de recomendações
   * já contraditas."* ⛔ Um M1 ⛔ nunca é convidado a informar PC-ASPECTS.
   *
   * ── ⚠️⚠️ ⛔ E ⛔ POR QUE A COR 3 **⛔ NÃO** É MAIS PULADA (2026-09-07) ────
   *
   * ⛔ ⛔ Eu pulava toda COR 3 aqui, ⛔ pelo argumento de ⛔ não mandar o médico
   * trabalhar para fechar um *"⛔ não"*. ⚠️ ⛔ A janela da rec. 8 mostrou o furo:
   * um M2 ⛔ não dominante **sem horário** ficava `sem_criterios` — ⛔ o app
   * dizendo *"⛔ nenhum critério alcança este caso"* sobre um caso que um
   * critério **alcança**, ⛔ e ⛔ sem ⛔ nenhuma saída oferecida (**E-23**,
   * **E-26**).
   *
   * ⚠️ ⛔ E o dado que falta ⛔ ali ⛔ não é *"trabalho para fechar um ⛔ não"*:
   * ⛔ é o **relógio**, ⛔ que toda recomendação de EVT precisa.
   */
  const vistos = new Set<Insumo>();
  const faltam: FaltaDaEvt[] = [];
  for (const l of leituras) {
    if (l.correspondencia !== "potencialmente_aplicavel") continue;
    for (const i of l.faltam) {
      if (vistos.has(i)) continue;
      vistos.add(i);
      faltam.push({ insumo: i, rotulo: rotuloClinico(i), campos: CAMPOS_DO_INSUMO[i] });
    }
  }
  if (faltam.length > 0) {
    return {
      ...base,
      tipo: "incompleta",
      frase: "Ainda não dá para concluir: faltam dados",
      sustentam: [],
      contra: [],
      semForca: [],
      faltam,
    };
  }

  return {
    ...base,
    tipo: "sem_criterios",
    frase: "Nenhum critério da diretriz alcança este caso ainda",
    sustentam: [],
    contra: [],
    semForca: [],
    faltam: [],
  };
}
