/**
 * Sulfato de magnésio no torsades — fonte única, e a separação COM PULSO ×
 * SEM PULSO, que o app não fazia.
 *
 * Havia QUATRO sítios escrevendo a mesma frase — "1–2 g IV (2 g se
 * instabilidade)" — em contextos clinicamente DIFERENTES: a árvore de
 * Taquicardia duas vezes (paciente com pulso), o card de Ritmos (TV polimórfica
 * SEM pulso, dentro do algoritmo de PCR) e a Farmacologia.
 *
 * ⚠️ O ACHADO NÃO É A DUPLICAÇÃO: É QUE OS QUATRO DIZIAM A MESMA COISA E OS
 * CENÁRIOS NÃO SÃO O MESMO (R-36 — mesmo número, construto diferente).
 *
 *  - SEM pulso: é PCR. O tempo é tudo e não há pressão para perder — 1–2 g em
 *    1–2 min, como qualquer fármaco de parada.
 *  - COM pulso: infundir rápido é o que pode matar. Magnésio vasodilata e
 *    freia o nó AV; no torsades você está tratando alguém que já pode estar
 *    instável, e a hipotensão que você provoca soma à que ele já tem.
 *
 * A FAIXA É FAIXA DE PROPÓSITO. A fonte diz "best given slowly (over 10–20
 * minutes), but in the unstable patient it is reasonable to give it as a slow
 * IV push" — e a tensão é real, não imprecisão: quanto mais instável o
 * paciente, MAIS motivo para correr (tempo) e MAIS motivo para ir devagar
 * (tolerância). A decisão volta para quem está lá, e por isso o texto carrega
 * a RAZÃO do limite: sem ela, "bolus lento" é lido como "empurre devagar", sem
 * referência de quanto.
 *
 * FONTES ABERTAS EM SESSÃO (2026-08-15):
 *  - StatPearls — Torsade de Pointes (NCBI Bookshelf NBK459388): "a slow 2 g IV
 *    push"; manutenção "1–4 g/hr ... to maintain magnesium levels above
 *    2 mmol/L", parar acima de 3 mmol/L; toxicidade grave > 3,5 mmol/L.
 *  - First10EM — Torsades de pointes: approach to resuscitation: carga de 2 g,
 *    "best given slowly (over 10–20 minutes), but in the unstable patient it is
 *    reasonable to give it as a slow IV push"; infusão de 1–4 g/h; vigiar
 *    reflexos, bradicardia e desconforto respiratório.
 *  - ⚠️ A diretriz AHA 2020 Part 3 (Adult ALS) NÃO foi aberta: o ahajournals
 *    devolveu HTTP 403 na sessão. As duas fontes acima convergem, e isso está
 *    declarado em vez de atribuído à AHA de memória (R-5).
 */

/** COM pulso — o cenário da árvore de Taquicardia. */
export const MAGNESIO_TORSADES_COM_PULSO =
  "SULFATO DE MAGNÉSIO — 2 g IV, infundidos em 10–20 min. Se o paciente estiver instável, é razoável dar em push LENTO: o tempo é o que se troca pela tolerância. ⚠️ POR QUE NÃO CORRER: magnésio vasodilata e freia o nó AV — infusão rápida causa hipotensão e bradicardia, e no torsades você está tratando alguém que já pode não ter pressão sobrando. Pode repetir 2 g uma vez se não houver efeito clínico.";

/** SEM pulso — é PCR, e o cálculo do tempo é outro. */
export const MAGNESIO_TORSADES_SEM_PULSO =
  "SULFATO DE MAGNÉSIO — 1–2 g IV/IO em 1–2 min. Aqui o paciente está em PARADA: não há pressão a proteger, e a ressalva de infusão lenta do torsades COM pulso não se aplica.";

export const MAGNESIO_TORSADES_MANUTENCAO =
  "DEPOIS DA CARGA, se o torsades recorrer: infusão de 1–4 g/h, com alvo de magnésio acima de 2 mmol/L. Reduzir acima de 2,5 mmol/L e SUSPENDER acima de 3 mmol/L — toxicidade grave (confusão, depressão respiratória, coma) aparece acima de 3,5. Vigiar reflexos, frequência cardíaca e padrão respiratório à beira do leito, que respondem antes do laboratório.";

/**
 * R-48 — o volume. A calculadora de Eletrólitos já sabia que 2 g são 4 mL da
 * apresentação a 50%; a árvore, onde a dose é ADMINISTRADA, não sabia.
 */
export const MAGNESIO_APRESENTACAO =
  "APRESENTAÇÃO: sulfato de magnésio 50% (500 mg/mL), ampola de 10 mL = 5 g. 2 g são 4 mL — a ampola inteira é MAIS que o dobro da dose. Diluir em 50–100 mL de SF ou SG5% para infundir.";
