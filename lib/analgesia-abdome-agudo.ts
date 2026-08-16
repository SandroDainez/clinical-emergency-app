/**
 * Analgesia na dor abdominal aguda — o mito, o fármaco e a titulação.
 *
 * ── O DEFEITO QUE ORIGINOU ──────────────────────────────────────────────────
 *
 * O módulo derrubava o mito em TRÊS superfícies — "analgesia adequada NÃO
 * mascara o diagnóstico nem atrasa a cirurgia; não postergar opioide" — e não
 * dizia QUAL opioide, QUANTO nem COMO. Zero menção a morfina ou fentanil nas
 * 361 linhas.
 *
 * Instrução de administrar sem o meio de executá-la, repetida três vezes, num
 * app que dá a diluição da vasopressina e a concentração do frasco de HNF.
 * Deixar como dívida seria manter o mito derrubado e a conduta inexecutável.
 *
 * ── POR QUE LIB NOVA, E NÃO REAPROVEITAR AS DUAS QUE EXISTEM (R-36) ────────
 *
 * `lib/fentanil-analgosedacao.ts` é fentanil para SEDAÇÃO em ventilação
 * mecânica; `lib/morfina-dispneia.ts` é morfina para DISPNEIA refratária. Mesmo
 * fármaco, indicação e titulação diferentes — o alvo lá é conforto
 * respiratório e sincronia, aqui é dor com REEXAME seriado do abdome. Fundir
 * levaria a dose de um cenário para o outro.
 *
 * ── FONTES ABERTAS EM SESSÃO (2026-08-16) ──────────────────────────────────
 *
 *  · SAEM/CDEM, "Acute pain control" (M3 curriculum): "A safe starting dose of
 *    morphine is 0.1 mg/kg and should be given intravenously"; titulação
 *    "0.025-0.05 mg/kg every 5-15 minutes following the initial bolus";
 *    fentanil "1-1.5 μg/kg IV", que tem a vantagem de "acting rapidly (within
 *    1-2 minutes) and having a shorter half-life, allowing for serial
 *    reexaminations"; e, sobre o exame, "Patients in pain […] are often so
 *    uncomfortable that examinations may be rendered more reliable after their
 *    pain is treated".
 *  · Bula do cetorolaco (DailyMed/FDA), seção CONTRAINDICATIONS — as três
 *    citadas abaixo, verbatim no comentário de cada uma.
 *  · Revisão sistemática Cochrane (Manterola) sobre analgesia na dor abdominal
 *    aguda. ⚠️ O TEXTO INTEGRAL NÃO ABRIU (403). O que se usa aqui é o
 *    resultado indexado — a analgesia precoce reduz a dor "and this does not
 *    interfere with diagnosis, which may even be facilitated despite a
 *    reduction in the severity of physical signs" — e por isso a frase do app
 *    atribui a "revisão sistemática", sem citar número de ensaios ou de
 *    pacientes que não foram conferidos na fonte primária.
 */

/**
 * O mito, com a razão fisiológica — que é o que faz a regra grudar.
 * Mesmo argumento do TCE: mandar sem explicar não gruda.
 */
export const ANALGESIA_NAO_MASCARA =
  "ANALGESIA NÃO MASCARA O DIAGNÓSTICO nem atrasa a cirurgia — revisão sistemática mostra que a analgesia precoce reduz muito a dor sem aumentar erro diagnóstico, e que o diagnóstico pode até ficar MAIS FÁCIL, ainda que os sinais físicos fiquem menos intensos. A razão é simples: o paciente com dor forte contrai a parede o tempo todo, e a defesa voluntária esconde a involuntária. Tratando a dor, o abdome relaxa e o que sobra de defesa é o que interessa.";

/**
 * ⚠️ A TITULAÇÃO É A CONDUTA, e por isso vem antes das doses no texto.
 *
 * Dose fixa em dor abdominal subdosa quem tem dor grande e sobra em quem tem
 * dor pequena. E a segunda metade importa tanto quanto a primeira: quem
 * analgesia e para de reexaminar trocou um erro por outro.
 */
export const ANALGESIA_TITULA_AO_CONFORTO =
  "⚠️ TITULE AO CONFORTO, NÃO À DOSE — opioide na dor abdominal se ajusta pela resposta, com reavaliação a cada poucos minutos, e não por uma dose única calculada de uma vez. E ATENÇÃO À OUTRA METADE: analgesia NÃO substitui o reexame. A reavaliação seriada do abdome, de preferência pelo mesmo examinador, continua sendo a conduta — quem trata a dor e para de examinar apenas trocou um erro por outro.";

export const ANALGESIA_MORFINA =
  "MORFINA IV — dose inicial 0,1 mg/kg, seguida de 0,025–0,05 mg/kg a cada 5–15 minutos até o conforto (SAEM/CDEM). Antiemético junto, porque náusea e vômito já fazem parte do quadro e o opioide soma.";

/**
 * ⚠️ A PONTE ENTRE A FARMACOLOGIA E A CONDUTA DESTE MÓDULO É RACIOCÍNIO
 * DECLARADO, NÃO CITAÇÃO.
 *
 * A fonte dá a meia-vida curta como PROPRIEDADE do fentanil ("allowing for
 * serial reexaminations"). Quem liga essa propriedade à conduta central do
 * abdome agudo — o reexame seriado — é este app, e a frase abaixo diz isso com
 * todas as letras para não parecer que a fonte fez a ligação.
 */
export const ANALGESIA_FENTANIL =
  "FENTANIL IV — 1–1,5 mcg/kg, início em 1–2 minutos e meia-vida curta (SAEM/CDEM). ⚠️ E ISTO IMPORTA AQUI MAIS DO QUE EM OUTROS LUGARES: a conduta central do abdome agudo é o REEXAME SERIADO, e a meia-vida curta é justamente o que permite reexaminar sem ter de esperar a droga passar. Onde o abdome vai ser reavaliado de hora em hora — que é sempre —, essa propriedade deixa de ser detalhe farmacológico e vira critério de escolha.";

/**
 * ⚠️ AINE ANCORADO NO CENÁRIO, NÃO EM LISTA DE BULA.
 *
 * As três contraindicações do rótulo do cetorolaco descrevem, uma a uma, os
 * três estados mais comuns deste módulo. Lista genérica se lê e não se aplica;
 * cenário nomeado se reconhece — o médico olha para o paciente dele e vê.
 *
 * Verbatim da bula (DailyMed/FDA), para o texto do app não precisar carregar
 * inglês:
 *  · "CONTRAINDICATED in patients with active peptic ulcer disease, in patients
 *    with recent gastrointestinal bleeding or perforation";
 *  · "CONTRAINDICATED in patients with advanced renal impairment and in
 *    patients at risk for renal failure due to volume depletion";
 *  · "CONTRAINDICATED as prophylactic analgesic before any major surgery and is
 *    CONTRAINDICATED intra-operatively when hemostasis is critical".
 *
 * E NÃO é proibição absoluta — é que os três estados o tiram da mesa quase
 * sempre. Escrever "nunca use AINE" seria fácil e errado: a cólica renal
 * confirmada por imagem, num paciente hidratado e sem cirurgia à vista, segue
 * sendo indicação clássica.
 */
export const ANALGESIA_AINE_PENSE_DUAS_VEZES =
  "⚠️ AINE: PENSE DUAS VEZES — e olhe o seu paciente, porque a bula do cetorolaco contraindica exatamente os três estados mais comuns deste módulo. (1) PERFURAÇÃO POSSÍVEL: contraindicado em úlcera péptica ativa e em sangramento ou PERFURAÇÃO gastrointestinal recente — e perfuração é justamente uma das hipóteses que você ainda não excluiu. (2) HIPOVOLÊMICO POR JEJUM, VÔMITO E TERCEIRO ESPAÇO: contraindicado em quem está sob risco de insuficiência renal por depleção de volume — o rim depende de prostaglandina exatamente quando o paciente está seco. (3) LAPAROTOMIA PROVÁVEL: contraindicado como analgésico profilático ANTES de qualquer cirurgia de grande porte e no intraoperatório em que a hemostasia é crítica, porque ele inibe a função plaquetária. NÃO é proibição absoluta do AINE no abdome agudo — a cólica renal já confirmada, em paciente hidratado e sem cirurgia à vista, continua sendo indicação clássica. É que, no abdome agudo indiferenciado, os três estados acima o tiram da mesa quase sempre.";
