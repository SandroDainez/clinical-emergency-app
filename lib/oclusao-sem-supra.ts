/**
 * Padrões de ECG que mudam a conduta e NÃO são supra de ST clássico.
 *
 * ⚠️⚠️ ISTO NÃO É UMA LISTA DE SINÔNIMOS DE STEMI. ⚠️⚠️
 *
 * São QUATRO GRUPOS com QUATRO CONDUTAS DIFERENTES, e fundir dois deles produz
 * erro em direções OPOSTAS:
 *
 *   1. OCLUSÃO AGUDA em curso (De Winter, posterior isolado, T hiperaguda)
 *      → mesma urgência do STEMI: reperfusão indicada.
 *   2. aVR com infra difusa → tronco ou multiarterial: sala urgente,
 *      mas FIBRINÓLISE FORA.
 *   3. WELLENS → NÃO é oclusão: é reperfusão espontânea com estenose crítica
 *      de DA. Cateterismo precoce, e o erro clássico é o TESTE ERGOMÉTRICO.
 *   4. VD (V3R–V4R) → não reclassifica nada: é EXTENSÃO do inferior, e o que
 *      muda é que nitrato e morfina passam a ser CONTRAINDICADOS.
 *
 * Quem ler os quatro como "isto também é STEMI" vai TROMBOLISAR UM WELLENS sem
 * dor e NITRATAR UM VD. Os dois erros matam, e por mecanismos opostos.
 *
 * ── POR QUE O MÓDULO PRECISAVA DISTO ────────────────────────────────────────
 *
 * A árvore dizia: "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável)
 * até definição pela troponina". Correto para a maioria — e, sem os padrões
 * abaixo, manda tratar como NSTEMI um De Winter ou um posterior isolado, que
 * são oclusões agudas precisando de sala AGORA.
 *
 * Busca no módulo antes desta lib: De Winter 0 · Wellens 0 · aVR 0 · posterior
 * 0 · V7–V9 0 · V3R–V4R 0. Só o BRE novo com Sgarbossa existia.
 *
 * ── O ENQUADRAMENTO: OMI AINDA NÃO SUBSTITUIU, E ISSO VAI DECLARADO ─────────
 *
 * A ACC/AHA 2025 MANTÉM STEMI/NSTEMI. Ela incorpora PARTE do reconhecimento
 * alinhado ao OMI — avaliação posterior, derivações direitas, desênfase do
 * "BRE novo" —, mas não adota o arcabouço nem o perfil completo de padrões. As
 * diretrizes australianas de 2025 adotaram a nomenclatura OMI.
 *
 * O app usa a nomenclatura corrente e NOMEIA o OMI como enquadramento em
 * consolidação. Trocar a nomenclatura sem avisar deixaria o médico com um
 * vocabulário que a equipe ao lado dele não usa.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · JACC 2025 — ACS Management Guidelines: Tradition, Innovation, and the Gaps
 *    in Between; ACEP Now — The Reperfusion Guidelines Finally Catch Up: a
 *    diretriz reconhece que "the application of STEMI ECG criteria on a standard
 *    12-lead ECG alone will miss a significant minority of patients who have
 *    acute coronary occlusion".
 *  · Lista de equivalentes citada para 2025: "posterior STEMI, LBBB with
 *    Sgarbossa or Smith-modified Sgarbossa criteria, DeWinter sign, or
 *    hyperacute T waves". ⚠️ aVR NÃO está nela — daí o grupo separado.
 *  · De Winter (PMC12872277 e revisão em ScienceDirect): "1–3-mm upsloping
 *    ST-segment depression at the J-point in Leads V1–V6, followed by tall,
 *    positive, symmetrical T waves […] 1–2-mm ST-elevation in Lead aVR"; ~2% dos
 *    IAM anteriores extensos; VPP 95,2–100% para oclusão.
 *  · LITFL — Posterior MI: V7 na linha axilar posterior esquerda, V8 na ponta da
 *    escápula, V9 na região paravertebral, todas no plano de V6; "only 0.5 mm of
 *    ST elevation is required"; na tela padrão, infra horizontal V1–V3, R larga
 *    (> 30 ms), T positiva, R/S > 1 em V2.
 *  · LITFL — Wellens: tipo A bifásica (25%), tipo B profundamente invertida
 *    (75%), em V2–V3; "usually present in the pain free state"; R preservada,
 *    sem Q, marcadores normais ou pouco elevados; "may suffer MI or cardiac
 *    arrest if inappropriately stress tested".
 *  · LITFL e wikidoc — VD: V4R no 5º EIC direito, linha hemiclavicular;
 *    "suspect and look for RV infarction in all patients with inferior STEMI";
 *    "> 1 mm (leads V3R through V6R)" como critério, com V4R S 88% / E 78%;
 *    "> 0,5 mm" como achado de apoio; nitrato contraindicado, "severe
 *    hypotension in response to […] preload-reducing agents", volume na
 *    hipotensão.
 */

export const OCLUSAO_SEM_SUPRA_ABERTURA =
  "⚠️ AUSÊNCIA DE SUPRA NAS 12 DERIVAÇÕES PADRÃO NÃO EXCLUI OCLUSÃO. A própria diretriz de 2025 reconhece que o critério de supra na tela padrão PERDE uma minoria significativa de oclusões coronárias agudas. Os padrões abaixo são QUATRO GRUPOS COM QUATRO CONDUTAS — não são sinônimos de STEMI, e tratá-los como se fossem produz erro em direções opostas.";

/** GRUPO 1 — oclusão aguda em curso. Mesma urgência do STEMI. */
export const OCLUSAO_DE_WINTER =
  "DE WINTER — OCLUSÃO AGUDA, sala agora. Infra de ST ASCENDENTE de 1–3 mm no ponto J em V1–V6, seguida de ondas T ALTAS, POSITIVAS E SIMÉTRICAS; pode haver supra de 1–2 mm em aVR. Indica oclusão PROXIMAL DA DA — aparece em cerca de 2% dos infartos anteriores extensos e tem valor preditivo positivo de 95–100% para oclusão. Não espere o padrão virar supra: ele pode não virar.";

export const OCLUSAO_POSTERIOR =
  "POSTERIOR ISOLADO — OCLUSÃO AGUDA, e o mais traiçoeiro: na tela padrão parece isquemia subendocárdica. Suspeite quando V1–V3 mostrarem INFRA HORIZONTAL + onda R ALTA E LARGA (> 30 ms) + T POSITIVA, com R/S > 1 em V2. Confirme com as derivações posteriores.";

export const OCLUSAO_T_HIPERAGUDA =
  "T HIPERAGUDA — a fase MAIS PRECOCE da oclusão, e muitas vezes o ÚNICO achado. Não tem limiar em milímetros: o que a define é ser LARGA NA BASE, SIMÉTRICA e DESPROPORCIONAL ao QRS daquela derivação, agrupada no território de uma artéria. ⚠️ REPETIR O ECG É PARTE DA CONDUTA, não observação: o traçado seguinte pode já mostrar supra, e é por isso que um ECG normal em dor torácica ativa não encerra nada.";

/**
 * ⚠️ R-48 — a técnica das derivações posteriores, com o LIMIAR PRÓPRIO.
 *
 * O 0,5 mm é metade do critério padrão. Sem ele escrito junto, o médico aplica
 * o ≥ 1 mm que acabou de ler no nó do STEMI e DESCARTA UM INFARTO.
 */
export const DERIVACOES_POSTERIORES_COMO =
  "COMO FAZER V7–V8–V9: todas no MESMO PLANO HORIZONTAL DE V6 — V7 na linha axilar posterior esquerda, V8 na ponta da escápula esquerda, V9 na região paravertebral esquerda. Basta reposicionar V4–V6 e registrar. ⚠️ O LIMIAR AQUI É OUTRO: supra de apenas 0,5 mm em V7–V9 já fecha infarto posterior. Aplicar o ≥ 1 mm das derivações padrão nestas derivações descarta o diagnóstico que se foi procurar.";

/** GRUPO 2 — aVR: urgência de cateterismo, e a fibrinólise fica FORA. */
export const OCLUSAO_AVR_TRONCO =
  "SUPRA EM aVR COM INFRA DIFUSA (≥ 6 derivações) — sugere lesão de TRONCO da coronária esquerda ou doença MULTIARTERIAL grave. ⚠️ NÃO É EQUIVALENTE DE STEMI e NÃO É INDICAÇÃO DE FIBRINÓLISE: o padrão de 2025 não o lista entre os equivalentes, e quem precisa de revascularização cirúrgica não se beneficia de trombolítico. A conduta é CATETERISMO URGENTE com discussão cirúrgica, não lise.";

/** GRUPO 3 — Wellens: NÃO é oclusão, e a proibição vem com a razão. */
/**
 * ⚠️ O RÓTULO ABRE COM O QUE O DISTINGUE DOS OUTROS, e não com o padrão.
 *
 * Nos outros dez itens desta varredura o erro é DEIXAR DE FAZER — não reconhecer
 * a oclusão e mandar para a troponina. No Wellens é o contrário: o paciente está
 * sem dor, com marcadores normais e ECG "quase normal", e o erro clássico é
 * MANDAR PARA TESTE ERGOMÉTRICO alguém com estenose crítica de DA.
 *
 * Quem varre a lista lendo só os padrões trata o Wellens como mais um achado a
 * reconhecer. A frase de abertura existe para que ele leia primeiro o que muda a
 * conduta — porque aqui o risco não é a inação, é a ação.
 */
export const WELLENS_NAO_E_OCLUSAO =
  "WELLENS — O ÚNICO DESTA LISTA EM QUE O ERRO É FAZER ALGUMA COISA. ⚠️ NÃO É OCLUSÃO EM CURSO: é o padrão de REPERFUSÃO ESPONTÂNEA de uma estenose CRÍTICA da DA. Tipo A: T bifásica, positiva depois negativa (25% dos casos). Tipo B: T profunda e SIMETRICAMENTE invertida (75%). Em V2–V3, com R preservada, SEM ondas Q, e marcadores normais ou pouco elevados. O padrão aparece com o paciente SEM DOR — some ou se altera durante a dor.";

export const WELLENS_NUNCA_ERGOMETRICO =
  "⚠️ WELLENS: NUNCA TESTE ERGOMÉTRICO — E ESTA É A RAZÃO. O paciente está sem dor, com marcadores normais e um ECG que parece \"isquemia que já passou\": é exatamente essa APARÊNCIA DE ESTABILIDADE que faz alguém pedir o teste. Esses pacientes vão MAL com tratamento clínico e podem INFARTAR OU PARAR se estressados indevidamente — a DA crítica continua lá. A conduta é CATETERISMO PRECOCE, não estratificação não invasiva.";

/**
 * GRUPO 4 — VD: não reclassifica o ECG, muda a FARMACOLOGIA.
 *
 * Entra ao lado das contraindicações de nitrato e morfina que o módulo já
 * consome (lib/nitrato-contraindicacoes, lib/morfina-dispneia) — é onde ela
 * pertence, e não no nó de classificação do ECG.
 */
export const VD_QUANDO_PROCURAR =
  "INFARTO DE VD — procure em TODO infarto INFERIOR, sem exceção. Não é um diagnóstico diferente: é a EXTENSÃO do inferior para o ventrículo direito, e o que muda não é a reperfusão — é a farmacologia.";

export const VD_DERIVACOES_COMO =
  "COMO FAZER V3R–V4R: espelhe as precordiais para o lado direito do tórax — V4R vai no 5º espaço intercostal DIREITO, na linha hemiclavicular, e V3R entre V1 e V4R. CRITÉRIO: supra ≥ 1 mm em V3R–V6R fecha o diagnóstico (V4R isolada tem sensibilidade de 88% e especificidade de 78%); supra > 0,5 mm conta como achado de APOIO, mais sensível e menos específico. Na dúvida, com inferior + hipotensão, trate como VD.";

export const VD_CONTRAINDICA_PRE_CARGA =
  "⚠️ VD CONFIRMADO OU SUSPEITO: NITRATO E MORFINA ESTÃO CONTRAINDICADOS. O ventrículo direito infartado é DEPENDENTE DE PRÉ-CARGA — qualquer agente que a reduza causa HIPOTENSÃO GRAVE, e o nitrato sublingual dado por reflexo na dor torácica é o mecanismo mais comum. Se houver hipotensão, a conduta é VOLUME, não vasodilatador nem vasopressor de largada.";

/** O enquadramento em consolidação, nomeado sem substituir a nomenclatura. */
export const OMI_ENQUADRAMENTO =
  "SOBRE \"OMI/NOMI\": há um enquadramento em consolidação que classifica por OCLUSÃO (occlusion MI × non-occlusion MI) em vez de por supra de ST, porque o supra na tela padrão perde oclusões — é a lógica dos padrões acima. A ACC/AHA 2025 MANTÉM STEMI/NSTEMI e incorpora só parte desse reconhecimento; as diretrizes australianas de 2025 adotaram a nomenclatura OMI. O app usa a nomenclatura corrente de propósito: é a que a equipe ao seu lado fala.";

/**
 * ⚠️ A MOLDURA DO RAMO DE DÚVIDA — o único texto novo do ramo.
 *
 * Os cinco padrões já existiam; o que faltava era dizer o que fazer com a
 * hesitação, e que classificar como "sem supra" ANTES de procurá-los é o erro
 * que este ramo existe para evitar.
 */
export const ECG_DUVIDA_O_QUE_FAZER =
  "⚠️ NÃO CLASSIFIQUE COMO \"SEM SUPRA\" AINDA. Cinco padrões ocluem a coronária SEM elevar o ST nas 12 derivações padrão — e três deles são sala de hemodinâmica AGORA, não amanhã. Percorra os cinco abaixo antes de seguir pela via do NSTEMI: se qualquer um estiver presente, o caminho é REPERFUSÃO IMEDIATA e não estratificação por troponina. E lembre que dois deles só aparecem em derivações que ninguém colocou ainda — V7–V9 e V3R–V4R —, então \"não vi\" pode significar apenas \"não olhei\".";

/**
 * ── A SAÍDA DA VARREDURA — o que fazer com o que se achou (ou não) ──────────
 *
 * ⚠️ O DEFEITO QUE ORIGINOU (2026-08-17). O nó `ecg_sem_supra` é o destino do
 * "Não sei dizer" da pergunta do supra: quem chega DECLAROU que não sabe. Ele
 * lista cinco padrões — e não tinha OPÇÃO NENHUMA. Era `action` com
 * `next: "nste_trop"`.
 *
 * Consequência: o médico varria os cinco, reconhecia um De Winter — que é sala
 * AGORA — e o app o levava para a troponina do mesmo jeito. Varredura sem saída
 * é a mesma família do `vascular`: decisão não perguntada, só que na saída em vez
 * de na entrada.
 *
 * ── TRÊS SAÍDAS, e a terceira é a que faltaria ──────────────────────────────
 *
 * "Achei" e "não achei" são as óbvias. A terceira — NÃO TENHO CERTEZA — é a que
 * o desenho perde se ninguém a escrever, e é a MAIS provável aqui: quem chegou a
 * este nó já disse "não sei dizer" uma vez. Mandá-lo escolher entre achei e não
 * achei é obrigá-lo a mentir para seguir.
 *
 * ⚠️ E O DEFAULT DELA É ASSIMÉTRICO: repetir o ECG e seriar, troponina, e NÃO
 * liberar. A evolução do traçado é o que resolve, e é a única coisa que a dúvida
 * não impede de fazer.
 *
 * ── ⚠️ O INTERVALO DO ECG SERIADO NÃO É FIXADO POR ESTE APP ─────────────────
 *
 * As fontes abertas em sessão para este módulo (2026-08-15) não dão intervalo:
 * JACC 2025, ACEP Now, LITFL e as revisões do De Winter/Wellens/VD tratam de
 * RECONHECIMENTO, não de cadência de repetição. O app já dizia "REPETIR O ECG É
 * PARTE DA CONDUTA" sem número, e assim fica.
 *
 * Escrever "10–15 min" de memória seria inventar precisão que a fonte deste
 * módulo não sustenta (R-5). O que se afirma é o que não depende do número: que
 * se repete, que se seria, e que não se libera enquanto a dúvida existe.
 */
export const OCLUSAO_NAO_TENHO_CERTEZA =
  "⚠️ NA DÚVIDA, O TRAÇADO SEGUINTE É QUE RESOLVE — e duvidar não impede nenhuma das três coisas: REPETIR o ECG e SERIAR, colher TROPONINA, e NÃO LIBERAR o paciente. Um ECG normal ou duvidoso em dor torácica ATIVA não encerra nada, e a T hiperaguda é justamente a fase em que o traçado seguinte pode já mostrar supra. ⚠️ ESTE APP NÃO FIXA O INTERVALO da repetição: as fontes abertas para este módulo tratam de reconhecimento, não de cadência. Use o intervalo do protocolo do seu serviço — e, na ausência dele, repita ANTES do que a sua vontade de fechar o caso sugerir. Manter monitorização contínua enquanto isso.";

/**
 * O ramo do "ACHEI" — e ele precisa dizer que a conduta muda de lugar.
 *
 * ⚠️ Reconhecer um De Winter, um posterior isolado ou uma T hiperaguda tem a
 * MESMA urgência do STEMI: reperfusão indicada. Sem esta frase, o "sim" seria
 * apenas um botão que devolve o médico ao mesmo lugar.
 */
export const OCLUSAO_ACHEI_UM_PADRAO =
  "ACHOU UM DOS PADRÕES DE OCLUSÃO — a conduta passa a ser a do STEMI: reperfusão indicada, com a mesma urgência, e o relógio conta a partir de AGORA. ⚠️ DUAS RESSALVAS QUE MUDAM O QUE SE FAZ: no aVR com infra difusa a sala é urgente mas a FIBRINÓLISE ESTÁ FORA (é tronco ou multiarterial); e o WELLENS NÃO é oclusão em curso — nele o cateterismo é precoce e o erro clássico é mandar para teste ergométrico.";
