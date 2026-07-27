/**
 * Telas de calculadora (eletrólitos, vasoativos, sedoanalgesia) e o
 * configurador de VM — dicionário PT → ES.
 *
 * Esses arquivos não tinham NENHUMA chamada tr(): renderizavam português
 * direto, e por isso escapavam da verificação de cobertura (que só checava se
 * as tr("literal") existentes tinham tradução).
 */
export const ES_CALCULADORAS_UI: Record<string, string> = {
  // ══ Vasoativos — frases de runtime (trf) ══════════════════════════════════
  "PAM estimada no encaminhamento ~ {0} mmHg: quadro ainda sugere hipoperfusão relevante, exigir titulação rápida e reavaliação frequente.":
    "PAM estimada en la derivación ~ {0} mmHg: el cuadro aún sugiere una hipoperfusión relevante; exige una titulación rápida y reevaluación frecuente.",
  "Retirar {0} ampola{1} de {2} ({3} {4})": "Retirar {0} ampolla{1} de {2} ({3} {4})",
  "Adicionar {0} mL de {1}": "Añadir {0} mL de {1}",
  "Volume final: {0} mL": "Volumen final: {0} mL",
  "Concentração: {0} {1}": "Concentración: {0} {1}",
  "Taxa na bomba: {0} mL/h": "Velocidad en la bomba: {0} mL/h",
  "Ampola 4 mL com 2 mg/mL de hemitartarato equivale a 4 mg de noradrenalina base.":
    "La ampolla de 4 mL con 2 mg/mL de hemitartrato equivale a 4 mg de noradrenalina base.",
  "Peso (kg) — obrigatório": "Peso (kg) — obligatorio",
  "SF 0,9%": "solución fisiológica 0,9%",
  "SG 5%": "dextrosa al 5%",

  // ══ Navegação ═════════════════════════════════════════════════════════════
  "Voltar aos módulos": "Volver a los módulos",
  "Voltar para": "Volver a",
  "Droga sugerida": "Fármaco sugerido",
  "Manifestações": "Manifestaciones",
  "Motivo": "Motivo",

  // ══ Comuns às calculadoras ════════════════════════════════════════════════
  "PACIENTE": "PACIENTE",
  "Acesso": "Acceso",
  "Ampolas": "Ampollas",
  "Tipo": "Tipo",
  "Diluente": "Diluyente",
  "Diluente (mL)": "Diluyente (mL)",
  "Vol. final": "Vol. final",
  "DOSE": "DOSIS",
  "DILUIÇÃO": "DILUCIÓN",
  "TAXA": "VELOCIDAD",
  "CALCULAR": "CALCULAR",
  "Salvar": "Guardar",
  "Salvar diluição": "Guardar la dilución",
  "+ Salvar atual": "+ Guardar la actual",
  "+ Add": "+ Añadir",
  "Diluições recomendadas": "Diluciones recomendadas",
  "Diluições do usuário": "Diluciones del usuario",
  "Buscar...": "Buscar...",
  "Meta": "Meta",
  "Emergência": "Emergencia",
  "Outro": "Otro",
  "Outro valor:": "Otro valor:",
  "Contexto encaminhado": "Contexto derivado",
  "ESTRATÉGIA INICIAL": "ESTRATEGIA INICIAL",
  "Estratégia inicial": "Estrategia inicial",

  // ══ Eletrólitos ═══════════════════════════════════════════════════════════
  "Calculadora alinhada ao padrão dos módulos":
    "Calculadora alineada al estándar de los módulos",
  "Mesmo herói, mesma navegação e mesma hierarquia de leitura para reduzir a troca de contexto entre guias e calculadoras.":
    "El mismo encabezado, la misma navegación y la misma jerarquía de lectura para reducir el cambio de contexto entre guías y calculadoras.",
  "Selecione o eletrólito na lateral e siga o raciocínio clínico mantendo o mesmo padrão visual do app.":
    "Seleccione el electrolito en el panel lateral y siga el razonamiento clínico manteniendo el mismo estándar visual de la app.",
  "Correção guiada": "Corrección guiada",
  "CORREÇÃO GUIADA": "CORRECCIÓN GUIADA",
  "Navegação laboratorial": "Navegación de laboratorio",
  "Eletrólito": "Electrolito",
  "Distúrbio": "Trastorno",
  "Classificação atual": "Clasificación actual",
  "Aguardando valor": "Esperando el valor",
  "Gravidade": "Gravedad",
  "Unidade do eletrólito": "Unidad del electrolito",
  "Unidade do magnésio": "Unidad del magnesio",

  // ── Eletrólitos: rótulos de seção ──────────────────────────────────────────
  "Como pensar": "Cómo razonarlo",
  "Como usar no plantão": "Cómo usarlo en la guardia",
  "Conduta prática": "Conducta práctica",
  "Contexto clínico": "Contexto clínico",
  "Contexto renal": "Contexto renal",
  "Contexto renal e arrítmico": "Contexto renal y arrítmico",
  "Contexto renal e ácido-base": "Contexto renal y ácido-base",
  "Contexto ácido-base e renal": "Contexto ácido-base y renal",
  "Controles e condutas associadas": "Controles y conductas asociadas",
  "Sinais e sintomas-chave": "Signos y síntomas clave",
  "Leitura de beira-leito": "Lectura a pie de cama",
  "Leitura prática": "Lectura práctica",
  "Uso prático": "Uso práctico",
  "Medidas iniciais": "Medidas iniciales",
  "MEDIDAS GERAIS E CONTROLES": "MEDIDAS GENERALES Y CONTROLES",
  "INFORMAÇÕES COMPLEMENTARES": "INFORMACIÓN COMPLEMENTARIA",
  "CÁLCULO RÁPIDO": "CÁLCULO RÁPIDO",
  "SOLUÇÃO DE INFUSÃO": "SOLUCIÓN DE INFUSIÓN",
  "Exemplo de preparo": "Ejemplo de preparación",
  "Equivalências": "Equivalencias",
  "Equivalência prática": "Equivalencia práctica",
  "Equivalente": "Equivalente",
  "Thresholds úteis": "Umbrales útiles",
  "Pontos de gravidade": "Puntos de gravedad",
  "Risco clínico": "Riesgo clínico",
  "Risco de hipoglicemia": "Riesgo de hipoglucemia",
  "Função renal": "Función renal",
  "Rim": "Riñón",
  "Atenção renal": "Atención renal",
  "Sexo e água corporal": "Sexo y agua corporal",
  "Velocidade, volemia e controles": "Velocidad, volemia y controles",
  "Ca x P e função renal": "Ca × P y función renal",

  // ── Eletrólitos: alertas ───────────────────────────────────────────────────
  "Alerta de acesso": "Alerta de acceso",
  "Alerta de carga": "Alerta de carga",
  "Alerta de gravidade": "Alerta de gravedad",
  "Alerta de segurança": "Alerta de seguridad",
  "Alerta ácido-base": "Alerta ácido-base",
  "Atenção de acesso": "Atención sobre el acceso",

  // ── Eletrólitos: metas, doses e cálculos ───────────────────────────────────
  "Meta / alvo": "Meta / objetivo",
  "Meta inicial": "Meta inicial",
  "Meta operacional": "Meta operativa",
  "Dose IV sugerida": "Dosis IV sugerida",
  "Dose sugerida": "Dosis sugerida",
  "Reposição IV": "Reposición IV",
  "Reposição IV inicial": "Reposición IV inicial",
  "Reposição prática inicial": "Reposición práctica inicial",
  "Reposição orientada por cloreto": "Reposición orientada por el cloruro",
  "Resgate IV": "Rescate IV",
  "Taxa prática": "Velocidad práctica",
  "Déficit estimado": "Déficit estimado",
  "Déficit hídrico até 140": "Déficit hídrico hasta 140",
  "Déficit rough": "Déficit aproximado",
  "Déficit total rough": "Déficit total aproximado",
  "Excesso rough": "Exceso aproximado",
  "Água livre alvo (L)": "Agua libre objetivo (L)",
  "Água para meta": "Agua para la meta",
  "TBW": "Agua corporal total",
  "Δ desejado": "Δ deseado",
  "≈ mmol/L": "≈ mmol/L",
  "Na corrigido": "Na corregido",
  "Ca corrigido": "Ca corregido",
  "Cálcio atual": "Calcio actual",
  "Cálcio elementar": "Calcio elemental",
  "Fósforo atual": "Fósforo actual",
  "Mg atual": "Mg actual",
  "Cl atual": "Cl actual",
  "HCO3-": "HCO₃⁻",
  "Cálcio": "Calcio",
  "Fósforo": "Fósforo",
  "Magnésio": "Magnesio",
  "Magnésio associado": "Magnesio asociado",
  "Sal": "Sal",
  "Sal fosfatado": "Sal de fosfato",
  "Estabilização de membrana": "Estabilización de la membrana",
  "Shift intracelular": "Desplazamiento intracelular",
  "Remoção de potássio": "Eliminación del potasio",
  "Antagonismo e suporte": "Antagonismo y soporte",
  "Calcitonina 4 UI/kg": "Calcitonina 4 UI/kg",

  // ── Eletrólitos: cenários e fases ──────────────────────────────────────────
  "Cenário 1: SG 5% / água livre EV": "Escenario 1: dextrosa al 5% / agua libre IV",
  "Cenário 2: SF 0,9% + água destilada":
    "Escenario 2: solución fisiológica 0,9% + agua destilada",
  "Cenário 3: SF 0,9% ou cristalóide balanceado":
    "Escenario 3: solución fisiológica 0,9% o cristaloide balanceado",
  "Cenário 3: água destilada + NaCl 20%": "Escenario 3: agua destilada + NaCl al 20%",
  "Cenário 4: SIADH com restrição hídrica + ureia":
    "Escenario 4: SIADH con restricción hídrica + urea",
  "Cenário 4: água por sonda ou via oral": "Escenario 4: agua por sonda o vía oral",
  "Cenário 5: SIADH com NaCl oral + diurético de alça":
    "Escenario 5: SIADH con NaCl oral + diurético de asa",
  "Cenário 6: resgate de sobrecorreção com D5W + desmopressina":
    "Escenario 6: rescate de la sobrecorrección con dextrosa al 5% + desmopresina",
  "Fase 1: resgate emergencial": "Fase 1: rescate de emergencia",
  "Fase 2: manutenção nas próximas 24 h": "Fase 2: mantenimiento en las próximas 24 h",

  // ══ Vasoativos ════════════════════════════════════════════════════════════
  "💊 Drogas Vasoativas": "💊 Fármacos vasoactivos",
  "📋 PREPARO": "📋 PREPARACIÓN",
  "🔗 Associações indicadas": "🔗 Asociaciones indicadas",
  "ℹ️ Referência clínica": "ℹ️ Referencia clínica",
  "Titulação": "Titulación",
  "Nome da diluição (ex: Padrão UTI)": "Nombre de la dilución (ej.: estándar de UCI)",
  "Nenhuma diluição salva. Configure abaixo e toque em \"+ Salvar atual\".":
    "Ninguna dilución guardada. Configúrela abajo y toque «+ Guardar la actual».",
  "Alvo hemodinâmico inicial habitual: PAM ≥ 65 mmHg, ajustando ao contexto clínico.":
    "Objetivo hemodinámico inicial habitual: PAM ≥ 65 mmHg, ajustándolo al contexto clínico.",
  "Vasopressor periférico pode ser usado por curto período em veia proximal enquanto organiza acesso central, com vigilância frequente do sítio.":
    "El vasopresor periférico puede usarse por poco tiempo en una vena proximal mientras se consigue el acceso central, con vigilancia frecuente del sitio.",
  "⚠️ Informe o peso do paciente acima para calcular a dose em mcg/kg/min.":
    "⚠️ Indique el peso del paciente arriba para calcular la dosis en mcg/kg/min.",
  "⚠️ Informe o peso para calcular a dose em mcg/kg/min":
    "⚠️ Indique el peso para calcular la dosis en mcg/kg/min",

  // ══ Sedoanalgesia ═════════════════════════════════════════════════════════
  "💉 Sedoanalgesia & BNM": "💉 Sedoanalgesia y bloqueo neuromuscular",
  "📚 Referência": "📚 Referencia",
  "ℹ️ Informações clínicas": "ℹ️ Información clínica",
  "MODO DE USO": "MODO DE USO",
  "TAXA NA BOMBA": "VELOCIDAD EN LA BOMBA",
  "BOLUS — ADMINISTRAR": "BOLO — ADMINISTRAR",
  "APRESENTAÇÃO (BOLUS — AMPOLA PURA)": "PRESENTACIÓN (BOLO — AMPOLLA PURA)",
  "Criar diluição personalizada": "Crear una dilución personalizada",
  "Nome (ex: Padrão UTI)": "Nombre (ej.: estándar de UCI)",
  "Nenhuma diluição salva. Monte a sua abaixo (ampolas + diluente + tipo) e toque em \"+ Salvar atual\".":
    "Ninguna dilución guardada. Arme la suya abajo (ampollas + diluyente + tipo) y toque «+ Guardar la actual».",
  "Informe o peso para calcular.": "Indique el peso para calcular.",
  "⚠️ Informe o peso para calcular esta dose.":
    "⚠️ Indique el peso para calcular esta dosis.",
  "Dose por hora — não depende do peso.": "Dosis por hora — no depende del peso.",
  "Dose ACURASYS fixa: 37,5 mg/h · toque para voltar à dose por peso":
    "Dosis ACURASYS fija: 37,5 mg/h · toque para volver a la dosis por peso",
  "Paciente em sulfato de magnésio?": "¿El paciente recibe sulfato de magnesio?",
  "⚠️ MgSO₄ potencializa o rocurônio — reduzir a dose em 30–50% e monitorar com TOF.":
    "⚠️ El MgSO₄ potencia el rocuronio — reducir la dosis un 30–50% y monitorizar con TOF.",


  // ══ Vasoativos — estratégia, associações e alertas ═════════════════════════
  "0,03 U/min (fixo)": "0,03 U/min (fija)",
  "2,5–10 mcg/kg/min": "2,5–10 mcg/kg/min",
  "2,5–5 mcg/kg/min": "2,5–5 mcg/kg/min",
  "200 mg/dia IV contínuo": "200 mg/día IV en infusión continua",
  "5–200 mcg/min": "5–200 mcg/min",
  "Conforme cálculo": "Según el cálculo",
  "Conforme protocolo": "Según el protocolo",
  "Continuar conforme dose": "Continuar según la dosis",
  "mcg/mL": "mcg/mL",
  "extremidades frias": "extremidades frías",
  " · revisar": " · revisar",
  " — obrigatório": " — obligatorio",

  "Droga de primeira linha na maioria dos choques vasoplégicos; alvo inicial habitual: PAM ≥ 65 mmHg.":
    "Fármaco de primera línea en la mayoría de los choques vasopléjicos; objetivo inicial habitual: PAM ≥ 65 mmHg.",
  "Primeira linha na vasoplegia/choque séptico; adicionar vasopressina se PAM seguir baixa.":
    "Primera línea en la vasoplejía o el choque séptico; añadir vasopresina si la PAM sigue baja.",
  "Se PAM continuar inadequada com noradrenalina baixa a moderada, considerar associar vasopressina.":
    "Si la PAM sigue inadecuada con noradrenalina en dosis baja a moderada, considerar asociar vasopresina.",
  "Se acesso central ainda não existir, pode iniciar perifericamente por curto período em veia proximal, com vigilância estreita do sítio.":
    "Si aún no hay acceso central, puede iniciarse por vía periférica durante poco tiempo en una vena proximal, con vigilancia estrecha del sitio.",
  "Sinais de hipoperfusão periférica reforçam necessidade de reavaliar resposta ao vasopressor junto com débito urinário, nível de consciência e lactato.":
    "Los signos de hipoperfusión periférica refuerzan la necesidad de reevaluar la respuesta al vasopresor junto con la diuresis, el nivel de consciencia y el lactato.",
  "Usar conforme contexto hemodinâmico e protocolo local.":
    "Usarlo según el contexto hemodinámico y el protocolo local.",
  "Reservar para contextos específicos como anafilaxia refratária, choque com componente beta necessário ou protocolo local.":
    "Reservarlo para contextos específicos como la anafilaxia refractaria, el choque que requiere componente beta o el protocolo local.",
  "Não banalizar adrenalina EV: manter monitorização contínua e titular conforme perfusão, frequência cardíaca e arritmias.":
    "No banalizar la adrenalina IV: mantener la monitorización continua y titularla según la perfusión, la frecuencia cardíaca y las arritmias.",
  "Na anafilaxia, adrenalina em infusão é opção para choque refratário após adrenalina IM adequada, oxigênio e volume.":
    "En la anafilaxia, la adrenalina en infusión es una opción para el choque refractario tras una adrenalina IM adecuada, oxígeno y volumen.",
  "Antes de escalar vasopressor, confirmar que a anafilaxia já recebeu adrenalina IM repetida quando indicada, O₂, posicionamento e cristalóide.":
    "Antes de escalar el vasopresor, confirmar que en la anafilaxia ya se administró adrenalina IM repetida cuando estaba indicada, O₂, posicionamiento y cristaloide.",
  "Se a vasoplegia persistir apesar da adrenalina, discutir associação de outro vasopressor conforme contexto hemodinâmico.":
    "Si la vasoplejía persiste a pesar de la adrenalina, discutir la asociación de otro vasopresor según el contexto hemodinámico.",
  "Vasopressina é adjuvante, não vasopressor isolado principal; manter o vasopressor de base.":
    "La vasopresina es adyuvante, no el vasopresor principal aislado; mantener el vasopresor de base.",
  "Vasopressina é ADJUVANTE — não substitui noradrenalina como vasopressor principal":
    "La vasopresina es ADYUVANTE — no sustituye a la noradrenalina como vasopresor principal",
  "Dobutamina não substitui vasopressor quando a PAM está baixa; associar noradrenalina se houver hipotensão.":
    "La dobutamina no sustituye al vasopresor cuando la PAM está baja; asociar noradrenalina si hay hipotensión.",

  // ── Associações indicadas ──────────────────────────────────────────────────
  "Noradrenalina (preferir)": "Noradrenalina (preferir)",
  "Noradrenalina (preferir em sepse)": "Noradrenalina (preferir en la sepsis)",
  "Dobutamina (evitar)": "Dobutamina (evitar)",
  "Nitroglicerina (alternativa)": "Nitroglicerina (alternativa)",
  "Morfina (avaliar)": "Morfina (valorar)",
  "Milrinona / Levosimendan": "Milrinona / levosimendán",
  "Angiotensina II / Azul de metileno": "Angiotensina II / azul de metileno",
  "Atropina / Marcapasso": "Atropina / marcapasos",
  "Furosemida": "Furosemida",
  "Associar quando Nora ≥ 0,25 mcg/kg/min para poupar noradrenalina (SSC 2021)":
    "Asociarla cuando la noradrenalina ≥ 0,25 mcg/kg/min para ahorrarla (SSC 2021)",
  "Associar vasopressor se PAM < 65 — dobutamina sozinha não trata hipotensão vasoplégica":
    "Asociar un vasopresor si la PAM < 65 — la dobutamina sola no trata la hipotensión vasopléjica",
  "Associar vasopressor se PAM < 65 — milrinona causa vasodilatação e pode hipotensão":
    "Asociar un vasopresor si la PAM < 65 — la milrinona causa vasodilatación y puede provocar hipotensión",
  "Adrenalina é segunda linha — considerar substituição por nora quando estabilizado":
    "La adrenalina es de segunda línea — considerar cambiarla por noradrenalina una vez estabilizado",
  "Choque cardiogênico grave: considerar associação de inodilatador se resposta insuficiente":
    "Choque cardiogénico grave: considerar asociar un inodilatador si la respuesta es insuficiente",
  "Choque cardiogênico refratário — combinação possível mas aumenta risco de arritmia":
    "Choque cardiogénico refractario — la combinación es posible pero aumenta el riesgo de arritmia",
  "Choque misto (cardiogênico + vasoplégico) — combinação frequente na UTI":
    "Choque mixto (cardiogénico + vasopléjico) — combinación frecuente en la UCI",
  "Choque persistente com Nora ≥ 0,25 mcg/kg/min sem resposta (SSC 2021)":
    "Choque persistente con noradrenalina ≥ 0,25 mcg/kg/min sin respuesta (SSC 2021)",
  "Choque vasoplégico refratário à adrenalina": "Choque vasopléjico refractario a la adrenalina",
  "Combinação geralmente desnecessária — levosimendan já tem efeito inotrópico":
    "Combinación en general innecesaria — el levosimendán ya tiene efecto inotrópico",
  "Noradrenalina tem melhor evidência em choque séptico — fenilefrina como alternativa":
    "La noradrenalina tiene mejor evidencia en el choque séptico — la fenilefrina es la alternativa",
  "NTG preferível quando: SCA associado, sem necessidade de efeito arterial intenso":
    "Nitroglicerina preferible cuando hay SCA asociado y no se requiere un efecto arterial intenso",
  "EPA: associar diurético para remoção de volume junto com vasodilatação":
    "Edema agudo de pulmón: asociar un diurético para retirar volumen junto con la vasodilatación",
  "Se disfunção sistólica do VE coexistir (eco point-of-care)":
    "Si coexiste disfunción sistólica del ventrículo izquierdo (ecografía a pie de cama)",
  "Ansiedade / dor isquêmica — uso com cautela (depressão respiratória)":
    "Ansiedad / dolor isquémico — usar con cautela (depresión respiratoria)",
  "Necessário suporte vasopressor se PA cair durante infusão (hipotensão frequente)":
    "Se requiere soporte vasopresor si la PA cae durante la infusión (hipotensión frecuente)",
  "Bradicardia reflexa grave: > 40% de redução de FC — intervir":
    "Bradicardia refleja grave: reducción de la FC > 40% — intervenir",
  "Dose excepcional > 3 mcg/kg/min refratária — uso excepcional com intensivista experiente":
    "Dosis excepcional > 3 mcg/kg/min en casos refractarios — uso excepcional con un intensivista experimentado",
  "Toxicidade em doses > 2 mcg/kg/min por > 24–48h ou em IH/IR":
    "Toxicidad con dosis > 2 mcg/kg/min durante > 24–48 h o en insuficiencia hepática o renal",
  "⚠️ Cianeto — antídoto": "⚠️ Cianuro — antídoto",
  "Hidroxocobalamina 5 g IV ou tiossulfato de sódio":
    "Hidroxocobalamina 5 g IV o tiosulfato de sodio",
  "⚠️ SSC 2021: noradrenalina preferida ao invés de dopamina no choque séptico (De Backer NEJM 2010)":
    "⚠️ SSC 2021: se prefiere la noradrenalina en lugar de la dopamina en el choque séptico (De Backer, NEJM 2010)",

  // ══ Ventilador — notas por cenário ════════════════════════════════════════
  "Configurador da ventilação mecânica": "Configurador de la ventilación mecánica",
  "Pulmão normal — ventilação protetora mesmo sem doença.":
    "Pulmón normal — ventilación protectora incluso sin enfermedad.",
  "Pplat ≤ 30, driving pressure ≤ 15. Prona se P/F ≤ 150.":
    "Pplat ≤ 30, driving pressure ≤ 15. Decúbito prono si P/F ≤ 150.",
  "Expiração longa, fluxo alto; vigiar auto-PEEP (pausa expiratória).":
    "Espiración larga, flujo alto; vigilar la auto-PEEP (pausa espiratoria).",
  "Normoventilação: PaCO₂ 35–40; evitar PEEP alto (↑ PIC).":
    "Normoventilación: PaCO₂ 35–40; evitar una PEEP alta (↑ presión intracraneal).",
  "VC pelo peso PREDITO (nunca o atual). Ramped position.":
    "Volumen corriente por el peso PREDICHO (nunca el actual). Posición en rampa.",
  "8–13 (tabela ARDSNet)": "8–13 (tabla ARDSNet)",
  "0–5 (mínimo)": "0–5 (mínimo)",

  // ══ Sedoanalgesia — resíduos ══════════════════════════════════════════════
  "ACURASYS": "ACURASYS",
  "Peso em quilogramas": "Peso en kilogramos",

  // ══ Configurador de VM ════════════════════════════════════════════════════
  "Configurador da VM": "Configurador de la ventilación mecánica",
  "Peso predito → VC, PEEP e FR iniciais":
    "Peso predicho → volumen corriente, PEEP y FR iniciales",
  "Informe altura e sexo para calcular o peso predito e os parâmetros iniciais.":
    "Indique la talla y el sexo para calcular el peso predicho y los parámetros iniciales.",
  "Valores INICIAIS — siga o passo a passo abaixo para titulação, segurança e desmame.":
    "Valores INICIALES — siga el paso a paso de abajo para la titulación, la seguridad y el destete.",
  "Volume corrente": "Volumen corriente",
  "Freq. respiratória": "Frec. respiratoria",
  "Segurança": "Seguridad",
  "Pplat ≤ 30": "Pplat ≤ 30",
  "driving pressure ≤ 15": "driving pressure ≤ 15",
  "Padrão": "Estándar",
  "SARA": "SDRA",
  "Asma/DPOC": "Asma/EPOC",
  "Obeso": "Obeso",
  "cmH₂O": "cmH₂O",
};
