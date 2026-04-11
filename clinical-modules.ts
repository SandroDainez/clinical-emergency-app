import * as pcrEngine from "./engine";
import * as sepsisEngine from "./sepsis-engine";
import * as vasoactiveEngine from "./vasoactive-engine";
import * as rsiEngine from "./rsi-engine";
import * as eapEngine from "./eap-engine";
import * as dkaHhsEngine from "./dka-hhs-engine";
import * as ventilationEngine from "./ventilation-engine";
import * as anafilaxiaEngine from "./anafilaxia-engine";
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
  }
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
