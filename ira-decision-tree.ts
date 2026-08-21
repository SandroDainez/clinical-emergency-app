import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  IRA_DOIS_EIXOS,
  IRA_ESTADIAMENTO_KDIGO,
  IRA_REVISAO_EM_CURSO,
  IRA_SEM_BASE_ACOES,
  IRA_SEM_BASE_PORQUE,
  IRA_OBSTRUCAO_ACOES,
  IRA_OBSTRUCAO_PORQUE,
  IRA_APOS_ALIVIO_ACOES,
  IRA_APOS_ALIVIO_PORQUE,
  IRA_PRE_RENAL_ACOES,
  IRA_PRE_RENAL_PORQUE,
  IRA_NEFROTOXICO_ACOES,
  IRA_NEFROTOXICO_PORQUE,
  IRA_O_QUE_NAO_CONDUZ_PORQUE,
  ALCA_QUANDO_HA_SOBRECARGA,
  ARMADILHA_DIURETICO_PARA_O_RIM,
  ARMADILHA_DIURETICO_PARA_PREVENIR,
  ARMADILHA_DOPAMINA_RENAL,
  ARMADILHA_VOLUME_PELA_CREATININA,
  ARMADILHAS_PORQUE,
  IRA_ACIONAR_ACOES,
  PRE_RENAL_CRISTALOIDE,
  IRA_ACIONAR_PORQUE,
} from "./lib/injuria-renal-aguda";
import {
  ALCA_ALERTA_HIPOVOLEMIA,
  ALCA_CONGESTO,
  ALCA_CONGESTO_PORQUE,
  ALCA_EUVOLEMICO,
  ALCA_EUVOLEMICO_PORQUE,
  ALCA_HIPOVOLEMICO,
  ALCA_OLIGURIA,
  ALCA_OLIGURIA_PORQUE,
  ALCA_REAVALIACAO,
  DOSE_ALCA_DESCONGESTAO,
  DOSE_ALCA_ESCALADA,
  DOSE_ALCA_PORQUE,
  HIPERCALEMIA_BICARBONATO,
  HIPERCALEMIA_GLICOSE_PADRAO,
  HIPERCALEMIA_GLICOSE_PORQUE,
  HIPERCALEMIA_JANELA_FONTE,
  HIPERCALEMIA_JANELA_PORQUE,
  HIPERCALEMIA_DESLOCAR_BETA2,
  HIPERCALEMIA_DESLOCAR_INSULINA,
  HIPERCALEMIA_ESTABILIZAR,
  HIPERCALEMIA_GLICEMIA,
  HIPERCALEMIA_POR_QUE_TRES_FRENTES,
  HIPERCALEMIA_PSEUDO,
  HIPERCALEMIA_REAVALIAR,
  HIPERCALEMIA_REMOVER,
  HIPERCALEMIA_REMOVER_TRS,
  K_GRAVE,
} from "./lib/hipercalemia";
import {
  camposDeInstabilidade,
  INTRO_GUIADA,
  OPCAO_GUIADA,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";
import {
  ACIDOSE_SEM_GASOMETRIA,
  ACIDOSE_SEM_LIMIAR,
  BEXIGA_CHEIA_NAO_E_ANURIA,
  CAMPOS_DE_ACIDOSE,
  CAMPO_DE_JULGAMENTO_ACIDOSE,
  CAMPOS_DE_ACIDOSE_GUIADA,
  ACIDOSE_GUIADA_INTRO,
  ACIDOSE_GRAVE_DEFINICAO,
  ACIDOSE_REFRATARIA_DEFINICAO,
  destinoDaAcidoseGuiada,
  leituraDaAcidose,
  CAMPOS_DE_CONGESTAO,
  CAMPOS_DE_DIURESE,
  CAMPOS_DE_UREMIA,
  CRONICIDADE_INTRO,
  INTRO_DIURESE,
  CAMPOS_DE_CRONICIDADE,
  CAMPOS_DE_RISCO_DE_K,
  CAMPOS_DE_VOLEMIA,
  CAMPOS_SEM_GASOMETRIA,
  concluiAcidose,
  concluiCongestao,
  concluiCronicidade,
  concluiDiurese,
  concluiUremia,
  concluiVolemia,
  OPCAO_DESCOBRIR,
  temRiscoDeHipercalemia,
  UREMIA_NAO_E_NUMERO,
} from "./lib/descoberta-guiada-renal";

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

  /**
   * ⚠️ O ESTÁGIO KDIGO É DERIVADO DOS DADOS, NUNCA ESCRITO À MÃO.
   *
   * A especificação (§5) exige quatro coisas, e as quatro são recusas:
   *   · calcular só quando houver dados suficientes;
   *   · dizer QUAL critério determinou o estágio;
   *   · informar quando os dados forem insuficientes;
   *   · nunca presumir basal, nunca inventar diurese, nunca classificar com
   *     falsa precisão.
   *
   * Por isso cada eixo devolve o seu próprio texto: quem tem só a diurese vê o
   * estágio pela diurese e vê escrito o que falta para o outro eixo. O estágio
   * final é o PIOR dos dois — nunca a soma (KDIGO 2012).
   */
  derive: (v) => {
    // ⚠️ A LEITURA DA ACIDOSE É DERIVADA AQUI, e não no nó: `derive` é da ÁRVORE
    // (um lugar só para todos os tokens). Ela devolve o que foi respondido, lido
    // junto — não um selo automático, e nunca uma conclusão de diálise.
    const leitura_acidose = leituraDaAcidose(v);
    const num = (x?: string) => {
      const n = Number(String(x ?? "").replace(",", "."));
      return Number.isFinite(n) ? n : undefined;
    };
    const creatinina = num(v.creatinina);
    const basal = num(v.basal);
    const peso = num(v.peso);
    const diureseMlH = num(v.diurese_ml_h);
    const horas = num(v.horas_oliguria);

    // ── eixo creatinina ──
    let ecr: number | undefined;
    let textoCr = "Eixo creatinina: falta a creatinina atual.";
    if (creatinina !== undefined && basal !== undefined && basal > 0) {
      const razao = creatinina / basal;
      if (razao >= 3 || creatinina >= 4) ecr = 3;
      else if (razao >= 2) ecr = 2;
      else if (razao >= 1.5 || creatinina - basal >= 0.3) ecr = 1;
      else ecr = 0;
      textoCr =
        ecr === 0
          ? `Eixo creatinina: ${razao.toFixed(1)}× a base — não fecha estágio.`
          : `Eixo creatinina: estágio ${ecr} (${razao.toFixed(1)}× a base).`;
    } else if (creatinina !== undefined && creatinina >= 4) {
      ecr = 3;
      textoCr = "Eixo creatinina: estágio 3 — creatinina acima de 4,0 mg/dL.";
    } else if (creatinina !== undefined) {
      textoCr = "⚠️ Eixo creatinina: sem a creatinina de base não dá para estadiar por este eixo.";
    }

    // ── eixo diurese ──
    let edi: number | undefined;
    let textoDi = "Eixo diurese: falta peso, volume ou tempo.";
    if (peso !== undefined && peso > 0 && diureseMlH !== undefined && horas !== undefined) {
      const mlKgH = diureseMlH / peso;
      if ((mlKgH < 0.3 && horas >= 24) || (diureseMlH === 0 && horas >= 12)) edi = 3;
      else if (mlKgH < 0.5 && horas > 12) edi = 2;
      else if (mlKgH < 0.5 && horas >= 6) edi = 1;
      else edi = 0;
      textoDi =
        edi === 0
          ? `Eixo diurese: ${mlKgH.toFixed(2)} mL/kg/h por ${horas} h — não fecha estágio.`
          : `Eixo diurese: estágio ${edi} (${mlKgH.toFixed(2)} mL/kg/h por ${horas} h).`;
    }

    const eixos = [ecr, edi].filter((x): x is number => x !== undefined && x > 0);
    const pior = eixos.length ? Math.max(...eixos) : undefined;
    const qualEixo =
      pior === undefined ? "" : pior === ecr && pior === edi ? "os dois eixos"
        : pior === ecr ? "o eixo da creatinina" : "o eixo da diurese";

    return {
      leitura_acidose,
      estagio_texto: pior === undefined ? "dados insuficientes" : String(pior),
      estagio_explicacao:
        pior === undefined
          ? "Não dá para estadiar com o que foi informado — e isso é informação, não falha."
          : `Determinado por ${qualEixo}.`,
      estagio_eixo_creatinina: textoCr,
      estagio_eixo_diurese: textoDi,
    };
  },
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
    // ═══ §4 · TRIAGEM DE GRAVIDADE — a primeira tela ══════════════════════
    //
    // ⚠️ O PACIENTE MAIS GRAVE TEM VÁRIAS EMERGÊNCIAS AO MESMO TEMPO. Anúrico,
    // com potássio de 7 e em choque é o caso típico, não a exceção — e uma
    // decisão de escolha única obrigaria a eleger uma e ABANDONAR as outras.
    //
    // A saída não é voltar à triagem depois de cada tratamento: um retorno ao
    // mesmo nó exigiria que o app soubesse o que já foi tratado, e `showIf` e
    // `escolher` só enxergam campos coletados — o `history` do motor é privado.
    //
    // É uma CADEIA EM ORDEM DE LETALIDADE. Cada tratamento aponta para a
    // PRÓXIMA pergunta, nunca para trás:
    //   · nenhuma emergência é abandonada — todas são perguntadas;
    //   · uma coisa por vez, que é como se trata com o paciente na frente;
    //   · o grafo é ACÍCLICO por construção, então não há laço a fechar
    //     (`auditoria-maquinas-estado` exige "nenhum ciclo sem fim");
    //   · a triagem "some" sozinha porque a cadeia ACABA — não porque alguma
    //     condição a esconda.
    //
    // Custo medido em telas: quem NÃO tem emergência gasta 1 (o caso comum);
    // quem tem, percorre 6 perguntas. As telas de "não tem" são o preço de não
    // abandonar nenhuma emergência, e é o preço certo.
    entry: {
      id: "entry",
      type: "decision",
      // ⚠️ GARFO, NÃO PORTÃO — e a diferença é clínica.
      //
      // A entrada perguntava "há emergência agora?" com Sim e Não. É a pergunta
      // que o usuário-alvo não sabe responder: se soubesse, não precisaria do
      // app. E "Não" não é resposta que alguém possa dar ANTES de verificar —
      // afirmar que não há emergência é conclusão, não ponto de partida.
      //
      // As duas saídas de agora respeitam os dois usuários reais: quem já sabe
      // qual é vai direto (velocidade preservada), e quem não sabe recebe a
      // varredura das seis — que JÁ É a resposta ao "não sei". Um terceiro
      // botão "não sei" caindo na mesma varredura seria um toque a mais sem
      // informação nova.
      // ⚠️ E O TÍTULO PRECISA NOMEAR O OBJETO. "Você já sabe qual é?" perguntava
      // sobre algo que a própria frase não dizia — pronome sem antecedente, no
      // topo da primeira tela do módulo. "Qual das SEIS" amarra a pergunta à
      // lista que está logo abaixo, e aí os dois botões respondem uma pergunta
      // completa.
      //
      // ⚠️ O TÍTULO É A PERGUNTA QUE OS BOTÕES RESPONDEM. "Há emergência agora?"
      // sobreviveu à troca da entrada e ficou órfão: uma pergunta no topo da
      // tela que nenhum dos dois botões responde. Para quem não tem
      // experiência isso é pior que ruído — é a tela pedindo uma resposta que
      // não aceita.
      title: "Você já sabe qual das seis é?",
      question: "Escolha por onde começar: ir direto à emergência que você reconheceu, ou verificar as seis comigo.",
      summary: "Antes de investigar, trate o que ameaça a vida.",
      evidence: [
        "As seis: potássio alto ou ECG alterado · choque · edema agudo de pulmão com hipoxemia · acidemia grave · uremia complicada · anúria ou oligúria piorando rápido.",
        "⚠️ Elas se acumulam no mesmo paciente. Se houver mais de uma, o app pergunta por todas, em ordem de risco de morte.",
      ],
      options: [
        { id: "sei", label: "Já sei qual é — ir direto", next: "atalhos" },
        { id: "verificar", label: "Não sei — verifique comigo", next: "e1_hipercalemia" },
      ],
    },

    /**
     * ⚠️ O ATALHO ENTRA NA EMERGÊNCIA, NÃO NA CONDUTA DELA.
     *
     * Cada opção leva à PERGUNTA daquela emergência, não direto ao tratamento.
     * Custa um toque e preserva duas coisas: a confirmação (quem escolheu
     * "congestão" ainda pode descobrir que não é) e o ramo de descoberta, que
     * some se o atalho pular a pergunta.
     *
     * E a varredura continua depois dele: tratada a emergência escolhida, o
     * fluxo segue para a seguinte da ordem. Quem entra pelo atalho não perde as
     * outras cinco — perde só as telas das que vêm antes.
     */
    atalhos: {
      id: "atalhos",
      type: "decision",
      title: "Qual delas?",
      question: "Escolha a emergência que você já reconheceu.",
      summary: "Depois dela, o app continua verificando as seguintes.",
      options: [
        { id: "k", label: "Potássio alto ou ECG alterado", next: "e1_hipercalemia" },
        { id: "perfusao", label: "Choque ou má perfusão", next: "e2_choque" },
        { id: "congestao", label: "Congestão com hipoxemia", next: "e3_congestao" },
        { id: "acidose", label: "Acidemia grave", next: "e4_acidose" },
        { id: "uremia", label: "Uremia complicada", next: "e5_uremia" },
        { id: "diurese", label: "Anúria ou oligúria piorando", next: "e6_anuria" },
        // ⚠️ QUEM ENTROU AQUI DIZENDO QUE SABIA TAMBÉM PODE NÃO SABER. Sem esta
        // saída, a única volta é o botão «Voltar» do cabeçalho — que é
        // navegação, não conduta, e não é onde o olho procura.
        { id: "nao_sei", label: "Na verdade não sei — verifique comigo", next: "e1_hipercalemia" },
      ],
    },

    /* ═══ 1/6 · POTÁSSIO ═══════════════════════════════════════════════════ */

    e1_hipercalemia: {
      id: "e1_hipercalemia",
      type: "decision",
      title: "Emergência 1 de 6 · Potássio",
      question: "Potássio alto, ou ECG com alteração de hipercalemia?",
      summary: "É a primeira porque é a que mata em minutos.",
      evidence: [
        "⚠️ A velocidade da subida importa tanto quanto o valor — quem subiu rápido tolera menos.",
      ],
      options: [
        { id: "sim", label: "Sim — tratar agora", next: "k_glicemia" },
        { id: "nao", label: "Não", next: "e2_choque" },
        { id: "nao_sei", label: OPCAO_DESCOBRIR, next: "k_tem_valor" },
      ],
    },

    k_tem_valor: {
      id: "k_tem_valor",
      type: "decision",
      title: "Descobrir · Potássio",
      question: "Você tem o valor do potássio?",
      summary: "Com o valor, o app decide. Sem ele, há dois caminhos ao mesmo tempo.",
      options: [
        { id: "tenho", label: "Tenho — informar o valor", next: "k_valor" },
        { id: "nao_tenho", label: "Não tenho", next: "k_sem_valor" },
      ],
    },

    k_valor: {
      id: "k_valor",
      type: "input",
      title: "Descobrir · O valor do potássio",
      intro: "Informe o potássio desta coleta. O app conclui a partir dele.",
      fields: [
        {
          id: "potassio",
          label: "Potássio",
          unit: "mEq/L",
          presets: [
            { value: "5.0", label: "5,0" },
            { value: "6.0", label: "6,0" },
            { value: "6.5", label: "6,5" },
            { value: "7.5", label: "7,5" },
          ],
          allowCustom: true,
          customLabel: "Outro valor",
          customKeyboard: "numeric",
        },
      ],
      next: {
        possiveis: ["k_glicemia", "k_sem_valor"],
        // ⚠️ O LIMIAR VEM DE `lib/hipercalemia.ts`, NÃO ESCRITO AQUI. É o mesmo
        // número que a tela de eletrólitos usa — se um dia mudar, muda nos dois.
        //
        // Abaixo do limiar o fluxo NÃO conclui "não é": manda fazer o ECG, que
        // é o exame que decide em qualquer valor. Potássio de 5,8 com ECG
        // alterado é emergência elétrica; concluir "não" pelo número seria
        // exatamente o erro que a tela do ECG existe para impedir.
        escolher: (v) => {
          const k = Number(String(v.potassio ?? "").replace(",", "."));
          return Number.isFinite(k) && k >= K_GRAVE ? "k_glicemia" : "k_sem_valor";
        },
      },
    },

    k_sem_valor: {
      id: "k_sem_valor",
      type: "action",
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO, não afirmação clínica: colher, acionar,
      // procurar, vigiar. Exigir força daqui produziria declaração falsa — o
      // defeito que o campo existe para impedir.
      natureza: "organizacao_do_atendimento",
      title: "Descobrir · Os dois caminhos, ao mesmo tempo",
      summary: "Um confirma, o outro decide antes do laboratório.",
      actions: [
        "Colha gasometria com eletrólitos AGORA — sai em minutos, muito antes do laboratório central.",
        "Faça um ECG de 12 derivações agora, sem esperar o resultado.",
      ],
      porque: [
        "⚠️ O ECG decide sozinho: alteração compatível manda tratar imediatamente, com ou sem o número na mão.",
        HIPERCALEMIA_PSEUDO,
      ],
      next: "k_ecg",
    },

    /**
     * ⚠️ A TELA DO DESENHO — e é aqui que o comparativo visual entra no app.
     *
     * "ECG com ondas T apiculadas" é uma tarefa de reconhecimento de padrão
     * escrita em texto. Descrever com palavras o que se reconhece com o olho
     * transfere ao usuário sem experiência a tradução mais difícil do fluxo,
     * justamente no ramo mais letal.
     *
     * As duas travas clínicas desta tela são obrigatórias e estão nas opções e
     * na conduta de cada padrão — não em texto de rodapé:
     *   · ECG alterado = tratar já, sem esperar o laboratório;
     *   · ⚠️ ECG NORMAL NÃO EXCLUI hipercalemia grave. A sensibilidade é baixa.
     */
    k_ecg: {
      id: "k_ecg",
      type: "decision",
      title: "Descobrir · O ECG se parece com algum destes?",
      question: "Compare o traçado do seu paciente com os cinco padrões.",
      summary:
        "⚠️ ECG NORMAL NÃO EXCLUI HIPERCALEMIA GRAVE — a sensibilidade do ECG é baixa, e existe potássio letal com traçado normal. Siga a verificação enquanto o exame não volta.",
      comparativo: [
        {
          figura: "ecg_normal",
          rotulo: "Normal",
          significado: "Referência de comparação: P, QRS estreito e T modesta.",
          conduta: "Não exclui nada — siga para a próxima emergência e cobre o exame.",
        },
        {
          figura: "ecg_t_apiculada",
          rotulo: "T alta, estreita e pontiaguda",
          significado: "A alteração mais precoce da hipercalemia.",
          conduta: "Trate agora.",
        },
        {
          figura: "ecg_pr_longo",
          rotulo: "PR longo e P achatada",
          significado: "A condução do átrio começa a falhar — a P encolhe e se afasta do complexo.",
          conduta: "Trate agora.",
        },
        {
          figura: "ecg_qrs_largo",
          rotulo: "P que sumiu e QRS alargado",
          significado: "O complexo perde o aspecto de espícula e se alarga — a condução está comprometida.",
          conduta: "Trate agora.",
        },
        {
          figura: "ecg_sinusoidal",
          rotulo: "Onda larga fundida com a T (sinusoidal)",
          significado: "Pré-parada.",
          conduta: "Trate agora e chame ajuda.",
        },
      ],
      options: [
        { id: "parecido", label: "Sim — parece um dos quatro alterados", next: "k_glicemia" },
        { id: "normal", label: "Não — parece o normal", next: "k_ecg_normal" },
        { id: "nao_sei", label: "Não sei dizer", next: "k_ecg_duvida" },
      ],
    },

    k_ecg_normal: {
      id: "k_ecg_normal",
      type: "action",
      // ⚠️ AFIRMAÇÃO SOBRE DESEMPENHO DE TESTE, não sobre conduta — por isso
      // prática aceita, e não recomendação. A citação NÃO foi transcrita: a
      // pendência de fonte tem alvo nomeado e aparece NA TELA, porque um selo
      // que cita fonte inexistente é pior que selo nenhum (D-67).
      procedencia: {
        forca: "pratica_aceita",
        fonte: "⚠️ PENDÊNCIA DE FONTE — alvo: UKKA 2023, a frase sobre sensibilidade do ECG na hipercalemia. NÃO transcrita para este repositório.",
        tipoDeDocumento: "Prática aceita — citação ainda não transcrita",
      },
      title: "ECG normal não exclui — siga e cobre o exame",
      summary: "A sensibilidade do ECG para hipercalemia é baixa.",
      actions: [
        "Siga para a próxima emergência — não pare a verificação aqui.",
        "Cobre o potássio da gasometria: ele é quem confirma ou afasta.",
      ],
      porque: [
        "⚠️ Existe potássio letal com ECG normal. Um traçado sem alteração muda pouco a probabilidade e não autoriza tranquilidade.",
      ],
      next: "e2_choque",
    },

    k_ecg_duvida: {
      id: "k_ecg_duvida",
      type: "input",
      title: "Descobrir · O contexto decide pela dúvida",
      // ⚠️ COLETA, E NÃO MAIS UMA DECISÃO: perguntar "há algum destes?" devolve
      // ao usuário a soma que ele acabou de dizer que não sabe fazer. Cada
      // fator vira uma pergunta que se responde olhando prescrição e história,
      // e o app soma.
      intro: INTRO_GUIADA,
      fields: CAMPOS_DE_RISCO_DE_K,
      next: {
        possiveis: ["k_glicemia", "k_ecg_normal"],
        escolher: (v) => (temRiscoDeHipercalemia(v) ? "k_glicemia" : "k_ecg_normal"),
      },
    },

    /**
     * ⚠️ A GLICEMIA É PERGUNTADA ANTES DA INSULINA — e antes ela era AFIRMADA.
     *
     * A conduta dizia "com glicemia basal abaixo de 126 mg/dL, o risco é maior"
     * num módulo que nunca perguntou a glicemia: o app falava de um valor que
     * não tinha. E é valor que MUDA O QUE SE FAZ nos próximos minutos — é ele
     * que decide a glicose prolongada depois do bolus.
     *
     * Campo numérico com saída para quem não tem: sem o valor, o app NÃO
     * ramifica e NÃO adivinha — manda medir antes e monitorar depois, que é
     * verdade com ou sem limiar.
     */
    k_glicemia: {
      id: "k_glicemia",
      type: "input",
      title: "Antes da insulina · a glicemia",
      intro:
        "A insulina vem na segunda frente do tratamento. Meça a glicemia antes dela — é este número que você vai comparar com o próximo.",
      fields: [
        {
          id: "glicemia",
          label: "Glicemia capilar agora",
          unit: "mg/dL",
          presets: [
            { value: "70", label: "70" },
            { value: "100", label: "100" },
            { value: "140", label: "140" },
            { value: "200", label: "200" },
          ],
          allowCustom: true,
          customLabel: "Outro valor",
          customKeyboard: "numeric",
          optional: true,
        },
        {
          id: "temGlicemia",
          label: "Se não tiver o valor agora",
          presets: [{ value: "nao_tenho", label: "Não tenho esse valor" }],
          optional: true,
        },
      ],
      next: "trata_hipercalemia",
    },

    /**
     * ⚠️ AS CINCO RESPOSTAS, POR ITEM: o que dar · quanto · por qual via · em
     * quanto tempo · o que reavaliar e quando. Uma tela que nomeia a alteração
     * sem dizer a conduta não é auxílio, é cobrança.
     *
     * ⚠️ E FALTA UMA COISA DE PROPÓSITO: o diurético de alça. O repositório diz
     * "considerar diurético se houver diurese", sem dose, via nem tempo — e nó
     * de ação com três das cinco respostas não é nó de ação. Fica fora até a
     * dose ter fonte (pendência aberta), em vez de ser inventado.
     */
    trata_hipercalemia: {
      id: "trata_hipercalemia",
      type: "action",
      title: "Hipercalemia — estabilizar, deslocar, remover",
      summary: "São três frentes diferentes, e a ordem importa.",
      actions: [
        HIPERCALEMIA_ESTABILIZAR,
        HIPERCALEMIA_DESLOCAR_INSULINA,
        HIPERCALEMIA_GLICOSE_PADRAO,
        HIPERCALEMIA_DESLOCAR_BETA2,
        HIPERCALEMIA_REMOVER,
        HIPERCALEMIA_REMOVER_TRS,
        HIPERCALEMIA_REAVALIAR,
      ],
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Módulo de Eletrólitos — bula oficial (DailyMed) e recomendações aceitas para hipercalemia",
        tipoDeDocumento: "bula e recomendações amplamente aceitas — NÃO é diretriz graduada",
        contextoDaFonte:
          "⚠️ Nenhuma diretriz de hipercalemia está citada no repositório. A UKKA aguda existe e NÃO recomenda diurético de alça; a KDIGO não tem diretriz de hipercalemia, só relatório de conferência.",
      },
      porque: [
        HIPERCALEMIA_POR_QUE_TRES_FRENTES,
        HIPERCALEMIA_GLICEMIA,
        HIPERCALEMIA_GLICOSE_PORQUE,
        HIPERCALEMIA_JANELA_PORQUE,
        HIPERCALEMIA_JANELA_FONTE,
        HIPERCALEMIA_BICARBONATO,
        HIPERCALEMIA_PSEUDO,
        "O módulo de Eletrólitos escolhe entre cloreto e gluconato de cálcio conforme o acesso, e refaz a conta com o valor do caso.",
        // ⚠️ A FONTE DESTA TELA NÃO É A DO RODAPÉ, e isso precisa estar escrito.
        // O rodapé do módulo diz KDIGO 2012, que é a base do ESTADIAMENTO. As
        // doses daqui vêm do módulo de Eletrólitos. Enquanto a fonte for por
        // MÓDULO e não por NÓ (E-4), a distinção só existe se alguém a
        // escrever — e uma dose atribuída à diretriz errada é procedência falsa.
        "⚠️ PROCEDÊNCIA DESTAS DOSES: módulo de Eletrólitos — bula oficial (DailyMed) e recomendações aceitas para hipercalemia, revisão de 2026-04-15. NÃO são do KDIGO 2012, que é a base do estadiamento no rodapé.",
      ],
      // ⚠️ SEM RAMO POR NÚMERO. O corte de 126 mg/dL que ramificava aqui não
      // tinha frase de fonte no repositório — era herança por vizinhança. A
      // glicose voltou a ser PADRÃO junto com a insulina, que é o lado seguro
      // da assimetria, e o valor de dispensa virou pendência de fonte.
      next: "k_eliminacao_renal",
    },

    /**
     * ⚠️ A FUROSEMIDA FICA LIGADA AO RACIOCÍNIO DA HIPERCALEMIA, MAS SUBORDINADA
     * A DIURESE E VOLEMIA — arquitetura escolhida pelo autor (nem tirar do
     * módulo, nem oferecer como medida de remoção ao lado da diálise).
     *
     * ⚠️ E A DÚVIDA NÃO FAZ A OPÇÃO SUMIR. Uma proposta anterior mandava
     * esconder o diurético quando a volemia fosse incerta — o que contraria a
     * regra do próprio app: dúvida leva a RAMO DE DESCOBERTA, nunca ao
     * desaparecimento da opção.
     */
    k_eliminacao_renal: {
      id: "k_eliminacao_renal",
      type: "decision",
      title: "Dá para contar com o rim para tirar o potássio?",
      question: "Como estão a diurese e a volemia deste paciente?",
      summary:
        "⚠️ Nenhuma resposta aqui substitui a diálise quando há indicação dialítica — falha de resposta ao diurético NÃO adia TRS.",
      options: [
        { id: "congesto", label: "Congesto (edema, estase, crepitações) e urinando", next: "alca_congesto" },
        { id: "euvolemico", label: "Nem seco nem congesto, e urinando", next: "alca_euvolemico" },
        { id: "hipovolemico", label: "Seco — perdas, mucosa seca, hipotenso", next: "alca_hipovolemico" },
        { id: "oliguria", label: "Anúrico ou oligúrico", next: "alca_oliguria" },
        { id: "guiado", label: OPCAO_GUIADA, next: "alca_volemia_dados" },
      ],
    },

    alca_volemia_dados: {
      id: "alca_volemia_dados",
      type: "input",
      title: "Descobrir · Volemia, para decidir sobre o diurético",
      intro: INTRO_GUIADA,
      fields: CAMPOS_DE_VOLEMIA,
      next: {
        possiveis: ["alca_congesto", "alca_hipovolemico", "alca_euvolemico"],
        escolher: (v) => {
          const r = concluiVolemia(v);
          if (r === "congesto") return "alca_congesto";
          return r === "seco" ? "alca_hipovolemico" : "alca_euvolemico";
        },
      },
    },

    alca_congesto: {
      id: "alca_congesto",
      type: "action",
      title: "Congesto e urinando — o diurético entra pela SOBRECARGA",
      summary: "A indicação primária é volume; a caliurese é benefício adicional.",
      // ⚠️ PONTO DA TENTAÇÃO do diurético: é a única tela do módulo que o
      // prescreve, e a indicação certa (sobrecarga) fica a um passo da errada
      // (o rim). A armadilha vem antes da dose, não depois.
      actions: [ARMADILHA_DIURETICO_PARA_O_RIM, ALCA_QUANDO_HA_SOBRECARGA, ALCA_CONGESTO, ALCA_REAVALIACAO],
      porque: ALCA_CONGESTO_PORQUE,
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "UKKA 2023 — Treatment of Acute Hyperkalaemia in Adults, Guideline 7.1",
        classeOuGrau: "Grau 2C",
        contextoDaFonte:
          "⚠️ A 7.1 é sobre hipercalemia CRÔNICA na comunidade. Aqui ela sustenta apenas os condicionantes — não-oligúrico, volemia adequada —, nunca o uso agudo como medida de remoção.",
      },
      // ⚠️ APONTA SEM SALTAR — e foi a trava de pressuposição que mostrou por
      // quê: o salto para `congesto_conduta` criava um caminho até a etiologia
      // que PULAVA a coleta dos números do caso, e lá adiante o texto fala de
      // creatinina como se alguém a tivesse perguntado. A varredura continua; a
      // congestão é tratada na 3/6, que é onde ela mora, e a dose está lá.
      next: "e2_choque",
    },

    alca_euvolemico: {
      id: "alca_euvolemico",
      type: "action",
      title: "Euvolêmico e urinando — adjuvante, não rotina",
      summary: "Não é medida de remoção em que se possa confiar no agudo.",
      actions: [ALCA_EUVOLEMICO, ALCA_REAVALIACAO],
      porque: ALCA_EUVOLEMICO_PORQUE,
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Rafique et al., 2021 — Hyperkalemia management in the emergency department (JACEP Open)",
        tipoDeDocumento: "consenso de painel de especialistas",
        contextoDaFonte:
          "⚠️ Consenso, não estudo de eficácia: faltam dados de início de ação e de magnitude da remoção no cenário agudo. Não usar isoladamente.",
      },
      next: "e2_choque",
    },

    alca_hipovolemico: {
      id: "alca_hipovolemico",
      type: "action",
      title: "Seco — diurético aqui piora o paciente",
      summary: ALCA_ALERTA_HIPOVOLEMIA,
      actions: [ALCA_HIPOVOLEMICO],
      porque: [
        "Sem volume circulante não há filtração, e sem filtração não há caliurese: o diurético não entrega o que promete e ainda tira o que falta.",
      ],
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "UKKA 2023 — Guideline 7.1 (condicionantes)",
        classeOuGrau: "Grau 2C",
        contextoDaFonte:
          "⚠️ Usada só pelos condicionantes fisiológicos — a UKKA aguda NÃO recomenda diurético de alça no algoritmo hospitalar.",
      },
      next: "e2_choque",
    },

    alca_oliguria: {
      id: "alca_oliguria",
      type: "action",
      title: "Anúrico ou oligúrico — não conte com o diurético",
      summary: ALCA_ALERTA_HIPOVOLEMIA,
      actions: [ALCA_OLIGURIA],
      porque: ALCA_OLIGURIA_PORQUE,
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "UKKA 2023 — Guideline 7.1 (condicionantes)",
        classeOuGrau: "Grau 2C",
        contextoDaFonte:
          "⚠️ Condicionante fisiológico da 7.1, que é de hipercalemia crônica. A decisão de TRS segue o protocolo agudo, não a resposta ao diurético.",
      },
      // Aponta sem saltar, pela mesma razão do ramo congesto: a conversa da TRS
      // tem nó próprio adiante, depois da coleta dos números — e o texto acima
      // já manda avaliá-la precocemente.
      next: "e2_choque",
    },

    /* ═══ 2/6 · PERFUSÃO ═══════════════════════════════════════════════════ */

    e2_choque: {
      id: "e2_choque",
      type: "decision",
      title: "Emergência 2 de 6 · Perfusão",
      question: "Há choque ou instabilidade hemodinâmica?",
      // ⚠️ SEM RAMO DE "NÃO SEI", E DE PROPÓSITO: aqui a dúvida JÁ DECIDE a
      // conduta, e abrir um passo custa segundos na triagem (D-59).
      summary:
        // ⚠️ O LACTATO SAIU DA FRASE. Ele nunca é capturado neste módulo, e a regra
      // não depende dele: os outros três marcadores a sustentam. Achado que o app
      // não pergunta não entra em texto como se ele soubesse.
      "NA DÚVIDA, responda sim. Hipoperfusão sem hipotensão — pele fria, consciência rebaixada, diurese caindo — já é choque, e esperar a pressão cair para chamá-lo assim é chegar depois.",
      options: [
        { id: "sim", label: "Sim — tratar agora", next: "trata_choque" },
        { id: "nao", label: "Não", next: "e3_congestao" },
        // ⚠️ O RÓTULO É O DE `instabilidade-guiada`, NÃO O DAS OUTRAS CINCO:
        // este ramo é o componente que já existe, com os critérios da AHA, e o
        // usuário reconhece a mesma frase que vê na bradicardia e na sepse.
        { id: "guiado", label: OPCAO_GUIADA, next: "perf_dados" },
      ],
    },

    perf_dados: {
      id: "perf_dados",
      type: "input",
      title: "Descobrir · Perfusão",
      intro: INTRO_GUIADA,
      fields: camposDeInstabilidade(),
      // ⚠️ LIMÍTROFE VAI PARA O TRATAMENTO, e é decisão desta árvore: metade de
      // um critério composto num rim que já falhou é o lado em que hesitar
      // custa caro. Nos módulos de arritmia o limítrofe tem outra saída; aqui
      // a pergunta original já mandava responder "sim" na dúvida.
      next: roteamentoDeInstabilidade({
        instavel: "trata_choque",
        limitrofe: "trata_choque",
        estavel: "e3_congestao",
      }),
    },

    trata_choque: {
      id: "trata_choque",
      type: "action",
      // ⚠️ TRANSIÇÃO: este nó roteia para outro módulo. A força das condutas é a
      // das fontes DAQUELE módulo — restá-la aqui seria duplicar procedência, e
      // procedência duplicada é como dois módulos divergem com o tempo.
      natureza: "transicao",
      title: "Choque com IRA — a perfusão vem antes do rim",
      summary: "Sem pressão de perfusão não há filtração.",
      // ⚠️ PONTEIRO PURO. As duas linhas clínicas que moravam aqui saíram: a do
      // volume virou ARMADILHA no ponto da tentação (`pre_renal`), e a do
      // nefrotóxico já vive em `fazer_agora`. Nó de transição que afirma clínica
      // é procedência duplicada esperando divergir.
      actions: [
        "Trate o choque pelo seu tipo — o app tem os módulos de CHOQUE, SEPSE e VASOATIVOS.",
      ],
      porque: [
        "IECA, BRA e AINE reduzem a filtração justamente quando a perfusão já está baixa.",
        "A creatinina não é o alvo do tratamento do choque — ela responde depois, se a perfusão voltar.",
      ],
      next: "e3_congestao",
    },

    e3_congestao: {
      id: "e3_congestao",
      type: "decision",
      title: "Emergência 3 de 6 · Congestão",
      question: "Edema agudo de pulmão ou hipervolemia com hipoxemia?",
      options: [
        { id: "sim", label: "Sim — tratar agora", next: "trata_congestao" },
        { id: "nao", label: "Não", next: "e4_acidose" },
        { id: "nao_sei", label: OPCAO_DESCOBRIR, next: "cong_dados" },
      ],
    },

    cong_dados: {
      id: "cong_dados",
      type: "input",
      title: "Descobrir · Congestão",
      intro: INTRO_GUIADA,
      fields: CAMPOS_DE_CONGESTAO,
      next: {
        possiveis: ["trata_congestao", "e4_acidose"],
        escolher: (v) => (concluiCongestao(v) === "sim" ? "trata_congestao" : "e4_acidose"),
      },
    },

    trata_congestao: {
      id: "trata_congestao",
      type: "action",
      // ⚠️ TRANSIÇÃO: este nó roteia para outro módulo. A força das condutas é a
      // das fontes DAQUELE módulo — restá-la aqui seria duplicar procedência, e
      // procedência duplicada é como dois módulos divergem com o tempo.
      natureza: "transicao",
      title: "Congestão com hipoxemia — a troca gasosa primeiro",
      summary: "O alvo é a respiração, não a creatinina.",
      // ⚠️ PONTEIRO PURO, mesma razão. A linha do diurético virou ARMADILHA e
      // aparece onde a prescrição é tentadora (`alca_congesto`); a da diálise
      // refratária já é critério declarado em `trs_check`.
      actions: [
        "Abra o módulo de EDEMA AGUDO DE PULMÃO para conduzir a congestão.",
      ],
      porque: [
        "Tratar rim com furosemida é o erro mais comum deste cenário.",
        "Sobrecarga de volume refratária com repercussão é uma das indicações de TRS.",
      ],
      next: "e4_acidose",
    },

    e4_acidose: {
      id: "e4_acidose",
      type: "decision",
      title: "Emergência 4 de 6 · Ácido-base",
      question: "Acidemia grave, ou que não responde ao tratamento?",
      // ⚠️ Mesma razão do e2: regra escrita no nó em vez de ramo próprio.
      summary:
        "NA DÚVIDA, sem gasometria à mão, responda não e siga — nenhuma das outras emergências depende desta resposta. Peça a gasometria em paralelo: ela informa a decisão, e o pH isolado não é critério único.",
      options: [
        { id: "sim", label: "Sim — tratar agora", next: "trata_acidose" },
        { id: "nao", label: "Não", next: "e5_uremia" },
        { id: "nao_sei", label: OPCAO_DESCOBRIR, next: "acid_tem_gaso" },
      ],
    },

    acid_tem_gaso: {
      id: "acid_tem_gaso",
      type: "decision",
      title: "Descobrir · Ácido-base",
      question: "Você tem gasometria?",
      summary: "Com ela, você tem o número na mão para julgar. Sem ela, a resposta é presuntiva — e isso fica dito.",
      options: [
        { id: "tenho", label: "Tenho — informar", next: "acid_gaso" },
        { id: "nao_tenho", label: "Não tenho", next: "acid_sinais" },
      ],
    },

    acid_gaso: {
      id: "acid_gaso",
      type: "input",
      title: "Descobrir · A gasometria",
      // ⚠️ A GASOMETRIA INFORMA, E NÃO DECIDE SOZINHA (2026-08-21). O pH < 7,0
      // saiu como limiar e NÃO foi substituído por outro número — o julgamento
      // do médico é que conclui, com o contexto, a causa e a possibilidade de
      // correção na frente. Ver R-97: critério de inclusão de ensaio não é
      // limiar de conduta.
      intro: ACIDOSE_SEM_LIMIAR,
      fields: [...CAMPOS_DE_ACIDOSE, ...CAMPO_DE_JULGAMENTO_ACIDOSE],
      next: {
        // ⚠️ A TERCEIRA SAÍDA ABRE RAMO, não texto: "não sei" que devolve
        // explicação já foi reprovado duas vezes neste app.
        possiveis: ["acid_descobrir", "trata_acidose", "e5_uremia"],
        escolher: (v) =>
          v.acidemiaGrave === "nao_sei"
            ? "acid_descobrir"
            : concluiAcidose(v) === "sim"
              ? "trata_acidose"
              : "e5_uremia",
      },
    },

    /**
     * ⚠️ O RAMO DO "NÃO SEI" DA ACIDOSE — perguntas menores, de beira de leito.
     * Nenhuma delas pede número, e `valida-ira` reprova se algum entrar.
     */
    acid_descobrir: {
      id: "acid_descobrir",
      type: "input",
      title: "Descobrir · Grave ou refratária?",
      intro: ACIDOSE_GUIADA_INTRO,
      fields: CAMPOS_DE_ACIDOSE_GUIADA,
      next: {
        possiveis: ["acid_causa", "acid_outra_trs", "trata_acidose", "e5_uremia"],
        escolher: destinoDaAcidoseGuiada,
      },
    },

    acid_causa: {
      id: "acid_causa",
      type: "action",
      title: "A causa vem antes de graduar a acidemia",
      summary: "{leitura_acidose}",
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO: o nó devolve a leitura do que foi
      // respondido e manda ao passo anterior do raciocínio. Não afirma gravidade
      // e não conclui diálise — quem decide indicação dialítica é o nó da 5.1.1.
      natureza: "organizacao_do_atendimento",
      actions: [
        "Identifique a causa da acidose antes de decidir se ela é grave.",
        "⚠️ Acidose sem causa identificada não é \"leve\" — é NÃO AVALIADA.",
        "Trate a causa e restaure a perfusão; depois reavalie.",
        ACIDOSE_GRAVE_DEFINICAO,
        ACIDOSE_REFRATARIA_DEFINICAO,
      ],
      porque: [
        "➜ As duas definições acima são OPERACIONALIZAÇÃO NOSSA: a KDIGO fala em alteração ameaçadora à vida, e não define grave nem refratária por valor.",
        "➜ Por isso nenhuma das perguntas deste ramo pede número — nem pH, nem bicarbonato, nem base excess.",
      ],
      next: "e5_uremia",
    },

    acid_outra_trs: {
      id: "acid_outra_trs",
      type: "action",
      title: "Isto já não é graduar a acidose",
      summary: "{leitura_acidose}",
      // ⚠️ APONTA SEM SALTAR. A conversa da diálise acontece no fim da varredura,
      // com o caso inteiro na mão — saltar para lá daqui pularia a coleta dos
      // dados, e foi a trava de pressuposição que pegou isso.
      natureza: "organizacao_do_atendimento",
      actions: [
        "Com outra indicação coexistindo, a decisão passa a ser a INDICAÇÃO DIALÍTICA pelo conjunto — não o grau da acidemia.",
        "Siga a varredura: a conversa da diálise vem adiante, com o caso inteiro na mão.",
      ],
      porque: [
        "➜ A KDIGO 5.1.1 fala do conjunto — alteração de volume, eletrólito ou ácido-base que ameace a vida —, não de um eixo isolado.",
      ],
      next: "e5_uremia",
    },

    acid_sinais: {
      id: "acid_sinais",
      type: "input",
      title: "Descobrir · Sem gasometria",
      intro: ACIDOSE_SEM_GASOMETRIA,
      fields: CAMPOS_SEM_GASOMETRIA,
      next: {
        possiveis: ["trata_acidose", "e5_uremia"],
        escolher: (v) => (concluiAcidose(v) === "sim" ? "trata_acidose" : "e5_uremia"),
      },
    },

    trata_acidose: {
      id: "trata_acidose",
      type: "action",
      // ⚠️ "Not Graded" É GRAU LITERAL, NÃO GRAU AUSENTE. A KDIGO usa a categoria
      // para dizer as duas coisas: a afirmação ESTÁ na diretriz E não foi
      // graduada. Rebaixar para prática aceita perderia a primeira metade — e
      // ninguém volta a procurar a fonte do que já está classificado como prática.
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "KDIGO 2012 — Clinical Practice Guideline for Acute Kidney Injury, 5.1.1",
        classeOuGrau: "Not Graded",
        contextoDaFonte:
          "⚠️ A 5.1.1 fala de alterações AMEAÇADORAS de fluidos, eletrólitos e equilíbrio ácido-base. A acidemia grave refratária é literalmente uma delas.",
      },
      title: "Acidemia grave — tratar a causa e sustentar",
      summary: "A acidose do rim é sinal, não doença isolada.",
      actions: [
        "Trate a causa — perfusão, sepse, intoxicação, cetoacidose.",
        "Sustente ventilação e oxigenação enquanto a causa é tratada.",
        "⚠️ Acidose grave que não responde é indicação de diálise, e entra na conversa da TRS.",
      ],
      porque: [
        "Bicarbonato não é conduta automática: a indicação depende do pH, da causa e da resposta.",
        "⚠️ Este app não escolhe dose de bicarbonato — isso é do contexto e do serviço.",
      ],
      next: "e5_uremia",
    },

    e5_uremia: {
      id: "e5_uremia",
      type: "decision",
      title: "Emergência 5 de 6 · Uremia",
      question: "Há uremia complicada?",
      summary: "Encefalopatia, pericardite ou sangramento urêmico.",
      evidence: [UREMIA_NAO_E_NUMERO],
      options: [
        { id: "sim", label: "Sim — tratar agora", next: "trata_uremia" },
        { id: "nao", label: "Não", next: "e6_anuria" },
        { id: "nao_sei", label: OPCAO_DESCOBRIR, next: "ur_sinais" },
      ],
    },

    ur_sinais: {
      id: "ur_sinais",
      type: "input",
      title: "Descobrir · Uremia",
      intro: INTRO_GUIADA,
      fields: CAMPOS_DE_UREMIA,
      next: {
        possiveis: ["trata_uremia", "e6_anuria"],
        escolher: (v) => (concluiUremia(v) === "sim" ? "trata_uremia" : "e6_anuria"),
      },
    },

    trata_uremia: {
      id: "trata_uremia",
      type: "action",
      title: "Uremia complicada — a diálise entra na conversa",
      summary: "Estas três complicações são indicação, não sinal de gravidade apenas.",
      // ⚠️ DUAS AFIRMAÇÕES, E SÓ UMA É NOMEADA PELA DIRETRIZ. O padrão da tela é
      // ORGANIZAÇÃO DO ATENDIMENTO — acionar a nefrologia, acionar a transferência.
      // As duas afirmações clínicas vêm nomeadas abaixo, e a distinção entre elas
      // é a que derrubou a proposta anterior: CABER NUMA FRASE GERAL NÃO É SER
      // NOMEADO. A 5.1.2 recusa o limiar isolado — isso ela diz. Pericardite e
      // sangramento urêmico cabem em "conditions that can be modified with RRT",
      // e a diretriz NÃO os nomeia: por isso ficam sem grau.
      natureza: "organizacao_do_atendimento",
      declaracoes: [
        {
          afirmacao:
            "⚠️ UREIA ISOLADA, SEM SINTOMA, NÃO INDICA DIÁLISE — decida pelo contexto, pelo que a diálise corrige e pela TENDÊNCIA dos exames.",
          procedencia: {
            forca: "recomendacao_formal",
            fonte: "KDIGO 2012 — Clinical Practice Guideline for Acute Kidney Injury, 5.1.2",
            classeOuGrau: "Not Graded",
          },
        },
        {
          afirmacao: "⚠️ Pericardite urêmica e sangramento urêmico mudam a urgência da diálise.",
          procedencia: {
            forca: "pratica_aceita",
            fonte: "Prática estabelecida — a KDIGO 5.1.2 NÃO nomeia estas complicações",
            tipoDeDocumento: "Prática clínica estabelecida",
            contextoDaFonte:
              "⚠️ Elas CABEM em \"condições que a diálise corrige\", e caber não é ser nomeado. Alvo aberto: o texto narrativo do capítulo 5.1, ainda não lido por inteiro.",
          },
        },
      ],
      actions: [
        "Acione a nefrologia agora.",
        "Acione a transferência EM PARALELO se não houver diálise no seu serviço.",
        "⚠️ UREIA ISOLADA, SEM SINTOMA, NÃO INDICA DIÁLISE — decida pelo contexto, pelo que a diálise corrige e pela TENDÊNCIA dos exames.",
        "⚠️ Pericardite urêmica e sangramento urêmico mudam a urgência da diálise.",
      ],
      porque: [
        "Encefalopatia, pericardite e sangramento são as complicações urêmicas que entram no critério.",
      ],
      next: "e6_anuria",
    },

    e6_anuria: {
      id: "e6_anuria",
      type: "decision",
      title: "Emergência 6 de 6 · Diurese",
      question: "Anúria, ou oligúria com piora rápida?",
      evidence: [BEXIGA_CHEIA_NAO_E_ANURIA],
      options: [
        { id: "sim", label: "Sim", next: "trata_anuria" },
        { id: "nao", label: "Não", next: "obstrucao_check" },
        { id: "nao_sei", label: OPCAO_DESCOBRIR, next: "diu_dados" },
      ],
    },

    diu_dados: {
      id: "diu_dados",
      type: "input",
      title: "Descobrir · Diurese",
      // ⚠️ A APROXIMAÇÃO É DITA ANTES, não depois: o critério do KDIGO é por
      // peso, e quem não tiver o peso precisa saber que a leitura muda.
      intro: INTRO_DIURESE,
      fields: CAMPOS_DE_DIURESE,
      // ⚠️ TRÊS SAÍDAS, E A PRIMEIRA MUDA O DESTINO: bexiga cheia não é anúria,
      // é retenção — e retenção é obstrução, que se resolve em minutos e já tem
      // lugar próprio no fluxo. Mandá-la para a conduta de anúria seria mandar
      // investigar rim com a solução do lado.
      next: {
        possiveis: ["retencao", "trata_anuria", "obstrucao_check"],
        escolher: (v) => {
          const r = concluiDiurese(v);
          if (r === "obstrucao") return "retencao";
          return r === "sim" ? "trata_anuria" : "obstrucao_check";
        },
      },
    },

    retencao: {
      id: "retencao",
      type: "action",
      // Aliviar obstrução é quase definicional: nenhuma diretriz gradua a
      // passagem de uma sonda de alívio. Prática aceita SEM grau — e o campo diz
      // isso, em vez de emprestar grau de recomendação vizinha.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — sem recomendação graduada conhecida",
        tipoDeDocumento: "Prática clínica estabelecida",
      },
      title: "Bexiga cheia — é retenção, não anúria",
      summary: "A saída está bloqueada; o rim pode estar filtrando normalmente.",
      actions: [
        "Passe sonda vesical de alívio agora — ou desobstrua a que já está lá.",
        "Meça o volume drenado: é ele que confirma a retenção.",
        "Depois do alívio, meça a diurese horária — é o número que estadia.",
        // ⚠️ SOBE PARA A TELA POR PRECEDÊNCIA, não por importância: ela diz o
        // que fazer ANTES de concluir. `test:prazo-visivel` reprova prazo e
        // precedência escondidos atrás de um toque, e reprovou esta.
        "⚠️ Sonda que não drena com bexiga cheia é sonda obstruída até prova em contrário — troque antes de concluir que o rim parou.",
      ],
      porque: [BEXIGA_CHEIA_NAO_E_ANURIA],
      next: "obstrucao_check",
    },

    trata_anuria: {
      id: "trata_anuria",
      type: "action",
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO, não afirmação clínica: colher, acionar,
      // procurar, vigiar. Exigir força daqui produziria declaração falsa — o
      // defeito que o campo existe para impedir.
      natureza: "organizacao_do_atendimento",
      title: "Anúria — a obstrução vem antes de qualquer conta",
      summary: "Anúria de 12 h já é estágio 3 pelo eixo da diurese.",
      actions: [
        "Vá direto para a checagem de obstrução — é a causa que se reverte em minutos.",
        "Meça a diurese em mL/kg/h para poder estadiar depois.",
      ],
      porque: [
        "A obstrução pode dar anúria com creatinina ainda normal.",
        "⚠️ Anúria por 12 h fecha estágio 3 mesmo com creatinina intacta — a creatinina sobe tarde.",
      ],
      next: "obstrucao_check",
    },

    fazer_agora: {
      id: "fazer_agora",
      type: "action",
      // ⚠️ ESTA TELA AFIRMA COISAS DE NATUREZAS DIFERENTES, e forçar uma força
      // para todas produziria mentira nos dois sentidos. O PADRÃO da tela é
      // ORGANIZAÇÃO DO ATENDIMENTO — medir a diurese, anotar a creatinina com a
      // hora, pedir a bateria de exames são o fluxo, não recomendações graduadas.
      // As duas exceções vêm nomeadas em `declaracoes`.
      natureza: "organizacao_do_atendimento",
      declaracoes: [
        {
          afirmacao: "Suspenda o que é nefrotóxico e revise as doses por função renal.",
          procedencia: {
            forca: "pratica_aceita",
            fonte: "KDIGO 2012 — recomendações DROGA-ESPECÍFICAS; a regra geral é prática aceita",
            tipoDeDocumento: "Diretriz clínica — sem recomendação graduada GERAL para nefrotóxicos",
            contextoDaFonte:
              "⚠️ A KDIGO gradua por DROGA (aminoglicosídeo, anfotericina, contraste), não como regra única. Carimbar grau aqui seria emprestar força de outro assunto.",
          },
        },
        {
          // ⚠️ NÃO É CONDUTA DESTA TELA: aponta para o módulo de eletrólitos, e a
          // força é a das condutas de lá. Declarar força aqui duplicaria
          // procedência — o mecanismo pelo qual dois módulos divergem.
          afirmacao: "Trate a hipercalemia se houver — ela mata antes do rim.",
          natureza: "transicao",
        },
      ],
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
        // ⚠️ A TABELA DE ESTADIAMENTO SAIU DAQUI, E O PONTEIRO ENTROU. Ela vivia
        // em DOIS lugares — aqui, recolhida e sem selo, e em `estagio_kdigo`, que
        // é o nó canônico e tem o selo de DEFINIÇÃO com a versão. Duas cópias já
        // divergiam na redação da nota da calculadora.
        // ⚠️ COPIAR NÃO; LEVAR SIM: o conteúdo não se repete, o leitor é levado.
        "➜ Os critérios completos dos dois eixos estão na tela ESTÁGIO KDIGO, mais adiante neste fluxo — é lá que eles têm fonte e versão declaradas.",
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
      // ⚠️ O SELO COBRE AS TRÊS PRIMEIRAS, E O `contextoDaFonte` DIZ ISSO NA
      // TELA. Os dois últimos itens não são da KDIGO — deixar o selo cobrir a
      // lista inteira seria empréstimo de força, que é o defeito que este campo
      // existe para impedir. Os graus por item estão no próprio texto.
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "KDIGO 2012 — Clinical Practice Guideline for Acute Kidney Injury",
        classeOuGrau: "3.5.1 (1A) · 3.4.1 (1B) · 3.4.2 (2C)",
        contextoDaFonte:
          "⚠️ O selo cobre as TRÊS primeiras linhas (dopamina e diurético). \"Não espere a creatinina\" e \"não repita contraste\" NÃO são recomendações graduadas da KDIGO.",
      },
      // ⚠️ A LISTA RECAPITULA, com o texto vindo da MESMA fonte que alimenta os
      // nós da tentação (E-7). Duas cópias do mesmo aviso divergiriam — e a que
      // divergisse seria justamente a que ninguém releu.
      actions: [
        ARMADILHA_VOLUME_PELA_CREATININA,
        ARMADILHA_DIURETICO_PARA_O_RIM,
        ALCA_QUANDO_HA_SOBRECARGA, // ⚠️ IMEDIATAMENTE depois do negativo — travado
        ARMADILHA_DIURETICO_PARA_PREVENIR,
        ARMADILHA_DOPAMINA_RENAL,
        "NÃO ESPERE A CREATININA para agir.",
        "Não repita contraste sem reavaliar a indicação.",
      ],
      porque: [
        ...ARMADILHAS_PORQUE,
        "➜ A creatinina sobe tarde — quem espera perde o intervalo em que a causa ainda é reversível.",
      ],
      next: "dados_do_caso",
    },

    // ── 1 · A BASE, com saída para "não sei" ──────────────────────────────
    //
    // ⚠️ A PERGUNTA VEM PRIMEIRO porque muda o SIGNIFICADO de todo o resto:
    // creatinina de 3,2 pode ser a base daquele paciente, e tratar isso como
    // IRA leva a volume desnecessário. E a saída "não sei" será COMUM — o
    // usuário geral frequentemente não tem o histórico.

    // ── A saída do "não sei", com conteúdo próprio (molde B) ──────────────
    sem_base: {
      id: "sem_base",
      type: "action",
      // ⚠️ O TÍTULO PERDEU A ATRIBUIÇÃO em 2026-08-21: ele dizia "e a diretriz
      // autoriza seguir" sem que ninguém tivesse lido a diretriz. A conduta ficou;
      // a citação saiu. Pendência com alvo nomeado: KDIGO 2012, Tabelas 8 e 9.
      title: "Sem a creatinina de base — e o atendimento não para por isso",
      summary:
        "PRESUMA BASE NORMAL E TRATE COMO AGUDO ATÉ PROVA EM CONTRÁRIO — é o erro mais seguro dos dois. Mas com o VOLUME MAIS CAUTELOSO, em alíquotas menores, reavaliando ausculta e oximetria entre elas.",
      actions: IRA_SEM_BASE_ACOES,
      porque: IRA_SEM_BASE_PORQUE,
      next: "volume_check",
    },

    cronico_agudizado: {
      id: "cronico_agudizado",
      type: "action",
      // Método de interpretação (ler o número contra a base DELE) e prudência
      // clínica (volume mais cauteloso). Não há grau para nenhum dos dois.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — método de interpretação, sem recomendação graduada",
        tipoDeDocumento: "Prática clínica estabelecida",
      },
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
      ],
      next: "obstrucao_check",
    },

    // ═══ §5 · CONFIRMAÇÃO E CLASSIFICAÇÃO ════════════════════════════════
    dados_do_caso: {
      id: "dados_do_caso",
      type: "input",
      title: "Os números do caso",
      intro: "O que você tiver. O app diz o que dá para concluir com isso.",
      fields: [
        { id: "creatinina", label: "Creatinina atual", unit: "mg/dL",
          presets: [{ label: "1,5", value: "1.5" }, { label: "2,0", value: "2.0" },
                    { label: "3,0", value: "3.0" }, { label: "4,0", value: "4.0" }],
          allowCustom: true, customLabel: "Outro valor", customKeyboard: "numeric" },
        { id: "peso", label: "Peso", unit: "kg",
          presets: [{ label: "60", value: "60" }, { label: "70", value: "70" },
                    { label: "80", value: "80" }, { label: "90", value: "90" }],
          allowCustom: true, customLabel: "Outro peso", customKeyboard: "numeric", optional: true },
        // ⚠️ AQUI O PESO NÃO COMANDA DOSE — COMANDA ESTÁGIO. A diurese é lida em
        // mL/kg/h, e um peso chutado desloca a fronteira de 0,5 e de 0,3: o
        // mesmo volume vira estágio 1 num peso e estágio 2 noutro. A procedência
        // é a mesma ressalva das árvores de dose, pela mesma razão.
        { id: "pesoOrigem", label: "Este peso é", optional: true,
          presets: [{ value: "estimado", label: "Estimado" },
                    { value: "real", label: "Real (pesado)" }] },
        { id: "diurese_ml_h", label: "Diurese", unit: "mL/h",
          presets: [{ label: "0 (anúria)", value: "0" }, { label: "10", value: "10" },
                    { label: "20", value: "20" }, { label: "40", value: "40" }],
          allowCustom: true, customLabel: "Outro valor", customKeyboard: "numeric", optional: true },
        { id: "horas_oliguria", label: "Há quantas horas", unit: "h",
          presets: [{ label: "6", value: "6" }, { label: "12", value: "12" },
                    { label: "24", value: "24" }],
          allowCustom: true, customLabel: "Outro", customKeyboard: "numeric", optional: true },
      ],
      next: "sobre_drc",
    },

    // ═══ §6 · IRA, DRC OU IRA SOBRE DRC — quatro saídas, não duas ═════════
    //
    // ⚠️ NÃO TRATAR TODA CREATININA ELEVADA COMO IRA. O nó antigo tinha três
    // saídas e nenhuma para "DRC sem agudização" — o paciente cujo número é o
    // habitual dele caía no fluxo de IRA e recebia volume por causa do número.
    sobre_drc: {
      id: "sobre_drc",
      type: "decision",
      title: "O rim antes de hoje",
      question: "O que você sabe sobre este rim ANTES de hoje?",
      summary: "⚠️ Nem toda creatinina elevada é aguda.",
      evidence: [
        "Conta como evidência de DRC prévia: creatininas anteriores, eTFG prévia, albuminúria conhecida, rins pequenos ao ultrassom, ou diagnóstico já feito.",
        "⚠️ Não trate um número sem base: volume nele é dano, não cuidado.",
        "A base útil é o menor valor conhecido nos últimos 3 a 12 meses, não a média.",
        "Internação recente, cirurgia eletiva e pré-natal são as fontes mais comuns de um exame anterior que ninguém procurou.",
        "A definição do KDIGO usa duas janelas: 0,3 mg/dL em 48 HORAS, ou 1,5 vez a base em 7 DIAS.",
      ],
      options: [
        { id: "normal_antes", label: "Exames anteriores eram normais — este número SUBIU", next: "basal_conhecida" },
        { id: "drc_subiu", label: "DRC conhecida, e este número está acima do habitual dele", next: "cronico_agudizado" },
        { id: "drc_habitual", label: "DRC conhecida, e o número está no habitual dele", next: "drc_sem_agudizacao" },
        { id: "sem_valor", label: "Sei que era normal, mas não tenho o valor", next: "sem_base" },
        { id: "nao_sei", label: "Não dá para dizer", next: "indeterminado" },
        // ⚠️ AS PISTAS DE CRONICIDADE VIRARAM ESTE RAMO. Elas viviam num texto
        // que afirmava sobre um paciente que o app não examinou; quem precisa
        // delas é exatamente quem não sabe responder esta pergunta.
        { id: "guiado", label: OPCAO_DESCOBRIR, next: "drc_pistas" },
      ],
    },

    drc_pistas: {
      id: "drc_pistas",
      type: "input",
      title: "Descobrir · O rim já era doente?",
      intro: CRONICIDADE_INTRO,
      fields: CAMPOS_DE_CRONICIDADE,
      next: {
        possiveis: ["cronico_agudizado", "basal_conhecida", "indeterminado"],
        escolher: (v) => {
          const r = concluiCronicidade(v);
          if (r === "cronico") return "cronico_agudizado";
          return r === "agudo" ? "basal_conhecida" : "indeterminado";
        },
      },
    },

    basal_conhecida: {
      id: "basal_conhecida",
      type: "input",
      title: "A creatinina de base",
      intro: "O menor valor conhecido nos últimos 3 a 12 meses — não a média.",
      fields: [
        { id: "basal", label: "Creatinina de base", unit: "mg/dL",
          presets: [{ label: "0,7", value: "0.7" }, { label: "0,9", value: "0.9" },
                    { label: "1,1", value: "1.1" }, { label: "1,3", value: "1.3" }],
          allowCustom: true, customLabel: "Outro valor", customKeyboard: "numeric" },
      ],
      next: "estagio_kdigo",
    },

    // ⚠️ O ESTÁGIO É DERIVADO, NÃO ESCRITO. `derive` calcula os dois eixos e o
    // pior dos dois; o nó só exibe. Sem os dados, ele diz o que FALTA — nunca
    // presume basal, nunca inventa diurese, nunca classifica com falsa precisão.
    estagio_kdigo: {
      id: "estagio_kdigo",
      type: "action",
      // ⚠️ DEFINIÇÃO, NÃO RECOMENDAÇÃO. A diretriz não RECOMENDA que o estágio 3
      // seja o estágio 3 — ela ESTABELECE. Não se discorda de uma definição;
      // adota-se ou não, e por isso ela não tem classe. O risco dela é VERSÃO
      // DESATUALIZADA, e é a versão que aparece na tela (E-9: a KDIGO 2026 segue
      // draft — no dia em que mudar o estadiamento, é este campo que denuncia).
      procedencia: {
        forca: "definicao",
        fonte: "KDIGO — Clinical Practice Guideline for Acute Kidney Injury",
        versao: "2012",
      },
      title: "Estágio KDIGO: {estagio_texto}",
      summary: "{estagio_explicacao}",
      actions: [
        "{estagio_eixo_creatinina}",
        "{estagio_eixo_diurese}",
        "Reavalie o estágio a cada nova creatinina ou nova medida de diurese.",
      ],
      // ⚠️ O NÓ CANÔNICO PASSA A USAR A CONSTANTE, em vez de uma segunda cópia
      // inline. A tabela existia aqui E em `fazer_agora`, com os mesmos números e
      // redações JÁ DIFERENTES na nota da calculadora — divergência começada.
      // Aqui é onde ela tem selo (`definicao`, versão 2012), então é aqui que ela
      // fica; e a nota da revisão em curso vem junto, porque o que ela discute é
      // exatamente a VERSÃO que o selo declara.
      porque: [
        "O estágio é o PIOR dos dois eixos, nunca a soma — creatinina e diurese estadiam separadamente.",
        ...IRA_ESTADIAMENTO_KDIGO,
        ...IRA_REVISAO_EM_CURSO,
      ],
      next: "volume_check",
    },

    drc_sem_agudizacao: {
      id: "drc_sem_agudizacao",
      type: "action",
      // ⚠️ SEM GRAU, E DE PROPÓSITO. Suspender nefrotóxico e revisar doses por
      // função renal NÃO tem recomendação graduada geral na KDIGO 2012 — ela
      // gradua por DROGA (aminoglicosídeo, anfotericina, contraste), não uma
      // regra única. Carimbar "1A" aqui seria pegar emprestada a força das
      // recomendações do diurético, que são de outro assunto.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "KDIGO 2012 — recomendações droga-específicas; prática aceita para a regra geral",
        tipoDeDocumento: "Diretriz clínica — sem recomendação graduada geral para nefrotóxicos",
      },
      title: "DRC sem agudização — o número é o dele",
      summary: "⚠️ Este paciente não tem IRA. Tratar como se tivesse é que faz dano.",
      actions: [
        "Não dê volume por causa da creatinina.",
        "Revise as doses pela função renal dele, que é a de sempre.",
        "Suspenda o que é nefrotóxico.",
        "Siga a doença de base e o acompanhamento nefrológico que ele já tem.",
      ],
      porque: [
        "Volume num rim cronicamente doente e sem hipovolemia congestiona.",
        "⚠️ Se a diurese caiu, ou se o número subiu depois desta avaliação, reavalie — a agudização pode aparecer a qualquer momento.",
      ],
      next: "seguimento",
    },

    indeterminado: {
      id: "indeterminado",
      type: "action",
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — presumir agudo erra para o lado da AÇÃO",
        tipoDeDocumento: "Prática clínica estabelecida",
        contextoDaFonte:
          "⚠️ A razão de presumir AGUDO: erra para o lado da ação, que é o lado seguro quando a base é desconhecida. Presumir crônico faria perder o intervalo em que a causa ainda é reversível.",
      },
      title: "Não dá para dizer se é agudo — e isso se declara",
      summary: "⚠️ Trate como agudo, com o volume mais cauteloso.",
      actions: [
        "Presuma base normal e trate como AGUDO até prova em contrário.",
        "Dê volume em alíquotas menores, reavaliando ausculta e oximetria entre elas.",
        "Peça ultrassom de vias urinárias — rins pequenos mudam a leitura.",
        "Procure exames anteriores: internação recente, cirurgia eletiva e pré-natal são as fontes mais comuns.",
      ],
      porque: [
        "Presumir base normal é o erro mais seguro dos dois.",
        "⚠️ Mas se o rim já era doente e você não sabe, a prova de volume que ajudaria um pré-renal congestiona um crônico.",
      ],
      next: "volume_check",
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
        { id: "nao", label: "Nada disso — bexiga vazia e sonda drenando bem", next: "fazer_agora" },
        { id: "rim_unico", label: "Rim único, ou procedimento urológico recente", next: "obstrucao_conduta" },
        { id: "nao_sei", label: "Não consigo dizer — não examinei a bexiga ou não sei os fármacos", next: "obstrucao_conduta" },
      ],
    },

    obstrucao_conduta: {
      id: "obstrucao_conduta",
      type: "action",
      // Sequenciamento (a obstrução é reversível e barata de excluir) e manejo da
      // diurese pós-desobstrução. Prática estabelecida, sem grau conhecido.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — sequenciamento diagnóstico e manejo pós-desobstrução",
        tipoDeDocumento: "Prática clínica estabelecida",
      },
      title: "Suspeita de obstrução — a sonda é o exame",
      summary: "A sonda é o exame — e o tratamento, se for isso.",
      actions: [...IRA_OBSTRUCAO_ACOES, ...IRA_APOS_ALIVIO_ACOES],
      porque: [...IRA_OBSTRUCAO_PORQUE, ...IRA_APOS_ALIVIO_PORQUE],
      next: "fazer_agora",
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
        { id: "euvolemico", label: "Nem seco nem congesto — avaliei", next: "nefrotoxico_check" },
        // ⚠️ R-70: a opção anterior dizia "ou não consigo definir" e fundia
        // DESCARTEI com NÃO SEI. Quem avaliou e quem não fez ideia caíam no
        // mesmo lugar — e o app não tinha como ajudar quem precisava.
        { id: "guiado", label: OPCAO_GUIADA, next: "vol_dados" },
      ],
    },

    pre_renal: {
      id: "pre_renal",
      type: "action",
      title: "Hipoperfusão — o rim está bem, falta sangue chegando",
      summary: "Prova de volume com cristaloide, em alíquotas, reavaliando entre elas.",
      // ⚠️ AQUI É O PONTO DA TENTAÇÃO (E-7): esta é a tela em que se prescreve
      // volume, e é aqui que a creatinina alta convida a prescrevê-lo pelo
      // motivo errado. A mesma frase recapitula em `nao_faca`, da mesma fonte.
      // ⚠️ DUAS AFIRMAÇÕES, E SÓ UMA TEM GRAU. O PADRÃO da tela é prática
      // aceita: a KDIGO NÃO tem recomendação sobre desafio volêmico em alíquotas
      // nem sobre reavaliar entre elas — a ausência está registrada no arquivo de
      // fontes. A EXCEÇÃO nomeada é a escolha do fluido, que é 3.1.1 grau 2B.
      // Um selo só faria o 2B carimbar a alíquota, ou a alíquota rebaixar o 2B.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — a KDIGO não recomenda desafio volêmico nem reavaliação entre alíquotas",
        tipoDeDocumento: "Prática clínica estabelecida",
      },
      declaracoes: [
        {
          afirmacao: PRE_RENAL_CRISTALOIDE,
          procedencia: {
            forca: "recomendacao_formal",
            fonte: "KDIGO 2012 — Clinical Practice Guideline for Acute Kidney Injury, 3.1.1",
            classeOuGrau: "2B",
            contextoDaFonte:
              "⚠️ A ressalva É a condição: a recomendação vale NA AUSÊNCIA de choque hemorrágico, e por isso ela anda no mesmo item, nunca em linha separada.",
          },
        },
      ],
      actions: [
        ARMADILHA_VOLUME_PELA_CREATININA,
        PRE_RENAL_CRISTALOIDE,
        ...IRA_PRE_RENAL_ACOES,
        "⚠️ Reavalie ENTRE as alíquotas, não depois de todas — débito urinário, ausculta, oximetria e perfusão.",
        "⚠️ Se você não sabe a creatinina de base, as alíquotas são menores.",
        // ⚠️ AS DUAS SAÍDAS FUNDIDAS NUM ITEM (§7.4): a linha do cristaloide 2B
        // entrou e a tela foi a 8 ações. Fundir a resposta e a não-resposta é a
        // fusão certa — é UMA decisão ("respondeu?"), com dois destinos; separá-las
        // nunca ajudou ninguém a decidir, só ocupava dois números.
        "Se RESPONDEU: siga até a euvolemia e reavalie a creatinina em 6 a 12 h. Se NÃO respondeu após reposição adequada, siga para a exposição a nefrotóxico.",
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
        DOSE_ALCA_DESCONGESTAO,
        DOSE_ALCA_ESCALADA,
        "Abra o módulo de EDEMA AGUDO DE PULMÃO para conduzir essa situação.",
        "Se a causa é cardíaca, procure a causa da descompensação — isquemia, arritmia, má adesão.",
        "Se há cirrose com ascite e creatinina subindo sem outra causa, pense em síndrome hepatorrenal.",
      ],
      procedencia: {
        forca: "recomendacao_formal",
        fonte: "ESC 2021 — insuficiência cardíaca aguda e crônica",
        classeOuGrau: "recomendação de descongestão",
        contextoDaFonte:
          "⚠️ É fonte de DESCONGESTÃO, não de hipercalemia — e é por isso que a dose mora aqui, no ramo congesto, e não na tela do potássio.",
      },
      porque: [
        ...DOSE_ALCA_PORQUE,
        "Diurético trata a SOBRECARGA (é indicação legítima) e não trata o rim — a distinção importa porque tratar rim com furosemida é o erro mais comum deste cenário.",
        "O diurético não melhora a função renal — melhora a troca gasosa, que é o que ameaça a vida agora.",
        "O rim melhora quando o coração melhora: tratar o número da creatinina não resolve a descompensação.",
        "O app tem módulos de EAP, síndromes coronarianas e vasoativos.",
        "Este app não conduz a síndrome hepatorrenal — reconhecê-la é o que faz chamar quem conduz.",
      ],
      next: "nefrotoxico_check",
    },

    // ── 4 · A EXPOSIÇÃO — a única causa removível hoje ────────────────────
    vol_dados: {
      id: "vol_dados",
      type: "input",
      title: "Descobrir · Volemia",
      intro: INTRO_GUIADA,
      fields: CAMPOS_DE_VOLEMIA,
      next: {
        possiveis: ["pre_renal", "congesto_conduta", "nefrotoxico_check"],
        escolher: (v) => {
          const r = concluiVolemia(v);
          if (r === "congesto") return "congesto_conduta";
          return r === "seco" ? "pre_renal" : "nefrotoxico_check";
        },
      },
    },

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
        { id: "nada", label: "Nada disso — revisei a prescrição e a história", next: "renal_conduta" },
        // Mesma separação do nó anterior: quem revisou e não achou não é quem
        // não conseguiu revisar. O segundo tem trabalho a fazer, e ele é curto.
        { id: "nao_sei", label: "Não sei o que ele tomou — me ajude a descobrir", next: "nefro_descobrir" },
      ],
    },

    nefro_descobrir: {
      id: "nefro_descobrir",
      type: "action",
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO, não afirmação clínica: colher, acionar,
      // procurar, vigiar. Exigir força daqui produziria declaração falsa — o
      // defeito que o campo existe para impedir.
      natureza: "organizacao_do_atendimento",
      title: "Descobrir · O que entrou neste paciente",
      summary: "São quatro lugares, e os quatro levam minutos.",
      actions: [
        "Abra a prescrição das últimas 72 h — inclusive a de outro serviço, se houver.",
        "Pergunte à família o que ele toma por conta: AINE de farmácia, chá, remédio \"para dor\".",
        "Confira se houve exame com contraste iodado nas últimas 48 a 72 h.",
        "Olhe a cor da urina e peça CPK se houver imobilização, trauma, convulsão ou esforço extremo.",
      ],
      porque: [
        "⚠️ A exposição é a única causa que você pode remover HOJE — por isso vale o minuto de procurar.",
        "A creatinina pode subir depois de o paciente já ter saído da sala de exame: contraste recente não aparece na tela, aparece na agenda.",
      ],
      next: "renal_conduta",
    },

    renal_conduta: {
      id: "renal_conduta",
      type: "action",
      // ⚠️ E A EXCLUSÃO ESTÁ REGISTRADA NO ARQUIVO DE FONTES, de propósito: a
      // KDIGO 2012 EXCLUIU rabdomiólise do escopo, por escrito (Capítulo 1.2).
      // Sem esse registro, alguém "acha" uma justificativa KDIGO para esta linha
      // daqui a um ano — o módulo inteiro cita KDIGO, e a vizinhança convence.
      procedencia: {
        forca: "pratica_aceita",
        fonte: "Prática estabelecida — ⚠️ a KDIGO 2012 EXCLUIU rabdomiólise do escopo (Cap. 1.2)",
        tipoDeDocumento: "Prática clínica estabelecida",
        contextoDaFonte:
          "⚠️ NÃO PROCURE GRAU KDIGO PARA ESTA LINHA: a diretriz diz, na metodologia, que excluiu os estudos de IRA por rabdomiólise.",
      },
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
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO, não afirmação clínica: colher, acionar,
      // procurar, vigiar. Exigir força daqui produziria declaração falsa — o
      // defeito que o campo existe para impedir.
      natureza: "organizacao_do_atendimento",
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
      // ⚠️ ORGANIZAÇÃO DO ATENDIMENTO, não afirmação clínica: colher, acionar,
      // procurar, vigiar. Exigir força daqui produziria declaração falsa — o
      // defeito que o campo existe para impedir.
      natureza: "organizacao_do_atendimento",
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
