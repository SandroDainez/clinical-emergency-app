/**
 * Calculadora de eletrólitos — dicionário PT → ES. Parte 1 de 2:
 * títulos dos distúrbios, sinais/sintomas, leitura de gravidade e contexto
 * (renal, ácido-base, magnésio, glicemia).
 *
 * Terminologia: hipopotasemia/hiperpotasemia, hipomagnesemia, hipocalcemia,
 * hipofosfatemia, hipernatremia, terapia de reemplazo renal (TRR),
 * solución fisiológica, dextrosa, gluconato de calcio, sulfato de magnesio.
 */
export const ES_ELETROLITOS_1: Record<string, string> = {
  // ── Nomes dos distúrbios ───────────────────────────────────────────────────
  "Hiponatremia": "Hiponatremia",
  "Hipernatremia": "Hipernatremia",
  "Hipocalemia": "Hipopotasemia",
  "Hipercalemia": "Hiperpotasemia",
  "Hipocalcemia": "Hipocalcemia",
  "Hipercalcemia": "Hipercalcemia",
  "Hipomagnesemia": "Hipomagnesemia",
  "Hipermagnesemia": "Hipermagnesemia",
  "Hipofosfatemia": "Hipofosfatemia",
  "Hiperfosfatemia": "Hiperfosfatemia",
  "Hipocloremia": "Hipocloremia",
  "Hipercloremia": "Hipercloremia",

  // ── Frases-guia de cada distúrbio ──────────────────────────────────────────
  "Hiponatremia: decidir pela gravidade neurológica e pela cronicidade presumida antes de escolher o ritmo de correção.":
    "Hiponatremia: decidir según la gravedad neurológica y la cronicidad presumida antes de elegir el ritmo de corrección.",
  "Hipernatremia: definir primeiro o cenário final da água livre, ressuscitar se necessário e então corrigir de forma seriada.":
    "Hipernatremia: definir primero el escenario final del agua libre, reanimar si es necesario y luego corregir de forma seriada.",
  "Hipocalemia: dose pelo risco elétrico, pelo acesso e pelo magnésio, não só pelo valor sérico.":
    "Hipopotasemia: dosificar según el riesgo eléctrico, el acceso y el magnesio, no solo por el valor sérico.",
  "Hipercalemia é manejo em três frentes: estabilizar membrana, fazer shift e remover potássio do corpo.":
    "La hiperpotasemia se maneja en tres frentes: estabilizar la membrana, desplazar el potasio y eliminarlo del cuerpo.",
  "Hipocalcemia relevante pede corrigir cálcio e ler o contexto: magnésio, fósforo, albumina e instabilidade elétrica.":
    "Una hipocalcemia relevante exige corregir el calcio y leer el contexto: magnesio, fósforo, albúmina e inestabilidad eléctrica.",
  "Hipercalcemia importante é sobretudo problema de volume, rim e causa de base; o laboratório acompanha a reversão clínica.":
    "La hipercalcemia importante es sobre todo un problema de volumen, riñón y causa de base; el laboratorio acompaña la reversión clínica.",
  "Hipomagnesemia: dose pelo contexto elétrico e renal, não só pelo número isolado.":
    "Hipomagnesemia: dosificar según el contexto eléctrico y renal, no solo por el número aislado.",
  "Hipermagnesemia grave é quadro de bloqueio neuromuscular e hemodinâmico: antagonizar, eliminar e monitorar.":
    "La hipermagnesemia grave es un cuadro de bloqueo neuromuscular y hemodinámico: antagonizar, eliminar y monitorizar.",
  "Hipofosfatemia: decidir pela gravidade, pelo potássio e pelo contexto renal antes de escolher o sal.":
    "Hipofosfatemia: decidir según la gravedad, el potasio y el contexto renal antes de elegir la sal.",
  "Hiperfosfatemia é sobretudo problema renal e de produto cálcio-fósforo; a conduta é reduzir carga, quelar quando indicado e depurar quando necessário.":
    "La hiperfosfatemia es sobre todo un problema renal y del producto calcio-fósforo; la conducta es reducir la carga, quelar cuando esté indicado y depurar cuando sea necesario.",
  "Hipocloremia útil à beira-leito costuma significar alcalose metabólica cloro-sensível até prova em contrário.":
    "La hipocloremia útil a pie de cama suele significar una alcalosis metabólica sensible al cloruro hasta que se demuestre lo contrario.",
  "Hipercloremia é geralmente problema de carga de cloro ou acidose associada, não falta de uma droga corretiva.":
    "La hipercloremia es en general un problema de carga de cloruro o de acidosis asociada, no la falta de un fármaco corrector.",

  // ── Sinais e sintomas ──────────────────────────────────────────────────────
  "Maior risco de confusão, sonolência, convulsão e herniação iminente se queda for aguda.":
    "Mayor riesgo de confusión, somnolencia, convulsión y herniación inminente si la caída es aguda.",
  "Costuma cursar com náusea, cefaleia, mal-estar e alteração neurológica mais discreta.":
    "Suele cursar con náusea, cefalea, malestar y una alteración neurológica más discreta.",
  "Sede intensa, irritabilidade, fraqueza, letargia, mioclonias e convulsão.":
    "Sed intensa, irritabilidad, debilidad, letargo, mioclonías y convulsión.",
  "Sede intensa, letargia, irritabilidade, mioclonia e convulsão; monitorização próxima.":
    "Sed intensa, letargo, irritabilidad, mioclonía y convulsión; monitorización estrecha.",
  "Sede, fraqueza, irritabilidade e desidratação são os achados mais comuns.":
    "Sed, debilidad, irritabilidad y deshidratación son los hallazgos más frecuentes.",
  "Fraqueza importante, íleo, paralisia, rabdomiólise e arritmia.":
    "Debilidad importante, íleo, parálisis, rabdomiólisis y arritmia.",
  "Fraqueza, câimbras, íleo, poliúria e arritmias.":
    "Debilidad, calambres, íleo, poliuria y arritmias.",
  "Cãibras, fraqueza, poliúria e palpitação são mais prováveis.":
    "Los calambres, la debilidad, la poliuria y las palpitaciones son más probables.",
  "Fraqueza, parestesia, bloqueios, QRS largo, bradicardia e risco de parada.":
    "Debilidad, parestesias, bloqueos, QRS ancho, bradicardia y riesgo de paro.",
  "Fraqueza, parestesias e progressão elétrica se o potássio continuar subindo.":
    "Debilidad, parestesias y progresión eléctrica si el potasio sigue subiendo.",
  "Bradicardia, QRS alargado, bloqueios e risco de parada elétrica.":
    "Bradicardia, QRS ancho, bloqueos y riesgo de paro eléctrico.",
  "Parestesia perioral, cãibra, tetania, broncoespasmo, QT longo e convulsão.":
    "Parestesias periorales, calambres, tetania, broncoespasmo, QT largo y convulsión.",
  "Parestesia perioral, câimbras e desconforto neuromuscular.":
    "Parestesias periorales, calambres y molestia neuromuscular.",
  "Tetania, broncoespasmo, convulsão e QT longo.":
    "Tetania, broncoespasmo, convulsión y QT largo.",
  "Desidratação, náusea, constipação, poliúria, encefalopatia e QT curto.":
    "Deshidratación, náusea, estreñimiento, poliuria, encefalopatía y QT corto.",
  "Náusea, constipação, poliúria e fadiga predominam.":
    "Predominan la náusea, el estreñimiento, la poliuria y la fatiga.",
  "Encefalopatia, desidratação importante, disfunção renal e maior chance de UTI.":
    "Encefalopatía, deshidratación importante, disfunción renal y mayor probabilidad de UCI.",
  "Tremor, hiperreflexia, tetania, convulsão, QT longo e torsades.":
    "Temblor, hiperreflexia, tetania, convulsión, QT largo y torsades.",
  "QT longo, torsades, tremor, tetania e convulsão.":
    "QT largo, torsades, temblor, tetania y convulsión.",
  "Tremor, fraqueza e piora de hipocalemia refratária.":
    "Temblor, debilidad y empeoramiento de la hipopotasemia refractaria.",
  "Hiporreflexia, rubor, hipotensão, bradicardia, sonolência e depressão respiratória.":
    "Hiporreflexia, rubor, hipotensión, bradicardia, somnolencia y depresión respiratoria.",
  "Hiporreflexia, sonolência, hipotensão e depressão respiratória.":
    "Hiporreflexia, somnolencia, hipotensión y depresión respiratoria.",
  "Rubor, letargia e reflexos diminuídos podem aparecer.":
    "Pueden aparecer rubor, letargo y reflejos disminuidos.",
  "Fraqueza diafragmática, insuficiência respiratória, rabdomiólise e hemólise.":
    "Debilidad diafragmática, insuficiencia respiratoria, rabdomiólisis y hemólisis.",
  "Fraqueza, insuficiência respiratória, disfunção miocárdica, rabdomiólise e hemólise.":
    "Debilidad, insuficiencia respiratoria, disfunción miocárdica, rabdomiólisis y hemólisis.",
  "Fraqueza e queda de performance muscular são os sinais mais prováveis.":
    "La debilidad y la caída del rendimiento muscular son los signos más probables.",
  "Muitas vezes o problema se manifesta pela hipocalcemia associada: tetania, QT longo, parestesias.":
    "Muchas veces el problema se manifiesta por la hipocalcemia asociada: tetania, QT largo, parestesias.",
  "Muitas vezes o quadro aparece como hipocalcemia associada: parestesia, tetania e QT longo.":
    "Muchas veces el cuadro aparece como hipocalcemia asociada: parestesias, tetania y QT largo.",
  "Muitas vezes o quadro é o da alcalose metabólica: hipoventilação, fraqueza, parestesias e arritmias se coexistir hipocalemia.":
    "Muchas veces el cuadro es el de la alcalosis metabólica: hipoventilación, debilidad, parestesias y arritmias si coexiste hipopotasemia.",
  "Pistas de alcalose metabólica: hipoventilação, fraqueza, parestesia e hipocalemia associada.":
    "Pistas de alcalosis metabólica: hipoventilación, debilidad, parestesias e hipopotasemia asociada.",
  "Taquipneia compensatória, acidose metabólica e piora renal se a carga de cloro persistir.":
    "Taquipnea compensadora, acidosis metabólica y empeoramiento renal si la carga de cloruro persiste.",
  "Taquipneia compensatória, piora da acidose, fraqueza e disfunção renal associada.":
    "Taquipnea compensadora, empeoramiento de la acidosis, debilidad y disfunción renal asociada.",
  "Perda do reflexo patelar costuma aparecer em níveis altos; depressão respiratória e hipotensão marcam intoxicação importante.":
    "La pérdida del reflejo rotuliano suele aparecer con niveles altos; la depresión respiratoria y la hipotensión marcan una intoxicación importante.",
  "Nível alto de magnésio com clínica compatível pode evoluir com bloqueio neuromuscular e depressão respiratória.":
    "Un nivel alto de magnesio con clínica compatible puede evolucionar con bloqueo neuromuscular y depresión respiratoria.",

  // ── Leitura de gravidade por valor ─────────────────────────────────────────
  "Na < 120 mEq/L aumenta a chance de neurogravidade, mas a decisão do resgate continua sendo clínica.":
    "Un Na < 120 mEq/L aumenta la probabilidad de gravedad neurológica, pero la decisión del rescate sigue siendo clínica.",
  "Na corrigido < 120 mEq/L exige redosagem precoce e vigilância para neurogravidade e sobrecorreção.":
    "Un Na corregido < 120 mEq/L exige nueva medición precoz y vigilancia de la gravedad neurológica y de la sobrecorrección.",
  "Na >= 160 mEq/L pede monitorização mais próxima e reavaliação seriada nas primeiras horas.":
    "Un Na ≥ 160 mEq/L exige una monitorización más estrecha y reevaluación seriada en las primeras horas.",
  "Se Na >= 160 mEq/L, assumir distúrbio importante e trabalhar com reavaliações mais próximas no início da correção.":
    "Si el Na ≥ 160 mEq/L, asumir un trastorno importante y trabajar con reevaluaciones más frecuentes al inicio de la corrección.",
  "Se Na < 160 mEq/L e paciente estável, manter estratégia conservadora com reavaliação seriada.":
    "Si el Na < 160 mEq/L y el paciente está estable, mantener una estrategia conservadora con reevaluación seriada.",
  "K < 2,5 mEq/L deve ser lido como distúrbio grave, com reposição monitorada e redosagem mais precoce.":
    "Un K < 2,5 mEq/L debe leerse como un trastorno grave, con reposición monitorizada y nueva medición más precoz.",
  "K < 2,5 mEq/L pede reposição monitorada e redosagem mais precoce.":
    "Un K < 2,5 mEq/L exige reposición monitorizada y nueva medición más precoz.",
  "Se K < 2,5 mEq/L, alteração de ECG, paralisia ou rabdomiólise: correção mais agressiva e monitorada.":
    "Si el K < 2,5 mEq/L, hay alteración del ECG, parálisis o rabdomiólisis: corrección más agresiva y monitorizada.",
  "Se K entre 2,5 e 3 mEq/L, a reposição ainda é relevante, mas o cenário clínico decide o quanto correr agora.":
    "Si el K está entre 2,5 y 3 mEq/L, la reposición sigue siendo relevante, pero el escenario clínico decide cuánto administrar ahora.",
  "Se K ≥ 6,5 mEq/L ou ECG alterado, tratar como emergência mesmo antes da causa definitiva.":
    "Si el K ≥ 6,5 mEq/L o el ECG está alterado, tratarlo como una emergencia incluso antes de establecer la causa definitiva.",
  "ECG alterado ou K >= 6,5 mEq/L: tratar imediatamente como emergência elétrica.":
    "ECG alterado o K ≥ 6,5 mEq/L: tratarlo de inmediato como una emergencia eléctrica.",
  "Se Ca corrigido < 7 mg/dL, tetania, convulsão ou QT longo, a reposição IV ganha prioridade prática.":
    "Si el Ca corregido < 7 mg/dL, o hay tetania, convulsión o QT largo, la reposición IV gana prioridad práctica.",
  "Hipocalcemia nesta faixa pede atenção para QT longo, tetania e convulsão.":
    "La hipocalcemia en este rango exige atención al QT largo, la tetania y la convulsión.",
  "Se a hipocalcemia é menos intensa e o paciente estável, o contexto e a causa definem o restante da correção.":
    "Si la hipocalcemia es menos intensa y el paciente está estable, el contexto y la causa definen el resto de la corrección.",
  "Ca >= 14 mg/dL aumenta a chance de deterioração neurológica, renal e necessidade de ambiente monitorado.":
    "Un Ca ≥ 14 mg/dL aumenta la probabilidad de deterioro neurológico, renal y de necesitar un entorno monitorizado.",
  "Ca >= 14 mg/dL reforça gravidade e aumenta a chance de precisar ambiente monitorado/UTI.":
    "Un Ca ≥ 14 mg/dL refuerza la gravedad y aumenta la probabilidad de requerir un entorno monitorizado o UCI.",
  "Se Ca < 14 mg/dL, sintomas e função renal ajudam a definir urgência e local de cuidado.":
    "Si el Ca < 14 mg/dL, los síntomas y la función renal ayudan a definir la urgencia y el lugar de atención.",
  "Se Ca muito alto com alteração neurológica ou renal, pensar em manejo de UTI.":
    "Si el Ca está muy alto con alteración neurológica o renal, pensar en un manejo de UCI.",
  "Mg < 1,2 mg/dL com clínica compatível pede reposição IV monitorada.":
    "Un Mg < 1,2 mg/dL con clínica compatible exige reposición IV monitorizada.",
  "Se Mg < 1,2 mg/dL, alteração elétrica ou convulsão: preferir reposição IV monitorada.":
    "Si el Mg < 1,2 mg/dL, hay alteración eléctrica o convulsión: preferir la reposición IV monitorizada.",
  "Se Mg entre 1,2 e 1,6 mg/dL, o alvo é quebrar o ciclo clínico e reavaliar, não normalizar em uma única bolsa.":
    "Si el Mg está entre 1,2 y 1,6 mg/dL, el objetivo es romper el ciclo clínico y reevaluar, no normalizarlo en una sola bolsa.",
  "Se Mg < 1 mg/dL, repleção adicional nas próximas 12–24 h costuma ser necessária mesmo após a dose inicial.":
    "Si el Mg < 1 mg/dL, suele ser necesaria una repleción adicional en las próximas 12–24 h incluso tras la dosis inicial.",
  "Fósforo < 1 mg/dL aumenta risco de falência muscular, respiratória e miocárdica.":
    "Un fósforo < 1 mg/dL aumenta el riesgo de fallo muscular, respiratorio y miocárdico.",
  "Se fósforo < 1 mg/dL, tratar como distúrbio grave mesmo antes da falência muscular se a clínica for compatível.":
    "Si el fósforo < 1 mg/dL, tratarlo como un trastorno grave incluso antes del fallo muscular si la clínica es compatible.",
  "Se fósforo entre 1 e 2 mg/dL, a decisão entre via IV e oral depende de sintomas, via enteral e contexto clínico.":
    "Si el fósforo está entre 1 y 2 mg/dL, la decisión entre la vía IV y la oral depende de los síntomas, la vía enteral y el contexto clínico.",
  "Se fósforo > 2 mg/dL e quadro estável, considerar via oral / observação.":
    "Si el fósforo > 2 mg/dL y el cuadro es estable, considerar la vía oral u observación.",
  "Se fósforo > 2 mg/dL e quadro estável, geralmente cabe conduta menos agressiva.":
    "Si el fósforo > 2 mg/dL y el cuadro es estable, en general corresponde una conducta menos agresiva.",
  "Cl < 95 mEq/L reforça leitura de alcalose cloro-sensível, sobretudo se houver vômitos, sucção gástrica ou diurético.":
    "Un Cl < 95 mEq/L refuerza la lectura de alcalosis sensible al cloruro, sobre todo si hay vómitos, aspiración gástrica o diuréticos.",
  "Cl >= 115 mEq/L pede revisão agressiva do balanço hídrico e da carga recente de SF, bicarbonato perdido ou TRS.":
    "Un Cl ≥ 115 mEq/L exige una revisión agresiva del balance hídrico y de la carga reciente de solución fisiológica, de la pérdida de bicarbonato o de la terapia de reemplazo renal.",
  "Cl >= 115 mEq/L pede revisão ativa da carga recente de cloro e do balanço hídrico.":
    "Un Cl ≥ 115 mEq/L exige una revisión activa de la carga reciente de cloruro y del balance hídrico.",
  "Em hipocloremia menos intensa, o contexto de volume e bicarbonato decide mais do que o número isolado.":
    "En una hipocloremia menos intensa, el contexto de volumen y bicarbonato decide más que el número aislado.",
  "Se a elevação é mais discreta, a tendência e a gasometria valem mais que um número isolado.":
    "Si la elevación es más discreta, la tendencia y la gasometría valen más que un número aislado.",

  // ── Contexto: cronicidade, causa, mecanismo ────────────────────────────────
  "Quadros agudos elevam risco de hemorragia intracraniana; quadros crônicos toleram valores mais altos, mas não correção rápida.":
    "Los cuadros agudos elevan el riesgo de hemorragia intracraneal; los crónicos toleran valores más altos, pero no una corrección rápida.",
  "Hiperglicemia pode mascarar a intensidade da hiponatremia; interpretar sempre o sódio corrigido.":
    "La hiperglucemia puede enmascarar la intensidad de la hiponatremia; interpretar siempre el sodio corregido.",
  "A maior parte do déficit é intracelular; o número sérico subestima o problema quando a queda é importante.":
    "La mayor parte del déficit es intracelular; el valor sérico subestima el problema cuando la caída es importante.",
  "Alcalose, beta-agonista e insulina podem baixar o K por redistribuição; diarreia, diurético e hiperaldosteronismo sugerem perda real.":
    "La alcalosis, los agonistas beta y la insulina pueden bajar el K por redistribución; la diarrea, los diuréticos y el hiperaldosteronismo sugieren una pérdida real.",
  "Perdas GI, alcoolismo, diuréticos e aminoglicosídeos sugerem déficit corporal total maior do que o valor sérico mostra.":
    "Las pérdidas digestivas, el alcoholismo, los diuréticos y los aminoglucósidos sugieren un déficit corporal total mayor que el que muestra el valor sérico.",
  "Cetoacidose, realimentação e alcalose respiratória podem derrubar o fósforo por redistribuição; o contexto ajuda a não supertratar.":
    "La cetoacidosis, la realimentación y la alcalosis respiratoria pueden bajar el fósforo por redistribución; el contexto ayuda a no sobretratar.",
  "Albumina baixa pode reduzir o cálcio total sem necessariamente traduzir a mesma gravidade do cálcio ionizado.":
    "Una albúmina baja puede reducir el calcio total sin traducir necesariamente la misma gravedad del calcio ionizado.",
  "Quando malignidade, hiperparatireoidismo ou vitamina D estão em jogo, tratar a causa é parte da correção real.":
    "Cuando están en juego una neoplasia, el hiperparatiroidismo o la vitamina D, tratar la causa es parte de la corrección real.",
  "A urina cloro baixa sugere forma cloro-responsiva; urina cloro alta empurra a investigação para perdas renais/mineralocorticoide.":
    "Un cloruro urinario bajo sugiere una forma sensible al cloruro; un cloruro urinario alto orienta la investigación hacia pérdidas renales o exceso mineralocorticoide.",
  "Olhar o conjunto com bicarbonato, sódio e volume administrado nas últimas horas.":
    "Mirar el conjunto con el bicarbonato, el sodio y el volumen administrado en las últimas horas.",
  "Se pseudohipercalemia for possível, repetir amostra sem garrote prolongado e sem hemólise.":
    "Si es posible una pseudohiperpotasemia, repetir la muestra sin torniquete prolongado y sin hemólisis.",
  "Se houver acidemia, lembrar que parte do K pode subir ao corrigir o pH; o número atual pode subestimar a variabilidade do caso.":
    "Si hay acidemia, recordar que parte del K puede subir al corregir el pH; el valor actual puede subestimar la variabilidad del caso.",
  "Se o paciente estiver poliúrico ou com perda renal contínua de água, o déficit calculado subestima a necessidade real e o plano precisa incorporar as perdas em curso.":
    "Si el paciente está poliúrico o con pérdida renal continua de agua, el déficit calculado subestima la necesidad real y el plan debe incorporar las pérdidas en curso.",

  // ── Contexto: magnésio associado ───────────────────────────────────────────
  "Mg baixo favorece hipocalemia refratária; considerar reposição concomitante em vez de tratar só o K.":
    "Un Mg bajo favorece la hipopotasemia refractaria; considerar la reposición concomitante en lugar de tratar solo el K.",
  "Como o magnésio está baixo, vale repor Mg em paralelo para evitar hipocalemia refratária.":
    "Como el magnesio está bajo, conviene reponerlo en paralelo para evitar una hipopotasemia refractaria.",
  "Como o magnésio está claramente baixo, a reposição de Mg precisa entrar junto; tratar só o K tende a falhar.":
    "Como el magnesio está claramente bajo, su reposición debe entrar en conjunto; tratar solo el K tiende a fracasar.",
  "Mg muito baixo reforça risco arrítmico e reduz a chance de o K subir de forma sustentada; corrigir magnésio em paralelo.":
    "Un Mg muy bajo refuerza el riesgo arrítmico y reduce la probabilidad de que el K suba de forma sostenida; corregir el magnesio en paralelo.",
  "Se K baixo persistente, procurar e corrigir Mg concomitante.":
    "Si el K bajo persiste, buscar y corregir el Mg concomitante.",
  "Se o magnésio não foi dosado, vale lembrar dele quando o K não responder como esperado.":
    "Si no se midió el magnesio, conviene recordarlo cuando el K no responda como se espera.",
  "Se houver suspeita de deficiência de Mg e ele ainda não foi dosado, a reposição de K pode parecer insuficiente mesmo com dose adequada.":
    "Si se sospecha un déficit de Mg y aún no se midió, la reposición de K puede parecer insuficiente incluso con una dosis adecuada.",
  "Hipomagnesemia pode impedir correção sustentada do cálcio; fósforo alto e DRC mudam a interpretação e a segurança da reposição.":
    "La hipomagnesemia puede impedir una corrección sostenida del calcio; un fósforo alto y la enfermedad renal crónica cambian la interpretación y la seguridad de la reposición.",
  "Se houver torsades, QT longo ou hipocalemia refratária, tratar o Mg como prioridade elétrica mesmo antes do resultado de controle.":
    "Si hay torsades, QT largo o hipopotasemia refractaria, tratar el Mg como prioridad eléctrica incluso antes del resultado de control.",
  "Mg concomitante sugerido: considerar 1–2 g de sulfato de magnésio IV se o objetivo for quebrar refratariedade do K.":
    "Mg concomitante sugerido: considerar 1–2 g de sulfato de magnesio IV si el objetivo es romper la refractariedad del K.",
  "Mg concomitante sugerido: considerar 2 g de sulfato de magnésio IV na etapa inicial, com redosagem conforme rim e controle.":
    "Mg concomitante sugerido: considerar 2 g de sulfato de magnesio IV en la etapa inicial, con nueva dosificación según el riñón y el control.",

  // ── Contexto: função renal ─────────────────────────────────────────────────
  "Disfunção renal aumenta a chance de persistência e necessidade de diálise.":
    "La disfunción renal aumenta la probabilidad de persistencia y de necesitar diálisis.",
  "Disfunção renal aumenta o risco de acúmulo ao repetir magnésio.":
    "La disfunción renal aumenta el riesgo de acumulación al repetir el magnesio.",
  "Disfunção renal pode sustentar hipercloremia e acidose apesar de retirar a carga exógena.":
    "La disfunción renal puede sostener la hipercloremia y la acidosis a pesar de retirar la carga exógena.",
  "Disfunção renal reduz a confiabilidade do plano teórico isolado; acompanhar balanço e resposta real.":
    "La disfunción renal reduce la fiabilidad del plan teórico aislado; seguir el balance y la respuesta real.",
  "Disfunção renal reduz a utilidade de corrigir só o cloro sem reavaliar volume e potássio.":
    "La disfunción renal reduce la utilidad de corregir solo el cloruro sin reevaluar el volumen y el potasio.",
  "Disfunção renal reduz remoção corporal do K e baixa o limiar para discutir TRS.":
    "La disfunción renal reduce la eliminación corporal del K y baja el umbral para discutir la terapia de reemplazo renal.",
  "Com disfunção renal, expansão volêmica e anti-reabsortivo exigem leitura mais conservadora.":
    "Con disfunción renal, la expansión de volumen y el antirresortivo exigen una lectura más conservadora.",
  "Com disfunção renal, fósforo IV exige redosagem mais precoce e mais parcimônia.":
    "Con disfunción renal, el fósforo IV exige una nueva dosificación más precoz y más parsimonia.",
  "Com disfunção renal, não empilhar ampolas sem novo controle laboratorial.":
    "Con disfunción renal, no acumular ampollas sin un nuevo control de laboratorio.",
  "Com disfunção renal, o limiar para discutir terapia renal substitutiva fica mais baixo.":
    "Con disfunción renal, el umbral para discutir la terapia de reemplazo renal es más bajo.",
  "Com disfunção renal/oligúria, o limiar para discutir terapia renal substitutiva deve ser mais baixo.":
    "Con disfunción renal u oliguria, el umbral para discutir la terapia de reemplazo renal debe ser más bajo.",
  "Com rim disfuncionante, a tendência do cloro importa tanto quanto o valor isolado.":
    "Con un riñón disfuncionante, la tendencia del cloruro importa tanto como el valor aislado.",
  "Com rim preservado, retirar a carga de cloro costuma resolver grande parte do problema.":
    "Con un riñón conservado, retirar la carga de cloruro suele resolver gran parte del problema.",
  "Em DRC ou IRA, hidratação e anti-reabsortivo exigem leitura mais cuidadosa da volemia, da creatinina e do risco de sobrecarga.":
    "En la enfermedad renal crónica o la lesión renal aguda, la hidratación y el antirresortivo exigen una lectura más cuidadosa de la volemia, la creatinina y el riesgo de sobrecarga.",
  "Em DRC/IRA, pesar melhor a relação com fósforo e evitar tratar só o número fora do contexto.":
    "En la enfermedad renal crónica o la lesión renal aguda, ponderar mejor la relación con el fósforo y evitar tratar solo el número fuera de contexto.",
  "Em disfunção renal, evitar empilhar doses sem redosagem seriada; a mesma ampola que corrige pode acumular.":
    "En la disfunción renal, evitar acumular dosis sin nuevas mediciones seriadas; la misma ampolla que corrige puede acumularse.",
  "Em insuficiência renal, a indicação de fósforo IV precisa ser mais restrita e sempre acompanhada de redosagem precoce.":
    "En la insuficiencia renal, la indicación de fósforo IV debe ser más restringida y siempre acompañada de una nueva medición precoz.",
  "Na injúria renal, a hipercloremia pode refletir incapacidade de depurar carga administrada e piorar acidose/vasoconstrição renal.":
    "En la lesión renal, la hipercloremia puede reflejar la incapacidad de depurar la carga administrada y empeorar la acidosis y la vasoconstricción renal.",
  "Na presença de IRA/DRC, corrigir cloreto sem olhar volume e potássio pode piorar sobrecarga e não resolver a fisiologia.":
    "En presencia de lesión renal aguda o enfermedad renal crónica, corregir el cloruro sin mirar el volumen y el potasio puede empeorar la sobrecarga y no resolver la fisiología.",
  "Sem disfunção renal evidente, o ritmo de reposição pode seguir mais de perto o acesso e a clínica.":
    "Sin disfunción renal evidente, el ritmo de reposición puede seguir más de cerca el acceso y la clínica.",
  "Sem disfunção renal importante, a causa imediata costuma direcionar mais do que a limitação de depuração.":
    "Sin disfunción renal importante, la causa inmediata suele orientar más que la limitación de la depuración.",
  "Sem disfunção renal importante, excesso de SF e perdas digestivas de bicarbonato sobem na lista.":
    "Sin disfunción renal importante, el exceso de solución fisiológica y las pérdidas digestivas de bicarbonato suben en la lista.",
  "Sem disfunção renal importante, o risco de acúmulo é menor, mas a redosagem ainda define a próxima etapa.":
    "Sin disfunción renal importante, el riesgo de acumulación es menor, pero la nueva medición sigue definiendo la etapa siguiente.",
  "Sem disfunção renal importante, reposições seriadas tendem a ser mais previsíveis, mas ainda exigem controle laboratorial.":
    "Sin disfunción renal importante, las reposiciones seriadas tienden a ser más previsibles, pero aún exigen control de laboratorio.",
  "Sem disfunção renal importante, volume, vômitos, diurético e potássio costumam explicar mais o quadro.":
    "Sin disfunción renal importante, el volumen, los vómitos, los diuréticos y el potasio suelen explicar mejor el cuadro.",
  "Mesmo sem disfunção renal evidente, monitorar creatinina e diurese durante a expansão volêmica.":
    "Incluso sin disfunción renal evidente, monitorizar la creatinina y la diuresis durante la expansión de volumen.",
  "Hiperfosfatemia com disfunção renal informada aumenta o risco de persistência e necessidade de depuração.":
    "La hiperfosfatemia con disfunción renal informada aumenta el riesgo de persistencia y de necesitar depuración.",
  "Hiperfosfatemia importante em IRA costuma vir em pacote com outros distúrbios.":
    "La hiperfosfatemia importante en la lesión renal aguda suele venir acompañada de otros trastornos.",
  "Se houver disfunção renal, fracionar mais a reposição e redosar antes de acumular carga excessiva.":
    "Si hay disfunción renal, fraccionar más la reposición y volver a medir antes de acumular una carga excesiva.",
  "Se houver disfunção renal, o plano precisa considerar menor capacidade de depurar sódio e água; acompanhar balanço e resposta real, não só o cálculo.":
    "Si hay disfunción renal, el plan debe considerar una menor capacidad de depurar sodio y agua; seguir el balance y la respuesta real, no solo el cálculo.",

  // ── Contexto: bicarbonato / ácido-base ─────────────────────────────────────
  "Bicarbonato alto sugere alcalose; isso pode reforçar componente de redistribuição do fósforo.":
    "Un bicarbonato alto sugiere alcalosis; eso puede reforzar el componente de redistribución del fósforo.",
  "Com bicarbonato baixo, a leitura de redistribuição muda; parte do distúrbio pode acompanhar acidose e não apenas perda corporal total.":
    "Con un bicarbonato bajo, la lectura de redistribución cambia; parte del trastorno puede acompañar a la acidosis y no solo a una pérdida corporal total.",
  "HCO3- baixo com hipercloremia sugere acidose metabólica hiperclorêmica até prova em contrário.":
    "Un HCO₃⁻ bajo con hipercloremia sugiere acidosis metabólica hiperclorémica hasta que se demuestre lo contrario.",
  "HCO3- baixo reforça leitura de acidose metabólica hiperclorêmica e pede revisão da causa de base.":
    "Un HCO₃⁻ bajo refuerza la lectura de acidosis metabólica hiperclorémica y exige revisar la causa de base.",
  "HCO3- elevado reforça a leitura de alcalose metabólica associada e aumenta o peso da reposição de cloreto.":
    "Un HCO₃⁻ elevado refuerza la lectura de alcalosis metabólica asociada y aumenta el peso de la reposición de cloruro.",
  "HCO3- elevado reforça alcalose metabólica cloro-sensível e aumenta o peso da reposição de cloreto.":
    "Un HCO₃⁻ elevado refuerza la alcalosis metabólica sensible al cloruro y aumenta el peso de la reposición de cloruro.",
  "Sem HCO3- elevado, vale checar se a queda do cloro faz parte de outro distúrbio misto.":
    "Sin un HCO₃⁻ elevado, conviene comprobar si la caída del cloruro forma parte de otro trastorno mixto.",
  "Sem bicarbonato alto, a interpretação da hipocloremia precisa de mais contexto ácido-base.":
    "Sin un bicarbonato alto, la interpretación de la hipocloremia requiere más contexto ácido-base.",
  "Se o bicarbonato está alto ou há hipoventilação compensatória, a alcalose metabólica associada ganha força.":
    "Si el bicarbonato está alto o hay hipoventilación compensadora, la alcalosis metabólica asociada gana fuerza.",
  "Se bicarbonato estiver normal e o paciente recebeu muito SF, a explicação mais provável continua sendo iatrogênica.":
    "Si el bicarbonato es normal y el paciente recibió mucha solución fisiológica, la explicación más probable sigue siendo iatrogénica.",
  "Sem acidose relevante, o pilar do shift continua sendo insulina e beta-agonista.":
    "Sin acidosis relevante, el pilar del desplazamiento sigue siendo la insulina y el agonista beta.",

  // ── Contexto: glicemia ─────────────────────────────────────────────────────
  "Glicemia basal baixa aumenta o risco de hipoglicemia após insulina; programar vigilância e glicose adicional.":
    "Una glucemia basal baja aumenta el riesgo de hipoglucemia tras la insulina; programar vigilancia y glucosa adicional.",
  "Como a glicemia basal está < 126 mg/dL, considerar D10 a 50 mL/h por 5 h após o bolus para reduzir hipoglicemia.":
    "Como la glucemia basal es < 126 mg/dL, considerar dextrosa al 10% a 50 mL/h durante 5 h tras el bolo para reducir la hipoglucemia.",
  "Mesmo com glicemia basal adequada, monitorar glicemia seriada nas próximas 6 h.":
    "Incluso con una glucemia basal adecuada, monitorizar la glucemia de forma seriada en las próximas 6 h.",

  // ── Campos de entrada ──────────────────────────────────────────────────────
  "Albumina (g/dL)": "Albúmina (g/dL)",
  "Bicarbonato (mEq/L)": "Bicarbonato (mEq/L)",
  "Glicemia (mg/dL)": "Glucemia (mg/dL)",
  "Potássio atual (mEq/L)": "Potasio actual (mEq/L)",
  "Tempo da infusão (h)": "Tiempo de la infusión (h)",
  "Bolsa final (mL)": "Bolsa final (mL)",
  "Água corporal total": "Agua corporal total",
  "mEq/L": "mEq/L",
  "Selecionar": "Seleccionar",
  "Automático": "Automático",
  "Central": "Central",
  "Periférico": "Periférico",
  "Importante": "Importante",
  "Revisar": "Revisar",
  "Alterado": "Alterado",
  "Sem alteração": "Sin alteración",
  "Sem alteração informada": "Sin alteración informada",
  "Com alteração": "Con alteración",
  "Com disfunção": "Con disfunción",
  "Sem disfunção": "Sin disfunción",
  "disfunção informada": "disfunción informada",
  "sem disfunção informada": "sin disfunción informada",
  "não informada": "no informada",
  "não informado": "no informado",
  "se disponível": "si está disponible",
  "se relevante": "si es relevante",
  "Preencha o valor atual para classificar gravidade e destacar sinais principais.":
    "Complete el valor actual para clasificar la gravedad y destacar los signos principales.",
  "Preencha pelo menos peso e valor atual para destravar o cálculo.":
    "Complete al menos el peso y el valor actual para habilitar el cálculo.",

  // ── R-107: MOLDURA SEM NÚMERO (2026-08-23) ────────────────────────────
  // ⚠️ O número saiu daqui e foi para lib/eletrolitos/referencias.ts. Estas
  // chaves não podem mais divergir do português por número, porque não têm
  // número — os dois idiomas recebem o mesmo valor do mesmo dado.
  "Se houver desidratação, sinais de hipovolemia ou instabilidade hemodinâmica: priorizar reposição volêmica com SF 0,9% {0}, repetir conforme perfusão, e só depois seguir a correção dirigida do sódio.":
    "Si hay deshidratación, signos de hipovolemia o inestabilidad hemodinámica: priorizar la reposición volémica con solución fisiológica al 0,9% {0}, repetir según la perfusión, y solo después seguir la corrección dirigida del sodio.",
  "Evitar ultrapassar {0} em 24 h se duração incerta ou crônica; se alto risco de desmielinização, mirar ainda menos.":
    "Evitar superar {0} en 24 h si la duración es incierta o crónica; si hay alto riesgo de desmielinización, apuntar aún más bajo.",
  "Velocidade de referência: {3} quando o quadro é hipovolêmico sem neurogravidade; para {0} kg isso corresponde a ~ {1}–{2} mL/h.":
    "Velocidad de referencia: {3} cuando el cuadro es hipovolémico sin neurogravedad; para {0} kg eso corresponde a ~ {1}–{2} mL/h.",
  "Ureia oral: {3}; para {0} kg isso equivale a ~ {1}–{2} g/dia, divididos em 2–3 tomadas.":
    "Urea oral: {3}; para {0} kg eso equivale a ~ {1}–{2} g/día, divididos en 2–3 tomas.",
  "D5W pode ser usado para repor água livre; referência prática: ~ {2}, o que para {0} kg corresponde a ~ {1} mL/h.":
    "El suero glucosado al 5% puede usarse para reponer agua libre; referencia práctica: ~ {2}, lo que para {0} kg corresponde a ~ {1} mL/h.",
  "Referência isotônica: NaCl 0,9% tem {1} e eleva ~ {0} mEq/L por litro neste caso; não substitui o resgate da neurogravidade.":
    "Referencia isotónica: el NaCl al 0,9% tiene {1} y eleva ~ {0} mEq/L por litro en este caso; no sustituye el rescate de la neurogravedad.",
  "Não baixar o sódio mais que {0} em 24 h (≈ {1}). Na hipernatremia CRÔNICA ou de duração incerta, ficar no limite inferior.":
    "No bajar el sodio más de {0} en 24 h (≈ {1}). En la hipernatremia CRÓNICA o de duración incierta, quedarse en el límite inferior.",
  "Essa mistura gera solução final com ~{1} de sódio e tende a reduzir ~ {0} mEq/L por litro neste caso.":
    "Esa mezcla genera una solución final con ~{1} de sodio y tiende a reducir ~ {0} mEq/L por litro en este caso.",
  "NaCl 20% contém ~{0} de sódio; montar sempre em volume final definido e com conferência farmacêutica/enfermagem.":
    "El NaCl al 20% contiene ~{0} de sodio; preparar siempre en un volumen final definido y con doble verificación de farmacia y enfermería.",
  "Se houver desidratação, hipovolemia ou instabilidade hemodinâmica, ressuscitar primeiro com SF 0,9% {0} por etapa e repetir conforme perfusão, antes de focar na água livre.":
    "Si hay deshidratación, hipovolemia o inestabilidad hemodinámica, reanimar primero con solución fisiológica al 0,9% {0} por etapa y repetir según la perfusión, antes de centrarse en el agua libre.",
  "1 mL contém ~{2} de cálcio elementar; {0} mL fornecem ~{1} mEq.":
    "1 mL contiene ~{2} de calcio elemental; {0} mL aportan ~{1} mEq.",
  "SF 0,9% contém {0} de cloreto.":
    "La solución fisiológica al 0,9% contiene {0} de cloruro.",
  "⚠️ MESMA quantidade de cálcio elementar com CLORETO de cálcio 10%: apenas {0} mL (~{1} mg elementar). 1 mL de cloreto tem {2} mEq de Ca contra {3} mEq do gluconato — o cloreto é ~{4}× mais concentrado em cálcio elementar. Trocar um pelo outro na proporção 1:1 erra por {4}× em uma das direções.":
    "⚠️ MISMA cantidad de calcio elemental con CLORURO de calcio al 10%: solo {0} mL (~{1} mg elemental). 1 mL de cloruro tiene {2} mEq de Ca frente a {3} mEq del gluconato — el cloruro es ~{4}× más concentrado en calcio elemental. Cambiar uno por otro en proporción 1:1 se equivoca por {4}× en alguna de las direcciones.",
  "Sem escala de apresentação":
    "Sin escala de presentación",
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa e a velocidade de instalação":
    "La gravedad aquí no cambia la presentación. Lo que cambia la conducta es la causa y la velocidad de instauración",
  "A gravidade aqui não muda a apresentação. O que muda a conduta é a causa, a velocidade de instalação e o cálcio associado":
    "La gravedad aquí no cambia la presentación. Lo que cambia la conducta es la causa, la velocidad de instauración y el calcio asociado",

  // ── QUAL CÁLCIO (2026-08-23) ──────────────────────────────────────────
  "Qual cálcio você tem?":
    "¿Qué calcio tiene?",
  "Iônico":
    "Iónico",
  "Total (com albumina)":
    "Total (con albúmina)",
  "Não sei — onde acho cada um?":
    "No sé — ¿dónde encuentro cada uno?",
  "IÔNICO: sai na GASOMETRIA — a mesma que este módulo já manda colher. Em UTI costuma ser padrão.":
    "IÓNICO: sale en la GASOMETRÍA — la misma que este módulo ya indica extraer. En UCI suele ser estándar.",
  "TOTAL: sai na bioquímica de rotina. ⚠️ Para valer, precisa vir com a ALBUMINA da mesma coleta.":
    "TOTAL: sale en la bioquímica de rutina. ⚠️ Para servir, tiene que venir con la ALBÚMINA de la misma extracción.",
  "Se tiver os dois, prefira o iônico: ele mede o cálcio biologicamente ativo, sem depender de correção.":
    "Si tiene los dos, prefiera el iónico: mide el calcio biológicamente activo, sin depender de corrección.",
  "⚠️ APROXIMAÇÃO: o cálcio total foi corrigido pela albumina. Essa correção é imprecisa no doente crítico — se houver cálcio iônico, ele decide.":
    "⚠️ APROXIMACIÓN: el calcio total fue corregido por la albúmina. Esa corrección es imprecisa en el paciente crítico — si hay calcio iónico, él decide.",
  "⚠️ CÁLCIO TOTAL SEM ALBUMINA: sem ela não há como corrigir, e o total isolado subestima ou superestima conforme a albuminemia. Informe a albumina da mesma coleta, ou use o iônico.":
    "⚠️ CALCIO TOTAL SIN ALBÚMINA: sin ella no hay cómo corregir, y el total aislado subestima o sobrestima según la albuminemia. Informe la albúmina de la misma extracción, o use el iónico.",
  "⚠️ ESTE APP AINDA NÃO CLASSIFICA GRAVIDADE PELO CÁLCIO IÔNICO: a escala dele é outra (mmol/L) e os cortes não estão definidos aqui. Use o valor e o quadro clínico; a conduta abaixo não foi graduada por número.":
    "⚠️ ESTA APP AÚN NO CLASIFICA LA GRAVEDAD POR EL CALCIO IÓNICO: su escala es otra (mmol/L) y los puntos de corte no están definidos aquí. Use el valor y el cuadro clínico; la conducta de abajo no fue graduada por número.",

  // ── SINTOMA PRIMEIRO, NÚMERO DEPOIS (2026-08-23) ──────────────────────
  "Há manifestação clínica de hipocalcemia?":
    "¿Hay manifestación clínica de hipocalcemia?",
  "Considerando o cálcio ABAIXO DA REFERÊNCIA do seu laboratório — o app não conhece o intervalo do seu método.":
    "Considerando el calcio POR DEBAJO DE LA REFERENCIA de su laboratorio — la app no conoce el intervalo de su método.",
  "Parestesia perioral e de extremidades":
    "Parestesia perioral y de extremidades",
  "Espasmo carpopedal ou tetania":
    "Espasmo carpopedal o tetania",
  "Sinal de Trousseau ou de Chvostek":
    "Signo de Trousseau o de Chvostek",
  "Laringoespasmo ou estridor":
    "Laringoespasmo o estridor",
  "Convulsão":
    "Convulsión",
  "QT prolongado e/ou arritmia":
    "QT prolongado o arritmia",
  "Broncoespasmo":
    "Broncoespasmo",
  "Hipotensão refratária a vasopressor":
    "Hipotensión refractaria a vasopresores",
  "Disfunção miocárdica aguda":
    "Disfunción miocárdica aguda",
  "O cálcio ionizado é influenciado pelo pH — alcalose reduz a fração ionizada sem mudar o cálcio total.":
    "El calcio ionizado está influido por el pH — la alcalosis reduce la fracción ionizada sin cambiar el calcio total.",
  "Os intervalos de referência do ionizado dependem do MÉTODO e do EQUIPAMENTO: use a referência do laudo, não um número decorado.":
    "Los intervalos de referencia del ionizado dependen del MÉTODO y del EQUIPO: use la referencia del informe, no un número memorizado.",
  "Por isso este app não cria faixas de gravidade para o ionizado. O ramo sintomático acima responde igual nos três ensaios.":
    "Por eso esta app no crea rangos de gravedad para el ionizado. La rama sintomática de arriba responde igual en los tres ensayos.",
  "Definem hipocalcemia sintomática":
    "Definen hipocalcemia sintomática",
  "Aparecem, mas não definem":
    "Aparecen, pero no definen",
  "Possíveis na hipocalcemia grave — exigem compatibilidade":
    "Posibles en la hipocalcemia grave — exigen compatibilidad",
  "Quais são?":
    "¿Cuáles son?",
  "⚠️ ALTAMENTE INESPECÍFICAS no paciente crítico: lembre-as quando o cálcio JÁ estiver baixo. Nunca concluem hipocalcemia sozinhas.":
    "⚠️ ALTAMENTE INESPECÍFICAS en el paciente crítico: recuérdelas cuando el calcio YA esté bajo. Nunca concluyen hipocalcemia por sí solas.",
  "Correção urgente":
    "Corrección urgente",
  "Significativa":
    "Significativa",
  "Corte desta faixa: {0}":
    "Punto de corte de este tramo: {0}",
  "Hipercalcemia significativa; necessidade e urgência do tratamento dependem de sintomas, velocidade de instalação, causa e contexto clínico; em geral requer avaliação e tratamento, mas não constitui emergência automaticamente pelo número isolado.":
    "Hipercalcemia significativa; la necesidad y la urgencia del tratamiento dependen de los síntomas, la velocidad de instauración, la causa y el contexto clínico; en general requiere evaluación y tratamiento, pero no constituye una emergencia automáticamente por el número aislado.",

  // ── ÂNION GAP FORA DO VERDE + R-111 na tela (2026-08-23) ──────────────
  "Fora das faixas acima, o app não conclui pelo número: a conduta depende de sintomas, via enteral e contexto clínico.":
    "Fuera de los tramos anteriores, la app no concluye por el número: la conducta depende de los síntomas, la vía enteral y el contexto clínico.",
  "O cálcio não alcançou o corte de gravidade. Isso não é o mesmo que quadro estável: o contexto, a causa e os sintomas definem o restante da correção.":
    "El calcio no alcanzó el punto de corte de gravedad. Eso no es lo mismo que un cuadro estable: el contexto, la causa y los síntomas definen el resto de la corrección.",
  "Se o cálcio estiver abaixo do corte de gravidade ({0}), ou houver tetania, convulsão ou QT longo, a reposição IV ganha prioridade prática.":
    "Si el calcio está por debajo del punto de corte de gravedad ({0}), o hay tetania, convulsión o QT largo, la reposición IV gana prioridad práctica.",
  "Se o fósforo estiver abaixo do corte de gravidade, tratar como distúrbio grave mesmo antes da falência muscular se a clínica for compatível.":
    "Si el fósforo está por debajo del punto de corte de gravedad, tratar como trastorno grave incluso antes del fallo muscular si la clínica es compatible.",
  "Sem valor classificável, o app NÃO afirma que o quadro é leve: informe o cálcio e o ensaio para que a gravidade seja lida.":
    "Sin un valor clasificable, la app NO afirma que el cuadro es leve: informe el calcio y el ensayo para que la gravedad pueda leerse.",
  "Informe a albumina para que o AG seja corrigido e interpretado. Sem ela, o valor medido isolado não separa «não há acidose de AG elevado» de «há, e a albumina baixa a escondeu».":
    "Informe la albúmina para que el AG sea corregido e interpretado. Sin ella, el valor medido aislado no separa «no hay acidosis con AG elevado» de «la hay, y la albúmina baja la escondió».",
  "ÂNION GAP BAIXO — não é «normal». Procure hipoalbuminemia (a causa mais comum), paraproteína do mieloma múltiplo e intoxicação por lítio ou brometo.":
    "ANIÓN GAP BAJO — no es «normal». Busque hipoalbuminemia (la causa más frecuente), paraproteína del mieloma múltiple e intoxicación por litio o bromuro.",
  "Ânion gap corrigido dentro da faixa de referência. Se há acidose, considere a hiperclorêmica (HARDUPS): HCO₃ perdido (diarreia), ATR, reposição de NaCl, fístula pancreática, urostomia, pós-hipocápnia, espironolactona.":
    "Anión gap corregido dentro del rango de referencia. Si hay acidosis, considere la hiperclorémica (HARDUPS): HCO₃ perdido (diarrea), ATR, reposición de NaCl, fístula pancreática, urostomía, poshipocapnia, espironolactona.",
  "⚠️ NÃO É POSSÍVEL INTERPRETAR O ÂNION GAP SEM A ALBUMINA. Ela é o principal ânion não medido: quando cai, o AG cai junto e MASCARA uma acidose de AG elevado que existe. Albumina 2,0 com AG 12 corresponde a um AG corrigido de ~17.":
    "⚠️ NO ES POSIBLE INTERPRETAR EL ANIÓN GAP SIN LA ALBÚMINA. Es el principal anión no medido: cuando baja, el AG baja con ella y ENMASCARA una acidosis con AG elevado que sí existe. Albúmina 2,0 con AG 12 corresponde a un AG corregido de ~17.",
  "AG = Na − (Cl + HCO₃). Faixa de referência 8–12 com albumina 4 g/dL — ⚠️ cortes herdados, sem fonte conferida.":
    "AG = Na − (Cl + HCO₃). Rango de referencia 8–12 con albúmina 4 g/dL — ⚠️ puntos de corte heredados, sin fuente verificada.",
  "Albumina (necessária para interpretar)":
    "Albúmina (necesaria para interpretar)",
  "Ânion gap corrigido dentro da faixa de referência":
    "Anión gap corregido dentro del rango de referencia",

  // ── Magnésio: contexto no lugar do corte (2026-08-23) ─────────────────
  "A paciente está recebendo sulfato de magnésio?":
    "¿La paciente está recibiendo sulfato de magnesio?",
  "Sim — em magnesioterapia":
    "Sí — en tratamiento con magnesio",
  "Não sei — a pergunta que resolve é uma só: a paciente está recebendo sulfato de magnésio por pré-eclâmpsia ou eclâmpsia? Confira a prescrição e a bomba de infusão.":
    "No sé — la pregunta que lo resuelve es una sola: ¿la paciente está recibiendo sulfato de magnesio por preeclampsia o eclampsia? Revise la prescripción y la bomba de infusión.",
  "Faixa esperada em magnesioterapia":
    "Rango esperado en tratamiento con magnesio",
  "Faixa sérica tradicionalmente considerada terapêutica/esperada durante magnesioterapia — NÃO é alvo terapêutico obrigatório: a concentração sérica necessária para prevenir eclâmpsia não está estabelecida com grande precisão. Valores nessa faixa não devem ser rotulados automaticamente como toxicidade; decida pelos reflexos, pela frequência respiratória, pela diurese e pela função renal.":
    "Rango sérico tradicionalmente considerado terapéutico/esperado durante el tratamiento con magnesio — NO es un objetivo terapéutico obligatorio: la concentración sérica necesaria para prevenir la eclampsia no está establecida con gran precisión. Los valores en ese rango no deben rotularse automáticamente como toxicidad; decida por los reflejos, la frecuencia respiratoria, la diuresis y la función renal.",
  "Hipermagnesemia — interpretar no contexto":
    "Hipermagnesemia — interpretar en el contexto",
  "Fora de magnesioterapia, valor acima da referência do SEU laboratório é hipermagnesemia. ⚠️ Este app NÃO gradua hipermagnesemia por número: interprete em conjunto com a função renal, a exposição a magnésio (antiácidos, laxantes, reposição) e as manifestações clínicas.":
    "Fuera del tratamiento con magnesio, un valor por encima de la referencia de SU laboratorio es hipermagnesemia. ⚠️ Esta app NO gradúa la hipermagnesemia por número: interprete en conjunto con la función renal, la exposición a magnesio (antiácidos, laxantes, reposición) y las manifestaciones clínicas.",
  "Hiporreflexia, sonolência, hipotensão e depressão respiratória são os sinais que importam.":
    "Hiporreflexia, somnolencia, hipotensión y depresión respiratoria son los signos que importan.",
  "Grave (corte provisório)":
    "Grave (punto de corte provisional)",
  "⚠️ 8–12 mEq/L é ORIENTAÇÃO, não cutoff formal: o intervalo de referência do SEU laboratório prevalece, porque a metodologia analítica interfere no resultado.":
    "⚠️ 8–12 mEq/L es ORIENTACIÓN, no un punto de corte formal: el rango de referencia de SU laboratorio prevalece, porque la metodología analítica interfiere en el resultado.",

  // ── referencias: a terceira espécie (2026-08-23) ──────────────────────
  "Referência de progressão — orienta, não classifica":
    "Referencia de progresión — orienta, no clasifica",
  "⚠️ Faixas APROXIMADAS: não são limites absolutos nem recomendação graduada. A decisão considera sintomas, função renal e a TENDÊNCIA da concentração.":
    "⚠️ Rangos APROXIMADOS: no son límites absolutos ni recomendación graduada. La decisión considera los síntomas, la función renal y la TENDENCIA de la concentración.",
  "Perda importante de reflexos":
    "Pérdida importante de reflejos",
  "Depressão ou paralisia respiratória":
    "Depresión o parálisis respiratoria",
  "Risco de parada cardíaca":
    "Riesgo de paro cardíaco",
  "Valor atual":
    "Valor actual",
  "Magnésio atual":
    "Magnesio actual",
  "Não sei":
    "No sé",
  "Bolsa final":
    "Bolsa final",
  "Tempo da infusão":
    "Tiempo de la infusión",
  "Potássio atual":
    "Potasio actual",
};
