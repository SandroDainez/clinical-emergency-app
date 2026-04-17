/** Rótulo curto por módulo (área clínica) — filtros, badges e catálogo. */
export const MODULE_AREA_LABELS: Record<string, string> = {
  "pcr-adulto": "ACLS",
  "sepse-adulto": "Sepse",
  "drogas-vasoativas": "Vasoativos",
  "correcoes-eletroliticas": "Eletrólitos",
  "isr-rapida": "ISR",
  "edema-agudo-pulmao": "EAP",
  "cetoacidose-hiperosmolar": "CAD / EHH",
  "ventilacao-mecanica": "VM",
  anafilaxia: "Anafilaxia",
  "ritmos-acls": "ACLS",
  "farmacologia-acls": "ACLS",
  "bradicardia-acls": "ACLS",
  "taquicardia-acls": "ACLS",
  "causas-reversiveis-acls": "ACLS",
  "pos-pcr-acls": "ACLS",
};

export function getModuleAreaLabel(moduleId: string): string {
  return MODULE_AREA_LABELS[moduleId] ?? "Módulo";
}

/** Largura mínima (px) para grelha em duas colunas nos cartões de módulo. */
export const MODULE_GRID_TWO_COL_MIN = 400;

export { assertModuleGroupsCoverage, MODULE_GROUPS } from "./module-groups";
