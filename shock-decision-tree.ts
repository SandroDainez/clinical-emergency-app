import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import { LAST_GATILHO_NO_CHOQUE, LAST_NAO_E_DISTRIBUTIVO } from "./lib/last-emulsao-lipidica";
import {
  DISTRIBUTIVO_FISIOLOGIA,
  DISTRIBUTIVO_O_QUE_ESTE_APP_NAO_LISTA,
  DISTRIBUTIVO_POR_QUE_VASOPRESSOR_CEDO,
  DISTRIBUTIVO_RECONSIDERE,
} from "./lib/quando-nao-fecha";
import {
  CHOQUE_CARDIOGENICO_EXCLUIR_OBSTRUTIVO,
  CHOQUE_MISTO,
  CHOQUE_RUSH_COMO,
  CHOQUE_SEPTICO_COM_HIPOVOLEMIA,
} from "./lib/choque-diferencial";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposDeInstabilidade,
  roteamentoDeInstabilidade,
} from "./lib/instabilidade-guiada";

/**
 * Fluxograma de choque — diagnóstico diferencial por perguntas binárias.
 * Cada diagnóstico final traz mecanismo, sinais confirmatórios, próximas ações
 * e link para o protocolo correspondente no app.
 *
 * Fonte: Einstein/SBIBAE — "Manejo Inicial do Paciente Adulto com Choque"
 * (pathway CPTW386.1, aprovado em 08/04/2024), que por sua vez se apoia no
 * consenso da ESICM sobre choque circulatório (Cecconi 2014), no position
 * statement da HFA-ESC sobre choque cardiogênico (Chioncel 2020) e no
 * statement da AHA (van Diepen 2017).
 *
 * O que NÃO foi transportado do pathway: os acionamentos institucionais
 * (Código H, Código IAM, Código TEP grave, Código Cirúrgico, PowerPlan, RAVA) e
 * a alocação obrigatória em UTI. São operação de um hospital específico e não
 * funcionam em outro serviço — os critérios de gravidade por trás deles, sim.
 *
 * A seção de sepse do pathway é SSC 2021 e ficou de fora: o módulo de sepse
 * deste app já está em SSC 2026. Aqui só entrou o encaminhamento para ele.
 */

export const shockDecisionTree: DecisionTreeDefinition = {
  id: "choque",
  version: "2024.1",
  label: "Choque — diagnóstico e conduta",
  entryNodeId: "inicio",
  nodes: {
    inicio: {
      id: "inicio",
      type: "decision",
      title: "Há choque?",
      question: "PA sistólica < 90 mmHg ou queda ≥ 40 mmHg do basal (ou sinais de hipoperfusão)?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ A HIPOTENSÃO NÃO É OBRIGATÓRIA PARA O DIAGNÓSTICO. Taquicardia e vasoconstrição podem preservar a pressão na fase inicial — é o choque compensado, e responder NÃO aqui por causa de uma PA normal é o erro mais comum deste nó. Olhe PELE, RIM e CÉREBRO antes de olhar o número.",
      evidence: [
        "Hipoperfusão nas 3 janelas do corpo — PELE: fria, pegajosa, pálida ou azulada, livedo, acrocianose, enchimento capilar > 3 s. RENAL: diurese < 0,5 mL/kg/h. NEURO: desorientação, inquietação, confusão, rebaixamento.",
        "Sinais laboratoriais: hiperlactatemia, acidose metabólica, SvcO₂ < 70% (ou SvO₂ < 65%), gap de PCO₂ > 6 mmHg.",
        "A hipotensão NÃO é obrigatória para o diagnóstico: taquicardia e vasoconstrição podem preservar a PA na fase inicial (choque compensado ou oculto) com hipoperfusão já instalada.",
        "Estabilização sempre primeiro: O₂, acessos, volume conforme contexto, monitorização.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "choque_dados" },
        { id: "sim", label: "Sim — choque / hipoperfusão", next: "estabilizacao_metas" },
        { id: "nao", label: "Não", next: "sem_choque" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // Aqui a decomposição comum encaixa por inteiro, porque é o mesmo conceito:
    // as três janelas de hipoperfusão do enunciado (PELE, RENAL, NEURO) são
    // exatamente o que as observações perguntam — pele alterada, enchimento
    // capilar e diurese, estado mental.
    //
    // E o par de confirmação da pele é o que este módulo mais precisa: o próprio
    // nó declara que a hipotensão NÃO é obrigatória para o diagnóstico. Pele
    // fria COM enchimento capilar lento e pressão normal é choque compensado —
    // o caso que mais se perde. Pele fria sozinha, não: é dor, febre, medo.
    choque_dados: {
      id: "choque_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: camposDeInstabilidade(),
      next: roteamentoDeInstabilidade({
        instavel: "estabilizacao_metas",
        limitrofe: "choque_limitrofe",
        estavel: "sem_choque",
        // Dor isquêmica isolada, sem hipoperfusão: a pergunta certa não é
        // "quais as metas do choque", é se existe disfunção miocárdica —
        // que é exatamente o que este nó decide.
        isquemicoIsolado: "q_cardiogenico",
      }),
    },

    choque_limitrofe: {
      id: "choque_limitrofe",
      type: "action",
      title: "Achado isolado — ainda NÃO fecha choque",
      summary:
        "O que você marcou é um sinal real, mas sozinho não confirma hipoperfusão. Não descarte: meça o que falta.",
      actions: [
        "MEDIR O QUE DECIDE: lactato arterial e enchimento capilar cronometrado (aperte a polpa do dedo por 5 segundos e conte quanto tempo a cor leva para voltar; acima de 3 segundos é anormal). Diurese horária se houver sonda.",
        "Lactato elevado associado a sinais clínicos de má perfusão aumenta muito a suspeita de choque mesmo com pressão normal, mas não deve ser usado isoladamente para fechar o diagnóstico: interpretar tendência, contexto, depuração e causas não hipóxicas de hiperlactatemia.",
        "Pele fria e suada sozinha também aparece em dor, febre, ansiedade e reação vagal. Procure a explicação alternativa antes de descartar.",
        "REAVALIAR em minutos, não em horas. Choque compensado descompensa sem aviso, e a pressão é o último parâmetro a cair.",
        "Se o lactato subir, a diurese cair, o enchimento capilar passar de 3 segundos ou a pressão ceder, volte: é choque, e o tratamento começa.",
      ],
      next: "estabilizacao_metas",
    },
    sem_choque: {
      id: "sem_choque",
      type: "transition",
      title: "Sem choque no momento",
      summary: "Sem critérios de choque agora — avaliar outros diagnósticos e reavaliar.",
      disposition: "observation",
      exitCriteria: [
        "Investigar a causa dos sintomas; reavaliar PA, FC, perfusão e lactato seriado.",
        "Manter vigilância — escalar imediatamente se surgir hipotensão/hipoperfusão.",
      ],
      targets: [],
    },

    estabilizacao_metas: {
      id: "estabilizacao_metas",
      type: "action",
      title: "Estabilizar e fixar as metas",
      summary: "Os objetivos gerais são restaurar perfusão e oferta de oxigênio, mas os alvos numéricos NÃO são universais: devem seguir etiologia, sangramento/isquemia, comorbidades e resposta ao tratamento.",
      actions: [
        "Perfusão e pressão: usar PAM como alvo inicial e individualizar pela etiologia e pelo paciente. No choque séptico, PAM 65 mmHg é o alvo inicial de referência; em outros fenótipos, ajustar conforme perfusão, história de hipertensão, cérebro/coração e resposta ao tratamento. Acompanhar lactato seriado quando elevado, mas não perseguir normalização ou queda percentual horária como meta isolada.",
        "Oferta de O₂: não usar hemoglobina ≥7 g/dL nem SpO₂ >90% como metas universais de todo choque. Em adultos hospitalizados hemodinamicamente estáveis, estratégia transfusional restritiva costuma considerar transfusão quando Hb <7 g/dL; esse limiar não se aplica automaticamente a hemorragia ativa/exsanguinante e deve ser individualizado em doença cardiovascular/isquemia. Oxigênio e alvo de saturação também devem seguir hipoxemia e contexto clínico, evitando tratar um número isolado como objetivo único de ressuscitação.",
        "Meta de reversão de disfunção orgânica: diurese > 0,5 mL/kg/h e melhora do estado neurológico atribuível ao choque.",
        "Fluidos: após a abordagem inicial, só continuar expansão quando houver indicação clínica e probabilidade de responsividade. Preferir variáveis dinâmicas (elevação passiva das pernas, mudança de volume sistólico/débito após pequena prova de fluido, variação de pressão de pulso quando aplicável) a marcadores estáticos isolados; reavaliar perfusão e sinais de congestão após cada intervenção.",
        "Pressão arterial invasiva: considerar cateter arterial quando o choque não responder à terapia inicial e/ou houver necessidade de infusão vasopressora, especialmente se titulação rápida ou medidas não invasivas forem pouco confiáveis — não esperar uma dose fixa de noradrenalina para indicar.",
        "Investigação inicial dirigida: obter rapidamente lactato e exames básicos de função orgânica/metabólica, ECG quando pertinente e exames etiológicos conforme o fenótipo. Não pedir D-dímero, fibrinogênio, troponina, radiografia ou ecocardiograma como painel obrigatório para todo choque; cada exame deve responder a uma hipótese clínica ou necessidade de monitorização.",
        "Ecocardiografia/POCUS é a modalidade de imagem de primeira linha para definir o tipo de choque quando disponível, especialmente se a causa não for evidente, houver choque persistente após terapia inicial ou deterioração rápida. Integrar coração, pulmões, veias e contexto clínico; não usar um achado ultrassonográfico isolado como diagnóstico definitivo.",
        CHOQUE_RUSH_COMO,
        CHOQUE_MISTO,
        // ── ⚠️ O GATILHO DO LAST — AQUI, ANTES DE CLASSIFICAR O PADRÃO ──────
        //
        // O LAST tinha quatro portas, e as quatro eram do caso IMEDIATO. O
        // paciente com cateter perineural ou peridural contínua que deteriora
        // HORAS depois cai neste módulo — que não mencionava anestésico local uma
        // única vez em 31 nós.
        //
        // ⚠️ POR QUE NESTE NÓ, E NÃO NO `inicio`: o `inicio` tem 4 itens em
        // `evidence`, e `ListaDeCriterios` só abre com ≤ 2 — o gatilho nasceria
        // recolhido. Este é `action`, sempre visível, e o `next` dele é
        // `q_hipovolemia`: todo mundo que tem choque passa por aqui ANTES da
        // primeira pergunta de classificação, que é exatamente o momento.
        LAST_GATILHO_NO_CHOQUE,
      ],
      next: "q_hipovolemia",
    },

    q_hipovolemia: {
      id: "q_hipovolemia",
      type: "decision",
      title: "Sinais de hipovolemia?",
      question: "Sangramento ativo, vômitos/diarreia, queimadura ou trauma com perda volêmica?",
      evidence: [
        "Veias colabadas, resposta a volume, hematócrito/lactato, foco de perda evidente.",
        "Perfil de cabeceira que separa os tipos: extremidades FRIAS, pressão de pulso < 25 mmHg, enchimento capilar > 3 s e SvcO₂ < 70% apontam para hipovolêmico, cardiogênico ou obstrutivo. Extremidades QUENTES, pressão de pulso > 40 mmHg, enchimento capilar < 3 s e SvcO₂ normal ou alta apontam para distributivo.",
      ],
      options: [
        { id: "sim", label: "Sim", next: "dx_hipovolemico" },
        { id: "nao", label: "Não", next: "q_obstrutivo" },
      ],
    },
    dx_hipovolemico: {
      id: "dx_hipovolemico",
      type: "transition",
      title: "Choque HIPOVOLÊMICO",
      summary: "Perda de volume (hemorrágico ou não). Perfil: PA↓ FC↑ PVC↓ pele fria/pálida DC↓ RVS↑.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: redução da pré-carga por perda de volume (sangue, fluidos).",
        "Confirmar: resposta a volume, foco de perda, Hb/lactato, USG (FAST/VCI colabável).",
        "Ações: obter acessos calibrosos e controlar a fonte sem demora. Se o choque for HEMORRÁGICO, priorizar ressuscitação hemostática/hemocomponentes conforme protocolo e estratégia de volume restritiva até controle do sangramento, evitando grandes volumes de cristaloide. Se a perda for NÃO hemorrágica e houver plausibilidade de responsividade a volume, usar pequenas alíquotas de cristaloide com reavaliação imediata da perfusão e congestão.",
        "A classificação hemorrágica tradicional por classes pode ajudar a organizar o raciocínio, mas NÃO deve estimar isoladamente a perda sanguínea nem determinar terapia: idade, betabloqueio, gestação, reserva fisiológica e tempo do trauma alteram FC e PA. Use perfusão, tendência hemodinâmica, mecanismo, exame/POCUS e resposta à ressuscitação.",
        "Atenção: pressão arterial normal NÃO exclui hemorragia importante. A resposta compensatória, a idade, medicamentos, gestação, reserva fisiológica e a velocidade da perda podem dissociar a pressão arterial da gravidade do sangramento; não use um percentual fixo de perda volêmica como limiar diagnóstico. Integre perfusão periférica, estado mental, tendência hemodinâmica, mecanismo/fonte, POCUS quando útil e resposta à ressuscitação.",
        "No trauma hemorrágico SEM evidência de lesão cerebral grave, usar estratégia restritiva até controle da hemorragia; a diretriz europeia de trauma usa PAS 80–90 mmHg (PAM 50–60 mmHg) como alvo inicial. Em TCE grave (Glasgow ≤8), evitar hipotensão permissiva e manter PAM ≥80 mmHg enquanto se individualiza PPC/ressuscitação. Não aplicar esses alvos automaticamente a hemorragia não traumática, idosos frágeis ou hipertensos crônicos.",
        "Transfusão no sangramento agudo deve ser guiada pelo contexto hemorrágico, perfusão e estratégia de ressuscitação hemostática; não esperar uma hemoglobina isolada cair para tratar hemorragia exsanguinante. Fora de sangramento maciço, usar estratégia transfusional restritiva quando apropriado. Corrigir coagulopatia de forma dirigida por testes convencionais e/ou viscoelásticos quando disponíveis, sem impor Hb 9–10 g/dL apenas por diagnóstico neurológico.",
        "Na hemorragia grave/transfusão maciça, monitorar cálcio IONIZADO precocemente e de forma seriada e mantê-lo na faixa normal do laboratório (em geral 1,1–1,3 mmol/L). Corrigir hipocalcemia prontamente — especialmente Ca²⁺ ionizado <0,9 mmol/L — preferindo cloreto de cálcio quando apropriado. Não prescrever cálcio por número fixo universal de bolsas; titular por cálcio ionizado, ritmo de transfusão e contexto clínico. Prevenir/corrigir hipotermia e tratar a causa do sangramento.",
        "Ácido tranexâmico no TRAUMA com sangramento ou risco de sangramento significativo: administrar o mais cedo possível e dentro de 3 h da lesão; regime da diretriz europeia: 1 g IV em 10 min seguido de 1 g IV em 8 h. Não aguardar tromboelastometria/viscoelastometria para iniciar TXA quando ele estiver indicado.",
        "Coagulação: iniciar monitorização e suporte hemostático imediatamente. Usar PT/INR, fibrinogênio de Clauss, plaquetas e/ou viscoelastometria conforme disponibilidade e repetir conforme evolução. Se houver hemorragia maciça esperada, ativar protocolo de transfusão maciça/ressuscitação hemostática local; após os primeiros componentes, direcionar a terapia pelos resultados, evitando reposição empírica prolongada sem monitorização.",
        "Fibrinogênio: se sangramento maior vier acompanhado de déficit funcional na viscoelastometria ou fibrinogênio de Clauss ≤1,5 g/L, repor com concentrado de fibrinogênio ou crioprecipitado; a diretriz europeia sugere dose inicial de 3–4 g, com redose guiada por viscoelastometria e/ou fibrinogênio laboratorial.",
        "Acidemia no choque hemorrágico é sobretudo marcador de hipoperfusão: corrigir hemorragia, perfusão, ventilação e temperatura. Não usar bicarbonato de sódio por um corte isolado de pH ou bicarbonato; reservar para indicações específicas e contexto fisiopatológico, pois não substitui controle da causa.",
      ],
      targets: [],
    },

    q_obstrutivo: {
      id: "q_obstrutivo",
      type: "decision",
      title: "Sinais de obstrução mecânica?",
      question: "Há instabilidade/peri-parada com sinais que sugiram obstrução ao enchimento ou à circulação pulmonar (pneumotórax hipertensivo, tamponamento ou TEP de alto risco)?",
      summary: "Na dúvida, não descarte causa obstrutiva por falta de confirmação: mantenha a hipótese aberta e procure rapidamente sinais dirigidos no exame e no POCUS à beira-leito.",
      evidence: [
        "Pensar em pneumotórax hipertensivo, tamponamento e TEP maciço.",
        "⚠️ RESPONDER \"NÃO\" AQUI FECHA ESTA PORTA: o fluxo segue para o cardiogênico, que compartilha com o obstrutivo o frio, a jugular distendida e o débito baixo — e tem conduta OPOSTA quanto a volume. Na dúvida, faça o ultrassom ANTES de responder.",
      ],
      options: [
        { id: "sim", label: "Sim — investigar obstrutivo", next: "q_pneumotorax" },
        { id: "nao", label: "Não", next: "q_cardiogenico" },
      ],
    },
    q_pneumotorax: {
      id: "q_pneumotorax",
      type: "decision",
      title: "Pneumotórax hipertensivo?",
      question: "Há deterioração hemodinâmica/respiratória com forte suspeita de pneumotórax hipertensivo (por exemplo, trauma ou ventilação com pressão positiva + redução/ausência unilateral do murmúrio, hipoxemia ou enfisema subcutâneo)?",
      options: [
        { id: "sim", label: "Sim", next: "dx_pneumotorax" },
        { id: "nao", label: "Não", next: "q_tamponamento" },
      ],
    },
    dx_pneumotorax: {
      id: "dx_pneumotorax",
      type: "transition",
      title: "PNEUMOTÓRAX HIPERTENSIVO (obstrutivo)",
      summary: "Ar sob pressão no espaço pleural → colapso do retorno venoso. EMERGÊNCIA.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: aumento da pressão intratorácica → ↓ retorno venoso → ↓ DC.",
        "Diagnóstico no paciente instável é clínico e/ou por POCUS — NÃO aguardar radiografia. Desvio traqueal e distensão jugular são sinais possíveis, frequentemente tardios, e sua ausência não exclui pneumotórax hipertensivo.",
        "Ações: descompressão IMEDIATA quando houver forte suspeita com choque/peri-parada. No trauma em parada ou choque extremo, toracostomia aberta/finger no 4º–5º espaço intercostal na região antero/médio-axilar é preferida quando houver competência e material; se não for possível, realizar descompressão por agulha em sítio recomendado pelo protocolo local. Inserir drenagem pleural definitiva assim que viável.",
      ],
      targets: [],
    },
    q_tamponamento: {
      id: "q_tamponamento",
      type: "decision",
      title: "Tamponamento cardíaco?",
      question: "Há contexto e achados compatíveis com tamponamento (por exemplo, derrame conhecido/pericardite, pós-operatório cardíaco ou trauma penetrante) com instabilidade e POCUS sugestivo?",
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "tamponamento_guiado" },
        { id: "sim", label: "Sim", next: "dx_tamponamento" },
        { id: "nao", label: "Não — TEP maciço?", next: "dx_tep" },
      ],
    },
    tamponamento_guiado: {
      id: "tamponamento_guiado",
      type: "action",
      title: "Como verificar tamponamento no instável",
      summary: "Não descarte por ausência da tríade de Beck. Integre contexto + instabilidade + ecocardiografia/POCUS à beira-leito.",
      actions: [
        "Faça ecocardiografia/POCUS imediatamente quando disponível: procure derrame pericárdico e sinais de comprometimento do enchimento, sempre integrados à clínica.",
        "Reforce o contexto: pós-operatório cardíaco, trauma penetrante, pericardite/derrame conhecido ou procedimento recente aumentam a plausibilidade.",
        "Tríade de Beck, pulso paradoxal, baixa voltagem e alternância elétrica podem ajudar, mas a ausência deles NÃO exclui tamponamento.",
        "Com POCUS/contexto reavaliados, volte e responda SIM se o conjunto for compatível; se não, siga para a próxima causa obstrutiva.",
      ],
      next: "q_tamponamento",
    },
    dx_tamponamento: {
      id: "dx_tamponamento",
      type: "transition",
      title: "TAMPONAMENTO CARDÍACO (obstrutivo)",
      summary: "Líquido pericárdico sob pressão → restrição do enchimento. Pulso paradoxal.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: ↑ pressão pericárdica → ↓ enchimento diastólico → ↓ DC.",
        "Confirmar prioritariamente com ecocardiografia/POCUS à beira leito no instável, integrando derrame pericárdico, sinais de comprometimento do enchimento e contexto clínico. A tríade de Beck, pulso paradoxal, baixa voltagem e alternância elétrica podem ocorrer, mas não são necessários nem suficientemente sensíveis para excluir tamponamento.",
        "Ações: aliviar a pressão pericárdica sem demora. Em tamponamento médico/não traumático com instabilidade, realizar pericardiocentese guiada por imagem quando possível e tratar a causa. Em trauma penetrante com peri-parada/parada e equipe habilitada, considerar toracotomia ressuscitativa/abordagem cirúrgica como estratégia definitiva; pericardiocentese por agulha tem papel limitado como ponte quando cirurgia imediata não está disponível.",
      ],
      targets: [],
    },
    dx_tep: {
      id: "dx_tep",
      type: "transition",
      title: "TEP MACIÇO (obstrutivo)",
      summary: "Obstrução da circulação pulmonar → falência aguda de VD. Taquicardia, hipóxia, fator de risco.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: ↑ pós-carga aguda do VD → ↓ débito do VE.",
        "Diagnóstico: preferir AngioTC pulmonar quando factível. Em instabilidade, ecocardiografia/POCUS à beira leito ajuda a identificar disfunção/sobrecarga de VD e diagnósticos alternativos, mas NÃO confirma nem exclui TEP isoladamente; sinal de McConnell é achado de disfunção de VD e serve principalmente à estratificação. Em alta probabilidade clínica, avançar para imagem diagnóstica em vez de depender de D-dímero isolado.",
        "Ações no TEP de ALTO RISCO com choque/hipotensão persistente: priorizar reperfusão emergencial — trombólise sistêmica quando indicada; em contraindicação ou falha, considerar embolectomia cirúrgica ou tratamento dirigido por cateter conforme expertise/recursos. Usar HNF quando anticoagulação estiver indicada no contexto de reperfusão. Evitar expansão volêmica agressiva; considerar pequena carga apenas se houver baixa pressão de enchimento. Noradrenalina é o vasopressor de escolha na hipotensão/choque; dobutamina pode ser considerada em baixo débito com pressão preservada, não como associação automática.",
      ],
      targets: [{ moduleId: "tep", label: "Guia de TEP", reason: "Estratificação e reperfusão do tromboembolismo pulmonar." }],
    },

    q_cardiogenico: {
      id: "q_cardiogenico",
      type: "decision",
      title: "Disfunção miocárdica primária?",
      question: "IAM, ICC grave, arritmia de alta FC ou contusão miocárdica?",
      evidence: ["Perfil: pele fria, congestão, DC↓↓ e RVS↑↑."],
      options: [
        { id: "guiado", label: "Não sei — me guie", next: "cardiogenico_guiado" },
        { id: "sim", label: "Sim", next: "q_cardio_subtipo" },
        { id: "nao", label: "Não", next: "q_distributivo" },
      ],
    },

    cardiogenico_guiado: {
      id: "cardiogenico_guiado",
      type: "action",
      title: "Antes de chamar de falência de bomba",
      summary: "Procure evidência de disfunção miocárdica e mantenha choque misto no radar; pele fria ou PA baixa isoladas não definem o mecanismo.",
      actions: [
        "Obtenha ECG e ecocardiografia/POCUS precocemente quando disponíveis: função de VE/VD, congestão, complicação mecânica e sinais de baixo débito ajudam a definir o fenótipo.",
        "Procure contexto de IAM/isquemia, insuficiência cardíaca aguda/descompensada, arritmia relevante, miocardite/contusão e valvopatia/complicação mecânica.",
        "Se houver evidência predominante de falência de bomba, responda SIM e classifique o subtipo. Se não houver, responda NÃO e siga investigando distributivo/misto e outras causas.",
        "Se os mecanismos coexistirem, trate como choque misto e reavalie após cada intervenção em vez de forçar uma classificação única.",
      ],
      next: "q_cardiogenico",
    },

    q_cardio_subtipo: {
      id: "q_cardio_subtipo",
      type: "decision",
      title: "Qual o perfil do choque cardiogênico?",
      question: "O subtipo muda a conduta — sobretudo quanto a volume e a inotrópico. Qual se aplica?",
      // ⚠️ `summary` NASCE AQUI, RESUMINDO UM ITEM DE `evidence` (2026-08-17).
      // O nó tem 4 itens e NÃO TINHA campo visível além de título e pergunta —
      // o recorte da dívida do R-75 reenquadrado: decisão + evidence ≥ 3 +
      // sem summary é conduta NECESSARIAMENTE recolhida.
      //
      // ⚠️ O ITEM DE ORIGEM NÃO FOI REMOVIDO, e o motivo é aritmético:
      // `ListaDeCriterios` só abre com ≤ 2 itens. Com 4, tirar um não abre
      // nada — abaixaria para 3 e continuaria recolhido, perdendo o detalhe
      // sem ganhar visibilidade. Aqui o ganho é a CONDUTA na superfície; a
      // lista segue embaixo, que é onde lista deve ficar.
      summary:
        "⚠️ CHOQUE CARDIOGÊNICO NÃO É SINÔNIMO DE IAM. Síndrome coronariana aguda continua sendo causa crítica e tempo-dependente, mas insuficiência cardíaca aguda/descompensada, arritmias e complicações mecânicas também representam parcela importante dos casos contemporâneos. Faça ECG precocemente e use ecocardiografia para definir o fenótipo; se o subtipo não estiver claro, siga em 'Não definido' e reavalie.",
      evidence: [
        "Síndrome coronariana aguda é uma causa crítica e tempo-dependente de choque cardiogênico, mas não representa todo o espectro contemporâneo. Obter ECG precocemente e investigar isquemia/reperfusão sem atrasar a definição hemodinâmica do choque.",
        "Choque cardiogênico não relacionado a IAM é substancial e vem ganhando importância, incluindo insuficiência cardíaca aguda/descompensada, valvopatias, miocardite, arritmias e outras causas de falência de bomba.",
        "Complicações mecânicas do IAM (ruptura de septo, ruptura valvar) exigem alto índice de suspeita e ecocardiograma rápido — ocorrem mais nas primeiras 24 h.",
        "Se o subtipo não estiver claro, siga em 'Não definido' e reavalie com o ecocardiograma.",
      ],
      options: [
        { id: "vd", label: "Ventrículo direito / IAM de VD", next: "dx_cardio_vd" },
        { id: "frio_umido", label: "Clássico — frio e úmido (congesto)", next: "dx_cardio_frio_umido" },
        { id: "frio_seco", label: "Euvolêmico — frio e seco", next: "dx_cardio_frio_seco" },
        { id: "normotenso", label: "Choque com normotensão (PAS > 90)", next: "dx_cardio_normotenso" },
        { id: "valvar", label: "Valvopatia ou obstrução da via de saída", next: "dx_cardio_valvar" },
        { id: "bradi", label: "Bradiarritmia como causa", next: "dx_cardio_bradi" },
        { id: "guiado", label: OPCAO_GUIADA, next: "perfil_dados" },
        { id: "indefinido", label: "Não definido — conduta geral", next: "dx_cardiogenico" },
      ],
    },

    // O perfil hemodinâmico clássico se lê com a MÃO e com o olho: temperatura
    // da perna e congestão. É das poucas classificações da medicina que não
    // precisa de exame nenhum — e é justamente a que decide entre dar volume e
    // tirar volume, onde o erro custa caro nos dois sentidos.
    perfil_dados: {
      id: "perfil_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: [
        {
          id: "temperatura",
          label: "Passe a mão do joelho para baixo: a perna está FRIA em relação à coxa e ao tronco?",
          presets: [
            { value: "fria", label: "Fria" },
            { value: "morna", label: "Morna/quente" },
          ],
        },
        {
          id: "congestao",
          label: "Há sinal de água sobrando: estalidos na ausculta, veias do pescoço cheias, pernas inchadas ou não consegue deitar?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "vd",
          label: "As veias do pescoço estão MUITO cheias, mas os pulmões estão LIMPOS na ausculta?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "nao_avaliado", label: "Não consegui avaliar" },
          ],
        },
        {
          id: "sopro",
          label: "Existe um sopro no coração que apareceu agora, ou que ninguém tinha descrito antes?",
          optional: true,
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
            { value: "nao_avaliado", label: "Não consegui avaliar" },
          ],
        },
        {
          id: "pas",
          label: "Pressão sistólica (o número de cima)",
          unit: "mmHg",
          allowCustom: true,
          customKeyboard: "numeric",
          presets: ["70", "80", "90", "100", "120"].map((v) => ({ value: v, label: v })),
        },
      ],
      next: {
        possiveis: [
          "dx_cardio_vd",
          "dx_cardio_valvar",
          "dx_cardio_frio_umido",
          "dx_cardio_frio_seco",
          "dx_cardio_normotenso",
          "dx_cardiogenico",
        ],
        escolher: (v) => {
          // Ordem importa: VD e valvar mudam a conduta de forma mais radical que
          // o perfil quente/frio — no VD, tanto volume liberal quanto retirada indiscriminada podem piorar; na
          // complicação mecânica, o tratamento é cirúrgico e nenhuma droga
          // resolve. Por isso são testados primeiro.
          if (v.vd === "sim") return "dx_cardio_vd";
          if (v.sopro === "sim") return "dx_cardio_valvar";

          const bruto = String(v.pas ?? "").trim();
          const pas = bruto === "" ? Number.NaN : Number(bruto.replace(",", "."));
          const fria = v.temperatura === "fria";
          const congesto = v.congestao === "sim";

          if (fria && congesto) return "dx_cardio_frio_umido";
          if (fria && !congesto) return "dx_cardio_frio_seco";

          // Perna morna com hipoperfusão e pressão preservada: o choque
          // cardiogênico normotenso, que passa despercebido justamente por não
          // ter os dois sinais que todo mundo procura.
          if (Number.isFinite(pas) && pas > 90) return "dx_cardio_normotenso";

          return "dx_cardiogenico";
        },
      },
    },

    dx_cardio_vd: {
      id: "dx_cardio_vd",
      type: "transition",
      title: "Choque CARDIOGÊNICO — ventrículo direito",
      summary: "Falência do VD. Aqui a regra do 'evitar volume' NÃO se aplica.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: falência predominante do VD reduz o enchimento do VE. No IAM de VD pode haver dependência de pré-carga, mas volume NÃO é tratamento automático: avaliar congestão, pressão de enchimento e resposta hemodinâmica; excesso de volume pode dilatar o VD e piorar o débito.",
        "Confirmar: ECG com derivações direitas (V3R–V4R) no IAM inferior; ECO com VD dilatado/hipocontrátil; ausência de congestão pulmonar.",
        "Ações: se houver suspeita de hipovolemia/baixa pré-carga sem congestão, testar pequena alíquota de fluido e interromper se não houver benefício. Na hipotensão, noradrenalina é opção vasopressora de primeira linha; se persistir baixo débito apesar de pressão adequada, considerar inotrópico. Corrigir bradiarritmia e preservar sincronismo atrioventricular; reperfundir quando IAM for a causa.",
        "Reperfusão coronariana quando o IAM for a causa.",
      ],
      targets: [
        { moduleId: "sindromes-coronarianas", label: "Síndromes coronarianas", reason: "IAM de VD — reperfusão." },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de vasopressor e inotrópico." },
      ],
    },

    dx_cardio_frio_umido: {
      id: "dx_cardio_frio_umido",
      type: "transition",
      title: "Choque CARDIOGÊNICO — frio e úmido",
      summary: "O perfil clássico: baixo débito com congestão. Volume agressivo piora.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: ↓ contratilidade → ↓ débito com pressões de enchimento altas.",
        "Confirmar: extremidades frias, congestão pulmonar ao exame/RX/ECO, FE reduzida.",
        "Ações: na hipotensão, usar NORADRENALINA como vasopressor de primeira linha; considerar inotrópico quando houver baixo débito persistente apesar de pressão adequada. Na presença de congestão, NÃO usar expansão volêmica empírica como tratamento primário; reavaliar perfusão e congestão após cada intervenção.",
        "Reperfusão coronariana quando o IAM for a causa; considerar suporte circulatório mecânico conforme disponibilidade e avaliação especializada.",
      ],
      targets: [
        { moduleId: "sindromes-coronarianas", label: "Síndromes coronarianas", reason: "Se IAM como causa — reperfusão." },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de inotrópico e vasopressor." },
      ],
    },

    dx_cardio_frio_seco: {
      id: "dx_cardio_frio_seco",
      type: "transition",
      title: "Choque CARDIOGÊNICO — frio e seco",
      summary: "Baixo débito SEM congestão: ausência de congestão, sozinha, NÃO prova responsividade a volume.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: baixo débito sem congestão clínica pode coexistir com baixa pré-carga, mas também com falência de bomba sem responsividade a volume; confirmar o fenótipo antes de expandir.",
        "Confirmar: extremidades frias sem congestão pulmonar; ECO sem sinais de sobrecarga de volume.",
        "Ações: se houver baixa pré-carga provável ou responsividade demonstrada, testar PEQUENA alíquota e reavaliar imediatamente volume sistólico/perfusão e sinais de congestão; interromper se não houver benefício. Na hipotensão, usar noradrenalina; considerar inotrópico se baixo débito persistir com pressão adequada.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de inotrópico e vasopressor." }],
    },

    dx_cardio_normotenso: {
      id: "dx_cardio_normotenso",
      type: "transition",
      title: "Choque CARDIOGÊNICO — com normotensão",
      summary: "Hipoperfusão com PAS > 90 mmHg e resistência vascular relativamente alta.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: baixo débito compensado por vasoconstrição — a PA está preservada, a perfusão não.",
        "Confirmar: sinais de hipoperfusão (lactato, oligúria, pele fria) apesar de PAS > 90 mmHg.",
        "Ações: se houver baixo débito objetivamente documentado com pressão preservada, considerar inotrópico e reavaliar perfusão, ritmo e pressão. Dobutamina é opção frequente; milrinona depende de pressão arterial, função renal e contexto clínico. Não tratar levosimendana como escolha equivalente universal — disponibilidade e evidência variam.",
        "Reavaliar continuamente: se a PA cair, associar vasopressor.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de inotrópico." }],
    },

    dx_cardio_valvar: {
      id: "dx_cardio_valvar",
      type: "transition",
      title: "Choque CARDIOGÊNICO — valvopatia ou obstrução da via de saída",
      summary: "Cada lesão tem uma conduta própria — e algumas são opostas entre si.",
      disposition: "icu",
      exitCriteria: [
        "Choque por valvopatia aguda ou complicação mecânica do IAM exige ecocardiografia imediata e Heart Team/equipe de choque precocemente; a terapia farmacológica é ponte para correção definitiva, não substituto de intervenção.",
        "A estratégia hemodinâmica depende da LESÃO e do fenótipo. Evitar receitas universais do tipo ‘dopamina na insuficiência aórtica’, ‘amiodarona na estenose mitral’ ou ‘balão intra-aórtico para toda insuficiência mitral’: pressão, frequência, pré/pós-carga e suporte mecânico devem ser individualizados com eco e, quando necessário, hemodinâmica invasiva.",
        "Na obstrução dinâmica da via de saída do VE, evitar aumento desnecessário de contratilidade e redução excessiva de pré/pós-carga; tratar precipitantes e usar estratégia guiada por ecocardiografia.",
        "Suspeita de ruptura de músculo papilar/insuficiência mitral aguda, comunicação interventricular pós-IAM ou ruptura de parede livre exige cirurgia/intervenção estrutural imediata ou transferência urgente para centro capaz; suporte vasoativo/MCS, quando usados, são ponte selecionada pela anatomia e pelo fenótipo.",
        "Estenose aórtica crítica, insuficiência aórtica aguda grave e doença mitral crítica em choque requerem avaliação urgente em Heart Valve Centre/Heart Team quando disponível, com decisão rápida entre cirurgia, intervenção transcateter ou ponte hemodinâmica apropriada.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação por lesão valvar." }],
    },

    dx_cardio_bradi: {
      id: "dx_cardio_bradi",
      type: "transition",
      title: "Choque CARDIOGÊNICO — bradiarritmia",
      summary: "O débito caiu por frequência; tratar a frequência é tratar o choque.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: débito cardíaco insuficiente por frequência baixa (absoluta ou inapropriada para a demanda).",
        "Ações: agente cronotrópico ou marca-passo temporário — atropina, dopamina ou adrenalina.",
        "Identificar e tratar a causa da bradiarritmia (isquemia, fármacos, distúrbio eletrolítico, hipotermia, BAV).",
      ],
      targets: [
        { moduleId: "bradicardia-acls", label: "Bradicardia no ACLS", reason: "Escalonamento de atropina, cronotrópicos e marca-passo." },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de cronotrópico." },
      ],
    },

    dx_cardiogenico: {
      id: "dx_cardiogenico",
      type: "transition",
      title: "Choque CARDIOGÊNICO",
      summary: "Falência de bomba. Perfil: PA↓ FC↑ PVC↑ pele fria DC↓↓ RVS↑↑.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: ↓ contratilidade / falência de bomba → ↓ DC com congestão.",
        "Confirmar: ECG (IAM/arritmia), troponina, ECO (FE, função de VD), congestão pulmonar.",
        "Ações: definir rapidamente etiologia e fenótipo com ecocardiografia e, quando necessário, hemodinâmica invasiva. Na hipotensão, usar noradrenalina como vasopressor de primeira linha; adicionar inotrópico quando baixo débito persistir apesar de pressão/perfusão coronariana adequadas. Dar fluido apenas quando houver evidência de hipovolemia ou provável responsividade. Tratar a causa sem demora (revascularização no IAM, correção de arritmia ou complicação mecânica). Suporte circulatório mecânico NÃO é rotina universal: selecionar dispositivo/estratégia por fenótipo, gravidade, anatomia, risco e equipe de choque, com transferência precoce se o centro não dispuser de suporte avançado.",
        CHOQUE_CARDIOGENICO_EXCLUIR_OBSTRUTIVO,
        "⚠️ IAM de ventrículo direito: pode apresentar pulmões relativamente limpos e maior dependência de pré-carga, mas isso NÃO autoriza volume liberal. Testar apenas pequenas alíquotas quando houver baixa pré-carga provável e interromper diante de congestão ou ausência de resposta.",
        "Na ausência de sinais de congestão, administrar pequenas alíquotas de fluido e reavaliar os parâmetros clínicos a cada uma.",
      ],
      targets: [
        { moduleId: "sindromes-coronarianas", label: "Síndromes coronarianas", reason: "Se IAM como causa — reperfusão." },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Titulação de inotrópico/vasopressor." },
      ],
    },

    q_distributivo: {
      id: "q_distributivo",
      type: "decision",
      title: "Vasodilatação / distributivo?",
      question: "Há suspeita de choque distributivo/vasoplégico (por exemplo, infecção, anafilaxia, lesão medular ou causa endócrina/tóxica), mesmo que a pele não esteja quente?",
      evidence: ["Perfil distributivo: RVS↓, DC normal/↑ (fase inicial)."],
      options: [
        { id: "sim", label: "Sim — distributivo", next: "q_septico" },
        {
          id: "nao",
          // R-70: "Não / indefinido" fundia DESCARTEI com NÃO SEI, que são
          // opostos — um tem informação e o outro não.
          label: "Não — descartei distributivo",
          next: "dx_distributivo_outro",
        },
        {
          id: "nao_sei",
          label: "Não sei dizer — me guie pelos sinais",
          next: "perfil_dados",
        },
      ],
    },
    q_septico: {
      id: "q_septico",
      type: "decision",
      title: "Suspeita de infecção?",
      question: "Foco infeccioso provável como causa?",
      options: [
        { id: "sim", label: "Sim — séptico", next: "dx_septico" },
        { id: "nao", label: "Não", next: "q_anafilatico" },
      ],
    },
    dx_septico: {
      id: "dx_septico",
      type: "transition",
      title: "Choque SÉPTICO (distributivo)",
      summary: "Vasoplegia e disfunção microcirculatória por infecção. O débito pode ser alto, normal ou baixo e a pele pode deixar de ser quente conforme o choque evolui.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: vasodilatação + disfunção microcirculatória por infecção.",
        "Confirmar choque séptico pelo contexto de infecção com disfunção circulatória persistente após ressuscitação inicial; lactato ajuda na estratificação e no seguimento, mas não deve ser usado isoladamente para fechar ou excluir o diagnóstico.",
        "Ações conforme SSC 2026: iniciar tratamento imediatamente; colher culturas o quanto antes e idealmente antes do antimicrobiano sem atrasá-lo; no choque séptico, antimicrobiano imediatamente, idealmente em até 1 h. Em hipoperfusão induzida por sepse/choque séptico, considerar pelo menos 30 mL/kg de cristaloide nas primeiras 3 h, individualizando por comorbidades e reavaliando frequentemente. Se o choque estiver muito instável, vasopressor pode ser iniciado em paralelo aos fluidos e por acesso periférico enquanto se obtém acesso definitivo. Noradrenalina é primeira linha; alvo inicial de PAM 65 mmHg (em ≥65 anos, 60–65 mmHg pode ser considerado). Em doses crescentes de noradrenalina, adicionar vasopressina; se PAM seguir inadequada, considerar adrenalina. Se houver disfunção cardíaca com hipoperfusão persistente apesar de volume e pressão adequados, considerar dobutamina associada à noradrenalina ou adrenalina isolada. Controle do foco sem demora. Ver o guia da sepse.",
        CHOQUE_SEPTICO_COM_HIPOVOLEMIA,
      ],
      targets: [{ moduleId: "sepse-adulto", label: "Guia da sepse", reason: "Bundle da 1ª hora e ressuscitação." }],
    },
    q_anafilatico: {
      id: "q_anafilatico",
      type: "decision",
      title: "Reação alérgica?",
      question: "Exposição a alérgeno (inseto, alimento, medicamento), urticária/angioedema?",
      options: [
        { id: "sim", label: "Sim — anafilático", next: "dx_anafilatico" },
        { id: "nao", label: "Não", next: "q_neurogenico" },
      ],
    },
    dx_anafilatico: {
      id: "dx_anafilatico",
      type: "transition",
      title: "Choque ANAFILÁTICO (distributivo)",
      summary: "Hipersensibilidade sistêmica → vasodilatação + ↑ permeabilidade + broncoespasmo.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: liberação maciça de mediadores → vasoplegia, edema, broncoespasmo.",
        "Confirmar: exposição + acometimento de pele/mucosa + comprometimento respiratório/hemodinâmico.",
        "Ações: ADRENALINA IM IMEDIATA (0,3–0,5 mg coxa); O₂; cristaloide; repetir adrenalina; via aérea se angioedema. Ver o guia de anafilaxia.",
      ],
      targets: [{ moduleId: "anafilaxia", label: "Guia de anafilaxia", reason: "Adrenalina IM e manejo escalonado." }],
    },
    q_neurogenico: {
      id: "q_neurogenico",
      type: "decision",
      title: "Lesão medular recente?",
      question: "Trauma raquimedular com hipotensão + bradicardia (sem taquicardia compensatória)?",
      options: [
        { id: "sim", label: "Sim — neurogênico", next: "dx_neurogenico" },
        { id: "nao", label: "Não", next: "dx_distributivo_outro" },
      ],
    },
    dx_neurogenico: {
      id: "dx_neurogenico",
      type: "transition",
      title: "Choque NEUROGÊNICO (distributivo)",
      summary: "Perda do tônus simpático por lesão medular. Perfil: PA↓ FC↓/normal pele quente/seca.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: vasodilatação + bradicardia por perda simpática (lesão medular alta).",
        "Confirmar: trauma raquimedular, hipotensão SEM taquicardia, déficit neurológico.",
        "Ações: volume com cautela; vasopressor (noradrenalina); atropina/marcapasso se bradicardia sintomática; imobilização e manejo neurocirúrgico.",
      ],
      targets: [],
    },
    dx_distributivo_outro: {
      id: "dx_distributivo_outro",
      type: "transition",
      title: "Choque DISTRIBUTIVO — outra causa",
      summary: "Distributivo sem foco séptico/alérgico/medular claro.",
      disposition: "icu",
      exitCriteria: [
        DISTRIBUTIVO_FISIOLOGIA,
        DISTRIBUTIVO_POR_QUE_VASOPRESSOR_CEDO,
        DISTRIBUTIVO_RECONSIDERE,
        "Considerar: insuficiência adrenal (crise addisoniana), intoxicações (vasodilatadores), pós-bypass, hepatopatia.",
        DISTRIBUTIVO_O_QUE_ESTE_APP_NAO_LISTA,
        // ── ⚠️ A REDE, E A RAZÃO AQUI É OUTRA ───────────────────────────────
        //
        // No `estabilizacao_metas` o gatilho pega ANTES de classificar. Aqui ele
        // pega quem classificou ERRADO — e por isso o texto é outro, não o mesmo
        // repetido: o LAST NÃO é distributivo. O colapso vem de bloqueio de canal
        // de sódio (depressão miocárdica e arritmia), não de vasoplegia, e quem
        // chega a este ramo com LAST já errou antes. Insistir em volume e
        // noradrenalina atrasa o único antídoto que funciona.
        LAST_NAO_E_DISTRIBUTIVO,
        "Ações: ressuscitação volêmica + noradrenalina; investigar causa (cortisol, história medicamentosa); hidrocortisona se suspeita de insuficiência adrenal.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte vasopressor." }],
    },
  },
};
