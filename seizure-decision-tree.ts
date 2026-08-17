import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  BETA_HCG_TEM_CONSEQUENCIA,
  CRISE_GESTANTE_PUERPERA,
  CRISE_GESTANTE_PUERPERA_GATILHO,
  CRISE_PUERPERA_GATILHO_POS_ICTAL,
  HIPONATREMIA_NA_CRISE,
  PIRIDOXINA_ISONIAZIDA,
} from "./lib/crise-na-gestante-e-puerpera";
import {
  NA_DUVIDA_CONSCIENCIA,
  NA_DUVIDA_CRISE_CESSOU,
} from "./lib/na-duvida";

/**
 * Crises convulsivas e mal epiléptico — protocolo tempo-dependente.
 * Fiel ao American Epilepsy Society (AES 2016) e Neurocritical Care Society:
 * estabilização (0–5 min) → 1ª linha benzodiazepínico (5–20 min) → 2ª linha
 * antiepiléptico IV (20–40 min) → 3ª linha / anestésico + IOT (40–60 min).
 * Doses por peso calculadas em derive().
 *
 * Fonte declarada: Mullhi R, Hayton T, Midgley-Hunt A, et al. Guidance for:
 * the acute management of status epilepticus in adult patients. J Intensive
 * Care Soc 2025;26(2):249-263 — consenso multiespecialidade (medicina aguda,
 * neurologia, intensivismo e farmácia), com definições da ILAE e doses tiradas
 * do ESETT, citando Glauser/AES 2016 e Brophy/NCS 2012.
 *
 * ⚠️ ESCOPO: essa diretriz EXCLUI a população obstétrica. Crise em gestante
 * com síndrome hipertensiva é o módulo de pré-eclâmpsia e eclâmpsia, onde o
 * fármaco de primeira linha é o sulfato de magnésio, não o benzodiazepínico.
 */

export const seizureDecisionTree: DecisionTreeDefinition = {
  id: "mal_epileptico",
  version: "2024.1",
  label: "Crises convulsivas e mal epiléptico",
  entryNodeId: "inicio",
  /** O campo de tempo decorrido arma o relógio da crise. */
  marcos: { tempoDeCrise: "inicioDoEvento" },
  derive: (v): Record<string, string> => {
    const peso = Number((v.peso ?? "").replace(",", "."));
    if (!Number.isFinite(peso) || peso <= 0) return {};
    const r1 = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");
    const r0 = (n: number) => Math.round(n).toString();
    return {
      // 1ª linha
      // Mantido para compatibilidade de tokens, mas a tela do adulto passou a
      // exibir a dose FIXA de 10 mg IM (ENLS 5.0). Dose por quilo cujo teto
      // satura abaixo do peso adulto médio é cálculo sem consequência.
      midazolamIm: r0(Math.min(10, peso * 0.2)),
      diazepamIv: r0(Math.min(10, peso * 0.15)),
      // 2ª linha
      // Teto de 2.000 mg (Mullhi 2025). Sem ele, um paciente de 120 kg recebia
      // 2.400 mg calculados pelo app — acima do máximo da diretriz.
      fenitoina: r0(Math.min(2000, peso * 20)),
      valproato: r0(peso * 40),
      levetiracetam: r0(Math.min(4500, peso * 60)),
      lacosamida: r0(Math.min(400, peso * 5)),
      // 3ª linha (anestésicos)
      midazolamBolus: r1(peso * 0.2),
      propofolBolus: r1(peso * 2),
      tiopental: r0(peso * 3),
    };
  },
  nodes: {
    inicio: {
      id: "inicio",
      type: "decision",
      title: "Crise em atividade?",
      question: "O paciente está convulsionando AGORA (crise motora em curso)?",
      // ⚠️ ESTE `summary` NASCEU DE UM ITEM DE `evidence` (2026-08-17).
      // `ListaDeCriterios` recolhe por CONTAGEM (`itens.length <= 2` fica
      // aberto): o nó tinha TRÊS itens e estava inteiro atrás do "Ver
      // critérios". Subir o item que MUDA CONDUTA trouxe junto, de graça,
      // os outros dois — que agora aparecem sem toque.
      summary:
        "⏱ NÃO ESPERE 30 MINUTOS — o tratamento começa aos 5 MINUTOS de crise contínua, e é esse o marco que define mal epiléptico.",
      evidence: [
        "Mal epiléptico = crise ≥ 5 min OU crises recorrentes sem recuperação da consciência entre elas (AES 2016).",
        "Estabilização SEMPRE primeiro: via aérea, O₂, monitor, acesso, GLICEMIA CAPILAR.",
      ],
      options: [
        { id: "sim", label: "Sim — crise em atividade", next: "tempo_de_crise" },
        { id: "nao", label: "Não — crise já cessou (pós-ictal)", next: "pos_ictal" },
      ],
    },

    /**
     * ── O RELÓGIO CONTA DO INÍCIO DA CRISE, NÃO DA ABERTURA DO APP ─────────
     *
     * Se o app contasse do próprio uso, mediria o atraso do atendimento como se
     * fosse a duração da crise — e no status a diferença entre as duas medidas é
     * exatamente o atraso que o protocolo existe para evitar. Um paciente que
     * convulsiona há 12 min quando o app abre já está na janela da segunda
     * linha; um relógio zerado diria "faltam 8 min para a 1ª linha".
     *
     * Presets em vez de digitação: ninguém digita relógio com o paciente
     * convulsionando. Mesmo molde do nó `tempo` do AVC, que resolve o mesmo
     * problema para a janela de reperfusão.
     */
    tempo_de_crise: {
      id: "tempo_de_crise",
      type: "input",
      title: "Há quanto tempo a crise começou?",
      intro:
        "Toque no tempo decorrido. É daqui que TODAS as fases contam — não do momento em que o app foi aberto.",
      fields: [
        {
          id: "tempoDeCrise",
          label: "Tempo desde o início da crise",
          presets: [
            { value: "0", label: "Começou agora" },
            { value: "2", label: "~2 min" },
            { value: "5", label: "~5 min" },
            { value: "10", label: "~10 min" },
            { value: "20", label: "~20 min" },
            { value: "40", label: "mais de 40 min" },
            { value: "desconhecido", label: "Não sei" },
          ],
        },
      ],
      next: "estabilizacao",
    },

    estabilizacao: {
      id: "estabilizacao",
      prazos: [
        {
          id: "crise",
          aos: 5,
          marco: "inicioDoEvento" as const,
          aoVencer:
            "⏱️ 5 MIN DE CRISE — é mal epiléptico. Administrar o benzodiazepínico AGORA; a estabilização segue em paralelo, não antes.",
          sugereNo: "primeira_linha",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou dos 5 min sem benzodiazepínico. Não há fase anterior a completar — a estabilização é simultânea, não pré-requisito.",
        },
      ],
      type: "action",
      title: "0–5 min · Estabilização simultânea",
      summary: "Fazer TUDO em paralelo enquanto prepara o benzodiazepínico.",
      actions: [
        "Via aérea: posicionar, aspirar, O₂ suplementar (máscara). NÃO forçar cânula na boca durante a crise.",
        "Monitor: oximetria, PA, ECG contínuo. Acesso venoso calibroso (2 se possível).",
        "GLICEMIA CAPILAR IMEDIATA — se < 60 mg/dL: glicose 50% 50 mL IV + tiamina 100 mg IV (antes da glicose em etilista/desnutrido).",
        "Coletar: eletrólitos (Na, Ca, Mg), função renal/hepática, hemograma, gasometria, níveis de antiepilépticos, β-hCG, toxicológico.",
        // ── A EXCLUSÃO DE ESCOPO SAI DO COMENTÁRIO ──────────────────────
        // O cabeçalho deste arquivo dizia que a população obstétrica está
        // fora da diretriz — em COMENTÁRIO, invisível para quem usa. O
        // β-hCG era colhido aqui e nada no fluxo agia sobre ele.
        BETA_HCG_TEM_CONSEQUENCIA,
        // ⚠️ O TEXTO COMPLETO VIVE AQUI, E SÓ AQUI — é onde a decisão do
        // magnésio se abre (o β-hCG é colhido neste nó). Nos outros três
        // estágios fica o GATILHO com os dois fatos. A razão das quatro
        // colocações está escrita em `lib/crise-na-gestante-e-puerpera.ts`.
        CRISE_GESTANTE_PUERPERA,
        "Cronometrar a crise — o tempo define a escalada terapêutica.",
        "Proteger o paciente de trauma; não conter à força; decúbito lateral se possível.",
      ],
      next: "peso",
    },

    peso: {
      id: "peso",
      type: "input",
      title: "Peso do paciente",
      intro: "Usado para calcular as doses das 2ª e 3ª linhas.",
      fields: [
        {
          id: "peso",
          label: "Peso estimado (kg)",
          unit: "kg",
          presets: [
            { value: "50", label: "50 kg" },
            { value: "60", label: "60 kg" },
            { value: "70", label: "70 kg" },
            { value: "80", label: "80 kg" },
            { value: "90", label: "90 kg" },
            { value: "100", label: "100 kg" },
          ],
          allowCustom: true,
          customLabel: "Outro peso (kg)",
          customKeyboard: "numeric",
        },
        {
          id: "pesoOrigem",
          label: "Este peso é",
          optional: true,
          presets: [
            { value: "estimado", label: "Estimado" },
            { value: "real", label: "Real (pesado)" },
          ],
        },
      ],
      next: "primeira_linha",
    },

    primeira_linha: {
      id: "primeira_linha",
      prazos: [
        {
          id: "crise",
          aos: 20,
          marco: "inicioDoEvento" as const,
          aoVencer:
            "⏱️ 20 MIN DE CRISE — a 1ª linha falhou. Passar para o antiepiléptico IV de 2ª linha; não repetir benzodiazepínico uma terceira vez.",
          sugereNo: "segunda_linha",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou dos 20 min ainda na 1ª linha. A 2ª linha está atrasada — esta é a pendência.",
        },
        {
          id: "repique_bzd",
          aos: 5,
          marco: "ultimaDose" as const,
          aoVencer:
            "⏱️ 5 min da dose — o benzodiazepínico pode ser repetido UMA vez se a crise persistir. Uma, não mais.",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ O repique do benzodiazepínico já venceu. Duas doses é o teto: se a crise persiste, o caminho é a 2ª linha.",
        },
      ],
      type: "action",
      title: "5–20 min · 1ª linha — BENZODIAZEPÍNICO",
      summary: "Dose ADEQUADA e única classe eficaz nesta fase. Subdosar é o erro mais comum.",
      actions: [
        "COM acesso IV — Diazepam {diazepamIv} mg IV (0,15–0,2 mg/kg, máx 10 mg) a 5 mg/min; pode repetir 1×.",
        "COM acesso IV (alternativa preferida) — Lorazepam 4 mg IV (0,1 mg/kg, máx 4 mg) a 2 mg/min; pode repetir 1× em 5 min.",
        "SEM acesso IV — Midazolam 10 mg IM, dose FIXA no adulto (2 mL da ampola de 5 mg/mL) — via IM é tão eficaz quanto IV (estudo RAMPART, que usou 10 mg acima de 40 kg). Não calcular por peso: o teto de 10 mg satura em 50 kg, então quase todo adulto receberia 10 mg de qualquer forma e o cálculo só adiciona oportunidade de erro no meio de uma crise.",
        "Alternativas sem IV: midazolam intranasal ou bucal 10 mg.",
        "A via RETAL não entra neste módulo, e a ausência é deliberada: diazepam retal é prática pediátrica e domiciliar, o gel retal NÃO é comercializado no Brasil, e no adulto sem acesso venoso o caminho com evidência é o midazolam IM — não inferior ao lorazepam IV no estado de mal pré-hospitalar (RAMPART). Se a via retal for a única possível, a dose adulta é FIXA (20 mg), não por quilo.",
        "Repetir o benzodiazepínico UMA vez se a crise persistir após 5 min.",
        // ⚠️ GATILHO, não o texto completo — os dois fatos que mudam conduta.
        // Aqui é onde alguém poderia trocar o benzodiazepínico pelo magnésio e
        // deixar de abortar uma crise ativa: é por isso que o fato (b) é
        // inegociável neste nó.
        CRISE_GESTANTE_PUERPERA_GATILHO,
        "Vigiar depressão respiratória e hipotensão — ter material de via aérea pronto.",
      ],
      next: "reavaliar_1",
    },

    reavaliar_1: {
      id: "reavaliar_1",
      type: "decision",
      title: "Reavaliar após benzodiazepínico",
      question: "A crise cessou após a(s) dose(s) de benzodiazepínico?",
      summary: NA_DUVIDA_CRISE_CESSOU,
      evidence: [
        "Avaliar clinicamente 5–10 min após a 2ª dose de benzodiazepínico.",
        "Atenção ao mal epiléptico NÃO-CONVULSIVO: parou de convulsionar mas não recupera a consciência → EEG urgente.",
      ],
      options: [
        { id: "cessou", label: "Sim — crise cessou", next: "pos_crise" },
        { id: "persiste", label: "Não — crise persiste (> 20 min)", next: "segunda_linha" },
      ],
    },

    segunda_linha: {
      id: "segunda_linha",
      prazos: [
        {
          id: "crise",
          aos: 40,
          marco: "inicioDoEvento" as const,
          aoVencer:
            "⏱️ 40 MIN DE CRISE — estado de mal REFRATÁRIO. Anestésico contínuo + IOT + EEG.",
          sugereNo: "terceira_linha",
          aoUltrapassar: "seguirContando" as const,
          aoUltrapassarTexto:
            "⏱️ Passou dos 40 min ainda na 2ª linha. O refratário está atrasado — esta é a pendência.",
        },
      ],
      type: "action",
      title: "20–40 min · 2ª linha — antiepiléptico IV",
      summary: "Escolher UM. Nenhum é comprovadamente superior (ESETT) — decidir por comorbidade e disponibilidade.",
      actions: [
        "Levetiracetam {levetiracetam} mg IV (60 mg/kg, máx 4.500 mg) em 10 min — melhor perfil de segurança, sem interações; 1ª opção na maioria.",
        "Valproato {valproato} mg IV (40 mg/kg, máx 3.000 mg) em 10 min — EVITAR em hepatopatia, gestante e suspeita de doença mitocondrial.",
        "Fenitoína {fenitoina} mg IV (20 mg/kg, MÁXIMO 2.000 mg) em velocidade ≤ 50 mg/min (≤ 25 mg/min se idoso/cardiopata) — monitor obrigatório: hipotensão e arritmia. Diluir SÓ em soro fisiológico.",
        "Fosfenitoína 20 mg PE/kg IV a 150 mg PE/min — preferível à fenitoína (menos flebite/hipotensão), se disponível.",
        "Lacosamida {lacosamida} mg IV (5 mg/kg, máx 400 mg) em 15 min — alternativa com pouca interação.",
        // ⚠️ ANTES DE ESCALAR, AS CAUSAS EM QUE ESCALAR NÃO RESOLVE. As duas
        // abaixo têm tratamento ESPECÍFICO, e sem ele o paciente sobe até o
        // anestésico à toa. A piridoxina existia só em Intoxicações e a
        // hiponatremia só nas Correções Eletrolíticas — R-48 pela
        // distribuição, como o ajuste renal da enoxaparina no TEP.
        PIRIDOXINA_ISONIAZIDA,
        HIPONATREMIA_NA_CRISE,
        "Manter monitorização hemodinâmica contínua durante a infusão.",
      ],
      next: "reavaliar_2",
    },

    reavaliar_2: {
      id: "reavaliar_2",
      type: "decision",
      title: "Reavaliar após 2ª linha",
      question: "A crise cessou após o antiepiléptico de 2ª linha?",
      summary: NA_DUVIDA_CRISE_CESSOU,
      evidence: [
        "Mal epiléptico REFRATÁRIO = persiste após benzodiazepínico + 1 antiepiléptico de 2ª linha. Exige via aérea definitiva, UTI e EEG contínuo.",
        "SUPERREFRATÁRIO = continua ou recorre apesar de infusão adequada de anestésico por mais de 24 h. Costuma ter doença neurológica de base (encefalite autoimune, por exemplo) — discutir com centro terciário e considerar transferência.",
        "NORSE = mal refratário de início novo em paciente SEM epilepsia prévia e sem causa estrutural, metabólica ou tóxica clara. FIRES é o subtipo com febre entre 1 e 14 dias antes — a febre pode já não estar presente na crise.",
        "Mal epiléptico NÃO CONVULSIVO com rebaixamento de consciência tem alta mortalidade e deve ser tratado como o convulsivo.",
        "Crise dissociativa (NEAD/PNES) é diagnóstico diferencial real e comum — o termo \"pseudocrise\" é obsoleto.",
      ],
      options: [
        { id: "cessou", label: "Sim — crise cessou", next: "pos_crise" },
        { id: "refratario", label: "Não — refratário (> 40 min)", next: "terceira_linha" },
      ],
    },

    terceira_linha: {
      id: "terceira_linha",
      prazos: [
        {
          id: "crise",
          aos: 60,
          marco: "inicioDoEvento" as const,
          aoVencer:
            "⏱️ 60 MIN DE CRISE. Se o anestésico já corre, o relógio que decide passa a ser o DELE: superrefratário é crise que persiste ou recorre após 24 h de infusão adequada.",
          aoUltrapassar: "trocarDeMarco" as const,
          proximoMarco: "inicioDoAnestesico" as const,
          aoUltrapassarTexto:
            "⚠️ MAIS DE 60 MIN DE CRISE e todas as fases declaradas foram ultrapassadas. Se o anestésico ainda NÃO foi iniciado, ESTA é a pendência — não há fase seguinte a esperar.",
        },
      ],
      type: "action",
      title: "40–60 min · Refratário — anestésico + IOT",
      summary: "Intubar e iniciar infusão contínua com EEG contínuo. Alvo: supressão de crises (ou surto-supressão).",
      actions: [
        "INTUBAR (sequência rápida) — via aérea definitiva é obrigatória nesta fase. Ver módulo ISR.",
        "Midazolam: bolus {midazolamBolus} mg (0,2 mg/kg) → infusão 0,05–2 mg/kg/h, titulada por EEG. Titular até cessar crises. Esta faixa é a do STATUS REFRATÁRIO — dez vezes o teto da sedação comum, e é o objetivo que muda: aqui a meta é supressão da atividade elétrica, não conforto.",
        // A unidade canônica do propofol no app é mcg/kg/min — é a que o motor de
        // Sedoanalgesia usa para CALCULAR. Aqui vinha só em mg/kg/h, e o mesmo
        // fármaco aparecia em duas unidades em módulos vizinhos: 60× de
        // diferença entre elas, e nada avisando qual era qual.
        "Propofol: bolus {propofolBolus} mg (2 mg/kg) → infusão até 67 mcg/kg/min (4 mg/kg/h). Acima disso o risco de síndrome da infusão do propofol (PRIS) sobe muito: se for inevitável ultrapassar, ECG diário + CK e triglicerídeos, e considerar trocar de agente.",
        "⚠️ Dieta cetogênica junto com propofol: usar com cautela — a oxidação de ácidos graxos já está prejudicada e o risco de PRIS aumenta.",
        "Tiopental/pentobarbital {tiopental} mg (3–5 mg/kg) → infusão 1–5 mg/kg/h — última linha; hipotensão e imunossupressão.",
        "EEG CONTÍNUO obrigatório — alvo: cessação de crises eletrográficas ou padrão surto-supressão. Manter por pelo menos 24 h após a resolução das crises, ainda sob sedação.",
        "Montagem reduzida de 8 canais é aceitável para monitorização contínua. BIS NÃO substitui o EEG — perde atividade focal.",
        "Sem EEG contínuo disponível: EEG intermitente de duração estendida e contato com centro de referência em neurointensivismo.",
        "⚠️ NÃO fazer interrupção diária da sedação no estado de mal — a regra geral da UTI NÃO se aplica aqui. O anestésico deve ser DESMAMADO gradualmente, após pelo menos 24 h de controle; desmame rápido causa crise de rebote.",
        "Estabelecer o antiepiléptico de MANUTENÇÃO cedo, antes de começar a retirar o anestésico — falha em fazer isso (sobretudo fenitoína subterapêutica nos primeiros dias após o ataque) é causa clássica de recidiva.",
        "Manter o anticonvulsivante crônico do paciente em DOSE PLENA em paralelo, revertendo qualquer redução recente; colher nível sérico na admissão, sem atrasar doses por causa do resultado.",
        "Vasopressor se hipotensão pela sedação — evitar hipotensão, que agrava a lesão neuronal.",
        "Investigar causa estrutural/inflamatória: TC de crânio, punção lombar, autoanticorpos.",
        // ⚠️ AS DUAS CAUSAS REPETEM AQUI DE PROPÓSITO, E A TRAVA ME PROVOU.
        //
        // Tirei-as por medição (1.154 ch repetidos da 2ª linha) e troquei por um
        // ponteiro. `test:convulsoes` reprovou com um argumento melhor que o meu:
        // «É exatamente ali que o paciente está sob anestésico sem que ninguém
        // tenha perguntado por isoniazida ou olhado o sódio.»
        //
        // O meu raciocínio era «perguntar na 3ª linha é tarde» — verdadeiro, e
        // irrelevante para quem JÁ está na 3ª linha. Ponteiro aqui exige navegar
        // para trás com o paciente sedado; o risco é assimétrico.
        //
        // QUARTA vez neste bloco em que repetição medida era decisão protegida.
        PIRIDOXINA_ISONIAZIDA,
        HIPONATREMIA_NA_CRISE,
        CRISE_GESTANTE_PUERPERA_GATILHO,
      ],
      next: "uti",
    },

    pos_crise: {
      id: "pos_crise",
      type: "decision",
      title: "Crise cessou — investigar causa",
      question: "O paciente recuperou plenamente a consciência em 20–30 min?",
      summary: NA_DUVIDA_CONSCIENCIA,
      evidence: [
        "Não recuperar a consciência sugere MAL EPILÉPTICO NÃO-CONVULSIVO — indicação de EEG urgente.",
        "Sempre buscar a causa: metabólica, infecciosa, estrutural, tóxica, abstinência ou má aderência.",
      ],
      options: [
        { id: "sim", label: "Sim — recuperou a consciência", next: "pos_ictal" },
        { id: "nao", label: "Não — consciência não recuperada", next: "nao_convulsivo" },
      ],
    },

    nao_convulsivo: {
      id: "nao_convulsivo",
      type: "transition",
      title: "Suspeita de mal epiléptico não-convulsivo",
      summary: "Parou de convulsionar mas não desperta — assumir crise eletrográfica até prova em contrário.",
      disposition: "icu",
      exitCriteria: [
        "EEG urgente/contínuo — não adiar o tratamento aguardando o exame.",
        "Manter/escalar antiepiléptico; considerar 2ª linha se ainda não feita.",
        "TC de crânio e punção lombar conforme suspeita; rever fármacos e distúrbios metabólicos.",
        "Internação em UTI com monitorização neurológica.",
      ],
      targets: [
        { moduleId: "isr-rapida", label: "ISR — via aérea", reason: "Rebaixamento com risco de aspiração / necessidade de via aérea definitiva" },
        { moduleId: "pre-eclampsia", label: "Pré-eclâmpsia e eclâmpsia", reason: "Gestante ou puérpera — o sulfato de magnésio não é substituível por antiepiléptico" },
      ],
    },

    pos_ictal: {
      id: "pos_ictal",
      type: "action",
      title: "Pós-ictal — investigação etiológica",
      summary: "Crise controlada: definir causa e risco de recorrência.",
      actions: [
        "Glicemia, eletrólitos (Na, Ca, Mg), função renal e hepática, hemograma, PCR, β-hCG.",
        "Nível sérico do antiepiléptico se já em uso (má aderência é causa frequente).",
        "TC de crânio: primeira crise, trauma, febre, imunossupressão, anticoagulação, déficit focal ou não recuperação plena.",
        "Punção lombar se febre/meningismo/imunossupressão (após TC quando indicada).",
        "Toxicológico e história de abstinência (álcool, BZD) — abstinência alcoólica: benzodiazepínico é o tratamento.",
        "Rever gatilhos: privação de sono, infecção, fármacos que reduzem limiar convulsivo.",
        // ⚠️ VARIANTE DO PÓS-ICTAL, com a puérpera à frente: aqui o paciente já
        // não convulsiona e a pessoa já não está grávida — as duas coisas que
        // fazem ninguém pensar em eclâmpsia acontecem juntas.
        CRISE_PUERPERA_GATILHO_POS_ICTAL,
      ],
      next: "destino",
    },

    destino: {
      id: "destino",
      type: "decision",
      title: "Definir destino",
      question: "Há crise recorrente, causa aguda grave, déficit persistente ou necessidade de suporte?",
      evidence: [
        "Alta é possível na primeira crise ISOLADA com exame neurológico normal, causa identificada/reversível e retorno garantido.",
        "Mal epiléptico (qualquer fase) sempre interna.",
      ],
      options: [
        { id: "grave", label: "Sim — recorrência/causa grave/suporte", next: "uti" },
        { id: "nao", label: "Não — crise única, exame normal", next: "alta" },
      ],
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "Internação em UTI",
      summary: "Mal epiléptico refratário, rebaixamento persistente ou causa aguda grave.",
      disposition: "icu",
      exitCriteria: [
        "EEG contínuo até controle das crises eletrográficas; manter antiepiléptico de manutenção.",
        "Metas na UTI: PAM ≥ 65 mmHg; ventilação protetora com volume corrente 6–8 mL/kg de peso PREDITO (pela altura), platô < 30 cmH₂O, PEEP > 5 e PaO₂ acima de 8 kPa (≈ 60 mmHg); glicemia entre 8 e 12 mmol/L (≈ 145–215 mg/dL).",
        "Nutrição enteral precoce, idealmente em até 48 h. Infecção do SNC clinicamente aparente: tratar agressivamente desde o início.",
        "Suporte ventilatório e hemodinâmico; evitar hipotensão (piora a lesão neuronal).",
        "Superrefratário — desmamar o anestésico após no mínimo 24 h; se a crise voltar (clínica ou no EEG), reinstituir. Repetir a infusão por 48 h com OUTRO agente (tiopental), ou considerar quetamina ou anestésico inalatório (isoflurano).",
        "Superrefratário — acrescentar antiepiléptico não sedativo (lacosamida ou fenobarbital), manter o magnésio na faixa normal (alguns serviços miram 1,0–1,5 mmol/L) e REPETIR a imagem do cérebro em busca de lesão tratável.",
        "Superrefratário sem causa definida: considerar encefalite autoimune, NORSE e FIRES. A imunoterapia é conduzida pelo neurologista e pode ser iniciada mesmo com sorologia negativa — 1ª linha metilprednisolona 1 g/dia por 3 dias, imunoglobulina IV ou plasmaférese.",
        "Três causas clássicas de falha do tratamento: mal não convulsivo em curso por EEG insuficiente; manutenção não estabelecida antes de retirar o anestésico; e desmame rápido do anestésico, com crise de rebote.",
        "Corrigir a causa: infecção, distúrbio metabólico, lesão estrutural, intoxicação/abstinência.",
        "Normotermia, normoglicemia e profilaxia de TVP.",
      ],
      targets: [
        { moduleId: "isr-rapida", label: "ISR — via aérea", reason: "Intubação para mal epiléptico refratário" },
        { moduleId: "sedoanalgesia", label: "Sedoanalgesia & BNM", reason: "Infusão contínua de midazolam/propofol" },
        { moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Parametrização pós-intubação" },
      ],
    },

    alta: {
      id: "alta",
      type: "transition",
      title: "Alta com seguimento",
      summary: "Primeira crise isolada, exame neurológico normal e causa reversível tratada.",
      disposition: "discharge",
      exitCriteria: [
        "Orientar acompanhante sobre o que fazer numa nova crise (decúbito lateral, não conter, cronometrar, procurar emergência se > 5 min).",
        "Restrição de direção conforme legislação local; evitar altura, natação sozinho e máquinas.",
        "Encaminhar à neurologia; discutir início de antiepiléptico (nem toda 1ª crise exige).",
        "Retorno imediato se nova crise, cefaleia progressiva, febre ou déficit focal.",
      ],
      targets: [],
    },
  },
};
