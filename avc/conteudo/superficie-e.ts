/**
 * CONTEÚDO DA SUPERFÍCIE E — Correções.
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ E NASCE PEQUENA, E ISSO É A DECISÃO ────────────────────────────────
 *
 * > *"Se começarem a entrar anticoagulação, imagem, DOAC ou critérios de
 * > reperfusão ali, a superfície perde o propósito."* — autor, 2026-08-30
 *
 * **Dois** bloqueios, e ⛔ nada mais: pressão arterial e glicemia. São os únicos
 * que a fonte declara **corrigíveis**, e os únicos que uma **nova aferição em A**
 * resolve objetivamente.
 *
 * ── ⛔ O QUE E ⛔ NÃO POSSUI ──────────────────────────────────────────────────
 *
 * ⛔ E ⛔ **não tem PA**. ⛔ E ⛔ **não tem glicemia**. Ela lê os dois de A, através da
 * leitura de segurança de D, e ⛔ não redeclara ⛔ nenhum deles.
 *
 * ⛔⛔ **E ⛔ NÃO TEM FÁRMACO, DOSE, VIA ⛔ NEM ESQUEMA** — decisão do autor enquanto
 * **F-19 estiver parcial**. F-04 item 9 é explícito: *"a fonte ⛔ não nomeia
 * ⛔ nenhum fármaco"*. E oferece a **ação terapêutica abstrata**; a prescrição
 * entra quando houver verbatim que a sustente.
 */

import type { SuperficieId } from "../nucleo/tipos";
import type { Campo, CampoDeclarado, Grupo, GrupoDeclarado } from "./campo";
import { camposDoGrupo, comCasa } from "./campo";

export type CampoE = CampoDeclarado;

/**
 * ⚠️⚠️ **A AÇÃO É UMA INSTÂNCIA** — e ⛔ não um estado global.
 *
 * > *"Uma ação pode ser repetida. Especialmente PA: pode haver mais de uma
 * > intervenção terapêutica antes da nova aferição."*
 *
 * ⛔ Um único *"tratamento da PA"* apagaria a segunda intervenção em cima da
 * primeira, e a trilha perderia que houve duas.
 */
export const ACAO = "acao";

/**
 * OS ESTADOS DA AÇÃO — ⚠️ **possibilidades, e ⛔ não workflow obrigatório**.
 *
 * > *"O médico pode registrar diretamente iniciada, realizada ou cancelada, se a
 * > ação já aconteceu fora da sequência da interface. ⛔ Não fabricar estados
 * > intermediários."*
 *
 * ⚠️⚠️ Quem chega em E com o anti-hipertensivo **já correndo** ⛔ não pode ser
 * obrigado a passar por `sugerida` — isso gravaria na trilha uma sugestão que o
 * app ⛔ nunca fez, num instante em que ela ⛔ não existiu.
 */
export const ESTADO_DA_ACAO = {
  disponivel: "Disponível",
  sugerida: "Sugerida",
  iniciada: "Iniciada",
  realizada: "Realizada",
  cancelada: "Cancelada",
} as const;

export const OPCOES_ESTADO_DA_ACAO: readonly string[] = [
  ESTADO_DA_ACAO.iniciada,
  ESTADO_DA_ACAO.realizada,
  ESTADO_DA_ACAO.cancelada,
];

/**
 * ⛔⛔ `cancelada` ⛔ NUNCA É DESFECHO FAVORÁVEL — trava do autor.
 *
 * ⚠️ Ela é estado legítimo de uma ação **considerada e abandonada**, e existe
 * para a auditoria da decisão. Mas ⛔ **não** resolve bloqueio, ⛔ **não** conta
 * como tratamento realizado e ⛔ **não** produz derivação favorável ⛔ nenhuma.
 *
 * ⚠️⚠️ E `realizada` ⛔ também ⛔ não resolve: ela diz que a ação **aconteceu**. Se
 * funcionou, quem responde é a **nova aferição**.
 */
export const ESTADOS_QUE_NAO_RESOLVEM: readonly string[] = [
  ESTADO_DA_ACAO.disponivel,
  ESTADO_DA_ACAO.sugerida,
  ESTADO_DA_ACAO.iniciada,
  ESTADO_DA_ACAO.realizada,
  ESTADO_DA_ACAO.cancelada,
];

/** ⚠️ Uma ação que E sabe oferecer — e ⛔ são duas, ⛔ nem uma a mais. */
export type AcaoDeCorrecao = {
  readonly id: string;
  readonly rotulo: string;
  /** ⚠️ O bloqueio de D que a dispara. ⛔ E ⛔ não decide sozinha que há bloqueio. */
  readonly bloqueio: "pressao_acima_da_meta" | "glicemia_alterada";
  readonly fonte: string;
  /** ⚠️ Verbatim, em inglês — a autoridade, como em D. */
  readonly verbo: string;
  /** ⚠️ A frase clínica em português, que o médico lê primeiro. */
  readonly formulacao: string;
  /** ⚠️ Qual **nova aferição** pode derrubar o bloqueio — ⛔ não a ação. */
  readonly resolvePor: string;
  /** ⚠️ De qual superfície vem a nova aferição. */
  readonly reavaliaEm: SuperficieId;
};

export const ACOES_DE_CORRECAO: readonly AcaoDeCorrecao[] = [
  {
    id: "tratamento_pressao",
    /** ⛔ ⛔ Sem fármaco: a ação é abstrata enquanto F-19 estiver parcial. */
    rotulo: "Tratamento anti-hipertensivo",
    bloqueio: "pressao_acima_da_meta",
    fonte: "F-04",
    verbo: "should have their SBP lowered to <185 mm Hg and diastolic blood pressure (DBP) <110 mm Hg before IVT therapy is initiated to reduce hemorrhagic complications",
    formulacao: "a fonte diz para baixar a pressão antes de iniciar a trombólise, para reduzir complicações hemorrágicas",
    resolvePor: "Uma nova aferição de pressão arterial",
    reavaliaEm: "estabilizacao",
  },
  {
    id: "correcao_glicemica",
    rotulo: "Correção glicêmica",
    bloqueio: "glicemia_alterada",
    fonte: "F-06",
    verbo: "hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications",
    formulacao: "a fonte diz que a hipoglicemia abaixo de 60 mg/dL deve ser tratada para evitar complicações",
    resolvePor: "Uma nova glicemia",
    reavaliaEm: "estabilizacao",
  },
];

/**
 * ⚠️ As **formas de prescrição proibidas** vivem na trava
 * (`scripts/prova-avc-superficie-e.cjs`): são critério de **medição**, e ⛔ não
 * conteúdo do app — escritas aqui, o varredor de PT cobraria tradução para
 * vocabulário que ⛔ nunca chega à tela. Mesma lição de D.
 */

/**
 * O CAMPO DA AÇÃO — ⚠️ **um só**, e ele é o estado.
 *
 * ⛔ E ⛔ não declara PA, ⛔ não declara glicemia, ⛔ não declara fármaco. O **tipo** da
 * ação é a instância; o que se registra é **em que pé ela está**.
 */
export const ACAO_E: readonly CampoE[] = [
  {
    id: "acao_estado",
    temporalidade: "estado",
    instanciaDe: ACAO,
    rotulo: "Situação da ação",
    tipo: "escolha",
    opcoes: OPCOES_ESTADO_DA_ACAO,
    /**
     * ⚠️ *"Disponível"* e *"Sugerida"* ⛔ não são resposta: são como a ação nasce.
     * ⛔ Oferecê-las como opção faria o médico **gravar** um estado que o app já
     * conhece sem ele.
     */
    ajuda: "Registre em que pé a ação está. Se ela já aconteceu antes desta tela, registre direto.",
    fonte: "F-04",
    bloqueiaTerapia: false,
    nota: "Registrar a ação não resolve o bloqueio. Quem resolve é uma nova aferição.",
  },
  {
    id: "acao_tipo",
    temporalidade: "estavel",
    instanciaDe: ACAO,
    rotulo: "Ação",
    tipo: "escolha",
    opcoes: ACOES_DE_CORRECAO.map((a) => a.rotulo),
    fonte: "F-04",
    bloqueiaTerapia: false,
  },
];

const GRUPOS_E_DECLARADOS: readonly GrupoDeclarado[] = [
  {
    id: "acoes",
    titulo: "Ações de correção",
    campos: ACAO_E,
    nota: "Esta tela registra ações. Ela não conclui que a pressão ou a glicemia foram corrigidas: isso é uma nova aferição em Entrada e estabilização.",
  },
];

export const GRUPOS_E: readonly Grupo[] = comCasa("correcoes", GRUPOS_E_DECLARADOS);
export const TODOS_OS_CAMPOS_E: readonly Campo[] = GRUPOS_E.flatMap((g) => [...g.campos]);
export const CAMPOS_NA_TELA_E: readonly Campo[] = GRUPOS_E.flatMap((g) => [...camposDoGrupo(g)]);

export const SUPERFICIE_E: SuperficieId = "correcoes";
