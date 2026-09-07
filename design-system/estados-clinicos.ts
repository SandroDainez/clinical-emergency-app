/**
 * OS SETE ESTADOS — ⚠️ o vocabulário que **todo módulo** usa para dizer em que
 * pé está um dado clínico.
 *
 * ── ⚠️⚠️ POR QUE ELE EXISTE ────────────────────────────────────────────────
 *
 * ⛔ O símbolo estava escrito **à mão em seis arquivos**: `"✓" : "○"` aqui,
 * `"!" : "✓" : "·" : "○"` ali, um `SIMBOLO_DO_TOM` em cada superfície. ⚠️ Seis
 * cópias de um alfabeto ⛔ é como nasce a sétima tela dizendo ✓ onde as outras
 * dizem ○ — ⛔ e o médico aprende que o símbolo ⛔ não quer dizer ⛔ nada.
 *
 * ⚠️ Decisão do autor, 2026-09-06 (**C2**): sete estados, ⛔ e o mesmo conjunto
 * vale para SCA, TEP, sepse ⛔ e o que vier (**§47**).
 *
 * ── ⚠️⚠️ O SÉTIMO, ⛔ E ⛔ POR QUE ELE PRECISOU EXISTIR ─────────────────────
 *
 * ⛔ O briefing trazia seis. ⚠️ Com **PA 80/46** na tela ⛔ nenhum deles servia:
 * `favoravel` afirmaria uma normalidade que **⛔ nenhuma fonte transcrita
 * autoriza** — o corte de F-04 é pré-trombólise, ⛔ e ⛔ não define *"pressão
 * normal"* —, ⛔ e `ausente` apagaria uma medida que **existe**.
 *
 * ⚠️ `medido` diz ⛔ exatamente o que o app sabe: **há número, ⛔ e o protocolo
 * validado ⛔ não autoriza classificá-lo**. ⛔ Ele ⛔ não é um estado morno: ⛔ é a
 * recusa a inventar juízo (**E-31**, **E-23**).
 *
 * ── ⚠️ O QUE ESTE ARQUIVO ⛔ NÃO FAZ ────────────────────────────────────────
 *
 * ⛔ ⛔ Não decide **qual** estado um dado tem — ⛔ isso é do núcleo clínico de
 *    cada módulo, com as fontes dele.
 * ⛔ ⛔ Não conhece AVC, PA ⛔ nem glicemia.
 * ⛔ ⛔ Não pinta ⛔ nada sozinho: **o símbolo ⛔ nunca sai sem o rótulo**, porque
 *    cor ⛔ e forma sozinhas ⛔ não são leitura (**E-15**).
 */
import type { Tema } from "./theme";

export type EstadoClinico =
  | "favoravel"
  | "corrigivel"
  | "verificar"
  | "impede"
  | "andamento"
  | "ausente"
  | "medido";

export type DesenhoDoEstado = {
  /** ⚠️ ⛔ Uma marca de UM caractere — ⛔ e ⛔ ela ⛔ nunca depende de cor. */
  readonly simbolo: string;
  /**
   * ⚠️ O que ⛔ ela quer dizer, **em palavras**. ⛔ O símbolo sozinho ⛔ não é
   * legenda: quem chega no app pela primeira vez ⛔ não nasceu sabendo `·`.
   */
  readonly rotulo: string;
  /**
   * ⚠️ Que papel de cor o tema empresta. ⛔ `neutro` ⛔ não é falha de
   * declaração: é a recusa deliberada a colorir o que ⛔ não se julga.
   */
  readonly papel: "sucesso" | "atencao" | "acao" | "critico" | "neutro";
};

/**
 * ⚠️⚠️ A ORDEM É A DA URGÊNCIA — ⛔ e ⛔ ela ⛔ não é decorativa: quem lista
 * problemas ativos ordena por ela, ⛔ e o que impede vem antes do que falta.
 */
export const ESTADOS: Readonly<Record<EstadoClinico, DesenhoDoEstado>> = {
  /** ⚠️ ⛔ A fonte diz que este critério está atendido. ⛔ Afirmação, ⛔ e ⛔ não ausência de alerta. */
  favoravel: { simbolo: "✓", rotulo: "Favorável", papel: "sucesso" },
  /** ⚠️ Há alteração que a fonte manda corrigir — ⛔ e ⛔ ela é reversível. */
  corrigivel: { simbolo: "!", rotulo: "Corrigível", papel: "atencao" },
  /** ⚠️ **E-37**: falta perguntar. ⛔ ⛔ NÃO é o mesmo que respondido como ausente. */
  verificar: { simbolo: "?", rotulo: "Precisa verificar", papel: "acao" },
  /** ⚠️ Impede **a ação**, ⛔ e ⛔ nunca a navegação (**E-11**). */
  impede: { simbolo: "⛔", rotulo: "Impede", papel: "critico" },
  /** ⚠️ Alguém já está tratando isto. */
  andamento: { simbolo: "…", rotulo: "Em andamento", papel: "acao" },
  /** ⚠️ ⛔ Ninguém avaliou. ⛔ Ausência é **estado**, ⛔ e ⛔ nunca achado (**E-23**). */
  ausente: { simbolo: "—", rotulo: "Não avaliado", papel: "neutro" },
  /**
   * ⚠️⚠️ ⛔ HÁ NÚMERO, ⛔ E O PROTOCOLO ⛔ NÃO AUTORIZA CLASSIFICÁ-LO.
   *
   * ⛔ ⛔ Não é *"provavelmente normal"*, ⛔ não é *"sem alteração"* ⛔ e ⛔ não é
   * *"não avaliado"*. ⚠️ É o app mostrando a medida ⛔ e **⛔ se recusando a
   * emitir juízo que ⛔ nenhuma fonte sustenta**.
   */
  medido: { simbolo: "·", rotulo: "Medido", papel: "neutro" },
};

/** ⚠️ A ordem de urgência — ⛔ o que impede primeiro, o que ⛔ ninguém viu por último. */
export const ORDEM_DOS_ESTADOS: readonly EstadoClinico[] = [
  "impede",
  "corrigivel",
  "andamento",
  "verificar",
  "medido",
  "favoravel",
  "ausente",
];

/**
 * ⚠️ A cor do papel, no tema corrente. ⛔ Ela **acompanha** símbolo ⛔ e rótulo —
 * ⛔ e ⛔ nunca aparece sozinha (**E-15**).
 */
export function corDoEstado(tema: Tema, estado: EstadoClinico): string {
  switch (ESTADOS[estado].papel) {
    case "sucesso": return tema.cores.success;
    case "atencao": return tema.cores.warning;
    case "acao": return tema.cores.primary;
    case "critico": return tema.cores.critical;
    case "neutro": return tema.cores.textSecondary;
  }
}
