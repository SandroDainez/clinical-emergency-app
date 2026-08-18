/**
 * INJÚRIA RENAL AGUDA — o conteúdo do primeiro módulo NOVO desta auditoria.
 *
 * ── O ESCOPO, FECHADO ANTES DE UMA LINHA DE CONTEÚDO ────────────────────────
 *
 * Não havia defeito a medir: o módulo não existia. Então o método mudou — o
 * escopo foi decidido primeiro, e a fonte aberta só depois de fechado.
 *
 * O CENÁRIO, sob PD-5, não é o diagnóstico "insuficiência renal aguda": é
 * "a creatinina subiu ou o paciente parou de urinar — é o rim, o que faço
 * agora, e o que NÃO faço". Os dois juntos, porque chegam juntos.
 *
 * O QUE O MÓDULO CONSOME, e não reescreve (levantado antes de escrever):
 *
 *   hipercalemia         → Eletrólitos, que já tem os 12 distúrbios, o cálcio
 *                          por contexto (cloreto × gluconato), a
 *                          pseudo-hipercalemia e já aponta TRS. Está bom lá.
 *   ClCr / estágio KDIGO → calculadora `clearance-creatinina`, que já separa
 *                          Cockcroft-Gault ABSOLUTO de CKD-EPI indexado
 *   ajuste de antibiótico → calculadora `dose-antibiotico` + o piso dos nove
 *                          esquemas da sepse
 *   acidose              → fica nos contextos que a produzem
 *
 * E ele resolve duas coisas que não tinham dono: o estágio KDIGO nunca chegava
 * a um fluxo clínico (existia só dentro da calculadora), e a OBSTRUÇÃO URINÁRIA
 * estava ausente do app inteiro — zero menções a sonda vesical, globo ou
 * bexigoma nas 17 árvores.
 *
 * ── AS TRÊS EXCLUSÕES, DECLARADAS (molde do PD-4) ──────────────────────────
 *
 *   (a) A INDICAÇÃO DE DIÁLISE NÃO É DO APP. O módulo vai até "estas situações
 *       são motivo para acionar agora" — e diz o que fazer quando não há
 *       nefrologista, porque sob PD-5 o usuário pode estar num serviço sem um.
 *   (b) NEFROLOGIA NÃO AGUDA fica fora: glomerulonefrite, vasculite, síndrome
 *       nefrótica, biópsia, imunossupressão.
 *   (c) SÍNDROME HEPATORRENAL, NEFRITE INTERSTICIAL e SCA-RENAL são NOMEADAS e
 *       não desenvolvidas — mudam o que se procura, e o app declara que não as
 *       conduz.
 *
 * ── FONTE PRIMÁRIA ABERTA EM SESSÃO (2026-08-17) ────────────────────────────
 *
 * KDIGO Clinical Practice Guideline for Acute Kidney Injury, 2012 (PDF oficial
 * baixado e lido). Tabela 2, estadiamento; recomendações 2.1.2, 2.3.1, 5.1.1 e
 * 5.1.2.
 *
 * ⚠️ E EXISTE UMA REVISÃO EM CURSO, que este módulo NÃO usa como fonte de
 * conduta. O rascunho KDIGO 2026 para AKI e AKD (Public Review Draft, março de
 * 2026) declara de si mesmo: "This is a draft document shared for public review
 * and feedback only. The content of this draft will change based on the feedback
 * received and should not be used for any other purpose beyond its original
 * intent."
 *
 * Foi lido para responder à pergunta que alguém fará — "o app está velho?" —, e
 * o achado é que NÃO: os limiares de creatinina e de diurese do rascunho são
 * IDÊNTICOS aos de 2012. O que ele acrescenta é uma terceira dimensão,
 * biomarcador de dano (nomenclatura C1–C3 / U1–U3 / B0–B1), indisponível na
 * maioria dos serviços — razão para não construir o módulo sobre ela.
 */

/* ── 1 · OS DOIS EIXOS, E O CONTRASTE QUE NINGUÉM FAZ SOZINHO ───────────── */

/**
 * ⚠️ A FRASE MAIS IMPORTANTE DESTE MÓDULO, E A MENOS INTUITIVA.
 *
 * O app usa `< 0,5 mL/kg/h` em TRINTA nós — sepse, choque, EAP, TCE, TEP,
 * CAD/EHH, eclâmpsia — e em todos como META DE PERFUSÃO. Está correto assim.
 *
 * O mesmo número, SUSTENTADO por 6 a 12 horas, é o critério de diurese do
 * estágio 1 do KDIGO. É a mesma medida em dois papéis, e ninguém junta as duas
 * coisas sozinho — por isso o texto ensina o contraste em vez de só informar o
 * limiar. D-46 registra os 30 nós como dívida de acréscimo.
 */
export const IRA_DOIS_EIXOS = [
  "⚠️ O mesmo número que você persegue como meta é, se durar, o critério que diagnostica.",
  "Você já viu \"diurese ≥ 0,5 mL/kg/h\" como alvo de ressuscitação em sepse, choque e EAP.",
  "Menos de 0,5 mL/kg/h SUSTENTADO por 6 a 12 horas é injúria renal aguda estágio 1 pelo KDIGO, com creatinina normal e sem mais nada.",
  "⚠️ O estágio é o pior dos dois eixos, não a soma.",
  "Creatinina e diurese estadiam separadamente, e vale o mais grave.",
  "Um paciente anúrico há 12 horas já é estágio 3 — o mais alto — mesmo com creatinina intacta.",
  "➜ A creatinina leva horas a dias para subir, e a diurese cai agora.",
  "➜ É o contraste que quase ninguém junta sozinho.",
  "➜ Quem espera a creatinina para chamar de IRA perde o intervalo em que a causa ainda é reversível.",
];

export const IRA_ESTADIAMENTO_KDIGO = [
  "Estadiamento KDIGO 2012 — os dois eixos, lado a lado.",
  "Estágio 1 · creatinina 1,5 a 1,9 vezes a base, ou aumento de pelo menos 0,3 mg/dL.",
  "Estágio 1 · diurese abaixo de 0,5 mL/kg/h por 6 a 12 h.",
  "Estágio 2 · creatinina 2,0 a 2,9 vezes a base.",
  "Estágio 2 · diurese abaixo de 0,5 mL/kg/h por mais de 12 h.",
  "Estágio 3 · creatinina 3 vezes a base, ou creatinina acima de 4,0 mg/dL, ou início de terapia de substituição renal.",
  "Estágio 3 · diurese abaixo de 0,3 mL/kg/h por 24 h, ou anúria por 12 h.",
  "➜ O app tem calculadora de clearance em Calculadoras & Escores, e ela dá o estágio KDIGO pela creatinina.",
  "⚠️ Cuidado: a calculadora não conhece a sua diurese, então o estágio dela pode ser MENOR que o real.",
];

export const IRA_REVISAO_EM_CURSO = [
  "ⓘ Sobre \"KDIGO 2026\": existe revisão em curso da diretriz.",
  "Ela está em RASCUNHO de revisão pública, que declara de si mesmo não servir para outro uso.",
  "Os LIMIARES NÃO MUDAM — os números de creatinina e de diurese do rascunho são idênticos aos de 2012, que são os deste módulo.",
  "O que o rascunho acrescenta é um eixo novo — biomarcador de dano renal.",
  "➜ A maioria dos serviços não o tem disponível, e por isso este app não constrói nada sobre ele.",
];

/* ── 2 · A BASE DE CREATININA, E O CAMINHO DE QUEM NÃO A TEM ─────────────── */

/**
 * ⚠️ A SAÍDA DO "NÃO SEI" TEM CONTEÚDO PRÓPRIO, e o achado que a sustenta é
 * uma palavra da própria diretriz.
 *
 * A definição do KDIGO diz "1.5 times baseline **known or presumed** to have
 * occurred within the prior 7 days" e "increase in SCr by ≥0.3 mg/dl within 48
 * hours". Ou seja: a diretriz AUTORIZA presumir, e dá as duas janelas.
 *
 * Isso resolve o problema sem improvisar permissão: o app não está dando um
 * atalho, está usando a palavra da fonte. E o usuário geral frequentemente não
 * tem o histórico — a saída será comum, não excepcional.
 */
export const IRA_SEM_BASE_CONHECIDA =
  "NÃO SABER A CREATININA DE BASE É O CASO COMUM, E A PRÓPRIA DIRETRIZ RESOLVE: a definição do KDIGO fala de aumento \"conhecido OU PRESUMIDO\" nos últimos 7 dias — a palavra é dela, não uma licença deste app. ➜ AS DUAS JANELAS QUE A DEFINIÇÃO USA: aumento de 0,3 mg/dL em 48 HORAS, ou 1,5 vez a base em 7 DIAS. Sem exame anterior, presuma que a base era NORMAL para a idade e o sexo e trate como AGUDO até prova em contrário — é o erro mais seguro dos dois. ⚠️ MAS COM O VOLUME MAIS CAUTELOSO: se o rim já era doente e você não sabe, a prova de volume que ajudaria um pré-renal congestiona um crônico. Volume em alíquotas menores, reavaliando ausculta e oximetria entre elas, em vez de carga plena.";

export const IRA_SINAIS_DE_CRONICIDADE =
  "O QUE PROCURAR QUE SUGERE QUE O RIM JÁ ERA DOENTE — e nenhum destes exige exame anterior: RINS PEQUENOS ou com córtex fino ao ultrassom, e perda da relação córtex-medular (o rim agudo costuma estar de tamanho normal ou aumentado); ANEMIA normocítica sem sangramento que a explique; ALTERAÇÃO DO CÁLCIO E DO FÓSFORO — fósforo alto com cálcio baixo, que é doença mineral óssea e leva meses a anos para se instalar; e ⚠️ O SINAL MAIS ÚTIL DA BEIRA DO LEITO: o paciente estar POUCO SINTOMÁTICO apesar de um número que assusta. Creatinina de 4 num paciente lúcido, comendo e sem dispneia costuma ser crônica; a mesma creatinina de instalação aguda derruba a pessoa. ➜ Nenhum deles fecha o diagnóstico sozinho, e a soma de dois ou três muda o plano de volume.";

/* ── 3 · A OBSTRUÇÃO — PRIMEIRA NA ORDEM, PORQUE É A REVERSÍVEL ─────────── */

/**
 * ⚠️ E A PERGUNTA É PELO OBSERVÁVEL, NÃO PELA CLASSIFICAÇÃO.
 *
 * "É pré-renal, renal ou obstrutivo?" pede ao usuário a conclusão — o mesmo
 * defeito das toxidromes e dos padrões do abdome. Aqui se pergunta o que se vê,
 * e o app conclui.
 *
 * A obstrução vem primeiro por dois motivos: é a única reversível em MINUTOS, e
 * estava completamente ausente do app (zero menções a sonda vesical, globo ou
 * bexigoma nas 17 árvores).
 */
export const IRA_OBSTRUCAO_PRIMEIRO =
  "⚠️ ANTES DE PENSAR EM QUALQUER OUTRA CAUSA, DESCARTE A OBSTRUÇÃO — é a única que se reverte em MINUTOS, e a que mais se esquece. O QUE PROCURAR, e nada disto é exame: BEXIGA PALPÁVEL ou percutível acima da sínfise (globo vesical); JATO URINÁRIO fino, intermitente, ou sensação de não esvaziar; próstata aumentada, história de tumor pélvico, cirurgia abdominal ou pélvica prévia; USO DE ANTICOLINÉRGICO, opioide ou anti-histamínico nos últimos dias — retenção medicamentosa é comum e reversível; e SONDA JÁ PASSADA que não drena, ou drena pouco, o que NÃO exclui obstrução: a sonda pode estar dobrada, obstruída por coágulo, ou fora da bexiga.";

export const IRA_SONDA_E_DIAGNOSTICA =
  "➜ A SONDA VESICAL É BARATA, RÁPIDA E DIAGNÓSTICA — passe se houver qualquer suspeita, e não espere imagem para isso. Se sair volume grande, a obstrução era a causa e você acabou de tratá-la. ⚠️ E DUAS COISAS APÓS O ALÍVIO: pode haver DIURESE PÓS-OBSTRUTIVA — débito muito alto por horas, com perda de sódio, potássio e água —, e o paciente que estava anúrico passa a precisar de REPOSIÇÃO, não de restrição; monitorize débito, eletrólitos e volemia. E pode haver HEMATÚRIA por descompressão. ⚠️ SE A SONDA NÃO RESOLVE MAS A SUSPEITA PERMANECE, a obstrução pode estar ACIMA da bexiga (ureteres, pelve) — aí é ultrassom de vias urinárias procurando hidronefrose, e a desobstrução é urológica, não de sonda.";

/* ── 4 · PRÉ-RENAL E RENAL, PELO OBSERVÁVEL ──────────────────────────────── */

export const IRA_PRE_RENAL_OBSERVAVEL =
  "O QUE APONTA PARA HIPOPERFUSÃO (o rim está bem, o que falta é sangue chegando): perdas recentes claras — vômito, diarreia, sangramento, drenos, febre com sudorese, jejum prolongado; MUCOSAS SECAS, turgor reduzido, taquicardia, hipotensão postural; e A RESPOSTA A VOLUME, que é o teste mais direto — se o débito urinário sobe e a creatinina começa a cair depois de uma alíquota de cristaloide, a resposta está dada. ⚠️ CUIDADO COM DOIS CENÁRIOS QUE PARECEM HIPOVOLEMIA E NÃO SÃO: a insuficiência cardíaca descompensada e a cirrose com ascite têm rim hipoperfundido COM excesso de água no corpo — nesses, volume PIORA. Se há edema, estase jugular, crepitações ou ascite, a hipoperfusão é por débito ou por distribuição, e o volume não é a resposta.";

export const IRA_NEFROTOXICO_OBSERVAVEL =
  "O QUE APONTA PARA LESÃO DO PRÓPRIO RIM — e a primeira pergunta é sempre a EXPOSIÇÃO, porque é a única causa que se pode remover hoje: CONTRASTE IODADO nas últimas 48 a 72 h; AINE, incluindo o que o paciente toma sem contar que toma; IECA ou BRA, sobretudo com hipovolemia associada; AMINOGLICOSÍDEO, ANFOTERICINA, ACICLOVIR em bolus, e a combinação VANCOMICINA + PIPERACILINA-TAZOBACTAM, cuja nefrotoxicidade somada é maior que a de cada uma; QUIMIOTERÁPICOS e imunossupressores. E DOIS ACHADOS QUE MUDAM O QUE SE PROCURA: urina com sedimento ativo — hematúria com cilindros, proteinúria significativa — aponta doença glomerular; e RABDOMIÓLISE, com CPK muito alta, urina escura e história de imobilização, trauma, convulsão, esforço extremo ou estatina.";

export const IRA_O_QUE_NAO_CONDUZ =
  "⚠️ O QUE ESTE MÓDULO NOMEIA E NÃO CONDUZ, para você saber que existe e procurar quem sabe: SÍNDROME HEPATORRENAL (cirrose com ascite e creatinina subindo sem outra causa — o tratamento é específico e não é volume), NEFRITE INTERSTICIAL AGUDA (fármaco, com eosinofilia ou rash em parte dos casos), doença GLOMERULAR aguda (glomerulonefrite, vasculite), e SÍNDROME CARDIORRENAL. As quatro mudam o plano por inteiro, e nenhuma se conduz por fluxo de emergência — mas reconhecer que o caso não cabe nas três causas comuns já é a informação que faz chamar o nefrologista mais cedo.";

/* ── 5 · O QUE FAZER SEMPRE, E O QUE NÃO FAZER ──────────────────────────── */

export const IRA_FAZER_AGORA = [
  "Faça agora, e vale para qualquer causa.",
  "Meça a diurese de verdade — mL/kg/h exige peso e hora.",
  "➜ \"Urinou pouco\" não estadia nada.",
  "Suspenda o que é nefrotóxico e o que pode ser suspenso.",
  "Revise todas as doses por função renal.",
  "➜ O app tem calculadora para vancomicina, pip-tazo e meropeném; os outros são com bula ou farmacêutico.",
  "Trate a hipercalemia se houver — ela mata antes do rim.",
  "➜ O módulo de Eletrólitos tem a conduta completa, inclusive a escolha entre cloreto e gluconato de cálcio.",
  "Peça gasometria, eletrólitos, ureia, creatinina e urina tipo 1.",
  "Peça ultrassom de vias urinárias.",
  "⚠️ Registre a creatinina com hora — o que estadia é a TENDÊNCIA, não o valor isolado.",
];

export const IRA_NAO_FACA = [
  "O que não fazer — cada um destes é erro corrente.",
  "NÃO USE DIURÉTICO PARA \"melhorar o rim\".",
  "➜ Furosemida aumenta o débito urinário sem melhorar função nem desfecho.",
  "➜ Ela transforma um oligúrico em não oligúrico, com a mesma doença e menos volume.",
  "➜ Diurético trata sobrecarga de volume, que é outra indicação.",
  "NÃO USE DOPAMINA EM DOSE RENAL — não protege o rim e acrescenta arritmia.",
  "NÃO ESPERE A CREATININA para agir — ela sobe tarde.",
  "Não repita contraste sem reavaliar a indicação.",
  "⚠️ Não trate um número sem base: creatinina de 3 pode ser a normalidade daquele paciente.",
  "➜ Volume nele é dano, não cuidado.",
];

/* ── 6 · A FRONTEIRA DA DIÁLISE, E O QUE FAZER SEM NEFROLOGISTA ─────────── */

/**
 * ⚠️ A FONTE É MAIS MODESTA DO QUE UMA LISTA DE CINCO INDICAÇÕES.
 *
 * KDIGO 5.1.1 dá UMA categoria: "Initiate RRT emergently when life-threatening
 * changes in fluid, electrolyte, and acid-base balance exist." E 5.1.2 RECUSA
 * limiares: "Consider the broader clinical context […] and trends of laboratory
 * tests—rather than single BUN and creatinine thresholds alone."
 *
 * Então o texto escreve a CATEGORIA da diretriz desdobrada nos exemplos que a
 * compõem, e declara que a recusa do número é da fonte. Chamar isso de "as
 * cinco indicações do KDIGO" seria inventar precisão que ela nega — o mesmo
 * padrão do NIHSS sem ponto de corte.
 *
 * E é justamente porque a diretriz não dá número que o R-23 aperta: sem
 * alternativa, "chame o nefrologista" viraria beco.
 */
export const IRA_QUANDO_ACIONAR =
  "⚠️ QUANDO A CONVERSA SOBRE DIÁLISE PRECISA COMEÇAR AGORA — e o critério da diretriz é UMA categoria, não uma lista de números: alteração de VOLUME, ELETRÓLITO ou ÁCIDO-BASE que ameace a vida. Desdobrada no que você vê: HIPERCALEMIA refratária ao tratamento clínico, ou com alteração de ECG que não melhora; ACIDOSE grave que não responde; SOBRECARGA DE VOLUME com hipoxemia, sem resposta a diurético; SINAIS DE UREMIA — encefalopatia, pericardite, sangramento; e INTOXICAÇÃO POR SUBSTÂNCIA DIALISÁVEL (lítio, salicilato, metanol, etilenoglicol), que é a única em que a diálise é o tratamento do veneno e não do rim. ⚠️ A DIRETRIZ RECUSA EXPLICITAMENTE decidir por limiar isolado de ureia ou creatinina: manda pesar o contexto e a TENDÊNCIA. ➜ E ESTE APP NÃO ESCOLHE MODALIDADE, DOSE NEM MOMENTO — isso é de nefrologista e do serviço.";

export const IRA_SEM_NEFROLOGISTA =
  "➜ E SE NÃO HOUVER NEFROLOGISTA NO SEU SERVIÇO — que é a situação de muita gente: as mesmas situações acima disparam DUAS coisas ao mesmo tempo, não uma. PRIMEIRA: acione quem existe — clínico, intensivista, plantão a distância, telemedicina, o nefrologista de referência por telefone. A conversa não precisa do diagnóstico fechado; a dúvida já é motivo. SEGUNDA: ACIONE A TRANSFERÊNCIA EM PARALELO, não depois. Vaga com diálise costuma levar horas, e essas horas correm junto com o tratamento — pedir vaga não é desistir de tratar. ⚠️ E O QUE VOCÊ SUSTENTA ENQUANTO ISSO É O QUE ESTE APP SABE FAZER: hipercalemia pelo módulo de eletrólitos, acidose e oxigenação pelo suporte, volume pelo que a ausculta permitir, doses revistas pela função renal, e nefrotóxico suspenso. Nada disso espera a diálise, e é o que mantém o paciente vivo até ela.";
