/**
 * ORDEM CAUSAL DA SITUAÇÃO DE UMA AÇÃO — AC-13 reaberto, item 5 (autor, 2026-09-14; `docs/decisoes.md`, seção
 * "AC-13 reaberto", §5, §9 e §10).
 *
 * ⚠️ Ordem de referência decidida pelo autor: indicado < decidido < prescrito < preparado < iniciado <
 * administrado/concluído. `cancelado` só antes de `iniciado`; `interrompido` só depois de `iniciado`.
 * ⚠️ `cancelado`, `interrompido` e `administrado/concluído` são estados terminais distintos (§10): sair de um deles
 * para outro estado só vale como correção ou reabertura explícita.
 * ⚠️ O movimento contra essa ordem não é bloqueado: é tecnicamente permitido, exige confirmação e entra na trilha
 * como correção explícita, e não como nova transição.
 *
 * Função pura: não lê a trilha e não grava fato. Quem chama entrega os registros válidos anteriores.
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
const TERMINAIS: ReadonlySet<EstadoDaAcaoRegistrado> = new Set(["cancelado", "interrompido", "administrado_concluido"]);

function posicao(estado: EstadoDaAcaoRegistrado): number | undefined {
  return estado === "interrompido" ? POSICAO_DE_INICIO : POSICAO[estado];
}

/** ⚠️ Um registro com estado e sem invalidação por correção. «Não sei» não entra: não é estado. */
export type RegistroValido = {
  readonly fatoId: string;
  readonly estado: EstadoDaAcaoRegistrado;
  /** ⚠️ Um registro posterior foi gravado como correção explícita deste: o terminal foi reaberto. */
  readonly reaberto?: boolean;
};

export type RegraDaOrdem = "retrocesso" | "cancelada_depois_do_inicio" | "interrompida_sem_inicio" | "saida_de_estado_terminal";

export type ViolacaoDaOrdem = {
  readonly regra: RegraDaOrdem;
  readonly novo: EstadoDaAcaoRegistrado;
  /** ⚠️ O registro anterior com que o novo estado conflita; ausente quando não há registro anterior. */
  readonly referencia?: RegistroValido;
};

export function violacaoDaOrdemCausal(
  anteriores: readonly RegistroValido[],
  novo: EstadoDaAcaoRegistrado
): ViolacaoDaOrdem | undefined {
  const doFim = [...anteriores].reverse();
  if (novo === "cancelado") {
    const iniciado = doFim.find((r) => DEPOIS_DO_INICIO.has(r.estado));
    if (iniciado !== undefined) return { regra: "cancelada_depois_do_inicio", novo, referencia: iniciado };
  } else if (novo === "interrompido") {
    if (!anteriores.some((r) => DEPOIS_DO_INICIO.has(r.estado))) {
      return { regra: "interrompida_sem_inicio", novo, referencia: doFim[0] };
    }
  } else {
    const p = POSICAO[novo];
    let referencia: RegistroValido | undefined;
    if (p !== undefined) {
      for (const r of doFim) {
        const q = posicao(r.estado);
        if (q !== undefined && q > p && (referencia === undefined || q > (posicao(referencia.estado) as number))) referencia = r;
      }
    }
    if (referencia !== undefined) return { regra: "retrocesso", novo, referencia };
  }
  /**
   * ⚠️ §10: sair de um estado terminal para outro estado. O terminal já reaberto por correção explícita não conta
   * mais; repetir o mesmo terminal não é saída (a repetição idêntica é tratada pela idempotência, item 6).
   */
  const terminal = doFim.find((r) => TERMINAIS.has(r.estado) && r.reaberto !== true);
  if (terminal !== undefined && terminal.estado !== novo) return { regra: "saida_de_estado_terminal", novo, referencia: terminal };
  return undefined;
}
