/**
 * A INSTÂNCIA DE AFERIÇÃO — ⚠️ o que amarra as metades de uma mesma medida.
 *
 * ── O DEFEITO QUE ISTO FECHA (D-120, achado pelo autor em 2026-08-30) ──────
 *
 * `pas` e `pad` são **duas metades de UMA aferição**, e a trilha as guardava
 * como fatos independentes. Com duas medidas, ela tinha quatro números e
 * ⛔ **nenhuma indicação de quais dois foram medidos juntos** — e a leitura podia
 * compor uma PA que ⛔ **nunca existiu**: a sistólica das 14h com a diastólica das
 * 15h.
 *
 * ⚠️ Foi a `temporalidade`, declarada em 2026-08-29, que revelou o problema: ao
 * marcar `pas` e `pad` como `afericao`, ficou visível que ⛔ não havia a que
 * aferição elas pertenciam.
 *
 * ── ⛔ O QUE ISTO NÃO É ────────────────────────────────────────────────────
 *
 * ⛔ **⛔ Não é motor genérico de exames.** Decisão do autor: *"⛔ não crie engine
 * genérico ainda"*. Nasce dentro de `avc/`, servindo à pressão arterial, e
 * ⛔ **não sai daqui** enquanto Laboratório e Imagem ⛔ não o exigirem de verdade
 * (§9.1).
 *
 * ⛔ **⛔ Não é uma segunda estrutura de estado.** A trilha continua **plana e
 * append-only** (§3.1): a instância é uma **etiqueta** no fato, e o agrupamento
 * é feito na **leitura**.
 *
 * ── AS TRÊS OPERAÇÕES, E POR QUE ELAS ⛔ NÃO SE CONFUNDEM (§3.4, §7.16) ─────
 *
 * > *"Uma nova PA é nova aferição; corrigir um valor antigo é correção da mesma
 * > instância."* — autor, 2026-08-30
 *
 * | operação | instância | o que significa |
 * |---|---|---|
 * | **nova aferição** | instância **nova** | o paciente foi medido de novo; as duas valem |
 * | **correção** | **mesma** instância | aquele valor ⛔ nunca foi verdade |
 * | **completar** | **mesma** instância | a outra metade da medida que já começou |
 */

import type { EstadoAvc } from "./estado";
import type { FatoRegistrado } from "./tipos";

/**
 * O nome de uma instância — ⚠️ derivado do tipo e de um número que ⛔ só cresce.
 *
 * ⚠️⚠️ ⛔ NÃO USA RELÓGIO ⛔ NEM ALEATÓRIO. Um id com horário mudaria a cada leitura
 * em teste, e um aleatório tornaria a trilha irreprodutível. O contador vem da
 * própria trilha, que é a única fonte de verdade sobre quantas medidas houve.
 */
export function nomeDaInstancia(tipo: string, numero: number): string {
  return `${tipo}_${numero}`;
}

/** Todas as instâncias deste tipo já abertas, na ordem em que apareceram. */
export function instanciasDe(estado: EstadoAvc, tipo: string): readonly string[] {
  const vistas: string[] = [];
  for (const f of estado.fatos) {
    if (f.instancia?.startsWith(`${tipo}_`) && !vistas.includes(f.instancia)) {
      vistas.push(f.instancia);
    }
  }
  return vistas;
}

/**
 * A instância ABERTA deste tipo — aquela que novas metades completam.
 *
 * ⚠️ É sempre a **última aberta**, e ⛔ não a "mais recente por horário clínico":
 * um horário clínico pode ser desconhecido (**E-52**), e ordenar por ele
 * inventaria uma ordem que ninguém informou.
 */
export function instanciaAberta(estado: EstadoAvc, tipo: string): string | undefined {
  const todas = instanciasDe(estado, tipo);
  return todas.length > 0 ? todas[todas.length - 1] : undefined;
}

/**
 * A instância que o PRÓXIMO registro deve usar.
 *
 * ⚠️ Se há uma aberta, o registro **completa** aquela medida — é o caso de
 * informar a diastólica depois da sistólica. Se ⛔ não há, abre a primeira.
 */
export function instanciaParaRegistrar(estado: EstadoAvc, tipo: string): string {
  return instanciaAberta(estado, tipo) ?? nomeDaInstancia(tipo, 1);
}

/**
 * O nome da PRÓXIMA instância — ⚠️ o gesto explícito de *"nova medida"*.
 *
 * ⚠️⚠️ ELE PRECISA SER EXPLÍCITO. Sem um gesto nomeado, editar a sistólica depois
 * de registrar a medida seria ambíguo: correção do valor anterior ou medida
 * nova? A ambiguidade ⛔ não é de interface — ela muda o que a trilha afirma
 * sobre o paciente (§3.4).
 */
export function proximaInstancia(estado: EstadoAvc, tipo: string): string {
  return nomeDaInstancia(tipo, instanciasDe(estado, tipo).length + 1);
}

/** Os fatos de uma instância, na ordem de registro. */
export function fatosDaInstancia(estado: EstadoAvc, instancia: string): readonly FatoRegistrado[] {
  return estado.fatos.filter((f) => f.instancia === instancia);
}

/**
 * O valor atual de um campo DENTRO de uma instância.
 *
 * ⚠️ É o que permite ler *"a PA daquela medida"* em vez de *"a última sistólica
 * registrada"* — que é a leitura que compunha uma pressão inexistente.
 */
export function valorNaInstancia(
  estado: EstadoAvc,
  instancia: string,
  campo: string
): FatoRegistrado | undefined {
  const daInstancia = estado.fatos.filter((f) => f.instancia === instancia && f.campo === campo);
  return daInstancia.length > 0 ? daInstancia[daInstancia.length - 1] : undefined;
}
