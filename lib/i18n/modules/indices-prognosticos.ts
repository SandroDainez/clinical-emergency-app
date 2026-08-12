/**
 * Espanhol (es-419) — ressalvas sobre índices prognósticos nas calculadoras
 * (Medicina Intensiva: Abordagem Prática, 5ª ed., USP, cap. 61).
 */
export const ES_INDICES_PROGNOSTICOS: Record<string, string> = {
  "Regra geral":
    "Regla general",
  "Índices prognósticos NÃO devem ser usados para avaliação individual de paciente. Servem para descrever gravidade de população, comparar braços de estudo e alocar recursos.":
    "Los índices pronósticos NO deben usarse para la evaluación individual del paciente. Sirven para describir la gravedad de una población, comparar brazos de un estudio y asignar recursos.",
  "Viés temporal":
    "Sesgo temporal",
  "O APACHE II é de 1985. Monitorização e tratamento mudaram desde então, e seu uso para avaliar qualidade assistencial é desencorajado.":
    "El APACHE II es de 1985. La monitorización y el tratamiento cambiaron desde entonces, y su uso para evaluar la calidad asistencial está desaconsejado.",
  "Índices prognósticos NÃO devem ser usados para avaliação individual de paciente — nem o SAPS 3. A leitura correta é populacional.":
    "Los índices pronósticos NO deben usarse para la evaluación individual del paciente — tampoco el SAPS 3. La lectura correcta es poblacional.",
  "Comparar serviços":
    "Comparar servicios",
  "A razão entre mortalidade observada e esperada (SMR) é usada para comparar UTIs, mas depende do perfil dos pacientes, das políticas de fim de vida, do viés temporal do índice e varia dentro das faixas de risco. Ler com critério.":
    "La razón entre mortalidad observada y esperada (SMR) se usa para comparar UCIs, pero depende del perfil de los pacientes, de las políticas de fin de vida, del sesgo temporal del índice y varía dentro de los estratos de riesgo. Leerla con criterio.",
  "Critério ≥ 2 = sepse: Singer M et al. JAMA. 2016;315(8):801–810 (Sepsis-3). MORTALIDADE POR FAIXA × TENDÊNCIA: Ferreira FL et al. JAMA. 2001;286(14):1754–1758.": "Criterio ≥ 2 = sepsis: Singer M et al. JAMA. 2016;315(8):801–810 (Sepsis-3). MORTALIDAD POR FRANJA × TENDENCIA: Ferreira FL et al. JAMA. 2001;286(14):1754–1758.",
  "Escore: Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008;16(6):191–196 · Backus BE et al. Crit Pathw Cardiol. 2010;9(3):164–169. PORCENTAGENS DE MACE: Backus BE et al. Int J Cardiol. 2013;168(3):2153–2158 (n = 2440) — as três da mesma coorte.": "Puntaje: Six AJ, Backus BE, Kelder JC. Neth Heart J. 2008;16(6):191–196 · Backus BE et al. Crit Pathw Cardiol. 2010;9(3):164–169. PORCENTAJES DE MACE: Backus BE et al. Int J Cardiol. 2013;168(3):2153–2158 (n = 2440) — los tres de la misma cohorte.",
  "MACE = infarto, revascularização urgente ou morte em 6 semanas. As três porcentagens são da MESMA coorte (Backus 2013, 2440 pacientes) — Six 2008 e Backus 2010 são a origem do ESCORE, não a fonte destes números.": "MACE = infarto, revascularización urgente o muerte en 6 semanas. Los tres porcentajes son de la MISMA cohorte (Backus 2013, 2440 pacientes) — Six 2008 y Backus 2010 son el origen del PUNTAJE, no la fuente de estos números.",
  "SOFA ≥ 2 com infecção suspeita ou confirmada = SEPSE (Sepsis-3, 2016), mortalidade hospitalar em torno de 10%.": "SOFA ≥ 2 con infección sospechada o confirmada = SEPSIS (Sepsis-3, 2016), mortalidad hospitalaria en torno al 10%.",
  "SOFA ≥ 2 pontos em paciente com infecção suspeita/confirmada = Sepse (Sepsis-3, 2016). As porcentagens das faixas são de Ferreira 2001 e dependem da SEGUNDA medida em 48 h — sem ela, não se aplicam.": "SOFA ≥ 2 puntos en paciente con infección sospechada/confirmada = Sepsis (Sepsis-3, 2016). Los porcentajes de las franjas son de Ferreira 2001 y dependen de la SEGUNDA medición a las 48 h — sin ella, no se aplican.",
  "mortalidade em 30 dias entre 3,2% (escore 1) e 17% (escore 3); valor pontual não confirmado na publicação primária": "mortalidad a 30 días entre 3,2% (puntaje 1) y 17% (puntaje 3); valor puntual no confirmado en la publicación primaria",
  "⚠️ A mortalidade depende de o escore CAIR ou NÃO nas primeiras 48 h — não do valor de hoje. Ferreira 2001, escore que NÃO cai (aumenta ou fica igual): inicial 2–7 → 37%; 8–11 → 60%; acima de 11 → 91%. Escore que CAI em 48 h, para qualquer valor até 11 → 6% ou menos. O mesmo SOFA 10 vale dez vezes mais ou dez vezes menos conforme a trajetória, e sem a SEGUNDA medida nenhuma destas estimativas se aplica.": "⚠️ La mortalidad depende de que el puntaje BAJE o NO en las primeras 48 h — no del valor de hoy. Ferreira 2001, puntaje que NO baja (aumenta o se mantiene igual): inicial 2–7 → 37%; 8–11 → 60%; por encima de 11 → 91%. Puntaje que BAJA en 48 h, para cualquier valor hasta 11 → 6% o menos. El mismo SOFA 10 vale diez veces más o diez veces menos según la trayectoria, y sin la SEGUNDA medición ninguna de estas estimaciones se aplica.",
};
