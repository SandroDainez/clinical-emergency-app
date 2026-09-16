/**
 * ⚠️⚠️⚠️ ARTEFATO INTERNO DE ANTI-REGRESSÃO — ⛔ **⛔ NÃO É CONTEÚDO DE TELA.**
 *
 * ⛔ ⛔ Este arquivo guarda **formulações PROIBIDAS**: leituras antigas da glicemia no
 * AVC que, por anos, foram ensinadas como critério de exclusão da trombólise. ⚠️ Elas
 * estão aqui **⛔ exclusivamente para impedir regressão** — para que uma trava possa
 * medir que ⛔ nenhuma delas voltou a ser apresentada como verdade.
 *
 * ── ⚠️⚠️ ⛔ POR QUE ELE SAIU DE `avc/conteudo/` — autor, 2026-09-16 ─────────────
 *
 * ⛔ Enquanto morava junto do conteúdo clínico, estas frases eram varridas como texto
 * de tela ⛔ e exigiam tradução para o espanhol. ⚠️ Traduzir formulação proibida é o
 * oposto do que se quer: ⛔ dá a ela status de conteúdo disponível, ⛔ e conteúdo
 * disponível alguém um dia decide mostrar.
 *
 * ⚠️ A decisão do autor separou as duas naturezas: *«o sistema se lembra do erro; a
 * interface não o conhece como conteúdo disponível»*. ⛔ As chaves de tradução foram
 * APOSENTADAS por nome em `scripts/prova-sem-orfas-de-i18n.cjs`, ⛔ e este arquivo é
 * isento na `varredura-pt` — isenção que vale **⛔ só para ele**, ⛔ e ⛔ nunca para
 * um arquivo de conteúdo clínico.
 *
 * ── ⚠️⚠️ ⛔ REGRAS DESTE ARQUIVO ────────────────────────────────────────────────
 *
 * 1. ⛔ **⛔ NENHUM consumidor de UI.** ⛔ Se um componente importar daqui, a trava
 *    `prova-avc-glicemia.cjs` reprova: a tela ⛔ não pode conhecer estas frases.
 * 2. ⛔ **⛔ Nada aqui é verdade clínica.** A coluna `errado` é o que ⛔ NÃO se pode
 *    dizer; a coluna `correto` existe para que a proibição ⛔ não fique sem saída —
 *    ⛔ quem precisar do texto certo o encontra, em vez de reescrevê-lo à mão.
 * 3. ⚠️ O conteúdo clínico que substitui cada linha vive em
 *    `avc/conteudo/correcao-glicemica.ts` (`CORTES_GLICEMICOS`, `ALVOS_GLICEMICOS`,
 *    `TRATAMENTOS_GLICEMICOS`, `PERGUNTA_QUE_DECIDE`), com COR/LOE ⛔ e procedência.
 *
 * FONTE das correções: F-18 · AHA/ASA 2026, transcrita em
 * `protocols/fontes-verbatim/f18-correcao-glicemica-avc.md`.
 */

export type FormulacaoProibida = {
  /** ⛔ O que o app ⛔ NÃO pode dizer. */
  readonly errado: string;
  /** ⚠️ O que ficou no lugar — ⛔ para a proibição ⛔ não ser um beco sem saída. */
  readonly correto: string;
};

export const ERROS_A_EVITAR: readonly FormulacaoProibida[] = [
  {
    errado: "Glicemia abaixo de 50 é contraindicação absoluta",
    correto: "É disglicemia grave. Corrigir e reavaliar o déficit",
  },
  {
    errado: "Glicemia acima de 400 é contraindicação absoluta",
    correto:
      "É disglicemia grave. Déficit incapacitante que persiste após a correção mantém a indicação",
  },
  {
    errado: "Só trombolisar quando a glicemia estiver abaixo de 180",
    correto: "De 140 a 180 é alvo de manejo, e não pré-requisito de reperfusão",
  },
  {
    errado: "Dez unidades de insulina por via endovenosa para glicemia acima de 300",
    correto: "Insulinoterapia por protocolo dinâmico validado",
  },
  {
    errado: "Meta de 80 a 130",
    correto: "Não é recomendada para melhorar o desfecho do acidente vascular cerebral",
  },
];
