/**
 * A AUDITORIA DE FORÇA ESTÁ NO MEIO — E O APP PRECISA DIZER ISSO.
 *
 * ── ⚠️ O DEFEITO QUE ESTE ARQUIVO EXISTE PARA IMPEDIR ──────────────────────
 *
 * O campo de força e fonte por conduta existe hoje em **1 módulo de 31**. Num
 * app onde alguns cards mostram selo e a maioria não, o usuário que compara lê a
 * diferença como se ela fosse informação clínica:
 *
 *   "este tem selo de recomendação formal, aquele não tem selo nenhum —
 *    então aquele deve ser consenso fraco."
 *
 * **É falso.** A ausência de selo não diz nada sobre a força da conduta: diz que
 * aquele módulo **ainda não foi auditado**. É exatamente a regra do piso de
 * universo (`scripts/lib/universo.cjs`), agora na cara do usuário em vez de no
 * relatório: **ausência de marca não é marca de ausência.**
 *
 * ── POR QUE ELE SOME SOZINHO ───────────────────────────────────────────────
 *
 * O aviso é derivado, não escrito à mão: quando todos os módulos tiverem sido
 * auditados, `auditoriaDeForcaIncompleta()` devolve `false` e o aviso desaparece
 * das telas sem que ninguém precise lembrar de apagá-lo. Uma dívida que depende
 * de alguém lembrar é uma dívida que fica.
 *
 * ⚠️ `MODULOS_COM_FORCA_DECLARADA` É CONFERIDA CONTRA O INSTRUMENTO. A trava
 * `valida-aviso-de-auditoria` exige que esta lista tenha o mesmo tamanho da lista
 * de árvores auditadas por `valida-forca-da-afirmacao`. Sem isso, alguém
 * "adiantaria" a lista aqui e o aviso sumiria antes da auditoria existir — que é
 * a forma silenciosa deste defeito voltar.
 */

/** Módulos cujas condutas declaram `procedencia` (força + fonte). */
// ⚠️ ESVAZIADA EM 2026-08-27 — o único módulo auditado por força de afirmação era
// `injuria-renal-aguda`, removido com a arquitetura clínica antiga, junto com o
// instrumento que o media (`scripts/valida-forca-da-afirmacao.cjs`). Sem quem
// meça, NADA está auditado: a lista fica vazia e o aviso aparece em todos os
// módulos. Declarar módulo aqui sem instrumento seria inventar auditoria.
export const MODULOS_COM_FORCA_DECLARADA: string[] = [];

/**
 * O texto, palavra por palavra como o autor o escreveu. Uma fonte só: o hub e a
 * página de produto mostram ESTA constante — duas cópias divergiriam, e a que
 * divergisse seria a que ninguém releu.
 */
export const AVISO_DE_AUDITORIA_PARCIAL =
  "A declaração de força e fonte por conduta está sendo aplicada módulo a módulo. Onde ela ainda não aparece, ausência de selo NÃO significa recomendação forte — significa que aquele módulo ainda não foi auditado.";

/** Devolve `true` enquanto houver módulo sem a declaração. */
export function auditoriaDeForcaIncompleta(totalDeModulos: number): boolean {
  return MODULOS_COM_FORCA_DECLARADA.length < totalDeModulos;
}

/**
 * "1 de 31" — o número aparece porque "está em andamento" sem número não mede nada.
 *
 * ⚠️ DEVOLVE OS DOIS NÚMEROS, NÃO A FRASE. Montar `${a} de ${b}` aqui produziria
 * uma frase de tela que nunca vira chave de dicionário — o usuário em espanhol a
 * leria em português. A prosa fica no componente, com `trf`. (D-19)
 */
export function progressoDaAuditoriaDeForca(totalDeModulos: number): [number, number] {
  return [MODULOS_COM_FORCA_DECLARADA.length, totalDeModulos];
}
