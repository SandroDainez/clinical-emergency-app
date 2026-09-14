/**
 * PLANO ATÉ 48 H — ESTRUTURA (T08, C08; autor, 2026-09-13, 14ª ⛔ 15ª rodadas).
 *
 * ⚠️ ESTRUTURA, ⛔ CONTEÚDO CLÍNICO. ⛔ Nenhum intervalo, dose, limiar ⛔ ou contraindicação
 * nasce aqui: onde a fonte transcrita traz o dado, a tarefa aponta o slot; onde ⛔ traz, a
 * tarefa é "conteúdo pendente de validação" com as fontes listadas em
 * `docs/avc/revisao/plano-48h.md`.
 *
 * ⚠️ Cada tarefa declara evento de origem, prazo ⛔ ou condição, ⛔ e critério real de conclusão
 * (um fato registrado — ⛔ nunca a passagem do tempo).
 *
 * ⚠️ 15ª rodada:
 *  · AC-85: o evento avulso "Decisão de não reperfundir" saiu. O caminho sem reperfusão abre
 *    com desfecho negativo de IVT (motivo + horário) ⛔ de EVT (motivo + horário).
 *  · AC-88: as transversais registram RESULTADO; deglutição ≠ aprovada mantém "nada por via oral".
 *  · AC-106 (17ª rodada): o vocabulário do resultado é de cada transversal (`RESULTADOS_POR_TAREFA`).
 */
import type { Campo } from "./campo";
import { comCasa } from "./campo";

const REGISTRO = { natureza: "administrativo", fonte: "administrativo", bloqueiaTerapia: false } as const;

/**
 * ⚠️ AC-88: o resultado da tarefa é dado do médico; ⛔ como fazê-la segue pendente.
 * ⚠️ AC-106 (17ª rodada, autor): UM VOCABULÁRIO POR TRANSVERSAL — ⛔ nenhuma herda o da deglutição.
 * "Aprovada/Reprovada" em mobilização era registro sem significado, ⛔ e a trava de via oral depende de
 * "reprovada" significar algo. Deglutição ⛔ mobilização: redação do autor. TEV ⛔ dispositivos: proposta do
 * agente, registrada em `docs/avc/revisao/plano-48h.md`, pendente de validação.
 */
export const RESULTADOS_POR_TAREFA = {
  degluticao: ["Aprovada", "Reprovada", "Não realizada", "Não sei"],
  mobilizacao: ["Realizada", "Não realizada", "Contraindicada no momento", "Não sei"],
  tev: ["Iniciada", "Não iniciada", "Contraindicada no momento", "Não sei"],
  dispositivos: ["Revisados", "Não revisados", "Não sei"],
} as const satisfies Readonly<Record<string, readonly string[]>>;

/** ⚠️ O resultado que conclui cada tarefa; "Contraindicada no momento" retém (⛔ conclui); o resto fica pendente. */
export const CONCLUI_COM: Readonly<Record<keyof typeof RESULTADOS_POR_TAREFA, string>> = {
  degluticao: "Aprovada",
  mobilizacao: "Realizada",
  tev: "Iniciada",
  dispositivos: "Revisados",
};
export const RETEM_COM: readonly string[] = ["Contraindicada no momento"];

export const GRUPO_DO_PLANO_48H = comCasa("destino", [
  {
    id: "plano-48h-eventos",
    titulo: "Eventos que abrem o plano",
    nota: "Horário do evento registrado pela equipe. Sem evento registrado, nenhum caminho é aberto.",
    campos: [
      { id: "evt_fim", rotulo: "Fim da trombectomia", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
    ],
  },
  {
    id: "plano-48h-registros",
    titulo: "Resultados das tarefas",
    nota: "Resultado registrado pela equipe. O conteúdo de cada tarefa está pendente de validação.",
    campos: [
      { id: "plano_degluticao", rotulo: "Triagem de deglutição — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_POR_TAREFA.degluticao, ...REGISTRO },
      { id: "plano_mobilizacao", rotulo: "Mobilização — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_POR_TAREFA.mobilizacao, ...REGISTRO },
      { id: "plano_tev", rotulo: "Prevenção de TEV — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_POR_TAREFA.tev, ...REGISTRO },
      { id: "plano_dispositivos", rotulo: "Dispositivos — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_POR_TAREFA.dispositivos, ...REGISTRO },
      /** ⚠️ AC-111 (17ª rodada): é DECLARAÇÃO da equipe — ⛔ o app confere o conteúdo revisado. */
      { id: "plano_hemorragia_revisada", rotulo: "Declaração da equipe: a equipe declara ter revisado o caminho da hemorragia", tipo: "escolha", temporalidade: "estado", opcoes: ["Revisado", "Não revisado"], ...REGISTRO },
    ],
  },
]);

export const CAMPOS_DE_EVENTO_DO_PLANO: readonly Campo[] = GRUPO_DO_PLANO_48H[0].campos;
export const CAMPOS_DE_RESULTADO_DO_PLANO: readonly Campo[] = GRUPO_DO_PLANO_48H[1].campos;
export const CAMPOS_DO_PLANO_48H: readonly Campo[] = GRUPO_DO_PLANO_48H.flatMap((g) => g.campos);

/** ⚠️ A tarefa que cada campo de resultado conclui. */
export const TAREFA_DO_RESULTADO: Readonly<Record<string, string>> = {
  plano_degluticao: "degluticao",
  plano_mobilizacao: "mobilizacao",
  plano_tev: "tev",
  plano_dispositivos: "dispositivos",
  plano_hemorragia_revisada: "hemorragia_caminho_proprio",
};

/* ── AC-85 · desfecho negativo da reperfusão ─────────────────────────────── */

/**
 * ⚠️ AC-109 (17ª rodada, autor): motivos POR TERAPIA. A trombólise se faz na própria casa: "Indisponível" ⛔
 * "Centro de referência recusou" são motivos de trombectomia/transferência.
 */
export const MOTIVOS_DE_NAO_PROSSEGUIR_IVT = [
  "Impedida",
  "Sem indicação",
  "Decisão da equipe / limitação terapêutica",
  "Recusa do paciente ou família",
] as const;

export const MOTIVOS_DE_DESFECHO_NEGATIVO_EVT = [
  "Impedida",
  "Sem indicação",
  "Indisponível",
  /** ⚠️ AC-98 (16ª rodada): ⛔ "Recusada", que se confundia com a recusa do paciente. */
  "Centro de referência recusou",
  "Decisão da equipe / limitação terapêutica",
  "Recusa do paciente ou família",
] as const;

/** ⚠️ Os motivos que registram, com um gesto, a decisão global nos dois desfechos. */
export const MOTIVOS_DA_DECISAO_GLOBAL = ["Decisão da equipe / limitação terapêutica", "Recusa do paciente ou família"] as const;

export const GRUPO_DE_DESFECHO_NEGATIVO = comCasa("reperfusao", [
  {
    id: "desfecho-negativo",
    titulo: "Desfecho negativo da reperfusão",
    nota: "Registro da equipe: motivo e horário de cada terapia. O caminho sem reperfusão abre só com os dois registrados.",
    campos: [
      { id: "ivt_nao_prosseguir_motivo", rotulo: "Trombólise: não prosseguir — motivo", tipo: "escolha", temporalidade: "estado", opcoes: MOTIVOS_DE_NAO_PROSSEGUIR_IVT, ...REGISTRO },
      { id: "ivt_nao_prosseguir_hora", rotulo: "Trombólise: não prosseguir — horário", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
      { id: "evt_desfecho_motivo", rotulo: "Trombectomia: desfecho negativo — motivo", tipo: "escolha", temporalidade: "estado", opcoes: MOTIVOS_DE_DESFECHO_NEGATIVO_EVT, ...REGISTRO },
      { id: "evt_desfecho_hora", rotulo: "Trombectomia: desfecho negativo — horário", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
    ],
  },
]);

export const CAMPOS_DE_DESFECHO: readonly Campo[] = GRUPO_DE_DESFECHO_NEGATIVO.flatMap((g) => g.campos);

/* ── caminhos ⛔ tarefas ──────────────────────────────────────────────────── */

export type CaminhoDoPlanoId = "ivt" | "evt" | "sem_reperfusao" | "hemorragia";

export const EVENTO_DE_ORIGEM: Readonly<Record<CaminhoDoPlanoId, string>> = {
  ivt: "Início da trombólise",
  evt: "Fim da trombectomia",
  sem_reperfusao: "Desfechos negativos de trombólise e trombectomia",
  hemorragia: "Hemorragia confirmada em imagem",
};

export const TITULO_DO_CAMINHO: Readonly<Record<CaminhoDoPlanoId, string>> = {
  ivt: "Depois da trombólise",
  evt: "Depois da trombectomia",
  sem_reperfusao: "Sem reperfusão",
  /** ⚠️ AC-110 (17ª rodada): um nome só para o caminho. */
  hemorragia: "Hemorragia intracraniana (HIC)",
};

export type ConteudoDaTarefa = "fonte_transcrita" | "pendente_de_validacao";

export type DefinicaoDeTarefa = {
  readonly id: string;
  readonly rotulo: string;
  readonly criterioDeConclusao: string;
  readonly conteudo: ConteudoDaTarefa;
  readonly fonte: string;
};

const REAVALIACAO_SEM_INTERVALO = {
  rotulo: "Reavaliação: pressão arterial e exame neurológico",
  criterioDeConclusao: "PA completa e exame neurológico (NIHSS ou Glasgow) registrados depois do evento; sem intervalo definido na fonte — a equipe define",
  conteudo: "pendente_de_validacao",
} as const;

export const TAREFAS_DO_CAMINHO: Readonly<Record<CaminhoDoPlanoId, readonly DefinicaoDeTarefa[]>> = {
  ivt: [
    {
      id: "ivt_reavaliacao",
      rotulo: "Reavaliação: pressão arterial e exame neurológico",
      criterioDeConclusao: "PA completa e exame neurológico (NIHSS ou Glasgow) registrados depois do horário previsto",
      conteudo: "fonte_transcrita",
      fonte: "F-15 · Table 7 · p. e358",
    },
    {
      id: "ivt_imagem_controle",
      rotulo: "Imagem de controle (TC ou RM)",
      criterioDeConclusao: "Estudo com horário depois do início da trombólise e laudo registrado",
      conteudo: "fonte_transcrita",
      fonte: "F-15 · Table 7 · p. e358",
    },
    {
      id: "ivt_antitromboticos",
      /** ⚠️ 16ª rodada: concordância com o estado da tarefa ("retida"). */
      rotulo: "Terapia antitrombótica: retida até a imagem de controle com laudo",
      criterioDeConclusao: "Laudo da imagem de controle registrado; a decisão de iniciar é da equipe e o app não a toma",
      conteudo: "fonte_transcrita",
      fonte: "F-15 · Table 7 · p. e358 · R5 (não transcrita)",
    },
  ],
  evt: [
    {
      id: "evt_monitorizacao",
      rotulo: "Monitorização pós-trombectomia",
      criterioDeConclusao: "Conteúdo pendente de validação: a fonte não publica tabela equivalente à Table 7",
      conteudo: "pendente_de_validacao",
      fonte: "F-15 · lacuna da fonte",
    },
    { id: "evt_reavaliacao", ...REAVALIACAO_SEM_INTERVALO, fonte: "R4 (não transcrita) · AHA 2026 § a localizar" },
    {
      id: "evt_antitromboticos",
      rotulo: "Terapia antitrombótica: retida, o tempo não a libera",
      criterioDeConclusao: "Decisão da equipe com imagem e avaliação registradas; conteúdo pendente de validação",
      conteudo: "pendente_de_validacao",
      fonte: "R5 (não transcrita)",
    },
  ],
  sem_reperfusao: [
    { id: "sem_reperfusao_reavaliacao", ...REAVALIACAO_SEM_INTERVALO, fonte: "R4 (não transcrita) · AHA 2026 § a localizar" },
    {
      id: "sem_reperfusao_pressao",
      rotulo: "Conduta pressórica sem reperfusão",
      criterioDeConclusao: "PA completa registrada depois dos desfechos negativos",
      conteudo: "fonte_transcrita",
      fonte: "F-05",
    },
    {
      id: "sem_reperfusao_antitromboticos",
      rotulo: "Terapia antitrombótica: retida, o tempo não a libera",
      criterioDeConclusao: "Decisão da equipe; conteúdo pendente de validação",
      conteudo: "pendente_de_validacao",
      fonte: "R5 (não transcrita)",
    },
  ],
  hemorragia: [
    {
      id: "hemorragia_caminho_proprio",
      rotulo: "Reversão, alvo pressórico e indicação neurocirúrgica: caminho próprio da hemorragia",
      criterioDeConclusao: "Declaração da equipe registrada (revisado); o app não confere o conteúdo revisado",
      conteudo: "pendente_de_validacao",
      fonte: "Caminho hemorrágico · docs/avc/revisao/hemorragia.md",
    },
    { id: "hemorragia_reavaliacao", ...REAVALIACAO_SEM_INTERVALO, fonte: "AHA/ASA 2022 (HIC) § a localizar" },
    {
      id: "hemorragia_antitromboticos",
      rotulo: "Terapia antitrombótica: retida, o tempo não a libera",
      criterioDeConclusao: "Decisão da equipe; conteúdo pendente de validação",
      conteudo: "pendente_de_validacao",
      fonte: "R5 (não transcrita)",
    },
  ],
};

export const TAREFAS_TRANSVERSAIS: readonly DefinicaoDeTarefa[] = [
  {
    id: "degluticao",
    rotulo: "Triagem de deglutição antes de via oral",
    criterioDeConclusao: "Resultado aprovada registrado; reprovada, não realizada ou não sei mantêm nada por via oral",
    conteudo: "pendente_de_validacao",
    fonte: "R6 · R4 (não transcritas) · AHA 2026 § a localizar",
  },
  { id: "glicemia", rotulo: "Glicemia", criterioDeConclusao: "Glicemia registrada depois do evento de origem", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 §4.5 (F-06)" },
  { id: "temperatura", rotulo: "Temperatura", criterioDeConclusao: "Temperatura registrada depois do evento de origem", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 §4.4 (F-38)" },
  { id: "mobilizacao", rotulo: "Mobilização", criterioDeConclusao: "Realizada conclui; contraindicada no momento retém; não realizada ou não sei mantêm pendente", conteudo: "pendente_de_validacao", fonte: "R6 · R4 (não transcritas) · AHA 2026 § a localizar" },
  { id: "tev", rotulo: "Prevenção de tromboembolismo venoso", criterioDeConclusao: "Iniciada conclui; contraindicada no momento retém; não iniciada ou não sei mantêm pendente", conteudo: "pendente_de_validacao", fonte: "R6 · R5 (não transcritas) · AHA 2026 § a localizar" },
  { id: "dispositivos", rotulo: "Dispositivos (sondas e cateteres)", criterioDeConclusao: "Revisados conclui; não revisados ou não sei mantêm pendente", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 Table 7 (F-15)" },
];

/** ⚠️ O campo de resultado de cada tarefa que conclui por registro. */
export const CAMPO_DO_RESULTADO: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(TAREFA_DO_RESULTADO).map(([campo, tarefa]) => [tarefa, campo])
);
