/** ES — Coronárias: os quatro grupos sem supra, prazos com marco e apresentações. */
export const coronariasOclusaoEs: Record<string, string> = {
  // ── TELA 2 · AVALIAÇÃO IMEDIATA E VEREDITOS (2026-08-25) ─────────────────
  //
  // ⚠️ TERMO DA ESPECIALIDADE, não literalidade. "Estertores" é "crepitantes"
  // no uso hispanofalante; "sopro" é "soplo"; "diastólica" é igual. O médico
  // precisa reconhecer o achado na tela, não traduzir de volta.
  // Rótulos do semáforo de ação — vivem no shell, mas nascem com a Tela 2.
  "Registrar como administrado": "Registrar como administrado",
  "✓ Registrado como administrado": "✓ Registrado como administrado",
  // ⚠️ TOKEN PURO: o motivo do encaminhamento é montado em runtime a partir
  // dos achados do caso, e o texto traduzível vive no rótulo da ameaça.
  "{ameacaEncontrada}.": "{ameacaEncontrada}.",
  "FC {fc}/min (bradiarritmia) + comprometimento atribuível à frequência":
    "FC {fc}/min (bradiarritmia) + compromiso atribuible a la frecuencia",
  "FC {fc}/min (taquiarritmia) + comprometimento atribuível à frequência":
    "FC {fc}/min (taquiarritmia) + compromiso atribuible a la frecuencia",
  "FC {fc}/min com sinais de hipoperfusão — investigar a causa (não é arritmia instável por si)":
    "FC {fc}/min con signos de hipoperfusión — investigar la causa (no es arritmia inestable por sí)",
  // Bloco de ritmo — a pergunta passou de "irregular?" para "sinusal ou
  // arritmia?", que é o achado que de fato decide o roteamento.
  "Ritmo no monitor": "Ritmo en el monitor",
  "Sinusal": "Sinusal",
  "Arritmia (FA, flutter, TV, BAV…)": "Arritmia (FA, aleteo, TV, BAV…)",
  "Não avaliei / não sei": "No evalué / no sé",
  "Arritmia ao monitor + sinais de hipoperfusão (pele fria/pálida/sudoreica)":
    "Arritmia en el monitor + signos de hipoperfusión (piel fría/pálida/sudorosa)",
  // Nitratos — via sublingual na ordem da prática brasileira, via EV
  // apontando para a calculadora (fonte única de concentração e mL/h).
  "DINITRATO DE ISOSSORBIDA 5 mg SL — repetir a cada 5 min se necessário, até 3 doses. Só em paciente hemodinamicamente estável e com PAS ≥ 90 mmHg (reavaliar a PA antes de cada dose). Fonte: diretriz brasileira de SCA.":
    "DINITRATO DE ISOSORBIDA 5 mg SL — repetir cada 5 min si es necesario, hasta 3 dosis. Solo en paciente hemodinámicamente estable y con PAS ≥ 90 mmHg (reevaluar la PA antes de cada dosis). Fuente: directriz brasileña de SCA.",
  "Alternativa, se disponível: NITROGLICERINA 0,3 ou 0,4 mg SL — repetir a cada 5 min se necessário, até 3 doses (ACC/AHA 2025).":
    "Alternativa, si está disponible: NITROGLICERINA 0,3 o 0,4 mg SL — repetir cada 5 min si es necesario, hasta 3 dosis (ACC/AHA 2025).",
  "NITROGLICERINA IV — iniciar a 10 mcg/min e titular conforme os sintomas e a tolerância hemodinâmica (ACC/AHA 2025). ⚠️ NÃO administrar IV direto: diluir e infundir em bomba. Concentração, diluição e mL/h na calculadora de drogas vasoativas — fonte única.":
    "NITROGLICERINA IV — iniciar a 10 mcg/min y titular según los síntomas y la tolerancia hemodinámica (ACC/AHA 2025). ⚠️ NO administrar IV directo: diluir e infundir en bomba. Concentración, dilución y mL/h en la calculadora de drogas vasoactivas — fuente única.",
  "Abrir calculadora — nitroglicerina EV": "Abrir calculadora — nitroglicerina EV",
  "Antes do AAS": "Antes del AAS",
  "Duas perguntas — o resto o app já sabe.": "Dos preguntas — el resto la app ya lo sabe.",
  "Alergia conhecida ao AAS?": "¿Alergia conocida al AAS?",
  "Sangramento ativo?": "¿Sangrado activo?",
  "AAS 300 mg mastigável agora (162–325 mg).": "AAS 300 mg masticable ahora (162–325 mg).",
  "Complemento objetivo": "Complemento objetivo",
  "O que ainda falta. PAS, FC, SpO₂ e ritmo o app já tem.":
    "Lo que aún falta. PAS, FC, SpO₂ y ritmo la app ya los tiene.",
  "Pressão diastólica (o número de baixo)": "Presión diastólica (el número de abajo)",
  "Exame direcionado": "Examen dirigido",
  "Marque o que encontrou. Pode marcar vários.": "Marque lo que encontró. Puede marcar varios.",
  "Ausculta cardíaca": "Auscultación cardíaca",
  "Sopro novo": "Soplo nuevo",
  "Outros": "Otros",
  "Limpa": "Limpia",
  "Estertores": "Crepitantes",
  "Sibilos": "Sibilancias",
  "Murmúrio diminuído": "Murmullo disminuido",
  "Antes de nitrato e betabloqueador": "Antes de nitrato y betabloqueante",
  "O que o app não tem como deduzir dos dados que você já deu.":
    "Lo que la app no puede deducir de los datos que usted ya dio.",
  "O ECG mostra supra inferior (DII, DIII, aVF)?":
    "¿El ECG muestra elevación inferior (DII, DIII, aVF)?",
  "Ainda não vi o ECG": "Aún no vi el ECG",
  "Uso recente de inibidor de PDE-5 (sildenafila, tadalafila)?":
    "¿Uso reciente de inhibidor de PDE-5 (sildenafilo, tadalafilo)?",
  "BAV de 2º/3º grau sem marcapasso, ou PR > 240 ms no ECG?":
    "¿BAV de 2.º/3.er grado sin marcapasos, o PR > 240 ms en el ECG?",
  "Não sei — me ajude": "No sé — ayúdeme",
  "Broncoespasmo ativo?": "¿Broncoespasmo activo?",
  "Onde olhar o PR e o BAV": "Dónde mirar el PR y el BAV",
  "Depois de olhar o traçado: há BAV de 2º/3º grau sem marcapasso ou PR > 240 ms?":
    "Después de mirar el trazado: ¿hay BAV de 2.º/3.er grado sin marcapasos o PR > 240 ms?",
  "PR: do INÍCIO da onda P ao INÍCIO do QRS. Meça em DII, onde a P costuma ser mais nítida.":
    "PR: del INICIO de la onda P al INICIO del QRS. Mida en DII, donde la P suele ser más nítida.",
  "A 25 mm/s, cada quadradinho pequeno = 40 ms e cada quadrado grande = 200 ms. PR > 240 ms = mais de um quadrado grande e um quadradinho.":
    "A 25 mm/s, cada cuadrito pequeño = 40 ms y cada cuadro grande = 200 ms. PR > 240 ms = más de un cuadro grande y un cuadrito.",
  "BAV de 2º grau: nem toda P conduz — ou o PR alarga progressivamente até falhar (Mobitz I), ou a P falha sem aviso (Mobitz II).":
    "BAV de 2.º grado: no toda P conduce — o el PR se alarga progresivamente hasta fallar (Mobitz I), o la P falla sin aviso (Mobitz II).",
  "BAV de 3º grau: P e QRS marcham independentes, cada um no seu ritmo.":
    "BAV de 3.er grado: P y QRS marchan independientes, cada uno a su ritmo.",
  "Não — PR normal e sem BAV": "No — PR normal y sin BAV",
  "Sim — há BAV ou PR > 240 ms": "Sí — hay BAV o PR > 240 ms",
  "Terapia anti-isquêmica": "Terapia antiisquémica",
  "Cada fármaco responde pelos seus próprios impedimentos.":
    "Cada fármaco responde por sus propios impedimentos.",

  // Vereditos — o motivo é o que o médico lê ao lado da cor.
  "Administrar — benefício supera o risco": "Administrar — el beneficio supera el riesgo",
  "Checar alergia/sangramento antes": "Verificar alergia/sangrado antes",
  "Não administrar agora": "No administrar ahora",
  "Alergia ou sangramento ativo não afastados.": "Alergia o sangrado activo no descartados.",
  "Sangramento ativo — antitrombótico contraindicado agora.":
    "Sangrado activo — antitrombótico contraindicado ahora.",
  "Sem alergia, sem sangramento ativo e dissecção afastada no portão.":
    "Sin alergia, sin sangrado activo y disección descartada en el portal.",
  "Pressão não medida — a dose exige PAS conhecida e ≥ 90 mmHg.":
    "Presión no medida — la dosis exige PAS conocida y ≥ 90 mmHg.",
  "Uso recente de inibidor de PDE-5 — risco de hipotensão grave.":
    "Uso reciente de inhibidor de PDE-5 — riesgo de hipotensión grave.",
  "Suspeita de infarto de VD — o ventrículo direito infartado depende de pré-carga. Registre V3R–V4R.":
    "Sospecha de infarto de VD — el ventrículo derecho infartado depende de precarga. Registre V3R–V4R.",
  "Congestão pulmonar/IC aguda — não iniciar agora.":
    "Congestión pulmonar/IC aguda — no iniciar ahora.",
  "Sinais de baixo débito — não iniciar agora.": "Signos de bajo gasto — no iniciar ahora.",
  "BAV de 2º/3º grau sem marcapasso ou PR > 240 ms.":
    "BAV de 2.º/3.er grado sin marcapasos o PR > 240 ms.",
  "BAV/PR longo não afastado — confira o ECG que já está na mão.":
    "BAV/PR largo no descartado — revise el ECG que ya tiene en la mano.",
  "Estável, sem congestão, bradicardia, BAV/PR longo ou broncoespasmo.":
    "Estable, sin congestión, bradicardia, BAV/PR largo ni broncoespasmo.",

  // ── TELA 1 · ENTRADA DO PACIENTE (2026-08-25) ────────────────────────────
  //
  // ⚠️ OS RÓTULOS DE SINTOMA SÃO TERMO CLÍNICO, e a tradução segue o uso
  // espanhol da especialidade — "vómitos" (não "vômitos"), "epigastralgia"
  // (igual), "síncope/presíncope" sem hífen no prefixo. Não é literalidade:
  // é o termo que o médico hispanofalante reconhece na tela.
  "— não informado": "— no informado",
  "Entrada do paciente": "Ingreso del paciente",
  "Arraste o que souber e marque os sintomas presentes. Nada aqui trava o atendimento — pode seguir e completar depois.":
    "Deslice lo que sepa y marque los síntomas presentes. Nada aquí bloquea la atención — puede seguir y completar después.",
  "Quando os sintomas começaram?": "¿Cuándo comenzaron los síntomas?",
  "Quadro do paciente": "Cuadro del paciente",
  "Marque todos os que existem. Pode marcar vários.":
    "Marque todos los que existan. Puede marcar varios.",
  "Sintomas presentes": "Síntomas presentes",
  "Dor/pressão retroesternal": "Dolor/presión retroesternal",
  "Irradiação braço esquerdo": "Irradiación brazo izquierdo",
  "Irradiação ambos os braços": "Irradiación ambos brazos",
  "Irradiação mandíbula": "Irradiación mandíbula",
  "Irradiação cervical": "Irradiación cervical",
  "Irradiação dorso/escápula": "Irradiación dorso/escápula",
  "Sudorese": "Diaforesis",
  "Náuseas/vômitos": "Náuseas/vómitos",
  "Síncope/pré-síncope": "Síncope/presíncope",
  "Palpitação": "Palpitaciones",
  "Epigastralgia": "Epigastralgia",
  "Apresentação atípica": "Presentación atípica",

  "Preciso registrar as derivações extras (V7–V9 ou V3R–V4R)":
    "Necesito registrar las derivaciones extra (V7–V9 o V3R–V4R)",
  "Como registrar as derivações extras":
    "Cómo registrar las derivaciones extra",
  "V7–V9 quando houver suspeita de posterior; V3R–V4R em TODO infarto inferior. Registre e volte ao traçado.":
    "V7–V9 cuando haya sospecha de posterior; V3R–V4R en TODO infarto inferior. Registre y vuelva al trazado.",
  "WELLENS — O ÚNICO DESTA LISTA EM QUE O ERRO É FAZER ALGUMA COISA. ⚠️ NÃO É OCLUSÃO EM CURSO: é o padrão de REPERFUSÃO ESPONTÂNEA de uma estenose CRÍTICA da DA. Tipo A: T bifásica, positiva depois negativa (25% dos casos). Tipo B: T profunda e SIMETRICAMENTE invertida (75%). Em V2–V3, com R preservada, SEM ondas Q, e marcadores normais ou pouco elevados. O padrão aparece com o paciente SEM DOR — some ou se altera durante a dor.":
    "WELLENS — EL ÚNICO DE ESTA LISTA EN QUE EL ERROR ES HACER ALGO. ⚠️ NO ES OCLUSIÓN EN CURSO: es el patrón de REPERFUSIÓN ESPONTÁNEA de una estenosis CRÍTICA de la DA. Tipo A: T bifásica, positiva y luego negativa (25% de los casos). Tipo B: T profunda y SIMÉTRICAMENTE invertida (75%). En V2–V3, con R preservada, SIN ondas Q, y marcadores normales o poco elevados. El patrón aparece con el paciente SIN DOLOR — desaparece o se altera durante el dolor.",

  "Depois de varrer — o que você viu no traçado":
    "Después de barrer — qué vio en el trazado",
  "Achou algum destes padrões no ECG?":
    "¿Encontró alguno de estos patrones en el ECG?",
  "⚠️ RECONHECER UM DELES MUDA O DESTINO. De Winter, posterior isolado e T hiperaguda têm a mesma urgência do STEMI — não são \"sem supra\".":
    "⚠️ RECONOCER UNO DE ELLOS CAMBIA EL DESTINO. De Winter, posterior aislado y T hiperaguda tienen la misma urgencia del STEMI — no son \"sin elevación\".",
  "SIM — reconheci um dos padrões":
    "SÍ — reconocí uno de los patrones",
  "NÃO TENHO CERTEZA — o traçado é duvidoso":
    "NO ESTOY SEGURO — el trazado es dudoso",
  "NÃO — nenhum deles, o traçado é mesmo sem supra":
    "NO — ninguno de ellos, el trazado es realmente sin elevación",
  "Padrão de oclusão reconhecido — o relógio conta a partir de agora":
    "Patrón de oclusión reconocido — el reloj cuenta a partir de ahora",
  "A conduta passa a ser a do STEMI: reperfusão indicada, com a mesma urgência.":
    "La conducta pasa a ser la del STEMI: reperfusión indicada, con la misma urgencia.",
  "ACHOU UM DOS PADRÕES DE OCLUSÃO — a conduta passa a ser a do STEMI: reperfusão indicada, com a mesma urgência, e o relógio conta a partir de AGORA. ⚠️ DUAS RESSALVAS QUE MUDAM O QUE SE FAZ: no aVR com infra difusa a sala é urgente mas a FIBRINÓLISE ESTÁ FORA (é tronco ou multiarterial); e o WELLENS NÃO é oclusão em curso — nele o cateterismo é precoce e o erro clássico é mandar para teste ergométrico.":
    "ENCONTRÓ UNO DE LOS PATRONES DE OCLUSIÓN — la conducta pasa a ser la del STEMI: reperfusión indicada, con la misma urgencia, y el reloj cuenta a partir de AHORA. ⚠️ DOS SALVEDADES QUE CAMBIAN LO QUE SE HACE: en el aVR con infradesnivel difuso la sala es urgente pero la FIBRINÓLISIS QUEDA FUERA (es tronco o multiarterial); y el WELLENS NO es oclusión en curso — en él el cateterismo es precoz y el error clásico es mandar a prueba ergométrica.",
  "Traçado duvidoso — o seguinte é que resolve":
    "Trazado dudoso — el siguiente es el que resuelve",
  "Duvidar não impede repetir o ECG, colher troponina nem manter o paciente. Impede apenas liberar.":
    "Dudar no impide repetir el ECG, tomar troponina ni mantener al paciente. Impide solamente dar el alta.",
  "⚠️ NA DÚVIDA, O TRAÇADO SEGUINTE É QUE RESOLVE — e duvidar não impede nenhuma das três coisas: REPETIR o ECG e SERIAR, colher TROPONINA, e NÃO LIBERAR o paciente. Um ECG normal ou duvidoso em dor torácica ATIVA não encerra nada, e a T hiperaguda é justamente a fase em que o traçado seguinte pode já mostrar supra. ⚠️ ESTE APP NÃO FIXA O INTERVALO da repetição: as fontes abertas para este módulo tratam de reconhecimento, não de cadência. Use o intervalo do protocolo do seu serviço — e, na ausência dele, repita ANTES do que a sua vontade de fechar o caso sugerir. Manter monitorização contínua enquanto isso.":
    "⚠️ EN LA DUDA, EL TRAZADO SIGUIENTE ES EL QUE RESUELVE — y dudar no impide ninguna de las tres cosas: REPETIR el ECG y SERIAR, tomar TROPONINA, y NO DAR EL ALTA al paciente. Un ECG normal o dudoso en dolor torácico ACTIVO no cierra nada, y la T hiperaguda es justamente la fase en que el trazado siguiente puede ya mostrar elevación. ⚠️ ESTA APP NO FIJA EL INTERVALO de la repetición: las fuentes abiertas para este módulo tratan de reconocimiento, no de cadencia. Use el intervalo del protocolo de su servicio — y, en ausencia de él, repita ANTES de lo que su ganas de cerrar el caso sugiera. Mantener monitorización continua mientras tanto.",

  "COMO FAZER V3R–V4R: espelhe as precordiais para o lado direito do tórax — V4R vai no 5º espaço intercostal DIREITO, na linha hemiclavicular, e V3R entre V1 e V4R. CRITÉRIO: supra ≥ 1 mm em V3R–V6R fecha o diagnóstico (V4R isolada tem sensibilidade de 88% e especificidade de 78%); supra > 0,5 mm conta como achado de APOIO, mais sensível e menos específico. Na dúvida, com inferior + hipotensão, trate como VD.":
    "CÓMO HACER V3R–V4R: refleje las precordiales al lado derecho del tórax — V4R va en el 5.º espacio intercostal DERECHO, en la línea medioclavicular, y V3R entre V1 y V4R. CRITERIO: elevación ≥ 1 mm en V3R–V6R cierra el diagnóstico (V4R aislada tiene sensibilidad del 88% y especificidad del 78%); elevación > 0,5 mm cuenta como hallazgo de APOYO, más sensible y menos específico. Ante la duda, con inferior + hipotensión, trátelo como VD.",
  "COMO FAZER V7–V8–V9: todas no MESMO PLANO HORIZONTAL DE V6 — V7 na linha axilar posterior esquerda, V8 na ponta da escápula esquerda, V9 na região paravertebral esquerda. Basta reposicionar V4–V6 e registrar. ⚠️ O LIMIAR AQUI É OUTRO: supra de apenas 0,5 mm em V7–V9 já fecha infarto posterior. Aplicar o ≥ 1 mm das derivações padrão nestas derivações descarta o diagnóstico que se foi procurar.":
    "CÓMO HACER V7–V8–V9: todas en el MISMO PLANO HORIZONTAL DE V6 — V7 en la línea axilar posterior izquierda, V8 en la punta de la escápula izquierda, V9 en la región paravertebral izquierda. Basta reposicionar V4–V6 y registrar. ⚠️ EL UMBRAL AQUÍ ES OTRO: una elevación de solo 0,5 mm en V7–V9 ya cierra el infarto posterior. Aplicar el ≥ 1 mm de las derivaciones estándar en estas derivaciones descarta el diagnóstico que se fue a buscar.",
  "DE WINTER — OCLUSÃO AGUDA, sala agora. Infra de ST ASCENDENTE de 1–3 mm no ponto J em V1–V6, seguida de ondas T ALTAS, POSITIVAS E SIMÉTRICAS; pode haver supra de 1–2 mm em aVR. Indica oclusão PROXIMAL DA DA — aparece em cerca de 2% dos infartos anteriores extensos e tem valor preditivo positivo de 95–100% para oclusão. Não espere o padrão virar supra: ele pode não virar.":
    "DE WINTER — OCLUSIÓN AGUDA, sala ahora. Infradesnivel del ST ASCENDENTE de 1–3 mm en el punto J en V1–V6, seguido de ondas T ALTAS, POSITIVAS Y SIMÉTRICAS; puede haber elevación de 1–2 mm en aVR. Indica oclusión PROXIMAL DE LA DA — aparece en cerca del 2% de los infartos anteriores extensos y tiene valor predictivo positivo del 95–100% para oclusión. No espere que el patrón se convierta en elevación: puede no convertirse.",
  "INFARTO DE VD — procure em TODO infarto INFERIOR, sem exceção. Não é um diagnóstico diferente: é a EXTENSÃO do inferior para o ventrículo direito, e o que muda não é a reperfusão — é a farmacologia.":
    "INFARTO DE VD — búsquelo en TODO infarto INFERIOR, sin excepción. No es un diagnóstico distinto: es la EXTENSIÓN del inferior al ventrículo derecho, y lo que cambia no es la reperfusión — es la farmacología.",
  "POSTERIOR ISOLADO — OCLUSÃO AGUDA, e o mais traiçoeiro: na tela padrão parece isquemia subendocárdica. Suspeite quando V1–V3 mostrarem INFRA HORIZONTAL + onda R ALTA E LARGA (> 30 ms) + T POSITIVA, com R/S > 1 em V2. Confirme com as derivações posteriores.":
    "POSTERIOR AISLADO — OCLUSIÓN AGUDA, y el más traicionero: en el trazado estándar parece isquemia subendocárdica. Sospéchelo cuando V1–V3 muestren INFRADESNIVEL HORIZONTAL + onda R ALTA Y ANCHA (> 30 ms) + T POSITIVA, con R/S > 1 en V2. Confírmelo con las derivaciones posteriores.",
  "SUPRA EM aVR COM INFRA DIFUSA (≥ 6 derivações) — sugere lesão de TRONCO da coronária esquerda ou doença MULTIARTERIAL grave. ⚠️ NÃO É EQUIVALENTE DE STEMI e NÃO É INDICAÇÃO DE FIBRINÓLISE: o padrão de 2025 não o lista entre os equivalentes, e quem precisa de revascularização cirúrgica não se beneficia de trombolítico. A conduta é CATETERISMO URGENTE com discussão cirúrgica, não lise.":
    "ELEVACIÓN EN aVR CON INFRADESNIVEL DIFUSO (≥ 6 derivaciones) — sugiere lesión del TRONCO de la coronaria izquierda o enfermedad MULTIVASO grave. ⚠️ NO ES EQUIVALENTE DE STEMI y NO ES INDICACIÓN DE FIBRINÓLISIS: el estándar de 2025 no lo lista entre los equivalentes, y quien necesita revascularización quirúrgica no se beneficia de trombolítico. La conducta es CATETERISMO URGENTE con discusión quirúrgica, no lisis.",
  "T HIPERAGUDA — a fase MAIS PRECOCE da oclusão, e muitas vezes o ÚNICO achado. Não tem limiar em milímetros: o que a define é ser LARGA NA BASE, SIMÉTRICA e DESPROPORCIONAL ao QRS daquela derivação, agrupada no território de uma artéria. ⚠️ REPETIR O ECG É PARTE DA CONDUTA, não observação: o traçado seguinte pode já mostrar supra, e é por isso que um ECG normal em dor torácica ativa não encerra nada.":
    "T HIPERAGUDA — la fase MÁS PRECOZ de la oclusión, y muchas veces el ÚNICO hallazgo. No tiene umbral en milímetros: lo que la define es ser ANCHA EN LA BASE, SIMÉTRICA y DESPROPORCIONADA respecto al QRS de esa derivación, agrupada en el territorio de una arteria. ⚠️ REPETIR EL ECG ES PARTE DE LA CONDUCTA, no observación: el trazado siguiente puede mostrar ya elevación, y por eso un ECG normal con dolor torácico activo no cierra nada.",
  "WELLENS — ⚠️ NÃO É OCLUSÃO EM CURSO: é o padrão de REPERFUSÃO ESPONTÂNEA de uma estenose CRÍTICA da DA. Tipo A: T bifásica, positiva depois negativa (25% dos casos). Tipo B: T profunda e SIMETRICAMENTE invertida (75%). Em V2–V3, com R preservada, SEM ondas Q, e marcadores normais ou pouco elevados. O padrão aparece com o paciente SEM DOR — some ou se altera durante a dor.":
    "WELLENS — ⚠️ NO ES OCLUSIÓN EN CURSO: es el patrón de REPERFUSIÓN ESPONTÁNEA de una estenosis CRÍTICA de la DA. Tipo A: T bifásica, positiva y luego negativa (25% de los casos). Tipo B: T profunda y SIMÉTRICAMENTE invertida (75%). En V2–V3, con R preservada, SIN ondas Q, y marcadores normales o poco elevados. El patrón aparece con el paciente SIN DOLOR — desaparece o se altera durante el dolor.",
  "⚠️ AUSÊNCIA DE SUPRA NAS 12 DERIVAÇÕES PADRÃO NÃO EXCLUI OCLUSÃO. A própria diretriz de 2025 reconhece que o critério de supra na tela padrão PERDE uma minoria significativa de oclusões coronárias agudas. Os padrões abaixo são QUATRO GRUPOS COM QUATRO CONDUTAS — não são sinônimos de STEMI, e tratá-los como se fossem produz erro em direções opostas.":
    "⚠️ LA AUSENCIA DE ELEVACIÓN DEL ST EN LAS 12 DERIVACIONES ESTÁNDAR NO EXCLUYE OCLUSIÓN. La propia guía de 2025 reconoce que el criterio de elevación en el trazado estándar PIERDE una minoría significativa de oclusiones coronarias agudas. Los patrones siguientes son CUATRO GRUPOS CON CUATRO CONDUCTAS — no son sinónimos de STEMI, y tratarlos como si lo fueran produce error en direcciones opuestas.",
  "⚠️ VD CONFIRMADO OU SUSPEITO: NITRATO E MORFINA ESTÃO CONTRAINDICADOS. O ventrículo direito infartado é DEPENDENTE DE PRÉ-CARGA — qualquer agente que a reduza causa HIPOTENSÃO GRAVE, e o nitrato sublingual dado por reflexo na dor torácica é o mecanismo mais comum. Se houver hipotensão, a conduta é VOLUME, não vasodilatador nem vasopressor de largada.":
    "⚠️ VD CONFIRMADO O SOSPECHADO: EL NITRATO Y LA MORFINA ESTÁN CONTRAINDICADOS. El ventrículo derecho infartado es DEPENDIENTE DE PRECARGA — cualquier agente que la reduzca causa HIPOTENSIÓN GRAVE, y el nitrato sublingual dado por reflejo ante el dolor torácico es el mecanismo más común. Si hay hipotensión, la conducta es VOLUMEN, no vasodilatador ni vasopresor de entrada.",
  "Hipertensão grave na apresentação (> 180/110) que RESPONDE ao tratamento; AVC isquêmico há mais de 3 meses; demência; RCP prolongada (> 10 min) ou traumática; cirurgia de grande porte < 3 semanas; sangramento interno nas últimas 2–4 semanas; punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.":
    "Hipertensión grave en la presentación (> 180/110) que RESPONDE al tratamiento; ACV isquémico hace más de 3 meses; demencia; RCP prolongada (> 10 min) o traumática; cirugía mayor < 3 semanas; sangrado interno en las últimas 2–4 semanas; punción vascular no compresible; embarazo; úlcera péptica activa; anticoagulación oral en uso.",
  "Há contraindicação ABSOLUTA":
    "Hay contraindicación ABSOLUTA",
  "ICP primária é preferida quando o tempo porta-balão é ≤ 120 min (meta ≤ 90 min em centro com hemodinâmica). ⚠️ DE ONDE CONTA: o relógio começa no PRIMEIRO CONTATO MÉDICO — não na chegada ao hemodinâmica nem na indicação do cateterismo. Contar do lugar errado ENCURTA o prazo percebido e faz escolher ICP quando a fibrinólise já era a opção certa.":
    "La ICP primaria es preferida cuando el tiempo puerta-balón es ≤ 120 min (meta ≤ 90 min en centro con hemodinamia). ⚠️ DESDE DÓNDE SE CUENTA: el reloj empieza en el PRIMER CONTACTO MÉDICO — no en la llegada a hemodinamia ni en la indicación del cateterismo. Contar desde el lugar equivocado ACORTA el plazo percibido y hace elegir ICP cuando la fibrinólisis ya era la opción correcta.",
  "Sem contraindicação ABSOLUTA":
    "Sin contraindicación ABSOLUTA",
  "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina — ⚠️ MAS ANTES, descarte os padrões abaixo.":
    "Sin elevación del ST = SCA sin elevación (IAMSEST o angina inestable) hasta la definición por la troponina — ⚠️ PERO ANTES, descarte los patrones siguientes.",
  "── CONTRAINDICAÇÕES RELATIVAS — não proíbem, mudam a conta ──":
    "── CONTRAINDICACIONES RELATIVAS — no prohíben, cambian la cuenta ──",
  "⚠️ COM RELATIVA E SEM ABSOLUTA, A DECISÃO É DE RISCO-BENEFÍCIO, e o que pesa é o TEMPO ATÉ A ICP: se a transferência para hemodinâmica for viável dentro de 120 min do primeiro contato, prefira a ICP e evite a lise. Se NÃO for, um STEMI extenso nas primeiras horas costuma justificar a fibrinólise mesmo com relativa — o risco de não reperfundir é maior que o de sangrar. Discuta com a hemodinâmica, mas NÃO ADIE a decisão esperando resposta.":
    "⚠️ CON RELATIVA Y SIN ABSOLUTA, LA DECISIÓN ES DE RIESGO-BENEFICIO, y lo que pesa es el TIEMPO HASTA LA ICP: si el traslado a hemodinamia es viable dentro de 120 min del primer contacto, prefiera la ICP y evite la lisis. Si NO lo es, un STEMI extenso en las primeras horas suele justificar la fibrinólisis aun con relativa — el riesgo de no reperfundir es mayor que el de sangrar. Discuta con hemodinamia, pero NO DEMORE la decisión esperando respuesta.",
  "APRESENTAÇÃO — seringas PREENCHIDAS em degraus fixos: 20, 40, 60, 80 e 100 mg, todas a 100 mg/mL (ou seja, 60 mg = 0,6 mL). A dose por peso raramente cai num degrau exato: use a seringa graduada e DESPREZE o excedente, sem arredondar para o degrau de cima. ⚠️ Arredondar 68 mg para 80 mg é 18% de anticoagulante a mais em quem talvez já vá receber fibrinolítico e dupla antiagregação. Confira a graduação da seringa em uso antes de desprezar volume.":
    "PRESENTACIÓN — jeringas PRECARGADAS en escalones fijos: 20, 40, 60, 80 y 100 mg, todas a 100 mg/mL (es decir, 60 mg = 0,6 mL). La dosis por peso rara vez cae en un escalón exacto: use la jeringa graduada y DESECHE el excedente, sin redondear al escalón superior. ⚠️ Redondear 68 mg a 80 mg es un 18% más de anticoagulante en alguien que quizá reciba también fibrinolítico y doble antiagregación. Verifique la graduación de la jeringa en uso antes de desechar volumen.",
  "APRESENTAÇÃO E PREPARO — o TNK vem em PÓ LIOFILIZADO com diluente próprio (frasco de 50 mg = 10.000 U), e é reconstituído na hora. ⚠️ DUAS ESCALAS NO MESMO FRASCO: a dose se prescreve em MILIGRAMAS e o rótulo também traz UNIDADES — 1 mg = 200 U. Confundir as duas erra por um fator de 200, e o TNK é bolus ÚNICO: não há como corrigir depois. Confira no frasco o volume de reconstituição e o volume correspondente à dose calculada ANTES de aspirar, com um segundo profissional conferindo.":
    "PRESENTACIÓN Y PREPARACIÓN — el TNK viene en POLVO LIOFILIZADO con diluyente propio (frasco de 50 mg = 10.000 U), y se reconstituye en el momento. ⚠️ DOS ESCALAS EN EL MISMO FRASCO: la dosis se prescribe en MILIGRAMOS y la etiqueta también trae UNIDADES — 1 mg = 200 U. Confundirlas yerra por un factor de 200, y el TNK es bolo ÚNICO: no hay cómo corregir después. Verifique en el frasco el volumen de reconstitución y el volumen correspondiente a la dosis calculada ANTES de aspirar, con un segundo profesional verificando.",
  "⚠️ WELLENS: NUNCA TESTE ERGOMÉTRICO — E ESTA É A RAZÃO. O paciente está sem dor, com marcadores normais e um ECG que parece \"isquemia que já passou\": é exatamente essa APARÊNCIA DE ESTABILIDADE que faz alguém pedir o teste. Esses pacientes vão MAL com tratamento clínico e podem INFARTAR OU PARAR se estressados indevidamente — a DA crítica continua lá. A conduta é CATETERISMO PRECOCE, não estratificação não invasiva.":
    "⚠️ WELLENS: NUNCA PRUEBA ERGOMÉTRICA — Y ESTA ES LA RAZÓN. El paciente está sin dolor, con marcadores normales y un ECG que parece \"isquemia que ya pasó\": es exactamente el perfil que alguien enviaría a una prueba de esfuerzo. Pero la lesión crítica de la descendente anterior sigue ahí, y el esfuerzo puede ocluirla — infarto anterior extenso en la cinta. Wellens va a CORONARIOGRAFÍA, no a estratificación no invasiva.",
  "SOBRE \"OMI/NOMI\": há um enquadramento em consolidação que classifica por OCLUSÃO (occlusion MI × non-occlusion MI) em vez de por supra de ST, porque o supra na tela padrão perde oclusões — é a lógica dos padrões acima. A ACC/AHA 2025 MANTÉM STEMI/NSTEMI e incorpora só parte desse reconhecimento; as diretrizes australianas de 2025 adotaram a nomenclatura OMI. O app usa a nomenclatura corrente de propósito: é a que a equipe ao seu lado fala.":
    // ⚠️ D-81 RESOLVIDA (autor, 2026-08-23): o PORTUGUÊS vence. Ele informa que
    // o movimento OMI existe, NOMEIA quem adotou e DECLARA a escolha do app; o
    // espanhol apenas negava. Duas versões afirmando coisas diferentes sobre o
    // estado das diretrizes não era tradução — era conteúdo divergente.
    "SOBRE \"OMI/NOMI\": hay un encuadre en consolidación que clasifica por OCLUSIÓN (occlusion MI × non-occlusion MI) en lugar de por elevación del ST, porque la elevación en la pantalla pierde oclusiones — es la lógica de los patrones de arriba. La ACC/AHA 2025 MANTIENE STEMI/NSTEMI e incorpora solo parte de ese reconocimiento; las guías australianas de 2025 adoptaron la nomenclatura OMI. La app usa la nomenclatura corriente a propósito: es la que habla el equipo a su lado.",

  // ── Rodada 2026-08-24 — pilotos v3: dissecção, LBBB/Sgarbossa, grupos A/B/C,
  // GRACE derivado, atalhos, reavaliação pós-intervenção (coronary-decision-tree.ts) ──
  "  • SE FOI FIBRINÓLISE E O PACIENTE AINDA NÃO FOI CATETERIZADO → CLOPIDOGREL. É o único P2Y12 com evidência em paciente lisado (CLARITY-TIMI 28 e COMMIT). NÃO usar ticagrelor nem prasugrel aqui — e o prasugrel, além disso, não tem indicação sem stent. Dose por IDADE: até 75 anos, ataque de 300 mg; 75 anos ou mais, SEM ataque — 75 mg direto.":
    "  • SI FUE FIBRINÓLISIS Y EL PACIENTE AÚN NO FUE CATETERIZADO → CLOPIDOGREL. Es el único P2Y12 con evidencia en paciente lisado (CLARITY-TIMI 28 y COMMIT). NO usar ticagrelor ni prasugrel aquí — y el prasugrel, además, no tiene indicación sin stent. Dosis por EDAD: hasta 75 años, carga de 300 mg; 75 años o más, SIN carga — 75 mg directo.",
  "  • ⚠️ A dose é ponto de partida, não prescrição fechada: quem titula é o TCA medido na hemodinâmica.":
    "  • ⚠️ La dosis es punto de partida, no prescripción cerrada: quien titula es el TCA medido en la hemodinamia.",
  "A dose e a combinação dependem de qual foi o diagnóstico — não invento isso por você.":
    "La dosis y la combinación dependen de cuál fue el diagnóstico — no invento eso por usted.",
  "A via de síndrome coronariana aguda deste módulo não se aplica enquanto esta suspeita não for afastada.":
    "La vía de síndrome coronario agudo de este módulo no se aplica mientras esta sospecha no sea descartada.",
  "AAS liberado": "AAS liberado",
  "ACC/AHA 2025, Classe 1 A: FMC-dispositivo ≤ 120 min → ICP primária é a estratégia preferida.":
    "ACC/AHA 2025, Clase 1 A: PCM-dispositivo ≤ 120 min → la ICP primaria es la estrategia preferida.",
  "ACC/AHA 2025, Classe 1 A: sintomas < 12 h e atraso previsto > 120 min de FMC, sem contraindicação → fibrinólise.":
    "ACC/AHA 2025, Clase 1 A: síntomas < 12 h y demora prevista > 120 min de PCM, sin contraindicación → fibrinólisis.",
  "ACC/AHA 2025, Classe 1 B-R: falha de reperfusão → angiografia imediata com ICP de resgate.":
    "ACC/AHA 2025, Clase 1 B-R: falla de reperfusión → angiografía inmediata con ICP de rescate.",
  "ACC/AHA 2025, Classe 1 C-LD. Conduta semelhante ao STEMI pela instabilidade.":
    "ACC/AHA 2025, Clase 1 C-LD. Conducta semejante al STEMI por la inestabilidad.",
  "ACC/AHA 2025, Classe 2a B-R (< 24 h). Coronariografia conforme a categoria de risco.":
    "ACC/AHA 2025, Clase 2a B-R (< 24 h). Coronariografía según la categoría de riesgo.",
  "ACC/AHA 2025, Classe 2a B-R: para NSTE-ACS não-alto-risco com intenção invasiva, razoável realizar angiografia antes da alta hospitalar.":
    "ACC/AHA 2025, Clase 2a B-R: para NSTE-ACS de riesgo no alto con intención invasiva, razonable realizar angiografía antes del alta hospitalaria.",
  "Acionar a hemodinâmica AGORA. O relógio conta a partir de agora.":
    "Activar la hemodinamia AHORA. El reloj cuenta a partir de ahora.",
  "Algum destes três está presente?": "¿Alguno de estos tres está presente?",
  "Alterações dinâmicas de ST-T recorrentes (supra intermitente)":
    "Alteraciones dinámicas de ST-T recurrentes (elevación intermitente)",
  "Anamnese dirigida e exame em paralelo (não atrasar o ECG).":
    "Anamnesis dirigida y examen en paralelo (no retrasar el ECG).",
  "Angio-TC de aorta com urgência; acionar cirurgia vascular/cardíaca.":
    "Angio-TC de aorta con urgencia; activar cirugía vascular/cardíaca.",
  "Angiografia imediata, com intenção de ICP.":
    "Angiografía inmediata, con intención de ICP.",
  "Antes do AAS — dissecção de aorta é incompatível com antitrombótico":
    "Antes del AAS — la disección de aorta es incompatible con antitrombótico",
  "Antes do AAS: triagem rápida de dissecção — próximo passo.":
    "Antes del AAS: cribado rápido de disección — próximo paso.",
  "Antitrombóticos — qual quadro?": "Antitrombóticos — ¿cuál cuadro?",
  "Arritmia ventricular ameaçadora/PCR": "Arritmia ventricular amenazante/PCR",
  "BAIXO: sem os critérios acima — angiografia razoável antes da alta (ACC/AHA 2025, Classe 2a B-R), não obrigatória em < 72 h.":
    "BAJO: sin los criterios anteriores — angiografía razonable antes del alta (ACC/AHA 2025, Clase 2a B-R), no obligatoria en < 72 h.",
  "BRE novo/presumivelmente novo": "BRIHH nuevo/presumiblemente nuevo",
  "BRE novo isolado — sem via de reperfusão emergente":
    "BRIHH nuevo aislado — sin vía de reperfusión emergente",
  "BRE novo — correlação clínica obrigatória":
    "BRIHH nuevo — correlación clínica obligatoria",
  "BRE novo, sem supra que atinja critério":
    "BRIHH nuevo, sin elevación que alcance criterio",
  "Baixo — angiografia antes da alta": "Bajo — angiografía antes del alta",
  "Cirurgia intracraniana/intraespinhal < 2 meses; HAS grave não controlada/refratária (> 180/110).":
    "Cirugía intracraneal/intraespinal < 2 meses; HTA grave no controlada/refractaria (> 180/110).",
  "Complicação (arritmia, choque, mecânica)": "Complicación (arritmia, choque, mecánica)",
  "Complicação mecânica": "Complicación mecánica",
  "Complicações pós-IAM": "Complicaciones post-IAM",
  "Comunicar a hemodinâmica de destino para reduzir o tempo até o dispositivo.":
    "Comunicar a la hemodinamia de destino para reducir el tiempo hasta el dispositivo.",
  "Considerar angio-TC de aorta se a dúvida persistir com o exame dirigido.":
    "Considerar angio-TC de aorta si la duda persiste con el examen dirigido.",
  "Critério de STEMI por território — Grupo A.": "Criterio de STEMI por territorio — Grupo A.",
  "Critério de STEMI — investigar V3R–V4R (VD) e V7–V9 (posterior) em paralelo.":
    "Criterio de STEMI — investigar V3R–V4R (VD) y V7–V9 (posterior) en paralelo.",
  "Critérios de muito alto risco — presentes?": "¿Criterios de muy alto riesgo — presentes?",
  "De Winter": "De Winter",
  "Discussão cirúrgica pode ser necessária (tronco/multiarterial) — não é candidato a trombolítico.":
    "Puede ser necesaria discusión quirúrgica (tronco/multivaso) — no es candidato a trombolítico.",
  "Dor refratária ao tratamento máximo": "Dolor refractario al tratamiento máximo",
  "Enoxaparina < 75 anos: bolus IV de 30 mg + {enoxa} mg SC 12/12h (1 mg/kg, máx 100 mg nas duas primeiras doses; a partir da terceira, {enoxaPorPeso} mg).":
    "Enoxaparina < 75 años: bolo IV de 30 mg + {enoxa} mg SC cada 12h (1 mg/kg, máx. 100 mg en las dos primeras dosis; a partir de la tercera, {enoxaPorPeso} mg).",
  "Enoxaparina ≥ 75 anos: SEM bolus IV; {enoxa75} mg SC 12/12h (0,75 mg/kg, máx 75 mg nas duas primeiras doses; a partir da terceira, {enoxa75PorPeso} mg).":
    "Enoxaparina ≥ 75 años: SIN bolo IV; {enoxa75} mg SC cada 12h (0,75 mg/kg, máx. 75 mg en las dos primeras dosis; a partir de la tercera, {enoxa75PorPeso} mg).",
  "Escore GRACE": "Puntaje GRACE",
  "Escore GRACE 2.0 (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina). GRACE > 140 = alto; 109–140 = intermediário; < 109 = baixo.":
    "Puntaje GRACE 2.0 (edad, FC, PAS, creatinina, Killip, paro cardíaco al ingreso, desviación de ST, troponina). GRACE > 140 = alto; 109–140 = intermedio; < 109 = bajo.",
  "Estratificação de risco — GRACE": "Estratificación de riesgo — GRACE",
  "Estratégia seletiva — angiografia antes da alta": "Estrategia selectiva — angiografía antes del alta",
  "Fase mais precoce da oclusão — larga, simétrica, desproporcional ao QRS.":
    "Fase más precoz de la oclusión — ancha, simétrica, desproporcionada respecto al QRS.",
  "Fibrinólise assim que possível. Sempre seguida de estratégia fármaco-invasiva.":
    "Fibrinólisis en cuanto sea posible. Siempre seguida de estrategia fármaco-invasiva.",
  "Fibrinólise contraindicada (ou padrão fora da fibrinólise) → reperfusão mecânica é a via.":
    "Fibrinólisis contraindicada (o patrón fuera de la fibrinólisis) → la reperfusión mecánica es la vía.",
  "Fibrinólise sem sucesso — supra não resolveu, dor ou instabilidade persistem":
    "Fibrinólisis sin éxito — la elevación no resolvió, el dolor o la inestabilidad persisten",
  "Fluxo completo — dor torácica agora": "Flujo completo — dolor torácico ahora",
  "Grupo A — STEMI/critério claro: localizar a parede": "Grupo A — STEMI/criterio claro: localizar la pared",
  "Grupo B — confirmar com V7–V9, estratégia invasiva emergente.":
    "Grupo B — confirmar con V7–V9, estrategia invasiva emergente.",
  "Grupo B — estratégia invasiva emergente, repetir ECG.":
    "Grupo B — estrategia invasiva emergente, repetir ECG.",
  "Grupo B — estratégia invasiva emergente.": "Grupo B — estrategia invasiva emergente.",
  "Grupo B — oclusão de alto risco, sala agora, sem fibrinólise automática":
    "Grupo B — oclusión de alto riesgo, sala ahora, sin fibrinólisis automática",
  "Grupo B — sala urgente, FIBRINÓLISE FORA.": "Grupo B — sala urgente, FIBRINÓLISIS QUEDA FUERA.",
  "Grupo B — via de reperfusão": "Grupo B — vía de reperfusión",
  "Grupo C — NÃO é reperfusão emergente. Nunca teste ergométrico.":
    "Grupo C — NO es reperfusión emergente. Nunca prueba ergométrica.",
  "Grupo C — Wellens: alto risco, sem reperfusão emergente":
    "Grupo C — Wellens: alto riesgo, sin reperfusión emergente",
  "HAS significativa na apresentação (> 180/110); AVC isquêmico > 3 meses; demência; RCP traumática/prolongada (> 10 min); cirurgia de grande porte < 3 semanas; sangramento interno recente (2–4 semanas); punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.":
    "HTA significativa en la presentación (> 180/110); ACV isquémico > 3 meses; demencia; RCP traumática/prolongada (> 10 min); cirugía mayor < 3 semanas; sangrado interno reciente (2–4 semanas); punción vascular no compresible; embarazo; úlcera péptica activa; anticoagulación oral en uso.",
  "Há dor isquêmica ativa e/ou instabilidade hemodinâmica associada?":
    "¿Hay dolor isquémico activo y/o inestabilidad hemodinámica asociada?",
  "IC aguda com isquemia": "IC aguda con isquemia",
  "ICP de resgate": "ICP de rescate",
  "ICP disponível a tempo (mesmo critério de FMC-dispositivo)?":
    "¿ICP disponible a tiempo (mismo criterio de PCM-dispositivo)?",
  "ICP primária disponível com FMC-dispositivo ≤ 120 min (ideal ≤ 90 min)?":
    "¿ICP primaria disponible con PCM-dispositivo ≤ 120 min (ideal ≤ 90 min)?",
  "Indicada por: ausência de melhora sintomática, resolução do supra <50% (derivações anteriores) ou <70% (inferiores), ou instabilidade hemodinâmica/elétrica.":
    "Indicada por: ausencia de mejoría sintomática, resolución de la elevación <50% (derivaciones anteriores) o <70% (inferiores), o inestabilidad hemodinámica/eléctrica.",
  "Infra ascendente 1–3mm em V1–V6 + T alta/simétrica. VPP 95–100% para oclusão de DA proximal.":
    "Infradesnivel ascendente 1–3mm en V1–V6 + T alta/simétrica. VPP 95–100% para oclusión de DA proximal.",
  "Infra horizontal + R alta/larga + T positiva em V1–V3, R/S > 1 em V2.":
    "Infradesnivel horizontal + R alta/ancha + T positiva en V1–V3, R/S > 1 en V2.",
  "Instabilidade hemodinâmica/choque": "Inestabilidad hemodinámica/choque",
  "Internar; notificar cardiologia intervencionista; coronariografia NÃO emergencial durante a internação.":
    "Internar; notificar a cardiología intervencionista; coronariografía NO emergencial durante la internación.",
  "Já tenho o ECG na mão, ainda não liberei AAS":
    "Ya tengo el ECG en mano, aún no liberé AAS",
  "Lesão vascular cerebral estrutural ou neoplasia intracraniana maligna conhecida; TCE/trauma facial fechado significativo < 3 meses.":
    "Lesión vascular cerebral estructural o neoplasia intracraneal maligna conocida; TCE/trauma facial cerrado significativo < 3 meses.",
  "Manter monitorizado; não liberar AAS/antitrombótico até a suspeita ser afastada ou o risco assumido conscientemente pela equipe.":
    "Mantener monitorizado; no liberar AAS/antitrombótico hasta que la sospecha sea descartada o el riesgo sea asumido conscientemente por el equipo.",
  "Manter monitorização, troponina e ECG seriados enquanto aguarda.":
    "Mantener monitorización, troponina y ECG seriados mientras espera.",
  "Melhora sintomática, sem instabilidade": "Mejoría sintomática, sin inestabilidad",
  "Mesma urgência de sala do STEMI, por via de ICP/transferência — não por fibrinólise.":
    "Misma urgencia de sala del STEMI, por vía de ICP/transferencia — no por fibrinólisis.",
  "Meta ideal de FMC-dispositivo: ≤ 90 min quando transporte direto a hospital com ICP for viável desde o pré-hospitalar.":
    "Meta ideal de PCM-dispositivo: ≤ 90 min cuando el transporte directo a hospital con ICP sea viable desde el ámbito prehospitalario.",
  "Monitor cardíaco contínuo, oximetria, PA (bilateral), 2 acessos venosos; desfibrilador próximo.":
    "Monitor cardíaco continuo, oximetría, PA (bilateral), 2 accesos venosos; desfibrilador cerca.",
  "NÃO administrar AAS nem qualquer antitrombótico enquanto a suspeita for relevante.":
    "NO administrar AAS ni ningún antitrombótico mientras la sospecha sea relevante.",
  "NÃO é equivalente automático — vá para o nó de correlação clínica, não direto para reperfusão.":
    "NO es equivalente automático — vaya al nodo de correlación clínica, no directo a reperfusión.",
  "Não sei dizer — reavaliar com ECG seriado": "No sé decir — reevaluar con ECG seriado",
  "Não tenho certeza — repetir ECG e reavaliar": "No estoy seguro — repetir ECG y reevaluar",
  "Não — BRE novo isolado, sem dor ativa nem instabilidade":
    "No — BRIHH nuevo aislado, sin dolor activo ni inestabilidad",
  "Não — classificar manualmente": "No — clasificar manualmente",
  "Não — nenhum dos três": "No — ninguno de los tres",
  "Não — transferir": "No — transferir",
  "O fluxo completo é o padrão. Os atalhos pulam etapas já feitas — nenhum deles inventa dado que falta.":
    "El flujo completo es el estándar. Los atajos saltan etapas ya hechas — ninguno inventa un dato que falte.",
  "O traçado se parece com algum destes padrões?": "¿El trazado se parece a alguno de estos patrones?",
  "Por onde você quer começar?": "¿Por dónde quiere empezar?",
  "Posterior isolado": "Posterior aislado",
  "Programar coronariografia antes da alta, sem a urgência das categorias alto/muito alto.":
    "Programar coronariografía antes del alta, sin la urgencia de las categorías alto/muy alto.",
  "Qual padrão você reconheceu?": "¿Qué patrón reconoció?",
  "Qualquer hemorragia intracraniana prévia; AVC isquêmico nos últimos 3 meses (exceto isquêmico agudo < 4,5 h).":
    "Cualquier hemorragia intracraneal previa; ACV isquémico en los últimos 3 meses (excepto isquémico agudo < 4,5 h).",
  "Qualquer um destes deriva invasiva IMEDIATA (< 2h) automaticamente.":
    "Cualquiera de estos deriva invasiva INMEDIATA (< 2h) automáticamente.",
  "Reavaliação pós-intervenção": "Reevaluación posintervención",
  "Reclassificar para invasiva precoce/imediata se surgir novo critério de risco.":
    "Reclasificar a invasiva precoz/inmediata si surge un nuevo criterio de riesgo.",
  "Referência — sem supra": "Referencia — sin elevación",
  "Reperfusão emergente.": "Reperfusión emergente.",
  "Reperfusão indicada até 12 h; entre 12–24 h, benefício não estabelecido — considerar se grande área em risco/instabilidade e ICP indisponível.":
    "Reperfusión indicada hasta 12 h; entre 12–24 h, beneficio no establecido — considerar si gran área en riesgo/inestabilidad e ICP no disponible.",
  "Reperfusão mecânica preferencial. Meta ideal de FMC-dispositivo ≤ 90 min.":
    "Reperfusión mecánica preferencial. Meta ideal de PCM-dispositivo ≤ 90 min.",
  "Resposta clínica e do ECG após a reperfusão/estratégia invasiva?":
    "¿Respuesta clínica y del ECG tras la reperfusión/estrategia invasiva?",
  "SCA sem supra": "SCA sin elevación",
  "STEMI": "STEMI",
  "STEMI já confirmado": "STEMI ya confirmado",
  "STEMI já confirmado — ir direto para reperfusão": "STEMI ya confirmado — ir directo a reperfusión",
  "STEMI ou SCA sem supra?": "¿STEMI o SCA sin elevación?",
  "Sangramento ativo ou diátese hemorrágica (exceto menstruação); suspeita de dissecção de aorta.":
    "Sangrado activo o diátesis hemorrágica (excepto menstruación); sospecha de disección de aorta.",
  "⏱ Se houve fibrinólise, reavalie por volta de 60–90 min (uso corrente, não confirmado no texto da diretriz 2025 — use o protocolo do seu serviço) — não deixe passar a janela sem checar. Sucesso = melhora sintomática + resolução do supra (ACC/AHA 2025: <50% de resolução em derivações anteriores ou <70% em inferiores = falha) + estabilidade. Se ICP: fluxo restabelecido + melhora sintomática confirmam.":
    "⏱ Si hubo fibrinólisis, reevalúe alrededor de 60–90 min (uso corriente, no confirmado en el texto de la guía 2025 — use el protocolo de su servicio) — no deje pasar la ventana sin verificar. Éxito = mejoría sintomática + resolución de la elevación (ACC/AHA 2025: <50% de resolución en derivaciones anteriores o <70% en inferiores = falla) + estabilidad. Si ICP: flujo restablecido + mejoría sintomática confirman.",
  "Se já tiver o número, o app deriva a categoria — não pede para reclassificar manualmente.":
    "Si ya tiene el número, la app deriva la categoría — no pide reclasificar manualmente.",
  "Selecione o que mais se parece com o traçado.": "Seleccione lo que más se parezca al trazado.",
  "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina — ⚠️ MAS ANTES, descarte os padrões que ocluem sem elevar.":
    "Sin elevación de ST = SCA sin elevación (NSTEMI o angina inestable) hasta definición por troponina — ⚠️ PERO ANTES, descarte los patrones que ocluyen sin elevar.",
  "Siga para os padrões abaixo antes de classificar como sem supra.":
    "Siga a los patrones de abajo antes de clasificar como sin elevación.",
  "Sim — ICP disponível a tempo": "Sí — ICP disponible a tiempo",
  "Sim — algum está presente": "Sí — alguno está presente",
  "Sim — dor ativa e/ou instabilidade": "Sí — dolor activo y/o inestabilidad",
  "Sim — supra de ST atingindo critério por território": "Sí — elevación de ST que alcanza criterio por territorio",
  "Sim — tenho o número": "Sí — tengo el número",
  "Sugere tronco de coronária esquerda ou multiarterial.":
    "Sugiere tronco de coronaria izquierda o multivaso.",
  "Supra em aVR + infra difuso": "Elevación en aVR + infradesnivel difuso",
  "Supra em aVR + infra difuso (tronco/multiarterial)": "Elevación en aVR + infradesnivel difuso (tronco/multivaso)",
  "Supra em aVR + infra difuso — sala urgente, fibrinólise fora":
    "Elevación en aVR + infradesnivel difuso — sala urgente, fibrinólisis queda fuera",
  "Só preciso das doses/antitrombóticos": "Solo necesito las dosis/antitrombóticos",
  "T bifásica em V2–V3, sem dor ativa, marcadores normais.":
    "T bifásica en V2–V3, sin dolor activo, marcadores normales.",
  "T hiperaguda": "T hiperaguda",
  "T profunda e simétrica invertida em V2–V3, sem dor ativa.":
    "T profunda y simétricamente invertida en V2–V3, sin dolor activo.",
  "Tempo é músculo. Medidas iniciais e ECG em paralelo, sem atrasar o AAS por exames não indispensáveis.":
    "Tiempo es músculo. Medidas iniciales y ECG en paralelo, sin retrasar el AAS por exámenes no indispensables.",
  "Toque no valor (ou adicione). O app deriva a categoria pelos limiares já usados neste módulo.":
    "Toque el valor (o agréguelo). La app deriva la categoría por los umbrales ya usados en este módulo.",
  "Transferir para centro com ICP: angiografia sistemática entre 2–24 h com intenção de ICP, MESMO com reperfusão aparentemente bem-sucedida (ACC/AHA 2025, Classe 1 B-R).":
    "Transferir a centro con ICP: angiografía sistemática entre 2–24 h con intención de ICP, INCLUSO con reperfusión aparentemente exitosa (ACC/AHA 2025, Clase 1 B-R).",
  "Triagem de dissecção — dúvida": "Cribado de disección — duda",
  "Você já tem o escore GRACE calculado?": "¿Ya tiene el puntaje GRACE calculado?",
  "Wellens (tipo A ou B)": "Wellens (tipo A o B)",
  "Âncora de comparação. Não exclui SCA sem supra nem os padrões que ocluem sem elevar.":
    "Ancla de comparación. No excluye SCA sin elevación ni los patrones que ocluyen sin elevar.",
  "≥ 75 anos: meia dose ({tnkHalf} mg) SOMENTE em estratégia fármaco-invasiva com apresentação até 3 h do início dos sintomas (STREAM-2). Fora dessa condição, usar a DOSE INTEGRAL.":
    "≥ 75 años: media dosis ({tnkHalf} mg) SOLO en estrategia fármaco-invasiva con presentación hasta 3 h del inicio de los síntomas (STREAM-2). Fuera de esa condición, usar la DOSIS íNTEGRA.",
  "⚠️ A ACC/AHA 2025 avisa: esta lista é orientativa para a decisão clínica e PODE NÃO SER exaustiva nem definitiva — não tratar como lista fechada.":
    "⚠️ La ACC/AHA 2025 advierte: esta lista es orientativa para la decisión clínica y PUEDE NO SER exhaustiva ni definitiva — no tratarla como lista cerrada.",
  "⚠️ COM RELATIVA E SEM ABSOLUTA, o que pesa é o TEMPO ATÉ A ICP: dentro de 120 min do primeiro contato → prefira ICP. Não sendo viável, STEMI extenso nas primeiras horas costuma justificar fibrinólise mesmo com relativa. Discuta com a hemodinâmica, mas NÃO ADIE a decisão esperando resposta.":
    "⚠️ CON RELATIVA Y SIN ABSOLUTA, lo que pesa es el TIEMPO HASTA LA ICP: dentro de 120 min del primer contacto → prefiera ICP. No siendo viable, un STEMI extenso en las primeras horas suele justificar fibrinólisis incluso con relativa. Discuta con la hemodinamia, pero NO POSPONGA la decisión esperando respuesta.",
  "⚠️ O app NÃO CALCULA o escore GRACE: os coeficientes do nomograma (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina → pontos) não foram confirmados em fonte nesta sessão. Ele só deriva a CATEGORIA a partir do número que você já tem.":
    "⚠️ La app NO CALCULA el puntaje GRACE: los coeficientes del nomograma (edad, FC, PAS, creatinina, Killip, paro cardíaco al ingreso, desviación de ST, troponina → puntos) no fueron confirmados en fuente en esta sesión. Solo deriva la CATEGORÍA a partir del número que usted ya tiene.",
  "⚠️ O intervalo exato de reavaliação (classicamente 60–90 min pós-fibrinolítico) não foi confirmado no texto da diretriz 2025 nesta sessão — use o protocolo do seu serviço.":
    "⚠️ El intervalo exacto de reevaluación (clásicamente 60–90 min posfibrinolítico) no fue confirmado en el texto de la guía 2025 en esta sesión — use el protocolo de su servicio.",
  "⚠️ Prazo exato para o cateterismo não confirmado em fonte nesta sessão — não fixar número; seguir o protocolo do serviço.":
    "⚠️ Plazo exacto para el cateterismo no confirmado en fuente en esta sesión — no fijar número; seguir el protocolo del servicio.",
  "⚠️ RECONHECER UM DELES MUDA O DESTINO — mas NÃO todos para o mesmo lugar. De Winter/posterior/T hiperaguda/aVR têm urgência de sala; Wellens NÃO.":
    "⚠️ RECONOCER UNO DE ELLOS CAMBIA EL DESTINO — pero NO todos van al mismo lugar. De Winter/posterior/T hiperaguda/aVR tienen urgencia de sala; Wellens NO.",
  "⚠️ Se chegou por atalho ('STEMI já confirmado'): confirme que a dissecção foi afastada antes de liberar antitrombótico/fibrinolítico — este fluxo pressupõe que sim.":
    "⚠️ Si llegó por atajo ('STEMI ya confirmado'): confirme que la disección fue descartada antes de liberar antitrombótico/fibrinolítico — este flujo presupone que sí.",
  "⚠️ Sem opção de fibrinólise aqui — a literatura não sustenta essa via para De Winter/posterior/T hiperaguda com a mesma confiança do STEMI clássico.":
    "⚠️ Sin opción de fibrinólisis aquí — la literatura no sustenta esa vía para De Winter/posterior/T hiperaguda con la misma confianza del STEMI clásico.",

  // ── lib/dissecao-triagem.ts ──
  "Assimetria de pulso ou de PA entre os membros": "Asimetría de pulso o de PA entre los miembros",
  "Dor com irradiação para o dorso/região interescapular": "Dolor con irradiación al dorso/región interescapular",
  "Início súbito, já máximo desde o começo (não crescente)": "Inicio súbito, ya máximo desde el comienzo (no creciente)",
  "Na dúvida, o lado seguro é investigar antes de liberar: mantenha o paciente monitorizado, mas não libere antitrombótico até essa suspeita ser afastada ou o risco ser assumido conscientemente pela equipe.":
    "Ante la duda, el lado seguro es investigar antes de liberar: mantenga al paciente monitorizado, pero no libere antitrombótico hasta que esa sospecha sea descartada o el riesgo sea asumido conscientemente por el equipo.",
  "Sem sinais de dissecção nos três itens — siga para AAS conforme indicado.":
    "Sin signos de disección en los tres ítems — siga hacia AAS según lo indicado.",
  "⚠️ SUSPEITA DE DISSECÇÃO — NÃO LIBERE AAS/ANTITROMBÓTICO ainda. Solicite angio-TC de aorta com urgência e acione a equipe vascular/cirurgia cardíaca antes de prosseguir. Se a dissecção for confirmada ou permanecer como suspeita relevante, a via de síndrome coronariana aguda deste módulo não se aplica.":
    "⚠️ SOSPECHA DE DISECCIÓN — NO LIBERE AAS/ANTITROMBÓTICO todavía. Solicite angio-TC de aorta con urgencia y active al equipo vascular/cirugía cardíaca antes de continuar. Si la disección se confirma o permanece como sospecha relevante, la vía de síndrome coronario agudo de este módulo no se aplica.",

  // ── lib/lbbb-sgarbossa.ts ──
  "LBBB NOVO + DOR ISQUÊMICA ATIVA/INSTABILIDADE — correlação clínica positiva. A conduta segue pela via de reperfusão com a mesma urgência do STEMI, por decisão clínica apoiada em Sgarbossa quando disponível — não porque o BRE, isolado, seja equivalente.":
    "BRIHH NUEVO + DOLOR ISQUÉMICO ACTIVO/INESTABILIDAD — correlación clínica positiva. La conducta sigue por la vía de reperfusión con la misma urgencia del STEMI, por decisión clínica apoyada en Sgarbossa cuando esté disponible — no porque el BRIHH, aislado, sea equivalente.",
  "LBBB NOVO ISOLADO, SEM DOR ATIVA NEM INSTABILIDADE — não ative a via de reperfusão emergente por este achado isolado. Siga a via de troponina seriada/ECG seriado, como SCA sem supra, e reclassifique se surgir correlação clínica.":
    "BRIHH NUEVO AISLADO, SIN DOLOR ACTIVO NI INESTABILIDAD — no active la vía de reperfusión emergente por este hallazgo aislado. Siga la vía de troponina seriada/ECG seriado, como SCA sin elevación, y reclasifique si surge correlación clínica.",
  "SGARBOSSA / SGARBOSSA MODIFICADO — APOIO, NÃO REGRA DESTA DIRETRIZ. Os critérios de Sgarbossa (concordância de ST ≥1 mm; infra em V1–V3 ≥1 mm; discordância excessiva ≥5 mm) e os modificados de Smith (razão ST/S ≤ −0,25) NÃO constam no texto da ACC/AHA/ACEP/NAEMSP/SCAI 2025 — vêm de literatura complementar (Sgarbossa 1996; Smith 2012). Use como apoio ao julgamento clínico do BRE novo sintomático, nunca como critério que decide sozinho a fibrinólise.":
    "SGARBOSSA / SGARBOSSA MODIFICADO — APOYO, NO REGLA DE ESTA GUÍA. Los criterios de Sgarbossa (concordancia de ST ≥1 mm; infradesnivel en V1–V3 ≥1 mm; discordancia excesiva ≥5 mm) y los modificados de Smith (razón ST/S ≤ −0,25) NO constan en el texto de la ACC/AHA/ACEP/NAEMSP/SCAI 2025 — provienen de literatura complementaria (Sgarbossa 1996; Smith 2012). Úselos como apoyo al juicio clínico del BRIHH nuevo sintomático, nunca como criterio que decide solo la fibrinólisis.",
  "⚠️ BUSCA LITERAL no texto completo da diretriz 2025 (~7.684 linhas do PDF oficial, por \"sgarbossa\"/\"concordant\"/\"discordant\") NÃO ENCONTROU NENHUMA OCORRÊNCIA. Sgarbossa e Sgarbossa modificado vêm de literatura complementar (Sgarbossa 1996; Smith 2012), não desta diretriz.":
    "⚠️ BÚSQUEDA LITERAL en el texto completo de la guía 2025 (~7.684 líneas del PDF oficial, por \"sgarbossa\"/\"concordant\"/\"discordant\") NO ENCONTRÓ NINGUNA OCURRENCIA. Sgarbossa y Sgarbossa modificado provienen de literatura complementaria (Sgarbossa 1996; Smith 2012), no de esta guía.",
  "⚠️ FONTE — nota de rodapé da Tabela 3 (ACC/AHA/ACEP/NAEMSP/SCAI 2025): \"New or presumably new LBBB at presentation occurs infrequently and should not be considered diagnostic of AMI in isolation; clinical correlation is required. A new LBBB in an asymptomatic patient does not constitute a STEMI equivalent.\"":
    "⚠️ FUENTE — nota al pie de la Tabla 3 (ACC/AHA/ACEP/NAEMSP/SCAI 2025): \"New or presumably new LBBB at presentation occurs infrequently and should not be considered diagnostic of AMI in isolation; clinical correlation is required. A new LBBB in an asymptomatic patient does not constitute a STEMI equivalent.\" (texto original en inglés, tal como consta en la guía).",
  "⚠️ LBBB NOVO NÃO É EQUIVALENTE AUTOMÁTICO DE STEMI (correção da diretriz 2025 em relação a versões antigas). Ocorre pouco e não deve ser considerado diagnóstico de IAM isoladamente — exige correlação clínica. Em paciente ASSINTOMÁTICO, um LBBB novo NÃO constitui equivalente de STEMI.":
    "⚠️ BRIHH NUEVO NO ES EQUIVALENTE AUTOMÁTICO DE STEMI (corrección de la guía 2025 respecto a versiones antiguas). Ocurre poco y no debe considerarse diagnóstico de IAM de forma aislada — exige correlación clínica. En paciente ASINTOMÁTICO, un BRIHH nuevo NO constituye equivalente de STEMI.",

  // ── Rodada 2026-08-24 — refinamento v3: linguagem clínica antes do rótulo interno ──
  "Alto risco, NÃO é reperfusão emergente. Nunca teste ergométrico.":
    "Alto riesgo, NO es reperfusión emergente. Nunca prueba ergométrica.",
  "Mesma urgência de sala do STEMI, por via de ICP/transferência — não por fibrinólise. (Referência interna: Grupo B.)":
    "Misma urgencia de sala del STEMI, por vía de ICP/transferencia — no por fibrinólisis. (Referencia interna: Grupo B.)",
  "Oclusão coronariana de alto risco — sala agora": "Oclusión coronaria de alto riesgo — sala ahora",
  "Oclusão de alto risco — confirmar com V7–V9, estratégia invasiva emergente.":
    "Oclusión de alto riesgo — confirmar con V7–V9, estrategia invasiva emergente.",
  "Oclusão de alto risco — estratégia invasiva emergente, repetir ECG.":
    "Oclusión de alto riesgo — estrategia invasiva emergente, repetir ECG.",
  "Oclusão de alto risco — estratégia invasiva emergente.":
    "Oclusión de alto riesgo — estrategia invasiva emergente.",
  "Sala urgente — FIBRINÓLISE FORA.": "Sala urgente — FIBRINÓLISIS QUEDA FUERA.",
  "Tronco/multiarterial provável — sala urgente, fibrinólise fora":
    "Tronco/multivaso probable — sala urgente, fibrinólisis queda fuera",
  "Via de reperfusão": "Vía de reperfusión",
  "Wellens — alto risco, sem reperfusão emergente": "Wellens — alto riesgo, sin reperfusión emergente",
  "⚠️ Contraindicação ABSOLUTA já revisada nesta sessão — se algo mudou desde então (novo sangramento, PA disparou, suspeita de dissecção), pare e reavalie antes de confirmar. Fibrinólise assim que possível, sempre seguida de estratégia fármaco-invasiva.":
    "⚠️ Contraindicación ABSOLUTA ya revisada en esta sesión — si algo cambió desde entonces (nuevo sangrado, PA se disparó, sospecha de disección), deténgase y reevalúe antes de confirmar. Fibrinólisis en cuanto sea posible, siempre seguida de estrategia fármaco-invasiva.",

  // ── Rodada 2026-08-24 — refinamento v3: estabilidade como passo do fluxo ──
  "ABCDE agora. A via de SCA continua assim que o paciente estiver estabilizado.":
    "ABCDE ahora. La vía de SCA continúa en cuanto el paciente esté estabilizado.",
  "Circulação: acesso venoso calibroso, monitor, tratar arritmia instável/choque conforme o quadro.":
    "Circulación: acceso venoso calibroso, monitor, tratar arritmia inestable/choque según el cuadro.",
  "Estabilidade": "Estabilidad",
  "Estabilidade — observação guiada": "Estabilidad — observación guiada",
  "Estabilizar antes de seguir": "Estabilizar antes de continuar",
  "Hipotensão, rebaixamento, choque ou IC aguda mudam a ordem: estabilizar antes de seguir a via de SCA.":
    "Hipotensión, deterioro del sensorio, choque o IC aguda cambian el orden: estabilizar antes de continuar la vía de SCA.",
  "Há sinais de instabilidade hemodinâmica agora?": "¿Hay signos de inestabilidad hemodinámica ahora?",
  "Reavaliar a cada poucos minutos — só prosseguir para a triagem de dissecção quando estabilizado.":
    "Reevaluar cada pocos minutos — solo continuar hacia el cribado de disección cuando esté estabilizado.",
  "Suspeita de SCA": "Sospecha de SCA",
  "Tempo é músculo — medidas iniciais e ECG em paralelo, sem atrasar o AAS por exames não indispensáveis.":
    "Tiempo es músculo — medidas iniciales y ECG en paralelo, sin retrasar el AAS por exámenes no indispensables.",
  "Via aérea e ventilação: O₂ para SpO₂ ≥ 90–94%; via aérea avançada se rebaixamento grave.":
    "Vía aérea y ventilación: O₂ para SpO₂ ≥ 90–94%; vía aérea avanzada si deterioro grave del sensorio.",

  // ── Refinamento v3 — triagem de dissecção compacta (2026-08-24) ──
  "⚠️ Se presente, o AAS espera — confira os três antes de liberar.":
    "⚠️ Si está presente, el AAS espera — confirme los tres antes de liberar.",

  // ── Correção pós-validação física (2026-08-24) — estabilidade guiada,
  // ECG sem "conclusão", tela única de padrões sem supra, O₂ alinhado ──
  "Alto risco, sem reperfusão emergente. Nunca teste ergométrico.":
    "Alto riesgo, sin reperfusión emergente. Nunca prueba ergométrica.",
  "Avaliar por achados observáveis": "Evaluar por hallazgos observables",
  "Avalie a estabilidade do paciente": "Evalúe la estabilidad del paciente",
  "Ação agora. A via de SCA continua assim que o paciente estiver estabilizado.":
    "Actuar ahora. La vía de SCA continúa en cuanto el paciente esté estabilizado.",
  "Compare com estes padrões que ocluem sem elevar o ST.":
    "Compare con estos patrones que ocluyen sin elevar el ST.",
  "Consciência e via aérea": "Consciencia y vía aérea",
  "Infra V1–V3 → confirmar com V7–V9.": "Infradesnivel V1–V3 → confirmar con V7–V9.",
  "Isquemia grave, EAP e pulso": "Isquemia grave, EAP y pulso",
  "Isto NÃO exclui SCA nem oclusão coronariana. Siga para os padrões que ocluem sem elevar antes de classificar como sem supra.":
    "Esto NO excluye SCA ni oclusión coronaria. Siga hacia los patrones que ocluyen sin elevar antes de clasificar como sin elevación.",
  "Já reconheço — estável": "Ya reconozco — estable",
  "Já reconheço — instável": "Ya reconozco — inestable",
  "Nenhum desses — sem padrão de supra evidente": "Ninguno de estos — sin patrón de elevación evidente",
  "Não tenho certeza — traçado duvidoso": "No estoy seguro — trazado dudoso",
  "O ABCDE completo (por que via aérea antes de circulação, por que reavaliar em ciclos curtos) é o raciocínio padrão de estabilização — aqui fica só a ação, não a aula.":
    "El ABCDE completo (por qué vía aérea antes de circulación, por qué reevaluar en ciclos cortos) es el razonamiento estándar de estabilización — aquí queda solo la acción, no la clase teórica.",
  "Padrão de alto risco — avaliação invasiva emergente, repetir ECG.":
    "Patrón de alto riesgo — evaluación invasiva emergente, repetir ECG.",
  "Padrão de alto risco — avaliação invasiva emergente.":
    "Patrón de alto riesgo — evaluación invasiva emergente.",
  "Posterior": "Posterior",
  "Preciso registrar V7–V9 ou V3R–V4R": "Necesito registrar V7–V9 o V3R–V4R",
  "ST ascendente + T altas/simétricas nas precordiais.":
    "ST ascendente + T altas/simétricas en precordiales.",
  "Sala urgente — fibrinólise não se aplica aqui.": "Sala urgente — la fibrinólisis no aplica aquí.",
  "Se SpO₂ < 90%, O₂ para elevar ≥ 90%; se SpO₂ ≥ 90%, não usar O₂ de rotina. Coletar troponina.":
    "Si SpO₂ < 90%, O₂ para elevar ≥ 90%; si SpO₂ ≥ 90%, no usar O₂ de rutina. Tomar troponina.",
  "Sem padrão de supra evidente": "Sin patrón de elevación evidente",
  "Sem padrão de supra evidente, já vi os padrões sem elevação":
    "Sin patrón de elevación evidente, ya vi los patrones sin elevación",
  "T bifásica/invertida em V2–V4, sem dor ativa.": "T bifásica/invertida en V2–V4, sin dolor activo.",
  "T hiperagudas": "T hiperagudas",
  "T larga, simétrica, desproporcional ao QRS.": "T ancha, simétrica, desproporcionada al QRS.",
  "T profunda e simétrica invertida em V2–V4, sem dor ativa.":
    "T profunda y simétricamente invertida en V2–V4, sin dolor activo.",
  "Ver os padrões que ocluem sem elevar.": "Ver los patrones que ocluyen sin elevar.",
  "Via aérea e ventilação: se SpO₂ < 90%, O₂ para elevar ≥ 90% (ACC/AHA 2025); se SpO₂ ≥ 90%, não usar O₂ de rotina. Via aérea avançada se rebaixamento grave.":
    "Vía aérea y ventilación: si SpO₂ < 90%, O₂ para elevar ≥ 90% (ACC/AHA 2025); si SpO₂ ≥ 90%, no usar O₂ de rutina. Vía aérea avanzada si deterioro grave del sensorio.",

  // ── lib/instabilidade-coronariana.ts ──
  "A via aérea está livre — fala frases inteiras, sem estridor?":
    "¿La vía aérea está libre — habla frases completas, sin estridor?",
  "Dor torácica isquêmica persistente apesar do tratamento inicial?":
    "¿Dolor torácico isquémico persistente a pesar del tratamiento inicial?",
  "Estertores/crepitações bilaterais, ortopneia importante ou espuma?":
    "¿Estertores/crepitantes bilaterales, ortopnea importante o espuma?",
  "Está confuso, muito sonolento ou quase perdeu a consciência agora?":
    "¿Está confuso, muy somnoliento o casi perdió la consciencia ahora?",
  "Não avaliei": "No evalué",
  "Pele fria, pálida ou sudoreica?": "¿Piel fría, pálida o sudorosa?",
  "Pulso filiforme ou ausente em alguma extremidade?":
    "¿Pulso filiforme o ausente en alguna extremidad?",
  "Ritmo irregular ao monitor ou à palpação?": "¿Ritmo irregular en el monitor o a la palpación?",
  "Usa musculatura acessória ou não completa frases por falta de ar?":
    "¿Usa musculatura accesoria o no completa frases por falta de aire?",

  "⚠️ Três destes padrões são sala de hemodinâmica AGORA — não classifique como sem supra antes de comparar.":
    "⚠️ Tres de estos patrones son sala de hemodinamia AHORA — no clasifique como sin elevación antes de comparar.",

  // ── Segunda correção pós-validação física (2026-08-24): duas telas (4+3), early exit refinado ──
  "Ameaça identificada: {ameacaEncontrada}. Ação agora — a via de SCA continua assim que o paciente estiver estabilizado.":
    "Amenaza identificada: {ameacaEncontrada}. Actúe ahora — la vía de SCA continúa en cuanto el paciente esté estabilizado.",
  "Avaliação invasiva urgente; não é indicação automática de fibrinólise.":
    "Evaluación invasiva urgente; no es indicación automática de fibrinólisis.",
  "Compare com estes.": "Compare con estos.",
  "Iniciar RCP imediatamente. A via de SCA aguarda até a parada ser revertida.":
    "Iniciar RCP inmediatamente. La vía de SCA espera hasta que la parada sea revertida.",
  "Iniciar compressões AGORA — pulso central ausente é parada cardiorrespiratória, não é achado de gravidade da SCA.":
    "Iniciar compresiones AHORA — pulso central ausente es parada cardiorrespiratoria, no es hallazgo de gravedad del SCA.",
  "Nenhum desses": "Ninguno de estos",
  "Não sei / preciso de ajuda": "No lo sé / necesito ayuda",
  "Outro padrão": "Otro patrón",
  "Outros padrões que ocluem sem elevar": "Otros patrones que ocluyen sin elevar",
  "Paciente sem pulso central — seguir o algoritmo de parada.":
    "Paciente sin pulso central — seguir el algoritmo de parada.",
  "Padrão de isquemia subendocárdica/global de alto risco.":
    "Patrón de isquemia subendocárdica/global de alto riesgo.",
  "Pulso central ausente — isto é PCR": "Pulso central ausente — esto es PCR",
  "Retomar a via de síndrome coronariana assim que a circulação espontânea retornar.":
    "Retomar la vía de síndrome coronario en cuanto retorne la circulación espontánea.",
  "Seguir o algoritmo de PCR (ritmo chocável × não chocável) no módulo dedicado.":
    "Seguir el algoritmo de PCR (ritmo desfibrilable × no desfibrilable) en el módulo dedicado.",
  "T bifásica em V2–V4, contexto compatível.": "T bifásica en V2–V4, contexto compatible.",
  "T profundamente invertida e simétrica em V2–V4, contexto compatível.":
    "T profundamente invertida y simétrica en V2–V4, contexto compatible.",
  "Wellens A": "Wellens A",
  "Wellens B": "Wellens B",
  "achados coletados nos blocos de avaliação": "hallazgos recolectados en los bloques de evaluación",
  "reconhecida diretamente pelo avaliador, sem achados guiados registrados":
    "reconocida directamente por el evaluador, sin hallazgos guiados registrados",
  "⚠️ Wellens NÃO é oclusão em curso — mas muda a conduta: nunca teste ergométrico, nunca reperfusão emergente.":
    "⚠️ Wellens NO es oclusión en curso — pero cambia la conducta: nunca prueba ergométrica, nunca reperfusión emergente.",

  "Dor isquêmica persistente apesar do tratamento inicial":
    "Dolor isquémico persistente a pesar del tratamiento inicial",
  "Edema pulmonar CLINICAMENTE RELEVANTE — estertores extensos/bilaterais + desconforto respiratório importante (não só crepitações isoladas)?":
    "¿Edema pulmonar CLÍNICAMENTE RELEVANTE — estertores extensos/bilaterales + malestar respiratorio importante (no solo crepitantes aislados)?",
  "Esforço respiratório importante (musculatura acessória / frases incompletas)":
    "Esfuerzo respiratorio importante (musculatura accesoria / frases incompletas)",
  "Muito fraco/filiforme, mas presente": "Muy débil/filiforme, pero presente",
  "Piora AGUDA e importante da consciência agora — diferente do padrão basal dele?":
    "¿Empeoramiento AGUDO e importante de la consciencia ahora — diferente del patrón basal del paciente?",
  "Piora aguda e importante da consciência": "Empeoramiento agudo e importante de la consciencia",
  "Pulso central (carotídeo/femoral)": "Pulso central (carotídeo/femoral)",
  "Pulso central ausente — isto é PCR, não gravidade de SCA":
    "Pulso central ausente — esto es PCR, no gravedad de SCA",
  "Pulso filiforme + sinais de hipoperfusão (pele fria/pálida/sudoreica)":
    "Pulso filiforme + signos de hipoperfusión (piel fría/pálida/sudorosa)",
  "Ritmo irregular + sinais de hipoperfusão (pele fria/pálida/sudoreica)":
    "Ritmo irregular + signos de hipoperfusión (piel fría/pálida/sudorosa)",
  "SpO₂ < 90% — correção/estabilização respiratória necessária":
    "SpO₂ < 90% — corrección/estabilización respiratoria necesaria",
  "Via aérea não livre (estridor)": "Vía aérea no libre (estridor)",

  // ── Terceira correção pós-validação física (2026-08-24): card = botão, pergunta/resumo enxutos ──
  "Compare com estes 4 padrões.": "Compare con estos 4 patrones.",
  "⚠️ 3 destes são sala de hemodinâmica AGORA.": "⚠️ 3 de estos son sala de hemodinamia AHORA.",
  "⚠️ 3 destes 4 padrões são sala de hemodinâmica AGORA — compare.":
    "⚠️ 3 de estos 4 patrones son sala de hemodinamia AHORA — compare.",

  // ── Quarta correção pós-validação física (2026-08-24): redação exata dos cards Posterior/T-hiperaguda ──
  "Suspeitar de oclusão posterior — obter V7–V9.": "Sospechar oclusión posterior — obtener V7–V9.",
  "Alto risco — reavaliar ECG / estratégia invasiva conforme contexto.":
    "Alto riesgo — reevaluar ECG / estrategia invasiva según el contexto.",

  // ── Quinta correção pós-validação física (2026-08-24): 3+3, sem "livro" ──
  "Acionar a hemodinâmica AGORA — o relógio conta a partir de agora.":
    "Activar la hemodinamia AHORA — el reloj cuenta desde ahora.",
  "Acionar hemodinâmica/cirurgia cardíaca com urgência.": "Activar hemodinamia/cirugía cardíaca con urgencia.",
  "Compare com estes 3 padrões.": "Compare con estos 3 patrones.",
  "Compare com estes 3.": "Compare con estos 3.",
  "Coronariografia NÃO emergencial durante a internação.": "Coronariografía NO emergencial durante la internación.",
  "Mesma urgência do STEMI — ICP/transferência, não fibrinólise.":
    "Misma urgencia del STEMI — ICP/transferencia, no fibrinólisis.",
  "Mesma urgência do STEMI — a dor ativa/instabilidade decidiu, não o BRE isolado.":
    "Misma urgencia del STEMI — el dolor activo/inestabilidad decidió, no el BRE aislado.",
  "Nunca teste ergométrico.": "Nunca prueba ergométrica.",
  "NÃO é oclusão em curso — sem reperfusão emergente, nunca teste ergométrico.":
    "NO es oclusión en curso — sin reperfusión emergente, nunca prueba ergométrica.",
  "Não é candidato a trombolítico.": "No es candidato a trombolítico.",
  "Reclassificar se surgir correlação clínica (dor ativa ou instabilidade).":
    "Reclasificar si surge correlación clínica (dolor activo o inestabilidad).",
  "Reperfusão indicada com a mesma urgência do STEMI.": "Reperfusión indicada con la misma urgencia del STEMI.",
  "Sala urgente — fibrinólise fora": "Sala urgente — fibrinólisis fuera",
  "Seguir via de troponina seriada/ECG seriado, como SCA sem supra.":
    "Seguir vía de troponina seriada/ECG seriado, como SCA sin elevación.",
  "Sem via de reperfusão emergente por este achado isolado.": "Sin vía de reperfusión emergente por este hallazgo aislado.",
  "⚠️ Ausência de supra NÃO exclui oclusão coronariana.": "⚠️ Ausencia de elevación NO excluye oclusión coronaria.",
  "⚠️ BRE novo isolado NÃO é equivalente automático de STEMI.":
    "⚠️ BRE nuevo aislado NO es equivalente automático de STEMI.",
  "⚠️ Mesma urgência do STEMI — sala AGORA.": "⚠️ Misma urgencia del STEMI — sala AHORA.",
  "⚠️ Nenhum dos três é indicação de fibrinólise automática.":
    "⚠️ Ninguno de los tres es indicación de fibrinólisis automática.",

  // ── Sexta correção pós-validação física (2026-08-24): pergunta simples Sim/Não/Não sei ──
  "Investigar V3R–V4R (VD) e V7–V9 (posterior) em paralelo.":
    "Investigar V3R–V4R (VD) y V7–V9 (posterior) en paralelo.",
  "Não sei — me ajude com exemplos": "No lo sé — ayúdenme con ejemplos",
  "Não é equivalente automático de STEMI.": "No es equivalente automático de STEMI.",
  "Não — não há supra evidente": "No — no hay elevación evidente",
  "O ECG mostra supra de ST ou BRE novo suspeito?": "¿El ECG muestra elevación de ST o BRE nuevo sospechoso?",
  "Qual o padrão?": "¿Cuál es el patrón?",
  "Sim — há supra / BRE novo suspeito": "Sí — hay elevación / BRE nuevo sospechoso",
  "Supra anterior/septal": "Elevación anterior/septal",
  "Supra inferior": "Elevación inferior",
  "Supra lateral": "Elevación lateral",
  "Toque no que mais se parece com o traçado.": "Toque en lo que más se parece al trazado.",
  "Vai para correlação clínica — nunca direto para reperfusão.":
    "Va a correlación clínica — nunca directo a reperfusión.",
  "⚠️ Ausência de supra não exclui oclusão. Se não houver supra evidente, o app mostra os padrões de alto risco sem supra.":
    "⚠️ Ausencia de elevación no excluye oclusión. Si no hay elevación evidente, la app muestra los patrones de alto riesgo sin elevación.",
  "Internar; notificar cardiologia intervencionista.": "Internar; notificar a cardiología intervencionista.",

  // ── Bloco 1: lista visual curta de "entry" (2026-08-24) ──
  "Monitor cardíaco contínuo": "Monitor cardíaco continuo",
  "PA (bilateral), FC, SpO₂": "PA (bilateral), FC, SpO₂",
  "2 acessos venosos; desfibrilador próximo": "2 accesos venosos; desfibrilador cerca",
  "ECG de 12 derivações em até 10 min da chegada (repetir se dor persistir/mudar)":
    "ECG de 12 derivaciones en hasta 10 min de la llegada (repetir si el dolor persiste/cambia)",
  "Se SpO₂ < 90%: O₂ para elevar ≥ 90%. Se SpO₂ ≥ 90%: sem O₂ de rotina":
    "Si SpO₂ < 90%: O₂ para elevar ≥ 90%. Si SpO₂ ≥ 90%: sin O₂ de rutina",
  "Coletar troponina": "Tomar troponina",
  "Anamnese dirigida e exame": "Anamnesis dirigida y examen",
  "Não atrase o ECG enquanto completa história e exame.":
    "No retrase el ECG mientras completa la historia y el examen.",

  // ── Quinta tela (5 telas de 2 cards, 2026-08-24) ──
  "Compare com estes 2 padrões.": "Compare con estos 2 patrones.",
  "Compare com estes 2.": "Compare con estos 2.",
  "Wellens — reperfusão espontânea": "Wellens — reperfusión espontánea",
  "⚠️ NÃO é indicação de fibrinólise automática.": "⚠️ NO es indicación de fibrinólisis automática.",
  "⚠️ aVR aqui é sala urgente, mas sem fibrinólise.": "⚠️ aVR aquí es sala urgente, pero sin fibrinólisis.",

  // ── Bloco 2: ramos de transição por ameaça (2026-08-24) ──
  "A via de síndrome coronariana aguda deste módulo não se aplica.":
    "La vía de síndrome coronario agudo de este módulo no aplica.",
  "Acionar equipe vascular/cirurgia cardíaca {disseccaoEquipe}.":
    "Activar equipo vascular/cirugía cardíaca {disseccaoEquipe}.",
  "Afastada": "Descartada",
  "Antes do AAS — investigando síndrome aórtica aguda": "Antes de la AAS — investigando síndrome aórtico agudo",
  "Antitrombótico: bloqueado enquanto a investigação não resolver.":
    "Antitrombótico: bloqueado mientras la investigación no se resuelva.",
  "Arritmia instável — frequência alta": "Arritmia inestable — frecuencia alta",
  "Arritmia instável — frequência baixa": "Arritmia inestable — frecuencia baja",
  "Confirmada": "Confirmada",
  "Definir o tipo de choque e tratar — a via de SCA aguarda.":
    "Definir el tipo de shock y tratar — la vía de SCA espera.",
  "Dor isquêmica atual e edema pulmonar cardiogênico ficam neste módulo porque são o próprio assunto da via de SCA — via aérea, respiratório, choque e arritmia têm módulo dedicado, mais completo do que um resumo aqui poderia oferecer.":
    "El dolor isquémico actual y el edema pulmonar cardiogénico quedan en este módulo porque son el propio asunto de la vía de SCA — vía aérea, respiratorio, shock y arritmia tienen módulo dedicado, más completo de lo que un resumen aquí podría ofrecer.",
  "Dor isquêmica atual: reavaliar/otimizar terapia anti-isquêmica (nitrato/morfina se sem contraindicação) e considerar antecipar a estratégia de reperfusão.":
    "Dolor isquémico actual: reevaluar/optimizar terapia antiisquémica (nitrato/morfina si sin contraindicación) y considerar anticipar la estrategia de reperfusión.",
  "Edema pulmonar: tratar conforme o protocolo do serviço (suporte ventilatório, diurético, vasodilatador se a PA permitir).":
    "Edema pulmonar: tratar según el protocolo del servicio (soporte ventilatorio, diurético, vasodilatador si la PA lo permite).",
  "Frequência e perfusão estabilizadas.": "Frecuencia y perfusión estabilizadas.",
  "Inconclusiva / suspeita ainda relevante": "Inconclusa / sospecha aún relevante",
  "Insuficiência respiratória grave": "Insuficiencia respiratoria grave",
  "Manejo específico: protocolo de síndrome aórtica aguda do serviço (cirurgia vascular/cardíaca, controle rigoroso de PA/FC).":
    "Manejo específico: protocolo de síndrome aórtico agudo del servicio (cirugía vascular/cardíaca, control riguroso de PA/FC).",
  "Manter monitorização contínua.": "Mantener monitorización continua.",
  "NÃO administrar AAS nem qualquer antitrombótico.": "NO administrar AAS ni ningún antitrombótico.",
  "Nível: {disseccaoNivel}. AAS/antitrombótico aguarda o resultado.":
    "Nivel: {disseccaoNivel}. AAS/antitrombótico espera el resultado.",
  "Oxigenação/ventilação sustentadas.": "Oxigenación/ventilación sostenidas.",
  "PAS < 90 mmHg, ou pulso filiforme/ritmo irregular associado a sinais objetivos de hipoperfusão.":
    "PAS < 90 mmHg, o pulso filiforme/ritmo irregular asociado a signos objetivos de hipoperfusión.",
  "Perfusão e pressão sustentadas, com a causa em investigação.":
    "Perfusión y presión sostenidas, con la causa en investigación.",
  "Proteger a via aérea agora — a via de SCA aguarda.": "Proteger la vía aérea ahora — la vía de SCA espera.",
  "Qual o resultado da investigação de síndrome aórtica aguda?":
    "¿Cuál es el resultado de la investigación de síndrome aórtico agudo?",
  "Resultado da investigação": "Resultado de la investigación",
  "Ritmo irregular + FC alta + sinais objetivos de hipoperfusão.":
    "Ritmo irregular + FC alta + signos objetivos de hipoperfusión.",
  "Ritmo irregular + FC baixa + sinais objetivos de hipoperfusão.":
    "Ritmo irregular + FC baja + signos objetivos de hipoperfusión.",
  "SpO₂ < 90% ou esforço respiratório importante (musculatura acessória / frases incompletas).":
    "SpO₂ < 90% o esfuerzo respiratorio importante (musculatura accesoria / frases incompletas).",
  "Suporte respiratório agora — a via de SCA aguarda.": "Soporte respiratorio ahora — la vía de SCA espera.",
  "Síndrome aórtica aguda confirmada": "Síndrome aórtico agudo confirmado",
  "Síndrome aórtica aguda não é a via — siga para AAS conforme indicado.":
    "Síndrome aórtico agudo no es la vía — siga para AAS según lo indicado.",
  "Tratar a arritmia — a via de SCA aguarda.": "Tratar la arritmia — la vía de SCA espera.",
  "Triagem de risco — síndrome aórtica aguda": "Triaje de riesgo — síndrome aórtico agudo",
  "Via aérea ameaçada": "Vía aérea amenazada",
  "Via aérea não livre, ou piora aguda e importante da consciência (risco de perda de proteção de via aérea).":
    "Vía aérea no libre, o empeoramiento agudo e importante de la consciencia (riesgo de pérdida de protección de vía aérea).",
  "Volte a este módulo depois — a via de SCA continua esperando.":
    "Vuelva a este módulo después — la vía de SCA sigue esperando.",
  "⚠️ Este app não tem módulo dedicado de síndrome aórtica aguda — siga o protocolo/guideline específico do serviço.":
    "⚠️ Esta app no tiene módulo dedicado de síndrome aórtico agudo — siga el protocolo/guideline específico del servicio.",

  // ── lib/dissecao-triagem.ts (triagem de risco, 3 blocos) ──
  "Algum destes achados de exame está presente?\n• Assimetria de pulso ou diferença importante de PA entre os membros\n• Déficit neurológico focal associado à dor\n• Sopro novo de insuficiência aórtica (quando reconhecível)\n• Hipotensão ou sinais de choque":
    "¿Alguno de estos hallazgos de examen está presente?\n• Asimetría de pulso o diferencia importante de PA entre los miembros\n• Déficit neurológico focal asociado al dolor\n• Soplo nuevo de insuficiencia aórtica (cuando reconocible)\n• Hipotensión o signos de shock",
  "Algum destes achados está presente?": "¿Alguno de estos hallazgos está presente?",
  "Alguma dessas características está presente?": "¿Alguna de estas características está presente?",
  "Alguma dessas condições é conhecida?": "¿Alguna de estas condiciones es conocida?",
  "Angio-TC de aorta com urgência — opção inicial usual, quando o paciente consegue realizá-la. Se instável ou não pode ir à TC: alternativa conforme disponibilidade institucional (ex.: ecocardiograma transesofágico à beira-leito).":
    "Angio-TC de aorta con urgencia — opción inicial habitual, cuando el paciente puede realizarla. Si inestable o no puede ir a la TC: alternativa según disponibilidad institucional (ej.: ecocardiograma transesofágico a la cabecera).",
  "Antes do AAS — a dor tem alguma característica de alto risco?\n• Início súbito, já máximo desde o começo (não crescente)\n• Caráter em rasgão/dilacerante\n• Dor intensa/severa\n• Irradiação para o dorso/região interescapular":
    "Antes de la AAS — ¿el dolor tiene alguna característica de alto riesgo?\n• Inicio súbito, ya máximo desde el comienzo (no creciente)\n• Carácter desgarrante\n• Dolor intenso/severo\n• Irradiación hacia la espalda/región interescapular",
  "Avaliação adicional conforme contexto/protocolo institucional — este app não fixa uma via específica (ex.: D-dímero, angio-TC) sem fonte/protocolo confirmado nesta sessão.":
    "Evaluación adicional según contexto/protocolo institucional — esta app no fija una vía específica (ej.: dímero D, angio-TC) sin fuente/protocolo confirmado en esta sesión.",
  "Há alguma condição predisponente conhecida?\n• Doença do tecido conjuntivo (ex.: Marfan) ou história familiar de doença aórtica\n• Aneurisma de aorta torácica conhecido\n• Doença valvar/aórtica conhecida relevante (ex.: valva aórtica bicúspide)\n• Cirurgia cardíaca ou manipulação aórtica prévia":
    "¿Hay alguna condición predisponente conocida?\n• Enfermedad del tejido conjuntivo (ej.: Marfan) o historia familiar de enfermedad aórtica\n• Aneurisma de aorta torácica conocido\n• Enfermedad valvular/aórtica conocida relevante (ej.: válvula aórtica bicúspide)\n• Cirugía cardíaca o manipulación aórtica previa",
  "Na dúvida, investigar antes de liberar — avaliação adicional conforme contexto/protocolo institucional.":
    "En la duda, investigar antes de liberar — evaluación adicional según contexto/protocolo institucional.",
  "conforme os achados": "según los hallazgos",
  "suspeita intermediária": "sospecha intermedia",

  // ── lib/instabilidade-coronariana.ts (dor isquêmica atual, arritmia) ──
  "Dor torácica isquêmica intensa ou persistente": "Dolor torácico isquémico intenso o persistente",
  "Dor torácica isquêmica intensa ou persistente agora?": "¿Dolor torácico isquémico intenso o persistente ahora?",
  "Ritmo irregular + FC alta + sinais de hipoperfusão": "Ritmo irregular + FC alta + signos de hipoperfusión",
  "Ritmo irregular + FC baixa + sinais de hipoperfusão": "Ritmo irregular + FC baja + signos de hipoperfusión",
  "Edema pulmonar com repercussão clínica real — desconforto respiratório importante, hipoxemia, repercussão hemodinâmica ou necessidade de suporte ventilatório (não só crepitações isoladas)?":
    "¿Edema pulmonar con repercusión clínica real — disconfort respiratorio importante, hipoxemia, repercusión hemodinámica o necesidad de soporte ventilatorio (no solo crepitantes aislados)?",

  // ── coronary-decision-tree.ts — Bloco 2, correção 2026-08-24 (isquemia em curso) ──
  "Isquemia em curso — acelerar a via coronariana": "Isquemia en curso — acelerar la vía coronaria",
  "Ameaça identificada: {ameacaEncontrada}. Não é instabilidade — é isquemia ativa, e a prioridade é chegar ao ECG/classificação.":
    "Amenaza identificada: {ameacaEncontrada}. No es inestabilidad — es isquemia activa, y la prioridad es llegar al ECG/clasificación.",
  "Manter monitorização.": "Mantener monitorización.",
  "Seguir imediatamente para ECG/classificação.": "Seguir inmediatamente hacia ECG/clasificación.",
  "Iniciar tratamento anti-isquêmico apropriado (nitrato/morfina) quando indicado e sem contraindicação.":
    "Iniciar tratamiento antiisquémico apropiado (nitrato/morfina) cuando esté indicado y sin contraindicación.",
  "Acelerar a estratégia de reperfusão/invasiva assim que o padrão de ECG for reconhecido.":
    "Acelerar la estrategia de reperfusión/invasiva en cuanto se reconozca el patrón de ECG.",
  "Edema pulmonar: iniciar tratamento conforme o protocolo do serviço (suporte ventilatório, diurético, vasodilatador se a PA permitir).":
    "Edema pulmonar: iniciar tratamiento según el protocolo del servicio (soporte ventilatorio, diurético, vasodilatador si la PA lo permite).",
  "Edema pulmonar cardiogênico com repercussão real fica neste módulo porque é o próprio assunto da via de SCA — via aérea, respiratório, choque e arritmia têm módulo dedicado, mais completo do que um resumo aqui poderia oferecer.":
    "El edema pulmonar cardiogénico con repercusión real permanece en este módulo porque es el propio asunto de la vía de SCA — vía aérea, respiratorio, shock y arritmia tienen módulo dedicado, más completo de lo que un resumen aquí podría ofrecer.",

  // ── coronary-decision-tree.ts — Bloco 3, correção 2026-08-24 (resultado baseado em fatos) ──
  "Aguardando o resultado": "Esperando el resultado",
  "Ainda não": "Todavía no",
  "Afasta explicitamente síndrome aórtica aguda": "Descarta explícitamente síndrome aórtico agudo",
  "Confirma síndrome aórtica aguda (flap intimal, hematoma intramural, úlcera penetrante ou extensão)":
    "Confirma síndrome aórtico agudo (flap intimal, hematoma intramural, úlcera penetrante o extensión)",
  "Exame não disponível agora": "Examen no disponible ahora",
  "Inconclusivo / não fecha diagnóstico": "Inconcluso / no cierra diagnóstico",
  "Não sei localizar essa informação no laudo": "No sé localizar esa información en el informe",
  "Não será possível fazer o exame agora": "No será posible hacer el examen ahora",
  "Responda pelos achados objetivos do laudo — o app deriva o resultado.":
    "Responda por los hallazgos objetivos del informe — la app deriva el resultado.",
  "Sim, tenho o laudo": "Sí, tengo el informe",
  "Tenho o laudo, mas não sei interpretar": "Tengo el informe, pero no sé interpretarlo",
  "Vamos por partes": "Vamos por partes",
  "Mais um achado objetivo do laudo.": "Un hallazgo objetivo más del informe.",

  // ── coronary-decision-tree.ts — Bloco 4, correção 2026-08-24 (aVR: retirar "sala urgente" absoluto) ──
  "Padrão de alto risco — exige avaliação invasiva urgente conforme contexto clínico.":
    "Patrón de alto riesgo — exige evaluación invasiva urgente según el contexto clínico.",
  "aVR + infra difuso": "aVR + infradesnivel difuso",
  "Supra em aVR com depressão difusa do ST.": "Elevación en aVR con depresión difusa del ST.",

  // ── coronary-decision-tree.ts + lib/dissecao-triagem.ts — Portão de entrada da dissecção (correção final 2026-08-25) ──
  "Antes de investigar dissecção": "Antes de investigar disección",
  "Com critério mais objetivo, os achados em dúvida somam 2 domínios independentes?":
    "Con criterio más objetivo, ¿los hallazgos en duda suman 2 dominios independientes?",
  "Com um critério mais objetivo, algum desses achados se confirma?":
    "Con un criterio más objetivo, ¿alguno de estos hallazgos se confirma?",
  "Continua incerto": "Sigue incierto",
  "Esclarecendo o achado": "Aclarando el hallazgo",
  "Esclarecendo os achados": "Aclarando los hallazgos",
  "Há algum destes achados de exame muito específicos, associados ao quadro agudo?\n\nPortão de segurança/navegação do módulo de SCA; não substitui ADD-RS nem avaliação clínica formal de síndrome aórtica aguda.":
    "¿Hay alguno de estos hallazgos de examen muy específicos, asociados al cuadro agudo?\n\nPortón de seguridad/navegación del módulo de SCA; no sustituye al ADD-RS ni a la evaluación clínica formal de síndrome aórtico agudo.",
  "Mais 3 domínios — só a combinação abre": "Otros 3 dominios — solo la combinación abre",
  "Nenhum destes, sozinho, abre a investigação — só a combinação de 2 ou mais domínios independentes.":
    "Ninguno de estos, solo, abre la investigación — solo la combinación de 2 o más dominios independientes.",
  "Sim, confirma": "Sí, confirma",
  "Sim, somam 2 ou mais": "Sí, suman 2 o más",
  "Choque/hipotensão sem explicação coronariana convincente?": "¿Shock/hipotensión sin explicación coronaria convincente?",
  "Critérios mais objetivos: diferença de PA sistólica > 20 mmHg entre os braços é referência útil (não é corte absoluto exclusivo). Déficit neurológico focal = novo déficit motor, sensitivo, de fala ou visual associado ao início da dor. Sopro de insuficiência aórtica = sopro diastólico novo, ausente antes deste episódio.":
    "Criterios más objetivos: diferencia de PA sistólica > 20 mmHg entre los brazos es una referencia útil (no es un corte absoluto exclusivo). Déficit neurológico focal = nuevo déficit motor, sensitivo, del habla o visual asociado al inicio del dolor. Soplo de insuficiencia aórtica = soplo diastólico nuevo, ausente antes de este episodio.",
  "Critérios mais objetivos: dor abrupta/máxima = intensidade máxima já nos primeiros segundos, não crescente. Choque sem explicação coronariana = hipotensão desproporcional ao que o quadro coronariano isolado explicaria. Predisposição aórtica = qualquer um dos itens listados (Marfan, aneurisma conhecido, valvopatia relevante, cirurgia prévia, história familiar) já conta.":
    "Criterios más objetivos: dolor abrupto/máximo = intensidad máxima ya en los primeros segundos, no creciente. Shock sin explicación coronaria = hipotensión desproporcionada a lo que el cuadro coronario aislado explicaría. Predisposición aórtica = cualquiera de los ítems listados (Marfan, aneurisma conocido, valvulopatía relevante, cirugía previa, historia familiar) ya cuenta.",
  "Dor abrupta e máxima desde o início, padrão rasgando/dilacerante?":
    "¿Dolor abrupto y máximo desde el inicio, patrón desgarrante?",
  "Déficit de pulso ou assimetria clinicamente significativa de PA entre membros?":
    "¿Déficit de pulso o asimetría clínicamente significativa de PA entre miembros?",
  "Déficit neurológico focal associado à dor aguda?": "¿Déficit neurológico focal asociado al dolor agudo?",
  "Novo sopro de insuficiência aórtica associado ao quadro agudo?":
    "¿Nuevo soplo de insuficiencia aórtica asociado al cuadro agudo?",
  "Portão de segurança/navegação do módulo de SCA; não substitui ADD-RS nem avaliação clínica formal de síndrome aórtica aguda.":
    "Portón de seguridad/navegación del módulo de SCA; no sustituye al ADD-RS ni a la evaluación clínica formal de síndrome aórtico agudo.",
  "Predisposição aórtica importante — doença do tecido conjuntivo (ex.: Marfan), aneurisma de aorta torácica conhecido, doença valvar/aórtica relevante conhecida, cirurgia/manipulação aórtica prévia ou história familiar de doença aórtica?":
    "¿Predisposición aórtica importante — enfermedad del tejido conjuntivo (ej.: Marfan), aneurisma de aorta torácica conocido, enfermedad valvular/aórtica relevante conocida, cirugía/manipulación aórtica previa o historia familiar de enfermedad aórtica?",

  // ── coronary-decision-tree.ts + libs — correção final 2026-08-25 (auditoria SCA ponta a ponta) ──
  "  • COM inibidor de GP IIb/IIIa: {hnfIcpComGpMin}–{hnfIcpComGpMax} U (50–70 U/kg), alvo de TCA 200–250 s.":
    "  • CON inhibidor de GP IIb/IIIa: {hnfIcpComGpMin}–{hnfIcpComGpMax} U (50–70 U/kg), objetivo de TCA 200–250 s.",
  "  • SEM inibidor de GP IIb/IIIa: {hnfIcpSemGpMin}–{hnfIcpSemGpMax} U (70–100 U/kg), alvo de TCA 250–300 s (Hemotec) ou 300–350 s (Hemochron).":
    "  • SIN inhibidor de GP IIb/IIIa: {hnfIcpSemGpMin}–{hnfIcpSemGpMax} U (70–100 U/kg), objetivo de TCA 250–300 s (Hemotec) o 300–350 s (Hemochron).",
  "Anti-isquêmico, se dor/HAS/IC e sem contraindicação:": "Antiisquémico, si dolor/HTA/IC y sin contraindicación:",
  "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg; ClCr < 30: 24/24h) OU fondaparinux 2,5 mg SC/dia OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).":
    "Anticoagulación: enoxaparina {enoxa} mg SC cada 12h (≥ 75a: {enoxa75} mg; ClCr < 30: cada 24h) O fondaparinux 2,5 mg SC/día O HNF bolo {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
  "BRE novo — correlação clínica": "BRI nuevo — correlación clínica",
  "Correlação com o que já foi avaliado neste caso — nenhuma pergunta nova.":
    "Correlación con lo que ya fue evaluado en este caso — ninguna pregunta nueva.",
  "Diurético IV conforme o protocolo do serviço — este app não fixa dose de furosemida nesta tela; ver módulo de Edema Agudo de Pulmão para o protocolo completo de diurético e resistência.":
    "Diurético IV según el protocolo del servicio — esta app no fija dosis de furosemida en esta pantalla; ver el módulo de Edema Agudo de Pulmón para el protocolo completo de diurético y resistencia.",
  "Edema pulmonar cardiogênico com repercussão real fica neste módulo porque é o próprio assunto da via de SCA — via aérea, respiratório, choque e arritmia têm módulo dedicado, mais completo do que um resumo aqui poderia oferecer. O protocolo COMPLETO de diurético (incluindo resistência) mora no módulo de Edema Agudo de Pulmão, que já cobre isso com mais profundidade do que caberia repetir aqui.":
    "El edema pulmonar cardiogénico con repercusión real permanece en este módulo porque es el propio asunto de la vía de SCA — vía aérea, respiratorio, shock y arritmia tienen módulo dedicado, más completo de lo que un resumen aquí podría ofrecer. El protocolo COMPLETO de diurético (incluida la resistencia) vive en el módulo de Edema Agudo de Pulmón, que ya cubre esto con más profundidad de la que cabría repetir aquí.",
  "IC aguda com isquemia — agora, neste momento (reavaliação)": "IC aguda con isquemia — ahora, en este momento (reevaluación)",
  "Instabilidade hemodinâmica/choque — agora, neste momento (reavaliação)":
    "Inestabilidad hemodinámica/shock — ahora, en este momento (reevaluación)",
  "Já sabemos, deste caso: há dor isquêmica ativa e/ou instabilidade — segue para reperfusão.":
    "Ya sabemos, de este caso: hay dolor isquémico activo y/o inestabilidad — sigue hacia reperfusión.",
  "Já sabemos, deste caso: sem dor isquêmica ativa nem instabilidade — BRE fica isolado.":
    "Ya sabemos, de este caso: sin dolor isquémico activo ni inestabilidad — el BRI queda aislado.",
  "Morfina só se dor refratária apesar de anti-isquêmico otimizado:":
    "Morfina solo si dolor refractario a pesar de antiisquémico optimizado:",
  "Nitrato e morfina só se necessário — dose abaixo, contraindicações valem para os dois:":
    "Nitrato y morfina solo si es necesario — dosis abajo, las contraindicaciones valen para ambos:",
  "Não sei / território incerto — mas há supra": "No sé / territorio incierto — pero hay elevación",
  "Qualquer um destes deriva invasiva IMEDIATA (< 2h) automaticamente. Reavaliação AGORA, não repetição — o quadro pode ter mudado desde a avaliação inicial.":
    "Cualquiera de estos deriva invasiva INMEDIATA (< 2h) automáticamente. Reevaluación AHORA, no repetición — el cuadro puede haber cambiado desde la evaluación inicial.",
  "Reavaliar a cada poucos minutos — só prosseguir para o portão de dissecção quando estabilizado.":
    "Reevaluar cada pocos minutos — solo continuar hacia el portón de disección cuando esté estabilizado.",
  "Suporte ventilatório conforme necessidade (O₂, VNI se disponível e tolerado).":
    "Soporte ventilatorio según necesidad (O₂, VNI si está disponible y se tolera).",
  "⚠️ BRE novo isolado NÃO é equivalente automático de STEMI. {lbbbCorrelacaoContexto}":
    "⚠️ El BRI nuevo aislado NO es equivalente automático de STEMI. {lbbbCorrelacaoContexto}",
  "FC alta + sinais de hipoperfusão": "FC alta + signos de hipoperfusión",
  "FC baixa + sinais de hipoperfusão": "FC baja + signos de hipoperfusión",
  "NITROGLICERINA IV (se dor persistir ou HAS): iniciar 10–20 mcg/min → titular 5–10 mcg/min a cada 5 min até alívio ou PAS 90–100 (máx 200 mcg/min).":
    "NITROGLICERINA IV (si persiste el dolor o HTA): iniciar 10–20 mcg/min → titular 5–10 mcg/min cada 5 min hasta el alivio o una PAS de 90–100 (máx. 200 mcg/min).",
  "NITROGLICERINA SUBLINGUAL: 0,4 mg SL, repetível a cada 5 min até 3 doses, se PAS > 110 (a mesma ressalva de pré-carga/VD vale aqui).":
    "NITROGLICERINA SUBLINGUAL: 0,4 mg SL, repetible cada 5 min hasta 3 dosis, si PAS > 110 (la misma salvedad de precarga/VD aplica aquí).",
  "Betabloqueador VO — metoprolol tartarato 25–50 mg a cada 6–12h — nas primeiras 24h, se SEM IC aguda, baixo débito, BAV ou broncoespasmo. Iniciar por via oral, não IV de rotina.":
    "Betabloqueante VO — metoprolol tartrato 25–50 mg cada 6–12h — en las primeras 24h, si SIN IC aguda, bajo gasto, BAV o broncoespasmo. Iniciar por vía oral, no IV de rutina.",

  // ── correção final 2026-08-25 (referências, nitrato/betabloqueador reestruturados, títulos fase·subfase, linguagem ECG) ──
  "Avaliação inicial · Circulação": "Evaluación inicial · Circulación",
  "Avaliação inicial · Consciência e via aérea": "Evaluación inicial · Consciencia y vía aérea",
  "Avaliação inicial · Estabilidade": "Evaluación inicial · Estabilidad",
  "Avaliação inicial · Isquemia, EAP e pulso": "Evaluación inicial · Isquemia, EAP y pulso",
  "Avaliação inicial · Respiração": "Evaluación inicial · Respiración",
  "Avaliação inicial · Ritmo": "Evaluación inicial · Ritmo",
  "Contraindicações do nitrato e da morfina — quando NÃO usar:": "Contraindicaciones del nitrato y de la morfina — cuándo NO usar:",
  "Contraindicações do nitrato — quando NÃO usar:": "Contraindicaciones del nitrato — cuándo NO usar:",
  "Destino · Estratégia invasiva/UTI": "Destino · Estrategia invasiva/UCI",
  "Destino · Observação/alta": "Destino · Observación/alta",
  "ECG · Outros padrões sem supra": "ECG · Otros patrones sin elevación",
  "ECG · Padrões sem supra": "ECG · Patrones sin elevación",
  "ECG · Reconhecimento de oclusão": "ECG · Reconocimiento de oclusión",
  "Mesma urgência da reperfusão emergente — a dor ativa/instabilidade decidiu, não o BRE isolado.":
    "Misma urgencia de la reperfusión emergente — el dolor activo/la inestabilidad decidieron, no el BRI aislado.",
  "Nitrato, se dor/HAS/IC e sem contraindicação:": "Nitrato, si dolor/HTA/IC y sin contraindicación:",
  "Padrão sugestivo de oclusão coronariana aguda — ICP/transferência, não fibrinólise.":
    "Patrón sugestivo de oclusión coronaria aguda — angioplastia/traslado, no fibrinólisis.",
  "Reavaliação · Critérios de muito alto risco": "Reevaluación · Criterios de muy alto riesgo",
  "Reavaliação · Resposta ao tratamento": "Reevaluación · Respuesta al tratamiento",
  "Tratamento · Antitrombóticos (STEMI)": "Tratamiento · Antitrombóticos (IAMCEST)",
  "Tratamento · Antitrombóticos (sem supra)": "Tratamiento · Antitrombóticos (sin elevación)",
  "Triagem · Ameaça aórtica": "Triaje · Amenaza aórtica",
  "Triagem · Ameaça aórtica (combinação)": "Triaje · Amenaza aórtica (combinación)",
  "⚠️ Avalie estes padrões ANTES de classificar como \"sem supra\" — três dos cinco são estratégia invasiva emergente.":
    "⚠️ Evalúe estos patrones ANTES de clasificar como \"sin elevación\" — tres de los cinco son estrategia invasiva emergente.",

  "Peso — dose do fibrinolítico": "Peso — dosis del fibrinolítico",
  "Toque no peso (ou adicione). A dose de tenecteplase é escalonada por peso.":
    "Toque el peso (o agréguelo). La dosis de tenecteplasa es escalonada por peso.",

  "ABSOLUTAS — alguma presente? Hemorragia intracraniana prévia; AVC isquêmico < 3 meses (exceto agudo < 4,5 h); lesão vascular cerebral estrutural ou neoplasia intracraniana maligna; TCE/trauma facial fechado significativo < 3 meses; sangramento ativo ou diátese hemorrágica; suspeita de dissecção de aorta; cirurgia intracraniana/intraespinhal < 2 meses; HAS grave não controlada.":
    "ABSOLUTAS — ¿alguna presente? Hemorragia intracraneal previa; ACV isquémico < 3 meses (excepto agudo < 4,5 h); lesión vascular cerebral estructural o neoplasia intracraneal maligna; TCE/trauma facial cerrado significativo < 3 meses; sangrado activo o diátesis hemorrágica; sospecha de disección de aorta; cirugía intracraneal/intraespinal < 2 meses; HTA grave no controlada.",
  "RELATIVAS — alguma presente? HAS significativa na apresentação (> 180/110); AVC isquêmico > 3 meses; demência; RCP traumática/prolongada; cirurgia de grande porte < 3 semanas; sangramento interno recente; punção vascular não compressível; gestação; úlcera péptica ativa; anticoagulação oral em uso.":
    "RELATIVAS — ¿alguna presente? HTA significativa en la presentación (> 180/110); ACV isquémico > 3 meses; demencia; RCP traumática/prolongada; cirugía mayor < 3 semanas; sangrado interno reciente; punción vascular no compresible; embarazo; úlcera péptica activa; anticoagulación oral en uso.",
  "Meta: 90 min no serviço com hemodinâmica · 120 min quando precisa transferir (primeiro contato médico até o dispositivo). {metaIcp}":
    "Meta: 90 min en el servicio con hemodinámica · 120 min cuando requiere traslado (primer contacto médico hasta el dispositivo). {metaIcp}",
  "≥ 12 h: nesta janela a ICP é razoável e a fibrinólise sai da rota automática — o benefício dela após 12 h não está estabelecido.":
    "≥ 12 h: en esta ventana la ICP es razonable y la fibrinólisis sale de la ruta automática — su beneficio después de 12 h no está establecido.",
  "Relativa não proíbe — muda a conta: se a ICP for viável dentro da meta (90/120 min), prefira a ICP. E quem faz a conta é você, não o app.":
    "La relativa no prohíbe — cambia la cuenta: si la ICP es viable dentro de la meta (90/120 min), prefiera la ICP. Y quien hace la cuenta es usted, no la app.",
  // ── ramo de reperfusão do STEMI (2026-08-25): janela, cenário logístico, contraindicação com estado explícito, farmacoinvasiva ──
  "12–24 h — a via é a transferência para ICP":
    "12–24 h — la vía es el traslado para ICP",
  "> 24 h — há isquemia ou instabilidade AGORA?":
    "> 24 h — ¿hay isquemia o inestabilidad AHORA?",
  "> 24 h, estável — sem reperfusão de rotina":
    "> 24 h, estable — sin reperfusión de rutina",
  "A ICP primária pode ser realizada dentro da meta de tempo?":
    "¿La ICP primaria puede realizarse dentro de la meta de tiempo?",
  "A meta de tempo muda com o cenário — e é ela que decide a estratégia.":
    "La meta de tiempo cambia con el escenario — y es ella la que decide la estrategia.",
  "A transferência para centro com ICP é imediata, não depende do resultado da lise.":
    "El traslado a centro con ICP es inmediato, no depende del resultado de la lisis.",
  "ACC/AHA 2025: > 24 h, com isquemia em curso ou arritmia ameaçadora à vida, a ICP é razoável.":
    "ACC/AHA 2025: > 24 h, con isquemia en curso o arritmia con amenaza vital, la ICP es razonable.",
  "ACC/AHA 2025: em paciente estável, assintomático, com artéria relacionada ao infarto totalmente ocluída há mais de 24 h e sem isquemia em curso, IC aguda grave ou arritmia ameaçadora à vida, a ICP de rotina não oferece benefício.":
    "ACC/AHA 2025: en paciente estable, asintomático, con arteria relacionada al infarto totalmente ocluida hace más de 24 h y sin isquemia en curso, IC aguda grave o arritmia con amenaza vital, la ICP de rutina no ofrece beneficio.",
  "ACC/AHA 2025: entre 12 e 24 h, a ICP primária é razoável para melhorar desfechos. O benefício da fibrinólise após 12 h não está estabelecido de forma geral.":
    "ACC/AHA 2025: entre 12 y 24 h, la ICP primaria es razonable para mejorar desenlaces. El beneficio de la fibrinólisis después de 12 h no está establecido de forma general.",
  "Acionar avaliação sênior/cardiologia para decidir a estratégia.":
    "Activar evaluación sénior/cardiología para decidir la estrategia.",
  "Acionar transferência para centro com hemodinâmica IMEDIATAMENTE.":
    "Activar el traslado a centro con hemodinámica INMEDIATAMENTE.",
  "Antitrombóticos adjuvantes e monitorização seguem durante o transporte.":
    "Antitrombóticos adyuvantes y monitorización continúan durante el traslado.",
  "Arritmia ameaçadora à vida = TV sustentada, FV revertida, ou bloqueio de alto grau com repercussão.":
    "Arritmia con amenaza vital = TV sostenida, FV revertida, o bloqueo de alto grado con repercusión.",
  "Avaliação cardiológica para estratégia individualizada.":
    "Evaluación cardiológica para estrategia individualizada.",
  "Choque/instabilidade hemodinâmica indica revascularização emergencial INDEPENDENTEMENTE do tempo desde o início.":
    "El shock/la inestabilidad hemodinámica indica revascularización emergente INDEPENDIENTEMENTE del tiempo desde el inicio.",
  "Com estes critérios objetivos, algum está presente?":
    "Con estos criterios objetivos, ¿alguno está presente?",
  "Contraindicação RELATIVA — decisão médica":
    "Contraindicación RELATIVA — decisión médica",
  "Contraindicações — confirmado":
    "Contraindicaciones — confirmado",
  "Contraindicações — item a item":
    "Contraindicaciones — ítem por ítem",
  "Depois de 24 h, é o quadro atual — não o relógio — que decide se há indicação invasiva.":
    "Después de 24 h, es el cuadro actual — no el reloj — el que decide si hay indicación invasiva.",
  "Diante do risco × benefício, qual a decisão?":
    "Ante el riesgo × beneficio, ¿cuál es la decisión?",
  "Dor intermitente que cessou e recomeçou: o que conta é o início do episódio ATUAL, contínuo, que motivou a vinda.":
    "Dolor intermitente que cesó y recomenzó: lo que cuenta es el inicio del episodio ACTUAL, continuo, que motivó la consulta.",
  "Dá para estabelecer um início contínuo e confiável para ESTE episódio?":
    "¿Se puede establecer un inicio continuo y confiable para ESTE episodio?",
  "Elegível para fibrinólise: seguir para o peso e a dose.":
    "Elegible para fibrinólisis: seguir hacia el peso y la dosis.",
  "Esclarecendo o quadro atual":
    "Aclarando el cuadro actual",
  "Fibrinolisar — benefício supera o risco":
    "Fibrinolisar — el beneficio supera el riesgo",
  "Fibrinólise feita — TRANSFERIR AGORA":
    "Fibrinólisis hecha — TRASLADAR AHORA",
  "Hospital SEM hemodinâmica — precisa transferir":
    "Hospital SIN hemodinámica — requiere traslado",
  "Há RELATIVA, sem absoluta":
    "Hay RELATIVA, sin absoluta",
  "IC aguda grave = congestão pulmonar com desconforto/hipoxemia ou necessidade de suporte ventilatório.":
    "IC aguda grave = congestión pulmonar con disconfort/hipoxemia o necesidad de soporte ventilatorio.",
  "Instabilidade hemodinâmica = hipotensão, sinais de hipoperfusão ou necessidade de vasopressor.":
    "Inestabilidad hemodinámica = hipotensión, signos de hipoperfusión o necesidad de vasopresor.",
  "Início do episódio atual":
    "Inicio del episodio actual",
  "Início indeterminado — fibrinólise não liberada":
    "Inicio indeterminado — fibrinólisis no habilitada",
  "Isquemia persistente/recorrente = dor isquêmica agora, ou supra que não regrediu, ou alterações dinâmicas novas.":
    "Isquemia persistente/recurrente = dolor isquémico ahora, o elevación que no regresó, o alteraciones dinámicas nuevas.",
  "Isquemia persistente/recorrente, instabilidade hemodinâmica, IC aguda grave ou arritmia ameaçadora à vida?":
    "¿Isquemia persistente/recurrente, inestabilidad hemodinámica, IC aguda grave o arritmia con amenaza vital?",
  "Janela desde o início dos sintomas: {janelaReperfusao}. É ela que decide a via agora.":
    "Ventana desde el inicio de los síntomas: {janelaReperfusao}. Es ella la que decide la vía ahora.",
  "Manter monitorização, antitrombóticos e ECG seriado até a angiografia.":
    "Mantener monitorización, antitrombóticos y ECG seriado hasta la angiografía.",
  "Manter monitorização, antitrombóticos e prevenção secundária.":
    "Mantener monitorización, antitrombóticos y prevención secundaria.",
  "Manter monitorização, antitrombóticos e tratamento anti-isquêmico durante o transporte.":
    "Mantener monitorización, antitrombóticos y tratamiento antiisquémico durante el traslado.",
  "Nenhuma contraindicação absoluta nem relativa identificada.":
    "Ninguna contraindicación absoluta ni relativa identificada.",
  "Nesta janela a ICP é razoável; a fibrinólise sai da rota automática.":
    "En esta ventana la ICP es razonable; la fibrinólisis sale de la ruta automática.",
  "Não fibrinolisar — transferir para ICP":
    "No fibrinolisar — trasladar para ICP",
  "Não indicar ICP de rotina apenas pelo tempo decorrido.":
    "No indicar ICP de rutina solo por el tiempo transcurrido.",
  "Não sei dizer — me ajude item a item":
    "No sé decir — ayúdenme ítem por ítem",
  "Não — estável e assintomático":
    "No — estable y asintomático",
  "Não — fora da meta":
    "No — fuera de la meta",
  "Não — permanece indeterminado":
    "No — permanece indeterminado",
  "Não, nenhum deles":
    "No, ninguno de ellos",
  "Onde o paciente está agora?":
    "¿Dónde está el paciente ahora?",
  "Paciente estável, assintomático, com artéria totalmente ocluída > 24 h e sem isquemia em curso, IC aguda grave ou arritmia ameaçadora: a ICP de rotina NÃO oferece benefício.":
    "Paciente estable, asintomático, con arteria totalmente ocluida > 24 h y sin isquemia en curso, IC aguda grave o arritmia amenazante: la ICP de rutina NO ofrece beneficio.",
  "Programar angiografia entre 2 e 24 h após a fibrinólise, com intenção de ICP quando indicada.":
    "Programar angiografía entre 2 y 24 h tras la fibrinólisis, con intención de ICP cuando esté indicada.",
  "REPERFUSÃO · Cenário":
    "REPERFUSIÓN · Escenario",
  "REPERFUSÃO · ICP fora da meta":
    "REPERFUSIÓN · ICP fuera de la meta",
  "REPERFUSÃO · Início do episódio atual":
    "REPERFUSIÓN · Inicio del episodio actual",
  "REPERFUSÃO · Início dos sintomas":
    "REPERFUSIÓN · Inicio de los síntomas",
  "Reavaliar a história: se o início do episódio atual ficar claro, voltar e reclassificar.":
    "Reevaluar la historia: si el inicio del episodio actual queda claro, volver y reclasificar.",
  "Reclassificar imediatamente se surgir dor, instabilidade, IC ou arritmia.":
    "Reclasificar de inmediato si aparece dolor, inestabilidad, IC o arritmia.",
  "Relativa não proíbe — muda a conta. E quem faz a conta é você, não o app.":
    "La relativa no prohíbe — cambia la cuenta. Y quien hace la cuenta es usted, no la app.",
  "Reperfusão bem-sucedida — angiografia precoce":
    "Reperfusión exitosa — angiografía precoz",
  "Responda pelos dois blocos. O app recalcula — a dúvida não libera a fibrinólise.":
    "Responda por los dos bloques. La app recalcula — la duda no habilita la fibrinólisis.",
  "STEMI extenso nas primeiras horas, com ICP inviável, costuma justificar a fibrinólise mesmo com relativa — mas a decisão é individual.":
    "El IAMCEST extenso en las primeras horas, con ICP inviable, suele justificar la fibrinólisis incluso con relativa — pero la decisión es individual.",
  "Se o paciente acordou com a dor, o início é indeterminado — não se conta a partir de quando acordou.":
    "Si el paciente despertó con el dolor, el inicio es indeterminado — no se cuenta desde que despertó.",
  "Seguindo pela janela temporal — a fibrinólise não é automática.":
    "Siguiendo por la ventana temporal — la fibrinólisis no es automática.",
  "Sem contraindicação ABSOLUTA nem RELATIVA":
    "Sin contraindicación ABSOLUTA ni RELATIVA",
  "Sem início confiável, a via é a estratégia invasiva — não a fibrinólise.":
    "Sin inicio confiable, la vía es la estrategia invasiva — no la fibrinólisis.",
  "Sem isquemia em curso nem instabilidade, a reperfusão de rotina não oferece benefício.":
    "Sin isquemia en curso ni inestabilidad, la reperfusión de rutina no ofrece beneficio.",
  "Sem um início confiável, a via é a estratégia invasiva/transferência, com avaliação especializada.":
    "Sin un inicio confiable, la vía es la estrategia invasiva/traslado, con evaluación especializada.",
  "Serviço COM hemodinâmica — sem transferência":
    "Servicio CON hemodinámica — sin traslado",
  "Sim — algum destes está presente":
    "Sí — alguno de estos está presente",
  "Sim — consigo definir o início do episódio atual":
    "Sí — puedo definir el inicio del episodio actual",
  "Sim — dentro da meta":
    "Sí — dentro de la meta",
  "Sim, algum está presente":
    "Sí, alguno está presente",
  "Sinais de reperfusão vão sendo avaliados no caminho — não espere para transferir.":
    "Los signos de reperfusión se evalúan en el camino — no espere para trasladar.",
  "Sucesso da lise não encerra a via: a angiografia precoce é parte da estratégia.":
    "El éxito de la lisis no cierra la vía: la angiografía precoz es parte de la estrategia.",
  "Toque na janela do episódio atual, contínuo.":
    "Toque la ventana del episodio actual, continuo.",
  "Transferência urgente para centro com hemodinâmica.":
    "Traslado urgente a centro con hemodinámica.",
  "Transporte monitorizado, com desfibrilador.":
    "Transporte monitorizado, con desfibrilador.",
  "Tratar incerteza temporal como se fosse janela aberta transformaria a dúvida em autorização para uma terapia hemorrágica. Tratar como fora da janela negaria reperfusão a quem talvez estivesse dentro dela. Por isso este é um terceiro estado, com via própria.":
    "Tratar la incertidumbre temporal como si fuera ventana abierta convertiría la duda en autorización para una terapia hemorrágica. Tratarla como fuera de ventana negaría la reperfusión a quien tal vez estuviera dentro de ella. Por eso este es un tercer estado, con vía propia.",
  "{metaIcp}":
    "{metaIcp}",
  "⚠️ COM RELATIVA E SEM ABSOLUTA, o que pesa é o TEMPO ATÉ A ICP: se a transferência para hemodinâmica for viável dentro da meta, prefira a ICP.":
    "⚠️ CON RELATIVA Y SIN ABSOLUTA, lo que pesa es el TIEMPO HASTA LA ICP: si el traslado a hemodinámica es viable dentro de la meta, prefiera la ICP.",
  "⚠️ Início indeterminado não libera fibrinólise — a incerteza não vira elegibilidade para uma terapia hemorrágica.":
    "⚠️ Un inicio indeterminado no habilita la fibrinólisis — la incertidumbre no se convierte en elegibilidad para una terapia hemorrágica.",
  "⚠️ SITUAÇÃO EXCEPCIONAL — apresentação ≥ 12 h com instabilidade hemodinâmica ou grande território miocárdico em risco, quando a ICP oportuna é impossível: pode haver circunstâncias em que o benefício da fibrinólise supere o risco. Isto é DECISÃO ESPECIALIZADA INDIVIDUALIZADA — este app não prescreve fibrinólise automaticamente após 12 h, e por isso não há botão para ela aqui.":
    "⚠️ SITUACIÓN EXCEPCIONAL — presentación ≥ 12 h con inestabilidad hemodinámica o gran territorio miocárdico en riesgo, cuando la ICP oportuna es imposible: puede haber circunstancias en que el beneficio de la fibrinólisis supere el riesgo. Esto es DECISIÓN ESPECIALIZADA INDIVIDUALIZADA — esta app no prescribe fibrinólisis automáticamente después de 12 h, y por eso no hay botón para ella aquí.",
  "Após a fibrinólise, TRANSFERIR IMEDIATAMENTE para centro com ICP — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível A.":
    "Tras la fibrinólisis, TRASLADAR INMEDIATAMENTE a centro con ICP — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Clase 1, nivel A.",
  "Falha de reperfusão: angiografia imediata com intenção de ICP de resgate — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível B-R.":
    "Falla de reperfusión: angiografía inmediata con intención de ICP de rescate — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Clase 1, nivel B-R.",
  "Fibrinólise bem-sucedida: angiografia precoce entre 2 e 24 h, com intenção de ICP quando indicada — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Classe 1, nível B-R.":
    "Fibrinólisis exitosa: angiografía precoz entre 2 y 24 h, con intención de ICP cuando esté indicada — ACC/AHA/ACEP/NAEMSP/SCAI 2025, Clase 1, nivel B-R.",
  "Hospital SEM hemodinâmica, com necessidade de transferência: meta de 120 minutos entre o primeiro contato médico (FMC) e o dispositivo.":
    "Hospital SIN hemodinámica, con necesidad de traslado: meta de 120 minutos entre el primer contacto médico (FMC) y el dispositivo.",
  "Serviço COM hemodinâmica, sem transferência: meta de 90 minutos entre o primeiro contato médico (FMC) e o dispositivo.":
    "Servicio CON hemodinámica, sin traslado: meta de 90 minutos entre el primer contacto médico (FMC) y el dispositivo.",
  // ── reorganização da ordem operacional 2026-08-25 (ECG antes do portão · paralelo · ajuda do supra · Wellens/troponina) ──
  "Acessos, exames e monitorização seguem durante o transporte.":
    "Accesos, exámenes y monitorización continúan durante el traslado.",
  "Agora este dado é necessário: ele define a elegibilidade e a urgência da reperfusão.":
    "Ahora este dato es necesario: define la elegibilidad y la urgencia de la reperfusión.",
  "Antitrombóticos e adjuvantes: iniciar em paralelo, sem segurar a sala.":
    "Antitrombóticos y adyuvantes: iniciar en paralelo, sin retener la sala.",
  "BRE novo/presumivelmente novo entra por outro caminho: não é equivalente automático — exige correlação clínica.":
    "El BRI nuevo/presumiblemente nuevo entra por otro camino: no es equivalente automático — exige correlación clínica.",
  "Com estes critérios, o traçado tem supra de ST?":
    "Con estos criterios, ¿el trazado tiene elevación del ST?",
  "Contíguas = do mesmo território: V1–V4 (anterosseptal) · DII, DIII, aVF (inferior) · DI, aVL, V5–V6 (lateral).":
    "Contiguas = del mismo territorio: V1–V4 (anteroseptal) · DII, DIII, aVF (inferior) · DI, aVL, V5–V6 (lateral).",
  "ECG · Como reconhecer o supra":
    "ECG · Cómo reconocer la elevación",
  "Em V2–V3 o limiar é MAIOR: ≥ 2 mm (homens ≥ 40 anos), ≥ 2,5 mm (homens < 40 anos), ≥ 1,5 mm (mulheres).":
    "En V2–V3 el umbral es MAYOR: ≥ 2 mm (hombres ≥ 40 años), ≥ 2,5 mm (hombres < 40 años), ≥ 1,5 mm (mujeres).",
  "Equipe/hemodinâmica pode ser avisada já, antes mesmo desta resposta.":
    "El equipo/la hemodinámica puede ser avisado ya, incluso antes de esta respuesta.",
  "Monitorização, acessos e coleta seguem em curso.":
    "Monitorización, accesos y toma de muestras siguen en curso.",
  "Não sei interpretar — me ajude":
    "No sé interpretarlo — ayúdenme",
  "Não — avaliei e não há supra":
    "No — lo evalué y no hay elevación",
  "Não — não atinge o critério":
    "No — no alcanza el criterio",
  "Não — sem elevação, mas padrão de alto risco já reconhecido no ECG":
    "No — sin elevación, pero con patrón de alto riesgo ya reconocido en el ECG",
  "Peso para as doses — pode ser obtido durante o preparo.":
    "Peso para las dosis — puede obtenerse durante la preparación.",
  "Sim — atinge o critério acima":
    "Sí — alcanza el criterio de arriba",
  "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações CONTÍGUAS — medido no ponto J, em relação à linha de base.":
    "Elevación del ST ≥ 1 mm (0,1 mV) en ≥ 2 derivaciones CONTIGUAS — medida en el punto J, respecto a la línea de base.",
  "⚠️ Ausência de supra NÃO exclui oclusão: os padrões da tela seguinte ocluem sem elevar o ST.":
    "⚠️ La ausencia de elevación NO excluye oclusión: los patrones de la pantalla siguiente ocluyen sin elevar el ST.",
  "AO MESMO TEMPO — não atrase o que já foi acionado":
    "AL MISMO TIEMPO — no retrase lo que ya fue activado",
  "Quando a dor começou? (pode responder depois)":
    "¿Cuándo comenzó el dolor? (puede responder después)",
  // ── correção pré-congelamento 2026-08-25: nitrato alinhado à ACC/AHA 2025 (sem teto inventado) · betabloqueador sem posologia atribuída à guideline ──
  "NITROGLICERINA SUBLINGUAL — 0,3–0,4 mg SL a cada 5 min, até 3 doses. Só em paciente hemodinamicamente estável e com PAS ≥ 90 mmHg (reavaliar a PA antes de cada dose).":
    "NITROGLICERINA SUBLINGUAL — 0,3–0,4 mg SL cada 5 min, hasta 3 dosis. Solo en paciente hemodinámicamente estable y con PAS ≥ 90 mmHg (reevaluar la PA antes de cada dosis).",
  "NITROGLICERINA IV — iniciar a 10 mcg/min e titular conforme os sintomas e a tolerância hemodinâmica. ⚠️ Este app não fixa dose máxima: a ACC/AHA 2025 não estabelece um teto numérico, e inventar um seria atribuir à diretriz o que ela não diz.":
    "NITROGLICERINA IV — iniciar a 10 mcg/min y titular según los síntomas y la tolerancia hemodinámica. ⚠️ Esta app no fija dosis máxima: la ACC/AHA 2025 no establece un techo numérico, e inventarlo sería atribuir a la guía lo que ella no dice.",
  "Monitorização: PA a cada ajuste de dose e continuamente durante a infusão IV — a queda pode ser abrupta. Interromper/reduzir se a PAS cair abaixo de 90 mmHg ou mais de 30 mmHg do basal; reavaliar a dor a cada ajuste.":
    "Monitorización: PA en cada ajuste de dosis y de forma continua durante la infusión IV — la caída puede ser abrupta. Interrumpir/reducir si la PAS cae por debajo de 90 mmHg o más de 30 mmHg respecto al basal; reevaluar el dolor en cada ajuste.",
  "⛔ NÃO USAR nitrato se: suspeita de IAM de ventrículo direito; PAS < 90 mmHg OU queda > 30 mmHg em relação ao basal; uso recente de inibidor de PDE-5 (ver janela abaixo).":
    "⛔ NO USAR nitrato si: sospecha de IAM de ventrículo derecho; PAS < 90 mmHg O caída > 30 mmHg respecto al basal; uso reciente de inhibidor de PDE-5 (ver ventana abajo).",
  "Via ORAL, precoce (primeiras 24 h), apenas em paciente já ESTABILIZADO e sem contraindicações. ⚠️ Este app não fixa fármaco/dose aqui: a ACC/AHA 2025 recomenda o momento e o perfil do paciente, não uma posologia específica — seguir a padronização do serviço.":
    "Vía ORAL, precoz (primeras 24 h), solo en paciente ya ESTABILIZADO y sin contraindicaciones. ⚠️ Esta app no fija fármaco/dosis aquí: la ACC/AHA 2025 recomienda el momento y el perfil del paciente, no una posología específica — seguir la estandarización del servicio.",
  "⚠️ Betabloqueador INTRAVENOSO não é a via desta recomendação — é indicação separada, com risco próprio na fase aguda. Não converter a orientação oral acima em prescrição IV.":
    "⚠️ El betabloqueante INTRAVENOSO no es la vía de esta recomendación — es una indicación separada, con riesgo propio en la fase aguda. No convertir la orientación oral de arriba en prescripción IV.",
  "Betabloqueador — SÓ EM PACIENTE SELECIONADO, não é terapia automática de todo IAM: indicado para controle de frequência cardíaca e efeito anti-isquêmico em quem está hemodinamicamente estável, sem sinais de baixo débito.":
    "Betabloqueante — SOLO EN PACIENTE SELECCIONADO, no es terapia automática de todo IAM: indicado para control de frecuencia cardíaca y efecto antiisquémico en quien está hemodinámicamente estable, sin signos de bajo gasto.",
  "NÃO iniciar se: IC aguda, baixo débito, BAV de 2º/3º grau sem marcapasso, ou broncoespasmo ativo.":
    "NO iniciar si: IC aguda, bajo gasto, BAV de 2.º/3.er grado sin marcapasos, o broncoespasmo activo.",
  "Com estes critérios mais objetivos, algum está presente?": "Con estos criterios más objetivos, ¿alguno está presente?",
  "Dor isquêmica ativa = dor torácica isquêmica presente NESTE MOMENTO, apesar de qualquer tratamento anti-isquêmico já em curso.":
    "Dolor isquémico activo = dolor torácico isquémico presente EN ESTE MOMENTO, a pesar de cualquier tratamiento antiisquémico ya en curso.",
  "Esclarecendo a correlação": "Aclarando la correlación",
  "Instabilidade associada = hipotensão, alteração aguda de consciência, ou sinais de hipoperfusão (pele fria/pálida/sudoreica) associados ao quadro atual.":
    "Inestabilidad asociada = hipotensión, alteración aguda de la consciencia, o signos de hipoperfusión (piel fría/pálida/sudorosa) asociados al cuadro actual.",
  "Não sei — me ajude a avaliar": "No sé — ayúdenme a evaluar",
  "Não, nenhum dos dois": "No, ninguno de los dos",
  "Sim, algum dos dois está presente": "Sí, alguno de los dos está presente",
  "Volte a esta pergunta assim que o exame estiver pronto.": "Vuelva a esta pregunta en cuanto el examen esté listo.",
  "Reavaliar disponibilidade e estabilidade periodicamente.": "Reevaluar disponibilidad y estabilidad periódicamente.",

  // ── lib/dissecao-triagem.ts — correção 2026-08-24 (blocos reordenados/expandidos + resultado por fatos) ──
  "Antes do AAS — a dor tem alguma característica de alto risco?\n• Início súbito, já máximo desde o começo (não crescente)\n• Dor intensa/severa\n• Caráter em rasgão/dilacerante\n• Irradiação para o dorso/região interescapular (achado adicional)":
    "Antes de la AAS — ¿el dolor tiene alguna característica de alto riesgo?\n• Inicio súbito, ya máximo desde el comienzo (no creciente)\n• Dolor intenso/severo\n• Carácter desgarrante\n• Irradiación hacia la espalda/región interescapular (hallazgo adicional)",
  "Há alguma condição predisponente conhecida?\n• Doença do tecido conjuntivo (ex.: Marfan)\n• História familiar de doença aórtica\n• Aneurisma de aorta torácica conhecido\n• Doença valvar/aórtica relevante conhecida (ex.: valva aórtica bicúspide)\n• Cirurgia cardíaca ou manipulação aórtica prévia":
    "¿Hay alguna condición predisponente conocida?\n• Enfermedad del tejido conjuntivo (ej.: Marfan)\n• Historia familiar de enfermedad aórtica\n• Aneurisma de aorta torácica conocido\n• Enfermedad valvular/aórtica relevante conocida (ej.: válvula aórtica bicúspide)\n• Cirugía cardíaca o manipulación aórtica previa",
  "Antitrombótico: bloqueado até esclarecimento.": "Antitrombótico: bloqueado hasta esclarecimiento.",
  "Antitrombótico: não liberar enquanto a suspeita clínica permanecer relevante.":
    "Antitrombótico: no liberar mientras la sospecha clínica permanezca relevante.",
  "Antitrombótico: não liberar enquanto a dúvida permanecer.": "Antitrombótico: no liberar mientras la duda permanezca.",
  "Você já tem o resultado do exame de imagem?": "¿Ya tiene el resultado del examen de imagen?",
  "Manter monitorização contínua e as medidas de segurança em curso enquanto o resultado não chega. Volte aqui assim que o exame estiver pronto.":
    "Mantener monitorización continua y las medidas de seguridad en curso mientras el resultado no llega. Vuelva aquí en cuanto el examen esté listo.",
  "Considerar alternativa diagnóstica conforme estabilidade do paciente e disponibilidade institucional (ex.: ecocardiograma transesofágico à beira-leito). Manter avaliação especializada e a suspeita como pendente.":
    "Considerar alternativa diagnóstica según estabilidad del paciente y disponibilidad institucional (ej.: ecocardiograma transesofágico a la cabecera). Mantener evaluación especializada y la sospecha como pendiente.",
  "O que o laudo informa?": "¿Qué informa el informe?",
  "O laudo menciona algum destes: flap intimal, hematoma intramural, úlcera aterosclerótica penetrante, ou extensão da dissecção?":
    "¿El informe menciona alguno de estos: flap intimal, hematoma intramural, úlcera aterosclerótica penetrante, o extensión de la disección?",
  "O laudo declara explicitamente ausência de dissecção/síndrome aórtica aguda (conclusão do radiologista)?":
    "¿El informe declara explícitamente ausencia de disección/síndrome aórtico agudo (conclusión del radiólogo)?",
  "Não sei localizar isso no laudo": "No sé localizar eso en el informe",
};
