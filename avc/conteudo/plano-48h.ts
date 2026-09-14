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
 *  · AC-88: as transversais registram RESULTADO (aprovada · reprovada · não realizada · não
 *    sei); deglutição ≠ aprovada mantém "nada por via oral".
 */
import type { Campo } from "./campo";
import { comCasa } from "./campo";

const REGISTRO = { natureza: "administrativo", fonte: "administrativo", bloqueiaTerapia: false } as const;

/** ⚠️ AC-88: o resultado da tarefa é dado do médico; ⛔ como fazê-la segue pendente. */
export const RESULTADOS_DA_TAREFA = ["Aprovada", "Reprovada", "Não realizada", "Não sei"] as const;

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
      { id: "plano_degluticao", rotulo: "Triagem de deglutição — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_DA_TAREFA, ...REGISTRO },
      { id: "plano_mobilizacao", rotulo: "Mobilização — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_DA_TAREFA, ...REGISTRO },
      { id: "plano_tev", rotulo: "Prevenção de TEV — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_DA_TAREFA, ...REGISTRO },
      { id: "plano_dispositivos", rotulo: "Dispositivos — resultado", tipo: "escolha", temporalidade: "estado", opcoes: RESULTADOS_DA_TAREFA, ...REGISTRO },
      { id: "plano_hemorragia_revisada", rotulo: "Caminho da hemorragia revisado pela equipe", tipo: "escolha", temporalidade: "estado", opcoes: ["Revisado", "Não revisado"], ...REGISTRO },
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

export const MOTIVOS_DE_DESFECHO_NEGATIVO = [
  "Impedida",
  "Sem indicação",
  "Indisponível",
  "Recusada",
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
      { id: "ivt_nao_prosseguir_motivo", rotulo: "Trombólise: não prosseguir — motivo", tipo: "escolha", temporalidade: "estado", opcoes: MOTIVOS_DE_DESFECHO_NEGATIVO, ...REGISTRO },
      { id: "ivt_nao_prosseguir_hora", rotulo: "Trombólise: não prosseguir — horário", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
      { id: "evt_desfecho_motivo", rotulo: "Trombectomia: desfecho negativo — motivo", tipo: "escolha", temporalidade: "estado", opcoes: MOTIVOS_DE_DESFECHO_NEGATIVO, ...REGISTRO },
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
  hemorragia: "Hemorragia",
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
  criterioDeConclusao: "PA completa e exame neurológico (NIHSS ou Glasgow) registrados depois do evento; sem intervalo transcrito — a equipe define",
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
      rotulo: "Antiagregante ou anticoagulante: retido até a imagem de controle com laudo",
      criterioDeConclusao: "Laudo da imagem de controle registrado; a decisão de iniciar é da equipe e o app não a toma",
      conteudo: "fonte_transcrita",
      fonte: "F-15 · Table 7 · p. e358 · R5 (não transcrita)",
    },
  ],
  evt: [
    {
      id: "evt_monitorizacao",
      rotulo: "Monitorização pós-trombectomia",
      criterioDeConclusao: "Conteúdo pendente de validação: a fonte transcrita não publica tabela equivalente à Table 7",
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
      criterioDeConclusao: "Caminho da hemorragia registrado como revisado pela equipe",
      conteudo: "pendente_de_validacao",
      fonte: "Caminho hemorrágico · docs/avc/revisao/hemorragia.md",
    },
    { id: "hemorragia_reavaliacao", ...REAVALIACAO_SEM_INTERVALO, fonte: "AHA/ASA 2022 (HIC) § a localizar" },
    {
      id: "hemorragia_antitromboticos",
      rotulo: "Antiagregante ou anticoagulante: retido, o tempo não o libera",
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
  { id: "mobilizacao", rotulo: "Mobilização", criterioDeConclusao: "Resultado registrado: aprovada ou reprovada", conteudo: "pendente_de_validacao", fonte: "R6 · R4 (não transcritas) · AHA 2026 § a localizar" },
  { id: "tev", rotulo: "Prevenção de tromboembolismo venoso", criterioDeConclusao: "Resultado registrado: aprovada ou reprovada", conteudo: "pendente_de_validacao", fonte: "R6 · R5 (não transcritas) · AHA 2026 § a localizar" },
  { id: "dispositivos", rotulo: "Dispositivos (sondas e cateteres)", criterioDeConclusao: "Resultado registrado: aprovada ou reprovada", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 Table 7 (F-15)" },
];

/** ⚠️ O campo de resultado de cada tarefa que conclui por registro. */
export const CAMPO_DO_RESULTADO: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(TAREFA_DO_RESULTADO).map(([campo, tarefa]) => [tarefa, campo])
);
