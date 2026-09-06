/**
 * CONTEÚDO DO MÓDULO HIC · Hemorragia intracerebral espontânea (AHA/ASA 2022).
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ ISTO É UM CATÁLOGO, ⛔ NÃO UM ALGORITMO (PD-36) ─────────────────────
 *
 * A fonte é um **conjunto de recomendações COR/LOE sobrepostas**, ⛔ não uma
 * árvore. Um mesmo paciente corresponde a várias. Este arquivo as apresenta
 * agrupadas por tema clínico, ⛔ e ⛔ não as encadeia num veredito. É a mesma
 * postura da Superfície F (reperfusão isquêmica).
 *
 * ── ⚠️⚠️ RASTREABILIDADE (E-30) ─────────────────────────────────────────────
 *
 * Cada recomendação carrega `slot` (H-nn de `fontes.ts`), `localizacao` (§ +
 * página impressa), `cor`, `loe` e o `verbatim` em inglês. ⛔ Referência
 * bibliográfica ⛔ não é fonte; texto é. A `formulacao` em PT-BR é apresentação —
 * nasce da regra, ⛔ não é verbatim, e é traduzida no render por `tr()`.
 *
 * ⚠️ **CONFERÊNCIA CLÍNICA DO AUTOR: PENDENTE.** O verbatim está transcrito; o
 * autor ⛔ ainda ⛔ não conferiu contra o PDF na tela (mesmo estado do isquêmico
 * ao nascer).
 */

import { FONTE_HIC } from "./fontes";

/** ⚠️ A classe de recomendação, como a fonte a publica. ⛔ Não inventar níveis. */
export type ClasseCOR =
  | "COR 1"
  | "COR 2a"
  | "COR 2b"
  | "COR 3: No Benefit"
  | "COR 3: Harm";

/** ⚠️ O nível de evidência, como a fonte o publica. */
export type NivelLOE = "A" | "B-R" | "B-NR" | "C-LD" | "C-EO";

/**
 * ⚠️⚠️ A DIREÇÃO DA RECOMENDAÇÃO — para a tela poder mostrar cor/ícone sem
 * reinterpretar o texto. ⛔ Derivada da classe, ⛔ não uma segunda verdade:
 * `COR 3` é sempre `contra`; o resto é `a_favor` ou `incerto` conforme o texto.
 */
export type Direcao = "a_favor" | "incerto" | "contra";

/** Uma recomendação do catálogo, com rastreabilidade completa (contrato §6.11). */
export type Recomendacao = {
  readonly id: string;
  /** ⚠️ Slot de fonte (H-nn). ⛔ Onde mora o verbatim. */
  readonly slot: string;
  readonly cor: ClasseCOR;
  readonly loe: NivelLOE;
  readonly direcao: Direcao;
  /** ⚠️ § + página impressa. */
  readonly localizacao: string;
  /** ⚠️ Verbatim em inglês — a evidência auditável. ⛔ Não se traduz (§6.14). */
  readonly verbatim: string;
  /** ⚠️ A frase clínica em PT-BR — apresentação, traduzida no render. */
  readonly formulacao: string;
  /** ⚠️ População, quando a recomendação a restringe. */
  readonly populacao?: string;
};

/** Um tema clínico do catálogo. */
export type TemaHIC = {
  readonly id: string;
  readonly titulo: string;
  readonly resumo: string;
  readonly recomendacoes: readonly Recomendacao[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * A · PRESSÃO ARTERIAL (H-01)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_PA: TemaHIC = {
  id: "pressao_arterial",
  titulo: "Pressão arterial aguda",
  resumo:
    "Alvo 140 mmHg mantendo faixa 130 a 150 na HIC leve a moderada com PAS 150 a 220. Descer abaixo de 130 é potencialmente danoso.",
  recomendacoes: [
    {
      id: "pa_alvo",
      slot: "H-01",
      cor: "COR 2b",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§5.1 Acute BP Lowering, rec. 3, p. e297",
      verbatim:
        "In patients with spontaneous ICH of mild to moderate severity presenting with SBP between 150 and 220 mm Hg, acute lowering of SBP to a target of 140 mm Hg with the goal of maintaining in the range of 130 to 150 mm Hg is safe and may be reasonable for improving functional outcomes.",
      formulacao:
        "Na HIC leve a moderada com PAS entre 150 e 220 mmHg, baixar a PAS para um alvo de 140 mmHg, mantendo a faixa de 130 a 150 mmHg, é seguro e pode ser razoável.",
      populacao: "HIC leve a moderada, PAS 150 a 220 mmHg",
    },
    {
      id: "pa_titulacao",
      slot: "H-01",
      cor: "COR 2a",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§5.1 Acute BP Lowering, rec. 1, p. e297",
      verbatim:
        "In patients with spontaneous ICH requiring acute BP lowering, careful titration to ensure continuous smooth and sustained control of BP, avoiding peaks and large variability in SBP, can be beneficial for improving functional outcomes.",
      formulacao:
        "Titular com cuidado para um controle contínuo, suave e sustentado, evitando picos e grande variabilidade da PAS.",
    },
    {
      id: "pa_precocidade",
      slot: "H-01",
      cor: "COR 2a",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.1 Acute BP Lowering, rec. 2, p. e297",
      verbatim:
        "In patients with spontaneous ICH in whom acute BP lowering is considered, initiating treatment within 2 hours of ICH onset and reaching target within 1 hour can be beneficial to reduce the risk of HE and improve functional outcome.",
      formulacao:
        "Iniciar o tratamento dentro de 2 horas do início e atingir o alvo dentro de 1 hora pode reduzir a expansão do hematoma.",
    },
    {
      id: "pa_grande_grave",
      slot: "H-01",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§5.1 Acute BP Lowering, rec. 4, p. e298",
      verbatim:
        "In patients with spontaneous ICH presenting with large or severe ICH or those requiring surgical decompression, the safety and efficacy of intensive BP lowering are not well established.",
      formulacao:
        "Na HIC grande ou grave, ou que exige descompressão cirúrgica, a segurança e a eficácia do controle intensivo da PA não estão bem estabelecidas.",
      populacao: "HIC grande/grave ou com descompressão cirúrgica",
    },
    {
      id: "pa_abaixo_130",
      slot: "H-01",
      cor: "COR 3: Harm",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§5.1 Acute BP Lowering, rec. 5, p. e298",
      verbatim:
        "In patients with spontaneous ICH of mild to moderate severity presenting with SBP >150 mm Hg, acute lowering of SBP to <130 mm Hg is potentially harmful.",
      formulacao:
        "Na HIC leve a moderada com PAS acima de 150 mmHg, baixar a PAS para menos de 130 mmHg é potencialmente danoso.",
      populacao: "HIC leve a moderada, PAS acima de 150 mmHg",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * B · REVERSÃO DE ANTICOAGULAÇÃO (H-02) — princípio + por agente
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * ⚠️⚠️ A REVERSÃO É POR AGENTE, ⛔ e ⛔ não uma conduta única. Cada anticoagulante
 * tem seu agente de reversão, sua classe e — para VKA — sua dose por INR. Isto é
 * um mapa de decisão da própria fonte (Figura 2), ⛔ não um algoritmo do app.
 */
export type EsquemaDeReversao = {
  readonly id: string;
  readonly agente: string;
  readonly slot: string;
  /** ⚠️ A conduta principal (agente de reversão + classe). */
  readonly conduta: string;
  /** ⚠️ Dose, quando a fonte a publica (Figura 2). ⛔ Vazio quando não há número. */
  readonly dose?: string;
  /** ⚠️ Alternativa quando o agente específico não está disponível. */
  readonly alternativa?: string;
  readonly cor: ClasseCOR;
  readonly loe: NivelLOE;
  readonly verbatim: string;
  readonly formulacao: string;
};

export const REVERSAO_POR_AGENTE: readonly EsquemaDeReversao[] = [
  {
    id: "vka",
    agente: "Antagonista da vitamina K (varfarina)",
    slot: "H-02",
    conduta: "4F-PCC (preferível a plasma) + vitamina K IV",
    dose:
      "INR ≥2,0: 4F-PCC 25 a 50 UI/kg (Classe 1). INR 1,3 a 1,9: 4F-PCC 10 a 20 UI/kg (Classe 2b). Vitamina K IV em ambos (Classe 1).",
    cor: "COR 1",
    loe: "B-R",
    verbatim:
      "In patients with VKA-associated spontaneous ICH and INR ≥2.0, 4-factor (4-F) prothrombin complex concentrate (PCC) is recommended in preference to fresh-frozen plasma (FFP) to achieve rapid correction of INR and limit HE.",
    formulacao:
      "Na HIC por varfarina com INR ≥2,0, usar 4F-PCC em vez de plasma, seguido de vitamina K IV. A dose de 4F-PCC varia com o INR (Figura 2).",
  },
  {
    id: "dabigatrana",
    agente: "Dabigatrana (inibidor direto da trombina)",
    slot: "H-02",
    conduta: "Idarucizumabe",
    alternativa:
      "Se idarucizumabe indisponível: aPCC ou PCCs (Classe 2b), e/ou terapia de substituição renal (Classe 2b).",
    cor: "COR 2a",
    loe: "B-NR",
    verbatim:
      "In patients with dabigatran-associated spontaneous ICH, idarucizumab is reasonable to reverse the anticoagulant effect of dabigatran.",
    formulacao:
      "Na HIC por dabigatrana, idarucizumabe é razoável para reverter o efeito anticoagulante.",
  },
  {
    id: "inibidor_xa",
    agente: "Inibidor do fator Xa (rivaroxabana, apixabana, edoxabana)",
    slot: "H-02",
    conduta: "Andexanet alfa",
    alternativa: "Se andexanet indisponível: 4F-PCC ou aPCC (Classe 2b).",
    cor: "COR 2a",
    loe: "B-NR",
    verbatim:
      "In patients with direct factor Xa inhibitor–associated spontaneous ICH, andexanet alfa is reasonable to reverse the anticoagulant effect of factor Xa inhibitors.",
    formulacao:
      "Na HIC por inibidor do fator Xa, andexanet alfa é razoável para reverter o efeito anticoagulante.",
  },
  {
    id: "doac_recente",
    agente: "DOAC ingerido nas últimas horas",
    slot: "H-02",
    conduta: "Carvão ativado (se ingestão recente)",
    dose: "Se DOAC ingerido há menos de 2 h (eficácia potencial até 8 h).",
    cor: "COR 2b",
    loe: "C-LD",
    verbatim:
      "In patients with dabigatran- or factor Xa inhibitor–associated spontaneous ICH, when the DOAC agent was taken within the previous few hours, activated charcoal may be reasonable to prevent absorption of the DOAC.",
    formulacao:
      "Quando o DOAC foi tomado nas últimas horas, carvão ativado pode ser razoável para prevenir a absorção.",
  },
  {
    id: "hnf",
    agente: "Heparina não fracionada (HNF)",
    slot: "H-02",
    conduta: "Protamina IV",
    dose: "Não exceder 50 mg/10 min (texto de suporte).",
    cor: "COR 2a",
    loe: "C-LD",
    verbatim:
      "In patients with unfractionated heparin (UFH)–associated spontaneous ICH, intravenous protamine is reasonable to reverse the anticoagulant effect of heparin.",
    formulacao:
      "Na HIC por heparina não fracionada, protamina IV é razoável para reverter o efeito.",
  },
  {
    id: "hbpm",
    agente: "Heparina de baixo peso molecular (HBPM)",
    slot: "H-02",
    conduta: "Protamina IV (reversão parcial)",
    cor: "COR 2b",
    loe: "C-LD",
    verbatim:
      "In patients with low-molecular-weight heparin (LMWH)–associated spontaneous ICH, intravenous protamine may be considered to partially reverse the anticoagulant effect of heparin.",
    formulacao:
      "Na HIC por HBPM, protamina IV pode ser considerada para reverter parcialmente o efeito.",
  },
];

const TEMA_REVERSAO: TemaHIC = {
  id: "reversao",
  titulo: "Reversão de anticoagulação",
  resumo:
    "Suspender o anticoagulante imediatamente e reverter o mais rápido possível. O agente de reversão depende do anticoagulante em uso.",
  recomendacoes: [
    {
      id: "reversao_principio",
      slot: "H-02",
      cor: "COR 1",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.2.1, rec. 1, p. e300",
      verbatim:
        "In patients with anticoagulant-associated spontaneous ICH, anticoagulation should be discontinued immediately and rapid reversal of anticoagulation should be performed as soon as possible after diagnosis of spontaneous ICH to improve survival.",
      formulacao:
        "Na HIC associada a anticoagulante, suspender o anticoagulante imediatamente e reverter o mais rápido possível, para melhorar a sobrevida.",
      populacao: "HIC associada a anticoagulante",
    },
    {
      id: "vitk_apos_fator",
      slot: "H-02",
      cor: "COR 1",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.2.1, rec. 3, p. e300",
      verbatim:
        "In patients with VKA-associated spontaneous ICH, intravenous vitamin K should be administered directly after coagulation factor replacement (PCC or other) to prevent later increase in INR and subsequent HE.",
      formulacao:
        "Na HIC por varfarina, administrar vitamina K IV logo após a reposição de fatores (PCC), para evitar reelevação do INR.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * C · ANTIPLAQUETÁRIO (H-03)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_ANTIPLAQUETARIO: TemaHIC = {
  id: "antiplaquetario",
  titulo: "Uso de antiplaquetário",
  resumo:
    "Transfusão de plaquetas na HIC por aspirina fora de neurocirurgia de emergência é potencialmente danosa.",
  recomendacoes: [
    {
      id: "plaqueta_neurocirurgia",
      slot: "H-03",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§5.2.2, rec. 1, p. e304",
      verbatim:
        "For patients with spontaneous ICH being treated with aspirin and who require emergency neurosurgery, platelet transfusion might be considered to reduce postoperative bleeding and mortality.",
      formulacao:
        "Na HIC por aspirina que exige neurocirurgia de emergência, transfusão de plaquetas pode ser considerada.",
      populacao: "HIC por aspirina COM neurocirurgia de emergência",
    },
    {
      id: "plaqueta_sem_cirurgia",
      slot: "H-03",
      cor: "COR 3: Harm",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§5.2.2, rec. 3, p. e304",
      verbatim:
        "For patients with spontaneous ICH being treated with aspirin and not scheduled for emergency surgery, platelet transfusions are potentially harmful and should not be administered.",
      formulacao:
        "Na HIC por aspirina SEM cirurgia de emergência programada, transfusão de plaquetas é potencialmente danosa e não deve ser feita.",
      populacao: "HIC por aspirina SEM cirurgia de emergência",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * D · PIC, EDEMA, OSMOTERAPIA, DVE, CORTICOIDE (H-08)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_PIC: TemaHIC = {
  id: "pic_edema",
  titulo: "PIC, edema e drenagem",
  resumo:
    "Drenagem ventricular para hidrocefalia com rebaixamento. Osmoterapia em bolus para reduzir PIC transitoriamente. Corticoide não deve ser usado.",
  recomendacoes: [
    {
      id: "dve_hidrocefalia",
      slot: "H-08",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§5.5, rec. 1, p. e316",
      verbatim:
        "In patients with spontaneous ICH or IVH and hydrocephalus that is contributing to decreased level of consciousness, ventricular drainage should be performed to reduce mortality.",
      formulacao:
        "Na HIC ou HIV com hidrocefalia contribuindo para rebaixamento de consciência, fazer drenagem ventricular para reduzir mortalidade.",
    },
    {
      id: "osmo_bolus",
      slot: "H-08",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§5.5, rec. 4, p. e316",
      verbatim:
        "In patients with spontaneous ICH, bolus hyperosmolar therapy may be considered for transiently reducing ICP.",
      formulacao:
        "Osmoterapia em bolus pode ser considerada para reduzir a PIC transitoriamente.",
    },
    {
      id: "osmo_profilatica",
      slot: "H-08",
      cor: "COR 2b",
      loe: "B-NR",
      direcao: "incerto",
      localizacao: "§5.5, rec. 3, p. e316",
      verbatim:
        "In patients with spontaneous ICH, the efficacy of early prophylactic hyperosmolar therapy for improving outcomes is not well established.",
      formulacao:
        "A osmoterapia profilática precoce não tem eficácia bem estabelecida.",
    },
    {
      id: "pic_monitor",
      slot: "H-08",
      cor: "COR 2b",
      loe: "B-NR",
      direcao: "incerto",
      localizacao: "§5.5, rec. 2, p. e316",
      verbatim:
        "In patients with moderate to severe spontaneous ICH or IVH with a reduced level of consciousness, ICP monitoring and treatment might be considered to reduce mortality and improve outcomes.",
      formulacao:
        "Na HIC ou HIV moderada a grave com rebaixamento, monitorização e tratamento da PIC podem ser considerados.",
    },
    {
      id: "corticoide",
      slot: "H-08",
      cor: "COR 3: No Benefit",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§5.5, rec. 5, p. e316",
      verbatim:
        "In patients with spontaneous ICH, corticosteroids should not be administered for treatment of elevated ICP.",
      formulacao:
        "Corticoide não deve ser administrado para tratar PIC elevada na HIC.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * E · CIRURGIA (H-10, H-11, H-12)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_CIRURGIA: TemaHIC = {
  id: "cirurgia",
  titulo: "Cirurgia",
  resumo:
    "Cerebelar com deterioração, compressão de tronco/hidrocefalia ou volume ≥15 mL: remoção cirúrgica imediata (COR 1). Supratentorial e HIV têm indicações mais fracas.",
  recomendacoes: [
    {
      id: "cerebelar",
      slot: "H-11",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§6.1.4, rec. 1, p. e323",
      verbatim:
        "For patients with cerebellar ICH who are deteriorating neurologically, have brainstem compression and/or hydrocephalus from ventricular obstruction, or have cerebellar ICH volume ≥15 mL, immediate surgical removal of the hemorrhage with or without EVD is recommended in preference to medical management alone to reduce mortality.",
      formulacao:
        "Na HIC cerebelar com deterioração neurológica, compressão de tronco/hidrocefalia por obstrução ventricular, OU volume ≥15 mL: remoção cirúrgica imediata (com ou sem DVE) em vez de manejo clínico isolado.",
      populacao: "HIC cerebelar",
    },
    {
      id: "hiv_dve",
      slot: "H-12",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§6.1.2, rec. 1, p. e320",
      verbatim:
        "For patients with spontaneous ICH, large IVH, and impaired level of consciousness, EVD is recommended in preference to medical management alone to reduce mortality.",
      formulacao:
        "Na HIC com grande hemorragia intraventricular e rebaixamento, DVE em vez de manejo clínico isolado.",
      populacao: "HIC com grande HIV e rebaixamento",
    },
    {
      id: "mis_supratentorial",
      slot: "H-10",
      cor: "COR 2a",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§6.1.1, rec. 1, p. e318",
      verbatim:
        "For patients with supratentorial ICH of >20- to 30-mL volume with GCS scores in the moderate range (5–12), minimally invasive hematoma evacuation with endoscopic or stereotactic aspiration with or without thrombolytic use can be useful to reduce mortality compared with medical management alone.",
      formulacao:
        "Na HIC supratentorial de >20 a 30 mL com Glasgow 5 a 12, evacuação minimamente invasiva (endoscópica/estereotáxica) pode ser útil para reduzir mortalidade.",
      populacao: "HIC supratentorial >20 a 30 mL, Glasgow 5 a 12",
    },
    {
      id: "craniotomia_deterioro",
      slot: "H-10",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§6.1.3, rec. 2, p. e322",
      verbatim:
        "In patients with supratentorial ICH who are deteriorating, craniotomy for hematoma evacuation might be considered as a lifesaving measure.",
      formulacao:
        "Na HIC supratentorial em deterioração, craniotomia para evacuação pode ser considerada como medida de salvamento.",
    },
    {
      id: "craniectomia",
      slot: "H-10",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§6.2, rec. 1, p. e324",
      verbatim:
        "In patients with supratentorial ICH who are in a coma, have large hematomas with significant midline shift, or have elevated ICP refractory to medical management, decompressive craniectomy with or without hematoma evacuation may be considered to reduce mortality.",
      formulacao:
        "Na HIC supratentorial em coma, com grande desvio de linha média ou PIC refratária, craniectomia descompressiva pode ser considerada para reduzir mortalidade.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * F · CONVULSÃO (H-07)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_CONVULSAO: TemaHIC = {
  id: "convulsao",
  titulo: "Convulsões",
  resumo:
    "Tratar convulsão clínica ou eletrográfica confirmada. Profilaxia antiepiléptica sem crise não beneficia.",
  recomendacoes: [
    {
      id: "crise_clinica",
      slot: "H-07",
      cor: "COR 1",
      loe: "C-EO",
      direcao: "a_favor",
      localizacao: "§5.4, rec. 2, p. e315",
      verbatim:
        "In patients with spontaneous ICH and clinical seizures, antiseizure drugs are recommended to improve functional outcomes and prevent brain injury from prolonged recurrent seizures.",
      formulacao:
        "Na HIC com convulsão clínica, usar antiepiléptico.",
    },
    {
      id: "crise_eletrografica",
      slot: "H-07",
      cor: "COR 1",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.4, rec. 1, p. e315",
      verbatim:
        "In patients with spontaneous ICH, impaired consciousness, and confirmed electrographic seizures, antiseizure drugs should be administered to reduce morbidity.",
      formulacao:
        "Na HIC com rebaixamento e convulsão eletrográfica confirmada, administrar antiepiléptico.",
    },
    {
      id: "profilaxia",
      slot: "H-07",
      cor: "COR 3: No Benefit",
      loe: "B-NR",
      direcao: "contra",
      localizacao: "§5.4, rec. 4, p. e315",
      verbatim:
        "In patients with spontaneous ICH without evidence of seizures, prophylactic antiseizure medication is not beneficial to improve functional outcomes, long-term seizure control, or mortality.",
      formulacao:
        "Na HIC sem evidência de convulsão, antiepiléptico profilático não beneficia.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * G · SUPORTE — glicemia, temperatura, TEV (H-05, H-06, H-09)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_SUPORTE: TemaHIC = {
  id: "suporte",
  titulo: "Suporte clínico",
  resumo:
    "Glicemia, temperatura e profilaxia de TEV. Compressão pneumática intermitente desde o diagnóstico; meias de compressão isoladas não beneficiam.",
  recomendacoes: [
    {
      id: "glicemia_hipo",
      slot: "H-05",
      cor: "COR 1",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.3.5, rec. 2, p. e313",
      verbatim:
        "In patients with spontaneous ICH, treating hypoglycemia (<40–60 mg/dL, 2.2–3.3 mmol/L) is recommended to reduce mortality.",
      formulacao:
        "Tratar hipoglicemia (<40 a 60 mg/dL) para reduzir mortalidade.",
    },
    {
      id: "glicemia_hiper",
      slot: "H-05",
      cor: "COR 2a",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§5.3.5, rec. 3, p. e313",
      verbatim:
        "In patients with spontaneous ICH, treating moderate to severe hyperglycemia (>180–200 mg/dL, >10.0–11.1 mmol/L) is reasonable to improve outcomes.",
      formulacao:
        "Tratar hiperglicemia moderada a grave (>180 a 200 mg/dL) é razoável.",
    },
    {
      id: "temperatura",
      slot: "H-06",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§5.3.6, rec. 1, p. e314",
      verbatim:
        "In patients with spontaneous ICH, pharmacologically treating an elevated temperature may be reasonable to improve functional outcomes.",
      formulacao:
        "Tratar farmacologicamente a temperatura elevada pode ser razoável.",
    },
    {
      id: "tev_cpi",
      slot: "H-09",
      cor: "COR 1",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§5.3.3, rec. 1, p. e310",
      verbatim:
        "In nonambulatory patients with spontaneous ICH, intermittent pneumatic compression (IPC) starting on the day of diagnosis is recommended for DVT (DVT and pulmonary embolism [PE]) prophylaxis.",
      formulacao:
        "No paciente não deambulante, compressão pneumática intermitente desde o dia do diagnóstico, para profilaxia de TEV.",
    },
    {
      id: "tev_heparina",
      slot: "H-09",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§5.3.3, rec. 3, p. e310",
      verbatim:
        "In nonambulatory patients with spontaneous ICH, initiating low-dose UFH or LMWH prophylaxis at 24 to 48 hours from ICH onset may be reasonable to optimize the benefits of preventing thrombosis relative to the risk of HE.",
      formulacao:
        "Heparina profilática em dose baixa 24 a 48 horas após o início pode ser razoável.",
    },
    {
      id: "tev_meias",
      slot: "H-09",
      cor: "COR 3: No Benefit",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§5.3.3, rec. 4, p. e310",
      verbatim:
        "In nonambulatory patients with spontaneous ICH, graduated compression stockings of knee-high or thigh-high length alone are not beneficial for VTE prophylaxis.",
      formulacao:
        "Meias de compressão graduada isoladas não beneficiam a profilaxia de TEV.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * H · HEMOSTÁTICOS GERAIS (H-04)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_HEMOSTATICOS: TemaHIC = {
  id: "hemostaticos",
  titulo: "Hemostáticos gerais",
  resumo:
    "Nem fator VIIa recombinante nem ácido tranexâmico têm eficácia estabelecida na HIC.",
  recomendacoes: [
    {
      id: "rfviia",
      slot: "H-04",
      cor: "COR 2b",
      loe: "B-R",
      direcao: "incerto",
      localizacao: "§5.2.3, rec. 1, p. e305",
      verbatim:
        "In patients with spontaneous ICH (with or without the spot sign), the effectiveness of recombinant factor VIIa to improve functional outcome is unclear.",
      formulacao:
        "A eficácia do fator VIIa recombinante na HIC não está clara.",
    },
    {
      id: "txa",
      slot: "H-04",
      cor: "COR 2b",
      loe: "B-R",
      direcao: "incerto",
      localizacao: "§5.2.3, rec. 2, p. e305",
      verbatim:
        "In patients with spontaneous ICH (with or without the spot sign, black hole sign, or blend sign), the effectiveness of TXA to improve functional outcome is not well established.",
      formulacao:
        "A eficácia do ácido tranexâmico na HIC não está bem estabelecida.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * I · DESTINO E PREVENÇÃO SECUNDÁRIA (H-13, H-14, H-15)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_DESTINO: TemaHIC = {
  id: "destino_prevencao",
  titulo: "Destino e prevenção secundária",
  resumo:
    "Unidade especializada com equipe multidisciplinar. Estabilizar antes de transferir. Alvo pressórico de longo prazo PAS 130 / PAD 80.",
  recomendacoes: [
    {
      id: "unidade",
      slot: "H-13",
      cor: "COR 1",
      loe: "A",
      direcao: "a_favor",
      localizacao: "§5.3.1, rec. 1, p. e306",
      verbatim:
        "In patients with spontaneous ICH, provision of care in a specialized inpatient (eg, stroke) unit with a multidisciplinary team is recommended to improve outcomes and reduce mortality.",
      formulacao:
        "Cuidado em unidade especializada (ex.: unidade de AVC) com equipe multidisciplinar, para melhorar desfechos.",
    },
    {
      id: "estabilizar_transferir",
      slot: "H-13",
      cor: "COR 1",
      loe: "C-EO",
      direcao: "a_favor",
      localizacao: "§5.3.1, rec. 5, p. e306",
      verbatim:
        "In hospitalized patients with spontaneous ICH who require hospital transfer but do not have adequate airway protection, cannot support adequate gas exchange, and/or do not have a stable hemodynamic profile, appropriate life-sustaining therapies should be initiated before transportation to prevent acute medical decompensation in transport.",
      formulacao:
        "Se precisa transferir mas não tem via aérea protegida, troca gasosa adequada ou hemodinâmica estável: iniciar as medidas de suporte antes de transportar.",
    },
    {
      id: "pa_longo_prazo",
      slot: "H-14",
      cor: "COR 2a",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§9.1.2, rec. 2, p. e332",
      verbatim:
        "In patients with spontaneous ICH, it is reasonable to lower BP to an SBP of 130 mm Hg and diastolic BP (DBP) of 80 mm Hg for long-term management to prevent hemorrhage recurrence.",
      formulacao:
        "Para prevenção de recorrência, alvo de longo prazo PAS 130 mmHg e PAD 80 mmHg.",
    },
    {
      id: "reanticoag",
      slot: "H-14",
      cor: "COR 2b",
      loe: "C-LD",
      direcao: "incerto",
      localizacao: "§9.1.3, rec. 4, p. e333",
      verbatim:
        "In patients with AF and spontaneous ICH in whom the decision is made to restart anticoagulation, initiation of anticoagulation at ≈7 to 8 weeks after ICH may be considered after weighing specific patient characteristics to optimize the balance of risks and benefits.",
      formulacao:
        "Na fibrilação atrial, se for reanticoagular, iniciar por volta de 7 a 8 semanas após a HIC pode ser considerado.",
      populacao: "HIC com fibrilação atrial",
    },
    {
      id: "escore_nao_limita",
      slot: "H-15",
      cor: "COR 3: No Benefit",
      loe: "B-NR",
      direcao: "contra",
      localizacao: "§7.1, rec. 3, p. e325",
      verbatim:
        "In patients with spontaneous ICH, a baseline severity score should not be used as the sole basis for restricting life-sustaining treatment or limiting life-sustaining treatment.",
      formulacao:
        "O escore de gravidade não deve ser o único fundamento para limitar suporte de vida.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * O CATÁLOGO
 * ────────────────────────────────────────────────────────────────────────── */

export const TEMAS_HIC: readonly TemaHIC[] = [
  TEMA_PA,
  TEMA_REVERSAO,
  TEMA_ANTIPLAQUETARIO,
  TEMA_PIC,
  TEMA_CIRURGIA,
  TEMA_CONVULSAO,
  TEMA_SUPORTE,
  TEMA_HEMOSTATICOS,
  TEMA_DESTINO,
] as const;

/** ⚠️ A citação da fonte, para o rodapé de rastreabilidade da tela. */
export const CITACAO_HIC = FONTE_HIC.citacao;

/**
 * ⚠️ AVISO OBRIGATÓRIO DE ESCOPO — a mesma honestidade do beco anterior (E-09).
 * Este módulo é catálogo de recomendações, ⛔ não substitui julgamento clínico.
 */
export const AVISO_HIC =
  "Catálogo de recomendações da diretriz de HIC. A decisão final é do profissional.";
