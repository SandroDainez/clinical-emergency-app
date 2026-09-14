/**
 * PLANO ATÉ 48 H — ESTRUTURA (T08, C08; autor, 2026-09-13, 14ª rodada).
 *
 * ⚠️ ESTRUTURA, ⛔ CONTEÚDO CLÍNICO. ⛔ Nenhum intervalo, dose, limiar ⛔ ou contraindicação
 * nasce aqui: onde a fonte transcrita traz o dado, a tarefa aponta o slot; onde ⛔ traz, a
 * tarefa é "conteúdo pendente de validação" com as fontes listadas em
 * `docs/avc/revisao/plano-48h.md`.
 *
 * ⚠️ Cada tarefa declara evento de origem, prazo ⛔ ou condição, ⛔ e critério real de conclusão
 * (um fato registrado — ⛔ nunca a passagem do tempo).
 *
 * ⚠️ Registros novos: dois eventos que o app ⛔ tinha (fim da trombectomia; decisão de ⛔
 * reperfundir, com horário) ⛔ e os registros que concluem as transversais. Registro da equipe
 * (`administrativo`), ⛔ nenhum portão ⛔ ou veredito.
 */
import type { Campo } from "./campo";
import { comCasa } from "./campo";

const REGISTRO = { natureza: "administrativo", fonte: "administrativo", bloqueiaTerapia: false } as const;

export const GRUPO_DO_PLANO_48H = comCasa("destino", [
  {
    id: "plano-48h-eventos",
    titulo: "Eventos que abrem o plano",
    nota: "Horário do evento registrado pela equipe. Sem evento registrado, nenhum caminho é aberto.",
    campos: [
      { id: "evt_fim", rotulo: "Fim da trombectomia", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
      { id: "nao_reperfundir_hora", rotulo: "Decisão de não reperfundir", tipo: "hora", temporalidade: "estavel", aceitaDesconhecido: true, ...REGISTRO },
    ],
  },
  {
    id: "plano-48h-registros",
    titulo: "Registros das tarefas",
    nota: "Registro do que a equipe fez. O conteúdo de cada tarefa está pendente de validação.",
    campos: [
      { id: "plano_degluticao", rotulo: "Triagem de deglutição", tipo: "escolha", temporalidade: "estado", opcoes: ["Realizada", "Não realizada"], ...REGISTRO },
      { id: "plano_mobilizacao", rotulo: "Mobilização avaliada pela equipe", tipo: "escolha", temporalidade: "estado", opcoes: ["Avaliada", "Não avaliada"], ...REGISTRO },
      { id: "plano_tev", rotulo: "Prevenção de TEV avaliada pela equipe", tipo: "escolha", temporalidade: "estado", opcoes: ["Avaliada", "Não avaliada"], ...REGISTRO },
      { id: "plano_dispositivos", rotulo: "Dispositivos revisados pela equipe", tipo: "escolha", temporalidade: "estado", opcoes: ["Revisados", "Não revisados"], ...REGISTRO },
      { id: "plano_hemorragia_revisada", rotulo: "Caminho da hemorragia revisado pela equipe", tipo: "escolha", temporalidade: "estado", opcoes: ["Revisado", "Não revisado"], ...REGISTRO },
    ],
  },
]);

export const CAMPOS_DO_PLANO_48H: readonly Campo[] = GRUPO_DO_PLANO_48H.flatMap((g) => g.campos);

export type CaminhoDoPlanoId = "ivt" | "evt" | "sem_reperfusao" | "hemorragia";

export const EVENTO_DE_ORIGEM: Readonly<Record<CaminhoDoPlanoId, string>> = {
  ivt: "Início da trombólise",
  evt: "Fim da trombectomia",
  sem_reperfusao: "Decisão de não reperfundir",
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
      criterioDeConclusao: "PA completa registrada depois da decisão de não reperfundir",
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
      conteudo: "fonte_transcrita",
      fonte: "Superfície hemorrágica · AHA/ASA 2022 (HIC) · AHA/ASA 2023 (HSA)",
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
    criterioDeConclusao: "Triagem de deglutição registrada como realizada; até lá, via oral retida",
    conteudo: "pendente_de_validacao",
    fonte: "R6 · R4 (não transcritas) · AHA 2026 § a localizar",
  },
  { id: "glicemia", rotulo: "Glicemia", criterioDeConclusao: "Glicemia registrada depois do evento de origem", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 §4.5 (F-06)" },
  { id: "temperatura", rotulo: "Temperatura", criterioDeConclusao: "Temperatura registrada depois do evento de origem", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 §4.4 (F-38)" },
  { id: "mobilizacao", rotulo: "Mobilização", criterioDeConclusao: "Mobilização registrada como avaliada pela equipe", conteudo: "pendente_de_validacao", fonte: "R6 · R4 (não transcritas) · AHA 2026 § a localizar" },
  { id: "tev", rotulo: "Prevenção de tromboembolismo venoso", criterioDeConclusao: "Prevenção de TEV registrada como avaliada pela equipe", conteudo: "pendente_de_validacao", fonte: "R6 · R5 (não transcritas) · AHA 2026 § a localizar" },
  { id: "dispositivos", rotulo: "Dispositivos (sondas e cateteres)", criterioDeConclusao: "Dispositivos registrados como revisados pela equipe", conteudo: "pendente_de_validacao", fonte: "R6 (não transcrita) · AHA 2026 Table 7 (F-15)" },
];

/** ⚠️ O registro que conclui cada transversal por escolha — ⛔ a resposta "não" conclui. */
export const CONCLUSAO_POR_REGISTRO: Readonly<Record<string, { readonly campo: string; readonly opcao: string }>> = {
  degluticao: { campo: "plano_degluticao", opcao: "Realizada" },
  mobilizacao: { campo: "plano_mobilizacao", opcao: "Avaliada" },
  tev: { campo: "plano_tev", opcao: "Avaliada" },
  dispositivos: { campo: "plano_dispositivos", opcao: "Revisados" },
  hemorragia_caminho_proprio: { campo: "plano_hemorragia_revisada", opcao: "Revisado" },
};
