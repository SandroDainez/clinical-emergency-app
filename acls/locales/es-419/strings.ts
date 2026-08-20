/**
 * Dicionário de tradução PT→ES (espanhol latino-americano, es-419).
 * Chave = string EXATA em português (como aparece no código); valor = tradução.
 * O helper `tr()` (acls/locales/index.ts) faz o lookup; se a chave faltar,
 * cai no próprio português (nunca mostra vazio).
 *
 * Terminologia ACLS LatAm: RCP, descarga (desfibrilação), adrenalina,
 * desfibrilable/no desfibrilable, RCE (retorno da circulação espontânea),
 * UCI, H y T (Hs e Ts), vía aérea avanzada.
 */
export const ES_STRINGS: Record<string, string> = {
  // ── Títulos de estado (presentation.getStateTitle) ───────────────────────
  "Suspeita de PCR": "Sospecha de paro cardíaco",
  "Checar respiração e pulso": "Verificar respiración y pulso",
  "Pulso presente — monitorar": "Pulso presente — monitorizar",
  "INICIAR RCP agora": "INICIAR RCP ahora",
  "Manter RCP — Tipo de desfibrilador?": "Mantener RCP — ¿Tipo de desfibrilador?",
  "Pausar RCP — verificar ritmo": "Pausar RCP — verificar el ritmo",
  "Qual é o ritmo?": "¿Cuál es el ritmo?",
  "Aplicar choque bifásico": "Aplicar descarga bifásica",
  "Aplicar choque monofásico": "Aplicar descarga monofásica",
  "Aplicar 2º choque": "Aplicar 2.ª descarga",
  "Aplicar 3º choque": "Aplicar 3.ª descarga",
  "RETOMAR RCP — 1º ciclo pós-choque": "REANUDAR RCP — 1.er ciclo tras la descarga",
  "RETOMAR RCP + Epinefrina agora": "REANUDAR RCP + Adrenalina ahora",
  "RETOMAR RCP + Antiarrítmico": "REANUDAR RCP + Antiarrítmico",
  "MANTER RCP — Investigar causas reversíveis": "MANTENER RCP — Investigar causas reversibles",
  "INICIAR RCP + Epinefrina 1 mg agora": "INICIAR RCP + Adrenalina 1 mg ahora",
  "MANTER RCP — Tratar causas reversíveis": "MANTENER RCP — Tratar causas reversibles",
  "MANTER RCP — Causas reversíveis": "MANTENER RCP — Causas reversibles",
  "ROSC confirmado — Cuidados pós-parada": "RCE confirmado — Cuidados posparo",
  "Via aérea e oxigenação": "Vía aérea y oxigenación",
  "Hemodinâmica — PAM ≥ 65 mmHg": "Hemodinámica — PAM ≥ 65 mmHg",
  "ECG 12 derivações + imagem": "ECG 12 derivaciones + imagen",
  "Avaliação neurológica e temperatura": "Evaluación neurológica y temperatura",
  "Destino — UTI ou referência": "Destino — UCI o derivación",
  "Cuidados pós-parada em andamento": "Cuidados posparo en curso",
  "Atendimento encerrado": "Atención finalizada",
  // Fallback por intent
  "Aplicar choque": "Aplicar descarga",
  "Antiarrítmico IV/IO": "Antiarrítmico IV/IO",
  "Analisar ritmo": "Analizar el ritmo",
  "MANTER RCP": "MANTENER RCP",
  "Cuidados pós-ROSC": "Cuidados pos-RCE",
  "Encerrar caso": "Finalizar caso",
  // Fragmentos de título dinâmico (dose) — ver presentation.ts
  "RETOMAR RCP + Epinefrina": "REANUDAR RCP + Adrenalina",
  "dose": "dosis",
  "Epinefrina —": "Adrenalina —",
  "dose (1 mg IV/IO)": "dosis (1 mg IV/IO)",

  // ── Banner de prioridade — detalhes (presentation.getPriorityBanner) ──────
  "Estimular · pedir ajuda · acionar emergência · solicitar desfibrilador":
    "Estimular · pedir ayuda · activar emergencia · solicitar desfibrilador",
  "Máximo 10 s · dúvida = iniciar RCP · não perca tempo":
    "Máximo 10 s · duda = iniciar RCP · no pierda tiempo",
  "100–120/min · 5–6 cm · retorno completo · 30:2 sem via aérea avançada":
    "100–120/min · 5–6 cm · descompresión completa · 30:2 sin vía aérea avanzada",
  "RCP em andamento enquanto prepara · selecione abaixo":
    "RCP en curso mientras prepara · seleccione abajo",
  "Pausa mínima < 10 s · analisar monitor · retomar imediatamente após":
    "Pausa mínima < 10 s · analizar el monitor · reanudar de inmediato",
  "FV/TV = chocável · AESP/Assistolia = não chocável · pulso = ROSC":
    "FV/TV = desfibrilable · AESP/Asistolia = no desfibrilable · pulso = RCE",
  "100–120/min · 5–6 cm · retorno completo · não interromper":
    "100–120/min · 5–6 cm · descompresión completa · no interrumpir",
  "1º ciclo pós-choque · garantir acesso IV/IO · epinefrina ainda NÃO indicada":
    "1.er ciclo tras la descarga · asegurar acceso IV/IO · adrenalina AÚN no indicada",
  "Epinefrina 1 mg IV/IO agora · repetir a cada 3–5 min":
    "Adrenalina 1 mg IV/IO ahora · repetir cada 3–5 min",
  "Manter RCP de alta qualidade · investigar Hs e Ts · epinefrina a cada 3–5 min":
    "Mantener RCP de alta calidad · investigar H y T · adrenalina cada 3–5 min",
  "Epinefrina 1 mg IV/IO agora · acesso IV prioritário · iniciar imediatamente":
    "Adrenalina 1 mg IV/IO ahora · acceso IV prioritario · iniciar de inmediato",
  "Investigar Hs e Ts · epinefrina a cada 3–5 min":
    "Investigar H y T · adrenalina cada 3–5 min",
  "RCP em andamento · tratar causa identificada":
    "RCP en curso · tratar la causa identificada",
  "100–120/min · 5–6 cm · 30:2 sem via aérea avançada":
    "100–120/min · 5–6 cm · 30:2 sin vía aérea avanzada",
  "AFASTAR TODOS · carregar nas compressões · retomar RCP imediatamente após":
    "ALEJAR A TODOS · cargar durante las compresiones · reanudar RCP de inmediato",
  "Administrar agora · IV/IO em bolus · repetir a cada 3–5 min · não interromper RCP":
    "Administrar ahora · IV/IO en bolo · repetir cada 3–5 min · no interrumpir RCP",
  "Antiarrítmico — 2ª dose IV/IO": "Antiarrítmico — 2.ª dosis IV/IO",
  "Antiarrítmico — 1ª dose IV/IO": "Antiarrítmico — 1.ª dosis IV/IO",
  "Amiodarona 150 mg · ou lidocaína 0,5–0,75 mg/kg · RCP não interrompe":
    "Amiodarona 150 mg · o lidocaína 0,5–0,75 mg/kg · no interrumpir RCP",
  "Amiodarona 300 mg · ou lidocaína 1–1,5 mg/kg · RCP não interrompe":
    "Amiodarona 300 mg · o lidocaína 1–1,5 mg/kg · no interrumpir RCP",
  "PCR resolvida — seguir o guia pós-parada estruturado":
    "Paro resuelto — seguir la guía posparo estructurada",
  "Documentar condutas, desfecho e decisão médica":
    "Documentar conductas, desenlace y decisión médica",
  "Reavaliar continuamente · acionar RCP imediatamente se perder pulso":
    "Reevaluar continuamente · iniciar RCP de inmediato si pierde el pulso",
  "Manter RCP": "Mantener RCP",
  "Confirmar e avançar.": "Confirmar y avanzar.",

  // ── Detalhes do reconhecimento inicial (getIntentDetails) ─────────────────
  "Na suspeita de PCR, avaliar responsividade.":
    "Ante la sospecha de paro, evaluar la respuesta.",
  "Chamar ajuda e acionar emergência.": "Pedir ayuda y activar emergencia.",
  "Solicitar desfibrilador ou DEA.": "Solicitar desfibrilador o DEA.",

  // ── Phase notes — headings ────────────────────────────────────────────────
  "Reconhecimento rápido é essencial": "El reconocimiento rápido es esencial",
  "Dúvida sobre o pulso? Comprima.": "¿Duda sobre el pulso? Comprima.",
  "Pulso presente: monitore continuamente": "Pulso presente: monitorice de forma continua",
  "RCP de alta qualidade salva mais vidas que qualquer droga":
    "La RCP de alta calidad salva más vidas que cualquier fármaco",
  "Pausar o mínimo — e observar com atenção": "Pausar lo mínimo — y observar con atención",
  "Identificar o ritmo define o tratamento": "Identificar el ritmo define el tratamiento",
  "Reavaliação a cada 2 minutos": "Reevaluación cada 2 minutos",
  "AESP vs. Assistolia": "AESP vs. Asistolia",
  "Bifásico é o padrão atual": "El bifásico es el estándar actual",
  "Segurança antes do choque": "Seguridad antes de la descarga",
  "2º choque: epinefrina logo após o choque": "2.ª descarga: adrenalina justo después",
  "1º ciclo pós-choque: ainda não é o momento da epinefrina":
    "1.er ciclo tras la descarga: aún no es el momento de la adrenalina",
  "Epinefrina 1 mg IV/IO agora": "Adrenalina 1 mg IV/IO ahora",
  "Manter RCP de alta qualidade": "Mantener RCP de alta calidad",
  "Epinefrina precoce melhora o ROSC (AHA 2025)":
    "La adrenalina precoz mejora el RCE (AHA 2025)",
  "Investigar causas reversíveis durante cada ciclo":
    "Investigar causas reversibles en cada ciclo",
  "Hs e Ts — causas reversíveis de PCR": "H y T — causas reversibles del paro",
  "Os primeiros 60 min após ROSC são críticos":
    "Los primeros 60 min tras el RCE son críticos",
  "FiO2 100% no início — depois titule": "FiO2 100% al inicio — luego titule",
  "Hipotensão pós-ROSC dobra a mortalidade":
    "La hipotensión pos-RCE duplica la mortalidad",
  "ECG, TC e ultrassom — investigação pós-ROSC (AHA 2025)":
    "ECG, TC y ecografía — investigación pos-RCE (AHA 2025)",
  "Controle de temperatura 32–37,5 °C por ≥36 h (AHA 2025)":
    "Control de temperatura 32–37,5 °C por ≥36 h (AHA 2025)",
  "UTI com suporte completo é o destino ideal":
    "La UCI con soporte completo es el destino ideal",
  "Monitorização contínua no pós-ROSC": "Monitorización continua en el pos-RCE",
  "Documentação é responsabilidade médica": "La documentación es responsabilidad médica",
  // Phase notes context-aware (getPhaseNote)
  "1ª dose de antiarrítmico — dar durante este ciclo":
    "1.ª dosis de antiarrítmico — administrar durante este ciclo",
  "2ª e última dose de antiarrítmico — dar agora":
    "2.ª y última dosis de antiarrítmico — administrar ahora",
  "1ª dose administrada — 2ª dose só se persistir chocável":
    "1.ª dosis administrada — 2.ª dosis solo si persiste desfibrilable",
  "Antiarrítmico esgotado — manter RCP + epinefrina":
    "Antiarrítmico agotado — mantener RCP + adrenalina",
  "Após este choque: 1ª dose de antiarrítmico":
    "Tras esta descarga: 1.ª dosis de antiarrítmico",
  "Após este choque: 2ª e última dose de antiarrítmico":
    "Tras esta descarga: 2.ª y última dosis de antiarrítmico",
  "FV/TV refratária — antiarrítmico completo":
    "FV/TV refractaria — antiarrítmico completo",

  // ── Phase notes — bodies ──────────────────────────────────────────────────
  "Avalie responsividade com estímulo tátil e verbal. Gasping não é respiração efetiva. Solicite ajuda imediatamente — cada segundo sem compressão reduz a chance de sobrevida.":
    "Evalúe la respuesta con estímulo táctil y verbal. El gasping no es respiración efectiva. Pida ayuda de inmediato — cada segundo sin compresión reduce la probabilidad de supervivencia.",
  "Palpe o pulso carotídeo ou femoral por no máximo 10 s. Se houver qualquer dúvida, inicie a RCP — o risco de atrasar as compressões supera o risco de comprimir quem ainda tem pulso.":
    "Palpe el pulso carotídeo o femoral por máximo 10 s. Ante cualquier duda, inicie la RCP — el riesgo de retrasar las compresiones supera el de comprimir a quien aún tiene pulso.",
  "Esteja preparado para iniciar RCP imediatamente se houver deterioração ou perda de pulso. Mantenha o desfibrilador conectado e reavalie se surgir instabilidade.":
    "Esté listo para iniciar RCP de inmediato si hay deterioro o pérdida de pulso. Mantenga el desfibrilador conectado y reevalúe si surge inestabilidad.",
  "Comprima forte (5–6 cm), rápido (100–120/min) e solte completamente após cada compressão. Troque o compressor a cada 2 min ou antes se houver fadiga. Sem via aérea avançada: 30 compressões para 2 ventilações.":
    "Comprima fuerte (5–6 cm), rápido (100–120/min) y permita la descompresión completa tras cada compresión. Cambie al compresor cada 2 min o antes si hay fatiga. Sin vía aérea avanzada: 30 compresiones por 2 ventilaciones.",
  "Mantenha as compressões até o último momento antes da análise. O monitor deve estar conectado e ativo. Na pausa (<10 s): observe o ritmo no monitor, avalie se há movimento, tosse ou respiração espontânea. Se houver ritmo organizado no monitor, palpe o pulso imediatamente — não presuma ROSC sem confirmação.":
    "Mantenga las compresiones hasta el último momento antes del análisis. El monitor debe estar conectado y activo. En la pausa (<10 s): observe el ritmo en el monitor y evalúe si hay movimiento, tos o respiración espontánea. Si hay ritmo organizado, palpe el pulso de inmediato — no asuma RCE sin confirmación.",
  "FV e TV sem pulso são ritmos chocáveis — desfibrilação imediata. AESP e assistolia não são chocáveis — epinefrina e causa reversível. Ritmo organizado: palpe o pulso por no máximo 10 s.":
    "La FV y la TV sin pulso son ritmos desfibrilables — desfibrilación inmediata. La AESP y la asistolia no son desfibrilables — adrenalina y causa reversible. Ritmo organizado: palpe el pulso por máximo 10 s.",
  "Se persistir FV/TV, aplique novo choque. Se o ritmo mudar para AESP/assistolia, mude para o ramo não chocável. Ritmo organizado: palpe o pulso antes de confirmar ROSC.":
    "Si persiste FV/TV, aplique una nueva descarga. Si el ritmo cambia a AESP/asistolia, pase a la rama no desfibrilable. Ritmo organizado: palpe el pulso antes de confirmar RCE.",
  "AESP é ritmo organizado no monitor sem pulso palpável — pesquise causa reversível ativamente. Assistolia (linha reta) tem pior prognóstico, mas causas reversíveis ainda podem revertê-la.":
    "La AESP es un ritmo organizado en el monitor sin pulso palpable — busque la causa reversible de forma activa. La asistolia (línea recta) tiene peor pronóstico, pero las causas reversibles aún pueden revertirla.",
  "A maioria dos desfibriladores modernos é bifásica. Se não souber a carga recomendada pelo fabricante, use a carga máxima disponível — é seguro e não reduz a eficácia.":
    "La mayoría de los desfibriladores modernos son bifásicos. Si no conoce la carga recomendada por el fabricante, use la carga máxima disponible — es seguro y no reduce la eficacia.",
  "Confirme: todos afastados, ninguém em contato com o paciente, oxigênio removido da proximidade. Após o choque: retome a RCP IMEDIATAMENTE sem verificar o pulso — o ritmo de perfusão pode levar segundos para ser palpável.":
    "Confirme: todos alejados, nadie en contacto con el paciente, oxígeno retirado de la cercanía. Tras la descarga: reanude la RCP DE INMEDIATO sin verificar el pulso — el ritmo de perfusión puede tardar segundos en palparse.",
  "Após aplicar este choque, retome a RCP IMEDIATAMENTE e dê epinefrina 1 mg IV/IO durante o próximo ciclo de 2 min. É a primeira dose de epinefrina no ritmo chocável — só indicada a partir do 2º choque (AHA 2020). Afaste todos antes de aplicar o choque.":
    "Tras aplicar esta descarga, reanude la RCP DE INMEDIATO y administre adrenalina 1 mg IV/IO durante el próximo ciclo de 2 min. Es la primera dosis de adrenalina en el ritmo desfibrilable — indicada solo a partir de la 2.ª descarga (AHA 2020). Aleje a todos antes de la descarga.",
  "Confirme: todos afastados, ninguém em contato com o paciente, oxigênio removido da proximidade. Após o choque: retome a RCP IMEDIATAMENTE.":
    "Confirme: todos alejados, nadie en contacto con el paciente, oxígeno retirado de la cercanía. Tras la descarga: reanude la RCP DE INMEDIATO.",
  "Acesso: tentar veia primeiro. Se falhar, intraósseo.":
    "Acceso: intentar vena primero. Si falla, intraóseo.",
  "Use este ciclo para garantir acesso e preparar a via aérea. Acesso: tente IV primeiro (Classe 1, Nível A); se a tentativa de IV falhar ou não for viável, IO (Classe 2a, Nível A); se IV e IO falharem, acesso central por profissional treinado (Classe 2b, Nível C-LD). ⚠️ A hierarquia é de ORDEM DE TENTATIVA, não de espera: nenhuma dose atrasa por causa dela — se o IV não vem, vá ao IO e siga (operacionalização deste app; a diretriz estabelece a hierarquia e não traz ressalva de tempo). A epinefrina só está indicada no chocável a partir do 2º ciclo, após o 2º choque. ➜ AHA 2025, Parte 9 — transcrita de fonte secundária, não conferida contra o primário.":
    "Use este ciclo para asegurar acceso y preparar la vía aérea. Acceso: intente IV primero (Clase 1, Nivel A); si el intento de IV falla o no es viable, IO (Clase 2a, Nivel A); si IV e IO fallan, acceso central por profesional entrenado (Clase 2b, Nivel C-LD). ⚠️ La jerarquía es de ORDEN DE INTENTO, no de espera: ninguna dosis se retrasa por ella — si la vía IV no sale, vaya al IO y siga (operacionalización de esta app; la guía establece la jerarquía y no trae salvedad de tiempo). La adrenalina solo se indica en el ritmo desfibrilable a partir del 2.º ciclo, tras la 2.ª descarga. ➜ AHA 2025, Parte 9 — transcrita de fuente secundaria, no cotejada contra el primario.",
  "Use este ciclo para garantir acesso IV/IO e preparar a via aérea. A epinefrina só está indicada no chocável a partir do 2º ciclo (após o 2º choque), conforme AHA 2020.":
    "Use este ciclo para asegurar acceso IV/IO y preparar la vía aérea. En el ritmo desfibrilable, la adrenalina solo se indica a partir del 2.º ciclo (tras la 2.ª descarga), según AHA 2020.",
  "Repita a cada 3–5 min durante toda a ressuscitação. Considere intubação ou via aérea supraglótica para manter compressões contínuas. Mantenha a RCP de alta qualidade como prioridade.":
    "Repita cada 3–5 min durante toda la reanimación. Considere intubación o vía aérea supraglótica para mantener compresiones continuas. Priorice la RCP de alta calidad.",
  "Compressões contínuas de alta qualidade. Epinefrina a cada 3–5 min. Pesquisar causas reversíveis (Hs e Ts).":
    "Compresiones continuas de alta calidad. Adrenalina cada 3–5 min. Buscar causas reversibles (H y T).",
  "Única droga vasoativa indicada em AESP e assistolia. Acesso IV é a primeira escolha — IO aceitável se IV inviável. Meta: 1ª dose nos primeiros 3 min. Cada minuto de atraso reduz as chances de retorno da circulação.":
    "Único vasoactivo indicado en AESP y asistolia. El acceso IV es la primera opción — IO aceptable si el IV no es viable. Meta: 1.ª dosis en los primeros 3 min. Cada minuto de retraso reduce las probabilidades de retorno de la circulación.",
  "Hs: Hipovolemia · Hipóxia · Hidrogênio (acidose) · Hipo/Hipercalemia · Hipotermia.\nTs: Tensão (pneumotórax) · Tamponamento · Toxinas · Trombose pulmonar · Trombose coronária.\nEpinefrina 1 mg IV/IO a cada 3–5 min.":
    "H: Hipovolemia · Hipoxia · Hidrogeniones (acidosis) · Hipo/Hipercalemia · Hipotermia.\nT: Neumotórax a Tensión · Taponamiento · Tóxicos · Trombosis pulmonar · Trombosis coronaria.\nAdrenalina 1 mg IV/IO cada 3–5 min.",
  "Hs: Hipovolemia · Hipóxia · Hidrogênio (acidose) · Hipo/Hipercalemia · Hipotermia.\nTs: Tensão (pneumotórax hipertensivo) · Tamponamento cardíaco · Toxinas · Trombose pulmonar · Trombose coronária.":
    "H: Hipovolemia · Hipoxia · Hidrogeniones (acidosis) · Hipo/Hipercalemia · Hipotermia.\nT: Neumotórax a Tensión · Taponamiento cardíaco · Tóxicos · Trombosis pulmonar · Trombosis coronaria.",
  "Confirme ROSC: pulso palpável + pressão detectável + EtCO2 em elevação. Não interrompa o atendimento — inicie imediatamente os cuidados pós-parada estruturados.":
    "Confirme el RCE: pulso palpable + presión detectable + EtCO2 en ascenso. No interrumpa la atención — inicie de inmediato los cuidados posparo estructurados.",
  "Após confirmar SpO2 confiável, ajuste para 90–98%. Hiperventilação é prejudicial: causa hipocapnia, que provoca vasoconstrição cerebral e piora o prognóstico neurológico. Meta de EtCO2: 35–45 mmHg.":
    "Tras confirmar una SpO2 confiable, ajuste a 90–98%. La hiperventilación es perjudicial: causa hipocapnia, que provoca vasoconstricción cerebral y empeora el pronóstico neurológico. Meta de EtCO2: 35–45 mmHg.",
  "Meta: PAM ≥ 65 mmHg. Use fluidos para hipovolemia e noradrenalina como vasopressor de escolha em choque vasoplégico. Evite hipotensão mesmo transitória.":
    "Meta: PAM ≥ 65 mmHg. Use líquidos para la hipovolemia y noradrenalina como vasopresor de elección en el choque vasopléjico. Evite la hipotensión, incluso transitoria.",
  "ECG de 12 derivações: identificar supra de ST, isquemia aguda ou arritmia. Supra de ST = cateterismo de urgência sem aguardar exames adicionais.\nTC crânio-pelve: investigar etiologia e lesões da ressuscitação.\nUltrassonografia cardíaca à beira do leito: diagnósticos que exijam intervenção.":
    "ECG de 12 derivaciones: identificar supradesnivel del ST, isquemia aguda o arritmia. Supradesnivel del ST = cateterismo de urgencia sin esperar otros exámenes.\nTC cráneo-pelvis: investigar etiología y lesiones de la reanimación.\nEcografía cardíaca a pie de cama: diagnósticos que requieran intervención.",
  "Se não seguir comandos após suspensão de sedação e bloqueio neuromuscular: iniciar controle de temperatura imediatamente. Meta: 32–37,5 °C por pelo menos 36 h. Prevenir febre (>37,5 °C) é mandatório em TODOS os pacientes. Solicitar EEG se não seguir comandos. Evitar hipoglicemia e hiperglicemia.":
    "Si no obedece órdenes tras suspender la sedación y el bloqueo neuromuscular: inicie el control de temperatura de inmediato. Meta: 32–37,5 °C por al menos 36 h. Prevenir la fiebre (>37,5 °C) es obligatorio en TODOS los pacientes. Solicite EEG si no obedece órdenes. Evite la hipoglucemia y la hiperglucemia.",
  "Documente todo o atendimento: horário da parada, intervenções, evolução do ritmo, drogas administradas e número de choques. Comunique a equipe receptora com antecedência.":
    "Documente toda la atención: hora del paro, intervenciones, evolución del ritmo, fármacos administrados y número de descargas. Comunique al equipo receptor con antelación.",
  "Reavalie PA, SpO2, temperatura, glicemia e responsividade neurológica periodicamente. Ajuste o plano conforme a resposta ao tratamento e a causa identificada da parada.":
    "Reevalúe PA, SpO2, temperatura, glucemia y respuesta neurológica de forma periódica. Ajuste el plan según la respuesta al tratamiento y la causa identificada del paro.",
  "Registre: hora da parada, hora do início das intervenções, ritmos identificados, drogas e doses administradas, número de choques e a decisão de encerramento com justificativa.":
    "Registre: hora del paro, hora de inicio de las intervenciones, ritmos identificados, fármacos y dosis administradas, número de descargas y la decisión de finalización con su justificación.",
  "Amiodarona 300 mg IV/IO em bolus (1ª linha) · OU lidocaína 1–1,5 mg/kg IV/IO.\nNão atrase as compressões para administrar. Mantenha epinefrina a cada 3–5 min.\n⚠️ São permitidas apenas 2 doses no total do protocolo.":
    "Amiodarona 300 mg IV/IO en bolo (1.ª línea) · O lidocaína 1–1,5 mg/kg IV/IO.\nNo retrase las compresiones para administrar. Mantenga adrenalina cada 3–5 min.\n⚠️ Solo se permiten 2 dosis en todo el protocolo.",
  "Amiodarona 150 mg IV/IO (metade da 1ª dose) · OU lidocaína 0,5–0,75 mg/kg IV/IO.\nEsta é a última dose permitida no protocolo ACLS. Confirme acima.\nApós esta dose: não repetir antiarrítmico — manter RCP + epinefrina.":
    "Amiodarona 150 mg IV/IO (mitad de la 1.ª dosis) · O lidocaína 0,5–0,75 mg/kg IV/IO.\nEsta es la última dosis permitida en el protocolo ACLS. Confirme arriba.\nTras esta dosis: no repetir antiarrítmico — mantener RCP + adrenalina.",
  "A 2ª e última dose (amiodarona 150 mg ou lidocaína 0,5–0,75 mg/kg) só será necessária SE o ritmo permanecer em FV/TV após o próximo choque — será indicada automaticamente no ciclo de RCP seguinte.\nManter RCP de alta qualidade + epinefrina a cada 3–5 min.":
    "La 2.ª y última dosis (amiodarona 150 mg o lidocaína 0,5–0,75 mg/kg) solo será necesaria SI el ritmo permanece en FV/TV tras la próxima descarga — se indicará automáticamente en el siguiente ciclo de RCP.\nMantener RCP de alta calidad + adrenalina cada 3–5 min.",
  "Ambas as doses já foram administradas (AHA 2025 — máximo 2 doses).\nNão repetir amiodarona nem lidocaína.\nFoco: RCP de alta qualidade, epinefrina a cada 3–5 min e causas reversíveis (Hs e Ts).":
    "Ambas dosis ya fueron administradas (AHA 2025 — máximo 2 dosis).\nNo repetir amiodarona ni lidocaína.\nEnfoque: RCP de alta calidad, adrenalina cada 3–5 min y causas reversibles (H y T).",
  "Confirme segurança (todos afastados, O₂ removido). Imediatamente após: retome a RCP e administre amiodarona 300 mg IV/IO (ou lidocaína 1–1,5 mg/kg) durante o ciclo de 2 min.":
    "Confirme la seguridad (todos alejados, O₂ retirado). Inmediatamente después: reanude la RCP y administre amiodarona 300 mg IV/IO (o lidocaína 1–1,5 mg/kg) durante el ciclo de 2 min.",
  "Confirme segurança antes do choque. Imediatamente após: retome a RCP e administre amiodarona 150 mg IV/IO (metade da dose) durante o ciclo de 2 min. Esta é a última dose do protocolo.":
    "Confirme la seguridad antes de la descarga. Inmediatamente después: reanude la RCP y administre amiodarona 150 mg IV/IO (mitad de la dosis) durante el ciclo de 2 min. Esta es la última dosis del protocolo.",
  "Ambas as doses já foram administradas. Após este choque: apenas RCP de alta qualidade + epinefrina a cada 3–5 min.\nRevise causas reversíveis (Hs e Ts) e considere decisão de encerramento se indicado.":
    "Ambas dosis ya fueron administradas. Tras esta descarga: solo RCP de alta calidad + adrenalina cada 3–5 min.\nRevise causas reversibles (H y T) y considere la decisión de finalización si está indicada.",

  // ── Microcopy (ACLS_COPY) — folhas operacionais ──────────────────────────
  "Ver ritmo": "Ver ritmo",
  "Dar epinefrina": "Dar adrenalina",
  "Dar antiarrítmico": "Dar antiarrítmico",
  "Cuidar ROSC": "Cuidar RCE",
  "Agora": "Ahora",
  "Decidir": "Decidir",
  "Aguardando voz": "Esperando voz",
  "Voz captada": "Voz captada",
  "Ouvindo": "Escuchando",
  "Indisponível": "No disponible",
  "Confirmar": "Confirmar",
  "Cancelar": "Cancelar",
  "Voz": "Voz",
  "Ferramentas": "Herramientas",
  "Foco agora": "Enfoque ahora",
  "Pendências": "Pendientes",
  "Checar": "Verificar",
  "Assistente IA": "Asistente IA",
  "Modo voz": "Modo voz",
  "Ativar voz": "Activar voz",
  "Desativar voz": "Desactivar voz",
  "Voz ativa": "Voz activa",
  "Voz inativa": "Voz inactiva",
  "ACLS · Adulto": "ACLS · Adulto",
  "Foco": "Enfoque",
  "Ação principal": "Acción principal",
  "Depois": "Después",
  "Escolha ritmo": "Elegir ritmo",
  "Decida agora": "Decida ahora",
  "Registrar": "Registrar",
  "Abrir": "Abrir",
  "Ocultar": "Ocultar",
  "Comandos": "Comandos",
  "Tempo atual": "Tiempo actual",
  "Mantenha a fase.": "Mantenga la fase.",
  "Epinefrina em": "Adrenalina en",
  "Registrar via aérea": "Registrar vía aérea",
  "Ver log clínico": "Ver registro clínico",
  "Ocultar log clínico": "Ocultar registro clínico",
  "Ver histórico": "Ver historial",
  "Ocultar histórico": "Ocultar historial",
  "Ver debrief": "Ver debrief",
  "Ocultar debrief": "Ocultar debrief",
  "Painel clínico": "Panel clínico",
  "Resumo": "Resumen",
  "Atualizar": "Actualizar",
  "Atualizando": "Actualizando",
  "Apoio. Não muda.": "Apoyo. No reemplaza.",
  "Lendo o caso atual.": "Leyendo el caso actual.",
  "IA indisponível.": "IA no disponible.",
  "Registros e apoio": "Registros y apoyo",

  // ── Tela de login (app/index.tsx) ─────────────────────────────────────────
  "Entrar na plataforma": "Ingresar a la plataforma",
  "Faça login para acessar os guias e o painel administrativo.":
    "Inicie sesión para acceder a las guías y al panel administrativo.",
  "Usuário": "Usuario",
  "Admin": "Admin",
  "E-mail do administrador": "Correo del administrador",
  "E-mail": "Correo electrónico",
  "Senha do administrador": "Contraseña del administrador",
  "Senha": "Contraseña",
  "Entrar": "Ingresar",
  "Login de usuário usa e-mail/senha do Supabase Auth.":
    "El inicio de sesión de usuario usa correo/contraseña de Supabase Auth.",
  "Login admin usa conta com role=admin e status=ativo no Supabase.":
    "El inicio de sesión de admin usa una cuenta con role=admin y status=activo en Supabase.",
  "Informe e-mail e senha.": "Ingrese correo y contraseña.",
  "Supabase não configurado neste ambiente.": "Supabase no está configurado en este entorno.",
  "E-mail ou senha inválidos.": "Correo o contraseña inválidos.",
  "Não foi possível identificar o usuário autenticado.":
    "No se pudo identificar al usuario autenticado.",
  "Usuário sem perfil cadastrado no app.": "Usuario sin perfil registrado en la app.",
  "Seu acesso está pendente ou bloqueado. Fale com o administrador.":
    "Su acceso está pendiente o bloqueado. Hable con el administrador.",
  "Informe e-mail e senha de administrador.":
    "Ingrese correo y contraseña de administrador.",
  "Credenciais de administrador inválidas.": "Credenciales de administrador inválidas.",
  "Não foi possível identificar o administrador.":
    "No se pudo identificar al administrador.",
  "Administrador sem perfil cadastrado no app.":
    "Administrador sin perfil registrado en la app.",
  "Conta admin pendente ou bloqueada.": "Cuenta de administrador pendiente o bloqueada.",
  "Esta conta não tem permissão de administrador.":
    "Esta cuenta no tiene permiso de administrador.",
  "Acesse com seu e-mail e senha. O acesso de administrador é reconhecido automaticamente.":
    "Acceda con su correo y contraseña. El acceso de administrador se reconoce automáticamente.",
  "Comandos de voz indisponíveis neste dispositivo (ex.: iPhone/Safari). Use os botões da tela.":
    "Comandos de voz no disponibles en este dispositivo (ej.: iPhone/Safari). Use los botones de la pantalla.",
  "Perdeu o pulso — reiniciar RCP": "Perdió el pulso — reiniciar RCP",
  "O paciente perdeu o pulso? Isto reinicia a RCP do zero.":
    "¿El paciente perdió el pulso? Esto reinicia la RCP desde cero.",
  // Cadastro / signup
  "Criar conta": "Crear cuenta",
  "Crie sua conta. O acesso é liberado após aprovação do administrador.":
    "Cree su cuenta. El acceso se libera tras la aprobación del administrador.",
  "Nome completo": "Nombre completo",
  "Já tenho conta — entrar": "Ya tengo cuenta — ingresar",
  "Não tem conta? Criar conta": "¿No tiene cuenta? Crear cuenta",
  "Informe seu nome.": "Ingrese su nombre.",
  "Conta criada! Aguarde a aprovação do administrador para acessar.":
    "¡Cuenta creada! Espere la aprobación del administrador para acceder.",
  "A senha deve ter ao menos 6 caracteres.": "La contraseña debe tener al menos 6 caracteres.",
  "Já existe uma conta com esse e-mail.": "Ya existe una cuenta con ese correo.",
  "E-mail ainda não confirmado. Confirme pelo link enviado por e-mail ou peça ao administrador.":
    "Correo aún no confirmado. Confirme con el enlace enviado por correo o solicite al administrador.",

  // ── Hub de módulos (module-hub.tsx) ───────────────────────────────────────
  "EMERGÊNCIA": "EMERGENCIA",
  "✓ Diretrizes atualizadas": "✓ Guías actualizadas",
  "Guia de emergências": "Guía de emergencias",
  "módulos · baseado em evidências · AHA · ESC · ADA · WAO":
    "módulos · basado en evidencia · AHA · ESC · ADA · WAO",
  "🔒 7 módulos desbloqueados com o plano Pro — ver planos →":
    "🔒 7 módulos desbloqueados con el plan Pro — ver planes →",
  "MÓDULOS ACLS": "MÓDULOS ACLS",
  "★ GUIA PRINCIPAL": "★ GUIA PRINCIPAL",
  "Iniciar guia ACLS →": "Iniciar guia ACLS →",
  "mais": "más",
  "Módulo": "Módulo",
  "Sair": "Salir",
  // ── Avaliação do app ─────────────────────────────────────────────────────
  "Avaliar": "Evaluar",
  "Avaliar o app": "Evaluar la app",
  "Depois de testar o app, faça sua avaliação": "Después de probar la app, deja tu evaluación",
  "Sua opinião ajuda a melhorar — leva poucos segundos.": "Tu opinión ayuda a mejorar — toma pocos segundos.",
  "SUA OPINIÃO": "TU OPINIÓN",
  "Sua avaliação ajuda a melhorar o app. Leva poucos segundos.": "Tu evaluación ayuda a mejorar la app. Toma pocos segundos.",
  "Escolha de 1 a 5 estrelas.": "Elige de 1 a 5 estrellas.",
  "estrelas": "estrellas",
  "Comentário (opcional)": "Comentario (opcional)",
  "Enviar avaliação": "Enviar evaluación",
  "Obrigado pela avaliação!": "¡Gracias por tu evaluación!",
  "AHA · ACLS 2025": "AHA · ACLS 2025",
  "Política de privacidade": "Política de privacidad",
  "Achou um erro ou tem uma sugestão?": "¿Encontraste un error o tienes una sugerencia?",
  "Encontrou um erro ou tem sugestão? Escreva para": "¿Encontraste un error o tienes una sugerencia? Escribe a",
  "⚠ Ferramenta de apoio": "⚠ Herramienta de apoyo",
  "Conteúdo de apoio educacional e à decisão clínica, baseado nas diretrizes AHA ACLS 2025. Não substitui o julgamento clínico nem a avaliação individual do paciente. A conduta e a responsabilidade pelo atendimento são sempre do profissional de saúde assistente, que deve considerar as implicações éticas e legais.":
    "Contenido de apoyo educativo y a la decisión clínica, basado en las guías AHA ACLS 2025. No reemplaza el juicio clínico ni la evaluación individual del paciente. La conducta y la responsabilidad de la atención son siempre del profesional de salud tratante, que debe considerar las implicaciones éticas y legales.",
  // segmentos do disclaimer (caso renderizados separadamente)
  "Conteúdo de ": "Contenido de ",
  "apoio educacional e à decisão clínica": "apoyo educativo y a la decisión clínica",

  // ── Títulos e descrições dos módulos (clinical-modules.ts) ────────────────
  "PCR Adulto": "Paro Cardíaco Adulto",
  "ACLS para parada cardiorrespiratória do adulto com loop, pós-ROSC, log e resumo clínico.":
    "ACLS para el paro cardiorrespiratorio del adulto con bucle, pos-RCE, registro y resumen clínico.",
  "Ritmos de Parada": "Ritmos de Paro",
  "FV, TV sem pulso, AESP e assistolia — reconhecimento e conduta.":
    "FV, TV sin pulso, AESP y asistolia — reconocimiento y conducta.",
  "Farmacologia ACLS": "Farmacología ACLS",
  "Epinefrina, amiodarona, lidocaína e outros fármacos da parada.":
    "Adrenalina, amiodarona, lidocaína y otros fármacos del paro.",
  "Bradicardia": "Bradicardia",
  "Bradicardia instável — atropina, marca-passo e vasopressores.":
    "Bradicardia inestable — atropina, marcapasos y vasopresores.",
  "Taquicardia": "Taquicardia",
  "Taquicardia estável e instável — cardioversão e manejo.":
    "Taquicardia estable e inestable — cardioversión y manejo.",
  "Hs e Ts": "H y T",
  "5 Hs e 5 Ts — causas reversíveis de parada cardíaca.":
    "5 H y 5 T — causas reversibles del paro cardíaco.",
  "Cuidados Pós-PCR": "Cuidados Pos-Paro",
  "ROSC — metas hemodinâmicas, neurologia e destino do paciente.":
    "RCE — metas hemodinámicas, neurología y destino del paciente.",

  // ── Renderer de fluxo (acls-decision-flow-screen.tsx) ─────────────────────
  "Alta / observação domiciliar": "Alta / observación domiciliaria",
  "Observação monitorizada": "Observación monitorizada",
  "UTI / cuidado intensivo": "UCI / cuidado intensivo",
  "Transição de guia": "Transición de guía",
  "Passo": "Paso",
  "‹ Voltar": "‹ Atrás",
  "↺ Recomeçar": "↺ Reiniciar",
  "Decisão clínica": "Decisión clínica",
  "Toque para decidir": "Toque para decidir",
  "Conduta — fazer agora": "Conducta — hacer ahora",
  "Feito — continuar ›": "Hecho — continuar ›",
  "Informar — toque no valor": "Informar — toque el valor",
  "Confirmar — continuar ›": "Confirmar — continuar ›",
  "Preencha os campos": "Complete los campos",
  "Digitar valor": "Escribir valor",
  "Outro…": "Otro…",
  "Voltar": "Atrás",
  "ACLS · Emergência": "ACLS · Emergencia",
  "Bradicardia ACLS": "Bradicardia ACLS",
  "Taquicardia ACLS": "Taquicardia ACLS",
};
