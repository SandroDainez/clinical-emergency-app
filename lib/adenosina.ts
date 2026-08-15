/**
 * Adenosina — construto, dose, técnica e apresentação, em fonte única.
 *
 * NASCEU DE DUAS CÓPIAS À MÃO. O construto estava escrito inteiro em dois
 * lugares — a árvore de Taquicardia e o card de Farmacologia — com redação
 * diferente e o mesmo conteúdo: contraindicações, interação com teofilina e
 * dipiridamol, o alerta da digoxina + verapamil, "atropina não bloqueia".
 * Duas redações do mesmo fato divergem na primeira correção que só um dos
 * lados receber.
 *
 * ⚠️ O MOTIVO PRINCIPAL DE ESTA LIB EXISTIR NÃO É A DUPLICAÇÃO — É O R-48.
 *
 * A Farmacologia (superfície de CONSULTA) sabia o volume do flush, o volume da
 * ampola e o "nunca diluir". A árvore (superfície de AÇÃO) não sabia nada
 * disso: dizia "6 mg IV em bólus rápido + flush imediato" e mandava repetir se
 * não revertesse.
 *
 * Na atropina, o volume errado dá dose errada. Na adenosina é pior: a meia-vida
 * é menor que 10 segundos, então o VOLUME DO FLUSH É A TÉCNICA. Quem empurra
 * 6 mg e lava com 5 mL num acesso de dorso da mão não deu uma dose insuficiente
 * — deu uma dose que não chegou ao coração. E o card seguinte manda repetir,
 * atribuindo ao fármaco uma falha que foi de administração.
 *
 * ATRIBUIÇÃO DO ESQUEMA 6–12–12 (as diretrizes divergem, e o app segue o RCUK):
 *
 *  - AHA/ACLS: 6 mg em bolus IV rápido seguido de flush; segunda dose de 12 mg
 *    "if required". NÃO traz terceira dose — após a falha, reavaliar o
 *    diagnóstico e considerar betabloqueador ou bloqueador de canal de cálcio.
 *  - Resuscitation Council UK (ALS): 6 mg → 12 mg → mais um 12 mg.
 *
 * O app segue o RCUK (6–12–12), que é o de uso corrente no Brasil, e a terceira
 * dose fica atribuída no texto para ninguém creditar à AHA o que a AHA não diz.
 *
 * ⚠️ Não confundir com "terceira dose de 18 mg": não foi localizada em ERC 2025
 * nem em RCUK 2025 — as únicas menções encontradas foram um protocolo local em
 * relato de caso e um artigo de 1994. Não entrou no app por isso.
 */

/**
 * R-48 — o detalhe de administração, que pertence à superfície de AÇÃO.
 *
 * Os três itens não são acessórios do fármaco: são o fármaco. Acesso distal,
 * flush pequeno ou injeção lenta produzem exatamente o mesmo quadro clínico que
 * "adenosina não funcionou".
 */
export const ADENOSINA_ADMINISTRACAO =
  "COMO SE DÁ (é a técnica, não o detalhe): apresentação 6 mg/2 mL — 6 mg é UMA ampola inteira, 12 mg são DUAS. NUNCA diluir. Acesso PROXIMAL e calibroso (fossa antecubital ou central), injeção em 1–2 s e FLUSH DE 20 mL de salina IMEDIATAMENTE, com o braço elevado. A meia-vida é menor que 10 segundos: com acesso distal, flush pequeno ou injeção lenta, o fármaco se degrada antes de chegar ao coração — e o quadro é idêntico ao de uma dose que não funcionou.";

export const ADENOSINA_DOSE_TSV =
  "ADENOSINA — 6 mg IV em bolus rápido. Se não reverter em 1–2 min: 12 mg. Se ainda não reverter: o mesmo 12 mg pode ser repetido uma segunda vez (esquema 6–12–12 do Resuscitation Council UK; a AHA descreve 6–12 e, na falha, reavaliar o diagnóstico). ⚠️ Doses acima de 12 mg NÃO são recomendadas, nem em adultos nem em pediatria.";

/**
 * A ordem aqui é deliberada: ANTES de repetir, descartar falha de técnica.
 * Repetir uma dose que não chegou é o erro que o card de administração existe
 * para evitar — e ele acontece justamente porque a repetição está autorizada.
 */
export const ADENOSINA_ANTES_DE_REPETIR =
  "ANTES DE REPETIR, descarte falha de administração: bolus lento, veia periférica fina ou flush insuficiente simulam ausência de resposta. Confirme também registro contínuo do ECG (é a resposta que dá o diagnóstico, mesmo quando o ritmo não reverte), ritmo regular e ausência de pré-excitação.";

export const ADENOSINA_CONTRAINDICACOES =
  "⚠️ CONTRAINDICADA em BAV de 2º ou 3º grau e na doença do nó sinusal, exceto com marca-passo funcionante. NÃO usar em FA ou flutter com PRÉ-EXCITAÇÃO (WPW) — risco de FV. Evitar em broncoconstrição ou broncoespasmo (asma); com cautela na DPOC sem broncoespasmo. ⚠️ Quem desenvolver bloqueio de alto grau com uma dose NÃO deve receber doses adicionais.";

export const ADENOSINA_INTERACOES =
  "INTERAÇÕES QUE MUDAM A DOSE: teofilina e cafeína ANTAGONIZAM — pode ser necessária dose maior, ou o fármaco pode simplesmente não funcionar. Dipiridamol POTENCIALIZA: doses menores podem bastar. Cautela com digoxina, ou digoxina + verapamil (relatos raros de FV nessa associação); carbamazepina aumenta o grau de bloqueio. Individualizar também no transplante cardíaco.";

/**
 * Existe porque a pergunta aparece à beira do leito no pior momento: o paciente
 * fez pausa longa e alguém alcança a atropina. Não funciona — e a informação
 * que acalma é que não precisa funcionar.
 */
export const ADENOSINA_SEM_ANTIDOTO =
  "⚠️ Atropina NÃO bloqueia a adenosina — não serve como antídoto. A meia-vida é menor que 10 s e os efeitos são autolimitados: pausa, bloqueio e o desconforto passam sozinhos. Avisar o paciente antes da injeção sobre rubor, dispneia e opressão torácica transitórios.";
