/**
 * VIA AÉREA DIFÍCIL — os quatro domínios, e o que o app avaliava.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O nó `via_dificil` perguntava "Há preditores de via aérea/ventilação difícil
 * (LEMON / MOANS)?" com duas saídas: sim e não.
 *
 * ⚠️ TRÊS PROBLEMAS, e o autor apontou os dois primeiros:
 *
 * 1. LEMON e MOANS AVALIAM COISAS DIFERENTES e estavam fundidos numa pergunta
 *    só. O próprio nó escrevia a distinção na evidência e a apagava na hora de
 *    perguntar. LEMON positivo com MOANS negativo é laringoscopia difícil com
 *    resgate confiável; MOANS positivo é a REDE que é frágil, e isso muda a
 *    resposta a "posso induzir?".
 *
 * 2. O DEFAULT SOB DÚVIDA ERA O LADO PERIGOSO: quem hesita responde "não" (é o
 *    caminho de menor resistência) e o não leva à indução sem plano de resgate.
 *
 * 3. E O APP PREPARAVA O RESGATE SEM AVALIAR O RESGATE: manda abrir o kit de
 *    cricotireoidostomia e preparar máscara laríngea, e nunca perguntava se
 *    aquele pescoço é abordável nem se aquele dispositivo é viável. É a família
 *    do "afirma e não faz", aplicada ao plano de contingência.
 *
 * ── OS QUATRO DOMÍNIOS — a estrutura, e a fonte é a mais forte que abrimos ──
 *
 * StatPearls · Difficult Airway (NCBI Bookshelf NBK470224), aberto em sessão:
 *
 *   "Airway assessment should evaluate the risk of difficulty in 4 domains:
 *    mask ventilation, laryngoscopy and tracheal intubation, supraglottic
 *    airway use, and emergency front-of-neck access (eFONA)."
 *
 * São QUATRO, e o app cobria dois.
 *
 * ── OS ACRÔNIMOS, E POR QUE O APP NÃO ESCOLHE ENTRE ELES ────────────────────
 *
 * LEMON (laringoscopia) e MOANS (ventilação com máscara) já estavam no módulo.
 * Entram RODS (dispositivo extraglótico) e o eFONA.
 *
 * ⚠️ PARA O eFONA HÁ DUAS VERSÕES DO ACRÔNIMO, E ELAS DIVERGEM NO T:
 *
 *   SHORT — Surgery · Hematoma · Obesity · Radiation · Tumor      (ALiEM)
 *   SMART — Surgery · Mass · Access/Anatomy · Radiation · Trauma  (Anesthesia Key)
 *
 * As duas são FONTE SECUNDÁRIA (R-52), e os cinco fatores são os mesmos em
 * substância. O app NOMEIA OS FATORES e cita as duas siglas como família, em
 * vez de escolher uma e fingir que o acrônimo é o achado — fundir por
 * semelhança aparente é como nasceram outros defeitos desta auditoria.
 *
 * ── O QUE A FONTE NÃO SUSTENTA, E POR ISSO NÃO ESTÁ ESCRITO ─────────────────
 *
 * Nenhum limiar do tipo "com X fatores, não induza". O StatPearls diz que a via
 * aérea acordada "preserva ventilação espontânea e patência" quando há
 * "dificuldade anatômica grave e ventilação com máscara não confiável"; o
 * Anesthesia Key manda CONSIDERAR alternativas. A quarta saída deste guia diz
 * exatamente isso — considere acordada ou dupla preparação —, e não mais.
 */

/** Intro do guia — e o aviso de tamanho, que é do próprio desenho. */
export const VIA_AEREA_GUIA_INTRO =
  "Responda o que dá para OLHAR agora, com o paciente na sua frente. Não precisa saber o que cada achado significa — o app conclui no fim, e diz qual dos quatro planos muda. ⚠️ AS CINCO PRIMEIRAS SÃO AS QUE MAIS DECIDEM: se você tiver de parar no meio, pare depois delas. As seis últimas refinam e são opcionais — o app conclui sem elas.";

/* ── AS QUATRO SAÍDAS ─────────────────────────────────────────────────────── */

export const VIA_AEREA_LARINGOSCOPIA_DIFICIL =
  "LARINGOSCOPIA PREVISTA DIFÍCIL — e a rede de resgate está de pé. O que você tem a favor: se a primeira tentativa falhar, dá para ventilar com máscara e dá para usar o extraglótico, então há tempo. O que muda: videolaringoscópio como PRIMEIRA escolha (não como resgate), bougie na mão antes de começar, a melhor posição possível (orelha na altura do esterno; rampa no obeso), o operador mais experiente disponível na primeira tentativa — porque a primeira é a de maior chance — e o número de tentativas combinado em voz alta ANTES de induzir.";

export const VIA_AEREA_VENTILACAO_DIFICIL =
  "⚠️ O QUE ESTÁ FRÁGIL É A REDE, NÃO A INTUBAÇÃO — e isso é mais perigoso do que parece. Ventilação com máscara difícil (ou extraglótico difícil) significa que, se a laringoscopia falhar, o que sustenta o paciente entre a apneia e o tubo pode não funcionar. O que muda: pré-oxigenação obsessiva, com oxigênio nasal de alto fluxo mantido DURANTE a apneia; ventilação a quatro mãos com cânula orofaríngea desde já; escolher o extraglótico e o tamanho ANTES; e considerar seriamente manter a ventilação espontânea em vez de bloquear. Barba: considere lubrificar ou cobrir com filme. Desdentado: mantenha a dentadura para a máscara e retire para a laringoscopia.";

export const VIA_AEREA_AMBAS_DIFICEIS =
  "⚠️ INTUBAÇÃO DIFÍCIL COM RESGATE FRÁGIL — este é o cenário em que a indução deixa de ser rotina. Laringoscopia prevista difícil E ventilação/extraglótico previstos difíceis significam que a margem entre a apneia e o insucesso é curta. O que muda: ajuda experiente ANTES de induzir, não depois; pescoço marcado e kit de cricotireoidostomia aberto na mesa (não na gaveta); duplo preparo, com quem faz a via cirúrgica já posicionado; e a pergunta honesta sobre manter ventilação espontânea — via aérea acordada com anestesia tópica é opção, não fracasso.";

export const VIA_AEREA_PRECEDENCIA_EFONA =
  "⚠️ POR QUE ESTA SAÍDA VEM ANTES DAS OUTRAS TRÊS: laringoscopia difícil, ventilação difícil e extraglótico difícil mudam o PLANO — qual aparelho, quem você chama, como pré-oxigena. O acesso frontal do pescoço difícil muda a DECISÃO DE INDUZIR, porque ele é o resgate do resgate: é o que sobra quando tudo o mais falhou. Por isso ele não é mais uma saída entre quatro — ele é a que se lê primeiro.";

export const VIA_AEREA_EFONA_DIFICIL =
  "⚠️ O PLANO D TAMBÉM É DIFÍCIL — e isso se descobre ANTES de induzir, não durante. Você marcou fator que dificulta o acesso frontal do pescoço: cirurgia ou radioterapia prévias, massa ou tumor, hematoma, trauma local, obesidade com pescoço curto, ou cartilagens que você não consegue palpar. Se a cricotireoidostomia é o resgate do resgate, prever que ela será difícil muda a decisão de bloquear. O QUE FAZER: CONSIDERE via aérea acordada com anestesia tópica, ou dupla preparação com o cirurgião/otorrino presente e o pescoço já marcado e antissepsiado antes de qualquer droga. Ultrassom à beira do leito localiza a membrana cricotireóidea quando a palpação falha, e é mais confiável que a estimativa. ➜ Estes cinco fatores vêm de SHORT/SMART, acrônimos de ensino de via aérea (fonte secundária: ALiEM; Anesthesia Key) — os fatores são consistentes entre as versões, o acrônimo não.";

export const VIA_AEREA_SEM_PREDITOR =
  "SEM PREDITOR MARCADO NOS QUATRO DOMÍNIOS — e isso não é o mesmo que via aérea fácil. Quer dizer que você não encontrou o que se procura: laringoscopia, ventilação com máscara, extraglótico e acesso frontal do pescoço não mostraram sinal de alarme. A conduta segue o padrão, com a ressalva que vale sempre: pré-oxigenar bem, posicionar bem, ter o plano B ao alcance da mão e combinar em voz alta quem faz o quê se a primeira tentativa falhar. Preditor ausente reduz a probabilidade; não a zera.";

/**
 * ⚠️ E A LEITURA QUE PRECISA ACOMPANHAR O RESULTADO.
 *
 * O guia conclui por domínio, e a tentação é ler o resultado como um veredito
 * sobre o paciente. Ele é sobre o PLANO.
 */
/**
 * ⚠️ EM QUE A CONCLUSÃO SE APOIA — R-13 aplicado ao veredito do próprio app.
 *
 * As cinco primeiras perguntas são obrigatórias e as seis últimas opcionais, o
 * que é bom para o tempo (cinco toques, menos de um segundo medido) e perigoso
 * para a leitura: uma conclusão tirada de 5 respostas tem, na tela, a MESMA
 * APARÊNCIA de uma tirada de 11. A rapidez que se ganha vira excesso de
 * confiança se o app não disser sobre o que concluiu.
 */
export const VIA_AEREA_BASE_DA_CONCLUSAO =
  "⚠️ SOBRE O QUE ISTO FOI CONCLUÍDO: se você respondeu apenas as cinco perguntas principais, este resultado é TRIAGEM, não avaliação completa — as seis restantes (distância do queixo, mobilidade do pescoço, o que se vê da orofaringe, pulmão duro, barba/dentes, idade e ronco) refinam sobretudo a previsão de LARINGOSCOPIA e de VENTILAÇÃO COM MÁSCARA. Se houver tempo antes de induzir, volte e responda: o resultado pode mudar de saída. Se não houver, use este e trate-o como piso, não como teto.";

export const VIA_AEREA_COMO_LER =
  "COMO LER ESTE RESULTADO: ele não diz se a intubação vai dar certo — diz QUAL PLANO precisa mudar. Um domínio difícil não contraindica a sequência rápida; muda o preparo. Os quatro juntos é que deslocam a pergunta de \"como intubo\" para \"devo bloquear este paciente\". E nenhum preditor substitui reavaliar com o paciente na sua frente: a anatomia que você vê agora vale mais que qualquer acrônimo.";
