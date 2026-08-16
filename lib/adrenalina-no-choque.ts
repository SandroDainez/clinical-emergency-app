/**
 * Adrenalina em infusão no CHOQUE — faixa e limiares, em fonte única.
 *
 * ⚠️ NÃO CONFUNDIR com os outros dois construtos da adrenalina no app, que têm
 * libs próprias (R-36):
 *   · lib/adrenalina-na-parada    — 1 mg em bolus, PCR
 *   · lib/adrenalina-ev-anafilaxia — infusão da anafilaxia refratária
 * Aqui é vasopressor contínuo no choque.
 *
 * ── O DEFEITO QUE ORIGINOU: DUAS FAIXAS PARA O MESMO CONSTRUTO ──────────────
 *
 *   sepsis-decision-tree:368  "EPINEFRINA 0,01–0,5 mcg/kg/min em choque refratário"
 *   vasoactive-engine:311     "0,01–1 mcg/kg/min (choque refratário)"
 *
 * Testado o R-36 antes de chamar de divergência: os DOIS sítios dizem "choque
 * refratário" — mesmo fármaco, mesma indicação, mesmo momento do algoritmo.
 * Não são dois regimes. É divergência, com o teto DOBRANDO entre um arquivo e
 * o outro.
 *
 * ── R-56: E NENHUM DOS DOIS NÚMEROS É TETO ─────────────────────────────────
 *
 * Aberta a fonte, os dois lados estavam errados no mesmo sentido: 0,5 e 1 são
 * limiares de CLASSIFICAÇÃO, não limites terapêuticos.
 *
 *   · "> 0,5 mcg/kg/min […] is often used in clinical trials as a threshold"
 *     de dose alta;
 *   · "doses exceeding 1 µg/kg/min were associated with a 90% mortality" —
 *     associação com prognóstico, não proibição;
 *   · EMCrit, sobre a noradrenalina: "there is no 'maximal dose'".
 *
 * Apresentar um marcador de gravidade como teto SUBDOSA quem precisa de mais —
 * e é o terceiro caso desta auditoria (teto de 2,2 g da amiodarona, PAM ≥ 80).
 *
 * A forma certa já existia no próprio app: a entrada da NORADRENALINA em
 * vasoactive-engine escreve "0,01–1 (faixa habitual); > 1 = dose alta (marcador
 * de gravidade — SOFA cardiovascular)". A adrenalina recebe o mesmo tratamento.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-15) ───────────────────────────────────
 *
 *  · EMCrit IBCC — Shock & vasoactive medications: dose baixa/inotrópica
 *    "< 0,05–0,08 ug/kg/min"; sobre a noradrenalina, "there is no maximal dose".
 *  · ACEP Critical Care — Refractory Shock (2025): "more than 0.5 mcg/kg/min of
 *    norepinephrine or epinephrine […] is often used in clinical trials as a
 *    threshold".
 *  · Therapeutic Strategies for High-Dose Vasopressor-Dependent Shock
 *    (PMC3787628): "doses exceeding 1 µg/kg/min were associated with a 90%
 *    mortality"; risco de isquemia mesentérica e digital.
 *  · ⚠️ NENHUMA delas é diretriz — são referências de terapia intensiva. A SSC
 *    2026 não estabelece faixa de adrenalina. Declarado (R-5), e a trava confere
 *    contra estas referências, não contra o app (R-21).
 */

export const ADRENALINA_CHOQUE_FAIXA =
  "ADRENALINA em infusão contínua — iniciar em 0,05 mcg/kg/min e titular pela PAM; a faixa de referência no choque vai de 0,01 a 2 mcg/kg/min. Abaixo de ~0,05 o efeito é predominantemente INOTRÓPICO; acima, vasopressor.";

/**
 * ⚠️ ESTES NÚMEROS NÃO SÃO TETO. Escrito no próprio texto porque foi assim que
 * o app os transformou em limite duas vezes, em dois arquivos diferentes.
 */
export const ADRENALINA_CHOQUE_LIMIARES =
  "⚠️ 0,5 E 1 mcg/kg/min NÃO SÃO TETO — são marcadores de gravidade. Acima de 0,5 é o limiar que os ensaios usam para chamar de DOSE ALTA; acima de 1 observou-se mortalidade em torno de 90%, o que descreve a gravidade de quem chegou lá, não uma proibição. Não existe dose máxima estabelecida. O que muda acima desses valores é a vigilância — isquemia mesentérica e digital, taquiarritmia, lactato — e a pergunta sobre causa não tratada, nunca a decisão de subdosar.";

export const ADRENALINA_CHOQUE_QUANDO =
  "QUANDO: no choque séptico é agente de 3ª linha, depois de noradrenalina e vasopressina. COM DISFUNÇÃO CARDÍACA concomitante, sobe de posição — ver a ressalva de 1ª linha.";
