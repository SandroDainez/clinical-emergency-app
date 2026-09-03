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
  presentation: "flow" | "reference" | "calculator";
  engine: ClinicalEngine;
};

const CLINICAL_MODULES: ClinicalModule[] = [
  {
    id: "pcr-adulto",
    title: "PCR Adulto",
    description: "ACLS para parada cardiorrespiratória do adulto com loop, pós-ROSC, log e resumo clínico.",
    route: "/modulos/pcr-adulto",
    presentation: "flow",
    engine: pcrEngine as ClinicalEngine
  },
  {
    id: "sepse-adulto",
    title: "Sepse / Choque Séptico",
    description: "Bundle da 1ª hora",
    route: "/modulos/sepse-adulto",
    presentation: "flow",
    engine: criarEngineDeRegistro("sepse_adulto", "Sepse / Choque Séptico")
  },
  {
    id: "drogas-vasoativas",
    title: "Drogas Vasoativas",
    description: "Preparo e taxa",
    route: "/modulos/drogas-vasoativas",
    presentation: "calculator",
    engine: vasoactiveEngine as ClinicalEngine
  },
  {
    id: "correcoes-eletroliticas",
    title: "Correções eletrolíticas",
    description:
      "Na, K, Ca e Mg",
    route: "/modulos/correcoes-eletroliticas",
    presentation: "calculator",
    engine: electrolyteEngine as ClinicalEngine
  },
  {
    id: "isr-rapida",
    title: "ISR — Via aérea",
    description: "Drogas e equipamento",
    route: "/modulos/isr-rapida",
    presentation: "flow",
    engine: rsiEngine as ClinicalEngine
  },
  {
    id: "edema-agudo-pulmao",
    title: "Edema agudo de pulmão",
    description: "VNI e vasodilatador",
    route: "/modulos/edema-agudo-pulmao",
    presentation: "flow",
    engine: criarEngineDeRegistro("edema_agudo_pulmao", "Edema agudo de pulmão")
  },
  {
    id: "cetoacidose-hiperosmolar",
    title: "CAD e estado hiperosmolar",
    description:
      "Hidratação e potássio",
    route: "/modulos/cetoacidose-hiperosmolar",
    presentation: "flow",
    engine: criarEngineDeRegistro("cetoacidose_hiperosmolar", "CAD e estado hiperosmolar")
  },
  {
    id: "ventilacao-mecanica",
    title: "Ventilação mecânica",
    description:
      "Metas e PEEP",
    route: "/modulos/ventilacao-mecanica",
    presentation: "flow",
    engine: criarEngineDeRegistro("ventilacao_mecanica", "Ventilação mecânica")
  },
  {
    id: "anafilaxia",
    title: "Anafilaxia",
    description:
      "Adrenalina IM",
    route: "/modulos/anafilaxia",
    presentation: "flow",
    engine: criarEngineDeRegistro("anafilaxia", "Anafilaxia")
  },
  {
    id: "avc",
    title: "AVC",
    description:
      "Janela e tempos",
    route: "/modulos/avc",
    presentation: "flow",
    engine: criarEngineDeRegistro("acidente_vascular_cerebral", "AVC")
  },
  {
    id: "sindromes-coronarianas",
    title: "Síndromes coronarianas",
    description:
      "STEMI e sem supra",
    route: "/modulos/sindromes-coronarianas",
    presentation: "flow",
    engine: criarEngineDeRegistro("sindromes_coronarianas", "Síndromes coronarianas")
  },
  {
    id: "ritmos-acls",
    title: "Ritmos de Parada",
    description:
      "Chocável × não chocável",
    route: "/modulos/ritmos-acls",
    presentation: "reference",
    engine: aclsRhythmsEngine as ClinicalEngine
  },
  {
    id: "farmacologia-acls",
    title: "Farmacologia no ACLS",
    description:
      "Dose e indicação",
    route: "/modulos/farmacologia-acls",
    presentation: "reference",
    engine: aclsPharmacologyEngine as ClinicalEngine
  },
  {
    id: "bradicardia-acls",
    title: "Bradicardia no ACLS",
    description:
      "Atropina, marca-passo",
    route: "/modulos/bradicardia-acls",
    presentation: "reference",
    engine: aclsBradycardiaEngine as ClinicalEngine
  },
  {
    id: "taquicardia-acls",
    title: "Taquicardia no ACLS",
    description:
      "QRS estreito × largo",
    route: "/modulos/taquicardia-acls",
    presentation: "reference",
    engine: aclsTachycardiaEngine as ClinicalEngine
  },
  {
    id: "causas-reversiveis-acls",
    title: "Causas Reversíveis (Hs e Ts)",
    description:
      "5 Hs e 5 Ts",
    route: "/modulos/causas-reversiveis-acls",
    presentation: "reference",
    engine: aclsReversibleCausesEngine as ClinicalEngine
  },
  {
    id: "ovace-adulto",
    title: "Engasgo (OVACE)",
    description:
      "Golpes e compressões",
    route: "/modulos/ovace-adulto",
    presentation: "reference",
    engine: aclsChokingEngine as ClinicalEngine
  },
  {
    id: "pcr-gestacao-acls",
    title: "PCR na Gestação",
    description:
      "Deslocamento uterino",
    route: "/modulos/pcr-gestacao-acls",
    presentation: "reference",
    engine: aclsPregnancyEngine as ClinicalEngine
  },
  {
    id: "pos-pcr-acls",
    title: "Cuidados Pós-PCR",
    description:
      "Metas e neuroproteção",
    route: "/modulos/pos-pcr-acls",
    presentation: "reference",
    engine: aclsPostRoscEngine as ClinicalEngine
  },
  {
    id: "tep",
    title: "Tromboembolia Pulmonar",
    description:
      "Wells e reperfusão",
    route: "/modulos/tep",
    presentation: "flow",
    engine: tepEngine as ClinicalEngine
  },
  {
    id: "pre-eclampsia",
    title: "Pré-eclâmpsia / Eclâmpsia",
    description:
      "Sulfato de magnésio",
    route: "/modulos/pre-eclampsia",
    presentation: "flow",
    engine: eclampsiaEngine as ClinicalEngine
  },
  {
    id: "sedoanalgesia",
    title: "Sedoanalgesia & BNM",
    description:
      "Sedativos e opioides",
    route: "/modulos/sedoanalgesia",
    presentation: "calculator",
    engine: sedationEngine as unknown as ClinicalEngine
  },
  {
    id: "calculadoras-clinicas",
    title: "Calculadoras Clínicas",
    description:
      "Escores e doses",
    route: "/modulos/calculadoras-clinicas",
    presentation: "calculator",
    engine: clinicalCalculatorsEngine as unknown as ClinicalEngine
  },
  {
    id: "politrauma",
    title: "Politrauma",
    description:
      "ATLS, hemorragia, danos",
    route: "/modulos/politrauma",
    presentation: "flow",
    engine: politraumaEngine as unknown as ClinicalEngine
  },
  {
    id: "tce",
    title: "TCE — Trauma cranioencefálico",
    description:
      "Glasgow, TC e PIC",
    route: "/modulos/tce",
    presentation: "flow",
    engine: tceEngine as unknown as ClinicalEngine
  },
  {
    id: "crises-convulsivas",
    title: "Crises e mal epiléptico",
    description:
      "Por tempo, até refratário",
    route: "/modulos/crises-convulsivas",
    presentation: "flow",
    engine: seizureEngine as unknown as ClinicalEngine
  },
  {
    id: "intoxicacoes-exogenas",
    title: "Intoxicações exógenas",
    description:
      "Toxíndromes e antídotos",
    route: "/modulos/intoxicacoes-exogenas",
    presentation: "flow",
    engine: poisoningEngine as unknown as ClinicalEngine
  },
  {
    id: "choque",
    title: "Choque",
    description:
      "Diferencial por tipo",
    route: "/modulos/choque",
    presentation: "flow",
    engine: shockEngine as unknown as ClinicalEngine
  },
  {
    id: "injuria-renal-aguda",
    title: "Injúria renal aguda",
    description:
      "KDIGO e diurese",
    route: "/modulos/injuria-renal-aguda",
    presentation: "flow",
    engine: iraEngine as unknown as ClinicalEngine
  },
  {
    id: "insuficiencia-respiratoria",
    title: "Insuficiência respiratória",
    description:
      "Diferencial e suporte",
    route: "/modulos/insuficiencia-respiratoria",
    presentation: "flow",
    engine: dyspneaEngine as unknown as ClinicalEngine
  },
  {
    id: "abdome-agudo",
    title: "Abdome agudo",
    description:
      "Catástrofes e padrão",
    route: "/modulos/abdome-agudo",
    presentation: "flow",
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
