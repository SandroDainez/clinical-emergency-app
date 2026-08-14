/**
 * VNI — contraindicações, em fonte única (E2/E3).
 *
 * A lista completa existia em `dyspnea-decision-tree.ts:34` (Insuficiência
 * Respiratória, vivo). O EAP — que indica VNI/CPAP como conduta central —
 * não tinha nenhuma: só critérios de FALHA, que são outra coisa (quando
 * PARAR), não critérios de quando NÃO COMEÇAR.
 *
 * ── E HÁ UMA ORDEM QUE AGRAVA ISSO NO EAP ───────────────────────────────────
 *
 * A árvore do EAP aplica VNI ANTES de classificar a PA. Ou seja, o momento em
 * que a hipotensão apareceria é posterior ao momento em que a VNI foi
 * indicada — e pressão positiva reduz retorno venoso. A ressalva precisa
 * estar no nó da VNI, não depois.
 *
 * Contraindicação não é delegável (R-33): quem prescreve, avisa.
 */

export const VNI_CONTRAINDICACOES =
  "⛔ CONTRAINDICAÇÕES À VNI (avaliar ANTES de colocar a máscara): parada cardiorrespiratória ou respiratória; rebaixamento do nível de consciência, sonolência, agitação, confusão ou recusa; instabilidade hemodinâmica com vasopressor, PAS < 90 ou arritmia complexa; obstrução de via aérea superior ou trauma/cirurgia recente de face; tosse ineficaz ou incapacidade de proteger a via aérea; VÔMITO INCOERCÍVEL ou distensão abdominal — risco de aspiração sob máscara; hemorragia digestiva alta.";

/**
 * A hipotensão, destacada — porque no EAP ela chega DEPOIS da indicação.
 *
 * Separada da lista de propósito: é a única cuja ordem no fluxo do EAP faz
 * com que passe despercebida, e a razão fisiológica precisa estar junto para
 * o médico decidir num paciente limítrofe.
 */
export const VNI_HIPOTENSAO =
  "⚠️ HIPOTENSÃO — contraindicação relativa que se decide ANTES, não depois: a pressão positiva reduz o retorno venoso e pode derrubar o débito em quem já está no limite. No EAP a VNI costuma ser indicada antes de a PA ser classificada, então a checagem tem de acontecer aqui. PAS limítrofe (90–100): se a VNI for mantida, monitorização contínua e plano de IOT à mão.";

/** O paciente ideal — a face positiva, que evita o erro de não indicar. */
export const VNI_PACIENTE_IDEAL =
  "Paciente ideal para VNI: alerta, cooperativo, com reflexos de via aérea intactos e hemodinamicamente estável. Ressalva importante: em serviços experientes, o coma HIPERCÁPNICO da DPOC NÃO contraindica — ali a VNI é o tratamento do rebaixamento, não o risco.";
