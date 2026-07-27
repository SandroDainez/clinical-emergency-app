/**
 * Anafilaxia (engine) — dicionário PT → ES. Parte A de B.
 * Classificação WAO, decisão sobre 1ª/2ª dose de adrenalina, fases do fluxo,
 * critérios diagnósticos, via aérea, volume e vasoativo.
 */
export const ES_ANAFILAXIA_ENG_A: Record<string, string> = {
  // ── Classificação e gravidade ──────────────────────────────────────────────
  "ANAFILAXIA GRAVE — oxigênio + adrenalina IM urgente; preparar IOT/VM e proceder se não houver melhora rápida ou houver deterioração.":
    "ANAFILAXIA GRAVE — oxígeno + adrenalina IM urgente; preparar la intubación y la ventilación mecánica, y proceder si no hay mejoría rápida o si hay deterioro.",
  "ANAFILAXIA MODERADA — adrenalina IM agora. Observação ≥ 6 h. Pode progredir para choque.":
    "ANAFILAXIA MODERADA — adrenalina IM ahora. Observación ≥ 6 h. Puede progresar a choque.",
  "CHOQUE ANAFILÁTICO com rebaixamento — adrenalina IM imediata, oxigênio e preparo imediato para via aérea definitiva.":
    "CHOQUE ANAFILÁCTICO con deterioro del sensorio — adrenalina IM inmediata, oxígeno y preparación inmediata de la vía aérea definitiva.",
  "REAÇÃO ALÉRGICA ISOLADA — sem critérios de anafilaxia. Anti-H1 de 1ª linha; ter adrenalina disponível.":
    "REACCIÓN ALÉRGICA AISLADA — sin criterios de anafilaxia. Anti-H1 de 1.ª línea; tener la adrenalina disponible.",
  "Grau I — Reação alérgica isolada": "Grado I — Reacción alérgica aislada",
  "Grau I — Reação cutânea/mucosa isolada (urticária, angioedema, eritema, prurido) sem envolvimento sistêmico. Não configura anafilaxia.":
    "Grado I — Reacción cutáneo-mucosa aislada (urticaria, angioedema, eritema, prurito) sin afectación sistémica. No configura anafilaxia.",
  "Grau II — Anafilaxia moderada: envolvimento sistêmico leve a moderado (broncoespasmo leve, hipotensão leve, sintomas GI). Adrenalina IM indicada.":
    "Grado II — Anafilaxia moderada: afectación sistémica de leve a moderada (broncoespasmo leve, hipotensión leve, síntomas digestivos). Adrenalina IM indicada.",
  "Grau IV — Choque anafilático: colapso cardiovascular, hipotensão grave ou hipoperfusão. Adrenalina IM imediata, volume e escalonamento intensivo se refratário.":
    "Grado IV — Choque anafiláctico: colapso cardiovascular, hipotensión grave o hipoperfusión. Adrenalina IM inmediata, volumen y escalamiento intensivo si es refractario.",
  "Avaliação incompleta — preencher dados para classificação.":
    "Evaluación incompleta — complete los datos para la clasificación.",
  "Completar avaliação clínica para classificar":
    "Completar la evaluación clínica para clasificar",
  "Dados ainda insuficientes para classificação segura — complete a avaliação clínica sem atrasar condutas ABC se houver deterioração.":
    "Datos aún insuficientes para una clasificación segura — complete la evaluación clínica sin retrasar las conductas del ABC si hay deterioro.",
  "Com sintomas isolados e poucos dados ainda não é possível graduar com segurança. Preencha manifestações, gatilho e sinais vitais principais para o módulo assumir a classificação.":
    "Con síntomas aislados y pocos datos aún no es posible graduar con seguridad. Complete las manifestaciones, el desencadenante y los signos vitales principales para que el módulo asuma la clasificación.",
  "O sistema ainda precisa de mais dados para graduar o caso.":
    "El sistema todavía necesita más datos para graduar el caso.",
  "Sem manifestações documentadas. Complete a avaliação clínica.":
    "Sin manifestaciones documentadas. Complete la evaluación clínica.",
  "Complete peso, manifestações, PAS/PAD, SpO₂ e GCS para diagnóstico e condutas personalizadas.":
    "Complete el peso, las manifestaciones, la PAS/PAD, la SpO₂ y el Glasgow para el diagnóstico y las conductas personalizadas.",
  "Registe as manifestações clínicas para diagnóstico e condutas personalizadas.":
    "Registre las manifestaciones clínicas para el diagnóstico y las conductas personalizadas.",
  "Registe os sintomas para determinar indicação de adrenalina.":
    "Registre los síntomas para determinar la indicación de adrenalina.",

  // ── Referência clínica ─────────────────────────────────────────────────────
  "Reação sistêmica grave de hipersensibilidade, de início súbito (minutos a poucas horas) após exposição a gatilho. Pode ser IgE-mediada, não-IgE-mediada ou idiopática.":
    "Reacción sistémica grave de hipersensibilidad, de inicio súbito (minutos a pocas horas) tras la exposición a un desencadenante. Puede ser mediada por IgE, no mediada por IgE o idiopática.",
  "Caracteriza-se por envolvimento sistêmico: pele/mucosas + ao menos um sistema (respiratório, cardiovascular ou GI). Em até 20% dos casos os sinais cutâneos podem estar ausentes.":
    "Se caracteriza por afectación sistémica: piel/mucosas + al menos un sistema (respiratorio, cardiovascular o digestivo). Hasta en el 20% de los casos los signos cutáneos pueden estar ausentes.",
  "O diagnóstico é CLÍNICO. Anafilaxia é altamente provável quando qualquer um dos três critérios abaixo for satisfeito:":
    "El diagnóstico es CLÍNICO. La anafilaxia es altamente probable cuando se cumple cualquiera de los tres criterios siguientes:",
  "Critério 1 — Início súbito com envolvimento de pele/mucosas + ao menos um de: comprometimento respiratório, hipotensão ou disfunção de órgão-alvo.":
    "Criterio 1 — Inicio súbito con afectación cutáneo-mucosa + al menos uno de: compromiso respiratorio, hipotensión o disfunción de órgano blanco.",
  "Critério 2 — Exposição a alérgeno provável + ao menos dois de: pele/mucosas, respiratório, cardiovascular ou GI.":
    "Criterio 2 — Exposición a un alérgeno probable + al menos dos de: piel/mucosas, respiratorio, cardiovascular o digestivo.",
  "Critério 3 — Hipotensão após exposição a alérgeno conhecido (PAS < 90 mmHg ou queda ≥ 30% do basal).":
    "Criterio 3 — Hipotensión tras la exposición a un alérgeno conocido (PAS < 90 mmHg o caída ≥ 30% respecto al valor basal).",
  "Pele e mucosas (80–90%): urticária, angioedema, eritema generalizado, prurido, rubor facial. Ausência de sintomas cutâneos não exclui anafilaxia.":
    "Piel y mucosas (80–90%): urticaria, angioedema, eritema generalizado, prurito y rubor facial. La ausencia de síntomas cutáneos no descarta la anafilaxia.",
  "Respiratório (40–60%): rinorreia, estridor (edema laríngeo), rouquidão, disfonia, dispneia, sibilos, broncoespasmo, insuficiência respiratória.":
    "Respiratorio (40–60%): rinorrea, estridor (edema laríngeo), ronquera, disfonía, disnea, sibilancias, broncoespasmo e insuficiencia respiratoria.",
  "Cardiovascular (30–35%): taquicardia, hipotensão, síncope, pulso filiforme, choque distributivo por vasodilatação e extravasamento capilar.":
    "Cardiovascular (30–35%): taquicardia, hipotensión, síncope, pulso filiforme y choque distributivo por vasodilatación y extravasación capilar.",
  "Neurológico: ansiedade, agitação, sensação de morte iminente, rebaixamento do nível de consciência, convulsões em casos graves.":
    "Neurológico: ansiedad, agitación, sensación de muerte inminente, deterioro del nivel de consciencia y convulsiones en los casos graves.",
  "Outros: conjuntivite, rinite, incontinência urinária, dor torácica (espasmo coronariano — síndrome de Kounis).":
    "Otros: conjuntivitis, rinitis, incontinencia urinaria y dolor torácico (espasmo coronario — síndrome de Kounis).",
  "Gatilhos mais comuns: alimentos (amendoim, frutos do mar, leite, ovo), medicamentos (beta-lactâmicos, AINEs, quimioterápicos), veneno de inseto (abelha, vespa), contraste iodado, látex e exercício.":
    "Desencadenantes más frecuentes: alimentos (cacahuete, mariscos, leche, huevo), medicamentos (betalactámicos, AINE, quimioterápicos), veneno de insectos (abeja, avispa), contraste yodado, látex y ejercicio.",
  "Diagnóstico diferencial: urticária isolada, asma aguda, síncope vasovagal, angioedema hereditário (sem urticária), reação vasovagal pós-injeção, síndrome carcinoide.":
    "Diagnóstico diferencial: urticaria aislada, asma aguda, síncope vasovagal, angioedema hereditario (sin urticaria), reacción vasovagal tras la inyección y síndrome carcinoide.",
  "Reação bifásica ocorre em 1–20% dos casos (recidiva 1–72 h após resolução inicial), justificando observação prolongada mesmo após melhora clínica.":
    "La reacción bifásica ocurre en el 1–20% de los casos (recidiva 1–72 h tras la resolución inicial), lo que justifica la observación prolongada incluso tras la mejoría clínica.",
  "PA sistólica < 90 mmHg e/ou PAM < 65 mmHg e/ou sinais de hipoperfusão (pulso filiforme, extremidades frias, síncope).":
    "PA sistólica < 90 mmHg o PAM < 65 mmHg o signos de hipoperfusión (pulso filiforme, extremidades frías, síncope).",
  "Triptase sérica — colher idealmente até 2 h do início; confirma mastocitose e anafilaxia grave, mas valor normal não exclui o diagnóstico.":
    "Triptasa sérica — tomarla idealmente hasta 2 h tras el inicio; confirma la mastocitosis y la anafilaxia grave, pero un valor normal no descarta el diagnóstico.",

  // ── Passo a passo do tratamento ────────────────────────────────────────────
  "① ADRENALINA IM — 1ª linha imediata. Aplicar na face lateral da coxa. Adulto: 0,5 mg (0,5 mL de 1:1000); criança: 0,01 mg/kg (máx 0,5 mg). Reavaliar em cerca de 5 min e repetir IM apenas se a resposta seguir insuficiente ou se persistirem problemas de via aérea, respiração ou circulação.":
    "① ADRENALINA IM — 1.ª línea inmediata. Aplicarla en la cara lateral del muslo. Adulto: 0,5 mg (0,5 mL de 1:1000); niño: 0,01 mg/kg (máx. 0,5 mg). Reevaluar a los 5 min aproximadamente y repetir la vía IM solo si la respuesta sigue siendo insuficiente o si persisten problemas de vía aérea, respiración o circulación.",
  "② POSIÇÃO — supino com membros inferiores elevados se hipotensão; semi-reclinado se dispneia; decúbito lateral se vômitos ou rebaixamento. Evitar sentar ou levantar abruptamente.":
    "② POSICIÓN — decúbito supino con los miembros inferiores elevados si hay hipotensión; semisentado si hay disnea; decúbito lateral si hay vómitos o deterioro del sensorio. Evitar sentar o levantar al paciente de forma brusca.",
  "③ OXIGÊNIO E MONITORIZAÇÃO — ofertar O₂ suplementar quando houver hipoxemia, desconforto respiratório, choque ou ameaça de via aérea. Manter SpO₂, PA, FC, FR e ECG conforme gravidade.":
    "③ OXÍGENO Y MONITORIZACIÓN — aportar O₂ suplementario cuando haya hipoxemia, dificultad respiratoria, choque o amenaza de la vía aérea. Mantener SpO₂, PA, FC, FR y ECG según la gravedad.",
  "④ ACESSO E VOLUME — se hipotensão/choque, obter acesso periférico calibroso e fazer cristalóide em bolus, reavaliando perfusão e sinais de sobrecarga após cada etapa.":
    "④ ACCESO Y VOLUMEN — si hay hipotensión o choque, obtener un acceso periférico grueso y administrar cristaloide en bolo, reevaluando la perfusión y los signos de sobrecarga tras cada etapa.",
  "⑤ REAVALIAÇÃO EM 5 MIN — depois da 1ª dose, decidir se houve resposta suficiente ou se precisa 2ª dose IM. Não pular direto para vasopressor sem essa reavaliação.":
    "⑤ REEVALUACIÓN A LOS 5 MIN — tras la 1.ª dosis, decidir si la respuesta fue suficiente o si se necesita una 2.ª dosis IM. No pasar directamente al vasopresor sin esa reevaluación.",
  "⑥ ESCALONAMENTO — se seguir em choque após 2 doses IM adequadas e volume, considerar adrenalina EV em infusão em ambiente monitorizado e com equipa habituada ao manejo.":
    "⑥ ESCALAMIENTO — si sigue en choque tras 2 dosis IM adecuadas y volumen, considerar la adrenalina IV en infusión en un entorno monitorizado y con un equipo habituado a su manejo.",
  "⑦ VIA AÉREA AVANÇADA — indicar se houver estridor progressivo, edema laríngeo em progressão, hipoxemia refratária, fadiga respiratória, GCS ≤ 8 ou risco iminente de perda de via aérea.":
    "⑦ VÍA AÉREA AVANZADA — indicarla si hay estridor progresivo, edema laríngeo en progresión, hipoxemia refractaria, fatiga respiratoria, Glasgow ≤ 8 o riesgo inminente de perder la vía aérea.",
  "⑧ ADJUVANTES — nunca substituem adrenalina. Anti-H1 apenas após estabilização para pele/prurido; beta-2 inalatório se broncoespasmo persistente; corticoide apenas como adjuvante selecionado; glucagon se uso de betabloqueador com resposta inadequada.":
    "⑧ ADYUVANTES — nunca sustituyen a la adrenalina. Anti-H1 solo tras la estabilización para la piel y el prurito; beta-2 inhalado si el broncoespasmo persiste; corticoide solo como adyuvante seleccionado; glucagón si hay uso de betabloqueante con respuesta inadecuada.",

  // ── Indicação de adrenalina IM ─────────────────────────────────────────────
  "Adrenalina IM indicada agora — é primeira linha em TODA anafilaxia, inclusive apresentações moderadas. Reações moderadas podem progredir rapidamente para choque ou parada respiratória.":
    "Adrenalina IM indicada ahora — es la primera línea en TODA anafilaxia, incluidas las presentaciones moderadas. Las reacciones moderadas pueden progresar rápidamente a choque o paro respiratorio.",
  "Adrenalina IM imediata e urgente. Preparar via aérea avançada e acionar ajuda especializada agora — o edema laríngeo pode progredir em minutos.":
    "Adrenalina IM inmediata y urgente. Preparar la vía aérea avanzada y solicitar ayuda especializada ahora — el edema laríngeo puede progresar en minutos.",
  "Adrenalina IM IMEDIATA. Após 2 doses IM sem resposta + volume adequado: iniciar infusão EV 0,05–0,1 mcg/kg/min em monitorização contínua.":
    "Adrenalina IM INMEDIATA. Tras 2 dosis IM sin respuesta + volumen adecuado: iniciar la infusión IV de 0,05–0,1 mcg/kg/min con monitorización continua.",
  "Adrenalina IM não é a conduta principal neste momento; manter disponível e reclassificar se houver progressão.":
    "La adrenalina IM no es la conducta principal en este momento; mantenerla disponible y reclasificar si hay progresión.",
  "Aplicar 1ª dose de adrenalina IM imediatamente se anafilaxia está indicada.":
    "Aplicar la 1.ª dosis de adrenalina IM de inmediato si la anafilaxia está indicada.",
  "Aplique a 1ª dose de adrenalina IM e depois faça a reavaliação clínica inicial.":
    "Aplique la 1.ª dosis de adrenalina IM y después realice la reevaluación clínica inicial.",
  "Dose padrão adulto: 0,5 mg IM na coxa lateral.":
    "Dosis estándar en el adulto: 0,5 mg IM en la cara lateral del muslo.",
  "Preencha peso e manifestações para dose exata. Padrão adulto: 0,5 mg IM.":
    "Complete el peso y las manifestaciones para la dosis exacta. Estándar en el adulto: 0,5 mg IM.",
  "   → Preencher peso para dose personalizada.":
    "   → Complete el peso para la dosis personalizada.",
  "Apresentação compatível com anafilaxia. Em caso de dúvida diagnóstica, tratar como anafilaxia é a conduta mais segura — o risco de não tratar supera o da adrenalina em dose adequada.":
    "Presentación compatible con anafilaxia. Ante la duda diagnóstica, tratarla como anafilaxia es la conducta más segura — el riesgo de no tratar supera al de la adrenalina en dosis adecuada.",
  "Insuficiência respiratória — adrenalina IM indicada imediatamente.":
    "Insuficiencia respiratoria — adrenalina IM indicada de inmediato.",
  "Não indicada no momento — reação cutânea/GI isolada sem critérios de anafilaxia. Ter disponível; administrar imediatamente se envolvimento sistêmico":
    "No indicada por ahora — reacción cutánea o digestiva aislada sin criterios de anafilaxia. Tenerla disponible; administrarla de inmediato si hay afectación sistémica",
  "Reação cutânea/GI isolada — sem critérios de anafilaxia sistêmica. Adrenalina não indicada no momento; ter disponível.":
    "Reacción cutánea o digestiva aislada — sin criterios de anafilaxia sistémica. La adrenalina no está indicada por ahora; tenerla disponible.",
  "Anti-H1 pode ser suficiente em reação cutânea/GI isolada sem critérios de anafilaxia. Manter em observação com adrenalina DISPONÍVEL — progressão pode ocorrer a qualquer momento. Administrar adrenalina IM IMEDIATAMENTE se surgir qualquer envolvimento sistêmico (via aérea, hemodinâmico ou neurológico).":
    "El anti-H1 puede bastar en la reacción cutánea o digestiva aislada sin criterios de anafilaxia. Mantener en observación con la adrenalina DISPONIBLE — la progresión puede ocurrir en cualquier momento. Administrar adrenalina IM DE INMEDIATO si aparece cualquier afectación sistémica (de vía aérea, hemodinámica o neurológica).",
  "Anti-H1 VO; adrenalina disponível mas não indicada agora":
    "Anti-H1 por vía oral; adrenalina disponible pero no indicada por ahora",

  // ── 2ª dose: indicação e registro ──────────────────────────────────────────
  "1ª dose já feita. Reavalie em 5 min e responda objetivamente: houve melhora suficiente ou ainda persistem choque, comprometimento de via aérea, hipóxia ou resposta parcial?":
    "1.ª dosis ya administrada. Reevalúe a los 5 min y responda con objetividad: ¿hubo mejoría suficiente o aún persisten choque, compromiso de la vía aérea, hipoxia o respuesta parcial?",
  "2ª dose IM indicada agora apenas se, na reavaliação real após 5 min, ainda persistirem instabilidade hemodinâmica, comprometimento de via aérea ou desconforto respiratório relevante.":
    "2.ª dosis IM indicada ahora solo si, en la reevaluación real a los 5 min, aún persisten inestabilidad hemodinámica, compromiso de la vía aérea o dificultad respiratoria relevante.",
  "2ª dose IM indicada agora: 1ª dose já aplicada e a reavaliação após 5 min mostrou melhora parcial ou ausência de resposta.":
    "2.ª dosis IM indicada ahora: la 1.ª dosis ya se aplicó y la reevaluación a los 5 min mostró mejoría parcial o ausencia de respuesta.",
  "2ª dose não indicada neste momento: houve resposta clínica satisfatória após a 1ª dose. Manter observação estreita porque recorrência ainda pode acontecer.":
    "2.ª dosis no indicada en este momento: hubo una respuesta clínica satisfactoria tras la 1.ª dosis. Mantener una observación estrecha porque aún puede haber recurrencia.",
  "2ª dose não é a decisão central neste momento porque o caso ainda não pede adrenalina IM imediata; reclassifique se houver progressão sistêmica.":
    "La 2.ª dosis no es la decisión central en este momento porque el caso todavía no exige adrenalina IM inmediata; reclasifique si hay progresión sistémica.",
  "2ª dose já registrada. Agora complete a nova avaliação clínica pós-2ª dose; só depois o fluxo libera drogas vasoativas EV se a resposta seguir insuficiente.":
    "2.ª dosis ya registrada. Ahora complete la nueva evaluación clínica posterior; solo después el flujo habilita los fármacos vasoactivos IV si la respuesta sigue siendo insuficiente.",
  "2ª dose já registrada. Agora complete a nova reavaliação clínica para decidir se precisa escalonamento EV/vasoativo.":
    "2.ª dosis ya registrada. Ahora complete la nueva reevaluación clínica para decidir si se necesita un escalamiento IV o vasoactivo.",
  "2ª dose já registrada. Siga para a reavaliação pós-2ª dose.":
    "2.ª dosis ya registrada. Continúe con la reevaluación posterior a la 2.ª dosis.",
  "A 2ª dose já foi realizada. Se houve estabilização, manter observação prolongada e vigilância para recorrência ou reação bifásica.":
    "La 2.ª dosis ya se administró. Si hubo estabilización, mantener la observación prolongada y la vigilancia de recurrencia o reacción bifásica.",
  "Nenhuma dose IM registrada ainda. Primeiro passo: aplicar a 1ª dose; a decisão sobre 2ª dose vem na reavaliação clínica de 5 min.":
    "Aún no se registró ninguna dosis IM. Primer paso: aplicar la 1.ª dosis; la decisión sobre la 2.ª dosis surge en la reevaluación clínica de los 5 min.",
  "Após a 1ª dose, a resposta foi parcial. Indicar 2ª dose de adrenalina IM agora.":
    "Tras la 1.ª dosis, la respuesta fue parcial. Indicar la 2.ª dosis de adrenalina IM ahora.",
  "Após a 1ª dose, faça a reavaliação em cerca de 5 min para decidir se precisa 2ª dose.":
    "Tras la 1.ª dosis, realice la reevaluación a los 5 min aproximadamente para decidir si se necesita una 2.ª dosis.",
  "Após a 1ª dose, houve melhora suficiente. Não indicar 2ª dose neste momento; manter vigilância e observação.":
    "Tras la 1.ª dosis, hubo una mejoría suficiente. No indicar la 2.ª dosis en este momento; mantener la vigilancia y la observación.",
  "Após a 1ª dose, não houve resposta suficiente. Indicar 2ª dose de adrenalina IM agora.":
    "Tras la 1.ª dosis, no hubo una respuesta suficiente. Indicar la 2.ª dosis de adrenalina IM ahora.",
  "Após a 1ª dose, repetir só se a reavaliação de 5 min mostrar resposta incompleta ou manutenção de sinais respiratórios/hemodinâmicos.":
    "Tras la 1.ª dosis, repetir solo si la reevaluación de los 5 min muestra una respuesta incompleta o la persistencia de signos respiratorios o hemodinámicos.",
  "Se melhora parcial, sem melhora ou piora: indicar 2ª dose de adrenalina IM e reavaliar necessidade de escalonamento.":
    "Si hay mejoría parcial, ausencia de mejoría o empeoramiento: indicar la 2.ª dosis de adrenalina IM y reevaluar la necesidad de escalar.",
  "Se persistirem sinais respiratórios, hemodinâmicos ou resposta apenas parcial: aplicar 2ª dose de adrenalina IM.":
    "Si persisten los signos respiratorios o hemodinámicos, o la respuesta es solo parcial: aplicar la 2.ª dosis de adrenalina IM.",
  "Use a reavaliação clínica após a 1ª dose para decidir se a 2ª dose é necessária.":
    "Use la reevaluación clínica tras la 1.ª dosis para decidir si la 2.ª dosis es necesaria.",
  "Registre aqui apenas a avaliação clínica após a 1ª dose. A decisão sobre a 2ª dose aparece no card seguinte.":
    "Registre aquí solo la evaluación clínica tras la 1.ª dosis. La decisión sobre la 2.ª dosis aparece en la tarjeta siguiente.",
  "Indicar 2ª dose": "Indicar la 2.ª dosis",
  "Sugestão: registrar 2ª dose IM realizada agora":
    "Sugerencia: registrar la 2.ª dosis IM administrada ahora",
  "Registrar dose e horario": "Registrar la dosis y la hora",

  // ── Após a 2ª dose / escalonamento ─────────────────────────────────────────
  "2 doses IM já foram feitas. Se o paciente segue instável, o próximo passo não é uma 3ª dose automática: é escalar suporte e considerar adrenalina EV em infusão em ambiente monitorizado.":
    "Ya se administraron 2 dosis IM. Si el paciente sigue inestable, el próximo paso no es una 3.ª dosis automática: es escalar el soporte y considerar la adrenalina IV en infusión en un entorno monitorizado.",
  "Após a 2ª dose, a resposta segue insuficiente. Escalar para adrenalina EV em infusão 0,05–0,1 mcg/kg/min em ambiente monitorizado; se o choque persistir apesar da adrenalina EV e do volume adequado, considerar noradrenalina EV.":
    "Tras la 2.ª dosis, la respuesta sigue siendo insuficiente. Escalar a adrenalina IV en infusión de 0,05–0,1 mcg/kg/min en un entorno monitorizado; si el choque persiste a pesar de la adrenalina IV y del volumen adecuado, considerar la noradrenalina IV.",
  "Após a 2ª dose, houve estabilização suficiente. Não escalar para adrenalina EV/vasoativo neste momento; manter observação monitorizada.":
    "Tras la 2.ª dosis, hubo una estabilización suficiente. No escalar a adrenalina IV ni a vasoactivo en este momento; mantener la observación monitorizada.",
  "Decida o escalonamento EV/vasoativo com base na reavaliação clínica após a 2ª dose.":
    "Decida el escalamiento IV o vasoactivo según la reevaluación clínica tras la 2.ª dosis.",
  "O escalonamento EV fica reservado para depois da 2ª dose e da nova reavaliação.":
    "El escalamiento IV queda reservado para después de la 2.ª dosis y de la nueva reevaluación.",
  "Se seguir refratário após a 2ª dose e volume adequado, evoluir para adrenalina EV em infusão.":
    "Si sigue refractario tras la 2.ª dosis y un volumen adecuado, pasar a la adrenalina IV en infusión.",
  "Se continuar instável: iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min e levar para ambiente de suporte avançado.":
    "Si continúa inestable: iniciar adrenalina IV en infusión de 0,05–0,1 mcg/kg/min y trasladarlo a un entorno de soporte avanzado.",
  "Se houver melhora clara após a 2ª dose: manter observação prolongada e não reduzir vigilância precocemente.":
    "Si hay una mejoría clara tras la 2.ª dosis: mantener la observación prolongada y no reducir la vigilancia de forma precoz.",
  "Se não houver melhora rápida após a 2ª dose, a decisão de IOT deve ser retomada imediatamente.":
    "Si no hay una mejoría rápida tras la 2.ª dosis, la decisión de intubar debe retomarse de inmediato.",
  "Após 2 doses IM, mantenha monitorizado enquanto decide escalonamento.":
    "Tras 2 dosis IM, manténgalo monitorizado mientras decide el escalamiento.",
  "Após 2 doses IM, manter em área monitorizada enquanto define necessidade de infusão EV/UTI.":
    "Tras 2 dosis IM, mantenerlo en un área monitorizada mientras define la necesidad de infusión IV o de UCI.",

  // ── Vasoativo ──────────────────────────────────────────────────────────────
  "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — primeira escolha no choque refratário após 2 doses IM + volume":
    "Adrenalina IV en infusión 0,05–0,1 mcg/kg/min — primera elección en el choque refractario tras 2 dosis IM + volumen",
  "Adrenalina EV em infusão 0,05–0,1 mcg/kg/min — refratário após 2 doses IM e reposição volêmica":
    "Adrenalina IV en infusión 0,05–0,1 mcg/kg/min — refractario tras 2 dosis IM y reposición de volumen",
  "Iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min sob monitorização contínua, após 2 doses IM adequadas e reposição volêmica.":
    "Iniciar adrenalina IV en infusión de 0,05–0,1 mcg/kg/min bajo monitorización continua, tras 2 dosis IM adecuadas y reposición de volumen.",
  "Refratário após 2 doses de adrenalina IM: considerar adrenalina EV em infusão 0,05–0,1 mcg/kg/min em monitorização contínua":
    "Refractario tras 2 dosis de adrenalina IM: considerar la adrenalina IV en infusión de 0,05–0,1 mcg/kg/min con monitorización continua",
  "Noradrenalina EV em infusão — considerar apenas se choque persistir apesar de adrenalina EV titulada + volume adequado":
    "Noradrenalina IV en infusión — considerarla solo si el choque persiste a pesar de la adrenalina IV titulada + un volumen adecuado",
  "Choque refratário após 2 doses de adrenalina IM + volume adequado: adrenalina EV em infusão é a 1ª escolha. Noradrenalina fica para persistência do choque apesar da adrenalina EV.":
    "Choque refractario tras 2 dosis de adrenalina IM + volumen adecuado: la adrenalina IV en infusión es la 1.ª elección. La noradrenalina queda para la persistencia del choque a pesar de la adrenalina IV.",
  "Choque persistente apesar de adrenalina EV: considerar noradrenalina como adjuvante/2ª linha e discutir protocolo local/UTI. Glucagon apenas se uso de betabloqueador.":
    "Choque persistente a pesar de la adrenalina IV: considerar la noradrenalina como adyuvante o de 2.ª línea y consultar el protocolo local o la UCI. Glucagón solo si hay uso de betabloqueante.",
  "Choque presente, mas antes de droga vasoativa é obrigatório reavaliar resposta à adrenalina IM e ao volume. Se mantiver instabilidade após 2 doses IM + volume, migrar para adrenalina EV em infusão.":
    "Hay choque, pero antes del fármaco vasoactivo es obligatorio reevaluar la respuesta a la adrenalina IM y al volumen. Si la inestabilidad persiste tras 2 dosis IM + volumen, pasar a la adrenalina IV en infusión.",
  "Primeiro passo no choque anafilático é adrenalina IM imediata + oxigênio + volume. Não iniciar vasopressor antes dessa etapa, salvo contexto de UTI/protocolo local muito específico.":
    "El primer paso en el choque anafiláctico es la adrenalina IM inmediata + oxígeno + volumen. No iniciar un vasopresor antes de esa etapa, salvo en un contexto de UCI o un protocolo local muy específico.",
  "Ainda não indicar droga vasoativa antes de reavaliar resposta à adrenalina IM e ao volume":
    "Aún no indicar un fármaco vasoactivo antes de reevaluar la respuesta a la adrenalina IM y al volumen",
  "Reservado para choque refratário após adrenalina IM e reposição volêmica adequada.":
    "Reservado para el choque refractario tras la adrenalina IM y una reposición de volumen adecuada.",
  "Infusão de adrenalina já registrada; titular pela resposta clínica.":
    "Infusión de adrenalina ya registrada; titular según la respuesta clínica.",
  "Se ainda instável apesar da infusão, considerar vasopressor complementar, UTI e revisão de diagnóstico diferencial.":
    "Si sigue inestable a pesar de la infusión, considerar un vasopresor complementario, la UCI y revisar el diagnóstico diferencial.",
  "Sugestão automática: iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min em ambiente monitorizado. Se, apesar da adrenalina EV titulada e do volume adequado, o choque persistir, considerar noradrenalina EV em infusão como 2ª linha. Glucagon 1–2 mg EV/IM só se houver uso de betabloqueador com resposta inadequada.":
    "Sugerencia automática: iniciar adrenalina IV en infusión de 0,05–0,1 mcg/kg/min en un entorno monitorizado. Si, a pesar de la adrenalina IV titulada y del volumen adecuado, el choque persiste, considerar la noradrenalina IV en infusión como 2.ª línea. Glucagón 1–2 mg IV/IM solo si hay uso de betabloqueante con respuesta inadecuada.",
  "Sugestão automática: manter adrenalina EV em infusão 0,05–0,1 mcg/kg/min como 1ª escolha. Se o choque persistir apesar da titulação e do volume adequado, considerar noradrenalina EV em infusão como adjuvante/2ª linha conforme protocolo local/UTI.":
    "Sugerencia automática: mantener la adrenalina IV en infusión de 0,05–0,1 mcg/kg/min como 1.ª elección. Si el choque persiste a pesar de la titulación y del volumen adecuado, considerar la noradrenalina IV en infusión como adyuvante o de 2.ª línea según el protocolo local o la UCI.",

  // ── Via aérea e O₂ ─────────────────────────────────────────────────────────
  "Estridor, edema de glote, SpO₂ < 92% ou cianose — comprometimento grave de via aérea ou insuficiência respiratória com risco iminente.":
    "Estridor, edema de glotis, SpO₂ < 92% o cianosis — compromiso grave de la vía aérea o insuficiencia respiratoria con riesgo inminente.",
  "Estridor, edema de glote, SpO₂ < 92%, cianose ou GCS ≤ 8 — anafilaxia grave com risco iminente, exigindo suporte avançado imediato.":
    "Estridor, edema de glotis, SpO₂ < 92%, cianosis o Glasgow ≤ 8 — anafilaxia grave con riesgo inminente, que exige soporte avanzado inmediato.",
  "Máscara com reservatório 10–15 L/min + adrenalina IM agora; preparar ISR/IOT e proceder se não houver melhora rápida ou se houver deterioração":
    "Mascarilla con reservorio 10–15 L/min + adrenalina IM ahora; preparar la ISR/intubación y proceder si no hay mejoría rápida o si hay deterioro",
  "Máscara com reservatório 10–15 L/min + vigilância intensiva; preparar via aérea avançada se não melhorar após adrenalina ou se houver fadiga/piora":
    "Mascarilla con reservorio 10–15 L/min + vigilancia intensiva; preparar la vía aérea avanzada si no mejora tras la adrenalina o si hay fatiga o empeoramiento",
  "Oxigênio alto fluxo + BVM se necessário; preparar ISR/IOT imediatamente por rebaixamento importante":
    "Oxígeno de alto flujo + bolsa-válvula-mascarilla si es necesario; preparar la ISR/intubación de inmediato por el deterioro importante del sensorio",
  "Oxigênio apenas se necessário, titulando para SpO₂ 94–98%.":
    "Oxígeno solo si es necesario, titulándolo para una SpO₂ de 94–98%.",
  "O₂ não está registrado; usar apenas se necessário nesta fase.":
    "El O₂ no está registrado; usarlo solo si es necesario en esta fase.",
  "Manter e titular o O₂ já instituído; não retirar suporte nesta fase.":
    "Mantener y titular el O₂ ya instaurado; no retirar el soporte en esta fase.",
  "Manter ou desmamar O₂ conforme saturação e clínica.":
    "Mantener o retirar progresivamente el O₂ según la saturación y la clínica.",
  "Reduzir O₂ apenas se a saturação permanecer estável; não retirar abruptamente.":
    "Reducir el O₂ solo si la saturación se mantiene estable; no retirarlo de forma brusca.",
  "Se melhora clara: manter O₂ conforme necessidade e migrar para observação.":
    "Si hay mejoría clara: mantener el O₂ según la necesidad y pasar a la observación.",
  "Se houver melhora clara: manter O₂ conforme necessidade e avançar para observação monitorizada.":
    "Si hay mejoría clara: mantener el O₂ según la necesidad y avanzar a la observación monitorizada.",
  "Selecione o O₂ em uso e a conduta de via aérea. Pode marcar mais de um.":
    "Seleccione el O₂ en uso y la conducta de vía aérea. Puede marcar más de una.",
  "Decidir se apenas observa com O₂ ou se já deixa a via aérea preparada conforme gravidade.":
    "Decidir si solo se observa con O₂ o si ya se deja la vía aérea preparada según la gravedad.",
  "Manter ISR/IOT preparada; intubar se houver piora, fadiga, hipoxemia refratária ou perda iminente da via aérea.":
    "Mantener la ISR/intubación preparada; intubar si hay empeoramiento, fatiga, hipoxemia refractaria o pérdida inminente de la vía aérea.",
  "Manter material e equipe de via aérea prontos enquanto observa a resposta inicial à adrenalina e ao oxigênio.":
    "Mantener el material y el equipo de vía aérea listos mientras observa la respuesta inicial a la adrenalina y al oxígeno.",
  "Preparar ISR/IOT desde já, mas não antecipar a intubação se o paciente ainda ventila e pode responder à adrenalina; proceder se houver piora, estridor progressivo, fadiga ou hipoxemia refratária.":
    "Preparar la ISR/intubación desde ya, pero no adelantar la intubación si el paciente aún ventila y puede responder a la adrenalina; proceder si hay empeoramiento, estridor progresivo, fatiga o hipoxemia refractaria.",
  "Se mantiver falha ventilatória, estridor progressivo, fadiga ou hipoxemia refratária: proceder à IOT/estratégia definitiva.":
    "Si persiste el fallo ventilatorio, el estridor progresivo, la fatiga o la hipoxemia refractaria: proceder a la intubación o a la estrategia definitiva.",
  "Via aérea definitiva deve ser preparada imediatamente por rebaixamento importante.":
    "La vía aérea definitiva debe prepararse de inmediato por el deterioro importante del sensorio.",
  "Via aérea avançada em curso": "Vía aérea avanzada en curso",
  "Via aérea avançada já estabelecida; seguir vigilância ventilatória.":
    "Vía aérea avanzada ya establecida; continuar con la vigilancia ventilatoria.",
  "Via aérea avançada já feita; reavaliar ventilação e perfusão enquanto define suporte vasoativo.":
    "Vía aérea avanzada ya realizada; reevaluar la ventilación y la perfusión mientras define el soporte vasoactivo.",
  "Via aérea avançada mantém o paciente em via de terapia intensiva/observação avançada.":
    "La vía aérea avanzada mantiene al paciente en la vía de cuidados intensivos u observación avanzada.",
  "Via aérea já assegurada; seguir ventilação e monitorização.":
    "Vía aérea ya asegurada; continuar con la ventilación y la monitorización.",
  "Via aérea já preparada; proceder apenas se houver piora respiratória ou falha de resposta.":
    "Vía aérea ya preparada; proceder solo si hay empeoramiento respiratorio o falta de respuesta.",
  "Via aérea já tratada; seguir suporte avançado conforme necessidade.":
    "Vía aérea ya tratada; continuar con el soporte avanzado según la necesidad.",
  "Via aérea comprometida e/ou insuficiência respiratória grave":
    "Vía aérea comprometida o insuficiencia respiratoria grave",
  "Sem indicação imediata de IOT se a melhora for sustentada.":
    "Sin indicación inmediata de intubación si la mejoría es sostenida.",
  "Sem indicação imediata de intubação": "Sin indicación inmediata de intubación",
  "Sem indicação imediata de via aérea avançada neste momento.":
    "Sin indicación inmediata de vía aérea avanzada en este momento.",
  "Sem necessidade imediata de IOT se houve recuperação sustentada.":
    "Sin necesidad inmediata de intubación si hubo una recuperación sostenida.",
  "Sinais de alerta de via aérea: priorize O₂ alto fluxo, vigilância contínua e reavaliação em 5 min após adrenalina. Preparar IOT apenas se não houver melhora ou se houver piora.":
    "Signos de alarma de la vía aérea: priorice el O₂ de alto flujo, la vigilancia continua y la reevaluación a los 5 min tras la adrenalina. Preparar la intubación solo si no hay mejoría o si hay empeoramiento.",

  // ── Acesso, volume, posição e monitorização ────────────────────────────────
  "Calibre mínimo recomendado ≥ 18G para infusão rápida de volume.":
    "Calibre mínimo recomendado ≥ 18G para la infusión rápida de volumen.",
  "Dois acessos periféricos calibrosos (≥ 16G) + via de infusão rápida":
    "Dos accesos periféricos gruesos (≥ 16G) + vía de infusión rápida",
  "Sem bolus de rotina na ausência de hipotensão. Iniciar se PA sistólica < 90 mmHg ou sinais de choque.":
    "Sin bolo de rutina en ausencia de hipotensión. Iniciarlo si la PA sistólica < 90 mmHg o hay signos de choque.",
  "Sem bolus de rotina; hidratação conforme resposta clínica":
    "Sin bolo de rutina; hidratación según la respuesta clínica",
  "Reposicao titulada conforme perfusao e risco de sobrecarga.":
    "Reposición titulada según la perfusión y el riesgo de sobrecarga.",
  "Preferir decúbito e evitar mudança brusca de postura":
    "Preferir el decúbito y evitar cambios bruscos de postura",
  "Semi-reclinado se facilitar ventilação, evitando colocar o paciente em pé":
    "Semisentado si facilita la ventilación, evitando poner al paciente de pie",
  "ECG contínuo + SpO₂ contínua + PA não invasiva a cada 2–3 min + FR + diurese":
    "ECG continuo + SpO₂ continua + PA no invasiva cada 2–3 min + FR + diuresis",
  "ECG contínuo + SpO₂ contínua + PA não invasiva seriada + FR":
    "ECG continuo + SpO₂ continua + PA no invasiva seriada + FR",
  "Checar PA, SpO₂, FR, ausculta, estridor, fadiga e perfusão.":
    "Comprobar la PA, la SpO₂, la FR, la auscultación, el estridor, la fatiga y la perfusión.",
  "Monitorização ainda obrigatória nas próximas horas.":
    "La monitorización sigue siendo obligatoria en las próximas horas.",
  "Manter monitorização contínua e procurar sinais de recorrência ou reação bifásica.":
    "Mantener la monitorización continua y buscar signos de recurrencia o de reacción bifásica.",

  // ── Adjuvantes ─────────────────────────────────────────────────────────────
  "Cetirizina VO após estabilização — preferir anti-H1 não sedante em reação cutânea isolada":
    "Cetirizina VO tras la estabilización — preferir un anti-H1 no sedante en la reacción cutánea aislada",
  "Não usar na fase inicial em anafilaxia; considerar apenas após estabilização se prurido/urticária persistirem":
    "No usarlo en la fase inicial de la anafilaxia; considerarlo solo tras la estabilización si persisten el prurito o la urticaria",
  "Reação cutânea isolada: anti-H1 pode ser útil para urticária/prurido. Preferir opção VO não sedante. Em anafilaxia sistêmica, usar só após estabilização.":
    "Reacción cutánea aislada: el anti-H1 puede ser útil para la urticaria y el prurito. Preferir la opción oral no sedante. En la anafilaxia sistémica, usarlo solo tras la estabilización.",
  "⚠ Não tratam hipotensão, broncoespasmo nem edema de via aérea. Usar apenas APÓS estabilização e apenas para prurido/urticária persistentes. Preferir anti-H1 não sedante por VO.":
    "⚠ No tratan la hipotensión, el broncoespasmo ni el edema de la vía aérea. Usarlos solo TRAS la estabilización y solo para el prurito o la urticaria persistentes. Preferir un anti-H1 no sedante por vía oral.",
  "Não de rotina; considerar apenas como adjuvante se asma/broncoespasmo importante, reação prolongada ou preocupação de via aérea":
    "No de rutina; considerarlo solo como adyuvante si hay asma o broncoespasmo importante, reacción prolongada o preocupación por la vía aérea",
  "Não indicado de rotina no atendimento inicial":
    "No indicado de rutina en la atención inicial",
  "Salbutamol nebulizado 2,5 mg — adjuvante se broncoespasmo persistir após adrenalina":
    "Salbutamol nebulizado 2,5 mg — adyuvante si el broncoespasmo persiste tras la adrenalina",
  "Salbutamol nebulizado 5 mg — adjuvante se broncoespasmo persistir após adrenalina":
    "Salbutamol nebulizado 5 mg — adyuvante si el broncoespasmo persiste tras la adrenalina",
  "Usar apenas se houver broncoespasmo persistente após adrenalina. Não é tratamento de rotina da anafilaxia sem sibilância.":
    "Usarlo solo si hay broncoespasmo persistente tras la adrenalina. No es el tratamiento de rutina de la anafilaxia sin sibilancias.",
  "⚠ Usar apenas se houver sibilância/broncoespasmo persistente APÓS adrenalina IM. Não substitui adrenalina. Nebulização: dose total no copo do nebulizador, completar com SF conforme rotina do serviço e ofertar até acabar a névoa. 2,5 mg costuma corresponder a 0,5 mL da solução 5 mg/mL; 5 mg costuma corresponder a 1 mL da solução 5 mg/mL. MDI = bombinha spray de 100 mcg/jato; usar 1 jato por vez no espaçador, com 4–8 jatos ao todo. Ipratrópio: usar JUNTO ao salbutamol, não isolado. Salbutamol contínuo não é rotina na anafilaxia; se persistir broncoespasmo importante apesar de adrenalina e doses repetidas, tratar como asma grave/refratariedade com RT/UTI e protocolo local.":
    "⚠ Usarlo solo si hay sibilancias o broncoespasmo persistente TRAS la adrenalina IM. No sustituye a la adrenalina. Nebulización: la dosis total en el vaso del nebulizador, completar con solución fisiológica según la rutina del servicio y administrarla hasta que se agote la niebla. 2,5 mg suele corresponder a 0,5 mL de la solución de 5 mg/mL; 5 mg suele corresponder a 1 mL de la solución de 5 mg/mL. El inhalador presurizado es de 100 mcg por disparo; usar 1 disparo por vez en la cámara espaciadora, con 4–8 disparos en total. Ipratropio: usarlo JUNTO al salbutamol, no aislado. El salbutamol continuo no es rutina en la anafilaxia; si persiste un broncoespasmo importante a pesar de la adrenalina y de las dosis repetidas, tratarlo como asma grave o refractaria con terapia respiratoria/UCI y el protocolo local.",
  "⚠️ Não indicada — ter disponível": "⚠️ No indicada — tenerla disponible",

  // ── Alertas de gravidade ───────────────────────────────────────────────────
  "⚠ Choque + comprometimento de via aérea — adrenalina IM IMEDIATA, oxigênio alto fluxo e preparar IOT se não houver melhora rápida ou se houver deterioração.":
    "⚠ Choque + compromiso de la vía aérea — adrenalina IM INMEDIATA, oxígeno de alto flujo y preparar la intubación si no hay mejoría rápida o si hay deterioro.",
  "⚠ Choque refratário após 2 doses IM: iniciar adrenalina EV em infusão 0,05–0,1 mcg/kg/min e manter monitorização contínua.":
    "⚠ Choque refractario tras 2 dosis IM: iniciar adrenalina IV en infusión de 0,05–0,1 mcg/kg/min y mantener la monitorización continua.",
  "⚠ Comprometimento de via aérea — adrenalina IM urgente, oxigênio e preparo de via aérea avançada.":
    "⚠ Compromiso de la vía aérea — adrenalina IM urgente, oxígeno y preparación de la vía aérea avanzada.",
  "⚠ Sinais de alerta de via aérea — adrenalina IM agora, O₂ alto fluxo e reavaliação em 5 min; preparar material se houver progressão.":
    "⚠ Signos de alarma de la vía aérea — adrenalina IM ahora, O₂ de alto flujo y reevaluación a los 5 min; preparar el material si hay progresión.",
  "⚠ Via aérea ameaçada — iniciar O₂ alto fluxo e preparar IOT. Se ainda houver ventilação/perfusão, observar a resposta muito breve à adrenalina; não atrasar IOT se houver piora.":
    "⚠ Vía aérea amenazada — iniciar O₂ de alto flujo y preparar la intubación. Si aún hay ventilación y perfusión, observar la respuesta muy breve a la adrenalina; no retrasar la intubación si hay empeoramiento.",
  "Instabilidade hemodinâmica + rebaixamento de consciência — risco imediato de PCR":
    "Inestabilidad hemodinámica + deterioro de la consciencia — riesgo inmediato de paro cardiorrespiratorio",
  "Instabilidade hemodinâmica grave — ameaça imediata à vida":
    "Inestabilidad hemodinámica grave — amenaza vital inmediata",
  "Comprometimento neurológico importante e/ou falência respiratória grave":
    "Compromiso neurológico importante o fallo respiratorio grave",
  "Acionar ajuda avançada / sala de emergência agora":
    "Solicitar ayuda avanzada / sala de urgencias ahora",
  "Acionar apoio da equipa e manter reavaliação seriada":
    "Solicitar el apoyo del equipo y mantener la reevaluación seriada",
  "Se houver deterioração antes dos 5 minutos: escalar suporte imediatamente, inclusive via aérea, sem esperar o relógio.":
    "Si hay deterioro antes de los 5 minutos: escalar el soporte de inmediato, incluida la vía aérea, sin esperar al reloj.",

  // ── Fases do fluxo ─────────────────────────────────────────────────────────
  "Fase 2 — pós-1ª dose de adrenalina": "Fase 2 — tras la 1.ª dosis de adrenalina",
  "Fase 2 — reavaliação após 1ª dose": "Fase 2 — reevaluación tras la 1.ª dosis",
  "Fase 3 — decisão após a reavaliação da 1ª dose":
    "Fase 3 — decisión tras la reevaluación de la 1.ª dosis",
  "Fase 3 — pós-2ª dose de adrenalina": "Fase 3 — tras la 2.ª dosis de adrenalina",
  "Fase 3 — resposta inicial após 1ª dose": "Fase 3 — respuesta inicial tras la 1.ª dosis",
  "Fase 4 — observação e prevenção de recorrência":
    "Fase 4 — observación y prevención de la recurrencia",
  "Fase 4 — refratariedade ou recuperação": "Fase 4 — refractariedad o recuperación",
  "Fase 4 — resposta após 2ª dose": "Fase 4 — respuesta tras la 2.ª dosis",
  "Fase 5 — observação e destino": "Fase 5 — observación y destino",
  "Avaliação após 1ª dose": "Evaluación tras la 1.ª dosis",
  "Ao completar 5 minutos da 1ª dose": "Al cumplirse 5 minutos de la 1.ª dosis",
  "Após a nova reavaliação de 5 minutos da 2ª dose":
    "Tras la nueva reevaluación de 5 minutos de la 2.ª dosis",
  "Nova reavaliação imediata em até 5 minutos após a 2ª dose":
    "Nueva reevaluación inmediata en un plazo de 5 minutos tras la 2.ª dosis",
  "Reavaliar em 5 minutos após a 1ª dose": "Reevaluar a los 5 minutos de la 1.ª dosis",
  "Após estabilidade sustentada": "Tras una estabilidad sostenida",
  "Após estabilização clínica": "Tras la estabilización clínica",
  "Pós-estabilização inicial": "Tras la estabilización inicial",
  "Pós-reavaliação imediata": "Tras la reevaluación inmediata",
  "Evolução e destino": "Evolución y destino",
  "Tratamento na emergência": "Tratamiento en urgencias",
  "Paciente e exposição": "Paciente y exposición",
  "Passo atual: aplicar 1ª dose e só depois abrir a avaliação clínica inicial.":
    "Paso actual: aplicar la 1.ª dosis y solo después abrir la evaluación clínica inicial.",
  "Primeiro registrar resposta após a 1ª dose; até lá manter em sala de emergência com reavaliação em 5 min.":
    "Primero registrar la respuesta tras la 1.ª dosis; hasta entonces mantenerlo en la sala de urgencias con reevaluación a los 5 min.",
  "── EVOLUÇÃO ─────────────────────────────": "── EVOLUCIÓN ────────────────────────────",
  "── EXPOSIÇÃO ────────────────────────────": "── EXPOSICIÓN ───────────────────────────",
  "App de Emergência Clínica — Uso profissional":
    "App de Emergencia Clínica — Uso profesional",
};
