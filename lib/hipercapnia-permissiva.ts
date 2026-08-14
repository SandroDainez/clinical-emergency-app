/**
 * Hipercapnia permissiva — onde NÃO se aplica (R-40).
 *
 * ── O DEFEITO QUE ORIGINOU ───────────────────────────────────────────────────
 *
 * O nó `pressao_alta` da Ventilação dizia "aceitar hipercapnia permissiva
 * (pH ≥ 7,20)" SEM QUALIFICAÇÃO — e é nó TRANSVERSAL: os sete cenários do
 * módulo passam por `seguranca`, que leva a `pressao_alta` sempre que as
 * pressões sobem. O piso de 7,20 é convenção da SDRA, e ali governava asma,
 * TCE, choque séptico, obeso e pulmão normal.
 *
 * O nó SARA (`pat_sara`) já trazia UMA exceção — HIC — e o transversal não
 * trazia nenhuma. Dois sítios da mesma regra, com listas diferentes: é o
 * motivo de a lista virar fonte única.
 *
 * ── R-36 APLICADO AO DESENHO DESTE ARQUIVO ───────────────────────────────────
 *
 * A fonte única é a LISTA DE CONTRAINDICAÇÕES — o construto —, NÃO a frase.
 * Os dois sítios precisam de molduras diferentes: no transversal a regra é uma
 * PERMISSÃO que precisa virar "não aplique se X"; no SARA é uma ACEITAÇÃO
 * que precisa de "exceto se X". Unificar a frase seria unificar por
 * coincidência textual — mesma lista, enquadramentos distintos.
 *
 * ── O MECANISMO COMUM ÀS TRÊS CONTRAINDICAÇÕES ───────────────────────────────
 *
 * Não é que a hipercapnia seja mais tóxica nesses pacientes — é que a MARGEM
 * já foi gasta. Aceitar uma elevação de PaCO₂ que seria inócua noutro paciente
 * consome a reserva inteira naquele. Escrito assim de propósito: quem entende
 * o mecanismo reconhece o quarto caso que a lista não previu.
 *
 * Fontes: contraindicações à hipercapnia permissiva incluindo "biochemical
 * disturbances related to systemic acidosis", PIC elevada, função cardíaca
 * deprimida, arritmias e resistência vascular pulmonar aumentada
 * (ScienceDirect — Permissive hypercapnia, revisão de tópico); EMCrit IBCC
 * (Hypercapnia), que registra não haver limite inferior de pH estabelecido —
 * o 7,20 é conforto convencional da SDRA, não regra universal.
 */

/**
 * A LISTA — o construto que os dois sítios compartilham.
 *
 * Literal sem interpolação: template com `${}` sai da varredura de tradução
 * (D-19) e o usuário em espanhol leria português.
 */
export const HIPERCAPNIA_PERMISSIVA_ONDE_NAO_APLICAR =
  "NÃO se aplica a: (1) ACIDOSE METABÓLICA GRAVE — o paciente já gastou o tampão e chega perto do piso; somar acidose respiratória à metabólica é o mecanismo exato da parada peri-intubação, e ele estava HIPERventilando justamente para compensar; (2) HIPERTENSÃO INTRACRANIANA — a hipercapnia vasodilata e eleva a PIC; (3) DISFUNÇÃO DE VENTRÍCULO DIREITO — a hipercapnia aumenta a resistência vascular pulmonar, e no VD já sobrecarregado isso fecha o ciclo. Nos três o mecanismo é o mesmo: a margem já foi gasta antes de a hipercapnia começar.";

/**
 * Moldura do nó TRANSVERSAL (`pressao_alta`) — o veto vem ANTES da permissão.
 *
 * Quem chega a um nó de pressão alta está sob pressão, lê a primeira linha e
 * age. Ressalva no fim é ressalva não lida.
 */
export const HIPERCAPNIA_VETO_ANTES_DE_PERMITIR =
  "⛔ ANTES DE ACEITAR HIPERCAPNIA, CONFIRA O CENÁRIO — este passo é alcançado a partir de QUALQUER estratégia, e a tolerância de pH ≥ 7,20 é convenção da SDRA, não regra geral.";

/** Moldura do nó de SDRA — ali a aceitação é a regra, e a lista é a exceção. */
export const HIPERCAPNIA_EXCECAO_NA_SDRA =
  "⚠️ EXCEÇÕES à hipercapnia permissiva, mesmo na SDRA — nestes casos o piso de pH 7,20 NÃO vale e a ventilação-minuto tem de ser mantida:";
