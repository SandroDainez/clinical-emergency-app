import type { DecisionTreeDefinition } from "./core/decision-tree/types";

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
  derive: (v): Record<string, string> => {
    const peso = Number((v.peso ?? "").replace(",", "."));
    if (!Number.isFinite(peso) || peso <= 0) return {};
    const r1 = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");
    const r0 = (n: number) => Math.round(n).toString();
    return {
      // 1ª linha
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
      evidence: [
        "Mal epiléptico = crise ≥ 5 min OU crises recorrentes sem recuperação da consciência entre elas (AES 2016).",
        "Não esperar 30 min: o tratamento começa aos 5 minutos de crise contínua.",
        "Estabilização SEMPRE primeiro: via aérea, O₂, monitor, acesso, GLICEMIA CAPILAR.",
      ],
      options: [
        { id: "sim", label: "Sim — crise em atividade", next: "estabilizacao" },
        { id: "nao", label: "Não — crise já cessou (pós-ictal)", next: "pos_ictal" },
      ],
    },

    estabilizacao: {
      id: "estabilizacao",
      type: "action",
      title: "0–5 min · Estabilização simultânea",
      summary: "Fazer TUDO em paralelo enquanto prepara o benzodiazepínico.",
      actions: [
        "Via aérea: posicionar, aspirar, O₂ suplementar (máscara). NÃO forçar cânula na boca durante a crise.",
        "Monitor: oximetria, PA, ECG contínuo. Acesso venoso calibroso (2 se possível).",
        "GLICEMIA CAPILAR IMEDIATA — se < 60 mg/dL: glicose 50% 50 mL IV + tiamina 100 mg IV (antes da glicose em etilista/desnutrido).",
        "Coletar: eletrólitos (Na, Ca, Mg), função renal/hepática, hemograma, gasometria, níveis de antiepilépticos, β-hCG, toxicológico.",
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
          label: "Peso",
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
      ],
      next: "primeira_linha",
    },

    primeira_linha: {
      id: "primeira_linha",
      type: "action",
      title: "5–20 min · 1ª linha — BENZODIAZEPÍNICO",
      summary: "Dose ADEQUADA e única classe eficaz nesta fase. Subdosar é o erro mais comum.",
      actions: [
        "COM acesso IV — Diazepam {diazepamIv} mg IV (0,15–0,2 mg/kg, máx 10 mg) a 5 mg/min; pode repetir 1×.",
        "COM acesso IV (alternativa preferida) — Lorazepam 4 mg IV (0,1 mg/kg, máx 4 mg) a 2 mg/min; pode repetir 1× em 5 min.",
        "SEM acesso IV — Midazolam {midazolamIm} mg IM (0,2 mg/kg, máx 10 mg) — via IM é tão eficaz quanto IV (estudo RAMPART).",
        "Alternativas sem IV: midazolam intranasal ou bucal 10 mg; diazepam retal 0,2–0,5 mg/kg.",
        "Repetir o benzodiazepínico UMA vez se a crise persistir após 5 min.",
        "Vigiar depressão respiratória e hipotensão — ter material de via aérea pronto.",
      ],
      next: "reavaliar_1",
    },

    reavaliar_1: {
      id: "reavaliar_1",
      type: "decision",
      title: "Reavaliar após benzodiazepínico",
      question: "A crise cessou após a(s) dose(s) de benzodiazepínico?",
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
      type: "action",
      title: "20–40 min · 2ª linha — antiepiléptico IV",
      summary: "Escolher UM. Nenhum é comprovadamente superior (ESETT) — decidir por comorbidade e disponibilidade.",
      actions: [
        "Levetiracetam {levetiracetam} mg IV (60 mg/kg, máx 4.500 mg) em 10 min — melhor perfil de segurança, sem interações; 1ª opção na maioria.",
        "Valproato {valproato} mg IV (40 mg/kg, máx 3.000 mg) em 10 min — EVITAR em hepatopatia, gestante e suspeita de doença mitocondrial.",
        "Fenitoína {fenitoina} mg IV (20 mg/kg, MÁXIMO 2.000 mg) em velocidade ≤ 50 mg/min (≤ 25 mg/min se idoso/cardiopata) — monitor obrigatório: hipotensão e arritmia. Diluir SÓ em soro fisiológico.",
        "Fosfenitoína 20 mg PE/kg IV a 150 mg PE/min — preferível à fenitoína (menos flebite/hipotensão), se disponível.",
        "Lacosamida {lacosamida} mg IV (5 mg/kg, máx 400 mg) em 15 min — alternativa com pouca interação.",
        "Manter monitorização hemodinâmica contínua durante a infusão.",
      ],
      next: "reavaliar_2",
    },

    reavaliar_2: {
      id: "reavaliar_2",
      type: "decision",
      title: "Reavaliar após 2ª linha",
      question: "A crise cessou após o antiepiléptico de 2ª linha?",
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
      type: "action",
      title: "40–60 min · Refratário — anestésico + IOT",
      summary: "Intubar e iniciar infusão contínua com EEG contínuo. Alvo: supressão de crises (ou surto-supressão).",
      actions: [
        "INTUBAR (sequência rápida) — via aérea definitiva é obrigatória nesta fase. Ver módulo ISR.",
        "Midazolam: bolus {midazolamBolus} mg (0,2 mg/kg) → infusão 0,05–2 mg/kg/h. Titular até cessar crises.",
        "Propofol: bolus {propofolBolus} mg (2 mg/kg) → infusão até 4 mg/kg/h. Acima disso o risco de síndrome da infusão do propofol (PRIS) sobe muito: se for inevitável ultrapassar, ECG diário + CK e triglicerídeos, e considerar trocar de agente.",
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
      ],
      next: "uti",
    },

    pos_crise: {
      id: "pos_crise",
      type: "decision",
      title: "Crise cessou — investigar causa",
      question: "O paciente recuperou plenamente a consciência em 20–30 min?",
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
        "Metas na UTI: PAM ≥ 65 mmHg; ventilação protetora com volume corrente 6–8 mL/kg de peso IDEAL, platô < 30 cmH₂O, PEEP > 5 e PaO₂ acima de 8 kPa (≈ 60 mmHg); glicemia entre 8 e 12 mmol/L (≈ 145–215 mg/dL).",
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
