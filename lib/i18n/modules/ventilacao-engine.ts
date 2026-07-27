/**
 * Módulo Ventilação Mecânica (ventilation-engine.ts) — dicionário PT → ES.
 * Terminologia: ventilación mecánica, peso predicho (PBW), volumen corriente (Vt),
 * presión meseta (Pplat), driving pressure, SDRA, decúbito prono, gasometría.
 */
export const ES_VENTILACAO_ENGINE: Record<string, string> = {
  // ── Estado inicial / gasometria ────────────────────────────────────────────
  "Preencha sexo, altura e cenário clínico para o módulo montar o setup inicial do ventilador.":
    "Complete el sexo, la talla y el escenario clínico para que el módulo arme la configuración inicial del ventilador.",
  "Gasometria incompleta": "Gasometría incompleta",
  "Gasometria parcial": "Gasometría parcial",
  "Distúrbio misto com acidemia": "Trastorno mixto con acidemia",
  "Distúrbio misto com alcalemia": "Trastorno mixto con alcalemia",
  "pH normal com retenção crônica de CO₂ provável":
    "pH normal con probable retención crónica de CO₂",
  "pH normal com distúrbio misto/compensado provável":
    "pH normal con probable trastorno mixto/compensado",
  "Acidose respiratória": "Acidosis respiratoria",
  "Alcalose respiratória": "Alcalosis respiratoria",
  "Acidose metabólica provável": "Acidosis metabólica probable",
  "Alcalose metabólica provável": "Alcalosis metabólica probable",
  "pH próximo do normal": "pH cercano al normal",
  "Ajuste ventilatório prioritário": "Ajuste ventilatorio prioritario",
  "modo": "modo",
  "FiO2": "FiO₂",
  "fluxo": "flujo",

  // ── Cálculos e metas ───────────────────────────────────────────────────────
  "Peso predito (PBW)": "Peso predicho (PBW)",
  "Cálculo PBW": "Cálculo del PBW",
  "Vt protetor 6 mL/kg": "Volumen corriente protector 6 mL/kg",
  "Vt inicial 7 mL/kg": "Volumen corriente inicial 7 mL/kg",
  "Parâmetros recomendados agora": "Parámetros recomendados ahora",
  "Meta ventilatória do cenário": "Meta ventilatoria del escenario",
  "⚠️ Parâmetros recomendados": "⚠️ Parámetros recomendados",
  "Vt / kg PBW": "Volumen corriente / kg de PBW",
  "Driving P (Pplat−PEEP)": "Driving pressure (Pplat−PEEP)",
  "PaO₂/FiO₂": "PaO₂/FiO₂",
  "Gravidade da oxigenação": "Gravedad de la oxigenación",
  "Diagnóstico gasométrico": "Diagnóstico gasométrico",
  "Ajuste ventilatório": "Ajuste ventilatorio",
  "Meta ARDS (referência)": "Meta de la SDRA (referencia)",
  "Vt ~6 mL/kg PBW; Pplat ≤30": "Volumen corriente ~6 mL/kg de PBW; Pplat ≤ 30",
  "⚠️ ARDS moderada/grave": "⚠️ SDRA moderada/grave",
  "⚠️ PaO₂/FiO₂ ≤150: considerar pronação prolongada na ventilação mecânica, se não houver contraindicação.":
    "⚠️ PaO₂/FiO₂ ≤ 150: considerar el decúbito prono prolongado en la ventilación mecánica, si no hay contraindicación.",
  "Hipoxêmico": "Hipoxémico",
  "Priorize PEEP/FiO₂ com Vt protetor":
    "Priorice la PEEP/FiO₂ con un volumen corriente protector",
  "Tempo expiratório longo; FR moderada": "Tiempo espiratorio largo; FR moderada",
  "Edema cardiogênico": "Edema cardiogénico",
  "PEEP pode ajudar, mas vigie pressão arterial":
    "La PEEP puede ayudar, pero vigile la presión arterial",
  "⚠️ Revisar setup ventilatório": "⚠️ Revisar la configuración ventilatoria",
  "Resumo do setup recomendado": "Resumen de la configuración recomendada",
  "Setup inicial ainda indisponível": "Configuración inicial aún no disponible",
  "Alarme de configuração ventilatória": "Alarma de configuración ventilatoria",
  "Reaplicar setup sugerido": "Volver a aplicar la configuración sugerida",

  // ── Após a gasometria ──────────────────────────────────────────────────────
  "Interpretação da gasometria atual": "Interpretación de la gasometría actual",
  "Ajuste ventilatório após a gasometria": "Ajuste ventilatorio tras la gasometría",
  "Leitura operacional do ventilador": "Lectura operativa del ventilador",
  "Ajuste fino prioritário": "Ajuste fino prioritario",
  "Hipotensão — cuidado com PEEP": "Hipotensión — cuidado con la PEEP",
  "Alerta: Vt alto para ARDS": "Alerta: volumen corriente alto para SDRA",
  "Pplat elevada": "Pplat elevada",
  "Reavaliação após ajustes": "Reevaluación tras los ajustes",
  "Manter parâmetros recomendados e reavaliar":
    "Mantener los parámetros recomendados y reevaluar",
  "Aplicar ajuste ventilatório sugerido": "Aplicar el ajuste ventilatorio sugerido",
  "Sem ajuste ventilatório pela gasometria atual":
    "Sin ajuste ventilatorio según la gasometría actual",
  "Sem recomendação de ajuste ventilatório com base na gasometria atual; manter estratégia e repetir gasometria conforme evolução.":
    "Sin recomendación de ajuste ventilatorio según la gasometría actual; mantener la estrategia y repetir la gasometría según la evolución.",
  "Discutir pronação": "Discutir el decúbito prono",
  "PaO₂/FiO₂ ≤ 150: discutir pronação prolongada se não houver contraindicação.":
    "PaO₂/FiO₂ ≤ 150: discutir el decúbito prono prolongado si no hay contraindicación.",
  "Reduzir distensão pulmonar": "Reducir la distensión pulmonar",
  "Pplat acima da meta: reduzir distensão pulmonar, revisar Vt, auto-PEEP, sincronia e necessidade de sedação.":
    "Pplat por encima de la meta: reducir la distensión pulmonar, revisar el volumen corriente, la auto-PEEP, la sincronía y la necesidad de sedación.",
  "Reavaliar perfusão após ajuste": "Reevaluar la perfusión tras el ajuste",
  "Após qualquer aumento de PEEP, reavaliar pressão arterial, perfusão e necessidade de suporte hemodinâmico.":
    "Tras cualquier aumento de la PEEP, reevaluar la presión arterial, la perfusión y la necesidad de soporte hemodinámico.",
  "Repetir gasometria em 30 min": "Repetir la gasometría en 30 min",
  "Repetir gasometria em 30 min após ajuste ventilatório ou antes se piora clínica.":
    "Repetir la gasometría a los 30 min del ajuste ventilatorio, o antes si hay empeoramiento clínico.",
  "Checar mecânica e alarmes": "Comprobar la mecánica y las alarmas",
  "Reavaliar SpO₂, pressão arterial, curvas do ventilador, alarmes e mecânica pulmonar após a mudança.":
    "Reevaluar la SpO₂, la presión arterial, las curvas del ventilador, las alarmas y la mecánica pulmonar tras el cambio.",

  // ── Modos: Pinsp / PS / CPAP ───────────────────────────────────────────────
  "Pinsp titulada para Vt alvo":
    "Presión inspiratoria titulada para el volumen corriente objetivo",
  "Pinsp baixa com Vt insuficiente":
    "Presión inspiratoria baja con volumen corriente insuficiente",
  "Pinsp ajustada com platô seguro": "Presión inspiratoria ajustada con meseta segura",
  "PS titulada para Vt protetor":
    "Presión de soporte titulada para un volumen corriente protector",
  "PS baixa com esforço alto": "Presión de soporte baja con esfuerzo alto",
  "PS confortável com FR estável": "Presión de soporte cómoda con FR estable",
  "Acompanhar sincronia e drive": "Vigilar la sincronía y el impulso respiratorio",
  "CPAP isolado com oxigenação adequada": "CPAP aislado con oxigenación adecuada",
  "Acompanhar FR e esforço respiratório": "Vigilar la FR y el esfuerzo respiratorio",
  "Observar Vt espontâneo e conforto":
    "Observar el volumen corriente espontáneo y el confort",

  // ── Fluxo ──────────────────────────────────────────────────────────────────
  "40 L/min (mais lento)": "40 L/min (más lento)",
  "60 L/min (padrão inicial comum)": "60 L/min (estándar inicial habitual)",
  "80 L/min (obstrutivo / expiração longa)": "80 L/min (obstructivo / espiración larga)",
  "100 L/min (obstrutivo grave / quando necessário)":
    "100 L/min (obstructivo grave / cuando sea necesario)",
  "Tempo expiratório prolongado": "Tiempo espiratorio prolongado",

  // ── Marcos ─────────────────────────────────────────────────────────────────
  "VM — orientação iniciada": "Ventilación mecánica — orientación iniciada",
  "Caso restaurado": "Caso restaurado",
  "Setup inicial aplicado": "Configuración inicial aplicada",
  "Gasometria registrada": "Gasometría registrada",
  "Evento": "Evento",

  // ── Identificação do caso ──────────────────────────────────────────────────
  "Identificação do caso / paciente": "Identificación del caso / paciente",
  "Ex.: Leito 3 — João, 67a": "Ej.: Cama 3 — Juan, 67 años",
  "Leito 1": "Cama 1",
  "Leito 2": "Cama 2",
  "Leito 3": "Cama 3",
  "Sala vermelha": "Sala roja",
  "Sexo (para peso predito)": "Sexo (para el peso predicho)",
  "Peso real (kg)": "Peso real (kg)",

  // ── Cenário clínico ────────────────────────────────────────────────────────
  "Cenário clínico principal": "Escenario clínico principal",
  "ARDS / SDRA confirmado ou muito provável": "SDRA confirmada o muy probable",
  "Pneumonia grave / hipoxemia difusa / sepse pulmonar sem SDRA confirmado":
    "Neumonía grave / hipoxemia difusa / sepsis pulmonar sin SDRA confirmada",
  "DPOC exacerbado / retenção de CO₂ / obstrutivo":
    "EPOC exacerbada / retención de CO₂ / obstructivo",
  "Asma grave / broncoespasmo / aprisionamento aéreo":
    "Asma grave / broncoespasmo / atrapamiento aéreo",
  "Edema agudo pulmonar cardiogênico": "Edema agudo de pulmón cardiogénico",
  "Pós-operatório / atelectasia / pulmão sem lesão aguda importante":
    "Posoperatorio / atelectasia / pulmón sin lesión aguda importante",
  "Neurocrítico / TCE / AVC / alvo de CO₂ mais controlado":
    "Neurocrítico / traumatismo craneoencefálico / ACV / objetivo de CO₂ más controlado",
  "Acidose metabólica grave (sepse, CAD, choque)":
    "Acidosis metabólica grave (sepsis, CAD, choque)",
  "Obesidade importante / baixa complacência de parede / atelectasia":
    "Obesidad importante / baja distensibilidad de la pared / atelectasia",
  "Fraqueza neuromuscular (miastenia, Guillain-Barré, fadiga muscular)":
    "Debilidad neuromuscular (miastenia, Guillain-Barré, fatiga muscular)",

  // ── Estado hemodinâmico ────────────────────────────────────────────────────
  "Estável, sem vasopressor e sem sinais de choque":
    "Estable, sin vasopresor y sin signos de choque",
  "Hipotensão leve / em reposição volêmica / ainda responsivo":
    "Hipotensión leve / en reposición de volumen / aún responde",
  "Choque / hipotensão importante / perfusão ruim":
    "Choque / hipotensión importante / mala perfusión",
  "Em vasopressor, mas ainda instável": "Con vasopresor, pero aún inestable",
  "Em vasopressor, agora com perfusão mais estável":
    "Con vasopresor, ahora con una perfusión más estable",
  "Baixo débito / falência cardiogênica / risco de piorar com PEEP":
    "Bajo gasto / fallo cardiogénico / riesgo de empeorar con la PEEP",

  // ── Modo no ventilador ─────────────────────────────────────────────────────
  "Modo no ventilador": "Modo del ventilador",
  "VC-AC / assisto-controlado a volume (mais usado no início)":
    "VC-AC / asistido-controlado por volumen (el más usado al inicio)",
  "PC-AC / assisto-controlado a pressão": "PC-AC / asistido-controlado por presión",
  "PRVC / VC+ / volume garantido com limite de pressão":
    "PRVC / VC+ / volumen garantizado con límite de presión",
  "PRVC / VC+": "PRVC / VC+",
  "PSV / pressão de suporte (desmame ou suporte parcial)":
    "PSV / presión de soporte (destete o soporte parcial)",
  "CPAP / espontâneo com pressão contínua": "CPAP / espontáneo con presión continua",
  "CPAP": "CPAP",
  "SIMV / parcialmente mandatória": "SIMV / parcialmente mandatoria",
  "SIMV": "SIMV",
  "Ainda em VMNI / antes da intubação": "Aún en VNI / antes de la intubación",
  "Não invasivo ainda": "Aún no invasivo",

  // ── FR ─────────────────────────────────────────────────────────────────────
  "10 (expiração longa / obstrutivo)": "10 (espiración larga / obstructivo)",
  "12 (baixa)": "12 (baja)",
  "16 (intermediária)": "16 (intermedia)",
  "20 (alta)": "20 (alta)",
  "24 (muito alta)": "24 (muy alta)",
  "28 (acidose metabólica / caso selecionado)": "28 (acidosis metabólica / caso seleccionado)",

  // ── PEEP ───────────────────────────────────────────────────────────────────
  "5 (básica)": "5 (básica)",
  "8 (moderada)": "8 (moderada)",
  "10 (oxigenação mais difícil)": "10 (oxigenación más difícil)",
  "12 (hipoxemia importante)": "12 (hipoxemia importante)",
  "15 (alta / caso selecionado)": "15 (alta / caso seleccionado)",

  // ── FiO₂ ───────────────────────────────────────────────────────────────────
  "FiO₂ programada": "FiO₂ programada",
  "0,21 (ar ambiente)": "0,21 (aire ambiente)",
  "0,40 (suporte leve)": "0,40 (soporte leve)",
  "0,50 (suporte moderado)": "0,50 (soporte moderado)",
  "0,60 (hipoxemia relevante)": "0,60 (hipoxemia relevante)",
  "0,80 (hipoxemia importante)": "0,80 (hipoxemia importante)",
  "1,00 (grave / início do ajuste)": "1,00 (grave / inicio del ajuste)",

  // ── pH / PaCO₂ / PaO₂ / HCO₃ / BE / Pplat ──────────────────────────────────
  "7,15 (acidemia grave)": "7,15 (acidemia grave)",
  "7,25 (acidemia moderada)": "7,25 (acidemia moderada)",
  "7,35 (limite inferior)": "7,35 (límite inferior)",
  "7,45 (limite superior)": "7,45 (límite superior)",
  "7,55 (alcalemia importante)": "7,55 (alcalemia importante)",
  "25 (muito baixo)": "25 (muy bajo)",
  "30 (baixo)": "30 (bajo)",
  "40 (alvo usual)": "40 (objetivo habitual)",
  "50 (hipercapnia leve/moderada)": "50 (hipercapnia leve/moderada)",
  "60 (hipercapnia importante)": "60 (hipercapnia importante)",
  "70 (hipercapnia grave)": "70 (hipercapnia grave)",
  "PaO₂ (mmHg)": "PaO₂ (mmHg)",
  "55 (hipoxemia importante)": "55 (hipoxemia importante)",
  "70 (hipoxemia moderada)": "70 (hipoxemia moderada)",
  "90 (faixa aceitável em muitos casos)": "90 (rango aceptable en muchos casos)",
  "120 (oxigenação alta)": "120 (oxigenación alta)",
  "HCO₃⁻ (mEq/L)": "HCO₃⁻ (mEq/L)",
  "12 (muito baixo)": "12 (muy bajo)",
  "18 (baixo)": "18 (bajo)",
  "22 (quase baixo)": "22 (casi bajo)",
  "24 (normal)": "24 (normal)",
  "28 (alto)": "28 (alto)",
  "32 (alto / compensação possível)": "32 (alto / posible compensación)",
  "BE / excesso de base": "Exceso de base",
  "-10 (acidose metabólica importante)": "-10 (acidosis metabólica importante)",
  "-5 (acidose metabólica leve/moderada)": "-5 (acidosis metabólica leve/moderada)",
  "0 (próximo do normal)": "0 (cercano al normal)",
  "+5 (alcalose metabólica / compensação)": "+5 (alcalosis metabólica / compensación)",
  "+10 (alcalose metabólica importante)": "+10 (alcalosis metabólica importante)",
  "Pressão de platô (Pplat, cmH₂O)": "Presión meseta (Pplat, cmH₂O)",
  "20 (confortável)": "20 (cómoda)",
  "25 (aceitável)": "25 (aceptable)",
  "30 (limite protetor usual)": "30 (límite protector habitual)",
  "35 (alta / atenção)": "35 (alta / atención)",

  // ── Plano ──────────────────────────────────────────────────────────────────
  "Plano orientado pelo sistema / conduta final":
    "Plan orientado por el sistema / conducta final",
  "Registrar a conduta final orientada pelo sistema ou ajustes decididos pela equipe":
    "Registrar la conducta final orientada por el sistema o los ajustes decididos por el equipo",
  "Aplicar setup inicial recomendado": "Aplicar la configuración inicial recomendada",
  "Registrar gasometria para ajuste ventilatório se necessário":
    "Registrar la gasometría para el ajuste ventilatorio si es necesario",
  "Caso": "Caso",
  "Cenário": "Escenario",
  "PBW": "PBW",
  "Vt (set)": "Volumen corriente (programado)",
};
