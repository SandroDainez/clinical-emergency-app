import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  IRA_DOIS_EIXOS,
  IRA_ESTADIAMENTO_KDIGO,
  IRA_REVISAO_EM_CURSO,
  IRA_SEM_BASE_ACOES,
  IRA_SEM_BASE_PORQUE,
  IRA_SINAIS_DE_CRONICIDADE_PORQUE,
  IRA_OBSTRUCAO_ACOES,
  IRA_OBSTRUCAO_PORQUE,
  IRA_APOS_ALIVIO_ACOES,
  IRA_APOS_ALIVIO_PORQUE,
  IRA_PRE_RENAL_ACOES,
  IRA_PRE_RENAL_PORQUE,
  IRA_NEFROTOXICO_ACOES,
  IRA_NEFROTOXICO_PORQUE,
  IRA_O_QUE_NAO_CONDUZ_PORQUE,
  IRA_ACIONAR_ACOES,
  IRA_ACIONAR_PORQUE,
} from "./lib/injuria-renal-aguda";

/**
 * INJÚRIA RENAL AGUDA — o primeiro módulo NOVO desta auditoria.
 *
 * ⚠️ AS DECISÕES DE DESENHO ESTÃO EM `lib/injuria-renal-aguda.ts`, com o escopo,
 * as três exclusões e a fonte. Aqui fica o que é do FLUXO.
 *
 * ── A ORDEM DAS PERGUNTAS, E POR QUE ESTA ───────────────────────────────────
 *
 *   1. a BASE de creatinina, com saída para "não sei" (que é o caso comum)
 *   2. a OBSTRUÇÃO, primeira na exclusão — única reversível em minutos, e
 *      ausente do app até hoje
 *   3. a HIPOPERFUSÃO, pelo observável
 *   4. a EXPOSIÇÃO a nefrotóxico, que é a única causa removível hoje
 *
 * ⚠️ E NENHUMA DELAS PERGUNTA A CLASSIFICAÇÃO. "É pré-renal, renal ou
 * obstrutivo?" pediria ao usuário a conclusão — o defeito das toxidromes e dos
 * padrões do abdome. Aqui se pergunta o que se VÊ (bexiga palpável, jato fino,
 * mucosa seca, resposta a volume, exposição recente) e o app conclui.
 *
 * ── SINAIS PRIMEIRO, NOME DEPOIS (PD-5) ─────────────────────────────────────
 *
 * Os rótulos seguem o padrão fixado nas toxidromes: o achado vem antes do termo.
 */
export const iraDecisionTree: DecisionTreeDefinition = {
  id: "injuria_renal_aguda",
  version: "1.0.0",
  label: "Injúria renal aguda",
  entryNodeId: "entry",
  nodes: {
    // ── PASSO 1 · O QUE SE FAZ ANTES DE QUALQUER CONTA ───────────────────
    //
    // ⚠️ O CRITÉRIO É DO MÉDICO, e repartiu este nó em 2026-08-18: UM PASSO
    // MOSTRA SÓ O QUE PRECISA SER FEITO ANTES DA PRÓXIMA DECISÃO. Este nó tinha
    // 44 instruções numa tela — cada uma legível (a separação anterior já as
    // encurtara), o conjunto impossível. Quem tem um paciente anúrico na frente
    // precisa de quatro coisas; o estadiamento KDIGO é CONSULTA, não conduta.
    //
    // As 19 instruções de estadiamento e de justificativa foram para `porque`,
    // ao lado da ação que explicam — não para uma tela de consulta separada,
    // porque quem NÃO TEM EXPERIÊNCIA precisa da razão junto do gesto, e longe
    // dele ela vira livro.
    entry: {
      id: "entry",
      type: "action",
      title: "Creatinina subiu ou parou de urinar",
      summary: "Este módulo é do turno, não da investigação.",
      actions: [
        "Meça a diurese em mL/kg/h — exige peso e hora.",
        "Anote a creatinina COM A HORA.",
        "Suspenda o que é nefrotóxico e revise as doses por função renal.",
        "Trate a hipercalemia se houver — ela mata antes do rim.",
        "Peça gasometria, eletrólitos, ureia, creatinina, urina tipo 1 e ultrassom de vias urinárias.",
      ],
      porque: [
        "➜ \"Urinou pouco\" não estadia nada.",
        "⚠️ O que estadia é a TENDÊNCIA, não o valor isolado.",
        "➜ O app tem calculadora para vancomicina, pip-tazo e meropeném; os outros são com bula ou farmacêutico.",
        "➜ O módulo de Eletrólitos tem a conduta completa da hipercalemia, inclusive a escolha entre cloreto e gluconato de cálcio.",
        ...IRA_DOIS_EIXOS,
        ...IRA_ESTADIAMENTO_KDIGO,
        ...IRA_REVISAO_EM_CURSO,
      ],
      next: "nao_faca",
    },

    // ── PASSO 2 · O QUE NÃO FAZER ────────────────────────────────────────
    //
    // Passo próprio, e não `porque`: cada linha é um ERRO CORRENTE, e não fazer
    // é conduta — não é explicação. As razões de cada uma é que ficam recolhidas.
    nao_faca: {
      id: "nao_faca",
      type: "action",
      title: "O que não fazer",
      summary: "Cada um destes é erro corrente.",
      actions: [
        "NÃO USE DIURÉTICO PARA \"melhorar o rim\".",
        "NÃO USE DOPAMINA EM DOSE RENAL.",
        "NÃO ESPERE A CREATININA para agir.",
        "Não repita contraste sem reavaliar a indicação.",
      ],
      porque: [
        "➜ Furosemida aumenta o débito urinário sem melhorar função nem desfecho.",
        "➜ Ela transforma um oligúrico em não oligúrico, com a mesma doença e menos volume.",
        "➜ Diurético trata sobrecarga de volume, que é outra indicação.",
        "➜ Dopamina em dose renal não protege o rim e acrescenta arritmia.",
        "➜ A creatinina sobe tarde — quem espera perde o intervalo em que a causa ainda é reversível.",
      ],
      next: "base_check",
    },

    // ── 1 · A BASE, com saída para "não sei" ──────────────────────────────
    //
    // ⚠️ A PERGUNTA VEM PRIMEIRO porque muda o SIGNIFICADO de todo o resto:
    // creatinina de 3,2 pode ser a base daquele paciente, e tratar isso como
    // IRA leva a volume desnecessário. E a saída "não sei" será COMUM — o
    // usuário geral frequentemente não tem o histórico.
    base_check: {
      id: "base_check",
      type: "decision",
      title: "A creatinina de base",
      question: "Você tem exame anterior deste paciente, ou sabe que ele já tinha doença renal?",
      summary:
        "⚠️ ESTA É A PERGUNTA QUE MUDA O SIGNIFICADO DE TODAS AS OUTRAS. Sem a base, o número não diz se subiu — e creatinina de 3 pode ser a normalidade daquele paciente. A definição do KDIGO usa duas janelas: 0,3 mg/dL em 48 HORAS, ou 1,5 vez a base em 7 DIAS.",
      evidence: [
        "⚠️ Não trate um número sem base: volume nele é dano, não cuidado.",
        "A base útil é o menor valor conhecido nos últimos 3 a 12 meses, não a média.",
        "Internação recente, cirurgia eletiva e pré-natal são as fontes mais comuns de um exame anterior que ninguém procurou.",
      ],
      options: [
        { id: "sabe", label: "Tenho exame anterior e a base era normal — este número SUBIU", next: "obstrucao_check" },
        { id: "cronico", label: "Ele já tinha doença renal conhecida, e este número está acima do habitual dele", next: "cronico_agudizado" },
        { id: "nao_sei", label: "Não tenho exame anterior e não sei se o rim dele já era doente", next: "sem_base" },
      ],
    },

    // ── A saída do "não sei", com conteúdo próprio (molde B) ──────────────
    sem_base: {
      id: "sem_base",
      type: "action",
      title: "Sem a creatinina de base — e a diretriz autoriza seguir",
      summary:
        "PRESUMA BASE NORMAL E TRATE COMO AGUDO ATÉ PROVA EM CONTRÁRIO — é o erro mais seguro dos dois. Mas com o VOLUME MAIS CAUTELOSO, em alíquotas menores, reavaliando ausculta e oximetria entre elas.",
      actions: IRA_SEM_BASE_ACOES,
      porque: [...IRA_SEM_BASE_PORQUE, ...IRA_SINAIS_DE_CRONICIDADE_PORQUE],
      next: "obstrucao_check",
    },

    cronico_agudizado: {
      id: "cronico_agudizado",
      type: "action",
      title: "Crônico agudizado — três coisas mudam",
      summary: "O alvo não é recuperar função — é não perder o que resta.",
      actions: [
        "Leia o número contra a BASE DELE, não contra o normal da tabela.",
        "Some o eixo da DIURESE antes de concluir que não houve nada.",
        "Dê volume bem mais cauteloso — o risco de congestão é maior.",
        "Telefone para o nefrologista que já acompanha o paciente.",
        "Procure o gatilho da agudização — quase sempre há um, e quase sempre é removível.",
      ],
      porque: [
        "Um paciente que vive com creatinina 2,5 e chegou com 3,5 teve aumento de 1,4 vez — pode não fechar estágio 1 por creatinina, e ainda assim ser agudização relevante.",
        "Na hipercalemia crônica, quem manda é o ECG, não o valor: ela se tolera melhor que a aguda.",
        "⚠️ Ter nefrologista é vantagem, não formalidade: quem acompanha sabe a base real, a etiologia, se há plano de diálise e qual acesso. Um telefonema encurta horas de investigação.",
        "Gatilhos comuns: desidratação por vômito, diarreia ou diurético em excesso.",
        "AINE ou contraste recente; IECA/BRA em vigência de hipovolemia; infecção.",
        "E obstrução, que no crônico é tão comum quanto no agudo.",
        ...IRA_SINAIS_DE_CRONICIDADE_PORQUE,
      ],
      next: "obstrucao_check",
    },

    // ── 2 · A OBSTRUÇÃO PRIMEIRO — pelo observável ────────────────────────
    obstrucao_check: {
      id: "obstrucao_check",
      type: "decision",
      title: "Antes de tudo: há obstrução?",
      question: "Algum destes está presente?",
      summary:
        "⚠️ A OBSTRUÇÃO VEM PRIMEIRO PORQUE É A ÚNICA QUE SE REVERTE EM MINUTOS — e é a mais esquecida. Nada do que se pergunta aqui é exame: é palpação, história de fármaco e o que a sonda drena. ➜ NA DÚVIDA, PASSE A SONDA: ela é barata e diagnóstica.",
      evidence: [
        "A obstrução pode dar ANÚRIA com creatinina ainda normal — e anúria de 12 h já é estágio 3 pelo eixo da diurese.",
        "Obstrução parcial pode cursar com débito NORMAL ou até aumentado; débito preservado não a exclui.",
      ],
      options: [
        { id: "sim", label: "Bexiga palpável, jato fino, retenção, próstata aumentada ou anticolinérgico recente — SUSPEITO DE OBSTRUÇÃO", next: "obstrucao_conduta" },
        { id: "sonda_nao_drena", label: "Já tem sonda e ela NÃO drena, ou drena muito pouco", next: "obstrucao_conduta" },
        { id: "nao", label: "Nada disso — bexiga vazia e sonda drenando bem", next: "volume_check" },
        { id: "nao_sei", label: "Não consigo dizer — não examinei a bexiga ou não sei os fármacos", next: "obstrucao_conduta" },
      ],
    },

    obstrucao_conduta: {
      id: "obstrucao_conduta",
      type: "action",
      title: "Suspeita de obstrução — a sonda é o exame",
      summary: "A sonda é o exame — e o tratamento, se for isso.",
      actions: [...IRA_OBSTRUCAO_ACOES, ...IRA_APOS_ALIVIO_ACOES],
      porque: [...IRA_OBSTRUCAO_PORQUE, ...IRA_APOS_ALIVIO_PORQUE],
      next: "volume_check",
    },

    // ── 3 · A HIPOPERFUSÃO, pelo observável ───────────────────────────────
    volume_check: {
      id: "volume_check",
      type: "decision",
      title: "O rim está recebendo sangue?",
      question: "O que o exame e a história mostram?",
      summary:
        "⚠️ E CUIDADO COM OS DOIS QUADROS QUE PARECEM HIPOVOLEMIA E NÃO SÃO: insuficiência cardíaca descompensada e cirrose com ascite têm rim hipoperfundido COM excesso de água — nesses, volume PIORA. Se há edema, estase jugular, crepitações ou ascite, a resposta não é volume.",
      evidence: [
        "A resposta a volume é o teste mais direto: débito que sobe e creatinina que começa a cair depois de uma alíquota respondem a pergunta.",
        "Hipotensão postural, mucosa seca e turgor reduzido são sinais tardios em jovens e enganosos em idosos.",
      ],
      options: [
        { id: "hipovolemico", label: "Perdas claras (vômito, diarreia, sangramento, jejum), mucosa seca, taquicardia — SECO", next: "pre_renal" },
        { id: "congesto", label: "Edema, estase jugular, crepitações ou ascite — CHEIO DE ÁGUA e mal perfundido", next: "congesto_conduta" },
        { id: "euvolemico", label: "Nem seco nem congesto, ou não consigo definir", next: "nefrotoxico_check" },
      ],
    },

    pre_renal: {
      id: "pre_renal",
      type: "action",
      title: "Hipoperfusão — o rim está bem, falta sangue chegando",
      summary: "Prova de volume com cristaloide, em alíquotas, reavaliando entre elas.",
      actions: [
        ...IRA_PRE_RENAL_ACOES,
        "⚠️ Reavalie ENTRE as alíquotas, não depois de todas — débito urinário, ausculta, oximetria e perfusão.",
        "⚠️ Se você não sabe a creatinina de base, as alíquotas são menores.",
        "Se respondeu: siga o volume até a euvolemia e reavalie a creatinina em 6 a 12 h.",
        "Se NÃO respondeu depois de reposição adequada, siga para a exposição a nefrotóxico.",
      ],
      porque: [
        ...IRA_PRE_RENAL_PORQUE,
        "O que você procura entre as alíquotas é resposta (débito subindo); o que teme é congestão (crepitação nova, oximetria caindo).",
        "O primeiro sinal de que o volume deixou de ajudar aparece antes de a radiografia mudar.",
        "Se não respondeu, a causa provavelmente não é (só) pré-renal.",
      ],
      next: "nefrotoxico_check",
    },

    congesto_conduta: {
      id: "congesto_conduta",
      type: "action",
      title: "Mal perfundido e cheio de água — volume não é a resposta",
      summary: "⚠️ Aqui o problema é DÉBITO ou DISTRIBUIÇÃO, não falta de volume.",
      actions: [
        "Se há sobrecarga com hipoxemia: diurético de alça.",
        "Abra o módulo de EDEMA AGUDO DE PULMÃO para conduzir essa situação.",
        "Se a causa é cardíaca, procure a causa da descompensação — isquemia, arritmia, má adesão.",
        "Se há cirrose com ascite e creatinina subindo sem outra causa, pense em síndrome hepatorrenal.",
      ],
      porque: [
        "Diurético trata a SOBRECARGA (é indicação legítima) e não trata o rim — a distinção importa porque tratar rim com furosemida é o erro mais comum deste cenário.",
        "O diurético não melhora a função renal — melhora a troca gasosa, que é o que ameaça a vida agora.",
        "O rim melhora quando o coração melhora: tratar o número da creatinina não resolve a descompensação.",
        "O app tem módulos de EAP, síndromes coronarianas e vasoativos.",
        "Este app não conduz a síndrome hepatorrenal — reconhecê-la é o que faz chamar quem conduz.",
      ],
      next: "nefrotoxico_check",
    },

    // ── 4 · A EXPOSIÇÃO — a única causa removível hoje ────────────────────
    nefrotoxico_check: {
      id: "nefrotoxico_check",
      type: "decision",
      title: "O que entrou neste paciente?",
      question: "Houve exposição recente, ou há achado que aponte o próprio rim?",
      summary:
        "⚠️ A EXPOSIÇÃO É A ÚNICA CAUSA QUE VOCÊ PODE REMOVER HOJE — e a pergunta inclui o que o paciente toma sem contar que toma. Pergunte por AINE de farmácia, chá, e o que ele usa \"para dor\".",
      evidence: [
        "A combinação vancomicina + piperacilina-tazobactam tem nefrotoxicidade somada maior que a de cada uma isolada.",
        "Contraste iodado conta nas últimas 48 a 72 h; e a creatinina pode subir depois de o paciente já ter saído da sala de exame.",
      ],
      options: [
        { id: "exposto", label: "Contraste, AINE, IECA/BRA, aminoglicosídeo, vanco + pip-tazo ou quimioterápico recentes", next: "renal_conduta" },
        { id: "sedimento", label: "Urina com hematúria e cilindros, ou proteinúria significativa", next: "renal_conduta" },
        { id: "rabdo", label: "Urina escura, CPK muito alta, imobilização, trauma, convulsão ou esforço extremo", next: "renal_conduta" },
        { id: "nada", label: "Nada disso que eu tenha conseguido identificar", next: "renal_conduta" },
      ],
    },

    renal_conduta: {
      id: "renal_conduta",
      type: "action",
      title: "Lesão do próprio rim — remova o que se pode remover",
      summary: "A primeira pergunta é sempre a exposição — é a única causa removível hoje.",
      actions: [
        ...IRA_NEFROTOXICO_ACOES,
        "Se for rabdomiólise: hidratação vigorosa, com alvo de débito urinário generoso.",
        "Monitorize potássio, cálcio, fósforo e CPK.",
        "Mantenha perfusão e volemia adequadas enquanto o rim recupera.",
        "Se o caso não cabe nas três causas comuns, chame o nefrologista mais cedo.",
      ],
      porque: [
        "⚠️ Não há droga que \"trate\" a necrose tubular — o que muda desfecho é retirar o agressor e sustentar o rim enquanto ele recupera.",
        "Urina com sedimento ATIVO — hematúria com cilindros, proteinúria significativa — aponta doença glomerular.",
        ...IRA_NEFROTOXICO_PORQUE,
        "O app tem o módulo de ELETRÓLITOS para os distúrbios que vêm com a rabdomiólise, e o de INTOXICAÇÕES quando a causa é medicamentosa.",
        ...IRA_O_QUE_NAO_CONDUZ_PORQUE,
        "Reconhecer que o caso não cabe nas três causas comuns já é a informação que faz chamar o nefrologista mais cedo.",
      ],
      next: "trs_check",
    },

    // ── 5 · A FRONTEIRA — e o beco que não se abre ────────────────────────
    trs_check: {
      id: "trs_check",
      type: "decision",
      title: "A conversa sobre diálise precisa começar?",
      question: "Há alguma destas situações agora?",
      summary:
        "⚠️ O CRITÉRIO DA DIRETRIZ É UMA CATEGORIA, NÃO UM NÚMERO: alteração de volume, eletrólito ou ácido-base que ameace a vida. Ela RECUSA explicitamente decidir por limiar isolado de ureia ou creatinina, e manda pesar contexto e TENDÊNCIA.",
      evidence: [
        "A intoxicação por substância dialisável (lítio, salicilato, metanol, etilenoglicol) é a única em que a diálise trata o veneno, não o rim.",
        "Este app não escolhe modalidade, dose nem momento de diálise — isso é do nefrologista e do serviço.",
      ],
      options: [
        { id: "sim", label: "Hipercalemia ou acidose refratárias, sobrecarga com hipoxemia, uremia sintomática, ou intoxicação dialisável", next: "acionar" },
        { id: "nao", label: "Nada disso — o paciente está sustentado por agora", next: "seguimento" },
        { id: "nao_sei", label: "Não sei dizer se já é grave o bastante", next: "acionar" },
      ],
    },

    acionar: {
      id: "acionar",
      type: "action",
      title: "Acione agora — e a transferência em paralelo",
      summary:
        "⚠️ DUAS COISAS AO MESMO TEMPO, NÃO UMA: acione quem existe no seu serviço E acione a transferência em paralelo, porque vaga com diálise leva horas e essas horas correm junto com o tratamento. Pedir vaga não é desistir de tratar.",
      actions: IRA_ACIONAR_ACOES,
      porque: IRA_ACIONAR_PORQUE,
      next: "destino_suporte",
    },

    seguimento: {
      id: "seguimento",
      type: "action",
      title: "O que vigiar nas próximas horas",
      summary: "⚠️ O que estadia é a TENDÊNCIA: creatinina com hora anotada e diurese em mL/kg/h, medidas de novo. Uma medida isolada não diz se está melhorando.",
      actions: [
        "Repita creatinina e eletrólitos conforme a gravidade e a velocidade da mudança.",
        "Some sempre o eixo da DIURESE ao da creatinina.",
        "⚠️ Vigie o que mata antes do rim: potássio (com ECG se alterado), pH e sobrecarga de volume com hipoxemia.",
        "Revise as doses OUTRA VEZ quando a função renal mudar.",
        "Se a função não recupera ou piora apesar de causa removida e volemia adequada, chame o nefrologista.",
      ],
      porque: [
        "O estágio é o pior dos dois eixos.",
        "O módulo de ELETRÓLITOS conduz a hipercalemia; o de EAP conduz a congestão.",
        "O ajuste de ontem não serve para a creatinina de hoje.",
        "A calculadora de CLEARANCE dá o ClCr absoluto, que é o que dosa; a de DOSE DE ANTIBIÓTICO cobre vancomicina, pip-tazo e meropeném.",
        "Se o caso saiu das três causas comuns, o que resta são as entidades que este módulo nomeia e não conduz — e chamar mais cedo é a informação útil.",
      ],
      next: "destino_monitorizado",
    },

    // ── 6 · OS DESFECHOS — e aqui o ponteiro é NAVEGÁVEL ─────────────────
    //
    // ⚠️ A PRIMEIRA VERSÃO DESTE MÓDULO NÃO TINHA CONCLUSÃO: `seguimento`
    // apontava de volta para `entry`, fechando um ciclo. A
    // `auditoria-maquinas-estado` reprovou os 14 nós com
    // "nenhum caminho a partir daqui chega a uma conclusão" — e estava certa:
    // um fluxo sem desfecho nunca termina, e o médico não tem para onde sair.
    //
    // ⚠️ E A CORREÇÃO TROUXE UM GANHO QUE O TEXTO NÃO PODIA TER: `targets` —
    // navegação real entre módulos, com card tocável e `router.push` — é campo
    // EXCLUSIVO de `TransitionNode`. Nos esquemas de antibiótico da sepse não
    // havia como usá-lo (são `action`) e o ponteiro ficou textual; aqui, no
    // desfecho, ele é de verdade. O ponteiro para ELETRÓLITOS deixa de ser uma
    // instrução e passa a ser um toque.
    destino_monitorizado: {
      id: "destino_monitorizado",
      type: "transition",
      title: "Seguir monitorizado, com a tendência em vista",
      summary:
        "O paciente está sustentado e a causa está endereçada. ⚠️ O QUE DEFINE O SEGUIMENTO É A TENDÊNCIA — creatinina com hora e diurese em mL/kg/h, medidas de novo —, e o estágio continua sendo o pior dos dois eixos.",
      disposition: "observation",
      exitCriteria: [
        "Diurese registrada em mL/kg/h, com peso e intervalo — não \"urinou pouco\".",
        "Creatinina repetida com hora anotada, para ler a tendência e não o valor isolado.",
        "Potássio, pH e volemia reavaliados conforme a gravidade; ECG se o potássio estiver alterado.",
        "Doses revistas por função renal a cada mudança — o ajuste de ontem não serve para a creatinina de hoje.",
        "⚠️ Se a função não recupera com causa removida e volemia adequada, o caso saiu das três causas comuns: chame o nefrologista.",
      ],
      targets: [
        { moduleId: "correcoes-eletroliticas", label: "Eletrólitos", reason: "Hipercalemia e os distúrbios que acompanham a IRA" },
        { moduleId: "calculadoras-clinicas", label: "Calculadoras & escores", reason: "ClCr absoluto e dose de antibiótico por função renal" },
      ],
    },

    destino_suporte: {
      id: "destino_suporte",
      type: "transition",
      title: "Suporte avançado — e a diálise sendo providenciada",
      summary:
        "⚠️ ENQUANTO A DIÁLISE NÃO CHEGA, O QUE SUSTENTA O PACIENTE É O QUE ESTE APP SABE FAZER: hipercalemia, acidose, oxigenação, volume pelo que a ausculta permitir, doses revistas e nefrotóxico suspenso. Nada disso espera a máquina.",
      disposition: "icu",
      exitCriteria: [
        "Nefrologista ou quem existir no serviço acionado — e a transferência pedida EM PARALELO, não depois.",
        "Hipercalemia tratada e reavaliada com ECG; acidose e oxigenação sustentadas.",
        "Nefrotóxico suspenso, doses revistas, e balanço hídrico registrado.",
        "⚠️ Este app não escolhe modalidade, dose nem momento de diálise — isso é do nefrologista e do serviço.",
      ],
      targets: [
        { moduleId: "correcoes-eletroliticas", label: "Eletrólitos", reason: "Hipercalemia refratária é a indicação mais frequente" },
        { moduleId: "edema-agudo-pulmao", label: "Edema agudo de pulmão", reason: "Sobrecarga de volume com hipoxemia" },
      ],
    },
  },
};
