/**
 * Broncoespasmo NA ANAFILAXIA — primeira linha e adjuvante refratário.
 *
 * ── POR QUE O NOME MUDOU (R-42) ──────────────────────────────────────────────
 *
 * Nasceu como `broncoespasmo-refratario.ts`, e o nome prometia mais do que o
 * conteúdo entregava em dois sentidos opostos:
 *
 *   1. O IPRATRÓPIO não é conduta de refratariedade — é PRIMEIRA LINHA no
 *      chiado da anafilaxia, junto do beta-2. Chamá-lo de adjuvante de resgate
 *      atrasa o que deveria ser imediato.
 *   2. Um nome genérico ("broncoespasmo refratário") se apresenta como a
 *      referência do assunto para QUALQUER doença — e o conteúdo é da
 *      anafilaxia, com uma parte emprestada da asma.
 *
 * ── A ORIGEM, E O ERRO DE CLASSIFICAÇÃO QUE ELA REVELOU ──────────────────────
 *
 * Este conteúdo foi movido do nó `dx_asma` da Insuficiência Respiratória para
 * a Anafilaxia, classificado como "defeito de alcance" — texto que já existia,
 * só precisando ser religado. **Não era.** Era relocação entre DOENÇAS: asma e
 * anafilaxia compartilham o sintoma (broncoespasmo) e não o mecanismo
 * (inflamação crônica exacerbada × degranulação mastocitária aguda).
 *
 * A verificação em fonte ABSOLVEU o conteúdo e condenou a classificação: as
 * duas condutas se sustentam na anafilaxia — mas por evidência própria, não
 * por herança da asma, e uma delas com a dose declaradamente emprestada.
 *
 * Fonte: StatPearls — Anaphylaxis (capítulo de manejo), que trata as duas em
 * contexto de anafilaxia.
 */

/**
 * PRIMEIRA LINHA — e a fonte é explícita em pôr o ipratrópio aqui, não no
 * resgate: *"inhaled beta-agonists is the first-line treatment for wheezing;
 * albuterol alone or as ipratropium bromide/albuterol"*.
 */
export const BRONCOESPASMO_PRIMEIRA_LINHA =
  "BRONCOESPASMO — PRIMEIRA LINHA INALATÓRIA: beta-2 (salbutamol) isolado OU em associação com IPRATRÓPIO. A associação NÃO é conduta de resgate: a fonte de anafilaxia põe o ipratrópio na primeira linha do chiado, ao lado do beta-2 — tratá-lo como adjuvante tardio atrasa o que deveria ser imediato.";

/**
 * REFRATÁRIO — e aqui a procedência precisa vir escrita.
 *
 * A fonte de anafilaxia INDICA o magnésio no chiado refratário e, para a dose,
 * remete explicitamente ao regime da asma grave: *"intravenous magnesium is
 * appropriate with dosage and treatment similar to severe asthma
 * exacerbations"*. Ou seja: a indicação é da anafilaxia; a dose é emprestada,
 * COM o aval da própria fonte. Escrever o número sem dizer de onde ele vem
 * seria apresentar como específico o que é declaradamente análogo (R-35/R-42).
 */
export const BRONCOESPASMO_MAGNESIO_REFRATARIO =
  "CHIADO REFRATÁRIO ao beta-2 e à adrenalina: SULFATO DE MAGNÉSIO IV — 2 g em 20 min no adulto. ⚠️ PROCEDÊNCIA DA DOSE: a indicação do magnésio no broncoespasmo refratário da anafilaxia é da própria literatura de anafilaxia, mas o REGIME é o da crise asmática grave — a fonte remete a ele em vez de definir dose própria. É analogia declarada, com aval da fonte, não número específico de anafilaxia.";

/**
 * O princípio que ordena os dois — e que é INFERÊNCIA CLÍNICA, não citação.
 *
 * A fonte trata a adrenalina como tratamento primário e os inalatórios como
 * secundários, mas NÃO enuncia "não substituem nem atrasam". A frase abaixo é
 * princípio clínico assumido como tal — declarado aqui para que ninguém a
 * atribua à fonte depois.
 */
export const BRONCOESPASMO_NAO_SUBSTITUI_ADRENALINA =
  "⚠️ NENHUM DESSES SUBSTITUI OU ATRASA A ADRENALINA. São o tratamento do broncoespasmo que persiste ao lado da adrenalina IM — nunca alternativa a ela. Broncoespasmo refratário em anafilaxia é indicação de REPETIR a adrenalina e preparar via aérea, não de escalar inalatório.";
