import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  LAST_AMIODARONA_E_A_EXCECAO,
  LAST_CHAMAR_AJUDA_E_CEC,
  LAST_DEPOIS_QUE_ESTABILIZA,
  LAST_EMULSAO_DOSE,
  LAST_NAO_E_SO_DURANTE_A_INJECAO,
  LAST_O_QUE_EVITAR,
  LAST_PONTEIRO_CURTO,
  LAST_PROPOFOL_NAO_SUBSTITUI,
  LAST_RCP_E_DIFERENTE,
  LAST_RECONHECER,
} from "./lib/last-emulsao-lipidica";


/**
 * ── VIGILÂNCIA DEPOIS DE O ANTÍDOTO FUNCIONAR ───────────────────────────────
 *
 * Fonte única, dona aqui. Antídoto de duração menor que a do agente tem uma
 * consequência obrigatória: o paciente que acordou NÃO está resolvido.
 *
 * Fonte: bula profissional do Narcan (cloridrato de naloxona, Cristália).
 */
export const NALOXONA_VIGILANCIA_APOS_REVERSAO =
  "⚠️ O PACIENTE QUE ACORDOU NÃO ESTÁ RESOLVIDO. A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado (renarcotização). Vigiar por horas, não por minutos: a bula prevê doses repetidas em intervalos de UMA A DUAS HORAS, conforme a quantidade, o tipo (curta ou longa duração) e o tempo desde a última administração do opioide. METADONA e FENTANIL TRANSDÉRMICO são os piores casos — duram muito mais que qualquer dose única de naloxona, e o adesivo continua liberando fármaco depois de retirado: REMOVER O ADESIVO faz parte do tratamento. Quando houver recorrência ou opioide de ação longa, passar para INFUSÃO CONTÍNUA: dose por hora = dois terços da dose total que reverteu a ventilação. Na bula, o uso pediátrico exige monitorização por pelo menos 24 h, pela possibilidade de recaída conforme a naloxona é metabolizada.";

/**
 * ── FLUMAZENIL: APRESENTAÇÃO E RESSEDAÇÃO ───────────────────────────────────
 *
 * A apresentação estava AUSENTE do app inteiro — pendência R-6 que só apareceu
 * ao abrir a bula para escrever a ressedação.
 *
 * Fonte: bula profissional do flumazenil (Lanexat/genérico, 0,1 mg/mL),
 * conferida em dois registros nacionais — União Química e Fresenius Kabi.
 */
export const FLUMAZENIL_APRESENTACAO =
  "Flumazenil — apresentação nacional: solução injetável 0,1 mg/mL, ampola de 5 mL (0,5 mg por ampola), caixa com 5. USO EXCLUSIVAMENTE INTRAVENOSO.";

export const FLUMAZENIL_RESSEDACAO =
  "⚠️ RESSEDAÇÃO — o risco é MAIOR que o da naloxona. A meia-vida terminal do flumazenil é de 40 a 80 minutos, contra praticamente todo benzodiazepínico; em insuficiência hepática ela sobe para 1,3 h (moderada) e 2,4 h (grave), e com o benzodiazepínico em INFUSÃO a diferença vira horas. A própria bula registra um estudo em intoxicados que despertaram por 72 ± 37 min e no qual 40% VOLTARAM AO COMA após 18 ± 7 min. Vigiar por horas: os efeitos do benzodiazepínico reaparecem em poucas horas conforme a meia-vida dele e a relação entre as doses de agonista e antagonista. Mesmo o paciente que acordou e está lúcido não deve dirigir nem operar máquinas nas primeiras 24 h.";

/**
 * ⚠️ DOIS TETOS, E O NÓ DOS ANTÍDOTOS USAVA O ERRADO.
 *
 * `tox_sedativo` já distinguia: teto cumulativo de 3 mg na SUPERDOSAGEM, e o
 * teto de 1 mg é o da REVERSÃO DE SEDAÇÃO CONSCIENTE. O nó `antidoto`, escrito
 * à mão, dizia "Flumazenil 0,2 mg IV (máx 1 mg)" — o teto da sedação
 * consciente aplicado à intoxicação, dentro do módulo de intoxicação.
 * Subdosa o antídoto exatamente no contexto que exige mais.
 *
 * ⚠️ É A MESMA FAMÍLIA DO DEFEITO DA NALOXONA — uma dose para dois cenários —,
 * e ele sobreviveu ao bloco que corrigiu a naloxona por um motivo que vale
 * registrar: A DOSE FICOU FORA DA FONTE ÚNICA. As constantes de naloxona foram
 * criadas, revisadas e consumidas; esta linha continuou literal num nó, e
 * nenhuma correção da fonte a alcançou.
 *
 * É o argumento a favor de que fonte única não é burocracia: o que está fora
 * dela não recebe as correções, e ninguém percebe, porque o texto ao lado está
 * certo.
 */
export const FLUMAZENIL_DOIS_TETOS =
  "⚠️ O TETO DO FLUMAZENIL DEPENDE DO CENÁRIO, e confundi-los subdosa o antídoto. NA SUPERDOSAGEM (intoxicação): 0,2 mg IV em 15 s; sem resposta, 0,3 mg e depois 0,5 mg a cada minuto, até TETO CUMULATIVO DE 3 mg. NA REVERSÃO DE SEDAÇÃO CONSCIENTE (o paciente que a própria equipe sedou): 0,2 mg, repetindo até TETO DE 1 mg — porque ali se quer acordar, não competir com uma superdose. Usar o teto de 1 mg na intoxicação é parar no terço do caminho; usar o de 3 mg em quem foi sedado pela equipe é reversão abrupta desnecessária. ⚠️ NOS DOIS CENÁRIOS, A RESSEDAÇÃO É REGRA: a duração do flumazenil é MENOR que a da maioria dos benzodiazepínicos, e o rebaixamento volta depois de o paciente ter acordado — chegar ao teto não encerra o caso, e a vigilância é por horas.";

export const FLUMAZENIL_NAO_USAR =
  "NÃO usar flumazenil se: uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico ou convulsão — risco de convulsão refratária. Também é contraindicado em quem recebe benzodiazepínico para controlar condição potencialmente fatal (hipertensão intracraniana, epilepsia de difícil controle): retirar o agonista devolve a condição que ele estava segurando.";

/**
 * ── O ANTÍDOTO NÃO CRUZA DE CLASSE ──────────────────────────────────────────
 *
 * Ausência total no app até aqui, e é a que produz o erro de raciocínio mais
 * caro da intoxicação mista.
 *
 * Fontes: bula do flumazenil (não reverte opioides, barbitúricos nem outros
 * depressores que não sejam benzodiazepínicos; na intoxicação mista, anular o
 * benzodiazepínico pode DESMASCARAR a toxicidade do outro fármaco — convulsão,
 * arritmia — especialmente com antidepressivos cíclicos) e van Lemmen/Dahan,
 * Anesthesiology 2023, para o simétrico da naloxona diante de coingestão de
 * depressores centrais.
 */
export const ANTIDOTO_NAO_CRUZA_DE_CLASSE =
  "⚠️ CADA ANTÍDOTO REVERTE UMA CLASSE SÓ. Naloxona age no receptor opioide e NÃO reverte benzodiazepínico, álcool, barbitúrico ou outro depressor central. Flumazenil age no receptor do benzodiazepínico e NÃO reverte opioide, barbitúrico nem álcool. CONSEQUÊNCIA PRÁTICA, que é onde o raciocínio erra: em intoxicação mista, \"não respondeu ao antídoto\" significa PROCURAR A OUTRA SUBSTÂNCIA — não escalar a dose do antídoto que já falhou. Uma reversão parcial é a assinatura da coingestão. E cuidado com a direção oposta: anular o benzodiazepínico numa mista pode DESMASCARAR a toxicidade do outro fármaco, com convulsão ou arritmia, sobretudo com antidepressivo cíclico.";

/**
 * ── NALOXONA: DOIS REGIMES, E O QUE DECIDE ENTRE ELES ───────────────────────
 *
 * Fonte única, dona aqui. A Sedoanalgesia e as telas de consulta CONSOMEM.
 *
 * ── O DEFEITO QUE ORIGINOU ───────────────────────────────────────────────────
 *
 * O app tinha UMA dose só — 0,4–2 mg — em todos os seis lugares que prescrevem
 * naloxona. E ela errava nas DUAS direções, conforme o contexto:
 *
 *   · no IATROGÊNICO (opioide dado pela própria equipe) é dose de superdose:
 *     reverte tudo de uma vez, devolve a dor, e a bula brasileira lista entre as
 *     reações pós-operatórias edema pulmonar, parada cardíaca, taquicardia,
 *     fibrilação ventricular, convulsão e hipertensão;
 *   · na overdose por opioide de ALTA AFINIDADE (fentanil e análogos) é dose
 *     baixa demais: 0,4 mg ou menos se associa a nenhum efeito ou a maior chance
 *     de renarcotização, e são necessários mais de 2 mg, repetição ou infusão.
 *
 * ── O QUE DECIDE NÃO É A GRAVIDADE, É A PROCEDÊNCIA DO OPIOIDE ──────────────
 *
 * A pergunta a responder ANTES de escolher o número: quem deu o opioide?
 * Dose conhecida e paciente monitorizado pedem titulação fina; opioide
 * desconhecido pede dose alta. Um paciente grave pode precisar de qualquer um
 * dos dois regimes — a gravidade não separa.
 *
 * ── FONTES ───────────────────────────────────────────────────────────────────
 *
 * Bula profissional do Narcan (cloridrato de naloxona, Cristália) — apresentação
 * 0,4 mg/mL em ampola de 1 mL, embalagens com 10 e 25 ampolas; posologia de
 * superdose e de depressão pós-operatória; reações adversas do pós-operatório.
 * Corroboração fisiopatológica: van Lemmen M, Florian J, Li Z, … Dahan A.
 * Anesthesiology 2023;139(3):342–353.
 */
export const NALOXONA_PROCEDENCIA_DECIDE =
  "ANTES DA DOSE, RESPONDA: quem deu o opioide? Não é a gravidade que separa os dois regimes — é a PROCEDÊNCIA. Opioide que a EQUIPE administrou, dose conhecida, paciente monitorizado → titulação fina, preservando analgesia. Opioide DESCONHECIDO, ou suspeita de fentanil e análogos → dose alta, repetição ou infusão. O mesmo paciente grave pode pertencer a qualquer um dos dois.";

export const NALOXONA_TITULADA_IATROGENICA =
  "REVERSÃO TITULADA (opioide dado pela equipe). PREPARO: 1 ampola de 0,4 mg/1 mL + 9 mL de SF = 10 mL a 40 mcg/mL — assim 1 mL = 40 mcg e a titulação fica executável. Injetar 0,1–0,2 mg (2,5–5 mL) por vez, a cada 2–3 min, até VENTILAÇÃO adequada — não até despertar completo. O alvo é respirar, mantendo analgesia: a depressão respiratória cede com ocupação de receptor menor que a da analgesia. Em quem se quer evitar abstinência (dependência conhecida), começar mais baixo e escalonar de 0,04 mg (1 mL) em diante. Reversão abrupta devolve a dor de uma vez e provoca surto catecolaminérgico — a bula lista taquicardia, hipertensão, náusea, vômito, convulsão, arritmia e EDEMA PULMONAR entre as reações do pós-operatório.";

export const NALOXONA_DOSE_ALTA_DESCONHECIDO =
  "DOSE ALTA (opioide desconhecido ou de alta afinidade). Dose inicial 0,4–2 mg IV, repetindo a cada 2–3 min. Fentanil, análogos e metadona exigem MAIS: doses de 0,4 mg ou menos podem não deslocar o opioide do receptor e ainda aumentar a chance de renarcotização — nesses casos são necessários mais de 2 mg, doses repetidas ou infusão contínua. Se não houver NENHUMA resposta após 10 mg no total, questionar o diagnóstico de intoxicação por opioide e procurar outra causa. Manter ventilação com bolsa-válvula-máscara enquanto a naloxona não age.";
/**
 * Intoxicações exógenas — abordagem inicial.
 * Estrutura: estabilização (ABCDE + antídotos do coma) → identificação da
 * síndrome tóxica (toxidrome) → descontaminação → antídoto específico →
 * eliminação (hemodiálise). Tabela de antídotos reaproveitada das antigas
 * Referências Rápidas.
 *
 * Fontes: Einstein/SBIBAE — "Intoxicação Exógena em Adultos" e "Intoxicação por
 * Metanol" (CPTW474.1, aprovado em 03/10/2025, escrito durante o surto de
 * metanol e alinhado à nota técnica da SES-SP de 2025), com as referências que
 * eles próprios citam: Manual de Toxicologia Clínica da SMS-SP (2017) e
 * Kraut & Mullins, Toxic alcohols, N Engl J Med 2018;378:270.
 *
 * Onde o pathway institucional divergiu da literatura, prevaleceu a literatura
 * (regra do autor do app). Dois pontos concretos:
 *
 * 1. O documento afirma que cocaína, tricíclicos e carbamazepina "agem no canal
 *    de cálcio do miócito". Não: bloqueiam o canal de SÓDIO rápido — e é por
 *    isso que o bicarbonato funciona (sobrecarga de sódio + alcalinização
 *    deslocam o bloqueio) e que se evita amiodarona, também bloqueadora de
 *    sódio. A conduta do documento está certa; o mecanismo, trocado. Aqui vai o
 *    mecanismo correto.
 * 2. O documento indica NAC por "ingesta de 10 g ou mais" de paracetamol. O
 *    critério da literatura é o nomograma de Rumack-Matthew (ou dose tóxica por
 *    peso), que o app já usa e foi mantido.
 *
 * Também ficaram de fora os acionamentos institucionais (telefones internos,
 * transferências entre unidades da rede, solicitação de fomepizol a um serviço
 * específico) — são operação de um hospital, não conduta transferível.
 */

export const poisoningDecisionTree: DecisionTreeDefinition = {
  id: "intoxicacoes_exogenas",
  version: "2024.1",
  label: "Intoxicações exógenas",
  entryNodeId: "estabilizacao",
  nodes: {
    estabilizacao: {
      id: "estabilizacao",
      type: "action",
      title: "Estabilização primeiro — ABCDE",
      summary: "Tratar o paciente, não o veneno. A maioria das mortes é por falha de via aérea e hipotensão.",
      actions: [
        "Via aérea: rebaixamento com perda de reflexos protetores → via aérea definitiva (risco alto de broncoaspiração).",
        "Respiração: O₂, oximetria e capnografia; atenção à hipoventilação (opioides, sedativos).",
        "Circulação: acesso venoso, monitor, ECG de 12 derivações (QRS e QT alargados indicam toxicidade específica).",
        "GLICEMIA CAPILAR imediata — hipoglicemia é causa reversível de coma.",
        "Antídotos do coma: glicose 50% se hipoglicemia; tiamina 100 mg IV (etilista/desnutrido); naloxona se depressão respiratória com miose — a dose depende da PROCEDÊNCIA do opioide.",
        NALOXONA_PROCEDENCIA_DECIDE,
        NALOXONA_VIGILANCIA_APOS_REVERSAO,
        ANTIDOTO_NAO_CRUZA_DE_CLASSE,
        "Temperatura: hipertermia grave (> 39–40 °C) exige resfriamento agressivo — é fator de mortalidade.",
        "Coletar: eletrólitos, função renal/hepática, gasometria com lactato, ânion gap, osmolaridade, paracetamol e salicilato, β-hCG.",
        "Contatar o Centro de Informação Toxicológica (CIATox/CEATOX) da sua região — orientação especializada em tempo real.",
        "ECG de 12 derivações em TODOS: QRS alargado indica bloqueio de canal de sódio (tricíclico, cocaína, carbamazepina); QT prolongado indica bloqueio do efluxo de potássio.",
        "RX de tórax/abdome pode revelar substância radiopaca: sais de cálcio, potássio e sódio, metais pesados, lítio, compostos iodados, salicilatos, cápsulas revestidas e pacotes de droga.",
        "⚠️ NÃO pedir triagem toxicológica ampla de rotina — não muda desfecho e é pouco custo-efetiva. Reservar para caso grave de etiologia incerta ou com implicação legal.",
        "Descontaminação cutânea: retirar toda a roupa, lavar com água corrente abundante e sabão, guardar a roupa em saco plástico; equipe com luvas e avental.",
        "Descontaminação ocular: lavagem com soro fisiológico, EVERTENDO a pálpebra para lavar por completo.",
        "Agitação e convulsão: tratar com benzodiazepínico, evitando fármacos que baixem o limiar convulsivo.",
        "Taquiarritmia ventricular na intoxicação: BICARBONATO de sódio 1–2 mEq/kg é a primeira escolha, e EVITAR amiodarona — cocaína, tricíclicos e carbamazepina bloqueiam o canal de SÓDIO rápido, e a amiodarona também o bloqueia (além de prolongar o QT).",
        "Antes de fechar o diagnóstico em intoxicação, descartar o que imita coma tóxico: trauma/TCE (procurar estigmas, anisocoria, déficit motor), hipoxemia, hipotermia, hipoglicemia, AVC, infecção do SNC e distúrbio metabólico.",
      ],
      next: "identificar",
    },

    identificar: {
      id: "identificar",
      type: "decision",
      title: "Identificar a síndrome tóxica (toxidrome)",
      question: "Qual conjunto de sinais predomina?",
      evidence: [
        "A toxidrome orienta o tratamento mesmo sem saber a substância exata.",
        "Avaliar: pupilas, pele (seca/úmida), ruídos hidroaéreos, temperatura, FC, PA e nível de consciência.",
        "Sempre dosar PARACETAMOL — intoxicação silenciosa e com antídoto tempo-dependente.",
      ],
      options: [
        { id: "opioide", label: "Opioide — miose, bradipneia, coma", next: "tox_opioide" },
        { id: "colinergico", label: "Colinérgico — sialorreia, broncorreia, miose, bradicardia", next: "tox_colinergico" },
        { id: "anticolinergico", label: "Anticolinérgico — midríase, pele seca, delirium, taquicardia", next: "tox_anticolinergico" },
        { id: "simpaticomimetico", label: "Simpaticomimético — agitação, midríase, sudorese, hipertermia", next: "tox_simpatico" },
        { id: "sedativo", label: "Sedativo/hipnótico — rebaixamento, sinais vitais preservados", next: "tox_sedativo" },
        { id: "serotoninergico", label: "Serotoninérgico — clonus, hiperreflexia, hipertermia, agitação", next: "tox_serotoninergico" },
        { id: "alucinogeno", label: "Alucinógeno — alucinações, distorção sensorial, nistagmo", next: "tox_alucinogeno" },
        { id: "alcool_toxico", label: "Álcool tóxico — metanol/etilenoglicol (visão, gap osmolar)", next: "tox_alcool_toxico" },
        { id: "anestesico_local", label: "Anestésico local — convulsão ou colapso após bloqueio/infiltração (LAST)", next: "tox_last" },
        // ── UM RÓTULO, DOIS ESTADOS EPISTÊMICOS OPOSTOS ────────────────────
        // "Indefinido / substância conhecida" somava "não faço ideia do que é"
        // com "sei exatamente qual substância". Nenhum dos dois recebia
        // conduta própria, e o médico sem toxidrome definida — que é a maior
        // parte dos casos reais — caía direto na descontaminação sem que
        // ninguém lhe dissesse o que fazer enquanto não sabe.
        //
        // É o R-48 refinado na direção INVERSA à do abdome agudo: lá SOBRAVA
        // conteúdo no nó do "não sei"; aqui o nó não existia.
        { id: "sei_a_substancia", label: "SEI qual substância — só não reconheci a toxidrome", next: "descontaminacao" },
        { id: "nao_sei", label: "NÃO SEI o que foi — quadro sem toxidrome definida", next: "agente_desconhecido" },
      ],
    },

    tox_opioide: {
      id: "tox_opioide",
      type: "action",
      title: "Toxidrome opioide",
      summary: "Tríade: rebaixamento + miose puntiforme + depressão respiratória.",
      actions: [
        NALOXONA_PROCEDENCIA_DECIDE,
        NALOXONA_DOSE_ALTA_DESCONHECIDO,
        NALOXONA_TITULADA_IATROGENICA,
        NALOXONA_VIGILANCIA_APOS_REVERSAO,
        ANTIDOTO_NAO_CRUZA_DE_CLASSE,
        "Titular para restaurar a VENTILAÇÃO, evitando abstinência aguda em usuário crônico (agitação, edema pulmonar).",
        "A meia-vida da naloxona é MENOR que a da maioria dos opioides — a depressão respiratória PODE VOLTAR depois de o paciente já ter acordado. Vigiar por horas, não por minutos.",
        "INFUSÃO CONTÍNUA quando houver recorrência ou opioide de ação longa: dose por hora = DOIS TERÇOS da dose total que reverteu a ventilação. Ex.: reverteu com 1,2 mg → 0,8 mg/h. Titular pela frequência respiratória, não pelo nível de consciência.",
        "Ventilar com bolsa-válvula-máscara enquanto a naloxona não age.",
        "Atenção a opioides de ação longa (metadona) e a fentanil/análogos (podem exigir doses altas).",
      ],
      next: "descontaminacao",
    },

    tox_colinergico: {
      id: "tox_colinergico",
      type: "action",
      title: "Toxidrome colinérgica (organofosforado/carbamato)",
      summary: "DUMBELS / broncorreia é a causa de morte — atropinizar até secar secreções.",
      actions: [
        "EPI para a equipe e DESCONTAMINAÇÃO EXTERNA (retirar roupas, lavar pele/cabelos) — risco de contaminação secundária.",
        "Atropina 2–4 mg IV, DOBRANDO a dose a cada 5–10 min até secar as secreções brônquicas.",
        "Endpoint da atropinização é a AUSCULTA PULMONAR LIMPA (secreções secas) — não a frequência cardíaca nem a pupila.",
        "Pralidoxima (2-PAM) 1–2 g IV em 15–30 min → infusão; indicada em organofosforado (reativa a colinesterase), idealmente nas primeiras 24–48 h.",
        "Convulsões: benzodiazepínico (diazepam/midazolam).",
        "Evitar succinilcolina na intubação (bloqueio prolongado pela inibição da colinesterase).",
      ],
      next: "descontaminacao",
    },

    tox_anticolinergico: {
      id: "tox_anticolinergico",
      type: "action",
      title: "Toxidrome anticolinérgica",
      summary: "'Louco, seco, quente, vermelho e cego' — delirium com pele seca.",
      actions: [
        "Suporte: benzodiazepínico para agitação; resfriamento ativo se hipertermia.",
        "ECG obrigatório: se QRS > 100 ms (antidepressivo tricíclico) → bicarbonato de sódio 1–2 mEq/kg IV em bolus, repetir até estreitar o QRS.",
        "Fisostigmina 1–2 mg IV lento (em 5 min) apenas em delirium anticolinérgico PURO e com ECG normal — ter atropina pronta (risco de bradicardia/convulsão).",
        "CONTRAINDICADA a fisostigmina se houver suspeita de tricíclico (QRS alargado) — risco de assistolia.",
        "Sondagem vesical (retenção urinária é regra) e monitorização contínua.",
      ],
      next: "descontaminacao",
    },

    tox_simpatico: {
      id: "tox_simpatico",
      type: "action",
      title: "Toxidrome simpaticomimética (cocaína, anfetaminas)",
      summary: "Diferencia-se da anticolinérgica pela pele SUDOREBA (úmida).",
      actions: [
        "BENZODIAZEPÍNICO é o tratamento de base — controla agitação, hipertensão, taquicardia e reduz a hipertermia.",
        "Hipertermia grave: resfriamento agressivo imediato (é a principal causa de morte).",
        "EVITAR betabloqueador isolado na cocaína (estimulação alfa sem oposição) — preferir benzodiazepínico e vasodilatador (nitrato/nitroprussiato).",
        "Dor torácica por cocaína: benzodiazepínico + nitrato + AAS; ECG seriado (risco de infarto e dissecção).",
        "Hidratação e vigilância de rabdomiólise (CPK, função renal) e convulsões.",
      ],
      next: "descontaminacao",
    },

    tox_sedativo: {
      id: "tox_sedativo",
      type: "action",
      title: "Toxidrome sedativo-hipnótica",
      summary: "Rebaixamento com sinais vitais relativamente preservados. Suporte é a regra.",
      actions: [
        "Suporte ventilatório — a maioria evolui bem apenas com proteção de via aérea e observação.",
        FLUMAZENIL_APRESENTACAO,
        "Flumazenil 0,2 mg IV em 15 s; se não responder, 0,3 mg e depois 0,5 mg a cada minuto. Teto cumulativo de 3 mg na superdosagem (o teto de 1 mg é o da reversão de sedação consciente). Uso EXCEPCIONAL.",
        FLUMAZENIL_RESSEDACAO,
        FLUMAZENIL_NAO_USAR,
        ANTIDOTO_NAO_CRUZA_DE_CLASSE,
        "Álcool: descartar hipoglicemia, trauma craniano associado e abstinência; repor tiamina.",
        "Reavaliar se o rebaixamento for desproporcional ou não melhorar — buscar coingestão e causas estruturais.",
      ],
      next: "descontaminacao",
    },

    tox_serotoninergico: {
      id: "tox_serotoninergico",
      type: "action",
      title: "Toxíndrome serotoninérgica",
      summary: "O que a separa da simpaticomimética é o CLONUS — sobretudo o de tornozelo e o ocular.",
      actions: [
        "Reconhecer: agitação e confusão, hipertermia, taquicardia, taquipneia, hipertensão, midríase, pele úmida, hiperreflexia, clonus (inclusive ocular), tremor e diarreia.",
        "Etiologias: ISRS e duais, inibidores da MAO, tricíclicos, dextrometorfano, meperidina, tramadol, linezolida, triptanos e associações entre eles.",
        "SUSPENDER imediatamente todos os agentes serotoninérgicos — é a medida que mais muda o curso.",
        "BENZODIAZEPÍNICO para agitação, rigidez e controle autonômico; hidratação e resfriamento ativo na hipertermia.",
        "Hipertermia grave com rigidez: sedação profunda, intubação e BLOQUEIO NEUROMUSCULAR não despolarizante — a rigidez muscular é o motor da hipertermia. Evitar succinilcolina (rabdomiólise/hipercalemia).",
        "NÃO usar antipirético — a hipertermia é de origem muscular, não hipotalâmica.",
        "Ciproeptadina 12 mg VO/SNG, depois 2 mg a cada 2 h enquanto persistirem os sintomas, com manutenção de 8 mg 6/6 h — antagonista serotoninérgico, quando o suporte não basta.",
        "Diferencial: síndrome neuroléptica maligna (instalação em dias, rigidez em cano de chumbo, SEM clonus) e toxíndrome anticolinérgica (pele SECA, sem clonus, ruídos hidroaéreos diminuídos).",
      ],
      next: "descontaminacao",
    },

    tox_alucinogeno: {
      id: "tox_alucinogeno",
      type: "action",
      title: "Toxíndrome alucinógena",
      summary: "Alucinações e distorção sensorial com sinais vitais que podem estar normais.",
      actions: [
        "Reconhecer: alucinações, distorções sensoriais, despersonalização, sinestesia e agitação; pupilas dilatadas ou normais; nistagmo é achado típico (sobretudo com quetamina e fenciclidina).",
        "Etiologias: LSD, MDMA, quetamina, mescalina, psilocibina (cogumelos).",
        "Suporte é a regra: ambiente calmo, com pouco estímulo, e reorientação verbal.",
        "BENZODIAZEPÍNICO para agitação — evitar antipsicótico como primeira escolha (baixa o limiar convulsivo e prejudica a termorregulação).",
        "MDMA: vigiar hipertermia, rabdomiólise e HIPONATREMIA por excesso de água livre — dosar sódio antes de hidratar em volume.",
        "Sinais vitais podem estar normais; a deterioração costuma vir de hipertermia, trauma durante a agitação ou coingestão.",
      ],
      next: "descontaminacao",
    },

    tox_alcool_toxico: {
      id: "tox_alcool_toxico",
      type: "action",
      title: "Álcool tóxico — metanol / etilenoglicol",
      summary: "Acidose com ânion gap alto + gap osmolar alto. NÃO fazer carvão nem lavagem.",
      actions: [
        "Suspeitar após ingestão de bebida de procedência duvidosa, álcool combustível, solvente ou fluido de limpador de para-brisa — e nas tentativas de suicídio.",
        "Janela dos sintomas no metanol — até 6 h: sonolência, ataxia, tontura, dor abdominal, náuseas, vômitos, cefaleia, confusão, taquicardia e hipotensão. Entre 6 e 24 h: visão turva, fotofobia, escotomas, midríase, perda da visão de cores, convulsões, coma e acidose grave.",
        "O metanol é convertido em ÁCIDO FÓRMICO — a gravidade costuma aparecer a partir de 12 h da ingesta, não no primeiro atendimento.",
        "Calcular sempre os três: ânion gap = Na⁺ − (HCO₃⁻ + Cl⁻); osmolalidade estimada = (2 × Na⁺) + (ureia/6) + (glicose/18); gap osmolar = osmolalidade medida − estimada.",
        "Critério diagnóstico com exposição e quadro compatível: 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10. Achado de neuroimagem (hemorragia de gânglios da base ou necrose de putâmen) reforça a suspeita.",
        "⚠️ NÃO fazer lavagem gástrica nem carvão ativado — a absorção é rápida e o álcool não é adsorvido pelo carvão.",
        "Garantir euvolemia com cristaloide; corrigir os demais distúrbios eletrolíticos.",
        "Acidose com pH < 7,35: bicarbonato de sódio 8,4% 1–2 mEq/kg IV em bólus, com a meta de manter o pH acima de 7,35.",
        "NÃO aguardar a dosagem do tóxico para tratar — o resultado demora e a janela terapêutica não espera.",
        "Sintoma visual: avaliação oftalmológica. Rebaixamento de consciência: TC ou RM de crânio.",
        "Notificação COMPULSÓRIA no SINAN (CID T51.1 para metanol); em tentativa de suicídio, notificar também violência.",
      ],
      next: "alcool_toxico_antidoto",
    },

    alcool_toxico_antidoto: {
      id: "alcool_toxico_antidoto",
      type: "action",
      title: "Álcool tóxico — antídoto e diálise",
      summary: "Bloquear a álcool-desidrogenase antes que o tóxico vire ácido.",
      actions: [
        "Indicação do antídoto: paciente sintomático com exposição ou alta suspeição e pelo menos 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10.",
        "FOMEPIZOL (primeira escolha onde disponível): ataque 15 mg/kg IV em 30 min → 10 mg/kg a cada 12 h por 4 doses → depois 15 mg/kg a cada 12 h enquanto persistir a intoxicação. Durante hemodiálise, redosar ao fim da sessão.",
        "ETANOL (antídoto disponível no Brasil): preparar solução a 10% — 100 mL de etanol absoluto + 900 mL de soro glicosado 5%.",
        "Etanol IV — ataque 10 mL/kg da solução a 10% em 1 h; manutenção 1 mL/kg/h. Etilista crônico: 1,5 mL/kg/h. Em hemodiálise: 2,5–3,5 mL/kg/h.",
        "Alvo do etanol: etanolemia entre 100 e 150 mg/dL, com dosagem a cada 6–8 h.",
        "Sem etanol absoluto: destilado de boa procedência (40–50%) por sonda, em solução a 20% — ataque 5 mL/kg em 1 h, manutenção 0,5 mL/kg/h.",
        "ÁCIDO FOLÍNICO (leucovorina) 50 mg IV em 30 min a cada 6 h no metanol — acelera a degradação do ácido fórmico. Sem folínico, usar ácido fólico.",
        "HEMODIÁLISE se: pH < 7,25, acidose persistente apesar do antídoto, ânion gap > 24, alteração visual refratária, distúrbio eletrolítico refratário, instabilidade hemodinâmica ou urgência dialítica. Preferir hemodiálise intermitente.",
        "Suspender o antídoto quando houver melhora clínica, resolução da acidose e ânion gap < 16 — mantendo gasometria a cada 4 h e exames a cada 8 h nas 24 h seguintes.",
      ],
      next: "eliminacao",
    },

    // ── LAST — a D-29, fechada ────────────────────────────────────────────
    //
    // Nó PRÓPRIO, e não linha na tabela de antídotos, porque a conduta tem
    // ordem, tem o que evitar e tem uma regra do módulo que se INVERTE aqui
    // (amiodarona). Conteúdo em lib/last-emulsao-lipidica.ts, com as fontes.
    tox_last: {
      id: "tox_last",
      type: "action",
      title: "LAST — toxicidade por anestésico local",
      summary: "Antídoto ÚNICO, time-critical e sem substituto: emulsão lipídica 20%. A ressuscitação é diferente do ACLS padrão.",
      actions: [
        LAST_RECONHECER,
        LAST_NAO_E_SO_DURANTE_A_INJECAO,
        LAST_CHAMAR_AJUDA_E_CEC,
        LAST_EMULSAO_DOSE,
        LAST_PROPOFOL_NAO_SUBSTITUI,
        LAST_RCP_E_DIFERENTE,
        LAST_O_QUE_EVITAR,
        LAST_AMIODARONA_E_A_EXCECAO,
        LAST_DEPOIS_QUE_ESTABILIZA,
      ],
      next: "uti",
    },

    // ── O AGENTE DESCONHECIDO — o nó que faltava ──────────────────────────
    //
    // O que se faz sem saber o agente é MUITO, e nada disso dependia de saber:
    // o suporte é o mesmo, a coleta é a mesma, e o que muda o desfecho na
    // primeira hora é a estabilização, não o nome do veneno.
    agente_desconhecido: {
      id: "agente_desconhecido",
      type: "action",
      title: "Não sei o agente — e não precisa saber para começar",
      summary:
        "A toxidrome orienta, mas não é pré-requisito. O que muda desfecho na primeira hora é o suporte, e ele é o mesmo em quase todas as intoxicações.",
      actions: [
        "FAÇA AGORA, e vale para qualquer agente: via aérea conforme o nível de consciência, O₂, monitorização contínua, dois acessos, GLICEMIA CAPILAR, ECG de 12 derivações e temperatura.",
        "O ECG É O EXAME QUE MAIS APONTA AGENTE SEM QUE VOCÊ SAIBA QUAL É: QRS alargado indica bloqueio de canal de sódio (tricíclico, cocaína, carbamazepina) e pede bicarbonato; QT prolongado indica bloqueio do efluxo de potássio e pede correção de eletrólitos e cuidado com fármacos que alarguem mais.",
        "DOSAR PARACETAMOL E SALICILATO EM TODOS — as duas intoxicações são silenciosas, comuns e têm conduta tempo-dependente. É a exceção à regra de não pedir triagem ampla.",
        "REEXAMINE PROCURANDO A TOXIDROME QUE AINDA NÃO APARECEU: pupilas, pele (seca ou úmida), ruídos hidroaéreos, temperatura, reflexos e clonus. Elas se declaram com o tempo, e o exame de agora não é o de daqui a uma hora.",
        "LIGUE PARA O CIATox/CEATOX — é o recurso mais subutilizado da toxicologia de emergência, e a orientação é em tempo real, com o caso na mão. Não é preciso ter o diagnóstico para ligar; a dúvida já é motivo.",
        "PROCURE A HISTÓRIA ONDE ELA ESTÁ: acompanhante, socorristas, receitas e caixas trazidas, farmácia da casa, prontuário eletrônico, e o que havia ao redor do paciente. Em tentativa de autoextermínio, o que foi tomado costuma estar no domicílio.",
        "⚠️ NÃO FECHE EM INTOXICAÇÃO SEM DESCARTAR O QUE A IMITA: trauma craniano, hipoglicemia, hipóxia, hipotermia, AVC, infecção do SNC e distúrbio metabólico. Rebaixamento com história ambígua não é diagnóstico de intoxicação.",
        "⚠️ E SE HOUVE ANESTÉSICO LOCAL EM QUALQUER MOMENTO — bloqueio, peridural, infiltração, tópico em mucosa —, pense em LAST antes de seguir procurando.",
        LAST_PONTEIRO_CURTO,
      ],
      next: "descontaminacao",
    },

    descontaminacao: {
      id: "descontaminacao",
      type: "decision",
      title: "Descontaminação gastrointestinal",
      question: "A ingestão foi há menos de 1–2 horas, com via aérea protegida e substância adsorvível?",
      evidence: [
        "Carvão ativado é útil sobretudo na primeira hora; benefício cai muito depois.",
        "NÃO adsorve: álcoois, lítio, ferro, hidrocarbonetos, ácidos/álcalis.",
        "CONTRAINDICADO se via aérea desprotegida, íleo/obstrução, ou cáustico/hidrocarboneto (risco de aspiração e de piorar lesão).",
        "Lavagem gástrica: praticamente abandonada — só considerar em ingestão maciça e muito recente, com via aérea protegida.",
        "Xarope de ipeca está PROSCRITO.",
      ],
      options: [
        { id: "sim", label: "Sim — indicar carvão ativado", next: "carvao" },
        { id: "nao", label: "Não / contraindicado", next: "antidoto" },
      ],
    },

    carvao: {
      id: "carvao",
      type: "action",
      title: "Carvão ativado",
      summary: "Melhor rendimento na primeira hora.",
      actions: [
        "Carvão ativado 1 g/kg (adulto: 50 g) por via oral ou sonda gástrica.",
        "Proteger a via aérea ANTES se houver rebaixamento — aspiração de carvão é grave.",
        "NÃO passar sonda apenas para administrar carvão, e NÃO intubar apenas para passar a sonda — via oral, ou só por sonda em quem já tem via aérea definitiva.",
        "Doses múltiplas (0,5 g/kg a cada 4–6 h) em: carbamazepina, dapsona, fenobarbital, quinina e teofilina — a lista do position statement AACT/EAPCCT. Alguns protocolos brasileiros acrescentam fenitoína e salicilato.",
        "Irrigação intestinal total (polietilenoglicol): considerar em ferro, lítio, liberação prolongada e 'body packers'.",
      ],
      next: "antidoto",
    },

    antidoto: {
      id: "antidoto",
      type: "action",
      title: "Antídotos específicos",
      summary: "Consultar dose e via conforme o tóxico identificado.",
      actions: [
        "Paracetamol → N-acetilcisteína: 150 mg/kg em 60 min → 50 mg/kg em 4 h → 100 mg/kg em 16 h. Iniciar precocemente (nomograma de Rumack-Matthew).",
        "Opioide → Naloxona: a dose depende da PROCEDÊNCIA do opioide, não da gravidade.",
        NALOXONA_PROCEDENCIA_DECIDE,
        NALOXONA_VIGILANCIA_APOS_REVERSAO,
        ANTIDOTO_NAO_CRUZA_DE_CLASSE,
        "Benzodiazepínico → Flumazenil — o teto depende do cenário, e o uso é EXCEPCIONAL.",
        FLUMAZENIL_DOIS_TETOS,
        FLUMAZENIL_RESSEDACAO,
        FLUMAZENIL_NAO_USAR,
        // ANTIDOTO_NAO_CRUZA_DE_CLASSE aparecia DUAS VEZES neste mesmo nó — o
        // mesmo parágrafo longo, repetido na mesma tela. Fica uma.
        "Organofosforado → Atropina (dobrando até secar secreções) + Pralidoxima 1–2 g IV.",
        "Metanol/etilenoglicol → Fomepizol 15 mg/kg → 10 mg/kg 12/12 h; ou etanol. Hemodiálise precoce.",
        "Betabloqueador → Glucagon 1–5 mg IV → 2–5 mg/h. Bloqueador de canal de cálcio → cálcio + insulina em altas doses (HIET: 1 U/kg bolus → 0,5 U/kg/h com glicose).",
        "Antidepressivo tricíclico (QRS > 100 ms) → Bicarbonato de sódio 1–2 mEq/kg IV em bolus.",
        "Anestésico local (LAST) → EMULSÃO LIPÍDICA 20% — o antídoto é único e não tem substituto; ver o passo próprio de LAST.",
        LAST_PONTEIRO_CURTO,
        "Cianeto → Hidroxocobalamina 5 g IV em 15 min. Metemoglobinemia → Azul de metileno 1–2 mg/kg (contraindicado em deficiência de G6PD).",
        "Sulfonilureia com hipoglicemia recorrente → Octreotide 50–100 mcg SC/IV a cada 6 h, ALÉM da glicose — a glicose isolada realimenta a secreção de insulina e a hipoglicemia recidiva.",
        "Digoxina → anticorpo antidigoxina. Isoniazida → Piridoxina (dose = dose ingerida, ou 5 g).",
        "Varfarina → Vitamina K 10 mg + CCP 4 fatores. Dabigatrana → Idarucizumabe 5 g. Heparina → Protamina 1 mg/100 UI.",
      ],
      next: "eliminacao",
    },

    eliminacao: {
      id: "eliminacao",
      type: "decision",
      title: "Necessita métodos de eliminação?",
      question: "Há intoxicação grave por substância dialisável ou acidose/insuficiência renal refratária?",
      evidence: [
        "Dialisáveis (baixo peso molecular, baixa ligação proteica, pequeno volume de distribuição): metanol, etilenoglicol, lítio, salicilato, metformina (acidose láctica), teofilina, valproato em dose maciça.",
        "Alcalinização urinária com bicarbonato: salicilato e fenobarbital.",
      ],
      options: [
        { id: "sim", label: "Sim — indicar hemodiálise/alcalinização", next: "uti" },
        { id: "nao", label: "Não", next: "observacao" },
        // ── A SAÍDA QUE NÃO EXISTIA: NÃO PRECISA DE NADA ──────────────────
        // As cinco saídas do módulo terminavam todas em FAZER alguma coisa —
        // carvão, antídoto, diálise, UTI, observação. A exposição que não
        // precisa de tratamento é uma fatia enorme da toxicologia de
        // emergência, e não tinha caminho: quem chegava aqui com uma ingestão
        // subtóxica era empurrado para a mesma via do intoxicado grave.
        { id: "sem_indicacao", label: "Exposição sem indicação de tratamento — o que ainda assim se faz", next: "sem_indicacao" },
      ],
    },

    sem_indicacao: {
      id: "sem_indicacao",
      type: "action",
      title: "Não tratar também é conduta",
      summary:
        "Boa parte das exposições atendidas não precisa de descontaminação, antídoto nem eliminação. O que elas precisam é de tempo de observação certo e de quem confirme que é este o caso.",
      actions: [
        "QUANDO NÃO HÁ INDICAÇÃO DE TRATAMENTO: dose abaixo da tóxica para o peso, substância de baixa toxicidade, exposição antiga já fora da janela de risco, e paciente ASSINTOMÁTICO com sinais vitais, ECG e glicemia normais.",
        "⚠️ QUEM CONFIRMA ISSO NÃO É VOCÊ SOZINHO: ligue para o CIATox/CEATOX. Dose tóxica por peso e tempo de risco variam por produto, e é exatamente o que eles respondem em minutos. \"Parece pouco\" não é critério.",
        "O QUE SE FAZ MESMO SEM TRATAR: observar pelo TEMPO DE RISCO DA SUBSTÂNCIA — e ele é definido pela farmacocinética, não pelo quanto o paciente parece bem. Formulação de LIBERAÇÃO PROLONGADA, fármaco de ação longa e coingestão que retarda o esvaziamento gástrico esticam esse tempo.",
        "⚠️ AS EXCEÇÕES QUE PARECEM BENIGNAS E NÃO SÃO: paracetamol e salicilato (silenciosos, com dano já em curso enquanto o paciente conversa), álcoois tóxicos (o intervalo lúcido é característico), ferro, e formulações de liberação prolongada. Nesses, \"assintomático agora\" não autoriza alta.",
        "AVALIAÇÃO PSIQUIÁTRICA antes da alta em toda tentativa de autoextermínio — a ausência de toxicidade clínica não é ausência de risco, e é o motivo mais comum de o paciente voltar.",
        "ALTA COM ORIENTAÇÃO ESCRITA, acompanhante e retorno imediato se rebaixamento, vômitos, dor abdominal, dor torácica ou convulsão. E notificação conforme a legislação local.",
        "⚠️ NÃO PEDIR TRIAGEM TOXICOLÓGICA AMPLA PARA \"TER CERTEZA\" — ela não muda o desfecho e não é o que autoriza a alta. O que autoriza é dose, tempo e paciente assintomático.",
      ],
      next: "observacao",
    },

    uti: {
      id: "uti",
      type: "transition",
      title: "UTI — intoxicação grave",
      summary: "Instabilidade, necessidade de antídoto contínuo, diálise ou ventilação.",
      disposition: "icu",
      exitCriteria: [
        "Hemodiálise precoce quando indicada; alcalinização urinária no salicilato (alvo pH urinário 7,5–8).",
        "Monitorização contínua de ECG (QRS/QT), temperatura, função renal e CPK (rabdomiólise).",
        "Manter contato com o CIATox; reavaliar coingestões e repetir dosagens quando aplicável.",
        "Avaliação psiquiátrica obrigatória em tentativa de autoextermínio, antes da alta.",
        "Notificação compulsória conforme a legislação local.",
      ],
      targets: [
        { moduleId: "isr-rapida", label: "ISR — via aérea", reason: "Rebaixamento com risco de aspiração" },
        { moduleId: "drogas-vasoativas", label: "Drogas vasoativas", reason: "Choque refratário por cardiotóxico" },
        { moduleId: "correcoes-eletroliticas", label: "Correções eletrolíticas", reason: "Distúrbios associados à intoxicação" },
      ],
    },

    observacao: {
      id: "observacao",
      type: "transition",
      title: "Observação",
      summary: "Manter vigilância pelo tempo de risco da substância.",
      disposition: "observation",
      exitCriteria: [
        "Observar por período compatível com a farmacocinética (liberação prolongada e ação longa exigem mais tempo).",
        "Repetir ECG e exames conforme a substância; reavaliar paracetamol em 4 h da ingestão.",
        "AVALIAÇÃO PSIQUIÁTRICA antes da alta em toda tentativa de autoextermínio.",
        "Orientar acompanhante e retorno imediato se rebaixamento, vômitos, dor torácica ou convulsão.",
      ],
      targets: [],
    },
  },
};
