/**
 * Ramo MISTO CAD+EHH e a correção dos critérios de EHH (consenso ADA/EASD
 * 2024, Diabetes Care 47(8):1257-1275).
 */
export const ES_MISTO_CAD_EHH: Record<string, string> = {
  "MISTO — critérios dos dois (hiperosmolar COM cetose/acidose)":
    "MIXTO — criterios de ambos (hiperosmolar CON cetosis/acidosis)",
  "MISTO CAD + EHH — insulina da CAD, travas osmolares do EHH":
    "MIXTO CAD + EHH — insulina de la CAD, límites osmolares del EHH",
  "Hiperosmolaridade COM cetose/acidose significativa. Mortalidade hospitalar 8% — a mais alta das três.":
    "Hiperosmolaridad CON cetosis/acidosis significativa. Mortalidad hospitalaria del 8% — la más alta de las tres.",
  "DEFINIÇÃO (consenso 2024, p. 1265): hiperosmolaridade de EHH + cetonemia significativa — βOHB ≥ 3,0 mmol/L, cetonúria ≥ 2+, pH < 7,30 OU HCO₃⁻ < 18 mmol/L. Basta UM desses quatro sobre um quadro hiperosmolar.":
    "DEFINICIÓN (consenso 2024, p. 1265): hiperosmolaridad de EHH + cetonemia significativa — βOHB ≥ 3,0 mmol/L, cetonuria ≥ 2+, pH < 7,30 O HCO₃⁻ < 18 mmol/L. Basta UNO de esos cuatro sobre un cuadro hiperosmolar.",
  "⚠️ NÃO SIMPLIFIQUE PARA UM DOS DOIS RAMOS. O misto tem mortalidade hospitalar de 8%, contra 5% do EHH e 3% da CAD — e ocorre em MAIS DE UM TERÇO das crises hiperglicêmicas. É a apresentação mais letal e não é rara.":
    "⚠️ NO SIMPLIFIQUE A UNA DE LAS DOS RAMAS. El mixto tiene una mortalidad hospitalaria del 8%, frente al 5% del EHH y el 3% de la CAD — y ocurre en MÁS DE UN TERCIO de las crisis hiperglucémicas. Es la presentación más letal y no es rara.",
  "INSULINA — a taxa da CAD: infusão contínua de {insInf} U/h (0,1 U/kg/h), SEM bolus. O consenso é explícito: cetonemia significativa sobre quadro hiperosmolar «represents mixed DKA/HHS», e nesse caso a infusão começa em 0,1 U/kg/h — não nos 0,05 do EHH isolado. A cetose é o que governa a insulina.":
    "INSULINA — la tasa de la CAD: infusión continua de {insInf} U/h (0,1 U/kg/h), SIN bolo. El consenso es explícito: cetonemia significativa sobre un cuadro hiperosmolar «represents mixed DKA/HHS», y en ese caso la infusión comienza en 0,1 U/kg/h — no en los 0,05 del EHH aislado. La cetosis es lo que gobierna la insulina.",
  "⚠️ TRAVAS OSMOLARES DO EHH — VALEM INTEGRALMENTE, mesmo com a insulina da CAD: queda do Na⁺ ≤ 10 mmol/L em 24 h e queda da osmolalidade entre 3,0 e 8,0 mOsm/kg/h. A hiperosmolaridade não governa a dose, governa a VELOCIDADE: corrigir rápido desloca água para o intracelular e causa edema cerebral.":
    "⚠️ LÍMITES OSMOLARES DEL EHH — RIGEN ÍNTEGRAMENTE, incluso con la insulina de la CAD: descenso del Na⁺ ≤ 10 mmol/L en 24 h y descenso de la osmolalidad entre 3,0 y 8,0 mOsm/kg/h. La hiperosmolaridad no gobierna la dosis, gobierna la VELOCIDAD: corregir rápido desplaza agua al espacio intracelular y causa edema cerebral.",
  "FLUIDO — alvo da CAD, velocidade do EHH: cristaloide balanceado 500–1.000 mL/h nas primeiras 2–4 h, MAS conferindo a cada etapa se a queda osmolar respeita o teto acima. Se estiver caindo rápido demais, o freio vem do fluido, não da insulina.":
    "FLUIDO — objetivo de la CAD, velocidad del EHH: cristaloide balanceado 500–1.000 mL/h en las primeras 2–4 h, PERO comprobando en cada etapa si el descenso osmolar respeta el techo anterior. Si está cayendo demasiado rápido, el freno viene del fluido, no de la insulina.",
  "META GLICÊMICA — a da CAD (≈ 200 mg/dL), e o mecanismo importa: acrescentar glicose ao soro não é para tratar hipoglicemia, é para MANTER A INSULINA CORRENDO enquanto a cetose não fecha. No misto quem governa a insulina é a cetose, então o ponto de acrescentar glicose é o da CAD — parar a insulina nos 250–300 do EHH deixaria a cetoacidose sem tratamento.":
    "OBJETIVO GLUCÉMICO — el de la CAD (≈ 200 mg/dL), y el mecanismo importa: agregar glucosa al suero no es para tratar la hipoglucemia, es para MANTENER LA INSULINA EN CURSO mientras la cetosis no se resuelve. En el mixto quien gobierna la insulina es la cetosis, así que el punto de agregar glucosa es el de la CAD — detener la insulina en los 250–300 del EHH dejaría la cetoacidosis sin tratamiento.",
  "⚠️ PROCEDÊNCIA: o consenso especifica a TAXA DE INSULINA para o misto e NÃO especifica fluido nem meta glicêmica — o que segue nesses dois eixos é DERIVAÇÃO DECLARADA a partir do mecanismo, não citação. A derivação está escrita acima para poder ser contestada.":
    "⚠️ PROCEDENCIA: el consenso especifica la TASA DE INSULINA para el mixto y NO especifica fluido ni objetivo glucémico — lo que sigue en esos dos ejes es DERIVACIÓN DECLARADA a partir del mecanismo, no cita. La derivación está escrita arriba para poder ser cuestionada.",
  "POTÁSSIO, BICARBONATO E DEMAIS EIXOS: seguem o protocolo da CAD.":
    "POTASIO, BICARBONATO Y DEMÁS EJES: siguen el protocolo de la CAD.",
  "TROMBOPROFILAXIA: o componente hiperosmolar é protrombótico — considerar HBPM salvo contraindicação.":
    "TROMBOPROFILAXIS: el componente hiperosmolar es protrombótico — considerar HBPM salvo contraindicación.",
  "EHH (Figura 2B do consenso 2024): glicemia ≥ 600 mg/dL + hiperosmolaridade — osmolalidade EFETIVA > 300 mOsm/kg (2×Na⁺ + glicose) OU osmolalidade TOTAL > 320 (2×Na⁺ + glicose + ureia) — + ausência de cetonemia significativa (βOHB < 3,0 mmol/L ou cetonúria < 2+) + ausência de acidose (pH ≥ 7,30 E HCO₃⁻ ≥ 15). Estupor/coma em ≥ 50%. Déficit hídrico MUITO maior.":
    "EHH (Figura 2B del consenso 2024): glucemia ≥ 600 mg/dL + hiperosmolaridad — osmolalidad EFECTIVA > 300 mOsm/kg (2×Na⁺ + glucosa) O osmolalidad TOTAL > 320 (2×Na⁺ + glucosa + urea) — + ausencia de cetonemia significativa (βOHB < 3,0 mmol/L o cetonuria < 2+) + ausencia de acidosis (pH ≥ 7,30 Y HCO₃⁻ ≥ 15). Estupor/coma en ≥ 50%. Déficit hídrico MUCHO mayor.",
};
