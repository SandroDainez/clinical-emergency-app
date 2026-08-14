/**
 * Osmolalidade — os dois limiares do EHH, em fonte única (R-12).
 *
 * ── POR QUE EXISTE ──────────────────────────────────────────────────────────
 *
 * O par 300/320 passou a viver em TRÊS lugares: a árvore do CAD/EHH (critério),
 * a calculadora de osmolalidade (faixa de interpretação) e o texto que ensina
 * a fórmula. É R-12 clássico — e a divergência já tinha acontecido: os dois
 * primeiros usavam 320 para a EFETIVA, que é o limiar da TOTAL.
 *
 * ── A ARMADILHA, E ELA É A MESMA NOS DOIS SENTIDOS ──────────────────────────
 *
 * O consenso ADA/EASD 2024 (Diabetes Care 2024;47(8):1257-1275, Figura 2B) dá
 * DOIS limiares alternativos para a hiperosmolaridade do EHH:
 *
 *   EFETIVA > 300 mOsm/kg   =  2×Na⁺ + glicose          (exclui a ureia)
 *   TOTAL   > 320 mOsm/kg   =  2×Na⁺ + glicose + ureia  (inclui a ureia)
 *
 * Trocar um pelo outro erra nos DOIS sentidos, e por isso nenhum é "o mais
 * seguro":
 *
 *   efetiva com o limiar 320  → SUBDIAGNOSTICA EHH (o de efetiva 310 não entra)
 *   total   com o limiar 300  → SUPERDIAGNOSTICA EHH (a ureia infla o número)
 *
 * E a consequência clínica não é simétrica: CAD rotulada como EHH recebe
 * insulina em dose menor e hidratação mais prolongada enquanto a cetoacidose
 * corre — que é o erro mais perigoso dos dois.
 */

/** Limiar de osmolalidade EFETIVA (tonicidade) para o EHH — consenso 2024. */
export const OSM_EFETIVA_EHH = 300;

/** Limiar de osmolalidade TOTAL para o EHH — consenso 2024. */
export const OSM_TOTAL_EHH = 320;

/** Faixa de normalidade da osmolalidade efetiva. */
export const OSM_EFETIVA_NORMAL = { min: 275, max: 295 } as const;

/**
 * A explicação das duas fórmulas, para quem lê o número na tela.
 *
 * Literal sem interpolação: template com `${}` sai da varredura de tradução
 * (D-19) e o usuário em espanhol leria português.
 */
export const OSM_EFETIVA_VS_TOTAL =
  "⚠️ EFETIVA ≠ TOTAL, e os limiares são diferentes: EFETIVA = 2×Na⁺ + glicose/18 (exclui ureia), critério de EHH > 300 mOsm/kg. TOTAL = 2×Na⁺ + glicose/18 + ureia/6, critério de EHH > 320. A ureia é osmol INEFICAZ — atravessa a membrana e não desloca água. Usar o limiar 320 sobre a EFETIVA subdiagnostica EHH; usar 300 sobre a TOTAL superdiagnostica.";
