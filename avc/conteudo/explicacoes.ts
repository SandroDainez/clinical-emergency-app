/**
 * AS EXPLICAÇÕES CURTAS — para quem está preenchendo rápido e ⛔ não lembra o
 * termo.
 *
 * ── PROCEDÊNCIA (E-30, E-31) ───────────────────────────────────────────────
 *
 * ⚠️⚠️ ⛔ NENHUMA destas frases foi escrita de memória. Elas são **redação
 * condensada a partir das instruções oficiais do NIH Stroke Scale / AHA**,
 * fornecida pelo autor em **2026-08-29**, e a conferência contra o documento
 * oficial está declarada como **pendente** — o mesmo tratamento que F-27 recebeu.
 *
 * ⚠️ A distinção que sustenta isto: a Table 4 (F-17) nomeia os achados por
 * **corte de item do NIHSS**, e é a própria escala que descreve operacionalmente
 * o que cada item mede. Explicar o achado pelo item ⛔ não é inventar conteúdo:
 * é dizer o que o instrumento já diz.
 *
 * ⛔ O QUE ⛔ NÃO ENTRA AQUI: pontuação, corte, conduta, elegibilidade. Estas
 * frases explicam **o que é** e **como se testa** — e ⛔ nada além. A lógica
 * derivada ⛔ não olha para elas.
 */

/**
 * O QUE O ACHADO É — uma linha, visível sob o nome.
 *
 * ⚠️ VISÍVEL, e ⛔ não atrás do ⓘ: o médico que ⛔ não lembra o termo precisa da
 * definição no momento de responder, ⛔ não a um toque de distância. O que foi
 * para o ⓘ em troca foram as CATEGORIAS da escala e o como-testar — detalhe de
 * consulta, ⛔ não de execução (§7.3).
 */
export const DEFINICAO_DO_ACHADO: Readonly<Record<string, string>> = {
  t4_hemianopsia_completa: "Perda completa de uma metade do campo visual.",
  t4_afasia_grave:
    "Linguagem muito comprometida: comunicação fragmentada, com grande necessidade de inferência ou questionamento pelo examinador.",
  t4_extincao_grave:
    "Deixa de perceber estímulos de um lado, principalmente quando os dois lados são estimulados ao mesmo tempo; nos casos graves, orienta-se apenas para um lado do espaço.",
  t4_fraqueza_contra_gravidade:
    "O membro não consegue manter a posição solicitada contra a gravidade e cai em direção ao leito.",

  /**
   * ⚠️⚠️ OS SETE ACHADOS QUALITATIVOS — redação autorizada pelo autor em
   * 2026-08-29, com o ajuste que ele fez questão de fixar:
   *
   * ⛔⛔ ELAS EXPLICAM O **TERMO**, e ⛔ NUNCA dizem que o achado é não
   * incapacitante. A Table 4 lista estes déficits como exemplos que **podem não
   * ser** claramente incapacitantes, *"always considering individual
   * circumstances"* — uma glosa que dissesse "não incapacitante" achataria o
   * hedge (E-45) e transformaria exemplo em classificação.
   *
   * ⚠️ ⛔ Elas ⛔ não são deriváveis do NIHSS: a coluna da direita da Table 4 ⛔ não
   * referencia item nenhum, e mapeá-las para itens seria correspondência
   * inventada. Por isso são as únicas que dependem de redação autorizada.
   */
  t4_afasia_leve_isolada:
    "Alteração leve da linguagem, mas ainda consegue se comunicar de forma útil.",
  t4_paralisia_facial_isolada:
    "Assimetria ou fraqueza facial sem outro déficit neurológico associado.",
  t4_fraqueza_cortical_mao:
    "Fraqueza ou perda de destreza predominante na mão, sem déficit motor importante do restante do membro.",
  t4_perda_hemimotora_leve:
    "Fraqueza leve de um lado do corpo, mantendo movimento contra a gravidade.",
  t4_perda_hemissensitiva: "Redução da sensibilidade de um lado do corpo.",
  t4_perda_hemissensitivomotora_leve:
    "Redução leve da força e da sensibilidade no mesmo lado.",
  t4_hemiataxia_leve: "Incoordenação de um lado, mas ainda consegue caminhar.",
};

/**
 * COMO SE TESTA O ITEM — a manobra, em uma linha.
 *
 * ⚠️ Vem das instruções da própria escala. ⛔ Não é pontuação: quanto vale cada
 * achado continua sendo o que a calculadora declara, item a item, e ⛔ estas
 * frases ⛔ não tocam nisso.
 *
 * ⚠️ OS QUINZE ITENS (2026-08-29, autorizado pelo autor): *"não há motivo para
 * os outros oito ficarem sem 'como testar'"*. São uma linha cada, em texto
 * secundário — quem sabe a escala passa o olho, quem ⛔ não sabe tem a manobra.
 */
export const COMO_AVALIAR_ITEM: Readonly<Record<string, string>> = {
  "1a": "Observar o nível de alerta durante o exame; se não responder, estímulo verbal e depois doloroso.",
  "1b": "Perguntar o mês e a idade. Só a primeira resposta conta, e não se dá dica.",
  "1c": "Pedir para abrir e fechar os olhos, e abrir e fechar a mão não parética; se não compreender, demonstrar.",
  "2": "Apenas o olhar horizontal: movimento voluntário ou reflexo óculo-cefálico.",
  "4": "Pedir para mostrar os dentes, sorrir e fechar os olhos com força.",
  "7": "Índex-nariz e calcanhar-joelho, dos dois lados, com os olhos abertos.",
  "8": "Picada ou retirada ao estímulo, comparando os dois lados do corpo.",
  "10": "Pedir para ler ou repetir palavras, e avaliar a articulação da fala.",
  "3": "Confrontação dos campos visuais.",
  "5a": "Manter o braço na posição por 10 segundos.",
  "5b": "Manter o braço na posição por 10 segundos.",
  "6a": "Manter a perna na posição por 5 segundos.",
  "6b": "Manter a perna na posição por 5 segundos.",
  "9": "Descrição de figura, nomeação, leitura, e a compreensão observada durante o exame.",
  "11": "Estímulo simultâneo bilateral, e avaliação de negligência.",
};

export function definicaoDoAchado(campo: string): string | undefined {
  return DEFINICAO_DO_ACHADO[campo];
}

export function comoAvaliarItem(item: string): string | undefined {
  return COMO_AVALIAR_ITEM[item];
}
