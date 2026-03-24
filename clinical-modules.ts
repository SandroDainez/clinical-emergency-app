import * as pcrEngine from "./engine";
import * as sepsisEngine from "./sepsis-engine";
import * as vasoactiveEngine from "./vasoactive-engine";
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
  }
];

function getClinicalModules() {
  return CLINICAL_MODULES;
}

function getClinicalModuleById(id: string) {
  return CLINICAL_MODULES.find((module) => module.id === id);
}

export { getClinicalModuleById, getClinicalModules };
