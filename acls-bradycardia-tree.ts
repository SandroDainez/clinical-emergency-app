import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import { ATROPINA_APRESENTACOES, ATROPINA_DOSE_BRADICARDIA } from "./lib/atropina";

/**
 * Algoritmo ACLS de Bradicardia no adulto com pulso (AHA 2025).
 * Fluxo interativo passo-a-passo conduzido como um instrutor de ACLS.
 *
 * Doses (AHA 2020+/2025):
 * - Atropina 1 mg IV bolus, repetir a cada 3–5 min, máximo 3 mg
 * - Dopamina 5–20 mcg/kg/min IV
 * - Epinefrina 2–10 mcg/min IV
 * - Marcapasso transvenoso temporário: aceitável na bradicardia instável
 *   refratária ao tratamento medicamentoso (novo na AHA 2025)
 */
export const bradycardiaDecisionTree: DecisionTreeDefinition = {
  id: "acls_bradycardia_2025",
  version: "2025.1",
  label: "Bradicardia ACLS",
  entryNodeId: "entry",
  nodes: {
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento e monitorização inicial",
      summary: "Bradicardia = FC < 50 bpm com sinais/sintomas. Prepare o paciente antes de decidir a conduta.",
      actions: [
        "Identificar bradicardia no monitor (FC < 50 bpm) e correlacionar com sintomas.",
        "Manter via aérea pérvia; administrar O₂ se SpO₂ < 94% ou desconforto respiratório.",
        "Monitor cardíaco, pressão arterial e oximetria contínua.",
        "Obter acesso IV e ECG de 12 derivações (não atrasar o tratamento do paciente instável).",
      ],
      next: "assess_stability",
    },

    assess_stability: {
      id: "assess_stability",
      type: "decision",
      title: "A bradicardia está causando instabilidade?",
      question: "Há sinais de instabilidade ATRIBUÍVEIS à frequência baixa?",
      summary: "A instabilidade precisa ser causada pela bradicardia — não pela doença de base.",
      evidence: [
        "Hipotensão (PAS < 90 mmHg ou queda > 30 mmHg da basal).",
        "Alteração aguda do estado mental (confusão, síncope, pré-síncope).",
        "Sinais de choque (palidez, sudorese, má perfusão periférica).",
        "Desconforto torácico isquêmico em curso.",
        "Insuficiência cardíaca aguda (congestão, dispneia, EAP).",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "instab_dados" },
        { id: "instavel", label: "Sim — paciente INSTÁVEL", next: "atropine" },
        { id: "estavel", label: "Não — paciente estável", next: "stable_monitor" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // "Há sinais de instabilidade?" é pergunta de especialista: pressupõe saber
    // o que conta como sinal e saber atribuí-lo à frequência. Quem não tem
    // experiência trava aqui — e travar num fluxo de emergência é o pior
    // desfecho possível de uma tela.
    //
    // Este nó desmembra a mesma pergunta em observações que qualquer um faz à
    // beira do leito, e o APP conclui.
    //
    // ── CORREÇÃO IMPORTANTE ──────────────────────────────────────────────────
    //
    // A primeira versão tratava CINCO observações como equivalentes e concluía
    // INSTÁVEL com qualquer uma delas sozinha. Isso estava errado, e o erro
    // nasceu de traduzir dois critérios compostos da diretriz por um único
    // elemento deles:
    //
    //   "sinais de choque"            virou  "pele pálida, fria ou suada"
    //   "insuficiência cardíaca aguda" virou  "falta de ar"
    //
    // Pele fria e suada NÃO é choque — é UM achado que aparece no choque, e
    // também em dor, ansiedade, febre, hipoglicemia e reação vagal. Falta de ar
    // NÃO é insuficiência cardíaca aguda: a diretriz descreve dispneia COM
    // congestão pulmonar. Do jeito que estava, um paciente com PAS 110, lúcido,
    // sem dor e sem dispneia era declarado INSTÁVEL só por estar suado — e o
    // fluxo seguia direto para atropina.
    //
    // Os cinco critérios da AHA (hipotensão, alteração aguda do estado mental,
    // sinais de choque, dor torácica isquêmica, insuficiência cardíaca aguda)
    // continuam valendo, e cada um continua bastando SOZINHO. O que mudou é o
    // que conta como cada um deles:
    //
    //   BASTA SOZINHO   hipotensão (PAS < 90) · alteração aguda do estado
    //                   mental · desconforto torácico de caráter isquêmico
    //   PRECISA DO PAR  pele alterada + má perfusão objetiva  → choque
    //                   dispneia    + congestão               → IC aguda
    //
    // Achado isolado do segundo grupo não vira "estável" nem "instável": vira
    // LIMÍTROFE, com orientação de procurar outra causa e reavaliar. Chamar de
    // estável esconderia um sinal real; chamar de instável leva à atropina em
    // quem não precisa.
    instab_dados: {
      id: "instab_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro:
        "Responda o que dá para observar agora, à beira do leito. Não precisa saber o que cada achado significa — o app conclui no fim. Na dúvida sobre um item, responda \"Não\": ele deixa de contar, e os demais continuam valendo.",
      fields: camposDeInstabilidade(),
      next: roteamentoDeInstabilidade({
        instavel: "instab_conclusao_instavel",
        limitrofe: "instab_conclusao_limitrofe",
        estavel: "instab_conclusao_estavel",
      }),
    },

    // Meia dose de um critério composto. Existir este nó é o que permite ao app
    // não mentir em nenhuma das duas direções: não chamar de estável quem tem um
    // sinal real, nem levar à atropina quem tem só um achado inespecífico.
    instab_conclusao_limitrofe: {
      id: "instab_conclusao_limitrofe",
      type: "action",
      title: "Achado isolado — ainda NÃO é critério de instabilidade",
      summary:
        "O que você marcou é um sinal real, mas sozinho não fecha nenhum dos critérios da diretriz. Não trate como bradicardia instável ainda.",
      actions: [
        "Pele fria, pálida ou suada entra na definição de CHOQUE quando vem com má perfusão objetiva — enchimento capilar lento, débito urinário muito reduzido, hipotensão ou alteração do estado mental. Sozinha, aparece também em dor, ansiedade, febre, hipoglicemia e reação vagal.",
        "Falta de ar entra na definição de INSUFICIÊNCIA CARDÍACA AGUDA quando vem com congestão — estertores na ausculta, ortopneia ou queda da saturação. Sozinha, pode ser ansiedade, dor, anemia, doença pulmonar.",
        "O QUE FAZER AGORA: manter monitorização contínua, oxigênio se SpO₂ < 94%, acesso venoso, ECG de 12 derivações. Procurar a causa da bradicardia (medicamentos, isquemia, distúrbio eletrolítico, hipóxia, hipotermia).",
        "REAVALIAR em poucos minutos, e a cada mudança. Se surgir hipotensão, alteração do estado mental, dor torácica isquêmica, ou o achado ganhar o par que falta, passa a ser bradicardia INSTÁVEL — volte e trate como tal.",
        "Manter atropina e marcapasso transcutâneo prontos à beira do leito enquanto reavalia.",
      ],
      next: "stable_monitor",
    },

    instab_conclusao_instavel: {
      id: "instab_conclusao_instavel",
      type: "action",
      title: "Pelo que você respondeu: paciente INSTÁVEL",
      summary: "O que você marcou fecha um dos critérios de instabilidade da diretriz, junto da frequência baixa.",
      actions: [
        "Critérios da diretriz: hipotensão, alteração aguda do estado mental, sinais de choque, dor torácica isquêmica ou insuficiência cardíaca aguda.",
        "Basta UM critério FECHADO junto da frequência baixa — não é preciso ter todos. Mas os dois compostos só fecham completos: choque = pele alterada COM má perfusão objetiva; IC aguda = dispneia COM congestão.",
        "Se algum deles tiver outra explicação evidente e independente da frequência (por exemplo, dor torácica de causa traumática), reavalie com quem estiver conduzindo o caso.",
        "Siga para o tratamento da bradicardia instável.",
      ],
      next: "atropine",
    },

    instab_conclusao_estavel: {
      id: "instab_conclusao_estavel",
      type: "action",
      title: "Pelo que você respondeu: paciente ESTÁVEL",
      summary: "Frequência baixa sem sinal de instabilidade — não há indicação de atropina ou marcapasso agora.",
      actions: [
        "Nenhum dos sinais de instabilidade apareceu, e a pressão sistólica não está abaixo de 90.",
        "Isso NÃO significa que está tudo bem: significa que não há indicação de tratar a frequência neste momento.",
        "Mantenha o monitor ligado e refaça esta verificação a qualquer piora — a bradicardia pode passar a causar instabilidade a qualquer momento.",
        "Siga para a investigação da causa.",
      ],
      next: "stable_monitor",
    },

    stable_monitor: {
      id: "stable_monitor",
      type: "action",
      title: "Bradicardia estável — monitorar e investigar a causa",
      summary: "Sem instabilidade: não há indicação de atropina ou marcapasso de imediato.",
      actions: [
        "Manter monitorização contínua e reavaliar a qualquer deterioração.",
        "Investigar e tratar causa: isquemia, fármacos (betabloqueador, BCC, digoxina), distúrbios eletrolíticos, hipóxia, hipotermia, hipotireoidismo.",
        "ECG de 12 derivações: caracterizar o tipo de bloqueio (1º grau, Mobitz I/II, BAV total).",
        "Considerar consulta com a cardiologia conforme o tipo de bloqueio.",
      ],
      next: "stable_disposition",
    },

    stable_disposition: {
      id: "stable_disposition",
      type: "transition",
      title: "Observação monitorizada",
      summary: "Bradicardia estável: acompanhar enquanto a causa é tratada.",
      disposition: "observation",
      exitCriteria: [
        "Manter monitor cardíaco e reavaliar sinais de instabilidade.",
        "Iniciar marcapasso transcutâneo imediatamente se surgir instabilidade.",
        "Mobitz II e BAV total têm risco de progressão — vigilância redobrada e cardiologia.",
      ],
      targets: [],
    },

    atropine: {
      id: "atropine",
      type: "action",
      title: "Atropina 1 mg IV — primeira linha",
      summary: "Primeira droga na bradicardia sintomática instável.",
      actions: [
        // R-48: a dose é ADMINISTRADA aqui, então o detalhe prático de
        // administração pertence aqui — não ao módulo de consulta. As duas
        // apresentações nacionais mudam o VOLUME por 2×, e na do SUS 1 mg são
        // QUATRO ampolas. Quem está conduzindo uma bradicardia instável não
        // navega para a Farmacologia para descobrir isso.
        ATROPINA_DOSE_BRADICARDIA,
        ATROPINA_APRESENTACOES,
        "⚠️ Pouco eficaz em Mobitz II e BAV total (bloqueio infranodal) — NÃO atrasar o marcapasso.",
        "Reavaliar FC, PA e perfusão 1–2 min após cada dose.",
      ],
      next: "after_atropine",
    },

    after_atropine: {
      id: "after_atropine",
      type: "decision",
      title: "Houve resposta à atropina?",
      question: "A FC e a perfusão melhoraram com a atropina?",
      evidence: [
        "Resposta = aumento da FC, normalização da PA e melhora dos sintomas.",
        "Sem resposta = persiste instável, ou bloqueio de alto grau (Mobitz II / BAV total).",
      ],
      options: [
        { id: "respondeu", label: "Sim — estabilizou", next: "resolved_disposition" },
        { id: "refratario", label: "Não — persiste instável / BAV alto grau", next: "second_line" },
        { id: "sem_pulso", label: "Perdeu o pulso", next: "bradi_sem_pulso" },
      ],
    },

    // Faltava a saída mais óbvia: bradicardia instável evolui para assistolia e
    // AESP, e o fluxo não tinha por onde reconhecer isso. Quem estivesse
    // conduzindo o caso ficava preso escolhendo entre "estabilizou" e "persiste
    // instável" com um paciente já em parada.
    bradi_sem_pulso: {
      id: "bradi_sem_pulso",
      type: "transition",
      title: "Sem pulso — isto é PCR",
      summary: "Iniciar RCP imediatamente e seguir o algoritmo de parada.",
      disposition: "other_module",
      exitCriteria: [
        "Iniciar compressões AGORA. Bradicardia extrema sem pulso é PCR — o ritmo lento no monitor não muda isso.",
        "Ritmo NÃO chocável (assistolia ou AESP): adrenalina 1 mg IV/IO o quanto antes, a cada 3–5 min. Não desfibrilar.",
        "O marcapasso transcutâneo NÃO substitui as compressões e não é tratamento de parada — se já estiver ligado, não interrompa a RCP por causa dele.",
        "Procurar as causas reversíveis que produzem bradicardia terminal: hipóxia, hipercalemia, intoxicação (betabloqueador, bloqueador de canal de cálcio, digital), hipotermia, IAM.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Paciente perdeu o pulso — seguir o algoritmo de parada.",
        },
      ],
    },

    resolved_disposition: {
      id: "resolved_disposition",
      type: "transition",
      title: "Resposta à atropina — monitorar e investigar a causa",
      summary: "Estabilizou, mas a causa precisa ser tratada e o paciente vigiado.",
      disposition: "observation",
      exitCriteria: [
        "Manter monitorização — a melhora pode ser transitória.",
        "Investigar e corrigir a causa da bradicardia.",
        "Ter marcapasso transcutâneo pronto caso recidive.",
      ],
      targets: [],
    },

    second_line: {
      id: "second_line",
      type: "action",
      title: "Segunda linha — marcapasso transcutâneo e/ou drogas",
      summary: "Atropina ineficaz, contraindicada ou bloqueio de alto grau.",
      actions: [
        // ── Os três NÃO são uma sequência, e não se excluem ────────────────
        //
        // A redação anterior listava "MP-TC IMEDIATO" como item 1 e, dois itens
        // abaixo, "OU Dopamina" e "OU Epinefrina". Numerados assim, em lista, os
        // "OU" liam como escolha-um-e-descarte-os-outros dentro de uma ordem —
        // e não é isso. Na AHA os três estão no MESMO degrau, como alternativas
        // para quando a atropina falha, e podem ser COMBINADOS.
        //
        // O que a lista escondia é justamente a pergunta prática: o marcapasso
        // não começa no instante em que se decide por ele. Ele precisa de pás,
        // aparelho, sedação e alguém que saiba operar. A droga, com um acesso
        // pronto, começa antes. Por isso a ordem correta não é "um ou outro" —
        // é fazer as duas coisas ao mesmo tempo, com mãos diferentes.
        "Estas são ALTERNATIVAS do mesmo degrau, não etapas em sequência — e podem ser usadas JUNTAS. O que decide é o que fica pronto primeiro e o tipo de bloqueio.",
        "NA PRÁTICA, com equipe: enquanto alguém prepara o marcapasso (pás, aparelho, sedação), OUTRA pessoa já inicia a droga. Não espere o marcapasso ficar pronto para tratar, nem descarte o marcapasso porque a droga já está correndo.",
        "MARCAPASSO TRANSCUTÂNEO — prioridade em Mobitz II e BAV total: são bloqueios INFRANODAIS, onde a droga tem pouca ação e a atropina nenhuma. Aqui o marcapasso não é alternativa, é o caminho.",
        "Ajustar frequência 60–80 bpm; analgesia/sedação para conforto; confirmar captura elétrica (espícula + QRS) e mecânica (pulso femoral).",
        "DROGA — comece por ela quando o marcapasso vai demorar, quando o bloqueio NÃO é de alto grau, ou como ponte enquanto ele é montado:",
        "· Dopamina 5–20 mcg/kg/min IV em infusão — titular pela FC e pela PA.",
        "· Epinefrina 2–10 mcg/min IV em infusão — preferir quando há hipotensão associada.",
        "Reavaliar após CADA medida. Se a droga não sustentar a frequência e a perfusão, o marcapasso passa a ser obrigatório — e o contrário também vale: sem captura, a droga continua.",
        // Sem isto, o fluxo escalava suporte para sempre sem perguntar POR QUE a
        // atropina não funcionou. Em intoxicação por betabloqueador ou
        // bloqueador de canal de cálcio, e em hipercalemia, nenhuma dose de
        // atropina resolve — o que resolve é o antídoto, e o suporte só compra
        // tempo. As doses ficam nos módulos próprios, não copiadas aqui: dose
        // duplicada é dose que um dia diverge.
        "⚠️ PERGUNTE POR QUE a atropina não funcionou — há causas em que ela NÃO vai funcionar por dose nenhuma:",
        "· Intoxicação por BETABLOQUEADOR ou BLOQUEADOR DE CANAL DE CÁLCIO → o tratamento é o antídoto (glucagon, cálcio, insulina em altas doses), não mais atropina. Ver o módulo de Intoxicações exógenas.",
        "· HIPERCALEMIA (bradicardia com QRS alargado, onda T apiculada) → cálcio IV imediato e as demais medidas. Ver o módulo de Correções eletrolíticas.",
        "· INTOXICAÇÃO DIGITÁLICA → considerar anticorpo antidigoxina (Fab); evitar cálcio.",
        "· HIPÓXIA, HIPOTERMIA, IAM DE PAREDE INFERIOR, hipertensão intracraniana (reflexo de Cushing) — tratar a causa muda a bradicardia; o suporte sozinho não.",
        "· Mobitz II e BAV total são infranodais: a atropina não age ali. Marcapasso, não mais atropina.",
      ],
      next: "after_second_line",
    },

    after_second_line: {
      id: "after_second_line",
      type: "decision",
      title: "Estabilizou com marcapasso/drogas?",
      question: "O paciente está estável com MP-TC e/ou infusão de droga cronotrópica?",
      evidence: [
        "Estável = FC e PA adequadas, boa perfusão, captura mantida com conforto.",
        "Refratário = persiste instável apesar de MP-TC e drogas.",
      ],
      options: [
        { id: "estabilizou", label: "Sim — estável com suporte", next: "icu_definitive" },
        { id: "sem_captura", label: "O marcapasso não está capturando", next: "mp_sem_captura" },
        { id: "refratario", label: "Não — refratário ao tratamento", next: "transvenous" },
        { id: "sem_pulso", label: "Perdeu o pulso", next: "bradi_sem_pulso" },
      ],
    },

    // O equivalente ao "rearmar o SYNC" da taquicardia: antes de declarar
    // refratariedade e chamar o transvenoso, conferir se o aparelho está de
    // fato capturando. Falha de captura por técnica é comum e tem conserto
    // imediato — e é confundida com refratariedade justamente por quem tem
    // menos prática, que é quem este fluxo existe para ajudar.
    mp_sem_captura: {
      id: "mp_sem_captura",
      type: "action",
      title: "Marcapasso sem captura — antes de declarar refratário",
      summary: "Falha de captura quase sempre é técnica, e tem conserto imediato. Confira antes de escalar.",
      actions: [
        "SUBIR A CORRENTE (mA) progressivamente até obter captura. Começar baixo e subir é correto, mas parar cedo demais é a falha mais comum — vá até capturar ou até o limite do aparelho.",
        "CAPTURA ELÉTRICA: cada espícula tem de ser seguida de um QRS ALARGADO com onda T. Espícula isolada, sem QRS atrás, NÃO é captura.",
        "CAPTURA MECÂNICA: confirme PULSO no FEMORAL, não no carotídeo. A contração dos músculos do pescoço pela própria estimulação simula pulso carotídeo e engana — é o erro clássico.",
        "Conferir os eletrodos: bem aderidos, pele seca e sem pelos, posição ântero-posterior se a anterolateral não capturar. Trocar as pás se estiverem ressecadas.",
        "SEDAÇÃO E ANALGESIA: o marcapasso transcutâneo dói. Paciente que se contorce desloca o eletrodo e perde captura — e sem analgesia o tratamento acaba sendo suspenso pelo desconforto.",
        "Corrigir o que impede a captura: hipóxia, acidose grave, hipercalemia, hipotermia. Miocárdio muito hipóxico ou acidótico não responde ao estímulo.",
        "Mantendo tudo isso e ainda sem captura, é refratariedade real: marcapasso transvenoso e cardiologia com urgência, sem soltar as drogas cronotrópicas.",
      ],
      next: "after_second_line",
    },

    transvenous: {
      id: "transvenous",
      type: "action",
      title: "Marcapasso transvenoso temporário (AHA 2025)",
      summary: "Bradicardia instável refratária ao tratamento medicamentoso.",
      actions: [
        "Considerar marcapasso transvenoso temporário para aumentar a FC e melhorar os sintomas (AHA 2025).",
        "Acionar cardiologia / equipe de hemodinâmica com urgência.",
        "Manter MP-TC e/ou drogas como ponte até a colocação do transvenoso.",
        "Continuar investigando e tratando a causa subjacente.",
      ],
      next: "icu_definitive",
    },

    icu_definitive: {
      id: "icu_definitive",
      type: "transition",
      title: "UTI + cardiologia para marcapasso definitivo",
      summary: "Suporte avançado mantido até tratamento definitivo.",
      disposition: "icu",
      exitCriteria: [
        "Transferir para UTI com monitorização contínua.",
        "Cardiologia para avaliação de marcapasso definitivo.",
        "Manter suporte hemodinâmico e tratar a causa reversível.",
      ],
      targets: [],
    },
  },
};
