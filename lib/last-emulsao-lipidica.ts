/**
 * LAST — toxicidade sistêmica por anestésico local, e a emulsão lipídica.
 *
 * ── A D-29, E POR QUE ELA ERA PRIORIDADE ────────────────────────────────────
 *
 * `grep` por "emulsão lipídica", "Intralipid" e "LAST" no app inteiro retornava
 * ZERO. Num app de emergências mantido por anestesiologista, com módulo de
 * sedoanalgesia, de ISR e de parada — nenhum deles mencionava o antídoto da
 * complicação que a anestesia regional produz.
 *
 * É das poucas emergências em que o antídoto é ESPECÍFICO, TIME-CRITICAL e sem
 * substituto: nem adrenalina, nem RCP de alta qualidade, nem suporte prolongado
 * compensam a ausência.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-16) ──────────────────────────────────
 *
 *  · Neal JM, et al. "ASRA checklist for managing local anesthetic systemic
 *    toxicity" — artigo da versão 2017/2018 (Reg Anesth Pain Med
 *    2018;43:113–123 e o companion do checklist), PDF integral lido. Verbatim:
 *      "Consider administering lipid emulsion at the first sign of a serious
 *       LAST event";
 *      "Upper limit of lipid emulsion dosing […] Increased to 12 mL/kg with the
 *       caveat that smaller doses are the norm";
 *      "Precise volumes and rate of administration are not crucial";
 *      "Weight-based dosing only for patients < 70 kg"; "All patients > 70 kg
 *       receive a fixed bolus and infusion rate";
 *      "Reminder that prolonged resuscitation may require volumes of lipid
 *       emulsion approaching 1 L";
 *      "Resuscitation is different than standard advanced cardiac life
 *       support";
 *      "Alert cardiopulmonary bypass team — Moved higher on the checklist,
 *       coincident with calling for help";
 *      "Specific times are recommended for post event monitoring and are
 *       segregated based on severity of the event";
 *      "the use of lipid emulsion as an antidote for LAST is an off-label
 *       indication as defined by the US Food and Drug Administration".
 *
 *  · Revisão que reproduz o checklist ASRA 2020 (Curr Anesthesiol Rep), PDF
 *    integral lido. Verbatim:
 *      "In patients over 70 kg, recommended initial bolus is 100 ml over 2 to 3
 *       min and infusion of 200 to 250 ml over 15 to 20 min";
 *      "Recommendation for bolus dose in patients less than 70 kg is 1.5 ml/kg
 *       over 2 to 3 min and continuous infusion at 0.25 ml/kg/min";
 *      "The bolus can be repeated or infusion doubled if hemodynamic stability
 *       is not achieved";
 *      "Lipid infusion should be continued for about 10 min after the patient
 *       attains hemodynamic stability";
 *      "Maximum recommended initial dose of lipid is 12 ml/kg";
 *      "If the situation demands use of epinephrine, it is recommended in small
 *       doses, less than 1 μg/kg"; "Epinephrine in conventional doses has been
 *       shown to impair gas exchange and cardiac function in animals with LAST";
 *      "avoiding vasopressin, calcium channel blockers, and β-blockers";
 *      "Amiodarone is the preferred antiarrhythmic, and lidocaine is
 *       contraindicated in these situations";
 *      "Benzodiazepines are the first choice for seizure control […] Propofol
 *       can control seizures but could cause further deterioration in
 *       cardiovascular stability, hence avoided";
 *      "'slow' LAST […] can occur up to 30 min after injection";
 *      "LAST presentation typically occurs immediately after the injection of
 *       local anesthetic; however, recent data has shown that delayed
 *       presentation occurs even days after the injection";
 *      "Almost all cases of delayed onset of LAST in a recent review were
 *       reported in patients with continuous infusion";
 *      "atypical presentation of LAST occurred in about 40% of published
 *       cases"; toxicidade de SNC é a apresentação inicial em 68–77%.
 *
 *  · Sobre o propofol como sucedâneo: "The lipid content in propofol is too low
 *    to provide a benefit, while propofol is sufficiently cardio-depressant
 *    that its use is discouraged when there is a risk of progression to
 *    cardiovascular collapse."
 *
 * ⚠️ O QUE NÃO ABRIU: o GRÁFICO do checklist ASRA (a página pública é só o
 * anúncio; o PDF exige download). Por isso a janela de observação pós-evento
 * entra SEM NÚMERO — o artigo confirma que existem tempos específicos e que
 * eles são estratificados por gravidade, mas os valores estão na figura. Uma
 * segunda fonte (relato de caso) atribui à ASRA "12 to 24 hours"; como as duas
 * não batem e a primária não abriu, o app não escolhe (R-5).
 */

export const LAST_RECONHECER =
  "RECONHECER LAST — toxicidade sistêmica por anestésico local. O quadro clássico começa pelo SISTEMA NERVOSO: gosto metálico, zumbido, dormência perioral, agitação ou confusão, e depois convulsão; a toxicidade cardiovascular costuma vir DEPOIS da neurológica, com bradicardia, bloqueio, arritmia ventricular, hipotensão e assistolia. ⚠️ MAS NÃO CONTE COM O CLÁSSICO: cerca de 40% dos casos publicados tiveram apresentação ATÍPICA, e o colapso cardiovascular pode ser a primeira manifestação. Em toda deterioração súbita de paciente que recebeu anestésico local — bloqueio, infiltração, peridural, tumescente, tópico em mucosa —, LAST entra no diferencial ANTES de qualquer outra coisa.";

/**
 * ⚠️ O ATRASO — e por que ele importa mais do que parece.
 *
 * A sala de bloqueio é considerada segura assim que o bloqueio "deu certo": o
 * paciente conversa, o cirurgião entra, a atenção sai do paciente. É nesse
 * intervalo que o LAST lento aparece.
 */
export const LAST_NAO_E_SO_DURANTE_A_INJECAO =
  "⚠️ NÃO É SÓ DURANTE A INJEÇÃO. O quadro costuma começar logo após a injeção, mas o LAST \"lento\" — por dose alta, absorção excessiva, metabolismo reduzido ou menor ligação proteica — PODE APARECER ATÉ 30 MINUTOS DEPOIS, e há apresentações descritas DIAS após a injeção. O atraso é a regra em quem está com INFUSÃO CONTÍNUA de anestésico local (cateter perineural, peridural contínua, lidocaína IV para analgesia): quase todos os casos de início tardio de uma revisão recente estavam nesse cenário, por acúmulo de dose e por migração de cateter. CONSEQUÊNCIA PRÁTICA: o paciente cujo bloqueio \"deu certo\" não está fora de risco, e a monitorização não termina quando o bloqueio pega.";

/**
 * ⚠️ ACIONAR CIRCULAÇÃO EXTRACORPÓREA JUNTO COM O PEDIDO DE AJUDA.
 *
 * O próprio ASRA moveu esta linha para o topo do checklist — "coincident with
 * calling for help" — e a razão é logística: quem descobre tarde que precisa
 * não tem como montar a máquina a tempo.
 */
export const LAST_CHAMAR_AJUDA_E_CEC =
  "CHAME AJUDA E, NO MESMO MOMENTO, ACIONE A EQUIPE DE CIRCULAÇÃO EXTRACORPÓREA. Não é exagero nem etapa final: a ASRA moveu o aviso à equipe de CEC para o alto do checklist, junto com o pedido de ajuda, exatamente porque montar circulação extracorpórea leva tempo que não existe depois que o colapso se instalou. Acionar cedo e cancelar é barato; descobrir tarde que era necessário não tem conserto. Pegue o kit de LAST e a emulsão lipídica enquanto isso.";

export const LAST_RCP_E_DIFERENTE =
  "⚠️ A RESSUSCITAÇÃO NO LAST É DIFERENTE DO ACLS PADRÃO — a ASRA destaca isso no topo do checklist, com as modificações de dose. Além da emulsão lipídica, mudam a dose da adrenalina e a lista de fármacos a evitar. Se a parada por LAST for conduzida como ACLS de rotina, o tratamento que funciona não é dado e alguns dos que se daria pioram o quadro. E a RCP pode ser LONGA: mantenha, porque a recuperação depois de ressuscitação prolongada com emulsão está descrita.";

/**
 * A apresentação e o preparo (R-48) — porque a dose se prescreve em MILILITROS
 * de um frasco, e ninguém calcula miligramas de emulsão à beira do leito.
 */
export const LAST_EMULSAO_DOSE =
  "EMULSÃO LIPÍDICA 20% — APRESENTAÇÃO: frasco de 500 mL (também há 100 e 250 mL). A dose se prescreve em MILILITROS, direto do frasco, sem diluir. QUANDO: ao PRIMEIRO SINAL de evento grave de LAST — não se espera a parada. ACIMA DE 70 kg (dose FIXA, sem calcular): bolus de 100 mL em 2–3 min, seguido de infusão de 200–250 mL em 15–20 min. ABAIXO DE 70 kg (por peso): bolus de 1,5 mL/kg em 2–3 min, seguido de 0,25 mL/kg/min. SE NÃO ESTABILIZAR: repetir o bolus OU dobrar a infusão. DEPOIS DE ESTABILIZAR: manter a infusão por cerca de 10 minutos. TETO: 12 mL/kg como limite superior — com a ressalva da própria ASRA de que doses menores são a norma. ⚠️ Volume e velocidade exatos NÃO são cruciais — a ASRA simplificou o esquema justamente para que ninguém perca tempo calculando. Em ressuscitação prolongada, o volume total pode se aproximar de 1 LITRO: tenha mais de um frasco à mão.";

/**
 * ⚠️ AS DUAS RAZÕES DO PROPOFOL, SEPARADAS DE PROPÓSITO.
 *
 * O app já evita propofol na convulsão do LAST por instabilidade
 * cardiovascular. Este texto trata de OUTRA coisa: usá-lo como se fosse a
 * emulsão. É o atalho que a urgência produz — propofol é branco, é lipídico, e
 * costuma estar na sala quando o Intralipid não está.
 */
export const LAST_PROPOFOL_NAO_SUBSTITUI =
  "⚠️ PROPOFOL NÃO É EMULSÃO LIPÍDICA TERAPÊUTICA — e a confusão é previsível, porque ele é branco, tem veículo lipídico e costuma estar na sala quando o frasco de emulsão a 20% não está. NÃO SERVE, por duas razões INDEPENDENTES. (1) O conteúdo lipídico do propofol é baixo demais para produzir o efeito: para chegar perto da dose de lipídio necessária seria preciso infundir uma quantidade de propofol que é, ela própria, uma superdose — num paciente que já está em colapso cardiovascular. (2) O propofol é cardiodepressor, e o seu uso é desaconselhado quando há risco de progressão para colapso — que é exatamente a situação. ⚠️ ESTA RAZÃO É DIFERENTE DA DE EVITÁ-LO NA CONVULSÃO: lá o problema é a instabilidade hemodinâmica que ele agrava; aqui é que ele NÃO TRATA. Não confunda as duas — não use propofol como sucedâneo, em nenhuma dose.";

export const LAST_O_QUE_EVITAR =
  "⚠️ O QUE EVITAR NA PARADA POR LAST: VASOPRESSINA, BLOQUEADOR DE CANAL DE CÁLCIO e BETABLOQUEADOR — a ASRA os exclui explicitamente. E NÃO administrar mais ANESTÉSICO LOCAL: a LIDOCAÍNA é contraindicada aqui, ainda que seja antiarrítmico habitual em outros contextos. ADRENALINA: se for necessária, em DOSE PEQUENA, MENOR QUE 1 mcg/kg — a dose convencional do ACLS piora a troca gasosa e a função cardíaca no LAST, e prejudica a própria ressuscitação com lipídio. CONVULSÃO: benzodiazepínico é a primeira escolha; evita-se o propofol pela depressão cardiovascular, e, se a convulsão não ceder, pequenas doses de bloqueador neuromuscular evitam a hipóxia e a acidose que agravam tudo.";

/**
 * ⚠️ A COLISÃO DENTRO DO PRÓPRIO MÓDULO — e ela é real, não aparente.
 *
 * O nó de estabilização das Intoxicações diz, corretamente, para EVITAR
 * amiodarona na arritmia por cocaína, tricíclico e carbamazepina — porque esses
 * agentes bloqueiam o canal de sódio e a amiodarona também bloqueia.
 *
 * No LAST, a fonte diz o oposto: "Amiodarone is the preferred antiarrhythmic,
 * and lidocaine is contraindicated in these situations".
 *
 * Não é contradição: são toxinas diferentes. Mas quem leu a regra geral do
 * módulo e chega aqui vai hesitar exatamente no minuto em que não pode — por
 * isso a exceção é NOMEADA, com o motivo dos dois lados.
 */
export const LAST_AMIODARONA_E_A_EXCECAO =
  "⚠️ ATENÇÃO À REGRA QUE SE INVERTE AQUI: no LAST, a AMIODARONA é o antiarrítmico preferido, e a LIDOCAÍNA é contraindicada. É o oposto do que vale na intoxicação por cocaína, tricíclico e carbamazepina — lá se evita amiodarona porque o tóxico já bloqueia o canal de sódio e ela bloqueia também. Aqui o tóxico É o anestésico local: dar lidocaína é dar mais do veneno, e a amiodarona não pertence à classe que causou o quadro. Toxinas diferentes, condutas diferentes — não transporte a regra de uma para a outra.";

/**
 * A janela de observação — ausência declarada, e útil (R-13).
 * O que se sabe da fonte primária é que os tempos EXISTEM e são estratificados
 * por gravidade; os valores estão na figura do checklist, que não abriu.
 */
export const LAST_DEPOIS_QUE_ESTABILIZA =
  "DEPOIS DE ESTABILIZAR, A VIGILÂNCIA CONTINUA — e por horas, não por minutos: a recorrência depois da melhora está descrita, e o anestésico local continua sendo liberado do tecido. A ASRA recomenda tempos específicos de observação, ESTRATIFICADOS PELA GRAVIDADE do evento — evento cardiovascular exige mais que evento neurológico limitado. ⚠️ Este app NÃO fixa o número de horas: os valores estão no gráfico do checklist, que não foi aberto em sessão, e uma fonte secundária diz 12–24 h sem que se pudesse confirmar na primária. Consulte o checklist da ASRA do seu serviço para a janela, e no mínimo mantenha monitorização contínua e leito com capacidade de ressuscitação. Registre também que o uso da emulsão como antídoto é off-label pela FDA — o que não muda a indicação, e explica por que a bula do produto não a descreve.";

/** Versão curta, para as superfícies em que o LAST é ressalva e não conduta. */
export const LAST_PONTEIRO_CURTO =
  "⚠️ SE HOUVE ANESTÉSICO LOCAL, PENSE EM LAST: deterioração súbita — convulsão, arritmia, colapso — em quem recebeu bloqueio, peridural, infiltração ou anestésico tópico em mucosa. O antídoto é EMULSÃO LIPÍDICA 20% (acima de 70 kg: bolus de 100 mL em 2–3 min + 200–250 mL em 15–20 min; abaixo de 70 kg: 1,5 mL/kg + 0,25 mL/kg/min), e ele não tem substituto — propofol NÃO serve. Abra Intoxicações Exógenas para a conduta completa.";

/**
 * ── O GATILHO DO LAST NO CHOQUE — a porta que faltava ao caso TARDIO ────────
 *
 * ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17). O LAST tinha QUATRO portas, e as quatro
 * eram do caso imediato: o rótulo de entrada das Intoxicações diz "após
 * bloqueio/infiltração", o ponteiro do agente desconhecido, a linha do catálogo de
 * antídotos e as causas reversíveis da PCR.
 *
 * O paciente de UTI com cateter perineural ou peridural contínua que deteriora
 * HORAS depois não passa por nenhuma delas — e o módulo de Choque, que é onde ele
 * cai, não mencionava LAST nem anestésico local uma única vez em 31 nós.
 *
 * É o mesmo defeito da puérpera com crise: o conteúdo que descreve o caso existe,
 * e só é lido por quem JÁ entrou no lugar certo. Está escrito dentro do próprio
 * nó do LAST: «o paciente cujo bloqueio "deu certo" não está fora de risco».
 *
 * ── AS TRÊS COISAS QUE ESTE GATILHO PRECISA TER ────────────────────────────
 *
 * 1. O PADRÃO, não "colapso". O app descreve o quadro — prodrômo neurológico e
 *    depois BRADICARDIA, BLOQUEIO, ARRITMIA VENTRICULAR e assistolia. Gatilho que
 *    diz só "colapso" não ajuda a reconhecer, porque todo choque colapsa.
 *
 * 2. A JANELA, e ela é o ponto inteiro: "nas últimas HORAS", não "agora há
 *    pouco". Sem a janela, o gatilho vira a quinta porta do LAST imediato — que
 *    já tem quatro — e o tardio segue sem nenhuma.
 *
 * 3. ⚠️ O QUE PROCURAR QUANDO NÃO HÁ QUEM RESPONDER. Se o médico não sabe se o
 *    paciente recebeu anestésico local, ele pergunta a quem fez o procedimento —
 *    e se não houver ninguém, precisa saber o que olhar: CATETER, CURATIVO,
 *    BOMBA DE INFUSÃO. Um "não sei" sem o que procurar é um beco (I2).
 *
 * ⚠️ E O LAST NÃO É CHOQUE DISTRIBUTIVO: o colapso vem de BLOQUEIO DE CANAL DE
 * SÓDIO — depressão miocárdica e arritmia, não vasoplegia. Por isso o gatilho vai
 * ao nó de ENTRADA, antes de classificar o padrão.
 */
export const LAST_GATILHO_NO_CHOQUE =
  "⚠️ RECEBEU ANESTÉSICO LOCAL NAS ÚLTIMAS HORAS? PENSE EM LAST ANTES DE CLASSIFICAR O PADRÃO. Bloqueio, peridural, infiltração, tumescente, tópico em mucosa — ou cateter perineural, peridural contínua e lidocaína IV em INFUSÃO, em que o atraso é a REGRA e o quadro pode aparecer horas ou dias depois, por acúmulo de dose ou migração de cateter. O PADRÃO, e é ele que se reconhece: prodrômo neurológico (gosto metálico, zumbido, dormência perioral, agitação, convulsão) e depois BRADICARDIA, BLOQUEIO, ARRITMIA VENTRICULAR e hipotensão — mas em cerca de 40% dos casos o colapso é a PRIMEIRA manifestação. ⚠️ NÃO SABE SE RECEBEU? Pergunte a quem fez o procedimento e, se não houver ninguém, PROCURE NO PACIENTE: cateter perineural ou peridural, curativo de bloqueio, bomba de infusão correndo. O antídoto é EMULSÃO LIPÍDICA 20% e não tem substituto — a conduta completa está em Intoxicações Exógenas.";

/**
 * A frase EXTRA do nó distributivo — e ela existe porque a classificação já falhou.
 *
 * ⚠️ No `inicio` o gatilho pega ANTES de classificar. Aqui ele pega quem
 * classificou ERRADO, e por isso precisa dizer o que o outro não diz: que o LAST
 * não pertence a este ramo. Mesma família, razão diferente — e é a razão que
 * justifica as duas colocações (R-85).
 */
export const LAST_NAO_E_DISTRIBUTIVO =
  "⚠️ E SE O PACIENTE RECEBEU ANESTÉSICO LOCAL NAS ÚLTIMAS HORAS — inclusive cateter perineural, peridural contínua ou lidocaína IV em infusão —, ELE PROVAVELMENTE NÃO PERTENCE A ESTE RAMO: o colapso do LAST vem de BLOQUEIO DE CANAL DE SÓDIO — depressão miocárdica e arritmia —, e não de vasoplegia. Chegar aqui com LAST significa que a classificação errou antes, e insistir em volume e noradrenalina atrasa o único antídoto que funciona.";
