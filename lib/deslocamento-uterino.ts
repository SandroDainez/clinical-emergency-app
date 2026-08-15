/**
 * Deslocamento uterino manual para a esquerda — o COMO.
 *
 * O módulo mandava a coisa certa ("manter de forma contínua, decúbito dorsal —
 * não inclinar a maca") e não dizia COMO FAZER. Busca por "uma mão", "duas
 * mãos", "lado", "uma pessoa": ZERO.
 *
 * É superfície de AÇÃO (R-48): quem nunca fez a manobra não a executa a partir
 * de "deslocar o útero para a esquerda" — e a manobra tem um jeito errado que
 * PIORA o que ela deveria corrigir.
 *
 * ── POR QUE MANUAL E NÃO INCLINAÇÃO — as três coisas que a maca degrada ─────
 *
 * A inclinação lateral era a prática antiga, e é fonte concorrente: quem
 * aprendeu assim vai fazer assim se o app não disser por que não (R-45).
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · NAEMSP — Maternal Cardiac Arrest: "One responder should be assigned
 *    exclusively to LUD, however this may be infeasible in small teams"; e
 *    "best accomplished by manual left uterine displacement rather than patient
 *    tilt, as tilting the patient may impair the quality of chest compressions,
 *    defibrillation pad placement, and airway interventions".
 *  · StatPearls (NIH) — Perimortem Cesarean Delivery: "manually pulling or
 *    pushing the uterus upwards and to the left"; e "resuscitative efforts,
 *    including manual left uterine displacement, should continue during the
 *    procedure".
 *  · AHA Scientific Statement, Cardiac Arrest in Pregnancy (Circulation 2015):
 *    técnica de UMA mão a partir da direita da paciente (empurrando) e de DUAS
 *    mãos a partir da esquerda (puxando), com o alerta de não deslocar o útero
 *    para baixo. ⚠️ Não consegui extrair o trecho verbatim — o PDF do
 *    ahajournals devolveu 403 e a versão em periódico secundário está
 *    comprimida. Está aqui pela convergência das descrições, e declarado (R-5).
 */

export const DESLOCAMENTO_UTERINO_COMO =
  "COMO DESLOCAR — o útero vai para CIMA e para a ESQUERDA, com a paciente em decúbito dorsal. Duas técnicas, escolha pelo lado em que você está: DE PÉ À DIREITA da paciente, UMA MÃO empurrando o útero para o lado oposto; DE PÉ À ESQUERDA, DUAS MÃOS puxando o útero na sua direção. ⚠️ NUNCA empurrar para BAIXO — comprime ainda mais a cava e a aorta, que é exatamente o que a manobra existe para aliviar.";

/**
 * A informação que muda a organização da equipe, e por isso é de superfície de
 * ação: alguém precisa ser DESIGNADO, ou a manobra para no primeiro momento em
 * que a pessoa que a fazia é chamada para outra coisa.
 */
export const DESLOCAMENTO_UTERINO_QUEM =
  "OCUPA UMA PESSOA, o tempo inteiro. Designe alguém EXCLUSIVAMENTE para isto — a manobra é contínua, e para no instante em que quem a faz é chamado para outra tarefa. Em equipe pequena pode ser inviável; nesse caso é a primeira coisa a delegar quando chegar reforço.";

/**
 * A hierarquia contra a prática antiga (R-45): não basta dizer "manual", é
 * preciso dizer POR QUE NÃO a inclinação — senão quem aprendeu a inclinar
 * entende que o app apenas preferiu outra coisa.
 */
export const DESLOCAMENTO_UTERINO_POR_QUE_NAO_INCLINAR =
  "⚠️ NÃO INCLINAR A MACA. A inclinação lateral era a prática antiga e degrada TRÊS coisas ao mesmo tempo: a qualidade da compressão torácica, o posicionamento das pás de desfibrilação e o manejo da via aérea. O deslocamento manual alivia a mesma compressão aortocava sem custo nenhum desses três.";
