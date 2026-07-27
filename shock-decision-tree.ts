import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Fluxograma de choque — diagnóstico diferencial por perguntas binárias.
 * Cada diagnóstico final traz mecanismo, sinais confirmatórios, próximas ações
 * e link para o protocolo correspondente no app.
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
        "Hipoperfusão: lactato ↑, oligúria, pele marmórea/fria, alteração de consciência, enchimento capilar lento.",
        "Estabilização sempre primeiro: O₂, acessos, volume conforme contexto, monitorização.",
      ],
      options: [
        { id: "sim", label: "Sim — choque / hipoperfusão", next: "q_hipovolemia" },
        { id: "nao", label: "Não", next: "sem_choque" },
      ],
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

    q_hipovolemia: {
      id: "q_hipovolemia",
      type: "decision",
      title: "Sinais de hipovolemia?",
      question: "Sangramento ativo, vômitos/diarreia, queimadura ou trauma com perda volêmica?",
      evidence: ["Veias colabadas, resposta a volume, hematócrito/lactato, foco de perda evidente."],
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
        "Ações: 2 acessos calibrosos; cristaloide em bolus; controlar a fonte (hemostasia/cirurgia); hemoderivados e protocolo de transfusão maciça se hemorrágico; reavaliar resposta.",
      ],
      targets: [],
    },

    q_obstrutivo: {
      id: "q_obstrutivo",
      type: "decision",
      title: "Sinais de obstrução mecânica?",
      question: "Distensão venosa jugular, murmúrio ausente, ausência de pulso, sons cardíacos abafados?",
      evidence: ["Pensar em pneumotórax hipertensivo, tamponamento e TEP maciço."],
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
        { id: "sim", label: "Sim", next: "dx_cardiogenico" },
        { id: "nao", label: "Não", next: "q_distributivo" },
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
        "Ações: EVITAR volume agressivo; inotrópico (dobutamina) + vasopressor (noradrenalina); tratar a causa (reperfusão no IAM; cardioversão na arritmia instável); considerar suporte mecânico (BIA/Impella/ECMO).",
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
        { id: "nao", label: "Não / indefinido", next: "dx_distributivo_outro" },
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
        "Considerar: insuficiência adrenal (crise addisoniana), intoxicações (vasodilatadores), pós-bypass, hepatopatia.",
        "Ações: ressuscitação volêmica + noradrenalina; investigar causa (cortisol, história medicamentosa); hidrocortisona se suspeita de insuficiência adrenal.",
      ],
      targets: [{ moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Suporte vasopressor." }],
    },
  },
};
