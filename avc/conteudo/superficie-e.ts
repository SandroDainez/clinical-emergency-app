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
import { NAO_SEI, camposDoGrupo, comCasa } from "./campo";

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
/**
 * ── ⚠️⚠️⚠️ `interrompida` ≠ `cancelada` — **D2** do autor (commit 8a · 2026-09-12)
 *
 * > *"CANCELADA = a administração foi cancelada antes do início = ⛔ não houve
 * >  exposição. INTERROMPIDA = a administração começou ⛔ e foi suspensa antes
 * >  da conclusão = houve exposição. Interromper uma infusão ⛔ nunca pode fazer
 * >  o sistema concluir que o paciente ⛔ não recebeu trombolítico."*
 *
 * ⛔ ⛔ O DEFEITO (AVC-07): ⛔ o único estado registrável para *"parei a
 * infusão"* era `Cancelada`, ⛔ e ⛔ ele apagava a exposição — ⛔ a monitorização
 * da Table 7 sumia ⛔ exatamente na deterioração, ⛔ que é quando a própria
 * Table 7 manda *"discontinue the infusion"*. ⚠️ §3.7 da spec ⛔ já separava
 * *"⛔ não realizada, interrompida ⛔ ou revertida"*; ⛔ §2.3 as fundia ⛔ e foi
 * emendada junto com este commit.
 *
 * ⚠️ O vocabulário é **um só** no módulo (F importa daqui): ⛔ interromper um
 * anti-hipertensivo ⛔ também é interromper.
 */
export const ESTADO_DA_ACAO = {
  disponivel: "Disponível",
  sugerida: "Sugerida",
  indicada: "Indicada",
  decidida: "Decidida",
  prescrita: "Prescrita",
  preparada: "Preparada",
  iniciada: "Iniciada",
  concluida: "Administrada/concluída",
  /** ⚠️ AC-13: rótulo LEGADO — registros antigos continuam legíveis como administrada/concluída; não é mais oferecido. */
  realizada: "Realizada",
  interrompida: "Interrompida",
  cancelada: "Cancelada",
} as const;

/**
 * ── ⚠️⚠️⚠️ AC-13 · OS 8 ESTADOS DA AÇÃO (autor, 2026-09-14; `docs/decisoes.md`, 19ª rodada §8, opção B) ────────
 *
 * indicado · decidido · prescrito · preparado · iniciado · administrado/concluído · interrompido · cancelado.
 * ⚠️ Os rótulos gravados seguem o gênero de «ação» (Indicada … Cancelada), e os já gravados não mudam: «Iniciada»,
 * «Interrompida» e «Cancelada» são os mesmos; «Realizada» é lido como administrado/concluído.
 * «Não sei» não é um nono estado: é ausência de informação, lida à parte (`informacaoDoEstadoDaAcao`).
 * ⚠️ Exposição: iniciado, administrado/concluído e interrompido expõem; indicado, decidido, prescrito, preparado e
 * cancelado não expõem (interrompido ≠ cancelado, D2).
 */
export type EstadoDaAcaoRegistrado =
  | "indicado"
  | "decidido"
  | "prescrito"
  | "preparado"
  | "iniciado"
  | "administrado_concluido"
  | "interrompido"
  | "cancelado";

export const ESTADOS_DA_ACAO: readonly EstadoDaAcaoRegistrado[] = [
  "indicado", "decidido", "prescrito", "preparado", "iniciado", "administrado_concluido", "interrompido", "cancelado",
];

export const ROTULO_DO_ESTADO_DA_ACAO: Readonly<Record<EstadoDaAcaoRegistrado, string>> = {
  indicado: ESTADO_DA_ACAO.indicada,
  decidido: ESTADO_DA_ACAO.decidida,
  prescrito: ESTADO_DA_ACAO.prescrita,
  preparado: ESTADO_DA_ACAO.preparada,
  iniciado: ESTADO_DA_ACAO.iniciada,
  administrado_concluido: ESTADO_DA_ACAO.concluida,
  interrompido: ESTADO_DA_ACAO.interrompida,
  cancelado: ESTADO_DA_ACAO.cancelada,
};

/** ⚠️ Rótulos antigos que não são mais oferecidos — e não perdem o significado. */
const ROTULO_LEGADO_DO_ESTADO: Readonly<Record<string, EstadoDaAcaoRegistrado>> = {
  [ESTADO_DA_ACAO.realizada]: "administrado_concluido",
};

export const EXPOE_O_PACIENTE: Readonly<Record<EstadoDaAcaoRegistrado, boolean>> = {
  indicado: false,
  decidido: false,
  prescrito: false,
  preparado: false,
  iniciado: true,
  administrado_concluido: true,
  interrompido: true,
  cancelado: false,
};

/** ⚠️ Valor gravado → estado. ⛔ «não sei», não perguntado ⛔ qualquer outra coisa = `undefined`. */
export function estadoDaAcaoRegistrado(valor: unknown): EstadoDaAcaoRegistrado | undefined {
  if (typeof valor !== "string") return undefined;
  const atual = ESTADOS_DA_ACAO.find((e) => ROTULO_DO_ESTADO_DA_ACAO[e] === valor);
  return atual ?? ROTULO_LEGADO_DO_ESTADO[valor];
}

/** ⚠️ A informação sobre o estado — ⛔ o estado em si: «não sei» ⛔ não perguntado ficam FORA dos 8. */
export type InformacaoDoEstadoDaAcao =
  | { readonly tipo: "registrado"; readonly estado: EstadoDaAcaoRegistrado }
  | { readonly tipo: "nao_sei" }
  | { readonly tipo: "nao_perguntado" };

export function informacaoDoEstadoDaAcao(valor: unknown): InformacaoDoEstadoDaAcao {
  if (valor === "nao_sei") return { tipo: "nao_sei" };
  const estado = estadoDaAcaoRegistrado(valor);
  return estado === undefined ? { tipo: "nao_perguntado" } : { tipo: "registrado", estado };
}

export const OPCOES_ESTADO_DA_ACAO: readonly string[] = [...ESTADOS_DA_ACAO.map((e) => ROTULO_DO_ESTADO_DA_ACAO[e]), NAO_SEI];

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
  /** ⚠️ AC-13: ⛔ nenhum dos 8 estados resolve bloqueio — ⛔ quem resolve é a nova aferição. */
  ESTADO_DA_ACAO.indicada,
  ESTADO_DA_ACAO.decidida,
  ESTADO_DA_ACAO.prescrita,
  ESTADO_DA_ACAO.preparada,
  ESTADO_DA_ACAO.iniciada,
  ESTADO_DA_ACAO.concluida,
  ESTADO_DA_ACAO.realizada,
  /** ⚠️ Interrompida ⛔ também ⛔ não resolve: ⛔ a ação parou; ⛔ se funcionou, quem responde é a nova aferição. */
  ESTADO_DA_ACAO.interrompida,
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
  /**
   * ── ⚠️⚠️⚠️ ⛔ **⛔ ONDE** SE REGISTRA A NOVA AFERIÇÃO — 2026-09-09 ────────
   *
   * ⚠️ Relato do autor: *"cliquei em registrar ação ⛔ e ⛔ nem sei o que
   * aconteceu… ⛔ não me dá ⛔ onde tenho que registrar a nova aferição de
   * pressão"*.
   *
   * ⛔ ⛔ `resolvePor` ⛔ já dizia **⛔ o quê** (*"uma nova aferição de pressão
   * arterial"*) ⛔ e `reavaliaEm` ⛔ já dizia **⛔ em que tela**. ⚠️ ⛔ Faltava
   * ⛔ o **campo**, ⛔ que é ⛔ o que transforma a frase ⛔ num caminho.
   *
   * ⛔ ⛔ Dizer o que falta ⛔ sem dizer ⛔ onde ⛔ é a definição de **muro**,
   * ⛔ e **E-26** ⛔ existe ⛔ contra ⛔ isso.
   */
  readonly campoDaReavaliacao: string;
};

export const ACOES_DE_CORRECAO: readonly AcaoDeCorrecao[] = [
  {
    id: "tratamento_pressao",
    /** ⛔ ⛔ Sem fármaco: a ação é abstrata enquanto F-19 estiver parcial. */
    rotulo: "Tratamento anti-hipertensivo",
    bloqueio: "pressao_acima_da_meta",
    fonte: "F-04",
    verbo: "should have their SBP lowered to <185 mm Hg and diastolic blood pressure (DBP) <110 mm Hg before IVT therapy is initiated to reduce hemorrhagic complications",
    /**
     * ── ⚠️⚠️⚠️ ⛔ *"RECOMENDAÇÃO"*, ⛔ E ⛔ NÃO *"A FONTE DIZ"* — 2026-09-09 ──
     *
     * ⚠️ Pedido do autor: *"isso poderia ser escrito de outra forma, por
     * exemplo ⛔ a recomendação é controlar a PA"*.
     *
     * ⛔ ⛔ *"A fonte diz para baixar…"* ⛔ é **discurso indireto**: ⛔ ele
     * conta ⛔ que alguém recomendou, ⛔ em vez de recomendar. ⚠️ ⛔ Num
     * cartão âmbar ⛔ que existe ⛔ para o médico **⛔ agir**, ⛔ isso custa
     * uma leitura inteira.
     *
     * ⚠️⚠️ ⛔ E a **procedência ⛔ não se perde ⛔ com a mudança**: ⛔ o
     * `verbo` verbatim aparece ⛔ logo abaixo, ⛔ entre aspas, ⛔ e o slot
     * (**{fonte}**) ⛔ está declarado ⛔ no mesmo objeto. ⛔ Atribuir ⛔ é
     * papel da **fonte citada**, ⛔ e ⛔ não de um prefixo tímido.
     */
    formulacao: "Recomendação: controlar a pressão arterial antes de iniciar a trombólise, para reduzir complicações hemorrágicas",
    resolvePor: "Uma nova aferição de pressão arterial",
    reavaliaEm: "estabilizacao",
    campoDaReavaliacao: "pas",
  },
  {
    id: "correcao_glicemica",
    rotulo: "Correção glicêmica",
    bloqueio: "glicemia_alterada",
    fonte: "F-06",
    verbo: "hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications",
    formulacao: "Recomendação: tratar a hipoglicemia abaixo de 60 mg/dL, para evitar complicações",
    resolvePor: "Uma nova glicemia",
    reavaliaEm: "estabilizacao",
    campoDaReavaliacao: "glicemia",
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
