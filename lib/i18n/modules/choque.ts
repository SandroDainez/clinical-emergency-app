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
};
