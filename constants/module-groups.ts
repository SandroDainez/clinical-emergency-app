/**
 * Agrupamento temático dos módulos no hub.
 * `ids`    → todos os módulos do grupo (para cobertura/validação).
 * `subIds` → módulos secundários/referência, exibidos como sub-cards abaixo
 *            do(s) módulo(s) principal(is) dentro do grupo.
 */
export const MODULE_GROUPS: readonly {
  title: string;
  subtitle: string;
  ids: readonly string[];
  subIds?: readonly string[];
}[] = [
  {
    title: "Reanimação",
    subtitle: "Parada cardiorrespiratória e ACLS",
    ids: ["pcr-adulto", "ritmos-acls", "farmacologia-acls", "bradicardia-acls", "taquicardia-acls", "causas-reversiveis-acls", "pos-pcr-acls"],
    subIds: ["ritmos-acls", "farmacologia-acls", "bradicardia-acls", "taquicardia-acls", "causas-reversiveis-acls", "pos-pcr-acls"],
  },
  {
    title: "Choque & hemodinâmica",
    subtitle: "Sepse e suporte vasoativo",
    ids: ["sepse-adulto", "drogas-vasoativas", "correcoes-eletroliticas"],
  },
  {
    title: "Via aérea & ventilação",
    subtitle: "ISR, VM e edema agudo de pulmão",
    ids: ["isr-rapida", "ventilacao-mecanica", "edema-agudo-pulmao"],
  },
  {
    title: "Metabólico & alergia",
    subtitle: "CAD/EHH e anafilaxia",
    ids: ["cetoacidose-hiperosmolar", "anafilaxia"],
  },
  {
    title: "Neurologia aguda",
    subtitle: "AVC, reperfusão e neuroemergência",
    ids: ["avc"],
  },
  {
    title: "Cardiologia",
    subtitle: "Dor torácica, reperfusão e DAC crônica",
    ids: ["sindromes-coronarianas"],
  },
] as const;

/** Em __DEV__, avisa se módulos e grupos deixarem de estar alinhados. */
export function assertModuleGroupsCoverage(moduleIds: readonly string[]): void {
  if (!__DEV__) return;
  const all = new Set(moduleIds);
  const inGroups = new Set(MODULE_GROUPS.flatMap((g) => [...g.ids]));
  for (const id of all) {
    if (!inGroups.has(id)) {
      console.warn(`[module-groups] Módulo sem grupo temático: ${id}`);
    }
  }
  for (const id of inGroups) {
    if (!all.has(id)) {
      console.warn(`[module-groups] Grupo referencia id inexistente: ${id}`);
    }
  }
}
