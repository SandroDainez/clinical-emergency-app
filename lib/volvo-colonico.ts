/**
 * Volvo colônico — o par sigmoide × cecal, que tem a MESMA palavra e a
 * conduta OPOSTA no primeiro passo.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O módulo listava as duas entidades no diferencial ("volvo de sigmoide, volvo
 * cecal") e trazia UMA conduta:
 *
 *     "Volvo de sigmoide: descompressão endoscópica seguida de cirurgia
 *      eletiva."
 *
 * Quem lê "volvo" e aplica a única linha que existe leva o CECAL para a
 * endoscopia. E a direção do erro é a pior possível: não é um exame inútil, é
 * o tempo que decide o caso sendo gasto num procedimento que quase nunca
 * funciona e que perfura.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-16) ──────────────────────────────────
 *
 *  · ASCRS — Management of Colonic Volvulus and Acute Colonic
 *    Pseudo-Obstruction (resumo de recomendações, Guideline Central):
 *      "Attempts at endoscopic reduction of cecal volvulus are generally not
 *       recommended." (1C)
 *      "Segmental resection is the preferred treatment for patients with cecal
 *       volvulus." (1C)
 *      "Patients without hemodynamic instability, peritonitis, or evidence of
 *       perforation should typically undergo lower endoscopy to assess sigmoid
 *       colon viability, detorse the anatomy, and decompress the colon." (1C)
 *      "Urgent sigmoid resection is indicated when endoscopic detorsion of the
 *       sigmoid colon fails and in cases of nonviable or perforated colon." (1C)
 *      "Operations without resection including detorsion alone, sigmoidopexy,
 *       and mesosigmoidoplasty are inferior to sigmoid colectomy for the
 *       prevention of recurrent volvulus." (2C)
 *  · ASGE — guideline sobre endoscopia em pseudo-obstrução e volvo colônico:
 *    a redução colonoscópica é bem-sucedida em 10–15% dos volvos cecais contra
 *    mais de 90% dos sigmoides, com risco maior de perfuração no cecal.
 *    ⚠️ O texto integral do ASGE NÃO ABRIU em sessão (403); os números acima
 *    vêm das sínteses indexadas, e por isso o texto do app os apresenta como
 *    ordem de grandeza, não como valor citado de tabela.
 */

/**
 * ⚠️ ESCRITO COMO PAR, e não como duas entradas separadas.
 *
 * Duas entradas distantes uma da outra não impedem a confusão — quem procura
 * "volvo" acha a primeira e para. O par força a leitura das duas, e nomeia o
 * erro nos dois sentidos.
 */
export const VOLVO_SIGMOIDE_VERSUS_CECAL =
  "⚠️ VOLVO: SIGMOIDE E CECAL TÊM A MESMA PALAVRA E O PRIMEIRO PASSO OPOSTO. SIGMOIDE — sem instabilidade, peritonite ou perfuração, a endoscopia baixa é a primeira linha: avalia a viabilidade, destorce e descomprime, e funciona em mais de 90%. CECAL — a redução endoscópica NÃO é recomendada (ASCRS): funciona em 10–15%, tem risco maior de perfuração, e o tempo gasto tentando é o tempo que o intestino não tem. O tratamento do volvo cecal é CIRÚRGICO, e a operação preferida é a RESSECÇÃO SEGMENTAR. ⚠️ ERRAR PARA UM LADO: levar o cecal para a colonoscopia atrasa a cirurgia num paciente que já está com alça sob tensão. ⚠️ ERRAR PARA O OUTRO: operar de imediato o sigmoide sem instabilidade nem peritonite troca um procedimento endoscópico eficaz por uma laparotomia de urgência.";

/**
 * O que o app não dizia sobre o sigmoide DEPOIS da descompressão — e que muda
 * a conversa com o cirurgião.
 */
export const VOLVO_SIGMOIDE_DEPOIS_DA_DESCOMPRESSAO =
  "DEPOIS DE DESCOMPRIMIR O SIGMOIDE, A CIRURGIA CONTINUA NA MESA: a descompressão resolve o episódio e não resolve a recidiva. A ASCRS registra que operações SEM ressecção — destorção isolada, sigmoidopexia, mesossigmoidoplastia — são inferiores à colectomia sigmoide para prevenir novo volvo, e que a ressecção urgente é indicada quando a descompressão FALHA ou quando o cólon está inviável ou perfurado. Ou seja: o que se programa não é \"uma cirurgia\", é a ressecção.";
