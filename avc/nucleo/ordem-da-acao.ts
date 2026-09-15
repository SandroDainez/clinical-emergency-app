/**
 * ORDEM CAUSAL DA SITUAÇÃO DE UMA AÇÃO — AC-13 reaberto, item 5 (autor, 2026-09-14; `docs/decisoes.md`, seção
 * "AC-13 reaberto", §5 e §9, opção B).
 *
 * ⚠️ Ordem de referência decidida pelo autor: indicado < decidido < prescrito < preparado < iniciado <
 * administrado/concluído. `cancelado` só antes de `iniciado`; `interrompido` só depois de `iniciado`.
 * ⚠️ O movimento contra essa ordem ⛔ é bloqueado: é tecnicamente permitido, exige confirmação e entra na trilha
 * como correção explícita, ⛔ como nova transição.
 *
 * ⛔ Fora do que o autor decidiu, nada é marcado: sair de `cancelado` para outro estado e trocar
 * administrado/concluído por interrompido (ou o inverso) ⛔ são tratados como violação aqui.
 *
 * ⛔ Função pura: ⛔ lê a trilha nem grava fato. Quem chama entrega os registros válidos anteriores.
 */
import type { EstadoDaAcaoRegistrado } from "../conteudo/superficie-e";

const POSICAO: Readonly<Partial<Record<EstadoDaAcaoRegistrado, number>>> = {
  indicado: 0,
  decidido: 1,
  prescrito: 2,
  preparado: 3,
  iniciado: 4,
  administrado_concluido: 5,
};

/** ⚠️ Estados que só existem depois do início: `interrompido` ocupa a posição de `iniciado` na comparação. */
const POSICAO_DE_INICIO = 4;
const DEPOIS_DO_INICIO: ReadonlySet<EstadoDaAcaoRegistrado> = new Set(["iniciado", "administrado_concluido", "interrompido"]);

function posicao(estado: EstadoDaAcaoRegistrado): number | undefined {
  return estado === "interrompido" ? POSICAO_DE_INICIO : POSICAO[estado];
}

/** ⚠️ Um registro com estado, ⛔ invalidado por correção. «Não sei» ⛔ entra: não é estado. */
export type RegistroValido = { readonly fatoId: string; readonly estado: EstadoDaAcaoRegistrado };

export type RegraDaOrdem = "retrocesso" | "cancelada_depois_do_inicio" | "interrompida_sem_inicio";

export type ViolacaoDaOrdem = {
  readonly regra: RegraDaOrdem;
  readonly novo: EstadoDaAcaoRegistrado;
  /** ⚠️ O registro anterior com que o novo estado conflita; ausente quando ⛔ há registro anterior. */
  readonly referencia?: RegistroValido;
};

export function violacaoDaOrdemCausal(
  anteriores: readonly RegistroValido[],
  novo: EstadoDaAcaoRegistrado
): ViolacaoDaOrdem | undefined {
  const doFim = [...anteriores].reverse();
  if (novo === "cancelado") {
    const iniciado = doFim.find((r) => DEPOIS_DO_INICIO.has(r.estado));
    return iniciado === undefined ? undefined : { regra: "cancelada_depois_do_inicio", novo, referencia: iniciado };
  }
  if (novo === "interrompido") {
    if (anteriores.some((r) => DEPOIS_DO_INICIO.has(r.estado))) return undefined;
    return { regra: "interrompida_sem_inicio", novo, referencia: doFim[0] };
  }
  const p = POSICAO[novo];
  if (p === undefined) return undefined;
  let referencia: RegistroValido | undefined;
  for (const r of doFim) {
    const q = posicao(r.estado);
    if (q !== undefined && q > p && (referencia === undefined || q > (posicao(referencia.estado) as number))) referencia = r;
  }
  /** ⚠️ Administrado/concluído depois de interrompido ⛔ é retrocesso: ⛔ entra nesta regra (posição 5 > 4). */
  return referencia === undefined ? undefined : { regra: "retrocesso", novo, referencia };
}
