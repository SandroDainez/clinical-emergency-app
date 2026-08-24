/**
 * O ESCALONAMENTO — estado do atendimento, FORA DA ÁRVORE.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * POR QUE FORA
 *
 * Decisão do autor (2026-08-23), forma (b). A razão dele é o critério:
 * **misturar força de evidência clínica com regra de segurança/UX são duas
 * ontologias diferentes** — e por isso `regra_de_produto` **não entra** em
 * `ForcaDaAfirmacao`.
 *
 * A árvore é ACÍCLICA por construção e não tem memória: ela não sabe que o
 * médico já passou por aqui. Contar passagens é comportamento, e comportamento
 * mora no shell.
 *
 * ⚠️ E A NATUREZA DA REGRA, escrita pelo autor:
 *
 *   **A "segunda passagem" é uma trava de segurança de INTERFACE, não um
 *   critério clínico de guideline.**
 *
 * Ela não recebe grau de evidência porque não é afirmação sobre o paciente — é
 * afirmação sobre o app.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠️ A METADE QUE PROTEGE
 *
 *   **O estado de escalonamento não pode influenciar classificação clínica.**
 *
 * Ele interrompe o ciclo e mostra a saída — não muda gravidade, não muda
 * diagnóstico, não muda estágio KDIGO, não entra em critério nenhum. Um contador
 * de navegação que alimentasse gravidade classificaria o paciente pelo número de
 * toques que o médico deu.
 */

/** Os quatro campos, e nada mais. */
export type EstadoDeEscalonamento = {
  /** Quantas vezes "piorou" foi selecionado NESTE atendimento. */
  piorou: number;
  /** Ameaças já identificadas — para saber o que é reaparecimento. */
  ameacasIdentificadas: string[];
  /** Ameaças que já tinham sido abordadas e voltaram. */
  ameacasQueReapareceram: string[];
  /** Se a tela já foi mostrada — impede a terceira volta silenciosa. */
  jaDisparou: boolean;
};

export const ESTADO_INICIAL: EstadoDeEscalonamento = {
  piorou: 0,
  ameacasIdentificadas: [],
  ameacasQueReapareceram: [],
  jaDisparou: false,
};

export type MotivoDeEscalonamento =
  | "segunda_piora"
  | "ameaca_reapareceu"
  | "deterioracao_grave_na_primeira";

/**
 * Registra uma passagem. ⚠️ Função PURA: recebe o estado e devolve outro. Estado
 * mutável espalhado pela tela é o que faz um contador sobreviver ao paciente.
 */
export function registrarPassagem(
  estado: EstadoDeEscalonamento,
  evento:
    | { tipo: "piorou" }
    | { tipo: "ameaca"; id: string; jaAbordada: boolean }
    | { tipo: "deterioracao_grave" }
): EstadoDeEscalonamento {
  switch (evento.tipo) {
    case "piorou":
      return { ...estado, piorou: estado.piorou + 1 };
    case "ameaca": {
      const reapareceu = evento.jaAbordada && estado.ameacasIdentificadas.includes(evento.id);
      return {
        ...estado,
        ameacasIdentificadas: estado.ameacasIdentificadas.includes(evento.id)
          ? estado.ameacasIdentificadas
          : [...estado.ameacasIdentificadas, evento.id],
        ameacasQueReapareceram:
          reapareceu && !estado.ameacasQueReapareceram.includes(evento.id)
            ? [...estado.ameacasQueReapareceram, evento.id]
            : estado.ameacasQueReapareceram,
      };
    }
    case "deterioracao_grave":
      // ⚠️ Não conta passagem: dispara na PRIMEIRA, e é o terceiro gatilho.
      return { ...estado, ameacasIdentificadas: estado.ameacasIdentificadas };
  }
}

/**
 * ⚠️ O GATILHO NÃO É ANSIOSO, e isso é tão importante quanto ele existir.
 *
 * A **primeira** piora isolada NÃO dispara. Um app que escalona sempre é um app
 * que ninguém escuta — e aí ele deixa de escalonar quando importa.
 */
export function deveEscalonar(
  estado: EstadoDeEscalonamento,
  deterioracaoGraveNaPrimeira = false
): MotivoDeEscalonamento | null {
  if (deterioracaoGraveNaPrimeira) return "deterioracao_grave_na_primeira";
  if (estado.piorou >= 2) return "segunda_piora";
  if (estado.ameacasQueReapareceram.length > 0) return "ameaca_reapareceu";
  return null;
}

/**
 * ⚠️ TERCEIRA VOLTA SILENCIOSA É IMPOSSÍVEL: uma vez disparado, o estado guarda
 * que disparou, e o ciclo não recomeça calado. `jaDisparou` não impede a tela de
 * ser mostrada de novo — impede que o app siga em frente sem mostrá-la.
 */
export function marcarDisparado(estado: EstadoDeEscalonamento): EstadoDeEscalonamento {
  return { ...estado, jaDisparou: true };
}

// ── A TELA, com as duas realidades ──────────────────────────────────────────
//
// ⚠️ NENHUMA CONDUTA NOVA. As medidas clínicas vêm dos ramos que já existem — a
// tela APONTA para eles. Escrever tratamento aqui criaria uma segunda conduta ao
// lado da primeira, que é como as duas divergem.

export const ESCALONAR_TITULO = "Peça ajuda agora";

export const ESCALONAR_PORQUE =
  "⚠️ Este aviso é trava de segurança do app, não critério de diretriz: o atendimento passou duas vezes pelo mesmo ponto, ou uma ameaça que já tinha sido abordada voltou.";

export const ESCALONAR_COM_SUPORTE = [
  "Acionar médico sênior, equipe de emergência ou UTI.",
  "Solicitar avaliação nefrológica quando pertinente.",
  "Avaliar necessidade de terapia de substituição renal conforme os critérios clínicos do fluxo.",
];

export const ESCALONAR_SEM_SUPORTE = [
  "Manter a estabilização segundo o ramo específico da ameaça — o app conduz cada um deles.",
  "Acionar regulação ou transferência para serviço de maior capacidade.",
  "Buscar apoio remoto especializado quando disponível.",
  "Manter reavaliação contínua enquanto organiza a transferência ou o suporte.",
];
