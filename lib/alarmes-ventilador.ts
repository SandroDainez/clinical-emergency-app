/**
 * Alarmes do ventilador — a configuração que a árvore não pedia (V5).
 *
 * ── O DEFEITO ───────────────────────────────────────────────────────────────
 *
 * A árvore da Ventilação monta o ventilador inteiro — modo, Vt, FR, PEEP,
 * FiO₂, I:E — e nunca manda configurar alarme nenhum. Ventilador sem alarme
 * ajustado é monitorização que não avisa: a desconexão, a obstrução e a
 * apneia deixam de ser detectadas pelo único dispositivo que estava vigiando.
 *
 * O conteúdo existia só em `protocols/ventilacao_mecanica.json`, consumido
 * exclusivamente pelo `ventilation-engine.ts` — código morto (D-22).
 *
 * ── O PRINCÍPIO QUE TORNA OS NÚMEROS UTILIZÁVEIS ────────────────────────────
 *
 * Alarme NÃO é valor fixo de tabela: é margem em torno do que ESTE paciente
 * está fazendo agora. Por isso os limites abaixo são todos relativos ao valor
 * medido — "10–20 acima do pico atual", não "45".
 *
 * É o que separa alarme útil de fadiga de alarme: limite fixo num paciente
 * com pico alto dispara o tempo todo e é silenciado; num paciente com pico
 * baixo, nunca dispara e a desconexão passa.
 *
 * Fonte: literatura de segurança em ventilação mecânica (StatPearls,
 * Ventilator Safety) e prática de terapia respiratória — os limites são
 * margens relativas ao medido, com a apneia em 20 s como padrão fixo.
 */

/** O princípio, antes dos números — sem ele, os valores viram tabela decorada. */
export const ALARMES_PRINCIPIO =
  "CONFIGURAR OS ALARMES antes de sair do leito — ventilador sem alarme ajustado é monitorização que não avisa. Os limites são MARGEM EM TORNO DO QUE ESTE PACIENTE ESTÁ FAZENDO AGORA, não valores fixos de tabela: limite fixo dispara o tempo todo em quem tem pico alto (e acaba silenciado) e nunca dispara em quem tem pico baixo (e a desconexão passa).";

/** Pressão — os dois lados, e o que cada um significa. */
export const ALARMES_PRESSAO =
  "PRESSÃO DE PICO — alta: 10–20 cmH₂O ACIMA do pico atual do paciente. Dispara em obstrução, mordedura do tubo, secreção, broncoespasmo, queda de complacência ou pneumotórax — é o alarme que pede avaliação IMEDIATA à beira do leito. PRESSÃO baixa: 5–10 cmH₂O ABAIXO do pico atual — dispara em desconexão, vazamento no circuito ou cuff insuflado de menos.";

/** Volume e frequência — a rede que pega hipoventilação silenciosa. */
export const ALARMES_VOLUME =
  "VOLUME CORRENTE EXALADO — mínimo: cerca de 100 mL abaixo do VC exalado medido. É o que detecta vazamento e desconexão parcial, que a pressão sozinha pode não pegar. VOLUME MINUTO: cerca de 4–6 L/min abaixo e 6–8 L/min acima do medido. FREQUÊNCIA respiratória alta: 15–20 acima da frequência medida — dispara em taquipneia por dor, agitação, acidose ou piora da mecânica.";

/** Apneia — o único que é valor fixo, e por isso o que se esquece de conferir. */
export const ALARMES_APNEIA =
  "APNEIA: 20 segundos — este é o único limite que NÃO é relativo ao paciente, e por isso é o que se esquece de conferir. Em modo espontâneo ou durante o desmame, é a rede que detecta a parada do drive antes da dessaturação. Alterar só por indicação declarada.";

/** O que fazer quando um alarme dispara — a ordem importa. */
export const ALARMES_CONDUTA =
  "⚠️ QUANDO O ALARME DISPARA: primeiro OLHE O PACIENTE, não o ventilador. Se houver instabilidade, DESCONECTAR e ventilar com bolsa-válvula-máscara em O₂ 100% resolve e diagnostica ao mesmo tempo — melhora imediata aponta para o circuito/ventilador, ausência de melhora aponta para o paciente (DOPES: Deslocamento do tubo, Obstrução, Pneumotórax, Equipamento, empilhamento de ar/auto-PEEP). NUNCA silenciar alarme repetitivo sem ter identificado a causa: alarme silenciado por incômodo é o defeito que precede o evento.";
