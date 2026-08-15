/**
 * Causas reversíveis — o que se FAZ durante a parada, por fonte única.
 *
 * ── A DISTINÇÃO QUE ORGANIZA ESTE ARQUIVO ────────────────────────────────────
 *
 * Sete das dez causas têm módulo dedicado no app, e nenhuma apontava para ele.
 * Mas o ponteiro não serve para todas — a linha é CLÍNICA:
 *
 *   DURANTE a parada (executável à beira do leito, em segundos) → INLINE.
 *     Mandar navegar durante compressão é a decisão errada que já recusamos
 *     três vezes nesta auditoria (R-23: ressalva sem alternativa).
 *
 *   DEPOIS ou EM PARALELO (exige equipe, sala, exame, transporte) → PONTEIRO.
 *     Cabe navegar, porque a decisão já envolve mais gente que as mãos que
 *     comprimem.
 *
 * Este arquivo tem só o lado INLINE. Os ponteiros vivem no card, como texto.
 */

/**
 * HIPERCALEMIA — o card tinha a sequência e não tinha os números.
 *
 * Os dois sais estão aqui porque o módulo de Eletrólitos (auditado na Fase 1)
 * documenta que NÃO são intercambiáveis: 1 g de cloreto ≈ 3 g de gluconato em
 * cálcio elementar, e trocar 1:1 erra por ~3× em uma das direções. Um card que
 * dissesse só "cálcio" reproduziria o defeito que aquele módulo corrigiu.
 */
import { CALCIO_EQUIVALENCIA } from "./calcio-na-parada";

export const HIPERCALEMIA_NA_PARADA =
  "HIPERCALEMIA — a sequência tem TRÊS tempos e o primeiro é o que salva: (1) ESTABILIZAR A MEMBRANA com cálcio, e os dois sais NÃO são intercambiáveis — cloreto de cálcio 10% 10 mL IV (preferido na parada, mais cálcio elementar e via central se houver) OU gluconato de cálcio 10% 30 mL IV;" +
  " " + CALCIO_EQUIVALENCIA + " (2) DESLOCAR o potássio para dentro da célula: insulina regular 10 U IV + glicose 25 g, mais bicarbonato de sódio se houver acidose. (3) REMOVER: diálise, que é a única que tira potássio do corpo — as duas primeiras só ganham tempo. Doses e ajustes completos no módulo Eletrólitos.";

/**
 * PNEUMOTÓRAX HIPERTENSIVO — o card tinha um sítio, e faltava a variável que
 * decide o sucesso.
 *
 * O ATLS 2018 mudou a preferência do 2º EIC hemiclavicular para o 4º/5º EIC
 * na linha axilar anterior. Mas a literatura recente NÃO faz disso uma troca
 * simples: a parede torácica é mais espessa no 4º/5º em obesos, e no lado
 * ESQUERDO o 2º EIC é mais seguro pelo risco de lesão cardíaca.
 *
 * E o achado maior é outro: agulha de 4,5 cm FALHA em cerca de um terço dos
 * casos porque a parede excede esse comprimento em metade dos adultos. O card
 * não dizia comprimento nenhum — e é o comprimento, não o sítio, que
 * determina se o ar sai.
 */
export const PNEUMOTORAX_NA_PARADA =
  "PNEUMOTÓRAX HIPERTENSIVO — descompressão por agulha, e o COMPRIMENTO importa mais que o sítio: agulha de 4,5 cm falha em cerca de 1/3 dos adultos porque a parede torácica excede esse comprimento — usar cateter de pelo menos 7 cm quando disponível. SÍTIO: o ATLS 2018 passou a preferir o 4º/5º EIC na linha axilar anterior; o 2º EIC hemiclavicular segue válido e é a opção MAIS SEGURA À ESQUERDA, pelo risco de lesão cardíaca no sítio lateral. Em obeso, a parede é mais espessa no sítio lateral — ali o 2º EIC pode alcançar melhor. SE A AGULHA NÃO ALCANÇAR — e você saberá porque não sai ar nem há melhora — NÃO repita no mesmo sítio com a mesma agulha: ou troque por cateter mais longo, ou parta direto para a TORACOSTOMIA DIGITAL (incisão no 4º/5º EIC axilar anterior, divulsão romba e dedo na pleura), que é definitiva para o alívio e não depende de comprimento de agulha. Descomprimir é medida PONTE em qualquer via: o tratamento é o dreno torácico.";

/**
 * TAMPONAMENTO — pericardiocentese, com a via e o que a torna executável.
 */
export const TAMPONAMENTO_NA_PARADA =
  "TAMPONAMENTO CARDÍACO — pericardiocentese de emergência, de preferência GUIADA POR ULTRASSOM (subxifoide ou paraesternal, pela janela em que o derrame aparece maior e mais próximo). Sem ultrassom, via subxifoide às cegas, agulha em 45° apontada para o ombro esquerdo. Aspirar mesmo 20–50 mL já reverte a fisiologia — o objetivo é descomprimir, não drenar tudo. Se houver equipe cirúrgica, a toracotomia é definitiva; a punção é a ponte.";

/**
 * TEP — HÍBRIDO, e a parte inline não é a dose.
 *
 * O módulo de TEP tem os critérios e a dose. O que precisa viajar com a OPÇÃO
 * é o COMPROMISSO que ela cria: quem fibrinolisa está assumindo mais uma hora
 * de RCP. Sem isso no card, alguém lisa e para as compressões em 20 minutos —
 * e aí a intervenção não foi arriscada, foi desperdiçada.
 */
export const TEP_NA_PARADA_COMPROMISSO =
  "⚠️ TEP — SE FIBRINOLISAR, O COMPROMISSO É DE 60–90 MINUTOS DE RCP a partir da dose: o trombolítico precisa de tempo E de compressões para alcançar o trombo. Parar antes disso desperdiça a intervenção em vez de apenas arriscá-la. Decida sabendo o que a escolha custa em tempo de equipe. Critérios, dose e alternativas (embolectomia) no módulo TEP.";
