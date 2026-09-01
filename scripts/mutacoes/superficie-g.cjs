/**
 * MUTAÇÕES · SUPERFÍCIE G — destino, e a fronteira G → F.
 *
 * ⚠️⚠️ A mutação mais importante deste arquivo é a que tenta usar
 * disponibilidade como critério clínico. ⛔ Se ela sobreviver, geografia virou
 * elegibilidade ⛔ e F-31 foi fechada por inferência.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Superfície G · destino e a fronteira operacional",
  trava: "scripts/prova-avc-superficie-g.cjs",
  mutacoes: [
    /** ⚠️⚠️ 24 h ENCERRAM A TABELA, ⛔ e ⛔ NÃO a pertinência. */
    {
      nome: "fora da janela da tabela vira fim da monitorização",
      arquivo: ARQ.derivG,
      de: '    : { tipo: "fora_da_janela_da_tabela" };',
      para: "    : undefined;",
    },

    /** ⚠️⚠️ A AUTORIDADE — a Table 7 ⛔ NÃO tem COR/LOE. */
    {
      nome: "a regra da tabela ganha grau inventado",
      arquivo: ARQ.conteudoG,
      de: "    cor: null,\n    loe: null,\n    semGrauNaFonte: true,\n    populacao: \"após trombólise intravenosa\",",
      para: "    cor: \"1\",\n    loe: \"B-NR\",\n    semGrauNaFonte: true,\n    populacao: \"após trombólise intravenosa\",",
    },
    {
      nome: "o princípio da ausência de grau some da monitorização",
      arquivo: ARQ.conteudoG,
      de: "  cor: null,\n  loe: null,\n  semGrauNaFonte: true,",
      para: "  cor: null,\n  loe: null,\n  semGrauNaFonte: false,",
    },

    /** ⚠️⚠️ O "OU" DA FONTE — exigir UTI pede recurso mais escasso. */
    {
      nome: 'o "OU" da Table 7 vira exigência de UTI',
      arquivo: ARQ.conteudoG,
      de: '    texto: "Internar em unidade de terapia intensiva OU em unidade de AVC, para monitorização.",',
      para: '    texto: "Internar em unidade de terapia intensiva para monitorização.",',
    },

    /** ⚠️⚠️ A LACUNA PÓS-EVT ⛔ NÃO se preenche por analogia (E-31). */
    {
      nome: "a lacuna pós-EVT vira dado faltante do paciente",
      arquivo: ARQ.conteudoG,
      de: "  ehLacunaDeFonte: true,\n  ehDadoFaltanteDoPaciente: false,",
      para: "  ehLacunaDeFonte: false,\n  ehDadoFaltanteDoPaciente: true,",
    },

    /** ⚠️⚠️ O TETO DO FATO OPERACIONAL — ⛔ nunca exclusão de terapia. */
    {
      nome: "o fato operacional perde o teto declarado",
      arquivo: ARQ.conteudoG,
      de: '    geraNoMaximo: "indisponibilidade_operacional",\n    nota: "Não realizar trombectomia aqui é indisponibilidade operacional.',
      para: '    geraNoMaximo: "inelegibilidade_clinica",\n    nota: "Não realizar trombectomia aqui é indisponibilidade operacional.',
    },

    /** ⚠️⚠️ A DÍVIDA DOCUMENTAL §1.10 fica declarada. */
    {
      nome: "a dívida documental some",
      arquivo: ARQ.conteudoG,
      de: '  estado: "nao_disponivel_no_repositorio",',
      para: '  estado: "reconstruido_de_memoria",',
    },

    /** ⚠️⚠️ G REUSA o destino de C — ⛔ e ⛔ não faz o seu. */
    {
      nome: "G refaz o destino em vez de reusar o de C",
      arquivo: ARQ.derivG,
      de: "  return destinoDaImagem(estado);",
      para: "  return undefined;",
    },
  ],
};
