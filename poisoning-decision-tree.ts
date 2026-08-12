import type { DecisionTreeDefinition } from "./core/decision-tree/types";


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
        { id: "indefinido", label: "Indefinido / substância conhecida", next: "descontaminacao" },
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
        "Flumazenil 0,2 mg IV em 15 s; se não responder, 0,3 mg e depois 0,5 mg a cada minuto. Teto cumulativo de 3 mg na superdosagem (o teto de 1 mg é o da reversão de sedação consciente). Uso EXCEPCIONAL.",
        "NÃO usar flumazenil se: uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico ou convulsão — risco de convulsão refratária.",
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
        "Benzodiazepínico → Flumazenil 0,2 mg IV (máx 1 mg) — com as ressalvas acima.",
        "Organofosforado → Atropina (dobrando até secar secreções) + Pralidoxima 1–2 g IV.",
        "Metanol/etilenoglicol → Fomepizol 15 mg/kg → 10 mg/kg 12/12 h; ou etanol. Hemodiálise precoce.",
        "Betabloqueador → Glucagon 1–5 mg IV → 2–5 mg/h. Bloqueador de canal de cálcio → cálcio + insulina em altas doses (HIET: 1 U/kg bolus → 0,5 U/kg/h com glicose).",
        "Antidepressivo tricíclico (QRS > 100 ms) → Bicarbonato de sódio 1–2 mEq/kg IV em bolus.",
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
      ],
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
