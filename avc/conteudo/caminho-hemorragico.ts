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

/**
 * ⚠️ AC-95 (16ª rodada): as condutas ⛔ declaram estado nem fonte próprios — o caminho consome os itens do
 * catálogo HIC/HSA pela validação única (`validacao-do-catalogo.ts`). ⛔ Nenhuma conduta com dois estados.
 */
export type CondutaDoCaminhoHemorragico = {
  readonly id: "reversao_anticoagulante" | "alvo_pressorico" | "indicacao_cirurgica";
  readonly rotulo: string;
};

export const CONDUTAS_DO_CAMINHO_HEMORRAGICO: readonly CondutaDoCaminhoHemorragico[] = [
  { id: "reversao_anticoagulante", rotulo: "Reversão de anticoagulante" },
  { id: "alvo_pressorico", rotulo: "Alvo pressórico" },
  { id: "indicacao_cirurgica", rotulo: "Indicação neurocirúrgica" },
];
