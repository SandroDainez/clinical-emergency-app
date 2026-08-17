/**
 * 5 Hs e 5 Ts — os NOMES das causas reversíveis, em fonte única.
 *
 * ── O DEFEITO QUE ORIGINOU ───────────────────────────────────────────────────
 *
 * O card da AESP em Ritmos de Parada listava SEIS causas ("hipovolemia,
 * hipóxia, acidose, pneumotórax hipertensivo, tamponamento cardíaco, TEP
 * maciço") — uma lista PARCIAL, num módulo que não é dono dela.
 *
 * Lista parcial é o pior dos três estados possíveis. Quem corre seis itens e
 * não acha a causa conclui que INVESTIGOU — e faltavam quatro. Nenhuma lista
 * deixaria a lacuna visível; a lista completa resolveria; a parcial cria
 * confiança falsa.
 *
 * Mandar navegar para outro módulo no meio de uma parada também não serve
 * (R-23: ressalva sem alternativa). A fonte única resolve os dois: o médico vê
 * a lista COMPLETA onde precisa dela, e ela não pode divergir do dono.
 *
 * ── O QUE ESTE ARQUIVO NÃO É ─────────────────────────────────────────────────
 *
 * NÃO é o conteúdo do módulo de Causas Reversíveis — lá cada causa tem
 * pistas diagnósticas, exames e conduta própria. Aqui estão só os NOMES, que
 * é o que cabe num card de consulta rápida. Quem precisa do detalhe abre o
 * módulo, e o ponteiro de conduta está escrito ao lado (R-33).
 */

/** Os 5 Hs — causas metabólicas e sistêmicas. */
export const CAUSAS_5H = [
  "Hipóxia",
  "Hipovolemia",
  "Hidrogênio (acidose)",
  "Hipo/Hipercalemia",
  "Hipotermia",
] as const;

/** Os 5 Ts — causas obstrutivas e mecânicas. */
export const CAUSAS_5T = [
  "Tensão (pneumotórax hipertensivo)",
  "Tamponamento cardíaco",
  "Trombose coronária (IAM)",
  "Tromboembolia pulmonar (TEP)",
  "Tóxicos (intoxicações)",
] as const;

// ⚠️ CAUSAS_REVERSIVEIS_TODAS REMOVIDA (2026-08-17) — era
// `[...CAUSAS_5H, ...CAUSAS_5T]`, e as duas partes são consumidas
// SEPARADAMENTE em dois arquivos cada. O array combinado era conveniência
// que ninguém usou: estrutura, não conteúdo.

