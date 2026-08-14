/**
 * Alergia a beta-lactâmico na sepse — a alternativa que a árvore não tinha (S3).
 *
 * ── O DEFEITO ───────────────────────────────────────────────────────────────
 *
 * Os NOVE nós de antibiótico da árvore de sepse prescreviam beta-lactâmico
 * (ceftriaxona, pip-tazo, cefepima, ampicilina, meropeném) sem UMA menção ao
 * que fazer quando o paciente é alérgico. E é decisão de PRIMEIRA HORA: define
 * qual antibiótico entra, não como ajustá-lo depois.
 *
 * O conteúdo existia em `sepsis-antibiotic-engine.ts` — arquivo morto, sem
 * nenhum importador (D-22). Validado contra fonte antes de portar, porque
 * engine morto não é fonte (R-35).
 *
 * ── O QUE A FONTE SUSTENTA, E O QUE ELA CORRIGE NO ARQUIVO MORTO ────────────
 *
 * 1. A MAIORIA DOS RÓTULOS DE ALERGIA NÃO É ALERGIA. Trocar o beta-lactâmico
 *    por reflexo tem custo: as alternativas são "less effective... associated
 *    with a higher frequency of adverse effects... unnecessary exposure to
 *    broad-spectrum antibiotics with the attendant risk of selection of
 *    multidrug-resistant microorganisms". Ou seja, evitar sem estratificar É
 *    uma decisão clínica, não a ausência de uma.
 *
 * 2. O AZTREONAM É A SAÍDA, COM UMA EXCEÇÃO NOMEADA. Não há reatividade
 *    cruzada IgE nem mediada por células T entre penicilinas e aztreonam, nem
 *    entre cefalosporinas e aztreonam — EXCETO ceftazidima, que compartilha a
 *    cadeia lateral R1 idêntica. Essa exceção não estava no arquivo morto, e é
 *    a única situação em que o aztreonam pode reproduzir a reação.
 *
 * Fontes: J Allergy Clin Immunol 2016 (reatividade cruzada de aztreonam e
 * cefalosporinas em hipersensibilidade a penicilinas); Clin Ther 2024 —
 * segurança de aztreonam vs. ceftazidima em rotulados como alérgicos à
 * penicilina; IDSA (seleção empírica considerando história de alergia grave).
 */

/**
 * A pergunta que vem ANTES da troca — e ela muda a conduta em quase todos.
 *
 * Literal sem interpolação: template com `${}` sai da varredura de tradução
 * (D-19) e o usuário em espanhol leria português.
 */
export const ALERGIA_BL_ESTRATIFICAR =
  "⚠️ ANTES DE TROCAR, ESTRATIFIQUE — a maioria dos rótulos de \"alergia a penicilina\" não corresponde a alergia mediada por IgE. REAÇÃO NÃO GRAVE (exantema tardio isolado, intolerância gastrointestinal, história vaga ou de infância): o beta-lactâmico pode ser mantido, e trocar por reflexo é decisão com custo — as alternativas são menos eficazes, têm mais efeitos adversos e ampliam o espectro sem necessidade, selecionando MDR. REAÇÃO GRAVE/IMEDIATA (anafilaxia, angioedema, broncoespasmo, hipotensão, urticária em minutos a 1 h, SSJ/NET, DRESS): aí sim, evitar todo beta-lactâmico.";

/** A alternativa quando a reação é grave/imediata — com a exceção que importa. */
export const ALERGIA_BL_ALTERNATIVA =
  "ALERGIA GRAVE/IMEDIATA CONFIRMADA — substituir por: AZTREONAM 2 g IV 8/8h para cobertura Gram-negativa (incluindo Pseudomonas) + VANCOMICINA em dose de ataque para Gram-positivos. Acrescentar METRONIDAZOL 500 mg IV 8/8h se o foco for abdominal (o aztreonam não cobre anaeróbios). Foco pulmonar: LEVOFLOXACINO 750 mg IV/24h cobre atípicos e Gram-negativos, e substitui o par nesse cenário.";

/**
 * A exceção nomeada. Separada de propósito: numa lista, a linha da alternativa
 * é lida e a ressalva se perde — e esta é a única situação em que o aztreonam
 * reproduz a reação que se quis evitar.
 */
export const ALERGIA_BL_EXCECAO_CEFTAZIDIMA =
  "⚠️ ÚNICA EXCEÇÃO DO AZTREONAM — CEFTAZIDIMA: o aztreonam NÃO tem reatividade cruzada com penicilinas nem com as demais cefalosporinas, mas compartilha cadeia lateral R1 IDÊNTICA com a ceftazidima. Em alergia CONFIRMADA à ceftazidima, o aztreonam pode reproduzir a reação — nesse caso, cobertura Gram-negativa por outra classe (fluoroquinolona ou aminoglicosídeo, conforme o foco e a função renal).";

/** Quando a alergia é grave, a decisão do agente não se automatiza. */
export const ALERGIA_BL_REVISAO =
  "Alergia grave documentada não automatiza a escolha final: acionar infectologia/farmácia clínica e o protocolo institucional em paralelo ao início do antibiótico — o que NÃO se faz é atrasar a primeira dose esperando o parecer.";
