/**
 * Nitroglicerina na SCA — dose, em fonte única.
 *
 * ⚠️ REESCRITO (2026-08-25, correção pré-congelamento) — a versão anterior
 * reaproveitava os números do EAP (SL 0,4 mg com pré-requisito PAS > 110;
 * IV 10–20 mcg/min com teto de 200 mcg/min). O autor corrigiu: para a SCA
 * o alinhamento é com a **ACC/AHA 2025**, e os dois pontos que mudaram são
 * de conteúdo, não de redação:
 *
 *   1. SL é **0,3–0,4 mg** (não 0,4 fixo), e o pré-requisito é
 *      **PAS ≥ 90 mmHg em paciente hemodinamicamente estável** — não o
 *      PAS > 110 que vinha do EAP.
 *   2. O **teto de 200 mcg/min FOI RETIRADO**: aquele número vinha do EAP e
 *      atribuí-lo à ACC/AHA 2025 seria dar procedência de guideline a um
 *      valor que a guideline não fixa. A titulação IV é declarada como a
 *      fonte a declara — **por sintomas e tolerância hemodinâmica** —, sem
 *      número de teto inventado.
 *
 * ⚠️ POR QUE NÃO É PONTEIRO (mesmo princípio de `nitrato-contraindicacoes.
 * ts`, R-33): quem prescreve avisa a dose na própria tela — não manda o
 * médico abrir outro módulo para descobrir o número.
 *
 * ⚠️ ESTE ARQUIVO É DA SCA. O EAP mantém os próprios números em
 * `eap-decision-tree.ts` (incluindo o teto de 200 mcg/min, que lá tem a
 * fonte daquele módulo). Números iguais entre módulos só quando a fonte for
 * a mesma — foi exatamente a confusão que esta correção desfez.
 */

export const NITRATO_DOSE_SL =
  "NITROGLICERINA SUBLINGUAL — 0,3–0,4 mg SL a cada 5 min, até 3 doses. Só em paciente hemodinamicamente estável e com PAS ≥ 90 mmHg (reavaliar a PA antes de cada dose).";

export const NITRATO_DOSE_IV =
  "NITROGLICERINA IV — iniciar a 10 mcg/min e titular conforme os sintomas e a tolerância hemodinâmica. ⚠️ Este app não fixa dose máxima: a ACC/AHA 2025 não estabelece um teto numérico, e inventar um seria atribuir à diretriz o que ela não diz.";

export const NITRATO_MONITORIZACAO =
  "Monitorização: PA a cada ajuste de dose e continuamente durante a infusão IV — a queda pode ser abrupta. Interromper/reduzir se a PAS cair abaixo de 90 mmHg ou mais de 30 mmHg do basal; reavaliar a dor a cada ajuste.";

/**
 * ⚠️ OS TRÊS ALERTAS QUE A ACC/AHA 2025 NOMEIA JUNTO DO NITRATO — e por que
 * ficam aqui, e não só em `nitrato-contraindicacoes.ts`: aquele arquivo é
 * compartilhado com o EAP e traz a janela de PDE-5 e as contraindicações
 * gerais; este item é o recorte que a fonte da SCA associa diretamente à
 * prescrição, incluindo o critério de queda relativa (> 30 mmHg do basal),
 * que não existia em nenhum dos dois arquivos antes desta correção.
 */
export const NITRATO_ALERTAS_SCA =
  "⛔ NÃO USAR nitrato se: suspeita de IAM de ventrículo direito; PAS < 90 mmHg OU queda > 30 mmHg em relação ao basal; uso recente de inibidor de PDE-5 (ver janela abaixo).";
