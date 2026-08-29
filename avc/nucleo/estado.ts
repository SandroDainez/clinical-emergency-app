/**
 * Q-02 · O ESTADO DO ATENDIMENTO DE AVC — isolado do legado.
 *
 * ⛔ Não importa `core/decision-tree`, `lib/flow-session` nem qualquer parte do
 * LEGACY_ACLS_RUNTIME (D-107). ⛔ Não tem "nó atual", não tem cursor, não tem
 * caminho percorrido: **não existe posição** (§5.9).
 *
 * ⚠️ ESQUELETO. Aqui está a FORMA do estado — a medicina entra depois. Nenhuma
 * regra clínica, nenhum corte, nenhuma dose.
 */

import type { Instante, Relogio } from "./relogio";
import { minutosDesde } from "./relogio";
import type { FatoRegistrado, Pendencia, RelogioClinicoId, SuperficieId } from "./tipos";

/**
 * A trilha é APPEND-ONLY (§3.1). Registrar acrescenta; ⛔ nunca substitui.
 * É por isso que `fatos` é uma lista e não um mapa.
 */
export type EstadoAvc = {
  readonly abertoEm: Instante;
  readonly fatos: readonly FatoRegistrado[];
  readonly relogiosClinicos: Readonly<Partial<Record<RelogioClinicoId, Instante>>>;
  /** Conveniência de interface, ⛔ NUNCA verdade clínica (§5.9-4). */
  readonly superficieVista: SuperficieId;
};

export function abrirAtendimento(relogio: Relogio): EstadoAvc {
  const agora = relogio.agora();
  return {
    abertoEm: agora,
    fatos: [],
    // ⚠️ O t₀ operacional é a chegada (§0.1) e nasce com o atendimento.
    // ⛔ Ele NÃO substitui nenhum relógio clínico (E-21).
    relogiosClinicos: { t0_operacional: agora },
    superficieVista: "estabilizacao",
  };
}

/**
 * Acrescenta um fato. ⚠️ A hora de registro vem do relógio, ⛔ nunca do chamador
 * — é o que impede a trilha de ser reescrita por quem a alimenta (§3.2).
 */
export function registrarFato(
  estado: EstadoAvc,
  fato: Omit<FatoRegistrado, "horaRegistro">,
  relogio: Relogio
): EstadoAvc {
  return { ...estado, fatos: [...estado.fatos, { ...fato, horaRegistro: relogio.agora() }] };
}

/**
 * O último valor conhecido de um campo.
 *
 * ⚠️ "Último" é por ordem de REGISTRO, e a lista inteira permanece — quem quiser
 * a evolução lê `fatos`. É a diferença entre estado atual e trilha (§3.1).
 */
export function valorAtual(estado: EstadoAvc, campo: string): FatoRegistrado | undefined {
  for (let i = estado.fatos.length - 1; i >= 0; i -= 1) {
    if (estado.fatos[i].campo === campo) return estado.fatos[i];
  }
  return undefined;
}

/**
 * CORRIGIR um registro — ⛔ operação distinta de medir de novo (§3.4, R-03).
 *
 * ⚠️ Corrigir **exige motivo**; medir de novo, não. E ⛔ nada é apagado: o valor
 * errado permanece na trilha, marcado, porque apagá-lo esconderia que houve erro.
 */
export function corrigirFato(
  estado: EstadoAvc,
  fato: Omit<FatoRegistrado, "horaRegistro" | "tipo"> & { motivo: string },
  relogio: Relogio
): EstadoAvc {
  return {
    ...estado,
    fatos: [...estado.fatos, { ...fato, tipo: "correcao", horaRegistro: relogio.agora() }],
  };
}

/**
 * DESFAZER um registro — ⚠️ a quarta operação de §7.16, e a que faltava.
 *
 * ── O DEFEITO QUE ISTO FECHA (relato do autor, 2026-08-28) ─────────────────
 *
 * *"Cliquei em sem informação e não consigo desmarcar isso"* · *"os outros
 * botões de deslizar... se tento voltar ao zero não volta, nenhum deles"*.
 *
 * Os dois são o mesmo defeito: **depois do primeiro toque, não existia como
 * DESINFORMAR um campo**. A barra voltava ao mínimo e o campo dizia "30 kg" —
 * um peso que ninguém mediu, que ⛔ não é ausência, e que alimentaria dose três
 * telas adiante. O botão de desconhecido, uma vez tocado, ficava tocado.
 *
 * ⚠️⚠️ DESFAZER ⛔ NÃO É APAGAR. A trilha é append-only (§3.1): isto ACRESCENTA
 * um registro de **correção** — o valor anterior fica lá, marcado, porque ele
 * existiu e alguém precisa poder ver que existiu. O que muda é o valor ATUAL,
 * que volta a ser `nao_perguntado`.
 *
 * ⚠️ E é `correcao`, ⛔ não `medida`: o médico está dizendo que aquele registro
 * ⛔ nunca deveria ter existido, e ⛔ não que o paciente mudou (§3.4). Tratá-lo
 * como medida inventaria evolução clínica onde houve engano de toque.
 */
export function desfazerRegistro(
  estado: EstadoAvc,
  campo: string,
  relogio: Relogio,
  motivo = "registro desfeito pelo médico"
): EstadoAvc {
  return corrigirFato(estado, { campo, valor: "nao_perguntado", motivo }, relogio);
}

/**
 * Os registros de um campo, em ordem. ⚠️ A trilha inteira, ⛔ não só o último —
 * é o que separa "a PA está em 168/96" de "a PA sempre esteve em 168/96".
 */
export function historicoDe(estado: EstadoAvc, campo: string): readonly FatoRegistrado[] {
  return estado.fatos.filter((f) => f.campo === campo);
}

/** Define um relógio clínico. ⛔ Um marco nunca sobrescreve outro (E-36). */
export function definirRelogioClinico(
  estado: EstadoAvc,
  qual: RelogioClinicoId,
  instante: Instante
): EstadoAvc {
  return { ...estado, relogiosClinicos: { ...estado.relogiosClinicos, [qual]: instante } };
}

/**
 * Minutos decorridos desde um marco — **derivado, nunca gravado** (§4.3).
 *
 * ⚠️ É o único valor do módulo que muda sem ninguém tocar em nada. Devolve
 * `undefined` quando o marco é desconhecido: ⛔ incerteza não vira zero (E-02).
 */
export function decorridoEmMinutos(
  estado: EstadoAvc,
  qual: RelogioClinicoId,
  relogio: Relogio
): number | undefined {
  return minutosDesde(estado.relogiosClinicos[qual], relogio);
}

/** Troca a superfície vista. ⛔ Não altera nada clínico (E-20). */
export function verSuperficie(estado: EstadoAvc, superficie: SuperficieId): EstadoAvc {
  return { ...estado, superficieVista: superficie };
}

/**
 * Pendências abertas — **derivadas a cada leitura**, ⛔ nunca guardadas (§4.3).
 *
 * ⚠️ ESQUELETO: por ora deriva apenas do que o conteúdo declara como exigido e
 * ainda não foi registrado. A regra clínica entra depois.
 */
export function pendenciasAbertas(
  estado: EstadoAvc,
  exigidos: readonly Pendencia[]
): readonly Pendencia[] {
  return exigidos.filter((p) => {
    /**
     * ⚠️ ⛔ SEM PISO SILENCIOSO. Uma pendência sem `campo` declarado nunca
     * encontraria valor nenhum e ficaria aberta PARA SEMPRE — que é exatamente
     * o defeito medido em 2026-08-28, agora reaparecendo por omissão em vez de
     * por nome trocado. Erro de programação grita; ⛔ não vira muro clínico.
     */
    if (!p.campo) throw new Error(`pendenciasAbertas: pendência "${p.id}" sem campo declarado`);
    /**
     * ⚠️⚠️ `nao_perguntado` REABRE a pendência, e isso ⛔ não é detalhe.
     *
     * Desfazer um registro devolve o campo ao estado de não respondido — se a
     * pendência continuasse fechada, o médico teria desfeito a resposta e o
     * app continuaria dizendo que aquilo estava resolvido. Seria a pendência
     * mentindo pelo lado que ninguém confere: o lado que diz "está pronto".
     */
    const atual = valorAtual(estado, p.campo);
    return atual === undefined || atual.valor === "nao_perguntado";
  });
}
