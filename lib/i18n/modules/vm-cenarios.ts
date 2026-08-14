/**
 * Cenários novos de ventilação (V2 acidose, V3 neuromuscular) e o veto da
 * hipercapnia permissiva em nó transversal (R-40).
 */
export const ES_VM_CENARIOS: Record<string, string> = {
  "Acidose metabólica grave (CAD, sepse, IRA)":
    "Acidosis metabólica grave (CAD, sepsis, IRA)",
  "Fraqueza neuromuscular (miastenia, Guillain-Barré)":
    "Debilidad neuromuscular (miastenia, Guillain-Barré)",
  "Acidose metabólica grave — a FR é o tratamento":
    "Acidosis metabólica grave — la FR es el tratamiento",
  "O paciente estava compensando. Intubar sem repor a ventilação-minuto é a causa clássica de parada peri-intubação.":
    "El paciente estaba compensando. Intubar sin reponer la ventilación-minuto es la causa clásica de paro peri-intubación.",
  "⚠️ O RISCO AQUI NÃO É HIPÓXIA — é a perda abrupta da compensação respiratória. Quem tem acidose metabólica grave chega com ventilação-minuto altíssima (Kussmaul). Se o ventilador for ajustado com FR 'normal', a PaCO₂ sobe, o pH despenca e vem hipotensão, arritmia e parada. É evitável, e a prevenção é ajustar a FR ANTES de precisar.":
    "⚠️ EL RIESGO AQUÍ NO ES LA HIPOXIA — es la pérdida abrupta de la compensación respiratoria. Quien tiene acidosis metabólica grave llega con ventilación-minuto altísima (Kussmaul). Si el ventilador se ajusta con FR «normal», la PaCO₂ sube, el pH se desploma y sobrevienen hipotensión, arritmia y paro. Es evitable, y la prevención es ajustar la FR ANTES de necesitarlo.",
  "META DE PaCO₂ — NÃO É 35–45: usar a fórmula de Winter, PaCO₂ alvo = 1,5 × HCO₃ + 8 (±2). É o CO₂ que este paciente estava mantendo; normalizar a PaCO₂ é acidificá-lo.":
    "META DE PaCO₂ — NO ES 35–45: usar la fórmula de Winter, PaCO₂ objetivo = 1,5 × HCO₃ + 8 (±2). Es el CO₂ que este paciente estaba manteniendo; normalizar la PaCO₂ es acidificarlo.",
  "VENTILAÇÃO-MINUTO: ~60 mL/kg/min mantém eucapnia num paciente normal. APÓS A INTUBAÇÃO são necessários ~120 mL/kg/min — o espaço morto do circuito DOBRA a demanda. Num adulto de 70 kg isso é da ordem de 8 L/min, não os 5–6 habituais.":
    "VENTILACIÓN-MINUTO: ~60 mL/kg/min mantiene eucapnia en un paciente normal. TRAS LA INTUBACIÓN se necesitan ~120 mL/kg/min — el espacio muerto del circuito DUPLICA la demanda. En un adulto de 70 kg esto es del orden de 8 L/min, no los 5–6 habituales.",
  "COMO ENTREGAR ISSO SEM FURAR O PROTETOR: a ventilação-minuto sobe pela FREQUÊNCIA, não pelo volume corrente. O Vt continua 6–8 mL/kg PBW ({vc6}–{vc8} mL), com Pplat ≤ 30 e driving pressure ≤ 15 — a regra vale aqui também.":
    "CÓMO LOGRARLO SIN ROMPER LA PROTECCIÓN: la ventilación-minuto sube por la FRECUENCIA, no por el volumen corriente. El Vt sigue en 6–8 mL/kg PBW ({vc6}–{vc8} mL), con Pplat ≤ 30 y driving pressure ≤ 15 — la regla vale aquí también.",
  "O LIMITE DA FR É OBSERVÁVEL, NÃO UM NÚMERO: subir a FR até casar a ventilação-minuto prévia, e o limite é o AUTO-PEEP aparecendo — medido por pausa expiratória, a mesma manobra do ramo obstrutivo. FR alta encurta a expiração; quando o ar não sai por completo, parou de compensar e começou a aprisionar.":
    "EL LÍMITE DE LA FR ES OBSERVABLE, NO UN NÚMERO: subir la FR hasta igualar la ventilación-minuto previa, y el límite es la aparición de AUTO-PEEP — medida por pausa espiratoria, la misma maniobra de la rama obstructiva. Una FR alta acorta la espiración; cuando el aire no sale por completo, dejó de compensar y empezó a atrapar.",
  "SE A VENTILAÇÃO-MINUTO NECESSÁRIA NÃO COUBER SEM AUTO-PEEP, isso é ACHADO e não impasse: significa que a demanda metabólica excede o que a ventilação segura entrega, e é o momento de considerar o que REDUZ a demanda — bicarbonato na acidemia grave, diálise na IRA/intoxicação — em vez de insistir na FR.":
    "SI LA VENTILACIÓN-MINUTO NECESARIA NO CABE SIN AUTO-PEEP, eso es un HALLAZGO y no un impasse: significa que la demanda metabólica excede lo que la ventilación segura entrega, y es el momento de considerar lo que REDUCE la demanda — bicarbonato en la acidemia grave, diálisis en la IRA/intoxicación — en vez de insistir con la FR.",
  "TITULAR PELA GASOMETRIA em 20–30 min: VM alvo = (PaCO₂ medido × VM ajustada) ÷ PaCO₂ desejado (o de Winter). pH alvo > 7,25.":
    "TITULAR POR LA GASOMETRÍA en 20–30 min: VM objetivo = (PaCO₂ medida × VM ajustada) ÷ PaCO₂ deseada (la de Winter). pH objetivo > 7,25.",
  "PERI-INTUBAÇÃO: evitar apneia. Cada segundo sem ventilar acumula CO₂ num paciente sem margem — pré-oxigenar mantendo ventilação espontânea e assumir o ventilador imediatamente após o tubo.":
    "PERI-INTUBACIÓN: evitar la apnea. Cada segundo sin ventilar acumula CO₂ en un paciente sin margen — preoxigenar manteniendo la ventilación espontánea y asumir el ventilador inmediatamente tras el tubo.",
  "Fraqueza neuromuscular — falência de bomba, pulmão normal":
    "Debilidad neuromuscular — falla de bomba, pulmón normal",
  "A mecânica pulmonar é normal se não houver aspiração ou infecção. O problema é o músculo, e a vigilância é o que muda o desfecho.":
    "La mecánica pulmonar es normal si no hay aspiración ni infección. El problema es el músculo, y la vigilancia es lo que cambia el desenlace.",
  "A MECÂNICA PULMONAR É NORMAL — o que falhou foi a BOMBA (músculo respiratório), não o parênquima. Isso inverte o risco: o perigo aqui não é volutrauma, é ATELECTASIA.":
    "LA MECÁNICA PULMONAR ES NORMAL — lo que falló fue la BOMBA (músculo respiratorio), no el parénquima. Eso invierte el riesgo: el peligro aquí no es el volutrauma, es la ATELECTASIA.",
  "MESMO ASSIM, Vt PROTETOR 6–8 mL/kg PBW ({vc6}–{vc8} mL), com Pplat ≤ 30 e driving pressure ≤ 15. A atelectasia se resolve por PEEP e recrutamento, NÃO por volume corrente maior — a regra protetora vale para todos, e abrir exceção aqui é abrir exceção para o resto.":
    "AUN ASÍ, Vt PROTECTOR 6–8 mL/kg PBW ({vc6}–{vc8} mL), con Pplat ≤ 30 y driving pressure ≤ 15. La atelectasia se resuelve con PEEP y reclutamiento, NO con un volumen corriente mayor — la regla protectora vale para todos, y abrir una excepción aquí es abrirla para el resto.",
  "PEEP suficiente para manter recrutamento (não o mínimo de 5), com suspiros/manobras conforme a tolerância hemodinâmica. FiO₂ costuma ser baixa: se estiver subindo, procure a causa em vez de aceitar.":
    "PEEP suficiente para mantener el reclutamiento (no el mínimo de 5), con suspiros/maniobras según la tolerancia hemodinámica. La FiO₂ suele ser baja: si está subiendo, busque la causa en vez de aceptarlo.",
  "⚠️ O DESCOLAMENTO É O SINAL QUE IMPORTA: se a oxigenação piorar MAIS do que a fraqueza explica, há causa pulmonar sobreposta — aspiração, pneumonia, atelectasia lobar. Fraqueza não causa hipoxemia grave por si; hipoxemia grave aqui é outra doença.":
    "⚠️ EL DESACOPLE ES LA SEÑAL QUE IMPORTA: si la oxigenación empeora MÁS de lo que la debilidad explica, hay una causa pulmonar sobreañadida — aspiración, neumonía, atelectasia lobar. La debilidad no causa hipoxemia grave por sí sola; una hipoxemia grave aquí es otra enfermedad.",
  "PNEUMONIA ASSOCIADA À VM É A COMPLICAÇÃO MAIS FREQUENTE (56% em Guillain-Barré ventilado), e associa-se a VM prolongada. Atelectasia ocorre em 49%, lesão pulmonar aguda em 13%.":
    "LA NEUMONÍA ASOCIADA A LA VM ES LA COMPLICACIÓN MÁS FRECUENTE (56% en Guillain-Barré ventilado), y se asocia a VM prolongada. La atelectasia ocurre en el 49%, la lesión pulmonar aguda en el 13%.",
  "E A RAZÃO É MECÂNICA: ESSES PACIENTES NÃO TOSSEM. Higiene brônquica, aspiração, mobilização precoce e posicionamento importam TANTO quanto o parâmetro do ventilador — não são cuidados de enfermagem acessórios, são o tratamento da complicação que mais os atinge.":
    "Y LA RAZÓN ES MECÁNICA: ESTOS PACIENTES NO TOSEN. La higiene bronquial, la aspiración, la movilización precoz y el posicionamiento importan TANTO como el parámetro del ventilador — no son cuidados de enfermería accesorios, son el tratamiento de la complicación que más los afecta.",
  "Desmame costuma ser LENTO e guiado pela força (pressão inspiratória máxima, capacidade vital), não só pela troca gasosa — a gasometria normaliza antes de o músculo aguentar.":
    "El destete suele ser LENTO y guiado por la fuerza (presión inspiratoria máxima, capacidad vital), no solo por el intercambio gaseoso — la gasometría se normaliza antes de que el músculo aguante.",
  "Fora desses casos: reduzir o VC 1 mL/kg em direção a 4 mL/kg PBW ({vc4} mL), aceitando hipercapnia permissiva (pH ≥ 7,20).":
    "Fuera de esos casos: reducir el VC 1 mL/kg hacia 4 mL/kg PBW ({vc4} mL), aceptando hipercapnia permisiva (pH ≥ 7,20).",
  "FiO₂ mínima para SpO₂ 88–95% / PaO₂ 55–80. FR 12–35 (pH ≥ 7,20 — hipercapnia permissiva, PaCO₂ até 55–60).":
    "FiO₂ mínima para SpO₂ 88–95% / PaO₂ 55–80. FR 12–35 (pH ≥ 7,20 — hipercapnia permisiva, PaCO₂ hasta 55–60).",
  "NÃO se aplica a: (1) ACIDOSE METABÓLICA GRAVE — o paciente já gastou o tampão e chega perto do piso; somar acidose respiratória à metabólica é o mecanismo exato da parada peri-intubação, e ele estava HIPERventilando justamente para compensar; (2) HIPERTENSÃO INTRACRANIANA — a hipercapnia vasodilata e eleva a PIC; (3) DISFUNÇÃO DE VENTRÍCULO DIREITO — a hipercapnia aumenta a resistência vascular pulmonar, e no VD já sobrecarregado isso fecha o ciclo. Nos três o mecanismo é o mesmo: a margem já foi gasta antes de a hipercapnia começar.":
    "NO se aplica a: (1) ACIDOSIS METABÓLICA GRAVE — el paciente ya gastó el tampón y llega cerca del piso; sumar acidosis respiratoria a la metabólica es el mecanismo exacto del paro peri-intubación, y él estaba HIPERventilando justamente para compensar; (2) HIPERTENSIÓN INTRACRANEAL — la hipercapnia vasodilata y eleva la PIC; (3) DISFUNCIÓN DE VENTRÍCULO DERECHO — la hipercapnia aumenta la resistencia vascular pulmonar, y en el VD ya sobrecargado eso cierra el ciclo. En los tres el mecanismo es el mismo: el margen ya se gastó antes de que la hipercapnia empezara.",
  "⚠️ EXCEÇÕES à hipercapnia permissiva, mesmo na SDRA — nestes casos o piso de pH 7,20 NÃO vale e a ventilação-minuto tem de ser mantida:":
    "⚠️ EXCEPCIONES a la hipercapnia permisiva, incluso en la SDRA — en estos casos el piso de pH 7,20 NO vale y la ventilación-minuto debe mantenerse:",
  "⛔ ANTES DE ACEITAR HIPERCAPNIA, CONFIRA O CENÁRIO — este passo é alcançado a partir de QUALQUER estratégia, e a tolerância de pH ≥ 7,20 é convenção da SDRA, não regra geral.":
    "⛔ ANTES DE ACEPTAR HIPERCAPNIA, VERIFIQUE EL ESCENARIO — este paso se alcanza desde CUALQUIER estrategia, y la tolerancia de pH ≥ 7,20 es convención de la SDRA, no regla general.",
};
