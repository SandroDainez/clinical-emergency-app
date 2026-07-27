import type { DecisionTreeDefinition } from "./core/decision-tree/types";

/**
 * Algoritmo ACLS de Taquicardia no adulto com pulso (AHA 2025).
 * Fluxo interativo passo-a-passo conduzido como um instrutor de ACLS.
 *
 * Energias de cardioversão sincronizada:
 * - QRS estreito regular (TSV/flutter): 50–100 J
 * - QRS estreito irregular (FA): ≥ 200 J bifásico (AHA 2025)
 * - QRS largo regular (TV monomórfica): 100 J
 * - QRS largo irregular (TV polimórfica): desfibrilação NÃO sincronizada
 * Adenosina: 6 mg IV rápido + flush → 12 mg → 12 mg.
 */
export const tachycardiaDecisionTree: DecisionTreeDefinition = {
  id: "acls_tachycardia_2025",
  version: "2025.1",
  label: "Taquicardia ACLS",
  entryNodeId: "entry",
  nodes: {
    entry: {
      id: "entry",
      type: "action",
      title: "Reconhecimento e monitorização inicial",
      summary: "Taquicardia com pulso = FC ≥ 150 bpm tipicamente sintomática. Prepare o paciente antes de decidir.",
      actions: [
        "Identificar taquicardia no monitor (FC ≥ 150 bpm) e correlacionar com sintomas.",
        "Manter via aérea pérvia; O₂ se SpO₂ < 94% ou desconforto respiratório.",
        "Monitor cardíaco, PA, oximetria e acesso IV.",
        "ECG de 12 derivações se disponível (não atrasar o tratamento do paciente instável).",
      ],
      next: "assess_stability",
    },

    assess_stability: {
      id: "assess_stability",
      type: "decision",
      title: "A taquicardia está causando instabilidade?",
      question: "Há sinais de instabilidade ATRIBUÍVEIS à taquicardia?",
      summary: "A instabilidade precisa ser causada pela arritmia — não pela doença de base.",
      evidence: [
        "Hipotensão / sinais de choque (má perfusão, palidez, sudorese).",
        "Alteração aguda do estado mental.",
        "Desconforto torácico isquêmico em curso.",
        "Insuficiência cardíaca aguda (congestão, dispneia, EAP).",
      ],
      options: [
        { id: "instavel", label: "Sim — paciente INSTÁVEL", next: "unstable_cardioversion" },
        { id: "estavel", label: "Não — paciente estável", next: "assess_qrs" },
      ],
    },

    unstable_cardioversion: {
      id: "unstable_cardioversion",
      type: "action",
      title: "Cardioversão sincronizada IMEDIATA",
      summary: "Taquicardia instável com pulso → restaurar o ritmo sem demora.",
      actions: [
        "Cardioversão SINCRONIZADA. Sedação/analgesia se o paciente estiver consciente e o tempo permitir.",
        "Energia por tipo: estreito regular 50–100 J · estreito irregular (FA) ≥ 200 J bifásico · largo regular 100 J.",
        "QRS largo irregular (TV polimórfica): desfibrilação NÃO sincronizada (alta energia).",
        "Se QRS estreito e regular, considerar adenosina 6 mg IV enquanto prepara o cardioversor — não atrasar a cardioversão.",
      ],
      next: "unstable_disposition",
    },

    unstable_disposition: {
      id: "unstable_disposition",
      type: "transition",
      title: "Reavaliar e estabilizar — UTI",
      summary: "Após a cardioversão, reavaliar ritmo, pulso e perfusão.",
      disposition: "icu",
      exitCriteria: [
        "Reavaliar ritmo e pulso imediatamente após cada choque.",
        "Se perder o pulso → iniciar o algoritmo de PCR.",
        "Cardiologia + UTI; identificar e tratar a causa da arritmia.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Se o paciente perder o pulso durante ou após a cardioversão.",
        },
      ],
    },

    assess_qrs: {
      id: "assess_qrs",
      type: "decision",
      title: "Largura do QRS",
      question: "O QRS é largo (≥ 0,12 s)?",
      summary: "A largura do QRS separa os ramos de conduta no paciente estável.",
      evidence: [
        "QRS estreito (< 0,12 s): geralmente supraventricular.",
        "QRS largo (≥ 0,12 s): tratar como TV até prova em contrário.",
      ],
      options: [
        { id: "largo", label: "QRS LARGO (≥ 0,12 s)", next: "wide_regularity" },
        { id: "estreito", label: "QRS estreito (< 0,12 s)", next: "narrow_regularity" },
      ],
    },

    narrow_regularity: {
      id: "narrow_regularity",
      type: "decision",
      title: "QRS estreito — ritmo regular ou irregular?",
      question: "O ritmo é regular ou irregular?",
      evidence: [
        "Regular: TSV (TRNAV, TRAV), flutter, taquicardia sinusal.",
        "Irregular: fibrilação atrial, flutter com condução variável, TAM.",
      ],
      options: [
        { id: "regular", label: "Regular", next: "narrow_regular" },
        { id: "irregular", label: "Irregular", next: "narrow_irregular" },
      ],
    },

    narrow_regular: {
      id: "narrow_regular",
      type: "action",
      title: "QRS estreito regular — manobras vagais e adenosina",
      summary: "Provável TSV por reentrada.",
      actions: [
        "Manobras vagais (Valsalva modificada ou massagem do seio carotídeo).",
        "Adenosina 6 mg IV rápido + flush de 20 mL. Se não reverter: 12 mg; pode repetir 12 mg.",
        "Sem resposta: controle de frequência com diltiazem 15–20 mg IV ou metoprolol 5 mg IV.",
        "Consultar especialista. Se instabilizar → cardioversão sincronizada 50–100 J.",
      ],
      next: "stable_reassess",
    },

    narrow_irregular: {
      id: "narrow_irregular",
      type: "action",
      title: "QRS estreito irregular — provável FA / flutter / TAM",
      summary: "Foco em controle de frequência e risco tromboembólico.",
      actions: [
        "Controle de frequência: diltiazem 15–20 mg IV OU metoprolol 5 mg IV.",
        "Considerar anticoagulação se FA > 48 h ou duração indeterminada.",
        "Reversão química/elétrica conforme avaliação da cardiologia.",
        "⚠️ Evitar bloqueadores do nó AV em FA com pré-excitação (WPW) — risco de FV. Se instabilizar → cardioversão FA ≥ 200 J / flutter 50–100 J.",
      ],
      next: "stable_reassess",
    },

    wide_regularity: {
      id: "wide_regularity",
      type: "decision",
      title: "QRS largo — ritmo regular ou irregular?",
      question: "O ritmo é regular ou irregular?",
      evidence: [
        "Regular: TV monomórfica (mais comum) ou TSV com aberrância.",
        "Irregular: TV polimórfica, Torsades de Pointes ou FA com pré-excitação (WPW).",
      ],
      options: [
        { id: "regular", label: "Regular", next: "wide_regular" },
        { id: "irregular", label: "Irregular", next: "wide_irregular" },
      ],
    },

    wide_regular: {
      id: "wide_regular",
      type: "action",
      title: "QRS largo regular — tratar como TV monomórfica",
      summary: "QRS largo + taquicardia = TV até prova em contrário.",
      actions: [
        "Antiarrítmico: amiodarona 150 mg IV em 10 min (manutenção 1 mg/min por 6 h). Alternativas: procainamida ou sotalol.",
        "Adenosina pode ser tentada SOMENTE se regular e monomórfico, com suspeita de TSV com aberrância.",
        "⚠️ NÃO usar bloqueadores do nó AV (verapamil/diltiazem) em TV — risco de colapso.",
        "Consultar especialista. Se instabilizar → cardioversão sincronizada 100 J.",
      ],
      next: "stable_reassess",
    },

    wide_irregular: {
      id: "wide_irregular",
      type: "action",
      title: "QRS largo irregular — atenção máxima",
      summary: "TV polimórfica, Torsades ou FA com WPW. Alto risco de degeneração para FV.",
      actions: [
        "Torsades de Pointes (QT longo): sulfato de magnésio 1–2 g IV em bolus lento.",
        "FA com pré-excitação (WPW): evitar bloqueadores do nó AV; considerar amiodarona ou cardioversão.",
        "TV polimórfica instável ou sem pulso: desfibrilação NÃO sincronizada (algoritmo de FV/PCR).",
        "Investigar e corrigir a causa: QT longo, isquemia, distúrbios eletrolíticos, fármacos.",
      ],
      next: "stable_reassess",
    },

    stable_reassess: {
      id: "stable_reassess",
      type: "transition",
      title: "Reavaliar resposta e acionar especialista",
      summary: "Monitorar a resposta ao tratamento e definir destino.",
      disposition: "observation",
      exitCriteria: [
        "Reavaliar ritmo, FC, PA e sintomas após cada intervenção.",
        "Cardiologia para conduta definitiva (ablação, anticoagulação, antiarrítmico de manutenção).",
        "Se a qualquer momento o paciente instabilizar → cardioversão sincronizada.",
        "Se perder o pulso → algoritmo de PCR.",
      ],
      targets: [
        {
          moduleId: "pcr-adulto",
          label: "Abrir guia de PCR",
          reason: "Se o paciente perder o pulso (TV/FV sem pulso).",
        },
      ],
    },
  },
};
