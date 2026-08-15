/**
 * Engasgo que virou parada — a particularidade da RCP, nos dois lados da rota.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O módulo de OVACE dizia "antes de cada ventilação, olhe a boca". Correto — e
 * existia SÓ ALI. Busca por "corpo estranho" e "boca" no reducer, nas notas de
 * fase, no protocol.json e na tela do ACLS: ZERO nos quatro.
 *
 * Quem entra na PCR pelo caminho do engasgo — que é exatamente o caminho em que
 * o corpo estranho AINDA ESTÁ LÁ — não recebia o lembrete. É R-48 na forma de
 * ROTA: o conteúdo estava na superfície de onde a pessoa SAIU, não naquela em
 * que ela está.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · AHA Newsroom — "Updated CPR guidelines tackle choking response" (2025):
 *    confirma a sequência do consciente ("alternating five back blows followed
 *    by five abdominal thrusts, until the object is expelled or the person
 *    becomes unresponsive"). NÃO trata do inconsciente.
 *  · Para o inconsciente, secundárias convergentes (CPR1, CPR Lifeline, EMS
 *    World/HMP): começa por compressões, 30:2 padrão, olhar a boca APÓS CADA
 *    30 COMPRESSÕES e antes das ventilações, nunca varredura às cegas.
 *  · ⚠️ R-52 aplicado ANTES de aceitar as secundárias: as três carregam a
 *    mudança de 2025 (golpes primeiro), então passam no teste de atualidade
 *    contra um número que MUDOU. Duas outras páginas de treinamento devolveram
 *    403 e ficaram de fora.
 *  · ⚠️ O texto integral no ahajournals devolveu HTTP 403, como em toda esta
 *    auditoria. Declarado em vez de atribuído de memória (R-5).
 *
 * ── UMA CORREÇÃO QUE A FONTE FEZ NO PLANO ───────────────────────────────────
 *
 * Eu ia escrever que se prioriza compressão PORQUE ela desloca o corpo
 * estranho. As fontes dizem que a pressão gerada PODE deslocar, mas a razão
 * declarada de priorizar é manter perfusão cerebral e coronária. Escrito como o
 * que é — possível benefício, não finalidade —, senão o app promete o que a
 * diretriz não promete.
 */

/**
 * ⚠️ "A RCP É A PADRÃO" vai escrito de propósito.
 *
 * Sem essa frase, um card que enumera uma particularidade convida a supor que
 * há outras — e alguém inventa variação de ritmo, de profundidade ou de relação
 * compressão:ventilação onde não existe nenhuma. A única diferença é olhar a
 * boca.
 */
export const OVACE_NA_PCR =
  "PARADA POR ENGASGO — A RCP É A PADRÃO: mesma profundidade, mesmo ritmo, mesma relação 30:2. Há UMA única diferença: APÓS CADA 30 COMPRESSÕES, ANTES das 2 ventilações, olhe dentro da boca e retire o objeto SOMENTE se estiver visível. ⚠️ NUNCA varredura digital às cegas — empurra o corpo estranho mais fundo. As compressões podem deslocar o objeto, mas não é para isso que se comprime: comprime-se para manter perfusão, e a boca se olha porque a via aérea pode ter mudado desde o último ciclo.";

/**
 * A causa reversível já está identificada — e o card diz isso mesmo quando a
 * pré-marcação funciona (ver a nota sobre a redundância deliberada em
 * `lib/module-session-navigation.ts`).
 */
export const OVACE_CAUSA_JA_IDENTIFICADA =
  "A CAUSA REVERSÍVEL JÁ ESTÁ IDENTIFICADA: esta é hipóxia por corpo estranho. Não gaste tempo procurando os 5 Hs e 5 Ts do zero — o app já marcou a hipóxia como SUSPEITA no painel de causas. ⚠️ Ela só passa a ABORDADA quando o objeto sair: enquanto ele estiver lá, a causa está identificada e NÃO resolvida. A mudança é manual, por desenho — o app não promove status sozinho.";
