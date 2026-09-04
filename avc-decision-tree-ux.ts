import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import { avcDecisionTree } from "./avc-decision-tree";

const nodes = avcDecisionTree.nodes;
const tc = nodes.tc;
const tcResultado = nodes.tc_resultado;
const isqDados = nodes.isq_dados;
const isqNihss = nodes.isq_nihss;
const isqContraindicacoes = nodes.isq_contraindicacoes;
const ciAvcLista = nodes.ci_avc_lista;

if (
  tc.type !== "action" ||
  tcResultado.type !== "decision" ||
  isqDados.type !== "input" ||
  isqNihss.type !== "input" ||
  isqContraindicacoes.type !== "decision" ||
  ciAvcLista.type !== "action"
) {
  throw new Error("Estrutura esperada do fluxo de AVC mudou; revisar avc-decision-tree-ux.ts");
}

/**
 * Ajustes de superfície e ordem do fluxo do AVC identificados na travessia visual.
 *
 * Não muda dose, limiar, janela terapêutica ou critério clínico. Corrige três
 * problemas de interação:
 * 1) NIHSS era mandado executar na TC, mas só era coletado várias telas depois;
 * 2) o ramo isquêmico coletava dados gerais antes do NIHSS, ampliando esse hiato;
 * 3) a lista de contraindicações aparecia como CONDUTA e avançava sozinha para PA,
 *    mesmo quando o médico a abriu porque não sabia responder.
 *
 * A lista agora é AJUDA dentro de uma decisão: o conteúdo fica recolhido em
 * "Ver critérios" e o fluxo só segue depois de uma resposta explícita. Se a
 * contraindicação absoluta não puder ser excluída com segurança, o ramo não
 * libera a trombólise IV e segue para avaliação de trombectomia.
 */
export const avcDecisionTreeUx: DecisionTreeDefinition = {
  ...avcDecisionTree,
  nodes: {
    ...nodes,

    tc: {
      ...tc,
      actions: tc.actions.map((item, index) =>
        index === 3
          ? "NIHSS deve ser obtido em paralelo ao fluxo de imagem; o app solicitará o escore logo após classificar a TC, sem atrasar a neuroimagem."
          : item
      ),
    },

    tc_resultado: {
      ...tcResultado,
      options: tcResultado.options.map((option) =>
        option.id === "isquemico" ? { ...option, next: "isq_nihss" } : option
      ),
    },

    // Depois de confirmar que não há hemorragia, a primeira coleta estruturada
    // do ramo isquêmico é o NIHSS que já foi solicitado em paralelo.
    isq_nihss: {
      ...isqNihss,
      next: "isq_dados",
    },

    isq_dados: {
      ...isqDados,
      next: "isq_janela",
    },

    isq_contraindicacoes: {
      ...isqContraindicacoes,
      title: "Contraindicações à trombólise IV",
      question: "Há alguma contraindicação ABSOLUTA à trombólise IV?",
      options: isqContraindicacoes.options.map((option) =>
        option.id === "nao_sei"
          ? { ...option, label: "Preciso revisar os critérios — abrir ajuda", next: "ci_avc_lista" }
          : option
      ),
    },

    // Era um ActionNode chamado "Contraindicações ao alteplase"; visualmente
    // parecia uma ordem para executar uma parede de texto e, pior, seu `next`
    // seguia direto para PA. Agora é suporte clicável de uma decisão real.
    ci_avc_lista: {
      id: ciAvcLista.id,
      type: "decision",
      title: "Ajuda — contraindicações à trombólise IV",
      summary:
        "Abra “Ver critérios” para revisar a lista. O app não avança pela simples leitura: escolha abaixo o que foi constatado.",
      question: "Após revisar os critérios, existe contraindicação ABSOLUTA à trombólise IV?",
      evidence: ciAvcLista.actions.map((item) =>
        item.replace(
          "CONTRAINDICAÇÕES AO ALTEPLASE NO AVC ISQUÊMICO",
          "CRITÉRIOS DE EXCLUSÃO DA TROMBÓLISE IV NO AVC ISQUÊMICO"
        )
      ),
      options: [
        { id: "nao", label: "Não — nenhuma absoluta identificada", next: "isq_pa_check" },
        { id: "sim", label: "Sim — há contraindicação absoluta", next: "isq_trombectomia_check" },
        {
          id: "incerto",
          label: "Ainda não consigo excluir com segurança",
          next: "isq_trombectomia_check",
        },
      ],
    },
  },
};
