/**
 * Sepse (engine) — dicionário PT → ES. Parte A de B.
 * Motor de antibioticoterapia, bundle, tempo-porta-antibiótico, volume e
 * vasopressor.
 */
export const ES_SEPSE_ENG_A: Record<string, string> = {
  // ── Esquemas antimicrobianos e ajuste de dose ──────────────────────────────
  "1 g IV a cada 24 horas, com dose alinhada à sessão de HD.":
    "1 g IV cada 24 horas, con la dosis alineada a la sesión de hemodiálisis.",
  "1 g IV a cada 8 horas é uma base frequente; ajustar à depuração local.":
    "1 g IV cada 8 horas es una base frecuente; ajustarlo al aclaramiento local.",
  "2,25 g IV a cada 12 horas, com reforço pós-HD conforme protocolo local.":
    "2,25 g IV cada 12 horas, con refuerzo tras la hemodiálisis según el protocolo local.",
  "2,25 g IV a cada 12 horas, com reforço pós-HD.":
    "2,25 g IV cada 12 horas, con refuerzo tras la hemodiálisis.",
  "Ampicilina-sulbactam 3 g IV a cada 6 horas quando o perfil local permitir":
    "Ampicilina-sulbactam 3 g IV cada 6 horas cuando el perfil local lo permita",
  "Aztreonam 2 g IV a cada 8 horas combinado ao complemento necessário do foco pode ser considerado, mas exige revisão local.":
    "Se puede considerar aztreonam 2 g IV cada 8 horas combinado con el complemento necesario según el foco, pero exige una revisión local.",
  "Cefepime 2 g IV a cada 8 horas se risco de ESBL não for dominante e o antibiograma local sustentar":
    "Cefepima 2 g IV cada 8 horas si el riesgo de BLEE no es dominante y el antibiograma local lo respalda",
  "Levofloxacino 750 mg IV/VO a cada 24 horas + cobertura anti-MRSA quando indicada.":
    "Levofloxacino 750 mg IV/VO cada 24 horas + cobertura anti-SARM cuando esté indicada.",
  "Levofloxacino 750 mg IV/VO a cada 24 horas quando a estratégia for monoterapia e o contexto local permitir":
    "Levofloxacino 750 mg IV/VO cada 24 horas cuando la estrategia sea la monoterapia y el contexto local lo permita",
  "Linezolida 600 mg IV/VO a cada 12 horas ou vancomicina 15 a 20 mg/kg IV guiada por níveis se houver risco de MRSA.":
    "Linezolid 600 mg IV/VO cada 12 horas o vancomicina 15 a 20 mg/kg IV guiada por niveles si hay riesgo de SARM.",
  "Linezolida 600 mg IV/VO a cada 12 horas quando vancomicina não for apropriada para MRSA":
    "Linezolid 600 mg IV/VO cada 12 horas cuando la vancomicina no sea apropiada para el SARM",
  "Meropenem 1 g IV a cada 8 horas quando MDR/ESBL for dominante ou o paciente estiver em choque":
    "Meropenem 1 g IV cada 8 horas cuando la multirresistencia o las BLEE sean dominantes o el paciente esté en choque",
  "Meropenem 1 g IV a cada 8 horas se o risco de MDR/ESBL for alto ou houver choque":
    "Meropenem 1 g IV cada 8 horas si el riesgo de multirresistencia o BLEE es alto o hay choque",
  "Meropenem 1 g IV a cada 8 horas se risco de ESBL/MDR for dominante ou houver choque refratário":
    "Meropenem 1 g IV cada 8 horas si el riesgo de BLEE o multirresistencia es dominante o hay choque refractario",
  "Piperacilina-tazobactam 4,5 g IV a cada 6 horas como opção única":
    "Piperacilina-tazobactam 4,5 g IV cada 6 horas como opción única",
  "Vancomicina + aztreonam 2 g IV a cada 8 horas pode ser uma estratégia operacional temporária, dependendo do protocolo local.":
    "Vancomicina + aztreonam 2 g IV cada 8 horas puede ser una estrategia operativa temporal, según el protocolo local.",
  "Vancomicina 15 a 20 mg/kg IV guiada por níveis, ou linezolida 600 mg IV/VO a cada 12 horas quando apropriado, se houver risco de MRSA.":
    "Vancomicina 15 a 20 mg/kg IV guiada por niveles, o linezolid 600 mg IV/VO cada 12 horas cuando sea apropiado, si hay riesgo de SARM.",
  "conforme níveis e função renal": "según los niveles y la función renal",
  "carbapenêmico": "carbapenémico",
  "Ajustar conforme função renal, protocolos locais, microbiologia institucional, alergias reais e controle de foco.":
    "Ajustarlo según la función renal, los protocolos locales, la microbiología institucional, las alergias reales y el control del foco.",
  "Ajuste guiado por níveis e depuração do circuito.":
    "Ajuste guiado por los niveles y el aclaramiento del circuito.",
  "Estratégia baseada em dose de ataque e manutenção guiada por níveis.":
    "Estrategia basada en una dosis de carga y un mantenimiento guiado por niveles.",
  "Função renal alterada: doses e intervalos abaixo exigem conferência antes da manutenção.":
    "Función renal alterada: las dosis e intervalos de abajo exigen comprobación antes del mantenimiento.",
  "Obrigatório monitorar função renal e níveis conforme protocolo local.":
    "Es obligatorio monitorizar la función renal y los niveles según el protocolo local.",
  "Se insuficiência renal, ajustar intervalo/dose conforme ClCr.":
    "Si hay insuficiencia renal, ajustar el intervalo y la dosis según el aclaramiento de creatinina.",
  "Se insuficiência renal, reduzir intervalo/dose conforme ClCr.":
    "Si hay insuficiencia renal, reducir el intervalo y la dosis según el aclaramiento de creatinina.",
  "Se insuficiência renal, revisar dose e intervalo.":
    "Si hay insuficiencia renal, revisar la dosis y el intervalo.",
  "Confirmar com protocolo local e função residual antes de manutenção.":
    "Confirmarlo con el protocolo local y la función residual antes del mantenimiento.",
  "Doses ajustadas automaticamente para a função renal estimada.":
    "Dosis ajustadas automáticamente a la función renal estimada.",
  "Doses já corrigidas conforme modo de TRS acima.":
    "Dosis ya corregidas según la modalidad de terapia de reemplazo renal indicada arriba.",
  "Confirme dose, diluição, via e velocidade de infusão.":
    "Confirme la dosis, la dilución, la vía y la velocidad de infusión.",
  "Revisar ajuste renal conforme função renal disponível.":
    "Revisar el ajuste renal según la función renal disponible.",
  "Adicionar gram-negativo em caso grave, hospitalar ou com choque.":
    "Añadir cobertura para gramnegativos en el caso grave, hospitalario o con choque.",
  "Amplia cobertura quando há necrose, fasceíte, polimicrobiana ou choque.":
    "Amplía la cobertura cuando hay necrosis, fascitis, infección polimicrobiana o choque.",
  "Associação macrolídea para cobertura de atípicos.":
    "Asociación con un macrólido para cubrir los atípicos.",
  "Carbapenêmico preferido quando há risco importante de ESBL/MDR ou choque.":
    "Carbapenémico preferido cuando hay un riesgo importante de BLEE o multirresistencia, o choque.",
  "Contexto comunitário favorece esquemas mais focados quando o quadro permite.":
    "El contexto comunitario favorece los esquemas más dirigidos cuando el cuadro lo permite.",
  "Opção prática para foco cutâneo sem risco alto de MRSA/polimicrobiano.":
    "Opción práctica para el foco cutáneo sin un riesgo alto de SARM o de infección polimicrobiana.",
  "Opção prática para sepse urinária sem alto risco de resistência.":
    "Opción práctica para la sepsis urinaria sin un riesgo alto de resistencia.",
  "Há alergia a beta-lactâmico; confirmar alternativa segura do protocolo local antes da administração.":
    "Hay alergia a betalactámicos; confirmar una alternativa segura del protocolo local antes de administrarlo.",
  "Se a alergia for grave/imediata, não automatizar a escolha final sem revisão do protocolo institucional.":
    "Si la alergia es grave o inmediata, no automatizar la elección final sin revisar el protocolo institucional.",
  "Há contexto de assistência à saúde ou risco de MDR; preferir o esquema ampliado desta referência-base.":
    "Hay un contexto de atención sanitaria o riesgo de multirresistencia; preferir el esquema ampliado de esta referencia base.",
  "Há risco de MRSA; revisar necessidade de cobertura adicional conforme protocolo local.":
    "Hay riesgo de SARM; revisar la necesidad de cobertura adicional según el protocolo local.",
  "A recomendação é apoio à decisão; não substituir julgamento do médico assistente nem ID/stewardship quando disponíveis.":
    "La recomendación es un apoyo a la decisión; no sustituye el juicio del médico tratante ni a infectología o al programa de optimización de antimicrobianos cuando están disponibles.",
  "Não iniciar automaticamente. Reavaliar probabilidade infecciosa e diagnósticos alternativos.":
    "No iniciarlo automáticamente. Reevaluar la probabilidad de infección y los diagnósticos alternativos.",
  "Diferenciar causa infecciosa de não-infecciosa antes de iniciar se houver tempo.":
    "Diferenciar la causa infecciosa de la no infecciosa antes de iniciar, si hay tiempo.",

  // ── Guidelines citadas ─────────────────────────────────────────────────────
  "ATS/IDSA CAP 2019: CAP grave pode usar beta-lactâmico + macrolídeo; MRSA/Pseudomonas dependem de fatores de risco.":
    "ATS/IDSA NAC 2019: la neumonía adquirida en la comunidad grave puede tratarse con betalactámico + macrólido; el SARM y Pseudomonas dependen de los factores de riesgo.",
  "ATS/IDSA HAP/VAP 2016: HAP grave/hospitalar pede cobertura antipseudomonas; vancomicina ou linezolida quando há risco de MRSA.":
    "ATS/IDSA NAH/NAVM 2016: la neumonía intrahospitalaria grave exige cobertura antipseudomónica; vancomicina o linezolid cuando hay riesgo de SARM.",
  "IDSA AMR 2024: carbapenêmicos são preferidos quando há alto risco ou confirmação de ESBL fora do trato urinário e em pacientes criticamente enfermos.":
    "IDSA AMR 2024: los carbapenémicos son de elección cuando hay un riesgo alto o confirmación de BLEE fuera del tracto urinario y en pacientes críticamente enfermos.",
  "IDSA cateter intravascular 2009: bacteremia relacionada a cateter frequentemente exige cobertura gram-positiva, incluindo MRSA, e remoção/troca do dispositivo.":
    "IDSA catéter intravascular 2009: la bacteriemia relacionada con el catéter con frecuencia exige cobertura para grampositivos, incluido el SARM, y la retirada o el recambio del dispositivo.",
  "SSC 2021: antimicrobianos imediatos em até 1 hora para choque séptico/alta probabilidade; investigação rápida e até 3 horas quando a sepse sem choque segue provável.":
    "SSC 2021: antimicrobianos inmediatos en un plazo de 1 hora para el choque séptico o la probabilidad alta; investigación rápida y hasta 3 horas cuando la sepsis sin choque sigue siendo probable.",

  // ── Tempo-porta-antibiótico ────────────────────────────────────────────────
  "Administrar agora, idealmente dentro de 1 hora do reconhecimento.":
    "Administrarlo ahora, idealmente dentro de la primera hora tras el reconocimiento.",
  "CHOQUE SÉPTICO: administrar ATB IMEDIATAMENTE — idealmente em até 1 hora (recomendação forte, SSC 2021).":
    "CHOQUE SÉPTICO: administrar el antibiótico DE INMEDIATO — idealmente en un plazo de 1 hora (recomendación fuerte, SSC 2021).",
  "Choque séptico ou alta probabilidade: administrar antimicrobiano imediatamente, idealmente em até 1 hora.":
    "Choque séptico o probabilidad alta: administrar el antimicrobiano de inmediato, idealmente en un plazo de 1 hora.",
  "No choque séptico ou probabilidade muito alta, o antimicrobiano não deve atrasar: objetivo é até 1 hora.":
    "En el choque séptico o cuando la probabilidad es muy alta, el antimicrobiano no debe retrasarse: el objetivo es 1 hora.",
  "SEPSE POSSÍVEL SEM CHOQUE: investigação rápida (até 3 horas) antes de iniciar ATB — recomendação condicional SSC 2021.":
    "SEPSIS POSIBLE SIN CHOQUE: investigación rápida (hasta 3 horas) antes de iniciar el antibiótico — recomendación condicional SSC 2021.",
  "SEPSE SEM CHOQUE: meta de 1ª dose em até 1 hora (recomendação forte, SSC 2021).":
    "SEPSIS SIN CHOQUE: meta de 1.ª dosis en un plazo de 1 hora (recomendación fuerte, SSC 2021).",
  "Sem choque, faça avaliação rápida das causas infecciosas e não infecciosas; se a probabilidade de sepse seguir alta, objetivo é antibiótico em até 3 horas.":
    "Sin choque, realice una evaluación rápida de las causas infecciosas y no infecciosas; si la probabilidad de sepsis sigue siendo alta, el objetivo es el antibiótico en un plazo de 3 horas.",
  "Sem choque: fazer avaliação rápida das causas infecciosas e não infecciosas; se a probabilidade de sepse seguir alta, administrar antimicrobiano em até 3 horas.":
    "Sin choque: realizar una evaluación rápida de las causas infecciosas y no infecciosas; si la probabilidad de sepsis sigue siendo alta, administrar el antimicrobiano en un plazo de 3 horas.",
  "Se suspeita de infecção persistir após avaliação rápida, administrar ATB em até 3 horas.":
    "Si la sospecha de infección persiste tras la evaluación rápida, administrar el antibiótico en un plazo de 3 horas.",
  "Antimicrobiano ainda não registrado como realizado. Rever agora a meta de 1 hora.":
    "El antimicrobiano aún no está registrado como administrado. Revise ahora la meta de 1 hora.",
  "Antimicrobiano ainda não registrado.": "Antimicrobiano aún no registrado.",
  "ATB empírico (até antibiograma):": "Antibiótico empírico (hasta el antibiograma):",
  "⏱️ ATB em até 1 hora — Sepse confirmada (SSC 2021)":
    "⏱️ Antibiótico en un plazo de 1 hora — Sepsis confirmada (SSC 2021)",
  "⏱️ ATB em até 3 horas — Sepse possível (SSC 2021)":
    "⏱️ Antibiótico en un plazo de 3 horas — Sepsis posible (SSC 2021)",
  "NÃO retardar o ATB aguardando a intervenção cirúrgica.":
    "NO retrasar el antibiótico a la espera de la intervención quirúrgica.",
  "Não aguardar culturas se isso atrasar o tratamento.":
    "No esperar las culturas si eso retrasa el tratamiento.",
  "Se a hipótese infecciosa ainda for incerta, continue reavaliação clínica e diagnósticos diferenciais antes de escalar ATB.":
    "Si la hipótesis infecciosa aún es incierta, continúe con la reevaluación clínica y los diagnósticos diferenciales antes de escalar el antibiótico.",
  "Se a suspeita de sepse se confirmar, escolher esquema conforme foco, gravidade e protocolo local.":
    "Si la sospecha de sepsis se confirma, elegir el esquema según el foco, la gravedad y el protocolo local.",
  "Revisar adequação do antimicrobiano conforme hipótese clínica e exames.":
    "Revisar la idoneidad del antimicrobiano según la hipótesis clínica y los exámenes.",
  "Sepse exige bundle precoce. Priorizar antimicrobianos, reavaliar perfusão e completar as medidas iniciais sem atraso.":
    "La sepsis exige un paquete de medidas precoz. Priorizar los antimicrobianos, reevaluar la perfusión y completar las medidas iniciales sin demora.",
  "Sepse tratada como emergência médica.": "La sepsis se trata como una emergencia médica.",
  "Priorizar antimicrobiano em até 1 hora, ressuscitação volêmica e reavaliação para confirmar critérios de choque séptico conforme resposta ao volume, lactato e necessidade de vasopressor.":
    "Priorizar el antimicrobiano en un plazo de 1 hora, la reanimación con volumen y la reevaluación para confirmar los criterios de choque séptico según la respuesta al volumen, el lactato y la necesidad de vasopresor.",
  "Complete o bundle conforme os dados clínicos e laboratoriais forem ficando disponíveis.":
    "Complete el paquete de medidas a medida que los datos clínicos y de laboratorio estén disponibles.",

  // ── Culturas e controle de foco ────────────────────────────────────────────
  "Coletar culturas antes do antimicrobiano se isso não provocar atraso clinicamente relevante.":
    "Tomar las culturas antes del antimicrobiano si eso no provoca un retraso clínicamente relevante.",
  "Colete culturas agora, antes do antimicrobiano, se isso não gerar atraso importante.":
    "Tome las culturas ahora, antes del antimicrobiano, si eso no genera un retraso importante.",
  "Colete culturas antes do antimicrobiano se isso não causar atraso significativo.":
    "Tome las culturas antes del antimicrobiano si eso no causa un retraso significativo.",
  "Culturas solicitadas antes do antimicrobiano quando possível.":
    "Culturas solicitadas antes del antimicrobiano siempre que sea posible.",
  "Coletar hemoculturas: 1 par pelo cateter + 1 par periférico antes de remover.":
    "Tomar hemocultivos: 1 par por el catéter + 1 par periférico antes de retirarlo.",
  "Coletar quando houver indicação clínica e sem atrasar o tratamento.":
    "Tomarlas cuando haya indicación clínica y sin retrasar el tratamiento.",
  "Acione controle de foco o mais cedo possível quando houver drenagem, desbridamento ou retirada de dispositivo.":
    "Active el control del foco lo antes posible cuando corresponda un drenaje, un desbridamiento o la retirada de un dispositivo.",
  "Controle de foco deve ser planejado precocemente quando houver coleção, obstrução, tecido infectado ou dispositivo potencialmente infectado.":
    "El control del foco debe planificarse de forma precoz cuando hay una colección, una obstrucción, tejido infectado o un dispositivo potencialmente infectado.",
  "Controle de foco: avaliar necessidade de drenagem / desbridamento / remoção de dispositivo — idealmente em ≤ 6–12h quando anatomicamente possível (SSC 2021 — acionar cirurgião/especialista)":
    "Control del foco: evaluar la necesidad de drenaje, desbridamiento o retirada del dispositivo — idealmente en ≤ 6–12 h cuando sea anatómicamente posible (SSC 2021 — avisar al cirujano o especialista)",
  "Priorizar controle de foco: drenagem, abordagem cirúrgica ou retirada de dispositivo, quando indicado.":
    "Priorizar el control del foco: drenaje, abordaje quirúrgico o retirada del dispositivo, cuando esté indicado.",
  "Retirar ou trocar o dispositivo suspeito assim que houver acesso alternativo seguro.":
    "Retirar o recambiar el dispositivo sospechoso en cuanto haya un acceso alternativo seguro.",
  "Avaliar drenagem percutânea ou laparotomia conforme contexto.":
    "Evaluar el drenaje percutáneo o la laparotomía según el contexto.",
  "Trocar acesso por sítio diferente após estabilização.":
    "Cambiar el acceso a un sitio diferente tras la estabilización.",
  "⚠️ ATB sozinho NÃO trata infecção abdominal drenável — controle de foco é obrigatório":
    "⚠️ El antibiótico por sí solo NO trata la infección abdominal drenable — el control del foco es obligatorio",
  "Descalonamento de ATB em 48–72h: aguardar culturas e antibiograma — reduzir espectro o mais cedo possível; usar Procalcitonina (PCT) seriada para guiar duração e de-escalada (SSC 2021 — recomendação fraca, evidência moderada)":
    "Desescalada del antibiótico en 48–72 h: esperar las culturas y el antibiograma — reducir el espectro lo antes posible; usar la procalcitonina seriada para guiar la duración y la desescalada (SSC 2021 — recomendación débil, evidencia moderada)",

  // ── Volume e vasopressor ───────────────────────────────────────────────────
  "Há hipoperfusão ou hipotensão. Considerar pelo menos 30 mililitros por quilo de cristalóide nas primeiras horas quando apropriado.":
    "Hay hipoperfusión o hipotensión. Considerar al menos 30 mililitros por kilo de cristaloide en las primeras horas cuando sea apropiado.",
  "Há risco de sobrecarga: preferir bolus menores (250–500 mL) com reavaliação seriada de perfusão, ausculta e oxigenação.":
    "Hay riesgo de sobrecarga: preferir bolos menores (250–500 mL) con reevaluación seriada de la perfusión, la auscultación y la oxigenación.",
  " Risco de sobrecarga: prefira bolus fracionados com reavaliação dinâmica.":
    " Riesgo de sobrecarga: prefiera bolos fraccionados con reevaluación dinámica.",
  "Infundir em bolus de 500 mL repetindo conforme resposta hemodinâmica.":
    "Infundir en bolos de 500 mL repitiéndolos según la respuesta hemodinámica.",
  "Ressuscitação volêmica ainda pendente.": "Reanimación con volumen aún pendiente.",
  "Ressuscitação volêmica indicada no contexto atual.":
    "Reanimación con volumen indicada en el contexto actual.",
  "Ressuscitação volêmica já registrada. Avaliar resposta clínica real.":
    "Reanimación con volumen ya registrada. Evaluar la respuesta clínica real.",
  "Hipotensão persistente após volume exige vasopressor. Noradrenalina é a primeira linha para meta de PAM maior ou igual a 65 milímetros de mercúrio.":
    "La hipotensión persistente tras el volumen exige un vasopresor. La noradrenalina es la primera línea para una meta de PAM mayor o igual a 65 milímetros de mercurio.",
  "Indicar se PAM < 65 mmHg após volume.": "Indicarlo si la PAM < 65 mmHg tras el volumen.",
  "Iniciar noradrenalina agora — vasopressor de 1ª linha. Meta PAM ≥65 mmHg.":
    "Iniciar noradrenalina ahora — vasopresor de 1.ª línea. Meta de PAM ≥ 65 mmHg.",
  "Inicie noradrenalina se a PAM seguir abaixo de 65 mmHg após ressuscitação volêmica.":
    "Inicie noradrenalina si la PAM sigue por debajo de 65 mmHg tras la reanimación con volumen.",
  "Inicie noradrenalina se a hipotensão persistir após ressuscitação volêmica adequada, para meta de PAM maior ou igual a 65 milímetros de mercúrio.":
    "Inicie noradrenalina si la hipotensión persiste tras una reanimación con volumen adecuada, para una meta de PAM mayor o igual a 65 milímetros de mercurio.",
  "Noradrenalina já registrada. Reavaliar PAM e necessidade de associação.":
    "Noradrenalina ya registrada. Reevaluar la PAM y la necesidad de asociarla con otro fármaco.",
  "Noradrenalina sugerida pelo contexto hemodinâmico.":
    "Noradrenalina sugerida por el contexto hemodinámico.",
  "Noradrenalina é a primeira linha se a PAM seguir abaixo da meta ou o choque ficar evidente.":
    "La noradrenalina es la primera línea si la PAM sigue por debajo de la meta o el choque se hace evidente.",
  "Noradrenalina é o vasopressor de 1ª escolha: iniciar 0,1–0,2 mcg/kg/min.":
    "La noradrenalina es el vasopresor de 1.ª elección: iniciar con 0,1–0,2 mcg/kg/min.",
  "Noradrenalina: 1ª escolha — iniciar 0,1 mcg/kg/min e titular.":
    "Noradrenalina: 1.ª elección — iniciar con 0,1 mcg/kg/min y titular.",
  "Primeira linha para meta de PAM maior ou igual a 65 mmHg.":
    "Primera línea para una meta de PAM mayor o igual a 65 mmHg.",
  "Se PAM <65 após volume, inicie noradrenalina.":
    "Si la PAM < 65 tras el volumen, inicie noradrenalina.",
  "Vasopressor ainda não iniciado.": "Vasopresor aún no iniciado.",
  "Neste momento, reservar vasopressor para hipotensão persistente após volume ou choque já evidente.":
    "En este momento, reservar el vasopresor para la hipotensión persistente tras el volumen o para el choque ya evidente.",
  "Contexto de choque mais grave: considerar noradrenalina precocemente enquanto organiza a ressuscitação.":
    "Contexto de choque más grave: considerar la noradrenalina de forma precoz mientras organiza la reanimación.",
  "Persistência de hipotensão ou hipoperfusão após volume.":
    "Persistencia de la hipotensión o la hipoperfusión tras el volumen.",
  "Reavaliar necessidade de vasopressor conforme resposta ao volume.":
    "Reevaluar la necesidad de vasopresor según la respuesta al volumen.",
  "Considerar associação de vasopressina": "Considerar la asociación de vasopresina",
  "Vasopressina já foi sugerida como adição.":
    "La vasopresina ya se sugirió como fármaco añadido.",
  "Considerar dobutamina se disfunção miocárdica com hipoperfusão persistente.":
    "Considerar dobutamina si hay disfunción miocárdica con hipoperfusión persistente.",
  "Dobutamina: considerar se disfunção miocárdica associada.":
    "Dobutamina: considerarla si hay disfunción miocárdica asociada.",
  "Se houver disfunção miocárdica com hipoperfusão persistente apesar de pressão adequada, considerar inotrópico.":
    "Si hay disfunción miocárdica con hipoperfusión persistente a pesar de una presión adecuada, considerar un inotrópico.",
  "Reavaliar disfunção miocárdica e hipoperfusão persistente.":
    "Reevaluar la disfunción miocárdica y la hipoperfusión persistente.",
  "Se houver piora, retornar para vasopressor ou reavaliação hemodinâmica.":
    "Si hay empeoramiento, volver al vasopresor o a la reevaluación hemodinámica.",
  "⚠️ Dose excepcional de noradrenalina (> 1–3 mcg/kg/min):":
    "⚠️ Dosis excepcional de noradrenalina (> 1–3 mcg/kg/min):",
  "   - Acima de ~1 mcg/kg/min: saturação progressiva de receptores α1 reduz eficiência":
    "   - Por encima de ~1 mcg/kg/min: la saturación progresiva de los receptores α1 reduce la eficiencia",
  "   - Estratégia multimodal obrigatória: vasopressina (se não iniciada) + hidrocortisona":
    "   - Estrategia multimodal obligatoria: vasopresina (si no se inició) + hidrocortisona",
  "   - Excluir tamponamento, disfunção VD grave, hipo/hipervolemia":
    "   - Descartar taponamiento, disfunción grave del ventrículo derecho e hipovolemia o hipervolemia",
  "   - Não existe dose máxima estabelecida (ICM 2024) — titular pelo efeito":
    "   - No existe una dosis máxima establecida (ICM 2024) — titular por el efecto",
  "   - Se disfunção VE: dobutamina 2,5–5 mcg/kg/min":
    "   - Si hay disfunción del ventrículo izquierdo: dobutamina 2,5–5 mcg/kg/min",

  // ── Acessos e monitorização ────────────────────────────────────────────────
  "Planejar CVC (jugular interna ou subclávia) para vasopressor e monitorização de PVC.":
    "Planificar un catéter venoso central (yugular interna o subclavia) para el vasopresor y la monitorización de la presión venosa central.",
  "Prefira acesso venoso central. Pode iniciar periférico temporariamente em emergência.":
    "Prefiera el acceso venoso central. Puede iniciarlo por vía periférica de forma temporal en una emergencia.",
  "Reservar acesso central se houver necessidade de vasopressor, nutrição ou PVC.":
    "Reservar el acceso central si hay necesidad de vasopresor, nutrición o medición de la presión venosa central.",
  "Lactato seriado em 2h — meta: redução ≥ 10%":
    "Lactato seriado a las 2 h — meta: reducción ≥ 10%",
  "Mensuração de lactato solicitada.": "Medición de lactato solicitada.",
  "Remensurar lactato em 2h (meta redução ≥10%)":
    "Volver a medir el lactato a las 2 h (meta: reducción ≥ 10%)",
  "Remensurar lactato em 2h: meta ↓ ≥ 10% — persistência indica ressuscitação insuficiente":
    "Volver a medir el lactato a las 2 h: meta ↓ ≥ 10% — la persistencia indica una reanimación insuficiente",
  "Meta: ≥ 0,5 mL/kg/h. Registrar balanço hídrico horário.":
    "Meta: ≥ 0,5 mL/kg/h. Registrar el balance hídrico horario.",
  "Oligúria persistente sugere disfunção renal por hipoperfusão — reavaliar.":
    "La oliguria persistente sugiere una disfunción renal por hipoperfusión — reevaluar.",
  "Reavaliar perfusão de forma integrada: PAM, enchimento capilar, diurese, estado mental e lactato.":
    "Reevaluar la perfusión de forma integrada: PAM, relleno capilar, diuresis, estado mental y lactato.",
  "Prosseguir com reavaliação clínica contínua e controle do foco.":
    "Continuar con la reevaluación clínica continua y el control del foco.",
  "Comunicar UTI / time de resposta rápida — transferência prioritária":
    "Avisar a la UCI o al equipo de respuesta rápida — traslado prioritario",
};
