/**
 * Síndromes coronarianas (SCA) — dicionário PT → ES (espanhol latino-americano).
 * Terminologia: elevación del ST, BRI, puerta-balón, hemodinamia, betabloqueante,
 * ARA-II, DAI. Tokens ({enoxa}, {tnk}, {hnfBolus}…) preservados.
 */
export const ES_SCA: Record<string, string> = {
  // ── Títulos ────────────────────────────────────────────────────────────────
  "Suspeita de SCA — dor torácica / equivalente anginoso":
    "Sospecha de SCA — dolor torácico / equivalente anginoso",
  "Tempo desde o início dos sintomas": "Tiempo desde el inicio de los síntomas",
  "ECG de 12 derivações": "ECG de 12 derivaciones",
  "STEMI confirmado — localizar a parede": "IAMCEST confirmado — localizar la pared",
  "Peso para cálculo de dose": "Peso para el cálculo de dosis",
  "Terapia antitrombótica e adjuvante — STEMI": "Terapia antitrombótica y adyuvante — IAMCEST",
  "Estratégia de reperfusão": "Estrategia de reperfusión",
  "Angioplastia primária (ICP)": "Angioplastia primaria (ICP)",
  "Contraindicações à fibrinólise": "Contraindicaciones para la fibrinólisis",
  "Fibrinólise — dose calculada": "Fibrinólisis — dosis calculada",
  "Transferência urgente para ICP": "Traslado urgente para ICP",
  "Troponina e alterações isquêmicas": "Troponina y alteraciones isquémicas",
  "Terapia antitrombótica e anti-isquêmica — SCA sem supra":
    "Terapia antitrombótica y antiisquémica — SCA sin elevación del ST",
  "Estratificação de risco → tempo da coronariografia":
    "Estratificación de riesgo → tiempo de la coronariografía",
  "Estratégia invasiva IMEDIATA (< 2 h)": "Estrategia invasiva INMEDIATA (< 2 h)",
  "Estratégia invasiva precoce/programada": "Estrategia invasiva precoz/programada",
  "Baixo risco — seriar e estratificar": "Bajo riesgo — seriar y estratificar",
  "Prevenção secundária — 5 classes obrigatórias na alta":
    "Prevención secundaria — 5 clases obligatorias al alta",
  "Unidade Coronariana / UTI": "Unidad Coronaria / UCI",
  "Observação / alta com seguimento": "Observación / alta con seguimiento",
  "Síndromes Coronarianas": "Síndromes Coronarios",

  // ── Perguntas ──────────────────────────────────────────────────────────────
  "Há supradesnivelamento de ST (ou BRE/BRD novo) com critério?":
    "¿Hay elevación del ST (o BRI/BRD nuevo) con criterio?",
  "Angioplastia primária (ICP) disponível com tempo porta-balão ≤ 120 min?":
    "¿Angioplastia primaria (ICP) disponible con tiempo puerta-balón ≤ 120 min?",
  "Há alguma contraindicação ABSOLUTA à fibrinólise?":
    "¿Hay alguna contraindicación ABSOLUTA para la fibrinólisis?",
  "Troponina elevada (ou curva ascendente) e/ou alterações isquêmicas dinâmicas?":
    "¿Troponina elevada (o curva ascendente) o alteraciones isquémicas dinámicas?",
  "Qual a categoria de risco do paciente?": "¿Cuál es la categoría de riesgo del paciente?",

  // ── Resumos ────────────────────────────────────────────────────────────────
  "Tempo é músculo. Medidas iniciais e ECG em paralelo, sem atrasar.":
    "El tiempo es músculo. Medidas iniciales y ECG en paralelo, sin retrasar.",
  "Localizar o infarto orienta complicações e cuidados específicos.":
    "Localizar el infarto orienta las complicaciones y los cuidados específicos.",
  "Iniciar em paralelo à definição da reperfusão (não atrasar a reperfusão).":
    "Iniciar en paralelo a la definición de la reperfusión (no retrasar la reperfusión).",
  "Tempo de sintomas: {tempo_dor}.": "Tiempo de síntomas: {tempo_dor}.",
  "Reperfusão mecânica preferencial. Meta porta-balão ≤ 90 min.":
    "Reperfusión mecánica preferente. Meta puerta-balón ≤ 90 min.",
  "Porta-agulha ≤ 30 min. Sempre seguida de estratégia fármaco-invasiva.":
    "Puerta-aguja ≤ 30 min. Siempre seguida de una estrategia farmacoinvasiva.",
  "Fibrinólise contraindicada → reperfusão mecânica é a única opção.":
    "Fibrinólisis contraindicada → la reperfusión mecánica es la única opción.",
  "Tratar enquanto se define o tempo da estratégia invasiva.":
    "Tratar mientras se define el tiempo de la estrategia invasiva.",
  "Define a urgência da estratégia invasiva (ESC 2020/2023). Use o escore GRACE 2.0.":
    "Define la urgencia de la estrategia invasiva (ESC 2020/2023). Use el puntaje GRACE 2.0.",
  "Conduta semelhante ao STEMI pela instabilidade.":
    "Conducta similar al IAMCEST por la inestabilidad.",
  "Coronariografia conforme a categoria de risco (< 24 h alto; < 72 h intermediário).":
    "Coronariografía según la categoría de riesgo (< 24 h alto; < 72 h intermedio).",
  "Sem elevação de troponina e ECG sem alteração isquêmica.":
    "Sin elevación de troponina y ECG sin alteración isquémica.",
  "Todo IAM deve sair com pelo menos 5 classes. Revisão com cardiologista em 2–4 semanas.":
    "Todo IAM debe egresar con al menos 5 clases. Control con cardiología en 2–4 semanas.",
  "Monitorização pós-reperfusão/revascularização e vigilância de complicações.":
    "Monitorización pos-reperfusión/revascularización y vigilancia de complicaciones.",
  "Baixo risco com investigação negativa.": "Bajo riesgo con estudio negativo.",

  // ── Campos e opções ────────────────────────────────────────────────────────
  "Início dos sintomas": "Inicio de los síntomas",
  "< 1 h": "< 1 h",
  "1–3 h": "1–3 h",
  "3–6 h": "3–6 h",
  "6–12 h": "6–12 h",
  "> 12 h": "> 12 h",
  "Indefinido": "Indefinido",
  "Sim — supra de ST / BRE-BRD novo (STEMI)": "Sí — elevación del ST / BRI-BRD nuevo (IAMCEST)",
  "Não — sem supra de ST": "No — sin elevación del ST",
  "Peso estimado": "Peso estimado",
  "Sim — ICP primária em ≤ 120 min": "Sí — ICP primaria en ≤ 120 min",
  "Não — ICP indisponível em tempo": "No — ICP no disponible a tiempo",
  "Sem contraindicação": "Sin contraindicación",
  "Há contraindicação": "Hay contraindicación",
  "Sim — troponina+/ST dinâmico (NSTE-ACS)": "Sí — troponina+/ST dinámico (SCASEST)",
  "Não — sem elevação / ECG normal": "No — sin elevación / ECG normal",
  "Muito alto — invasiva imediata (< 2 h)": "Muy alto — invasiva inmediata (< 2 h)",
  "Alto — invasiva precoce (< 24 h)": "Alto — invasiva precoz (< 24 h)",
  "Intermediário — invasiva (< 72 h)": "Intermedio — invasiva (< 72 h)",
  "Toque na janela. Define a elegibilidade e a urgência da reperfusão no STEMI.":
    "Toque la ventana. Define la elegibilidad y la urgencia de la reperfusión en el IAMCEST.",
  "Toque no peso (ou adicione). Usado para enoxaparina, heparina e tenecteplase.":
    "Toque el peso (o agregue). Se usa para enoxaparina, heparina y tenecteplasa.",
  "Toque no peso (ou adicione). Usado para enoxaparina e heparina.":
    "Toque el peso (o agregue). Se usa para enoxaparina y heparina.",

  // ── Evidência / ações ──────────────────────────────────────────────────────
  "Supra de ST ≥ 1 mm (0,1 mV) em ≥ 2 derivações contíguas.":
    "Elevación del ST ≥ 1 mm (0,1 mV) en ≥ 2 derivaciones contiguas.",
  "Em V2–V3: ≥ 2 mm (homens ≥ 40a), ≥ 2,5 mm (homens < 40a) ou ≥ 1,5 mm (mulheres).":
    "En V2–V3: ≥ 2 mm (hombres ≥ 40 años), ≥ 2,5 mm (hombres < 40 años) o ≥ 1,5 mm (mujeres).",
  "BRE novo / presumidamente novo com critérios de Sgarbossa; BRD novo com clínica isquêmica.":
    "BRI nuevo / presuntamente nuevo con criterios de Sgarbossa; BRD nuevo con clínica isquémica.",
  "Sem supra de ST = SCA sem supra (NSTEMI ou angina instável) até definição pela troponina.":
    "Sin elevación del ST = SCA sin elevación (IAMSEST o angina inestable) hasta definir por troponina.",
  "ICP primária é preferida quando o tempo porta-balão é ≤ 120 min (meta ≤ 90 min em centro com hemodinâmica).":
    "La ICP primaria es preferible cuando el tiempo puerta-balón es ≤ 120 min (meta ≤ 90 min en centro con hemodinamia).",
  "Se a ICP não for possível em ≤ 120 min e o início for ≤ 12 h → fibrinólise (porta-agulha ≤ 30 min).":
    "Si la ICP no es posible en ≤ 120 min y el inicio fue ≤ 12 h → fibrinólisis (puerta-aguja ≤ 30 min).",
  "Reperfusão indicada até 12 h; entre 12–24 h apenas se isquemia/instabilidade persistente.":
    "Reperfusión indicada hasta 12 h; entre 12–24 h solo si hay isquemia/inestabilidad persistente.",
  "Qualquer hemorragia intracraniana prévia; AVC isquêmico nos últimos 3 meses (exceto < 4,5 h).":
    "Cualquier hemorragia intracraneal previa; ACV isquémico en los últimos 3 meses (excepto < 4,5 h).",
  "Neoplasia ou malformação vascular intracraniana conhecida; TCE/trauma facial grave < 3 meses.":
    "Neoplasia o malformación vascular intracraneal conocida; TCE/trauma facial grave < 3 meses.",
  "Sangramento ativo (exceto menstruação); suspeita de dissecção de aorta.":
    "Sangrado activo (excepto menstruación); sospecha de disección aórtica.",
  "Cirurgia intracraniana ou espinhal < 2 meses; HAS grave não controlável (> 185/110).":
    "Cirugía intracraneal o espinal < 2 meses; HTA grave no controlable (> 185/110).",
  "Troponina de alta sensibilidade com elevação/queda significativa = NSTEMI.":
    "Troponina de alta sensibilidad con ascenso/descenso significativo = IAMSEST.",
  "Infra de ST ≥ 0,5 mm ou inversão de T profunda dinâmica reforçam isquemia.":
    "Descenso del ST ≥ 0,5 mm o inversión profunda de la T dinámica refuerzan la isquemia.",
  "Protocolo 0 h/1 h (ou 0 h/3 h): troponina seriada para confirmar/descartar.":
    "Protocolo 0 h/1 h (o 0 h/3 h): troponina seriada para confirmar/descartar.",
  "Sem elevação e ECG sem alteração = avaliar angina instável vs causa não isquêmica (HEART score).":
    "Sin elevación y ECG sin alteraciones = evaluar angina inestable vs causa no isquémica (HEART score).",
  "Escore GRACE 2.0 (idade, FC, PAS, creatinina, Killip, PCR na admissão, desvio de ST, troponina) — superior ao TIMI para mortalidade. Calcular: GRACE > 140 = alto (> 3% mortalidade); 109–140 = intermediário (1–3%); < 109 = baixo (< 1%).":
    "Puntaje GRACE 2.0 (edad, FC, PAS, creatinina, Killip, paro cardíaco al ingreso, desviación del ST, troponina) — superior al TIMI para mortalidad. GRACE > 140 = alto (> 3% de mortalidad); 109–140 = intermedio (1–3%); < 109 = bajo (< 1%).",
  "MUITO ALTO (invasiva imediata < 2 h): instabilidade hemodinâmica/choque, dor refratária ao tratamento máximo, arritmia ventricular ameaçadora/PCR, complicação mecânica, IC aguda com isquemia, alterações dinâmicas de ST-T recorrentes (sobretudo supra de ST intermitente).":
    "MUY ALTO (invasiva inmediata < 2 h): inestabilidad hemodinámica/choque, dolor refractario al tratamiento máximo, arritmia ventricular amenazante/paro, complicación mecánica, IC aguda con isquemia, alteraciones dinámicas del ST-T recurrentes (sobre todo elevación intermitente del ST).",
  "ALTO (< 24 h): NSTEMI confirmado por troponina, alterações dinâmicas de ST/T, GRACE > 140.":
    "ALTO (< 24 h): IAMSEST confirmado por troponina, alteraciones dinámicas del ST/T, GRACE > 140.",
  "INTERMEDIÁRIO (< 72 h): DM, TFG < 60, FE < 40%/IC, angina pós-IAM, ICP/CRM prévia, GRACE 109–140.":
    "INTERMEDIO (< 72 h): DM, TFG < 60, FE < 40%/IC, angina pos-IAM, ICP/CRM previa, GRACE 109–140.",
  "Classificação de Killip (prognóstico): I sem IC (~6%); II B3/crepitantes < 50% ou JVP elevada (~17%); III EAP (~38%); IV choque cardiogênico (~67–81%).":
    "Clasificación de Killip (pronóstico): I sin IC (~6%); II R3/crepitantes < 50% o ingurgitación yugular (~17%); III EAP (~38%); IV choque cardiogénico (~67–81%).",
  "Monitor cardíaco contínuo, oximetria, PA, 2 acessos venosos; desfibrilador próximo.":
    "Monitor cardíaco continuo, oximetría, PA, 2 accesos venosos; desfibrilador cerca.",
  "ECG de 12 derivações em ATÉ 10 min da chegada (repetir se dor persistir/mudar).":
    "ECG de 12 derivaciones en MENOS de 10 min desde la llegada (repetir si el dolor persiste/cambia).",
  "AAS 300 mg mastigável agora (162–325 mg), salvo alergia/sangramento ativo.":
    "AAS 300 mg masticable ahora (162–325 mg), salvo alergia/sangrado activo.",
  "O₂ apenas se SpO₂ < 90% ou desconforto respiratório. Coletar troponina.":
    "O₂ solo si SpO₂ < 90% o hay dificultad respiratoria. Tomar troponina.",
  "Anamnese dirigida e exame em paralelo (não atrasar o ECG nem o AAS).":
    "Anamnesis dirigida y examen en paralelo (no retrasar el ECG ni el AAS).",
  "Anterior/septal (V1–V4): risco de disfunção de VE e bloqueios — atenção hemodinâmica.":
    "Anterior/septal (V1–V4): riesgo de disfunción del VI y bloqueos — atención hemodinámica.",
  "Inferior (DII, DIII, aVF): obter V3R–V4R para IAM de VD e V7–V9 para parede posterior.":
    "Inferior (DII, DIII, aVF): obtener V3R–V4R para IAM del VD y V7–V9 para la pared posterior.",
  "IAM de VD ou inferior com hipotensão: NÃO usar nitrato/morfina; fazer volume (cristaloide).":
    "IAM del VD o inferior con hipotensión: NO usar nitrato/morfina; administrar volumen (cristaloide).",
  "Acionar a hemodinâmica/cardiologia AGORA, em paralelo às medicações.":
    "Activar hemodinamia/cardiología AHORA, en paralelo a las medicaciones.",
  "AAS já administrado (300 mg). Manter 81–100 mg/dia.":
    "AAS ya administrado (300 mg). Mantener 81–100 mg/día.",
  "2º antiplaquetário: se ICP primária → ticagrelor 180 mg OU prasugrel 60 mg — ACC/AHA 2025 recomenda ticagrelor/prasugrel PREFERENCIALMENTE ao clopidogrel na ICP (evitar prasugrel se AVC/AIT prévio, > 75a ou < 60 kg). Se fibrinólise → clopidogrel 300 mg (sem ataque e 75 mg se ≥ 75a).":
    "2.º antiplaquetario: si ICP primaria → ticagrelor 180 mg O prasugrel 60 mg — ACC/AHA 2025 recomienda ticagrelor/prasugrel PREFERENTEMENTE al clopidogrel en la ICP (evitar prasugrel si ACV/AIT previo, > 75 años o < 60 kg). Si fibrinólisis → clopidogrel 300 mg (sin carga y 75 mg si ≥ 75 años).",
  "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg, sem bolus IV) OU HNF bolus {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).":
    "Anticoagulación: enoxaparina {enoxa} mg SC cada 12 h (≥ 75 años: {enoxa75} mg, sin bolo IV) O HNF bolo {hnfBolus} U IV + {hnfInf} U/h (ajuste por TTPa).",
  "Atorvastatina 80 mg VO. Nitrato e morfina (2–4 mg) só se necessário e sem contraindicação (VD/hipotensão/PDE5).":
    "Atorvastatina 80 mg VO. Nitrato y morfina (2–4 mg) solo si es necesario y sin contraindicación (VD/hipotensión/IPDE5).",
  "Betabloqueador VO nas primeiras 24 h se SEM IC aguda, baixo débito, BAV ou broncoespasmo.":
    "Betabloqueante VO en las primeras 24 h si NO hay IC aguda, bajo gasto, BAV ni broncoespasmo.",
  "Acionar a sala de hemodinâmica imediatamente; transporte monitorizado.":
    "Activar la sala de hemodinamia de inmediato; traslado monitorizado.",
  "Confirmar dupla antiagregação e anticoagulação peri-procedimento conforme serviço.":
    "Confirmar la doble antiagregación y la anticoagulación periprocedimiento según el servicio.",
  "Manter monitorização, tratar arritmias e instabilidade durante o transporte.":
    "Mantener monitorización, tratar arritmias e inestabilidad durante el traslado.",
  "Não atrasar a ICP por exames complementares.":
    "No retrasar la ICP por exámenes complementarios.",
  "Tenecteplase (TNK) {tnk} mg IV em bolus único (≥ 75 anos: reduzir à metade → {tnkHalf} mg).":
    "Tenecteplasa (TNK) {tnk} mg IV en bolo único (≥ 75 años: reducir a la mitad → {tnkHalf} mg).",
  "Associar: clopidogrel (300 mg; 75 mg sem ataque se ≥ 75a) + enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg, sem bolus).":
    "Asociar: clopidogrel (300 mg; 75 mg sin carga si ≥ 75 años) + enoxaparina {enoxa} mg SC cada 12 h (≥ 75 años: {enoxa75} mg, sin bolo).",
  "Transferir para centro com ICP: angiografia entre 2–24 h se reperfusão bem-sucedida.":
    "Trasladar a un centro con ICP: angiografía entre 2–24 h si la reperfusión fue exitosa.",
  "ICP de resgate IMEDIATA se falha (redução do supra de ST < 50% em 60–90 min, dor ou instabilidade).":
    "ICP de rescate INMEDIATA si falla (reducción de la elevación del ST < 50% en 60–90 min, dolor o inestabilidad).",
  "Acionar transferência imediata para centro com hemodinâmica (ICP de resgate/primária).":
    "Activar el traslado inmediato a un centro con hemodinamia (ICP de rescate/primaria).",
  "Transporte monitorizado com desfibrilador; manter antitrombóticos conforme serviço.":
    "Traslado monitorizado con desfibrilador; mantener los antitrombóticos según el servicio.",
  "Comunicar a hemodinâmica de destino para reduzir o tempo até o balão.":
    "Avisar a la hemodinamia de destino para reducir el tiempo hasta el balón.",
  "Tratar instabilidade hemodinâmica/elétrica durante o transporte.":
    "Tratar la inestabilidad hemodinámica/eléctrica durante el traslado.",
  "2º antiplaquetário: ticagrelor 180 mg (manutenção 90 mg 12/12h) — preferir após definição anatômica; clopidogrel 300–600 mg como alternativa.":
    "2.º antiplaquetario: ticagrelor 180 mg (mantenimiento 90 mg cada 12 h) — preferir tras definir la anatomía; clopidogrel 300–600 mg como alternativa.",
  "ACC/AHA 2025: pré-tratamento com P2Y12 ANTES da anatomia só se a angiografia for demorar > 24 h (clopidogrel ou ticagrelor, classe 2b) — não é rotina.":
    "ACC/AHA 2025: pretratamiento con P2Y12 ANTES de conocer la anatomía solo si la angiografía se demorará > 24 h (clopidogrel o ticagrelor, clase 2b) — no es de rutina.",
  "ACC/AHA 2025: se NSTEMI tratado APENAS clinicamente (sem ICP), a dupla recomendada é AAS + TICAGRELOR (classe 1).":
    "ACC/AHA 2025: si el IAMSEST se trata SOLO clínicamente (sin ICP), la doble terapia recomendada es AAS + TICAGRELOR (clase 1).",
  "Anticoagulação: enoxaparina {enoxa} mg SC 12/12h (≥ 75a: {enoxa75} mg) OU fondaparinux 2,5 mg SC/dia OU HNF bolus {hnfBolus} U + {hnfInf} U/h.":
    "Anticoagulación: enoxaparina {enoxa} mg SC cada 12 h (≥ 75 años: {enoxa75} mg) O fondaparinux 2,5 mg SC/día O HNF bolo {hnfBolus} U + {hnfInf} U/h.",
  "Anti-isquêmico: nitrato (SL/IV) se dor/HAS/IC e sem contraindicação; betabloqueador VO se sem IC aguda/BAV/broncoespasmo.":
    "Antiisquémico: nitrato (SL/IV) si hay dolor/HTA/IC y sin contraindicación; betabloqueante VO si no hay IC aguda/BAV/broncoespasmo.",
  "Atorvastatina 80 mg VO. Morfina 2–4 mg só se dor refratária.":
    "Atorvastatina 80 mg VO. Morfina 2–4 mg solo si el dolor es refractario.",
  "Acionar a hemodinâmica imediatamente — coronariografia/ICP em < 2 h.":
    "Activar hemodinamia de inmediato — coronariografía/ICP en < 2 h.",
  "Estabilizar em paralelo: arritmias, IC aguda, choque (considerar suporte).":
    "Estabilizar en paralelo: arritmias, IC aguda, choque (considerar soporte).",
  "Manter dupla antiagregação e anticoagulação conforme o serviço.":
    "Mantener la doble antiagregación y la anticoagulación según el servicio.",
  "Transporte monitorizado com desfibrilador.": "Traslado monitorizado con desfibrilador.",
  "Programar coronariografia: < 24 h (alto risco) ou < 72 h (intermediário).":
    "Programar coronariografía: < 24 h (alto riesgo) o < 72 h (intermedio).",
  "Manter monitorização contínua, troponina e ECG seriados.":
    "Mantener monitorización continua, troponina y ECG seriados.",
  "Otimizar terapia antitrombótica e anti-isquêmica enquanto aguarda.":
    "Optimizar la terapia antitrombótica y antiisquémica mientras espera.",
  "Reclassificar para invasiva imediata se surgir instabilidade ou dor refratária.":
    "Reclasificar a invasiva inmediata si aparece inestabilidad o dolor refractario.",
  "Repetir troponina e ECG (protocolo 0 h/1 h ou 0 h/3 h) e aplicar HEART score.":
    "Repetir troponina y ECG (protocolo 0 h/1 h o 0 h/3 h) y aplicar el HEART score.",
  "Se troponina permanece negativa e HEART baixo: considerar teste não invasivo de isquemia ou angio-TC de coronárias.":
    "Si la troponina permanece negativa y el HEART es bajo: considerar una prueba no invasiva de isquemia o angio-TC coronaria.",
  "Manter AAS; só escalar antitrombóticos se confirmar SCA.":
    "Mantener AAS; escalar antitrombóticos solo si se confirma el SCA.",
  "Investigar e tratar diagnósticos diferenciais (dissecção, TEP, pericardite, causas não cardíacas).":
    "Investigar y tratar los diagnósticos diferenciales (disección, TEP, pericarditis, causas no cardíacas).",
  "1) AAS 100 mg/dia indefinidamente + 2) P2Y12 (ticagrelor 90 mg 12/12h ou prasugrel) — DAPT por 12 meses (DES). Prolongar/encurtar conforme risco isquêmico × hemorrágico.":
    "1) AAS 100 mg/día indefinidamente + 2) P2Y12 (ticagrelor 90 mg cada 12 h o prasugrel) — DAPT durante 12 meses (SLF). Prolongar/acortar según el riesgo isquémico vs hemorrágico.",
  "3) Betabloqueador (metoprolol succinato 25–200 mg/dia ou bisoprolol) — obrigatório se FE < 40% ou IC; alvo FC 55–60.":
    "3) Betabloqueante (succinato de metoprolol 25–200 mg/día o bisoprolol) — obligatorio si FE < 40% o IC; objetivo FC 55–60.",
  "4) IECA (ramipril/lisinopril) ou BRA (valsartana se intolerância) — especialmente FE < 40%, HAS, DM, DRC.":
    "4) IECA (ramipril/lisinopril) o ARA-II (valsartán si hay intolerancia) — especialmente FE < 40%, HTA, DM, ERC.",
  "5) Estatina de alta intensidade (atorvastatina 40–80 mg ou rosuvastatina 20–40 mg) já — meta LDL < 55 mg/dL (ESC); se não atingir, ezetimiba ± inibidor de PCSK9.":
    "5) Estatina de alta intensidad (atorvastatina 40–80 mg o rosuvastatina 20–40 mg) ya — meta LDL < 55 mg/dL (ESC); si no se alcanza, ezetimiba ± inhibidor de PCSK9.",
  "Antagonista de aldosterona (espironolactona/eplerenona 25–50 mg) se FE ≤ 40% + IC ou DM, sem hipercalemia (K⁺ < 5,0) nem IRA (EPHESUS).":
    "Antagonista de la aldosterona (espironolactona/eplerenona 25–50 mg) si FE ≤ 40% + IC o DM, sin hiperpotasemia (K⁺ < 5,0) ni IRA (EPHESUS).",
  "IBP durante a DAPT se ≥ 1 fator de risco de sangramento GI. NTG SL de resgate + orientação. Reabilitação cardíaca.":
    "IBP durante la DAPT si hay ≥ 1 factor de riesgo de sangrado digestivo. NTG SL de rescate + educación. Rehabilitación cardíaca.",
  "Ecocardiograma 2–4 semanas pós-IAM: se FE ≤ 35% persistente após 40 dias + NYHA II–III → avaliar CDI (MADIT-II/SCD-HeFT); FE ≤ 35% + BRE + QRS ≥ 130 → TRC-D.":
    "Ecocardiograma 2–4 semanas pos-IAM: si FE ≤ 35% persistente tras 40 días + NYHA II–III → evaluar DAI (MADIT-II/SCD-HeFT); FE ≤ 35% + BRI + QRS ≥ 130 → TRC-D.",
  "Internação em unidade coronariana/UTI com monitorização contínua de ECG, PA e SpO₂.":
    "Ingreso en unidad coronaria/UCI con monitorización continua de ECG, PA y SpO₂.",
  "Vigiar complicações: choque cardiogênico (norepi + dobutamina, ICP da culpada), IC aguda (Killip II–IV), FV/TV (desfibrilar + amiodarona), FA nova, BAV total (IAM inferior — marcapasso se sintomático), complicações mecânicas (CIV, IM aguda, ruptura — cirurgia de emergência), pericardite pós-IAM (AAS, evitar AINE/corticoide).":
    "Vigilar complicaciones: choque cardiogénico (noradrenalina + dobutamina, ICP de la arteria culpable), IC aguda (Killip II–IV), FV/TV (desfibrilar + amiodarona), FA nueva, BAV completo (IAM inferior — marcapasos si es sintomático), complicaciones mecánicas (CIV, insuficiencia mitral aguda, ruptura — cirugía de emergencia), pericarditis pos-IAM (AAS, evitar AINE/corticoide).",
  "Metas: LDL < 55, PA < 130/80, FC repouso 55–65, glicemia 140–180, K⁺ < 5,0 (se IECA + antialdosterona).":
    "Metas: LDL < 55, PA < 130/80, FC en reposo 55–65, glucemia 140–180, K⁺ < 5,0 (si IECA + antialdosterónico).",
  "Manter as 5 classes da prevenção secundária; ecocardiograma para função de VE; planejar seguimento.":
    "Mantener las 5 clases de la prevención secundaria; ecocardiograma para la función del VI; planificar el seguimiento.",
  "Troponina seriada negativa + ECG sem alterações isquêmicas + HEART baixo → observação/alta segura.":
    "Troponina seriada negativa + ECG sin alteraciones isquémicas + HEART bajo → observación/alta segura.",
  "Programar teste não invasivo de isquemia ou angio-TC de coronárias ambulatorial.":
    "Programar una prueba no invasiva de isquemia o angio-TC coronaria ambulatoria.",
  "Manter AAS; orientar retorno imediato se recorrência de dor.":
    "Mantener AAS; indicar regreso inmediato si recurre el dolor.",
  "Reavaliar e reclassificar a qualquer alteração de ECG, troponina ou instabilidade.":
    "Reevaluar y reclasificar ante cualquier cambio del ECG, la troponina o inestabilidad.",
};
