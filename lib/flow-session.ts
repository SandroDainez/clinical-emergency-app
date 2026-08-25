/**
 * Retomada de fluxo entre módulos.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * O problema, nas palavras de quem usa:
 *
 *   "estou em anafilaxia, vou para intubação em sequência rápida, depois não tem
 *    botão para voltar no ponto que eu estava de anafilaxia, se perde e tem que
 *    iniciar anafilaxia de novo"
 *
 * Consultar outro protocolo no meio de um atendimento é uso NORMAL — o próprio
 * app oferece os atalhos. Perder o progresso por causa disso pune exatamente o
 * comportamento que ele incentiva.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ## Por que não mexe no engine
 *
 * `history` e `values` são privados em `DecisionTreeEngine` e continuam privados.
 * Quem alimenta este módulo é a TELA, que já conhece cada nó por onde passou
 * (`step.id`) e cada valor que digitou (`handleSetValue`). Guardar aqui o que a
 * tela já sabe evita abrir a lógica clínica para acomodar uma necessidade de
 * navegação.
 *
 * ## Por que memória e não disco
 *
 * Um `Map` de escopo de módulo funciona igual em iOS, Android e web, sem
 * depender de AsyncStorage nem de sessionStorage (que não existe no nativo).
 * Efeito colateral desejável: fechar o app apaga tudo. Um protocolo pela metade
 * não deve ressuscitar no dia seguinte, com outro paciente na frente.
 *
 * ## Por que a retomada é uma ESCOLHA e não automática
 *
 * Retomar sozinho colocaria o médico no meio de um protocolo sem ele pedir — e
 * o passo 7 de anafilaxia do paciente anterior é conduta errada para o paciente
 * atual. A tela oferece, ele decide. Começar do início é sempre o caminho
 * seguro, e é o que acontece se ele ignorar a oferta.
 */

import type { EstadoSerializado } from "../core/decision-tree/types";
import type { EstadoDeEscalonamento } from "./escalonamento";

export type SessaoDeFluxo = {
  /** Nós percorridos, em ordem — o primeiro é a entrada da árvore. */
  caminho: string[];
  /** Valores digitados (peso, dose etc.), só os que a tela gravou. */
  valores: Record<string, string>;
  /** Títulos das etapas, para exibir "passo N · <título>" na oferta. */
  trilha: string[];
  /** `Date.now()` do momento em que a tela saiu de cena. */
  salvoEm: number;
  /**
   * ⚠️ O ESTADO DE ESCALONAMENTO MORA AQUI, e o lugar é a resposta à prova 6.
   *
   * *"Iniciar novo atendimento zera o estado anterior."* Estado que sobrevive ao
   * fim do atendimento significa **ameaça identificada no paciente A contando
   * para o paciente B** — e o contador dispararia escalonamento num paciente que
   * nunca piorou.
   *
   * ⚠️ NÃO FOI PRECISO INVENTAR "novo atendimento": o app já tem DUAS portas, e
   * as duas já apagam esta sessão inteira —
   *   · o botão "começar do início" (`descartarSessaoDeFluxo`);
   *   · a expiração de `VALIDADE_DA_SESSAO_MS`, cujo comentário já dizia a razão
   *     certa: *"meia hora depois a chance de ser outro paciente já é grande o
   *     bastante"*.
   *
   * Pendurar o contador em qualquer outro lugar teria criado um terceiro
   * conceito de "atendimento", divergente dos dois que já existem.
   */
  escalonamento?: EstadoDeEscalonamento;
  /**
   * ⚠️ OS MARCOS TEMPORAIS, COM O INSTANTE ORIGINAL (correção de 2026-08-25).
   *
   * A retomada reconstrói o fluxo por REPLAY, e o replay de um campo declarado
   * em `tree.marcos` faz o motor reancorar o relógio em `Date.now()` — o
   * instante da RETOMADA. Medido: paciente convulsionando há 12 min, médico
   * fora do módulo por 8 min, e a crise volta com 12 min de novo. Em estado
   * epiléptico isso atrasa o escalonamento terapêutico exatamente pelo tempo
   * que ele gastou consultando outro protocolo.
   *
   * Guardar os marcos aqui e recolocá-los DEPOIS do replay preserva o instante
   * real. Campo OPCIONAL: sessão sem ele continua abrindo pelo caminho de
   * sempre — o que se perde nesse caso é só a correção, nunca a retomada.
   */
  marcos?: Record<string, string>;
  /**
   * ⚠️ O CASO INTEIRO — e o que ele conserta (Passo A+B, 2026-08-25).
   *
   * Os campos acima nasceram para responder a UMA pergunta: "em que passo eu
   * estava?". Eles guardam caminho e valores, e a retomada os reconstrói por
   * REPLAY. Isso bastava enquanto o motor não tinha memória clínica.
   *
   * Agora tem — trilha de medições, ações executadas, decisões tomadas — e o
   * replay não só perde essas três coisas: ele FABRICA uma trilha falsa, com um
   * ponto por campo carimbado na hora da volta. O médico corrigiria uma PA de
   * 194/116 para 168/96, sairia para consultar outro protocolo, voltaria, e a
   * tela mostraria "168/96, aferido agora", sem o 194/116 e sem sinal de que
   * houve um impedimento corrigido. Pior que esquecer.
   *
   * ⚠️ OPCIONAL DE PROPÓSITO, E É O QUE TORNA A MIGRAÇÃO SEGURA: sessão salva
   * sem `estado` continua abrindo pelo replay de sempre. Nenhum dos 20 módulos
   * precisa mudar; o que muda é de onde a retomada lê, quando há de onde ler.
   */
  estado?: EstadoSerializado;
};

/**
 * Janela em que a oferta de retomar faz sentido.
 *
 * NÃO é um limiar clínico — é guarda de interface. Ler uma referência e voltar
 * leva minutos; meia hora depois a chance de ser outro paciente já é grande o
 * bastante para não oferecer nada e deixar o fluxo começar limpo.
 */
export const VALIDADE_DA_SESSAO_MS = 30 * 60 * 1000;

const sessoes = new Map<string, SessaoDeFluxo>();

/** Chamado quando a tela do módulo sai de cena. */
export function salvarSessaoDeFluxo(slug: string | undefined, sessao: SessaoDeFluxo): void {
  if (!slug) return;
  // Passo 1 é o início da árvore: não há progresso a preservar, e oferecer
  // "continuar do passo 1" seria ruído.
  if (sessao.caminho.length <= 1) {
    sessoes.delete(slug);
    return;
  }
  sessoes.set(slug, sessao);
}

/** Devolve a sessão se existir e ainda estar dentro da validade. */
export function lerSessaoDeFluxo(
  slug: string | undefined,
  agora: number
): SessaoDeFluxo | undefined {
  if (!slug) return undefined;
  const sessao = sessoes.get(slug);
  if (!sessao) return undefined;
  if (agora - sessao.salvoEm > VALIDADE_DA_SESSAO_MS) {
    sessoes.delete(slug);
    return undefined;
  }
  return sessao;
}

/** Some com a sessão — usado ao retomar, ao reiniciar e ao concluir o fluxo. */
export function descartarSessaoDeFluxo(slug: string | undefined): void {
  if (!slug) return;
  sessoes.delete(slug);
}

