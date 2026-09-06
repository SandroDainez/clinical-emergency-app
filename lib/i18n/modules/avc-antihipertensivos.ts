/**
 * ES · F-19 — anti-hipertensivos IV no AVC ⛔ e os alvos pressóricos.
 *
 * ⚠️⚠️ ⛔ NÚMERO ⛔ NÃO SE TRADUZ, ⛔ e ⛔ nem unidade: *"10 a 20 mg"* vira *"10 a
 * 20 mg"*, ⛔ e ⛔ não muda de faixa ⛔ nem de casa decimal. ⚠️ O que se traduz é
 * a **prosa em volta** do número.
 *
 * ⚠️ Nome de fármaco segue a denominação comum internacional — ⛔ e ⛔ por isso
 * *"Nitroprussiato de sódio"* vira *"Nitroprusiato de sodio"*, ⛔ e ⛔ nunca uma
 * marca.
 */
export const ES_AVC_ANTIHIPERTENSIVOS: Readonly<Record<string, string>> = {
  /* ── doses ⛔ e titulação ────────────────────────────────────────────────── */
  "10 a 20 mg por via endovenosa, em 1 a 2 minutos":
    "10 a 20 mg por vía endovenosa, en 1 a 2 minutos",
  "Pode repetir uma vez": "Puede repetirse una vez",
  "5 mg por hora, por via endovenosa": "5 mg por hora, por vía endovenosa",
  "Aumentar 2,5 mg por hora a cada 5 a 15 minutos":
    "Aumentar 2,5 mg por hora cada 5 a 15 minutos",
  "15 mg por hora": "15 mg por hora",
  "1 a 2 mg por hora, por via endovenosa": "1 a 2 mg por hora, por vía endovenosa",
  "Pode duplicar a cada 2 a 5 minutos, e depois usar incrementos menores":
    "Puede duplicarse cada 2 a 5 minutos, y luego usar incrementos menores",
  "21 mg por hora, que é o teto do protocolo neurovascular":
    "21 mg por hora, que es el techo del protocolo neurovascular",
  "Ataque opcional de 500 microgramas por quilo em 1 minuto, seguido de 50 microgramas por quilo por minuto":
    "Ataque opcional de 500 microgramos por kilo en 1 minuto, seguido de 50 microgramos por kilo por minuto",
  "Ajustar conforme a resposta": "Ajustar según la respuesta",
  "A bula descreve 250 a 300 microgramas por quilo por minuto para hipertensão, e declara que a segurança acima de 300 não foi estudada":
    "El prospecto describe 250 a 300 microgramos por kilo por minuto para hipertensión, y declara que la seguridad por encima de 300 no fue estudiada",
  "5 mg por via endovenosa, lentamente, cerca de 1 mg por minuto":
    "5 mg por vía endovenosa, lentamente, cerca de 1 mg por minuto",
  "Pode repetir a cada 10 minutos": "Puede repetirse cada 10 minutos",
  "20 mg": "20 mg",
  "0,5 a 8 microgramas por quilo por minuto": "0,5 a 8 microgramos por kilo por minuto",

  /* ── quando pensar em cada um ──────────────────────────────────────────── */
  "Pressão moderadamente acima do limite, ou taquicardia associada":
    "Presión moderadamente por encima del límite, o taquicardia asociada",
  "Quando se deseja controle contínuo e titulação progressiva":
    "Cuando se desea control continuo y titulación progresiva",
  "Quando se deseja titulação muito rápida e reversibilidade rápida":
    "Cuando se desea titulación muy rápida y reversibilidad rápida",
  "Taquicardia significativa, hiperatividade simpática, ou indisponibilidade dos preferenciais":
    "Taquicardia significativa, hiperactividad simpática, o indisponibilidad de los preferenciales",
  "Conforme protocolo institucional": "Según protocolo institucional",
  "Hipertensão grave ou refratária, quando os agentes mais apropriados não estão disponíveis ou foram insuficientes":
    "Hipertensión grave o refractaria, cuando los agentes más apropiados no están disponibles o fueron insuficientes",

  /* ── cautelas ──────────────────────────────────────────────────────────── */
  "Bradicardia importante, bloqueio atrioventricular avançado, insuficiência cardíaca descompensada, choque cardiogênico ou broncoespasmo importante":
    "Bradicardia importante, bloqueo auriculoventricular avanzado, insuficiencia cardíaca descompensada, shock cardiogénico o broncoespasmo importante",
  "A bula contraindica em estenose aórtica avançada":
    "El prospecto contraindica en estenosis aórtica avanzada",
  "Ação mais longa, menos reversível e sem bloqueio alfa. Não é escolha preferencial quando há acesso a agentes tituláveis":
    "Acción más larga, menos reversible y sin bloqueo alfa. No es opción preferencial cuando hay acceso a agentes titulables",
  "Menos titulável. Analisar hipovolemia, insuficiência renal, estenose bilateral de artérias renais e risco de hipotensão prolongada":
    "Menos titulable. Analizar hipovolemia, insuficiencia renal, estenosis bilateral de arterias renales y riesgo de hipotensión prolongada",
  "Resposta individual variável, duração longa, possibilidade de taquicardia reflexa e de redução pressórica excessiva":
    "Respuesta individual variable, duración larga, posibilidad de taquicardia refleja y de reducción tensional excesiva",
  "Queda pressórica muito rápida, maior variabilidade hemodinâmica, possibilidade de elevar a pressão intracraniana e toxicidade por cianeto ou tiocianato":
    "Caída tensional muy rápida, mayor variabilidad hemodinámica, posibilidad de elevar la presión intracraneal y toxicidad por cianuro o tiocianato",

  /* ── procedência — ⚠️ ⛔ e ⛔ nunca "AHA/ASA" ⛔ sem o ano ─────────────────── */
  "AHA/ASA 2019, tabela de opções pré-reperfusão":
    "AHA/ASA 2019, tabla de opciones pre-reperfusión",
  "AHA/ASA 2019, e coincide com a bula contemporânea":
    "AHA/ASA 2019, y coincide con el prospecto contemporáneo",
  "Bula (DailyMed). Não faz parte da tabela de 2019":
    "Prospecto (DailyMed). No forma parte de la tabla de 2019",
  "Manual de Rotinas do Ministério da Saúde, 2013":
    "Manual de Rutinas del Ministerio de Salud de Brasil, 2013",
  "Sem dose neste slot": "Sin dosis en esta fuente",
  "Nitroprussiato de sódio": "Nitroprusiato de sodio",

  /* ── o alerta de segurança ─────────────────────────────────────────────── */
  "Não utilizar esmolol a 3 mg por quilo por minuto":
    "No utilizar esmolol a 3 mg por kilo por minuto",
  "Um manual brasileiro de 2013 descreve manutenção até 3 mg por quilo por minuto. Isso equivale a 3.000 microgramas por quilo por minuto, cerca de dez vezes o teto contemporâneo de 300, acima do qual a bula declara que a segurança não foi estudada.":
    "Un manual brasileño de 2013 describe mantenimiento hasta 3 mg por kilo por minuto. Eso equivale a 3.000 microgramos por kilo por minuto, cerca de diez veces el techo contemporáneo de 300, por encima del cual el prospecto declara que la seguridad no fue estudiada.",

  /* ── alvos pressóricos ─────────────────────────────────────────────────── */
  "Abaixo de 185 por 110 mmHg": "Por debajo de 185 por 110 mmHg",
  "Antes de iniciar a trombólise intravenosa":
    "Antes de iniciar la trombólisis intravenosa",
  "Abaixo de 180 por 105 mmHg": "Por debajo de 180 por 105 mmHg",
  "Nas primeiras 24 horas após a trombólise":
    "En las primeras 24 horas después de la trombólisis",
  "Até 185 por 110 mmHg": "Hasta 185 por 110 mmHg",
  "Antes da trombectomia, quando não houve trombólise":
    "Antes de la trombectomía, cuando no hubo trombólisis",
  "Até 180 por 105 mmHg": "Hasta 180 por 105 mmHg",
  "Durante e nas 24 horas após a trombectomia":
    "Durante y en las 24 horas después de la trombectomía",
  "Não manter a sistólica abaixo de 140 mmHg por 72 horas":
    "No mantener la sistólica por debajo de 140 mmHg durante 72 horas",
  "Após recanalização bem-sucedida": "Después de recanalización exitosa",
  "Não reduzir a sistólica abaixo de 140 mmHg de rotina":
    "No reducir la sistólica por debajo de 140 mmHg de rutina",
  "Após a trombólise, em gravidade leve a moderada":
    "Después de la trombólisis, en gravedad leve a moderada",
  "Sistólica aproximadamente entre 140 e 180 mmHg":
    "Sistólica aproximadamente entre 140 y 180 mmHg",
  "Após a trombólise, como faixa prática":
    "Después de la trombólisis, como franja práctica",

  /* ── a tela ────────────────────────────────────────────────────────────── */
  "Agentes intravenosos": "Agentes intravenosos",
  "A diretriz vigente dá alvos e não nomeia fármaco. Cada agente abaixo traz a sua própria procedência, e a escolha é do médico.":
    "La guía vigente da objetivos y no nombra fármaco. Cada agente abajo trae su propia procedencia, y la elección es del médico.",
  "Alvos pressóricos": "Objetivos tensionales",
  "Na tabela da AHA/ASA de 2019": "En la tabla de la AHA/ASA de 2019",
  "Alternativa": "Alternativa",
  "Prática histórica brasileira": "Práctica histórica brasileña",
  "Reserva para caso grave ou refratário": "Reserva para caso grave o refractario",
  "Texto de apoio da diretriz, sem grau de recomendação":
    "Texto de apoyo de la guía, sin grado de recomendación",
  "Máximo": "Máximo",
  "Quando": "Cuándo",
  "Cautela": "Precaución",
};
