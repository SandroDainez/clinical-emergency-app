/**
 * Q-02 · O CONTEÚDO DAS SUPERFÍCIES — dados puros, ⛔ nenhum React.
 *
 * ⚠️ Este arquivo existe para que a medicina NÃO more no componente (E-29).
 * A tela lê daqui; ⛔ nunca o contrário.
 *
 * ⚠️ ESQUELETO: rótulos e estrutura. ⛔ Nenhum corte, nenhuma dose, nenhuma
 * regra de elegibilidade — essas entram depois, cada uma com o seu slot de fonte.
 *
 * ⚠️ Os textos estão em PT-BR e são traduzidos NO RENDER por `tr()` (Q-03).
 * ⛔ Nenhum deles é verbatim de fonte: verbatim não se traduz (§6.14).
 */

import type { Pendencia, SuperficieId } from "../nucleo/tipos";

export type Superficie = {
  readonly id: SuperficieId;
  readonly letra: string;
  readonly titulo: string;
  readonly resumo: string;
  /** Slots de fonte que governam esta superfície. */
  readonly fontes: readonly string[];
};

/**
 * As sete superfícies (§7.15).
 *
 * ⚠️ A ORDEM É DE APRESENTAÇÃO, ⛔ NÃO DE FLUXO. Qualquer uma abre a qualquer
 * momento — não há árvore linear obrigatória (§7.2, E-11).
 */
export const SUPERFICIES: readonly Superficie[] = [
  {
    id: "A",
    letra: "A",
    titulo: "Entrada e estabilização",
    resumo: "Chegada, relógios, via aérea, sinais vitais, glicemia.",
    fontes: ["F-23", "F-06", "F-13"],
  },
  {
    id: "B",
    letra: "B",
    titulo: "Neurológico",
    resumo: "Déficit, NIHSS, incapacitância, funcionalidade prévia.",
    fontes: ["F-17", "F-14"],
  },
  {
    id: "C",
    letra: "C",
    titulo: "Imagem",
    resumo: "TC, exclusão de hemorragia, imagem vascular.",
    fontes: ["F-16"],
  },
  {
    id: "D",
    letra: "D",
    titulo: "Segurança e elegibilidade",
    resumo: "Anticoagulante, sangramento, procedimentos, exames.",
    fontes: ["F-07", "F-10"],
  },
  {
    id: "E",
    letra: "E",
    titulo: "Reperfusão",
    resumo: "Trombólise IV e trombectomia — frentes paralelas.",
    fontes: ["F-02", "F-03", "F-08", "F-09"],
  },
  {
    id: "F",
    letra: "F",
    titulo: "Correções",
    resumo: "Pressão arterial e glicemia, sem sair do atendimento.",
    fontes: ["F-04", "F-05", "F-18", "F-19"],
  },
  {
    id: "G",
    letra: "G",
    titulo: "Destino",
    resumo: "Transferência, unidade de AVC, saídas do fluxo.",
    fontes: ["F-15"],
  },
] as const;

export function superficie(id: SuperficieId): Superficie {
  const achada = SUPERFICIES.find((s) => s.id === id);
  // ⚠️ Sem piso silencioso: id inválido é erro de programação, não estado clínico.
  if (!achada) throw new Error(`superficie: id desconhecido "${id}"`);
  return achada;
}

/**
 * Pendências do esqueleto — as mínimas para o módulo ser navegável e já mostrar
 * o comportamento de §5.5: **dono numa superfície, alcance global**.
 *
 * ⚠️ ESQUELETO. ⛔ Nenhuma delas bloqueia coisa alguma ainda, e ⛔ nenhuma está na
 * lista das doze marcas 🚫 (E-49) — foram escolhidas exatamente por isso.
 */
export const PENDENCIAS_INICIAIS: readonly Pendencia[] = [
  {
    id: "ultima_vez_bem",
    rotulo: "Última vez visto bem",
    dono: "A",
    resolvePor: "Informar o horário, ou registrar que é desconhecido",
  },
  {
    id: "tc_realizada",
    rotulo: "Tomografia de crânio",
    dono: "C",
    resolvePor: "Registrar o resultado da imagem",
  },
  {
    id: "deficit_focal",
    rotulo: "Déficit neurológico",
    dono: "B",
    resolvePor: "Registrar o exame neurológico",
  },
] as const;
