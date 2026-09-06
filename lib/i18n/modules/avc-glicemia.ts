/**
 * ES · F-18 — glicemia ⛔ e trombólise no AVC.
 *
 * ⚠️⚠️ ⛔ NÚMERO ⛔ NÃO SE TRADUZ, ⛔ e ⛔ nem unidade. ⚠️ O que se traduz é a
 * prosa em volta — ⛔ e, aqui, ⛔ ela carrega a distinção que o slot inteiro
 * existe para manter: **grave ⛔ não é contraindicado**.
 */
export const ES_AVC_GLICEMIA: Readonly<Record<string, string>> = {
  /* ── os cortes ─────────────────────────────────────────────────────────── */
  "Abaixo de 50 mg/dL": "Por debajo de 50 mg/dL",
  "Abaixo de 60 mg/dL": "Por debajo de 60 mg/dL",
  "De 60 a 180 mg/dL": "De 60 a 180 mg/dL",
  "Acima de 180 e até 400 mg/dL": "Por encima de 180 y hasta 400 mg/dL",
  "Acima de 400 mg/dL": "Por encima de 400 mg/dL",
  "Disglicemia grave": "Disglucemia grave",
  "Hipoglicemia a tratar": "Hipoglucemia a tratar",
  "Sem bloqueio glicêmico": "Sin bloqueo glucémico",
  "Hiperglicemia": "Hiperglucemia",
  "Corrigir imediatamente, repetir a glicemia e reavaliar o déficit":
    "Corregir de inmediato, repetir la glucemia y reevaluar el déficit",
  "Corrigir e reavaliar": "Corregir y reevaluar",
  "Seguir o protocolo de reperfusão": "Seguir el protocolo de reperfusión",
  "Avaliar necessidade de tratamento, sem atrasar a reperfusão":
    "Evaluar la necesidad de tratamiento, sin retrasar la reperfusión",
  "Corrigir, investigar cetoacidose ou estado hiperosmolar conforme o contexto, e reavaliar o déficit":
    "Corregir, investigar cetoacidosis o estado hiperosmolar según el contexto, y reevaluar el déficit",

  /* ── ⛔ o que cada corte ⛔ NÃO é ────────────────────────────────────────── */
  "Não é contraindicação absoluta à trombólise":
    "No es contraindicación absoluta a la trombólisis",
  "Não é bloqueio da trombólise": "No es bloqueo de la trombólisis",
  "Não exige correção antes da trombólise":
    "No exige corrección antes de la trombólisis",
  "Não bloqueia a trombólise isoladamente":
    "No bloquea la trombólisis de forma aislada",

  /* ── a pergunta que decide ─────────────────────────────────────────────── */
  "O déficit neurológico persiste depois de corrigir a glicemia?":
    "¿El déficit neurológico persiste después de corregir la glucemia?",
  "Se o déficit incapacitante persiste apesar da correção, a trombólise é recomendada quando os demais critérios estiverem satisfeitos.":
    "Si el déficit incapacitante persiste a pesar de la corrección, la trombólisis está recomendada cuando los demás criterios estén satisfechos.",
  "A hipótese de mimetizador metabólico ganha força. Não trombolisar automaticamente, e reconsiderar o diagnóstico.":
    "La hipótesis de imitador metabólico gana fuerza. No trombolisar automáticamente, y reconsiderar el diagnóstico.",
  "Se persiste": "Si persiste",
  "Se desaparece": "Si desaparece",

  /* ── tratamento ────────────────────────────────────────────────────────── */
  "Glicose intravenosa a 50%": "Glucosa intravenosa al 50%",
  "25 mL por via endovenosa, lentamente, o que corresponde a 12,5 g":
    "25 mL por vía endovenosa, lentamente, lo que corresponde a 12,5 g",
  "Via preferida quando há alteração neurológica ou a deglutição não está garantida. Depois: repetir a glicemia e reavaliar o déficit":
    "Vía preferida cuando hay alteración neurológica o la deglución no está garantizada. Después: repetir la glucemia y reevaluar el déficit",
  "Um manual brasileiro de 2013 descreve 30 mL de glicose a 50% diluídos em 100 mL de soro fisiológico. São opções práticas diferentes, e nenhuma delas é a única possível":
    "Un manual brasileño de 2013 describe 30 mL de glucosa al 50% diluidos en 100 mL de suero fisiológico. Son opciones prácticas diferentes, y ninguna de ellas es la única posible",
  "Revisão clínica 2026, com a divergência do manual de 2013 registrada":
    "Revisión clínica 2026, con la divergencia del manual de 2013 registrada",
  "Glicose em solução mais diluída": "Glucosa en solución más diluida",
  "Conforme protocolo institucional. Menor osmolaridade, menor irritação venosa e menor lesão em caso de extravasamento":
    "Según protocolo institucional. Menor osmolaridad, menor irritación venosa y menor lesión en caso de extravasación",
  "O objetivo não é uma concentração, e sim corrigir a neuroglicopenia sem produzir hiperglicemia excessiva":
    "El objetivo no es una concentración, sino corregir la neuroglucopenia sin producir hiperglucemia excesiva",
  "Protocolo institucional": "Protocolo institucional",
  "Glicose por via oral": "Glucosa por vía oral",
  "15 g de carboidrato de ação rápida, reavaliando em 15 minutos":
    "15 g de carbohidrato de acción rápida, reevaluando en 15 minutos",
  "Somente com paciente consciente e deglutição segura":
    "Solamente con paciente consciente y deglución segura",
  "No acidente vascular cerebral agudo, não usar antes de assegurar nível de consciência, segurança da deglutição e ausência de risco de aspiração":
    "En el accidente cerebrovascular agudo, no usar antes de asegurar nivel de consciencia, seguridad de la deglución y ausencia de riesgo de aspiración",
  "Sociedade Americana de Diabetes, 2026": "Asociación Americana de Diabetes, 2026",
  "Glucagon": "Glucagón",
  "1 mg por via intramuscular ou subcutânea, ou 3 mg por via intranasal quando disponível":
    "1 mg por vía intramuscular o subcutánea, o 3 mg por vía intranasal cuando esté disponible",
  "Quando não há glicose intravenosa nem via oral segura imediatamente disponíveis":
    "Cuando no hay glucosa intravenosa ni vía oral segura inmediatamente disponibles",
  "No hospital, com acesso venoso disponível, a glicose intravenosa costuma ser mais direta e previsível":
    "En el hospital, con acceso venoso disponible, la glucosa intravenosa suele ser más directa y previsible",
  "Insulina regular intravenosa em infusão contínua":
    "Insulina regular intravenosa en infusión continua",
  "Quando indicada no paciente crítico, segundo protocolo institucional validado de infusão":
    "Cuando esté indicada en el paciente crítico, según protocolo institucional validado de infusión",
  "Não existe dose fixa recomendada para o acidente vascular cerebral. A necessidade depende de resistência insulínica, diabetes prévio, peso, função renal, potássio, alimentação, corticoide, catecolaminas, cetoacidose, estado hiperosmolar e velocidade de queda da glicemia":
    "No existe dosis fija recomendada para el accidente cerebrovascular. La necesidad depende de resistencia insulínica, diabetes previa, peso, función renal, potasio, alimentación, corticoide, catecolaminas, cetoacidosis, estado hiperosmolar y velocidad de caída de la glucemia",
  "Sem dose neste slot, por decisão da fonte":
    "Sin dosis en esta fuente, por decisión de la propia fuente",

  /* ── alvos ─────────────────────────────────────────────────────────────── */
  "De 140 a 180 mg/dL": "De 140 a 180 mg/dL",
  "Alvo de tratamento da hiperglicemia persistente, com monitorização cuidadosa. Não é pré-requisito para reperfundir":
    "Objetivo de tratamiento de la hiperglucemia persistente, con monitorización cuidadosa. No es prerrequisito para reperfundir",
  "Não perseguir de 80 a 130 mg/dL": "No perseguir de 80 a 130 mg/dL",
  "Controle intensivo não melhora o desfecho funcional do acidente vascular cerebral, e a hipoglicemia grave ocorreu apenas no grupo intensivo":
    "El control intensivo no mejora el desenlace funcional del accidente cerebrovascular, y la hipoglucemia grave ocurrió solamente en el grupo intensivo",
  "Igual ou acima de 180 mg/dL em duas medidas em 24 horas":
    "Igual o por encima de 180 mg/dL en dos mediciones en 24 horas",
  "Gatilho para iniciar ou intensificar insulinoterapia no paciente crítico. É manejo hospitalar, e não critério de elegibilidade":
    "Disparador para iniciar o intensificar insulinoterapia en el paciente crítico. Es manejo hospitalario, y no criterio de elegibilidad",
  "Manejo hospitalar": "Manejo hospitalario",

  /* ── ⛔ os erros que o reflexo antigo produz ────────────────────────────── */
  "Glicemia abaixo de 50 é contraindicação absoluta":
    "Glucemia por debajo de 50 es contraindicación absoluta",
  "É disglicemia grave. Corrigir e reavaliar o déficit":
    "Es disglucemia grave. Corregir y reevaluar el déficit",
  "Glicemia acima de 400 é contraindicação absoluta":
    "Glucemia por encima de 400 es contraindicación absoluta",
  "É disglicemia grave. Déficit incapacitante que persiste após a correção mantém a indicação":
    "Es disglucemia grave. Un déficit incapacitante que persiste tras la corrección mantiene la indicación",
  "Só trombolisar quando a glicemia estiver abaixo de 180":
    "Solo trombolisar cuando la glucemia esté por debajo de 180",
  "De 140 a 180 é alvo de manejo, e não pré-requisito de reperfusão":
    "De 140 a 180 es objetivo de manejo, y no prerrequisito de reperfusión",
  "Dez unidades de insulina por via endovenosa para glicemia acima de 300":
    "Diez unidades de insulina por vía endovenosa para glucemia por encima de 300",
  "Insulinoterapia por protocolo dinâmico validado":
    "Insulinoterapia por protocolo dinámico validado",
  "Meta de 80 a 130": "Meta de 80 a 130",
  "Não é recomendada para melhorar o desfecho do acidente vascular cerebral":
    "No está recomendada para mejorar el desenlace del accidente cerebrovascular",

  /* ── a tela ────────────────────────────────────────────────────────────── */
  "Como corrigir": "Cómo corregir",
  "O que cada faixa significa": "Qué significa cada franja",
  "Alvos glicêmicos": "Objetivos glucémicos",
  "Leituras antigas que hoje estão erradas":
    "Lecturas antiguas que hoy están equivocadas",
};
