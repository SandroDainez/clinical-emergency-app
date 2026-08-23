/**
 * Calculadora de eletrólitos — dicionário PT → ES. Parte 2 de 2:
 * condutas, doses, sais, soluções de infusão, limites de acesso/velocidade,
 * controles e cenários de preparo.
 */
export const ES_ELETROLITOS_2: Record<string, string> = {
  // ── Doses e apresentações ──────────────────────────────────────────────────
  "1 g de gluconato de cálcio 10%": "1 g de gluconato de calcio al 10%",
  "2 g de gluconato de cálcio 10%": "2 g de gluconato de calcio al 10%",
  "30 mL de gluconato de cálcio 10%": "30 mL de gluconato de calcio al 10%",
  "gluconato de cálcio 10%": "gluconato de calcio al 10%",
  "1 g de sulfato de magnésio": "1 g de sulfato de magnesio",
  "2 g de sulfato de magnésio": "2 g de sulfato de magnesio",
  "sulfato de magnésio 50%": "sulfato de magnesio al 50%",
  "20 mEq de KCl": "20 mEq de KCl",
  "40 mEq de KCl": "40 mEq de KCl",
  "KCl 19,1% (2,5 mEq/mL)": "KCl al 19,1% (2,5 mEq/mL)",
  "KCl 19,1% / 2,5 mEq/mL": "KCl al 19,1% / 2,5 mEq/mL",
  "15 mmol de fósforo": "15 mmol de fósforo",
  "30 mmol de fósforo": "30 mmol de fósforo",
  "45 mmol de fósforo": "45 mmol de fósforo",
  "fosfato 3 mmol/mL": "fosfato 3 mmol/mL",
  "25 g de glicose": "25 g de glucosa",
  "glicose hipertônica 50%": "glucosa hipertónica al 50%",
  "frasco 4 mg/5 mL": "vial 4 mg/5 mL",
  "Ácido zoledrônico 4 mg": "Ácido zoledrónico 4 mg",
  "10–20 min": "10–20 min",
  "20–30 min": "20–30 min",

  // ── Sais de fosfato ────────────────────────────────────────────────────────
  "Fosfato de K": "Fosfato de K",
  "Fosfato de Na": "Fosfato de Na",
  "Fosfato de potássio": "Fosfato de potasio",
  "Fosfato de sódio": "Fosfato de sodio",
  "Com K baixo, o fosfato de potássio costuma fazer mais sentido por corrigir dois problemas de uma vez.":
    "Con un K bajo, el fosfato de potasio suele tener más sentido porque corrige dos problemas a la vez.",
  "Com K normal-alto, reavaliar se o melhor sal não passa a ser o fosfato de sódio.":
    "Con un K normal-alto, reevaluar si la mejor sal no pasa a ser el fosfato de sodio.",
  "Como o K está baixo, o fosfato de sódio pode perder a oportunidade de corrigir a hipocalemia associada.":
    "Como el K está bajo, el fosfato de sodio puede perder la oportunidad de corregir la hipopotasemia asociada.",
  "Fosfato de sódio é útil quando o potássio já está adequado ou quando se quer evitar carga adicional de K.":
    "El fosfato de sodio es útil cuando el potasio ya es adecuado o cuando se quiere evitar una carga adicional de K.",
  "Evitar infundir cálcio junto com fosfato na mesma linha pela precipitação.":
    "Evitar infundir el calcio junto con el fosfato en la misma vía por el riesgo de precipitación.",
  "Se houver hipocalcemia significativa, lembrar do risco de produto Ca x P alto e de precipitação tecidual.":
    "Si hay una hipocalcemia significativa, recordar el riesgo de un producto Ca × P alto y de precipitación tisular.",

  // ── Hipercalemia: as três frentes ──────────────────────────────────────────
  "ECG primeiro, depois cálcio se houver alteração ou K muito alto.":
    "Primero el ECG, después el calcio si hay alteración o el K está muy alto.",
  "Se o ECG é o problema, o cálcio entra antes da discussão etiológica completa.":
    "Si el ECG es el problema, el calcio entra antes de completar la discusión etiológica.",
  "Infundir em 10 minutos se houver alteração de ECG ou hipercalemia grave; repetir se ECG não melhorar.":
    "Infundir en 10 minutos si hay alteración del ECG o hiperpotasemia grave; repetir si el ECG no mejora.",
  "Insulina regular 10 U IV + glicose 25 g IV.": "Insulina regular 10 U IV + glucosa 25 g IV.",
  "Salbutamol nebulizado 10–20 mg como adjuvante se tolerado.":
    "Salbutamol nebulizado 10–20 mg como adyuvante si se tolera.",
  "Interromper fontes de K, tratar acidose/IRA, considerar diurético se houver diurese.":
    "Interrumpir las fuentes de K, tratar la acidosis o la lesión renal aguda, y considerar un diurético si hay diuresis.",
  "Repetir potássio após a fase de shift; o paciente pode 'rebote' se não remover K do corpo.":
    "Repetir el potasio tras la fase de desplazamiento; el paciente puede tener un rebote si no se elimina el K del cuerpo.",
  "Se acidose metabólica coexistente, bicarbonato pode entrar como adjuvante em cenários selecionados, mas não substitui cálcio/insulina/TRS.":
    "Si coexiste una acidosis metabólica, el bicarbonato puede entrar como adyuvante en escenarios seleccionados, pero no sustituye al calcio, la insulina ni la terapia de reemplazo renal.",
  "Se oligúria, refratariedade ou hipercalemia persistente: discutir terapia renal substitutiva.":
    "Si hay oliguria, refractariedad o hiperpotasemia persistente: discutir la terapia de reemplazo renal.",

  // ── Hipercalcemia ──────────────────────────────────────────────────────────
  "Calcitonina ajuda mais rápido; bisfosfonato corrige a médio prazo.":
    "La calcitonina actúa más rápido; el bifosfonato corrige a medio plazo.",
  "Calcitonina ajuda nas primeiras horas; o anti-reabsortivo sustenta a queda depois.":
    "La calcitonina ayuda en las primeras horas; el antirresortivo sostiene el descenso después.",

  // ── Hiper/hipomagnesemia e hiperfosfatemia ─────────────────────────────────
  "Suspender toda fonte de magnésio e repetir dosagem seriada.":
    "Suspender toda fuente de magnesio y repetir la medición de forma seriada.",
  "Monitorar creatinina, volume urinário e ECG.":
    "Monitorizar la creatinina, el volumen urinario y el ECG.",
  "Se houver apneia ou bloqueio importante, escalar suporte e considerar TRS rapidamente.":
    "Si hay apnea o un bloqueo importante, escalar el soporte y considerar la terapia de reemplazo renal con rapidez.",
  "Se estável: correr 1–2 g em 1 h e repetir conforme resposta e função renal.":
    "Si está estable: administrar 1–2 g en 1 h y repetir según la respuesta y la función renal.",
  "Cada mL da solução 50% contém ~500 mg e ~4,06 mEq de magnésio.":
    "Cada mL de la solución al 50% contiene ~500 mg y ~4,06 mEq de magnesio.",
  "Suspender fontes exógenas de fósforo e revisar função renal.":
    "Suspender las fuentes exógenas de fósforo y revisar la función renal.",
  "Considerar quelantes conforme contexto e indicação nefrológica, especialmente se o intestino ainda é a principal via de entrada.":
    "Considerar quelantes según el contexto y la indicación nefrológica, especialmente si el intestino sigue siendo la principal vía de entrada.",
  "Se doença renal grave, hipocalcemia sintomática, rabdomiólise importante ou fósforo muito alto persistente: discutir terapia renal substitutiva.":
    "Si hay enfermedad renal grave, hipocalcemia sintomática, rabdomiólisis importante o un fósforo muy alto persistente: discutir la terapia de reemplazo renal.",
  "Associar suporte ventilatório e hemodinâmico conforme quadro; considerar diurético/diálise se rim não depura.":
    "Asociar soporte ventilatorio y hemodinámico según el cuadro; considerar diurético o diálisis si el riñón no depura.",
  "Associar suporte ventilatório e hemodinâmico; com rim disfuncionante, a chance de precisar diálise é mais alta.":
    "Asociar soporte ventilatorio y hemodinámico; con un riñón disfuncionante, la probabilidad de necesitar diálisis es mayor.",
  "Avaliar cálcio, magnésio, potássio, função renal e acidose associada.":
    "Evaluar el calcio, el magnesio, el potasio, la función renal y la acidosis asociada.",

  // ── Hipocalcemia ───────────────────────────────────────────────────────────
  "Se houver instabilidade elétrica ou tetania franca, tratar antes de aguardar cálcio corrigido final.":
    "Si hay inestabilidad eléctrica o tetania franca, tratar antes de esperar el calcio corregido final.",
  "Se houver broncoespasmo, laringoespasmo, tetania ou instabilidade elétrica, tratar pela clínica e não pelo perfeccionismo laboratorial.":
    "Si hay broncoespasmo, laringoespasmo, tetania o inestabilidad eléctrica, tratar según la clínica y no por el perfeccionismo del laboratorio.",

  // ── Hipocalemia: acesso e velocidade ───────────────────────────────────────
  "No acesso periférico, a estratégia desta tela é conservadora: até 10 mEq/h e concentração final até ~40 mEq/L; defina bolsa e tempo para checar a etapa.":
    "Por acceso periférico, la estrategia de esta pantalla es conservadora: hasta 10 mEq/h y una concentración final de hasta ~40 mEq/L; defina la bolsa y el tiempo para comprobar la etapa.",
  "No acesso central com ECG contínuo, a etapa pode subir até ~20 mEq/h e tolera concentrações maiores (referência prática ~80 mEq/L).":
    "Por acceso central con ECG continuo, la etapa puede subir hasta ~20 mEq/h y tolera concentraciones mayores (referencia práctica ~80 mEq/L).",
  "Concentração final acima de ~40 mEq/L em acesso periférico aumenta risco de flebite e erro operacional.":
    "Una concentración final superior a ~40 mEq/L por acceso periférico aumenta el riesgo de flebitis y de error operativo.",
  "Concentração final acima de ~80 mEq/L em acesso central pede checagem rigorosa da etapa e monitorização contínua.":
    "Una concentración final superior a ~80 mEq/L por acceso central exige una comprobación rigurosa de la etapa y monitorización continua.",
  "Via central: permite etapa mais concentrada e mais rápida, mas exige ECG contínuo e checagem operacional mais rígida.":
    "Vía central: permite una etapa más concentrada y rápida, pero exige ECG continuo y una comprobación operativa más estricta.",
  "Via periférica: preferir etapas menores e mais diluídas; se a necessidade prática ultrapassar esse limite, o acesso central muda a execução.":
    "Vía periférica: preferir etapas menores y más diluidas; si la necesidad práctica supera ese límite, el acceso central cambia la ejecución.",
  "Se sódio não permitir mais cloreto de sódio, pensar em KCl ou ajuste de solução conforme contexto.":
    "Si el sodio no permite más cloruro de sodio, pensar en KCl o en ajustar la solución según el contexto.",
  "Se houver íleo, arritmia, fraqueza importante ou rabdomiólise, o limiar para reposição IV monitorada é menor.":
    "Si hay íleo, arritmia, debilidad importante o rabdomiólisis, el umbral para la reposición IV monitorizada es menor.",

  // ── Hipofosfatemia: acesso e velocidade ────────────────────────────────────
  "Acesso central: máximo prático de 15 mmol/h para o fósforo.":
    "Acceso central: máximo práctico de 15 mmol/h para el fósforo.",
  "Acesso periférico: máximo prático de 6,8 mmol/h para o fósforo.":
    "Acceso periférico: máximo práctico de 6,8 mmol/h para el fósforo.",
  "Dose alta de fósforo em acesso periférico pede atenção extra ao tempo mínimo e tolerância do acesso.":
    "Una dosis alta de fósforo por acceso periférico exige atención extra al tiempo mínimo y a la tolerancia del acceso.",
  "Sem indicação clara de etapa IV inicial, a reavaliação clínica pode apontar via oral ou observação.":
    "Sin una indicación clara de etapa IV inicial, la reevaluación clínica puede indicar la vía oral u observación.",

  // ── Hiponatremia: resgate e metas ──────────────────────────────────────────
  "O objetivo inicial não é normalizar o sódio, e sim retirar o paciente da zona de risco com segurança.":
    "El objetivo inicial no es normalizar el sodio, sino sacar al paciente de la zona de riesgo con seguridad.",
  "Após o bolus inicial, reavaliar; pode não ser necessário correr manutenção hipertônica se a meta inicial já foi atingida.":
    "Tras el bolo inicial, reevaluar; puede no ser necesario administrar el mantenimiento hipertónico si ya se alcanzó la meta inicial.",
  "Se convulsão, rebaixamento importante ou herniação iminente: repetir bolus após reavaliação clínica e novo sódio.":
    "Si hay convulsión, deterioro importante del sensorio o herniación inminente: repetir el bolo tras la reevaluación clínica y una nueva medición del sodio.",
  "Controles obrigatórios: sódio sérico e exame neurológico 1–2 h após cada bolus e depois a cada 4 h na fase de manutenção.":
    "Controles obligatorios: sodio sérico y exploración neurológica 1–2 h después de cada bolo y luego cada 4 h en la fase de mantenimiento.",
  "Controlar sódio sérico e exame neurológico a cada 4 h na manutenção, recalculando a velocidade conforme a resposta.":
    "Controlar el sodio sérico y la exploración neurológica cada 4 h en el mantenimiento, recalculando la velocidad según la respuesta.",
  "Se o sódio estiver subindo além do limite planejado, interromper a estratégia em curso e considerar relowering controlado.":
    "Si el sodio está subiendo por encima del límite planificado, interrumpir la estrategia en curso y considerar un descenso controlado.",
  "Sem neurogravidade, a correção costuma ser mais lenta e guiada pela causa de base.":
    "Sin gravedad neurológica, la corrección suele ser más lenta y guiada por la causa de base.",
  "Se o perfil clínico for euvolêmico/SIADH sem neurogravidade, a estratégia pode ser reduzir água livre e aumentar soluto, em vez de usar isotônico de rotina.":
    "Si el perfil clínico es euvolémico o de SIADH sin gravedad neurológica, la estrategia puede ser reducir el agua libre y aumentar el soluto, en lugar de usar isotónico de rutina.",
  "Se o contexto for hiponatremia hipovolêmica, a solução de escolha pode ser SF 0,9% ou cristalóide balanceado, desde que o objetivo inicial seja restaurar volume e perfusão.":
    "Si el contexto es una hiponatremia hipovolémica, la solución de elección puede ser solución fisiológica 0,9% o cristaloide balanceado, siempre que el objetivo inicial sea restaurar el volumen y la perfusión.",
  "Em hipovolemia, isotônico ou cristalóide balanceado fazem sentido como correção da causa; em SIADH, isotônico puro pode não resolver e às vezes piora a natremia.":
    "En la hipovolemia, el isotónico o el cristaloide balanceado tienen sentido como corrección de la causa; en el SIADH, el isotónico puro puede no resolver y a veces empeora la natremia.",
  "Evitar se o cenário real for hipovolemia, porque pode agravar depleção volêmica.":
    "Evitarlo si el escenario real es una hipovolemia, porque puede agravar la depleción de volumen.",
  "A ureia funciona como osmótico renal, favorecendo excreção de água livre; é estratégia de manutenção e não substitui o resgate com NaCl 3% se houver neurogravidade.":
    "La urea actúa como osmótico renal y favorece la excreción de agua libre; es una estrategia de mantenimiento y no sustituye el rescate con NaCl al 3% si hay gravedad neurológica.",
  "A lógica é aumentar a oferta de soluto e reduzir a capacidade de concentração urinária; exige acompanhamento de volume, potássio e função renal.":
    "La lógica es aumentar el aporte de soluto y reducir la capacidad de concentración urinaria; exige seguir el volumen, el potasio y la función renal.",
  "Alternativa de segunda linha em SIADH/moderada-profunda: combinar aumento de soluto com diurético de alça.":
    "Alternativa de segunda línea en el SIADH moderado a profundo: combinar el aumento de soluto con un diurético de asa.",
  "Na prática do módulo: comprimidos de NaCl oral em doses fracionadas + furosemida em baixa dose, especialmente quando a restrição hídrica isolada falha.":
    "En la práctica del módulo: comprimidos de NaCl oral en dosis fraccionadas + furosemida a dosis baja, especialmente cuando la restricción hídrica aislada fracasa.",
  "Associar restrição hídrica e monitorar sódio seriado; se a resposta estiver excessiva, frear para evitar sobrecorreção.":
    "Asociar la restricción hídrica y monitorizar el sodio de forma seriada; si la respuesta es excesiva, frenar para evitar la sobrecorrección.",
  "Desmopressina pode ser associada para travar a diurese aquosa e evitar que a correção siga acelerando.":
    "Puede asociarse desmopresina para frenar la diuresis acuosa y evitar que la corrección siga acelerándose.",
  "Esse cenário é de segurança e não de tratamento inicial rotineiro; usar com monitorização laboratorial estreita.":
    "Este escenario es de seguridad y no de tratamiento inicial de rutina; usarlo con monitorización de laboratorio estrecha.",
  "Repetir sódio a cada 2–4 h no início da correção, recalcular após cada resultado e rever balanço hídrico/diurese.":
    "Repetir el sodio cada 2–4 h al inicio de la corrección, recalcular tras cada resultado y revisar el balance hídrico y la diuresis.",

  // ── Hipernatremia: água livre e cenários ───────────────────────────────────
  "Pergunta prática: o cenário final é água livre pura, solução intermediária ou fluido customizado com sódio definido?":
    "Pregunta práctica: ¿el escenario final es agua libre pura, una solución intermedia o un líquido personalizado con sodio definido?",
  "A pergunta prática é: o paciente precisa de cloreto, de volume, de potássio ou dos três?":
    "La pregunta práctica es: ¿el paciente necesita cloruro, volumen, potasio o los tres?",
  "Esse número representa água livre equivalente, não um volume universal válido para qualquer fluido.":
    "Este número representa el agua libre equivalente, no un volumen universal válido para cualquier líquido.",
  "Esse número representa água livre equivalente. O volume infundido e o efeito no sódio dependem da solução escolhida.":
    "Este número representa el agua libre equivalente. El volumen infundido y el efecto sobre el sodio dependen de la solución elegida.",
  "Fase 1: se houver hipovolemia ou choque, estabilizar perfusão antes de focar na água livre.":
    "Fase 1: si hay hipovolemia o choque, estabilizar la perfusión antes de centrarse en el agua libre.",
  "Fase 2: após estabilização, programar a correção ao longo de 24 horas e recalcular com sódio seriado.":
    "Fase 2: tras la estabilización, programar la corrección a lo largo de 24 horas y recalcular con sodio seriado.",
  "Se houver instabilidade hemodinâmica, ressuscitar em etapas com isotônico e reavaliar sódio frequentemente, porque a natremia pode subir rápido após o bloqueio fisiológico de ADH se desfazer.":
    "Si hay inestabilidad hemodinámica, reanimar en etapas con isotónico y reevaluar el sodio con frecuencia, porque la natremia puede subir rápido cuando se deshace el bloqueo fisiológico de la ADH.",
  "Se houver diurese aquosa súbita ou subida mais rápida que a meta, reavaliar imediatamente a taxa e a estratégia.":
    "Si aparece una diuresis acuosa súbita o una subida más rápida que la meta, reevaluar de inmediato la velocidad y la estrategia.",
  "Monitorar diurese, balanço hídrico, glicemia e causa de base para evitar sobrecorreção e necessidade de frear a subida do sódio.":
    "Monitorizar la diuresis, el balance hídrico, la glucemia y la causa de base para evitar la sobrecorrección y la necesidad de frenar la subida del sodio.",
  "É a opção mais simples quando o cenário final é água livre pura e não há necessidade de manter sódio no fluido infundido.":
    "Es la opción más simple cuando el escenario final es agua libre pura y no hay necesidad de mantener sodio en el líquido infundido.",
  "Sem volume calculado, o SG 5% continua sendo a opção de água livre EV mais direta.":
    "Sin un volumen calculado, la dextrosa al 5% sigue siendo la opción de agua libre IV más directa.",
  "Quando o cálculo automático estiver disponível, a mistura fixa de SF 0,45% será sempre metade SF 0,9% e metade água destilada.":
    "Cuando el cálculo automático esté disponible, la mezcla fija de solución al 0,45% será siempre mitad solución fisiológica 0,9% y mitad agua destilada.",
  "Se houver bolsa pronta de 0,45% NaCl ou D5 0,45%, ela pode cumprir o mesmo papel prático dessa solução intermediária, conforme o contexto glicêmico e institucional.":
    "Si hay una bolsa preparada de NaCl al 0,45% o de dextrosa al 5% con NaCl al 0,45%, puede cumplir el mismo papel práctico que esta solución intermedia, según el contexto glucémico e institucional.",
  "Se o sódio final calculado da etapa ficar muito próximo de 0 mEq/L, na prática isso equivale a água livre e não exige acrescentar NaCl 20%.":
    "Si el sodio final calculado de la etapa queda muy cerca de 0 mEq/L, en la práctica equivale a agua libre y no exige añadir NaCl al 20%.",
  "Se entrar agua por sonda/oral, esse valor vira meta total de agua livre e o volume EV precisa ser compensado.":
    "Si entra agua por sonda o vía oral, ese valor pasa a ser la meta total de agua libre y el volumen IV debe compensarse.",
  "Sempre recalcular o plano endovenoso quando entrar água por sonda ou via oral; não somar os volumes sem compensação.":
    "Recalcular siempre el plan intravenoso cuando entre agua por sonda o vía oral; no sumar los volúmenes sin compensación.",
  "Preencha peso e sódio atual para destravar o volume automático da etapa inicial.":
    "Complete el peso y el sodio actual para habilitar el volumen automático de la etapa inicial.",
  "Preencha peso e sódio atual para destravar o preparo customizado com água destilada + NaCl 20%.":
    "Complete el peso y el sodio actual para habilitar la preparación personalizada con agua destilada + NaCl al 20%.",
  "Preencha peso e sódio para comparar SG 5%, solução tipo SF 0,45% e mistura customizada.":
    "Complete el peso y el sodio para comparar la dextrosa al 5%, una solución tipo NaCl al 0,45% y la mezcla personalizada.",

  // ── Cloro ──────────────────────────────────────────────────────────────────
  "A correção verdadeira é fisiológica: menos cloro entrando, mais água livre quando indicado, e tratar a causa da acidose.":
    "La corrección verdadera es fisiológica: menos cloruro entrando, más agua libre cuando esté indicado, y tratar la causa de la acidosis.",
  "Suspender/ reduzir soluções ricas em cloro se já não houver indicação hemodinâmica clara.":
    "Suspender o reducir las soluciones ricas en cloruro si ya no hay una indicación hemodinámica clara.",
  "Preferir cristalóide balanceado quando o problema é carga de cloro; se houver hipernatremia associada, integrar com a estratégia de água livre.":
    "Preferir el cristaloide balanceado cuando el problema es la carga de cloruro; si hay hipernatremia asociada, integrarlo con la estrategia de agua libre.",
  "No módulo, considere SF 0,9% quando quiser maior previsibilidade e cristalóide balanceado quando o contexto clínico favorecer menor carga de cloro.":
    "En el módulo, considere la solución fisiológica 0,9% cuando busque mayor previsibilidad y el cristaloide balanceado cuando el contexto clínico favorezca una menor carga de cloruro.",
  "Em diarreia ou acidose tubular renal, o alvo não é só baixar o cloro, mas corrigir a perda de bicarbonato e a causa de base.":
    "En la diarrea o la acidosis tubular renal, el objetivo no es solo bajar el cloruro, sino corregir la pérdida de bicarbonato y la causa de base.",
  "Reavaliar gasometria e função renal; nem toda hipercloremia isolada exige intervenção além de parar a carga.":
    "Reevaluar la gasometría y la función renal; no toda hipercloremia aislada exige una intervención más allá de detener la carga.",
  "Se hipovolêmico, SF 0,9% com reavaliação seriada; evitar cloreto em excesso se já houver hipercloremia importante.":
    "Si está hipovolémico, solución fisiológica 0,9% con reevaluación seriada; evitar el exceso de cloruro si ya hay una hipercloremia importante.",
  "Se houver acidemia, lembrar que parte do K pode subir ao corrigir o pH.":
    "Si hay acidemia, recordar que parte del K puede subir al corregir el pH.",
  "O número rough acima mostra a magnitude da carga acumulada no compartimento extracelular.":
    "El número aproximado de arriba muestra la magnitud de la carga acumulada en el compartimento extracelular.",
  "Como o potássio está baixo, parte da correção pode ser melhor feita com KCl em vez de só SF.":
    "Como el potasio está bajo, parte de la corrección puede hacerse mejor con KCl en lugar de solo solución fisiológica.",
  "Se houver disfunção renal, fracionar mais a reposição e redosar antes de acumular carga excessiva.":
    "Si hay disfunción renal, fraccionar más la reposición y volver a medir antes de acumular una carga excesiva.",

  // ── Cálculo da etapa ───────────────────────────────────────────────────────
  "Defina o tempo da etapa para converter a dose total em taxa horária.":
    "Defina el tiempo de la etapa para convertir la dosis total en una velocidad horaria.",
  "Defina tempo e bolsa final para calcular a bomba em mL/h da etapa programada.":
    "Defina el tiempo y la bolsa final para calcular la bomba en mL/h de la etapa programada.",
};
