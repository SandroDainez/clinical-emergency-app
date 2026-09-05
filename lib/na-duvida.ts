/**
 * "NA DÚVIDA" — as regras que resolvem a hesitação onde ela já decide.
 *
 * ── O LEVANTAMENTO QUE ORIGINOU (2026-08-16) ────────────────────────────────
 *
 * O app tem 106 pontos de decisão e 15 saídas de dúvida, em três famílias:
 *
 *   A · "me guie pelos sinais" (9) — leva a um nó que colhe o que dá para
 *       observar e conclui sozinho. Serve a decisões de OBSERVAÇÃO.
 *   B · "não sei o que é isto" (3) — Abdome, EAP e Intoxicações: diz o que
 *       fazer agora, o que espera, e o que discrimina. Serve a JULGAMENTO.
 *   C · becos (2) — transições curtas que empurram adiante sem dizer o que
 *       fazer enquanto isso.
 *
 * Classificados os 106 por natureza: 38 de julgamento, 45 de observação, 23
 * factuais. Só o julgamento pede saída de dúvida — "não sei" em toda parte
 * vira ruído, e ruído faz a pessoa parar de ver os que importam.
 *
 * ── O CRITÉRIO DE ENTRADA, E ELE É DO AUTOR ─────────────────────────────────
 *
 * ⚠️ ENTRA ONDE O DEFAULT SOB DÚVIDA É O LADO PERIGOSO.
 *
 * O caso puro é a ISR: "há preditores de via aérea difícil?" com "sim" e "não".
 * Quem hesita responde NÃO, porque é o caminho de menor resistência — e o não
 * leva à indução sem plano de resgate. O mesmo vale para "há contraindicação?"
 * (hesitar vira "não há" → trombolisa), "succinilcolina contraindicada?"
 * (hesitar vira "não" → dá) e "a crise cessou?" (hesitar vira "sim" → para de
 * escalar).
 *
 * Onde o default sob dúvida é o lado SEGURO, a terceira opção acrescenta pouco.
 *
 * ── RAMO × REGRA ────────────────────────────────────────────────────────────
 *
 * ⚠️ NEM TODO "NÃO SEI" MERECE RAMO — alguns merecem REGRA.
 *
 *   RAMO  quando a dúvida ABRE TRABALHO: há uma lista para conferir, um exame
 *         para pedir, sinais para observar.
 *   REGRA quando a dúvida JÁ DECIDE: a resposta certa é que a hesitação em si
 *         é o achado. Aí abrir um passo custa segundos que não existem.
 *
 * Este arquivo tem as REGRAS. Cada uma diz a CONSEQUÊNCIA, não só a direção:
 * "na dúvida, rocurônio" é ordem; "na dúvida, rocurônio — succinilcolina em
 * hipercalemia não suspeitada é parada" é o que faz alguém obedecer sob pressão.
 *
 * Nenhuma delas depende de fonte nova: são COERÊNCIA INTERNA com o que o app já
 * decide. Todas foram conferidas contra a evidência do próprio nó — em nenhum
 * caso a regra aponta para destino diferente do critério objetivo.
 */

/* ── ISR ──────────────────────────────────────────────────────────────────── */

/**
 * ⚠️ AFORISMO DE ENSINO, NÃO ACHADO DE ESTUDO.
 *
 * A frase sobre a cricotireoidostomia precoce é máxima de ensino de via aérea,
 * e está aqui porque compete com o instinto de tentar mais uma vez (R-45) — que
 * é o comportamento que mata no CICO. Marcado explicitamente para que ninguém
 * procure a citação depois e conclua que o app inventou um dado.
 */
export const NA_DUVIDA_CICO =
  "⚠️ SE VOCÊ ESTÁ SE PERGUNTANDO SE AINDA OXIGENA, A RESPOSTA É NÃO. Trate como CICO e vá para a via aérea cirúrgica. Hesitar aqui custa os segundos que a dessaturação não devolve — e a tentativa a mais é o que transforma hipóxia em parada. Ninguém se arrependeu de uma cricotireoidostomia feita cedo demais; o inverso acontece (máxima de ensino de via aérea, não dado de estudo).";

export const NA_DUVIDA_INDUCAO =
  "⚠️ NA DÚVIDA SOBRE O PERFIL, INDUZA COMO INSTÁVEL — cetamina em dose reduzida ou etomidato, nunca propofol. O choque mascarado pela vasoconstrição some quando o indutor tira o tônus simpático: a pressão cai DEPOIS da droga, e aí você tem uma via aérea aberta num paciente hipotenso. Dose menor num estável adia a intubação por segundos; dose plena num instável faz parada pós-indução.";

export const NA_DUVIDA_BLOQUEADOR =
  "⚠️ NA DÚVIDA, ROCURÔNIO. Succinilcolina em hipercalemia não suspeitada é PARADA CARDÍACA na indução — e as situações de risco são justamente as que ninguém confirma na emergência: imobilização há mais de 48–72 h, queimadura, esmagamento, distrofia não diagnosticada. O rocurônio custa bloqueio mais longo, e o plano de resgate já está pronto.";

/* ── CONVULSÕES ───────────────────────────────────────────────────────────── */

export const NA_DUVIDA_CRISE_CESSOU =
  "⚠️ MOVIMENTO AMBÍGUO NÃO É CRISE CESSADA. Na dúvida, trate como PERSISTE e escale. O que engana é a crise que perde a manifestação motora e continua no EEG: o paciente \"acalma\", a equipe respira aliviada, e o cérebro segue convulsionando. Escalar sem necessidade custa uma dose; não escalar custa neurônio por minuto.";

export const NA_DUVIDA_CONSCIENCIA =
  "⚠️ CONSCIÊNCIA FLUTUANTE NÃO É RECUPERAÇÃO. Na dúvida, trate como NÃO RECUPEROU e peça EEG. O pós-ictal melhora progressivamente; o estado de mal não convulsivo oscila e não melhora. Se você ainda está em dúvida 30 minutos depois, isso já é o achado.";

/* ── ANAFILAXIA ───────────────────────────────────────────────────────────── */

/**
 * ⚠️ O CUSTO DE DAR ADRENALINA SEM PRECISAR EXISTE — e a assimetria continua.
 *
 * A redação anterior dizia que a adrenalina IM "causa palpitação e ansiedade",
 * o que é verdade na maioria e SUBESTIMA no idoso com coronariopatia. Não há
 * contraindicação absoluta à adrenalina na anafilaxia, e a assimetria é real —
 * mas o app fala com usuário inexperiente e não pode sugerir que a droga é
 * inócua. Decisão do autor: dizer que o custo existe e é aceitável, sem inflar
 * nem minimizar.
 */
export const NA_DUVIDA_ANAFILAXIA_DIAGNOSTICO =
  "⚠️ NA DÚVIDA, TRATE COMO ANAFILAXIA E DÊ ADRENALINA IM. Os critérios existem para reconhecer, não para adiar. O custo de dar sem precisar EXISTE — taquicardia, palpitação, e no coronariopata idoso pode ser isquemia — e é aceitável, porque não há contraindicação absoluta à adrenalina na anafilaxia. O custo de não dar quando precisava é a PARADA, e o atraso da primeira dose é o fator mais consistentemente associado à morte.";

export const NA_DUVIDA_ANAFILAXIA_RESPOSTA =
  "⚠️ NA DÚVIDA SOBRE A RESPOSTA, TRATE COMO PIORA — repita a adrenalina IM e reavalie em 5 min. A anafilaxia bifásica melhora ANTES de voltar, e \"parece que melhorou\" é a leitura que precede a recaída. Repetir a dose tem custo conhecido e pequeno; considerar melhora quem está progredindo perde a janela em que a IM ainda resolve sozinha.";

/* ── EAP · ECLÂMPSIA · POLITRAUMA · TEP · ABDOME ──────────────────────────── */

export const NA_DUVIDA_EAP_RESPOSTA =
  "⚠️ RESPOSTA PARCIAL É RESPOSTA INADEQUADA. Na dúvida, trate como REFRATÁRIO e escale. Diurese abaixo de 0,5 mL/kg/h após a furosemida já é resposta inadequada por critério — e o paciente que \"melhorou um pouco\" e parou de melhorar é exatamente o que chega exausto à intubação.";

export const NA_DUVIDA_ECLAMPSIA =
  "⚠️ NA DÚVIDA ENTRE PE COM E SEM CRITÉRIOS DE GRAVIDADE, TRATE COMO GRAVE E SULFATE. O sulfato de magnésio previne a convulsão que ainda não aconteceu, e depois dela o desfecho é outro. Sulfatar quem não precisava exige a vigilância da tríade — reflexo, frequência respiratória e diurese —, que este módulo ensina e que o gluconato de cálcio cobre; não sulfatar quem precisava é eclâmpsia.";

export const NA_DUVIDA_POLITRAUMA_FONTE =
  "⚠️ RESPOSTA TRANSITÓRIA É NÃO-RESPOSTA. Na dúvida se ele estabilizou, trate como sangramento ativo e vá para o controle da fonte. O respondedor transitório é justamente quem PARECE estável na hora de decidir e descompensa dentro do aparelho de tomografia — e instável não vai para a tomografia.";

export const NA_DUVIDA_TEP_RISCO =
  "⚠️ NA DÚVIDA, NÃO USE A SAÍDA DE BAIXO RISCO/ALTA. Sem dados suficientes para sustentar categoria B e elegibilidade ambulatorial, mantenha o paciente internado e complete a estratificação AHA/ACC 2026 — escore de gravidade, função de VD e biomarcadores — para então definir C1, C2 ou C3 quando aplicável. Mandar para casa antes de fechar essa estratificação é o erro irreversível; internar enquanto esclarece preserva a margem de segurança.";

/**
 * ⚠️ A SAÍDA DE DÚVIDA JÁ EXISTIA DENTRO DO ENUNCIADO — e ninguém via.
 *
 * A pergunta do nó é "Há indicação cirúrgica, deterioração ou DIAGNÓSTICO
 * INDEFINIDO com dor persistente?". A dúvida já era critério de SIM, e quem lê
 * "indicação cirúrgica" e para de ler responde "não".
 *
 * Registrado como caso: às vezes a saída de dúvida não precisa ser criada, só
 * TORNADA VISÍVEL — e é a forma mais barata de resolver. Provavelmente há
 * outras: a varredura por enunciados que já contêm a incerteza como critério
 * ainda não foi feita.
 */
export const NA_DUVIDA_ABDOME_REAVALIAR =
  "⚠️ SE VOCÊ ESTÁ EM DÚVIDA, ISSO JÁ É \"DIAGNÓSTICO INDEFINIDO\" — que é critério de SIM nesta mesma pergunta. Dor abdominal persistente sem diagnóstico não se observa em casa: reavalia-se, com hora marcada e com a cirurgia ciente do caso.";
