/**
 * SINÔNIMOS DE MÓDULO — o vocabulário pelo qual o médico procura, que não é o
 * vocabulário pelo qual o módulo se chama.
 *
 * ── O DEFEITO QUE ORIGINOU (2026-08-17) ─────────────────────────────────────
 *
 * A medição do hub mostrou três coisas sobre o Engasgo (OVACE):
 *
 *   · o percurso físico até ele é o MESMO de qualquer outro módulo — 1 toque e
 *     2 rolagens, e ele fica até acima do Abdome agudo. Distância não é o
 *     problema;
 *   · ele estava ANINHADO no card do PCR, sob um divisor "MÓDULOS ACLS" — o
 *     que já foi desfeito;
 *   · ⚠️ E NÃO EXISTE BUSCA. Procurado em todo o `app/` e em `module-hub.tsx`:
 *     nenhum `TextInput`, `onChangeText`, `placeholder` ou filtro. Os únicos
 *     campos de texto que não são calculadora clínica são os três do login.
 *     Quem digita "engasgou" não tem onde digitar.
 *
 * ── POR QUE OS SINÔNIMOS VÊM ANTES DA BUSCA ─────────────────────────────────
 *
 * Porque uma busca escrita sobre os TÍTULOS já nasce inútil. Ela casaria
 * "Engasgo (OVACE)" e não casaria "corpo estranho", "asfixia" nem "sufocamento"
 * — que é como o médico pensa quando o paciente está na frente dele. O mesmo
 * vale em todo o app: ninguém digita "Cetoacidose / Estado Hiperosmolar", digita
 * "CAD"; ninguém digita "Síndromes Coronarianas", digita "infarto" ou "IAM".
 *
 * ⚠️ ESTE ARQUIVO NÃO TEM CONSUMIDOR AINDA, e isso é deliberado — está
 * declarado, não esquecido. A busca é item próprio do levantamento e vem
 * depois. O que existe hoje é o DADO, travado por `valida-sinonimos.cjs` para
 * que nasça completo e continue completo quando novos módulos entrarem.
 *
 * ── REGRAS DO CONTEÚDO ──────────────────────────────────────────────────────
 *
 *   1. TODO módulo tem entrada. Sem exceção — é o que a trava exige, e é o que
 *      impede a busca de nascer parcial;
 *   2. o termo LEIGO entra quando existe ("engasgo", "desmaio", "convulsão"),
 *      porque é o que se digita sob pressão;
 *   3. a SIGLA entra em minúscula; a normalização de caixa e acento é problema
 *      de quem buscar, não do dado;
 *   4. ⚠️ SINÔNIMO NÃO É CONTEÚDO CLÍNICO. Nada aqui afirma conduta, dose ou
 *      indicação — são rótulos de navegação. Um termo errado leva à tela errada,
 *      que é ruim, mas não é o mesmo que um número errado.
 *
 * ── E POR QUE O ARQUIVO É BILÍNGUE ──────────────────────────────────────────
 *
 * A primeira versão tinha só português, e a varredura de i18n reprovou os 278
 * termos de uma vez. A reação fácil seria excluir o arquivo da varredura — e
 * seria reproduzir aqui exatamente o defeito que ele existe para evitar: a
 * busca nasceria inútil para metade do app.
 *
 * ⚠️ E O DICIONÁRIO `tr()` NÃO SERVE PARA ISTO. Ele mapeia uma string em uma
 * string; sinônimo não tem par 1:1. O espanhol tem termos que o português não
 * tem ("atragantamiento" cobre o que aqui exige "engasgo" e "sufocamento") e o
 * português tem coloquialismos sem correspondente ("tremendo", "barriga"). As
 * listas são INDEPENDENTES e amarradas pela CHAVE do módulo — que é o mesmo
 * mecanismo já usado por `speech-cues` e `voice-phrases`, e por isso este
 * arquivo entra em `BY_KEY_SOURCES` da varredura de i18n.
 *
 * A trava exige COBERTURA nos dois idiomas, e não exige o mesmo NÚMERO de
 * termos: obrigar paridade numérica faria alguém inventar sinônimo para fechar
 * a conta (R-55).
 */

const PT_BR: Record<string, readonly string[]> = {
  "pcr-adulto": [
    "parada", "parada cardíaca", "parada cardiorrespiratória", "pcr", "acls",
    "reanimação", "ressuscitação", "rcp", "massagem cardíaca", "código azul",
  ],
  "ritmos-acls": [
    "ritmo", "ritmos de parada", "fibrilação ventricular", "fv", "taquicardia ventricular",
    "tv sem pulso", "assistolia", "aesp", "atividade elétrica sem pulso", "chocável",
  ],
  "farmacologia-acls": [
    "adrenalina", "epinefrina", "amiodarona", "lidocaína", "fármacos da parada",
    "drogas do acls", "vasopressor na parada",
  ],
  "bradicardia-acls": [
    "bradicardia", "bradiarritmia", "frequência baixa", "atropina", "marca-passo",
    "bav", "bloqueio atrioventricular", "marca-passo transcutâneo",
  ],
  "taquicardia-acls": [
    "taquicardia", "taquiarritmia", "frequência alta", "cardioversão",
    "fibrilação atrial", "flutter", "tsv", "taquicardia supraventricular", "adenosina",
  ],
  "causas-reversiveis-acls": [
    "causas reversíveis", "hs e ts", "5h 5t", "hipóxia", "hipovolemia",
    "pneumotórax hipertensivo", "tamponamento", "trombose", "acidose na parada",
    "hipotermia na parada",
  ],
  "pcr-gestacao-acls": [
    "parada na gestante", "pcr gestante", "grávida", "gestação", "obstétrica",
    "deslocamento uterino", "cesárea perimortem", "parto ressuscitativo",
  ],
  // ⚠️ A lista pedida explicitamente pelo autor, mantida inteira.
  "ovace-adulto": [
    "engasgo", "engasgou", "corpo estranho", "asfixia", "sufocamento",
    "obstrução de via aérea", "heimlich", "ovace", "engasgado", "sufocou",
    "não consegue respirar", "comida entalada",
  ],
  "pos-pcr-acls": [
    "pós-parada", "pós-pcr", "rosc", "retorno da circulação", "cuidados pós-parada",
    "controle de temperatura", "hipotermia terapêutica", "reanimou",
  ],
  "sepse-adulto": [
    "sepse", "choque séptico", "infecção grave", "bundle", "qsofa",
    "lactato", "antibiótico na primeira hora", "septicemia", "foco infeccioso",
  ],
  "drogas-vasoativas": [
    "vasoativa", "vasopressor", "noradrenalina", "norepinefrina", "dobutamina",
    "adrenalina em infusão", "vasopressina", "diluição", "bomba de infusão", "gama",
  ],
  "correcoes-eletroliticas": [
    "eletrólito", "sódio", "potássio", "cálcio", "magnésio", "fósforo",
    "hiponatremia", "hipercalemia", "hipocalemia", "distúrbio hidroeletrolítico",
  ],
  "isr-rapida": [
    "isr", "intubação", "sequência rápida", "via aérea", "laringoscopia",
    "tubo", "iot", "via aérea difícil", "cricotireoidostomia", "indução",
  ],
  "edema-agudo-pulmao": [
    "eap", "edema agudo", "edema pulmonar", "congestão", "insuficiência cardíaca",
    "vni", "cpap", "afogamento em secreção",
  ],
  "cetoacidose-hiperosmolar": [
    "cad", "cetoacidose", "ehh", "estado hiperosmolar", "diabetes",
    "hiperglicemia", "cetose", "coma diabético", "insulina",
  ],
  "ventilacao-mecanica": [
    "ventilação", "vm", "ventilador", "respirador", "parâmetros",
    "peep", "volume corrente", "sdra", "desmame", "modo ventilatório",
  ],
  sedoanalgesia: [
    "sedação", "analgesia", "sedoanalgesia", "midazolam", "fentanil",
    "propofol", "bloqueador neuromuscular", "bnm", "rass", "curarização",
  ],
  anafilaxia: [
    "anafilaxia", "alergia", "reação alérgica", "choque anafilático",
    "urticária", "angioedema", "adrenalina intramuscular", "picada",
  ],
  avc: [
    "avc", "derrame", "acidente vascular", "trombólise", "trombectomia",
    "hemiplegia", "afasia", "isquêmico", "hemorrágico", "avci", "déficit neurológico",
  ],
  "sindromes-coronarianas": [
    "infarto", "iam", "sca", "síndrome coronariana", "supra de st",
    "angina", "dor torácica", "troponina", "cateterismo", "stemi",
  ],
  tep: [
    "tep", "embolia pulmonar", "tromboembolismo", "trombo",
    "d-dímero", "angiotc de tórax", "trombólise pulmonar", "cor pulmonale agudo",
  ],
  "pre-eclampsia": [
    "pré-eclâmpsia", "eclâmpsia", "hipertensão na gestação", "sulfato de magnésio",
    "convulsão na gestante", "hellp", "dheg", "proteinúria",
  ],
  "calculadoras-clinicas": [
    "calculadora", "escore", "score", "cálculo", "peso predito", "tfg",
    "clearance", "glasgow", "sofa", "wells", "heart", "nihss", "fórmula",
  ],
  politrauma: [
    "trauma", "politrauma", "atls", "acidente", "hemorragia", "xabcde",
    "transfusão maciça", "ácido tranexâmico", "fast", "torniquete",
  ],
  tce: [
    "tce", "traumatismo craniano", "trauma de crânio",
    "hipertensão intracraniana", "pic", "pupila", "hematoma", "cabeça",
  ],
  "crises-convulsivas": [
    "convulsão", "crise convulsiva", "estado de mal", "epiléptico",
    "epilepsia", "benzodiazepínico", "diazepam", "fenitoína", "tremendo",
  ],
  "intoxicacoes-exogenas": [
    "intoxicação", "envenenamento", "overdose", "antídoto", "veneno",
    "toxíndrome", "carvão ativado", "naloxona", "flumazenil", "tentativa de suicídio",
  ],
  "abdome-agudo": [
    "abdome agudo", "dor abdominal", "barriga", "apendicite", "peritonite",
    "obstrução intestinal", "abdome cirúrgico", "descompressão dolorosa",
  ],
  choque: [
    "choque", "hipotensão", "pressão baixa", "hipoperfusão", "colapso",
    "choque cardiogênico", "choque hipovolêmico", "choque distributivo", "rush",
  ],
  "insuficiencia-respiratoria": [
    "insuficiência respiratória", "dispneia", "falta de ar", "hipoxemia",
    "hipercapnia", "saturação baixa", "cansaço respiratório", "desconforto respiratório",
  ],
};


/**
 * ⚠️ NÃO É TRADUÇÃO PALAVRA A PALAVRA — é o vocabulário de quem busca em
 * espanhol. Onde o português precisa de dois termos ("engasgo", "sufocamento"),
 * "atragantamiento" cobre sozinho; onde o português tem coloquialismo
 * ("tremendo"), o espanhol usa outro ("convulsionando").
 */
const ES_419: Record<string, readonly string[]> = {
  "pcr-adulto": [
    "paro", "paro cardíaco", "paro cardiorrespiratorio", "pcr", "acls",
    "reanimación", "resucitación", "rcp", "masaje cardíaco", "código azul",
  ],
  "ritmos-acls": [
    "ritmo", "ritmos de paro", "fibrilación ventricular", "fv", "taquicardia ventricular",
    "tv sin pulso", "asistolia", "aesp", "actividad eléctrica sin pulso", "desfibrilable",
  ],
  "farmacologia-acls": [
    "adrenalina", "epinefrina", "amiodarona", "lidocaína", "fármacos del paro",
    "drogas del acls", "vasopresor en el paro",
  ],
  "bradicardia-acls": [
    "bradicardia", "bradiarritmia", "frecuencia baja", "atropina", "marcapasos",
    "bav", "bloqueo auriculoventricular", "marcapasos transcutáneo",
  ],
  "taquicardia-acls": [
    "taquicardia", "taquiarritmia", "frecuencia alta", "cardioversión",
    "fibrilación auricular", "aleteo auricular", "tsv", "taquicardia supraventricular", "adenosina",
  ],
  "causas-reversiveis-acls": [
    "causas reversibles", "hs y ts", "5h 5t", "hipoxia", "hipovolemia",
    "neumotórax a tensión", "taponamiento", "trombosis", "acidosis en el paro",
    "hipotermia en el paro",
  ],
  "pcr-gestacao-acls": [
    "paro en la embarazada", "pcr embarazada", "embarazada", "gestación", "obstétrica",
    "desplazamiento uterino", "cesárea perimortem", "parto de reanimación",
  ],
  "ovace-adulto": [
    "atragantamiento", "se atragantó", "cuerpo extraño", "asfixia", "sofocación",
    "obstrucción de vía aérea", "heimlich", "ovace", "atorado", "se ahogó con comida",
    "no puede respirar", "comida atorada",
  ],
  "pos-pcr-acls": [
    "pos-paro", "pos-pcr", "rosc", "retorno de la circulación", "cuidados pos-paro",
    "control de temperatura", "hipotermia terapéutica", "recuperó pulso",
  ],
  "sepse-adulto": [
    "sepsis", "choque séptico", "infección grave", "paquete", "qsofa",
    "lactato", "antibiótico en la primera hora", "septicemia", "foco infeccioso",
  ],
  "drogas-vasoativas": [
    "vasoactiva", "vasopresor", "noradrenalina", "norepinefrina", "dobutamina",
    "adrenalina en infusión", "vasopresina", "dilución", "bomba de infusión", "gamma",
  ],
  "correcoes-eletroliticas": [
    "electrolito", "sodio", "potasio", "calcio", "magnesio", "fósforo",
    "hiponatremia", "hipercalemia", "hipocalemia", "trastorno hidroelectrolítico",
  ],
  "isr-rapida": [
    "isr", "intubación", "secuencia rápida", "vía aérea", "laringoscopia",
    "tubo", "iot", "vía aérea difícil", "cricotiroidotomía", "inducción",
  ],
  "edema-agudo-pulmao": [
    "epa", "edema agudo", "edema pulmonar", "congestión", "insuficiencia cardíaca",
    "vni", "cpap", "ahogado en secreciones",
  ],
  "cetoacidose-hiperosmolar": [
    "cad", "cetoacidosis", "ehh", "estado hiperosmolar", "diabetes",
    "hiperglucemia", "cetosis", "coma diabético", "insulina",
  ],
  "ventilacao-mecanica": [
    "ventilación", "vm", "ventilador", "respirador", "parámetros",
    "peep", "volumen corriente", "sdra", "destete", "modo ventilatorio",
  ],
  sedoanalgesia: [
    "sedación", "analgesia", "sedoanalgesia", "midazolam", "fentanilo",
    "propofol", "bloqueante neuromuscular", "bnm", "rass", "relajación muscular",
  ],
  anafilaxia: [
    "anafilaxia", "alergia", "reacción alérgica", "choque anafiláctico",
    "urticaria", "angioedema", "adrenalina intramuscular", "picadura",
  ],
  avc: [
    "acv", "ictus", "accidente cerebrovascular", "trombólisis", "trombectomía",
    "hemiplejia", "afasia", "isquémico", "hemorrágico", "evc", "déficit neurológico",
  ],
  "sindromes-coronarianas": [
    "infarto", "iam", "sca", "síndrome coronario", "elevación del st",
    "angina", "dolor torácico", "troponina", "cateterismo", "stemi",
  ],
  tep: [
    "tep", "embolia pulmonar", "tromboembolismo", "trombo",
    "dímero d", "angiotc de tórax", "trombólisis pulmonar", "cor pulmonale agudo",
  ],
  "pre-eclampsia": [
    "preeclampsia", "eclampsia", "hipertensión en el embarazo", "sulfato de magnesio",
    "convulsión en la embarazada", "hellp", "ehe", "proteinuria",
  ],
  "calculadoras-clinicas": [
    "calculadora", "puntaje", "score", "cálculo", "peso predicho", "tfg",
    "depuración", "glasgow", "sofa", "wells", "heart", "nihss", "fórmula",
  ],
  politrauma: [
    "trauma", "politraumatismo", "atls", "accidente", "hemorragia", "xabcde",
    "transfusión masiva", "ácido tranexámico", "fast", "torniquete",
  ],
  tce: [
    "tce", "traumatismo craneal", "trauma de cráneo",
    "hipertensión intracraneal", "pic", "pupila", "hematoma", "cabeza",
  ],
  "crises-convulsivas": [
    "convulsión", "crisis convulsiva", "estado epiléptico", "epiléptico",
    "epilepsia", "benzodiacepina", "diazepam", "fenitoína", "convulsionando",
  ],
  "intoxicacoes-exogenas": [
    "intoxicación", "envenenamiento", "sobredosis", "antídoto", "veneno",
    "toxíndrome", "carbón activado", "naloxona", "flumazenil", "intento de suicidio",
  ],
  "abdome-agudo": [
    "abdomen agudo", "dolor abdominal", "panza", "apendicitis", "peritonitis",
    "obstrucción intestinal", "abdomen quirúrgico", "descompresión dolorosa",
  ],
  choque: [
    "choque", "hipotensión", "presión baja", "hipoperfusión", "colapso",
    "choque cardiogénico", "choque hipovolémico", "choque distributivo", "rush",
  ],
  "insuficiencia-respiratoria": [
    "insuficiencia respiratoria", "disnea", "falta de aire", "hipoxemia",
    "hipercapnia", "saturación baja", "cansancio respiratorio", "dificultad respiratoria",
  ],
};

/** As duas listas, amarradas pela chave do módulo. */
export const SINONIMOS_DE_MODULO: Record<string, Record<string, readonly string[]>> = {
  "pt-BR": PT_BR,
  "es-419": ES_419,
};

/**
 * Os sinônimos de um módulo no idioma pedido. Lista vazia quando o id não
 * existe — e o português é a reserva, porque uma busca que não acha nada é
 * pior que uma que acha pelo termo do outro idioma.
 */
export function getSinonimos(moduleId: string, locale = "pt-BR"): readonly string[] {
  const porIdioma = SINONIMOS_DE_MODULO[locale] ?? SINONIMOS_DE_MODULO["pt-BR"];
  return porIdioma[moduleId] ?? SINONIMOS_DE_MODULO["pt-BR"][moduleId] ?? [];
}
