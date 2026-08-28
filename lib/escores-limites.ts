/**
 * O que cada escore NÃO decide (R-19).
 *
 * ── POR QUE ESTE ARQUIVO EXISTE ──────────────────────────────────────────────
 *
 * As duas constantes nasceram dentro de `sepsis-engine.ts` e são as ÚNICAS
 * coisas vivas daquele arquivo: `clinical-calculators-engine.ts` as consome nas
 * telas do qSOFA e do CURB-65. Com a deleção do engine (D-22), precisavam de
 * casa — e a casa certa não é "sepse", é o princípio que as une.
 *
 * As duas dizem a mesma coisa sobre escores diferentes: **o escore mede
 * GRAVIDADE e não indica CONDUTA** (R-19). Foi o achado que abriu a auditoria
 * das Calculadoras — o NIHSS indicando trombólise, o Glasgow indicando IOT, o
 * CURB-65 indicando UTI. O escore responde "quão grave?", e quem responde
 * "fazer o quê?" é outra coisa.
 *
 * ── R-35 APLICADO AO CONTEÚDO QUE MUDOU DE CASA ──────────────────────────────
 *
 * Nasceram em arquivo morto, e mover conteúdo é justamente o momento em que
 * ele deixa de ser suspeito sem que ninguém o tenha conferido. Os dois foram
 * reconferidos em fonte ANTES da mudança, e o segundo ganhou um número que
 * não tinha.
 */

/**
 * qSOFA — o que a SSC 2026 mudou, e o que ela NÃO mudou.
 *
 * Conferido na auditoria das Calculadoras (Fase 1, item #8). O ponto que a
 * frase protege é a distinção entre PAPEL e PONTO DE CORTE: a diretriz
 * rebaixou o uso do escore como triagem única, e não mexeu no limiar.
 */
export const QSOFA_PAPEL_APOS_SSC_2026 =
  "⚠️ A SSC 2026 NÃO recomenda o qSOFA como ferramenta ÚNICA de triagem: NEWS, MEWS e mesmo os critérios de SIRS têm sensibilidade maior para identificar quem vai deteriorar. O que mudou foi o PAPEL do escore, não o ponto de corte — o limiar ≥ 2 continua sendo o de Seymour 2016. Um qSOFA 0 ou 1 NÃO afasta sepse e não autoriza parar a investigação; qSOFA ≥ 2 identifica risco alto de desfecho adverso e obriga a avaliação completa.";

/**
 * CURB-65 — validado para INTERNAR, não para decidir UTI.
 *
 * ── O NÚMERO QUE FALTAVA ─────────────────────────────────────────────────────
 *
 * A versão anterior dizia "pelos critérios menores da ATS/IDSA" sem dizer
 * QUANTOS. A fonte especifica ≥ 3 menores (sensibilidade 56%, especificidade
 * 91% para admissão em UTI) — sem esse número, o critério não é aplicável, é
 * só uma referência.
 *
 * Fontes: IDSA/ATS CAP (critérios maiores e menores de PAC grave) e as
 * validações dos critérios menores; a literatura registra que o CURB-65
 * estima MORTALIDADE e não determina o NÍVEL DE CUIDADO, com desempenho
 * fraco para prever necessidade de UTI.
 */
export const UTI_NA_PNEUMONIA_NAO_SAI_DO_CURB65 =
  "⚠️ O critério de UTI NÃO é o escore. O CURB-65 foi validado para decidir ambulatório × internação, e é isso que ele indica aqui — estima MORTALIDADE, não nível de cuidado, e tem desempenho fraco para prever necessidade de UTI. A terapia intensiva se decide pelos critérios MAIORES da ATS/IDSA (choque com necessidade de vasopressor OU insuficiência respiratória com ventilação mecânica) ou por ≥ 3 critérios MENORES. Um CURB-65 de 4 ou 5 pode vir só de idade, confusão, ureia e frequência respiratória, sem nenhum deles. Abrir o módulo Sepse para a estratificação de gravidade e a decisão de destino.";

// ══════════════════════════════════════════════════════════════════════════
//  LIMITES QUE MUDARAM DE CASA (2026-08-27)
// ══════════════════════════════════════════════════════════════════════════
//
// ⚠️ ESTES SEIS TEXTOS VIVIAM DENTRO DE ÁRVORES CLÍNICAS, e a Calculadora
// Clínica — área preservada — importava de lá. Quando a arquitetura clínica
// antiga saiu, esses imports teriam levado a calculadora junto.
//
// A mudança é semântica, não conserto de import: todos respondem à MESMA
// pergunta que este arquivo já existia para responder — "o que este escore NÃO
// diz". Eles não pertenciam à árvore do módulo; estavam lá porque foi ali que
// precisaram existir primeiro.
//
// ⚠️ E TODOS PERDERAM O PONTEIRO "ABRIR O MÓDULO X". Cada um terminava
// mandando abrir um módulo clínico — e esses módulos deixaram de existir. Um
// app que manda abrir o que não existe é pior que um que não sugere nada: ele
// promete uma continuação e entrega um beco. O conteúdo clínico ficou inteiro;
// só a instrução de navegação saiu.

/**
 * GCS baixo NÃO manda intubar sozinho.
 *
 * "GCS ≤ 8 intuba" é das regras mais repetidas e mais mal aplicadas da
 * emergência, e erra exatamente onde a causa é reversível em minutos.
 */
export const GLASGOW_AVALIAR_VIA_AEREA =
  "Rebaixamento neste nível exige AVALIAÇÃO imediata da via aérea — não intubação automática. A regra \"GCS ≤ 8 intuba\" erra justamente onde a causa é reversível em minutos: pós-ictal, hipoglicemia e intoxicação por opioide costumam recuperar a consciência com o tratamento específico, e o paciente acaba intubado por um número que já estava subindo. O que decide é a capacidade de proteger a via aérea, a trajetória (melhorando ou piorando) e a causa.";

/** O HEART apoia a disposição; não indica coronariografia nem define o tempo dela. */
export const ESTRATEGIA_INVASIVA_NAO_SAI_DO_HEART =
  "⚠️ O HEART estima risco de MACE e apoia a DISPOSIÇÃO — não indica coronariografia nem define o tempo dela. A estratégia invasiva e sua urgência dependem de supradesnivelamento de ST, instabilidade hemodinâmica ou elétrica, dor refratária e da estratificação pelo GRACE, que este escore não contém.";

/** O escore de probabilidade de TEP não sabe o que muda o exame. */
export const ANGIOTC_QUANDO_NAO_DA =
  "⚠️ Antes de pedir a AngioTC: gestação, função renal e alergia a contraste mudam o exame, e o escore não pergunta nenhuma das três. Na gestante, começar por doppler venoso de membros inferiores (se positivo, trata sem irradiar) e, se negativo, discutir cintilografia de perfusão ou AngioTC com protocolo de dose reduzida. Na injúria renal ou na alergia ao contraste, a cintilografia V/Q é a alternativa.";

/** A gravidade do NIHSS não é a indicação de reperfusão. */
export const NIHSS_SEM_INDICACAO =
  "Esta faixa descreve a GRAVIDADE do déficit — não indica reperfusão. A decisão de trombolisar ou trombectomizar depende de o déficit ser INCAPACITANTE, da janela e das contraindicações, que esta tela não pergunta. Déficit incapacitante trombolisa mesmo com NIHSS baixo (afasia isolada, hemianopsia); NIHSS mais alto por déficits sensitivos difusos pode não ser incapacitante.";

/** Agitação manda procurar causa antes de sedar. */
export const RASS_AGITACAO_PROCURAR_CAUSA =
  "Agitação manda procurar CAUSA antes de sedar. Dor não tratada, delirium, hipóxia, hipoglicemia, retenção urinária, abstinência (álcool, benzodiazepínico, opioide, nicotina), tubo mal posicionado e VENTILAÇÃO ASSINCRÔNICA produzem agitação — e a assincronia se trata ajustando o ventilador, não subindo o sedativo. Sedar sem procurar mascara o problema que está causando a agitação, que é exatamente o erro que esta escala existe para prevenir. Analgesia primeiro.";

/** Faixas do RASS mais profundas que a meta padrão — descrevem, não mandam ajustar. */
export const SEDACAO_ABAIXO_DA_META =
  "Mais profundo que a meta padrão de sedação leve (RASS −2 a 0, PADIS 2018). Existem indicações legítimas para descer — bloqueio neuromuscular, hipertensão intracraniana, SDRA grave, procedimento — e nesses casos a profundidade é o objetivo, não um desvio. Fora delas, sedação profunda associa-se a mais dias de ventilação, mais delirium e síndrome pós-terapia intensiva.";

/** RASS −5: a escala não distingue sedação de bloqueio de lesão. */
export const RASS_NAO_DESPERTA =
  "Não desperta a estímulo físico. Pode ser sedação profunda, bloqueio neuromuscular em curso ou lesão neurológica — a escala não distingue os três. Sob bloqueio, RASS −5 é o alvo correto e não indica excesso de sedativo.";
