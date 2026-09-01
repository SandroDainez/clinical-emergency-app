/**
 * MUTAÇÕES · ALCANÇABILIDADE — os quatro defeitos que moraram entre camadas.
 *
 * ⚠️⚠️ ⛔ NENHUM deles foi pego por prova de superfície. ⚠️ Cada mutação aqui
 * **reencena um defeito que existiu de verdade** — e a varredura tem de
 * reprová-lo.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Alcançabilidade · o vão entre camadas",
  trava: "scripts/prova-alcancabilidade-avc.cjs",
  mutacoes: [
    /** ⚠️⚠️ DEFEITO 3 · ação fora do registro → gravada sem instância. */
    {
      nome: "a ação de F sai do registro do módulo",
      arquivo: ARQ.campos,
      de: '    ...ACAO_DE_TROMBOLISE.map((c) => ({ ...c, casa: "reperfusao" as const })),',
      para: "",
    },
    /** ⚠️⚠️ DEFEITO 1 · achado sem modalidade que o ofereça. */
    {
      nome: "achado de C perde a modalidade que o oferece",
      arquivo: ARQ.conteudoC,
      de: '    "penumbra_por_perfusao_automatizada",\n    "penumbra_salvavel",',
      para: '    "penumbra_salvavel",',
    },
    /** ⚠️⚠️ DEFEITO 2 · campo existe e ⛔ nenhuma tela o renderiza. */
    {
      nome: "campo de G deixa de ser renderizado",
      arquivo: ARQ.telaG,
      de: "{FATOS_OPERACIONAIS.map((f) => {",
      para: "{[].map((f: any) => {",
    },
    /** ⚠️⚠️ DEFEITO 4 · derivação lê um campo que ⛔ não existe. */
    {
      nome: "derivação volta a ler o campo fantasma nihss",
      arquivo: ARQ.derivF,
      de: "      const v = nihssCalculado(estado) ?? nihssInformado(estado);",
      para: '      const v = valorAtual(estado, "nihss")?.valor;',
    },

    /** ⚠️⚠️ RÓTULO × SLUG — a comparação que fica eternamente falsa. */
    {
      nome: "derivação volta a comparar o rótulo slugado",
      arquivo: ARQ.derivF,
      de: "  const v = ternario(estado, campo);",
      para: '  const v = escolha(estado, campo) === "Sim" ? true : escolha(estado, campo) === "Não" ? false : undefined;',
    },

    /** ⚠️⚠️ CONTRATOS TRANSVERSAIS DO MÓDULO. */
    {
      nome: "dois campos passam a compartilhar relógio",
      arquivo: ARQ.conteudoA,
      de: '    relogio: "reconhecimento",',
      para: '    relogio: "ultima_vez_bem",',
    },
    {
      nome: "id de campo se repete entre superfícies",
      arquivo: ARQ.conteudoG,
      de: '    id: "centro_evt_disponivel",',
      para: '    id: "aspects",',
    },
    {
      nome: "fato operacional passa a ser lido por derivação clínica",
      arquivo: ARQ.derivF,
      de: '    case "nao_elegivel_a_evt":\n      return undefined;',
      para: '    case "nao_elegivel_a_evt":\n      return escolha(estado, "centro_evt_disponivel") ? "satisfaz" : undefined;',
    },
    {
      nome: "tela do AVC escreve contraindicado",
      arquivo: ARQ.telaG,
      de: "  const tr = useTr();\n  const e = useEstilosDoTema(criarEstilos);\n\n  const pertinencia",
      para: '  const tr = useTr();\n  const e = useEstilosDoTema(criarEstilos);\n  const _x = "contraindicado";\n\n  const pertinencia',
    },
  ],
};
