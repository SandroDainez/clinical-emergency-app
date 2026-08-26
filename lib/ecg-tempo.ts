import type { AlertaPersistente, TreeValues } from "../core/decision-tree/types";

/**
 * O ECG DE 12 DERIVAÇÕES E A META DE 10 MINUTOS.
 *
 * ── A REGRA ────────────────────────────────────────────────────────────────
 *
 * Em suspeita de síndrome coronariana aguda, o ECG de 12 derivações deve ser
 * OBTIDO E INTERPRETADO em até 10 minutos do PRIMEIRO CONTATO MÉDICO (FMC).
 * Fonte: ACC/AHA 2025 (diretriz de SCA). A diretriz brasileira sustenta o mesmo
 * alvo.
 *
 * ⚠️ "OBTIDO E INTERPRETADO", NÃO "SOLICITADO". Um ECG feito aos 8 minutos e
 * lido aos 25 não cumpriu a meta — o que muda a conduta é a leitura, não o
 * papel. Por isso a pergunta desta camada é sobre o traçado estar na mão e
 * lido, e não sobre o pedido ter sido feito.
 *
 * ⚠️ "PRIMEIRO CONTATO MÉDICO", NÃO "CHEGADA" (decisão do autor, 2026-08-26).
 * O texto anterior do módulo dizia "em até 10 min da chegada". As duas coisas
 * só coincidem no pronto-socorro. No atendimento pré-hospitalar e no paciente
 * já internado que passa a ter dor, "chegada" não significa nada — e era
 * exatamente nesses dois cenários que a contagem ficava sem sentido.
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ────────────────────────────────────────────
 *
 * A informação certa já estava no módulo: o nó `entry` listava "ECG de 12
 * derivações em até 10 min da chegada". Mas era o ITEM 4 DE UMA LISTA DE 8,
 * entre "2 acessos venosos" e "coletar troponina", com o mesmo peso visual de
 * "monitor cardíaco contínuo". Não pedia confirmação, não registrava hora, não
 * sabia se tinha sido feito, e nada voltava a cobrar.
 *
 * ⚠️ E TRÊS DOS CINCO ATALHOS DO MENU PULAVAM O `entry` INTEIRO. Por "Já tenho
 * o ECG na mão", "STEMI já confirmado" e "Só preciso das doses" o lembrete
 * simplesmente não existia — o mesmo beco que deixou o PDE-5 escapar, agora no
 * dado mais sensível ao tempo do módulo.
 *
 * ── O QUE ESTA CAMADA NÃO FAZ ──────────────────────────────────────────────
 *
 * ⚠️ NÃO BLOQUEIA. Paciente instável estabiliza primeiro; uma tela de ECG que
 * segurasse o fluxo atrasaria justamente quem não pode esperar. O ciclo é
 * LEMBRAR → REGISTRAR → MEDIR ATRASO, nunca IMPEDIR.
 *
 * ⚠️ NÃO INVENTA HORÁRIO. Sem âncora informada, o estado é "pendente" e a faixa
 * NÃO afirma atraso — porque não sabe. Zero silencioso aqui seria pior que a
 * ausência: diria "no prazo" para todo mundo.
 *
 * ⚠️ NÃO É CONTAGEM REGRESSIVA. Um relógio descendo de 10:00 dá a impressão de
 * que o app sabe quando o atendimento começou. Ele sabe apenas o que o médico
 * informou, com a grosseria de "há quantos minutos" — e a faixa fala nesse
 * mesmo grão.
 */

/** Minutos do primeiro contato médico até o ECG ficar pronto e lido. */
export const META_ECG_MIN = 10;

export const FONTE_ECG_10MIN = "Fonte: ACC/AHA 2025 — diretriz de síndromes coronarianas agudas.";

/**
 * A chave do marco no motor.
 *
 * ⚠️ ESPELHA `DecisionTreeEngine.chaveDoMarco("primeiroContatoMedico")`, que é
 * privado. A duplicação é UM literal e está travada por `test:ecg-tempo`, que
 * arma o marco pelo motor e confere que esta leitura o encontra — se o motor
 * mudar o formato da chave, a trava quebra aqui em vez de a faixa emudecer em
 * silêncio.
 */
const CHAVE_MARCO_FMC = "__marco_primeiroContatoMedico";

export type SituacaoDoEcg =
  /** Ainda não perguntamos. Nada a afirmar. */
  | "nao_perguntado"
  /** Não foi feito, e não sabemos desde quando. Sem afirmar atraso. */
  | "pendente_sem_ancora"
  /** Não foi feito; dentro da meta pelo que foi informado. */
  | "pendente_no_prazo"
  /** Não foi feito e a meta já passou. */
  | "pendente_atrasado"
  /** Feito, mas sem dados para medir o intervalo. */
  | "feito_sem_medida"
  /** Feito dentro da meta. */
  | "feito_no_prazo"
  /** Feito fora da meta. */
  | "feito_fora_da_meta";

export type EstadoDoEcg = {
  situacao: SituacaoDoEcg;
  /** Minutos desde o primeiro contato médico, quando há âncora. */
  desdeContatoMin: number | null;
  /**
   * Minutos entre o primeiro contato e o ECG. Só existe quando os DOIS foram
   * informados — `null` é "não medido", nunca "zero".
   */
  intervaloMin: number | null;
};

function inteiroPositivo(bruto: string | undefined): number | null {
  if (bruto === undefined || bruto.trim() === "") return null;
  const n = Number(bruto);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * O estado do ECG, derivado do que foi coletado. Função pura: mesma entrada,
 * mesma saída — e nada aqui é gravado.
 *
 * `agora` entra como argumento, e não por `Date.now()` dentro: sem isso, provar
 * o comportamento na virada dos 10 minutos exigiria substituir o relógio global
 * no teste, o que testa o mundo e não esta regra.
 */
export function estadoDoEcg(values: TreeValues, agora: number): EstadoDoEcg {
  const realizado = values.ecg_realizado;

  const ancora = inteiroPositivo(values[CHAVE_MARCO_FMC]);
  const desdeContatoMin = ancora === null ? null : Math.floor((agora - ancora) / 60_000);

  // "Há quantos minutos o ECG ficou pronto" — contado de agora, como o FMC.
  const ecgHaMin = inteiroPositivo(values.ecg_ha_min);

  // O intervalo que a meta cobra: do primeiro contato até o ECG. As duas
  // medidas olham para trás a partir de agora, então a diferença entre elas é o
  // intervalo — e ela só existe se ambas existirem.
  const intervaloMin =
    desdeContatoMin !== null && ecgHaMin !== null && desdeContatoMin >= ecgHaMin
      ? desdeContatoMin - ecgHaMin
      : null;

  if (realizado === "sim") {
    if (intervaloMin === null) {
      return { situacao: "feito_sem_medida", desdeContatoMin, intervaloMin };
    }
    return {
      situacao: intervaloMin <= META_ECG_MIN ? "feito_no_prazo" : "feito_fora_da_meta",
      desdeContatoMin,
      intervaloMin,
    };
  }

  if (realizado === "nao") {
    if (desdeContatoMin === null) {
      return { situacao: "pendente_sem_ancora", desdeContatoMin, intervaloMin };
    }
    return {
      situacao: desdeContatoMin > META_ECG_MIN ? "pendente_atrasado" : "pendente_no_prazo",
      desdeContatoMin,
      intervaloMin,
    };
  }

  return { situacao: "nao_perguntado", desdeContatoMin, intervaloMin };
}

// Literais soltos porque o dicionário PT→ES casa por string inteira: montar o
// texto com template literal o deixaria fora da tradução (D-19).
const TEXTO_PENDENTE = "ECG de 12 derivações: pendente — meta ≤10 min do primeiro contato médico.";
const TEXTO_ATRASADO = "ECG atrasado em relação à meta — obtenha e interprete o ECG de 12 derivações agora.";
const DETALHE_DESDE_CONTATO = "Primeiro contato médico há {min} min.";
const DETALHE_SEM_ANCORA = "Tempo desde o primeiro contato não informado — o atraso não está sendo medido.";

/**
 * A faixa que acompanha o atendimento.
 *
 * ⚠️ SÓ ENQUANTO PENDENTE. Depois do ECG feito a faixa SOME — inclusive quando
 * a meta foi ultrapassada. Uma faixa que continuasse cobrando um atraso já
 * consumado não teria ação possível ("obtenha agora" para quem já obteve), e
 * aviso sem ação é o que ensina o médico a ignorar a faixa. O atraso medido
 * fica em `estadoDoEcg`, para o registro do atendimento.
 */
export function alertaDoEcg(values: TreeValues, agora: number): AlertaPersistente | null {
  const estado = estadoDoEcg(values, agora);

  if (estado.situacao === "pendente_atrasado") {
    return {
      id: "ecg_12_derivacoes",
      nivel: "atencao",
      texto: TEXTO_ATRASADO,
      detalhe: DETALHE_DESDE_CONTATO,
      valores: { min: String(estado.desdeContatoMin) },
    };
  }

  if (estado.situacao === "pendente_no_prazo") {
    return {
      id: "ecg_12_derivacoes",
      nivel: "info",
      texto: TEXTO_PENDENTE,
      detalhe: DETALHE_DESDE_CONTATO,
      valores: { min: String(estado.desdeContatoMin) },
    };
  }

  if (estado.situacao === "pendente_sem_ancora") {
    return {
      id: "ecg_12_derivacoes",
      nivel: "info",
      texto: TEXTO_PENDENTE,
      detalhe: DETALHE_SEM_ANCORA,
    };
  }

  return null;
}
