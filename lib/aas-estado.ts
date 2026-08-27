import type { TreeValues } from "../core/decision-tree/types";

/**
 * ESTADO DO AAS — quatro, e o quarto é o que cobra.
 *
 * ── ⚠️ POR QUE QUATRO E NÃO DOIS ───────────────────────────────────────────
 *
 * O motor só sabe dizer "realizada" ou "não realizada", e essas duas colapsam
 * três situações clinicamente distintas: o médico decidiu NÃO dar, o app
 * concluiu que NÃO PODE, e ninguém olhou ainda. Só a terceira precisa ser
 * cobrada — e era justamente a que ficava indistinguível.
 *
 * ⚠️ E "NÃO AVALIADO" NÃO TRAVA O FLUXO. Regra do autor (2026-08-27): "o fluxo
 * pode continuar com Ainda não avaliado, porque ação bloqueada ≠ atendimento
 * bloqueado. Mas enquanto não estiver resolvido, o app deve manter um alerta
 * persistente." O médico avança; a cobrança vai junto.
 *
 * O AAS é o fármaco mais sensível ao tempo da síndrome coronariana e pode ser
 * administrado enquanto o ECG é obtido — um lembrete que se pode ignorar em
 * silêncio é pior que lembrete nenhum, porque dá a impressão de cobertura.
 */

export type EstadoDoAas =
  /** Registrado como administrado. */
  | "administrado"
  /** O médico decidiu não administrar agora — decisão registrada, não omissão. */
  | "nao_administrado"
  /** O app concluiu que não pode: alergia, sangramento ativo, dissecção. */
  | "contraindicado"
  /** Ninguém resolveu. É o único estado que cobra. */
  | "nao_avaliado";

/** Chave onde o motor espelha a execução do AAS. */
const AAS_REALIZADO = "__realizada_aas";

/**
 * As contraindicações objetivas do AAS, como predicado puro.
 *
 * Mesmo desenho de `nitrato-contraindicacao.ts`: a regra vive fora do veredito
 * para que o estado possa lê-la sem chamar o veredito — e sem duplicá-la.
 */
export function aasContraindicado(v: TreeValues): { presente: boolean; texto: string } {
  if (v.aas_alergia === "sim") {
    return { presente: true, texto: "Alergia verdadeira ao AAS — anafilaxia prévia." };
  }
  if (v.aas_sangramento === "sim") {
    return { presente: true, texto: "Sangramento ativo importante." };
  }
  return { presente: false, texto: "" };
}

/**
 * O estado do AAS. Função pura.
 *
 * ⚠️ A ORDEM IMPORTA: contraindicação vem ANTES de "administrado". Se o app
 * concluiu que não pode e alguém registrou execução mesmo assim, o estado que
 * descreve o caso é "contraindicado" — e o motor, aliás, recusa a execução no
 * vermelho, de modo que a combinação não deveria existir. Ela é tratada aqui
 * porque estado clínico não pode depender de nenhuma porta se comportar bem.
 */
export function estadoDoAas(v: TreeValues): EstadoDoAas {
  if (aasContraindicado(v).presente) return "contraindicado";
  if (v[AAS_REALIZADO]) return "administrado";
  if (v.aas_registro === "nao_administrado") return "nao_administrado";
  return "nao_avaliado";
}

/** O que a faixa recolhida diz sobre o AAS, em uma linha. */
export function resumoDoAas(v: TreeValues): { nivel: "verde" | "amarelo" | "vermelho" | "neutro"; texto: string } {
  const estado = estadoDoAas(v);
  if (estado === "administrado") return { nivel: "verde", texto: "administrado" };
  if (estado === "contraindicado") {
    return { nivel: "vermelho", texto: aasContraindicado(v).texto };
  }
  if (estado === "nao_administrado") return { nivel: "neutro", texto: "decidido não administrar" };
  // ⚠️ AMARELO, e é a única cobrança persistente do bloco.
  return { nivel: "amarelo", texto: "ainda não resolvido" };
}
