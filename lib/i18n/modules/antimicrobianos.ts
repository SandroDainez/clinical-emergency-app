/**
 * ES do CATÁLOGO DE ANTIMICROBIANOS.
 *
 * ⚠️ O CATÁLOGO AINDA NÃO RENDERIZA — ele é dado, e a tela continua lendo o
 * motor. As chaves entram junto com o dado, e não depois, pela mesma razão que
 * todo o resto: tradução que fica para depois é a que sai em português na tela de
 * quem escolheu espanhol, e ninguém percebe até um colega reclamar.
 */
export const ES_ANTIMICROBIANOS: Record<string, string> = {
  "Beta-lactâmico + inibidor de beta-lactamase": "Betalactámico + inhibidor de betalactamasa",
  "Glicopeptídeo": "Glucopéptido",
  "Carbapenêmico": "Carbapenémico",
  "25–30 mg/kg de ataque (peso real, máx 3 g)": "25–30 mg/kg de carga (peso real, máx 3 g)",
  "dose única de ataque": "dosis única de carga",
  "48/48h ou por nível": "48/48h o por nivel",
  "12/12h + 0,75 g pós-diálise": "12/12h + 0,75 g posdiálisis",
  "após a sessão": "tras la sesión",
  "1 g (MDR: 2 g infusão 3 h; meningite: 2 g)": "1 g (MDR: 2 g infusión 3 h; meningitis: 2 g)",
  "1 g (MDR/meningite: 2 g)": "1 g (MDR/meningitis: 2 g)",
  "500 mg–1 g (MDR/meningite: 1 g)": "500 mg–1 g (MDR/meningitis: 1 g)",
  "500 mg (MDR/meningite: 1 g)": "500 mg (MDR/meningitis: 1 g)",
  "Alvo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Vale 15–20 mcg/mL se AUC indisponível.":
    "Objetivo AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). Valle 15–20 mcg/mL si AUC no disponible.",
  "Diluir 1 g em ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome do homem vermelho.":
    "Diluir 1 g en ≥ 250 mL; infundir ≥ 60 min (máx 10 mg/min) — evitar síndrome del hombre rojo.",
  "Dosar nível pré-diálise.": "Medir nivel prediálisis.",
  "MDR: 2 g em 100 mL SF → infundir em 3 h.": "MDR: 2 g en 100 mL SF → infundir en 3 h.",
  "Pseudomonas: 4,5 g em 250 mL SF → infundir em 4 h (maximiza tempo > MIC).":
    "Pseudomonas: 4,5 g en 250 mL SF → infundir en 4 h (maximiza tiempo > MIC).",
  "NÃO REQUER AJUSTE por função renal isolada — é excretada por via biliar E renal. ⚠️ EXCEÇÃO: com disfunção HEPÁTICA e renal significativa JUNTAS, não passar de 2 g/dia.":
    "NO REQUIERE AJUSTE por función renal aislada — se excreta por vía biliar Y renal. ⚠️ EXCEPCIÓN: con disfunción HEPÁTICA y renal significativa JUNTAS, no pasar de 2 g/día.",
  "⚠️ o label não traz esquema de profilaxia para ClCr < 55 — isso NÃO significa que a profilaxia esteja contraindicada":
    "⚠️ el prospecto no trae esquema de profilaxis para ClCr < 55 — esto NO significa que la profilaxis esté contraindicada",
  // ── O MOTOR DIRIGIDO PELO CATÁLOGO (2026-08-23) ──────────────────────────
  "Meningite bacteriana, neste label, é indicação PEDIÁTRICA (3 meses ou mais) — não adulta.":
    "Meningitis bacteriana, en este prospecto, es indicación PEDIÁTRICA (3 meses o más) — no adulta.",
  "Não sei — ver as três. O label dá 500 mg 8/8h em pele e partes moles, 1 g 8/8h em intra-abdominal complicada, e 1 g 8/8h quando a infecção de pele é por Pseudomonas aeruginosa. Meningite, neste label, é indicação PEDIÁTRICA.":
    "No sé — ver las tres. El prospecto da 500 mg 8/8h en piel y partes blandas, 1 g 8/8h en intraabdominal complicada, y 1 g 8/8h cuando la infección de piel es por Pseudomonas aeruginosa. Meningitis, en este prospecto, es indicación PEDIÁTRICA.",
  "Qual é a indicação? (é ela que define a dose de referência)":
    "¿Cuál es la indicación? (es ella la que define la dosis de referencia)",
  "dose de referência":
    "dosis de referencia",
  "fração da dose de referência":
    "fracción de la dosis de referencia",
  "⚠️ A DOSE DE REFERÊNCIA DEPENDE DA INDICAÇÃO: 500 mg 8/8h em pele e partes moles · 1 g 8/8h em intra-abdominal complicada · 1 g 8/8h se a infecção de pele for por Pseudomonas aeruginosa. A tabela renal do label reduz À METADE dessa base — não de um valor fixo.":
    "⚠️ LA DOSIS DE REFERENCIA DEPENDE DE LA INDICACIÓN: 500 mg 8/8h en piel y partes blandas · 1 g 8/8h en intraabdominal complicada · 1 g 8/8h si la infección de piel es por Pseudomonas aeruginosa. La tabla renal del prospecto reduce A LA MITAD esa base — no de un valor fijo.",
  "Pele e partes moles":
    "Piel y partes blandas",
  "Pele — Pseudomonas aeruginosa":
    "Piel — Pseudomonas aeruginosa",
  "Intra-abdominal complicada":
    "Intraabdominal complicada",
  "500 mg (pele) · 1 g (intra-abdominal)":
    "500 mg (piel) · 1 g (intraabdominal)",
  "1–2 g":
    "1–2 g",
  "25–30 mg/kg pelo peso REAL (máx 3 g)":
    "25–30 mg/kg por el peso REAL (máx 3 g)",
  "sempre, em qualquer grau de disfunção renal — o label diz que a dose inicial não deve ser menor que 15 mg/kg em nenhum grau":
    "siempre, en cualquier grado de disfunción renal — el prospecto dice que la dosis inicial no debe ser menor que 15 mg/kg en ningún grado",
  "a dose depende de:":
    "la dosis depende de:",
  "Ajuste renal — dirigido pelo catálogo, não por código":
    "Ajuste renal — dirigido por el catálogo, no por código",
  "Cada linha declara a SUA fonte — ver lib/antimicrobianos/catalogo.ts e protocols/fontes-verbatim/.":
    "Cada línea declara SU fuente — ver lib/antimicrobianos/catalogo.ts y protocols/fontes-verbatim/.",
  "ClCr ABSOLUTO (mL/min) — Cockcroft-Gault, como nos estudos de ajuste de dose":
    "ClCr ABSOLUTO (mL/min) — Cockcroft-Gault, como en los estudios de ajuste de dosis",
  "Cockcroft-Gault (ClCr absoluto) — é o que este campo pede":
    "Cockcroft-Gault (ClCr absoluto) — es lo que este campo pide",
  "Dose de ataque — não se ajusta por função renal":
    "Dosis de carga — no se ajusta por función renal",
  "Nesta faixa":
    "En esta franja",
  "Não sei — ver todas":
    "No sé — ver todas",
  "O que a fonte diz":
    "Lo que dice la fuente",
  "Qual clearance esta faixa pressupõe":
    "Qué clearance presupone esta franja",
  "Se o fármaco pedir: indicação · esquema basal":
    "Si el fármaco lo pide: indicación · esquema basal",
  "Valores orientativos — confirmar com farmacêutico clínico e bula. Cada linha declara a sua fonte no catálogo.":
    "Valores orientativos — confirmar con farmacéutico clínico y prospecto. Cada línea declara su fuente en el catálogo.",
  "sem método declarado (linha de modalidade)":
    "sin método declarado (línea de modalidad)",
  "⚠️ CKD-EPI (indexada por superfície) — DIFERENTE do que este campo pede":
    "⚠️ CKD-EPI (indexada por superficie) — DIFERENTE de lo que este campo pide",
  "⚠️ MDRD (indexada) — DIFERENTE do que este campo pede":
    "⚠️ MDRD (indexada) — DIFERENTE de lo que este campo pide",
  "⚠️ falta o peso para esta coluna":
    "⚠️ falta el peso para esta columna",
  "Dose de antibiótico (TFG)":
    "Dosis de antibiótico (TFG)",
  // ── LOTE 1 · CEFTAZIDIMA (2026-08-23) ───────────────────────────────────
  "Ceftazidima":
    "Ceftazidima",
  "Cefalosporina de 3ª geração (antipseudomonas)":
    "Cefalosporina de 3ª generación (antipseudomonas)",
  "1 g (usual) · 2 g (meningite, intra-abdominal grave, osso/articulação, infecção muito grave) · 250 mg (ITU não complicada)":
    "1 g (usual) · 2 g (meningitis, intraabdominal grave, hueso/articulación, infección muy grave) · 250 mg (ITU no complicada)",
  "Acima de 50 mL/min não há redução: vale a dose por indicação (1 g usual · 2 g nas graves · 250 mg em ITU não complicada).":
    "Por encima de 50 mL/min no hay reducción: vale la dosis por indicación (1 g usual · 2 g en las graves · 250 mg en ITU no complicada).",
  "Infecção grave que receberia 6 g/dia se o rim fosse normal: o label permite AUMENTAR a dose unitária em 50% ou encurtar o intervalo — e depois guiar por monitorização, gravidade e sensibilidade.":
    "Infección grave que recibiría 6 g/día si el riñón fuera normal: el prospecto permite AUMENTAR la dosis unitaria en 50% o acortar el intervalo — y después guiar por monitorización, gravedad y sensibilidad.",
  "Não existe linha genérica de Pseudomonas fora da fibrose cística: a cobertura em dose alta cai na linha das infecções muito graves (2 g 8/8h).":
    "No existe línea genérica de Pseudomonas fuera de la fibrosis quística: la cobertura en dosis alta cae en la línea de las infecciones muy graves (2 g 8/8h).",
  "O label indica a equação de Cockcroft para estimar o clearance.":
    "El prospecto indica la ecuación de Cockcroft para estimar el clearance.",
  "Precedida de ataque de 1 g. Além da via IV, o label permite incorporar 250 mg a cada 2 L do líquido de diálise.":
    "Precedida de carga de 1 g. Además de la vía IV, el prospecto permite incorporar 250 mg por cada 2 L del líquido de diálisis.",
  "após CADA sessão de hemodiálise":
    "tras CADA sesión de hemodiálisis",
  "dose da Tabela 3, pela indicação":
    "dosis de la Tabla 3, por la indicación",
  "⚠️ A NOTA DO LABEL, EM CAIXA ALTA: se a dose da tabela por indicação for MENOR que a da tabela renal, use A MENOR.":
    "⚠️ LA NOTA DEL PROSPECTO, EN MAYÚSCULAS: si la dosis de la tabla por indicación es MENOR que la de la tabla renal, use LA MENOR.",
  "⚠️ ESTE LABEL NÃO AFIRMA que o quadro neurológico seja reversível — ao contrário do da cefepima. A frase da superdosagem fala em remover A DROGA por diálise, não em reverter o quadro. A ausência fica declarada, não preenchida com o texto do outro fármaco.":
    "⚠️ ESTE PROSPECTO NO AFIRMA que el cuadro neurológico sea reversible — a diferencia del de la cefepima. La frase de la sobredosis habla de remover EL FÁRMACO por diálisis, no de revertir el cuadro. La ausencia queda declarada, no rellenada con el texto del otro fármaco.",
  "⚠️ NEUROTOXICIDADE — níveis elevados em insuficiência renal levam a crise convulsiva, ESTADO DE MAL NÃO CONVULSIVO, encefalopatia, coma, ASTERIXIS, excitabilidade neuromuscular e mioclonia. Os relatos são em pacientes renais tratados com esquema NÃO AJUSTADO. A dose diária total deve ser reduzida na insuficiência renal.":
    "⚠️ NEUROTOXICIDAD — niveles elevados en insuficiencia renal llevan a crisis convulsiva, ESTADO DE MAL NO CONVULSIVO, encefalopatía, coma, ASTERIXIS, excitabilidad neuromuscular y mioclonía. Los reportes son en pacientes renales tratados con esquema NO AJUSTADO. La dosis diaria total debe reducirse en la insuficiencia renal.",
  "⚠️ TRS CONTÍNUA NÃO EXISTE NESTE LABEL: as palavras hemofiltration, arteriovenous, venovenous, CAVH, CVVH, CAVHD e CVVHD não aparecem em NENHUM dos nove setids varridos. Ausência conferida, não presumida — e é por isso que a nota genérica de CRRT continua valendo aqui.":
    "⚠️ TRS CONTINUA NO EXISTE EN ESTE PROSPECTO: las palabras hemofiltration, arteriovenous, venovenous, CAVH, CVVH, CAVHD y CVVHD no aparecen en NINGUNO de los nueve setids barridos. Ausencia comprobada, no presumida — y por eso la nota genérica de CRRT sigue valiendo aquí.",
  "Ataque (na suspeita de insuficiência renal)":
    "Carga (ante sospecha de insuficiencia renal)",
  "⚠️ O label diz \"menos de 5\" para 500 mg 48/48h e \"15 a 6\" para 500 mg 24/24h — 5 a 5,9 fica sem faixa NA FONTE. Aqui segue a de MENOR exposição, apoiado na NOTA do label de que a dose menor deve ser usada.":
    "⚠️ El prospecto dice \"menos de 5\" para 500 mg 48/48h y \"15 a 6\" para 500 mg 24/24h — 5 a 5,9 queda sin franja EN LA FUENTE. Aquí sigue la de MENOR exposición, apoyado en la NOTA del prospecto de que la dosis menor debe usarse.",
  "Precedida de ataque de 1 g — e aqui o label diz \"is recommended\", não \"may be given\".":
    "Precedida de carga de 1 g — y aquí el prospecto dice \"is recommended\", no \"may be given\".",
  "12/12h":
    "12/12h",
  "8/8h a 12/12h":
    "8/8h a 12/12h",
  // ── LOTE 1 · CEFEPIMA + refatoração do eixo renal (2026-08-22) ───────────
  "1 g no dia 1, depois 500 mg":
    "1 g el día 1, después 500 mg",
  "8/8h + 0,75 g após cada sessão":
    "8/8h + 0,75 g tras cada sesión",
  "8/8h a 12/12h conforme a indicação":
    "8/8h a 12/12h según la indicación",
  "A hemodiálise de 3 h remove ~68% do que estava no corpo no início da sessão. ⚠️ Aqui a dose INICIAL também muda — é a única situação em que ela muda.":
    "La hemodiálisis de 3 h remueve ~68% de lo que estaba en el cuerpo al inicio de la sesión. ⚠️ Aquí la dosis INICIAL también cambia — es la única situación en que cambia.",
  "A hemodiálise remove 30% a 40% da dose — daí os 0,75 g após cada sessão.":
    "La hemodiálisis remueve 30% a 40% de la dosis — de ahí los 0,75 g tras cada sesión.",
  "A maioria dos casos de neurotoxicidade ocorreu em disfunção renal SEM ajuste apropriado — mas há casos COM ajuste apropriado. Ajustar não isenta de vigiar.":
    "La mayoría de los casos de neurotoxicidad ocurrió en disfunción renal SIN ajuste apropiado — pero hay casos CON ajuste apropiado. Ajustar no exime de vigilar.",
  "Acima de 60 mL/min é o esquema NORMAL — a dose inicial não se ajusta; só a manutenção.":
    "Por encima de 60 mL/min es el esquema NORMAL — la dosis inicial no se ajusta; solo el mantenimiento.",
  "CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.":
    "CAPD es LÍNEA de la misma tabla del prospecto, al lado de 30–60 y 11–29.",
  "CAPD: sem dose adicional.":
    "CAPD: sin dosis adicional.",
  "Cefalosporina de 4ª geração":
    "Cefalosporina de 4ª generación",
  "Dosar nível PRÉ-diálise. ⚠️ O consenso 2020 tabela 25 mg/kg de ataque e 10 mg/kg de manutenção (após o fim da sessão, dialisador de alta permeabilidade) — ver D-77.":
    "Medir nivel PREdiálisis. ⚠️ El consenso 2020 tabula 25 mg/kg de carga y 10 mg/kg de mantenimiento (tras el fin de la sesión, dializador de alta permeabilidad) — ver D-77.",
  "Em 6 de 26 pacientes em diálise a eliminação estava muito reduzida: dosar nível se disponível.":
    "En 6 de 26 pacientes en diálisis la eliminación estaba muy reducida: medir nivel si está disponible.",
  "Hemodiálise: 1 g no dia 1, depois 500 mg 24/24h para todas as infecções, EXCETO neutropenia febril, que é 1 g 24/24h. Dar sempre APÓS a sessão, no mesmo horário todo dia.":
    "Hemodiálisis: 1 g el día 1, después 500 mg 24/24h para todas las infecciones, EXCEPTO neutropenia febril, que es 1 g 24/24h. Dar siempre TRAS la sesión, al mismo horario todos los días.",
  "IV em ~30 min (IM só em ITU leve por E. coli)":
    "IV en ~30 min (IM solo en ITU leve por E. coli)",
  "Não sei — ver as duas colunas do label":
    "No sé — ver las dos columnas del prospecto",
  "Não sei — ver as duas, com o que muda em cada uma":
    "No sé — ver las dos, con lo que cambia en cada una",
  "O consenso 2020 lido não traz dose para diálise peritoneal.":
    "El consenso 2020 leído no trae dosis para diálisis peritoneal.",
  "O consenso 2020 traz recomendação para terapias híbridas (15 mg/kg após o fim), ainda NÃO transcrita para este catálogo — pendência nomeada, não ausência.":
    "El consenso 2020 trae recomendación para terapias híbridas (15 mg/kg tras el fin), aún NO transcrita para este catálogo — pendencia nombrada, no ausencia.",
  "O label indica a equação de Cockcroft-Gault para estimar o clearance — é a fonte que diz qual usar.":
    "El prospecto indica la ecuación de Cockcroft-Gault para estimar el clearance — es la fuente la que dice cuál usar.",
  "O label não traz dose para terapias híbridas.":
    "El prospecto no trae dosis para terapias híbridas.",
  "O label não traz esquema de profilaxia em hemodiálise.":
    "El prospecto no trae esquema de profilaxis en hemodiálisis.",
  "O label não traz esquema de profilaxia em diálise peritoneal.":
    "El prospecto no trae esquema de profilaxis en diálisis peritoneal.",
  "O label não traz esquema de profilaxia em terapias híbridas.":
    "El prospecto no trae esquema de profilaxis en terapias híbridas.",
  "O label traz diálise PERITONEAL apenas como farmacocinética (níveis séricos com solução de 50 e 150 mg/L), não como dose recomendada.":
    "El prospecto trae diálisis PERITONEAL solo como farmacocinética (niveles séricos con solución de 50 y 150 mg/L), no como dosis recomendada.",
  "Para Pseudomonas aeruginosa, o label manda 2 g IV 8/8h.":
    "Para Pseudomonas aeruginosa, el prospecto indica 2 g IV 8/8h.",
  "Qual esquema você usaria com função renal NORMAL?":
    "¿Qué esquema usaría con función renal NORMAL?",
  "É tratamento ou profilaxia cirúrgica?":
    "¿Es tratamiento o profilaxis quirúrgica?",
  "Qual é a indicação?":
    "¿Cuál es la indicación?",
  "após a sessão, no mesmo horário todo dia":
    "tras la sesión, al mismo horario todos los días",
  "⚠️ A DOSE INICIAL NÃO SE AJUSTA por função renal — só a manutenção. A ÚNICA exceção é a hemodiálise.":
    "⚠️ LA DOSIS INICIAL NO SE AJUSTA por función renal — solo el mantenimiento. La ÚNICA excepción es la hemodiálisis.",
  "1 a 2 g (pneumonia) · 2 g (neutropenia febril, ITU grave, pele, intra-abdominal) · 0,5 a 1 g (ITU leve a moderada)":
    "1 a 2 g (neumonía) · 2 g (neutropenia febril, ITU grave, piel, intraabdominal) · 0,5 a 1 g (ITU leve a moderada)",
  "Cefepima":
    "Cefepima",
  "Não sei — escolher pela INDICAÇÃO (o label dá o esquema por tipo de infecção): pneumonia 1–2 g 8/8h–12/12h · neutropenia febril 2 g 8/8h · ITU leve/moderada 0,5–1 g 12/12h · ITU grave, pele ou intra-abdominal 2 g 12/12h · Pseudomonas 2 g 8/8h. Sem saber a indicação, veja as quatro colunas lado a lado.":
    "No sé — elegir por la INDICACIÓN (el prospecto da el esquema por tipo de infección): neumonía 1–2 g 8/8h–12/12h · neutropenia febril 2 g 8/8h · ITU leve/moderada 0,5–1 g 12/12h · ITU grave, piel o intraabdominal 2 g 12/12h · Pseudomonas 2 g 8/8h. Sin saber la indicación, vea las cuatro columnas lado a lado.",
  "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem) — mas o label NÃO diz qual dose dar após a sessão.":
    "Es prontamente dializable y efectivamente removido por hemodiálisis (sección de sobredosis) — pero el prospecto NO dice qué dosis dar tras la sesión.",
  "⚠️ CRRT É UM VALOR SÓ, COM NOTA: as doses diferem entre CVVH, CVVHD e CVVHDF, e os labels quase nunca distinguem — fingir a distinção sem fonte seria pior que não tê-la. A fonte lida não traz dose para TRS contínua.":
    "⚠️ CRRT ES UN VALOR SOLO, CON NOTA: las dosis difieren entre CVVH, CVVHD y CVVHDF, y los prospectos casi nunca distinguen — fingir la distinción sin fuente sería peor que no tenerla. La fuente leída no trae dosis para TRS continua.",
  "⚠️ NEUROTOXICIDADE — suspeite diante de confusão, mioclonia, AFASIA, alucinação, estupor, rebaixamento, crise convulsiva ou estado de mal NÃO CONVULSIVO em paciente com disfunção renal, sobretudo se a dose não foi ajustada. REAVALIE A DROGA: os dois labels divergem entre SUSPENDER (PLR) e CONSIDERAR suspender ou ajustar (clássico). O quadro costuma melhorar após a suspensão e/ou hemodiálise.":
    "⚠️ NEUROTOXICIDAD — sospeche ante confusión, mioclonía, AFASIA, alucinación, estupor, deterioro de consciencia, crisis convulsiva o estado de mal NO CONVULSIVO en paciente con disfunción renal, sobre todo si la dosis no fue ajustada. REEVALÚE EL FÁRMACO: los dos prospectos divergen entre SUSPENDER (PLR) y CONSIDERAR suspender o ajustar (clásico). El cuadro suele mejorar tras la suspensión y/o hemodiálisis.",
  "⚠️ O label declara informação INADEQUADA também para diálise peritoneal.":
    "⚠️ El prospecto declara información INADECUADA también para diálisis peritoneal.",
  "Cefepima — a dose depende do ESQUEMA que se usaria com função normal":
    "Cefepima — la dosis depende del ESQUEMA que se usaría con función normal",
  "Esquema com função NORMAL — cefepima":
    "Esquema con función NORMAL — cefepima",
  "Não sabe?":
    "¿No sabe?",
  "Não sei — ver as quatro":
    "No sé — ver las cuatro",
  "O esquema habitual, a cada 48 h — CAPD é LINHA da mesma tabela do label, ao lado de 30–60 e 11–29.":
    "El esquema habitual, cada 48 h — CAPD es LÍNEA de la misma tabla del prospecto, al lado de 30–60 y 11–29.",
  "Substituição renal":
    "Sustitución renal",
  "⚠️ NÃO ESTÁ NO LABEL. As doses diferem entre CVVH, CVVHD e CVVHDF e o label não distingue — fingir a distinção sem fonte seria pior que não tê-la.":
    "⚠️ NO ESTÁ EN EL PROSPECTO. Las dosis difieren entre CVVH, CVVHD y CVVHDF y el prospecto no distingue — fingir la distinción sin fuente sería peor que no tenerla.",
  "⚠️ A palavra \"hemodialysis\" NÃO APARECE em nenhum dos CINCO setids de cefazolina lidos no DailyMed. Ausência conferida, não presumida.":
    "⚠️ La palabra \"hemodialysis\" NO APARECE en ninguno de los CINCO setids de cefazolina leídos en DailyMed. Ausencia comprobada, no presumida.",
  "500 mg 12/12h":
    "500 mg 12/12h",
  "1 g 12/12h":
    "1 g 12/12h",
  "2 g 12/12h":
    "2 g 12/12h",
  "2 g 8/8h":
    "2 g 8/8h",
  "500 mg":
    "500 mg",
  "250 mg":
    "250 mg",
  "1 g":
    "1 g",
  "2 g":
    "2 g",
  "24/24h":
    "24/24h",
  "48/48h":
    "48/48h",
  // ── LOTE 1 · CEFAZOLINA — indicação + peso (2026-08-22) ──────────────────
  "500 mg a 1 g (infecção moderada a grave) · 1 a 1,5 g (grave/ameaçadora)":
    "500 mg a 1 g (infección moderada a grave) · 1 a 1,5 g (grave/amenazante)",
  "8/8h ou mais espaçado":
    "8/8h o más espaciado",
  "Cefalosporina de 1ª geração":
    "Cefalosporina de 1ª generación",
  "IV ou IM":
    "IV o IM",
  "METADE da dose usual":
    "LA MITAD de la dosis usual",
  "dose usual INTEIRA":
    "dosis usual COMPLETA",
  "Profilaxia cirúrgica":
    "Profilaxis quirúrgica",
  "dose única, ½ h a 1 h antes da incisão":
    "dosis única, ½ h a 1 h antes de la incisión",
  "⚠️ o label não dá dose de profilaxia para ClCr < 55":
    "⚠️ el prospecto no da dosis de profilaxis para ClCr < 55",
  "ALVO NOMEADO: diretriz de profilaxia antimicrobiana cirúrgica (ASHP/IDSA/SIS/SHEA), que o autor decide se adota — outra fonte, outra força. NÃO preencher de memória: é exatamente aqui que a tentação é máxima, porque todo mundo sabe de cor.":
    "OBJETIVO NOMBRADO: directriz de profilaxis antimicrobiana quirúrgica (ASHP/IDSA/SIS/SHEA), que el autor decide si adopta — otra fuente, otra fuerza. NO rellenar de memoria: es exactamente aquí donde la tentación es máxima, porque todo el mundo lo sabe de memoria.",
  "Cirurgia longa (≥ 2 h): 500 mg a 1 g durante o ato. Pós-operatório: 500 mg a 1 g 6/6h–8/8h por 24 h. ⚠️ O label NÃO dá intervalo numérico de redose.":
    "Cirugía larga (≥ 2 h): 500 mg a 1 g durante el acto. Postoperatorio: 500 mg a 1 g 6/6h–8/8h por 24 h. ⚠️ El prospecto NO da intervalo numérico de redosis.",
  "Em cirurgia onde a infecção seria devastadora (cardíaca aberta, artroplastia com prótese), a profilaxia pode seguir por 3 a 5 dias.":
    "En cirugía donde la infección sería devastadora (cardíaca abierta, artroplastia con prótesis), la profilaxis puede seguir por 3 a 5 días.",
  "Nenhum dos labels declara dose máxima diária: o único teto é a frase de que doses de até 12 g/dia já foram usadas em casos raros — o que descreve o que ocorreu, não um limite recomendado.":
    "Ninguno de los prospectos declara dosis máxima diaria: el único techo es la frase de que dosis de hasta 12 g/día ya fueron usadas en casos raros — lo que describe lo ocurrido, no un límite recomendado.",
  "Profilaxia: a dose pré-incisão depende do PESO (1 a 2 g abaixo de 120 kg · 3 g de 120 kg para cima), não do clearance.":
    "Profilaxis: la dosis preincisión depende del PESO (1 a 2 g por debajo de 120 kg · 3 g de 120 kg hacia arriba), no del clearance.",
  "⚠️ 120 kg ou mais: 3 g. O label não repete a dose intraoperatória nem a de 24 h para esta faixa de peso.":
    "⚠️ 120 kg o más: 3 g. El prospecto no repite la dosis intraoperatoria ni la de 24 h para esta franja de peso.",
  "⚠️ ALERTA DE VIGILÂNCIA (seção de REAÇÕES NEUROLÓGICAS do label, não a de dosagem): há encefalopatia por ceftriaxona descrita em disfunção renal GRAVE — em pacientes que não receberam ajuste E em pacientes que receberam. Foi reversível com a suspensão. O label pede ajuste apropriado nesses casos. Isto NÃO contradiz a regra de dose acima: aquela é sobre a rotina, esta é sobre vigiar quem já está com disfunção grave.":
    "⚠️ ALERTA DE VIGILANCIA (sección de REACCIONES NEUROLÓGICAS del prospecto, no la de dosificación): hay encefalopatía por ceftriaxona descrita en disfunción renal GRAVE — en pacientes que no recibieron ajuste Y en pacientes que lo recibieron. Fue reversible con la suspensión. El prospecto pide ajuste apropiado en esos casos. Esto NO contradice la regla de dosis de arriba: aquella es sobre la rutina, esta es sobre vigilar a quien ya tiene disfunción grave.",
  "⚠️ TODA redução de dose no tratamento vale APÓS uma dose de ataque apropriada à gravidade — a frase está só no label clássico, não no PLR.":
    "⚠️ TODA reducción de dosis en el tratamiento vale TRAS una dosis de carga apropiada a la gravedad — la frase está solo en el prospecto clásico, no en el PLR.",
  "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção — a frase está só no label clássico.":
    "⚠️ Toda reducción vale TRAS una dosis de carga apropiada a la gravedad de la infección — la frase está solo en el prospecto clásico.",
  "⚠️ Toda redução vale APÓS uma dose de ataque apropriada à gravidade da infecção.":
    "⚠️ Toda reducción vale TRAS una dosis de carga apropiada a la gravedad de la infección.",
  "Cefazolina":
    "Cefazolina",
  "Tratamento":
    "Tratamiento",
  "18/18h a 24/24h":
    "18/18h a 24/24h",
  "6/6h a 8/8h":
    "6/6h a 8/8h",
  "1 a 2 g":
    "1 a 2 g",
  "3 g":
    "3 g",
  "—":
    "—",
  // ── LOTE 1 · CEFTRIAXONA — o caso do `nao_ajusta` (2026-08-22) ───────────
  "Ceftriaxona":
    "Ceftriaxona",
  "Cefalosporina de 3ª geração":
    "Cefalosporina de 3ª generación",
  "1 a 2 g por dia (teto de 4 g/dia)":
    "1 a 2 g por día (techo de 4 g/día)",
  "1×/dia, ou dividido 12/12h":
    "1×/día, o dividido 12/12h",
  "IV em ~30 min":
    "IV en ~30 min",
  "4 g/dia — e 2 g/dia se houver disfunção hepática E renal significativa":
    "4 g/día — y 2 g/día si hay disfunción hepática Y renal significativa",
  "NÃO REQUER AJUSTE por função renal":
    "NO REQUIERE AJUSTE por función renal",
  "CONTRAINDICADO na disfunção renal":
    "CONTRAINDICADO en la disfunción renal",
  "SEM DADOS de ajuste renal no label":
    "SIN DATOS de ajuste renal en el prospecto",
  "O que o label diz":
    "Lo que dice el prospecto",
  "NÃO REQUER AJUSTE por função renal isolada — é excretada por via biliar E renal.":
    "NO REQUIERE AJUSTE por función renal aislada — se excreta por vía biliar Y renal.",
  "⚠️ EXCEÇÃO: com disfunção HEPÁTICA e renal significativa JUNTAS, não passar de 2 g/dia — e monitorizar de perto.":
    "⚠️ EXCEPCIÓN: con disfunción HEPÁTICA y renal significativa JUNTAS, no pasar de 2 g/día — y monitorizar de cerca.",
  "Não é removida por hemodiálise nem por diálise peritoneal. Em 6 de 26 pacientes em diálise a eliminação estava muito reduzida: dosar nível se disponível.":
    "No se remueve por hemodiálisis ni por diálisis peritoneal. En 6 de 26 pacientes en diálisis la eliminación estaba muy reducida: medir nivel si está disponible.",
  "⚠️ CÁLCIO: não administrar junto com solução que contenha cálcio na MESMA linha — precipita. RINGER LACTATO e Hartmann estão nomeados no label e não servem nem para reconstituir.":
    "⚠️ CALCIO: no administrar junto con solución que contenga calcio en la MISMA línea — precipita. RINGER LACTATO y Hartmann están nombrados en el prospecto y no sirven ni para reconstituir.",
  "Fora do período neonatal, ceftriaxona e solução com cálcio podem ser dadas em SEQUÊNCIA, lavando a linha entre elas com SF 0,9% ou SG 5%.":
    "Fuera del período neonatal, ceftriaxona y solución con calcio pueden darse en SECUENCIA, lavando la línea entre ellas con SF 0,9% o SG 5%.",
  "⚠️ CONTRAINDICADA em neonato (≤ 28 dias) que precise de solução com cálcio, inclusive nutrição parenteral — risco de precipitação com desfecho fatal descrito.":
    "⚠️ CONTRAINDICADA en neonato (≤ 28 días) que necesite solución con calcio, incluida nutrición parenteral — riesgo de precipitación con desenlace fatal descrito.",
  "Profilaxia cirúrgica: 1 g IV em dose única, de ½ a 2 horas antes da incisão.":
    "Profilaxis quirúrgica: 1 g IV en dosis única, de ½ a 2 horas antes de la incisión.",
  "sem dose suplementar":
    "sin dosis suplementaria",
  "manter o esquema habitual":
    "mantener el esquema habitual",
  "⚠️ O label também registra reações neurológicas em disfunção renal GRAVE — algumas em quem não recebeu ajuste, outras em quem recebeu — e pede ajuste apropriado nesses casos. Convive, no mesmo documento, com o \"não é necessário ajuste\" da dosagem.":
    "⚠️ El prospecto también registra reacciones neurológicas en disfunción renal GRAVE — algunas en quien no recibió ajuste, otras en quien lo recibió — y pide ajuste apropiado en esos casos. Convive, en el mismo documento, con el \"no es necesario ajuste\" de la dosificación.",
  // ── VANCO: A TELA TERMINA EM CONDUTA (2026-08-22) ────────────────────────
  "Monitorização — é ela que decide":
    "Monitorización — es ella la que decide",
  "Alvo (recomendação formal — consenso 2020)":
    "Objetivo (recomendación formal — consenso 2020)",
  "AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). O vale isolado de 15–20 mcg/mL NÃO é mais recomendado como alvo em infecção grave por MRSA.":
    "AUC₂₄/MIC 400–600 mg·h/L (MIC 1: AUC mín 400). El valle aislado de 15–20 mcg/mL YA NO se recomienda como objetivo en infección grave por MRSA.",
  "A dose acima é só o começo":
    "La dosis de arriba es solo el comienzo",
  "COLHA NÍVEL e ajuste: a dose seguinte depende do que voltar, não desta faixa. A escada por clearance é operacionalização — prática aceita, não texto do consenso.":
    "TOME NIVEL y ajuste: la dosis siguiente depende de lo que vuelva, no de esta franja. La escalera por clearance es operacionalización — práctica aceptada, no texto del consenso.",
  "Se o serviço não dosa nível":
    "Si el servicio no mide nivel",
  "Isto é limitação REAL e muda a conduta: sem nível, a exposição não é conhecida — reavalie função renal com mais frequência e discuta com a farmácia clínica. A limitação fica escrita, não escondida.":
    "Es una limitación REAL y cambia la conducta: sin nivel, la exposición no se conoce — reevalúe función renal con más frecuencia y discuta con la farmacia clínica. La limitación queda escrita, no escondida.",
  "Ataque NÃO se ajusta":
    "La carga NO se ajusta",
  "A dose de ataque depende do volume de distribuição, não da eliminação: ela é a mesma em qualquer grau de disfunção renal. Só a manutenção acompanha o clearance.":
    "La dosis de carga depende del volumen de distribución, no de la eliminación: es la misma en cualquier grado de disfunción renal. Solo el mantenimiento acompaña el clearance.",
  "15–20 mg/kg após a sessão; dosar nível pré-diálise. ⚠️ O consenso 2020 tabela outros valores (25 mg/kg de ataque · 10 mg/kg de manutenção, após a sessão, dialisador de alta permeabilidade) e depende de duas coisas que esta tela não pergunta — permeabilidade do dialisador e se a dose é intra ou pós-sessão. Ver D-77.":
    "15–20 mg/kg tras la sesión; medir nivel prediálisis. ⚠️ El consenso 2020 tabula otros valores (25 mg/kg de carga · 10 mg/kg de mantenimiento, tras la sesión, dializador de alta permeabilidad) y depende de dos cosas que esta pantalla no pregunta — permeabilidad del dializador y si la dosis es intra o postsesión. Ver D-77.",
  "MDR: 2 g 8/8h em infusão de 3 h · meningite: 2 g 8/8h":
    "MDR: 2 g 8/8h en infusión de 3 h · meningitis: 2 g 8/8h",
  "MDR/meningite: 2 g 12/12h":
    "MDR/meningitis: 2 g 12/12h",
  // ── PIP-TAZO: AS DUAS COLUNAS DO LABEL (2026-08-22) ──────────────────────
  "Indicação (só para pip-tazo)":
    "Indicación (solo para pip-tazo)",
  "Outras indicações":
    "Otras indicaciones",
  "Pneumonia nosocomial":
    "Neumonía nosocomial",
  "Não sei — ver as duas":
    "No sé — ver las dos",
  "Piperacilina-tazobactam — a dose depende da INDICAÇÃO":
    "Piperacilina-tazobactam — la dosis depende de la INDICACIÓN",
  "O que mais o label diz":
    "Lo que más dice el prospecto",
  "2,25 g 12/12h (outras indicações) ou 2,25 g 8/8h (pneumonia nosocomial), MAIS 0,75 g após cada sessão — a hemodiálise remove 30% a 40% da dose.":
    "2,25 g 12/12h (otras indicaciones) o 2,25 g 8/8h (neumonía nosocomial), MÁS 0,75 g tras cada sesión — la hemodiálisis remueve 30% a 40% de la dosis.",
  "2,25 g 12/12h (outras) ou 2,25 g 8/8h (pneumonia). Sem dose adicional.":
    "2,25 g 12/12h (otras) o 2,25 g 8/8h (neumonía). Sin dosis adicional.",
  "O label descreve infusão de 30 minutos e NÃO tem seção de infusão prolongada. A infusão estendida de 4 h é prática, não está na bula — e por isso não aparece como se fosse dela.":
    "El prospecto describe infusión de 30 minutos y NO tiene sección de infusión prolongada. La infusión extendida de 4 h es práctica, no está en el prospecto — y por eso no aparece como si fuera de él.",
  "12/12h + 0,75 g após cada sessão":
    "12/12h + 0,75 g tras cada sesión",
  "3,375 g (outras indicações) · 4,5 g (pneumonia nosocomial)":
    "3,375 g (otras indicaciones) · 4,5 g (neumonía nosocomial)",
  "A hemodiálise remove 30% a 40% da dose administrada — daí os 0,75 g após cada sessão.":
    "La hemodiálisis remueve 30% a 40% de la dosis administrada — de ahí los 0,75 g tras cada sesión.",
  "Infusão estendida de 4 h em Pseudomonas: é PRÁTICA (maximiza tempo acima da CIM). O label descreve infusão de 30 minutos e não tem seção de infusão prolongada.":
    "Infusión extendida de 4 h en Pseudomonas: es PRÁCTICA (maximiza tiempo por encima de la CIM). El prospecto describe infusión de 30 minutos y no tiene sección de infusión prolongada.",
  "PNEUMONIA NOSOCOMIAL é a outra coluna do label: 4,5 g 6/6h acima de 40 · 3,375 g 6/6h entre 20 e 40 · 2,25 g 6/6h abaixo de 20 · hemodiálise 2,25 g 8/8h.":
    "NEUMONÍA NOSOCOMIAL es la otra columna del prospecto: 4,5 g 6/6h por encima de 40 · 3,375 g 6/6h entre 20 y 40 · 2,25 g 6/6h por debajo de 20 · hemodiálisis 2,25 g 8/8h.",
  "3,375 g IV 6/6h":
    "3,375 g IV 6/6h",
  "2,25 g IV 6/6h":
    "2,25 g IV 6/6h",
  "2,25 g IV 8/8h":
    "2,25 g IV 8/8h",
  "4,5 g IV 6/6h":
    "4,5 g IV 6/6h",
  // ── MEROPENÉM, CORRIGIDO CONTRA O LABEL (2026-08-22) ─────────────────────
  "1 g IV 8/8h (dose recomendada) — MDR: 2 g 8/8h infusão 3 h; meningite: 2 g 8/8h":
    "1 g IV 8/8h (dosis recomendada) — MDR: 2 g 8/8h infusión 3 h; meningitis: 2 g 8/8h",
  "1 g IV 12/12h (dose recomendada) — MDR/meningite: 2 g 12/12h":
    "1 g IV 12/12h (dosis recomendada) — MDR/meningitis: 2 g 12/12h",
  "500 mg IV 12/12h (METADE da dose recomendada)":
    "500 mg IV 12/12h (LA MITAD de la dosis recomendada)",
  "500 mg IV 24/24h (METADE da dose recomendada)":
    "500 mg IV 24/24h (LA MITAD de la dosis recomendada)",
  "dose recomendada": "dosis recomendada",
  "METADE da dose recomendada": "LA MITAD de la dosis recomendada",
  "dose recomendada (500 mg em cSSSI · 1 g em intra-abdominal)":
    "dosis recomendada (500 mg en cSSSI · 1 g en intraabdominal)",
  "É prontamente dialisável e efetivamente removido por hemodiálise (seção de superdosagem do label) — mas o label NÃO diz qual dose dar após a sessão.":
    "Es prontamente dializable y efectivamente removido por hemodiálisis (sección de sobredosis del label) — pero el label NO dice qué dosis dar tras la sesión.",
  "⚠️ O LABEL DIZ, TEXTUALMENTE, QUE A INFORMAÇÃO É INADEQUADA para hemodiálise e diálise peritoneal. Isto NÃO é \"não precisa ajustar\": é ausência de dose recomendada, declarada pela própria bula.":
    "⚠️ EL LABEL DICE, TEXTUALMENTE, QUE LA INFORMACIÓN ES INADECUADA para hemodiálisis y diálisis peritoneal. Esto NO es \"no necesita ajuste\": es ausencia de dosis recomendada, declarada por el propio prospecto.",
  "O label declara INFORMAÇÃO INADEQUADA para hemodiálise e diálise peritoneal — não é \"não precisa ajustar\". E declara, na superdosagem, que o meropeném é prontamente dialisável e removido por hemodiálise: a dose após a sessão não está no label.":
    "El label declara INFORMACIÓN INADECUADA para hemodiálisis y diálisis peritoneal — no es \"no necesita ajuste\". Y declara, en la sobredosis, que el meropenem es prontamente dializable y removido por hemodiálisis: la dosis tras la sesión no está en el label.",
  "hemodiálise intermitente": "hemodiálisis intermitente",
  "CVVHD/CVVHDF": "CVVHD/CVVHDF",
  "SLED": "SLED",
  "⚠️ SEM DADOS NO REPOSITÓRIO para esta modalidade. Isto é ausência DECLARADA, não \"não precisa ajustar\" — e aparece na tela como tal.":
    "⚠️ SIN DATOS EN EL REPOSITORIO para esta modalidad. Es ausencia DECLARADA, no \"no necesita ajuste\" — y aparece en la pantalla como tal.",
  "Abrir a bula/prescribing information do fármaco, seção de ajuste renal, e declarar a fonte DESTA faixa — com seção e ano. ⚠️ Referência terciária (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` com nome do produto e data de consulta, NUNCA como recomendação formal.":
    "Abrir el prospecto/prescribing information del fármaco, sección de ajuste renal, y declarar la fuente DE ESTA franja — con sección y año. ⚠️ Referencia terciaria (UpToDate, Sanford, Micromedex) entra como `pratica_aceita` con nombre del producto y fecha de consulta, NUNCA como recomendación formal.",
  "⚠️ SEM FONTE NO NÍVEL DA FAIXA — a ferramenta declarava «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para os dez cortes juntos":
    "⚠️ SIN FUENTE EN EL NIVEL DE LA FRANJA — la herramienta declaraba «ASHP/IDSA/SIDP 2020 (vanco AUC) · UpToDate 2024 / SBI 2022» para los diez cortes juntos",
};
