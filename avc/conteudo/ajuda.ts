/**
 * «PRECISO DE AJUDA» — as cinco opções do PDF (T02, RQ-T02-05; decisão do autor,
 * 2026-09-13, 11ª rodada; fecha AC-10).
 *
 * ⚠️ CAMINHO, ⛔ E ⛔ NÃO CONDUTA: cada opção leva a uma superfície que JÁ existe, com
 * retorno ao ponto de origem. ⛔ Onde este módulo ⛔ tem conteúdo, o texto DIZ isso ⛔ e
 * permite registrar a conduta adotada fora do app — ⛔ sem sugerir substituto, ⛔ sem
 * número, ⛔ sem simular execução.
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
      "O conteúdo existente são os campos guiados de cada superfície, com a explicação no ⓘ, pendente de validação médica. Ele não substitui apoio presencial: se chamou ajuda, registre abaixo.",
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
      "Este módulo não tem conteúdo sobre medicamento indisponível e não sugere substituto. A capacidade do serviço e a transferência ficam em Destino. Registre abaixo a conduta adotada.",
    caminhos: [DESTINO],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: medicamento indisponível",
  },
  {
    id: "sem_equipamento",
    rotulo: "Não tenho o equipamento",
    texto:
      "Este módulo não tem conteúdo sobre equipamento indisponível e não sugere substituto. A capacidade do serviço e a transferência ficam em Destino. Registre abaixo a conduta adotada.",
    caminhos: [DESTINO],
    registraCondutaExterna: true,
    rotuloNaLinhaDoTempo: "Conduta externa registrada: equipamento indisponível",
  },
  {
    id: "nao_melhorou",
    rotulo: "Não melhorou",
    texto:
      "Este módulo não tem conteúdo sobre ausência de melhora. Os caminhos abaixo levam à reavaliação registrada; se houve piora, toque em «Paciente piorou». Registre abaixo a conduta adotada.",
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
