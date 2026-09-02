import type { ClinicalTransitionContract } from "./clinical-transitions";

/**
 * Primeiras arestas reais classificadas a partir das árvores atuais.
 *
 * Cada entrada corresponde a um alvo navegável de `disposition: other_module`.
 * Não transforma a navegação ainda; apenas declara se a passagem precisa voltar.
 */
export const CLINICAL_TRANSITION_CONTRACTS: readonly ClinicalTransitionContract[] = [
  {
    id: "ira-abcde-a-isr",
    from: "injuria_renal_aguda",
    to: "isr-rapida",
    trigger: "Via aérea ameaçada ou não protegida na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação da injúria renal após proteger a via aérea",
  },
  {
    id: "ira-abcde-b-vm",
    from: "injuria_renal_aguda",
    to: "ventilacao-mecanica",
    trigger: "Hipoxemia ou esforço respiratório importante na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após sustentar oxigenação e ventilação",
  },
  {
    id: "ira-abcde-b-eap",
    from: "injuria_renal_aguda",
    to: "edema-agudo-pulmao",
    trigger: "Congestão como causa da insuficiência respiratória na IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após estabilizar a congestão",
  },
  {
    id: "ira-abcde-c-choque",
    from: "injuria_renal_aguda",
    to: "choque",
    trigger: "Hipotensão ou má perfusão na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após sustentar perfusão e pressão",
  },
  {
    id: "ira-abcde-c-vasoativos",
    from: "injuria_renal_aguda",
    to: "drogas-vasoativas",
    trigger: "Necessidade de suporte vasoativo na instabilidade associada à IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após iniciar/titular o suporte hemodinâmico",
  },
  {
    id: "ira-abcde-c-bradicardia",
    from: "injuria_renal_aguda",
    to: "bradicardia-acls",
    trigger: "Bradicardia com repercussão na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após tratar o ritmo",
  },
  {
    id: "ira-abcde-c-taquicardia",
    from: "injuria_renal_aguda",
    to: "taquicardia-acls",
    trigger: "Taquicardia com repercussão na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após tratar o ritmo",
  },
  {
    id: "ira-abcde-d-isr",
    from: "injuria_renal_aguda",
    to: "isr-rapida",
    trigger: "Rebaixamento que ameaça proteção da via aérea",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após garantir a via aérea",
  },
  {
    id: "ira-abcde-d-convulsao",
    from: "injuria_renal_aguda",
    to: "crises-convulsivas",
    trigger: "Convulsão em curso ou recente na triagem da IRA",
    mode: "returnable",
    returnLabel: "Voltar à avaliação renal após controlar a crise",
  },
  {
    id: "politrauma-tce",
    from: "politrauma",
    to: "tce",
    trigger: "Alteração neurológica ou trauma cranioencefálico significativo durante avaliação do politrauma",
    mode: "returnable",
    returnLabel: "Voltar ao politrauma após estabilização e definição da conduta neurotraumática",
  },
] as const;
