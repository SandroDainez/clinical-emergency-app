/**
 * A CLASSIFICAÇÃO DE GRAVIDADE DOS DISTÚRBIOS ELETROLÍTICOS — COMO DADO.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE SAIU DO COMPONENTE
 *
 * Isto era um `switch` de 168 linhas dentro de
 * `components/protocol-screen/electrolyte-calculator-screen.tsx`, com 25 cortes
 * numéricos escritos no meio de JSX. Cada corte (`current < 120`, `>= 160`,
 * `< 2,5`) é uma AFIRMAÇÃO CLÍNICA: diz onde começa "grave". Enquanto morava no
 * componente, não tinha onde declarar procedência, nenhum instrumento a
 * enxergava, e mudá-la era editar código de tela.
 *
 * ⚠️ NENHUM NÚMERO MUDOU NA EXTRAÇÃO. Mover conteúdo não decide conteúdo — os 25
 * cortes estão aqui exatamente como estavam lá, e a trava
 * `valida-gravidade-eletrolitica.cjs` compara os dois estados.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * A PROCEDÊNCIA
 *
 * ⚠️ AS 24 AFIRMAÇÕES ESTÃO PENDENTES DE FONTE, e é isso que o campo diz. Elas
 * nunca passaram por fonte enquanto eram código de tela; passar a ser dado não
 * as confere — só cria O LUGAR onde a conferência vai caber. Pendência nomeada
 * é diferente de campo em branco: em branco ninguém sabe que falta.
 */
import { K_GRAVE } from "../hipercalemia";
import { type Analito, converter, type UnidadeDeConcentracao } from "./unidades";

export type DisturbioEletrolitico =
  | "hyponatremia" | "hypernatremia" | "hypokalemia" | "hyperkalemia"
  | "hypocalcemia" | "hypercalcemia" | "hypomagnesemia" | "hypermagnesemia"
  | "hypophosphatemia" | "hyperphosphatemia" | "hypochloremia" | "hyperchloremia";

export type ProcedenciaDeGravidade = {
  /** Documento que sustenta o corte. `null` enquanto a pendência estiver aberta. */
  fonte: string | null;
  /** `definicao` = afirmação do autor sobre o que a clínica é, não corte de diretriz. */
  forca?: "definicao";
  /** ⚠️ Quem assina a afirmação. Assinatura não substitui conferência. */
  declaradoPor?: string;
  /** ⚠️ Alvo NOMEADO da pendência — nunca vazio, nunca "a conferir". */
  alvo: string;
};

/**
 * ⚠️ O CRITÉRIO QUE NÃO É NÚMERO — a segunda metade do R-97.
 *
 * O R-97 dizia: tirar um número deixa buraco, e buraco pede número. Isto diz
 * POR QUE o buraco existia — **o modelo não sabia dizer outra coisa**. Um modelo
 * que só aceita número obriga a inventar número, e foi assim que se chegou a
 * "grave é abaixo de X" onde a fonte nunca escreveu X.
 *
 * A fonte da hipocalcemia (Society for Endocrinology) escreve:
 *
 *   grave: cálcio < 1,9 mmol/L **e/ou sintomas em qualquer valor abaixo da
 *   referência**
 *
 * Ou seja: **ela já subordina o número ao quadro**. O critério que decide conduta
 * é o SINTOMA — e sintoma é igual nos três ensaios (total, ajustado, iônico).
 * É por isso que o tipo novo não é só estrutura: ele é a forma de dizer o que a
 * fonte disse.
 *
 * ⚠️ E A `ligacao` VAI ESCRITA, NUNCA INFERIDA: "e/ou" da fonte vira `"ou"` por
 * extenso. `e` × `ou` mudam a conduta, e deixá-los para a interpretação de quem
 * lê o código é a mesma classe de defeito que os dois cálcios na mesma tela.
 */
/**
 * ⚠️ O PESO DA AFIRMAÇÃO É CAMPO, NÃO REDAÇÃO — mesmo princípio do `forca` nas
 * condutas.
 *
 * O autor separou os sintomas de hipocalcemia em TRÊS pesos (2026-08-23), e sem
 * um campo a distinção viraria prosa e sumiria na próxima edição:
 *
 *   `define`                → o núcleo sustentado pela Society for Endocrinology.
 *                             Qualquer um deles, com cálcio abaixo da referência,
 *                             faz o quadro ser grave independentemente do valor.
 *   `apoia`                 → aparece, não define. É o caso do broncoespasmo.
 *   `exigeCompatibilidade`  → ⚠️ NUNCA conclui sozinho. Hipotensão refratária a
 *                             vasopressor e disfunção miocárdica aguda são
 *                             ALTAMENTE INESPECÍFICAS no paciente crítico: o app
 *                             pode lembrá-las quando o cálcio JÁ está baixo,
 *                             nunca usá-las para concluir que está.
 */
export type PapelDoCriterio = "define" | "apoia" | "exigeCompatibilidade";

export type CorteDeGravidade =
  /**
   * ⚠️ `unidade` É A DA FONTE, não a da tela.
   *
   * Sem ela, o `1,9 mmol/L` da diretriz vira `7` mg/dL digitado à mão e a conta
   * some do repositório — foi assim que a D-90 nasceu. Com ela, o corte é o
   * número que a fonte escreveu, e a tela converte na hora com o fator visível.
   * Ausente = o corte já está na unidade em que o app trabalha.
   */
  | { tipo: "abaixoDe"; valor: number; unidade?: UnidadeDeConcentracao }
  | { tipo: "aPartirDe"; valor: number; unidade?: UnidadeDeConcentracao }
  | { tipo: "acimaDe"; valor: number; unidade?: UnidadeDeConcentracao }
  /**
   * Faixa com os DOIS lados. As três acima são a mesma família com um lado
   * aberto — e continuam como estão de propósito: dar a elas uma segunda grafia
   * seria criar duas formas de dizer a mesma coisa (R-95), e unificá-las exige
   * tocar nos outros dez distúrbios, que não é desta rodada.
   */
  | { tipo: "faixa"; de: number; ate: number; unidade?: UnidadeDeConcentracao }
  /**
   * ⚠️ CRITÉRIO QUE A FONTE ESCREVEU SEM NÚMERO.
   *
   * `texto` VAZIO significa PENDENTE — a estrutura existe, o conteúdo é do
   * autor, e enquanto estiver vazio o critério NUNCA casa. Vazio que casasse
   * classificaria por um critério que ninguém escreveu.
   */
  | { tipo: "clinico"; texto: string; papel: PapelDoCriterio; procedencia: ProcedenciaDeGravidade }
  /** Faixa e critério clínico, com a ligação dita por extenso. */
  | { tipo: "combinado"; faixa: CorteDeGravidade; ligacao: "e" | "ou"; clinico: CorteDeGravidade }
  /** O ECG alterado sozinho sobe o degrau, sem número. */
  | { tipo: "ecgAlterado" }
  /** Degrau de base: vale quando nenhum corte acima casou. */
  | { tipo: "restante" };

/**
 * ⚠️ DISTÚRBIO SEM ESCALA DE APRESENTAÇÃO.
 *
 * Três distúrbios repetiam o mesmo texto de sinais nos dois degraus, e a leitura
 * do autor (2026-08-23) foi que isso não era preguiça de quem escreveu — é a
 * clínica: eles NÃO TÊM apresentação própria que se agrave em degraus.
 *
 *   • hipo e hipercloremia são quase sempre MARCADORES, não doenças: o que
 *     importa é o distúrbio ácido-base e a causa. O paciente não tem "sintoma de
 *     cloro".
 *   • hiperfosfatemia aguda manifesta-se pelo que ela CAUSA — hipocalcemia
 *     sintomática e precipitação — não por si.
 *
 * Então o texto igual nos dois degraus estava factualmente certo e A TELA é que
 * estava errada: dois degraus sugerem uma escala de sintomas que não existe.
 * Aqui eles passam a ter UM degrau só, que diz isso.
 *
 * ⚠️ E NÃO SE INVENTOU SINTOMA PARA PREENCHER O DEGRAU QUE SAIU. É o R-97 outra
 * vez: buraco pede número, degrau vazio pede sintoma.
 */
export const SEM_ESCALA_DE_APRESENTACAO =
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa e a velocidade de instalação";
export const SEM_ESCALA_HIPERFOSFATEMIA =
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa, a velocidade de instalação e o cálcio associado";

export type DegrauDeGravidade = {
  rotulo: string;
  sinais: string;
  /** Vários cortes = qualquer um deles basta (OU). */
  cortes: CorteDeGravidade[];
  procedencia: ProcedenciaDeGravidade;
};

const PENDENTE = (alvo: string): ProcedenciaDeGravidade => ({ fonte: null, alvo });

/**
 * ⚠️ FORÇA `definicao`, DECLARADA PELO AUTOR — e pendente de conferência dele.
 * Não é corte de diretriz: é a afirmação de que NÃO EXISTE escala de
 * apresentação nesses três. Quem afirma assina.
 */
const DEFINICAO_DO_AUTOR: ProcedenciaDeGravidade = {
  fonte: null,
  forca: "definicao",
  declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
  alvo: "afirmação de que não há escala de apresentação nestes três — confirmação do autor pendente, e nenhum sintoma foi inventado para preencher o degrau que saiu",
};

const P_NA = PENDENTE("limiar de hiponatremia grave — alvo: diretriz europeia de hiponatremia (ESICM/ESE/ERA-EDTA 2014), verbatim em protocols/fontes-verbatim/");
const P_NA_ALTA = PENDENTE("limiar de hipernatremia grave — alvo: fonte primária a nomear pelo autor");
const P_K_BAIXO = PENDENTE("limiar de hipocalemia grave — alvo: fonte primária a nomear pelo autor");
const P_K_ALTO = PENDENTE("limiar já vem de lib/hipercalemia.ts (K_GRAVE); a procedência do NÚMERO segue lá, esta linha só o consome");
const P_CA = PENDENTE("limiares de cálcio — alvo: Society for Endocrinology, Emergency management of acute hypocalcaemia / hypercalcaemia in adult patients (nomeada pelo autor em 2026-08-23). ⚠️ Os cortes do app estão em mg/dL e os da fonte em mmol/L — NADA foi convertido, e a conversão é decisão do autor");

/**
 * ⚠️ ESTRUTURA PRONTA, CONTEÚDO DO AUTOR — e o vazio é de propósito.
 *
 * A fonte diz que a hipocalcemia é grave com "sintomas em qualquer valor abaixo
 * da referência". A LISTA desses sintomas é afirmação clínica e não foi escrita
 * aqui: escrevê-la seria exatamente o que este projeto passou semanas removendo.
 *
 * Enquanto `texto` estiver vazio o critério NUNCA casa — a tela não classifica
 * por ele, e nada muda para o usuário. Quando o autor preencher, o degrau
 * sintomático passa a valer sem tocar em código de tela.
 *
 * ⚠️ E É ELE QUE TIRA O IÔNICO DO BECO: hoje, quem informa cálcio iônico recebe
 * "não há cortes definidos aqui" e para — quem tem o melhor exame recebe a pior
 * resposta. Com o ramo sintomático, o caso que corre já é respondido, porque
 * SINTOMA É IGUAL NOS TRÊS ENSAIOS. O corte do iônico continua pendente; o beco,
 * não.
 */
const P_MG = PENDENTE("limiares de magnésio — ⚠️ INTOCADOS por decisão do autor (2026-08-23): ele quer conferir número por número");
const P_P = PENDENTE("limiar de fósforo grave — consenso amplo em < 0,32 mmol/L (< 1 mg/dL), nomeado pelo autor; ⚠️ NÃO rotular como diretriz internacional, e não há consenso universal para todas as faixas");
const P_CL = PENDENTE("limiares de cloro — alvo: fonte primária a nomear pelo autor");

const FONTE_SE = "Society for Endocrinology — Emergency management of acute hypocalcaemia in adult patients";
const P_SINTOMA = (papel: PapelDoCriterio, nota: string): ProcedenciaDeGravidade => ({
  fonte: FONTE_SE,
  declaradoPor: "Dr. Sandro Dainez, 2026-08-23",
  alvo: `${nota} — confirmado pelo autor; o verbatim da Society for Endocrinology ainda não foi transcrito para protocols/fontes-verbatim/`,
});

/**
 * ⚠️ A CONDIÇÃO QUE A FONTE ESCREVEU JUNTO, E QUE O APP NÃO SABE AVALIAR.
 *
 * A fonte diz "sintomas em qualquer valor ABAIXO DA REFERÊNCIA" — e o app não
 * tem o intervalo de referência do laboratório de quem está usando. Inventar um
 * seria exatamente o defeito que este módulo passou a semana removendo.
 *
 * Então a condição vai ESCRITA na pergunta, e quem julga é quem tem o laudo na
 * mão. O app não finge saber o que não sabe.
 */
export const SINTOMATICO_CONDICAO =
  "Considerando o cálcio ABAIXO DA REFERÊNCIA do seu laboratório — o app não conhece o intervalo do seu método.";

export const SINTOMATICO_PERGUNTA = "Há manifestação clínica de hipocalcemia?";

/**
 * O NÚCLEO — qualquer um destes, com cálcio abaixo da referência, é grave
 * independentemente do valor. Confirmado pelo autor em 2026-08-23.
 */
export const NUCLEO_SINTOMATICO: CorteDeGravidade[] = [
  { tipo: "clinico", texto: "Parestesia perioral e de extremidades", papel: "define", procedencia: P_SINTOMA("define", "parestesia perioral e de extremidades") },
  { tipo: "clinico", texto: "Espasmo carpopedal ou tetania", papel: "define", procedencia: P_SINTOMA("define", "espasmo carpopedal / tetania") },
  { tipo: "clinico", texto: "Sinal de Trousseau ou de Chvostek", papel: "define", procedencia: P_SINTOMA("define", "sinais de Trousseau e Chvostek") },
  { tipo: "clinico", texto: "Laringoespasmo ou estridor", papel: "define", procedencia: P_SINTOMA("define", "laringoespasmo / estridor") },
  { tipo: "clinico", texto: "Convulsão", papel: "define", procedencia: P_SINTOMA("define", "convulsão") },
  { tipo: "clinico", texto: "QT prolongado e/ou arritmia", papel: "define", procedencia: P_SINTOMA("define", "QT prolongado e/ou arritmia") },
];

/** APARECE, NÃO DEFINE. */
export const APOIAM_SINTOMATICO: CorteDeGravidade[] = [
  { tipo: "clinico", texto: "Broncoespasmo", papel: "apoia", procedencia: P_SINTOMA("apoia", "broncoespasmo — manifestação possível, não definidora") },
];

/**
 * ⚠️ EXIGEM COMPATIBILIDADE — e a razão é a que impede o erro: são altamente
 * INESPECÍFICAS no paciente crítico. Hipotensão refratária a vasopressor tem
 * cinquenta causas antes do cálcio. O app as LEMBRA quando o cálcio já está
 * baixo; nunca conclui por elas.
 */
export const EXIGEM_COMPATIBILIDADE: CorteDeGravidade[] = [
  { tipo: "clinico", texto: "Hipotensão refratária a vasopressor", papel: "exigeCompatibilidade", procedencia: P_SINTOMA("exigeCompatibilidade", "hipotensão refratária a vasopressor — possível na hipocalcemia grave, altamente inespecífica no crítico") },
  { tipo: "clinico", texto: "Disfunção miocárdica aguda", papel: "exigeCompatibilidade", procedencia: P_SINTOMA("exigeCompatibilidade", "disfunção miocárdica aguda — possível na hipocalcemia grave, altamente inespecífica no crítico") },
];

/**
 * ⚠️ O CÁLCIO IONIZADO NÃO GANHOU FAIXA DE GRAVIDADE, por decisão do autor — e a
 * decisão é o oposto de omissão: usa-se o valor medido, a REFERÊNCIA DO
 * LABORATÓRIO e o contexto. Converter o corte do total/ajustado para o ionizado
 * está explicitamente proibido.
 */
export const IONIZADO_NOTAS = [
  "O cálcio ionizado é influenciado pelo pH — alcalose reduz a fração ionizada sem mudar o cálcio total.",
  "Os intervalos de referência do ionizado dependem do MÉTODO e do EQUIPAMENTO: use a referência do laudo, não um número decorado.",
  "Por isso este app não cria faixas de gravidade para o ionizado. O ramo sintomático acima responde igual nos três ensaios.",
];

/**
 * A unidade em que a TELA trabalha, por distúrbio — o outro lado da conversão.
 * ⚠️ Só entram os que têm corte com unidade de fonte declarada; o resto compara
 * na unidade em que já está, e a ausência aqui é o que diz isso.
 */
const UNIDADE_DA_TELA: Partial<Record<DisturbioEletrolitico, { unidade: UnidadeDeConcentracao; analito: Analito }>> = {
  hypocalcemia: { unidade: "mg/dL", analito: "calcio" },
  hypercalcemia: { unidade: "mg/dL", analito: "calcio" },
};

export const AGUARDANDO_VALOR = {
  rotulo: "Aguardando valor",
  sinais: "Preencha o valor atual para classificar gravidade e destacar sinais principais.",
};

export const GRAVIDADE_POR_DISTURBIO: Record<DisturbioEletrolitico, DegrauDeGravidade[]> = {
  hyponatremia: [
    { rotulo: "Grave", sinais: "Maior risco de confusão, sonolência, convulsão e herniação iminente se queda for aguda.", cortes: [{ tipo: "abaixoDe", valor: 120 }], procedencia: P_NA },
    { rotulo: "Leve a moderada", sinais: "Costuma cursar com náusea, cefaleia, mal-estar e alteração neurológica mais discreta.", cortes: [{ tipo: "restante" }], procedencia: P_NA },
  ],
  hypernatremia: [
    { rotulo: "Grave", sinais: "Sede intensa, letargia, irritabilidade, mioclonia e convulsão; monitorização próxima.", cortes: [{ tipo: "aPartirDe", valor: 160 }], procedencia: P_NA_ALTA },
    { rotulo: "Leve a moderada", sinais: "Sede, fraqueza, irritabilidade e desidratação são os achados mais comuns.", cortes: [{ tipo: "restante" }], procedencia: P_NA_ALTA },
  ],
  hypokalemia: [
    { rotulo: "Grave", sinais: "Fraqueza importante, íleo, paralisia, rabdomiólise e arritmia.", cortes: [{ tipo: "abaixoDe", valor: 2.5 }], procedencia: P_K_BAIXO },
    { rotulo: "Leve a moderada", sinais: "Cãibras, fraqueza, poliúria e palpitação são mais prováveis.", cortes: [{ tipo: "restante" }], procedencia: P_K_BAIXO },
  ],
  hyperkalemia: [
    // ⚠️ DOIS GATILHOS, E O SEGUNDO NÃO É NÚMERO: o ECG alterado sozinho sobe o
    // degrau para emergência, com qualquer valor de potássio.
    { rotulo: "Emergência", sinais: "Bradicardia, QRS alargado, bloqueios e risco de parada elétrica.", cortes: [{ tipo: "aPartirDe", valor: K_GRAVE }, { tipo: "ecgAlterado" }], procedencia: P_K_ALTO },
    { rotulo: "Moderada", sinais: "Fraqueza, parestesias e progressão elétrica se o potássio continuar subindo.", cortes: [{ tipo: "restante" }], procedencia: P_K_ALTO },
  ],
  hypocalcemia: [
    // ⚠️ `ou`, POR EXTENSO, porque a fonte escreveu "e/ou": o sintoma sozinho
    // basta, em qualquer valor. Inferir isso do texto seria deixar a conduta na
    // interpretação de quem lê o código.
    {
      rotulo: "Grave",
      sinais: "Tetania, broncoespasmo, convulsão e QT longo.",
      // ⚠️ `ou` entre o número e CADA um do núcleo: o sintoma sozinho basta.
      cortes: [
        ...NUCLEO_SINTOMATICO.map((c): CorteDeGravidade => ({
          // ⚠️ 1,9 mmol/L É O NÚMERO DA FONTE. Ele passou a morar aqui na unidade
          // em que a Society for Endocrinology o escreveu; a tela converte com o
          // fator declarado em lib/eletrolitos/unidades.ts. O corte anterior era
          // `< 7 mg/dL` — uma conversão feita de cabeça e nunca conferida (D-90).
          tipo: "combinado", faixa: { tipo: "abaixoDe", valor: 1.9, unidade: "mmol/L" }, ligacao: "ou", clinico: c,
        })),
      ],
      procedencia: P_CA,
    },
    { rotulo: "Leve a moderada", sinais: "Parestesia perioral, câimbras e desconforto neuromuscular.", cortes: [{ tipo: "restante" }], procedencia: P_CA },
  ],
  hypercalcemia: [
    // ⚠️ AS DUAS FAIXAS DA FONTE, na unidade dela. A de cima praticamente
    // coincidia com o `≥ 14 mg/dL` que estava aqui (14 mg/dL ≈ 3,49 mmol/L), mas
    // coincidir por acaso não é o mesmo que vir da fonte.
    { rotulo: "Correção urgente", sinais: "Encefalopatia, desidratação importante, disfunção renal e maior chance de UTI.", cortes: [{ tipo: "acimaDe", valor: 3.5, unidade: "mmol/L" }], procedencia: P_CA },
    // ⚠️ A FAIXA DO MEIO, QUE NÃO EXISTIA (D-91). Ela CLASSIFICA por número — o
    // julgamento clínico modula a CONDUTA, não a classificação, e por isso ela
    // NÃO é `combinado`. Ver auditoria/PROPOSTA-CLASSIFICACAO-VS-CONDUTA.md.
    { rotulo: "Significativa", sinais: "Náusea, constipação, poliúria e fadiga predominam.", cortes: [{ tipo: "faixa", de: 3.0, ate: 3.5, unidade: "mmol/L" }], procedencia: P_CA },
    { rotulo: "Leve a moderada", sinais: "Náusea, constipação, poliúria e fadiga predominam.", cortes: [{ tipo: "restante" }], procedencia: P_CA },
  ],
  hypomagnesemia: [
    { rotulo: "Grave", sinais: "QT longo, torsades, tremor, tetania e convulsão.", cortes: [{ tipo: "abaixoDe", valor: 1.2 }], procedencia: P_MG },
    { rotulo: "Leve a moderada", sinais: "Tremor, fraqueza e piora de hipocalemia refratária.", cortes: [{ tipo: "restante" }], procedencia: P_MG },
  ],
  hypermagnesemia: [
    { rotulo: "Grave", sinais: "Hiporreflexia, sonolência, hipotensão e depressão respiratória.", cortes: [{ tipo: "aPartirDe", valor: 4.9 }], procedencia: P_MG },
    { rotulo: "Moderada", sinais: "Rubor, letargia e reflexos diminuídos podem aparecer.", cortes: [{ tipo: "restante" }], procedencia: P_MG },
  ],
  hypophosphatemia: [
    { rotulo: "Grave", sinais: "Fraqueza diafragmática, insuficiência respiratória, rabdomiólise e hemólise.", cortes: [{ tipo: "abaixoDe", valor: 1 }], procedencia: P_P },
    { rotulo: "Leve a moderada", sinais: "Fraqueza e queda de performance muscular são os sinais mais prováveis.", cortes: [{ tipo: "restante" }], procedencia: P_P },
  ],
  hyperphosphatemia: [
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_HIPERFOSFATEMIA, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
  ],
  hypochloremia: [
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_DE_APRESENTACAO, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
  ],
  hyperchloremia: [
    // ⚠️ UM DEGRAU SÓ, de propósito — ver SEM_ESCALA_DE_APRESENTACAO.
    { rotulo: "Sem escala de apresentação", sinais: SEM_ESCALA_DE_APRESENTACAO, cortes: [{ tipo: "restante" }], procedencia: DEFINICAO_DO_AUTOR },
  ],
};

/**
 * ⚠️ O CORTE VEM PARA A UNIDADE DA TELA, e não o contrário.
 *
 * Devolve `null` quando não sabe converter — e `null` NÃO CASA. Comparar um
 * corte em mmol/L com um valor em mg/dL daria 1,9 contra 7,3 e chamaria de leve
 * o que é grave: exatamente ao contrário do defeito que isto conserta, e pior.
 */
function naUnidadeDaTela(valor: number, corte: { unidade?: UnidadeDeConcentracao }, alvo: { unidade: UnidadeDeConcentracao; analito: Analito } | undefined): number | null {
  if (!corte.unidade) return valor;
  if (!alvo) return null;
  return converter(valor, corte.unidade, alvo.unidade, alvo.analito);
}

function casa(
  corte: CorteDeGravidade,
  valor: number | null,
  ecgAlterado: boolean,
  sintomatico: boolean | null,
  alvo?: { unidade: UnidadeDeConcentracao; analito: Analito }
): boolean {
  const conv = (v: number) => naUnidadeDaTela(v, corte as { unidade?: UnidadeDeConcentracao }, alvo);
  switch (corte.tipo) {
    case "abaixoDe": { const c = conv(corte.valor); return valor != null && c != null && valor < c; }
    case "aPartirDe": { const c = conv(corte.valor); return valor != null && c != null && valor >= c; }
    case "acimaDe": { const c = conv(corte.valor); return valor != null && c != null && valor > c; }
    case "faixa": { const de = conv(corte.de), ate = conv(corte.ate); return valor != null && de != null && ate != null && valor >= de && valor < ate; }
    // ⚠️ PENDENTE NÃO CASA: texto vazio é estrutura à espera do autor, e um
    // critério sem texto classificando seria classificar por nada.
    // ⚠️ SÓ `define` CLASSIFICA. `apoia` e `exigeCompatibilidade` existem para
    // serem LEMBRADOS na tela, nunca para concluir — e é isso que impede uma
    // hipotensão refratária (inespecífica no crítico) de virar diagnóstico de
    // hipocalcemia.
    case "clinico":
      return corte.papel === "define" && corte.texto.trim().length > 0 && sintomatico === true;
    case "combinado": {
      const a = casa(corte.faixa, valor, ecgAlterado, sintomatico, alvo);
      const b = casa(corte.clinico, valor, ecgAlterado, sintomatico, alvo);
      return corte.ligacao === "ou" ? a || b : a && b;
    }
    case "ecgAlterado": return ecgAlterado;
    case "restante": return true;
  }
}

/**
 * O degrau que vale — PRIMEIRO que casa, e é por isso que a ordem da lista
 * importa: o mais grave vem primeiro, o `restante` por último.
 *
 * ⚠️ Distúrbio sem entrada devolve `null` em vez de chutar um degrau. Um
 * eletrólito novo que ninguém classificou não é "moderado" por omissão.
 */
export function degrauDeGravidade(
  disturbio: string,
  valorAtual: number | null,
  ecgAlterado = false,
  /**
   * ⚠️ `true` = o médico afirmou que HÁ sintoma. `null` = ninguém perguntou —
   * e é o estado de hoje, porque a lista de sintomas é do autor.
   */
  sintomatico: boolean | null = null,
  /**
   * ⚠️ QUAL ENSAIO produziu o valor. `"ionico"` faz TODO corte numérico deixar
   * de casar — e a trava confere isso, porque é o erro mais provável desta
   * rodada: o corte do total/ajustado está ali do lado, na mesma estrutura, e
   * aplicá-lo a um ionizado é decisão de uma linha. Proibição explícita do
   * autor (2026-08-23).
   */
  ensaio: "total" | "ajustado" | "ionico" | null = null
): DegrauDeGravidade | null {
  const degraus = GRAVIDADE_POR_DISTURBIO[disturbio as DisturbioEletrolitico];
  if (!degraus) return null;
  // ⚠️ SEM VALOR, O RAMO SINTOMÁTICO AINDA PODE RESPONDER: é o ponto do
  // critério clínico — quem tem sintoma é grave qualquer que seja o número, e
  // qualquer que seja o ensaio. Só se não houver valor NEM sintoma é que não há
  // o que classificar.
  if (valorAtual == null && sintomatico !== true) return null;
  const alvo = UNIDADE_DA_TELA[disturbio as DisturbioEletrolitico];
  // ⚠️ O IONIZADO NÃO RECEBE O CORTE DO TOTAL/AJUSTADO, POR NENHUM CAMINHO —
  // e "nenhum caminho" inclui o DEGRAU DE BASE.
  //
  // A primeira versão só zerava o valor, e o `restante` engolia: o ionizado caía
  // no último degrau e a tela dizia "Leve a moderada". Classificar por QUEDA é
  // classificar — com a agravante de parecer conclusão e ser omissão. Com
  // ionizado, só o critério CLÍNICO pode concluir; sem ele, não há classificação
  // e a tela mostra as notas do ionizado.
  if (ensaio === "ionico") {
    const porSintoma = degraus.find((d) =>
      d.cortes.some((c) => {
        const clinico = c.tipo === "combinado" ? c.clinico : c;
        return clinico.tipo === "clinico" && casa(clinico, null, ecgAlterado, sintomatico, alvo);
      })
    );
    return porSintoma ?? null;
  }
  return degraus.find((d) => d.cortes.some((c) => casa(c, valorAtual, ecgAlterado, sintomatico, alvo))) ?? null;
}
