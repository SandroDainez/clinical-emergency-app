/**
 * Sepse / Choque Séptico — dicionário PT → ES (espanhol latino-americano).
 * Terminologia clínica: hemocultivo, UCI, desescalar, catéter, reanimación.
 * Tokens de cálculo ({pas}, {vancoLoad}, {fluidVol}…) preservados na tradução.
 */
export const ES_SEPSE: Record<string, string> = {
  // ── Títulos de nós ─────────────────────────────────────────────────────────
  "Suspeita de sepse — reconhecimento (Sepsis-3)": "Sospecha de sepsis — reconocimiento (Sepsis-3)",
  "Dados iniciais": "Datos iniciales",
  "Lactato + culturas ANTES do antibiótico": "Lactato + cultivos ANTES del antibiótico",
  "Antibiótico empírico — qual o foco provável?": "Antibiótico empírico — ¿cuál es el foco probable?",
  "ATB — Pneumonia comunitária grave": "ATB — Neumonía comunitaria grave",
  "ATB — Pneumonia hospitalar / PAV": "ATB — Neumonía hospitalaria / NAV",
  "ATB — Urossepse / pielonefrite grave": "ATB — Urosepsis / pielonefritis grave",
  "ATB — Infecção abdominal / peritonite": "ATB — Infección abdominal / peritonitis",
  "ATB — Pele e partes moles grave": "ATB — Piel y partes blandas grave",
  "ATB — Meningite bacteriana": "ATB — Meningitis bacteriana",
  "ATB — Bacteremia por cateter (CRBSI)": "ATB — Bacteriemia por catéter (CRBSI)",
  "ATB — Neutropenia febril": "ATB — Neutropenia febril",
  "ATB — Foco indeterminado (sepse sem foco)": "ATB — Foco indeterminado (sepsis sin foco)",
  "Indicação de ressuscitação volêmica": "Indicación de reanimación con líquidos",
  "Cristaloide 30 mL/kg — dose calculada": "Cristaloide 30 mL/kg — dosis calculada",
  "Reavaliação após volume": "Reevaluación tras el volumen",
  "Vasopressor — alvo PAM ≥ 65 mmHg": "Vasopresor — objetivo PAM ≥ 65 mmHg",
  "Corticoide no choque refratário": "Corticoide en el choque refractario",
  "Hidrocortisona — choque séptico refratário": "Hidrocortisona — choque séptico refractario",
  "Controle do foco infeccioso": "Control del foco infeccioso",
  "Controle do foco — agir precocemente": "Control del foco — actuar precozmente",
  "Reavaliação e monitorização": "Reevaluación y monitorización",
  "UTI — suporte orgânico e reavaliação": "UCI — soporte orgánico y reevaluación",
  "Sepse / Choque Séptico": "Sepsis / Choque Séptico",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Selecione o foco infeccioso mais provável (define o esquema empírico).":
    "Seleccione el foco infeccioso más probable (define el esquema empírico).",
  "Há hipotensão (PAS < 90 / PAM < 65) OU lactato ≥ 4 mmol/L?":
    "¿Hay hipotensión (PAS < 90 / PAM < 65) O lactato ≥ 4 mmol/L?",
  "Após a ressuscitação, a PAM permanece < 65 mmHg?":
    "Tras la reanimación, ¿la PAM permanece < 65 mmHg?",
  "Há foco que exija controle (drenagem/cirurgia/retirada de dispositivo)?":
    "¿Hay foco que exija control (drenaje/cirugía/retiro de dispositivo)?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Infecção + disfunção orgânica. Cada hora de atraso no ATB ↑ mortalidade ~7%.":
    "Infección + disfunción orgánica. Cada hora de retraso del ATB ↑ mortalidad ~7%.",
  "Não atrasar o ATB além de ~45 min para coletar hemocultura.":
    "No retrasar el ATB más de ~45 min para tomar el hemocultivo.",
  "Cobrir S. pneumoniae, Legionella, H. influenzae, atípicos.":
    "Cubrir S. pneumoniae, Legionella, H. influenzae, atípicos.",
  "Cobrir P. aeruginosa, MRSA, Gram-negativos MDR.":
    "Cubrir P. aeruginosa, SARM, Gram-negativos MDR.",
  "Cobrir E. coli (considerar ESBL), Klebsiella, Enterococcus.":
    "Cubrir E. coli (considerar BLEE), Klebsiella, Enterococcus.",
  "Cobrir Gram-negativos entéricos, anaeróbios, Enterococcus.":
    "Cubrir Gram-negativos entéricos, anaerobios, Enterococcus.",
  "Cobrir S. aureus (MRSA), Streptococcus, anaeróbios (fasciite).":
    "Cubrir S. aureus (SARM), Streptococcus, anaerobios (fascitis).",
  "Cobrir S. pneumoniae, N. meningitidis, Listeria (> 50 anos / imunossuprimido).":
    "Cubrir S. pneumoniae, N. meningitidis, Listeria (> 50 años / inmunosuprimido).",
  "Cobrir S. aureus, SCN, Candida, Gram-negativos.":
    "Cubrir S. aureus, SCN, Candida, Gram-negativos.",
  "Cobrir P. aeruginosa e Gram-negativos; antipseudomonas obrigatório.":
    "Cubrir P. aeruginosa y Gram-negativos; antipseudomónico obligatorio.",
  "Cobertura ampla: Gram-negativos + Gram-positivos (MRSA).":
    "Cobertura amplia: Gram-negativos + Gram-positivos (SARM).",
  "PAS informada: {pas} mmHg · lactato: {lactato} mmol/L.":
    "PAS informada: {pas} mmHg · lactato: {lactato} mmol/L.",
  "Bolus inicial nas primeiras 3 h, reavaliando a resposta a cada 500 mL.":
    "Bolo inicial en las primeras 3 h, reevaluando la respuesta cada 500 mL.",
  "Noradrenalina é a 1ª linha (SOAP II). Preferir acesso central, mas não atrasar.":
    "La noradrenalina es la 1.ª línea (SOAP II). Preferir acceso central, pero no retrasar.",
  "Reduz o tempo de reversão do choque. Manter até desmame do vasopressor.":
    "Reduce el tiempo de reversión del choque. Mantener hasta el retiro del vasopresor.",
  "Antibiótico não substitui a remoção da fonte. Realizar após estabilização mínima.":
    "El antibiótico no sustituye la eliminación de la fuente. Realizar tras estabilización mínima.",
  "Sem hipoperfusão evidente — manter vigilância ativa.":
    "Sin hipoperfusión evidente — mantener vigilancia activa.",
  "Choque séptico e sepse com disfunção orgânica → cuidado intensivo.":
    "Choque séptico y sepsis con disfunción orgánica → cuidado intensivo.",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "PA sistólica": "PA sistólica",
  "Lactato": "Lactato",
  "Peso estimado": "Peso estimado",
  "Pneumonia comunitária (PAC) grave": "Neumonía comunitaria (NAC) grave",
  "Pneumonia hospitalar / PAV": "Neumonía hospitalaria / NAV",
  "Urossepse / pielonefrite": "Urosepsis / pielonefritis",
  "Abdominal / peritonite": "Abdominal / peritonitis",
  "Pele e partes moles": "Piel y partes blandas",
  "Meningite bacteriana": "Meningitis bacteriana",
  "Cateter (CRBSI)": "Catéter (CRBSI)",
  "Neutropenia febril": "Neutropenia febril",
  "Foco indeterminado": "Foco indeterminado",
  "Sim — hipotensão ou lactato ≥ 4": "Sí — hipotensión o lactato ≥ 4",
  "Não — sem hipoperfusão": "No — sin hipoperfusión",
  "Sim — PAM < 65 (choque)": "Sí — PAM < 65 (choque)",
  "Não — PAM ≥ 65": "No — PAM ≥ 65",
  "Não — sem critério": "No — sin criterio",
  "Sim — foco que precisa de controle": "Sí — foco que requiere control",
  "Não / foco sem indicação de procedimento": "No / foco sin indicación de procedimiento",
  "Toque nos valores (ou adicione). Definem hipoperfusão e a dose de volume.":
    "Toque los valores (o agregue). Definen la hipoperfusión y la dosis de volumen.",

  // ── Evidência / ações ──────────────────────────────────────────────────────
  "Janela (SSC 2026): choque séptico OU sepse PROVÁVEL → antibiótico IMEDIATO, idealmente ≤ 1 h. Sepse POSSÍVEL sem choque → até 3 h, após avaliação rápida que confirme a infecção.":
    "Ventana (SSC 2026): choque séptico O sepsis PROBABLE → antibiótico INMEDIATO, idealmente ≤ 1 h. Sepsis POSIBLE sin choque → hasta 3 h, tras una evaluación rápida que confirme la infección.",
  "Cobertura baseada no foco + flora local (CCIH) + risco de MDR.":
    "Cobertura según el foco + flora local (comité de infecciones) + riesgo de MDR.",
  "Vancomicina (se MRSA): ataque {vancoLoad} mg (25–30 mg/kg), manutenção 15–20 mg/kg 8–12h, alvo AUC/MIC 400–600.":
    "Vancomicina (si SARM): carga {vancoLoad} mg (25–30 mg/kg), mantenimiento 15–20 mg/kg cada 8–12 h, objetivo AUC/CIM 400–600.",
  "De-escalonar em 48–72 h conforme culturas. Sempre adaptar à epidemiologia local.":
    "Desescalar en 48–72 h según cultivos. Adaptar siempre a la epidemiología local.",
  "Cristaloide BALANCEADO (Ringer lactato) preferido ao SF 0,9% (SMART/SALT-ED: menos LRA e acidose hiperclorêmica). NÃO usar gelatinas/amidos (HES).":
    "Cristaloide BALANCEADO (Ringer lactato) preferido a la SF 0,9% (SMART/SALT-ED: menos LRA y acidosis hiperclorémica). NO usar gelatinas/almidones (HES).",
  "Bolus de 500 mL com reavaliação dinâmica após cada um — não infundir tudo sem reavaliar.":
    "Bolos de 500 mL con reevaluación dinámica tras cada uno — no infundir todo sin reevaluar.",
  "Choque séptico = hipotensão que exige vasopressor para PAM ≥ 65 + lactato > 2 apesar de volume adequado.":
    "Choque séptico = hipotensión que exige vasopresor para PAM ≥ 65 + lactato > 2 pese a volumen adecuado.",
  "SSC 2026: alvo inicial de PAM 65 mmHg; em pacientes com ≥ 65 anos é aceitável mirar 60–65 mmHg.":
    "SSC 2026: objetivo inicial de PAM 65 mmHg; en pacientes de ≥ 65 años es aceptable apuntar a 60–65 mmHg.",
  "Não retardar o vasopressor se a hipotensão é grave — iniciar em paralelo ao volume (acesso periférico calibroso aceitável inicialmente).":
    "No retrasar el vasopresor si la hipotensión es grave — iniciar en paralelo al volumen (acceso periférico grueso aceptable al inicio).",
  "Corticoide NÃO é indicado em sepse sem choque.":
    "El corticoide NO está indicado en sepsis sin choque.",
  "ADRENAL: reversão mais rápida do choque (sem ganho de mortalidade); APROCCHSS (hidrocortisona + fludrocortisona): redução de mortalidade.":
    "ADRENAL: reversión más rápida del choque (sin beneficio en mortalidad); APROCCHSS (hidrocortisona + fludrocortisona): reducción de mortalidad.",
  "Controle do foco é o 3º pilar (tão importante quanto ATB e ressuscitação). Atraso aumenta mortalidade.":
    "El control del foco es el 3.er pilar (tan importante como el ATB y la reanimación). El retraso aumenta la mortalidad.",
  "Focos: abscesso (< 12 h), peritonite por perfuração (< 6 h), fasciite necrotizante (emergência — 9%/h), colangite (CPRE < 24 h), empiema (dreno < 24 h), pionefrose (< 12 h), cateter/dispositivo infectado (< 24 h).":
    "Focos: absceso (< 12 h), peritonitis por perforación (< 6 h), fascitis necrotizante (emergencia — 9%/h), colangitis (CPRE < 24 h), empiema (drenaje < 24 h), pionefrosis (< 12 h), catéter/dispositivo infectado (< 24 h).",
  "SEPSE (Sepsis-3): disfunção orgânica com risco de vida por resposta desregulada à infecção — critério prático SOFA agudo ≥ 2 (mortalidade > 10%).":
    "SEPSIS (Sepsis-3): disfunción orgánica con riesgo vital por respuesta desregulada a la infección — criterio práctico SOFA agudo ≥ 2 (mortalidad > 10%).",
  "CHOQUE SÉPTICO: sepse + vasopressor para PAM ≥ 65 + lactato > 2 mmol/L apesar de volume adequado (mortalidade > 40%).":
    "CHOQUE SÉPTICO: sepsis + vasopresor para PAM ≥ 65 + lactato > 2 mmol/L pese a volumen adecuado (mortalidad > 40%).",
  "qSOFA (triagem fora da UTI, 1 ponto cada): FR ≥ 22, alteração mental (GCS < 15), PAS ≤ 100. qSOFA ≥ 2 = alto risco → acionar avaliação completa (não substitui o SOFA).":
    "qSOFA (tamizaje fuera de UCI, 1 punto cada uno): FR ≥ 22, alteración del estado mental (GCS < 15), PAS ≤ 100. qSOFA ≥ 2 = alto riesgo → activar evaluación completa (no sustituye al SOFA).",
  "Monitor, oximetria, PA, 2 acessos venosos calibrosos; O₂ se SpO₂ < 94%.":
    "Monitor, oximetría, PA, 2 accesos venosos gruesos; O₂ si SpO₂ < 94%.",
  "Acionar o protocolo institucional de sepse e marcar o TEMPO ZERO (início do pacote da 1ª hora).":
    "Activar el protocolo institucional de sepsis y marcar el TIEMPO CERO (inicio del paquete de la 1.ª hora).",
  "Exames: gasometria com lactato, HMG, função renal/hepática, eletrólitos, coagulograma, bilirrubinas (compõem o SOFA).":
    "Exámenes: gasometría con lactato, hemograma, función renal/hepática, electrolitos, coagulación, bilirrubinas (componen el SOFA).",
  "Lactato sérico (venoso/arterial). > 2 = repetir em 2 h (clearance ≥ 10%/2h). > 4 mmol/L = hipoperfusão grave → ressuscitar independentemente da PA.":
    "Lactato sérico (venoso/arterial). > 2 = repetir en 2 h (aclaramiento ≥ 10%/2 h). > 4 mmol/L = hipoperfusión grave → reanimar independientemente de la PA.",
  "2 pares de hemoculturas (aeróbia + anaeróbia) de sítios diferentes, ≥ 10 mL/frasco, ANTES do antibiótico.":
    "2 pares de hemocultivos (aerobio + anaerobio) de sitios diferentes, ≥ 10 mL/frasco, ANTES del antibiótico.",
  "Culturas dirigidas ao foco: urina (EAS+urocultura), secreção respiratória, líquor, líquido peritoneal, ferida.":
    "Cultivos dirigidos al foco: orina (examen + urocultivo), secreción respiratoria, LCR, líquido peritoneal, herida.",
  "Identificar o foco provável para guiar o esquema empírico (próximo passo).":
    "Identificar el foco probable para guiar el esquema empírico (siguiente paso).",
  "Ceftriaxona 1–2 g IV/24h + Azitromicina 500 mg IV/24h.":
    "Ceftriaxona 1–2 g IV/24 h + Azitromicina 500 mg IV/24 h.",
  "Alternativa: Amoxicilina-clavulanato 2,2 g IV/8h + Azitromicina.":
    "Alternativa: Amoxicilina-clavulanato 2,2 g IV/8 h + Azitromicina.",
  "Considerar cobertura de Pseudomonas/MRSA se fatores de risco (bronquiectasia, ATB recente, colonização).":
    "Considerar cobertura de Pseudomonas/SARM si hay factores de riesgo (bronquiectasias, ATB reciente, colonización).",
  "Iniciar em ≤ 1 h; não atrasar pela coleta de culturas.":
    "Iniciar en ≤ 1 h; no retrasar por la toma de cultivos.",
  "Piperacilina-tazobactam 4,5 g IV/6h (ou Meropenem 1–2 g IV/8h se risco de MDR).":
    "Piperacilina-tazobactam 4,5 g IV/6 h (o Meropenem 1–2 g IV/8 h si hay riesgo de MDR).",
  "+ Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) e manutenção (ou Linezolida 600 mg IV/12h) para MRSA.":
    "+ Vancomicina {vancoLoad} mg de carga (25–30 mg/kg) y mantenimiento (o Linezolid 600 mg IV/12 h) para SARM.",
  "Ajustar à flora local (CCIH) e desescalonar em 48–72 h.":
    "Ajustar a la flora local (comité de infecciones) y desescalar en 48–72 h.",
  "Ceftriaxona 1–2 g IV/24h (sem risco de ESBL).":
    "Ceftriaxona 1–2 g IV/24 h (sin riesgo de BLEE).",
  "Ertapenem 1 g IV/24h (risco de ESBL) ou Piperacilina-tazobactam 4,5 g IV/6h.":
    "Ertapenem 1 g IV/24 h (riesgo de BLEE) o Piperacilina-tazobactam 4,5 g IV/6 h.",
  "Avaliar obstrução (pielonefrite obstrutiva exige drenagem urgente — controle do foco).":
    "Evaluar obstrucción (la pielonefritis obstructiva exige drenaje urgente — control del foco).",
  "Piperacilina-tazobactam 4,5 g IV/6h OU Meropenem 1 g IV/8h + Metronidazol 500 mg IV/8h (se carbapenem sem cobertura anaeróbia adequada).":
    "Piperacilina-tazobactam 4,5 g IV/6 h O Meropenem 1 g IV/8 h + Metronidazol 500 mg IV/8 h (si el carbapenémico no cubre anaerobios adecuadamente).",
  "Ertapenem 1 g IV/24h em casos sem Pseudomonas/ambulatorial.":
    "Ertapenem 1 g IV/24 h en casos sin Pseudomonas / de origen comunitario.",
  "Controle do foco precoce (drenagem/cirurgia) é essencial — não adiar.":
    "El control precoz del foco (drenaje/cirugía) es esencial — no posponer.",
  "Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) + Piperacilina-tazobactam 4,5 g IV/6h.":
    "Vancomicina {vancoLoad} mg de carga (25–30 mg/kg) + Piperacilina-tazobactam 4,5 g IV/6 h.",
  "Fasciite necrotizante: adicionar Clindamicina 900 mg IV/8h (inibe produção de toxina) + DESBRIDAMENTO cirúrgico de emergência.":
    "Fascitis necrotizante: agregar Clindamicina 900 mg IV/8 h (inhibe la producción de toxinas) + DESBRIDAMIENTO quirúrgico de emergencia.",
  "Suspeita de fasciite/gangrena → cirurgia imediata (mortalidade ↑ 9%/hora de atraso).":
    "Sospecha de fascitis/gangrena → cirugía inmediata (mortalidad ↑ 9% por hora de retraso).",
  "Ceftriaxona 2 g IV/12h + Dexametasona 0,15 mg/kg IV/6h × 4 dias (iniciar ANTES ou junto ao 1º ATB).":
    "Ceftriaxona 2 g IV/12 h + Dexametasona 0,15 mg/kg IV/6 h × 4 días (iniciar ANTES o junto con el 1.er ATB).",
  "Adicionar Ampicilina 2 g IV/4h se > 50 anos ou imunocomprometido (Listeria).":
    "Agregar Ampicilina 2 g IV/4 h si > 50 años o inmunocomprometido (Listeria).",
  "Não atrasar o ATB pela TC/punção lombar se sinais de gravidade.":
    "No retrasar el ATB por la TC/punción lumbar si hay signos de gravedad.",
  "Vancomicina {vancoLoad} mg ataque (25–30 mg/kg) + Cefepima 2 g IV/8h (se neutropênico ou MDR suspeito).":
    "Vancomicina {vancoLoad} mg de carga (25–30 mg/kg) + Cefepima 2 g IV/8 h (si neutropénico o sospecha de MDR).",
  "+ Micafungina 100 mg IV/24h se candidemia suspeita.":
    "+ Micafungina 100 mg IV/24 h si se sospecha candidemia.",
  "RETIRAR o cateter suspeito (obrigatória em S. aureus, Candida, BGN) — controle do foco.":
    "RETIRAR el catéter sospechoso (obligatorio en S. aureus, Candida, BGN) — control del foco.",
  "Cefepima 2 g IV/8h (monoterapia se sem MDR) OU Piperacilina-tazobactam 4,5 g IV/6h OU Meropenem 1 g IV/8h (risco MDR/Pseudomonas).":
    "Cefepima 2 g IV/8 h (monoterapia si no hay MDR) O Piperacilina-tazobactam 4,5 g IV/6 h O Meropenem 1 g IV/8 h (riesgo de MDR/Pseudomonas).",
  "+ Vancomicina {vancoLoad} mg ataque se cateter, mucosite ou instabilidade.":
    "+ Vancomicina {vancoLoad} mg de carga si hay catéter, mucositis o inestabilidad.",
  "Início imediato (< 1 h) — emergência oncológica.":
    "Inicio inmediato (< 1 h) — emergencia oncológica.",
  "Piperacilina-tazobactam 4,5 g IV/6h + Vancomicina {vancoLoad} mg ataque (25–30 mg/kg).":
    "Piperacilina-tazobactam 4,5 g IV/6 h + Vancomicina {vancoLoad} mg de carga (25–30 mg/kg).",
  "Meropenem 1–2 g IV/8h + Vancomicina se MDR/hospitalar.":
    "Meropenem 1–2 g IV/8 h + Vancomicina si MDR/nosocomial.",
  "Buscar ativamente o foco (imagem, exame físico seriado) e desescalonar conforme culturas.":
    "Buscar activamente el foco (imagen, examen físico seriado) y desescalar según cultivos.",
  "Cristaloide balanceado {fluidVol} mL (≈ {fluidVolL} L = 30 mL/kg) em bolus de 500 mL, reavaliando.":
    "Cristaloide balanceado {fluidVol} mL (≈ {fluidVolL} L = 30 mL/kg) en bolos de 500 mL, reevaluando.",
  "Responsividade a fluidos (parâmetros DINÂMICOS, não PVC): VPP > 13% (VM sem arritmia), VVS > 10%, elevação passiva de pernas ↑ DC ≥ 10%, mini-fluido 100 mL ↑ VE ≥ 10%, VCI colapsável ao POCUS.":
    "Respuesta a líquidos (parámetros DINÁMICOS, no PVC): VPP > 13% (VM sin arritmia), VVS > 10%, elevación pasiva de piernas ↑ GC ≥ 10%, mini-bolo de 100 mL ↑ VS ≥ 10%, VCI colapsable en POCUS.",
  "PARAR fluidos quando: PAM ≥ 65, lactato em queda, diurese ≥ 0,5 mL/kg/h, perfusão melhorando OU sinais de sobrecarga (B-lines, SpO₂ ↓). Evitar balanço fortemente positivo > 10 L.":
    "DETENER los líquidos cuando: PAM ≥ 65, lactato en descenso, diuresis ≥ 0,5 mL/kg/h, perfusión mejorando O signos de sobrecarga (líneas B, SpO₂ ↓). Evitar un balance muy positivo > 10 L.",
  "Albumina 4–5%: considerar só se já recebeu > 3–4 L de cristaloide e ainda precisa de volume (não de rotina).":
    "Albúmina 4–5%: considerar solo si ya recibió > 3–4 L de cristaloide y aún requiere volumen (no de rutina).",
  "Repetir o lactato em 2 h (meta: clearance ≥ 10%/2h → normalizar < 2 mmol/L).":
    "Repetir el lactato en 2 h (meta: aclaramiento ≥ 10%/2 h → normalizar < 2 mmol/L).",
  "NOREPINEFRINA IV em bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) e titular para PAM ≥ 65 — em ≥ 65 anos aceita-se 60–65 (SSC 2026); 70–75 em hipertenso crônico. Preparo: 4 mg em 250 mL SG5% → 16 mcg/mL.":
    "NORADRENALINA IV en bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) y titular para PAM ≥ 65 — en ≥ 65 años se acepta 60–65 (SSC 2026); 70–75 en hipertenso crónico. Preparación: 4 mg en 250 mL de SG 5% → 16 mcg/mL.",
  "3ª linha — EPINEFRINA 0,01–0,5 mcg/kg/min em choque refratário (cuidado: taquicardia, hiperlactatemia metabólica).":
    "3.ª línea — ADRENALINA 0,01–0,5 mcg/kg/min en choque refractario (cuidado: taquicardia, hiperlactatemia metabólica).",
  "DISFUNÇÃO MIOCÁRDICA séptica (baixo DC apesar de PAM ≥ 65: ScvO₂ < 70%, lactato persistente): adicionar DOBUTAMINA 2–20 mcg/kg/min (não de rotina).":
    "DISFUNCIÓN MIOCÁRDICA séptica (bajo GC pese a PAM ≥ 65: SvcO₂ < 70%, lactato persistente): agregar DOBUTAMINA 2–20 mcg/kg/min (no de rutina).",
  "Considerar acesso central + cateter arterial para PA invasiva.":
    "Considerar acceso central + catéter arterial para PA invasiva.",
  "Hidrocortisona 200 mg/dia IV — infusão contínua (200 mg em 50 mL SF a 2,1 mL/h) ou 50 mg IV/6h. Infusão contínua tem menos hiperglicemia/hipernatremia (ADRENAL).":
    "Hidrocortisona 200 mg/día IV — infusión continua (200 mg en 50 mL de SF a 2,1 mL/h) o 50 mg IV/6 h. La infusión continua produce menos hiperglucemia/hipernatremia (ADRENAL).",
  "Considerar fludrocortisona 50 mcg/dia VO/SNE associada (APROCCHSS — redução de mortalidade).":
    "Considerar fludrocortisona 50 mcg/día VO/SNG asociada (APROCCHSS — reducción de mortalidad).",
  "Manter até reversão do choque (desmame do vasopressor); desmame gradual em 2–3 dias.":
    "Mantener hasta la reversión del choque (retiro del vasopresor); retiro gradual en 2–3 días.",
  "Monitorar glicemia e natremia. Contraindicações relativas: infecção fúngica invasiva não controlada, TB ativa disseminada.":
    "Monitorizar glucemia y natremia. Contraindicaciones relativas: infección fúngica invasiva no controlada, TB activa diseminada.",
  "Imagem dirigida (US/TC) para localizar e caracterizar o foco.":
    "Imagen dirigida (ecografía/TC) para localizar y caracterizar el foco.",
  "Acionar a especialidade (cirurgia, urologia, radiologia intervencionista, gastro/CPRE) — drenagem/desbridamento/derivação conforme o foco.":
    "Activar a la especialidad (cirugía, urología, radiología intervencionista, gastro/CPRE) — drenaje/desbridamiento/derivación según el foco.",
  "Remover dispositivos/cateteres suspeitos (obrigatório em S. aureus, Candida, BGN).":
    "Retirar dispositivos/catéteres sospechosos (obligatorio en S. aureus, Candida, BGN).",
  "Timing: abscesso < 12 h, peritonite < 6 h, fasciite imediata, colangite/empiema/cateter < 24 h.":
    "Tiempos: absceso < 12 h, peritonitis < 6 h, fascitis inmediata, colangitis/empiema/catéter < 24 h.",
  "Manter monitorização contínua; reavaliar PA, FC, FR, diurese e nível de consciência.":
    "Mantener monitorización continua; reevaluar PA, FC, FR, diuresis y nivel de conciencia.",
  "Repetir o lactato em 2 h se o inicial estava alterado (clearance ≥ 10%/2h).":
    "Repetir el lactato en 2 h si el inicial estaba alterado (aclaramiento ≥ 10%/2 h).",
  "Reavaliar a resposta ao antibiótico e a evolução do foco.":
    "Reevaluar la respuesta al antibiótico y la evolución del foco.",
  "Escalonar imediatamente se surgir hipotensão, lactato ascendente ou disfunção orgânica.":
    "Escalar de inmediato si aparece hipotensión, lactato en ascenso o disfunción orgánica.",
  "Internar em UTI se choque, necessidade de vasopressor ou disfunção orgânica significativa.":
    "Ingresar a UCI si hay choque, necesidad de vasopresor o disfunción orgánica significativa.",
  "Suporte orgânico (SSC 2021): glicemia 140–180; transfusão se Hb < 7 (8–9 em isquemia); VM protetora (VC 6 mL/kg, Pplat ≤ 30); profilaxia de TEV (HBPM) e de úlcera de estresse (IBP se VM ≥ 48 h/coagulopatia); nutrição enteral precoce (24–48 h); sedação leve RASS −1/−2; mobilização precoce.":
    "Soporte orgánico (SSC): glucemia 140–180; transfusión si Hb < 7 (8–9 en isquemia); VM protectora (VC 6 mL/kg, Pmeseta ≤ 30); profilaxis de ETV (HBPM) y de úlcera de estrés (IBP si VM ≥ 48 h/coagulopatía); nutrición enteral precoz (24–48 h); sedación ligera RASS −1/−2; movilización precoz.",
  "De-escalonamento do ATB em 48–72 h por culturas; duração 7–10 dias (5–7 se foco controlado); PCT para apoiar suspensão; TRS na LRA grau 3 com indicação clássica.":
    "Desescalamiento del ATB en 48–72 h según cultivos; duración 7–10 días (5–7 si el foco está controlado); PCT para apoyar la suspensión; TRR en LRA grado 3 con indicación clásica.",
  "Metas: PAM ≥ 65, clearance de lactato ≥ 10%/2h → < 2, diurese ≥ 0,5 mL/kg/h, temperatura < 38,3 °C.":
    "Metas: PAM ≥ 65, aclaramiento de lactato ≥ 10%/2 h → < 2, diuresis ≥ 0,5 mL/kg/h, temperatura < 38,3 °C.",
  "Critérios de alta da UTI: vasopressor suspenso ≥ 24 h, lactato normalizado, função orgânica em recuperação, ATB VO possível. Atenção à síndrome pós-UTI (PICS).":
    "Criterios de alta de UCI: vasopresor suspendido ≥ 24 h, lactato normalizado, función orgánica en recuperación, ATB VO posible. Atención al síndrome pos-UCI (PICS).",

  // ══ CAMADA 2 — correções conforme o capítulo de Sepse v1.4 (SSC 2026) ════
  "Há necessidade PERSISTENTE de vasopressor após a ressuscitação inicial e a correção de causas reversíveis?":
    "¿Hay necesidad PERSISTENTE de vasopresor tras la reanimación inicial y la corrección de las causas reversibles?",
  "SSC 2026 (recomendação condicional, baixa certeza, a favor): corticoide IV no choque séptico. ⚠️ NÃO existe limiar universal de dose ou de duração do vasopressor para iniciar — o gatilho é a necessidade PERSISTENTE de vasopressor, não um número.":
    "SSC 2026 (recomendación condicional, baja certeza, a favor): corticoide IV en el choque séptico. ⚠️ NO existe un umbral universal de dosis ni de duración del vasopresor para iniciarlo — el disparador es la necesidad PERSISTENTE de vasopresor, no un número.",
  "NE ≥ 0,25 mcg/kg/min por ≥ 4 h é referência de prática comum e o critério dos ensaios, útil como parâmetro — mas não deve funcionar como portão que impede a indicação em quem já tem necessidade persistente.":
    "NA ≥ 0,25 mcg/kg/min durante ≥ 4 h es una referencia de práctica común y el criterio de los ensayos, útil como parámetro — pero no debe funcionar como una puerta que impida la indicación en quien ya tiene necesidad persistente.",
  "Hidrocortisona IV 200 mg/dia, em doses intermitentes (50 mg 6/6 h) OU infusão contínua, conforme o protocolo institucional. Não há superioridade estabelecida entre as duas formas.":
    "Hidrocortisona IV 200 mg/día, en dosis intermitentes (50 mg cada 6 h) O en infusión continua, según el protocolo institucional. No hay superioridad establecida entre ambas formas.",
  "Sim — vasopressor persistente":
    "Sí — vasopresor persistente",
  "Não — choque revertido ou causa reversível corrigida":
    "No — choque revertido o causa reversible corregida",
  "⚠️ EXCEÇÃO — traumatismo cranioencefálico associado: preferir solução salina 0,9% e EVITAR albumina. Soluções balanceadas são relativamente hipotônicas e podem agravar o edema cerebral.":
    "⚠️ EXCEPCIÓN — traumatismo craneoencefálico asociado: preferir solución salina 0,9% y EVITAR la albúmina. Las soluciones balanceadas son relativamente hipotónicas y pueden agravar el edema cerebral.",
  "PESO para o cálculo: usar o peso corporal REAL. Em IMC > 30 kg/m², pode-se usar peso ajustado ou ideal — documentando qual descritor foi escolhido.":
    "PESO para el cálculo: usar el peso corporal REAL. En IMC > 30 kg/m², puede usarse el peso ajustado o el ideal — documentando qué descriptor se eligió.",
  "SSC 2026: cristaloide isoladamente, em vez da associação rotineira com albumina. Albumina suplementar pode ser considerada após grandes volumes de cristaloide ou em situações selecionadas, como cirrose.":
    "SSC 2026: cristaloide en solitario, en lugar de la asociación rutinaria con albúmina. La albúmina suplementaria puede considerarse tras grandes volúmenes de cristaloide o en situaciones seleccionadas, como la cirrosis.",
  "Pelo menos 30 mL/kg de cristaloide nas primeiras 3 h na hipoperfusão induzida por sepse — em ALÍQUOTAS e com reavaliação após cada uma. Não é volume automático.":
    "Al menos 30 mL/kg de cristaloide en las primeras 3 h en la hipoperfusión inducida por sepsis — en ALÍCUOTAS y con reevaluación tras cada una. No es un volumen automático.",
  "2ª linha — VASOPRESSINA 0,03 U/min, dose FIXA (não titular): a partir de noradrenalina ≥ 0,25 mcg/kg/min (faixa usual de início 0,25–0,5). Poupa catecolamina — adicionar à NE em vez de escalar a NE sozinha.":
    "2.ª línea — VASOPRESINA 0,03 U/min, dosis FIJA (no titular): a partir de noradrenalina ≥ 0,25 mcg/kg/min (rango usual de inicio 0,25–0,5). Ahorra catecolaminas — agregar a la NE en vez de escalar la NE sola.",
  "A dexametasona no adulto é dose FIXA de 10 mg, não por quilo: a diretriz brasileira de meningite bacteriana aguda usa 10 mg de 6/6 h por 4 dias. A formulação internacional por peso (0,15 mg/kg) carrega teto de 10 mg/dose e satura em 67 kg — abaixo do peso adulto médio, ou seja, a maioria receberia o teto de qualquer forma e o cálculo só adicionaria oportunidade de erro.": "La dexametasona en el adulto es dosis FIJA de 10 mg, no por kilo: la directriz brasileña de meningitis bacteriana aguda usa 10 mg cada 6 h por 4 días. La formulación internacional por peso (0,15 mg/kg) lleva un techo de 10 mg/dosis y se satura en 67 kg — por debajo del peso adulto medio, es decir, la mayoría recibiría el techo de todos modos y el cálculo solo agregaría oportunidad de error.",
  "Ceftriaxona 2 g IV/12h + Dexametasona 10 mg IV/6h × 4 dias (iniciar ANTES ou junto ao 1º ATB).": "Ceftriaxona 2 g IV/12h + Dexametasona 10 mg IV/6h × 4 días (iniciar ANTES o junto con el 1.er ATB).",
  "SRI: Ketamina 1–2 mg/kg IV + Succinilcolina 1–1,5 mg/kg (2 mg/kg em obeso; máx 200 mg) IV.": "SRI: Ketamina 1–2 mg/kg IV + Succinilcolina 1–1,5 mg/kg (2 mg/kg en obeso; máx 200 mg) IV.",
  "Lactato sérico (venoso/arterial). > 2 = repetir em 2 h da coleta anterior (clearance ≥ 10%/2h). > 4 mmol/L = hipoperfusão grave → ressuscitar independentemente da PA.": "Lactato sérico (venoso/arterial). > 2 = repetir a las 2 h de la extracción anterior (aclaramiento ≥ 10%/2h). > 4 mmol/L = hipoperfusión grave → reanimar independientemente de la PA.",
  "Repetir o lactato em 2 h da coleta anterior (meta: clearance ≥ 10%/2h → normalizar < 2 mmol/L).": "Repetir el lactato a las 2 h de la extracción anterior (meta: aclaramiento ≥ 10%/2h → normalizar < 2 mmol/L).",
  "Repetir o lactato em 2 h da coleta anterior se o inicial estava alterado (clearance ≥ 10%/2h).": "Repetir el lactato a las 2 h de la extracción anterior si el inicial estaba alterado (aclaramiento ≥ 10%/2h).",
};
