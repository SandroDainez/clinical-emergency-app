/**
 * Choque — diagnóstico diferencial e conduta — dicionário PT → ES.
 * Terminologia: choque hipovolémico/obstructivo/cardiogénico/distributivo,
 * neumotórax a tensión, taponamiento cardíaco, noradrenalina, PAM.
 *
 * Observação: identificadores de nó (sim, nao, q_obstrutivo…) são mapeados
 * para si mesmos — nunca devem ser traduzidos.
 */
export const ES_CHOQUE: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Há choque?": "¿Hay choque?",
  "Sem choque no momento": "Sin choque en este momento",
  "Sinais de hipovolemia?": "¿Signos de hipovolemia?",
  "Choque HIPOVOLÊMICO": "Choque HIPOVOLÉMICO",
  "Sinais de obstrução mecânica?": "¿Signos de obstrucción mecánica?",
  "Pneumotórax hipertensivo?": "¿Neumotórax a tensión?",
  "PNEUMOTÓRAX HIPERTENSIVO (obstrutivo)": "NEUMOTÓRAX A TENSIÓN (obstructivo)",
  "Tamponamento cardíaco?": "¿Taponamiento cardíaco?",
  "TAMPONAMENTO CARDÍACO (obstrutivo)": "TAPONAMIENTO CARDÍACO (obstructivo)",
  "TEP MACIÇO (obstrutivo)": "TEP MASIVO (obstructivo)",
  "Disfunção miocárdica primária?": "¿Disfunción miocárdica primaria?",
  "Choque CARDIOGÊNICO": "Choque CARDIOGÉNICO",
  "Vasodilatação / distributivo?": "¿Vasodilatación / distributivo?",
  "Suspeita de infecção?": "¿Sospecha de infección?",
  "Choque SÉPTICO (distributivo)": "Choque SÉPTICO (distributivo)",
  "Reação alérgica?": "¿Reacción alérgica?",
  "Choque ANAFILÁTICO (distributivo)": "Choque ANAFILÁCTICO (distributivo)",
  "Lesão medular recente?": "¿Lesión medular reciente?",
  "Choque NEUROGÊNICO (distributivo)": "Choque NEUROGÉNICO (distributivo)",
  "Choque DISTRIBUTIVO — outra causa": "Choque DISTRIBUTIVO — otra causa",
  "Choque — diagnóstico e conduta": "Choque — diagnóstico y conducta",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "PA sistólica < 90 mmHg ou queda ≥ 40 mmHg do basal (ou sinais de hipoperfusão)?":
    "¿PA sistólica < 90 mmHg o caída ≥ 40 mmHg respecto al valor basal (o signos de hipoperfusión)?",
  "Sangramento ativo, vômitos/diarreia, queimadura ou trauma com perda volêmica?":
    "¿Sangrado activo, vómitos/diarrea, quemadura o trauma con pérdida de volumen?",
  "Distensão venosa jugular, murmúrio ausente, ausência de pulso, sons cardíacos abafados?":
    "¿Ingurgitación yugular, murmullo vesicular ausente, ausencia de pulso o ruidos cardíacos apagados?",
  "Murmúrio ausente + desvio de traqueia + timpanismo (e hipotensão)?":
    "¿Murmullo vesicular ausente + desviación traqueal + timpanismo (e hipotensión)?",
  "Sons cardíacos abafados + distensão jugular + hipotensão (tríade de Beck)?":
    "¿Ruidos cardíacos apagados + ingurgitación yugular + hipotensión (tríada de Beck)?",
  "IAM, ICC grave, arritmia de alta FC ou contusão miocárdica?":
    "¿Infarto agudo de miocardio, insuficiencia cardíaca grave, arritmia con FC elevada o contusión miocárdica?",
  "Pele quente, pulso amplo, febre ou suspeita de infecção?":
    "¿Piel caliente, pulso amplio, fiebre o sospecha de infección?",
  "Foco infeccioso provável como causa?": "¿Foco infeccioso probable como causa?",
  "Exposição a alérgeno (inseto, alimento, medicamento), urticária/angioedema?":
    "¿Exposición a un alérgeno (insecto, alimento, medicamento), urticaria o angioedema?",
  "Trauma raquimedular com hipotensão + bradicardia (sem taquicardia compensatória)?":
    "¿Trauma raquimedular con hipotensión + bradicardia (sin taquicardia compensadora)?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Sem critérios de choque agora — avaliar outros diagnósticos e reavaliar.":
    "Sin criterios de choque por ahora — evaluar otros diagnósticos y reevaluar.",
  "Perda de volume (hemorrágico ou não). Perfil: PA↓ FC↑ PVC↓ pele fria/pálida DC↓ RVS↑.":
    "Pérdida de volumen (hemorrágica o no). Perfil: PA↓ FC↑ PVC↓ piel fría/pálida gasto cardíaco↓ RVS↑.",
  "Ar sob pressão no espaço pleural → colapso do retorno venoso. EMERGÊNCIA.":
    "Aire a presión en el espacio pleural → colapso del retorno venoso. EMERGENCIA.",
  "Líquido pericárdico sob pressão → restrição do enchimento. Pulso paradoxal.":
    "Líquido pericárdico a presión → restricción del llenado. Pulso paradójico.",
  "Obstrução da circulação pulmonar → falência aguda de VD. Taquicardia, hipóxia, fator de risco.":
    "Obstrucción de la circulación pulmonar → fallo agudo del ventrículo derecho. Taquicardia, hipoxia y factor de riesgo.",
  "Falência de bomba. Perfil: PA↓ FC↑ PVC↑ pele fria DC↓↓ RVS↑↑.":
    "Fallo de bomba. Perfil: PA↓ FC↑ PVC↑ piel fría gasto cardíaco↓↓ RVS↑↑.",
  "Vasoplegia por resposta à infecção. Perfil: RVS↓ DC↑/normal pele quente.":
    "Vasoplejía por la respuesta a la infección. Perfil: RVS↓ gasto cardíaco↑/normal piel caliente.",
  "Hipersensibilidade sistêmica → vasodilatação + ↑ permeabilidade + broncoespasmo.":
    "Hipersensibilidad sistémica → vasodilatación + ↑ permeabilidad + broncoespasmo.",
  "Perda do tônus simpático por lesão medular. Perfil: PA↓ FC↓/normal pele quente/seca.":
    "Pérdida del tono simpático por lesión medular. Perfil: PA↓ FC↓/normal piel caliente y seca.",
  "Distributivo sem foco séptico/alérgico/medular claro.":
    "Distributivo sin un foco séptico, alérgico o medular claro.",

  // ── Opções e atalhos ───────────────────────────────────────────────────────
  "Sim — choque / hipoperfusão": "Sí — choque / hipoperfusión",
  "Não": "No",
  "Sim": "Sí",
  "Sim — investigar obstrutivo": "Sí — investigar causa obstructiva",
  "Não — TEP maciço?": "No — ¿TEP masivo?",
  "Guia de TEP": "Guía de TEP",
  "Síndromes coronarianas": "Síndromes coronarios",
  "Drogas vasoativas": "Fármacos vasoactivos",
  "Sim — distributivo": "Sí — distributivo",
  "Não / indefinido": "No / indefinido",
  "Sim — séptico": "Sí — séptico",
  "Guia da sepse": "Guía de la sepsis",
  "Sim — anafilático": "Sí — anafiláctico",
  "Guia de anafilaxia": "Guía de anafilaxia",
  "Sim — neurogênico": "Sí — neurogénico",
  "Estratificação e reperfusão do tromboembolismo pulmonar.":
    "Estratificación y reperfusión del tromboembolismo pulmonar.",
  "Se IAM como causa — reperfusão.": "Si el infarto es la causa — reperfusión.",
  "Titulação de inotrópico/vasopressor.": "Titulación de inotrópico/vasopresor.",
  "Bundle da 1ª hora e ressuscitação.": "Paquete de la 1.ª hora y reanimación.",
  "Adrenalina IM e manejo escalonado.": "Adrenalina IM y manejo escalonado.",
  "Suporte vasopressor.": "Soporte vasopresor.",

  // ── Evidência e ações ──────────────────────────────────────────────────────
  "Hipoperfusão: lactato ↑, oligúria, pele marmórea/fria, alteração de consciência, enchimento capilar lento.":
    "Hipoperfusión: lactato ↑, oliguria, piel moteada o fría, alteración de la consciencia y llenado capilar lento.",
  "Estabilização sempre primeiro: O₂, acessos, volume conforme contexto, monitorização.":
    "Estabilización siempre primero: O₂, accesos, volumen según el contexto y monitorización.",
  "Veias colabadas, resposta a volume, hematócrito/lactato, foco de perda evidente.":
    "Venas colapsadas, respuesta al volumen, hematocrito/lactato y foco de pérdida evidente.",
  "Pensar em pneumotórax hipertensivo, tamponamento e TEP maciço.":
    "Pensar en neumotórax a tensión, taponamiento cardíaco y TEP masivo.",
  "Perfil: pele fria, congestão, DC↓↓ e RVS↑↑.":
    "Perfil: piel fría, congestión, gasto cardíaco↓↓ y RVS↑↑.",
  "Perfil distributivo: RVS↓, DC normal/↑ (fase inicial).":
    "Perfil distributivo: RVS↓, gasto cardíaco normal o ↑ (fase inicial).",
  "Investigar a causa dos sintomas; reavaliar PA, FC, perfusão e lactato seriado.":
    "Investigar la causa de los síntomas; reevaluar PA, FC, perfusión y lactato seriado.",
  "Manter vigilância — escalar imediatamente se surgir hipotensão/hipoperfusão.":
    "Mantener la vigilancia — escalar de inmediato si aparece hipotensión o hipoperfusión.",
  "Mecanismo: redução da pré-carga por perda de volume (sangue, fluidos).":
    "Mecanismo: reducción de la precarga por pérdida de volumen (sangre, líquidos).",
  "Confirmar: resposta a volume, foco de perda, Hb/lactato, USG (FAST/VCI colabável).":
    "Confirmar: respuesta al volumen, foco de pérdida, hemoglobina/lactato y ecografía (FAST/vena cava inferior colapsable).",
  "Ações: 2 acessos calibrosos; cristaloide em bolus; controlar a fonte (hemostasia/cirurgia); hemoderivados e protocolo de transfusão maciça se hemorrágico; reavaliar resposta.":
    "Acciones: 2 accesos gruesos; cristaloide en bolo; controlar la fuente (hemostasia/cirugía); hemoderivados y protocolo de transfusión masiva si es hemorrágico; reevaluar la respuesta.",
  "Mecanismo: aumento da pressão intratorácica → ↓ retorno venoso → ↓ DC.":
    "Mecanismo: aumento de la presión intratorácica → ↓ retorno venoso → ↓ gasto cardíaco.",
  "Confirmar: clínico (não aguardar RX) — murmúrio ausente unilateral, desvio de traqueia, hipotensão, hipóxia.":
    "Confirmar: es clínico (no esperar la radiografía) — murmullo vesicular ausente unilateral, desviación traqueal, hipotensión e hipoxia.",
  "Ações: descompressão IMEDIATA — agulha 14G no 2º EIC linha hemiclavicular (ou 5º EIC linha axilar média) → drenagem pleural definitiva.":
    "Acciones: descompresión INMEDIATA — aguja 14G en el 2.º espacio intercostal en la línea medioclavicular (o el 5.º espacio intercostal en la línea axilar media) → drenaje pleural definitivo.",
  "Mecanismo: ↑ pressão pericárdica → ↓ enchimento diastólico → ↓ DC.":
    "Mecanismo: ↑ presión pericárdica → ↓ llenado diastólico → ↓ gasto cardíaco.",
  "Confirmar: ECO à beira leito (derrame + colapso de câmaras), pulso paradoxal, baixa voltagem/alternância elétrica no ECG.":
    "Confirmar: ecocardiograma a pie de cama (derrame + colapso de cavidades), pulso paradójico, bajo voltaje o alternancia eléctrica en el ECG.",
  "Ações: expansão volêmica como ponte; PERICARDIOCENTESE de urgência (guiada por ECO); tratar a causa.":
    "Acciones: expansión de volumen como puente; PERICARDIOCENTESIS urgente (guiada por ecocardiograma); tratar la causa.",
  "Mecanismo: ↑ pós-carga aguda do VD → ↓ débito do VE.":
    "Mecanismo: ↑ poscarga aguda del ventrículo derecho → ↓ gasto del ventrículo izquierdo.",
  "Confirmar: ECO (dilatação/disfunção de VD, McConnell), AngioTC quando estável; D-dímero não exclui no alto risco.":
    "Confirmar: ecocardiograma (dilatación/disfunción del ventrículo derecho, signo de McConnell) y angiotomografía cuando esté estable; el dímero D no descarta en el alto riesgo.",
  "Ações: HNF imediata; suporte com fluidos cautelosos + noradrenalina/dobutamina; TROMBÓLISE se instável sem contraindicação. Ver o guia de TEP.":
    "Acciones: heparina no fraccionada de inmediato; soporte con líquidos cautelosos + noradrenalina/dobutamina; TROMBÓLISIS si está inestable y sin contraindicación. Ver la guía de TEP.",
  "Mecanismo: ↓ contratilidade / falência de bomba → ↓ DC com congestão.":
    "Mecanismo: ↓ contractilidad / fallo de bomba → ↓ gasto cardíaco con congestión.",
  "Confirmar: ECG (IAM/arritmia), troponina, ECO (FE, função de VD), congestão pulmonar.":
    "Confirmar: ECG (infarto/arritmia), troponina, ecocardiograma (fracción de eyección, función del ventrículo derecho) y congestión pulmonar.",
  "Ações: EVITAR volume agressivo; inotrópico (dobutamina) + vasopressor (noradrenalina); tratar a causa (reperfusão no IAM; cardioversão na arritmia instável); considerar suporte mecânico (BIA/Impella/ECMO).":
    "Acciones: EVITAR el volumen agresivo; inotrópico (dobutamina) + vasopresor (noradrenalina); tratar la causa (reperfusión en el infarto; cardioversión en la arritmia inestable); considerar el soporte mecánico (balón de contrapulsación/Impella/ECMO).",
  "Mecanismo: vasodilatação + disfunção microcirculatória por infecção.":
    "Mecanismo: vasodilatación + disfunción microcirculatoria por la infección.",
  "Confirmar: foco infeccioso, lactato > 2, necessidade de vasopressor para PAM ≥ 65.":
    "Confirmar: foco infeccioso, lactato > 2 y necesidad de vasopresor para una PAM ≥ 65.",
  "Ações: bundle da 1ª hora — lactato + culturas + ATB amplo ≤ 1 h + cristaloide 30 mL/kg + noradrenalina (PAM ≥ 65). Controle do foco. Ver o guia da sepse.":
    "Acciones: paquete de la 1.ª hora — lactato + cultivos + antibiótico de amplio espectro en ≤ 1 h + cristaloide 30 mL/kg + noradrenalina (PAM ≥ 65). Control del foco. Ver el protocolo de sepsis.",
  "Mecanismo: liberação maciça de mediadores → vasoplegia, edema, broncoespasmo.":
    "Mecanismo: liberación masiva de mediadores → vasoplejía, edema y broncoespasmo.",
  "Confirmar: exposição + acometimento de pele/mucosa + comprometimento respiratório/hemodinâmico.":
    "Confirmar: exposición + afectación cutáneo-mucosa + compromiso respiratorio o hemodinámico.",
  "Ações: ADRENALINA IM IMEDIATA (0,3–0,5 mg coxa); O₂; cristaloide; repetir adrenalina; via aérea se angioedema. Ver o guia de anafilaxia.":
    "Acciones: ADRENALINA IM INMEDIATA (0,3–0,5 mg en el muslo); O₂; cristaloide; repetir la adrenalina; asegurar la vía aérea si hay angioedema. Ver el protocolo de anafilaxia.",
  "Mecanismo: vasodilatação + bradicardia por perda simpática (lesão medular alta).":
    "Mecanismo: vasodilatación + bradicardia por pérdida del tono simpático (lesión medular alta).",
  "Confirmar: trauma raquimedular, hipotensão SEM taquicardia, déficit neurológico.":
    "Confirmar: trauma raquimedular, hipotensión SIN taquicardia y déficit neurológico.",
  "Ações: volume com cautela; vasopressor (noradrenalina); atropina/marcapasso se bradicardia sintomática; imobilização e manejo neurocirúrgico.":
    "Acciones: volumen con cautela; vasopresor (noradrenalina); atropina o marcapasos si hay bradicardia sintomática; inmovilización y manejo neuroquirúrgico.",
  "Considerar: insuficiência adrenal (crise addisoniana), intoxicações (vasodilatadores), pós-bypass, hepatopatia.":
    "Considerar: insuficiencia suprarrenal (crisis addisoniana), intoxicaciones (vasodilatadores), poscirculación extracorpórea y hepatopatía.",
  "Ações: ressuscitação volêmica + noradrenalina; investigar causa (cortisol, história medicamentosa); hidrocortisona se suspeita de insuficiência adrenal.":
    "Acciones: reanimación con volumen + noradrenalina; investigar la causa (cortisol, historia farmacológica); hidrocortisona si se sospecha insuficiencia suprarrenal.",

  // ── Identificadores de nó (não traduzir) ───────────────────────────────────
  "sim": "sim",
  "nao": "nao",
  "dx_hipovolemico": "dx_hipovolemico",
  "q_obstrutivo": "q_obstrutivo",
  "q_pneumotorax": "q_pneumotorax",
  "q_cardiogenico": "q_cardiogenico",
  "dx_cardiogenico": "dx_cardiogenico",
  "q_distributivo": "q_distributivo",
  "q_septico": "q_septico",
  "dx_distributivo_outro": "dx_distributivo_outro",
  "INÍCIO: 2,5 mcg/kg/min sempre, e titular em intervalos de poucos minutos pela resposta — a bula manda começar pela menor dose, qualquer que seja a indicação.": "INICIO: 2,5 mcg/kg/min siempre, y titular a intervalos de pocos minutos según la respuesta — el prospecto indica comenzar por la dosis menor, cualquiera sea la indicación.",
  "FAIXA USUAL: 2,5–10 mcg/kg/min (bula do cloridrato de dobutamina 12,5 mg/mL). É onde a maioria responde.": "RANGO HABITUAL: 2,5–10 mcg/kg/min (prospecto del clorhidrato de dobutamina 12,5 mg/mL). Es donde responde la mayoría.",
  "ATÉ 20 mcg/kg/min quando necessário — a bula registra que doses até 20 são frequentemente necessárias para melhora hemodinâmica adequada. ⚠️ MAS SUBIR TEM TRÊS CUSTOS: (1) taquiarritmia e aumento do consumo miocárdico de O₂, que é a razão pela qual tetos menores foram escritos por aí; (2) PIORA DA HIPOTENSÃO por vasodilatação beta-2 — na sepse é armadilha real, porque quem sobe a dose por hipoperfusão pode derrubar a PA e agravar exatamente o que quis tratar; (3) a titulação é por MARCADORES DE PERFUSÃO — lactato, débito urinário, perfusão periférica — e NUNCA por atingir um número da faixa. Chegar a 20 não é meta.": "HASTA 20 mcg/kg/min cuando sea necesario — el prospecto registra que dosis de hasta 20 son frecuentemente necesarias para una mejoría hemodinámica adecuada. ⚠️ PERO SUBIR TIENE TRES COSTOS: (1) taquiarritmia y aumento del consumo miocárdico de O₂, que es la razón por la cual se escribieron topes menores por ahí; (2) EMPEORAMIENTO DE LA HIPOTENSIÓN por vasodilatación beta-2 — en la sepsis es una trampa real, porque quien sube la dosis por hipoperfusión puede derribar la PA y agravar exactamente lo que quiso tratar; (3) la titulación es por MARCADORES DE PERFUSIÓN — lactato, diuresis, perfusión periférica — y NUNCA por alcanzar un número del rango. Llegar a 20 no es una meta.",
  "⚠️ RECOMENDAÇÃO FRACA. A SSC 2026 sugere INOTRÓPICO versus nenhum inotrópico no choque séptico com disfunção cardíaca e hipoperfusão persistente apesar de volume e PA adequados — e, como sugestão fraca, adicionar dobutamina à noradrenalina OU usar adrenalina isolada. A escolha do agente foi REBAIXADA em relação a 2021, e os dados são insuficientes para decidir entre dobutamina e milrinona. Não é a resposta certa: é a opção razoável com a evidência que existe.": "⚠️ RECOMENDACIÓN DÉBIL. La SSC 2026 sugiere INOTRÓPICO frente a ningún inotrópico en el choque séptico con disfunción cardíaca e hipoperfusión persistente pese a volumen y PA adecuados — y, como sugerencia débil, añadir dobutamina a la noradrenalina O usar adrenalina sola. La elección del agente fue DEGRADADA respecto a 2021, y los datos son insuficientes para decidir entre dobutamina y milrinona. No es la respuesta correcta: es la opción razonable con la evidencia que existe.",
  "Dobutamina — início": "Dobutamina — inicio",
  "Dobutamina — faixa usual": "Dobutamina — rango habitual",
  "Dobutamina — subir além da faixa": "Dobutamina — subir más allá del rango",
  "Dobutamina — indicação": "Dobutamina — indicación",
  "Dobutamina se IC baixo com PAM adequada": "Dobutamina si el GC es bajo con PAM adecuada",
  "2,5–10 mcg/kg/min (início 2,5; até 20 se necessário)": "2,5–10 mcg/kg/min (inicio 2,5; hasta 20 si es necesario)",
  "   - Se disfunção VE: considerar inotrópico (ver regime da dobutamina)": "   - Si hay disfunción del VI: considerar inotrópico (ver el régimen de la dobutamina)",
  "INOTRÓPICO 1ª linha — DOBUTAMINA IV (aumenta DC, reduz PCWP). Diluir 250 mg em 250 mL.": "INOTRÓPICO de 1.ª línea — DOBUTAMINA IV (aumenta el GC, reduce la PCWP). Diluir 250 mg en 250 mL.",
  "DISFUNÇÃO MIOCÁRDICA séptica (baixo DC apesar de PAM ≥ 65: ScvO₂ < 70%, lactato persistente): considerar INOTRÓPICO — não de rotina.": "DISFUNCIÓN MIOCÁRDICA séptica (bajo GC pese a PAM ≥ 65: ScvO₂ < 70%, lactato persistente): considerar INOTRÓPICO — no de rutina.",
  "Vasopressor: norepinefrina 0,1–1 mcg/kg/min para PAM ≥ 65. Dobutamina se baixo débito com PA mantida. Evitar hipóxia/hipercapnia.": "Vasopresor: noradrenalina 0,1–1 mcg/kg/min para PAM ≥ 65. Dobutamina si hay bajo gasto con PA mantenida. Evitar hipoxia/hipercapnia.",
  "Inotrópico (baixo DC)": "Inotrópico (bajo GC)",
  "⚠️ A HIPOTENSÃO NÃO É OBRIGATÓRIA PARA O DIAGNÓSTICO. Taquicardia e vasoconstrição podem preservar a pressão na fase inicial — é o choque compensado, e responder NÃO aqui por causa de uma PA normal é o erro mais comum deste nó. Olhe PELE, RIM e CÉREBRO antes de olhar o número.":
    "⚠️ LA HIPOTENSIÓN NO ES OBLIGATORIA PARA EL DIAGNÓSTICO. Taquicardia y vasoconstricción pueden preservar la presión en la fase inicial — es el choque compensado, y responder NO aquí por una PA normal es el error más común de este nodo. Mire PIEL, RIÑÓN y CEREBRO antes de mirar el número.",
  "⚠️ CHOQUE CARDIOGÊNICO NÃO É SINÔNIMO DE IAM. Síndrome coronariana aguda continua sendo causa crítica e tempo-dependente, mas insuficiência cardíaca aguda/descompensada, arritmias e complicações mecânicas também representam parcela importante dos casos contemporâneos. Faça ECG precocemente e use ecocardiografia para definir o fenótipo; se o subtipo não estiver claro, siga em 'Não definido' e reavalie.":
    "⚠️ EL CHOQUE CARDIOGÉNICO NO ES SINÓNIMO DE INFARTO. El síndrome coronario agudo sigue siendo una causa crítica y tiempo-dependiente, pero la insuficiencia cardiaca aguda/descompensada, las arritmias y las complicaciones mecánicas también representan una parte importante de los casos contemporáneos. Obtenga un ECG precoz y use ecocardiografía para definir el fenotipo; si el subtipo no está claro, siga en 'No definido' y reevalúe.",  "Lactato elevado associado a sinais clínicos de má perfusão aumenta muito a suspeita de choque mesmo com pressão normal, mas não deve ser usado isoladamente para fechar o diagnóstico: interpretar tendência, contexto, depuração e causas não hipóxicas de hiperlactatemia.": "El lactato elevado asociado a signos clínicos de mala perfusión aumenta mucho la sospecha de shock incluso con presión normal, pero no debe usarse de forma aislada para confirmar el diagnóstico: interpretar tendencia, contexto, depuración y causas no hipóxicas de hiperlactatemia.",
  "Perfusão e pressão: usar PAM como alvo inicial e individualizar pela etiologia e pelo paciente. No choque séptico, PAM 65 mmHg é o alvo inicial de referência; em outros fenótipos, ajustar conforme perfusão, história de hipertensão, cérebro/coração e resposta ao tratamento. Acompanhar lactato seriado quando elevado, mas não perseguir normalização ou queda percentual horária como meta isolada.": "Perfusión y presión: usar la PAM como objetivo inicial e individualizar según etiología y paciente. En shock séptico, una PAM de 65 mmHg es el objetivo inicial de referencia; en otros fenotipos, ajustar según perfusión, antecedente de hipertensión, cerebro/corazón y respuesta al tratamiento. Seguir lactato seriado cuando esté elevado, pero no perseguir normalización ni una caída porcentual por hora como objetivo aislado.",
  "Fluidos: após a abordagem inicial, só continuar expansão quando houver indicação clínica e probabilidade de responsividade. Preferir variáveis dinâmicas (elevação passiva das pernas, mudança de volume sistólico/débito após pequena prova de fluido, variação de pressão de pulso quando aplicável) a marcadores estáticos isolados; reavaliar perfusão e sinais de congestão após cada intervenção.": "Fluidos: después del abordaje inicial, continuar expansión solo cuando exista indicación clínica y probabilidad de respuesta. Preferir variables dinámicas (elevación pasiva de piernas, cambio de volumen sistólico/gasto tras una pequeña prueba de fluido, variación de presión de pulso cuando corresponda) a marcadores estáticos aislados; reevaluar perfusión y signos de congestión tras cada intervención.",
  "Pressão arterial invasiva: considerar cateter arterial quando o choque não responder à terapia inicial e/ou houver necessidade de infusão vasopressora, especialmente se titulação rápida ou medidas não invasivas forem pouco confiáveis — não esperar uma dose fixa de noradrenalina para indicar.": "Presión arterial invasiva: considerar catéter arterial cuando el shock no responda a la terapia inicial y/o exista necesidad de infusión vasopresora, especialmente si se requiere titulación rápida o las mediciones no invasivas son poco fiables; no esperar una dosis fija de noradrenalina para indicarlo.",
  "Investigação inicial dirigida: obter rapidamente lactato e exames básicos de função orgânica/metabólica, ECG quando pertinente e exames etiológicos conforme o fenótipo. Não pedir D-dímero, fibrinogênio, troponina, radiografia ou ecocardiograma como painel obrigatório para todo choque; cada exame deve responder a uma hipótese clínica ou necessidade de monitorização.": "Investigación inicial dirigida: obtener rápidamente lactato y estudios básicos de función orgánica/metabólica, ECG cuando corresponda y pruebas etiológicas según el fenotipo. No solicitar dímero D, fibrinógeno, troponina, radiografía o ecocardiograma como panel obligatorio para todo shock; cada prueba debe responder a una hipótesis clínica o necesidad de monitorización.",
  "Ecocardiografia/POCUS é a modalidade de imagem de primeira linha para definir o tipo de choque quando disponível, especialmente se a causa não for evidente, houver choque persistente após terapia inicial ou deterioração rápida. Integrar coração, pulmões, veias e contexto clínico; não usar um achado ultrassonográfico isolado como diagnóstico definitivo.": "La ecocardiografía/POCUS es la modalidad de imagen de primera línea para definir el tipo de shock cuando esté disponible, especialmente si la causa no es evidente, persiste el shock tras la terapia inicial o existe deterioro rápido. Integrar corazón, pulmones, venas y contexto clínico; no usar un hallazgo ecográfico aislado como diagnóstico definitivo.",
  "Ações: obter acessos calibrosos e controlar a fonte sem demora. Se o choque for HEMORRÁGICO, priorizar ressuscitação hemostática/hemocomponentes conforme protocolo e estratégia de volume restritiva até controle do sangramento, evitando grandes volumes de cristaloide. Se a perda for NÃO hemorrágica e houver plausibilidade de responsividade a volume, usar pequenas alíquotas de cristaloide com reavaliação imediata da perfusão e congestão.": "Acciones: obtener accesos de buen calibre y controlar la fuente sin demora. Si el shock es HEMORRÁGICO, priorizar reanimación hemostática/hemoderivados según protocolo y una estrategia restrictiva de volumen hasta controlar el sangrado, evitando grandes volúmenes de cristaloides. Si la pérdida NO es hemorrágica y existe probabilidad de respuesta a fluidos, usar pequeñas alícuotas de cristaloide con reevaluación inmediata de perfusión y congestión.",
  "No trauma hemorrágico SEM evidência de lesão cerebral grave, usar estratégia restritiva até controle da hemorragia; a diretriz europeia de trauma usa PAS 80–90 mmHg (PAM 50–60 mmHg) como alvo inicial. Em TCE grave (Glasgow ≤8), evitar hipotensão permissiva e manter PAM ≥80 mmHg enquanto se individualiza PPC/ressuscitação. Não aplicar esses alvos automaticamente a hemorragia não traumática, idosos frágeis ou hipertensos crônicos.": "En trauma hemorrágico SIN evidencia de lesión cerebral grave, usar estrategia restrictiva hasta controlar la hemorragia; la guía europea de trauma utiliza PAS 80–90 mmHg (PAM 50–60 mmHg) como objetivo inicial. En TCE grave (Glasgow ≤8), evitar hipotensión permisiva y mantener PAM ≥80 mmHg mientras se individualiza PPC/reanimación. No aplicar estos objetivos automáticamente a hemorragia no traumática, adultos mayores frágiles o hipertensos crónicos.",
  "Há instabilidade/peri-parada com sinais que sugiram obstrução ao enchimento ou à circulação pulmonar (pneumotórax hipertensivo, tamponamento ou TEP de alto risco)?": "¿Hay inestabilidad/periparada con signos que sugieran obstrucción al llenado o a la circulación pulmonar (neumotórax a tensión, taponamiento o TEP de alto riesgo)?",
  "Há deterioração hemodinâmica/respiratória com forte suspeita de pneumotórax hipertensivo (por exemplo, trauma ou ventilação com pressão positiva + redução/ausência unilateral do murmúrio, hipoxemia ou enfisema subcutâneo)?": "¿Hay deterioro hemodinámico/respiratorio con alta sospecha de neumotórax a tensión (por ejemplo, trauma o ventilación con presión positiva + reducción/ausencia unilateral del murmullo, hipoxemia o enfisema subcutáneo)?",
  "Diagnóstico no paciente instável é clínico e/ou por POCUS — NÃO aguardar radiografia. Desvio traqueal e distensão jugular são sinais possíveis, frequentemente tardios, e sua ausência não exclui pneumotórax hipertensivo.": "En el paciente inestable el diagnóstico es clínico y/o por POCUS: NO esperar radiografía. La desviación traqueal y la ingurgitación yugular son signos posibles, a menudo tardíos, y su ausencia no excluye neumotórax a tensión.",
  "Há contexto e achados compatíveis com tamponamento (por exemplo, derrame conhecido/pericardite, pós-operatório cardíaco ou trauma penetrante) com instabilidade e POCUS sugestivo?": "¿Existe contexto y hallazgos compatibles con taponamiento (por ejemplo, derrame conocido/pericarditis, posoperatorio cardíaco o trauma penetrante) con inestabilidad y POCUS sugestivo?",
  "Confirmar prioritariamente com ecocardiografia/POCUS à beira leito no instável, integrando derrame pericárdico, sinais de comprometimento do enchimento e contexto clínico. A tríade de Beck, pulso paradoxal, baixa voltagem e alternância elétrica podem ocorrer, mas não são necessários nem suficientemente sensíveis para excluir tamponamento.": "Confirmar prioritariamente con ecocardiografía/POCUS a pie de cama en el paciente inestable, integrando derrame pericárdico, signos de compromiso del llenado y contexto clínico. La tríada de Beck, pulso paradójico, bajo voltaje y alternancia eléctrica pueden aparecer, pero no son necesarios ni suficientemente sensibles para excluir taponamiento.",
  "Ações no TEP de ALTO RISCO com choque/hipotensão persistente: priorizar reperfusão emergencial — trombólise sistêmica quando indicada; em contraindicação ou falha, considerar embolectomia cirúrgica ou tratamento dirigido por cateter conforme expertise/recursos. Usar HNF quando anticoagulação estiver indicada no contexto de reperfusão. Evitar expansão volêmica agressiva; considerar pequena carga apenas se houver baixa pressão de enchimento. Noradrenalina é o vasopressor de escolha na hipotensão/choque; dobutamina pode ser considerada em baixo débito com pressão preservada, não como associação automática.": "Acciones en TEP de ALTO RIESGO con shock/hipotensión persistente: priorizar reperfusión urgente, con trombólisis sistémica cuando esté indicada; ante contraindicación o fracaso, considerar embolectomía quirúrgica o tratamiento dirigido por catéter según experiencia/recursos. Usar HNF cuando la anticoagulación esté indicada en el contexto de reperfusión. Evitar expansión agresiva de volumen; considerar una pequeña carga solo si hay baja presión de llenado. La noradrenalina es el vasopresor de elección en hipotensión/shock; la dobutamina puede considerarse en bajo gasto con presión conservada, no como asociación automática.",
  "Mecanismo: falência predominante do VD reduz o enchimento do VE. No IAM de VD pode haver dependência de pré-carga, mas volume NÃO é tratamento automático: avaliar congestão, pressão de enchimento e resposta hemodinâmica; excesso de volume pode dilatar o VD e piorar o débito.": "Mecanismo: la falla predominante del VD reduce el llenado del VI. En el infarto de VD puede existir dependencia de precarga, pero el volumen NO es un tratamiento automático: evaluar congestión, presión de llenado y respuesta hemodinámica; el exceso de volumen puede dilatar el VD y empeorar el gasto.",
  "Ações: definir rapidamente etiologia e fenótipo com ecocardiografia e, quando necessário, hemodinâmica invasiva. Na hipotensão, usar noradrenalina como vasopressor de primeira linha; adicionar inotrópico quando baixo débito persistir apesar de pressão/perfusão coronariana adequadas. Dar fluido apenas quando houver evidência de hipovolemia ou provável responsividade. Tratar a causa sem demora (revascularização no IAM, correção de arritmia ou complicação mecânica). Suporte circulatório mecânico NÃO é rotina universal: selecionar dispositivo/estratégia por fenótipo, gravidade, anatomia, risco e equipe de choque, com transferência precoce se o centro não dispuser de suporte avançado.": "Acciones: definir rápidamente etiología y fenotipo con ecocardiografía y, cuando sea necesario, hemodinámica invasiva. En hipotensión, usar noradrenalina como vasopresor de primera línea; añadir inotrópico cuando persista bajo gasto pese a presión/perfusión coronaria adecuadas. Administrar fluidos solo con evidencia de hipovolemia o probable respuesta. Tratar la causa sin demora. El soporte circulatorio mecánico NO es una rutina universal: seleccionar dispositivo/estrategia según fenotipo, gravedad, anatomía, riesgo y equipo de shock, con traslado precoz si el centro no dispone de soporte avanzado.",
  "Há suspeita de choque distributivo/vasoplégico (por exemplo, infecção, anafilaxia, lesão medular ou causa endócrina/tóxica), mesmo que a pele não esteja quente?": "¿Hay sospecha de shock distributivo/vasopléjico (por ejemplo, infección, anafilaxia, lesión medular o causa endocrina/tóxica), aunque la piel no esté caliente?",
  "Vasoplegia e disfunção microcirculatória por infecção. O débito pode ser alto, normal ou baixo e a pele pode deixar de ser quente conforme o choque evolui.": "Vasoplejía y disfunción microcirculatoria por infección. El gasto puede ser alto, normal o bajo y la piel puede dejar de estar caliente a medida que evoluciona el shock.",
  "Ações conforme SSC 2026: iniciar tratamento imediatamente; colher culturas o quanto antes e idealmente antes do antimicrobiano sem atrasá-lo; no choque séptico, antimicrobiano imediatamente, idealmente em até 1 h. Em hipoperfusão induzida por sepse/choque séptico, considerar pelo menos 30 mL/kg de cristaloide nas primeiras 3 h, individualizando por comorbidades e reavaliando frequentemente. Se o choque estiver muito instável, vasopressor pode ser iniciado em paralelo aos fluidos e por acesso periférico enquanto se obtém acesso definitivo. Noradrenalina é primeira linha; alvo inicial de PAM 65 mmHg (em ≥65 anos, 60–65 mmHg pode ser considerado). Em doses crescentes de noradrenalina, adicionar vasopressina; se PAM seguir inadequada, considerar adrenalina. Se houver disfunção cardíaca com hipoperfusão persistente apesar de volume e pressão adequados, considerar dobutamina associada à noradrenalina ou adrenalina isolada. Controle do foco sem demora. Ver o guia da sepse.": "Acciones según SSC 2026: iniciar tratamiento inmediatamente; obtener cultivos lo antes posible e idealmente antes del antimicrobiano sin retrasarlo; en shock séptico, antimicrobiano inmediatamente, idealmente dentro de 1 h. En hipoperfusión inducida por sepsis/shock séptico, considerar al menos 30 mL/kg de cristaloide en las primeras 3 h, individualizando según comorbilidades y reevaluando con frecuencia. Si el shock es muy inestable, puede iniciarse vasopresor en paralelo con fluidos y por acceso periférico mientras se obtiene acceso definitivo. Noradrenalina es primera línea; objetivo inicial de PAM 65 mmHg (en ≥65 años puede considerarse 60–65 mmHg). Con dosis crecientes de noradrenalina, añadir vasopresina; si la PAM sigue inadecuada, considerar adrenalina. Si existe disfunción cardíaca con hipoperfusión persistente pese a volumen y presión adecuados, considerar dobutamina asociada a noradrenalina o adrenalina sola. Control de foco sin demora. Ver guía de sepsis.",
  "Choque por valvopatia aguda ou complicação mecânica do IAM exige ecocardiografia imediata e Heart Team/equipe de choque precocemente; a terapia farmacológica é ponte para correção definitiva, não substituto de intervenção.": "El shock por valvulopatía aguda o complicación mecánica del infarto exige ecocardiografía inmediata y Heart Team/equipo de shock precozmente; la terapia farmacológica es un puente hacia la corrección definitiva, no un sustituto de la intervención.",
  "A estratégia hemodinâmica depende da LESÃO e do fenótipo. Evitar receitas universais do tipo ‘dopamina na insuficiência aórtica’, ‘amiodarona na estenose mitral’ ou ‘balão intra-aórtico para toda insuficiência mitral’: pressão, frequência, pré/pós-carga e suporte mecânico devem ser individualizados com eco e, quando necessário, hemodinâmica invasiva.": "La estrategia hemodinámica depende de la LESIÓN y del fenotipo. Evitar recetas universales como “dopamina en insuficiencia aórtica”, “amiodarona en estenosis mitral” o “balón intraaórtico para toda insuficiencia mitral”: presión, frecuencia, precarga/poscarga y soporte mecánico deben individualizarse con ecografía y, cuando sea necesario, hemodinámica invasiva.",
  "Suspeita de ruptura de músculo papilar/insuficiência mitral aguda, comunicação interventricular pós-IAM ou ruptura de parede livre exige cirurgia/intervenção estrutural imediata ou transferência urgente para centro capaz; suporte vasoativo/MCS, quando usados, são ponte selecionada pela anatomia e pelo fenótipo.": "La sospecha de rotura de músculo papilar/insuficiencia mitral aguda, comunicación interventricular postinfarto o rotura de pared libre exige cirugía/intervención estructural inmediata o traslado urgente a un centro capaz; el soporte vasoactivo/MCS, cuando se usa, es un puente seleccionado según anatomía y fenotipo.",

};
