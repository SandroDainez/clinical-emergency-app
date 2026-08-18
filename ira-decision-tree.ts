import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  IRA_DOIS_EIXOS,
  IRA_ESTADIAMENTO_KDIGO,
  IRA_REVISAO_EM_CURSO,
  IRA_SEM_BASE_CONHECIDA,
  IRA_SINAIS_DE_CRONICIDADE,
  IRA_OBSTRUCAO_PRIMEIRO,
  IRA_SONDA_E_DIAGNOSTICA,
  IRA_PRE_RENAL_OBSERVAVEL,
  IRA_NEFROTOXICO_OBSERVAVEL,
  IRA_O_QUE_NAO_CONDUZ,
  IRA_FAZER_AGORA,
  IRA_NAO_FACA,
  IRA_QUANDO_ACIONAR,
  IRA_SEM_NEFROLOGISTA,
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
    entry: {
      id: "entry",
      type: "action",
      title: "Creatinina subiu ou parou de urinar",
      summary:
        "Este módulo é do turno, não da investigação: ele responde se é o rim, o que fazer agora e o que não fazer. Duas coisas antes de qualquer conta — meça a diurese em mL/kg/h (exige peso e hora; \"urinou pouco\" não estadia nada) e anote a creatinina com a hora, porque o que estadia é a TENDÊNCIA.",
      // ⚠️ UM ITEM = UMA INSTRUÇÃO. As cinco constantes eram cinco parágrafos de
      // até 732 caracteres — 20 linhas renderizadas num item só. Agora cada uma é
      // uma LISTA e é espalhada aqui: o texto é o mesmo, a embalagem é que mudou.
      // Não é corte, é separação — conferido por retrato, frase a frase.
      actions: [
        ...IRA_DOIS_EIXOS,
        ...IRA_ESTADIAMENTO_KDIGO,
        ...IRA_FAZER_AGORA,
        ...IRA_NAO_FACA,
        ...IRA_REVISAO_EM_CURSO,
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
      actions: [IRA_SEM_BASE_CONHECIDA, IRA_SINAIS_DE_CRONICIDADE],
      next: "obstrucao_check",
    },

    cronico_agudizado: {
      id: "cronico_agudizado",
      type: "action",
      title: "Crônico agudizado — três coisas mudam",
      summary:
        "⚠️ O ALVO AQUI NÃO É RECUPERAR FUNÇÃO, É NÃO PERDER O QUE RESTA. Três mudanças concretas: o número se lê contra a BASE DELE e não contra o normal da tabela; o volume é bem mais cauteloso, porque o risco de congestão é maior; e a hipercalemia crônica tolera-se melhor — quem manda é o ECG, não o valor.",
      actions: [
        "LEIA O NÚMERO CONTRA A BASE DELE: um paciente que vive com creatinina 2,5 e chegou com 3,5 teve aumento de 1,4 vez — pode não fechar estágio 1 por creatinina, e ainda assim ser agudização relevante. Some o eixo da DIURESE antes de concluir que não houve nada.",
        "⚠️ E ELE JÁ TEM UM NEFROLOGISTA — isto é vantagem, não formalidade. Quem acompanha sabe a base real, a etiologia, se há plano de diálise e qual acesso. Um telefonema encurta horas de investigação.",
        "O QUE PROCURAR COMO GATILHO DA AGUDIZAÇÃO, porque quase sempre há um e quase sempre é removível: desidratação por vômito, diarreia ou diurético em excesso; AINE ou contraste recente; IECA/BRA em vigência de hipovolemia; infecção; e obstrução, que no crônico é tão comum quanto no agudo.",
        IRA_SINAIS_DE_CRONICIDADE,
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
      summary:
        "PASSE A SONDA AGORA, e não espere imagem para isso. Se sair volume grande, a obstrução era a causa e você acabou de tratá-la. ⚠️ E DEPOIS DO ALÍVIO O PACIENTE PODE PRECISAR DE REPOSIÇÃO, NÃO DE RESTRIÇÃO — a diurese pós-obstrutiva perde água e eletrólito.",
      actions: [IRA_OBSTRUCAO_PRIMEIRO, IRA_SONDA_E_DIAGNOSTICA],
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
      summary:
        "PROVA DE VOLUME COM CRISTALOIDE, EM ALÍQUOTAS, REAVALIANDO ENTRE ELAS — débito urinário, ausculta, oximetria e perfusão. ⚠️ Se você não sabe a creatinina de base, as alíquotas são menores.",
      actions: [
        IRA_PRE_RENAL_OBSERVAVEL,
        "⚠️ REAVALIE ENTRE AS ALÍQUOTAS, NÃO DEPOIS DE TODAS: o que você procura é resposta (débito subindo) e o que você teme é congestão (crepitação nova, oximetria caindo). O primeiro sinal de que o volume deixou de ajudar aparece antes de a radiografia mudar.",
        "SE RESPONDEU: siga o volume até a euvolemia e reavalie a creatinina em 6 a 12 h. Se NÃO respondeu depois de reposição adequada, a causa provavelmente não é (só) pré-renal — siga para a exposição a nefrotóxico.",
      ],
      next: "nefrotoxico_check",
    },

    congesto_conduta: {
      id: "congesto_conduta",
      type: "action",
      title: "Mal perfundido e cheio de água — volume não é a resposta",
      summary:
        "⚠️ AQUI O PROBLEMA É DÉBITO OU DISTRIBUIÇÃO, NÃO FALTA DE VOLUME. Diurético trata a SOBRECARGA (é indicação legítima), e não trata o rim — a distinção importa porque tratar rim com furosemida é o erro mais comum deste módulo.",
      actions: [
        "SE HÁ SOBRECARGA COM HIPOXEMIA, o alvo é a congestão: diurético de alça, e o app tem o módulo de EDEMA AGUDO DE PULMÃO para essa situação. Isso não melhora a função renal — melhora a troca gasosa, que é o que ameaça a vida agora.",
        "⚠️ E SE A CAUSA É CARDÍACA, o rim melhora quando o coração melhora: procure a causa da descompensação (isquemia, arritmia, má adesão) em vez de tratar o número da creatinina. O app tem módulos de EAP, síndromes coronarianas e vasoativos.",
        "SE HÁ CIRROSE COM ASCITE E CREATININA SUBINDO SEM OUTRA CAUSA, pense em síndrome hepatorrenal — este app não a conduz, e reconhecê-la é o que faz chamar quem conduz.",
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
      summary:
        "SUSPENDA O QUE É NEFROTÓXICO E PODE SER SUSPENSO, revise TODAS as doses por função renal, e mantenha perfusão e volemia adequadas — não há droga que \"trate\" a necrose tubular, e o que muda desfecho é retirar o agressor e sustentar o rim enquanto ele recupera.",
      actions: [
        IRA_NEFROTOXICO_OBSERVAVEL,
        "SE FOR RABDOMIÓLISE: hidratação vigorosa é o tratamento, com alvo de débito urinário generoso, e a monitorização é de potássio, cálcio, fósforo e CPK. ⚠️ O app tem o módulo de ELETRÓLITOS para os distúrbios que vêm com ela, e o de INTOXICAÇÕES quando a causa é medicamentosa.",
        IRA_O_QUE_NAO_CONDUZ,
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
      actions: [IRA_QUANDO_ACIONAR, IRA_SEM_NEFROLOGISTA],
      next: "destino_suporte",
    },

    seguimento: {
      id: "seguimento",
      type: "action",
      title: "O que vigiar nas próximas horas",
      summary:
        "⚠️ O QUE ESTADIA É A TENDÊNCIA: creatinina com hora anotada e diurese em mL/kg/h, medidas de novo. Uma medida isolada não diz se está melhorando.",
      actions: [
        "REPITA CREATININA E ELETRÓLITOS conforme a gravidade e a velocidade da mudança, e some sempre o eixo da DIURESE ao da creatinina — o estágio é o pior dos dois.",
        "⚠️ E VIGIE O QUE MATA ANTES DO RIM: potássio (com ECG se alterado), pH e sobrecarga de volume com hipoxemia. O módulo de ELETRÓLITOS conduz a hipercalemia; o de EAP conduz a congestão.",
        "REVISE AS DOSES OUTRA VEZ quando a função renal mudar — o ajuste de ontem não serve para a creatinina de hoje. A calculadora de CLEARANCE dá o ClCr absoluto, que é o que dosa, e a de DOSE DE ANTIBIÓTICO cobre vancomicina, pip-tazo e meropeném.",
        "⚠️ SE A FUNÇÃO NÃO RECUPERA OU PIORA APESAR DE CAUSA REMOVIDA E VOLEMIA ADEQUADA, o caso saiu das três causas comuns — e aí a informação útil é justamente essa: chame o nefrologista mais cedo, porque o que resta são as entidades que este módulo nomeia e não conduz.",
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
