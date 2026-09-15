/**
 * MUTAÇÕES · AC-13 REABERTO · LEGADO «REALIZADA» (autor, 2026-09-15).
 *
 * Casos gravados antes da mudança de vocabulário guardam «Realizada», que é lida como administrado/concluído e expõe
 * o paciente. Cada mutação quebra essa compatibilidade; a retomada pelo log na prova de persistência (A13: a trombólise
 * registrada continua exposta depois de reabrir) tem de reprovar todas.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "AC-13 reaberto · legado «Realizada» na retomada",
  trava: "scripts/prova-avc-persistencia.cjs",
  mutacoes: [
    {
      nome: "legado · «Realizada» passa a ser lida como estado sem exposição (cancelado)",
      arquivo: ARQ.conteudoE,
      de: '  [ESTADO_DA_ACAO.realizada]: "administrado_concluido",',
      para: '  [ESTADO_DA_ACAO.realizada]: "cancelado",',
    },
    {
      nome: "legado · o mapeamento de «Realizada» é eliminado (o registro antigo perde a situação)",
      arquivo: ARQ.conteudoE,
      de: "  return atual ?? ROTULO_LEGADO_DO_ESTADO[valor];",
      para: "  return atual;",
    },
  ],
};
