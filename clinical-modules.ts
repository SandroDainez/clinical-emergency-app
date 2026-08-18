import * as pcrEngine from "./engine";
import * as vasoactiveEngine from "./vasoactive-engine";
import { criarEngineDeRegistro } from "./lib/engine-de-registro";
import * as electrolyteEngine from "./electrolyte-engine";
import * as rsiEngine from "./rsi-engine";
import * as aclsRhythmsEngine from "./acls-rhythms-engine";
import * as aclsPharmacologyEngine from "./acls-pharmacology-engine";
import * as aclsBradycardiaEngine from "./acls-bradycardia-engine";
import * as aclsTachycardiaEngine from "./acls-tachycardia-engine";
import * as aclsReversibleCausesEngine from "./acls-reversible-causes-engine";
import * as aclsPostRoscEngine from "./acls-post-rosc-engine";
import * as aclsPregnancyEngine from "./acls-pregnancy-engine";
import * as aclsChokingEngine from "./acls-choking-engine";
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
  iraEngine,
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
    description: "Bundle da 1ª hora",
    route: "/modulos/sepse-adulto",
    engine: criarEngineDeRegistro("sepse_adulto", "Sepse / Choque Séptico")
  },
  {
    id: "drogas-vasoativas",
    title: "Drogas Vasoativas",
    description: "Preparo e taxa",
    route: "/modulos/drogas-vasoativas",
    engine: vasoactiveEngine as ClinicalEngine
  },
  {
    id: "correcoes-eletroliticas",
    title: "Correções eletrolíticas",
    description:
      "Na, K, Ca e Mg",
    route: "/modulos/correcoes-eletroliticas",
    engine: electrolyteEngine as ClinicalEngine
  },
  {
    id: "isr-rapida",
    title: "ISR — Via aérea",
    description: "Drogas e equipamento",
    route: "/modulos/isr-rapida",
    engine: rsiEngine as ClinicalEngine
  },
  {
    id: "edema-agudo-pulmao",
    title: "Edema agudo de pulmão",
    description: "VNI e vasodilatador",
    route: "/modulos/edema-agudo-pulmao",
    engine: criarEngineDeRegistro("edema_agudo_pulmao", "Edema agudo de pulmão")
  },
  {
    id: "cetoacidose-hiperosmolar",
    title: "CAD e estado hiperosmolar",
    description:
      "Hidratação e potássio",
    route: "/modulos/cetoacidose-hiperosmolar",
    engine: criarEngineDeRegistro("cetoacidose_hiperosmolar", "CAD e estado hiperosmolar")
  },
  {
    id: "ventilacao-mecanica",
    title: "Ventilação mecânica",
    description:
      "Metas e PEEP",
    route: "/modulos/ventilacao-mecanica",
    engine: criarEngineDeRegistro("ventilacao_mecanica", "Ventilação mecânica")
  },
  {
    id: "anafilaxia",
    title: "Anafilaxia",
    description:
      "Adrenalina IM",
    route: "/modulos/anafilaxia",
    engine: criarEngineDeRegistro("anafilaxia", "Anafilaxia")
  },
  {
    id: "avc",
    title: "AVC",
    description:
      "Janela e tempos",
    route: "/modulos/avc",
    engine: criarEngineDeRegistro("acidente_vascular_cerebral", "AVC")
  },
  {
    id: "sindromes-coronarianas",
    title: "Síndromes coronarianas",
    description:
      "STEMI e sem supra",
    route: "/modulos/sindromes-coronarianas",
    engine: criarEngineDeRegistro("sindromes_coronarianas", "Síndromes coronarianas")
  },
  {
    id: "ritmos-acls",
    title: "Ritmos de Parada",
    description:
      "Chocável × não chocável",
    route: "/modulos/ritmos-acls",
    engine: aclsRhythmsEngine as ClinicalEngine
  },
  {
    id: "farmacologia-acls",
    title: "Farmacologia no ACLS",
    description:
      "Dose e indicação",
    route: "/modulos/farmacologia-acls",
    engine: aclsPharmacologyEngine as ClinicalEngine
  },
  {
    id: "bradicardia-acls",
    title: "Bradicardia no ACLS",
    description:
      "Atropina, marca-passo",
    route: "/modulos/bradicardia-acls",
    engine: aclsBradycardiaEngine as ClinicalEngine
  },
  {
    id: "taquicardia-acls",
    title: "Taquicardia no ACLS",
    description:
      "QRS estreito × largo",
    route: "/modulos/taquicardia-acls",
    engine: aclsTachycardiaEngine as ClinicalEngine
  },
  {
    id: "causas-reversiveis-acls",
    title: "Causas Reversíveis (Hs e Ts)",
    description:
      "5 Hs e 5 Ts",
    route: "/modulos/causas-reversiveis-acls",
    engine: aclsReversibleCausesEngine as ClinicalEngine
  },
  {
    id: "ovace-adulto",
    title: "Engasgo (OVACE)",
    description:
      "Golpes e compressões",
    route: "/modulos/ovace-adulto",
    engine: aclsChokingEngine as ClinicalEngine
  },
  {
    id: "pcr-gestacao-acls",
    title: "PCR na Gestação",
    description:
      "Deslocamento uterino",
    route: "/modulos/pcr-gestacao-acls",
    engine: aclsPregnancyEngine as ClinicalEngine
  },
  {
    id: "pos-pcr-acls",
    title: "Cuidados Pós-PCR",
    description:
      "Metas e neuroproteção",
    route: "/modulos/pos-pcr-acls",
    engine: aclsPostRoscEngine as ClinicalEngine
  },
  {
    id: "tep",
    title: "Tromboembolia Pulmonar",
    description:
      "Wells e reperfusão",
    route: "/modulos/tep",
    engine: tepEngine as ClinicalEngine
  },
  {
    id: "pre-eclampsia",
    title: "Pré-eclâmpsia / Eclâmpsia",
    description:
      "Sulfato de magnésio",
    route: "/modulos/pre-eclampsia",
    engine: eclampsiaEngine as ClinicalEngine
  },
  {
    id: "sedoanalgesia",
    title: "Sedoanalgesia & BNM",
    description:
      "Sedativos e opioides",
    route: "/modulos/sedoanalgesia",
    engine: sedationEngine as unknown as ClinicalEngine
  },
  {
    id: "calculadoras-clinicas",
    title: "Calculadoras Clínicas",
    description:
      "Escores e doses",
    route: "/modulos/calculadoras-clinicas",
    engine: clinicalCalculatorsEngine as unknown as ClinicalEngine
  },
  {
    id: "politrauma",
    title: "Politrauma",
    description:
      "ATLS, hemorragia, danos",
    route: "/modulos/politrauma",
    engine: politraumaEngine as unknown as ClinicalEngine
  },
  {
    id: "tce",
    title: "TCE — Trauma cranioencefálico",
    description:
      "Glasgow, TC e PIC",
    route: "/modulos/tce",
    engine: tceEngine as unknown as ClinicalEngine
  },
  {
    id: "crises-convulsivas",
    title: "Crises e mal epiléptico",
    description:
      "Por tempo, até refratário",
    route: "/modulos/crises-convulsivas",
    engine: seizureEngine as unknown as ClinicalEngine
  },
  {
    id: "intoxicacoes-exogenas",
    title: "Intoxicações exógenas",
    description:
      "Toxíndromes e antídotos",
    route: "/modulos/intoxicacoes-exogenas",
    engine: poisoningEngine as unknown as ClinicalEngine
  },
  {
    id: "choque",
    title: "Choque",
    description:
      "Diferencial por tipo",
    route: "/modulos/choque",
    engine: shockEngine as unknown as ClinicalEngine
  },
  {
    id: "injuria-renal-aguda",
    title: "Injúria renal aguda",
    description:
      "KDIGO e diurese",
    route: "/modulos/injuria-renal-aguda",
    engine: iraEngine as unknown as ClinicalEngine
  },
  {
    id: "insuficiencia-respiratoria",
    title: "Insuficiência respiratória",
    description:
      "Diferencial e suporte",
    route: "/modulos/insuficiencia-respiratoria",
    engine: dyspneaEngine as unknown as ClinicalEngine
  },
  {
    id: "abdome-agudo",
    title: "Abdome agudo",
    description:
      "Catástrofes e padrão",
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
