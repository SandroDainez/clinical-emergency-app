import type { DecisionTreeDefinition } from "./core/decision-tree/types";
import {
  INTRO_GUIADA,
  OPCAO_GUIADA,
  camposRespiratorios,
  derivarGravidadeRespiratoria,
} from "./lib/instabilidade-guiada";

/**
 * Fluxograma de dispneia aguda — diagnóstico diferencial guiado por perguntas.
 * Cada diagnóstico final traz exames prioritários, tratamento imediato, critérios
 * de IOT e link para o protocolo correspondente.
 *
 * Fonte declarada da parte de ventilação não invasiva: Medicina Intensiva —
 * Abordagem Prática, 5ª ed. (2022), Disciplina de Emergências Clínicas do
 * HC-FMUSP / USP. Capítulo 46, Ventilação Mecânica Não Invasiva (Marcelo Park).
 */

export const dyspneaDecisionTree: DecisionTreeDefinition = {
  id: "insuficiencia_respiratoria",
  version: "2024.1",
  label: "Insuficiência respiratória",
  entryNodeId: "inicio",
  nodes: {
    inicio: {
      id: "inicio",
      type: "decision",
      title: "Dispneia grave?",
      question: "SpO₂ < 90% ou dispneia grave (uso de musculatura acessória, exaustão)?",
      evidence: [
        "Estabilização primeiro: O₂ alvo, monitor, acessos. Preparar VNI/IOT se falência.",
        "VNI com uso COMPROVADO em três cenários: DPOC exacerbada, edema agudo de pulmão e imediatamente após extubação de alto risco.",
        "VNI COM CAUTELA — insuficiência respiratória hipoxêmica (o cenário de maior risco de falha, sobretudo se for SDRA), crise asmática e paciente em fim de vida.",
        "CONTRAINDICAÇÕES à VNI: rebaixamento, sonolência, agitação, confusão ou recusa; instabilidade hemodinâmica com vasopressor, PAS < 90 ou arritmia complexa; obstrução de via aérea superior ou trauma de face; tosse ineficaz ou incapacidade de deglutir; distensão abdominal, náusea ou vômito; hemorragia digestiva alta; infarto agudo do miocárdio; pós-operatório recente de face, via aérea superior ou esôfago.",
        "Controversa (não proibida): pós-operatório de cirurgia gástrica e gestação.",
        "⚠️ A REGRA DOS 30–60 MINUTOS: melhora das trocas gasosas ou da frequência respiratória nesse intervalo prediz sucesso. Sem melhora, INTUBAR — insistir na VNI que não está funcionando é o erro que transforma falência respiratória em parada.",
        "Preditores de FALHA: no edema agudo de pulmão, ausência de hipertensão e pH normal; na DPOC, nível de consciência reduzido, pH muito baixo e frequência respiratória alta; e, em qualquer cenário, idoso com gravidade geral alta.",
        "Efeitos colaterais que pedem vigilância: lesão de pele no apoio da máscara (até necrose), ressecamento ocular por vazamento, aerofagia com distensão abdominal (raramente até síndrome compartimental) e o risco maior — vômito com a máscara no rosto.",
      ],
      options: [
        { id: "guiado", label: OPCAO_GUIADA, next: "disp_dados" },
        { id: "sim", label: "Sim — grave", next: "q_subito" },
        { id: "nao", label: "Não — leve", next: "leve" },
      ],
    },

    disp_dados: {
      id: "disp_dados",
      type: "input",
      title: "Vamos verificar juntos",
      intro: INTRO_GUIADA,
      fields: camposRespiratorios(),
      next: {
        possiveis: ["q_subito", "disp_limitrofe", "leve"],
        escolher: (v) => {
          const grau = derivarGravidadeRespiratoria(v);
          if (grau === "grave") return "q_subito";
          if (grau === "limitrofe") return "disp_limitrofe";
          return "leve";
        },
      },
    },

    disp_limitrofe: {
      id: "disp_limitrofe",
      type: "action",
      title: "Esforço presente, mas ainda sem critério de gravidade",
      summary:
        "Há trabalho respiratório aumentado sem os marcadores de gravidade. Não é leve: é o paciente que pode virar nos próximos minutos.",
      actions: [
        "O QUE VOCÊ VIU CONTA: usar musculatura acessória, falar em frases curtas ou não conseguir deitar são sinais de esforço — significam que o paciente está compensando, não que está bem.",
        "NÃO se tranquilize pela saturação. O oxímetro erra em pele fria, esmalte, perfusão ruim e movimento — e o paciente compensa a hipoxemia aumentando o trabalho até não conseguir mais. Saturação normal com esforço alto é um sistema perto do limite.",
        "AGORA: oxigênio para alvo, monitorização contínua, acesso venoso, gasometria e radiografia. Sentar o paciente na posição em que ele respira melhor.",
        "REAVALIAR de perto — frequência respiratória, fala e esforço são mais sensíveis que a saturação para perceber a piora.",
        "SINAL DE ALARME que muda tudo: se ficar sonolento, confuso, ou QUIETO com respiração lenta depois de estar ofegante, não melhorou — cansou. É pré-parada respiratória: preparar via aérea imediatamente.",
      ],
      next: "q_subito",
    },
    leve: {
      id: "leve",
      type: "transition",
      title: "Dispneia leve",
      summary: "Sem hipoxemia grave — avaliar ambulatorialmente se estável.",
      disposition: "observation",
      exitCriteria: ["Investigar a causa; reavaliar SpO₂, FR e esforço; escalar se piora."],
      targets: [],
    },

    q_subito: {
      id: "q_subito",
      type: "decision",
      title: "Início súbito (segundos a minutos)?",
      question: "O quadro instalou-se de forma abrupta?",
      options: [
        { id: "sim", label: "Sim — súbito", next: "q_trauma" },
        { id: "nao", label: "Não — gradual", next: "q_chiado" },
      ],
    },
    q_trauma: {
      id: "q_trauma",
      type: "decision",
      title: "Trauma torácico / procedimento recente?",
      question: "Trauma de tórax, punção, intubação ou cateter venoso central recente?",
      options: [
        { id: "sim", label: "Sim", next: "dx_pneumotorax" },
        { id: "nao", label: "Não", next: "q_tep" },
      ],
    },
    dx_pneumotorax: {
      id: "dx_pneumotorax",
      type: "transition",
      title: "PNEUMOTÓRAX",
      summary: "Dispneia súbita + dor + murmúrio ausente unilateral.",
      disposition: "icu",
      exitCriteria: [
        "Exames: clínico + RX/USG (não atrasar se hipertensivo).",
        "Tratamento: hipertensivo → descompressão imediata (agulha 14G) → dreno; simples → drenagem conforme tamanho.",
        "IOT se insuficiência respiratória refratária.",
      ],
      targets: [],
    },
    q_tep: {
      id: "q_tep",
      type: "decision",
      title: "Suspeita de TEP?",
      question: "Fator de risco para TEP + taquicardia + dor pleurítica?",
      options: [
        { id: "sim", label: "Sim — TEP suspeito", next: "dx_tep" },
        { id: "nao", label: "Não", next: "q_anafilaxia" },
      ],
    },
    dx_tep: {
      id: "dx_tep",
      type: "transition",
      title: "TEP SUSPEITO",
      summary: "Dispneia súbita + taquicardia + fator de risco.",
      disposition: "icu",
      exitCriteria: [
        "Exames: Wells + D-dímero (se improvável) / AngioTC; ECG, gasometria, troponina/BNP.",
        "Tratamento: O₂; anticoagulação; trombólise se alto risco/instável. Ver o guia de TEP.",
      ],
      targets: [{ moduleId: "tep", label: "Guia de TEP", reason: "Probabilidade, diagnóstico e tratamento." }],
    },
    q_anafilaxia: {
      id: "q_anafilaxia",
      type: "decision",
      title: "Suspeita de anafilaxia?",
      question: "Exposição a alérgeno, urticária ou angioedema?",
      options: [
        { id: "sim", label: "Sim — anafilaxia", next: "dx_anafilaxia" },
        { id: "nao", label: "Não", next: "dx_embolia_arritmia" },
      ],
    },
    dx_anafilaxia: {
      id: "dx_anafilaxia",
      type: "transition",
      title: "ANAFILAXIA",
      summary: "Reação sistêmica com comprometimento respiratório.",
      disposition: "icu",
      exitCriteria: [
        "Tratamento: ADRENALINA IM IMEDIATA (0,3–0,5 mg na coxa); O₂; cristaloide; via aérea se angioedema progressivo.",
        "Exames: o diagnóstico é clínico — não atrasar a adrenalina.",
      ],
      targets: [{ moduleId: "anafilaxia", label: "Guia de anafilaxia", reason: "Adrenalina IM e manejo escalonado." }],
    },
    dx_embolia_arritmia: {
      id: "dx_embolia_arritmia",
      type: "transition",
      title: "Avaliar embolia / arritmia / isquemia",
      summary: "Dispneia súbita sem trauma/TEP/anafilaxia evidentes.",
      disposition: "observation",
      exitCriteria: [
        "Exames: ECG (arritmia/IAM), saturação, gasometria, troponina.",
        "Considerar SCA, arritmia, embolia gasosa/gordurosa; tratar conforme achado.",
      ],
      targets: [],
    },

    q_chiado: {
      id: "q_chiado",
      type: "decision",
      title: "Chiado / sibilância predominante?",
      question: "Sibilância expiratória predomina à ausculta?",
      options: [
        { id: "sim", label: "Sim", next: "q_asma" },
        { id: "nao", label: "Não", next: "q_crepitantes" },
      ],
    },
    q_asma: {
      id: "q_asma",
      type: "decision",
      title: "História de asma ou atopia?",
      question: "Asma/atopia conhecida?",
      options: [
        { id: "sim", label: "Sim — asma", next: "dx_asma" },
        { id: "nao", label: "Não", next: "q_dpoc" },
      ],
    },
    dx_asma: {
      id: "dx_asma",
      type: "transition",
      title: "ASMA EXACERBADA",
      summary: "Broncoespasmo com sibilância e história de asma.",
      disposition: "icu",
      exitCriteria: [
        "Exames: pico de fluxo/espirometria, SpO₂, gasometria (vigiar normo/hipercapnia = fadiga).",
        "Tratamento: β2 + ipratrópio inalatórios contínuos, corticoide sistêmico, MgSO₄ 2 g IV se grave; O₂.",
        "IOT se exaustão/rebaixamento; VM com expiração longa (auto-PEEP). Ver ventilação mecânica.",
      ],
      targets: [{ moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Estratégia obstrutiva se IOT." }],
    },
    q_dpoc: {
      id: "q_dpoc",
      type: "decision",
      title: "Tabagismo extenso / DPOC conhecido?",
      question: "DPOC conhecido ou tabagismo importante?",
      options: [
        { id: "sim", label: "Sim — DPOC", next: "dx_dpoc" },
        { id: "nao", label: "Não", next: "dx_sibilancia_novo" },
      ],
    },
    dx_dpoc: {
      id: "dx_dpoc",
      type: "transition",
      title: "DPOC EXACERBADO",
      summary: "Sibilância + história de DPOC/tabagismo.",
      disposition: "icu",
      exitCriteria: [
        "Exames: gasometria (hipercapnia), RX (descartar pneumotórax/pneumonia), ECG.",
        "Tratamento: β2 + ipratrópio, corticoide, ATB se exacerbação infecciosa; O₂ alvo 88–92%.",
        "VNI precoce na acidose hipercápnica (pH < 7,35); IOT se falha. Ver ventilação mecânica.",
        "Critérios de insuficiência respiratória aguda na DPOC: PaO₂ < 55 mmHg, PaCO₂ > 50 mmHg e pH < 7,35 — internação em UTI e candidato a VNI.",
        "Modo: pressão de suporte com PEEP conforme necessário. Na hiperinsuflação dinâmica suspeita (auto-PEEP), o CPAP ajuda — o valor ideal é o que dá o melhor conforto, já que medir auto-PEEP em respiração espontânea é difícil.",
        "Paciente ideal para VNI: alerta, cooperativo, com reflexos protetores de via aérea intactos e estável. Em serviços experientes, o coma HIPERCÁPNICO da DPOC não contraindica.",
        "INTUBAR quando: consciência caindo com perda dos reflexos de tosse e expectoração; incapacidade de cooperar; sinais objetivos de fadiga e exaustão muscular; ou acidemia grave com pH ≤ 7,25 e PaCO₂ muito elevada.",
      ],
      targets: [{ moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "VNI/VM na exacerbação." }],
    },
    dx_sibilancia_novo: {
      id: "dx_sibilancia_novo",
      type: "transition",
      title: "SIBILÂNCIA DE NOVO",
      summary: "Sibilância sem asma/DPOC prévios.",
      disposition: "observation",
      exitCriteria: [
        "Considerar EAP ('asma cardíaca' — sibilos cardíacos), broncoespasmo por outra causa, corpo estranho, anafilaxia.",
        "Exames: BNP, ECG, RX, ecocardiograma se suspeita cardíaca.",
      ],
      targets: [],
    },

    q_crepitantes: {
      id: "q_crepitantes",
      type: "decision",
      title: "Congestão cardíaca?",
      question: "Crepitantes bilaterais + JVP elevada + edema de membros?",
      options: [
        { id: "sim", label: "Sim — EAP cardiogênico", next: "dx_eap" },
        { id: "nao", label: "Não", next: "q_pneumonia" },
      ],
    },
    dx_eap: {
      id: "dx_eap",
      type: "transition",
      title: "EAP CARDIOGÊNICO",
      summary: "Congestão pulmonar por falência de VE.",
      disposition: "icu",
      exitCriteria: [
        "Exames: BNP/NT-proBNP, ECG, RX, ecocardiograma urgente, troponina.",
        "Tratamento: VNI (CPAP) precoce; diurético IV; vasodilatador (NTG) se PAS ≥ 110; tratar causa (SCA/arritmia).",
        "Ver o guia de EAP.",
      ],
      targets: [{ moduleId: "edema-agudo-pulmao", label: "Guia de EAP", reason: "Manejo cardiogênico × SARA." }],
    },
    q_pneumonia: {
      id: "q_pneumonia",
      type: "decision",
      title: "Pneumonia?",
      question: "Febre + tosse produtiva + crepitantes localizados?",
      options: [
        { id: "sim", label: "Sim — pneumonia", next: "dx_pneumonia" },
        { id: "nao", label: "Não", next: "q_sara" },
      ],
    },
    dx_pneumonia: {
      id: "dx_pneumonia",
      type: "transition",
      title: "PNEUMONIA",
      summary: "Infecção do parênquima pulmonar.",
      disposition: "observation",
      exitCriteria: [
        "Exames: RX de tórax, culturas/hemoculturas, gasometria, lactato; aplicar CURB-65.",
        "Tratamento: antibiótico empírico precoce conforme foco/gravidade; O₂; avaliar UTI (ATS/IDSA).",
      ],
      targets: [],
    },
    q_sara: {
      id: "q_sara",
      type: "decision",
      title: "SARA?",
      question: "Infiltrado bilateral + P/F < 300 + causa identificável (sepse, aspiração, trauma)?",
      options: [
        { id: "sim", label: "Sim — SARA (Berlim)", next: "dx_sara" },
        { id: "nao", label: "Não", next: "q_hipercapnia" },
      ],
    },
    dx_sara: {
      id: "dx_sara",
      type: "transition",
      title: "SARA (critérios de Berlim)",
      summary: "Lesão inflamatória difusa com hipoxemia refratária.",
      disposition: "icu",
      exitCriteria: [
        "Critérios de Berlim: início < 1 sem, infiltrado bilateral, não explicado por IC, P/F ≤ 300 com PEEP ≥ 5.",
        "Tratamento: ventilação protetora (VC 4–6 mL/kg, Pplat ≤ 30, DP ≤ 15); PEEP titulada; prona se P/F ≤ 150; tratar a causa.",
        "Ver ventilação mecânica.",
      ],
      targets: [{ moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "Estratégia protetora ARDSNet." }],
    },
    q_hipercapnia: {
      id: "q_hipercapnia",
      type: "decision",
      title: "Hipoventilação / hipercapnia?",
      question: "Hipoventilação + hipercapnia sem doença pulmonar clara?",
      options: [
        { id: "sim", label: "Sim", next: "q_causa_hipercapnia" },
        { id: "nao", label: "Não / indefinido", next: "dx_indefinido" },
      ],
    },
    q_causa_hipercapnia: {
      id: "q_causa_hipercapnia",
      type: "decision",
      title: "Causa de hipoventilação?",
      question: "GCS rebaixado, intoxicação ou obesidade mórbida?",
      options: [
        { id: "sim", label: "Sim", next: "dx_hipercapnica" },
        { id: "nao", label: "Não", next: "dx_indefinido" },
      ],
    },
    dx_hipercapnica: {
      id: "dx_hipercapnica",
      type: "transition",
      title: "INSUFICIÊNCIA RESPIRATÓRIA HIPERCÁPNICA",
      summary: "Falência ventilatória (bomba) — drive ou mecânica.",
      disposition: "icu",
      exitCriteria: [
        "Exames: gasometria (PaCO₂ ↑, pH ↓), causa (neuro, drogas, obesidade-hipoventilação, neuromuscular).",
        "Tratamento: VNI se cooperativo e protegendo VA; IOT se rebaixamento/apneia. Reverter causa (naloxona/flumazenil se opioide/BZD).",
      ],
      targets: [{ moduleId: "ventilacao-mecanica", label: "Ventilação mecânica", reason: "VNI/IOT na falência ventilatória." }],
    },
    dx_indefinido: {
      id: "dx_indefinido",
      type: "transition",
      title: "Causa indefinida — investigar",
      summary: "Sem padrão claro — ampliar investigação.",
      disposition: "observation",
      exitCriteria: [
        "Exames: gasometria, ECG, RX, BNP, troponina, D-dímero conforme suspeita; ecocardiograma/POCUS.",
        "Considerar causas mistas, metabólicas (acidose), anemia grave, ansiedade (diagnóstico de exclusão).",
      ],
      targets: [],
    },
  },
};
