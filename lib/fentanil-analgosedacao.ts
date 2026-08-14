/**
 * Fentanil — dose de analgosedação em fonte única.
 *
 * Duas árvores (`rsi-decision-tree.ts` pós-intubação, `ventilation-decision-tree.ts`
 * sedação) escreviam a mesma faixa — 25–100 mcg/h — como texto livre, cada uma por
 * conta própria. A calculadora de Sedoanalgesia (`sedation-engine.ts`) já cobre o
 * mesmo intervalo em bandas graduadas (verde 25–50 · amarelo 50–100). Terceira
 * declaração paralela da mesma dose nascendo — a mesma classe de defeito da
 * dobutamina (D-11), pega antes de virar divergência.
 */
export const FENTANIL_ANALGOSEDACAO = "Fentanil 25–100 mcg/h (bolus 25–50 mcg) para analgesia contínua.";
