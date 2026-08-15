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
