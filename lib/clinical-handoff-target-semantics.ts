export type ClinicalHandoffContextTargetSemantic = "reference" | "adjunctive_module";

export type ClinicalHandoffContextTargetContract = {
  id: string;
  fromProtocolId: string;
  fromNodeId: string;
  targetModuleId: string;
  semantic: ClinicalHandoffContextTargetSemantic;
  rationale: string;
};

/**
 * Targets que aparecem DENTRO de um nó `other_module`, mas NÃO são o destino
 * canônico daquele handoff.
 *
 * O destino real é derivado de `CLINICAL_TRANSITION_CONTRACTS`. Esta lista
 * existe apenas para os links contextuais adicionais que acompanham a
 * transferência e não devem ser confundidos com uma segunda aresta de handoff.
 */
export const CLINICAL_HANDOFF_CONTEXT_TARGETS: readonly ClinicalHandoffContextTargetContract[] = [
  {
    id: "politrauma-damage-control-choque-contexto",
    fromProtocolId: "politrauma",
    fromNodeId: "damage_control",
    targetModuleId: "choque",
    semantic: "adjunctive_module",
    rationale: "O destino terminal é centro cirúrgico/angioembolização; o módulo de choque apenas apoia o perfil e suporte hemodinâmico durante o controle da fonte.",
  },
  {
    id: "politrauma-damage-control-vasoativos-contexto",
    fromProtocolId: "politrauma",
    fromNodeId: "damage_control",
    targetModuleId: "drogas-vasoativas",
    semantic: "adjunctive_module",
    rationale: "O destino terminal permanece o controle definitivo da hemorragia; vasoativos são suporte paralelo após reposição apropriada.",
  },
  {
    id: "tce-neurocirurgia-politrauma-contexto",
    fromProtocolId: "tce",
    fromNodeId: "neurocirurgia",
    targetModuleId: "politrauma",
    semantic: "adjunctive_module",
    rationale: "A transferência terminal é para neurocirurgia; o módulo de politrauma permanece disponível para lesões associadas sem substituir o handoff neurocirúrgico.",
  },
] as const;
