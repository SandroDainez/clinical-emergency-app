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
  "drogas-vasoativas": [
    "vasoativa", "vasopressor", "noradrenalina", "norepinefrina", "dobutamina",
    "adrenalina em infusão", "vasopressina", "diluição", "bomba de infusão", "gama",
  ],
  "correcoes-eletroliticas": [
    "eletrólito", "sódio", "potássio", "cálcio", "magnésio", "fósforo",
    "hiponatremia", "hipercalemia", "hipocalemia", "distúrbio hidroeletrolítico",
  ],
  // ⚠️ SINÔNIMOS QUE NÃO REPETEM O TÍTULO. A busca do hub precisa distinguir a
  // V2 da V1 pelo que ela FAZ de diferente — decisões numeradas, ECG guiado,
  // caminho crítico —, senão as duas competem pelos mesmos termos e o médico
  // não sabe qual abriu.
  "calculadoras-clinicas": [
    "calculadora", "escore", "score", "cálculo", "peso predito", "tfg",
    "clearance", "glasgow", "sofa", "wells", "heart", "nihss", "fórmula",
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
  "drogas-vasoativas": [
    "vasoactiva", "vasopresor", "noradrenalina", "norepinefrina", "dobutamina",
    "adrenalina en infusión", "vasopresina", "dilución", "bomba de infusión", "gamma",
  ],
  "correcoes-eletroliticas": [
    "electrolito", "sodio", "potasio", "calcio", "magnesio", "fósforo",
    "hiponatremia", "hipercalemia", "hipocalemia", "trastorno hidroelectrolítico",
  ],
  "calculadoras-clinicas": [
    "calculadora", "puntaje", "score", "cálculo", "peso predicho", "tfg",
    "depuración", "glasgow", "sofa", "wells", "heart", "nihss", "fórmula",
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
