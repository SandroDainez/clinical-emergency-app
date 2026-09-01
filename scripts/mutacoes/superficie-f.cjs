/**
 * MUTAÇÕES · SUPERFÍCIE F — o catálogo e a correspondência.
 *
 * ⚠️ Cada mutação quebra **uma promessa clínica nomeada**. ⛔ Se ela sobreviver,
 * a trava está medindo presença em vez de efeito.
 */
const { ARQ } = require("./lib.cjs");

module.exports = {
  nome: "Superfície F · catálogo e correspondência",
  trava: "scripts/prova-avc-superficie-f.cjs",
  mutacoes: [
    /** ⚠️⚠️ A POLARIDADE DO TNK — §4.6.2 rec. 2 é sobre tenecteplase 0,4. */
    {
      nome: "TNK 0,4 troca tenecteplase por alteplase",
      arquivo: ARQ.derivF,
      de: '      if (a === "Tenecteplase") return "satisfaz";\n      if (a === "Alteplase") return "contradiz";',
      para: '      if (a === "Alteplase") return "satisfaz";\n      if (a === "Tenecteplase") return "contradiz";',
    },
    {
      nome: "alteplase deixa de contradizer TNK 0,4",
      arquivo: ARQ.derivF,
      de: '      if (a === "Alteplase") return "contradiz";',
      para: "      if (a === \"Alteplase\") return undefined;",
    },
    {
      nome: '"Indefinido" passa a escolher o agente',
      arquivo: ARQ.derivF,
      de: '      if (a === "Tenecteplase") return "satisfaz";',
      para: "      if (a !== undefined) return \"satisfaz\";",
    },

    /** ⚠️⚠️ AUSÊNCIA ⛔ NUNCA VIRA NEGATIVA (E-02). */
    {
      nome: "vazio passa a contradizer no ternário",
      arquivo: ARQ.derivF,
      de: '  if (v === false) return "contradiz";\n  return undefined;',
      para: '  if (v === false) return "contradiz";\n  return "contradiz";',
    },

    /** ⚠️⚠️ A DÍVIDA DE FONTE TRAVA MESMO COM TUDO PRESENTE (F-31). */
    {
      nome: "dívida de fonte deixa de travar a correspondência",
      arquivo: ARQ.derivF,
      de: '  if (travadaPor) {\n    return { correspondencia: "nao_avaliavel", sustentam, incompativeis, faltam };\n  }',
      para: "",
    },
    {
      nome: "contrário deixa de vencer o potencial",
      arquivo: ARQ.derivF,
      de: '  if (incompativeis.length > 0) {\n    return { correspondencia: "nao_corresponde", sustentam, incompativeis, faltam };\n  }',
      para: "",
    },

    /** ⚠️⚠️ RECOMENDAÇÃO CLÍNICA ⛔ SEM INSUMO SAI APLICÁVEL NO VAZIO. */
    {
      nome: "recomendação clínica volta a ter exige vazio",
      arquivo: ARQ.conteudoF,
      de: '    exige: ["deficit_leve_nao_incapacitante"],',
      para: "    exige: [],",
    },
    {
      nome: "a recomendação de dose perde o agente",
      arquivo: ARQ.conteudoF,
      de: '    exige: ["agente_e_tenecteplase"],',
      para: "    exige: [],",
    },


    /** ⚠️⚠️ O MÉTODO DA PENUMBRA DIFERE ENTRE AS RECOMENDAÇÕES. */
    {
      nome: "rec. 2 perde a exigência de perfusão automatizada",
      arquivo: ARQ.conteudoF,
      de: '    exige: ["penumbra_por_perfusao_automatizada", "nao_elegivel_a_evt"],',
      para: '    exige: ["penumbra_salvavel", "nao_elegivel_a_evt"],',
    },
    {
      nome: "rec. 3 ganha exigência de método que a fonte não fez",
      arquivo: ARQ.conteudoF,
      de: '    exige: ["sitio_da_oclusao", "penumbra_salvavel", "nao_elegivel_a_evt"],',
      para: '    exige: ["sitio_da_oclusao", "penumbra_por_perfusao_automatizada", "nao_elegivel_a_evt"],',
    },
    {
      nome: "os dois componentes de RM viram um",
      arquivo: ARQ.conteudoF,
      de: '    exige: ["dwi_menor_que_um_terco", "flair_sem_alteracao_marcada"],',
      para: '    exige: ["dwi_menor_que_um_terco"],',
    },

    /** ⚠️⚠️ LEVE **E** ⛔ NÃO INCAPACITANTE — duas propriedades. */
    {
      nome: "leve + não-incapacitante volta a bastar um eixo",
      arquivo: ARQ.derivF,
      de: '      if (inc === "Não incapacitante" && leve === "Leve") return "satisfaz";',
      para: '      if (inc === "Não incapacitante" || leve === "Leve") return "satisfaz";',
    },
  ],
};
