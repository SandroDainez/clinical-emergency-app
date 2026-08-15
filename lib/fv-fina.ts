/**
 * FV fina × assistolia — a confirmação antes de chamar de assistolia.
 *
 * Nasceu no módulo de Ritmos de Parada, com fonte aberta em sessão (AHA, Adult
 * Advanced Life Support). Virou fonte única quando a auditoria do integrador
 * mostrou que a correção NÃO tinha chegado ao loop da PCR: busca por "fina" no
 * reducer, nas notas de fase e no protocol.json retornava ZERO.
 *
 * É o padrão da correção parcial que a dopamina já tinha mostrado — corrigir o
 * módulo de consulta e deixar o motor para trás. Só que aqui o motor é a
 * superfície onde a decisão acontece: é ele que pergunta "o ritmo é chocável?"
 * e recebe a resposta.
 *
 * A ressalva é DE CONFIRMAÇÃO, não de escolha: os dois erros têm custo, e a
 * manobra que os separa leva segundos.
 */
export const FV_FINA_ANTES_DE_ASSISTOLIA =
  "Não desfibrilar a assistolia confirmada. ⚠️ ANTES DE CONFIRMAR, DESCARTE FV FINA: aumente o GANHO do monitor e confira em 2 derivações. A razão de aumentar o ganho é específica — ganho baixo achata uma FV de baixa amplitude até ela parecer linha reta, e FV fina é ritmo CHOCÁVEL. E a conduta sob dúvida é CONFIRMAR, não escolher um lado: os DOIS erros têm custo (deixar de desfibrilar uma FV fina perde o único tratamento que reverte; desfibrilar assistolia é potencialmente danoso, não apenas inútil), e a manobra que os separa leva segundos — cabe no tempo da parada. Fonte desta ressalva: AHA, Adult Advanced Life Support.";

/** Versão curta, para o card que aparece na checagem de ritmo durante a parada. */
export const FV_FINA_NA_CHECAGEM_DE_RITMO =
  "⚠️ ANTES de chamar de ASSISTOLIA: aumente o GANHO do monitor e confira em 2 derivações. Ganho baixo achata uma FV de baixa amplitude até parecer linha reta — e FV fina é ritmo CHOCÁVEL. Sob dúvida, a conduta é CONFIRMAR, não escolher um lado.";
