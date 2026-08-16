import type { DecisionTreeDefinition } from "./core/decision-tree/types";
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
        "Lactato acima de 2 mmol/L com pele alterada fecha hipoperfusão mesmo com pressão normal — é o choque compensado, e ele existe justamente porque a PA se mantém à custa de vasoconstrição.",
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
      summary: "As metas valem para qualquer tipo de choque — o tipo define o tratamento, não o alvo.",
      actions: [
        "Metas hemodinâmicas gerais: PAM ≥ 65 mmHg; normalização do lactato (alvo < 2 mmol/L ≈ 18 mg/dL), com queda esperada ≥ 10% por hora.",
        "Metas de oferta de O₂: hemoglobina ≥ 7 g/dL e saturação de pulso > 90%.",
        "Meta de reversão de disfunção orgânica: diurese > 0,5 mL/kg/h e melhora do estado neurológico atribuível ao choque.",
        "Ressuscitação volêmica guiada por resposta: repetir a prova de fluido-responsividade enquanto os parâmetros sugerirem resposta a volume — não infundir volume fixo no automático.",
        "Linha arterial para PAM quando a dose de noradrenalina passar de 0,3–0,5 mcg/kg/min, ou por outra indicação de monitorização invasiva.",
        "Exames para todos: lactato, gasometria, hemograma, PCR, ureia, creatinina, eletrólitos, cálcio iônico, magnésio, bilirrubinas, troponina, coagulograma, D-dímero, fibrinogênio, ECG, RX de tórax e ecocardiograma.",
        "POCUS/RUSH à beira leito quando a causa não for rapidamente evidente, quando o paciente não responder ao manejo inicial, ou na deterioração clínica rápida.",
        CHOQUE_RUSH_COMO,
        CHOQUE_MISTO,
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
        "Ações: 2 acessos calibrosos; bólus inicial de 500–1000 mL de cristaloide; controlar a fonte (hemostasia/cirurgia); hemoderivados e protocolo de transfusão maciça se hemorrágico; reavaliar após cada alíquota.",
        "Classificação do choque hemorrágico (ATLS): classe I até 750 mL (15%), FC < 100, PA normal · classe II 750–1500 mL (15–30%), FC 100–120, pressão de pulso estreita · classe III 1500–2000 mL (30–40%), FC 120–140, PA reduzida · classe IV acima de 2000 mL (> 40%), FC > 140, confusão e letargia.",
        "Atenção: em boa parte dos pacientes a resposta compensatória mantém a PA normal até que 30% da volemia tenha sido perdida — PA normal não afasta hemorragia grave.",
        "Metas no hemorrágico até a hemostasia: hipotensão permissiva pode ser considerada em casos selecionados (PAM-alvo 50 mmHg), tolerando PAM < 65 no sangramento ativo — EXCETO em lesão cerebral grave, em que o alvo é PAM 90–100 mmHg.",
        "Hemoglobina-alvo 7–8 g/dL; em paciente neurológico agudo, 9–10 g/dL. Corrigir a coagulopatia guiada por tromboelastometria quando disponível.",
        "Manter temperatura entre 35,7 e 37 °C; repor cálcio durante a transfusão maciça (o protocolo-fonte usa cloreto de cálcio a cada 2 hemocomponentes — seguir o regime institucional); suspender anticoagulantes, antiagregantes e fibrinolíticos.",
        "Acidemia: evitar bicarbonato de rotina e considerar vasopressor mais precocemente; bicarbonato de sódio 8,4% 1 mEq/kg apenas se pH < 7,1 e/ou bicarbonato < 12 mEq/L.",
      ],
      targets: [],
    },

    q_obstrutivo: {
      id: "q_obstrutivo",
      type: "decision",
      title: "Sinais de obstrução mecânica?",
      question: "Distensão venosa jugular, murmúrio ausente, ausência de pulso, sons cardíacos abafados?",
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
      question: "Murmúrio ausente + desvio de traqueia + timpanismo (e hipotensão)?",
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
        "Confirmar: clínico (não aguardar RX) — murmúrio ausente unilateral, desvio de traqueia, hipotensão, hipóxia.",
        "Ações: descompressão IMEDIATA — agulha 14G no 2º EIC linha hemiclavicular (ou 5º EIC linha axilar média) → drenagem pleural definitiva.",
      ],
      targets: [],
    },
    q_tamponamento: {
      id: "q_tamponamento",
      type: "decision",
      title: "Tamponamento cardíaco?",
      question: "Sons cardíacos abafados + distensão jugular + hipotensão (tríade de Beck)?",
      options: [
        { id: "sim", label: "Sim", next: "dx_tamponamento" },
        { id: "nao", label: "Não — TEP maciço?", next: "dx_tep" },
      ],
    },
    dx_tamponamento: {
      id: "dx_tamponamento",
      type: "transition",
      title: "TAMPONAMENTO CARDÍACO (obstrutivo)",
      summary: "Líquido pericárdico sob pressão → restrição do enchimento. Pulso paradoxal.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: ↑ pressão pericárdica → ↓ enchimento diastólico → ↓ DC.",
        "Confirmar: ECO à beira leito (derrame + colapso de câmaras), pulso paradoxal, baixa voltagem/alternância elétrica no ECG.",
        "Ações: expansão volêmica como ponte; PERICARDIOCENTESE de urgência (guiada por ECO); tratar a causa.",
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
        "Confirmar: ECO (dilatação/disfunção de VD, McConnell), AngioTC quando estável; D-dímero não exclui no alto risco.",
        "Ações: HNF imediata; suporte com fluidos cautelosos + noradrenalina/dobutamina; TROMBÓLISE se instável sem contraindicação. Ver o guia de TEP.",
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
        { id: "sim", label: "Sim", next: "q_cardio_subtipo" },
        { id: "nao", label: "Não", next: "q_distributivo" },
      ],
    },

    q_cardio_subtipo: {
      id: "q_cardio_subtipo",
      type: "decision",
      title: "Qual o perfil do choque cardiogênico?",
      question: "O subtipo muda a conduta — sobretudo quanto a volume e a inotrópico. Qual se aplica?",
      evidence: [
        "Cerca de 80% dos choques cardiogênicos têm alguma forma de síndrome coronariana aguda por trás: fazer ECG em até 10 minutos.",
        "Descompensação aguda de insuficiência cardíaca crônica responde por até 30% dos casos.",
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
          // o perfil quente/frio — no VD, dar volume ajuda e diurético mata; na
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
        "Mecanismo: falência do VD com queda da pré-carga do VE. O IAM de VD NÃO cursa com congestão pulmonar e responde bem à infusão de volume — o oposto do IAM de VE.",
        "Confirmar: ECG com derivações direitas (V3R–V4R) no IAM inferior; ECO com VD dilatado/hipocontrátil; ausência de congestão pulmonar.",
        "Ações: administrar fluidos com a meta de recuperar e manter a pré-carga; noradrenalina; tratar bradiarritmia (absoluta ou relativa) e manter o sincronismo atrioventricular; considerar acrescentar ou transicionar para inotrópico.",
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
        "Ações: estabilização hemodinâmica com NORADRENALINA (vasopressor de escolha); considerar acrescentar inotrópico; evitar expansão volêmica — mais de 70% dos IAM de VE em choque já têm congestão e pioram com volume.",
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
      summary: "Baixo débito SEM congestão: aqui cabem alíquotas de volume.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: baixo débito com pressão diastólica final do VE possivelmente baixa — o paciente pode tolerar bólus de fluido.",
        "Confirmar: extremidades frias sem congestão pulmonar; ECO sem sinais de sobrecarga de volume.",
        "Ações: fluidos em PEQUENAS alíquotas, reavaliando a cada uma; estabilização hemodinâmica com noradrenalina; considerar acrescentar inotrópico.",
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
        "Ações: começar por INOTRÓPICO pode ser apropriado, já que a resistência vascular sistêmica está relativamente alta — dobutamina, milrinone ou levosimendana.",
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
        "Estenose aórtica: noradrenalina ± dobutamina. Com FE reduzida, considerar dobutamina titulada por ecocardiograma ou cateter de artéria pulmonar; com FE preservada, o inotrópico não traz ganho hemodinâmico.",
        "Insuficiência aórtica: dopamina; considerar marca-passo temporário para manter a FC alta — a FC alta reduz o tempo de enchimento diastólico e ajuda a baixar a pressão diastólica final do VE.",
        "Estenose mitral: noradrenalina ± amiodarona. EVITAR cronotrópicos — aqui o choque é pré-carga dependente; reduzir a FC e manter a sincronia atrioventricular melhoram a pré-carga.",
        "Insuficiência mitral: noradrenalina ± dobutamina ± balão intra-aórtico. Depois de estabilizar com vasopressor, considerar inotrópico; a redução da pós-carga ajuda a baixar a pressão diastólica final do VE.",
        "Obstrução dinâmica da via de saída do VE: alíquotas de fluido em bólus, noradrenalina, manter a sincronia atrioventricular e EVITAR inotrópicos e vasodilatadores.",
        "Ruptura de septo interventricular: noradrenalina ± dobutamina ± balão intra-aórtico, com avaliação cirúrgica imediata.",
        "Avaliação especializada e ecocardiograma são parte da conduta, não etapa posterior.",
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
        "Ações: EVITAR volume agressivo; noradrenalina como vasopressor de escolha, com inotrópico (dobutamina) associado; tratar a causa (reperfusão no IAM; cardioversão na arritmia instável); considerar suporte mecânico (BIA/Impella/ECMO).",
        CHOQUE_CARDIOGENICO_EXCLUIR_OBSTRUTIVO,
        "⚠️ EXCEÇÃO — IAM de ventrículo direito: NÃO cursa com congestão pulmonar e responde bem a volume. Regra do 'evitar volume' não se aplica; a conduta é oposta à do VE.",
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
      question: "Pele quente, pulso amplo, febre ou suspeita de infecção?",
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
      summary: "Vasoplegia por resposta à infecção. Perfil: RVS↓ DC↑/normal pele quente.",
      disposition: "icu",
      exitCriteria: [
        "Mecanismo: vasodilatação + disfunção microcirculatória por infecção.",
        "Confirmar: foco infeccioso, lactato > 2, necessidade de vasopressor para PAM ≥ 65.",
        "Ações: bundle da 1ª hora — lactato + culturas + ATB amplo ≤ 1 h + cristaloide 30 mL/kg + noradrenalina (PAM ≥ 65). Controle do foco. Ver o guia da sepse.",
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
        "Ações: ressuscitação volêmica + noradrenalina; investigar causa (cortisol, história medicamentosa); hidrocortisona se suspeita de insuficiência adrenal.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte vasopressor." }],
    },
  },
};
