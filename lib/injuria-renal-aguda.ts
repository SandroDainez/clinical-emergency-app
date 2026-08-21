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
  // ⚠️ ERA VINHETA: "um paciente anúrico há 12 horas já é estágio 3". Descrever
  // gente inventada com achados que ninguém colheu é a forma mais fácil de
  // contrabandear pressuposição para dentro de texto que parece didático — quem
  // lê com o paciente na frente lê a vinheta como descrição dele. Reescrita por
  // VARIÁVEIS: mesma informação, sem sujeito.
  "Anúria de 12 horas já é estágio 3 — o mais alto — mesmo com creatinina intacta.",
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
/**
 * ⚠️ REPARTIDO EM 2026-08-18 (694 ch num item só). A conduta — presumir base
 * normal, tratar como agudo, volume em alíquotas menores — fica VISÍVEL; as
 * duas janelas da definição e a citação da diretriz vão para `porque`.
 */
/**
 * A ESCOLHA DO FLUIDO — e a ressalva vem COLADA, porque ela é a condição.
 *
 * KDIGO 2012, 3.1.1 (grau 2B), verbatim em
 * `protocols/fontes-verbatim/kdigo-2012-aki.md`:
 *
 *   "In the absence of hemorrhagic shock, we suggest using isotonic crystalloids
 *    rather than colloids (albumin or starches) as initial management for
 *    expansion of intravascular volume in patients at risk for AKI or with AKI."
 *
 * ⚠️ "NA AUSÊNCIA DE CHOQUE HEMORRÁGICO" NÃO É ORNAMENTO — é o que torna a frase
 * verdadeira. Separada, sobra "use cristaloide, não coloide", que num choque
 * hemorrágico é o conselho ERRADO. Mesmo tratamento da exceção do diurético: a
 * ressalva anda colada, num item só, e `valida-ira` conta o valor desta constante
 * na árvore — quem partir em duas linhas quebra a trava.
 */
export const PRE_RENAL_CRISTALOIDE =
  "⚠️ NA AUSÊNCIA DE CHOQUE HEMORRÁGICO, use CRISTALOIDE ISOTÔNICO — não coloide (albumina ou amido) — para expandir o intravascular (KDIGO 3.1.1, grau 2B).";

export const IRA_SEM_BASE_ACOES = [
  "Presuma que a base era NORMAL para a idade e o sexo, e trate como AGUDO até prova em contrário.",
  "Dê volume em alíquotas menores, não em carga plena.",
  "Reavalie ausculta e oximetria entre as alíquotas.",
];

/**
 * ⚠️ A ATRIBUIÇÃO À DIRETRIZ SAIU DAQUI EM 2026-08-21, E A CONDUTA FICOU.
 *
 * Este nó dizia, na tela, que "a própria diretriz resolve" e que a palavra
 * "presumido" era dela. **Ninguém verificou.** O repositório passou a ter o texto
 * VERBATIM da KDIGO 2012 (`protocols/fontes-verbatim/kdigo-2012-aki.md`), mas só
 * das três recomendações sobre diurético e dopamina — a basal desconhecida está
 * nas **Tabelas 8 e 9**, que não foram transcritas.
 *
 * Isso é "NÃO CONSEGUI OLHAR", não "não há". A diferença é a razão de a frase
 * sair: presumir base normal e tratar como agudo é **prática defensável**, e
 * continua na tela como nossa — o que não continua é dizer que uma diretriz
 * autoriza, sem ter lido a diretriz.
 *
 * ⚠️ ALVO NOMEADO DA PENDÊNCIA: KDIGO 2012, Tabelas 8 e 9. Quem transcrever
 * devolve a atribuição — e aí ela terá lastro.
 */
export const IRA_SEM_BASE_PORQUE = [
  "Não saber a creatinina de base é o caso COMUM, não a exceção — e o atendimento não pode parar por isso.",
  "⚠️ Presumir base normal é decisão NOSSA, defensável: não há aqui atribuição a diretriz nenhuma. A KDIGO 2012 trata basal desconhecida nas Tabelas 8 e 9, ainda não transcritas para este repositório.",
  "As duas janelas que a definição usa: aumento de 0,3 mg/dL em 48 horas, ou 1,5 vez a base em 7 dias.",
  "Presumir base normal é o erro mais seguro dos dois.",
  "⚠️ Mas se o rim já era doente e você não sabe, a prova de volume que ajudaria um pré-renal congestiona um crônico.",
];

/**
 * ⚠️ REPARTIDO EM 2026-08-18 (753 ch, e o item era COMPARTILHADO por dois nós —
 * `sem_base` e `cronico_agudizado`). É tudo CRITÉRIO: o que procurar para
 * suspeitar que o rim já era doente. Nada aqui é ação, então vai inteiro para
 * `porque` — e o que era ação (a soma muda o plano de volume) está no visível
 * dos dois nós.
 */
/**
 * ⚠️ AS PISTAS DE CRONICIDADE SAÍRAM DAQUI — VIRARAM PERGUNTA, NÃO SUMIRAM.
 *
 * Este bloco era um `porque` de três nós de ação, e afirmava sobre um paciente
 * que o app nunca examinou: "lúcido, comendo e sem dispneia", "anemia
 * normocítica", "rins pequenos ao ultrassom". Nada disso era perguntado em
 * caminho nenhum — e ele ainda abria com "nenhum destes exige exame anterior",
 * que é falso para três dos cinco.
 *
 * O conteúdo vive em `CAMPOS_DE_CRONICIDADE` (lib/descoberta-guiada-renal.ts),
 * como o ramo de descoberta de quem responde "não sei" à decisão de DRC prévia.
 * Cada pista agora diz o que é clínico e o que exige exame.
 */


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
/**
 * ⚠️ REPARTIDO EM 2026-08-18. Era UM item de 642 caracteres, e dentro dele
 * estava a PRECEDÊNCIA («descarte a obstrução antes de pensar em outra causa»)
 * misturada com a lista do que procurar. A precedência é conduta e fica
 * VISÍVEL; a lista é critério e vai para `porque`.
 */
export const IRA_OBSTRUCAO_ACOES = [
  "Descarte a obstrução ANTES de investigar qualquer outra causa.",
  "Passe a sonda vesical agora se houver QUALQUER suspeita — não espere imagem para isso.",
  "Meça o volume drenado: se sair volume grande, a obstrução era a causa e você acabou de tratá-la.",
];

export const IRA_OBSTRUCAO_PORQUE = [
  "É a única causa que se reverte em MINUTOS, e a que mais se esquece.",
  "O que procurar, e nada disto é exame: bexiga palpável ou percutível acima da sínfise (globo vesical).",
  "Jato urinário fino, intermitente, ou sensação de não esvaziar.",
  "Próstata aumentada, história de tumor pélvico, cirurgia abdominal ou pélvica prévia.",
  "Uso de anticolinérgico, opioide ou anti-histamínico nos últimos dias — retenção medicamentosa é comum e reversível.",
  "⚠️ Sonda já passada que não drena, ou drena pouco, NÃO exclui obstrução: ela pode estar dobrada, obstruída por coágulo, ou fora da bexiga.",
  "A sonda vesical é barata, rápida e diagnóstica.",
];

/**
 * ⚠️ CONDUTA QUE ESTAVA ENTERRADA no fim de um item de 704 caracteres —
 * exatamente o padrão que o médico mandou procurar. O que fazer DEPOIS do
 * alívio (monitorizar, repor em vez de restringir) e o que fazer quando a sonda
 * não resolve (ultrassom procurando hidronefrose) são AÇÕES, e ninguém as lia
 * no fim do parágrafo. Subiram para visível.
 */
export const IRA_APOS_ALIVIO_ACOES = [
  "Após o alívio, monitorize débito urinário, eletrólitos e volemia.",
  "REPONHA, não restrinja — o paciente que estava anúrico passa a perder água e eletrólito.",
  "Se a sonda não resolve e a suspeita permanece, peça ultrassom de vias urinárias procurando hidronefrose.",
];

export const IRA_APOS_ALIVIO_PORQUE = [
  "Pode haver diurese pós-obstrutiva — débito muito alto por horas, com perda de sódio, potássio e água.",
  "Pode haver hematúria por descompressão.",
  "Se a obstrução está ACIMA da bexiga (ureteres, pelve), a desobstrução é urológica, não de sonda.",
];


/* ── 4 · PRÉ-RENAL E RENAL, PELO OBSERVÁVEL ──────────────────────────────── */

/**
 * ⚠️ REPARTIDO EM 2026-08-18 (746 ch). O que é CRITÉRIO de hipoperfusão vai
 * para `porque`; o teste de volume e a ressalva dos dois cenários que parecem
 * hipovolemia e não são continuam VISÍVEIS — o segundo é conduta pela negativa
 * («volume PIORA»), e esconder isso trocaria escondido por perigoso.
 */
export const IRA_PRE_RENAL_ACOES = [
  "Dê uma alíquota de cristaloide e veja a resposta — é o teste mais direto.",
  "⚠️ Se há edema, estase jugular, crepitações ou ascite, NÃO dê volume — nesses o volume piora.",
];

export const IRA_PRE_RENAL_PORQUE = [
  "O rim está bem; o que falta é sangue chegando.",
  "Perdas recentes claras — vômito, diarreia, sangramento, drenos, febre com sudorese, jejum prolongado.",
  "Mucosas secas, turgor reduzido, taquicardia, hipotensão postural.",
  "A resposta está dada se o débito urinário sobe e a creatinina começa a cair depois da alíquota.",
  "⚠️ Dois cenários parecem hipovolemia e não são: insuficiência cardíaca descompensada e cirrose com ascite têm rim hipoperfundido COM excesso de água no corpo.",
  "Nesses, a hipoperfusão é por débito ou por distribuição, e o volume não é a resposta.",
];

/**
 * ⚠️ REPARTIDO EM 2026-08-18 (754 ch). A lista de exposições é CRITÉRIO e vai
 * para `porque`; o que sobe é a ação — perguntar pela exposição, que é a única
 * causa removível hoje.
 */
export const IRA_NEFROTOXICO_ACOES = [
  "Pergunte pela EXPOSIÇÃO antes de tudo — é a única causa que se pode remover hoje.",
  "Peça sedimento urinário: hematúria com cilindros ou proteinúria significativa aponta doença glomerular.",
  "Se há CPK muito alta e urina escura, trate como rabdomiólise.",
];

export const IRA_NEFROTOXICO_PORQUE = [
  "Contraste iodado nas últimas 48 a 72 h.",
  "AINE, incluindo o que o paciente toma sem contar que toma.",
  "IECA ou BRA, sobretudo com hipovolemia associada.",
  "Aminoglicosídeo, anfotericina, aciclovir em bolus.",
  "⚠️ A combinação vancomicina + piperacilina-tazobactam, cuja nefrotoxicidade somada é maior que a de cada uma.",
  "Quimioterápicos e imunossupressores.",
  "Rabdomiólise: história de imobilização, trauma, convulsão, esforço extremo ou estatina.",
];

/**
 * ⚠️ REPARTIDO EM 2026-08-18 (576 ch). É a declaração de escopo (molde do PD-4):
 * nomear sem conduzir. A AÇÃO — chamar o nefrologista mais cedo — sobe; as
 * quatro entidades nomeadas ficam no `porque`.
 */
export const IRA_O_QUE_NAO_CONDUZ_PORQUE = [
  "⚠️ O que este módulo nomeia e NÃO conduz, para você saber que existe e procurar quem sabe.",
  "Síndrome hepatorrenal — cirrose com ascite e creatinina subindo sem outra causa; o tratamento é específico e não é volume.",
  "Nefrite intersticial aguda — por fármaco, com eosinofilia ou rash em parte dos casos.",
  "Doença glomerular aguda — glomerulonefrite, vasculite.",
  "Síndrome cardiorrenal.",
  "As quatro mudam o plano por inteiro, e nenhuma se conduz por fluxo de emergência.",
];

/* ── 5 · O QUE FAZER SEMPRE, E O QUE NÃO FAZER ──────────────────────────── */



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
/**
 * ⚠️ REPARTIDO EM 2026-08-18. Eram DOIS itens de 833 e 841 caracteres — os
 * maiores do módulo. Dentro do segundo estava a lista do que SUSTENTAR
 * enquanto a diálise não vem, que é conduta pura e ninguém lia no fim de um
 * parágrafo: subiu para ação visível.
 */
export const IRA_ACIONAR_ACOES = [
  "Acione quem existe no seu serviço — clínico, intensivista, plantão a distância, telemedicina ou o nefrologista de referência por telefone.",
  "Acione a transferência EM PARALELO, não depois — vaga com diálise costuma levar horas.",
  "Enquanto isso, trate a hipercalemia pelo módulo de Eletrólitos.",
  "Sustente acidose e oxigenação pelo suporte, e o volume pelo que a ausculta permitir.",
  "Mantenha as doses revistas pela função renal e o nefrotóxico suspenso.",
];

/**
 * ⚠️ DUAS LINHAS SAÍRAM DAQUI EM 2026-08-21, E A RAZÃO NÃO É TAMANHO.
 *
 * Elas eram a KDIGO 5.1.1 ("o critério é UMA categoria: volume, eletrólito ou
 * ácido-base que ameace a vida") e a 5.1.2 ("a diretriz RECUSA decidir por limiar
 * isolado"). **As duas já estão SELADAS onde decidem** — a 5.1.1 em
 * `trata_acidose`, a 5.1.2 em `trata_uremia`, ambas com número e grau na tela.
 *
 * Aqui elas eram TERCEIRA e SEGUNDA cópia da mesma afirmação, recolhidas e sem
 * selo. Isso não é afirmação escondida: é **afirmação duplicada com tratamentos
 * diferentes**, que é o mecanismo pelo qual duas partes do app divergem — o mesmo
 * argumento que levou as doses para `lib/hipercalemia.ts` (R-95).
 *
 * ⚠️ E NÃO GANHARAM SELO PRÓPRIO, de propósito: selo duplicado é divergência
 * esperando acontecer. O `acionar` explica **por que chamar a nefrologia**; não
 * precisa reensinar o critério da diretriz.
 */
export const IRA_ACIONAR_PORQUE = [
  "A conversa não precisa do diagnóstico fechado; a dúvida já é motivo.",
  "Pedir vaga não é desistir de tratar — as horas da vaga correm junto com o tratamento.",
  "Hipercalemia refratária ao tratamento clínico, ou com alteração de ECG que não melhora.",
  "Acidose grave que não responde.",
  "Sobrecarga de volume com hipoxemia, sem resposta a diurético.",
  "Sinais de uremia — encefalopatia, pericardite, sangramento.",
  "Intoxicação por substância dialisável (lítio, salicilato, metanol, etilenoglicol) — a única em que a diálise trata o veneno, não o rim.",
  "➜ Este app não escolhe modalidade, dose nem momento — isso é de nefrologista e do serviço.",
  "Nada do que você sustenta espera a diálise, e é o que mantém o paciente vivo até ela.",
];


/* ── AS ARMADILHAS, NO PONTO DA TENTAÇÃO (emenda E-7) ─────────────────────── */

/**
 * ⚠️ SÃO UMA FAMÍLIA SÓ, E ISSO MUDA O QUE SE DECIDE SOBRE ELAS.
 *
 * "Não dê volume por causa da creatinina", "diurético trata sobrecarga, não o
 * rim", "não use diurético para melhorar o rim" e "não use dopamina em dose
 * renal" diziam a MESMA coisa em quatro lugares: **não trate o NÚMERO, trate o
 * que causou o número.** Quatro textos, quatro decisões de força a tomar, quatro
 * lugares para divergirem. Agora é uma decisão só.
 *
 * ── ONDE ELAS MORAM, E POR QUÊ ────────────────────────────────────────────
 *
 * A emenda E-7 é explícita: armadilha numa lista vira LEITURA; ela muda o que se
 * faz, e por isso pertence ao nó onde a ação errada é TENTADORA — no momento em
 * que o médico está prestes a mandar volume ou furosemida. A lista (`nao_faca`)
 * continua existindo como recapitulação, com o MESMO texto, vindo daqui: duas
 * cópias divergiriam.
 *
 * ⚠️ NENHUMA DELAS TEM FORÇA DECLARADA. O repositório NÃO contém o texto da
 * KDIGO 2012 — só a referência bibliográfica —, e a entrada de metadata foi
 * escrita a partir do conteúdo do módulo, não da diretriz. Usá-la como prova do
 * que a KDIGO recomenda seria circular, que é o mesmo defeito da procedência por
 * vizinhança. Fica como pendência ÚNICA para o autor.
 */
export const ARMADILHA_VOLUME_PELA_CREATININA =
  "⚠️ NÃO DÊ VOLUME POR CAUSA DA CREATININA — dê pelo estado de perfusão. O número não é hipovolemia, e em quem já está congesto o volume piora.";

/**
 * ⚠️ O DIURÉTICO SÃO TRÊS AFIRMAÇÕES, E A TERCEIRA É POSITIVA.
 *
 * A KDIGO 2012 (verbatim em `protocols/fontes-verbatim/kdigo-2012-aki.md`,
 * conferida pelo autor na PÁGINA 12 do PDF):
 *
 *   3.4.1 (1B) não usar para PREVENIR AKI
 *   3.4.2 (2C) não usar com o objetivo de TRATAR A LESÃO / recuperar função
 *   3.4.2      ...EXCETO no manejo da sobrecarga de volume  ← a exceção literal
 *
 * ⚠️ AS DUAS ÚLTIMAS NÃO SE SEPARAM, E ISTO É REGRA, NÃO ESTILO. São as duas
 * faces da MESMA recomendação. Um card que mostra só o negativo produz um FALSO
 * ABSOLUTO: o médico lê "não use diurético na IRA" e **não vê a sobrecarga** —
 * que é justamente a indicação que sobra, e a que ele tem na frente quando o
 * paciente está congesto. Separar não omite: **muda a asserção**.
 *
 * `valida-ira` trava a proximidade — onde o negativo aparecer, a exceção tem de
 * ser o item IMEDIATAMENTE seguinte. Não basta estar no mesmo card.
 *
 * A que estava na tela antes era a de TRATAR, sozinha e sem a exceção — o falso
 * absoluto, com a recomendação mais forte (a de prevenir) ausente.
 */
export const ARMADILHA_DIURETICO_PARA_O_RIM =
  "⚠️ NÃO USE DIURÉTICO PARA TRATAR A LESÃO nem para recuperar função renal — a KDIGO sugere não usar com esse objetivo (3.4.2, grau 2C).";

export const ALCA_QUANDO_HA_SOBRECARGA =
  "✅ MAS CONSIDERE O DIURÉTICO DE ALÇA SE HOUVER SOBRECARGA DE VOLUME ou congestão, quando clinicamente apropriado — é a exceção literal da mesma 3.4.2.";

export const ARMADILHA_DIURETICO_PARA_PREVENIR =
  "⚠️ E NÃO USE DIURÉTICO PARA PREVENIR IRA — é outra afirmação, e mais forte: aqui a KDIGO RECOMENDA não usar (3.4.1, grau 1B), não apenas sugere.";

/**
 * ⚠️ A ÚNICA DAS TRÊS QUE É ABSOLUTA — e por isso o app pode dizê-la assim.
 * A 3.5.1 não tem exceção: nem prevenir, nem tratar, em nenhum cenário. É o
 * contraste que dá sentido ao par acima, onde a exceção é obrigatória.
 */
export const ARMADILHA_DOPAMINA_RENAL =
  "⚠️ NÃO USE DOPAMINA EM DOSE RENAL — SEM EXCEÇÃO: a KDIGO recomenda não usar dose baixa nem para prevenir nem para tratar a IRA (3.5.1, grau 1A). Não protege e arritmiza.";

export const ARMADILHAS_PORQUE = [
  "➜ As três dizem a mesma coisa: não trate o NÚMERO, trate o que causou o número.",
  "➜ O diurético aumenta o débito urinário sem mudar função nem desfecho: transforma um oligúrico em não oligúrico, com a mesma doença e menos volume.",
  "➜ São TRÊS afirmações, não uma: não prevenir (1B), não tratar a lesão (2C) e, na mesma 3.4.2, CONSIDERAR a alça se houver sobrecarga.",
  "➜ O negativo e a sua exceção andam juntos: sozinho, o negativo vira um falso absoluto e some a única indicação que resta.",
];
