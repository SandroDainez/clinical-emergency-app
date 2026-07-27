/**
 * Calculadora de eletrólitos — frases montadas em runtime (PT → ES).
 *
 * Estas são as linhas de SAÍDA do cálculo: prosa + valores computados. A chave
 * usa marcadores {0}, {1}… e a interpolação acontece depois da tradução, via
 * trf() (ver lib/i18n/trf.ts). A ORDEM dos marcadores deve ser preservada na
 * tradução — {0} continua sendo o primeiro valor passado, e assim por diante.
 */
export const ES_ELETROLITOS_RUNTIME: Record<string, string> = {
  // ── Hiponatremia: NaCl 3% e metas ──────────────────────────────────────────
  "Solução hipertônica alvo do caso: cloreto de sódio a 3% com volume total calculado de {0} mL para a meta inicial.":
    "Solución hipertónica objetivo del caso: cloruro de sodio al 3% con un volumen total calculado de {0} mL para la meta inicial.",
  "Alternativa para o mesmo volume final: SF 0,9% {0} mL + NaCl 20% {1} mL.":
    "Alternativa para el mismo volumen final: solución fisiológica 0,9% {0} mL + NaCl al 20% {1} mL.",
  "Se houver neurogravidade, iniciar {0} mL em {1} e redosar sódio em 1–2 h ou antes se piora clínica.":
    "Si hay gravedad neurológica, iniciar {0} mL en {1} y volver a medir el sodio en 1–2 h, o antes si hay empeoramiento clínico.",
  "Meta automática inicial: Na {0} mEq/L, com elevação desejada de {1} mEq/L.":
    "Meta automática inicial: Na {0} mEq/L, con una elevación deseada de {1} mEq/L.",
  "Volume total calculado para a primeira meta: {0} mL de NaCl 3%.":
    "Volumen total calculado para la primera meta: {0} mL de NaCl al 3%.",
  "Após o bolus inicial, o restante calculado é {0} mL; infundir em 24 h por bomba contínua a cerca de {1} mL/h.":
    "Tras el bolo inicial, el resto calculado es {0} mL; infundir en 24 h por bomba continua a unos {1} mL/h.",
  "Velocidade de referência: 0,5–1,0 mL/kg/h quando o quadro é hipovolêmico sem neurogravidade; para {0} kg isso corresponde a ~ {1}–{2} mL/h.":
    "Velocidad de referencia: 0,5–1,0 mL/kg/h cuando el cuadro es hipovolémico sin gravedad neurológica; para {0} kg eso corresponde a ~ {1}–{2} mL/h.",
  "Ureia oral: 0,25–0,50 g/kg/dia; para {0} kg isso equivale a ~ {1}–{2} g/dia, divididos em 2–3 tomadas.":
    "Urea oral: 0,25–0,50 g/kg/día; para {0} kg eso equivale a ~ {1}–{2} g/día, repartidos en 2–3 tomas.",
  "D5W pode ser usado para repor água livre; referência prática: ~ 3 mL/kg/h, o que para {0} kg corresponde a ~ {1} mL/h.":
    "La dextrosa al 5% puede usarse para reponer agua libre; referencia práctica: ~ 3 mL/kg/h, lo que para {0} kg corresponde a ~ {1} mL/h.",
  "Referência isotônica: NaCl 0,9% tem 154 mEq/L e eleva ~ {0} mEq/L por litro neste caso; não substitui o resgate da neurogravidade.":
    "Referencia isotónica: el NaCl al 0,9% tiene 154 mEq/L y eleva ~ {0} mEq/L por litro en este caso; no sustituye el rescate de la gravedad neurológica.",

  // ── Hipernatremia: água livre e soluções ───────────────────────────────────
  "Volume total de água livre para a meta inicial: ~ {0} L.":
    "Volumen total de agua libre para la meta inicial: ~ {0} L.",
  "Volume programado automaticamente para a etapa inicial: {0} L ({1} mL), correspondente à meta segura das primeiras 24 h.":
    "Volumen programado automáticamente para la etapa inicial: {0} L ({1} mL), correspondiente a la meta segura de las primeras 24 h.",
  "Se a opção for endovenosa pura, usar SG 5%; cada litro tende a reduzir ~ {0} mEq/L neste caso.":
    "Si la opción es intravenosa pura, usar dextrosa al 5%; cada litro tiende a reducir ~ {0} mEq/L en este caso.",
  "Para esta etapa, programar {0} mL de SG 5% se a escolha for água livre EV pura.":
    "Para esta etapa, programar {0} mL de dextrosa al 5% si se elige agua libre IV pura.",
  "Para o volume programado automaticamente desta etapa ({0} L), preparar SF 0,9% {1} mL + água destilada {2} mL.":
    "Para el volumen programado automáticamente de esta etapa ({0} L), preparar solución fisiológica 0,9% {1} mL + agua destilada {2} mL.",
  "Essa mistura gera solução final com ~77 mEq/L de sódio e tende a reduzir ~ {0} mEq/L por litro neste caso.":
    "Esa mezcla genera una solución final con ~77 mEq/L de sodio y tiende a reducir ~ {0} mEq/L por litro en este caso.",
  "Se fosse necessário corrigir toda a meta inicial apenas com essa solução, o volume teórico seria ~ {0} L; por isso muitas vezes corrigimos só parte agora e reavaliamos.":
    "Si fuera necesario corregir toda la meta inicial solo con esa solución, el volumen teórico sería ~ {0} L; por eso muchas veces se corrige solo una parte ahora y se reevalúa.",
  "Para o volume programado automaticamente desta etapa ({0} L), o sódio final calculado ficou próximo de 0 mEq/L; na prática isso equivale a água livre e não exige acrescentar NaCl 20%.":
    "Para el volumen programado automáticamente de esta etapa ({0} L), el sodio final calculado quedó cerca de 0 mEq/L; en la práctica eso equivale a agua libre y no exige añadir NaCl al 20%.",
  "Para programar {0} L com sódio final alvo de ~ {1} mEq/L, usar água destilada {2} mL + NaCl 20% {3} mL.":
    "Para programar {0} L con un sodio final objetivo de ~ {1} mEq/L, usar agua destilada {2} mL + NaCl al 20% {3} mL.",
  "Em 1 litro, isso corresponde a água destilada {0} mL + NaCl 20% {1} mL.":
    "En 1 litro, eso corresponde a agua destilada {0} mL + NaCl al 20% {1} mL.",
  "Se a via enteral/oral for segura, a água pode substituir parte do volume EV; a meta total de água livre continua sendo ~ {0} L para esta primeira queda.":
    "Si la vía enteral u oral es segura, el agua puede sustituir parte del volumen IV; la meta total de agua libre sigue siendo ~ {0} L para este primer descenso.",
  "Cada 500 mL de água por sonda/oral reduz em 500 mL o volume EV; se forem dados 500 mL por sonda, o restante EV cai para ~ {0} L.":
    "Cada 500 mL de agua por sonda o vía oral reduce en 500 mL el volumen IV; si se administran 500 mL por sonda, el resto IV baja a ~ {0} L.",
  "Se forem dados 1,0 L por sonda/oral, o restante EV de água livre passa para ~ {0} L.":
    "Si se administra 1,0 L por sonda o vía oral, el resto IV de agua libre pasa a ~ {0} L.",
  "Meta usual: cair ~ {0} mEq/L em 24 h; em quadros claramente agudos a queda pode ser um pouco mais rápida, desde que monitorada.":
    "Meta habitual: descender ~ {0} mEq/L en 24 h; en cuadros claramente agudos el descenso puede ser algo más rápido, siempre que esté monitorizado.",
  "Com agua livre EV, o volume infundido fica proximo do valor mostrado: ~ {0} L.":
    "Con agua libre IV, el volumen infundido queda cerca del valor mostrado: ~ {0} L.",
  "Com solucao hipotonicamente efetiva, o volume total para a mesma meta tende a ser maior: ~ {0} L no total.":
    "Con una solución hipotónicamente efectiva, el volumen total para la misma meta tiende a ser mayor: ~ {0} L en total.",

  // ── Potássio ───────────────────────────────────────────────────────────────
  "Dose operacional sugerida agora: {0} mEq de KCl ({1} mL de KCl 19,1% / 2,5 mEq/mL).":
    "Dosis operativa sugerida ahora: {0} mEq de KCl ({1} mL de KCl al 19,1% / 2,5 mEq/mL).",
  "Se esta etapa for programada em {0} h, isso equivale a {1} mEq/h.":
    "Si esta etapa se programa en {0} h, eso equivale a {1} mEq/h.",
  "No acesso periférico, a estratégia desta tela é conservadora: até 10 mEq/h e concentração final até ~40 mEq/L. Na bolsa planejada: {0} mEq/L.":
    "Por acceso periférico, la estrategia de esta pantalla es conservadora: hasta 10 mEq/h y una concentración final de hasta ~40 mEq/L. En la bolsa planificada: {0} mEq/L.",
  "No acesso central com ECG contínuo, a etapa pode subir até ~20 mEq/h e tolera concentrações maiores (referência prática ~80 mEq/L). Na bolsa planejada: {0} mEq/L.":
    "Por acceso central con ECG continuo, la etapa puede subir hasta ~20 mEq/h y tolera concentraciones mayores (referencia práctica ~80 mEq/L). En la bolsa planificada: {0} mEq/L.",
  "Se a etapa escolhida for {0} mEq, adicionar {1} mL de KCl 19,1% na bolsa final de {2} mL.":
    "Si la etapa elegida es de {0} mEq, añadir {1} mL de KCl al 19,1% a la bolsa final de {2} mL.",
  "Dose total estimada da etapa: {0} mEq; escolha a bolsa final para converter isso em preparo prático.":
    "Dosis total estimada de la etapa: {0} mEq; elija la bolsa final para convertirlo en una preparación práctica.",
  "Se essa bolsa correr em {0} h, bomba ≈ {1} mL/h.":
    "Si esa bolsa se administra en {0} h, la bomba queda en ≈ {1} mL/h.",

  // ── Cálcio ─────────────────────────────────────────────────────────────────
  "Necessidade estimada da etapa inicial: {0} g de gluconato de cálcio 10% ({1} mL da solução 10%).":
    "Necesidad estimada de la etapa inicial: {0} g de gluconato de calcio al 10% ({1} mL de la solución al 10%).",
  "Como preparo prático, essa etapa costuma ser diluída em {0} mL de SF 0,9% ou SG 5%.":
    "Como preparación práctica, esa etapa suele diluirse en {0} mL de solución fisiológica 0,9% o de dextrosa al 5%.",
  "Dose total estimada da etapa: {0} g; a redosagem define se será necessário repetir outra etapa depois.":
    "Dosis total estimada de la etapa: {0} g; la nueva medición define si será necesario repetir otra etapa después.",
  "1 mL contém ~0,465 mEq de cálcio elementar; {0} mL fornecem ~{1} mEq.":
    "1 mL contiene ~0,465 mEq de calcio elemental; {0} mL aportan ~{1} mEq.",

  // ── Magnésio ───────────────────────────────────────────────────────────────
  "Necessidade estimada da etapa inicial: {0} g de sulfato de magnésio 50% ({1} mL da ampola 50% / 500 mg/mL).":
    "Necesidad estimada de la etapa inicial: {0} g de sulfato de magnesio al 50% ({1} mL de la ampolla al 50% / 500 mg/mL).",
  "Como preparo prático, essa etapa pode ser diluída em ~{0} mL de SF 0,9% ou SG 5%.":
    "Como preparación práctica, esa etapa puede diluirse en ~{0} mL de solución fisiológica 0,9% o de dextrosa al 5%.",
  "Dose total estimada da etapa: {0} g; etapas adicionais dependem de redosagem e contexto renal.":
    "Dosis total estimada de la etapa: {0} g; las etapas adicionales dependen de la nueva medición y del contexto renal.",

  // ── Fósforo ────────────────────────────────────────────────────────────────
  "Necessidade estimada da etapa inicial: {0} mmol de fósforo ({1} mL do concentrado 3 mmol/mL).":
    "Necesidad estimada de la etapa inicial: {0} mmol de fósforo ({1} mL del concentrado de 3 mmol/mL).",
  "{0} mmol de fosfato de potássio também entregam ~{1} mEq de K.":
    "{0} mmol de fosfato de potasio aportan además ~{1} mEq de K.",
  "{0} mmol de fosfato de sódio também entregam ~{1} mEq de Na.":
    "{0} mmol de fosfato de sodio aportan además ~{1} mEq de Na.",
  "Se esta etapa for programada em {0} h, a taxa fica ~ {1} mmol/h; o tempo mínimo por segurança segue sendo ≈ {2} h.":
    "Si esta etapa se programa en {0} h, la velocidad queda en ~ {1} mmol/h; el tiempo mínimo por seguridad sigue siendo ≈ {2} h.",
  "Para essa dose, o tempo mínimo por segurança é ≈ {0} h; defina a duração da etapa se quiser converter em mmol/h.":
    "Para esa dosis, el tiempo mínimo por seguridad es ≈ {0} h; defina la duración de la etapa si quiere convertirlo a mmol/h.",
  "Dose total estimada da etapa: {0} mmol; a necessidade total do dia pode ser maior e depende da redosagem.":
    "Dosis total estimada de la etapa: {0} mmol; la necesidad total del día puede ser mayor y depende de la nueva medición.",

  // ── Cloro ──────────────────────────────────────────────────────────────────
  "Valor atual ({0})": "Valor actual ({0})",
  "Magnésio atual ({0})": "Magnesio actual ({0})",
  "Déficit rough de cloro: ~{0} mEq.": "Déficit aproximado de cloruro: ~{0} mEq.",
  "Isso corresponde a ~{0} L de SF 0,9% se a estratégia for só cloreto de sódio.":
    "Eso corresponde a ~{0} L de solución fisiológica 0,9% si la estrategia es solo cloruro de sodio.",
};
