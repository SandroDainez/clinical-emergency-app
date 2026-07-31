/**
 * Agrupamento temático dos módulos no hub.
 * `ids`    → todos os módulos do grupo (para cobertura/validação).
 * `subIds` → (opcional) módulos exibidos como sub-cards compactos abaixo do
 *            módulo principal. Não usado atualmente: todos os módulos ACLS são
 *            exibidos como cards completos, iguais aos demais.
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
    ids: ["pcr-adulto", "ritmos-acls", "farmacologia-acls", "bradicardia-acls", "taquicardia-acls", "causas-reversiveis-acls", "pcr-gestacao-acls", "ovace-adulto", "pos-pcr-acls"],
    subIds: ["ritmos-acls", "farmacologia-acls", "bradicardia-acls", "taquicardia-acls", "causas-reversiveis-acls", "pcr-gestacao-acls", "ovace-adulto", "pos-pcr-acls"],
  },
  {
    title: "Choque & hemodinâmica",
    subtitle: "Sepse e suporte vasoativo",
    ids: ["sepse-adulto", "drogas-vasoativas", "correcoes-eletroliticas"],
  },
  {
    title: "Via aérea & ventilação",
    subtitle: "ISR, VM, sedoanalgesia/BNM e edema agudo de pulmão",
    ids: ["isr-rapida", "ventilacao-mecanica", "sedoanalgesia", "edema-agudo-pulmao"],
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
    title: "Cardiovascular & respiratório",
    subtitle: "Síndromes coronarianas e tromboembolia pulmonar",
    ids: ["sindromes-coronarianas", "tep"],
  },
  {
    title: "Obstetrícia",
    subtitle: "Emergências hipertensivas da gestação",
    ids: ["pre-eclampsia"],
  },
  {
    title: "Calculadoras & escores",
    subtitle: "Peso predito, TFG, SOFA, Glasgow, Wells, HEART, NIHSS, RASS e mais",
    ids: ["calculadoras-clinicas"],
  },
  {
    title: "Politrauma & emergências",
    subtitle: "Trauma, TCE, convulsões, intoxicações, choque, insuficiência respiratória e abdome agudo",
    ids: [
      "politrauma",
      "tce",
      "crises-convulsivas",
      "intoxicacoes-exogenas",
      "choque",
      "insuficiencia-respiratoria",
      "abdome-agudo",
    ],
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
