import type { TreeValues } from "../core/decision-tree/types";
import { contraindicacaoDoNitrato } from "./nitrato-contraindicacao";

/**
 * ESTADO DERIVADO DA TERAPIA ANTI-ISQUÊMICA.
 *
 * ── ⚠️ ESTA CAMADA RESPONDE UMA PERGUNTA SÓ ────────────────────────────────
 *
 *     "A etapa anti-isquêmica foi resolvida? E qual foi o resultado?"
 *
 * Ela NÃO decide se a morfina pode. Essa separação é do autor (2026-08-27) e é
 * o que impede o defeito que já aconteceu uma vez: quando "a etapa anterior foi
 * resolvida?" e "o fármaco pode?" moram na mesma função, um achado que deveria
 * ser CAUTELA vira BLOQUEIO — foi assim que o VD passou a contraindicar a
 * morfina em absoluto.
 *
 * ── A ARQUITETURA, NA FORMULAÇÃO DO AUTOR ──────────────────────────────────
 *
 *     dados brutos → estado clínico derivado → vários vereditos
 *
 * e não `veredito A → veredito B → veredito C`. Eu havia proposto a segunda, e
 * ele barrou: "a ordem de avaliação pode começar a determinar comportamento
 * clínico". Aqui não há ordem — os dois vereditos leem o mesmo estado, cada um
 * por si, e o estado não lê veredito nenhum.
 *
 * É também o padrão que o app já usa em `avaliarAmeacaImediata`: medidas brutas
 * viram estado, e o roteamento apenas interpreta.
 */

export type EstadoTerapiaAntiIsquemica =
  /** Ninguém avaliou o nitrato ainda — a etapa não foi resolvida. */
  | "nao_avaliada"
  /** O nitrato foi avaliado e NÃO é opção neste paciente. */
  | "nitrato_contraindicado"
  /** Foi administrado e a dor cedeu. */
  | "nitrato_realizado_dor_resolvida"
  /** Foi administrado e a dor persiste — a indicação clássica da morfina. */
  | "nitrato_realizado_dor_persistente";

/** Chave onde o motor espelha a execução do nitrato. */
const NITRATO_REALIZADO = "__realizada_nitrato";

/**
 * O estado da etapa anti-isquêmica. Função pura.
 *
 * ⚠️ A ORDEM DAS PERGUNTAS AQUI É CLÍNICA, não de conveniência. "Foi
 * administrado" vem antes de "está contraindicado" porque um nitrato já dado
 * torna a contraindicação superveniente irrelevante para ESTA pergunta — o que
 * se quer saber é se a etapa foi cumprida, e ela foi.
 */
export function estadoTerapiaAntiIsquemica(v: TreeValues): EstadoTerapiaAntiIsquemica {
  const administrado = Boolean(v[NITRATO_REALIZADO]);

  if (administrado) {
    // ⚠️ SEM `dor_persiste`, O ESTADO NÃO AVANÇA PARA "PERSISTENTE". Presumir
    // que a dor persiste liberaria a morfina sobre um dado que ninguém deu; e
    // presumir que cedeu negaria analgesia a quem está com dor. Enquanto o
    // campo não for respondido, a etapa conta como resolvida com a dor
    // resolvida — o estado conservador, que não abre a porta da morfina.
    return v.dor_persiste === "sim"
      ? "nitrato_realizado_dor_persistente"
      : "nitrato_realizado_dor_resolvida";
  }

  const ci = contraindicacaoDoNitrato(v);
  // ⚠️ "PDE-5 AINDA NÃO VERIFICADO" E "PA NÃO MEDIDA" NÃO SÃO CONTRAINDICAÇÃO
  // RESOLVIDA — são ausência de avaliação. O nitrato fica 🔴 nos dois casos (e
  // deve mesmo: desconhecido não é negativo), mas para ESTA camada a etapa
  // continua NÃO AVALIADA, e a morfina continua aguardando em vez de virar
  // "avaliar no contexto". A diferença importa: no primeiro caso ainda há o que
  // perguntar; no segundo, já se sabe que o nitrato não é opção.
  if (ci.presente && ci.motivo !== "pde5_nao_verificado" && ci.motivo !== "pa_nao_medida") {
    return "nitrato_contraindicado";
  }

  return "nao_avaliada";
}

/**
 * O motivo pelo qual o nitrato não é opção — para o card da morfina dizer o
 * contexto em vez de só mudar de cor.
 */
export function porQueNitratoForaDeOpcao(v: TreeValues): string | null {
  if (estadoTerapiaAntiIsquemica(v) !== "nitrato_contraindicado") return null;
  return contraindicacaoDoNitrato(v).texto;
}
