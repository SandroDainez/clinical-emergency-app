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

/**
 * ── SUBLINGUAL, NA ORDEM EM QUE O BRASIL PRESCREVE (2026-08-25) ────────────
 *
 * ⚠️ A NITROGLICERINA SL NÃO PODE SER A ÚNICA OPÇÃO (decisão do autor): ela é
 * o que a ACC/AHA 2025 nomeia, mas não é o que está disponível na maior parte
 * dos serviços brasileiros. Um app que só oferece o que não existe na gaveta
 * manda o médico procurar outra fonte no meio do atendimento.
 *
 * ⚠️ E AS DUAS PROCEDÊNCIAS SÃO DIFERENTES — por isso são constantes
 * separadas, cada uma dizendo de onde vem. Atribuir o dinitrato à ACC/AHA 2025
 * seria dar à guideline americana uma recomendação que ela não faz; a fonte do
 * dinitrato é a diretriz brasileira de SCA, que traz dinitrato 5 mg SL,
 * mononitrato 5 mg SL ou nitroglicerina 0,4 mg SL, até 3 doses separadas por
 * 5 minutos.
 */
export const NITRATO_DOSE_SL =
  "DINITRATO DE ISOSSORBIDA 5 mg SL — repetir a cada 5 min se necessário, até 3 doses. Só em paciente hemodinamicamente estável e com PAS ≥ 90 mmHg (reavaliar a PA antes de cada dose). Fonte: diretriz brasileira de SCA.";

export const NITRATO_DOSE_SL_ALTERNATIVA =
  "Alternativa, se disponível: NITROGLICERINA 0,3 ou 0,4 mg SL — repetir a cada 5 min se necessário, até 3 doses (ACC/AHA 2025).";

/**
 * ── INTRAVENOSA — E POR QUE ESTE CARD NÃO CALCULA NADA ─────────────────────
 *
 * ⚠️ A CONTA JÁ EXISTE, E DUPLICÁ-LA SERIA O DEFEITO. `vasoactive-engine.ts`
 * traz a nitroglicerina com apresentação real (Tridil 5 mg/mL, bula ANVISA),
 * soluções padrão de 100 e 200 mcg/mL e o cálculo de mL/h. Escrever aqui uma
 * tabela de mL/h criaria uma segunda verdade sobre a mesma droga — e duas
 * verdades divergem no primeiro ajuste, que é exatamente o que
 * `test:lib-consumida` existe para impedir.
 *
 * ⚠️ MAS O NÚMERO INICIAL É DAQUI, E É ESPECÍFICO DA SCA (decisão do autor,
 * 2026-08-25): a ACC/AHA 2025 diz "start at 10 mcg/min" para síndrome
 * coronariana. A calculadora geral mostra a faixa operacional 5–10 mcg/min,
 * sustentada pela fonte dela; o card da SCA não pode contradizer a guideline
 * específica, então ele declara 10 e manda calcular o resto na calculadora.
 *
 * Sem teto numérico: a ACC/AHA 2025 não fixa um, e inventá-lo seria atribuir à
 * diretriz o que ela não diz. O limite prático de titulação vive na
 * calculadora, com a fonte dela.
 */
export const NITRATO_DOSE_IV =
  "NITROGLICERINA IV — iniciar a 10 mcg/min e titular conforme os sintomas e a tolerância hemodinâmica (ACC/AHA 2025). ⚠️ NÃO administrar IV direto: diluir e infundir em bomba. Concentração, diluição e mL/h na calculadora de drogas vasoativas — fonte única.";

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
