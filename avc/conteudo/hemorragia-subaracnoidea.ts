/**
 * CONTEÚDO DO MÓDULO HSA · Hemorragia subaracnóidea aneurismática (AHA/ASA 2023).
 *
 * ⛔ Dados puros. ⛔ Nenhum React, ⛔ nenhuma decisão de tela.
 *
 * ── ⚠️⚠️ CATÁLOGO, ⛔ NÃO ALGORITMO (PD-36) — mesma postura da HIC ────────────
 *
 * Recomendações COR/LOE sobrepostas, agrupadas por tema. Cada uma carrega `slot`
 * (S-nn de `fontes.ts`), `localizacao`, `cor`, `loe` e `verbatim` em inglês
 * (E-30). A `formulacao` PT-BR é apresentação, traduzida no render.
 *
 * ⚠️ **CONFERÊNCIA CLÍNICA DO AUTOR: PENDENTE.**
 *
 * ── ⚠️⚠️ DUAS CORREÇÕES QUE O VERBATIM IMPÔS SOBRE A SÍNTESE ─────────────────
 *
 *   · nimodipino é **"60 mg 6×/dia"** (texto de suporte §8.3); os **"21 dias"**
 *     ⛔ NÃO são número desta guideline — vêm do ensaio de 1983/bula. Por isso a
 *     duração ⛔ não aparece como número da fonte aqui.
 *   · antifibrinolítico de rotina é **COR 3: No benefit, LOE A** — apesar do ULTRA.
 */

import { FONTE_HSA } from "./fontes";
import type { ClasseCOR, Direcao, NivelLOE, Recomendacao } from "./hemorragia-intracerebral";

export type { ClasseCOR, Direcao, NivelLOE, Recomendacao } from "./hemorragia-intracerebral";

/** Um tema clínico do catálogo de HSA. */
export type TemaHSA = {
  readonly id: string;
  readonly titulo: string;
  readonly resumo: string;
  readonly recomendacoes: readonly Recomendacao[];
};

/* ────────────────────────────────────────────────────────────────────────────
 * A · RESSANGRAMENTO (S-01)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_RESSANGRAMENTO: TemaHSA = {
  id: "ressangramento",
  titulo: "Prevenção de ressangramento",
  resumo:
    "Controle de PA com medicação de ação curta até o aneurisma ser tratado. Reversão de anticoagulante. Antifibrinolítico de rotina não é útil.",
  recomendacoes: [
    {
      id: "pa_curta",
      slot: "S-01",
      cor: "COR 1",
      loe: "C-EO",
      direcao: "a_favor",
      localizacao: "§6, rec. 1, p. e326",
      verbatim:
        "In patients with aSAH and unsecured aneurysm, frequent blood pressure (BP) monitoring and BP control with short-acting medication(s) is recommended to avoid severe hypotension, hypertension, and BP variability.",
      formulacao:
        "Com aneurisma ainda não tratado, monitorar a PA de perto e controlá-la com medicação de ação curta, evitando hipotensão, hipertensão e variabilidade.",
      populacao: "HSA com aneurisma não tratado",
    },
    {
      id: "reversao",
      slot: "S-01",
      cor: "COR 1",
      loe: "C-EO",
      direcao: "a_favor",
      localizacao: "§6, rec. 2, p. e326",
      verbatim:
        "In patients with aSAH who are receiving anticoagulants, emergency anticoagulation reversal with appropriate reversal agents should be performed to prevent rebleeding.",
      formulacao:
        "No paciente anticoagulado, reverter a anticoagulação em emergência com o agente apropriado, para prevenir ressangramento.",
    },
    {
      id: "antifibrinolitico",
      slot: "S-01",
      cor: "COR 3: No Benefit",
      loe: "A",
      direcao: "contra",
      localizacao: "§6, rec. 3, p. e326",
      verbatim:
        "In patients with aSAH, routine use of antifibrinolytic therapy is not useful to improve functional outcome.",
      formulacao:
        "O uso de rotina de antifibrinolítico não é útil para melhorar o desfecho funcional.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * B · TRATAMENTO DO ANEURISMA (S-02) — timing e modalidade
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_ANEURISMA: TemaHSA = {
  id: "aneurisma",
  titulo: "Tratamento do aneurisma",
  resumo:
    "Tratar o mais cedo possível, preferencialmente em até 24 horas. Obliteração completa quando factível. A modalidade (coil x clipagem) depende da população.",
  recomendacoes: [
    {
      id: "timing_24h",
      slot: "S-02",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§7, rec. 1, p. e327",
      verbatim:
        "For patients with aSAH, surgical or endovascular treatment of the ruptured aneurysm should be performed as early as feasible after presentation, preferably within 24 hours of onset, to improve outcome.",
      formulacao:
        "Tratar o aneurisma roto (cirúrgico ou endovascular) o mais cedo possível, preferencialmente em até 24 horas do início.",
    },
    {
      id: "obliteracao",
      slot: "S-02",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§7, rec. 2, p. e327",
      verbatim:
        "For patients with aSAH, complete obliteration of the ruptured aneurysm is indicated whenever feasible to reduce the risk of rebleeding and retreatment.",
      formulacao:
        "Obliteração completa do aneurisma roto sempre que factível, para reduzir ressangramento e retratamento.",
    },
    {
      id: "coil_posterior",
      slot: "S-02",
      cor: "COR 1",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§7, rec. 4, p. e327",
      verbatim:
        "For patients with aSAH from ruptured aneurysms of the posterior circulation that are amenable to coiling, coiling is indicated in preference to clipping to improve outcome.",
      formulacao:
        "Em aneurisma roto da circulação posterior passível de coil, preferir coil à clipagem.",
      populacao: "Aneurisma de circulação posterior",
    },
    {
      id: "coil_anterior_good",
      slot: "S-02",
      cor: "COR 1",
      loe: "A",
      direcao: "a_favor",
      localizacao: "§7, rec. 9, p. e327",
      verbatim:
        "For patients with good-grade aSAH from ruptured aneurysms of the anterior circulation equally suitable for both primary coiling and clipping, primary coiling is recommended in preference to clipping to improve 1-year functional outcome.",
      formulacao:
        "Em HSA de bom grau, aneurisma da circulação anterior igualmente elegível para coil ou clipagem: preferir coil.",
      populacao: "HSA bom grau, circulação anterior, elegível para ambos",
    },
    {
      id: "evacuacao_hematoma",
      slot: "S-02",
      cor: "COR 1",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§7, rec. 5, p. e327",
      verbatim:
        "For patients with aSAH deemed salvageable with depressed level of consciousness due to large intraparenchymal hematoma, emergency clot evacuation should be performed to reduce mortality.",
      formulacao:
        "No paciente recuperável com rebaixamento por grande hematoma intraparenquimatoso, evacuação de emergência do coágulo para reduzir mortalidade.",
    },
    {
      id: "stent_agudo",
      slot: "S-02",
      cor: "COR 3: Harm",
      loe: "B-NR",
      direcao: "contra",
      localizacao: "§7, rec. 13, p. e327",
      verbatim:
        "For patients with aSAH from ruptured saccular aneurysms amenable to either primary coiling or clipping, stents or flow diverters should not be used to avoid higher risk of complications.",
      formulacao:
        "Em aneurisma sacular roto tratável por coil ou clipagem, stents ou desviadores de fluxo não devem ser usados.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * C · VASOESPASMO E DCI (S-03) — nimodipino, euvolemia, resgate
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_VASOESPASMO: TemaHSA = {
  id: "vasoespasmo",
  titulo: "Vasoespasmo e isquemia cerebral tardia (DCI)",
  resumo:
    "Nimodipino enteral precoce (COR 1). Manter euvolemia. Estatina e magnésio de rotina não são recomendados. Aumento hemodinâmico profilático é danoso.",
  recomendacoes: [
    {
      id: "nimodipino",
      slot: "S-03",
      cor: "COR 1",
      loe: "A",
      direcao: "a_favor",
      localizacao: "§8.3, rec. 1, p. e339 (dose in supportive text, p. e340)",
      verbatim:
        "In patients with aSAH, early initiation of enteral nimodipine is beneficial in preventing DCI and improving functional outcomes. [Supportive text: \"Continued enteral administration at a dose of 60 mg 6 times a day can be beneficial...\"]",
      formulacao:
        "Iniciar nimodipino enteral precoce (60 mg, 6 vezes ao dia — texto de suporte) para prevenir DCI e melhorar o desfecho.",
    },
    {
      id: "euvolemia",
      slot: "S-03",
      cor: "COR 2a",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§8.3, rec. 2, p. e339",
      verbatim:
        "In patients with aSAH, maintaining euvolemia can be beneficial in preventing DCI and improving functional outcomes.",
      formulacao:
        "Manter euvolemia pode ser benéfico para prevenir DCI.",
    },
    {
      id: "pa_sintomatico",
      slot: "S-03",
      cor: "COR 2b",
      loe: "B-NR",
      direcao: "incerto",
      localizacao: "§8.3, rec. 3, p. e339",
      verbatim:
        "In patients with aSAH and symptomatic vasospasm, elevating systolic BP values may be reasonable to reduce the progression and severity of DCI.",
      formulacao:
        "No vasoespasmo sintomático, elevar a PAS pode ser razoável para reduzir a progressão do DCI.",
      populacao: "Vasoespasmo sintomático",
    },
    {
      id: "resgate_endovascular",
      slot: "S-03",
      cor: "COR 2b",
      loe: "B-NR",
      direcao: "incerto",
      localizacao: "§8.3, recs. 4 e 5, p. e339",
      verbatim:
        "In patients with aSAH and severe vasospasm, use of intra-arterial vasodilator therapy may be reasonable to reverse cerebral vasospasm and reduce the progression and severity of DCI.",
      formulacao:
        "No vasoespasmo grave, vasodilatador intra-arterial (e angioplastia) pode ser razoável como resgate.",
      populacao: "Vasoespasmo grave",
    },
    {
      id: "estatina",
      slot: "S-03",
      cor: "COR 3: No Benefit",
      loe: "A",
      direcao: "contra",
      localizacao: "§8.3, rec. 6, p. e339",
      verbatim:
        "In patients with aSAH, routine use of statin therapy to improve outcomes is not recommended.",
      formulacao:
        "O uso de rotina de estatina não é recomendado.",
    },
    {
      id: "magnesio",
      slot: "S-03",
      cor: "COR 3: No Benefit",
      loe: "A",
      direcao: "contra",
      localizacao: "§8.3, rec. 7, p. e339",
      verbatim:
        "In patients with aSAH, routine use of intravenous magnesium to improve neurological outcomes is not recommended.",
      formulacao:
        "O uso de rotina de magnésio intravenoso não é recomendado.",
    },
    {
      id: "aumento_profilatico",
      slot: "S-03",
      cor: "COR 3: Harm",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§8.3, rec. 8, p. e339",
      verbatim:
        "In patients with aSAH at risk of DCI, prophylactic hemodynamic augmentation should not be performed to avoid iatrogenic patient harm.",
      formulacao:
        "O aumento hemodinâmico profilático (antigo Triplo-H profilático) não deve ser feito, pelo risco de dano iatrogênico.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * D · HIDROCEFALIA (S-05)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_HIDROCEFALIA: TemaHSA = {
  id: "hidrocefalia",
  titulo: "Hidrocefalia",
  resumo:
    "Hidrocefalia aguda sintomática: derivação liquórica urgente (DVE e/ou dreno lombar). Hidrocefalia crônica: derivação permanente.",
  recomendacoes: [
    {
      id: "aguda",
      slot: "S-05",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§8.4, rec. 1, p. e343",
      verbatim:
        "In patients with aSAH and acute symptomatic hydrocephalus, urgent CSF diversion (EVD and/or lumbar drainage) should be performed to improve neurological outcome.",
      formulacao:
        "Na hidrocefalia aguda sintomática, derivação liquórica urgente (DVE e/ou dreno lombar).",
    },
    {
      id: "cronica",
      slot: "S-05",
      cor: "COR 1",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§8.4, rec. 3, p. e343",
      verbatim:
        "In patients with aSAH and associated chronic symptomatic hydrocephalus, permanent CSF diversion is recommended to improve neurological outcome.",
      formulacao:
        "Na hidrocefalia crônica sintomática, derivação liquórica permanente.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * E · CONVULSÃO (S-06)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_CONVULSAO_HSA: TemaHSA = {
  id: "convulsao",
  titulo: "Convulsões",
  resumo:
    "Fenitoína para prevenção está associada a excesso de morbimortalidade. Quem chega convulsionando: tratar até 7 dias.",
  recomendacoes: [
    {
      id: "fenitoina",
      slot: "S-06",
      cor: "COR 3: Harm",
      loe: "B-NR",
      direcao: "contra",
      localizacao: "§8.5, rec. 4, p. e344",
      verbatim:
        "In patients with aSAH, phenytoin for seizure prevention and/or antiseizure prophylaxis is associated with excess morbidity and mortality.",
      formulacao:
        "Fenitoína para prevenção de convulsão está associada a excesso de morbimortalidade.",
    },
    {
      id: "trata_ate_7d",
      slot: "S-06",
      cor: "COR 2a",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§8.5, rec. 5, p. e344",
      verbatim:
        "In patients with aSAH who present with seizures, treatment with antiseizure medications for ≤7 days is reasonable to reduce seizure-related complications in the perioperative period.",
      formulacao:
        "Quem chega com convulsão: tratar com antiepiléptico por até 7 dias é razoável.",
      populacao: "HSA que se apresenta com convulsão",
    },
    {
      id: "profilaxia_alto_risco",
      slot: "S-06",
      cor: "COR 2b",
      loe: "B-NR",
      direcao: "incerto",
      localizacao: "§8.5, rec. 2, p. e344",
      verbatim:
        "In patients with aSAH and high-seizure-risk features (ie, ruptured MCA aneurysm, high-grade SAH, ICH, hydrocephalus, and cortical infarction), use of prophylactic antiseizure medication(s) may be reasonable to prevent seizures.",
      formulacao:
        "Em alto risco de convulsão (aneurisma de ACM roto, HSA de alto grau, HIC, hidrocefalia, infarto cortical), profilaxia antiepiléptica pode ser razoável — mas não com fenitoína.",
      populacao: "HSA com fatores de alto risco de convulsão",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * F · SUPORTE — volume, TEV, glicemia (S-07)
 * ────────────────────────────────────────────────────────────────────────── */

const TEMA_SUPORTE_HSA: TemaHSA = {
  id: "suporte",
  titulo: "Suporte clínico",
  resumo:
    "Manter euvolemia; hipervolemia induzida é danosa. Profilaxia de TEV só após o aneurisma tratado. Controle glicêmico com atenção à hipoglicemia.",
  recomendacoes: [
    {
      id: "volume",
      slot: "S-07",
      cor: "COR 2a",
      loe: "B-R",
      direcao: "a_favor",
      localizacao: "§8, rec. 3, p. e332",
      verbatim:
        "In patients with aSAH, close monitoring and goal-directed treatment of volume status is reasonable to maintain euvolemia.",
      formulacao:
        "Monitorar de perto e tratar o estado volêmico por metas, para manter euvolemia.",
    },
    {
      id: "hipervolemia",
      slot: "S-07",
      cor: "COR 3: Harm",
      loe: "B-R",
      direcao: "contra",
      localizacao: "§8, rec. 5, p. e332",
      verbatim:
        "In patients with aSAH, induction of hypervolemia is potentially harmful because of the association with excess morbidity.",
      formulacao:
        "A indução de hipervolemia é potencialmente danosa.",
    },
    {
      id: "tev",
      slot: "S-07",
      cor: "COR 1",
      loe: "C-LD",
      direcao: "a_favor",
      localizacao: "§8, rec. 6, p. e333",
      verbatim:
        "In patients with aSAH whose ruptured aneurysm has been secured, pharmacological or mechanical venous thromboembolism (VTE) prophylaxis is recommended to reduce the risk for VTE.",
      formulacao:
        "Depois de o aneurisma estar tratado, profilaxia de TEV (farmacológica ou mecânica).",
      populacao: "HSA com aneurisma já tratado",
    },
    {
      id: "glicemia",
      slot: "S-07",
      cor: "COR 2a",
      loe: "B-NR",
      direcao: "a_favor",
      localizacao: "§8, rec. 7, p. e333",
      verbatim:
        "In patients with aSAH, effective glycemic control, strict hyperglycemia management, and avoidance of hypoglycemia are reasonable to improve outcome.",
      formulacao:
        "Controle glicêmico efetivo, manejo estrito da hiperglicemia e evitar hipoglicemia.",
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * O CATÁLOGO
 * ────────────────────────────────────────────────────────────────────────── */

export const TEMAS_HSA: readonly TemaHSA[] = [
  TEMA_RESSANGRAMENTO,
  TEMA_ANEURISMA,
  TEMA_VASOESPASMO,
  TEMA_HIDROCEFALIA,
  TEMA_CONVULSAO_HSA,
  TEMA_SUPORTE_HSA,
] as const;

export const CITACAO_HSA = FONTE_HSA.citacao;

export const AVISO_HSA =
  "Catálogo de recomendações da diretriz de HSA. A decisão final é do profissional.";
