/**
 * EIXOS REABERTOS COM A ÚLTIMA AVALIAÇÃO — decisão do autor, 2026-09-13 (11ª rodada).
 *
 * ⚠️ *"Reavaliações não sobrescrevem o basal"* vale para os eixos como para o NIHSS: o
 * médico que reavalia depois de «Paciente piorou» precisa comparar com o que havia.
 *
 * ⚠️ A leitura é a mesma derivação de `ameacasImediatas`, aplicada à trilha ATÉ o
 * evento de piora — ⛔ um fato novo depois dele ⛔ a muda. A hora é a do último fato do
 * bloco do eixo antes do evento. ⛔ Eixo sem fato diz «sem dados», ⛔ e ⛔ fica vazio.
 *
 * ⛔ Este módulo ⛔ lê a conclusão dos eixos: "reavaliação pendente" por eixo é da tela.
 */
import { GRUPOS_A } from "../conteudo/superficie-a";
import { ameacasImediatas, type AmeacaImediata } from "./ameacas-imediatas";
import { eventosDePiora } from "./deterioracao";
import type { EstadoAvc } from "./estado";

export type AvaliacaoAnterior = {
  readonly id: string;
  readonly estado: AmeacaImediata["estado"];
  readonly achado?: string;
  readonly valor?: string;
  readonly unidade?: string;
  readonly quando?: number;
  readonly semDados: boolean;
};

export function avaliacaoAntesDaPiora(estado: EstadoAvc): readonly AvaliacaoAnterior[] | undefined {
  const eventos = eventosDePiora(estado);
  if (eventos.length === 0) return undefined;
  const ultimo = eventos[eventos.length - 1];
  const corte = estado.fatos.findIndex((f) => f.id === ultimo.fatoId);
  const trilhaAntes = estado.fatos.slice(0, corte);
  const antes: EstadoAvc = { ...estado, fatos: trilhaAntes };
  return ameacasImediatas(antes).map((a) => {
    const grupo = GRUPOS_A.find((g) => g.campos.some((c) => c.id === a.campo));
    const campos = new Set((grupo?.campos ?? []).map((c) => c.id));
    const doEixo = trilhaAntes.filter((f) => campos.has(f.campo) && f.valor !== "nao_perguntado");
    const ultimoFato = doEixo[doEixo.length - 1];
    return {
      id: a.id,
      estado: a.estado,
      achado: a.achado,
      valor: a.valor,
      unidade: a.unidade,
      quando: ultimoFato === undefined ? undefined : ultimoFato.horaClinica ?? ultimoFato.horaRegistro,
      semDados: ultimoFato === undefined,
    };
  });
}
