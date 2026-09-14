/**
 * CAMINHO HEMORRÁGICO — ESTRUTURA (A07, RQ-HEM-01..05; autor, 2026-09-13, 15ª rodada).
 *
 * ⚠️ ESTRUTURA, ⛔ CONTEÚDO. A saída "hemorragia" da imagem abre um caminho próprio com
 * superfícies reduzidas ⛔ e bloqueia a reperfusão isquêmica com motivo. ⚠️ Campos de ESTADO
 * apenas: tipo, anticoagulante em uso (o campo do Paciente, ⛔ um novo) ⛔ e marcos da
 * neurocirurgia. ⛔ Toda conduta (reversão, alvo pressórico, indicação cirúrgica) é
 * "conteúdo pendente de validação", com a fonte candidata em `docs/avc/revisao/hemorragia.md`.
 */
import type { Campo } from "./campo";
import { comCasa } from "./campo";

const REGISTRO = { natureza: "administrativo", fonte: "administrativo", bloqueiaTerapia: false } as const;

export const TIPOS_DE_HEMORRAGIA = ["Intraparenquimatosa", "Subaracnóidea", "Subdural", "Outra", "Não sei"] as const;

/** ⚠️ As superfícies do caminho, na ordem da barra. */
export const SUPERFICIES_DO_CAMINHO_HEMORRAGICO = ["estabilizacao", "neurologico", "imagem", "destino"] as const;

/** ⚠️ Marcos da neurocirurgia pelo modelo da teleconsulta (AC-72). */
export const ESTADOS_DA_NEUROCIRURGIA = ["Contatada", "Em avaliação", "Parecer registrado", "Não disponível"] as const;

export const GRUPO_DO_CAMINHO_HEMORRAGICO = comCasa("destino", [
  {
    id: "caminho-hemorragico",
    titulo: "Caminho hemorrágico",
    nota: "Registro de estado pela equipe. Toda conduta está pendente de validação.",
    campos: [
      { id: "hem_tipo", rotulo: "Tipo de hemorragia", tipo: "escolha", temporalidade: "estavel", opcoes: TIPOS_DE_HEMORRAGIA, ...REGISTRO },
      { id: "neuro_marco", rotulo: "Neurocirurgia", tipo: "escolha", temporalidade: "estado", opcoes: ESTADOS_DA_NEUROCIRURGIA, ...REGISTRO },
      { id: "neuro_parecer", rotulo: "Parecer da neurocirurgia", tipo: "texto", temporalidade: "estavel", ...REGISTRO },
      { id: "neuro_parecer_autor", rotulo: "Autor do parecer da neurocirurgia", tipo: "texto", temporalidade: "estavel", ...REGISTRO },
    ],
  },
]);

export const CAMPOS_DO_CAMINHO_HEMORRAGICO: readonly Campo[] = GRUPO_DO_CAMINHO_HEMORRAGICO.flatMap((g) => g.campos);

export type CondutaPendente = {
  readonly id: string;
  readonly rotulo: string;
  readonly conteudo: "pendente_de_validacao";
  readonly fontesCandidatas: readonly string[];
};

export const CONDUTAS_DO_CAMINHO_HEMORRAGICO: readonly CondutaPendente[] = [
  {
    id: "reversao_anticoagulante",
    rotulo: "Reversão de anticoagulante",
    conteudo: "pendente_de_validacao",
    fontesCandidatas: ["AHA/ASA 2022 (HIC) · §5.2.1 · slot H-02", "AHA/ASA 2023 (HSA) · §6 · slot S-01", "AHA/ASA 2017 (hemorragia pós-alteplase) · §3.3 a §3.5"],
  },
  {
    id: "alvo_pressorico",
    rotulo: "Alvo pressórico",
    conteudo: "pendente_de_validacao",
    fontesCandidatas: ["AHA/ASA 2022 (HIC) · §5.1 · slot H-01", "AHA/ASA 2023 (HSA) · §6 · slot S-01", "AHA/ASA 2017 (hemorragia pós-alteplase) · §3.6"],
  },
  {
    id: "indicacao_cirurgica",
    rotulo: "Indicação neurocirúrgica",
    conteudo: "pendente_de_validacao",
    fontesCandidatas: ["AHA/ASA 2022 (HIC) · §6.1 e §6.2 · slots H-10, H-11, H-12", "AHA/ASA 2023 (HSA) · §7 · slot S-02", "AHA/ASA 2017 (hemorragia pós-alteplase) · §3.7"],
  },
];
