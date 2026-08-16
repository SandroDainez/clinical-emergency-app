/**
 * Crise convulsiva na gestante e na puérpera — a exclusão de escopo que só
 * existia em comentário.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O cabeçalho de `seizure-decision-tree.ts` dizia, e diz bem:
 *
 *     ⚠️ ESCOPO: essa diretriz EXCLUI a população obstétrica. Crise em
 *     gestante com síndrome hipertensiva é o módulo de pré-eclâmpsia e
 *     eclâmpsia, onde o fármaco de primeira linha é o sulfato de magnésio.
 *
 * ⚠️ E ISSO ESTAVA EM COMENTÁRIO — invisível para quem usa. Na árvore não
 * havia ramo, ressalva nem ponteiro; a palavra "gestante" aparecia UMA vez na
 * tela, como contraindicação do valproato. O β-hCG é colhido na estabilização
 * e NADA no fluxo agia sobre ele.
 *
 * Registrado no METODO: exclusão de escopo escrita em comentário não exclui
 * nada. Comentário protege o autor de ter esquecido; não protege o paciente.
 *
 * ── AS TRÊS PRECISÕES QUE ESTE TEXTO PRECISA TER ───────────────────────────
 *
 * 1. NÃO É "MAGNÉSIO EM VEZ DE BENZODIAZEPÍNICO". A crise em curso se aborta
 *    com benzodiazepínico como qualquer outra. O magnésio é o que trata a
 *    ECLÂMPSIA e o que PREVINE A RECORRÊNCIA — ele é o que falta, não o que
 *    sobra. Escrever "o fármaco é o magnésio, não o benzo" faria alguém deixar
 *    de abortar uma crise ativa.
 *
 * 2. O GATILHO É GESTANTE **OU PUÉRPERA**. A eclâmpsia pós-parto é a que mais
 *    escapa, porque a pessoa já não está grávida e ninguém pensa nisso.
 *
 * 3. O PONTEIRO LEVANTA SUSPEITA, NÃO FECHA DIAGNÓSTICO. Gestante convulsiona
 *    por epilepsia prévia, hiponatremia, tóxico, trombose venosa cerebral.
 *    Afirmar eclâmpsia criaria o defeito inverso — a epiléptica grávida
 *    tratada como eclâmptica, sem investigar o que ela tem.
 *
 * ── A JANELA DO PÓS-PARTO, CONFERIDA EM FONTE (2026-08-16) ─────────────────
 *
 * O módulo de Eclâmpsia dizia "eclâmpsia pós-parto pode ocorrer até 48 h; se
 * > 48 h → investigar trombose de seio venoso cerebral" — lendo o 48 h como
 * FIM DO RISCO. A fonte diz outra coisa: 48 h é a fronteira entre pós-parto
 * PRECOCE e TARDIA, e a tardia existe.
 *
 *  · "Late postpartum eclampsia (LPE) can be distinguished from early onset
 *    postpartum eclampsia by an onset later than 48 hours after term."
 *  · Relatos de até 23 dias, e um caso descrito com 8 semanas.
 *  · "postpartum preeclampsia should be considered in women with new-onset
 *    hypertension 48 hours to 6 weeks after delivery."
 *
 * A correção da janela é do módulo de Eclâmpsia, que é o dono (R-12).
 * Investigar trombose de seio venoso continua certo — o que estava errado era
 * o "ou": além das 48 h investiga-se TAMBÉM a eclâmpsia tardia, não em vez.
 */

export const CRISE_GESTANTE_PUERPERA =
  "⚠️ GESTANTE OU PUÉRPERA COM CRISE — PENSE EM ECLÂMPSIA, E NÃO PARE DE FAZER O QUE JÁ ESTÁ FAZENDO. A crise em curso se aborta com BENZODIAZEPÍNICO, como qualquer outra: isso não muda. O que MUDA é que falta um fármaco — o SULFATO DE MAGNÉSIO, que trata a eclâmpsia e previne a recorrência, e que nenhum antiepiléptico substitui. São dois papéis diferentes: o benzodiazepínico ABORTA a crise; o magnésio TRATA A CAUSA e impede a próxima. ⚠️ PUÉRPERA CONTA, e é a que mais escapa — a pessoa já não está grávida e ninguém pensa nisso; a eclâmpsia pós-parto TARDIA, além das 48 h, está descrita até semanas depois do parto. ⚠️ E ISTO NÃO FECHA DIAGNÓSTICO: gestante e puérpera convulsionam também por epilepsia prévia, hiponatremia, intoxicação, trombose venosa cerebral e AVC. O que este aviso obriga é a EXCLUIR eclâmpsia — medir a pressão, procurar proteinúria, edema, cefaleia, escotomas e dor epigástrica — e não a assumir que é ela. Tratar epiléptica grávida como eclâmptica é o erro inverso, e ele também existe.";

/** Versão curta, para a linha de coleta onde o β-hCG aparece. */
export const BETA_HCG_TEM_CONSEQUENCIA =
  "⚠️ O β-hCG NÃO É SÓ PARA REGISTRO: se for positivo — ou se a paciente pariu nas últimas semanas —, a eclâmpsia entra no diferencial e o sulfato de magnésio entra na conduta, ao lado do benzodiazepínico e não no lugar dele.";

/**
 * ── PIRIDOXINA NA INTOXICAÇÃO POR ISONIAZIDA — fonte única ─────────────────
 *
 * Existia em `poisoning-decision-tree.ts` ("Isoniazida → Piridoxina (dose =
 * dose ingerida, ou 5 g)") e em lugar nenhum das Convulsões — que é onde o
 * paciente chega. R-48 pela distribuição, como o ajuste renal da enoxaparina
 * no TEP.
 *
 * ⚠️ É a crise que NÃO CEDE a benzodiazepínico nem a antiepiléptico, porque o
 * mecanismo é depleção de piridoxina (a isoniazida bloqueia a síntese de GABA).
 * Sem o antídoto, o paciente escala até o anestésico sem necessidade.
 */
export const PIRIDOXINA_ISONIAZIDA =
  "⚠️ CRISE QUE NÃO CEDE A NADA — PERGUNTE POR ISONIAZIDA. Na intoxicação por isoniazida (tuberculostático; tentativa de autoextermínio ou erro de dose), a crise é REFRATÁRIA a benzodiazepínico e a antiepiléptico, porque o mecanismo é depleção de piridoxina — a isoniazida bloqueia a síntese de GABA, e nenhum anticonvulsivante repõe o que falta. O antídoto é PIRIDOXINA (vitamina B6) IV, grama por grama da dose ingerida; se a dose for desconhecida, 5 g. Sem ela, o paciente escala até o anestésico sem necessidade — e volta a convulsionar quando o anestésico sai.";

/**
 * ── HIPONATREMIA — ponteiro, sem duplicar a dose ───────────────────────────
 *
 * A conduta (NaCl 3%, bolus de resgate, repetição na convulsão) tem dono: a
 * tela de correções eletrolíticas, que CALCULA o volume. Aqui vai o gatilho e
 * o encaminhamento — duplicar a dose criaria a divergência que a fonte única
 * existe para evitar.
 */
export const HIPONATREMIA_NA_CRISE =
  "⚠️ SÓDIO BAIXO — A CRISE QUE O ANTIEPILÉPTICO NÃO RESOLVE. Na crise por hiponatremia, o que trata é o SÓDIO: salina hipertônica a 3% em bolus de resgate, repetida conforme a reavaliação. Anticonvulsivante sozinho não corrige o gradiente osmótico que está causando a crise, e insistir nele enquanto o sódio segue baixo é escalar em vão. Suspeitar sobretudo em uso de tiazídico, polidipsia, pós-operatório com soro hipotônico, SIADH e maratonista. ⚠️ A dose e o volume estão nas CORREÇÕES ELETROLÍTICAS, que os calculam — abra lá em vez de estimar, e reavalie o sódio em 1–2 h ou antes se houver piora.";
