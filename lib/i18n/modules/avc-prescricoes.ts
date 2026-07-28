/**
 * AVC — prescrições padrão e planos de destino. Dicionário PT → ES.
 * Cobre avc/prescriptions.ts: prescrição pré e pós-trombólise, pós-trombectomia,
 * AVC hemorrágico, sem trombólise, e critérios de transição/alta.
 */
export const ES_AVC_PRESCRICOES: Record<string, string> = {
  // ── Títulos dos conjuntos de prescrição ────────────────────────────────────
  "Pré-trombólise IV — preparo e medicações":
    "Antes de la trombólisis IV — preparación y medicaciones",
  "Pós-trombólise IV — medicações, controles e reimagem":
    "Tras la trombólisis IV — medicaciones, controles y nueva imagen",
  "Pós-trombólise IV — primeiras 24 horas":
    "Tras la trombólisis IV — primeras 24 horas",
  "UTI / unidade monitorizada — prescrição padrão pós-trombólise":
    "UCI o unidad monitorizada — prescripción estándar tras la trombólisis",
  "Pós-trombectomia / transferência — prescrição padrão":
    "Tras la trombectomía o el traslado — prescripción estándar",
  "Avaliação para trombectomia / transferência":
    "Evaluación para trombectomía o traslado",
  "AVC isquêmico com bloqueio corrigível — conduta imediata":
    "ACV isquémico con un bloqueo corregible — conducta inmediata",
  "AVC isquêmico sem trombólise IV — conduta clínica":
    "ACV isquémico sin trombólisis IV — conducta clínica",
  "AVC isquêmico sem trombólise — prescrição padrão":
    "ACV isquémico sin trombólisis — prescripción estándar",
  "AVC isquêmico — prevenção secundária e prescrição hospitalar":
    "ACV isquémico — prevención secundaria y prescripción hospitalaria",
  "AVC hemorrágico — conduta intensiva inicial":
    "ACV hemorrágico — conducta intensiva inicial",
  "AVC hemorrágico — medicações, reversão e cuidados de leito":
    "ACV hemorrágico — medicaciones, reversión y cuidados en cama",
  "AVC hemorrágico — prescrição padrão de UTI":
    "ACV hemorrágico — prescripción estándar de UCI",
  "Destino, monitorização e alta do cuidado intensivo":
    "Destino, monitorización y alta del cuidado intensivo",
  "Destino final — transição para enfermaria":
    "Destino final — transición a planta de hospitalización",
  "Destino final — alta com plano estruturado":
    "Destino final — alta con un plan estructurado",

  // ── Prescrição-base e cuidados de leito ────────────────────────────────────
  "1. Prescrição-base: cabeceira 30°, dieta zero até avaliação de deglutição, solução isotônica EV, controle rigoroso de PA, temperatura e glicemia.":
    "1. Prescripción base: cabecera a 30°, dieta absoluta hasta la evaluación de la deglución, solución isotónica IV y control riguroso de la PA, la temperatura y la glucemia.",
  "Prescrição-base das primeiras 24 h: monitor cardíaco contínuo, oximetria, cabeceira 30°, dieta zero até triagem de deglutição, solução isotônica EV e neurochecks/PA seriados.":
    "Prescripción base de las primeras 24 h: monitor cardíaco continuo, oximetría, cabecera a 30°, dieta absoluta hasta el cribado de la deglución, solución isotónica IV y controles neurológicos y de PA seriados.",
  "2. Cabeceira a 30°, monitor cardíaco se indicado, oximetria e controle seriado de PA, temperatura e glicemia.":
    "2. Cabecera a 30°, monitor cardíaco si está indicado, oximetría y control seriado de la PA, la temperatura y la glucemia.",
  "4. Cabeceira a 30°, dieta zero até avaliação de deglutição e solução isotônica EV.":
    "4. Cabecera a 30°, dieta absoluta hasta la evaluación de la deglución y solución isotónica IV.",
  "4. Cabeceira a 30°, dieta zero até triagem de deglutição e solução isotônica EV.":
    "4. Cabecera a 30°, dieta absoluta hasta el cribado de la deglución y solución isotónica IV.",
  "5. Cabeceira a 30°, repouso relativo e vigilância contínua de sangramento, angioedema orolingual, broncoaspiração e piora neurológica.":
    "5. Cabecera a 30°, reposo relativo y vigilancia continua del sangrado, el angioedema orolingual, la broncoaspiración y el empeoramiento neurológico.",
  "3. Dieta zero até triagem de deglutição; após liberação, dieta conforme via segura definida.":
    "3. Dieta absoluta hasta el cribado de la deglución; una vez autorizada, dieta según la vía segura definida.",
  "6. Dieta zero até triagem de deglutição; após liberação, dieta conforme via segura definida.":
    "6. Dieta absoluta hasta el cribado de la deglución; una vez autorizada, dieta según la vía segura definida.",
  "4. Solução isotônica EV se necessário; evitar hipotensão e hipovolemia.":
    "4. Solución isotónica IV si es necesario; evitar la hipotensión y la hipovolemia.",
  "7. Hidratação venosa: solução isotônica EV; evitar soluções glicosadas de rotina salvo indicação específica.":
    "7. Hidratación intravenosa: solución isotónica IV; evitar los sueros glucosados de rutina salvo indicación específica.",
  "Garantir 2 acessos periféricos, solução isotônica, monitor cardíaco e bomba de infusão quando aplicável.":
    "Garantizar 2 accesos periféricos, solución isotónica, monitor cardíaco y bomba de infusión cuando corresponda.",
  "Cuidados no leito monitorizado: cabeceira elevada, triagem de deglutição antes de dieta, controle de glicemia/temperatura, prevenção de broncoaspiração e mobilização conforme segurança.":
    "Cuidados en la cama monitorizada: cabecera elevada, cribado de la deglución antes de la dieta, control de la glucemia y la temperatura, prevención de la broncoaspiración y movilización según la seguridad.",
  "Manter leito monitorizado com exame neurológico seriado, triagem de deglutição, controle de PA/temperatura/glicemia e mobilização conforme segurança.":
    "Mantener la cama monitorizada con exploración neurológica seriada, cribado de la deglución, control de la PA, la temperatura y la glucemia, y movilización según la seguridad.",
  "Suporte clínico, monitorização, prevenção de complicações e reavaliação neurológica seriada.":
    "Soporte clínico, monitorización, prevención de complicaciones y reevaluación neurológica seriada.",

  // ── Monitorização neurológica ──────────────────────────────────────────────
  "2. Sinais vitais + exame neurológico/NIHSS: 15/15 min por 2 h, depois 30/30 min por 6 h, depois 1/1 h até completar 24 h.":
    "2. Signos vitales + exploración neurológica y NIHSS: cada 15 min durante 2 h, luego cada 30 min durante 6 h y después cada hora hasta completar 24 h.",
  "2. Sinais vitais + exame neurológico seriado conforme protocolo do serviço/centro de trombectomia.":
    "2. Signos vitales + exploración neurológica seriada según el protocolo del servicio o del centro de trombectomía.",
  "2. Sinais vitais + exame neurológico seriados; vigiar rebaixamento da consciência, sinais de hipertensão intracraniana e expansão do hematoma.":
    "2. Signos vitales + exploración neurológica seriados; vigilar el deterioro de la consciencia, los signos de hipertensión intracraneal y la expansión del hematoma.",
  "Destino preferencial em unidade de AVC ou UTI com exame neurológico e PA seriados.":
    "Destino preferente en una unidad de ictus o en la UCI con exploración neurológica y PA seriadas.",
  "Internação preferencial em UTI / neurointensivismo com monitorização neurológica e hemodinâmica contínuas.":
    "Ingreso preferente en UCI o neurocríticos con monitorización neurológica y hemodinámica continuas.",

  // ── Controle pressórico ────────────────────────────────────────────────────
  "Se PA estiver acima da meta, usar anti-hipertensivo IV do protocolo institucional antes do bolus/infusão.":
    "Si la PA está por encima de la meta, usar el antihipertensivo IV del protocolo institucional antes del bolo o la infusión.",
  "Meta pressórica pós-trombólise: manter PA < 180/105 mmHg por pelo menos 24 h; tratar qualquer elevação prontamente.":
    "Meta tensional tras la trombólisis: mantener la PA < 180/105 mmHg durante al menos 24 h; tratar cualquier elevación de inmediato.",
  "Controle pressórico pós-trombólise: meta < 180/105 mmHg; se acima da meta, usar anti-hipertensivo EV do protocolo institucional. Na prática brasileira, costuma-se discutir nitroglicerina em bomba e/ou metoprolol EV lento; se refratária, considerar nitroprussiato com monitorização rigorosa.":
    "Control tensional tras la trombólisis: meta < 180/105 mmHg; si está por encima, usar el antihipertensivo IV del protocolo institucional. En la práctica brasileña se suele plantear nitroglicerina en bomba o metoprolol IV lento; si es refractaria, considerar el nitroprusiato con monitorización rigurosa.",
  "3. Se recebeu trombólise IV associada: manter PA < 180/105 mmHg por pelo menos 24 h.":
    "3. Si recibió trombólisis IV asociada: mantener la PA < 180/105 mmHg durante al menos 24 h.",
  "3. Se não recebeu trombólise IV: manter PA conforme protocolo pós-trombectomia do serviço, evitando hipotensão e reduções excessivas.":
    "3. Si no recibió trombólisis IV: mantener la PA según el protocolo posterior a la trombectomía del servicio, evitando la hipotensión y las reducciones excesivas.",
  "3. Controle pressórico com titulação cuidadosa; em geral, se PAS inicial 150-220 mmHg, perseguir redução rápida e sustentada para cerca de 140 mmHg, evitando queda excessiva e variabilidade ampla.":
    "3. Control tensional con titulación cuidadosa; en general, con una PAS inicial de 150-220 mmHg, buscar una reducción rápida y sostenida hasta cerca de 140 mmHg, evitando una caída excesiva y una variabilidad amplia.",
  "2. Anti-hipertensivo EV conforme protocolo local para meta pressórica do caso; priorizar controle suave e sustentado. Se o serviço utiliza beta-bloqueador EV: metoprolol 5 mg EV lento pode ser repetido conforme resposta. Em casos refratários e monitorizados, considerar nitroprussiato em bomba.":
    "2. Antihipertensivo IV según el protocolo local para la meta tensional del caso; priorizar un control suave y sostenido. Si el servicio usa betabloqueante IV: el metoprolol 5 mg IV lento puede repetirse según la respuesta. En casos refractarios y monitorizados, considerar el nitroprusiato en bomba.",
  "2. Anti-hipertensivo EV se PA acima da meta: metoprolol 5 mg EV lento, repetir a cada 10 min até dose total de 20 mg conforme resposta e protocolo local; se refratária, considerar nitroprussiato 0,5-8 mcg/kg/min em bomba com monitorização rigorosa.":
    "2. Antihipertensivo IV si la PA está por encima de la meta: metoprolol 5 mg IV lento, repetible cada 10 min hasta una dosis total de 20 mg según la respuesta y el protocolo local; si es refractaria, considerar nitroprusiato 0,5-8 mcg/kg/min en bomba con monitorización rigurosa.",
  "4. Se PA > 180/105 mmHg: tratar imediatamente com anti-hipertensivo IV protocolizado; na prática brasileira, discutir nitroglicerina em bomba e/ou metoprolol 5 mg EV lento, podendo repetir conforme protocolo local. Se refratária, considerar nitroprussiato com monitorização rigorosa.":
    "4. Si la PA > 180/105 mmHg: tratarla de inmediato con el antihipertensivo IV protocolizado; en la práctica brasileña se plantea nitroglicerina en bomba o metoprolol 5 mg IV lento, repetible según el protocolo local. Si es refractaria, considerar el nitroprusiato con monitorización rigurosa.",
  "Controlar PA conforme meta institucional para hemorragia intracraniana e tratar deterioração neurológica imediatamente.":
    "Controlar la PA según la meta institucional para la hemorragia intracraneal y tratar el deterioro neurológico de inmediato.",

  // ── Metas clínicas e glicemia ──────────────────────────────────────────────
  "5. Meta clínica: SpO2 > 94%, temperatura < 38 °C, glicemia preferencialmente 140-180 mg/dL e correção imediata se < 60 mg/dL.":
    "5. Meta clínica: SpO₂ > 94%, temperatura < 38 °C, glucemia preferentemente de 140-180 mg/dL y corrección inmediata si es < 60 mg/dL.",
  "8. Metas clínicas: SpO2 > 94%, temperatura < 38 °C, glicemia preferencialmente 140-180 mg/dL; corrigir imediatamente se glicemia < 60 mg/dL.":
    "8. Metas clínicas: SpO₂ > 94%, temperatura < 38 °C, glucemia preferentemente de 140-180 mg/dL; corregirla de inmediato si es < 60 mg/dL.",
  "3. Controle glicêmico prático entre 140-180 mg/dL; tratar hipoglicemia imediatamente e evitar controle excessivamente intensivo. Se hiperglicemia importante persistente, usar insulina regular SC pela escala do hospital ou EV em bomba se necessário.":
    "3. Control glucémico práctico entre 140-180 mg/dL; tratar la hipoglucemia de inmediato y evitar un control excesivamente intensivo. Si persiste una hiperglucemia importante, usar insulina regular subcutánea según la escala del hospital o IV en bomba si es necesario.",
  "7. Controle glicêmico prático entre 140-180 mg/dL; para hiperglicemia importante, usar insulina regular SC pela escala do hospital ou bomba EV 0,05-0,1 U/kg/h se controle fino for necessário.":
    "7. Control glucémico práctico entre 140-180 mg/dL; ante una hiperglucemia importante, usar insulina regular subcutánea según la escala del hospital o en bomba IV a 0,05-0,1 U/kg/h si se necesita un control fino.",
  "10. Controle glicêmico prático entre 140-180 mg/dL; para hiperglicemia persistente importante, insulina regular SC pela escala do hospital ou bomba EV 0,05-0,1 U/kg/h se necessário.":
    "10. Control glucémico práctico entre 140-180 mg/dL; ante una hiperglucemia persistente importante, insulina regular subcutánea según la escala del hospital o en bomba IV a 0,05-0,1 U/kg/h si es necesario.",

  // ── Antitrombóticos e restrições das 24 h ──────────────────────────────────
  "1. Após 24 h e neuroimagem de controle sem hemorragia: iniciar antiagregante. Esquema prático comum: AAS 100-300 mg/dia, depois manutenção 81-100 mg/dia.":
    "1. Tras 24 h y una neuroimagen de control sin hemorragia: iniciar el antiagregante. Esquema práctico habitual: ácido acetilsalicílico 100-300 mg/día y después mantenimiento con 81-100 mg/día.",
  "1. Sem trombólise: manter AAS após ataque inicial 160-300 mg, seguindo com 81-100 mg/dia se essa for a estratégia definida.":
    "1. Sin trombólisis: mantener el ácido acetilsalicílico tras una dosis de carga inicial de 160-300 mg, continuando con 81-100 mg/día si esa es la estrategia definida.",
  "4. Após 24 h e TC/RM de controle sem sangramento: liberar antiagregante/prevenção secundária conforme neurologia e etiologia. Esquema prático frequente: AAS 100-300 mg/dia, depois manutenção 81-100 mg/dia; clopidogrel 75 mg/dia apenas se estratégia alternativa/etiológica definida.":
    "4. Tras 24 h y una TC o RM de control sin sangrado: autorizar el antiagregante y la prevención secundaria según neurología y la etiología. Esquema práctico frecuente: ácido acetilsalicílico 100-300 mg/día y después mantenimiento con 81-100 mg/día; clopidogrel 75 mg/día solo si se define una estrategia alternativa o etiológica.",
  "6. Se não recebeu trombólise e não houver contraindicação: iniciar AAS 160-300 mg VO/VR nas primeiras 24-48 h; depois manutenção habitual 81-100 mg/dia.":
    "6. Si no recibió trombólisis y no hay contraindicación: iniciar ácido acetilsalicílico 160-300 mg por vía oral o rectal en las primeras 24-48 h; después el mantenimiento habitual de 81-100 mg/día.",
  "7. Em AVC/TIA menor selecionado e sem trombólise, DAPT curta pode ser discutida com neurologia: por exemplo AAS + clopidogrel 75 mg/dia por 21 dias, seguindo protocolo institucional.":
    "7. En el ACV o el AIT menor seleccionado y sin trombólisis, se puede plantear con neurología una doble antiagregación corta: por ejemplo ácido acetilsalicílico + clopidogrel 75 mg/día durante 21 días, siguiendo el protocolo institucional.",
  "3. Não prescrever AAS, clopidogrel, heparina profilática ou anticoagulação terapêutica nas primeiras 24 h.":
    "3. No prescribir ácido acetilsalicílico, clopidogrel, heparina profiláctica ni anticoagulación terapéutica en las primeras 24 h.",
  "6. Não iniciar AAS, clopidogrel, heparina ou anticoagulação terapêutica antes de 24 h e imagem de controle liberadora.":
    "6. No iniciar ácido acetilsalicílico, clopidogrel, heparina ni anticoagulación terapéutica antes de 24 h y de una imagen de control que lo autorice.",
  "6. Não iniciar antiagregante, anticoagulante terapêutico ou heparina profilática até estabilidade clínica/radiológica e definição especializada.":
    "6. No iniciar antiagregante, anticoagulante terapéutico ni heparina profiláctica hasta que haya estabilidad clínica y radiológica y una definición especializada.",
  "10. Não prescrever antes de 24 h e TC de controle liberadora: AAS, clopidogrel, heparina, profilaxia farmacológica para TEV ou anticoagulação terapêutica.":
    "10. No prescribir antes de 24 h y de una TC de control que lo autorice: ácido acetilsalicílico, clopidogrel, heparina, profilaxis farmacológica de la enfermedad tromboembólica venosa ni anticoagulación terapéutica.",
  "Restrições críticas: não prescrever AAS, clopidogrel, heparina, profilaxia farmacológica para TEV ou anticoagulação terapêutica antes de 24 h e TC de controle liberadora.":
    "Restricciones críticas: no prescribir ácido acetilsalicílico, clopidogrel, heparina, profilaxis farmacológica de la enfermedad tromboembólica venosa ni anticoagulación terapéutica antes de 24 h y de una TC de control que lo autorice.",
  "Não iniciar AAS, clopidogrel, heparina ou anticoagulante antes da reimagem de controle em 24 h.":
    "No iniciar ácido acetilsalicílico, clopidogrel, heparina ni anticoagulante antes de la nueva imagen de control a las 24 h.",
  "Não iniciar antiagregante, anticoagulante ou heparina profilática antes de 24 h e imagem de controle liberadora.":
    "No iniciar antiagregante, anticoagulante ni heparina profiláctica antes de 24 h y de una imagen de control que lo autorice.",
  "2. Se houver indicação cardioembólica (ex.: FA), anticoagulação oral não é iniciada de rotina na fase hiperaguda; programar início conforme tamanho do infarto, risco hemorrágico e imagem de controle.":
    "2. Si hay indicación cardioembólica (p. ej., fibrilación auricular), la anticoagulación oral no se inicia de rutina en la fase hiperaguda; programar el inicio según el tamaño del infarto, el riesgo hemorrágico y la imagen de control.",
  "6. Definir antitrombótico/prevenção secundária após imagem de controle e estratégia final da neurologia/intervenção.":
    "6. Definir el antitrombótico y la prevención secundaria tras la imagen de control y la estrategia final de neurología o del equipo de intervención.",
  "Considerar antitrombótico/prevenção secundária apenas quando permitido e após excluir contraindicações específicas.":
    "Considerar el antitrombótico y la prevención secundaria solo cuando esté permitido y tras descartar contraindicaciones específicas.",
  "Se pós-trombólise, manter as restrições de 24 h e só iniciar antiagregante/anticoagulação após imagem de controle.":
    "Si es tras la trombólisis, mantener las restricciones de 24 h e iniciar el antiagregante o la anticoagulación solo tras la imagen de control.",
  "Sem trombólise, consolidar rapidamente o plano antitrombótico e o destino subsequente conforme estabilidade clínica.":
    "Sin trombólisis, consolidar rápidamente el plan antitrombótico y el destino posterior según la estabilidad clínica.",

  // ── Profilaxia de TEV ──────────────────────────────────────────────────────
  "3. Profilaxia farmacológica de TEV, se indicada, não substitui anticoagulação plena para prevenção secundária cardioembólica.":
    "3. La profilaxis farmacológica de la enfermedad tromboembólica venosa, si está indicada, no sustituye a la anticoagulación plena para la prevención secundaria cardioembólica.",
  "6. Se o paciente estiver imobilizado e a neuroimagem de 24 h estiver estável: considerar profilaxia de TEV com enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h, conforme risco hemorrágico e protocolo do serviço.":
    "6. Si el paciente está inmovilizado y la neuroimagen de las 24 h es estable: considerar la profilaxis de la enfermedad tromboembólica venosa con enoxaparina 40 mg subcutánea una vez al día o heparina no fraccionada 5.000 UI subcutánea cada 8-12 h, según el riesgo hemorrágico y el protocolo del servicio.",
  "7. Se o paciente estiver restrito ao leito: compressão pneumática desde a admissão; após 24-48 h, se a TC mostrar estabilidade e houver concordância da neurologia/neurocirurgia, pode ser considerada enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h.":
    "7. Si el paciente está encamado: compresión neumática desde el ingreso; tras 24-48 h, si la TC muestra estabilidad y hay acuerdo de neurología o neurocirugía, puede considerarse enoxaparina 40 mg subcutánea una vez al día o heparina no fraccionada 5.000 UI subcutánea cada 8-12 h.",
  "8. Se estiver imobilizado e sem contraindicação: compressão pneumática e, quando o risco hemorrágico permitir, enoxaparina 40 mg SC 1x/dia ou heparina não fracionada 5.000 UI SC 8/8-12/12 h.":
    "8. Si está inmovilizado y sin contraindicación: compresión neumática y, cuando el riesgo hemorrágico lo permita, enoxaparina 40 mg subcutánea una vez al día o heparina no fraccionada 5.000 UI subcutánea cada 8-12 h.",
  "9. Profilaxia de TEV: compressão pneumática intermitente desde a admissão; heparina profilática só após estabilidade clínica/imagem e discussão com neurologia/neurocirurgia.":
    "9. Profilaxis de la enfermedad tromboembólica venosa: compresión neumática intermitente desde el ingreso; heparina profiláctica solo tras la estabilidad clínica y de imagen, y previa discusión con neurología o neurocirugía.",

  // ── Estatina e prevenção secundária ────────────────────────────────────────
  "4. Considerar estatina de alta intensidade ainda na internação: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite.":
    "4. Considerar una estatina de alta intensidad ya durante el ingreso: atorvastatina 40-80 mg por la noche o rosuvastatina 20-40 mg por la noche.",
  "5. Considerar estatina de alta intensidade após a imagem de controle: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite, salvo contraindicação ou outro plano etiológico.":
    "5. Considerar una estatina de alta intensidad tras la imagen de control: atorvastatina 40-80 mg por la noche o rosuvastatina 20-40 mg por la noche, salvo contraindicación u otro plan etiológico.",
  "9. Iniciar estatina de alta intensidade: atorvastatina 40-80 mg/noite ou rosuvastatina 20-40 mg/noite, salvo contraindicação ou outro plano etiológico.":
    "9. Iniciar una estatina de alta intensidad: atorvastatina 40-80 mg por la noche o rosuvastatina 20-40 mg por la noche, salvo contraindicación u otro plan etiológico.",

  // ── Reversão de anticoagulação ─────────────────────────────────────────────
  "4. Rever exposição a anticoagulantes/antiagregantes no prontuário e com família; se houver uso, discutir reversão específica imediatamente.":
    "4. Revisar la exposición a anticoagulantes y antiagregantes en la historia clínica y con la familia; si los usa, plantear la reversión específica de inmediato.",
  "5. Revisar imediatamente uso de anticoagulantes/antiagregantes e providenciar reversão específica quando indicada.":
    "5. Revisar de inmediato el uso de anticoagulantes y antiagregantes, y disponer la reversión específica cuando esté indicada.",
  "5. Exemplos práticos de reversão: varfarina -> complexo protrombínico 4 fatores + vitamina K 10 mg EV; dabigatrana -> idarucizumabe 5 g EV; inibidores do fator Xa -> andexanet alfa se disponível ou complexo protrombínico conforme protocolo.":
    "5. Ejemplos prácticos de reversión: warfarina → concentrado de complejo protrombínico de 4 factores + vitamina K 10 mg IV; dabigatrán → idarucizumab 5 g IV; inhibidores del factor Xa → andexanet alfa si está disponible o concentrado de complejo protrombínico según el protocolo.",
  "Revisar anticoagulantes/antiagregantes e considerar reversão específica quando aplicável.":
    "Revisar los anticoagulantes y antiagregantes, y considerar la reversión específica cuando corresponda.",

  // ── Neuroimagem de controle ────────────────────────────────────────────────
  "5. Revisar neuroimagem de controle conforme protocolo local ou imediatamente se houver piora neurológica.":
    "5. Revisar la neuroimagen de control según el protocolo local o de inmediato si hay empeoramiento neurológico.",
  "6. Solicitar TC de controle/seriada nas primeiras 24 h conforme evolução e imediatamente se houver piora neurológica.":
    "6. Solicitar una TC de control o seriada en las primeras 24 h según la evolución, y de inmediato si hay empeoramiento neurológico.",
  "8. Solicitar neuroimagem de controle conforme protocolo do centro, e imediatamente se houver piora neurológica ou suspeita de reperfusão complicada.":
    "8. Solicitar la neuroimagen de control según el protocolo del centro, y de inmediato si hay empeoramiento neurológico o sospecha de una reperfusión complicada.",
  "9. Repetir TC imediatamente se cefaleia, vômitos, anisocoria, queda do nível de consciência, nova crise convulsiva ou piora neurológica.":
    "9. Repetir la TC de inmediato si hay cefalea, vómitos, anisocoria, descenso del nivel de consciencia, una nueva crisis convulsiva o empeoramiento neurológico.",
  "11. Solicitar TC de crânio em 24 h; repetir imediatamente se cefaleia intensa, náusea/vômitos, piora neurológica ou elevação sustentada da PA.":
    "11. Solicitar una TC de cráneo a las 24 h; repetirla de inmediato si hay cefalea intensa, náuseas o vómitos, empeoramiento neurológico o una elevación sostenida de la PA.",
  "11. Neuroimagem de controle não precisa ser rotineira em todo caso estável, mas deve ser repetida imediatamente se houver piora neurológica; em infartos extensos/edema importante, seguir reimagem programada da neurologia.":
    "11. La neuroimagen de control no tiene que ser rutinaria en todo caso estable, pero debe repetirse de inmediato si hay empeoramiento neurológico; en los infartos extensos o con edema importante, seguir la reimagen programada por neurología.",
  "Repetir TC/RM de controle em 24 h ou antes se houver piora neurológica, cefaleia intensa, náusea/vômitos ou suspeita de sangramento.":
    "Repetir la TC o la RM de control a las 24 h, o antes si hay empeoramiento neurológico, cefalea intensa, náuseas o vómitos, o sospecha de sangrado.",
  "Solicitar TC de controle em 24 h e repetir imediatamente se houver cefaleia intensa, náusea/vômitos, rebaixamento, piora do NIHSS, nova hipertensão sustentada ou qualquer suspeita de sangramento.":
    "Solicitar una TC de control a las 24 h y repetirla de inmediato si hay cefalea intensa, náuseas o vómitos, deterioro del sensorio, empeoramiento del NIHSS, una nueva hipertensión sostenida o cualquier sospecha de sangrado.",

  // ── Exames de controle ─────────────────────────────────────────────────────
  "5. Solicitar ECG/telemetria, investigação vascular/cardiogênica, perfil lipídico e HbA1c conforme protocolo da unidade de AVC.":
    "5. Solicitar ECG o telemetría, estudio vascular y cardiológico, perfil lipídico y HbA1c según el protocolo de la unidad de ictus.",
  "8. Exames de controle frequentes: glicemia capilar seriada, hemograma/coagulograma se suspeita hemorrágica, creatinina/eletrólitos conforme suporte clínico, além de TC/RM em 24 h obrigatória.":
    "8. Exámenes de control frecuentes: glucemia capilar seriada, hemograma y coagulograma si se sospecha sangrado, creatinina y electrolitos según el soporte clínico, además de la TC o RM obligatoria a las 24 h.",
  "8. Exames de controle: hemograma, coagulograma, função renal, eletrólitos, glicemia seriada e TC de controle nas primeiras 24 h ou antes se piora clínica.":
    "8. Exámenes de control: hemograma, coagulograma, función renal, electrolitos, glucemia seriada y TC de control en las primeras 24 h o antes si hay empeoramiento clínico.",
  "12. Exames de controle úteis na internação: ECG/telemetria, HbA1c, perfil lipídico, creatinina/eletrólitos e investigação vascular/cardioembólica conforme hipótese etiológica.":
    "12. Exámenes de control útiles durante el ingreso: ECG o telemetría, HbA1c, perfil lipídico, creatinina y electrolitos, y estudio vascular y cardioembólico según la hipótesis etiológica.",

  // ── Procedimentos invasivos e complicações ─────────────────────────────────
  "9. Evitar nas primeiras 24 h: punção arterial, acesso central, SNG/SNE, sonda vesical e outros procedimentos invasivos, salvo necessidade incontornável.":
    "9. Evitar en las primeras 24 h: la punción arterial, el acceso central, la sonda nasogástrica o nasoentérica, la sonda vesical y otros procedimientos invasivos, salvo necesidad ineludible.",
  "Evitar punções arteriais/venosas desnecessárias, SNG, sonda vesical e procedimentos invasivos se não forem indispensáveis.":
    "Evitar las punciones arteriales y venosas innecesarias, la sonda nasogástrica, la sonda vesical y los procedimientos invasivos si no son indispensables.",
  "12. Se angioedema pós-alteplase: suspender infusão se ainda em curso, proteger via aérea e tratar conforme protocolo institucional de reação/edema orolingual.":
    "12. Si aparece angioedema tras la alteplasa: suspender la infusión si sigue en curso, proteger la vía aérea y tratarlo según el protocolo institucional de reacción o edema orolingual.",
  "7. Vigiar complicações de punção arterial, transformação hemorrágica, broncoaspiração, febre e hiperglicemia.":
    "7. Vigilar las complicaciones de la punción arterial, la transformación hemorrágica, la broncoaspiración, la fiebre y la hiperglucemia.",
  "Vigiar sinais de alarme: transformação hemorrágica, angioedema orolingual, broncoaspiração, hipoxemia e hipertensão refratária.":
    "Vigilar los signos de alarma: transformación hemorrágica, angioedema orolingual, broncoaspiración, hipoxemia e hipertensión refractaria.",
  "Manter vigilância para piora neurológica, broncoaspiração, febre, hipoxemia e descompensação hemodinâmica.":
    "Mantener la vigilancia del empeoramiento neurológico, la broncoaspiración, la fiebre, la hipoxemia y la descompensación hemodinámica.",
  "Sinais de alerta que exigem reavaliação imediata: piora neurológica, sangramento externo, angioedema orolingual, queda de saturação, broncoaspiração, PA refratária ou suspeita de transformação hemorrágica.":
    "Signos de alarma que exigen una reevaluación inmediata: empeoramiento neurológico, sangrado externo, angioedema orolingual, descenso de la saturación, broncoaspiración, PA refractaria o sospecha de transformación hemorrágica.",
  "8. Não usar profilaxia anticonvulsivante de rotina se não houver crise clínica/eletrográfica documentada, salvo indicação especializada.":
    "8. No usar profilaxis anticonvulsiva de rutina si no hay una crisis clínica o electrográfica documentada, salvo indicación especializada.",

  // ── Acionamento de equipe e neurocirurgia ──────────────────────────────────
  "9. Acionar equipe médica imediatamente se piora neurológica, rebaixamento da consciência, novo déficit, sangramento no sítio de punção ou instabilidade hemodinâmica.":
    "9. Avisar al equipo médico de inmediato si hay empeoramiento neurológico, deterioro de la consciencia, un déficit nuevo, sangrado en el sitio de punción o inestabilidad hemodinámica.",
  "13. Acionar equipe médica imediatamente se rebaixamento do nível de consciência, sangramento, PA refratária, queda de saturação ou suspeita de transformação hemorrágica.":
    "13. Avisar al equipo médico de inmediato si hay deterioro del nivel de consciencia, sangrado, PA refractaria, descenso de la saturación o sospecha de transformación hemorrágica.",
  "15. Acionar equipe médica imediatamente se piora neurológica, broncoaspiração, febre persistente, hipoxemia ou instabilidade hemodinâmica.":
    "15. Avisar al equipo médico de inmediato si hay empeoramiento neurológico, broncoaspiración, fiebre persistente, hipoxemia o inestabilidad hemodinámica.",
  "7. Acionar neurocirurgia/neurointensivismo diante de IVH, hidrocefalia, efeito de massa, hematoma expansivo ou deterioração clínica.":
    "7. Avisar a neurocirugía o a neurocríticos ante una hemorragia intraventricular, hidrocefalia, efecto de masa, hematoma expansivo o deterioro clínico.",
  "10. Acionar neurocirurgia/neurointensivismo para avaliação de derivação, drenagem, descompressão ou monitorização invasiva quando houver indicação clínica/radiológica.":
    "10. Avisar a neurocirugía o a neurocríticos para valorar una derivación, un drenaje, una descompresión o la monitorización invasiva cuando haya indicación clínica o radiológica.",
  "9. Se cefaleia súbita, vômitos, piora do NIHSS, rebaixamento ou nova hipertensão sustentada: interromper progressão do plano e repetir neuroimagem imediatamente.":
    "9. Ante cefalea súbita, vómitos, empeoramiento del NIHSS, deterioro del sensorio o una nueva hipertensión sostenida: detener la progresión del plan y repetir la neuroimagen de inmediato.",
  "Acionar neurologia/intervenção e registrar horário de decisão.":
    "Avisar a neurología o al equipo de intervención y registrar la hora de la decisión.",
  "Organizar transferência imediata quando não houver hemodinâmica/neurointervenção local.":
    "Organizar el traslado inmediato cuando no haya hemodinámica ni neurointervención en el centro.",
  "Manter suporte hemodinâmico e via aérea durante a janela de transferência.":
    "Mantener el soporte hemodinámico y la vía aérea durante la ventana del traslado.",

  // ── Reabilitação e deglutição ──────────────────────────────────────────────
  "6. Prescrever triagem de deglutição, fisioterapia motora precoce quando seguro, prevenção de broncoaspiração e mobilização com metas documentadas.":
    "6. Prescribir el cribado de la deglución, la fisioterapia motora precoz cuando sea seguro, la prevención de la broncoaspiración y la movilización con metas documentadas.",
  "13. Solicitar avaliação funcional, triagem de deglutição e plano de reabilitação conforme estabilidade clínica.":
    "13. Solicitar una evaluación funcional, el cribado de la deglución y un plan de rehabilitación según la estabilidad clínica.",
  "Garantir triagem de deglutição, avaliação funcional e seguimento neurológico definidos antes da saída.":
    "Garantizar el cribado de la deglución, la evaluación funcional y el seguimiento neurológico definidos antes de la salida.",
  "Deixar explícitos prevenção de broncoaspiração, mobilização segura, reabilitação e prevenção secundária já iniciadas.":
    "Dejar explícitas la prevención de la broncoaspiración, la movilización segura, la rehabilitación y la prevención secundaria ya iniciadas.",

  // ── Permanência, transição e alta ──────────────────────────────────────────
  "10. Permanência mínima prática: 24 h em leito monitorizado/UTI; depois transição para unidade de AVC se exame neurológico, PA e reimagem estiverem estáveis.":
    "10. Estancia mínima práctica: 24 h en cama monitorizada o UCI; después, transición a la unidad de ictus si la exploración neurológica, la PA y la nueva imagen están estables.",
  "10. Permanência prática: muitas vezes pelo menos 48-72 h em UTI/neurointensivismo, prolongando se houver drenagem, rebaixamento, hidrocefalia, expansão hematoma ou necessidade de suporte avançado.":
    "10. Estancia práctica: a menudo al menos 48-72 h en UCI o neurocríticos, prolongándola si hay drenaje, deterioro del sensorio, hidrocefalia, expansión del hematoma o necesidad de soporte avanzado.",
  "14. Permanência prática: em geral 24-72 h em unidade monitorizada/unidade de AVC se estável; prolongar se NIHSS alto, disfagia importante, piora neurológica ou investigação pendente.":
    "14. Estancia práctica: en general 24-72 h en unidad monitorizada o unidad de ictus si está estable; prolongarla si el NIHSS es alto, hay disfagia importante, empeoramiento neurológico o estudio pendiente.",
  "Pós-trombólise: manter permanência mínima de 24 h em unidade monitorizada/UTI, prolongando se houver transformação hemorrágica, piora neurológica, PA instável ou necessidade de suporte avançado.":
    "Tras la trombólisis: mantener una estancia mínima de 24 h en unidad monitorizada o UCI, prolongándola si hay transformación hemorrágica, empeoramiento neurológico, PA inestable o necesidad de soporte avanzado.",
  "Tempo médio em unidade monitorizada depende da estabilidade clínica, da necessidade de investigação e do risco de deterioração neurológica.":
    "El tiempo medio en la unidad monitorizada depende de la estabilidad clínica, de la necesidad de estudio y del riesgo de deterioro neurológico.",
  "7. Definir antes da alta da unidade monitorizada: antitrombótico, alvo pressórico, controle glicêmico e seguimento ambulatorial/rehab.":
    "7. Definir antes del alta de la unidad monitorizada: el antitrombótico, el objetivo tensional, el control glucémico y el seguimiento ambulatorio y de rehabilitación.",
  "Critérios de alta da UTI/unidade monitorizada: exame neurológico estável, PA/glicemia controladas, sem necessidade de suporte avançado e plano de prevenção secundária/destino já definido.":
    "Criterios de alta de la UCI o unidad monitorizada: exploración neurológica estable, PA y glucemia controladas, sin necesidad de soporte avanzado y con el plan de prevención secundaria y el destino ya definidos.",
  "Transferir da vigilância intensiva apenas com exame neurológico estável, PA/glicemia controladas e sem necessidade de suporte avançado.":
    "Trasladar desde la vigilancia intensiva solo con la exploración neurológica estable, la PA y la glucemia controladas y sin necesidad de soporte avanzado.",
  "Transferir o cuidado já com metas das próximas 24 h, prevenção secundária e investigação etiológica explicitadas.":
    "Transferir el cuidado ya con las metas de las próximas 24 h, la prevención secundaria y el estudio etiológico explicitados.",
  "Após trombólise, a transição exige 24 h completas de monitorização, imagem de controle e liberação para iniciar antitrombótico conforme protocolo.":
    "Tras la trombólisis, la transición exige 24 h completas de monitorización, una imagen de control y la autorización para iniciar el antitrombótico según el protocolo.",
  "Alta apenas se o déficit estiver estável, a etiologia estiver encaminhada e o risco de deterioração imediata for baixo.":
    "Alta solo si el déficit está estable, la etiología está encauzada y el riesgo de deterioro inmediato es bajo.",
  "Se houve trombólise, alta só após imagem de controle, estabilidade neurológica e ausência de complicações hemorrágicas.":
    "Si hubo trombólisis, alta solo tras la imagen de control, con estabilidad neurológica y sin complicaciones hemorrágicas.",
  "Entregar prescrição de prevenção secundária, metas pressóricas/glicêmicas e orientação formal de sinais de alarme.":
    "Entregar la prescripción de prevención secundaria, las metas tensionales y glucémicas y una orientación formal sobre los signos de alarma.",
  "Plano do próximo nível assistencial deve sair com prevenção secundária, investigação etiológica e seguimento já definidos.":
    "El plan del siguiente nivel asistencial debe salir con la prevención secundaria, el estudio etiológico y el seguimiento ya definidos.",
  "Sem trombólise, manter reavaliação seriada nas primeiras 24 h e plano etiológico/documental fechado.":
    "Sin trombólisis, mantener la reevaluación seriada en las primeras 24 h y el plan etiológico y documental cerrado.",
  "Documentar claramente o motivo de não trombólise e manter vigilância para deterioração.":
    "Documentar claramente el motivo de la no trombólisis y mantener la vigilancia del deterioro.",
  "Não classificar ainda como sem trombólise definitiva: o caso permanece em janela de reperfusão enquanto as correções forem factíveis e rápidas.":
    "No clasificarlo todavía como sin trombólisis definitiva: el caso permanece en ventana de reperfusión mientras las correcciones sean factibles y rápidas.",
  "Corrigir imediatamente os fatores reversíveis destacados pelo módulo, reavaliar elegibilidade após cada intervenção e registrar o horário da liberação ou contraindicação final.":
    "Corregir de inmediato los factores reversibles destacados por el módulo, reevaluar la elegibilidad tras cada intervención y registrar la hora de la autorización o de la contraindicación final.",
  "Manter preparo de reperfusão, monitorização intensiva e comunicação ativa com neurologia enquanto o bloqueio corrigível estiver sendo manejado.":
    "Mantener la preparación para la reperfusión, la monitorización intensiva y la comunicación activa con neurología mientras se maneja el bloqueo corregible.",

  // ══ CAMADA 2 — correções conforme o capítulo clínico de AVC v1.4 ═════════
  // Doses de ataque da antiagregação, PCC4 por faixa de INR, prazo de oclusão do
  // aneurisma, critério de HIC cerebelar por volume e o alerta contra a dose de
  // tenecteplase do infarto.
  "AVC minor (NIHSS ≤ 3) ou AIT de alto risco (ABCD² ≥ 4): DAPT iniciada idealmente em 12–24 h — AAS 160–300 mg de ataque, depois 81–100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia. Manter ambos por 21 dias e então monoterapia (POINT/CHANCE). FA: anticoagular em 4–14 dias.":
    "ACV menor (NIHSS ≤ 3) o AIT de alto riesgo (ABCD² ≥ 4): DAPT iniciada idealmente en 12–24 h — AAS 160–300 mg de carga, luego 81–100 mg/día + clopidogrel 300 mg de carga, luego 75 mg/día. Mantener ambos por 21 días y luego monoterapia (POINT/CHANCE). FA: anticoagular en 4–14 días.",
  "Antiagregante: AAS 160–300 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise); manutenção 81–100 mg/dia.":
    "Antiagregante: AAS 160–300 mg en 24–48 h (tras 24 h y TC sin hemorragia si hubo trombólisis); mantenimiento 81–100 mg/día.",
  "Associar vitamina K 10 mg IV em infusão lenta. Reavaliar INR 15–60 min após o PCC e de forma seriada. Conferir a bula do produto: a unidade é de fator IX.":
    "Asociar vitamina K 10 mg IV en infusión lenta. Reevaluar el INR 15–60 min después del CCP y de forma seriada. Consultar el prospecto del producto: la unidad es de factor IX.",
  "INDICADA: HIC cerebelar com deterioração neurológica, compressão de tronco, hidrocefalia obstrutiva OU volume ≥ 15 mL — evacuação imediata, com DVE se necessário; hematoma lobar superficial com deterioração neurológica; DVE para hidrocefalia aguda por sangue intraventricular.":
    "INDICADA: HIC cerebelosa con deterioro neurológico, compresión del tronco, hidrocefalia obstructiva O volumen ≥ 15 mL — evacuación inmediata, con DVE si es necesario; hematoma lobar superficial con deterioro neurológico; DVE para hidrocefalia aguda por sangre intraventricular.",
  "Nimodipino previne vasoespasmo (nível I). Ocluir o aneurisma preferencialmente em até 24 h.":
    "El nimodipino previene el vasoespasmo (nivel I). Ocluir el aneurisma preferentemente dentro de las 24 h.",
  "Oclusão do aneurisma preferencialmente em até 24 h; nimodipino 21 dias.":
    "Oclusión del aneurisma preferentemente dentro de las 24 h; nimodipino 21 días.",
  "Tratamento do aneurisma: clipagem cirúrgica × coiling endovascular — decisão multidisciplinar (neurocirurgia + neurorradiologia). Ocluir completamente, preferencialmente em até 24 h, para evitar ressangramento.":
    "Tratamiento del aneurisma: clipaje quirúrgico × coiling endovascular — decisión multidisciplinaria (neurocirugía + neurorradiología). Ocluir por completo, preferentemente dentro de las 24 h, para evitar el resangrado.",
  "Warfarina/AVK: complexo protrombínico de 4 fatores (PCC4) POR FAIXA DE INR — INR 2–<4: 25 UI/kg (máx 2.500 UI); INR 4–6: 35 UI/kg (máx 3.500 UI); INR > 6: 50 UI/kg (máx 5.000 UI).":
    "Warfarina/AVK: concentrado de complejo protrombínico de 4 factores (CCP4) POR FRANJA DE INR — INR 2–<4: 25 UI/kg (máx. 2.500 UI); INR 4–6: 35 UI/kg (máx. 3.500 UI); INR > 6: 50 UI/kg (máx. 5.000 UI).",
  "1. Após 24 h e neuroimagem de controle sem hemorragia: iniciar antiagregante. Esquema prático comum: AAS 160-300 mg de ataque, depois manutenção 81-100 mg/dia.":
    "1. Tras 24 h y neuroimagen de control sin hemorragia: iniciar antiagregante. Esquema práctico habitual: AAS 160-300 mg de carga, luego mantenimiento 81-100 mg/día.",
  "4. Após 24 h e TC/RM de controle sem sangramento: liberar antiagregante/prevenção secundária conforme neurologia e etiologia. Esquema prático frequente: AAS 160-300 mg de ataque, depois manutenção 81-100 mg/dia; clopidogrel 75 mg/dia apenas se estratégia alternativa/etiológica definida.":
    "4. Tras 24 h y TC/RM de control sin sangrado: liberar antiagregante/prevención secundaria según neurología y etiología. Esquema práctico frecuente: AAS 160-300 mg de carga, luego mantenimiento 81-100 mg/día; clopidogrel 75 mg/día solo si hay una estrategia alternativa/etiológica definida.",
  "7. Em AVC/TIA menor selecionado e sem trombólise, DAPT curta pode ser discutida com neurologia: AAS 160-300 mg de ataque, depois 81-100 mg/dia + clopidogrel 300 mg de ataque, depois 75 mg/dia, mantendo ambos por 21 dias e então monoterapia. Seguir protocolo institucional.":
    "7. En ACV/AIT menor seleccionado y sin trombólisis, se puede discutir con neurología una DAPT corta: AAS 160-300 mg de carga, luego 81-100 mg/día + clopidogrel 300 mg de carga, luego 75 mg/día, manteniendo ambos por 21 días y luego monoterapia. Seguir el protocolo institucional.",
  "0,25 mg/kg em bolus ÚNICO, máximo 25 mg. ⚠️ NÃO usar os esquemas ponderais do infarto agudo do miocárdio: no IAM a dose chega ao dobro. Confirmar apresentação disponível no Brasil e alinhamento com o protocolo local e a estratégia de trombectomia.":
    "0,25 mg/kg en bolo ÚNICO, máximo 25 mg. ⚠️ NO usar los esquemas ponderales del infarto agudo de miocardio: en el IAM la dosis llega al doble. Confirmar la presentación disponible en Brasil y la alineación con el protocolo local y la estrategia de trombectomía.",
};
