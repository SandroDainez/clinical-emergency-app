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
  /** ⚠️ Identidade ESTÁVEL. ⛔ Não muda quando a ordem ou a letra mudam. */
  readonly id: SuperficieId;
  /**
   * ⚠️ A LETRA É DERIVADA DA POSIÇÃO, ⛔ nunca escrita à mão.
   *
   * Escrita à mão, ela pode discordar da ordem — e uma tela que mostra "F" no
   * quinto lugar é uma tela em que o médico e o prontuário falam de coisas
   * diferentes. Aqui letra e posição ⛔ não têm como divergir.
   */
  readonly letra: string;
  readonly titulo: string;
  readonly resumo: string;
  /** Slots de fonte que governam esta superfície. */
  readonly fontes: readonly string[];
};

/** Uma superfície como ela é DECLARADA — ⛔ sem letra: a letra é calculada. */
type DeclaracaoDeSuperficie = Omit<Superficie, "letra">;

/**
 * As sete superfícies (§7.15), NA ORDEM EM QUE APARECEM.
 *
 * ⚠️⚠️ A ORDEM É DE APRESENTAÇÃO, ⛔ NÃO DE FLUXO. Qualquer uma abre a qualquer
 * momento, em qualquer ordem — ⛔ não há árvore linear, ⛔ não há pré-requisito
 * de navegação, e ⛔ nenhuma superfície declara "próxima" ou "anterior" (§7.2,
 * E-11). Reordenar este arranjo muda o que o médico VÊ primeiro; ⛔ não muda o
 * que ele PODE fazer.
 *
 * ── POR QUE CORREÇÕES VEM ANTES DE REPERFUSÃO (decisão do autor, 2026-08-28) ─
 *
 * Pressão arterial e glicemia são o que se resolve **enquanto** a reperfusão é
 * decidida, e frequentemente são pré-condição prática dela. Pôr Reperfusão
 * antes sugeria uma sequência que ⛔ não existe. ⚠️ Isto continua sendo ordem de
 * leitura: ⛔ ninguém é obrigado a passar por Correções para chegar a Reperfusão.
 */
const ORDEM_DE_APRESENTACAO: readonly DeclaracaoDeSuperficie[] = [
  {
    id: "estabilizacao",
    titulo: "Entrada e estabilização",
    resumo: "Chegada, relógios, via aérea, sinais vitais, glicemia.",
    fontes: ["F-23", "F-06", "F-13"],
  },
  {
    id: "neurologico",
    titulo: "Neurológico",
    resumo: "Déficit, NIHSS, incapacitância, funcionalidade prévia.",
    fontes: ["F-17", "F-14"],
  },
  {
    id: "imagem",
    titulo: "Imagem",
    resumo: "TC, exclusão de hemorragia, imagem vascular.",
    fontes: ["F-16"],
  },
  {
    id: "seguranca",
    titulo: "Segurança e elegibilidade",
    resumo: "Anticoagulante, sangramento, procedimentos, exames.",
    fontes: ["F-07", "F-10"],
  },
  {
    id: "correcoes",
    titulo: "Correções",
    resumo: "Pressão arterial e glicemia, sem sair do atendimento.",
    fontes: ["F-04", "F-05", "F-18", "F-19"],
  },
  {
    id: "reperfusao",
    titulo: "Reperfusão",
    resumo: "Trombólise IV e trombectomia — frentes paralelas.",
    fontes: ["F-02", "F-03", "F-08", "F-09"],
  },
  {
    id: "destino",
    titulo: "Destino",
    resumo: "Transferência, unidade de AVC, saídas do fluxo.",
    fontes: ["F-15"],
  },
] as const;

/** ⚠️ A letra sai da POSIÇÃO. ⛔ Nenhuma é digitada. */
export const SUPERFICIES: readonly Superficie[] = ORDEM_DE_APRESENTACAO.map((s, i) => ({
  ...s,
  letra: String.fromCharCode("A".charCodeAt(0) + i),
}));

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
    dono: "estabilizacao",
    campo: "hora_ultima_vez_bem",
    resolvePor: "Informar o horário, ou registrar que é desconhecido",
  },
  {
    id: "tc_realizada",
    rotulo: "Tomografia de crânio",
    dono: "imagem",
    // ⚠️ Campo ainda inexistente: a Superfície de Imagem não foi construída.
    // A pendência fica aberta — o que é correto, e ⛔ não é o defeito de cima.
    campo: "tc_realizada",
    resolvePor: "Registrar o resultado da imagem",
  },
  {
    id: "deficit_focal",
    rotulo: "Déficit neurológico",
    dono: "neurologico",
    campo: "deficit_focal",
    resolvePor: "Registrar o exame neurológico",
  },
] as const;
