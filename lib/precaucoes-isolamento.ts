/**
 * Precauções de isolamento na sepse — a decisão do PRIMEIRO CONTATO (S4).
 *
 * ── POR QUE ESTÁ NO ESCOPO ──────────────────────────────────────────────────
 *
 * PD-1 decidiu que o app termina na estabilização inicial. Isolamento parecia
 * conduta de internação, e não é: decide-se **antes de tocar o paciente**, e é
 * a única conduta do módulo que protege TERCEIROS — equipe, o paciente do leito
 * ao lado, o próximo atendimento. Deixar de fora seria estranho num app de
 * emergência.
 *
 * ── E É PRECAUÇÃO EMPÍRICA, NÃO CONFIRMADA ──────────────────────────────────
 *
 * O CDC organiza isto por SÍNDROME CLÍNICA, justamente porque a decisão precede
 * o diagnóstico: "Clinical Syndromes or Conditions Warranting Empiric
 * Transmission-Based Precautions in Addition to Standard Precautions"
 * (Appendix A). Esperar a cultura para isolar é isolar tarde.
 *
 * As três categorias são SEMPRE somadas às precauções-padrão, nunca as
 * substituem — e podem ser combinadas entre si.
 *
 * Fonte: CDC, Guideline for Isolation Precautions — Transmission-Based
 * Precautions e Appendix A (tipo e duração por síndrome).
 */

/** A regra que enquadra as três: empírica, somada ao padrão, antes do diagnóstico. */
export const PRECAUCOES_REGRA =
  "PRECAUÇÕES DE ISOLAMENTO — decidir AGORA, pela SÍNDROME, sem esperar cultura. As precauções abaixo são SEMPRE somadas às precauções-padrão (higiene de mãos, luvas e avental conforme exposição a fluidos), nunca as substituem, e podem ser combinadas entre si. É a única conduta deste fluxo que protege TERCEIROS — equipe, o leito ao lado, o próximo atendimento.";

/** Gotículas — o caso em que o atraso custa mais, porque a profilaxia tem janela. */
export const PRECAUCOES_GOTICULAS =
  "GOTÍCULAS (máscara cirúrgica a menos de 1 m; quarto individual ou coorte): suspeita de MENINGITE bacteriana ou MENINGOCOCCEMIA — manter até 24 h de antibiótico eficaz. Também em influenza e outros vírus respiratórios. ⚠️ Na doença meningocócica, a exposição sem proteção obriga PROFILAXIA da equipe, independentemente do estado vacinal — então o atraso em isolar cria um segundo problema, não só um risco.";

/** Aéreo — o único que exige estrutura, e por isso o que mais atrasa. */
export const PRECAUCOES_AEREO =
  "AÉREO (máscara N95/PFF2 para a equipe; quarto com pressão negativa — AIIR): suspeita de TUBERCULOSE pulmonar ou laríngea, sarampo, varicela/zóster disseminado. São patógenos que permanecem infectantes suspensos no ar e transmitem a longa distância. ⚠️ Se não houver quarto com pressão negativa, isolar no melhor recurso disponível e acionar a CCIH imediatamente — a ausência de estrutura não suspende a precaução.";

/** Contato — o mais frequente na sepse, e o que depende de história. */
export const PRECAUCOES_CONTATO =
  "CONTATO (luvas e avental na entrada; equipamento dedicado): colonização ou infecção conhecida/suspeita por MDR — KPC, VRE, Acinetobacter, MRSA —, diarreia aguda com suspeita de C. difficile (higiene de mãos com ÁGUA E SABÃO, o álcool não elimina esporos), feridas com drenagem não contida e lesões cutâneas extensas. Gatilhos de suspeita: internação ou antibiótico nos últimos 90 dias, transferência de outro serviço ou de ILPI, diálise, colonização prévia documentada.";

/**
 * O que NÃO se faz, e é a linha que evita um erro de sinal contrário.
 *
 * Isolamento reverso de rotina no imunossuprimido foi descontinuado; o que
 * protege é a precaução-padrão bem executada. Escrito porque a intuição de
 * "proteger quem está frágil" produz a conduta errada.
 */
export const PRECAUCOES_NAO_FAZER =
  "⚠️ NÃO fazer isolamento protetor (\"reverso\") de rotina no imunossuprimido — foi descontinuado como prática geral, e o que protege esse paciente é a precaução-padrão bem executada, mais o quarto individual quando indicado. Exceção: receptor de transplante de células-tronco hematopoéticas, que tem ambiente próprio protocolizado.";
