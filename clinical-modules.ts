import * as pcrEngine from "./engine";
import * as sepsisEngine from "./sepsis-engine";
import * as vasoactiveEngine from "./vasoactive-engine";
import * as rsiEngine from "./rsi-engine";
import * as eapEngine from "./eap-engine";
import * as dkaHhsEngine from "./dka-hhs-engine";
import * as ventilationEngine from "./ventilation-engine";
import * as anafilaxiaEngine from "./anafilaxia-engine";
import * as aclsRhythmsEngine from "./acls-rhythms-engine";
import * as aclsPharmacologyEngine from "./acls-pharmacology-engine";
import * as aclsBradycardiaEngine from "./acls-bradycardia-engine";
import * as aclsTachycardiaEngine from "./acls-tachycardia-engine";
import * as aclsReversibleCausesEngine from "./acls-reversible-causes-engine";
import * as aclsPostRoscEngine from "./acls-post-rosc-engine";
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
