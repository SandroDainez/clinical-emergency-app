import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Intoxicações exógenas — abordagem inicial.
 * Estrutura: estabilização (ABCDE + antídotos do coma) → identificação da
 * síndrome tóxica (toxidrome) → descontaminação → antídoto específico →
 * eliminação (hemodiálise). Tabela de antídotos reaproveitada das antigas
 * Referências Rápidas.
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
        "Antídotos do coma: glicose 50% se hipoglicemia; tiamina 100 mg IV (etilista/desnutrido); naloxona 0,4–2 mg se depressão respiratória com miose.",
        "Temperatura: hipertermia grave (> 39–40 °C) exige resfriamento agressivo — é fator de mortalidade.",
        "Coletar: eletrólitos, função renal/hepática, gasometria com lactato, ânion gap, osmolaridade, paracetamol e salicilato, β-hCG.",
        "Contatar o Centro de Informação Toxicológica (CIATox) — orientação especializada em tempo real.",
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
        { id: "indefinido", label: "Indefinido / substância conhecida", next: "descontaminacao" },
      ],
    },

    tox_opioide: {
      id: "tox_opioide",
      type: "action",
      title: "Toxidrome opioide",
      summary: "Tríade: rebaixamento + miose puntiforme + depressão respiratória.",
      actions: [
        "Naloxona 0,4–2 mg IV/IM/intranasal — repetir a cada 2–3 min até resposta ventilatória (não até despertar completo).",
        "Titular para restaurar a VENTILAÇÃO, evitando abstinência aguda em usuário crônico (agitação, edema pulmonar).",
        "A meia-vida da naloxona é MENOR que a da maioria dos opioides — vigiar recorrência; considerar infusão contínua.",
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
        "Flumazenil 0,2 mg IV (repetir 0,1 mg/min, máx 1 mg) — uso EXCEPCIONAL.",
        "NÃO usar flumazenil se: uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico ou convulsão — risco de convulsão refratária.",
        "Álcool: descartar hipoglicemia, trauma craniano associado e abstinência; repor tiamina.",
        "Reavaliar se o rebaixamento for desproporcional ou não melhorar — buscar coingestão e causas estruturais.",
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
        "Doses múltiplas (0,5 g/kg a cada 4–6 h) em: carbamazepina, dapsona, fenobarbital, quinina e teofilina.",
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
        "Opioide → Naloxona 0,4–2 mg IV/IM/IN, repetir a cada 2–3 min.",
        "Benzodiazepínico → Flumazenil 0,2 mg IV (máx 1 mg) — com as ressalvas acima.",
        "Organofosforado → Atropina (dobrando até secar secreções) + Pralidoxima 1–2 g IV.",
        "Metanol/etilenoglicol → Fomepizol 15 mg/kg → 10 mg/kg 12/12 h; ou etanol. Hemodiálise precoce.",
        "Betabloqueador → Glucagon 1–5 mg IV → 2–5 mg/h. Bloqueador de canal de cálcio → cálcio + insulina em altas doses (HIET: 1 U/kg bolus → 0,5 U/kg/h com glicose).",
        "Antidepressivo tricíclico (QRS > 100 ms) → Bicarbonato de sódio 1–2 mEq/kg IV em bolus.",
        "Cianeto → Hidroxocobalamina 5 g IV em 15 min. Metemoglobinemia → Azul de metileno 1–2 mg/kg (contraindicado em deficiência de G6PD).",
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
