import { DecisionTreeEngine, validateDecisionTree } from "./core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "./core/decision-tree/types";
import { INTRO_GUIADA, OPCAO_GUIADA } from "./lib/instabilidade-guiada";
import { ANAFILAXIA_BLOQUEADOR, ANAFILAXIA_BLOQUEADOR_ROCURONIO, ANAFILAXIA_GATILHO_BLOQUEADOR, ANAFILAXIA_BLOQUEADOR_LASTRO } from "./lib/doses-isr";
import { BRONCOESPASMO_MAGNESIO_REFRATARIO, BRONCOESPASMO_NAO_SUBSTITUI_ADRENALINA, BRONCOESPASMO_PRIMEIRA_LINHA } from "./lib/broncoespasmo-anafilaxia";
import { ADRENALINA_EV_ANAFILAXIA_DOSE } from "./lib/adrenalina-ev-anafilaxia";
import { FORA_DE_ESCOPO_PEDIATRICO } from "./lib/escopo-pediatrico";

// Árvore de decisão — Anafilaxia e Choque Anafilático
// Baseado em: WAO 2020 · AAAAI/ACAAI 2015 · EAACI 2014 · SBAI · UpToDate 2024
// Classificação: Ring e Messmer modificada (Grau I–IV)

export const anaphylaxisDecisionTree: DecisionTreeDefinition = {
  id: "anaphylaxis_v3",
  version: "2.0.0",
  label: "Anafilaxia e Choque Anafilático",
  entryNodeId: "diagnostic_entry",
  nodes: {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ENTRADA E DIAGNÓSTICO
    // ─────────────────────────────────────────────────────────────────────────

    diagnostic_entry: {
      id: "diagnostic_entry",
      type: "decision",
      title: "Suspeita de anafilaxia?",
      summary: "O diagnóstico é CLÍNICO — não aguardar exames. Preencha UM dos três critérios WAO 2020.",
      question: "O quadro preenche algum critério diagnóstico de anafilaxia?",
      evidence: [
        "Critério 1 — Início agudo com acometimento de PELE/MUCOSAS (urticária, angioedema, prurido, flushing) + pelo menos UM de: comprometimento respiratório, hipotensão, colapso ou sintomas GI graves.",
        "Critério 2 — Dois ou mais sistemas acometidos após exposição a alérgeno provável: pele/mucosas, respiratório, hipotensão/síncope, sintomas GI persistentes.",
        "Critério 3 — Hipotensão isolada após alérgeno conhecido: adultos PAS < 90 mmHg ou queda ≥ 30% do basal.",
        "Diagnóstico diferencial: AEH (angioedema sem urticária, refratário à adrenalina), vasovagal (bradicardia, sem urticária), urticária aguda isolada (sem comprometimento sistêmico), TEP/IAM (sem cutâneo), hipoglicemia (glicemia confirma).",
      ],
      options: [
        { id: "criteria_met", label: "Sim — critério(s) preenchido(s) / alta suspeita", next: "severity_grade" },
        { id: "criteria_not_met", label: "Não — reação alérgica localizada sem critérios sistêmicos", next: "not_anaphylaxis_exit" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CLASSIFICAÇÃO DE GRAVIDADE (Ring e Messmer / WAO)
    // ─────────────────────────────────────────────────────────────────────────

    severity_grade: {
      id: "severity_grade",
      type: "decision",
      title: "Classificar gravidade (Grau I–IV)",
      summary: "A gravidade determina a via de tratamento. Adrenalina IM é obrigatória nos Graus II, III e IV.",
      question: "Qual é a apresentação inicial do paciente?",
      evidence: [
        "Grau I — APENAS cutâneo-mucoso: urticária, angioedema localizado, eritema, prurido. SEM hipotensão, SEM broncoespasmo, SEM síncope.",
        "Grau II — Moderado: cutâneo + disfunção orgânica leve: taquicardia, hipotensão LEVE, broncoespasmo leve, náusea/vômito.",
        "Grau III — Grave: broncoespasmo grave, laringoespasmo/estridor, hipotensão acentuada, confusão, perda de consciência.",
        "Grau IV — Colapso/PCR: parada cardiorrespiratória.",
        "IMPORTANTE: progredir de Grau I para II/III/IV é possível a qualquer momento — reavaliar continuamente.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "grau_dados" },
        { id: "grade1", label: "Grau I — apenas cutâneo-mucoso, sem comprometimento sistêmico", next: "grade1_treatment" },
        { id: "grade2", label: "Grau II — moderado (taquicardia, hipotensão leve, broncoespasmo leve)", next: "immediate_im_epinephrine" },
        { id: "grade3", label: "Grau III — grave (hipotensão acentuada, estridor, confusão, perda de consciência)", next: "immediate_im_epinephrine" },
        { id: "grade4", label: "Grau IV — colapso / parada cardiorrespiratória", next: "grade4_pcr" },
      ],
    },

    // ── Caminho guiado ────────────────────────────────────────────────────────
    //
    // Esta é a decisão de maior consequência do módulo: o grau define se a
    // adrenalina IM entra ou não. E é onde mais se erra na prática — o atraso
    // da adrenalina é o fator mais associado a morte por anafilaxia, e o motivo
    // habitual do atraso é justamente hesitar na classificação.
    //
    // Aqui a decomposição é POR SISTEMA, não a hemodinâmica comum: o que define
    // o grau é QUANTOS sistemas além da pele estão envolvidos. Por isso este nó
    // não usa camposDeInstabilidade() — seria a decomposição errada, e reusar
    // por reusar produziria uma classificação que não é a da diretriz.
    grau_dados: {
      id: "grau_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: [
        {
          id: "pele",
          label: "PELE: placas vermelhas que coçam, inchaço de lábios, pálpebras ou língua, vermelhidão pelo corpo?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "viaAerea",
          label: "VOZ E GARGANTA: voz rouca ou abafada, sensação de garganta fechando, dificuldade para engolir, ruído agudo ao inspirar?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "respiracao",
          label: "RESPIRAÇÃO: falta de ar, chiado no peito, tosse persistente, ou saturação caindo?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "circulacao",
          label: "CIRCULAÇÃO: pressão caiu, tontura ao sentar ou levantar, palidez, pele fria, ou desmaiou?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "digestivo",
          label: "DIGESTIVO: cólica, vômito ou diarreia que começaram junto com o quadro?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
        {
          id: "colapso",
          label: "GRAVE AGORA: está sem responder, sem respirar normalmente, ou sem pulso?",
          presets: [
            { value: "sim", label: "Sim" },
            { value: "nao", label: "Não" },
          ],
        },
      ],
      next: {
        possiveis: ["grade4_pcr", "immediate_im_epinephrine", "grade1_treatment", "grau_sem_criterio"],
        escolher: (v) => {
          if (v.colapso === "sim") return "grade4_pcr";

          // Qualquer sistema ALÉM da pele envolvido já é Grau II ou mais — e o
          // Grau II é o primeiro que exige adrenalina IM. Por isso um único
          // sistema basta: a diferença entre II e III muda a agressividade do
          // suporte, não a indicação da adrenalina, e a decisão que este passo
          // precisa acertar é justamente "adrenalina agora, sim ou não".
          const sistemico =
            v.viaAerea === "sim" ||
            v.respiracao === "sim" ||
            v.circulacao === "sim" ||
            v.digestivo === "sim";
          if (sistemico) return "immediate_im_epinephrine";

          if (v.pele === "sim") return "grade1_treatment";

          // Nenhum sistema e nenhuma pele: não há critério de anafilaxia com o
          // que foi observado. Não é alta — é reavaliar, porque o quadro pode
          // estar começando.
          return "grau_sem_criterio";
        },
      },
    },

    grau_sem_criterio: {
      id: "grau_sem_criterio",
      type: "action",
      title: "Nenhum achado marcado — reavalie, não libere",
      summary:
        "Com o que foi observado não há critério de anafilaxia. Isso não descarta: o quadro pode estar começando.",
      actions: [
        "Anafilaxia pode começar SEM lesão de pele em cerca de 10% dos casos — a ausência de urticária não afasta o diagnóstico.",
        "Se houve exposição a um desencadeante conhecido (alimento, fármaco, ferroada) nas últimas horas, mantenha em observação monitorizada mesmo sem achados.",
        "Sintomas iniciais fáceis de subestimar: coceira nas palmas, plantas ou couro cabeludo; formigamento nos lábios; sensação de \"algo errado\"; ansiedade súbita.",
        "REAVALIAR em poucos minutos, e a cada mudança. Ao surgir QUALQUER envolvimento de via aérea, respiração ou circulação, é Grau II ou mais — adrenalina IM imediata.",
        "Deixar adrenalina preparada e a dose calculada à beira do leito enquanto observa.",
      ],
      next: "severity_grade",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 3A. GRAU I — Tratamento inicial conservador
    // ─────────────────────────────────────────────────────────────────────────

    grade1_treatment: {
      id: "grade1_treatment",
      type: "action",
      title: "Grau I — Tratamento inicial",
      summary: "Anti-histamínico + corticoide + observação. Adrenalina IM disponível para uso IMEDIATO se progressão.",
      actions: [
        "REMOVER GATILHO: suspender infusão IV, retirar ferrão raspando (não pinçar), remover látex.",
        "POSIÇÃO: paciente deitado, MMII elevados. Exceção: angioedema de VA → sentar. Gestante → decúbito lateral esquerdo.",
        "ANTI-HISTAMÍNICO: difenidramina 25–50 mg IV lento OU cetirizina 10 mg VO para sintomas cutâneos. NÃO é tratamento de primeira linha para anafilaxia sistêmica.",
        "CORTICOIDE: metilprednisolona 1–2 mg/kg IV (máx 125 mg) — adjuvante de 2ª linha, início de ação 4–6 h. NÃO previne fase bifásica (recomendação GRADE 2020/parâmetro 2023 é CONTRA usá-lo com esse fim) e NUNCA substitui ou atrasa a adrenalina.",
        "ALTERNATIVAS EQUIVALENTES quando a metilprednisolona não estiver disponível: HIDROCORTISONA 200 mg IV (a escolha do Resuscitation Council UK) OU DEXAMETASONA 10 mg IV. As três doses são equivalentes entre si — 125 mg de metilprednisolona ≡ 200 mg de hidrocortisona ≡ 10 mg de dexametasona. Nenhuma muda a posição do corticoide: segue adjuvante, depois da adrenalina, e sem prevenir fase bifásica.",
        "MONITORIZAÇÃO: oximetria contínua, PA, FC a cada 5–15 min nas primeiras 2 h.",
        "ADRENALINA IM disponível à beira leito: aplicar IMEDIATAMENTE se surgir hipotensão, broncoespasmo, angioedema de VA, síncope ou piora rápida dos sintomas cutâneos.",
        "OBSERVAÇÃO mínima de 2–4 h mesmo com melhora completa.",
      ],
      next: "grade1_reassessment",
    },

    grade1_reassessment: {
      id: "grade1_reassessment",
      type: "decision",
      title: "Reavaliação do Grau I (30–60 min)",
      summary: "Qualquer progressão sistêmica exige adrenalina IM imediata — não aguardar piora completa.",
      question: "Qual é a resposta após o tratamento do Grau I?",
      evidence: [
        "Progressão sistêmica = surgimento de qualquer um: hipotensão, broncoespasmo, estridor, síncope, disfagia, ansiedade intensa, vômitos repetidos, taquicardia persistente não explicada.",
        "Melhora adequada = resolução ou redução clara dos sintomas cutâneos, vitais estáveis, sem novos sintomas.",
        "ATENÇÃO: anafilaxia bifásica ocorre em 1–20% dos casos, mesmo no Grau I.",
      ],
      options: [
        { id: "grade1_improving", label: "Melhora — sintomas cutâneos regredindo, vitais estáveis", next: "observation_phase" },
        { id: "grade1_progressive", label: "Progressão sistêmica — hipotensão, broncoespasmo, estridor ou piora", next: "immediate_im_epinephrine" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 3B. GRAU IV — PCR
    // ─────────────────────────────────────────────────────────────────────────

    grade4_pcr: {
      id: "grade4_pcr",
      type: "action",
      title: "Grau IV — PCR em anafilaxia",
      summary: "RCP padrão ACLS. Adrenalina IV 1 mg a cada 3–5 min. Prolongar RCP mínimo 30 min — causa potencialmente reversível.",
      actions: [
        "ATIVAR CÓDIGO: chamar equipe de reanimação, desfibrilador, material de via aérea.",
        "RCP: compressões torácicas de alta qualidade (100–120/min, 5–6 cm profundidade). IOT imediata.",
        "ADRENALINA IV: 1 mg IV a cada 3–5 min (protocolo ACLS padrão) — 1 ampola nacional de 1 mg/1 mL (1:1.000), direto. Se o protocolo pedir 1:10.000, diluir 1 mL da ampola em 9 mL de SF → 10 mL a 0,1 mg/mL (100 mcg/mL).",
        "FLUIDOS: reposição volêmica generosa com cristaloide — até 4–8 L podem ser necessários.",
        "PROLONGAR RCP mínimo 30 min — anafilaxia é causa reversível; não interromper precocemente.",
        "CONSIDERAR ECMO venoarterial em centros habilitados se refratário.",
        "Após ROSC: transferir para módulo Pós-PCR / UTI.",
      ],
      next: "post_escalation_decision",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 4. ADRENALINA IM — Graus II e III
    // ─────────────────────────────────────────────────────────────────────────

    immediate_im_epinephrine: {
      id: "immediate_im_epinephrine",
      type: "action",
      title: "Adrenalina IM — 1ª dose (Graus II–III)",
      summary: "PRIMEIRA LINHA imediata. Não existe contraindicação absoluta na anafilaxia.",
      actions: [
        "REMOVER GATILHO: suspender infusão IV, retirar ferrão raspando (não pinçar), remover látex.",
        "CHAMAR AJUDA: ativar código anafilaxia / emergência.",
        // A8 — o GATILHO de uma conduta que a árvore já tem em quatro lugares,
        // sempre como reação ("se refratário"). Saber do betabloqueador ANTES
        // muda a preparação, não só a resposta.
        "⚠️ PERGUNTE SE O PACIENTE USA BETABLOQUEADOR — e pergunte AGORA, não quando a adrenalina falhar. O betabloqueio impede a resposta beta-1 à adrenalina, e o uso de betabloqueador/IECA se associa a anafilaxia REFRATÁRIA (OR ≈ 2,5). Se usar: prepare o glucagon junto com a 1ª dose de adrenalina, em vez de buscá-lo depois de duas doses sem resposta. A evidência é debatida — há análises multivariadas em que o betabloqueador não sai como fator independente —, mas a preparação antecipada não custa nada e a busca tardia custa minutos.",
        "POSIÇÃO: deitado com MMII elevados. Angioedema de VA → sentar. Gestante → decúbito lateral esquerdo.",
        "ADRENALINA IM — dose e técnica:",
        "  • Adultos: 0,3–0,5 mg IM (0,3–0,5 mL da solução 1:1.000) na face ANTEROLATERAL DA COXA.",
        FORA_DE_ESCOPO_PEDIATRICO,
        "  • Autoinjector adulto: EpiPen 0,3 mg (≥ 30 kg).",
        "  • Pode repetir a cada 5–15 min se necessário — até 3 doses IM antes de considerar infusão IV contínua.",
        "O₂: máscara com reservatório 10–15 L/min; alvo SpO₂ ≥ 95%.",
        "ACESSO VENOSO: 2 acessos calibrosos. Cristaloide: SF 0,9% ou Ringer Lactato 1.000–2.000 mL rápido, EM ALÍQUOTAS de 500 mL, reavaliando perfusão e congestão após CADA uma — o volume é titulado, não prescrito de uma vez. Cardiopata, disfunção renal, idoso ou gestante: alíquotas de 250 mL e reavaliação mais frequente.",
        FORA_DE_ESCOPO_PEDIATRICO,
        "MONITORIZAÇÃO: PA, FC, SpO₂, FR contínuos. ECG em adultos/cardiopatas.",
      ],
      next: "severity_stratification",
    },

    severity_stratification: {
      id: "severity_stratification",
      type: "decision",
      title: "Reavaliação após a 1ª adrenalina IM",
      summary: "Reavaliar via aérea, respiração, circulação e consciência para decidir o próximo pacote de suporte.",
      question: "Após a 1ª adrenalina IM, qual é a apresentação dominante?",
      evidence: [
        "Grave / ameaça imediata = choque persistente (PAS < 90), estridor, edema progressivo de VA, broncoespasmo grave, hipoxemia, rebaixamento de consciência ou cianose.",
        "Moderado = sintomas persistentes mas sem ameaça imediata à vida.",
      ],
      options: [
        { id: "severe", label: "Grau III — ameaça imediata à via aérea, choque, hipoxemia grave", next: "severe_resuscitation_bundle" },
        { id: "moderate", label: "Grau II — sintomático mas estável, sem ameaça imediata", next: "moderate_support_bundle" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 5. PACOTES DE SUPORTE
    // ─────────────────────────────────────────────────────────────────────────

    moderate_support_bundle: {
      id: "moderate_support_bundle",
      type: "action",
      title: "Suporte — Grau II (moderado)",
      summary: "Suporte pós-primeira adrenalina IM. Adjuvantes complementam mas NÃO substituem adrenalina.",
      actions: [
        "O₂: manter máscara com reservatório se SpO₂ < 95% ou sintomas respiratórios.",
        "BRONCOESPASMO persistente: salbutamol (albuterol) inalatório 2,5–5 mg NBZ ou 4–8 puffs com espaçador — repetir a cada 20 min. Não substitui adrenalina.",
        "FLUIDOS: manter acesso venoso; se hipotensão leve persistir, cristaloide 1.000–2.000 mL rápido, EM ALÍQUOTAS de 500 mL, reavaliando perfusão e congestão após CADA uma — o volume é titulado, não prescrito de uma vez. Cardiopata, disfunção renal, idoso ou gestante: alíquotas de 250 mL e reavaliação mais frequente.",
        FORA_DE_ESCOPO_PEDIATRICO,
        "CORTICOIDE (adjuvante): metilprednisolona 1–2 mg/kg IV (máx 125 mg) — início de ação 4–6 h. NÃO previne fase bifásica; o que reduz reação bifásica é a ADRENALINA PRECOCE.",
        "ANTI-H1 (adjuvante): difenidramina 25–50 mg IV lento — para sintomas cutâneos. NÃO administrar antes da adrenalina.",
        "ANTI-H2 (adjuvante, evidência limitada): ranitidina 50 mg IV ou famotidina 20 mg IV.",
        "Preparar SEGUNDA DOSE de adrenalina IM — aplicar em 5 min se sintomas persistirem ou piorarem.",
        "SITUAÇÃO ESPECIAL — betabloqueador: se refratário à adrenalina, adicionar glucagon 1–2 mg IV em 5 min → infusão 5–15 mcg/min.",
        "SITUAÇÃO ESPECIAL — IECA: potencializam angioedema; considerar icatibanto 30 mg SC para angioedema associado.",
        "SITUAÇÃO ESPECIAL — gestante: manter decúbito lateral esquerdo; adrenalina é segura na gestação; acionar obstetrícia.",
      ],
      next: "reassessment_after_first_im",
    },

    severe_resuscitation_bundle: {
      id: "severe_resuscitation_bundle",
      type: "action",
      title: "Ressuscitação — Grau III (grave)",
      summary: "Prioridade: via aérea, circulação, volume. Preparar IOT precoce se estridor ou angioedema progressivo.",
      actions: [
        "O₂ ALTO FLUXO imediato: máscara com reservatório 10–15 L/min.",
        "ACESSO VENOSO CALIBROSO (2): SF 0,9% ou Ringer Lactato 1.000–2.000 mL rápido, EM ALÍQUOTAS de 500 mL, reavaliando perfusão e congestão após CADA uma — o volume é titulado, não prescrito de uma vez. Cardiopata, disfunção renal, idoso ou gestante: alíquotas de 250 mL e reavaliação mais frequente — repetir conforme a PA.",
        FORA_DE_ESCOPO_PEDIATRICO,
        // A linha antiga mandava EVITAR succinilcolina e usar rocurônio no
        // angioedema — "agente longo porque a via é difícil" inverte a lógica
        // do risco: em possível CICO o rocurônio compromete 45–70 min. A regra
        // agora vem de lib/doses-isr.ts, a MESMA que o módulo de ISR consome
        // (R-12) — regra clínica em dois lugares diverge.
        "VIA AÉREA — ANGIOEDEMA GRAVE ou FALHA DE 2 DOSES IM: preparar IOT por sequência rápida IMEDIATAMENTE. Ter cricotireoidostomia à beira leito.",
        ANAFILAXIA_BLOQUEADOR,
        ANAFILAXIA_BLOQUEADOR_ROCURONIO,
        ANAFILAXIA_GATILHO_BLOQUEADOR,
        ANAFILAXIA_BLOQUEADOR_LASTRO,
        "SEGUNDA DOSE adrenalina IM em 5 min se instabilidade persistir.",
        // DECISÃO DELIBERADA — SEM BOLUS DE ADRENALINA EV FORA DA PCR.
        //
        // Uma versão anterior deste conteúdo (protocolo antigo, hoje só em
        // código morto) oferecia bolus IV de 1:10.000 (0,1 mg a cada 5 min)
        // como alternativa à infusão no choque refratário. Removido de
        // propósito: bolus de adrenalina fora de parada cardiorrespiratória é
        // causa conhecida de arritmia e isquemia miocárdica — a via correta na
        // anafilaxia refratária é infusão TITULADA, não bolus. Só existe UMA
        // via aqui, e é intencional. Não restaurar o bolus sem nova decisão
        // clínica registrada.
        "INFUSÃO IV CONTÍNUA de adrenalina se falha após 2–3 doses IM: diluir 1 mg em 100 mL SF → 10 mcg/mL.",
        ADRENALINA_EV_ANAFILAXIA_DOSE,
        "Alvo: PAS ≥ 90 mmHg. Monitorização: acesso arterial se disponível.",
        "BRONCOESPASMO: salbutamol inalatório 2,5–5 mg NBZ — repetir a cada 20 min.",
        "⚠️ DOR TORÁCICA OU ALTERAÇÃO NO ECG DURANTE A REAÇÃO — pense em SÍNDROME DE KOUNIS (síndrome coronariana ALÉRGICA): os mediadores da degranulação mastocitária causam VASOESPASMO CORONARIANO. Pode haver supra ou infra de ST e troponina elevada. Não descarte a dor como sendo apenas mais um sintoma da reação: colher ECG e troponina.",
        "E a conduta carrega uma tensão que precisa ser sabida: a ADRENALINA continua sendo o tratamento da anafilaxia, mas pode agravar o vasoespasmo coronariano. Isso NÃO a contraindica — anafilaxia não tratada mata mais rápido. Significa monitorizar o ECG, evitar dose excessiva e envolver a cardiologia precocemente, sem atrasar a adrenalina.",
        BRONCOESPASMO_PRIMEIRA_LINHA,
        BRONCOESPASMO_MAGNESIO_REFRATARIO,
        BRONCOESPASMO_NAO_SUBSTITUI_ADRENALINA,
        "CORTICOIDE: metilprednisolona 1–2 mg/kg IV (máx 125 mg).",
        "SITUAÇÃO ESPECIAL — betabloqueador: glucagon 1–2 mg IV em 5 min → 5–15 mcg/min + atropina 0,5–1 mg IV para bradicardia.",
        "SITUAÇÃO ESPECIAL — IECA: icatibanto 30 mg SC para angioedema refratário.",
        "SITUAÇÃO ESPECIAL — gestante: decúbito lateral esquerdo; adrenalina segura; acionar obstetrícia urgente.",
        "Indicação de UTI: instabilidade hemodinâmica persistente após 2 doses IM + reposição volêmica.",
      ],
      next: "reassessment_after_first_im",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 6. LOOPS DE REAVALIAÇÃO
    // ─────────────────────────────────────────────────────────────────────────

    reassessment_after_first_im: {
      id: "reassessment_after_first_im",
      type: "decision",
      title: "Reavaliação após tratamento inicial (5–15 min)",
      summary: "Reavaliar PA, SpO₂, esforço respiratório e nível de consciência.",
      question: "Qual é a resposta ao tratamento inicial?",
      evidence: [
        "Melhora importante = PAS ≥ 90 mmHg, SpO₂ ≥ 95%, sem broncoespasmo significativo, paciente alerta.",
        "Sintomas persistentes sem piora = indicação de segunda dose IM; não escalar antes de administrá-la.",
        "Piora / choque / VA comprometida = escalonamento imediato independentemente do número de doses IM.",
      ],
      options: [
        { id: "resolved_or_nearly_resolved", label: "Melhora importante / estabilização", next: "observation_phase" },
        { id: "persistent_non_severe", label: "Sintomas persistentes sem choque nem ameaça de VA", next: "repeat_im_epinephrine" },
        { id: "worsening_or_severe", label: "Piora, choque ou comprometimento grave de VA", next: "critical_escalation_bundle" },
      ],
    },

    repeat_im_epinephrine: {
      id: "repeat_im_epinephrine",
      type: "action",
      title: "2ª dose adrenalina IM",
      summary: "Repetir em 5–15 min. Máx 3 doses IM antes de considerar infusão IV contínua.",
      actions: [
        "ADRENALINA IM 2ª dose: mesma dose e local — 0,3–0,5 mg na face anterolateral da coxa.",
        FORA_DE_ESCOPO_PEDIATRICO,
        "Continuar O₂, fluidos e monitorização.",
        "Reavaliar em até 5–15 min: PA, SpO₂, esforço respiratório, edema de VA, nível de consciência.",
        "Se 3ª dose necessária: preparar infusão IV contínua de adrenalina e UTI em paralelo.",
      ],
      next: "reassessment_after_second_im",
    },

    reassessment_after_second_im: {
      id: "reassessment_after_second_im",
      type: "decision",
      title: "Reavaliação após 2ª dose IM",
      summary: "Falha após 2 doses IM + fluidos = indicação de adrenalina IV contínua e UTI.",
      question: "Qual a resposta após a 2ª dose de adrenalina IM?",
      evidence: [
        "Instabilidade após 2 doses IM eleva fortemente a necessidade de infusão IV contínua.",
        "Qualquer deterioração de VA é gatilho independente para módulo de via aérea avançada.",
      ],
      options: [
        { id: "now_stable", label: "Melhora clara / estabilização", next: "observation_phase" },
        { id: "persistent_instability", label: "Ainda instável, choque ou refratário", next: "critical_escalation_bundle" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 7. ESCALONAMENTO CRÍTICO / UTI
    // ─────────────────────────────────────────────────────────────────────────

    critical_escalation_bundle: {
      id: "critical_escalation_bundle",
      type: "action",
      title: "Choque anafilático — Escalonamento para UTI",
      summary: "Choque anafilático = anafilaxia Grau III–IV com instabilidade persistente após 2 doses IM + reposição volêmica.",
      actions: [
        "ADRENALINA IV CONTÍNUA: diluir 1 mg (1 mL da 1:1.000) em 100 mL SF → 10 mcg/mL.",
        ADRENALINA_EV_ANAFILAXIA_DOSE,
        "Alvo: PAS ≥ 90 mmHg.",
        "REPOSIÇÃO VOLÊMICA AGRESSIVA: até 4–8 L de cristaloide nas primeiras horas. Monitorar SpO₂, ausculta pulmonar e sinais de sobrecarga. Considerar POCUS para guiar.",
        "VASOPRESSORES ALTERNATIVOS se refratário à adrenalina:",
        "  • Norepinefrina: 0,1–1 mcg/kg/min IV contínuo (2ª linha; preferida em vasoplegia).",
        "  • Vasopressina: 0,03–0,04 U/min IV, dose fixa (especialmente em uso de betabloqueador).",
        "  • Dopamina: 5–20 mcg/kg/min IV (alternativa se norepinefrina indisponível).",
        "BETABLOQUEADOR refratário: glucagon 1–2 mg IV em 5 min → 5–15 mcg/min + atropina 0,5–1 mg IV para bradicardia.",
        "ECMO venoarterial: considerar em centros habilitados se refratário a todos vasopressores (relatos de sobrevida).",
        "Indicação de acesso arterial para monitorização invasiva de PA.",
      ],
      next: "post_escalation_decision",
    },

    post_escalation_decision: {
      id: "post_escalation_decision",
      type: "decision",
      title: "Após escalonamento — necessidade de suporte adicional",
      summary: "Decidir se o paciente precisa de módulo específico ou segue para UTI.",
      question: "Após escalonamento, qual suporte adicional é necessário?",
      evidence: [
        "Qualquer deterioração de VA = módulo ISR independentemente do estado hemodinâmico.",
        "Ventilação após IOT = módulo ventilação mecânica.",
        "Infusão vasoativa em curso = módulo drogas vasoativas para titulação.",
      ],
      options: [
        { id: "airway_module_needed", label: "Necessita via aérea avançada / ISR urgente", next: "transition_to_airway_module" },
        { id: "ventilation_module_needed", label: "Necessita ventilação mecânica (IOT realizada)", next: "transition_to_ventilation_module" },
        { id: "vasoactive_module_needed", label: "Necessita titulação de infusão vasoativa", next: "transition_to_vasoactive_module" },
        { id: "critical_but_self_contained", label: "Estabilizou parcialmente — UTI para monitorização intensiva", next: "icu_transition" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 8. OBSERVAÇÃO E VIGILÂNCIA BIFÁSICA
    // ─────────────────────────────────────────────────────────────────────────

    observation_phase: {
      id: "observation_phase",
      type: "action",
      title: "Fase de observação — vigilância para recaída bifásica",
      summary: "Observação obrigatória mesmo após melhora. Anafilaxia bifásica ocorre em 1–20% dos casos.",
      actions: [
        "TEMPO MÍNIMO DE OBSERVAÇÃO após resolução clínica:",
        "  • Grau I (apenas cutâneo): 2–4 h.",
        "  • Grau II (moderado): 4–6 h.",
        "  • Grau III/IV (grave / choque): 12–24 h em UTI ou área monitorada.",
        "  • Fatores de alto risco (asma, PCR prévia, adrenalina tardia, alimento como gatilho): 24 h mínimo.",
        "ANAFILAXIA BIFÁSICA: ocorre em 1–20% dos casos, 4–12 h após resolução aparente. Fatores de risco: adrenalina tardia na 1ª dose, hipotensão grave, gatilho alimentar. Manter monitorização mesmo assintomático.",
        "MONITORIZAÇÃO: PA, FC, SpO₂, FR a cada 15–30 min durante observação. ECG se cardiopata.",
        "MANTER ACESSO VENOSO e adrenalina disponível durante todo o período de observação.",
        "DOCUMENTAR: gatilho, cronologia, número de doses de adrenalina e resposta clínica.",
        "NÃO alta antes do tempo mínimo — anti-H1 e corticoide não eliminam risco bifásico.",
      ],
      next: "observation_disposition",
    },

    observation_disposition: {
      id: "observation_disposition",
      type: "decision",
      title: "Destino após observação",
      summary: "Avaliar estabilidade sustentada, tempo de observação cumprido e risco de recaída.",
      question: "Após cumprir o tempo de observação, qual é o destino mais seguro?",
      evidence: [
        "Alta segura: estabilidade sustentada, sem recorrência de sintomas, tempo de observação cumprido, checklist de alta completo.",
        "Observação monitorizada: melhora após tratamento mas sintomas residuais, adrenalina repetida, risco moderado de recaída.",
        "UTI: instabilidade residual, choque, uso de infusão vasoativa ou necessidade de monitorização intensiva.",
      ],
      options: [
        { id: "safe_discharge", label: "Alta segura — estável, observação cumprida, checklist completo", next: "discharge_checklist" },
        { id: "needs_monitored_observation", label: "Observação monitorizada — melhora mas sem alta segura ainda", next: "observation_transition" },
        { id: "needs_icu", label: "UTI — instabilidade residual ou alto risco", next: "icu_transition" },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 9. CHECKLIST DE ALTA
    // ─────────────────────────────────────────────────────────────────────────

    discharge_checklist: {
      id: "discharge_checklist",
      type: "action",
      title: "Checklist de alta — obrigatório antes de liberar",
      summary: "Todo paciente com anafilaxia deve sair com autoinjector, corticoide oral e encaminhamento ao alergista.",
      actions: [
        "✅ AUTOINJECTOR DE ADRENALINA: prescrever 2 unidades. Treinar paciente E familiar na técnica de aplicação IM na coxa. EpiPen 0,3 mg (≥ 30 kg).",
        FORA_DE_ESCOPO_PEDIATRICO,
        "✅ CORTICOIDE ORAL: prednisona 0,5–1 mg/kg/dia (adultos 40–60 mg/dia) por 3–5 dias — reduz recorrência bifásica (evidência moderada).",
        "✅ ANTI-HISTAMÍNICO ORAL: cetirizina ou loratadina por 3–5 dias para sintomas cutâneos residuais.",
        "✅ CARTA DE EMERGÊNCIA / PULSEIRA DE ALERTA: documentar alérgeno suspeito, episódio e conduta realizada.",
        "✅ ENCAMINHAMENTO OBRIGATÓRIO ao alergista/imunologista para investigação etiológica (IgE específica, teste cutâneo 4–6 semanas após), dessensibilização quando indicada e plano de ação por escrito.",
        "✅ ORIENTAÇÕES AO PACIENTE: evitar gatilho identificado; carregar SEMPRE o autoinjector; acionar SAMU/192 imediatamente em nova reação; não depender apenas de anti-H1 em nova crise.",
        "✅ TRIPTASE SÉRICA: solicitar coleta (se não realizada) 30 min–3 h após início dos sintomas para confirmação diagnóstica. Triptase normal não exclui anafilaxia alimentar.",
      ],
      next: "discharge_transition",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 10. NÓS TERMINAIS
    // ─────────────────────────────────────────────────────────────────────────

    not_anaphylaxis_exit: {
      id: "not_anaphylaxis_exit",
      type: "transition",
      title: "Reação alérgica localizada — sem critérios de anafilaxia",
      summary: "Critérios sistêmicos não preenchidos. Tratar como urticária/angioedema localizado.",
      disposition: "discharge",
      exitCriteria: [
        "Sem critérios de anafilaxia neste momento.",
        "Tratar sintomas cutâneos com anti-H1 ± corticoide oral.",
        "Orientar sinais de alarme: surgimento de hipotensão, dispneia, estridor, síncope → retorno imediato e adrenalina IM.",
        "Considerar investigação de angioedema hereditário (AEH) se angioedema sem urticária ou refratário à adrenalina (C3, C4, C1-INH).",
      ],
      targets: [],
    },

    discharge_transition: {
      id: "discharge_transition",
      type: "transition",
      title: "Alta segura",
      summary: "Melhora sustentada, tempo de observação cumprido, checklist de alta completo.",
      disposition: "discharge",
      exitCriteria: [
        "Estabilidade hemodinâmica e respiratória sustentada durante todo o período de observação.",
        "Autoinjector x2 prescrito e técnica treinada com paciente e familiar.",
        "Prednisona 3–5 dias + anti-H1 oral 3–5 dias prescritos.",
        "Carta de emergência e encaminhamento ao alergista documentados.",
        "Orientações de retorno imediato em caso de nova sintomatologia.",
      ],
      targets: [],
    },

    observation_transition: {
      id: "observation_transition",
      type: "transition",
      title: "Internação para observação monitorizada",
      summary: "Melhora após tratamento, mas ainda necessita vigilância por risco de recaída bifásica.",
      disposition: "observation",
      exitCriteria: [
        "Melhorou após tratamento mas precisa de vigilância contínua.",
        "Pode ter precisado de adrenalina repetida ou apresentar sintomas residuais sem critérios atuais de UTI.",
        "Risco elevado de anafilaxia bifásica (asma, PCR prévia, adrenalina tardia, gatilho alimentar).",
      ],
      targets: [],
    },

    icu_transition: {
      id: "icu_transition",
      type: "transition",
      title: "Internação em UTI",
      summary: "Anafilaxia grave, refratária ou com instabilidade persistente.",
      disposition: "icu",
      exitCriteria: [
        "Instabilidade hemodinâmica persistente ou em uso de infusão vasoativa.",
        "Necessidade de IOT, ventilação mecânica ou monitorização invasiva.",
        "Risco muito alto de recaída ou falha de múltiplos vasopressores.",
      ],
      targets: [],
    },

    transition_to_airway_module: {
      id: "transition_to_airway_module",
      type: "transition",
      title: "Módulo de via aérea avançada / ISR",
      summary: "Estridor, edema progressivo de VA, falha de oxigenação ou decisão de IOT.",
      disposition: "other_module",
      exitCriteria: [
        "Edema progressivo de VA superior, falha de oxigenação/ventilação ou ameaça imediata à VA.",
        "Decisão tomada por sequência de via aérea avançada.",
        ANAFILAXIA_BLOQUEADOR,
      ],
      targets: [
        {
          moduleId: "isr-rapida",
          label: "ISR — Intubação de Sequência Rápida",
          reason: "Manejo avançado da via aérea — angioedema grave ou falha ventilatória.",
        },
      ],
    },

    transition_to_ventilation_module: {
      id: "transition_to_ventilation_module",
      type: "transition",
      title: "Módulo de ventilação mecânica",
      summary: "IOT realizada — ajuste de parâmetros e manejo ventilatório.",
      disposition: "other_module",
      exitCriteria: [
        "Ventilação mecânica iniciada após IOT.",
        "Ajuste de Vt, PEEP, FR e manejo de troca gasosa passam a dominar o atendimento.",
      ],
      targets: [
        {
          moduleId: "ventilacao-mecanica",
          label: "Ventilação Mecânica",
          reason: "Setup do ventilador e manejo ventilatório pós-IOT.",
        },
      ],
    },

    transition_to_vasoactive_module: {
      id: "transition_to_vasoactive_module",
      type: "transition",
      title: "Módulo de drogas vasoativas",
      summary: "Infusão vasoativa em curso — titulação centralizada no módulo específico.",
      disposition: "other_module",
      exitCriteria: [
        "Adrenalina IV contínua ou outro vasoativo iniciado e titulação passa a ser o problema principal.",
        "Choque anafilático refratário a adrenalina IM, fluidos e medidas imediatas.",
      ],
      targets: [
        {
          moduleId: "drogas-vasoativas",
          label: "Drogas Vasoativas",
          reason: "Titulação de infusão vasoativa em choque anafilático.",
        },
      ],
    },
  },
};

export const anaphylaxisDecisionTreeIssues = validateDecisionTree(anaphylaxisDecisionTree);

export function createAnaphylaxisDecisionEngine() {
  return new DecisionTreeEngine(anaphylaxisDecisionTree);
}

export function runSampleAnaphylaxisPath() {
  const engine = createAnaphylaxisDecisionEngine();

  const snapshots: Array<{ label: string; step: FrontendTreeStep }> = [];
  const capture = (label: string) => snapshots.push({ label, step: engine.toFrontendStep() });

  capture("Entrada");
  engine.choose("criteria_met");
  capture("Após reconhecimento diagnóstico");
  engine.choose("grade2");
  capture("Grau II — adrenalina IM");
  engine.advance();
  capture("Após 1ª adrenalina IM");
  engine.choose("moderate");
  capture("Suporte moderado");
  engine.advance();
  capture("Após pacote moderado");
  engine.choose("persistent_non_severe");
  capture("Sintomas persistentes — 2ª dose");
  engine.advance();
  capture("Após 2ª adrenalina IM");
  engine.choose("now_stable");
  capture("Estabilizado — observação");
  engine.advance();
  capture("Observação com alerta bifásico");
  engine.choose("safe_discharge");
  capture("Checklist de alta");
  engine.advance();
  capture("Alta segura");

  return { path: snapshots, log: engine.getLog() };
}
