/**
 * Cálcio na parada — o PAR dos dois sais, em fonte única.
 *
 * ── R-54: O DEFEITO QUE ORIGINOU ────────────────────────────────────────────
 *
 * O card da PCR na gestação dizia:
 *
 *   "cloreto de cálcio 10% 10 mL (1 g) [...] Só há acesso periférico:
 *    gluconato de cálcio 10% 15–30 mL"
 *
 * NENHUM NÚMERO ESTAVA ERRADO. A fonte para hipermagnesemia com parada dá o
 * PAR: cloreto 10% 5–10 mL ↔ gluconato 10% 15–30 mL — 5↔15 e 10↔30, razão 3×
 * coerente nos dois extremos.
 *
 * O texto fixou o cloreto no TOPO (10 mL) e manteve o gluconato na FAIXA
 * INTEIRA. A correspondência quebrou em silêncio: quem só tem acesso periférico
 * lê "1 g de cloreto… se periférico, 15–30 mL de gluconato", escolhe 15 mL
 * acreditando ser o equivalente do que acabou de ler — e dá METADE. Os 15 mL
 * equivalem aos 5 mL de cloreto que este card deliberadamente NÃO oferece na
 * parada.
 *
 * Por isso o gluconato aqui é 30 mL (3 g), ponto: é o equivalente do 1 g de
 * cloreto que o card indica.
 *
 * ── A REDAÇÃO DO FATOR 3× É ÚNICA, E É A QUE DÁ A CONVERSÃO PRONTA ─────────
 *
 * O app tinha duas: "1 g de cloreto ≈ 3 g de gluconato" (causas-na-parada) e
 * "~⅓ tão potente por grama" (PCR na gestação). Dizem o mesmo e divergiriam na
 * primeira correção que só um lado recebesse.
 *
 * Ficou a primeira: ela entrega a conversão pronta, enquanto a segunda exige
 * que alguém faça a inversão mental — durante uma parada.
 *
 * ── NÃO CONFUNDIR COM A TOXICIDADE COM PULSO ────────────────────────────────
 *
 * A pré-eclâmpsia trata intoxicação por magnésio COM PULSO, e ali a dose é 1 g
 * de gluconato (10 mL a 10%). É outro construto (R-36), fica onde está, e o
 * texto diz isso para não ser lido como contradição entre dois módulos.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · Formulação corrente para toxicidade grave/parada por magnésio: "calcium
 *    chloride 10% 5–10 mL or calcium gluconate 10% 15–30 mL IV over 2–5 min".
 *  · EMCrit IBCC — Hypermagnesemia: "Two grams of calcium gluconate IV over
 *    5–10 minutes (or one gram of calcium chloride)" — mesma razão 3×.
 *  · Algoritmo AHA de PCR na gestação (via Jeejeebhoy & Windrim, Best Pract Res
 *    Clin Obstet Gynaecol 2014): "stop magnesium and give IV/IO calcium
 *    chloride 10 mL in 10% solution, or calcium gluconate 30 mL in 10%
 *    solution" — o par no topo, que é o que este card usa.
 *  · ⚠️ R-52: esta última fonte reproduz um algoritmo de 2010 e por isso NÃO
 *    foi usada para nada além do cálcio — a mesma figura traz "place hands
 *    slightly higher on sternum", recomendação REMOVIDA em 2015 por ausência
 *    de dado. Periódico revisado por pares não garante vigência do algoritmo
 *    que ele reproduz.
 */

/**
 * ⚠️ OS DOIS EM PONTO, E PAREADOS. Não transformar um deles em faixa sem
 * transformar o outro — é exatamente assim que a equivalência se perde.
 */
export const CALCIO_NA_PARADA =
  "CÁLCIO IV AGORA — cloreto de cálcio 10%: 10 mL (1 g) IV em 2–5 min. É o preferido na parada porque age mais rápido, mas é irritante: dar pelo acesso mais central disponível. SÓ HÁ ACESSO PERIFÉRICO → gluconato de cálcio 10%: 30 mL (3 g) IV, que não causa necrose. ⚠️ 30 mL e não 15: 1 g de cloreto ≈ 3 g de gluconato em cálcio elementar, e os dois sais NÃO são intercambiáveis volume por volume. Metade do volume é metade da dose.";

/** O fator, isolado, para quem precisa converter fora deste card. */
export const CALCIO_EQUIVALENCIA =
  "EQUIVALÊNCIA DOS SAIS: 1 g de cloreto de cálcio ≈ 3 g de gluconato de cálcio em cálcio elementar. Trocar um pelo outro em volume igual subdosa por três.";

/**
 * A distinção de cenário, visível ao usuário — não só em comentário de código.
 * Sem ela, quem conhece os dois módulos lê contradição onde há contexto.
 */
export const CALCIO_PARADA_VS_COM_PULSO =
  "Esta dose é MAIOR que a da intoxicação por magnésio COM PULSO (1 g de gluconato, no módulo de Pré-eclâmpsia e eclâmpsia). Não é divergência: lá se trata toxicidade em quem ainda tem circulação; aqui é parada.";
