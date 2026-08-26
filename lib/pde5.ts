import type { TreeValues } from "../core/decision-tree/types";

/**
 * INIBIDOR DE PDE-5 E NITRATO — A JANELA, POR FÁRMACO.
 *
 * ── A REGRA ────────────────────────────────────────────────────────────────
 *
 * Nitrato é contraindicado com uso RECENTE de inibidor de PDE-5, e "recente"
 * tem valor diferente por fármaco (ACC/AHA 2025):
 *
 *     avanafila     < 12 h
 *     sildenafila   < 24 h
 *     vardenafila   < 24 h
 *     tadalafila    < 48 h   (meia-vida 17,5 h)
 *
 * A associação causa hipotensão refratária — e a população que usa estes
 * fármacos é a mesma que chega com dor torácica. PERGUNTE, não presuma:
 * ninguém informa espontaneamente.
 *
 * ── ⚠️ A MODELAGEM QUE O AUTOR CORRIGIU ANTES DE EU IMPLEMENTAR ────────────
 *
 * Eu havia proposto uma categoria `pde5_cronico` = "contraindicação PERMANENTE
 * enquanto o paciente estiver em uso". ESTÁ ERRADO, e o autor barrou:
 *
 *   "A ACC/AHA 2025 fala em evitar nitratos após uso recente. Ela não cria uma
 *    categoria separada de uso crônico = contraindicação permanente. A lógica
 *    deve continuar baseada em fármaco + horário da última dose."
 *
 * A diferença não é de rótulo. "Permanente" é uma inferência MINHA promovida a
 * regra — e uma vez escrita no app ela viraria fonte para quem lê. O que a
 * farmacologia diz é que a droga sai; o que o uso habitual muda é a
 * PROBABILIDADE de haver uma dose dentro da janela, não a existência da janela.
 *
 * Quem toma sildenafila 20 mg 3×/dia para hipertensão pulmonar quase sempre
 * terá tomado nas últimas 24 h — e é por isso que o app PERGUNTA a última dose
 * em vez de decidir por ele. Se a última dose foi há 30 h e o paciente parou o
 * fármaco, o nitrato deixa de estar bloqueado por esta via. A regra "para
 * sempre" negaria nitrato a esse paciente com base numa categoria inventada.
 *
 * ── O QUE NUNCA VIRA LIBERAÇÃO ─────────────────────────────────────────────
 *
 * ⚠️ "NÃO SEI QUAL" e "NÃO SEI QUANDO" BLOQUEIAM. Sem o fármaco, a janela
 * aplicável é desconhecida — e adotar a mais curta liberaria tadalafila às 13 h.
 * Sem o horário, não há o que comparar. Nos dois casos o app não demonstrou
 * segurança, e ausência de prova nunca é prova de ausência.
 *
 * Quando o fármaco é desconhecido mas o horário é conhecido, vale a JANELA MAIS
 * LONGA (48 h): passado esse tempo, nenhum dos quatro ainda está na janela — é
 * a única afirmação segura possível sem saber qual foi.
 */

/** Horas de bloqueio depois da última dose, por fármaco. ACC/AHA 2025. */
export const JANELA_PDE5_H = {
  avanafila: 12,
  sildenafila: 24,
  vardenafila: 24,
  tadalafila: 48,
} as const;

export type FarmacoPde5 = keyof typeof JANELA_PDE5_H;

/**
 * A janela usada quando o fármaco não é conhecido.
 *
 * A MAIS LONGA das quatro, e não uma média nem a mais curta: com fármaco
 * desconhecido, a única coisa que se pode afirmar com segurança é que depois de
 * 48 h nenhum deles continua na janela.
 */
export const JANELA_PDE5_DESCONHECIDA_H = Math.max(...Object.values(JANELA_PDE5_H));

// ⚠️ NÃO EXISTE `FONTE_PDE5` AQUI, E A AUSÊNCIA É DELIBERADA. Eu havia criado
// a constante e ela ficou sem consumidor — `test:lib-consumida` reprovou, com
// razão. Texto clínico que dorme numa lib é o que DIVERGE em silêncio da versão
// que a tela mostra.
//
// A fonte das janelas está declarada no bloco de documentação acima, cobrada
// por `test:pde5-janela` e atribuída na tela pelo rodapé do módulo
// ("Baseado em ACC/AHA/ACEP/NAEMSP/SCAI 2025"). Uma quarta redação da mesma
// atribuição não acrescentaria nada e teria de ser mantida em sincronia com as
// outras três.

export type EstadoPde5 =
  /** Ninguém perguntou ainda. */
  | "nao_perguntado"
  /** Não usou — o nitrato não está bloqueado por esta via. */
  | "sem_uso"
  /** Usou, e a última dose está DENTRO da janela do fármaco. */
  | "dentro_da_janela"
  /** Usou, e a última dose está FORA da janela. */
  | "fora_da_janela"
  /** Usou, mas falta o fármaco, o horário, ou os dois. */
  | "indeterminado";

export type LeituraPde5 = {
  estado: EstadoPde5;
  /** A janela aplicada, em horas. `null` quando não há como aplicar nenhuma. */
  janelaH: number | null;
  /** Horas desde a última dose, quando informadas. */
  desdeUltimaDoseH: number | null;
  /** Por que ficou indeterminado — para o veredito dizer o que falta. */
  falta: "farmaco" | "horario" | "farmaco_e_horario" | null;
};

function horas(bruto: string | undefined): number | null {
  if (bruto === undefined || bruto.trim() === "") return null;
  const n = Number(bruto);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** A janela de um fármaco. Desconhecido → a mais longa. */
export function janelaDe(farmaco: string | undefined): number {
  if (farmaco && farmaco in JANELA_PDE5_H) {
    return JANELA_PDE5_H[farmaco as FarmacoPde5];
  }
  return JANELA_PDE5_DESCONHECIDA_H;
}

/**
 * Lê o estado do PDE-5 a partir do que foi coletado. Função pura.
 *
 * `pde5_recente`  — "nao" | "sim" | "nao_sei" | undefined
 * `pde5_qual`     — chave de JANELA_PDE5_H, ou "nao_sei_qual"
 * `pde5_horas`    — horas desde a última dose
 */
export function lerPde5(v: TreeValues): LeituraPde5 {
  const vazio = { janelaH: null, desdeUltimaDoseH: null, falta: null } as const;

  if (v.pde5_recente === undefined) return { estado: "nao_perguntado", ...vazio };
  if (v.pde5_recente === "nao") return { estado: "sem_uso", ...vazio };

  // "nao_sei" no uso já é dúvida sobre o próprio uso: não há janela a aplicar.
  if (v.pde5_recente === "nao_sei") {
    return { estado: "indeterminado", janelaH: null, desdeUltimaDoseH: null, falta: "farmaco_e_horario" };
  }

  const desde = horas(v.pde5_horas);
  const sabeFarmaco = Boolean(v.pde5_qual) && v.pde5_qual !== "nao_sei_qual";

  if (desde === null) {
    return {
      estado: "indeterminado",
      janelaH: sabeFarmaco ? janelaDe(v.pde5_qual) : null,
      desdeUltimaDoseH: null,
      falta: sabeFarmaco ? "horario" : "farmaco_e_horario",
    };
  }

  // ⚠️ COM HORÁRIO E SEM FÁRMACO A DECISÃO AINDA É POSSÍVEL — mas só num
  // sentido. Passadas 48 h, nenhum dos quatro continua na janela, e isso se
  // afirma sem saber qual foi. Antes disso, não: liberar às 13 h por supor
  // avanafila seria escolher a hipótese conveniente.
  const janelaH = janelaDe(v.pde5_qual);
  if (!sabeFarmaco && desde < JANELA_PDE5_DESCONHECIDA_H) {
    return { estado: "indeterminado", janelaH, desdeUltimaDoseH: desde, falta: "farmaco" };
  }

  return {
    estado: desde < janelaH ? "dentro_da_janela" : "fora_da_janela",
    janelaH,
    desdeUltimaDoseH: desde,
    falta: null,
  };
}

/** Nome do fármaco para a tela. Literal, para o dicionário casar (D-19). */
export const ROTULO_PDE5: Record<string, string> = {
  sildenafila: "Sildenafila (Viagra, Revatio)",
  tadalafila: "Tadalafila (Cialis)",
  vardenafila: "Vardenafila (Levitra)",
  avanafila: "Avanafila (Spedra)",
  nao_sei_qual: "Não sei qual",
};
