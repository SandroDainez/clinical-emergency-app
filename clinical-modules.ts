import * as pcrEngine from "./engine";
import * as sepsisEngine from "./sepsis-engine";
import * as vasoactiveEngine from "./vasoactive-engine";
import * as electrolyteEngine from "./electrolyte-engine";
import * as rsiEngine from "./rsi-engine";
import * as eapEngine from "./eap-engine";
import * as dkaHhsEngine from "./dka-hhs-engine";
import * as ventilationEngine from "./ventilation-engine";
import * as anafilaxiaEngine from "./anafilaxia-engine";
import * as avcEngine from "./avc-engine";
import * as coronaryEngine from "./coronary-syndromes-engine";
import * as aclsRhythmsEngine from "./acls-rhythms-engine";
import * as aclsPharmacologyEngine from "./acls-pharmacology-engine";
import * as aclsBradycardiaEngine from "./acls-bradycardia-engine";
import * as aclsTachycardiaEngine from "./acls-tachycardia-engine";
import * as aclsReversibleCausesEngine from "./acls-reversible-causes-engine";
import * as aclsPostRoscEngine from "./acls-post-rosc-engine";
import * as tepEngine from "./tep-engine";
import * as eclampsiaEngine from "./eclampsia-engine";
import * as sedationEngine from "./sedation-engine";
import * as clinicalCalculatorsEngine from "./clinical-calculators-engine";
import {
  shockEngine,
  dyspneaEngine,
  politraumaEngine,
  tceEngine,
  seizureEngine,
  poisoningEngine,
  acuteAbdomenEngine,
} from "./reasoning-engines";
import type { ClinicalEngine } from "./clinical-engine";

type ClinicalModule = {
  id: string;
  title: string;
  description: string;
  route: string;
  engine: ClinicalEngine;
};

const CLINICAL_MODULES: ClinicalModule[] = [
  {
    id: "pcr-adulto",
    title: "PCR Adulto",
    description: "ACLS para parada cardiorrespiratória do adulto com loop, pós-ROSC, log e resumo clínico.",
    route: "/modulos/pcr-adulto",
    engine: pcrEngine as ClinicalEngine
  },
  {
    id: "sepse-adulto",
    title: "Sepse / Choque Séptico",
    description: "Bundle inicial de sepse do adulto com decisões clínicas, fluidos, antimicrobianos e vasopressor.",
    route: "/modulos/sepse-adulto",
    engine: sepsisEngine as ClinicalEngine
  },
  {
    id: "drogas-vasoativas",
    title: "Drogas Vasoativas",
    description: "Cálculo prático de preparo e taxa para noradrenalina, adrenalina, vasopressina, dopamina e dobutamina.",
    route: "/modulos/drogas-vasoativas",
    engine: vasoactiveEngine as ClinicalEngine
  },
  {
    id: "correcoes-eletroliticas",
    title: "Correções eletrolíticas",
    description:
      "Calculadoras práticas para distúrbios de sódio, potássio, cálcio, magnésio, fósforo e cloro com preparo e velocidade.",
    route: "/modulos/correcoes-eletroliticas",
    engine: electrolyteEngine as ClinicalEngine
  },
  {
    id: "isr-rapida",
    title: "ISR — Via aérea",
    description: "Intubação em sequência rápida: indicações, drogas, equipamento e passo a passo.",
    route: "/modulos/isr-rapida",
    engine: rsiEngine as ClinicalEngine
  },
  {
    id: "edema-agudo-pulmao",
    title: "Edema agudo de pulmão",
    description: "Roteiro resumido: clínica, tratamento imediato e destino — ciclo curto.",
    route: "/modulos/edema-agudo-pulmao",
    engine: eapEngine as ClinicalEngine
  },
  {
    id: "cetoacidose-hiperosmolar",
    title: "CAD e estado hiperosmolar",
    description:
      "Cetoacidose diabética vs estado hiperosmolar: classificação, volume, insulina, potássio e monitorização.",
    route: "/modulos/cetoacidose-hiperosmolar",
    engine: dkaHhsEngine as ClinicalEngine
  },
  {
    id: "ventilacao-mecanica",
    title: "Ventilação mecânica",
    description:
      "Cenário clínico, peso e parâmetros atuais; metas de Vt/PEEP e passo a passo no ventilador em linguagem simples.",
    route: "/modulos/ventilacao-mecanica",
    engine: ventilationEngine as ClinicalEngine
  },
  {
    id: "anafilaxia",
    title: "Anafilaxia",
    description:
      "Exposição, manifestações, choque; dose de adrenalina IM por peso e passo a passo terapêutico.",
    route: "/modulos/anafilaxia",
    engine: anafilaxiaEngine as ClinicalEngine
  },
  {
    id: "avc",
    title: "AVC",
    description:
      "Fluxo de AVC isquêmico e hemorrágico com tempos críticos, NIHSS, imagem, reperfusão, prescrição e destino.",
    route: "/modulos/avc",
    engine: avcEngine as ClinicalEngine
  },
  {
    id: "sindromes-coronarianas",
    title: "Síndromes coronarianas",
    description:
      "Dor torácica, STEMI, NSTEMI, angina instável e angina estável com ECG, troponina, scores, reperfusão, medicações e destino.",
    route: "/modulos/sindromes-coronarianas",
    engine: coronaryEngine as ClinicalEngine
  },
  {
    id: "ritmos-acls",
    title: "Ritmos de Parada",
    description:
      "FV · TV sem pulso · AESP · Assistolia — reconhecimento e conduta imediata durante PCR.",
    route: "/modulos/ritmos-acls",
    engine: aclsRhythmsEngine as ClinicalEngine
  },
  {
    id: "farmacologia-acls",
    title: "Farmacologia no ACLS",
    description:
      "Consulta rápida de drogas de emergência: dose, indicação e momento de uso — epinefrina, amiodarona, adenosina, atropina e dopamina.",
    route: "/modulos/farmacologia-acls",
    engine: aclsPharmacologyEngine as ClinicalEngine
  },
  {
    id: "bradicardia-acls",
    title: "Bradicardia no ACLS",
    description:
      "Definição, sinais de instabilidade, fluxo de decisão clínica e bloqueios AV — do reconhecimento à conduta imediata.",
    route: "/modulos/bradicardia-acls",
    engine: aclsBradycardiaEngine as ClinicalEngine
  },
  {
    id: "taquicardia-acls",
    title: "Taquicardia no ACLS",
    description:
      "Estável vs instável, QRS estreito vs largo: cardioversão ou fármaco — decisão rápida com conduta por tipo de ritmo.",
    route: "/modulos/taquicardia-acls",
    engine: aclsTachycardiaEngine as ClinicalEngine
  },
  {
    id: "causas-reversiveis-acls",
    title: "Causas Reversíveis (Hs e Ts)",
    description:
      "Checklist mental das 5 Hs e 5 Ts durante PCR: reconhecimento rápido e intervenção imediata para cada causa.",
    route: "/modulos/causas-reversiveis-acls",
    engine: aclsReversibleCausesEngine as ClinicalEngine
  },
  {
    id: "pos-pcr-acls",
    title: "Cuidados Pós-PCR",
    description:
      "Metas e condutas após ROSC: oxigenação, ventilação, hemodinâmica, controle de temperatura e avaliação neurológica.",
    route: "/modulos/pos-pcr-acls",
    engine: aclsPostRoscEngine as ClinicalEngine
  },
  {
    id: "tep",
    title: "Tromboembolia Pulmonar",
    description:
      "TEP do diagnóstico à reperfusão: estabilidade, Wells, D-dímero/AngioTC, estratificação de risco (VD + biomarcadores + sPESI), anticoagulação e trombólise.",
    route: "/modulos/tep",
    engine: tepEngine as ClinicalEngine
  },
  {
    id: "pre-eclampsia",
    title: "Pré-eclâmpsia / Eclâmpsia",
    description:
      "Emergência hipertensiva da gestação: convulsão, sulfato de magnésio (Pritchard/Zuspan) com tríade de segurança, crise hipertensiva, momento do parto e pós-parto.",
    route: "/modulos/pre-eclampsia",
    engine: eclampsiaEngine as ClinicalEngine
  },
  {
    id: "sedoanalgesia",
    title: "Sedoanalgesia & BNM",
    description:
      "Calculadora de sedativos, opioides e bloqueadores neuromusculares: diluição, concentração, dose e taxa (mL/h) ou bolus, com faixas por RASS e alertas de segurança.",
    route: "/modulos/sedoanalgesia",
    engine: sedationEngine as unknown as ClinicalEngine
  },
  {
    id: "calculadoras-clinicas",
    title: "Calculadoras Clínicas",
    description:
      "Escores e calculadoras à beira-leito: peso predito (VM), clearance/TFG, osmolalidade, ânion gap, Glasgow, qSOFA, SOFA, Wells (TEP), CURB-65 e HEART — com interpretação e fonte.",
    route: "/modulos/calculadoras-clinicas",
    engine: clinicalCalculatorsEngine as unknown as ClinicalEngine
  },
  {
    id: "politrauma",
    title: "Politrauma",
    description:
      "Atendimento inicial ao traumatizado grave (ATLS): controle da hemorragia exsanguinante, XABCDE, reanimação hemostática 1:1:1, ácido tranexâmico e damage control.",
    route: "/modulos/politrauma",
    engine: politraumaEngine as unknown as ClinicalEngine
  },
  {
    id: "tce",
    title: "TCE — Trauma cranioencefálico",
    description:
      "Classificação por Glasgow, indicação de tomografia, prevenção da lesão secundária, reversão de anticoagulação e controle da hipertensão intracraniana.",
    route: "/modulos/tce",
    engine: tceEngine as unknown as ClinicalEngine
  },
  {
    id: "crises-convulsivas",
    title: "Crises convulsivas e mal epiléptico",
    description:
      "Protocolo por tempo: benzodiazepínico em dose plena, antiepiléptico IV de 2ª linha e anestésico com IOT e EEG no mal epiléptico refratário, com doses por peso.",
    route: "/modulos/crises-convulsivas",
    engine: seizureEngine as unknown as ClinicalEngine
  },
  {
    id: "intoxicacoes-exogenas",
    title: "Intoxicações exógenas",
    description:
      "Síndromes tóxicas (toxidromes), descontaminação, antídotos específicos por tóxico com dose e via, e indicações de hemodiálise.",
    route: "/modulos/intoxicacoes-exogenas",
    engine: poisoningEngine as unknown as ClinicalEngine
  },
  {
    id: "choque",
    title: "Choque",
    description:
      "Reconhecimento e diferencial do choque — hipovolêmico, obstrutivo, cardiogênico e distributivo — com mecanismo, sinais confirmatórios e conduta imediata.",
    route: "/modulos/choque",
    engine: shockEngine as unknown as ClinicalEngine
  },
  {
    id: "insuficiencia-respiratoria",
    title: "Insuficiência respiratória",
    description:
      "Diferencial da insuficiência respiratória aguda com exames prioritários, tratamento imediato e critérios de intubação.",
    route: "/modulos/insuficiencia-respiratoria",
    engine: dyspneaEngine as unknown as ClinicalEngine
  },
  {
    id: "abdome-agudo",
    title: "Abdome agudo",
    description:
      "Exclusão de catástrofes abdominais, classificação do padrão (inflamatório, obstrutivo, perfurativo, vascular) e definição do destino cirúrgico.",
    route: "/modulos/abdome-agudo",
    engine: acuteAbdomenEngine as unknown as ClinicalEngine
  },
];

/** Ordem alfabética pelo título (pt), para orientação consistente no hub e noutras listas. */
function sortModulesByTitle(modules: ClinicalModule[]): ClinicalModule[] {
  return [...modules].sort((a, b) =>
    a.title.localeCompare(b.title, "pt", { sensitivity: "base" })
  );
}

function getClinicalModules() {
  return sortModulesByTitle(CLINICAL_MODULES);
}

function getClinicalModuleById(id: string) {
  return CLINICAL_MODULES.find((module) => module.id === id);
}

export { getClinicalModuleById, getClinicalModules };
