/**
 * MUTAÇÕES · AC-13 REABERTO · INVARIANTES CENTRAIS (autor, 2026-09-15; `docs/decisoes.md`, seção "AC-13 reaberto").
 *
 * Cada mutação quebra deliberadamente uma invariante já provada por conferência e e2e, para demonstrar que a própria
 * trava reprova a violação real: triestado de exposição, «não sei» sem virar ausência (inclusive nos consumidores
 * clínicos derivados), terminais e retrocessos, e trilha fiel a correção e desfazer. A prova do AC-13 tem de reprovar
 * todas.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "AC-13 reaberto · triestado, «não sei», terminais e trilha fiel",
  trava: "scripts/prova-avc-ac13-reaberto.cjs",
  mutacoes: [
    /* ── Triestado de exposição ─────────────────────────────────────────────── */
    {
      nome: "triestado · «desconhecida» vira «nao_exposta»",
      arquivo: ARQ.derivF,
      de: '  if (x.estado === "situacao_desconhecida" || x.estado === "registro_em_aberto") return "desconhecida";',
      para: '  if (x.estado === "situacao_desconhecida" || x.estado === "registro_em_aberto") return "nao_exposta";',
    },
    {
      nome: "triestado · a agregação põe «desconhecida» antes de «exposta» (iniciada + «não sei» vira desconhecida)",
      arquivo: ARQ.derivF,
      de: '  const exposta = ultimaCom("exposta");\n  if (exposta !== undefined) return exposta;\n'
        + '  const desconhecida = ultimaCom("desconhecida");\n  if (desconhecida !== undefined) return desconhecida;\n',
      para: '  const desconhecida = ultimaCom("desconhecida");\n  if (desconhecida !== undefined) return desconhecida;\n'
        + '  const exposta = ultimaCom("exposta");\n  if (exposta !== undefined) return exposta;\n',
    },
    {
      nome: "triestado · a agregação põe «cancelada» antes de «desconhecida» (cancelada + «não sei» vira não exposta)",
      arquivo: ARQ.derivF,
      de: '  const desconhecida = ultimaCom("desconhecida");\n  if (desconhecida !== undefined) return desconhecida;\n'
        + '  const canceladas = todas.filter((x) => x.estado === "cancelada_antes_do_inicio");\n'
        + '  if (canceladas.length > 0) return canceladas[canceladas.length - 1];\n',
      para: '  const canceladas = todas.filter((x) => x.estado === "cancelada_antes_do_inicio");\n'
        + '  if (canceladas.length > 0) return canceladas[canceladas.length - 1];\n'
        + '  const desconhecida = ultimaCom("desconhecida");\n  if (desconhecida !== undefined) return desconhecida;\n',
    },

    /* ── «Não sei» não vira ausência: consumidores clínicos derivados ───────── */
    {
      nome: "«não sei» · no pós-IVT, a exposição desconhecida vira saída de «sem administração registrada»",
      arquivo: ARQ.derivG,
      de: '      motivo: certeza === "desconhecida" ? "exposicao_desconhecida" : "sem_administracao_registrada",',
      para: '      motivo: "sem_administracao_registrada",',
    },
    {
      nome: "«não sei» · no caminho hemorrágico, a infusão desconhecida cai em «sem trombólise»",
      arquivo: ARQ.caminhoHemorragico,
      de: '  if (x.estado !== "exposta") return { estado: certezaDaInstancia(x) === "desconhecida" ? "desconhecida" : "sem_trombolise" };',
      para: '  if (x.estado !== "exposta") return { estado: "sem_trombolise" };',
    },

    /* ── Terminais e retrocessos ────────────────────────────────────────────── */
    {
      nome: "ordem · o retrocesso deixa de pedir confirmação (Administrada/concluída → Indicada passa em silêncio)",
      arquivo: ARQ.ordemDaAcao,
      de: '    if (referencia !== undefined) return { regra: "retrocesso", novo, referencia };',
      para: "    if (referencia !== undefined) return undefined;",
    },
    {
      nome: "ordem · «Interrompida» some da comparação (Interrompida → Preparada passa em silêncio)",
      arquivo: ARQ.ordemDaAcao,
      de: "  const doFim = [...anteriores].reverse();",
      para: '  const doFim = [...anteriores].reverse().filter((r) => r.estado !== "interrompido");',
    },
    {
      nome: "ordem · «Cancelada» deixa de ser terminal (Cancelada → Iniciada sem correção ou reabertura)",
      arquivo: ARQ.ordemDaAcao,
      de: '  if (terminal !== undefined && terminal.estado !== novo) return { regra: "saida_de_estado_terminal", novo, referencia: terminal };',
      para: '  if (terminal !== undefined && terminal.estado !== novo && terminal.estado !== "cancelado") return { regra: "saida_de_estado_terminal", novo, referencia: terminal };',
    },

    /* ── Trilha fiel a correção e desfazer ──────────────────────────────────── */
    {
      nome: "trilha · o defeito do 5649ade: o desfazer some da trilha e o estado antigo continua vigente",
      arquivo: ARQ.transicoesDaAcao,
      de: "  const fatos = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo);\n"
        + "  const invalidados = idsInvalidadosPorCorrecao(fatos);\n"
        + "  const atual = valorNaInstancia(estado, instancia, campo);\n",
      para: '  const fatos = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo && informacaoDoEstadoDaAcao(f.valor).tipo !== "nao_perguntado");\n'
        + "  const invalidados = idsInvalidadosPorCorrecao(fatos);\n"
        + "  const atual = fatos[fatos.length - 1];\n",
    },
    {
      nome: "trilha · o evento de desfazer volta a ser filtrado da trilha",
      arquivo: ARQ.transicoesDaAcao,
      de: "  const fatos = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo);\n",
      para: '  const fatos = fatosDaInstancia(estado, instancia).filter((f) => f.campo === campo && informacaoDoEstadoDaAcao(f.valor).tipo !== "nao_perguntado");\n',
    },
    {
      nome: "trilha · depois de «Limpar», o estado anterior volta a ser marcado como vigente",
      arquivo: ARQ.transicoesDaAcao,
      de: '      vigente: tipo === "registro" && atual !== undefined && atual.id === f.id,',
      para: '      vigente: tipo === "registro" && atual !== undefined && (atual.id === f.id || (atual.tipo === "correcao" && atual.corrigeFatoId === f.id && !ehCorrecaoComMotivo(atual))),',
    },
    {
      nome: "trilha · o registro corrigido por engano perde a marca de invalidado",
      arquivo: ARQ.transicoesDaAcao,
      de: "      invalidadaPorCorrecao: invalidados.has(f.id),",
      para: "      invalidadaPorCorrecao: false,",
    },
  ],
};
