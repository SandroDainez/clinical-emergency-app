/**
 * Espanhol (es-419) — módulo AVC HEMORRÁGICO (HIC + HSA).
 *
 * Cobre `avc/conteudo/hemorragia-intracerebral.ts`,
 * `avc/conteudo/hemorragia-subaracnoidea.ts`, os slots H-nn/S-nn de
 * `avc/conteudo/fontes.ts`, as duas superfícies-destino de `superficies.ts` e a
 * tela `components/avc/superficie-hemorragica.tsx` (PD-36).
 *
 * ⚠️⚠️ O QUE ⛔ NÃO ENTRA AQUI: o **verbatim** das diretrizes. Ele permanece em
 * inglês, no idioma da publicação, porque é a evidência auditável (§6.14, E-30).
 * Traduzir verbatim destruiria a rastreabilidade. Só a **formulação** — a frase
 * clínica de apresentação — é traduzida.
 *
 * ── ⚠️ TERMOS QUE ⛔ NÃO SE TRADUZEM POR APROXIMAÇÃO ─────────────────────────
 *
 *   · **"não beneficia" ⛔ não é "no se recomienda"** — é COR 3: *No Benefit*, que
 *     diz que o tratamento **foi estudado e ⛔ não trouxe benefício**. "No se
 *     recomienda" soaria como ausência de estudo.
 *   · **"potencialmente danoso" ⛔ não é "no recomendado"** — é COR 3: *Harm*.
 *     Suavizar apagaria a fronteira entre ⛔ não fazer e **fazer mal**.
 *   · **glicemia → glucemia** (⛔ não "glicemia"): o dígrafo PT ⛔ não existe em ES,
 *     e a trava de tela em espanhol cobra exatamente isso.
 */
export const ES_AVC_HEMORRAGICO: Record<string, string> = {
  // ── Cromado da tela ────────────────────────────────────────────────────────
  "Nível": "Nivel",
  "Abrir o manejo de hemorragia intracerebral": "Abrir el manejo de hemorragia intracerebral",
  "Abrir o manejo de hemorragia subaracnóidea": "Abrir el manejo de hemorragia subaracnoidea",
  "Situação atual": "Situación actual",
  "Conduta": "Conducta",
  "Próxima ação": "Próxima acción",
  "Pendências": "Pendientes",
  "administrada": "administrada",
  "indicada": "indicada",
  "Contraindicação absoluta": "Contraindicación absoluta",
  "Contraindicação relativa": "Contraindicación relativa",
  "Desconhecido": "Desconocido",
  "Verificado": "Verificado",

  /* ── Rótulos clínicos e ações pendentes (avc/conteudo/rotulos-clinicos.ts) ──
   * ⚠️ A AÇÃO mantém o VERBO em espanhol: "Definir…", "Registrar…". ⛔ Traduzir
   * por substantivo devolveria a pendência sem verbo que E-26 proíbe. */
  "Aferir a pressão arterial": "Medir la presión arterial",
  "Agente em consideração": "Agente en consideración",
  "Ausência de efeito de massa": "Ausencia de efecto de masa",
  "Confirmar uso recente de anticoagulante": "Confirmar uso reciente de anticoagulante",
  "DWI menor que um terço do território": "DWI menor que un tercio del territorio",
  "Definir a elegibilidade à trombectomia": "Definir la elegibilidad para la trombectomía",
  "Definir se o déficit é incapacitante": "Definir si el déficit es incapacitante",
  "Definir se o déficit é leve e não incapacitante":
    "Definir si el déficit es leve y no incapacitante",
  "Déficit leve e não incapacitante": "Déficit leve y no incapacitante",
  "Déficit neurológico focal": "Déficit neurológico focal",
  "Escolher o agente trombolítico em consideração":
    "Elegir el agente trombolítico en consideración",
  "FLAIR sem alteração marcada": "FLAIR sin alteración marcada",
  "Inelegibilidade à trombectomia": "Inelegibilidad para la trombectomía",
  "Informar a última vez visto bem": "Informar la última vez visto bien",
  "Informar o horário de chegada": "Informar la hora de llegada",
  "Penumbra por perfusão automatizada": "Penumbra por perfusión automatizada",
  "Penumbra salvável": "Penumbra salvable",
  "Registrar a extensão na DWI": "Registrar la extensión en la DWI",
  "Registrar a funcionalidade prévia (mRS)": "Registrar la funcionalidad previa (mRS)",
  "Registrar a perfusão automatizada": "Registrar la perfusión automatizada",
  "Registrar o ASPECTS do laudo": "Registrar el ASPECTS del informe",
  "Registrar o FLAIR": "Registrar el FLAIR",
  "Registrar o NIHSS": "Registrar el NIHSS",
  "Registrar o pc-ASPECTS do laudo": "Registrar el pc-ASPECTS del informe",
  "Registrar o sítio da oclusão": "Registrar el sitio de la oclusión",
  "Registrar se há efeito de massa na imagem": "Registrar si hay efecto de masa en la imagen",
  "Registrar se há penumbra salvável": "Registrar si hay penumbra salvable",
  "Responder se há suspeita de hemorragia subaracnóidea":
    "Responder si hay sospecha de hemorragia subaracnoidea",
  "Resultado da imagem": "Resultado de la imagen",
  "Uso de anticoagulante": "Uso de anticoagulante",
  "Todos os itens": "Todos los ítems",
  "Ver todos": "Ver todos",
  "Voltar ao item": "Volver al ítem",
  "Item anterior": "Ítem anterior",
  "Há hemorragia intracraniana?": "¿Hay hemorragia intracraneal?",
  "Ver o contexto completo do paciente": "Ver el contexto completo del paciente",
  "Bloqueio clínico": "Bloqueo clínico",
  "População": "Población",
  "Ver fonte": "Ver fuente",
  "Ocultar fonte": "Ocultar fuente",
  "Ver o texto-fonte desta recomendação": "Ver el texto fuente de esta recomendación",
  "Reversão por agente": "Reversión por agente",
  "Abrir recomendações": "Abrir recomendaciones",
  "Abrir o catálogo de recomendações deste módulo":
    "Abrir el catálogo de recomendaciones de este módulo",
  "Sair do módulo e voltar para a lista": "Salir del módulo y volver a la lista",
  "‹ Módulos": "‹ Módulos",

  // ── Rótulos de classe (COR) ────────────────────────────────────────────────
  "Recomendado": "Recomendado",
  "Razoável": "Razonable",
  "Pode ser considerado": "Puede considerarse",
  "Sem benefício": "Sin beneficio",
  "Potencialmente danoso": "Potencialmente dañino",
  "COR 3: No Benefit": "COR 3: No Benefit",

  // ── Superfícies-destino ────────────────────────────────────────────────────
  "AVC hemorrágico (HIC)": "ACV hemorrágico (HIC)",
  "Adulto com hemorragia intracerebral espontânea":
    "Adulto con hemorragia intracerebral espontánea",
  "Adulto com hemorragia subaracnóidea aneurismática":
    "Adulto con hemorragia subaracnoidea aneurismática",
  "Hemorragia subaracnóidea (HSA)": "Hemorragia subaracnoidea (HSA)",
  "Recomendações da diretriz de hemorragia intracerebral espontânea.":
    "Recomendaciones de la guía de hemorragia intracerebral espontánea.",
  "Recomendações da diretriz de HSA aneurismática.":
    "Recomendaciones de la guía de HSA aneurismática.",
  "Catálogo de recomendações da diretriz de HIC. A decisão final é do profissional.":
    "Catálogo de recomendaciones de la guía de HIC. La decisión final es del profesional.",
  "Catálogo de recomendações da diretriz de HSA. A decisão final é do profissional.":
    "Catálogo de recomendaciones de la guía de HSA. La decisión final es del profesional.",

  // ── Slots de fonte (fontes.ts) ─────────────────────────────────────────────
  "HIC · PA aguda — meta e alvo pressórico": "HIC · PA aguda — meta y objetivo de presión",
  "HIC · Reversão de anticoagulação por agente + doses":
    "HIC · Reversión de anticoagulación por agente + dosis",
  "HIC · Hemorragia associada a antiplaquetário":
    "HIC · Hemorragia asociada a antiagregante plaquetario",
  "HIC · Hemostáticos gerais (rFVIIa, TXA)": "HIC · Hemostáticos generales (rFVIIa, TXA)",
  "HIC · Glicemia — monitorização e alvos": "HIC · Glucemia — monitorización y objetivos",
  "HIC · Convulsões e antiepilépticos": "HIC · Convulsiones y antiepilépticos",
  "HIC · Local de cuidado e transferência": "HIC · Lugar de atención y traslado",
  "HIC · Prevenção secundária (PA, antitrombóticos)":
    "HIC · Prevención secundaria (PA, antitrombóticos)",
  "HIC · Predição de desfecho e metas de cuidado":
    "HIC · Predicción de desenlace y metas de atención",
  "HSA · Ressangramento (PA, reversão, antifibrinolítico)":
    "HSA · Resangrado (PA, reversión, antifibrinolítico)",
  "HSA · Tratamento do aneurisma (<24 h, modalidade)":
    "HSA · Tratamiento del aneurisma (<24 h, modalidad)",
  "HSA · Monitorização de vasoespasmo/DCI": "HSA · Monitorización de vasoespasmo/DCI",
  "HSA · Convulsões (fenitoína COR 3: Harm)": "HSA · Convulsiones (fenitoína COR 3: Harm)",
  "HSA · Complicações (volume, TEV, glicemia)": "HSA · Complicaciones (volumen, TEV, glucemia)",
  "HSA · Sistemas de cuidado e transferência": "HSA · Sistemas de atención y traslado",

  /* ══════════════════════════════════════════════════════════════════════════
   * HIC · TEMAS E RESUMOS
   * ════════════════════════════════════════════════════════════════════════ */
  "Pressão arterial aguda": "Presión arterial aguda",
  "Alvo 140 mmHg mantendo faixa 130 a 150 na HIC leve a moderada com PAS 150 a 220. Descer abaixo de 130 é potencialmente danoso.":
    "Objetivo 140 mmHg manteniendo el rango de 130 a 150 en la HIC leve a moderada con PAS de 150 a 220. Bajar por debajo de 130 es potencialmente dañino.",
  "Suspender o anticoagulante imediatamente e reverter o mais rápido possível. O agente de reversão depende do anticoagulante em uso.":
    "Suspender el anticoagulante de inmediato y revertir lo más rápido posible. El agente de reversión depende del anticoagulante en uso.",
  "Suspender o anticoagulante e reverter o mais rápido possível. O agente depende do anticoagulante em uso.":
    "Suspender el anticoagulante y revertir lo más rápido posible. El agente depende del anticoagulante en uso.",
  "Uso de antiplaquetário": "Uso de antiagregante plaquetario",
  "Transfusão de plaquetas na HIC por aspirina fora de neurocirurgia de emergência é potencialmente danosa.":
    "La transfusión de plaquetas en la HIC por aspirina fuera de la neurocirugía de emergencia es potencialmente dañina.",
  "PIC, edema e drenagem": "PIC, edema y drenaje",
  "Drenagem ventricular para hidrocefalia com rebaixamento. Osmoterapia em bolus para reduzir PIC transitoriamente. Corticoide não deve ser usado.":
    "Drenaje ventricular para la hidrocefalia con deterioro de la conciencia. Osmoterapia en bolo para reducir la PIC transitoriamente. El corticoide no debe usarse.",
  "Cirurgia": "Cirugía",
  "Cerebelar com deterioração, compressão de tronco/hidrocefalia ou volume ≥15 mL: remoção cirúrgica imediata (COR 1). Supratentorial e HIV têm indicações mais fracas.":
    "Cerebelosa con deterioro, compresión del tronco encefálico/hidrocefalia o volumen ≥15 mL: extirpación quirúrgica inmediata (COR 1). La supratentorial y la HIV tienen indicaciones más débiles.",
  "Convulsões": "Convulsiones",
  "Tratar convulsão clínica ou eletrográfica confirmada. Profilaxia antiepiléptica sem crise não beneficia.":
    "Tratar la convulsión clínica o electrográfica confirmada. La profilaxis antiepiléptica sin crisis no aporta beneficio.",
  "Suporte clínico": "Soporte clínico",
  "Glicemia, temperatura e profilaxia de TEV. Compressão pneumática intermitente desde o diagnóstico; meias de compressão isoladas não beneficiam.":
    "Glucemia, temperatura y profilaxis de TEV. Compresión neumática intermitente desde el diagnóstico; las medias de compresión aisladas no aportan beneficio.",
  "Hemostáticos gerais": "Hemostáticos generales",
  "Nem fator VIIa recombinante nem ácido tranexâmico têm eficácia estabelecida na HIC.":
    "Ni el factor VIIa recombinante ni el ácido tranexámico tienen eficacia establecida en la HIC.",
  "Destino e prevenção secundária": "Destino y prevención secundaria",
  "Unidade especializada com equipe multidisciplinar. Estabilizar antes de transferir. Alvo pressórico de longo prazo PAS 130 / PAD 80.":
    "Unidad especializada con equipo multidisciplinario. Estabilizar antes de trasladar. Objetivo de presión a largo plazo PAS 130 / PAD 80.",

  /* ── HIC · formulações ──────────────────────────────────────────────────── */
  "Na HIC leve a moderada com PAS entre 150 e 220 mmHg, baixar a PAS para um alvo de 140 mmHg, mantendo a faixa de 130 a 150 mmHg, é seguro e pode ser razoável.":
    "En la HIC leve a moderada con PAS entre 150 y 220 mmHg, bajar la PAS a un objetivo de 140 mmHg, manteniendo el rango de 130 a 150 mmHg, es seguro y puede ser razonable.",
  "Titular com cuidado para um controle contínuo, suave e sustentado, evitando picos e grande variabilidade da PAS.":
    "Titular con cuidado para lograr un control continuo, suave y sostenido, evitando picos y gran variabilidad de la PAS.",
  "Iniciar o tratamento dentro de 2 horas do início e atingir o alvo dentro de 1 hora pode reduzir a expansão do hematoma.":
    "Iniciar el tratamiento dentro de las 2 horas del inicio y alcanzar el objetivo dentro de 1 hora puede reducir la expansión del hematoma.",
  "Na HIC grande ou grave, ou que exige descompressão cirúrgica, a segurança e a eficácia do controle intensivo da PA não estão bem estabelecidas.":
    "En la HIC grande o grave, o que exige descompresión quirúrgica, la seguridad y la eficacia del control intensivo de la PA no están bien establecidas.",
  "Na HIC leve a moderada com PAS acima de 150 mmHg, baixar a PAS para menos de 130 mmHg é potencialmente danoso.":
    "En la HIC leve a moderada con PAS por encima de 150 mmHg, bajar la PAS a menos de 130 mmHg es potencialmente dañino.",
  "Na HIC associada a anticoagulante, suspender o anticoagulante imediatamente e reverter o mais rápido possível, para melhorar a sobrevida.":
    "En la HIC asociada a anticoagulante, suspender el anticoagulante de inmediato y revertir lo más rápido posible, para mejorar la supervivencia.",
  "Na HIC por varfarina, administrar vitamina K IV logo após a reposição de fatores (PCC), para evitar reelevação do INR.":
    "En la HIC por warfarina, administrar vitamina K IV inmediatamente después de la reposición de factores (PCC), para evitar la reelevación del INR.",
  "Na HIC por aspirina que exige neurocirurgia de emergência, transfusão de plaquetas pode ser considerada.":
    "En la HIC por aspirina que exige neurocirugía de emergencia, puede considerarse la transfusión de plaquetas.",
  "Na HIC por aspirina SEM cirurgia de emergência programada, transfusão de plaquetas é potencialmente danosa e não deve ser feita.":
    "En la HIC por aspirina SIN cirugía de emergencia programada, la transfusión de plaquetas es potencialmente dañina y no debe realizarse.",
  "Na HIC ou HIV com hidrocefalia contribuindo para rebaixamento de consciência, fazer drenagem ventricular para reduzir mortalidade.":
    "En la HIC o HIV con hidrocefalia que contribuye al deterioro del nivel de conciencia, realizar drenaje ventricular para reducir la mortalidad.",
  "Osmoterapia em bolus pode ser considerada para reduzir a PIC transitoriamente.":
    "La osmoterapia en bolo puede considerarse para reducir la PIC transitoriamente.",
  "A osmoterapia profilática precoce não tem eficácia bem estabelecida.":
    "La osmoterapia profiláctica precoz no tiene eficacia bien establecida.",
  "Na HIC ou HIV moderada a grave com rebaixamento, monitorização e tratamento da PIC podem ser considerados.":
    "En la HIC o HIV moderada a grave con deterioro de la conciencia, pueden considerarse la monitorización y el tratamiento de la PIC.",
  "Corticoide não deve ser administrado para tratar PIC elevada na HIC.":
    "El corticoide no debe administrarse para tratar la PIC elevada en la HIC.",
  "Na HIC cerebelar com deterioração neurológica, compressão de tronco/hidrocefalia por obstrução ventricular, OU volume ≥15 mL: remoção cirúrgica imediata (com ou sem DVE) em vez de manejo clínico isolado.":
    "En la HIC cerebelosa con deterioro neurológico, compresión del tronco encefálico/hidrocefalia por obstrucción ventricular, O volumen ≥15 mL: extirpación quirúrgica inmediata (con o sin DVE) en lugar del manejo médico aislado.",
  "Na HIC com grande hemorragia intraventricular e rebaixamento, DVE em vez de manejo clínico isolado.":
    "En la HIC con gran hemorragia intraventricular y deterioro de la conciencia, DVE en lugar del manejo médico aislado.",
  "Na HIC supratentorial de >20 a 30 mL com Glasgow 5 a 12, evacuação minimamente invasiva (endoscópica/estereotáxica) pode ser útil para reduzir mortalidade.":
    "En la HIC supratentorial de >20 a 30 mL con Glasgow 5 a 12, la evacuación mínimamente invasiva (endoscópica/estereotáctica) puede ser útil para reducir la mortalidad.",
  "Na HIC supratentorial em deterioração, craniotomia para evacuação pode ser considerada como medida de salvamento.":
    "En la HIC supratentorial en deterioro, la craneotomía para evacuación puede considerarse como medida de salvamento.",
  "Na HIC supratentorial em coma, com grande desvio de linha média ou PIC refratária, craniectomia descompressiva pode ser considerada para reduzir mortalidade.":
    "En la HIC supratentorial en coma, con gran desviación de la línea media o PIC refractaria, la craniectomía descompresiva puede considerarse para reducir la mortalidad.",
  "Na HIC com convulsão clínica, usar antiepiléptico.":
    "En la HIC con convulsión clínica, usar antiepiléptico.",
  "Na HIC com rebaixamento e convulsão eletrográfica confirmada, administrar antiepiléptico.":
    "En la HIC con deterioro de la conciencia y convulsión electrográfica confirmada, administrar antiepiléptico.",
  "Na HIC sem evidência de convulsão, antiepiléptico profilático não beneficia.":
    "En la HIC sin evidencia de convulsión, el antiepiléptico profiláctico no aporta beneficio.",
  "Tratar hipoglicemia (<40 a 60 mg/dL) para reduzir mortalidade.":
    "Tratar la hipoglucemia (<40 a 60 mg/dL) para reducir la mortalidad.",
  "Tratar hiperglicemia moderada a grave (>180 a 200 mg/dL) é razoável.":
    "Tratar la hiperglucemia moderada a grave (>180 a 200 mg/dL) es razonable.",
  "Tratar farmacologicamente a temperatura elevada pode ser razoável.":
    "Tratar farmacológicamente la temperatura elevada puede ser razonable.",
  "No paciente não deambulante, compressão pneumática intermitente desde o dia do diagnóstico, para profilaxia de TEV.":
    "En el paciente no deambulante, compresión neumática intermitente desde el día del diagnóstico, para la profilaxis de TEV.",
  "Heparina profilática em dose baixa 24 a 48 horas após o início pode ser razoável.":
    "La heparina profiláctica en dosis baja de 24 a 48 horas después del inicio puede ser razonable.",
  "Meias de compressão graduada isoladas não beneficiam a profilaxia de TEV.":
    "Las medias de compresión graduada aisladas no aportan beneficio a la profilaxis de TEV.",
  "A eficácia do fator VIIa recombinante na HIC não está clara.":
    "La eficacia del factor VIIa recombinante en la HIC no está clara.",
  "A eficácia do ácido tranexâmico na HIC não está bem estabelecida.":
    "La eficacia del ácido tranexámico en la HIC no está bien establecida.",
  "Cuidado em unidade especializada (ex.: unidade de AVC) com equipe multidisciplinar, para melhorar desfechos.":
    "Atención en unidad especializada (p. ej., unidad de ACV) con equipo multidisciplinario, para mejorar los desenlaces.",
  "Se precisa transferir mas não tem via aérea protegida, troca gasosa adequada ou hemodinâmica estável: iniciar as medidas de suporte antes de transportar.":
    "Si se necesita trasladar pero no hay vía aérea protegida, intercambio gaseoso adecuado o hemodinámica estable: iniciar las medidas de soporte antes de transportar.",
  "Para prevenção de recorrência, alvo de longo prazo PAS 130 mmHg e PAD 80 mmHg.":
    "Para la prevención de la recurrencia, objetivo a largo plazo PAS 130 mmHg y PAD 80 mmHg.",
  "Na fibrilação atrial, se for reanticoagular, iniciar por volta de 7 a 8 semanas após a HIC pode ser considerado.":
    "En la fibrilación auricular, si se va a reanticoagular, puede considerarse iniciar alrededor de 7 a 8 semanas después de la HIC.",
  "O escore de gravidade não deve ser o único fundamento para limitar suporte de vida.":
    "El puntaje de gravedad no debe ser el único fundamento para limitar el soporte vital.",

  /* ── HIC · reversão por agente ──────────────────────────────────────────── */
  "Antagonista da vitamina K (varfarina)": "Antagonista de la vitamina K (warfarina)",
  "4F-PCC (preferível a plasma) + vitamina K IV": "4F-PCC (preferible al plasma) + vitamina K IV",
  "INR ≥2,0: 4F-PCC 25 a 50 UI/kg (Classe 1). INR 1,3 a 1,9: 4F-PCC 10 a 20 UI/kg (Classe 2b). Vitamina K IV em ambos (Classe 1).":
    "INR ≥2,0: 4F-PCC 25 a 50 UI/kg (Clase 1). INR 1,3 a 1,9: 4F-PCC 10 a 20 UI/kg (Clase 2b). Vitamina K IV en ambos (Clase 1).",
  "Na HIC por varfarina com INR ≥2,0, usar 4F-PCC em vez de plasma, seguido de vitamina K IV. A dose de 4F-PCC varia com o INR (Figura 2).":
    "En la HIC por warfarina con INR ≥2,0, usar 4F-PCC en lugar de plasma, seguido de vitamina K IV. La dosis de 4F-PCC varía con el INR (Figura 2).",
  "Dabigatrana (inibidor direto da trombina)": "Dabigatrán (inhibidor directo de la trombina)",
  "Idarucizumabe": "Idarucizumab",
  "Se idarucizumabe indisponível: aPCC ou PCCs (Classe 2b), e/ou terapia de substituição renal (Classe 2b).":
    "Si el idarucizumab no está disponible: aPCC o PCC (Clase 2b), o terapia de reemplazo renal (Clase 2b).",
  "Na HIC por dabigatrana, idarucizumabe é razoável para reverter o efeito anticoagulante.":
    "En la HIC por dabigatrán, el idarucizumab es razonable para revertir el efecto anticoagulante.",
  "Inibidor do fator Xa (rivaroxabana, apixabana, edoxabana)":
    "Inhibidor del factor Xa (rivaroxabán, apixabán, edoxabán)",
  "Andexanet alfa": "Andexanet alfa",
  "Se andexanet indisponível: 4F-PCC ou aPCC (Classe 2b).":
    "Si el andexanet no está disponible: 4F-PCC o aPCC (Clase 2b).",
  "Na HIC por inibidor do fator Xa, andexanet alfa é razoável para reverter o efeito anticoagulante.":
    "En la HIC por inhibidor del factor Xa, el andexanet alfa es razonable para revertir el efecto anticoagulante.",
  "DOAC ingerido nas últimas horas": "DOAC ingerido en las últimas horas",
  "Carvão ativado (se ingestão recente)": "Carbón activado (si la ingesta es reciente)",
  "Se DOAC ingerido há menos de 2 h (eficácia potencial até 8 h).":
    "Si el DOAC se ingirió hace menos de 2 h (eficacia potencial hasta 8 h).",
  "Quando o DOAC foi tomado nas últimas horas, carvão ativado pode ser razoável para prevenir a absorção.":
    "Cuando el DOAC se tomó en las últimas horas, el carbón activado puede ser razonable para prevenir la absorción.",
  "Heparina não fracionada (HNF)": "Heparina no fraccionada (HNF)",
  "Protamina IV": "Protamina IV",
  "Não exceder 50 mg/10 min (texto de suporte).":
    "No exceder 50 mg/10 min (texto de soporte).",
  "Na HIC por heparina não fracionada, protamina IV é razoável para reverter o efeito.":
    "En la HIC por heparina no fraccionada, la protamina IV es razonable para revertir el efecto.",
  "Heparina de baixo peso molecular (HBPM)": "Heparina de bajo peso molecular (HBPM)",
  "Protamina IV (reversão parcial)": "Protamina IV (reversión parcial)",
  "Na HIC por HBPM, protamina IV pode ser considerada para reverter parcialmente o efeito.":
    "En la HIC por HBPM, la protamina IV puede considerarse para revertir parcialmente el efecto.",

  /* ── HIC · populações ───────────────────────────────────────────────────── */
  "HIC leve a moderada, PAS 150 a 220 mmHg": "HIC leve a moderada, PAS 150 a 220 mmHg",
  "HIC grande/grave ou com descompressão cirúrgica":
    "HIC grande/grave o con descompresión quirúrgica",
  "HIC leve a moderada, PAS acima de 150 mmHg": "HIC leve a moderada, PAS por encima de 150 mmHg",
  "HIC associada a anticoagulante": "HIC asociada a anticoagulante",
  "HIC por aspirina COM neurocirurgia de emergência":
    "HIC por aspirina CON neurocirugía de emergencia",
  "HIC por aspirina SEM cirurgia de emergência": "HIC por aspirina SIN cirugía de emergencia",
  "HIC cerebelar": "HIC cerebelosa",
  "HIC com grande HIV e rebaixamento": "HIC con gran HIV y deterioro de la conciencia",
  "HIC supratentorial >20 a 30 mL, Glasgow 5 a 12":
    "HIC supratentorial >20 a 30 mL, Glasgow 5 a 12",
  "HIC com fibrilação atrial": "HIC con fibrilación auricular",

  /* ══════════════════════════════════════════════════════════════════════════
   * HSA · TEMAS E RESUMOS
   * ════════════════════════════════════════════════════════════════════════ */
  "Prevenção de ressangramento": "Prevención de resangrado",
  "Controle de PA com medicação de ação curta até o aneurisma ser tratado. Reversão de anticoagulante. Antifibrinolítico de rotina não é útil.":
    "Control de la PA con medicación de acción corta hasta que se trate el aneurisma. Reversión del anticoagulante. El antifibrinolítico de rutina no es útil.",
  "Tratamento do aneurisma": "Tratamiento del aneurisma",
  "Tratar o mais cedo possível, preferencialmente em até 24 horas. Obliteração completa quando factível. A modalidade (coil x clipagem) depende da população.":
    "Tratar lo antes posible, preferentemente dentro de las 24 horas. Obliteración completa cuando sea factible. La modalidad (coil x clipaje) depende de la población.",
  "Vasoespasmo e isquemia cerebral tardia (DCI)": "Vasoespasmo e isquemia cerebral tardía (DCI)",
  "Nimodipino enteral precoce (COR 1). Manter euvolemia. Estatina e magnésio de rotina não são recomendados. Aumento hemodinâmico profilático é danoso.":
    "Nimodipino enteral precoz (COR 1). Mantener euvolemia. La estatina y el magnesio de rutina no se recomiendan. El aumento hemodinámico profiláctico es dañino.",
  "Hidrocefalia": "Hidrocefalia",
  "Hidrocefalia aguda sintomática: derivação liquórica urgente (DVE e/ou dreno lombar). Hidrocefalia crônica: derivação permanente.":
    "Hidrocefalia aguda sintomática: derivación de LCR urgente (DVE o drenaje lumbar). Hidrocefalia crónica: derivación permanente.",
  "Fenitoína para prevenção está associada a excesso de morbimortalidade. Quem chega convulsionando: tratar até 7 dias.":
    "La fenitoína para la prevención se asocia a exceso de morbimortalidad. Quien llega convulsionando: tratar hasta 7 días.",
  "Manter euvolemia; hipervolemia induzida é danosa. Profilaxia de TEV só após o aneurisma tratado. Controle glicêmico com atenção à hipoglicemia.":
    "Mantener euvolemia; la hipervolemia inducida es dañina. Profilaxis de TEV solo después de tratado el aneurisma. Control glucémico con atención a la hipoglucemia.",

  /* ── HSA · formulações ──────────────────────────────────────────────────── */
  "Com aneurisma ainda não tratado, monitorar a PA de perto e controlá-la com medicação de ação curta, evitando hipotensão, hipertensão e variabilidade.":
    "Con el aneurisma aún no tratado, monitorizar de cerca la PA y controlarla con medicación de acción corta, evitando hipotensión, hipertensión y variabilidad.",
  "No paciente anticoagulado, reverter a anticoagulação em emergência com o agente apropriado, para prevenir ressangramento.":
    "En el paciente anticoagulado, revertir la anticoagulación de emergencia con el agente apropiado, para prevenir el resangrado.",
  "O uso de rotina de antifibrinolítico não é útil para melhorar o desfecho funcional.":
    "El uso de rutina de antifibrinolítico no es útil para mejorar el desenlace funcional.",
  "Tratar o aneurisma roto (cirúrgico ou endovascular) o mais cedo possível, preferencialmente em até 24 horas do início.":
    "Tratar el aneurisma roto (quirúrgico o endovascular) lo antes posible, preferentemente dentro de las 24 horas del inicio.",
  "Obliteração completa do aneurisma roto sempre que factível, para reduzir ressangramento e retratamento.":
    "Obliteración completa del aneurisma roto siempre que sea factible, para reducir el resangrado y el retratamiento.",
  "Em aneurisma roto da circulação posterior passível de coil, preferir coil à clipagem.":
    "En el aneurisma roto de la circulación posterior susceptible de coil, preferir el coil al clipaje.",
  "Em HSA de bom grau, aneurisma da circulação anterior igualmente elegível para coil ou clipagem: preferir coil.":
    "En la HSA de buen grado, aneurisma de la circulación anterior igualmente elegible para coil o clipaje: preferir el coil.",
  "No paciente recuperável com rebaixamento por grande hematoma intraparenquimatoso, evacuação de emergência do coágulo para reduzir mortalidade.":
    "En el paciente recuperable con deterioro de la conciencia por gran hematoma intraparenquimatoso, evacuación de emergencia del coágulo para reducir la mortalidad.",
  "Em aneurisma sacular roto tratável por coil ou clipagem, stents ou desviadores de fluxo não devem ser usados.":
    "En el aneurisma sacular roto tratable por coil o clipaje, no deben usarse stents ni desviadores de flujo.",
  "Iniciar nimodipino enteral precoce (60 mg, 6 vezes ao dia — texto de suporte) para prevenir DCI e melhorar o desfecho.":
    "Iniciar nimodipino enteral precoz (60 mg, 6 veces al día — texto de soporte) para prevenir la DCI y mejorar el desenlace.",
  "Manter euvolemia pode ser benéfico para prevenir DCI.":
    "Mantener la euvolemia puede ser beneficioso para prevenir la DCI.",
  "No vasoespasmo sintomático, elevar a PAS pode ser razoável para reduzir a progressão do DCI.":
    "En el vasoespasmo sintomático, elevar la PAS puede ser razonable para reducir la progresión de la DCI.",
  "No vasoespasmo grave, vasodilatador intra-arterial (e angioplastia) pode ser razoável como resgate.":
    "En el vasoespasmo grave, el vasodilatador intraarterial (y la angioplastia) puede ser razonable como rescate.",
  "O uso de rotina de estatina não é recomendado.":
    "El uso de rutina de estatina no se recomienda.",
  "O uso de rotina de magnésio intravenoso não é recomendado.":
    "El uso de rutina de magnesio intravenoso no se recomienda.",
  "O aumento hemodinâmico profilático (antigo Triplo-H profilático) não deve ser feito, pelo risco de dano iatrogênico.":
    "El aumento hemodinámico profiláctico (antiguo Triple-H profiláctico) no debe realizarse, por el riesgo de daño iatrogénico.",
  "Na hidrocefalia aguda sintomática, derivação liquórica urgente (DVE e/ou dreno lombar).":
    "En la hidrocefalia aguda sintomática, derivación de LCR urgente (DVE o drenaje lumbar).",
  "Na hidrocefalia crônica sintomática, derivação liquórica permanente.":
    "En la hidrocefalia crónica sintomática, derivación de LCR permanente.",
  "Fenitoína para prevenção de convulsão está associada a excesso de morbimortalidade.":
    "La fenitoína para la prevención de convulsiones se asocia a exceso de morbimortalidad.",
  "Quem chega com convulsão: tratar com antiepiléptico por até 7 dias é razoável.":
    "En quien llega con convulsión: tratar con antiepiléptico hasta 7 días es razonable.",
  "Em alto risco de convulsão (aneurisma de ACM roto, HSA de alto grau, HIC, hidrocefalia, infarto cortical), profilaxia antiepiléptica pode ser razoável — mas não com fenitoína.":
    "En alto riesgo de convulsión (aneurisma de ACM roto, HSA de alto grado, HIC, hidrocefalia, infarto cortical), la profilaxis antiepiléptica puede ser razonable — pero no con fenitoína.",
  "Monitorar de perto e tratar o estado volêmico por metas, para manter euvolemia.":
    "Monitorizar de cerca y tratar el estado volémico por metas, para mantener la euvolemia.",
  "A indução de hipervolemia é potencialmente danosa.":
    "La inducción de hipervolemia es potencialmente dañina.",
  "Depois de o aneurisma estar tratado, profilaxia de TEV (farmacológica ou mecânica).":
    "Después de tratado el aneurisma, profilaxis de TEV (farmacológica o mecánica).",
  "Controle glicêmico efetivo, manejo estrito da hiperglicemia e evitar hipoglicemia.":
    "Control glucémico efectivo, manejo estricto de la hiperglucemia y evitar la hipoglucemia.",

  /* ── HSA · populações ───────────────────────────────────────────────────── */
  "HSA com aneurisma não tratado": "HSA con aneurisma no tratado",
  "Aneurisma de circulação posterior": "Aneurisma de circulación posterior",
  "HSA bom grau, circulação anterior, elegível para ambos":
    "HSA de buen grado, circulación anterior, elegible para ambos",
  "Vasoespasmo sintomático": "Vasoespasmo sintomático",
  "Vasoespasmo grave": "Vasoespasmo grave",
  "HSA que se apresenta com convulsão": "HSA que se presenta con convulsión",
  "HSA com fatores de alto risco de convulsão": "HSA con factores de alto riesgo de convulsión",
  "HSA com aneurisma já tratado": "HSA con aneurisma ya tratado",

  /** ⚠️ Ponteiro de fonte — traduzido só o miolo em palavras; § e página não mudam. */
  "§8.3, rec. 1, p. e339 (dose in supportive text, p. e340)":
    "§8.3, rec. 1, p. e339 (dosis en texto de soporte, p. e340)",

  /* ── ⚠️ PD-39 · o vocabulário que nasceu ao clonar as referências ──────── */
  "Atendimento aberto há": "Atención abierta hace",
  "Corrigir a pressão arterial": "Corregir la presión arterial",
  "Corrigir a glicemia": "Corregir la glucemia",
  "Decisão desta fase": "Decisión de esta fase",
  "Indicada, ainda não administrada": "Indicada, aún no administrada",
  "Imagem cerebral emergencial, o mais rápido possível":
    "Imagen cerebral emergente, lo más rápido posible",
  "Exclui hemorragia intracraniana antes de iniciar qualquer reperfusão, e mede a carga isquêmica.":
    "Excluye hemorragia intracraneal antes de iniciar cualquier reperfusión, y mide la carga isquémica.",
  "Registrar a imagem": "Registrar la imagen",
  "Avaliar item a item": "Evaluar ítem por ítem",
  "Já tenho o total, medido em outro serviço":
    "Ya tengo el total, medido en otro servicio",

  /* ── ⚠️ PD-40 · o veredito da trombólise ──────────────────────────────── */
  "A diretriz não recomenda a trombólise neste caso":
    "La guía no recomienda la trombólisis en este caso",
  "Ainda não dá para concluir: faltam dados":
    "Aún no es posible concluir: faltan datos",
  "Conferência dos critérios da diretriz contra o que foi registrado. A decisão é do médico.":
    "Verificación de los criterios de la guía contra lo registrado. La decisión es del médico.",
  "Nenhum critério da diretriz alcança este caso ainda":
    "Ningún criterio de la guía alcanza este caso todavía",
  "Os critérios registrados sustentam a trombólise":
    "Los criterios registrados sustentan la trombólisis",
  /* ── ⚠️⚠️ o veredito da TROMBECTOMIA — ⛔ outro motor, ⛔ outras frases ──── */
  /* ── ⚠️ os sete selos da raia de EVT ─────────────────────────────────── */
  "Trombectomia mecânica": "Trombectomía mecánica",
  "EVT é razoável": "La TEV es razonable",
  "EVT pode ser razoável": "La TEV puede ser razonable",
  "Efetividade da EVT não bem estabelecida":
    "Efectividad de la TEV no bien establecida",
  /** ⚠️⚠️ *"No Benefit"* ⛔ não se traduz — ⛔ é o rótulo de COR da fonte. */
  "EVT não recomendada para melhorar desfecho — No Benefit":
    "TEV no recomendada para mejorar el desenlace — No Benefit",
  "Nenhum critério implementado fecha este caso":
    "Ningún criterio implementado cierra este caso",
  /** ⚠️⚠️ ⛔ *"⛔ não é exclusão"* ⛔ precisa sobreviver à tradução (**E-45**). */
  "Generalização limitada — exige julgamento clínico, e não é exclusão":
    "Generalización limitada — exige juicio clínico, y no es exclusión",
  "Não aguardar resposta clínica à trombólise para prosseguir com a trombectomia.":
    "No aguardar la respuesta clínica a la trombólisis para proseguir con la trombectomía.",
  "Sem efeito de massa significativo": "Sin efecto de masa significativo",
  "Desde o início": "Desde el inicio",
  /* ── ⚠️⚠️ FASE 10 · antitrombóticos pós-IVT ────────────────────────────── */
  "Antitrombóticos pós-IVT": "Antitrombóticos pos-TIV",
  "Antitrombóticos pós-trombólise": "Antitrombóticos pos-trombólisis",
  "Ordem": "Orden",
  "Aspirina é recomendada nas primeiras 48 horas do início do AVC.":
    "La aspirina se recomienda en las primeras 48 horas del inicio del ACV.",
  /**
   * ⚠️⚠️ ⛔ *"risco incerto"* ⛔ e *"pode ser considerado"* ⛔ PRECISAM sobreviver
   * à tradução (**E-45**): ⛔ nem *"seguro"* ⛔ nem *"contraindicado"*.
   */
  "Uso de antiagregante nas primeiras 24 horas após a trombólise: risco incerto. Pode ser considerado em situação concomitante selecionada.":
    "Uso de antiagregante en las primeras 24 horas tras la trombólisis: riesgo incierto. Puede ser considerado en situación concomitante seleccionada.",
  "Aspirina IV não deve ser administrada junto com a trombólise nem nos 90 minutos após o seu início, pelo risco de hemorragia.":
    "La aspirina IV no debe administrarse junto con la trombólisis ni en los 90 minutos posteriores a su inicio, por el riesgo de hemorragia.",
  "Há condição concomitante em que o antiagregante traria benefício substancial, ou em que suspendê-lo traria risco substancial":
    "Hay condición concomitante en la que el antiagregante traería beneficio sustancial, o en la que suspenderlo traería riesgo sustancial",
  "A fonte não lista quais condições são essas. A leitura é sua, e o app não a assume por você.":
    "La fuente no lista cuáles son esas condiciones. La lectura es suya, y la app no la asume por usted.",
  "Marcar Sim faz aparecer a recomendação de risco incerto (COR 2b, LOE B-NR). Não é autorização para iniciar antiagregante, e a decisão continua sendo do médico.":
    "Marcar Sí hace aparecer la recomendación de riesgo incierto (COR 2b, LOE B-NR). No es autorización para iniciar antiagregante, y la decisión sigue siendo del médico.",
  "A fonte traz seis recomendações sobre anticoagulantes, com forças opostas conforme o contexto. Nenhuma foi incorporada nesta fase, e o app não emite conduta anticoagulante.":
    "La fuente trae seis recomendaciones sobre anticoagulantes, con fuerzas opuestas según el contexto. Ninguna fue incorporada en esta fase, y la app no emite conducta anticoagulante.",
  "Dentro das primeiras 24 horas após a trombólise. Imagem de controle ainda não registrada.":
    "Dentro de las primeras 24 horas tras la trombólisis. Imagen de control aún no registrada.",
  "A ordem da imagem de controle vale após a trombólise.":
    "El orden de la imagen de control rige tras la trombólisis.",
  "A ordem vem da Table 7. A decisão terapêutica é do médico.":
    "El orden viene de la Table 7. La decisión terapéutica es del médico.",
  "Aguardando imagem de controle de 24 horas antes de considerar antiagregante ou anticoagulante.":
    "Esperando la imagen de control de 24 horas antes de considerar antiagregante o anticoagulante.",
  "Imagem realizada; resultado ainda não disponível.":
    "Imagen realizada; resultado aún no disponible.",
  "Resultado da imagem de controle registrado.":
    "Resultado de la imagen de control registrado.",
  "Informar o horário de início do déficit":
    "Informar el horario de inicio del déficit",
  "Registrar o PC-ASPECTS do laudo": "Registrar el PC-ASPECTS del informe",
  /* ── ⚠️ o campo do PC-ASPECTS, ⛔ que ⛔ não existia ─────────────────────── */
  "PC-ASPECTS informado no laudo ou pela equipe":
    "PC-ASPECTS informado en el informe o por el equipo",
  "Escala de 10 pontos da circulação posterior, diferente do ASPECTS anterior. Ponte e mesencéfalo valem 2 pontos cada, tálamos, lobos occipitais e hemisférios cerebelares 1 ponto cada. O app não calcula: registre o valor que vier do laudo ou da equipe.":
    "Escala de 10 puntos de la circulación posterior, distinta del ASPECTS anterior. Protuberancia y mesencéfalo valen 2 puntos cada uno, tálamos, lóbulos occipitales y hemisferios cerebelosos 1 punto cada uno. La app no calcula: registre el valor que venga del informe o del equipo.",
  "Escore da circulação posterior, informado por quem leu a imagem. Os cortes que a fonte usa pertencem às recomendações de oclusão basilar.":
    "Puntaje de la circulación posterior, informado por quien leyó la imagen. Los cortes que la fuente usa pertenecen a las recomendaciones de oclusión basilar.",
  "Os critérios registrados sustentam a trombectomia":
    "Los criterios registrados sustentan la trombectomía",
  "Os critérios registrados tornam a trombectomia razoável":
    "Los criterios registrados hacen que la trombectomía sea razonable",
  "Os critérios registrados tornam a trombectomia possivelmente razoável":
    "Los criterios registrados hacen que la trombectomía sea posiblemente razonable",
  /**
   * ⚠️⚠️ *"⛔ não recomenda … por ausência de benefício"* — ⛔ e ⛔ **nunca**
   * *"contraindicada"*. ⛔ A fonte diz **No Benefit**, ⛔ e o espanhol ⛔ não pode
   * endurecer o que o português preservou.
   */
  "A diretriz não recomenda a trombectomia neste caso, por ausência de benefício":
    "La guía no recomienda la trombectomía en este caso, por ausencia de beneficio",
  /** ⚠️⚠️ ⛔ **⛔ Nem sim ⛔ nem não** — o hedge da fonte sobrevive à tradução. */
  "A efetividade da trombectomia neste cenário não está bem estabelecida":
    "La efectividad de la trombectomía en este escenario no está bien establecida",
  "Necessário para saber se o caso ainda está dentro da janela de cada recomendação.":
    "Necesario para saber si el caso aún está dentro de la ventana de cada recomendación.",
  "oclusão de vaso médio ou distal — M2 não dominante ou codominante, M3, cerebral anterior ou posterior":
    "oclusión de vaso mediano o distal — M2 no dominante o codominante, M3, cerebral anterior o posterior",
  "? Ainda não dá para concluir": "? Aún no es posible concluir",
  "· Sem critério aplicável ainda": "· Sin criterio aplicable todavía",
  "✓ Trombólise indicada": "✓ Trombólisis indicada",
  "✕ A diretriz não recomenda": "✕ La guía no recomienda",
  "✕ Reperfusão retida pela imagem": "✕ Reperfusión retenida por la imagen",
  "Corrigir antes": "Corregir antes",
  "Registrar coleta": "Registrar recolección",
  "Registrar exame": "Registrar examen",
  "Faltam": "Faltan",
  "itens": "ítems",
  /* ── ⚠️ estabilização primeiro ─────────────────────────────────────────── */
  "Ameaça registrada": "Amenaza registrada",
  "ameaça registrada": "amenaza registrada",
  "Os quatro eixos avaliados": "Los cuatro ejes evaluados",
  "a avaliar": "por evaluar",
  "A avaliar": "Por evaluar",
  "Avaliado": "Evaluado",
  "avaliado": "evaluado",
  "ainda não avaliado": "aún no evaluado",
  "Via aérea": "Vía aérea",
  "Respiração": "Respiración",
  "Pressão arterial": "Presión arterial",
  "Nível de consciência rebaixado": "Nivel de consciencia deprimido",
  "Disfunção bulbar": "Disfunción bulbar",
  "Hipoxemia ou necessidade de oxigênio": "Hipoxemia o necesidad de oxígeno",
  "Solicitar a tomografia": "Solicitar la tomografía",
  "Já foi feita — registrar": "Ya fue realizada — registrar",
  "Registrar o resultado da tomografia": "Registrar el resultado de la tomografía",
  "Abrir Imagem": "Abrir Imagen",
  "Falta": "Falta",
  "item": "ítem",
  "Definir": "Definir",
  "Definir a última vez em que o paciente foi visto bem":
    "Definir la última vez en que el paciente fue visto bien",
  "abrir o painel do paciente": "abrir el panel del paciente",
};
