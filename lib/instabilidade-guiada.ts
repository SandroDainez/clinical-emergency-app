import type { InputField, TreeValues } from "../core/decision-tree/types";

/**
 * "Há sinais de instabilidade?" — decomposta em observações de beira de leito.
 *
 * ── POR QUE ISTO É UM MÓDULO, E NÃO TEXTO COPIADO EM CADA ÁRVORE ─────────────
 *
 * A mesma pergunta aparece em quase todos os módulos: bradicardia, taquicardia,
 * abdome agudo, choque, TEP, dispneia. É pergunta de especialista — pressupõe
 * saber o que conta como sinal e saber atribuí-lo ao quadro. Quem não tem
 * experiência trava aí, e travar num fluxo de emergência é o pior desfecho
 * possível de uma tela.
 *
 * A decomposição foi escrita primeiro na bradicardia e copiada para a
 * taquicardia. Copiar de novo, mais dezesseis vezes, garantiria que um dia as
 * cópias divergiriam — e uma delas ficaria errada em silêncio. Já aconteceu
 * neste app com dose de fármaco.
 *
 * Aqui os critérios existem UMA vez. Corrigir aqui corrige em todo lugar.
 *
 * ── O QUE CONTA COMO INSTABILIDADE ───────────────────────────────────────────
 *
 * Os critérios são os da AHA: hipotensão, alteração aguda do estado mental,
 * sinais de choque, dor torácica isquêmica, insuficiência cardíaca aguda.
 *
 * A primeira versão tratava os cinco como equivalentes e concluía INSTÁVEL com
 * qualquer um sozinho. Estava errado, porque dois deles são COMPOSTOS e foram
 * traduzidos por um único elemento:
 *
 *   "sinais de choque"             virou  "pele pálida, fria ou suada"
 *   "insuficiência cardíaca aguda" virou  "falta de ar"
 *
 * Pele fria e suada não é choque — é um achado que aparece no choque, e também
 * em dor, ansiedade, febre, hipoglicemia e reação vagal. Falta de ar não é IC
 * aguda: a diretriz descreve dispneia COM congestão. Do jeito que estava, um
 * paciente com PAS 110, lúcido, sem dor e sem dispneia era declarado INSTÁVEL
 * só por estar suado.
 *
 *   BASTA SOZINHO   hipotensão (PAS < 90) · alteração aguda do estado mental
 *                   · desconforto torácico de caráter isquêmico
 *   PRECISA DO PAR  pele alterada + má perfusão objetiva  → choque
 *                   dispneia    + congestão               → IC aguda
 *
 * Metade de um critério composto não é estável nem instável: é LIMÍTROFE.
 * Chamar de estável esconderia um sinal real; chamar de instável leva a
 * tratamento de instabilidade em quem não precisa.
 */

export type GrauDeInstabilidade = "instavel" | "limitrofe" | "estavel";

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

/** Confirmação de um critério composto — pode não dar para avaliar. */
const SIM_NAO_TALVEZ = [
  ...SIM_NAO,
  { value: "nao_avaliado", label: "Não consegui avaliar" },
];

/**
 * Texto de abertura do passo. Diz explicitamente que ninguém precisa saber o
 * significado dos achados — é o que tira o peso de decidir de quem não sabe.
 */
export const INTRO_GUIADA =
  'Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda "Não": ele deixa de contar, e os demais continuam valendo.';

/** Rótulo da opção que leva ao caminho guiado, igual em todos os módulos. */
export const OPCAO_GUIADA = "Não sei dizer — me guie pelos sinais";

/**
 * Campos do passo guiado.
 *
 * `contexto` entra na pergunta da dor torácica quando o módulo não é cardíaco —
 * em abdome agudo, por exemplo, perguntar só por dor no peito confunde.
 */
export function camposDeInstabilidade(): InputField[] {
  return [
    {
      id: "pas",
      label: "Pressão sistólica (o número de cima)",
      unit: "mmHg",
      allowCustom: true,
      customKeyboard: "numeric",
      presets: ["70", "80", "90", "100", "120", "140"].map((v) => ({ value: v, label: v })),
    },
    {
      id: "mental",
      label: "Está confuso, muito sonolento, desmaiou ou quase desmaiou agora?",
      presets: SIM_NAO,
    },
    {
      id: "dorToracica",
      label:
        "Dor no peito em aperto, peso ou queimação — podendo irradiar para braço, ombro, pescoço ou mandíbula?",
      presets: SIM_NAO,
    },
    {
      id: "perfusao",
      label: "A pele está pálida, fria ou suada?",
      presets: SIM_NAO,
    },
    {
      // Par de confirmação da pele. Sem ele, "suado" viraria choque — e suor
      // sozinho tem meia dúzia de causas banais.
      id: "perfusaoObjetiva",
      label:
        "Junto com isso: aperte a ponta do dedo por 5 segundos e solte — a cor demora mais de 3 segundos para voltar? (ou urina quase parou)",
      optional: true,
      presets: SIM_NAO_TALVEZ,
    },
    {
      id: "dispneia",
      label: "Falta de ar que apareceu ou piorou agora?",
      presets: SIM_NAO,
    },
    {
      // Par de confirmação da dispneia. É o que separa "cansaço" de
      // insuficiência cardíaca aguda.
      id: "congestao",
      label:
        "Junto com isso: chiado/estalidos na ausculta dos pulmões, não consegue ficar deitado, ou a saturação caiu?",
      optional: true,
      presets: SIM_NAO_TALVEZ,
    },
  ];
}

/**
 * Conclui o grau a partir das observações.
 *
 * Função pura, sem dependência de árvore — é o que permite testá-la uma vez e
 * valer para todos os módulos que a usam.
 */
export function derivarInstabilidade(v: TreeValues): GrauDeInstabilidade {
  // `Number("")` é 0, não NaN. Sem o teste de string vazia, um campo em branco
  // virava "PAS 0" e o app concluía INSTÁVEL sozinho — concluir instabilidade a
  // partir de um valor que ninguém informou é o tipo de erro que não pode
  // depender de o campo ser obrigatório hoje.
  const bruto = String(v.pas ?? "").trim();
  const pas = bruto === "" ? Number.NaN : Number(bruto.replace(",", "."));

  const hipotenso = Number.isFinite(pas) && pas < 90;
  const mental = v.mental === "sim";
  const isquemico = v.dorToracica === "sim";

  // Compostos: o achado só conta com o par que o define.
  const choque = v.perfusao === "sim" && v.perfusaoObjetiva === "sim";
  const icAguda = v.dispneia === "sim" && v.congestao === "sim";

  if (hipotenso || mental || isquemico || choque || icAguda) return "instavel";
  if (v.perfusao === "sim" || v.dispneia === "sim") return "limitrofe";
  return "estavel";
}

/**
 * Roteamento pronto para o campo `next` de um nó de entrada guiado.
 *
 * Recebe os IDs dos três destinos do módulo — cada árvore escreve suas próprias
 * conclusões, com a linguagem e as condutas dela — e devolve o `Roteamento` com
 * `possiveis` declarado, que é o que mantém o grafo auditável estaticamente.
 */
export function roteamentoDeInstabilidade(destinos: {
  instavel: string;
  limitrofe: string;
  estavel: string;
}) {
  return {
    possiveis: [destinos.instavel, destinos.limitrofe, destinos.estavel],
    escolher: (v: TreeValues) => destinos[derivarInstabilidade(v)],
  };
}
