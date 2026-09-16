/**
 * «PRECISO DE AJUDA» — as cinco opções do PDF (T02, RQ-T02-05; decisão do autor,
 * 2026-09-13, 11ª rodada; fecha AC-10).
 *
 * ⚠️ CAMINHO, ⛔ E ⛔ NÃO CONDUTA: cada opção leva a uma superfície que JÁ existe, com
 * retorno ao ponto de origem. ⛔ Sem sugerir substituto, ⛔ sem número, ⛔ sem simular
 * execução.
 *
 * ⚠️⚠️ HIERARQUIA (autor, 2026-09-16) — ⛔ E ⛔ ISTO ⛔ É ESTILO. ⛔ Estes textos abriam
 * ANUNCIANDO o que o app ⛔ sabe (*«Este módulo não tem conteúdo sobre…»*), ⛔ e o médico
 * caía numa tela de ANOTAÇÃO em vez de uma tela de AÇÃO. ⚠️ Na primeira dobra vai só o
 * que o app consegue fazer agora; a limitação, quando cabe, vira linha curta ⛔ e ⛔ não
 * manchete. ⚠️ O registro da conduta externa CONTINUA — atrás de um toque secundário,
 * ⛔ e auditável como sempre (esconder o campo ⛔ muda regra clínica ⛔ nenhuma).
 *
 * ⚠️ «Paciente piorou» ⛔ tem painel: chama o mecanismo global existente.
 */
import type { SuperficieId } from "../nucleo/tipos";

export type CaminhoDeAjuda = {
  readonly superficie: SuperficieId;
  readonly rotulo: string;
};

export type OpcaoDeAjuda = {
  readonly id: string;
  readonly rotulo: string;
  readonly texto?: string;
  readonly caminhos: readonly CaminhoDeAjuda[];
  readonly registraCondutaExterna: boolean;
  /** ⚠️ Rótulo da conduta externa na linha do tempo. */
  readonly rotuloNaLinhaDoTempo?: string;
  readonly abrePiora?: true;
};

const DESTINO: CaminhoDeAjuda = { superficie: "destino", rotulo: "Abrir Destino: capacidade do serviço e transferência" };

export const OPCOES_DE_AJUDA: readonly OpcaoDeAjuda[] = [
  {
    id: "nao_sei_avaliar",
    rotulo: "Não sei avaliar",
    texto:
      "Os campos guiados de cada superfície indicam o que avaliar, com a explicação no ⓘ, pendente de validação médica. Não substituem apoio presencial.",
    caminhos: [
      { superficie: "estabilizacao", rotulo: "Abrir a Estabilização (ABCDE)" },
      { superficie: "neurologico", rotulo: "Abrir o exame neurológico (NIHSS)" },
    ],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: não sei avaliar",
  },
  {
    id: "sem_medicamento",
    rotulo: "Não tenho o medicamento",
    texto:
      "A capacidade do serviço e a transferência ficam em Destino. O app não sugere substituto.",
    caminhos: [DESTINO],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: medicamento indisponível",
  },
  {
    id: "sem_equipamento",
    rotulo: "Não tenho o equipamento",
    texto:
      "A capacidade do serviço e a transferência ficam em Destino. O app não sugere substituto.",
    caminhos: [DESTINO],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: equipamento indisponível",
  },
  {
    id: "nao_melhorou",
    rotulo: "Não melhorou",
    texto:
      "Os caminhos abaixo levam à reavaliação registrada. Se houve piora, toque em «Paciente piorou».",
    caminhos: [
      { superficie: "neurologico", rotulo: "Abrir o exame neurológico (NIHSS)" },
      { superficie: "estabilizacao", rotulo: "Abrir a Estabilização (ABCDE)" },
    ],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: não melhorou",
  },
  {
    id: "paciente_piorou",
    rotulo: "Paciente piorou",
    caminhos: [],
    registraCondutaExterna: false,
    abrePiora: true,
  },
];

export function opcaoDeAjuda(id: string): OpcaoDeAjuda | undefined {
  return OPCOES_DE_AJUDA.find((o) => o.id === id);
}
