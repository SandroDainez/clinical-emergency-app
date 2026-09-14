/**
 * BULA PROFISSIONAL ACTILYSE® — FONTE OFICIAL DA 18ª RODADA (autor, 2026-09-14).
 *
 * ⚠️ Substitui o dossiê de conferência. Bula `17-5762225/15-5566850 I23-01`, MS 1.0367.0049. Páginas pela
 * numeração do rodapé (p. 1–10).
 * ⚠️ Camada REGULATÓRIA, ⛔ clínica: a dose clínica vem da AHA/ASA 2026 (E-48). Onde as duas divergem, a
 * tela mostra as duas posições rotuladas, ⛔ nunca uma só (decisão do autor). ⛔ Nada aqui é resolvido.
 * ⛔ Os critérios de bula ⛔ entram no núcleo como regra determinística: pacote `docs/avc/revisao/bula-x-diretriz.md`.
 */

export const FONTE_BULA_ACTILYSE = "Bula profissional Actilyse® (alteplase), Boehringer Ingelheim, I23-01";

/** ⚠️ Posologia do AVC isquêmico agudo, p. 8; concentração, p. 7. */
export const POSOLOGIA_AVC_BULA = {
  mgPorKg: 0.9,
  maximoMg: 90,
  fracaoBolus: 0.1,
  /** ⚠️ A posologia do AVC ⛔ dá duração do bolus. */
  minutosBolus: undefined,
  notaDoBolus:
    "A posologia do AVC não dá a duração do bolus; 1–2 minutos aparece na posologia da embolia pulmonar (p. 8) e 1 minuto na descrição do estudo NINDS (p. 2).",
  minutosInfusao: 60,
  pagina: 8,
  concentracaoMgPorMl: 1,
  paginaConcentracao: 7,
} as const;

export type LinhaDaTabelaDaBula = {
  readonly pesoKg: number;
  readonly rotulo: string;
  readonly totalMg: number;
  readonly bolusMg: number;
  readonly infusaoMg: number;
};

/**
 * ⚠️ "Tabela de dose para o tratamento do AVC isquêmico agudo", p. 9 — transcrita linha a linha.
 * ⚠️ É CONFERÊNCIA, ⛔ a dose a preparar: a dose exibida é a exata (D-PEND-25). Peso sem linha ⛔ é interpolado.
 */
const L = (pesoKg: number, totalMg: number, bolusMg: number, infusaoMg: number, rotulo = String(pesoKg)): LinhaDaTabelaDaBula =>
  ({ pesoKg, rotulo, totalMg, bolusMg, infusaoMg });

export const TABELA_DE_DOSE_AVC_BULA: readonly LinhaDaTabelaDaBula[] = [
  L(40, 36.0, 3.6, 32.4), L(42, 37.8, 3.8, 34.0), L(44, 39.6, 4.0, 35.6), L(46, 41.4, 4.1, 37.3),
  L(48, 43.2, 4.3, 38.9), L(50, 45.0, 4.5, 40.5), L(52, 46.8, 4.7, 42.1), L(54, 48.6, 4.9, 43.7),
  L(56, 50.4, 5.0, 45.4), L(58, 52.2, 5.2, 47.0), L(60, 54.0, 5.4, 48.6), L(62, 55.8, 5.6, 50.2),
  L(64, 57.6, 5.8, 51.8), L(66, 59.4, 5.9, 53.5), L(68, 61.2, 6.1, 55.1), L(70, 63.0, 6.3, 56.7),
  L(72, 64.8, 6.5, 58.3), L(74, 66.6, 6.7, 59.9), L(76, 68.4, 6.8, 61.6), L(78, 70.2, 7.0, 63.2),
  L(80, 72.0, 7.2, 64.8), L(82, 73.8, 7.4, 66.4), L(84, 75.6, 7.6, 68.0), L(86, 77.4, 7.7, 69.7),
  L(88, 79.2, 7.9, 71.3), L(90, 81.0, 8.1, 72.9), L(92, 82.8, 8.3, 74.5), L(94, 84.6, 8.5, 76.1),
  L(96, 86.4, 8.6, 77.8), L(98, 88.2, 8.8, 79.4), L(100, 90.0, 9.0, 81.0, "100+"),
];

export const FONTE_DA_TABELA_DA_BULA = `${FONTE_BULA_ACTILYSE}, p. 9`;

/**
 * ⚠️ D-PEND-23 com fonte nominal: contraindicação geral por alto risco de hemorragia, p. 4. Frase literal —
 * mora no ⓘ.
 */
export const LITERAL_HSA_BULA = {
  texto: "histórico, evidência ou suspeita de hemorragia intracraniana, incluindo hemorragia subaracnóidea",
  pagina: 4,
} as const;

/**
 * ⚠️ Onde a recomendação da diretriz e a bula divergem no cartão: a posição da bula, rotulada, ao lado.
 * Janela: p. 4 (contraindicação com início >4,5 h ou horário desconhecido) e p. 6 (não iniciar depois de 4,5 h).
 */
const JANELA_DA_BULA = "Bula brasileira: contraindicada com início há mais de 4,5 h ou horário desconhecido";

export const DIVERGENCIAS_DE_CARD: Readonly<Record<string, { readonly bula: string; readonly paginas: readonly number[] }>> = {
  ivt_inicio_desconhecido: { bula: JANELA_DA_BULA, paginas: [4, 6] },
  ivt_wakeup_ou_45_9: { bula: JANELA_DA_BULA, paginas: [4, 6] },
  ivt_lvo_sem_evt: { bula: JANELA_DA_BULA, paginas: [4, 6] },
};
