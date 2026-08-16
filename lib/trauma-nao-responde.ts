/**
 * Trauma — quando abreviar a cirurgia, e por que ele não responde.
 *
 * ── ACHADO 1: O APP DESCREVIA DAMAGE CONTROL E NÃO DIZIA QUANDO ────────────
 *
 * O módulo tinha a tríade letal com o mecanismo, a técnica (empacotar, fechar
 * temporariamente, UTI) e a reoperação em 24–48 h. O que faltava era o
 * CRITÉRIO: quando parar de operar.
 *
 * E a única porta de entrada era o botão "não respondeu / resposta transitória"
 * — que é RESPOSTA HEMODINÂMICA, medida antes da sala. ⚠️ Quem espera o "não
 * respondeu" para decidir abreviar JÁ PASSOU DO PONTO: a decisão é
 * INTRAOPERATÓRIA, tomada com o abdome aberto e a fisiologia na sua frente, e
 * não depende de o paciente ter deixado de responder.
 *
 * ── ACHADO 2: O PAR DO CHOQUE, APLICADO AO TRAUMA ──────────────────────────
 *
 * O módulo diz "choque é HEMORRÁGICO até prova em contrário — buscar sangue em
 * 5 locais", que é excelente e é UM lado. Busca por "medular", "neurogênico",
 * "causa não hemorrágica": ZERO.
 *
 * O botão "não respondeu" leva DIRETO para damage control — ou seja, para a
 * sala. Um choque neurogênico puro vai para laparotomia.
 *
 * ── FONTES ──────────────────────────────────────────────────────────────────
 *
 * ATLS e a literatura de controle de danos, já usadas no módulo (a tríade
 * letal, o 1:1:1 e o CRASH-2 vieram dali na Fase 1). ⚠️ Os parâmetros abaixo
 * são os classicamente citados como gatilho de abreviação; NÃO reabri fonte
 * primária para eles nesta sessão, e por isso o texto os apresenta como
 * SINAIS DE ALARME que somam, não como critérios com ponto de corte validado.
 */

export const DAMAGE_CONTROL_QUANDO_ABREVIAR =
  "⚠️ QUANDO ABREVIAR — A DECISÃO É INTRAOPERATÓRIA, e não espera o paciente parar de responder: quem aguarda o \"não respondeu\" já passou do ponto. Os sinais somam e valem MAIS JUNTOS do que isoladamente: hipotermia (< 35 °C, e a temperatura cai rápido com abdome aberto), acidose que não corrige (pH < 7,2 ou lactato subindo apesar da reanimação), coagulopatia CLÍNICA — sangramento difuso em superfície cruenta e nas punções, que aparece antes de qualquer exame voltar —, transfusão acumulada em volume alto, e tempo de sala se estendendo sem hemostasia. Diante deles: controlar sangramento e contaminação, empacotar, fechar temporariamente e levar à UTI para corrigir a fisiologia. A reoperação programada é o plano, não a falha.";

export const TRAUMA_NAO_RESPONDE_QUATRO_CAUSAS =
  "NÃO RESPONDEU A VOLUME E SANGUE — são QUATRO explicações, e o app cobre bem a primeira: (1) HEMORRAGIA NÃO IDENTIFICADA — refaça os 5 locais, e lembre que o retroperitônio e a pelve não aparecem no FAST; (2) TAMPONAMENTO — janela pericárdica no FAST, e a conduta é drenar, não transfundir mais; (3) PNEUMOTÓRAX HIPERTENSIVO — pode ter surgido DEPOIS da avaliação inicial, sobretudo em ventilação com pressão positiva; (4) CHOQUE NEUROGÊNICO por lesão medular. As três últimas não melhoram com volume, e insistir nele atrasa a conduta que resolve.";

/**
 * ⚠️ Escrito no molde do par cardiogênico × obstrutivo do módulo de Choque: o
 * sinal que separa é CONTRAINTUITIVO o bastante para ser descartado como
 * artefato, e por isso vem com a consequência do erro nas DUAS direções.
 */
export const TRAUMA_CHOQUE_NEUROGENICO =
  "CHOQUE NEUROGÊNICO — o sinal que o separa é o PADRÃO INVERTIDO: hipotensão COM BRADICARDIA (ou sem a taquicardia que se esperaria), pele QUENTE e seca, e pressão de pulso alargada. É o oposto do padrão hemorrágico, e é contraintuitivo o bastante para alguém descartar a bradicardia como artefato do monitor. Ocorre em lesão medular acima de T6, por perda do tônus simpático. A conduta é vasopressor e cronotrópico, não mais volume — volume sem vasopressor só dilui. ⚠️ CONSEQUÊNCIA DE ERRAR PARA UM LADO: um neurogênico puro tratado como hemorrágico vai para laparotomia atrás de um sangramento que não existe. ⚠️ E PARA O OUTRO, QUE É IGUALMENTE PERIGOSO: o padrão neurogênico NÃO EXCLUI SANGRAMENTO — hemorragia com lesão medular associada é comum no trauma de alta energia, e o tônus perdido MASCARA a taquicardia que denunciaria a perda de volume. Havendo os dois, trate os dois.";
