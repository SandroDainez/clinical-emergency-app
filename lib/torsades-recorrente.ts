/**
 * Torsades — as três pernas da conduta.
 *
 * ACHADO POR AUSÊNCIA (R-13). Busca no app inteiro por `isoproterenol`,
 * `overdrive` e `sobre-estimulação` retornava ZERO. O app tratava o EPISÓDIO
 * (magnésio) e não tinha nada sobre o paciente PARAR DE VOLTAR — que é o
 * problema clínico do torsades adquirido.
 *
 * Onde procurei antes de declarar ausência: os quatro sítios de magnésio, a
 * árvore de Bradicardia, o card de Ritmos, a Farmacologia e a árvore inteira da
 * Taquicardia.
 *
 * O torsades adquirido é PAUSA-DEPENDENTE e BRADICARDIA-DEPENDENTE: a arritmia
 * se instala no ciclo longo que segue uma pausa. Magnésio estabiliza a
 * membrana e encerra o episódio, mas não encurta o QT nem impede a próxima
 * pausa. Quem só dá magnésio trata o episódio e devolve o paciente ao mesmo
 * substrato.
 *
 * Por isso a conduta tem TRÊS PERNAS, e nenhuma sozinha fecha o ciclo:
 *   1. corrigir o episódio        → magnésio (lib/magnesio-torsades)
 *   2. impedir a recorrência      → acelerar o coração (esta lib)
 *   3. remover a causa            → suspender o agente e repor K⁺/Mg²⁺ (esta lib)
 *
 * Acelerar sem remover a causa é ponte sem destino: mantém o paciente enquanto
 * ninguém desliga o que prolongou o QT.
 *
 * FONTES ABERTAS EM SESSÃO (2026-08-15):
 *  - StatPearls — Torsade de Pointes (NCBI NBK459388): sobre-estimulação
 *    "recommended for both drug and chemical-induced torsades"; "ventricular
 *    rates of 90 to 110 bpm are usually sufficient ... occasionally rates up to
 *    140 bpm have been required"; isoproterenol "10 to 20 µg" IV ou infusão
 *    titulada para FC de 100 bpm, CONTRAINDICADO no QT longo congênito.
 *  - First10EM — Torsades de pointes: transvenoso preferido ao transcutâneo;
 *    isoproterenol a partir de 5 mcg/min, titulado 30 bpm acima do ritmo próprio.
 */

/**
 * R-6 — disponibilidade no Brasil verificada ANTES de escrever, e o resultado
 * inverteu a hierarquia do texto.
 *
 * Não foi localizado produto industrializado de isoprenalina/isoproterenol com
 * registro ativo no Brasil: o que se encontra são instruções técnicas de
 * FARMÁCIA DE MANIPULAÇÃO e as vias legais de importação para uso pessoal. A
 * consulta direta ao banco da ANVISA devolveu HTTP 403 na sessão, então isto é
 * evidência convergente, NÃO confirmação registral — e está escrito assim de
 * propósito.
 *
 * Consequência prática, que é o que o card precisa dizer: o marca-passo é a via
 * PRINCIPAL neste país, e o isoproterenol entra nomeado — porque aparece em
 * toda a literatura e alguém vai procurá-lo — com a indisponibilidade
 * declarada. Mesmo tratamento dado à fentolamina.
 */
export const TORSADES_ACELERAR =
  "PERNA 2 — IMPEDIR A RECORRÊNCIA: ACELERAR O CORAÇÃO. O torsades adquirido é pausa-dependente: encurtar o ciclo suprime o substrato. Alvo de 90–110 bpm (ocasionalmente até 140). MARCA-PASSO DE SOBRE-ESTIMULAÇÃO é a via principal — TRANSCUTÂNEO é o que está na sala de emergência e serve de ponte, mas é mal tolerado no paciente acordado e EXIGE analgesia e sedação para capturar de fato; TRANSVENOSO é o definitivo, e é para ele que se caminha, com o tempo e a equipe que ele exige. ⚠️ ISOPROTERENOL (5 mcg/min, titulado ~30 bpm acima do ritmo próprio) é a alternativa farmacológica da literatura, mas NÃO há produto industrializado com registro ativo no Brasil — encontra-se por manipulação ou importação, o que o inviabiliza na emergência. Conte com o marca-passo. E ele é CONTRAINDICADO no QT longo congênito.";

export const TORSADES_REMOVER_CAUSA =
  "PERNA 3 — REMOVER A CAUSA, que é o que fecha o ciclo. Torsades adquirido é quase sempre DROGA QUE PROLONGA O QT somada a DISTÚRBIO ELETROLÍTICO. SUSPENDER o agente agora: antiarrítmicos (classes IA e III — inclusive amiodarona), antipsicóticos (haloperidol IV, quetiapina), antidepressivos (citalopram, tricíclicos), macrolídeos e quinolonas, antieméticos (ondansetrona, domperidona), metadona, antifúngicos azólicos. REPOR agressivamente: K⁺ com alvo em 4,5–5,0 mEq/L, e magnésio mesmo com nível normal. Rever também bradicardia e BAV — se houver, são a pausa que dispara a arritmia.";

/**
 * Ponteiro, não cópia: as doses de potássio são do módulo de Eletrólitos, que
 * já as tem com via, velocidade e limites. Repetir aqui criaria o quinto sítio
 * de um número que tem dono.
 */
export const TORSADES_PONTEIRO_ELETROLITOS =
  "As doses de reposição de potássio e magnésio — via, velocidade máxima e limites por acesso — estão no módulo de Eletrólitos. Aqui vale o alvo: K⁺ em 4,5–5,0 mEq/L e magnésio reposto mesmo com nível normal.";
