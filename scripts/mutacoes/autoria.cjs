/**
 * MUTAÇÕES · AUTORIA — AC-13 reaberto, item 4 (autor, 2026-09-14).
 *
 * Cada mutação reencena um jeito de a tela mostrar identidade que não existe: nome tirado do e-mail, id no lugar do
 * nome, ou nome inventado para evento antigo. A prova do AC-13 tem de reprovar todas.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Autoria · nome de exibição ou autoria não identificada",
  trava: "scripts/prova-avc-ac13-reaberto.cjs",
  mutacoes: [
    {
      nome: "o nome de exibição passa a aceitar o e-mail",
      arquivo: ARQ.autoria,
      de: '  for (const chave of ["full_name", "nome"] as const) {',
      para: '  for (const chave of ["full_name", "nome", "email"] as const) {',
    },
    {
      nome: "sem nome, a tela passa a mostrar o identificador do autor",
      arquivo: ARQ.autoria,
      de: '  if (nome) return { tipo: "nome", rotulo: "Registrado por:", nome };',
      para: '  if (nome || autoria?.autor) return { tipo: "nome", rotulo: "Registrado por:", nome: nome || String(autoria?.autor) };',
    },
    {
      nome: "a migração v3 → v4 inventa nome a partir do autor",
      arquivo: ARQ.tiposDaPersistencia,
      de: "    return { ...(e as EventoV3), nomeDoAutor: null, versaoDoSchema: VERSAO_DO_SCHEMA };",
      para: "    return { ...(e as EventoV3), nomeDoAutor: (e as EventoV3).autor, versaoDoSchema: VERSAO_DO_SCHEMA };",
    },
  ],
};
