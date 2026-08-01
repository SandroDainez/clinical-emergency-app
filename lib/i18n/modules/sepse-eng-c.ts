/**
 * Sepse (engine) — dicionário PT → ES. Parte C.
 * Acessos e bundle inicial, escalada vasopressora, oxigenação/VM, exames por
 * foco, esquemas por sítio de infecção e aba de UTI.
 */
export const ES_SEPSE_ENG_C: Record<string, string> = {
  // ── Acessos, sondas e bundle inicial ───────────────────────────────────────
  "1 acesso venoso periférico calibroso (≥ 18G).":
    "1 acceso venoso periférico grueso (≥ 18G).",
  "2 acessos venosos periféricos calibrosos (≥ 18G) — imediato.":
    "2 accesos venosos periféricos gruesos (≥ 18G) — de inmediato.",
  "Cateter arterial radial se vasopressor em uso para PA invasiva contínua.":
    "Catéter arterial radial si hay un vasopresor en uso, para la PA invasiva continua.",
  "→ Confirmar CVC para vasopressor contínuo":
    "→ Confirmar el catéter venoso central para el vasopresor en infusión continua",
  "Instalar SVD para controle rigoroso de diurese.":
    "Colocar una sonda vesical para el control riguroso de la diuresis.",
  "Choque séptico — SVD obrigatório para controle de diurese horária (meta ≥ 0,5 mL/kg/h)":
    "Choque séptico — sonda vesical obligatoria para el control de la diuresis horaria (meta ≥ 0,5 mL/kg/h)",
  "Sepse de alto risco — SVD para controle preciso de diurese":
    "Sepsis de alto riesgo — sonda vesical para el control preciso de la diuresis",
  "Coleta obrigatória:": "Toma obligatoria:",
  "Coletar hemoculturas (2 pares) ANTES do ATB — sem atrasar por isso.":
    "Tomar hemocultivos (2 pares) ANTES del antibiótico — sin retrasarlo por ello.",
  "Iniciar cristalóide 500 mL em bolus enquanto aguarda.":
    "Iniciar cristaloide 500 mL en bolo mientras espera.",
  "Preencher peso para calcular o volume inicial.":
    "Complete el peso para calcular el volumen inicial.",
  "Informe o peso para calcular": "Indique el peso para calcular",
  "⚠️ Informe o peso para calcular o volume exato.":
    "⚠️ Indique el peso para calcular el volumen exacto.",
  "⚠️ Lactato ≥ 4 mmol/L — ressuscitação agressiva":
    "⚠️ Lactato ≥ 4 mmol/L — reanimación agresiva",
  "Lactato sérico (obrigatório no bundle SSC)":
    "Lactato sérico (obligatorio en el paquete de medidas de la SSC)",
  "Lactato, culturas, antimicrobianos, fluidos e vasopressor permanecem visíveis no painel.":
    "El lactato, las culturas, los antimicrobianos, los fluidos y el vasopresor permanecen visibles en el panel.",
  "Medidas práticas:": "Medidas prácticas:",
  "Revisar coleta microbiológica.": "Revisar la toma de muestras microbiológicas.",
  "Revisar antibiótico agora": "Revisar el antibiótico ahora",
  "Meta de 1 hora atingida sem antibiótico registrado como realizado.":
    "Se alcanzó la meta de 1 hora sin que el antibiótico esté registrado como administrado.",
  "Se piora clínica, reduzir para meta de 1 hora.":
    "Si hay empeoramiento clínico, reducir a la meta de 1 hora.",
  "⏱️ ATB imediato — Choque séptico (SSC 2021)":
    "⏱️ Antibiótico inmediato — Choque séptico (SSC 2021)",
  "Alergia a beta-lactâmico marcada: alternativa automática aplicada.":
    "Alergia a betalactámicos marcada: se aplicó la alternativa automática.",
  "ATB prévio recente": "Antibiótico previo reciente",

  // ── Escalada vasopressora ──────────────────────────────────────────────────
  "🟠 Choque Séptico — Escalada Vasopressora":
    "🟠 Choque séptico — escalamiento vasopresor",
  "🔴 Choque Séptico Refratário": "🔴 Choque séptico refractario",
  "Critérios de choque séptico presentes.":
    "Criterios de choque séptico presentes.",
  "Considere iniciar noradrenalina precocemente. O contexto atual sugere choque mais grave, com necessidade de restaurar PAM maior ou igual a 65 milímetros de mercúrio.":
    "Considere iniciar la noradrenalina de forma precoz. El contexto actual sugiere un choque más grave, con necesidad de restaurar una PAM mayor o igual a 65 milímetros de mercurio.",
  "Noradrenalina ≥ 0,25 mcg/kg/min sem PAM ≥ 65 — escalar suporte (SSC 2021):":
    "Noradrenalina ≥ 0,25 mcg/kg/min sin alcanzar una PAM ≥ 65 — escalar el soporte (SSC 2021):",
  "Noradrenalina > 0,5 mcg/kg/min — choque vasoplégico refratário:":
    "Noradrenalina > 0,5 mcg/kg/min — choque vasopléjico refractario:",
  "Se PAM inadequada com norad, adicionar vasopressina 0,03 U/min.":
    "Si la PAM es inadecuada con noradrenalina, añadir vasopresina 0,03 U/min.",
  "Se a PAM continuar inadequada com noradrenalina, adicionar vasopressina em vez de apenas aumentar catecolamina.":
    "Si la PAM sigue siendo inadecuada con noradrenalina, añadir vasopresina en lugar de solo aumentar la catecolamina.",
  "   - Considerar angiotensina II ou azul de metileno (choque vasoplegia refratária — uso excepcional com intensivista experiente)":
    "   - Considerar la angiotensina II o el azul de metileno (choque vasopléjico refractario — uso excepcional con un intensivista con experiencia)",
  "   - Risco crescente: isquemia digital/mesentérica, arritmias — monitorar continuamente":
    "   - Riesgo creciente: isquemia digital o mesentérica y arritmias — monitorizar de forma continua",
  "Inotrópico já foi considerado no contexto atual.":
    "El inotrópico ya se consideró en el contexto actual.",
  "Vasopressor iniciado — retornou do módulo Drogas Vasoativas":
    "Vasopresor iniciado — volvió del módulo de Fármacos vasoactivos",

  // ── Oxigenação e ventilação ────────────────────────────────────────────────
  "Meta: SpO₂ 94–98% (evitar hiperóxia).": "Meta: SpO₂ 94–98% (evitar la hiperoxia).",
  "SpO₂ estável. Manter vigilância.": "SpO₂ estable. Mantener la vigilancia.",
  "Progredir: cateter nasal 2–6 L/min → máscara Venturi → máscara c/ reservatório 10–15 L/min → VNI.":
    "Progresar: cánula nasal 2–6 L/min → mascarilla Venturi → mascarilla con reservorio 10–15 L/min → ventilación no invasiva.",
  "Pré-oxigenar com máscara com reservatório 10–15 L/min por ≥ 5 min.":
    "Preoxigenar con mascarilla con reservorio 10–15 L/min durante ≥ 5 min.",
  "Meta ventilatória: VC 6 mL/kg de peso ideal · PEEP 5–8 · FiO₂ para SpO₂ ≥ 94%.":
    "Meta ventilatoria: volumen corriente de 6 mL/kg de peso ideal · PEEP 5–8 · FiO₂ para una SpO₂ ≥ 94%.",
  "→ VM protetora: VC 6 mL/kg PI, Pplatô ≤ 30, driving pressure ≤ 15":
    "→ Ventilación mecánica protectora: volumen corriente de 6 mL/kg de peso ideal, presión meseta ≤ 30 y presión de distensión ≤ 15",
  "→ Otimizar PEEP mínimo eficaz": "→ Optimizar la PEEP mínima eficaz",
  "→ Bloqueio neuromuscular 48h (cisatracúrio)":
    "→ Bloqueo neuromuscular durante 48 h (cisatracurio)",
  "→ SpO₂ ≥ 92% com FiO₂ ≤ 40% e PEEP ≤ 8":
    "→ SpO₂ ≥ 92% con FiO₂ ≤ 40% y PEEP ≤ 8",
  "IOT realizada — retornou do módulo ISR":
    "Intubación realizada — volvió del módulo de intubación de secuencia rápida",
  " · IOT realizada (módulo ISR)":
    " · Intubación realizada (módulo de intubación de secuencia rápida)",
  "suporte ventilatório": "soporte ventilatorio",
  "pressão positiva": "presión positiva",

  // ── Exames e monitorização ─────────────────────────────────────────────────
  "ECG contínuo (ritmo e FC)": "ECG continuo (ritmo y frecuencia cardíaca)",
  "Eletrólitos (Na, K, Cl)": "Electrolitos (Na, K, Cl)",
  "Urina I + Gram urinário": "Sistemático de orina + Gram urinario",
  "Escarro para Gram e cultura": "Esputo para Gram y cultivo",
  "Culturas pareadas (via CVC e periférica simultâneas)":
    "Cultivos pareados (por el catéter venoso central y periférico, simultáneos)",
  "→ Cultura de ponta do CVC (5 cm distal em meio sólido)":
    "→ Cultivo de la punta del catéter venoso central (5 cm distales en medio sólido)",
  "→ Culturas intra-operatórias / material drenado":
    "→ Cultivos intraoperatorios o del material drenado",
  "RX ou TC local (descartar gás nos tecidos — fasceíte necrosante)":
    "Radiografía o TC local (descartar gas en los tejidos — fascitis necrosante)",
  "TC Abdome/Pelve com contraste (se USG inconclusivo)":
    "TC de abdomen y pelvis con contraste (si la ecografía no es concluyente)",
  "Ecocardiograma: indicado para S. aureus, Candida ou bacteremia persistente > 72h":
    "Ecocardiograma: indicado en S. aureus, Candida o bacteriemia persistente > 72 h",
  "→ Ecocardiograma (descartar endocardite fúngica)":
    "→ Ecocardiograma (descartar la endocarditis fúngica)",
  "Cérebro (GCS pendente)": "Cerebro (Glasgow pendiente)",
  "Fígado (bilirrubina pendente)": "Hígado (bilirrubina pendiente)",
  "Respiratório (SpO₂ pendente)": "Respiratorio (SpO₂ pendiente)",
  " disfunção": " disfunción",

  // ── Esquemas por foco ──────────────────────────────────────────────────────
  "ATB empírico (aguardar urocultura):":
    "Antibiótico empírico (a la espera del urocultivo):",
  "ATB empírico (cobre gram-negativos + anaeróbios):":
    "Antibiótico empírico (cubre gramnegativos + anaerobios):",
  "ATB empírico para PAV (confirmar com antibiograma):":
    "Antibiótico empírico para la neumonía asociada a la ventilación (confirmar con el antibiograma):",
  "→ Início simples: ceftriaxona 1–2g IV 1x/dia":
    "→ Inicio sencillo: ceftriaxona 1–2 g IV una vez al día",
  "→ Pip-tazo 4,5g IV 6/6h (comunitária ou hospitalar sem MDR)":
    "→ Piperacilina-tazobactam 4,5 g IV cada 6 h (comunitaria u hospitalaria sin multirresistencia)",
  "→ Gram-negativos: pip-tazo 4,5g IV 6/6h ou meropeném se MDR":
    "→ Gramnegativos: piperacilina-tazobactam 4,5 g IV cada 6 h o meropenem si hay multirresistencia",
  "   Meropeném 1g IV 8/8h + Vancomicina (se MRSA) + considerar amicacina":
    "   Meropenem 1 g IV cada 8 h + vancomicina (si hay SARM) + considerar amikacina",
  "→ PAV precoce (< 5 dias UTI, sem MDR):":
    "→ Neumonía asociada a la ventilación precoz (< 5 días en UCI, sin multirresistencia):",
  "→ Adicionar fluconazol ou equinocandina se pós-operatório tardio ou Candida suspeita":
    "→ Añadir fluconazol o una equinocandina si es un postoperatorio tardío o se sospecha Candida",
  "→ Candida (IVAS fúngica): micafungina 100mg/dia":
    "→ Candida (infección fúngica asociada a catéter): micafungina 100 mg/día",
  "→ Ajustar assim que antibiograma disponível":
    "→ Ajustarlo en cuanto esté disponible el antibiograma",
  "  → Rever febre por fármaco (β-lactâmicos, vancomicina, anfotericina)":
    "  → Revisar la fiebre por fármacos (betalactámicos, vancomicina, anfotericina)",
  "Diagnóstico: febre + hemocultura positiva sem outro foco + CVC em uso":
    "Diagnóstico: fiebre + hemocultivo positivo sin otro foco + catéter venoso central en uso",
  "Diagnóstico: febre + urocultura ≥ 10³ UFC/mL com SVD em uso":
    "Diagnóstico: fiebre + urocultivo ≥ 10³ UFC/mL con sonda vesical en uso",
  "Remover cateter suspeito imediatamente se possível.":
    "Retirar el catéter sospechoso de inmediato si es posible.",
  "→ Retirar CVC se possível (fonte mais comum de candidemia)":
    "→ Retirar el catéter venoso central si es posible (la fuente más frecuente de candidemia)",
  "→ Novo acesso em sítio diferente se necessário":
    "→ Nuevo acceso en un sitio diferente si es necesario",
  "→ Drenagem percutânea (radiologia intervencionista) ou cirurgia se indicado":
    "→ Drenaje percutáneo (radiología intervencionista) o cirugía si está indicado",
  "Foco urinário sugerido — sintomas urinários ou diurese alterada":
    "Foco urinario sugerido — síntomas urinarios o diuresis alterada",

  // ── Isolamento ─────────────────────────────────────────────────────────────
  "🌬️ Isolamento Aéreo Indicado": "🌬️ Aislamiento aéreo indicado",
  "💧 Isolamento de Gotículas Indicado": "💧 Aislamiento por gotas indicado",
  "⚠️ Isolamento protetor reverso clássico (avental+luvas+máscara para todos) DESCONTINUADO":
    "⚠️ Aislamiento protector inverso clásico (bata + guantes + mascarilla para todos) DESCONTINUADO",
  "   quimioterapia convencional, transplante sólido ou HIV fora de neutropenia grave":
    "   quimioterapia convencional, trasplante de órgano sólido o VIH fuera de una neutropenia grave",
  "→ Avental + luvas para TODO contato com paciente ou ambiente":
    "→ Bata + guantes para TODO contacto con el paciente o el entorno",
  "→ Equipamentos dedicados ao quarto (estetoscópio, esfigmomanômetro)":
    "→ Equipos dedicados a la habitación (fonendoscopio, esfigmomanómetro)",
  "→ Higiene das mãos rigorosa para toda equipe":
    "→ Higiene de manos rigurosa para todo el equipo",
  "→ Máscara cirúrgica para equipe a < 1 metro do paciente":
    "→ Mascarilla quirúrgica para el equipo a menos de 1 metro del paciente",
  "→ Respirador N95/PFF2 para TODA a equipe que entrar no quarto":
    "→ Respirador N95/FFP2 para TODO el equipo que entre en la habitación",
  "→ Notificar CCIH/SCIH — registrar em prontuário":
    "→ Notificar al comité de control de infecciones — registrarlo en la historia clínica",
  "→ Rastreio periódico com swab para MDR":
    "→ Cribado periódico con hisopado para multirresistentes",
  "→ Transferir para quarto de isolamento o mais brevemente possível":
    "→ Trasladarlo a una habitación de aislamiento lo antes posible",
  "→ Visitantes: orientar uso de máscara e higiene das mãos":
    "→ Visitantes: indicar el uso de mascarilla y la higiene de manos",

  // ── Terapia de reemplazo renal ─────────────────────────────────────────────
  "Hemodiálise intermitente (HD)": "Hemodiálisis intermitente",
  "Diálise contínua renal (CRRT)": "Terapia de reemplazo renal continua",
  "Diálise peritoneal ambulatorial (CAPD)":
    "Diálisis peritoneal ambulatoria continua",

  // ── Aba de UTI e contexto clínico ──────────────────────────────────────────
  "UTI — Notas Clínicas": "UCI — Notas clínicas",
  "UTI — Suporte Hemodinâmico": "UCI — Soporte hemodinámico",
  "Este módulo UTI é para pacientes JÁ EM TRATAMENTO com piora clínica.":
    "Este módulo de UCI es para pacientes YA EN TRATAMIENTO con empeoramiento clínico.",
  "Reavaliar o que já foi feito, o que falta do bundle e a resposta hemodinâmica atual.":
    "Reevaluar lo que ya se hizo, lo que falta del paquete de medidas y la respuesta hemodinámica actual.",
  "HDA — cenário clínico": "Anamnesis — escenario clínico",
  "Contexto clínico atual": "Contexto clínico actual",
  "Exame físico": "Exploración física",
  "Resumo clínico do atendimento": "Resumen clínico de la atención",
  "Resposta necessária": "Respuesta necesaria",
  "Descreva o contexto da piora ou novo evento clínico.":
    "Describa el contexto del empeoramiento o del nuevo evento clínico.",
  "O que levou o paciente ao atendimento. Selecione quantas queixas forem necessárias.":
    "Qué llevó al paciente a consultar. Seleccione tantos motivos como sea necesario.",
  "Início / piora dos sintomas": "Inicio / empeoramiento de los síntomas",
  "Início dos sintomas pendente": "Inicio de los síntomas pendiente",
  "Dados básicos pendentes": "Datos básicos pendientes",
  "Preenchido automaticamente ao abrir o módulo.":
    "Se completa automáticamente al abrir el módulo.",
  "Sem dados clínicos críticos destacados":
    "Sin datos clínicos críticos destacados",
  "Últimos eventos:": "Últimos eventos:",
  "Ex.: há 6 horas, ontem à noite": "Ej.: hace 6 horas, anoche",
  "Ex.: piora hemodinâmica, febre nova, aumento de vasopressor":
    "Ej.: empeoramiento hemodinámico, fiebre nueva, aumento del vasopresor",
  "Ex.: piora nas últimas 6h, desde ontem":
    "Ej.: empeoramiento en las últimas 6 h, desde ayer",
  "ambulatório com contato": "ambulatorio con contacto",
  "choque séptico": "choque séptico",
  "sepse com suspeita de choque séptico":
    "sepsis con sospecha de choque séptico",
  "dados clínicos iniciais sem critério forte de gravidade maior":
    "datos clínicos iniciales sin un criterio firme de mayor gravedad",
  "já em tratamento": "ya en tratamiento",
  "risco intermediário": "riesgo intermedio",
  "sem resposta": "sin respuesta",
};
