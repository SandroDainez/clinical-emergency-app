/**
 * DOSE DE ANTIBIÓTICO E FUNÇÃO RENAL — fonte única de cálculo e o piso de texto.
 *
 * ── OS DOIS DEFEITOS QUE ORIGINARAM (2026-08-17) ────────────────────────────
 *
 * 1 · O AJUSTE RENAL NÃO EXISTIA NOS NOVE ESQUEMAS DA SEPSE.
 *
 * O app cita 17 antibióticos, dos quais 16 das 27 ocorrências são vancomicina,
 * pip-tazo e meropeném. A calculadora `dose-antibiotico` ajusta esses três por
 * ClCr. Os nove nós de esquema empírico (`atb_pac`, `atb_pav`, `atb_urosepse`,
 * `atb_abdominal`, `atb_iptm`, `atb_meningite`, `atb_cateter`,
 * `atb_neutropenia`, `atb_indeterminado`) prescrevem REGIME COMPLETO — dose E
 * intervalo — e ⚠️ NENHUM MENCIONA FUNÇÃO RENAL. Varrido: `ClCr`, `TFG`,
 * `ajuste renal`, `creatinina`, `hemodiálise` — nenhum aparece na árvore da
 * sepse; as quatro ocorrências de "clearance" são de LACTATO.
 *
 * E a Sepse não sabe que a calculadora existe: `calculadora`, `Calculadoras`,
 * `dose-antibiotico` — nenhum termo presente.
 *
 * 2 · ⚠️ MAS O PISO ÓBVIO ESTARIA CONTRA A EVIDÊNCIA.
 *
 * O texto natural seria "esta dose pressupõe função renal preservada — ajuste
 * se houver disfunção". A fonte aberta diz o CONTRÁRIO para o cenário mais
 * comum deste módulo, que é o séptico com lesão renal aguda nas primeiras horas:
 *
 *   Early Versus Late Antipseudomonal β-Lactam Dose Adjustment in Critically
 *   Ill Sepsis Patients With AKI (Open Forum Infect Dis 2024, ofae059):
 *   "L-BLA was associated with a significant reduction in in-hospital mortality
 *   compared to E-BLA (hazard ratio, 0.588 [95% CI .355–.974])" — ou seja,
 *   ADIAR o ajuste além de 24 h da identificação da sepse associou-se a MENOR
 *   mortalidade que ajustar precocemente. E: "antimicrobial therapy should
 *   always be started with a total high-end-loading dose" (SSC 2016/2021);
 *   "adjusting doses for acute kidney injury during the first 48 h […] in the
 *   absence of beta-lactam therapeutic drug monitoring, may result in suboptimal
 *   drug exposure".
 *
 *   Beta-lactam dosing in critically ill patients with septic shock and CRRT
 *   (Critical Care 2014, cc13938) dá o MECANISMO: "during the first day a
 *   loading dose is required to compensate the increased volume of distribution,
 *   regardless of impaired organ function".
 *
 * ⚠️ O MECANISMO VAI ESCRITO NO TEXTO, e não é ornamento: sem ele, "não ajuste
 * agora" soa como negligência, e quem lê desobedece POR PRUDÊNCIA. Com ele, a
 * regra gruda — o volume de distribuição aumenta na sepse, a dose de ataque
 * compensa isso, e volume de distribuição não depende de depuração renal.
 *
 * ── O ESCOPO DA VANCOMICINA É OUTRO, E ESTÁ DECLARADO ───────────────────────
 *
 * O piso nomeia BETALACTÂMICOS. A vancomicina já é escrita como ataque por peso
 * e sua manutenção depende de NÍVEL/AUC, não de calendário — a própria
 * calculadora diz isso. Aplicar o mesmo texto aos dois contradiria o app.
 */

/* ── 1 · A FONTE ÚNICA DO ATAQUE DE VANCOMICINA ──────────────────────────── */

/**
 * ⚠️ ESTA FUNÇÃO EXISTE PORQUE OS DOIS LADOS JÁ DIVERGIAM — R-12 com CÁLCULO,
 * que é pior que com texto: dois lugares podem divergir em silêncio, e um deles
 * prescreve.
 *
 * O que havia:
 *
 *   sepsis-decision-tree.ts   `round0(27.5 * peso)`            — sem teto
 *   clinical-calculators       `Math.min(25*peso, 3000)`…`30`   — teto de 3 g
 *
 * MEDIDO, e a divergência não era teórica:
 *
 *   peso    Sepse        Calculadora      diferença
 *   110 kg  3.025 mg     2.750–3.000 mg   +25 mg acima do teto
 *   120 kg  3.300 mg     3.000 mg         +300 mg
 *   130 kg  3.575 mg     3.000 mg         +575 mg
 *   150 kg  4.125 mg     3.000 mg         +1.125 mg
 *
 * A partir de 110 kg a SEPSE — o lado que prescreve — ultrapassava o teto que a
 * calculadora respeitava. Agora as duas chamam esta função.
 */
export const VANCO_ATAQUE_MG_KG_MIN = 25;
export const VANCO_ATAQUE_MG_KG_MAX = 30;
export const VANCO_ATAQUE_TETO_MG = 3000;

/** Faixa de ataque em mg, com o teto aplicado. */
export function ataqueVancomicinaMg(pesoKg: number): { min: number; max: number } | null {
  if (!Number.isFinite(pesoKg) || pesoKg <= 0) return null;
  return {
    min: Math.round(Math.min(VANCO_ATAQUE_MG_KG_MIN * pesoKg, VANCO_ATAQUE_TETO_MG)),
    max: Math.round(Math.min(VANCO_ATAQUE_MG_KG_MAX * pesoKg, VANCO_ATAQUE_TETO_MG)),
  };
}

/**
 * O rótulo que os módulos interpolam. Sem peso, devolve a faixa em mg/kg — que
 * é a única coisa honesta a dizer quando não se sabe o peso.
 *
 * ⚠️ DEVOLVE FAIXA, NÃO PONTO MÉDIO. A Sepse usava 27,5 mg/kg (a média) e
 * mostrava um número único, o que some com a decisão que a faixa oferece: 25 no
 * limite inferior, 30 quando se quer concentração mais alta. E o ponto médio
 * escondia o teto.
 */
export function rotuloAtaqueVancomicina(pesoKg: number | undefined): string {
  const faixa = pesoKg === undefined ? null : ataqueVancomicinaMg(pesoKg);
  if (!faixa) return `${VANCO_ATAQUE_MG_KG_MIN}–${VANCO_ATAQUE_MG_KG_MAX} mg/kg`;
  if (faixa.min === faixa.max) return `${faixa.max}`; // teto atingido nas duas pontas
  return `${faixa.min}–${faixa.max}`;
}

/* ── 2 · O PISO — nos nove esquemas ──────────────────────────────────────── */


/* ── 3 · O TETO — ponteiro para os três cobertos ─────────────────────────── */

