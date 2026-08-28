/**
 * ⚠️ IMPORTS DE MOTOR REMOVIDOS EM 2026-08-27, com os arquivos que eles traziam:
 * `rsi-engine`, `tep-engine`, `eclampsia-engine`, `reasoning-engines` (os oito
 * stubs de raciocínio: choque, insuf. respiratória, politrauma, TCE, convulsões,
 * intoxicações, abdome agudo, IRA) e `lib/engine-de-registro`.
 *
 * Todos eram consumidos SÓ por este arquivo, e por nenhuma das 12 entradas que
 * restaram: a busca por cada símbolo devolvia exatamente uma ocorrência, o
 * próprio import. Motor importado e nunca montado é peso que o bundle carrega e
 * que a próxima pessoa lê como se estivesse em uso.
 */
import * as pcrEngine from "./engine";
import * as vasoactiveEngine from "./vasoactive-engine";
import * as electrolyteEngine from "./electrolyte-engine";
import * as aclsRhythmsEngine from "./acls-rhythms-engine";
import * as aclsPharmacologyEngine from "./acls-pharmacology-engine";
import * as aclsBradycardiaEngine from "./acls-bradycardia-engine";
import * as aclsTachycardiaEngine from "./acls-tachycardia-engine";
import * as aclsReversibleCausesEngine from "./acls-reversible-causes-engine";
import * as aclsPostRoscEngine from "./acls-post-rosc-engine";
import * as aclsPregnancyEngine from "./acls-pregnancy-engine";
import * as aclsChokingEngine from "./acls-choking-engine";
import * as clinicalCalculatorsEngine from "./clinical-calculators-engine";
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
    id: "calculadoras-clinicas",
    title: "Calculadoras Clínicas",
    description:
      "Escores e doses",
    route: "/modulos/calculadoras-clinicas",
    engine: clinicalCalculatorsEngine as unknown as ClinicalEngine
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
