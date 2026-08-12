/**
 * Intoxicações exógenas — dicionário PT → ES.
 * Terminologia: toxíndrome, carbón activado, lavado gástrico, descontaminación,
 * centro de toxicología. "CIATox" (Brasil) adaptado a "centro de toxicología".
 */
export const ES_INTOXICACOES: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Estabilização primeiro — ABCDE": "Estabilización primero — ABCDE",
  "Identificar a síndrome tóxica (toxidrome)": "Identificar la síndrome tóxica (toxíndrome)",
  "Toxidrome opioide": "Toxíndrome opioide",
  "Toxidrome colinérgica (organofosforado/carbamato)":
    "Toxíndrome colinérgica (organofosforado/carbamato)",
  "Toxidrome anticolinérgica": "Toxíndrome anticolinérgica",
  "Toxidrome simpaticomimética (cocaína, anfetaminas)":
    "Toxíndrome simpaticomimética (cocaína, anfetaminas)",
  "Toxidrome sedativo-hipnótica": "Toxíndrome sedante-hipnótica",
  "Descontaminação gastrointestinal": "Descontaminación gastrointestinal",
  "Carvão ativado": "Carbón activado",
  "Antídotos específicos": "Antídotos específicos",
  "Necessita métodos de eliminação?": "¿Requiere métodos de eliminación?",
  "UTI — intoxicação grave": "UCI — intoxicación grave",
  "Observação": "Observación",
  "Intoxicações exógenas": "Intoxicaciones exógenas",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Qual conjunto de sinais predomina?": "¿Qué conjunto de signos predomina?",
  "A ingestão foi há menos de 1–2 horas, com via aérea protegida e substância adsorvível?":
    "¿La ingesta fue hace menos de 1–2 horas, con vía aérea protegida y sustancia adsorbible?",
  "Há intoxicação grave por substância dialisável ou acidose/insuficiência renal refratária?":
    "¿Hay intoxicación grave por una sustancia dializable o acidosis/insuficiencia renal refractaria?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Tratar o paciente, não o veneno. A maioria das mortes é por falha de via aérea e hipotensão.":
    "Tratar al paciente, no al veneno. La mayoría de las muertes se deben a falla de la vía aérea e hipotensión.",
  "Tríade: rebaixamento + miose puntiforme + depressão respiratória.":
    "Tríada: deterioro del sensorio + miosis puntiforme + depresión respiratoria.",
  "DUMBELS / broncorreia é a causa de morte — atropinizar até secar secreções.":
    "DUMBELS / la broncorrea es la causa de muerte — atropinizar hasta secar las secreciones.",
  "'Louco, seco, quente, vermelho e cego' — delirium com pele seca.":
    "'Loco, seco, caliente, rojo y ciego' — delirio con piel seca.",
  "Diferencia-se da anticolinérgica pela pele SUDOREBA (úmida).":
    "Se diferencia de la anticolinérgica por la piel SUDOROSA (húmeda).",
  "Rebaixamento com sinais vitais relativamente preservados. Suporte é a regra.":
    "Deterioro del sensorio con signos vitales relativamente conservados. El soporte es la regla.",
  "Melhor rendimento na primeira hora.": "Mayor rendimiento en la primera hora.",
  "Consultar dose e via conforme o tóxico identificado.":
    "Consultar la dosis y la vía según el tóxico identificado.",
  "Instabilidade, necessidade de antídoto contínuo, diálise ou ventilação.":
    "Inestabilidad, necesidad de antídoto continuo, diálisis o ventilación.",
  "Manter vigilância pelo tempo de risco da substância.":
    "Mantener la vigilancia durante el tiempo de riesgo de la sustancia.",

  // ── Opções ─────────────────────────────────────────────────────────────────
  "Opioide — miose, bradipneia, coma": "Opioide — miosis, bradipnea, coma",
  "Colinérgico — sialorreia, broncorreia, miose, bradicardia":
    "Colinérgico — sialorrea, broncorrea, miosis, bradicardia",
  "Anticolinérgico — midríase, pele seca, delirium, taquicardia":
    "Anticolinérgico — midriasis, piel seca, delirio, taquicardia",
  "Simpaticomimético — agitação, midríase, sudorese, hipertermia":
    "Simpaticomimético — agitación, midriasis, sudoración, hipertermia",
  "Sedativo/hipnótico — rebaixamento, sinais vitais preservados":
    "Sedante/hipnótico — deterioro del sensorio, signos vitales conservados",
  "Indefinido / substância conhecida": "Indefinido / sustancia conocida",
  "Sim — indicar carvão ativado": "Sí — indicar carbón activado",
  "Não / contraindicado": "No / contraindicado",
  "Sim — indicar hemodiálise/alcalinização": "Sí — indicar hemodiálisis/alcalinización",
  "Não": "No",
  "ISR — via aérea": "ISR — vía aérea",
  "Drogas vasoativas": "Drogas vasoactivas",
  "Correções eletrolíticas": "Correcciones electrolíticas",
  "Rebaixamento com risco de aspiração": "Deterioro del sensorio con riesgo de aspiración",
  "Choque refratário por cardiotóxico": "Choque refractario por cardiotóxico",
  "Distúrbios associados à intoxicação": "Trastornos asociados a la intoxicación",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "A toxidrome orienta o tratamento mesmo sem saber a substância exata.":
    "La toxíndrome orienta el tratamiento aun sin conocer la sustancia exacta.",
  "Avaliar: pupilas, pele (seca/úmida), ruídos hidroaéreos, temperatura, FC, PA e nível de consciência.":
    "Evaluar: pupilas, piel (seca/húmeda), ruidos hidroaéreos, temperatura, FC, PA y nivel de conciencia.",
  "Sempre dosar PARACETAMOL — intoxicação silenciosa e com antídoto tempo-dependente.":
    "Siempre medir PARACETAMOL — intoxicación silenciosa y con antídoto tiempo-dependiente.",
  "Carvão ativado é útil sobretudo na primeira hora; benefício cai muito depois.":
    "El carbón activado es útil sobre todo en la primera hora; el beneficio cae mucho después.",
  "NÃO adsorve: álcoois, lítio, ferro, hidrocarbonetos, ácidos/álcalis.":
    "NO adsorbe: alcoholes, litio, hierro, hidrocarburos, ácidos/álcalis.",
  "CONTRAINDICADO se via aérea desprotegida, íleo/obstrução, ou cáustico/hidrocarboneto (risco de aspiração e de piorar lesão).":
    "CONTRAINDICADO si la vía aérea está desprotegida, hay íleo/obstrucción, o se trata de un cáustico/hidrocarburo (riesgo de aspiración y de agravar la lesión).",
  "Lavagem gástrica: praticamente abandonada — só considerar em ingestão maciça e muito recente, com via aérea protegida.":
    "Lavado gástrico: prácticamente abandonado — considerarlo solo en una ingesta masiva y muy reciente, con la vía aérea protegida.",
  "Xarope de ipeca está PROSCRITO.": "El jarabe de ipecacuana está PROSCRITO.",
  "Dialisáveis (baixo peso molecular, baixa ligação proteica, pequeno volume de distribuição): metanol, etilenoglicol, lítio, salicilato, metformina (acidose láctica), teofilina, valproato em dose maciça.":
    "Dializables (bajo peso molecular, baja unión a proteínas, pequeño volumen de distribución): metanol, etilenglicol, litio, salicilato, metformina (acidosis láctica), teofilina, valproato en dosis masiva.",
  "Alcalinização urinária com bicarbonato: salicilato e fenobarbital.":
    "Alcalinización urinaria con bicarbonato: salicilato y fenobarbital.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Via aérea: rebaixamento com perda de reflexos protetores → via aérea definitiva (risco alto de broncoaspiração).":
    "Vía aérea: deterioro del sensorio con pérdida de los reflejos protectores → vía aérea definitiva (alto riesgo de broncoaspiración).",
  "Respiração: O₂, oximetria e capnografia; atenção à hipoventilação (opioides, sedativos).":
    "Respiración: O₂, oximetría y capnografía; atención a la hipoventilación (opioides, sedantes).",
  "Circulação: acesso venoso, monitor, ECG de 12 derivações (QRS e QT alargados indicam toxicidade específica).":
    "Circulación: acceso venoso, monitor, ECG de 12 derivaciones (QRS y QT prolongados indican toxicidad específica).",
  "GLICEMIA CAPILAR imediata — hipoglicemia é causa reversível de coma.":
    "GLUCEMIA CAPILAR inmediata — la hipoglucemia es una causa reversible de coma.",
  "Antídotos do coma: glicose 50% se hipoglicemia; tiamina 100 mg IV (etilista/desnutrido); naloxona 0,4–2 mg se depressão respiratória com miose.":
    "Antídotos del coma: dextrosa al 50% si hay hipoglucemia; tiamina 100 mg IV (alcohólico/desnutrido); naloxona 0,4–2 mg si hay depresión respiratoria con miosis.",
  "Temperatura: hipertermia grave (> 39–40 °C) exige resfriamento agressivo — é fator de mortalidade.":
    "Temperatura: la hipertermia grave (> 39–40 °C) exige enfriamiento agresivo — es un factor de mortalidad.",
  "Coletar: eletrólitos, função renal/hepática, gasometria com lactato, ânion gap, osmolaridade, paracetamol e salicilato, β-hCG.":
    "Tomar: electrolitos, función renal/hepática, gasometría con lactato, anión gap, osmolaridad, paracetamol y salicilato, β-hCG.",
  "Contatar o Centro de Informação Toxicológica (CIATox) — orientação especializada em tempo real.":
    "Contactar al centro de información toxicológica local — orientación especializada en tiempo real.",
  "Naloxona 0,4–2 mg IV/IM/intranasal — repetir a cada 2–3 min até resposta ventilatória (não até despertar completo).":
    "Naloxona 0,4–2 mg IV/IM/intranasal — repetir cada 2–3 min hasta obtener respuesta ventilatoria (no hasta el despertar completo).",
  "Titular para restaurar a VENTILAÇÃO, evitando abstinência aguda em usuário crônico (agitação, edema pulmonar).":
    "Titular para restaurar la VENTILACIÓN, evitando la abstinencia aguda en el usuario crónico (agitación, edema pulmonar).",
  "A meia-vida da naloxona é MENOR que a da maioria dos opioides — vigiar recorrência; considerar infusão contínua.":
    "La vida media de la naloxona es MENOR que la de la mayoría de los opioides — vigilar la recurrencia; considerar infusión continua.",
  "Ventilar com bolsa-válvula-máscara enquanto a naloxona não age.":
    "Ventilar con bolsa-válvula-mascarilla mientras la naloxona no hace efecto.",
  "Atenção a opioides de ação longa (metadona) e a fentanil/análogos (podem exigir doses altas).":
    "Atención a los opioides de acción prolongada (metadona) y al fentanilo/análogos (pueden requerir dosis altas).",
  "EPI para a equipe e DESCONTAMINAÇÃO EXTERNA (retirar roupas, lavar pele/cabelos) — risco de contaminação secundária.":
    "EPP para el equipo y DESCONTAMINACIÓN EXTERNA (retirar la ropa, lavar piel/cabello) — riesgo de contaminación secundaria.",
  "Atropina 2–4 mg IV, DOBRANDO a dose a cada 5–10 min até secar as secreções brônquicas.":
    "Atropina 2–4 mg IV, DUPLICANDO la dosis cada 5–10 min hasta secar las secreciones bronquiales.",
  "Endpoint da atropinização é a AUSCULTA PULMONAR LIMPA (secreções secas) — não a frequência cardíaca nem a pupila.":
    "El objetivo de la atropinización es la AUSCULTACIÓN PULMONAR LIMPIA (secreciones secas) — no la frecuencia cardíaca ni la pupila.",
  "Pralidoxima (2-PAM) 1–2 g IV em 15–30 min → infusão; indicada em organofosforado (reativa a colinesterase), idealmente nas primeiras 24–48 h.":
    "Pralidoxima (2-PAM) 1–2 g IV en 15–30 min → infusión; indicada en el organofosforado (reactiva la colinesterasa), idealmente en las primeras 24–48 h.",
  "Convulsões: benzodiazepínico (diazepam/midazolam).":
    "Convulsiones: benzodiacepina (diazepam/midazolam).",
  "Evitar succinilcolina na intubação (bloqueio prolongado pela inibição da colinesterase).":
    "Evitar la succinilcolina en la intubación (bloqueo prolongado por la inhibición de la colinesterasa).",
  "Suporte: benzodiazepínico para agitação; resfriamento ativo se hipertermia.":
    "Soporte: benzodiacepina para la agitación; enfriamiento activo si hay hipertermia.",
  "ECG obrigatório: se QRS > 100 ms (antidepressivo tricíclico) → bicarbonato de sódio 1–2 mEq/kg IV em bolus, repetir até estreitar o QRS.":
    "ECG obligatorio: si QRS > 100 ms (antidepresivo tricíclico) → bicarbonato de sodio 1–2 mEq/kg IV en bolo, repetir hasta estrechar el QRS.",
  "Fisostigmina 1–2 mg IV lento (em 5 min) apenas em delirium anticolinérgico PURO e com ECG normal — ter atropina pronta (risco de bradicardia/convulsão).":
    "Fisostigmina 1–2 mg IV lento (en 5 min) solo en el delirio anticolinérgico PURO y con ECG normal — tener atropina lista (riesgo de bradicardia/convulsión).",
  "CONTRAINDICADA a fisostigmina se houver suspeita de tricíclico (QRS alargado) — risco de assistolia.":
    "La fisostigmina está CONTRAINDICADA si se sospecha un tricíclico (QRS prolongado) — riesgo de asistolia.",
  "Sondagem vesical (retenção urinária é regra) e monitorização contínua.":
    "Sondaje vesical (la retención urinaria es la regla) y monitorización continua.",
  "BENZODIAZEPÍNICO é o tratamento de base — controla agitação, hipertensão, taquicardia e reduz a hipertermia.":
    "La BENZODIACEPINA es el tratamiento de base — controla la agitación, la hipertensión y la taquicardia, y reduce la hipertermia.",
  "Hipertermia grave: resfriamento agressivo imediato (é a principal causa de morte).":
    "Hipertermia grave: enfriamiento agresivo inmediato (es la principal causa de muerte).",
  "EVITAR betabloqueador isolado na cocaína (estimulação alfa sem oposição) — preferir benzodiazepínico e vasodilatador (nitrato/nitroprussiato).":
    "EVITAR el betabloqueante aislado en la cocaína (estimulación alfa sin oposición) — preferir benzodiacepina y vasodilatador (nitrato/nitroprusiato).",
  "Dor torácica por cocaína: benzodiazepínico + nitrato + AAS; ECG seriado (risco de infarto e dissecção).":
    "Dolor torácico por cocaína: benzodiacepina + nitrato + AAS; ECG seriado (riesgo de infarto y disección).",
  "Hidratação e vigilância de rabdomiólise (CPK, função renal) e convulsões.":
    "Hidratación y vigilancia de rabdomiólisis (CPK, función renal) y convulsiones.",
  "Suporte ventilatório — a maioria evolui bem apenas com proteção de via aérea e observação.":
    "Soporte ventilatorio — la mayoría evoluciona bien solo con protección de la vía aérea y observación.",
  "NÃO usar flumazenil se: uso crônico de benzodiazepínico, epilepsia, coingestão de tricíclico ou convulsão — risco de convulsão refratária.":
    "NO usar flumazenil si hay: uso crónico de benzodiacepinas, epilepsia, coingesta de tricíclico o convulsión — riesgo de convulsión refractaria.",
  "Álcool: descartar hipoglicemia, trauma craniano associado e abstinência; repor tiamina.":
    "Alcohol: descartar hipoglucemia, traumatismo craneal asociado y abstinencia; reponer tiamina.",
  "Reavaliar se o rebaixamento for desproporcional ou não melhorar — buscar coingestão e causas estruturais.":
    "Reevaluar si el deterioro del sensorio es desproporcionado o no mejora — buscar coingesta y causas estructurales.",
  "Carvão ativado 1 g/kg (adulto: 50 g) por via oral ou sonda gástrica.":
    "Carbón activado 1 g/kg (adulto: 50 g) por vía oral o sonda gástrica.",
  "Proteger a via aérea ANTES se houver rebaixamento — aspiração de carvão é grave.":
    "Proteger la vía aérea ANTES si hay deterioro del sensorio — la aspiración de carbón es grave.",
  "Doses múltiplas (0,5 g/kg a cada 4–6 h) em: carbamazepina, dapsona, fenobarbital, quinina e teofilina.":
    "Dosis múltiples (0,5 g/kg cada 4–6 h) en: carbamazepina, dapsona, fenobarbital, quinina y teofilina.",
  "Irrigação intestinal total (polietilenoglicol): considerar em ferro, lítio, liberação prolongada e 'body packers'.":
    "Irrigación intestinal total (polietilenglicol): considerar en hierro, litio, liberación prolongada y 'body packers'.",
  "Paracetamol → N-acetilcisteína: 150 mg/kg em 60 min → 50 mg/kg em 4 h → 100 mg/kg em 16 h. Iniciar precocemente (nomograma de Rumack-Matthew).":
    "Paracetamol → N-acetilcisteína: 150 mg/kg en 60 min → 50 mg/kg en 4 h → 100 mg/kg en 16 h. Iniciar precozmente (nomograma de Rumack-Matthew).",
  "Opioide → Naloxona 0,4–2 mg IV/IM/IN, repetir a cada 2–3 min.":
    "Opioide → Naloxona 0,4–2 mg IV/IM/intranasal, repetir cada 2–3 min.",
  "Benzodiazepínico → Flumazenil 0,2 mg IV (máx 1 mg) — com as ressalvas acima.":
    "Benzodiacepina → Flumazenil 0,2 mg IV (máx. 1 mg) — con las salvedades anteriores.",
  "Organofosforado → Atropina (dobrando até secar secreções) + Pralidoxima 1–2 g IV.":
    "Organofosforado → Atropina (duplicando hasta secar las secreciones) + Pralidoxima 1–2 g IV.",
  "Metanol/etilenoglicol → Fomepizol 15 mg/kg → 10 mg/kg 12/12 h; ou etanol. Hemodiálise precoce.":
    "Metanol/etilenglicol → Fomepizol 15 mg/kg → 10 mg/kg cada 12 h; o etanol. Hemodiálisis precoz.",
  "Betabloqueador → Glucagon 1–5 mg IV → 2–5 mg/h. Bloqueador de canal de cálcio → cálcio + insulina em altas doses (HIET: 1 U/kg bolus → 0,5 U/kg/h com glicose).":
    "Betabloqueante → Glucagón 1–5 mg IV → 2–5 mg/h. Bloqueante de los canales de calcio → calcio + insulina en altas dosis (HIET: 1 U/kg en bolo → 0,5 U/kg/h con dextrosa).",
  "Antidepressivo tricíclico (QRS > 100 ms) → Bicarbonato de sódio 1–2 mEq/kg IV em bolus.":
    "Antidepresivo tricíclico (QRS > 100 ms) → Bicarbonato de sodio 1–2 mEq/kg IV en bolo.",
  "Cianeto → Hidroxocobalamina 5 g IV em 15 min. Metemoglobinemia → Azul de metileno 1–2 mg/kg (contraindicado em deficiência de G6PD).":
    "Cianuro → Hidroxocobalamina 5 g IV en 15 min. Metahemoglobinemia → Azul de metileno 1–2 mg/kg (contraindicado en el déficit de G6PD).",
  "Digoxina → anticorpo antidigoxina. Isoniazida → Piridoxina (dose = dose ingerida, ou 5 g).":
    "Digoxina → anticuerpo antidigoxina. Isoniazida → Piridoxina (dosis = dosis ingerida, o 5 g).",
  "Varfarina → Vitamina K 10 mg + CCP 4 fatores. Dabigatrana → Idarucizumabe 5 g. Heparina → Protamina 1 mg/100 UI.":
    "Warfarina → Vitamina K 10 mg + CCP de 4 factores. Dabigatrán → Idarucizumab 5 g. Heparina → Protamina 1 mg/100 UI.",
  "Hemodiálise precoce quando indicada; alcalinização urinária no salicilato (alvo pH urinário 7,5–8).":
    "Hemodiálisis precoz cuando esté indicada; alcalinización urinaria en el salicilato (objetivo de pH urinario 7,5–8).",
  "Monitorização contínua de ECG (QRS/QT), temperatura, função renal e CPK (rabdomiólise).":
    "Monitorización continua de ECG (QRS/QT), temperatura, función renal y CPK (rabdomiólisis).",
  "Manter contato com o CIATox; reavaliar coingestões e repetir dosagens quando aplicável.":
    "Mantener contacto con el centro de toxicología; reevaluar coingestas y repetir las mediciones cuando corresponda.",
  "Avaliação psiquiátrica obrigatória em tentativa de autoextermínio, antes da alta.":
    "Evaluación psiquiátrica obligatoria en el intento de suicidio, antes del alta.",
  "Notificação compulsória conforme a legislação local.":
    "Notificación obligatoria según la legislación local.",
  "Observar por período compatível com a farmacocinética (liberação prolongada e ação longa exigem mais tempo).":
    "Observar durante un período acorde con la farmacocinética (las formas de liberación prolongada y de acción larga requieren más tiempo).",
  "Repetir ECG e exames conforme a substância; reavaliar paracetamol em 4 h da ingestão.":
    "Repetir el ECG y los exámenes según la sustancia; reevaluar el paracetamol a las 4 h de la ingesta.",
  "AVALIAÇÃO PSIQUIÁTRICA antes da alta em toda tentativa de autoextermínio.":
    "EVALUACIÓN PSIQUIÁTRICA antes del alta en todo intento de suicidio.",
  "Orientar acompanhante e retorno imediato se rebaixamento, vômitos, dor torácica ou convulsão.":
    "Instruir al acompañante y regreso inmediato si hay deterioro del sensorio, vómitos, dolor torácico o convulsión.",
  "ANTES DA DOSE, RESPONDA: quem deu o opioide? Não é a gravidade que separa os dois regimes — é a PROCEDÊNCIA. Opioide que a EQUIPE administrou, dose conhecida, paciente monitorizado → titulação fina, preservando analgesia. Opioide DESCONHECIDO, ou suspeita de fentanil e análogos → dose alta, repetição ou infusão. O mesmo paciente grave pode pertencer a qualquer um dos dois.": "ANTES DE LA DOSIS, RESPONDA: ¿quién administró el opioide? No es la gravedad lo que separa los dos regímenes — es la PROCEDENCIA. Opioide que el EQUIPO administró, dosis conocida, paciente monitorizado → titulación fina, preservando la analgesia. Opioide DESCONOCIDO, o sospecha de fentanilo y análogos → dosis alta, repetición o infusión. El mismo paciente grave puede pertenecer a cualquiera de los dos.",
  "Antídotos do coma: glicose 50% se hipoglicemia; tiamina 100 mg IV (etilista/desnutrido); naloxona se depressão respiratória com miose — a dose depende da PROCEDÊNCIA do opioide.": "Antídotos del coma: glucosa al 50% si hay hipoglucemia; tiamina 100 mg IV (etilista/desnutrido); naloxona si hay depresión respiratoria con miosis — la dosis depende de la PROCEDENCIA del opioide.",
  "DOSE ALTA (opioide desconhecido ou de alta afinidade). Dose inicial 0,4–2 mg IV, repetindo a cada 2–3 min. Fentanil, análogos e metadona exigem MAIS: doses de 0,4 mg ou menos podem não deslocar o opioide do receptor e ainda aumentar a chance de renarcotização — nesses casos são necessários mais de 2 mg, doses repetidas ou infusão contínua. Se não houver NENHUMA resposta após 10 mg no total, questionar o diagnóstico de intoxicação por opioide e procurar outra causa. Manter ventilação com bolsa-válvula-máscara enquanto a naloxona não age.": "DOSIS ALTA (opioide desconocido o de alta afinidad). Dosis inicial 0,4–2 mg IV, repitiendo cada 2–3 min. Fentanilo, análogos y metadona exigen MÁS: dosis de 0,4 mg o menos pueden no desplazar el opioide del receptor y aún aumentar la probabilidad de renarcotización — en esos casos se necesitan más de 2 mg, dosis repetidas o infusión continua. Si no hay NINGUNA respuesta tras 10 mg en total, cuestionar el diagnóstico de intoxicación por opioide y buscar otra causa. Mantener la ventilación con bolsa-válvula-mascarilla mientras la naloxona no actúa.",
  "Opioide → Naloxona: a dose depende da PROCEDÊNCIA do opioide, não da gravidade.": "Opioide → Naloxona: la dosis depende de la PROCEDENCIA del opioide, no de la gravedad.",
  "REVERSÃO TITULADA (opioide dado pela equipe). PREPARO: 1 ampola de 0,4 mg/1 mL + 9 mL de SF = 10 mL a 40 mcg/mL — assim 1 mL = 40 mcg e a titulação fica executável. Injetar 0,1–0,2 mg (2,5–5 mL) por vez, a cada 2–3 min, até VENTILAÇÃO adequada — não até despertar completo. O alvo é respirar, mantendo analgesia: a depressão respiratória cede com ocupação de receptor menor que a da analgesia. Em quem se quer evitar abstinência (dependência conhecida), começar mais baixo e escalonar de 0,04 mg (1 mL) em diante. Reversão abrupta devolve a dor de uma vez e provoca surto catecolaminérgico — a bula lista taquicardia, hipertensão, náusea, vômito, convulsão, arritmia e EDEMA PULMONAR entre as reações do pós-operatório.": "REVERSIÓN TITULADA (opioide administrado por el equipo). PREPARACIÓN: 1 ampolla de 0,4 mg/1 mL + 9 mL de SF = 10 mL a 40 mcg/mL — así 1 mL = 40 mcg y la titulación se vuelve ejecutable. Inyectar 0,1–0,2 mg (2,5–5 mL) por vez, cada 2–3 min, hasta VENTILACIÓN adecuada — no hasta el despertar completo. El objetivo es respirar, manteniendo la analgesia: la depresión respiratoria cede con una ocupación de receptor menor que la de la analgesia. En quien se quiere evitar la abstinencia (dependencia conocida), comenzar más bajo y escalonar desde 0,04 mg (1 mL). La reversión abrupta devuelve el dolor de golpe y provoca una descarga catecolaminérgica — el prospecto lista taquicardia, hipertensión, náusea, vómito, convulsión, arritmia y EDEMA PULMONAR entre las reacciones del posoperatorio.",
};
