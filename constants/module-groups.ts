/**
 * Agrupamento temático (metadados). O catálogo na UI usa lista plana + filtros;
 * estes grupos servem a documentação e validação em desenvolvimento.
 */
export const MODULE_GROUPS: readonly { title: string; subtitle: string; ids: readonly string[] }[] = [
  {
    title: "Reanimação",
    subtitle: "Parada cardiorrespiratória e ACLS",
    ids: ["pcr-adulto"],
  },
  {
    title: "Choque & hemodinâmica",
    subtitle: "Sepse e suporte vasoativo",
    ids: ["sepse-adulto", "drogas-vasoativas"],
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
