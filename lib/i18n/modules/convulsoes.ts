/**
 * Crises convulsivas e mal epiléptico — dicionário PT → ES.
 * Terminologia: estado epiléptico (mal epiléptico), crisis, EEG continuo,
 * brote-supresión, posictal. Tokens de dose por peso preservados.
 */
export const ES_CONVULSOES: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Crise em atividade?": "¿Crisis en actividad?",
  "0–5 min · Estabilização simultânea": "0–5 min · Estabilización simultánea",
  "Peso do paciente": "Peso del paciente",
  "5–20 min · 1ª linha — BENZODIAZEPÍNICO": "5–20 min · 1.ª línea — BENZODIACEPINA",
  "Reavaliar após benzodiazepínico": "Reevaluar tras la benzodiacepina",
  "20–40 min · 2ª linha — antiepiléptico IV": "20–40 min · 2.ª línea — antiepiléptico IV",
  "Reavaliar após 2ª linha": "Reevaluar tras la 2.ª línea",
  "40–60 min · Refratário — anestésico + IOT":
    "40–60 min · Refractario — anestésico + intubación",
  "Crise cessou — investigar causa": "La crisis cesó — investigar la causa",
  "Suspeita de mal epiléptico não-convulsivo": "Sospecha de estado epiléptico no convulsivo",
  "Pós-ictal — investigação etiológica": "Posictal — investigación etiológica",
  "Definir destino": "Definir el destino",
  "Internação em UTI": "Ingreso en UCI",
  "Alta com seguimento": "Alta con seguimiento",
  "Crises convulsivas e mal epiléptico": "Crisis convulsivas y estado epiléptico",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "O paciente está convulsionando AGORA (crise motora em curso)?":
    "¿El paciente está convulsionando AHORA (crisis motora en curso)?",
  "A crise cessou após a(s) dose(s) de benzodiazepínico?":
    "¿La crisis cesó tras la(s) dosis de benzodiacepina?",
  "A crise cessou após o antiepiléptico de 2ª linha?":
    "¿La crisis cesó tras el antiepiléptico de 2.ª línea?",
  "O paciente recuperou plenamente a consciência em 20–30 min?":
    "¿El paciente recuperó plenamente la conciencia en 20–30 min?",
  "Há crise recorrente, causa aguda grave, déficit persistente ou necessidade de suporte?":
    "¿Hay crisis recurrente, causa aguda grave, déficit persistente o necesidad de soporte?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Fazer TUDO em paralelo enquanto prepara o benzodiazepínico.":
    "Hacer TODO en paralelo mientras se prepara la benzodiacepina.",
  "Dose ADEQUADA e única classe eficaz nesta fase. Subdosar é o erro mais comum.":
    "Dosis ADECUADA y única clase eficaz en esta fase. Subdosificar es el error más frecuente.",
  "Escolher UM. Nenhum é comprovadamente superior (ESETT) — decidir por comorbidade e disponibilidade.":
    "Elegir UNO. Ninguno demostró superioridad (ESETT) — decidir por comorbilidad y disponibilidad.",
  "Intubar e iniciar infusão contínua com EEG contínuo. Alvo: supressão de crises (ou surto-supressão).":
    "Intubar e iniciar la infusión continua con EEG continuo. Objetivo: supresión de las crisis (o patrón brote-supresión).",
  "Parou de convulsionar mas não desperta — assumir crise eletrográfica até prova em contrário.":
    "Dejó de convulsionar pero no despierta — asumir crisis electrográfica hasta demostrar lo contrario.",
  "Crise controlada: definir causa e risco de recorrência.":
    "Crisis controlada: definir la causa y el riesgo de recurrencia.",
  "Mal epiléptico refratário, rebaixamento persistente ou causa aguda grave.":
    "Estado epiléptico refractario, deterioro del sensorio persistente o causa aguda grave.",
  "Primeira crise isolada, exame neurológico normal e causa reversível tratada.":
    "Primera crisis aislada, examen neurológico normal y causa reversible tratada.",

  // ── Opções e campos ────────────────────────────────────────────────────────
  "Sim — crise em atividade": "Sí — crisis en actividad",
  "Não — crise já cessou (pós-ictal)": "No — la crisis ya cesó (posictal)",
  "Peso": "Peso",
  "50 kg": "50 kg",
  "60 kg": "60 kg",
  "70 kg": "70 kg",
  "80 kg": "80 kg",
  "90 kg": "90 kg",
  "100 kg": "100 kg",
  "Outro peso (kg)": "Otro peso (kg)",
  "Sim — crise cessou": "Sí — la crisis cesó",
  "Não — crise persiste (> 20 min)": "No — la crisis persiste (> 20 min)",
  "Não — refratário (> 40 min)": "No — refractario (> 40 min)",
  "Sim — recuperou a consciência": "Sí — recuperó la conciencia",
  "Não — consciência não recuperada": "No — no recuperó la conciencia",
  "ISR — via aérea": "ISR — vía aérea",
  "Sim — recorrência/causa grave/suporte": "Sí — recurrencia/causa grave/soporte",
  "Não — crise única, exame normal": "No — crisis única, examen normal",
  "Sedoanalgesia & BNM": "Sedoanalgesia y BNM",
  "Ventilação mecânica": "Ventilación mecánica",
  "Usado para calcular as doses das 2ª e 3ª linhas.":
    "Se usa para calcular las dosis de la 2.ª y 3.ª línea.",
  "Rebaixamento com risco de aspiração / necessidade de via aérea definitiva":
    "Deterioro del sensorio con riesgo de aspiración / necesidad de vía aérea definitiva",
  "Intubação para mal epiléptico refratário": "Intubación por estado epiléptico refractario",
  "Infusão contínua de midazolam/propofol": "Infusión continua de midazolam/propofol",
  "Parametrização pós-intubação": "Parametrización tras la intubación",

  // ── Evidência ──────────────────────────────────────────────────────────────
  "Mal epiléptico = crise ≥ 5 min OU crises recorrentes sem recuperação da consciência entre elas (AES 2016).":
    "Estado epiléptico = crisis ≥ 5 min O crisis recurrentes sin recuperación de la conciencia entre ellas (AES 2016).",
  "Não esperar 30 min: o tratamento começa aos 5 minutos de crise contínua.":
    "No esperar 30 min: el tratamiento comienza a los 5 minutos de crisis continua.",
  "Estabilização SEMPRE primeiro: via aérea, O₂, monitor, acesso, GLICEMIA CAPILAR.":
    "Estabilización SIEMPRE primero: vía aérea, O₂, monitor, acceso, GLUCEMIA CAPILAR.",
  "Avaliar clinicamente 5–10 min após a 2ª dose de benzodiazepínico.":
    "Evaluar clínicamente 5–10 min tras la 2.ª dosis de benzodiacepina.",
  "Atenção ao mal epiléptico NÃO-CONVULSIVO: parou de convulsionar mas não recupera a consciência → EEG urgente.":
    "Atención al estado epiléptico NO CONVULSIVO: dejó de convulsionar pero no recupera la conciencia → EEG urgente.",
  "Mal epiléptico REFRATÁRIO = persiste após benzodiazepínico + 1 antiepiléptico de 2ª linha.":
    "Estado epiléptico REFRACTARIO = persiste tras la benzodiacepina + 1 antiepiléptico de 2.ª línea.",
  "Refratário exige via aérea definitiva, UTI e EEG contínuo.":
    "El refractario exige vía aérea definitiva, UCI y EEG continuo.",
  "Não recuperar a consciência sugere MAL EPILÉPTICO NÃO-CONVULSIVO — indicação de EEG urgente.":
    "No recuperar la conciencia sugiere ESTADO EPILÉPTICO NO CONVULSIVO — indicación de EEG urgente.",
  "Sempre buscar a causa: metabólica, infecciosa, estrutural, tóxica, abstinência ou má aderência.":
    "Siempre buscar la causa: metabólica, infecciosa, estructural, tóxica, abstinencia o mala adherencia.",
  "Alta é possível na primeira crise ISOLADA com exame neurológico normal, causa identificada/reversível e retorno garantido.":
    "El alta es posible en la primera crisis AISLADA con examen neurológico normal, causa identificada/reversible y regreso garantizado.",
  "Mal epiléptico (qualquer fase) sempre interna.":
    "El estado epiléptico (en cualquier fase) siempre requiere internación.",

  // ── Ações ──────────────────────────────────────────────────────────────────
  "Via aérea: posicionar, aspirar, O₂ suplementar (máscara). NÃO forçar cânula na boca durante a crise.":
    "Vía aérea: posicionar, aspirar, O₂ suplementario (mascarilla). NO forzar una cánula en la boca durante la crisis.",
  "Monitor: oximetria, PA, ECG contínuo. Acesso venoso calibroso (2 se possível).":
    "Monitor: oximetría, PA, ECG continuo. Acceso venoso grueso (2 si es posible).",
  "GLICEMIA CAPILAR IMEDIATA — se < 60 mg/dL: glicose 50% 50 mL IV + tiamina 100 mg IV (antes da glicose em etilista/desnutrido).":
    "GLUCEMIA CAPILAR INMEDIATA — si < 60 mg/dL: dextrosa al 50% 50 mL IV + tiamina 100 mg IV (antes de la dextrosa en el paciente alcohólico/desnutrido).",
  "Coletar: eletrólitos (Na, Ca, Mg), função renal/hepática, hemograma, gasometria, níveis de antiepilépticos, β-hCG, toxicológico.":
    "Tomar: electrolitos (Na, Ca, Mg), función renal/hepática, hemograma, gasometría, niveles de antiepilépticos, β-hCG, toxicológico.",
  "Cronometrar a crise — o tempo define a escalada terapêutica.":
    "Cronometrar la crisis — el tiempo define el escalamiento terapéutico.",
  "Proteger o paciente de trauma; não conter à força; decúbito lateral se possível.":
    "Proteger al paciente de traumatismos; no contenerlo por la fuerza; decúbito lateral si es posible.",
  "COM acesso IV — Diazepam {diazepamIv} mg IV (0,15–0,2 mg/kg, máx 10 mg) a 5 mg/min; pode repetir 1×.":
    "CON acceso IV — Diazepam {diazepamIv} mg IV (0,15–0,2 mg/kg, máx. 10 mg) a 5 mg/min; puede repetirse 1×.",
  "COM acesso IV (alternativa preferida) — Lorazepam 4 mg IV (0,1 mg/kg, máx 4 mg) a 2 mg/min; pode repetir 1× em 5 min.":
    "CON acceso IV (alternativa preferida) — Lorazepam 4 mg IV (0,1 mg/kg, máx. 4 mg) a 2 mg/min; puede repetirse 1× a los 5 min.",
  "SEM acesso IV — Midazolam {midazolamIm} mg IM (0,2 mg/kg, máx 10 mg) — via IM é tão eficaz quanto IV (estudo RAMPART).":
    "SIN acceso IV — Midazolam {midazolamIm} mg IM (0,2 mg/kg, máx. 10 mg) — la vía IM es tan eficaz como la IV (estudio RAMPART).",
  "Alternativas sem IV: midazolam intranasal ou bucal 10 mg; diazepam retal 0,2–0,5 mg/kg.":
    "Alternativas sin IV: midazolam intranasal o bucal 10 mg; diazepam rectal 0,2–0,5 mg/kg.",
  "Repetir o benzodiazepínico UMA vez se a crise persistir após 5 min.":
    "Repetir la benzodiacepina UNA vez si la crisis persiste tras 5 min.",
  "Vigiar depressão respiratória e hipotensão — ter material de via aérea pronto.":
    "Vigilar la depresión respiratoria y la hipotensión — tener listo el material de vía aérea.",
  "Levetiracetam {levetiracetam} mg IV (60 mg/kg, máx 4.500 mg) em 10 min — melhor perfil de segurança, sem interações; 1ª opção na maioria.":
    "Levetiracetam {levetiracetam} mg IV (60 mg/kg, máx. 4.500 mg) en 10 min — mejor perfil de seguridad, sin interacciones; 1.ª opción en la mayoría.",
  "Valproato {valproato} mg IV (40 mg/kg, máx 3.000 mg) em 10 min — EVITAR em hepatopatia, gestante e suspeita de doença mitocondrial.":
    "Valproato {valproato} mg IV (40 mg/kg, máx. 3.000 mg) en 10 min — EVITAR en hepatopatía, embarazo y sospecha de enfermedad mitocondrial.",
  "Fenitoína {fenitoina} mg IV (20 mg/kg) em velocidade ≤ 50 mg/min (≤ 25 mg/min se idoso/cardiopata) — monitor obrigatório: hipotensão e arritmia. Diluir SÓ em soro fisiológico.":
    "Fenitoína {fenitoina} mg IV (20 mg/kg) a una velocidad ≤ 50 mg/min (≤ 25 mg/min si es anciano/cardiópata) — monitor obligatorio: hipotensión y arritmia. Diluir SOLO en solución fisiológica.",
  "Fosfenitoína 20 mg PE/kg IV a 150 mg PE/min — preferível à fenitoína (menos flebite/hipotensão), se disponível.":
    "Fosfenitoína 20 mg EF/kg IV a 150 mg EF/min — preferible a la fenitoína (menos flebitis/hipotensión), si está disponible.",
  "Lacosamida {lacosamida} mg IV (5 mg/kg, máx 400 mg) em 15 min — alternativa com pouca interação.":
    "Lacosamida {lacosamida} mg IV (5 mg/kg, máx. 400 mg) en 15 min — alternativa con pocas interacciones.",
  "Manter monitorização hemodinâmica contínua durante a infusão.":
    "Mantener la monitorización hemodinámica continua durante la infusión.",
  "INTUBAR (sequência rápida) — via aérea definitiva é obrigatória nesta fase. Ver módulo ISR.":
    "INTUBAR (secuencia rápida) — la vía aérea definitiva es obligatoria en esta fase. Ver el módulo ISR.",
  "Midazolam: bolus {midazolamBolus} mg (0,2 mg/kg) → infusão 0,05–2 mg/kg/h. Titular até cessar crises.":
    "Midazolam: bolo {midazolamBolus} mg (0,2 mg/kg) → infusión 0,05–2 mg/kg/h. Titular hasta que cesen las crisis.",
  "Propofol: bolus {propofolBolus} mg (2 mg/kg) → infusão 1–10 mg/kg/h. Vigiar síndrome de infusão do propofol (dose alta/prolongada).":
    "Propofol: bolo {propofolBolus} mg (2 mg/kg) → infusión 1–10 mg/kg/h. Vigilar el síndrome de infusión de propofol (dosis alta/prolongada).",
  "Tiopental/pentobarbital {tiopental} mg (3–5 mg/kg) → infusão 1–5 mg/kg/h — última linha; hipotensão e imunossupressão.":
    "Tiopental/pentobarbital {tiopental} mg (3–5 mg/kg) → infusión 1–5 mg/kg/h — última línea; hipotensión e inmunosupresión.",
  "EEG CONTÍNUO obrigatório — alvo: cessação de crises eletrográficas ou padrão surto-supressão por 24–48 h.":
    "EEG CONTINUO obligatorio — objetivo: cese de las crisis electrográficas o patrón brote-supresión durante 24–48 h.",
  "Manter antiepiléptico de manutenção em paralelo; vasopressor se hipotensão pela sedação.":
    "Mantener el antiepiléptico de mantenimiento en paralelo; vasopresor si hay hipotensión por la sedación.",
  "Investigar causa estrutural/inflamatória: TC de crânio, punção lombar, autoanticorpos.":
    "Investigar la causa estructural/inflamatoria: TC de cráneo, punción lumbar, autoanticuerpos.",
  "Glicemia, eletrólitos (Na, Ca, Mg), função renal e hepática, hemograma, PCR, β-hCG.":
    "Glucemia, electrolitos (Na, Ca, Mg), función renal y hepática, hemograma, PCR, β-hCG.",
  "Nível sérico do antiepiléptico se já em uso (má aderência é causa frequente).":
    "Nivel sérico del antiepiléptico si ya lo usa (la mala adherencia es una causa frecuente).",
  "TC de crânio: primeira crise, trauma, febre, imunossupressão, anticoagulação, déficit focal ou não recuperação plena.":
    "TC de cráneo: primera crisis, trauma, fiebre, inmunosupresión, anticoagulación, déficit focal o falta de recuperación plena.",
  "Punção lombar se febre/meningismo/imunossupressão (após TC quando indicada).":
    "Punción lumbar si hay fiebre/meningismo/inmunosupresión (tras la TC cuando esté indicada).",
  "Toxicológico e história de abstinência (álcool, BZD) — abstinência alcoólica: benzodiazepínico é o tratamento.":
    "Toxicológico e historia de abstinencia (alcohol, benzodiacepinas) — en la abstinencia alcohólica, la benzodiacepina es el tratamiento.",
  "Rever gatilhos: privação de sono, infecção, fármacos que reduzem limiar convulsivo.":
    "Revisar los desencadenantes: privación de sueño, infección, fármacos que bajan el umbral convulsivo.",
  "EEG urgente/contínuo — não adiar o tratamento aguardando o exame.":
    "EEG urgente/continuo — no posponer el tratamiento esperando el estudio.",
  "Manter/escalar antiepiléptico; considerar 2ª linha se ainda não feita.":
    "Mantener/escalar el antiepiléptico; considerar la 2.ª línea si aún no se administró.",
  "TC de crânio e punção lombar conforme suspeita; rever fármacos e distúrbios metabólicos.":
    "TC de cráneo y punción lumbar según la sospecha; revisar fármacos y trastornos metabólicos.",
  "Internação em UTI com monitorização neurológica.":
    "Ingreso en UCI con monitorización neurológica.",
  "EEG contínuo até controle das crises eletrográficas; manter antiepiléptico de manutenção.":
    "EEG continuo hasta controlar las crisis electrográficas; mantener el antiepiléptico de mantenimiento.",
  "Suporte ventilatório e hemodinâmico; evitar hipotensão (piora a lesão neuronal).":
    "Soporte ventilatorio y hemodinámico; evitar la hipotensión (empeora la lesión neuronal).",
  "Corrigir a causa: infecção, distúrbio metabólico, lesão estrutural, intoxicação/abstinência.":
    "Corregir la causa: infección, trastorno metabólico, lesión estructural, intoxicación/abstinencia.",
  "Normotermia, normoglicemia e profilaxia de TVP.":
    "Normotermia, normoglucemia y profilaxis de TVP.",
  "Orientar acompanhante sobre o que fazer numa nova crise (decúbito lateral, não conter, cronometrar, procurar emergência se > 5 min).":
    "Instruir al acompañante sobre qué hacer ante una nueva crisis (decúbito lateral, no contener, cronometrar, buscar emergencia si dura > 5 min).",
  "Restrição de direção conforme legislação local; evitar altura, natação sozinho e máquinas.":
    "Restricción para conducir según la legislación local; evitar alturas, nadar solo y operar maquinaria.",
  "Encaminhar à neurologia; discutir início de antiepiléptico (nem toda 1ª crise exige).":
    "Derivar a neurología; discutir el inicio de un antiepiléptico (no toda 1.ª crisis lo requiere).",
  "Retorno imediato se nova crise, cefaleia progressiva, febre ou déficit focal.":
    "Regreso inmediato si hay una nueva crisis, cefalea progresiva, fiebre o déficit focal.",
};
