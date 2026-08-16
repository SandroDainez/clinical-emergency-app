/**
 * Vasopressina no choque — dose, preparo e apresentação, em fonte única.
 *
 * ── POR QUE ESTA É A PRIMEIRA DA D-34 ───────────────────────────────────────
 *
 * A varredura da dívida achou 10 fármacos vasoativos e 19 sítios escrevendo
 * dose à mão em 9 árvores. A vasopressina é a pior: CINCO árvores — anafilaxia,
 * EAP, sepse, TEP e ventilação — cada uma com a sua redação, nenhuma podendo
 * importar de lugar nenhum.
 *
 * Cinco cópias do mesmo número é o estado em que a divergência já é provável,
 * não possível. Por isso ela sai agora, junto com a exportação de DRUGS; as
 * outras seis fecham na auditoria de cada módulo dono (D-34), quando a fonte
 * for aberta — criar lib a partir do texto atual do app é exatamente o que o
 * R-21 proíbe.
 *
 * ── O QUE A FONTE FIXA, E O QUE ELA NÃO FIXA ────────────────────────────────
 *
 * A dose FIXA de 0,03 U/min é invariante — é a do VASST e a que a prática
 * consolidou, e por isso a trava dela continua vigiando o LITERAL (R-55).
 *
 * Já o gatilho de noradrenalina ≥ 0,25 mcg/kg/min para associar NÃO é da SSC
 * 2026: a diretriz de 2026 diz apenas que a noradrenalina é primeira linha
 * "over vasopressin or angiotensin II" e que se adiciona adrenalina quando a
 * PAM é inadequada apesar de noradrenalina E vasopressina — sem estabelecer o
 * limiar. O 0,25 é texto de prática de 2021, e vai escrito como tal.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · VASST (NEJM 2008), via Wiki Journal Club e criticalcarereviews: infusão
 *    iniciada em 0,01 U/min e titulada até o MÁXIMO de 0,03 U/min — estratégia
 *    poupadora de catecolamina, não resgate em dose alta.
 *  · Monografia de vasopressina (Drugs.com): "commercially available as a
 *    20-units/mL injection in single-dose vials that must be further diluted
 *    with 5% dextrose or 0.9% sodium chloride prior to IV administration";
 *    diluir a 0,1 U/mL ou 1 U/mL.
 *  · Apresentação nacional, já conferida na D-4: "Vasopressina 20 UI/mL, ampola
 *    1 mL (Encrise — Blau) — bula ANVISA".
 *  · SSC 2026 (Guideline Central): noradrenalina primeira linha sobre
 *    vasopressina; sem limiar declarado para associar.
 */

export const VASOPRESSINA_DOSE =
  "VASOPRESSINA — 0,03 U/min, DOSE FIXA: não se titula. Ela poupa catecolamina, e a lógica é ADICIONAR à noradrenalina em vez de escalar a noradrenalina sozinha. No VASST a infusão ia de 0,01 até o máximo de 0,03 U/min — acima disso não é a estratégia estudada.";

/**
 * R-48 — a apresentação e o preparo, na superfície onde a dose é administrada.
 *
 * A ampola é 20 U em 1 mL para uma infusão de 0,03 U/min: a diluição não é
 * intuitiva, e o app mandava infundir sem dizer de onde sai.
 */
export const VASOPRESSINA_APRESENTACAO =
  "APRESENTAÇÃO E PREPARO: ampola de 1 mL com 20 U (20 U/mL) — NUNCA infundir sem diluir. Diluir em SF 0,9% ou SG 5% para 0,1 U/mL ou 1 U/mL, conforme a bomba e a restrição de volume. Repare na ordem de grandeza: UMA ampola tem mais de 600 vezes a dose de um minuto, e é por isso que erro de diluição aqui não perdoa.";

/**
 * O gatilho, com a procedência declarada — R-55: o número é referência de
 * prática, e a trava vigia a RESSALVA, não o literal.
 */
export const VASOPRESSINA_QUANDO_ASSOCIAR =
  "QUANDO ASSOCIAR: a prática comum associa a partir de noradrenalina ≈ 0,25 mcg/kg/min (faixa usual de início 0,25–0,5). ⚠️ Este número é REFERÊNCIA DE PRÁTICA, não portão: a SSC 2026 não estabelece limiar de dose para associar a vasopressina — ela diz que a noradrenalina é a primeira linha e que a adrenalina entra quando a PAM segue inadequada apesar de noradrenalina E vasopressina. Não espere alcançar 0,25 para associar se a escalada já estiver evidente.";
