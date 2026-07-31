/**
 * Espanhol (es-419) — conteúdo acrescentado ao módulo de Intoxicações Exógenas
 * a partir dos pathways Einstein/SBIBAE de intoxicação exógena e de metanol.
 *
 * Termos regionais: "toxíndrome" (usado tal qual em espanhol), "carbón
 * activado", "lavado gástrico", "brecha aniónica/osmolar" — mantive "ânion gap"
 * e "gap osmolar" como anglicismos, que é como circulam na UTI latino-americana,
 * com o termo em espanhol entre parênteses na primeira ocorrência.
 */
export const ES_INTOXICACOES_EINSTEIN: Record<string, string> = {
  // ── Estabilização ──
  "Contatar o Centro de Informação Toxicológica (CIATox/CEATOX) da sua região — orientação especializada em tempo real.":
    "Contactar al Centro de Información Toxicológica de su región — orientación especializada en tiempo real.",
  "ECG de 12 derivações em TODOS: QRS alargado indica bloqueio de canal de sódio (tricíclico, cocaína, carbamazepina); QT prolongado indica bloqueio do efluxo de potássio.":
    "ECG de 12 derivaciones en TODOS: QRS ancho indica bloqueo del canal de sodio (tricíclico, cocaína, carbamazepina); QT prolongado indica bloqueo del eflujo de potasio.",
  "RX de tórax/abdome pode revelar substância radiopaca: sais de cálcio, potássio e sódio, metais pesados, lítio, compostos iodados, salicilatos, cápsulas revestidas e pacotes de droga.":
    "Rx de tórax/abdomen puede revelar sustancia radiopaca: sales de calcio, potasio y sodio, metales pesados, litio, compuestos yodados, salicilatos, cápsulas recubiertas y paquetes de droga.",
  "⚠️ NÃO pedir triagem toxicológica ampla de rotina — não muda desfecho e é pouco custo-efetiva. Reservar para caso grave de etiologia incerta ou com implicação legal.":
    "⚠️ NO solicitar tamizaje toxicológico amplio de rutina — no cambia el desenlace y es poco costo-efectivo. Reservarlo para casos graves de etiología incierta o con implicación legal.",
  "Descontaminação cutânea: retirar toda a roupa, lavar com água corrente abundante e sabão, guardar a roupa em saco plástico; equipe com luvas e avental.":
    "Descontaminación cutánea: retirar toda la ropa, lavar con agua corriente abundante y jabón, guardar la ropa en bolsa plástica; el equipo con guantes y bata.",
  "Descontaminação ocular: lavagem com soro fisiológico, EVERTENDO a pálpebra para lavar por completo.":
    "Descontaminación ocular: lavado con solución fisiológica, EVIRTIENDO el párpado para lavar por completo.",
  "Agitação e convulsão: tratar com benzodiazepínico, evitando fármacos que baixem o limiar convulsivo.":
    "Agitación y convulsión: tratar con benzodiacepina, evitando fármacos que bajen el umbral convulsivo.",
  "Taquiarritmia ventricular na intoxicação: BICARBONATO de sódio 1–2 mEq/kg é a primeira escolha, e EVITAR amiodarona — cocaína, tricíclicos e carbamazepina bloqueiam o canal de SÓDIO rápido, e a amiodarona também o bloqueia (além de prolongar o QT).":
    "Taquiarritmia ventricular en la intoxicación: BICARBONATO de sodio 1–2 mEq/kg es la primera elección, y EVITAR amiodarona — cocaína, tricíclicos y carbamazepina bloquean el canal de SODIO rápido, y la amiodarona también lo bloquea (además de prolongar el QT).",
  "Antes de fechar o diagnóstico em intoxicação, descartar o que imita coma tóxico: trauma/TCE (procurar estigmas, anisocoria, déficit motor), hipoxemia, hipotermia, hipoglicemia, AVC, infecção do SNC e distúrbio metabólico.":
    "Antes de cerrar el diagnóstico de intoxicación, descartar lo que imita el coma tóxico: trauma/TEC (buscar estigmas, anisocoria, déficit motor), hipoxemia, hipotermia, hipoglucemia, ACV, infección del SNC y trastorno metabólico.",

  // ── Sedativo-hipnótica ──
  "Flumazenil 0,2 mg IV em 15 s; se não responder, 0,3 mg e depois 0,5 mg a cada minuto. Teto cumulativo de 3 mg na superdosagem (o teto de 1 mg é o da reversão de sedação consciente). Uso EXCEPCIONAL.":
    "Flumazenil 0,2 mg IV en 15 s; si no responde, 0,3 mg y luego 0,5 mg cada minuto. Techo acumulado de 3 mg en la sobredosis (el techo de 1 mg corresponde a la reversión de sedación consciente). Uso EXCEPCIONAL.",

  // ── Serotoninérgica ──
  "Serotoninérgico — clonus, hiperreflexia, hipertermia, agitação":
    "Serotoninérgico — clonus, hiperreflexia, hipertermia, agitación",
  "Toxíndrome serotoninérgica": "Toxíndrome serotoninérgico",
  "O que a separa da simpaticomimética é o CLONUS — sobretudo o de tornozelo e o ocular.":
    "Lo que lo separa del simpaticomimético es el CLONUS — sobre todo el de tobillo y el ocular.",
  "Reconhecer: agitação e confusão, hipertermia, taquicardia, taquipneia, hipertensão, midríase, pele úmida, hiperreflexia, clonus (inclusive ocular), tremor e diarreia.":
    "Reconocer: agitación y confusión, hipertermia, taquicardia, taquipnea, hipertensión, midriasis, piel húmeda, hiperreflexia, clonus (incluido el ocular), temblor y diarrea.",
  "Etiologias: ISRS e duais, inibidores da MAO, tricíclicos, dextrometorfano, meperidina, tramadol, linezolida, triptanos e associações entre eles.":
    "Etiologías: ISRS y duales, inhibidores de la MAO, tricíclicos, dextrometorfano, meperidina, tramadol, linezolid, triptanos y asociaciones entre ellos.",
  "SUSPENDER imediatamente todos os agentes serotoninérgicos — é a medida que mais muda o curso.":
    "SUSPENDER de inmediato todos los agentes serotoninérgicos — es la medida que más cambia el curso.",
  "BENZODIAZEPÍNICO para agitação, rigidez e controle autonômico; hidratação e resfriamento ativo na hipertermia.":
    "BENZODIACEPINA para agitación, rigidez y control autonómico; hidratación y enfriamiento activo en la hipertermia.",
  "Hipertermia grave com rigidez: sedação profunda, intubação e BLOQUEIO NEUROMUSCULAR não despolarizante — a rigidez muscular é o motor da hipertermia. Evitar succinilcolina (rabdomiólise/hipercalemia).":
    "Hipertermia grave con rigidez: sedación profunda, intubación y BLOQUEO NEUROMUSCULAR no despolarizante — la rigidez muscular es el motor de la hipertermia. Evitar succinilcolina (rabdomiólisis/hiperpotasemia).",
  "NÃO usar antipirético — a hipertermia é de origem muscular, não hipotalâmica.":
    "NO usar antipirético — la hipertermia es de origen muscular, no hipotalámico.",
  "Ciproeptadina 12 mg VO/SNG, depois 2 mg a cada 2 h enquanto persistirem os sintomas, com manutenção de 8 mg 6/6 h — antagonista serotoninérgico, quando o suporte não basta.":
    "Ciproheptadina 12 mg VO/SNG, luego 2 mg cada 2 h mientras persistan los síntomas, con mantenimiento de 8 mg cada 6 h — antagonista serotoninérgico, cuando el soporte no basta.",
  "Diferencial: síndrome neuroléptica maligna (instalação em dias, rigidez em cano de chumbo, SEM clonus) e toxíndrome anticolinérgica (pele SECA, sem clonus, ruídos hidroaéreos diminuídos).":
    "Diferencial: síndrome neuroléptico maligno (instalación en días, rigidez en tubo de plomo, SIN clonus) y toxíndrome anticolinérgico (piel SECA, sin clonus, ruidos hidroaéreos disminuidos).",

  // ── Alucinógena ──
  "Alucinógeno — alucinações, distorção sensorial, nistagmo":
    "Alucinógeno — alucinaciones, distorsión sensorial, nistagmo",
  "Toxíndrome alucinógena": "Toxíndrome alucinógeno",
  "Alucinações e distorção sensorial com sinais vitais que podem estar normais.":
    "Alucinaciones y distorsión sensorial con signos vitales que pueden estar normales.",
  "Reconhecer: alucinações, distorções sensoriais, despersonalização, sinestesia e agitação; pupilas dilatadas ou normais; nistagmo é achado típico (sobretudo com quetamina e fenciclidina).":
    "Reconocer: alucinaciones, distorsiones sensoriales, despersonalización, sinestesia y agitación; pupilas dilatadas o normales; el nistagmo es un hallazgo típico (sobre todo con ketamina y fenciclidina).",
  "Suporte é a regra: ambiente calmo, com pouco estímulo, e reorientação verbal.":
    "El soporte es la regla: ambiente tranquilo, con poco estímulo, y reorientación verbal.",
  "BENZODIAZEPÍNICO para agitação — evitar antipsicótico como primeira escolha (baixa o limiar convulsivo e prejudica a termorregulação).":
    "BENZODIACEPINA para la agitación — evitar el antipsicótico como primera elección (baja el umbral convulsivo y altera la termorregulación).",
  "MDMA: vigiar hipertermia, rabdomiólise e HIPONATREMIA por excesso de água livre — dosar sódio antes de hidratar em volume.":
    "MDMA: vigilar hipertermia, rabdomiólisis e HIPONATREMIA por exceso de agua libre — medir el sodio antes de hidratar con volumen.",
  "Sinais vitais podem estar normais; a deterioração costuma vir de hipertermia, trauma durante a agitação ou coingestão.":
    "Los signos vitales pueden estar normales; el deterioro suele venir de hipertermia, trauma durante la agitación o coingesta.",

  // ── Álcoois tóxicos: diagnóstico ──
  "Álcool tóxico — metanol/etilenoglicol (visão, gap osmolar)":
    "Alcohol tóxico — metanol/etilenglicol (visión, gap osmolar)",
  "Álcool tóxico — metanol / etilenoglicol": "Alcohol tóxico — metanol / etilenglicol",
  "Acidose com ânion gap alto + gap osmolar alto. NÃO fazer carvão nem lavagem.":
    "Acidosis con ánion gap alto + gap osmolar alto. NO hacer carbón ni lavado.",
  "Suspeitar após ingestão de bebida de procedência duvidosa, álcool combustível, solvente ou fluido de limpador de para-brisa — e nas tentativas de suicídio.":
    "Sospechar tras la ingesta de bebida de procedencia dudosa, alcohol combustible, solvente o líquido limpiaparabrisas — y en los intentos de suicidio.",
  "Janela dos sintomas no metanol — até 6 h: sonolência, ataxia, tontura, dor abdominal, náuseas, vômitos, cefaleia, confusão, taquicardia e hipotensão. Entre 6 e 24 h: visão turva, fotofobia, escotomas, midríase, perda da visão de cores, convulsões, coma e acidose grave.":
    "Ventana de síntomas en el metanol — hasta 6 h: somnolencia, ataxia, mareo, dolor abdominal, náuseas, vómitos, cefalea, confusión, taquicardia e hipotensión. Entre 6 y 24 h: visión borrosa, fotofobia, escotomas, midriasis, pérdida de la visión de colores, convulsiones, coma y acidosis grave.",
  "O metanol é convertido em ÁCIDO FÓRMICO — a gravidade costuma aparecer a partir de 12 h da ingesta, não no primeiro atendimento.":
    "El metanol se convierte en ÁCIDO FÓRMICO — la gravedad suele aparecer a partir de las 12 h de la ingesta, no en la primera atención.",
  "Calcular sempre os três: ânion gap = Na⁺ − (HCO₃⁻ + Cl⁻); osmolalidade estimada = (2 × Na⁺) + (ureia/6) + (glicose/18); gap osmolar = osmolalidade medida − estimada.":
    "Calcular siempre los tres: ánion gap = Na⁺ − (HCO₃⁻ + Cl⁻); osmolalidad estimada = (2 × Na⁺) + (urea/6) + (glucosa/18); gap osmolar = osmolalidad medida − estimada.",
  "Critério diagnóstico com exposição e quadro compatível: 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10. Achado de neuroimagem (hemorragia de gânglios da base ou necrose de putâmen) reforça a suspeita.":
    "Criterio diagnóstico con exposición y cuadro compatible: 2 de 3 — pH < 7,35, ánion gap > 16, gap osmolar > 10. Un hallazgo en neuroimagen (hemorragia de ganglios basales o necrosis del putamen) refuerza la sospecha.",
  "⚠️ NÃO fazer lavagem gástrica nem carvão ativado — a absorção é rápida e o álcool não é adsorvido pelo carvão.":
    "⚠️ NO hacer lavado gástrico ni carbón activado — la absorción es rápida y el alcohol no es adsorbido por el carbón.",
  "Garantir euvolemia com cristaloide; corrigir os demais distúrbios eletrolíticos.":
    "Garantizar la euvolemia con cristaloide; corregir los demás trastornos electrolíticos.",
  "Acidose com pH < 7,35: bicarbonato de sódio 8,4% 1–2 mEq/kg IV em bólus, com a meta de manter o pH acima de 7,35.":
    "Acidosis con pH < 7,35: bicarbonato de sodio 8,4% 1–2 mEq/kg IV en bolo, con la meta de mantener el pH por encima de 7,35.",
  "NÃO aguardar a dosagem do tóxico para tratar — o resultado demora e a janela terapêutica não espera.":
    "NO esperar la medición del tóxico para tratar — el resultado demora y la ventana terapéutica no espera.",
  "Sintoma visual: avaliação oftalmológica. Rebaixamento de consciência: TC ou RM de crânio.":
    "Síntoma visual: evaluación oftalmológica. Deterioro de la conciencia: TC o RM de cráneo.",
  "Notificação COMPULSÓRIA no SINAN (CID T51.1 para metanol); em tentativa de suicídio, notificar também violência.":
    "Notificación OBLIGATORIA al sistema de vigilancia (en Brasil, SINAN; CIE-10 T51.1 para metanol); en intento de suicidio, notificar también violencia.",

  // ── Álcoois tóxicos: antídoto ──
  "Álcool tóxico — antídoto e diálise": "Alcohol tóxico — antídoto y diálisis",
  "Bloquear a álcool-desidrogenase antes que o tóxico vire ácido.":
    "Bloquear la alcohol-deshidrogenasa antes de que el tóxico se convierta en ácido.",
  "Indicação do antídoto: paciente sintomático com exposição ou alta suspeição e pelo menos 2 dos 3 — pH < 7,35, ânion gap > 16, gap osmolar > 10.":
    "Indicación del antídoto: paciente sintomático con exposición o alta sospecha y al menos 2 de 3 — pH < 7,35, ánion gap > 16, gap osmolar > 10.",
  "FOMEPIZOL (primeira escolha onde disponível): ataque 15 mg/kg IV em 30 min → 10 mg/kg a cada 12 h por 4 doses → depois 15 mg/kg a cada 12 h enquanto persistir a intoxicação. Durante hemodiálise, redosar ao fim da sessão.":
    "FOMEPIZOL (primera elección donde esté disponible): carga 15 mg/kg IV en 30 min → 10 mg/kg cada 12 h por 4 dosis → luego 15 mg/kg cada 12 h mientras persista la intoxicación. Durante la hemodiálisis, redosificar al final de la sesión.",
  "ETANOL (antídoto disponível no Brasil): preparar solução a 10% — 100 mL de etanol absoluto + 900 mL de soro glicosado 5%.":
    "ETANOL (antídoto disponible en Brasil): preparar solución al 10% — 100 mL de etanol absoluto + 900 mL de suero glucosado al 5%.",
  "Etanol IV — ataque 10 mL/kg da solução a 10% em 1 h; manutenção 1 mL/kg/h. Etilista crônico: 1,5 mL/kg/h. Em hemodiálise: 2,5–3,5 mL/kg/h.":
    "Etanol IV — carga 10 mL/kg de la solución al 10% en 1 h; mantenimiento 1 mL/kg/h. Bebedor crónico: 1,5 mL/kg/h. En hemodiálisis: 2,5–3,5 mL/kg/h.",
  "Alvo do etanol: etanolemia entre 100 e 150 mg/dL, com dosagem a cada 6–8 h.":
    "Objetivo del etanol: etanolemia entre 100 y 150 mg/dL, con medición cada 6–8 h.",
  "Sem etanol absoluto: destilado de boa procedência (40–50%) por sonda, em solução a 20% — ataque 5 mL/kg em 1 h, manutenção 0,5 mL/kg/h.":
    "Sin etanol absoluto: destilado de buena procedencia (40–50%) por sonda, en solución al 20% — carga 5 mL/kg en 1 h, mantenimiento 0,5 mL/kg/h.",
  "ÁCIDO FOLÍNICO (leucovorina) 50 mg IV em 30 min a cada 6 h no metanol — acelera a degradação do ácido fórmico. Sem folínico, usar ácido fólico.":
    "ÁCIDO FOLÍNICO (leucovorina) 50 mg IV en 30 min cada 6 h en el metanol — acelera la degradación del ácido fórmico. Sin folínico, usar ácido fólico.",
  "HEMODIÁLISE se: pH < 7,25, acidose persistente apesar do antídoto, ânion gap > 24, alteração visual refratária, distúrbio eletrolítico refratário, instabilidade hemodinâmica ou urgência dialítica. Preferir hemodiálise intermitente.":
    "HEMODIÁLISIS si: pH < 7,25, acidosis persistente pese al antídoto, ánion gap > 24, alteración visual refractaria, trastorno electrolítico refractario, inestabilidad hemodinámica o urgencia dialítica. Preferir hemodiálisis intermitente.",
  "Suspender o antídoto quando houver melhora clínica, resolução da acidose e ânion gap < 16 — mantendo gasometria a cada 4 h e exames a cada 8 h nas 24 h seguintes.":
    "Suspender el antídoto cuando haya mejoría clínica, resolución de la acidosis y ánion gap < 16 — manteniendo gasometría cada 4 h y exámenes cada 8 h en las 24 h siguientes.",

  // ── Carvão e antídotos ──
  "NÃO passar sonda apenas para administrar carvão, e NÃO intubar apenas para passar a sonda — via oral, ou só por sonda em quem já tem via aérea definitiva.":
    "NO colocar sonda solo para administrar carbón, y NO intubar solo para colocar la sonda — vía oral, o por sonda únicamente en quien ya tiene vía aérea definitiva.",
  "Doses múltiplas (0,5 g/kg a cada 4–6 h) em: carbamazepina, dapsona, fenobarbital, quinina e teofilina — a lista do position statement AACT/EAPCCT. Alguns protocolos brasileiros acrescentam fenitoína e salicilato.":
    "Dosis múltiples (0,5 g/kg cada 4–6 h) en: carbamazepina, dapsona, fenobarbital, quinina y teofilina — la lista del position statement AACT/EAPCCT. Algunos protocolos brasileños agregan fenitoína y salicilato.",
  "Sulfonilureia com hipoglicemia recorrente → Octreotide 50–100 mcg SC/IV a cada 6 h, ALÉM da glicose — a glicose isolada realimenta a secreção de insulina e a hipoglicemia recidiva.":
    "Sulfonilurea con hipoglucemia recurrente → Octreótido 50–100 mcg SC/IV cada 6 h, ADEMÁS de la glucosa — la glucosa sola realimenta la secreción de insulina y la hipoglucemia recidiva.",
};
