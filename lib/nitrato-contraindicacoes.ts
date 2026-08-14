/**
 * Nitrato — contraindicações, em fonte única (E6).
 *
 * ── O DEFEITO, E ELE É DE ALCANCE, NÃO DE CONTEÚDO ──────────────────────────
 *
 * A contraindicação existia em `vasoactive-engine.ts:672` (Vasoativas,
 * auditado na Fase 1) e, de passagem, em `coronary-decision-tree.ts:190`. Mas
 * o EAP — o módulo que MAIS prescreve nitrato — não tinha nenhuma.
 *
 * E a versão que existia estava incompleta no que importa operacionalmente:
 * dizia "contraindicado com inibidores de PDE-5" SEM A JANELA DE TEMPO. Sem o
 * número, o médico não sabe se o paciente que tomou ontem está liberado.
 *
 * ── POR QUE ISTO NÃO É PONTEIRO (R-33) ──────────────────────────────────────
 *
 * Contraindicação NÃO é delegável. Não se manda o médico abrir o módulo de
 * Vasoativas para descobrir que a droga que ESTA tela acabou de indicar é
 * contraindicada. Quem prescreve, avisa — ponteiro serve para buscar, não
 * para alertar. Por isso os três módulos consomem a MESMA constante, em vez
 * de um apontar para o outro.
 *
 * Fonte da janela: diretriz de angina instável/NSTEMI — nitrato não deve ser
 * administrado dentro de 24 h da sildenafila/vardenafila nem 48 h da
 * tadalafila. A diferença é farmacocinética: meia-vida da tadalafila 17,5 h
 * vs. 4 h da sildenafila. Dado direto: nitroglicerina sublingual causou
 * hipotensão significativa (PAS < 85) às 4, 8 e 24 h após tadalafila —
 * diferença que desaparece às 48 h.
 */

/**
 * A contraindicação com a janela — e com a instrução operacional.
 *
 * "PERGUNTE, não presuma" está aqui de propósito: é o que separa saber da
 * regra de aplicá-la. A população do EAP é a mesma que usa estes fármacos, e
 * ninguém informa espontaneamente.
 */
export const NITRATO_CONTRAINDICACAO_PDE5 =
  "⛔ NITRATO É CONTRAINDICADO com inibidor de PDE-5: 24 h após sildenafila ou vardenafila, 48 h após tadalafila (meia-vida 17,5 h). A associação causa hipotensão refratária, e a população do EAP e da SCA é a mesma que usa estes fármacos — PERGUNTE, não presuma. Ninguém informa isso espontaneamente.";

/**
 * O uso CRÔNICO — a exceção que a janela não cobre.
 *
 * Quem toma sildenafila 3×/dia para hipertensão pulmonar nunca está fora da
 * janela de 24 h, e é exatamente o paciente que chega com dispneia e
 * congestão. Para ele a contraindicação é permanente enquanto mantiver o
 * fármaco, não uma espera.
 */
export const NITRATO_PDE5_USO_CRONICO =
  "⚠️ USO CRÔNICO PARA HIPERTENSÃO PULMONAR (sildenafila 20 mg 3×/dia — Revatio e genéricos): contraindicação PERMANENTE enquanto o paciente estiver em uso, não janela de 24 h. Esse paciente NUNCA sai da janela — e é justamente quem chega com dispneia e congestão.";

/** As demais contraindicações, na mesma linha do número, para não se perderem. */
export const NITRATO_OUTRAS_CONTRAINDICACOES =
  "Também contraindicado se PAS < 90 mmHg, estenose aórtica grave, ou IAM de ventrículo direito / parede inferior com hipotensão — nesses o nitrato derruba a pré-carga de que o VD depende. Conduta oposta: VOLUME (cristaloide), não vasodilatador.";
